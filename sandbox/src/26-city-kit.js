/* =====================================================================
   SANDBOX 26 (Nov 13, 2026): NEON CITY KIT (Blender) — test level.
   MajorasPride: make a new level from the city kit test set. 6 original Neon City buildings
   (Needle Tower, Ribbon Office, Stack Apartments, Arcade Strip, Tier Tower, Sawtooth Warehouse),
   each with INTACT, DAMAGED and RUBBLE versions + pre-broken CHUNKS, a road tile and a neon billboard,
   hitboxes on everything. Low-poly, toon colours + outlines. Made in Blender from code:
   sandbox/tools/blender/city_kit.py writes the models into 26-city-kit-data.js (CITYKIT).
   His picks: mixed skyline, waist-to-2x titan height, hits swap intact -> damaged -> rubble and the
   chunks fly off and settle.
   How it plugs in (sandbox only, the game is untouched):
   - makeCity() still lays out the city. With CITY KIT on, every classic building is dressed with the
     kit model nearest its height (facing the arena centre), and its collision box (w, d, h) is set from
     the kit's hitbox, so walking, wall slams and building hits use the new shapes.
   - bStage(): health under 70% swaps to the DAMAGED model (+2 chunks pop off). crumble(): RUBBLE pile
     + all the building's real chunks fly out and settle (they keep their windows and neon).
   - Roads: kit road tiles laid along the lanes near the centre; billboards beside some roads.
   - ⚙ > CITY KIT (NEW): CITY KIT on/off (↻ restarts the fight) and HITBOXES (show the boxes).
   ===================================================================== */
const CK={on:true,show:false,geo:{},mats:{},objs:[],flying:[]};
function ckDecode(b64){ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i);
 const a=new Int16Array(u.buffer), f=new Float32Array(a.length); for(let i=0;i<a.length;i++) f[i]=a[i]/50; return f; }
function ckMat(key){ if(CK.mats[key]) return CK.mats[key]; const c=CITYKIT.palette[key]||'#ff00ff';
 const glow=CITYKIT.glow.includes(key);
 let m;
 if(glow){ m=new THREE.MeshBasicMaterial({color:new THREE.Color(c),toneMapped:false}); m.userData.glow=1; }
 else { m=std(new THREE.Color(c).getHex(),.85,.05); m.flatShading=true; }
 return CK.mats[key]=m; }
// one THREE.Group per model; geometry is decoded once and shared
function ckModel(id,groups,outline){ const G=new THREE.Group();
 for(const key in groups){ const gk=id+'|'+key; let g=CK.geo[gk];
  if(!g){ g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(ckDecode(groups[key]),3)); g.computeVertexNormals(); g.computeBoundingBox(); CK.geo[gk]=g; }
  const m=new THREE.Mesh(g,ckMat(key)); m.castShadow=!ckMat(key).userData.glow; m.receiveShadow=true; G.add(m);
  if(outline&&!ckMat(key).userData.glow){ const ek=gk+'|e'; if(!CK.geo[ek]) CK.geo[ek]=new THREE.EdgesGeometry(g,28);
   const l=new THREE.LineSegments(CK.geo[ek],CK.line||(CK.line=new THREE.LineBasicMaterial({color:0x07070b}))); l.raycast=()=>{}; G.add(l); } }
 return G; }
function ckHitbox(hb,col){ const m=new THREE.Mesh(new THREE.BoxGeometry(hb[3],hb[4],hb[5]),new THREE.MeshBasicMaterial({color:col||0x3dff9a,wireframe:true,transparent:true,opacity:.6}));
 m.position.set(hb[0],hb[1],hb[2]); m.raycast=()=>{}; m.userData.ckhb=1; m.visible=CK.show; return m; }
function ckAdd(o){ scene.add(o); CK.objs.push(o); return o; }
function ckClear(){ for(const o of CK.objs) scene.remove(o); CK.objs=[]; for(const f of CK.flying) scene.remove(f.m); CK.flying=[]; }

// pick the kit building closest to the slot's height (a little random so the skyline mixes)
function ckPick(h){ const B=CITYKIT.buildings; const s=B.map((b,i)=>[Math.abs(b.size[1]-h)+Math.random()*6,i]).sort((a,b)=>a[0]-b[0]); return B[s[0][1]]; }

