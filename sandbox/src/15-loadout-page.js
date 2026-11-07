/* =====================================================================
   SANDBOX 14b: THE LOADOUT PAGE FOLLOWS THE ELEMENT (Nov 7, 2026). Sandbox only.
   MajorasPride: "I should pick an element and the page changes what they do. Says water when I picked lightning."
   On the titan file's ABILITIES & LOADOUT page:
   - The path upgrades are worded for the picked element (Tidewall builds a lightning wall in Lightning, etc.).
     Upgrade names stay the same in every element (his call from Sandbox 14).
   - The ELEMENT line shows what the element does now (Sandbox 14 rules + matchup) and how this titan looks in it.
   - The FOCUS line shows the move swaps (Sandbox 14), not the old +15% damage numbers.
   ===================================================================== */
const ELTXT={
 fire:'Pressure: every hit adds heat, 3 heat = a 3s burn (never a stun). Beats Lightning: burning wipes their shock count.',
 water:'Control: hits slow the rival for 2s. Heals only standing in a river. Beats Fire: their burns last half as long and your hits clear their heat.',
 lightning:'Burst: every 5th hit in a row shocks them and zaps the nearest building. Beats Water: shocks a Water titan every 4th hit.'};
const ELLOOK={
 valor:{water:'Painted Demon Slayer-style water ribbons, splashes and his water dragon.',
  fire:'Painted flame curls, ember bursts, fire rings and a flame ribbon. The water dragon and giant shield turn to fire.',
  lightning:'Painted bolts, spark stars and a jagged purple-edged ribbon. The water dragon and giant shield turn to lightning.'},
 infernoth:{fire:'Orange to white-hot rage glow, lava spit, lava pools and a heat beam.',
  water:'Deep-sea blue to cyan rage glow, boiling water and steam instead of lava, a water-jet beam, boiling rain under a storm-green sky.',
  lightning:'Purple to white rage glow, plasma instead of lava, lightning breath, lightning strikes in LAVA DOMAIN under a black-purple storm.'}};
// path upgrade wording per element (only the upgrades whose wording names an element)
const PATHTXT={
 valor:{tidewall:{
  water:'Sword & Shield: hold block to build a water wall that throws small shots back. Brawler: Tide Hook sends a wave that eats shots',
  fire:'Sword & Shield: hold block to build a wall of fire that throws small shots back. Brawler: Tide Hook sends a wave of fire that eats shots',
  lightning:'Sword & Shield: hold block to build a lightning wall that throws small shots back. Brawler: Tide Hook sends a crackling lightning wave that eats shots'}},
 infernoth:{
  rampage:{water:'BRAWLER: smashing buildings with a grab or stomp fills rage. MELTDOWN: buildings knocked down by the water-jet beam fill rage',
   lightning:'BRAWLER: smashing buildings with a grab or stomp fills rage. MELTDOWN: buildings blasted down by the lightning breath fill rage'},
  scorch:{water:'BRAWLER: Burrow\'s boiling water spout lasts 3s and the stomp leaves steaming cracks. MELTDOWN: the water-jet beam\'s boiling ground lasts twice as long',
   lightning:'BRAWLER: Burrow\'s plasma spout lasts 3s and the stomp leaves crackling cracks. MELTDOWN: the lightning breath\'s scorched ground lasts twice as long'},
  kingmon:{water:'BRAWLER: KING\'s tail WHACK sends them farther and they land in a boiling water burst. MELTDOWN: LAVA DOMAIN\'s beam pins them longer',
   lightning:'BRAWLER: KING\'s tail WHACK sends them farther and they land in a lightning burst. MELTDOWN: LAVA DOMAIN\'s beam pins them longer'},
  erupt:{water:'BRAWLER: Volcano Leap\'s eruption ring is twice as big. MELTDOWN: LAVA DOMAIN\'s boiling rain lasts 20s instead of 15',
   lightning:'BRAWLER: Volcano Leap\'s eruption ring is twice as big. MELTDOWN: LAVA DOMAIN\'s lightning strikes last 20s instead of 15'}}};
function focusTxt(id,fo){ if(fo==='hybrid'||!FOCUS_SWAP[id]||!FOCUS_SWAP[id][fo]) return 'The kit as it is: no moves swapped.';
 const S=FOCUS_SWAP[id][fo], nm=k=>MOVES[k]?MOVES[k].name.replace(/\s*\(.*\)$/,''):k;
 return (fo==='melee'?'Close-up moves in: ':'Ranged moves in: ')+Object.entries(S).map(([a,b])=>`${nm(b)} replaces ${nm(a)}`).join(' · ')+'.'; }
{ const o=renderDossier; renderDossier=function(){ const d=getDef(selId); if(!d||!d.core||vsMode==='story') return o();
  const id=d.id, L=loadOf(id), el=V8ELEM[L.el]?L.el:(homeEl({def:d})||'fire'), T=V8TREE[id], keepT=[], keepE={}, keepF={};
  if(T) for(const k of ['A','B']) T[k].nodes.forEach(n=>{ const v=PATHTXT[id]&&PATHTXT[id][n[2]]&&PATHTXT[id][n[2]][el]; if(v){ keepT.push([n,n[1]]); n[1]=v; } });
  for(const k in V8ELEM){ keepE[k]=V8ELEM[k].d; V8ELEM[k].d=ELTXT[k]+(ELLOOK[id]&&ELLOOK[id][k]?' Look: '+ELLOOK[id][k]:''); }
  for(const k in V8FOCUS){ keepF[k]=V8FOCUS[k].d; V8FOCUS[k].d=focusTxt(id,k); }
  try{ return o(); } finally{ for(const [n,t] of keepT) n[1]=t; for(const k in keepE) V8ELEM[k].d=keepE[k]; for(const k in keepF) V8FOCUS[k].d=keepF[k]; } }; }
