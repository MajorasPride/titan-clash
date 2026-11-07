/* =====================================================================
   TITAN CLASH: OLD VALOR ULTIMATE CODE (taken out Nov 7, 2026, never used anymore)
   Each of these was fully replaced by a newer version before the game ever ran it:
   - Sandbox 8 TIDECREST OATH + ALL DAY STAR RUSH (were in 16-valor-ults.js)
   - Sandbox 9 sword cutscene version, Sandbox 10 SHIELD PIN (two versions) + its water-shield add-on (were in 17-valor-cine.js)
   The live versions are Shield Barrage (21-shield-barrage.js) and the flash-step Tidecrest Oath (22-sword-flash.js).
   ===================================================================== */

/* ---- from 17-valor-cine.js, lines 269-275: water-shield add-on for the old SHIELD PIN ---- */
{ const oB=ultBrawl; ultBrawl=function(f,a,dt,pm,o){ oB(f,a,dt,pm,o); if(!a.hitT||a.miss) return; const k=a.t-a.hitT;
  if(k>=.48&&k<.8){ if(!a.ws){ a.ws=wsMake(); Snd.tone('sawtooth',120,500,.4,.1); Snd.whoosh(); }
   const W=a.ws, q=clamp((k-.48)/.25,0,1), r=lerp(8,26,ez(q))*(f.scale||1), fw=V(Math.sin(f.yaw),0,Math.cos(f.yaw));
   W.position.copy(f.chest()).addScaledVector(fw,f.radius()+5); W.lookAt(W.position.clone().add(fw)); W.rotateZ(a.t*6); W.scale.setScalar(r);
   if(Math.random()<dt*40){ const g=rand(0,6.28); wfxSprite(Math.random()<.5?'spray':'sprayM',W.position.clone().add(V(Math.cos(g)*r,Math.sin(g)*r,0)),8,.3,{grow:.4}); }
   if(Math.random()<dt*20) wfxSprite('crest',f.pos.clone().addScaledVector(fw,-6).add(V(0,2,0)),16,.4,{grow:.3}); }
  if(k>=.8&&a.ws){ wsKill(a,true); ring(o.pos.x,4,o.pos.z,30,WATER,.5); game.shake=Math.max(game.shake,1.3); } }; }

