// Native saved activation is observational metadata, never source-mod ownership.
import {block} from './save-blocks.mjs';
export function savedEnvironment(text,source,{expectedModFiles}={}) {
  const quoted=value=>[...value.matchAll(/"([^"\r\n]+)"/g)].map(m=>m[1]);
  const dlcs=block(text,/^dlc_enabled=\{/m),mods=block(text,/^mods_enabled_names=\{/m),versions=block(text,/^savegame_versions=\{/m);
  const entries=[...mods.matchAll(/\{([^{}]*)\}/g)].map(m=>{
    const files=[...m[1].matchAll(/(?:^|\s)filename="([^"\r\n]+)"/g)].map(v=>v[1]);
    const names=[...m[1].matchAll(/(?:^|\s)name="([^"\r\n]+)"/g)].map(v=>v[1]);
    return {filenames:files,displayNames:names};
  });
  const files=entries.flatMap(e=>e.filenames),names=entries.flatMap(e=>e.displayNames);
  const issues=[];
  if(!entries.length || entries.some(e=>e.filenames.length!==1 || e.displayNames.length>1)) issues.push('missing or ambiguous saved mod filename/name fields');
  if(new Set(files).size!==files.length) issues.push('duplicate saved mod filenames');
  if(expectedModFiles && (files.length!==expectedModFiles.length || expectedModFiles.some(f=>!files.includes(f)))) issues.push('saved mod filenames conflict with isolated profile expectation');
  return {enabledDlcs:quoted(dlcs),enabledModNames:names,enabledModFiles:files,saveVersions:quoted(versions),
    activationIdentityStatus:issues.length?'unknown':'established',activationIdentityIssues:issues,
    activationSource:{...source,fields:['dlc_enabled','mods_enabled_names','savegame_versions']}};
}
