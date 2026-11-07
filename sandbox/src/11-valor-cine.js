/* =====================================================================
   SANDBOX TEST 9: ULTIMATE = ANNOUNCEMENT CARD, THEN A REAL CUTSCENE IF IT LANDS (Nov 6, 2026)
   MajorasPride: "Keep the cutscene announcement, then the cutscene shows the ability if landed.
   No voice, just text. Needs to be cool."
   1. PRESS: a short cutscene card (black bars, his name, the ultimate's name, and an announce line if the stance has one). Text only, no voice.
   2. LANDS: a directed cutscene of the ability itself. HUD hidden, black bars, camera shots
      (close-ups, orbits, low angles, freeze frames), the quote as big comic text, ink-wash look.
      SWORD (TIDECREST OATH): quote close-up -> orbit shot through the flash cuts -> low shot of the
      water dragon -> freeze on the rising cut -> "already cut" shot: VALOR faces the camera and
      sheathes while the wave crashes behind him.
      BRAWLER (STAR RUSH): quote close-up -> every punch is a new camera angle with a comic word
      (like comic panels) -> freeze on the KO uppercut -> camera follows them up the geyser.
   3. MISSES: no cutscene.
   Voice is off for these (text only).
   ===================================================================== */
VULT.sword.announce="IF I DON'T... WHO WILL!";   // MajorasPride: said when the ultimate starts (Goku-style line)
VULT.sword.line="LET THEM COME.";   // MajorasPride: said in the cutscene when it lands (Optimus Prime nod)
VULT.brawl.announce="FEAR NOT! I'M HERE NOW!";   // MajorasPride: Brawler intro line (Nov 6)
VULT.brawl.line="THIS CITY HAS A SHIELD!";   // MajorasPride picked this one (Nov 6)
VULT.brawl.name='STAR RUSH';
const CINE={on:false};
{ const s=document.createElement('style'); s.textContent=`
#vcine{position:fixed;inset:0;z-index:61;pointer-events:none;display:none;overflow:hidden}
#vcine.on{display:block}
#vcine .bar{position:absolute;left:0;right:0;height:12vh;background:#000;z-index:3}#vcine .bar.t{top:0}#vcine .bar.b{bottom:0}
#vcine .ink{position:absolute;inset:0;background:radial-gradient(ellipse at center,#0000 45%,#06122acc 100%);z-index:1}
#vcine .tone{position:absolute;inset:0;z-index:1;opacity:0;background-image:radial-gradient(#0008 1.2px,#0000 1.4px);background-size:7px 7px;transition:opacity .15s}
#vcine.comic .tone{opacity:.55}
#vcine .q{position:absolute;left:6vw;right:6vw;bottom:15vh;z-index:4;text-align:center;font-family:Bangers,'Russo One',sans-serif;font-size:min(9vw,13vh);letter-spacing:2px;color:#fff;
 -webkit-text-stroke:3px #0b0f1e;paint-order:stroke fill;text-shadow:0 0 18px #3fa9ff,0 4px 0 #0b0f1e;opacity:0;transform:scale(1.4) rotate(-2deg)}
#vcine .q.show{animation:vq .35s cubic-bezier(.2,1.6,.4,1) forwards}@keyframes vq{to{opacity:1;transform:scale(1) rotate(-2deg)}}
#vcine .w{position:absolute;left:50%;top:42%;z-index:4;font-family:Bangers,'Russo One',sans-serif;font-size:min(16vw,24vh);color:#ffd43b;-webkit-text-stroke:4px #0b0f1e;paint-order:stroke fill;
 transform:translate(-50%,-50%) rotate(-8deg) scale(0);text-shadow:6px 6px 0 #c8323c}
#vcine .w.pop{animation:vw .4s cubic-bezier(.2,1.8,.4,1) forwards}@keyframes vw{0%{transform:translate(-50%,-50%) rotate(-8deg) scale(.2);opacity:1}70%{transform:translate(-50%,-50%) rotate(-4deg) scale(1.1);opacity:1}100%{transform:translate(-50%,-50%) rotate(-4deg) scale(1);opacity:0}}
#vcine .fl{position:absolute;inset:0;z-index:5;background:#fff;opacity:0}#vcine .fl.go{animation:vf .35s ease-out}@keyframes vf{0%{opacity:.95}100%{opacity:0}}
#vcine .tt{position:absolute;right:5vw;top:14vh;z-index:4;font-family:Bangers,'Russo One',sans-serif;font-size:min(6vw,9vh);color:#7fd4ff;-webkit-text-stroke:2px #0b0f1e;paint-order:stroke fill;opacity:0}
#vcine .tt.show{animation:vt .4s ease-out forwards}@keyframes vt{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}
body.vcine #hud,body.vcine #touch,body.vcine #moves,body.vcine #moves2,body.vcine #sbSk,body.vcine #koBar,body.vcine #sbInfo,body.vcine #sbGear,body.vcine #toast,body.vcine #banner,body.vcine #sbFs,body.vcine #sbChg{visibility:hidden!important}`; document.head.appendChild(s); }
const cineEl=document.createElement('div'); cineEl.id='vcine'; cineEl.innerHTML='<div class="ink"></div><div class="tone"></div><div class="bar t"></div><div class="bar b"></div><div class="q"></div><div class="w"></div><div class="tt"></div><div class="fl"></div>'; document.body.appendChild(cineEl);
const cq=cineEl.querySelector('.q'), cw=cineEl.querySelector('.w'), ctt=cineEl.querySelector('.tt'), cfl=cineEl.querySelector('.fl');
function cinePop(el,txt){ el.textContent=txt; el.classList.remove('show','pop'); void el.offsetWidth; el.classList.add(el===cw?'pop':'show'); }
function cineFlash(){ cfl.classList.remove('go'); void cfl.offsetWidth; cfl.classList.add('go'); }
function cineFreeze(ms,after){ const tok=game.token; game.timeScale=.02; setTimeout(()=>{ if(tok!==game.token||!CINE.on) return; game.timeScale=after; },ms); }