/* ---- from 17-valor-cine.js, lines 207-236: SHIELD PIN v3 ---- */
ultBrawl=function(f,a,dt,pm,o){ const t=a.t; a.brawl=1; if(a.miss) return;
 if(once(a,'s',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); f.kb.set(0,0,0); Snd.mech&&Snd.mech(); }
 if(!a.hitT){ f.kb.multiplyScalar(.5);
  if(once(a,'throw',.3)){ a.sh={pos:f.chest().add(V(Math.sin(f.yaw)*6,0,Math.cos(f.yaw)*6)),yaw:f.yaw,d:0,m:v8DiscMesh()}; if(f.P.v8shield) f.P.v8shield.visible=false; Snd.whoosh(); }
  const S=a.sh; if(S){ const step=150*dt; if(canHit(o)){ const want=Math.atan2(o.pos.x-S.pos.x,o.pos.z-S.pos.z); S.yaw+=clamp(angDiff(want,S.yaw)||0,-.5*dt,.5*dt); }
   S.pos.x+=Math.sin(S.yaw)*step; S.pos.z+=Math.cos(S.yaw)*step; S.d+=step; S.pos.y=lerp(S.pos.y,canHit(o)?o.chest().y:10,dt*3); S.m.position.copy(S.pos); S.m.rotation.y+=dt*20;
   if(Math.random()<dt*25) wfxSprite('spray',S.pos.clone(),7,.3,{grow:.3});
   if(canHit(o)&&S.pos.distanceTo(o.chest())<o.radius()+6){ a.hitT=t; a.hitAt0=S.pos.clone(); ultHit(f,o,8*pm,6,0,o.chest()); clangFX(o.chest()); wfxHit(o.chest(),12); ultLanded(f,a); }
   else if(S.d>150){ scene.remove(S.m); a.sh=null; if(f.P.v8shield) f.P.v8shield.visible=true; ultMiss(f,a,t); } }
  if(t>2&&!a.hitT&&!a.miss){ if(a.sh){ scene.remove(a.sh.m); a.sh=null; } if(f.P.v8shield) f.P.v8shield.visible=true; ultMiss(f,a,t); }
  return; }
 const k=t-a.hitT, S=a.sh; a.dur=Math.max(a.dur,a.hitT+2.6); ultHold(o,null); if(k<.85) f.kb.set(0,0,0);
 // 2. the shield ricochets straight back to VALOR
 if(S&&k<.5){ const hand=f.chest().add(V(Math.sin(f.yaw)*4,0,Math.cos(f.yaw)*4)); S.pos.lerp(hand,Math.min(1,dt*7)); S.m.position.copy(S.pos); S.m.rotation.y-=dt*24; if(Math.random()<dt*30) wfxSprite('spray',S.pos.clone(),6,.3,{grow:.3}); if(Math.random()<dt*18) wfxSprite(Math.random()<.5?'curl':'curlM',S.pos.clone(),9,.45,{grow:.3,spin:rand(-4,4)}); }
 if(once(a,'catch',a.hitT+.48)&&S){ scene.remove(S.m); a.sh=null; if(f.P.v8shield) f.P.v8shield.visible=true; Snd.block(); burst(f.chest(),0xffffff,14,10); }
 // 3. he charges in and takes the legs out: the monster DROPS
 if(k>=.5&&k<.8){ const toO=V(o.pos.x-f.pos.x,0,o.pos.z-f.pos.z), d=toO.length(); if(d>o.radius()+f.radius()+2){ toO.normalize(); f.pos.addScaledVector(toO,Math.min(d-(o.radius()+f.radius()+2),140*dt)); f.yaw=Math.atan2(toO.x,toO.z); }
  if(Math.random()<dt*30) wfxSprite('foam',f.pos.clone().add(V(0,3,0)),7,.3,{grow:.4}); if(Math.random()<dt*14) wfxSprite('crest',f.pos.clone().add(V(0,2,0)),14,.45,{grow:.3}); if(Math.random()<dt*10) wfxFlat('ripple',f.pos.x,f.pos.z,10,.5); }
 if(once(a,'drop',a.hitT+.8)){ const at=o.pos.clone().add(V(0,4,0)); clangFX(at); wfxHit(at,12); ultHit(f,o,8*pm,0,0,null); o.pos.y=0; o.vy=0; o.stun=Math.max(o.stun,2); a.down=1;
  ring(o.pos.x,.5,o.pos.z,26,WATER,.5); dust(o.pos.x,o.pos.z,12,12); wfxFlat('ripple',o.pos.x,o.pos.z,28,.8); game.shake=Math.max(game.shake,1.1); game.hitStop=Math.max(game.hitStop,.12); Snd.boom(); Snd.thud&&Snd.thud(); toast('DOWN!','#ffd43b',300); wfxColumn(o.pos.x,o.pos.z,22,5); for(let i=0;i<5;i++){ const g=i/5*Math.PI*2; wfxSprite(i%2?'spray':'sprayM',V(o.pos.x+Math.cos(g)*10,4,o.pos.z+Math.sin(g)*10),13,.5,{grow:.5}); } }
 // the monster lies flat while pinned
 if(a.down&&o.root){ const R=o.root; if(R&&R.rotation){ if(a._rx==null) a._rx=R.rotation.x; R.rotation.x=lerp(R.rotation.x,a._rx-1.3,Math.min(1,dt*10)); a._R=R; } }
 // 4. pinned: shield bashes, raise, SLAM
 for(let i=0;i<4;i++) if(once(a,'b'+i,a.hitT+1+i*.16)){ const at=o.pos.clone().add(V(0,4,0)); ultHit(f,o,4*pm,0,0,null); clangFX(at); wfxHit(at,8); toast(['BAM!','WHAM!','KRAK!','POW!'][i],['#ffd43b','#7fd4ff','#ff6b6b','#ffd43b'][i],260); }
 if(once(a,'raise',a.hitT+1.7)){ ring(f.pos.x,f.chest().y+10,f.pos.z,10,0xffffff,.4); burst(f.chest().add(V(0,10,0)),0xffffff,20,10); Snd.tone('triangle',500,1500,.3,.08); }
 if(once(a,'slam',a.hitT+1.95)){ const x=o.pos.x,z=o.pos.z; ultHit(f,o,22*pm,30,12,o.chest()); clangFX(o.chest()); wfxRing(x,z,34,.8); wfxFlat('whirl',x,z,28,1,0,8);
  for(let i=0;i<8;i++){ const g=i/8*Math.PI*2; wfxSprite(i%2?'crest':'foam',V(x+Math.cos(g)*16,4,z+Math.sin(g)*16),16,.7,{grow:.5}); }
  smash(x,z,10,0,0,0,2,60); dust(x,z,14,14); flashScreen('#ffd43b'); game.hitStop=Math.max(game.hitStop,.2); game.shake=Math.max(game.shake,1.5); Snd.boom(); banner('K.O.!',900); }
 if(k>2.3&&a._R){ a._R.rotation.x=a._rx; a._R=null; a.down=0; }
};

