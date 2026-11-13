/* =====================================================================
   SANDBOX 25 (Nov 13, 2026): HEAVY FEEL — "make them feel bigger".
   MajorasPride: "I wanna feel the punches ... these mechs and monsters are doing damage and fighting carrying
   that mass around" ... "bigger and not faster than regular fighting games" ... like Pacific Rim (thrown
   through buildings, sent flying), Attack on Titan, Transformers, early Hunt: Showdown ("slow yet impactful"),
   Elden Ring. Picked: all four feel parts, all four fight tools (next build), "a bit slower".
   Rule used (Pacific Rim animators): slow the big body down, but never stop-start; keep the hits snappy.
   Rule used (Hunt / Elden Ring): commitment. Heavies wind up longer, can't be taken back, a whiff leaves you
   open, and what lands hits HARD. Lights stay quick and light.
   Every part has its own switch in ⚙ > HEAVY FEEL (NEW), so it can be compared with the old way.
   1. HIT WEIGHT   light hits: short freeze, small shake; heavies/enders: long freeze, big shake.
                   Heavies do +15% damage and push 20% farther, lights do -15% (balance check pending).
   2. WIND-UP      heavy moves take ~40% longer to come out (medium ~18%), with a lean-back before
                   and a lean-in after (follow-through). Whiffed heavies recover 25% slower.
   3. MOMENTUM     titans speed up / slow down instead of starting and stopping instantly, turn slower,
                   walk 15% slower ("a bit slower"). Footsteps puff dust and thump; landings shake + ring.
   4. SENT FLYING  big launches and wall splats / through-the-wall crashes get a short slow-mo,
                   and anyone skidding from a hit leaves a dust trail.
   5. CAMERA       FOV punch-in on heavy hits, phone rumble (Android), deep bass boom on heavies.
   6. BIGGER       camera sits lower and looks up at the titans (low angle = huge), ~6° narrower view.
   ===================================================================== */
const HV={weight:true, windup:true, momentum:true, flying:true, cam:true, bigger:true,
 speed:.85, turn:6.5, accel:4.2, decel:5.5, punch:0, slowT:0, _fb:null, _cp:null};

// ---- deep bass boom (WebAudio, no files) ----
function hvBass(k){ if(!HV.cam||!Snd.ok||!Snd.ok()) return; try{ const c=Snd.ctx, t=c.currentTime, o=c.createOscillator(), g=c.createGain();
  o.type='sine'; o.frequency.setValueAtTime(78,t); o.frequency.exponentialRampToValueAtTime(30,t+.25+.25*k);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(Math.min(.9,.35*k),t+.015); g.gain.exponentialRampToValueAtTime(.0001,t+.35+.35*k);
  o.connect(g); g.connect(Snd.m||c.destination); o.start(t); o.stop(t+.8+.4*k); }catch(_){} }
function hvRumble(ms){ if(!HV.cam||!navigator.vibrate) return; try{ navigator.vibrate(ms); }catch(_){} }

// ---- 1 + 5: hit weight (outermost takeHit wrapper) ----
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  const core=!cont&&src&&src.def&&src!==HZ&&typeof CINE!=='undefined'&&!CINE.on&&src.atk&&src.atk.id!=='ultimate'&&src.atk.id!=='super';
  if(!core||!HV.weight) return oTH.call(this,src,dmg,kb,launch,cont,dir);
  const c=feelClass(src), huge=kb>=60||launch>=20;
  const F0={scale:FLOW.scale,cap:FLOW.cap,bigCap:FLOW.bigCap,recent:FLOW.recent}, s0=game.shake||0, hp0=this.hp;
  if(c==='light'){ FLOW.scale=.5; FLOW.cap=.035; dmg*=.85; }
  else if(c==='medium'){ FLOW.scale=.85; FLOW.cap=.08; }
  else { FLOW.scale=1.25; FLOW.cap=.17; FLOW.bigCap=.26; FLOW.recent=0; dmg*=1.15; kb*=1.2; launch=launch?launch*1.1:launch; }
  const r=oTH.call(this,src,dmg,kb,launch,cont,dir);
  FLOW.scale=F0.scale; FLOW.cap=F0.cap; FLOW.bigCap=F0.bigCap; if(c==='heavy') FLOW.recent+=F0.recent;
  const ds=(game.shake||0)-s0; if(ds>0) game.shake=s0+ds*({light:.45,medium:.9,heavy:1.35}[c]);
  if(this.hp<hp0){ const mine=src===game.p||this===game.p||game.vs2;
   if(c==='heavy'||huge){ HV.punch=Math.max(HV.punch,huge?1.6:1); hvBass(huge?1.6:1); if(mine) hvRumble(huge?70:40); }
   else if(mine) hvRumble(c==='medium'?18:8);
   if(huge&&HV.flying) HV.slowT=Math.max(HV.slowT,.28); }
  return r; }; }

