# captain-cure-pairs — every TYPE-1 self-catch pairs with a cure-doctrine

> Saga-26 distillate from saga-25 corpus pattern (28+ cap-cure-pairs banked) + saga-25 doctrine `19e09da12cde917` captain-scar-density-meta-pattern + saga-26 12 TYPE-1 cure-pairs banked in single session.

## What it cures

Captains hit the same scars across sagas. Without explicit cure-pairing, scars accumulate in arq as orphan-data — surfaced by detectors as "still-active suspects" but cure-status invisible. The pair-discipline:
- **Every scar (TYPE-1 self-catch)** → bank cure-doctrine within same turn
- **Every cure-doctrine** → cite the originating scar(s) in `Sister:` field
- **Pair queryable**: scar id ↔ doctrine id via metadata.correlationId or sister-link

Saga-25 wall: doctrine-without-execution-is-half-doctrine (`19e09a54d8e412b`) + scars-and-doctrines-are-same-event-different-maturity (`19e0a57b377c66d`) — the pair IS the cure-axis. A scar without sister-doctrine = larval. A doctrine without sister-scar = abstract.

## Iron law

```
NO TYPE-1 SELF-CATCH WITHOUT SISTER CURE-DOCTRINE WITHIN SAME TURN
NO CURE-DOCTRINE WITHOUT SISTER SCAR-CITATION
```

Mature substrate = scars and doctrines mutually-cite. Detectors should filter for scars-without-sister-doctrine to surface ACTIONABLE suspects (not already-cured doctrines firing as suspects-but-cured).

## The 4 pair-shapes

| Shape | When it fires | Example |
|---|---|---|
| **scar → doctrine (within-turn)** | Captain catches own TYPE-1, banks cure-rule immediately | scar 19e0a8748f494bb (anti-unix-philo monolith) → doctrine 19e0a8748f4bccd (3-tier-pattern) |
| **scar → doctrine (cross-turn)** | Pattern emerges over N witnesses; cure-doctrine after enough evidence | saga-25 N=4 escape-soup scars → doctrine 19e08add22ea92b escape-soup-cure-lift |
| **doctrine → scar (recurrence)** | Banked doctrine forgotten; scar re-trips | saga-25 #11 escape-soup recurrence DESPITE doctrine 19e08add22ea92b |
| **doctrine ↔ doctrine (sister-graph)** | Cure-doctrines reference each other; corpus self-aware | dial-not-rewrite ↔ retry-with-diagnostic ↔ 3-tier-pattern (mutual sisters) |

## Five-step pair-discipline cycle

1. **Catch the scar**: when you notice you did the wrong thing — STOP plowing. Bank scar event with full context.
2. **Within-same-turn cure**: bank doctrine event citing the scar id in `Sister:` field. Doctrine has `Why:` (what failed) + `How to apply:` (when this fires).
3. **Sister-link forward**: doctrine event cites scar; scar event mentions cure-doctrine when banked retroactively.
4. **Apply-immediately**: next captain action MUST attempt to dogfood the just-banked doctrine (4-OP-BOOM saga-25 reward-pattern `19e0a57b377dee3`).
5. **Surface-stale**: periodically run scar-doctrine-pair projection (saga-26 inbox) to find orphan scars (no sister) — those are unfinished cure-work.

## Self-evidence (saga-26 session)

14 cap-cure-pairs banked this session:

