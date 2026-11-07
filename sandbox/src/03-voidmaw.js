/* =====================================================================
   SANDBOX TEST: VOIDMAW (working name), the dark-magic kaiju (Nov 6, 2026)
   Inspired by Shuma-Gorath (Marvel vs. Capcom 2) and Biollante: one giant eye on a body of
   roots and tentacles, arcane dark magic with purple spell circles. Our own design.
   Kit: Light = tentacle lash combo · Medium = vine sweep (trips) · Heavy = Eye Slam (standing) /
   Root Burrow (moving) · Special = Eye Ring (sticks, then pops) · 1 Vine Grab · 2 Spore Cloud · 3 Dark Rift.
   Ultimate (eye gate + black hands + blood red sky) comes later with the cutscene work.
   ===================================================================== */
const VM_PURPLE=0xb06bff, VM_DEEP=0x3a1257;

/* ---------- body ---------- */
function buildVoid(d){
 const root=new THREE.Group(), body=grp(0,0,0,root);
 const mB=std(d.color,.9,.05), mB2=std(0x1d0f29,.95,.02), mG=glowM(d.glow,2.4), mI=glowM(0xd9a8ff,3.2), mScl=std(0xe9e1f2,.35,0), mPup=std(0x050208,.3,0), mR=glowM(0x7dffb0,1.6);
 const P={skin:mB,baseColor:d.color,altColor:d.altColor,baseLean:.12,baseHead:0,hipY:6.5};
 const hips=P.hips=grp(0,6.5,0,body); mesh(S(3.2,12,8),mB2,0,0,0,hips).scale.set(1.1,.7,1);
 const torso=P.torso=grp(0,1.2,0,hips);
 mesh(S(4.3,16,12),mB,0,4,0,torso).scale.set(1.05,1,.95);                                       // the dark mass
 for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, th=mesh(Co(.35,2.2,5),mB2,Math.sin(a)*3.9,4+Math.sin(i*1.7)*1.5,Math.cos(a)*3.6,torso); th.lookAt(V(Math.sin(a)*9,4+Math.sin(i*1.7)*3,Math.cos(a)*9).add(torso.position)); th.rotateX(Math.PI/2); } // thorns
 const rune=P.vmRune=new THREE.Mesh(new THREE.TorusGeometry(5.6,.12,6,48),mG); rune.position.set(0,4,0); rune.rotation.x=Math.PI/2; torso.add(rune);
 for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, m=mesh(BV(.7,.12,.7),mG,Math.cos(a)*5.6,0,Math.sin(a)*5.6,rune,true); m.rotation.y=a; }
 // the EYE (the head)
 const head=P.head=grp(0,4.6,2.2,torso);
 mesh(S(3,20,16),mScl,0,0,0,head);
 const iris=mesh(new THREE.CircleGeometry(1.7,28),mI,0,0,3.01,head,true); const pup=mesh(BV(.5,2.2,.1),mPup,0,0,3.06,head,true); P.vmIris=[iris,pup];
 const vein=glowM(0xff3b6b,1.2); for(let i=0;i<7;i++){ const a=rand(0,6.28), v=mesh(BV(.06,rand(1,1.8),.06),vein,Math.cos(a)*2.4,Math.sin(a)*2.4,1.75,head,true); v.rotation.z=a+Math.PI/2; }
 // eyelid = jaw (opens when it roars / casts)
 const jaw=P.jaw=grp(0,0,0,head); const lid=mesh(new THREE.SphereGeometry(3.15,20,12,0,Math.PI*2,0,Math.PI*.42),mB,0,0,0,jaw); lid.rotation.x=-.25;
 const emit=grp(0,0,3.4,head);
 // tentacle arms
 const tent=(par,n,len,r0,m)=>{ const segs=[]; let p=par; for(let i=0;i<n;i++){ const g=grp(0,i===0?0:-len,0,p); mesh(Cy(r0*(1-i/n)*.9,r0*(1-(i-1)/n)*.9,len,7),m,0,-len/2,0,g); segs.push(g); p=g; } mesh(S(r0*.35,6,4),mG,0,-len,0,p,true); return segs; };
 for(const s of[-1,1]){ const L=s<0?'L':'R';
  const arm=P['arm'+L]=grp(s*3.9,5.2,.6,torso); const a1=tent(arm,2,2.6,1.1,mB); P['el'+L]=grp(0,-2.6,0,a1[1]); const a2=tent(P['el'+L],3,2.3,.8,mB);
  P['vmT'+L]=a1.concat(a2); }
 // root legs
 for(const s of[-1,1]){ const L=s<0?'L':'R';
  const leg=P['leg'+L]=grp(s*2.4,0,0,hips); mesh(Cy(1.3,1.1,3.2,9),mB2,0,-1.6,0,leg);
  const kn=P['kn'+L]=grp(0,-3.2,0,leg); mesh(Cy(1.1,1.7,3.3,9),mB2,0,-1.65,0,kn);
  for(let k=0;k<5;k++){ const a=k/5*Math.PI*2+s*.4, r=mesh(Co(.45,2.6,5),mB2,Math.sin(a)*1.5,-3.3,Math.cos(a)*1.5,kn); r.rotation.z=-Math.sin(a)*1.3; r.rotation.x=Math.cos(a)*1.3; }
  mesh(S(.4,6,4),mR,s*.6,-2.5,1.4,kn,true); }
 // back tentacles: the first one counts as the "tail" (limb system), the rest just sway
 const tail=[]; let parent=grp(0,4.5,-3.2,torso); for(let i=0;i<4;i++){ const g=grp(0,0,i===0?0:-1.8,parent); g.rotation.x=-.35; mesh(Cy(.55-i*.1,.7-i*.1,1.9,6),mB,0,0,-.9,g).rotation.x=Math.PI/2; tail.push(g); parent=g; } P.tail=tail;
 P.vmBack=[]; for(const [x,y,ry] of [[-2.6,6,-.6],[2.6,6,.6],[-1.4,7.4,-.3],[1.4,7.4,.3]]){ const b=grp(x,y,-2.2,torso); b.rotation.set(-2.2,ry,0); P.vmBack.push(tent(b,4,1.7,.55,mB)); }
 P.extra=grp(0,0,0,torso); P.extra.visible=false;
 return {root,body,P,emit,glowMats:[mG,mI,mR]};
}
{ const oBK=buildKaiju; buildKaiju=function(d){ return d.kbody==='void'?buildVoid(d):oBK(d); }; }

