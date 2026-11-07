/* =====================================================================
   SANDBOX TEST: FIGHT FEEL + VALOR KIT (Nov 6, 2026)
   Lives in the sandbox only. When MajorasPride OKs it, it moves into the game.
   - Real poses for every VALOR move (wind-up, swing, follow-through) through POSES.
   - Sword hits along the blade's path, with a slash trail, "shing" and slash sparks.
   - Shield hits clang. Two attacks landing at the same moment = CLASH (both pushed back).
   - Chains: light -> medium -> heavy -> special / 1-2-3 cancel into each other when they land.
   - 1 / 2 / 3 skills with their own cooldowns and energy cost.
   - Heavy depends on what you're doing: standing = Rising Slash (launcher),
     moving = Lunging Thrust, in the air = Sword Plunge.
   ===================================================================== */
const ph=(p,a,b)=>clamp((p-a)/(b-a),0,1), ez=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const POSES={};
const SB={dummy:'stand',slow:false,infEn:false,infHp:true,log:[],combo:{n:0,dmg:0,t:0},last:null};

/* ---------------- VALOR's new kit ---------------- */
Object.assign(MOVES,{
 vslash:{name:'Sword Combo',dur:.42,hitAt:.2,moveMul:.35,anim:'vslash'},
 vbash:{name:'Shield Bash',dur:.55,hitAt:.24,lunge:18,melee:[11,1.2,12,34,6],anim:'vbash',guardBreak:1},
 risingslash:{name:'Rising Slash (launcher)',dur:.7,hitAt:.32,anim:'vrise'},
 swordthrust:{name:'Lunging Thrust',dur:.65,hitAt:.3,lunge:34,anim:'vthrust'},
 swordplunge:{name:'Sword Plunge',dur:1.6,hitAt:.15,moveMul:.2,anim:'vplunge'},
 vheavy:{name:'Heavy',dur:.6},
 shieldthrow:{name:'Shield Throw',dur:.5,cost:20,cd:4,ranged:1,anim:'vthrowshield'},
 chargingstar:{name:'Charging Star',dur:1,moveMul:0,anim:'vstar'},
 rallywall:{name:'Rally Wall',dur:2.4,moveMul:.25,anim:'vwall'},
 dawncannon:{name:'Dawn Cannon',dur:2.2,moveMul:.05,ranged:1,anim:'beam'},
});
LIGHT.push('vslash');
const SKILLS={
 valor:[{id:'chargingstar',cd:6,cost:15,r:30},{id:'rallywall',cd:10,cost:20,r:40},{id:'dawncannon',cd:14,cost:40,r:70}],
 infernoth:[{id:'dorsalpulse',cd:6,cost:15,r:22},{id:'magmatail',cd:5,cost:10,r:16},{id:'heatbeam',cd:12,cost:40,r:60}],
};
{ const V=V8DEFS.find(d=>d.id==='valor'), sp=V.stances[0].speed;
  V.stances=[ST('SWORD & SHIELD',{speed:sp,power:1.1,armor:.9,J:'vslash',M:'vbash',K:'vheavy',L:'shieldthrow',air:'swordplunge'}),
             ST('BRAWLER',{speed:sp*1.1,power:.9,armor:1,regen:1.15,brawl:true,J:'bjab',M:'thook',K:'bthrow',L:'geyser',air:'bdive'})]; // BRAWLER kit: 06-valor-brawler.js
  V.forms=[V.stances[0],V.stances[1]]; V.tag='The leader. Sword and shield, or fists and shield. Balanced and brave.'; }
const rankOf=(f,id)=>{ const F=f.F; if(!F) return 0; if(id===F.J) return 1; if(id===F.M) return 2; if(id===F.K||(HEAVYSET[F.K]&&HEAVYSET[F.K].includes(id))) return 3; if(id===F.L) return 4; return 0; };

