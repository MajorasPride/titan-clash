/* =====================================================================
   SANDBOX 15: ASHVIN, THE TWINS (Nov 7, 2026). Sandbox only, not in the game.
   MajorasPride's plan (voice call, Nov 7): Game Plan > Ideas Inbox > ASHVIN rework. Our own design.
   - Two stances, one twin each. SUN (he, battle mage): fast, fiery, buffs himself, fights up close.
     MOON (she, pure mage): calm, slower but harder hits, waves and curses, fights from range.
   - One bow that is also a magic staff, held in the middle (Darth Maul) and spun (Donatello).
     Sun holds it in his right hand, Moon in her left (mirror twins).
   - Split elements: the ELEMENT pick is a pair. FIRE + ICE (default) or LIGHTNING + WATER. Same moves,
     only the element changes. Ice is new and ASHVIN-only. A soaked rival takes +25% from Sun's lightning.
   - Runes on the ground, armed after a moment: Sun's = big flame blast; Moon's curse = slow + damage over time.
   - Tag-swap strings: L L H (and M H) end with the other twin cutting in (no STANCE button). Moon cuts in
     with a staff spin + cold wave that shoves them back; Sun cuts in with a Dragon Ball style fire burst.
     The STANCE button swap is faster and cheaper for the twins.
   - SUN: L staff 3-hit · M spinning strike · H overhead flame slam · SP fire rune · 1 Blaze Up · 2 Flame Dash
     · 3 Solar Flare (blinds, knocks off lock-on) · GRAB pole-vault over them + fire blast.
   - MOON: L heavy staff swings · M frost wave · H ice spike under them · SP curse rune · 1 Hex · 2 Frost Prison
     · 3 Drain · GRAB head tap, ice birdcage, wave blast.
   - Ultimates: SOLAR MANDALA (Sun) and TOTAL ECLIPSE (Moon). Damage numbers: orange for Sun, icy blue for Moon.
   ===================================================================== */
const ASH={runes:[],patches:[],cages:[],PAIRS:{fireice:['fire','ice'],lightwater:['lightning','water']},
 COL:{fire:0xff7a2a,ice:0xbfefff,lightning:0xfff06a,water:0x3fa9ff}, SUN:0xffc44d, MOON:0x9fd8ff};
const isAsh=f=>!!(f&&f.def&&f.def.id==='ashvin'&&isCore(f));
const ashPair=f=>ASH.PAIRS[(f&&f.load&&f.load.pair)||'fireice']||ASH.PAIRS.fireice;
const ashEl=(f,tw)=>ashPair(f)[tw==null?(f.stIdx||0):tw];
const ashCol=(f,tw)=>ASH.COL[ashEl(f,tw)];
const isSun=f=>(f.stIdx||0)===0;

/* ---------- the two twins as stances ---------- */
{ const D=V8DEFS.find(d=>d.id==='ashvin'), sp=D.stances[0].speed;
  D.stances[0]=ST('SUN',{speed:sp*1.08,power:1,grab:false,jump:28,J:'asLight',M:'asSpin',K:'asSlam',L:'asRune'});
  D.stances[1]=ST('MOON',{speed:sp*.9,power:1.18,grab:false,jump:24,J:'amLight',M:'amWave',K:'amSpike',L:'amCurse'});
  D.forms=[D.stances[0],D.stances[1]]; }
STRINGS['ashvin:0']={ L:{id:'asLight',c:0}, LL:{id:'asLight',c:1}, LLL:{id:'asLight',c:2,end:1},
 LM:{id:'asSpin'}, LLM:{id:'asSpin',end:1}, M:{id:'asSpin'}, LLH:{id:'asTag',end:1}, MH:{id:'asTag',end:1} };
STRINGS['ashvin:1']={ L:{id:'amLight',c:0}, LL:{id:'amLight',c:1}, LLL:{id:'amLight',c:2,end:1},
 LM:{id:'amWave'}, LLM:{id:'amWave',end:1}, M:{id:'amWave'}, LLH:{id:'amTag',end:1}, MH:{id:'amTag',end:1} };
LIGHT.push('asLight','amLight');
Object.assign(MOVES,{
 asLight:{name:'Staff Combo',dur:.32,hitAt:.14,moveMul:.4,anim:'asLight'},
 asSpin:{name:'Spinning Staff',dur:.6,hitAt:.3,moveMul:.2,anim:'asSpin'},
 asSlam:{name:'Flame Slam',dur:.85,hitAt:.48,moveMul:0,anim:'asSlam'},
 asRune:{name:'Sun Rune',dur:.6,hitAt:.3,cost:20,cd:7,moveMul:0,anim:'asCast',noCharge:true},
 asTag:{name:'Moon Cuts In (cold wave)',dur:.55,hitAt:.2,moveMul:0,anim:'asSpin',noCharge:true},
 amLight:{name:'Heavy Staff',dur:.46,hitAt:.24,moveMul:.25,anim:'amLight'},
 amWave:{name:'Frost Wave',dur:.6,hitAt:.3,ranged:1,moveMul:0,anim:'asCast'},
 amSpike:{name:'Ice Spike',dur:.8,hitAt:.35,ranged:1,moveMul:0,anim:'asCast'},
 amCurse:{name:'Curse Rune',dur:.6,hitAt:.3,cost:20,cd:7,moveMul:0,anim:'asCast',noCharge:true},
 amTag:{name:'Sun Cuts In (fire burst)',dur:.55,hitAt:.18,moveMul:0,anim:'asBurst',noCharge:true},
 asBlaze:{name:'Blaze Up',dur:.5,moveMul:0,anim:'asBurst',noCharge:true},
 asDash:{name:'Flame Dash',dur:.5,moveMul:0,anim:'asSpin',noCharge:true},
 asFlare:{name:'Solar Flare',dur:.55,moveMul:0,anim:'asCast',noCharge:true},
 amHex:{name:'Hex',dur:.5,ranged:1,moveMul:0,anim:'asCast',noCharge:true},
 amPrison:{name:'Frost Prison',dur:.55,ranged:1,moveMul:0,anim:'asCast',noCharge:true},
 amDrain:{name:'Drain',dur:.5,ranged:1,moveMul:0,anim:'asCast',noCharge:true},
 asGrab:{name:'Pole Vault Blast',dur:.6,hitAt:.2,moveMul:0,anim:'asSpin',noCharge:true},
 amGrab:{name:'Ice Birdcage',dur:.6,hitAt:.2,moveMul:0,anim:'asCast',noCharge:true},
});
SKILLS_ST.ashvin=[[{id:'asBlaze',cd:14,cost:20,r:0},{id:'asDash',cd:7,cost:15,r:40},{id:'asFlare',cd:16,cost:30,r:60}],
 [{id:'amHex',cd:12,cost:20,r:60},{id:'amPrison',cd:14,cost:25,r:50},{id:'amDrain',cd:14,cost:15,r:60}]];

/* ---------- the bow-staff and the twin look ---------- */
function ashStaff(parent,col,flip){ const g=grp(0,-2.4,.2,parent), mat=glowM(col,2.2), dark=std(0x2a2430,.4,.6);
 const sh=mesh(Cy(.24,.24,15,8),dark,0,0,0,g,true); sh.rotation.x=Math.PI/2;
 mesh(Cy(.32,.32,1.6,8),mat,0,0,0,g,true).rotation.x=Math.PI/2;                                // grip glow
 for(const s of [-1,1]){ const arc=mesh(new THREE.TorusGeometry(1.9,.2,6,18,Math.PI),mat,0,0,s*7.2,g,true); arc.rotation.y=Math.PI/2; arc.rotation.z=s*Math.PI/2*(flip?-1:1); }   // bow tips
 g.userData.mat=mat; return g; }
{ const o=v8Dress; v8Dress=function(f){ o(f); if(f.def.id!=='ashvin'||!f.P) return; const P=f.P;
  P.ashStaffR=ashStaff(P.elR||P.armR,ASH.SUN,false); P.ashStaffL=ashStaff(P.elL||P.armL,ASH.MOON,true); ashLook(f); }; }
