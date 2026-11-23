/* =====================================================================
   SANDBOX 34 (Nov 23, 2026): NEON CITY WATERFRONT (floor 2 of the new city). MajorasPride: "all of them, keep
   building". Scenery along the bay, just outside the fight ring so nothing blocks the fight yet:
   - the elevated HARBOR TRAIN: viaduct, 3 stations (HARBOR, NEON CENTRAL, LANTERN TOWN), a 3-car train that
     runs back and forth and waits at each station
   - the FERRIS WHEEL (turning, pink ring), the CRUISE SHIP at the pier, the BAY TORII standing in the water
   - two skyline landmarks from the new landmark designs: BEACON SPIRE (west) and the RED-WHITE BROADCAST TOWER (east)
   THE TRAIN RULE is in: throw a building or car into the line and the train stops; if it is between stations it
   falls off the rails. The rest is looks only for now (no collisions, no throwing train cars, no tsunami).
   Switch: NCL.on. Sandbox only.
   ===================================================================== */
const NCL={on:true,g:null,wheel:null,train:[],tx:-200,dir:1,wait:1.5,TZ:186,DY:14};
const nclL=c=>new THREE.MeshLambertMaterial({color:c}), nclG=c=>new THREE.MeshBasicMaterial({color:c});
function nclBox(g,w,h,d,m,x,y,z){ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x||0,y||0,z||0); g.add(o); return o; }
function nclCyl(g,rt,rb,h,m,x,y,z,s){ const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s||8),m); o.position.set(x||0,y||0,z||0); g.add(o); return o; }
function nclBuild(){ if(NCL.g){ scene.remove(NCL.g); NCL.g=null; } NCL.train=[]; NCL.wheel=null; NCL.broken=false; NCL.fall=null; NCL.tx=-200; NCL.dir=1; NCL.wait=1.5; if(!NCL.on||!NCM.g) return;
 const g=NCL.g=new THREE.Group(); scene.add(g); const TZ=NCL.TZ, DY=NCL.DY, steel=nclL(0x4a4e5c), dark=nclL(0x34384a), white=nclL(0xeef0f6), red=nclL(0xd8402a);
 // elevated harbor train
 nclBox(g,580,1.2,5,steel,0,DY-.6,TZ); nclBox(g,580,.3,.4,nclG(0x29e3ff),0,DY+.2,TZ-2.6);
 for(let x=-280;x<=280;x+=28) nclBox(g,2,DY-1,2,dark,x,(DY-1)/2,TZ);
 for(const sx of [-200,0,200]){ nclBox(g,40,1,11,nclL(0x5a5e70),sx,DY+.1,TZ+2); nclBox(g,40,.7,12,nclG(sx?0xff3fb4:0xffd23f),sx,DY+8,TZ+2); for(const e of [-18,18]) nclBox(g,1.2,8,1.2,dark,sx+e,DY+4,TZ+6); nclBox(g,12,12,9,dark,sx,6,TZ+9); }
 for(let i=0;i<3;i++){ const c=new THREE.Group(); nclBox(c,13,4.4,4,white); nclBox(c,13.1,1.1,4.1,nclG(0xffd28a),0,.5,0); nclBox(c,13.1,.5,4.1,red,0,-1.6,0); c.position.set(0,DY+2.3,TZ); g.add(c); NCL.train.push(c); }
 // ferris wheel
 const F=new THREE.Group(); F.position.set(-118,0,216); g.add(F); for(const s of [-1,1]){ const l=nclBox(F,1.6,40,1.6,nclL(0x8a8f98),s*10,18,0); l.rotation.z=s*.27; }
 const W=NCL.wheel=new THREE.Group(); W.position.y=36; F.add(W); const ring=new THREE.Mesh(new THREE.TorusGeometry(27,.7,6,40),nclG(0xff3fb4)); W.add(ring);
 for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, sp=nclBox(W,.5,27,.5,nclL(0x8a8f98),Math.cos(a)*13.5,Math.sin(a)*13.5,0); sp.rotation.z=a-Math.PI/2; nclBox(W,4,3.6,4,nclG([0x29e3ff,0xffd23f,0x3dff9a][i%3]),Math.cos(a)*27,Math.sin(a)*27,0); }
 // pier + cruise ship
 nclBox(g,12,1.2,70,nclL(0x5a4a3a),70,.6,NCM_SHORE+34);
 const S=new THREE.Group(); S.position.set(92,0,NCM_SHORE+44); g.add(S); nclBox(S,18,10,78,white,0,3,0); nclBox(S,18.2,2.4,78.2,nclL(0x1d2a44),0,-.6,0);
 nclBox(S,15,4,60,white,0,10,-3); nclBox(S,15.2,.8,60.2,nclG(0x29e3ff),0,10.4,-3); nclBox(S,13,4,46,white,0,14,-6); nclBox(S,13.2,.8,46.2,nclG(0x29e3ff),0,14.4,-6); nclCyl(S,2.6,3.2,8,red,0,20,-14,10);
 // bay torii
 const T=new THREE.Group(); T.position.set(0,0,NCM_SHORE+70); g.add(T); for(const s of [-1,1]){ nclCyl(T,2.2,2.8,44,red,s*17,22,0); nclCyl(T,3.4,3.4,3,dark,s*17,1.5,0); }
 nclBox(T,48,3.4,4.4,red,0,44,0); nclBox(T,54,2.2,5.4,dark,0,47.4,0); nclBox(T,40,2.6,3,red,0,35,0);
 // beacon spire (west skyline)
 const B=new THREE.Group(); B.position.set(-215,0,120); g.add(B); nclCyl(B,5,9,70,nclL(0x2c3346),0,35,0); for(let i=1;i<7;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(9.6-i*.55,.35,6,24),nclG(0x29e3ff)); r.rotation.x=Math.PI/2; r.position.y=i*10; B.add(r); }
 nclCyl(B,6,6,4,nclG(0xffd28a),0,76,0); nclCyl(B,3,7,4,red,0,80,0); nclCyl(B,.3,.9,22,white,0,93,0,6);
 // red-white broadcast tower (east skyline)
 const R=new THREE.Group(); R.position.set(222,0,-120); g.add(R); for(let i=0;i<7;i++){ const m=i%2?white:red, w0=24-i*3, w1=21-i*3; for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const o=nclBox(R,1.3,11.4,1.3,m,sx*(w0+w1)/4,i*11+5.5,sz*(w0+w1)/4); o.rotation.z=sx*.13; o.rotation.x=-sz*.13; } nclBox(R,w1,.7,w1,m,0,i*11+11,0); }
 nclBox(R,12,4,12,white,0,35,0); nclBox(R,12.4,1,12.4,nclG(0xffd28a),0,35,0); nclCyl(R,.4,1,26,red,0,90,0,6); }
