#!/usr/bin/env bun
// cdmgr-search — friendly wrapper over tools/codemogger/src/cli.ts (saga-26 dial 19e0a8ebb234f8f cure).
// Defaults to hybrid-mode (semantic + keyword), filters /refs/, structured/JSON output.
//
// Usage:
//   bun scripts/cdmgr-search.ts <q>                            # default hybrid, limit 10, here-filter
//   bun scripts/cdmgr-search.ts <q> --semantic --limit 30      # semantic-only, more hits
//   bun scripts/cdmgr-search.ts <q> --keyword                  # exact-text only
//   bun scripts/cdmgr-search.ts <q> --snippet                  # include code preview
//   bun scripts/cdmgr-search.ts <q> --threshold 0.7            # min score filter
//   bun scripts/cdmgr-search.ts <q> --json                     # raw JSON stdout (pipe-friendly)
//   bun scripts/cdmgr-search.ts <q> --no-here                  # include /refs/ + external (default: exclude)
//
// Sister: 19e08afe06f8d97 unix-philo, 19e05edae82c971 cdmgr-CLI-over-MCP, 19e0a8ebb2307c6 mode-discriminator.
import { run } from "./lib/proc.ts"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["codemogger"]

const args = process.argv.slice(2)
const query = args[0]
if (!query || query.startsWith("--")) { console.error("usage: cdmgr-search <q> [--semantic|--keyword|--hybrid] [--limit N] [--snippet] [--threshold F] [--json] [--no-here]"); process.exit(2) }

const has = (f: string) => args.includes(f)
const get = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined }
const mode = has("--semantic") ? "semantic" : has("--keyword") ? "keyword" : has("--hybrid") ? "hybrid" : (get("--mode") ?? "hybrid")
const limit = get("--limit") ?? "10"
const threshold = get("--threshold")
const snippet = has("--snippet")
const asJson = has("--json")
const here = !has("--no-here")

const cmdParts = [`bun run tools/codemogger/src/cli.ts search ${JSON.stringify(query)} --mode ${mode} --limit ${limit} --format json`]
if (snippet) cmdParts.push("--snippet")
if (threshold) cmdParts.push(`--threshold ${threshold}`)
const r = run(cmdParts.join(" "))
let hits: any[] = JSON.parse(r.stdout || "[]")
if (here) hits = hits.filter(h => !h.path?.includes("/refs/") && !h.path?.includes("/node_modules/"))

if (asJson) { console.log(JSON.stringify(hits, null, 2)); process.exit(0) }
for (const h of hits) {
  const tag = h.score !== undefined ? ` [${h.score?.toFixed?.(2) ?? h.score}]` : ""
  console.log(`${h.path}:${h.lineStart}-${h.lineEnd}${tag}  [${h.kind ?? "?"}] ${h.name ?? "?"}`)
  if (snippet && h.snippet) {
    for (const line of h.snippet.split("\n").slice(0, 6)) console.log(`    ${line}`)
  }
}