function ashLook(f){ const P=f.P; if(!P||!P.ashStaffR) return; const sun=isSun(f), c=sun?ASH.SUN:ASH.MOON, ec=ashCol(f);
 P.ashStaffR.visible=sun; P.ashStaffL.visible=!sun; (sun?P.ashStaffR:P.ashStaffL).userData.mat.color.setHex(ec);
 if(P.v8halo){ P.v8halo[0].material.color.setHex(sun?ASH.SUN:0x6b7a99); P.v8halo[1].material.color.setHex(sun?0x6b5a33:ASH.MOON); }
 if(P.v8orbs) P.v8orbs.forEach((m,i)=>m.material.color.setHex(i%2?ec:c)); }
{ const o=v8StanceVisual; v8StanceVisual=function(f){ o(f); if(f&&f.def&&f.def.id==='ashvin') ashLook(f); }; }
// twin swap: the STANCE button is quicker and cheaper for the twins (they already know each other)
{ const o=v8Stance; v8Stance=function(f){ if(!isAsh(f)) return o(f); const e0=f.energy; o(f); if(f.atk&&f.atk.id==='stance'){ f.atk.dur=.15; f.tfCd=.45; f.energy=Math.min(100,f.energy+4); } ashSwapFX(f); }; }
function ashSwap(f){ f.stIdx=isSun(f)?1:0; v8StanceVisual(f); ashSwapFX(f); }
function ashSwapFX(f){ const c=isSun(f)?ASH.SUN:ASH.MOON; burst(f.chest(),c,26,16); ring(f.pos.x,f.chest().y,f.pos.z,10*f.scale,c,.35);
 if(f.isPlayer||game.vs2) toast(isSun(f)?'SUN TWIN!':'MOON TWIN!',isSun(f)?'#ffc44d':'#9fd8ff',600); }

/* ---------- element pair in the loadout: FIRE + ICE or LIGHTNING + WATER ---------- */
{ const o=loResolve; loResolve=function(L,id){ const r=o(L,id); if(id!=='ashvin') return r; const e=L.el;
  r.pair=(e==='lightwater'||e==='lightning'||e==='water')?'lightwater':'fireice'; r.el=ASH.PAIRS[r.pair][0]; return r; }; }
{ const o=loRow; loRow=function(side,id,k,label,opts){ if(id==='ashvin'&&k==='el') opts=[['default','DEFAULT'],['fireice','FIRE + ICE'],['lightwater','LIGHTNING + WATER']]; return o(side,id,k,label,opts); }; }
// the generic element system follows whichever twin is fighting (Ice is handled here, not by the generic system)
function ashElTick(f){ if(!isAsh(f)||!f.load) return; const e=ashEl(f); f.load.el=e==='ice'?'none':e; }

/* ---------- little helpers ---------- */
const ashFx=(f,at,n,sp,tw)=>{ const e=ashEl(f,tw), c=ASH.COL[e]; burst(at,c,n,sp); burst(at,0xffffff,Math.ceil(n/3),sp*.7);
 if(e==='lightning'&&Math.random()<.5) zapBolt(at.clone().add(V(rand(-4,4),rand(4,9),rand(-4,4))),at); if(e==='water'||e==='ice') wfxSprite('splash',at.clone(),7+n*.15,.35,{grow:.5}); };
function ashOnHit(f,o,tw){ if(!o||o.dead) return; const e=ashEl(f,tw);
 if(e==='ice') o.ashSlowT=Math.max(o.ashSlowT||0,1.5);
 if(e==='water') o.soakT=4; }
// hit flags: ice slows, water soaks, lightning hits soaked rivals harder, Hex = +25% damage taken
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  if(isAsh(src)&&!this.dead){ if(this.hexT>0) dmg*=1.25; if(ashEl(src)==='lightning'&&this.soakT>0) dmg*=1.25; }
  const hp0=this.hp; const r=oTH.call(this,src,dmg,kb,launch,cont,dir);
  if(isAsh(src)&&this.hp<hp0&&!cont) ashOnHit(src,this); return r; }; }
{ const o=v8Spd; v8Spd=function(f){ let m=o(f); if(f.ashSlowT>0) m*=.6; if(f.rootT>0) m=0; return m; }; }
const front=(f,d,side)=>V(f.pos.x+Math.sin(f.yaw)*d+(side?Math.cos(f.yaw)*side:0),0,f.pos.z+Math.cos(f.yaw)*d-(side?Math.sin(f.yaw)*side:0));
function ashTarget(f,max){ const o=f.opp; if(canHit(o)&&dist2(f,o)<max) return V(o.pos.x,0,o.pos.z); return front(f,Math.min(max,30)); }

/* ---------- runes on the ground ---------- */
const ASHTEX={};
function runeTex(kind){ if(ASHTEX[kind]) return ASHTEX[kind]; const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d'); g.translate(128,128);
 g.strokeStyle='#fff'; g.fillStyle='#fff'; g.lineWidth=5; g.shadowColor='#fff'; g.shadowBlur=8;
 g.beginPath(); g.arc(0,0,118,0,7); g.stroke(); g.lineWidth=3; g.beginPath(); g.arc(0,0,100,0,7); g.stroke();
 for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; g.save(); g.rotate(a); g.fillRect(-2,-114,4,i%2?7:12); g.restore(); }                  // rune ticks
 if(kind==='sun'){ g.lineWidth=4; for(let i=0;i<12;i++){ g.save(); g.rotate(i/12*Math.PI*2); g.beginPath(); g.moveTo(0,-38);                // wavy sun rays
   for(let y=38;y<=92;y+=6) g.lineTo(Math.sin(y*.25)*7,-y); g.stroke(); g.restore(); }
  g.beginPath(); g.arc(0,0,34,0,7); g.fill(); g.globalCompositeOperation='destination-out'; g.beginPath(); g.arc(0,0,24,0,7); g.fill(); g.globalCompositeOperation='source-over'; g.beginPath(); g.arc(0,0,13,0,7); g.fill(); }
 else { g.lineWidth=4; g.beginPath(); for(let i=0;i<=7;i++){ const a=i*4/7*Math.PI*2-Math.PI/2; g[i?'lineTo':'moveTo'](Math.cos(a)*92,Math.sin(a)*92); } g.stroke();   // 7-point star
  g.beginPath(); g.arc(0,0,40,0,7); g.fill(); g.globalCompositeOperation='destination-out'; g.beginPath(); g.arc(14,-8,36,0,7); g.fill(); g.globalCompositeOperation='source-over';   // crescent moon
  g.lineWidth=2; g.beginPath(); g.arc(0,0,58,0,7); g.stroke(); }
 const t=new THREE.CanvasTexture(c); ASHTEX[kind]=t; return t; }
function runeMesh(kind,col,r){ const m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.MeshBasicMaterial({map:runeTex(kind),color:col,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,side:THREE.DoubleSide}));
 m.rotation.x=-Math.PI/2; return m; }
function runePlace(f,kind,at){ for(let i=ASH.runes.length-1;i>=0;i--){ const R=ASH.runes[i]; if(R.f===f&&R.kind===kind){ scene.remove(R.m); ASH.runes.splice(i,1); } }   // one rune per twin
 const col=kind==='sun'?ashCol(f,0):ashCol(f,1), m=runeMesh(kind,col,10); m.position.set(at.x,.3,at.z); scene.add(m);
 ASH.runes.push({f,kind,x:at.x,z:at.z,r:10,t:9,arm:.6,m,col}); ring(at.x,.5,at.z,12,col,.4); burst(V(at.x,2,at.z),col,16,10); Snd.tone('sine',300,900,.25,.06); }
