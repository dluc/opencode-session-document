// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { renderMarkdown, sanitizeDiagram } from "../src/render"

describe("Markdown and diagram safety", () => {
  it("renders Markdown tables and Mermaid source blocks", () => {
    const html = renderMarkdown("# Notes\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n```mermaid\nflowchart LR\n A --> B\n```")
    expect(html).toContain("<h1>Notes</h1>")
    expect(html).toContain("<table>")
    expect(html).toContain('class="language-mermaid"')
  })

  it("removes executable HTML and silent external resources", () => {
    const html = renderMarkdown('<script>alert(1)</script><img src="https://tracker.test"><iframe src="https://tracker.test"></iframe><p onclick="alert(1)">Safe</p>\n\n[bad](javascript:alert)')
    expect(html).not.toMatch(/<script|<img|<iframe|onclick=|href="javascript:/)
    expect(html).toContain("Safe")
  })

  it("removes SVG script handlers, external links, and embedded HTML", () => {
    const svg = sanitizeDiagram('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><image href="https://tracker.test"/><foreignObject><p>HTML</p></foreignObject><text>Diagram</text></svg>')
    expect(svg).not.toMatch(/onload|<script|<image|foreignObject|tracker/)
    expect(svg).toContain("Diagram")
  })

  it("strips SVG CSS that could load an external resource", () => {
    const svg = sanitizeDiagram('<svg><style>@import "https://tracker.test";</style><rect style="fill:url(https://tracker.test)"/><text>Safe</text></svg>')
    expect(svg).not.toContain("tracker")
    expect(svg).not.toContain("style")
    expect(svg).toContain("Safe")
  })
})
