#!/usr/bin/env bun
// postit: append-only ad-hoc scratch notes (asides, "remember this", mid-stream reminders).
import { runCli } from './lib/arq.ts'

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["postit"]
runCli('postits', process.argv.slice(2), 'postit')
