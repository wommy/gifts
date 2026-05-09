#!/usr/bin/env bun
// cap-prep — saga-26 final-shape: 5-substrate cold-start orientation tool.
// Composes (1) dyad-tail-dingleberries + saga-walk-scars + arq-doctrine-mine + cdmgr-search,
// (2) gift-evidence projection (witness counts), (3) scar-doctrine-pair (orphan-cure audit),
// (4) lexicon (operator-coined gravity-wells), (5) scripts-corpus (corpus-topology).
// --close mode: forcing-function exit-non-zero on prior close-claims (TYPE-1 #12 cure).
//
// Usage:
//   bun scripts/cap-prep.ts [--saga N] [--prev-sess <jsonl>]
//   bun scripts/cap-prep.ts --detect       # 5-substrate cold-start
//   bun scripts/cap-prep.ts --close --saga N [--force]  # saga-close ritual
//
// Sister: 19e09f5e6e7b99a dial-loop-toolbox (sibling), 19e08a25f6d9c4c dingleberries-projection,
// 19e09a54d8e412b doctrine-without-execution (this script IS execution for prep-discipline),
// 19e08afe06f8d97 unix-philo (composes 4 atoms).

import { run, runCmd } from "./lib/proc.ts"
import { renderSections, type Section } from "./lib/section-report.ts"
import { ARQ_LOG, readEvents, arqProjection, type Event, type IdEvent } from "./lib/arq.ts"
import { sagaWindows } from "./projections/saga-debrief.ts"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
// cap-prep --detect orchestrator: composes projections requiring arq + filesystem + (cdmgr indirectly via projections)
export const substrateRequires = ["arq", "filesystem"]

const args = process.argv.slice(2)
const sagaIdx = args.indexOf("--saga")
const sessIdx = args.indexOf("--prev-sess")
const SAGA = sagaIdx >= 0 ? args[sagaIdx + 1] : "26"
const PREV_SESS = sessIdx >= 0 ? args[sessIdx + 1] : null

// 1. dingleberries — unaddressed asides in CURRENT session
const dingles = run(`bun scripts/dyad-tail.ts --all --dingleberries 2>&1 | head -25`).stdout

// 2. previous-saga session walk — scars, type-1s, doctrines that captain coined
const prevSessDefault = `${process.env.HOME}/.claude/projects/-home-wom-infra-glom-MR/fbf36644-d9f1-43b2-b62e-2e7f4c5eafee.jsonl`
const sessFile = PREV_SESS ?? prevSessDefault
const prevScars = run(`bun scripts/saga-walk.ts ${sessFile} "scar|TYPE-1|self-catch" --n 8 2>&1`).stdout
const prevDoctrines = run(`bun scripts/saga-walk.ts ${sessFile} "doctrine.*saga-2" --n 10 2>&1 | head -30`).stdout

// 3. hot doctrines from arq (prior sagas)
const corpus = await arqProjection.get()
const events = corpus.events as Event[]

// --close flag: saga-N close-ritual (cures multi-close-fragmentation 14x cross-saga 19e08fcdc1bffda).
if (args.includes("--close")) {
  const tag = "saga-" + SAGA
  const existingCloses = events.filter(e => {
    if (e.type !== "saga-entry" && e.type !== "heading-shipped") return false
    if (!e.text?.includes(tag)) return false
    return /\b(closed|final|true.?close|saga.?close)\b/i.test(e.text)
  })
  console.log("\n# saga-" + SAGA + " close-ritual\n")
  console.log("Existing close-claims: " + existingCloses.length)
  for (const e of existingCloses.slice(-5)) console.log("  " + (e as any).id + " [" + e.type + "] " + e.text.slice(0, 100))
  if (existingCloses.length > 0) {
    console.log("\nERROR: " + existingCloses.length + " prior close-claims. Multi-close-fragmentation 14x cross-saga (19e08fcdc1bffda).")
    console.log("Cure: bank CONSOLIDATING saga-entry per RETRO-CLOSE pattern (19e088a19aeccad), not new close.")
    console.log("Override: --force to bypass exit-non-zero (saga-26 TYPE-1 #12 cure 19e0adc31893b62 forcing-function).")
    if (!args.includes("--force")) process.exit(2)
  } else {
    console.log("No prior closes - clean to bank single close-event when saga genuinely ended.")
  }
  process.exit(0)
}
const sagaPrev = String(parseInt(SAGA) - 1)
const hotDoctrines = (corpus.byType.get("doctrine") ?? [])
  .filter(e => e.text.includes(`saga-${sagaPrev}`) || e.text.includes(`saga-2${sagaPrev[0] === "2" ? sagaPrev[1] ?? "" : ""}`))
  .slice(-10)
  .map(e => `- ${(e as any).id ?? "?"} ${e.text.slice(0, 150)}`)
  .join("\n")

