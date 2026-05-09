#!/usr/bin/env bun
// detect — unified evergreen-scar detector dispatcher.
// Usage: bun scripts/detect.ts [--name <det>] [--all]
// Sister: scripts/test.ts dispatcher pattern, lib/detector-registry.ts.

import { detectorMain, runDetector, renderDetector } from "./lib/detector.ts"
import { DETECTORS } from "./lib/detector-registry.ts"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["arq"]

const args = process.argv.slice(2)
const ni = args.indexOf("--name")
const NAME = ni >= 0 ? args[ni + 1] : null
const ALL = args.includes("--all") || !NAME

if (NAME) {
  const det = DETECTORS.find(d => d.name === NAME)
  if (!det) { console.error(`unknown detector: ${NAME}. Available: ${DETECTORS.map(d => d.name).join(", ")}`); process.exit(2) }
  detectorMain(det)
} else if (ALL) {
  console.log(`# detect — running ${DETECTORS.length} evergreen-scar detectors\n`)
  for (const det of DETECTORS) {
    const r = await runDetector(det)
    console.log(`## ${det.name} (${r.suspects.length} suspects)`)
    const totals = [...r.bySaga.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    console.log(totals.map(([s, n]) => `  saga-${s}: ${n}`).join("\n"))
    console.log()
  }
}