function runeTrigger(R,o){ const f=R.f, x=R.x, z=R.z, pm=f.F?f.F.power:1;
 if(R.kind==='sun'){ const e=ashEl(f,0); aoe(f,o,x,z,14,30*pm,30,26,R.col); game.shake=Math.max(game.shake,.9); Snd.boom();
  if(e==='fire') lavaFountain(x,z,34,8); else for(let i=0;i<5;i++) later(i*.06,()=>zapBolt(V(x+rand(-5,5),60,z+rand(-5,5)),V(x+rand(-3,3),0,z+rand(-3,3))));
  pillar(x,z,6,R.col,.6,60); News.add('A SUN RUNE ERUPTS UNDER '+o.def.name+'!',false,'asrune',5); }
 else { o.curse={by:f,t:4,dps:5*pm}; o.ashSlowT=Math.max(o.ashSlowT||0,4); o.takeHit(f,6*pm,4,0,false,{x:o.pos.x-x+.01,z:o.pos.z-z});
  wfxRing(x,z,16,.6); burst(o.chest(),R.col,30,14); ring(x,1,z,16,R.col,.6); if(o.isPlayer||f.isPlayer) toast('CURSED! SLOWED','#9fd8ff',800); }
 scene.remove(R.m); }

/* ---------- moves ---------- */
const ashDir=(f,o)=>({x:o.pos.x-f.pos.x+.01,z:o.pos.z-f.pos.z});
Object.assign(V8MOVE,{
 asLight(f,a,dt,pm,o){ const c=a.chain||0; if(once(a,'w',.1*a.dur)) Snd.whoosh();
  if(a.t>=a.hitAt&&!a._bh&&coneHit(f,a,o,17,1.1,(c>=2?9:6)*pm,c>=2?16:7,0,'slash')) ashFx(f,o.chest(),c>=2?16:6,c>=2?14:8); },
 asSpin(f,a,dt,pm,o){ if(once(a,'w',.2*a.dur)){ Snd.whoosh(); ring(f.pos.x,f.chest().y,f.pos.z,13*f.scale,ashCol(f),.3); }
  if(a.t>=a.hitAt&&!a._bh&&coneHit(f,a,o,18,2.6,11*pm,24,4,'slash')) ashFx(f,o.chest(),14,12); },
 asSlam(f,a,dt,pm,o){ if(once(a,'u',.15)) Snd.tone('sawtooth',200,500,.2,.06);
  if(once(a,'s',a.hitAt)){ const p=front(f,9*f.scale); aoe(f,o,p.x,p.z,12,20*pm,22,18,ashCol(f)); ashFx(f,V(p.x,2,p.z),24,16); game.shake=Math.max(game.shake,.6); Snd.boom();
   if(ashEl(f)==='fire') lavaFountain(p.x,p.z,18,5); } },
 asRune(f,a,dt,pm,o){ if(once(a,'c',a.hitAt)) runePlace(f,'sun',ashTarget(f,55)); },
 amCurse(f,a,dt,pm,o){ if(once(a,'c',a.hitAt)) runePlace(f,'moon',ashTarget(f,55)); },
 amLight(f,a,dt,pm,o){ const c=a.chain||0; if(once(a,'w',.15*a.dur)) Snd.whoosh();
  if(a.t>=a.hitAt&&!a._bh&&coneHit(f,a,o,18,1,(c>=2?13:9)*pm,c>=2?26:12,c>=2?6:0,'slash')) ashFx(f,o.chest(),c>=2?18:8,10); },
 amWave(f,a,dt,pm,o){ if(once(a,'w',a.hitAt)){ wave(f,o,{speed:95,width:14,dmg:11*pm,kb:26,launch:3,color:ashCol(f),hh:4,life:.9}); Snd.whoosh(); wfxRing(f.pos.x,f.pos.z,10,.4); } },
 amSpike(f,a,dt,pm,o){ if(once(a,'c',.1)){ a.at=ashTarget(f,60); ring(a.at.x,.5,a.at.z,9,ashCol(f),.4); }
  if(once(a,'s',a.hitAt)&&a.at){ const x=a.at.x, z=a.at.z, col=ashCol(f); strike(x,z,9,17*pm,30,f,o,col,0,10);
   const sp=new THREE.Mesh(new THREE.ConeGeometry(4,26,6),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})); sp.position.set(x,-13,z); scene.add(sp);
   ASH.patches.push({spike:sp,t:.9}); if(ashEl(f)==='water') wfxColumn(x,z,26,6); } },
 asTag(f,a,dt,pm,o){ if(once(a,'sw',0)) ashSwap(f);                                           // Moon cuts in: staff spin + cold wave that shoves them back
  if(once(a,'h',a.hitAt)){ const col=ashCol(f); ring(f.pos.x,2,f.pos.z,20,col,.45); wfxRing(f.pos.x,f.pos.z,22,.5); Snd.whoosh();
   if(canHit(o)&&dist2(f,o)<22*f.scale+o.radius()){ o.takeHit(f,8*pm,62,4,false,ashDir(f,o)); ashOnHit(f,o); ashFx(f,o.chest(),14,12); } } },
 amTag(f,a,dt,pm,o){ if(once(a,'sw',0)) ashSwap(f);                                           // Sun cuts in: Dragon Ball style energy burst
  if(once(a,'h',a.hitAt)){ const col=ashCol(f), c=f.chest(); burst(c,col,50,30); burst(c,0xffffff,24,22); ring(f.pos.x,c.y,f.pos.z,24,col,.4); ring(f.pos.x,1,f.pos.z,26,col,.5);
   game.shake=Math.max(game.shake,.7); Snd.boom(); if(canHit(o)&&dist2(f,o)<20*f.scale+o.radius()){ o.takeHit(f,10*pm,58,10,false,ashDir(f,o)); ashFx(f,o.chest(),16,14); } } },
 asBlaze(f,a,dt,pm,o){ if(once(a,'b',.15)){ f.blazeT=6; burst(f.chest(),ashCol(f),40,20); ring(f.pos.x,1,f.pos.z,16,ashCol(f),.5); Snd.tone('sawtooth',150,900,.4,.08);
   if(f.isPlayer) toast('BLAZE UP! FASTER ATTACKS','#ffc44d',900); } },
 asDash(f,a,dt,pm,o){ if(once(a,'d',0)){ Snd.whoosh(); a.dir=f.yaw; } if(a.t<.35){ f.kb.x=Math.sin(a.dir)*110; f.kb.z=Math.cos(a.dir)*110; f.inv=Math.max(f.inv||0,.05);
   a._tr=(a._tr||0)-dt; if(a._tr<=0){ a._tr=.04; ASH.patches.push({f,x:f.pos.x,z:f.pos.z,r:5,t:2.5,dps:12*pm,col:ashCol(f),el:ashEl(f)}); } } },
 asFlare(f,a,dt,pm,o){ if(once(a,'f',.25)){ const c=f.chest(); burst(c,0xffffff,60,40); burst(c,ashCol(f),30,30); ring(f.pos.x,c.y,f.pos.z,30,0xffffff,.4); Snd.tone('sine',1200,2400,.3,.1);
   if(canHit(o)&&dist2(f,o)<70){ o.dazeT=Math.max(o.dazeT||0,2.2); if(o.isPlayer){ flashScreen('#ffffff'); toast('BLINDED! LOCK-ON LOST','#ffffff',900); } else if(f.isPlayer) toast('SOLAR FLARE! THEY CAN\'T SEE YOU','#ffc44d',900); } } },
 amHex(f,a,dt,pm,o){ if(once(a,'h',.25)&&canHit(o)&&dist2(f,o)<70){ o.hexT=5; zapBolt(f.chest(),o.chest()); burst(o.chest(),0x8a5cff,24,12); if(o.isPlayer||f.isPlayer) toast('HEXED! +25% DAMAGE TAKEN','#b48cff',900); } },
 amPrison(f,a,dt,pm,o){ if(once(a,'p',.3)&&canHit(o)&&dist2(f,o)<55){ o.rootT=1.6; o.rootAt=o.pos.clone(); cageMake(o,ashCol(f),1.6); if(o.isPlayer||f.isPlayer) toast('FROST PRISON!','#9fd8ff',800); } },
 amDrain(f,a,dt,pm,o){ if(once(a,'d',.25)&&canHit(o)&&dist2(f,o)<70){ o.drainT=5; o.drainBy=f; zapBolt(o.chest(),f.chest()); if(o.isPlayer||f.isPlayer) toast('DRAIN! ENERGY STOLEN','#7fd4ff',800); } },
 // GRABS
 asGrab(f,a,dt,pm,o){ if(!a.held&&!a.miss){ if(once(a,'g',a.hitAt)){ if(inFront(f,o,17,1)){ a.held=1; a.gT=a.t; a.dur=a.t+1.25; a.p0=f.pos.clone(); a.p1=V(2*o.pos.x-f.pos.x,0,2*o.pos.z-f.pos.z); Snd.whoosh(); }
    else whiff(f,a,.45); } return; }
  if(!a.held) return; const ht=a.t-a.gT; o.stun=Math.max(o.stun,.3); o.kb.set(0,0,0);
  if(ht<.25){ return; }                                                                                   // hooked, staff planted
  if(ht<.8){ const q=ez((ht-.25)/.55); f.pos.x=lerp(a.p0.x,a.p1.x,q); f.pos.z=lerp(a.p0.z,a.p1.z,q); f.pos.y=Math.sin(q*Math.PI)*18; f.vy=0; f.onGround=false; f.kb.set(0,0,0);
   f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z)+(q<.5?0:Math.PI)*0; if(Math.random()<dt*20) burst(f.chest(),ashCol(f),2,6); return; }   // pole-vault over their head
  if(once(a,'l',a.gT+.8)){ f.pos.y=0; f.onGround=true; f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); dust(f.pos.x,f.pos.z,6,6); }
  if(once(a,'b',a.gT+.95)){ grabHit(f,o,18*pm,72,14,ashDir(f,o)); const c=o.chest(); ashFx(f,c,40,24); ring(c.x,c.y,c.z,14,ashCol(f),.4); game.shake=Math.max(game.shake,.8); Snd.boom();
   News.add('ASHVIN VAULTS OVER '+o.def.name+' AND BLASTS IT AWAY!',false,'asgrab',5); } },
 amGrab(f,a,dt,pm,o){ if(!a.held&&!a.miss){ if(once(a,'g',a.hitAt)){ if(inFront(f,o,17,1)){ a.held=1; a.gT=a.t; a.dur=a.t+1.2; Snd.tone('triangle',800,1600,.15,.06); cageMake(o,ashCol(f),.8); }
    else whiff(f,a,.45); } return; }
  if(!a.held) return; const ht=a.t-a.gT; if(ht<.8){ o.stun=Math.max(o.stun,.3); o.kb.set(0,0,0); return; }                // head tap: the birdcage snaps shut
  if(once(a,'b',a.gT+.8)){ grabHit(f,o,16*pm,82,6,ashDir(f,o)); wfxRing(o.pos.x,o.pos.z,18,.5); ashFx(f,o.chest(),30,20); Snd.boom();
   News.add('ASHVIN LOCKS '+o.def.name+' IN AN ICE CAGE AND BLASTS IT AWAY!',false,'amgrab',5); } },
});
// the birdcage / frost prison
function cageMake(o,col,life){ const g=new THREE.Group(), mat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false});
 const R=o.radius()+3, H=o.chest().y-o.pos.y+10; for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, b=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,H,5),mat); b.position.set(Math.cos(a)*R,H/2,Math.sin(a)*R); g.add(b); }
 const top=new THREE.Mesh(new THREE.SphereGeometry(R,12,6,0,Math.PI*2,0,Math.PI/2),mat); top.position.y=H; g.add(top);
 g.position.set(o.pos.x,o.pos.y,o.pos.z); g.scale.y=.01; scene.add(g); ASH.cages.push({g,mat,o,t:life,life}); burst(o.chest(),col,20,10); }