// ---- 2: wind-up, commitment, follow-through ----
{ const oU=FP.updateAtk; FP.updateAtk=function(dt){ const a=this.atk;
  if(!HV.windup||!a||a.hitAt==null||a.id==='ultimate'||a.id==='super'||(typeof CINE!=='undefined'&&CINE.on)) return oU.call(this,dt);
  const c=feelClass({atk:a,F:this.F}); let k=1;
  if(a.t<a.hitAt) k=c==='heavy'?.7:c==='medium'?.85:1;           // longer wind-up
  else if(!a.landed&&c==='heavy') k=.8;                             // whiffed heavy: slower recovery (punishable)
  const before=a.t; oU.call(this,dt*k);
  if(this.atk===a&&before<a.hitAt&&a.t>=a.hitAt&&c!=='light') this._ft={t:0,big:c==='heavy'?1:.6};   // follow-through starts
  return; }; }
{ const oA=v8Anim; v8Anim=function(f,dt){ oA(f,dt); if(!f.root||(typeof CINE!=='undefined'&&CINE.on)) return;
  let off=0; const a=f.atk;
  if(HV.windup&&!f.grabbedBy&&!f.flying){
   if(a&&a.hitAt!=null&&a.t<a.hitAt&&a.id!=='ultimate'){ const c=feelClass({atk:a,F:f.F}); if(c!=='light') off=-(c==='heavy'?.11:.06)*Math.sin(Math.min(1,a.t/a.hitAt)*Math.PI*.5); }   // lean back, loading the hit
   if(f._ft){ f._ft.t+=dt; const q=f._ft.t/.32; if(q>=1) f._ft=null; else off+=Math.sin(q*Math.PI)*.14*f._ft.big; } }  // lean in through it
  f.root.rotation.x+=off-(f._hvOff||0); f._hvOff=off; }; }

// ---- 3 + 4: momentum, slower walk/turn, footsteps, landings, skid dust ----
{ const oUp=FP.update; FP.update=function(dt,inp,opp){
  if(!HV.momentum&&!HV.flying) return oUp.call(this,dt,inp,opp);
  const rx=inp?inp.mx||0:0, rz=inp?inp.mz||0:0, y0=this.yaw, wasAir=!this.onGround, py=this.pos.y;
  if(HV.momentum&&inp){ if(this._mx==null){ this._mx=0; this._mz=0; }
   const want=Math.hypot(rx,rz), have=Math.hypot(this._mx,this._mz), rate=(want>have?HV.accel:HV.decel)*dt, e=1-Math.exp(-rate);
   this._mx+=(rx-this._mx)*e; this._mz+=(rz-this._mz)*e; inp.mx=this._mx*HV.speed; inp.mz=this._mz*HV.speed; }
  const r=oUp.call(this,dt,inp,opp);
  if(inp){ inp.mx=rx; inp.mz=rz; }
  if(HV.momentum&&!this.atk&&!(this.rollT>0)&&!this.flying&&!this.dead&&this.yaw!=null){ const d=angDiff(y0,this.yaw), m=HV.turn*dt; if(Math.abs(d)>m) this.yaw=y0+Math.sign(d)*m; }
  if(HV.momentum&&this.onGround&&!this.dead&&this.moveAmt>.25&&!this.hidden){
   this._stepT=(this._stepT==null?.3:this._stepT)-dt*(.8+this.moveAmt*1.1);
   if(this._stepT<=0){ this._stepT=.55; this._side=-(this._side||1); const s=this._side*(this.radius?this.radius()*.45:2), fx=Math.cos(this.yaw)*s, fz=-Math.sin(this.yaw)*s;
    dust(this.pos.x+fx,this.pos.z+fz,1.5+this.moveAmt,3); if(HV.cam){ game.shake=Math.max(game.shake||0,this.kaiju?.14:.1); hvBass(.22); } } }
  if(HV.momentum&&wasAir&&this.onGround&&!this.dead){ const drop=(this._airTop||py)-this.pos.y; this._airTop=null;
   if(drop>3){ const k=Math.min(1.5,drop/10); dust(this.pos.x,this.pos.z,5+4*k,8); ring(this.pos.x,.3,this.pos.z,8+8*k,0xd8c8b0,.35); if(HV.cam){ game.shake=Math.max(game.shake||0,.4+.5*k); hvBass(.5+.5*k); } } }
  if(!this.onGround) this._airTop=Math.max(this._airTop==null?this.pos.y:this._airTop,this.pos.y);
  if(HV.flying&&this.onGround&&this.kb&&this.kb.length()>16&&Math.random()<dt*22) dust(this.pos.x,this.pos.z,2.5,2);
  return r; }; }
