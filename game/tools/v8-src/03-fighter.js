/* ---- V8 FIGHTER: stances, light/medium/heavy, energy + cooldowns, quick escape, flight, ultimates, blocking ---- */
{ const Base=Fighter;
  Fighter=class extends Base{ constructor(d,p){ super(d,p); if(isCore(this)){ this.stIdx=0; this.cds={}; v8Dress(this); } } };
  Fighter.prototype.constructor=Fighter; }
const FP=Object.getPrototypeOf(Fighter.prototype); // the original class prototype (all methods live here)
Object.defineProperty(FP,'F',{configurable:true,get(){ const st=this.def.stances; if(!st) return this.def.forms[this.alt?1:0];
 const s=st[this.stIdx||0]; if(this.v8fly) return s._fly||(s._fly=Object.assign({},s,{hover:24,speed:s.speed*1.45,jump:0})); return s; }});

{ const oReset=FP.reset; FP.reset=function(x,z,yaw){ oReset.call(this,x,z,yaw); if(!isCore(this)) return;
  this.hHold=null; this.sHold=0; this.v8fly=false; this.stam=100; this.barrier=null; this.burnT=0; this.slowT=0; this.v8cut={}; this.v8cutT={}; this.regrow={}; this.smallHits=[]; this.smallImm=0; this.lastLand=-9;
  if(this.cds) for(const k in this.cds) this.cds[k]=0; v8StanceVisual(this); } }

// SUPER button: core titans get a once-per-match ULTIMATE below 25% health (Titan Cores still give the normal super)
{ const oSR=FP.superReady; FP.superReady=function(){ if(!isCore(this)) return oSR.call(this); return this.coreReady||(!this.ultUsed&&this.hp/this.def.hp<=.25); } }

// stance switching instead of transforming: short delay + energy cost (no long transformation)
function v8Stance(f){ const st=f.def.stances; let n=((f.stIdx||0)+1)%st.length;
 if(f.def.id==='ragnavox'){ for(let k=0;k<st.length&&f.v8cut[st[n].el];k++) n=(n+1)%st.length; if(n===f.stIdx){ if(f.isPlayer) toast('NO OTHER HEADS LEFT!','#ff8080',800); return; } }
 const free=up(f,'freeswap'), c=free?0:8*costMul(f); if(f.energy<c){ if(f.isPlayer) toast('NEED 8 ENERGY TO SWITCH STANCE','#88ccff',800); return; }
 const swap=f.def.id==='valor'&&game.time-f.lastLand<.6; // VALOR: swapping right after a hit = Stance Breaker finisher
 f.energy-=c; f.stIdx=n; f.startAtk('stance'); if(free) f.atk.dur=.05; f.tfCd=free?.2:1.1; v8StanceVisual(f);
 burst(f.chest(),f.def.id==='ragnavox'?V8EL[f.F.el]:f.def.glow,22,14); Snd.tone('square',300,900,.12,.06); toast(`${f.def.name}: ${f.F.name}`,f.def.css,800);
 if(swap){ const o=f.opp; if(!o.dead&&Math.hypot(o.pos.x-f.pos.x,o.pos.z-f.pos.z)<16){ o.takeHit(f,14*f.F.power,30,20,false); banner('STANCE BREAKER!',700); News.add('VALOR SWAPS WEAPONS MID-COMBO! STANCE BREAKER!',false,'sbreak',6); } } }

function v8Cost(f,id){ return Math.round((MOVES[id].cost||0)*costMul(f)); }
function v8Fire(f,id,quiet){ const M=MOVES[id]; if(!M) return false; const c=v8Cost(f,id), cd=f.cds[id]||0;
 if(cd>0){ if(f.isPlayer&&!quiet) toast(M.name.toUpperCase()+' READY IN '+Math.ceil(cd)+'s','#88ccff',600); return false; }
 if(f.hot(id)) return false;
 if(M.en&&f.energy<M.en){ if(f.isPlayer&&!quiet) toast('OUT OF ENERGY','#88ccff',600); return false; }
 if(f.energy<c){ if(f.isPlayer&&!quiet) toast('NEED MORE ENERGY ('+c+')','#88ccff',700); return false; }
 f.energy-=c+(M.en||0); if(M.cd){ let k=M.cd; if(id==='thunderstep'&&up(f,'step')) k*=.5; if(id==='dorsalpulse'&&up(f,'pulse')) k*=.5; f.cds[id]=k; }
 f.dropHeld&&M.cost&&f.dropHeld(); f.startAtk(id); return true; }

