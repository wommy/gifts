# projection-as-substrate-of-truth — chain Projection<S, P> from event-log to actionable signal

> Saga-26 distillate from saga-17 doctrine `19df51358fe9ea3` projection-cache lift + saga-26 R1.0 `19e0a72867265c6` IndexedCorpus + saga-26 5-neutron-star P1+P2 doctrines + 3 session-shipped projections (gift-evidence / scar-doctrine-pair / lexicon).

## What it cures

Captains build raw-event-log surfaces (arq tasklist.jsonl, postits.jsonl, session jsonl), then query them ad-hoc with grep/jq/rg. Each query rebuilds the same indices (filter by type, group by saga, count by correlationId). Same work, repeated, no caching, no composability. Saga-25 wall: 18 readEvents callers each filtering inline; same indexing-shape duplicated 18 times.

The cure: build ONE indexed-projection-of-truth (P1) from raw events, then ALL downstream projections compose it. Each projection becomes a thin transformation. Cap-prep --detect = 4 substrates surfaced via 4 cooperating projections in <500ms.

## The chain

```
TIER 0 (raw event log):       arq tasklist.jsonl + postits.jsonl
                              Append-only; never edited.

TIER 1 (substrate-of-truth):  arqProjection: Projection<Event[], IndexedCorpus>
                              Cached. Indices: byId / byType / byCorrelationId.
                              ONE rebuild on .invalidate(); shared across consumers.

TIER 2 (composing projections): each composes arqProjection.get() + adds analysis layer
  - gift-evidence:    per-gift heading-shipped witness count + seshae cross-tier
  - scar-doctrine-pair: cite-graph orphan-filter (lib/event-graph:extractCitedIds)
  - lexicon:          operator-coined term mining + cross-corpus cite-density

TIER 3 (orientation):         cap-prep --detect surfaces all 4 projection outputs
                              Cold-start = 1 invocation, 4 substrates, ~500ms.
```

## Iron law

```
NO INDEXING-SHAPE DUPLICATION ACROSS PROJECTIONS
ONE Projection<Event[], IndexedCorpus> SOURCE-OF-TRUTH; N CONSUMERS THIN-WRAP IT
```

## Five-step pattern per new projection

1. **Identify the question shape**: per-X count? cross-Y density? orphan-filter? sister-graph traversal?
2. **Compose existing primitives**: `arqProjection.get()` for IndexedCorpus + `extractCitedIds` for sister-links + `eventsProjection.get()` for raw `Event[]` if needed.
3. **Add ONLY the analysis-layer**: filter / group / count / render. Never re-implement readEvents or buildIndexedCorpus.
4. **Wrap as Projection<S, P>**: cache via projection-cache; dirty-invalidate on source-change.
5. **Surface via cap-prep --detect** OR `memory/auto-*.md` for human consumption + sister-projection consumption.

## When NOT to add a projection

- **Single-use ad-hoc question** → use `bun -e 'import { arqProjection } from ...; const corpus = await arqProjection.get(); ...'` inline. Don't pollute scripts/projections/.
- **Question is a transform of an existing projection** → ADD a render-mode flag, don't ship a new file.
- **Substrate change is fundamental** (new event-type schema) → may need a new TIER-1 primitive, not a TIER-2 consumer.

## Self-evidence (saga-26 session)

4 projections shipped this session, each demonstrating the pattern:

| Projection | Source | Build | Output |
|---|---|---|---|
| `gift-evidence.ts` | `arqProjection.get()` | regex-match per gift filename + seshae shell-out | `memory/auto-gift-evidence.md` (witness-counts) |
| `scar-doctrine-pair.ts` | `arqProjection.get()` | `extractCitedIds` cite-graph + TYPE-1 #N ordinal | `memory/auto-scar-doctrine-pair.md` (orphan audit) |
| `lexicon.ts` | `arqProjection.get()` | 2-source extraction + cross-corpus cite-count | `memory/auto-lexicon.md` (operator-coined gravity-wells, 1401 terms) |
| `scripts-corpus.ts` | filesystem walk | header + caller-graph (lib/import-graph) + tier-classify | `memory/auto-scripts-corpus.md` (corpus-topology + hubs + orphans) |

Each is ~80-120 LOC. Each composes P1 + P2 + lib helpers. None re-implements indexing.

**Saga-26 milestone**: ~80 invocables (corpus-wide) declare `substrateRequires` array (arq / postit / filesystem / github-remote / cross-harness / codemogger / git / etc) per saga-26 doctrine `19e0af044e574df` substrate-fit-discriminator. Coverage: 32 projections + 1 lib + 1 orchestrator + ~46 CLIs (test/mock/postit/closeloop/distill/agent/saga-{commit,walk,recurse,onramp-gen}/cdmgr-search/safe-patch/arq-log/yeet/here/anchor-find/dyad-tail/handcrawl-saga/locate-codex/seshae-{arq,mine,batch,saga}/promotion-candidates/audit-forks/boom-dedup/research/promote-from-draft/openspec-archive/mocker/fitness-recommend/bun-docs/arq-search/page-seshae/mine-memelord/compact-brace/sccache-garage/detect/scar-destroyer/full-arq-mine/etc). Forcing-function for orchestrators to dynamic-discover available scripts per-substrate.

## Anti-patterns

- **Re-implementing filter-by-type** in each projection → use `corpus.byType.get('X') ?? []`
- **Re-reading the log** in each projection → source from `arqProjection.get()` (cached)
- **Hand-banked observation events** instead of writing a projection that surfaces the same
- **Output to scripts/scratch/<one-shot>.ts** that does the analysis once → if you'll ask the same question twice, ship as `scripts/projections/<name>.ts`

## Project-retargeting (cross-civilization)

For any project with an event-log substrate:
- TIER 1 — build YourEventCorpus<Indices> with project-specific indices (not just byType/byCorrelationId)
- TIER 2 — each projection composes the indexed corpus, never re-walks raw events
- TIER 3 — surface via your project's cold-start ritual (cap-prep equivalent)

The projection-cache lib (`scripts/lib/projection-cache.ts`, ~70 LOC) is BSD-tier portable; ports unchanged.

## Sister doctrines (in arq)

- `19df51358fe9ea3` saga-17 projection-cache lift (parent — Projection<S, P> origin)
- `19e0a72867265c6` saga-26 R1.0 IndexedCorpus (P1 neutron-star primitive)
- `19e0a51b2e10dd0` saga-26 5-neutron-star-primitives (P1+P2 composition pattern)
- `19e08afe06f8d97` saga-25 unix-philo composition (parent — composability discipline)
- `19e0a47aef7c3d8` saga-26 gifts-as-civilization-substrate (this gift IS such an externalization)
- `gifts/3-tier-ptc-pattern.md` (sister-gift, saga-26 — patch+test+commit also composes lib primitives)
- `gifts/detector-substrate.md` (sister-gift, saga-26 — detector apparatus composed via projections)
- `gifts/captain-cure-pairs.md` (sister-gift, saga-26 — scar-doctrine-pair surfaces orphan-pairs)
- `gifts/contraction-saga-arc.md` (sister-gift, saga-26 — 6-phase saga-shape this gift composes within)

## License

CC0 — public domain. No attribution required. Adopt + dial freely.
