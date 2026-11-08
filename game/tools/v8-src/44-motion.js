// v8.5 (Nov 8, 2026): moved from the sandbox into the game (MajorasPride: put everything we did in the game; the sandbox keeps on/off switches to compare).
/* =====================================================================
   SANDBOX 17 (Nov 8, 2026): FLUID MOTION (the Soul Calibur way).
   MajorasPride: "they look so stiff all the time" ... "we need better hand made animations" ...
   "figure out how Soul Calibur does it" ... "fighting games are all about being fluid".
   What was wrong (found in Fighter.animate):
   1. Every joint slid straight to its target at one speed (no weight, no overshoot, no follow-through),
      and every joint arrived at the same moment, so the whole body moved like one stiff block.
   2. Every move went in a straight line to the hit pose and straight back: no wind-up, no snap,
      no hold on impact. Soul Calibur moves have 5 steps: start pose, wind-up, strike, recovery, end pose.
   3. Standing still = frozen (only a tiny chest bob). Soul Calibur fighters are never frozen: knees bent,
      weight shifting, breathing.
   4. Walking moved only the legs: no hip sway, no shoulder counter-twist, no lean into the run.
   5. Getting hit only tilted the whole titan (41-combo-feel), the body itself never reacted.
   What this file does (for every titan, every move, without changing any move's timing or damage):
   1. SPRINGS: each joint is a spring with its own speed. Hips and legs lead, the chest follows, arms
      lag a beat, elbows and head lag more and swing past the target a little, then settle (overlap).
   2. FIVE STEPS: each move's pose is retimed (look only, the hit still lands at the same moment):
      slow into the wind-up, hold it a hair, SNAP to the hit pose, hold the impact, ease out.
      During the snap the joints get extra stiff so the strike is sharp.
   3. LIVING STANCE: bent knees, breathing, weight shifting, a slight guard sway. Fades out as you move.
   4. WALK: hips roll, shoulders twist against the legs, lean into the run and into turns, tails and
      necks drag behind turns.
   5. HIT REACTIONS: a landed hit kicks the springs (chest snaps back, head whips, arms fling), and
      the springs carry the recoil back to the stance on their own. Heavy hits kick harder.
   Cutscenes and ultimates keep their hand-directed poses (no retiming there).
   ⚙ menu → MOTION: NEW / OLD to compare. Never saved; the game isn't affected.
   ===================================================================== */
const MOT={on:true,
 // [part, axis, speed (higher = snappier), bounce (lower = more overshoot)]
 J:[['legL','x',24,.85],['legR','x',24,.85],['knL','x',24,.85],['knR','x',24,.85],
    ['torso','y',19,.62],['torso','x',19,.66],
    ['armL','x',15,.5],['armR','x',15,.5],['armL','z',15,.55],['armR','z',15,.55],
    ['elL','x',12,.44],['elR','x',12,.44],['head','x',11,.48],['jaw','x',17,.6]]};
// the five steps: retime the pose (not the hit). p = 0..1 through the move, pk = the hit moment.
function motWarp(p,pk){
 if(p<pk){ const u=p/pk; return pk*(u<.72?.82*ez(u/.72):.82+.18*Math.pow((u-.72)/.28,.55)); }   // ease into the wind-up, then snap
 const u=(p-pk)/(1-pk), h=.14; return pk+(1-pk)*(u<h?0:1-Math.pow(1-(u-h)/(1-h),2)); }              // hold the impact, ease out
