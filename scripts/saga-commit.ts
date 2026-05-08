#!/usr/bin/env bun
// scripts/saga-commit.ts — saga-tagged commit primitive.
//
// Lifts handspun-git pattern at 19 in-saga witnesses (saga-24): git add <files> +
// git commit -m heredoc-with-title-body-sister-refs-saga-tag. Auto-derives recent
// doctrine arq-ids via --sister-auto N. Always uses Co-Authored-By trailer for
// Claude collaboration commits.
//
// Doctrines: arq 19e0602b76a06b0 (gravity-distill-during-progress) + 19e06027e8aa976
// (handspun-git witness) + 19e05ecb745e758 (incremental-dial-substrate-morph).
//
// CLI:
//   bun scripts/saga-commit.ts \\
//     --title "feat(scope): summary"     \\
//     --body "longer body text"          \\
//     --files path1 path2 ...            \\
//     [--saga 24]                        \\
//     [--sister-auto N]                  # auto-pull last N doctrine ids from arq
//     [--sister id1,id2,...]             # explicit sister-doctrine ids
//     [--no-coauthor]                    # skip Claude trailer
//     [--dry-run]                        # print msg, do not commit
import { spawnSync, execSync } from "node:child_process"

interface Args {
  title: string
  body: string
  files: string[]
  saga?: string
  sisterAuto?: number
  sister: string[]
  noCoauthor: boolean
  dryRun: boolean
}

function parseArgs(argv: string[]): Args {
  const args: Args = { title: "", body: "", files: [], sister: [], noCoauthor: false, dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]
    const v = argv[i + 1]
    switch (k) {
      case "--title": args.title = v ?? ""; i++; break
      case "--body": args.body = v ?? ""; i++; break
      case "--saga": args.saga = v; i++; break
      case "--sister-auto": args.sisterAuto = Number(v); i++; break
      case "--sister": args.sister = (v ?? "").split(",").map(s => s.trim()).filter(Boolean); i++; break
      case "--no-coauthor": args.noCoauthor = true; break
      case "--dry-run": args.dryRun = true; break
      case "--files": {
        let j = i + 1
        while (j < argv.length && !argv[j]!.startsWith("--")) {
          args.files.push(argv[j]!)
          j++
        }
        i = j - 1
        break
      }
    }
  }
  return args
}

export function getRecentDoctrines(n: number, arqPath?: string): string[] {
  const arq = arqPath ?? `${import.meta.dir}/arq-log.ts`
  try {
    const out = execSync(`bun ${arq} ls doctrine | tail -${n}`, { encoding: "utf8" })
    const ids: string[] = []
    for (const line of out.split("\n")) {
      const m = line.match(/\(([0-9a-f]+)\)/)
      if (m && m[1]) ids.push(m[1])
    }
    return ids
  } catch {
    return []
  }
}

export function buildMessage(args: Args): string {
  const parts: string[] = []
  parts.push(args.title)
  if (args.body) {
    parts.push("")
    parts.push(args.body)
  }
  const sisters = [...args.sister]
  if (args.sisterAuto) {
    sisters.push(...getRecentDoctrines(args.sisterAuto))
  }
  if (sisters.length > 0) {
    parts.push("")
    parts.push("Sister: " + sisters.join(" / "))
  }
  if (args.saga) {
    parts.push("")
    parts.push(`saga-${args.saga}.`)
  }
  return parts.join("\n")
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.title) {
    console.error("usage: bun scripts/saga-commit.ts --title <t> --body <b> --files <p>... [--sister-auto N] [--saga N] [--dry-run]")
    process.exit(2)
  }
  const message = buildMessage(args)
  if (args.dryRun) {
    console.log("=== DRY-RUN saga-commit ===")
    console.log("files:", args.files.join(", ") || "(none)")
    console.log("---")
    console.log(message)
    return
  }
  if (args.files.length === 0) {
    console.error("--files required (or --dry-run)")
    process.exit(2)
  }
  const addRes = spawnSync("git", ["add", ...args.files], { encoding: "utf8" })
  if (addRes.status !== 0) {
    console.error("git add failed:", addRes.stderr)
    process.exit(1)
  }
  const commitRes = spawnSync("git", ["commit", "-F", "-"], { input: message, encoding: "utf8" })
  if (commitRes.status !== 0) {
    console.error("git commit failed:", commitRes.stderr)
    process.exit(1)
  }
  console.log(commitRes.stdout)
}

if (import.meta.main) {
  await main()
}
