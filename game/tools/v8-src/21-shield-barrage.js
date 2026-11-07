/* =====================================================================
   SANDBOX TEST 12: BRAWLER ULTIMATE = SHIELD BARRAGE CUTSCENE (Nov 6, 2026)
   MajorasPride: "He's just punching the ground? Forget the ground thing. Just shield throw, 4 times bounce
   back, but dynamic throwing. Make it look sick: spin toss, jump spin toss, bounce to chin then back for an
   ultimate shield bash, then it tosses the enemy like a beam. Make it cinematic too." Keep the giant water shield for the bash.
   Flow: 1) aimed throw (a miss = no cutscene)  2) SPIN TOSS  3) JUMP SPIN TOSS  4) off the CHIN (slow-mo, head snaps back)
   5) catch, charge behind the giant water shield, ULTIMATE SHIELD BASH (freeze)  6) the monster flies off in a straight
   line like a beam with a water trail and crashes far away. Every throw bounces back to his hand.
   The tackle / pin / ground punches / slam of Sandbox 10 are no longer used (their code is still in 11-valor-cine.js).
   ===================================================================== */
const SB12={ R1:[0,.32], T2:[.6,.74], R2:[.74,1.0], T3:[1.25,1.38], LAND:1.5, R3:[1.38,1.66], T4:[1.8,1.9], R4:[1.9,2.25], BASH:2.5, CRASH:3.3, END:4.4 };
const sbHand=f=>f.chest().add(V(Math.sin(f.yaw)*5,0,Math.cos(f.yaw)*5));
function sbChin(o){ const h=V(); if(o.P&&o.P.head){ o.P.head.getWorldPosition(h); return h; } return o.chest().add(V(0,o.radius()*.6,0)); }
// where the flying shield is at time k (null = in his hand)
function sbShieldPos(a,k,f,o){ const S=SB12, seg=(r,from,to,arc,side)=>{ const q=ez(clamp((k-r[0])/(r[1]-r[0]),0,1)); const p=from.clone().lerp(to,q); p.y+=Math.sin(q*Math.PI)*(arc||0);
   if(side){ const sd=V(Math.cos(f.yaw),0,-Math.sin(f.yaw)); p.addScaledVector(sd,Math.sin(q*Math.PI)*side); } return p; };
 if(k<S.R1[1]) return seg(S.R1,a.hitAt0||o.chest(),sbHand(f),6,0);
 if(k>=S.T2[0]&&k<S.T2[1]) return seg(S.T2,sbHand(f),o.chest(),2,-14);
 if(k>=S.R2[0]&&k<S.R2[1]) return seg(S.R2,o.chest(),sbHand(f),8,12);
 if(k>=S.T3[0]&&k<S.T3[1]) return seg(S.T3,sbHand(f),o.chest(),-4,0);
 if(k>=S.R3[0]&&k<S.R3[1]) return seg(S.R3,o.chest(),sbHand(f),14,-10);
 if(k>=S.T4[0]&&k<S.T4[1]) return seg(S.T4,sbHand(f),sbChin(o),0,0);
 if(k>=S.R4[0]&&k<S.R4[1]) return seg(S.R4,sbChin(o),sbHand(f).add(V(0,4,0)),22,0);
 return null; }