// player/AI input for core titans is read here BEFORE the normal update, so the old code never sees these presses
function v8Input(f,inp,dt){ const A=f.atk, canAct=!f.dead&&f.stun<=0&&game.state==='fight'&&f.rollT<=0&&!f.grabbedBy;
 for(const k in f.cds) f.cds[k]=Math.max(0,f.cds[k]-dt);
 // held buttons (keyboard, touch, controller); CPUs and agents just tap
 const human=f.isPlayer&&!f.pilot||(game.vs2&&f===game.e);
 const hHeld=human&&!!inp.heavyHeld, sHeld=human&&!!inp.specialHeld;
 f._sHeld=f.atk&&(f.atk.id==='echoshift'||f.atk.id==='dawncannon')?(human?sHeld:f.atk.t<(f.atk.aiT||(f.atk.aiT=rand(.5,1.2)))):false;
 // SUPER / ULTIMATE
 if(inp.super>0&&canAct&&(!A||A.id==='stance')){ inp.super=0;
  if(!f.ultUsed&&f.hp/f.def.hp<=.25){ f.ultUsed=true; f.dropHeld(); f.v8fly=false; f.atk=null; f.startAtk('ultimate'); v8UltStart(f); }
  else if(f.coreReady){ inp.super=.25; } // let the old code run the Titan Core super
  else if(f.isPlayer) toast('ULTIMATE UNLOCKS BELOW 25% HEALTH','#ffd43b',1100); }
 // stance
 if(inp.transform>0){ inp.transform=0; if(canAct&&!A&&f.tfCd<=0) v8Stance(f); }
 // flight (RAGNAVOX): jump again in the air to take off, jump in the air again to drop
 if(f.def.id==='ragnavox'){ if(inp.jump>0&&!f.onGround&&canAct&&!A){ inp.jump=0; if(f.v8fly){ f.v8fly=false; } else if(f.stam>15){ f.v8fly=true; f.vy=12; Snd.whoosh(); if(f.isPlayer) toast('FLYING! (USES STAMINA)','#b48cff',700); } }
  if(f.v8fly){ f.stam-=dt*(up(f,'wings')?11:17); if(f.stam<=0||f.stun>.5){ f.stam=Math.max(0,f.stam); f.v8fly=false; if(f.isPlayer) toast('OUT OF STAMINA!','#ff8080',700); } }
  else if(f.onGround) f.stam=Math.min(100,f.stam+dt*14); }
 // SPECIAL
 if(inp.special>0&&canAct&&(!A||A.id==='stance')){ inp.special=0; if(!A) v8Fire(f,f.F.L); }
 else if(inp.special>0&&(!canAct||A)) { if(!(A&&LIGHT.includes(A.id))) inp.special=Math.min(inp.special,.12); }
 // HEAVY button: tap = MEDIUM, hold = HEAVY (fling into the air). In the air while flying = SKY DIVE
 const lightOK=A&&LIGHT.includes(A.id)&&A.landed&&A.t>=A.hitAt+.03;
 if(inp.heavy>0&&canAct&&!f.held&&(!A||lightOK)&&!f.hHold){ inp.heavy=0;
  if(f.v8fly){ f.v8fly=false; v8Fire(f,'skydive'); }
  else if(!f.onGround&&f.pos.y-(f._floor||0)>5&&!f.F.hover){ f.startAtk('groundpound'); }
  else if(human) f.hHold={t:0}; else v8Fire(f,Math.random()<.4?f.F.K:f.F.M); }
 if(f.hHold){ const H=f.hHold; H.t+=dt; if(Math.random()<dt*20) burst(f.chest(),f.def.glow,1,4);
  if(!canAct){ f.hHold=null; } else if(H.t>=.32||!hHeld){ const heavy=H.t>=.32; f.hHold=null; if(f.atk&&LIGHT.includes(f.atk.id)) f.atk=null; if(v8Fire(f,heavy?f.F.K:f.F.M)&&heavy){ burst(f.chest(),0xffffff,10,10); } } }
 // energy regen from stats, loadout and upgrades (base game gives 1.6/s)
 const L=f.load||{}; let rg=enMul(f)*(L.focus==='hybrid'?1.15:1)*(up(f,'regen30')?1.3:1); f.energy=Math.min(100,f.energy+dt*1.6*(rg-1));
}

