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
assert(![...files].some((file) => /(^|\/)(node_modules|\.env)(\/|\.|$)/.test(file)), "Unexpected dependency or environment file")
assert(!manifest.scripts.prepare && !manifest.scripts.postinstall, "Native installation should not require a build hook")
const bundle = await readFile(new URL("../dist/gui-experimental.cjs", import.meta.url), "utf8")
assert(bundle.includes("exports.default"), "Desktop bundle has no CommonJS default export")
console.log(`Package checks passed: ${files.size} files; server, RPC, and prebuilt GUI exports present; no install-time build required.`)
