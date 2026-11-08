/* =====================================================================
   SANDBOX 14: LOADOUT REWORK for VALOR and INFERNOTH (Nov 7, 2026). In the game since v8.4 (moved from the sandbox).
   MajorasPride's plan: Game Plan > Ideas Inbox > Loadout rethink. All three picks stay, all redone:
   - PATH (ability tree): 2 paths per titan, 3 upgrades each. Every upgrade works in both stances,
     on a different move in each. Upgrades unlock by playing the path's way (goals below);
     the 1st is there from the start, and from round 2 on everyone has all 3.
   - FOCUS = which moves you get. HYBRID = the kit as it is, MELEE swaps ranged moves for close-up ones,
     RANGED swaps close-up moves for ranged ones. No damage percentages.
   - ELEMENT: Fire = pressure (3 heat = a 3s burn, never a stun). Water = control (2s slow, heals only
     standing in a river). Lightning = burst (every 5th hit in a row shocks and zaps the next thing nearby).
     Matchups: Water beats Fire, Fire beats Lightning, Lightning beats Water (effects, no extra damage).
     The look of each element is in 13-element-looks.js.
   - Every pick starts on DEFAULT (the titan's normal setup), so players don't see which one was the original.
   - Fixes: Fury maxes out at +10% (was +30%); the CPU always gets a real element; Water no longer heals in rain.
   ===================================================================== */

/* ---------- who is acting right now (for the element looks and for credit on buildings) ---------- */
const CTX={f:null};
function withF(f,fn){ const p=CTX.f; CTX.f=f; try{ return fn(); } finally{ CTX.f=p; } }
{ const o=FP.update; FP.update=function(dt,inp,opp){ return withF(this,()=>o.call(this,dt,inp,opp)); }; }
{ const o=rosterTick; rosterTick=function(f,dt){ return withF(f,()=>o(f,dt)); }; }
{ const o=later; later=function(t,fn){ const f=CTX.f; return o(t,f?()=>withF(f,fn):fn); }; }
{ const o=toast; toast=function(t,...r){ return o(t==null?'SLASH!':t,...r); }; }   // TIDECREST's 2 extra cuts index past the shout list

const homeEl=f=>f&&f.def?({valor:'water',infernoth:'fire'})[f.def.id]||null:null;
const lookEl=f=>(f&&f.load&&V8ELEM[f.load.el]&&f.load.el)||homeEl(f)||(f&&f.def&&V8DEFEL[f.def.id])||'fire';
const isVal=f=>!!(f&&f.def&&f.def.id==='valor'&&isCore(f));

/* ---------- PATHS ---------- */
V8TREE.valor={
 A:{n:'SENTINEL',nodes:[
  ['Ricochet Shield','Sword & Shield: Shield Throw bounces off buildings for up to 3 hits. Brawler: Follow Dash ends in a shield bash','rico'],
  ['Tidewall','Sword & Shield: hold block to build a water wall that throws small shots back. Brawler: Tide Hook sends a wave that eats shots','tidewall'],
  ['Unbreakable','Sword & Shield: TIDECREST OATH\'s lunge can\'t be knocked out of. Brawler: SHIELD BARRAGE gets a 5th throw','unbreak']]},
 B:{n:'COMMANDER',nodes:[
  ['Counter Tide','Sword & Shield: block right before a hit for a free counter slash. Brawler: Weave fills the KO meter twice as fast, plus a free counter jab','ctide'],
  ['Hero of the City','Sword & Shield: each person saved refills your guard. Brawler: each person saved adds +8 KO','hero'],
  ['Tidecrest Mastery','Sword & Shield: TIDECREST OATH reaches farther, with 2 more cuts. Brawler: SHIELD BARRAGE\'s last bash hits harder and sends them farther','tmaster']]}};
V8TREE.infernoth={
 A:{n:'MAGMA HEART',nodes:[
  ['Hot Blood','BRAWLER: the bite at the end of claw-claw-bite fills rage. MELTDOWN: Magma Wall fills rage when it gets hit','hotblood'],
  ['Living Fortress','BRAWLER: Pounce and Volcano Leap can\'t be staggered. MELTDOWN: Obsidian Shell lasts 2s longer and throws back bigger shots','fortress'],
  ['King of Monsters','BRAWLER: KING\'s tail WHACK sends them farther and they land in a lava burst. MELTDOWN: LAVA DOMAIN\'s beam pins them longer','kingmon']]},
 B:{n:'NUCLEAR BREATH',nodes:[
  ['Rampage','BRAWLER: smashing buildings with a grab or stomp fills rage. MELTDOWN: buildings burned down by the heat beam fill rage','rampage'],
  ['Scorched Earth','BRAWLER: Burrow\'s lava spout lasts 3s and the stomp leaves lava cracks. MELTDOWN: the heat beam\'s burning ground lasts twice as long','scorch'],
  ['Endless Eruption','BRAWLER: Volcano Leap\'s eruption ring is twice as big. MELTDOWN: LAVA DOMAIN\'s lava rain lasts 20s instead of 15','erupt']]}};

/* ---------- unlock goals: [2nd upgrade, 3rd upgrade], each a list of ways (any one is enough) ---------- */
const LGOAL={
 valor:{A:[[['guard',10,'block or slip']],[['blk',25,'blocks'],['bigShield',1,'big hit on the shield']]],
        B:[[['combo',5,'hit combo'],['saved',10,'saved']],[['combo',10,'hit combo'],['saved',30,'saved']]]},
 infernoth:{A:[[['shrug',10,'shrugged off'],['rages',1,'rage']],[['rages',2,'rages'],['bigTaken',1,'big hit taken']]],
            B:[[['bld',3,'buildings'],['burn',5,'s of burn']],[['bld',8,'buildings'],['burn',15,'s of burn']]]}};
const gv=(f,k)=>{ const g=f.g||{}; if(k==='guard') return (g.blk||0)+(g.slip||0); if(k==='saved') return f.saved||0; return g[k]||0; };
const goalMet=(f,tier)=>{ const G=LGOAL[f.def.id]; if(!G||!f.load) return false; return G[f.load.sub||'A'][tier-2].some(([k,n])=>gv(f,k)>=n); };
{ const oldU=v8Upgrades; v8Upgrades=function(f){ if(!LGOAL[f.def.id]) return oldU(f); const T=V8TREE[f.def.id]; if(!T||!f.load) return;
  const br=T[f.load.sub||'A']; f.ups=f.ups||new Set(); f.upTier=f.upTier||0; f.g=f.g||{};
  const want=(SB.allUp||game.round>=2||goalMet(f,3))?3:goalMet(f,2)?2:1;
  while(f.upTier<want){ const n=br.nodes[f.upTier]; f.ups.add(n[2]); f.upTier++;
   if(f.upTier>1&&(f.isPlayer||game.vs2)){ toast(`UPGRADE ${f.upTier}/3: ${n[0].toUpperCase()}!`,f.def.css,1500); burst(f.chest(),0xffd43b,30,16); Snd.tone('sine',600,1400,.3,.12); } } }; }
