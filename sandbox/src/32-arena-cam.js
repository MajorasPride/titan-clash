/* =====================================================================
   SANDBOX 32 (Nov 23, 2026): ARENA CAM. MajorasPride (showing the new Godzilla game's view): "why isn't there
   a camera that goes and focuses on the fight?" A raised, side-on fighting-game camera: it looks across the
   line between the two titans, keeps BOTH on screen, and zooms out as they move apart and in when they clinch.
   It turns slowly and always takes the nearer side, so it never flips or zips around (the Godzilla game's
   reviews complain about exactly that). It is a new view on the 🎥 button and the sandbox starts in it.
   Tune: ACAM.near / far (zoom), ACAM.rise (how high), ACAM.turn (how fast it swings). Sandbox only.
   ===================================================================== */
const ACAM={near:30,far:120,zoom:.85,rise:.46,turn:1.1,yaw:null};
CAMVIEWS.push(['arena','ARENA CAM']);
function arenaCam(dt){ const A=game.p, B=game.e, c=cams[0], C=camera, s=Math.max(A.scale||1,B.scale||1);
 const dx=B.pos.x-A.pos.x, dz=B.pos.z-A.pos.z, sep=Math.hypot(dx,dz);
 if(ACAM.yaw==null){ let w=Math.atan2(dx,dz)+Math.PI/2; if(Math.abs(angDiff(w,c.yaw||0))>Math.PI/2) w+=Math.PI; ACAM.yaw=w; }   // start side-on, on the side nearest the old view
 if(sep>6*s){ let want=Math.atan2(dx,dz)+Math.PI/2, d=angDiff(want,ACAM.yaw); if(Math.abs(d)>Math.PI/2){ want+=Math.PI; d=angDiff(want,ACAM.yaw); }
  ACAM.yaw+=clamp(d*2,-ACAM.turn,ACAM.turn)*dt; }
 const tall=innerHeight>innerWidth?1.5:1, dist=clamp(ACAM.near*s+sep*ACAM.zoom,ACAM.near*s,ACAM.far*s)*tall;
 const mx=(A.pos.x+B.pos.x)/2, mz=(A.pos.z+B.pos.z)/2, my=Math.max(0,A.pos.y,B.pos.y)*.35+7*s;
 const tp=V(mx-Math.sin(ACAM.yaw)*dist,my+dist*ACAM.rise,mz-Math.cos(ACAM.yaw)*dist), look=V(mx,my,mz);
 if(!c.init){ c.pos.copy(tp); c.look.copy(look); c.init=true; } else { c.pos.lerp(tp,1-Math.exp(-4*dt)); c.look.lerp(look,1-Math.exp(-6*dt)); }
 c.yaw=ACAM.yaw;                                         // stick up = away from the camera
 const fov=isTouch?58:50; if(Math.abs(C.fov-fov)>.05){ C.fov+=(fov-C.fov)*Math.min(1,dt*8); C.updateProjectionMatrix(); } v8cam.fov=C.fov;
 C.position.copy(c.pos); if(game.shake>0){ C.position.x+=rand(-1,1)*game.shake; C.position.y+=rand(-1,1)*game.shake; C.position.z+=rand(-1,1)*game.shake; }
 C.lookAt(c.look); if(!B.dead) inps[0].aimPoint.copy(B.chest());   // attacks and shots go at the rival, like a fighting game
 game.shake*=Math.exp(-6*dt); try{ computeFade(0,dt); }catch(e){}
 camLook.copy(c.look); moon.target.position.set(camLook.x,0,camLook.z); moon.position.set(camLook.x-50,110,camLook.z+40); }
{ const o=updateCamera; updateCamera=function(dt){
  const ok=SET.cam==='arena'&&game.mode==='match'&&game.p&&game.e&&game.state!=='over'&&game.state!=='clip'&&!game.destroy&&!game.vs2&&!game.cut&&!(typeof CINE!=='undefined'&&CINE.on);
  if(!ok){ ACAM.yaw=null; return o(dt); } arenaCam(dt); }; }
try{ SET.cam='arena'; }catch(e){}