/* ---------------- poses: k = joint targets, p = 0..1 through the move ---------------- */
POSES.vslash=(k,p,e,f,a)=>{ const c=a.chain||0;
 if(c<2){ const s=c===0?1:-1, w=ez(ph(p,0,.3)), sw=ez(ph(p,.3,.58));
  k.twist=lerp(lerp(0,.95*s,w),-1.0*s,sw); k.armR=-1.35; k.elR=-.3; k.azR=lerp(lerp(.15,.75*s,w),-.55*s,sw);
  k.armL=-1.15; k.elL=-1.25; k.azL=.45; k.lean=.08+.18*sw; k.legL=-.35*sw; k.knL=.35*sw; k.knR=.2*w; f.v8.blade=-Math.PI/2; }
 else { const w=ez(ph(p,0,.35)), sw=ez(ph(p,.35,.55));
  k.armL=lerp(lerp(-1,-.5,w),-1.65,sw); k.elL=lerp(lerp(-1.3,-1.8,w),-.05,sw); k.azL=.25; k.twist=lerp(lerp(0,-.5,w),.7,sw); k.lean=.32*sw; k.armR=-.7; k.elR=-1; k.legL=-.5*sw; k.knR=.4*sw; } };
POSES.vbash=(k,p,e)=>{ k.armL=lerp(-.7,-1.62,e); k.elL=lerp(-1.6,-.05,e); k.azL=.2; k.twist=.75*e; k.lean=.38*e; k.armR=-.6; k.elR=-1.2; k.legL=-.5*e; k.knR=.45*e; };
POSES.vrise=(k,p,e,f)=>{ const w=ez(ph(p,0,.4)), s=ez(ph(p,.4,.62));
 k.armR=lerp(lerp(-.6,.55,w),-2.95,s); k.elR=-.15; k.azR=.15; k.twist=lerp(lerp(0,.55,w),-.35,s); k.lean=lerp(lerp(0,.3,w),-.25,s);
 k.knL=k.knR=.8*w*(1-s); k.legL=k.legR=-.55*w*(1-s); k.armL=-1.1; k.elL=-1.3; k.azL=.4; f.v8.blade=lerp(-.85,-2.9,s); };
POSES.vthrust=(k,p,e,f)=>{ const w=ez(ph(p,0,.32)), s=ez(ph(p,.32,.5));
 k.armR=-1.5; k.elR=lerp(lerp(-.4,-1.75,w),0,s); k.azR=-.1; k.twist=lerp(lerp(0,.65,w),-.5,s); k.lean=lerp(.05,.42,s);
 k.legL=-.75*s; k.knL=.25*s; k.legR=.35*s; k.knR=.5*s; k.armL=-.9; k.elL=-1.2; k.azL=.5; f.v8.blade=-Math.PI/2; };
POSES.vplunge=(k,p,e,f,a)=>{ const land=a.landT!=null?ez(Math.min(1,(a.t-a.landT)/.12)):0;
 k.armR=lerp(-2.95,-1.0,land); k.elR=-.15; k.armL=-2.3; k.azL=.3; k.lean=lerp(.15,.55,land); k.knL=k.knR=lerp(1.1,.9,land); k.legL=k.legR=lerp(-.5,-.9,land); f.v8.blade=lerp(-3.0,-.15,ez(ph(p,0,.18))); };
POSES.vthrowshield=(k,p,e)=>{ const w=ez(ph(p,0,.36)), s=ez(ph(p,.36,.55));
 k.armL=-1.4; k.azL=lerp(lerp(.2,1.05,w),-.85,s); k.elL=lerp(lerp(-.6,-1.2,w),0,s); k.twist=lerp(lerp(0,-.7,w),.55,s); k.lean=.15*s; k.armR=-.5; k.elR=-1.1; };
POSES.vstar=(k,p,e,f)=>{ const T=game.time*18; k.lean=.6; k.armL=-1.55; k.elL=-.15; k.azL=.5; k.armR=.45; k.elR=-.4; k.legL=-.9*Math.sin(T); k.legR=.9*Math.sin(T); k.knL=.6+.4*Math.cos(T); k.knR=.6-.4*Math.cos(T); k.headX=.25; };
POSES.vwall=(k,p,e)=>{ k.armL=-1.58; k.elL=-.25; k.azL=.55; k.armR=-.5; k.elR=-1.45; k.azR=.1; k.legL=-.45; k.knL=.55; k.knR=.3; k.lean=.18; k.twist=.15; };

