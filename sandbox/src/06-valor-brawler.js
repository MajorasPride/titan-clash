/* =====================================================================
   SANDBOX TEST 4: VALOR BRAWLER STANCE + NO MORE AIR STUN LOCK (Nov 6, 2026)
   Lives in the sandbox only. When MajorasPride OKs it, it moves into the game.
   BRAWLER (replaces the Rifle; the rifle code is in sandbox/archive/valor-rifle-archive.js):
   - Sword goes on the back. Fists + shield, Captain America style. Water element.
   - Light  = Jab combo (jab, cross, shield bash; a punch if the shield is out). Works in the air too.
   - Medium = Tide Hook (water hook that pushes them back).
   - Heavy  = Shield Throw (ricochets back). Press HEAVY again while it flies = Follow Dash toward the rival.
   - Special = Geyser Uppercut (water geyser launcher, JUMP to chase).
   - Jump + Heavy = Shield Dive (water shockwave).
   - Shield out (either stance) = no blocking and no auto-guard until it comes back.
   - Stance stats: SWORD & SHIELD = power +10%, takes 10% less damage.
                   BRAWLER = 10% faster, power -10%, energy refills 15% faster.
   STUN LOCK FIX (everyone):
   - Air light attacks count as light hits (they only stun every 5th hit, like the ground ones).
   - Max 3 light attacks per jump. Land to attack in the air again.
   - COMBO BREAKER: after 10 hits in a row the one getting hit breaks free (pushed out, 1s no stun).
   ===================================================================== */
const WATER=0x3fa9ff, BR={comboCap:10,airMax:3,dashWin:1.2};
Object.assign(MOVES,{
 bjab:{name:'Jab Combo',dur:.3,hitAt:.13,moveMul:.45,melee:[10,1.0,6,8,0],anim:'bjab',holdP:.25},
 thook:{name:'Tide Hook',dur:.58,hitAt:.28,lunge:14,melee:[12,1.1,12,40,6],anim:'bhook',holdP:.3},
 bthrow:{name:'Shield Throw',dur:.5,cd:2.5,ranged:1,anim:'vthrowshield',noCharge:1},
 bdash:{name:'Follow Dash',dur:.28,moveMul:0,anim:'bdash',noCharge:1},
 geyser:{name:'Geyser Uppercut (launcher)',dur:.75,hitAt:.3,cost:15,cd:3,anim:'bgeyser',launcher:1,noCharge:1},
 bdive:{name:'Shield Dive',dur:1.6,hitAt:.15,moveMul:.2,anim:'bdive'},
 vsheathe:{name:'Stance Swap',dur:.42,moveMul:.5,anim:'vsheathe'},
});
LIGHT.push('bjab','vairslash');
STRINGS['valor:1']={ L:{id:'bjab',c:0}, LL:{id:'bjab',c:1}, LLL:{id:'bjab',c:2,end:1},
 LLM:{id:'thook',end:1}, LM:{id:'thook'}, M:{id:'thook'}, MM:{id:'thook',end:1},
 AL:{id:'bjab',c:0}, ALL:{id:'bjab',c:1}, ALLL:{id:'bjab',c:2,end:1} };

const shieldOut=f=>V8.discs.some(D=>D.f===f&&D.kind!=='portal');
const isBrawl=f=>f&&f.def&&f.def.id==='valor'&&f.F&&f.F.brawl;
function fistAt(f,side){ const P=f.P, t=V(); const arm=side<0?P.elL||P.armL:P.elR||P.armR; if(arm) arm.getWorldPosition(t); else t.copy(f.chest()); return t.add(V(Math.sin(f.yaw)*4*f.scale,0,Math.cos(f.yaw)*4*f.scale)); }
function punchFX(at,water){ burst(at,0xffffff,10,16); burst(at,water?WATER:0xffd43b,water?18:8,water?20:14); if(water){ ring(at.x,at.y,at.z,8,WATER,.25); } Snd.thud&&Snd.thud(); Snd.tone('square',180,90,.08,.08); }

/* ---------------- poses ---------------- */
POSES.bjab=(k,p,e,f,a)=>{ const c=a.chain||0, out=shieldOut(f);
 if(c<2||out){ const R=c%2===0; if(R){ k.armR=-.4-1.25*e; k.elR=-1.5+1.45*e; k.azR=.1; k.armL=-1.2; k.elL=-1.4; k.azL=.45; } else { k.armL=-.4-1.25*e; k.elL=-1.5+1.45*e; k.azL=-.05; k.armR=-1; k.elR=-1.5; }
  k.twist=(R?-1:1)*.5*e; k.lean=.1+.15*e; k.legL=-.3*e; k.knR=.25*e; }
 else { k.armL=lerp(-.7,-1.62,e); k.elL=lerp(-1.6,-.05,e); k.azL=.2; k.twist=.75*e; k.lean=.38*e; k.armR=-.6; k.elR=-1.2; k.legL=-.5*e; k.knR=.45*e; } };
