/* ---- V8 CAMERAS: NEWS CAM (follows Chopper 7, unlocked by your first win), FIXED cameras, OVER-THE-SHOULDER (Gears style),
   and the ULTIMATE cutscene camera. Settings > Camera. Solo fights only; 2 players keep the shared Titan Cam. ---- */
const FIXCAMS=[]; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; FIXCAMS.push(V(Math.cos(a)*120,48,Math.sin(a)*120)); } for(let i=0;i<4;i++){ const a=(i+.5)/4*Math.PI*2; FIXCAMS.push(V(Math.cos(a)*55,9,Math.sin(a)*55)); }
const v8cam={fix:0,fixT:0,fov:65};
function camAim(i,me,op,fwd,c){ if(!op.dead&&!op.hidden&&!(me.dazeT>0)) inps[i].aimPoint.copy(op.chest()); else inps[i].aimPoint.copy(c.pos).addScaledVector(fwd,110); }
function v8CamCustom(dt){ const mode=SET.cam, A=game.p, B=game.e, c=cams[0], C=camera, P=pads[0];
 const mid=V((A.pos.x+B.pos.x)/2,0,(A.pos.z+B.pos.z)/2), gap=Math.hypot(B.pos.x-A.pos.x,B.pos.z-A.pos.z), sc=Math.max(A.scale||1,B.scale||1);
 let fov=65, look=null;
 if(game.cut){ const f=game.cut.f, k=Math.min(1,game.cut.t/game.cut.dur), fx=Math.sin(f.yaw), fz=Math.cos(f.yaw), h=f.chest().y+(f.kaiju?5:3)*f.scale;
  const D=(f.kaiju?30-8*k:20-6*k)*f.scale, rx=-Math.cos(f.yaw), rz=Math.sin(f.yaw); c.pos.set(f.pos.x+fx*D+rx*4*f.scale,h+1,f.pos.z+fz*D+rz*4*f.scale); look=V(f.pos.x,h,f.pos.z); fov=50-10*k; c.init=false; }
 else if(mode==='news'){ const hp=heli.state==='fly'?heli.g.position:V(mid.x+90,70,mid.z+90); c.pos.lerp(hp,1-Math.exp(-6*dt)); look=V(mid.x,(A.chest().y+B.chest().y)*.4,mid.z); const d=c.pos.distanceTo(look); fov=clamp(2*Math.atan((gap*.7+30*sc)/d)*180/Math.PI,14,60); c.lock=true; }
 else if(mode==='fixed'){ v8cam.fixT-=dt; const cur=FIXCAMS[v8cam.fix], dc=cur.distanceTo(mid);
  if(v8cam.fixT<=0&&(dc>150||dc<30||!camClear(cur,A)||!camClear(cur,B))){ let best=v8cam.fix,bs=1e9; FIXCAMS.forEach((p,i)=>{ const d=p.distanceTo(mid); const s=Math.abs(d-85)+(camClear(p,A)?0:200)+(camClear(p,B)?0:120); if(s<bs){ bs=s; best=i; } }); if(best!==v8cam.fix){ v8cam.fix=best; c.init=false; } v8cam.fixT=2.5; }
  c.pos.copy(FIXCAMS[v8cam.fix]); look=V(mid.x,(A.chest().y+B.chest().y)*.45,mid.z); const d=c.pos.distanceTo(look); fov=clamp(2*Math.atan((gap*.6+28*sc)/d)*180/Math.PI,22,70); c.lock=true; }
 else { // shoulder (Gears of War style): close, low, off to the right
  const lk=(isDown('lookR',0)?1:0)-(isDown('lookL',0)?1:0)+P.rx, lu=(isDown('lookD',0)?1:0)-(isDown('lookU',0)?1:0)+P.ry*(SET.invert?-1:1);
  if(!c.lock) c.yaw-=lk*2.4*SET.sens*dt; c.pitch=clamp(c.pitch+lu*1.6*SET.sens*dt,-.2,.9); if(c.lock&&!B.dead) c.yaw=turnToward(c.yaw,Math.atan2(B.pos.x-A.pos.x,B.pos.z-A.pos.z),5*dt);
  const s=A.kaiju?A.scale:1, cp=Math.cos(c.pitch*.6), dir=V(Math.sin(c.yaw)*cp,-Math.sin(c.pitch*.6),Math.cos(c.yaw)*cp), right=V(-Math.cos(c.yaw),0,Math.sin(c.yaw));
  const pivot=V(A.pos.x,Math.max(0,A.pos.y)+A.chest().y-A.pos.y+2*s,A.pos.z); const tp=pivot.clone().addScaledVector(dir,-(A.kaiju?20:14)*s).addScaledVector(right,(A.kaiju?8:5.5)*s); tp.y=Math.max(tp.y,2);
  if(!c.init){ c.pos.copy(tp); c.init=true; } else c.pos.lerp(tp,1-Math.exp(-14*dt)); look=pivot.clone().addScaledVector(V(Math.sin(c.yaw),0,Math.cos(c.yaw)),30).addScaledVector(right,2.5*s); fov=60; }
 v8cam.fov+=(fov-v8cam.fov)*(1-Math.exp(-(game.cut?3:8)*dt)); if(Math.abs(C.fov-v8cam.fov)>.05){ C.fov=v8cam.fov; C.updateProjectionMatrix(); }
 C.position.copy(c.pos); if(game.shake>0){ C.position.x+=rand(-1,1)*game.shake; C.position.y+=rand(-1,1)*game.shake; C.position.z+=rand(-1,1)*game.shake; }
 C.lookAt(look); c.look.copy(look); const fwd=V(); C.getWorldDirection(fwd);
 if(mode!=='shoulder'||game.cut) c.yaw=Math.atan2(fwd.x,fwd.z); c.pitch=c.pitch||.5;
 if(mode==='shoulder'&&!c.lock&&!game.cut){ inps[0].aimPoint.copy(c.pos).addScaledVector(fwd,110); } else camAim(0,A,B,fwd,c); }
function camClear(p,f){ const t=f.chest(); for(const b of city){ if(b.alive&&b.h>8&&segBox(p,t,b)) return false; } return true; }
// solo fights: keep the field of view steady (wider on phone)
{ const o=updateCamera; updateCamera=function(dt){ const ok=game.mode==='match'&&game.p&&game.state!=='over'&&game.state!=='clip'&&!game.destroy, custom=ok&&(game.cut?(!game.vs2||shared()):(!game.vs2&&['news','fixed','shoulder'].includes(SET.cam)));
  if(game.cut){ game.cut.t+=dt; }
  if(!custom){ o(dt); if(game.mode==='match'&&game.p&&!game.vs2&&game.state==='fight'){ const want=isTouch?72:65; if(Math.abs(camera.fov-want)>.05){ camera.fov+=(want-camera.fov)*Math.min(1,dt*10); camera.updateProjectionMatrix(); } } v8cam.fov=camera.fov; return; }
  v8CamCustom(dt); game.shake*=Math.exp(-6*dt); computeFade(0,dt); camLook.copy(cams[0].look); moon.target.position.set(camLook.x,0,camLook.z); moon.position.set(camLook.x-50,110,camLook.z+40); }; }
{ const o=setAspects; setAspects=function(){ o(); if(game.mode!=='match'){ camera.fov=65; camera.updateProjectionMatrix(); } }; }
