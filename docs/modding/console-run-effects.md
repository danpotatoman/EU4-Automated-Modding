# Console run-file effects investigation

Started 2026-10-03 against installed EU4 1.37.5.0. Native command help describes
`run` as running effects in a specified file, and `run_commands` as running a file
of console commands. Exact file lookup, syntax and execution scope remain to be
proved. This guide will record actual probes rather than assume wiki behavior.

Required experimental files live under shared tools: isolated production copy,
profile, plain effect file, one-line console command file, startup readiness hook
and native logs. Game files and the normal profile remain unchanged. Country
effects can be explicitly scoped with `BRI = { ... }`; whether unqualified effects
inherit the player's country is an experimental question. Plain logs need no
localisation. Keep the default 18 DLC and verify actual configuration.

First probe: log BEGIN, query implicit BRI scope, explicitly scope to BRI, reset
prestige to zero using clamped adjustments, assert zero, set a unique test flag,
add seven prestige, assert the flag and exact prestige interval, log END. Use
distinct location markers in profile-root and staged-mod-root candidates. A
startup hook must only announce fixture readiness, never execute this file's
effects as a substitute for proving `run`.

Only after that works, test scripted-effect calls and individual reward effects.
Nantes's reward is inline in its mission definition, so there is no production
reward scripted effect to call. Do not copy its block and report mission success.
An independent `add_province_modifier`/value observation can calibrate effect
observability; the vanilla `add_stability_or_adm_power` is also called by the
production flourishing-duchy mission and can test a real scripted-effect call.
Installed source: `common/scripted_effects/01_scripted_effects_for_simple_bonuses_penalties.txt:5`;
country scope, +1 stability below 3, otherwise +50 ADM.

Validation: run CWTools against staged effect definitions plus a non-invoked
scripted wrapper of the plain file body. This establishes static acceptance only.
Require nonce, running version/date, native before/after state queries, actual
run-file markers and unchanged fixtures. Native dispatch may be probed through
`auto_run`; manual console entry is explicitly allowed if that remains blocked.
Record manual steps and never equate reward-effect PASS with mission-completion
PASS. Save/reload remains secondary.

## Verified dispatch and scope

The simple probe succeeded in a native run on 2026-10-03, nonce
`77f4bab0b67467dc`. A plain UTF-8 effect file named
`eu4rt_simple_77f4bab0b67467dc.txt` lived directly in the isolated user-profile
root supplied by `-userdir`, outside its `mod/` subdirectory. A one-line
`eu4rt_run.commands` file in that same root contained:

```text
run eu4rt_simple_77f4bab0b67467dc.txt
```

Launch options were `-debug -userdir=<isolated-profile>/ -start_tag=BRI
-auto_run=eu4rt_run.commands`. The plain basename including `.txt` was accepted.
Profile-root and staged-mod-root candidates contained distinct markers; the
native log reported **profile-root**. This proves successful profile-root lookup
and precedence in that configuration, not that it is the only supported path.
Other extensions, absolute paths and alternate lookup locations are unverified.

Unqualified `tag = BRI` was true in the run file. Explicit `BRI = { ... }`
effects reset prestige to zero, set a unique flag and added seven prestige; native
variable assertions observed [0, 0.001) before and [7, 7.001) after. The game stayed
at 1444.11.11. CWTools accepted the matching non-invoked static wrapper with zero
errors/58 warnings. No manual console entry or gameplay UI automation was needed.
The first static draft used fractional `prestige` triggers that CWTools rejected;
the corrected probe exports prestige to a variable for precise comparison.

Initial production-like followup: native named-effect flag calls and the real
installed `add_stability_or_adm_power` call succeeded (stability 0 -> 1). One
province effect changed exported goods-produced modifier 0 -> 0.15, but the
immediate `has_province_modifier` query returned false after application. The
whole followup was correctly recorded FAIL. Do not assume an immediate negative
named-modifier query alone proves absence until that discrepancy is resolved.
A separate dispatch repeated the false named-presence result. Final calibration
then verified removal by the same modifier ID resets the exported value to zero,
and repeated the apply/remove cycle with a finite duration. Both duration forms
still returned false from the named query. The distinct calibration contract
passed (32 checks/two observations); the old presence requirements remain FAIL
in preserved evidence. This verifies values and application/removal by ID, not
the named-query reliability, expiry, whole mission reward or completion.

A two-command `run` batch succeeded. Fully automated dispatch uses the native
launch option; a script effect that loads the plain file from `on_startup` itself
has not been established. Final staged CWTools: zero errors/68 warnings;
production: zero errors/58 warnings. The post-change preview-gate native regression
passed with zero errors/58 warnings in each validation. Evidence and interpretation:
[run-file report](../testing/runtime-run-effects/README.md).

The [behavioral suite](../testing/runtime-regression-suite/README.md) subsequently
proved additional production calls, province ship cost/repair exports and country
reputation/DIP deltas. Three profile-root `.txt` files execute sequentially in one
native command batch. Variable subtraction uses two `which` fields, as in installed
vanilla `events/ConsortEvents.txt:1783`; numerical intervals of width 0.001 passed
where 0.0002-wide intervals failed. A dynamic variable `GetValue` log experiment
crashed before assertions with stack overflow and required the user's manual
crash-reporter dismissal. It is suspected, not proven, to have caused the crash;
constant diagnostic markers subsequently ran normally. Keep dynamic log expansion
outside the supported harness. Mission-button dispatch remains unverified.
