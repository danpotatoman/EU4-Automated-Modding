# Brittany development deployment integrity repair

Status: complete
Last updated: 2026-10-07
Owner: shared EU4 runtime/tooling
Affected mods: brittany_missions; american_century protected
Current state: [framework status](../../docs/STATUS.md), [Brittany status](../../docs/mods/brittany_missions/STATUS.md)
Authorization: attached user request authorizes focused investigation, evidence preservation and smallest verified reconciliation/tool repair; no gameplay, architecture phase, commit or push.

## Goal
Restore trustworthy correspondence between canonical Brittany source, generated development descriptors, the ordinary development destination and its ownership record. A green check alone is insufficient.

## Background / Context
The completed [governing ownership plan](2026-10-06-project-state-ownership.md) and [Phase 2B](../../docs/runtime/phase2b-evidence-identity-2026-10-06.md)/[Phase 2C](../../docs/runtime/phase2c-configuration-ownership-2026-10-06.md) handoffs retain strict `modified-destination` failure. Historical prose suggests a descriptor-final-newline condition; this is a hypothesis until byte comparison.

## Requirements
- Capture source/destination hashes, state, descriptor bytes and failed combined report in ignored `.local/brittany-deployment-repair/` before substantive edits.
- Identify exact destination/key and every missing/extra/hash/metadata mismatch; inspect historical deployment evidence.
- Prefer canonical source and per-mod metadata/generation, then valid provenance, then destination. Preserve unknown/manual bytes before any repair.
- No force overwrite, state deletion/falsification, weakened protection, unrelated destination/process writes, production content changes, architecture changes, commit or push.
- A reset/rebaseline must independently verify all destination bytes against intended source/generated output; prefer supported tooling, otherwise add minimal audited path with refusal tests.

## Relevant Files / Systems
`tools/deploy-mod.ps1`, `tools/deployment/{README.md,self-test.ps1,state/}`, `tools/checks/check.mjs`, `tools/mod-config.{mjs,ps1}`, `tools/mods/brittany_missions/config.json`, `mod/brittany_missions/`, `docs/TESTING.md`, `docs/REPOSITORY_HYGIENE.md`.

## Implementation Plan / Progress
- [x] Preserve baseline and pre-repair failure; establish exact mismatch and authority.
- [x] Choose smallest safe reconciliation, add a narrowly verified repair mechanism/tests if necessary.
- [x] Reconcile only after byte/ownership evidence; verify new state and descriptors.
- [x] Run deployment preview/self-tests, metadata parity, relevant offline tests and `./tools/check-project.ps1 -Mod brittany_missions`.
- [x] Verify protected bytes, links/audit/diff; propagate durable findings and complete handoff.

## Discoveries / Decisions
2026-10-07: normal deploy rejects external descriptor/content modifications. `-Preview` is path-only and makes no ownership acceptance claim. No rebaseline option exists in current wrapper. Git inspection uses per-command `safe.directory` because sandbox identity differs from workspace owner; no global Git settings changed.

Byte diagnosis: destination key `F84ACBDEFE17798F`, ordinary-profile `mod/brittany_missions_dev` and adjacent launcher. Latest legacy record/deployment archive dated `20261002T200720351Z`. Every one of its 11 file hashes matches the destination; launcher alone lost final `0A` (174 instead of 175 bytes). Recorded launcher hash equals current canonical generated launcher hash. Current source differs from the old owned deployment only by two inline rewards extracted into `common/scripted_effects/BRI_mission_effects.txt` and their mission call sites; no unknown manual content found. Historical selector report independently records final-LF loss, but the responsible process/person cannot be inferred.

Decision: restore the one recorded/canonical LF with a new narrowly guarded repair tool, preserving original launcher and record; ownership JSON is unchanged by restoration. Then use the existing validated strict deployer for current source. No rebaseline or normal-deployer bypass is needed. Repair tests refuse manual launcher edits, changed/extra content, owner/schema conflicts, mismatched canonical hashes and intact launchers. Early test failures (ancestor traversal/OneDrive placeholder handling) remain local; third integration self-test PASS. A OneDrive ancestor ReparsePoint is not itself proof of a redirected path; actual ancestor Junction/SymbolicLink is refused, while deployed content/launcher/state remain strict.

Local evidence: `.local/brittany-deployment-repair/before.json` (24,797 paths), `before/` original descriptors/state/combined failures, `check-before.txt`, `deployment-self-test{,-2,-3}.txt`, `repair-preview.txt`. Fresh pre-repair combined check FAIL/1 solely `modified-destination`; CWTools 0 errors/58 warnings, inspector 0 errors/6 warnings, file checks clean. Live repair preview verifies exact LF loss without writes.

## Validation
Complete: exact repair/live preview and normal validated deployment PASS; deployment integration PASS; offline 89 Node tests (0 skips) plus four self-tests PASS; post-repair combined PASS/0 with 0 CWTools errors/58 warnings and inspector 0 errors/6 warnings. Independent source/deployed/state byte checks PASS, 14 neighboring launchers unchanged. Enumerated 24,797-path comparison has no unexpected changes; production/history/native/identity/config/prior archives remain protected. A diagnostic comparison initially flagged the expected isolated inspector fixture latest update; the final explicit generated-report allowlist retains all protected assertions. Links/publication/whitespace PASS. Full commands, identities, hashes, limits and local evidence are in the [handoff](../../docs/runtime/brittany-deployment-repair-2026-10-07.md).

Native EU4 gameplay was unnecessary: source, native preparation/activation conventions and architecture remained unchanged. No native PASS is implied by repair. Existing [Brittany playtests](../../docs/mods/brittany_missions/testing/README.md#playtest-list) remain open.

## Remaining Issues / Follow-up
Task complete. Remaining actor/recurrence investigation, deprecated local metadata migration, activation/export and gameplay are separate work; see [handoff playtests/debt](../../docs/runtime/brittany-deployment-repair-2026-10-07.md#playtest-list). No commit or push.

## Completion Criteria
Bounded verified root cause; preserved failure/evidence; safe reconciled bytes and state or bounded unresolved diagnosis; refusal/sentinel tests PASS; completed combined result accurately recorded; protected groups unchanged outside explicit repair; durable owner documentation updated.
