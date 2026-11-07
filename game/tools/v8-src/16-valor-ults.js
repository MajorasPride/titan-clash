/* =====================================================================
   SANDBOX TEST 8: TWO ULTIMATES FOR VALOR, ONE PER STANCE (Nov 6, 2026)
   MajorasPride: each stance plays like its own character, ultimate included.
   - SWORD & SHIELD: "TIDECREST OATH". Line: "IF I DON'T... WHO WILL!" (his pick, a Goku-style hero line).
     Knight's salute, then he flashes through the rival again and again, each cut leaving painted water;
     the water coils into a dragon around them; one huge rising cut splits it; he turns his back,
     sheathes the sword with a click, and the wave crashes down behind him. (Demon Slayer feel, our own moves.)
   - BRAWLER: "ALL DAY STAR RUSH". Line: "I CAN DO THIS ALL DAY!" Star-rush charge into a comic-panel
     beatdown, then a KO uppercut that launches them up a giant water geyser.
   Flow (MajorasPride, Nov 6): press = he shouts the ultimate's name right away; the freeze-frame cutscene
   with his quote only plays if it LANDS. A miss = no cutscene and a short recovery.
   Use SUPERS READY (⚙ test tools) to fire them any time.
   ===================================================================== */
const VULT={
 sword:{name:'TIDECREST OATH',line:'IF I DON\'T... WHO WILL!'},
 brawl:{name:'ALL DAY STAR RUSH',line:'I CAN DO THIS ALL DAY!'},
};
// ANNOUNCE FIRST, CUTSCENE ONLY ON A HIT: pressing the ultimate shouts its name right away (no freeze);
// the freeze-frame cutscene with the quote only plays if the attack actually lands. A miss = no cutscene.
const ULT_CUT=v8UltStart;
v8UltStart=function(f){ if(f.def.id!=='valor') return ULT_CUT(f); const U=isBrawl(f)?VULT.brawl:VULT.sword; f.def.ultName=U.name; V8SAY.valor=[U.line];
 banner(U.name+'!',1000); flashScreen(f.def.css); Snd.mech&&Snd.mech(); Snd.tone('sawtooth',200,900,.35,.1); game.shake=Math.max(game.shake,.5);
 if(f.isPlayer||game.vs2) toast(isBrawl(f)?'CHARGE IN TO LAND IT!':'GET CLOSE TO LAND IT!','#7fd4ff',900);
 News.add(`${f.def.name} CALLS OUT ITS ULTIMATE: ${U.name}!`,true); };
function ultLanded(f,a){ if(a._cut) return; a._cut=1; ULT_CUT(f); }
function ultMiss(f,a,t){ a.miss=1; a.dur=Math.min(a.dur,t+.6); f.inv=0; if(f.isPlayer||game.vs2) toast('ULTIMATE MISSED!','#ff6b6b',900); Snd.tone('square',300,120,.3,.08); }
// don't let the Combo Breaker / Break Free cut an ultimate short
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){ if(src&&src.atk&&src.atk.id==='ultimate'){ this.cmbN=0; this.stunRun=0; } return oTH.call(this,src,dmg,kb,launch,cont,dir); }; }
function ultHold(o,y){ if(!canHit(o)) return; o.stun=Math.max(o.stun,.3); o.stunRun=0; o.kb.set(0,0,0); o.atk=null; if(y!=null){ o.vy=0; o.onGround=false; o.pos.y=lerp(o.pos.y,y,.15); } }
function ultHit(f,o,dmg,kb,launch,at){ if(!canHit(o)) return; o.takeHit(f,dmg,kb||0,launch||0,false,{x:o.pos.x-f.pos.x+.01,z:o.pos.z-f.pos.z}); if(at) wfxHit(at,12); }
const POW=['POW!','BAM!','WHAM!','KRAK!','THWACK!','BOOM!'];

{ const oU=v8UltUpdate; v8UltUpdate=function(f,a,dt,pm,o){ if(f.def.id!=='valor') return oU(f,a,dt,pm,o);
  f.setGlow&&f.setGlow(2.5+Math.sin(game.time*20));
  return isBrawl(f)||a.brawl?ultBrawl(f,a,dt,pm,o):ultSword(f,a,dt,pm,o); }; }

/* The ultimates themselves live in 21-shield-barrage.js (BRAWLER) and 22-sword-flash.js (SWORD). Old versions: archive/titan-clash-old-valor-ults-archive.js */
function ultSword(){} function ultBrawl(){}
