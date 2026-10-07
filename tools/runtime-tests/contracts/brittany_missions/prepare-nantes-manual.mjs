import { loadConfig } from '../../../config.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { identity, buildIdentity } from '../../../evidence-identity.mjs';
export function main(args=process.argv.slice(2)) {
  const startedAtUtc=new Date().toISOString();
  // Dedicated preparation only. No game launch, mission completion or reward application.
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
  const read = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  const slash = value => value.replaceAll('\\', '/');
  const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const game = loadConfig('cwtools', root).gamePath;
  const normalProfile = path.dirname(loadConfig('deployment', root).gameModDirectory);
  const launcher = read(path.join(normalProfile, 'dlc_load.json'));
  if (JSON.stringify(launcher.enabled_mods) !== JSON.stringify(['mod/brittany_missions_dev.mod']) || launcher.disabled_dlcs.length)
    throw Error('Normal launcher differs from the documented preference; inspect before testing.');
  const dlcs = [...fs.readFileSync(path.join(root, 'docs/testing/environment.md'), 'utf8').matchAll(/^  - (.+)$/gm)].map(m => m[1].trim());
  if (dlcs.length !== 18) throw Error('Review DLC environment; expected 18 entries.');
  const nonce = crypto.randomBytes(8).toString('hex');
  const session = path.join(root, 'tools/runtime-tests/work', `nantes-manual-${new Date().toISOString().replace(/[-:.]/g, '')}-${nonce}`);
  const staged = path.join(session, 'brittany_nantes_manual');
  const profile = path.join(session, 'profile');
  const source = path.join(root, 'mod/brittany_missions');
  fs.mkdirSync(path.join(profile, 'mod'), { recursive: true });
  fs.mkdirSync(path.join(profile, 'logs'), { recursive: true });
  fs.mkdirSync(path.join(profile, 'save games'), { recursive: true });
  fs.cpSync(source, staged, { recursive: true });
  const descriptor = 'name="Brittany Nantes Manual Test (DO NOT EXPORT)"\nsupported_version="1.37.*"\n';
  fs.writeFileSync(path.join(staged, 'descriptor.mod'), descriptor);
  fs.writeFileSync(path.join(profile, 'mod/nantes_manual.mod'), descriptor + `path="${slash(staged)}"\n`);
  fs.writeFileSync(path.join(profile, 'dlc_load.json'), JSON.stringify({ enabled_mods: ['mod/nantes_manual.mod'], disabled_dlcs: [] }));
  fs.copyFileSync(path.join(normalProfile, 'settings.txt'), path.join(profile, 'settings.txt'));
  const log = text => `log = "EU4NF ${nonce} ${text}"`;
  const assertion = (condition, label) => `if = { limit = { ${condition} } ${log(`OK ${label}`)} }\nelse = { ${log(`FAIL ${label}`)} }`;
  const absentFlags = ['bri_diplomacy_preview', 'bri_french_sphere_path', 'bri_autonomous_path'].map(f => `NOT = { has_country_flag = ${f} }`).join(' ');
  const untouched = 'has_mission = bri_nantes_market has_mission = bri_breton_textiles NOT = { mission_completed = bri_nantes_market } NOT = { mission_completed = bri_breton_textiles }';
  const ownership = [172, 169, 4384].map(p => `${p} = { owned_by = ROOT }`).join(' ');
  const initial = `tag = BRI is_subject = no is_year = 1444 NOT = { is_year = 1445 } ${absentFlags} ${untouched} ${ownership}`;
  const values = (phase, expected) => [169, 4384].map(p => `${p} = {
   export_to_variable = { which = eu4nf_goods value = modifier:trade_goods_size_modifier }
   ${phase === 'setup' ? 'set_variable = { which = eu4nf_goods_before which = eu4nf_goods }' : ''}
   ${assertion(`check_variable = { which = eu4nf_goods value = ${expected} } NOT = { check_variable = { which = eu4nf_goods value = ${(expected + 0.001).toFixed(3)} } }`, `${phase}-value-${p}`)}
   ${phase === 'completed' || phase === 'reloaded' ? `set_variable = { which = eu4nf_goods_delta which = eu4nf_goods }
   subtract_variable = { which = eu4nf_goods_delta which = eu4nf_goods_before }
   ${assertion('check_variable = { which = eu4nf_goods_delta value = 0.15 } NOT = { check_variable = { which = eu4nf_goods_delta value = 0.151 } }', `${phase}-delta-${p}`)}` : ''}
   if = { limit = { has_province_modifier = bri_demand_for_breton_cloth } ${log(`OBS ${phase}-named-${p} present`)} }
   else = { ${log(`OBS ${phase}-named-${p} query-false`)} }
  }`).join('\n');
  const productionBuildings = '169 = { has_production_building_trigger = yes } 4384 = { has_production_building_trigger = yes }';
  const bodies = {
   setup: `${log('BEGIN setup')}\nBRI = {\n${assertion(initial, 'initial')}
   ${dlcs.map((dlc, i) => assertion(`has_dlc = "${dlc}"`, `dlc-${i + 1}`)).join('\n')}
   if = { limit = { ${initial} }
    172 = { remove_building = marketplace remove_building = trade_depot remove_building = stock_exchange }
    169 = { add_building = workshop } 4384 = { add_building = workshop }
    ${assertion('172 = { has_trade_building_trigger = no }', 'missing-trade-building')}
    ${assertion(productionBuildings, 'textiles-other-buildings')}
    ${values('setup', 0)}
    ${assertion(`${untouched} ${absentFlags}`, 'setup-missions-flags-untouched')}
   } else = { ${log('FAIL setup-refused')} }
  }\n${log('END setup')}`,
   ready: `${log('BEGIN ready')}\nBRI = {
   if = { limit = { ${untouched} ${ownership} ${absentFlags} }
   172 = { add_building = marketplace }
   ${assertion('172 = { has_trade_building_trigger = yes has_building = marketplace }', 'marketplace-added')}
   ${assertion(`${untouched} ${absentFlags} ${productionBuildings}`, 'ready-fixture-only')}
   ${values('ready', 0)}
   } else = { ${log('FAIL ready-refused')} }
  }\n${log('END ready')}`,
   ...Object.fromEntries(['completed', 'reloaded'].map(phase => [phase, `${log(`BEGIN ${phase}`)}\nBRI = {
   ${assertion('mission_completed = bri_nantes_market', `${phase}-nantes-completed`)}
   ${assertion('has_mission = bri_breton_textiles NOT = { mission_completed = bri_breton_textiles }', `${phase}-textiles-incomplete`)}
   ${assertion(`${ownership} ${productionBuildings} ${absentFlags}`, `${phase}-fixture-flags-retained`)}
   ${values(phase, 0.15)}
  }\n${log(`END ${phase}`)}`]))
  };
  // Wrappers statically validate each exact plain body; they are never invoked.
  fs.mkdirSync(path.join(staged, 'common/scripted_effects'), { recursive: true });
  for (const [phase, body] of Object.entries(bodies)) fs.writeFileSync(path.join(profile, `nantes_${phase}.txt`), body + '\n');
  fs.writeFileSync(path.join(staged, 'common/scripted_effects/eu4nf_static_wrappers.txt'),
    Object.entries(bodies).map(([phase, body]) => `eu4nf_static_${phase}_${nonce} = {\n${body}\n}\n`).join('\n'));
  fs.writeFileSync(path.join(profile, 'nantes_setup.commands'), 'run nantes_setup.txt\r\n');
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
  const inventory = dir => walk(dir).map(file => ({ path: slash(path.relative(dir, file)), sha256: sha(file) }));
  const report = { ...identity({sourceMod:'brittany_missions',storageNamespace:'brittany_nantes_manual',artifactKind:'fixture',coveredLayers:[],evidenceSource:'preparation',
    contractId:'nantes-manual',runId:path.basename(session),sourceBuild:buildIdentity(source),stagedBuild:buildIdentity(staged)}),
    startedAtUtc,finishedAtUtc:new Date().toISOString(),verdict:'UNVERIFIED',verdictSource:'preparation only',
    intendedEnvironment:{requiredDlcs:dlcs,enabledMods:['mod/nantes_manual.mod'],source:'prepared profile; activation not observed'},status: 'prepared-not-launched', nonce, session, staged, profile, source,
    installedVersion: read(path.join(game, 'launcher-settings.json')).version, normalLauncher: launcher,
    dlcs, sourceManifest: inventory(source), stagedManifest: inventory(staged),
    consoleFiles: Object.keys(bodies).map(phase => ({ file: `nantes_${phase}.txt`, sha256: sha(path.join(profile, `nantes_${phase}.txt`)) })),
    commandSha256: sha(path.join(profile, 'nantes_setup.commands')), missionBehaviorVerified: false };
  fs.writeFileSync(path.join(session, 'preparation.json'), JSON.stringify(report, null, 2) + '\n');
  const watchdog = `param([int]$OwnedProcessId,[long]$OwnedStartTicks,[string]$SessionDirectory,[int]$LifetimeSeconds=3600)
  $ErrorActionPreference='Stop'
  $ownedGame=Get-Process -Id $OwnedProcessId -ErrorAction SilentlyContinue
  if(-not $ownedGame -or $ownedGame.StartTime.ToUniversalTime().Ticks -ne $OwnedStartTicks){exit}
  if(-not $ownedGame.WaitForExit($LifetimeSeconds*1000)){
   $ownedGame=Get-Process -Id $OwnedProcessId -ErrorAction SilentlyContinue
   if($ownedGame -and $ownedGame.StartTime.ToUniversalTime().Ticks -eq $OwnedStartTicks){
    $null=$ownedGame.CloseMainWindow()
    if(-not $ownedGame.WaitForExit(5000)){Stop-Process -Id $OwnedProcessId -Force}
    [IO.File]::WriteAllText((Join-Path $SessionDirectory 'watchdog-expired.txt'),[DateTime]::UtcNow.ToString('o'))
   }
  }
  `;
  fs.writeFileSync(path.join(session, 'watchdog.ps1'), watchdog);
  const psLiteral = s => `'${s.replaceAll("'", "''")}'`;
  const launch = `param([switch]$Reload,[ValidateRange(60,3600)][int]$LifetimeSeconds=3600)
  $ErrorActionPreference='Stop'
  if(@(Get-Process eu4 -ErrorAction SilentlyContinue).Count){throw 'EU4 already running; refusing to close or reuse it.'}
  $sessionDirectory=${psLiteral(session)}
  $profileDirectory=${psLiteral(slash(profile))}
  $launchArgs=@('-debug',('-userdir="'+$profileDirectory+'/"'))
  if(-not $Reload){$launchArgs+=@('-start_tag=BRI','-auto_run=nantes_setup.commands')}
  $ownedGame=Start-Process -FilePath ${psLiteral(path.join(game, 'eu4.exe'))} -WorkingDirectory ${psLiteral(game)} -ArgumentList $launchArgs -PassThru
  $record=[ordered]@{pid=$ownedGame.Id;startTicks=$ownedGame.StartTime.ToUniversalTime().Ticks;startedAtUtc=[DateTime]::UtcNow.ToString('o');deadlineUtc=[DateTime]::UtcNow.AddSeconds($LifetimeSeconds).ToString('o');mode=$(if($Reload){'reload-no-setup'}else{'fresh-setup'});arguments=$launchArgs}
  $recordFile=Join-Path $sessionDirectory $(if($Reload){'reload-launch.json'}else{'launch.json'})
  [IO.File]::WriteAllText($recordFile,($record|ConvertTo-Json),[Text.UTF8Encoding]::new($false))
  $watchArgs=@('-NoProfile','-ExecutionPolicy','Bypass','-File',('"'+(Join-Path $sessionDirectory 'watchdog.ps1')+'"'),'-OwnedProcessId',$ownedGame.Id,'-OwnedStartTicks',$record.startTicks,'-SessionDirectory',('"'+$sessionDirectory+'"'),'-LifetimeSeconds',$LifetimeSeconds)
  $watch=Start-Process powershell.exe -ArgumentList $watchArgs -WindowStyle Hidden -PassThru
  Write-Output ($record|ConvertTo-Json)
  Write-Output ('Watchdog PID: '+$watch.Id)
  `;
  fs.writeFileSync(path.join(session, 'launch.ps1'), launch);
  console.log(JSON.stringify({ session, staged, profile, nonce }, null, 2));

}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main();
