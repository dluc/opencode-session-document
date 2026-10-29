import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"

/** Disclose bundled third-party components; this is not an approval or security audit. */
export function components(target: string): Plugin {
  return {
    name: `session-document-components-${target}`,
    generateBundle(_options, bundle) {
      const packages = new Map<string, { name: string; version: string; license: string; directory: string }>()
      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk") continue
        for (const id of Object.keys(output.modules)) {
          if (!id.replaceAll("\\", "/").includes("/node_modules/")) continue
          let directory = path.dirname(id.split("?")[0])
          while (directory !== path.dirname(directory)) {
            const filename = path.join(directory, "package.json")
            if (existsSync(filename)) {
              try {
                const manifest = JSON.parse(readFileSync(filename, "utf8"))
                if (manifest.name && manifest.version) {
                  packages.set(`${manifest.name}@${manifest.version}`, {
                    name: manifest.name, version: manifest.version,
                    license: typeof manifest.license === "string" ? manifest.license : "See upstream license",
                    directory,
                  })
                  break
                }
              } catch { /* Continue to the parent for virtual or nested package roots. */ }
            }
            directory = path.dirname(directory)
          }
        }
      }
      const sorted = [...packages.values()].sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version))
      this.emitFile({
        type: "asset", fileName: `${target}.components.json`,
        source: JSON.stringify({
          target,
          note: "Bundled component inventory, not a complete SBOM or approval statement. GUI host-provided modules are not bundled.",
          components: sorted.map(({ directory: _directory, ...component }) => component),
        }, null, 2) + "\n",
      })
      const notices = sorted.map(component => {
        const files = readdirSync(component.directory, { withFileTypes: true })
          .filter(entry => entry.isFile() && /^(licen[cs]e|notice|copying)([-.]|$)/i.test(entry.name))
          .sort((a, b) => a.name.localeCompare(b.name))
        const text = files.map(file => `${file.name}\n${readFileSync(path.join(component.directory, file.name), "utf8")}`).join("\n\n")
        return `${component.name}@${component.version}\nLicense: ${component.license}\n${text || "No root license text found; consult the upstream package."}`
      }).join("\n\n------------------------------------------------------------\n\n")
      this.emitFile({ type: "asset", fileName: `${target}.third-party.txt`, source: notices + "\n" })
    },
  }
}
