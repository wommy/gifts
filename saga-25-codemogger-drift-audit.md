---
name: codemogger drift-audit saga-24 cc-129
description: per-file diff refs vs mock for saga-25 scope decision
type: project
generated: 2026-05-08T07:39:57.207Z
---

# codemogger drift-audit

Pre-saga-25 drift-evidence for cc-#129 scope-decision. NO source-modification - survey only.

## Summary

- Files differing: 12
- Mock-only customizations: 3
- Test-mock-only: 3
- Refs-only mock-missing: 0

## Differing files

| File | refs | mock | delta | notes |
|---|---|---|---|---|
| search/query.ts | 73 | 260 | +187 | MAJOR drift |
| chunk/treesitter.ts | 340 | 490 | +150 | MAJOR drift |
| mcp.ts | 164 | 27 | -137 | MAJOR drift |
| embed/local.ts | 39 | 10 | -29 | moderate |
| scan/walker.ts | 122 | 138 | +16 | moderate |
| chunk/languages.ts | 246 | 238 | -8 | minor |
| index.ts | 369 | 374 | +5 | minor |
| db/store.ts | 408 | 412 | +4 | minor |
| format/text.ts | 20 | 24 | +4 | minor |
| chunk/types.ts | 12 | 12 | 0 | minor |
| format/json.ts | 18 | 18 | 0 | minor |
| search/rank.ts | 49 | 49 | 0 | minor |

## Mock-only customizations

- db-path.ts - 14 lines
- mcp-tools.ts - 153 lines
- runtime.ts - 86 lines

## Test-mock-only files

- chunk/treesitter.test.ts - 41 lines
- db/store.test.ts - 57 lines
- mcp-tools.test.ts - 167 lines

## Operator scope-decision options

Option a vendor-merge: replace differing files with refs version, keep mock-only files. Risk: loses customizations.
Option b customization-preserve: keep mock files, only update where refs has bugfix. Risk: requires per-file diff review.
Option c drift-audit: THIS DOC. Measure only. Risk: zero.
Option d targeted pre.27: only update files using turso-adapter. Risk: surgical.

## Cross-references
- cc-task #129 saga-20 carryover deferred 5+ sagas
- saga-25 onramp inbox arq 19e0682a63e3616
- megaFail-recovery doctrine arq 19e063847a3afc9