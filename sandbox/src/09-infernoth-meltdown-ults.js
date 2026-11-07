/* =====================================================================
   SANDBOX 13 (part 2, Nov 7, 2026): INFERNOTH's MELTDOWN kit + all three ultimates. Sandbox only.
   MELTDOWN (Stone Wall + Zoner): L L L lava spit · M magma wall (blocks shots, burns on touch; one at a time)
   · H eruption (lava geyser under the rival; charge = reaches farther) · Special heat beam with a lava trail
   · GRAB shove-off (throws the rival back out to zoning range)
   · 1 Meteor Spit (3 lava balls) · 2 Obsidian Shell (half damage, reflects small shots) · 3 Volcano Core.
   ULTIMATES (announce card on press with the intro line; cutscene + quote only if it lands):
   - BRAWLER: KING. "THIS IS MY LAND." Charge, grab, climb a skyscraper, pile-drive them off the top. "BOW TO YOUR KING."
   - MELTDOWN: LAVA DOMAIN. "KNEEL." Aimed heat beam blasts them away, then he fires it into the sky:
     lava rains for the rest of the round (glowing shadows first). Full damage to non-fire titans, less to fire ones,
     none to INFERNOTH. Red-orange sky. "I AM KING OF ALL."
   - SECRET: GROUND ZERO (ultimate ready AND in rage; not in the move list). "YOU CANNOT HIDE." Grab, then his whole
     body detonates (like Vegeta's Final Explosion): wipes out the area, takes about 75% of the rival's max health
     (a hurt rival is finished, a healthy one can survive), and leaves INFERNOTH at 1 HP. Landed: "FATE WILL DECIDE NOW!"
     in raged text that cracks into a roar. The screen stays cracked and the sky orange-red for the rest of the MATCH;
     used in round 2 or 3, fireballs rain for the rest of the match and they hurt INFERNOTH too. A miss uses it up.
   Kaiju lines only show as words when you're playing a kaiju (otherwise they roar).
   ===================================================================== */
const KX={rocks:[],patches:[],walls:[],blobs:[],bombs:[],match:{},round:{}};
const elOf=f=>(f&&f.load&&f.load.el)||V8DEFEL[f&&f.def&&f.def.id];

/* ---------- MELTDOWN stance ---------- */
{ const D=V8DEFS.find(d=>d.id==='infernoth'), s1=D.stances[1];
  D.stances[1]=ST('MELTDOWN',{speed:s1.speed,power:1.2,armor:.9,grab:false,jump:16,J:'mspit',M:'mwall',K:'merupt',L:'mbeam',hot:true});
  D.forms=[D.stances[0],D.stances[1]]; }
STRINGS['infernoth:1']={ L:{id:'mspit',c:0}, LL:{id:'mspit',c:1}, LLL:{id:'mspit',c:2,end:1},
 LLM:{id:'mwall',end:1}, LLH:{id:'merupt',end:1}, LM:{id:'mwall'}, LH:{id:'merupt',end:1}, M:{id:'mwall'}, MH:{id:'merupt',end:1} };
LIGHT.push('mspit');
Object.assign(MOVES,{
 mspit:{name:'Lava Spit',dur:.5,hitAt:.25,moveMul:.2,anim:'mspitp'},
 mwall:{name:'Magma Wall',dur:.8,hitAt:.45,moveMul:0,anim:'kstomp'},
 merupt:{name:'Eruption',dur:.9,hitAt:.45,moveMul:0,anim:'kstomp',holdP:.2},
 mbeam:Object.assign({},MOVES.heatbeam,{name:'Heat Beam (lava trail)'}),
 mshove:{name:'Shove-Off',dur:.6,hitAt:.25,moveMul:0,anim:'kgrabp',noCharge:true},
 mmeteor:{name:'Meteor Spit',dur:.7,ranged:1,moveMul:.2,anim:'mspitp',noCharge:true},
 mshell:{name:'Obsidian Shell',dur:.5,moveMul:0,anim:'mshellp',noCharge:true},
 mcore:{name:'Volcano Core',dur:3.6,moveMul:0,anim:'mcorep',noCharge:true},
});
SKILLS_ST.infernoth[1]=[{id:'mmeteor',cd:7,cost:20,r:80},{id:'mshell',cd:14,cost:20,r:30},{id:'mcore',cd:18,cost:40,r:40}];
// GRAB in MELTDOWN = shove-off
{ const o=v8Input; v8Input=function(f,inp,dt){
  if(isInf(f)&&inp.grab>0&&(f.stIdx||0)===1){ const canAct=!f.dead&&f.stun<=0&&game.state==='fight'&&f.rollT<=0&&!f.grabbedBy; inp.grab=0; if(canAct&&!f.atk) f.startAtk('mshove'); }
  return o(f,inp,dt); }; }

