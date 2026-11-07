/* =====================================================================
   v8.3 (Nov 7, 2026): real-game settings for the code that came from the sandbox.
   The sandbox's test switches are fixed to normal play here:
   - the CPU fights for real (no STAND / BLOCK dummy), uses its 1/2/3 skills
   - no infinite energy, SUPERS READY is off (ultimates need a full meter again)
   - ultimate camera: 1 in 3 fighting-game angle, the rest cinematic
   - wall splat on, buildings on
   ===================================================================== */
Object.assign(SB,{dummy:'fight',infEn:false,infHp:false,ultRdy:false,ultCam:'random',walls:true,city:true,slow:false});
// set up the 1/2/3 buttons, the 1/2/3 cooldown strip and the charge bar when a fight starts
{ const o=startMatch; startMatch=function(...a){ const r=o.apply(this,a); try{ skButtons(); cbUI(); }catch(e){ console.error(e); } return r; }; }
// clear leftovers (cutscenes, water effects, hidden buildings, combo counters) every round
{ const o=startRound; startRound=function(...a){ SB._round=true; try{ sbReset(); }catch(e){ console.error(e); } SB._round=false; return o.apply(this,a); }; }
// PC: lift the 1/2/3 cooldown strip above the Channel 7 news ticker
{ const s=document.createElement('style'); s.textContent='#sbSk{bottom:106px!important}'; document.head.appendChild(s); }
