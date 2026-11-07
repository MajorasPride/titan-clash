/* =====================================================================
   SANDBOX TEST 6: BRAWLER = BOXER (Little Mac style) + LEG SWEEP (Nov 6, 2026)
   MajorasPride said yes to all three: a leg sweep, Little Mac style boxing, both together.
   - Faster, snappier jabs.
   - LEG SWEEP: L L M or M M. Low spinning kick that trips the rival (sets up the Geyser Uppercut).
   - WEAVE: tap BLOCK = duck / slip (can't be hit for a moment). Keep holding = normal block
     (only with the shield in hand). Slipping a real hit fills the KO meter.
   - KO PUNCH: the KO meter fills as you land hits (and slip hits), drops when you get hit.
     Full = your next HEAVY is a huge Star Punch (breaks a block) instead of the shield throw.
   - Weak in the air: lower jump, no air jabs (Shield Dive still works).
   ===================================================================== */
const KO={hit:12,slip:20,lose:25};
Object.assign(MOVES.bjab,{dur:.24,hitAt:.1});
Object.assign(MOVES,{
 bsweep:{name:'Leg Sweep (trips)',dur:.6,hitAt:.32,moveMul:.1,anim:'bsweep',holdP:.25},
 bweave:{name:'Weave',dur:.32,moveMul:0,anim:'bweave',noCharge:1},
 starpunch:{name:'KO Punch',dur:1.0,hitAt:.55,moveMul:0,anim:'bstar',noCharge:1},
});
STRINGS['valor:1']={ L:{id:'bjab',c:0}, LL:{id:'bjab',c:1}, LLL:{id:'bjab',c:2,end:1},
 LLM:{id:'bsweep',end:1}, LM:{id:'thook'}, M:{id:'thook'}, MM:{id:'bsweep',end:1} };
{ const S=V8DEFS.find(d=>d.id==='valor').stances[1]; S.jump=20; }   // weak in the air: lower jump
LIGHT.push('bjab');

POSES.bsweep=(k,p,e)=>{ const w=ez(ph(p,0,.3)), s=ez(ph(p,.3,.7));
 k.knL=k.knR=1.2*w; k.legL=k.legR=-.7*w; k.lean=.35*w; k.twist=lerp(0,-Math.PI*2,s); k.legR=lerp(-.7*w,-1.5,Math.sin(s*Math.PI)); k.knR=lerp(1.2*w,.1,Math.sin(s*Math.PI));
 k.armL=-.6; k.elL=-1.2; k.armR=-.3; k.elR=-.6; };
POSES.bweave=(k,p)=>{ const u=Math.sin(Math.min(1,p)*Math.PI); k.knL=k.knR=1.1*u; k.legL=k.legR=-.6*u; k.lean=.5*u; k.twist=.4*u; k.armL=-1.4; k.elL=-1.6; k.azL=.3; k.armR=-1.2; k.elR=-1.7; k.headX=.3*u; };
POSES.bstar=(k,p)=>{ const w=ez(ph(p,0,.5)), s=ez(ph(p,.5,.65));
 k.armR=lerp(lerp(-.5,.6,w),-1.65,s); k.elR=lerp(lerp(-1.5,-1.9,w),-.05,s); k.azR=lerp(.1,.2,s); k.twist=lerp(lerp(0,1.2,w),-.9,s);
 k.lean=lerp(lerp(0,-.2,w),.55,s); k.knL=k.knR=.6*w*(1-s); k.legL=-.8*s; k.knR=.5*s; k.armL=-1.3; k.elL=-1.5; k.azL=.45; k.headX=.2*w; };

