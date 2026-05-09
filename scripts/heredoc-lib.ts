// scripts/lib/heredoc.ts (saga-25 op-coined after N=4+ escape-soup scars)
// Escape-soup cures: utilities for moving content through shell/JS/JSON layers
// without escape compounding. Pattern: heredoc-stdin > inline-string-arg.
// Sister: doctrine 19e086c4ef20331 plan-mode-forever fresh-file cure.

import { writeFileSync, appendFileSync } from "node:fs"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["arq","filesystem"]

/** Read all of stdin to string. */
export async function readStdin(): Promise<string> {
  return await Bun.stdin.text()
}

/** Read stdin → write file atomically. */
export async function writeFromStdin(path: string): Promise<{ bytes: number; path: string }> {
  const content = await readStdin()
  writeFileSync(path, content, "utf8")
  return { bytes: content.length, path }
}

/** Read stdin → append to file (creates if missing). */
export async function appendFromStdin(path: string): Promise<{ added: number; path: string }> {
  const content = await readStdin()
  appendFileSync(path, content, "utf8")
  return { added: content.length, path }
}

/** Pipe stdin to a subprocess. */
export async function pipeStdinTo(
  cmd: string,
  args: string[],
): Promise<{ stdout: string; stderr: string; exit: number }> {
  const content = await readStdin()
  const proc = Bun.spawn([cmd, ...args], { stdin: "pipe", stdout: "pipe", stderr: "pipe" })
  proc.stdin.write(content)
  await proc.stdin.end()
  const exit = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = proc.stderr ? await new Response(proc.stderr).text() : ""
  return { stdout, stderr, exit }
}

/** Read stdin as JSON (object or array), pipe each as JSONL to subprocess.
 *  Cures the "bank a batch of arq events" pattern — instead of multiple sequential
 *  arq-log add calls (interphase chatter scar), construct JSON-array of events
 *  in a heredoc, pipe through this helper to `arq-log batch`. */
export async function pipeJsonAsJsonlTo(
  cmd: string,
  args: string[],
): Promise<{ stdout: string; stderr: string; exit: number; count: number }> {
  const raw = await readStdin()
  const parsed = JSON.parse(raw)
  const items = Array.isArray(parsed) ? parsed : [parsed]
  const lines = items.map(i => JSON.stringify(i)).join("\n")
  const proc = Bun.spawn([cmd, ...args], { stdin: "pipe", stdout: "pipe", stderr: "pipe" })
  proc.stdin.write(lines)
  await proc.stdin.end()
  const exit = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = proc.stderr ? await new Response(proc.stderr).text() : ""
  return { stdout, stderr, exit, count: items.length }
}
