/* =====================================================================
   TITAN CLASH: MAGMA WALL ARCHIVE (taken out of the game in v8.5, Nov 8, 2026)
   INFERNOTH's old MELTDOWN medium, a lava wall that rose in front of him, blocked shots and burned.
   MajorasPride: "the lava wall is kinda dumb, switch it for something cooler". MAGMA SURGE replaced it
   (tools/v8-src/46-magma-surge.js). Nothing was deleted: every piece that came out of
   tools/v8-src/33-infernoth-meltdown-ults.js is here. To bring it back, put each piece back and rebuild.
   ===================================================================== */
// 1. inside V8MOVE (Object.assign(V8MOVE,{ ... })), before merupt:
 mwall(f,a,dt,pm,o){ if(once(a,'w',a.hitAt)){ for(const W of KX.walls) if(W.f===f) W.t=Math.min(W.t,.3);   // one wall at a time
   const c=fwd(f,12*f.scale), w=24, g=new THREE.Mesh(new THREE.BoxGeometry(w,9,2.2),glowM(INF.ORANGE,1.8)); g.position.set(c.x,-4,c.z); g.rotation.y=f.yaw; scene.add(g);
   KX.walls.push({f,x:c.x,z:c.z,yaw:f.yaw,w,t:4,m:g,dps:14*pm}); dust(c.x,c.z,8,8); Snd.boom(); game.shake=Math.max(game.shake,.4); } },
// 2. inside kxTick, in the spit-blob loop (walls stop spit blobs):
  for(const W of KX.walls) if(W.f!==B.f&&wallHit(W,B.m.position)) done=true;
// 3. inside kxTick, after the spit-blob loop (walls rise, block shots, burn and push the rival, sink):
 for(let i=KX.walls.length-1;i>=0;i--){ const W=KX.walls[i], o=W.f.opp; W.t-=dt; W.m.position.y=Math.min(4.5,W.m.position.y+dt*30); if(W.t<.3) W.m.position.y-=dt*30;
  for(let j=projs.length-1;j>=0;j--){ const p=projs[j]; if(p.owner!==W.f&&wallHit(W,p.mesh.position)){ burst(p.mesh.position.clone(),INF.ORANGE,8,10); p.life=0; } }   // blocks shots
  if(o&&canHit(o)&&wallHit(W,o.pos.clone().setY(3),o.radius()*.6)){ const s0=o.stun; o.takeHit(W.f,W.dps*dt,0,0,true,{x:0,z:1}); o.stun=s0; const nx=Math.sin(W.yaw), nz=Math.cos(W.yaw), side=(o.pos.x-W.x)*nx+(o.pos.z-W.z)*nz>0?1:-1; o.kb.x+=nx*side*40*dt*10; o.kb.z+=nz*side*40*dt*10; }
  if(W.t<=0){ scene.remove(W.m); W.m.geometry.dispose(); KX.walls.splice(i,1); } }
// 4. helper, after kxClear:
function wallHit(W,p,pad){ const nx=Math.sin(W.yaw), nz=Math.cos(W.yaw), dx=p.x-W.x, dz=p.z-W.z, along=dx*nz-dz*nx, across=dx*nx+dz*nz;
 return Math.abs(along)<W.w/2&&Math.abs(across)<1.6+(pad||0)&&p.y<10&&W.m.position.y>0; }
// 5. from tools/v8-src/35-loadout.js (Hot Blood: shots the wall blocks fill rage):
{ const o=wallHit; wallHit=function(W,p,pad){ const r=o(W,p,pad); if(r&&pad===undefined&&W.f&&up(W.f,'hotblood')&&game.time-(W._hb||0)>.15){ W._hb=game.time; addRage(W.f,8); } return r; }; }
