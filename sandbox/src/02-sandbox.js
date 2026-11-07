/* =====================================================================
   SANDBOX: a bare training ground. VALOR vs an INFERNOTH dummy on empty ground.
   No buildings, cars, people, disasters, news or timer. Nothing here changes the real game:
   settings it turns off are never saved.
   ===================================================================== */
const SBORIG={life:SET.life,disasters:SET.disasters};
{ const oSave=save; save=function(k,v){ if(k==='tc_set') v=Object.assign({},v,SBORIG); return oSave(k,v); }; }
SET.life=false; SET.disasters=false;

/* v8.3: the 1 / 2 / 3 keys, the hooks (sbStart, sbSync, sbReset ...) and keyName now live in the game
   (game/tools/v8-src/11-skill-keys.js). This file fills in sbBase with the test-menu versions. */

/* empty ground: build the city like normal (so everything is reset properly), then take it all away */
{ const oMC=makeCity; makeCity=function(){ oMC();
  if(!SB.city){ for(const b of city){ scene.remove(b.mesh); if(b.crk) scene.remove(b.crk); } city.length=0; }
  if(typeof decor!=='undefined') decor.visible=!!SB.city;
  if(!SB.pop){ for(const pr of props){ pr.state='gone'; if(pr.obj){ pr.obj.visible=false; } } for(const p of people){ p.gone=true; p.respawn=null; } }
  if(SB.grid){ SB.grid.visible=SB.ring.visible=!SB.city; }
  if(!SB.grid&&!SB.city){ SB.grid=new THREE.GridHelper(400,40,0x7fd4ff,0x24364a); SB.grid.position.y=.06; SB.grid.material.transparent=true; SB.grid.material.opacity=.55; scene.add(SB.grid);
   const ring2=new THREE.Mesh(new THREE.RingGeometry(59,60,64),new THREE.MeshBasicMaterial({color:0x7fd4ff,transparent:true,opacity:.5,side:THREE.DoubleSide})); ring2.rotation.x=-Math.PI/2; ring2.position.y=.08; scene.add(ring2); SB.ring=ring2; } }; }
{ const oSR=startRound; startRound=function(){ oSR(); game.timer=Infinity; if(typeof heli!=='undefined') heli.at=1e9; game.heliDone=true; game.hzT=1e9; game.dropT=1e9; game.coreT=1e9; }; }

/* the dummy: STAND (does nothing), BLOCK (holds block), FIGHT (normal CPU) */
{ const oU=AI.prototype.update; AI.prototype.update=function(dt){ if(this.f===game.e&&SB.dummy!=='fight'){ const I=this.inp; for(const k of BUFF) I[k]=0; I.mx=I.mz=0; I.block=SB.dummy==='block'; I.lock=true;
   const o=game.p; if(o) this.f.yaw+=angDiff(Math.atan2(o.pos.x-this.f.pos.x,o.pos.z-this.f.pos.z),this.f.yaw)*Math.min(1,dt*3); return; } return oU.call(this,dt); }; }

/* refilling health + damage counter */
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  if(SB.infHp&&this.hp<this.def.hp*.25) this.hp=this.def.hp;
  const hp0=this.hp; oTH.call(this,src,dmg,kb,launch,cont,dir); const lost=hp0-this.hp;
  if(this===game.e&&src===game.p&&lost>0){ const C=SB.combo; if(game.time-C.t>1.6){ C.n=0; C.dmg=0; } C.n++; C.dmg+=lost; C.t=game.time;
   const mv=src.atk?MOVES[src.atk.id]:null; SB.last={name:mv?mv.name:(V8.proj?'Shot':'Hit'),dmg:lost}; if(!cont||lost>=1) dmgNum(this,lost,cont); } }; }
function dmgNum(f,n,cont){ const d=document.createElement('div'); d.className='sbnum'+(cont?' small':''); d.textContent=Math.round(n); document.body.appendChild(d);
 const p=f.chest().add(V(rand(-2,2),4,rand(-2,2))); let t=0; const tick=()=>{ t+=.016; const q=p.clone().add(V(0,t*8,0)).project(camera); d.style.left=((q.x+1)/2*innerWidth)+'px'; d.style.top=((1-q.y)/2*innerHeight)+'px'; d.style.opacity=Math.max(0,1-t*1.4);
  if(t<.75&&q.z<1) requestAnimationFrame(tick); else d.remove(); }; tick(); }

