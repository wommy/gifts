// scripts/lib/code-mode.ts (v1.0)
// Pure code-mode primitive: composes any registry of MCP-style ClientFactories
// into a flat Tools deck. Project-think L207-217 binding pattern.
//
// Dependency-inverted: knows nothing about specific servers. Caller injects
// the registry via opts.registry. Sister extracted from mocks/mcporter-cli-v0/tools.ts
// (saga-20 v1.0 → primitive lift). Sister to projection-cache.ts pattern: pure
// reusable lib at scripts/lib/, mock-side at mocks/<X>/<thin-config>.ts.
//
// Invariants:
//   - flat single namespace (project-think canonical)
//   - registry-extensible / fully injectable (no KNOWN here)
//   - subset-composable via opts.include
//   - graceful per-server degradation (failures → __failures)
//   - fail-fast collision (cleanup-on-throw)
//   - idempotent close()
//   - hooks for beforeCall/afterCall/onError (project-think lifecycle backport)
//   - auto-{} for emit-ts no-arg quirk (obs 19df8f3562567fe)
//   - help() introspection

export type WithClose = { close: () => Promise<void> } & Record<string, unknown>
export type ClientFactory<T extends WithClose = WithClose> = (opts: { configPath?: string }) => Promise<T>
export type Registry = Record<string, ClientFactory>

export interface ToolHooks {
  beforeCall?: (name: string, args: unknown) => void | Promise<void>
  afterCall?: (name: string, args: unknown, result: unknown, ms: number) => void | Promise<void>
  onError?: (name: string, args: unknown, error: unknown) => void | Promise<void>
}

export interface ToolsMeta {
  close(): Promise<void>
  has(name: string): boolean
  help(name?: string): { server?: string; methods?: string[]; total: number; servers: Record<string, string[]> }
  __servers: string[]
  __methods: string[]
  __failures: Record<string, string>
}

type Methods<T> = Omit<T, 'close'>
type RegisteredMethods<R extends Registry> = {
  [K in keyof R]: R[K] extends ClientFactory<infer T> ? Methods<T> : never
}[keyof R]

export type CodeModeTools<R extends Registry> = RegisteredMethods<R> & ToolsMeta

export interface MakeCodeModeOptions<R extends Registry> {
  registry: R
  configPath?: string
  include?: string[]
  hooks?: ToolHooks
}

export async function makeCodeMode<R extends Registry>(opts: MakeCodeModeOptions<R>): Promise<CodeModeTools<R>> {
  const cfg = { configPath: opts.configPath }
  const wanted = opts.include ?? Object.keys(opts.registry)

  const merged: Record<string, unknown> = {}
  const closes: Array<() => Promise<void>> = []
  const servers: string[] = []
  const failures: Record<string, string> = {}
  const methodToServer: Record<string, string> = {}
  let closed = false

  const cleanup = async () => {
    if (closed) return
    closed = true
    await Promise.all(closes.map(c => c().catch(() => {})))
  }

  for (const name of wanted) {
    const factory = opts.registry[name]
    if (!factory) { failures[name] = 'unknown server'; continue }
    try {
      const client = await factory(cfg)
      const { close, ...methods } = client
      for (const k of Object.keys(methods)) {
        if (k in merged) {
          await close().catch(() => {})
          await cleanup()
          throw new Error(`code-mode: tool name collision: ${name}.${k} conflicts with already-loaded server`)
        }
      }
      const wrapped: Record<string, unknown> = {}
      const hooks = opts.hooks
      for (const [k, fn] of Object.entries(methods)) {
        if (typeof fn !== 'function') { wrapped[k] = fn; continue }
        const callee = fn as (a: unknown) => Promise<unknown>
        wrapped[k] = async (args?: unknown) => {
          const finalArgs = args === undefined ? {} : args
          if (hooks) await hooks.beforeCall?.(k, finalArgs)
          const t0 = performance.now()
          try {
            const r = await callee(finalArgs)
            if (hooks) await hooks.afterCall?.(k, finalArgs, r, performance.now() - t0)
            return r
          } catch (e) {
            if (hooks) await hooks.onError?.(k, finalArgs, e)
            throw e
          }
        }
      }
      Object.assign(merged, wrapped)
      for (const k of Object.keys(wrapped)) methodToServer[k] = name
      closes.push(close)
      servers.push(name)
    } catch (e) {
      if ((e as Error).message?.startsWith('code-mode:')) throw e
      failures[name] = (e as Error).message?.slice(0, 200) ?? String(e)
    }
  }

  const serverGroups: Record<string, string[]> = {}
  for (const [m, s] of Object.entries(methodToServer)) {
    (serverGroups[s] ??= []).push(m)
  }
  for (const s of Object.keys(serverGroups)) serverGroups[s]!.sort()

  return {
    ...(merged as object),
    close: cleanup,
    has: (name: string) => name in merged,
    help: (name?: string) => {
      if (name === undefined) return { total: Object.keys(merged).length, servers: serverGroups }
      const server = methodToServer[name]
      return server
        ? { server, methods: serverGroups[server], total: serverGroups[server]!.length, servers: serverGroups }
        : { total: 0, servers: serverGroups }
    },
    __servers: servers,
    __methods: Object.keys(merged).sort(),
    __failures: failures,
  } as unknown as CodeModeTools<R>
}
