/* =====================================================================
   SANDBOX 35 (Nov 23, 2026): PICKUPS + RAGE. MajorasPride: "add new fun things too". From the fun research:
   the Godzilla games drop health / energy / rage into the city so there is always something to race for.
   Every 9 to 13 seconds a glowing pickup drops on the streets (max 2 at once). Walk into it:
     GREEN  = REPAIR: +15% health          BLUE = ENERGY: energy bar full
     RED    = RAGE: for 8 seconds your hits do +40% damage; a red ring pulses under the raging titan (it blinks when about to end)
   The CPU can walk into them too. Numbers: PKP.heal, PKP.rage, PKP.rageT, PKP.every. Switch: PKP.on. Sandbox only.
   ===================================================================== */
const PKP={on:true,list:[],t:6,every:[9,13],heal:.15,rage:1.4,rageT:8,
 kinds:{repair:[0x3dff9a,'#3dff9a','REPAIR! +15% HEALTH'],energy:[0x29e3ff,'#29e3ff','ENERGY FULL!'],rage:[0xff4a3a,'#ff6a4a','RAGE! HITS +40% FOR 8 SECONDS']}};
function pkpClear(){ for(const p of PKP.list) scene.remove(p.g); PKP.list=[]; PKP.t=6; }
function pkpSpawn(kind,x,z){ kind=kind||['repair','energy','rage'][(Math.random()*3)|0];
 if(x===undefined) for(let n=0;n<30;n++){ const a=Math.random()*6.283, r=20+Math.random()*90; x=Math.cos(a)*r; z=Math.sin(a)*r; if(!inBuilding(x,z,4)) break; }
 const K=PKP.kinds[kind], g=new THREE.Group(), gem=new THREE.Mesh(new THREE.OctahedronGeometry(2.2,0),new THREE.MeshBasicMaterial({color:K[0]})); gem.position.y=5; g.add(gem);
 const col=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,80,6),new THREE.MeshBasicMaterial({color:K[0],transparent:true,opacity:.3,depthWrite:false})); col.position.y=40; g.add(col);
 g.position.set(x,0,z); scene.add(g); const p={kind,g,gem,x,z}; PKP.list.push(p); return p; }
function pkpTake(f,p){ const K=PKP.kinds[p.kind];
 if(p.kind==='repair') f.hp=Math.min(f.def.hp,f.hp+f.def.hp*PKP.heal); else if(p.kind==='energy') f.energy=100; else f._rageUntil=game.time+PKP.rageT;
 try{ burst(V(p.x,6,p.z),K[1],24,16); Snd.tone&&Snd.tone('square',p.kind==='rage'?300:760,p.kind==='rage'?520:1100,.14); }catch(e){}
 toast(f.isPlayer?K[2]:f.def.name+' GOT '+p.kind.toUpperCase()+'!',K[1],1300); }
// rage aura: a red ring under the raging titan + rising sparks, so both players can see who has RAGE
function pkpAura(f,dt){ const on=PKP.on&&f&&!f.dead&&f._rageUntil>game.time;
 if(!on){ if(f&&f._rageRing){ scene.remove(f._rageRing); f._rageRing=null; } return; }
 if(!f._rageRing){ f._rageRing=new THREE.Mesh(new THREE.RingGeometry(4.2,5.6,28),new THREE.MeshBasicMaterial({color:0xff4a3a,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false})); f._rageRing.rotation.x=-Math.PI/2; scene.add(f._rageRing); }
 const r=f._rageRing, k=1+.18*Math.sin(game.time*10); r.position.set(f.pos.x,.3,f.pos.z); r.scale.setScalar(k*(f.scale||1)); r.material.opacity=(f._rageUntil-game.time<2)?(.3+.5*Math.abs(Math.sin(game.time*14))):.8;
 f._rageFx=(f._rageFx||0)-dt; if(f._rageFx<=0){ f._rageFx=.25; try{ burst(f.chest(),'#ff6a4a',5,9); }catch(e){} } }
function pkpTick(dt){ if(!(dt>0)) return; try{ pkpAura(game.p,dt); pkpAura(game.e,dt); }catch(e){} const live=PKP.on&&game.mode==='match'&&game.state==='fight'&&game.p&&game.e&&!game.destroy;
 if(!live){ if(PKP.list.length&&(!PKP.on||game.state==='over')) pkpClear(); return; }
 PKP.t-=dt; if(PKP.t<=0){ PKP.t=PKP.every[0]+Math.random()*(PKP.every[1]-PKP.every[0]); if(PKP.list.length<2) pkpSpawn(); }
 for(let i=PKP.list.length-1;i>=0;i--){ const p=PKP.list[i]; p.gem.rotation.y+=dt*2.2; p.gem.position.y=5+Math.sin(game.time*3+i)*.8;
  for(const f of [game.p,game.e]){ if(f.dead||f.hidden) continue; if(Math.hypot(f.pos.x-p.x,f.pos.z-p.z)<f.radius()+3.5&&f.pos.y<8){ pkpTake(f,p); scene.remove(p.g); PKP.list.splice(i,1); break; } } } }
{ const o=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){ if(PKP.on&&src&&src._rageUntil>game.time&&dmg>0) dmg*=PKP.rage; return o.call(this,src,dmg,kb,launch,cont,dir); }; }
{ const o=makeCity; makeCity=function(){ pkpClear(); o(); }; }
{ const o=updateCamera; updateCamera=function(dt){ o(dt); try{ pkpTick(dt); }catch(e){ console.error(e); } }; }
