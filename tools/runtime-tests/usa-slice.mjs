// USA fixture contracts inside the shared runner; no mission reward/completion effects.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { missionGeometry } from './mission-claim.mjs';
import { block } from './claim-save.mjs';
import { parse, field } from '../mission-inspector/engine.mjs';

export const usaMissions=['amc_liberty_at_last','amc_federal_compact','amc_free_harbors','amc_open_doors'];
export const usaProvinces=[965,966,968,967,956,957,962,950,952,953];
export const usaChecks=['initial',...Array.from({length:18},(_,i)=>`dlc-${i+1}`),'fixture-capital','fixture-tech','fixture-owner-core','fixture-cities','fixture-market'];
export function usaHook(nonce,dlcAssertions) {
  return `on_startup = { if = { limit = { tag = ENG capital = 965 num_of_cities = 10
 NOT = { has_country_flag = eu4usa_started } }
 set_country_flag = eu4usa_started
 log = "EU4RT ${nonce} BEGIN usa-slice"
 if = { limit = { is_subject = no is_at_war = no is_year = 1444 NOT = { is_year = 1445 } }
 log = "EU4RT ${nonce} OK initial" } else = { log = "EU4RT ${nonce} FAIL initial" }
 ${dlcAssertions}
} }\n`;
}
export function stageUSA({profile,staged,game,nonce,mode}) {
  if(!['click','negative'].includes(mode)) throw Error('USA slice supports click or negative');
  // Explicit test-only initial history, not a copied production reward path.
  fs.mkdirSync(path.join(staged,'history/countries'),{recursive:true});
  const englishHistory=fs.readFileSync(path.join(game,'history/countries/ENG - England.txt'),'utf8');
  // The engine creates CNs during initialisation, before auto_run. Set the
  // overseas fixture capital in history so its cities remain with England.
  fs.writeFileSync(path.join(staged,'history/countries/ENG - England.txt'),englishHistory.replace(/^capital = 236.*$/m,'capital = 965 # Test-only overseas English capital'));
  fs.mkdirSync(path.join(staged,'history/provinces'),{recursive:true});
  for(const p of usaProvinces) {
    const names=fs.readdirSync(path.join(game,'history/provinces')).filter(n=>n.startsWith(`${p} -`));
    if(names.length!==1) throw Error(`Ambiguous vanilla province ${p}`);
    fs.writeFileSync(path.join(staged,'history/provinces',names[0]),
      `owner = ENG\ncontroller = ENG\nadd_core = ENG\nculture = english\nreligion = catholic\nis_city = yes\ntrade_goods = grain\nbase_tax = 5\nbase_production = 5\nbase_manpower = 5\ndiscovered_by = western\n`);
  }
  const check=(t,n)=>`if = { limit = { ${t} } log = "EU4RT ${nonce} OK ${n}" }
else = { log = "EU4RT ${nonce} FAIL ${n}" }`;
  const body=`ENG = {
 set_capital = 965
 add_adm_tech = 7
 add_stability = 3
 add_prestige = -100 add_prestige = 100
 965 = { remove_building = marketplace remove_building = trade_depot remove_building = stock_exchange
 ${mode==='click'?'add_building = marketplace':''} }
 ${check('capital = 965','fixture-capital')}
 ${check('adm_tech = 10','fixture-tech')}
 ${check('965 = { owned_by = ENG is_core = ENG has_port = yes }','fixture-owner-core')}
 ${check('num_of_owned_provinces_with = { value = 10 colonial_region = colonial_eastern_america is_city = yes is_core = ENG }','fixture-cities')}
 ${check(`965 = { has_trade_building_trigger = ${mode==='click'?'yes':'no'} }`,'fixture-market')}
 log = "EU4RT ${nonce} UI_READY usa-slice"
}`;
  fs.writeFileSync(path.join(profile,'eu4usa_setup.txt'),body+'\n');
  fs.writeFileSync(path.join(profile,'eu4rt_run.commands'),'run eu4usa_setup.txt\r\n');
  fs.mkdirSync(path.join(staged,'common/scripted_effects'),{recursive:true});
  fs.writeFileSync(path.join(staged,'common/scripted_effects/eu4usa_wrappers.txt'),`eu4usa_static_setup = {\n${body}\n}\n`);
  fs.mkdirSync(path.join(staged,'decisions'),{recursive:true});
  const metrics=['governing_capacity_modifier','state_maintenance_modifier','development_cost','global_colonial_growth'];
  fs.writeFileSync(path.join(staged,'decisions/zz_eu4usa_observe.txt'),`country_decisions = {
 eu4usa_observe = { major = yes potential = { tag = USA } allow = { always = yes }
 effect = {
 ${metrics.map(m=>`export_to_variable = { which = eu4usa_${m} value = modifier:${m} }`).join('\n')}
 965 = { export_to_variable = { which = eu4usa_trade value = modifier:province_trade_power_modifier } }
 log = "EU4USAOBS ${nonce} STATE"
 } ai_will_do = { factor = 0 } }
}\n`);
  fs.mkdirSync(path.join(staged,'localisation/english'),{recursive:true});
  fs.writeFileSync(path.join(staged,'localisation/english/eu4usa_test_l_english.yml'),
    '\uFEFFl_english:\n eu4usa_observe_title:0 "Record USA Test State"\n eu4usa_observe_desc:0 "Test-only numerical observation; grants no rewards and completes no missions."\n');
  let settings=fs.readFileSync(path.join(profile,'settings.txt'),'utf8');
  settings=settings.replace(/size=\{\s*x=\d+\s*y=\d+\s*\}/,'size={ x=1280 y=720 }')
    .replace(/game_ui_scale=[\d.]+/,'game_ui_scale=1.000').replace(/fullScreen=\w+/,'fullScreen=no')
    .replace(/borderless=\w+/,'borderless=no').replace(/compress_saves=\w+/,'compress_saves=no');
  fs.writeFileSync(path.join(profile,'settings.txt'),settings);
  const geometries=Object.fromEntries(usaMissions.map(m=>[m,missionGeometry(staged,game,m)]));
  return {files:['eu4usa_setup.txt','eu4rt_run.commands'],geometry:geometries[usaMissions[0]],geometries,mode,
    driver:'Codex node_repl @oai/sky; actual vanilla formation decision and production mission buttons'};
}
export function evaluateUSA(text,nonce,mode) {
  const markers=text.split(/\r?\n/).filter(l=>l.includes(`EU4RT ${nonce} `));
  const expected=['BEGIN usa-slice',...usaChecks.map(c=>`OK ${c}`),'UI_READY usa-slice'];
  const assertionFailures=markers.filter(l=>l.includes(`EU4RT ${nonce} FAIL `));
  return {markers,expectedMarkers:expected,assertionFailures,
    missingOrDuplicateChecks:usaChecks.filter(c=>markers.filter(l=>l.endsWith(`OK ${c}`)).length!==1),
    runningVersion:text.match(/Game Version: (.+)/)?.[1]?.trim(),
    dateMatches:markers.every(l=>l.includes('EVENT [1444.11.11]:')),
    versionMatches:text.includes('Game Version: EU4 v1.37.5.0 Inca'),
    transcriptPass:markers.length===expected.length && markers.every((l,i)=>l.includes('EVENT [1444.11.11]:')
      && l.endsWith(`EU4RT ${nonce} ${expected[i]}`)) && text.includes('Game Version: EU4 v1.37.5.0 Inca'),mode};
}
export function readUSASave(file,dlcs,tag='USA') {
  const bytes=fs.readFileSync(file),text=bytes.toString('latin1');
  const require=(v,l)=>{if(!v) throw Error(`USA native save assertion failed: ${l}`);};
  require(text.startsWith('EU4txt'),'plain save');
  require(/^date=1444\.11\.11$/m.test(text) && /^speed=0$/m.test(text),'paused start');
  require(new RegExp(`^player="${tag}"$`,'m').test(text),'player');
  const versions=block(text,/^savegame_versions=\{/m),enabled=block(text,/^dlc_enabled=\{/m),mods=block(text,/^mods_enabled_names=\{/m);
  require(versions.includes('"1.37.5.0"'),'version');
  for(const dlc of dlcs) require(enabled.includes(`"${dlc}"`),`DLC ${dlc}`);
  require((mods.match(/filename=/g)||[]).length===1 && mods.includes('filename="mod/runtime_test.mod"'),'isolated mod');
  const country=block(text,new RegExp(`^\\t${tag}=\\{`,'m'),text.indexOf('\ncountries={'));
  // Country saves contain anonymous estate privilege tuples unsupported by the
  // script parser. Parse only bounded fields, never normalize the whole save.
  const scalar=key=>country.match(new RegExp(`^\\t\\t${key}=([^\\r\\n]+)`,'m'))?.[1]?.replace(/^"|"$/g,'');
  const countryField=key=>new RegExp(`^\\t\\t${key}=\\{`,'m').test(country)
    ? parse(block(country,new RegExp(`^\\t\\t${key}=\\{`,'m')))[0].value : [];
  const complete=countryField('completed_missions');
  const completed=complete.map(n=>n.key);
  const modifiers=[...country.matchAll(/^\t\tmodifier=\{/gm)].map(m=>{
    const n=parse(block(country,/^\t\tmodifier=\{/m,m.index))[0];
    return {name:field(n.value,'modifier')?.value,date:field(n.value,'date')?.value};
  });
  const raw=block(text,/^-965=\{/m,text.indexOf('\nprovinces={')),province=parse(raw)[0].value;
  const provinces=Object.fromEntries(usaProvinces.map(p=>{
    const raw=block(text,new RegExp(`^-${p}=\\{`,'m'),text.indexOf('\nprovinces={'));
    require(raw.includes(`owner="${tag}"`),`owner ${p}`);
    require(parse(block(raw,/^\s*cores=\{/m))[0].value.some(n=>n.key===tag),`core ${p}`);
    return [p,{owner:tag}];
  }));
  const series=block(country,/^\s*country_missions=\{/m);
  require(tag!=='USA' || ['amc_continent','amc_army','amc_state','amc_economy','amc_navy'].every(s=>new RegExp(`\\b${s}\\b`).test(series)),'USA series');
  require(tag!=='USA' || !series.includes('usa_missions_main'),'vanilla series suppressed');
  const government=countryField('government');
  const state={file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
    campaignId:text.match(/^campaign_id="([^"]+)"/m)?.[1],tag,completed,modifiers,provinces,
    culture:scalar('primary_culture'),prestige:Number(scalar('prestige')),
    dip:Number(countryField('powers')[1]?.key),government:field(government,'government')?.value,
    reforms:(field(field(government,'reform_stack')?.value||[],'reforms')?.value||[]).map(n=>n.key),
    flags:countryField('flags').map(n=>n.key),
    variables:Object.fromEntries(countryField('variables').map(n=>[n.key,Number(n.value)])),
    capitalManpower:Number(field(province,'base_manpower')?.value),
    capitalVariables:Object.fromEntries((field(province,'variables')?.value||[]).map(n=>[n.key,Number(n.value)])),
    capitalModifiers:province.filter(n=>n.key==='modifier' && Array.isArray(n.value)).map(n=>({name:field(n.value,'modifier')?.value,date:field(n.value,'date')?.value})),
    buildings:(field(province,'buildings')?.value||[]).filter(n=>n.value==='yes').map(n=>n.key)};
  return {...state,excerpts:{country,capital:raw,versions,enabled,mods}};
}
export function judgeUSA(before,after,mode,ui,actions,geometries) {
  const checks=[],check=(label,value)=>checks.push({label,passed:!!value});
  check('same uninterrupted native campaign',!!before.campaignId && before.campaignId===after.campaignId);
  check('American culture and USA selection',before.culture==='american' && after.culture==='american');
  check('all production slice missions incomplete before claims',!before.completed.some(m=>m.startsWith('amc_')));
  check('no USA mission rewards before claims',!before.modifiers.some(m=>m.name?.startsWith('amc_')) && !before.capitalModifiers.some(m=>m.name?.startsWith('amc_')));
  check('market fixture matches mode',before.buildings.includes('marketplace')===(mode==='click'));
  const claims=actions.filter(a=>a.kind==='input-returned' && a.action.mission);
  if(mode==='negative') {
    check('unready mission refused with no entry input',claims.length===0 && ui.unreadyRefused===true);
    check('state/rewards unchanged',JSON.stringify(before.completed)===JSON.stringify(after.completed)
      && JSON.stringify(before.modifiers)===JSON.stringify(after.modifiers) && JSON.stringify(before.capitalModifiers)===JSON.stringify(after.capitalModifiers));
  } else {
    for(const mission of usaMissions) {
      check(`${mission} completion once`,after.completed.filter(m=>m===mission).length===1);
      const matches=claims.filter(c=>c.action.mission===mission),g=geometries[mission];
      check(`${mission} real derived button input once`,matches.length===1 && matches[0].action.kind==='click'
        && matches[0].action.x===g.point.x+1 && matches[0].action.y===g.point.y+31);
    }
    check('only expected USA missions completed',after.completed.filter(m=>m.startsWith('amc_')).length===usaMissions.length);
    for(const [name,date] of [['amc_liberty_modifier','1464.11.11'],['amc_enumerated_powers','-1.1.1'],['amc_open_doors_modifier','1464.11.11']]) {
      const m=after.modifiers.filter(m=>m.name===name);check(`${name} once/exact expiry`,m.length===1 && m[0].date===date);
    }
    const harbor=after.capitalModifiers.filter(m=>m.name==='amc_free_harbor');
    check('permanent named harbor reward once',harbor.length===1 && harbor[0].date==='-1.1.1');
    check('exact harbor DIP delta',after.dip-before.dip===50);
    check('exact liberty prestige delta',Math.abs(after.prestige-before.prestige-20)<.001);
    check('exact immigration manpower delta',after.capitalManpower-before.capitalManpower===2);
    check('exclusive constitution flags',after.flags.includes('amc_enumerated_powers_chosen')
      && !after.flags.includes('amc_local_guarantees_chosen') && !after.flags.includes('amc_constitution_pending'));
    check('base republic government and reform',after.government==='republic' && after.reforms.includes('oligarchy_reform'));
    for(const [metric,delta] of [['governing_capacity_modifier',.1],['state_maintenance_modifier',-.1],['development_cost',-.1],['global_colonial_growth',25]])
      check(`native ${metric} delta ${delta}`,Math.abs(after.variables[`eu4usa_${metric}`]-before.variables[`eu4usa_${metric}`]-delta)<.001);
    check('native local trade power delta 0.15',Math.abs(after.capitalVariables.eu4usa_trade-before.capitalVariables.eu4usa_trade-.15)<.001);
    check('unrelated rewards absent',!after.modifiers.some(m=>['amc_local_guarantees','amc_workshop_economy','amc_citizen_army','amc_coastal_fleet','amc_durable_union'].includes(m.name)));
    check('readiness, choices and dialogs inspected',ui.readyInspected===true && ui.downstreamReadyInspected===true
      && ui.rewardDialogInspected===true && ui.constitutionInspected===true);
  }
  check('actual formation decision inspected',ui.formationInspected===true);
  return {passed:checks.every(c=>c.passed),checks,completionRecorded:mode==='click' && usaMissions.every(m=>after.completed.includes(m))};
}
export function inspectUSA(directory,dlcs,mode,ui,actions,geometries) {
  const before=readUSASave(path.join(directory,'before.eu4'),dlcs),after=readUSASave(path.join(directory,'after.eu4'),dlcs);
  const verdict=judgeUSA(before,after,mode,ui,actions,geometries);
  for(const [phase,save] of Object.entries({before,after})) {
    for(const [name,raw] of Object.entries(save.excerpts)) fs.writeFileSync(path.join(directory,`${phase}-${name}.txt`),Buffer.from(raw,'latin1'));
    delete save.excerpts;
  }
  return {...verdict,before,after};
}