function ckDress(b){ const K=ckPick(b.h0); const hb=K.hitbox.intact;
 // face the arena centre: kit fronts look down +z
 const yaw=Math.round(Math.atan2(-b.x,-b.z)/(Math.PI/2))*(Math.PI/2), side=Math.abs(Math.round(yaw/(Math.PI/2)))%2===1;
 const kw=side?hb[5]:hb[3], kd=side?hb[3]:hb[5];
 const sx=b.w/kw, sz=b.d/kd, s=Math.min(1.15,Math.max(.85,(sx+sz)/2));     // keep the kit's proportions
 const W=kw*s, D=kd*s, H=hb[4]*s;
 const root=new THREE.Group(); root.position.set(b.x,0,b.z); root.rotation.y=yaw; root.scale.setScalar(s); ckAdd(root);
 const mk=(k,col)=>{ const g=ckModel(K.id+'.'+k,K[k],true); g.add(ckHitbox(K.hitbox[k],col)); root.add(g); return g; };
 const intact=mk('intact'), damaged=mk('damaged',0xffd23f); damaged.visible=false;
 // old box stays as the collider holder only: hide it, its outline, cracks and old signs
 b.mesh.material.visible=false; if(b.hull) b.hull.visible=false; if(b.signs) b.signs.visible=false;
 b.w=W; b.d=D; b.h=b.h0=H; b.mesh.position.y=H/2; b.mesh.scale.y=H/(b.mesh.geometry.parameters?b.mesh.geometry.parameters.height||H:H);
 b.hpMax=Math.round(30+H*2.3+W*D/8); b.hp=b.hpMax;
 b.ck={K,root,intact,damaged,s,yaw,stage:0};
}
function ckChunk(b,c,power,dx,dz){ const ck=b.ck; const m=ckModel(ck.K.id+'.chunk'+ck.K.chunks.indexOf(c),c.mesh,true);
 m.add(ckHitbox([0,0,0,c.hitbox[3],c.hitbox[4],c.hitbox[5]],0xff3fb4));
 const p=new THREE.Vector3(c.at[0],c.at[1],c.at[2]).multiplyScalar(ck.s).applyAxisAngle(new THREE.Vector3(0,1,0),ck.yaw);
 m.position.set(b.x+p.x,p.y,b.z+p.z); m.rotation.y=ck.yaw; m.scale.setScalar(ck.s); scene.add(m);
 const out=new THREE.Vector3(p.x,0,p.z).normalize();
 const v=new THREE.Vector3(out.x*rand(3,8)*power+(dx||0)*10*power,rand(2,9)*power,out.z*rand(3,8)*power+(dz||0)*10*power);
 CK.flying.push({m,v,spin:new THREE.Vector3(rand(-3,3),rand(-3,3),rand(-3,3)),half:c.hitbox[4]*ck.s*.35,life:14,rest:0}); }

// ---- hooks into the game's building system ----
{ const o=makeCity; makeCity=function(){ ckClear(); o(); if(!CK.on) return;
  for(const b of city){ if(!b.kc&&b.mesh) ckDress(b); }
  ckRoads(); }; }
{ const o=bStage; bStage=function(b,dx,dz){ if(!b.ck) return o(b,dx,dz);
  const f=b.hp/b.hpMax; if(f<.7&&b.ck.stage===0){ b.ck.stage=1; b.ck.intact.visible=false; b.ck.damaged.visible=true;
   const C=b.ck.K.chunks.slice().sort((p,q)=>q.at[1]-p.at[1]); for(let i=0;i<2&&i<C.length;i++) ckChunk(b,C[i],.7,dx,dz);
   dust(b.x,b.z,Math.max(b.w,b.d)*.5,3); Snd.crumble(); }
  if(f<.25&&!b.ck.lean){ b.ck.lean=1; const l=Math.hypot(dx||0,dz||0)||1; b.ck.root.rotation.x=-(dz||0)/l*.05; b.ck.root.rotation.z=(dx||0)/l*.05; } }; }
{ const o=crumble; crumble=function(b,dx,dz,by){ if(!b.ck||!b.alive) return o(b,dx,dz,by);
  dx=dx||0; dz=dz||0; b.alive=false; if(b.trig) trigBroken(b); hlCol(b); game.stats.buildings++; maybeDrop(b.x,b.z);
  const ck=b.ck; ck.intact.visible=ck.damaged.visible=false; b.mesh.visible=false; if(b.crk) b.crk.visible=false;
  const r=ckModel(ck.K.id+'.rubble',ck.K.rubble,true); r.add(ckHitbox(ck.K.hitbox.rubble,0xff6a1a)); ck.root.add(r); ck.root.rotation.x=ck.root.rotation.z=0;
  for(const c of ck.K.chunks) ckChunk(b,c,1,dx,dz);
  dust(b.x,b.z,Math.max(b.w,b.d)*.7,7); Snd.crumble(); game.shake=Math.max(game.shake,.5);
  peopleBlast(b.x,b.z,Math.max(b.w,b.d)*.8); }; }