/* ---------------- panel: one ⚙ SANDBOX button, everything else in a settings menu ---------------- */
const SBCSS=`#sbGear{position:fixed;left:10px;top:70px;z-index:20;background:#0e1621dd;border:2px solid #7fd4ff99;color:#cfe3f5;border-radius:14px;padding:6px 12px;font-family:'Russo One',sans-serif;font-size:12px;letter-spacing:2px;cursor:pointer;pointer-events:auto}
#sbMenu{position:fixed;inset:0;z-index:40;background:#02050acc;display:flex;align-items:center;justify-content:center;pointer-events:auto}
#sbMenu.hide{display:none}
#sbMenu .box{background:#08111c;border:2px solid #7fd4ff66;border-radius:16px;padding:14px 16px;width:min(560px,94vw);max-height:92vh;overflow:auto;font-family:'Russo One',sans-serif;color:#cfe3f5;box-shadow:0 0 24px #7fd4ff33}
#sbMenu h3{margin:0 0 8px;font-size:15px;letter-spacing:3px;color:#7fd4ff;display:flex;justify-content:space-between;align-items:center}
#sbMenu .sec{margin:8px 0}#sbMenu .lbl{font-size:10px;letter-spacing:2px;color:#9fb3c8;margin-bottom:4px}
#sbMenu .row{display:flex;gap:6px;flex-wrap:wrap}
#sbMenu button{background:#0e1621;border:2px solid #ffffff33;color:#cfe3f5;border-radius:12px;padding:7px 12px;font-family:inherit;font-size:11px;letter-spacing:1px;cursor:pointer}
#sbMenu button.on{border-color:#7fd4ff;color:#fff;background:#163654;box-shadow:0 0 8px #7fd4ff88}
#sbMenu button.big{border-color:#7fd4ff99}
#sbKit{font:12px/1.5 Rajdhani,sans-serif;color:#cfe3f5;background:#05080d;border:1px solid #ffffff22;border-radius:10px;padding:8px 10px}
#sbKit h4{margin:0 0 4px;font-family:'Russo One';font-size:12px;letter-spacing:2px;color:#7fd4ff}#sbKit .k{display:inline-block;min-width:16px;padding:0 4px;border:1px solid #ffffff55;border-radius:4px;color:#fff;font-family:'Russo One';font-size:10px;text-align:center;margin-right:4px}
#sbKit .cd{color:#ff9f43}#sbKit .ok{color:#7dff9a}
#sbInfo{position:fixed;right:10px;top:70px;z-index:20;background:#05080dcc;border:1px solid #ffffff22;border-radius:10px;padding:4px 10px;font:12px/1.4 Rajdhani,sans-serif;color:#cfe3f5;pointer-events:none;text-align:right}
#sbInfo b{color:#fff;font-family:'Russo One';font-size:10px;letter-spacing:1px}#sbInfo .big{font-family:'Russo One';font-size:18px;color:#ffd43b}#sbInfo.hide{display:none}
.sbnum{position:fixed;z-index:19;pointer-events:none;font-family:'Russo One';font-size:22px;color:#ffd43b;text-shadow:0 2px 0 #000,0 0 8px #000;transform:translate(-50%,-50%)}.sbnum.small{font-size:12px;color:#ff9f43}
#moves,#moves2,#news,#pipBox,#dis,#dmg{display:none!important}
#tbtns .sk{width:44px!important;height:44px!important;font-size:15px!important;background:#163654dd!important;border-color:#7fd4ff99!important}
#tbtns .sk1{right:150px;bottom:150px}#tbtns .sk2{right:200px;bottom:120px}#tbtns .sk3{right:140px;bottom:200px}
#tbtns .sk .c{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#ff9f43;background:#000a;border-radius:50%}
@media (pointer:coarse) and (max-height:520px){ #sbGear{top:58px;padding:4px 10px;font-size:11px} #sbInfo{top:58px;font-size:11px} #sbInfo .big{font-size:15px} #sbMenu .box{padding:10px 12px} #sbMenu button{padding:6px 10px;font-size:10px} }`;
{ const s=document.createElement('style'); s.textContent=SBCSS; document.head.appendChild(s); }
SB.showDmg=true;
function sbBase_menuOpen(on){ const m=el('sbMenu'); if(!m) return; m.classList.toggle('hide',!on); SB.menu=on; if(game.mode==='match'&&game.state!=='over') game.paused=on; if(on) sbSync(); }
function sbBase_sync(){ const m=el('sbMenu'); if(!m) return;
 m.querySelector('[data-a=me]').textContent='YOU: '+getDef(SB.me).name; m.querySelector('[data-a=opp]').textContent='DUMMY: '+getDef(SB.opp).name;
 m.querySelectorAll('[data-d]').forEach(b=>b.classList.toggle('on',b.dataset.d===SB.dummy));
 m.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('on',!!SB[b.dataset.t]));
 const i=el('sbInfo'); if(i) i.classList.toggle('hide',!SB.showDmg);
 sbKitRender(); }