/* 1. PRESS: announcement card only (no quote, no voice) */
{ const oS=v8UltStart; v8UltStart=function(f){ if(f.def.id!=='valor') return oS(f); const U=isBrawl(f)?VULT.brawl:VULT.sword; f.def.ultName=U.name;
  const tok=game.token; cutEl.style.setProperty('--c',f.def.css); cutEl.querySelector('.who').textContent=f.def.name; cutEl.querySelector('.ult').textContent='ULTIMATE · '+U.name;
  const sb=cutEl.querySelector('.say'); sb.className='say'; if(U.announce){ sb.textContent=U.announce; sb.style.display=''; } else sb.style.display='none'; cutEl.classList.remove('vs-sword','vs-brawl'); cutEl.classList.add(isBrawl(f)?'vs-brawl':'vs-sword'); vsArt(); cutEl.querySelector('.ult').textContent=(isBrawl(f)?'BRAWLER ULTIMATE · ':'SWORD ULTIMATE · ')+U.name;
  cutEl.classList.remove('on'); void cutEl.offsetWidth; cutEl.classList.add('on'); document.body.classList.add('v8cutting'); game.timeScale=.03; f.setGlow&&f.setGlow(3);
  Snd.tone('sawtooth',90,600,.5,.12); Snd.mech&&Snd.mech(); News.add(`${f.def.name} CALLS OUT ITS ULTIMATE: ${U.name}!`,true);
  setTimeout(()=>{ cutEl.classList.remove('on','vs-sword','vs-brawl'); sb.style.display=''; document.body.classList.remove('v8cutting'); if(tok!==game.token) return; if(!CINE.on&&game.state==='fight') game.timeScale=1; for(const c of cams) c.init=false; },900); }; }

/* 2. LANDS: the directed cutscene */
ultLanded=function(f,a){ if(a._cut) return; a._cut=1; const brawl=!!a.brawl;
 CINE.on=true; CINE.f=f; CINE.o=f.opp; CINE.a=a; CINE.brawl=brawl; CINE.t0=a.t; CINE.shot=-1;
 cineEl.classList.add('on'); cineEl.classList.toggle('comic',false); document.body.classList.add('vcine'); try{ speechSynthesis.cancel(); }catch(e){}
 const U=brawl?VULT.brawl:VULT.sword; cinePop(cq,U.line); cineFreeze(1300,brawl?.7:.55);
 Snd.tone('triangle',300,900,.4,.08); };
