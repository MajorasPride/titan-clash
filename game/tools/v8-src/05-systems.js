/* ---- V8 ULTIMATES (below 25% health, once per match, SUPER button) ---- */
function v8UltStart(f){ banner(f.def.ultName+'!',1600); flashScreen(f.def.css); News.add(`${f.def.name} UNLEASHES ITS ULTIMATE: ${f.def.ultName}!`,true); Snd.roar(); Snd.mech(); game.timeScale=.35; const tok=game.token; setTimeout(()=>{ if(tok===game.token&&game.state==='fight') game.timeScale=1; },650); game.shake=Math.max(game.shake,.8); }
function v8UltUpdate(f,a,dt,pm,o){ const id=f.def.id, x=()=>o.pos.x, z=()=>o.pos.z, c=f.def.glow;
 if(Math.random()<dt*20) burst(f.chest(),c,2,8); f.setGlow(2.5+Math.sin(game.time*20));
 if(id==='valor'){ for(let i=0;i<5;i++) if(once(a,'s'+i,.3+i*.2)){ strike(x()+rand(-5,5),z()+rand(-5,5),6,6*pm,4,f,o,0x7fd4ff,0,8); }
  if(once(a,'b',1.6)){ f.yaw=Math.atan2(x()-f.pos.x,z()-f.pos.z); wave(f,o,{speed:130,width:18,dmg:40*pm,kb:90,launch:24,color:0x7fd4ff,hh:9,life:1.3}); flashScreen('#7fd4ff'); game.shake=1.4; } }
 if(id==='ashvin'){ if(a.t>.3&&a.t<1.5&&canHit(o)){ o.stun=Math.max(o.stun,.4); o.vy=0; o.pos.y=lerp(o.pos.y,30,dt*3); o.onGround=false; if(Math.random()<.5) burst(o.chest(),0xd58bff,2,6); }
  for(let i=0;i<3;i++) if(once(a,'p'+i,.5+i*.3)) ring(x(),o.pos.y+5,z(),10+i*5,0xd58bff,.4);
  if(once(a,'s',1.5)){ o.pos.y=0; o.vy=0; o.onGround=true; aoe(f,o,x(),z(),14,35*pm,60,26,0xd58bff,40); pillar(x(),z(),8,0xd58bff,.8,120); ring(x(),.5,z(),26,0xffc94d,.6); dust(x(),z(),10,10); game.shake=1.5; Snd.thud(); } }
 if(id==='raikou'){ for(let i=0;i<8;i++) if(once(a,'e'+i,.3+i*.17)){ const ang=i*Math.PI/4, p=V(x()+Math.sin(ang)*10,0,z()+Math.cos(ang)*10); const g=ghost(f,0xfff06a,.4); g.position.copy(p); g.rotation.y=ang+Math.PI; later(.25,()=>scene.remove(g)); zapBolt(p.clone().setY(6),o.chest()); if(canHit(o)) o.takeHit(f,4.5*pm,4,0,false,{x:o.pos.x-p.x+.01,z:o.pos.z-p.z}); }
  if(once(a,'f',1.8)){ f.pos.x=x()-Math.sin(o.yaw)*8; f.pos.z=z()-Math.cos(o.yaw)*8; zapBolt(V(x(),140,z()),V(x(),0,z())); strike(x(),z(),12,30*pm,32,f,o,0xfff06a,0,50); flashScreen('#fff06a'); } }
 if(id==='infernoth'){ if(a.t<1.2) f.setGlow(1+a.t*4); if(once(a,'n',1.2)){ const R=55*f.scale; aoe(f,o,f.pos.x,f.pos.z,R,45*pm,60,30,0xff5a1a,30); ring(f.pos.x,4,f.pos.z,R*1.2,0xffd27a,.8); pillar(f.pos.x,f.pos.z,10,0xff5a1a,1.2,160); flashScreen('#ff7a3a'); game.shake=1.6;
   for(let i=0;i<8;i++){ const ang=i*Math.PI/4, xx=f.pos.x+Math.sin(ang)*22, zz=f.pos.z+Math.cos(ang)*22, m=mesh(new THREE.CircleGeometry(5,20),glowM(0xff5a14,2.6),xx,.09,zz,decor,true); m.rotation.x=-Math.PI/2; lavaPools.push({x:xx,z:zz,r:5,m}); later(10,()=>{ decor.remove(m); const k=lavaPools.findIndex(p=>p.m===m); if(k>=0) lavaPools.splice(k,1); }); } } }
 if(id==='ragnavox'){ if(a.t<1.6){ f.pos.y=lerp(f.pos.y,22,dt*3); f.vy=0; }
  ['fire','storm','ice'].forEach((e,i)=>{ if(once(a,e,.5+i*.35)){ const xx=x()+rand(-4,4), zz=z()+rand(-4,4); if(e==='storm') zapBolt(V(xx,120,zz),V(xx,0,zz)); strike(xx,zz,9,12*pm,10,f,o,V8EL[e],0,20); if(e==='fire'&&canHit(o)){ o.burnT=3; o.burnBy=f; } if(e==='ice') o.slowT=3; } });
  if(once(a,'r',1.9)){ f.pos.y=0; ring(f.pos.x,4,f.pos.z,60,0xb48cff,.8); Snd.roar(); Snd.noise(1,150,.6,'lowpass',60); for(const b of city) if(b.alive&&Math.hypot(b.x-f.pos.x,b.z-f.pos.z)<60) bHit(b,40,0,0,b.h*.6,f); if(canHit(o)&&dist2(f,o)<60) o.takeHit(f,20*pm,80,18,false); game.shake=1.6; } }
 if(id==='worldroot'){ if(once(a,'p',.4)&&canHit(o)){ v8FuturePortal(o,f); o.portalT=6; } if(once(a,'g',.6)){ const r=34*f.scale, m=mesh(new THREE.CircleGeometry(r,40),new THREE.MeshBasicMaterial({color:0x4fbf4f,transparent:true,opacity:.42,depthWrite:false}),f.pos.x,.12,f.pos.z,scene,true); m.rotation.x=-Math.PI/2; V8.fields.push({owner:f,x:f.pos.x,z:f.pos.z,r,t:10,heal:10,m}); }
  if(once(a,'r',1.4)){ for(let i=0;i<12;i++) pillar(x()+rand(-9,9),z()+rand(-9,9),rand(1,2),0x7a5a3a,.9,rand(18,32)); strike(x(),z(),13,25*pm,30,f,o,0x9dffb0,0,40); } }
}