/* ---------- the titan ---------- */
V8STAT.voidmaw={hp:7,atk:4,def:5,mob:4,en:9};
{ const s=V8STAT.voidmaw, sp=statSpd(s);
  const D={id:'voidmaw',name:'VOIDMAW',type:'kaiju',kbody:'void',tag:'An eye from beyond the stars on a body of roots and tentacles. Dark magic, long reach, slow feet.',color:0x2a1638,accent:0x14081d,glow:VM_PURPLE,css:'#c48bff',beam:'Eye Ring',superName:'THE GATE',ultName:'THE GATE OPENS',altColor:0x2a1638,altScale:1,cls:'MYSTIC',code:'K-04 "WATCHER"',origin:'BEYOND THE STARS',baseScale:1.05,
   stances:[ST('AWAKE',{speed:sp,power:1,grab:false,jump:18,J:'vtlash',M:'vinesweep',K:'mheavy',L:'eyering'})]};
  D.core=true; D.hp=statHp(s); D.forms=[D.stances[0],D.stances[0]]; D.st=[4,Math.max(1,Math.round(s.mob/2)),Math.max(1,Math.round(s.def/2))];
  V8DEFS.push(D); ROSTER.push(D); }
LORE.voidmaw={org:'',from:'FROM BEHIND THE STARS',bio:'Something opened an eye on the other side of the sky. Its body grew from the roots of a dead world. It does not roar. It watches, and spell circles burn wherever it looks.',
 lines:['VOIDMAW HAS NOT BLINKED IN FOUR HOURS','EXPERTS ASK THE PUBLIC NOT TO MAKE EYE CONTACT WITH VOIDMAW','PURPLE CIRCLES ARE APPEARING ON ROOFTOPS. NOBODY DREW THEM'],heli:'CHOPPER 7: "IT\'S LOOKING RIGHT AT US. THE WHOLE EYE IS LOOKING RIGHT AT US."'};