/* ---- from 17-valor-cine.js, lines 159-190: SHIELD PIN v1 ---- */
ultBrawl=function(f,a,dt,pm,o){ const t=a.t; a.brawl=1; if(a.miss) return;
 if(once(a,'s',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); f.kb.set(0,0,0); Snd.mech&&Snd.mech(); }
 if(!a.hitT){ f.kb.multiplyScalar(.5);
  if(once(a,'throw',.3)){ a.sh={pos:f.chest().add(V(Math.sin(f.yaw)*6,0,Math.cos(f.yaw)*6)),yaw:f.yaw,d:0,m:v8DiscMesh()}; if(f.P.v8shield) f.P.v8shield.visible=false; Snd.whoosh(); }
  const S=a.sh; if(S){ const step=150*dt; if(canHit(o)){ const want=Math.atan2(o.pos.x-S.pos.x,o.pos.z-S.pos.z); S.yaw+=clamp(angDiff(want,S.yaw)||0,-.5*dt,.5*dt); }
   S.pos.x+=Math.sin(S.yaw)*step; S.pos.z+=Math.cos(S.yaw)*step; S.d+=step; S.pos.y=lerp(S.pos.y,canHit(o)?o.chest().y:10,dt*3); S.m.position.copy(S.pos); S.m.rotation.y+=dt*20;
   if(Math.random()<dt*25) wfxSprite('spray',S.pos.clone(),7,.3,{grow:.3});
   if(canHit(o)&&S.pos.distanceTo(o.chest())<o.radius()+6){ a.hitT=t; ultHit(f,o,8*pm,10,0,o.chest()); clangFX(o.chest()); ultLanded(f,a); }
   else if(S.d>150){ scene.remove(S.m); a.sh=null; if(f.P.v8shield) f.P.v8shield.visible=true; ultMiss(f,a,t); } }
  if(t>2&&!a.hitT&&!a.miss){ if(a.sh){ scene.remove(a.sh.m); a.sh=null; } if(f.P.v8shield) f.P.v8shield.visible=true; ultMiss(f,a,t); }
  return; }
 const k=t-a.hitT, S=a.sh; a.dur=Math.max(a.dur,a.hitT+2.5); ultHold(o,null);
 // the shield bounces up off them
 if(S&&k<.55){ S.pos.y+=dt*30; S.m.position.copy(S.pos); S.m.rotation.y+=dt*20; }
 // VALOR leaps after it, catches it, and comes down on the rival
 if(k>=.15&&k<.6){ if(!a.j0) a.j0=f.pos.clone(); const q=(k-.15)/.45, tgt=o.pos.clone().add(V(-Math.sin(f.yaw)*(o.radius()+4),0,-Math.cos(f.yaw)*(o.radius()+4)));
  f.pos.x=lerp(a.j0.x,tgt.x,q); f.pos.z=lerp(a.j0.z,tgt.z,q); f.pos.y=Math.sin(q*Math.PI)*30; f.vy=0; f.onGround=false; f.kb.set(0,0,0);
  if(Math.random()<dt*30) wfxSprite('foam',f.pos.clone().add(V(0,4,0)),7,.3,{grow:.4}); }
 if(once(a,'catch',a.hitT+.45)&&S){ scene.remove(S.m); a.sh=null; if(f.P.v8shield) f.P.v8shield.visible=true; Snd.block(); }
 // tackle: the rival goes down flat
 if(once(a,'tackle',a.hitT+.6)){ f.pos.y=0; f.onGround=true; o.pos.y=0; o.vy=0; o.stun=Math.max(o.stun,2); ring(o.pos.x,.5,o.pos.z,24,WATER,.5); dust(o.pos.x,o.pos.z,10,10); wfxFlat('ripple',o.pos.x,o.pos.z,26,.8);
  ultHit(f,o,6*pm,0,0,o.chest()); game.shake=Math.max(game.shake,1); Snd.boom(); Snd.thud&&Snd.thud(); }
 if(k>.6){ f.kb.set(0,0,0); o.pos.y=Math.max(0,o.pos.y-dt*40); if(o.P&&o.P.root) {} }
 // pinned: shield bashes
 for(let i=0;i<4;i++) if(once(a,'b'+i,a.hitT+.75+i*.17)){ const at=o.chest().add(V(0,-2,0)); ultHit(f,o,4*pm,0,0,null); clangFX(at); wfxHit(at,8); toast(['BAM!','WHAM!','KRAK!','POW!'][i],['#ffd43b','#7fd4ff','#ff6b6b','#ffd43b'][i],260); }
 // raise the shield high...
 if(once(a,'raise',a.hitT+1.5)){ ring(f.pos.x,f.chest().y+10,f.pos.z,10,0xffffff,.4); burst(f.chest().add(V(0,10,0)),0xffffff,20,10); Snd.tone('triangle',500,1500,.3,.08); }
 // ...and SLAM it down
 if(once(a,'slam',a.hitT+1.75)){ const x=o.pos.x,z=o.pos.z; ultHit(f,o,22*pm,30,12,o.chest()); clangFX(o.chest()); wfxRing(x,z,34,.8); wfxFlat('whirl',x,z,28,1,0,8);
  for(let i=0;i<8;i++){ const g=i/8*Math.PI*2; wfxSprite(i%2?'crest':'foam',V(x+Math.cos(g)*16,4,z+Math.sin(g)*16),16,.7,{grow:.5}); }
  smash(x,z,10,0,0,0,2,60); dust(x,z,14,14); flashScreen('#ffd43b'); game.hitStop=Math.max(game.hitStop,.2); game.shake=Math.max(game.shake,1.5); Snd.boom(); banner('K.O.!',900); }
};