// light attack for RAIKOU in IAI: blocking counter-cuts
function v8IaiCounter(f,src){ if(!src||!src.def||src===HZ) return false; if(!(f.F.iai&&f.blocking)) return false; if(Math.hypot(src.pos.x-f.pos.x,src.pos.z-f.pos.z)>22) return false;
 if(!up(f,'iaicounter')&&Math.random()<.5) return false; src.takeHit(f,10*f.F.power,20,0,false); zapBolt(f.chest(),src.chest()); toast('IAI COUNTER!','#fff06a',600); return true; }

/* ---- damage rules: small shots can't stun-lock, blocks stop small shots, shields, loadouts, stats ---- */
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  if(this.dead||this.inv>0||this.hidden) return;
  const P=V8.proj, small=!!(P&&P.r<=3&&!P.pierce), fromF=src&&src.def&&src!==HZ;
  let nx,nz; if(dir){ nx=dir.x; nz=dir.z; } else if(src&&src.pos){ nx=this.pos.x-src.pos.x; nz=this.pos.z-src.pos.z; } else { nx=0; nz=1; } const l=Math.hypot(nx,nz)||1; nx/=l; nz/=l;
  const facing=Math.abs(angDiff(this.yaw,Math.atan2(-nx,-nz)))<1.5;
  // shields & barriers (VALOR Rally Stand = front, ASHVIN Mind Barrier = bubble)
  const B=this.barrier; if(B&&!cont&&fromF){
   if(B.kind==='bubble'||facing){ if(P&&(small||up(this,'rally')||B.kind==='bubble')){ v8Reflect(this,P,src); return; } dmg*=B.kind==='shield'?.2:.4; kb*=.2; launch=0; burst(this.chest(),this.def.glow,10,12); Snd.block(); } }
  // block stops small shots completely (no chip, no stun); a timed parry throws them back
  if(small&&fromF&&!cont&&this.blocking&&facing){ if(game.time-this.parryT<.25){ this.parryT=-9; v8Reflect(this,P,src); toast('REFLECTED!','#9ff3ff',600); this.energy=Math.min(100,this.energy+6); return; }
   burst(this.chest().addScaledVector(V(nx,0,nz),-2),0x88ccff,6,8); Snd.block(); return; }
  if(isCore(this)&&!cont&&fromF&&v8IaiCounter(this,src)) { dmg*=.3; kb*=.3; launch=0; }
  // loadout, stats, upgrades
  if(fromF&&src.load){ const L=src.load, rangedHit=!!P||(src.atk&&MOVES[src.atk.id]&&MOVES[src.atk.id].ranged);
   if(L.focus==='melee') dmg*=rangedHit?.85:1.15; else if(L.focus==='ranged') dmg*=rangedHit?1.15:.85;
   if(up(src,'light12')&&src.atk&&LIGHT.includes(src.atk.id)) dmg*=1.12; }
  if(isCore(this)){ dmg*=defMul(this); if(up(this,'armor12')) dmg*=.88; }
  if(small){ kb*=.4; launch=0; }
  const stun0=this.stun, hp0=this.hp; oTH.call(this,src,dmg,kb,launch,cont,dir);
  if(small&&!cont&&!this._v82){ // (v8.2: core titans use the auto-guard + 5th-hit rule in 08-guard.js instead) no stun-lock from bullets/ki blasts: tiny flinch, then 2s of "steady" after 3 quick hits
   this.smallHits=(this.smallHits||[]).filter(t=>game.time-t<1.5); this.smallHits.push(game.time);
   if(this.smallImm>game.time) this.stun=stun0; else this.stun=Math.max(stun0,Math.min(this.stun,.08));
   if(this.smallHits.length>=3&&!(this.smallImm>game.time)){ this.smallImm=game.time+2; this.smallHits=[]; if(this.isPlayer) toast('STEADY! SHOTS CAN\'T STAGGER YOU','#cbd5e1',800); } }
  const lost=hp0-this.hp; if(lost>0&&fromF){ src.lastLand=game.time; src.dealt=(src.dealt||0)+lost; v8OnHit(src,this,lost,cont); }
  if(lost>0&&this.def.id==='ragnavox'&&!cont&&lost>=12) v8HeadHit(this,lost);
 }; }