function sbUI(){ if(el('sbGear')) return;
 const g=document.createElement('button'); g.id='sbGear'; g.textContent='⚙ SANDBOX'; document.body.appendChild(g);
 g.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); sbMenuOpen(true); });
 const m=document.createElement('div'); m.id='sbMenu'; m.className='hide'; m.innerHTML=`<div class="box">
  <h3>SANDBOX SETTINGS <button class="big" data-a="close">✕ CLOSE</button></h3>
  <div class="sec"><div class="lbl">TITANS (tap to switch)</div><div class="row"><button data-a="me">YOU</button><button data-a="opp">DUMMY</button></div></div>
  <div class="sec"><div class="lbl">THE DUMMY</div><div class="row"><button data-d="stand">STAND</button><button data-d="block">BLOCK</button><button data-d="fight">FIGHT BACK</button></div></div>
  <div class="sec"><div class="lbl">TEST TOOLS</div><div class="row"><button data-t="slow">SLOW-MO</button><button data-t="infEn">∞ ENERGY</button><button data-t="infHp">∞ HEALTH</button><button data-t="showDmg">DAMAGE NUMBERS</button></div></div>
  <div class="sec"><div class="lbl">MOVES</div><div id="sbKit"></div></div>
  <div class="sec"><div class="row"><button class="big" data-a="reset">↺ RESET FIGHT</button><button class="big" data-a="close">✕ CLOSE</button></div></div>
 </div>`;
 document.body.appendChild(m);
 const info=document.createElement('div'); info.id='sbInfo'; document.body.appendChild(info);
 m.addEventListener('pointerdown',e=>{ if(e.target===m){ e.preventDefault(); sbMenuOpen(false); return; } const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation();
  if(b.dataset.d) SB.dummy=b.dataset.d;
  if(b.dataset.t) SB[b.dataset.t]=!SB[b.dataset.t];
  if(b.dataset.a==='me'||b.dataset.a==='opp'){ const L=b.dataset.a==='me'?SB_PLAY:SB_DUMMIES, k=b.dataset.a==='me'?'me':'opp'; SB[k]=L[(L.indexOf(SB[k])+1)%L.length]; sbStart(); sbMenuOpen(true); return; }
  if(b.dataset.a==='reset'){ sbMenuOpen(false); sbReset(); return; }
  if(b.dataset.a==='close'){ sbMenuOpen(false); return; }
  sbSync(); });
 addEventListener('keydown',e=>{ if(e.code==='Tab'){ e.preventDefault(); sbMenuOpen(!SB.menu); } else if(e.code==='Escape'&&SB.menu){ e.preventDefault(); e.stopImmediatePropagation(); sbMenuOpen(false); } },true);
 // phone: 1 / 2 / 3 buttons
 const tb=el('tbtns'); if(tb) for(const n of [1,2,3]){ const bt=document.createElement('button'); bt.className='sk sk'+n; bt.dataset.k='sk'+n; bt.innerHTML=n+'<span class="c" style="display:none"></span>'; tb.appendChild(bt);
  bt.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); bt.classList.add('on'); inps[0]['sk'+n]=.25; if(navigator.vibrate) try{ navigator.vibrate(12); }catch(_){} });
  const rel=()=>bt.classList.remove('on'); bt.addEventListener('pointerup',rel); bt.addEventListener('pointercancel',rel); }
}
function sbBase_reset(){ if(SB._round) return; const p=game.p,e=game.e; if(!p) return; p.reset(0,-30,0); e.reset(0,30,Math.PI); p.energy=e.energy=100; for(const f of [p,e]){ f.cds={}; f.stun=0; f.hp=f.def.hp; } SB.combo={n:0,dmg:0,t:0}; SB.last=null; for(const c of cams){ c.init=false; } toast('RESET','#7fd4ff',600); }
function sbBase_kit(){ const p=game.p, kit=el('sbKit'); if(!p||!kit) return; const L=SKILLS[p.def.id]||[], F=p.F, nm=id=>MOVES[id]?MOVES[id].name:id, H=HEAVYSET[F.K];
 const cdTxt=n=>{ const c=p.cds['sk'+n]||0; return c>0?`<span class="cd">${Math.ceil(c)}s</span>`:'<span class="ok">READY</span>'; };
 kit.innerHTML=`<h4>${p.def.name} · ${F.name} · ⚡${Math.round(p.energy)}</h4>
  <div><span class="k">${keyName('punch')}</span>Light: ${nm(F.J)} (×3 combo)</div>
  <div><span class="k">${keyName('heavy')}</span>tap Medium: ${nm(F.M)}</div>
  <div><span class="k">${keyName('heavy')}</span>hold Heavy: ${H?`standing = ${nm(H[0])} · moving = ${nm(H[1])}`:nm(F.K)}</div>
  ${F.air?`<div><span class="k">${keyName('jump')}</span>+ <span class="k">${keyName('heavy')}</span>in the air: ${nm(F.air)}</div>`:''}
  <div><span class="k">${keyName('special')}</span>Special: ${nm(F.L)}</div>
  ${L.map((S,i)=>`<div><span class="k">${keyName('sk'+(i+1))}</span>${MOVES[S.id].name} · ${S.cd}s · ⚡${S.cost} ${cdTxt(i+1)}</div>`).join('')}
  ${p.def.stances.length>1?`<div><span class="k">${keyName('transform')}</span>Stance: ${p.def.stances[((p.stIdx||0)+1)%p.def.stances.length].name}</div>`:''}
  <div style="margin-top:4px;color:#9fb3c8">Chains: Light → Medium → Heavy → Special or 1/2/3 when a hit lands. PC: Tab opens this menu.</div>`; }