// Blaze Up = faster attacks (Sun)
{ const oSA=FP.startAtk; FP.startAtk=function(id){ oSA.call(this,id); const a=this.atk; if(a&&isAsh(this)&&this.blazeT>0&&a.id!=='ultimate'&&a.id!=='stance'){ a.dur/=1.35; if(a.hitAt) a.hitAt/=1.35; } }; }
// GRAB button: both twins
{ const o=v8Input; v8Input=function(f,inp,dt){ if(isAsh(f)&&inp.grab>0){ const canAct=!f.dead&&f.stun<=0&&game.state==='fight'&&f.rollT<=0&&!f.grabbedBy;
   inp.grab=0; if(canAct&&!f.atk) f.startAtk(isSun(f)?'asGrab':'amGrab'); } return o(f,inp,dt); }; }

/* ---------- poses ---------- */
POSES.asLight=(k,p,e,f,a)=>{ const c=(a&&a.chain)||0, s=Math.sin(Math.min(1,p)*Math.PI), side=c%2?-1:1; k.armR=-1.2-.6*s; k.elR=-1.2; k.armL=-1.2+.5*s; k.elL=-1.3; k.twist=side*(.9*s-.3); k.lean=.25*s; if(c>=2){ k.armR=-2.4*s; k.lean=.4*s; } };
POSES.amLight=(k,p,e,f,a)=>{ const c=(a&&a.chain)||0, w=ez(ph(p,0,.45)), s=ez(ph(p,.45,.7)), side=c%2?1:-1; k.armL=lerp(lerp(-1,-2.2,w),-.8,s); k.elL=-1; k.armR=-1; k.elR=-1.4; k.twist=side*lerp(lerp(0,.8,w),-.7,s); k.lean=.3*s; k.knL=k.knR=.3*s; };
POSES.asSpin=(k,p)=>{ k.armR=k.armL=-1.5; k.elR=k.elL=-.6; k.azR=.4; k.azL=-.4; k.twist=p*Math.PI*2*1.2; k.knL=k.knR=.4; };
POSES.asSlam=(k,p)=>{ const w=ez(ph(p,0,.5)), s=ez(ph(p,.5,.62)); k.armR=k.armL=lerp(lerp(-.6,-3,w),-1.1,s); k.elR=k.elL=-.3; k.lean=lerp(lerp(0,-.3,w),.6,s); k.knL=k.knR=.6*s; k.legL=-.5*s; };
POSES.asCast=(k,p,e,f)=>{ const s=Math.sin(Math.min(1,p)*Math.PI), sun=!f||isSun(f); if(sun){ k.armL=-1.6*s-.2; k.elL=-.2; k.armR=-1; k.elR=-1.4; } else { k.armR=-1.6*s-.2; k.elR=-.2; k.armL=-1; k.elL=-1.4; } k.lean=.15*s; k.headX=.1; };
POSES.asBurst=(k,p)=>{ const s=Math.sin(Math.min(1,p)*Math.PI); k.armL=k.armR=-2.2*s; k.azL=-1*s; k.azR=1*s; k.elL=k.elR=-.3; k.lean=-.2*s; k.headX=-.3*s; k.knL=k.knR=.5*s; };

