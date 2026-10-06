# Mission tree inspector

From the project root:

```powershell
./tools/inspect-missions.ps1 -Open
# Another mod:
./tools/inspect-missions.ps1 -Mod other_mod -Open
```

The command reads saved mission scripts and English localisation. It generates
a self-contained, offline `reports/<mod>/index.html`, plus `latest.json` and
`latest.txt`. Open the HTML in a browser; no server or package install is needed.
Regenerate after source edits: the viewer is a snapshot, not a live editor.
All tools and generated output stay outside exportable mod directories.

## Spotting broken layouts

The viewer preserves scripted slot and position coordinates, including empty
cells. It never rearranges missions to make the graph look nicer. Dependency
arrows show actual `required_missions`; unrelated missions are not connected just
because they share a column. Use Fit columns and zoom to inspect the whole width.

Red card borders identify structural errors; amber marks warnings. Overlapping
cards are slightly offset and carry a count badge so one mission cannot silently
hide another. Select a finding to focus its affected missions and scroll to them.
Select a card for its source file/line, prerequisites, completion conditions and
rewards. Search highlights matches without removing surrounding tree context.

Checks include:

- Overlapping cells, invalid coordinates, duplicate mission and series IDs.
- Undefined prerequisites, prerequisites in hidden series, dependency cycles,
  and downstream missions structurally blocked by those problems.
- Upward/same-row arrows, crossing arrows and arrows intersecting other cards.
  These are readability warnings using the schematic's straight-line geometry.
- Cross-column connections that skip rows, even when nothing intersects them.
  A1 → A3 is allowed by this rule, as is A1 → E2; A1 → B3 is flagged as
  `long-diagonal`. Such arrows are amber and dashed in the viewer. This is a
  layout warning, not a claim that the dependency is invalid game syntax.
- Missing English titles/descriptions, duplicate localisation keys, missing icons
  and icon names absent from indexed loose interface files.
- Unsupported visibility predicates, inferred positions, generic priority, and
  configured conflicting country flags.

The view draws up to 12 columns and 80 rows. Invalid or more distant coordinates
remain in the report and appear as explicit **Not drawn** buttons, never silently
clamped into a valid cell. Large layouts are flagged for review.

## Branches and country state

`scenarios.json` provides initial, French and autonomous Brittany scenarios.
French and autonomous branches legitimately reuse rows 11–13 of slot 1.
Their mutual exclusion is respected by normal scenarios. A diagnostic scenario
sets both flags: both branches disappear, and the configured state rule reports
that invalid state. Configure other mods' scenarios in the same file, and
mutually exclusive flags in `state-rules.json`.

The selector evaluates only `tag`, `map_setup`, `has_country_flag`, `always`,
and `AND`/`OR`/`NOT` groups with equality. Other conditions are **unknown**, and
their series remain visible with warnings. `potential_on_load` is evaluated
against the same supplied scenario, not a real loaded save.

Series checkboxes override scenario selection. **Select all series** is useful
for discovering shared cells; it intentionally forces mutually exclusive branches
to coexist. The viewer labels this as manual selection, so those collisions
should not be mistaken for overlap in a normal game state. **Reset scenario
selection** restores the chosen scenario. Download current report exports the
current selection, coordinates, dependencies and findings as JSON.

## References and verification limits

Installed vanilla mission IDs and interface sprite names are indexed using the
game path in `tools/cwtools/config.json`. A mod file with the same basename replaces
its vanilla counterpart in the reference index. External prerequisites are shown
as warnings because their availability and coordinates are not rendered.
`-NoVanilla` disables game reference indexing. Unreadable reference files are
listed as limitations, not treated as verified.

Slot columns and explicit position rows follow installed vanilla mission examples;
implicit positions advance from the previous row and are explicitly marked as
inferred. The grid uses fixed schematic card sizes and straight arrows. It does
not reproduce engine arrow routing, icon artwork, DLC archives, generic mission
merging, custom interface scaling, or runtime mission swapping. A title is capped
to two lines on the card; full text remains in its tooltip and details.

Zero layout errors is not a CWTools pass, and neither establishes correct in-game
appearance. Use this inspector before deployment, then verify the layout and
rewards in EU4. It does not modify scripts, saves, playsets or deployed mods.

Exit codes: 0 = reports generated without structural errors in normal configured
scenarios; 1 = reports generated with structural errors; 2 = generation failed.
Warnings do not fail the command. Scenarios marked `diagnostic: true` remain in
reports but do not fail the command for deliberately invalid state checks.

## Tests

```powershell
./tools/mission-inspector/self-test.ps1
# Optional rendered UI test, using installed Chrome and an isolated headless profile:
node tools/mission-inspector/browser-test.mjs
# A different installed Chromium binary can be passed as its first argument.
```

The core tests include deliberately broken fixtures and the actual Brittany tree.
The browser checks cover scenario changes, overlap badges, finding focus, mission
details, search and zoom, and save a screenshot under ignored `test-work/`.
No existing browser session is opened or controlled.
