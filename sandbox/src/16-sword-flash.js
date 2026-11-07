/* =====================================================================
   SANDBOX TEST 13: SWORD ULTIMATE = FLASH-STEP CUTS + THE SKY DRAGON (Nov 6, 2026)
   MajorasPride: "Sword attack should be him lunging and cutting in super fast moves." Lunge opener (no dragon shot),
   anime dash cuts, then "an Akuma pose with a dragon in the background... like that in the sky" (he showed a huge
   coiled dragon in the clouds + Akuma standing with his back turned). Our own design: a blue painted WATER dragon,
   not any existing character.
   Flow: 1) crouch in a draw stance, then LUNGE straight ahead (aimed; a miss = no cutscene)
   2) hit = cutscene: 6 flash-step cuts through the monster from every side (a blur, water slash lines)
   3) he lands far side, back to the camera, Akuma-style: fists down, shoulders square, sword point-down
      while a giant water dragon draws itself coiling up through the clouds in the sky behind the monster
   4) the sheathe click: every cut opens at once, the dragon roars, the monster is blown away in a water burst.
   ===================================================================== */
const SW13={ LUNGE:.28, CUTS:6, CUT:.2, C0:.1, LAND:1.42, DRAGON:[1.3,2.1], CLICK:2.55, OPEN:2.7, FINAL:3.15, END:5.0 };   // FINAL = the wide city shot (MajorasPride, Nov 6)

/* ---------------- the sky dragon (ink-painted water, built from a tube along a coil) ---------------- */
function dragonTex(){ return wfxCanvas((x,w,h)=>{ // u = along the body, v = around it
  const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'#f2fbff'); g.addColorStop(.22,'#bfeeff'); g.addColorStop(.3,'#2f8ff0'); g.addColorStop(.75,'#123f9e'); g.addColorStop(1,'#2f8ff0'); x.fillStyle=g; x.fillRect(0,0,w,h);
  x.strokeStyle='#0b0f1e'; x.lineWidth=5; for(let i=0;i<4;i++){ x.beginPath(); x.moveTo(i*w/4,h*.26); x.lineTo(i*w/4,h*.3); x.stroke(); }          // belly plates
  x.lineWidth=4; for(let r=0;r<3;r++) for(let i=0;i<4;i++){ const cx=i*w/4+(r%2)*w/8, cy=h*(.42+r*.17); x.beginPath(); x.arc(cx,cy,w/9,Math.PI*.15,Math.PI*.85); x.stroke(); x.strokeStyle=r%2?'#0b0f1e':'#7fd8ff'; } // scales
 },256,256); }
