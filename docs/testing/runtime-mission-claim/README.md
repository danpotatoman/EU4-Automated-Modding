# Faithful Nantes claiming investigation

Investigation date: 2026-10-03 America/Los_Angeles (raw run timestamps cross
2026-10-04 UTC). EU4 1.37.5.0 Inca; default 18 DLC asserted natively; source
production assets unchanged. Faithful automated Nantes claiming is now
**verified** for this bounded Codex-driven scenario. The unready refusal and a
separate clean four-contract native suite also passed. An active Codex session
with the supported Windows input adapter is required; this is not a standalone
PowerShell UI runner.

## Native mechanisms

| Candidate | Fresh native behavior | Reward / downstream |
| --- | --- | --- |
| `mission bri_nantes_market` | Actual UI/save completed ID exactly once; console completion query false | Both cloth values 0.000, both named rewards absent; Textiles UI becomes ready |
| `complete_mission = bri_nantes_market` through country-scoped `run` | Actual UI/save completed ID exactly once | Both cloth values 0.000, named rewards absent; Textiles UI becomes ready |
| `mission_tree true BRI` | 36 production tree missions saved complete, including Nantes/Textiles | Nantes cloth values 0.000, named rewards absent; no faithful Nantes dispatch |

Sources: [mission save check](evidence/mission/save-check.json),
[scripted result](evidence/scripted/result.json), [tree result](evidence/tree/result.json),
their adjacent actual `game.log`, save block excerpts and screenshots. Each uses
a fresh isolated profile and native current-nonce pre-action membership/building/
zero-value assertions. Startup commands execute before manual navigation, so no
claim is made that a visible ready button was inspected before these startup
commands; the independent initial ready fixture supplies that reference. Nantes
has no parent dependency and its reward is inline province modifiers, with no
reward event or scripted helper to separately observe.

The `mission` runner result remains **INCOMPLETE/2** because that running process
had imported an earlier save reader requiring a before save. A subsequent
read-only `save-check.json` inspected the actual preserved native save; it does
not relabel the raw runner result. Scripted/tree results are **PARTIAL/2**,
deliberately never faithful mission PASS. Historical query-based claims that
native `mission` left actual completion false are superseded by independent save/
UI evidence; raw old probe verdicts remain unchanged.

The [fresh helplog](evidence/mission/game.log) exposes `mission`, `mission_tree`,
`window/wnd open/close`, `reload`, `reloadinterface`, `guibounds`, `debug_nogui`,
`run_commands`, `helplog`, `help`, `findcommands`. Inspecting the complete list
found no separate submit/claim/mission reward-object or GUI-click invocation.
Window opening/reloading/bounds are navigation/debug controls, not an established
claim action. No undocumented native route is proved impossible. Official-hosted
wiki Console commands/Interface modding pages returned 401; conclusions rely on
installed sources/native evidence, not secondary search snippets. No injection
tools were installed or used.

## Keyboard, accessibility and interface alternatives

Installed `interface/countryview.gui` gives `tab_missions` shortcut 8; country
shield tooltip gives F1. `countrymissionsview.gui` has repeated entry template
`mission_entry_button`, without shortcut/unique mission-specific GUI name.
Ordinary profile `shortcuts.txt` has country tab/view-close controls, no entry
shortcut. It was read only. Isolated test profiles use default shortcuts.

The supported Windows adapter returned only frame/title/system/minimize/maximize/
close accessibility elements, with no mission controls or selected mission focus.
F1, 8, Escape, grave, Shift+2 and Ctrl+S produced no visible response in tested
states; pointer navigation worked. This is an adapter/game interaction limitation,
not proof that physical keyboard shortcuts are broken. No accessible keyboard
activation of a focused mission was established. A test-only `shortcut=q` on the
existing template is statically plausible but would be inherited by multiple
cloned mission buttons; no identity-safe dispatch was established. It was not
implemented or presented as viable. No ordinary/profile/production GUI changed.
Installed file paths/version/SHA-256 provenance is retained in
[installed sources](evidence/installed-sources.json).

## Harness and owned input

`tools/run-eu4-test.ps1 -Test nantes-claim -ClaimMode <mode>` stages fixtures in
the existing `run.mjs` lifecycle. It retains production/staged CWTools, collector,
fresh attempt profiles, bounded deadlines, ownership registry, cleanup and retry
rules. `mission-claim.mjs` only sets buildings and probes state; it never executes
the production reward. `codex-input.mjs` is an internal adapter imported in Codex
`node_repl` and given the supported `@oai/sky` API. No separate launcher,
watchdog, AutoHotkey/Python bot or process injection is used.

Each input action requests a fresh identity challenge from the running harness.
The harness rechecks PID, creation timestamp, exact executable, isolated userdir
argument, original owned identity and HWND. It answers only for that attempt;
the adapter rejects stale/denied/missing responses, changed original identity,
unreturned/multiple target windows, failed native setup and expired leases.
The final UI API additionally binds input to the returned owned window and
screenshot. It refuses occluded/non-target coordinate input; Codex must activate
and reobserve before retry. Input intents/identities and pre/post screenshots stay
in the attempt. No desktop coordinates/global foreground input are used.

