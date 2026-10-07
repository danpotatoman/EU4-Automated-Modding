# Runtime script assertions

Owner: shared EU4 mechanics/tooling knowledge

The Brittany/Nantes examples/results below are attributed workloads, not general mod coverage.
Current framework capability lives in [framework status](../STATUS.md) and
[runtime knowledge](../runtime/README.md); gameplay state/playtests belong to
[the mod owners](../mods/README.md). Dated verification and unresolved assumptions
remain scoped to their recorded versions, dependencies and fixtures.


Investigation started 2026-10-03 against installed EU4 1.37.5.0. This guide
describes a prototype, not established support for a headless EU4 test API.

## Purpose and scope

Execute a production country scripted trigger under controlled flag states and
emit assertion markers through EU4's own `log` effect. Keep hooks and generated
test mod copies under shared tools, never in `mod/brittany_missions/`.

Required files: production `common/scripted_triggers/BRI_mission_triggers.txt`,
its English tooltip localisation, a test-only `common/on_actions/` hook, an
isolated mod descriptor and user profile, and an external log evaluator.

Minimal country-scope example:

```text
on_startup = {
    if = {
        limit = { tag = BRI }
        set_country_flag = bri_diplomacy_preview
        if = {
            limit = { bri_diplomacy_preview_trigger = yes }
            log = "RUNTIME_TEST unexpected_allowed"
        }
        else = { log = "RUNTIME_TEST correctly_blocked" }
        clr_country_flag = bri_diplomacy_preview
    }
}
```

## Installed vanilla evidence

- `common/on_actions/00_on_actions.txt:4-35`: country `on_startup`, effects,
  event list and calls to startup scripted effects.
- `common/scripted_effects/01_scripted_effects_for_simple_bonuses_penalties.txt:191`:
  diagnostic `log` within script logic.
- `events/center_of_revolution_events.txt:379`: scoped `log` output.
- The installed executable contains `start_tag`, `userdir`, `run_commands`,
  and the text `start_tag is set, skipping main menu`. Strings identify candidates;
  they do not prove accepted launch syntax or behavior.

The gate has no DLC requirement. Tests must independently assert the documented
18 DLC are active. No test localisation is needed for plain diagnostic log text;
the production scripted trigger still depends on its production tooltip key.

## Validation and pitfalls

Run existing CWTools against production and against the staged production plus
test hooks. Use the existing log collector for before/after evidence. Evaluate
only markers with a unique current-run nonce; missing output means incomplete,
not PASS. Refuse to interfere with an already running EU4 instance. Bound the
owned process lifetime and distinguish a crash/timeout from a failed assertion.

The experiment below verified startup execution, `-userdir=...`, `-start_tag=BRI`,
observable log output and automatic initialized session entry. Exact hook merging
rules beyond this experiment remain unverified. Do not substitute copied
trigger logic for invoking the production scripted trigger. Flag setup effects
test the gate predicate, not the selector event, mission click, tree refresh,
prerequisites, rewards or save/load persistence. A subsequent
[native mission investigation](native-mission-completion.md) verified that
`complete_mission` can record completion even with a missing building and does
not grant Nantes's rewards in the tested startup contexts. Do not use it as proof
of ordinary mission completion.

Test: fresh 1444 Brittany, independent, all selector flags absent; assert gate
allows; set preview and French branch flags, assert gate blocks; replace French
with autonomous branch flag and assert gate still blocks; clear preview as locking
does, assert gate allows while the branch stays selected. Verify unrelated branch
flags and country/date preconditions as separate assertions.

## Verification status

**Verified in game 2026-10-03:** native startup invoked the unchanged production
gate and emitted all 24 successful assertions (26 markers including BEGIN/END)
at 1444.11.11 in EU4 1.37.5.0, with all 18 required DLC active. The runner reported
PASS and closed EU4 normally, without gameplay UI or console input. Static checks
completed separately: production 10 files and staged 11 files, zero errors and
58 warnings each. Full evidence, failed startup attempts and unresolved playtests:
[runtime preview gate](../testing/runtime-preview-gate/README.md).

Steam must be available; the first restricted launch failed Direct3D creation,
and the next launch stopped at a Steam-not-running dialog. Neither incomplete
attempt was called PASS. The successful test used desktop graphics access and an
isolated profile. It is not headless. Save loading, native mission-completion
commands and selector/mission integration remain outside this verified scope.

The followup changes retained this scenario; a fresh native regression on
2026-10-03 again passed all 24 checks. Evidence is linked from the
[Nantes report](../testing/runtime-nantes-market/README.md).

Current example coverage: [Brittany/Nantes owner runbook](../mods/brittany_missions/testing/README.md).
