/* =====================================================================
   SANDBOX TEST 7: PAINTED WATER (Okami ink + Demon Slayer flow) for VALOR (Nov 6, 2026)
   MajorasPride picked "both": flowing water ribbons with black ink outlines, in the style of
   Japanese woodblock waves. Every VALOR move now looks like a water move:
   - Sword swings leave a painted water ribbon (deep blue body, white foam edge, ink outline).
   - Hits throw painted wave curls and ink-outlined splashes.
   - Tide Hook = an arc of curling waves. Leg Sweep / Shield Dive = a painted wave ring on the ground.
   - Geyser Uppercut = a column of curling waves. Shield Throw / Follow Dash / Charging Star leave a water trail.
   - KO Star Punch = a big wave burst.
   Only VALOR for now. If it's a keeper, every element gets its own painted look later.
   ===================================================================== */
const WFX={list:[],tex:{}};
function wfxCanvas(draw,w,h){ const c=document.createElement('canvas'); c.width=w||256; c.height=h||256; const x=c.getContext('2d'); x.lineJoin='round'; x.lineCap='round'; draw(x,c.width,c.height); const t=new THREE.CanvasTexture(c); if(THREE.sRGBEncoding) t.encoding=THREE.sRGBEncoding; t.needsUpdate=true; return t; }
function wfxBlue(x,y0,y1){ const g=x.createLinearGradient(0,y0,0,y1); g.addColorStop(0,'#7fd8ff'); g.addColorStop(.45,'#2f8ff0'); g.addColorStop(1,'#123f9e'); return g; }
// a woodblock wave curl: body rises, crests, and curls down into a spiral with foam
function drawCurl(x,mirror){ if(mirror){ x.translate(256,0); x.scale(-1,1); }
 x.beginPath(); x.moveTo(18,246); x.bezierCurveTo(26,150,92,58,172,50); x.bezierCurveTo(236,44,252,116,206,138); x.bezierCurveTo(172,154,154,118,184,108);
 x.bezierCurveTo(202,103,208,126,194,130); x.bezierCurveTo(150,136,122,176,112,246); x.closePath();
 x.fillStyle=wfxBlue(x,50,246); x.fill(); x.lineWidth=9; x.strokeStyle='#0b0f1e'; x.stroke();
 // inner flow lines (Demon Slayer style)
 x.strokeStyle='#9fe3ff'; x.lineWidth=5; for(const o of [0,26,52]){ x.beginPath(); x.moveTo(46+o*.6,236); x.bezierCurveTo(56+o,170,100+o*.4,104+o*.5,160,86+o*.6); x.stroke(); }
 // foam crest
 x.strokeStyle='#ffffff'; x.lineWidth=8; x.beginPath(); x.moveTo(70,140); x.bezierCurveTo(96,90,140,62,176,62); x.bezierCurveTo(214,62,232,92,214,118); x.stroke();
 x.lineWidth=3; x.strokeStyle='#0b0f1e'; x.fillStyle='#fff';
 for(const [px,py,r] of [[226,74,9],[240,98,7],[212,46,6],[244,60,5],[198,30,4]]){ x.beginPath(); x.arc(px,py,r,0,7); x.fill(); x.stroke(); } }
// a ring of curling crests (for the ground)
function drawRing(x){ const c=128; x.beginPath(); x.arc(c,c,118,0,7); x.arc(c,c,84,0,7,true); x.fillStyle='#2f8ff0'; x.fill('evenodd');
 x.lineWidth=6; x.strokeStyle='#0b0f1e'; x.beginPath(); x.arc(c,c,118,0,7); x.stroke(); x.beginPath(); x.arc(c,c,84,0,7); x.stroke();
 x.strokeStyle='#9fe3ff'; x.lineWidth=4; x.beginPath(); x.arc(c,c,100,0,7); x.stroke();
 for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, ox=c+Math.cos(a)*112, oy=c+Math.sin(a)*112, t=a+Math.PI/2;
  x.save(); x.translate(ox,oy); x.rotate(t); x.beginPath(); x.moveTo(-16,4); x.bezierCurveTo(-12,-16,10,-20,16,-6); x.bezierCurveTo(18,4,6,8,4,-2);
  x.fillStyle='#ffffff'; x.fill(); x.lineWidth=4; x.strokeStyle='#0b0f1e'; x.stroke(); x.restore(); } }
