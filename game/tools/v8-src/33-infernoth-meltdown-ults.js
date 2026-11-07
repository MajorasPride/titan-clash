/* =====================================================================
   SANDBOX 13 (part 2, Nov 7, 2026): INFERNOTH's MELTDOWN kit + all three ultimates. In the game since v8.4 (moved from the sandbox).
   MELTDOWN (Stone Wall + Zoner): L L L lava spit · M magma wall (blocks shots, burns on touch; one at a time)
   · H eruption (lava geyser under the rival; charge = reaches farther) · Special heat beam with a lava trail
   · GRAB shove-off (throws the rival back out to zoning range)
   · 1 Meteor Spit (3 lava balls) · 2 Obsidian Shell (half damage, reflects small shots) · 3 Volcano Core.
   ULTIMATES (announce card on press with the intro line; cutscene + quote only if it lands):
   - BRAWLER: KING. "THIS IS MY LAND." Charge, jaw grab, toss them straight up, tail WHACK sends them flying across the city. "BOW TO YOUR KING."
   - MELTDOWN: LAVA DOMAIN. "KNEEL." One continuous beam from his mouth pins them, pushes them back, tilts up carrying them, flings them, and keeps going into the sky:
     lava rains for about 15 seconds (glowing shadows first), then the sky clears. Full damage to non-fire titans, less to fire ones,
     none to INFERNOTH. Red-orange sky. "I AM KING OF ALL."
   - SECRET: GROUND ZERO (ultimate ready AND in rage; not in the move list). "YOU CANNOT HIDE." Grab, then his whole
     body detonates (like Vegeta's Final Explosion): wipes out the area, takes about 75% of the rival's max health
     (a hurt rival is finished, a healthy one can survive), and leaves INFERNOTH at 1 HP. Landed: "FATE WILL DECIDE NOW!"
     in raged text that cracks into a roar. The screen stays cracked for the rest of that round, the sky orange-red for the rest of the MATCH;
     used in round 2 or 3, fireballs rain for the rest of the match and they hurt INFERNOTH too. A miss uses it up.
   Kaiju lines only show as words when you're playing a kaiju (otherwise they roar).
   ===================================================================== */
const KX={rocks:[],patches:[],walls:[],blobs:[],bombs:[],match:{},round:{}};
const elOf=f=>(f&&f.load&&f.load.el)||V8DEFEL[f&&f.def&&f.def.id];

/* ---------- MELTDOWN stance ---------- */
{ const D=V8DEFS.find(d=>d.id==='infernoth'), s1=D.stances[1];
  D.stances[1]=ST('MELTDOWN',{speed:s1.speed,power:1.2,armor:.9,grab:false,jump:16,J:'mspit',M:'mwall',K:'merupt',L:'mbeam',hot:true});
  D.forms=[D.stances[0],D.stances[1]]; }
STRINGS['infernoth:1']={ L:{id:'mspit',c:0}, LL:{id:'mspit',c:1}, LLL:{id:'mspit',c:2,end:1},
 LLM:{id:'mwall',end:1}, LLH:{id:'merupt',end:1}, LM:{id:'mwall'}, LH:{id:'merupt',end:1}, M:{id:'mwall'}, MH:{id:'merupt',end:1} };
LIGHT.push('mspit');
Object.assign(MOVES,{
 mspit:{name:'Lava Spit',dur:.5,hitAt:.25,moveMul:.2,anim:'mspitp'},
 mwall:{name:'Magma Wall',dur:.8,hitAt:.45,moveMul:0,anim:'kstomp'},
 merupt:{name:'Eruption',dur:.9,hitAt:.45,moveMul:0,anim:'kstomp',holdP:.2},
 mbeam:Object.assign({},MOVES.heatbeam,{name:'Heat Beam (lava trail)'}),
 mshove:{name:'Shove-Off',dur:.6,hitAt:.25,moveMul:0,anim:'kgrabp',noCharge:true},
 mmeteor:{name:'Meteor Spit',dur:.7,ranged:1,moveMul:.2,anim:'mspitp',noCharge:true},
 mshell:{name:'Obsidian Shell',dur:.5,moveMul:0,anim:'mshellp',noCharge:true},
 mcore:{name:'Volcano Core',dur:3.6,moveMul:0,anim:'mcorep',noCharge:true},
});
SKILLS_ST.infernoth[1]=[{id:'mmeteor',cd:7,cost:20,r:80},{id:'mshell',cd:14,cost:20,r:30},{id:'mcore',cd:18,cost:40,r:40}];
// GRAB in MELTDOWN = shove-off
{ const o=v8Input; v8Input=function(f,inp,dt){
  if(isInf(f)&&inp.grab>0&&(f.stIdx||0)===1){ const canAct=!f.dead&&f.stun<=0&&game.state==='fight'&&f.rollT<=0&&!f.grabbedBy; inp.grab=0; if(canAct&&!f.atk) f.startAtk('mshove'); }
  return o(f,inp,dt); }; }

/* falling lava (meteors, volcano core bombs, lava rain, fireball rain): glowing shadow first, then the hit */
const ROCKG=new THREE.DodecahedronGeometry(1,0);
const moltenM=()=>new THREE.MeshStandardMaterial({color:0x2a1410,emissive:0xff4a10,emissiveIntensity:.9,roughness:.9,flatShading:true});
function dropRock(x,z,o){ const r=o.r||6, ring0=new THREE.Mesh(new THREE.RingGeometry(r*.55,r,28),new THREE.MeshBasicMaterial({color:o.col||INF.ORANGE,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}));
 ring0.rotation.x=-Math.PI/2; ring0.position.set(x,.2,z); scene.add(ring0); const warn=o.warn||.8;
 let rock=null; if(!o.geyser){ rock=new THREE.Mesh(ROCKG,moltenM()); rock.scale.setScalar(r*.38); rock.position.set(x+rand(-8,8),120,z+rand(-8,8)); scene.add(rock); }
 KX.rocks.push(Object.assign({x,z,r,t:warn,w0:warn,m:ring0,rock,sx:rock?rock.position.x:x,sz:rock?rock.position.z:z},o)); }
