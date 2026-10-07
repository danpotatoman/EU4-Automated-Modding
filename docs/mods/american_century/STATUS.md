# American Century state

Owner: mod/american_century
Last updated: 2026-10-06 (documentation only; no new game validation)

The first slice is implemented; positive and negative contracts are retained PASS
from 2026-10-04. The full adopted design and natural colonial campaign remain open.
[Project inventory](PROJECT.md), [coverage](testing/coverage.md),
[roadmap](ROADMAP.md) and [active plan](../../../.agent/plans/2026-10-04-american-century.md)
distinguish implemented work, evidence and next authorized gameplay work.

## Implemented versus designed

Nine USA and three origin missions, two preparation decisions, a constitution
choice and supporting localisation/modifiers are production. The 55 USA missions
in [design](DESIGN.md) are the adopted target, not a shipped tree. Natural ENG ->
British eastern CN -> independent colony -> USA assignment has not been proved.

## Retained native evidence

| Result | Evidence and scope | Boundary |
| --- | --- | --- |
| Positive slice, `20261004T105823451Z_470def8e14de1db9` | Real unchanged vanilla formation; Liberty -> Compact and Harbors -> Doors actual claims; enumerated federal choice; 31 save/input checks | Deterministic overseas-English fixture, four missions only; no natural independence campaign or alternate choice |
| Ordinary reload | 12 persistence comparisons of completions, flags/reforms, rewards/expiry, capital state and numerical observations | One paused UI reload; time-based expiry/repeat-click/arbitrary save-launch untested |
| Negative, `20261004T110948651Z_65dcd99511bff1c2` | Fresh missing-marketplace refusal, no entry input, eight before/after save checks | False/true readiness in separate fresh fixtures; same-campaign building transition open |
| Source/staged static validation | 8/12 loaded gameplay/test files respectively, CWTools zero errors/warnings; no structural layout error | Source descriptor was rewritten for runtime activation, not release-certified; inspector cannot evaluate colonial scripted potential |

The [dated report and original verdicts](../../testing/american-century/README.md)
link numerical rewards, input, saves and source/staged hashes. Its eight earlier
INCOMPLETE attempts remain INCOMPLETE; only the separate clean runs earned PASS.
The 2026-10-05 publication check again records source CWTools zero errors/warnings;
there is no USA combined-check report at the ownership review.

## Environment and dependencies

Native saves record EU4 1.37.5.0 Inca (491d), only the isolated runtime mod and
**21 enabled DLC**: all 18 in the [shared preference](../../testing/environment.md)
plus Art of War, Common Sense and Rights of Man. American Dream is absent.
Exactly-18-only support, other versions/DLC, AI/multiplayer and unusual layouts
are not established. Real input requires the recorded active Codex adapter.

## Dependency protection is not USA coverage

The USA task retained four Brittany native regressions and protected Brittany/
ordinary-profile/installed-reference hashes. Those results establish regression
and write protection in their own scopes, not additional USA gameplay coverage.
The dated '51 shared Node tests' includes both mods' adapters and offline replays;
it is not 51 new native USA checks. Shared-tool state is owned by
[framework status](../../STATUS.md). No source release/deployment readiness,
complete campaign balance or remaining branch verification is implied.

## Phase 2A runtime ownership validation (2026-10-06)

Unchanged source/staged CWTools completed with zero errors/warnings; explicit USA
click passed real vanilla formation, four actual mission-entry actions, the
Enumerated Powers choice and 31 native save checks. Fresh unready refusal passed
eight native save checks with no entry input/completion/rewards. This refactor does not advance the separately authorized
gameplay plan or expand natural campaign/alternate-choice/expiry/reload coverage.
[Framework handoff](../../runtime/phase2a-ownership-2026-10-06.md) owns fresh run
references and integrity; prefer explicit native -Mod in the
[testing runbook](testing/README.md).