function lxResetFighter(f){ if(!f) return; f.g={}; f.ups=new Set(); f.upTier=0; f.fHeat=0; f.shN=0; f._saved0=f.saved||0; }

/* ---------- FOCUS: which moves you get ---------- */
const FOCUS_SWAP={valor:{melee:{shieldthrow:'vshieldrush',dawncannon:'tidebreaker'},ranged:{geyser:'wcannon',chargingstar:'tidelance'}},
 infernoth:{melee:{mbeam:'kjaws',mmeteor:'kcharge'},ranged:{kstomp:'kfault',kpounce:'kboulder'}}};
const swapOf=f=>{ const S=f&&f.load&&f.def&&FOCUS_SWAP[f.def.id]; return S&&S[f.load.focus]||null; };
{ const o=FP.startAtk; FP.startAtk=function(id){ const S=isCore(this)&&swapOf(this); return o.call(this,S&&S[id]||id); }; }
function withSwapNames(f,fn){ const S=swapOf(f); if(!S) return fn(); const keep={}; for(const k in S){ if(!MOVES[k]||!MOVES[S[k]]) continue; keep[k]=MOVES[k]; MOVES[k]=Object.assign({},MOVES[k],{name:MOVES[S[k]].name}); }
 try{ return fn(); } finally{ Object.assign(MOVES,keep); } }
{ const o=sbKitRender; sbKitRender=function(){ return withSwapNames(game.p,()=>o()); }; }
{ const o=refreshMoves; refreshMoves=function(i){ return withSwapNames(i?game.e:game.p,()=>o(i)); }; }
{ const o=cbTick; cbTick=function(dt){ return withSwapNames(game.p,()=>o(dt)); }; }   // the 1/2/3 bar shows the Focus moves

Object.assign(MOVES,{
 vshieldrush:{name:'Shield Rush',dur:.95,moveMul:0,anim:'vbash',noCharge:1},
 tidebreaker:{name:'Tidebreaker',dur:1.3,moveMul:0,anim:'vplunge',noCharge:1},
 wcannon:{name:'Water Cannon Punch',dur:.6,hitAt:.25,ranged:1,moveMul:0,anim:'bhook',noCharge:1},
 tidelance:{name:'Tide Lance',dur:.55,hitAt:.28,ranged:1,moveMul:0,anim:'vthrowshield',noCharge:1},
 kfault:{name:'Fault Line',dur:.9,hitAt:.52,ranged:1,moveMul:0,anim:'kstomp',noCharge:1},
 kboulder:{name:'Boulder Toss',dur:.9,hitAt:.45,ranged:1,moveMul:0,anim:'kgrabp',noCharge:1},
 kjaws:{name:'Searing Jaws',dur:.8,hitAt:.38,moveMul:0,anim:'kbite',noCharge:1},
 kcharge:{name:'Lava Charge',dur:1.0,moveMul:0,anim:'kpounce',noCharge:1},
});

/* projectiles, lava cracks and shot-eating waves for the new moves and upgrades */
const LX={shots:[],cracks:[],waves:[],tmp:[]};
const fwdP=(f,d)=>V(f.pos.x+Math.sin(f.yaw)*d,0,f.pos.z+Math.cos(f.yaw)*d);
const aimYaw=(f,o,rg)=>canHit(o)&&dist2(f,o)<rg?Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z):f.yaw;
function lxShot(f,o,at,yaw,S){ const m=S.mesh(); m.position.copy(at); scene.add(m);
 LX.shots.push(Object.assign({f,o,m,pos:at.clone(),vel:V(Math.sin(yaw)*S.sp,S.vy||0,Math.cos(yaw)*S.sp),t:S.life||1,acc:0},S)); }
const waterBall=()=>{ const g=new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(2.2,12,10),new THREE.MeshBasicMaterial({color:0x3fa9ff}))); g.add(new THREE.Mesh(new THREE.SphereGeometry(2.9,12,10),new THREE.MeshBasicMaterial({color:0x0b0f1e,side:THREE.BackSide}))); return g; };
const waterSpear=()=>{ const g=new THREE.Group(), c=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,13,8),new THREE.MeshBasicMaterial({color:0x7fd8ff})); c.rotation.x=Math.PI/2; g.add(c);
 const tip=new THREE.Mesh(new THREE.ConeGeometry(1.3,3.5,8),new THREE.MeshBasicMaterial({color:0x2f8ff0})); tip.rotation.x=Math.PI/2; tip.position.z=8; g.add(tip);
 const ink=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,13.4,8),new THREE.MeshBasicMaterial({color:0x0b0f1e,side:THREE.BackSide})); ink.rotation.x=Math.PI/2; g.add(ink); return g; };
const boulder=()=>{ const m=new THREE.Mesh(ROCKG,moltenM()); m.scale.setScalar(3.4); return m; };