/* ---- from 17-valor-cine.js, lines 114-140: Sandbox 9 TIDECREST OATH ---- */
ultSword=function(f,a,dt,pm,o){ const t=a.t;
 if(a.miss) return;
 if(once(a,'plant',0)){ f.kb.set(0,0,0); ring(f.pos.x,1,f.pos.z,14,WATER,.5); burst(f.chest(),0xffffff,20,10); Snd.tone('triangle',600,1200,.3,.06); }
 if(!a.hitT){ f.kb.multiplyScalar(.5);
  // water gathers into the raised sword
  if(t<.55&&Math.random()<dt*30){ const g=rand(0,6.28), r=rand(10,18); wfxSprite(Math.random()<.5?'curl':'curlM',f.chest().add(V(Math.cos(g)*r,rand(4,12),Math.sin(g)*r)),6,.3,{grow:.2,vel:V(-Math.cos(g)*r*3,0,-Math.sin(g)*r*3)}); }
  // the dragon flies straight ahead (aimed, a tiny bit of steering)
  if(once(a,'launch',.55)){ a.dr={pos:f.chest().add(V(Math.sin(f.yaw)*8,4,Math.cos(f.yaw)*8)),yaw:f.yaw,d:0}; Snd.whoosh(); Snd.tone('sawtooth',150,500,.5,.08); game.shake=Math.max(game.shake,.6); }
  const D=a.dr; if(D){ const step=110*dt; if(canHit(o)){ const want=Math.atan2(o.pos.x-D.pos.x,o.pos.z-D.pos.z); D.yaw+=clamp(angDiff(want,D.yaw)||0,-.6*dt,.6*dt); }
   D.pos.x+=Math.sin(D.yaw)*step; D.pos.z+=Math.cos(D.yaw)*step; D.d+=step; D.pos.y=lerp(D.pos.y,(canHit(o)?o.chest().y:10),dt*2);
   D.tr=(D.tr||0)-dt; if(D.tr<=0){ D.tr=.03; wfxSprite(Math.random()<.5?'curl':'curlM',D.pos.clone(),16,.55,{grow:.3}); wfxSprite('foam',D.pos.clone().add(V(rand(-3,3),rand(-3,3),rand(-3,3))),7,.4,{grow:.3}); }
   if(canHit(o)&&D.pos.distanceTo(o.chest())<o.radius()+10){ a.hitT=t; a.dr=null; ultHit(f,o,8*pm,0,0,o.chest()); ultLanded(f,a); }
   else if(D.d>140){ wfxRing(D.pos.x,D.pos.z,20,.6); wfxSprite('splash',D.pos.clone(),20,.5,{grow:.6}); Snd.boom(); a.dr=null; ultMiss(f,a,t); } }
  if(t>2.2&&!a.hitT&&!a.miss) ultMiss(f,a,t);
  return; }
 // LANDED: coil, draw-cut from afar, sheathe, burst
 const k=t-a.hitT; f.kb.set(0,0,0); if(k<1.6) ultHold(o,10); a.dur=Math.max(a.dur,a.hitT+2.3);
 if(k<1.05){ a._dr=(a._dr||0)-dt; if(a._dr<=0&&canHit(o)){ a._dr=.04; const q=k/1.05, g=q*Math.PI*6; wfxSprite(Math.sin(g)>0?'curl':'curlM',V(o.pos.x+Math.cos(g)*15,o.pos.y+2+q*26,o.pos.z+Math.sin(g)*15),14,.9,{grow:.3,top:1}); } }
 for(let i=0;i<4;i++) if(once(a,'sq'+i,a.hitT+.2+i*.22)) ultHit(f,o,4*pm,0,0,o.chest());   // the dragon squeezes
 if(once(a,'draw',a.hitT+1.15)){ f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); a.trail=true; Snd.tone('sawtooth',1400,200,.18,.08);
  // one huge painted slash line from VALOR to the rival
  const n=10; for(let i=0;i<n;i++){ const p=f.chest().lerp(o.chest(),i/(n-1)); wfxSprite('crest',p,18,.6,{grow:.3,top:1}); }
  ultHit(f,o,20*pm,0,0,o.chest()); slashFX(o.chest(),f); game.hitStop=Math.max(game.hitStop,.15); }
 if(once(a,'turn',a.hitT+1.4)){ a.trail=false; f.yaw+=Math.PI; }
 if(once(a,'click',a.hitT+1.7)){ Snd.tone('square',2400,1800,.05,.08); Snd.tone('triangle',1600,1600,.08,.05); }
 if(once(a,'burst',a.hitT+1.85)&&canHit(o)){ const x=o.pos.x,z=o.pos.z; wfxRing(x,z,32,.8); wfxFlat('whirl',x,z,26,1,0,6); for(let i=0;i<8;i++){ const g=i/8*Math.PI*2; wfxSprite(i%2?'curl':'curlM',V(x+Math.cos(g)*14,8,z+Math.sin(g)*14),18,.7,{grow:.5}); }
  ultHit(f,o,12*pm,40,20,o.chest()); game.shake=Math.max(game.shake,1.3); Snd.boom(); banner('TIDECREST OATH!',900); } };

