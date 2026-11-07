/* ---- V8 MOVES: what every new attack actually does ---- */
{ const oSA=FP.startAtk; FP.startAtk=function(id){ oSA.call(this,id); const a=this.atk; if(!a||!isCore(this)) return;
  const M=MOVES[id]; if((M.melee||M.hitAt)&&!M.multi){ const k=atkMul(this); a.dur*=k; if(a.hitAt) a.hitAt*=k; }
  if(id==='heatbeam'){ a.on=.7; a.off=2.4+(up(this,'beamlong')?.6:0); a.dur=a.off+.2; }
  if(id==='elementbreath'){ a.on=.45; a.off=1.75; }
  if(id==='dawncannon'||id==='echoshift'){ a.on=99; a.off=99; a.charge=0; }
  if(id==='rallystand'){ this.barrier={kind:'shield',t:2.6+(up(this,'rally')?1.5:0)}; a.dur=this.barrier.t; Snd.block(); toast(this.isPlayer?'RALLY STAND! SHOTS BOUNCE OFF YOUR SHIELD':'VALOR PLANTS ITS SHIELD!','#7fd4ff',900); }
  if(id==='ultimate'){ this.inv=3.2; }
 }; }
{ const oUA=FP.updateAtk; FP.updateAtk=function(dt){ const a=this.atk; oUA.call(this,dt); if(!a||this.atk!==a||!isCore(this)) return; const h=V8MOVE[a.id]; if(!h) return;
  const pm=this.F.power*(this.isPlayer?1:game.cfg.dmg)*(a.lm||1); h(this,a,dt,pm,this.opp,Math.sin(this.yaw),Math.cos(this.yaw)); }; }
const once=(a,k,t)=>{ if(!a['_'+k]&&a.t>=t){ a['_'+k]=1; return true; } return false; };
const dist2=(a,b)=>Math.hypot(a.pos.x-b.pos.x,a.pos.z-b.pos.z);
const canHit=o=>!o.dead&&!o.hidden&&o.inv<=0;
function ghost(f,color,op){ const g=f.root.clone(true), mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:op||.35,depthWrite:false,blending:THREE.AdditiveBlending}); g.traverse(o=>{ if(o.isMesh) o.material=mat; if(o.isLine||o.isLineSegments) o.visible=false; }); scene.add(g); return g; }
function aoe(f,o,x,z,r,dmg,kb,launch,color,maxY){ ring(x,.5,z,r,color,.45); burst(V(x,1.5,z),color,24,18); smash(x,z,r*.6,0,0,0,2,20+dmg*1.8); propsBlast(x,0,z,r); peopleBlast(x,z,r*.8);
 if(canHit(o)&&o.pos.y<(maxY||14)&&Math.hypot(o.pos.x-x,o.pos.z-z)<r+o.radius()*.6){ o.takeHit(f,dmg,kb,launch,false,{x:o.pos.x-x+.01,z:o.pos.z-z}); return true; } return false; }
function beamColor(f,c){ f.beam.outer.material.color.setHex(c); f.beam.ball.material.color.setHex(c); if(f.light) f.light.color.setHex(c); }

