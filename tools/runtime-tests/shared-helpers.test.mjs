import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {canonical,unique} from './script-ast.mjs';
import {missionGeometry} from './mission-geometry.mjs';
import {block} from './save-blocks.mjs';
import {inspectProtocol} from './protocol.mjs';
test('shared AST helpers preserve order, recurse and reject ambiguous definitions',()=>{
  const node={key:'one',op:'=',value:[{key:'two',op:'=',value:[],line:2}],line:1};
  assert.deepEqual(canonical([node]),[{key:'one',op:'=',value:[{key:'two',op:'=',value:[]}]}]);
  assert.equal(unique([node],'two'),node.value[0]);assert.throws(()=>unique([node,node],'two'));
  assert.throws(()=>unique([{key:'scalar',op:'=',value:'yes'}],'scalar'));
});
test('save block helper respects quoted/comment braces and rejects incomplete blocks',()=>{
  const text='x={ a="}" # }\n child={ a=1 } } trailing';
  assert.equal(block(text,/x=\{/),text.slice(0,text.indexOf(' trailing')));
  assert.throws(()=>block('x={',/x=\{/),/Unclosed/);assert.throws(()=>block('y={}',/x=\{/),/Missing/);
});
test('geometry requires a source mission identity and derives each owner from the shared fixture',()=>{
  const game=fileURLToPath(new URL('./fixtures/geometry/',import.meta.url));
  assert.throws(()=>missionGeometry('mod/brittany_missions',game),/Explicit mission/);
  assert.equal(missionGeometry('mod/brittany_missions',game,'bri_nantes_market').mission,'bri_nantes_market');
  assert.deepEqual(missionGeometry('mod/american_century',game,'amc_federal_compact').point,{x:270,y:464});
});
test('protocol rejects missing/duplicate/failed/wrong-date/wrong-version markers and permits declared alternatives',()=>{
  const expected=['BEGIN example','OK check',['OBS value true','OBS value false'],'END example'];
  const text='Game Version: test\n'+['BEGIN example','OK check','OBS value false','END example'].map(m=>`EVENT [1444.11.11]:EU4RT n ${m}`).join('\n');
  const judge=t=>inspectProtocol(t,'n',['check'],expected,{expectedVersion:'test'}).transcriptPass;
  assert.equal(judge(text),true);
  for(const wrong of [text.replace('OK check','FAIL check'),text+'\nEVENT [1444.11.11]:EU4RT n OK check',text.replace('1444.11.11','1444.11.12'),text.replace('Version: test','Version: wrong'),text.replace('OBS value false','OBS value unknown')])assert.equal(judge(wrong),false);
});