function cineEnd(){ if(!CINE.on) return; CINE.on=false; cineEl.classList.remove('on','comic'); document.body.classList.remove('vcine'); cq.classList.remove('show'); ctt.classList.remove('show');
 for(const c of cams) c.init=false; if(game.state==='fight') game.timeScale=1; }
{ const o=clearFX; clearFX=function(){ o(); cineEnd(); }; }
{ const oR=sbReset; sbReset=function(){ cineEnd(); oR(); }; }

/* comic words go to the cutscene instead of the (hidden) toast */
{ const oT=toast; toast=function(t,c,ms){ if(CINE.on&&POW.includes(t)){ cinePop(cw,t); cw.style.color=c||'#ffd43b'; return; } return oT(t,c,ms); }; }
{ const oB=banner; banner=function(t,ms){ if(CINE.on){ if(/TIDECREST|K\.O\./.test(t)) cinePop(ctt,t); return; } return oB(t,ms); }; }

/* the camera: one shot after another */
// never put the camera inside a building: slide it toward the target until it's clear (or lift it over the roof)
function camSafe(p,look){ for(let k=0;k<=8;k++){ const q=p.clone().lerp(look,k*.1); const b=inBuilding(q.x,q.z,6); if(!b||q.y>b.h+1) return q; }
 const b=inBuilding(p.x,p.z,0); return b?V(p.x,b.h+4,p.z):p; }
const camAt=(p,look)=>{ camera.position.copy(camSafe(p,look)); camera.lookAt(look); };
function cineShot(n){ if(CINE.shot===n) return false; CINE.shot=n; return true; }
function cineCam(){ const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o) return; const t=a.t, fy=f.yaw, fw=V(Math.sin(fy),0,Math.cos(fy)), side=V(Math.cos(fy),0,-Math.sin(fy)), fc=f.chest(), oc=o.chest(), s=f.scale||1;
 if(!CINE.brawl){
  if(t<.62){ cineShot(0); camAt(fc.clone().addScaledVector(fw,22*s).add(V(0,-3,0)).addScaledVector(side,6),fc.clone().add(V(0,4,0))); return; }                      // quote close-up, low, in front
  if(t<1.5){ if(cineShot(1)){ cq.classList.remove('show'); } const g=(t-.62)*1.8; camAt(V(o.pos.x+Math.sin(g)*42,oc.y+10,o.pos.z+Math.cos(g)*42),oc); return; }           // orbit through the flash cuts
  if(t<1.75){ cineShot(2); camAt(V(o.pos.x+side.x*30,2,o.pos.z+side.z*30),oc.clone().add(V(0,10,0))); return; }                                                         // low shot, the dragon coils up
  if(t<2.15){ if(cineShot(3)){ cineFlash(); cineFreeze(380,.55); game.shake=0; } camAt(V(o.pos.x-fw.x*26,3,o.pos.z-fw.z*26),oc.clone().add(V(0,8,0))); return; }      // freeze on the rising cut
  if(cineShot(4)){} const back=f.pos.clone().addScaledVector(V(Math.sin(fy),0,Math.cos(fy)),30*s).addScaledVector(side,7).add(V(0,fc.y-f.pos.y-2,0)); camAt(back,fc.clone().lerp(oc,.35).add(V(0,2,0)));       // "already cut": he faces us, the wave crashes behind
  if(t>2.95||!f.atk||f.atk.id!=='ultimate') cineEnd(); return; }
 // BRAWLER
 const k=t-(a.contact||t);
 if(k<.15){ cineShot(0); camAt(fc.clone().addScaledVector(fw,20*s).addScaledVector(side,-8).add(V(0,-2,0)),fc.clone().add(V(0,3,0))); return; }                          // quote close-up
 if(k<1.43){ const i=Math.floor((k-.15)/.13); if(cineShot(10+i)){ cq.classList.remove('show'); cineEl.classList.add('comic'); }
  const ang=[.9,-1.1,2.4,-.4,1.6,-2.2,.3,-1.5,2.9][i%9], r=[34,28,40,30,36,26,42,32,30][i%9], h=[4,14,8,20,2,10,16,6,12][i%9];
  camAt(V(oc.x+Math.sin(fy+ang)*r,oc.y-6+h,oc.z+Math.cos(fy+ang)*r),oc.clone().lerp(fc,.4)); return; }                                                                     // a new "panel" every punch
 if(k<1.6){ if(cineShot(30)){ cineEl.classList.remove('comic'); cineFlash(); cineFreeze(330,.7); } camAt(V(o.pos.x+side.x*22,1.5,o.pos.z+side.z*22),oc.clone().add(V(0,6,0))); return; } // low angle on the KO uppercut
 cineShot(31); camAt(V(o.pos.x+side.x*55,Math.max(10,o.pos.y*.6),o.pos.z+side.z*55),o.chest());                                                                         // follow them up the geyser
 if(k>2.3||!f.atk||f.atk.id!=='ultimate') cineEnd(); }
{ const oC=updateCamera; updateCamera=function(dt){ if(CINE.on&&game.mode==='match'){ try{ cineCam(); }catch(e){ console.error(e); cineEnd(); } return; } return oC(dt); }; }
// safety: if the ultimate ends some other way, end the cutscene
{ const o=updateHUD; updateHUD=function(dt){ o(dt); if(CINE.on&&(!CINE.f||!CINE.f.atk||CINE.f.atk.id!=='ultimate'||game.state!=='fight')) cineEnd(); }; }