/* ---------- every frame: runes, curses, fire trail, cages, slow / root / drain / hex ---------- */
function ashTick(dt){ if(game.mode!=='match') return; const fight=game.state==='fight';
 for(const f of [game.p,game.e]){ if(!f) continue; ashElTick(f);
  for(const k of ['blazeT','hexT','rootT','drainT','ashSlowT','soakT']) if(f[k]>0) f[k]=Math.max(0,f[k]-dt);
  if(f.blazeT>0&&Math.random()<dt*14) burst(f.chest().add(V(rand(-3,3),rand(-4,4),rand(-3,3))),ashCol(f),1,6);
  if(f.hexT>0&&Math.random()<dt*8) burst(f.chest().add(V(0,6,0)),0x8a5cff,1,4);
  if(f.rootT>0&&f.rootAt){ f.pos.x=f.rootAt.x; f.pos.z=f.rootAt.z; f.kb.set(0,0,0); }
  if(f.drainT>0&&f.drainBy){ const n=Math.min(f.energy,9*dt); f.energy-=n; f.drainBy.energy=Math.min(100,f.drainBy.energy+n); if(Math.random()<dt*10) zapBolt(f.chest(),f.drainBy.chest()); }
  if(f.curse&&fight){ const C=f.curse; C.t-=dt; if(canHit(f)){ const s0=f.stun; f.takeHit(C.by,C.dps*dt,0,0,true,{x:0,z:1}); f.stun=s0; } if(Math.random()<dt*10) burst(f.chest(),0x8a5cff,1,5); if(C.t<=0) f.curse=null; } }
 for(let i=ASH.runes.length-1;i>=0;i--){ const R=ASH.runes[i], o=R.f.opp; R.t-=dt; R.arm-=dt; R.m.rotation.z+=dt*(R.kind==='sun'?.8:-.5); R.m.material.opacity=R.arm>0?.4:.75+Math.sin(game.time*6)*.2;
  if(fight&&R.arm<=0&&o&&canHit(o)&&o.pos.y<6&&Math.hypot(o.pos.x-R.x,o.pos.z-R.z)<R.r+o.radius()*.5){ runeTrigger(R,o); ASH.runes.splice(i,1); continue; }
  if(R.t<=0){ scene.remove(R.m); ASH.runes.splice(i,1); } }
 for(let i=ASH.patches.length-1;i>=0;i--){ const P=ASH.patches[i]; P.t-=dt;
  if(P.spike){ P.spike.position.y=Math.min(13,P.spike.position.y+dt*160); P.spike.material.opacity=Math.min(.85,P.t); if(P.t<=0){ scene.remove(P.spike); ASH.patches.splice(i,1); } continue; }
  if(Math.random()<dt*10){ const at=V(P.x+rand(-2,2),rand(.5,4),P.z+rand(-2,2)); burst(at,P.col,1,6); if(P.el==='lightning'&&Math.random()<.3) zapBolt(at.clone().add(V(0,6,0)),at); }
  const o=P.f.opp; if(fight&&o&&canHit(o)&&o.pos.y<5&&Math.hypot(o.pos.x-P.x,o.pos.z-P.z)<P.r+o.radius()*.5){ const s0=o.stun; o.takeHit(P.f,P.dps*dt,0,0,true,{x:0,z:1}); o.stun=s0; }
  if(P.t<=0) ASH.patches.splice(i,1); }
 for(let i=ASH.cages.length-1;i>=0;i--){ const C=ASH.cages[i]; C.t-=dt; C.g.position.set(C.o.pos.x,C.o.pos.y,C.o.pos.z); C.g.scale.y=Math.min(1,C.g.scale.y+dt*8); C.g.rotation.y+=dt*.6;
  if(C.t<=0){ burst(C.o.chest(),0xffffff,24,18); burst(C.o.chest(),C.mat.color.getHex(),24,16); scene.remove(C.g); C.mat.dispose(); ASH.cages.splice(i,1); } } }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ ashTick(dt); }catch(e){ console.error(e); } }; }
function ashClear(){ for(const R of ASH.runes) scene.remove(R.m); ASH.runes.length=0; for(const P of ASH.patches) if(P.spike) scene.remove(P.spike); ASH.patches.length=0;
 for(const C of ASH.cages){ scene.remove(C.g); } ASH.cages.length=0; for(const f of [game.p,game.e]) if(f){ f.curse=null; f.blazeT=f.hexT=f.rootT=f.drainT=f.ashSlowT=f.soakT=0; } }
{ const oR=sbReset; sbReset=function(){ ashClear(); oR(); }; }
{ const o=startRound; startRound=function(...a){ ashClear(); return o.apply(this,a); }; }

/* ---------- damage numbers by twin (orange = Sun, icy blue = Moon) ---------- */
if(typeof dmgNum==='function'){ const o=dmgNum; dmgNum=function(f,n,cont){ o(f,n,cont); const p=game.p, d=document.body.lastElementChild;
  if(d&&d.classList&&d.classList.contains('sbnum')&&isAsh(p)) d.style.color=isSun(p)?'#ffb347':'#9fd8ff'; }; }

/* ---------- ULTIMATES: SOLAR MANDALA (Sun) and TOTAL ECLIPSE (Moon) ---------- */
const AULT={ mandala:{name:'SOLAR MANDALA',intro:'THE SUN NEVER SETS ON US!',quote:'TWO HALVES, ONE SKY!'},
 eclipse:{name:'TOTAL ECLIPSE',intro:'NIGHT FALLS... FOR YOU.',quote:'SLEEP UNDER OUR ECLIPSE.'} };
const ASLOW=.5;
{ const oS=v8UltStart; v8UltStart=function(f){ if(!isAsh(f)) return oS(f); const k=isSun(f)?'mandala':'eclipse', U=AULT[k]; f._ult=k; f.def.ultName=U.name; V8SAY.ashvin=[U.intro];
  oS(f); if(f.isPlayer||game.vs2) toast(k==='mandala'?'RUSH IN TO LAND IT!':'AIM IT AT THEM!',k==='mandala'?'#ffc44d':'#9fd8ff',900); }; }
{ const oU=v8UltUpdate; v8UltUpdate=function(f,a,dt,pm,o){ if(!isAsh(f)) return oU(f,a,dt,pm,o); if(!a._init){ a._init=1; a.dur=6.5; a.kind=f._ult||'mandala'; }
  return a.kind==='mandala'?ultMandala(f,a,dt,pm,o):ultEclipse(f,a,dt,pm,o); }; }
function aCineStart(f,a,kind){ if(a._cut) return; a._cut=1; a.contact=a.t;
 CINE.on=true; CINE.side=false; CINE.f=f; CINE.o=f.opp; CINE.a=a; CINE.inf=null; CINE.ash=kind; CINE.t0=a.t; CINE.shot=-1; CINE.brawl=false;
 cineEl.classList.add('on'); cineEl.classList.remove('comic'); document.body.classList.add('vcine'); cinePop(cq,AULT[kind].quote); cineFreeze(1000,ASLOW); Snd.tone('triangle',300,900,.4,.08); }
// a giant rune drawn stroke by stroke (each strike of the Mandala adds one stroke)
function bigRune(kind,col,R){ const g=new THREE.Group(), mat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}), parts=[];
 const tube=(pts,r)=>{ const c=new THREE.CatmullRomCurve3(pts); const m=new THREE.Mesh(new THREE.TubeGeometry(c,Math.max(8,pts.length*4),r,5,false),mat); g.add(m); parts.push(m); m.visible=false; return m; };
 const circ=(rad,n)=>{ const p=[]; for(let i=0;i<=n;i++){ const a=i/n*Math.PI*2; p.push(V(Math.cos(a)*rad,Math.sin(a)*rad,0)); } return p; };
 tube(circ(R,48),.7); tube(circ(R*.82,48),.45);
 if(kind==='sun'){ for(let i=0;i<12;i+=2){ for(const j of [i,i+1]){ const a=j/12*Math.PI*2, p=[]; for(let s=0;s<=12;s++){ const r=R*.28+s/12*R*.5, w=Math.sin(s*1.3)*R*.05; p.push(V(Math.cos(a)*r-Math.sin(a)*w,Math.sin(a)*r+Math.cos(a)*w,0)); } tube(p,.4); } }
  tube(circ(R*.22,32),.8); }
 else { const p=[]; for(let i=0;i<=7;i++){ const a=i*4/7*Math.PI*2+Math.PI/2; p.push(V(Math.cos(a)*R*.78,Math.sin(a)*R*.78,0)); } tube(p,.45); tube(circ(R*.3,32),.8); }
 g.userData={parts,mat}; return g; }
