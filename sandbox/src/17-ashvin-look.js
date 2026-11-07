/* =====================================================================
   SANDBOX 15c: THE TWINS' LOOK (Nov 7, 2026). Sandbox only.
   MajorasPride: "Have ice and fire effects for their swings like VALOR does... it doesn't feel cohesive in battle."
   "Zoom out of the lunar eclipse, I can't see it." Sun symbol: his reference picture (a sun with flame rays and a
   face in a triangle-trimmed ring). Ours is our own drawing in that spirit, not a copy of the picture.
   - Painted staff ribbons (both ends of the bow-staff) in the fighting twin's element, with VALOR's ink outline:
     FIRE gold to red, ICE white to icy blue, LIGHTNING yellow with a violet edge (flickers), WATER VALOR's blue.
   - Painted hit splashes and swing arcs in the same style (fire, lightning and the new ICE textures).
   - SOLAR MANDALA's rune is now a sun: wavy flame rays, a ring with a triangle border and a calm face with closed eyes,
     a tilak mark and a curled mustache. It draws itself ray by ray with each air strike, then the face appears.
   - TOTAL ECLIPSE: the camera pulls way back, and a black moon with a glowing blue corona hangs in the sky.
   ===================================================================== */
// painted textures follow the fighting twin's element (ice gets its own textures)
function iceTex(k,base){ const src=base.image, W=src.width||256, H=src.height||256;
 return wfxCanvas((x,w,h)=>{ x.drawImage(src,0,0); const d=x.getImageData(0,0,w,h), p=d.data;
  for(let i=0;i<p.length;i+=4){ if(p[i+3]<8) continue; const [hh,ss,ll]=rgbHsl(p[i]/255,p[i+1]/255,p[i+2]/255); if(ss<.2||hh<.44||hh>.68) continue; const c=hslRgb(.54,.55,Math.min(.95,ll+.2)); p[i]=c[0]*255; p[i+1]=c[1]*255; p[i+2]=c[2]*255; }
  x.putImageData(d,0,0); x.globalCompositeOperation='source-atop'; x.fillStyle='#ffffff';
  for(let n=0;n<6;n++){ const a=rand(20,w-20), b=rand(20,h-20), r=rand(5,10); x.beginPath(); for(let j=0;j<8;j++){ const an=j/8*Math.PI*2, rr=j%2?r*.3:r; x[j?'lineTo':'moveTo'](a+Math.cos(an)*rr,b+Math.sin(an)*rr); } x.closePath(); x.fill(); }   // frost sparkles
  x.globalCompositeOperation='source-over'; },W,H); }
{ const o=wfxTex; wfxTex=function(k){ const f=CTX.f; if(!isAsh(f)) return o(k); const el=ashEl(f); const base=withF(null,()=>o(k)); if(el==='water') return base;
  const key=k+'@'+el; if(!WFX.tex[key]) WFX.tex[key]=el==='ice'?iceTex(k,base):elTex(k,el,base); return WFX.tex[key]; }; }
const ashPaint=(f,fn)=>withF(f,fn);

/* the staff ribbons */
const ATRAIL=new Set(['asLight','asSpin','asSlam','amLight','asTag','amTag','asGrab','asDash']);
const RIB={ fire:{edge:[1,.93,.45],a:[1,.55,.12],b:[.72,.1,.04]}, ice:{edge:[1,1,1],a:[.8,.95,1],b:[.25,.6,.95]},
 lightning:{edge:[.72,.48,1],a:[1,.97,.6],b:[1,.82,.25]}, water:{edge:[1,1,1],a:[.5,.85,1],b:[.07,.36,.86]} };