Object.assign(V8MOVE,{
 // VALOR · MELEE: Shield Rush (Sword & Shield special): dash in, bash-bash-BASH
 vshieldrush(f,a,dt,pm,o){ if(once(a,'s',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); Snd.whoosh(); }
  if(!a.hitN){ const d=canHit(o)?dist2(f,o):99, stop=o.radius()+f.radius()+3;
   if(a.t<.38&&d>stop){ f.kb.x=Math.sin(f.yaw)*95; f.kb.z=Math.cos(f.yaw)*95; if(Math.random()<dt*40) wfxSprite('splash',f.pos.clone().add(V(0,3,0)),6,.3,{grow:.5,rot:rand(0,6)}); return; }
   f.kb.multiplyScalar(.3); if(d<=stop+5){ a.hitN=1; a.h0=a.t; a.dur=a.t+.62; } else { a.dur=Math.min(a.dur,a.t+.35); a.hitN=-1; } return; }
  if(a.hitN<0) return;
  for(let i=0;i<3;i++) if(once(a,'b'+i,a.h0+i*.17)&&canHit(o)){ const big=i===2, at=o.chest().lerp(f.chest(),.4);
   o.takeHit(f,(big?11:6)*pm,big?55:8,big?10:0,false,{x:o.pos.x-f.pos.x+.01,z:o.pos.z-f.pos.z}); o.stun=Math.max(o.stun,big?.5:.3); clangFX(at); wfxHit(at,big?10:7);
   if(o.guardMax){ o.guard=Math.max(0,o.guard-15); o.guardHitT=game.time; } if(big) game.shake=Math.max(game.shake,.6); } },
 // VALOR · MELEE: Tidebreaker (skill 3): leap and slam with a water shockwave
 tidebreaker(f,a,dt,pm,o){ if(once(a,'j',.12)){ const ok=canHit(o)&&dist2(f,o)<80; a.to=ok?V(o.pos.x,0,o.pos.z):fwdP(f,35); f.vy=32; f.onGround=false; Snd.whoosh(); wfxRing(f.pos.x,f.pos.z,10,.4); }
  if(a.t<.12||a.landT!=null) return; a.trail=true;
  const dx=a.to.x-f.pos.x, dz=a.to.z-f.pos.z, d=Math.hypot(dx,dz); f.yaw=Math.atan2(dx,dz); if(d>2){ f.kb.x=dx/d*Math.min(80,d*3); f.kb.z=dz/d*Math.min(80,d*3); } else f.kb.set(0,0,0);
  if(a.t>.5) f.vy=Math.min(f.vy,-60);
  if((a.t>.3&&(f.onGround||f.pos.y<.6))||a.t>1.0){ a.landT=a.t; a.trail=false; f.kb.set(0,0,0); f.pos.y=0; a.dur=a.t+.4; const r=20*f.scale;
   aoe(f,o,f.pos.x,f.pos.z,r,22*pm,40,24,0x7fd4ff); wfxRing(f.pos.x,f.pos.z,r*1.3,.7); wfxColumn(f.pos.x,f.pos.z,26,6);
   for(let i=0;i<8;i++){ const g=i/8*Math.PI*2; wfxSprite(i%2?'curl':'curlM',V(f.pos.x+Math.cos(g)*r*.8,4,f.pos.z+Math.sin(g)*r*.8),12,.55,{grow:.5}); }
   game.shake=Math.max(game.shake,1.2); Snd.boom(); } },
 // VALOR · RANGED: Water Cannon Punch (Brawler special): the punch fires a water blast
 wcannon(f,a,dt,pm,o){ if(once(a,'p',a.hitAt)){ const at=fistAt(f,1), y=aimYaw(f,o,110); f.yaw=y; punchFX(at,true);
   lxShot(f,o,at,y,{sp:125,life:.9,dmg:14*pm,kb:34,ln:6,r:3.4,stun:.35,mesh:waterBall,kind:'cannon'}); Snd.whoosh(); } },
 // VALOR · RANGED: Tide Lance (skill 1): a thrown water spear
 tidelance(f,a,dt,pm,o){ if(once(a,'t',a.hitAt)){ const at=f.chest().add(V(Math.sin(f.yaw)*4,3,Math.cos(f.yaw)*4)), y=aimYaw(f,o,130); f.yaw=y;
   lxShot(f,o,at,y,{sp:175,life:.85,dmg:16*pm,kb:22,ln:4,r:3.2,stun:.4,mesh:waterSpear,kind:'lance',aim:1}); Snd.whoosh(); Snd.tone('triangle',900,300,.2,.06); } },
 // INFERNOTH · RANGED: Fault Line (BRAWLER special): the stomp sends a lava crack racing to the rival
 kfault(f,a,dt,pm,o){ if(once(a,'s',a.hitAt)){ dust(f.pos.x,f.pos.z,12,10); game.shake=Math.max(game.shake,.9); Snd.boom(); const y=aimYaw(f,o,90), p=fwdP(f,8*f.scale);
   LX.cracks.push({f,o,x:p.x,z:p.z,dir:y,d:0,max:80,sp:95,acc:0,dmg:15*pm}); ring(f.pos.x,1,f.pos.z,14*f.scale,INF.ORANGE,.35); } },
 // INFERNOTH · RANGED: Boulder Toss (BRAWLER skill 1): rip up a burning chunk of street and throw it
 kboulder(f,a,dt,pm,o){ if(once(a,'r',.12)){ const p=fwdP(f,6); dust(p.x,p.z,8,8); burst(V(p.x,1,p.z),0x5a4a40,14,12); Snd.crunch&&Snd.crunch(); a.rock=boulder(); scene.add(a.rock); LX.tmp.push({m:a.rock,f}); }
  if(a.rock&&!a.thrown){ a.rock.position.copy(f.chest().add(V(Math.sin(f.yaw)*5,8*Math.min(1,a.t/.4),Math.cos(f.yaw)*5))); a.rock.rotation.x+=dt*3; }
  if(once(a,'t',a.hitAt)&&a.rock){ a.thrown=1; const from=a.rock.position.clone(), to=canHit(o)&&dist2(f,o)<95?o.chest():fwdP(f,50).setY(2), T=.7, g=60;
   const vel=V((to.x-from.x)/T,(to.y-from.y+.5*g*T*T)/T,(to.z-from.z)/T); scene.remove(a.rock);
   lxShot(f,o,from,0,{sp:0,life:2,dmg:18*pm,kb:42,ln:12,r:4,stun:.5,grav:g,mesh:boulder,kind:'boulder'}); LX.shots[LX.shots.length-1].vel=vel; a.rock=null; Snd.whoosh(); } },
 // INFERNOTH · MELEE: Searing Jaws (MELTDOWN special): a point-blank lava breath burst
 kjaws(f,a,dt,pm,o){ const mouth=kMouth(f); if(a.t<a.hitAt){ f.setGlow(1+a.t*6); if(Math.random()<dt*30) burst(mouth,Math.random()<.5?0xffd27a:INF.ORANGE,2,5); return; }
  if(once(a,'b',a.hitAt)){ for(let i=0;i<12;i++){ const d=4+i*1.4, s=(i%3-1)*.25; burst(V(f.pos.x+Math.sin(f.yaw+s)*d,mouth.y-i*.3,f.pos.z+Math.cos(f.yaw+s)*d),i%2?0xffd27a:INF.ORANGE,5,12); }
   const p=fwdP(f,12*f.scale); lavaPool(p.x,p.z,6,f,8*pm,2.5); lavaFountain(p.x,p.z,14,4); Snd.roar&&Snd.roar(); game.shake=Math.max(game.shake,.6);
   if(inFront(f,o,20,.9)){ o.takeHit(f,18*pm,60,10,false,{x:o.pos.x-f.pos.x+.01,z:o.pos.z-f.pos.z}); o.burnT=Math.max(o.burnT||0,1.5); o.burnBy=f; lava(o.chest(),18,16); } } },
 // INFERNOTH · MELEE: Lava Charge (MELTDOWN skill 1): charge forward, leaving a lava trail
 kcharge(f,a,dt,pm,o){ if(once(a,'s',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); Snd.roar&&Snd.roar(); }
  if(a.hit||a.t>.72){ f.kb.multiplyScalar(.6); return; }
  f.kb.x=Math.sin(f.yaw)*80; f.kb.z=Math.cos(f.yaw)*80; if(game.time-(a._p||0)>.1){ a._p=game.time; lavaPool(f.pos.x,f.pos.z,4,f,8*pm,2.5); if(Math.random()<.5) dust(f.pos.x,f.pos.z,4,3); }
  if(inFront(f,o,12,1.1)){ a.hit=1; o.takeHit(f,16*pm,50,12,false,{x:o.pos.x-f.pos.x+.01,z:o.pos.z-f.pos.z}); o.stun=Math.max(o.stun,.4); lava(o.chest(),16,16); Snd.boom(); a.dur=a.t+.3; } },
});