/* each stance gets its own announcement card: SWORD = painted waves on deep blue, BRAWLER = comic halftone with a gold starburst */
function vsArt(){ if(vsArt.done) return; vsArt.done=1; try{ const crest=wfxTex('crest').image.toDataURL(), whirl=wfxTex('whirl').image.toDataURL(); const s=document.createElement('style'); s.textContent=`
#v8cut.vs-sword .band{background:url(${crest}) repeat-x left bottom/22vh 22vh,linear-gradient(90deg,#123f9e 0%,#2f8ff0 55%,#0b0f1ecc 85%)!important;box-shadow:0 0 50px #3fa9ff,inset 0 -6px 0 #0b0f1e,inset 0 6px 0 #0b0f1e!important}
#v8cut.vs-sword .who{color:#e9f6ff;text-shadow:5px 5px 0 #0b0f1e,0 0 24px #3fa9ff}
#v8cut.vs-sword .ult{color:#bfeeff!important}
#v8cut.vs-sword:before{content:'';position:absolute;right:4vw;top:14vh;width:30vh;height:30vh;background:url(${whirl}) center/contain no-repeat;animation:vsSpin 1s linear infinite;opacity:.9}
#v8cut.vs-brawl .band{background:radial-gradient(#0006 1.4px,#0000 1.6px) 0 0/8px 8px,linear-gradient(90deg,#ffd43b 0%,#ff9f43 45%,#c8323c 75%,#000c 92%)!important;box-shadow:0 0 50px #ffd43b,inset 0 -6px 0 #0b0f1e,inset 0 6px 0 #0b0f1e!important;transform:skewY(5deg)!important}
#v8cut.vs-brawl .who{color:#fff;transform:rotate(5deg)!important;text-shadow:6px 6px 0 #c8323c}
#v8cut.vs-brawl .ult{color:#fff!important;transform:rotate(5deg)!important;text-shadow:2px 2px 0 #c8323c}
#v8cut.vs-brawl:before{content:'';position:absolute;right:5vw;top:12vh;width:32vh;height:32vh;background:url(${whirl}) center/contain no-repeat;animation:vsSpin .8s linear infinite reverse;filter:drop-shadow(0 0 12px #ffd43b)}
@keyframes vsSpin{to{transform:rotate(360deg)}}`; document.head.appendChild(s); }catch(e){ console.error(e); } }

/* =====================================================================
   v2 SWORD ULTIMATE (Nov 6): MajorasPride said both ultimates felt "literally the same" (both rushed in).
   TIDECREST OATH is now LONG RANGE and aimed: VALOR plants his feet, raises the sword, and launches a
   giant painted WATER DRAGON straight ahead. Dragon hits = cutscene: it coils around the rival, VALOR
   (still far away) draws once, sheathes with a click, and the dragon bursts. Dragon misses = it crashes
   into the ground far away, no cutscene. BRAWLER stays the close-range Star Rush.
   ===================================================================== */
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

