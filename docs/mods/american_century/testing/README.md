# American Century testing and playtests

Owner: mod/american_century
Last updated: 2026-10-07

Read [status](../STATUS.md), [coverage](coverage.md) and shared
[framework interfaces](../../../TESTING.md). Prefer explicit source ownership;
legacy omitted-Mod usa-slice still selects American Century. Explicit USA all is
rejected; omitted-Mod all selects Brittany and provides no USA gameplay coverage.
`-ListTests -Mod american_century` lists support without launching or changing
reports. [Phase 2A handoff](../../../runtime/phase2a-ownership-2026-10-06.md) owns
fresh framework-refactor results, separate from retained gameplay coverage.

[Canonical config and override rules](../../../runtime/configuration-ownership.md)
preserve this mod's development-name fallback and inspector state independently of
Brittany. Source-backed QA uses isolated output and cannot refresh native coverage.

```powershell
./tools/validate-cwtools.ps1 -Mod american_century
./tools/inspect-missions.ps1 -Mod american_century
./tools/check-project.ps1 -Mod american_century
./tools/run-eu4-test.ps1 -Mod american_century -Test usa-slice -ClaimMode click -TimeoutSeconds 1200 -ProgressTimeoutSeconds 1200 -Retries 0
./tools/run-eu4-test.ps1 -Mod american_century -Test usa-slice -ClaimMode negative -TimeoutSeconds 1200 -ProgressTimeoutSeconds 1200 -Retries 0
./tools/run-eu4-test.ps1 -Mod american_century -Test usa-local-union -ClaimMode click -TimeoutSeconds 1800 -ProgressTimeoutSeconds 1800 -Retries 0
```

The supervised fixture starts overseas ENG, requires recorded 1.37.5.0/native
activation and a supported active Codex driver, forms USA with unchanged vanilla
decision input, claims four production missions and checks independent saves.
The runner reads ordinary launcher configuration but does not impose the Brittany
launcher-mod gate on USA. It writes only its owned isolated userdir; verify actual
activation from logs/saves. The 18-DLC preference and 21-DLC recorded activation
are distinct. No supported driver means pending/manual evidence, not automatic PASS.

## Playtest list

### Local Guarantees -> A More Perfect Union (bounded contract)

`-Mod american_century -Test usa-local-union -ClaimMode click` selects the existing
USA fixture/lifecycle with six paused save checkpoints; use explicit 1800-second
total/progress bounds and no retries. [Operator steps](../../../../tools/runtime-tests/README.md#alternate-usa-constitution-and-union-contract)
describe the input/save handoff. Static/offline acceptance alone does not close this
native playtest. [Acceptance/report](../../../testing/mods/american_century/local-guarantees-2026-10-07/README.md):
2026-10-07 PASS, 65 input/save checks and 13 reload comparisons; earlier calibration
remains INCOMPLETE. The current result closes only this bounded scenario.

Affected production: `missions/AMC_USA_Missions.txt`, `events/AMC_constitution.txt`,
`common/event_modifiers/AMC_modifiers.txt` and English localisation (read-only in
this scenario). Start the overseas ENG fixture at ADM 10/stability 2 with ten core
cities; form USA through the unchanged decision. Claim Liberty and Compact by real
mission buttons. Observe the pending republic/oligarchy reform and save. Choose
Local Guarantees by real event input; verify tradition 50 -> 60, exclusive flags,
permanent +1 accepted-culture capacity/-1 national unrest and no enumerated bonus.
Union must remain blocked at 60. Apply only the fixture's once-only +10 tradition
prerequisite, save ready at 70, then claim Union through its actual button. Verify
permanent +0.3 yearly tradition/+10% reform progress growth and no instant tradition
reward. Ordinary UI reload and a fresh recorded save must preserve state/totals.
Failure signs: missing/extra completion, wrong reform/option, both flags or bonuses,
missing/temporary/duplicated rewards, setup granting mission rewards, premature
Union readiness or replayed startup/lost state after reload. Natural campaign,
timed accrual/expiry, alternate layouts and exactly-18-DLC support remain open.

New generated results follow [schema 2](../../../runtime/evidence-identity.md).
Require sourceMod=american_century separately from american_runtime, usa-slice mode,
layers, source/fixture builds and run/attempt. A Brittany report cannot substitute.
Fixture native PASS is bounded to its contract; replay/static/operator/cleanup
results cannot close the natural campaign or reload gaps below.

The unchanged [six-scenario historical playtest list](../../../testing/american-century/README.md#playtest-list)
is the detailed source for affected production files, initial conditions, steps,
expected behavior and failure signs:

1. Formation/tree selection: deterministic ENG fixture verified; natural CN route open.
2. Liberty/Compact: real claims/both options verified in separate fixtures; war open.
3. Harbors/Doors/Workshops: fresh unready refusal and positive claims verified;
   same-campaign marketplace transition/Workshops open.
4. State/reload: twelve paused persistence comparisons verified; expiry/repeat-click open.
5. Natural colonial runway: ENG -> eastern CN -> independent -> USA, origin rewards/
   saved flags, non-British/wrong-region/existing-USA/refusal cases open.
6. Other slice roots/union: Local Guarantees -> Union gate/rewards/paused reload now
   verified by the linked scenario; military/naval/Workshops claims and expiry open.

Production involved: `mod/american_century/missions/`, `decisions/AMC_atlantic.txt`,
`events/AMC_constitution.txt`, `common/event_modifiers/AMC_modifiers.txt`,
`common/scripted_triggers/AMC_triggers.txt` and English localisation. Fixture
history is test-only, not a played natural campaign. Earlier INCOMPLETE attempts,
source-descriptor mismatch and all evidence bytes remain unchanged.