/* ---------------- sword trail + hit helpers ---------------- */
{ const oD=v8Dress; v8Dress=function(f){ oD(f); const P=f.P; if(f.def.id==='valor'&&P.v8sword){ f.v8.swordBase=grp(0,-.7,0,P.v8sword); f.v8.swordTip=grp(0,-9.4,0,P.v8sword); } }; }
{ const oS=v8StanceVisual; v8StanceVisual=function(f){ const P=f.P, F=f.F; if(f.def.id==='valor'&&P&&P.v8sword){ const b=!!F.brawl; P.v8sword.visible=!b; P.v8swordBack.visible=b; P.v8rifle.visible=false; P.v8rifleBack.visible=false; return; } oS(f); }; } // no rifle any more: sword in hand, or sword on the back (Brawler)
function trailTick(f,dt,on){ const S=f.v8; if(!S||!S.swordTip) return; const T=S.trail||(S.trail={pts:[],m:null});
 if(on){ const b=V(),t=V(); S.swordBase.getWorldPosition(b); S.swordTip.getWorldPosition(t); T.pts.push([b,t]); if(T.pts.length>10) T.pts.shift(); }
 else if(T.pts.length) T.pts.splice(0,Math.max(1,Math.ceil(T.pts.length*dt*14)));
 if(T.m){ scene.remove(T.m); T.m.geometry.dispose(); T.m=null; }
 const n=T.pts.length; if(n<2) return; const pos=new Float32Array((n-1)*18), col=new Float32Array((n-1)*18), c=new THREE.Color(f.def.glow);
 for(let i=0;i<n-1;i++){ const [b0,t0]=T.pts[i],[b1,t1]=T.pts[i+1], a0=(i+1)/n, a1=(i+2)/n, vs=[b0,t0,b1,t0,t1,b1], al=[a0*.3,a0,a1*.3,a0,a1,a1*.3];
  vs.forEach((v,j)=>{ pos.set([v.x,v.y,v.z],i*18+j*3); const k=al[j]; col.set([lerp(c.r,1,k*.6)*k,lerp(c.g,1,k*.6)*k,lerp(c.b,1,k*.6)*k],i*18+j*3); }); }
 const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
 T.mat=T.mat||new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 T.m=new THREE.Mesh(g,T.mat); T.m.frustumCulled=false; scene.add(T.m); }
function slashFX(at,f){ const c=f.def.glow; for(const r of[.7,-.7]){ const m=new THREE.Mesh(new THREE.BoxGeometry(.35,11,.35),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false}));
  m.position.copy(at); m.lookAt(camera.position); m.rotateZ(r+rand(-.3,.3)); scene.add(m); let t=0; const tick=()=>{ t+=.016; m.scale.set(1,1+t*6,1); m.material.opacity=Math.max(0,1-t*7); if(t<.15) requestAnimationFrame(tick); else { scene.remove(m); m.geometry.dispose(); m.material.dispose(); } }; tick(); }
 burst(at,c,14,22); burst(at,0xffffff,8,16); Snd.tone('triangle',3200,1400,.09,.09); Snd.tone('sawtooth',1800,900,.05,.03); }
function clangFX(at){ ring(at.x,at.y,at.z,9,0xffffff,.25); burst(at,0xffe9a8,16,18); Snd.tone('square',260,150,.16,.12); Snd.tone('triangle',1300,1100,.25,.06); }
function isActive(o){ const A=o.atk; if(!A) return false; if(A.act) return true; const M=MOVES[A.id]; return !!(M&&M.melee&&A.hitAt&&!A.hit&&A.t>=A.hitAt-.1&&A.t<=A.hitAt+.03); } // a sword swing, or any punch / claw right before it lands
function clashCheck(f,o,at){ if(!isActive(o)) return false; if(Math.abs(angDiff(o.yaw,Math.atan2(f.pos.x-o.pos.x,f.pos.z-o.pos.z)))>1.2) return false;
 const mid=at||f.chest().lerp(o.chest(),.5); burst(mid,0xffffff,40,26); burst(mid,0xffd43b,22,18); ring(mid.x,mid.y,mid.z,12,0xffffff,.3); Snd.tone('square',2000,500,.2,.12); Snd.block();
 for(const [x,y] of [[f,o],[o,f]]){ const dx=x.pos.x-y.pos.x,dz=x.pos.z-y.pos.z,d=Math.hypot(dx,dz)||1; x.kb.x+=dx/d*32; x.kb.z+=dz/d*32; if(x.beamOn) x.stopBeam(); x.atk=null; x.stun=Math.max(x.stun,.2); }
 game.hitStop=Math.max(game.hitStop,.14); game.shake=Math.max(game.shake,.7); toast('CLASH!','#ffffff',700); return true; }
