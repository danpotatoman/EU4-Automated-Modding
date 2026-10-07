# Default in-game test environment

Owner: shared EU4 runtime/tooling
Documentation ownership updated: 2026-10-06

User-specified default, recorded 2026-10-02. Apply to every mod test unless the
user explicitly specifies a different environment.

- Enable only the mod being tested. Disable other copies of that mod as well as
  unrelated mods. Deployment names and scenario selection belong to each mod's
  testing runbook, not this shared preference.
- Enable the following DLC for every test:
  - Conquest of Paradise
  - Cradle of Civilization
  - Dharma
  - Domination
  - El Dorado
  - Emperor
  - Golden Century
  - King of Kings
  - Leviathan
  - Lions of the North
  - Mandate of Heaven
  - Mare Nostrum
  - Res Publica
  - Rule Britannia
  - The Cossacks
  - Third Rome
  - Wealth of Nations
  - Winds of Change
- Use non-Ironman games for reproducible manual scenarios. Record the actual game
  version and tested deployment; the configured installation currently reports
  EU4 v1.37.5.0, but verify it for each new build/version.
- The user performs gameplay actions and reloads requested saves. The assistant
  prepares instructions and handles project tooling and results analysis.

This records the intended environment, not a verified launcher configuration.
Confirm the playset and DLC activation before a real run. Preserve a pristine
starting save, and use separately named working saves for checkpoints. A source
or game-version change requires reviewing whether the baseline is still suitable;
prefer a new baseline when mission initialization or selection behavior changes.

Select a scenario from the [owning mod's testing runbook](../mods/README.md).
The current runner reads the 18 indented DLC bullets above; their names/format are
unchanged. Later USA native saves record 21 activated DLC including these 18;
exactly-18-only support remains unverified. Intended preference is not activation.
