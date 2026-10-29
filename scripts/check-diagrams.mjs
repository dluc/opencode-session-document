// Real Chromium rendering, without an additional browser-test dependency.
// Set CHROME_BIN to a Chrome/Chromium executable when it is not in the local cache.
import { createServer } from "vite"
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises"
import { homedir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const cache = path.join(homedir(), ".cache", "puppeteer", "chrome")
const versions = await readdir(cache).catch(() => [])
const candidates = [process.env.CHROME_BIN, ...versions.reverse().map((version) => path.join(cache, version, "chrome-linux64/chrome")), "/usr/bin/chromium", "/usr/bin/google-chrome"]
const executable = candidates.find((candidate) => candidate && existsSync(candidate))
if (!executable) throw new Error("Set CHROME_BIN to a Chrome or Chromium executable to run diagram browser checks.")
await mkdir(path.join(root, "node_modules/.cache"), { recursive: true })
const profile = await mkdtemp(path.join(root, "node_modules/.cache/diagram-browser-"))
const server = await createServer({ configFile: false, root, server: { host: "127.0.0.1", port: 0 } })
await server.listen()
const port = server.httpServer.address().port
const browser = spawn(executable, ["--headless", "--no-sandbox", "--no-proxy-server", "--disable-gpu", "--disable-dev-shm-usage", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] })
let socket
const overallTimeout = setTimeout(() => { console.error("Diagram browser checks timed out."); browser.kill() }, 60_000)
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = ""
    browser.stderr.on("data", (chunk) => {
      output += chunk
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/)
      if (match) resolve(match[1])
    })
    browser.on("exit", (code) => reject(new Error(`Chrome exited before connecting: ${code}`)))
  })
  socket = new WebSocket(endpoint)
  await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }))
  let nextID = 0
  const pending = new Map()
  const events = new Map()
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data)
    if (message.id) {
      const job = pending.get(message.id)
      if (!job) return
      pending.delete(message.id)
      if (message.error) job.reject(new Error(message.error.message))
      else job.resolve(message.result)
    } else for (const handler of events.get(message.method) ?? []) handler(message)
  })
  socket.addEventListener("close", () => {
    for (const job of pending.values()) job.reject(new Error("Browser connection closed"))
    pending.clear()
  })
  const call = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++nextID
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
  })
  const { targetId } = await call("Target.createTarget", { url: "about:blank" })
  const { sessionId } = await call("Target.attachToTarget", { targetId, flatten: true })
  await call("Page.enable", {}, sessionId)
  await call("Runtime.enable", {}, sessionId)
  events.set("Runtime.exceptionThrown", [(event) => console.error(event.params.exceptionDetails.exception?.description ?? event.params.exceptionDetails.text)])
  const loaded = new Promise((resolve) => events.set("Page.loadEventFired", [resolve]))
  const navigation = await call("Page.navigate", { url: `http://127.0.0.1:${port}/tests/browser/diagrams.html` }, sessionId)
  if (navigation.errorText) throw new Error(navigation.errorText)
  await loaded
  const result = await call("Runtime.evaluate", { expression: "window.diagramChecks", awaitPromise: true, returnByValue: true }, sessionId)
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
  if (!result.result.value) throw new Error("Browser fixture did not produce results")
  console.log(JSON.stringify(result.result.value, null, 2))
  if (!result.result.value.passed) throw new Error("Diagram browser checks failed")
} finally {
  clearTimeout(overallTimeout)
  socket?.close()
  browser.kill()
  await server.close()
  await rm(profile, { recursive: true, force: true }).catch(() => {})
}
