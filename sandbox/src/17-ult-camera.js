/* =====================================================================
   SANDBOX TEST 14: ULTIMATE CAMERA = CINEMATIC OR FIGHTING-GAME ANGLE (Nov 6, 2026)
   MajorasPride: "ultimates should show an original fighting game angle every 33%, so sometimes you get cinematic
   and a 33% chance of showing it at the angle of a fighting game."
   When an ultimate lands, 1 in 3 times the whole cutscene plays from a flat side-on camera (like MvC / Street Fighter:
   both titans in frame, the camera stays on one side and slides along with them). The rest of the time = the cinematic shots.
   The sword's Akuma stand always plays cinematic.
   ⚙ menu: ULT CAMERA: RANDOM / CINEMATIC / FIGHTING GAME (to test either one).
   ===================================================================== */
SB.ultCam='random';
{ const oL=ultLanded; ultLanded=function(f,a){ const was=a._cut; oL(f,a); if(was) return;
  CINE.side=SB.ultCam==='side'||(SB.ultCam==='random'&&Math.random()<1/3);
  const o=f.opp, toO=V(o.pos.x-f.pos.x,0,o.pos.z-f.pos.z).normalize(); CINE.sideV=V(toO.z,0,-toO.x); }; }
function sideCam(){ const f=CINE.f, o=CINE.o; const fc=f.chest(), oc=o.chest(), sd=CINE.sideV, hy=(fc.y-f.pos.y)*.9;
 let d=Math.hypot(o.pos.x-f.pos.x,o.pos.z-f.pos.z), mid=V((f.pos.x+o.pos.x)/2,0,(f.pos.z+o.pos.z)/2);
 if(d>220){ const toO=V(o.pos.x-f.pos.x,0,o.pos.z-f.pos.z).normalize(); mid=f.pos.clone().addScaledVector(toO,110); d=220; }   // the rival flew far: keep VALOR in frame
 const back=Math.max(60,(d+o.radius()*2+20)*.9), lift=Math.max(f.pos.y,o.pos.y)*.5;
 camAt(mid.clone().addScaledVector(sd,back).add(V(0,hy+lift,0)),mid.clone().add(V(0,hy+lift,0))); }
{ const oC=cineCam; cineCam=function(){ const f=CINE.f, o=CINE.o, a=CINE.a; if(!CINE.side||!f||!o||!a||a.hitT==null) return oC();
  const k=a.t-a.hitT;
  if(!CINE.brawl&&typeof SW13!=='undefined'&&k>=SW13.FINAL) return oC();          // sword: the final city + dragon shot always plays
  if(!CINE.brawl&&typeof SW13!=='undefined'&&k>=SW13.DRAGON[0]+.35&&k<SW13.OPEN){ return oC(); } // sword: the Akuma stand + sky dragon also stays cinematic
  if(cineShot(50)){ cq.classList.remove('show'); }
  sideCam(); if(CINE.brawl?k>SB12.END-.05:k>SW13.END-.05) cineEnd(); }; }
{ const oE=cineEnd; cineEnd=function(){ CINE.side=false; oE(); }; }
// ⚙ menu button
function ultCamUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-cm]')) return; const ref=m.querySelector('[data-t=ultRdy]')||m.querySelector('[data-t=slow]'); if(!ref) return;
 const b=document.createElement('button'); b.dataset.cm='1'; const L={random:'ULT CAMERA: RANDOM',cine:'ULT CAMERA: CINEMATIC',side:'ULT CAMERA: FIGHTING GAME'}; b.textContent=L[SB.ultCam];
 b.addEventListener('click',e=>{ e.stopPropagation(); const n=['random','cine','side']; SB.ultCam=n[(n.indexOf(SB.ultCam)+1)%3]; b.textContent=L[SB.ultCam]; }); ref.parentNode.appendChild(b); }
{ const oS=sbStart; sbStart=function(){ oS(); ultCamUI(); }; }
setTimeout(ultCamUI,800);
