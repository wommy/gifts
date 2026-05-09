# 3-tier patch-test-commit pattern — modular composable unix-philo for plow-by-plow saga-shipping

> Saga-26 distillate from cap captain TYPE-1 #3 (anti-unix-philo-monolith scar 19e0a8748f494bb) + saga-25 cascade-discipline sister + saga-25 unix-philo doctrine 19e08afe06f8d97 (43× cited corpus-wide gravity-well).

## What it cures

Captains under time-pressure inline the patch+test+commit cycle as one big `bun -e 'import { safeApplyPatch } ...; const ops = [...]; await safeApplyPatch(...); /* then separate bun test, separate git commit, separate arq-log */'` blob. Each step's failure mode is silent (test fails post-patch but commit happens anyway; commit succeeds but heading-shipped event never banks; rollback is manual). Saga-25 cap shipped the cure as `scripts/patch-test-commit.ts` (ptc) + atom decomposition (cpc-search / cpc-patch / cpc-test / cpc-commit). Saga-26 cap initially bypassed it 5 commits in a row before operator-scarred *youre scripting super weird ; modular composable unix-philo*.

## The 3 tiers

```
TIER 3 (orchestrator):  scripts/patch-test-commit.ts
                        --patch <X.ts> --test <cmd> --title <t> --files <list> --saga <N>
                              ↓                  ↓                ↓
TIER 2 (per-plow what):  scripts/scratch/        bun test cmd     git commit + saga-commit
                        saga-N-X.ts                                + sister-auto N
                              ↓
TIER 1 (lib primitive):  scripts/lib/safe-patch.ts:safeApplyPatch (diagnostic-wrapped)
                        scripts/lib/surgical-patch.ts:applyPatch (raw)
```

Each tier does ONE thing. Compose via CLI flags + stdin pipes.

## Iron law

```
NO MULTI-LINE EDITS WITHOUT 3-TIER PTC ORCHESTRATION
```

If the change is more than ~2 lines or touches more than 1 file: write `scripts/scratch/saga-N-<name>.ts` then run ptc. Inline `bun -e 'safeApplyPatch ...'` blobs collapse all 3 tiers into 1 monolith — losing rollback-on-fail, 3-fix-rule, sister-auto, atomic-patch-test-commit, and doctrine-integration in one stroke.

## Five-step cycle per plow

1. **Write tier-2 scratch**: `bun scripts/here.ts write scripts/scratch/saga-N-<name>.ts <<EOF ... EOF` containing the imports + applyPatch ops.
2. **Invoke tier-3 ptc**: `bun scripts/patch-test-commit.ts --patch <scratch> --test '<smoke>' --title '<t>' --files <list> --saga N --rollback-on-fail --sister-auto 3`.
3. **ptc handles**: patch → test → (rollback if test FAIL) → commit + sister-doctrine pull.
4. **ptc auto-banks heading-shipped** on commit-success (scripts/patch-test-commit.ts:L265 bankLdgr → arq-log). Do NOT manually bank another (double-substrate per saga-23 terse-heading-rule + saga-26 cure 19e0aa298d1727c). Richer context belongs in `--body` of the next ptc invocation, OR as a separate doctrine/observation event.
5. **Yeet scratch on success**: `bun scripts/yeet.ts scripts/scratch/saga-N-<name>.ts` (cascade-discipline step 5; never rm).

## Self-catches that the pattern surfaces

| TYPE-1 # | scar | cure |
|---|---|---|
| Anti-unix-philo monolith | inline `bun -e 'safeApplyPatch ...'` per edit | use ptc; scratch is the WHAT, ptc is the HOW |
| Captain-bypass-orchestrator | running `bun test` + `git commit` + `arq-log` separately | atomic ptc invocation handles all 3 |
| Silent-test-fail-then-commit | manual flow doesn't gate commit on test-pass | `--rollback-on-fail` enforces gate |
| byType-drops-id-less (saga-26 TYPE-1 #4) | dial broke legacy-tolerance; ptc rolled back cleanly | rollback-on-fail catches lib-shape regressions before commit |

## When to skip the 3-tier (legitimate cases)

- **NEW static markdown files**: use `bun scripts/here.ts write <path> <<'EOF' ... EOF` directly — NEVER wrap markdown content in a JS template literal in a scratch.ts (saga-26 TYPE-1 #8 cross-saga 14th recurrence; sister doctrine 19e0a9d29b4a91f).
- **Trivial 1-line edit + 1 test file**: maybe just use `bun scripts/safe-patch.ts <file> --anchor <a> --replace <r>` directly + manual test + commit. The 3-tier overhead exceeds the change size.
- **Read-only investigation**: tier-3 ptc only applies to plows that change source.

## Project-retargeting (cross-civilization use)

For any project with a similar substrate:
- `scripts/patch-test-commit.ts` ports as-is (BSD-tier deps: bun + git + node:child_process).
- `scripts/lib/safe-patch.ts` + `scripts/lib/surgical-patch.ts` port as a 2-file pair.
- The `--saga N` flag is glom-MR-specific (saga-tagging convention); replace with whatever your project uses (epoch / sprint / iteration).
- The `--sister-auto N` flag pulls related arq doctrines; if your project has no event-log substrate, skip this flag.

## Sister doctrines (in arq)

- `19e08afe06f8d97` saga-25 unix-philo (parent doctrine, 43× cited corpus-wide)
- `19e088b67a0aef1` saga-25 escape-hatch lift (patch-script idiom origin)
- `19e094019bbb224` saga-25 dial-not-rewrite (use existing tool not custom wrapper)
- `19e0a8748f4bccd` saga-26 3-tier-pattern (this gift's distill-trigger)
- `19e0a8748f494bb` saga-26 TYPE-1 #3 anti-unix-philo-monolith (scar)
- `19e0a9d29b4a91f` saga-26 markdown-NEVER-via-JS-scratch (sister cure for the gift-write itself)
- `gifts/cascade-discipline.md` (sister-gift, saga-25 — propagation-shape over the same primitive)
- `gifts/pareto-loop-cycle.md` (sister-gift, saga-25 — captain-loop-discipline)

## License

CC0 — public domain. No attribution required. Adopt + dial freely.