function landHit(f,a,o,dmg,kb,ln,at,kind){ a._bh=1; a.hit=true; a.landed=true; if(clashCheck(f,o,at)) return false;
 o.takeHit(f,dmg,kb,ln,false,{x:o.pos.x-f.pos.x+.01,z:o.pos.z-f.pos.z}); if(kind==='slash') slashFX(at,f); else clangFX(at);
 if(MOVES[a.id]&&MOVES[a.id].guardBreak&&o.guardMax){ o.guard=Math.max(0,(o.guard||0)-40); o.guardHitT=game.time; } return true; }
function bladeHit(f,a,o,dmg,kb,ln){ if(a._bh||!canHit(o)||!f.v8.swordTip) return false; const b=V(),t=V(); f.v8.swordBase.getWorldPosition(b); f.v8.swordTip.getWorldPosition(t);
 const pts=[]; for(let i=0;i<=6;i++) pts.push(b.clone().lerp(t,i/6)); if(f.v8.lastTip) for(let i=1;i<4;i++) pts.push(f.v8.lastTip.clone().lerp(t,i/4)); f.v8.lastTip=t.clone();
 const R=o.radius()+1.4, y0=o.pos.y-1, y1=o.chest().y+6*o.scale;
 for(const q of pts) if(q.y>=y0&&q.y<=y1&&Math.hypot(q.x-o.pos.x,q.z-o.pos.z)<R){ smash(q.x,q.z,3,q.y,Math.sin(f.yaw),Math.cos(f.yaw),q.y,10+dmg); return landHit(f,a,o,dmg,kb,ln,q,'slash'); }
 return false; }
function coneHit(f,a,o,rg,arc,dmg,kb,ln,kind){ if(a._bh||!canHit(o)) return false; const dx=o.pos.x-f.pos.x,dz=o.pos.z-f.pos.z,d=Math.hypot(dx,dz);
 if(d<rg*f.scale+o.radius()*.5&&Math.abs(angDiff(f.yaw,Math.atan2(dx,dz)))<arc&&Math.abs(o.pos.y-f.pos.y)<10*f.scale){ const at=o.chest().lerp(f.chest(),.35); return landHit(f,a,o,dmg,kb,ln,at,kind); } return false; }
// a swing window: blade checks every frame while active, then a fair close-range check at the end so a clean swing never "whiffs through" a rival
function swing(f,a,o,p0,p1,dmg,kb,ln,reach){ const p=a.t/a.dur; a.act=p>=p0&&p<=p1; a.trail=p>=p0-.05&&p<=p1+.06; if(a.act) bladeHit(f,a,o,dmg,kb,ln); if(p>p1&&!a._end){ a._end=1; a.act=false; if(!a._bh) coneHit(f,a,o,reach||14,.95,dmg,kb,ln,'slash'); } }