function dragonMake(C,right,fwd,s){ const G=new THREE.Group(), pts=[];
 // a figure-8 coil hanging over the city (MajorasPride's reference shot), weaving over and under itself, head rising in the middle
 pts.push(V(-6*s,-30*s,10*s)); pts.push(V(-2*s,0,6*s));
 for(let i=0;i<=24;i++){ const t=-Math.PI/2+i/24*Math.PI*2, d=1+Math.sin(t)*Math.sin(t);
  pts.push(V(70*s*Math.cos(t)/d, 40*s+46*s*Math.sin(t)*Math.cos(t)/d, Math.sin(2*t)*12*s)); }
 pts.push(V(0,70*s,-6*s)); pts.push(V(0,88*s,-22*s)); pts.push(V(0,90*s,-40*s));   // the neck rises out of the middle, head looking down at us
 const curve=new THREE.CatmullRomCurve3(pts), TS=220, RS=14, taper=u=>u<.15?lerp(1.2,7,u/.15):u>.86?lerp(7,5.2,(u-.86)/.14):7;
 const tube=(scl,mat)=>{ const geo=new THREE.TubeGeometry(curve,TS,1,RS,false), P=geo.attributes.position;
  for(let j=0;j<=TS;j++){ const c=curve.getPointAt(j/TS), r=taper(j/TS)*s*scl; for(let i=0;i<=RS;i++){ const n=j*(RS+1)+i, v=V(P.getX(n),P.getY(n),P.getZ(n)).sub(c).normalize().multiplyScalar(r).add(c); P.setXYZ(n,v.x,v.y,v.z); } }
  P.needsUpdate=true; const m=new THREE.Mesh(geo,mat); m.renderOrder=5; G.add(m); return m; };
 const tex=dragonTex(); tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(46,1);
 const body=tube(1,new THREE.MeshBasicMaterial({map:tex,fog:false,toneMapped:false})), ink=tube(1.13,new THREE.MeshBasicMaterial({color:0x0b0f1e,side:THREE.BackSide,fog:false}));
 // head: our own design (blue water dragon, white foam mane, glowing eyes)
 const H=new THREE.Group(), blue=new THREE.MeshBasicMaterial({color:0x2f8ff0,fog:false}), pale=new THREE.MeshBasicMaterial({color:0xbfeeff,fog:false}), blk=new THREE.MeshBasicMaterial({color:0x0b0f1e,side:THREE.BackSide,fog:false});
 const part=(geo,mat,x,y,z,rx)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); if(rx) m.rotation.x=rx; H.add(m); const o=new THREE.Mesh(geo,blk); o.position.copy(m.position); o.rotation.copy(m.rotation); o.scale.setScalar(1.12); H.add(o); return m; };
 part(new THREE.BoxGeometry(10,7,11),blue,0,0,0); part(new THREE.BoxGeometry(7,4,11),blue,0,-.5,9); part(new THREE.BoxGeometry(6.5,2,9),pale,0,-3.5,8,.35);   // skull, snout, open jaw
 for(const sx of [-1,1]){ const h=part(new THREE.ConeGeometry(1.1,12,6),pale,sx*3,5,-4,-.9); h.rotation.z=sx*.25;                                                 // horns swept back
  const e=new THREE.Mesh(new THREE.SphereGeometry(1.1,8,6),new THREE.MeshBasicMaterial({color:0xffffff,fog:false})); e.position.set(sx*3.6,1.6,4.5); H.add(e);       // glowing eyes
  const wh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(sx*3,-1,13),V(sx*9,-4,18),V(sx*16,2,12),V(sx*22,-6,4)]),20,.35,5,false),pale); H.add(wh); } // water whiskers
 H.scale.setScalar(s*1.1); G.add(H);
 const end=curve.getPointAt(1), tan=curve.getTangentAt(1); H.position.copy(end); H.lookAt(end.clone().add(tan));
 // place the coil in the world: right / up / away from the camera
 const m4=new THREE.Matrix4().makeBasis(right,V(0,1,0),fwd); G.applyMatrix4(m4); G.position.copy(C); scene.add(G);
 return {G,body,ink,H,curve,m4,C,s,idx:body.geometry.index.count,frac:0}; }
function dragonPoint(D,u){ return D.curve.getPointAt(u).applyMatrix4(D.m4).add(D.C); }
function dragonReveal(D,q){ D.frac=q; const n=Math.floor(D.idx*q/6)*6; D.body.geometry.setDrawRange(0,n); D.ink.geometry.setDrawRange(0,n); D.H.visible=q>.985; }
function dragonKill(a,burstIt){ const D=a.dragon; if(!D) return; a.dragon=null;
 if(burstIt) for(let i=0;i<26;i++){ const p=dragonPoint(D,i/25); wfxSprite(i%3?'foam':'splash',p,22*D.s,.8,{grow:.6,vel:V(rand(-10,10),rand(-20,0),rand(-10,10))}); }
 scene.remove(D.G); D.G.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }

