// Capture the real panel in an isolated browser using fictional data only.
import assert from "node:assert/strict"
import { createServer } from "vite"
import solid from "vite-plugin-solid"
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const cache = path.join(homedir(), ".cache", "puppeteer", "chrome")
const versions = await readdir(cache).catch(() => [])
const executable = [process.env.CHROME_BIN, ...versions.reverse().map(version => path.join(cache, version, "chrome-linux64/chrome")), "/usr/bin/chromium", "/usr/bin/google-chrome"]
  .find(candidate => candidate && existsSync(candidate))
assert(executable, "Set CHROME_BIN to a Chrome/Chromium executable")
await mkdir(path.join(root, "node_modules/.cache"), { recursive: true })
const profile = await mkdtemp(path.join(root, "node_modules/.cache/readme-browser-"))
const server = await createServer({ configFile: false, root, plugins: [solid()], server: { host: "127.0.0.1", port: 0 } })
await server.listen()
const browser = spawn(executable, ["--headless", "--no-sandbox", "--no-proxy-server", "--disable-gpu", "--disable-dev-shm-usage", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] })
let socket
const timer = setTimeout(() => browser.kill(), 90_000)
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = ""
    browser.stderr.on("data", chunk => {
      output += chunk
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/)
      if (match) resolve(match[1])
    })
    browser.on("exit", code => reject(new Error(`Chrome exited: ${code}`)))
  })
  socket = new WebSocket(endpoint)
  await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }))
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
    } else for (const callback of events.get(message.method) ?? []) callback(message)
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
  await call("Network.enable", {}, sessionId)
  const externalRequests = []
  events.set("Network.requestWillBeSent", [event => {
    const url = new URL(event.params.request.url)
    if (["http:", "https:", "ws:", "wss:"].includes(url.protocol) && !["127.0.0.1", "localhost"].includes(url.hostname)) externalRequests.push(url.origin)
  }])
  await call("Emulation.setDeviceMetricsOverride", { width: 684, height: 780, deviceScaleFactor: 2, mobile: false }, sessionId)
  events.set("Runtime.exceptionThrown", [event => console.error(event.params.exceptionDetails.exception?.description ?? event.params.exceptionDetails.text)])
  const loaded = new Promise(resolve => events.set("Page.loadEventFired", [resolve]))
  const navigation = await call("Page.navigate", { url: `http://127.0.0.1:${server.httpServer.address().port}/tests/browser/panel-demo.html` }, sessionId)
  assert(!navigation.errorText, navigation.errorText)
  await loaded
  const rendered = await call("Runtime.evaluate", { expression: "window.demoReady", awaitPromise: true, returnByValue: true }, sessionId)
  assert(!rendered.exceptionDetails, rendered.exceptionDetails?.exception?.description)
  const demo = rendered.result.value
  assert(demo?.text.toLowerCase().includes("fictional demo content"))
  assert(demo.text.includes("Project search") && demo.text.includes("Edit document") && demo.text.includes("Diagram source"))
  const labels = demo.labels.replace(/\s+/g, "")
  assert(labels.includes("Searchquery") && labels.includes("Showemptystate"), "Demo diagram labels are missing")
  assert(demo.nodeLabelsAligned, "Demo diagram labels overflow their nodes")
  assert.equal(externalRequests.length, 0, "The fictional demo made an external network request")
  assert(!/(?:https?:\/\/|[\w.+-]+@[\w.-]+|\/(?:home|Users|opt)\/)/i.test(demo.text), "Unexpected identifying text in the demo")
  const metrics = await call("Page.getLayoutMetrics", {}, sessionId)
  const captured = await call("Page.captureScreenshot", {
    format: "png", captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: 684, height: Math.ceil(metrics.cssContentSize.height), scale: 1 },
  }, sessionId)
  const image = Buffer.from(captured.data, "base64")
  assert(image.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
  const chunks = []
  for (let offset = 8; offset < image.length;) {
    const length = image.readUInt32BE(offset)
    const type = image.toString("ascii", offset + 4, offset + 8)
    chunks.push(type)
    assert(!["tEXt", "zTXt", "iTXt", "eXIf"].includes(type), "Image contains embedded text/EXIF metadata")
    offset += length + 12
  }
  const output = path.join(root, "docs/images/session-document.png")
  await mkdir(path.dirname(output), { recursive: true })
  await writeFile(output, image)
  console.log(JSON.stringify({ screenshot: "docs/images/session-document.png", width: image.readUInt32BE(16), height: image.readUInt32BE(20), bytes: image.length, fictionalDataOnly: true, externalPageRequests: externalRequests.length, embeddedTextOrExifMetadata: false, pngChunks: [...new Set(chunks)] }, null, 2))
} finally {
  clearTimeout(timer)
  socket?.close()
  browser.kill()
  await server.close()
  await rm(profile, { recursive: true, force: true }).catch(() => {})
}
