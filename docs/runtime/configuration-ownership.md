# Shared machine settings and mod metadata

Owner: repository/framework configuration and tooling
Introduced: Phase 2C, 2026-10-06

Development tooling reads machine settings and mod metadata separately. Mod config
schema **1** is a configuration format; generated evidence remains schema **2**
with its unchanged [identity/applicability rules](evidence-identity.md).

| Source | Responsibility / consumers |
| --- | --- |
| `tools/cwtools/config.json` | Shared game/extension/rules/cache/tool settings; validator, inspector reference indexing, runtime and vanilla lookup |
| `tools/deployment/config.json` | Shared destination discovery (`gameModDirectory`); deployment, checks, collector, native ordinary-profile lookup and public-copy sanitization |
| Ignored adjacent `config.local.json`, documented environment variables | Machine overrides. No real local file is rewritten by migration. Environment > local > committed machine defaults; CLI destination override remains highest. |
| `tools/mods/<source-id>/config.json` | Canonical development display name, supported version and inspector scenarios/state rules; Node/PowerShell mod readers feed deployment, checks and inspector |
| Native contract adapters/registry | Intrinsic test IDs, fixture/manual names and aliases, protocol/DLC/version requirements and native selection. These are contract bindings, not shared machine defaults. |

[Node reader](../../tools/mod-config.mjs) and
[PowerShell reader](../../tools/mod-config.ps1) resolve equivalent effective metadata
and exact development descriptor text. Shared readers return machine settings,
omitting old display/version fields. Neither metadata nor a config owner declaration
establishes native activation, gameplay coverage or process cleanup ownership.

## Per-mod schema and registration

Canonical files use exact, case-sensitive JSON field names:

```json
{
  "schemaVersion": 1,
  "sourceMod": "future_mod",
  "developmentDisplayName": "future_mod (Development)",
  "supportedVersion": "1.37.*",
  "missionInspector": {
    "scenarios": [{ "name": "Initial state", "tag": "ABC", "flags": [] }],
    "mutuallyExclusiveFlags": []
  }
}
```

`sourceMod` must exactly match its source-folder ID. Display names must be nonempty
and cannot contain quotes or line breaks; versions retain the existing digits/dots/
asterisk syntax. Scenarios have a name and string-array/null flags; existing optional
tag, mapSetup and diagnostic fields retain their meaning. Mutually exclusive flag
groups contain at least two strings. Wrong owners, unsupported config schemas,
malformed descriptor values or scenario/rule shapes fail clearly. Inspector's
predicate language and diagnostic verdict rules are unchanged.

Register a future mod by adding its own config under `tools/mods/<id>/`; no native
contract is needed for static inspection/deployment. With no metadata file, generic
tools explicitly report `registered=false`, `sourceMod=null`, requested `sourceId`,
`<id> (Development)`, generic `1.37.*`, an unknown-country scenario and no state rules,
with a scoped notice. They never borrow Brittany metadata. Malformed existing
metadata fails rather than falling back. Arbitrary CWTools `-Project` remains its
own path/report-key interface and does not infer ownership from mod metadata.

Metadata registration does not change Phase 2B's finite production-owner rules or
register native tests: future inspector/deployment evidence can remain untracked/
unknown owner until its existing evidence interface is explicitly extended. Runtime
unknown pairs still fail before configuration or preparation. Config identity and
evidence identity have separate authority.

## Effective values and legacy overrides

| Mod | Canonical development name | Descriptor version | Inspector owner data |
| --- | --- | --- | --- |
| Brittany | `Brittany Missions (Development)` | `1.37.*` | Initial/French/autonomous plus diagnostic conflicting-flags scenario; one exclusion group |
| American Century | `american_century (Development)` | `1.37.*` | USA, England runway and British American colony predicate-review scenarios; no exclusion groups |

These preserve the old effective names, including USA's former generic fallback.
`1.37.*` remains descriptor metadata, not wider compatibility evidence. Source
release descriptors and native test fixture descriptors are unchanged.

Deprecated fields in ignored `tools/deployment/config.local.json` are read only:

- Exact `displayName` overrides Brittany only. Other selected mods receive an
  ignored-field notice and use their own canonical/generic name.
- Exact `supportedVersion` remains a generic compatibility override for every
  selected mod, including unknown/future mods. Its scope is stated in the notice;
  malformed effective values fail. Silently limiting it to Brittany would change
  the previous generic behavior.
- Noncanonical field casing is not normalized into mod metadata. It is ignored
  by both mod readers with a scoped notice and omitted from machine output;
  canonical JSON keys above are required. Earlier Node/PowerShell casing behavior
  differed, so this ambiguous spelling is not guessed. No display/version
  environment variables existed or are added.

Effective descriptor precedence is legacy local compatibility override > canonical
per-mod metadata > explicit generic fallback. Machine path environment precedence
is independent. Readers return `compatibilityNotices`; command consumers emit them
and parity tests can inspect them without emitting warning text into JSON.
Use the per-mod canonical file for future metadata changes. There is one committed
writable source per setting; deleted shared inspector files and deployment display/
version defaults are not competing sources. The user's legacy overrides stay intact
as an explicitly deprecated compatibility exception. Migration does not copy them
into public metadata or edit real local files.

## Inspector and QA output

Scenarios and exclusion rules now live in `missionInspector` in the corresponding
owner's config. The old shared `scenarios.json` and `state-rules.json` are removed;
their exact prior values were preserved in owner files. Generic inspector behavior
and normal `tools/mission-inspector/reports/<source-id>/` paths remain unchanged.
The generator's optional `root`/`storage`/`storageNamespace`/`artifactKind` arguments
support synthetic workspaces and isolated output without changing the CLI defaults.

The source-backed self-test retains Phase 2B's dedicated
`reports/self-test-brittany/` fixture namespace and checks production report bytes
before/after. Browser QA always generates fresh input with fixture identity under
`test-work/browser-<unique-id>/reports/browser-brittany/`, then uses a separate
headless profile/screenshot/rendered output in that same ignored root. It never
reads a production `latest`/HTML as test input. Both exercise STATIC tool behavior;
neither is fresh native mod verification. Collector/check/deployment tests retain
their isolated fixtures/destinations and preserve ordinary report baselines.

Current acceptance and protected-state limits are in the
[Phase 2C handoff](phase2c-configuration-ownership-2026-10-06.md). Native scenario
coverage/playtests remain with the [mod owners](../mods/README.md).
