/* =====================================================================
   SANDBOX TEST 8: TWO ULTIMATES FOR VALOR, ONE PER STANCE (Nov 6, 2026)
   MajorasPride: each stance plays like its own character, ultimate included.
   - SWORD & SHIELD: "TIDECREST OATH". Line: "IF I DON'T... WHO WILL!" (his pick, a Goku-style hero line).
     Knight's salute, then he flashes through the rival again and again, each cut leaving painted water;
     the water coils into a dragon around them; one huge rising cut splits it; he turns his back,
     sheathes the sword with a click, and the wave crashes down behind him. (Demon Slayer feel, our own moves.)
   - BRAWLER: "ALL DAY STAR RUSH". Line: "I CAN DO THIS ALL DAY!" Star-rush charge into a comic-panel
     beatdown, then a KO uppercut that launches them up a giant water geyser.
   Use SUPERS READY (⚙ test tools) to fire them any time.
   ===================================================================== */
const VULT={
 sword:{name:'TIDECREST OATH',line:'IF I DON\'T... WHO WILL!'},
 brawl:{name:'ALL DAY STAR RUSH',line:'I CAN DO THIS ALL DAY!'},
};
{ const oS=v8UltStart; v8UltStart=function(f){ if(f.def.id==='valor'){ const U=isBrawl(f)?VULT.brawl:VULT.sword; f.def.ultName=U.name; V8SAY.valor=[U.line]; } return oS(f); }; }
// don't let the Combo Breaker / Break Free cut an ultimate short
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){ if(src&&src.atk&&src.atk.id==='ultimate'){ this.cmbN=0; this.stunRun=0; } return oTH.call(this,src,dmg,kb,launch,cont,dir); }; }
function ultHold(o,y){ if(!canHit(o)) return; o.stun=Math.max(o.stun,.3); o.stunRun=0; o.kb.set(0,0,0); o.atk=null; if(y!=null){ o.vy=0; o.onGround=false; o.pos.y=lerp(o.pos.y,y,.15); } }
function ultHit(f,o,dmg,kb,launch,at){ if(!canHit(o)) return; o.takeHit(f,dmg,kb||0,launch||0,false,{x:o.pos.x-f.pos.x+.01,z:o.pos.z-f.pos.z}); if(at) wfxHit(at,12); }
const POW=['POW!','BAM!','WHAM!','KRAK!','THWACK!','BOOM!'];

{ const oU=v8UltUpdate; v8UltUpdate=function(f,a,dt,pm,o){ if(f.def.id!=='valor') return oU(f,a,dt,pm,o);
  f.setGlow&&f.setGlow(2.5+Math.sin(game.time*20));
  return isBrawl(f)||a.brawl?ultBrawl(f,a,dt,pm,o):ultSword(f,a,dt,pm,o); }; }