/* falling lava (meteors, volcano core bombs, lava rain, fireball rain): glowing shadow first, then the hit */
function dropRock(x,z,o){ const r=o.r||6, ring0=new THREE.Mesh(new THREE.RingGeometry(r*.75,r,28),new THREE.MeshBasicMaterial({color:o.col||INF.ORANGE,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide}));
 ring0.rotation.x=-Math.PI/2; ring0.position.set(x,.2,z); scene.add(ring0); KX.rocks.push(Object.assign({x,z,r,t:o.warn||.8,m:ring0},o)); }
function rockHit(R){ scene.remove(R.m); R.m.geometry.dispose(); R.m.material.dispose();
 pillar(R.x,R.z,R.r*.45,R.col||INF.ORANGE,.5,45); lava(V(R.x,2,R.z),12,16); dust(R.x,R.z,R.r*.6,4); Snd.thud&&Snd.thud();
 for(const t of [game.p,game.e]){ if(!t||!canHit(t)||t.pos.y>12) continue; if(Math.hypot(t.pos.x-R.x,t.pos.z-R.z)>R.r+t.radius()*.4) continue;
  let k=1; if(R.immune&&t===R.immune) continue; if(R.fireHalf&&elOf(t)==='fire') k=.5;
  const s0=t.stun; t.takeHit(R.owner||HZ,R.dmg*k,R.kb||6,R.ln||4,false,{x:t.pos.x-R.x+.01,z:t.pos.z-R.z}); if(R.noStun) t.stun=s0; }
 if(R.bld) for(const b of city) if(b.alive&&Math.hypot(b.x-R.x,b.z-R.z)<R.r+Math.max(b.w,b.d)/2) bHit(b,R.bld,0,0,b.h*.5,R.owner||HZ); }