/* sword cutscene shots, timed from the moment the dragon hits */
{ const oC=cineCam; cineCam=function(){ const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o||CINE.brawl||a.hitT==null) return oC();
  const k=a.t-a.hitT, fy=f.yaw, fw=V(Math.sin(fy),0,Math.cos(fy)), side=V(Math.cos(fy),0,-Math.sin(fy)), fc=f.chest(), oc=o.chest(), s=f.scale||1;
  if(k<.12){ cineShot(0); camAt(fc.clone().addScaledVector(fw,22*s).add(V(0,-3,0)).addScaledVector(side,6),fc.clone().add(V(0,4,0))); return; }                       // quote close-up on VALOR
  if(k<1.05){ if(cineShot(1)) cq.classList.remove('show'); const g=k*1.8; camAt(V(o.pos.x+Math.sin(g)*42,oc.y+8,o.pos.z+Math.cos(g)*42),oc.clone().add(V(0,6,0))); return; } // orbit: the dragon coils
  if(k<1.4){ if(cineShot(2)){ cineFlash(); cineFreeze(380,.55); } const toO=oc.clone().sub(fc).setY(0).normalize(); camAt(fc.clone().addScaledVector(toO,-18).add(V(0,6,0)).addScaledVector(V(toO.z,0,-toO.x),7),oc); return; } // over the shoulder: the draw-cut
  if(cineShot(3)){} const back=f.pos.clone().addScaledVector(fw,30*s).addScaledVector(side,7).add(V(0,fc.y-f.pos.y-2,0)); camAt(back,fc.clone().lerp(oc,.3).add(V(0,2,0)));  // he faces us, the dragon bursts far behind
  if(k>2.25||!f.atk||f.atk.id!=='ultimate') cineEnd(); }; }

/* =====================================================================
   v2 BRAWLER ULTIMATE (Nov 6): MajorasPride: "copy Captain America's thrown shield where he pins Iron Man".
   STAR RUSH is now SHIELD PIN (inspired by that fight, our own moves): VALOR throws the shield (aimed).
   Shield hits = cutscene: the rival staggers, VALOR leaps after the shield and catches it mid-air,
   tackles the rival flat, pins them with shield bashes, raises the shield high... and slams it down.
   Shield misses = it ricochets back, no cutscene.
   ===================================================================== */
VULT.brawl.name='SHIELD PIN';
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
/* brawler cutscene shots, timed from the moment the shield hits */
{ const oC=cineCam; cineCam=function(){ const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o||!CINE.brawl||a.hitT==null) return oC();
  const k=a.t-a.hitT, fy=f.yaw, fw=V(Math.sin(fy),0,Math.cos(fy)), side=V(Math.cos(fy),0,-Math.sin(fy)), fc=f.chest(), oc=o.chest(), s=f.scale||1;
  if(k<.12){ cineShot(0); camAt(fc.clone().addScaledVector(fw,20*s).addScaledVector(side,-8).add(V(0,-2,0)),fc.clone().add(V(0,3,0))); return; }      // quote close-up
  if(k<.6){ if(cineShot(1)) cq.classList.remove('show'); camAt(o.pos.clone().addScaledVector(side,48).add(V(0,18,0)),f.pos.clone().lerp(o.pos,.6).add(V(0,14,0))); return; } // side shot: the leap
  if(k<1.45){ if(cineShot(2)) cineEl.classList.add('comic'); camAt(o.pos.clone().addScaledVector(side,22).addScaledVector(fw,-6).add(V(0,2.5,0)),oc.clone().lerp(fc,.5)); return; } // ground level: the pin
  if(k<1.75){ if(cineShot(3)){ cineEl.classList.remove('comic'); cineFreeze(380,.7); } camAt(f.pos.clone().add(V(4,60,4)),f.pos.clone().add(V(0,8,0))); return; } // top-down: shield raised
  if(cineShot(4)){ cineFlash(); } camAt(o.pos.clone().addScaledVector(side,26).addScaledVector(fw,10).add(V(0,1.5,0)),oc.clone().add(V(0,4,0)));              // low angle: the slam
  if(k>2.45||!f.atk||f.atk.id!=='ultimate') cineEnd(); }; }
