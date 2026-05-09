// scripts/lib/surgical-patch.ts
// Surgical anchor-based file patcher for plan-mode-forever workflows.
//
// Each op specifies a unique multi-line substring (anchor) and a replacement.
// Asserts uniqueness pre-replace by default — cures silent-no-op failure mode
// of raw String.replace when anchor drifts after upstream edits.
//
// Doctrine: arq 19e05d9e9f89b1e (saga-24 BOOM 2026-05-08, operator-coined).
// Sister: plan-mode-write-tractable 19dfe60efdfc4e1, lift-tier-ladder 19e04e12868f9ee.

export interface PatchOp {
  /** Multi-line substring uniquely identifying the insertion point. */
  anchor: string
  /** Replacement text. */
  replace: string
  /** If true, append replace AFTER anchor (anchor preserved). Default replaces anchor. */
  insertAfter?: boolean
  /** Uniqueness override; default "unique" requires exactly one match in file. */
  must?: "unique" | "any"
}

export interface PatchReport {
  filePath: string
  before: number
  after: number
  delta: number
  ops: number
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0
  let count = 0, i = 0
  while ((i = haystack.indexOf(needle, i)) !== -1) {
    count++
    i += needle.length
  }
  return count
}

/** Apply a sequence of anchor-based string-replace ops to a file.
 *  Throws on missing anchor or non-unique anchor (when must==="unique"). */
export async function applyPatch(filePath: string, ops: PatchOp[]): Promise<PatchReport> {
  let s = await Bun.file(filePath).text()
  const before = s.length
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i]!
    const must = op.must ?? "unique"
    const n = countOccurrences(s, op.anchor)
    if (n === 0) {
      const preview = op.anchor.slice(0, 60).replace(/\n/g, "\\n")
      throw new Error(`surgical-patch: op[${i}] anchor not found in ${filePath} (preview: "${preview}..."); did upstream edits drift the anchor?`)
    }
    if (must === "unique" && n !== 1) {
      const preview = op.anchor.slice(0, 60).replace(/\n/g, "\\n")
      throw new Error(`surgical-patch: op[${i}] anchor occurs ${n}× in ${filePath}, expected 1 (preview: "${preview}..."); narrow anchor or set must="any".`)
    }
    s = op.insertAfter ? s.replace(op.anchor, op.anchor + op.replace) : s.replace(op.anchor, op.replace)
  }
  await Bun.write(filePath, s)
  return { filePath, before, after: s.length, delta: s.length - before, ops: ops.length }
}

/** Append text to end of a file. Convenience for "add new test describe at EOF" pattern. */
export async function appendToFile(filePath: string, content: string): Promise<PatchReport> {
  const s = await Bun.file(filePath).text()
  await Bun.write(filePath, s + content)
  return { filePath, before: s.length, after: s.length + content.length, delta: content.length, ops: 1 }
}

if (import.meta.main) {
  console.log("surgical-patch.ts — anchor-based file patcher for plan-mode-forever workflows")
  console.log("see scripts/lib/surgical-patch.test.ts for usage examples")
}

/** Extract the verbatim slice between startMarker..endMarker (end-marker inclusive) for use as a unique anchor.
 *  Escape hatch (saga-25 op-coined): use when the raw anchor string would carry escape-soup
 *  (nested template literals, embedded backticks/${...}/apostrophes) or when middle bytes are uncertain.
 *  Asserts the extracted slice is itself unique in the file before returning. */
export async function sliceBetween(
  filePath: string,
  startMarker: string,
  endMarker: string,
): Promise<{ slice: string; offset: number; length: number }> {
  const s = await Bun.file(filePath).text()
  const startIdx = s.indexOf(startMarker)
  if (startIdx === -1) {
    const preview = startMarker.slice(0, 60).replace(/\n/g, "\\n")
    throw new Error(`sliceBetween: start marker not found in ${filePath} (preview: "${preview}...")`)
  }
  const endSearchFrom = startIdx + startMarker.length
  const endIdx = s.indexOf(endMarker, endSearchFrom)
  if (endIdx === -1) {
    const preview = endMarker.slice(0, 60).replace(/\n/g, "\\n")
    throw new Error(`sliceBetween: end marker not found in ${filePath} after start@${startIdx} (preview: "${preview}...")`)
  }
  const slice = s.slice(startIdx, endIdx + endMarker.length)
  if (s.indexOf(slice, startIdx + 1) !== -1) {
    throw new Error(`sliceBetween: extracted slice occurs >1× in ${filePath}; markers narrow but slice itself non-unique`)
  }
  return { slice, offset: startIdx, length: slice.length }
}

/** Convenience: applyPatch via sliceBetween. Replaces the (unique) slice spanning startMarker..endMarker. */
export async function applyPatchBetween(
  filePath: string,
  startMarker: string,
  endMarker: string,
  replace: string,
): Promise<PatchReport> {
  const { slice } = await sliceBetween(filePath, startMarker, endMarker)
  return applyPatch(filePath, [{ anchor: slice, replace }])
}
