/* =====================================================================
   SANDBOX 20 (Nov 8, 2026): ON / OFF SWITCHES FOR WHAT'S IN THE GAME.
   MajorasPride: the main game never has more than the sandbox; the sandbox has everything the game has,
   with switches to turn things off, and all new work starts here.
   v8.5 moved Sandbox 17 to 19 into the game. This ⚙ section turns each of them off again, so the old way
   can be compared side by side (nothing here is saved, and the game isn't affected):
   - FLUID MOTION (same as MOTION NEW / OLD), LIMB HITS (also in TEST TOOLS)
   - HIT-PAUSE FIX (off = the old longer, stacking hit-pause)
   - LOCK-ON FLASH (off = the red lock-on marker stays on the whole time, like before)
   - NEW VALOR and ROOMY CITY restart the fight (off = the old box VALOR / the old packed Neon City)
   MAGMA SURGE has no switch: the old Magma Wall is archived (game/archive/titan-clash-magma-wall-archive.js).
   ===================================================================== */
const CMP=[
 ['FLUID MOTION',()=>MOT.on,v=>{ MOT.on=v; for(const f of [game.p,game.e]) if(f){ f._mot=null; if(f.P&&f.P.torso) f.P.torso.rotation.z=0; } }],
 ['LIMB HITS',()=>!!SB.limb,v=>{ SB.limb=v; }],
 ['HIT-PAUSE FIX',()=>FLOW.on!==false,v=>{ FLOW.on=v; }],
 ['LOCK-ON FLASH',()=>LOCKFLASH.show<99,v=>{ LOCKFLASH.show=v?1:1e9; }],
 ['NEW VALOR',()=>VK.on,v=>{ VK.on=v; sbStart(); },1],
 ['ROOMY CITY',()=>!!MAPS.city.bGap,v=>{ MAPS.city.bGap=v; MAPS.city.bDen=v?.72:1; sbStart(); },1]];
function cmpUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-cmp]')) return; const kit=el('sbKit'); if(!kit) return;
 const d=document.createElement('div'); d.className='sec';
 d.innerHTML=`<div class="lbl">IN THE GAME SINCE v8.5 (tap to turn off and compare · ↻ restarts the fight)</div><div class="row">${CMP.map((c,i)=>`<button data-cmp="${i}">${c[0]}${c[3]?' ↻':''}</button>`).join('')}</div>`;
 kit.closest('.sec').parentNode.insertBefore(d,kit.closest('.sec'));
 d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation(); const c=CMP[+b.dataset.cmp], v=!c[1]();
  c[2](v); toast(c[0]+': '+(v?'ON':'OFF'),'#7fd4ff',800); if(c[3]) sbMenuOpen(true); cmpSync(); }); }
function cmpSync(){ document.querySelectorAll('#sbMenu [data-cmp]').forEach(b=>b.classList.toggle('on',!!CMP[+b.dataset.cmp][1]())); }
{ const oS=sbStart; sbStart=function(){ oS(); cmpUI(); cmpSync(); }; }
{ const oS=sbSync; sbSync=function(){ oS(); cmpUI(); cmpSync(); }; }
