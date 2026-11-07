/* =====================================================================
   SANDBOX 13: INFERNOTH REWORK, PART 1 (Nov 7, 2026). Sandbox only, not in the game.
   MajorasPride's plan (Game Plan > Ideas Inbox > INFERNOTH rework). Godzilla-inspired, our own design.
   - ARMOR: light hits and small shots never stun him. He takes the damage and keeps walking.
     Heavies, charged hits and ultimates still stagger him (outside rage).
   - ARMOR BAR (his weakness): every light hit/small shot he shrugs off drains it. Empty = ARMOR BROKEN:
     for 3s he flinches like everyone else. It refills after 2s without being hit.
   - RAGE: a meter fills as he takes damage. Full = RAGE: nothing staggers him for a few seconds.
     BRAWLER: fills slower, lasts longer (6s). MELTDOWN: fills faster, cools faster (4s). No stance switching in rage.
   - RAGE GLOW: plates light up from the tip of his tail toward his head as rage fills. Full rage = white-hot.
   - BRAWLER (Grappler + Big Body): L L L claw, claw, bite · M tail whip (knocks down) · H jaw grab-and-toss
     (gets through blocks, slow, a miss leaves him open; charge = longer shake, farther throw) · Special seismic stomp
     · GRAB: through a building if one is close, otherwise a tail-wrap throw (slow, a miss leaves him open)
     · 1 Pounce · 2 Burrow (lava spews from the exit hole for 1s) · 3 Volcano Leap (eruption ring on landing).
   - Every stance has its own 1/2/3 (rule from Nov 7). MELTDOWN keeps its old moves and skills until Sandbox 14.
   Balance tweaks made while building (allowed by MajorasPride for this edit): BRAWLER power 1.15 -> 1.1,
   grabs and the jaw toss have long recovery on a miss, Volcano Leap 14s cooldown.
   ===================================================================== */
const INF={ABMAX:100, abLight:13, abSmall:8, brokenT:3, regenWait:2, regen:30,
 fill:[100/260,100/170], dur:[6,4], spouts:[], ORANGE:0xff6a1a, WHITE:0xfff2d0};

/* ---------- BRAWLER stance + strings + skills per stance ---------- */
{ const D=V8DEFS.find(d=>d.id==='infernoth'), s0=D.stances[0];
  D.stances[0]=ST('BRAWLER',{speed:s0.speed,power:1.1,grab:false,jump:20,J:'kclaw',M:'ktailwhip',K:'kjaw',L:'kstomp'});
  D.forms=[D.stances[0],D.stances[1]]; }
STRINGS['infernoth:0']={ L:{id:'kclaw',c:0}, LL:{id:'kclaw',c:1}, LLL:{id:'kbite',end:1},
 LLM:{id:'ktailwhip',end:1}, LLH:{id:'kjaw',end:1}, LM:{id:'ktailwhip'}, LH:{id:'kjaw',end:1},
 M:{id:'ktailwhip'}, MH:{id:'kjaw',end:1} };
