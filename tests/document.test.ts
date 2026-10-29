import { describe, expect, it } from "vitest"
import { Documents, INITIAL_MARKDOWN, MAX_MARKDOWN, RevisionConflict } from "../src/document"
import { memoryDocuments } from "./helpers"

describe("session documents", () => {
  it("creates idempotently and keeps sessions independent", async () => {
    const { documents } = memoryDocuments()
    expect(await documents.get("ses_a")).toBeNull()
    const first = await documents.create("ses_a")
    await documents.save("ses_a", first.revision, "# My edits", false)
    expect((await documents.create("ses_a")).markdown).toBe("# My edits")
    expect((await documents.create("ses_b")).markdown).toBe(INITIAL_MARKDOWN)
  })

  it("allows exactly one concurrent save against a revision", async () => {
    const { documents } = memoryDocuments()
    await documents.create("ses_a")
    const results = await Promise.allSettled([
      documents.save("ses_a", 1, "First edit", true),
      documents.save("ses_a", 1, "Second edit", true),
    ])
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1)
    const failed = results.find((result) => result.status === "rejected")
    expect(failed?.reason).toBeInstanceOf(RevisionConflict)
    expect((await documents.get("ses_a"))?.revision).toBe(2)
  })

  it("does not poison the lock after a rejected save", async () => {
    const { documents } = memoryDocuments()
    await documents.create("ses_a")
    await expect(documents.save("ses_a", 9, "wrong", true)).rejects.toBeInstanceOf(RevisionConflict)
    expect((await documents.save("ses_a", 1, "valid", true)).markdown).toBe("valid")
  })

  it("rejects malformed IDs and oversized content", async () => {
    const { documents } = memoryDocuments()
    await expect(documents.create("../another-document")).rejects.toThrow()
    await documents.create("ses_a")
    await expect(documents.save("ses_a", 1, "x".repeat(MAX_MARKDOWN + 1), true)).rejects.toThrow()
    expect((await documents.get("ses_a"))?.revision).toBe(1)
  })

  it("restores documents from durable storage", async () => {
    const { documents, storage } = memoryDocuments()
    await documents.create("ses_a")
    await documents.save("ses_a", 1, "Persistent", true)
    expect((await new Documents(storage).get("ses_a"))?.markdown).toBe("Persistent")
  })
})