Known isolated client geometry: 1280x720, windowed, scale 1, initial top scroll.
Nantes semantic slot 2/position 1 and vanilla view/list/grid offsets derive client
point `(166,312)`. Verified captured decorated window 1282x752 adds `(1,31)`,
giving screenshot point `(167,343)`. `claimMission('bri_nantes_market', evidence)`
requires native before save, inspected ready/top-scroll state, exact supported
window dimensions and a fresh ownership challenge. Unknown geometry/mission
identity fails. Navigation/save controls also require fresh screenshot inspection.
Other rows, scroll/DPI/layouts are unsupported; no OCR dependency added.

An active Codex driver is required. A bare PowerShell invocation waits boundedly
and fails/cleans if no driver responds. This proves a Codex-operated remote test,
not a fully standalone scheduled UI runner or support for a locked desktop.

## Claim, negative case, validation

Fresh claim nonce `1b769f9bb0df6959`, PID 23224: **PASS/0**, native setup assertions,
exact derived mission input once, normal production reward dialog, independent
before/after save contract, `missionCompletionPass=true`, owned cleanup clean.
[Result](evidence/faithful/result.json), [input record](evidence/faithful/ui-actions.jsonl)
and adjacent native save block excerpts retain the evidence. See the
ready view (local-only image; excluded from publication) and
real completion/reward dialog (local-only image; excluded from publication).
Nantes was ready/incomplete and Textiles parent-locked before input. Real button
action displayed the normal completion dialog with both permanent +15.0% rewards;
Nantes acquired its completion checkmark and Textiles became ready immediately.
Native after-save contains Nantes exactly once, Textiles incomplete, and one named
`bri_demand_for_breton_cloth` with expiry `-1.1.1` in each of 169/4384. Both were
absent in before-save, with native numerical baseline 0.000. No day advance,
refresh, copied reward, complete_mission or native mission command was executed
in this successful profile. The command batch contains only setup.

This matches the retained [human-click reference](../runtime-nantes-market/faithful-completion-2026-10-03.md)
for readiness/completion, both identities/permanence/+15% and downstream behavior
on identical production bytes. That reference additionally verified numerical
0.150 deltas and real reload. This POC did **not** repeat reload or run a post-click
console numerical observer (keyboard delivery is unavailable); its after-save
`eu4claim_goods` remains the earlier 0.000 baseline variable and is not a fresh
post-click measurement. Reward value is evidenced by the real completion dialog
and unchanged production modifier, identity/permanence by independent native saves.

Real saves are kept under ignored run work;
portable evidence retains hashes, exact relevant block bytes, markers, input
records, screenshots and CWTools results instead of entire 34 MB saves.

Fresh negative nonce `da1fcc49d001d89a`, PID 57056: **PASS/0** for refusal,
`missionCompletionPass=false`. Native assertions and both saves show no Nantes
trade building, both missions incomplete and no cloth rewards. The conditions
tooltip displayed the unsatisfied trade-building requirement. Gold artwork alone
is not a readiness oracle (unready tooltip (local-only image; excluded from publication)).
`claimMission()` recorded explicit refusal and sent
no mission-entry input. [Result](evidence/negative/result.json) and
[input record](evidence/negative/ui-actions.jsonl) retain that distinction.

Separate clean `all` nonce `e890bd4b714c6b1c`, PID 34620: **PASS/0**, four contracts,
one attempt, 96.42 seconds total / 46.68 seconds native including cleanup.
[Clean result](evidence/clean/result.json). Production/staged CWTools completed
with zero errors and 58/62 warnings. The [post-run inventory](evidence/post-run-inventory.json)
found no EU4/reporter/WER or runner processes, no lifecycle lock and no active
collector. [Before](evidence/protected-before.json) / [after](evidence/protected-after.json)
SHA-256 inventories match all 11 production files plus ordinary settings,
`dlc_load.json` and `shortcuts.txt` (14/14 unchanged). No deployment occurred.

## Changes and automated checks

- `tools/run-eu4-test.ps1` and `tools/runtime-tests/run.mjs`: new `nantes-claim`
  case/modes, isolated profile settings, UI handoff within existing owned lifecycle,
  current identity challenges and independent saved-state/input PASS gates.
- `mission-claim.mjs`: native setup/diagnostic probes and semantic GUI-derived
  point. `claim-save.mjs`: read-only native save contract and exact block excerpts.
- `codex-input.mjs`: supported window-scoped Codex actions, fresh ownership guard,
  screenshots/intents, named claim/refusal and immediate abort handoff on rejected
  actions. `processes.ps1`: read-only EU4 HWND in snapshots.
- `retain-claim.mjs`: portable evidence selection. `evaluate.mjs`: strict current
  nonce claim-probe protocol; false console queries retained as observations.
