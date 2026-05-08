// scripts/lib/surgical-patch.test.ts
// RED-GREEN coverage for surgical-patch primitive (saga-24 lift, doctrine 19e05d9e9f89b1e).
import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { applyPatch, appendToFile } from "./surgical-patch.ts"
import { unlinkSync, existsSync } from "node:fs"

const TMP = "/tmp/surgical-patch-test-" + Date.now() + ".txt"

describe("applyPatch — single op", () => {
  beforeEach(async () => { await Bun.write(TMP, "hello world\nfoo bar") })
  afterEach(() => { if (existsSync(TMP)) unlinkSync(TMP) })

  test("replaces unique anchor", async () => {
    const r = await applyPatch(TMP, [{ anchor: "hello", replace: "bonjour" }])
    expect(await Bun.file(TMP).text()).toBe("bonjour world\nfoo bar")
    expect(r.delta).toBe(2)
    expect(r.ops).toBe(1)
  })

  test("insertAfter appends without consuming anchor", async () => {
    await applyPatch(TMP, [{ anchor: "hello", replace: " there", insertAfter: true }])
    expect(await Bun.file(TMP).text()).toBe("hello there world\nfoo bar")
  })
})

describe("applyPatch — multi-op sequence", () => {
  beforeEach(async () => { await Bun.write(TMP, "a:1\nb:2\nc:3") })
  afterEach(() => { if (existsSync(TMP)) unlinkSync(TMP) })

  test("runs ops in order, each sees prior mutations", async () => {
    await applyPatch(TMP, [
      { anchor: "a:1", replace: "a:1\nA:1.5", must: "unique" },
      { anchor: "A:1.5", replace: "A:1.5 (added)" },
    ])
    expect(await Bun.file(TMP).text()).toBe("a:1\nA:1.5 (added)\nb:2\nc:3")
  })
})

describe("applyPatch — uniqueness assertion", () => {
  beforeEach(async () => { await Bun.write(TMP, "foo\nfoo\nbar") })
  afterEach(() => { if (existsSync(TMP)) unlinkSync(TMP) })

  test("throws on duplicate anchor (default must=unique)", async () => {
    await expect(applyPatch(TMP, [{ anchor: "foo", replace: "baz" }]))
      .rejects.toThrow(/anchor occurs 2× in/)
  })

  test("allows duplicate with must=any (first occurrence replaced)", async () => {
    await applyPatch(TMP, [{ anchor: "foo", replace: "baz", must: "any" }])
    expect(await Bun.file(TMP).text()).toBe("baz\nfoo\nbar")
  })

  test("throws on missing anchor", async () => {
    await expect(applyPatch(TMP, [{ anchor: "ghost", replace: "x" }]))
      .rejects.toThrow(/anchor not found/)
  })
})

describe("appendToFile", () => {
  beforeEach(async () => { await Bun.write(TMP, "start") })
  afterEach(() => { if (existsSync(TMP)) unlinkSync(TMP) })

  test("appends content at EOF", async () => {
    const r = await appendToFile(TMP, " + end")
    expect(await Bun.file(TMP).text()).toBe("start + end")
    expect(r.delta).toBe(6)
  })
})
