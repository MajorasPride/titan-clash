// weather check: node sandbox/tools/weather_test.js outdir  -> one screenshot per weather + errors + stats
const {chromium}=require('/opt/npm-tools/node_modules/playwright'); const path=require('path');
(async()=>{ const out=process.argv[2]||'.'; const kinds=(process.argv[3]||'clear,rain,storm,fog,snow,blizzard,sand,heat,typhoon,ash,ember,chorus,haze').split(',');
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
 const page=await (await browser.newContext({viewport:{width:960,height:540},deviceScaleFactor:1})).newPage(); const errs=[]; page.on('pageerror',e=>errs.push(String(e.message).slice(0,300)));
 await page.goto('file://'+path.resolve(__dirname,'..','titan-clash-sandbox.html')); await page.waitForTimeout(2500);
 await page.evaluate(()=>{ SB.me='valor'; SB.opp='infernoth'; SB.dummy='stand'; sbStart(); }); await page.waitForTimeout(1500);
 for(const k of kinds){ const r=await page.evaluate(k=>{ WTH.kind=k; WTH.mode='fixed'; wfxApply(k); return 1; },k); await page.waitForTimeout(2200);
  if(k==='storm'||k==='chorus') await page.evaluate(()=>wfxBolt(WTH.cur==='chorus')); await page.waitForTimeout(120);
  const st=await page.evaluate(()=>({cur:WTH.cur,fogK:DIS.fogK.toFixed(2),wind:DIS.windK.toFixed(2),slip:DIS.slip,rain:wfxRain.visible,fl:wfxFl.m.visible,mist:wfxMist.m.visible,spl:wfxSpl.list.filter(o=>o.life>0).length,refl:wfxRefs.filter(m=>m.visible).length,lensOff:WX._cl===1,err:WTH._err||0}));
  await page.screenshot({path:path.join(out,'wx-'+k+'.png')}); console.log(k,JSON.stringify(st)); }
 // fx kit + time of day
 for(const v of ['fire','water','ice','lightning','grass','dark','sound','beam','circle']){ await page.evaluate(v=>wfxTest(v),v); await page.waitForTimeout(v==='circle'?600:150); if(v==='fire'||v==='lightning'||v==='circle'||v==='beam') await page.screenshot({path:path.join(out,'fx-'+v+'.png')}); }
 await page.evaluate(()=>{ WTH.tod='dusk'; wfxApply('rain'); }); await page.waitForTimeout(800); await page.screenshot({path:path.join(out,'wx-dusk.png')});
 // menu
 const menu=await page.evaluate(()=>{ sbBase.menuOpen(true); sbSync&&sbSync(); return document.querySelectorAll('#sbMenu [data-wfx]').length; }); await page.waitForTimeout(300); await page.screenshot({path:path.join(out,'menu.png')});
 // a real fight with hits for a few seconds (fx on hits, trails)
 await page.evaluate(()=>{ sbBase.menuOpen(false); SB.dummy='fight'; WTH.tod='night'; sbStart(); }); for(let i=0;i<6;i++){ await page.evaluate(()=>{ const p=game.p,e=game.e; const d=e.pos.clone().sub(p.pos); d.y=0; d.normalize(); p.pos.copy(e.pos).addScaledVector(d,-8); p.atk=null; p.stun=0; try{ p.startAtk('vslash'); }catch(x){} }); await page.waitForTimeout(500); }
 const fight=await page.evaluate(()=>({e:Math.round(game.e.hp),fx:wfxFxP.list.filter(o=>o.life>0).length,trail:[...wfxTr.values()].some(t=>t.s.length>0)||wfxTr.size}));
 console.log('menu buttons',menu,'fight',JSON.stringify(fight)); console.log('page errors',JSON.stringify(errs.slice(0,8))); await browser.close(); })();
