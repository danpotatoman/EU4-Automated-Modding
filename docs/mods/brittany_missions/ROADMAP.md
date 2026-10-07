# Brittany Missions roadmap

Owner: mod/brittany_missions
Last updated: 2026-10-07

Known gaps are not implementation authorization. Use [status](STATUS.md),
[design](DESIGN.md) and owner-labelled [task plans](../../../.agent/PLANS.md).

| Work | Required evidence / starting scenario |
| --- | --- |
| Preview gate in normal gameplay | [Selector scenario](testing/diplomatic-selector.md): satisfy every other requirement during preview, observe blocked button, lock branch, claim and verify exact reward/refresh. Existing truth table does not close this. |
| Shipbuilding/borders/textiles dispatch | [Suite playtests](../../testing/runtime-regression-suite/README.md#playtest-list): real readiness/button/reward/tooltip, save/reload, annual values and Borders 7300-day expiry. |
| Localisation | Review 58 warnings and six duplicate keys against rules/vanilla/UI; do not suppress uncertain findings. |
| Static warning follow-up | October 7 combined check PASS/0 with retained CWTools/inspector warnings; earlier failures stay historical. Review warnings within separately authorized source scope. |
| Deployment/export | [Final-LF reconciliation complete](../../runtime/brittany-deployment-repair-2026-10-07.md); no automatic recovery of other modifications. Recurrent newline loss still needs investigation. Release descriptors, launcher activation and exported behavior require separate verification. |
| Uncovered systems | Quantified scenarios for metropole thresholds/exemption, constitutional reform, fortress/iron events, colonial/overseas chains, AI and random-map intent when touched. |
| Design choices | Balance/pacing, minimal DLC, AI and multiplayer remain open questions, not adopted requirements. |

Nantes ordinary readiness, real dispatch, numeric rewards, downstream readiness,
once-only action and reload have a retained [manual reference](../../testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
and a separate bounded [automated claim/refusal](../../testing/runtime-mission-claim/README.md).
Do not reopen those as absent evidence or extend their scope to other missions.
Console query discrepancies belong to [shared runtime research](../../ROADMAP.md),
with Brittany reproduction cases retained in the historical calibration playtests.
