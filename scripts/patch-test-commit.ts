#!/usr/bin/env bun
// scripts/patch-test-commit.ts (saga-25 op-coined)
// Meta primitive: orchestrate patch → test → commit cycle with TDD gate +
// systematic-debugging 3-fix-rule + verification-before-completion fresh-evidence.
//
// Lifts the patch+verify+commit refrain from saga-24/25 ships into one CLI.
// Replaces hand-spun "bun patch-script && bun test && bun saga-commit"
// chains where each step's failure mode is silent.
//
// Doctrine alignment:
//   /test-driven-development: --require-red ensures test is meaningful (FAILS without patch)
//   /systematic-debugging: 3-fix-rule via --max-retries; failure does NOT auto-fix
//   /verification-before-completion: prints actual stdout/exit-code; refuses commit on test-FAIL
//
// Sister: scripts/lib/surgical-patch.ts (saga-24 lift), scripts/saga-commit.ts (saga-24 lift)
// Doctrine: arq 19e088b67a0aef1 escape-hatch + 19e0888fd64df15 cure-pattern
//
// Usage:
//   bun scripts/patch-test-commit.ts \
//     --patch scripts/scratch/saga-X-patch.ts \
//     --test "bun test path/to/file.test.ts" \
//     --title "feat(saga-X): summary" \
//     --body "why this matters" \
//     --files path/to/file.ts path/to/file.test.ts \
//     --saga 25 \
//     [--require-red]                # TDD gate: first run MUST fail
//     [--rollback-on-fail]            # git checkout -- <files> on test FAIL after patch
//     [--max-retries N]               # systematic-debugging 3-fix-rule (default 0 = no retry)
//     [--sister-auto N]               # saga-commit doctrine pull
//     [--dry-run]                     # print plan, no patch/test/commit


// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["git","arq","filesystem"]
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { parseTestOutput } from "./test-triage.ts"
import { maybeFromJson } from "./lib/cli-io.ts"

interface Args {
  patch: string
  test: string
  title: string
  body: string
  files: string[]
  saga?: string
  requireRed: boolean
  rollbackOnFail: boolean
  maxRetries: number
  sisterAuto?: number
  dryRun: boolean
  ldgrBin?: string
  triageBaseline: boolean
  cdmgrVerify: boolean
}

function parseArgs(argv: string[]): Args {
  const a: Args = { patch: "", test: "", title: "", body: "", files: [], requireRed: false, rollbackOnFail: false, maxRetries: 0, dryRun: false, triageBaseline: false, cdmgrVerify: false }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]
    const v = argv[i + 1]
    switch (k) {
      case "--patch": a.patch = v ?? ""; i++; break
      case "--test": a.test = v ?? ""; i++; break
      case "--title": a.title = v ?? ""; i++; break
      case "--body": a.body = v ?? ""; i++; break
      case "--saga": a.saga = v; i++; break
      case "--require-red": a.requireRed = true; break
      case "--rollback-on-fail": a.rollbackOnFail = true; break
      case "--max-retries": a.maxRetries = parseInt(v ?? "0", 10) || 0; i++; break
      case "--sister-auto": a.sisterAuto = parseInt(v ?? "0", 10) || undefined; i++; break
      case "--dry-run": a.dryRun = true; break
      case "--ldgr-bin": a.ldgrBin = v; i++; break
      case "--triage-baseline": a.triageBaseline = true; break
      case "--cdmgr-verify": a.cdmgrVerify = true; break
      case "--files": {
        let j = i + 1
        while (j < argv.length && !argv[j]!.startsWith("--")) { a.files.push(argv[j]!); j++ }
        i = j - 1
        break
      }
    }
  }
  return a
}

interface RunResult { ok: boolean; exit: number; stdout: string; stderr: string; ms: number }

function run(cmd: string, opts: { timeoutMs?: number } = {}): RunResult {
  const t0 = Date.now()
  const r = spawnSync("bash", ["-lc", cmd], { encoding: "utf8", timeout: opts.timeoutMs ?? 120000 })
  return { ok: r.status === 0, exit: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "", ms: Date.now() - t0 }
}

