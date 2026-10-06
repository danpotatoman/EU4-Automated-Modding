// Nantes proof-of-concept fixtures; rewards are never copied or invoked here.
import fs from 'node:fs';
import path from 'node:path';
import { parse, field } from '../mission-inspector/engine.mjs';
import { unique } from './wiring.mjs';

export const claimChecks = ['initial', ...Array.from({length:18}, (_, i)=>`dlc-${i+1}`),
  'fixture-membership', 'fixture-buildings', 'before-169', 'before-4384',
  'after-169', 'after-4384'];
export const claimModes = ['click', 'mission', 'scripted', 'tree', 'shortcut', 'negative'];
export function claimFixture(nonce, mode) {
  if (!claimModes.includes(mode)) throw Error('Unsupported claim mode');
  const log = s => `log = "EU4RT ${nonce} ${s}"`;
  const check = (trigger, label) => `if = { limit = { ${trigger} } ${log(`OK ${label}`)} }
else = { ${log(`FAIL ${label}`)} }`;
  const values = (phase, expected) => [169,4384].map(p=>`${p} = {
 export_to_variable = { which = eu4claim_goods value = modifier:trade_goods_size_modifier }
 ${phase === 'before' ? 'set_variable = { which = eu4claim_before which = eu4claim_goods }' : ''}
 ${check(`check_variable = { which = eu4claim_goods value = ${expected} } NOT = { check_variable = { which = eu4claim_goods value = ${(expected+.001).toFixed(3)} } }`,`${phase}-${p}`)}
}`).join('\n');
  const before = `BRI = {
 ${check('has_mission = bri_nantes_market has_mission = bri_breton_textiles NOT = { mission_completed = bri_nantes_market } NOT = { mission_completed = bri_breton_textiles }','fixture-membership')}
 172 = { remove_building = marketplace remove_building = trade_depot remove_building = stock_exchange ${mode==='negative' ? '' : 'add_building = marketplace'} }
 169 = { add_building = workshop } 4384 = { add_building = workshop }
 ${check(`172 = { has_trade_building_trigger = ${mode==='negative'?'no':'yes'} } 169 = { has_production_building_trigger = yes } 4384 = { has_production_building_trigger = yes }`,'fixture-buildings')}
 ${values('before',0)}
 ${log('UI_READY nantes-claim')}
}`;
  const after = `BRI = {
 ${values('after',['click','shortcut'].includes(mode) ? .15 : 0)}
 if = { limit = { mission_completed = bri_nantes_market } ${log('OBS console-completion true')} }
 else = { ${log('OBS console-completion false')} }
 if = { limit = { mission_completed = bri_breton_textiles } ${log('OBS console-textiles true')} }
 else = { ${log('OBS console-textiles false')} }
}
${log('END nantes-claim')}`;
  return {before,after, scripted:'BRI = { complete_mission = bri_nantes_market }\n'};
}

export function missionGeometry(mod, game, mission='bri_nantes_market') {
  const tree = fs.readdirSync(path.join(mod,'missions')).filter(file=>file.endsWith('.txt'))
    .flatMap(file=>parse(fs.readFileSync(path.join(mod,'missions',file),'utf8')));
  const series = tree.filter(n=>Array.isArray(n.value) && n.value.some(m=>m.key===mission));
  if(series.length!==1) throw Error('Ambiguous mission series');
  const row=Number(field(unique(tree,mission).value,'position').value);
  const slot=Number(field(series[0].value,'slot').value);
  const gui=parse(fs.readFileSync(path.join(game,'interface/countrymissionsview.gui'),'utf8'));
  // GUI objects use name fields rather than node keys.
  function named(nodes,name) {
    const matches=[];
    const walk=ns=>{for(const n of ns) if(Array.isArray(n.value)) {
      if(field(n.value,'name')?.value===name) matches.push(n); walk(n.value);
    }}; walk(nodes);
    if(matches.length!==1) throw Error(`Ambiguous GUI ${name}`); return matches[0];
  }
  const vector=(name,key,keys=['x','y'])=>keys.map(k=>Number(field(field(named(gui,name).value,key)?.value||[],k)?.value));
  const origin=vector('countrymissionsview','position');
  const list=vector('countrymissionsview_missions_gridbox_listbox','position');
  const cell=vector('countrymissionsview_missions_gridbox','slotsize',['width','height']);
  if(![...origin,...list,...cell,slot,row].every(Number.isFinite) || slot<1 || slot>5 || row<1)
    throw Error('Unsupported mission geometry');
  // Interior of the vanilla 104-wide mission frame; avoid condition/reward badges.
  return {mission,series:series[0].key,slot,row,origin,list,cell,scale:1,scroll:0,
    point:{x:origin[0]+list[0]+(slot-1)*cell[0]+52,
      y:origin[1]+list[1]+(row-1)*cell[1]+50},
    assumptions:'1280x720 client, UI scale 1, initial tree scroll; verify screenshot before input'};
}

export function stageClaim({profile,staged,game,nonce,mode}) {
  const fixture=claimFixture(nonce,mode);
  const files=[];
  for(const [phase,body] of Object.entries(fixture)) {
    const filename=`eu4claim_${phase}.txt`;fs.writeFileSync(path.join(profile,filename),body+'\n');files.push(filename);
  }
  const nativeAction={mission:'mission bri_nantes_market',scripted:'run eu4claim_scripted.txt',tree:'mission_tree true BRI'}[mode];
  fs.writeFileSync(path.join(profile,'eu4rt_run.commands'),
    ['run eu4claim_before.txt',...(nativeAction ? [nativeAction,'run eu4claim_after.txt','helplog'] : [])].join('\r\n')+'\r\n');files.push('eu4rt_run.commands');
  fs.mkdirSync(path.join(staged,'common/scripted_effects'),{recursive:true});
  fs.writeFileSync(path.join(staged,'common/scripted_effects/eu4claim_wrappers.txt'),
    Object.entries(fixture).map(([phase,body])=>`eu4claim_static_${phase} = {\n${body}\n}\n`).join(''));
  let settings=fs.readFileSync(path.join(profile,'settings.txt'),'utf8');
  settings=settings.replace(/size=\{\s*x=\d+\s*y=\d+\s*\}/,'size={ x=1280 y=720 }')
    .replace(/game_ui_scale=[\d.]+/,'game_ui_scale=1.000').replace(/fullScreen=\w+/,'fullScreen=no')
    .replace(/borderless=\w+/,'borderless=no').replace(/compress_saves=\w+/,'compress_saves=no');
  fs.writeFileSync(path.join(profile,'settings.txt'),settings);
  return {files,geometry:missionGeometry(staged,game),mode,driver:'Codex node_repl @oai/sky; no standalone input driver'};
}