function sbTick(dt){ const p=game.p; if(!p||game.mode!=='match') return; if(game.state==='fight'||game.state==='intro'){ game.timer=Infinity; }
 if(SB.slow&&game.state==='fight') game.timeScale=.3; else if(!SB.slow&&game.timeScale===.3) game.timeScale=1;
 if(SB.infEn){ p.energy=100; } if(SB.infHp){ for(const f of [p,game.e]) if(f.hp<f.def.hp*.25&&!f.dead) f.hp=f.def.hp; }
 const C=SB.combo, cdTxt=n=>{ const c=p.cds['sk'+n]||0; return c>0?`<span class="cd">${Math.ceil(c)}s</span>`:'<span class="ok">READY</span>'; };
 const info=el('sbInfo'); if(info&&SB.showDmg){ const live=C.n&&game.time-C.t<1.6; info.innerHTML=`<b>DAMAGE</b> <span class="big">${live?Math.round(C.dmg):0}</span>${live?' · '+C.n+' hits':''}${SB.last?`<br>${SB.last.name} <b>${Math.round(SB.last.dmg)}</b>`:''}`; }
 if(SB.menu) sbKitRender();
 document.querySelectorAll('#tbtns .sk').forEach((b,i)=>{ const c=p.cds['sk'+(i+1)]||0, s=b.querySelector('.c'); s.style.display=c>0?'flex':'none'; if(c>0) s.textContent=Math.ceil(c); });
}
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ sbTick(dt); }catch(e){ console.error(e); } }; }

/* start straight into the training ground */
const SB_PLAY=['valor','voidmaw'], SB_DUMMIES=['infernoth','voidmaw','valor']; SB.me='valor'; SB.opp='infernoth';
function sbBase_start(){ selId=SB.me; oppId=SB.opp; vsMode='cpu'; mapSel='city'; try{ diff='normal'; }catch(e){} sbUI(); startMatch(); el('p2n').textContent=getDef(SB.opp).name+' (DUMMY)'; sbSync(); }
Object.assign(sbBase,{start:sbBase_start,sync:sbBase_sync,menuOpen:sbBase_menuOpen,kit:sbBase_kit,reset:sbBase_reset});
// sandbox test defaults (the game sets these to normal play in game/tools/v8-src/30-game-settings.js)
Object.assign(SB,{dummy:'stand',infHp:true,ultRdy:true,ultCam:'random'});
if(document.readyState==='complete') setTimeout(sbStart,300); else addEventListener('load',()=>setTimeout(sbStart,300));
document.title='Titan Clash · SANDBOX';