VULT.brawl.name='SHIELD BARRAGE';
ultBrawl=function(f,a,dt,pm,o){ const t=a.t; a.brawl=1; if(a.miss) return;
 // 1. the aimed opening throw (same as before: a miss = no cutscene)
 if(once(a,'s',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); f.kb.set(0,0,0); Snd.mech&&Snd.mech(); }
 if(!a.hitT){ f.kb.multiplyScalar(.5);
  if(once(a,'throw',.3)){ a.sh={pos:sbHand(f),yaw:f.yaw,d:0,m:v8DiscMesh()}; if(f.P.v8shield) f.P.v8shield.visible=false; Snd.whoosh(); }
  const S=a.sh; if(S){ const step=150*dt; if(canHit(o)){ const want=Math.atan2(o.pos.x-S.pos.x,o.pos.z-S.pos.z); S.yaw+=clamp(angDiff(want,S.yaw)||0,-.5*dt,.5*dt); }
   S.pos.x+=Math.sin(S.yaw)*step; S.pos.z+=Math.cos(S.yaw)*step; S.d+=step; S.pos.y=lerp(S.pos.y,canHit(o)?o.chest().y:10,dt*3); S.m.position.copy(S.pos); S.m.rotation.y+=dt*20;
   if(Math.random()<dt*25) wfxSprite('spray',S.pos.clone(),7,.3,{grow:.3});
   if(canHit(o)&&S.pos.distanceTo(o.chest())<o.radius()+6){ a.hitT=t; a.hitAt0=S.pos.clone(); ultHit(f,o,6*pm,0,0,o.chest()); clangFX(o.chest()); wfxHit(o.chest(),12); toast('BAM!','#ffd43b',260); ultLanded(f,a); }
   else if(S.d>150){ scene.remove(S.m); a.sh=null; if(f.P.v8shield) f.P.v8shield.visible=true; ultMiss(f,a,t); } }
  if(t>2&&!a.hitT&&!a.miss){ if(a.sh){ scene.remove(a.sh.m); a.sh=null; } if(f.P.v8shield) f.P.v8shield.visible=true; ultMiss(f,a,t); }
  return; }
 const k=t-a.hitT, C=SB12; a.dur=Math.max(a.dur,a.hitT+C.END); f.kb.set(0,0,0);
 if(k<C.BASH){ ultHold(o,null); o.pos.y=0; if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); }
 // the shield: flying or in his hand
 const sp=sbShieldPos(a,k,f,o);
 if(sp){ if(!a.sh) a.sh={m:v8DiscMesh()}; a.sh.m.position.copy(sp); a.sh.m.rotation.y+=dt*26; a.sh.m.rotation.z=Math.sin(k*9)*.5; if(f.P.v8shield) f.P.v8shield.visible=false;
  if(Math.random()<dt*35) wfxSprite(Math.random()<.5?'spray':'sprayM',sp.clone(),7,.3,{grow:.35}); if(Math.random()<dt*14) wfxSprite(Math.random()<.5?'curl':'curlM',sp.clone(),9,.4,{grow:.3,spin:rand(-4,4)}); }
 else if(a.sh){ scene.remove(a.sh.m); a.sh=null; if(f.P.v8shield) f.P.v8shield.visible=true; Snd.block(); burst(f.chest(),0xffffff,10,8); }
 const hitFX=(at,word,col,dmg)=>{ ultHit(f,o,dmg*pm,0,0,null); clangFX(at); wfxHit(at,12); burst(at,WATER,16,18); toast(word,col,260); game.shake=Math.max(game.shake,.7); game.hitStop=Math.max(game.hitStop,.06); Snd.thud&&Snd.thud(); };
 // 2. SPIN TOSS
 if(once(a,'w2',a.hitT+C.T2[0])){ Snd.whoosh(); wfxFlat('whirl',f.pos.x,f.pos.z,16,.5,0,6); }
 if(once(a,'h2',a.hitT+C.T2[1])) hitFX(o.chest(),'WHAM!','#7fd4ff',5);
 // 3. JUMP SPIN TOSS
 if(k>=C.R2[1]&&k<C.LAND){ const q=(k-C.R2[1])/(C.LAND-C.R2[1]); f.pos.y=Math.sin(q*Math.PI)*28; f.vy=0; f.onGround=false; if(Math.random()<dt*20) wfxSprite('foam',f.pos.clone().add(V(0,2,0)),6,.3,{grow:.4}); }
 if(once(a,'jump',a.hitT+C.R2[1])){ Snd.whoosh(); ring(f.pos.x,.5,f.pos.z,14,WATER,.4); wfxFlat('ripple',f.pos.x,f.pos.z,16,.5); }
 if(once(a,'w3',a.hitT+C.T3[0])) Snd.whoosh();
 if(once(a,'h3',a.hitT+C.T3[1])) hitFX(o.chest(),'KRAK!','#ff6b6b',5);
 if(once(a,'land',a.hitT+C.LAND)){ f.pos.y=0; f.onGround=true; dust(f.pos.x,f.pos.z,8,8); wfxFlat('ripple',f.pos.x,f.pos.z,18,.6); Snd.thud&&Snd.thud(); }
 // 4. OFF THE CHIN: slow-mo, the monster's head snaps back
 if(once(a,'w4',a.hitT+C.T4[0])) Snd.whoosh();
 if(once(a,'chin',a.hitT+C.T4[1])){ const at=sbChin(o); hitFX(at,'POW!','#ffd43b',7); cineFlash(); cineFreeze(450,.7); a.chinT=k; Snd.tone('square',900,200,.25,.1); }
 if(a.chinT!=null&&k<C.BASH) o.tilt=lerp(o.tilt,-.55,Math.min(1,dt*14));   // head and body rocked back
 // 5. charge behind the giant water shield... ULTIMATE SHIELD BASH
 if(k>=C.R4[1]&&k<C.BASH){ const toO=V(o.pos.x-f.pos.x,0,o.pos.z-f.pos.z), d=toO.length(); if(d>o.radius()+f.radius()+2){ toO.normalize(); f.pos.addScaledVector(toO,Math.min(d-(o.radius()+f.radius()+2),170*dt)); }
  if(!a.ws){ a.ws=wsMake(); Snd.tone('sawtooth',120,500,.4,.1); Snd.whoosh(); }
  const W=a.ws, q=clamp((k-C.R4[1])/(C.BASH-C.R4[1]),0,1), r=lerp(8,28,ez(q))*(f.scale||1), fw=V(Math.sin(f.yaw),0,Math.cos(f.yaw));
  W.position.copy(f.chest()).addScaledVector(fw,f.radius()+5); W.lookAt(W.position.clone().add(fw)); W.rotateZ(a.t*6); W.scale.setScalar(r);
  if(Math.random()<dt*40){ const g=rand(0,6.28); wfxSprite(Math.random()<.5?'spray':'sprayM',W.position.clone().add(V(Math.cos(g)*r,Math.sin(g)*r,0)),8,.3,{grow:.4}); } }
 if(once(a,'bash',a.hitT+C.BASH)){ const at=o.chest(); wsKill(a,true); ultHit(f,o,22*pm,0,0,null); clangFX(at); wfxHit(at,16); burst(at,0xffffff,40,30); burst(at,WATER,40,34);
  a.fly={dir:V(Math.sin(f.yaw),0,Math.cos(f.yaw)),y0:o.pos.y}; o.flying=true; cineFlash(); cineFreeze(380,.7); flashScreen('#7fd4ff'); game.shake=Math.max(game.shake,1.6); game.hitStop=Math.max(game.hitStop,.15); Snd.boom(); toast('THWACK!','#ffd43b',320); }
 // 6. LAUNCHED LIKE A BEAM: a straight line with a water trail, crash far away
 if(a.fly&&k<C.CRASH){ ultHold(o,null); o.pos.addScaledVector(a.fly.dir,200*dt); o.pos.y=lerp(o.pos.y,6,dt*6); o.tilt=lerp(o.tilt,-1.3,Math.min(1,dt*10));
  a._tr=(a._tr||0)-dt; if(a._tr<=0){ a._tr=.02; const p=o.chest().addScaledVector(a.fly.dir,-o.radius()); wfxSprite(Math.random()<.5?'curl':'curlM',p,15,.6,{grow:.3}); wfxSprite('foam',p.clone().add(V(rand(-3,3),rand(-3,3),rand(-3,3))),9,.45,{grow:.4}); wfxSprite('crest',p.clone().addScaledVector(a.fly.dir,-6),18,.5,{grow:.2}); } }
 if(a.fly&&once(a,'crash',a.hitT+C.CRASH)){ const x=o.pos.x,z=o.pos.z; o.pos.y=0; o.flying=false; o.stun=Math.max(o.stun,1.5); ultHit(f,o,8*pm,0,0,null);
  smash(x,z,14,0,a.fly.dir.x,a.fly.dir.z,2,80); dust(x,z,16,16); wfxRing(x,z,36,.8); wfxColumn(x,z,40,8); wfxFlat('whirl',x,z,30,1,0,8); game.shake=Math.max(game.shake,1.5); Snd.boom(); banner('K.O.!',900); }
 if(k>C.CRASH+.1&&o.flying) o.flying=false;
};
// if the cutscene ends early: stand the monster back up, clean up the flying shield
{ const o=cineEnd; cineEnd=function(){ const a=CINE.a, f=CINE.f, m=CINE.o; if(a&&a.sh&&a.sh.m){ scene.remove(a.sh.m); a.sh=null; } if(f&&f.P&&f.P.v8shield) f.P.v8shield.visible=true; if(m) m.flying=false; if(f&&f.pos.y>0&&a&&a.brawl){ f.pos.y=0; f.onGround=true; } o(); }; }

