# Development deployment

Owner: shared EU4 tooling interface

New ownership records use [evidence schema 2](../../docs/runtime/evidence-identity.md),
with explicit owner/namespace, staged artifact kind, source/deployed manifests and
run/timestamps. Verdict remains UNVERIFIED for activation/gameplay. Validation
consumption checks fresh path/owner/kind/build identity. Existing
`state/<mod>/<destination-key>/` layout and legacy ownership/file/hash checks remain;
new contradictory owner/namespace or unknown schema records fail. Destination
modifications are still refused. Display-name/version values are preserved through
[canonical mod metadata](../mods/README.md) and scoped legacy compatibility.

[Framework status](../../docs/STATUS.md) owns tool capability state;
[mod runbooks](../../docs/mods/README.md) own gameplay state/coverage and
[evidence index](../../docs/testing/README.md) labels historical workloads.

These existing tools accept their documented -Mod and default to Brittany.
Brittany examples/source-backed tests do not establish another mod's gameplay.
Shared machine configuration is separate from mod metadata; schema 2 semantics above apply to new reports.


From the project root:

```powershell
./tools/deploy-mod.ps1 -Preview
./tools/deploy-mod.ps1
# Explicitly deploy scripts with known validation errors for in-game diagnosis:
./tools/deploy-mod.ps1 -AllowValidationErrors
```

The default destination uses Windows Documents discovery. Override it with
`EU4_USER_DIR`, ignored `config.local.json` (example supplied), or `-DestinationRoot`.
`config.json` keeps shared destination settings. `tools/mod-config.ps1` reads the
selected mod's canonical metadata; Node checks use `tools/mod-config.mjs` with the
same values and descriptor bytes. [Setup](../../docs/SETUP.md) and
[configuration ownership](../../docs/runtime/configuration-ownership.md) explain
precedence and deprecated local display/version fields. USA retains the development
name `american_century (Development)`; unknown mods have a labelled generic fallback.
Brittany deploys as
`brittany_missions_dev/` plus `brittany_missions_dev.mod`, leaving the existing
`brittany_missions` installation alone. Both internal and launcher descriptors
are generated. Source files are copied byte for byte; the staged descriptor is
generated as UTF-8 without BOM. Other mods use `-Mod folder_name`.

CWTools runs before deployment. Errors block deployment unless explicitly allowed;
failed validation always blocks it. `-SkipValidation` is available for testing
the deployment tool, and is recorded as skipped, never passed. `-Preview` only
prints paths. `-DestinationRoot` overrides the destination for isolated tests.

Each deployment keeps staged files, hashes, a timestamped record, and the previous
deployment under `tools/deployment/state/<mod>/<destination-key>/`. Only destinations owned by a
matching deployment record can be updated. Changed deployed files and symlinks
block updates. Copy failures attempt restoration of the previous deployment.
This is not an atomic operation: close EU4 before deploying and avoid concurrent
deployments. Keep backups until you are satisfied with the new version.

Enable **Brittany Missions (Development)** in your launcher playset and disable
other Brittany mod copies. Deployment does not change playsets or launch EU4.
A successful copy is not evidence of successful in-game behavior or release readiness.

Run isolated integration checks with `./tools/deployment/self-test.ps1`. Their
files stay under ignored shared tooling folders; they do not write to the game.