LIGHT.push('kclaw');
Object.assign(MOVES,{
 kclaw:{name:'Claw',dur:.5,hitAt:.26,moveMul:.35,anim:'kclaw'},
 kbite:{name:'Crushing Bite',dur:.66,hitAt:.36,moveMul:.2,anim:'kbite'},
 ktailwhip:{name:'Tail Whip (knocks down)',dur:.78,hitAt:.42,moveMul:.15,anim:'ktail'},
 kjaw:{name:'Jaw Grab & Toss',dur:.95,hitAt:.42,moveMul:0,anim:'kjaw',holdP:.2},
 kstomp:{name:'Seismic Stomp',dur:.9,hitAt:.52,cost:25,cd:6,moveMul:0,anim:'kstomp'},
 kgrab:{name:'Building Smash / Tail Throw',dur:.6,hitAt:.25,moveMul:0,anim:'kgrabp',noCharge:true},
 kpounce:{name:'Pounce',dur:.8,ranged:1,moveMul:0,anim:'kpounce',noCharge:true},
 kburrow:{name:'Burrow',dur:1.05,moveMul:0,anim:'kburrow',noCharge:true},
 kleap:{name:'Volcano Leap',dur:1.4,ranged:1,moveMul:0,anim:'kleap',noCharge:true},
});
// per-stance 1/2/3: [stance 0 list, stance 1 list]. MELTDOWN keeps the old set until Sandbox 14.
const SKILLS_ST={infernoth:[[{id:'kpounce',cd:6,cost:15,r:60},{id:'kburrow',cd:9,cost:15,r:40},{id:'kleap',cd:14,cost:35,r:70}],SKILLS.infernoth]};
function withSkills(f,fn){ const S=f&&SKILLS_ST[f.def.id]; if(!S) return fn(); const k=f.def.id, keep=SKILLS[k]; SKILLS[k]=S[f.stIdx||0]||[]; try{ return fn(); } finally{ SKILLS[k]=keep; } }
{ const o=useSkill; useSkill=function(f,n){ return withSkills(f,()=>o(f,n)); }; }
{ const o=v8AI; v8AI=function(f,inp,dt){ return withSkills(f,()=>o(f,inp,dt)); }; }
{ const o=updateHUD; updateHUD=function(dt){ return withSkills(game.p,()=>o(dt)); }; }
{ const o=refreshMoves; refreshMoves=function(i){ return withSkills(i?game.e:game.p,()=>o(i)); }; }
{ const o=sbKitRender; sbKitRender=function(){ return withSkills(game.p,()=>o()); }; }

/* ---------- armor, armor bar, rage ---------- */
const isInf=f=>!!(f&&f.def&&f.def.id==='infernoth'&&isCore(f));
function infInit(f){ if(f._inf) return; f._inf=1; f.ab=INF.ABMAX; f.abHitT=-9; f.abBrokenT=0; f.kRage=0; f.kRageT=0; }
{ const oR=FP.reset; FP.reset=function(...a){ const r=oR.apply(this,a); if(isInf(this)){ this._inf=0; infInit(this); } return r; }; }
function enterRage(f){ const st=f.stIdx||0; f.kRageT=INF.dur[st]; f.kRage=100; f.kRageMax=INF.dur[st];
 Snd.roar&&Snd.roar(); game.shake=Math.max(game.shake,.8); ring(f.pos.x,2,f.pos.z,26*f.scale,INF.WHITE,.6); burst(f.chest(),INF.ORANGE,40,22);
 toast(f.isPlayer?'RAGE! NOTHING CAN STOP YOU':`${f.def.name} IS IN A RAGE!`,'#ffb36b',1100); News.add('INFERNOTH\'S WHOLE BACK IS GLOWING WHITE-HOT!',true,'irage',8); }
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  if(!isInf(this)||this.dead||this.inv>0||this.hidden) return oTH.call(this,src,dmg,kb,launch,cont,dir);
  infInit(this);
  const P=V8.proj, fromF=!!(src&&src.def&&src!==HZ), A=fromF?src.atk:null, id=A?A.id:'';
  const small=!!(P&&P.r<=3&&!P.pierce)&&fromF&&!cont;
  const light=fromF&&!cont&&(small||(!P&&A&&(LIGHT.includes(id)||(src.F&&id===src.F.J))));
  const raged=this.kRageT>0, armored=!raged&&light&&!(this.abBrokenT>game.time);
  const s0=this.stun, a0=this.atk, vy0=this.vy, kx=this.kb.x, kz=this.kb.z, hp0=this.hp, fl0=this.flying;
  oTH.call(this,src,dmg,kb,launch,cont,dir);
  if(this.dead) return;
  const shrug=()=>{ this.stun=s0; if(a0&&!this.atk&&a0.id!=='ultimate') this.atk=a0; this.vy=Math.min(this.vy,Math.max(vy0,0)); this.flying=fl0;
   this.kb.x=kx+(this.kb.x-kx)*.25; this.kb.z=kz+(this.kb.z-kz)*.25; };
  const took=hp0-this.hp>0;
  if(raged&&!cont) shrug();
  else if(armored&&took){ shrug();
   this.ab-=small?INF.abSmall:INF.abLight; this.abHitT=game.time;
   if(this.ab<=0){ this.ab=0; this.abBrokenT=game.time+INF.brokenT; burst(this.chest(),0xffffff,26,16); Snd.crunch&&Snd.crunch();
    toast(this.isPlayer?'YOUR ARMOR IS BROKEN!':'INFERNOTH\'S ARMOR IS BROKEN!','#ff9f43',900); } }
  const lost=hp0-this.hp;
  if(!raged&&lost>0&&fromF){ this.kRage=Math.min(100,this.kRage+lost*INF.fill[this.stIdx||0]); if(this.kRage>=100) enterRage(this); }
 }; }
{ const o=v8Stance; v8Stance=function(f){ if(isInf(f)&&f.kRageT>0){ if(f.isPlayer) toast('CAN\'T SWITCH STANCE IN RAGE','#ffb36b',800); return; } return o(f); }; }

