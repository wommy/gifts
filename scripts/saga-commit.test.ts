// scripts/saga-commit.test.ts — RED-GREEN for saga-commit lift.
import { describe, test, expect } from "bun:test"
import { spawnSync } from "node:child_process"
import { buildMessage } from "./saga-commit.ts"

describe("buildMessage", () => {
  test("includes title", () => {
    const m = buildMessage({ title: "feat(x): hi", body: "", files: [], sister: [], noCoauthor: true, dryRun: false })
    expect(m).toContain("feat(x): hi")
  })

  test("includes body separated by blank line", () => {
    const m = buildMessage({ title: "t", body: "the body", files: [], sister: [], noCoauthor: true, dryRun: false })
    expect(m).toBe("t\n\nthe body")
  })

  test("includes sister line when sister ids provided", () => {
    const m = buildMessage({ title: "t", body: "", files: [], sister: ["abc123", "def456"], noCoauthor: true, dryRun: false })
    expect(m).toContain("Sister: abc123 / def456")
  })

  test("includes saga trailer", () => {
    const m = buildMessage({ title: "t", body: "", files: [], sister: [], saga: "24", noCoauthor: true, dryRun: false })
    expect(m).toMatch(/saga-24\./)
  })

  test("composes title + body + sister + saga", () => {
    const m = buildMessage({ title: "t", body: "b", files: [], sister: ["abc"], saga: "24", noCoauthor: true, dryRun: false })
    const lines = m.split("\n")
    expect(lines[0]).toBe("t")
    expect(lines[2]).toBe("b")
    expect(lines).toContain("Sister: abc")
    expect(lines[lines.length - 1]).toBe("saga-24.")
  })
})

describe("CLI --dry-run", () => {
  test("prints message without invoking git", () => {
    const r = spawnSync("bun", [
      "/home/wom/infra/glom_MR/scripts/saga-commit.ts",
      "--title", "feat(test): dry",
      "--body", "the body",
      "--saga", "24",
      "--sister", "aaa,bbb",
      "--dry-run",
    ], { encoding: "utf8" })
    expect(r.status).toBe(0)
    expect(r.stdout).toContain("DRY-RUN saga-commit")
    expect(r.stdout).toContain("feat(test): dry")
    expect(r.stdout).toContain("Sister: aaa / bbb")
    expect(r.stdout).toContain("saga-24.")
  })

  test("--title required", () => {
    const r = spawnSync("bun", ["/home/wom/infra/glom_MR/scripts/saga-commit.ts", "--dry-run"], { encoding: "utf8" })
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain("usage")
  })
})