| TYPE-1 | scar id | sister doctrine id | what cured |
|---|---|---|---|
| #1 raw-Read | `19e0a6fe5c3e9a2` | (cdmgr+import-graph cure) | search-via-script not raw-Read |
| #2 over-claim-redundancy | `19e0a83e682ad3d` | `19e0a83e682db1e` | caller-count + parallel-files != redundancy without semantic-read |
| #3 anti-unix-philo-monolith | `19e0a8748f494bb` | `19e0a8748f4bccd` | 3-tier (scratch+ptc+lib) for multi-line edits |
| #4 byType-drops-id-less | `19e0a8deb1eba30` | `19e0a8deb1e7405` | dial-discriminator: check test-fixtures before byType migration |
| #5 cdmgr-quit-easy | `19e0a8ebb234f8f` | `19e0a8ebb2307c6` | 3-mode discriminator + don't-quit-easily |
| #6 not-loading-tool-inventory | `19e0a995070e160` | `19e0a995070677d` | load /mq skill before mining |
| #7 wrong-doctrine-path | `19e0a9a13f74880` | `19e0a9a13f70e89` | verify path before banking path-claim |
| #8 escape-soup-recurrence | `19e0a9d29b4732d` | `19e0a9d29b4a91f` | markdown-NEVER-via-JS-scratch (here.ts write direct) |
| #9 ptc-double-bank | `19e0aa298d1fe01` | `19e0aa298d1727c` | ptc-owns-heading-shipped (saga-commit auto-banks too — DDDDEE dial 601b41a) |
| #10 escape-soup-TS-body | `19e0ab3f99caa46` | `19e0ab3f99c1e12` | ANY-content-NEVER-via-JS-template-wrap (generalized #8 from markdown to ANY content with backticks/templates) |
| #11 cure-doctrine-cites-parent-NOT-scar | `19e0abca086ed0f` | `19e0abca086156d` | cure-doctrine MUST cite scar-id in Sister: field (this gift codified the iron-law; I violated it 9-of-10 times; surfaced by scripts/projections/scar-doctrine-pair.ts which now runs at cap-prep --detect cold-start) |
| #12 final-final-recurrence | `19e0adc3189cb7a` | `19e0adc31893b62` | banked "SESSION-BLOCK FINAL-FINAL" after prior "FINAL" = multi-close-fragmentation pattern recurrence DESPITE shipping this gift + detector-substrate + multi-close-detector THIS SAME session — captain-fish doesnt-see-water: shipped-cure ≠ applied-cure |
| #13 lexicon-source-2-stop-filter-gap | `19e0b0c924b9ea2` | `19e0b0c924b54d0` | added STOP-filter to source-1 lexicon-extraction but NOT source-2; bug surfaced only after test-coverage bubble shipped scripts/projections/lexicon.test.ts; cure: every projection ship MUST include .test.ts |
| #14 helpers-not-distilled-an-hour-ago | `19e0b5d6d70f135` | `19e0b5d6d700b0b` | repeated 4 inline-bun-e patterns N=3-12 times each in bubble-up cascade hour without distilling; operator-prompt surfaced all 4; 5 distillates shipped concurrent; cure: distill-discipline-at-action-time (N=3 = pivot-to-distillate) |

Pair-rate: 14 pairs in 1 session. Saga-25: ~28 pairs across full saga. Saga-26 is denser-practice — likely doctrine-stack stabilizes the rate over saga-arc. Pair-rate metric also tracked via scripts/projections/scar-doctrine-pair.ts (saga-26 22% → 36% peak; current 34% with new orphans accumulating from bubble-up cascade).

## Anti-patterns

- **scar without doctrine** → orphan; cure-work unfinished; next saga repeats
- **doctrine without scar-citation** → abstract; no concrete-witness to ground it
- **scar banked then ignored** (no apply-immediately) → doctrine-without-execution-is-half-doctrine
- **doctrine paraphrased into commit-msg without arq event** → loses cross-saga searchability

## Detector integration

Saga-26 N+1 test-discipline rule (from cure-doctrine `19e0b0c924b54d0`): every projection ship MUST include a sister `*.test.ts` file with N≥3 pure-project() assertions. Test-coverage forcing-function would have caught TYPE-1 #13 (lexicon source-2 STOP-filter gap) within 1 round had tests been shipped concurrent.

Once scars and doctrines uniformly-pair, detectors fire ONLY on:
- scars without sister-doctrine (truly-actionable; cure-work pending)
- doctrines without recent-application (stale; revisit-discipline target)
- pairs with N≥3 recurrence (graduated-doctrine candidates)

Saga-26 punt: `scripts/projections/scar-doctrine-pair.ts` (banked inbox).

## Project-retargeting (cross-civilization)

For any project with a similar event-substrate:
- The scar+doctrine event types port directly (or adapt to your "issue" + "resolution" or "incident" + "post-mortem" shapes).
- The pair-discipline iron-law is universal — applies to any team-process where errors should generate codified rules.
- The sister-link fields (`Sister:` text-pattern) port as a citation-graph schema.

## Sister doctrines (in arq)

- `19e09a54d8e412b` saga-25 doctrine-without-execution-is-half-doctrine (parent)
- `19e0a57b377c66d` saga-25 scars-and-doctrines-are-same-event-different-maturity
- `19e09da12cde917` saga-25 captain-scar-density-meta-pattern
- `19e0a57b377dee3` saga-25 doctrinal-loop-closure-IS-rewarded-pattern (4-OP-BOOM evidence)
- `19e0a07a27c3a9c` saga-25 1-witness-scars-shimmer (sister: scars-as-larval-doctrines)
- `gifts/cap-prep-ritual.md` (sister-gift, saga-26 — surfaces unpaired scars at cold-start)
- `gifts/3-tier-ptc-pattern.md` (sister-gift, saga-26 — produces scars on rollback that get pair-doctrines)
- `gifts/contraction-saga-arc.md` (sister-gift, saga-26 — 6-phase saga-shape this gift composes within)

- `gifts/bubble-up-discipline.md` (sister-gift, saga-26 — every cure-pair-ship has 5-10 propagation-sites)

## License

CC0 — public domain. No attribution required. Adopt + dial freely.