V8REGROW.voidmaw=[10,'THE VOID KNITS A NEW','#c48bff'];
V8DEFEL.voidmaw='water';
SKILLS.voidmaw=[{id:'vinegrab',cd:7,cost:15,r:60},{id:'sporecloud',cd:9,cost:15,r:30},{id:'darkrift',cd:14,cost:35,r:45}];
{ const oS=v8Stance; v8Stance=function(f){ if(f.def.id==='voidmaw'){ if(f.isPlayer) toast('VOIDMAW HAS ONE FORM (FOR NOW)','#c48bff',800); return; } return oS(f); }; }

/* ---------- moves ---------- */
Object.assign(MOVES,{
 vtlash:{name:'Tentacle Lash',dur:.46,hitAt:.24,moveMul:.3,anim:'mlash'},
 vinesweep:{name:'Vine Sweep (trips)',dur:.6,hitAt:.3,anim:'msweep'},
 mheavy:{name:'Heavy',dur:.6},
 eyeslam:{name:'Eye Slam',dur:.95,hitAt:.55,anim:'mslam'},
 rootburrow:{name:'Root Burrow',dur:.9,hitAt:.6,moveMul:0,anim:'mburrow'},
 eyering:{name:'Eye Ring',dur:.6,cost:25,cd:5,ranged:1,anim:'mcast'},
 vinegrab:{name:'Vine Grab',dur:.7,ranged:1,anim:'mgrab'},
 sporecloud:{name:'Spore Cloud',dur:.8,moveMul:0,anim:'mcast'},
 darkrift:{name:'Dark Rift',dur:.8,ranged:1,anim:'mrift'},
});
LIGHT.push('vtlash');
HEAVYSET.mheavy=['eyeslam','rootburrow'];

POSES.mlash=(k,p,e,f,a)=>{ const R=((a.chain||0)%2)===0, w=ez(ph(p,0,.4)), s=ez(ph(p,.4,.62)), arm=lerp(lerp(-.6,.5,w),-2.2,s), az=lerp(lerp(0,.9,w),-.7,s);
 if(R){ k.armR=arm; k.azR=az; k.elR=lerp(-.2,-1,w)*(1-s); } else { k.armL=arm; k.azL=-az; k.elL=lerp(-.2,-1,w)*(1-s); } k.twist=(R?1:-1)*lerp(lerp(0,.5,w),-.5,s); k.lean=.2*s; k.jaw=.5*s; };
POSES.msweep=(k,p,e)=>{ const w=ez(ph(p,0,.4)), s=ez(ph(p,.4,.65)); k.armL=k.armR=-.5; k.azR=lerp(lerp(0,1.2,w),-1.1,s); k.azL=lerp(lerp(0,-1.2,w),1.1,s); k.twist=lerp(lerp(0,.8,w),-.8,s); k.lean=.35*e; k.knL=k.knR=.6*e; k.legL=k.legR=-.4*e; };
POSES.mslam=(k,p,e,f,a)=>{ const w=ez(ph(p,0,.5)), s=ez(ph(p,.5,.6)); k.lean=lerp(lerp(0,-.45,w),.7,s); k.armL=k.armR=lerp(lerp(-.5,-2.8,w),-.6,s); k.azL=-.4; k.azR=.4; k.jaw=1; k.knL=k.knR=.7*(1-w)+.6*s; };
POSES.mburrow=(k,p,e)=>{ k.lean=.85; k.armL=k.armR=-1.7; k.azL=-.3; k.azR=.3; k.knL=k.knR=1.1; k.legL=k.legR=-.9; k.jaw=.2; };
POSES.mcast=(k,p,e)=>{ k.headX=-.25*e; k.jaw=1.1*e; k.armL=k.armR=-2.3*e; k.azL=-.7*e; k.azR=.7*e; k.lean=-.15*e; };
POSES.mgrab=(k,p,e)=>{ const s=ez(ph(p,0,.35)), b=ez(ph(p,.45,.8)); k.armR=lerp(-.4,-1.6,s); k.elR=0; k.azR=-.05; k.twist=lerp(.4,-.2,s)+.5*b; k.lean=lerp(.2,-.25,b); k.jaw=.8; };
POSES.mrift=(k,p,e)=>{ k.armL=k.armR=-2.6*e; k.azL=-1*e; k.azR=1*e; k.jaw=1.2*e; k.headX=.3*e; k.lean=.1; };