function v8Reflect(f,P,src){ if(!P||!P.mesh) return; const pos=P.mesh.position.clone(), sp=Math.max(90,P.vel?P.vel.length():90);
 spawnProj({pos,vel:src.chest().sub(pos).normalize().multiplyScalar(sp),grav:0,dmg:P.dmg,r:P.r,size:P.size||.6,kb:P.kb||8,launch:0,owner:f,target:src,color:f.def.glow}); deflectFX(pos,f); }
function v8OnHit(src,t,dmg,cont){ const L=src.load; if(!L||cont) return;
 if(L.el==='fire'){ t.burnT=3; t.burnBy=src; }
 if(L.el==='water'){ t.slowT=2; }
 if(L.el==='lightning'&&Math.random()<.22){ zapBolt(src.chest(),t.chest()); t.stun=Math.max(t.stun,.25); t.hp=Math.max(1,t.hp-4); }
 }
// RAGNAVOX: the head of the element in use takes damage first; big hits cut it off; at least one head always stays
function v8HeadHit(f,dmg){ if(Math.random()>.4) return; const els=['fire','storm','ice'], alive=els.filter(e=>!f.v8cut[e]); if(alive.length<=1) return;
 const e=f.F.el; if(f.v8cut[e]) return; f.v8cut[e]=true; f.v8cutT[e]=up(f,'regrow')?5:10; burst(f.chest().add(V(0,5,0)),V8EL[e],30,18); Snd.crunch();
 toast(`RAGNAVOX LOSES ITS ${e.toUpperCase()} HEAD!`,'#b48cff',1000); News.add(`RAGNAVOX'S ${e.toUpperCase()} HEAD IS DOWN! NO MORE ${e==='storm'?'LIGHTNING':e.toUpperCase()} UNTIL IT GROWS BACK`,true,'rhead',5);
 v8Stance(f); }

