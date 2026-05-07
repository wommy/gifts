# event-substrate — workflow architecture for compaction-survivable agent work (saga-21 doctrine, gift v0.1)

The substrate underneath every other gift in this corpus. **Pattern, not tool.**

## The pattern, in one sentence

A workflow whose **state is durably banked across multiple typed substrates** so that any single substrate failing — including conversational context compaction — still leaves enough redundant signal for the next session to recover the relevant doctrine, decisions, and pending threads.

## Six components

| layer | what | why it's distinct |
|---|---|---|
| **typed event log** | append-only events with `{ ts, type, text, optional id+correlation }`; types include `doctrine` / `observation` / `scar` / `heading-shipped` / `saga-entry` / etc | structured-typed not free-form; projections filter by type |
| **postit ephemera** | tagged ad-hoc strings, newest-wins per tag — like physical post-its | fast lookup of "where are we right now" — bridge / blockers / hook-dial / etc |
| **cross-session memory** | similarity-searchable store (vector embeddings) for across-session retrieval | event log is per-session; memory bridges sessions |
| **cold-start projection** | one canonical postit (e.g. tagged `bridge`) that newest-wins → next session reads it first | the entry-point pointer; projects through the chain |
| **saga-partition debrief** | projection over event log, partitioned by `saga-entry` boundary events | structured debrief per saga unit; recoverable per-window |
| **substrate snapshot** | inventory projection of all substrates (counts, last-mtimes, dangling files) | answers "where do we stand" effortlessly at cold-start |

## Why this shape

**Compaction-survivability via redundancy.** Doctrine discovered mid-session is replicated across (event log, postit, memory store, plan-file, AGENTS.md, harness settings, externalized gifts, mock SPEC) — see [`plan-mode-forever.md`](./plan-mode-forever.md)'s 8-layer scar armor pattern. Any single substrate failing (compact, git reset, file deletion) still leaves doctrine recoverable from others.

**Cold-start effortlessness.** "Where do we stand" → run the substrate-snapshot projection (~one bash command). "What was the last heading" → read the cold-start projection postit. "What doctrine emerged last saga" → run the saga-partition debrief.

**Synthesis primitives must verify against the source-raw substrate.** Projections are filtered, not ground-truth — see [`handcrawl-saga.md`](./handcrawl-saga.md)'s 3-axis verification matrix (type-3 audit). Trusting projections without source-raw audit produces survivorship bias.

## One implementation example

The project saga-21 ran in (codemogger / glom_MR) uses:

| layer | tool |
|---|---|
| typed event log | `tasklist.jsonl` (append-only JSONL; `bun scripts/arq-log.ts add <type> "<text>"`) |
| postit ephemera | `~/.memelord/postits.jsonl` (global, append-only; `bun scripts/postit.ts -g add <tag> "<body>"`) |
| cross-session memory | `memelord` MCP (SQLite + vector embeddings; `mcp__memelord__memory_*` tools) |
| cold-start projection | postit tagged `bridge`, newest-wins; resolved via `bun scripts/postit.ts -g ls bridge \| tail -1` |
| saga-partition debrief | `scripts/projections/saga-debrief.ts` (projection cached via `scripts/lib/projection-cache.ts`) |
| substrate snapshot | `scripts/projections/state-ascertain.ts` (run at cold-start ritual) |

This is **one** shape. Substitute any tool that satisfies the layer's contract.

## Project retargeting

| layer | constraints | substitution candidates |
|---|---|---|
| typed event log | append-only, JSONL/sqlite, sortable by ts | `events.jsonl`, sqlite + `events` table, an MQ topic |
| postit ephemera | tagged, newest-wins per tag | git notes, redis hash, append-only file with tag column |
| cross-session memory | vector sim-search OR keyword index | mem0, chromadb, sqlite-vec, pgvector |
| cold-start projection | newest-wins pointer | top of CHANGELOG.md, sticky issue, pinned message |
| saga-partition debrief | projection over event log | cron projection, on-demand script, GitHub Action |
| substrate snapshot | filesystem + log inventory | adapt `scripts/projections/state-ascertain.ts` (in-tree, portable) |

## Sister gifts (this corpus)

- [`plan-mode-forever.md`](./plan-mode-forever.md) — 8-layer scar armor pattern that **uses** this substrate
- [`agent-prompt-dial.md`](./agent-prompt-dial.md) — bg-agent prevention block (deliverable shape = bank into this substrate)
- [`handcrawl-saga.md`](./handcrawl-saga.md) — type-3 source-raw audit primitive that **verifies** synthesis vs this substrate

## License

CC0 — public domain.

## Origin

Saga-21 of glom_MR (2026-05-06). Surfaced after operator-noted: *"we have this entire ecosystem of architecture like the all the event stuff — like how gifts currently stand, like that foundation is all hidden."* Documenting the pattern explicitly so the existing gifts have a substrate-doctrine to reference.
