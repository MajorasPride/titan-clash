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
function sunCanvasDraw(x,W,prog,el){ const c=W/2, R=W*.5, lit=el==='lightning', glowA=lit?'255,240,170':'255,228,160', inkC='#0b0806', pale=lit?'#e6dcff':'#e8d9b8';
 x.clearRect(0,0,W,W); x.save(); x.translate(c,c);
 // glowing sunburst behind everything, with fine radial lines (the inked look)
 const bg=x.createRadialGradient(0,0,R*.2,0,0,R); bg.addColorStop(0,`rgba(${glowA},1)`); bg.addColorStop(.55,`rgba(${glowA},.85)`); bg.addColorStop(1,`rgba(${glowA},0)`);
 x.beginPath(); x.arc(0,0,R,0,7); x.fillStyle=bg; x.fill();
 x.strokeStyle='rgba(60,40,20,.18)'; x.lineWidth=W*.0015; for(let i=0;i<180;i++){ const a=i/180*Math.PI*2; x.beginPath(); x.moveTo(Math.cos(a)*R*.38,Math.sin(a)*R*.38); x.lineTo(Math.cos(a)*R*.97,Math.sin(a)*R*.97); x.stroke(); }
 // black flame rays, drawn in as the strikes land
 const N=36, shown=Math.round(N*Math.min(1,prog));
 for(let i=0;i<shown;i++){ const a=i/N*Math.PI*2+(i%2?.04:0), long=i%2===0, L=R*(long?.95:.74), w=R*(long?.055:.042);
  x.save(); x.rotate(a); const S=48, base=R*.37, wave=q=>Math.sin(q*Math.PI*2.6+i*2.1)*w*1.5*Math.sin(q*Math.PI*.95), width=q=>w*Math.pow(1-q,.9)*(1+.35*Math.sin(q*Math.PI*.8));
  x.beginPath(); for(let s2=0;s2<=S;s2++){ const q=s2/S; x.lineTo(-width(q)+wave(q),-base-(L-base)*q); } for(let s2=S;s2>=0;s2--){ const q=s2/S; x.lineTo(width(q)+wave(q),-base-(L-base)*q); }
  x.closePath(); x.fillStyle=inkC; x.fill(); x.restore(); }
 if(prog>=.999){ const rr=R*.38;
  // dark ring with a white triangle border
  x.beginPath(); x.arc(0,0,rr,0,7); x.fillStyle=inkC; x.fill();
  for(let i=0;i<34;i++){ const a=i/34*Math.PI*2; x.save(); x.rotate(a); x.beginPath(); x.moveTo(-rr*.055,-rr*.84); x.lineTo(rr*.055,-rr*.84); x.lineTo(0,-rr*.95); x.closePath(); x.fillStyle=pale; x.fill(); x.restore(); }
  x.beginPath(); x.arc(0,0,rr*.97,0,7); x.strokeStyle=pale; x.lineWidth=W*.003; x.stroke(); x.beginPath(); x.arc(0,0,rr*.82,0,7); x.stroke();
  // the face: dark, drawn in pale strokes
  const fr=rr*.8; x.save(); x.beginPath(); x.arc(0,0,fr,0,7); x.clip(); const fg=x.createRadialGradient(0,-fr*.2,fr*.1,0,0,fr); fg.addColorStop(0,'#3a2a1c'); fg.addColorStop(1,'#120c08'); x.fillStyle=fg; x.fillRect(-fr,-fr,fr*2,fr*2);
  x.strokeStyle=pale; x.lineCap='round'; x.lineJoin='round';
  for(let k=0;k<26;k++){ const hx=(k/25-.5)*fr*1.6; x.beginPath(); x.moveTo(hx*.9,-fr); x.quadraticCurveTo(hx*1.05,-fr*.78,hx*1.15,-fr*.55-Math.abs(hx)*.4); x.lineWidth=W*.0018; x.globalAlpha=.55; x.stroke(); }   // hair swept back
  x.globalAlpha=1;
  for(const sd of [-1,1]){
   x.beginPath(); x.moveTo(sd*fr*.06,-fr*.2); x.bezierCurveTo(sd*fr*.2,-fr*.32,sd*fr*.42,-fr*.3,sd*fr*.6,-fr*.2); x.lineWidth=W*.007; x.stroke();          // heavy stern brows
   for(let k=0;k<5;k++){ x.beginPath(); x.moveTo(sd*fr*(.12+k*.09),-fr*.24-k*fr*.012); x.lineTo(sd*fr*(.16+k*.09),-fr*.3-k*fr*.012); x.lineWidth=W*.002; x.stroke(); }   // brow hair
   x.beginPath(); x.moveTo(sd*fr*.14,-fr*.1); x.quadraticCurveTo(sd*fr*.3,-fr*.19,sd*fr*.48,-fr*.11); x.quadraticCurveTo(sd*fr*.31,-fr*.02,sd*fr*.14,-fr*.1); x.closePath();   // glowing white eyes
   x.save(); x.shadowColor='#ffffff'; x.shadowBlur=W*.03; x.fillStyle='#ffffff'; x.fill(); x.fill(); x.restore();
   x.beginPath(); x.moveTo(sd*fr*.2,fr*.0); x.quadraticCurveTo(sd*fr*.32,fr*.06,sd*fr*.44,fr*.0); x.lineWidth=W*.002; x.stroke();                                    // under-eye lines
   x.beginPath(); x.moveTo(sd*fr*.52,-fr*.08); x.quadraticCurveTo(sd*fr*.56,fr*.12,sd*fr*.5,fr*.26); x.lineWidth=W*.002; x.stroke();                                 // cheekbones
   for(let k=0;k<7;k++){ x.beginPath(); x.moveTo(sd*fr*.04,fr*.24+k*fr*.012); x.bezierCurveTo(sd*fr*(.2+k*.03),fr*(.2+k*.02),sd*fr*(.4+k*.03),fr*(.3+k*.02),sd*fr*(.56+k*.02),fr*(.5+k*.05)); x.lineWidth=W*.0028; x.stroke(); } }   // sweeping mustache
  x.beginPath(); x.moveTo(-fr*.04,-fr*.12); x.lineTo(-fr*.07,fr*.14); x.quadraticCurveTo(0,fr*.2,fr*.07,fr*.14); x.lineTo(fr*.04,-fr*.12); x.lineWidth=W*.003; x.stroke();   // nose
  for(let k=0;k<30;k++){ const bx=(k/29-.5)*fr*.9, L=fr*(.45+(1-Math.abs(k/29-.5)*2)*.35); x.beginPath(); x.moveTo(bx,fr*.32);                                     // long flowing beard
   x.bezierCurveTo(bx+Math.sin(k)*fr*.06,fr*.32+L*.35,bx-Math.cos(k)*fr*.06,fr*.32+L*.7,bx*1.1+Math.sin(k*1.3)*fr*.04,fr*.32+L); x.lineWidth=W*.0022; x.globalAlpha=.85; x.stroke(); }
  x.globalAlpha=1;
  for(const fy of [-.4,-.47,-.54]){ x.beginPath(); x.moveTo(-fr*.22,fr*fy); x.quadraticCurveTo(0,fr*(fy-.04),fr*.22,fr*fy); x.lineWidth=W*.002; x.stroke(); }   // forehead creases
  x.save(); x.translate(0,-fr*.6); x.shadowColor='#ffffff'; x.shadowBlur=W*.04; x.beginPath(); for(let k=0;k<8;k++){ const an=k/8*Math.PI*2-Math.PI/2, r=k%2?fr*.03:fr*.12; x.lineTo(Math.cos(an)*r,Math.sin(an)*r); } x.closePath(); x.fillStyle='#ffffff'; x.fill(); x.fill(); x.restore();   // the third eye: a white star
  for(let k=0;k<900;k++){ const a=rand(0,7), r=Math.sqrt(Math.random())*fr; x.fillStyle=Math.random()<.5?'rgba(255,240,210,.12)':'rgba(0,0,0,.25)'; x.fillRect(Math.cos(a)*r,Math.sin(a)*r,W*.002,W*.002); }   // grit
  x.restore(); }
 for(let k=0;k<1400;k++){ const a=rand(0,7), r=R*(.38+Math.random()*.6); x.fillStyle=Math.random()<.6?'rgba(20,12,6,.18)':'rgba(255,245,220,.2)'; x.fillRect(Math.cos(a)*r,Math.sin(a)*r,W*.0022,W*.0022); }   // grit on the flames
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
