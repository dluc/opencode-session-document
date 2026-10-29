/** A readable brief, not the much larger storage safety limit. */
export const BRIEF_MAX_WORDS = 600
export const BRIEF_MAX_CHARACTERS = 6_000
export const BRIEF_MAX_DIAGRAM_LINES = 30
export const KEEP_START = "<!-- session-document:keep -->"
export const KEEP_END = "<!-- /session-document:keep -->"

/** Pinned manual notes are kept verbatim, outside the generated brief's budget. */
export function separateNotes(markdown: string) {
  const notes: string[] = []
  const brief = markdown.replace(/<!-- session-document:keep -->[\s\S]*?<!-- \/session-document:keep -->/g, (block) => {
    notes.push(block)
    return ""
  }).trim()
  // An incomplete pair must not accidentally make a user's note disposable.
  if (brief.includes(KEEP_START) || brief.includes(KEEP_END)) {
    throw new Error("Unmatched pinned-note marker")
  }
  return { brief, notes }
}

export function briefViolation(markdown: string): string | null {
  if (!markdown.trim()) return "The brief is empty."
  if (markdown.includes(KEEP_START) || markdown.includes(KEEP_END)) return "Do not output pinned-note markers."
  if (markdown.length > BRIEF_MAX_CHARACTERS) return `The brief exceeds ${BRIEF_MAX_CHARACTERS} characters.`
  if (markdown.trim().split(/\s+/u).length > BRIEF_MAX_WORDS) return `The brief exceeds ${BRIEF_MAX_WORDS} words.`
  // Any backtick or tilde fenced diagram is counted; other code is still bounded
  // by the overall character/word limits. Do not truncate fenced Markdown.
  const diagrams = [...markdown.matchAll(/^ {0,3}(`{3,}|~{3,})mermaid[^\n]*\n([\s\S]*?)^ {0,3}\1[ \t]*$/gm)]
  if (diagrams.length > 1) return "Use at most one Mermaid diagram."
  if (diagrams.some((match) => match[2].trimEnd().split("\n").length > BRIEF_MAX_DIAGRAM_LINES)) {
    return `Keep the Mermaid diagram within ${BRIEF_MAX_DIAGRAM_LINES} lines.`
  }
  return null
}

export function assembleBrief(markdown: string, notes: string[]) {
  return [markdown.trim(), ...notes].join("\n\n")
}
