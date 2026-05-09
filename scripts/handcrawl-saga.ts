#!/usr/bin/env bun
// handcrawl-saga: primary-source handwalk over session jsonl with operator-tunable filters.
// v1.2 (saga-21 close 2026-05-06): A saga-window compact_boundary fallback + C-narrow juice
//   patterns (5 saga-21-dogfood-derived) + D-narrow --pairs discourse view + H gift-doc pipe.
// v1.1: cancelled-resent dedup + --no-dedup + --role.
// v1.0: raw/substantive/juice filters, saga-window via arq saga-entry, CLI + library.
//
// Sister: seshae-saga.ts (substantive filter as downstream wrapper), seshae-arq.ts (sqlite),
// saga-debrief.ts (synthesis), state-ascertain.ts (substrate snapshot).
//
// Saga-21 doctrine: script-as-floor leak shape (19dff2be20ac8bb) — synthesis primitives need
// type-3 source-raw audit. handcrawl-saga IS that primitive.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const PROJECTS_DIR = `${homedir()}/.claude/projects/-home-wom-infra-glom-MR`
import { ARQ_LOG } from "./lib/arq.ts"

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["filesystem"]

export type EventRole = 'user' | 'assistant' | 'tool_use' | 'tool_result'

export interface RawEvent {
  ts: string
  role: EventRole
  text: string
  superseded?: number
}

export interface CrawlOpts {
  session?: string
  saga?: number
  fromTs?: string
  toTs?: string
  filter?: 'raw' | 'substantive' | 'juice'
  role?: 'user' | 'assistant'
  limit?: number
  minLen?: number
  dedupe?: boolean
  dedupeOpts?: DedupeOpts
  pairs?: boolean  // v1.2 --pairs discourse view
}

export interface DedupeOpts {
  maxGapMs?: number
  minOverlapChars?: number
}

export function findSessionPath(idOrPath: string): string {
  if (idOrPath.endsWith('.jsonl')) return idOrPath
  return `${PROJECTS_DIR}/${idOrPath}.jsonl`
}