/* ---------------- the move ---------------- */
VULT.sword.name='TIDECREST OATH';
ultSword=function(f,a,dt,pm,o){ const t=a.t, C=SW13; if(a.miss){ a.trail=false; return; }
 // 1. the draw stance, then the LUNGE
 if(once(a,'stance',0)){ f.kb.set(0,0,0); ring(f.pos.x,1,f.pos.z,12,WATER,.4); Snd.tone('triangle',600,1200,.25,.06); }
 if(!a.hitT){ f.kb.set(0,0,0);
  if(t<C.LUNGE){ if(Math.random()<dt*20) wfxSprite(Math.random()<.5?'curl':'curlM',f.chest().add(V(rand(-8,8),rand(-4,6),rand(-8,8))),6,.3,{grow:.2}); return; }
  if(once(a,'go',C.LUNGE)){ a.lg={dir:V(Math.sin(f.yaw),0,Math.cos(f.yaw)),d:0}; a.trail=true; Snd.whoosh(); Snd.tone('sawtooth',1400,300,.18,.08); wfxFlat('ripple',f.pos.x,f.pos.z,16,.5); }
  const L=a.lg, step=300*dt; f.pos.addScaledVector(L.dir,step); L.d+=step;
  if(Math.random()<dt*50) wfxSprite('crest',f.pos.clone().addScaledVector(L.dir,-6).add(V(0,6,0)),14,.35,{grow:.2});
  if(canHit(o)&&f.pos.distanceTo(o.pos)<o.radius()+f.radius()+4){ a.hitT=t; a.p0=f.pos.clone(); a.dir0=L.dir.clone(); ultHit(f,o,6*pm,0,0,o.chest()); slashFX(o.chest(),f); ultLanded(f,a); }
  else if(L.d>120){ a.trail=false; ultMiss(f,a,t); }
  return; }
 const k=t-a.hitT; a.dur=Math.max(a.dur,a.hitT+C.END); f.kb.set(0,0,0); if(k<C.OPEN) ultHold(o,null); if(k<C.OPEN) o.pos.y=0;
 const R=o.radius()+f.radius()+10, toO=V(o.pos.x-a.p0.x,0,o.pos.z-a.p0.z).normalize(), base=Math.atan2(-toO.x,-toO.z);
 // 2. FLASH-STEP CUTS: he blurs through the monster from side to side, each pass a cut
 if(k>=C.C0&&k<C.C0+C.CUTS*C.CUT){ const i=Math.floor((k-C.C0)/C.CUT), q=((k-C.C0)-i*C.CUT)/C.CUT, a1=base+i*2.55, a2=a1+Math.PI+(i%2?.5:-.5);
  const A=V(o.pos.x+Math.sin(a1)*R,0,o.pos.z+Math.cos(a1)*R), B=V(o.pos.x+Math.sin(a2)*R,0,o.pos.z+Math.cos(a2)*R), m=ez(clamp((q-.2)/.5,0,1));
  f.pos.copy(A.clone().lerp(B,m)); f.yaw=Math.atan2(B.x-A.x,B.z-A.z); f.onGround=true; a.trail=true; a.ci=i;
  if(once(a,'c'+i,a.hitT+C.C0+i*C.CUT+C.CUT*.45)){ ultHit(f,o,4*pm,0,0,null); const at=o.chest().add(V(rand(-3,3),rand(-4,4),rand(-3,3)));
   for(let j=0;j<7;j++) wfxSprite('crest',A.clone().lerp(B,j/6).add(V(0,o.chest().y-o.pos.y,0)),13,.5,{grow:.2,top:1});
   burst(at,0xffffff,10,16); wfxHit(at,7); Snd.tone('sawtooth',1600,300,.1,.07); game.hitStop=Math.max(game.hitStop,.04); toast(['SHING!','SLASH!','ZAN!','SHING!','SLASH!','ZAN!'][i],['#ffffff','#7fd4ff','#ffd43b'][i%3],200); } }
 // 3. he lands far side, back to the camera, and squares up (Akuma-style) while the dragon draws itself in the sky
 if(k>=C.C0+C.CUTS*C.CUT&&k<C.OPEN+.6){ const stand=o.pos.clone().addScaledVector(toO,-(R+26)); stand.y=0;
  f.pos.lerp(stand,Math.min(1,dt*14)); f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); if(k>C.LAND) a.trail=false; }
 if(once(a,'land',a.hitT+C.LAND)){ dust(f.pos.x,f.pos.z,8,8); wfxFlat('ripple',f.pos.x,f.pos.z,18,.6); Snd.thud&&Snd.thud(); }
 if(k>=C.DRAGON[0]&&!a.dragon&&!a.dDone){ const fw=V(o.pos.x-f.pos.x,0,o.pos.z-f.pos.z).normalize(), rt=V(-fw.z,0,fw.x); a.dragon=dragonMake(o.pos.clone().addScaledVector(fw,170).add(V(0,(f.chest().y-f.pos.y)*3.2,0)),rt,fw,(f.scale||1)*1.6); dragonReveal(a.dragon,0); Snd.tone('sawtooth',80,240,1.2,.1); }
 const D=a.dragon; if(D){ const q=clamp((k-C.DRAGON[0])/(C.DRAGON[1]-C.DRAGON[0]),0,1); dragonReveal(D,ez(q));
  a._cl=(a._cl||0)-dt; if(a._cl<=0){ a._cl=.03; const u=Math.random()*Math.max(.05,D.frac), p=dragonPoint(D,u).add(V(rand(-10,10),rand(-6,2),rand(-10,10)).multiplyScalar(D.s));     // clouds of foam around the coil
   wfxSprite(Math.random()<.7?'foam':'splash',p,rand(16,28)*D.s,rand(.6,1.1),{grow:.3}); if(q<1) wfxSprite(Math.random()<.5?'curl':'curlM',dragonPoint(D,D.frac),14*D.s,.5,{grow:.4}); }
  D.H.rotation.z=Math.sin(game.time*3)*.05; if(once(a,'roarD',a.hitT+C.DRAGON[1])){ Snd.roar&&Snd.roar(); game.shake=Math.max(game.shake,.5); } }
 // 4. the click: every cut opens at once, the dragon roars down, the monster is blown away
 if(once(a,'click',a.hitT+C.CLICK)){ Snd.tone('square',2400,1800,.05,.08); Snd.tone('triangle',1600,1600,.08,.05); cineFreeze(450,.55); }
 if(once(a,'open',a.hitT+C.OPEN)){ const at=o.chest(); for(let i=0;i<6;i++){ const g=i/6*Math.PI; for(let j=-3;j<=3;j++) wfxSprite('crest',at.clone().add(V(Math.cos(g)*j*4,Math.sin(g)*j*4,0)),12,.6,{grow:.3,top:1}); }
  ultHit(f,o,24*pm,40,24,o.chest()); slashFX(at,f); wfxColumn(o.pos.x,o.pos.z,60,10); wfxRing(o.pos.x,o.pos.z,40,.9); burst(at,WATER,50,40); burst(at,0xffffff,30,30);
  if(D){ D.H.scale.multiplyScalar(1.15); } flashScreen('#7fd4ff'); game.shake=Math.max(game.shake,1.6); game.hitStop=Math.max(game.hitStop,.15); Snd.boom(); banner('TIDECREST OATH!',900); }
 // the final shot: the dragon stays coiled over the city, lightning cracks around it
 if(a.dragon&&k>=C.OPEN){ a._lt=(a._lt||0)-dt; if(a._lt<=0){ a._lt=rand(.18,.4); boltAt(a,dragonPoint(a.dragon,rand(.1,.95)).add(V(rand(-40,40),rand(10,60),rand(-20,20)).multiplyScalar(a.dragon.s))); } }
 boltTick(a,dt); };
{ const o=cineEnd; cineEnd=function(){ const a=CINE.a; if(a&&a.dragon){ dragonKill(a,false); a.dDone=1; } if(a) a.trail=false; o(); }; }
{ const oR=sbReset; sbReset=function(){ const a=game.p&&game.p.atk; if(a&&a.dragon) dragonKill(a,false); oR(); }; }