/* ---------- the GRAB button (BRAWLER) ---------- */
{ const o=v8Input; v8Input=function(f,inp,dt){
  if(isInf(f)&&inp.grab>0&&(f.stIdx||0)===0){ const canAct=!f.dead&&f.stun<=0&&game.state==='fight'&&f.rollT<=0&&!f.grabbedBy;
   inp.grab=0; if(canAct&&!f.atk) f.startAtk('kgrab'); }
  return o(f,inp,dt); }; }

/* ---------- helpers ---------- */
const fwd=(f,d)=>V(f.pos.x+Math.sin(f.yaw)*d,0,f.pos.z+Math.cos(f.yaw)*d);
const lava=(at,n,sp)=>{ burst(at,INF.ORANGE,n,sp); burst(at,0xffd27a,Math.ceil(n/2),sp*.7); };
function inFront(f,o,rg,arc){ if(!canHit(o)) return false; const dx=o.pos.x-f.pos.x, dz=o.pos.z-f.pos.z;
 return Math.hypot(dx,dz)<rg*f.scale+o.radius()*.5&&Math.abs(angDiff(f.yaw,Math.atan2(dx,dz)))<arc&&Math.abs(o.pos.y-f.pos.y)<10*f.scale; }
// grabs go through blocks
function grabHit(f,o,dmg,kb,ln,dir){ const b=o.blocking; o.blocking=false; o.parryT=-9; try{ o.takeHit(f,dmg,kb,ln,false,dir); } finally{ o.blocking=b&&!o.dead; } }
function holdAt(f,o,dist,h){ const p=fwd(f,dist*f.scale); o.pos.x=p.x; o.pos.z=p.z; o.pos.y=Math.max(o.pos.y,h||0); o.vy=0; o.kb.set(0,0,0); o.stun=Math.max(o.stun,.25); }
function whiff(f,a,extra){ a.dur+=extra; a.miss=true; if(f.isPlayer) toast('MISSED! YOU\'RE OPEN','#cbd5e1',600); }
function nearBuilding(f,r){ let best=null, bd=r; for(const b of city){ if(!b.alive) continue; const d=Math.hypot(b.x-f.pos.x,b.z-f.pos.z)-Math.max(b.w||0,b.d||0)/2; if(d<bd){ bd=d; best=b; } } return best; }

