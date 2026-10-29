import { describe, expect, it } from "vitest"
import { assembleBrief, briefViolation, BRIEF_MAX_CHARACTERS, BRIEF_MAX_WORDS, KEEP_END, KEEP_START, separateNotes } from "../src/brief"

describe("concise brief policy", () => {
  it("accepts a brief at the word limit and rejects one word over it", () => {
    expect(briefViolation(Array(BRIEF_MAX_WORDS).fill("word").join(" "))).toBeNull()
    expect(briefViolation(Array(BRIEF_MAX_WORDS + 1).fill("word").join(" "))).toContain("words")
  })

  it("bounds characters even when a language or long token has few spaces", () => {
    expect(briefViolation("文".repeat(BRIEF_MAX_CHARACTERS))).toBeNull()
    expect(briefViolation("文".repeat(BRIEF_MAX_CHARACTERS + 1))).toContain("characters")
  })

  it("allows one small diagram but rejects multiple or oversized diagrams", () => {
    const diagram = "```mermaid\nflowchart LR\nA --> B\n```"
    expect(briefViolation(diagram)).toBeNull()
    expect(briefViolation(`${diagram}\n\n${diagram}`)).toContain("one Mermaid")
    expect(briefViolation(`~~~mermaid\n${"A --> B\n".repeat(31)}~~~`)).toContain("30 lines")
  })

  it("extracts multiple pinned notes verbatim and reattaches them outside the brief", () => {
    const first = `${KEEP_START}\r\nFirst note.\r\n${KEEP_END}`
    const second = `${KEEP_START}\nSecond note.\n${KEEP_END}`
    const { brief, notes } = separateNotes(`# Brief\n\n${first}\n\n${second}`)
    expect(brief).toBe("# Brief")
    expect(notes).toEqual([first, second])
    expect(assembleBrief("# New brief\n", notes)).toBe(`# New brief\n\n${first}\n\n${second}`)
  })

  it("does not silently consume incomplete pinned notes", () => {
    expect(() => separateNotes(`# Brief\n${KEEP_START}\nImportant note`)).toThrow("Unmatched")
    expect(() => separateNotes(`Important note\n${KEEP_END}`)).toThrow("Unmatched")
  })

  it("rejects empty output and model-authored protected blocks", () => {
    expect(briefViolation(" \n ")).toContain("empty")
    expect(briefViolation(`${KEEP_START}changed note${KEEP_END}`)).toContain("markers")
  })
})
