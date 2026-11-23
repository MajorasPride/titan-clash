/* =====================================================================
   SANDBOX 33 (Nov 23, 2026): THE NEW NEON CITY LAYOUT (floor 1). MajorasPride: "can you finally switch our
   neon city for our new one?" The old map scatters buildings in a ring. This lays the city out like the
   Nov 22 Neon City design (Yokohama layout + Osaka canal + Tokyo crossing), centred on the SCRAMBLE CROSSING
   ("Round 1 starts here"), scaled to fit the fight arena:
     - two big avenues meeting at the crossing, with a department store on each of its four corners
     - NEON ALLEYS (north): tight small buildings and thin pencil buildings
     - HARBOR TOWERS (west): a few very tall towers with open plazas
     - NEON CANAL (east): low buildings on both banks of a glowing canal
     - DOCKS (south-west): low wide warehouses   - LANTERN QUARTER (south-east): low shops, close together
     - the waterfront and the BAY to the south
   Buildings are still the game's own (they break, splat and can be ripped up) and get the city-kit models.
   Not here yet (next floors): elevated train + stations, Ferris wheel, cruise ship, pier, landmarks, the
   real district models and signs from the preview page, moving to another section each round.
   Switch: NCM.on (false = the old ring city). Same city every time (fixed seed). Sandbox only.
   ===================================================================== */