function lxTick(dt){ if(game.mode!=='match'||game.paused) return;
 for(let i=LX.tmp.length-1;i>=0;i--){ const T=LX.tmp[i]; if(!(T.f.atk&&T.f.atk.rock===T.m)){ scene.remove(T.m); LX.tmp.splice(i,1); } }   // a boulder dropped when he got interrupted
 for(let i=LX.shots.length-1;i>=0;i--){ const S=LX.shots[i], o=S.o; S.t-=dt; if(S.grav) S.vel.y-=S.grav*dt; S.pos.addScaledVector(S.vel,dt); S.m.position.copy(S.pos);
  if(S.aim) S.m.lookAt(S.pos.clone().add(S.vel)); else { S.m.rotation.x+=dt*5; S.m.rotation.y+=dt*4; }
  S.acc+=dt; if(S.acc>.05){ S.acc=0; withF(S.f,()=>{ if(S.kind==='boulder') burst(S.pos.clone(),Math.random()<.5?INF.ORANGE:0x4a3a36,2,5); else wfxSprite(Math.random()<.5?'curl':'curlM',S.pos.clone(),S.kind==='lance'?6:8,.35,{grow:.3}); }); }
  let done=S.t<=0||S.pos.y<(S.grav?.5:-5);
  if(!done&&canHit(o)&&S.pos.distanceTo(o.chest())<o.radius()+S.r){ V8.proj={r:S.r,mesh:S.m}; try{ withF(S.f,()=>{ o.takeHit(S.f,S.dmg,S.kb,S.ln,false,{x:S.vel.x,z:S.vel.z}); }); } finally{ V8.proj=null; } o.stun=Math.max(o.stun,S.stun||0); done=true; }
  const b=!done&&inBuilding(S.pos.x,S.pos.z,0); if(b&&S.pos.y<b.h){ withF(S.f,()=>bHit(b,30,S.vel.x,S.vel.z,S.pos.y,S.f)); done=true; }
  if(done){ withF(S.f,()=>{ if(S.kind==='boulder'){ burst(S.pos.clone(),INF.ORANGE,20,18); dust(S.pos.x,S.pos.z,8,8); lavaPool(S.pos.x,S.pos.z,6,S.f,6,2.6); Snd.thud&&Snd.thud(); } else wfxHit(S.pos.clone(),S.kind==='lance'?8:10); });
   scene.remove(S.m); LX.shots.splice(i,1); } }
 for(let i=LX.cracks.length-1;i>=0;i--){ const C=LX.cracks[i], o=C.o; withF(C.f,()=>{
   if(canHit(o)){ const want=Math.atan2(o.pos.x-C.x,o.pos.z-C.z); C.dir+=clamp(angDiff(want,C.dir),-dt*1.2,dt*1.2); }
   const st=C.sp*dt; C.x+=Math.sin(C.dir)*st; C.z+=Math.cos(C.dir)*st; C.d+=st; C.acc+=st;
   if(C.acc>5){ C.acc=0; lavaPool(C.x,C.z,3.4,C.f,6,2.4); burst(V(C.x,1,C.z),Math.random()<.5?0xffd27a:INF.ORANGE,4,9); }
   if(canHit(o)&&o.pos.y<6&&Math.hypot(o.pos.x-C.x,o.pos.z-C.z)<o.radius()+5){ o.takeHit(C.f,C.dmg,14,16,false,{x:Math.sin(C.dir),z:Math.cos(C.dir)}); o.stun=Math.max(o.stun,.5); lavaFountain(C.x,C.z,24,6); lavaPool(C.x,C.z,7,C.f,8,2.6); game.shake=Math.max(game.shake,.7); Snd.boom(); C.d=C.max; }
   if(C.d>=C.max){ if(C.d<C.max+1) lavaFountain(C.x,C.z,12,4); LX.cracks.splice(i,1); } }); }
 for(let i=LX.waves.length-1;i>=0;i--){ const W=LX.waves[i]; W.t-=dt; W.x+=Math.sin(W.dir)*70*dt; W.z+=Math.cos(W.dir)*70*dt;
  const hitIt=p=>Math.hypot(p.x-W.x,p.z-W.z)<W.r&&p.y<14;
  for(let j=projs.length-1;j>=0;j--){ const p=projs[j]; if(p.owner!==W.f&&p.mesh&&hitIt(p.mesh.position)){ p.life=0; withF(W.f,()=>wfxSprite('splash',p.mesh.position.clone(),6,.3,{grow:.6})); } }
  if(typeof KX!=='undefined') for(let j=KX.blobs.length-1;j>=0;j--){ const B=KX.blobs[j]; if(B.f!==W.f&&hitIt(B.m.position)){ B.t=0; withF(W.f,()=>wfxSprite('splash',B.m.position.clone(),6,.3,{grow:.6})); } }
  for(const S of LX.shots) if(S.f!==W.f&&hitIt(S.pos)) S.t=0;
  W.acc=(W.acc||0)+dt; if(W.acc>.06){ W.acc=0; withF(W.f,()=>wfxSprite(Math.random()<.5?'curl':'curlM',V(W.x,5,W.z),13,.4,{grow:.4})); }
  if(W.t<=0) LX.waves.splice(i,1); } }
function lxClear(){ for(const S of LX.shots) scene.remove(S.m); for(const T of LX.tmp) scene.remove(T.m); LX.tmp.length=0; LX.shots.length=0; LX.cracks.length=0; LX.waves.length=0; }
{ const o=updateFX; updateFX=function(dt){ o(dt); try{ lxTick(dt); }catch(e){ console.error(e); } }; }