/* ---- from 16-valor-ults.js, lines 37-78: Sandbox 8 TIDECREST OATH + ALL DAY STAR RUSH ---- */
/* ---------------- SWORD: TIDECREST OATH ---------------- */
function ultSword(f,a,dt,pm,o){ const t=a.t, c=()=>o.chest();
 if(once(a,'salute',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); ring(f.pos.x,1,f.pos.z,14,WATER,.5); burst(f.chest(),0xffffff,20,10); Snd.tone('triangle',600,1200,.3,.06); }
 // the flowing strikes: flash through the rival from side to side
 if(a.miss){ return; }
 // lunge in toward the rival first (aimed: no turning once it starts), then check if the first cut reaches
 if(t<.35&&canHit(o)&&dist2(f,o)>f.radius()+o.radius()+8){ f.kb.x=Math.sin(f.yaw)*120; f.kb.z=Math.cos(f.yaw)*120; if(Math.random()<dt*30) wfxSprite(Math.random()<.5?'curl':'curlM',f.pos.clone().add(V(0,5,0)),9,.35,{grow:.4}); }
 if(t>=.35&&!a._chk){ a._chk=1; f.kb.multiplyScalar(.2); const ang=canHit(o)?Math.abs(angDiff(f.yaw,Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z))):9;
  if(!(canHit(o)&&dist2(f,o)<f.radius()+o.radius()+16&&ang<1.2)){ ultMiss(f,a,t); return; } }
 const N=6; for(let i=0;i<N;i++) if(once(a,'d'+i,.35+i*.2)&&canHit(o)){
  if(i===0) ultLanded(f,a);
  const ang=f.yaw+Math.PI+(i%2?1:-1)*(.6+i*.15), r=14+o.radius(), p0=f.pos.clone();
  f.pos.set(o.pos.x+Math.sin(ang)*r,o.pos.y>3?o.pos.y:0,o.pos.z+Math.cos(ang)*r); f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z);
  a.trail=true; const mid=p0.clone().lerp(f.pos,.5).add(V(0,c().y-o.pos.y,0)); for(let k=0;k<4;k++) wfxSprite(k%2?'curl':'curlM',p0.clone().lerp(f.pos,(k+.5)/4).add(V(0,8,0)),10,.5,{grow:.4,top:1});
  ultHit(f,o,4*pm,0,0,c()); slashFX(c(),f); Snd.tone('sawtooth',900,200,.12,.06); game.hitStop=Math.max(game.hitStop,.04); }
 if(t>.3&&t<1.6) ultHold(o,8);
 // the water dragon coils around the rival
 if(t>.5&&t<1.7){ a._dr=(a._dr||0)-dt; if(a._dr<=0&&canHit(o)){ a._dr=.05; const k=(t-.5)/1.2, g=k*Math.PI*5; wfxSprite(Math.sin(g)>0?'curl':'curlM',V(o.pos.x+Math.cos(g)*16,o.pos.y+2+k*26,o.pos.z+Math.sin(g)*16),13,.9,{grow:.3,top:1}); } }
 // one huge rising cut splits the dragon
 if(once(a,'rise',1.75)&&canHit(o)){ a.trail=true; f.pos.set(o.pos.x-Math.sin(f.yaw)*10,0,o.pos.z-Math.cos(f.yaw)*10); ultHit(f,o,18*pm,8,30,c()); slashFX(c(),f); wfxColumn(o.pos.x,o.pos.z,40,8); flashScreen('#7fd4ff'); game.hitStop=Math.max(game.hitStop,.15); game.shake=Math.max(game.shake,1); Snd.boom(); banner('TIDECREST OATH!',900); }
 // turn the back, sheathe (click), the wave crashes behind him
 if(once(a,'turn',2.15)){ f.yaw+=Math.PI; a.trail=false; }
 if(once(a,'click',2.45)){ Snd.tone('square',2400,1800,.05,.08); Snd.tone('triangle',1600,1600,.08,.05); toast('*click*','#ffffff',600); }
 if(once(a,'crash',2.6)&&canHit(o)){ const x=o.pos.x,z=o.pos.z; wfxRing(x,z,32,.8); for(let i=0;i<8;i++){ const g=i/8*Math.PI*2; wfxSprite(i%2?'curl':'curlM',V(x+Math.cos(g)*14,6,z+Math.sin(g)*14),18,.7,{grow:.5}); }
  aoe(f,o,x,z,18,10*pm,40,6,WATER); game.shake=Math.max(game.shake,1.3); Snd.boom(); }
 if(t>2.1) a.trail=false; }

