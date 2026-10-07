// Development descriptor/inspector metadata. This does not register native contracts
// or grant an evidence owner; those retain their existing independent semantics.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readLocalConfig} from './config.mjs';
const project=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const strings=value=>Array.isArray(value)&&value.every(v=>typeof v==='string');
export function validateModConfig(metadata,mod) {
  if(metadata?.schemaVersion!==1)throw Error('Unsupported mod metadata schema version.');
  if(metadata.sourceMod!==mod)throw Error('Mod metadata source owner conflicts with selected mod.');
  if(typeof metadata.developmentDisplayName!=='string'||!metadata.developmentDisplayName.trim()||/["\r\n]/.test(metadata.developmentDisplayName))throw Error('Invalid developmentDisplayName.');
  if(typeof metadata.supportedVersion!=='string'||!/^[0-9.*]+$/.test(metadata.supportedVersion))throw Error('Invalid supportedVersion.');
  const inspector=metadata.missionInspector;
  if(!inspector||!Array.isArray(inspector.scenarios)||!inspector.scenarios.length||inspector.scenarios.some(s=>!s||typeof s.name!=='string'||!s.name.trim()
    || s.flags!==null&&!strings(s.flags) || s.tag!==undefined&&typeof s.tag!=='string' || s.mapSetup!==undefined&&typeof s.mapSetup!=='string'
    || s.diagnostic!==undefined&&typeof s.diagnostic!=='boolean'))throw Error('Invalid missionInspector scenarios.');
  if(!Array.isArray(inspector.mutuallyExclusiveFlags)||inspector.mutuallyExclusiveFlags.some(r=>!strings(r)||r.length<2))throw Error('Invalid missionInspector state rules.');
  return metadata;
}
export function loadModConfig(mod,root=project,{onNotice}={}) {
  if(!/^[a-zA-Z0-9_-]+$/.test(mod||''))throw Error('Mod must be a simple source-folder ID.');
  const file=path.join(root,'tools/mods',mod,'config.json'),registered=fs.existsSync(file);
  const metadata=registered?JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')):{schemaVersion:1,sourceMod:mod,
    developmentDisplayName:`${mod} (Development)`,supportedVersion:'1.37.*',
    missionInspector:{scenarios:[{name:'Unknown country state — review series selection',flags:null}],mutuallyExclusiveFlags:[]}};
  validateModConfig(metadata,mod);
  const result=structuredClone(metadata),compatibilityNotices=[];
  const notice=value=>{compatibilityNotices.push(value);onNotice?.(value);};
  if(!registered)notice(`No metadata for ${mod}; using generic development/inspector defaults, with source ownership unknown.`);
  const legacy=readLocalConfig('deployment',root);
  for(const field of Object.keys(legacy))if(['displayname','supportedversion'].includes(field.toLowerCase())&&!['displayName','supportedVersion'].includes(field))
    notice(`Legacy deployment metadata field ${field} ignored for ${mod}; use exact displayName/supportedVersion casing.`);
  if(Object.hasOwn(legacy,'displayName')) {
    if(mod==='brittany_missions') {
      result.developmentDisplayName=legacy.displayName;
      notice('Legacy deployment displayName applies only to brittany_missions; deprecated, use tools/mods/brittany_missions/config.json.');
    } else notice(`Legacy deployment displayName ignored for ${mod}; scoped only to brittany_missions.`);
  }
  if(Object.hasOwn(legacy,'supportedVersion')) {
    result.supportedVersion=legacy.supportedVersion;
    notice(`Legacy deployment supportedVersion compatibility override applies to ${mod}; deprecated, use its tools/mods metadata when registered.`);
  }
  validateModConfig(result,mod);
  return {...result,sourceMod:registered?mod:null,sourceId:mod,registered,compatibilityNotices};
}
export function developmentDescriptor(metadata) {
  return `name="${metadata.developmentDisplayName}"\nsupported_version="${metadata.supportedVersion}"\n`;
}
