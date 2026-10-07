# Brittany development deployment integrity repair

Owner: shared EU4 deployment tooling; affected mod brittany_missions
Date: 2026-10-07
Authorization: focused investigation and safe repair requested by the user;
no architecture phase, gameplay change, commit or push.
Current state: [framework](../STATUS.md), [Brittany](../mods/brittany_missions/STATUS.md)
Execution: [focused plan](../../.agent/plans/2026-10-07-brittany-deployment-repair.md)

## Root cause and authority

The sole ownership violation was the missing final LF (`0A`) in the ordinary-profile
`mod/brittany_missions_dev.mod`: 174 actual bytes instead of 175 intended/recorded
bytes. It is UTF-8 without BOM with LF separators; there was no CRLF conversion,
BOM/encoding change, metadata change or additional text edit. The 174 bytes were
exactly the first 174 bytes of the canonical generated launcher. The internal
descriptor was unchanged: 66 bytes, UTF-8 without BOM, final LF present.

The destination is the ordinary EU4 userdir's `mod/brittany_missions_dev/`, adjacent
to that launcher. Exact machine paths are retained only in ignored local evidence.
Its ownership key is `F84ACBDEFE17798F`, with record at
`tools/deployment/state/brittany_missions/F84ACBDEFE17798F/latest.json`. The previous
unversioned record and its timestamped `20261002T200720351Z/deployment.json` were
byte-identical. Every one of the 11 deployed files matched both that record and
its archived `staged/` copy. No extra/missing file or content/hash ownership mismatch
was present. The record remained valid historical ownership, rather than false
state requiring a rebaseline.

