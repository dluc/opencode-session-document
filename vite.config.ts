import { defineConfig } from "vite"
import { gui } from "@opencode/plugin/gui/vite"
import { components } from "./build/components"

export default defineConfig({ plugins: [gui(), components("gui")] })