const V8MOVE={
 /* VALOR */
 vrifle(f,a,dt,pm,o){ const close=dist2(f,o)<20; if(close){ if(once(a,'b',.08)){ for(let i=-2;i<=2;i++){ f.shoot(130,0,2.6*pm,1.4,.4,6,0); const p=projs[projs.length-1]; const yy=Math.atan2(p.vel.x,p.vel.z)+i*.09, sp=p.vel.length(); p.vel.x=Math.sin(yy)*sp; p.vel.z=Math.cos(yy)*sp; } Snd.shot(); } }
  else if((a.fired||0)<3&&a.t>=(a.fired||0)*.1){ a.fired=(a.fired||0)+1; f.shoot(170,0,3.6*pm,1.4,.38,5,0); } },
 shieldthrow(f,a,dt,pm,o){ if(once(a,'t',.18)){ const p=f.chest(); V8.discs.push({f,o,pos:p,vel:V(),state:'out',t:0,bounces:1+(up(f,'bounce')?2:0),dmg:13*pm,hit:false,m:v8DiscMesh()}); f.P.v8shield.visible=false; Snd.whoosh(); } },
 dawncannon(f,a,dt,pm,o){ if(a.on===99){ a.charge=Math.min(1.2,a.t*(up(f,'dawn')?1.4:1)); if(Math.random()<dt*30) burst(f.chest().add(V(Math.sin(f.yaw)*3,0,Math.cos(f.yaw)*3)),0x7fd4ff,2,4);
   if(!f._sHeld||a.charge>=1.2){ a.on=a.t; a.off=a.t+.9; a.dur=a.off+.25; beamColor(f,0x7fd4ff); Snd.mech(); News.add('VALOR FIRES THE DAWN CANNON!',false,'dawn',8); } return; }
  const on=a.t>=a.on&&a.t<a.off; if(on&&!f.beamOn) f.startBeam(); if(!on&&f.beamOn) f.stopBeam(); if(on){ const k=.6+a.charge*.8; f.updateBeam(dt,pm*k*(up(f,'dawn')?1.2:1),a); f.beam.outer.scale.x*=k; f.beam.outer.scale.y*=k; } },
 /* ASHVIN */
 psybolt(f,a,dt,pm,o){ if(once(a,'s',.06)){ f.shoot(150,0,4*pm,1.5,.5,6,0,1); f.shoot(150,0,4*pm,1.5,.5,6,0,-1); } },
 tkthrow(f,a,dt,pm,o){ if(once(a,'l',.1)){ a.objs=[]; const n=up(f,'tk2')?2:1; const pool=props.filter(p=>p.state!=='held'&&p.state!=='gone'&&p.state!=='fly'&&p.obj.position.distanceTo(f.pos)<70).sort((x,y)=>x.obj.position.distanceTo(f.pos)-y.obj.position.distanceTo(f.pos));
   for(let i=0;i<n;i++){ const pr=pool[i]; if(pr){ if(pr.obj.parent!==scene) scene.attach(pr.obj); pr.state='held'; pr.holder=f; a.objs.push(pr); } }
   if(!a.objs.length){ a.rock=mesh(new THREE.DodecahedronGeometry(2.2,0),std(0x6b6460,.9,.1),f.pos.x+Math.sin(f.yaw)*6,1,f.pos.z+Math.cos(f.yaw)*6,scene); dust(a.rock.position.x,a.rock.position.z,4,6); }
   Snd.morph(false); }
  const lift=k=>{ (a.objs||[]).forEach((pr,i)=>{ pr.obj.position.y=lerp(pr.obj.position.y,10+i*4,k); pr.obj.rotation.y+=dt*3; if(Math.random()<.4) burst(pr.obj.position.clone(),0xd58bff,1,4); }); if(a.rock){ a.rock.position.y=lerp(a.rock.position.y,10,k); a.rock.rotation.x+=dt*4; burst(a.rock.position.clone(),0xd58bff,1,4); } };
  if(a.t<.55) lift(Math.min(1,dt*6));
  else if(once(a,'f',.55)){ (a.objs||[]).forEach(pr=>{ const from=pr.obj.position.clone(), tgt=f.aimTarget(), T=clamp(from.distanceTo(tgt)/80,.25,1); pr.holder=null; pr.vel.copy(tgt.sub(from).multiplyScalar(1/T)); pr.vel.y+=.5*32*T; pr.spin.set(rand(-6,6),rand(-6,6),rand(-6,6)); pr.state='fly'; pr.thrower=f; pr.target=o; pr.dmg=16*pm; });
   if(a.rock){ spawnProj({pos:a.rock.position.clone(),vel:f.aimTarget().sub(a.rock.position).normalize().multiplyScalar(95),grav:0,dmg:15*pm,r:4,size:2,kb:22,launch:8,owner:f,target:o,color:0xd58bff,trail:true}); scene.remove(a.rock); a.rock=null; } Snd.whoosh(); } },
 psyburst(f,a,dt,pm,o){ if(once(a,'b',a.hitAt||.35)){ const k=up(f,'burst')?1.25:1; aoe(f,o,f.pos.x,f.pos.z,14,15*pm*k,20,24*k,0xd58bff); pillar(f.pos.x,f.pos.z,5,0xd58bff,.5,40); game.shake=Math.max(game.shake,.6); } },
 mindbarrier(f,a,dt,pm,o){ if(once(a,'b',.15)){ f.barrier={kind:'bubble',t:3.5+(up(f,'barrier')?1.5:0),held:[]}; Snd.morph(false); toast(f.isPlayer?'MIND BARRIER! SHOTS FREEZE IN THE AIR':'ASHVIN RAISES A MIND BARRIER!','#d58bff',900); } },
 mindscramble(f,a,dt,pm,o){ if(once(a,'s',.3)){ if(dist2(f,o)<70&&canHit(o)){ ring(o.pos.x,o.chest().y,o.pos.z,10,0xd58bff,.6); daze(o,2.2,'MIND SCRAMBLE'); o.energy=Math.max(0,o.energy-(up(f,'scramble')?25:10)); News.add(`ASHVIN SCRAMBLES ${o.def.name}'S MIND!`,false,'scr',6); } else if(f.isPlayer) toast('TOO FAR FOR MIND SCRAMBLE','#cbd5e1',700); } },
 twinsplit(f,a,dt,pm,o){ if(once(a,'s',.3)){ if(f.twin&&f.twin.g) scene.remove(f.twin.g); const g=ghost(f,0xd58bff,.45); f.twin={g,t:6+(up(f,'split')?4:0),hitT:.6}; toast('TWIN SPLIT!','#d58bff',900); News.add('ASHVIN SPLITS IN TWO! BOTH PILOTS ARE FIGHTING SEPARATELY!',true,'split',8); Snd.morph(false); } },
 /* RAIKOU */
 thunderstep(f,a,dt,pm,o){ if(once(a,'s',.05)){ if(dist2(f,o)<75&&!o.dead){ const from=f.chest(); f.pos.x=o.pos.x-Math.sin(o.yaw)*8; f.pos.z=o.pos.z-Math.cos(o.yaw)*8; f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); zapBolt(from,f.chest()); burst(f.chest(),0xfff06a,20,14); } }
  if(once(a,'h',.2)) f.melee(12*f.scale,1.4,9*pm,12,0); },
 chainblade(f,a,dt,pm,o){ if(once(a,'c',(a.hitAt||.25)+.02)){ let from=f.chest(), n=up(f,'chain')?4:2; const near=city.filter(b=>b.alive&&Math.hypot(b.x-f.pos.x,b.z-f.pos.z)<45).sort(()=>Math.random()-.5).slice(0,n);
   near.forEach((b,i)=>later(i*.08,()=>{ const p=V(b.x,b.h*.7,b.z); zapBolt(from,p); bHit(b,30,0,0,b.h*.6,f); from=p; }));
   later(near.length*.08+.05,()=>{ if(canHit(o)&&dist2(f,o)<55){ zapBolt(from,o.chest()); o.takeHit(f,(6+near.length*2)*pm,10,0,false); o.stun=Math.max(o.stun,.3); } }); } },
 thundercrash(f,a,dt,pm,o,fx,fz){ if(once(a,'c',a.hitAt||.4)){ const x=f.pos.x+fx*9, z=f.pos.z+fz*9; zapBolt(V(x,120,z),V(x,0,z)); aoe(f,o,x,z,10,20*pm,20,30,0xfff06a); game.shake=Math.max(game.shake,.8); } },
 risingthunder(f,a,dt,pm,o){ if(once(a,'z',(a.hitAt||.3)+.02)&&a.landed) zapBolt(f.chest(),o.chest()); },
 echoshift(f,a,dt,pm,o){ // he stands still while his echoes run ahead; let go and he appears at the last echo, striking
  const N=3+(up(f,'echo')?2:0); if(!a.ech){ a.ech=[]; a.dir=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); a.reach=0; a.start=f.pos.clone(); }
  if(a.on===99){ const aim=f.isPlayer&&!f.inp.lock?f.inp.aimYaw:Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); a.dir=aim; a.reach=Math.min(55,a.reach+dt*60); a.charge=a.reach/55;
   const want=Math.min(N,1+Math.floor(a.reach/(55/N))); while(a.ech.length<want){ a.ech.push(ghost(f,0xfff06a,.32)); Snd.tone('triangle',800,1600,.12,.05); }
   a.ech.forEach((g,i)=>{ const d=a.reach*(i+1)/a.ech.length; const x=clamp(a.start.x+Math.sin(a.dir)*d,-ARENA,ARENA), z=clamp(a.start.z+Math.cos(a.dir)*d,-ARENA,ARENA); g.position.set(x,f.pos.y,z); g.rotation.set(0,a.dir,0); g.scale.setScalar(f.scale); });
   if(!f._sHeld||a.reach>=55){ a.on=a.t; a.dur=a.t+.45; const last=a.ech[a.ech.length-1]; const from=f.chest(); if(last){ f.pos.x=last.position.x; f.pos.z=last.position.z; } f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); zapBolt(from,f.chest()); Snd.thunder();
    const hits=a.ech.length; a.ech.forEach((g,i)=>later(i*.06,()=>{ const p=g.position; burst(V(p.x,4,p.z),0xfff06a,14,12); if(canHit(o)&&Math.hypot(o.pos.x-p.x,o.pos.z-p.z)<11+o.radius()*.5) o.takeHit(f,(5+a.charge*4)*pm*(up(f,'echo')?1.25:1),12,i===hits-1?18:0,false,{x:o.pos.x-p.x+.01,z:o.pos.z-p.z}); scene.remove(g); }));
    later(hits*.06+.02,()=>{ if(canHit(o)&&dist2(f,o)<14) o.takeHit(f,(10+a.charge*10)*pm,28,16,false); f.melee(13*f.scale,1.6,0,0,0); }); a.ech=[]; } } },
 /* INFERNOTH */
 magmatail(f,a,dt,pm,o){ if(once(a,'l',(a.hitAt||.42)+.02)){ const n=up(f,'lava')?6:3; for(let i=0;i<n;i++){ const ang=f.yaw+Math.PI+rand(-1.4,1.4), r=rand(8,16)*f.scale, x=f.pos.x+Math.sin(ang)*r, z=f.pos.z+Math.cos(ang)*r;
   const m=mesh(new THREE.CircleGeometry(4,20),glowM(0xff5a14,2.6),x,.09,z,decor,true); m.rotation.x=-Math.PI/2; lavaPools.push({x,z,r:4,m}); later(9,()=>{ scene.remove(m); decor.remove(m); const k=lavaPools.findIndex(p=>p.m===m); if(k>=0) lavaPools.splice(k,1); }); }
   burst(f.pos.clone().setY(1),0xff5a14,30,18); game.shake=Math.max(game.shake,.7); Snd.boom(); } },
 dorsalpulse(f,a,dt,pm,o){ if(a.t<.3){ f.setGlow(1+a.t*12); } if(once(a,'p',.3)){ aoe(f,o,f.pos.x,f.pos.z,24*f.scale,18*pm,40,16,0xff5a1a); ring(f.pos.x,f.chest().y,f.pos.z,30*f.scale,0xffd27a,.5); if(canHit(o)&&dist2(f,o)<26*f.scale){ o.burnT=3; o.burnBy=f; } Snd.boom(); flashScreen('#ff7a3a'); News.add('INFERNOTH\'S SPINES BLAST A RING OF FIRE!',false,'pulse',8); } },
 heatbeam(f,a,dt,pm,o){ beamColor(f,0xff5a1a); if(a.t<a.on) f.setGlow(1+3*a.t/a.on); const on=a.t>=a.on&&a.t<a.off; if(on&&!f.beamOn){ f.startBeam(); News.add('INFERNOTH FIRES ITS HEAT BEAM ACROSS THE CITY!',true,'heat',8); }
  if(!on&&f.beamOn) f.stopBeam(); if(on){ const rage=1+.5*(1-f.hp/f.def.hp), w=up(f,'beamwide')?1.5:1; f.updateBeam(dt,pm*rage,a); f.beam.outer.scale.x*=w*rage; f.beam.outer.scale.y*=w*rage; if(f.F.hot){ f.beam.outer.scale.x*=1.25; f.beam.outer.scale.y*=1.25; } } },
 /* RAGNAVOX */
 roarwave(f,a,dt,pm,o,fx,fz){ if(once(a,'r',.3)){ const R=46, push=up(f,'roar')?2:1; for(let i=0;i<4;i++) later(i*.07,()=>ring(f.pos.x+fx*i*9,f.chest().y,f.pos.z+fz*i*9,8+i*7,0xb48cff,.4)); Snd.roar(); Snd.noise(.6,180,.5,'lowpass',80); game.shake=Math.max(game.shake,.6);
   for(const b of city) if(b.alive){ const dx=b.x-f.pos.x, dz=b.z-f.pos.z, d=Math.hypot(dx,dz); if(d<R&&(dx*fx+dz*fz)/(d||1)>.5) bHit(b,22,fx,fz,b.h*.6,f); }
   const dx=o.pos.x-f.pos.x, dz=o.pos.z-f.pos.z, d=Math.hypot(dx,dz); if(canHit(o)&&d<R&&(dx*fx+dz*fz)/(d||1)>.5){ o.takeHit(f,12*pm,40*push,6,false,{x:dx,z:dz}); o.stun=Math.max(o.stun,.5);
    if(up(f,'voices')){ const e=f.F.el; if(e==='fire'){ o.burnT=3; o.burnBy=f; } else if(e==='ice') o.slowT=2.5; else { zapBolt(f.chest(),o.chest()); o.stun=Math.max(o.stun,.8); } } } } },
 tremorstomp(f,a,dt,pm,o){ if(once(a,'s',a.hitAt||.45)){ const R=22*f.scale; ring(f.pos.x,.4,f.pos.z,R,0xb48cff,.6); ring(f.pos.x,.4,f.pos.z,R*.6,0xffffff,.4); dust(f.pos.x,f.pos.z,R*.5,12); Snd.thud(); Snd.boom(); game.shake=Math.max(game.shake,1.1);
   smash(f.pos.x,f.pos.z,R*.5,0,0,0,2,50); peopleBlast(f.pos.x,f.pos.z,R); propsBlast(f.pos.x,0,f.pos.z,R); if(canHit(o)&&o.onGround&&dist2(f,o)<R+o.radius()*.5) o.takeHit(f,16*pm,22,22,false); } },
 elementbreath(f,a,dt,pm,o){ const e=f.F.el, c=V8EL[e]; beamColor(f,c); const on=a.t>=a.on&&a.t<a.off; if(on&&!f.beamOn){ f.startBeam(); Snd.roar(); } if(!on&&f.beamOn) f.stopBeam();
  if(on){ const hp0=o.hp; f.updateBeam(dt,pm*(up(f,'breath')?1.2:1),a); if(o.hp<hp0){ if(e==='fire'){ o.burnT=3; o.burnBy=f; } else if(e==='ice'){ o.slowT=2; if(Math.random()<dt*2) o.stun=Math.max(o.stun,.5); } else if(Math.random()<dt*3){ zapBolt(f.chest(),o.chest()); o.stun=Math.max(o.stun,.25); } } } },
 skydive(f,a,dt,pm,o){ if(!a.hit){ const dx=o.pos.x-f.pos.x, dz=o.pos.z-f.pos.z, d=Math.hypot(dx,dz)||1; f.yaw=Math.atan2(dx,dz); f.pos.x+=dx/d*95*dt; f.pos.z+=dz/d*95*dt; f.pos.y=Math.max(0,f.pos.y-45*dt); f.vy=0; burst(f.chest(),0xb48cff,2,6);
   if(f.pos.y<=.5||d<7||a.t>.8){ a.hit=true; a.dur=a.t+.35; f.pos.y=0; aoe(f,o,f.pos.x,f.pos.z,14*f.scale,22*pm*(up(f,'dive')?1.3:1),30,20,0xb48cff,20); game.shake=Math.max(game.shake,1); Snd.thud(); } } },
 /* WORLDROOT */
 rootwhip(f,a,dt,pm,o){ if(once(a,'w',.25)){ if(dist2(f,o)<70&&canHit(o)){ const x=o.pos.x, z=o.pos.z; for(let i=0;i<5;i++) later(i*.04,()=>pillar(x+rand(-3,3),z+rand(-3,3),.7,0x6bd06b,.6,14));
    const dx=f.pos.x-o.pos.x, dz=f.pos.z-o.pos.z, d=Math.hypot(dx,dz)||1; o.takeHit(f,9*pm*(up(f,'whip')?1.4:1),0,0,false,{x:-dx,z:-dz}); o.kb.x+=dx/d*45; o.kb.z+=dz/d*45; o.stun=Math.max(o.stun,up(f,'whip')?1:.5); burst(o.pos.clone().setY(2),0x6bd06b,20,12); Snd.crumble(); }
   else if(f.isPlayer) toast('TOO FAR FOR ROOT WHIP','#cbd5e1',700); } },
 rootslam(f,a,dt,pm,o){ if(once(a,'r',a.hitAt||.45)){ const near=dist2(f,o)<60; const x=near?o.pos.x:f.pos.x+Math.sin(f.yaw)*14, z=near?o.pos.z:f.pos.z+Math.cos(f.yaw)*14; for(let i=0;i<7;i++) pillar(x+rand(-5,5),z+rand(-5,5),rand(.8,1.6),0x7a5a3a,.7,rand(10,20)); aoe(f,o,x,z,10,17*pm,16,28,0x6bd06b); Snd.crumble(); } },
 futureportal(f,a,dt,pm,o){ if(once(a,'p',.3)){ const p=V(); f.emitObj().getWorldPosition(p); const disc=mesh(new THREE.TorusGeometry(2.4,.5,10,28),glowM(0x9dffb0,2.5),p.x,p.y,p.z,scene,true);
   V8.discs.push({kind:'portal',f,o,pos:p.clone(),vel:o.chest().sub(p).normalize().multiplyScalar(55),t:0,m:disc,dmg:0}); Snd.tone('sine',200,700,.6,.1); News.add('WORLDROOT SHOOTS A PORTAL TO THE FUTURE!',false,'fport',8); } },
 overgrowth(f,a,dt,pm,o){ if(once(a,'g',.3)){ const r=(up(f,'grow')?30:22)*f.scale; const m=mesh(new THREE.CircleGeometry(r,40),new THREE.MeshBasicMaterial({color:0x4fbf4f,transparent:true,opacity:.42,depthWrite:false}),f.pos.x,.12,f.pos.z,scene,true); m.rotation.x=-Math.PI/2;
   V8.fields.push({owner:f,x:f.pos.x,z:f.pos.z,r,t:9,heal:up(f,'grow')?9:6,m}); burst(f.pos.clone().setY(1),0x6bd06b,40,16); toast(f.isPlayer?'OVERGROWTH! STAND IN IT TO HEAL':'GRASS IS SPREADING AROUND WORLDROOT!','#9dffb0',900); } },
 timeskip(f,a,dt,pm,o){ if(once(a,'t',.3)){ if(dist2(f,o)<85&&canHit(o)){ const from=o.pos.clone(); ring(from.x,1,from.z,12,0x9dffb0,.7); let best=null, bd=-1; for(let i=0;i<12;i++){ const ang=rand(0,6.28), r=rand(60,ARENA-15), x=Math.cos(ang)*r, z=Math.sin(ang)*r; const d=Math.hypot(x-f.pos.x,z-f.pos.z); if(!inBuilding(x,z,3)&&d>bd){ bd=d; best=[x,z]; } }
    if(best){ o.pos.x=best[0]; o.pos.z=best[1]; o.kb.set(0,0,0); pillar(best[0],best[1],5,0x9dffb0,1,90); daze(o,.9,'TIME SKIP'); if(up(f,'thief')){ const s=Math.min(20,o.energy); o.energy-=s; f.energy=Math.min(100,f.energy+s); } News.add(`WORLDROOT SKIPS ${o.def.name} ACROSS TIME AND SPACE!`,true,'tskip',8); Snd.tone('sine',900,150,.8,.12); } }
   else if(f.isPlayer) toast('TOO FAR FOR TIME SKIP','#cbd5e1',700); } },
 ultimate(f,a,dt,pm,o){ v8UltUpdate(f,a,dt,pm,o); },
};