/* ---------------- VALOR's body ---------------- */
uPoseSword=function(k,f,a){ const t=a.t, S=f.v8||{}, C=SW13;
 if(a.miss){ k.armR=-.7; k.elR=-.6; k.azR=.2; k.armL=-.6; k.elL=-1.2; k.azL=.3; k.lean=.35; k.knL=.6; k.knR=.3; k.legL=-.5; k.headX=.2; S.blade=-1.2; return; }
 if(a.hitT==null){
  if(t<C.LUNGE){ const w=uq(t,0,.18); k.knL=k.knR=1.0*w; k.legL=-.6*w; k.legR=.45*w; k.lean=.45*w; k.twist=.5*w;            // low draw stance, hand on the hilt at his hip
   k.armR=lerp(-.6,.1,w); k.elR=lerp(-.4,-1.5,w); k.azR=.35*w; k.armL=-1.1; k.elL=-1.3; k.azL=.45; k.headX=.25*w; S.blade=lerp(-1.4,.6,w); return; }
  k.armR=-1.5; k.elR=0; k.azR=-.15; k.twist=-.45; k.lean=.65; k.legL=-1.0; k.knL=.4; k.legR=.7; k.knR=.5; k.armL=-.6; k.elL=-1.1; k.azL=.5; k.headX=.2; S.blade=-Math.PI/2; return; }   // the lunge
 const kk=t-a.hitT;
 if(kk<C.C0+C.CUTS*C.CUT){ const i=a.ci||0, q=clamp(((kk-C.C0)-i*C.CUT)/C.CUT,0,1), s=i%2?-1:1, sw=ez(clamp((q-.15)/.5,0,1));   // a slash on every pass
  k.twist=lerp(.9*s,-1.0*s,sw); k.armR=-1.4; k.elR=-.2; k.azR=lerp(.8*s,-.7*s,sw); k.lean=.6; k.legL=-1.0; k.knL=.45; k.legR=.75; k.knR=.55; k.armL=-.7; k.elL=-1.2; k.azL=.5; k.headX=.2; S.blade=-Math.PI/2; return; }
 // the Akuma stand: back to us, shoulders square, fists down and a little out, sword point-down at his side, head slightly lowered
 const st=uq(kk,C.C0+C.CUTS*C.CUT,C.LAND+.15), cl=uq(kk,C.CLICK-.12,C.CLICK);
 k.armL=lerp(-.6,.08,st); k.elL=lerp(-1.1,-.3,st); k.azL=lerp(.5,-.28,st); k.armR=lerp(-1.4,.08,st); k.elR=lerp(-.2,-.3,st); k.azR=lerp(-.7,.28,st);
 k.twist=0; k.lean=lerp(.6,-.04,st); k.legL=lerp(-1,-.12,st); k.knL=lerp(.45,.08,st); k.legR=lerp(.75,.12,st); k.knR=lerp(.55,.08,st); k.headX=lerp(.2,.16,st)+.06*cl;
 S.blade=lerp(-Math.PI/2,-.1,st); };