/* ---- update hooks ---- */
{ const oU=FP.update; FP.update=function(dt,inp,opp){ if(isCore(this)){ this.inp=inp; this.opp=opp; v8Input(this,inp,dt); v8AI(this,inp,dt); }
  oU.call(this,dt,inp,opp); }; }
// light ranged attacks that cost energy (ki blasts) and AI flight
{ const o=v8Input; v8Input=function(f,inp,dt){ const M=MOVES[f.F.J]; if(inp.punch>0&&M&&M.en&&!f.atk&&f.stun<=0&&game.state==='fight'){ inp.punch=0; v8Fire(f,f.F.J); } o(f,inp,dt); }; }
function v8AI(f,inp,dt){ if(f.isPlayer&&!f.pilot) return; if(game.vs2&&f===game.e) return; const o=f.opp, d=dist2(f,o);
 if(f.def.id==='ragnavox'&&!f.atk&&game.state==='fight'){ if(!f.v8fly&&f.onGround&&d>45&&f.stam>70&&Math.random()<dt*.4){ f.vy=f.F.jump; f.onGround=false; later(.35,()=>{ if(!f.dead&&!f.onGround) { f.v8fly=true; } }); }
  if(f.v8fly&&d<22&&Math.random()<dt*2) inp.heavy=.25; }
 if(f.def.id==='raikou'&&!f.atk&&f.stun<=0&&Math.random()<dt*.15&&f.tfCd<=0) inp.transform=.25; }

