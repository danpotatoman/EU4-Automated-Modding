import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { main as collect } from '../../test-runs/collector.mjs';
const root = process.cwd();
const nonce = crypto.randomBytes(8).toString('hex');
const dir = path.join(root, 'tools/runtime-tests/work', `run-file_${nonce}`);
const staged = path.join(dir, 'brittany_runtime');
const profile = path.join(dir, 'profile');
const logs = path.join(profile, 'logs');
const game = 'X:/eu4-game';
const normal = 'X:/eu4-user-data';
const slash = s => s.replaceAll('\\', '/');
const launcher = JSON.parse(fs.readFileSync(path.join(normal, 'dlc_load.json'), 'utf8'));
if (launcher.enabled_mods.length !== 1 || launcher.enabled_mods[0] !== 'mod/brittany_missions_dev.mod' || launcher.disabled_dlcs.length) throw Error('Launcher differs');
if (execFileSync('powershell.exe', ['-NoProfile','-Command','@(Get-Process eu4 -ErrorAction SilentlyContinue).Count'], {encoding:'utf8',windowsHide:true}).trim() !== '0') throw Error('EU4 already running');
fs.mkdirSync(logs, {recursive:true});
fs.cpSync(path.join(root,'mod/brittany_missions'), staged, {recursive:true});
fs.mkdirSync(path.join(profile,'mod'), {recursive:true});
const descriptor = `name="Brittany Runtime Run Probe"\npath="${slash(staged)}"\nsupported_version="1.37.*"\n`;
fs.writeFileSync(path.join(profile,'mod/runtime_test.mod'), descriptor);
fs.writeFileSync(path.join(staged,'descriptor.mod'), descriptor.replace(/^path=.*\n/m,''));
fs.writeFileSync(path.join(profile,'dlc_load.json'), JSON.stringify({enabled_mods:['mod/runtime_test.mod'],disabled_dlcs:[]}));
fs.copyFileSync(path.join(normal,'settings.txt'),path.join(profile,'settings.txt'));
const body = location => `log = "EU4RUN ${nonce} BEGIN simple ${location}"
if = { limit = { tag = BRI } log = "EU4RUN ${nonce} OK implicit-bri" }
else = { log = "EU4RUN ${nonce} FAIL implicit-bri" }
BRI = {
    add_prestige = -1000
    add_prestige = 100
    export_to_variable = { which = eu4rt_run_prestige value = prestige }
    if = { limit = { check_variable = { which = eu4rt_run_prestige value = 0 } NOT = { check_variable = { which = eu4rt_run_prestige value = 0.001 } } } log = "EU4RUN ${nonce} OK prestige-before-zero" }
    else = { log = "EU4RUN ${nonce} FAIL prestige-before-zero" }
    set_country_flag = eu4rt_run_simple_${nonce}
    add_prestige = 7
    export_to_variable = { which = eu4rt_run_prestige value = prestige }
    if = { limit = { has_country_flag = eu4rt_run_simple_${nonce} check_variable = { which = eu4rt_run_prestige value = 7 } NOT = { check_variable = { which = eu4rt_run_prestige value = 7.001 } } } log = "EU4RUN ${nonce} OK flag-and-prestige-seven" }
    else = { log = "EU4RUN ${nonce} FAIL flag-and-prestige-seven" }
}
log = "EU4RUN ${nonce} END simple"
`;
const file = `eu4rt_simple_${nonce}.txt`;
fs.writeFileSync(path.join(profile,file),body('profile-root'));
fs.writeFileSync(path.join(staged,file),body('mod-root'));
fs.mkdirSync(path.join(staged,'common/on_actions'),{recursive:true});
const dlcs = [...fs.readFileSync(path.join(root,'docs/testing/environment.md'),'utf8').matchAll(/^  - (.+)$/gm)].map(m=>m[1].trim());
if(dlcs.length!==18) throw Error('DLC count');
const assertions = dlcs.map((dlc,i)=>`if = { limit = { has_dlc = "${dlc}" } log = "EU4RUN ${nonce} OK dlc-${i+1}" } else = { log = "EU4RUN ${nonce} FAIL dlc-${i+1}" }`).join('\n');
fs.writeFileSync(path.join(staged,'common/on_actions/zz_runtime_test.txt'), `on_startup = { if = { limit = { tag = BRI } log = "EU4RUN ${nonce} READY simple" ${assertions} } }\n`);
fs.mkdirSync(path.join(staged,'common/scripted_effects'),{recursive:true});
fs.writeFileSync(path.join(staged,'common/scripted_effects/eu4rt_static_wrapper.txt'), `eu4rt_static_wrapper_${nonce} = {\n${body('static-wrapper-never-called')}\n}\n`);
const commands = 'eu4rt_run.commands';
for(const base of [profile,staged]) fs.writeFileSync(path.join(base,commands), `run ${file}\r\n`);
const report = {nonce,dir,file,command:`run ${file}`,launcher,dlcs,status:'prepared',missionBehaviorPass:false,manual:[],launchArgs:['-debug',`-userdir=${slash(profile)}/`,'-start_tag=BRI',`-auto_run=${commands}`]};
const save=()=>fs.writeFileSync(path.join(dir,'result.json'),JSON.stringify(report,null,2));
save(); console.log(`PREPARED ${dir}\nCOMMAND ${report.command}`);
const validation = spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(root,'tools/validate-cwtools.ps1'),'-Project',staged],{cwd:root,windowsHide:true,stdio:'inherit'});
const code=await new Promise((resolve,reject)=>{validation.once('exit',resolve);validation.once('error',reject)});
fs.copyFileSync(path.join(root,'tools/cwtools/reports/brittany_runtime/latest.json'),path.join(dir,'cwtools-staged.json'));
if(code!==0) throw Error(`CWTools ${code}`);
let child,run;
try {
 run=collect(['begin','--mod','brittany_runtime','--scenario',`run-file simple ${nonce}`,'--logs',logs,'--untracked']);
 report.collectorRun=run;
 child=spawn(path.join(game,'eu4.exe'),report.launchArgs,{cwd:game,windowsHide:false,stdio:['ignore','pipe','pipe']});
 child.stdout.pipe(fs.createWriteStream(path.join(dir,'stdout.txt')));child.stderr.pipe(fs.createWriteStream(path.join(dir,'stderr.txt')));
 report.pid=child.pid;report.status='running';report.startedAtUtc=new Date().toISOString();save();console.log(`LAUNCHED ${child.pid}`);
 const deadline=Date.now()+600000;
 let announced=false,lastProgress=0;
 while(Date.now()<deadline && child.exitCode===null){
  const text=fs.existsSync(path.join(logs,'game.log'))?fs.readFileSync(path.join(logs,'game.log'),'utf8'):'';
  const markers=text.split(/\r?\n/).filter(s=>s.includes(`EU4RUN ${nonce} `));report.markers=markers;
  if(text.includes(`EU4RUN ${nonce} END simple`)) {report.status=markers.some(s=>s.includes(' FAIL '))?'fail':'simple-evidence-reached';report.runningVersion=text.match(/Game Version: (.+)/)?.[1]?.trim();save();break;}
  if(!announced && text.includes(`EU4RUN ${nonce} READY simple`)){announced=true;report.status='ready-for-run-command';save();console.log(`READY: ${report.command}`);}
  if(Date.now()-lastProgress>20000){save();console.log(`WAIT ${report.status}`);lastProgress=Date.now();}
  await new Promise(resolve=>setTimeout(resolve,1000));
 }
}catch(error){report.error=error.message;report.status='infrastructure-error'}
finally{
 if(child?.pid && child.exitCode===null) report.cleanup=execFileSync('powershell.exe',['-NoProfile','-Command',`$ownedProbe = Get-Process -Id ${child.pid}; $requestedClose = $ownedProbe.CloseMainWindow(); if($ownedProbe.WaitForExit(5000)) {'window-close'} else {Stop-Process -Id ${child.pid} -Force; 'forced-after-close-timeout'}`],{encoding:'utf8',windowsHide:true}).trim();
 if(run) report.logCapture=collect(['finish','--mod','brittany_runtime','--run',run.id,'--outcome','not-completed','--notes',`Diagnostic ${report.status}; mission completion remains unverified.`]);
 report.finishedAtUtc=new Date().toISOString();save();console.log(`RESULT ${report.status} ${dir}`);
}