function header(s: string): void {
  console.log(`\n=== ${s} ===`)
}

function fence(label: string, text: string, max = 1200): void {
  const trimmed = text.length > max ? text.slice(0, max) + `\n... [+${text.length - max} more chars]` : text
  console.log(`--- ${label} ---`)
  console.log(trimmed.trimEnd())
  console.log(`--- /${label} ---`)
}

function rollback(files: string[]): RunResult {
  return run(`git checkout -- ${files.map(f => JSON.stringify(f)).join(" ")}`)
}

function bankLdgr(bin: string | undefined, type: string, text: string): void {
  const ldgr = bin ?? "scripts/arq-log.ts"
  const r = spawnSync("bun", [ldgr, "add", type, text], { encoding: "utf8", timeout: 10000 })
  if (r.status !== 0) console.error(`ldgr-WARN: bank ${type} failed (exit=${r.status}): ${(r.stderr ?? "").slice(0, 120)}`)
}

async function main() {
  const fromJson = await maybeFromJson<Partial<Args>>()
  const a = fromJson
    ? { patch: "", test: "", title: "", body: "", files: [], requireRed: false, rollbackOnFail: false, maxRetries: 0, dryRun: false, triageBaseline: false, ...fromJson } as Args
    : parseArgs(process.argv.slice(2))
  if (!a.patch || !a.test || !a.title || a.files.length === 0) {
    console.error("usage: bun scripts/patch-test-commit.ts --patch <p> --test <cmd> --title <t> --files <p>... [--body <b>] [--saga N] [--require-red] [--rollback-on-fail] [--max-retries N] [--sister-auto N] [--dry-run]")
    process.exit(2)
  }
  if (!existsSync(a.patch)) { console.error(`--patch not found: ${a.patch}`); process.exit(2) }
  for (const f of a.files) {
    if (!existsSync(f)) { console.error(`--files entry missing: ${f}`); process.exit(2) }
  }

  if (a.dryRun) {
    header("DRY-RUN PLAN")
    console.log(JSON.stringify(a, null, 2))
    return
  }

  // Phase 1+1.5 merge: when BOTH flags set AND a.test matches `bun test <file>`,
  // run full-suite ONCE and extract target-file fail signal + baseline counts.
  // saga-25 SUSPENDERS dial: one bun-test run instead of two (~30s savings).
  const testFileMatch = a.test.match(/^bun\s+test\s+([\w./-]+\.test\.ts)(?:\s|$)/)
  const canMerge = a.requireRed && a.triageBaseline && testFileMatch !== null

  let baselineFails = 0
  if (canMerge) {
    header("Phase 1+1.5 merge — TDD red-gate + baseline triage (single bun-test run)")
    const triageR = run(`bun test`, { timeoutMs: 600000 })
    const parsed = parseTestOutput(triageR.stdout + "\n" + triageR.stderr)
    baselineFails = parsed.fail
    const targetFile = testFileMatch![1]!
    const targetFails = parsed.failsByFile[targetFile]
    if (!targetFails || targetFails.length === 0) {
      bankLdgr(a.ldgrBin, "scar", `patch-test-commit TDD-fail: ${a.title} — target ${targetFile} did not fail in full-suite (test does not exercise change)`)
      console.error(`TDD GATE FAIL: target ${targetFile} not in failsByFile (test does not exercise change). Aborting.`)
      process.exit(3)
    }
    console.log(`✓ target ${targetFile} FAILED before patch (${targetFails.length} fails) — test exercises the change`)
    console.log(`✓ baseline: ${baselineFails} fail / ${parsed.pass} pass / ${parsed.totalFiles} files`)
  } else {
    // Phase 1: TDD gate (verification BEFORE)
    if (a.requireRed) {
      header("Phase 1 — TDD red-gate (test MUST fail before patch)")
      const r = run(a.test)
      fence("test stdout", r.stdout)
      if (r.ok) {
        bankLdgr(a.ldgrBin, "scar", `patch-test-commit TDD-fail: ${a.title} — test passed BEFORE patch (test does not exercise change)`)
        console.error(`TDD GATE FAIL: test passed BEFORE patch (exit=0). Test does not exercise the change. Aborting.`)
        process.exit(3)
      }
      console.log(`✓ test FAILED before patch (exit=${r.exit}, ${r.ms}ms) — test exercises the change`)
    }

    // Phase 1.5: capture baseline triage (regression-guard mode) — direct lib import, no JSON marshaling.
    if (a.triageBaseline) {
      header("Phase 1.5 — baseline triage (regression-guard mode)")
      const triageR = run(`bun test`, { timeoutMs: 600000 })
      const parsed = parseTestOutput(triageR.stdout + "\n" + triageR.stderr)
      baselineFails = parsed.fail
      console.log(`✓ baseline: ${baselineFails} fail / ${parsed.pass} pass / ${parsed.totalFiles} files`)
    }
  }

  // Phase 1.6: cdmgr-verify pre-snapshot (semantic-delta verification mode)
  let cdmgrPre: Map<string, Awaited<ReturnType<typeof import("./lib/cdmgr-verify.ts").snapshotFile>>> | null = null
  if (a.cdmgrVerify) {
    header("Phase 1.6 — cdmgr-verify pre-snapshot")
    const { snapshotFile } = await import("./lib/cdmgr-verify.ts")
    cdmgrPre = new Map()
    const snaps = await Promise.all(a.files.map(async f => [f, await snapshotFile(f)] as const))
    for (const [f, sym] of snaps) {
      cdmgrPre.set(f, sym)
      console.log(`  ${f}: ${sym.length} symbols snapshot`)
    }
  }

  // Phase 2: apply patch
  header("Phase 2 — apply patch")
  const pr = run(`bun ${JSON.stringify(a.patch)}`)
  fence("patch stdout", pr.stdout)
  if (pr.stderr) fence("patch stderr", pr.stderr)
  if (!pr.ok) {
    bankLdgr(a.ldgrBin, "scar", `patch-test-commit patch-fail: ${a.title} — exit=${pr.exit}`)
    console.error(`PATCH FAIL: exit=${pr.exit}. Aborting.`)
    process.exit(4)
  }
  console.log(`✓ patch applied (exit=0, ${pr.ms}ms)`)

  // Phase 3: verify-after (3-fix-rule via --max-retries)
  let attempt = 0
  let lastTest: RunResult | null = null
  while (attempt <= a.maxRetries) {
    header(`Phase 3 — verify (attempt ${attempt + 1}/${a.maxRetries + 1})`)
    lastTest = run(a.test)
    fence("test stdout", lastTest.stdout)
    if (lastTest.ok) {
      console.log(`✓ test passed (exit=0, ${lastTest.ms}ms)`)
      break
    }
    console.log(`✗ test FAILED (exit=${lastTest.exit}, ${lastTest.ms}ms)`)
    attempt++
    if (attempt > a.maxRetries) break
    console.log(`(retry ${attempt}/${a.maxRetries} — systematic-debugging 3-fix-rule)`)
  }

  // Phase 3.5: regression-guard diff (only if --triage-baseline set) — direct lib import.
  if (a.triageBaseline && lastTest && !lastTest.ok) {
    header("Phase 3.5 — regression-guard diff")
    const triageR = run(`bun test`, { timeoutMs: 600000 })
    const parsed = parseTestOutput(triageR.stdout + "\n" + triageR.stderr)
    const postFails = parsed.fail
    const delta = postFails - baselineFails
    console.log(`baseline: ${baselineFails} fail · post: ${postFails} fail · delta: ${delta > 0 ? "+" : ""}${delta}`)
    if (postFails <= baselineFails) {
      console.log(`✓ no regression — ${postFails} ≤ ${baselineFails}; treating as GREEN`)
      lastTest = { ...lastTest, ok: true }
    } else {
      console.error(`✗ REGRESSION: introduced ${delta} new fails`)
    }
  }

  if (!lastTest || !lastTest.ok) {
    if (a.rollbackOnFail) {
      header("Rollback — git checkout")
      const rr = rollback(a.files)
      fence("rollback stdout", rr.stdout || "(empty)")
      if (rr.stderr) fence("rollback stderr", rr.stderr)
    }
    bankLdgr(a.ldgrBin, "scar", `patch-test-commit verify-fail: ${a.title} — after ${attempt} retries; systematic-debugging 3-fix-rule tripped`)
    console.error(`VERIFY FAIL after ${attempt} retries. NO COMMIT. systematic-debugging: question architecture before next attempt.`)
    process.exit(5)
  }

  // Phase 4: commit via saga-commit.ts (verification-before-completion: only ship on green)
  header("Phase 4 — commit via scripts/saga-commit.ts")
  const sagaCommitArgs: string[] = [
    "scripts/saga-commit.ts",
    "--title", JSON.stringify(a.title),
    "--body", JSON.stringify(a.body),
    "--files", ...a.files.map(f => JSON.stringify(f)),
  ]
  if (a.saga) sagaCommitArgs.push("--saga", a.saga)
  if (a.sisterAuto) sagaCommitArgs.push("--sister-auto", String(a.sisterAuto))
  const cr = run(`bun ${sagaCommitArgs.join(" ")}`)
  fence("commit stdout", cr.stdout)
  if (cr.stderr) fence("commit stderr", cr.stderr)
  if (!cr.ok) {
    console.error(`COMMIT FAIL: exit=${cr.exit}.`)
    process.exit(6)
  }
  // saga-26 dial: heading-shipped owned by saga-commit (auto-banks since 601b41a). ptc keeps scar-banks on failure paths only.
  // Phase 4.5: cdmgr-verify post-snapshot + delta
  if (a.cdmgrVerify && cdmgrPre) {
    header("Phase 4.5 — cdmgr-verify semantic delta")
    const { snapshotFile, symbolDelta } = await import("./lib/cdmgr-verify.ts")
    let totalRemoved = 0, totalAdded = 0, totalRenamed = 0
    // Hidden-3rd-thing #1 cure: union a.files with git-touched paths so collateral
    // edits (e.g., test files added by patch) get delta-analysis too. Files without
    // a pre-snapshot are reported with empty before — all symbols treated as added.
    const gitTouched = run(`git diff --name-only HEAD -- '*.ts'`).stdout.trim().split("\n").filter(Boolean)
    const deltaSet = Array.from(new Set([...a.files, ...gitTouched]))
    const undeclared = deltaSet.filter(f => !a.files.includes(f))
    if (undeclared.length > 0) {
      console.log(`  (coverage-extend: ${undeclared.length} undeclared touched files: ${undeclared.join(", ")})`)
    }
    const afters = await Promise.all(deltaSet.map(async f => [f, await snapshotFile(f)] as const))
    for (const [f, after] of afters) {
      const before = cdmgrPre.get(f) ?? []
      const d = symbolDelta(before, after)
      totalRemoved += d.removed.length
      totalAdded += d.added.length
      totalRenamed += d.renamed.length
      if (d.removed.length || d.added.length || d.renamed.length) {
        console.log(`  ${f}: +${d.added.length} -${d.removed.length} ~${d.renamed.length}`)
        for (const s of d.removed) console.log(`    REMOVED ${s.kind} ${s.name} (L${s.lineStart})`)
        for (const s of d.added) console.log(`    ADDED   ${s.kind} ${s.name} (L${s.lineStart})`)
        for (const r of d.renamed) console.log(`    RENAMED ${r.before.name} → ${r.after.name} (${r.before.kind})`)
      }
    }
    console.log(`✓ cdmgr-verify summary: +${totalAdded} added / -${totalRemoved} removed / ~${totalRenamed} renamed`)
    if (totalRemoved > 0) {
      bankLdgr(a.ldgrBin, "observation", `patch-test-commit cdmgr-verify: ${totalRemoved} symbols REMOVED on patch ${a.title}`)
    }
  }

  console.log(`\n✓ patch-test-commit COMPLETE`)
}

if (import.meta.main) await main()
