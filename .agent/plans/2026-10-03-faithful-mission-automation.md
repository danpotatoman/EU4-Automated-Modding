# Faithful mission claiming investigation

Status: complete
Last updated: 2026-10-03

## Goal and authorization

User explicitly authorized investigation and, if practical, a Nantes proof of
concept in the existing native harness. Exercise the production mission's normal
claim handler, establish rewards independently, and preserve production bytes.
No further routine approval is required within this scope.

## Requirements and systems

Inspect `tools/run-eu4-test.ps1`, `tools/runtime-tests/{run,lifecycle,evaluate,
prepare-nantes-manual}.mjs`, `processes.ps1`, retained Nantes/recovery evidence,
isolated profile/DLC configuration, installed GUI and command discovery.
Use EU4 1.37.5/default 18 DLC. No injection, independent sidecar architecture,
copied reward solution, ordinary-profile writes, or unrelated input/processes.
Owned UI actions must verify identity, record evidence and have bounded cleanup.

## Implementation plan and progress

- [x] Read project/status/testing, relevant plans, guides and existing components.
- [x] Establish baseline automated tests and protected byte inventory (38 PASS;
  initial restricted-CIM failures preserved; normal-access rerun passed).
- [x] Add minimal Nantes diagnostic case to existing lifecycle; native markers,
  snapshot saves and isolated input handoff, not a separate launcher.
- [x] Reproduce ready-state `mission` and scripted completion separately; capture
  console output, native save/reward/downstream observations.
- [x] Discover commands; investigate shortcuts, focus/accessibility and isolated
  GUI shortcut feasibility before pointer use.
- [x] Implement smallest supported faithful claim adapter and negative refusal.
- [x] Prove automated fresh-profile claim versus retained human-click reference,
  exact rewards/completion/downstream, owned cleanup and separate clean suite.
- [x] Retain portable evidence, update guides/status/decisions/testing and report.

## Discoveries

Fresh startup native `mission bri_nantes_market` nonce 85626f6a0f420f02 actually
completed Nantes in UI/native save and made Textiles ready without rewards.
Both native console goods observations remain zero and completion query false.
This corrects the historical inference from that false query. `save-check.json`
in its attempt independently records saved completed ID and absent modifiers.
Its original runner result remains INCOMPLETE: the process loaded an earlier
reader requiring a before save. Reader now handles startup diagnostics using
native pre-action assertions rather than fabricating a before-save checkpoint.
Preliminary ef908fa85a2caf26 only inspected ready UI/keyboard and was intentionally
terminated; raw partial status is not a behavioral success.

Supported sky pointer input works; F1/8/grave/alternate console/Ctrl+S keyboard
input produced no response. UIA exposes frame/title/system controls only.
Fixed GUI-derived Nantes point (166,312) in client becomes (167,343) in verified
1282x752 captured decorated window. No general DPI/layout support inferred.

Fresh scripted/tree profiles likewise saved completed Nantes and no rewards;
tree command completed 36 missions. These correct only the actual state inference,
not preserved raw failure/incomplete verdicts. No faithful non-UI route found;
template shortcut remains ambiguous/unverified. Supported window-scoped Codex
input can dispatch the real entry safely. Standalone access remains unsupported.

## Validation and handoff

Initial `node` invocation unavailable on PATH; use documented runtime fallback.
Faithful claim `1b769f9bb0df6959` PASS/0: native setup, one derived real entry action,
normal reward dialog, Nantes once, Textiles ready/incomplete, both named permanent
cloth rewards once. Negative `da1fcc49d001d89a` PASS/0: refusal/no entry input,
both saves incomplete/unrewarded. Separate clean `all` `e890bd4b714c6b1c` PASS/0:
four contracts, one attempt, owned cleanup. Final 46 automated tests PASS;
production/staged CWTools zero errors/58 and 62 warnings. All 14 protected hashes
match; no EU4/reporter/WER/runner, lifecycle lock or active collector remains.

Post-proof guard hardening (malformed timestamps/missing campaign identity and
action abort handoff) is covered by final tests and real evidence replays, not
another successful native UI claim. Production unchanged. No deployment made.
Portable raw results retain preliminary/superseded attempts and the mission
diagnostic's earlier reader failure. Final durable source:
[report and playtest list](../../docs/testing/runtime-mission-claim/README.md),
[guide](../../docs/modding/faithful-mission-input.md), D011 in `docs/DECISIONS.md`.

## Completion criteria and remaining playtests

At least one ready production Nantes autonomously claimed through its real
handler, independent exact permanent rewards and downstream evidence, clean
owned lifecycle and subsequent clean suite. Unready case if practical. Record
unsupported layouts/remote-driver dependencies and every unresolved avenue.
Completion criteria met for the authorized POC. The report's verified scenarios
and open extension playtests own remaining geometry/keyboard/locked-desktop/
UI-stage crash limits. New generalization is not authorized by this plan.