function nclTick(dt){ if(!NCL.g||!(dt>0)) return; if(NCL.wheel) NCL.wheel.rotation.z+=dt*.12;
 // HIS RULE: hit the line = the train stops. If it is not at a station when it stops, it falls off the rails.
 if(!NCL.broken) for(const pr of props){ if(pr.state!=='fly'||!pr.obj) continue; const q=pr.obj.position;
  if(Math.abs(q.z-NCL.TZ)<7&&q.y<NCL.DY+9&&Math.abs(q.x)<290){ NCL.broken=true; const atSt=[-200,0,200].some(sx=>Math.abs(NCL.tx-sx)<3);
   try{ burst(V(q.x,NCL.DY,NCL.TZ),'#ffd23f',30,22); game.shake=Math.max(game.shake,.6); Snd.boom&&Snd.boom(); }catch(e){}
   if(atSt){ toast('RAIL HIT! THE TRAIN IS STUCK AT THE STATION','#ffd23f',1600); }
   else { NCL.fall=0; NCL.train.forEach((c,i)=>{ c.userData.v=new THREE.Vector3((Math.random()-.5)*6,2+i,-(6+i*3)); c.userData.sp=(Math.random()-.5)*3; }); toast('THE TRAIN IS OFF THE RAILS!','#ff6a4a',1800); try{ News.add('THE HARBOR TRAIN HAS BEEN KNOCKED OFF ITS RAILS!',true); }catch(e){} }
   break; } }
 if(NCL.broken){ if(NCL.fall!=null){ NCL.fall+=dt; for(const c of NCL.train){ const v=c.userData.v; if(!v) continue; v.y-=30*dt; c.position.addScaledVector(v,dt); c.rotation.z+=c.userData.sp*dt; c.rotation.x+=dt*.8;
    if(c.position.y<2.4){ c.position.y=2.4; c.userData.v=null; try{ dust(c.position.x,c.position.z,6,5); game.shake=Math.max(game.shake,.4); }catch(e){} } } } return; }
 if(NCL.wait>0) NCL.wait-=dt; else { const before=NCL.tx; NCL.tx+=NCL.dir*30*dt;
  for(const sx of [-200,0,200]) if((before-sx)*(NCL.tx-sx)<=0&&before!==sx){ NCL.tx=sx; NCL.wait=2.2; if(sx===200*NCL.dir) NCL.dir*=-1; }
  if(Math.abs(NCL.tx)>201){ NCL.tx=Math.sign(NCL.tx)*200; NCL.dir*=-1; NCL.wait=2.2; } }
 NCL.train.forEach((c,i)=>c.position.x=NCL.tx+(i-1)*13.8); }
{ const o=makeCity; makeCity=function(){ o(); try{ nclBuild(); }catch(e){ console.error(e); } }; }
{ const o=updateCamera; updateCamera=function(dt){ o(dt); try{ nclTick(dt); }catch(e){} }; }
