/* =====================================================================
   SANDBOX 31 (Nov 23, 2026): CITY TOYBOX. MajorasPride: the new Godzilla game (Destroy All Monsters Melee
   Remastered) "feels fun to play, ours not so much". Research: its fun is the toybox (lift + throw buildings,
   throw monsters through buildings), not its camera. The game ALREADY has lifting, throwing, THROUGH THE WALL
   and WALL SLAM (tryGrab / liftBuilding / throwHeld / bContact), but the new kits never reach it:
   INFERNOTH and ASHVIN have their own grab moves, only buildings up to 17 tall could be lifted, and
   city-kit buildings could not be lifted at all. This file opens the toybox to every titan:
   1. GRAB next to a small building (rival not in grab range) = rip it up, for every titan and stance.
   2. Holding one: GRAB, LIGHT or HEAVY = throw it.
   3. Buildings up to TOY.maxH tall can be lifted (was 17); city-kit ones are carried as their plain block.
   Switch: TOY.on (false = the old behaviour). Nothing here changes the real game.
   ===================================================================== */
const TOY={on:true,maxH:26};
{ const o=FP.liftableBuilding; FP.liftableBuilding=function(){ if(!TOY.on) return o.call(this);
  let best=null, bd=1e9; const fx=Math.sin(this.yaw), fz=Math.cos(this.yaw), R=this.radius();
  for(const b of city){ if(!b.alive||b.trig||b.kc||!b.mesh||b.h>TOY.maxH||b.h<4) continue;
   const cx=clamp(this.pos.x,b.x-b.w/2,b.x+b.w/2), cz=clamp(this.pos.z,b.z-b.d/2,b.z+b.d/2), d=Math.hypot(cx-this.pos.x,cz-this.pos.z);
   if(d>R+5.5||d>=bd) continue; const ax=b.x-this.pos.x, az=b.z-this.pos.z, al=Math.hypot(ax,az)||1; if((ax*fx+az*fz)/al<.1&&d>R*.6) continue; best=b; bd=d; }
  return best; }; }
{ const o=FP.liftBuilding; FP.liftBuilding=function(b){
  try{ if(TOY.on&&b.ck){ for(const k of ['intact','damaged','rubble']) if(b.ck[k]) b.ck[k].visible=false; b.mesh.visible=true; } }catch(e){ console.error(e); }
  return o.call(this,b); }; }
function toyGrab(f,inp){ if(!TOY.on||!f||!f.def||game.state!=='fight'||f.dead||f.stun>0||f.grabbedBy||f.rollT>0) return;
 if(f.held){ if((inp.grab>0||inp.punch>0||inp.heavy>0)&&!f.atk){ inp.grab=inp.punch=inp.heavy=0; f.startAtk('throw'); } return; }
 if(!(inp.grab>0)||f.atk||f.veh||(f.F&&f.F.hover)) return;
 const o=f.opp; if(o&&!o.dead&&Math.hypot(o.pos.x-f.pos.x,o.pos.z-f.pos.z)<f.radius()+o.radius()+5) return;   // rival in reach: the titan's own grab
 const b=f.liftableBuilding(); if(b){ inp.grab=0; f.liftBuilding(b); } }
{ const o=v8Input; v8Input=function(f,inp,dt){ try{ toyGrab(f,inp); }catch(e){ console.error(e); } return o(f,inp,dt); }; }