function runeShow(g,n){ g.userData.parts.forEach((m,i)=>m.visible=i<n); }
function runeKill(a,key){ const g=a[key]; if(!g) return; scene.remove(g); g.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); g.userData.mat.dispose(); a[key]=null; }
function aBeam(a,key,from,to,w,col){ let m=a[key]; if(!m){ m=a[key]=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,10,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})); scene.add(m); }
 const len=from.distanceTo(to); m.scale.set(w,len,w); m.position.copy(from).lerp(to,.5); m.lookAt(to); m.rotateX(Math.PI/2); }
function aBeamOff(a,key){ const m=a[key]; if(m){ scene.remove(m); m.geometry.dispose(); m.material.dispose(); a[key]=null; } }
function aTwin(a,f,col){ if(a.tw) return a.tw; const g=f.root.clone(true), mat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,fog:false});
 g.traverse(o=>{ if(o.isMesh) o.material=mat; else if(o.isSprite||o.isPoints||o.isLine) o.visible=false; }); const src=[], dst=[]; f.root.traverse(o=>src.push(o)); g.traverse(o=>dst.push(o)); scene.add(g); a.tw={g,mat,src,dst}; return a.tw; }
function aTwinSync(a,f,pos,yaw){ const T=a.tw; if(!T) return; T.g.position.copy(pos); T.g.rotation.set(0,yaw,0); for(let i=1;i<T.src.length&&i<T.dst.length;i++){ T.dst[i].position.copy(T.src[i].position); T.dst[i].rotation.copy(T.src[i].rotation); T.dst[i].scale.copy(T.src[i].scale); } }
function aTwinKill(a){ const T=a.tw; if(!T) return; scene.remove(T.g); T.mat.dispose(); a.tw=null; }
function aGhost(a,f,col){ const g=f.root.clone(true), mat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.5,depthWrite:false,fog:false});
 g.traverse(o=>{ if(o.isMesh) o.material=mat; else if(o.isSprite||o.isPoints||o.isLine) o.visible=false; }); scene.add(g); (a.gh||(a.gh=[])).push({g,mat,t:0}); }
function aGhostTick(a,dt){ if(!a.gh) return; for(const G of a.gh){ G.t+=dt; G.mat.opacity=Math.max(0,.5*(1-G.t/.6)); } a.gh=a.gh.filter(G=>{ if(G.t<.6) return true; scene.remove(G.g); G.mat.dispose(); return false; }); }

/* SOLAR MANDALA: rush in, knock them sky-high (Nezha style), strike them in the air 8 times as each strike draws a
   stroke of a giant sun rune behind them, slam them down, then both twins fire one combined beam across the city. */
function ultMandala(f,a,dt,pm,o){ const t=a.t; aGhostTick(a,dt);
 if(!a._cut){ if(t<.3){ f.setGlow&&f.setGlow(2+t*6); return; } if(a.miss) return;
  f.kb.x=Math.sin(f.yaw)*85; f.kb.z=Math.cos(f.yaw)*85; if(Math.random()<dt*30) burst(f.chest(),ashCol(f,0),2,6);
  if(canHit(o)&&inFront(f,o,15,1)){ f.kb.set(0,0,0); a.dv=V(o.pos.x-f.pos.x,0,o.pos.z-f.pos.z).normalize(); a.ds=V(a.dv.z,0,-a.dv.x); a.o0=o.pos.clone(); aCineStart(f,a,'mandala'); }
  else if(t>1.35) ultMiss(f,a,t); return; }
 const k=t-a.contact, dv=a.dv, ds=a.ds, H=46, C0=V(a.o0.x,H,a.o0.z), col=ashCol(f,0); f.kb.set(0,0,0); o.kb.set(0,0,0); o.vy=0; o.stun=Math.max(o.stun,.6); o.onGround=false; f.setGlow&&f.setGlow(3);
 if(k<.45){ const q=ez(k/.45); o.pos.set(a.o0.x,H*q,a.o0.z); f.pos.set(a.o0.x-dv.x*10,H*q*.75,a.o0.z-dv.z*10); f.vy=0; f.onGround=false; f.yaw=Math.atan2(dv.x,dv.z);   // the launch
  if(once(a,'up',a.contact)){ ultHit(f,o,8*pm,0,0); ashFx(f,o.chest(),30,20,0); Snd.boom(); } return; }
 if(!a.rune){ a.rune=bigRune('sun',col,30); a.rune.position.copy(C0).addScaledVector(dv,14).add(V(0,o.chest().y-o.pos.y,0)); a.rune.lookAt(a.rune.position.clone().sub(dv)); scene.add(a.rune); runeShow(a.rune,0); }
 const N=8, SEG=.24, k1=k-.45;
 if(k1<N*SEG){ const i=Math.floor(k1/SEG); o.pos.copy(C0);
  if(once(a,'s'+i,a.contact+.45+i*SEG)){ const an=i/N*Math.PI*2+.4, p=C0.clone().addScaledVector(ds,Math.cos(an)*11).add(V(0,Math.sin(an)*9,0)).addScaledVector(dv,-Math.abs(Math.sin(an*1.7))*3);
   aGhost(a,f,col); f.pos.copy(p); f.vy=0; f.onGround=false; f.yaw=Math.atan2(o.pos.x-p.x,o.pos.z-p.z); ultHit(f,o,4*pm,0,0); ashFx(f,o.chest(),14,14,0);
   runeShow(a.rune,Math.min(a.rune.userData.parts.length,Math.ceil((i+1)/N*a.rune.userData.parts.length))); toast(POW[i%POW.length],'#ffc44d'); game.shake=Math.max(game.shake,.4); Snd.tone('square',300+i*60,900+i*80,.06,.05); }
  return; }
 if(once(a,'full',a.contact+.45+N*SEG)){ runeShow(a.rune,99); cineFlash(); cineFreeze(380,ASLOW); }
 const kS=k-(.45+N*SEG);
 if(kS<.4){ const q=ez(Math.min(1,kS/.35)); o.pos.set(C0.x,H*(1-q),C0.z); f.pos.set(C0.x-dv.x*4,H*(1-q)+10,C0.z-dv.z*4); return; }                  // the slam down
 if(once(a,'slam',a.contact+.45+N*SEG+.4)){ o.pos.set(C0.x,0,C0.z); f.pos.set(C0.x-dv.x*26,0,C0.z-dv.z*26); f.onGround=true; o.onGround=true; f.yaw=Math.atan2(dv.x,dv.z);
  ultHit(f,o,14*pm,0,0); dust(C0.x,C0.z,18,18); ring(C0.x,1,C0.z,26,col,.6); game.shake=Math.max(game.shake,1.4); Snd.boom(); cineFlash();
  for(const B of city) if(B.alive&&Math.hypot(B.x-C0.x,B.z-C0.z)<26) bHit(B,60,B.x-C0.x,B.z-C0.z,B.h*.4,f); }
 const kB=kS-.4, BEAM=1.5;
 if(kB<BEAM){ const tw=aTwin(a,f,ashCol(f,1)), tp=f.pos.clone().addScaledVector(ds,11); aTwinSync(a,f,tp,f.yaw+.15);                // both twins fire one beam
  const fc=f.chest().addScaledVector(dv,4), tc=tp.clone().add(V(0,fc.y-f.pos.y,0)).addScaledVector(dv,4), oc=o.chest(), mid=fc.clone().lerp(tc,.5);
  aBeam(a,'b1',fc,oc,1.6+Math.sin(game.time*40)*.2,col); aBeam(a,'b2',tc,oc,1.6+Math.cos(game.time*40)*.2,ashCol(f,1)); aBeam(a,'b3',mid,oc,2.6,0xffffff);
  o.pos.set(C0.x+dv.x*Math.min(kB,1)*14,0,C0.z+dv.z*Math.min(kB,1)*14); if(Math.random()<dt*20){ const s0=o.stun; o.takeHit(f,(18*pm)*.07,0,0,true,{x:dv.x,z:dv.z}); o.stun=s0; }
  if(Math.random()<dt*30) burst(oc,Math.random()<.5?col:ashCol(f,1),3,14); if(a.rune&&kB>.3) a.rune.userData.mat.opacity=Math.max(0,.95-(kB-.3)); return; }
 if(once(a,'fly',a.contact+.45+N*SEG+.4+BEAM)){ aBeamOff(a,'b1'); aBeamOff(a,'b2'); aBeamOff(a,'b3'); aTwinKill(a); runeKill(a,'rune'); const s0=o.launchImm; o.launchImm=0; ultHit(f,o,12*pm,0,0); o.launchImm=s0;
  a.fly={x:o.pos.x,z:o.pos.z}; cinePop(cw,'BLAST!'); cw.style.color='#ffc44d'; Snd.boom(); News.add('ASHVIN\'S TWIN BEAM BLASTS '+o.def.name+' ACROSS THE CITY!',true,'amand',8); }
 if(a.fly&&!a.flyDone){ const kF=kB-BEAM, F=a.fly; F.x+=dv.x*160*dt; F.z+=dv.z*160*dt; o.pos.set(F.x,6+Math.sin(Math.min(1,kF/.9)*Math.PI)*16,F.z); if(o.root) o.root.rotation.x+=dt*18;
  if(kF>.9||Math.hypot(F.x,F.z)>ARENA-10){ a.flyDone=true; if(o.root) o.root.rotation.x=0; o.pos.y=0; o.onGround=true; o.kb.x=dv.x*30; o.kb.z=dv.z*30; dust(F.x,F.z,14,18); game.shake=Math.max(game.shake,1); Snd.boom(); a.dur=a.t+.6; } } }

