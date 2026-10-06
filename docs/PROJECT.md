# Project

This is a Windows EU4 modding workspace with shared development tools and reusable
mechanics documentation. The established source mod is **Brittany Missions**
in `mod/brittany_missions/`: a custom Brittany mission tree with associated events,
decision, modifiers, government reform and English localisation. It replaces the
vanilla `Breton_Missions.txt` through an intentionally comment-only file of that
name. The custom series target BRI; six exclude random map setup explicitly,
while `bri_missions_slot_4` has only the tag condition. Random-map behavior has
not been verified.

**American Century**, in `mod/american_century/`, is a second independently
authorized project. Its [adopted USA design](usa/DESIGN.md) targets 55 USA missions
and an English colonial runway. The first bounded slice has nine USA missions,
three colonial-origin missions, two additive English decisions and a constitutional
choice event. [USA testing/status](testing/american-century/README.md) separates
implemented content, native evidence and the substantial remaining campaign/tree.

## Existing content

`missions/Custom_Breton_Missions.txt` defines seven series: five main columns and
two mutually exclusive diplomatic series sharing column 1, rows 11–13. Content
covers Renaissance/homeland development, commerce and three metropole tiers,
maritime growth, defenses, estates/constitutional settlement, colonial expansion
and overseas trade, plus French-sphere and autonomous diplomacy.

Three triggered events provide diplomatic preview/commitment, a provincial
fortress choice and an iron price change. A review decision reopens diplomatic
selection during preview. Common definitions include event modifiers, metropole
province-triggered modifiers, a constitutional reform, permanent power projection,
a shared preview trigger and two conditional scripted reward effects. Production
also calls installed vanilla helpers. Content presence is not gameplay verification;
see [STATUS.md](STATUS.md) and [DESIGN.md](DESIGN.md).

## Repository organization

| Location | Responsibility |
| --- | --- |
| `AGENTS.md` | Concise working instructions and integrity rules |
| `mod/<mod_name>/` | Game content only; Brittany and American Century |
| `docs/PROJECT.md`, `DESIGN.md`, `STATUS.md`, `ROADMAP.md`, `DECISIONS.md`, `TESTING.md` | Project identity, intent, current evidence, future work, choices, validation |
| `docs/modding/` | Reusable implementation guides and any deliberately captured vanilla examples |
| `docs/testing/` | Environment, reproducible scenarios, coverage and portable runtime evidence |
| `.agent/PLANS.md`, `.agent/plans/` | Plan convention and execution state for substantial tasks |
| `tools/*.ps1` | Entry points for validation, deployment, log capture, layout inspection, project checks, reference lookup and native tests |
| `tools/{cwtools,deployment,test-runs,mission-inspector,checks,vanilla-reference,runtime-tests}/` | Shared Node/PowerShell implementations, configuration, fixtures and READMEs |

Generated caches, reports, deployment backups and staged runtime profiles are
ignored under shared tools. Reviewed textual runtime evidence is deliberately retained
under `docs/testing/`; public copies use synthetic paths and separate original/public
hashes. Original raw evidence and game screenshots remain local. See
[publication audit](PUBLICATION.md) and [hygiene policy](REPOSITORY_HYGIENE.md).
`PROJECT_STRUCTURE.md` is a navigation entry point, not a second project specification.

## Technical context

Installed `launcher-settings.json` read during this bootstrap reports
**EU4 v1.37.5.0 Inca (491d)**. Native evidence also reports 1.37.5.0 Inca.
Development descriptors advertise `1.37.*`; this is metadata, not proof that other
1.37 releases work. The tested default environment enables 18 named DLC;
[environment.md](testing/environment.md) is authoritative for that preference.
Minimal DLC support and multiplayer compatibility have not been established.

`tools/cwtools/config.json` supplies defaults for the Steam installation, a local EU4 rules
snapshot and a 300-second validation timeout. The validator uses the installed
CWTools VS Code extension as an LSP server without opening VS Code; preserved
reports identify version 0.10.31. PowerShell entry points find Node on PATH or use
the existing Codex runtime fallback; no npm package installation is required by
these tools. Tool source is currently `.mjs`/`.ps1`, with per-tool self-tests.

`tools/deployment/config.json` supplies portable defaults for a separate development
destination in the Windows Documents EU4 mod folder. Environment variables and
ignored `config.local.json` override machine-specific paths; see [setup](SETUP.md).
Deployment generates internal and launcher descriptors,
copies source bytes and records ownership/hashes/backups. Source Brittany currently
contains no descriptor. The runtime runner instead makes isolated hashed copies,
test-only additions and a `-userdir` profile under ignored shared tools. Neither a
deployment nor a static pass makes this mod release-ready. See [TESTING.md](TESTING.md).
