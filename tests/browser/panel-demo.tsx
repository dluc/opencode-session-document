// Render the real panel with deterministic synthetic data. Never connect this
// fixture to a live server or import a real session into a documentation image.
import { render } from "solid-js/web"
import { Panel, Style, type Panel as PanelDefinition } from "@opencode/plugin/gui"
import plugin from "../../src/gui"
import type { SessionDocument } from "../../src/document"

const markdown = `# Project search

## Objective
Help people find a note without leaving their project.

## Approach
Filter notes locally as the query changes. Keep keyboard navigation predictable.

\`\`\`mermaid
flowchart TD
  Q[Search query] --> F[Filter notes]
  F --> R[Show matching notes]
  F --> E[Show empty state]
\`\`\`

## Status
- Search input and results list implemented.
- Keyboard navigation checked in the demo.

## Next
Add the empty-state message and finish accessibility checks.
`

let document: SessionDocument = {
  sessionID: "ses_demo", markdown, revision: 7, automatic: true,
  source: "automatic", updatedAt: 0,
}
let preferences = { enabled: true, revision: 1 }
const api = {
  preferences: async () => preferences,
  configure: async ({ enabled }: { enabled: boolean }) => (preferences = { enabled, revision: preferences.revision + 1 }),
  get: async () => document,
  create: async () => document,
  save: async (input: { markdown: string; automatic: boolean }) => (document = {
    ...document, ...input, revision: document.revision + 1, source: "manual",
  }),
  refresh: async () => null,
  events: { on: () => () => {} },
}
const client = { rpc: () => api }
const session = {
  id: "ses_demo", key: "demo-session", directory: "/demo", pending: false,
  server: { client, connected: true },
}
let panel: PanelDefinition | undefined
const context = {
  id: "session-document", client,
  sessions: { current: () => session },
  stores: { introduction: () => ({ ready: () => true, value: { introduced: true }, set: () => {} }) },
  layout: { ready: () => true, side: { opened: () => true }, open: () => {} },
  add(registry: unknown, contribution: unknown) {
    if (registry === Panel) panel = contribution as PanelDefinition
    if (registry === Style) {
      const style = window.document.createElement("style")
      style.textContent = contribution as string
      window.document.head.append(style)
    }
    return () => {}
  },
}
render(() => {
  plugin.setup!(context as never)
  if (!panel) throw new Error("Demo panel was not registered")
  return panel.render({ session, tab: { id: "document", title: "Session document" }, screen: {} } as never)
}, window.document.querySelector("#demo-panel")!)

const ready = (async () => {
  for (let attempt = 0; attempt < 300; attempt++) {
    const svg = window.document.querySelector(".sd-diagram svg")
    const text = window.document.body.innerText
    if (svg && text.includes("Auto-update on") && text.includes("Add the empty-state message")) {
      await window.document.fonts.ready
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      return {
        text: window.document.body.innerText,
        labels: [...svg.querySelectorAll("text")].map(node => node.textContent).join(" "),
        nodeLabelsAligned: [...svg.querySelectorAll("g.node")].length === 4 && [...svg.querySelectorAll("g.node")].every(node => {
          const shape = node.querySelector("rect")?.getBoundingClientRect()
          const text = node.querySelector("text")?.getBoundingClientRect()
          return !!shape && !!text && text.left >= shape.left - 2 && text.right <= shape.right + 2
        }),
        title: window.document.title,
      }
    }
    await new Promise(resolve => setTimeout(resolve,100))
  }
  throw new Error("The fictional demo did not finish rendering")
})()
;(window as unknown as { demoReady: typeof ready }).demoReady = ready
