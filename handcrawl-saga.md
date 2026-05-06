# handcrawl-saga.ts — first gift (saga-21 2026-05-06)

Primary-source handwalk over Claude Code session jsonl with operator-tunable filters. Surfaces what script-mediated extraction peppers over.

## Why

Banked event projections (arq, debriefs, summaries) capture **what-got-banked**, not **what-actually-happened**. The first arc of a saga (genesis discussion, mid-dialog reframes, coined verbage emerging conversationally) typically carries juice that script-extraction filters out. **Survivorship bias** — we count what scripts count; what scripts miss is invisible.

handcrawl-saga reads the raw session jsonl directly, with operator-tunable filters that reveal vs hide structure on demand.

## Source

- `scripts/handcrawl-saga.ts` (~250 LOC, library + CLI)
- `scripts/handcrawl-saga.test.ts` (~120 LOC, 15/15 green)

## CLI

```
bun scripts/handcrawl-saga.ts [sessionId|path] [--saga N] [--from ts] [--to ts]
                              [--filter raw|substantive|juice]
                              [--role user|assistant]
                              [--limit N] [--minlen N] [--no-dedup] [--md]
```

## Filters

- `raw` — every text-bearing event; primary-source ground-truth
- `substantive` — replicates seshae-saga heuristics (skip system-reminders, len ≥ minLen)
- `juice` — surfaces BOOM/EUREKA/aside/coinage/reframe/operator-dialect markers

## Dedup (v1.1)

Default-on collapse of cancelled-resent chains (operator type-edits-cancels-resends pattern). Final canonical version retains `superseded: N` count. `--no-dedup` opts out for survivorship-bias resistance.

## Empirical validation

Saga-20 window: raw=1229 / substantive=185 / juice=66 vs arq saga-20 ≈130 events.
Substantive surfaces 1.4× more than arq projection; raw surfaces 9.5× more.
That's the script-as-floor leak made visible.

Saga-21 first arc dogfood: juice 15→5 after dedup (67% noise reduction), 4 superseded chains detected (max 7-deep on operator's onboarding directive resends). Signal preserved, noise collapsed, survivorship-bias dial intact.

## Origin

Lifted as gravity-distill candidate during saga-21 close after v1+v2 saga-n1-soft-arc syntheses both:
- drifted on countable facts (handcrawl-fix: type-2 fact verification gate)
- missed entire structural arcs — pipeline-inheritance, class-discovery, sub-arc conversations (handcrawl-fix: type-3 source-raw audit)

The synthesis primitives produced confident-sounding drift because the substrate they fed on was already filtered. handcrawl-saga unfilters at the source.

## Three-axis verification matrix (companion doctrine)

- Type-1: does my synthesis FEEL right? (intuitive)
- Type-2: does the script COUNT match my claims? (countable verification)
- Type-3: does the script REPRESENT all the juice? (source-raw audit — handcrawl-saga is the script-form)

Failure across all three = synthesis structurally untrustworthy.

## Project-specific bits to retarget

- `PROJECTS_DIR` constant points to `~/.claude/projects/-home-wom-infra-glom-MR` — change for your project
- `ARQ_LOG` defaults to `tasklist.jsonl` — your event-log path if you have one
- Saga-window resolution requires arq events of type `saga-entry` with text matching `/saga[-\s]?(\d+)\s+CLOSED/i` — adapt to your saga conventions

Library API (`crawl`, `dedupeChain`, `applyFilter`, `renderMd`) is project-agnostic.

## Pipe recipes (v1.2)

Compose with sister tools — JSONL output is line-oriented; works with `jq`, `awk`, `grep`, anything Unix-y:

```bash
# Re-read operator directives across a saga (--role user filter)
bun scripts/handcrawl-saga.ts --saga N --role user --filter substantive --md

# Discourse-pair view (--pairs emits user→assistant turn units)
bun scripts/handcrawl-saga.ts --from <ts> --to <ts> --pairs --filter substantive --md

# Source-raw type-3 audit feeding into a synthesis primitive
bun scripts/handcrawl-saga.ts --saga N --filter raw | jq -r '.text' > /tmp/raw-saga-N.txt

# Juice-only feed into cost-offload doctrine mining
bun scripts/handcrawl-saga.ts --saga N --filter juice --no-dedup | jq -r '.text' | wc -l
```

The `--pairs` view is particularly useful for re-reading saga arcs as discourse units — the operator's question + the agent's reply land together as one turn unit.