/* ---- every frame for core titans (runs from rosterTick) ---- */
function v8Tick(f,dt){ if(!isCore(f)||f.dead||game.state!=='fight') return;
 if(f.burnT>0){ f.burnT-=dt; const s0=f.stun; f.takeHit(f.burnBy||HZ,3*dt,0,0,true,{x:0,z:1}); f.stun=s0; /* v8.2: burn hurts but never freezes you */ if(Math.random()<dt*10) burst(f.chest().add(V(rand(-2,2),rand(-3,2),rand(-2,2))),0xff6a1a,2,6); }
 if(f.slowT>0) f.slowT-=dt;
 if(f.barrier){ f.barrier.t-=dt; v8BarrierFX(f,dt); if(f.barrier.t<=0) v8BarrierEnd(f); }
 for(const e in f.v8cutT){ if(!f.v8cut[e]) continue; f.v8cutT[e]-=dt; if(f.v8cutT[e]<=0){ f.v8cut[e]=false; burst(f.chest().add(V(0,5,0)),V8EL[e],24,12); toast(`RAGNAVOX'S ${e.toUpperCase()} HEAD GREW BACK!`,'#b48cff',900); } }
 // INFERNOTH Burning Rage: lower health = hotter
 if(f.def.id==='infernoth'){ const k=1-f.hp/f.def.hp; f.setGlow(1+k*(up(f,'rage')?2.5:1.8)); }
 if(f.load&&f.load.el==='water'&&(f.inRiver==='water'||MAP.weather==='rain')&&f.hp<f.def.hp) f.hp=Math.min(f.def.hp,f.hp+dt*1.2);
 v8Limbs(f,dt); v8Upgrades(f);
}
function v8Spd(f){ let m=1; if(f.slowT>0) m*=.88; if(up(f,'speed10')) m*=1.1; for(const F of V8.fields) if(F.owner!==f&&Math.hypot(f.pos.x-F.x,f.pos.z-F.z)<F.r) m*=.6; return m; }
{ const o=rSpd; rSpd=function(f){ return o(f)*v8Spd(f); }; }
{ const o=rosterTick; rosterTick=function(f,dt){ o(f,dt); v8Tick(f,dt); v8Anim(f,dt); }; }
{ const o=explodeProj; explodeProj=function(p){ V8.proj=p; try{ o(p); } finally{ V8.proj=null; } }; }

/* ---- limbs: BRUISED -> CRIPPLED -> MISSING, and each core titan regrows them its own way ---- */
const V8REGROW={valor:[12,'THE ARMY AIR-DROPS A NEW','#7fd4ff'],ashvin:[10,'THE TWINS PSYCHICALLY REBUILD THE','#d58bff'],raikou:[9,'NANOTECH (TAKEN FROM A KAIJU) REGROWS THE','#fff06a'],infernoth:[14,'MAGMA HARDENS INTO A NEW','#ff7a3a'],ragnavox:[11,'RAGNAVOX REGROWS ITS','#b48cff']};
function v8Limbs(f,dt){ const R=V8REGROW[f.def.id]; if(!R) return; for(const k in f.limbs){ const L=f.limbs[k]; if(L.state<2){ f.regrow[k]=0; continue; }
  f.regrow[k]=(f.regrow[k]||0)+dt*1;
  if(f.def.id==='valor'&&f.regrow[k]>R[0]-2&&!L.drop){ L.drop=true; const c=f.pos.clone(); pillar(c.x,c.z,1.2,0x7fd4ff,2,90); ring(c.x,.3,c.z,6,0x7fd4ff,2); }
  if(f.regrow[k]>=R[0]){ f.regrow[k]=0; L.state=0; L.hp=L.max*.6; L.drop=false; L.node.visible=true; f.stumps=f.stumps.filter(s=>s.k!==k); f.kneel=0;
   const wp=V(); L.node.getWorldPosition(wp); burst(wp,parseInt(R[2].slice(1),16),30,16); Snd.mech&&Snd.mech(); if(f.isPlayer||game.vs2) toast(`${R[1]} ${LNAME[k]}!`,R[2],1200); News.add(`${f.def.name}: ${R[1]} ${LNAME[k]}!`,false,'regrow'+f.def.id,6); } } }

/* ---- upgrades unlocked during the fight ---- */
function v8Upgrades(f){ const T=V8TREE[f.def.id]; if(!T||!f.load) return; const br=T[f.load.sub||'A']; f.ups=f.ups||new Set(); f.upTier=f.upTier||0;
 const want=Math.max(1,(f.dealt||0)>=300||game.round>=3?3:(f.dealt||0)>=120||game.round>=2?2:1);
 while(f.upTier<want){ const n=br.nodes[f.upTier]; f.ups.add(n[2]); f.upTier++; if(f.upTier>1&&(f.isPlayer||game.vs2)){ toast(`UPGRADE ${f.upTier}/3: ${n[0].toUpperCase()}!`,f.def.css,1500); burst(f.chest(),0xffd43b,30,16); Snd.tone('sine',600,1400,.3,.12); } } }
