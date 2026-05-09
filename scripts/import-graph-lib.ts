import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["filesystem"]

const IMPORT_RE = /(?:^|\s)(?:import\s.+?\sfrom\s|import\s+|from\s+)['"]([^'"]+)['"]/gm

const WALK_EXTS = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.mjs'])

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  'refs',
  'dist',
  'coverage',
  '.cachebro',
  '.seshae-arq',
  '.codemogger',
  '.tmp',
])

/** Extract all import specifier strings from a single file. */
export function importsOf(filePath: string): string[] {
  let content: string
  try {
    content = readFileSync(filePath, 'utf8')
  } catch {
    return []
  }
  const specs: string[] = []
  for (const m of content.matchAll(IMPORT_RE)) {
    if (m[1]) specs.push(m[1])
  }
  return specs
}

/** Walk all matching-extension files under root (recursive). Skips EXCLUDE_DIRS. */
function walkFiles(root: string): string[] {
  const results: string[] = []
  function recurse(dir: string) {
    let entries: string[]
    try { entries = readdirSync(dir) } catch { return }
    for (const entry of entries) {
      if (EXCLUDE_DIRS.has(entry)) continue
      const full = join(dir, entry)
      let st
      try { st = statSync(full) } catch { continue }
      if (st.isDirectory()) {
        recurse(full)
      } else if (st.isFile()) {
        const dot = entry.lastIndexOf('.')
        if (dot !== -1 && WALK_EXTS.has(entry.slice(dot))) {
          results.push(full)
        }
      }
    }
  }
  recurse(root)
  return results
}

/**
 * Return paths (under root) whose importsOf includes a specifier
 * that contains the basename of filePath (without extension).
 */
export function importedBy(filePath: string, root: string): string[] {
  // Match on the last path segment without extension as a substring
  const slash = filePath.lastIndexOf('/')
  const base = filePath.slice(slash + 1)
  const dot = base.lastIndexOf('.')
  const stem = dot !== -1 ? base.slice(0, dot) : base

  const results: string[] = []
  for (const f of walkFiles(root)) {
    if (f === filePath) continue
    const specs = importsOf(f)
    if (specs.some(s => s.includes(stem))) {
      results.push(f)
    }
  }
  return results
}

/**
 * BFS over importsOf starting from filePath.
 * Returns all reachable specifier strings (raw, not resolved).
 * Cycles are handled via a visited set.
 */
export function transitiveDeps(filePath: string, root: string): string[] {
  const visited = new Set<string>()
  const queue: string[] = [filePath]
  const all: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)

    const specs = importsOf(current)
    for (const spec of specs) {
      if (!all.includes(spec)) all.push(spec)
      // Attempt naive resolution for local specifiers to continue BFS
      if (spec.startsWith('.')) {
        // Try common extensions to find the actual file
        const base = spec.endsWith('.ts') || spec.endsWith('.tsx') || spec.endsWith('.js') || spec.endsWith('.mjs')
          ? spec
          : null
        const dir = current.slice(0, current.lastIndexOf('/'))
        const candidates = base
          ? [join(dir, base)]
          : [...WALK_EXTS].map(ext => join(dir, spec + ext))
        for (const cand of candidates) {
          if (!visited.has(cand)) {
            try { statSync(cand); queue.push(cand) } catch { /* not found */ }
          }
        }
      } else if (!spec.startsWith('@') && !spec.includes('/')) {
        // bare module — skip (not resolvable without node_modules)
      }
      // package specifiers (@scope/pkg, bare names) — add to all but don't BFS further
    }
  }

  return all
}
