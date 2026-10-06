# Follow-up work

## American Century

Follow the [authorized USA design and phases](usa/DESIGN.md) and
[active execution plan](../.agent/plans/2026-10-04-american-century.md).
After the first slice, prove natural English CN creation/release/independence and
origin-grid assignment; then expand continental/diplomatic integration, industry
and institutions, naval/hemispheric influence, military/global capstones. Each
branch needs real readiness/claim/reward evidence before integrated campaign QA.

This records known gaps and suggestions, not implementation claims or authorization
to begin them. Current evidence belongs in [STATUS.md](STATUS.md); substantial
work follows [.agent/PLANS.md](../.agent/PLANS.md).

## Concrete known work

| Work | Outcome needed | Evidence / reproduction |
| --- | --- | --- |
| Faithful Nantes completion and readiness | **Verified 2026-10-03:** manual reference plus bounded Codex-driven real claim, permanent rewards, downstream readiness and unready refusal | [Manual report](testing/runtime-nantes-market/faithful-completion-2026-10-03.md), [automation report](testing/runtime-mission-claim/README.md); standalone driver/general layout support remains open |
| Controlled diplomatic preview gate | Satisfy all other requirements in preview; prove button blocked, lock and prove availability, then record exact reward/next prerequisite | [Selector scenario](testing/brittany-diplomatic-selector.md), follow-up after checks 1–9; predicate PASS does not close this gap |
| Exact mission rewards, persistence and expiry | Record real dispatch for shipbuilding/borders/textiles, annual effects/tooltips, save/reload and Borders's 7300-day expiry | [Suite playtests 1–4](testing/runtime-regression-suite/README.md#playtest-list); selector refresh/persistence already has older user-reported passes |
| Named province-modifier query discrepancy | Compare ID query, positive values, UI/native save, real day advance and reload; establish cause or a documented reliable alternative | [Calibration playtests](testing/runtime-run-effects/README.md#open-playtest-list); permanent/finite and second-dispatch queries already returned false |
| Localisation findings | Review 58 CWTools warnings and six duplicate English keys; resolve actual omissions/conflicts after inspecting vanilla naming and UI | Sources/findings in [STATUS.md](STATUS.md); do not suppress questionable diagnostics without evidence |
| Fresh combined project baseline | Rerun `./tools/check-project.ps1`, assess current findings and deployment state | Older ignored combined report is failed and predates defined preview trigger; later CWTools is clean of errors |
| Deployment evidence reconciliation | Establish how to handle the launcher descriptor's removed final newline while preserving strict ownership/external-change protection | [Selector results](testing/brittany-diplomatic-selector.md#results); reproduce and inspect current deployment before choosing a fix |
| Comparable vanilla log baseline | Record matching version/DLC/scenario without the mod; triage unmatched messages | [Collector workflow](../tools/test-runs/README.md); old unbaselined messages are not proven regressions |
| Export prerequisites | Prepare/verify required release descriptors and scoped in-game checks before any release-readiness claim | Source descriptor absent; development generation is not a release package or whole-mod test |

Other implemented systems with no recovered quantified playtest should receive
mechanic-specific scenarios when touched: metropole activation/threshold/exemption,
constitutional reform, fortress choice, iron-price event, colonial/overseas chains
and AI selection. Prepare their vanilla/dependency guide and observable contracts
before implementation; absence of coverage is not a finding that they are broken.

## Completed Nantes investigation

The recommended investigation was explicitly authorized and completed in
[2026-10-03-nantes-faithful-completion.md](../.agent/plans/2026-10-03-nantes-faithful-completion.md).
The [manual result](testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
closes this scoped gameplay gap on the recorded unchanged build. Its query
discrepancies remain testing-mechanism findings. No other roadmap work is started
or authorized by completing that plan.

Use the existing Nantes scenario with fresh independent BRI on 1444.11.11,
ownership of 172/169/4384, both missions incomplete, selector flags absent,
default DLC and only the tested mod. Preserve before/after saves and a build/hash
record. Remove trade buildings, observe actual unavailability, add marketplace,
observe readiness, and complete through the ordinary button. This route verified
completion plus 0.15 cloth contributions in
169/4384, clearing the Textiles parent, once-only completion and reload persistence.
Retained reproduction steps and failure signs remain in the linked Nantes playtests.

Prefer the existing user-performed manual workflow for a faithful reference result.
If investigating native `mission`, capture its console response and context before
generalizing; do not copy/invoke reward bodies as a substitute for dispatch or
use `complete_mission` as the success action. Keep mechanism failure separate
from production behavior and leave unknown command semantics explicit.

## Ideas and open choices, not commitments

- Generalize the verified Nantes `claimMission()` adapter only as authorized:
  standalone input access versus active Codex, keyboard delivery, scroll/DPI/layout
  support and UI-stage crash/locked-desktop refusal need new evidence. Current
  production/native/save/PID guards should remain inside the existing harness.

- Steam preflight with earlier useful startup diagnostics was suggested in the
  first preview report; need/implementation is not established by that suggestion.
- Further native contracts where there is a reliable observable behavior; avoid
  extracting trivial rewards solely to increase test counts.
- Decide overall balance/pacing, supported DLC minimum, AI and multiplayer scope
  only as authorized design questions; see [DESIGN.md](DESIGN.md).
- Saved-game startup-hook semantics and direct save-loading automation remain
  research candidates, not supported runner features.
- Random-map support is unspecified: six series exclude random setup, whereas
  slot 4 only checks BRI. Review intent if that mode becomes relevant; no source
  change or support commitment is implied here.