// 4. saga-N inbox punts (queued FOR current saga by previous saga)
const inboxPunts = (corpus.byType.get("inbox") ?? [])
  .filter(e => e.text.includes(`saga-${SAGA}`))
  .slice(-15)
  .map(e => `- ${(e as any).id ?? "?"} ${e.text.slice(0, 130)}`)
  .join("\n")

// 5. current saga TOP-cited doctrines (substrate gravity-wells)
const myCited = run(`bun scripts/projections/outline.ts saga-${SAGA} 2>&1 | sed -n '/Most-cited/,/^---/p' | head -12`).stdout

const sections: Section[] = [
  { title: `Own-session dingleberries (unaddressed asides)`, body: dingles.slice(0, 1500) || "(none)" },
  { title: `Prev-saga (saga-${sagaPrev}) scars / TYPE-1s / self-catches`, body: prevScars.slice(0, 1200) || "(none)" },
  { title: `Prev-saga (saga-${sagaPrev}) doctrines coined`, body: prevDoctrines.slice(0, 1500) || "(none)" },
  { title: `Hot doctrines (arq saga-${sagaPrev}, last 10)`, body: hotDoctrines || "(none)" },
  { title: `Saga-${SAGA} inbox punts queued for this cap (last 15)`, body: inboxPunts || "(none)" },
  { title: `Current-saga top-cited (gravity-wells from outline.ts)`, body: myCited || "(none)" },
]

console.log(`# cap-prep — saga-${SAGA} handoff context\n`)
console.log(await renderSections(sections, { titleFmt: t => `## ${t}` }))

// --detect flag: run evergreen-scar detectors (multi-close + 1-witness + cross-saga shimmer)
if (args.includes("--detect")) {
  console.log(`\n# evergreen-scar detectors\n`)
  console.log(run("bun scripts/detect.ts --all 2>&1").stdout)
  console.log(run("bun scripts/scar-destroyer.ts --latent 2>&1 | head -10").stdout)
  console.log(run("bun scripts/full-arq-mine.ts --type scar --top 5 2>&1 | tail -25").stdout)
  console.log(`\n# gift-evidence (low-witness gifts — discoverability + stale-cure)\n`)
  console.log(run("bun scripts/projections/gift-evidence.ts --stdout 2>&1 | grep -E \"^## |^Total:\" | head -25").stdout)
  console.log(`\n# scar-doctrine-pair audit (orphan-scars = ACTIONABLE cure-work pending)\n`)
  console.log(run("bun scripts/projections/scar-doctrine-pair.ts --stdout 2>&1 | grep -E \"^Total scars|Pair-rate|Orphan|Paired\" | head -10").stdout)
  console.log(`\n# lexicon (operator-coined terms — top 10)\n`)
  console.log(run("bun scripts/projections/lexicon.ts --stdout 2>&1 | head -16 | tail -12").stdout)
  console.log(`\n# scripts-corpus topology (top hubs + orphan-watch)\n`)
  console.log(run("bun scripts/projections/scripts-corpus.ts --stdout 2>&1 | tail -25").stdout)
}

// --cascade flag: walk last N saga-windows showing per-saga win-density
if (args.includes("--cascade")) {
  const ci = args.indexOf("--cascade")
  const N = parseInt(args[ci + 1] ?? "5") || 5
  const windows = sagaWindows(events)
  const recent = windows.slice(-N)
  console.log(`\n# cascade win-mine — last ${N} saga-windows\n`)
  for (const w of recent) {
    const inWin = (events as IdEvent[]).filter(e => {
      if (w.startTs !== undefined && e.ts <= w.startTs) return false
      if (w.endTs !== undefined && e.ts > w.endTs) return false
      return true
    })
    const wins = inWin.filter(e => e.type === "heading-shipped" || e.type === "boom")
    const booms = inWin.filter(e => e.type === "boom")
    console.log(`## ${w.label} — ${wins.length} wins / ${booms.length} booms / ${inWin.length} total`)
    for (const win of wins.slice(0, 5)) console.log(`  ${win.id} [${win.type}] ${win.text.slice(0, 110)}`)
    if (wins.length > 5) console.log(`  ...+${wins.length - 5}`)
    console.log()
  }
}
