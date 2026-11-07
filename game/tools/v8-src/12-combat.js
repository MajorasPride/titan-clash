/* =====================================================================
   SANDBOX TEST 3: COMBAT FEEL (Nov 6, 2026)
   Lives in the sandbox only. When MajorasPride OKs it, it moves into the game.
   - LIGHT, MEDIUM and HEAVY are 3 separate buttons (medium no longer hides inside "tap heavy").
   - HOLD any of the 3 to charge it: the titan freezes at the wind-up and powers up.
     Full charge at 1.2s (MAX: up to 2x damage, more knockback, breaks a block). Fires by itself at 2s.
   - Combo strings (target combos, like Street Fighter / Tekken / Smash): the button order picks the move.
     L L L, L L M, L L H, L M, L H, M M, M H ... each one its own swing. Strings continue on hit,
     or if you press the next button right after the last move ends.
   - Each hit in a string pushes the rival a little more; enders fling them a tad.
   - Launchers (Rising Slash, Shield Uppercut, Overhead Cleave): press JUMP after they hit to chase
     the rival into the air, then L L in the air and HEAVY to plunge.
   - WALL SPLAT: knock a rival into a building with a combo and they get pinned to it, stunned,
     then bounce back off. Rock-paper-scissors to break away:
        STRIKE beats DASH · DASH beats GRAB · GRAB beats BLOCK · BLOCK beats STRIKE
   - 1/2/3 buttons moved into an arc around LIGHT, with a cooldown sweep (spin) on each one.
   - Sandbox menu: BUILDINGS on/off and PEOPLE & CARS on/off.
   ===================================================================== */
const CB={tap:.15,full:1.2,max:2.0,strWin:.32};
SB.city=true; SB.pop=false; SB.walls=true;

/* ---------------- keys: Light J · Medium K · Heavy L · Special U (sandbox only, never saved) ---------------- */
BUFF.push('medium');
ACTIONS.splice(ACTIONS.findIndex(a=>a[0]==='punch')+1,0,['medium','Medium attack']);
Object.assign(DEF_SETS.solo,{punch:['KeyJ','Mouse0'],medium:['KeyK',''],heavy:['KeyL','Mouse2'],special:['KeyU','KeyR']});
Object.assign(DEF_SETS.p1,{punch:['KeyF',''],medium:['KeyG',''],heavy:['KeyH',''],special:['KeyY','']});
Object.assign(DEF_SETS.p2,{medium:['',''] });
for(const st of ['solo','p1']) for(const k of ['punch','medium','heavy','special']) BS[st][k]=DEF_SETS[st][k].slice();
BS.p2.medium=BS.p2.medium||['',''];
rebuildCodeMap(); for(const I of inps) I.medium=0;
{ const o=readInput; readInput=function(pi,dt){ o(pi,dt); const I=inps[pi];
  I.punchHeld=isDown('punch',pi)||(pi===0&&tbHeld('punch'));
  I.mediumHeld=isDown('medium',pi)||(pi===0&&tbHeld('medium')); }; }

/* ---------------- VALOR's new string moves ---------------- */
Object.assign(MOVES,{
 vspin:{name:'Spin Slash',dur:.7,hitAt:.4,moveMul:.15,anim:'vspin',holdP:.2},
 vcross:{name:'Cross Cut',dur:.85,hitAt:.25,moveMul:.2,anim:'vcross',holdP:.12},
 vcleave:{name:'Overhead Cleave (bounce)',dur:.8,hitAt:.36,moveMul:.15,anim:'vcleave',holdP:.36,launcher:1},
 vupper:{name:'Shield Uppercut (launcher)',dur:.65,hitAt:.24,moveMul:.15,anim:'vupper',holdP:.3,launcher:1},
 vairslash:{name:'Air Slash',dur:.38,hitAt:.13,moveMul:.6,anim:'vairs',holdP:.25},
});
MOVES.risingslash.launcher=1; MOVES.risingslash.holdP=.4; MOVES.vslash.holdP=.27; MOVES.swordthrust.holdP=.3;

POSES.vspin=(k,p,e,f)=>{ const w=ez(ph(p,0,.2)), s=ez(ph(p,.2,.68));
 k.twist=lerp(.7*w,.7-Math.PI*2,s); k.armR=-1.45; k.azR=lerp(.2,-1.25,Math.min(1,s*4)); k.elR=-.1; k.armL=-1.2; k.elL=-1.3; k.azL=.5;
 k.lean=.12; k.knL=k.knR=.45; k.legL=k.legR=-.25; f.v8.blade=-Math.PI/2; };
