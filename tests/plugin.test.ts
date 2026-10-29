import { afterEach, describe, expect, it, vi } from "vitest"
import plugin from "../src/index"
import { Document } from "../src/document"

const cleanups: Array<() => void> = []
afterEach(() => { cleanups.splice(0).forEach((cleanup) => cleanup()) })

async function serverFixture() {
  const data = new Map<string, unknown>()
  let handlers!: Record<string, (input: Record<string, unknown>, context?: unknown) => Promise<unknown>>
  let messageID = "msg_first"
  let notify!: (value: unknown) => void
  let next = new Promise<unknown>((resolve) => { notify = resolve })
  const generate = vi.fn(async () => ({ text: "# Session\n\n## Objective\nBuild a feature." }))
  const emit = vi.fn(async () => {})
  const ctx = {
    location: { directory: "/workspace" },
    storage: {
      get: async (key: string) => data.get(key),
      set: async (key: string, value: unknown) => { data.set(key, value) },
      scan: async () => ({ entries: [], next: undefined }),
    },
    rpc: { register: async (_: unknown, registered: typeof handlers) => {
      handlers = registered
      return { events: { emit } }
    } },
    session: {
      get: async ({ sessionID }: { sessionID: string }) => ({ location: { directory: sessionID === "ses_other" ? "/other" : "/workspace" } }),
      context: async () => [{ id: messageID, type: "assistant", time: { completed: 1 }, finish: "stop" }],
      generate,
    },
    event: {
      subscribe: ({ signal }: { signal: AbortSignal }) => {
        signal.addEventListener("abort", () => notify(null), { once: true })
        return { async *[Symbol.asyncIterator]() {
          while (!signal.aborted) {
            const event = await next
            next = new Promise<unknown>((resolve) => { notify = resolve })
            if (!event || signal.aborted) return
            yield event
          }
        } }
      },
    },
  }
  const cleanup = await plugin.setup(ctx as never)
  if (cleanup) cleanups.push(() => { void cleanup() })
  return {
    handlers, generate, emit,
    async idle(id: string) {
      messageID = id
      notify({ type: "session.status", location: { directory: "/workspace" }, data: { sessionID: "ses_a", status: { type: "idle" } } })
      await Promise.resolve()
    },
  }
}

describe("server plugin integration", () => {
  it("creates a session document, updates after idle, and does not recurse", async () => {
    const server = await serverFixture()
    await server.handlers.configure({ enabled: true })
    await server.handlers.create({ sessionID: "ses_a" })
    await vi.waitFor(() => expect(server.generate).toHaveBeenCalledTimes(1))
    await vi.waitFor(async () => expect(Document.parse(await server.handlers.get({ sessionID: "ses_a" })).source).toBe("automatic"))
    await server.idle("msg_first")
    await server.idle("msg_second")
    await vi.waitFor(() => expect(server.generate).toHaveBeenCalledTimes(2))
    await vi.waitFor(async () => expect(Document.parse(await server.handlers.get({ sessionID: "ses_a" })).lastTurn).toBe("msg_second"))
    expect(server.emit).toHaveBeenCalledWith("changed", { sessionID: "ses_a" })
  })

  it("rejects requests routed to a different workspace", async () => {
    const server = await serverFixture()
    await expect(server.handlers.create({ sessionID: "ses_other" })).rejects.toThrow("different workspace")
    expect(server.generate).not.toHaveBeenCalled()
  })

  it("does not generate before consent or after global disable, but keeps documents", async () => {
    const server = await serverFixture()
    await server.handlers.create({ sessionID: "ses_a" })
    await server.idle("msg_first")
    expect(server.generate).not.toHaveBeenCalled()
    await server.handlers.configure({ enabled: true })
    await server.idle("msg_second")
    await vi.waitFor(() => expect(server.generate).toHaveBeenCalledTimes(1))
    await vi.waitFor(async () => expect(Document.parse(await server.handlers.get({ sessionID: "ses_a" })).source).toBe("automatic"))
    await server.handlers.configure({ enabled: false })
    await server.idle("msg_third")
    expect(server.generate).toHaveBeenCalledTimes(1)
    expect(await server.handlers.get({ sessionID: "ses_a" })).not.toBeNull()
  })
})
