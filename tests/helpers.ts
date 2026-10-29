import { Documents } from "../src/document"

export function memoryDocuments() {
  const data = new Map<string, unknown>()
  const storage = {
    get: async (key: string) => structuredClone(data.get(key)),
    set: async (key: string, value: unknown) => { data.set(key, structuredClone(value)) },
  }
  return { documents: new Documents(storage), storage }
}