/* ---------- moves ---------- */
Object.assign(V8MOVE,{
 kclaw(f,a,dt,pm,o){ const p=a.t/a.dur; a.act=p>.4&&p<.62; if(once(a,'w',.36*a.dur)) Snd.tone('sawtooth',220,80,.12,.05);
  if(p>=.5&&!a._bh&&coneHit(f,a,o,15,1.1,7*pm,8,0,'slash')) lava(o.chest(),6,10); },
 kbite(f,a,dt,pm,o){ const p=a.t/a.dur; if(once(a,'l',.2*a.dur)){ f.kb.x+=Math.sin(f.yaw)*14; f.kb.z+=Math.cos(f.yaw)*14; }
  if(p>=.55&&!a._bh&&coneHit(f,a,o,13,.9,13*pm,22,6,'slash')){ lava(o.chest(),14,14); Snd.crunch&&Snd.crunch(); } },
 ktailwhip(f,a,dt,pm,o){ const p=a.t/a.dur; a.act=p>.42&&p<.66; if(once(a,'w',.4*a.dur)){ Snd.whoosh(); ring(f.pos.x,1,f.pos.z,18*f.scale,INF.ORANGE,.35); }
  if(p>=.52&&!a._bh&&o.pos.y<5&&coneHit(f,a,o,18,Math.PI,10*pm,14,9,'slash')){ o.stun=Math.max(o.stun,.7); dust(o.pos.x,o.pos.z,5,5);
   if(o.isPlayer||f.isPlayer) toast(o.isPlayer?'KNOCKED DOWN!':`${o.def.name} IS KNOCKED DOWN!`,'#ffb36b',600); } },
 // heavy: slow lunge, bite, shake, fling. Charged (a.chg) = longer shake, farther throw.
 kjaw(f,a,dt,pm,o){ const c=a.chg||0;
  if(!a.held&&!a.miss){ if(a.t<a.hitAt){ const charging=f.cg&&f.cg.a===a&&a.t<=f.cg.hp+.001; // no sliding while he holds the charge
    if(!charging&&a.t>a.hitAt*.55){ f.kb.x=Math.sin(f.yaw)*24; f.kb.z=Math.cos(f.yaw)*24; } return; }
   if(once(a,'g',a.hitAt)){ if(inFront(f,o,14,.85)){ a.held=true; a.gT=a.t; a.hold=.45+c*.6; a.dur=a.t+a.hold+.4; Snd.crunch&&Snd.crunch(); lava(o.chest(),12,12);
     if(o.isPlayer||f.isPlayer) toast(o.isPlayer?'CAUGHT IN HIS JAWS!':'GOT \'EM!','#ffb36b',700); }
    else whiff(f,a,.5); } return; }
  if(a.held){ const ht=a.t-a.gT;
   if(ht<a.hold){ holdAt(f,o,10,5); o.pos.x+=Math.sin(game.time*40)*1.2; if(Math.random()<dt*10){ const s0=o.stun; o.takeHit(f,1.6*pm,0,0,true,{x:0,z:1}); o.stun=Math.max(s0,.25); } }
   else if(once(a,'t',a.gT+a.hold)){ const dir={x:Math.sin(f.yaw),z:Math.cos(f.yaw)}; grabHit(f,o,(13+9*c)*pm,55+35*c,16+6*c,dir); Snd.boom(); game.shake=Math.max(game.shake,.6); } } },
 kstomp(f,a,dt,pm,o){ if(once(a,'s',a.hitAt)){ const r=22*f.scale; aoe(f,o,f.pos.x,f.pos.z,r,12*pm,18,10,INF.ORANGE); dust(f.pos.x,f.pos.z,r*.8,14);
   game.shake=Math.max(game.shake,1.1); Snd.boom(); if(canHit(o)&&Math.hypot(o.pos.x-f.pos.x,o.pos.z-f.pos.z)<r+o.radius()&&o.pos.y<6) o.stun=Math.max(o.stun,.7); } },
 // GRAB button: near a building = smash them through it, otherwise wrap the tail and hurl them
 kgrab(f,a,dt,pm,o){
  if(!a.held&&!a.miss){ if(once(a,'g',a.hitAt)){ if(inFront(f,o,13,.9)){ a.held=true; a.gT=a.t; const b=nearBuilding(f,48); a.b=b;
     a.dur=a.t+(b?1.0:.9); Snd.crunch&&Snd.crunch(); if(o.isPlayer||f.isPlayer) toast(b?'BUILDING SMASH!':'TAIL THROW!','#ffb36b',700); }
    else whiff(f,a,.55); } return; }
  if(!a.held) return; const ht=a.t-a.gT, dir={x:Math.sin(f.yaw),z:Math.cos(f.yaw)};
  if(a.b){ const b=a.b;
   if(ht<.55){ f.yaw+=angDiff(Math.atan2(b.x-f.pos.x,b.z-f.pos.z),f.yaw)*Math.min(1,dt*10); holdAt(f,o,9,6); }
   else if(once(a,'s',a.gT+.55)){ o.pos.x=lerp(o.pos.x,b.x,.75); o.pos.z=lerp(o.pos.z,b.z,.75); const bd={x:b.x-f.pos.x,z:b.z-f.pos.z};
    grabHit(f,o,24*pm,30,12,bd); if(b.alive) bHit(b,(b.hp||300)+50,bd.x,bd.z,b.h*.5,f); dust(b.x,b.z,12,16); Snd.boom(); game.shake=Math.max(game.shake,1.2);
    News.add(`INFERNOTH SLAMS ${o.def.name} THROUGH A BUILDING!`,true,'ismash',6); } }
  else { if(ht<.45){ f.yaw+=dt*14; holdAt(f,o,-9,5); }
   else if(once(a,'t',a.gT+.45)){ grabHit(f,o,17*pm,78,24,dir); Snd.whoosh(); game.shake=Math.max(game.shake,.7); News.add(`INFERNOTH HURLS ${o.def.name} ACROSS THE CITY WITH ITS TAIL!`,false,'itail',6); } } },
 // 1: leap onto the rival from mid-range, claw on landing
 kpounce(f,a,dt,pm,o){ if(once(a,'j',.15)){ const ok=canHit(o)&&dist2(f,o)<70; a.to=ok?V(o.pos.x,0,o.pos.z):fwd(f,32); f.yaw=Math.atan2(a.to.x-f.pos.x,a.to.z-f.pos.z); f.vy=20; f.onGround=false; Snd.whoosh(); }
  if(a.to&&a.t<.62){ const dx=a.to.x-f.pos.x, dz=a.to.z-f.pos.z, d=Math.hypot(dx,dz); if(d>6){ f.kb.x=dx/d*Math.min(95,d*4); f.kb.z=dz/d*Math.min(95,d*4); } }
  if(a.t>=.62&&once(a,'h',.62)){ f.kb.multiplyScalar(.2); if(canHit(o)&&dist2(f,o)<13*f.scale+o.radius()){ o.takeHit(f,15*pm,14,0,false,{x:o.pos.x-f.pos.x,z:o.pos.z-f.pos.z}); o.stun=Math.max(o.stun,.45); lava(o.chest(),14,14); }
   dust(f.pos.x,f.pos.z,6,6); Snd.thud&&Snd.thud(); } },
 // 2: dive underground, come up somewhere else, lava spews from the exit hole for 1s
 kburrow(f,a,dt,pm,o){ const p=a.t/a.dur;
  if(once(a,'d',0)){ const I=f.inp||{}, mv=f.isPlayer&&Math.hypot(I.mx||0,I.mz||0)>.3; let dir;
   if(mv) dir=Math.atan2(I.mx,I.mz)+(cams[0]&&!game.vs2?cams[0].yaw||0:0); else dir=o?Math.atan2(f.pos.x-o.pos.x,f.pos.z-o.pos.z)+rand(-.6,.6):f.yaw+Math.PI;
   a.dir=dir; dust(f.pos.x,f.pos.z,8,8); Snd.thud&&Snd.thud(); }
  if(p<.62){ f.body.position.y=-12*ez(Math.min(1,p/.18)); f.inv=Math.max(f.inv,.12); f.kb.x=Math.sin(a.dir)*70; f.kb.z=Math.cos(a.dir)*70; if(Math.random()<dt*20) dust(f.pos.x,f.pos.z,3,2); }
  else { f.body.position.y*=.55; if(once(a,'u',.62*a.dur)){ f.kb.multiplyScalar(.1); f.body.position.y=0; INF.spouts.push({f,x:f.pos.x,z:f.pos.z,t:1.1,dps:16*pm});
    lava(V(f.pos.x,2,f.pos.z),30,18); pillar(f.pos.x,f.pos.z,4,INF.ORANGE,1,40); Snd.boom(); } } },
 // 3: jump high, crash down, eruption ring where he lands
 kleap(f,a,dt,pm,o){ if(once(a,'j',.2)){ const ok=canHit(o)&&dist2(f,o)<75; a.to=ok?V(o.pos.x,0,o.pos.z):fwd(f,38); f.vy=34; f.onGround=false; Snd.roar&&Snd.roar(); }
  if(a.to&&!a.land&&a.t>.2){ const dx=a.to.x-f.pos.x, dz=a.to.z-f.pos.z, d=Math.hypot(dx,dz); f.yaw=Math.atan2(dx,dz); if(d>3){ f.kb.x=dx/d*Math.min(70,d*3); f.kb.z=dz/d*Math.min(70,d*3); } }
  if(!a.land&&a.t>.45&&(f.onGround||f.pos.y<.6||a.t>1.15)){ a.land=true; a.dur=a.t+.35; f.kb.set(0,0,0); f.pos.y=0; const r=20*f.scale;
   aoe(f,o,f.pos.x,f.pos.z,r,18*pm,26,16,INF.ORANGE); for(let i=0;i<8;i++){ const an=i/8*Math.PI*2, x=f.pos.x+Math.sin(an)*r*.8, z=f.pos.z+Math.cos(an)*r*.8; later(i*.03,()=>{ pillar(x,z,2.4,INF.ORANGE,.9,26); lava(V(x,2,z),8,12); }); }
   game.shake=Math.max(game.shake,1.4); Snd.boom(); News.add('INFERNOTH CRASHES DOWN AND THE STREET ERUPTS!',false,'ileap',6); } },
});