/* ---------------- VALOR's body for each throw ---------------- */
uPoseBrawl=function(k,f,a){ const t=a.t;
 if(a.miss){ k.armL=-.4; k.elL=-.8; k.azL=.3; k.armR=-1; k.elR=-1.5; k.lean=.3; k.twist=.3; k.knL=.4; k.knR=.3; k.legL=-.3; k.headX=.2; return; }
 if(a.hitT==null){ const w=uq(t,0,.26), s=uq(t,.26,.4);      // wind up and throw
  k.armL=lerp(-1.1,-1.4,w); k.azL=lerp(lerp(.2,1.1,w),-.85,s); k.elL=lerp(lerp(-1.2,-1.4,w),0,s); k.twist=lerp(lerp(0,-.8,w),.6,s); k.lean=lerp(lerp(0,-.1,w),.25,s); k.armR=-.5; k.elR=-1.1;
  k.legL=lerp(.2*w,-.7,s); k.knL=lerp(.3*w,.3,s); k.legR=lerp(-.2*w,.4,s); k.knR=lerp(.5*w,.4,s); return; }
 const kk=t-a.hitT, C=SB12, catchP=()=>{ k.armL=-1.5; k.elL=-.5; k.azL=.1; k.armR=-1.1; k.elR=-1.5; k.azR=.3; k.legL=-.4; k.knL=.4; k.legR=.3; k.knR=.45; k.lean=.12; };
 if(kk<C.R1[1]){ const r=uq(kk,.05,.3); catchP(); k.armL=lerp(-1.4,-1.65,r); k.elL=lerp(0,-.05,r); k.azL=lerp(-.85,-.1,r); k.twist=lerp(.6,-.1,r); return; }   // reach and catch
 if(kk<C.T2[0]+.05){ // SPIN TOSS: one full turn, the arm whips out on release
  const q=uq(kk,C.R1[1],C.T2[0]); k.spin=q*Math.PI*2; k.armL=-1.45; k.azL=lerp(.9,-.85,uq(kk,C.T2[0]-.06,C.T2[0]+.02)); k.elL=lerp(-.6,0,q); k.armR=-.9; k.elR=-1.4; k.azR=.4;
  k.lean=.2; k.knL=k.knR=.45; k.legL=-.3; k.legR=.2; return; }
 if(kk<C.R2[1]){ catchP(); k.azL=lerp(-.85,-.1,uq(kk,C.R2[0],C.R2[1])); k.lean=.15; return; }
 if(kk<C.LAND){ // JUMP SPIN TOSS: tuck, spin in the air, throw down at the monster
  const q=uq(kk,C.R2[1],C.T3[0]); k.spin=q*Math.PI*2; k.knL=k.knR=1.2; k.legL=k.legR=-.6; k.armR=-1; k.elR=-1.4;
  const rel=uq(kk,C.T3[0]-.05,C.T3[0]+.03); k.armL=lerp(-1.4,-1.15,rel); k.azL=lerp(.9,-.85,rel); k.elL=lerp(-.7,0,rel); k.lean=lerp(.1,.55,rel); return; }
 if(kk<C.R3[1]){ const l=1-uq(kk,C.LAND,C.LAND+.12)*.6; catchP(); k.knL=k.knR=.9*l+.3; k.legL=k.legR=-.6*l; k.lean=.4*l+.1; k.azL=lerp(-.85,-.1,uq(kk,C.R3[0],C.R3[1])); return; }
 if(kk<C.R4[0]){ // UNDERHAND toss up at the chin
  const w=uq(kk,C.R3[1],C.T4[0]-.04), s=uq(kk,C.T4[0]-.04,C.T4[0]+.04); k.armL=lerp(lerp(-1.5,.6,w),-2.3,s); k.elL=lerp(-.5,-.1,w); k.azL=.15; k.knL=k.knR=lerp(.4,1.1,w)*(1-s*.7); k.legL=-.7*w; k.legR=.3;
  k.lean=lerp(lerp(.12,.45,w),-.2,s); k.twist=lerp(.3*w,-.2,s); k.armR=-1.1; k.elR=-1.5; k.headX=lerp(.2*w,-.3,s); return; }
 if(kk<C.R4[1]){ k.armL=lerp(-2.3,-2.6,uq(kk,C.R4[0],C.R4[1])); k.elL=-.1; k.azL=.1; k.armR=-1.1; k.elR=-1.5; k.headX=-.35; k.lean=-.1; k.legL=-.3; k.knL=.3; return; }   // reaches up to catch it
 if(kk<C.BASH){ uRun(k,22); k.lean=.65; k.armL=-1.55; k.elL=-.15; k.azL=.5; k.armR=-.9; k.elR=-1.5; k.azR=.2; k.headX=.25; return; }       // the charge
 if(kk<C.BASH+.6){ k.armL=-1.62; k.elL=-.05; k.azL=.2; k.twist=.75; k.lean=.5; k.legL=-.95; k.knL=.4; k.legR=.55; k.knR=.6; k.armR=-.6; k.elR=-1.2; return; }   // BASH follow-through
 const st=uq(kk,C.BASH+.6,C.BASH+.95); k.armL=lerp(-1.62,-1.0,st); k.elL=lerp(-.05,-1.4,st); k.azL=.35; k.twist=lerp(.75,.15,st); k.lean=lerp(.5,-.05,st); k.legL=lerp(-.95,-.25,st); k.knL=lerp(.4,.15,st); k.legR=lerp(.55,.15,st); k.knR=lerp(.6,.1,st);
 k.armR=lerp(-.6,-.25,st); k.elR=lerp(-1.2,-.3,st); k.headX=.05; };   // stands tall, shield up, watching it fly

