import DOMPurify from "dompurify"
import { marked } from "marked"

/** Raw HTML is sanitized; embedded resources cannot silently make network requests. */
export function renderMarkdown(markdown: string): string {
  return DOMPurify.sanitize(marked.parse(markdown, { async: false, gfm: true }), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["img", "iframe", "object", "embed", "video", "audio", "source", "style", "form", "input", "button"],
    FORBID_ATTR: ["style", "srcset"],
  })
}

export function sanitizeDiagram(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    // SVG CSS can fetch external URLs; use the panel's own diagram styles instead.
    FORBID_TAGS: ["foreignObject", "image", "a", "script", "style"],
    FORBID_ATTR: ["href", "xlink:href", "style"],
  })
}
