import { Command, createKeyed, MenuItem, Panel, Plugin, SettingsPage, Store, Style, type PanelTab } from "@opencode/plugin/gui"
import { Schema } from "effect"
import { createEffect, createSignal, onCleanup, Show } from "solid-js"
import type { Component } from "solid-js"
import { SessionDocuments } from "./rpc"
import { MAX_MARKDOWN, type SessionDocument } from "./document"
import { renderMarkdown } from "./render"
import { createDiagram, MERMAID_CONFIG } from "./diagram"
import css from "./panel.css?inline"
import type { AutomationPreferences } from "./preferences"

export default Plugin.define({
  stores: {
    introduction: Store.session(Schema.Struct({ introduced: Schema.Boolean }), { introduced: false }),
  },
  setup(ctx) {
    ctx.add(Style, css)
    const tab: PanelTab = { id: "document", title: "Session document", closable: "compact" }
    const [preferences, setPreferences] = createSignal<AutomationPreferences>()
    const [settingsError, setSettingsError] = createSignal("")
    const [settingsBusy, setSettingsBusy] = createSignal(false)
    const preferenceClient = () => ctx.sessions.current()?.server.client ?? ctx.client
    const acceptPreferences = (value: AutomationPreferences) => setPreferences((previous) =>
      previous && previous.revision > value.revision ? previous : value)

    // The preference lives on the server so it also governs updates with no panel mounted.
    createKeyed(preferenceClient, (client) => {
      let alive = true
      let sequence = 0
      setPreferences(undefined)
      const rpc = client.rpc(SessionDocuments)
      const load = async () => {
        const request = ++sequence
        try {
          const value = await rpc.preferences({})
          if (alive && request === sequence) { acceptPreferences(value); setSettingsError("") }
        } catch { if (alive) setSettingsError("Could not load automatic-document settings.") }
      }
      const unsubscribe = rpc.events.on("preferencesChanged", () => { void load() })
      const timer = setInterval(() => void load(), 15_000)
      void load()
      onCleanup(() => { alive = false; unsubscribe(); clearInterval(timer) })
    })

    const configure = async (enabled: boolean) => {
      const client = preferenceClient()
      setSettingsBusy(true); setSettingsError("")
      try {
        const value = await client.rpc(SessionDocuments).configure({ enabled })
        if (preferenceClient() === client) acceptPreferences(value)
      } catch {
        if (preferenceClient() === client) setSettingsError("Could not save automatic-document settings. Please retry.")
      } finally { setSettingsBusy(false) }
    }

    createKeyed(() => {
      const session = ctx.sessions.current()
      const prefs = preferences()
      if (!session || session.pending || !session.server.connected || !prefs || !ctx.layout.ready()) return
      const introduction = ctx.stores.introduction(session)
      if (!introduction.ready()) return
      return { session, preferences: prefs, introduction }
    }, ({ session, preferences: prefs, introduction }) => {
      let alive = true
      onCleanup(() => { alive = false })
      // Only introduce the tab once. Returning to a session or reloading the GUI
      // must not reopen a tab the user closed or steal a different tab's selection.
      if (!introduction.value?.introduced) {
        introduction.set({ introduced: true })
        ctx.layout.open(`${ctx.id}:document`, session, {
          tab: ctx.layout.side.opened(session) ? "append" : "select", background: true,
        })
      }
      if (!prefs.enabled) return
      void (async () => {
        try {
          const rpc = session.server.client.rpc(SessionDocuments)
          const options = { location: { directory: session.directory } }
          const existing = await rpc.get({ sessionID: session.id }, options)
          if (alive && !existing) await rpc.create({ sessionID: session.id }, options)
        } catch { if (alive) setSettingsError("Could not prepare this session’s document. Reopen the panel to retry.") }
      })()
    }, { equals: (a, b) => a?.session === b?.session && a?.preferences.revision === b?.preferences.revision })

    ctx.add(SettingsPage, {
      id: "automation", title: "Session documents", icon: "file-tree",
      render: () => <section class="sd-panel" aria-label="Session document settings">
        <h2>Automatic session documents</h2>
        <p>Enable once for all workspaces on this server. Each visited session gets its own document.</p>
        <p>Completed chat turns make an additional request to the session’s model and may incur costs.
          Disabling stops background updates, including when panels are closed. Saved documents are kept.</p>
        <label class="sd-checkbox"><input type="checkbox" checked={preferences()?.enabled ?? false}
          disabled={!preferences() || settingsBusy()}
          onChange={(event) => void configure(event.currentTarget.checked)} /> Enable automatic session documents</label>
        <Show when={settingsError()}><p role="alert">{settingsError()}</p></Show>
      </section>,
    })

    const Preview: Component<{ markdown: string }> = (props) => {
      let root!: HTMLDivElement
      let generation = 0
      const viewers: Array<() => void> = []
      const clearViewers = () => viewers.splice(0).forEach((dispose) => dispose())
      createEffect(() => {
        const markdown = props.markdown
        const version = ++generation
        clearViewers()
        root.innerHTML = renderMarkdown(markdown)
        const blocks = [...root.querySelectorAll<HTMLElement>("pre > code.language-mermaid")]
        if (!blocks.length) return
        void (async () => {
          try {
            const { default: mermaid } = await import("mermaid")
            mermaid.initialize(MERMAID_CONFIG)
            for (const block of blocks) {
              if (version !== generation) return
              try {
                const source = block.textContent ?? ""
                // Do not let document directives override rendering/security settings.
                if (/%%\s*\{|^---\s*$/m.test(source)) throw new Error("Diagram configuration directives are not supported.")
                const result = await mermaid.render(`session-doc-${crypto.randomUUID()}`, source)
                if (version !== generation) return
                const diagram = createDiagram(result.svg)
                viewers.push(diagram.dispose)
                const details = document.createElement("details")
                const summary = document.createElement("summary")
                summary.textContent = "Diagram source"
                const pre = block.parentElement!
                pre.replaceWith(diagram.element, details)
                details.append(summary, pre)
              } catch {
                if (version !== generation) return
                const notice = document.createElement("p")
                notice.className = "sd-notice"
                notice.textContent = "Diagram could not be rendered. Its source is shown below."
                block.parentElement?.before(notice)
              }
            }
          } catch {
            // Markdown and diagram source remain readable if the renderer fails.
          }
        })()
      })
      onCleanup(() => { generation++; clearViewers() })
      return <div class="sd-markdown" ref={root} />
    }

    ctx.add(Panel, {
      id: "document", region: "side", wide: true,
      list: ({ open }) => open.includes("document") ? [tab] : [],
      close: ({ session }) => ctx.stores.introduction(session).set({ introduced: true }),
      render(props) {
        const [current, setCurrent] = createSignal<SessionDocument | null>()
        const [editing, setEditing] = createSignal(false)
        const [draft, setDraft] = createSignal("")
        const [baseRevision, setBaseRevision] = createSignal(0)
        const [automatic, setAutomatic] = createSignal(true)
        const [busy, setBusy] = createSignal(false)
        const [error, setError] = createSignal("")
        const [comparing, setComparing] = createSignal(false)
        const acceptDocument = (document: SessionDocument | null) => setCurrent((previous) =>
          document && previous && previous.revision > document.revision ? previous : document)
        // Drafts survive route changes and GUI reloads; keyed by server + session.
        const draftKey = () => `session-document:draft:${props.session.key}`
        const dirty = () => editing() && (draft() !== current()?.markdown || automatic() !== current()?.automatic)

        const target = () => ({ sessionID: props.session.id })
        const options = () => ({ location: { directory: props.session.directory } })
        const api = () => props.session.server.client.rpc(SessionDocuments)

        const remember = () => {
          if (!editing()) return
          try {
            localStorage.setItem(draftKey(), JSON.stringify({
              markdown: draft(), revision: baseRevision(), automatic: automatic(),
            }))
          } catch { setError("Could not back up this draft locally. Keep this panel open until it is saved.") }
        }

        createEffect(() => {
          const session = props.session
          const client = session.server.client
          const connected = session.server.connected
          const rpc = client.rpc(SessionDocuments)
          const callOptions = { location: { directory: session.directory } }
          const key = draftKey()
          let alive = true
          let sequence = 0
          setCurrent(undefined); setEditing(false); setError(""); setBusy(false); setComparing(false)

          const load = async () => {
            const request = ++sequence
            try {
              const document = await rpc.get({ sessionID: session.id }, callOptions)
              if (!alive || request !== sequence) return
              acceptDocument(document)
            } catch { if (alive) setError("Could not load the document. Check the server connection and plugin installation.") }
          }
          try {
            const saved = localStorage.getItem(key)
            if (saved) {
              const value = JSON.parse(saved)
              if (typeof value.markdown === "string" && typeof value.revision === "number" && typeof value.automatic === "boolean") {
                setDraft(value.markdown); setBaseRevision(value.revision); setAutomatic(value.automatic); setEditing(true)
              }
            }
          } catch { setError("The local draft could not be restored.") }
          const unsubscribe = rpc.events.on("changed", (event) => {
            if (event.data.sessionID === session.id && event.location.directory === session.directory) void load()
          })
          if (connected) void load()
          else setError("The server is disconnected. Your local draft is preserved.")
          // Also resync after a dropped event subscription; events are live-only.
          const timer = setInterval(() => { if (session.server.connected) void load() }, 5000)
          onCleanup(() => { alive = false; unsubscribe(); clearInterval(timer) })
        })

        const perform = async (action: () => Promise<void>) => {
          const key = props.session.key
          setBusy(true); setError("")
          try { await action() }
          catch (cause) {
            if (props.session.key === key) setError(cause instanceof Error ? cause.message : "Operation failed. Your draft is preserved.")
          } finally { if (props.session.key === key) setBusy(false) }
        }

        const beginEdit = () => {
          const document = current()
          if (!document) return
          setDraft(document.markdown); setBaseRevision(document.revision); setAutomatic(document.automatic)
          setEditing(true); setComparing(false); remember()
        }

        const save = () => {
          const rpc = api(), input = target(), callOptions = options(), key = props.session.key, localKey = draftKey()
          const markdown = draft(), revision = baseRevision(), auto = automatic()
          return perform(async () => {
            const document = await rpc.save({ ...input, revision, markdown, automatic: auto }, callOptions)
            if (props.session.key !== key) return
            acceptDocument(document); setBaseRevision(document.revision)
            // Do not erase edits typed while the save request was in flight.
            if (draft() === markdown && automatic() === auto) {
              setEditing(false); localStorage.removeItem(localKey)
            } else remember()
          })
        }

        return <section class="sd-panel" aria-label="Session document">
          <header class="sd-header">
            <div><span class="sd-eyebrow">SESSION NOTES</span><h2>Living document</h2></div>
            <Show when={current()}>{(document) => <span class="sd-revision">r{document().revision}</span>}</Show>
          </header>
          <Show when={error()}><p class="sd-notice" role="alert">{error()}</p></Show>
          <Show when={current() !== undefined} fallback={<p class="sd-empty">Loading session document…</p>}>
            <Show when={current()} fallback={<div class="sd-empty">
              <h3>A clear thread through your session.</h3>
              <p>Enable once, then every session you open gets its own document automatically.</p>
              <p>Uses your session’s model for an additional documentation request after each completed turn. This may incur costs.</p>
              <Show when={preferences()?.enabled} fallback={<button disabled={!preferences() || settingsBusy()}
                onClick={() => void configure(true)}>Enable automatic documents</button>}>
              <button disabled={busy()} onClick={() => {
                const rpc = api(), input = target(), callOptions = options(), key = props.session.key
                void perform(async () => {
                  const document = await rpc.create(input, callOptions)
                  if (props.session.key === key) acceptDocument(document)
                })
              }}>Retry creating document</button>
              </Show>
              <Show when={settingsError()}><p role="alert">{settingsError()}</p></Show>
            </div>}>
              <div class="sd-toolbar">
                <Show when={!editing()} fallback={<>
                  <button disabled={busy() || draft().length > MAX_MARKDOWN} onClick={() => void save()}>Save changes</button>
                  <button class="sd-secondary" disabled={busy()} onClick={() => {
                    if (dirty() && !window.confirm("Discard your unsaved document edits?")) return
                    localStorage.removeItem(draftKey()); setEditing(false); setComparing(false)
                  }}>Cancel</button>
                </>}>
                  <button onClick={beginEdit}>Edit document</button>
                  <button class="sd-secondary" disabled={busy() || !current()?.automatic} onClick={() => {
                    const rpc = api(), input = target(), callOptions = options()
                    void perform(async () => { await rpc.refresh(input, callOptions) })
                  }}>{busy() ? "Updating…" : "Refresh"}</button>
                </Show>
                <span class="sd-status">{!preferences()?.enabled ? "Automation disabled globally" : current()?.automatic ? "Auto-update on" : "Auto-update paused"}</span>
                <button class="sd-secondary" disabled={!preferences() || settingsBusy()}
                  onClick={() => void configure(!preferences()?.enabled)}>
                  {preferences()?.enabled ? "Disable globally" : "Enable globally"}
                </button>
              </div>
              <Show when={current()?.error}><p class="sd-notice" role="status">{current()?.error}</p></Show>
              <Show when={editing()} fallback={<Preview markdown={current()?.markdown ?? ""} />}>
                <Show when={baseRevision() !== current()?.revision}>
                  <div class="sd-notice" role="status">
                    A newer revision is available. Your draft is preserved.
                    <button class="sd-secondary" onClick={() => setComparing(!comparing())}>Compare with latest</button>
                    <Show when={comparing()}>
                      <p>Merge any newer changes into your draft, then use the button below before saving.</p>
                      <Preview markdown={current()?.markdown ?? ""} />
                      <button class="sd-secondary" onClick={() => {
                        setBaseRevision(current()!.revision); setComparing(false); remember()
                      }}>I’ve merged the latest changes</button>
                    </Show>
                  </div>
                </Show>
                <label class="sd-label" for={`sd-editor-${props.session.id}`}>Markdown · Mermaid supported</label>
                <textarea id={`sd-editor-${props.session.id}`} class="sd-editor" value={draft()} spellcheck={false}
                  onInput={(event) => { setDraft(event.currentTarget.value); remember() }} />
                <label class="sd-checkbox"><input type="checkbox" checked={automatic()} onChange={(event) => {
                  setAutomatic(event.currentTarget.checked); remember()
                }} /> Update automatically after chat turns</label>
                <span class="sd-status">{draft().length.toLocaleString()} / {MAX_MARKDOWN.toLocaleString()} characters</span>
              </Show>
              <footer class="sd-footer">Session-specific · Not a workspace file · A summary, not proof of completion</footer>
            </Show>
          </Show>
        </section>
      },
    })

    const open = () => {
      const session = ctx.sessions.current()
      if (session) ctx.layout.open(`${ctx.id}:document`, session, { tab: "select" })
    }
    ctx.add(Command, (): Command => ({
      id: "open", title: "Open session document", group: "Session document",
      slash: { name: "session-document" }, enabled: !!ctx.sessions.current(), run: open,
    }))
    ctx.add(MenuItem, (): MenuItem => ({
      menu: "session.panel", id: "open", title: "Session document", icon: "file-tree",
      run: open,
    }))
  },
})