function staffEnds(f){ const P=f.P, s=isSun(f)?P.ashStaffR:P.ashStaffL; if(!s) return null; if(!s.userData.ends){ s.userData.ends=[grp(0,0,7.6,s),grp(0,0,1.6,s),grp(0,0,-1.6,s),grp(0,0,-7.6,s)]; } return s.userData.ends; }
function ribbonTick(f,dt,on){ const E=staffEnds(f); if(!E) return; const S=f.ashRib||(f.ashRib=[{pts:[]},{pts:[]}]), el=ashEl(f), C=RIB[el]||RIB.water;
 S.forEach((T,ri)=>{ if(on){ const b=V(),t=V(); E[ri?2:1].getWorldPosition(b); E[ri?3:0].getWorldPosition(t); T.pts.push([b,t]); if(T.pts.length>11) T.pts.shift(); }
  else if(T.pts.length) T.pts.splice(0,Math.max(1,Math.ceil(T.pts.length*dt*12)));
  for(const k of ['m','mo']) if(T[k]){ scene.remove(T[k]); T[k].geometry.dispose(); T[k]=null; }
  const n=T.pts.length; if(n<2) return;
  const strip=(grow,colorFn,jit)=>{ const pos=new Float32Array((n-1)*18), col=new Float32Array((n-1)*18);
   for(let i=0;i<n-1;i++){ const q=[T.pts[i],T.pts[i+1]].map(([b,t])=>{ const d=t.clone().sub(b); return [b.clone().addScaledVector(d,-grow),t.clone().addScaledVector(d,grow)]; });
    const [[b0,t0],[b1,t1]]=q, a0=(i+1)/n, a1=(i+2)/n, vs=[b0,t0,b1,t0,t1,b1], al=[[a0,0],[a0,1],[a1,0],[a0,1],[a1,1],[a1,0]];
    vs.forEach((v,j)=>{ pos.set([v.x+(jit?rand(-jit,jit):0),v.y+(jit?rand(-jit,jit):0),v.z+(jit?rand(-jit,jit):0)],i*18+j*3); col.set(colorFn(al[j][0],al[j][1]),i*18+j*3); }); }
   const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); return g; };
  T.ink=T.ink||new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  T.mat=T.mat||new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.95,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  const jit=el==='lightning'?.35:0;
  T.mo=new THREE.Mesh(strip(.08,()=>[.04,.05,.1],jit),T.ink); T.mo.renderOrder=3;
  T.m=new THREE.Mesh(strip(0,(age,edge)=>edge>.55?C.edge:[lerp(C.a[0],C.b[0],age),lerp(C.a[1],C.b[1],age),lerp(C.a[2],C.b[2],age)],jit),T.mat); T.m.renderOrder=4;
  for(const k of ['m','mo']){ T[k].frustumCulled=false; scene.add(T[k]); } }); }
{ const oA=v8Anim; v8Anim=function(f,dt){ oA(f,dt); if(!isAsh(f)||!f.P) return; const a=f.atk, on=!!(a&&ATRAIL.has(a.id)&&a.t>a.dur*.08&&a.t<a.dur*.8); try{ ribbonTick(f,dt,on); }catch(e){ console.error(e); } }; }
// clear the ribbons when a twin swaps (the other hand holds the staff)
{ const o=ashSwapFX; ashSwapFX=function(f){ if(f.ashRib) f.ashRib.forEach(T=>T.pts.length=0); return o(f); }; }

/* painted hits and swing arcs */
{ const o=ashFx; ashFx=function(f,at,n,sp,tw){ const e=ashEl(f,tw), c=ASH.COL[e]; burst(at,c,Math.ceil(n*.5),sp); burst(at,0xffffff,Math.ceil(n/5),sp*.7);
  const keep=f.stIdx; if(tw!=null) f.stIdx=tw; try{ ashPaint(f,()=>wfxHit(at,5+n*.25)); } finally{ f.stIdx=keep; }
  if(e==='lightning'&&Math.random()<.5) zapBolt(at.clone().add(V(rand(-4,4),rand(4,9),rand(-4,4))),at); }; }
