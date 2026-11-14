// kit hitbox + limb damage check: node h.js
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
const page=await (await browser.newContext({viewport:{width:800,height:500},deviceScaleFactor:1})).newPage();const errs=[];page.on('pageerror',e=>errs.push(String(e.message).slice(0,300)));
await page.goto('file:///home/claude/titan-clash/sandbox/titan-clash-sandbox.html');await page.waitForTimeout(2500);const out=[];
const CASES=(process.argv[2]||'valor:infernoth:vslash,infernoth:valor:kclaw,infernoth:ashvin:kbite,infernoth:raikou:ktailwhip,ashvin:ragnavox:asLight,raikou:worldroot:punch,ragnavox:infernoth:kclaw,worldroot:valor:punch').split(',');
for(const cs of CASES){const [me,opp,mv]=cs.split(':');
 for(const [hit,dist] of [[true,8],[false,8]]){
  await page.evaluate(([me,opp,hit])=>{SB.me=me;SB.opp=opp;SB.dummy='stand';KB.hit=hit;KB.lastHit=null;sbStart();},[me,opp,hit]);await page.waitForTimeout(900);
  const r=[];for(let i=0;i<4;i++){ await page.evaluate(([mv,dist])=>{const p=game.p,e=game.e;const d=e.pos.clone().sub(p.pos);d.y=0;d.normalize();p.pos.copy(e.pos).addScaledVector(d,-dist);p.atk=null;p.stun=0;try{p.startAtk(MOVES[mv]?mv:Object.keys(MOVES).find(k=>MOVES[k].anim==='punch'))}catch(x){window.__e=String(x)}},[mv,dist]);await page.waitForTimeout(1300);}
  const s=await page.evaluate(()=>({lost:Math.round(game.e.def.hp-game.e.hp),last:KB.lastHit,dmg:game.e.P._kb&&game.e.P._kb.dmg,stage:game.e.P._kb&&game.e.P._kb.stage,e:window.__e,log:KB.log.slice(-3)}));
  out.push(`${me} ${mv} -> ${opp} | kit boxes ${hit?'ON ':'OFF'} dist ${dist}: lost ${s.lost} hp; ${s.last?'landed on '+s.last.limb+' ('+s.last.part+')':'no box hit'}; limb dmg ${JSON.stringify(s.dmg)} ${s.e||''} ${s.log.join(';')}`);}}
// fight back for a while, every pairing
for(const pr of []){const [me,opp]=pr.split(':');
 await page.evaluate(([me,opp])=>{SB.me=me;SB.opp=opp;SB.dummy='fight';KB.hit=true;sbStart();const p=game.p,e=game.e;p.pos.copy(e.pos).add(new THREE.Vector3(0,0,-9));},[me,opp]);
 for(let i=0;i<5;i++){await page.evaluate(()=>{try{const p=game.p;if(!p.atk){const ks=Object.keys(MOVES);p.startAtk(ks.find(k=>MOVES[k].anim==='punch'))}}catch(x){}});await page.waitForTimeout(1100);}
 const s=await page.evaluate(()=>({p:Math.round(game.p.hp),e:Math.round(game.e.hp),pd:game.p.P._kb.dmg,ed:game.e.P._kb.dmg,st:[game.p.P._kb.stage,game.e.P._kb.stage]}));out.push(`fight ${pr}: hp ${s.p}/${s.e}; limb dmg you ${JSON.stringify(s.pd)} rival ${JSON.stringify(s.ed)} stages ${JSON.stringify(s.st)}`);}
// switch off: old bodies come back
const off=await page.evaluate(()=>{KB.on=false;SB.me='valor';SB.opp='infernoth';sbStart();const r=[!!game.p.P._kb,!!game.e.P._kb];KB.on=true;sbStart();return r.concat([!!game.p.P._kb,!!game.e.P._kb,document.querySelectorAll('#sbMenu [data-kb]').length])});
out.push('KIT BODIES off -> kit on p/e: '+off.slice(0,2)+'; on again: '+off.slice(2,4)+'; menu buttons: '+off[4]);
console.log(out.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,8)));await browser.close();})();
