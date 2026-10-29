import { Plugin } from "@opencode/plugin"
import { Documents, RevisionConflict } from "./document"
import { SessionDocuments } from "./rpc"
import { Updater } from "./updater"
import { AutomationSettings } from "./preferences"

export default Plugin.define({
  id: "session-document",
  async setup(ctx) {
    const controller = new AbortController()
    const settings = new AutomationSettings(ctx.storage)
    const documents = new Documents({
      get: (key) => ctx.storage.get(key),
      // JSON serialization removes optional undefined fields before persistence.
      set: (key, value) => ctx.storage.set(key, JSON.parse(JSON.stringify(value))),
    })
    const log = (event: string, sessionID?: string) =>
      console.info(JSON.stringify({ plugin: "session-document", event, sessionID }))

    const assertLocation = async (sessionID: string) => {
      const session = await ctx.session.get({ sessionID })
      if (session.location.directory !== ctx.location.directory) {
        throw new Error("This session belongs to a different workspace location.")
      }
    }

    const updater = new Updater(
      documents,
      async (sessionID) => {
        await assertLocation(sessionID)
        const messages = await ctx.session.context({ sessionID })
        const latest = messages.filter((message) => message.type === "user" || message.type === "assistant").at(-1)
        if (latest?.type !== "assistant" || !latest.time.completed || latest.finish !== "stop" || latest.error) return null
        return { id: latest.id }
      },
      async (sessionID, prompt) => {
        const result = await ctx.session.generate({ sessionID, prompt }, { signal: controller.signal })
        return result.text
      },
      async (sessionID) => { await rpc.events.emit("changed", { sessionID }) },
      log,
      async () => {
        const preferences = await settings.get()
        return preferences.enabled ? preferences.revision : false
      },
    )

    const rpc = await ctx.rpc.register(SessionDocuments, {
      preferences: async () => settings.get(),
      configure: async ({ enabled }) => {
        const preferences = await settings.set(enabled)
        await rpc.events.emit("preferencesChanged", {})
        return preferences
      },
      get: async ({ sessionID }) => {
        await assertLocation(sessionID)
        return documents.get(sessionID)
      },
      create: async ({ sessionID }) => {
        await assertLocation(sessionID)
        const document = await documents.create(sessionID)
        await rpc.events.emit("changed", { sessionID })
        void updater.request(sessionID).catch(() => log("update.unhandled_failure", sessionID))
        return document
      },
      save: async ({ sessionID, revision, markdown, automatic }, context) => {
        await assertLocation(sessionID)
        try {
          const document = await documents.save(sessionID, revision, markdown, automatic)
          await rpc.events.emit("changed", { sessionID })
          return document
        } catch (error) {
          if (error instanceof RevisionConflict) return context.error("conflict", error.message, error.current)
          throw error
        }
      },
      refresh: async ({ sessionID }) => {
        await assertLocation(sessionID)
        // Clear deduplication to permit an explicit retry of the current turn.
        await documents.change(sessionID, (current) => {
          if (!current) throw new Error("Create the document first.")
          return { ...current, lastTurn: undefined, revision: current.revision + 1 }
        })
        await rpc.events.emit("changed", { sessionID })
        await updater.request(sessionID)
        return null
      },
    })

    // Events are server-wide: only this location's existing documents are eligible.
    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({ types: ["session.status"], signal: controller.signal })) {
          if (event.data.status.type !== "idle") continue
          if (event.location?.directory && event.location.directory !== ctx.location.directory) continue
          void updater.request(event.data.sessionID).catch(() => log("update.unhandled_failure", event.data.sessionID))
        }
      } catch {
        if (!controller.signal.aborted) log("event_stream.failed")
      }
    })()

    // Recover missed live events and unfinished updates after reload. Process pages
    // and sessions serially to avoid a burst of model requests at startup.
    let reconciling = false
    const reconcile = async () => {
      if (reconciling || controller.signal.aborted) return
      reconciling = true
      try {
        let after: string | undefined
        do {
          const page = await ctx.storage.scan({ prefix: "documents/", limit: 50, after })
          for (const entry of page.entries) {
            if (controller.signal.aborted) return
            const sessionID = entry.key.slice("documents/".length)
            // Documents may belong to another active location of the same plugin.
            try { await assertLocation(sessionID) } catch { continue }
            await updater.request(sessionID)
          }
          after = page.next
        } while (after && !controller.signal.aborted)
      } catch { log("reconcile.failed") }
      finally { reconciling = false }
    }
    const timer = setInterval(() => void reconcile(), 30_000)
    void reconcile()
    log("loaded")
    return () => {
      updater.stop()
      controller.abort()
      clearInterval(timer)
    }
  },
})