// clean up a flying shield if the fight resets
{ const oR=sbReset; sbReset=function(){ const a=game.p&&game.p.atk; if(a&&a.sh){ scene.remove(a.sh.m); a.sh=null; } if(game.p&&game.p.P&&game.p.P.v8shield) game.p.P.v8shield.visible=true; oR(); }; }

/* v3 SHIELD PIN cutscene (Nov 6): MajorasPride: "cutscene starts with the shield throw, bounce back, attack,
   like Civil War, where he drops the monster." From the hit: slow-mo impact close-up -> the shield ricochets
   straight back and VALOR catches it -> he charges and takes the monster's legs out (it DROPS) ->
   pinned shield bashes -> raise (top-down freeze) -> SLAM. */
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
{ const oC=cineCam; cineCam=function(){ const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o||!CINE.brawl||a.hitT==null) return oC();
  const k=a.t-a.hitT, fy=f.yaw, fw=V(Math.sin(fy),0,Math.cos(fy)), side=V(Math.cos(fy),0,-Math.sin(fy)), fc=f.chest(), oc=o.chest();
  const toF=V(f.pos.x-o.pos.x,0,f.pos.z-o.pos.z).normalize(), sideO=V(toF.z,0,-toF.x);
  if(k<.12){ cineShot(0); camAt(oc.clone().addScaledVector(toF,16).addScaledVector(sideO,9).add(V(0,2,0)),oc); return; }                                           // 1. impact close-up on the monster (quote)
  if(k<.5){ if(cineShot(1)) cq.classList.remove('show'); const S=a.sh, p=S?S.pos:fc; camAt(p.clone().lerp(oc,.5).addScaledVector(sideO,46).add(V(0,10,0)),p.clone().lerp(fc,.5)); return; } // 2. side: the ricochet back
  if(k<.8){ cineShot(2); camAt(fc.clone().addScaledVector(toF,-1).addScaledVector(V(-toF.z,0,toF.x),14).add(V(0,-4,0)).sub(V(fw.x*16,0,fw.z*16)),oc); return; } // 3. behind VALOR as he charges
  if(k<1.7){ if(cineShot(3)){ cineEl.classList.add('comic'); } camAt(o.pos.clone().addScaledVector(sideO,24).add(V(0,2.5,0)),o.pos.clone().lerp(f.pos,.5).add(V(0,5,0))); return; } // 4. ground level: dropped + pinned
  if(k<1.95){ if(cineShot(4)){ cineEl.classList.remove('comic'); cineFreeze(380,.7); } camAt(f.pos.clone().add(V(4,60,4)),f.pos.clone().add(V(0,8,0))); return; } // top-down: shield raised
  if(cineShot(5)){ cineFlash(); } camAt(o.pos.clone().addScaledVector(sideO,26).addScaledVector(toF,8).add(V(0,1.5,0)),oc.clone().add(V(0,2,0)));               // low angle: SLAM
  if(k>2.5||!f.atk||f.atk.id!=='ultimate') cineEnd(); }; }
// if the cutscene or fight ends early, stand the monster back up
{ const o=cineEnd; cineEnd=function(){ const a=CINE.a; if(a&&a._R){ a._R.rotation.x=a._rx; a._R=null; } o(); }; }

/* GIANT WATER SHIELD (Nov 6): MajorasPride: "a giant water shield attack as he rushes. Make it awesome."
   During the charge a huge painted water shield forms in front of VALOR (spinning rings, foam edge, ink
   outline) and grows as he runs; when he takes the monster down it bursts into a wall of water. */
