# Vanilla reference lookup

Owner: shared EU4 tooling interface

[Framework status](../../docs/STATUS.md) owns tool capability state;
[mod runbooks](../../docs/mods/README.md) own gameplay state/coverage and
[evidence index](../../docs/testing/README.md) labels historical workloads.


Run from the project root. The game path comes from shared defaults/local overrides
or `EU4_GAME_PATH`; see [setup](../../docs/SETUP.md).
the version is read from the installed `launcher-settings.json`, not an old report.
No dependencies, server or game changes are required.

```powershell
# First check the project knowledge collection:
./tools/vanilla-reference.ps1 -Action docs -Query 'branching missions'
# Then search literal effects, triggers, IDs, phrases or comments:
./tools/vanilla-reference.ps1 -Query swap_non_generic_missions -Folder events
./tools/vanilla-reference.ps1 -Query add_province_modifier -Folder missions -Limit 8
# Find an exact block definition:
./tools/vanilla-reference.ps1 -Query bri_seize_normandy -DefinitionsOnly
# Follow a referenced identifier across definitions and uses:
./tools/vanilla-reference.ps1 -Action links -Query example.1
# Inspect a result's enclosing definition:
./tools/vanilla-reference.ps1 -Action show -File missions/Breton_Missions.txt -Line 20
```

Search is case-insensitive literal text, not a semantic behavior search. Translate
the desired behavior into likely effects/triggers or terms, then inspect examples.
Results include source lines, nearby context, enclosing block breadcrumbs, source
hashes and encoding. `links` applies identifier boundaries so `example.1` does not
accidentally match `example.10` or `example.1.t`; query those separately to follow
localisation. Candidates in comments and quoted text remain visible and require
judgment. The tool does not automatically prove scopes or traverse dependencies.

Default folders: missions, events, decisions, common, localisation, history and
interface. `-Folder` scopes a search to a game-relative directory. Symlink entries
are not followed; escaping paths are rejected. `-Limit` is 1–100 (default 12),
`-Context` is 0–30 (default 3). All matches are counted even when display is limited.
`-Json` returns machine-readable output including full blocks. `show` displays at
most 120 lines; the full block remains available in JSON. Script parse warnings
fall back to matching lines, never to a claimed valid template.

For missions, `show` chooses the containing mission, with series/trigger/effect
breadcrumbs. Other script types use the outer definition, preserving context such
as event options or modifier contents. A line containing multiple definitions can
be ambiguous; inspect the source before selecting it. Source is decoded as strict
UTF-8 when possible, otherwise Windows-1252, with encoding recorded. Game files
are never rewritten. Only loose files are searched: DLC archives and runtime
availability are not established.

## Build the example collection as needed

After selecting a useful source example:

```powershell
./tools/vanilla-reference.ps1 -Action save -File missions/Breton_Missions.txt -Line 20 -Name breton-mission-example -Notes 'Describe why this example is relevant'
./tools/vanilla-reference.ps1 -Action list
./tools/vanilla-reference.ps1 -Action verify
```

Saving creates a **gitignored local-only** Markdown draft and metadata under
`docs/modding/examples/<name>.md` and `.json`. Names must be lowercase slugs.
Existing examples are never overwritten. Metadata records game version, original
file hash, excerpt hash, source line range, enclosing blocks and capture date.
Save requires a parsed enclosing script block. Saved excerpts preserve source
lines as UTF-8 documentation, not as exportable game scripts.

The draft is explicitly **not an implementation guide yet**. Fill its checklist
with scopes, related definitions, localisation, DLC dependencies, minimal adapted
implementation, pitfalls and playtest steps. Capture relevant dependencies as
additional local examples. Public guides record relative source paths/hashes and
minimal project-authored adaptations, without links requiring ignored excerpts.
Do not treat capture, a matching version, or a clean static check as proof of
in-game behavior. Flag unresolved mechanics as required by `AGENTS.md`.

Verify compares installed version and file/excerpt hashes. A changed file is marked
for review even when the excerpt at its old lines still matches. Changed line
numbers are not automatically repaired, and a matching file does not establish
that related dependencies are unchanged. Update guides and metadata deliberately
after reviewing changed vanilla behavior.

Exit 0 means the operation completed (including searches with no matches);
verify exits 1 if any saved example needs review; exit 2 means an operation failed.
Transient searches are not saved automatically. The collection grows only when
an example is deliberately selected. Tests: `./tools/vanilla-reference/self-test.ps1`.