/* ---------------- what each move does ---------------- */
Object.assign(V8MOVE,{
 vslash(f,a,dt,pm,o){ const c=a.chain||0;
  if(c<2){ swing(f,a,o,.3,.6,(c?9:8)*pm,c?11:9,0,14); if(once(a,'w',.28)) Snd.tone('sawtooth',500,180,.12,.05); }
  else { const p=a.t/a.dur; a.act=p>.35&&p<.55; if(p>=.42&&!a._bh) coneHit(f,a,o,11,1.1,12*pm,30,10,'clang'); } },
 vbash(f,a,dt,pm,o){ const p=a.t/a.dur; a.act=p>.3&&p<.5; if(a.landed&&once(a,'c',.0)){ clangFX(o.chest().lerp(f.chest(),.4)); if(o.guardMax){ o.guard=Math.max(0,o.guard-40); o.guardHitT=game.time; if(o.guard<=0&&!o.guardBroken){ o.guardBroken=true; toast('GUARD BREAK!','#ff9f43',800); } } } },
 risingslash(f,a,dt,pm,o){ swing(f,a,o,.4,.62,15*pm,12,28,13); if(once(a,'w',.38)) Snd.tone('sawtooth',300,900,.18,.06); },
 swordthrust(f,a,dt,pm,o){ swing(f,a,o,.3,.5,17*pm,42,4,18); if(once(a,'w',.3)){ Snd.whoosh(); burst(f.chest(),0x7fd4ff,10,14); } },
 swordplunge(f,a,dt,pm,o){ if(once(a,'d',0)){ f.vy=Math.min(f.vy,-75); Snd.whoosh(); }
  if(a.landT==null){ a.act=true; a.trail=true; bladeHit(f,a,o,12*pm,10,0); a.t=Math.min(a.t,.5);
   if(f.onGround){ a.landT=a.t; a.act=false; a.dur=a.t+.4; const fx=Math.sin(f.yaw)*6, fz=Math.cos(f.yaw)*6; aoe(f,o,f.pos.x+fx,f.pos.z+fz,16,14*pm,24,18,0x7fd4ff); pillar(f.pos.x+fx,f.pos.z+fz,1.2,0x7fd4ff,.35,30); game.shake=Math.max(game.shake,.9); Snd.boom(); } }
  else a.trail=false; },
 chargingstar(f,a,dt,pm,o){ const fx=Math.sin(f.yaw), fz=Math.cos(f.yaw);
  if(once(a,'s',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); Snd.mech&&Snd.mech(); toast(f.isPlayer?'CHARGING STAR!':'VALOR CHARGES!','#7fd4ff',700); }
  f.stunImm=game.time+.12; // can't be stunned while charging
  if(!a._bh&&a.t<.8){ f.kb.x=Math.sin(f.yaw)*78; f.kb.z=Math.cos(f.yaw)*78; if(Math.random()<dt*30) burst(f.chest(),0xffffff,3,8); if(once(a,'r1',.1)||once(a,'r2',.35)||once(a,'r3',.6)) ring(f.pos.x,f.chest().y,f.pos.z,9,0x7fd4ff,.3);
   if(canHit(o)&&dist2(f,o)<8*f.scale+o.radius()){ landHit(f,a,o,20*pm,60,14,o.chest().lerp(f.chest(),.4),'clang'); f.kb.multiplyScalar(.2); a.dur=Math.min(a.dur,a.t+.3); burst(o.chest(),0xffd43b,30,24); } }
  else if(a.t>=.8&&!a._bh){ f.kb.multiplyScalar(.5); } },
 rallywall(f,a,dt,pm,o){ if(once(a,'w',0)){ f.barrier={kind:'shield',t:a.dur}; f.P.v8shield.scale.setScalar(1.7); Snd.block(); toast(f.isPlayer?'RALLY WALL! IT COUNTERS ANYTHING THAT HITS IT':'VALOR RAISES A RALLY WALL!','#7fd4ff',900); } },
 dawncannon(f,a,dt,pm,o){ if(once(a,'c0',0)){ a.on=.7; a.off=1.75; beamColor(f,0x7fd4ff); }
  if(a.t<a.on){ if(Math.random()<dt*30) burst(f.chest().add(V(Math.sin(f.yaw)*3,0,Math.cos(f.yaw)*3)),0x7fd4ff,2,4); return; }
  const on=a.t>=a.on&&a.t<a.off; if(on&&!f.beamOn){ f.startBeam(); Snd.mech(); } if(!on&&f.beamOn) f.stopBeam(); if(on) f.updateBeam(dt,pm*1.2,a); },
});

/* ---------------- Rally Wall: front hits are blocked and answered with a counter slash ---------------- */
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  const B=this.barrier, fromF=src&&src.def&&src!==HZ;
  if(B&&B.kind==='shield'&&this.atk&&this.atk.id==='rallywall'&&fromF&&!cont&&!V8.proj&&!this.dead){
   const facing=Math.abs(angDiff(this.yaw,Math.atan2(src.pos.x-this.pos.x,src.pos.z-this.pos.z)))<1.5;
   if(facing&&dist2(this,src)<26){ clangFX(this.chest().lerp(src.chest(),.5)); src.takeHit(this,12,30,6,false,{x:src.pos.x-this.pos.x,z:src.pos.z-this.pos.z}); slashFX(src.chest(),this); if(this.isPlayer||src.isPlayer) toast('COUNTER!','#7fd4ff',600); return; } }
  return oTH.call(this,src,dmg,kb,launch,cont,dir); }; }
// a basic melee hit that meets an active sword swing = CLASH
{ const oM=FP.melee; FP.melee=function(rg,arc,dmg,kb,ln){ const o=this.opp; if(o&&o.atk&&o.atk.act&&this.atk&&!this.atk.act&&dist2(this,o)<rg+8&&Math.abs(angDiff(this.yaw,Math.atan2(o.pos.x-this.pos.x,o.pos.z-this.pos.z)))<arc){ if(clashCheck(this,o)) return false; } return oM.call(this,rg,arc,dmg,kb,ln); }; }