function motWarpable(a){ return a&&MOVES[a.id]&&a.id!=='ultimate'&&a.id!=='super'&&a.on==null&&a.landT==null&&!(typeof CINE!=='undefined'&&CINE.on)&&a.dur>0; }
function motPk(a){ return clamp(a.hitAt?a.hitAt/a.dur:.3,.08,.9); }
{ const oA=FP.animate; FP.animate=function(dt){
  const P=this.P;
  if(!MOT.on||!P||!(dt>0)||(typeof CINE!=='undefined'&&CINE.on)){ if(this._mot) this._mot=null; return oA.call(this,dt); }
  const J=MOT.J, M=this._mot||(this._mot={x:J.map(([n,ax])=>P[n]?P[n].rotation[ax]:0),v:J.map(()=>0),add:J.map(()=>0),seed:Math.random()*6.28,yaw:this.yaw,yr:0,roll:0});
  const x0=J.map(([n,ax])=>P[n]?P[n].rotation[ax]:0);
  // 2. five steps: animate() reads a.t, so hand it the retimed time and put the real one back
  const a=this.atk; let tReal=null, snap=1;
  if(motWarpable(a)){ tReal=a.t; const p=clamp(a.t/a.dur,0,1), pk=motPk(a); a.t=motWarp(p,pk)*a.dur; if(p>pk*.72&&p<pk+(1-pk)*.1) snap=2.3; }
  oA.call(this,dt);
  if(tReal!=null) a.t=tReal;
  // 1. springs: work out where animate() wanted each joint, then spring toward it
  const r=1-Math.exp(-18*dt), n=dt>.02?2:1, h=dt/n;
  for(let i=0;i<J.length;i++){ const [pn,ax,w0,z]=J[i], o=P[pn]; if(!o) continue;
   const tgt=x0[i]+(o.rotation[ax]-x0[i])/r, w=w0*(snap>1&&pn!=='head'?snap:1);
   for(let s=0;s<n;s++){ M.v[i]+=(w*w*(tgt-M.x[i])-2*z*w*M.v[i])*h; M.x[i]+=M.v[i]*h; } }
  // 3 + 4. living stance and walk, added on top
  const T=game.time+M.seed, m=clamp(this.moveAmt||0,0,1), idle=(1-m)*(a?.25:1)*(this.dead?0:1), ground=this.onGround!==false&&!this.flying;
  const yr=angDiff(this.yaw,M.yaw)/dt; M.yaw=this.yaw; M.yr+=(clamp(yr,-6,6)-M.yr)*(1-Math.exp(-8*dt));
  const br=Math.sin(T*1.9), sh=Math.sin(T*.85), ph=this.phase||0, ws=Math.sin(ph), kj=this.kaiju;
  const add={};
  add['torso.x']=br*.025*idle+(kj?.05:.1)*m*(a?.4:1);                              // breathe; lean into the run
  add['torso.y']=sh*.06*idle-ws*.14*m*(a?.3:1);                                     // weight shift; shoulders twist against the legs
  add['armL.x']=Math.sin(T*1.9+.6)*.05*idle; add['armR.x']=Math.sin(T*1.9+.9)*.05*idle;
  add['armL.z']=-sh*.04*idle; add['armR.z']=-sh*.04*idle;
  add['elL.x']=-.12*idle; add['elR.x']=-.12*idle;                                   // a loose guard instead of straight arms
  add['head.x']=Math.sin(T*1.9+1.3)*.03*idle;
  if(ground&&!kj){ add['knL.x']=(.16+br*.02)*idle; add['knR.x']=(.16+br*.02)*idle; add['legL.x']=-.1*idle; add['legR.x']=-.07*idle; }   // bent knees, fighting stance
  for(let i=0;i<J.length;i++){ const [pn,ax]=J[i], o=P[pn]; if(!o) continue; M.add[i]=add[pn+'.'+ax]||0; o.rotation[ax]=M.x[i]+M.add[i]; }
  // walk roll + lean into turns (torso z isn't used by animate)
  const roll=Math.sin(ph)*.07*m+clamp(-M.yr*.05,-.18,.18)*(.4+m)+sh*.02*idle; M.roll+=(roll-M.roll)*(1-Math.exp(-10*dt));
  if(P.torso) P.torso.rotation.z=M.roll;
  if(P.tail) P.tail.forEach((g,i)=>{ g.rotation.y+=clamp(-M.yr*.06*(i+1)/P.tail.length,-.35,.35); });          // tail drags behind turns
  if(P.neck) P.neck.forEach((g,i)=>{ g.rotation.z+=clamp(M.yr*.03,-.15,.15); });
 }; }
// 5. hit reactions: kick the springs
function motKick(f,str,dir){ const M=f._mot; if(!M) return; const J=MOT.J, idx=(pn,ax)=>J.findIndex(j=>j[0]===pn&&j[1]===ax);
 const side=Math.sin((dir||0)), back=Math.cos((dir||0)), k=str;
 const add=(pn,ax,v)=>{ const i=idx(pn,ax); if(i>=0) M.v[i]+=v; };
 add('torso','x',-7*k*back); add('torso','y',6*k*side); add('head','x',-11*k*back);
 add('armL','x',(4+Math.random()*4)*k); add('armR','x',(4+Math.random()*4)*k); add('armL','z',-5*k); add('armR','z',5*k);
 add('elL','x',-6*k); add('elR','x',-6*k); add('knL','x',4*k); add('knR','x',4*k); }
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){ const hp0=this.hp; const r=oTH.call(this,src,dmg,kb,launch,cont,dir);
  if(MOT.on&&!cont&&this.hp<hp0&&src&&src!==HZ){ const c=src.atk?feelClass(src):'medium', str={light:.7,medium:1,heavy:1.5}[c]||1;
   const d=Math.atan2((dir&&dir.x)||(this.pos.x-src.pos.x)||0,(dir&&dir.z)||(this.pos.z-src.pos.z)||1)-this.yaw; motKick(this,str*(this.kaiju?.7:1),d); }
  return r; }; }
// ⚙ menu: MOTION NEW / OLD
function motUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-mot]')) return;
 const box=m.querySelector('.box'), kit=el('sbKit'), d=document.createElement('div'); d.className='sec';
 d.innerHTML=`<div class="lbl">MOTION (compare the new fluid motion with the old)</div><div class="row"><button data-mot="1">NEW</button><button data-mot="0">OLD</button></div>`;
 box.insertBefore(d,kit.closest('.sec'));
 d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation(); MOT.on=b.dataset.mot==='1';
  for(const f of [game.p,game.e]) if(f){ f._mot=null; if(f.P&&f.P.torso) f.P.torso.rotation.z=0; } motSync(); toast('MOTION: '+(MOT.on?'NEW':'OLD'),'#7fd4ff',700); }); }
function motSync(){ document.querySelectorAll('#sbMenu [data-mot]').forEach(b=>b.classList.toggle('on',(b.dataset.mot==='1')===MOT.on)); }
{ const oS=sbStart; sbStart=function(){ oS(); motUI(); motSync(); }; }
{ const oS=sbSync; sbSync=function(){ oS(); motSync(); }; }
