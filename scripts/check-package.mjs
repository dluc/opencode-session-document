import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { spawnSync } from "node:child_process"

const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"))
const npm = process.platform === "win32" ? "npm.cmd" : "npm"
const packed = spawnSync(npm, ["pack", "--dry-run", "--ignore-scripts", "--json"], {
  cwd: new URL("..", import.meta.url), encoding: "utf8",
})
assert.equal(packed.status, 0, packed.stderr || "npm pack failed")
const [result] = JSON.parse(packed.stdout)
const files = new Set(result.files.map((file) => file.path))
for (const [part, target] of Object.entries(manifest.exports)) {
  assert.equal(typeof target, "string", `Unexpected export shape: ${part}`)
  assert(files.has(target.replace(/^\.\//, "")), `Package is missing ${part}: ${target}`)
}
assert(files.has("dist/gui-experimental.cjs"), "Prebuilt desktop GUI is missing")
for (const field of ["dependencies", "optionalDependencies", "peerDependencies"]) {
  assert.equal(Object.keys(manifest[field] ?? {}).length, 0, `Installable package must not require ${field} from an npm feed`)
}
assert(![...files].some((file) => /(^|\/)(node_modules|\.env)(\/|\.|$)/.test(file)), "Unexpected dependency or environment file")
// npm's Git fetcher prepares packages that declare any of these scripts, even
// when the GUI is already built. Keep development builds named `build:gui`.
for (const hook of ["build", "prepare", "prepack", "preinstall", "install", "postinstall"]) {
  assert(!manifest.scripts[hook], `Git installation must not trigger the ${hook} preparation hook`)
}
assert(!manifest.workspaces, "Git installation must not require workspace preparation")
const bundle = await readFile(new URL("../dist/gui-experimental.cjs", import.meta.url), "utf8")
assert(bundle.includes("exports.default"), "Desktop bundle has no CommonJS default export")
for (const target of ["server", "rpc"]) {
  const source = await readFile(new URL(`../dist/${target}.js`, import.meta.url), "utf8")
  // A data URL has no parent node_modules directory: leaked package or relative
  // imports fail resolution instead of accidentally using this checkout's deps.
  let loaded
  try { loaded = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`) }
  catch (error) { throw new Error(`${target} is not self-contained: ${String(error.message).slice(0, 300)}`) }
  if (target === "server") {
    assert.equal(loaded.default?.id, "session-document")
    assert.equal(typeof loaded.default?.setup, "function")
  } else assert.equal(loaded.SessionDocuments?.id, "session-document")
}
for (const target of ["server", "rpc", "gui"]) {
  assert(files.has(`dist/${target}.components.json`), `${target} inventory is missing`)
  assert(files.has(`dist/${target}.third-party.txt`), `${target} license notices are missing`)
}
console.log(`Package checks passed: ${files.size} files; self-contained server/RPC, prebuilt GUI, component inventories and license notices present; zero registry runtime dependencies or build hooks.`)