/* ---------------- input: chains, heavy by situation, sword plunge, 1/2/3 ---------------- */
function useSkill(f,n){ const L=SKILLS[f.def.id]; if(!L||!L[n-1]) return false; const S=L[n-1], cd=f.cds['sk'+n]||0;
 if(cd>0){ if(f.isPlayer) toast(MOVES[S.id].name.toUpperCase()+' READY IN '+Math.ceil(cd)+'s','#88ccff',600); return false; }
 const c=Math.round(S.cost*costMul(f)); if(f.energy<c&&!SB.infEn){ if(f.isPlayer) toast('NEED MORE ENERGY ('+c+')','#88ccff',700); return false; }
 if(!SB.infEn) f.energy-=c; f.cds['sk'+n]=S.cd; f.dropHeld&&f.dropHeld(); if(f.beamOn) f.stopBeam(); f.atk=null; f.startAtk(S.id); if(f.atk) f.atk.skill=n; return true; }
const HEAVYSET={vheavy:['risingslash','swordthrust']}; // heavy button: [standing, moving]
{ const oF=v8Fire; v8Fire=function(f,id,quiet){ if(HEAVYSET[id]){ const I=f.inp||{}, moving=f.isPlayer&&!f.pilot?Math.hypot(I.mx||0,I.mz||0)>.45:Math.random()<.45; id=HEAVYSET[id][moving?1:0]; }
  if(SB.infEn&&MOVES[id]&&MOVES[id].cost) f.energy=100; return oF(f,id,quiet); }; }
{ const oI=v8Input; v8Input=function(f,inp,dt){ const A=f.atk, canAct=!f.dead&&f.stun<=0&&game.state==='fight'&&f.rollT<=0&&!f.grabbedBy;
  const cancelOK=A&&A.landed&&A.t>=(A.hitAt||0)+.03;
  for(const n of [1,2,3]){ const k='sk'+n; if(inp[k]>0&&canAct&&(!A||A.id==='stance'||(cancelOK&&rankOf(f,A.id)<4))){ inp[k]=0; useSkill(f,n); return oI(f,inp,dt); } }
  if(inp.special>0&&canAct&&cancelOK&&rankOf(f,A.id)>0&&rankOf(f,A.id)<4) f.atk=null;                       // light / medium / heavy -> special
  if(inp.heavy>0&&canAct&&cancelOK&&rankOf(f,A.id)===2&&!f.hHold) f.atk=null;                                // medium -> heavy
  if(inp.heavy>0&&canAct&&!f.atk&&f.F.air&&!f.onGround&&f.pos.y-(f._floor||0)>5){ inp.heavy=0; v8Fire(f,f.F.air); } // jump + heavy = Sword Plunge
  if(SB.infEn) f.energy=100;
  return oI(f,inp,dt); }; }
// the CPU uses 1/2/3 too (FIGHT mode)
{ const oA=v8AI; v8AI=function(f,inp,dt){ oA(f,inp,dt); if(f.isPlayer&&!f.pilot) return; if(f===game.e&&SB.dummy!=='fight') return;
  const L=SKILLS[f.def.id]; if(!L||f.atk||f.stun>0||game.state!=='fight') return; if(Math.random()<dt*.5){ const n=1+((Math.random()*3)|0), S=L[n-1]; if(!(f.cds['sk'+n]>0)&&dist2(f,f.opp)<S.r) useSkill(f,n); } }; }

/* ---------------- every frame: blade pitch, trail, cooldown sanity ---------------- */
{ const oA=v8Anim; v8Anim=function(f,dt){ oA(f,dt); const P=f.P, S=f.v8; if(!P||!S||!P.v8sword) return; const a=f.atk;
  if(a&&S.blade!=null&&MOVES[a.id]&&POSES[MOVES[a.id].anim]){ P.v8sword.rotation.x=S.blade-(P.armR.rotation.x+P.elR.rotation.x); }
  else { P.v8sword.rotation.x+=(-Math.PI/2-P.v8sword.rotation.x)*Math.min(1,dt*14); S.blade=null; }
  if(!(a&&a.id==='rallywall')&&P.v8shield&&!(f.barrier&&f.barrier.kind==='shield')) P.v8shield.scale.setScalar(1);
  trailTick(f,dt,!!(a&&a.trail)); if(!(a&&a.act)) S.lastTip=null; }; }
