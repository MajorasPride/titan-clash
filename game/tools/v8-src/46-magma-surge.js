// v8.5 (Nov 8, 2026): moved from the sandbox into the game (MajorasPride: put everything we did in the game; the sandbox keeps on/off switches to compare).
/* =====================================================================
   SANDBOX 17 (Nov 8, 2026): MAGMA SURGE replaces INFERNOTH's Magma Wall (MELTDOWN medium).
   MajorasPride: "the lava wall is kinda dumb, switch it for something cooler, I trust you".
   He stomps, and a rolling wave of lava rushes forward along the ground (a breaking crest with a
   glowing lip). It knocks the rival down and pushes them away, swallows small shots in its path
   (so MELTDOWN keeps its zoning tool), and leaves short burning pools behind it.
   The old wall code is still in the game (33-infernoth-meltdown-ults.js); it moves to the archive
   if he OKs this.
   ===================================================================== */
const SURGE={list:[], speed:58, range:52, dmg:13};
MOVES.mwall.name='Magma Surge'; MOVES.mwall.dur=.85; MOVES.mwall.hitAt=.4;
function surgeMesh(){ const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.2,20,14,1,true,0,Math.PI),glowM(INF.ORANGE,1.6)); body.rotation.z=Math.PI/2; body.material.side=THREE.DoubleSide; g.add(body);
 const lip=new THREE.Mesh(new THREE.TorusGeometry(2.6,.7,6,14,Math.PI*.9),glowM(0xffd27a,2.8)); lip.rotation.y=Math.PI/2; lip.position.set(0,1.2,1.6); lip.scale.set(1,1,1); g.add(lip);
 const crust=new THREE.Mesh(new THREE.BoxGeometry(20,.8,3.4),std(0x2a120a,.9,.1)); crust.position.set(0,.2,-1.6); g.add(crust);
 g.userData={body,lip}; return g; }
V8MOVE.mwall=function(f,a,dt,pm,o){ if(once(a,'w',a.hitAt)){
  const yaw=(canHit(o)&&dist2(f,o)<SURGE.range+10)?Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z):f.yaw;
  const s=fwd(f,6*f.scale), m=surgeMesh(); m.position.set(s.x,0,s.z); m.rotation.y=yaw; m.scale.set(.6,.2,.6); scene.add(m);
  SURGE.list.push({f,m,x:s.x,z:s.z,yaw,d:0,hit:false,dmg:SURGE.dmg*pm,trail:0});
  dust(s.x,s.z,8,10); burst(V(s.x,2,s.z),0xffd27a,14,18); Snd.boom(); game.shake=Math.max(game.shake,.5); } };
function surgeUpdate(dt){ for(let i=SURGE.list.length-1;i>=0;i--){ const S=SURGE.list[i], nx=Math.sin(S.yaw), nz=Math.cos(S.yaw), step=SURGE.speed*dt;
  S.d+=step; S.x+=nx*step; S.z+=nz*step; const k=S.d/SURGE.range, grow=Math.min(1,S.d/10), fade=k>.82?Math.max(0,1-(k-.82)/.18):1;
  S.m.position.set(S.x,0,S.z); S.m.scale.set(.6+.4*grow,(.3+.9*grow)*fade,.7+.3*grow);
  S.m.userData.lip.rotation.x=Math.sin(game.time*14)*.15;                      // the crest churns as it rolls
  if(Math.random()<.6) burst(V(S.x+rand(-8,8),3*fade,S.z+rand(-8,8)),Math.random()<.5?0xffd27a:INF.ORANGE,2,10);
  S.trail-=dt; if(S.trail<=0){ S.trail=.09; lavaPool(S.x-nx*3,S.z-nz*3,3.4,S.f,7*(S.dmg/SURGE.dmg),1.4); }
  const inWave=(p,pad)=>{ const dx=p.x-S.x, dz=p.z-S.z, along=dx*nz-dz*nx, across=dx*nx+dz*nz; return Math.abs(along)<10+(pad||0)&&Math.abs(across)<3.5+(pad||0); };
  for(let j=projs.length-1;j>=0;j--){ const p=projs[j]; if(p.owner!==S.f&&p.mesh&&p.mesh.position.y<10&&inWave(p.mesh.position)){ burst(p.mesh.position.clone(),INF.ORANGE,8,10); p.life=0; if(up(S.f,'hotblood')) addRage(S.f,8); } }   // eats small shots (Hot Blood: each one fills rage)
  const o=S.f.opp; if(!S.hit&&o&&canHit(o)&&o.pos.y<8&&inWave(o.pos,o.radius()*.5)){ S.hit=true; o.takeHit(S.f,S.dmg,22,12,false,{x:nx,z:nz}); lavaFountain(o.pos.x,o.pos.z,14,4); game.shake=Math.max(game.shake,.6); }
  for(const b of city) if(b.alive&&!b._sg&&Math.abs((b.x-S.x)*nz-(b.z-S.z)*nx)<10+b.w/2&&Math.abs((b.x-S.x)*nx+(b.z-S.z)*nz)<4+b.d/2){ b._sg=1; bHit(b,40,nx,nz,2,S.f); later(.5,()=>{ b._sg=0; }); }
  if(S.d>=SURGE.range){ scene.remove(S.m); S.m.traverse(x=>{ if(x.geometry) x.geometry.dispose(); }); SURGE.list.splice(i,1); } } }
{ const oP=updateProjs; updateProjs=function(dt){ oP(dt); try{ surgeUpdate(dt); }catch(e){ console.error(e); } }; }
{ const oK=kxClear; kxClear=function(all){ for(const S of SURGE.list) scene.remove(S.m); SURGE.list.length=0; return oK(all); }; }
// the Hot Blood upgrade's text follows the new move
{ const n=V8TREE.infernoth.A.nodes.find(x=>x[2]==='hotblood'); if(n) n[1]=n[1].replace('Magma Wall fills rage when it gets hit','every shot Magma Surge swallows fills rage'); }
