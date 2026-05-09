# cap-prep-ritual — mandatory cold-start invocation for saga-N captains

> Saga-26 distillate from saga-25 mandatory-cold-start-ritual doctrine `19e0a19c97cdc83` + saga-25 P5 neutron-star primitive `19e0a51b2e10dd0` (cap-prep --detect as THE-ONE-RITUAL-PRIMITIVE) + saga-25 doctrinal-loop-closure-IS-rewarded-pattern `19e0a57b377dee3` (4-OP-BOOM evidence).

## What it cures

Each saga's captain inherits substrate from the prior captain (saga N-1). Without a structured cold-start, captains:
- skip prior-saga scars + repeat them within first 5 messages
- miss inbox-punts queued specifically for this saga
- fail to surface the cure-doctrines that just-banked-doctrine waits to be applied
- waste 30+ tokens on raw substrate exploration vs running the existing detect-loop

Saga-25 wall: 4 OP-BOOMs ALL rewarded the same pattern — captain-applying-just-banked-doctrine-immediately. Cap-prep --detect ritual IS that pattern made tool-shape. Saga-26 first message: ran cap-prep --detect (per cure-doctrine); session shipped 14+ commits + 9 TYPE-1 cure-doctrines on the doctrinal-loop-closure rate.

## The ritual

```
FIRST MESSAGE OF SAGA N → bun scripts/cap-prep.ts --detect
LAST MESSAGE OF EACH ROUND → bun scripts/cap-prep.ts --detect (refresh)
```

What `cap-prep --detect` surfaces (saga-26 5-substrate cold-start orientation):
- prior-saga scars / TYPE-1s / self-catches
- prior-saga doctrines coined (last 10) + hot doctrines + saga-N inbox punts queued FOR this saga
- top-cited gravity-wells (cross-saga sister-link backref-index)
- 5 evergreen-scar detectors (multi-close / escape-soup / captain-orch / duplication-mandate / parallel-shim) with suspect-counts per saga
- own-session dingleberries (unaddressed asides)
- **gift-evidence projection** — 5-tier cross-civilization witness counts per gifts/*.md (arq + seshae + cross-project + codex + opencode)
- **scar-doctrine-pair audit** — orphan scars (no sister-doctrine cite) = ACTIONABLE cure-work
- **lexicon projection** — top operator-coined terms by cite-density (1401 terms via Phase-3 hyphen-rich extraction)
- **scripts-corpus projection** — top hubs (≥5 callers) + orphan-watch (0-caller non-CLI projections); corpus topology snapshot

## Iron law

```
NO CAPTAIN ACTION BEFORE cap-prep --detect ON FIRST MESSAGE
```

If the doctrine that warns about a scar isn't in your context, you'll re-trip the scar. Cold-start without the ritual = unbanked-doctrines stay invisible = 30+ tokens of friction per repeated TYPE-1.

## Five-step cap-prep loop (per round)

1. **First-message of saga**: `bun scripts/cap-prep.ts --detect` — surfaces inherited scars + doctrines + suspects
2. **Read top suspects per detector** — decide cure-action (active-cure / mark-stale / point-to-existing-doctrine)
3. **Bank applied doctrines** as you ship: `bun scripts/arq-log.ts add doctrine "..."` for any rule-shape that emerges
4. **Round-end refresh**: re-run `cap-prep --detect` to see what your work shifted (NEW suspects? doctrines newly-applicable?)
5. **Pre-compact**: re-run before context-wall hits; pre-compact-hook integration ideal (saga-26 punt)

## Detector dial-discipline

The 5 detectors fire on text-pattern + type-filter. Most "suspects" are already-cured doctrines (saga-25 wall: 36 multi-close suspects = 80% banked-as-doctrine, 20% actionable). To make detectors actionable:
- Add `antiPattern` to each detector excluding cured-state strings
- Or filter results via separate "scar-without-sister-doctrine" projection
- Saga-26 punt: scripts/projections/scar-doctrine-pair.ts

Until that ships, treat detector output as **suspect-cluster orientation** not as **cure-prescription**.

## Composition with sister-rituals

Cap-prep is one of 5 rituals captains run:
- **cap-prep --detect** (cold-start + round-end orientation)
- **memelord query** (cross-session memory; saga-25 doctrine 19e09a13dd87fcf)
- **state-ascertain** (where-do-we-stand structured snapshot via scripts/projections/state-ascertain.ts)
- **saga-walk** (extract prior-cap actual invocations; scripts/saga-walk.ts)
- **/mq scars / arcs / sesh** (skill-tier session/arc/scar mining)

Cap-prep is the orientation-of-orientations. Run it FIRST, then use sister-rituals for specific drill-downs.

## Project-retargeting (cross-civilization)

For any project with a similar substrate:
- `scripts/cap-prep.ts` ports as-is (~200 LOC; depends on scripts/lib/* + scripts/projections/*).
- Subcommands `--detect | --cascade N | --close` are 1-CLI for 3 ritual-modes (saga-25 distillate).
- The 5 detectors (multi-close / escape-soup / captain-orch / duplication-mandate / parallel-shim) are GLOM-shape; replace with your project's recurring scar-patterns.
- Mandatory-cold-start discipline ports verbatim — first action of every session = orientation-from-substrate.

## Sister doctrines (in arq)

- `19e0a19c97cdc83` saga-25 mandatory-cold-start-ritual (parent doctrine)
- `19e0a51b2e10dd0` saga-25 5-neutron-star-primitives (cap-prep = P5)
- `19e0a57b377dee3` saga-25 doctrinal-loop-closure-IS-rewarded-pattern (4-OP-BOOM evidence)
- `19e09a54d8e412b` saga-25 doctrine-without-execution-is-half-doctrine (sister cure)
- `19e0a3f9f5ec385` saga-25 captain-AS-substrate-projection (orientation-from-substrate philosophy)
- `gifts/3-tier-ptc-pattern.md` (sister-gift, saga-26 — what the captain does AFTER orientation)
- `gifts/dial-loop-toolbox.md` (sister-gift, saga-26 — how the captain dials patches WITHIN the loop)
- `gifts/cascade-discipline.md` (sister-gift, saga-25 — propagation across N callers)
- `gifts/substrate-tier-ladder.md` (sister-gift, saga-26 — workflow for scratch-experiments the captain runs)

## License

CC0 — public domain. No attribution required. Adopt + dial freely.
