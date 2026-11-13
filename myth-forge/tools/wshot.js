// (T031) // node wshot.js out "k:lib" ...  -> default build, wings swapped for lib dropped by hand on L then on R (one part each); front / back-top views
const H=require('./lib'),fs=require('fs');
(async()=>{const out=process.argv[2];fs.mkdirSync(out,{recursive:true});const {page,errs,close}=await H.open('pcs');const files=[];
for(const a of process.argv.slice(3)){const [k,lib]=a.split(':');
 await page.evaluate(([k,lib])=>{const V=window.__v3;window.__fresh(k);window.__def(k);V.nb();if(!window.__sh){window.__sh=1;const st=document.createElement('style');st.textContent='#sheet,#vtools,#mbar,#tip,#outliner,#fwin,.top ~ button, body > button{display:none!important}';document.head.appendChild(st);}
  if(lib&&lib!=='def'){const P=V.P();const w=P.parts.filter(p=>/^(wing|fin|hindwing)\.(L|R)$/.test(p.bone));V.removeParts(w);V.mirror(false);
   const wb=V.P().bones.filter(b=>b[4]==='wingA').map(b=>b[0]);const tr=(V.P().bones.find(b=>b[4]==='chest')||V.P().bones.find(b=>b[4]==='spine'))[0];wb.forEach(b=>{const at=V.bones()[b].getWorldPosition(new (V.bones()[b].position.constructor)());V.drop(lib,tr,at.toArray());});}
  window.__frames(1);},[k,lib]);
 for(const [i,dir] of [[0,'0,.15,1'],[1,'-.6,.9,-.6']]){await page.evaluate(d=>{window.__v3.look(null,d.split(',').map(Number),1.7);window.__frames(2);},dir);const f=`${out}/${k}-${lib}-${i}.png`;await page.screenshot({path:f});files.push(f);}}
if(errs.length)console.log(errs.slice(0,5));fs.writeFileSync(out+'/list.txt',files.join(' '));await close();H.stop();})();