/* ---------- poses (kaiju rig) ---------- */
POSES.kclaw=(k,p,e,f,a)=>{ const R=((a.chain||0)%2)===0, w=ez(ph(p,0,.4)), s=ez(ph(p,.4,.62)), arm=lerp(lerp(-.6,-2.2,w),-.5,s), az=lerp(lerp(0,.8,w),-.8,s);
 if(R){ k.armR=arm; k.azR=az; k.elR=-.4; } else { k.armL=arm; k.azL=-az; k.elL=-.4; } k.twist=(R?1:-1)*lerp(lerp(0,.45,w),-.45,s); k.lean=.15+.2*s; k.jaw=.3*s; };
POSES.kbite=(k,p,e)=>{ const w=ez(ph(p,0,.45)), s=ez(ph(p,.45,.6)); k.lean=lerp(lerp(.1,-.1,w),.55,s); k.headX=lerp(lerp(0,-.4,w),.45,s); k.jaw=lerp(lerp(0,1.3,w),.1,s); k.armL=k.armR=-.9; };
POSES.ktail=(k,p,e)=>{ const w=ez(ph(p,0,.4)), s=ez(ph(p,.4,.7)); k.twist=lerp(lerp(0,-1,w),1.6,s); k.lean=.3*e; k.knL=k.knR=.5*e; k.armL=k.armR=-.7; };
POSES.kjaw=(k,p,e,f,a)=>{ const w=ez(ph(p,0,.4)); k.lean=.15+.45*w; k.headX=.35*w; k.jaw=a&&a.held?.25+Math.abs(Math.sin(game.time*30))*.25:1.2*w; k.armL=k.armR=-1.2; k.azL=-.4; k.azR=.4;
 if(a&&a.held) k.twist=Math.sin(game.time*28)*.5; };