/* ---- shields, discs, portals, grass fields ---- */
let discGeo=null; function v8DiscMesh(){ if(!discGeo) discGeo=new THREE.CylinderGeometry(2.4,2.4,.5,22); const g=new THREE.Group(); const m=new THREE.Mesh(discGeo,std(0xe9eef4,.3,.8)); m.rotation.x=Math.PI/2; g.add(m); g.add(new THREE.Mesh(new THREE.TorusGeometry(2.4,.25,8,24),glowM(0x7fd4ff,2.4))); scene.add(g); return g; }
function v8Discs(dt){ for(let i=V8.discs.length-1;i>=0;i--){ const D=V8.discs[i], f=D.f, o=D.o; D.t+=dt; let done=false;
  if(D.kind==='portal'){ const want=o.chest().sub(D.pos).normalize().multiplyScalar(55); D.vel.lerp(want,Math.min(1,dt*(up(f,'portalhome')?2.4:1.2))); D.pos.addScaledVector(D.vel,dt); D.m.position.copy(D.pos); D.m.lookAt(D.pos.clone().add(D.vel)); D.m.rotation.z+=dt*6; if(Math.random()<.5) burst(D.pos.clone(),0x9dffb0,1,4);
   if(canHit(o)&&D.pos.distanceTo(o.chest())<4.5*o.scale+2){ if(o.blocking&&Math.abs(angDiff(o.yaw,Math.atan2(D.pos.x-o.pos.x,D.pos.z-o.pos.z)))<1.5){ deflectFX(D.pos,o); } else v8FuturePortal(o,f); done=true; }
   const b=inBuilding(D.pos.x,D.pos.z,0); if(b&&D.pos.y<b.h){ done=true; burst(D.pos.clone(),0x9dffb0,20,12); } if(D.t>3) done=true; if(done){ scene.remove(D.m); V8.discs.splice(i,1); } continue; }
  // VALOR's shield: out to the rival, bounce off buildings, come back
  D.m.rotation.y+=dt*18; const sp=110; let tgt=null;
  if(D.state==='out') tgt=(canHit(o)&&!D.hit)?o.chest():D.bTarget?V(D.bTarget.x,D.bTarget.h*.5,D.bTarget.z):null;
  if(D.state==='back'||!tgt){ D.state='back'; tgt=f.chest(); }
  const dv=tgt.clone().sub(D.pos), dl=dv.length(); D.pos.addScaledVector(dv.normalize(),Math.min(dl,sp*dt)); D.m.position.copy(D.pos);
  if(dl<4.5){ if(D.state==='back'){ done=true; Snd.block(); if(f.P.v8shield) f.P.v8shield.visible=true; }
   else if(!D.hit&&canHit(o)&&D.pos.distanceTo(o.chest())<5*o.scale){ D.hit=true; o.takeHit(f,D.dmg,14,0,false); o.stun=Math.max(o.stun,.4); burst(D.pos.clone(),0x7fd4ff,18,14); Snd.block(); discNext(D); }
   else { if(D.bTarget){ bHit(D.bTarget,24,0,0,D.bTarget.h*.5,f); burst(D.pos.clone(),0x7fd4ff,14,12); Snd.block(); D.bTarget=null; } discNext(D); } }
  if(D.t>5){ done=true; if(f.P.v8shield) f.P.v8shield.visible=true; }
  if(done){ scene.remove(D.m); V8.discs.splice(i,1); } } }
