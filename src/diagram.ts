import type { MermaidConfig } from "mermaid"
import { sanitizeDiagram } from "./render"

export const MERMAID_CONFIG: MermaidConfig = {
  startOnLoad: false,
  securityLevel: "strict",
  suppressErrorRendering: true,
  maxTextSize: 20_000,
  // Mermaid 12's root setting overrides the deprecated per-flowchart option.
  // SVG text survives sanitization; foreignObject HTML intentionally does not.
  htmlLabels: false,
  fontFamily: "ui-monospace, monospace",
  fontSize: 13,
  themeVariables: { fontFamily: "ui-monospace, monospace", fontSize: "13px" },
}

/** A bounded viewer. Zoom scrolls inside the diagram, never enlarges the page. */
export function createDiagram(source: string): { element: HTMLElement; dispose(): void } {
  const element = document.createElement("figure")
  element.className = "sd-diagram"
  element.innerHTML = sanitizeDiagram(source)
  const svg = element.querySelector("svg")
  if (!svg) throw new Error("No SVG diagram")
  const values = svg.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number)
  if (!values || values.length !== 4 || !values.every(Number.isFinite) || values[2] <= 0 || values[3] <= 0) {
    throw new Error("Invalid diagram dimensions")
  }
  const [, , width, height] = values
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
  svg.setAttribute("role", "img")
  if (!svg.hasAttribute("aria-label") && !svg.hasAttribute("aria-labelledby")) svg.setAttribute("aria-label", "Mermaid diagram")

  const toolbar = document.createElement("div")
  toolbar.className = "sd-diagram-toolbar"
  toolbar.setAttribute("role", "group")
  toolbar.setAttribute("aria-label", "Diagram controls")
  const title = document.createElement("span")
  title.className = "sd-diagram-title"
  title.textContent = "Diagram"
  const zoomLabel = document.createElement("output")
  zoomLabel.className = "sd-diagram-zoom"
  zoomLabel.setAttribute("aria-label", "Diagram zoom")
  const viewport = document.createElement("div")
  viewport.className = "sd-diagram-viewport"
  viewport.tabIndex = 0
  viewport.setAttribute("role", "region")
  viewport.setAttribute("aria-label", "Diagram viewport. Use the controls to zoom or expand; scroll here when zoomed.")
  const canvas = document.createElement("div")
  canvas.className = "sd-diagram-canvas"
  canvas.append(svg)
  viewport.append(canvas)
  let scale = 1
  let fitted = true
  let expanded = false
  let disposed = false
  const listeners: Array<() => void> = []
  const button = (text: string, label: string, action: () => void) => {
    const control = document.createElement("button")
    control.type = "button"
    control.className = "sd-secondary"
    control.textContent = text
    control.setAttribute("aria-label", label)
    control.title = label
    control.addEventListener("click", action)
    listeners.push(() => control.removeEventListener("click", action))
    return control
  }
  const applyScale = () => {
    svg.setAttribute("width", String(width * scale))
    svg.setAttribute("height", String(height * scale))
    zoomLabel.textContent = `${Math.max(1, Math.round(scale * 100))}%`
    fitButton.setAttribute("aria-pressed", String(fitted))
    zoomOut.disabled = scale <= 0.01
    zoomIn.disabled = scale >= 8
  }
  const fit = () => {
    fitted = true
    // The fallback is only for the short interval before the element is mounted.
    scale = Math.min((viewport.clientWidth || 320) / width, (viewport.clientHeight || 240) / height, 1)
    applyScale()
    viewport.scrollTop = 0
    viewport.scrollLeft = 0
  }
  const zoom = (factor: number) => {
    fitted = false
    scale = Math.min(8, Math.max(0.01, scale * factor))
    applyScale()
  }
  const fitButton = button("Fit", "Fit diagram to viewport", fit)
  const zoomOut = button("−", "Zoom out diagram", () => zoom(1 / 1.5))
  const zoomIn = button("+", "Zoom in diagram", () => zoom(1.5))
  const expand = button("Expand", "Expand diagram", () => {
    expanded = !expanded
    element.classList.toggle("sd-diagram-expanded", expanded)
    expand.textContent = expanded ? "Collapse" : "Expand"
    expand.setAttribute("aria-expanded", String(expanded))
    expand.setAttribute("aria-label", expanded ? "Collapse diagram" : "Expand diagram")
    if (fitted) fit()
  })
  expand.setAttribute("aria-expanded", "false")
  toolbar.append(title, fitButton, zoomOut, zoomLabel, zoomIn, expand)
  element.replaceChildren(toolbar, viewport)
  fit()
  const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => {
    if (!disposed && fitted) fit()
  })
  observer?.observe(viewport)
  const timer = setTimeout(() => { if (!disposed && fitted) fit() }, 0)
  return {
    element,
    dispose() {
      disposed = true
      clearTimeout(timer)
      observer?.disconnect()
      listeners.forEach((remove) => remove())
    },
  }
}
