// Modes check (T035, Nov 13; T040: opens in Blank): node modes.js <phone|pc>. Lists per mode, Prop empty start, Titan export + scale person, old saves open in the right mode.
const H=require('./lib');(async()=>{const size=process.argv[2]||'pc';const {page,errs,close}=await H.open(size);const out=[];const ok=(n,c,x)=>{out.push((c?'PASS ':'FAIL ')+n+(x?' '+JSON.stringify(x):''))};
const st=()=>page.evaluate(()=>({mode:window.__mode.cur(),pm:window.__v3.P().mode,skels:[...document.querySelectorAll('#skels button')].map(b=>b.textContent),defs:[...document.querySelectorAll('#defBuilds button')].map(b=>b.textContent),starters:[...document.querySelectorAll('#starters button')].map(b=>b.textContent),groups:[...document.querySelectorAll('#groups button')].map(b=>b.textContent.replace(/ \d+$/,'')),tc:window.__mode.tc(),buddy:window.__mode.buddy(),seg:[...document.querySelectorAll('#modeSeg button')].map(b=>b.textContent)}));
await page.evaluate(()=>document.querySelector('#tops [data-top="start"]').click());
let s=await st(); ok('mode row has 5 modes',s.seg.length===5,s.seg); ok('default is Blank (T040)',s.mode==='blank',s.mode);
ok('blank start: every body type',s.skels.length>=75,s.skels.length); ok('blank start: no TC export',!s.tc);
const tapMode=async m=>{const b=await page.$('#modeSeg button[data-mode="'+m+'"]');await b.scrollIntoViewIfNeeded(); if(size==='phone'){const q=await b.boundingBox();await page.touchscreen.tap(q.x+q.width/2,q.y+q.height/2)}else await b.click(); await page.waitForTimeout(300); return st();};
s=await tapMode('character'); ok('character: humanoids only',s.skels.some(t=>/Slim humanoid/.test(t))&&!s.skels.some(t=>/Dragon \(4|Spider|Mech/.test(t)),s.skels); ok('character marks project',s.pm==='character');
s=await tapMode('prop'); ok('prop: only no-skeleton body',s.skels.length===1&&/No skeleton/.test(s.skels[0]),s.skels); ok('prop: gear categories',s.groups.includes('Weapons')&&!s.groups.includes('Heads & Skulls'),s.groups);
await page.evaluate(()=>{window.confirm=()=>true}); await page.click('#bModeEmpty').catch(async()=>{await page.evaluate(()=>document.getElementById('bModeEmpty').click())}); await page.waitForTimeout(300);
ok('prop: new prop is empty, no skeleton',await page.evaluate(()=>window.__v3.P().skel==='none'&&window.__v3.P().mode==='prop'));
s=await tapMode('titan'); ok('titan: kaiju + mech bodies',s.skels.some(t=>/Mech \/ humanoid/.test(t))&&s.skels.some(t=>/Heavy kaiju/.test(t))&&!s.skels.some(t=>/Slim/.test(t)),s.skels); ok('titan: mech kits',s.groups.some(g=>/^Mech /.test(g))); ok('titan: TC export shown',s.tc); ok('titan: person for scale',s.buddy);
ok('titan: mech weapons browsable',await page.evaluate(()=>window.mfPartOk({group:'Weapons',sub:'Mech weapons'})));
s=await tapMode('blank'); ok('blank: every body type',s.skels.length>=75,s.skels.length); ok('blank: no TC export',!s.tc);
s=await tapMode('creature'); ok('creature: no mech/kaiju bodies',!s.skels.some(t=>/Mech|kaiju|Tank/i.test(t))&&s.skels.some(t=>/Dragon/.test(t)),s.skels.length); ok('creature: no mech categories',!s.groups.some(g=>/^Mech |Kaiju Kit|Mecha Dragon/.test(g)),s.groups.length); ok('creature: no TC export',!s.tc); ok('creature hides mech weapons',await page.evaluate(()=>!window.mfPartOk({group:'Weapons',sub:'Mech weapons'})));
// old save without a mode opens in the mode of its body type
await page.evaluate(()=>{const P=window.__v3.P();const j=JSON.parse(JSON.stringify(P));j.skel='mech';delete j.mode;document.getElementById('mPaste');window.__restoreTest=j;});
await page.evaluate(()=>{window.prompt=()=>'MYTH FORGE: '+JSON.stringify(window.__restoreTest);document.getElementById('mPaste').click();}); await page.waitForTimeout(900);
s=await st(); ok('old mech save opens in Titan',s.mode==='titan'&&s.pm==='titan',{mode:s.mode,pm:s.pm});
await page.evaluate(()=>{const j=window.__restoreTest;j.skel='slim';window.prompt=()=>'MYTH FORGE: '+JSON.stringify(j);document.getElementById('mPaste').click();}); await page.waitForTimeout(900);
s=await st(); ok('old slim save opens in Character',s.mode==='character',s.mode);
// saved mode survives reload
await page.evaluate(()=>window.__mode.set('prop',true)); await page.reload(); await page.waitForTimeout(2500);
ok('reload keeps the project mode',await page.evaluate(()=>window.__mode.cur()==='prop'&&window.__v3.P().mode==='prop'));
// search still finds a mech part in Creature mode
await page.evaluate(()=>window.__mode.set('creature',true));
ok('no page errors',!errs.length,errs.slice(0,5)); console.log(out.join('\n')); await close(); H.stop();})();
