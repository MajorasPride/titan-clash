/* =====================================================================
   SANDBOX TEST 15: CUTSCENES ONLY HIDE THE BUILDINGS IN THE WAY (Nov 7, 2026)
   MajorasPride: "I mean just interactive building, just to show the cutscene." The city stays; every frame of an
   ultimate cutscene, only the buildings standing between the camera and the two titans are hidden, and they come
   back as soon as they're out of the way (and when the cutscene ends). Replaces hiding the whole city (Sandbox 12b).
   ===================================================================== */
cityHide=function(a,on){};   // the Sandbox 12b "hide the whole city" is switched off
const VIEW={hid:new Set()};
function bParts(b){ return [b.mesh,b.hull,b.crk].filter(m=>m&&m.isObject3D); }
function segHitsBox(x0,z0,x1,z1,b,pad){ const minX=b.x-b.w/2-pad, maxX=b.x+b.w/2+pad, minZ=b.z-b.d/2-pad, maxZ=b.z+b.d/2+pad;
 let t0=0,t1=1; const dx=x1-x0, dz=z1-z0;
 for(const [p,d,lo,hi] of [[x0,dx,minX,maxX],[z0,dz,minZ,maxZ]]){ if(Math.abs(d)<1e-6){ if(p<lo||p>hi) return false; continue; }
  let ta=(lo-p)/d, tb=(hi-p)/d; if(ta>tb){ const t=ta; ta=tb; tb=t; } t0=Math.max(t0,ta); t1=Math.min(t1,tb); if(t0>t1) return false; } return true; }
function viewClear(){ const f=CINE.f, o=CINE.o; if(!f||!o) return; const c=camera.position, want=new Set();
 for(const b of city){ if(!b.alive&&!(b.mesh&&b.mesh.visible)) continue;
  for(const t of [f.pos,o.pos,f.chest(),o.chest()]){ if(segHitsBox(c.x,c.z,t.x,t.z,b,4)){ want.add(b); break; } } }
 for(const b of VIEW.hid) if(!want.has(b)){ for(const m of bParts(b)) m.visible=true; VIEW.hid.delete(b); }
 for(const b of want) if(!VIEW.hid.has(b)){ const parts=bParts(b); if(!parts.some(m=>m.visible)) continue; for(const m of parts) m.visible=false; VIEW.hid.add(b); } }
function viewRestore(){ for(const b of VIEW.hid) for(const m of bParts(b)) m.visible=true; VIEW.hid.clear(); }
{ const oC=updateCamera; updateCamera=function(dt){ const r=oC(dt); if(CINE.on&&game.mode==='match'){ try{ viewClear(); }catch(e){ console.error(e); } } else if(VIEW.hid.size) viewRestore(); return r; }; }
{ const o=cineEnd; cineEnd=function(){ o(); viewRestore(); }; }
{ const oR=sbReset; sbReset=function(){ viewRestore(); oR(); }; }