POSES.vcross=(k,p,e,f)=>{ const w1=ez(ph(p,.0,.22)), s1=ez(ph(p,.22,.4)), w2=ez(ph(p,.44,.55)), s2=ez(ph(p,.55,.72));
 if(p<.44){ k.armR=lerp(lerp(-1.3,-2.75,w1),-.8,s1); k.azR=lerp(lerp(.1,.75,w1),-.7,s1); k.twist=lerp(lerp(0,.6,w1),-.65,s1); f.v8.blade=lerp(lerp(-1.6,-2.7,w1),-.5,s1); }
 else { k.armR=lerp(lerp(-.8,-2.75,w2),-.8,s2); k.azR=lerp(lerp(-.7,-.85,w2),.75,s2); k.twist=lerp(lerp(-.65,-.75,w2),.7,s2); f.v8.blade=lerp(lerp(-.5,-2.7,w2),-.5,s2); }
 k.elR=-.15; k.armL=-1.1; k.elL=-1.3; k.azL=.45; k.lean=.15+.2*(s1+s2)/2; k.legL=-.4; k.knL=.35; k.knR=.25; };
POSES.vcleave=(k,p,e,f)=>{ const w=ez(ph(p,0,.38)), s=ez(ph(p,.38,.55));
 k.armR=lerp(lerp(-.9,-3.0,w),-.55,s); k.elR=lerp(-.2,-.9,w)*(1-s)-.1; k.azR=.05; k.armL=lerp(-1,-2.6,w)*(1-s)+(-1.1)*s; k.elL=-.9; k.azL=.3;
 k.lean=lerp(lerp(0,-.22,w),.55,s); k.knL=k.knR=.25+.6*s; k.legL=-.3-.4*s; k.headX=-.15*w+.2*s; f.v8.blade=lerp(lerp(-1.6,-3.5,w),-.15,s); };
POSES.vupper=(k,p,e,f)=>{ const w=ez(ph(p,0,.3)), s=ez(ph(p,.3,.5));
 k.armL=lerp(lerp(-.6,-.15,w),-2.95,s); k.elL=lerp(-1.4,-.15,s); k.azL=.2; k.armR=-.6; k.elR=-1.2;
 k.knL=k.knR=lerp(.9*w,0,s); k.legL=k.legR=lerp(-.6*w,.1,s); k.lean=lerp(lerp(0,.35,w),-.3,s); k.twist=lerp(-.3*w,.35,s); f.v8.blade=-1.2; };
POSES.vairs=(k,p,e,f,a)=>{ const c=a.chain||0, sg=c%2?-1:1, w=ez(ph(p,0,.28)), sw=ez(ph(p,.28,.6));
 k.twist=lerp(lerp(0,.85*sg,w),-.9*sg,sw); k.armR=lerp(-1.8,-1.0,sw); k.elR=-.25; k.azR=lerp(lerp(.15,.75*sg,w),-.6*sg,sw);
 k.armL=-1.15; k.elL=-1.25; k.azL=.45; k.lean=.2; k.legL=k.legR=-.9; k.knL=k.knR=1.2; f.v8.blade=lerp(-1.2,-2.2,sw); };

Object.assign(V8MOVE,{
 vspin(f,a,dt,pm,o){ const p=a.t/a.dur; a.trail=p>.2&&p<.72; a.act=p>.3&&p<.66;
  if(once(a,'w',.2*a.dur)){ Snd.whoosh(); Snd.tone('sawtooth',700,200,.2,.05); }
  if(once(a,'r',.42*a.dur)){ const c=f.chest(); ring(f.pos.x,c.y,f.pos.z,17*f.scale,f.def.glow,.3); ring(f.pos.x,c.y-2,f.pos.z,13*f.scale,0xffffff,.22); }
  if(p>.42&&!a._bh) coneHit(f,a,o,16,Math.PI,11*pm,26,4,'slash'); },
 vcross(f,a,dt,pm,o){ const p=a.t/a.dur;
  if(p<.44){ swing(f,a,o,.22,.42,9*pm,8,0,14); if(once(a,'w1',.2*a.dur)) Snd.tone('sawtooth',600,200,.12,.05); }
  else { if(!a._r){ a._r=1; a._bh=0; a._end=0; a.hit=false; } swing(f,a,o,.55,.74,14*pm,36,9,15); if(once(a,'w2',.53*a.dur)) Snd.tone('sawtooth',800,160,.14,.06);
   if(a._bh&&once(a,'x',0)){ const c=o.chest(); slashFX(c,f); burst(c,0xffffff,22,26); game.hitStop=Math.max(game.hitStop,.08); } } },
 vcleave(f,a,dt,pm,o){ swing(f,a,o,.38,.56,15*pm,6,26,14); if(once(a,'w',.36*a.dur)) Snd.tone('sawtooth',260,900,.18,.06);
  if(once(a,'g',.5*a.dur)){ const fx=f.pos.x+Math.sin(f.yaw)*10*f.scale, fz=f.pos.z+Math.cos(f.yaw)*10*f.scale; ring(fx,.5,fz,10,f.def.glow,.35); dust(fx,fz,5,4); game.shake=Math.max(game.shake,.5); Snd.thud(); }
  if(a._bh&&once(a,'b',0)){ ring(o.pos.x,.5,o.pos.z,12,0xffffff,.35); if(f.isPlayer) toast('GROUND BOUNCE! (JUMP TO CHASE)','#7fd4ff',800); } },
 vupper(f,a,dt,pm,o){ const p=a.t/a.dur; a.act=p>.3&&p<.52; if(once(a,'w',.28*a.dur)) Snd.whoosh();
  if(p>=.36&&!a._bh) coneHit(f,a,o,12,1.1,12*pm,6,34,'clang');
  if(a._bh&&once(a,'u',0)&&f.isPlayer) toast('LAUNCHED! (JUMP TO CHASE)','#7fd4ff',800); },
 vairslash(f,a,dt,pm,o){ if(!f.onGround) f.vy=Math.max(f.vy,1.5); swing(f,a,o,.28,.6,8*pm,5,9,13); if(once(a,'w',.26*a.dur)) Snd.tone('sawtooth',520,190,.1,.05); },
});

