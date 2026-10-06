# Development deployment

From the project root:

```powershell
./tools/deploy-mod.ps1 -Preview
./tools/deploy-mod.ps1
# Explicitly deploy scripts with known validation errors for in-game diagnosis:
./tools/deploy-mod.ps1 -AllowValidationErrors
```

The default destination uses Windows Documents discovery. Override it with
`EU4_USER_DIR`, ignored `config.local.json` (example supplied), or `-DestinationRoot`.
`config.json` keeps shared metadata; [setup](../../docs/SETUP.md) explains precedence.
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