const APAINT={
 asSpin(f,a){ if(once(a,'pf',a.hitAt*.9)) ashPaint(f,()=>wfxRing(f.pos.x,f.pos.z,15*f.scale,.45,f.chest().y-6)); },
 asSlam(f,a){ if(once(a,'pf',a.hitAt)){ const x=f.pos.x+Math.sin(f.yaw)*9*f.scale, z=f.pos.z+Math.cos(f.yaw)*9*f.scale; ashPaint(f,()=>{ wfxColumn(x,z,22,4); wfxRing(x,z,12,.5); }); } },
 asLight(f,a){ if((a.chain||0)===2&&once(a,'pf',a.hitAt)) ashPaint(f,()=>wfxArc(f,10,4,0)); },
 amLight(f,a){ if(once(a,'pf',a.hitAt*.9)) ashPaint(f,()=>wfxArc(f,11,(a.chain||0)===2?5:3,0)); },
 amWave(f,a){ if(once(a,'pf',a.hitAt)) ashPaint(f,()=>{ for(let i=1;i<=5;i++){ const p=front(f,i*9); later(i*.06,()=>wfxSprite(i%2?'curl':'curlM',V(p.x,3,p.z),12,.5,{grow:.4})); } }); },
 amSpike(f,a){ if(a.at&&once(a,'pf',a.hitAt)) ashPaint(f,()=>wfxColumn(a.at.x,a.at.z,26,5)); },
 asTag(f,a){ if(once(a,'pf',a.hitAt)) ashPaint(f,()=>wfxRing(f.pos.x,f.pos.z,24,.55)); },
 amTag(f,a){ if(once(a,'pf',a.hitAt)) ashPaint(f,()=>{ wfxRing(f.pos.x,f.pos.z,22,.5); for(let i=0;i<6;i++){ const g=i/6*Math.PI*2; wfxSprite(i%2?'curl':'curlM',V(f.pos.x+Math.cos(g)*12,6,f.pos.z+Math.sin(g)*12),12,.5,{grow:.5}); } }); },
 asDash(f,a,dt){ if(a.t<.35&&Math.random()<dt*20) ashPaint(f,()=>wfxSprite(Math.random()<.5?'curl':'curlM',f.pos.clone().add(V(0,4,0)),9,.4,{grow:.4})); },
};
{ const oUA=FP.updateAtk; FP.updateAtk=function(dt){ const a=this.atk; oUA.call(this,dt); if(!a||this.atk!==a||!isAsh(this)) return; const h=APAINT[a.id]; if(h) try{ h(this,a,dt); }catch(e){ console.error(e); } }; }