// ink-outlined splash drops
function drawSplash(x){ const c=128; for(let i=0;i<7;i++){ const a=i/7*Math.PI*2+.3, L=60+(i%3)*22, s=14+(i%2)*6;
  x.save(); x.translate(c,c); x.rotate(a); x.beginPath(); x.moveTo(18,0); x.quadraticCurveTo(L*.6,-s,L,0); x.quadraticCurveTo(L*.6,s,18,0);
  x.fillStyle=i%2?'#7fd8ff':'#2f8ff0'; x.fill(); x.lineWidth=5; x.strokeStyle='#0b0f1e'; x.stroke();
  x.beginPath(); x.arc(L+12,0,s*.45,0,7); x.fillStyle='#ffffff'; x.fill(); x.lineWidth=3; x.stroke(); x.restore(); }
 x.beginPath(); x.arc(c,c,22,0,7); x.fillStyle='#ffffff'; x.fill(); x.lineWidth=5; x.strokeStyle='#0b0f1e'; x.stroke(); }
function wfxTex(k){ if(!WFX.tex[k]) WFX.tex[k]=k==='curl'?wfxCanvas(x=>drawCurl(x,false)):k==='curlM'?wfxCanvas(x=>drawCurl(x,true)):k==='ring'?wfxCanvas(drawRing):wfxCanvas(drawSplash); return WFX.tex[k]; }

/* sprites that grow and fade */
function wfxSprite(k,pos,size,life,o){ o=o||{}; const m=new THREE.SpriteMaterial({map:wfxTex(k),transparent:true,depthWrite:false,depthTest:!o.top,fog:false,toneMapped:false,rotation:o.rot||0});
 const s=new THREE.Sprite(m); s.position.copy(pos); s.scale.setScalar(size*.6); s.renderOrder=5; scene.add(s);
 WFX.list.push({o:s,m,t:0,life,size,grow:o.grow??.6,vel:o.vel||null,spin:o.spin||0}); return s; }
function wfxRing(x,z,r,life,y){ const m=new THREE.MeshBasicMaterial({map:wfxTex('ring'),transparent:true,depthWrite:false,fog:false,toneMapped:false,side:THREE.DoubleSide});
 const g=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m); g.rotation.x=-Math.PI/2; g.position.set(x,(y||0)+.4,z); g.scale.setScalar(r*.3); g.renderOrder=4; scene.add(g);
 WFX.list.push({o:g,m,t:0,life,size:r,grow:1,ring:1,geo:g.geometry}); }
function wfxTick(dt){ if(game.paused) return; for(let i=WFX.list.length-1;i>=0;i--){ const E=WFX.list[i]; E.t+=dt; const p=E.t/E.life;
  if(p>=1){ scene.remove(E.o); E.m.dispose(); if(E.geo) E.geo.dispose(); WFX.list.splice(i,1); continue; }
  const sc=E.ring?E.size*(.3+.7*ez(Math.min(1,p*1.6))):E.size*(.6+E.grow*ez(Math.min(1,p*1.8)));
  E.o.scale.set(sc,sc,sc); E.m.opacity=p<.65?1:1-(p-.65)/.35; if(E.vel) E.o.position.addScaledVector(E.vel,dt); if(E.spin) E.m.rotation+=E.spin*dt; } }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ wfxTick(dt); wfxTrails(dt); }catch(e){ console.error(e); } }; }
{ const oR=sbReset; sbReset=function(){ for(const E of WFX.list){ scene.remove(E.o); E.m.dispose(); } WFX.list.length=0; oR(); }; }

