# Console run-file effects and observability

Historical calibration record, before the conditional reward extraction. The
current mod has `common/scripted_effects/BRI_mission_effects.txt` for shipbuilding
and borders; Nantes still remains inline. See [later suite](../runtime-regression-suite/README.md)
and [current status](../../STATUS.md). Statements about then-absent custom
production effects below apply to this recorded build, not the current tree.

**PASS — individual effect/value calibration in EU4 1.37.5.0, 2026-10-03.**
**PARTIAL — actual mission completion remains unproven.** No manual console entry
or gameplay UI automation was needed. This is Test A for independently callable
effect components, not a PASS for Nantes's full inline reward or Test B's mission
dispatch. Production mod files were unchanged.

## Seven findings

1. **Location:** the successful plain effect file lives directly in the isolated
   user-profile root supplied to `-userdir`, alongside `settings.txt` and
   `dlc_load.json`, outside `mod/`. The first probe placed different location
   markers in profile-root and staged-mod-root candidates; EU4 emitted
   `profile-root`. The final calibration has files only in profile-root. This
   establishes a working location and initial precedence, not that all other
   locations are prohibited. Default-profile lookup was not tested or written.
2. **Syntax:** a plain UTF-8 text file containing ordinary effects, without an
   enclosing event/on_action, was invoked as `run eu4rt_effects_<nonce>.txt`.
   The basename includes its `.txt` extension and needs no quotes in this case.
   `eu4rt_run.commands` in profile-root contains one console command per line
   with CRLF. The final two-line batch invokes the effect file and then
   `run eu4rt_after.txt`. Other extensions, absolute paths and paths containing
   spaces are not verified by these runs.
3. **Scope:** an unqualified `tag = BRI` query succeeded in the initialized
   `-start_tag=BRI` session. Country effects under explicit `BRI = { ... }` and
   nested province `169 = { ... }` executed correctly. Other player tags,
   FROM/ROOT behavior in other launch contexts and multiplayer are untested.
4. **Ordinary effects:** prestige was deterministically reset to zero, a unique
   flag set, and seven prestige added. Native exported prestige assertions passed
   [0, 0.001) before and [7, 7.001) after. Applying the existing cloth modifier to
   169 changed its exported goods-produced modifier 0 -> 0.15; removing that
   modifier by ID changed it back to zero. The same value cycle passed for
   `duration = -1` and `duration = 365`. Actual expiry/persistence was not tested.
5. **Named scripted effects:** the file invoked the test-only staged
   `eu4rt_named_probe_<nonce> = yes`. Its unique flag was asserted absent before
   and present after. The static wrapper of the plain file body is never invoked
   in game; only the actual console file executes these assertions.
6. **Production scripted effects:** the actual installed
   `add_stability_or_adm_power = yes` executed, producing stability 0 -> 1. This
   real vanilla definition is also called by production `bri_flourishing_duchy`.
   No reward implementation was copied. Its max-stability ADM branch remains
   untested. This mod currently has no custom production scripted-effect file;
   Nantes's reward is directly inline in its mission definition and cannot be
   called by a reward-effect name. The single-province apply/remove probe tests
   one engine effect and the existing modifier definition, not the full
   two-province mission reward or its dispatch.
7. **Assertions/startup automation:** native `log`, flags, country triggers and
   exported variables work inside the run file. Existing nonce/date/version/log
   evaluation consumes them. A test-only startup hook asserts the independent
   1444 BRI fixture, initial mission/reward/selector state and all 18 DLC, but
   never executes the plain file or its wrapper. `-auto_run=eu4rt_run.commands`
   dispatches the console files after fixture startup, so no manual typing is
   required. A direct script effect that loads a console file from `on_startup`
   has not been verified; native launch-option dispatch is the established path.

## Evidence and contract changes

