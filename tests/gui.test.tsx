// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { render } from "solid-js/web"
import { createSignal } from "solid-js"
import { INITIAL_MARKDOWN, type SessionDocument } from "../src/document"

const host = vi.hoisted(() => ({
  contributions: new Map<string, unknown>(),
  Panel: Symbol("Panel"), Command: Symbol("Command"), Style: Symbol("Style"), MenuItem: Symbol("MenuItem"),
  SettingsPage: Symbol("SettingsPage"),
}))
vi.mock("@opencode/plugin/gui", async () => {
  const { createEffect, createMemo, createRoot, onCleanup, untrack } = await import("solid-js")
  return {
    ...host, Plugin: { define: (value: unknown) => value }, Store: { session: () => ({}) },
    createKeyed: (source: () => unknown, fn: (value: unknown) => void, options?: { equals: (a: unknown, b: unknown) => boolean }) => {
      const memo = createMemo(source, undefined, { equals: options?.equals })
      createEffect(() => {
        const value = memo()
        if (value === undefined) return
        let dispose!: () => void
        untrack(() => createRoot((cleanup) => { dispose = cleanup; fn(value) }))
        onCleanup(() => dispose())
      })
    },
  }
})

import plugin from "../src/gui"

const disposals: Array<() => void> = []
afterEach(() => {
  disposals.splice(0).forEach((dispose) => dispose())
  document.body.innerHTML = ""
  localStorage.clear()
})

async function mount(options: {
  enabled?: boolean; sideOpened?: boolean;
  records?: Map<string, SessionDocument>;
  introductions?: Map<string, { introduced: boolean }>;
} = {}) {
  const records = options.records ?? new Map<string, SessionDocument>()
  const listeners = new Map<string, Array<(event: { data: { sessionID: string }; location: { directory: string } }) => void>>()
  const notify = (sessionID: string, name = "changed") => (listeners.get(name) ?? []).forEach((handler) => handler({ data: { sessionID }, location: { directory: "/workspace" } }))
  let preferences = { enabled: options.enabled ?? false, revision: 0 }
  const api = {
    preferences: vi.fn(async () => preferences),
    configure: vi.fn(async ({ enabled }: { enabled: boolean }) => {
      preferences = { enabled, revision: preferences.revision + 1 }
      notify("", "preferencesChanged")
      return preferences
    }),
    get: vi.fn(async ({ sessionID }: { sessionID: string }) => records.get(sessionID) ?? null),
    create: vi.fn(async ({ sessionID }: { sessionID: string }) => {
      const value: SessionDocument = { sessionID, markdown: INITIAL_MARKDOWN, revision: 1, automatic: true, source: "initial", updatedAt: 1 }
      records.set(sessionID, value)
      notify(sessionID)
      return value
    }),
    save: vi.fn(async (input: { sessionID: string; markdown: string; revision: number; automatic: boolean }) => {
      const previous = records.get(input.sessionID)!
      if (previous.revision !== input.revision) throw new Error("Revision conflict: draft preserved")
      const value: SessionDocument = { ...previous, ...input, revision: input.revision + 1, source: "manual" }
      records.set(input.sessionID, value)
      return value
    }),
    refresh: vi.fn(async () => null),
    events: { on: (name: string, handler: (event: { data: { sessionID: string }; location: { directory: string } }) => void) => {
      const list = listeners.get(name) ?? []
      list.push(handler); listeners.set(name, list)
      return () => { list.splice(list.indexOf(handler), 1) }
    } },
  }
  const client = { rpc: () => api }
  const session = (id: string) => ({
    id, key: `test\n${id}`, directory: "/workspace", server: { client, connected: true },
  })
  const [selected, select] = createSignal(session("ses_a"))
  let panel!: { render: (props: unknown) => ReturnType<typeof render>; close: (input: unknown) => void }
  const introductions = options.introductions ?? new Map<string, { introduced: boolean }>()
  const layoutOpen = vi.fn()
  const ctx = {
    id: "session-document", client, sessions: { current: selected },
    layout: { ready: () => true, open: layoutOpen, side: { opened: () => options.sideOpened ?? false } },
    stores: { introduction: (session: { key: string }) => ({
      ready: () => true,
      get value() { return introductions.get(session.key) ?? { introduced: false } },
      set: (value: { introduced: boolean }) => introductions.set(session.key, value),
    }) },
    add: (registry: symbol, value: unknown) => { if (registry === host.Panel) panel = value as typeof panel },
  }
  const root = document.createElement("div")
  document.body.append(root)
  const dispose = render(() => {
    plugin.setup!(ctx as never)
    return panel.render({ get session() { return selected() } }) as never
  }, root)
  disposals.push(dispose)
  await vi.waitFor(() => expect(root.textContent).toContain(options.enabled ? "Edit document" : "Enable automatic documents"))
  const button = (text: string) => [...root.querySelectorAll("button")].find((item) => item.textContent === text)!
  const create = async () => {
    button("Enable automatic documents").click()
    await vi.waitFor(() => expect(button("Edit document")).toBeTruthy())
  }
  const type = (text: string) => {
    const textarea = root.querySelector("textarea")!
    textarea.value = text
    textarea.dispatchEvent(new Event("input", { bubbles: true }))
  }
  return { root, records, api, create, button, type, select: (id: string) => select(session(id)), notify,
    layoutOpen, introductions, dispose, close: () => panel.close({ session: selected() }),
  }
}