/* TOTAL ECLIPSE: aimed. The world goes pitch black, only Moon's cool-blue rune glows under them. An ice pillar
   launches them up, Sun leaps up glowing like the sun and spikes them back down. */
function envHide(a){ if(a.env) return; a.env=[]; const keep=new Set([game.p&&game.p.root,game.e&&game.e.root,a.rune2,a.pil,a.aura].filter(Boolean));
 for(const ch of scene.children){ if(keep.has(ch)||ch.isLight||ch.isCamera||!ch.visible) continue; ch.visible=false; a.env.push(ch); }
 a.bg0=scene.background&&scene.background.isColor?scene.background.clone():scene.background; a.fog0=scene.fog?scene.fog.color.clone():null; a.fogD=scene.fog&&scene.fog.density;
 scene.background=new THREE.Color(0x000000); if(scene.fog){ scene.fog.color.setHex(0x000000); if(scene.fog.density!=null) scene.fog.density=Math.max(scene.fog.density,.004); } }
function envShow(a){ if(!a.env) return; for(const ch of a.env) ch.visible=true; a.env=null;
 for(const b of city){ if(!b.alive&&b.mesh) b.mesh.visible=false; }                                   // smashed buildings stay gone
 if(a.bg0&&a.bg0.isColor&&scene.background&&scene.background.isColor) scene.background.copy(a.bg0); else scene.background=a.bg0;
 if(scene.fog&&a.fog0){ scene.fog.color.copy(a.fog0); if(a.fogD!=null) scene.fog.density=a.fogD; } }
function ultEclipse(f,a,dt,pm,o){ const t=a.t, col=ashCol(f,1), scol=ashCol(f,0);
 if(!a._cut){ f.kb.set(0,0,0); if(t<.6){ f.setGlow&&f.setGlow(1+t*5); if(Math.random()<dt*30) burst(f.chest(),col,2,6); return; } if(a.miss) return;
  if(once(a,'cast',.6)){ ring(f.pos.x,1,f.pos.z,14,col,.5); wfxRing(f.pos.x,f.pos.z,18,.5); Snd.whoosh();
   if(canHit(o)){ const dx=o.pos.x-f.pos.x, dz=o.pos.z-f.pos.z, d=Math.hypot(dx,dz); if(d<95&&Math.abs(angDiff(f.yaw,Math.atan2(dx,dz)))<Math.atan2(8+o.radius(),d)+.12){ a.o0=o.pos.clone(); a.dv=V(dx,0,dz).normalize(); a.ds=V(a.dv.z,0,-a.dv.x); aCineStart(f,a,'eclipse'); return; } }
   wave(f,o,{speed:110,width:12,dmg:0,kb:0,launch:0,color:col,hh:3,life:.8}); }
  if(t>1.1) ultMiss(f,a,t); return; }
 const k=t-a.contact, O=a.o0; f.kb.set(0,0,0); o.kb.set(0,0,0);
 if(!a.rune2){ a.rune2=runeMesh('moon',col,24); a.rune2.position.set(O.x,.4,O.z); scene.add(a.rune2); envHide(a); }
 a.rune2.rotation.z-=dt*.4; a.rune2.material.opacity=.7+Math.sin(game.time*5)*.25;
 if(k<.9){ o.pos.set(O.x,0,O.z); o.stun=Math.max(o.stun,.6); f.pos.y=0; return; }                                          // the eclipse: only the rune glows
 const PH=78;
 if(k<1.5){ const q=ez((k-.9)/.5); if(!a.pil){ a.pil=new THREE.Mesh(new THREE.CylinderGeometry(6,9,1,8),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); a.pil.position.set(O.x,0,O.z); scene.add(a.pil);
   ultHit(f,o,20*pm,0,0); Snd.boom(); cineFlash(); if(ashEl(f,1)==='water') wfxColumn(O.x,O.z,40,8); }
  a.pil.scale.y=PH*q; a.pil.position.y=PH*q/2; o.pos.set(O.x,PH*q,O.z); o.vy=0; o.onGround=false; o.stun=Math.max(o.stun,.6); if(Math.random()<dt*30) burst(o.chest(),Math.random()<.5?col:0xffffff,3,12); return; }
 o.pos.set(O.x,PH+4,O.z); o.vy=0; o.onGround=false; o.stun=Math.max(o.stun,.6);
 if(k<2.3){ const q=ez((k-1.5)/.8); if(once(a,'leap',a.contact+1.5)){ ashSwap(f); a.f0=f.pos.clone(); a.aura=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),new THREE.MeshBasicMaterial({color:scol,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); scene.add(a.aura); Snd.whoosh(); }  // Sun leaps up glowing like the sun
  f.pos.set(lerp(a.f0.x,O.x-a.dv.x*6,q),lerp(0,PH+22,q),lerp(a.f0.z,O.z-a.dv.z*6,q)); f.vy=0; f.onGround=false; f.yaw=Math.atan2(O.x-f.pos.x,O.z-f.pos.z);
  a.aura.position.copy(f.chest()); a.aura.scale.setScalar(10+q*6+Math.sin(game.time*20)); return; }
 if(k<2.65){ const q=ez((k-2.3)/.35); if(once(a,'spike',a.contact+2.3)){ cinePop(cw,'SPIKE!'); cw.style.color='#ffc44d'; cineFreeze(300,ASLOW); }
  o.pos.set(O.x,(PH+4)*(1-q),O.z); f.pos.set(O.x-a.dv.x*5,(PH+14)*(1-q)+8*(1-q),O.z-a.dv.z*5); if(a.aura){ a.aura.position.copy(f.chest()); } if(a.pil) a.pil.material.opacity=.75*(1-q); return; }
 if(once(a,'crash',a.contact+2.65)){ o.pos.set(O.x,0,O.z); o.onGround=true; f.pos.y=0; f.onGround=true; ultHit(f,o,52*pm,0,0); o.curse={by:f,t:4,dps:5*pm}; o.ashSlowT=3;
  if(a.pil){ for(let i=0;i<10;i++) burst(V(O.x+rand(-6,6),rand(4,60),O.z+rand(-6,6)),col,6,20); scene.remove(a.pil); a.pil.geometry.dispose(); a.pil.material.dispose(); a.pil=null; }
  if(a.aura){ scene.remove(a.aura); a.aura.geometry.dispose(); a.aura.material.dispose(); a.aura=null; }
  dust(O.x,O.z,20,20); ring(O.x,1,O.z,30,scol,.6); ring(O.x,1,O.z,20,col,.6); game.shake=Math.max(game.shake,1.6); Snd.boom(); cineFlash();
  News.add('TOTAL ECLIPSE! ASHVIN SPIKES '+o.def.name+' INTO THE GROUND!',true,'aecl',8); a.dur=a.t+1.1; }
 if(k>3.15&&a.env){ envShow(a); if(a.rune2){ scene.remove(a.rune2); a.rune2.geometry.dispose(); a.rune2.material.dispose(); a.rune2=null; } } }