/* ---------------- the camera ---------------- */
{ const oC=cineCam; cineCam=function(){ const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o||CINE.brawl||a.hitT==null||!a.p0) return oC();
  const k=a.t-a.hitT, C=SW13, fc=f.chest(), oc=o.chest(), toO=V(o.pos.x-a.p0.x,0,o.pos.z-a.p0.z).normalize(), sd=V(toO.z,0,-toO.x);
  if(k<C.C0){ cineShot(0); camAt(fc.clone().addScaledVector(toO,-14).addScaledVector(sd,10).add(V(0,2,0)),oc); return; }                                       // the lunge connects (quote)
  if(k<C.C0+C.CUTS*C.CUT){ const i=a.ci||0; if(cineShot(10+i)){ cq.classList.remove('show'); cineEl.classList.toggle('comic',i%2===1); }                       // a new angle every cut
   const ang=[.6,-1.4,2.3,-2.6,1.4,-.3][i], r=[46,38,52,40,48,36][i], h=[3,16,6,22,2,10][i]; camAt(V(oc.x+Math.sin(ang)*r,o.pos.y+h,oc.z+Math.cos(ang)*r),oc); return; }
  if(k<C.DRAGON[0]+.35){ if(cineShot(20)) cineEl.classList.remove('comic'); camAt(fc.clone().addScaledVector(toO,-24).addScaledVector(sd,14).add(V(0,-4,0)),fc.clone().lerp(oc,.5).add(V(0,8,0))); return; } // low, he lands
  if(k<C.OPEN){ cineShot(21); const D=a.dragon, up=D?dragonPoint(D,.55):oc.clone().add(V(0,60,0));                                                         // the Akuma shot: his back, the dragon in the sky
   const q=uq(k,C.DRAGON[0]+.35,C.OPEN), hy=fc.y-f.pos.y; camAt(f.pos.clone().addScaledVector(toO,-(50-8*q)).addScaledVector(sd,5).add(V(0,hy*.55,0)),f.pos.clone().addScaledVector(toO,70).add(V(0,hy*3.4+14*q,0))); return; }
  if(k<C.FINAL){ if(cineShot(22)) cineFlash(); camAt(oc.clone().addScaledVector(sd,40).addScaledVector(toO,-12).add(V(0,4,0)),oc.clone().add(V(0,6,0))); return; } // every cut opens
  // FINAL SHOT: wide over the city, VALOR in front with his back to us (Akuma stand), the dragon coiled over the skyline
  if(cineShot(23)){ cineFlash(); CINE.fov0=camera.fov; camera.fov=82; camera.updateProjectionMatrix(); }
  const q=uq(k,C.FINAL,C.END), hy=fc.y-f.pos.y; camAt(f.pos.clone().addScaledVector(toO,-(62+14*q)).addScaledVector(sd,3).add(V(0,hy*.7,0)),f.pos.clone().addScaledVector(toO,120).add(V(0,hy*4.2,0)));
  if(k>C.END-.05||!f.atk||f.atk.id!=='ultimate') cineEnd(); }; }

