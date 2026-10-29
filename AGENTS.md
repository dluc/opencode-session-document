# Session document plugin

This is an independent Git repository. The parent folder is only a workspace.

## Target

- OpenCode V2, developed against `@opencode/plugin` 2.2.0.
- Server entry: `src/index.ts`; desktop GUI: `src/gui.tsx`; shared RPC: `src/rpc.ts`.
- GUI API is experimental. Consult https://opencode.ai/v2/docs/build/plugins/gui before changing host integration.
- Use npm and the committed lockfile. Run commands from this directory.

## Invariants

- One document per session; no shared workspace Markdown file.
- Automatic documents require one-time server-wide opt-in with a model-cost notice. After consent, create documents when a session is visited without further per-session setup.
- Introduce the panel once per session, preserve another visible panel's selection, and remember closed tabs across visits/reloads. Panel visibility never controls background updates.
- The server-wide disable preference gates all background generation. Preserve per-session pause settings when global automation is toggled.
- Automatic generation is transient: never submit chat prompts or start an agent execution loop.
- Store documents in plugin storage; keep local unsaved GUI drafts separate.
- All content mutations use revision checks; never silently overwrite a manual save.
- Render untrusted Markdown and SVG safely; do not allow silent remote resource loads.
- Mermaid 12 must use root-level `htmlLabels: false` so labels survive SVG sanitization. Keep diagram viewers height-limited with fit/zoom/expand controls; never solve missing labels by allowing untrusted embedded HTML.
- Do not add document content to agent instructions; this is a summary, not an authority.
- Logs must not contain conversation text, document text, credentials, or raw provider errors.
- Automatic output is a current-state brief (600 words / 6,000 characters maximum), not an accumulating history. At most one shortening retry; never truncate content to fit.
- Preserve `session-document:keep` blocks verbatim outside the generated brief's budget. They remain subject to the overall storage limit.
- Server-only policy changes should remain compatible with installed desktop panels; do not change RPC/schema unnecessarily or require a laptop rebuild for prompt changes.

## Verification

`npm run check` runs strict type checking, Vitest tests, and the actual desktop bundle build.
`npm audit` checks dependencies.
`npm run test:browser` checks actual Mermaid labels, dimensions, and viewer controls in Chromium (set `CHROME_BIN` if needed). Keep this separate from browser-independent checks.

Unit/DOM/mock-host tests do not establish compatibility with a running desktop app. Report live app testing separately.