function ashUltCleanup(a){ if(!a) return; aBeamOff(a,'b1'); aBeamOff(a,'b2'); aBeamOff(a,'b3'); aTwinKill(a); runeKill(a,'rune'); envShow(a);
 for(const k of ['rune2','pil','aura']) if(a[k]){ scene.remove(a[k]); a[k]=null; } if(a.gh){ for(const G of a.gh) scene.remove(G.g); a.gh=[]; } }

// the twins' cutscene camera
{ const oC=cineCam; cineCam=function(){ if(!CINE.ash) return oC(); const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o) return;
  const k=a.t-(a.contact||a.t), dv=a.dv||V(Math.sin(f.yaw),0,Math.cos(f.yaw)), ds=a.ds||V(dv.z,0,-dv.x), fc=f.chest(), oc=o.chest(), s=f.scale||1;
  if(CINE.ash==='mandala'){
   if(k<.45){ camAt(fc.clone().addScaledVector(dv,20*s).addScaledVector(ds,8).add(V(0,-3,0)),fc.clone().add(V(0,4,0))); return; }               // quote close-up as he launches them
   if(k<.45+8*.24){ if(cineShot(1)) cq.classList.remove('show'); const C=a.rune?a.rune.position:oc; camAt(C.clone().addScaledVector(dv,-78).add(V(0,6,0)).addScaledVector(ds,10),oc.clone().lerp(C,.25)); return; }  // the rune draws itself behind them
   if(k<.45+8*.24+.4){ cineShot(2); camAt(V(o.pos.x+ds.x*46,6,o.pos.z+ds.z*46),oc); return; }                                                        // the slam
   const kb=k-(.45+8*.24+.4);
   if(kb<1.5){ cineShot(3); camAt(f.pos.clone().addScaledVector(dv,-26).addScaledVector(ds,-10).add(V(0,fc.y-f.pos.y+6,0)),oc); return; }            // over the twins' shoulders: the combined beam
   cineShot(4); camAt(V(o.pos.x-dv.x*50+ds.x*24,18,o.pos.z-dv.z*50+ds.z*24),oc); if(a.flyDone&&kb>1.9||!f.atk||f.atk.id!=='ultimate') cineEnd(); return; }
  // TOTAL ECLIPSE
  const O=a.o0||o.pos;
  if(k<.9){ camAt(V(O.x+ds.x*30-dv.x*20,5,O.z+ds.z*30-dv.z*20),V(O.x,4,O.z)); return; }                                                                    // low: only the glowing rune and them
  if(k<1.5){ if(cineShot(1)) cq.classList.remove('show'); camAt(V(O.x+ds.x*26,2,O.z+ds.z*26),V(O.x,o.pos.y+8,O.z)); return; }                       // looking up the ice pillar
  if(k<2.3){ cineShot(2); camAt(V(O.x+ds.x*95,50,O.z+ds.z*95),V(O.x,(f.pos.y+o.pos.y)/2+6,O.z)); return; }                                              // wide: Sun leaps up like the sun
  if(k<2.65){ cineShot(3); camAt(V(O.x+ds.x*40+dv.x*10,o.pos.y+30,O.z+ds.z*40+dv.z*10),oc); return; }                                                     // the spike
  cineShot(4); camAt(V(O.x+ds.x*44-dv.x*16,6,O.z+ds.z*44-dv.z*16),V(O.x,4,O.z)); if(k>3.6||!f.atk||f.atk.id!=='ultimate') cineEnd(); }; }
{ const o=cineEnd; cineEnd=function(){ const a=CINE.a; if(CINE.ash){ CINE.ash=null; if(CINE.f&&isAsh(CINE.f)) ashUltCleanup(a); } for(const f of [game.p,game.e]) if(f&&f.root) f.root.rotation.x=0; return o(); }; }
// the ultimate also cleans up if it ends without a cutscene (a miss) or the round resets
{ const oR=sbReset; sbReset=function(){ for(const f of [game.p,game.e]) if(f&&f.atk&&f.atk.id==='ultimate'&&isAsh(f)) ashUltCleanup(f.atk); oR(); }; }

/* ---------- ultimate poses ---------- */
{ const oP=POSES.vult; POSES.vult=(k,p,e,f,a)=>{ if(!f||!isAsh(f)||!a) return oP(k,p,e,f,a); const sun=isSun(f), T=game.time, kk=a._cut&&a.contact!=null?a.t-a.contact:-1;
  if(kk<0){ if(sun){ k.lean=.55; k.armR=-1.4; k.elR=-1; k.armL=-.6; k.elL=-1.2; const s=Math.sin(T*13); k.legL=s*.8; k.legR=-s*.8; } else { k.armR=-2.6; k.azR=.3; k.elR=-.2; k.armL=-1.5; k.elL=-.4; k.headX=-.2; } return; }
  if(a.kind==='mandala'){ if(a.fly||kk>2.8){ k.armL=-1.6; k.elL=-.1; k.armR=-1.6; k.elR=-.1; k.lean=.2; return; } k.armR=-2.6+Math.sin(T*30)*.6; k.armL=-1.2; k.twist=Math.sin(T*25)*.9; k.knL=k.knR=.6; return; }
  if(kk<1.5){ k.armL=-2.8; k.elL=-.1; k.armR=-1.4; k.elR=-1; k.headX=-.4; return; }                                        // Moon raises the staff
  if(kk<2.3){ k.armL=k.armR=-2.9; k.azL=-.6; k.azR=.6; k.knL=k.knR=.8; k.lean=-.2; return; }                                // Sun leaps
  k.armR=k.armL=-3; k.elR=k.elL=-.2; k.lean=.7; k.knL=k.knR=.5; }; }

/* ---------- sandbox: play the twins ---------- */
if(!SB_PLAY.includes('ashvin')) SB_PLAY.push('ashvin');
if(!SB_DUMMIES.includes('ashvin')) SB_DUMMIES.push('ashvin');