// chunks fly, tumble, bounce and settle on the ground (they stay a while, then sink away)
{ const o=updateFX; updateFX=function(dt){ o(dt);
  for(let i=CK.flying.length-1;i>=0;i--){ const f=CK.flying[i]; f.life-=dt;
   if(f.life<=0){ scene.remove(f.m); CK.flying.splice(i,1); continue; }
   if(f.life<1.5){ f.m.position.y-=dt*2; continue; }
   if(f.rest) continue;
   f.v.y-=36*dt; f.m.position.addScaledVector(f.v,dt); f.m.rotation.x+=f.spin.x*dt; f.m.rotation.y+=f.spin.y*dt; f.m.rotation.z+=f.spin.z*dt;
   if(f.m.position.y<f.half){ f.m.position.y=f.half; f.v.y*=-.3; f.v.x*=.5; f.v.z*=.5; f.spin.multiplyScalar(.45);
    if(Math.abs(f.v.y)<1.5&&Math.hypot(f.v.x,f.v.z)<1){ f.rest=1; } } }
  }; }
// roads on the lanes near the centre + a few billboards
function ckRoads(){ const R=CITYKIT.props.find(p=>p.id==='road_straight'), B=CITYKIT.props.find(p=>p.id==='neon_billboard'); if(!R) return;
 const lane=LANE, half=lane/2; let n=0;
 for(let i=-4;i<=4;i++) for(let j=-4;j<=4;j++){ const x=i*lane+half, z=j*lane;
  if(Math.hypot(x,z)>ARENA*.62) continue; if(inBuilding(x,z,-2)) continue; if(typeof riverDist==='function'&&riverDist(x,z)<RIVER.w/2+4) continue;
  const g=ckModel('road',R.mesh,false); g.position.set(x,.02,z); g.rotation.y=(i+j)&1?0:Math.PI/2; g.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); ckAdd(g);
  if(B&&n<6&&Math.random()<.18){ const bb=ckModel('billboard',B.mesh,true); bb.add(ckHitbox(B.hitbox,0x29e3ff)); bb.position.set(x+half-2,0,z); bb.rotation.y=Math.atan2(-x,-z); ckAdd(bb); n++; } } }
function ckShow(v){ CK.show=v; scene.traverse(o=>{ if(o.userData&&o.userData.ckhb) o.visible=v; }); }

// ---- ⚙ menu: CITY KIT (NEW) ----
function ckUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-ck]')) return; const kit=el('sbKit'); if(!kit) return;
 const d=document.createElement('div'); d.className='sec';
 d.innerHTML=`<div class="lbl">CITY KIT (NEW · SANDBOX 26) — Blender buildings: hit them to see damaged → rubble + flying chunks</div><div class="row"><button data-ck="on">CITY KIT ↻</button><button data-ck="hb">HITBOXES</button></div>`;
 kit.closest('.sec').parentNode.insertBefore(d,kit.closest('.sec'));
 d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation();
  if(b.dataset.ck==='on'){ CK.on=!CK.on; toast('CITY KIT: '+(CK.on?'ON':'OFF (classic boxes)'),'#29e3ff',900); sbStart(); sbMenuOpen(true); }
  else { ckShow(!CK.show); toast('KIT HITBOXES: '+(CK.show?'ON':'OFF'),'#3dff9a',800); }
  ckSync(); }); }
function ckSync(){ document.querySelectorAll('#sbMenu [data-ck]').forEach(b=>b.classList.toggle('on',b.dataset.ck==='on'?CK.on:CK.show)); }
{ const oS=sbStart; sbStart=function(){ oS(); ckUI(); ckSync(); }; }
{ const oS=sbSync; sbSync=function(){ oS(); ckUI(); ckSync(); }; }
