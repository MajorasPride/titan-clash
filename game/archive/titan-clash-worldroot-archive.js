/* =====================================================================
   TITAN CLASH: WORLDROOT ARCHIVE (taken out of the game in v8.3, Nov 7, 2026)
   WORLDROOT, the elder world-tree kaiju (grass + time magic). MajorasPride archived it: it blocked the
   camera and never punched. Nothing was deleted: every piece that came out of game/tools/v8-src/ is here,
   with the file it came from. To bring it back, put each piece back where it was and rebuild (build_v8.py).
   A few harmless table entries keyed 'worldroot' (stats, stances, lore, ability tree, element, regrow,
   guard colors, ultimate lines) were left in place in the game; they do nothing while it is off the roster.
   ===================================================================== */

/* ---- from 01-data.js: roster entry (V8DEFS) ---- */
 {id:'worldroot',name:'WORLDROOT',type:'kaiju',kbody:'tree',tag:'Elder world-tree titan from the stars. Grass and time magic. Sees the future.',color:0x6b5a48,accent:0x3f8a3a,glow:0x9dffb0,css:'#9dffb0',beam:'Future Portal',superName:'RAGNAROK BLOOM',ultName:'RAGNAROK BLOOM',altColor:0x6b5a48,altScale:1,cls:'MYSTIC',code:'K-03 "ORACLE"',origin:'ALIEN'},

/* ---- from 02-bodies.js: size ---- */
V8DEFS.find(d=>d.id==='worldroot').baseScale=1.08;

/* ---- from 02-bodies.js: body extras (glowing motes) ---- */
 if(id==='worldroot'){ P.v8motes=[0xff6a1a,0x5fd0ff,0xfff06a,0xcfefff].map(c=>mesh(S(.7,10,8),glowM(c,3),0,0,0,f.root,true)); }

/* ---- from 04-moves.js: moves: Root Whip, Root Slam, Future Portal, Overgrowth, Time Skip ---- */
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

/* ---- from 05-systems.js: ultimate RAGNAROK BLOOM ---- */
 if(id==='worldroot'){ if(once(a,'p',.4)&&canHit(o)){ v8FuturePortal(o,f); o.portalT=6; } if(once(a,'g',.6)){ const r=34*f.scale, m=mesh(new THREE.CircleGeometry(r,40),new THREE.MeshBasicMaterial({color:0x4fbf4f,transparent:true,opacity:.42,depthWrite:false}),f.pos.x,.12,f.pos.z,scene,true); m.rotation.x=-Math.PI/2; V8.fields.push({owner:f,x:f.pos.x,z:f.pos.z,r,t:10,heal:10,m}); }
  if(once(a,'r',1.4)){ for(let i=0;i<12;i++) pillar(x()+rand(-9,9),z()+rand(-9,9),rand(1,2),0x7a5a3a,.9,rand(18,32)); strike(x(),z(),13,25*pm,30,f,o,0x9dffb0,0,40); } }
