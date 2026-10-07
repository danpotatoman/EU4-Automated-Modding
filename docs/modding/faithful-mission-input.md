# Faithful mission input

Owner: shared EU4 mechanics/tooling knowledge

The Brittany/Nantes examples/results below are attributed workloads, not general mod coverage.
Current framework capability lives in [framework status](../STATUS.md) and
[runtime knowledge](../runtime/README.md); gameplay state/playtests belong to
[the mod owners](../mods/README.md). Dated verification and unresolved assumptions
remain scoped to their recorded versions, dependencies and fixtures.


Purpose: exercise a production mission's real entry-button action, with independent
saved completion/reward evidence. This is test infrastructure, not a new mechanic.
Target installed EU4 1.37.5.0/default 18 DLC; no broader compatibility established.

## Files, scopes and minimum pattern

Existing `tools/runtime-tests/run.mjs` owns staging, validation, attempt process,
collector, deadlines and cleanup. `mission-claim.mjs` prepares country-scoped Nantes
setup/observation files without invoking its reward. Input adapter runs in Codex
`node_repl` using the supported `@oai/sky` API, bound to a fresh harness identity
lease and exactly one returned window. It does not launch a separate game/watcher.
Bare PowerShell execution cannot provide that Codex input runtime by itself.

```powershell
./tools/run-eu4-test.ps1 -Mod brittany_missions -Test nantes-claim -ClaimMode click -TimeoutSeconds 600 -ProgressTimeoutSeconds 600 -Retries 0
```

Native setup checks membership, building conditions, zero goods modifier and DLC.
Console queries after UI input are observations; native save is authoritative for
completion and named modifier identity/permanence. Production localisation stays
unchanged. Never run copied mission rewards plus forced completion as the solution.

## Installed interface evidence

Read-only sources under installed `interface/`: `countryview.gui` has Missions
tab shortcut 8. `countrymissionsview.gui` defines a view origin (0,140), list
origin (10,122), grid slots (104,152), five columns, and named
`mission_entry_button` without a shortcut. Profile `shortcuts.txt` names view
close/tab actions but does not contain a mission-entry action in the inspected
ordinary profile. A repeated template shortcut may activate an ambiguous mission;
it needs negative/identity proof before use.

Nantes is series `bri_commerce_missions`, slot 2, position 1. At UI scale 1 and
top scroll the candidate interior is derived as view + list + grid offset +
frame interior. Window decoration/capture origin and actual GUI positioning must
be confirmed from screenshot, not assumed. Fixed isolated 1280x720/windowed/
scale-1 settings require no production or ordinary-profile changes.

## Pitfalls and validation

Validate full staged wrappers with CWTools. Verify owned PID, creation, executable,
isolated command path and HWND before each input; reject expired leases, failed
markers, missing/multiple windows, locked desktops, unexpected dialogs or geometry.
Screenshot before action and reobserve after one action; no timer-only desktop
click. Keep bounded total/progress waits and cleanup even on adapter failure.
Screenshot-backed semantic/layout inspection is Codex-dependent in the first POC;
do not claim general unattended deterministic image recognition.

Playtests: fresh ready -> UI action -> saved completion exactly once, both named
permanent +0.15 rewards, downstream parent changes; compare human-click reference.
Separate fresh console/scripted/tree candidates. Negative no-building state must
remain incomplete/unrewarded or adapter refuse. Confirm cleanup and separate clean
`all`. Remaining evidence and commands belong in
[faithful claim report](../testing/runtime-mission-claim/README.md).

## Verified pattern and limits (2026-10-03)

The Codex-driven ready Nantes claim passed through the actual mission entry:
normal reward dialog, saved completion once, both named permanent rewards once,
and immediate Textiles readiness. Fresh negative refusal and separate clean `all`
also passed. No production or ordinary profile bytes changed. Native `mission`,
scripted completion and `mission_tree` set completion state without Nantes rewards.
UIA had no mission controls; keyboard delivery was unresponsive through the tested
adapter; a cloned-button shortcut remains unverified. No isolated GUI override
was necessary.

Native setup assertions check trigger inputs; screenshot inspection establishes
actual readiness, not a general dynamic mission-readiness trigger. Verified point
(166,312) client -> (167,343) decorated screenshot applies only at 1280x720/scale 1,
top scroll, this production tree and verified 1282x752 capture.

Before every action the existing harness answers a fresh token challenge after
checking the original PID/creation/executable/userdir/HWND; responses expire in
1.5 seconds. Input stays screenshot/window scoped. Adapter action failures write
an abort handoff so existing cleanup proceeds. Save contract independently rejects
completion without exact rewards, repeats or finite expiry. The post-click numeric
probe/reload were not repeated; the normal dialog and named saved modifiers match
the retained human reference. Other geometry, locked desktops and UI-stage native
crashes remain open in the report's labeled playtest list.

Current example coverage: [Brittany/Nantes owner runbook](../mods/brittany_missions/testing/README.md).
