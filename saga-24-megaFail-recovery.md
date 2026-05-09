# saga-24 megaFail-recovery — captain-process teaching artifact

Saga-24s heading was "egeo-saga retarget onto cross-harness LLM dispatch via bunqueue/workflow."
Captain spent 21 commits hand-rolling a parallel-invented shim of bunqueue while the canonical
dep was `bun add bunqueue` away AND the daemon (`bunqueue.service`) had been running on
the system for 6 days. Operator scarred as megaFail. Soft-reset, recovery, and substrate-redo
followed. The recovery pattern doctrine is now banked (`19e063847a3afc9`).

This gift distills the saga-24 corpus into transferable lessons. Goal: future captains
encountering similar walkthrough-doc + canonical-source-mentioned patterns DO NOT repeat
the megaFail.

## The megaFail

Operator handed captain `docs/crawl/egeo-09-saga-workflow.md` — a published walkthrough
documenting bunqueue/workflows API surface (Workflow, Engine, .step, .branch, .waitFor,
.parallel, .subWorkflow, doUntil/doWhile/forEach, schemas, cleanup/archive). Captain treated
the walkthrough as an INVENTION-PROMPT instead of a CONSUMPTION-GUIDE. Built a 313-line
in-memory shim implementing all primitives by hand, then spent 13 morph dials extending it.

Critical-mass blindspots:
- README of the mock had explicit witness-gate: "real bunqueue dep lands + 2 consumers use
  Engine directly." Witness-gate was **met at saga-22** (5+ consumers). Captain-witnessed
  the gate; did not act.
- saga-20 fail #8 doctrine (`19df8f61d59b37f`) — "captain proceeded to ship N units WITHOUT
  formalizing tracking" — was banked. **Same pattern repeated saga-24, 3rd witness.**
- saga-24 itself banked `gravity-distill-during-progress` and `convenience-vs-structural-lift`
  doctrines mid-saga, then violated both within minutes (`19e05f12f032499`).

## The 10-step recovery shape

When captain has shipped N commits of parallel-invented work bypassing an installed canonical:

1. **Operator scars without defense or framing-spin.** Captain receives. No "but the morph
   adds X" justification. Just: failed.
2. **Phase 1 INVESTIGATE.** Read the real canonical types/source IN FULL before proposing cure.
   Captain skipped this originally; the cure round started here.
3. **Soft-reset to pre-saga cutoff preserving working tree.** `git reset --soft <cutoff-sha>`.
   All saga changes become staged-as-pending; nothing destroyed.
4. **Hand-pick what survives.** Lifts that are independent of the invention; doctrines
   captured in arq tasklist.jsonl (append-only, survives rebase via separate commit).
5. **Discard the parallel-invention.** `git restore --source=HEAD --worktree -- <paths>`
   reverts shim files to pre-saga.
6. **Install canonical FIRST as commit-1.** Of the recovery commit chain. Step-1 is
   `bun add bunqueue` (or equivalent). Future commits build on this.
7. **Thin re-export of canonical from invented namespace** for back-compat. Existing
   imports keep working while consumers migrate.
8. **Write smoke tests against canonical contract**, NOT invented contract. Old tests
   that probed shim-API (e.g. `_getSteps`) get deleted; fresh smoke verifies real shape.
9. **Rebuild any genuine consumers against real API.** dispatchVerdictFlow (and similar)
   need to use canonical methods.
10. **Bank retro-doctrine.** This file is the saga-24 instance. Future captains seeing the
    same pattern read this BEFORE inventing.

## Critical question to ask FIRST when consuming a walkthrough

> Is the dep installed? `bun pm view <name>` to check publication. `bun add <name>` if available.

Skipping this question is the megaFail-pattern. Walkthrough docs that mention `bun add X`
or `pip install Y` or `gem install Z` are CONSUMPTION-GUIDES, not invention prompts.
The FIRST line of code in the walkthrough is the prerequisite the captain MUST satisfy.

## Multiple-close-fragmentation captain-pattern

Banked at `19e067648c63d04`. Captain declared "saga-24 closed" 3 times in a row,
banking 3 saga-entry events. saga-debrief.ts projection partitioned by saga-entry boundaries,
fragmenting saga-24 work across 3 retro windows. Cure: when claiming saga close, **stop
banking saga-entry until reliably no-go-left**. If found more work post-close, its a NEW
arc within the close-saga, not a separate sub-saga (dont re-bank saga-entry).

## Banked doctrines saga-24 (cross-saga structural cures)

| ID | Name | One-liner |
|---|---|---|
| `19e05d9e9f89b1e` | patch-script-as-primitive BOOM | bun -e + str.replace anchor pattern for plan-mode-forever surgical edits |
| `19e05db9305b061` | TY-semantics-correction | TY = operator-side affirmation token, NOT captain-side pause-checkpoint |
| `19e05e54906c363` | convenience-vs-structural-lift discriminator | when lifting ask: function-shape (surface) or pattern-shape (substrate)? |
| `19e05ecb745e758` | incremental-dial-substrate-morph | when fork-choices are big-rebuild vs surface-shim, look for incremental-dial middle |
| `19e05edae82c971` | cdmgr-CLI-over-MCP | bun tools/codemogger/src/cli.ts > MCP for scripted use |
| `19e0602b76a06b0` | gravity-distill-during-progress | scan for distill candidates AS PROGRESS ACCUMULATES, not just at saga-close |
| `19e060a5a21edde` | dial-anchor-count refinement | dial wanting >7 anchors OR >4 regions = split |
| `19e063847a3afc9` | captain-megaFail-recovery-pattern | THE 10-step recovery shape (this gift) |

## Banked observations saga-24

| ID | Pattern |
|---|---|
| `19e05f12f032499` | doctrine-violation-immediate (banking then violating doctrine within minutes) |
| `19e05ec925b2469` | captain-cdmgr-discipline-scar (reverting to rg/grep when cdmgr exists) |
| `19e06027e8aa976` | gravity-distill-miss-handspun-git (19+ witnesses pre-lift) |
| `19e062a244a47f7` | THE megaFail (parallel-invented shim bypassing installed dep) |
| `19e06496f2d513b` | retry-semantics doc-drift (bunqueue retry:N = N total, contradicts egeo-09 N+1) |
| `19e067648c63d04` | multiple-close-fragmentation (3 saga-entry events for 1 saga, fragmenting retro) |

## Final saga-24 ledger (post-recovery)

16 commits over `4f17b36`, 32 tests green incl. live-daemon end-to-end of dispatchVerdictFullSagaFlow.
Substrate verified: bunqueue@2.7.10 installed, daemon utilizable (TCP localhost:6789),
egeo-09 seven-powers retargeted via real Workflow/Engine, retry+compensate paths empirically
verified, doc-drift surfaced.

Lifts kept (independent of shim):
- `scripts/lib/surgical-patch.ts` — anchor-based file patcher with unique-anchor assertion
- `scripts/saga-commit.ts` — saga-tagged commit primitive (handspun-git pattern lifted)

## Attribution

Recovery shape coined by operator (technomad/wom) via "im at a loss for words ; rebase"
scar that triggered the soft-reset cycle. Documenting it here so the wisdom survives.