/* SOLAR MANDALA: the sun symbol (our own drawing), drawn ray by ray */
function sunCanvasDraw(x,W,prog,el){ const c=W/2, R=W*.5, gold=el==='lightning'?['#fffbe0','#ffe45a','#8a4cff']:['#fff3c4','#ffb347','#c0400e'];
 x.clearRect(0,0,W,W); x.save(); x.translate(c,c); const N=28, shown=Math.round(N*Math.min(1,prog));
 for(let i=0;i<shown;i++){ const a=i/N*Math.PI*2, long=i%2===0, L=R*(long?.96:.78), w=R*(long?.075:.06);    // wavy flame rays
  x.save(); x.rotate(a); x.beginPath(); x.moveTo(-w,-R*.36);
  const S=40, wave=q=>Math.sin(q*Math.PI*2.3+i*1.7)*w*1.3*Math.sin(q*Math.PI*.9+.3), width=q=>w*Math.pow(1-q,.8)*(1+.25*Math.sin(q*Math.PI));   // smooth, tapering flame
  for(let s2=0;s2<=S;s2++){ const q=s2/S, y=-R*.36-(L-R*.36)*q; x.lineTo(-width(q)+wave(q),y); }
  for(let s2=S;s2>=0;s2--){ const q=s2/S, y=-R*.36-(L-R*.36)*q; x.lineTo(width(q)+wave(q),y); }
  x.closePath(); const g=x.createLinearGradient(0,-R*.36,0,-L); g.addColorStop(0,gold[0]); g.addColorStop(.5,gold[1]); g.addColorStop(1,gold[2]); x.fillStyle=g; x.fill(); x.lineWidth=W*.006; x.strokeStyle=INK; x.stroke(); x.restore(); }
 if(prog>=.999){ const rr=R*.36;                                                                                   // the ring with a triangle border
  x.beginPath(); x.arc(0,0,rr,0,7); x.fillStyle=gold[1]; x.fill(); x.lineWidth=W*.012; x.strokeStyle=INK; x.stroke();
  x.beginPath(); x.arc(0,0,rr*.8,0,7); x.fillStyle='#2a1406'; x.fill(); x.lineWidth=W*.006; x.stroke();
  for(let i=0;i<30;i++){ const a=i/30*Math.PI*2; x.save(); x.rotate(a); x.beginPath(); x.moveTo(-rr*.06,-rr*.8); x.lineTo(rr*.06,-rr*.8); x.lineTo(0,-rr*.97); x.closePath(); x.fillStyle=gold[0]; x.fill(); x.restore(); }
  const fr=rr*.74; x.beginPath(); x.arc(0,0,fr,0,7); const fg=x.createRadialGradient(0,-fr*.2,fr*.1,0,0,fr); fg.addColorStop(0,'#ffe9b0'); fg.addColorStop(1,gold[1]); x.fillStyle=fg; x.fill();   // the face
  x.strokeStyle=INK; x.lineWidth=W*.007;
  for(const s of [-1,1]){ x.beginPath(); x.arc(s*fr*.34,-fr*.08,fr*.17,.15*Math.PI,.85*Math.PI); x.stroke();              // calm closed eyes
   x.beginPath(); x.moveTo(s*fr*.16,-fr*.32); x.quadraticCurveTo(s*fr*.34,-fr*.42,s*fr*.54,-fr*.3); x.stroke();          // brows
   x.beginPath(); x.moveTo(0,fr*.3); x.bezierCurveTo(s*fr*.22,fr*.18,s*fr*.42,fr*.34,s*fr*.5,fr*.16); x.bezierCurveTo(s*fr*.56,fr*.08,s*fr*.66,fr*.2,s*fr*.58,fr*.28); x.stroke(); }   // curled mustache
  x.beginPath(); x.moveTo(0,-fr*.12); x.quadraticCurveTo(-fr*.1,fr*.12,0,fr*.18); x.stroke();                            // nose
  x.beginPath(); x.arc(0,fr*.42,fr*.12,.2*Math.PI,.8*Math.PI); x.stroke();                                               // small smile
  x.beginPath(); x.moveTo(0,-fr*.86); x.bezierCurveTo(-fr*.1,-fr*.68,-fr*.06,-fr*.56,0,-fr*.5); x.bezierCurveTo(fr*.06,-fr*.56,fr*.1,-fr*.68,0,-fr*.86);   // tilak mark (flame)
  x.fillStyle='#c0200e'; x.fill(); x.stroke(); x.beginPath(); x.arc(0,-fr*.44,fr*.05,0,7); x.fillStyle='#fff'; x.fill(); }
 x.restore(); }
function sunSymbol(el){ const c=document.createElement('canvas'); c.width=c.height=1024; const t=new THREE.CanvasTexture(c);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(76,76),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,fog:false}));
 const glow=new THREE.Mesh(new THREE.CircleGeometry(40,48),new THREE.MeshBasicMaterial({color:el==='lightning'?0xffe45a:0xffa63a,transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false,side:THREE.DoubleSide}));
 glow.position.z=-.5; const g=new THREE.Group(); g.add(glow); g.add(m); g.userData={c,t,el,prog:-1,parts:[],mat:m.material,glow}; return g; }
function sunDraw(g,prog){ const U=g.userData; if(Math.abs(U.prog-prog)<.001) return; U.prog=prog; sunCanvasDraw(U.c.getContext('2d'),1024,prog,U.el); U.t.needsUpdate=true; }
bigRune=(function(o){ return function(kind,col,R){ if(kind!=='sun') return o(kind,col,R); const f=CINE.f; return sunSymbol(f&&isAsh(f)?ashEl(f,0):'fire'); }; })(bigRune);
runeShow=(function(o){ return function(g,n){ if(!g.userData.c) return o(g,n); if(n>=99) sunDraw(g,1); }; })(runeShow);   // the sun symbol's progress is drawn by the ultMandala wrapper below
runeKill=(function(o){ return function(a,key){ const g=a[key]; if(g&&g.userData.c){ scene.remove(g); g.traverse(m=>{ if(m.geometry) m.geometry.dispose(); if(m.material) m.material.dispose(); }); g.userData.t.dispose(); a[key]=null; return; } return o(a,key); }; })(runeKill);
// the Mandala calls runeShow(rune, partsShown) with parts = strokes; for the sun symbol, map the 8 strikes onto the rays
{ const oM=ultMandala; ultMandala=function(f,a,dt,pm,o){ const r=oM(f,a,dt,pm,o); const g=a.rune; if(g&&g.userData.c){ if(!g.userData.lifted){ g.userData.lifted=1; g.position.y+=30; }   // lift the sun so its face shows above the rival
   const k=a.t-(a.contact||a.t), k1=k-.45, i=Math.floor(k1/.24); if(k1>=0&&k1<8*.24) sunDraw(g,Math.min(1,(i+1)/8)*.999); else if(k1>=8*.24) sunDraw(g,1);
   g.userData.glow.material.opacity=.1+Math.sin(game.time*8)*.04; }
  return r; }; }