/* helpers for moves */
const isV=f=>f&&f.def&&f.def.id==='valor';
function wfxCurlAt(at,size,f,side){ const right=side!=null?side>0:Math.random()<.5; wfxSprite(right?'curl':'curlM',at,size,.5,{grow:.5,rot:rand(-.25,.25),top:1}); }
function wfxHit(at,size){ size*=1.6; wfxSprite('splash',at,size*.9,.38,{grow:.8,rot:rand(0,6),top:1}); wfxCurlAt(at.clone().add(V(0,size*.15,0)),size); }
function wfxArc(f,r,n,h){ const c=f.chest(); for(let i=0;i<n;i++){ const a=f.yaw+(i/(n-1)-.5)*1.8, p=V(f.pos.x+Math.sin(a)*r*f.scale,c.y+(h||0),f.pos.z+Math.cos(a)*r*f.scale);
  later(i*.04,()=>wfxSprite(i%2?'curl':'curlM',p,15*f.scale,.55,{grow:.5})); } }
function wfxColumn(x,z,h,n){ for(let i=0;i<n;i++) later(i*.05,()=>wfxSprite(i%2?'curl':'curlM',V(x+rand(-1.5,1.5),2+i*h/n,z+rand(-1.5,1.5)),17,.65,{grow:.4,vel:V(0,14,0)})); }

/* painted water ribbon for VALOR's sword (replaces the glow trail) */
{ const oT=trailTick; trailTick=function(f,dt,on){ if(!isV(f)) return oT(f,dt,on); const S=f.v8; if(!S||!S.swordTip) return; const T=S.trail||(S.trail={pts:[],m:null});
  if(on){ const b=V(),t=V(); S.swordBase.getWorldPosition(b); S.swordTip.getWorldPosition(t); T.pts.push([b,t]); if(T.pts.length>12) T.pts.shift(); }
  else if(T.pts.length) T.pts.splice(0,Math.max(1,Math.ceil(T.pts.length*dt*12)));
  for(const k of ['m','mo']) if(T[k]){ scene.remove(T[k]); T[k].geometry.dispose(); T[k]=null; }
  const n=T.pts.length; if(n<2) return;
  const strip=(grow,colorFn)=>{ const pos=new Float32Array((n-1)*18), col=new Float32Array((n-1)*18);
   for(let i=0;i<n-1;i++){ const q=[T.pts[i],T.pts[i+1]].map(([b,t])=>{ const d=t.clone().sub(b); return [b.clone().addScaledVector(d,-grow),t.clone().addScaledVector(d,grow)]; });
    const [[b0,t0],[b1,t1]]=q, a0=(i+1)/n, a1=(i+2)/n, vs=[b0,t0,b1,t0,t1,b1], al=[[a0,0],[a0,1],[a1,0],[a0,1],[a1,1],[a1,0]];
    vs.forEach((v,j)=>{ pos.set([v.x,v.y,v.z],i*18+j*3); col.set(colorFn(al[j][0],al[j][1]),i*18+j*3); }); }
   const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); return g; };
  T.ink=T.ink||new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.92,depthWrite:false,side:THREE.DoubleSide});
  T.wat=T.wat||new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.95,depthWrite:false,side:THREE.DoubleSide});
  T.mo=new THREE.Mesh(strip(.07,()=>[.04,.05,.1]),T.ink); T.mo.renderOrder=3;
  // deep blue at the hilt side, bright blue, then white foam on the outer edge; older parts of the ribbon fade toward light blue
  T.m=new THREE.Mesh(strip(0,(age,edge)=>edge>.5?[1,1,1]:[lerp(.5,.07,age),lerp(.85,.36,age),lerp(1,.86,age)]),T.wat); T.m.renderOrder=4;
  for(const k of ['m','mo']){ T[k].frustumCulled=false; scene.add(T[k]); } }; }

/* hits: sword, punches, shield */
{ const o=slashFX; slashFX=function(at,f){ o(at,f); if(isV(f)) wfxHit(at,11); }; }
{ const o=punchFX; punchFX=function(at,water){ o(at,water); wfxHit(at,water?11:7); }; }
{ const o=clangFX; clangFX=function(at){ o(at); const p=game.p&&isV(game.p)?game.p:(game.e&&isV(game.e)?game.e:null); if(p&&at.distanceTo(p.chest())<30) wfxSprite('splash',at,9,.3,{grow:.7,rot:rand(0,6)}); }; }

