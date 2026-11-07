/* =====================================================================
   SANDBOX: a bare training ground. VALOR vs an INFERNOTH dummy on empty ground.
   No buildings, cars, people, disasters, news or timer. Nothing here changes the real game:
   settings it turns off are never saved.
   ===================================================================== */
const SBORIG={life:SET.life,disasters:SET.disasters};
{ const oSave=save; save=function(k,v){ if(k==='tc_set') v=Object.assign({},v,SBORIG); return oSave(k,v); }; }
SET.life=false; SET.disasters=false;

/* keys for 1 / 2 / 3 (solo: 1 2 3 · 2-player P1: 1 2 3 · P2: 8 9 0) */
BUFF.push('sk1','sk2','sk3');
ACTIONS.splice(ACTIONS.findIndex(a=>a[0]==='super')+1,0,['sk1','Skill 1'],['sk2','Skill 2'],['sk3','Skill 3']);
Object.assign(DEF_SETS.solo,{sk1:['Digit1',''],sk2:['Digit2',''],sk3:['Digit3','']}); Object.assign(DEF_SETS.p1,{sk1:['Digit1',''],sk2:['Digit2',''],sk3:['Digit3','']}); Object.assign(DEF_SETS.p2,{sk1:['Digit8',''],sk2:['Digit9',''],sk3:['Digit0','']});
for(const st in BS) for(const k of ['sk1','sk2','sk3']) if(!BS[st][k]) BS[st][k]=DEF_SETS[st][k].slice();
rebuildCodeMap(); for(const I of inps) I.sk1=I.sk2=I.sk3=0;

/* empty ground: build the city like normal (so everything is reset properly), then take it all away */
{ const oMC=makeCity; makeCity=function(){ oMC();
  for(const b of city){ scene.remove(b.mesh); if(b.crk) scene.remove(b.crk); }
  city.length=0; for(const pr of props){ pr.state='gone'; if(pr.obj){ pr.obj.visible=false; } }
  for(const p of people){ p.gone=true; p.respawn=null; }
  if(typeof decor!=='undefined') decor.visible=false;
  if(!SB.grid){ SB.grid=new THREE.GridHelper(400,40,0x7fd4ff,0x24364a); SB.grid.position.y=.06; SB.grid.material.transparent=true; SB.grid.material.opacity=.55; scene.add(SB.grid);
   const ring2=new THREE.Mesh(new THREE.RingGeometry(59,60,64),new THREE.MeshBasicMaterial({color:0x7fd4ff,transparent:true,opacity:.5,side:THREE.DoubleSide})); ring2.rotation.x=-Math.PI/2; ring2.position.y=.08; scene.add(ring2); } }; }
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

