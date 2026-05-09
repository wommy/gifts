#!/usr/bin/env bun
// anchor-find — saga-25 missing-primitive: diagnose applyPatch anchor-drift.
// Pipes anchor via stdin; reports exact match / nearest-fuzzy / whitespace-drift.
//
// Usage:
//   bun scripts/anchor-find.ts <file> <<'EOF'
//   <expected anchor>
//   EOF
//
// Sister: 19e09e6e6f50495 retry-with-diagnostic doctrine (this is the missing tool that doctrine pointed at),
// 19e0928d4f3e8e6 PLOW-STOP-KICKOUT (3-fix-rule hits this BEFORE pivot), 19e094019bbb224 dial-not-rewrite.

import { readFileSync } from "node:fs"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["filesystem"]

const file = process.argv[2]
if (!file) { console.error("usage: bun scripts/anchor-find.ts <file> <stdin-anchor>"); process.exit(2) }
const anchor = readFileSync(0, "utf8").replace(/\n$/, "")
const haystack = readFileSync(file, "utf8")

// Exact match?
const idx = haystack.indexOf(anchor)
if (idx !== -1) {
  const lineNum = haystack.slice(0, idx).split("\n").length
  console.log(`EXACT match at line ${lineNum} (offset ${idx}, ${anchor.length} chars)`)
  process.exit(0)
}

// Whitespace-normalized fuzzy match
const norm = (s: string) => s.replace(/\s+/g, " ").trim()
const nAnchor = norm(anchor)
const nHaystack = norm(haystack)
const nIdx = nHaystack.indexOf(nAnchor)
if (nIdx !== -1) {
  console.log(`NORM-MATCH (whitespace-drift): anchor matches after whitespace normalization`)
  console.log(`  anchor (chars=${anchor.length}, normalized=${nAnchor.length}):`)
  console.log(`    ${JSON.stringify(anchor.slice(0, 80))}...`)
  console.log(`  hint: file may have different whitespace; try: cat -A ${file} | sed -n '<line>p'`)
  process.exit(1)
}

// Per-line nearest match
const anchorFirstLine = anchor.split("\n")[0] ?? ""
const lines = haystack.split("\n")
const candidates: { line: number; diff: number }[] = []
for (let i = 0; i < lines.length; i++) {
  const l = lines[i]!
  if (norm(l) === norm(anchorFirstLine)) {
    candidates.push({ line: i + 1, diff: l.length - anchorFirstLine.length })
  }
}
if (candidates.length > 0) {
  console.log(`NEAR-MATCH on first-line: ${candidates.length} candidates`)
  for (const c of candidates.slice(0, 5)) {
    console.log(`  line ${c.line}: char-diff=${c.diff}`)
    console.log(`    file: ${JSON.stringify(lines[c.line - 1]!.slice(0, 120))}`)
    console.log(`    want: ${JSON.stringify(anchorFirstLine.slice(0, 120))}`)
  }
  process.exit(1)
}

console.log(`NO MATCH — anchor first-line not found in file (after whitespace-normalize)`)
console.log(`  anchor first-line: ${JSON.stringify(anchorFirstLine.slice(0, 200))}`)
process.exit(1)
