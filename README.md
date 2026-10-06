# EU4 Automation & Black-Box Testing Framework

An automation and integration-testing framework for **Europa Universalis IV**, a
closed-source interactive application. Built in Node.js and PowerShell, it stages
isolated game profiles, supervises native processes, collects runtime assertions,
coordinates bounded UI input and verifies behavior against independent saved state.

**Stack:** Node.js · PowerShell · Windows process automation · CWTools · EU4 scripting · GitHub Actions

## Engineering highlights

- **Layered verification:** static wiring checks, scripted assertions, real mission-button
  activation and before/after save checks distinguish completion flags from actual rewards.
- **Process supervision and recovery:** explicit process/profile ownership, crash and
  assertion-stall detection, verified cleanup and bounded retries in fresh profiles.
- **Native integration evidence:** four Brittany behavior contracts; a USA slice with
  four production mission claims, 31 save/input checks and 12 ordinary reload comparisons.
- **Offline regression and CI:** 53 Node tests plus four tool self-test programs run
  without EU4 or an input adapter; GitHub Actions is configured for Linux and Windows.

The repository is actively developed. Brittany Missions is the established mod;
American Century is a growing USA mission project. Neither is certified as a complete
release package. [Current status](docs/STATUS.md) and
[USA slice results](docs/testing/american-century/README.md) define the supported claims.

## The testing problem

An interface that records completion can skip the behavior being tested. In fresh
Nantes experiments, EU4 console/script commands recorded a mission as completed
without granting its production rewards. A real mission-button action granted the
rewards and immediately unlocked the next mission. Some console queries also returned
false despite positive numeric observations and native saved state.

The harness therefore distinguishes trigger logic, scripted effects, mission wiring,
actual UI dispatch, reward quantities and persistence. A static pass, clean log or
completion flag cannot substitute for all those layers.
[Investigation and evidence](docs/testing/runtime-mission-claim/README.md).

## Architecture and workflow

```mermaid
flowchart TD
    Source[Production mod source] --> Static[CWTools and mission inspector]
    Source --> Stage[Hashed copy in isolated userdir]
    Stage --> Native[Owned EU4 launch and supervision]
    Native --> Script[Scripted assertions and value probes]
    Native --> UI[Bounded external input driver]
    UI --> Save[Independent native save checks]
    Script --> Result[Scoped result and local evidence]
    Save --> Result
    Result --> Replay[Reviewed public fixtures and offline replays]
    Native --> Recovery[Crash or stall detection and owned cleanup]
    Recovery --> Retry[Bounded retry in a fresh profile]
    Retry --> Native
```

Production content stays under `mod/`. Shared tooling stages byte-preserving copies,
adds test-only hooks and checks source/staged validation before launching the game.
The runner uses process identities, a lifecycle lock and explicit profile ownership;
it refuses unrelated EU4 sessions. Assertion failures stop; selected infrastructure
failures can retry after successful owned cleanup. Raw profiles, logs, saves and
screenshots remain local. Small reviewed evidence supports replayable regression tests.

## Verified results and scope

| Capability | Verified scope |
| --- | --- |
| Native regression | Four Brittany contracts: preview predicate, conditional shipbuilding reward, alliance-dependent diplomatic reward and installed textiles-building helper; static wiring checked separately |
| Faithful input | One Nantes claim and fresh unready refusal, using actual pointer input and independent before/after saves; both permanent rewards granted once and immediate downstream readiness |
| USA slice | Vanilla formation by real input, four production claims, 31 save/input checks and 12 ordinary reload comparisons; separate eight-check unready contract |
| Recovery | Controlled owned exit, native crash/reporter cleanup and an actual after-BEGIN suspension; fresh retry and separate clean suites afterward |
| Offline regression | Documented validation: 53 Node tests plus four tool self-test programs; no installed game or input adapter required |

**Test-count breakdown:** the historical native development check recorded 51 shared
Node tests. Four configuration/audit tests bring the total to 55; two exercise the real
Windows process adapter and run separately from the 53-test offline command.
See [validation results](docs/PUBLICATION.md) and
[coverage boundaries](docs/testing/runtime-coverage.md). Replays check evaluators
against retained observations; they do not launch another game session.

## Run without EU4

Install Node.js 24 (tested locally with 24.19.0); no npm dependencies are needed.
From the repository root:

```shell
node tools/test-offline.mjs
node tools/publication/check-links.mjs
node tools/publication/audit.mjs
```

The offline command runs assertion, wiring, lifecycle simulation, evidence replay,
input/save contracts, configuration checks and synthetic tool self-tests. It writes
only ignored test output. The GitHub Actions workflow is configured to run these
checks on Linux and Windows. CI does **not** run EU4, CWTools's installed server or
real gameplay input.

## Local EU4 validation and testing

