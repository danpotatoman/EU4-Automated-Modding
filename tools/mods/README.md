# Mod-owned development metadata

`<source-id>/config.json` is the canonical writable source for each mod's development
name, descriptor version and inspector scenarios/state rules. Machine paths belong
in shared defaults plus ignored local overrides. Native fixture labels/aliases
remain contract bindings in the runtime registry/adapters.

- [Brittany](brittany_missions/config.json)
- [American Century](american_century/config.json)
- [Schema, precedence, legacy handling and future mods](../../docs/runtime/configuration-ownership.md)

Readers: [Node](../mod-config.mjs), [PowerShell](../mod-config.ps1).
Metadata registration does not register native contracts or establish gameplay.