/* ---------------- SWORD: TIDECREST OATH ---------------- */
function ultSword(f,a,dt,pm,o){ const t=a.t, c=()=>o.chest();
 if(once(a,'salute',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); ring(f.pos.x,1,f.pos.z,14,WATER,.5); burst(f.chest(),0xffffff,20,10); Snd.tone('triangle',600,1200,.3,.06); }
 // the flowing strikes: flash through the rival from side to side
 const N=6; for(let i=0;i<N;i++) if(once(a,'d'+i,.35+i*.2)&&canHit(o)){
  const ang=f.yaw+Math.PI+(i%2?1:-1)*(.6+i*.15), r=14+o.radius(), p0=f.pos.clone();
  f.pos.set(o.pos.x+Math.sin(ang)*r,o.pos.y>3?o.pos.y:0,o.pos.z+Math.cos(ang)*r); f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z);
  a.trail=true; const mid=p0.clone().lerp(f.pos,.5).add(V(0,c().y-o.pos.y,0)); for(let k=0;k<4;k++) wfxSprite(k%2?'curl':'curlM',p0.clone().lerp(f.pos,(k+.5)/4).add(V(0,8,0)),10,.5,{grow:.4,top:1});
  ultHit(f,o,4*pm,0,0,c()); slashFX(c(),f); Snd.tone('sawtooth',900,200,.12,.06); game.hitStop=Math.max(game.hitStop,.04); }
 if(t>.3&&t<1.6) ultHold(o,8);
 // the water dragon coils around the rival
 if(t>.5&&t<1.7){ a._dr=(a._dr||0)-dt; if(a._dr<=0&&canHit(o)){ a._dr=.05; const k=(t-.5)/1.2, g=k*Math.PI*5; wfxSprite(Math.sin(g)>0?'curl':'curlM',V(o.pos.x+Math.cos(g)*16,o.pos.y+2+k*26,o.pos.z+Math.sin(g)*16),13,.9,{grow:.3,top:1}); } }
 // one huge rising cut splits the dragon
 if(once(a,'rise',1.75)&&canHit(o)){ a.trail=true; f.pos.set(o.pos.x-Math.sin(f.yaw)*10,0,o.pos.z-Math.cos(f.yaw)*10); ultHit(f,o,18*pm,8,30,c()); slashFX(c(),f); wfxColumn(o.pos.x,o.pos.z,40,8); flashScreen('#7fd4ff'); game.hitStop=Math.max(game.hitStop,.15); game.shake=Math.max(game.shake,1); Snd.boom(); banner('TIDECREST OATH!',900); }
 // turn the back, sheathe (click), the wave crashes behind him
 if(once(a,'turn',2.15)){ f.yaw+=Math.PI; a.trail=false; }
 if(once(a,'click',2.45)){ Snd.tone('square',2400,1800,.05,.08); Snd.tone('triangle',1600,1600,.08,.05); toast('*click*','#ffffff',600); }
 if(once(a,'crash',2.6)&&canHit(o)){ const x=o.pos.x,z=o.pos.z; wfxRing(x,z,32,.8); for(let i=0;i<8;i++){ const g=i/8*Math.PI*2; wfxSprite(i%2?'curl':'curlM',V(x+Math.cos(g)*14,6,z+Math.sin(g)*14),18,.7,{grow:.5}); }
  aoe(f,o,x,z,18,10*pm,40,6,WATER); game.shake=Math.max(game.shake,1.3); Snd.boom(); }
 if(t>2.1) a.trail=false; }

/* ---------------- BRAWLER: ALL DAY STAR RUSH ---------------- */
function ultBrawl(f,a,dt,pm,o){ const t=a.t; a.brawl=1;
 if(once(a,'s',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); Snd.mech&&Snd.mech(); }
 // star rush: charge until contact
 if(!a.contact&&t<1){ f.kb.x=Math.sin(f.yaw)*95; f.kb.z=Math.cos(f.yaw)*95; if(Math.random()<dt*30){ burst(f.chest(),0xffd43b,3,8); wfxSprite('splash',f.pos.clone().add(V(0,4,0)),8,.3,{grow:.5}); }
  if(canHit(o)&&dist2(f,o)<f.radius()+o.radius()+6){ a.contact=t; f.kb.set(0,0,0); ultHit(f,o,8*pm,0,0,o.chest()); game.hitStop=Math.max(game.hitStop,.12); banner('STAR RUSH!',600); } }
 if(!a.contact&&t>=1){ a.dur=Math.min(a.dur,t+.4); return; }   // missed: short recovery
 if(!a.contact) return; const k=t-a.contact;
 if(k<2) ultHold(o,k<1.4?6:null);
 // comic-panel beatdown
 for(let i=0;i<9;i++) if(once(a,'p'+i,.15+i*.13)&&canHit(o)){ const at=o.chest().add(V(rand(-3,3),rand(-2,4),rand(-3,3))); ultHit(f,o,3.5*pm,0,0,null); punchFX(at,i%3===2); wfxHit(at,9);
  if(i%2===0) toast(POW[(i/2)%POW.length|0],['#ffd43b','#ff6b6b','#7fd4ff'][i%3],260); game.hitStop=Math.max(game.hitStop,.03); }
 // KO uppercut up a giant water geyser
 if(once(a,'ko',1.45)&&canHit(o)){ const at=o.chest(); ultHit(f,o,20*pm,6,46,at); wfxColumn(o.pos.x,o.pos.z,50,10); wfxRing(o.pos.x,o.pos.z,22,.7); burst(at,0xffd43b,40,30);
  flashScreen('#ffd43b'); game.hitStop=Math.max(game.hitStop,.18); game.shake=Math.max(game.shake,1.3); Snd.boom(); banner('K.O.!',900); a.dur=Math.min(a.dur,t+.9); } }
