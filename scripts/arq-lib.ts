// arq: shared lib for append-only event-log surfaces (tasklist, postit, ...).
// Pattern: arq=hot append-only event log + arx=cold projection. Project|global routing.
import { appendFileSync, readFileSync as readFs, readFileSync, existsSync, renameSync } from 'node:fs'
import { Projection } from './projection-cache.ts'

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["arq","filesystem"]

/** Valid recognized event types (open list — others allowed but these are canonical). */
export const KNOWN_TYPES = [
  'task', 'scar', 'observation', 'doctrine', 'heading', 'mock',
  'inbox',            // candidate item not yet banked; promote to a target type
  'archive-marker',
] as const

export interface Event {
  ts: string
  type: string
  text: string
  /**
   * Optional metadata bag. Mock-stage absorption from emmett pattern
   * (refs/emmett/src/packages/emmett/src/typing/event.ts:18,28).
   * Reserved-by-convention keys (not enforced):
   * - correlationId: saga group / sidequest cluster
   * - causationId: parent event id
   * - traceId / spanId: OTel observability
   * - activeForm: present-continuous label for UI consumers
   * Open bag — readers project; replay ignores unknown keys.
   */
  metadata?: Record<string, unknown>
}

/** Extended event with stable id (all new events carry id). */
export interface IdEvent extends Event {
  id: string
}

/** Promoted event: new type + from_id back-ref to inbox source. */
export interface PromoteEvent extends IdEvent {
  from_id: string
}

/** Strip -g/--global from argv, return remaining + flag state. */
export function parseGlobalFlag(argv: string[]): { argv: string[]; useGlobal: boolean } {
  const idx = argv.findIndex(a => a === '-g' || a === '--global')
  const useGlobal = idx >= 0
  const out = useGlobal ? [...argv.slice(0, idx), ...argv.slice(idx + 1)] : argv
  return { argv: out, useGlobal }
}

/** Resolve log path. GLOM_LOG env wins; else project (./<surface>.jsonl) or global (~/.memelord/<surface>.jsonl). */
export function resolveLog(surface: string, useGlobal: boolean): string {
  if (process.env.GLOM_LOG) return process.env.GLOM_LOG
  return useGlobal ? `${process.env.HOME}/.memelord/${surface}.jsonl` : `${surface}.jsonl`
}

/** Canonical tasklist.jsonl path with GLOM_LOG env-override. saga-25 16-site collapse target. */
export const ARQ_LOG = resolveLog('tasklist', false)

/** Generate a short stable id: ts-millis hex + 4 random hex chars. */
export function makeId(): string {
  const ms = Date.now().toString(16)
  const rand = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')
  return `${ms}${rand}`
}

export function appendEvent(
  log: string,
  type: string,
  text: string,
  metadata?: Record<string, unknown>,
): IdEvent {
  const entry: IdEvent = { id: makeId(), ts: new Date().toISOString(), type, text }
  if (metadata) entry.metadata = metadata
  appendFileSync(log, JSON.stringify(entry) + '\n')
  return entry
}

/** Append a promoted event derived from an inbox source. */
export function appendPromoteEvent(
  log: string,
  fromId: string,
  type: string,
  text: string,
  metadata?: Record<string, unknown>,
): PromoteEvent {
  const entry: PromoteEvent = { id: makeId(), ts: new Date().toISOString(), type, text, from_id: fromId }
  if (metadata) entry.metadata = metadata
  appendFileSync(log, JSON.stringify(entry) + '\n')
  return entry
}

/**
 * Promote an inbox event to a new type.
 * Reads log to find source event by id; throws if not found or not inbox type.
 * Appends new event of `newType` with `from_id` back-ref; original untouched.
 */
export function promoteInbox(log: string, id: string, newType: string, overrideText?: string): PromoteEvent {
  const events = readEvents(log)
  const source = events.find(e => (e as IdEvent).id === id)
  if (!source) throw new Error(`arq promote: no event with id=${id}`)
  if (source.type !== 'inbox') throw new Error(`arq promote: event ${id} is type=${source.type}, expected inbox`)
  const text = overrideText ?? source.text
  return appendPromoteEvent(log, id, newType, text)
}