/* ---------------- combo strings: the order of the buttons picks the move ---------------- */
// key = the buttons so far (A = in the air). c = which hit of a 3-hit light combo. end = finisher.
const STRINGS={
 'valor:0':{ L:{id:'vslash',c:0}, LL:{id:'vslash',c:1}, LLL:{id:'vslash',c:2,end:1},
  LLM:{id:'vspin',end:1}, LLH:{id:'vcross',end:1},
  LM:{id:'vbash'}, LMH:{id:'swordthrust',end:1}, LH:{id:'vcleave',end:1},
  M:{id:'vbash'}, MM:{id:'vupper',end:1}, MH:{id:'swordthrust',end:1},
  AL:{id:'vairslash',c:0}, ALL:{id:'vairslash',c:1}, ALLL:{id:'vairslash',c:2,end:1} },
 'voidmaw:0':{ L:{id:'vtlash',c:0}, LL:{id:'vtlash',c:1}, LLL:{id:'vtlash',c:2,end:1},
  LLM:{id:'vinesweep',end:1}, LLH:{id:'eyeslam',end:1}, LM:{id:'vinesweep'}, LH:{id:'eyeslam',end:1},
  M:{id:'vinesweep'}, MH:{id:'rootburrow',end:1} },
};
const STR_NAMES={L:'L',M:'M',H:'H',A:'(air)'};
function strTable(f){ return STRINGS[f.def.id+':'+(f.stIdx||0)]||null; }
function heavyPick(f,inp){ const F=f.F, H=HEAVYSET[F.K]; if(!H) return F.K; return H[Math.hypot(inp.mx||0,inp.mz||0)>.45?1:0]; }
function fireStr(f,inp,b,seq){ const T=strTable(f), air=!f.onGround&&f.pos.y-(f._floor||0)>5, F=f.F;
 let key=(air&&seq===''?'A':seq)+b, e=T&&T[key];
 if(!e&&seq){ key=(air?'A':'')+b; e=T&&T[key]; }                       // string broken: start a new one with this button
 let id;
 if(b==='H'&&air&&(!e)){ if(F.air) id=F.air; else if(!F.hover){ f.startAtk('groundpound'); return true; } }
 if(!id&&e) id=e.id;
 if(!id){ id=b==='L'?F.J:b==='M'?F.M:heavyPick(f,inp); key=b; }
 if(id===F.K||HEAVYSET[id]) id=heavyPick(f,inp);
 if(f.atk) f.atk=null;
 if(!v8Fire(f,id)) return false;
 const A=f.atk; if(!A) return true;
 A.str=key; A.sn=key.replace('A','').length; A.end=!!(e&&e.end);
 if(e&&e.c!=null){ A.chain=e.c; if(e.c>0){ f.kb.x+=Math.sin(f.yaw)*7; f.kb.z+=Math.cos(f.yaw)*7; } if(e.c===2){ A.dur*=1.35; A.hitAt*=1.3; } }
 f.sq={s:key,end:game.time};
 // charging: hold the button and the titan freezes at the wind-up
 const M=MOVES[A.id];
 if(!M.noCharge){ const hp=(M.holdP!=null?M.holdP*A.dur:Math.min(.8*(A.hitAt||A.dur*.3),.22*A.dur)); f.cg={b,a:A,hp,t:0,full:false}; }
 return true; }
