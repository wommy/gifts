// scripts/lib/cdmgr-reindex.ts — saga-26 promote from scripts/scratch/cdmgr-reindex-bg.ts
// Backgrounds cdmgr reindex; yields progress lines as async-generator.
// Composable: callers can race a timeout, log per-yield, or just for-await it.
//
// Sister doctrine: 19e08afe06f8d97 unix-philo (composable bun primitives),
// 19e08b9788289ec substrate-tier-ladder (saga-25 promote-step distill).
//
// Usage:
//   import { reindexBg } from "./lib/cdmgr-reindex.ts"
//   const gen = reindexBg(".")
//   for await (const p of gen) console.log(p.line)

import { spawn } from "node:child_process"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
// lib that spawns external process: declares its substrate-requirement
export const substrateRequires = ["codemogger"]

export interface ReindexProgress {
  line: string
  stream: "stdout" | "stderr"
  ms: number
}

export async function* reindexBg(
  target: string = ".",
  opts: { db?: string } = {},
): AsyncGenerator<ReindexProgress, { exit: number; ms: number }, void> {
  const t0 = Date.now()
  const args = ["run", "tools/codemogger/src/cli.ts", "reindex", target]
  if (opts.db) args.push("--db", opts.db)
  const child = spawn("bun", args, { stdio: ["ignore", "pipe", "pipe"] })

  const queue: ReindexProgress[] = []
  let resolveNext: (() => void) | null = null
  let done = false
  let exitCode = -1

  const decoder = new TextDecoder()
  const buf = { stdout: "", stderr: "" }
  const drain = (which: "stdout" | "stderr", chunk: Buffer) => {
    buf[which] += decoder.decode(chunk, { stream: true })
    let nl: number
    while ((nl = buf[which].indexOf("\n")) >= 0) {
      const line = buf[which].slice(0, nl)
      buf[which] = buf[which].slice(nl + 1)
      queue.push({ line, stream: which, ms: Date.now() - t0 })
      if (resolveNext) { resolveNext(); resolveNext = null }
    }
  }
  child.stdout!.on("data", c => drain("stdout", c as Buffer))
  child.stderr!.on("data", c => drain("stderr", c as Buffer))
  child.on("close", code => {
    exitCode = code ?? -1
    done = true
    if (buf.stdout) queue.push({ line: buf.stdout, stream: "stdout", ms: Date.now() - t0 })
    if (buf.stderr) queue.push({ line: buf.stderr, stream: "stderr", ms: Date.now() - t0 })
    if (resolveNext) { resolveNext(); resolveNext = null }
  })

  while (true) {
    if (queue.length > 0) {
      yield queue.shift()!
      continue
    }
    if (done) break
    await new Promise<void>(r => { resolveNext = r })
  }
  return { exit: exitCode, ms: Date.now() - t0 }
}