/* ---------------- the camera: a new angle for every throw ---------------- */
{ const oC=cineCam; cineCam=function(){ const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o||!CINE.brawl||a.hitT==null) return oC();
  const k=a.t-a.hitT, C=SB12, fc=f.chest(), oc=o.chest(), toO=V(o.pos.x-f.pos.x,0,o.pos.z-f.pos.z).normalize(), sd=V(toO.z,0,-toO.x), mid=fc.clone().lerp(oc,.5);
  if(k<.12){ cineShot(0); camAt(oc.clone().addScaledVector(toO,-16).addScaledVector(sd,10).add(V(0,2,0)),oc); return; }   // impact close-up (quote)
  if(k<C.R1[1]){ if(cineShot(9)) cq.classList.remove('show'); camAt(fc.clone().addScaledVector(toO,16).addScaledVector(sd,-12).add(V(0,-2,0)),fc.clone().add(V(0,2,0))); return; }   // VALOR catches it
  if(k<C.T2[1]){ cineShot(1); const g=(k-C.R1[1])*2; camAt(fc.clone().addScaledVector(toO,20).addScaledVector(sd,Math.sin(g)*14).add(V(0,-3,0)),fc.clone().add(V(0,3,0))); return; }       // low in front: the spin toss
  if(k<C.R2[1]){ cineShot(2); camAt(oc.clone().addScaledVector(toO,14).addScaledVector(sd,-12).add(V(0,6,0)),fc); return; }                                                                  // over the monster's shoulder
  if(k<C.R3[1]){ if(cineShot(3)) cineEl.classList.add('comic'); camAt(V(f.pos.x,0,f.pos.z).addScaledVector(sd,40).addScaledVector(toO,-16).add(V(0,3,0)),fc.clone().lerp(oc,.25)); return; } // ground, looking up at the jump (keeps VALOR in frame)
  if(k<C.R4[0]+.25){ if(cineShot(4)) cineEl.classList.remove('comic'); const ch=sbChin(o); camAt(V(f.pos.x,2,f.pos.z).addScaledVector(toO,-14).addScaledVector(sd,9),ch.clone().lerp(fc,.35)); return; }   // low behind VALOR, looking up past him at the chin
  if(k<C.BASH){ cineShot(5); camAt(f.pos.clone().addScaledVector(toO,-28).addScaledVector(sd,16).add(V(0,16,0)),fc.clone().lerp(oc,.4)); return; }                                              // behind the charge
  if(k<C.BASH+.15){ if(cineShot(6)) cineEl.classList.add('comic'); camAt(mid.clone().addScaledVector(sd,24).add(V(0,-1,0)),mid); return; }                                                     // side freeze on the BASH
  if(k<C.CRASH+.1){ if(cineShot(7)) cineEl.classList.remove('comic'); const d=a.fly?a.fly.dir:toO, s2=V(d.z,0,-d.x); camAt(oc.clone().addScaledVector(d,-30).addScaledVector(s2,18).add(V(0,8,0)),oc); return; } // chase the flying monster
  if(cineShot(8)) cineFlash(); const g=uq(k,C.CRASH+.1,C.END)*.8; camAt(fc.clone().addScaledVector(toO,20).addScaledVector(sd,-10+16*g).add(V(0,-3,0)),fc.clone().add(V(0,3,0)));                                                       // hero shot: VALOR, the crash far behind
  if(k>C.END-.05||!f.atk||f.atk.id!=='ultimate') cineEnd(); }; }

