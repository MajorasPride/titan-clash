/* =====================================================================
   SANDBOX TEST 5: TITAN SPEED (Nov 6, 2026)
   MajorasPride: "Characters may need to be faster too. Weigh that option."
   ⚙ menu → TITAN SPEED: 100% (now) · 115% · 130%. Changes both titans:
   - walk / run speed
   - how fast every attack plays out (wind-up, swing, recovery)
   Cooldowns, energy and damage stay the same. Never saved; the game isn't affected.
   ===================================================================== */
SB.spd=1;
{ const o=rSpd; rSpd=function(f){ return o(f)*(SB.spd||1); }; }
{ const oSA=FP.startAtk; FP.startAtk=function(id){ oSA.call(this,id); const a=this.atk, k=SB.spd||1;
  if(a&&k!==1&&isCore(this)&&a.id!=='ultimate'){ a.dur/=k; if(a.hitAt) a.hitAt/=k; } }; }
function spdUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-spd]')) return;
 const box=m.querySelector('.box'), kit=el('sbKit'), d=document.createElement('div'); d.className='sec';
 d.innerHTML=`<div class="lbl">TITAN SPEED (both titans: moving + attacks)</div><div class="row">${[1,1.15,1.3].map(k=>`<button data-spd="${k}">${Math.round(k*100)}%</button>`).join('')}</div>`;
 box.insertBefore(d,kit.closest('.sec'));
 d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation(); SB.spd=+b.dataset.spd; spdSync(); toast('TITAN SPEED '+Math.round(SB.spd*100)+'%','#7fd4ff',700); }); }
function spdSync(){ document.querySelectorAll('#sbMenu [data-spd]').forEach(b=>b.classList.toggle('on',+b.dataset.spd===SB.spd)); }
{ const oS=sbStart; sbStart=function(){ oS(); spdUI(); spdSync(); }; }
{ const oS=sbSync; sbSync=function(){ oS(); spdSync(); }; }
