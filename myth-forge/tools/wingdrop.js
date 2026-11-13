// node wingdrop.js -> drops a wing / fin on the BODY (chest) next to each wing bone, prints which bone it went on and if it is mirrored (T031)
const H=require('./lib');(async()=>{const {page,errs,close}=await H.open('pcs');
for (const [k,lib] of [['dragon','tw_wing_bat'],['fish','ks_fin_pectoral'],['kraken','bb_fin'],['moth','mo_wing'],['wasp','kw_insect_wasp'],['angel','kw_feather'],['fish','ks_fin_dorsal']]) {
 const r=await page.evaluate(([k,lib])=>{const V=window.__v3;window.__fresh(k);window.__def(k);const P=V.P();V.removeParts(P.parts.filter(p=>p.fit&&p.fit.kind==='wing'&&/^(wing|fin|hindwing)\./.test(p.bone)));V.mirror(false);
  const trunk=P.bones.find(b=>b[4]==='chest')||P.bones.find(b=>b[4]==='spine');const out=[];
  for(const sx of [1,-1]){const wb=P.bones.find(b=>b[4]==='wingA'&&(sx>0?b[0].endsWith('.L'):b[0].endsWith('.R')));const at=V.bones()[wb[0]].getWorldPosition(new (V.bones()[wb[0]].position.constructor)());at.y+=.3;
   const n0=V.P().parts.length;V.drop(lib,trunk[0],at.toArray());const pt=V.P().parts.slice(n0);out.push(pt.map(p=>p.bone+(p.flip?' flip':'')+' '+p.lib).join('; '));}
  return out;},[k,lib]); console.log(k,lib,JSON.stringify(r));}
console.log('errs',errs);await close();H.stop();})();
