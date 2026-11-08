/* =====================================================================
   SANDBOX 17 (Nov 8, 2026): LOCK-ON FLASH + A ROOMIER CITY.
   MajorasPride: "lock on shouldn't have that red UI the whole time, just a quick 1 second, but keep
   locked on. The overlay is annoying, screen clutter."
   - The red diamond on the rival and the LOCK-ON tag show for 1 second when you lock on, then fade out.
     The lock itself stays on. They flash again for 1 second whenever you lock on again.
   - The off-screen arrow (where the rival is when you can't see them) stays, since it's only there
     when you need it.
   MajorasPride: "remove more buildings, there are so many. Just space them out."
   - Neon City builds on a checkerboard (every building gets open space on all four sides) and a little
     thinner: about a third of the buildings it had. Switch: MAP.bGap (game code, makeCity).
   ===================================================================== */
const LOCKFLASH={show:1, fade:.35, t:[-99,-99], was:[false,false]};
{ const s=document.createElement('style'); s.textContent='.ret,.ltag{transition:opacity .35s ease-out}.ret.lkfade,.ltag.lkfade{opacity:0}'; document.head.appendChild(s); }
{ const o=indicators; indicators=function(i,x0,w,showIt){ o(i,x0,w,showIt); const c=cams[i], now=performance.now()/1000, sx=i?'2':'';
  if(c.lock&&!LOCKFLASH.was[i]) LOCKFLASH.t[i]=now; LOCKFLASH.was[i]=!!c.lock;
  const fade=c.lock&&now-LOCKFLASH.t[i]>LOCKFLASH.show;
  for(const id of ['reticle'+sx,'lockTag'+sx]){ const e=el(id); if(e) e.classList.toggle('lkfade',fade); } }; }
// fewer buildings, more room between them (Neon City)
MAPS.city.bGap=true; MAPS.city.bDen=.72;
