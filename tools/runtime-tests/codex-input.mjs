// Internal Codex driver. Import only from node_repl; inject its supported sky API.
// No process launch, global input, rewards, desktop coordinates or polling sidecar.
import fs from 'node:fs';
import path from 'node:path';
export function validLease(lease, window, at=Date.now()) {
  const identity=lease?.identity;
  const observed=Date.parse(lease?.observedAtUtc), expires=Date.parse(lease?.expiresAtUtc);
  if(!identity?.pid || !identity.created || !identity.executable || !identity.windowHandle
    || !lease.ready || lease.failed || !Number.isFinite(observed) || !Number.isFinite(expires)
    || at>expires || at<observed || at-observed>5000)
    throw Error('Owned UI identity lease unavailable, expired or failed');
  const normalize=s=>s.replaceAll('\\','/').toLowerCase();
  if(window.id!==identity.windowHandle || normalize(window.app)!==`process:${normalize(identity.executable)}`)
    throw Error('Returned window differs from owned EU4 instance');
  const command=identity.command?.replaceAll('\\','/').toLowerCase() || '';
  const profile=lease.profile.replaceAll('\\','/').toLowerCase();
  const quoted=[`"-userdir=${profile}/"`,`-userdir="${profile}/"`,`"-userdir=${profile}"`,`-userdir="${profile}"`];
  const unquoted=new RegExp(`(?:^|\\s)-userdir=${profile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}/?(?:\\s|$)`);
  if(!quoted.some(s=>command.includes(s)) && !unquoted.test(command))
    throw Error('Owned isolated profile absent from process identity');
  return true;
}
export function createInputDriver(sky, directory) {
  const leaseFile=path.join(directory,'ui-lease.json');
  let state=null, original=null, sequence=0;
  const lease=()=>JSON.parse(fs.readFileSync(leaseFile,'utf8'));
  const verify=(window)=>{
    const current=lease();validLease(current,window);
    const id=current.identity;
    if(original && ['pid','created','executable','windowHandle'].some(k=>original[k]!==id[k]))
      throw Error('Original owned identity changed');
    original ||= id;return current;
  };
  const record=(kind,data)=>fs.appendFileSync(path.join(directory,'ui-actions.jsonl'),JSON.stringify({
    sequence:++sequence,atUtc:new Date().toISOString(),kind,...data})+'\n');
  const freshIdentity=async window=>{
    const current=verify(window);const token=`${Date.now()}-${Math.random()}`;
    fs.writeFileSync(path.join(directory,'ui-check-request.json'),JSON.stringify({token,nonce:current.nonce,
      windowHandle:window.id,identity:original}));
    const responseFile=path.join(directory,'ui-check-response.json');const deadline=Date.now()+8000;
    while(Date.now()<deadline) {
      if(fs.existsSync(responseFile)) {
        let response;try {response=JSON.parse(fs.readFileSync(responseFile,'utf8'));} catch {response=null;}
        if(response?.token===token) {
          const verified=Date.parse(response.verifiedAtUtc), age=Date.now()-verified;
          if(!response.allowed || response.nonce!==current.nonce || !Number.isFinite(verified) || age<0 || age>1500)
            throw Error('Fresh owned-window identity check refused or expired');
          validLease({...current,identity:response.identity},window);record('identity-verified',{token,identity:response.identity});return;
        }
      }
      await new Promise(resolve=>setTimeout(resolve,50));
    }
    throw Error('Harness identity verification timed out; no input sent');
  };
  const driver = {
    async activate() {
      if(!state) throw Error('Observe owned window before activation');
      await freshIdentity(state.window);await sky.activate_window({window:state.window});return this.observe();
    },
    async observe() {
      const current=lease();
      const windows=await sky.list_windows();
      const targets=windows.filter(w=>w.id===current.identity?.windowHandle);
      if(targets.length!==1) throw Error('Owned window not uniquely returned');
      verify(targets[0]);
      state=await sky.get_window_state({window:targets[0],include_screenshot:true,include_text:true});
      verify(state.window);
      const screenshot=state.screenshots[0];
      if(screenshot?.url) fs.writeFileSync(path.join(directory,`ui-${sequence+1}.png`),
        Buffer.from(screenshot.url.split(',')[1],'base64'));
      record('observe',{window:state.window,identity:original,accessibility:state.accessibility,
        screenshots:state.screenshots.map(({url,...metadata})=>metadata)});
      return state;
    },
    async act(action) {
      if(!state) throw Error('Observe and inspect UI before each action');
      const observed=state;state=null;const current=verify(observed.window);
      await freshIdentity(observed.window);
      record('intent',{action,window:observed.window,identity:original,geometry:current.geometry});
      if(action.kind==='key') await sky.press_key({window:observed.window,key:action.key});
      else if(action.kind==='text') {
        // EU4 may have no accessibility focus; the caller must inspect screenshot focus.
        if(action.focusEvidence!=='observed-console' && action.focusEvidence!=='observed-save-name')
          throw Error('Explicit screenshot focus evidence required');
        await sky.type_text({window:observed.window,text:action.text});
      } else if(action.kind==='click') {
        if(!action.inspected || !observed.screenshots[0]?.id) throw Error('Screenshot inspection required');
        await sky.click({window:observed.window,screenshotId:observed.screenshots[0].id,x:action.x,y:action.y});
      } else throw Error('Unsupported owned input');
      record('input-returned',{action});
      return this.observe();
    },
    geometry:()=>lease().geometry,
    async claimMission(mission, evidence) {
      const current=lease();
      const geometry=current.geometries?.[mission] || current.geometry;
      if(mission!==geometry?.mission) throw Error('Unsupported mission identity');
      if(current.mode==='negative') {
        record('claim-refused',{mission,reason:'native unready fixture'});return {refused:true};
      }
      if(current.mode!=='click' || !evidence?.readyInspected || !evidence?.topScroll || !state)
        throw Error('Ready mission view inspection required');
      if(!fs.existsSync(path.join(directory,'before.eu4'))) throw Error('Native ready checkpoint required');
      const shot=state.screenshots[0];
      if(shot?.width!==1282 || shot?.height!==752) throw Error('Unsupported window geometry/DPI');
      const {x,y}=geometry.point;
      // Verified Windows decoration: 1px left, 31px top. GUI point is client-relative.
      return this.act({kind:'click',x:x+1,y:y+31,inspected:true,mission});
    }
  };
  // A rejected action explicitly hands control back to the owned lifecycle; it
  // must not leave the game waiting for a user to fix uncertain input.
  for(const name of ['activate','act','claimMission']) {
    const action=driver[name];
    driver[name]=async(...args)=>{
      try {return await action.apply(driver,args);}
      catch(error) {
        fs.writeFileSync(path.join(directory,'ui-abort.json'),JSON.stringify({atUtc:new Date().toISOString(),reason:error.message}));
        throw error;
      }
    };
  }
  return driver;
}
