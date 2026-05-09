#!/usr/bin/env bun
// saga-walk — extract previous-saga-cap's actual invocations of a tool from session jsonl.
// Cure-of-cure when stuck on a tool/CLI.
// Usage: bun scripts/scratch/saga-walk.ts <jsonl-path> <tool-pattern> [--n N]
import { readFileSync } from "node:fs"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["filesystem"]
const args = process.argv.slice(2)
const jsonlPath = args[0]
const pattern = args[1]
const ni = args.indexOf("--n")
const n = ni >= 0 ? +(args[ni + 1] ?? 15) : 15
if (!jsonlPath || !pattern) { console.error("usage: saga-walk <jsonl-path> <tool-pattern> [--n N]"); process.exit(2) }
const re = new RegExp(pattern)
const cmds: string[] = []
for (const line of readFileSync(jsonlPath, "utf8").split("\n")) {
  if (!line) continue
  try {
    const j = JSON.parse(line)
    const content = j?.message?.content
    if (!Array.isArray(content)) continue
    for (const c of content) {
      if (c?.type === "tool_use" && typeof c?.input?.command === "string" && re.test(c.input.command)) {
        cmds.push(c.input.command)
      }
    }
  } catch {}
  if (cmds.length >= n) break
}
for (const cmd of cmds.slice(0, n)) console.log(cmd)