const VM={rings:[],rifts:[],vines:[]};
const purple=(at,n,sp)=>{ burst(at,VM_PURPLE,n,sp); burst(at,0x2a0a3f,Math.ceil(n/2),sp*.7); };
Object.assign(V8MOVE,{
 vtlash(f,a,dt,pm,o){ const p=a.t/a.dur, c=a.chain||0; a.act=p>.38&&p<.6; if(once(a,'w',.36)) Snd.tone('sawtooth',260,90,.16,.05);
  if(p>=.5&&!a._bh){ if(coneHit(f,a,o,16,1.15,(c===2?11:7.5)*pm,c===2?28:9,c===2?8:0,'slash')) purple(o.chest(),10,14); } },
 vinesweep(f,a,dt,pm,o){ const p=a.t/a.dur; a.act=p>.4&&p<.62; if(once(a,'w',.38)){ Snd.whoosh(); ring(f.pos.x,1,f.pos.z,15,VM_PURPLE,.35); }
  if(p>=.5&&!a._bh&&o.pos.y<4){ if(coneHit(f,a,o,15,1.7,10*pm,12,6,'slash')){ o.stun=Math.max(o.stun,.55); toast(o.isPlayer?'TRIPPED!':`${o.def.name} TRIPS!`,'#c48bff',600); } } },
 eyeslam(f,a,dt,pm,o){ if(once(a,'up',.1)){ f.vy=Math.max(f.vy,16); f.onGround=false; } if(once(a,'s',a.hitAt)){ const fx=Math.sin(f.yaw)*8, fz=Math.cos(f.yaw)*8; aoe(f,o,f.pos.x+fx,f.pos.z+fz,15,17*pm,26,20,VM_PURPLE); runeCircle(f.pos.x+fx,f.pos.z+fz,12,.6); game.shake=Math.max(game.shake,1); Snd.boom(); } },
 rootburrow(f,a,dt,pm,o){ const p=a.t/a.dur;
  if(once(a,'d',0)){ if(canHit(o)) f.yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z); dust(f.pos.x,f.pos.z,6,5); Snd.thud(); }
  if(p<.6){ f.body.position.y=-9*ez(Math.min(1,p/.15)); f.kb.x=Math.sin(f.yaw)*62; f.kb.z=Math.cos(f.yaw)*62; f.stunImm=game.time+.1; if(Math.random()<dt*25) dust(f.pos.x,f.pos.z,3,3);
   if(canHit(o)&&dist2(f,o)<9+o.radius()){ a.t=Math.max(a.t,.6*a.dur); } }
  else { f.body.position.y*=.6; if(once(a,'up',.6)){ f.kb.multiplyScalar(.1); aoe(f,o,f.pos.x,f.pos.z,13,15*pm,18,26,0x7dffb0); dust(f.pos.x,f.pos.z,10,8); Snd.boom(); } } },
 eyering(f,a,dt,pm,o){ if(once(a,'f',.3)){ const g=new THREE.Group(), from=f.chest().add(V(Math.sin(f.yaw)*4,1,Math.cos(f.yaw)*4)); for(let i=0;i<6;i++){ const e=new THREE.Mesh(new THREE.SphereGeometry(.7,10,8),glowM(i%2?0xd9a8ff:VM_PURPLE,2.6)); const an=i/6*Math.PI*2; e.position.set(Math.cos(an)*2.2,Math.sin(an)*2.2,0); g.add(e); }
   g.position.copy(from); scene.add(g); VM.rings.push({f,o,g,pos:from,t:0,stuck:null,dmg:14*pm}); Snd.tone('sine',300,900,.3,.08); } },
 vinegrab(f,a,dt,pm,o){ if(once(a,'g',.25)){ const d=dist2(f,o), ang=Math.abs(angDiff(f.yaw,Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z)));
   const hit=canHit(o)&&d<60&&ang<.6; const to=hit?o.chest():f.chest().add(V(Math.sin(f.yaw)*45,0,Math.cos(f.yaw)*45));
   VM.vines.push({f,o,hit,to,t:0,m:null}); if(hit){ o.takeHit(f,6*pm,0,0,false,{x:f.pos.x-o.pos.x,z:f.pos.z-o.pos.z}); o.stun=Math.max(o.stun,.5); toast(o.isPlayer?'VINE GRAB! YOU\'RE PULLED IN':'GOT \'EM!','#7dffb0',700); } Snd.whoosh(); } },
 sporecloud(f,a,dt,pm,o){ if(once(a,'v',0)){ f.inv=Math.max(f.inv,.75); f.root.visible=false; purple(f.chest(),40,18); burst(f.chest(),0x7dffb0,20,14); Snd.tone('sine',900,200,.4,.05);
   const I=f.inp||{}, mv=f.isPlayer&&Math.hypot(I.mx||0,I.mz||0)>.3; let dir=mv?Math.atan2(I.mx,I.mz)+(cams[0]?cams[0].yaw||0:0):f.yaw+Math.PI; if(!f.isPlayer) dir=f.yaw+Math.PI+rand(-1,1); a.dir=dir; }
  if(a.t<.55){ f.kb.x=Math.sin(a.dir)*55; f.kb.z=Math.cos(a.dir)*55; if(Math.random()<dt*40){ const c=f.chest(); burst(c,Math.random()<.5?VM_PURPLE:0x7dffb0,2,6); } }
  else if(once(a,'r',.55)){ f.root.visible=true; f.kb.multiplyScalar(.15); purple(f.chest(),30,14); } },
 darkrift(f,a,dt,pm,o){ if(once(a,'r',.45)){ const t=canHit(o)&&dist2(f,o)<70?V(o.pos.x,0,o.pos.z):V(f.pos.x+Math.sin(f.yaw)*25,0,f.pos.z+Math.cos(f.yaw)*25);
   VM.rifts.push({f,x:t.x,z:t.z,r:14,t:5,m:runeCircle(t.x,t.z,14,5)}); Snd.tone('sine',120,60,.8,.12); News.add('A PURPLE SPELL CIRCLE BURNS INTO THE STREET!',false,'rift',6); } },
});
// a spinning spell circle on the ground (life in seconds); returns the group
function runeCircle(x,z,r,life){ const g=new THREE.Group(), m=new THREE.MeshBasicMaterial({color:VM_PURPLE,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 g.add(new THREE.Mesh(new THREE.RingGeometry(r-.6,r,48),m)); g.add(new THREE.Mesh(new THREE.RingGeometry(r*.62-.4,r*.62,40),m));
 for(let i=0;i<3;i++){ const tri=new THREE.Mesh(new THREE.RingGeometry(r*.62,r*.64,3,1,i*Math.PI*2/6),m); g.add(tri); }
 for(let i=0;i<10;i++){ const an=i/10*Math.PI*2, s=new THREE.Mesh(new THREE.PlaneGeometry(1,1.6),m); s.position.set(Math.cos(an)*r*.81,Math.sin(an)*r*.81,0); s.rotation.z=an; g.add(s); }
 g.rotation.x=-Math.PI/2; g.position.set(x,.15,z); scene.add(g); g.userData={life,max:life,m}; VM.circles=(VM.circles||[]).concat([g]); return g; }

/* ---------- every frame: eye rings, vines, rifts, eye follows the rival, tentacles sway ---------- */
function vmTick(dt){ if(game.mode!=='match') return;
 for(let i=VM.rings.length-1;i>=0;i--){ const R=VM.rings[i], o=R.o; R.t+=dt; R.g.rotation.z+=dt*6; let done=false;
  if(!R.stuck){ const tgt=o.chest(), d=tgt.clone().sub(R.pos); const l=d.length(); R.pos.addScaledVector(d.normalize(),Math.min(l,75*dt)); R.g.position.copy(R.pos); R.g.lookAt(camera.position);
   if(l<o.radius()+3&&canHit(o)){ const facing=Math.abs(angDiff(o.yaw,Math.atan2(R.f.pos.x-o.pos.x,R.f.pos.z-o.pos.z)))<1.5;
    if(o.blocking&&facing){ purple(R.pos.clone(),16,12); Snd.block(); done=true; } else { R.stuck=game.time; toast(o.isPlayer?'EYES ARE STUCK ON YOU!':'EYES STICK TO '+o.def.name+'!','#c48bff',800); } }
   if(R.t>2.2) done=true; }
  else { R.g.position.copy(o.chest()); R.g.scale.setScalar(1+(game.time-R.stuck)*.4);
   if(game.time-R.stuck>1.2){ if(!o.dead) o.takeHit(R.f,R.dmg,14,8,false,{x:o.pos.x-R.f.pos.x,z:o.pos.z-R.f.pos.z}); purple(o.chest(),40,22); ring(o.pos.x,o.chest().y,o.pos.z,10,VM_PURPLE,.3); Snd.boom(); done=true; } }
  if(done){ scene.remove(R.g); VM.rings.splice(i,1); } }
 for(let i=VM.vines.length-1;i>=0;i--){ const W=VM.vines[i], f=W.f, o=W.o; W.t+=dt; const from=f.chest().add(V(Math.sin(f.yaw)*3,0,Math.cos(f.yaw)*3)), to=W.hit?o.chest():W.to;
  if(W.m){ scene.remove(W.m); W.m.geometry.dispose(); } const mid=from.clone().lerp(to,.5), len=from.distanceTo(to);
  W.m=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,len,6),glowM(0x7dffb0,1.6)); W.m.position.copy(mid); W.m.lookAt(to); W.m.rotateX(Math.PI/2); scene.add(W.m);
  if(W.hit&&W.t<.4){ const dx=f.pos.x-o.pos.x, dz=f.pos.z-o.pos.z, d=Math.hypot(dx,dz)||1; if(d>11){ o.kb.x=dx/d*95; o.kb.z=dz/d*95; } o.stun=Math.max(o.stun,.2); }
  if(W.t>(W.hit?.45:.3)){ scene.remove(W.m); W.m.geometry.dispose(); VM.vines.splice(i,1); } }
 for(let i=VM.rifts.length-1;i>=0;i--){ const T=VM.rifts[i], o=T.f.opp; T.t-=dt;
  if(o&&canHit(o)&&Math.hypot(o.pos.x-T.x,o.pos.z-T.z)<T.r&&o.pos.y<6){ const s0=o.stun; o.takeHit(T.f,7*dt,0,0,true,{x:0,z:1}); o.stun=s0; o.energy=Math.max(0,o.energy-9*dt); o.slowT=Math.max(o.slowT||0,.3); if(Math.random()<dt*14) purple(o.pos.clone().setY(1.5),2,6); }
  if(T.t<=0) VM.rifts.splice(i,1); }
 for(let i=(VM.circles||[]).length-1;i>=0;i--){ const g=VM.circles[i], u=g.userData; u.life-=dt; g.rotation.z+=dt*.8; u.m.opacity=Math.min(.85,u.life*1.5); if(u.life<=0){ scene.remove(g); VM.circles.splice(i,1); } }
 for(const f of [game.p,game.e]){ if(!f||f.def.id!=='voidmaw'||!f.P) continue; const P=f.P, T=game.time;
  if(P.vmRune) P.vmRune.rotation.z+=dt*.7;
  if(P.vmIris&&f.opp){ const c=f.opp.chest(), loc=P.head.worldToLocal(c.clone()); const lx=clamp(loc.x/12,-1,1), ly=clamp(loc.y/12,-1,1); for(const m of P.vmIris){ m.position.x=lx*1.1; m.position.y=ly*1.1; } }
  (P.vmBack||[]).forEach((segs,j)=>segs.forEach((g,i)=>{ g.rotation.z=Math.sin(T*1.6+j*1.3+i*.7)*.25; g.rotation.x=(i?.18:0)+Math.cos(T*1.2+j+i)*.12; }));
  for(const L of['L','R']) (P['vmT'+L]||[]).forEach((g,i)=>{ if(i) g.rotation.z+=(Math.sin(T*2.2+i*.8+(L==='L'?1:0))*.18-g.rotation.z)*Math.min(1,dt*6); }); } }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ if(!game.paused) vmTick(game.state==='fight'?dt*(game.timeScale||1):0); }catch(e){ console.error(e); } }; }
{ const oC=v8Clear; v8Clear=function(){ oC(); for(const R of VM.rings) scene.remove(R.g); for(const W of VM.vines) if(W.m) scene.remove(W.m); for(const g of VM.circles||[]) scene.remove(g); VM.rings=[]; VM.vines=[]; VM.rifts=[]; VM.circles=[]; }; }