/* ---------------- v2 (MajorasPride sent a BlazBlue super frame: dark screen + afterimage clones) ----------------
   During the flash cuts the world goes dark like a fighting-game super (buildings hidden, a black dome around the
   fight) and every pass leaves see-through blue afterimage clones of VALOR that fade out.
   Finish ("pose and dragon sky cut"): the Akuma stand with the dragon in the sky, then on the click one giant cut
   line splits the monster AND the sky, and the dragon bursts into water. */
function superBG(a,o,on){ if(on&&!a.bg){ const m=new THREE.Mesh(new THREE.SphereGeometry(120,24,16),new THREE.MeshBasicMaterial({color:0x02060f,side:THREE.BackSide,fog:false})); m.position.copy(o.pos); scene.add(m); a.bg=m;
  a.hid=[]; for(const b of city){ if(b.mesh&&b.mesh.visible){ b.mesh.visible=false; a.hid.push(b.mesh); } } }
 if(!on&&a.bg){ scene.remove(a.bg); a.bg.geometry.dispose(); a.bg.material.dispose(); a.bg=null; for(const m of a.hid||[]) m.visible=true; a.hid=null; } }
function ghostAdd(a,f){ const g=f.root.clone(true), mat=new THREE.MeshBasicMaterial({color:0x7fd4ff,transparent:true,opacity:.5,depthWrite:false,fog:false});
 g.traverse(o=>{ if(o.isMesh) o.material=mat; else if(o.isSprite||o.isPoints||o.isLine) o.visible=false; }); scene.add(g); (a.ghosts||(a.ghosts=[])).push({g,mat,t:0}); }