/* ---------- ELEMENTS ---------- */
v8OnHit=function(src,t,dmg,cont){ const L=src.load; if(!L||cont) return; const el=lookEl(src), tel=lookEl(t);
 if(el==='fire'){ if(game.time-(t.fHeatT||0)>3) t.fHeat=0; t.fHeat=(t.fHeat||0)+1; t.fHeatT=game.time;
  if(t.fHeat>=3){ t.fHeat=0; t.burnT=Math.max(t.burnT||0,tel==='water'?1.5:3); t.burnBy=src; burst(t.chest(),0xff6a1a,12,12); if(t.isPlayer||src.isPlayer) toast('BURNING!','#ff9f43',500); } }
 if(el==='water'){ t.slowT=2; if(tel==='fire') src.fHeat=0; }                                   // Water beats Fire: hitting the Fire titan clears your heat
 if(el==='lightning'){ if(game.time-(src.shT||0)>1.6) src.shN=0; src.shN=(src.shN||0)+1; src.shT=game.time;
  if(src.shN>=(tel==='water'?4:5)){ src.shN=0; zapBolt(src.chest(),t.chest()); t.stun=Math.max(t.stun,.35); t.hp=Math.max(1,t.hp-5); if(t.isPlayer||src.isPlayer) toast('SHOCK!','#fff06a',500);
   let best=null, bd=45; for(const b of city){ if(!b.alive) continue; const d=Math.hypot(b.x-t.pos.x,b.z-t.pos.z)-Math.max(b.w||0,b.d||0)/2; if(d<bd){ bd=d; best=b; } }
   if(best){ zapBolt(t.chest(),V(best.x,best.h*.6,best.z)); bHit(best,25,0,0,best.h*.6,src); }
   else { const p=people.find(p=>!p.gone&&Math.hypot(p.x-t.pos.x,p.z-t.pos.z)<40); if(p) zapBolt(t.chest(),V(p.x,2,p.z)); } } } };
// Water heals only standing in a river (Neon City always rains, so rain healing was a free edge)
{ const o=v8Tick; v8Tick=function(f,dt){ const w=MAP.weather; if(f&&f.load&&f.load.el==='water'&&f.inRiver!=='water') MAP.weather='none';
  try{ o(f,dt); } finally{ MAP.weather=w; }
  if(f&&isCore(f)&&f.burnT>0&&lookEl(f)==='lightning') f.shN=0; }; }                            // Fire beats Lightning: burning resets the shock count
// FURY maxes out at +10% (was +30%)
rOut=function(f){ const r=RR(f); let m=r&&r.out?r.out(f):1; if(f&&!f.kaiju&&f.rescueRage) m*=1+Math.min(.1,f.rescueRage*.01); return m; };
rosterPeopleLost=function(p){ if(!game.p) return; const dA=Math.hypot(p.x-game.p.pos.x,p.z-game.p.pos.z), dB=Math.hypot(p.x-game.e.pos.x,p.z-game.e.pos.z), killer=dA<dB?game.p:game.e;
 for(const f of [game.p,game.e]){ if(f.kaiju) continue; const o=f.opp||(f===game.p?game.e:game.p); if(o&&o.kaiju&&killer===o){ f.rescueRage=(f.rescueRage||0)+1; if(f.rescueRage===10) toast(`${f.def.name} IS FURIOUS: +10% POWER`,'#ff6b5a',1000); } } };
rosterInfo=function(f){ return (!f.kaiju&&f.rescueRage)?'FURY +'+Math.min(10,f.rescueRage)+'%':''; };

/* ---------- what each upgrade does, and the goal counters ---------- */
function addRage(f,n){ if(!isInf(f)||f.kRageT>0) return; infInit(f); f.kRage=Math.min(100,(f.kRage||0)+n); if(f.kRage>=100) enterRage(f); }
{ const o=enterRage; enterRage=function(f){ o(f); if(f.g) f.g.rages=(f.g.rages||0)+1; }; }
function isBig(src,P){ if(P) return P.r>3; if(!src||!src.def) return false; if(src.beamOn) return true; const A=src.atk; if(!A) return false; const F=src.F||{};
 return A.id==='ultimate'||A.id===F.K||(HEAVYSET[F.K]&&HEAVYSET[F.K].includes(A.id))||(A.chg||0)>=.5||['kjaw','merupt','kbite','starpunch','kjaws','tidebreaker','kleap','vshieldrush'].includes(A.id); }
function shrugHit(f,fn){ const s0=f.stun, a0=f.atk, vy0=f.vy, kx=f.kb.x, kz=f.kb.z; fn(); if(f.dead) return; f.stun=s0; if(a0&&!f.atk) f.atk=a0; f.vy=Math.min(f.vy,Math.max(vy0,0)); f.kb.x=kx; f.kb.z=kz; }

