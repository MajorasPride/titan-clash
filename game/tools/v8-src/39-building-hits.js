/* =====================================================================
   v8.4.2 (Nov 7, 2026): BUILDINGS TAKE HITS FROM THE NEW MOVES. MajorasPride: "I can't destroy buildings...
   buildings need hitboxes too." The new kits (VALOR since v8.3, INFERNOTH since v8.4) only checked for the
   rival, never for buildings, so in Destroy the City (no rival) they hit nothing.
   Now every close-up move with a hit moment also hits the buildings in front of the titan, once per swing.
   Building damage by button: LIGHT 14 · MEDIUM 28 · HEAVY 55 (up to 2x when charged) · SPECIAL 45 · other moves 30.
   Ultimates, beams, shots, stomps and grabs already had their own building damage and are left alone.
   ===================================================================== */
const BLDHIT={light:14,medium:28,heavy:55,special:45,other:30,reach:9,width:11};
function bldClass(f,id){ const F=f.F||{};
 if(LIGHT.includes(id)||id===F.J) return 'light';
 if(id===F.K||(HEAVYSET[F.K]&&HEAVYSET[F.K].includes(id))) return 'heavy';
 if(id===F.M) return 'medium'; if(id===F.L) return 'special'; return 'other'; }
function bldSwing(f,a){ const M=MOVES[a.id]||{}; if(a.id==='ultimate'||M.ranged||a.id==='stance'||a.id==='bweave') return;
 const fx=Math.sin(f.yaw), fz=Math.cos(f.yaw), rad=f.radius(), reach=rad+BLDHIT.reach*(f.scale||1);
 const cx=f.pos.x+fx*(rad+reach*.5), cz=f.pos.z+fz*(rad+reach*.5);
 let dmg=BLDHIT[bldClass(f,a.id)]*(1+Math.min(1,a.chg||0)); let n=0;
 for(const b of city){ if(!b.alive) continue;
  const px=clamp(cx,b.x-b.w/2,b.x+b.w/2), pz=clamp(cz,b.z-b.d/2,b.z+b.d/2), dx=px-f.pos.x, dz=pz-f.pos.z, d=Math.hypot(dx,dz);
  if(d>reach+rad*.5) continue; if(d>1&&(dx*fx+dz*fz)/d<.35) continue;                       // only in front of him
  if(f.pos.y-(f._floor||0)>b.h+2) continue;                                                // jumping over the roof
  if(bHit(b,dmg,fx,fz,Math.min(b.h-1,f.pos.y+6*(f.scale||1)),f,px,pz)){ n++; if(n>=2) break; } }
 if(n) game.shake=Math.max(game.shake,.25); }
{ const o=FP.update; FP.update=function(dt,inp,opp){ const r=o.call(this,dt,inp,opp);
  try{ const a=this.atk; if(a&&isCore(this)&&!a._bld&&a.hitAt!=null&&a.t>=a.hitAt&&game.state==='fight'&&game.mode==='match'){ a._bld=1; bldSwing(this,a); } }catch(e){ console.error(e); }
  return r; }; }