const HELD={L:'punchHeld',M:'mediumHeld',H:'heavyHeld'}, PRESS={L:'punch',M:'medium',H:'heavy'};
function chargeTick(f,inp,dt){ const C=f.cg; if(!C) return; const A=f.atk;
 if(!A||A!==C.a||f.stun>0||f.dead){ f.cg=null; return; }
 const held=!!inp[HELD[C.b]];
 if(held&&C.t<CB.max){ if(A.t>=C.hp){ A.t=C.hp; C.t+=dt; A.chg=clamp((C.t-CB.tap)/(CB.full-CB.tap),0,1);
   if(C.t>CB.tap){ if(Math.random()<dt*(10+40*A.chg)) burst(f.chest(),A.chg>=1?0xffffff:f.def.glow,2,4+8*A.chg);
    if(!C.r1&&A.chg>.5){ C.r1=1; Snd.tone('triangle',500,900,.12,.04); ring(f.pos.x,1,f.pos.z,8*f.scale,f.def.glow,.3); }
    if(!C.full&&A.chg>=1){ C.full=true; Snd.tone('triangle',900,1800,.18,.06); ring(f.pos.x,1,f.pos.z,13*f.scale,0xffffff,.35); burst(f.chest(),0xffffff,20,14); if(f.isPlayer) toast('MAX CHARGE!','#ffd43b',500); } } } }
 else { if(A.chg>0){ Snd.whoosh(); burst(f.chest(),A.chg>=1?0xffffff:f.def.glow,10+20*A.chg,10+10*A.chg); } f.cg=null; } }

/* ---------------- input (humans only; the CPU keeps its old way) ---------------- */
{ const oI=v8Input; v8Input=function(f,inp,dt){
  const human=f.isPlayer&&!f.pilot||(game.vs2&&f===game.e);
  if(!human) return oI(f,inp,dt);
  const A=f.atk, canAct=!f.dead&&f.stun<=0&&game.state==='fight'&&f.rollT<=0&&!f.grabbedBy&&!f.held;
  chargeTick(f,inp,dt);
  // new presses go into a short buffer, so the old code never sees them
  for(const b of ['L','M','H']) if(inp[PRESS[b]]>0){ inp[PRESS[b]]=0; f.buf={b,t:game.time}; }
  if(f.held){ if(f.buf&&f.buf.b==='H'){ inp.heavy=.25; f.buf=null; } else if(f.buf){ inp.punch=.25; f.buf=null; } } // holding a building: old throw / swing
  if(A&&A.str&&f.sq) f.sq.end=game.time;
  if(f.buf&&A&&A.str) f.buf.t=Math.max(f.buf.t,game.time-.05);      // pressed during a string move: keep it until the move can continue
  if(f.buf&&game.time-f.buf.t>.3) f.buf=null;
  if(f.buf&&canAct&&!f.cg){
   const cancelOK=A&&A.str&&A.landed&&A.t>=(A.hitAt||0)+.03;
   const free=!A||A.id==='stance';
   if(cancelOK||free){ const seq=(cancelOK?A.str:(f.sq&&game.time-f.sq.end<CB.strWin?f.sq.s:'')); const b=f.buf.b; f.buf=null; if(seq.length>=4) f.sq={s:'',end:0}; fireStr(f,inp,b,seq.length>=4?'':seq); } }
  // a landed string move can cancel into special
  if(inp.special>0&&canAct&&A&&A.str&&A.landed&&A.t>=(A.hitAt||0)+.03) f.atk=null;
  // launcher -> jump = chase the rival into the air
  if(inp.jump>0&&canAct&&A&&MOVES[A.id]&&MOVES[A.id].launcher&&A.landed&&A.t>=(A.hitAt||0)){ inp.jump=0; f.atk=null; f.cg=null; f.vy=40; f.onGround=false; f.sq={s:'',end:0}; Snd.whoosh(); burst(f.pos.clone().add(V(0,1,0)),0xffffff,14,14); }
  return oI(f,inp,dt); }; }

/* ---------------- damage: charge, combo fling, wall splat outcomes ---------------- */
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  const F=src&&src.def&&src!==HZ, A=F?src.atk:null;
  if(F&&!cont&&A){
   if(A.chg>0){ dmg*=1+A.chg; kb*=1+.8*A.chg; if(A.chg>=1){ launch=Math.max(launch||0,10); if(this.blocking){ this.blocking=false; toast('BLOCK BROKEN!','#ffd43b',700); burst(this.chest(),0xffd43b,20,18); } } }
   if(A.sn){ kb+=3*(A.sn-1); if(A.end){ kb=kb*1.35+8; launch=Math.max(launch||0,7); } } }
  if(F&&!cont) this._hitT=game.time;
  const S=this.splat;
  if(S&&F&&!cont){
   if(S.choice==='block'){ wallEscape(this,src); return; }                                      // BLOCK beats STRIKE
   if(S.choice==='slip'){ S.choice=null; dmg*=1.25; toast('CAUGHT!','#ff6b6b',700); }           // STRIKE beats DASH
   oTH.call(this,src,dmg,kb,launch,cont,dir); if(this.splat){ this.kb.set(0,0,0); this.vy=0; } return; }
  return oTH.call(this,src,dmg,kb,launch,cont,dir); }; }

