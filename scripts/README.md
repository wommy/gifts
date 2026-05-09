# scripts/

Reference implementations of the primitives the gifts assume. Excerpted from glom_MR; project-retargeting per gift's own callouts.

## Edit primitives

- `safe-patch.ts` — CLI wrapper over `safe-patch-lib.ts:safeApplyPatch` (anchor-diagnostic edit primitive)
- `safe-patch-lib.ts` — `safeApplyPatch` returns AnchorDiagnostic on failure (EXACT/NORM/NEAR/NO match)
- `anchor-find.ts` — anchor-drift diagnostic via stdin
- `surgical-patch.ts` — raw `applyPatch` primitive; `safe-patch-lib` wraps this

## Patch-test-commit orchestration

- `patch-test-commit.ts` — 3-tier orchestrator: runs --patch <X.ts> + --test <cmd> + saga-commit. Supports --rollback-on-fail / --max-retries / --sister-auto.
- `saga-commit.ts` — saga-tagged commit primitive; auto-banks heading-shipped post-success (saga-26 dial)
- `here.ts` / `heredoc-lib.ts` — heredoc-stdin write/append/pipe/batch primitives (cures escape-soup-via-bun-e antipattern)

## Cold-start / orientation

- `cap-prep.ts` — 5-substrate cold-start orientation (--detect mode); --close mode forcing-function exits non-zero on prior-claims
- `arq-log.ts` — append-only event log (typed events: scar / observation / doctrine / heading / inbox / etc)
- `arq-lib.ts` — IndexedCorpus Projection (saga-26 R1.0; byId / byType / byCorrelationId)
- `postit.ts` — append-only ad-hoc scratch notes (newest-wins per tag — bridge / cooking / etc)

## Mining

- `cdmgr-search.ts` — friendly wrapper for codemogger semantic/keyword/hybrid search
- `cdmgr-reindex.ts` / `cdmgr-reindex-lib.ts` — async-generator backgrounding cdmgr reindex
- `seshae-arq.ts` — session-jsonl mining via sqlite FTS
- `saga-walk.ts` — extract prior-saga cap actual invocations from jsonl
- `handcrawl-saga.ts` — primary-source handwalk over session jsonl
- `import-graph-lib.ts` — TypeScript caller-graph traversal (importedBy / importsOf / transitiveDeps)

## Substrate-tier-ladder

- `yeet.ts` — move-to-archive (NEVER rm); banks arq event auto

## Detection

- `detect.ts` — unified evergreen-scar detector dispatcher

## License

CC0 — public domain. Each gift includes project-retargeting callouts.