- `mission-claim.test.mjs` (five tests) and `claim-evidence.test.mjs` (three):
  reject fabricated rewards/completion, duplicate/finite modifiers, stale or changed
  identities, denied current challenges, incomplete protocol and false equivalence;
  replay real native command, faithful claim and negative evidence.

Baseline 38 tests passed with normal Windows inspection access; final
`node --test tools/runtime-tests/*.test.mjs`: **46/46 PASS**, including existing
owned lifecycle/recovery regressions. Initial sandbox-denied CIM failures were
not passes; normal-access rerun passed. Production/staged validation ran before
each native launch. Syntax and repository whitespace/link checks supplement these.
The final action-error abort wrapper, malformed-timestamp/missing-campaign guards
and report metadata labeling were added after the successful UI proof. These
guards are covered by final automated tests and real-evidence replays, not claimed
as another successful native claim run.
[Final check summary](evidence/final-check-summary.json) and
[final source manifest](evidence/final-source-manifest.json) record handoff checks
and the distinction between final source bytes and the earlier loaded UI proof.

Preliminary ready inspection and a superseded no-input claim attempt remain in
[pilots](evidence/pilots/). The latter handed an explicit abort to cleanup after a
new challenge guard required a fresh runner. Neither is counted as faithful
success. The older native `mission` raw incomplete verdict remains untouched.

## Recommendation

Keep `claimMission(missionId, inspectedState)` as the narrow entry point in this
harness. Retain native setup, independent before/after save assertions and fresh
owned identity checks for every input. For a future mission, derive its point
from production slot/position plus verified installed GUI geometry; require its
own readiness inspection and reward/downstream contract. The current native
commands are useful state-only diagnostics, not faithful claims.

The next decision is whether to extend this Codex-operated adapter or implement
a standalone screenshot-backed driver within the same lifecycle. That requires
separate authorization and evidence for keyboard delivery, scroll/DPI/layout
handling and remote/locked-desktop failures. General-purpose UI automation is
outside this completed Nantes POC.

## Playtest list

Affected files: `tools/run-eu4-test.ps1`, `tools/runtime-tests/{run,mission-claim,
claim-save,codex-input,evaluate,retain-claim}.mjs`, `processes.ps1`; production Nantes mission
and modifier files are read-only sources.

1. **Ready faithful claim (verified):** fresh BRI 1444.11.11, ownership 172/169/4384, default
   DLC, only staged mod, marketplace/workshops, native zero reward/membership
   checks. Inspect ready Nantes and parent-locked Textiles, save/copy before.
   Activate real derived Nantes entry; inspect completed/ready downstream, save
   after. Expect Nantes once, Textiles incomplete, both named rewards once with
   expiry -1.1.1. Failure: missing/repeated reward, changed date/owner/flags,
   wrong button, ambiguous screenshot, identity refusal or leftover processes.
2. **Negative refusal (verified):** same fresh setup without Nantes trade building. Inspect
   unavailable Nantes, preserve before, call claimMission; expect explicit refusal
   and no claim input. Preserve after: incomplete Nantes/Textiles, no rewards.
3. **Post-run regression (verified):** run clean `-Test all -TimeoutSeconds 150` after UI
   cleanup. Expect four native PASS, no owned EU4/reporter/WER, lifecycle lock
   absent, collector inactive, protected source/ordinary settings/DLC unchanged.
4. **Keyboard/shortcut (open):** fresh ready setup as item 1; inspect installed
   entry template and isolated shortcuts, establish delivered keyboard input and
   focused mission identity before activation. Any later test-only template
   override belongs only in the staged profile. Expect the same real dialog/save
   contract, or refusal when multiple entries share the shortcut. Failure: wrong
   mission action, ambiguous focus, copied reward or completion-only state.
5. **Other layouts (open):** affect `mission-claim.mjs`, `codex-input.mjs` and
   isolated settings. Starting from item 1, vary one resolution/DPI/scroll/tree
   condition per fresh profile; inspect target/geometry before requesting Nantes.
   Current POC should refuse unsupported state; a future supported layout must
   pass the same native reward contract. Failure: input at an assumed point,
   unsupported screenshot accepted, wrong mission or changed reward count.
6. **Unavailable remote desktop (open):** affect owned input/handoff. Start an
   isolated ready attempt; in a separately authorized controlled desktop test,
   make capture/input unavailable or disconnect/lock before an action. Expect
   no uncertain input, bounded INCOMPLETE/cleanup and a separate clean `all`.
   Failure: unrelated-window input, fabricated inspection facts or retained game.
7. **Native exit/crash/hang during UI handoff (open):** affect `run.mjs`,
   `codex-input.mjs` and existing lifecycle. Begin a fresh ready attempt, retain
   original ownership, then use an explicitly authorized attempt-local diagnostic
   at the before-save or pre-claim stage. Expect no false mission PASS, failed
   attempt evidence, owned cleanup and bounded fresh retry/clean follow-up under
   configured policy. Failure: stale input, passed completion after a crash,
   unowned cleanup or remnants. Existing suite lifecycle recovery is proven
   separately, not re-proved at every UI stage here.
