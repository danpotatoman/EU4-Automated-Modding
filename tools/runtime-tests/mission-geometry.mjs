import fs from 'node:fs';
import path from 'node:path';
import { parse, field } from '../mission-inspector/engine.mjs';
import { unique } from './script-ast.mjs';
export function missionGeometry(mod, game, mission) {
  if(typeof mission!=='string' || !mission) throw Error('Explicit mission ID required');
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
