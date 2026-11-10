const H=require('./lib');
(async()=>{const {page,errs,close}=await H.open('pcs');const fs=[];
await page.evaluate(()=>{const st=document.createElement('style');st.textContent='#sheet,#vtools,#mbar,#tip,#outliner,#fwin{display:none!important}';document.head.appendChild(st);});
for(const [name,lib,o] of [['row','bs_cube',{n:4,gap:1,curve:0,axis:'x'}],['arc','bs_block',{n:7,gap:1,curve:120,axis:'y'}],['ring','bs_cone_sharp',{n:9,gap:1.6,curve:360,axis:'x'}],['tail','bs_cyl',{n:9,gap:.9,curve:90,grow:.88,axis:'y'}]]){
 const r=await page.evaluate(([lib,o])=>{const A=window.__v3;window.__fresh('none');A.addPart(lib,null,[0,0,0],[0,0,0],1);const pt=A.P().parts[A.P().parts.length-1];A.select(pt.uid);const k=window.MFM.multiply.set({n:0,gap:1,curve:0,twist:0,grow:1,...o});A.select(null);A.nb();A.look(null,[.5,.5,1],1.5);window.__frames(3);return {k,total:A.P().parts.length};},[lib,o]);
 console.log(name,JSON.stringify(r));await page.screenshot({path:`mul-${name}.png`});fs.push(`mul-${name}.png`);}
console.log('errs',errs);await close();H.stop();require('child_process').execSync('T=450 C=4 node mont.js mul.png '+fs.join(' '));})();
