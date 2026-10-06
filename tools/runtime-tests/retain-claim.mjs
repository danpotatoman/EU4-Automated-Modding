// Retain local evidence for review; public exports need path/ownership sanitization.
import fs from 'node:fs';
import path from 'node:path';
const [directory,label]=process.argv.slice(2);
if(!directory || !/^[a-z-]+$/.test(label||'')) throw Error('Use run-directory and evidence-label');
const root=path.resolve('.local/evidence/runtime-mission-claim',label);
const report=JSON.parse(fs.readFileSync(path.join(directory,'result.json'),'utf8'));
if(report.test!=='nantes-claim' && report.test!=='all') throw Error('Unrecognized claim evidence run');
fs.mkdirSync(root,{recursive:true});
const copy=(source,name=path.basename(source))=>{if(fs.existsSync(source)) fs.copyFileSync(source,path.join(root,name));};
for(const name of ['result.json','cwtools-production.json','cwtools-staged.json']) copy(path.join(directory,name));
const attempt=path.join(directory,'attempts',String(report.attempts.at(-1).number));
for(const name of fs.readdirSync(attempt)) if(/^(before|after)-.*\.txt$|^save-check\.json$|^ui-.*\.(json|jsonl|png)$/.test(name)) copy(path.join(attempt,name));
for(const name of ['game.log','error.log','setup_error.log','system.log']) copy(path.join(attempt,'profile/logs',name));
for(const name of ['eu4claim_before.txt','eu4claim_after.txt','eu4claim_scripted.txt','eu4rt_run.commands','settings.txt','dlc_load.json'])
  copy(path.join(attempt,'profile',name));
console.log(root);