// a lava fountain: molten blobs thrown up in a column
function lavaFountain(x,z,h,n){ for(let i=0;i<(n||6);i++) later(i*.05,()=>{ const y=2+i*(h||24)/(n||6); burst(V(x+rand(-1.5,1.5),y,z+rand(-1.5,1.5)),i%2?0xffd27a:INF.ORANGE,6,10); burst(V(x,y*.7,z),0x5a1a08,3,8); }); }
// a glowing pool that cools from bright orange to dark red rock (hurts the rival while it's hot)
function lavaPool(x,z,r,owner,dps,life){ const m=new THREE.Mesh(new THREE.CircleGeometry(r,22),new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.85,depthWrite:false}));
 m.rotation.x=-Math.PI/2; m.position.set(x,.13+Math.random()*.02,z); scene.add(m); KX.patches.push({f:owner,x,z,r,t:life||2.6,max:life||2.6,m,dps:dps||0,pool:true}); }
function rockHit(R){ scene.remove(R.m); R.m.geometry.dispose(); R.m.material.dispose(); if(R.rock){ scene.remove(R.rock); R.rock.material.dispose(); }
 if(R.geyser) lavaFountain(R.x,R.z,30,7); else { burst(V(R.x,2,R.z),0xffd27a,14,22); burst(V(R.x,1,R.z),0x3a1a10,10,14); }
 lava(V(R.x,2,R.z),14,18); lavaPool(R.x,R.z,R.r*.8,R.owner&&R.owner.def?R.owner:null,R.owner&&R.owner.def?5:0,2.6); dust(R.x,R.z,R.r*.6,4); Snd.thud&&Snd.thud();
 for(const t of [game.p,game.e]){ if(!t||!canHit(t)||t.pos.y>12) continue; if(Math.hypot(t.pos.x-R.x,t.pos.z-R.z)>R.r+t.radius()*.4) continue;
  let k=1; if(R.immune&&t===R.immune) continue; if(R.fireHalf&&elOf(t)==='fire') k=.5;
  const s0=t.stun; t.takeHit(R.owner||HZ,R.dmg*k,R.kb||6,R.ln||4,false,{x:t.pos.x-R.x+.01,z:t.pos.z-R.z}); if(R.noStun) t.stun=s0; }
 if(R.bld) for(const b of city) if(b.alive&&Math.hypot(b.x-R.x,b.z-R.z)<R.r+Math.max(b.w,b.d)/2) bHit(b,R.bld,0,0,b.h*.5,R.owner||HZ); }

/* ---------- MELTDOWN moves ---------- */
Object.assign(V8MOVE,{
 mspit(f,a,dt,pm,o){ if(once(a,'s',a.hitAt)){ const c=a.chain||0, from=f.chest().add(V(Math.sin(f.yaw)*5,2,Math.cos(f.yaw)*5));
   let yaw=f.yaw; if(canHit(o)&&dist2(f,o)<60) yaw=Math.atan2(o.pos.x-f.pos.x,o.pos.z-f.pos.z);
   const m=new THREE.Mesh(new THREE.SphereGeometry(c===2?1.6:1.1,8,6),glowM(INF.ORANGE,2.6)); m.position.copy(from); scene.add(m);
   KX.blobs.push({f,m,vel:V(Math.sin(yaw)*70,0,Math.cos(yaw)*70),t:c===2?.7:.55,dmg:(c===2?9:5)*pm,big:c===2}); Snd.tone('sawtooth',160,60,.15,.05); } },
 mwall(f,a,dt,pm,o){ if(once(a,'w',a.hitAt)){ for(const W of KX.walls) if(W.f===f) W.t=Math.min(W.t,.3);   // one wall at a time
   const c=fwd(f,12*f.scale), w=24, g=new THREE.Mesh(new THREE.BoxGeometry(w,9,2.2),glowM(INF.ORANGE,1.8)); g.position.set(c.x,-4,c.z); g.rotation.y=f.yaw; scene.add(g);
   KX.walls.push({f,x:c.x,z:c.z,yaw:f.yaw,w,t:4,m:g,dps:14*pm}); dust(c.x,c.z,8,8); Snd.boom(); game.shake=Math.max(game.shake,.4); } },
 merupt(f,a,dt,pm,o){ const c=a.chg||0;
  if(once(a,'e',a.hitAt)){ const rng=40+30*c; const ok=canHit(o)&&dist2(f,o)<rng; const at=ok?V(o.pos.x,0,o.pos.z):fwd(f,Math.min(rng,30));
   dropRock(at.x,at.z,{geyser:true,r:8+2*c,warn:.35,dmg:(15+6*c)*pm,kb:10,ln:20,owner:f,immune:f,col:0xffb347,bld:60}); Snd.thud&&Snd.thud(); game.shake=Math.max(game.shake,.4); } },
 mbeam(f,a,dt,pm,o){ if(a.on==null){ a.on=.7; a.off=2.2; a.dur=a.off+.2; }
  V8MOVE.heatbeam(f,a,dt,pm,o);
  if(a.t>=a.on&&a.t<a.off&&game.time-(a._tr||0)>.14){ a._tr=game.time; const d=canHit(o)?clamp(dist2(f,o),14,80):55, p=fwd(f,d);
   lavaPool(p.x,p.z,5,f,10*pm,3); if(Math.random()<.5) burst(V(p.x,1,p.z),0xffd27a,4,8); } },
 mshove(f,a,dt,pm,o){ if(!a.held&&!a.miss){ if(once(a,'g',a.hitAt)){ if(inFront(f,o,13,.9)){ a.held=true; a.gT=a.t; a.dur=a.t+.45; Snd.crunch&&Snd.crunch(); } else whiff(f,a,.45); } return; }
  if(a.held){ if(a.t-a.gT<.2) holdAt(f,o,9,3); else if(once(a,'t',a.gT+.2)){ grabHit(f,o,10*pm,70,10,{x:Math.sin(f.yaw),z:Math.cos(f.yaw)}); lava(o.chest(),14,14); Snd.whoosh(); } } },
 mmeteor(f,a,dt,pm,o){ if(once(a,'m',.3)){ const c=canHit(o)&&dist2(f,o)<90?V(o.pos.x,0,o.pos.z):fwd(f,40);
   for(let i=0;i<3;i++){ const an=rand(0,6.28), rr=i?rand(5,11):0; dropRock(c.x+Math.cos(an)*rr,c.z+Math.sin(an)*rr,{r:7,warn:.75+i*.18,dmg:10*pm,kb:8,ln:6,owner:f,immune:f,bld:30}); }
   Snd.tone('sawtooth',120,500,.3,.08); } },
 mshell(f,a,dt,pm,o){ if(once(a,'s',.2)){ f.shellT=game.time+4; burst(f.chest(),0x1a1418,40,16); toast(f.isPlayer?'OBSIDIAN SHELL!':'INFERNOTH HARDENS INTO ROCK!','#cbd5e1',800); Snd.crunch&&Snd.crunch(); } },
 mcore(f,a,dt,pm,o){ f.kb.set(0,0,0); if(a.t<.4) return; if(game.time-(a._b||0)>.22){ a._b=game.time;
   const near=canHit(o)&&dist2(f,o)<55&&Math.random()<.35, an=rand(0,6.28), rr=rand(10,40), x=near?o.pos.x+rand(-6,6):f.pos.x+Math.cos(an)*rr, z=near?o.pos.z+rand(-6,6):f.pos.z+Math.sin(an)*rr;
   dropRock(x,z,{r:6,warn:.6,dmg:6*pm,kb:6,ln:5,owner:f,immune:f,bld:25}); lava(f.chest().add(V(0,6,0)),6,22); }
  if(once(a,'r',.4)){ Snd.roar&&Snd.roar(); News.add('INFERNOTH HAS BECOME A LIVING VOLCANO!',true,'icore',8); } },
});
// Obsidian Shell: half damage, small shots bounce back
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  if(isInf(this)&&this.shellT>game.time&&!this.dead){ const P=V8.proj, small=!!(P&&P.r<=3&&!P.pierce)&&src&&src.def&&src!==HZ;
   if(small){ burst(this.chest(),0x2a2028,10,10); if(canHit(src)){ const s0=src.stun; src.takeHit(this,dmg*.6,4,0,false); src.stun=s0; } return; }
   dmg*=.5; kb*=.5; }
  return oTH.call(this,src,dmg,kb,launch,cont,dir); }; }

