// PowerShell bridge to the same hash and applicability semantics as Node tools.
import fs from 'node:fs';
import {buildIdentity,assertApplicable} from './evidence-identity.mjs';
try {
  const [action,project,report,owner,namespace,notBefore]=process.argv.slice(2);
  const artifactBuild=buildIdentity(project);
  if(action==='build') console.log(JSON.stringify(artifactBuild));
  else if(action==='cwtools') {
    const record=JSON.parse(fs.readFileSync(report,'utf8').replace(/^\uFEFF/,''));
    assertApplicable(record,{projectPath:project,sourceMod:owner==='null'?null:owner,storageNamespace:namespace,
      artifactBuild,notBefore,evidenceSource:'static',artifactKind:owner==='null'?'untracked':'production'});
    console.log(JSON.stringify(artifactBuild));
  } else throw Error('Unknown evidence bridge operation.');
} catch(error) {console.error(error.message);process.exitCode=2;}
