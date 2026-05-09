# detector-substrate — evergreen-scar detection + cure-pair audit + actionable filter

> Saga-26 distillate from saga-25 6-rank gift queue #2 + saga-25 detector-registry doctrine + saga-26 scar-doctrine-pair projection (just shipped). Bundles the 4-piece detector apparatus that surfaces actionable cure-work without firing on already-cured doctrines.

## What it cures

Captains run a "detect" command, get back 50+ "suspects". Most are scars that ALREADY have sister cure-doctrines (false-positive: cure landed; detector doesn't know). Captain pivots back to manual investigation OR ignores the noise. Detector becomes orientation-only, not actionable. Saga-25 wall: 36 multi-close suspects, 80% already-cured, 20% actionable; the actionable 20% lost in noise.

The cure: detection in 2 stages — (a) raw text-pattern detect (saga-25), (b) orphan-pair filter (saga-26 scar-doctrine-pair). Together: ONLY scars without sister-doctrines surface.

## The 4-piece apparatus

```
TIER 1 (lib primitive):  scripts/lib/detector.ts:runDetector(opts)
                        Async; reads arq via P1 arqProjection; returns {suspects, bySaga}
                        Filters by pattern + antiPattern + types.

TIER 2 (registry):       scripts/lib/detector-registry.ts:DETECTORS[]
                        Data-driven 5-detector registry: each entry = {name, description,
                        pattern, antiPattern, types}. Saga-26 5 detectors:
                        multi-close / escape-soup / captain-orch / duplication-mandate / parallel-shim.

TIER 3 (CLI):            scripts/detect.ts
                        bun scripts/detect.ts --all              # run all 5 detectors
                        bun scripts/detect.ts --name <det>       # run one detector
                        Composes registry + runDetector + renderDetector.

TIER 4 (orphan-filter):  scripts/projections/scar-doctrine-pair.ts
                        Lifts cite-graph (lib/event-graph:extractCitedIds); identifies
                        orphan-scars (no sister doctrine cites them) vs paired-scars.
                        ACTIONABLE-cure-loop substrate.
```

## Iron law

```
DETECTOR FIRES on scar text-pattern → ORPHAN-FILTER drops scars with sister-doctrine
ACTIONABLE = SUSPECTS ∩ ORPHAN-SCARS
```

Detector alone = noisy. Pair-filter alone = misses unbanked cure-doctrines. Together = actionable.

## Five-step detect-cure cycle

1. **cap-prep --detect** at cold-start runs both detect.ts (--all) + scar-doctrine-pair (orphan audit). Captain sees: suspect-clusters BY DETECTOR + orphan-count BY SAGA.
2. **Read top orphan** from scar-doctrine-pair output — these are TRUE cure-work-pending (no sister-doctrine yet).
3. **Apply cure**: actively-cure / mark-stale / point-to-existing-cure-doctrine that should-have-been-cited.
4. **Bank cure-doctrine** with `Sister: <scar-id> (the cured scar)` FIRST in citations (per saga-26 TYPE-1 #11 cure 19e0abca086156d).
5. **Re-run scar-doctrine-pair**: pair-rate climbs; orphan list shrinks; cure-loop closes.

## Detector-dial discipline (saga-26 calibration)

Each detector has a `pattern` (text-match for scar) + `antiPattern` (exclude already-cured strings + self-references). Anti-pattern dials needed when:
- Detector fires on the cure-doctrine event itself (self-reference)
- Detector fires on retro-close events that mention the scar but ARE the cure
- N false-positives exceed N true-positives 2:1 over 100+ events

Cure: tighten antiPattern with negative-lookahead OR add cite-graph filter (orphan-pair only).

## Project-retargeting (cross-civilization)

For any project with similar substrate:
- `scripts/lib/detector.ts` (~50 LOC) ports as TS function over arq event log.
- `scripts/lib/detector-registry.ts` is data-only — 5 entries you author per your project's recurring scars.
- `scripts/detect.ts` (~30 LOC CLI) ports as-is.
- `scripts/projections/scar-doctrine-pair.ts` (~80 LOC) needs cite-graph (which needs arq-id pattern + Sister: convention).

The cure: BUILD detection in 2 layers — text-match THEN cite-graph orphan-filter. Either alone is noisy; together = actionable.

## When to ship a NEW detector

Saga-25 N=5-detector threshold: a recurring scar pattern earns its own detector if:
- ≥5 cross-saga witnesses of the scar
- pattern matchable via regex (not just semantic)
- cure-doctrine landed (so antiPattern can exclude it)

Below threshold: just bank scars with consistent text-tags so future grep finds them.

## Sister doctrines (in arq)

- `19e0a0b4818317e` saga-25 detectors-not-doctrines (parent — detectors as data-config)
- `19e08fcdc1bffda` saga-25 multi-close-fragmentation (1st detector's origin scar)
- `19e09cbe8662564` saga-25 escape-soup-recurrence (2nd detector's origin)
- `19e087acd65c36c` saga-25 captain-orchestration (3rd detector's origin)
- `19e0968fac1444b` saga-25 duplication-monolith (4th detector's origin)
- `19e062a244a47f7` saga-24 parallel-invented-shim (5th detector's origin)
- `19e0abca086156d` saga-26 cure-doctrine-MUST-cite-scar-id (orphan-filter prerequisite)
- `gifts/captain-cure-pairs.md` (sister-gift, saga-26 — codifies the cure-pair iron-law)
- `gifts/cap-prep-ritual.md` (sister-gift, saga-26 — cap-prep --detect runs this apparatus)

## License

CC0 — public domain. No attribution required. Adopt + dial freely.
