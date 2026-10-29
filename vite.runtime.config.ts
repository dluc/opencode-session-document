import { isBuiltin } from "node:module"
import { defineConfig } from "vite"
import { components } from "./build/components"

export default defineConfig(({ mode }) => {
  const target = mode === "rpc" ? "rpc" : "server"
  return {
    plugins: [components(target)],
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: {
      target: "es2022", outDir: "dist", emptyOutDir: false,
      lib: {
        entry: target === "rpc" ? "src/rpc.ts" : "src/index.ts",
        formats: ["es"], fileName: () => `${target}.js`,
      },
      rollupOptions: {
        // Only runtime-provided built-ins may remain external. npm packages,
        // including the SDK helpers and validators, are bundled into each file.
        external: (id) => isBuiltin(id) || id === "bun",
        output: { inlineDynamicImports: true },
      },
    },
  }
})
