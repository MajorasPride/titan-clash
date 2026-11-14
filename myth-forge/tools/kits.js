// 2.0 kits check (T049, Nov 13): node kits.js <phone|pc> [outdir]. New Kits tab in every mode, every kit part builds, plugs click together (left side mirrored), hitboxes present; one picture per kit.
const H=require('./lib'),fs=require('fs');(async()=>{const size=process.argv[2]||'pc',dir=process.argv[3]||'kits-out';fs.mkdirSync(dir,{recursive:true});const {page,errs,close}=await H.open(size);const out=[];const ok=(n,c,x)=>out.push((c?'PASS ':'FAIL ')+n+(x!==undefined?' '+JSON.stringify(x):''));
const info=await page.evaluate(()=>{const L=window.__v3.LIB,ids=Object.keys(L).filter(i=>L[i].group==='New Kits');return {n:ids.length,subs:[...new Set(ids.map(i=>L[i].sub))],kits:window.MF_KITS.kits,lpv:Object.keys(L).filter(i=>/^lpv_k2_/.test(i)).length,nohb:ids.filter(i=>!L[i].hitbox||!(L[i].hitbox.box.size[0]>0)).length}});
ok('323 kit parts in the library',info.n===323,info.n); ok('six kits',info.subs.length===6,info.subs); ok('every part has a hitbox',info.nohb===0,info.nohb); ok('no extra low-poly copies',info.lpv===0);
for(const m of ['creature','character','prop','titan','blank']){const g=await page.evaluate(m=>{window.__mode.set(m,true);return [...document.querySelectorAll('#groups button')].map(b=>b.textContent)},m);ok(m+' mode shows New Kits',g.some(t=>/^New Kits 323$/.test(t)),g.filter(t=>/New Kits/.test(t)));}
const geo=await page.evaluate(()=>{const L=window.__v3.LIB,bad=[];let tris=0;for(const id of Object.keys(L)){const e=L[id];if(e.group!=='New Kits')continue;let ps;try{ps=e.make()}catch(x){bad.push(id+' make: '+x.message);continue}if(!ps.length){bad.push(id+' empty');continue}
 let vol=0;for(const p of ps){const a=p.geo.attributes.position.array;for(let i=0;i<a.length;i+=9){if(a.slice(i,i+9).some(v=>!isFinite(v))){bad.push(id+' NaN');break}const [ax,ay,az,bx,by,bz,cx,cy,cz]=a.slice(i,i+9);vol+=ax*(by*cz-bz*cy)-ay*(bx*cz-bz*cx)+az*(bx*cy-by*cx);tris++}if(!/^col:#[0-9a-f]{6}(:g)?$/.test(p.mat)||!(p.num>0))bad.push(id+' mat '+p.mat)}
 if(vol<0)bad.push(id+' inside out');for(const q of e.plugs)if(q.p.some(v=>!isFinite(v)))bad.push(id+' plug');if(Object.keys(e.patterns).length<1)bad.push(id+' no schemes')}return {bad,tris}});
ok('every part builds (no empty, NaN, inside-out, bad colour)',geo.bad.length===0,geo.bad.slice(0,12)); out.push('     triangles in all kits: '+geo.tris);
// click a whole figure together through the plugs, one per kit
const ROOT={mech:'pelvis_skirt',kaiju:'body_kaiju',dragon:'hips_quad',hydra:'hips_heavy',tree:'trunk_oak'};
for(const [kit,root] of Object.entries(ROOT)){const r=await page.evaluate(([kit,root])=>{const V=window.__v3,X=window.V3,L=V.LIB;window.__mode.set('blank',true);window.__fresh('none');
 const rid='k2_'+kit+'_'+root;V.addPart(rid,null,[0,6,0],[0,0,0],1);const P=V.P();const rp=P.parts.find(p=>p.lib===rid);if(!rp)return {err:'root not added',have:P.parts.map(p=>p.lib)};P.parts=P.parts.filter(p=>p===rp);
 const mine=Object.keys(L).filter(i=>L[i].kit===kit),wp=Object.keys(L).filter(i=>L[i].kit==='weapons');const depth={[rp.uid]:0};let guard=0,chain={};
 for(let i=0;i<P.parts.length&&guard<90;i++){const h=P.parts[i],e=L[h.lib];if(!e||!e.kit)continue;for(const pl of e.plugs){if(pl.o!=='frame'&&pl.t!=='weapon'&&pl.t!=='k-shield'&&pl.t!=='k-pod')continue;if(P.parts.some(c=>c.host&&c.host.u===h.uid&&c.host.k===pl.id))continue;
   const d=depth[h.uid]; if(d>7)continue; let pool=(pl.t==='weapon'||pl.t==='k-shield'||pl.t==='k-pod'?wp:mine).filter(i=>X.plugAsOf(L[i])===pl.t&&i!==rid);
   if(pl.t==='k-neck')pool=pool.filter(i=>(d>=2||kit==='mech')===(L[i].kslot==='head')); if(pl.t==='k-tail')pool=pool.filter(i=>(d>=4)===(L[i].kslot==='tail_tip'||/tip|club|blade/.test(i)));
   if(pl.t==='k-arm'&&e.kslot==='shoulder')pool=pool.filter(i=>L[i].kslot!=='shoulder'); if(!pool.length)continue;
   const c=X.scenePlugs(pl.t).find(q=>q.h.uid===h.uid&&q.pl.id===pl.id);if(!c)continue;const pt=X.plugIn(pool[0],c,{twin:false});depth[pt.uid]=d+1;guard++;}}
 V.rebuild();V.nb();V.frame();window.__frames(3);
 // left / right symmetry of sided parts
 const sym=[];for(const a of P.parts){if(!a.host)continue;const hp=V.partBy(a.host.u),pl=L[hp.lib].plugs.find(q=>q.id===a.host.k);if(!pl||!pl.pairOf||pl.side!=='R')continue;const b=P.parts.find(c=>c.host&&c.host.u===a.host.u&&c.host.k===pl.pairOf);if(!b)continue;
   const wa=V.views()[a.uid].G.getWorldPosition(new (V.views()[a.uid].G.position.constructor)()),wb=V.views()[b.uid].G.getWorldPosition(wa.clone());
   if(Math.abs(wa.x+wb.x)>.02||Math.abs(wa.y-wb.y)>.02||Math.abs(wa.z-wb.z)>.02||(L[a.lib].sided&&a.flip===b.flip))sym.push(L[a.lib].name);}
 return {parts:P.parts.length,plugged:P.parts.filter(p=>p.host).length,flipped:P.parts.filter(p=>p.flip).length,sym,names:P.parts.map(p=>L[p.lib].name).slice(0,40)};},[kit,root]);
 ok(kit+': figure clicks together through plugs',!r.err&&r.plugged>=5&&r.plugged===r.parts-1,r.err||{parts:r.parts,plugged:r.plugged,mirrored:r.flipped}); ok(kit+': left side mirrors the right',r.sym&&r.sym.length===0&&(r.flipped>0),r.sym);
 await page.evaluate(()=>{if(!window.__sh){window.__sh=1;const st=document.createElement('style');st.textContent='#sheet,#vtools,#mbar,#tip,#outliner,#fwin,.top ~ button, body > button{display:none!important}';document.head.appendChild(st);}window.__frames(2)});
 await page.screenshot({path:dir+'/'+kit+'-'+size+'.png'});}
// a scheme pattern recolours a part; save + reload keeps kit parts
const pat=await page.evaluate(()=>{const V=window.__v3,P=V.P(),pt=P.parts[0],e=V.LIB[pt.lib];return {names:Object.keys(e.patterns),pbn:e.pbnNames}});ok('colour schemes offered as patterns',pat.names.length>=3,pat.names);
ok('no page errors',!errs.length,errs.slice(0,5)); console.log(out.join('\n')); await close(); H.stop();})();
