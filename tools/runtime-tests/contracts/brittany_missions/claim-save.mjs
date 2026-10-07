// Read-only, scenario-specific native save oracle. Plain saves only; fail closed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parse, field } from '../../../mission-inspector/engine.mjs';
import { block } from '../../save-blocks.mjs';
export function readClaimSave(file,dlcs) {
  const bytes=fs.readFileSync(file);const text=bytes.toString('latin1');
  if(!text.startsWith('EU4txt')) throw Error('Expected native plaintext save');
  const require=(value,label)=>{if(!value) throw Error(`Native save assertion failed: ${label}`);};
  require(/^date=1444\.11\.11$/m.test(text),'paused start date');
  require(/^player="BRI"$/m.test(text),'BRI player');
  require(/^speed=0$/m.test(text),'paused speed');
  const versions=block(text,/^savegame_versions=\{/m);
  require(versions.includes('"1.37.5.0"'),'native save version');
  const enabled=block(text,/^dlc_enabled=\{/m);
  for(const dlc of dlcs) require(enabled.includes(`"${dlc}"`),`DLC ${dlc}`);
  const mods=block(text,/^mods_enabled_names=\{/m);
  require((mods.match(/filename=/g)||[]).length===1 && mods.includes('filename="mod/runtime_test.mod"'),'only isolated mod');
  const country=block(text,/^\tBRI=\{/m,text.indexOf('\ncountries={'));
  require(country.includes('bri_commerce_missions'),'production commerce series');
  require(!['bri_diplomacy_preview','bri_french_sphere_path','bri_autonomous_path'].some(x=>country.includes(x)),'selector unchanged');
  const complete=/^\s*completed_missions=\{/m.test(country) ? block(country,/^\s*completed_missions=\{/m) : '';
  const completed=[...complete.matchAll(/"([^"]+)"/g)].map(m=>m[1]);
  const provinces={};const excerpts={country,versions,enabled,mods};
  for(const p of [169,172,4384]) {
    const raw=block(text,new RegExp(`^-${p}=\\{`,'m'),text.indexOf('\nprovinces={'));
    require(raw.includes('owner="BRI"'),`owner ${p}`);excerpts[`province-${p}`]=raw;
    const parsed=parse(raw)[0].value;
    const buildings=field(parsed,'buildings')?.value||[];
    const rewards=parsed.filter(n=>n.key==='modifier' && Array.isArray(n.value)
      && field(n.value,'modifier')?.value==='bri_demand_for_breton_cloth');
    provinces[p]={buildings:buildings.filter(n=>n.value==='yes').map(n=>n.key),
      rewardCount:rewards.length,expiry:rewards.map(n=>field(n.value,'date')?.value),
      variables:Object.fromEntries((field(parsed,'variables')?.value||[]).map(n=>[n.key,n.value]))};
  }
  return {file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,
    campaignId:text.match(/^campaign_id="([^"]+)"/m)?.[1] || null,
    completed,provinces,excerpts,date:'1444.11.11',version:'1.37.5.0',paused:true};
}
export function judgeClaim(before,after,mode) {
  const checks=[];const check=(label,value)=>checks.push({label,passed:!!value});
  check('same uninterrupted native campaign',typeof before.campaignId==='string' && !!before.campaignId
    && before.campaignId===after.campaignId);
  check('before Nantes incomplete',!before.completed.includes('bri_nantes_market'));
  for(const p of [169,4384]) {
    check(`before ${p} reward absent`,before.provinces[p].rewardCount===0);
    check(`before ${p} zero numerical baseline`,Number(before.provinces[p].variables.eu4claim_before)===0);
    check(`workshop ${p}`,before.provinces[p].buildings.includes('workshop') && after.provinces[p].buildings.includes('workshop'));
    const faithful=['click','shortcut'].includes(mode);
    check(`after ${p} named reward ${faithful?'once/permanent':'absent'}`,faithful ?
      after.provinces[p].rewardCount===1 && after.provinces[p].expiry[0]==='-1.1.1' : after.provinces[p].rewardCount===0);
  }
  check('ready fixture matches mode',before.provinces[172].buildings.includes('marketplace')===(mode!=='negative'));
  check('Textiles remains incomplete',!after.completed.includes('bri_breton_textiles') || mode==='tree');
  const completionCount=after.completed.filter(m=>m==='bri_nantes_market').length;
  const expected=['click','shortcut','scripted','tree'].includes(mode);
  check('Nantes saved completion',completionCount===(expected?1:0));
  return {passed:checks.every(c=>c.passed),checks,completionCount,rewardExecuted:[169,4384].every(p=>after.provinces[p].rewardCount===1),
    nativeMechanism:mode,completionRecorded:completionCount===1,
    rewardValueEvidence:'named permanent native-save entries; production modifier specifies +0.15; console numeric probe separately where available'};
}
export function inspectSnapshots(directory,dlcs,mode) {
  const after=readClaimSave(path.join(directory,'after.eu4'),dlcs);
  const diagnostic=['mission','scripted','tree'].includes(mode);
  const before=diagnostic ? null : readClaimSave(path.join(directory,'before.eu4'),dlcs);
  const verdict=diagnostic ? {passed:true,completionRecorded:after.completed.includes('bri_nantes_market'),
    rewardExecuted:[169,4384].every(p=>after.provinces[p].rewardCount===1),
    nativeMechanism:mode,baselineEvidence:'current-nonce native pre-action assertions; no before save for startup diagnostic'} : judgeClaim(before,after,mode);
  for(const [label,save] of Object.entries({...(before?{before}:{}),after})) {
    for(const [name,raw] of Object.entries(save.excerpts)) fs.writeFileSync(path.join(directory,`${label}-${name}.txt`),Buffer.from(raw,'latin1'));
    delete save.excerpts;
  }
  return {...verdict,before,after};
}