export type ReadMode = 'strict' | 'skip-bad' | 'all-or-nothing'

/** Read jsonl events. Mode controls JSON.parse failure handling.
 *   strict (default) — throws on bad line
 *   skip-bad — line-by-line try/catch, drop bad lines (pre-compact pattern)
 *   all-or-nothing — file-level try/catch, return [] if any line fails (memelord-mock pattern) */
export function readEvents(log: string, mode: ReadMode = 'strict'): Event[] {
  if (!existsSync(log)) return []
  if (mode === 'all-or-nothing') {
    try {
      return readFileSync(log, 'utf8').trim().split('\n').filter(Boolean)
        .map(l => JSON.parse(l) as Event)
    } catch { return [] }
  }
  if (mode === 'skip-bad') {
    const events: Event[] = []
    for (const line of readFileSync(log, 'utf8').trim().split('\n').filter(Boolean)) {
      try { events.push(JSON.parse(line) as Event) } catch {}
    }
    return events
  }
  return readFileSync(log, 'utf8').trim().split('\n').filter(Boolean)
    .map(l => JSON.parse(l) as Event)
}

/** Read events whose ts falls inside [winStart, winEnd] inclusive. Substrate primitive
 * lift saga 16 v0.4 — every projection was re-filtering by ts; centralize. */
export function readEventsInWindow(log: string, winStart: string, winEnd: string): Event[] {
  return readEvents(log).filter(e => e.ts >= winStart && e.ts <= winEnd)
}

/**
 * Indexed corpus: storage-tier indices over an event log.
 * Saga-26 R1.0 (P1 neutron-star primitive): unifies N projections' redundant
 * readEvents+filter loops into 1 indexed-truth-source. Saga-aware composition
 * (bySaga / byInbound / byCitedIds) lives one tier up in scripts/projections/*
 * to preserve scripts/lib/ pure-import boundary (saga-25 lib-vs-scripts-separation
 * doctrine 19e08f408741652).
 */
export interface IndexedCorpus {
  /** All events with stable ids, sorted by ts ascending. */
  events: IdEvent[]
  /** O(1) id → event lookup. */
  byId: Map<string, IdEvent>
  /** type → events grouped (e.g. "doctrine" → all doctrine events). */
  byType: Map<string, IdEvent[]>
  /** correlationId → events (events without correlationId are skipped). */
  byCorrelationId: Map<string, IdEvent[]>
}

export function buildIndexedCorpus(events: Event[]): IndexedCorpus {
  const idEvents = events.filter((e): e is IdEvent => typeof (e as IdEvent).id === 'string')
  idEvents.sort((a, b) => a.ts.localeCompare(b.ts))
  const byId = new Map<string, IdEvent>()
  const byType = new Map<string, IdEvent[]>()
  const byCorrelationId = new Map<string, IdEvent[]>()
  for (const e of idEvents) {
    byId.set(e.id, e)
    let tArr = byType.get(e.type)
    if (!tArr) { tArr = []; byType.set(e.type, tArr) }
    tArr.push(e)
    const c = e.metadata?.correlationId
    if (typeof c === 'string') {
      let cArr = byCorrelationId.get(c)
      if (!cArr) { cArr = []; byCorrelationId.set(c, cArr) }
      cArr.push(e)
    }
  }
  return { events: idEvents, byId, byType, byCorrelationId }
}

/** Cached canonical-tasklist IndexedCorpus projection. saga-26 R1.0 P1. */
export const arqProjection = new Projection<Event[], IndexedCorpus>({
  source: () => readEvents(ARQ_LOG),
  build: events => buildIndexedCorpus(events),
})

export function listEvents(log: string, filter?: string): void {
  for (const e of readEvents(log)) {
    if (filter && e.type !== filter) continue
    const id = (e as any).id ? ` (${(e as any).id})` : ''
    const fromId = (e as any).from_id ? ` ←${(e as any).from_id}` : ''
    console.log(`${e.ts.slice(0, 16)} [${e.type}]${id}${fromId} ${e.text}`)
  }
}

