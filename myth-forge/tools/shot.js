// node shot.js "k:style:dx,dy,dz:zoom:libRegex" ...   -> close/<k>-<i>.png ; libRegex frames only those parts
const H=require('./lib'),fs=require('fs');
(async()=>{fs.mkdirSync('close',{recursive:true});const {page,errs,close}=await H.open(process.env.SIZE||'pcs');let last=null,i=0;
for(const a of process.argv.slice(2)){const [k,style,dir,zoom,re]=a.split(':');
 if(last!==k+style){await page.evaluate(([k,style])=>{window.__fresh(k);window.__def(k,style||undefined);window.__v3.nb();if(!window.__sh){window.__sh=1;const st=document.createElement('style');st.textContent='#sheet,#vtools,#mbar,#tip,#outliner,#fwin,.top ~ button, body > button{display:none!important}';document.head.appendChild(st);}},[k,style]);last=k+style;}
 await page.evaluate(([dir,zoom,re])=>{const us=re?window.__v3.P().parts.filter(p=>new RegExp(re).test(p.lib+' '+p.bone)).map(p=>p.uid):null;window.__v3.look(us,dir.split(',').map(Number),+zoom||1.9);window.__frames(2);},[dir||'1,.25,.8',zoom,re]);
 await page.screenshot({path:`close/${k}-${i++}.png`});}
if(errs.length)console.log(errs);await close();H.stop();})();