/* ---------------- WALL SPLAT ---------------- */
function wallNormal(f,b){ const dx=(f.pos.x-b.x)/(b.w/2), dz=(f.pos.z-b.z)/(b.d/2); return Math.abs(dx)>Math.abs(dz)?{x:Math.sign(dx)||1,z:0}:{x:0,z:Math.sign(dz)||1}; }
function startSplat(f,b){ const n=wallNormal(f,b), r=f.radius();
 f.splat={b,n,t:0,dur:1.15,choice:null,slipT:0,ai:rand(.18,.35)}; f.splatCd=game.time+3;
 if(n.x) f.pos.x=b.x+n.x*(b.w/2+r); else f.pos.z=b.z+n.z*(b.d/2+r);
 f.kb.set(0,0,0); f.vy=0; f.flying=false; f.stun=Math.max(f.stun,1.15); if(f.beamOn) f.stopBeam(); f.atk=null; f.cg=null;
 const at=V(f.pos.x-n.x*r,f.chest().y,f.pos.z-n.z*r); crackFX(at,n); burst(at,0xffe9a8,26,20); dust(at.x,at.z,6,6);
 game.shake=Math.max(game.shake,.8); game.hitStop=Math.max(game.hitStop,.12); Snd.boom(); Snd.thud();
 banner('WALL SPLAT!',650);
 if(f.isPlayer) toast('PINNED! HOLD BLOCK = BRACE · DASH = SLIP OUT','#ff9f43',1300);
 else if(f.opp&&f.opp.isPlayer) toast('PINNED! STRIKE IT · OR GRAB FOR A WALL THROW','#7fd4ff',1300); }
function endSplat(f,bounce){ const S=f.splat; if(!S) return; f.splat=null; if(bounce){ f.kb.x+=S.n.x*30; f.kb.z+=S.n.z*30; f.vy=Math.max(f.vy,9); f.onGround=false; f.stun=Math.max(f.stun,.3); dust(f.pos.x,f.pos.z,4,3); } }
function wallEscape(f,src){ const S=f.splat; endSplat(f,false); f.stun=0; f.kb.x+=S.n.x*48; f.kb.z+=S.n.z*48; f.inv=.25;
 const dx=src.pos.x-f.pos.x, dz=src.pos.z-f.pos.z, d=Math.hypot(dx,dz)||1; src.kb.x+=dx/d*34; src.kb.z+=dz/d*34; src.stun=Math.max(src.stun,.45); src.atk=null; src.cg=null;
 clangFX(f.chest().lerp(src.chest(),.5)); toast('BRACED! BLOCK BEATS STRIKE','#7dff9a',900); }
function slipOut(f){ const S=f.splat, I=f.inp||{}; let tx=-S.n.z, tz=S.n.x; if((I.mx||0)*tx+(I.mz||0)*tz<0||(!I.mx&&!I.mz&&Math.random()<.5)){ tx=-tx; tz=-tz; }
 endSplat(f,false); f.stun=0; f.kb.x+=tx*80+S.n.x*22; f.kb.z+=tz*80+S.n.z*22; f.inv=.3; burst(f.chest(),0xffffff,12,14); Snd.whoosh(); toast('SLIPPED OUT!','#7dff9a',800); }
function crackFX(at,n){ const g=new THREE.Group(), m=new THREE.MeshBasicMaterial({color:0x111111,transparent:true,opacity:.9});
 for(let i=0;i<9;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(.35,rand(4,9),.2),m); s.rotation.z=i/9*Math.PI*2+rand(-.2,.2); s.translateY(s.geometry.parameters.height/2); g.add(s); }
 g.position.copy(at).add(V(n.x*.3,0,n.z*.3)); g.lookAt(at.x+n.x*10,at.y,at.z+n.z*10); scene.add(g); ring(at.x,at.y,at.z,8,0xffffff,.25);
 setTimeout(()=>{ scene.remove(g); g.children.forEach(c=>c.geometry.dispose()); m.dispose(); },2500); }
