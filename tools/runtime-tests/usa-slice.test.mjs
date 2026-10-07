import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateUSA, usaChecks, usaMissions, judgeUSA, stageUSA } from './contracts/american_century/usa-slice.mjs';
import { missionGeometry } from './mission-geometry.mjs';
import { judgeConstitution } from './contracts/american_century/usa-constitution.mjs';
import { constitutionMissions } from './contracts/american_century/usa-slice.mjs';

test('Local Guarantees/Union oracle rejects wrong option, fake claims, wrong arithmetic and reload loss',()=>{
  const vars=Object.fromEntries(['num_accepted_cultures','global_unrest','republican_tradition','reform_progress_growth',
    'governing_capacity_modifier','state_maintenance_modifier','development_cost','global_colonial_growth'].map(k=>[`eu4usa_${k}`,0]));
  const before={campaignId:'c',culture:'american',government:'monarchy',completed:[],modifiers:[],flags:[],variables:vars,
    capitalModifiers:[],capitalManpower:5,dip:100,prestige:25,reformProgress:0,tradition:0,stability:2};
  const pending={...before,government:'republic',reforms:['oligarchy_reform'],completed:constitutionMissions.slice(0,2),
    flags:['amc_constitution_pending'],modifiers:[{name:'amc_liberty_modifier',date:'1464.11.11'}],tradition:50,prestige:45,reformProgress:100};
  const compact={...pending,flags:['amc_local_guarantees_chosen'],tradition:60,
    modifiers:[...pending.modifiers,{name:'amc_local_guarantees',date:'-1.1.1'}],
    variables:{...vars,eu4usa_num_accepted_cultures:1,eu4usa_global_unrest:-1.2,eu4usa_reform_progress_growth:.1}};
  const ready={...compact,tradition:70,flags:[...compact.flags,'eu4usa_union_setup_done'],
    variables:{...compact.variables,eu4usa_global_unrest:-1.4,eu4usa_reform_progress_growth:.2}};
  const after={...ready,completed:constitutionMissions,modifiers:[...ready.modifiers,{name:'amc_durable_union',date:'-1.1.1'}],
    variables:{...ready.variables,eu4usa_republican_tradition:.3,eu4usa_reform_progress_growth:.3}};
  const saves={before,pending,compact,ready,after,reload:structuredClone(after)};
  const geometries=Object.fromEntries(constitutionMissions.map((m,i)=>[m,{point:{x:270,y:312+i*152}}]));
  const actions=constitutionMissions.map(m=>({kind:'input-returned',action:{mission:m,kind:'click',x:271,y:geometries[m].point.y+31}}));
  actions.push({kind:'input-returned',action:{kind:'click',eventOption:'amc.1.b',inspected:true}});
  const ui=Object.fromEntries(['formationInspected','constitutionInspected','readyInspected','unionUnreadyInspected',
    'downstreamReadyInspected','rewardDialogInspected','reloadInspected'].map(k=>[k,true]));
  assert.equal(judgeConstitution(saves,ui,actions,geometries).passed,true);
  const reordered=structuredClone(saves);reordered.pending.completed.reverse();reordered.after.completed.reverse();
  reordered.reload.completed.reverse();assert.equal(judgeConstitution(reordered,ui,actions,geometries).passed,true);
  for(const mutate of [s=>s.compact.tradition=70,s=>s.compact.flags.push('amc_enumerated_powers_chosen'),
    s=>s.after.variables.eu4usa_republican_tradition=.03,s=>s.after.variables.eu4usa_reform_progress_growth=10,
    s=>s.reload.modifiers.pop(),s=>s.compact.variables.eu4usa_num_accepted_cultures=0,
    s=>s.after.capitalManpower++,s=>s.ready.completed.push('amc_more_perfect_union')]) {
    const bad=structuredClone(saves);mutate(bad);assert.equal(judgeConstitution(bad,ui,actions,geometries).passed,false);
  }
  assert.equal(judgeConstitution(saves,ui,actions.slice(0,3),geometries).passed,false);
  assert.equal(judgeConstitution(saves,ui,actions.slice(1),geometries).passed,false);
});

