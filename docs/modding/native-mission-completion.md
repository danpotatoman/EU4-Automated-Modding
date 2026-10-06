# Native mission completion investigation

Started 2026-10-03 against installed EU4 1.37.5.0. Consult
`runtime-script-assertions.md` for the verified isolated startup/flag/log pattern.
No production mission logic should be copied into a test hook.

Current follow-up: [faithful mission input](faithful-mission-input.md) and
[fresh native diagnostics / real claim](../testing/runtime-mission-claim/README.md).
Native `mission`, scripted completion and `mission_tree` independently save
completed Nantes without its rewards; console completion queries can remain
false. This supersedes the historical query-only inference below without changing
raw verdicts. One bounded Codex-driven ordinary claim is now verified with native
save reward/completion evidence; no faithful non-UI native route was found.

## Candidates and installed evidence

- Country effect `complete_mission = <mission_id>`: installed
  `events/flavorBRAPRU.txt:2182,2191`, within event `flavor_brapru.42`, and
  `missions/AFR_East_Africa_Missions.txt:170`. Dependencies are the referenced
  mission definitions, current country mission tree, and country scope.
  CWTools accepts a mission reference. Native runs below established state-only
  behavior for Nantes in the tested startup contexts.
- Country triggers `has_mission` and `mission_completed`: vanilla scripted
  effects/triggers and events query actual mission membership and completion.
- Installed executable strings include command description `Toggles mission
  completion`, `Mission identifier`, `run_commands`, startup option `auto_run`,
  and `Run console commands from startup option auto_run:`. These are candidates,
  not proof of reward execution or command-file path rules. A relative `auto_run`
  batch did execute `helplog` and identify `mission [Mission identifier]` with
  description `Toggles mission completion`; later batch commands were not verified.
- `completed_by` is a historical date in vanilla mission definitions, for example
  `missions/01_Russian_missions.txt:18`; it is not a mission dependency ID.
  Brittany's downstream dependency is `required_missions`.
- No dynamic mission-readiness trigger was found in installed vanilla examples,
  local CWTools trigger rules or the relevant executable strings. This is a search
  result, not proof that no such mechanism exists.
- Attempts to fetch the official-hosted EU4 wiki Effects, Triggers and Console
  commands pages returned 401. Installed files and actual runs are the evidence.

## Small experiment, required files and scope

Select production `bri_nantes_market` in
`mod/brittany_missions/missions/Custom_Breton_Missions.txt`. It needs BRI ownership
of province 172 and a trade building. Its production effect grants permanent
`bri_demand_for_breton_cloth` to provinces 169 and 4384. The modifier definition
in `common/event_modifiers/BRI_mission_modifiers.txt` specifies
`trade_goods_size_modifier = 0.15`. The downstream `bri_breton_textiles` requires
the market mission, ownership and production buildings in 169 and 4384.
These missions have no DLC predicate; keep and assert the default 18 DLC.
Existing production localisation is retained; test logs need no new localisation.

Minimal **state-only operation, not reward-bearing completion**:

```text
BRI = {
    complete_mission = bri_nantes_market
    if = {
        limit = { mission_completed = bri_nantes_market }
        log = "mission recorded complete"
    }
}
```

The investigation probed fresh independent BRI at 1444.11.11, selector flags absent. Assert mission
and downstream membership, both incomplete, and rewards absent. Remove any trade
building in 172 as fixture setup. Invoke `complete_mission` before the missing
requirement is supplied: observe whether it rejects the request, marks completion,
or executes rewards. Then investigate native `mission <id>` via `auto_run` and
scripted `run` files, before and after adding a marketplace in 172. Never label
building inspection a native mission-readiness query, and never manually invoke
the reward to manufacture a successful mission result.

All diagnostic hooks, command files and profiles must be staged under shared
tools. Validate the full staged project with existing CWTools. Use actual native
state queries/logs and, if generated natively, save data for reward duration/value
and completed mission observations. Probe replays/duplicates must not be mistaken
for the normal once-only completion path.

