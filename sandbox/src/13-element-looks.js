/* =====================================================================
   SANDBOX 14: ELEMENT LOOKS (Nov 7, 2026). Sandbox only, not in the game.
   Picking an element changes the look AND the effect of every move (MajorasPride: "full swap").
   Every element is painted and cel-shaded with ink outlines, like the Demon Slayer game (our own designs).
   - VALOR (home: Water). Fire = flame ribbons with a yellow core, ember bursts, flame curls, fire rings.
     Lightning = jagged bolt ribbons with a purple edge, spark bursts, crackling arcs, static rings.
     His water dragon, giant water shield and every water FX take the element's colors and shapes.
   - INFERNOTH (home: Fire). Water = deep-sea blue to cyan rage glow, boiling water and steam with painted
     wave curls instead of lava, a water-jet heat beam, boiling rain under a storm-green sky.
     Lightning = purple to crackling white rage glow, plasma blobs and scorch pools, lightning breath,
     lightning strikes in LAVA DOMAIN under a black-purple storm.
   Names stay the same in every element. How it works: while a titan acts (CTX.f), every color it uses
   is moved from its home element's colors to the picked element's colors, and the painted water
   textures are redrawn for the element.
   ===================================================================== */
const ELX={cache:new Map()};
const lookRemapOn=f=>!!(f&&homeEl(f)&&lookEl(f)!==homeEl(f));
const _hsl={};
function hslAdj(h,s,l,home,tgt){ const band=home==='water'?(s>.2&&h>=.44&&h<=.68):(s>.3&&(h<=.16||h>=.95)); if(!band) return null;
 const q=clamp((l-.2)/.6,0,1); let H,S,L=l;
 if(tgt==='fire'){ H=lerp(0,.12,q); S=Math.max(s,.85); }
 else if(tgt==='water'){ H=lerp(.63,.53,q); S=Math.max(s,.7); }
 else if(l>.55){ H=.15; S=.95; L=Math.min(.9,l+.1); } else { H=.76; S=.8; }
 return [H,S,L]; }
function hexAdj(hex,home,tgt){ if(home===tgt||hex==null) return hex; const key=hex+'|'+home+'|'+tgt; let v=ELX.cache.get(key); if(v!=null) return v;
 const c=new THREE.Color(hex); c.getHSL(_hsl); const r=hslAdj(_hsl.h,_hsl.s,_hsl.l,home,tgt); v=r?c.setHSL(r[0],r[1],r[2]).getHex():hex; ELX.cache.set(key,v); return v; }
function remapHex(hex){ const f=CTX.f; if(!lookRemapOn(f)||typeof hex!=='number') return hex; return hexAdj(hex,homeEl(f),lookEl(f)); }

/* every color a titan uses while it acts */
{ const o=burst; burst=function(p,c,n,spd){ return o(p,remapHex(c),n,spd); }; }
{ const o=ring; ring=function(x,y,z,r,color,life){ return o(x,y,z,r,remapHex(color),life); }; }
{ const o=pillar; pillar=function(x,z,r,color,life,h){ return o(x,z,r,remapHex(color),life,h); }; }
{ const o=glowM; glowM=function(c,i){ return o(remapHex(c),i); }; }
{ const o=aoe; aoe=function(f,o2,x,z,r,dmg,kb,ln,color,maxY){ return o(f,o2,x,z,r,dmg,kb,ln,remapHex(color),maxY); }; }
{ const o=strike; strike=function(x,z,r,dmg,ln,ow,tg,color,delay,kb){ return o(x,z,r,dmg,ln,ow,tg,remapHex(color),delay,kb); }; }
{ const o=beamColor; beamColor=function(f,c){ return withF(f,()=>o(f,remapHex(c))); }; }
{ const o=spawnProj; spawnProj=function(op){ if(op&&op.color!=null) op.color=remapHex(op.color); return o(op); }; }
{ const o=wave; wave=function(ow,tg,op){ if(op&&op.color!=null) op.color=remapHex(op.color); return o(ow,tg,op); }; }
// meshes made while a titan acts (shots, rocks, walls, the water shield ...) get the element's colors
{ const oAdd=scene.add; scene.add=function(...objs){ const f=CTX.f; if(lookRemapOn(f)){ const h=homeEl(f), t=lookEl(f);
   const one=mt=>{ if(!mt||(mt.userData&&mt.userData.elx)) return mt; const col=mt.color?mt.color.getHex():null, em=mt.emissive?mt.emissive.getHex():null;
    const nc=hexAdj(col,h,t), ne=hexAdj(em,h,t); if(nc===col&&ne===em) return mt; const m2=mt.clone(); if(col!=null) m2.color.setHex(nc); if(em!=null) m2.emissive.setHex(ne); m2.userData=Object.assign({},m2.userData,{elx:1}); return m2; };
   for(const ob of objs) if(ob&&ob.traverse) ob.traverse(m=>{ if(Array.isArray(m.material)) m.material=m.material.map(one); else if(m.material) m.material=one(m.material); }); }
  return oAdd.apply(this,objs); }; }