{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  if(this.dead||this.hidden||!isCore(this)) return oTH.call(this,src,dmg,kb,launch,cont,dir);
  const f=this, P=V8.proj, small=!!(P&&P.r<=3&&!P.pierce), fromF=!!(src&&src.def&&src!==HZ); f.g=f.g||{};
  let nx,nz; if(dir){ nx=dir.x; nz=dir.z; } else if(src&&src.pos){ nx=f.pos.x-src.pos.x; nz=f.pos.z-src.pos.z; } else { nx=0; nz=1; } const l=Math.hypot(nx,nz)||1; nx/=l; nz/=l;
  const facing=Math.abs(angDiff(f.yaw,Math.atan2(-nx,-nz)))<1.5, blk=fromF&&!cont&&f.blocking&&facing, big=fromF&&isBig(src,P);
  // a slip with Weave (counts for Sentinel; Counter Tide = KO twice as fast + a free counter jab)
  if(fromF&&!cont&&f.atk&&f.atk.id==='bweave'&&f.inv>0){ if(!f._slipT||game.time-f._slipT>.2){ f.g.slip=(f.g.slip||0)+1;
    if(up(f,'ctide')){ koAdd(f,KO.slip); const A=f.atk; if(!A._ctj){ A._ctj=1; later(.1,()=>{ if(canHit(src)&&dist2(f,src)<22){ src.takeHit(f,7*(f.F.power||1),10,0,false,{x:src.pos.x-f.pos.x+.01,z:src.pos.z-f.pos.z}); punchFX(src.chest(),true); if(f.isPlayer) toast('COUNTER JAB!','#7fd4ff',500); } }); } } } }
  if(isVal(f)&&!f.F.brawl&&blk){
   // Tidewall (Sword & Shield): a block held for half a second throws small shots back
   if(small&&up(f,'tidewall')&&game.time-(f.blkStart||game.time)>.5){ f.g.blk=(f.g.blk||0)+1; v8Reflect(f,P,src); if(f.isPlayer) toast('TIDEWALL!','#7fd4ff',400); return; }
   // Counter Tide (Sword & Shield): block right before the hit = free counter slash
   if(!small&&up(f,'ctide')&&game.time-f.parryT<.25){ f.parryT=-9; f.g.blk=(f.g.blk||0)+1; if(big) f.g.bigShield=(f.g.bigShield||0)+1;
    src.takeHit(f,10*(f.F.power||1),30,6,false,{x:src.pos.x-f.pos.x+.01,z:src.pos.z-f.pos.z}); slashFX(src.chest(),f); toast('COUNTER TIDE!','#7fd4ff',600); return; } }
  // INFERNOTH Living Fortress (MELTDOWN): Obsidian Shell throws back bigger shots too
  if(isInf(f)&&up(f,'fortress')&&f.shellT>game.time&&P&&!small&&fromF&&!src.beamOn){ v8Reflect(f,P,src); burst(f.chest(),0x2a2028,14,12); return; }
  const hp0=f.hp, ab0=f.ab;
  const unbreak=isVal(f)&&up(f,'unbreak')&&!f.F.brawl&&f.atk&&f.atk.id==='ultimate'&&!f.atk.hitT&&!f.atk.miss;           // TIDECREST lunge
  const fort=isInf(f)&&up(f,'fortress')&&(f.stIdx||0)===0&&f.atk&&(f.atk.id==='kpounce'||f.atk.id==='kleap');            // Pounce / Volcano Leap
  if((unbreak||fort)&&fromF) shrugHit(f,()=>oTH.call(f,src,dmg,kb,launch,cont,dir)); else oTH.call(f,src,dmg,kb,launch,cont,dir);
  const lost=hp0-f.hp;
  if(blk){ f.g.blk=(f.g.blk||0)+1; if(big) f.g.bigShield=(f.g.bigShield||0)+1; }
  if(isInf(f)&&ab0!=null&&f.ab<ab0) f.g.shrug=(f.g.shrug||0)+1;
  if(isInf(f)&&big&&lost>0&&!f.dead) f.g.bigTaken=(f.g.bigTaken||0)+1;
  if(fromF&&lost>0){ src.g=src.g||{}; src.g.combo=Math.max(src.g.combo||0,src.combo||0); } }; }

// Ricochet Shield (Sword & Shield): the thrown shield bounces off a building and comes back at the rival, up to 3 hits
{ const o=V8MOVE.shieldthrow; V8MOVE.shieldthrow=function(f,a,dt,pm,o2){ const n=V8.discs.length; o(f,a,dt,pm,o2);
  if(V8.discs.length>n&&up(f,'rico')&&!f.F.brawl){ const D=V8.discs[V8.discs.length-1]; D.rico=2; } }; }
{ const o=discNext; discNext=function(D){
  if(D.rico>0&&D.hit&&D.state==='out'&&!D._aB){ D.rico--; D._aB=1; D.bounces=Math.max(D.bounces,1); o(D);
   if(!D.bTarget){ const a=rand(0,6.28); D.bTarget={x:D.pos.x+Math.cos(a)*24,z:D.pos.z+Math.sin(a)*24,h:14,fake:1}; } D.state='out'; return; }
  if(D._aB){ D._aB=0; D.hit=false; D.state='out'; withF(D.f,()=>burst(D.pos.clone(),0x7fd4ff,10,10)); return; }   // bounced: back at the rival
  return o(D); }; }
{ const o=bHit; bHit=function(b,dmg,dx,dz,hy,by,px,pz){ if(b&&b.fake) return false; const by2=by||CTX.f, was=!!(b&&b.alive); const r=o(b,dmg,dx,dz,hy,by,px,pz);
  if(was&&!b.alive&&by2&&by2.def&&isCore(by2)){ by2.g=by2.g||{}; by2.g.bld=(by2.g.bld||0)+1;
   if(isInf(by2)&&up(by2,'rampage')){ const st=by2.stIdx||0, id=by2.atk&&by2.atk.id;            // Rampage: wrecking the city fills rage
    if((st===0&&['kgrab','kstomp','kfault','kjaw'].includes(id))||(st===1&&(by2.beamOn||id==='mbeam'||id==='heatbeam'))){ addRage(by2,25); if(by2.isPlayer) toast('RAMPAGE! +RAGE','#ffb36b',600); } } }
  return r; }; }
// Ricochet Shield (Brawler): Follow Dash ends by catching the shield and bashing
{ const o=V8MOVE.bdash; V8MOVE.bdash=function(f,a,dt,pm,o2){ o(f,a,dt,pm,o2);
  if(up(f,'rico')&&!a._sb&&a.t>=.2&&canHit(o2)&&dist2(f,o2)<o2.radius()+f.radius()+9){ a._sb=1;
   for(let i=V8.discs.length-1;i>=0;i--){ const D=V8.discs[i]; if(D.f===f&&D.kind!=='portal'){ scene.remove(D.m); V8.discs.splice(i,1); } } if(f.P.v8shield) f.P.v8shield.visible=true;
   const at=o2.chest().lerp(f.chest(),.4); o2.takeHit(f,10*pm,26,6,false,{x:o2.pos.x-f.pos.x+.01,z:o2.pos.z-f.pos.z}); o2.stun=Math.max(o2.stun,.35); clangFX(at); wfxHit(at,9); if(f.isPlayer) toast('SHIELD BASH!','#7fd4ff',500); } }; }