| Native experiment | Result and evidence |
| --- | --- |
| Simple flag/prestige, nonce `77f4bab0b67467dc` | PASS for dispatch, profile lookup and scope. [Log](evidence/simple/game.log), [plain file](evidence/simple/eu4rt_simple_77f4bab0b67467dc.txt), [raw diagnostic report](evidence/simple/result.json) |
| Single-file reward probe, nonce `4361d6545f295912` | FAIL: named presence false, despite exported value 0.15. Named scripted calls and prestige/stability passed. [Report](evidence/immediate-query/result.json) |
| Separate command query, nonce `73edc51c4d8b76e3` | FAIL: same named-presence discrepancy after the second console dispatch. Proved two-command batch execution. [Report](evidence/separate-query/result.json) |
| Apply/remove and finite control, nonce `c3f5819eb3166689` | PASS for a distinct effect/value calibration contract; both named-presence queries still false. 32 checks + two observations + BEGIN/END, all at 1444.11.11. [Report](evidence/value-calibration/result.json), [native log](evidence/value-calibration/game.log) |
| Real mission command followed by run assertions, nonce `d2e4c2808be44e94` | Candidate action FAIL: mission remained incomplete, reward values zero; overall mission investigation PARTIAL. [Mission followup](../runtime-nantes-market/README.md#followup-working-run-dispatch-mission-still-unproven) |

The original presence requirement failed and remains preserved as FAIL. The final
calibration adds independent application/removal-by-name and exact value checks;
it records the unreliable presence query as an explicit observation. Its PASS
does not resolve or suppress the failed query requirement, establish normal
mission completion, or validate the whole production reward. This distinction
is recorded in `missionCompletionPass = false`,
`productionMissionRewardVerified = false`, and both presence-query fields.

The final [command file](evidence/value-calibration/eu4rt_run.commands) executes
the [effect file](evidence/value-calibration/eu4rt_effects_c3f5819eb3166689.txt)
and [observation/removal file](evidence/value-calibration/eu4rt_after.txt).
The [startup hook](evidence/value-calibration/hook.txt) and
[scripted definitions/static wrapper](evidence/value-calibration/scripted-effects.txt)
show the separation. Source templates are under `tools/runtime-tests/`, not mods.

CWTools completed with exit 0: production 10 files, 0 errors/58 warnings;
final staged 12 files, 0 errors/68 warnings. Added warnings concern the existing
modifier's missing English description in test-only queries. Earlier simple
staging had 0 errors/58 warnings, the two presence probes 0 errors/64 warnings.
The first simple static draft failed on fractional `prestige` trigger arguments;
it was corrected to exported-variable comparisons before native launch.
[Failed static draft report](evidence/static-draft/cwtools-staged.json).
No relevant runtime parse errors or changed fixture hashes were found in final
calibration. Its owned EU4 process closed normally. General collector log errors
remain unbaselined and are not labeled production regressions.

Required post-change `preview-gate` regression **PASS**: nonce
`b2b815f932264c06`, all 24 checks/26 markers, the same 18 DLC and game version/date,
normal owned-window close. Production and staged CWTools both zero errors/58
warnings. [Report](evidence/preview-regression/result.json),
[native log](evidence/preview-regression/game.log). All ten evaluator evidence
replay tests passed; failed-query evidence and damaged/stale transcripts are
rejected. No owned EU4 process remained after cleanup.

New run-file templates and the `run-effects` selection share the existing
launch/staging/collector. Reports expose effect-contract scope and explicit false
mission-completion/reward-dispatch fields. No generalized scenario system, UI
automation or production reward extraction was added.

## Reproduce

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./tools/run-eu4-test.ps1 -Test run-effects -TimeoutSeconds 150
```

Requires the documented default launcher/DLC configuration, available Steam and
desktop graphics, and no already-running EU4. The runner writes an isolated
profile and staged mod under ignored `tools/runtime-tests/work/`, validates them,
launches, evaluates and closes only its owned process. Final calibration exits 0
for PASS; any exact state assertion failure exits 1, missing evidence exits 2.
Replays of saved evidence in `evaluate.test.mjs` are not additional native runs.

## Open playtest list

- **Named province-modifier query:** production modifier source
  `mod/brittany_missions/common/event_modifiers/BRI_mission_modifiers.txt`;
  test source `tools/runtime-tests/run-effects.after.txt`. In the same isolated
  BRI session, add `bri_demand_for_breton_cloth` to 169 and confirm exported value
  0.15. Query `has_province_modifier` immediately, through a separate command,
  after a real game-day advance and after save/reload; inspect the province UI
  and native save for the modifier ID/expiry. Expected named query becomes true
  for an attached modifier; failure sign is false with independently positive
  value/state. Both permanent and finite immediate queries, and the separate
  dispatch, returned false here. Cause remains unresolved; do not assume it is
  just duration or a one-file timing effect.
- **Real production mission dispatch:** follow the full
  [Nantes playtest contract](../runtime-nantes-market/README.md#open-playtest-list).
  The working run-file mechanism supplies observation scripts but does not
  substitute reward effects for completion. Capture the native console response
  to `mission bri_nantes_market` in a fully initialized session, or use ordinary
  mission completion after observing readiness. Expected recorded completion
  and both real reward values 0.15; failure signs are no state change or state-only
  completion. Native response/restriction/timing remains unknown.
- **Scripted-effect branch/persistence:** for the installed
  `add_stability_or_adm_power` definition, set stability 3 and a known ADM value,
  invoke the actual effect and assert +50 ADM without stability change. Then
  verify modifier expiry/save persistence separately. Only the stability-0
  branch and immediate value effects are currently demonstrated.
