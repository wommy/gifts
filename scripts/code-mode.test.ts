// Tests for the pure code-mode primitive at scripts/lib/code-mode.ts.
// Mock-only — no MCP servers spawned.
import { test, expect } from 'bun:test'
import { makeCodeMode, type ClientFactory } from './code-mode.ts'

const mockFactory = (methods: Record<string, (a: unknown) => Promise<unknown>>): ClientFactory =>
  async () => ({ close: async () => {}, ...methods } as never)

test('subset includes only requested servers', async () => {
  const t = await makeCodeMode({
    registry: {
      a: mockFactory({ ping_a: async () => 'a' }),
      b: mockFactory({ ping_b: async () => 'b' }),
    },
    include: ['a'],
  })
  expect(t.__servers).toEqual(['a'])
  expect(t.has('ping_a')).toBe(true)
  expect(t.has('ping_b')).toBe(false)
  await t.close()
})

test('unknown server name records in __failures, no throw', async () => {
  const t = await makeCodeMode({ registry: {}, include: ['nope'] })
  expect(t.__servers).toEqual([])
  expect(t.__failures.nope).toBe('unknown server')
  await t.close()
})

test('idempotent close()', async () => {
  const t = await makeCodeMode({ registry: { a: mockFactory({}) } })
  await t.close()
  await t.close()
  expect(true).toBe(true)
})

test('collision throws after cleanup', async () => {
  let aClosed = false
  await expect(
    makeCodeMode({
      registry: {
        a: async () => ({ close: async () => { aClosed = true }, shared_name: async () => 1 } as never),
        b: mockFactory({ shared_name: async () => 2 }),
      },
      include: ['a', 'b'],
    })
  ).rejects.toThrow(/tool name collision/)
  expect(aClosed).toBe(true)
})

test('hooks fire beforeCall, afterCall with timing', async () => {
  const trace: string[] = []
  const t = await makeCodeMode({
    registry: { a: mockFactory({ do_thing: async () => 'result' }) },
    hooks: {
      beforeCall: (n) => { trace.push('before:' + n) },
      afterCall: (n, _, r, ms) => { trace.push(`after:${n}:${r}:${ms >= 0 ? 'ok' : 'bad'}`) },
    },
  })
  await (t as any).do_thing({ x: 1 })
  await t.close()
  expect(trace).toEqual(['before:do_thing', 'after:do_thing:result:ok'])
})

test('hooks onError fires on throw', async () => {
  const errs: string[] = []
  const t = await makeCodeMode({
    registry: { a: mockFactory({ fail: async () => { throw new Error('boom') } }) },
    hooks: { onError: (n, _, e) => { errs.push(n + ':' + (e as Error).message) } },
  })
  await expect((t as any).fail({})).rejects.toThrow('boom')
  expect(errs).toEqual(['fail:boom'])
  await t.close()
})

test('auto-{} for no-arg invocation', async () => {
  let received: unknown = 'sentinel'
  const t = await makeCodeMode({
    registry: { a: mockFactory({ ping: async (a: unknown) => { received = a; return 'pong' } }) },
  })
  await (t as any).ping()
  expect(received).toEqual({})
  await t.close()
})

test('help() returns total + servers groups', async () => {
  const t = await makeCodeMode({
    registry: {
      a: mockFactory({ a1: async () => 1, a2: async () => 1 }),
      b: mockFactory({ b1: async () => 1 }),
    },
  })
  const all = t.help()
  expect(all.total).toBe(3)
  expect(all.servers.a).toEqual(['a1', 'a2'])
  expect(all.servers.b).toEqual(['b1'])
  const one = t.help('a1')
  expect(one.server).toBe('a')
  await t.close()
})

test('arqHooks emits to log on success and error', async () => {
  const { arqHooks } = await import('./code-mode-arq.ts')
  const tmpLog = `/tmp/code-mode-arq-test-${Date.now()}.jsonl`
  const t = await makeCodeMode({
    registry: { a: mockFactory({
      ok: async () => 'good',
      bad: async () => { throw new Error('fail') },
    }) },
    hooks: arqHooks({ log: tmpLog, correlationId: 'test-corr' }),
  })
  await (t as any).ok({})
  try { await (t as any).bad({}) } catch {}
  await t.close()
  const lines = (await Bun.file(tmpLog).text()).trim().split('\n').map(l => JSON.parse(l))
  expect(lines.length).toBe(2)
  expect(lines[0].metadata.tool).toBe('ok')
  expect(lines[0].metadata.ok).toBe(true)
  expect(lines[0].metadata.correlationId).toBe('test-corr')
  expect(lines[1].metadata.tool).toBe('bad')
  expect(lines[1].metadata.ok).toBe(false)
})