POSES.kstomp=(k,p,e)=>{ const w=ez(ph(p,0,.5)), s=ez(ph(p,.5,.6)); k.lean=lerp(lerp(0,-.35,w),.45,s); k.legR=lerp(lerp(0,-1.3,w),.2,s); k.knR=lerp(lerp(0,1.2,w),0,s); k.armL=k.armR=lerp(-.6,-1.6,w); k.jaw=.9*w; };
POSES.kgrabp=(k,p,e,f,a)=>{ const s=ez(ph(p,0,.4)); k.armL=k.armR=lerp(-.5,-1.7,s); k.azL=-.25; k.azR=.25; k.elL=k.elR=-.3; k.lean=.25; k.jaw=.6;
 if(a&&a.held){ k.twist=a.b?.2:Math.sin(game.time*12)*.8; k.lean=-.1; k.armL=k.armR=-2.4; } };
POSES.kpounce=(k,p,e)=>{ const c=ez(ph(p,0,.2)), l=ez(ph(p,.2,.7)); k.lean=lerp(.5*c,.7,l); k.knL=k.knR=.9*c*(1-l); k.armL=k.armR=lerp(-.6,-2.3,l); k.jaw=1*l; };
POSES.kburrow=(k,p,e)=>{ k.lean=.9; k.armL=k.armR=-1.7; k.azL=-.3; k.azR=.3; k.knL=k.knR=1; k.legL=k.legR=-.8; };
POSES.kleap=(k,p,e,f,a)=>{ const up=a&&!a.land; k.armL=k.armR=up?-2.8:-.4; k.azL=-.6; k.azR=.6; k.lean=up?-.2:.6; k.knL=k.knR=up?.3:1.1; k.jaw=1.1; k.headX=up?-.3:.2; };