Native development is Windows-specific and requires a licensed installed EU4 copy,
Steam in a usable authenticated state, Windows PowerShell 5.1, Node on PATH and the
CWTools VS Code extension. VS Code need not be open. The evidenced target is
**EU4 1.37.5.0 Inca (491d)**; `1.37.*` descriptor metadata is not broader compatibility
evidence. The [environment](docs/testing/environment.md) lists 18 required DLC;
later native saves record 21 actually enabled DLC. Minimum/exactly-18 support remains
unverified. No game files, DLC, CWTools binary or rules snapshot are bundled.

Configure paths using [setup instructions](docs/SETUP.md). Public defaults assume
the usual Steam installation; custom libraries use `EU4_GAME_PATH`. The ordinary
profile uses Windows Documents discovery or `EU4_USER_DIR`. Ignored `config.local.json`
overrides and committed examples support local configuration without editing shared files.

```powershell
./tools/cwtools/install-rules.ps1   # network needed only for rule installation
./tools/validate-cwtools.ps1
./tools/validate-cwtools.ps1 -Mod american_century
node --test tools/runtime-tests/windows-adapter.test.mjs
# Requires the documented launcher configuration and desktop graphics:
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150
```

The native runner reads the ordinary launcher configuration, builds fresh isolated
`-userdir` profiles in ignored `tools/runtime-tests/work/`, and never overwrites the
installed game or ordinary profile. It is **not headless**. Default lifecycle limits
are 120 seconds total, 30 seconds without assertion progress and one retry; explicit
bounds are available. Cleanup verifies identities before terminating owned processes.
[Testing guide](docs/TESTING.md) and [runner documentation](tools/runtime-tests/README.md)
cover outcomes, preparation-only mode, negative controls and recovery.

### UI-input dependency

Faithful UI tests require an active Codex session with the historical supported
Windows `node_repl` / `@oai/sky` input adapter. The adapter supplies external input;
the repository supplies test orchestration, ownership checks, assertions, state
verification, lifecycle management and recovery logic. Bare PowerShell cannot operate
that handoff, and the adapter is not a bundled standalone automation service.

The verified UI condition is a 1280×720 client, scale 1 and initial tree scroll;
screenshots and fresh owned-window identities must be inspected before input.
[Nantes operator contract](tools/runtime-tests/README.md#faithful-nantes-claim) and
[USA playtests](docs/testing/american-century/README.md#playtest-list) give exact steps.

## Repository map

| Path | Purpose |
| --- | --- |
| `mod/brittany_missions/`, `mod/american_century/` | Project mod source; installed helpers/assets are external dependencies |
| `tools/` | PowerShell entry points, Node implementations, synthetic fixtures and regression tests |
| `docs/modding/` | Versioned mechanics guides, identifiers and minimal adapted examples |
| `docs/testing/` | Scenarios, coverage, historical reports and reviewed textual evidence |
| `docs/{PROJECT,DESIGN,STATUS,ROADMAP,DECISIONS,TESTING}.md` | Durable project knowledge and active development state |
| `AGENTS.md`, `.agent/` | Codex integrity instructions and execution plans |
| `.local/` and ignored tool output | Machine configuration, raw evidence and audit originals; excluded from the public repository |

[Project map](PROJECT_STRUCTURE.md), [contribution workflow](CONTRIBUTING.md) and
[repository hygiene](docs/REPOSITORY_HYGIENE.md) explain ongoing development,
local configuration, evidence handling and staged-content checks.

## Limitations and next work

There is no whole-mod campaign, AI, multiplayer or general version/DLC certification.
Brittany retains 58 CWTools warnings and duplicate localisation findings. Most mission
dispatch/persistence/expiry scenarios remain open. UI automation supports bounded
known layouts and an external active driver; locked desktops and unusual unidentifiable
dialogs need further evidence. USA currently implements nine USA and three colonial
missions; the proposed 55-mission USA tree is still being developed.

Follow the [roadmap](docs/ROADMAP.md) and linked playtests. Public evidence uses synthetic
paths and preserves failed verdicts. Game screenshots and bulk engine dumps are retained
locally pending ownership review, so readers cannot replay the original visual inspection
from the public textual fixtures alone.

## Ownership and licensing

Europa Universalis IV is developed and published by Paradox. This independent project
is not affiliated with or endorsed by Paradox. EU4 assets and trademarks belong to
their respective owners; access to installed game content does not grant redistribution
rights. This repository supplies project tooling/mod content and references external
game definitions; it does not supply the game.

Licensing is pending owner review; no open-source license grant is implied yet.
The [audit and licensing review](docs/PUBLICATION.md) recommends MIT for confirmed
project-owned code, with third-party/runtime material explicitly outside its scope,
and documents the remaining ownership decisions.