export function findActiveSession(): string {
  const files = readdirSync(PROJECTS_DIR)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => ({ f, mtime: statSync(join(PROJECTS_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
  if (files.length === 0) throw new Error(`no jsonl in ${PROJECTS_DIR}`)
  return files[0]!.f.replace(/\.jsonl$/, '')
}

export interface SagaWindow {
  saga: number
  from: string
  to: string | undefined
  source: 'saga-entry' | 'compact_boundary'  // v1.2: which event-type drove resolution
}

// v1.2 A: try saga-entry first, fall back to compact_boundary if absent.
export function resolveSagaWindow(saga: number, log = ARQ_LOG): SagaWindow {
  if (!existsSync(log)) throw new Error(`arq log missing: ${log}`)
  const lines = readFileSync(log, 'utf8').split('\n').filter(Boolean)
  const entries = lines
    .map(l => { try { return JSON.parse(l) } catch { return null } })
    .filter((e: any) => e && (e.type === 'saga-entry' || e.type === 'compact_boundary'))
    .sort((a: any, b: any) => a.ts.localeCompare(b.ts))
  // Prefer saga-entry "saga-N CLOSED" pattern; else fall back to compact_boundary chronological position.
  const sagaEntries = entries.filter((e: any) => e.type === 'saga-entry')
  const closeRe = /saga[-\s]?(\d+)\s+CLOSED/i
  const sagaCloseIdx = sagaEntries.findIndex((e: any) => {
    const m = closeRe.exec(e.text)
    return m && parseInt(m[1]!, 10) === saga
  })
  if (sagaCloseIdx >= 0) {
    const closed = sagaEntries[sagaCloseIdx]!
    const from = sagaCloseIdx > 0 ? sagaEntries[sagaCloseIdx - 1]!.ts : '0000-00-00'
    return { saga, from, to: closed.ts, source: 'saga-entry' }
  }
  // Fallback: compact_boundary chronological position, assuming each compact_boundary closes a saga.
  // saga-N is the Nth compact_boundary if we know which-saga-is-which (heuristic; works when banking lags).
  const boundaries = entries.filter((e: any) => e.type === 'compact_boundary')
  if (boundaries.length === 0) throw new Error(`no saga-entry "saga-${saga} CLOSED" or compact_boundary in ${log}`)
  // Find boundary index that matches saga-N. With saga-entry banks for some sagas, compute offset.
  // Heuristic: use saga-entry sagas as anchors; interpolate compact_boundary positions.
  const anchors: { saga: number; ts: string }[] = []
  for (const e of sagaEntries as any[]) {
    const m = closeRe.exec(e.text)
    if (m) anchors.push({ saga: parseInt(m[1]!, 10), ts: e.ts })
  }
  anchors.sort((a, b) => a.saga - b.saga)
  // Find target by walking chronologically: each compact_boundary is a candidate close for the next saga past last anchor.
  if (anchors.length > 0) {
    const lastAnchor = anchors[anchors.length - 1]!
    if (saga <= lastAnchor.saga) throw new Error(`saga-${saga} should have a saga-entry but doesn't; check arq log`)
    // Find the saga-(lastAnchor.saga + N)th compact_boundary AFTER lastAnchor.ts.
    const boundariesAfter = boundaries.filter((b: any) => b.ts > lastAnchor.ts)
    const offsetIdx = saga - lastAnchor.saga - 1
    if (offsetIdx < 0 || offsetIdx >= boundariesAfter.length) {
      throw new Error(`saga-${saga} compact_boundary not found (have ${boundariesAfter.length} boundaries after saga-${lastAnchor.saga})`)
    }
    const boundary = boundariesAfter[offsetIdx]!
    const from = offsetIdx === 0 ? lastAnchor.ts : (boundariesAfter[offsetIdx - 1] as any).ts
    return { saga, from, to: boundary.ts, source: 'compact_boundary' }
  }
  // No anchors at all; use Nth boundary directly (saga-1 = 1st boundary, etc).
  const idx = saga - 1
  if (idx < 0 || idx >= boundaries.length) {
    throw new Error(`saga-${saga} out of bounds; have ${boundaries.length} compact_boundary events`)
  }
  const boundary = boundaries[idx]! as any
  const from = idx > 0 ? (boundaries[idx - 1] as any).ts : '0000-00-00'
  return { saga, from, to: boundary.ts, source: 'compact_boundary' }
}

// v1.2 C-narrow: saga-21-dogfood-derived patterns for operator-coining + structural moments.
const JUICE_PATTERNS: RegExp[] = [
  /BOOM|EUREKA/,
  /\baside\b/i,
  /^(like|imma|wtf|fuck|holy)\s/i,
  /\bcoin(ed|age)?\b/i,
  /\breframe/i,
  /\bdoctrine|gravity-distill|witness\b/i,
  /\boperator-coined\b/i,
  /^(★|═══)/,
  // v1.2 additions:
  /\bcalled\s+\w+/i,                         // "directory called gifts", "primitive called X"
  /\bprim[ai]t?ives?\b/i,                       // operator-typo-tolerant: primatives | primitives
  /\bas\s+(?:plan|mock|spec|primitive|doctrine|substrate|gift)\b/i,  // "X as plan", "Y as primitive"
  /\bpostit\b/i,                             // operator-substrate verbage
  /\bsaga[-\s]?\d+\b/i,                          // saga references (cross-saga thread markers)
]

export function applyFilter(event: RawEvent, filter: CrawlOpts['filter'] = 'raw', minLen = 100): boolean {
  if (filter === 'raw' || !filter) return true
  if (event.role === 'tool_use' || event.role === 'tool_result') return false
  if (filter === 'substantive') {
    if (event.text.length < minLen) return false
    const t = event.text
    if (t.startsWith('<system-reminder>') || t.startsWith('<task-notification>') ||
        t.startsWith('Caveat:') || t.startsWith('<local-command-')) return false
    return true
  }
  if (filter === 'juice') {
    return JUICE_PATTERNS.some(p => p.test(event.text))
  }
  return true
}

export function dedupeChain(events: RawEvent[], opts: DedupeOpts = {}): RawEvent[] {
  const maxGap = opts.maxGapMs ?? 10 * 60 * 1000
  const minOverlap = opts.minOverlapChars ?? 50
  const out: RawEvent[] = []
  for (const e of events) {
    const last = out[out.length - 1]
    if (!last || last.role !== e.role) { out.push(e); continue }
    const dt = new Date(e.ts).getTime() - new Date(last.ts).getTime()
    if (dt < 0 || dt > maxGap) { out.push(e); continue }
    const overlapLen = Math.min(minOverlap, last.text.length)
    const prefix = last.text.slice(0, overlapLen)
    const newContainsOld = e.text.length > last.text.length &&
      (e.text.startsWith(prefix) || e.text.includes(last.text.slice(0, Math.min(100, last.text.length))))
    const oldContainsNew = e.text.length <= last.text.length &&
      (last.text.startsWith(e.text.slice(0, Math.min(overlapLen, e.text.length))) || last.text.includes(e.text.slice(0, Math.min(100, e.text.length))))
    if (newContainsOld) {
      const sup = (last.superseded ?? 0) + 1
      out[out.length - 1] = { ...e, superseded: sup }
    } else if (oldContainsNew) {
      out[out.length - 1] = { ...last, superseded: (last.superseded ?? 0) + 1 }
    } else {
      out.push(e)
    }
  }
  return out
}

export function* readEvents(path: string): Generator<RawEvent> {
  const content = readFileSync(path, 'utf8')
  const lines = content.split('\n').filter(Boolean)
  for (const line of lines) {
    let j: any
    try { j = JSON.parse(line) } catch { continue }
    if (!j.timestamp) continue
    if (j.type !== 'user' && j.type !== 'assistant') continue
    const role = (j.message?.role ?? j.type) as EventRole
    const ts: string = j.timestamp
    const content = j.message?.content
    if (Array.isArray(content)) {
      for (const c of content) {
        if (c.type === 'text' && typeof c.text === 'string') {
          yield { ts, role, text: c.text }
        } else if (c.type === 'tool_use') {
          yield { ts, role: 'tool_use', text: `${c.name} :: ${JSON.stringify(c.input).slice(0, 200)}` }
        } else if (c.type === 'tool_result' && typeof c.content === 'string') {
          yield { ts, role: 'tool_result', text: c.content.slice(0, 500) }
        }
      }
    } else if (typeof content === 'string') {
      yield { ts, role, text: content }
    }
  }
}

// v1.2 D-narrow: --pairs emits user→assistant adjacent events as discourse units.
// Each pair = 1 user event followed by the next assistant event (skipping tool_use/tool_result).
export interface DiscoursePair {
  user: RawEvent
  assistant?: RawEvent  // may be absent if user message has no reply yet
}

export function pairEvents(events: RawEvent[]): DiscoursePair[] {
  const pairs: DiscoursePair[] = []
  for (let i = 0; i < events.length; i++) {
    const e = events[i]!
    if (e.role !== 'user') continue
    let assistant: RawEvent | undefined
    for (let j = i + 1; j < events.length; j++) {
      const next = events[j]!
      if (next.role === 'tool_use' || next.role === 'tool_result') continue
      if (next.role === 'assistant') { assistant = next; break }
      if (next.role === 'user') break  // unanswered user message
    }
    pairs.push({ user: e, assistant })
  }
  return pairs
}

export function crawl(opts: CrawlOpts = {}): RawEvent[] {
  const sess = opts.session ?? findActiveSession()
  const path = sess.endsWith('.jsonl') ? sess : findSessionPath(sess)
  let from = opts.fromTs
  let to = opts.toTs
  if (opts.saga !== undefined) {
    const w = resolveSagaWindow(opts.saga)
    from = from ?? w.from
    to = to ?? w.to
  }
  const windowed: RawEvent[] = []
  for (const e of readEvents(path)) {
    if (from && e.ts <= from) continue
    if (to && e.ts > to) continue
    windowed.push(e)
  }
  const deduped = (opts.dedupe ?? true) ? dedupeChain(windowed, opts.dedupeOpts) : windowed
  const out: RawEvent[] = []
  for (const e of deduped) {
    if (opts.role && e.role !== opts.role) continue
    if (!applyFilter(e, opts.filter, opts.minLen)) continue
    out.push(e)
    if (opts.limit && out.length >= opts.limit) break
  }
  return out
}

export function renderMd(events: RawEvent[], header = 'Handcrawl'): string {
  const lines: string[] = [`# ${header} — ${events.length} events`, '']
  for (const e of events) {
    const sup = e.superseded ? ` [+${e.superseded} superseded]` : ''
    lines.push(`## [${e.ts.slice(11, 19)}][${e.role}] (${e.text.length}c)${sup}`)
    lines.push(e.text.slice(0, 400).replace(/\n/g, ' '))
    lines.push('')
  }
  return lines.join('\n')
}

// v1.2 D-narrow: render pairs as discourse units.
export function renderPairsMd(pairs: DiscoursePair[], header = 'Discourse pairs'): string {
  const lines: string[] = [`# ${header} — ${pairs.length} pairs`, '']
  for (const p of pairs) {
    lines.push(`## [${p.user.ts.slice(11, 19)}] turn`)
    lines.push(`**user** (${p.user.text.length}c): ${p.user.text.slice(0, 300).replace(/\n/g, ' ')}`)
    if (p.assistant) {
      lines.push(`**assistant** [${p.assistant.ts.slice(11, 19)}] (${p.assistant.text.length}c): ${p.assistant.text.slice(0, 300).replace(/\n/g, ' ')}`)
    } else {
      lines.push(`**assistant**: (no reply)`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

if (import.meta.main) {
  const args = process.argv.slice(2)
  const opts: CrawlOpts = {}
  let mdMode = false
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!
    if (a === '--saga') opts.saga = parseInt(args[++i]!, 10)
    else if (a === '--from') opts.fromTs = args[++i]
    else if (a === '--to') opts.toTs = args[++i]
    else if (a === '--filter') opts.filter = args[++i] as any
    else if (a === '--role') opts.role = args[++i] as any
    else if (a === '--limit') opts.limit = parseInt(args[++i]!, 10)
    else if (a === '--minlen') opts.minLen = parseInt(args[++i]!, 10)
    else if (a === '--no-dedup') opts.dedupe = false
    else if (a === '--pairs') opts.pairs = true
    else if (a === '--md') mdMode = true
    else if (a === '--help' || a === '-h') {
      console.log('usage: bun scripts/handcrawl-saga.ts [sessionId|path] [--saga N] [--from ts] [--to ts]')
      console.log('       [--filter raw|substantive|juice] [--role user|assistant]')
      console.log('       [--limit N] [--minlen N] [--no-dedup] [--pairs] [--md]')
      process.exit(0)
    }
    else if (!a.startsWith('--')) opts.session = a
  }
  const events = crawl(opts)
  if (opts.pairs) {
    const pairs = pairEvents(events)
    if (mdMode) {
      const tag = `pairs,filter=${opts.filter ?? 'raw'}`
      const header = opts.saga !== undefined ? `Saga-${opts.saga} discourse-pairs (${tag})` : `Discourse pairs (${tag})`
      console.log(renderPairsMd(pairs, header))
    } else {
      for (const p of pairs) console.log(JSON.stringify(p))
    }
  } else {
    if (mdMode) {
      const tag = `filter=${opts.filter ?? 'raw'}${opts.role ? `,role=${opts.role}` : ''}${opts.dedupe === false ? ',raw-chain' : ''}`
      const header = opts.saga !== undefined ? `Saga-${opts.saga} handcrawl (${tag})` : `Handcrawl (${tag})`
      console.log(renderMd(events, header))
    } else {
      for (const e of events) console.log(JSON.stringify(e))
    }
  }
}
