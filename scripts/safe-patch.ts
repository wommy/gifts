#!/usr/bin/env bun
// safe-patch — CLI wrapper over lib/safe-patch.ts:safeApplyPatch.
// Cures the dial-loop: anchor-drift gets diagnosed-not-thrown.
//
// Usage:
//   bun scripts/safe-patch.ts <file> --anchor <anchor> --replace <replace>
//   bun scripts/safe-patch.ts <file> --json '[{"anchor":"...","replace":"..."}]'
//
// Sister: scripts/anchor-find.ts (sister-pattern atom), 19e09e6e6f50495 retry-with-diagnostic doctrine.

import { safeApplyPatch } from "./lib/safe-patch.ts"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["filesystem"]

const args = process.argv.slice(2)
const file = args[0]
if (!file) { console.error("usage: bun scripts/safe-patch.ts <file> {--anchor <a> --replace <r> | --json <ops-json>}"); process.exit(2) }

const ji = args.indexOf("--json")
const ai = args.indexOf("--anchor")
const ri = args.indexOf("--replace")

let ops: { anchor: string; replace: string }[]
if (ji >= 0) ops = JSON.parse(args[ji + 1] ?? "[]")
else if (ai >= 0 && ri >= 0) ops = [{ anchor: args[ai + 1] ?? "", replace: args[ri + 1] ?? "" }]
else { console.error("need --json OR --anchor + --replace"); process.exit(2) }

const r = await safeApplyPatch(file, ops)
if (r.ok) {
  console.log(`OK: ${r.report?.ops} ops applied (${r.report?.delta > 0 ? "+" : ""}${r.report?.delta} bytes)`)
  process.exit(0)
}
console.error(`FAIL at op[${r.failedAt}]:`, r.error?.split("\n")[0])
if (r.diagnostic) {
  console.error(`diagnostic: match=${r.diagnostic.match}`)
  if (r.diagnostic.line) console.error(`  matched at line ${r.diagnostic.line}`)
  if (r.diagnostic.candidates) {
    console.error(`  ${r.diagnostic.candidates.length} near-match candidates:`)
    for (const c of r.diagnostic.candidates.slice(0, 3)) {
      console.error(`    line ${c.line} (char-diff ${c.charDiff}): ${c.sample}`)
    }
  }
  if (r.diagnostic.hint) console.error(`  hint: ${r.diagnostic.hint}`)
}
process.exit(1)