/* ---------- AI: the dummy INFERNOTH grabs sometimes ---------- */
{ const o=v8AI; v8AI=function(f,inp,dt){ o(f,inp,dt); if(!isInf(f)||(f.isPlayer&&!f.pilot)||f.atk||f.stun>0||game.state!=='fight'||(f.stIdx||0)!==0) return;
  if(typeof SB!=='undefined'&&f===game.e&&SB.dummy!=='fight') return; const c=f.opp; if(c&&canHit(c)&&dist2(f,c)<14&&Math.random()<dt*.7) f.startAtk('kgrab'); }; }

/* ---------- every frame: armor bar, rage, rage glow, lava spouts, HUD ---------- */
function infBuildLights(f){ const P=f.P; if(!P||f._lights) return; const L=[], oct=new THREE.OctahedronGeometry(1,0);
 const add=(m)=>{ m.material=new THREE.MeshBasicMaterial({color:0x40160a}); L.push(m); };
 (P.tail||[]).slice().reverse().forEach(g=>{ const m=new THREE.Mesh(oct); m.position.set(0,1.9,-.6); m.scale.set(.24,1.25,.9); m.rotation.x=-.3; g.add(m); add(m); });
 (P.v8spines||[]).forEach(m=>add(m)); f._lights=L; }