POSES.bhook=(k,p,e)=>{ const w=ez(ph(p,0,.42)), s=ez(ph(p,.42,.62)); k.armR=lerp(lerp(-.5,-1.2,w),-1.5,s); k.elR=lerp(-1.6,-1.7,w)*(1-s)+(-1.0)*s; k.azR=lerp(lerp(.2,1.1,w),-.9,s);
 k.twist=lerp(lerp(0,.8,w),-.85,s); k.lean=.1+.25*s; k.armL=-1.2; k.elL=-1.4; k.azL=.45; k.knL=k.knR=.35*w; k.legL=-.35*s; };
POSES.bdash=(k,p)=>{ k.lean=.55; k.armL=-1.5; k.elL=-.4; k.azL=.5; k.armR=-.5; k.elR=-1.6; k.legL=-.8; k.knL=.6; k.legR=.5; k.knR=.9; };
POSES.bgeyser=(k,p,e)=>{ const w=ez(ph(p,0,.38)), s=ez(ph(p,.38,.58)); k.armR=lerp(lerp(-.5,.4,w),-3.0,s); k.elR=lerp(-1.5,-.2,s); k.azR=.1; k.armL=-1.1; k.elL=-1.4; k.azL=.45;
 k.knL=k.knR=lerp(1.0*w,0,s); k.legL=k.legR=lerp(-.6*w,.1,s); k.lean=lerp(lerp(0,.4,w),-.3,s); k.twist=lerp(.4*w,-.3,s); };
POSES.bdive=(k,p,e,f,a)=>{ const land=a.landT!=null?ez(Math.min(1,(a.t-a.landT)/.12)):0; k.armL=lerp(-1.9,-1.4,land); k.elL=-.2; k.azL=.2; k.armR=-.8; k.elR=-1.4; k.lean=lerp(.5,.7,land); k.knL=k.knR=lerp(1.2,.9,land); k.legL=k.legR=lerp(-.6,-.9,land); };
POSES.vsheathe=(k,p)=>{ const u=Math.sin(Math.min(1,p)*Math.PI); k.armR=-.6-2.3*u; k.elR=-.4-1.2*u; k.azR=.15+.35*u; k.twist=-.25*u; k.headX=-.1*u; };

/* ---------------- what each move does ---------------- */
Object.assign(V8MOVE,{
 bjab(f,a,dt,pm,o){ const c=a.chain||0;
  if(!f.onGround) f.vy=Math.max(f.vy,1.5);                         // float a little in the air (max 3 per jump)
  if(once(a,'w',a.hitAt*.7)) Snd.whoosh();
  if(a.landed&&once(a,'fx',0)){ const sh=c===2&&!shieldOut(f); const at=o.chest().lerp(f.chest(),.35); if(sh) clangFX(at); else punchFX(at,c===2); } },
 thook(f,a,dt,pm,o){ if(once(a,'w',a.hitAt*.8)){ Snd.whoosh(); burst(fistAt(f,1),WATER,8,10); }
  if(a.landed&&once(a,'fx',0)){ const at=o.chest().lerp(f.chest(),.35); punchFX(at,true); burst(at,WATER,26,26); game.hitStop=Math.max(game.hitStop,.06); } },
 bthrow(f,a,dt,pm,o){ if(once(a,'t',.18*a.dur)){ if(shieldOut(f)) return; const p=f.chest(); V8.discs.push({f,o,pos:p,vel:V(),state:'out',t:0,bounces:1+(up(f,'bounce')?2:0),dmg:11*pm,hit:false,m:v8DiscMesh()}); if(f.P.v8shield) f.P.v8shield.visible=false; Snd.whoosh(); f.dashWin=game.time+BR.dashWin;
   if(f.isPlayer) toast('HEAVY AGAIN = FOLLOW DASH','#7fd4ff',700); } },
 bdash(f,a,dt,pm,o){ if(once(a,'s',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); Snd.whoosh(); burst(f.pos.clone().add(V(0,2,0)),WATER,14,12); }
  const d=canHit(o)?dist2(f,o):99, stop=o.radius()+f.radius()+3;
  if(a.t<.22&&d>stop){ f.kb.x=Math.sin(f.yaw)*85; f.kb.z=Math.cos(f.yaw)*85; if(Math.random()<dt*40) burst(f.pos.clone().add(V(0,3,0)),WATER,2,6); }
  else f.kb.multiplyScalar(.5); },
 geyser(f,a,dt,pm,o){ if(once(a,'w',a.hitAt*.6)){ Snd.whoosh(); const fx=f.pos.x+Math.sin(f.yaw)*9*f.scale, fz=f.pos.z+Math.cos(f.yaw)*9*f.scale; ring(fx,.5,fz,9,WATER,.35); }
  if(a.t>=a.hitAt&&!a._gy){ a._gy=1; const fx=f.pos.x+Math.sin(f.yaw)*9*f.scale, fz=f.pos.z+Math.cos(f.yaw)*9*f.scale;
   pillar(fx,fz,3.5,WATER,.7,45); burst(V(fx,3,fz),WATER,40,30); burst(V(fx,3,fz),0xffffff,16,22); dust(fx,fz,4,4); game.shake=Math.max(game.shake,.6); Snd.boom();
   coneHit(f,a,o,15,1.2,14*pm,6,36,'clang'); if(a.landed){ game.hitStop=Math.max(game.hitStop,.08); if(f.isPlayer) toast('GEYSER! (JUMP TO CHASE)','#3fa9ff',800); } } },
 bdive(f,a,dt,pm,o){ if(once(a,'d',0)){ f.vy=Math.min(f.vy,-80); Snd.whoosh(); }
  if(a.landT==null){ a.t=Math.min(a.t,.5); if(Math.random()<dt*30) burst(f.chest(),WATER,2,6);
   if(!a._bh&&canHit(o)&&dist2(f,o)<f.radius()+o.radius()+4&&f.pos.y>o.pos.y) landHit(f,a,o,10*pm,12,0,o.chest().lerp(f.chest(),.4),'clang');
   if(f.onGround){ a.landT=a.t; a.dur=a.t+.4; const fx=Math.sin(f.yaw)*4, fz=Math.cos(f.yaw)*4; aoe(f,o,f.pos.x+fx,f.pos.z+fz,18,13*pm,28,14,WATER);
    ring(f.pos.x,.5,f.pos.z,24,WATER,.5); ring(f.pos.x,.5,f.pos.z,14,0xffffff,.3); burst(f.pos.clone().add(V(0,2,0)),WATER,40,28); game.shake=Math.max(game.shake,1); Snd.boom(); } } },
});

