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
import { maybeFromJson } from "./lib/cli-io.ts"
import { parseArgs as parseSchema } from "./lib/cli-args.ts"
import { run, runCmd } from "./lib/proc.ts"
import { bankEvent } from "./lib/bank.ts"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["git","arq"]

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
  // saga-25 CUT-B migration: schema-driven via lib/cli-args.ts (was hand-rolled switch).
  // Note: --sister kept as comma-string for backward-compat with existing callers.
  // --no-coauthor sets noCoauthor=true (cli-args' --no-foo only flips matching boolean field;
  // here we keep the original semantic by post-processing).
  const r = parseSchema<{
    title: string; body: string; files: string[]; saga?: string;
    "sister-auto"?: number; sister?: string;
    "no-coauthor": boolean; "dry-run": boolean;
  }>(argv, {
    title: "string", body: "string", files: "array", saga: "string",
    "sister-auto": "number", sister: "string",
    "no-coauthor": "boolean", "dry-run": "boolean",
  }, "rest")
  const f = r.flags
  return {
    title: f.title ?? "", body: f.body ?? "", files: f.files ?? [],
    saga: f.saga, sisterAuto: f["sister-auto"],
    sister: (f.sister ?? "").split(",").map(s => s.trim()).filter(Boolean),
    noCoauthor: f["no-coauthor"], dryRun: f["dry-run"],
  }
}

export function getRecentDoctrines(n: number, arqPath?: string): string[] {
  const arq = arqPath ?? `${import.meta.dir}/arq-log.ts`
  try {
    const out = run(`bun ${arq} ls doctrine | tail -${n}`).stdout
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
  const fromJson = await maybeFromJson<Partial<Args>>()
  const args = fromJson
    ? { title: "", body: "", files: [], sister: [], noCoauthor: false, dryRun: false, ...fromJson } as Args
    : parseArgs(process.argv.slice(2))
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
  const addRes = runCmd("git", ["add", ...args.files])
  if (!addRes.ok) {
    console.error("git add failed:", addRes.stderr)
    process.exit(1)
  }
  const commitRes = runCmd("git", ["commit", "-F", "-"], { input: message })
  if (!commitRes.ok) {
    console.error("git commit failed:", commitRes.stderr)
    process.exit(1)
  }
  console.log(commitRes.stdout)
  bankEvent("heading-shipped", `saga-commit ok: ${args.title}${args.saga ? ` (saga-${args.saga})` : ""}`)
}

if (import.meta.main) {
  await main()
}
