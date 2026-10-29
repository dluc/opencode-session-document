import { Rpc } from "@opencode/plugin/rpc"
import { z } from "zod"
import { Document, MAX_MARKDOWN, SessionID } from "./document"
import { Preferences } from "./preferences"

const target = z.object({ sessionID: SessionID })
export const SessionDocuments = Rpc.define({
  id: "session-document",
  methods: {
    preferences: { input: z.object({}), output: Preferences },
    configure: { input: z.object({ enabled: z.boolean() }), output: Preferences },
    get: { input: target, output: Document.nullable() },
    create: { input: target, output: Document },
    save: {
      input: target.extend({
        revision: z.number().int().nonnegative(),
        markdown: z.string().max(MAX_MARKDOWN), automatic: z.boolean(),
      }),
      output: Document,
      errors: { conflict: Document },
    },
    refresh: { input: target, output: z.null() },
  },
  events: {
    changed: { schema: target },
    preferencesChanged: { schema: z.object({}) },
  },
})
