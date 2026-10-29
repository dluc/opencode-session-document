import { describe, expect, it, vi } from "vitest"
import { memoryDocuments } from "./helpers"
import { INITIAL_MARKDOWN } from "../src/document"
import { Updater } from "../src/updater"
import { BRIEF_MAX_WORDS, KEEP_START, KEEP_END } from "../src/brief"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

async function fixture() {
  const { documents } = memoryDocuments()
  await documents.create("ses_a")
  const generate = vi.fn(async (_sessionID: string, _prompt: string) => "# Updated\n\nObjective recorded.")
  const changed = vi.fn(async () => {})
  const turn = vi.fn(async () => ({ id: "turn-1" }))
  const updater = new Updater(documents, turn, generate, changed, vi.fn())
  return { documents, generate, changed, turn, updater }
}

describe("background updater", () => {
  it("updates once per completed turn, even with repeated events", async () => {
    const { updater, documents, generate, changed } = await fixture()
    await Promise.all([updater.request("ses_a"), updater.request("ses_a")])
    await updater.request("ses_a")
    expect(generate).toHaveBeenCalledTimes(1)
    expect(changed).toHaveBeenCalledTimes(1)
    expect(await documents.get("ses_a")).toMatchObject({ revision: 2, source: "automatic", lastTurn: "turn-1" })
  })

  it("does not update sessions without a document, or paused documents", async () => {
    const { updater, documents, generate } = await fixture()
    await updater.request("ses_b")
    await documents.save("ses_a", 1, "Manual", false)
    await updater.request("ses_a")
    expect(generate).not.toHaveBeenCalled()
  })

  it("discards generated text if a manual save happened during generation", async () => {
    const { updater, documents, generate } = await fixture()
    const started = deferred<void>(), result = deferred<string>()
    generate.mockImplementation(async () => { started.resolve(); return result.promise })
    const job = updater.request("ses_a")
    await started.promise
    await documents.save("ses_a", 1, "# My authoritative manual edit", true)
    result.resolve("# Stale automated rewrite")
    await job
    expect((await documents.get("ses_a"))?.markdown).toBe("# My authoritative manual edit")
  })

  it("discards stale context and processes a newer turn", async () => {
    const { updater, documents, generate, turn } = await fixture()
    const started = deferred<void>(), result = deferred<string>()
    generate.mockImplementationOnce(async () => { started.resolve(); return result.promise })
    const job = updater.request("ses_a")
    await started.promise
    turn.mockResolvedValue({ id: "turn-2" })
    result.resolve("Stale")
    await job
    expect(generate).toHaveBeenCalledTimes(2)
    expect(await documents.get("ses_a")).toMatchObject({ lastTurn: "turn-2", markdown: "# Updated\n\nObjective recorded." })
  })

  it("persists failure without destroying content or retrying endlessly", async () => {
    const { updater, documents, generate } = await fixture()
    generate.mockRejectedValue(new Error("provider error containing a secret"))
    await updater.request("ses_a")
    await updater.request("ses_a")
    expect(generate).toHaveBeenCalledTimes(1)
    const document = await documents.get("ses_a")
    expect(document?.markdown).toBe(INITIAL_MARKDOWN)
    expect(document?.error).toContain("Automatic update failed")
    expect(JSON.stringify(document)).not.toContain("secret")
  })

  it("does not write an in-flight result after plugin cleanup", async () => {
    const { updater, documents, generate } = await fixture()
    const started = deferred<void>(), result = deferred<string>()
    generate.mockImplementation(async () => { started.resolve(); return result.promise })
    const job = updater.request("ses_a")
    await started.promise
    updater.stop()
    result.resolve("Too late")
    await job
    expect((await documents.get("ses_a"))?.revision).toBe(1)
  })

  it("does not generate while the global policy is disabled", async () => {
    const { documents, turn, generate, changed } = await fixture()
    const updater = new Updater(documents, turn, generate, changed, vi.fn(), async () => false)
    await updater.request("ses_a")
    expect(generate).not.toHaveBeenCalled()
  })

  it("discards an in-flight candidate when global settings change", async () => {
    const { documents, turn, generate, changed } = await fixture()
    let revision: number | false = 1
    const started = deferred<void>(), result = deferred<string>()
    generate.mockImplementation(async () => { started.resolve(); return result.promise })
    const updater = new Updater(documents, turn, generate, changed, vi.fn(), async () => revision)
    const job = updater.request("ses_a")
    await started.promise
    revision = false
    result.resolve("Disabled while generating")
    await job
    expect((await documents.get("ses_a"))?.revision).toBe(1)
    expect(changed).not.toHaveBeenCalled()
  })

  it("condenses an existing long document on the next update", async () => {
    const { updater, documents, generate } = await fixture()
    await documents.save("ses_a", 1, "Old detail. ".repeat(1000), true)
    await updater.request("ses_a")
    expect(generate.mock.calls[0]?.[1]).toContain("CURRENT-STATE BRIEF")
    expect(generate.mock.calls[0]?.[1]).toContain("must be condensed")
    expect((await documents.get("ses_a"))?.markdown).toBe("# Updated\n\nObjective recorded.")
  })

  it("makes one shortening request for an overlong answer", async () => {
    const { updater, documents, generate } = await fixture()
    generate.mockResolvedValueOnce("word ".repeat(BRIEF_MAX_WORDS + 1))
    await updater.request("ses_a")
    expect(generate).toHaveBeenCalledTimes(2)
    expect(generate.mock.calls[1]?.[1]).toContain("previous output was rejected")
    expect((await documents.get("ses_a"))?.markdown).toBe("# Updated\n\nObjective recorded.")
  })

  it("keeps the original and stops retrying if both answers exceed the budget", async () => {
    const { updater, documents, generate } = await fixture()
    generate.mockResolvedValue("word ".repeat(BRIEF_MAX_WORDS + 1))
    await updater.request("ses_a")
    await updater.request("ses_a")
    expect(generate).toHaveBeenCalledTimes(2)
    const document = await documents.get("ses_a")
    expect(document?.markdown).toBe(INITIAL_MARKDOWN)
    expect(document?.error).toContain("concise brief")
    expect(document?.revision).toBe(1)
  })

  it("preserves pinned manual notes exactly even when they exceed the brief budget", async () => {
    const { updater, documents } = await fixture()
    const note = `${KEEP_START}\n## My notes\n${"Important personal note. ".repeat(250)}\n${KEEP_END}`
    await documents.save("ses_a", 1, `# Old brief\n\n${note}`, true)
    await updater.request("ses_a")
    expect((await documents.get("ses_a"))?.markdown).toBe(`# Updated\n\nObjective recorded.\n\n${note}`)
  })

  it("does not shorten against a document saved manually during the first attempt", async () => {
    const { updater, documents, generate } = await fixture()
    const started = deferred<void>(), result = deferred<string>()
    generate.mockImplementation(async () => { started.resolve(); return result.promise })
    const job = updater.request("ses_a")
    await started.promise
    await documents.save("ses_a", 1, "New manual edit", true)
    result.resolve("word ".repeat(BRIEF_MAX_WORDS + 1))
    await job
    expect(generate).toHaveBeenCalledTimes(1)
    expect((await documents.get("ses_a"))?.markdown).toBe("New manual edit")
  })

  it("does not save a shortening result over a manual edit", async () => {
    const { updater, documents, generate } = await fixture()
    const started = deferred<void>(), result = deferred<string>()
    generate.mockResolvedValueOnce("word ".repeat(BRIEF_MAX_WORDS + 1))
      .mockImplementationOnce(async () => { started.resolve(); return result.promise })
    const job = updater.request("ses_a")
    await started.promise
    await documents.save("ses_a", 1, "A newer edit", true)
    result.resolve("# Shorter, but stale")
    await job
    expect((await documents.get("ses_a"))?.markdown).toBe("A newer edit")
  })
})