function infTick(dt){ if(game.mode!=='match') return;
 for(const f of [game.p,game.e]){ if(!isInf(f)||!f.P) continue; infInit(f); infBuildLights(f);
  if(game.state==='fight'){
   if(f.abBrokenT&&game.time>=f.abBrokenT){ f.abBrokenT=0; f.ab=INF.ABMAX; toast(f.isPlayer?'ARMOR BACK':'INFERNOTH\'S ARMOR IS BACK','#cbd5e1',600); }
   else if(!f.abBrokenT&&game.time-f.abHitT>INF.regenWait) f.ab=Math.min(INF.ABMAX,f.ab+INF.regen*dt);
   if(f.kRageT>0){ f.kRageT=Math.max(0,f.kRageT-dt); f.kRage=100*f.kRageT/(f.kRageMax||1); if(f.kRageT<=0){ f.kRage=0; if(f.isPlayer) toast('RAGE COOLS OFF','#cbd5e1',600); } } }
  // the rage glow: tail tip first, then up the spines to his head
  const L=f._lights, n=L.length, fr=f.kRage/100, raged=f.kRageT>0, pulse=.75+.25*Math.sin(game.time*14);
  L.forEach((m,i)=>{ const lit=fr>=(i+1)/n-.001; m.material.color.setHex(raged?INF.WHITE:lit?INF.ORANGE:0x40160a); if(raged) m.material.color.multiplyScalar(pulse); });
  if(raged&&Math.random()<dt*20) burst(f.chest().add(V(rand(-3,3),rand(0,6),rand(-4,-1))),Math.random()<.5?INF.WHITE:INF.ORANGE,2,8); }
 for(let i=INF.spouts.length-1;i>=0;i--){ const S=INF.spouts[i], o=S.f.opp; S.t-=dt;
  if(Math.random()<dt*24) lava(V(S.x+rand(-2,2),rand(2,10),S.z+rand(-2,2)),3,14);
  if(o&&canHit(o)&&Math.hypot(o.pos.x-S.x,o.pos.z-S.z)<9+o.radius()*.5&&o.pos.y<8){ const s0=o.stun; o.takeHit(S.f,S.dps*dt,0,0,true,{x:o.pos.x-S.x,z:o.pos.z-S.z}); o.stun=s0; }
  if(S.t<=0) INF.spouts.splice(i,1); }
 infHUD(); }
{ const s=document.createElement('style'); s.textContent=`.infHud{position:fixed;top:232px;z-index:20;width:150px;pointer-events:none;font:10px/1 'Russo One',sans-serif;color:#ffd2a8;letter-spacing:1px;text-shadow:0 1px 2px #000}
.infHud.l{left:24px}.infHud.r{right:24px;text-align:right}.infHud .t{height:7px;background:#0008;border:1px solid #ffffff44;border-radius:4px;margin:3px 0 6px;overflow:hidden}
.infHud .t div{height:100%;width:0}.infHud .ab div{background:#c9a27a}.infHud .ab.broken div{background:#ff5a3a}.infHud .rg div{background:linear-gradient(90deg,#ff5a1a,#ffd27a)}
.infHud .rg.on div{background:#fff2d0;box-shadow:0 0 8px #fff2d0}
@media (pointer:coarse) and (max-height:520px){ .infHud{top:178px;width:110px} }
#sbSk{bottom:14px!important} /* sandbox has no news ticker */
body.vcine .infHud{visibility:hidden}`; document.head.appendChild(s); }
function infHUD(){ for(const [f,side] of [[game.p,'l'],[game.e,'r']]){ const id='infHud'+side; let h=el(id);
  if(!isInf(f)||game.mode!=='match'){ if(h) h.remove(); continue; }
  if(!h){ h=document.createElement('div'); h.id=id; h.className='infHud '+side; h.innerHTML='<span class="a1">ARMOR</span><div class="t ab"><div></div></div><span class="r1">RAGE</span><div class="t rg"><div></div></div>'; document.body.appendChild(h); }
  const br=f.abBrokenT>game.time; h.querySelector('.ab').classList.toggle('broken',br); h.querySelector('.ab div').style.width=(br?100*(f.abBrokenT-game.time)/INF.brokenT:f.ab)+'%';
  h.querySelector('.a1').textContent=br?'ARMOR BROKEN':'ARMOR'; h.querySelector('.rg').classList.toggle('on',f.kRageT>0); h.querySelector('.rg div').style.width=f.kRage+'%';
  h.querySelector('.r1').textContent=f.kRageT>0?'RAGE!':'RAGE'; } }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ infTick(dt); }catch(e){ console.error(e); } }; }
{ const oR=sbReset; sbReset=function(){ INF.spouts.length=0; for(const f of [game.p,game.e]) if(isInf(f)){ f._inf=0; infInit(f); f.body&&(f.body.position.y=0); } oR(); }; }

/* ---------- sandbox: play INFERNOTH (vs a VALOR dummy) by default for this test ---------- */
if(!SB_PLAY.includes('infernoth')) SB_PLAY.push('infernoth');
SB.me='infernoth'; SB.opp='valor';
