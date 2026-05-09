# cascade-discipline — propagating a fix-pattern across N callers without scope-creep scar

> Saga-25 distillate from 5 ptc-svelte-spawnSync cascades + 6 captain TYPE-1 self-catches. Pattern that worked AFTER the captain repeatedly didn't.

## The pattern

When a single dial-fix proves correct on one caller, propagate the **same shape** across N additional callers via repeated `patch-test-commit` (ptc) invocations. Each cascade hop is independently committable + revertable. Operator-grant on the FIRST cascade implicitly grants the loop until interrupted.

## Iron law

```
NO CASCADE WITHOUT VERIFY-CALL-GRAPH-BEFORE-FIX
```

Trace the failing path BEFORE patching: `lsof <db>`, `ps -o cmd <pid>`, `grep '@import-name' <runner-cli>`. Error-trace path ≠ running-process path. (Saga-25 captain TYPE-1 #6 — patched `codemogger-pkg-mock-v0` because trace pointed there; running MCP actually used `codemogger-mock-v0`. Different mock, fix didn't help velocity.)

## Five-step cycle per cascade-hop

1. **Identify caller** via `rg -l '<pattern>' scripts/ -g '!scratch/' -g '!*.test.ts'`
2. **Read shape**: how does THIS caller use the pattern? Each variant has corner cases.
3. **Patch via ptc**: `bun scripts/patch-test-commit.ts --patch <patch-script> --files <caller> --test '<smoke>' --title '...'`
4. **Smoke-test shape matters**: target script with top-level arg-validation that calls `process.exit(N)` on missing args fails naive `bun -e import` smoke. Cure: `bun build --target=node --outdir /tmp <file>` for type-only check.
5. **Yeet patch-script** to scratch/archive after cascade-hop succeeds. Never rm.

## Self-catches that broke the chain

| TYPE-1 # | scar | cure |
|---|---|---|
| #1 | claimed cache where pre/post-patch were genuinely different work | belt&suspenders survivorship on captain claims, not just operator |
| #2 | PRIMARY-anointing without DDDD pre-verify | DDDD-pre required for tier claims |
| #3 | misread grep -c output as test-count | distinguish line-N hits from N-tests in grep output |
| #4 | about to migrate cascade-engine mid-cascade (saga-commit.ts) | engine-itself = cascade-floor; don't lift the floor mid-walk |
| #5 | claimed 'cdmgr-blocked'; multiple alt-tools available | obstacle-routing is 1st-tier debugging not 5th |
| #6 | patched wrong mock (call-graph mismatch) | verify-call-graph-before-fix |

Six TYPE-1 self-catches in one saga = pattern firmly established. The cure is the 5-step cycle above. Each step has a discriminator that catches a specific TYPE-1.

## When to STOP cascading

- **>3 corner cases** in a row → step back, re-shape the pattern
- **engine-itself** as next target → STOP (saga-25 caught: saga-commit, ptc itself)
- **operator interrupt with steer** → comply
- **scope-creep mid-cascade** (e.g., partial cc-#129) → bank as inbox punt, don't expand mid-arc

## Sister doctrines (saga-25 arq corpus)

- shoulders-discipline: cdmgr-mine scripts/lib/ + scripts/ for prior-art before naming any new primitive
- dial-not-rewrite: kill retry-loop, Promise.all batch, async-generator wraps — small dials, big wins
- obstacle-routing-as-1st-tier-debugging: when Tool A blocks, Tool B (rg/bat/Read/jq) often unblocks
- verify-call-graph-before-fix: error-trace ≠ running-process; verify before patching
- substrate-tier-ladder: scratch → yeet → archive → distill → promote → doctrine

## Project retargeting

Substitute:
- `scripts/patch-test-commit.ts` → your project's TDD-gated patch primitive
- `scripts/lib/proc.ts:run` → your project's proc lib
- `bun build --target=node` → your project's type-check command

Universal: the 5-step cycle, the iron law, the 6 TYPE-1 cure-discriminators.

## License

CC0 — public domain. Use, adapt, redistribute.