// knocked into a building fast enough by an attack = WALL SPLAT (instead of the old small "wall slam")
{ const oB=bContact; bContact=function(f,b,dt){ if(f.splat) return false;
  const kl=f.kb.length(), recent=game.time-(f._hitT||-9)<.7;
  if(SB.walls&&game.state==='fight'&&!f.dead&&recent&&(kl>13||f.flying)&&game.time>(f.splatCd||0)&&!(f.atk&&(f.atk.id==='nitro'||f.atk.id==='ram'))){
   const n=wallNormal(f,b); if(bHit(b,16,-n.x,-n.z,f.pos.y+4,f,f.pos.x,f.pos.z)){ f.kb.multiplyScalar(.6); toast('THROUGH THE WALL!','#ffb347',900); return true; }
   startSplat(f,b); return false; }
  return oB(f,b,dt); }; }
// GRAB beats BLOCK, DASH beats GRAB
{ const oG=FP.tryGrab; FP.tryGrab=function(){ const o=this.opp;
  if(o&&o.splat&&dist2(this,o)<this.radius()+o.radius()+6){
   if(o.splat.choice==='slip'){ slipOut(o); this.stun=Math.max(this.stun,.4); toast('GRAB MISSED! DASH BEATS GRAB','#ff6b6b',900); return false; }
   const bl=o.blocking; o.blocking=false; if(this.yaw!=null) this.yaw=Math.atan2(o.pos.x-this.pos.x,o.pos.z-this.pos.z); const r=oG.call(this); o.blocking=bl;
   if(r){ const wasBlock=o.splat.choice==='block'; endSplat(o,false); banner('WALL THROW!',700); if(wasBlock) toast('GRAB BEATS BLOCK','#ffd43b',900); if(this.atk) this.atk.wallThrow=1; } return r; }
  return oG.call(this); }; }
function splatTick(dt){ for(const f of [game.p,game.e]){ const S=f&&f.splat; if(!S) continue;
  if(f.dead||game.state!=='fight'){ endSplat(f,false); continue; }
  S.t+=dt; const r=f.radius(); if(S.n.x) f.pos.x=S.b.x+S.n.x*(S.b.w/2+r); else f.pos.z=S.b.z+S.n.z*(S.b.d/2+r);
  f.kb.set(0,0,0); f.vy=Math.min(0,f.vy); if(f.pos.y>(f._floor||0)) f.pos.y=Math.max(f._floor||0,f.pos.y-dt*6); // slowly slides down the wall
  f.yaw=Math.atan2(S.n.x,S.n.z); f.stun=Math.max(f.stun,S.dur-S.t);
  // the pinned titan's choice
  const human=f.isPlayer&&!f.pilot||(game.vs2&&f===game.e), I=f.inp||{};
  if(human){ if(I.dodge>0&&S.choice!=='slip'){ I.dodge=0; S.choice='slip'; S.slipT=0; } else if(S.choice!=='slip') S.choice=I.block?'block':null; }
  else if(S.t>S.ai&&!S.picked){ S.picked=1; const d=SB.dummy; S.choice=d==='block'?'block':d==='fight'?['block','slip',null][(Math.random()*3)|0]:null; if(S.choice==='slip') S.slipT=0; }
  if(S.choice==='block'&&Math.random()<dt*20) burst(f.chest(),0x7dff9a,1,4);
  if(S.choice==='slip'){ S.slipT+=dt; if(S.slipT>=.3){ slipOut(f); continue; } }
  if(S.t>=S.dur) endSplat(f,true); } }

