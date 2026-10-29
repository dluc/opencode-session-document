import { z } from "zod"

export const MAX_MARKDOWN = 100_000
export const SessionID = z.string().regex(/^ses[a-zA-Z0-9_-]+$/).max(200)
export const Document = z.object({
  sessionID: SessionID,
  markdown: z.string().max(MAX_MARKDOWN),
  revision: z.number().int().nonnegative(),
  automatic: z.boolean(),
  updatedAt: z.number(),
  source: z.enum(["manual", "automatic", "initial"]),
  lastTurn: z.string().optional(),
  error: z.string().optional(),
})
export type SessionDocument = z.infer<typeof Document>

export const INITIAL_MARKDOWN = `# Session document

## Objective
Not established yet.

## Approach
Not established yet.

## Decisions
None recorded yet.

## Progress
No completed work recorded yet.

## Next steps & blockers
None recorded yet.
`

export interface Storage {
  get(key: string): Promise<unknown>
  set(key: string, value: SessionDocument): Promise<void>
}

export class RevisionConflict extends Error {
  constructor(readonly current: SessionDocument) {
    super("The document changed. Your draft has not been overwritten; compare it with the latest revision.")
  }
}

/** Serializes read-modify-write operations, but never holds a lock during generation. */
export class Documents {
  private locks = new Map<string, Promise<unknown>>()
  constructor(private storage: Storage) {}

  async get(sessionID: string): Promise<SessionDocument | null> {
    SessionID.parse(sessionID)
    const stored = await this.storage.get(`documents/${sessionID}`)
    return stored === undefined ? null : Document.parse(stored)
  }

  async change(
    sessionID: string,
    update: (current: SessionDocument | null) => SessionDocument,
  ): Promise<SessionDocument> {
    SessionID.parse(sessionID)
    const previous = this.locks.get(sessionID) ?? Promise.resolve()
    const next = previous.catch(() => {}).then(async () => {
      const document = Document.parse(update(await this.get(sessionID)))
      // Optional Zod fields may be explicitly undefined, but OpenCode's RPC
      // response encoder requires JSON values. Return the same JSON-safe shape
      // we store, rather than reporting a failed save after it was persisted.
      for (const key of ["lastTurn", "error"] as const) {
        if (document[key] === undefined) delete document[key]
      }
      await this.storage.set(`documents/${sessionID}`, document)
      return document
    })
    this.locks.set(sessionID, next)
    try {
      return await next
    } finally {
      if (this.locks.get(sessionID) === next) this.locks.delete(sessionID)
    }
  }

  create(sessionID: string) {
    return this.change(sessionID, (current) => current ?? {
      sessionID, markdown: INITIAL_MARKDOWN, revision: 1,
      automatic: true, source: "initial", updatedAt: Date.now(),
    })
  }

  save(sessionID: string, revision: number, markdown: string, automatic: boolean) {
    return this.change(sessionID, (current) => {
      if (!current) throw new Error("Create the document first.")
      if (current.revision !== revision) throw new RevisionConflict(current)
      return {
        ...current, markdown, automatic, revision: revision + 1,
        updatedAt: Date.now(), source: "manual", error: undefined,
      }
    })
  }
}
