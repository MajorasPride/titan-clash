/* =====================================================================
   v8.2 "NO MORE STUN LOCK" (Nov 6, 2026)
   1. AUTO-GUARD: every core titan has a front shield that blocks small shots on its own.
      Blocked small shots (also while holding block and walking) drain the shield bar, not health.
      Shield size comes from the Defense stat. Empty = GUARD BROKEN: shots hit health until it
      refills (starts 3s after the last hit). Melee, beams, specials and ultimates are never guarded.
   2. LIGHT HITS (light melee, and small shots that get through) do damage but only stun on
      every 5th light hit in a row. Medium / heavy / specials / ultimates stun like before.
   3. BREAK FREE: after 2s of non-stop stun you get pushed out and can't be stunned for 1s.
   4. Fire burn does damage only (fixed in v8Tick, 03-fighter.js).
   ===================================================================== */
const guardMax=f=>{ const s=V8STAT[f.def.id]; return s?24+s.def*7:45; };   // Defense 3 = 45, Defense 8 = 80
// each titan's guard looks like its own thing: [main color, second color, style]
const GUARD_LOOK={valor:[0x7fd4ff,0xe9eef4,'shield'],raikou:[0xfff06a,0xffffff,'slash'],ashvin:[0xffc44d,0xd8e4ff,'circles'],
 infernoth:[0xff6a1a,0xffd27a,'heat'],ragnavox:[0xb48cff,0x3c3a4f,'wing']};
const G82={disc:null,ringG:null,slash:null};
function guardInit(f){ f.guardMax=guardMax(f); f.guard=f.guardMax; f.guardBroken=false; f.guardHitT=-9; f.lightN=0; f.lightT=-9; f.stunRun=0; f.freeT=0; f.stunImm=0; }

function guardFX(f,from){ const L=GUARD_LOOK[f.def.id]||[0x88ccff,0xffffff,'shield'], s=f.scale||1, c=f.chest();
 const dir=from?from.clone().sub(c).setY(0):V(Math.sin(f.yaw),0,Math.cos(f.yaw)); if(dir.lengthSq()<.01) dir.set(Math.sin(f.yaw),0,Math.cos(f.yaw)); dir.normalize();
 const at=c.clone().addScaledVector(dir,3.5*s);
 const mat=col=>new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 const parts=[];
 if(L[2]==='slash'){ G82.slash=G82.slash||new THREE.BoxGeometry(.35,7,.35); const m=new THREE.Mesh(G82.slash,mat(L[0])); m.position.copy(at); m.lookAt(at.clone().add(dir)); m.rotateZ(rand(-1.2,1.2)); m.scale.setScalar(s); parts.push(m); }
 else if(L[2]==='circles'){ G82.ringG=G82.ringG||new THREE.RingGeometry(1.6,2.1,28); [[L[0],-1.3],[L[1],1.3]].forEach(([col,off])=>{ const m=new THREE.Mesh(G82.ringG,mat(col)); const side=V(dir.z,0,-dir.x).multiplyScalar(off*s); m.position.copy(at).add(side); m.lookAt(m.position.clone().add(dir)); m.scale.setScalar(s); parts.push(m); }); }
 else { G82.disc=G82.disc||new THREE.CircleGeometry(3,24); const m=new THREE.Mesh(G82.disc,mat(L[0])); m.material.opacity=L[2]==='heat'?.45:.55; m.position.copy(at); m.lookAt(at.clone().add(dir)); m.scale.setScalar(s*(L[2]==='wing'?1.5:1)); parts.push(m); }
 for(const m of parts) scene.add(m); burst(at,L[1],L[2]==='heat'?8:5,8);
 later(.14,()=>{ for(const m of parts){ scene.remove(m); m.material.dispose(); } });
 if(L[2]==='slash') Snd.tone&&Snd.tone('triangle',1800,900,.05,.05); else Snd.block(); }

function guardDrain(f,amt,from){ f.guard=Math.max(0,f.guard-amt); f.guardHitT=game.time; guardFX(f,from);
 if(f.guard<=0&&!f.guardBroken){ f.guardBroken=true; burst(f.chest(),0xffffff,24,16); Snd.crunch&&Snd.crunch();
  if(f.isPlayer||game.vs2||f.opp&&f.opp.isPlayer) toast(f.isPlayer?'YOUR GUARD IS BROKEN!':`${f.def.name}'S GUARD IS BROKEN!`,'#ff9f43',900); } }

function breakFree(f){ f.stun=0; f.stunRun=0; f.stunImm=game.time+1; const o=f.opp;
 if(o&&!o.dead){ const dx=o.pos.x-f.pos.x, dz=o.pos.z-f.pos.z, d=Math.hypot(dx,dz)||1; if(d<24){ o.kb.x+=dx/d*28; o.kb.z+=dz/d*28; } }
 ring(f.pos.x,f.chest().y,f.pos.z,14*(f.scale||1),0xffffff,.35); burst(f.chest(),0xffffff,26,18); Snd.whoosh&&Snd.whoosh();
 if(f.isPlayer||game.vs2) toast('BREAK FREE!','#ffffff',800); }