/* v2 (MajorasPride: "he should be running to him while throwing, like he's closing the distance", plus some shots
   from a flat side-on fighting-game angle like MvC / Captain America's shield throw):
   - from the first catch until the last catch he runs at the monster, closing the gap a bit more with every throw
   - catches happen on the run (running legs), throws are lunging throws (front knee bent, back leg straight)
   - the spin toss and the jump toss are shown from the side, both titans in frame like a 2D fighting game */
{ const oB=ultBrawl; ultBrawl=function(f,a,dt,pm,o){ oB(f,a,dt,pm,o); if(!a.hitT||a.miss) return; const k=a.t-a.hitT, C=SB12;
  if(k<C.R4[1]){ if(a.d0==null) a.d0=Math.hypot(o.pos.x-f.pos.x,o.pos.z-f.pos.z); const near=o.radius()+f.radius()+22, want=lerp(a.d0,near,clamp(k/C.R4[1],0,1));
   const toO=V(o.pos.x-f.pos.x,0,o.pos.z-f.pos.z), d=toO.length(); if(d>want){ toO.normalize(); f.pos.addScaledVector(toO,Math.min(d-want,90*dt)); }
   if(f.onGround&&Math.random()<dt*10) dust(f.pos.x,f.pos.z,3,3); } }; }
{ const oP=uPoseBrawl; uPoseBrawl=function(k,f,a){ oP(k,f,a); if(a.hitT==null||a.miss) return; const kk=a.t-a.hitT, C=SB12;
  const lunge=(t0)=>{ const w=Math.max(0,1-Math.abs(kk-t0)/.12); if(w>0){ k.legL=lerp(k.legL,-1.05,w); k.knL=lerp(k.knL,.55,w); k.legR=lerp(k.legR,.75,w); k.knR=lerp(k.knR,.08,w); k.lean=lerp(k.lean,.45,w); } return w>0; };
  if(lunge(C.T2[0])||lunge(C.T4[0])) return;            // lunging release (the jump toss stays in the air)
  const run=(kk<C.R1[1]&&kk>.08)||(kk>=C.T2[0]+.12&&kk<C.R2[1])||(kk>=C.LAND+.1&&kk<C.R3[1])||(kk>=C.R4[0]&&kk<C.R4[1]);
  if(run){ const T=game.time*18; k.legL=-.85*Math.sin(T); k.legR=.85*Math.sin(T); k.knL=.6+.4*Math.cos(T); k.knR=.6-.4*Math.cos(T); k.lean=Math.max(k.lean,.3); } }; }
{ const oC=cineCam; cineCam=function(){ const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o||!CINE.brawl||a.hitT==null) return oC(); const k=a.t-a.hitT, C=SB12;
  const side=(k>=C.R1[1]&&k<C.T2[1])||(k>=C.R2[1]&&k<C.R3[1]); if(!side) return oC();
  if(cineShot(k<C.T2[1]?40:41)) cineEl.classList.remove('comic');
  const fc=f.chest(), oc=o.chest(), mid=V((f.pos.x+o.pos.x)/2,0,(f.pos.z+o.pos.z)/2), toO=V(o.pos.x-f.pos.x,0,o.pos.z-f.pos.z), d=toO.length(); toO.normalize(); const sd=V(toO.z,0,-toO.x);
  const back=Math.max(60,(d+o.radius()*2+20)*.9), hy=(fc.y-f.pos.y)*.9;          // flat side view, both titans in frame
  camAt(mid.clone().addScaledVector(sd,back).add(V(0,hy,0)),mid.clone().add(V(0,hy+Math.max(0,f.pos.y)*.4,0))); }; }
