/* =====================================================================
   SANDBOX 14b: METERS TEST TOOL (Nov 7, 2026). Sandbox only.
   MajorasPride: "Rage meter always on or off in sandbox button."
   ⚙ menu → METERS: NORMAL · ALWAYS FULL · OFF. Works on whoever has a meter, you and the dummy:
   - INFERNOTH: RAGE. ALWAYS FULL = he stays in rage (white-hot, nothing staggers him, GROUND ZERO ready
     with SUPERS READY). OFF = rage never fills.
   - VALOR: the KO PUNCH meter (his Little Mac meter, not a rage meter). ALWAYS FULL = every heavy in
     Brawler is a KO Punch. OFF = empty.
   SUPERS READY no longer fills VALOR's KO meter by itself (that's why his bar always looked full).
   Never saved; the game isn't affected.
   ===================================================================== */
SB.meter='normal'; SB.meterCtl=true;   // meterCtl: tells the game's SUPERS READY to leave the KO meter alone
{ const o=enterRage; enterRage=function(f){ if(SB.meter==='off') return; return o(f); }; }
function meterTick(){ if(game.mode!=='match'||game.state!=='fight'||SB.meter==='normal') return;
 for(const f of [game.p,game.e]){ if(!f||f.dead) continue;
  if(isInf(f)){ infInit(f);
   if(SB.meter==='full'){ if(!(f.kRageT>0)) enterRage(f); f.kRageT=f.kRageMax||INF.dur[f.stIdx||0]; f.kRage=100; }
   else { f.kRage=0; f.kRageT=0; } }
  if(f.def&&f.def.id==='valor') f.ko=SB.meter==='full'?100:0; } }
{ const o=updateHUD; updateHUD=function(dt){ try{ meterTick(); }catch(e){ console.error(e); } o(dt); }; }
function meterUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-mt]')) return;
 const box=m.querySelector('.box'), kit=el('sbKit'), d=document.createElement('div'); d.className='sec';
 d.innerHTML=`<div class="lbl">METERS (INFERNOTH rage · VALOR KO punch · you and the dummy)</div><div class="row">${[['normal','NORMAL'],['full','ALWAYS FULL'],['off','OFF']].map(([k,n])=>`<button data-mt="${k}">${n}</button>`).join('')}</div>`;
 box.insertBefore(d,kit.closest('.sec'));
 d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation(); SB.meter=b.dataset.mt;
  if(SB.meter==='normal') for(const f of [game.p,game.e]){ if(isInf(f)){ f.kRage=0; f.kRageT=0; } if(f&&f.def&&f.def.id==='valor') f.ko=0; }
  meterSync(); toast('METERS: '+b.textContent,'#7fd4ff',700); }); }
function meterSync(){ document.querySelectorAll('#sbMenu [data-mt]').forEach(b=>b.classList.toggle('on',b.dataset.mt===SB.meter)); }
{ const oS=sbStart; sbStart=function(){ oS(); meterUI(); meterSync(); }; }
{ const oS=sbSync; sbSync=function(){ oS(); meterSync(); }; }
// (the phone KO bar position moved into the game in v8.4.3)
