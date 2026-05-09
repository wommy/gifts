# corpus-mining-trio — 3 tools, 3 substrates: cdmgr / import-graph / seshae-arq

> Saga-26 distillate from saga-25 6-rank gift queue #5 + saga-26 TYPE-1 #5 cdmgr-quit-easy cure (`19e0a8ebb234f8f`) + saga-26 cdmgr-mode-discriminator gift sister.

## What it cures

Captains hit a discovery question and reach for the first tool that pattern-matches the question shape — usually `rg` (raw text) or one wrapper they've seen recently. Different question-shapes need different tools because each tool indexes a DIFFERENT SUBSTRATE. Mismatching question-shape to substrate produces thin/false results, which leads to "this tool is broken" or "I'll just rg" anti-patterns.

Saga-25 + saga-26 surfaced 3 corpus-mining tools that together cover the dominant captain-question-shapes. The trio:

| Tool | Substrate indexed | Question shape |
|---|---|---|
| **cdmgr** (codemogger) | source code (TS files in scripts/, mocks/, refs/, etc) | "find code by similarity / shape / concept" |
| **import-graph** (`scripts/lib/import-graph.ts`) | TS import statements (caller-graph) | "who imports X / who calls function Y" |
| **seshae-arq** (`scripts/seshae-arq.ts`) | session jsonl files (~/.claude/projects/.../*.jsonl) cached as sqlite | "what did cap-N-1 actually do / find captain commands matching pattern" |

Each tool's substrate is independent. Querying the wrong substrate = returns nothing useful, even though the answer exists.

## Iron law

```
QUESTION SHAPE → SUBSTRATE TOOL
"find code"          → cdmgr (semantic / keyword / hybrid)
"find callers"       → import-graph
"find captain runs"  → seshae-arq
"find arq events"    → arq-log ls / arq-search
"find bash command"  → seshae-arq (commands ARE in session jsonl)
```

## The 3 tools (detailed)

### 1. cdmgr (codemogger) — code-shape semantic search

```bash
# Friendly wrapper (saga-26 dial)
bun scripts/cdmgr-search.ts <query>                   # default hybrid + here-filter + limit 10
bun scripts/cdmgr-search.ts <query> --semantic        # embedding-similarity
bun scripts/cdmgr-search.ts <query> --keyword         # exact-text
bun scripts/cdmgr-search.ts <query> --snippet         # show code preview
bun scripts/cdmgr-search.ts <query> --json            # pipe-friendly

# Underlying full CLI
bun run tools/codemogger/src/cli.ts search '<q>' --mode <semantic|keyword|hybrid> --limit N

# Reindex after source changes
bun scripts/scratch/cdmgr-reindex-bg.ts .             # async-gen progress yields
```

When to reach: any question about CODE shape ("how is X used" / "find similar functions" / "where does this pattern appear"). Sister-gift: `gifts/cdmgr-mode-discriminator.md`.

### 2. import-graph — TypeScript caller-graph traversal

```typescript
import { importedBy, importsOf, transitiveDeps } from 'scripts/lib/import-graph.ts'

importedBy('scripts/lib/arq.ts', '.')      // → string[] of files importing arq.ts
importsOf('scripts/projections/foo.ts')     // → string[] of files foo.ts imports
transitiveDeps('scripts/cap-prep.ts', '.')  // → string[] of all transitive deps
```

When to reach: any question about CALLER-GRAPH or import-graph ("what depends on X" / "what does Y depend on" / "find the migration scope for refactor R"). cdmgr CANNOT answer this — it does code-shape similarity, not import-resolution.

### 3. seshae-arq — session jsonl mining via sqlite FTS

```bash
# Index a session into .seshae-arq/<sessId> sqlite cache
SAGA_DB=.seshae-arq/<sessId> bun scripts/seshae-arq.ts index <sessId>

# Search across the indexed session
SAGA_DB=.seshae-arq/<sessId> bun scripts/seshae-arq.ts search '<term>'

# Get a specific event by timestamp
SAGA_DB=.seshae-arq/<sessId> bun scripts/seshae-arq.ts get <ts>
```

When to reach: any question about CAPTAIN BEHAVIOR or HISTORICAL ACTIONS ("what did saga-25 cap actually run" / "find prior bash commands matching pattern" / "what was the operator's coined-term"). cdmgr CANNOT answer — it indexes code, not session events. import-graph CANNOT answer — it walks imports, not commands.

## Five-step trio cycle

1. **Frame the question** — code-shape / caller-graph / captain-history / arq-events / bash-command?
2. **Match to substrate** — cdmgr / import-graph / seshae-arq / arq-log / seshae-arq
3. **Run the tool** — use the right invocation flags (cdmgr modes, import-graph functions, seshae-arq with SAGA_DB env)
4. **Read the result, dial if thin** — cdmgr 3 modes / import-graph filter callers / seshae-arq broaden term
5. **Compose if multi-substrate** — e.g., "who calls X and what did saga-25 cap do with X" = import-graph + seshae-arq combined

## Anti-patterns (what NOT to do)

- **Use rg as default** — bypasses indexed tools; loses semantic-similarity (cdmgr) and FTS (seshae-arq). Reach for rg only after cdmgr 3-mode + bumped --limit fail.
- **Use cdmgr to find callers** — it doesn't traverse imports; gives unrelated text-similar results.
- **Use import-graph to find captain runs** — it parses TS imports; session jsonl is structured-events not TS source.
- **Quit on thin results** — try semantic-mode / hybrid-mode / bigger-limit / different-substrate before falling back. (Saga-26 TYPE-1 #5 cdmgr-quit-easy scar.)

## Composition patterns (when one tool isn't enough)

```bash
# Find all readEvents callers + verify cap-25 actually used them
bun -e 'import { importedBy } from "./scripts/lib/import-graph.ts";
        const callers = importedBy("scripts/lib/arq.ts", ".");
        for (const f of callers) console.log(f)' | head -10
SAGA_DB=.seshae-arq/<saga-25-sess> bun scripts/seshae-arq.ts search 'readEvents'

# Find code-shape similar to a function + check who imports the file
bun scripts/cdmgr-search.ts 'pattern-name' --semantic
bun -e 'import { importedBy } from "./scripts/lib/import-graph.ts";
        for (const f of importedBy("path/to/file.ts", ".")) console.log(f)'
```

## Project-retargeting

For any project with similar substrates:
- **cdmgr / codemogger** — port if you want semantic code search (~tools/codemogger ~ multi-K LOC; needs sqlite + embeddings).
- **import-graph** — `scripts/lib/import-graph.ts` is ~80 LOC TS-only walker; ports per language (Python ast / Rust syn / Go imports).
- **seshae-arq** — session-event indexing for any agent harness with structured logs (~mocks/seshae-arq-mock-v0 + scripts/seshae-arq.ts; sqlite FTS).

The trio's iron-law is universal: **3 substrates need 3 tools; question-shape determines tool**. Specific tools per project may differ.

## Sister doctrines (in arq)

- `19e0a8ebb234f8f` saga-26 TYPE-1 #5 cdmgr-quit-easy (origin scar)
- `19e0a8ebb2307c6` saga-26 cdmgr-mode-discriminator (sister doctrine)
- `19e0a995070677d` saga-26 load-tool-inventory-before-mining (sister cure)
- `19e08afe06f8d97` saga-25 unix-philo composition (parent — composable tools)
- `gifts/cdmgr-mode-discriminator.md` (sister-gift, saga-26 — drills into cdmgr's 3-mode discriminator)
- `gifts/cap-prep-ritual.md` (sister-gift, saga-26 — uses all 3 trio tools at cold-start)
- `gifts/handcrawl-saga.md` (sister-gift — primary-source mining when tools fail)

## License

CC0 — public domain. No attribution required. Adopt + dial freely.