/* ---- QUICK ESCAPE: the roll is now a short, fast dash in any direction (all titans) ---- */
{ const o=FP.startRoll; FP.startRoll=function(mx,mz){ o.call(this,mx,mz); this.rollT=this.rollDur=.24; this.inv=.3; this.rollCd=.55; this.rollSpd=90; burst(this.chest(),0xffffff,8,10); }; }

/* ---- held buttons (v8.1: the scope is gone; old saved key maps lose their scope key) ---- */
for(const st in BS) delete BS[st].scope; rebuildCodeMap();
const tHeld={}; function tbHeld(k){ const b=tHeld[k]||(tHeld[k]=document.querySelector(`#tbtns [data-k="${k}"], #tTop [data-k="${k}"]`)); return !!(b&&b.classList.contains('on')); }
{ const o=readInput; readInput=function(pi,dt){ o(pi,dt); const I=inps[pi], P=pads[pi];
  I.heavyHeld=isDown('heavy',pi)||(pi===0&&tbHeld('heavy'))||!!(P.prev&&P.prev[3]);
  I.specialHeld=isDown('special',pi)||(pi===0&&tbHeld('special'))||!!(P.prev&&P.prev[1]);  }; }

/* ---- roster / maps: the core six on NEON CITY (v8.1: no more Vault) ---- */
allDefs=function(){ return ROSTER.filter(d=>d.core).concat(CDEFS); };
function mapIds(){ return Object.keys(MAPS); }
{ const o=go; go=function(s,back){ if(s==='select'&&!allDefs().some(d=>d.id===selId)) selId='valor'; if(s==='select'&&!mapIds().includes(mapSel)&&mapSel!=='random') mapSel='random'; o(s,back); }; }
selId='valor';
{ const o=startMatch; startMatch=function(){ const ms=mapSel; if(mapSel!=='random'&&!MAPS[mapSel]) mapSel='random'; // v8.1: old map ids (e.g. from the agent pilot) fall back to Neon City
  if(mapSel==='random'&&vsMode!=='story') mapSel=mapIds()[(Math.random()*mapIds().length)|0];
  if(vsMode!=='story'&&!allDefs().some(d=>d.id===oppId)) oppId='random';
  try{ o(); } finally{ mapSel=ms; }
  v8Clear(); for(const f of [game.p,game.e]){ f.dealt=0; f.ups=new Set(); f.upTier=0; f.ultUsed=false;
   if(isCore(f)){ const cpu=f===game.e&&!game.vs2; f.load=cpu?{focus:['melee','ranged','hybrid'][(Math.random()*3)|0],el:Object.keys(V8ELEM)[(Math.random()*5)|0],sub:Math.random()<.5?'A':'B'}:Object.assign({},loadOf(f.def.id)); } else f.load=null; }
  v8HudSetup(); }; }
{ const o=clearFX; clearFX=function(){ o(); v8Clear(); }; }
{ const o=updateFX; updateFX=function(dt){ o(dt); if(game.mode==='match'){ v8Discs(dt); v8Fields(dt); v8Portal(dt); } v8Citizens(dt); }; }
{ const o=matchOver; matchOver=function(won){ o(won); if(won&&!game.vs2&&!game.destroy){ V8.wins=(V8.wins||0)+1; v8save(); if(V8.wins===1) setTimeout(()=>toast('UNLOCKED: NEWS CAM (SETTINGS > CAMERA)','#ffd43b',3200),3400); } }; }
// future-portal weather: you see (and feel) the map's final disaster
function v8Portal(dt){ for(const f of [game.p,game.e]){ if(!(f&&f.portalT>0&&f.portalKind)) continue; const k=f.portalKind, c=f.chest();
  if(Math.random()<dt*14){ const col=k==='hurricane'?0x9fd8ff:0x9dffb0; burst(c.clone().add(V(rand(-6,6),rand(2,10),rand(-6,6))),col,3,12); }
  if(Math.random()<dt*1.5&&k==='hurricane') zapBolt(V(f.pos.x+rand(-8,8),90,f.pos.z+rand(-8,8)),f.pos.clone().setY(0));
  if(f.portalT<=.05) f.portalKind=null; } }

