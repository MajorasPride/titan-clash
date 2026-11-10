const H=require('./lib');
(async()=>{const {page,errs,close}=await H.open('phone');
await page.evaluate(()=>{window.__fresh('dragon');window.__def('dragon');window.__frames(3);});
const r=await page.evaluate(()=>{const P=window.__v3.P(),n0=P.parts.length;document.querySelector('.tabs [data-tab="edit"]').click();const row=document.querySelector('#p-edit .row');const btns=[...row.querySelectorAll('button')].map(b=>b.textContent);
 const w=P.parts.filter(p=>/kw_|wing/.test(p.lib)).slice(0,2);w.forEach(p=>window.MFM.mark.toggle(p.uid));const vis=[...row.querySelectorAll('button')].filter(b=>b.style.display!=='none').map(b=>b.textContent);
 [...row.querySelectorAll('button')].find(b=>/Bigger/.test(b.textContent)).click();const s1=w.map(p=>p.s);
 [...row.querySelectorAll('button')].find(b=>/Delete/.test(b.textContent)).click();const n1=window.__v3.P().parts.length;
 document.getElementById('bUndo').click();const n2=window.__v3.P().parts.length;
 document.querySelector('.tabs [data-tab="sculpt"]').click();const srow=[...document.querySelectorAll('#p-sculpt .row')][0];
 return {n0,n1,n2,btns,vis,s1,sbtns:[...srow.querySelectorAll('button')].map(b=>b.textContent)};});
console.log(JSON.stringify(r));
// sculpt jump: mark two limb parts, tap on model
await page.evaluate(()=>{window.MFM.setUp(false);const P=window.__v3.P();P.parts.slice(0,6).forEach(p=>window.MFM.mark.toggle(p.uid));window.__frames(3);});
await page.touchscreen.tap(206,400);await page.evaluate(()=>window.__frames(2));await page.screenshot({path:'mk.png'});
console.log('errs',errs);await close();H.stop();})();