{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  if(!isCore(this)||this.dead||this.inv>0||this.hidden) return oTH.call(this,src,dmg,kb,launch,cont,dir);
  if(this.guardMax==null) guardInit(this);
  const P=V8.proj, fromF=!!(src&&src.def&&src!==HZ), small=!!(P&&P.r<=3&&!P.pierce)&&fromF&&!cont;
  let nx,nz; if(dir){ nx=dir.x; nz=dir.z; } else if(src&&src.pos){ nx=this.pos.x-src.pos.x; nz=this.pos.z-src.pos.z; } else { nx=0; nz=1; } const l=Math.hypot(nx,nz)||1; nx/=l; nz/=l;
  const facing=Math.abs(angDiff(this.yaw,Math.atan2(-nx,-nz)))<1.5, parryNow=this.blocking&&facing&&game.time-this.parryT<.25;
  // 1. auto-guard: small shots from the front go into the shield (a timed parry still throws them back)
  if(small&&facing&&!this.guardBroken&&this.guard>0&&!this.barrier&&!parryNow){ guardDrain(this,dmg,P.mesh?P.mesh.position:null); return; }
  const light=fromF&&!cont&&(small||(!P&&src.atk&&(LIGHT.includes(src.atk.id)||(src.F&&src.atk.id===src.F.J))));
  const s0=this.stun, a0=this.atk, b0=this.blocking, imm=this.stunImm>game.time;
  if(small&&!parryNow) this.blocking=false;   // guard broken: holding block doesn't stop shots either
  this._v82=true; try{ oTH.call(this,src,dmg,kb,launch,cont,dir); } finally{ this._v82=false; this.blocking=b0&&!this.dead; }
  if(this.dead) return;
  // 2. light hits: damage always, stun only on every 5th light hit in a row
  if(light&&this.hp>0&&(this.stun>s0||this.atk!==a0)){
   this.lightN=(game.time-this.lightT<2?this.lightN:0)+1; this.lightT=game.time;
   if(this.lightN>=5){ this.lightN=0; this.stun=Math.max(s0,.35); }
   else { this.stun=s0; if(a0&&!this.atk&&a0.id!=='grabthrow'&&!MOVES[a0.id]?.sweep&&a0.id!=='beam') this.atk=a0; } }
  // 3. can't be stunned for 1s after breaking free
  if(imm) this.stun=s0;
 }; }

/* every frame: shield refill + break free */
function v82Tick(f,dt){ if(!isCore(f)||game.state!=='fight') return; if(f.guardMax==null) guardInit(f);
 if(game.time-f.guardHitT>3&&f.guard<f.guardMax){ f.guard=Math.min(f.guardMax,f.guard+f.guardMax*.5*dt);
  if(f.guardBroken&&f.guard>=f.guardMax*.5){ f.guardBroken=false; if(f.isPlayer) toast('GUARD IS BACK UP','#9ff3ff',700); } }
 if(f.dead){ f.stunRun=0; return; }
 if(f.stunImm>game.time){ f.stun=0; f.stunRun=0; return; }
 const held=!!f.grabbedBy||(f.atk&&f.atk.id==='ultimate');
 if(f.stun>0&&!held){ f.stunRun+=dt; f.freeT=0; if(f.stunRun>=2) breakFree(f); }
 else { f.freeT+=dt; if(f.freeT>.25) f.stunRun=0; } }   // a tiny gap between hits doesn't count as free
{ const o=rosterTick; rosterTick=function(f,dt){ o(f,dt); v82Tick(f,dt); }; }
{ const oR=FP.reset; FP.reset=function(x,z,yaw){ oR.call(this,x,z,yaw); if(isCore(this)) guardInit(this); }; }

/* shield layer on the health bar */
{ const css=document.createElement('style'); css.textContent=`.gfill{position:absolute;left:0;right:0;top:0;height:34%;transform-origin:left center;background:linear-gradient(90deg,#bff6ff,#5fd0ff);box-shadow:0 0 8px #7fe3ff;opacity:.95;transition:opacity .2s}
.right .gfill{transform-origin:right center}.gfill.broken{background:#ff9f43;box-shadow:0 0 8px #ff7a1a;animation:gBlink .35s steps(2) infinite}@keyframes gBlink{50%{opacity:.25}}`; document.head.appendChild(css);
  for(const pre of ['p1','p2']){ const h=el(pre+'h'); if(h&&!el(pre+'g')){ const g=document.createElement('div'); g.className='gfill'; g.id=pre+'g'; h.parentNode.appendChild(g); } } }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); if(!game.p||game.mode!=='match') return;
  for(const [f,pre] of [[game.p,'p1'],[game.e,'p2']]){ const g=el(pre+'g'); if(!g) continue; if(!isCore(f)||f.guardMax==null){ g.style.display='none'; continue; } g.style.display='';
   g.style.transform=`scaleX(${f.guardBroken?Math.max(.06,f.guard/f.guardMax):f.guard/f.guardMax})`; g.classList.toggle('broken',f.guardBroken); } }; }