Object.assign(V8MOVE,{
 bsweep(f,a,dt,pm,o){ const p=a.t/a.dur; a.act=p>.35&&p<.65; if(once(a,'w',.3*a.dur)){ Snd.whoosh(); ring(f.pos.x,1,f.pos.z,14*f.scale,WATER,.35); burst(f.pos.clone().add(V(0,1,0)),WATER,16,14); }
  if(p>=.45&&!a._bh&&o.pos.y-(o._floor||0)<4){ if(coneHit(f,a,o,14,1.9,9*pm,10,8,'clang')){ o.stun=Math.max(o.stun,.7); dust(o.pos.x,o.pos.z,4,4); toast(o.isPlayer?'TRIPPED!':`${o.def.name} TRIPS!`,'#3fa9ff',600); } } },
 bweave(f,a,dt,pm,o){ if(once(a,'s',0)){ f.inv=Math.max(f.inv||0,.28); const I=f.inp||{}; let s=(I.mx||0)>.3?1:(I.mx||0)<-.3?-1:(Math.random()<.5?1:-1);
   const rx=Math.cos(f.yaw)*s, rz=-Math.sin(f.yaw)*s; f.kb.x+=rx*26; f.kb.z+=rz*26; Snd.whoosh(); } },
 starpunch(f,a,dt,pm,o){ if(a.t<a.hitAt){ if(Math.random()<dt*50) burst(fistAt(f,1),Math.random()<.5?0xffd43b:0xffffff,2,6); if(once(a,'c',0)){ Snd.tone('triangle',400,1400,.5,.08); toast(f.isPlayer?'KO PUNCH!':'VALOR WINDS UP A KO PUNCH!','#ffd43b',700); } return; }
  if(once(a,'go',a.hitAt)){ f.kb.x+=Math.sin(f.yaw)*55; f.kb.z+=Math.cos(f.yaw)*55; Snd.whoosh(); }
  if(!a._bh&&a.t<a.hitAt+.15&&canHit(o)){ const bl=o.blocking; o.blocking=false; const hit=coneHit(f,a,o,15,1.1,30*pm,75,18,'clang'); if(!hit) o.blocking=bl;
   if(hit){ const c=o.chest(); burst(c,0xffd43b,50,34); burst(c,0xffffff,30,26); ring(c.x,c.y,c.z,18,0xffd43b,.4); ring(c.x,c.y,c.z,10,0xffffff,.3);
    if(o.guardMax){ o.guard=0; o.guardBroken=true; o.guardHitT=game.time; } game.hitStop=Math.max(game.hitStop,.22); game.shake=Math.max(game.shake,1.3); Snd.boom(); banner(bl?'BLOCK SMASHED!':'K.O. PUNCH!',800); } } },
});

/* ---------------- KO meter ---------------- */
function koAdd(f,n){ if(!f||f.def.id!=='valor') return; const was=f.ko||0; f.ko=clamp(was+n,0,100);
 if(was<100&&f.ko>=100&&(f.isPlayer||game.vs2)) toast(isBrawl(f)?'KO PUNCH READY! (HEAVY)':'KO PUNCH READY (BRAWLER STANCE)','#ffd43b',1000); }
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  const fromF=!!(src&&src.def&&src!==HZ);
  if(fromF&&!cont&&this.atk&&this.atk.id==='bweave'&&this.inv>0){ if(!this._slipT||game.time-this._slipT>.2){ this._slipT=game.time; koAdd(this,KO.slip); burst(this.chest(),0xffffff,10,12); if(this.isPlayer||game.vs2) toast('SLIPPED!','#7dff9a',500); } return; }
  const hp0=this.hp; oTH.call(this,src,dmg,kb,launch,cont,dir); if(this.hp>=hp0||!fromF||cont) return;
  if(isBrawl(src)&&src.atk&&src.atk.id!=='starpunch') koAdd(src,KO.hit);
  if(this.def.id==='valor'&&(this.ko||0)>0) this.ko=Math.max(0,this.ko-KO.lose); }; }

/* ---------------- input: weave, KO punch, no air jabs ---------------- */
{ const oI=v8Input; v8Input=function(f,inp,dt){
  const canAct=!f.dead&&f.stun<=0&&game.state==='fight'&&f.rollT<=0&&!f.grabbedBy&&!f.held;
  if(isBrawl(f)){
   const bp=!!inp.block, edge=bp&&!f._wbp; f._wbp=bp;
   if(!f.onGround&&f.pos.y-(f._floor||0)>5){ inp.punch=0; inp.medium=0; }                          // weak in the air: no air jabs
   if(edge&&canAct&&f.onGround&&!f.atk&&game.time>(f.weaveCd||0)){ f.weaveCd=game.time+.45; f.startAtk('bweave'); }
   if(f.atk&&f.atk.id==='bweave'){ inp.block=false; f.blocking=false; }
   if((f.ko||0)>=100&&inp.heavy>0&&canAct&&f.onGround&&(!f.atk||(f.atk.landed&&f.atk.t>=(f.atk.hitAt||0)+.03))){ inp.heavy=0; f.atk=null; f.cg=null; f.buf=null; f.ko=0; f.startAtk('starpunch'); }
   if((f.ko||0)>=100&&Math.random()<dt*12) burst(fistAt(f,1),0xffd43b,1,4); }
  return oI(f,inp,dt); }; }