/* ---------------- stance swap: sheathe / draw animation + stats ---------------- */
{ const oSt=v8Stance; v8Stance=function(f){ const n0=f.stIdx; oSt(f); if(f.def.id!=='valor'||f.stIdx===n0) return;
  const free=f.atk&&f.atk.id==='stance'&&f.atk.dur<.1; if(!free){ f.atk=null; f.startAtk('vsheathe'); }
  Snd.tone('triangle',700,1200,.1,.05);
  if(f.isPlayer||game.vs2) toast(f.F.brawl?'BRAWLER · SPEED ↑ ENERGY ↑ · POWER ↓':'SWORD & SHIELD · POWER ↑ DEFENSE ↑','#7fd4ff',1100); }; }

/* ---------------- input: follow dash, no block while the shield is out, air attack limit ---------------- */
{ const oF=v8Fire; v8Fire=function(f,id,quiet){ const air=!f.onGround&&f.pos.y-(f._floor||0)>5;
  if(id==='bthrow'&&shieldOut(f)) return false;
  const r=oF(f,id,quiet); if(r&&air&&LIGHT.includes(id)) f.airN=(f.airN||0)+1; return r; }; }
{ const oI=v8Input; v8Input=function(f,inp,dt){
  if(f.onGround) f.airN=0;
  const canAct=!f.dead&&f.stun<=0&&game.state==='fight'&&f.rollT<=0&&!f.grabbedBy&&!f.held;
  // max 3 light attacks per jump
  if(!f.onGround&&(f.airN||0)>=BR.airMax&&(inp.punch>0||inp.medium>0)){ inp.punch=0; inp.medium=0; }
  // Brawler: HEAVY again while the shield flies = Follow Dash
  if(isBrawl(f)&&inp.heavy>0&&canAct&&f.onGround&&shieldOut(f)&&game.time<(f.dashWin||0)&&!(f.atk&&f.atk.id==='bdash')){ inp.heavy=0; f.atk=null; f.cg=null; f.dashWin=0; f.startAtk('bdash'); }
  // shield out = no blocking
  if(f.def.id==='valor'&&shieldOut(f)){ inp.block=false; f.blocking=false; }
  if(f.F&&f.F.regen&&game.state==='fight') f.energy=Math.min(100,f.energy+dt*1.6*(f.F.regen-1));
  return oI(f,inp,dt); }; }

/* ---------------- damage: shield out = no guard; COMBO BREAKER after 10 hits ---------------- */
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  const fromF=!!(src&&src.def&&src!==HZ);
  if(this.def&&this.def.id==='valor'&&shieldOut(this)){ this.blocking=false; const g=this.guard; if(g!=null) this.guard=0; const hp0=this.hp;
   try{ oTH.call(this,src,dmg,kb,launch,cont,dir); } finally{ if(g!=null&&this.guard===0) this.guard=g; } return cmbCount(this,fromF,cont,hp0); }
  const hp0=this.hp; oTH.call(this,src,dmg,kb,launch,cont,dir); return cmbCount(this,fromF,cont,hp0); }; }
function cmbCount(f,fromF,cont,hp0){ if(!fromF||cont||f.dead||f.hp>=hp0) return;
 f.cmbN=(game.time-(f.cmbT||-9)<1.0?f.cmbN||0:0)+1; f.cmbT=game.time;
 if(f.cmbN>=BR.comboCap&&f.hp>0){ f.cmbN=0; if(typeof breakFree==='function') breakFree(f); else { f.stun=0; f.stunImm=game.time+1; }
  f.vy=Math.max(f.vy,0); banner('COMBO BREAKER!',650); } }
{ const oR=sbReset; sbReset=function(){ for(const f of [game.p,game.e]) if(f){ f.cmbN=0; f.airN=0; f.dashWin=0; } oR(); }; }
