const H=require('./lib');
(async()=>{const {page,errs,close}=await H.open('pcs');const fs=[];
await page.evaluate(()=>{const st=document.createElement('style');st.textContent='#sheet,#vtools,#mbar,#tip,#outliner,#fwin{display:none!important}';document.head.appendChild(st);});
for(const k of ['shadowmist','shadowsolid','spiritlight','soulfire','phantom','starveil','dreammist','holylight','abysssmoke','wisp','SHADOW']){
 await page.evaluate(k=>{window.__fresh('dragon');window.__def('dragon');window.__v3.nb();if(k==='SHADOW'){window.V3.shadowAll();}else{window.__v3.P().parts.forEach(p=>{p.matAll=k;p.mat=null;});window.V3.shadowAll();window.V3.shadowAll();}
  window.__v3.look(null,[1,.25,.8],1.7);window.__frames(3);},k);
 await page.screenshot({path:`eth-${k}.png`});fs.push(`eth-${k}.png`);}
console.log('errs',errs);await close();H.stop();require('child_process').execSync('T=400 C=4 node mont.js eth.png '+fs.join(' '));})();