/* ---------- painted textures for each element ---------- */
const INK='#0b0f1e';
function inkDots(x,list,fills){ x.lineWidth=3; x.strokeStyle=INK; list.forEach(([px,py,r],i)=>{ x.beginPath(); x.arc(px,py,r,0,7); x.fillStyle=fills[i%fills.length]; x.fill(); x.stroke(); }); }
const ELDRAW={
 fire:{
  curl(x){ x.beginPath(); x.moveTo(62,248); x.bezierCurveTo(8,172,74,124,58,58); x.bezierCurveTo(98,98,108,42,150,8); x.bezierCurveTo(148,72,212,92,200,150);
   x.bezierCurveTo(232,132,228,98,226,80); x.bezierCurveTo(262,140,244,222,182,248); x.closePath();
   const g=x.createLinearGradient(0,248,0,8); g.addColorStop(0,'#b81c0c'); g.addColorStop(.45,'#ff6a1a'); g.addColorStop(1,'#ffd34a'); x.fillStyle=g; x.fill(); x.lineWidth=9; x.strokeStyle=INK; x.stroke();
   x.beginPath(); x.moveTo(98,244); x.bezierCurveTo(78,190,120,160,116,118); x.bezierCurveTo(140,150,150,120,162,94); x.bezierCurveTo(172,150,204,172,172,244); x.closePath();
   x.fillStyle='#ffe9a0'; x.fill(); x.lineWidth=4; x.stroke();
   x.strokeStyle='#fff3c4'; x.lineWidth=4; for(const o of [0,22]){ x.beginPath(); x.moveTo(70+o,226); x.bezierCurveTo(56+o,170,96+o,130,90+o*.5,80); x.stroke(); }
   inkDots(x,[[214,40,9],[236,66,6],[190,22,6],[40,40,7],[24,76,5]],['#ffd34a','#ff6a1a']); },
  splash(x){ const c=128; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+.2, L=64+(i%3)*20, s=15+(i%2)*6;
    x.save(); x.translate(c,c); x.rotate(a); x.beginPath(); x.moveTo(16,-s*.6); x.bezierCurveTo(L*.5,-s*1.3,L*.8,-s*.4,L+10,0); x.bezierCurveTo(L*.8,s*.4,L*.5,s*1.3,16,s*.6); x.closePath();
    const g=x.createLinearGradient(16,0,L,0); g.addColorStop(0,'#ffe9a0'); g.addColorStop(.5,'#ff8a2a'); g.addColorStop(1,'#c0200e'); x.fillStyle=g; x.fill(); x.lineWidth=5; x.strokeStyle=INK; x.stroke(); x.restore(); }
   x.beginPath(); x.arc(c,c,24,0,7); x.fillStyle='#fff3c4'; x.fill(); x.lineWidth=5; x.strokeStyle=INK; x.stroke();
   inkDots(x,[[40,50,7],[220,60,6],[200,210,7],[50,200,6]],['#ffd34a','#ff6a1a']); } },
 lightning:{
  curl(x){ const P=[[44,8],[160,8],[118,96],[204,96],[68,250],[108,140],[30,140]];
   x.beginPath(); P.forEach(([px,py],i)=>i?x.lineTo(px,py):x.moveTo(px,py)); x.closePath();
   const g=x.createLinearGradient(0,0,256,256); g.addColorStop(0,'#fffbe0'); g.addColorStop(.5,'#ffe45a'); g.addColorStop(1,'#8a4cff'); x.fillStyle=g; x.fill(); x.lineWidth=9; x.strokeStyle=INK; x.lineJoin='miter'; x.stroke();
   x.beginPath(); x.moveTo(110,20); x.lineTo(80,124); x.lineTo(140,116); x.lineTo(96,212); x.strokeStyle='#ffffff'; x.lineWidth=6; x.stroke();
   x.strokeStyle='#b78cff'; x.lineWidth=4; for(const [a,b,cc,d] of [[200,30,236,10],[216,140,250,170],[20,190,4,226]]){ x.beginPath(); x.moveTo(a,b); x.lineTo((a+cc)/2+8,(b+d)/2-8); x.lineTo(cc,d); x.stroke(); }
   inkDots(x,[[226,46,6],[30,60,5],[190,200,6]],['#fffbe0','#b78cff']); },
  splash(x){ const c=128; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, L=70+(i%2)*30;
    x.save(); x.translate(c,c); x.rotate(a); x.beginPath(); x.moveTo(14,-8); x.lineTo(L*.45,-14); x.lineTo(L*.4,-2); x.lineTo(L,0); x.lineTo(L*.55,6); x.lineTo(L*.6,14); x.lineTo(14,8); x.closePath();
    x.fillStyle=i%2?'#ffe45a':'#fffbe0'; x.fill(); x.lineWidth=5; x.strokeStyle=INK; x.lineJoin='miter'; x.stroke(); x.restore(); }
   x.beginPath(); x.arc(c,c,22,0,7); x.fillStyle='#ffffff'; x.fill(); x.lineWidth=5; x.strokeStyle='#8a4cff'; x.stroke(); } } };