POSES.mspitp=(k,p,e)=>{ const w=ez(ph(p,0,.45)), s=ez(ph(p,.45,.6)); k.headX=lerp(lerp(0,-.35,w),.3,s); k.jaw=lerp(lerp(0,1.2,w),.3,s); k.lean=lerp(-.1,.2,s); k.armL=k.armR=-.6; };
POSES.mshellp=(k,p,e)=>{ k.armL=k.armR=-1.2*e; k.azL=.5*e; k.azR=-.5*e; k.lean=.35*e; k.knL=k.knR=.6*e; k.headX=.3*e; };
POSES.mcorep=(k,p,e)=>{ k.armL=k.armR=-2.7; k.azL=-.8; k.azR=.8; k.headX=-.5; k.jaw=1.2; k.lean=-.25; k.knL=k.knR=.4; };

/* ---------- ULTIMATES ---------- */
const KSLOW=.44;   // INFERNOTH cutscenes play slower = longer (MajorasPride: "a little longer")
const KULT={ king:{name:'KING',intro:'THIS IS MY LAND.',quote:'BOW TO YOUR KING.'},
 lava:{name:'LAVA DOMAIN',intro:'KNEEL.',quote:'I AM KING OF ALL.'},
 gz:{name:'GROUND ZERO',intro:'YOU CANNOT HIDE.',quote:'FATE WILL DECIDE NOW!'} };
const kKind=f=>f.kRageT>0?'gz':(f.stIdx||0)===1?'lava':'king';
const kSay=(f,txt)=>canUnderstand(f).ok?txt:'GRRRAAAAAAHHH!!!';
{ const oS=v8UltStart; v8UltStart=function(f){ if(!isInf(f)) return oS(f); const k=kKind(f), U=KULT[k]; f._ult=k; f.def.ultName=U.name; V8SAY.infernoth=[U.intro];
  if(k==='gz'){ f.kRageT=Math.max(f.kRageT,6); News.add('INFERNOTH IS GLOWING BRIGHTER THAN THE SUN. EVACUATE NOW.',true,'igz',8); }
  oS(f); if(f.isPlayer||game.vs2) toast(k==='lava'?'AIM THE BEAM!':'GET CLOSE TO GRAB THEM!','#ffb36b',900); }; }
