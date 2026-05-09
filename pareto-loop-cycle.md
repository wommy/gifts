# pareto-loop-cycle — captain plow-discipline (saga-25 doctrine, gift v1)

Operator-coined "keep looping the pareto-cuts". Captain executes N synthesis→plow loops without inter-loop steer.

## The 5-step loop

1. **Synthesis** (red/blue/survivorship++/belt&suspenders):
   - RED type-1: what's the false-positive in my last claim?
   - BLUE type-2: what did I miss that would change the cut?
   - SURVIVORSHIP++: what worked across 3+ similar prior cuts?
   - WINNER: pareto-cut declaration.

2. **Declare pareto-cut** (1 sentence; concrete tool/file/edit).

3. **Plow** (apply via doctrined-tool: `lib/safe-patch:safeApplyPatch` for edits, `lib/bank:bankEvent` for events, `bun scripts/here.ts write` for new files).

4. **Verify smoke** (run the result; confirm output).

5. **Saga-commit** (saga-tagged + sister-cited).

## When to loop end

- Context-warning (operator updates at breaks; captain stops at next natural pause)
- 5-10 loops typical natural-end
- Diminishing-return signal in red/blue (RED becoming "stretching legs")

## Discipline

- **NO awaiting-steer between loops** — operator updates context-window only; captain plows.
- **NO mid-loop pivot** — finish the declared cut OR retry-with-diagnostic.
- **NO asking-questions-between-loops** — synthesis is the question, plow is the answer.

## Saga-25 witness (validation: 10 loops clean)

| loop | cut |
|---|---|
| L1 | cap-prep filter-fix (saga-N+1 → saga-N inbox semantic) |
| L2 | escape-soup-detect ship (2nd evergreen-detector) |
| L3 | cap-prep compose escape-soup |
| L4 | captain-orch-detect ship + compose |
| L5 | lib/detector + registry + dispatcher (3+ callers ladder) |
| L6 | cap-prep collapse → detect.ts --all + yeet 5 individuals |
| L7 | v7 bridge MANDATORY-RITUAL + 3-question synthesis |
| L8 | lib/safe-patch + lib/detector tests (boss-cure-libs covered) |
| L9 | DETECTORS registry coverage |
| L10 | full sweep — 2447/2447 green |

10 commits across 10 loops. Zero regression. Substrate-completion validated.

## Sister doctrines

- `19e094019bbb224` dial-not-rewrite (per-loop discipline)
- `19e09e6e6f50495` retry-with-diagnostic (per-loop synthesis)
- `19e09bf67bcd4af` CAP-CURE-PAIR #18 lift-vs-floor (per-loop scope)
- `19e0a19c97cdc83` mandatory-cold-start-ritual (the FIRST loop of saga-N)

## Project retargeting

Substitute:
- `lib/safe-patch:safeApplyPatch` → your project's diff-only patcher
- `lib/bank:bankEvent` → your event-bank primitive
- `bun scripts/here.ts write` → your fresh-file writer

Universal: 5-step loop, end-conditions, discipline.

## License

CC0 — public domain. Use, adapt, redistribute.
