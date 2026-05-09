# substrate-tier-ladder — scratch → yeet → archive → distill → promote → doctrine

> Saga-26 distillate from saga-25 doctrine `19e08b9788289ec` substrate-tier-ladder (26× cited corpus-wide gravity-well, operator-coined verbs cluster). Captures the 6-verb workflow that preserves substrate while surfacing emergent primitives. **NEVER rm — always yeet.**

## What it cures

Captains under cleanup-pressure delete experiments — losing substrate-evidence + breaking yeet-philosophy. Saga-25 wall: captain rm-philosophy-violation scar (`19e08b97882bd9a`) before this 6-verb cure lifted. Each verb is a **named primitive script** + each step **preserves substrate** + **NO step deletes**.

## The 6 verbs (each verb = a script primitive)

| Verb | Script | What it does |
|---|---|---|
| **scratch** | `scripts/here.ts write scripts/scratch/<name>.ts <<EOF...EOF` | One-shot experiment in scratch tier |
| **yeet** | `scripts/yeet.ts <files> --saga N --reason <r>` | Move scratch → `scripts/scratch/archive/saga-N/`. NEVER rm. Banks arq event. |
| **archive** | (implicit: scratch/archive/saga-N/ accumulates) | Long-tail record of every scratch experiment |
| **distill** | `scripts/distill.ts` (saga-26 PRIMARY #3) | Find emergent patterns across N≥3 archive entries |
| **promote** | (manual: archive → scripts/lib/ or scripts/projections/) | Once distilled, promote primitive to active tier |
| **doctrine** | `scripts/arq-log.ts add doctrine "..."` | Codify the rule that emerged from N witnesses |

## Iron law

```
NEVER rm. ALWAYS yeet. Every script-experiment that ran produces evidence;
substrate is the corpus's memory of what was tried.
```

## When each verb fires (decision matrix)

| Situation | Right verb | Why |
|---|---|---|
| Trying a 1-shot dial | `scratch` | Cheap; no commit-pressure |
| Scratch ran successfully + won't be reused | `yeet` | Preserve evidence; archive tier |
| 3 archived scripts share a pattern | `distill` | Pattern-emergence threshold |
| Distilled pattern proven across N≥3 callers | `promote` | Earn place in active tier |
| Promoted primitive's BEHAVIOR is the rule | `doctrine` | Behavior-as-rule codification |

## Five-step cycle per scratch-experiment

1. **scratch**: `bun scripts/here.ts write scripts/scratch/saga-N-<name>.ts <<EOF` (heredoc-direct for any content). Edit/test/iterate.
2. **execute** the experiment (run it once or in a ptc plow).
3. **yeet on success**: `bun scripts/yeet.ts scripts/scratch/saga-N-<name>.ts --saga N --reason "<one-line>"`. Banks arq event auto.
4. **distill periodically**: when N≥3 archive entries share a shape, `bun scripts/distill.ts` surfaces them; lift to scripts/lib/ or scripts/projections/.
5. **doctrine after promote**: bank arq doctrine event capturing the rule the promoted primitive enforces.

## What violates the ladder (anti-patterns)

- **rm a scratch file** → loses substrate evidence permanently (saga-25 captain rm-violation scar `19e08b97882bd9a`)
- **commit a scratch file to scripts/** without yeet+distill+promote → skips the earn-your-tier discipline
- **bury a doctrine in commit-msg** without arq event → loses cross-saga searchability
- **promote at N=2 callers** → premature; saga-25 op-coined N≥3 callers as the bubble-up threshold

## Self-evidence (saga-26 session lived the ladder)

**Saga-26 distill→promote witness** (operator-caught at 200+ commits): captain repeated 2 patterns N=12+ times each before distilling:
- gift-mirror chain (copy → commit → push) → `scripts/sync-gifts-public.ts` distillate
- substrate-fit batch annotation → `scripts/annotate-substrate-requires.ts` distillate

Operator-prompt: *"are there any helpers you should have cut an hour ago"* surfaced both. Tip-#4 of saga-26 meta-tips: bubble-up after every SQ-close + audit for repeat-patterns.


This session executed the ladder 3+ times:
- 5 scratch one-shots written via `here.ts write` (saga-26-r5-byType-dial.ts / saga-26-r5-2-dial.ts / saga-26-cdmgr-dial.ts / saga-26-gift-3tier-ptc.ts / saga-26-saga-commit-auto-heading.ts / saga-26-ptc-delegate-heading.ts)
- All yeeted to `scripts/scratch/archive/saga-26/` after success via `scripts/yeet.ts`
- 1 archived experiment (saga-26-gift-3tier-ptc.ts) yeeted as a TYPE-1 #8 cure-witness (escape-soup recurrence)
- Cure-doctrines for each TYPE-1 self-catch banked in arq

The ladder's discipline IS the saga-26 close-out shape.

## Project-retargeting (cross-civilization)

For any project with a similar substrate:
- `scripts/here.ts write` → your project's heredoc-write primitive (or `cat > file`)
- `scripts/yeet.ts` → ~40 LOC: rename + git mv + bank-event. Easy port.
- `scripts/distill.ts` → ~80 LOC scanning N-archived for shared shape. Project-specific patterns.
- The 6-verb names + decision-matrix + N≥3 threshold port unchanged.

## Sister doctrines (in arq)

- `19e08b9788289ec` saga-25 substrate-tier-ladder (parent doctrine, 26× cited)
- `19e08b97882bd9a` saga-25 captain rm-violation scar (the cured)
- `19e0a47aef7c3d8` saga-26 gifts-as-civilization-substrate (gift-tier as 7th-rung extension)
- `19e0a834206fb73` saga-26 collapse-not-build (saga-26 shape: yeet-and-distill not build-new)
- `gifts/3-tier-ptc-pattern.md` (sister-gift, saga-26 — uses yeet-after-success in step 5)
- `gifts/cascade-discipline.md` (sister-gift, saga-25 — same yeet-after-cascade-hop)
- `gifts/dial-loop-toolbox.md` (sister-gift, saga-26 — uses dial-not-rewrite within the ladder)
- `gifts/contraction-saga-arc.md` (sister-gift, saga-26 — 6-phase saga-shape this gift composes within)

- `gifts/event-substrate.md` (sister-gift, foundation — the event log substrate this ladder operates on)

## License

CC0 — public domain. No attribution required. Adopt + dial freely.
