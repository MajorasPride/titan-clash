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
#v8cut.vs-brawl:before{content:'';position:absolute;right:5vw;top:12vh;width:32vh;height:32vh;background:conic-gradient(from 0deg,#ffd43b 0 10deg,#0000 10deg 20deg,#ffd43b 20deg 30deg,#0000 30deg 40deg,#ffd43b 40deg 50deg,#0000 50deg 60deg,#ffd43b 60deg 70deg,#0000 70deg 80deg,#ffd43b 80deg 90deg,#0000 90deg 100deg,#ffd43b 100deg 110deg,#0000 110deg 120deg,#ffd43b 120deg 130deg,#0000 130deg 140deg,#ffd43b 140deg 150deg,#0000 150deg 160deg,#ffd43b 160deg 170deg,#0000 170deg 180deg,#ffd43b 180deg 190deg,#0000 190deg 200deg,#ffd43b 200deg 210deg,#0000 210deg 220deg,#ffd43b 220deg 230deg,#0000 230deg 240deg,#ffd43b 240deg 250deg,#0000 250deg 260deg,#ffd43b 260deg 270deg,#0000 270deg 280deg,#ffd43b 280deg 290deg,#0000 290deg 300deg,#ffd43b 300deg 310deg,#0000 310deg 320deg,#ffd43b 320deg 330deg,#0000 330deg 340deg,#ffd43b 340deg 350deg,#0000 350deg);border-radius:50%;-webkit-mask:radial-gradient(#000 30%,#0000 70%);mask:radial-gradient(#000 30%,#0000 70%);animation:vsSpin 2s linear infinite}
@keyframes vsSpin{to{transform:rotate(360deg)}}`; document.head.appendChild(s); }catch(e){ console.error(e); } }