/* ---------------- BRAWLER: ALL DAY STAR RUSH ---------------- */
function ultBrawl(f,a,dt,pm,o){ const t=a.t; a.brawl=1;
 if(once(a,'s',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); Snd.mech&&Snd.mech(); }
 // star rush: charge until contact
 if(!a.contact&&t<1){ f.kb.x=Math.sin(f.yaw)*95; f.kb.z=Math.cos(f.yaw)*95; if(Math.random()<dt*30){ burst(f.chest(),0xffd43b,3,8); wfxSprite('splash',f.pos.clone().add(V(0,4,0)),8,.3,{grow:.5}); }
  if(canHit(o)&&dist2(f,o)<f.radius()+o.radius()+6){ a.contact=t; f.kb.set(0,0,0); ultHit(f,o,8*pm,0,0,o.chest()); ultLanded(f,a); } }
 if(!a.contact&&t>=1){ if(!a.miss) ultMiss(f,a,t); return; }   // missed: short recovery, no cutscene
 if(!a.contact) return; const k=t-a.contact;
 if(k<2) ultHold(o,k<1.4?6:null);
 // comic-panel beatdown
 for(let i=0;i<9;i++) if(once(a,'p'+i,.15+i*.13)&&canHit(o)){ const at=o.chest().add(V(rand(-3,3),rand(-2,4),rand(-3,3))); ultHit(f,o,3.5*pm,0,0,null); punchFX(at,i%3===2); wfxHit(at,9);
  if(i%2===0) toast(POW[(i/2)%POW.length|0],['#ffd43b','#ff6b6b','#7fd4ff'][i%3],260); game.hitStop=Math.max(game.hitStop,.03); }
 // KO uppercut up a giant water geyser
 if(once(a,'ko',1.45)&&canHit(o)){ const at=o.chest(); ultHit(f,o,20*pm,6,46,at); wfxColumn(o.pos.x,o.pos.z,50,10); wfxRing(o.pos.x,o.pos.z,22,.7); burst(at,0xffd43b,40,30);
  flashScreen('#ffd43b'); game.hitStop=Math.max(game.hitStop,.18); game.shake=Math.max(game.shake,1.3); Snd.boom(); banner('K.O.!',900); a.dur=Math.min(a.dur,t+.9); } }