## Validation, pitfalls and open items

Run production and staged CWTools; preserve raw logs and source/staged hashes.
Require the current nonce and exact date/version. Record script errors and missing
native command output as incomplete, not a production failure. Time-limit every
owned process. Do not use `complete_mission` as normal completion merely because
`mission_completed` becomes true: independently observe production rewards.
If both mechanisms only manipulate completion state, report PARTIAL and record
the native boundary before considering UI automation. Save/reload is secondary.

## Verification status and automation boundary

**Verified in game 2026-10-03, EU4 1.37.5.0:** the startup country effect
`complete_mission = bri_nantes_market` recorded actual completion. An initial
diagnostic did this with Nantes's trade-building requirement missing. A fresh
diagnostic added the marketplace first and observed the same state-only result:
both named reward-modifier queries false, exported `trade_goods_size_modifier` zero in 169
and 4384, and Textiles still present and incomplete with its parent now completed.
The parent query does not prove that the mission button refreshes or that Textiles
is completable. No normal mission readiness oracle was verified. Repeating the
action and UI repeat prevention were not tested.

**Static acceptance:** production CWTools completed with zero errors/58 warnings;
the final diagnostic with zero errors/64 warnings. The six added warnings concern
the modifier's missing English description key in test-only presence queries.
The real preview-gate regression passed, with zero errors/58 warnings in both
production and staged validation. Static acceptance does not establish rewards.

**Not established:** a native mechanism that invokes a production mission's
actual `effect` with ordinary player-completion semantics. Absolute `auto_run`
paths produced no command assertions. Relative paths reached `helplog`, but
`mission`, `run` and `savegame` produced no subsequent assertion transcript or
save artifact. LF/CRLF and extra launch-option probes did not resolve this. This
does not establish that `mission` is state-only or that native automation is
impossible; command parsing, file lookup, execution context and timing remain
unresolved. No gameplay UI automation was attempted.

The followup [console run-file investigation](console-run-effects.md) established
profile-root `.txt` file dispatch, implicit BRI scope, ordinary effects and named
scripted-effect calls, including two `run` commands in a native startup batch.
It also exposed a negative named-modifier query despite a positive 0.15 exported
value after individual effect application. Do not rely on a negative immediate
`has_province_modifier` alone; zero values in the completion probes independently
corroborate the lack of rewards.

A fresh batch containing native `mission bri_nantes_market`, `savegame` and a
working `.txt` observation file left the mission incomplete and both values zero;
the following run file executed, but no save appeared. Console response and the
reason the mission command did not change state remain unverified. This updates
the earlier command-batch boundary without claiming native impossibility.

The experiment is **PARTIAL**. Reward execution was never emulated. Persistence
was deferred because faithful completion did not succeed. The reusable verified
pattern is isolated fixture setup plus native membership/completion/modifier
observations; `complete_mission` is useful only when explicitly testing recorded
state or a parent dependency, not as a substitute for normal mission completion.
Full contract, raw evidence, exact experiments and concrete open playtests:
[Nantes runtime report](../testing/runtime-nantes-market/README.md).

Later ordinary-button evidence (2026-10-03) is separate from the historical PARTIAL
diagnostic: operator completed Nantes and observed both permanent +15% rewards
and immediate Textiles readiness. Native save records `completed_missions` and
both named modifiers with `date=-1.1.1`; console observation exports/deltas 0.150.
However, that same post-click console file's `mission_completed` check returned
false despite the UI/save. Preserve this FAIL and do not infer absent completion
from that query in this context; cause remains unestablished. The same discrepancy
persists after actual reload, while UI/native saves retain completion, both named
permanent rewards/contributions and Textiles readiness. No second ordinary action
is available. See [final manual report](../testing/runtime-nantes-market/faithful-completion-2026-10-03.md).
Neither `complete_mission` nor native `mission` is promoted to a faithful action.