export function mdProject(log: string, filter?: string): void {
  const groups: Record<string, Event[]> = {}
  for (const e of readEvents(log)) {
    if (filter && e.type !== filter) continue
    ;(groups[e.type] ??= []).push(e)
  }
  for (const [type, items] of Object.entries(groups).sort()) {
    console.log(`\n## ${type} (${items.length})`)
    for (const e of items) console.log(`- \`${e.ts.slice(0, 16)}\` ${e.text}`)
  }
}

/** Staging tier paths derived from canonical log path. */
export function stagingPaths(log: string): { proposed: string; rejected: string } {
  return {
    proposed: log.replace(/\.jsonl$/, '.proposed.jsonl'),
    rejected: log.replace(/\.jsonl$/, '.rejected.jsonl'),
  }
}

/** List proposed events with indices for review. Optional type filter. */
export function reviewProposed(log: string, filter?: string): Event[] {
  const { proposed } = stagingPaths(log)
  const events = readEvents(proposed)
  if (events.length === 0) {
    console.log(`(no proposed events at ${proposed})`)
    return events
  }
  const counts: Record<string, number> = {}
  for (const e of events) counts[e.type] = (counts[e.type] ?? 0) + 1
  if (!filter) {
    console.log(`(${events.length} staged) ` + Object.entries(counts).sort().map(([t, n]) => `${t}=${n}`).join(' '))
    console.log(`drill: bun scripts/arq-log.ts review <type>`)
    return events
  }
  const matched: Event[] = []
  events.forEach((e, i) => {
    if (e.type !== filter) return
    matched.push(e)
    console.log(`[${i}] ${e.ts.slice(0, 16)} ${e.text}`)
  })
  if (matched.length === 0) console.log(`no events of type=${filter}`)
  return matched
}

/** Approve: merge proposed events to canonical log; clear staging. idx="all" or comma-list. */
export function approveProposed(log: string, idx: string): void {
  const { proposed, rejected } = stagingPaths(log)
  const events = readEvents(proposed)
  if (events.length === 0) return console.log('nothing to approve')
  const indices = idx === 'all' ? events.map((_, i) => i) : idx.split(',').map(Number).filter(n => !isNaN(n))
  const approved = indices.map(i => events[i]).filter(Boolean) as Event[]
  const remaining = events.filter((_, i) => !indices.includes(i))
  for (const e of approved) appendFileSync(log, JSON.stringify(e) + '\n')
  if (remaining.length === 0 && existsSync(proposed)) renameSync(proposed, proposed + '.empty')
  else if (remaining.length > 0) writeProposed(proposed, remaining)
  console.log(`+ ${approved.length} approved → ${log}; ${remaining.length} remain`)
}

/** Reject: move proposed events to rejected log. */
export function rejectProposed(log: string, idx: string): void {
  const { proposed, rejected } = stagingPaths(log)
  const events = readEvents(proposed)
  if (events.length === 0) return console.log('nothing to reject')
  const indices = idx === 'all' ? events.map((_, i) => i) : idx.split(',').map(Number).filter(n => !isNaN(n))
  const rejectedEvents = indices.map(i => events[i]).filter(Boolean) as Event[]
  const remaining = events.filter((_, i) => !indices.includes(i))
  for (const e of rejectedEvents) appendFileSync(rejected, JSON.stringify(e) + '\n')
  if (remaining.length === 0 && existsSync(proposed)) renameSync(proposed, proposed + '.empty')
  else if (remaining.length > 0) writeProposed(proposed, remaining)
  console.log(`- ${rejectedEvents.length} rejected → ${rejected}; ${remaining.length} remain`)
}

function writeProposed(path: string, events: Event[]): void {
  const content = events.map(e => JSON.stringify(e)).join('\n') + (events.length ? '\n' : '')
  Bun.write(path, content)
}