const NCM={on:true,g:null,seed:20261122,count:{}};
function ncmRnd(){ NCM.s|=0; NCM.s=NCM.s+0x6D2B79F5|0; let t=Math.imul(NCM.s^NCM.s>>>15,1|NCM.s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }
const NCM_AV={ns:[{c:-144,w:21},{c:0,w:27},{c:144,w:21}], ew:[{c:-120,w:18},{c:0,w:27},{c:120,w:21}]};
const NCM_COLS=[[-272,-154],[-134,-14],[14,134],[154,272]], NCM_ROWS=[[-194,-129],[-111,-14],[14,110]];
const NCM_CANAL={z:-60,w:13,x0:14}, NCM_SHORE=176;
const NCM_D={ // pitch = spacing between buildings (he wants them spaced out), sizes, heights, how many lots stay empty
 alleys:{p:16,w:[8,11],d:[8,11],h:[10,24],skip:.15,tint:0x1b1830},
 edge:{p:21,w:[10,13],d:[10,13],h:[14,24],skip:.25,tint:0x17182a},
 canal:{p:17,w:[8,11],d:[8,11],h:[8,18],skip:.15,tint:0x161e2e},
 lantern:{p:18,w:[8,10.5],d:[8,10.5],h:[7,14],skip:.1,tint:0x241a24},
 harbor:{p:38,w:[15,19],d:[15,19],h:[42,70],skip:0,tint:0x141c2c},
 docks:{p:26,w:[13,16],d:[9,11],h:[8,12],skip:.35,tint:0x1e1c1a}};
function ncmDistrict(ci,ri){ if(ri===0) return (ci===0||ci===3)?'edge':'alleys'; if(ri===1) return ci<2?'harbor':'canal'; return ci===0?'harbor':ci===1?'docks':'lantern'; }
function ncmAdd(x,z,w,d,h,dist){ const r=Math.hypot(x,z);
 const m=new THREE.Mesh(bGeo(w,h,d),bMats[(ncmRnd()*6)|0].clone()); m.position.set(x,h/2,z); m.castShadow=m.receiveShadow=true; scene.add(m);
 const hull=SET.toon?hullFor(m,.22):null, signs=MAP.neon&&r<135?addSigns(m,x,z,w,h,d):null;
 const b=bNew({mesh:m,hull,signs,x,z,w,d,h,alive:true,fd:[1,1],dist}); city.push(b); NCM.count[dist]=(NCM.count[dist]||0)+1;
 if(typeof CK!=='undefined'&&CK.on) try{ ckDress(b); }catch(e){ console.error(e); } return b; }
function ncmPlane(w,d,col,x,y,z,basic){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),basic?new THREE.MeshBasicMaterial({color:col}):new THREE.MeshLambertMaterial({color:col})); m.rotation.x=-Math.PI/2; m.position.set(x,y,z); m.receiveShadow=!basic; NCM.g.add(m); return m; }
function ncmBuild(){ NCM.s=NCM.seed; NCM.count={}; if(NCM.g) scene.remove(NCM.g); NCM.g=new THREE.Group(); scene.add(NCM.g);
 const rr=(a,b)=>a+(b-a)*ncmRnd(), R=ARENA-6;
 // ground: block slabs (tinted per district), avenues, crossing stripes
 ncmPlane(620,460,0x0e0d16,0,.03,-20);
 NCM_ROWS.forEach((RW,ri)=>NCM_COLS.forEach((CL,ci)=>{ const [x0,x1]=CL,[z0,z1]=RW, dist=ncmDistrict(ci,ri), D=NCM_D[dist];
  ncmPlane(x1-x0,z1-z0,D.tint,(x0+x1)/2,.06,(z0+z1)/2);
  const nx=Math.max(1,Math.floor((x1-x0-6)/D.p)), nz=Math.max(1,Math.floor((z1-z0-6)/D.p)), ox=(x1-x0-nx*D.p)/2, oz=(z1-z0-nz*D.p)/2;
  for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){ const x=x0+ox+(i+.5)*D.p+rr(-1,1), z=z0+oz+(j+.5)*D.p+rr(-1,1);
   let w=rr(D.w[0],D.w[1]), d=rr(D.d[0],D.d[1]), h=rr(D.h[0],D.h[1]); const skip=ncmRnd()<D.skip;
   if(dist==='alleys'&&ncmRnd()<.2){ w=7; d=7.5; h=rr(26,34); }                                  // pencil building
   if(skip||Math.hypot(x,z)>R||Math.hypot(x,z)<36) continue;
   if(dist==='canal'&&Math.abs(z-NCM_CANAL.z)<NCM_CANAL.w/2+d/2+3) continue;                   // keep the canal banks clear
   ncmAdd(x,z,w,d,h,dist); } }));
 for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) ncmAdd(sx*25.5,sz*24.5,20,18,rr(30,36),'crossing');   // department stores on the crossing corners
 // avenues: lane lines + zebra crossings at the scramble
 const line=0x6a6a80;
 for(const a of NCM_AV.ns){ ncmPlane(a.w,460,0x15141f,a.c,.08,-20); for(let z=-240;z<170;z+=14) if(Math.abs(z)>20||a.c) ncmPlane(.5,6,line,a.c,.1,z,true); }
 for(const a of NCM_AV.ew){ ncmPlane(620,a.w,0x15141f,0,.08,a.c); for(let x=-300;x<300;x+=14) if(Math.abs(x)>20||a.c) ncmPlane(6,.5,line,x,.1,a.c,true); }
 for(let k=-12;k<=12;k+=2){ for(const s of [-1,1]){ ncmPlane(1.1,7,0xd8d8e8,k,.11,s*17.5,true); ncmPlane(7,1.1,0xd8d8e8,s*17.5,.11,k,true); } }
 for(let k=-11;k<=11;k+=2.4){ const q=ncmPlane(1,30,0xd8d8e8,0,.115,0,true); q.rotation.z=Math.PI/4; q.position.set(k*.9,.115,-k*.9); q.scale.y=.12+.0*k; }
 // the neon canal (east side) with glowing banks
 const cw=300-NCM_CANAL.x0; ncmPlane(cw,NCM_CANAL.w,0x0a3350,NCM_CANAL.x0+cw/2,.14,NCM_CANAL.z,true);
 for(const s of [-1,1]){ ncmPlane(cw,.6,s>0?0xff3fb4:0x29e3ff,NCM_CANAL.x0+cw/2,.2,NCM_CANAL.z+s*NCM_CANAL.w/2,true); }
 for(let x=NCM_CANAL.x0+20;x<170;x+=44){ const br=new THREE.Mesh(new THREE.BoxGeometry(7,.8,NCM_CANAL.w+4),new THREE.MeshLambertMaterial({color:0x3a3650})); br.position.set(x,.6,NCM_CANAL.z); NCM.g.add(br); }
 // waterfront promenade + the bay to the south
 ncmPlane(620,NCM_SHORE-131,0x1a1d2a,0,.07,(NCM_SHORE+131)/2); ncmPlane(620,.8,0xffd23f,0,.12,NCM_SHORE-1,true);
 ncmPlane(1400,700,0x08243c,0,.05,NCM_SHORE+350,true);
}
{ const o=makeCity; makeCity=function(){
  const use=NCM.on&&SB.city&&MAP&&MAP.id==='city'&&!game.destroy;
  if(!use){ if(NCM.g){ scene.remove(NCM.g); NCM.g=null; } return o(); }
  const den=MAP.bDen, roads=ckRoads; MAP.bDen=0; ckRoads=function(){};        // the old ring city and its road tiles stay out
  try{ o(); } finally{ MAP.bDen=den; ckRoads=roads; }
  try{ ncmBuild(); }catch(e){ console.error(e); } }; }
