# cdmgr mode discriminator — semantic / keyword / hybrid + don't-quit-easy

> Saga-26 distillate from captain TYPE-1 #5 (cdmgr-quit-easy scar `19e0a8ebb234f8f`) + saga-24 cdmgr-CLI-over-MCP doctrine `19e05edae82c971` + saga-25 unix-philo composition `19e08afe06f8d97` (43× cited).

## What it cures

Captain hits a code-discovery question (callers of X / definition of Y / similar shapes). Reaches for `scripts/cdmgr-search.ts` or equivalent thin keyword-only wrapper. Default mode = `keyword`, default limit = `10`. Returns thin results. Captain falls back to `rg` thinking cdmgr is "limited."

That's the scar. Cdmgr has 3 modes — only one is keyword. The fallback to `rg` means the captain didn't load the tool's full surface before quitting. Operator-coined cure: *dont quit easily, take your time to understand a command and why I said to use it.*

## The 3 modes

| Mode | What it does | When to reach |
|---|---|---|
| `keyword` | Exact-text matching (substring / token) | You know the literal symbol/string. Default for "find this exact name." |
| `semantic` | Embedding-similarity (concept-match) | You want conceptually-related code, not text-matches. Cross-language patterns, similar shapes. |
| `hybrid` | Both modes merged + ranked | Default for caller-graph audits, pattern-discovery, "where else is this kind of thing." |

## Iron law

```
NO RG FALLBACK BEFORE TRYING ALL 3 CDMGR MODES + LIMIT BUMP
```

If `cdmgr-search` returns thin/empty, the order is:
1. Try `--mode semantic` (different result-set; embeddings find what keyword misses)
2. Try `--mode hybrid` (default for unknown surface; merges both)
3. Bump `--limit` to 30+ (default 10 hides the long tail)
4. Add `--threshold` filter if returns are noisy
5. THEN fall back to `rg` (only if cdmgr is genuinely empty)

## Friendly wrapper shape (saga-26 dial)

The bare `scripts/cdmgr-search.ts` (saga-24) was keyword-only with limit-10. The friendly dial (saga-26) added:

```bash
bun scripts/cdmgr-search.ts <q>                          # default hybrid, limit 10, here-filter
bun scripts/cdmgr-search.ts <q> --semantic --limit 30    # semantic-only, more hits
bun scripts/cdmgr-search.ts <q> --keyword                # exact-text only
bun scripts/cdmgr-search.ts <q> --snippet                # include code preview
bun scripts/cdmgr-search.ts <q> --threshold 0.7          # min score filter
bun scripts/cdmgr-search.ts <q> --json                   # raw JSON stdout (pipe-friendly)
bun scripts/cdmgr-search.ts <q> --no-here                # include /refs/ + node_modules (default: exclude)
```

Underlying full CLI (when wrapper isn't enough):

```bash
bun run tools/codemogger/src/cli.ts search '<q>' \
  --mode semantic --limit 30 --format json --snippet --threshold 0.7
```

Programmatic via mcporter cluster (typed):

```ts
import { makeTools } from 'mocks/mcporter-cli-v0/tools.ts'
const t = await makeTools({ include: ['codemogger'] })
const r = await t.codemogger_search({ query, mode: 'semantic', limit: 30, includeSnippet: true })
```

## Pre-query checklist (don't quit easily)

Before falling back, ask:
- Did I try all 3 modes? `keyword` / `semantic` / `hybrid`
- Did I bump `--limit`? Default 10 hides long tail.
- Is the index stale? `bun scripts/scratch/cdmgr-reindex-bg.ts .` to refresh.
- Am I asking the wrong question? `extractCitedIds` keyword vs `sister-link forward index` semantic give different results.
- Do I need `--snippet` to see context-hits keyword's bare-line view misses?

## Cross-substrate: when cdmgr isn't enough

For caller-graphs that need import-resolution (not text-similarity):
- `scripts/lib/import-graph.ts:importedBy(<file>)` walks TS imports across the project. Returns set of files importing the target.
- This is the right tool for "who imports X" — cdmgr can't do import-graph traversal, it does code-shape similarity.

For session-history mining ("what did cap-N-1 actually do"):
- `scripts/seshae-arq.ts {index,get,search}` over `.seshae-arq/<sess>` sqlite cache (NOT cdmgr — cdmgr indexes source code, not session jsonl).

Tool-discriminator iron law: each tool indexes a different substrate. Match the question to the substrate, not to the first wrapper that comes to mind.

## Project-retargeting

For any project with a similar substrate:
- `tools/codemogger/` ports cleanly (Node + sqlite + embeddings; bun deps minimal).
- The wrapper `scripts/cdmgr-search.ts` is ~40 LOC; reshape per project's CLI conventions.
- The 3-mode discriminator + don't-quit-easily discipline is tool-agnostic — applies to ANY semantic-search tool (sourcegraph, ast-grep, embedding indexers).

## Sister doctrines (in arq)

- `19e08afe06f8d97` saga-25 unix-philo composition (parent — modular composable)
- `19e05edae82c971` saga-24 cdmgr-CLI-over-MCP (canonical CLI surface)
- `19e094019bbb224` saga-25 dial-not-rewrite (use existing tool fully, don't fall back to inferior alt)
- `19e0a8ebb234f8f` saga-26 TYPE-1 #5 cdmgr-quit-easy (origin scar)
- `19e0a8ebb2307c6` saga-26 mode-discriminator (this gift's source doctrine)
- `gifts/3-tier-ptc-pattern.md` (sister-gift, saga-26 — same don't-quit-easily meta-pattern over patch-test-commit)

- `gifts/contraction-saga-arc.md` (sister-gift, saga-26 — 6-phase contraction-saga-shape)

- `gifts/corpus-mining-trio.md` (sister-gift, saga-26 — cdmgr is one of 3 mining tools; this gift drills into cdmgr mode-discriminator)

## License

CC0 — public domain. No attribution required. Adopt + dial freely.
