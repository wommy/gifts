#!/usr/bin/env bun
// scripts/here.ts — CLI wrapper for heredoc-stdin patterns. Eliminates
// bun -e + import dance for common escape-soup-cure shapes.
// Sister: scripts/lib/heredoc.ts.
//
// Usage (heredoc-stdin):
//   bun scripts/here.ts write <path>         <<EOF ... EOF   # write file
//   bun scripts/here.ts append <path>        <<EOF ... EOF   # append file
//   bun scripts/here.ts pipe <cmd> [args...] <<EOF ... EOF   # pipe stdin to cmd
//   bun scripts/here.ts batch                <<EOF ... EOF   # JSON-array → arq-log batch
import { writeFromStdin, appendFromStdin, pipeStdinTo, pipeJsonAsJsonlTo } from "./lib/heredoc.ts"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["filesystem"]

async function main() {
  const [sub, ...rest] = process.argv.slice(2)
  if (!sub) {
    console.error("usage: bun scripts/here.ts <write|append|pipe|batch> ...")
    process.exit(2)
  }
  switch (sub) {
    case "write": {
      const path = rest[0]
      if (!path) { console.error("write: <path> required"); process.exit(2) }
      const r = await writeFromStdin(path)
      console.log(`wrote ${r.bytes}b → ${r.path}`)
      return
    }
    case "append": {
      const path = rest[0]
      if (!path) { console.error("append: <path> required"); process.exit(2) }
      const r = await appendFromStdin(path)
      console.log(`appended ${r.added}b → ${r.path}`)
      return
    }
    case "pipe": {
      const cmd = rest[0]
      if (!cmd) { console.error("pipe: <cmd> required"); process.exit(2) }
      const r = await pipeStdinTo(cmd, rest.slice(1))
      process.stdout.write(r.stdout)
      if (r.stderr) process.stderr.write(r.stderr)
      process.exit(r.exit)
    }
    case "batch": {
      // Convenience: JSON-array of events → arq-log batch. Default surface=tasklist.
      const r = await pipeJsonAsJsonlTo("bun", ["/home/wom/infra/glom_MR/scripts/arq-log.ts", "batch", ...rest])
      process.stdout.write(r.stdout)
      if (r.stderr) process.stderr.write(r.stderr)
      console.log(`(${r.count} events)`)
      process.exit(r.exit)
    }
    default:
      console.error(`unknown subcommand: ${sub}`)
      process.exit(2)
  }
}

if (import.meta.main) await main()
