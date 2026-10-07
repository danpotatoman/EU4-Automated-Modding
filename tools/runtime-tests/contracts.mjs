// Explicit source ownership. Importing/listing contracts never reads game config.
import * as brittany from './contracts/brittany_missions/index.mjs';
import * as american from './contracts/american_century/index.mjs';
export const owners = Object.freeze({ brittany_missions: brittany, american_century: american });
export const commonErrorIdentifiers = ['zz_runtime_test','zz_runtime_mission','eu4rt_','prepare_ready','after_console'];
// Preserve the old combined error guard; narrowing it is not this ownership refactor.
const legacyErrorIdentifiers = [...commonErrorIdentifiers, ...brittany.errorIdentifiers, ...american.errorIdentifiers];
export const errorPattern = new RegExp(legacyErrorIdentifiers.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'i');
export function listContracts(mod) {
  if(mod && !Object.hasOwn(owners,mod)) throw Error(`Unknown runtime owner: ${mod}`);
  return Object.values(mod ? {[mod]:owners[mod]} : owners).flatMap(adapter => [
    ...(adapter.requiredRegression.length ? [{owner:adapter.owner,test:'all',members:[...adapter.requiredRegression],modes:['click'],layers:['LOGIC','EFFECT','WIRING'],options:['prepareOnly','inlineBaseline','negativeControl','exerciseTermination','exerciseCrash','exerciseFreeze']}] : []),
    ...Object.values(adapter.definitions).map(({owner,test,modes,layers,suiteMembership,startConditions,options,modeCoverage})=>({owner,test,modes,layers,suiteMembership,startConditions,options,modeCoverage})),
  ]);
}
export function resolveContract({mod,test='preview-gate',claimMode='click',prepareOnly=false,inlineBaseline=false,negativeControl=false,
  exerciseTermination=false,exerciseCrash=false,exerciseFreeze=false,timeout=120,retries=1,progressTimeout=30}={}) {
  const legacy=!mod;
  const owner=mod || (test==='usa-slice'?'american_century':'brittany_missions');
  if(!Object.hasOwn(owners,owner))throw Error(`Unknown runtime owner: ${owner}`);
  const adapter=owners[owner];
  if(test==='all' && !adapter.requiredRegression.length)throw Error(`${owner} has no all regression suite; select its named contract (usa-slice).`);
  const members=test==='all'?[...adapter.requiredRegression]:[test];
  const definitions=members.map(id=>{const contract=adapter.definitions[id];if(!contract)throw Error(`Unknown owner/test pair: ${owner}/${id}`);return contract;});
  for(const d of definitions)if(!d.modes.includes(claimMode))throw Error(`Mode ${claimMode} unsupported for ${owner}/${test}; allowed: ${d.modes.join(', ')}`);
  if(!Number.isInteger(timeout)||timeout<30||timeout>1800)throw Error('Timeout must be 30..1800 seconds.');
  if(!Number.isInteger(retries)||retries<0||retries>2||!Number.isInteger(progressTimeout)||progressTimeout<5||progressTimeout>1800)throw Error('Retries must be 0..2 and progress timeout 5..1800 seconds.');
  if([exerciseTermination,exerciseCrash,exerciseFreeze].filter(Boolean).length>1)throw Error('Choose one recovery exercise.');
  if((inlineBaseline||negativeControl)&&test!=='all'||inlineBaseline&&negativeControl)throw Error('Comparison/negative-control modes require all and cannot be combined.');
  if(exerciseFreeze&&(test!=='all'||prepareOnly||inlineBaseline||negativeControl))throw Error('Freeze diagnostic requires a normal native all suite.');
  return {owner,adapter,test,members,definitions,legacy,claimMode,prepareOnly,inlineBaseline,negativeControl,
    exerciseTermination,exerciseCrash,exerciseFreeze,timeout,retries,progressTimeout};
}
export function parseArguments(args) {
  const values={'--mod':'mod','--test':'test','--claim-mode':'claimMode','--timeout':'timeout','--retries':'retries','--progress-timeout':'progressTimeout'};
  const switches={'--list-tests':'listTests','--prepare-only':'prepareOnly','--inline-baseline':'inlineBaseline','--negative-control':'negativeControl',
    '--exercise-terminate-first':'exerciseTermination','--exercise-native-crash':'exerciseCrash','--exercise-freeze-first':'exerciseFreeze'};
  const result={};
  for(let i=0;i<args.length;i++) {
    const key=args[i];
    if(Object.hasOwn(switches,key))result[switches[key]]=true;
    else if(Object.hasOwn(values,key)) {
      if(!args[i+1]||args[i+1].startsWith('--'))throw Error(`Missing value for ${key}`);
      const name=values[key],value=args[++i];result[name]=['timeout','retries','progressTimeout'].includes(name)?Number(value):value;
    } else throw Error(`Unknown runtime argument: ${key}`);
  }
  if(result.listTests) {
    // Listing validates owner and flags but never invokes preparation/evaluation.
    if(Object.keys(result).some(k=>!['listTests','mod'].includes(k)))throw Error('ListTests accepts only an optional Mod filter.');
    return {listTests:true,contracts:listContracts(result.mod)};
  }
  return resolveContract(result);
}
