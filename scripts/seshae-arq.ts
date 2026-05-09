#!/usr/bin/env bun
// seshae-arq — thin CLI over mocks/seshae-arq-mock-v0 (compose-mock).
// SAGA_DB env switches both child mocks to sqlite via .cache + .search files.
import { openSeshaeArq, type SagaEvent } from '../mocks/seshae-arq-mock-v0/index.ts'
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["filesystem"]

function findActiveSessionId(): string {
  const dir = `${homedir()}/.claude/projects/-home-wom-infra-glom-MR`
  const files = readdirSync(dir)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => ({ f, mtime: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
  return files[0]!.f.replace(/\.jsonl$/, '')
}

// Default sagaDbPath to .seshae-arq/<sess> when SAGA_DB unset so multi-call CLI persists.
// Mirrors cachebro's `.cachebro` default convention (see refs-parity contract).
let sagaDbPath = process.env.SAGA_DB
if (!sagaDbPath) {
  const sess = findActiveSessionId()
  mkdirSync('.seshae-arq', { recursive: true })
  sagaDbPath = `.seshae-arq/${sess}`
}

const [cmd, ...args] = process.argv.slice(2)
const arq = openSeshaeArq({ path: sagaDbPath })

if (cmd === 'index') {
  const sessionId = args[0] ?? findActiveSessionId()
  const sagaPath = `/tmp/saga-${sessionId}.jsonl`
  if (!existsSync(sagaPath)) {
    console.error(`saga-spine not found: ${sagaPath} — run scripts/seshae-saga.ts first`)
    process.exit(1)
  }
  const events: SagaEvent[] = readFileSync(sagaPath, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l))
  const watermark = arq.lastIndexedTs()
  console.log(`indexing ${events.length} events from ${sagaPath}${watermark ? ` (watermark=${watermark})` : ' (first index)'}…`)
  const t0 = performance.now()
  const r = arq.indexIncremental(events)
  const ms = Math.round(performance.now() - t0)
  console.log(`indexed ${r.indexed} new, skipped ${r.skipped} already-cached in ${ms}ms ${sagaDbPath ? `(sqlite ${sagaDbPath})` : '(in-mem)'}`)
} else if (cmd === 'get') {
  const ts = args[0]
  if (!ts) { console.error('usage: get <ts>'); process.exit(1) }
  const ev = arq.get(ts)
  console.log(ev ? JSON.stringify(ev, null, 2) : '(no event)')
} else if (cmd === 'search') {
  const term = args[0]
  if (!term) { console.error('usage: search <term>'); process.exit(1) }
  const matches = arq.search(term)
  for (const e of matches) {
    console.log(`${e.ts.slice(11, 19)} [${e.role}] ${e.text.slice(0, 150).replace(/\n/g, ' ')}`)
  }
  console.log(`(${matches.length} matches)`)
} else {
  console.log('seshae-arq CLI: index <sess>? | get <ts> | search <term>')
  console.log(`SAGA_DB: ${sagaDbPath ?? 'unset → in-mem'}`)
}

arq.close()
