// close-up views of both fighters: node v.js me:opp[,me:opp] -> <id>.png (front-quarter + back-quarter + side)
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
const page=await (await browser.newContext({viewport:{width:900,height:600},deviceScaleFactor:1})).newPage();const errs=[];page.on('pageerror',e=>errs.push(String(e.message).slice(0,300)));
await page.goto('file:///home/claude/titan-clash/sandbox/titan-clash-sandbox.html');await page.waitForTimeout(2500);
for(const pr of (process.argv[2]||'valor:infernoth').split(',')){const [me,opp]=pr.split(':');
 await page.evaluate(([me,opp])=>{SB.me=me;SB.opp=opp;sbStart();},[me,opp]);await page.waitForTimeout(1500);
 console.log('pre',JSON.stringify(errs.slice(-3)),JSON.stringify(await page.evaluate(()=>({log:KB.log.slice(-4),p:!!game.p,e:!!game.e}))));const shots=await page.evaluate(()=>{const out={};const cam=new THREE.PerspectiveCamera(32,1,.5,2000);const old=renderer.getSize(new THREE.Vector2());
  for(const k of ['p','e']){const f=game[k];const c=new THREE.Vector3();f.root.getWorldPosition(c);const fw=new THREE.Vector3(0,0,1).applyQuaternion(f.root.getWorldQuaternion(new THREE.Quaternion()));const rt=new THREE.Vector3(fw.z,0,-fw.x);
   const h=11*f.scale;out[f.def.id]=[[1,.7],[-1,.7],[.05,-1],[0,1]].map(([a,bq])=>{cam.position.copy(c).addScaledVector(fw,bq*46*f.scale).addScaledVector(rt,a*30*f.scale);cam.position.y=h*1.25;cam.lookAt(c.x,h*.72,c.z);cam.updateProjectionMatrix();renderer.render(scene,cam);return renderer.domElement.toDataURL('image/jpeg',.85)});
   out[f.def.id+'_info']={kb:!!(f.P&&f.P._kb),S:f.P._kb&&f.P._kb.S,log:KB.log.slice(-5)};}
  return out});
 for(const [id,v] of Object.entries(shots)){ if(Array.isArray(v)) v.forEach((d,i)=>fs.writeFileSync(`${id}-${i}.jpg`,Buffer.from(d.split(',')[1],'base64'))); else console.log(id,JSON.stringify(v)); }}
console.log('errs',JSON.stringify(errs.slice(0,6)));await browser.close();})();
