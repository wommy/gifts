# egeo-saga — saga-DSL as cross-harness dispatch primitive (saga-22 onramp gift v1)

Most agent harnesses (Claude Code, Codex, opencode) ship cost-budgeted subscriptions and a one-shot "spawn a coding agent" tool. Most users either burn opus tokens on routine ships or wire ad-hoc retry/refund/approval logic per dispatch by hand. **egeo-saga** is the doctrine that **cross-harness LLM dispatch should be expressed as saga-workflow steps** (compensation + retry+exp-backoff+jitter + branch + parallel + sub-workflows + waitFor signals) — the same first-class primitives Egeo Minotti shipped in `bunqueue/workflow` for ordinary distributed transactions, retargeted at the agent-dispatch substrate.

## The meta-cure

Routine ship dispatched to opus-foreground = burns subscription wall. Routine ship dispatched to codex-cli or opencode-go (cheaper, sometimes free tier) = cost offload. But naive dispatch loses: no compensation when downstream errors mid-ship, no retry-with-backoff when rate-limited, no approval gate before merging, no parallel fan-out across harness pool, no sub-workflow composition. The cure is **stop hand-rolling the orchestration; lift it to a saga DSL**:

- Each dispatch (codex spawn, opencode call, claude-code subagent, foreground opus) is a `step()` with handler + optional `compensate` + `retry`.
- Cross-harness racing = `parallel(...)`. Cheapest-wins-first = `branch()` on cost tier.
- Human-in-the-loop merge gate = `waitFor('approval', { timeout: 48h })`.
- Failure mid-ship = engine walks compensations in reverse (revert PR, close branch, refund credits).
- All durable on a single SQLite file. Survives crashes, deploys, harness restarts.

## The saga-DSL primitive (Egeo's seven powers)

Egeo's `bunqueue/workflow` ships ~1500 LOC, embedded SQLite, plain TS DSL. Seven first-class powers, **all of which retarget cleanly onto cross-harness LLM dispatch**:

1. **`step(name, handler, { compensate, retry, timeout, inputSchema })`** — atomic unit. For dispatch: `step('ship-via-codex', codexSpawn, { compensate: revertPR, retry: 3 })`.
2. **Compensation walk-back** — later step throws, engine runs prior compensations in reverse order, no try/catch pyramids. For dispatch: charged credits get refunded, opened PRs get closed, branches get deleted.
3. **`retry: N` with `min(500ms * 2^attempt + jitter, 30s)`** — jitter prevents thundering-herd on rate-limited APIs. For dispatch: anthropic 429s, openai overload errors, opencode-go cold starts.
4. **`branch((ctx) => key).path('a', w => ...).path('b', w => ...)`** — runtime routing. For dispatch: `.branch(ctx => costTier(ctx.input)).path('cheap', codexPath).path('mid', opencodePath).path('opus', foregroundPath)`.
5. **`parallel(w => w.step(...).step(...))`** — `Promise.allSettled`, group-fails-together. For dispatch: race three harnesses, take the first passing PR.
6. **`subWorkflow('name', mapInput)`** — composition. For dispatch: child workflow handles spec→PR; parent handles spec→PR→review→merge.
7. **`waitFor('event', { timeout })` + `engine.signal(runId, event, payload)`** — workflow genuinely sleeps in SQLite until human signals. For dispatch: operator approval before destructive merge; agent waits days, not minutes.

Plus loops (`doUntil`, `doWhile`, `forEach`) with `maxIterations` safety, schema validation via duck-typed `.parse()` (Zod / ArkType / Valibot), and typed events (`step:retry`, `workflow:compensating`, `signal:received`) for Datadog wiring.

## Cross-harness retargeting

The classic saga example is e-commerce checkout: validate-cart → reserve-inventory → charge-card → ship → notify. Compensations refund and release. **The agent-dispatch isomorph**:
