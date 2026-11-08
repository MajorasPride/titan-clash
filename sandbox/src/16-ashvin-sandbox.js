/* SANDBOX ONLY parts of the twins (Sandbox 15): the ⚙ LOADOUT element-pair buttons, colored damage numbers, and the TITANS lists. The kit itself is in the game since v8.4.5 (game/tools/v8-src/42-ashvin-twins.js, 43-ashvin-look.js). */
{ const o=loRow; loRow=function(side,id,k,label,opts){ if(id==='ashvin'&&k==='el') opts=[['default','DEFAULT'],['fireice','FIRE + ICE'],['lightwater','LIGHTNING + WATER']]; return o(side,id,k,label,opts); }; }

/* ---------- damage numbers by twin (orange = Sun, icy blue = Moon) ---------- */
if(typeof dmgNum==='function'){ const o=dmgNum; dmgNum=function(f,n,cont){ o(f,n,cont); const p=game.p, d=document.body.lastElementChild;
  if(d&&d.classList&&d.classList.contains('sbnum')&&isAsh(p)) d.style.color=isSun(p)?'#ffb347':'#9fd8ff'; }; }


/* ---------- sandbox: play the twins ---------- */
if(!SB_PLAY.includes('ashvin')) SB_PLAY.push('ashvin');
if(!SB_DUMMIES.includes('ashvin')) SB_DUMMIES.push('ashvin');
