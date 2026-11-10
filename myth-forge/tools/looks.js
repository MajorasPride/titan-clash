// node looks.js k1,k2 -> looks/<k>-{toon,blk1,blk2}.png  (game look = low-poly + toon + outlines; block toy big / small)
const H=require('./lib'),fs=require('fs');
(async()=>{fs.mkdirSync('looks',{recursive:true});const {page,errs,close}=await H.open(process.env.SIZE||'pcs');
for(const k of process.argv[2].split(',')){const n0=errs.length;
 await page.evaluate(k=>{window.__fresh(k);window.__def(k);window.__v3.nb();if(!window.__sh){window.__sh=1;const st=document.createElement('style');st.textContent='#sheet,#vtools,#mbar,#tip,#outliner,#fwin,.top ~ button, body > button{display:none!important}';document.head.appendChild(st);}},k);
 const shot=async n=>{await page.evaluate(()=>{window.__v3.look(null,[.8,.25,1],1.8);window.__frames(2);});await page.screenshot({path:`looks/${k}-${n}.png`});};
 await page.evaluate(()=>document.getElementById('bGameLook').click());await shot('a');
 await page.evaluate(()=>document.getElementById('bBlocks').click());await shot('b');
 await page.evaluate(()=>document.getElementById('bBlocks').click());await shot('c');
 const st=await page.evaluate(()=>{const P=window.__v3.P();let tris=0;Object.values(window.__v3.views()).forEach(v=>v.G.traverse(o=>{if(o.isMesh&&o.geometry.attributes.position)tris+=o.geometry.attributes.position.count/3;}));return {fx:P.fx.blocks,tris};});
 console.log(k,JSON.stringify(st),errs.slice(n0));}
await close();H.stop();})();
