# Brittany testing and playtests

Owner: mod/brittany_missions
Last updated: 2026-10-06

Use [coverage](coverage.md) and [status](../STATUS.md) for actual supported claims.
Shared interfaces/exit semantics live in [framework testing](../../../TESTING.md).
[Canonical config and override rules](../../../runtime/configuration-ownership.md)
separate development descriptors/inspector state from native contract fixtures;
source-backed QA uses isolated output and cannot refresh native coverage.
Commands below prefer explicit source ownership. Legacy omitted-Mod commands
retain historical routing. `-ListTests -Mod brittany_missions` lists support
without launching or changing reports. See the
[Phase 2A handoff](../../../runtime/phase2a-ownership-2026-10-06.md) for fresh results.

```powershell
./tools/validate-cwtools.ps1 -Mod brittany_missions
./tools/inspect-missions.ps1 -Mod brittany_missions
./tools/check-project.ps1 -Mod brittany_missions
# Four Brittany LOGIC/EFFECT/WIRING regressions, no ordinary claim:
./tools/run-eu4-test.ps1 -Mod brittany_missions -Test all -TimeoutSeconds 150
# Separate supervised actual-input contracts:
./tools/run-eu4-test.ps1 -Mod brittany_missions -Test nantes-claim -ClaimMode click -TimeoutSeconds 600 -ProgressTimeoutSeconds 600 -Retries 0
./tools/run-eu4-test.ps1 -Mod brittany_missions -Test nantes-claim -ClaimMode negative -TimeoutSeconds 600 -ProgressTimeoutSeconds 600 -Retries 0
```

The four members of `all` are preview-gate, shipbuilding-reward, borders-reward
and textiles-upgrade. It excludes Nantes/console diagnostics/USA/campaign play.
Source/staged static acceptance and effect/wiring PASS do not verify dispatch.
The native Brittany preflight requires only `mod/brittany_missions_dev.mod` in
ordinary launcher enabled_mods and no disabled DLC; the runner stages its own
source copy. No unrelated EU4 session may be altered. Confirm actual native
version/activation against the [shared preference](../../../testing/environment.md).

## Playtest list

New generated results follow [schema 2](../../../runtime/evidence-identity.md).
Require sourceMod=brittany_missions separately from storage aliases, the requested
contract/members/mode/layers and matching source/fixture builds and run/attempt.
Fresh complete native evidence differs from replay/static/operator/cleanup evidence.
Fixture PASS is bounded to the named scenario and does not close ordinary campaign gaps.

| Scenario / affected source | Starting conditions and steps | Expected behavior / failure signs / evidence |
| --- | --- | --- |
| Selector: missions/events/decision and preview trigger | [Canonical selector](diplomatic-selector.md), BRI normal 1444 start; inspect/switch/lock/reload, then all-other-requirements-ready preview test | Mutual exclusion, blocked preview completion, exact locked reward/refresh; wrong branch or claim before lock fails. Historical user checks are partial, not current build certification. |
| Shipbuilding, borders, textiles effects/missions | [Suite playtests 1-4](../../../testing/runtime-regression-suite/README.md#playtest-list), fresh BRI fixture and actual ready mission buttons | Exact named rewards, ally branch, tooltip, persistence/expiry; script-effect PASS alone is insufficient. Dispatch/expiry remain open. |
| Nantes: mission and cloth modifiers in 172/169/4384 | [Manual reference](../../../testing/runtime-nantes-market/faithful-completion-2026-10-03.md) and [claim playtests](../../../testing/runtime-mission-claim/README.md#playtest-list); fresh incomplete BRI, remove/add marketplace, real click, before/after native saves, ordinary reload | Missing building blocks; ready claim grants both permanent +0.15 rewards once, immediately readies Textiles; no duplicate action/reward. Manual numeric/reload and bounded automated click/refusal are distinct evidence. |
| Native-query calibration | [Calibration playtests](../../../testing/runtime-run-effects/README.md#open-playtest-list); compare ID/completion queries with UI/numeric/native save/day/reload | Preserve false queries alongside positive saved values; cause remains unresolved. Do not infer absent reward from a failed ID query. |

Remaining uncovered systems are listed in [roadmap](../ROADMAP.md). The recorded
input condition is 1280x720/scale 1/top scroll and requires the historical active
Codex input adapter. Without it, use documented manual work or keep the affected
UI result INCOMPLETE. Preparation-only and offline replays are not native PASS.