function ghostTick(a,dt){ if(!a.ghosts) return; for(const G of a.ghosts){ G.t+=dt; G.mat.opacity=Math.max(0,.5*(1-G.t/.7)); } a.ghosts=a.ghosts.filter(G=>{ if(G.t<.7) return true; scene.remove(G.g); G.mat.dispose(); return false; }); }
function ghostClear(a){ for(const G of a.ghosts||[]){ scene.remove(G.g); G.mat.dispose(); } a.ghosts=[]; }
{ const oS=ultSword; ultSword=function(f,a,dt,pm,o){ oS(f,a,dt,pm,o); if(a.hitT==null||a.miss) return; const k=a.t-a.hitT, C=SW13, end=C.C0+C.CUTS*C.CUT;
  superBG(a,o,k>=C.C0-.02&&k<end+.08);
  if(k>=C.C0&&k<end){ a._gh=(a._gh||0)-dt; if(a._gh<=0){ a._gh=C.CUT/3; ghostAdd(a,f); } }
  ghostTick(a,dt);
  // the giant cut through the monster and up into the sky, through the dragon
  if(once(a,'skycut',a.hitT+C.OPEN)){ const D=a.dragon, from=o.pos.clone().add(V(-30,0,0)), to=D?dragonPoint(D,.7):o.chest().add(V(40,140,0));
   for(let i=0;i<=26;i++) wfxSprite(i%3?'crest':'foam',from.clone().lerp(to,i/26),24,.9,{grow:.3,top:1}); } }; }
{ const o=cineEnd; cineEnd=function(){ const a=CINE.a; if(a&&!a.brawl){ superBG(a,null,false); ghostClear(a); } o(); }; }
{ const oR=sbReset; sbReset=function(){ const a=game.p&&game.p.atk; if(a){ superBG(a,null,false); ghostClear(a); } oR(); }; }

/* ---------------- v3: Hibiki (BlazBlue: Central Fiction) Astral as the reference (MajorasPride: "ok to copy for now, we add our own style")
   Divine Nightfall: Raven = the strike lands, the opponent is swallowed by darkness, Hibiki and a clone attack from both sides,
   a crossing slash, the screen goes black. Ours: the lunge lands, black smoke swallows the monster, VALOR and a WATER CLONE of
   VALOR dash through it from opposite sides at the same time (they cross in an X every pass), the last pass is the crossing
   slash, the screen cuts to black for a beat, the clone splashes away, then the Akuma stand + sky dragon + sky cut finish. */
{ const s=document.createElement('style'); s.textContent=`#vcine .blk{position:absolute;inset:0;z-index:5;background:#000;opacity:0}#vcine .blk.go{animation:vblk .6s ease-out}@keyframes vblk{0%,45%{opacity:1}100%{opacity:0}}`; document.head.appendChild(s);
  const b=document.createElement('div'); b.className='blk'; cineEl.appendChild(b); }
function twinMake(a,f){ const g=f.root.clone(true), mat=new THREE.MeshBasicMaterial({color:0x3fa9ff,transparent:true,opacity:.8,depthWrite:true,fog:false});
 g.traverse(o=>{ if(o.isMesh) o.material=mat; else if(o.isSprite||o.isPoints||o.isLine) o.visible=false; });
 const src=[], dst=[]; f.root.traverse(o=>src.push(o)); g.traverse(o=>dst.push(o)); scene.add(g); a.twin={g,mat,src,dst}; }
