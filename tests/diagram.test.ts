// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { createDiagram, MERMAID_CONFIG } from "../src/diagram"

const viewers: Array<{ dispose(): void }> = []
afterEach(() => {
  viewers.splice(0).forEach((viewer) => viewer.dispose())
  document.body.innerHTML = ""
  vi.unstubAllGlobals()
})

const fixture = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 4000" width="100%" height="4000"><text x="20" y="30">Visible label</text></svg>'
function viewer() {
  const instance = createDiagram(fixture)
  viewers.push(instance)
  document.body.append(instance.element)
  return instance
}

describe("diagram viewer", () => {
  it("uses Mermaid's root-level SVG label setting", () => {
    expect(MERMAID_CONFIG.htmlLabels).toBe(false)
    expect(MERMAID_CONFIG.securityLevel).toBe("strict")
  })

  it("keeps SVG labels and initially scales a tall diagram to fit", () => {
    const { element } = viewer()
    const svg = element.querySelector("svg")!
    expect(svg.querySelector("text")?.textContent).toBe("Visible label")
    expect(Number(svg.getAttribute("height"))).toBeLessThanOrEqual(240)
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMid meet")
    expect(element.querySelector('[aria-label="Fit diagram to viewport"]')?.getAttribute("aria-pressed")).toBe("true")
    // Buttons must not be hidden from assistive technology inside role=img.
    expect(svg.querySelector("button")).toBeNull()
    expect(element.querySelector('[role="region"]')?.getAttribute("tabindex")).toBe("0")
  })

  it("zooms, fits again, and expands without removing the label", () => {
    const { element } = viewer()
    const svg = element.querySelector("svg")!
    const initialWidth = Number(svg.getAttribute("width"))
    element.querySelector<HTMLButtonElement>('[aria-label="Zoom in diagram"]')!.click()
    expect(Number(svg.getAttribute("width"))).toBeGreaterThan(initialWidth)
    element.querySelector<HTMLButtonElement>('[aria-label="Fit diagram to viewport"]')!.click()
    expect(Number(svg.getAttribute("width"))).toBe(initialWidth)
    element.querySelector<HTMLButtonElement>('[aria-label="Expand diagram"]')!.click()
    expect(element.classList.contains("sd-diagram-expanded")).toBe(true)
    expect(element.querySelector('[aria-label="Collapse diagram"]')?.getAttribute("aria-expanded")).toBe("true")
    expect(svg.querySelector("text")?.textContent).toBe("Visible label")
  })

  it("disconnects observers and listeners when the preview is replaced", () => {
    const disconnect = vi.fn()
    const observe = vi.fn()
    vi.stubGlobal("ResizeObserver", class { observe = observe; disconnect = disconnect })
    const { element, dispose } = viewer()
    const svg = element.querySelector("svg")!
    const width = svg.getAttribute("width")
    expect(observe).toHaveBeenCalledWith(element.querySelector(".sd-diagram-viewport"))
    dispose()
    expect(disconnect).toHaveBeenCalledOnce()
    element.querySelector<HTMLButtonElement>('[aria-label="Zoom in diagram"]')!.click()
    expect(svg.getAttribute("width")).toBe(width)
  })

  it("rejects missing or invalid view boxes instead of rendering unbounded SVG", () => {
    expect(() => createDiagram("<p>Not SVG</p>")).toThrow("No SVG")
    expect(() => createDiagram('<svg viewBox="0 0 -1 300"></svg>')).toThrow("Invalid diagram dimensions")
    expect(() => createDiagram('<svg viewBox="0 0 Infinity 300"></svg>')).toThrow("Invalid diagram dimensions")
  })
})