// Tidewall (Brawler): Tide Hook sends a wave that eats shots
{ const o=V8MOVE.thook; V8MOVE.thook=function(f,a,dt,pm,o2){ o(f,a,dt,pm,o2); if(up(f,'tidewall')&&once(a,'tw',a.hitAt||.28)){ const p=fwdP(f,8); LX.waves.push({f,x:p.x,z:p.z,dir:f.yaw,t:.7,r:11}); } }; }
// Unbreakable (Brawler): SHIELD BARRAGE gets a 5th throw. Tidecrest Mastery (Brawler): the last bash hits harder and sends them farther
{ const o=ultBrawl; ultBrawl=function(f,a,dt,pm,o2){ const C=SB12;
  if(a.hitT!=null&&!a.miss&&up(f,'unbreak')){ const k=a.t-a.hitT; if(!a.x5&&k>=C.R4[1]-.04) a.x5={t:0}; if(a.x5&&!a.x5.done){ a.hitT+=dt; a.x5.t+=dt; } }
  const r=o(f,a,dt,pm,o2);
  if(a.x5&&!a.x5.done){ const X=a.x5, q=Math.min(1,X.t/.62); if(!X.m){ X.m=v8DiscMesh(); scene.add(X.m); Snd.whoosh(); }
   const p=f.chest().lerp(o2.chest(),Math.sin(q*Math.PI)); X.m.position.copy(p); X.m.rotation.y+=dt*26; if(f.P.v8shield) f.P.v8shield.visible=false;
   if(Math.random()<dt*30) wfxSprite(Math.random()<.5?'curl':'curlM',p.clone(),8,.35,{grow:.3});
   if(q>=.5&&!X.hit){ X.hit=1; const at=o2.chest(); ultHit(f,o2,6*pm,0,0,null); clangFX(at); wfxHit(at,12); toast('5TH THROW!','#7fd4ff',350); game.shake=Math.max(game.shake,.7); game.hitStop=Math.max(game.hitStop,.06); }
   if(q>=1){ X.done=1; scene.remove(X.m); if(f.P.v8shield) f.P.v8shield.visible=true; Snd.block(); } }
  if(a.fly&&up(f,'tmaster')){ if(!a._tm){ a._tm=1; ultHit(f,o2,12*pm,0,0,null); toast('MASTER BASH!','#ffd43b',400); }
   if(a.t-a.hitT<C.CRASH) o2.pos.addScaledVector(a.fly.dir,110*dt); }
  return r; }; }
// Tidecrest Mastery (Sword & Shield): TIDECREST OATH reaches farther and makes 2 more cuts
const SW13_0=Object.assign({},SW13), SW13_M={CUTS:8,LAND:SW13_0.LAND+.4,CLICK:SW13_0.CLICK+.4,OPEN:SW13_0.OPEN+.4,END:SW13_0.END+.4};
function swSet(m){ Object.assign(SW13,m?SW13_M:{CUTS:SW13_0.CUTS,LAND:SW13_0.LAND,CLICK:SW13_0.CLICK,OPEN:SW13_0.OPEN,END:SW13_0.END}); }
{ const o=ultSword; ultSword=function(f,a,dt,pm,o2){ const m=up(f,'tmaster'); swSet(m); a._tmSW=m; if(m&&a.lg&&!a._far&&a.lg.d>100){ a._far=1; a.lg.d-=60; } return o(f,a,dt,pm,o2); }; }
// Hot Blood (BRAWLER): the bite fills rage
{ const o=V8MOVE.kbite; V8MOVE.kbite=function(f,a,dt,pm,o2){ const h=a._bh; o(f,a,dt,pm,o2); if(!h&&a._bh&&up(f,'hotblood')){ addRage(f,15); burst(f.chest(),0xfff2d0,10,10); } }; }
// Hot Blood (MELTDOWN): Magma Wall fills rage when a shot hits it
// v8.5: the Hot Blood hook on the Magma Wall moved to archive/titan-clash-magma-wall-archive.js (MAGMA SURGE fills rage itself, 46-magma-surge.js)
// Living Fortress (MELTDOWN): Obsidian Shell lasts 2s longer
{ const o=V8MOVE.mshell; V8MOVE.mshell=function(f,a,dt,pm,o2){ const s=a._s; o(f,a,dt,pm,o2); if(!s&&a._s&&up(f,'fortress')) f.shellT+=2; }; }
// King of Monsters (BRAWLER): KING sends them farther, they land in a lava burst. (MELTDOWN): LAVA DOMAIN pins them longer
{ const o=ultKing; ultKing=function(f,a,dt,pm,o2){ const r=o(f,a,dt,pm,o2); if(!up(f,'kingmon')) return r;
  if(a.fly&&!a.flyDone){ a.fly.x+=Math.sin(a.dir)*90*dt; a.fly.z+=Math.cos(a.dir)*90*dt; }
  if(a.flyDone&&!a._km){ a._km=1; const x=o2.pos.x, z=o2.pos.z; aoe(f,o2,x,z,18,12*pm,20,14,INF.ORANGE); lavaPool(x,z,9,f,8*pm,3);
   for(let i=0;i<6;i++){ const g=i/6*Math.PI*2; lavaFountain(x+Math.cos(g)*9,z+Math.sin(g)*9,26,6); } News.add(`${o2.def.name} LANDS IN A BURST OF LAVA!`,true,'ikm',6); }
  return r; }; }
{ const o=ultLava; ultLava=function(f,a,dt,pm,o2){ if(a._cut&&a.contact!=null&&up(f,'kingmon')){ const k=a.t-a.contact; if(k>.6&&(a._pinX||0)<1.2){ a._pinX=(a._pinX||0)+dt; a.contact+=dt; } }
  const r=o(f,a,dt,pm,o2);
  if(up(f,'erupt')&&!a._ee&&KX.round.rain&&KX.round.rain.owner===f&&KX.round.until){ a._ee=1; KX.round.until+=5; }   // Endless Eruption (MELTDOWN): 20s of lava rain
  return r; }; }
// Scorched Earth (BRAWLER): Burrow's spout lasts 3s, the stomp leaves lava cracks
{ const o=V8MOVE.kburrow; V8MOVE.kburrow=function(f,a,dt,pm,o2){ o(f,a,dt,pm,o2); if(up(f,'scorch')) for(const S of INF.spouts) if(S.f===f&&!S._x){ S._x=1; S.t=3; } }; }
{ const o=V8MOVE.kstomp; V8MOVE.kstomp=function(f,a,dt,pm,o2){ const h=a._s; o(f,a,dt,pm,o2); if(h||!a._s) return;
  if(up(f,'rampage')) for(const b of city) if(b.alive&&Math.hypot(b.x-f.pos.x,b.z-f.pos.z)<30*f.scale+Math.max(b.w||0,b.d||0)/2) bHit(b,90,b.x-f.pos.x,b.z-f.pos.z,2,f);
  if(up(f,'scorch')) for(let i=0;i<4;i++){ const g=f.yaw+i*Math.PI/2+.4; for(let j=1;j<=4;j++){ const x=f.pos.x+Math.sin(g)*j*6*f.scale, z=f.pos.z+Math.cos(g)*j*6*f.scale; later(j*.05,()=>lavaPool(x,z,3.4,f,8*pm,4)); } } }; }
