// scripts/lib/safe-patch.ts (saga-25 gravity-well — cures 16 captain TYPE-1 dial-loop scars).
// Wraps applyPatch with auto-diagnostic-on-fail. When anchor doesn't match, runs anchor-find
// internally + returns structured DiagnosticResult instead of just throwing.
//
// Sister: 19e09e6e6f50495 retry-with-diagnostic doctrine, 19e09ead354f322 3rd-OP-BOOM (anchor-find ship),
// 19e09bf67bc58fc CAP-CURE-PAIR #25 tool-vs-script.

import { applyPatch, type PatchOp, type PatchReport } from "./surgical-patch.ts"
import { readFileSync } from "node:fs"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["filesystem"]

export interface SafePatchResult {
  ok: boolean
  report?: PatchReport
  failedAt?: number          // index of first op that failed
  diagnostic?: AnchorDiagnostic
  error?: string
}

export interface AnchorDiagnostic {
  match: "EXACT" | "NORM-MATCH" | "NEAR-MATCH" | "NO-MATCH"
  line?: number
  candidates?: { line: number; charDiff: number; sample: string }[]
  hint?: string
}

const norm = (s: string) => s.replace(/\s+/g, " ").trim()

export function diagnoseAnchor(filePath: string, anchor: string): AnchorDiagnostic {
  const haystack = readFileSync(filePath, "utf8")
  const idx = haystack.indexOf(anchor)
  if (idx !== -1) {
    return { match: "EXACT", line: haystack.slice(0, idx).split("\n").length }
  }
  const nIdx = norm(haystack).indexOf(norm(anchor))
  if (nIdx !== -1) {
    return { match: "NORM-MATCH", hint: "whitespace-drift; cure: cat -A and align" }
  }
  const firstLine = anchor.split("\n")[0] ?? ""
  const lines = haystack.split("\n")
  const candidates: AnchorDiagnostic["candidates"] = []
  for (let i = 0; i < lines.length; i++) {
    if (norm(lines[i]!) === norm(firstLine)) {
      candidates.push({ line: i + 1, charDiff: lines[i]!.length - firstLine.length, sample: lines[i]!.slice(0, 100) })
    }
  }
  if (candidates.length > 0) return { match: "NEAR-MATCH", candidates }
  return { match: "NO-MATCH" }
}

/** applyPatch with auto-diagnostic. Returns SafePatchResult instead of throwing on anchor-fail. */
export async function safeApplyPatch(filePath: string, ops: PatchOp[]): Promise<SafePatchResult> {
  try {
    const report = await applyPatch(filePath, ops)
    return { ok: true, report }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e)
    // Identify which op failed (parse from error message)
    const m = err.match(/op\[(\d+)\]/)
    const failedAt = m ? +m[1]! : 0
    const failedOp = ops[failedAt]
    if (!failedOp) return { ok: false, failedAt, error: err }
    const diagnostic = diagnoseAnchor(filePath, failedOp.anchor)
    return { ok: false, failedAt, diagnostic, error: err }
  }
}