// slow-mo on wall splats and through-the-wall crashes
{ const oS=startSplat; startSplat=function(f,b){ const r=oS(f,b); if(HV.flying){ HV.slowT=Math.max(HV.slowT,.45); HV.punch=Math.max(HV.punch,1.3); hvBass(1.4); hvRumble(60); } return r; }; }
{ const oB=bContact; bContact=function(f,b,dt){ const fast=f.kb&&f.kb.length()>13&&game.time-(f._hitT||-9)<.7, r=oB(f,b,dt);
  if(r===true&&fast&&HV.flying&&game.state==='fight'){ HV.slowT=Math.max(HV.slowT,.4); HV.punch=Math.max(HV.punch,1.2); hvBass(1.3); hvRumble(50); } return r; }; }
{ let last=performance.now(); const oL=loop; loop=function(now){ const rdt=Math.min(.05,(now-last)/1000); last=now;
  if(HV.slowT>0&&!game.paused){ HV.slowT-=rdt; const b=game.timeScale; game.timeScale=b*.35; const r=oL(now); game.timeScale=b; return r; }
  return oL(now); }; }

// ---- 5 + 6: FOV punch + low "giant" camera (applied on top of the normal camera, undone before it runs again) ----
{ const oC=updateCamera; updateCamera=function(dt){
  if(HV._fb!=null){ camera.fov=HV._fb; HV._fb=null; }
  if(HV._cp){ camera.position.copy(HV._cp.p); camera.quaternion.copy(HV._cp.q); HV._cp=null; }
  const r=oC(dt);
  const on=game.mode==='match'&&game.p&&!(typeof CINE!=='undefined'&&CINE.on)&&!game.vs2;
  if(on&&HV.bigger){ const f=game.p, ch=f.chest?f.chest():f.pos, cp=camera.position, h=cp.y-ch.y;
   if(h>0){ HV._cp={p:cp.clone(),q:camera.quaternion.clone()}; const fw=new THREE.Vector3(); camera.getWorldDirection(fw);
    const D=cp.distanceTo(ch), aim=cp.clone().addScaledVector(fw,D), rt=new THREE.Vector3(-fw.z,0,fw.x).normalize();
    cp.y=Math.max(ch.y*.6,cp.y-h*.32); cp.addScaledVector(rt,D*.16);            // lower + over the right shoulder, so the rival isn't hidden
    camera.lookAt(aim.x+rt.x*D*.07,aim.y+h*.18,aim.z+rt.z*D*.07); } }
  HV.punch*=Math.exp(-7*(dt||0));
  const fovCut=(on&&HV.bigger?6:0)+(HV.cam?HV.punch*5:0);
  if(fovCut>.01){ HV._fb=camera.fov; camera.fov=HV._fb-fovCut; camera.updateProjectionMatrix(); }
  return r; }; }

// ---- ⚙ menu: HEAVY FEEL (NEW) switches ----
const HVS=[['HIT WEIGHT','weight'],['WIND-UP','windup'],['MOMENTUM','momentum'],['SENT FLYING','flying'],['CAMERA + RUMBLE','cam'],['BIGGER','bigger']];
function hvUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-hv]')) return; const kit=el('sbKit'); if(!kit) return;
 const d=document.createElement('div'); d.className='sec';
 d.innerHTML=`<div class="lbl">HEAVY FEEL (NEW · SANDBOX 25) — tap to turn each part off and compare</div><div class="row">${HVS.map((c,i)=>`<button data-hv="${i}">${c[0]}</button>`).join('')}<button data-hv="all">ALL OFF / ON</button></div>`;
 kit.closest('.sec').parentNode.insertBefore(d,kit.closest('.sec'));
 d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation();
  if(b.dataset.hv==='all'){ const v=!HVS.some(c=>HV[c[1]]); HVS.forEach(c=>HV[c[1]]=v); toast('HEAVY FEEL: '+(v?'ALL ON':'ALL OFF'),'#ffb347',900); }
  else { const c=HVS[+b.dataset.hv]; HV[c[1]]=!HV[c[1]]; toast(c[0]+': '+(HV[c[1]]?'ON':'OFF'),'#ffb347',800); }
  hvSync(); }); }
function hvSync(){ document.querySelectorAll('#sbMenu [data-hv]').forEach(b=>{ if(b.dataset.hv!=='all') b.classList.toggle('on',!!HV[HVS[+b.dataset.hv][1]]); }); }
{ const oS=sbStart; sbStart=function(){ oS(); hvUI(); hvSync(); }; }
{ const oS=sbSync; sbSync=function(){ oS(); hvUI(); hvSync(); }; }