/* TOTAL ECLIPSE: a black moon with a glowing corona in the sky, and a camera that pulls way back */
{ const oE=ultEclipse; ultEclipse=function(f,a,dt,pm,o){ const r=oE(f,a,dt,pm,o); if(!a._cut||!a.o0) return r; const k=a.t-a.contact;
  if(!a.moon&&k<3.1){ const g=new THREE.Group(), col=ashCol(f,1);
   const disc=new THREE.Mesh(new THREE.CircleGeometry(16,48),new THREE.MeshBasicMaterial({color:0x000000,fog:false,toneMapped:false}));
   const cor=new THREE.Mesh(new THREE.RingGeometry(16,27,64),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false,side:THREE.DoubleSide}));
   const halo=new THREE.Mesh(new THREE.RingGeometry(16,46,64),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false,side:THREE.DoubleSide}));
   cor.position.z=-.3; halo.position.z=-.6; g.add(halo); g.add(cor); g.add(disc); g.position.set(a.o0.x-a.dv.x*40,150,a.o0.z-a.dv.z*40); scene.add(g); a.moon=g; }
  if(a.moon){ a.moon.lookAt(camera.position); a.moon.children[1].material.opacity=.6+Math.sin(game.time*3)*.15; if(k>3.15){ scene.remove(a.moon); a.moon.traverse(m=>{ if(m.geometry) m.geometry.dispose(); if(m.material) m.material.dispose(); }); a.moon=null; } }
  return r; }; }
{ const o=ashUltCleanup; ashUltCleanup=function(a){ if(a&&a.moon){ scene.remove(a.moon); a.moon=null; } return o(a); }; }
// keep the moon visible while the world is hidden
{ const o=envHide; envHide=function(a){ o(a); if(a.moon) a.moon.visible=true; }; }
{ const oC=cineCam; cineCam=function(){ if(CINE.ash!=='eclipse') return oC(); const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o) return;
  const k=a.t-(a.contact||a.t), dv=a.dv, ds=a.ds, O=a.o0||o.pos, oc=o.chest();
  if(k<.9){ camAt(V(O.x+ds.x*85-dv.x*55,28,O.z+ds.z*85-dv.z*55),V(O.x,14,O.z)); return; }                                       // wide and low: the rune glows, the eclipse above
  if(k<1.5){ if(cineShot(1)) cq.classList.remove('show'); camAt(V(O.x+ds.x*95-dv.x*30,12,O.z+ds.z*95-dv.z*30),V(O.x,o.pos.y*.6+20,O.z)); return; }   // the ice pillar launches them
  if(k<2.3){ cineShot(2); camAt(V(O.x+ds.x*170-dv.x*60,70,O.z+ds.z*170-dv.z*60),V(O.x,(f.pos.y+o.pos.y)/2+14,O.z)); return; }          // very wide: Sun leaps up under the black moon
  if(k<2.65){ cineShot(3); camAt(V(O.x+ds.x*110,o.pos.y+45,O.z+ds.z*110),V(O.x,o.pos.y*.6+6,O.z)); return; }                            // the spike
  cineShot(4); camAt(V(O.x+ds.x*95-dv.x*40,30,O.z+ds.z*95-dv.z*40),V(O.x,6,O.z)); if(k>3.6||!f.atk||f.atk.id!=='ultimate') cineEnd(); }; }
