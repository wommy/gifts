#!/usr/bin/env bun
// arq-log: append-only tasklist (work items, scars, observations, doctrine, headings, mocks).
import { runCli } from './lib/arq.ts'

// substrate-fit declaration (saga-26 N7 / doctrine 19e0af044e574df)
export const substrateRequires = ["arq"]
runCli('tasklist', process.argv.slice(2), 'arq-log')