/* ---------------- KO meter on screen (VALOR only) ---------------- */
{ const s=document.createElement('style'); s.textContent=`#koBar{position:fixed;left:46px;top:160px;z-index:20;width:130px;pointer-events:none;font:10px/1 'Russo One',sans-serif;color:#ffd43b;letter-spacing:1px;text-shadow:0 1px 2px #000;display:none}
#koBar .t{height:7px;margin-top:3px;border-radius:4px;background:#0009;border:1px solid #ffd43b66;overflow:hidden}#koBar .t div{height:100%;width:0;background:linear-gradient(90deg,#ff9f43,#ffd43b)}
#koBar.full .t div{background:#fff;box-shadow:0 0 10px #ffd43b}#koBar.full{animation:koP .5s infinite alternate}@keyframes koP{to{color:#fff}}
#koBar{white-space:nowrap}
@media (pointer:coarse){#koBar{left:40px;top:126px;width:110px}}
@media (pointer:coarse) and (max-height:520px){#koBar{left:24px;top:178px;width:150px}}   /* v8.4.3: phone landscape, one line under the stance label, clear of the combo / Fury text */`; document.head.appendChild(s); }
function koTick(){ let b=el('koBar'); const p=game.p; if(!b){ b=document.createElement('div'); b.id='koBar'; b.innerHTML='KO PUNCH<div class="t"><div></div></div>'; document.body.appendChild(b); }
 const on=!!(p&&game.mode==='match'&&p.def.id==='valor'); b.style.display=on?'block':'none';
 if(!on){ const hv=document.querySelector('#tbtns .hv'); if(hv&&hv.textContent!=='HEAVY') hv.textContent='HEAVY'; return; }   // Nov 7 fix: KO! stayed on the heavy button after switching away from VALOR
 const k=p.ko||0; b.firstChild.textContent=k>=100?(isBrawl(p)?'KO PUNCH READY · HEAVY':'KO READY · BRAWLER'):'KO PUNCH'; b.querySelector('.t div').style.width=k+'%'; b.classList.toggle('full',k>=100);
 const hv=document.querySelector('#tbtns .hv'); if(hv) hv.textContent=k>=100&&isBrawl(p)?'KO!':'HEAVY'; }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ koTick(); }catch(e){ console.error(e); } }; }
{ const oR=sbReset; sbReset=function(){ for(const f of [game.p,game.e]) if(f){ f.ko=0; f.weaveCd=0; } oR(); }; }

/* ---------------- SUPERS READY (like MvC2 training mode): ultimate any time + KO meter always full ---------------- */
SB.ultRdy=true;
{ const oI=v8Input; v8Input=function(f,inp,dt){
  if(SB.ultRdy&&(f===game.p)&&game.state==='fight'){
   if(f.def.id==='valor'&&!SB.meterCtl) f.ko=100;   // the sandbox's METERS tool (meterCtl) handles the KO meter itself
   const canAct=!f.dead&&f.stun<=0&&f.rollT<=0&&!f.grabbedBy;
   if(inp.super>0&&canAct&&(!f.atk||f.atk.id==='stance')&&!(f.atk&&f.atk.id==='ultimate')){ inp.super=0; f.ultUsed=true; f.dropHeld&&f.dropHeld(); f.v8fly=false; f.atk=null; f.startAtk('ultimate'); v8UltStart(f); } }
  return oI(f,inp,dt); }; }
function ultUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-t=ultRdy]')) return; const row=m.querySelector('[data-t=slow]').parentNode, b=document.createElement('button'); b.dataset.t='ultRdy'; b.textContent='SUPERS READY'; row.appendChild(b); }
{ const oS=sbStart; sbStart=function(){ oS(); ultUI(); sbSync(); }; }