/** Archive command: rotate <log> → <log>.<date>.archive.jsonl, drop archive-marker event in fresh log. */
export function archiveLog(log: string): { archived: string; events: number } {
  if (!existsSync(log)) return { archived: '', events: 0 }
  const events = readEvents(log)
  const date = new Date().toISOString().slice(0, 10)
  const archived = log.replace(/\.jsonl$/, `.${date}.archive.jsonl`)
  renameSync(log, archived)
  appendEvent(log, 'archive-marker', `${events.length} events archived to ${archived}`)
  return { archived, events: events.length }
}

/**
 * Parse `--blocks <id>` / `--blocked-by <id>` / `--correlation <id>` / `--text "..."` flags
 * into {text, metadata}. Reserved-by-convention metadata keys per absorption #2 (saga 16
 * SQ-EXT lift): blocks (string[]), blockedBy (string[]), correlationId (string).
 * Multiple --blocks / --blocked-by allowed; collected as arrays. Repeating --text is bug-shape (last wins).
 */
export function parseMetaFlags(args: string[]): { text: string | undefined; metadata: Record<string, unknown> | undefined } {
  const blocks: string[] = []
  const blockedBy: string[] = []
  let correlationId: string | undefined
  let text: string | undefined
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--blocks') { const v = args[++i]; if (v) blocks.push(v) }
    else if (a === '--blocked-by') { const v = args[++i]; if (v) blockedBy.push(v) }
    else if (a === '--correlation') { correlationId = args[++i] }
    else if (a === '--text') { text = args.slice(i + 1).join(' '); break }
  }
  const metadata: Record<string, unknown> = {}
  if (blocks.length > 0) metadata.blocks = blocks
  if (blockedBy.length > 0) metadata.blockedBy = blockedBy
  if (correlationId) metadata.correlationId = correlationId
  return { text, metadata: Object.keys(metadata).length > 0 ? metadata : undefined }
}

/** Parse `add` args: <type> <text...> [flags]. Type is first non-flag token; text is remaining non-flag tokens; flags via parseMetaFlags. */
export function parseAddArgs(args: string[]): { type: string; text: string; metadata: Record<string, unknown> | undefined } {
  // separate flags from positional. Flags consume next token as value.
  const FLAG_NAMES = new Set(['--blocks', '--blocked-by', '--correlation', '--text'])
  const positional: string[] = []
  const flagArgs: string[] = []
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (FLAG_NAMES.has(a)) {
      flagArgs.push(a)
      // --text consumes rest; --blocks / --blocked-by / --correlation consume one value
      if (a === '--text') { flagArgs.push(...args.slice(i + 1)); break }
      const v = args[++i]
      if (v !== undefined) flagArgs.push(v)
    } else {
      positional.push(a)
    }
  }
  const [type, ...textParts] = positional
  const parsed = parseMetaFlags(flagArgs)
  const text = parsed.text ?? textParts.join(' ')
  return { type: type ?? 'task', text, metadata: parsed.metadata }
}