// Scorched Earth (MELTDOWN): the heat beam's burning ground lasts twice as long
{ const o=lavaPool; lavaPool=function(x,z,r,owner,dps,life){ const F=CTX.f; if(F&&up(F,'scorch')&&F.atk&&F.atk.id==='mbeam'&&owner===F) life=(life||2.6)*2; return o(x,z,r,owner,dps,life); }; }
// Endless Eruption (BRAWLER): Volcano Leap's eruption ring is twice as big
{ const o=V8MOVE.kleap; V8MOVE.kleap=function(f,a,dt,pm,o2){ const l=a.land; o(f,a,dt,pm,o2); if(!l&&a.land&&up(f,'erupt')){ const r=40*f.scale; aoe(f,o2,f.pos.x,f.pos.z,r,8*pm,20,10,INF.ORANGE);
  for(let i=0;i<12;i++){ const g=i/12*Math.PI*2, x=f.pos.x+Math.sin(g)*r*.85, z=f.pos.z+Math.cos(g)*r*.85; later(.1+i*.03,()=>{ lavaFountain(x,z,20,5); lavaPool(x,z,4,null,0,2); }); } } }; }

/* every frame: block timer, Tidewall water wall, Hero of the City, burn credit, TIDECREST timing */
function upTick(dt){ if(game.mode!=='match') return; let tm=false;
 for(const f of [game.p,game.e]){ if(!f||!isCore(f)) continue; f.g=f.g||{};
  if(f.blocking&&!f._wasBlk) f.blkStart=game.time; f._wasBlk=f.blocking;
  if(isVal(f)&&!f.F.brawl&&up(f,'tidewall')&&f.blocking&&game.time-(f.blkStart||0)>.5&&game.time-(f._twT||0)>.12){ f._twT=game.time;
   withF(f,()=>wfxSprite('crest',f.chest().add(V(Math.sin(f.yaw)*(f.radius()+3)+rand(-3,3),rand(-4,5),Math.cos(f.yaw)*(f.radius()+3)+rand(-3,3))),11,.3,{grow:.2})); }
  const sv=f.saved||0; if(sv>(f._saved0||0)){ const n=sv-(f._saved0||0); f._saved0=sv;
   if(isVal(f)&&up(f,'hero')){ if(f.F.brawl) koAdd(f,8*n); else if(f.guardMax){ f.guard=Math.min(f.guardMax,f.guard+f.guardMax*.12*n); if(f.guardBroken&&f.guard>=f.guardMax*.5) f.guardBroken=false; }
    withF(f,()=>burst(f.chest(),0x7fd4ff,8,8)); } }
  const o=f.opp; if(o&&o.burnT>0&&o.burnBy===f&&game.state==='fight') f.g.burn=(f.g.burn||0)+dt;
  if(f.atk&&f.atk.id==='ultimate'&&f.atk._tmSW) tm=true; }
 swSet(tm); }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ upTick(dt); upHUD(); }catch(e){ console.error(e); } }; }

/* ---------- loadouts: DEFAULT resolves to the titan's normal setup (game select screen + sandbox menu) ---------- */
function loResolve(L,id){ return {sub:L.sub==='default'?'A':L.sub, focus:L.focus==='default'?'hybrid':L.focus, el:L.el==='default'?(({valor:'water',infernoth:'fire'})[id]||V8DEFEL[id]||'fire'):L.el}; }
{ const o=startMatch; startMatch=function(...a){ const r=o.apply(this,a);
  for(const f of [game.p,game.e]) if(f&&f.load&&f.load.el!=='default'&&!V8ELEM[f.load.el]) f.load.el=Object.keys(V8ELEM)[(Math.random()*3)|0];   // the CPU always gets a real element
  for(const f of [game.p,game.e]) lxResetFighter(f); return r; }; }
{ const o=sbReset; sbReset=function(){ o(); if(SB._round) return; for(const f of [game.p,game.e]) lxResetFighter(f); lxClear(); swSet(false); }; }
SB.allUp=false;

/* the upgrade card (top right): path, the 3 upgrades, and how close the next one is */
{ const s=document.createElement('style'); s.textContent=`#sbUp{position:fixed;right:10px;top:292px;z-index:20;background:#05080dcc;border:1px solid #ffffff22;border-radius:10px;padding:5px 10px;font:11px/1.35 Rajdhani,sans-serif;color:#cfe3f5;pointer-events:none;text-align:right;max-width:250px}
#sbUp b{font-family:'Russo One';font-size:10px;letter-spacing:1px;color:#ffd43b}#sbUp .ok{color:#7dff9a}#sbUp .lk{color:#8899aa}#sbUp .pg{color:#ff9f43}
#sbUp .mini{display:none}
@media (pointer:coarse) and (max-height:520px){ #sbUp{top:auto;bottom:6px;right:auto;left:50%;transform:translateX(-50%);font-size:10px;max-width:300px;padding:2px 8px;text-align:center;white-space:nowrap} #sbUp .full{display:none} #sbUp .mini{display:inline} }
body.vcine #sbUp{visibility:hidden}`; document.head.appendChild(s); }
function upHUD(){ const p=game.p; let h=el('sbUp'); if(!p||game.mode!=='match'||!LGOAL[p.def.id]||!p.load){ if(h) h.style.display='none'; return; }
 if(!h){ h=document.createElement('div'); h.id='sbUp'; document.body.appendChild(h); } h.style.display='';
 const L=p.loadRaw||{}, br=V8TREE[p.def.id][p.load.sub||'A'], G=LGOAL[p.def.id][p.load.sub||'A'];
 const tag=(k,v)=>L[k]==='default'?'DEFAULT':v.toUpperCase();
 let s=`<b>${br.n}</b> · ${tag('focus',p.load.focus)} · ${tag('el',p.load.el)}`;
 br.nodes.forEach((n,i)=>{ const got=p.upTier>i; let line=`${i+1} ${n[0]}`;
  if(got) s+=`<br><span class="ok">✓ ${line}</span>`;
  else if(i===0) s+=`<br><span class="lk">${line}</span> <span class="pg">at the start</span>`;
  else { const goal=G[i-1].map(([k,need,lb])=>`${Math.min(need,Math.floor(gv(p,k)))}/${need} ${lb}`).join(' or '); s+=`<br><span class="lk">${line}</span> <span class="pg">${goal}</span>`; } });
 // phone: one short line at the bottom (path, upgrades unlocked, the next goal)
 const nx=p.upTier<3&&p.upTier>0?G[p.upTier-1].map(([k,need,lb])=>`${Math.min(need,Math.floor(gv(p,k)))}/${need} ${lb}`).join(' or '):'';
 const mini=`<b>${br.n}</b> ${'✓'.repeat(p.upTier)}${p.upTier<3&&p.upTier>0?` · next: ${br.nodes[p.upTier][0]} <span class="pg">${nx}</span>`:p.upTier>=3?' · all 3 upgrades':''}`;
 s=`<span class="full">${s}</span><span class="mini">${mini}</span>`;
 if(h._s!==s){ h._s=s; h.innerHTML=s; } }
