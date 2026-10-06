# Default in-game test environment

User-specified default, recorded 2026-10-02. Apply to every mod test unless the
user explicitly specifies a different environment.

- Enable only the mod being tested. Disable other copies of that mod as well as
  unrelated mods. For the development deployment, enable **Brittany Missions
  (Development)** and disable the existing **Brittany Missions** copy.
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

Current scenario: [Brittany diplomatic selector](brittany-diplomatic-selector.md).