/** Standard CLI dispatch. surface = log basename (e.g. "tasklist"). scriptName = self path for usage (e.g. "arq-log"). */
export function runCli(surface: string, argv: string[], scriptName = surface): void {
  const { argv: rest, useGlobal } = parseGlobalFlag(argv)
  const log = resolveLog(surface, useGlobal)
  const [cmd, ...args] = rest

  if (cmd === 'add' || cmd === 'a') {
    const parsed = parseAddArgs(args)
    const e = appendEvent(log, parsed.type, parsed.text, parsed.metadata)
    // Echo truncated to ≤80ch to avoid N×2 substrate-bloat on add (sister to phase-11 caller-side terse-heading rule 19e04ce87750f03).
    const preview = e.text.length > 80 ? e.text.slice(0, 77) + '...' : e.text
    console.log(`+ [${e.id}] ${e.type}: ${preview}`)
  } else if (cmd === 'batch') {
    // Read JSONL events from stdin; each line {type, text, metadata?}.
    // Atomic single fs append for the whole batch (saga-25 op-coined for saga-close cadence).
    const input = readFs(0, 'utf8')
    const lines = input.trim().split('\n').filter(Boolean)
    const banked: IdEvent[] = []
    let blob = ''
    for (const line of lines) {
      let obj: { type?: unknown; text?: unknown; metadata?: Record<string, unknown> }
      try { obj = JSON.parse(line) } catch (e) {
        console.error('batch: invalid JSON line: ' + line.slice(0, 80))
        process.exit(1)
      }
      if (typeof obj.type !== 'string' || typeof obj.text !== 'string') {
        console.error('batch: each line must have {type: string, text: string}')
        process.exit(1)
      }
      const e: IdEvent = { id: makeId(), ts: new Date().toISOString(), type: obj.type, text: obj.text }
      if (obj.metadata) e.metadata = obj.metadata
      blob += JSON.stringify(e) + '\n'
      banked.push(e)
    }
    if (blob) appendFileSync(log, blob)
    console.log(`+ batch ok: ${banked.length} event${banked.length === 1 ? '' : 's'}`)
    for (const e of banked) {
      const preview = e.text.length > 80 ? e.text.slice(0, 77) + '...' : e.text
      console.log(`  [${e.id}] ${e.type}: ${preview}`)
    }
  } else if (cmd === 'promote') {
    // promote <inbox-event-id> <new-type> [--text "replacement text"] [--blocks <id>] [--blocked-by <id>] [--correlation <id>]
    const [inboxId, newType, ...rest] = args
    if (!inboxId || !newType) {
      console.error('usage: promote <inbox-event-id> <new-type> [--text "text"] [--blocks <id>] [--blocked-by <id>] [--correlation <id>]')
      process.exit(1)
    }
    const parsed = parseMetaFlags(rest)
    const e = promoteInbox(log, inboxId, newType, parsed.text, parsed.metadata)
    console.log(`promoted [${e.from_id}] inbox → ${e.type} [${e.id}]: ${e.text}`)
  } else if (cmd === 'ls' || cmd === 'list') {
    listEvents(log, args[0])
  } else if (cmd === 'md') {
    mdProject(log, args[0])
  } else if (cmd === 'archive') {
    const r = archiveLog(log)
    if (!r.archived) console.log(`no log at ${log}`)
    else console.log(`archived ${r.events} events → ${r.archived}`)
  } else if (cmd === 'review') {
    reviewProposed(log, args[0])
  } else if (cmd === 'approve') {
    approveProposed(log, args[0] ?? 'all')
  } else if (cmd === 'reject') {
    rejectProposed(log, args[0] ?? 'all')
  } else {
    console.log(`${surface}: append-only arq projector`)
    console.log('usage:')
    console.log(`  bun scripts/${scriptName}.ts [-g] add <type> <text> [--blocks <id>] [--blocked-by <id>] [--correlation <id>]`)
    console.log(`  bun scripts/${scriptName}.ts [-g] add inbox <text>    # inbox: candidate not yet banked`)
    console.log(`  bun scripts/${scriptName}.ts [-g] promote <id> <type> [--text "txt"] [--blocks <id>] [--blocked-by <id>] [--correlation <id>]`)
    console.log(`  bun scripts/${scriptName}.ts [-g] ls [type]           # list (optional filter)`)
    console.log(`  bun scripts/${scriptName}.ts [-g] md                  # project to markdown groups`)
    console.log(`  bun scripts/${scriptName}.ts [-g] archive              # rotate to <date>.archive.jsonl + emit marker event`)
    console.log(`  bun scripts/${scriptName}.ts [-g] review                # list events in <log>.proposed.jsonl staging tier`)
    console.log(`  bun scripts/${scriptName}.ts [-g] approve <idx|all>     # merge proposed → canonical log`)
    console.log(`  bun scripts/${scriptName}.ts [-g] reject <idx|all>      # move proposed → <log>.rejected.jsonl`)
    console.log('\n  -g / --global  use ~/.memelord/<surface>.jsonl (cross-project)')
    console.log(`                  default: ./<surface>.jsonl (project-local)`)
    console.log(`\nactive log: ${log}`)
  }
}