function drawWShield(x){ const c=128;
 const rings=[[124,'#0b0f1e'],[118,'#123f9e'],[100,'#0b0f1e'],[95,'#2f8ff0'],[74,'#0b0f1e'],[69,'#ffffff'],[58,'#0b0f1e'],[53,'#7fd8ff'],[34,'#0b0f1e'],[29,'#2f8ff0']];
 for(const [r,col] of rings){ x.beginPath(); x.arc(c,c,r,0,7); x.fillStyle=col; x.fill(); }
 // flowing wave marks around the outer ring
 x.strokeStyle='#9fe3ff'; x.lineWidth=5; for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; x.beginPath(); x.arc(c,c,108,a,a+.35); x.stroke(); }
 // a wave curl emblem in the middle
 x.save(); x.translate(c,c); x.scale(.2,.2); x.translate(-128,-128); drawCurl(x,false); x.restore();
 // foam dots on the rim
 x.lineWidth=3; x.strokeStyle='#0b0f1e'; x.fillStyle='#fff'; for(let i=0;i<16;i++){ const a=i/16*Math.PI*2+.1; x.beginPath(); x.arc(c+Math.cos(a)*121,c+Math.sin(a)*121,i%2?6:9,0,7); x.fill(); x.stroke(); } }
{ const o=wfxTex; wfxTex=function(k){ if(k!=='wshield') return o(k); if(!WFX.tex[k]) WFX.tex[k]=wfxCanvas(drawWShield); return WFX.tex[k]; }; }
function wsMake(){ const m=new THREE.MeshBasicMaterial({map:wfxTex('wshield'),transparent:true,depthWrite:false,fog:false,toneMapped:false,side:THREE.DoubleSide}); const g=new THREE.Mesh(new THREE.CircleGeometry(1,40),m);
 g.renderOrder=6; scene.add(g); return g; }
function wsKill(a,burstIt){ const W=a.ws; if(!W) return; a.ws=null; if(burstIt){ const p=W.position.clone(), r=W.scale.x;
  for(let i=0;i<12;i++){ const g=i/12*Math.PI*2; wfxSprite(i%3===0?'crest':i%3===1?'curl':'curlM',p.clone().add(V(Math.cos(g)*r*.8,Math.sin(g)*r*.8,0)),14,.6,{grow:.5,vel:V(Math.cos(g)*30,Math.sin(g)*30+10,0)}); }
  wfxSprite('splash',p,r*2.4,.5,{grow:.6}); wfxSprite('foam',p,r*1.8,.5,{grow:.6}); }
 scene.remove(W); W.material.dispose(); W.geometry.dispose(); }
{ const oB=ultBrawl; ultBrawl=function(f,a,dt,pm,o){ oB(f,a,dt,pm,o); if(!a.hitT||a.miss) return; const k=a.t-a.hitT;
  if(k>=.48&&k<.8){ if(!a.ws){ a.ws=wsMake(); Snd.tone('sawtooth',120,500,.4,.1); Snd.whoosh(); }
   const W=a.ws, q=clamp((k-.48)/.25,0,1), r=lerp(8,26,ez(q))*(f.scale||1), fw=V(Math.sin(f.yaw),0,Math.cos(f.yaw));
   W.position.copy(f.chest()).addScaledVector(fw,f.radius()+5); W.lookAt(W.position.clone().add(fw)); W.rotateZ(a.t*6); W.scale.setScalar(r);
   if(Math.random()<dt*40){ const g=rand(0,6.28); wfxSprite(Math.random()<.5?'spray':'sprayM',W.position.clone().add(V(Math.cos(g)*r,Math.sin(g)*r,0)),8,.3,{grow:.4}); }
   if(Math.random()<dt*20) wfxSprite('crest',f.pos.clone().addScaledVector(fw,-6).add(V(0,2,0)),16,.4,{grow:.3}); }
  if(k>=.8&&a.ws){ wsKill(a,true); ring(o.pos.x,4,o.pos.z,30,WATER,.5); game.shake=Math.max(game.shake,1.3); } }; }
{ const o=cineEnd; cineEnd=function(){ const a=CINE.a; if(a&&a.ws) wsKill(a,false); o(); }; }
// charge shot: pull the camera back and up so VALOR, the water shield and the monster are all in frame
{ const oC=cineCam; cineCam=function(){ const f=CINE.f, o=CINE.o, a=CINE.a; if(f&&o&&CINE.brawl&&a.hitT!=null){ const k=a.t-a.hitT; if(k>=.5&&k<.8){ cineShot(2);
   const toO=V(o.pos.x-f.pos.x,0,o.pos.z-f.pos.z).normalize(), sd=V(toO.z,0,-toO.x); camAt(f.pos.clone().addScaledVector(toO,-26).addScaledVector(sd,16).add(V(0,16,0)),f.chest().lerp(o.chest(),.35)); return; } } return oC(); }; }