/* ---- CITIZENS SAY FUNNY THINGS ---- */
const FUNNY=['I JUST WASHED MY CAR','IS THIS COVERED BY INSURANCE?','MY RENT IS STILL DUE','I\'M LIVE STREAMING THIS!','THAT WAS MY GYM','DOES THIS COUNT AS A SICK DAY?','MY COFFEE IS GETTING COLD','WHO PARKED A ROBOT HERE?','HONEY, THE MONSTER\'S BACK','5 STARS, WOULD RUN AGAIN','MY PIZZA IS LATE. NOW I KNOW WHY','SOMEBODY CALL MY MOM','WORTH IT FOR THE PICS','I JUST MOVED HERE','NOT AGAIN. THIRD TIME THIS WEEK','CAN IT STEP ON MY BOSS\'S CAR?','I LEFT THE OVEN ON','THE BUS IS LATE AGAIN','IS THAT A BIRD? NO. NOPE.','I\'M TELLING MY MANAGER I\'M LATE'];
const funnyTex=FUNNY.map(t=>{ const c=document.createElement('canvas'); c.width=512; c.height=160; const g=c.getContext('2d');
 g.fillStyle='#fff'; g.strokeStyle='#111'; g.lineWidth=7; g.beginPath(); g.moveTo(30,10); g.lineTo(482,10); g.quadraticCurveTo(502,10,502,30); g.lineTo(502,112); g.quadraticCurveTo(502,130,482,130); g.lineTo(240,130); g.lineTo(206,156); g.lineTo(212,130); g.lineTo(30,130); g.quadraticCurveTo(10,130,10,112); g.lineTo(10,30); g.quadraticCurveTo(10,10,30,10); g.closePath(); g.fill(); g.stroke();
 g.fillStyle='#1d1d22'; g.font='bold 40px Arial Black, Arial'; g.textAlign='center'; g.textBaseline='middle'; const w=t.split(' '); let l1=t, l2=''; if(g.measureText(t).width>460){ const h=Math.ceil(w.length/2); l1=w.slice(0,h).join(' '); l2=w.slice(h).join(' '); }
 if(l2){ g.fillText(l1,256,48,470); g.fillText(l2,256,94,470); } else g.fillText(l1,256,70,470); const tx=new THREE.CanvasTexture(c); tx.encoding=THREE.sRGBEncoding; return tx; });
{ const o=say; say=function(p,set){ o(p,set); const b=bubbles.find(b=>b.p===p&&b.life>1.5); if(b) b.s.scale.set(4.4,2.2,1); }; }
function sayFunny(p){ const b=bubbles.find(b=>b.life<=0); if(!b) return; b.s.material.map=funnyTex[(Math.random()*FUNNY.length)|0]; b.s.material.needsUpdate=true; b.s.scale.set(8,2.5,1); b.life=2.6; b.p=p; b.s.visible=true; }
let funT=4; function v8Citizens(dt){ if(!SET.life||game.mode!=='match'||game.state!=='fight') return; funT-=dt; if(funT>0) return; funT=rand(3.5,7);
 const C=camera.position, cand=people.filter(p=>!p.gone&&Math.hypot(p.x-C.x,p.z-C.z)<90); if(cand.length) sayFunny(cand[(Math.random()*cand.length)|0]); }
