# Brittany runtime coverage

Owner: mod/brittany_missions
Documentation ownership updated: 2026-10-06

Result reuse now requires [explicit schema/legacy applicability](../../../runtime/evidence-identity.md).
Source ownership, fixture scope, contract layers, build/freshness and native versus
replay/operator authority are separate. This interpretation change adds no gameplay scope.

Results below remain dated 2026-10-03. [Status](../STATUS.md) links the later
publication validation; this move adds no new native evidence.

Verified on 2026-10-03 with EU4 1.37.5.0 Inca (491d), the documented 18 DLC and
only the isolated Brittany test mod. [Suite report and evidence](../../../testing/runtime-regression-suite/README.md).

| Production feature | Test | Coverage demonstrated | Boundary |
| --- | --- | --- | --- |
| Diplomatic preview gate | `preview-gate` | STATIC, LOGIC, WIRING: actual trigger truth table for absent preview, French preview, autonomous preview and locked flags; six missions reference it | Flags are fixtures. Selector options, tree refresh and mission-button availability remain MANUAL ONLY |
| Brest shipbuilding reward | `shipbuilding-reward` | STATIC, EFFECT, WIRING: actual production effect grants missing shipyard, preserves grand shipyard, changes exported ship cost/repair and removes its modifier by ID | Readiness, reward dispatch, annual naval tradition, tooltip and persistence remain MANUAL ONLY |
| Secure the Borders reward | `borders-reward` | STATIC, EFFECT, WIRING: actual production effect adds +1 diplomatic reputation, reverses on removal, gives +50 DIP without France alliance and +0 DIP with it | Readiness, dispatch, annual legitimacy, 7300-day expiry, tooltip and persistence remain MANUAL ONLY |
| Breton textiles reward helper | `textiles-upgrade` | STATIC, EFFECT, WIRING: real installed helper grants workshop, upgrades counting house, then adds +2 base production; mission references it in 169/4384 and retains Nantes parent | The no-building branch is a helper contract, not a mission-ready state. Nantes parent readiness now verified manually below; textiles reward dispatch remains unverified |
| Nantes ordinary mission | User mission button + native checkpoints/observers | MANUAL END-TO-END: unavailable -> ready, ordinary dispatch, both named permanent +0.15 cloth contributions, immediate Cloth for Sail readiness, no second ordinary action and save/reload retained state. [Dated report](../../../testing/runtime-nantes-market/faithful-completion-2026-10-03.md) | One paused BRI scenario on unchanged recorded build. Console completion/presence query failures retained; Textiles reward dispatch unestablished |
| Nantes automated real claim | `nantes-claim -ClaimMode click`, outside `all` | CODEX-DRIVEN END-TO-END: ready UI -> actual production mission action -> normal +15% reward dialog; independent saved Nantes once, both named permanent modifiers once; immediate Textiles readiness. Fresh unready refusal and separate clean suite PASS. [Report](../../../testing/runtime-mission-claim/README.md) | Active Codex adapter required, 1280x720/scale-1/top-scroll/current tree only. No new post-click numeric probe/reload; those remain manual reference dimensions |
| Nantes completion candidate | `nantes-market` diagnostic, outside `all` | State-only `complete_mission` observation, PARTIAL; completion recorded without reward | No END-TO-END coverage; does not prove a production reward bug |
| Run-file observability | `run-effects` diagnostic, outside `all` | Native flags, prestige, scripted calls, stability and province apply/remove numerical calibration | Named modifier presence queries returned false despite positive values; query reliability remains unresolved |

**Nantes has one bounded Codex-driven END-TO-END mission scenario.**
LOGIC + EFFECT + WIRING does not establish normal mission-button reward dispatch.
The separate Nantes manual result supplies actual ordinary UI/save evidence for
its additional listed dimensions; the required `all` remains effect/logic/wiring.
Other Brittany
rewards, selectors/events, readiness predicates, highlights, tree swaps, refresh
and persistence remain outside this coverage beyond general CWTools.

Normal development loop: update the relevant fixture and expected state when
changing one of these covered behaviors; run its named test plus CWTools. Use
`-Test all` after shared trigger/effect/runner changes or before a broader handoff.
Review failures as fixture, infrastructure or production failures using the raw
assertions; never weaken expectations solely to obtain PASS. Add coverage for a
new behavior when it has a reliable observable contract, rather than extracting
trivial inline rewards simply to increase test count.

Concrete outstanding playtests and source files are listed in the
[suite playtest list](../../../testing/runtime-regression-suite/README.md#playtest-list).