function kCineStart(f,a,kind){ if(a._cut) return; a._cut=1; a.contact=a.t;
 CINE.on=true; CINE.side=false; CINE.f=f; CINE.o=f.opp; CINE.a=a; CINE.inf=kind; CINE.t0=a.t; CINE.shot=-1; CINE.brawl=false;
 cineEl.classList.add('on'); cineEl.classList.remove('comic'); document.body.classList.add('vcine');
 const q=kSay(f,KULT[kind].quote); cq.classList.toggle('kraged',kind==='gz'); cinePop(cq,q); cineFreeze(1100,KSLOW);
 if(kind==='gz'){ const tok=game.token; setTimeout(()=>{ if(tok!==game.token||!CINE.on) return; cq.textContent='FATE WILL DECI—'; setTimeout(()=>{ if(tok!==game.token||!CINE.on) return; cinePop(cq,'GRRRAAAAAAAHHHH!!!'); Snd.roar&&Snd.roar(); },350); },1100); } Snd.roar&&Snd.roar(); }
{ const s=document.createElement('style'); s.textContent=`#vcine .q.kraged{color:#fff2d0;-webkit-text-stroke:3px #7a1a00;text-shadow:0 0 18px #ff5a1a,0 0 40px #ff2a00;animation:kshake .08s infinite,vq .35s forwards}
@keyframes kshake{0%{translate:-3px 2px}50%{translate:3px -2px}100%{translate:-2px -3px}}
#kcrack{position:fixed;inset:0;z-index:18;pointer-events:none;display:none}#kcrack.on{display:block}`; document.head.appendChild(s); }
// the cracked screen (GROUND ZERO, for the rest of the match)
const crackEl=document.createElement('div'); crackEl.id='kcrack'; document.body.appendChild(crackEl);
function drawCracks(){ const W=1000,H=600, cx=rand(380,620), cy=rand(220,380); let d='';
 for(let i=0;i<14;i++){ let x=cx,y=cy; const an=i/14*Math.PI*2+rand(-.2,.2); d+=`M${x} ${y}`; for(let j=0;j<6;j++){ x+=Math.cos(an+rand(-.5,.5))*rand(40,110); y+=Math.sin(an+rand(-.5,.5))*rand(30,90); d+=` L${x|0} ${y|0}`; } }
 for(let r of [40,90,150]){ d+=` M${cx+r} ${cy}`; for(let k=1;k<=12;k++){ const an=k/12*Math.PI*2; d+=` L${(cx+Math.cos(an)*r*rand(.85,1.15))|0} ${(cy+Math.sin(an)*r*rand(.85,1.15))|0}`; } }
 crackEl.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="100%"><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.2"/><path d="${d}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="5" transform="translate(2 2)"/></svg>`; }

{ const oU=v8UltUpdate; v8UltUpdate=function(f,a,dt,pm,o){ if(!isInf(f)) return oU(f,a,dt,pm,o); const k=f._ult||'king';
  if(!a._init){ a._init=1; a.dur=6; }
  return k==='king'?ultKing(f,a,dt,pm,o):k==='lava'?ultLava(f,a,dt,pm,o):ultGZ(f,a,dt,pm,o); }; }

/* KING (redone Nov 7): charge, jaw grab, toss them straight up super high, then as they fall a tail WHACK
   sends them flying through three buildings. */
function kWhackDir(f,o){ let best=f.yaw+Math.PI, bn=-1;          // the direction with the most buildings in a line
 for(let i=0;i<24;i++){ const an=i/24*Math.PI*2, sx=Math.sin(an), sz=Math.cos(an); let n=0;
  for(const B of city){ if(!B.alive) continue; const dx=B.x-o.pos.x, dz=B.z-o.pos.z, along=dx*sx+dz*sz; if(along<8||along>170) continue; if(Math.abs(dx*sz-dz*sx)<Math.max(B.w,B.d)/2+3) n++; }
  if(n>bn){ bn=n; best=an; } } return best; }
function ultKing(f,a,dt,pm,o){ const t=a.t;
 if(!a._cut){ if(t<.35){ f.setGlow(2+t*4); return; } if(a.miss) return;
  f.kb.x=Math.sin(f.yaw)*85; f.kb.z=Math.cos(f.yaw)*85; if(Math.random()<dt*20) dust(f.pos.x,f.pos.z,4,2);
  if(canHit(o)&&inFront(f,o,13,1)){ f.kb.set(0,0,0); kCineStart(f,a,'king'); }
  else if(t>1.35) ultMiss(f,a,t); return; }
 const k=t-a.contact; f.kb.set(0,0,0);
 if(k<.55){ holdAt(f,o,9,8); o.pos.x+=Math.sin(game.time*40)*1; return; }                                            // in his jaws
 if(!a.up){ a.up={x:f.pos.x+Math.sin(f.yaw)*7,z:f.pos.z+Math.cos(f.yaw)*7}; Snd.whoosh(); News.add(`INFERNOTH THROWS ${o.def.name} INTO THE CLOUDS!`,true,'iking',8); }
 const H=120;
 if(k<1.35){ const q=ez((k-.55)/.8); o.pos.set(a.up.x,8+H*q,a.up.z); o.vy=0; o.kb.set(0,0,0); o.stun=Math.max(o.stun,.4); o.onGround=false; if(Math.random()<dt*20) burst(o.chest(),0xffffff,2,6); return; }  // straight up
 if(k<1.75){ o.pos.set(a.up.x,8+H,a.up.z); o.vy=0; o.stun=Math.max(o.stun,.4); if(once(a,'apex',a.contact+1.35)) cineFreeze(450,KSLOW); return; }                                          // hang at the top
 if(k<2.25){ const q=(k-1.75)/.5; o.pos.set(a.up.x,8+H*(1-q*q),a.up.z); o.vy=0; o.stun=Math.max(o.stun,.4);                                                                             // falling, he winds up the tail
  if(!a.dir){ a.yaw0=f.yaw; a.dir=f.yaw; } f.yaw=a.yaw0-ez(q)*Math.PI*.8; return; }               // batter's wind-up: turn the back, tail cocked
 if(once(a,'whack',a.contact+2.25)){ a.fly={x:o.pos.x,z:o.pos.z,n:0,hit:new Set()}; o.pos.y=9; cinePop(cw,'WHACK!'); cw.style.color='#ffb347'; cineFlash(); cineFreeze(380,KSLOW);
  const s0=o.launchImm; o.launchImm=0; ultHit(f,o,54*pm,0,0); o.launchImm=s0; game.shake=Math.max(game.shake,1.6); Snd.boom(); lava(o.chest(),30,24); }
 if(k<2.45&&a.yaw0!=null){ f.yaw=a.yaw0-Math.PI*.8+ez(Math.min(1,(k-2.25)/.2))*Math.PI*1.7; }                    // the swing: tail whips all the way around
 if(a.fly&&!a.flyDone){ const F=a.fly, sx=Math.sin(a.dir), sz=Math.cos(a.dir), sp=170*dt; F.x+=sx*sp; F.z+=sz*sp; o.pos.set(F.x,9+Math.sin(Math.min(1,(k-2.25)/1)*Math.PI)*25,F.z); o.vy=0; o.kb.set(0,0,0); o.stun=Math.max(o.stun,.6); if(o.root) o.root.rotation.x+=dt*22;   // tumbling end over end
  if(Math.random()<dt*40) dust(F.x,F.z,3,2);
  if(k>3.25||Math.hypot(F.x,F.z)>ARENA-10){ a.flyDone=true; if(o.root) o.root.rotation.x=0; o.kb.x=sx*30; o.kb.z=sz*30; o.vy=8; a.dur=a.t+.9;
   o.pos.y=0; dust(F.x,F.z,14,18); ring(F.x,1,F.z,18,INF.ORANGE,.5); game.shake=Math.max(game.shake,1); Snd.boom(); News.add(`${o.def.name} CRASHES DOWN ON THE OTHER SIDE OF THE CITY!`,true,'iking2',8); } } }

/* LAVA DOMAIN: aimed heat beam, then the beam goes into the sky and lava rains for the rest of the round */
function kBeamMesh(a,from,to,w){ if(!a.bm){ a.bm=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,10,1,true),new THREE.MeshBasicMaterial({color:0xf4fbff,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false})); scene.add(a.bm); }   // white-hot core
 const len=from.distanceTo(to); a.bm.scale.set(w,len,w); a.bm.position.copy(from).lerp(to,.5); a.bm.lookAt(to); a.bm.rotateX(Math.PI/2); }
function kBeamOff(a){ if(a.bm){ scene.remove(a.bm); a.bm.geometry.dispose(); a.bm.material.dispose(); a.bm=null; } if(a.bo){ scene.remove(a.bo); a.bo.geometry.dispose(); a.bo.material.dispose(); a.bo=null; } }
{ const o=kBeamMesh; kBeamMesh=function(a,from,to,w){ o(a,from,to,w); if(!a.bo){ a.bo=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,12,1,true),new THREE.MeshBasicMaterial({color:0x4aa8ff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false})); scene.add(a.bo); }   // blue-white plasma glow (hotter than his orange beam)
  a.bo.position.copy(a.bm.position); a.bo.quaternion.copy(a.bm.quaternion); a.bo.scale.set(w*1.9,a.bm.scale.y,w*1.9); }; }
const kMouth=f=>{ const p=V(); f.emitObj().getWorldPosition(p); return p; };
function ultLava(f,a,dt,pm,o){ const t=a.t, mouth=kMouth(f);
 // one continuous beam out of his mouth: it pins them, pushes them back, tilts up carrying them, flings them, and ends in the sky
 const beamTo=(pitch,len)=>mouth.clone().add(V(Math.sin(f.yaw)*Math.cos(pitch)*len,Math.sin(pitch)*len,Math.cos(f.yaw)*Math.cos(pitch)*len));
 if(!a._cut){ f.kb.set(0,0,0); if(t<.7){ f.setGlow(1+t*5); if(Math.random()<dt*30) burst(mouth,Math.random()<.5?0xffffff:0x7cc4ff,2,4); return; }
  if(a.miss){ kBeamOff(a); return; }
  if(once(a,'fire',.7)){ Snd.roar&&Snd.roar(); game.shake=Math.max(game.shake,.5); }
  kBeamMesh(a,mouth,beamTo(-.05,120),2.4); if(Math.random()<dt*30) burst(mouth,Math.random()<.5?0xffffff:0x7cc4ff,2,6);
  if(canHit(o)){ const dx=o.pos.x-f.pos.x, dz=o.pos.z-f.pos.z, d=Math.hypot(dx,dz); if(d<125&&Math.abs(angDiff(f.yaw,Math.atan2(dx,dz)))<Math.atan2(6+o.radius(),d)+.06){
    a.d0=Math.max(18,o.chest().distanceTo(mouth)); kCineStart(f,a,'lava'); return; } }
  if(t>1.9){ kBeamOff(a); ultMiss(f,a,t); } return; }
 const k=t-a.contact, PIN=1.4, RISE=1.8, H=Math.PI*.47;
 f.setGlow(4); f.kb.set(0,0,0); game.shake=Math.max(game.shake,.35);
 if(k<PIN+RISE){ // pinned on the beam: pushed back, then carried up as the beam tilts toward the sky
  const q=k<PIN?0:ez((k-PIN)/RISE), pitch=-.03+q*H, d=a.d0+Math.min(k,PIN)/PIN*22+q*10;
  const end=beamTo(pitch,d); kBeamMesh(a,mouth,end,2.6+Math.sin(game.time*40)*.3);
  o.pos.set(end.x,Math.max(0,end.y-(o.chest().y-o.pos.y)),end.z); o.vy=0; o.kb.set(0,0,0); o.stun=Math.max(o.stun,.5); o.onGround=false;
  if(Math.random()<dt*14){ const s0=o.stun; o.takeHit(f,(28*pm)*.08,0,0,true,{x:Math.sin(f.yaw),z:Math.cos(f.yaw)}); o.stun=s0; }
  if(Math.random()<dt*30){ burst(o.chest(),0xffffff,2,12); burst(o.chest(),0x7cc4ff,2,10); } return; }
 if(once(a,'fling',a.contact+PIN+RISE)){ const s0=o.launchImm; o.launchImm=0; ultHit(f,o,22*pm,95,34); o.launchImm=s0; lava(o.chest(),40,26); cineFlash(); Snd.boom(); } // flung off the top of the beam
 if(k<PIN+RISE+1.1){ kBeamMesh(a,mouth,beamTo(H,400),3+Math.sin(game.time*40)*.4); return; }                                           // the beam keeps going into the sky
 if(once(a,'rain',a.contact+PIN+RISE+1.1)){ kBeamOff(a); cineFlash(); KX.round.sky=0xff4a14; KX.round.until=game.time+15; KX.round.rain={owner:f,immune:f,fireHalf:true,dmg:7*pm,every:.3,col:INF.ORANGE};
  News.add('THE SKY IS RAINING LAVA OVER NEON CITY!',true,'ilava',10); a.dur=a.t+.5; } }

/* GROUND ZERO: grab, then he detonates. 75% of the rival's max health, he drops to 1 HP. */
function ultGZ(f,a,dt,pm,o){ const t=a.t;
 if(!a._cut){ if(t<.3){ f.setGlow(4); return; } if(a.miss) return;
  f.kb.x=Math.sin(f.yaw)*60; f.kb.z=Math.cos(f.yaw)*60;
  if(canHit(o)&&inFront(f,o,15,1.1)){ f.kb.set(0,0,0); kCineStart(f,a,'gz'); }
  else if(t>1.1){ ultMiss(f,a,t); if(f.isPlayer) toast('GROUND ZERO MISSED. IT\'S GONE.','#ff6b6b',1100); } return; }
 const k=t-a.contact;
 if(k<2.2){ holdAt(f,o,7,3); f.setGlow(4+k*3); f.kRageT=Math.max(f.kRageT,1); if(Math.random()<dt*40) burst(f.chest().add(V(rand(-6,6),rand(-4,8),rand(-6,6))),Math.random()<.5?INF.WHITE:INF.ORANGE,3,12); game.shake=Math.max(game.shake,k*.5); return; }
 if(once(a,'boom',a.contact+2.2)){ const R=95, x=f.pos.x, z=f.pos.z;
  const ball=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:INF.WHITE,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false})); ball.position.set(x,8,z); scene.add(ball); a.ball=ball;
  for(const B of city) if(B.alive&&Math.hypot(B.x-x,B.z-z)<R) bHit(B,(B.hp||400)+100,B.x-x,B.z-z,B.h*.5,f);
  propsBlast&&propsBlast(x,0,z,R); peopleBlast&&peopleBlast(x,z,R);
  const before=o.hp, want=o.def.hp*.75; const s0=o.launchImm; o.launchImm=0;
  if(before<=want) o.takeHit(f,99999,140,30,false,{x:o.pos.x-x+.01,z:o.pos.z-z});
  else { o.takeHit(f,1,140,30,false,{x:o.pos.x-x+.01,z:o.pos.z-z}); o.hp=Math.max(1,before-want); }
  o.launchImm=s0; f.hp=1; f.kRageT=0; f.kRage=0;
  KX.match.sky=0xff5a1a; KX.round.crack=true; drawCracks(); crackEl.classList.add('on');
  if(game.round>=2) KX.match.rain={owner:null,immune:null,fireHalf:false,dmg:6,every:.45,col:0xff3a10,hurtAll:true};
  game.shake=3; Snd.boom(); Snd.boom(); cineFlash(); News.add('GROUND ZERO. INFERNOTH HAS LEVELED THE DISTRICT.',true,'igz2',12); a.dur=a.t+1.6; }
 if(a.ball){ const q=Math.min(1,(k-2.2)/1.2); a.ball.scale.setScalar(5+q*90); a.ball.material.opacity=.95*(1-q*.85); if(q>=1){ scene.remove(a.ball); a.ball=null; } } }

// the INFERNOTH cutscene camera (uses the same cutscene frame as VALOR's)
{ const oC=cineCam; cineCam=function(){ if(!CINE.inf) return oC(); const f=CINE.f, o=CINE.o, a=CINE.a; if(!f||!o) return;
  const k=a.t-(a.contact||a.t), fy=f.yaw, fw=V(Math.sin(fy),0,Math.cos(fy)), side=V(Math.cos(fy),0,-Math.sin(fy)), fc=f.chest(), oc=o.chest(), s=f.scale||1;
  if(CINE.inf==='king'){
   if(k<.55){ camAt(fc.clone().addScaledVector(fw,26*s).addScaledVector(side,9).add(V(0,-4,0)),fc.clone().add(V(0,5,0))); return; }                                   // quote close-up, rival in his jaws
   if(k<1.75){ if(cineShot(1)) cq.classList.remove('show'); camAt(V(f.pos.x-fw.x*22+side.x*14,3,f.pos.z-fw.z*22+side.z*14),V(f.pos.x,fc.y+(oc.y-fc.y)*.55,f.pos.z)); return; }   // low behind him, looking up at them                           // low, looking up as they fly into the sky
   if(k<2.25){ cineShot(2); camAt(V(f.pos.x-fw.x*30+side.x*26,10,f.pos.z-fw.z*30+side.z*26),fc.clone().lerp(oc,.35)); return; }                                       // they fall, he winds up the tail
   const d=a.dir||fy, dv=V(Math.sin(d),0,Math.cos(d)), dsd=V(Math.cos(d),0,-Math.sin(d));
   if(k<2.6){ cineShot(3); camAt(V(f.pos.x+dsd.x*40,8,f.pos.z+dsd.z*40),fc.clone().lerp(oc,.5)); return; }                                                            // WHACK, side on
   cineShot(4); camAt(V(o.pos.x-dv.x*40+dsd.x*22,16,o.pos.z-dv.z*40+dsd.z*22),oc); if(a.flyDone&&k>3.0||!f.atk||f.atk.id!=='ultimate') cineEnd(); return; }      // chase them through the buildings
  if(CINE.inf==='lava'){
   if(k<1.4){ camAt(V(f.pos.x+side.x*55+fw.x*20,10,f.pos.z+side.z*55+fw.z*20),fc.clone().lerp(oc,.55)); return; }                                        // side on: pinned and pushed back by the beam
   if(k<3.2){ if(cineShot(1)) cq.classList.remove('show'); camAt(V(f.pos.x-fw.x*30+side.x*30,4,f.pos.z-fw.z*30+side.z*30),fc.clone().lerp(oc,.6)); return; }   // low behind him: the beam tilts up, carrying them
   if(k<4.3){ cineShot(2); camAt(V(f.pos.x+side.x*80,12,f.pos.z+side.z*80),V(f.pos.x,60,f.pos.z)); return; }                                           // the beam into the sky
   cineShot(3); camAt(V(f.pos.x+side.x*90,60,f.pos.z+side.z*90),V(f.pos.x,30,f.pos.z)); if(k>4.8||!f.atk||f.atk.id!=='ultimate') cineEnd(); return; }
  // GROUND ZERO
  if(k<2.2){ const g=k*.5; camAt(V(f.pos.x+Math.sin(fy+g)*30*s,fc.y+2,f.pos.z+Math.cos(fy+g)*30*s),fc); return; }
  if(cineShot(1)){ cq.classList.remove('show'); }
  camAt(V(f.pos.x+side.x*200,70,f.pos.z+side.z*200),V(f.pos.x,20,f.pos.z)); if(k>4.0||!f.atk||f.atk.id!=='ultimate') cineEnd(); }; }
{ const o=cineEnd; cineEnd=function(){ for(const f of [game.p,game.e]) if(f&&f.root) f.root.rotation.x=0; if(CINE.inf){ CINE.inf=null; cq.classList.remove('kraged'); } return o(); }; }

/* ---------- every frame: spit blobs, walls, trail patches, falling rocks, rain, sky ---------- */
function kxTick(dt){ if(game.mode!=='match') return; const fight=game.state==='fight';
 for(let i=KX.blobs.length-1;i>=0;i--){ const B=KX.blobs[i], o=B.f.opp; B.t-=dt; B.m.position.addScaledVector(B.vel,dt); if(Math.random()<dt*30) burst(B.m.position.clone(),Math.random()<.5?0xffd27a:0x5a1a08,1,3); let done=B.t<=0;
  if(o&&canHit(o)&&B.m.position.distanceTo(o.chest())<o.radius()+3){ V8.proj={r:3.2,mesh:B.m}; /* big enough that the auto-shield doesn't eat it; holding block still works */ try{ o.takeHit(B.f,B.dmg,B.big?14:5,0,false,{x:B.vel.x,z:B.vel.z}); } finally{ V8.proj=null; } if(B.big){ o.burnT=Math.max(o.burnT||0,1.5); o.burnBy=B.f; } lava(B.m.position.clone(),8,10); done=true; }
  for(const W of KX.walls) if(W.f!==B.f&&wallHit(W,B.m.position)) done=true;
  if(done){ scene.remove(B.m); B.m.geometry.dispose(); KX.blobs.splice(i,1); } }
 for(let i=KX.walls.length-1;i>=0;i--){ const W=KX.walls[i], o=W.f.opp; W.t-=dt; W.m.position.y=Math.min(4.5,W.m.position.y+dt*30); if(W.t<.3) W.m.position.y-=dt*30;
  for(let j=projs.length-1;j>=0;j--){ const p=projs[j]; if(p.owner!==W.f&&wallHit(W,p.mesh.position)){ burst(p.mesh.position.clone(),INF.ORANGE,8,10); p.life=0; } }   // blocks shots
  if(o&&canHit(o)&&wallHit(W,o.pos.clone().setY(3),o.radius()*.6)){ const s0=o.stun; o.takeHit(W.f,W.dps*dt,0,0,true,{x:0,z:1}); o.stun=s0; const nx=Math.sin(W.yaw), nz=Math.cos(W.yaw), side=(o.pos.x-W.x)*nx+(o.pos.z-W.z)*nz>0?1:-1; o.kb.x+=nx*side*40*dt*10; o.kb.z+=nz*side*40*dt*10; }
  if(W.t<=0){ scene.remove(W.m); W.m.geometry.dispose(); KX.walls.splice(i,1); } }
 for(let i=KX.patches.length-1;i>=0;i--){ const P=KX.patches[i], o=P.f&&P.f.opp; P.t-=dt;
  if(P.pool){ const q=1-P.t/P.max; P.m.material.color.setHex(0xffb347).lerp(new THREE.Color(0x4a0c02),q); P.m.material.opacity=.85*(1-q*q); if(Math.random()<dt*4*(1-q)) burst(V(P.x+rand(-P.r,P.r)*.6,.6,P.z+rand(-P.r,P.r)*.6),0xffd27a,1,4); }
  else P.m.material.opacity=Math.min(.6,P.t*.4);
  if(P.dps>0&&o&&canHit(o)&&o.pos.y<4&&P.t>P.max*.35*(P.pool?1:0)&&Math.hypot(o.pos.x-P.x,o.pos.z-P.z)<P.r+o.radius()*.4){ const s0=o.stun; o.takeHit(P.f,P.dps*dt,0,0,true,{x:0,z:1}); o.stun=s0; }
  if(Math.random()<dt*3) burst(V(P.x,1,P.z),INF.ORANGE,1,5);
  if(P.t<=0){ scene.remove(P.m); P.m.geometry.dispose(); KX.patches.splice(i,1); } }
 for(let i=KX.rocks.length-1;i>=0;i--){ const R=KX.rocks[i]; R.t-=dt; R.m.material.opacity=.3+.35*Math.abs(Math.sin(game.time*12));
  if(R.rock){ const q=Math.max(0,R.t/R.w0); R.rock.position.set(lerp(R.x,R.sx,q),1+119*q,lerp(R.z,R.sz,q)); R.rock.rotation.x+=dt*4; R.rock.rotation.z+=dt*3; if(Math.random()<dt*40) burst(R.rock.position.clone(),Math.random()<.6?INF.ORANGE:0x4a3a36,2,5); }
  else if(Math.random()<dt*30) burst(V(R.x+rand(-2,2),.5,R.z+rand(-2,2)),INF.ORANGE,1,6);
  if(R.t<=0){ KX.rocks.splice(i,1); rockHit(R); } }
 for(const RN of [KX.round.rain,KX.match.rain]){ if(!RN||!fight) continue; RN.acc=(RN.acc||0)+dt; if(RN.acc<RN.every) continue; RN.acc=0;
  const tg=[game.p,game.e][(Math.random()*2)|0], near=Math.random()<.5&&tg, an=rand(0,6.28), rr=rand(0,ARENA*.7);
  dropRock(near?tg.pos.x+rand(-14,14):Math.cos(an)*rr, near?tg.pos.z+rand(-14,14):Math.sin(an)*rr,{r:6,warn:.9,dmg:RN.dmg,kb:6,ln:4,owner:RN.owner,immune:RN.hurtAll?null:RN.immune,fireHalf:RN.fireHalf,col:RN.col,noStun:true,bld:20}); }
 if(KX.round.until&&game.time>KX.round.until){ KX.round.until=0; KX.round.rain=null; KX.round.sky=0; KX.revert=2.5; if(game.p&&game.p.isPlayer) toast('THE LAVA RAIN STOPS','#cbd5e1',800); }
 const sky=KX.match.sky||KX.round.sky; if(!sky&&KX.revert>0){ KX.revert-=dt; scene.background.lerp(SKY,Math.min(1,dt*1.5)); scene.fog.color.lerp(new THREE.Color(MAP.fog),Math.min(1,dt*1.5)); }
 if(sky){ const c=new THREE.Color(sky); scene.background.lerp(c.clone().multiplyScalar(.45),Math.min(1,dt*1.5)); scene.fog.color.lerp(c.clone().multiplyScalar(.35),Math.min(1,dt*1.5)); }
 crackEl.classList.toggle('on',!!KX.round.crack); }
function wallHit(W,p,pad){ const nx=Math.sin(W.yaw), nz=Math.cos(W.yaw), dx=p.x-W.x, dz=p.z-W.z, along=dx*nz-dz*nx, across=dx*nx+dz*nz;
 return Math.abs(along)<W.w/2&&Math.abs(across)<1.6+(pad||0)&&p.y<10&&W.m.position.y>0; }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ kxTick(dt); }catch(e){ console.error(e); } }; }
function kxClear(all){ for(const L of [KX.blobs,KX.walls,KX.patches]){ for(const x of L){ scene.remove(x.m); x.m.geometry&&x.m.geometry.dispose(); } L.length=0; }
 for(const R of KX.rocks){ scene.remove(R.m); } KX.rocks.length=0; KX.round={}; crackEl.classList.remove('on'); if(all){ KX.match={}; } }
{ const o=startRound; startRound=function(...a){ kxClear(false); return o.apply(this,a); }; }
{ const o=startMatch; startMatch=function(...a){ kxClear(true); return o.apply(this,a); }; }
{ const oR=sbReset; sbReset=function(){ if(!SB._round) kxClear(true); for(const f of [game.p,game.e]) if(f) f.shellT=0; oR(); }; }
// GROUND ZERO stays a secret: it is not in the move list

/* ---------- INFERNOTH ultimate poses (one for every step, no more stiff pose) ---------- */
{ const oP=POSES.vult; POSES.vult=(k,p,e,f,a)=>{ if(!f||!isInf(f)||!a) return oP(k,p,e,f,a); const kind=f._ult||'king', t=a.t, ks=a._cut&&a.contact!=null?t-a.contact:-1, T=game.time;
  const run=()=>{ const s=Math.sin(T*13); k.legL=s*.8; k.legR=-s*.8; k.knL=Math.max(0,-s)*.9; k.knR=Math.max(0,s)*.9; };
  if(kind==='king'){
   if(ks<0){ if(t<.35){ k.headX=-.45; k.jaw=1.3; k.armL=k.armR=-2.3; k.azL=-.7; k.azR=.7; k.lean=-.15; } else { k.lean=.65; k.armL=k.armR=-1.3; k.azL=-.3; k.azR=.3; k.jaw=.9; run(); } return; }
   if(ks<.55){ k.lean=.45; k.headX=.3; k.jaw=.35+Math.abs(Math.sin(T*30))*.2; k.twist=Math.sin(T*28)*.4; k.armL=k.armR=-1.2; return; }                     // shaking them in his jaws
   if(ks<.9){ const q=pz(ks,.55,.75); k.headX=lerp(.3,-1.2,q); k.lean=lerp(.45,-.35,q); k.jaw=1.4; k.armL=k.armR=lerp(-1.2,-2.2,q); k.knL=k.knR=.4*(1-q); return; }   // toss straight up
   if(ks<1.75){ k.headX=-1.1; k.lean=-.3; k.jaw=1.2; k.armL=k.armR=-1.6; k.azL=-.6; k.azR=.6; return; }                                                     // watching them fly
   if(ks<2.25){ const q=pz(ks,1.75,2.25); k.twist=lerp(0,-1.3,q); k.lean=.15+.25*q; k.knL=k.knR=.7*q; k.legL=-.6*q; k.armL=k.armR=-.9; k.azL=-.4; k.azR=.4; k.headX=-.7+.5*q; return; }  // batter's wind-up
   const q=pz(ks,2.25,2.5); k.twist=lerp(-1.1,1.7,q); k.lean=.35; k.knL=k.knR=.5; k.legR=-.4; k.armL=k.armR=-.7; k.azL=-.6; k.azR=.6; k.jaw=1.1; return; }   // WHACK follow-through
  if(kind==='lava'){
   if(ks<0){ k.lean=.3; k.knL=k.knR=.45; k.armL=k.armR=-.7; k.azL=-.2; k.azR=.2; k.headX=t<.7?-.2+t*.5:.15; k.jaw=t<.7?.2+t*1.2:1.35; return; }
   const q=ks<1.4?0:Math.min(1,ez((ks-1.4)/1.8));                                          // the head tilts up with the beam
   k.headX=lerp(.15,-1.15,q); k.lean=lerp(.3,-.5,q); k.jaw=1.45; k.armL=k.armR=-.6; k.azL=-.4*q; k.azR=.4*q; k.knL=k.knR=.5; k.twist=Math.sin(T*40)*.03; return; }
  // GROUND ZERO
  if(ks<0){ k.lean=.6; k.armL=k.armR=-1.6; k.azL=-.4; k.azR=.4; k.jaw=1.1; run(); return; }
  if(ks<2.2){ const q=Math.min(1,ks/1.6); k.armL=k.armR=-1.5; k.elL=k.elR=-1.4; k.azL=.55; k.azR=-.55; k.headX=-.7*q; k.jaw=1.4*q; k.lean=-.25*q; k.knL=k.knR=.5*q; k.twist=Math.sin(T*55)*.06*q; return; }
  k.armL=k.armR=-3; k.azL=-1.1; k.azR=1.1; k.headX=-.9; k.jaw=1.5; k.lean=-.3; }; }
