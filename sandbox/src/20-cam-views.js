/* =====================================================================
   SANDBOX 17 (Nov 8, 2026): CAMERA VIEWS YOU CAN FLIP IN THE FIGHT + ACTION CAM.
   MajorasPride: "we need different toggled camera views" (his brother asked for a third-person
   shooter style view). Named ACTION CAM (MajorasPride: don't name it after the game).
   - small round 🎥 button (next to FULLSCREEN; PC: C key; Sandbox 17b: icon only, the view's name shows for 1s when you tap it) flips through the views in the middle of a fight,
     with a 1-second name tag:
     TITAN CAM (default) → ACTION CAM → OVER THE SHOULDER (close) → FREE BEHIND → FIXED → NEWS CAM (once unlocked)
   - ACTION CAM (third-person shooter style): the camera rides above and behind your
     titan's right shoulder, with a crosshair in the middle of the screen. Your titan turns to face where
     you aim and strafes when you move sideways, and attacks and shots go where the crosshair points.
     Drag / mouse / right stick turns the view. LOCK still locks on (the camera swings to the rival).
     It's a bit farther back than the close shoulder view because titans are huge.
   Never saved in the sandbox; the game isn't affected.
   ===================================================================== */
const CAMVIEWS=[['melee','TITAN CAM'],['action','ACTION CAM'],['shoulder','OVER THE SHOULDER'],['behind','FREE BEHIND'],['fixed','FIXED CAMERAS'],['news','NEWS CAM']];
function camViewName(){ const v=CAMVIEWS.find(x=>x[0]===(SET.cam||'melee')); return v?v[1]:'TITAN CAM'; }
function camCycle(){ let i=CAMVIEWS.findIndex(x=>x[0]===(SET.cam||'melee'));
 for(let k=0;k<CAMVIEWS.length;k++){ i=(i+1)%CAMVIEWS.length; if(CAMVIEWS[i][0]==='news'&&!(V8.wins>0)) continue; break; }
 SET.cam=CAMVIEWS[i][0]; for(const c of cams){ c.init=false; c.free=false; } toast('🎥 '+CAMVIEWS[i][1],'#7fd4ff',1000); const b=el('sbCam'); if(b) b.title='Camera: '+CAMVIEWS[i][1]; }
// the ACTION CAM
function actionCam(dt){ const A=game.p, B=game.e, c=cams[0], C=camera, Pd=pads[0];
 const lk=(isDown('lookR',0)?1:0)-(isDown('lookL',0)?1:0)+Pd.rx, lu=(isDown('lookD',0)?1:0)-(isDown('lookU',0)?1:0)+Pd.ry*(SET.invert?-1:1);
 if(!c.lock) c.yaw-=lk*2.4*SET.sens*dt; c.pitch=clamp((c.pitch==null?.35:c.pitch)+lu*1.6*SET.sens*dt,-.25,.95);
 if(c.lock&&!B.dead) c.yaw=turnToward(c.yaw,Math.atan2(B.pos.x-A.pos.x,B.pos.z-A.pos.z),5*dt);
 const s=A.scale||1, big=A.kaiju?1.35:1, cp=Math.cos(c.pitch*.6), dir=V(Math.sin(c.yaw)*cp,-Math.sin(c.pitch*.6),Math.cos(c.yaw)*cp), right=V(-Math.cos(c.yaw),0,Math.sin(c.yaw));
 const pivot=V(A.pos.x,Math.max(0,A.pos.y)+A.chest().y-A.pos.y+4*s*big,A.pos.z);
 const tp=pivot.clone().addScaledVector(dir,-19*s*big).addScaledVector(right,7.5*s*big); tp.y=Math.max(tp.y,3);
 if(!c.init){ c.pos.copy(tp); c.init=true; } else c.pos.lerp(tp,1-Math.exp(-12*dt));
 const look=pivot.clone().addScaledVector(dir,60).addScaledVector(right,2*s);
 const fov=isTouch?72:66; if(Math.abs(C.fov-fov)>.05){ C.fov+=(fov-C.fov)*Math.min(1,dt*8); C.updateProjectionMatrix(); } v8cam.fov=C.fov;
 C.position.copy(c.pos); if(game.shake>0){ C.position.x+=rand(-1,1)*game.shake; C.position.y+=rand(-1,1)*game.shake; C.position.z+=rand(-1,1)*game.shake; }
 C.lookAt(look); c.look.copy(look); const fwd=V(); C.getWorldDirection(fwd);
 if(!c.lock) inps[0].aimPoint.copy(c.pos).addScaledVector(fwd,140); else camAim(0,A,B,fwd,c);
 game.shake*=Math.exp(-6*dt); computeFade(0,dt); camLook.copy(c.look); moon.target.position.set(camLook.x,0,camLook.z); moon.position.set(camLook.x-50,110,camLook.z+40); }
{ const o=updateCamera; updateCamera=function(dt){
  const ok=SET.cam==='action'&&game.mode==='match'&&game.p&&game.state!=='over'&&game.state!=='clip'&&!game.destroy&&!game.vs2&&!game.cut&&!(typeof CINE!=='undefined'&&CINE.on);
  if(!ok) return o(dt); actionCam(dt); }; }
// your titan faces the crosshair (strafes) in ACTION CAM when you're not locked on
{ const oU=FP.update; FP.update=function(dt,inp,opp){ const r=oU.call(this,dt,inp,opp);
  if(SET.cam==='action'&&this===game.p&&!game.vs2&&!cams[0].lock&&!this.dead&&!this.flying&&!(typeof CINE!=='undefined'&&CINE.on)&&dt>0) this.yaw=turnToward(this.yaw,cams[0].yaw,(this.atk?14:9)*dt);
  return r; }; }
// the crosshair shows in ACTION CAM (phone too) while you're not locked on
{ const o=indicators; indicators=function(i,x0,w,showIt){ o(i,x0,w,showIt); if(i===0&&showIt&&SET.cam==='action'&&!game.vs2){ const xh=el('xhair'); xh.classList.toggle('hidden',!!cams[0].lock); xh.style.left=(x0+w/2)+'px'; } }; }
// 🎥 button + C key
{ const s=document.createElement('style'); s.textContent=`#sbCam{position:fixed;left:292px;top:70px;z-index:20;width:34px;height:34px;padding:0;background:#0e1621dd;border:2px solid #7fd4ff99;color:#cfe3f5;border-radius:50%;font-size:16px;line-height:30px;text-align:center;cursor:pointer;pointer-events:auto}
body.vcine #sbCam{visibility:hidden!important}`; document.head.appendChild(s);
  const b=document.createElement('button'); b.id='sbCam'; b.textContent='🎥'; b.title='Camera: '+camViewName(); document.body.appendChild(b);
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); camCycle(); });
  addEventListener('keydown',e=>{ if(e.code==='KeyC'&&!e.repeat&&game.mode==='match') camCycle(); }); }
// keep the 🎥 button lined up just right of FULLSCREEN on any screen
function camBtnPlace(){ const f=el('sbFull'), b=el('sbCam'); if(!f||!b) return; const r=f.getBoundingClientRect(); if(!r.width) return;
 b.style.left=(r.right+6)+'px'; b.style.top=(r.top+(r.height-34)/2)+'px'; }
addEventListener('resize',()=>setTimeout(camBtnPlace,60)); setInterval(camBtnPlace,1000); setTimeout(camBtnPlace,300);