function twinKill(a,splash){ const T=a.twin; if(!T) return; a.twin=null; if(splash){ const p=T.g.position.clone().add(V(0,8,0)); wfxSprite('splash',p,26,.5,{grow:.6}); for(let i=0;i<6;i++) wfxSprite(i%2?'curl':'curlM',p.clone().add(V(rand(-6,6),rand(-6,6),rand(-6,6))),12,.5,{grow:.4}); }
 scene.remove(T.g); T.mat.dispose(); }
{ const oS=ultSword; ultSword=function(f,a,dt,pm,o){ oS(f,a,dt,pm,o); if(a.hitT==null||a.miss) return; const k=a.t-a.hitT, C=SW13, end=C.C0+C.CUTS*C.CUT;
  // the darkness swallows the monster
  if(once(a,'shroud',a.hitT)){ const at=o.chest(); burst(at,0x000000,60,26); burst(at,0x1a1030,30,18); }
  // the water clone: mirrors VALOR through the monster (he goes A->B, it goes B->A), same moves
  if(k>=C.C0&&k<end+.05){ if(!a.twin) twinMake(a,f); const T=a.twin; T.g.position.set(2*o.pos.x-f.pos.x,f.pos.y,2*o.pos.z-f.pos.z); T.g.rotation.set(f.root.rotation.x,f.root.rotation.y+Math.PI,f.root.rotation.z);
   for(let i=1;i<T.src.length&&i<T.dst.length;i++){ T.dst[i].position.copy(T.src[i].position); T.dst[i].rotation.copy(T.src[i].rotation); T.dst[i].scale.copy(T.src[i].scale); }
   if(Math.random()<dt*30) wfxSprite('spray',T.g.position.clone().add(V(0,8,0)),7,.3,{grow:.4}); }
  // the crossing slash: the screen cuts to black, the clone splashes away
  if(once(a,'cross',a.hitT+end)){ const b=cineEl.querySelector('.blk'); b.classList.remove('go'); void b.offsetWidth; b.classList.add('go'); twinKill(a,true); Snd.tone('sawtooth',2000,200,.2,.1); game.hitStop=Math.max(game.hitStop,.1); } }; }
{ const o=cineEnd; cineEnd=function(){ const a=CINE.a; if(a&&!a.brawl) twinKill(a,false); o(); }; }
{ const oR=sbReset; sbReset=function(){ const a=game.p&&game.p.atk; if(a) twinKill(a,false); oR(); }; }

/* lightning bolts for the final shot (jagged white-blue beams that flash and fade) */
function boltAt(a,top){ const G=new THREE.Group(), mat=new THREE.MeshBasicMaterial({color:0xdff6ff,transparent:true,opacity:1,fog:false,toneMapped:false}); let p=top.clone();
 const s=a.dragon?a.dragon.s:1; for(let i=0;i<9;i++){ const q=p.clone().add(V(rand(-14,14),-rand(10,18),rand(-14,14)).multiplyScalar(s)), len=p.distanceTo(q);
  const m=new THREE.Mesh(new THREE.BoxGeometry(1.4*s,len,1.4*s),mat); m.position.copy(p).lerp(q,.5); m.quaternion.setFromUnitVectors(V(0,1,0),q.clone().sub(p).normalize()); G.add(m); p=q; }
 scene.add(G); (a.bolts||(a.bolts=[])).push({G,mat,t:0}); Snd.tone('sawtooth',90,40,.25,.06); }
function boltTick(a,dt){ if(!a.bolts) return; for(const B of a.bolts){ B.t+=dt; B.mat.opacity=B.t<.08?1:Math.max(0,1-(B.t-.08)/.2); }
 a.bolts=a.bolts.filter(B=>{ if(B.t<.3) return true; scene.remove(B.G); B.G.traverse(o=>o.geometry&&o.geometry.dispose()); B.mat.dispose(); return false; }); }
function boltClear(a){ for(const B of a.bolts||[]){ scene.remove(B.G); B.mat.dispose(); } a.bolts=[]; }
{ const o=cineEnd; cineEnd=function(){ const a=CINE.a; if(a&&!a.brawl){ boltClear(a); if(a.dragon){ dragonKill(a,true); a.dDone=1; } } if(CINE.fov0){ camera.fov=CINE.fov0; camera.updateProjectionMatrix(); CINE.fov0=0; } o(); }; }
