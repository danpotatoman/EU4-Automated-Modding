# Ordinary mission-button fixtures

Purpose: prepare controlled province/building state, then leave mission completion
to the user through the ordinary mission UI. Applicable evidence: EU4 1.37.5.0
Inca (491d), default 18 DLC; isolated startup/run-file dispatch and scopes are
demonstrated by [console guide](console-run-effects.md). The mission-button path
and post-click/reloaded run dispatch are now demonstrated in the linked result;
actual manual save/reload is verified. This is a bounded test-only pattern, not
production mission logic.

Required files: unchanged hashed production copy, generated descriptors/profile,
plain profile-root setup/ready/observation `.txt` files and non-invoked country
scripted-effect wrappers for CWTools. No new localisation is needed. Plain files
use explicit `BRI = { ... }` and province scopes. Setup may change only fixture
buildings and test variables. Ready action adds a marketplace; completion and
cloth reward application are reserved for the ordinary mission button.

Minimal setup/ready example:

```text
BRI = {
    172 = {
        remove_building = marketplace
        remove_building = trade_depot
        remove_building = stock_exchange
    }
    169 = { add_building = workshop }
    4384 = { add_building = workshop }
}
# Separate ready file, run only after observing the unavailable mission:
BRI = { 172 = { add_building = marketplace } }
```

Vanilla sources/dependencies (game files read only):
`common/scripted_triggers/00_scripted_triggers.txt` defines building-family helpers;
`common/buildings/00_buildings.txt` defines marketplace/workshop;
`events/ConsortEvents.txt:1783` demonstrates subtraction between variables using
two `which` fields; `common/scripted_effects/00_scripted_effects.txt:2412–2414`
demonstrates copying a variable with two `which` fields. Building-helper
definitions were checked at `00_scripted_triggers.txt:1196,1207`; building IDs
at `00_buildings.txt:30,82`. Confirm definitions/current hashes before reuse.
Retained [Nantes hook](../testing/runtime-nantes-market/evidence/ready/hook.txt)
demonstrates trade-building setup; retained
[calibration](../testing/runtime-run-effects/README.md) demonstrates numerical
exports and scopes. Current Nantes/Textiles definitions and cloth modifier are
dependencies of this specific fixture, not copied reward implementations.

Launch a fresh profile with `-debug -userdir=<profile>/ -start_tag=BRI` and
`-auto_run=<setup-commands>`. For reload, omit `-start_tag` and `-auto_run` and
have the user load the native checkpoint. There is no destructive startup hook.
The isolated profile is held open for manual input under an owned-process
watchdog; startup numeric assertions prove fixture facts, not UI readiness.
Always refuse an existing EU4 process; start watchdog/helpers hidden, keep the
game visible for operator interaction, bound its lifetime and close only the
owned PID. Record the deadline so the operator can save before it.

Validation: CWTools production and staged wrappers; verify source/staged hashes,
current nonce and native startup markers/version/DLC. Plain observation files
must never apply/remove cloth, complete/toggle missions or call reward helpers.
Do not treat negative named queries as absence; compare numeric delta, UI and save.
Expected +0.15 contribution uses 0.001-width intervals. Dates after manual actions
must be recorded as observed rather than forced to 1444.11.11.

Playtest: observe Nantes unavailable, save unready, execute the ready file, observe
availability, save ready, click Nantes, observe both permanent cloth rewards and
Textiles readiness while leaving Textiles incomplete; save completed, close and
reload without setup dispatch. Failures include ready-before-market, no readiness
after market, state-only completion, either missing/wrong reward, stale parent,
repeatable button or lost reload state. Separate mechanism failures from ordinary
gameplay failures. Exact checkpoint instructions/results live with the
[execution plan](../../.agent/plans/2026-10-03-nantes-faithful-completion.md).

Verification status: pattern documented before implementation on 2026-10-03.
Production CWTools completed with 11 files, zero errors/58 warnings; the new
isolated staging with 12 files, zero errors/66 warnings. Added warnings concern
test-only named-modifier queries. Generated launcher/watchdog PowerShell syntax
was accepted; all 11 staged production hashes match source. Native initial setup
passed all 24 assertions at 1444.11.11, including all 18 DLC and zero value
baselines; see [current session](../testing/runtime-nantes-market/manual-session.md).
Operator readiness transition is verified immediately without refresh/unpause,
corroborated by eight ready markers and inspected native unready/ready saves.
All source/staged/console hashes remain unchanged. Ordinary button completion,
both named permanent +0.15 cloth contributions and immediate Textiles readiness
are verified by operator UI/native saved state and numerical exports. Post-click
run dispatch works, but its `mission_completed` query returns false despite UI/
save completion; preserve the FAIL and use independent evidence, cause unresolved.
Actual reload retains completed Nantes/no second action, both permanent rewards/
contributions, Textiles readiness and unchanged fixture/selector state without
refresh. The false completion/presence queries persist; do not relabel probe FAILs.
Reloaded native metadata names the loaded file but changes `campaign_id`; compare
explicit source, hashes and relevant state rather than assuming UUID stability.
See the [final report](../testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
for raw evidence and scope. Static validation alone proves no gameplay result.
