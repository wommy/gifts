#!/usr/bin/env bun
// scripts/yeet.ts (saga-25 op-coined: yeet-to-archive, never rm)
// Move files from active scratch to scripts/scratch/archive/<saga-N|date>/
// while preserving substrate per append-only doctrine. Banks arq event.
//
// Pattern (operator-coined): scratch → yeet → archive → distill → promote → doctrine.
// yeet is the verb that turns active-rough-work into preserved-distill-source.
//
// Usage:
//   bun scripts/yeet.ts <file>... [--saga N] [--reason "<text>"]
//   bun scripts/yeet.ts --target <dir> <file>...   # explicit target
//   bun scripts/yeet.ts --dry-run <file>...
//
// Doctrine: NEVER rm. Always yeet. scratch is append-only too — the rough work
// is the seed bed for emergent primitives via distill.
import { existsSync, mkdirSync, renameSync, statSync } from "node:fs"
import { dirname, basename, resolve } from "node:path"
import { bankEvent } from "./lib/bank.ts"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["filesystem","arq"]

interface Args {
  files: string[]
  saga?: string
  reason?: string
  target?: string
  dryRun: boolean
}

function parseArgs(argv: string[]): Args {
  const a: Args = { files: [], dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]
    const v = argv[i + 1]
    switch (k) {
      case "--saga": a.saga = v; i++; break
      case "--reason": a.reason = v; i++; break
      case "--target": a.target = v; i++; break
      case "--dry-run": a.dryRun = true; break
      default:
        if (k && !k.startsWith("--")) a.files.push(k)
    }
  }
  return a
}

function targetDir(args: Args): string {
  if (args.target) return resolve(args.target)
  const tag = args.saga ? `saga-${args.saga}` : new Date().toISOString().slice(0, 10)
  return resolve(`scripts/scratch/archive/${tag}`)
}

function uniquePath(target: string): string {
  if (!existsSync(target)) return target
  const dir = dirname(target)
  const base = basename(target)
  const dot = base.lastIndexOf(".")
  const stem = dot > 0 ? base.slice(0, dot) : base
  const ext = dot > 0 ? base.slice(dot) : ""
  for (let n = 1; n < 1000; n++) {
    const candidate = `${dir}/${stem}.${n}${ext}`
    if (!existsSync(candidate)) return candidate
  }
  throw new Error(`uniquePath: 1000 collisions on ${target}`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.files.length === 0) {
    console.error("usage: bun scripts/yeet.ts <file>... [--saga N] [--reason <s>] [--target <dir>] [--dry-run]")
    process.exit(2)
  }
  const tgt = targetDir(args)
  if (!args.dryRun) mkdirSync(tgt, { recursive: true })

  const moved: Array<{ src: string; dst: string; bytes: number }> = []
  for (const f of args.files) {
    const src = resolve(f)
    if (!existsSync(src)) {
      console.error(`yeet: source missing: ${f}`)
      continue
    }
    const dst = uniquePath(`${tgt}/${basename(src)}`)
    const bytes = statSync(src).size
    if (args.dryRun) {
      console.log(`[dry-run] would move: ${src} → ${dst} (${bytes}b)`)
    } else {
      renameSync(src, dst)
      console.log(`yeeted: ${src} → ${dst} (${bytes}b)`)
    }
    moved.push({ src, dst, bytes })
  }

  if (!args.dryRun && moved.length > 0) {
    const summary = `yeeted ${moved.length} file${moved.length === 1 ? "" : "s"} → ${tgt}${args.reason ? ` — ${args.reason}` : ""}`
    bankEvent("yeet", summary)
    console.log(`(arq event banked)`)
  }
}

if (import.meta.main) await main()