describe("session document panel", () => {
  it("creates, edits, saves, and renders the same document", async () => {
    const ui = await mount()
    await ui.create()
    ui.button("Edit document").click()
    ui.type("# Edited by hand\n\nA **shared** document.")
    ui.button("Save changes").click()
    await vi.waitFor(() => expect(ui.root.querySelector("h1")?.textContent).toBe("Edited by hand"))
    expect(ui.root.querySelector("strong")?.textContent).toBe("shared")
    expect(ui.records.get("ses_a")?.source).toBe("manual")
    expect(localStorage.length).toBe(0)
  })

  it("preserves a dirty draft when background updates arrive and refuses stale saves", async () => {
    const ui = await mount()
    await ui.create()
    ui.button("Edit document").click()
    ui.type("# Unsaved human text")
    ui.records.set("ses_a", { ...ui.records.get("ses_a")!, revision: 2, markdown: "# Background update" })
    ui.notify("ses_a")
    await vi.waitFor(() => expect(ui.root.textContent).toContain("A newer revision"))
    expect(ui.root.querySelector("textarea")?.value).toBe("# Unsaved human text")
    ui.button("Save changes").click()
    await vi.waitFor(() => expect(ui.root.textContent).toContain("Revision conflict"))
    expect(ui.root.querySelector("textarea")?.value).toBe("# Unsaved human text")
    expect(ui.records.get("ses_a")?.markdown).toBe("# Background update")
  })

  it("isolates sessions and restores an unsaved draft when switching back", async () => {
    const ui = await mount()
    await ui.create()
    ui.button("Edit document").click()
    ui.type("# Session A draft")
    ui.select("ses_b")
    await vi.waitFor(() => expect(ui.records.has("ses_b")).toBe(true))
    expect(ui.root.querySelector("textarea")).toBeNull()
    ui.select("ses_a")
    await vi.waitFor(() => expect(ui.root.querySelector("textarea")?.value).toBe("# Session A draft"))
    expect(ui.records.get("ses_b")?.markdown).toBe(INITIAL_MARKDOWN)
  })

  it("requires one-time enablement, then creates documents without a create click", async () => {
    const ui = await mount()
    expect(ui.api.create).not.toHaveBeenCalled()
    expect(ui.root.textContent).toContain("may incur costs")
    await ui.create()
    ui.select("ses_b")
    await vi.waitFor(() => expect(ui.records.has("ses_b")).toBe(true))
    expect(ui.api.configure).toHaveBeenCalledTimes(1)
    expect(ui.api.create).toHaveBeenCalledTimes(2)
  })

  it("appends without replacing another visible panel", async () => {
    const ui = await mount({ enabled: true, sideOpened: true })
    expect(ui.layoutOpen).toHaveBeenCalledWith("session-document:document", expect.anything(), { tab: "append", background: true })
  })

  it("shows on first visit, but does not reopen a closed tab on return", async () => {
    const ui = await mount({ enabled: true })
    expect(ui.layoutOpen).toHaveBeenCalledWith("session-document:document", expect.anything(), { tab: "select", background: true })
    ui.close()
    ui.select("ses_b")
    await vi.waitFor(() => expect(ui.records.has("ses_b")).toBe(true))
    ui.layoutOpen.mockClear()
    ui.select("ses_a")
    await vi.waitFor(() => expect(ui.root.textContent).toContain("Edit document"))
    expect(ui.layoutOpen).not.toHaveBeenCalled()
    expect(ui.api.create).toHaveBeenCalledTimes(2)
  })

  it("global disable stops automatic creation for later sessions without deleting documents", async () => {
    const ui = await mount({ enabled: true })
    ui.button("Disable globally").click()
    await vi.waitFor(() => expect(ui.root.textContent).toContain("Automation disabled globally"))
    ui.select("ses_b")
    await vi.waitFor(() => expect(ui.root.textContent).toContain("Enable automatic documents"))
    expect(ui.records.has("ses_b")).toBe(false)
    expect(ui.records.has("ses_a")).toBe(true)
  })

  it("remembers a closed tab across GUI reloads without recreating its document", async () => {
    const first = await mount({ enabled: true })
    first.close()
    first.dispose()
    const reloaded = await mount({ enabled: true, records: first.records, introductions: first.introductions })
    expect(reloaded.layoutOpen).not.toHaveBeenCalled()
    expect(reloaded.api.create).not.toHaveBeenCalled()
    expect(reloaded.root.textContent).toContain("Edit document")
  })

  it("preserves per-session pause when global automation is toggled", async () => {
    const ui = await mount({ enabled: true })
    ui.button("Edit document").click()
    const checkbox = ui.root.querySelector<HTMLInputElement>('input[type="checkbox"]')!
    checkbox.checked = false
    checkbox.dispatchEvent(new Event("change", { bubbles: true }))
    ui.button("Save changes").click()
    await vi.waitFor(() => expect(ui.root.textContent).toContain("Auto-update paused"))
    ui.button("Disable globally").click()
    await vi.waitFor(() => expect(ui.button("Enable globally")).toBeTruthy())
    ui.button("Enable globally").click()
    await vi.waitFor(() => expect(ui.root.textContent).toContain("Auto-update paused"))
    expect(ui.records.get("ses_a")?.automatic).toBe(false)
    expect(ui.api.create).toHaveBeenCalledTimes(1)
  })
})