/* ---------- MELTDOWN moves ---------- */
Object.assign(V8MOVE,{
 mspit(f,a,dt,pm,o){ if(once(a,'s',a.hitAt)){ const c=a.chain||0, from=f.chest().add(V(Math.sin(f.yaw)*5,2,Math.cos(f.yaw)*5));
   let yaw=f.yaw; if(canHit(o)&&dist2(f,o)<60) yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z);
   const m=new THREE.Mesh(new THREE.SphereGeometry(c===2?1.6:1.1,8,6),glowM(INF.ORANGE,2.6)); m.position.copy(from); scene.add(m);
   KX.blobs.push({f,m,vel:V(Math.sin(yaw)*70,0,Math.cos(yaw)*70),t:c===2?.7:.55,dmg:(c===2?9:5)*pm,big:c===2}); Snd.tone('sawtooth',160,60,.15,.05); } },
 mwall(f,a,dt,pm,o){ if(once(a,'w',a.hitAt)){ for(const W of KX.walls) if(W.f===f) W.t=Math.min(W.t,.3);   // one wall at a time
   const c=fwd(f,12*f.scale), w=24, g=new THREE.Mesh(new THREE.BoxGeometry(w,9,2.2),glowM(INF.ORANGE,1.8)); g.position.set(c.x,-4,c.z); g.rotation.y=f.yaw; scene.add(g);
   KX.walls.push({f,x:c.x,z:c.z,yaw:f.yaw,w,t:4,m:g,dps:14*pm}); dust(c.x,c.z,8,8); Snd.boom(); game.shake=Math.max(game.shake,.4); } },
 merupt(f,a,dt,pm,o){ const c=a.chg||0;
  if(once(a,'e',a.hitAt)){ const rng=40+30*c; const ok=canHit(o)&&dist2(f,o)<rng; const at=ok?V(o.pos.x,0,o.pos.z):fwd(f,Math.min(rng,30));
   dropRock(at.x,at.z,{r:8+2*c,warn:.35,dmg:(15+6*c)*pm,kb:10,ln:20,owner:f,immune:f,col:0xffb347,bld:60}); Snd.thud&&Snd.thud(); game.shake=Math.max(game.shake,.4); } },
 mbeam(f,a,dt,pm,o){ if(a.on==null){ a.on=.7; a.off=2.2; a.dur=a.off+.2; }
  V8MOVE.heatbeam(f,a,dt,pm,o);
  if(a.t>=a.on&&a.t<a.off&&game.time-(a._tr||0)>.14){ a._tr=game.time; const d=canHit(o)?clamp(dist2(f,o),14,80):55, p=fwd(f,d);
   const m=new THREE.Mesh(new THREE.CircleGeometry(5,18),new THREE.MeshBasicMaterial({color:INF.ORANGE,transparent:true,opacity:.6,depthWrite:false}));
   m.rotation.x=-Math.PI/2; m.position.set(p.x,.12,p.z); scene.add(m); KX.patches.push({f,x:p.x,z:p.z,r:5,t:3,m,dps:10*pm}); } },
 mshove(f,a,dt,pm,o){ if(!a.held&&!a.miss){ if(once(a,'g',a.hitAt)){ if(inFront(f,o,13,.9)){ a.held=true; a.gT=a.t; a.dur=a.t+.45; Snd.crunch&&Snd.crunch(); } else whiff(f,a,.45); } return; }
  if(a.held){ if(a.t-a.gT<.2) holdAt(f,o,9,3); else if(once(a,'t',a.gT+.2)){ grabHit(f,o,10*pm,70,10,{x:Math.sin(f.yaw),z:Math.cos(f.yaw)}); lava(o.chest(),14,14); Snd.whoosh(); } } },
 mmeteor(f,a,dt,pm,o){ if(once(a,'m',.3)){ const c=canHit(o)&&dist2(f,o)<90?V(o.pos.x,0,o.pos.z):fwd(f,40);
   for(let i=0;i<3;i++){ const an=rand(0,6.28), rr=i?rand(5,11):0; dropRock(c.x+Math.cos(an)*rr,c.z+Math.sin(an)*rr,{r:7,warn:.75+i*.18,dmg:10*pm,kb:8,ln:6,owner:f,immune:f,bld:30}); }
   Snd.tone('sawtooth',120,500,.3,.08); } },
 mshell(f,a,dt,pm,o){ if(once(a,'s',.2)){ f.shellT=game.time+4; burst(f.chest(),0x1a1418,40,16); toast(f.isPlayer?'OBSIDIAN SHELL!':'INFERNOTH HARDENS INTO ROCK!','#cbd5e1',800); Snd.crunch&&Snd.crunch(); } },
 mcore(f,a,dt,pm,o){ f.kb.set(0,0,0); if(a.t<.4) return; if(game.time-(a._b||0)>.22){ a._b=game.time;
   const near=canHit(o)&&dist2(f,o)<55&&Math.random()<.35, an=rand(0,6.28), rr=rand(10,40), x=near?o.pos.x+rand(-6,6):f.pos.x+Math.cos(an)*rr, z=near?o.pos.z+rand(-6,6):f.pos.z+Math.sin(an)*rr;
   dropRock(x,z,{r:6,warn:.6,dmg:6*pm,kb:6,ln:5,owner:f,immune:f,bld:25}); lava(f.chest().add(V(0,6,0)),6,22); }
  if(once(a,'r',.4)){ Snd.roar&&Snd.roar(); News.add('INFERNOTH HAS BECOME A LIVING VOLCANO!',true,'icore',8); } },
});
// Obsidian Shell: half damage, small shots bounce back
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  if(isInf(this)&&this.shellT>game.time&&!this.dead){ const P=V8.proj, small=!!(P&&P.r<=3&&!P.pierce)&&src&&src.def&&src!==HZ;
   if(small){ burst(this.chest(),0x2a2028,10,10); if(canHit(src)){ const s0=src.stun; src.takeHit(this,dmg*.6,4,0,false); src.stun=s0; } return; }
   dmg*=.5; kb*=.5; }
  return oTH.call(this,src,dmg,kb,launch,cont,dir); }; }

POSES.mspitp=(k,p,e)=>{ const w=ez(ph(p,0,.45)), s=ez(ph(p,.45,.6)); k.headX=lerp(lerp(0,-.35,w),.3,s); k.jaw=lerp(lerp(0,1.2,w),.3,s); k.lean=lerp(-.1,.2,s); k.armL=k.armR=-.6; };
POSES.mshellp=(k,p,e)=>{ k.armL=k.armR=-1.2*e; k.azL=.5*e; k.azR=-.5*e; k.lean=.35*e; k.knL=k.knR=.6*e; k.headX=.3*e; };
POSES.mcorep=(k,p,e)=>{ k.armL=k.armR=-2.7; k.azL=-.8; k.azR=.8; k.headX=-.5; k.jaw=1.2; k.lean=-.25; k.knL=k.knR=.4; };