test('USA native protocol rejects missing, failed, duplicate, wrong-date and wrong-version markers',()=>{
  const outcomes=['BEGIN usa-slice',...usaChecks.map(c=>`OK ${c}`),'UI_READY usa-slice'];
  const text='Game Version: EU4 v1.37.5.0 Inca\n'+outcomes.map(m=>`EVENT [1444.11.11]:EU4RT test ${m}`).join('\n');
  assert.equal(evaluateUSA(text,'test','click').transcriptPass,true);
  for(const damaged of [text.replace('OK fixture-cities','FAIL fixture-cities'),text.replace('OK initial','OK bogus'),
    text.replace('1444.11.11','1444.11.12'),text.replace('1.37.5.0','1.36.0.0'),text+'\nEVENT [1444.11.11]:EU4RT test OK initial'])
    assert.equal(evaluateUSA(damaged,'test','click').transcriptPass,false);
});
test('USA actual-input/native-save contract rejects state-only completion and wrong rewards',()=>{
  const before={campaignId:'c',culture:'american',completed:[],modifiers:[],capitalModifiers:[],buildings:['marketplace'],dip:100,prestige:25,capitalManpower:5,
    variables:{eu4usa_governing_capacity_modifier:0,eu4usa_state_maintenance_modifier:0,eu4usa_development_cost:0,eu4usa_global_colonial_growth:0},capitalVariables:{eu4usa_trade:.5}};
  const after={...before,completed:usaMissions,modifiers:[{name:'amc_liberty_modifier',date:'1464.11.11'},
    {name:'amc_enumerated_powers',date:'-1.1.1'},{name:'amc_open_doors_modifier',date:'1464.11.11'}],
    capitalModifiers:[{name:'amc_free_harbor',date:'-1.1.1'}],dip:150,prestige:45,capitalManpower:7,
    flags:['amc_enumerated_powers_chosen'],government:'republic',reforms:['oligarchy_reform'],
    variables:{eu4usa_governing_capacity_modifier:.1,eu4usa_state_maintenance_modifier:-.1,eu4usa_development_cost:-.1,eu4usa_global_colonial_growth:25},capitalVariables:{eu4usa_trade:.65}};
  const geometries=Object.fromEntries(usaMissions.map((m,i)=>[m,{point:{x:i*100,y:312}}]));
  const actions=usaMissions.map(m=>({kind:'input-returned',action:{mission:m,kind:'click',x:geometries[m].point.x+1,y:343}}));
  const ui={readyInspected:true,downstreamReadyInspected:true,rewardDialogInspected:true,constitutionInspected:true,formationInspected:true};
  const judge=(state=after,input=actions)=>judgeUSA(before,state,'click',ui,input,geometries).passed;
  assert.equal(judge(),true);assert.equal(judge(after,[]),false);
  for(const mutation of [s=>s.dip--,s=>s.capitalManpower++,s=>s.completed=[...s.completed,usaMissions[0]],
    s=>s.modifiers[1].date='1464.11.11',s=>s.modifiers.push({name:'amc_workshop_economy',date:'-1.1.1'}),
    s=>s.government='monarchy',s=>s.flags.push('amc_local_guarantees_chosen'),
    s=>s.variables.eu4usa_governing_capacity_modifier=.2,
    s=>delete s.variables.eu4usa_global_colonial_growth,
    s=>s.capitalVariables.eu4usa_trade=.64]) {
    const bad=structuredClone(after);mutation(bad);assert.equal(judge(bad),false);
  }
});
test('USA negative contract rejects accidental mission entry and reward leakage',()=>{
  const state={campaignId:'c',culture:'american',completed:[],modifiers:[],capitalModifiers:[],buildings:[]};
  const ui={formationInspected:true,unreadyRefused:true};
  const judge=(after=state,input=[])=>judgeUSA(state,after,'negative',ui,input,{}).passed;
  assert.equal(judge(),true);
  assert.equal(judge(state,[{kind:'input-returned',action:{mission:'amc_free_harbors'}}]),false);
  assert.equal(judge({...state,completed:['amc_free_harbors']}),false);
  assert.equal(judge({...state,capitalModifiers:[{name:'amc_free_harbor',date:'-1.1.1'}]}),false);
});
test('USA source geometry is derived across files; unknown mission fails closed',()=>{
  const game=fileURLToPath(new URL('./fixtures/geometry/',import.meta.url));
  const g=missionGeometry('mod/american_century',game,'amc_federal_compact');
  assert.equal(g.slot,3);assert.equal(g.row,2);assert.deepEqual(g.point,{x:270,y:464});
  assert.throws(()=>missionGeometry('mod/american_century',game,'amc_unknown'));
});
test('USA fixture never invokes completion, production rewards or formation effects',()=>{
  const source=fs.readFileSync(new URL('./contracts/american_century/usa-slice.mjs',import.meta.url),'utf8');
  const stage=source.slice(source.indexOf('export function stageUSA'),source.indexOf('export function evaluateUSA'));
  assert.doesNotMatch(stage,/complete_mission|change_tag\s*=|add_country_modifier\s*=|amc_free_harbor\s*duration/);
  void stageUSA;void path;
});
