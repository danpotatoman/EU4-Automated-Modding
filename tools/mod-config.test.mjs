import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {loadModConfig,developmentDescriptor} from './mod-config.mjs';
import {loadConfig} from './config.mjs';
import {deploymentPreparation,inventory} from './checks/check.mjs';
import {generate} from './mission-inspector/generate.mjs';
import {prepareBrowserFixture} from './mission-inspector/browser-fixture.mjs';
import {resolveContract} from './runtime-tests/contracts.mjs';
import {cwtoolsIdentity,runtimeIdentity} from './evidence-identity.mjs';
const project=path.resolve('.');
const owners=['brittany_missions','american_century'];
const json=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const put=(f,value)=>{fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(value));};
function workspace(t) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'eu4-mod-config-'));
  t.after(()=>{assert.ok(path.resolve(root).startsWith(path.join(os.tmpdir(),'eu4-mod-config-')));fs.rmSync(root,{recursive:true,force:true});});
  fs.mkdirSync(path.join(root,'game-mods'));
  put(path.join(root,'tools/deployment/config.json'),{gameModDirectory:path.join(root,'game-mods')});
  put(path.join(root,'tools/cwtools/config.json'),{gamePath:path.join(root,'no-installed-game')});
  for(const mod of owners)put(path.join(root,`tools/mods/${mod}/config.json`),json(`tools/mods/${mod}/config.json`));
  return root;
}
const local=(root,value)=>put(path.join(root,'tools/deployment/config.local.json'),value);
test('canonical owners resolve independent development names, versions and inspector state',t=>{
  const root=workspace(t),b=loadModConfig(owners[0],root),u=loadModConfig(owners[1],root);
  assert.equal(b.sourceMod,owners[0]);assert.equal(u.sourceMod,owners[1]);assert.equal(b.registered,true);assert.equal(u.registered,true);
  assert.equal(b.developmentDisplayName,'Brittany Missions (Development)');assert.equal(u.developmentDisplayName,'american_century (Development)');
  assert.equal(b.supportedVersion,'1.37.*');assert.equal(u.supportedVersion,'1.37.*');
  assert.equal(b.missionInspector.scenarios.length,4);assert.equal(u.missionInspector.scenarios.length,3);
  assert.deepEqual(b.missionInspector.mutuallyExclusiveFlags,[['bri_french_sphere_path','bri_autonomous_path']]);
  assert.deepEqual(u.missionInspector.mutuallyExclusiveFlags,[]);assert.deepEqual(b.compatibilityNotices,[]);
});
test('shared configuration keeps machine precedence and strips legacy mod fields',t=>{
  const root=workspace(t);local(root,{gameModDirectory:'local',displayName:'Legacy Brittany',supportedVersion:'1.38.*'});
  assert.deepEqual(loadConfig('deployment',root,{}),{gameModDirectory:'local'});
  assert.deepEqual(loadConfig('deployment',root,{EU4_USER_DIR:'environment'}),{gameModDirectory:path.join('environment','mod')});
  assert.deepEqual(Object.keys(json('tools/deployment/config.json')),['gameModDirectory']);
  assert.deepEqual(Object.keys(json('tools/deployment/config.example.json')),['gameModDirectory']);
});
test('legacy display override is Brittany-only and generic version applies without editing local bytes',t=>{
  const root=workspace(t);local(root,{displayName:'Existing Brittany name',supportedVersion:'1.36.*'});
  const file=path.join(root,'tools/deployment/config.local.json'),before=fs.readFileSync(file),notices=[];
  const b=loadModConfig(owners[0],root,{onNotice:v=>notices.push(v)}),u=loadModConfig(owners[1],root),unknown=loadModConfig('unknown',root);
  assert.equal(b.developmentDisplayName,'Existing Brittany name');assert.equal(u.developmentDisplayName,'american_century (Development)');
  assert.equal(unknown.developmentDisplayName,'unknown (Development)');
  for(const m of [b,u,unknown])assert.equal(m.supportedVersion,'1.36.*');
  assert.ok(notices.every(n=>n.includes('brittany_missions')));assert.ok(u.compatibilityNotices.some(n=>n.includes('ignored')));
  assert.deepEqual(fs.readFileSync(file),before);
});
test('unknown and newly registered metadata remain generic tools, independent of native registry',t=>{
  const root=workspace(t),unknown=loadModConfig('future_mod',root);
  assert.equal(unknown.sourceMod,null);assert.equal(unknown.registered,false);assert.equal(unknown.developmentDisplayName,'future_mod (Development)');
  assert.equal(unknown.missionInspector.scenarios[0].flags,null);assert.ok(unknown.compatibilityNotices.length);
  const metadata={...json('tools/mods/american_century/config.json'),sourceMod:'future_mod',developmentDisplayName:'Future configured name'};
  put(path.join(root,'tools/mods/future_mod/config.json'),metadata);
  assert.equal(loadModConfig('future_mod',root).sourceMod,'future_mod');
  assert.throws(()=>resolveContract({mod:'future_mod',test:'usa-slice'}),/Unknown runtime owner: future_mod/);
  assert.equal(cwtoolsIdentity({root,project:path.join(root,'arbitrary/future_mod')}).sourceMod,null);
});
test('conflicting owner, unsupported schema and malformed descriptor/scenario/rule metadata fail clearly',t=>{
  const root=workspace(t),file=path.join(root,`tools/mods/${owners[0]}/config.json`),base=json(file);
  for(const change of [{sourceMod:owners[1]},{schemaVersion:99},{developmentDisplayName:'bad"name'},{supportedVersion:'unsafe\nversion'},
    {missionInspector:{scenarios:[{name:'bad',flags:'string'}],mutuallyExclusiveFlags:[]}},
    {missionInspector:{scenarios:[],mutuallyExclusiveFlags:[]}},
    {missionInspector:{scenarios:base.missionInspector.scenarios,mutuallyExclusiveFlags:[['one']]}}]) {
    put(file,{...base,...change});assert.throws(()=>loadModConfig(owners[0],root),/conflict|schema|Invalid/);
  }
  for(const id of ['../outside','bad/name',''])assert.throws(()=>loadModConfig(id,root),/source-folder/);
});
test('deployment preparation reads canonical values and preserves exact old descriptor bytes',t=>{
  const root=workspace(t);
  for(const mod of owners) {
    const source=path.join(root,'mod',mod);fs.mkdirSync(source,{recursive:true});fs.writeFileSync(path.join(source,'test.txt'),'fixture');
    const metadata=loadModConfig(mod,root),prepared=deploymentPreparation(root,mod,inventory(source));
    assert.equal(prepared.descriptor,`name="${mod===owners[0]?'Brittany Missions (Development)':'american_century (Development)'}"\nsupported_version="1.37.*"\n`);
    assert.equal(prepared.launcherText,prepared.descriptor+`path="${prepared.target.replaceAll('\\','/')}"\n`);
    const configFile=path.join(root,`tools/mods/${mod}/config.json`);
    put(configFile,{...metadata,developmentDisplayName:'Owner-specific override',supportedVersion:'1.39.*'});
    assert.equal(deploymentPreparation(root,mod,inventory(source)).descriptor,'name="Owner-specific override"\nsupported_version="1.39.*"\n');
    assert.equal(fs.readdirSync(path.join(root,'game-mods')).length,0);
  }
});
test('inspector scenarios/rules come only from owner metadata; generic source stays untracked',t=>{
  const root=workspace(t),source=path.join(root,'mod/future_mod/missions');fs.mkdirSync(source,{recursive:true});
  fs.writeFileSync(path.join(source,'fixture.txt'),'one = { slot = 1 potential = { has_country_flag = left NOT = { has_country_flag = right } } a = {} }');
  const options={root,storage:path.join(root,'reports')};
  const generic=generate('future_mod',true,options);
  assert.equal(generic.identity.sourceMod,null);assert.equal(generic.identity.artifactKind,'untracked');
  const metadata={...json('tools/mods/american_century/config.json'),sourceMod:'future_mod',missionInspector:{scenarios:[{name:'Owner scenario',flags:['left','right']}],mutuallyExclusiveFlags:[['left','right']]}};
  put(path.join(root,'tools/mods/future_mod/config.json'),metadata);
  const configured=generate('future_mod',true,options);
  assert.equal(configured.reports[0].scenario.name,'Owner scenario');assert.ok(configured.reports[0].findings.some(f=>f.code==='conflicting-state'));
  assert.equal(configured.identity.sourceMod,null,'Metadata registration must not redesign schema-2 owner resolution');
  assert.deepEqual(configured.identity.coveredLayers,['STATIC']);
  assert.equal(fs.existsSync('tools/mission-inspector/scenarios.json'),false);assert.equal(fs.existsSync('tools/mission-inspector/state-rules.json'),false);
});
test('browser QA generates fresh isolated fixture output while production reports remain byte-identical',()=>{
  const files=owners.flatMap(mod=>['latest.json','latest.txt','index.html'].map(name=>`tools/mission-inspector/reports/${mod}/${name}`));
  const snapshot=()=>files.map(f=>fs.existsSync(f)?fs.readFileSync(f).toString('base64'):null);
  const before=snapshot(),start=new Date().toISOString();
  const fixture=prepareBrowserFixture({noVanilla:true});
  assert.ok(fixture.output.includes('test-work'));assert.equal(fixture.identity.artifactKind,'fixture');
  assert.equal(fixture.identity.storageNamespace,'browser-brittany');assert.equal(fixture.identity.sourceMod,owners[0]);
  assert.ok(fixture.identity.startedAtUtc>=start);assert.ok(fs.readFileSync(fixture.output,'utf8').includes('bri_franco_breton_friendship'));
  assert.deepEqual(snapshot(),before);assert.deepEqual(fixture.identity.coveredLayers,['STATIC']);
});
test('native registry, fixture names/aliases and schema-2 identity remain independent of deployment metadata',t=>{
  const root=workspace(t);
  for(const [mod,id,namespace,name] of [[owners[0],'all','brittany_runtime','Brittany Runtime Test (DO NOT EXPORT)'],[owners[1],'usa-slice','american_runtime','American Runtime Test (DO NOT EXPORT)']]) {
    const selection=resolveContract({mod,test:id});
    assert.equal(loadModConfig(mod,root).sourceMod,selection.owner);assert.equal(selection.adapter.runtimeMod,namespace);assert.equal(selection.adapter.descriptorName,name);
    const identity=runtimeIdentity(selection,{runId:'fixture',attemptId:'fixture/1'});
    assert.equal(identity.schemaVersion,2);assert.equal(identity.sourceMod,mod);assert.equal(identity.storageNamespace,namespace);assert.equal(identity.artifactKind,'fixture');
    assert.equal(identity.coveredLayers.includes('END-TO-END'),false);
    const configFile=path.join(root,`tools/mods/${mod}/config.json`);put(configFile,{...json(configFile),developmentDisplayName:'New development name'});
    assert.equal(resolveContract({mod,test:id}).adapter.descriptorName,name,'Development config must not change native fixture descriptors');
  }
});
test('Node and PowerShell resolve identical metadata, descriptor bytes, notices, machine precedence and errors',t=>{
  const probe=spawnSync('powershell.exe',['-NoProfile','-Command','exit 0'],{windowsHide:true});
  if(probe.error?.code==='ENOENT'){t.skip('Windows PowerShell unavailable; parity requires the Windows test environment.');return;}
  assert.equal(probe.status,0);
  const root=workspace(t),legacyRoot=workspace(t);local(legacyRoot,{displayName:'Legacy Brittany only',supportedVersion:'1.36.*',gameModDirectory:path.join(legacyRoot,'local-destination')});
  const cases=[];
  for(const r of [root,legacyRoot,project])for(const mod of [...owners,'future_mod'])cases.push({root:r,mod});
  cases.push({root:legacyRoot,mod:owners[1],userDir:path.join(legacyRoot,'environment-profile')});
  const legacyCaseRoot=workspace(t);local(legacyCaseRoot,{DisplayName:'Not an exact legacy field',SupportedVersion:'1.36.*'});
  // Noncanonical legacy casing is ignored as metadata and omitted from machine config.
  cases.push({root:legacyCaseRoot,mod:owners[1]});
  for(const change of [{sourceMod:'other'},{schemaVersion:'1'},{schemaVersion:true},{developmentDisplayName:'bad"name'},{supportedVersion:12},
    {missionInspector:{scenarios:[{name:'bad',tag:null,flags:[]}],mutuallyExclusiveFlags:[]}},
    {missionInspector:{scenarios:[{name:'missing flags'}],mutuallyExclusiveFlags:[]}}]) {
    const bad=workspace(t),file=path.join(bad,`tools/mods/${owners[0]}/config.json`);put(file,{...json(file),...change});cases.push({root:bad,mod:owners[0]});
  }
  cases.push({root,mod:'../bad'});
  const runner=path.join(root,'parity.ps1'),caseFile=path.join(root,'cases.json');put(caseFile,cases);
  fs.writeFileSync(runner,`param([string]$Reader,[string]$SharedReader,[string]$Cases)\n$ErrorActionPreference='Stop'\n[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)\n. $Reader\n. $SharedReader\n$results=@(foreach($case in (Get-Content -LiteralPath $Cases -Raw -Encoding UTF8 | ConvertFrom-Json)){\n try { $env:EU4_USER_DIR=$case.userDir; $metadata=Get-ModConfig -Mod $case.mod -Root $case.root; [pscustomobject]@{metadata=$metadata;descriptor=(Get-DevelopmentDescriptor $metadata);shared=(Get-DeploymentConfig -Root $case.root)} } catch { [pscustomobject]@{error=$_.Exception.Message} }\n})\nConvertTo-Json -InputObject $results -Depth 20\n`);
  const output=execFileSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',runner,path.join(project,'tools/mod-config.ps1'),path.join(project,'tools/config.ps1'),caseFile],{encoding:'utf8',windowsHide:true});
  const expected=cases.map(c=>{try{const metadata=loadModConfig(c.mod,c.root);return {metadata,descriptor:developmentDescriptor(metadata),shared:loadConfig('deployment',c.root,c.userDir?{EU4_USER_DIR:c.userDir}:{})};}catch(e){return {error:e.message};}});
  assert.deepEqual(JSON.parse(output.replace(/^\uFEFF/,'')),expected);
});
test('PowerShell deployment and Node preparation consume changed owner metadata with exact descriptor parity',t=>{
  const probe=spawnSync('powershell.exe',['-NoProfile','-Command','exit 0'],{windowsHide:true});
  if(probe.error?.code==='ENOENT'){t.skip('Windows PowerShell unavailable; deployment parity requires Windows.');return;}
  assert.equal(probe.status,0);
  const root=workspace(t);
  for(const file of ['deploy-mod.ps1','config.ps1','mod-config.ps1','evidence-record.mjs','evidence-identity.mjs'])fs.copyFileSync(path.join(project,'tools',file),path.join(root,'tools',file));
  for(const mod of [...owners,'future_mod']) {
    const source=path.join(root,'mod',mod);fs.mkdirSync(source,{recursive:true});fs.writeFileSync(path.join(source,'fixture.txt'),'fixture bytes');
    if(owners.includes(mod)) {
      const file=path.join(root,`tools/mods/${mod}/config.json`);put(file,{...json(file),developmentDisplayName:mod+' owned name',supportedVersion:'1.39.*'});
    }
    const prepared=deploymentPreparation(root,mod,inventory(source));
    const result=spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(root,'tools/deploy-mod.ps1'),'-Mod',mod,'-DestinationRoot',path.join(root,'game-mods'),'-SkipValidation'],{encoding:'utf8',windowsHide:true});
    assert.equal(result.status,0,result.stderr||result.stdout);
    assert.deepEqual(fs.readFileSync(path.join(prepared.target,'descriptor.mod')),Buffer.from(prepared.descriptor,'utf8'));
    assert.deepEqual(fs.readFileSync(prepared.launcher),Buffer.from(prepared.launcherText,'utf8'));
    assert.equal(deploymentPreparation(root,mod,inventory(source)).findings.length,0);
  }
});