function rgbHsl(r,g,b){ const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; if(mx===mn) return [0,0,l]; const d=mx-mn, s=l>.5?d/(2-mx-mn):d/(mx+mn);
 const h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4); return [h/6,s,l]; }
function hslRgb(h,s,l){ if(!s) return [l,l,l]; const q=l<.5?l*(1+s):l+s-l*s, p=2*l-q, f=t=>{ t=(t+1)%1; return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p; }; return [f(h+1/3),f(h),f(h-1/3)]; }
function elTex(k,el,base){ const src=base.image, W=src.width||256, H=src.height||256, kind=k.replace(/M$/,''), custom=ELDRAW[el]&&ELDRAW[el][kind];
 return wfxCanvas((x,w,h)=>{
  if(custom&&(kind==='curl'||k==='splash')){ if(k==='curlM'){ x.translate(w,0); x.scale(-1,1); } custom(x,w,h); return; }
  x.drawImage(src,0,0); const d=x.getImageData(0,0,w,h), p=d.data;
  for(let i=0;i<p.length;i+=4){ if(p[i+3]<8) continue; const [hh,ss,ll]=rgbHsl(p[i]/255,p[i+1]/255,p[i+2]/255), r=hslAdj(hh,ss,ll,'water',el); if(!r) continue; const c=hslRgb(r[0],r[1],r[2]); p[i]=c[0]*255; p[i+1]=c[1]*255; p[i+2]=c[2]*255; }
  x.putImageData(d,0,0); x.globalCompositeOperation='source-atop';
  if(el==='lightning'){ for(let n=0;n<4;n++){ let px=rand(0,w), py=rand(0,h*.3); const pts=[[px,py]]; for(let j=0;j<6;j++){ px+=rand(-30,30); py+=h/7; pts.push([px,py]); }
    for(const [lw,st] of [[8,INK],[4,'#fffbe0']]){ x.beginPath(); pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b)); x.lineWidth=lw; x.strokeStyle=st; x.stroke(); } } }
  else { x.strokeStyle='#ffe08a'; x.lineWidth=5; for(let n=0;n<7;n++){ const a=rand(0,w), b=rand(h*.2,h); x.beginPath(); x.moveTo(a,b); x.bezierCurveTo(a-10,b-20,a+12,b-30,a,b-48); x.stroke(); } }
  x.globalCompositeOperation='source-over'; },W,H); }
{ const o=wfxTex; wfxTex=function(k){ const f=CTX.f, el=f&&homeEl(f)?lookEl(f):'water'; if(el==='water') return o(k); const key=k+'@'+el; if(!WFX.tex[key]) WFX.tex[key]=elTex(k,el,o(k)); return WFX.tex[key]; }; }

/* VALOR's sword ribbon in the element's colors (lightning flickers and jags) */
{ const o=trailTick; trailTick=function(f,dt,on){ o(f,dt,on); if(!isVal(f)||!lookRemapOn(f)) return; const T=f.v8&&f.v8.trail; if(!T||!T.m) return; const el=lookEl(f), c=new THREE.Color();
  const col=T.m.geometry.getAttribute('color'), a=col.array;
  for(let i=0;i<a.length;i+=3){ if(a[i]>.95&&a[i+1]>.95&&a[i+2]>.95){ const e=el==='fire'?[1,.86,.35]:[.72,.48,1]; a[i]=e[0]; a[i+1]=e[1]; a[i+2]=e[2]; continue; }
   c.setRGB(a[i],a[i+1],a[i+2]); c.setHex(hexAdj(c.getHex(),'water',el)); a[i]=c.r; a[i+1]=c.g; a[i+2]=c.b; }
  col.needsUpdate=true;
  if(el==='lightning'){ const ps=T.m.geometry.getAttribute('position').array; for(let i=0;i<ps.length;i++) ps[i]+=rand(-.35,.35); T.m.geometry.getAttribute('position').needsUpdate=true; } }; }