/* moves */
const WMOVE={
 thook(f,a){ if(once(a,'wf',a.hitAt*.8)) wfxArc(f,10,4,0); },
 bsweep(f,a){ if(once(a,'wf',.32*a.dur)) wfxRing(f.pos.x,f.pos.z,18*f.scale,.55); },
 geyser(f,a){ if(once(a,'wf',a.hitAt)){ const x=f.pos.x+Math.sin(f.yaw)*9*f.scale, z=f.pos.z+Math.cos(f.yaw)*9*f.scale; wfxColumn(x,z,30,7); wfxRing(x,z,10,.5); } },
 bdive(f,a){ if(a.landT!=null&&once(a,'wf',0)){ wfxRing(f.pos.x,f.pos.z,26,.7); for(let i=0;i<6;i++){ const g=i/6*Math.PI*2; wfxSprite(i%2?'curl':'curlM',V(f.pos.x+Math.cos(g)*12,4,f.pos.z+Math.sin(g)*12),11,.55,{grow:.5}); } } },
 swordplunge(f,a){ if(a.landT!=null&&once(a,'wf',0)) wfxRing(f.pos.x+Math.sin(f.yaw)*6,f.pos.z+Math.cos(f.yaw)*6,20,.6); },
 vspin(f,a){ if(once(a,'wf',.42*a.dur)) wfxRing(f.pos.x,f.pos.z,17*f.scale,.5,f.chest().y-6); },
 vcleave(f,a){ if(once(a,'wf',.5*a.dur)) wfxRing(f.pos.x+Math.sin(f.yaw)*10*f.scale,f.pos.z+Math.cos(f.yaw)*10*f.scale,12,.5); },
 risingslash(f,a){ if(once(a,'wf',.45*a.dur)) wfxColumn(f.pos.x+Math.sin(f.yaw)*7,f.pos.z+Math.cos(f.yaw)*7,24,4); },
 swordthrust(f,a){ if(once(a,'wf',.32*a.dur)) wfxArc(f,9,3,0); },
 starpunch(f,a){ if(a._bh&&once(a,'wf',0)){ const c=f.opp.chest(); wfxSprite('splash',c,22,.5,{grow:.9}); for(let i=0;i<5;i++) later(i*.04,()=>wfxCurlAt(c.clone().add(V(rand(-6,6),rand(-3,6),rand(-6,6))),14)); wfxRing(f.opp.pos.x,f.opp.pos.z,24,.6); } },
 bjab(f,a){ if((a.chain||0)===2&&a.landed&&once(a,'wf',0)) wfxRing(f.opp.pos.x,f.opp.pos.z,10,.35,f.opp.chest().y-4); },
 chargingstar(f,a,dt){ if(a.t<.8&&Math.random()<dt*14) wfxSprite(Math.random()<.5?'curl':'curlM',f.pos.clone().add(V(0,f.chest().y*.6,0)),9,.45,{grow:.4}); },
 bdash(f,a,dt){ if(a.t<.22&&Math.random()<dt*25) wfxSprite('splash',f.pos.clone().add(V(0,3,0)),7,.3,{grow:.6,rot:rand(0,6)}); },
};
{ const oUA=FP.updateAtk; FP.updateAtk=function(dt){ const a=this.atk; oUA.call(this,dt); if(!a||this.atk!==a||!isV(this)) return; const h=WMOVE[a.id]; if(h) try{ h(this,a,dt); }catch(e){ console.error(e); } }; }
/* the thrown shield leaves a water trail */
function wfxTrails(dt){ if(game.paused) return; for(const D of V8.discs){ if(!isV(D.f)||D.kind==='portal') continue; D._wt=(D._wt||0)-dt; if(D._wt<=0){ D._wt=.06; wfxSprite(Math.random()<.5?'curl':'curlM',D.pos.clone(),5,.35,{grow:.3,spin:rand(-3,3)}); } } }
