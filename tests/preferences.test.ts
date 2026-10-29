import { describe, expect, it } from "vitest"
import { AutomationSettings } from "../src/preferences"

describe("automation preferences", () => {
  it("requires opt-in and persists the server-wide preference across instances", async () => {
    const data = new Map<string, unknown>()
    const storage = {
      get: async (key: string) => data.get(key),
      set: async (key: string, value: unknown) => { data.set(key, value) },
    }
    const settings = new AutomationSettings(storage)
    expect(await settings.get()).toEqual({ enabled: false, revision: 0 })
    await settings.set(true)
    const anotherWorkspace = new AutomationSettings(storage)
    expect(await anotherWorkspace.get()).toEqual({ enabled: true, revision: 1 })
    await anotherWorkspace.set(false)
    expect(await settings.get()).toEqual({ enabled: false, revision: 2 })
  })
})
