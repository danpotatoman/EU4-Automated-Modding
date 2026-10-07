// Alternate constitutional path in the existing USA isolated fixture and save oracle.
import fs from 'node:fs';
import path from 'node:path';
import { readUSASave, constitutionMissions } from './usa-slice.mjs';

export function judgeConstitution(saves,ui,actions,geometries) {
  const {before,pending,compact,ready,after,reload}=saves;
  const checks=[],check=(label,value)=>checks.push({label,passed:!!value});
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const missions=s=>s.completed.filter(m=>m.startsWith('amc_')).toSorted();
  const delta=(a,b,key,n)=>Number.isFinite(a.variables[`eu4usa_${key}`])
    && Number.isFinite(b.variables[`eu4usa_${key}`])
    && Math.abs(b.variables[`eu4usa_${key}`]-a.variables[`eu4usa_${key}`]-n)<.001;
  const permanent=(s,name)=>s.modifiers.filter(m=>m.name===name).length===1
    && s.modifiers.find(m=>m.name===name).date==='-1.1.1';
  check('same native campaign across six independently saved checkpoints',!!before.campaignId
    && Object.values(saves).every(s=>s.campaignId===before.campaignId && s.culture==='american'));
  check('fresh USA before claims',!before.completed.some(m=>m.startsWith('amc_'))
    && !before.modifiers.some(m=>m.name.startsWith('amc_')));
  check('Liberty and Compact completed before event option; Union incomplete',
    eq(missions(pending),constitutionMissions.slice(0,2).toSorted()));
  check('pending event converts monarchy to base republic with oligarchy reform',before.government==='monarchy'
    && pending.government==='republic' && pending.reforms.includes('oligarchy_reform')
    && pending.flags.includes('amc_constitution_pending'));
  check('no constitutional choice before real option',!pending.flags.some(f=>/amc_(local_guarantees|enumerated_powers)_chosen/.test(f))
    && !pending.modifiers.some(m=>['amc_local_guarantees','amc_enumerated_powers'].includes(m.name)));
  check('Local Guarantees event adds exactly ten tradition (50 -> 60)',pending.tradition===50 && compact.tradition===60);
  for(const [label,s] of Object.entries({compact,ready,after,reload})) {
    check(`${label}: exclusive Local Guarantees flag/modifier; no pending/enumerated choice`,
      s.flags.includes('amc_local_guarantees_chosen') && !s.flags.includes('amc_enumerated_powers_chosen')
      && !s.flags.includes('amc_constitution_pending') && permanent(s,'amc_local_guarantees')
      && !s.modifiers.some(m=>m.name==='amc_enumerated_powers'));
    check(`${label}: republic and intended base reform retained`,s.government==='republic' && s.reforms.includes('oligarchy_reform'));
  }
  check('engine-observed Local Guarantees accepted-culture capacity +1',delta(pending,compact,'num_accepted_cultures',1));
  // Installed 1.37.5.0 static_modifiers/00_static_modifiers.txt: tradition scales
  // global_unrest -2 and reform_progress_growth +1 at 100 tradition. The option's
  // +10 tradition therefore contributes -0.2 unrest/+0.1 growth independently.
  check('Local Guarantees total unrest -1.2 = permanent -1 plus ten-tradition -0.2',delta(pending,compact,'global_unrest',-1.2));
  check('option tradition contributes vanilla reform growth +0.10',delta(pending,compact,'reform_progress_growth',.1));
  for(const metric of ['governing_capacity_modifier','state_maintenance_modifier','development_cost','global_colonial_growth','republican_tradition'])
    check(`Local Guarantees leaves unrelated ${metric} unchanged`,delta(pending,compact,metric,0));
  check('Liberty exact prestige +20 and reform progress +100',Math.abs(pending.prestige-before.prestige-20)<.001
    && pending.reformProgress-before.reformProgress===100);
  check('Liberty modifier once, twenty-year expiry',pending.modifiers.filter(m=>m.name==='amc_liberty_modifier').length===1
    && pending.modifiers.find(m=>m.name==='amc_liberty_modifier').date==='1464.11.11');
  check('minimum Union prerequisite setup only: tradition 60 -> 70, stability 2 retained',compact.tradition===60
    && ready.tradition===70 && compact.stability===2 && ready.stability===2
    && ready.flags.includes('eu4usa_union_setup_done') && eq(compact.completed,ready.completed)
    && eq(compact.modifiers,ready.modifiers));
  check('prerequisite tradition alone changes unrest -0.2 and reform growth +0.10',
    delta(compact,ready,'global_unrest',-.2) && delta(compact,ready,'reform_progress_growth',.1));
  check('independently isolated Local Guarantees national unrest -1',
    Math.abs((compact.variables.eu4usa_global_unrest-pending.variables.eu4usa_global_unrest)
      -(ready.variables.eu4usa_global_unrest-compact.variables.eu4usa_global_unrest)+1)<.001);
  for(const metric of ['num_accepted_cultures','governing_capacity_modifier','state_maintenance_modifier','development_cost','global_colonial_growth','republican_tradition'])
    check(`prerequisite setup leaves unrelated ${metric} unchanged`,delta(compact,ready,metric,0));
  check('Union completed once, only three expected AMC missions',eq(missions(after),constitutionMissions.toSorted()));
  check('Union permanent modifier once, absent before real claim',!ready.modifiers.some(m=>m.name==='amc_durable_union')
    && permanent(after,'amc_durable_union'));
  check('engine-observed Union annual tradition +0.3',delta(ready,after,'republican_tradition',.3));
  check('engine-observed Union reform progress growth +0.10',delta(ready,after,'reform_progress_growth',.1));
  for(const metric of ['num_accepted_cultures','global_unrest','governing_capacity_modifier','state_maintenance_modifier','development_cost','global_colonial_growth'])
    check(`Union leaves unrelated ${metric} unchanged`,delta(ready,after,metric,0));
  check('Union does not grant instant tradition/progress',after.tradition===ready.tradition && after.reformProgress===ready.reformProgress);
  check('unrelated mission rewards and capital/power changes absent',Object.values(saves).every(s=>
    !s.modifiers.some(m=>['amc_open_doors_modifier','amc_workshop_economy','amc_citizen_army','amc_coastal_fleet'].includes(m.name))
    && eq(s.capitalModifiers,before.capitalModifiers) && s.capitalManpower===before.capitalManpower && s.dip===before.dip));
  const claims=actions.filter(a=>a.kind==='input-returned' && a.action.mission);
  check('exactly three real mission-entry inputs',claims.length===3);
  for(const mission of constitutionMissions) {
    const hits=claims.filter(a=>a.action.mission===mission),g=geometries[mission];
    check(`${mission}: actual derived mission-button input once`,hits.length===1 && hits[0].action.kind==='click'
      && hits[0].action.x===g.point.x+1 && hits[0].action.y===g.point.y+31);
  }
  const options=actions.filter(a=>a.kind==='input-returned' && a.action.eventOption);
  check('exactly one real Local Guarantees event-option input',options.length===1
    && options[0].action.kind==='click' && options[0].action.eventOption==='amc.1.b' && options[0].action.inspected===true);
  check('no console mission-completion command',!actions.some(a=>a.kind==='input-returned' && a.action.kind==='text'
    && /\b(?:complete_mission|mission)\s+amc_/i.test(a.action.text)));
  check('formation, event, refusal at 60, readiness at 70 and reward dialogs inspected',
    ['formationInspected','constitutionInspected','readyInspected','unionUnreadyInspected','downstreamReadyInspected','rewardDialogInspected','reloadInspected'].every(k=>ui[k]===true));
  for(const key of ['completed','modifiers','government','reforms','flags','variables','capitalModifiers','capitalManpower','dip','prestige','stability','tradition','reformProgress'])
    check(`ordinary paused reload preserves ${key}`,eq(after[key],reload[key]));
  return {passed:checks.every(c=>c.passed),checks,completionRecorded:constitutionMissions.every(m=>after.completed.includes(m))};
}

export function inspectConstitution(directory,dlcs,ui,actions,geometries) {
  const saves=Object.fromEntries(['before','pending','compact','ready','after','reload'].map(phase=>{
    const save=readUSASave(path.join(directory,`${phase}.eu4`),dlcs);
    for(const [name,raw] of Object.entries(save.excerpts))
      fs.writeFileSync(path.join(directory,`${phase}-${name}.txt`),Buffer.from(raw,'latin1'));
    delete save.excerpts;return [phase,save];
  }));
  return {...judgeConstitution(saves,ui,actions,geometries),...saves};
}
