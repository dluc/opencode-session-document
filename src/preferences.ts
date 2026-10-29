import { z } from "zod"

export const Preferences = z.object({ enabled: z.boolean(), revision: z.number().int().nonnegative() })
export type AutomationPreferences = z.infer<typeof Preferences>

/** Plugin-wide on this server, not a document or workspace preference. */
export class AutomationSettings {
  private queue: Promise<unknown> = Promise.resolve()
  constructor(private storage: {
    get(key: string): Promise<unknown>
    set(key: string, value: AutomationPreferences): Promise<void>
  }) {}

  async get(): Promise<AutomationPreferences> {
    const stored = await this.storage.get("automation/preferences")
    return stored === undefined ? { enabled: false, revision: 0 } : Preferences.parse(stored)
  }

  set(enabled: boolean): Promise<AutomationPreferences> {
    const operation = this.queue.catch(() => {}).then(async () => {
      const current = await this.get()
      const next = { enabled, revision: current.revision + 1 }
      await this.storage.set("automation/preferences", next)
      return next
    })
    this.queue = operation
    return operation
  }
}