/* ---------- ULTIMATES ---------- */
const KULT={ king:{name:'KING',intro:'THIS IS MY LAND.',quote:'BOW TO YOUR KING.'},
 lava:{name:'LAVA DOMAIN',intro:'KNEEL.',quote:'I AM KING OF ALL.'},
 gz:{name:'GROUND ZERO',intro:'YOU CANNOT HIDE.',quote:'FATE WILL DECIDE NOW!'} };
const kKind=f=>f.kRageT>0?'gz':(f.stIdx||0)===1?'lava':'king';
const kSay=(f,txt)=>canUnderstand(f).ok?txt:'GRRRAAAAAAHHH!!!';
{ const oS=v8UltStart; v8UltStart=function(f){ if(!isInf(f)) return oS(f); const k=kKind(f), U=KULT[k]; f._ult=k; f.def.ultName=U.name; V8SAY.infernoth=[U.intro];
  if(k==='gz'){ f.kRageT=Math.max(f.kRageT,6); News.add('INFERNOTH IS GLOWING BRIGHTER THAN THE SUN. EVACUATE NOW.',true,'igz',8); }
  oS(f); if(f.isPlayer||game.vs2) toast(k==='lava'?'AIM THE BEAM!':'GET CLOSE TO GRAB THEM!','#ffb36b',900); }; }