/* the thrown shield's trail and the discs in the owner's element */
{ const o=v8Discs; v8Discs=function(dt){ const D=V8.discs.find(d=>d.f&&homeEl(d.f)); return D?withF(D.f,()=>o(dt)):o(dt); }; }
wfxTrails=function(dt){ if(game.paused) return; for(const D of V8.discs){ if(!isV(D.f)||D.kind==='portal') continue; D._wt=(D._wt||0)-dt; if(D._wt<=0){ D._wt=.06; withF(D.f,()=>wfxSprite(Math.random()<.5?'curl':'curlM',D.pos.clone(),5,.35,{grow:.3,spin:rand(-3,3)})); } } };

/* body glow (VALOR's light strips, INFERNOTH's glowing plates) take the element's colors */
function lookApply(){ for(const f of [game.p,game.e]){ if(!f||!f.glowMats||!lookRemapOn(f)) continue; const h=homeEl(f), t=lookEl(f);
  for(const m of f.glowMats){ if(m.emissive) m.emissive.setHex(hexAdj(m.emissive.getHex(),h,t)); if(m.color) m.color.setHex(hexAdj(m.color.getHex(),h,t)); } } }

/* ---------- INFERNOTH in Water or Lightning ---------- */
const infOf=()=>[game.p,game.e].find(f=>isInf(f));
{ const o=infTick; infTick=function(dt){ const F=infOf(); withF(F||null,()=>o(dt));
  for(const f of [game.p,game.e]){ if(!isInf(f)||!lookRemapOn(f)||!f._lights) continue; const t=lookEl(f);
   for(const m of f._lights) m.material.color.setHex(hexAdj(m.material.color.getHex(),'fire',t)); } }; }
{ const o=kxTick; kxTick=function(dt){ const F=infOf(); const rem=lookRemapOn(F), t=rem?lookEl(F):null;
  if(rem){ if(KX.round.rain&&!KX.round._elx){ KX.round._elx=1; KX.round.sky=t==='water'?0x1f8a6a:0x3a1466; }
   if(KX.match.sky&&!KX.match._elx){ KX.match._elx=1; KX.match.sky=hexAdj(KX.match.sky,'fire',t); } }
  withF(F||null,()=>o(dt));
  if(rem) for(const P of KX.patches) if(P.pool&&P.m&&P.m.material) P.m.material.color.setHex(hexAdj(P.m.material.color.getHex(),'fire',t)); }; }
// boiling rain splashes / lightning strikes from the sky
{ const o=rockHit; rockHit=function(R){ const F=R.owner&&R.owner.def?R.owner:CTX.f; o(R); if(!lookRemapOn(F)) return; const t=lookEl(F);
  if(t==='lightning') zapBolt(V(R.x+rand(-6,6),130,R.z+rand(-6,6)),V(R.x,0,R.z)); else withF(F,()=>wfxSprite('splash',V(R.x,3,R.z),12,.4,{grow:.6})); }; }
// painted water / bolts on his fountains, pools and beams
{ const o=lavaFountain; lavaFountain=function(x,z,h,n){ o(x,z,h,n); const F=CTX.f; if(!isInf(F)||!lookRemapOn(F)) return;
  if(lookEl(F)==='water') wfxColumn(x,z,h||24,Math.min(4,n||4)); else { if(Math.random()<.35) zapBolt(V(x,.5,z),V(x+rand(-3,3),h||24,z+rand(-3,3))); wfxSprite('splash',V(x,(h||24)*.6,z),8,.35,{grow:.5}); } }; }
{ const o=lavaPool; lavaPool=function(x,z,r,owner,dps,life){ o(x,z,r,owner,dps,life); const F=CTX.f; if(isInf(F)&&lookRemapOn(F)&&r>=5) wfxRing(x,z,r*1.3,.5); }; }
{ const o=kBeamMesh; kBeamMesh=function(a,from,to,w){ o(a,from,to,w); const F=CTX.f; if(isInf(F)&&lookEl(F)==='lightning'&&Math.random()<.35) zapBolt(from,to); }; }
// his hits splash water / crackle in his element
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){ const hp0=this.hp; oTH.call(this,src,dmg,kb,launch,cont,dir);
  if(!cont&&this.hp<hp0&&isInf(src)&&lookRemapOn(src)&&game.time-(src._elxT||0)>.12){ src._elxT=game.time; withF(src,()=>wfxHit(this.chest(),6)); if(lookEl(src)==='lightning'&&!src.beamOn&&game.time-(src._elxZ||0)>.5){ src._elxZ=game.time; zapBolt(src.chest(),this.chest()); } } }; }