/* ---------------- phone layout: LIGHT in the corner, MEDIUM / HEAVY / SPECIAL around it, 1 2 3 in an outer arc ---------------- */
const CBCSS=`
#touch #tbtns{width:320px!important;height:250px!important}
#touch #tbtns .lt{right:0!important;bottom:0!important}
#touch #tbtns .md{right:111px;bottom:11px;width:66px!important;height:66px!important;background:#2a4a1caa;font-size:11px}
#touch #tbtns .hv{right:82px!important;bottom:82px!important;width:66px!important;height:66px!important}
#touch #tbtns .sp{right:11px!important;bottom:111px!important;width:66px!important;height:66px!important}
#touch #tbtns .bk{right:197px!important;bottom:3px!important}
#touch #tbtns .jp{right:267px!important;bottom:5px!important}
#touch #tbtns .rl{right:269px!important;bottom:61px!important}
#touch #tbtns .gb{right:239px!important;bottom:117px!important}
#touch #tbtns .sk{width:54px!important;height:54px!important;overflow:hidden}
#touch #tbtns .sk1{right:181px!important;bottom:77px!important}
#touch #tbtns .sk2{right:141px!important;bottom:141px!important}
#touch #tbtns .sk3{right:77px!important;bottom:181px!important}
#tbtns .sk .sw,#sbSk .sw{position:absolute;inset:0;border-radius:inherit;pointer-events:none}
#tbtns .sk .c{z-index:2;background:transparent!important;font-family:'Russo One';font-size:14px!important;color:#fff!important;text-shadow:0 1px 3px #000}
#tbtns .sk.ready,#sbSk .s.ready{animation:sbReady .45s}
@keyframes sbReady{0%{box-shadow:0 0 0 0 #7fd4ffff}100%{box-shadow:0 0 0 14px #7fd4ff00}}
#tbtns .chg{box-shadow:0 0 14px #ffd43b!important;border-color:#ffd43b!important}
#sbSk{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:20;display:flex;gap:8px;pointer-events:none}
#sbSk .s{position:relative;width:62px;height:62px;border-radius:12px;background:#0e1621dd;border:2px solid #7fd4ff99;color:#cfe3f5;font:10px/1.1 'Russo One',sans-serif;text-align:center;overflow:hidden}
#sbSk .s b{position:relative;z-index:2;display:block;font-size:18px;color:#fff;margin-top:6px}#sbSk .s i{position:relative;z-index:2;font-style:normal;font-size:8px;letter-spacing:.5px;display:block;padding:0 2px}
#sbSk .s .n{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;font-size:20px;color:#ff9f43;text-shadow:0 1px 3px #000}
#sbChg{position:fixed;left:50%;top:58%;transform:translateX(-50%);z-index:20;width:120px;height:8px;border-radius:4px;background:#0008;border:1px solid #ffffff44;pointer-events:none;display:none}
#sbChg div{height:100%;width:0;border-radius:4px;background:linear-gradient(90deg,#7fd4ff,#ffd43b)}
@media (pointer:coarse){ #sbSk{display:none} }
#sbMenu .rps{font:12px/1.5 Rajdhani,sans-serif;color:#cfe3f5}#sbMenu .rps b{color:#ffd43b}`;
{ const s=document.createElement('style'); s.textContent=CBCSS; document.head.appendChild(s); }
function cbUI(){ if(el('sbSk')) return;
 const tb=el('tbtns');
 if(tb&&!tb.querySelector('[data-k=medium]')){ const b=document.createElement('button'); b.dataset.k='medium'; b.className='b md'; b.textContent='MEDIUM'; tb.appendChild(b);
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); try{ b.setPointerCapture(e.pointerId); }catch(_){} b.classList.add('on'); inps[0].medium=.25; if(navigator.vibrate) try{ navigator.vibrate(12); }catch(_){} });
  const rel=()=>b.classList.remove('on'); b.addEventListener('pointerup',rel); b.addEventListener('pointercancel',rel); }
 if(tb){ const lt=tb.querySelector('.lt'); if(lt) lt.textContent='LIGHT'; const hv=tb.querySelector('.hv'); if(hv) hv.textContent='HEAVY'; const rl=tb.querySelector('.rl'); if(rl) rl.textContent='DASH';
  tb.querySelectorAll('.sk').forEach(b=>{ if(!b.querySelector('.sw')){ const s=document.createElement('i'); s.className='sw'; b.prepend(s); } }); }
 const k=document.createElement('div'); k.id='sbSk'; k.innerHTML=[1,2,3].map(n=>`<div class="s"><span class="sw"></span><b>${n}</b><i></i><span class="n"></span></div>`).join(''); document.body.appendChild(k);
 const c=document.createElement('div'); c.id='sbChg'; c.innerHTML='<div></div>'; document.body.appendChild(c);
 const m=el('sbMenu'); if(m&&!m.querySelector('[data-w]')){ const box=m.querySelector('.box'), secs=box.querySelectorAll('.sec'), d=document.createElement('div'); d.className='sec';
  d.innerHTML=`<div class="lbl">ARENA (restarts the fight)</div><div class="row"><button data-w="city">BUILDINGS</button><button data-w="pop">PEOPLE &amp; CARS</button><button data-w="walls">WALL SPLAT</button></div>
   <div class="rps" style="margin-top:6px">Pinned to a wall: <b>STRIKE</b> beats DASH · <b>DASH</b> beats GRAB · <b>GRAB</b> beats BLOCK · <b>BLOCK</b> beats STRIKE</div>`;
  box.insertBefore(d,secs[2]);
  d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation(); const w=b.dataset.w; SB[w]=!SB[w]; if(w==='walls'){ cbSync(); return; } sbStart(); sbMenuOpen(true); }); } }