// after each hit the shield picks a nearby building to bounce off (as many as it has bounces), then flies home
function discNext(D){ if(D.bounces<=0){ D.state='back'; return; } D.bounces--; const p=D.pos; const c=city.filter(b=>b.alive&&Math.hypot(b.x-p.x,b.z-p.z)<50&&Math.hypot(b.x-p.x,b.z-p.z)>6); D.bTarget=c.length?c[(Math.random()*c.length)|0]:null; if(!D.bTarget) D.state='back'; }
function v8FuturePortal(o,f){ o.portalT=5+(up(f,'portallong')?2:0); const kind=DISASTER[MAP.id]||'hurricane'; o.portalKind=kind;
 toast(o.isPlayer||game.vs2?'YOU SEE THE CITY\'S FINAL FORM!':o.def.name+' IS THROWN INTO THE FUTURE!','#9dffb0',1500); News.add(`${o.def.name} IS PULLED INTO THE FUTURE AND SEES THE CITY'S FINAL FORM!`,true,'future',8);
 ring(o.pos.x,1,o.pos.z,14,0x9dffb0,1); pillar(o.pos.x,o.pos.z,5,0x9dffb0,1,120); Snd.tone('sine',200,900,1.2,.12); }
function v8BarrierFX(f,dt){ const B=f.barrier; if(!B.m){ B.m=new THREE.Mesh(B.kind==='bubble'?S(1,20,14):new THREE.CylinderGeometry(1,1,1,20,1,true,-.9,1.8),new THREE.MeshBasicMaterial({color:f.def.glow,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); scene.add(B.m); }
 const r=(B.kind==='bubble'?13:10)*f.scale; B.m.position.copy(f.pos).setY(f.chest().y*.9); B.m.scale.set(r,B.kind==='bubble'?r:16*f.scale,r); B.m.rotation.y=f.yaw-Math.PI/2; B.m.material.opacity=.14+Math.sin(game.time*8)*.05;
 if(B.kind==='bubble') for(const p of projs){ if(p.owner===f||p.pierce||p._frozen) continue; if(p.mesh.position.distanceTo(f.chest())<r+1){ p._frozen=true; p.vel.multiplyScalar(0); p.grav=0; p.life=99; B.held.push(p); burst(p.mesh.position.clone(),0xd58bff,6,6); } } }
function v8BarrierEnd(f){ const B=f.barrier; f.barrier=null; if(B.m) scene.remove(B.m); if(B.held&&B.held.length){ const o=f.opp; for(const p of B.held){ if(!projs.includes(p)) continue; p._frozen=false; p.owner=f; p.target=o; p.life=3; p.color=f.def.glow; p.vel.copy(o.chest().sub(p.mesh.position).normalize().multiplyScalar(up(f,'barrier')?160:120)); } toast('MIND BARRIER THROWS THE SHOTS BACK!','#d58bff',900); Snd.whoosh(); } }
function v8Fields(dt){ for(let i=V8.fields.length-1;i>=0;i--){ const F=V8.fields[i]; F.t-=dt; F.m.material.opacity=Math.min(.42,F.t*.2);
  const o=F.owner; if(!o.dead&&Math.hypot(o.pos.x-F.x,o.pos.z-F.z)<F.r&&o.hp<o.def.hp){ o.hp=Math.min(o.def.hp,o.hp+F.heal*dt); if(Math.random()<dt*6) burst(o.chest(),0x9dffb0,2,5); }
  if(F.t<=0){ scene.remove(F.m); V8.fields.splice(i,1); } } }
function v8Clear(){ for(const D of V8.discs) scene.remove(D.m); for(const F of V8.fields) scene.remove(F.m); V8.discs=[]; V8.fields=[]; for(const f of [game.p,game.e]) if(f&&f.barrier){ if(f.barrier.m) scene.remove(f.barrier.m); f.barrier=null; } }