/* ---------------- panel ---------------- */
const SBCSS=`#sb{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:20;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;font-family:'Russo One',sans-serif;pointer-events:auto}
#sb button{background:#0e1621dd;border:2px solid #ffffff33;color:#cfe3f5;border-radius:14px;padding:5px 10px;font-family:inherit;font-size:11px;letter-spacing:1px;cursor:pointer}
#sb button.on{border-color:#7fd4ff;color:#fff;background:#163654ee;box-shadow:0 0 8px #7fd4ff88}
#sb .tag{background:#7fd4ff;color:#04121f;border-radius:14px;padding:5px 10px;font-size:11px;letter-spacing:2px}
#sbInfo{position:fixed;right:10px;top:178px;z-index:20;background:#05080dcc;border:1px solid #ffffff22;border-radius:10px;padding:8px 10px;font:12px/1.5 Rajdhani,sans-serif;color:#cfe3f5;min-width:170px;pointer-events:none}
#sbInfo b{color:#fff;font-family:'Russo One';font-size:11px;letter-spacing:1px}#sbInfo .big{font-family:'Russo One';font-size:20px;color:#ffd43b}
#sbKit{position:fixed;left:10px;bottom:10px;z-index:20;background:#05080ddd;border:1px solid #ffffff22;border-radius:10px;padding:8px 10px;font:12px/1.45 Rajdhani,sans-serif;color:#cfe3f5;max-width:330px;pointer-events:none}
#sbKit h4{margin:0 0 4px;font-family:'Russo One';font-size:12px;letter-spacing:2px;color:#7fd4ff}#sbKit .k{display:inline-block;min-width:16px;padding:0 4px;border:1px solid #ffffff55;border-radius:4px;color:#fff;font-family:'Russo One';font-size:10px;text-align:center;margin-right:4px}
#sbKit .cd{color:#ff9f43}#sbKit .ok{color:#7dff9a}#sbKit.hide{display:none}
.sbnum{position:fixed;z-index:19;pointer-events:none;font-family:'Russo One';font-size:22px;color:#ffd43b;text-shadow:0 2px 0 #000,0 0 8px #000;transform:translate(-50%,-50%)}.sbnum.small{font-size:12px;color:#ff9f43}
#moves,#moves2,#news,#pipBox,#dis,#dmg{display:none!important}
#tbtns .sk{width:44px!important;height:44px!important;font-size:15px!important;background:#163654dd!important;border-color:#7fd4ff99!important}
#tbtns .sk1{right:150px;bottom:150px}#tbtns .sk2{right:200px;bottom:120px}#tbtns .sk3{right:140px;bottom:200px}
#tbtns .sk .c{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#ff9f43;background:#000a;border-radius:50%}
@media (pointer:coarse) and (max-height:520px){ #sbKit{display:none} #sbInfo{top:auto;bottom:8px;right:auto;left:50%;transform:translateX(-50%);min-width:0;font-size:11px;padding:4px 8px} #sb{top:auto;bottom:auto;top:62px} #sb button{padding:3px 7px;font-size:9px} }`;
{ const s=document.createElement('style'); s.textContent=SBCSS; document.head.appendChild(s); }
function sbUI(){ if(el('sb')) return;
 const bar=document.createElement('div'); bar.id='sb'; bar.innerHTML=`<span class="tag">SANDBOX</span>
  <button data-d="stand">DUMMY: STAND</button><button data-d="block">BLOCK</button><button data-d="fight">FIGHT BACK</button>
  <button data-t="slow">SLOW-MO</button><button data-t="infEn">∞ ENERGY</button><button data-t="infHp">∞ HEALTH</button><button data-a="reset">RESET</button><button data-a="kit">MOVES</button>`;
 document.body.appendChild(bar);
 const info=document.createElement('div'); info.id='sbInfo'; document.body.appendChild(info);
 const kit=document.createElement('div'); kit.id='sbKit'; document.body.appendChild(kit);
 const sync=()=>{ bar.querySelectorAll('[data-d]').forEach(b=>b.classList.toggle('on',b.dataset.d===SB.dummy)); bar.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('on',!!SB[b.dataset.t])); };
 bar.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation();
  if(b.dataset.d){ SB.dummy=b.dataset.d; toast('DUMMY: '+b.textContent.replace('DUMMY: ',''),'#7fd4ff',700); }
  if(b.dataset.t){ SB[b.dataset.t]=!SB[b.dataset.t]; }
  if(b.dataset.a==='reset') sbReset(); if(b.dataset.a==='kit') kit.classList.toggle('hide'); 
  sync(); });
 sync();
 // phone: 1 / 2 / 3 buttons
 const tb=el('tbtns'); if(tb) for(const n of [1,2,3]){ const bt=document.createElement('button'); bt.className='sk sk'+n; bt.dataset.k='sk'+n; bt.innerHTML=n+'<span class="c" style="display:none"></span>'; tb.appendChild(bt);
  bt.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); bt.classList.add('on'); inps[0]['sk'+n]=.25; if(navigator.vibrate) try{ navigator.vibrate(12); }catch(_){} });
  const rel=()=>bt.classList.remove('on'); bt.addEventListener('pointerup',rel); bt.addEventListener('pointercancel',rel); }
}
function sbReset(){ const p=game.p,e=game.e; if(!p) return; p.reset(0,-30,0); e.reset(0,30,Math.PI); p.energy=e.energy=100; for(const f of [p,e]){ f.cds={}; f.stun=0; f.hp=f.def.hp; } SB.combo={n:0,dmg:0,t:0}; SB.last=null; for(const c of cams){ c.init=false; } toast('RESET','#7fd4ff',600); }
const keyName=a=>{ try{ return bindLabel(a,0); }catch(e){ return a; } };
function sbTick(dt){ const p=game.p; if(!p||game.mode!=='match') return; if(game.state==='fight'||game.state==='intro'){ game.timer=Infinity; }
 if(SB.slow&&game.state==='fight') game.timeScale=.3; else if(!SB.slow&&game.timeScale===.3) game.timeScale=1;
 if(SB.infEn){ p.energy=100; } if(SB.infHp){ for(const f of [p,game.e]) if(f.hp<f.def.hp*.25&&!f.dead) f.hp=f.def.hp; }
 const C=SB.combo, L=SKILLS[p.def.id]||[], cdTxt=n=>{ const c=p.cds['sk'+n]||0; return c>0?`<span class="cd">${Math.ceil(c)}s</span>`:'<span class="ok">READY</span>'; };
 const info=el('sbInfo'); if(info) info.innerHTML=`<b>DAMAGE</b><div class="big">${C.n&&game.time-C.t<1.6?Math.round(C.dmg):0}</div>${C.n&&game.time-C.t<1.6?C.n+' hit combo':'—'}<br>${SB.last?`last: ${SB.last.name} <b>${Math.round(SB.last.dmg)}</b>`:''}<br><b>ENERGY</b> ${Math.round(p.energy)} · <b>STANCE</b> ${p.F.name}<br><b>1</b> ${cdTxt(1)} <b>2</b> ${cdTxt(2)} <b>3</b> ${cdTxt(3)}`;
 const kit=el('sbKit'); if(kit&&!kit.classList.contains('hide')){ const F=p.F, sw=!F.gun, nm=id=>MOVES[id]?MOVES[id].name:id;
  kit.innerHTML=`<h4>VALOR · ${F.name}</h4>
  <div><span class="k">${keyName('punch')}</span>Light: ${sw?'Sword Combo (slash, backhand, shield punch)':nm(F.J)}</div>
  <div><span class="k">${keyName('heavy')}</span>tap Medium: ${nm(F.M)}</div>
  <div><span class="k">${keyName('heavy')}</span>hold Heavy: ${sw?'standing = Rising Slash · moving = Lunging Thrust':nm(F.K)}</div>
  ${sw?`<div><span class="k">${keyName('jump')}</span>+ <span class="k">${keyName('heavy')}</span>in the air: Sword Plunge</div>`:''}
  <div><span class="k">${keyName('special')}</span>Special: ${nm(F.L)}</div>
  ${L.map((S,i)=>`<div><span class="k">${keyName('sk'+(i+1))}</span>${MOVES[S.id].name} · ${S.cd}s · ⚡${S.cost} ${cdTxt(i+1)}</div>`).join('')}
  <div><span class="k">${keyName('transform')}</span>Stance: ${p.def.stances[((p.stIdx||0)+1)%p.def.stances.length].name}</div>
  <div style="margin-top:4px;color:#9fb3c8">Chains: Light → Medium → Heavy → Special or 1/2/3 when a hit lands.</div>`; }
 document.querySelectorAll('#tbtns .sk').forEach((b,i)=>{ const c=p.cds['sk'+(i+1)]||0, s=b.querySelector('.c'); s.style.display=c>0?'flex':'none'; if(c>0) s.textContent=Math.ceil(c); });
}
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ sbTick(dt); }catch(e){ console.error(e); } }; }

/* start straight into the training ground */
function sbStart(){ selId='valor'; oppId='infernoth'; vsMode='cpu'; mapSel='city'; try{ diff='normal'; }catch(e){} sbUI(); startMatch(); el('p2n').textContent='INFERNOTH (DUMMY)'; }
if(document.readyState==='complete') setTimeout(sbStart,300); else addEventListener('load',()=>setTimeout(sbStart,300));
document.title='Titan Clash · SANDBOX';
