# dial-loop-toolbox — when applyPatch fails, dial the patch (not the tool)

> Saga-26 distillate from saga-25 gravity-well doctrine `19e094019bbb224` dial-not-rewrite (21× cited corpus-wide) + `19e09e6e6f50495` retry-with-diagnostic + `19e09ead354f322` saga-25 3rd-OP-BOOM (anchor-find ship). Bundles the 3 primitives that closed 16 saga-25 captain TYPE-1 dial-loop scars.

## What it cures

Captain runs `applyPatch(file, [{anchor, replace}])`. Anchor not found. Patch fails. Captain pivots to:
- Edit tool (saga-25 TYPE-1 #12 hand-Edit-pivot scar) — violates plan-mode-forever + tool-vs-script doctrine
- Manual file rewrite via Write tool — violates surgical-edit principle
- Looser anchor (e.g., remove unique context) — produces wrong-location patches
- Scrapping the change altogether — loses momentum

The right move is to DIAL the patch shape (refine anchor / split into smaller anchors / use whitespace-norm matcher) — not abandon the tool. Saga-25 wall: 16 TYPE-1 scars on this exact pattern before the cure-toolbox lifted.

## The 3 primitives (the dial-loop toolbox)

```
TIER 1 (raw):       scripts/lib/surgical-patch.ts:applyPatch
                    Throws PatchError on first anchor-miss.

TIER 2 (diagnostic): scripts/lib/safe-patch.ts:safeApplyPatch
                    Wraps applyPatch. On miss, runs anchor-find internally,
                    returns structured AnchorDiagnostic (EXACT/NORM-MATCH/
                    NEAR-MATCH/NO-MATCH) + candidate-line + hint.
                    NEVER throws on anchor-drift.

TIER 3 (CLI):       scripts/safe-patch.ts (CLI wrapper)
                    bun scripts/safe-patch.ts <file> --anchor <a> --replace <r>
                    bun scripts/safe-patch.ts <file> --json '[{"anchor":"...","replace":"..."}]'
                    Prints diagnostic on failure for human + script readability.

Sister atom:        scripts/anchor-find.ts (stdin-based diagnostic)
                    bun scripts/anchor-find.ts <file> <<'EOF'
                    <expected anchor>
                    EOF
                    Outputs: EXACT match / NORM-MATCH (whitespace drift) /
                    NEAR-MATCH (char-diff candidates) / NO-MATCH.
```

## Iron law

```
PATCH FAILS → DIAGNOSE THE ANCHOR → DIAL THE ANCHOR → RETRY
NEVER → PIVOT TO Edit/Write TOOL OR LOOSEN UNIQUENESS
```

## Five-step dial-loop cycle

1. **Run safeApplyPatch** (or `bun scripts/safe-patch.ts`). On success → ship. On failure → continue.
2. **Read the AnchorDiagnostic**:
   - `EXACT` impossible-here (we got here via failure, so won't fire)
   - `NORM-MATCH` → whitespace drift; cure: `cat -A <file> | head -<line>` to see real bytes; align anchor whitespace
   - `NEAR-MATCH` → check candidate lines + char-diff; usually one-character variance (curly quote / em-dash / trailing space)
   - `NO-MATCH` → anchor entirely wrong; check file contents + reduce anchor to most-stable substring
3. **Dial the patch** — DO NOT abandon to Edit. Common dials:
   - Smaller anchor (just the line that's most-stable)
   - Larger anchor (when uniqueness is the issue)
   - Different anchor (relocate to a stable nearby landmark)
   - Whitespace-aware anchor (trim leading indents to match real file)
4. **Retry safeApplyPatch** with the dialed anchor.
5. **Bank cure-doctrine** if the dial revealed a generalizable pattern — sister-arq event for future captains.

## When NOT to dial — legitimate pivot signals

- **3 dial attempts failed** → 3-fix-rule fires (saga-25 doctrine `19e0928d4f3e8e6` PLOW-STOP-KICKOUT). Stop dialing; question whether the change-shape itself is wrong.
- **Anchor uniqueness is fundamental** (e.g., the line you want to patch occurs 10× identically) → dial to use `applyPatchBetween(start, end)` from surgical-patch instead, which extracts a slice between two unique markers.
- **Multi-file structural change** that needs `import-graph` traversal — wrong tool for the job; reach for `scripts/lib/import-graph.ts:importedBy` first.

## Project-retargeting (cross-civilization)

For any project with a similar substrate:
- Port `scripts/lib/surgical-patch.ts` (~150 LOC, BSD-tier deps: bun + node:fs).
- Port `scripts/lib/safe-patch.ts` (~80 LOC) on top.
- Port `scripts/anchor-find.ts` (~30 LOC) — tiny stdin-driven diagnostic.
- Port `scripts/safe-patch.ts` CLI wrapper (~30 LOC).
- Total bundle: ~290 LOC of TypeScript.

If your project uses different patch primitives (jscodeshift, sed-driven scripts), the DOCTRINE still ports: **never pivot to bigger-tool when smaller-tool fails — diagnose the input, dial the input, retry**. The tool-toolbox shape is portable; the specific implementation is project-shaped.

## Sister doctrines (in arq)

- `19e094019bbb224` saga-25 dial-not-rewrite (parent doctrine, 21× cited)
- `19e09e6e6f50495` saga-25 retry-with-diagnostic-discipline
- `19e09ead354f322` saga-25 3rd-OP-BOOM (anchor-find missing-primitive ship)
- `19e0928d4f3e8e6` saga-25 PLOW-STOP-KICKOUT (3-fix-rule hits before pivot)
- `19e09bf67bc58fc` saga-25 CAP-CURE-PAIR #25 tool-vs-script (sister discriminator)
- `19e09d7c3de05fe` saga-25 captain TYPE-1 #12 hand-Edit-pivot scar (the cured)
- `gifts/3-tier-ptc-pattern.md` (sister-gift, saga-26 — uses safe-patch as TIER-1 in the patch+test+commit composition)
- `gifts/cascade-discipline.md` (sister-gift, saga-25 — propagates a single dial across N callers)

- `gifts/contraction-saga-arc.md` (sister-gift, saga-26 — 6-phase contraction-saga-shape)

## License

CC0 — public domain. No attribution required. Adopt + dial freely.
