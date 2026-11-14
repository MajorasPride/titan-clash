// quick smoke check: node sandbox/tools/smoke_test.js [file.html] [shot.png] ["js to run after start"]
// loads the sandbox, starts a fight, lets it run, prints page errors and an optional eval result, saves a screenshot.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const path=require('path');
(async()=>{
 const file=path.resolve(process.argv[2]||path.join(__dirname,'..','titan-clash-sandbox.html'));
 const shot=process.argv[3]||'', js=process.argv[4]||'';
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const page=await (await browser.newContext({viewport:{width:960,height:540},deviceScaleFactor:1})).newPage();
 const errs=[]; page.on('pageerror',e=>errs.push(String(e.message).slice(0,300))); page.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text().slice(0,200)); });
 await page.goto('file://'+file); await page.waitForTimeout(2500);
 await page.evaluate(()=>{ try{ SB.me='valor'; SB.opp='infernoth'; SB.dummy='fight'; sbStart(); }catch(e){ window.__se=String(e); } });
 await page.waitForTimeout(2500);
 let res=null; if(js){ try{ res=await page.evaluate(js); }catch(e){ res='EVAL ERROR '+e.message; } await page.waitForTimeout(1500); }
 const st=await page.evaluate(()=>({mode:game.mode,state:game.state,p:game.p&&Math.round(game.p.hp),e:game.e&&Math.round(game.e.hp),se:window.__se||''}));
 if(shot) await page.screenshot({path:shot});
 console.log('state',JSON.stringify(st)); if(js) console.log('result',typeof res==='string'?res:JSON.stringify(res));
 console.log('page errors',JSON.stringify(errs.slice(0,10)));
 await browser.close(); })();