function kCineStart(f,a,kind){ if(a._cut) return; a._cut=1; a.contact=a.t;
 CINE.on=true; CINE.side=false; CINE.f=f; CINE.o=f.opp; CINE.a=a; CINE.inf=kind; CINE.t0=a.t; CINE.shot=-1; CINE.brawl=false;
 cineEl.classList.add('on'); cineEl.classList.remove('comic'); document.body.classList.add('vcine');
 const q=kSay(f,KULT[kind].quote); cq.classList.toggle('kraged',kind==='gz'); cinePop(cq,q); cineFreeze(1100,.6);
 if(kind==='gz'){ const tok=game.token; setTimeout(()=>{ if(tok!==game.token||!CINE.on) return; cq.textContent='FATE WILL DECI—'; setTimeout(()=>{ if(tok!==game.token||!CINE.on) return; cinePop(cq,'GRRRAAAAAAAHHHH!!!'); Snd.roar&&Snd.roar(); },350); },1100); } Snd.roar&&Snd.roar(); }
{ const s=document.createElement('style'); s.textContent=`#vcine .q.kraged{color:#fff2d0;-webkit-text-stroke:3px #7a1a00;text-shadow:0 0 18px #ff5a1a,0 0 40px #ff2a00;animation:kshake .08s infinite,vq .35s forwards}
@keyframes kshake{0%{translate:-3px 2px}50%{translate:3px -2px}100%{translate:-2px -3px}}
#kcrack{position:fixed;inset:0;z-index:18;pointer-events:none;display:none}#kcrack.on{display:block}`; document.head.appendChild(s); }
// the cracked screen (GROUND ZERO, for the rest of the match)
const crackEl=document.createElement('div'); crackEl.id='kcrack'; document.body.appendChild(crackEl);
function drawCracks(){ const W=1000,H=600, cx=rand(380,620), cy=rand(220,380); let d='';
 for(let i=0;i<14;i++){ let x=cx,y=cy; const an=i/14*Math.PI*2+rand(-.2,.2); d+=`M${x} ${y}`; for(let j=0;j<6;j++){ x+=Math.cos(an+rand(-.5,.5))*rand(40,110); y+=Math.sin(an+rand(-.5,.5))*rand(30,90); d+=` L${x|0} ${y|0}`; } }
 for(let r of [40,90,150]){ d+=` M${cx+r} ${cy}`; for(let k=1;k<=12;k++){ const an=k/12*Math.PI*2; d+=` L${(cx+Math.cos(an)*r*rand(.85,1.15))|0} ${(cy+Math.sin(an)*r*rand(.85,1.15))|0}`; } }
 crackEl.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="100%"><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.2"/><path d="${d}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="5" transform="translate(2 2)"/></svg>`; }

{ const oU=v8UltUpdate; v8UltUpdate=function(f,a,dt,pm,o){ if(!isInf(f)) return oU(f,a,dt,pm,o); const k=f._ult||'king';
  if(!a._init){ a._init=1; a.dur=6; }
  return k==='king'?ultKing(f,a,dt,pm,o):k==='lava'?ultLava(f,a,dt,pm,o):ultGZ(f,a,dt,pm,o); }; }

/* KING: charge, grab, climb a skyscraper, pile-drive off the top */
function ultKing(f,a,dt,pm,o){ const t=a.t;
 if(!a._cut){ if(t<.35){ f.setGlow(2+t*4); return; } if(a.miss) return;
  f.kb.x=Math.sin(f.yaw)*85; f.kb.z=Math.cos(f.yaw)*85; if(Math.random()<dt*20) dust(f.pos.x,f.pos.z,4,2);
  if(canHit(o)&&inFront(f,o,13,1)){ f.kb.set(0,0,0); let b=null, bh=0; for(const B of city){ if(!B.alive) continue; const d=Math.hypot(B.x-f.pos.x,B.z-f.pos.z); if(d<90&&B.h>bh){ bh=B.h; b=B; } }
   a.tower=b?{x:b.x,z:b.z,h:Math.max(30,b.h),b}:{x:f.pos.x+Math.sin(f.yaw)*20,z:f.pos.z+Math.cos(f.yaw)*20,h:40}; a.start=f.pos.clone(); kCineStart(f,a,'king'); }
  else if(t>1.35) ultMiss(f,a,t); return; }
 const k=t-a.contact, T=a.tower;
 if(k<.6){ holdAt(f,o,8,6); f.setGlow(3); return; }                                                     // grab
 if(k<2.0){ const q=ez((k-.6)/1.4); f.pos.x=lerp(a.start.x,T.x-Math.sin(f.yaw)*4,q); f.pos.z=lerp(a.start.z,T.z-Math.cos(f.yaw)*4,q); f.pos.y=T.h*q; f.vy=0; f.onGround=false; f.kb.set(0,0,0);
  o.pos.set(f.pos.x,f.pos.y+18*f.scale,f.pos.z); o.vy=0; o.kb.set(0,0,0); o.stun=Math.max(o.stun,.3); if(Math.random()<dt*14) dust(f.pos.x,f.pos.z,3,2); return; }   // climb, rival over his head
 if(k<2.5){ f.pos.y=T.h; f.vy=0; o.pos.set(f.pos.x,f.pos.y+18*f.scale,f.pos.z); o.stun=Math.max(o.stun,.3); if(once(a,'roar',a.contact+2.05)){ Snd.roar&&Snd.roar(); game.shake=Math.max(game.shake,.6); } return; } // roar on top
 if(!a.drop){ a.drop={x:T.x+Math.sin(f.yaw)*26,z:T.z+Math.cos(f.yaw)*26,y0:T.h}; }
 if(k<3.05){ const q=(k-2.5)/.55; f.pos.x=lerp(T.x,a.drop.x,q); f.pos.z=lerp(T.z,a.drop.z,q); f.pos.y=a.drop.y0*(1-q*q)+6*q; f.vy=0; o.pos.set(f.pos.x+Math.sin(f.yaw)*4,f.pos.y-4,f.pos.z+Math.cos(f.yaw)*4); o.stun=Math.max(o.stun,.3); return; }
 if(once(a,'slam',a.contact+3.05)){ f.pos.y=0; f.onGround=true; o.pos.y=0; const s0=o.launchImm; o.launchImm=0; ultHit(f,o,62*pm,30,14); o.launchImm=s0;
  aoe(f,o,f.pos.x,f.pos.z,26,0,20,0,INF.ORANGE); dust(f.pos.x,f.pos.z,20,26); for(const B of city) if(B.alive&&Math.hypot(B.x-f.pos.x,B.z-f.pos.z)<30) bHit(B,180,0,0,4,f);
  game.shake=Math.max(game.shake,1.6); Snd.boom(); cineFlash(); News.add(`INFERNOTH PILE-DRIVES ${o.def.name} OFF A SKYSCRAPER!`,true,'iking',8); a.dur=a.t+.8; } }

/* LAVA DOMAIN: aimed heat beam, then the beam goes into the sky and lava rains for the rest of the round */
function kBeamMesh(a,from,to,w){ if(!a.bm){ a.bm=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,10,1,true),new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false})); scene.add(a.bm); }
 const len=from.distanceTo(to); a.bm.scale.set(w,len,w); a.bm.position.copy(from).lerp(to,.5); a.bm.lookAt(to); a.bm.rotateX(Math.PI/2); }
function kBeamOff(a){ if(a.bm){ scene.remove(a.bm); a.bm.geometry.dispose(); a.bm.material.dispose(); a.bm=null; } }
function ultLava(f,a,dt,pm,o){ const t=a.t, mouth=f.chest().add(V(Math.sin(f.yaw)*5,4,Math.cos(f.yaw)*5));
 if(!a._cut){ f.kb.set(0,0,0); if(t<.7){ f.setGlow(1+t*5); if(Math.random()<dt*30) burst(mouth,INF.ORANGE,2,4); return; }
  if(a.miss){ kBeamOff(a); return; }
  const end=mouth.clone().add(V(Math.sin(f.yaw)*120,-mouth.y*.6,Math.cos(f.yaw)*120)); kBeamMesh(a,mouth,end,2.4);
  if(canHit(o)){ const dx=o.pos.x-f.pos.x, dz=o.pos.z-f.pos.z, d=Math.hypot(dx,dz); if(d<125&&Math.abs(angDiff(f.yaw,Math.atan2(dx,dz)))<Math.atan2(6+o.radius(),d)+.06){
    kBeamOff(a); const s0=o.launchImm; o.launchImm=0; ultHit(f,o,40*pm,120,26); o.launchImm=s0; lava(o.chest(),40,26); kCineStart(f,a,'lava'); a.skyT=null; return; } }
  if(t>1.7){ kBeamOff(a); ultMiss(f,a,t); } return; }
 const k=t-a.contact;
 if(k<.9) return;                                                                         // watch them fly
 if(k<2.4){ if(!a.skyT){ a.skyT=1; Snd.roar&&Snd.roar(); } const top=mouth.clone().add(V(0,400,0)); kBeamMesh(a,mouth,top,3+Math.sin(game.time*40)*.4); f.setGlow(4); game.shake=Math.max(game.shake,.5); return; }
 if(once(a,'rain',a.contact+2.4)){ kBeamOff(a); cineFlash(); KX.round.sky=0xff4a14; KX.round.rain={owner:f,immune:f,fireHalf:true,dmg:7*pm,every:.3,col:INF.ORANGE};
  News.add('THE SKY IS RAINING LAVA OVER NEON CITY!',true,'ilava',10); a.dur=a.t+.5; } }

/* GROUND ZERO: grab, then he detonates. 75% of the rival's max health, he drops to 1 HP. */
function ultGZ(f,a,dt,pm,o){ const t=a.t;
 if(!a._cut){ if(t<.3){ f.setGlow(4); return; } if(a.miss) return;
  f.kb.x=Math.sin(f.yaw)*60; f.kb.z=Math.cos(f.yaw)*60;
  if(canHit(o)&&inFront(f,o,15,1.1)){ f.kb.set(0,0,0); kCineStart(f,a,'gz'); }
  else if(t>1.1){ ultMiss(f,a,t); if(f.isPlayer) toast('GROUND ZERO MISSED. IT\'S GONE.','#ff6b6b',1100); } return; }
 const k=t-a.contact;
 if(k<1.6){ holdAt(f,o,7,3); f.setGlow(4+k*4); f.kRageT=Math.max(f.kRageT,1); if(Math.random()<dt*40) burst(f.chest().add(V(rand(-6,6),rand(-4,8),rand(-6,6))),Math.random()<.5?INF.WHITE:INF.ORANGE,3,12); game.shake=Math.max(game.shake,k*.5); return; }
 if(once(a,'boom',a.contact+1.6)){ const R=95, x=f.pos.x, z=f.pos.z;
  const ball=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:INF.WHITE,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false})); ball.position.set(x,8,z); scene.add(ball); a.ball=ball;
  for(const B of city) if(B.alive&&Math.hypot(B.x-x,B.z-z)<R) bHit(B,(B.hp||400)+100,B.x-x,B.z-z,B.h*.5,f);
  propsBlast&&propsBlast(x,0,z,R); peopleBlast&&peopleBlast(x,z,R);
  const before=o.hp, want=o.def.hp*.75; const s0=o.launchImm; o.launchImm=0;
  if(before<=want) o.takeHit(f,99999,140,30,false,{x:o.pos.x-x+.01,z:o.pos.z-z});
  else { o.takeHit(f,1,140,30,false,{x:o.pos.x-x+.01,z:o.pos.z-z}); o.hp=Math.max(1,before-want); }
  o.launchImm=s0; f.hp=1; f.kRageT=0; f.kRage=0;
  KX.match.sky=0xff5a1a; KX.match.crack=true; drawCracks(); crackEl.classList.add('on');
  if(game.round>=2) KX.match.rain={owner:null,immune:null,fireHalf:false,dmg:6,every:.45,col:0xff3a10,hurtAll:true};
  game.shake=3; Snd.boom(); Snd.boom(); cineFlash(); News.add('GROUND ZERO. INFERNOTH HAS LEVELED THE DISTRICT.',true,'igz2',12); a.dur=a.t+1.6; }
 if(a.ball){ const q=Math.min(1,(k-1.6)/.9); a.ball.scale.setScalar(5+q*90); a.ball.material.opacity=.95*(1-q*.85); if(q>=1){ scene.remove(a.ball); a.ball=null; } } }

// the INFERNOTH cutscene camera (uses the same cutscene frame as VALOR's)
{ const oC=cineCam; cineCam=function(){ if(!CINE.inf) return oC(); const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o) return;
  const k=a.t-(a.contact||a.t), fy=f.yaw, fw=V(Math.sin(fy),0,Math.cos(fy)), side=V(Math.cos(fy),0,-Math.sin(fy)), fc=f.chest(), oc=o.chest(), s=f.scale||1;
  if(CINE.inf==='king'){
   if(k<.6){ camAt(fc.clone().addScaledVector(fw,26*s).addScaledVector(side,8).add(V(0,-4,0)),fc.clone().add(V(0,4,0))); return; }
   if(k<2.0){ if(cineShot(1)) cq.classList.remove('show'); camAt(V(f.pos.x+side.x*30,Math.max(3,f.pos.y-14),f.pos.z+side.z*30),fc.clone().add(V(0,10,0))); return; }          // looking up as he climbs
   if(k<2.5){ cineShot(2); camAt(V(f.pos.x+fw.x*40+side.x*20,f.pos.y+30,f.pos.z+fw.z*40+side.z*20),fc); return; }                                                        // on top, the city below
   if(k<3.1){ cineShot(3); camAt(V(a.drop.x+side.x*45,4,a.drop.z+side.z*45),fc); return; }                                                                                 // the fall
   cineShot(4); camAt(V(f.pos.x+fw.x*35+side.x*25,12,f.pos.z+fw.z*35+side.z*25),fc); if(k>3.8||!f.atk||f.atk.id!=='ultimate') cineEnd(); return; }
  if(CINE.inf==='lava'){
   if(k<.9){ camAt(V(o.pos.x+side.x*50,oc.y+8,o.pos.z+side.z*50),oc); return; }                                                                                             // the rival blasted away
   if(k<2.4){ if(cineShot(1)) cq.classList.remove('show'); camAt(V(f.pos.x+fw.x*28+side.x*10,2,f.pos.z+fw.z*28+side.z*10),fc.clone().add(V(0,40+k*30,0))); return; }    // low, looking up: the beam into the sky
   cineShot(2); camAt(V(f.pos.x+side.x*90,60,f.pos.z+side.z*90),V(f.pos.x,30,f.pos.z)); if(k>2.9||!f.atk||f.atk.id!=='ultimate') cineEnd(); return; }                     // wide: the sky breaks
  // GROUND ZERO
  if(k<1.6){ const g=k*.6; camAt(V(f.pos.x+Math.sin(fy+g)*30*s,fc.y+2,f.pos.z+Math.cos(fy+g)*30*s),fc); return; }
  if(cineShot(1)){ cq.classList.remove('show'); }
  camAt(V(f.pos.x+side.x*200,70,f.pos.z+side.z*200),V(f.pos.x,20,f.pos.z)); if(k>3.0||!f.atk||f.atk.id!=='ultimate') cineEnd(); }; }
{ const o=cineEnd; cineEnd=function(){ if(CINE.inf){ CINE.inf=null; cq.classList.remove('kraged'); } return o(); }; }

/* ---------- every frame: spit blobs, walls, trail patches, falling rocks, rain, sky ---------- */
function kxTick(dt){ if(game.mode!=='match') return; const fight=game.state==='fight';
 for(let i=KX.blobs.length-1;i>=0;i--){ const B=KX.blobs[i], o=B.f.opp; B.t-=dt; B.m.position.addScaledVector(B.vel,dt); let done=B.t<=0;
  if(o&&canHit(o)&&B.m.position.distanceTo(o.chest())<o.radius()+3){ V8.proj={r:3.2,mesh:B.m}; /* big enough that the auto-shield doesn't eat it; holding block still works */ try{ o.takeHit(B.f,B.dmg,B.big?14:5,0,false,{x:B.vel.x,z:B.vel.z}); } finally{ V8.proj=null; } if(B.big){ o.burnT=Math.max(o.burnT||0,1.5); o.burnBy=B.f; } lava(B.m.position.clone(),8,10); done=true; }
  for(const W of KX.walls) if(W.f!==B.f&&wallHit(W,B.m.position)) done=true;
  if(done){ scene.remove(B.m); B.m.geometry.dispose(); KX.blobs.splice(i,1); } }
 for(let i=KX.walls.length-1;i>=0;i--){ const W=KX.walls[i], o=W.f.opp; W.t-=dt; W.m.position.y=Math.min(4.5,W.m.position.y+dt*30); if(W.t<.3) W.m.position.y-=dt*30;
  for(let j=projs.length-1;j>=0;j--){ const p=projs[j]; if(p.owner!==W.f&&wallHit(W,p.mesh.position)){ burst(p.mesh.position.clone(),INF.ORANGE,8,10); p.life=0; } }   // blocks shots
  if(o&&canHit(o)&&wallHit(W,o.pos.clone().setY(3),o.radius()*.6)){ const s0=o.stun; o.takeHit(W.f,W.dps*dt,0,0,true,{x:0,z:1}); o.stun=s0; const nx=Math.sin(W.yaw), nz=Math.cos(W.yaw), side=(o.pos.x-W.x)*nx+(o.pos.z-W.z)*nz>0?1:-1; o.kb.x+=nx*side*40*dt*10; o.kb.z+=nz*side*40*dt*10; }
  if(W.t<=0){ scene.remove(W.m); W.m.geometry.dispose(); KX.walls.splice(i,1); } }
 for(let i=KX.patches.length-1;i>=0;i--){ const P=KX.patches[i], o=P.f.opp; P.t-=dt; P.m.material.opacity=Math.min(.6,P.t*.4);
  if(o&&canHit(o)&&o.pos.y<4&&Math.hypot(o.pos.x-P.x,o.pos.z-P.z)<P.r+o.radius()*.4){ const s0=o.stun; o.takeHit(P.f,P.dps*dt,0,0,true,{x:0,z:1}); o.stun=s0; }
  if(Math.random()<dt*3) burst(V(P.x,1,P.z),INF.ORANGE,1,5);
  if(P.t<=0){ scene.remove(P.m); P.m.geometry.dispose(); KX.patches.splice(i,1); } }
 for(let i=KX.rocks.length-1;i>=0;i--){ const R=KX.rocks[i]; R.t-=dt; R.m.material.opacity=.35+.4*Math.abs(Math.sin(game.time*12)); if(R.t<=0){ KX.rocks.splice(i,1); rockHit(R); } }
 for(const RN of [KX.round.rain,KX.match.rain]){ if(!RN||!fight) continue; RN.acc=(RN.acc||0)+dt; if(RN.acc<RN.every) continue; RN.acc=0;
  const tg=[game.p,game.e][(Math.random()*2)|0], near=Math.random()<.5&&tg, an=rand(0,6.28), rr=rand(0,ARENA*.7);
  dropRock(near?tg.pos.x+rand(-14,14):Math.cos(an)*rr, near?tg.pos.z+rand(-14,14):Math.sin(an)*rr,{r:6,warn:.9,dmg:RN.dmg,kb:6,ln:4,owner:RN.owner,immune:RN.hurtAll?null:RN.immune,fireHalf:RN.fireHalf,col:RN.col,noStun:true,bld:20}); }
 const sky=KX.match.sky||KX.round.sky; if(sky){ const c=new THREE.Color(sky); scene.background.lerp(c.clone().multiplyScalar(.45),Math.min(1,dt*1.5)); scene.fog.color.lerp(c.clone().multiplyScalar(.35),Math.min(1,dt*1.5)); }
 crackEl.classList.toggle('on',!!KX.match.crack); }
function wallHit(W,p,pad){ const nx=Math.sin(W.yaw), nz=Math.cos(W.yaw), dx=p.x-W.x, dz=p.z-W.z, along=dx*nz-dz*nx, across=dx*nx+dz*nz;
 return Math.abs(along)<W.w/2&&Math.abs(across)<1.6+(pad||0)&&p.y<10&&W.m.position.y>0; }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ kxTick(dt); }catch(e){ console.error(e); } }; }
function kxClear(all){ for(const L of [KX.blobs,KX.walls,KX.patches]){ for(const x of L){ scene.remove(x.m); x.m.geometry&&x.m.geometry.dispose(); } L.length=0; }
 for(const R of KX.rocks){ scene.remove(R.m); } KX.rocks.length=0; KX.round={}; if(all){ KX.match={}; crackEl.classList.remove('on'); } }
{ const o=startRound; startRound=function(...a){ kxClear(false); return o.apply(this,a); }; }
{ const o=startMatch; startMatch=function(...a){ kxClear(true); return o.apply(this,a); }; }
{ const oR=sbReset; sbReset=function(){ if(!SB._round) kxClear(true); for(const f of [game.p,game.e]) if(f) f.shellT=0; oR(); }; }
// GROUND ZERO stays a secret: it is not in the move list