The [selector report](../mods/brittany_missions/testing/diplomatic-selector.md#results)
independently documents loss of the launcher final newline during the October 2
run. This investigation confirms the bytes; it does **not** identify the responsible
process/person or establish that EU4 or the launcher caused it. No unknown or
potentially user-authored mod-content changes were found. The original changed
launcher was preserved before restoration regardless.

Current canonical production source and effective canonical mod metadata/generation
were authoritative. Legacy local metadata overrides have the same effective name
and version and remain untouched. The generated launcher hash equals the historical
ownership hash, so the old newline could be restored without adopting new ownership.
Separately, the destination held the old pre-extraction source: only the two reward
blocks in `missions/Custom_Breton_Missions.txt` differed from current source, and
`common/scripted_effects/BRI_mission_effects.txt` was absent. The old inline shipbuilding
and secure-borders rewards correspond to the documented later production effect
extraction. Those differences were old owned content, not external edits. No source
was changed to match the destination.

| Bytes/file | Before SHA-256 | Intended/after SHA-256 |
| --- | --- | --- |
| Launcher, one final LF absent | `02cfb2d626f1f3841cf3807606e9343bdb1dab2519f56478d26975d17aef18d9` | `8a8787d96552f61e4be0705dea0ef670dba9e91408f6fa7726ac62abe997a0c6` |
| Internal descriptor, unchanged | `e770ec741a55684d086735d4cf24e8d2c87a021b1a2f04ac4e2a4cf13725ee6d` | same |
| Old owned mission file -> current production copy | `cb4454a5ce6954728c513e8ec52a160a773219b0cca86853d7348e8859b2a5b1` | `c7f42b80e6037c11fa988edbe1ae1f0c71da1f2e1a6f55fe8fcc85d1c08eb324` |
| Existing production effect file, newly deployed | absent | `a9244ba4fc65d9a000dcbf90a7c5751871d0d7abd1a022bea9d89adacb93bd9c` |

## Reconciliation and changed inventory

There was no supported final-newline repair. Added
`tools/deployment/repair-launcher-newline.ps1` as a separate, narrowly guarded
restoration path; the normal deployer/check/hash guards remain byte-identical.
Repair verifies record identity/source/destination, full owned file set and hashes,
canonical internal descriptor/launcher hashes, and exact final-LF-only difference.
It rejects wider changes and preserves original bytes. This is restoration of
recorded canonical bytes, not an ownership reset or acceptance of arbitrary edits.
See [tool interface](../../tools/deployment/README.md#exact-launcher-final-newline-restoration).

The live verified preview wrote nothing. Actual restoration wrote only the launcher
and a new ignored `repair-20261007T184253405Z/` audit containing
`launcher-before.mod`, `ownership-before.json` and `repair.json`. Ownership remained
byte-identical through restoration. Then unchanged `tools/deploy-mod.ps1` ran normal
fresh CWTools validation, strict ownership checks, previous-copy backup, source
copy/generated descriptors, copied-byte verification and normal schema-2 recording.
No state JSON was hand-edited, removed, falsified or force-adopted.

Normal deployment `20261007T184327632Z/` contains `staged/`, `previous/`,
`previous.mod` and `deployment.json`; only this destination's `latest.json` changed
among pre-existing deployment records. The previous copy matches the old owned
content, with restored launcher. New ownership records 12 files, validation `passed`,
source owner/namespace `brittany_missions`, artifact `staged`, and verdict
`UNVERIFIED` for activation/gameplay.

| Current build | Manifest SHA-256 |
| --- | --- |
| Canonical source | `0e73280b84ba52ca13f979eca6978fc12e8fe068dc0993228ccdfeb6c8c17818` |
| Deployed artifact (source plus generated internal descriptor) | `14afac64efbfa878db2b61867e9803b43619ce723ae6b8df2124009f49f3af1d` |

Repository edits: new repair tool and this handoff/focused plan; expanded
`tools/deployment/self-test.ps1`; deployment README, framework STATUS/ROADMAP/TESTING,
runtime index, Brittany STATUS/ROADMAP and plan index. Production source, ordinary
settings/playset, local configuration, normal deployer, Phase 2A/2B/2C code/models,
prior handoffs and historical evidence were not edited. New generated test fixtures,
repair/deployment state and fresh Brittany check reports remain ignored.

## Validation and protected state

| Check | Actual result |
| --- | --- |
| Pre-repair `./tools/check-project.ps1 -Mod brittany_missions` | FAIL/1, complete; solely `modified-destination`; CWTools 0 errors/58 warnings, inspector 0 errors/6 warnings, file checks clean |
| `./tools/deployment/self-test.ps1` | PASS/0 after two retained development failures in ancestor traversal/OneDrive placeholder handling; exact restoration, refusal controls, untouched ownership and sentinel assertions passed |
| Repair live `-Preview`, then actual restoration | PASS/0; eligibility verified without preview writes; one final LF restored, original record/launcher preserved |
| `./tools/deploy-mod.ps1 -Mod brittany_missions` | PASS/0, normal CWTools-validated copy; no skipped/error-allowed validation |
| Normal deploy `-Mod brittany_missions -Preview` after reconciliation | PASS/0; path-only preview, no writes |
| `node tools/test-offline.mjs` | 89 Node tests PASS, 0 skips/failures, plus four tool self-test programs PASS; includes Node/PowerShell metadata/descriptor parity and Phase 2B identity regressions |
| Post-repair `./tools/check-project.ps1 -Mod brittany_missions` | PASS/0, complete at `2026-10-07T18:44:31.231Z`, run `651a3457-59f7-44ba-ba42-eeb6a9ddebe3`; CWTools 0 errors/58 warnings, inspector 0 errors/6 warnings, file/deployment checks 0 errors/warnings |
| Independent bytes/state verification | All 12 deployed hashes and file set equal canonical source/generated descriptor; launcher exact canonical bytes/hash; source/artifact manifests and normal archival record match current ownership; original audit bytes and previous backup verified |
| Protection/sentinel controls | Normal deploy refuses missing launcher LF and changed mission content; repair refuses manual launcher edits, extra/changed content, owner/schema/hash conflicts and already intact launcher; fixture unrelated sentinel untouched; 14 ordinary neighboring launcher files hash-identical |
| Repository hygiene | Publication audit PASS (zero findings), link audit PASS, tracked diff and new-file whitespace/scope review PASS; no staging, commit or push |

The pre-repair baseline captured 24,797 path entries, including all production and
historical evidence files, native code/fixtures/work records and prior local phase
evidence. Comparison found no unexpected changes. Protected groups matched: 20
production files, 738 historical evidence files, 21,831 runtime code/fixture/record
files, two evidence-identity implementation files, nine configuration/override files,
1,689 prior phase local files, 345 pre-existing deployment-state files excluding the
intentionally updated live latest record, and 18 selected external references
excluding intentionally changed live launcher/mission. Groups overlap. Two Phase
2A/2B handoffs were in this captured baseline; the Phase 2C handoff and governing
ownership plan were additionally verified unchanged against the initially clean
Git worktree/HEAD. This is an enumerated byte-integrity claim, not a claim to hash
the entire machine or every installed/cache dependency.

The first integrity comparison retained a failure for the offline inspector's
expected isolated `self-test-brittany/latest.json` update. The final comparison
explicitly permits that generated fixture report, separately from normal Brittany
reports; it permits no production/runtime/config/history changes. Failed original
combined records, early development-test failures and this diagnostic failure remain
available. No assertion/protection was weakened to obtain PASS.

Raw evidence: ignored `.local/brittany-deployment-repair/` contains `before.json`,
`before/` original descriptor/state/failure snapshots, historical/current mission
byte copies, `neighbors-before.json`, diagnosis, repair/deploy/preview transcripts,
deployment self-test transcripts, offline output, combined before/after transcripts
and `integrity-final.json`. This public handoff is an authored summary, not a
redacted byte-identical runtime fixture. No raw game/history content is published.

## Playtest list

| Affected files/interface | Starting conditions and steps | Expected evidence / failure signs |
| --- | --- | --- |
| Repair tool, deployer and ownership | Run `./tools/deployment/self-test.ps1` in fresh ignored owned fixtures; remove one final launcher LF, preview/restore, then deploy normally | Preview no writes; exact canonical restoration, unchanged ownership during repair, normal copy PASS. Any accepted manual text/content/owner/schema/hash conflict or changed sentinel fails. Completed here. |
| Source/generated/deployed/state relation | Run explicit Brittany deploy preview and combined check; independently compare manifests, canonical descriptor bytes and state, retaining earlier failure | Twelve files and launcher match intended bytes/state; complete combined result, retained warnings. Wrong hash/file set/BOM/final LF or stale ownership fails. Completed here. |
| Metadata and evidence identity | Run offline aggregate, including both owners' Node/PowerShell parity and Phase 2B identity cases | 89 tests/four self-tests PASS; no changed native bindings or ownership/config architecture. Completed here. |
| Ordinary launcher activation/gameplay | Existing [Brittany runbook](../mods/brittany_missions/testing/README.md#playtest-list), confirm actual version/DLC/playset before separate gameplay scenarios | No new gameplay/activation evidence was required or collected. Existing reward/selector/export gaps remain open; copy/descriptor PASS cannot close them. |

## Remaining deployment debt

The actor/process causing newline loss remains unknown; recurrence is not automatically
repaired. Broader newline/encoding/metadata/content edits still fail and need a separate
bounded investigation. The repair is non-atomic and assumes no concurrent destination
writes; close EU4 and retain backups. Deprecated local metadata migration, ordinary
launcher activation, release descriptors/export and broader gameplay remain independent
work. No native EU4 validation was needed because production, native fixtures,
selection/lifecycle and descriptor/activation conventions stayed unchanged. No new
native PASS, commit or push occurred.
