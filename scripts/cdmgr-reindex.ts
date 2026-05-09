#!/usr/bin/env bun
// cdmgr-reindex — CLI wrapper over lib/cdmgr-reindex:reindexBg.
// Streams progress to stdout. Saga-26 promoted from scratch tier per substrate-tier-ladder.
//
// Usage:
//   bun scripts/cdmgr-reindex.ts [target=.]
//   bun scripts/cdmgr-reindex.ts /path/to/project
import { reindexBg } from "./lib/cdmgr-reindex.ts"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["codemogger"]

const target = process.argv[2] ?? "."
console.log(`+ cdmgr reindex start: ${target}`)
const gen = reindexBg(target)
let result: { exit: number; ms: number } | undefined
while (true) {
  const r = await gen.next()
  if (r.done) { result = r.value; break }
  const tag = r.value.stream === "stderr" ? "[err]" : "    "
  console.log(`  ${tag} +${(r.value.ms / 1000).toFixed(1)}s  ${r.value.line}`)
}
console.log(`+ cdmgr reindex done: exit=${result?.exit} ${((result?.ms ?? 0) / 1000).toFixed(1)}s`)
process.exit(result?.exit ?? 0)
