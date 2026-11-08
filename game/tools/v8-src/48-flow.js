// v8.5 (Nov 8, 2026): moved from the sandbox into the game (MajorasPride: put everything we did in the game; the sandbox keeps on/off switches to compare).
/* =====================================================================
   SANDBOX 17 (Nov 8, 2026): FLOW FIXES.
   1. NO AUTO COMBO BREAKER. MajorasPride: "get rid of the combo breaker auto thing."
      The automatic break-free after 10 hits in a row is off (BR.comboCap). The other anti-stun-lock rules
      stay: light hits stun only every 5th hit, burn never stuns, BREAK FREE after 2s of stun, max 3 air lights.
      The code stays in the game (13-valor-brawler.js), so it can come back.
   2. LESS HIT-PAUSE PILE-UP. Found with the balance test: every hit freezes the game for a moment
      (0.045 to 0.2s at 8% speed), and they stack: every jab, every blocked shot, every bullet. In busy
      fights the game was frozen 12% to 55% of the time, which reads as choppy, not fluid.
      Now: each pause is shorter (55%, max 0.09s; big moments up to 0.15s), and if a lot of pauses
      happen close together, the next ones shrink (so a fast string still flows).
   ===================================================================== */
BR.comboCap=Infinity;
const FLOW={on:true, scale:.55, cap:.09, bigCap:.15, recent:0};
{ let hsv=game.hitStop||0;
  Object.defineProperty(game,'hitStop',{configurable:true, get(){ return hsv; }, set(v){
   if(v>hsv+1e-4){ const big=v>=.2, add=FLOW.on===false?v:Math.min(big?FLOW.bigCap:FLOW.cap,v*FLOW.scale)/(1+FLOW.recent*5);
    FLOW.recent+=add; hsv=Math.max(hsv,add); } else hsv=v; } }); }
{ const oL=loop; loop=function(now){ const r=oL(now); FLOW.recent*=.94; return r; }; }   // the pile-up memory fades in about a second
