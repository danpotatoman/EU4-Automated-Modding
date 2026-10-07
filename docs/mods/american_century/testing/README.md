# American Century testing and playtests

Owner: mod/american_century
Last updated: 2026-10-06

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
```

The supervised fixture starts overseas ENG, requires recorded 1.37.5.0/native
activation and a supported active Codex driver, forms USA with unchanged vanilla
decision input, claims four production missions and checks independent saves.
The runner reads ordinary launcher configuration but does not impose the Brittany
launcher-mod gate on USA. It writes only its owned isolated userdir; verify actual
activation from logs/saves. The 18-DLC preference and 21-DLC recorded activation
are distinct. No supported driver means pending/manual evidence, not automatic PASS.

## Playtest list

New generated results follow [schema 2](../../../runtime/evidence-identity.md).
Require sourceMod=american_century separately from american_runtime, usa-slice mode,
layers, source/fixture builds and run/attempt. A Brittany report cannot substitute.
Fixture native PASS is bounded to its contract; replay/static/operator/cleanup
results cannot close the natural campaign or reload gaps below.

The unchanged [six-scenario historical playtest list](../../../testing/american-century/README.md#playtest-list)
is the detailed source for affected production files, initial conditions, steps,
expected behavior and failure signs:

1. Formation/tree selection: deterministic ENG fixture verified; natural CN route open.
2. Liberty/Compact: real claims and enumerated choice verified; war/alternate choice open.
3. Harbors/Doors/Workshops: fresh unready refusal and positive claims verified;
   same-campaign marketplace transition/Workshops open.
4. State/reload: twelve paused persistence comparisons verified; expiry/repeat-click open.
5. Natural colonial runway: ENG -> eastern CN -> independent -> USA, origin rewards/
   saved flags, non-British/wrong-region/existing-USA/refusal cases open.
6. Other slice roots/union: real claims, exact military/naval modifiers, union gate,
   alternate choice and reload/expiry open.

Production involved: `mod/american_century/missions/`, `decisions/AMC_atlantic.txt`,
`events/AMC_constitution.txt`, `common/event_modifiers/AMC_modifiers.txt`,
`common/scripted_triggers/AMC_triggers.txt` and English localisation. Fixture
history is test-only, not a played natural campaign. Earlier INCOMPLETE attempts,
source-descriptor mismatch and all evidence bytes remain unchanged.