function cbSync(){ document.querySelectorAll('#sbMenu [data-w]').forEach(b=>b.classList.toggle('on',!!SB[b.dataset.w])); }
{ const oS=sbSync; sbSync=function(){ oS(); cbSync(); }; }
{ const oS=sbStart; sbStart=function(){ SET.life=!!SB.pop; oS(); cbUI(); cbSync(); }; }
function spinBg(pct){ return pct>0?`conic-gradient(#000c ${pct*360}deg,#0000 0)`:'none'; }
function cbTick(dt){ const p=game.p; if(!p||game.mode!=='match') return; splatTick(dt);
 const L=SKILLS[p.def.id]||[];
 const upd=(box,n)=>{ const S=L[n-1], c=p.cds['sk'+n]||0, pct=S?clamp(c/S.cd,0,1):0, sw=box.querySelector('.sw'); if(sw) sw.style.background=spinBg(pct);
  const was=box._cd>0; if(was&&c<=0){ box.classList.remove('ready'); void box.offsetWidth; box.classList.add('ready'); } box._cd=c; return {S,c}; };
 document.querySelectorAll('#tbtns .sk').forEach((b,i)=>upd(b,i+1));
 document.querySelectorAll('#sbSk .s').forEach((b,i)=>{ const {S,c}=upd(b,i+1); b.querySelector('i').textContent=S?MOVES[S.id].name.toUpperCase():''; b.querySelector('.n').textContent=c>0?Math.ceil(c):''; b.style.opacity=S?1:.35; });
 // charge bar + glow on the held button
 const C=p.cg, A=p.atk, cb=el('sbChg'); const on=C&&A===C.a&&C.t>CB.tap;
 if(cb){ cb.style.display=on?'block':'none'; if(on) cb.firstChild.style.width=Math.round((A.chg||0)*100)+'%'; }
 document.querySelectorAll('#tbtns .lt,#tbtns .md,#tbtns .hv').forEach(b=>b.classList.toggle('chg',!!(on&&((C.b==='L'&&b.classList.contains('lt'))||(C.b==='M'&&b.classList.contains('md'))||(C.b==='H'&&b.classList.contains('hv')))))); }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ cbTick(dt); }catch(e){ console.error(e); } }; }
{ const oR=sbReset; sbReset=function(){ for(const f of [game.p,game.e]) if(f){ f.splat=null; f.splatCd=0; f.cg=null; f.buf=null; f.sq=null; } oR(); }; }

/* ---------------- move list in the ⚙ menu ---------------- */
sbKitRender=function(){ const p=game.p, kit=el('sbKit'); if(!p||!kit) return; const L=SKILLS[p.def.id]||[], F=p.F, nm=id=>MOVES[id]?MOVES[id].name:id, T=strTable(p)||{};
 const cdTxt=n=>{ const c=p.cds['sk'+n]||0; return c>0?`<span class="cd">${Math.ceil(c)}s</span>`:'<span class="ok">READY</span>'; };
 const btn=s=>s.split('').map(c=>c==='A'?'<span style="color:#9fb3c8">(air)</span>':`<span class="k">${c}</span>`).join('');
 const H=HEAVYSET[F.K];
 kit.innerHTML=`<h4>${p.def.name} · ${F.name} · ⚡${Math.round(p.energy)}</h4>
  <div style="color:#9fb3c8">Keys: <span class="k">${keyName('punch')}</span>Light · <span class="k">${keyName('medium')}</span>Medium · <span class="k">${keyName('heavy')}</span>Heavy · <span class="k">${keyName('special')}</span>Special. <b style="color:#ffd43b">HOLD L / M / H to charge</b> (max at 1.2s).</div>
  ${H?`<div><span class="k">H</span>alone: standing = ${nm(H[0])} · moving = ${nm(H[1])}</div>`:''}
  <div style="margin-top:4px;color:#7fd4ff">COMBO STRINGS</div>
  ${Object.keys(T).map(k=>`<div>${btn(k)} → ${nm(T[k].id)}${T[k].c!=null?' (hit '+(T[k].c+1)+')':''}${T[k].end?' <span style="color:#ff9f43">finisher</span>':''}</div>`).join('')}
  ${F.air?`<div><span class="k">H</span>in the air: ${nm(F.air)}</div>`:''}
  <div style="color:#9fb3c8">Launchers (Rising Slash, Shield Uppercut, Overhead Cleave): press <span class="k">${keyName('jump')}</span> after they hit to chase.</div>
  ${L.map((S,i)=>`<div><span class="k">${keyName('sk'+(i+1))}</span>${MOVES[S.id].name} · ${S.cd}s · ⚡${S.cost} ${cdTxt(i+1)}</div>`).join('')}
  ${p.def.stances.length>1?`<div><span class="k">${keyName('transform')}</span>Stance: ${p.def.stances[((p.stIdx||0)+1)%p.def.stances.length].name}</div>`:''}`; };
