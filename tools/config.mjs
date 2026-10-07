// Small shared path/config adapter; local overrides never enter the public snapshot.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const project = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const json = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
export function readLocalConfig(kind,root=project) {
  if(!['cwtools','deployment'].includes(kind))throw Error('Unknown config kind');
  const file=path.join(root,'tools',kind,'config.local.json');
  return fs.existsSync(file)?json(file):{};
}
export function loadConfig(kind, root = project, env = process.env) {
  if (!['cwtools', 'deployment'].includes(kind)) throw Error('Unknown config kind');
  const base = path.join(root, 'tools', kind, 'config.json');
  const config = { ...json(base), ...readLocalConfig(kind,root) };
  if (kind === 'cwtools') {
    if (env.EU4_GAME_PATH) config.gamePath = env.EU4_GAME_PATH;
    if (env.EU4_CWTOOLS_EXTENSION) config.extensionPath = env.EU4_CWTOOLS_EXTENSION;
    if (env.EU4_CWTOOLS_RULES) config.rulesPath = env.EU4_CWTOOLS_RULES;
  } else {
    // Legacy descriptor overrides are interpreted by the mod reader only.
    for(const field of Object.keys(config))if(['displayname','supportedversion'].includes(field.toLowerCase()))delete config[field];
    if (env.EU4_USER_DIR) config.gameModDirectory = path.join(env.EU4_USER_DIR, 'mod');
    if (!config.gameModDirectory) {
      let documents = path.join(os.homedir(), 'Documents');
      if (process.platform === 'win32') documents = execFileSync('powershell.exe',
        ['-NoProfile', '-Command', '[Environment]::GetFolderPath("MyDocuments")'],
        { encoding: 'utf8', windowsHide: true }).trim() || documents;
      config.gameModDirectory = path.join(documents, 'Paradox Interactive', 'Europa Universalis IV', 'mod');
    }
  }
  return config;
}
