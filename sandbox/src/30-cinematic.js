/* =====================================================================
   SANDBOX 30 (Nov 13, 2026, ticket T055): CINEMATIC MOVES. Sandbox only, the game file is not touched.
   1. KANJI TITLE CARDS   a kanji brushes on, stroke by stroke in real stroke order, when an ultimate or super is called
                          (one kanji per titan: VALOR 剣 / 水, INFERNOTH 炎, RAGNAVOX 嵐, RAIKOU 雷, ASHVIN 魂, WORLDROOT 樹),
                          and on finishers (終, 斬). Stroke paths: KanjiVG by Ulrich Apel, CC BY-SA 3.0 (30-cinematic-data.js).
                          Next step: swap in MajorasPride's own Sketch Pad stamps when they are copied over.
   2. SLOW-MO CUTS        big launches and hits that drop a titan into the red get a short slow-mo with a side-on camera
                          and letterbox bars. cineCut(kind,a,b) is the hook for the T051 beam clash + sidestep (Fable):
                          call cineCut('beam',attacker,defender) or cineCut('sidestep',dodger,attacker). If a global BC or
                          BEAM_CLASH object shows up with .on / .active, the beam cut starts on its own.
   3. FINISHERS           the K.O. hit gets a finisher cut (slow orbit around the loser + 終 card). HEAD CUT-OFF: when a blade
                          user (VALOR with the sword, RAIKOU with the katana) lands the K.O., the head comes off and tumbles.
   4. THROW FREEZE        grab-throws freeze for a beat with a camera punch and a flash, then a short slow-mo cut.
   5. AFTERMATH SHOT      after a K.O., the CH7 news chopper circles high over the loser with a LIVE lower third.
   Built on top of the game's ultimate cutscene (CINE): nothing here runs while CINE.on.
   ⚙ menu: CINEMATIC (SANDBOX 30), one switch per part plus TEST buttons.
   ===================================================================== */
const CC={cards:true, cuts:true, fin:true, head:true, throwF:true, after:true,
 shot:null, slow:0, slowK:1, freeze:0, punch:0, _save:null, cd:0, heads:[], card:null, bcWas:false, orbit:0};

// ---------------- styles + DOM ----------------
{ const s=document.createElement('style'); s.textContent=`
#ccCard{position:fixed;left:4vw;top:50%;width:min(44vh,40vw);transform:translateY(-55%);z-index:63;pointer-events:none;opacity:0;transition:opacity .25s}
#ccCard.on{opacity:1}#ccCard svg{width:100%;height:auto;display:block;overflow:visible}
#ccCard .mean{font-family:Bangers,'Russo One',sans-serif;font-size:min(5vw,6vh);letter-spacing:4px;color:#fff;-webkit-text-stroke:2px #0b0f1e;paint-order:stroke fill;text-align:center;margin-top:-1vh;opacity:0;transform:translateY(10px);transition:all .3s}
#ccCard .mean.on{opacity:1;transform:none}
#ccBars{position:fixed;inset:0;z-index:58;pointer-events:none}
#ccBars i{position:absolute;left:0;right:0;height:0;background:#000;transition:height .18s ease-out}#ccBars i.t{top:0}#ccBars i.b{bottom:0}
#ccBars.on i{height:8.5vh}
#ccFlash{position:fixed;inset:0;z-index:59;background:#fff;opacity:0;pointer-events:none}#ccFlash.go{animation:ccf .28s ease-out}@keyframes ccf{0%{opacity:.85}100%{opacity:0}}
#ccNews{position:fixed;left:0;right:0;bottom:9vh;z-index:59;pointer-events:none;display:none;font-family:Rajdhani,'Russo One',sans-serif}
#ccNews.on{display:block;animation:ccn .35s ease-out}@keyframes ccn{from{transform:translateX(-30px);opacity:0}to{transform:none;opacity:1}}
#ccNews .top{display:flex;gap:0;margin-left:3vw}#ccNews .ch{background:#0b3d91;color:#ffd43b;font:700 min(3vw,3.6vh) 'Russo One',sans-serif;padding:2px 10px}
#ccNews .live{background:#d6241c;color:#fff;font:700 min(3vw,3.6vh) 'Russo One',sans-serif;padding:2px 10px}
#ccNews .head{margin:0 3vw;background:#fffffff0;color:#0b1a33;border-left:6px solid #ffd43b;font-weight:700;font-size:min(3.6vw,4.4vh);padding:3px 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ccNews .sub{margin:0 3vw;background:#0b1a33e6;color:#cfe3f5;letter-spacing:1px;font-size:min(2.8vw,3.4vh);padding:2px 12px}
#ccScan{position:fixed;inset:0;z-index:58;pointer-events:none;display:none;background:repeating-linear-gradient(#0000 0 2px,#0002 2px 3px);box-shadow:inset 0 0 12vh #000a}
#ccScan.on{display:block}`; document.head.appendChild(s); }
const ccEl=(id,html)=>{ const d=document.createElement('div'); d.id=id; d.innerHTML=html||''; document.body.appendChild(d); return d; };
const ccCard=ccEl('ccCard'), ccBars=ccEl('ccBars','<i class="t"></i><i class="b"></i>'), ccFl=ccEl('ccFlash'), ccScan=ccEl('ccScan'),
 ccNews=ccEl('ccNews','<div class="top"><span class="ch">CH7</span><span class="live">● LIVE</span></div><div class="head"></div><div class="sub"></div>');
function ccFlash(){ ccFl.classList.remove('go'); void ccFl.offsetWidth; ccFl.classList.add('go'); }

// ---------------- 1. kanji title cards (brushed on in stroke order) ----------------
const CC_KANJI={valor:'剣', valorBrawl:'水', infernoth:'炎', ragnavox:'嵐', raikou:'雷', ashvin:'魂', worldroot:'樹', voidmaw:'滅'};
function ccKanjiFor(f){ if(!f||!f.def) return '怒'; const id=f.def.id; if(id==='valor'&&typeof isBrawl==='function'&&isBrawl(f)) return CC_KANJI.valorBrawl; return CC_KANJI[id]||'怒'; }
function ccHex(c){ return typeof c==='number'?'#'+c.toString(16).padStart(6,'0'):(c||'#d6241c'); }
// show a card. ch = kanji, col = ink rim colour, ms = how long it stays after the last stroke (real time)
function kanjiCard(ch,col,opt){ opt=opt||{}; if(!CC.cards&&!opt.force) return; const K=KANJI[ch]; if(!K) return;
 const NS='http://www.w3.org/2000/svg', rim=ccHex(col);
 const paths=K.p.map(d=>`<path d="${d}"/>`).join('');
 ccCard.innerHTML=`<svg viewBox="-12 -12 133 133" xmlns="${NS}">
  <defs><filter id="ccBrush" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${(Math.random()*99)|0}"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter></defs>
  <circle cx="54.5" cy="54.5" r="58" fill="#f3ead6" opacity=".93" filter="url(#ccBrush)"/>
  <circle cx="54.5" cy="54.5" r="53" fill="none" stroke="${rim}" stroke-width="5" stroke-dasharray="300 60" stroke-linecap="round" opacity=".9" filter="url(#ccBrush)" transform="rotate(${(Math.random()*360)|0} 54.5 54.5)"/>
  <g class="glow" fill="none" stroke="${rim}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity=".35">${paths}</g>
  <g class="ink" fill="none" stroke="#0b0b10" stroke-width="7.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#ccBrush)">${paths}</g>
 </svg><div class="mean">${K.m}</div>`;
 const ink=[...ccCard.querySelectorAll('.ink path')], glow=[...ccCard.querySelectorAll('.glow path')];
 const L=ink.map(p=>{ try{ return p.getTotalLength()||60; }catch(e){ return 60; } });
 [ink,glow].forEach(g=>g.forEach((p,i)=>{ p.style.strokeDasharray=L[i]+' '+(L[i]+2); p.style.strokeDashoffset=L[i]; }));
 const per=Math.max(.05,Math.min(.14,(opt.draw||.95)/ink.length)), total=per*ink.length, hold=(opt.ms||900)/1000, t0=performance.now(), tok=Symbol();
 CC.card=tok; ccCard.classList.add('on'); const mean=ccCard.querySelector('.mean');
 const tick=()=>{ if(CC.card!==tok) return; const t=(performance.now()-t0)/1000;
  for(let i=0;i<ink.length;i++){ const q=Math.max(0,Math.min(1,(t-i*per)/per)), e=1-Math.pow(1-q,2.2), off=L[i]*(1-e); ink[i].style.strokeDashoffset=off; glow[i].style.strokeDashoffset=off; }
  if(t>total) mean.classList.add('on');
  if(t<total+hold) requestAnimationFrame(tick); else { ccCard.classList.remove('on'); setTimeout(()=>{ if(CC.card===tok){ ccCard.innerHTML=''; CC.card=null; } },300); } };
 requestAnimationFrame(tick);
 try{ if(Snd.ok&&Snd.ok()){ const c=Snd.ctx, t=c.currentTime, n=c.createBufferSource(), b=c.createBuffer(1,c.sampleRate*.5|0,c.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2)*.5; n.buffer=b; const fl=c.createBiquadFilter(); fl.type='bandpass'; fl.frequency.value=1800; const g=c.createGain(); g.gain.value=.35;
  n.connect(fl); fl.connect(g); g.connect(Snd.m||c.destination); n.start(t); } }catch(e){} }   // a soft brush swish
{ const oU=v8UltStart; v8UltStart=function(f){ const r=oU.apply(this,arguments); try{ kanjiCard(ccKanjiFor(f),f.def.glow||f.def.color,{ms:1100}); }catch(e){} return r; }; }
{ const oS=FP.startAtk; FP.startAtk=function(id){ const r=oS.apply(this,arguments); if(id==='super'&&this.atk&&this.atk.id==='super') try{ kanjiCard(ccKanjiFor(this),this.def.glow||this.def.color,{ms:800,draw:.7}); }catch(e){} return r; }; }

// ---------------- 2. slow-mo cuts + the shared camera ----------------
// kinds: launch, nearko, beam, sidestep, throw, finisher, aftermath (TEST buttons use them too)
const CC_KIND={launch:{dur:.9,slow:.3,dist:1.6,h:.35,side:1}, nearko:{dur:1.1,slow:.25,dist:1.3,h:.25,side:-1}, beam:{dur:1.6,slow:.2,dist:2.2,h:.3,side:1},
 sidestep:{dur:1,slow:.22,dist:1.4,h:.2,side:-1}, throw:{dur:.8,slow:.35,dist:1.5,h:.5,side:1}, finisher:{dur:2.2,slow:.18,dist:1.1,h:.3,orbit:1}, aftermath:{dur:5,slow:1,news:1}};
function cineCut(kind,a,b,opt){ const K=CC_KIND[kind]; if(!K||!a||!b) return false; opt=opt||{};
 if(typeof CINE!=='undefined'&&CINE.on) return false; if(kind!=='aftermath'&&kind!=='finisher'&&!CC.cuts&&!opt.force) return false;
 if(CC.shot&&(CC.shot.kind==='finisher'||CC.shot.kind==='aftermath')&&kind!=='aftermath'&&!opt.force) return false;
 const ab=V(b.pos.x-a.pos.x,0,b.pos.z-a.pos.z); if(ab.lengthSq()<1e-4) ab.set(0,0,1); ab.normalize();
 CC.shot={kind,a,b,t:0,w0:performance.now(),real:!!opt.real,dur:opt.dur||K.dur,K,perp:V(-ab.z,0,ab.x).multiplyScalar(K.side||1),ab,yaw0:Math.atan2(ab.x,ab.z)+Math.PI/2};
 CC.slow=K.slow<1?performance.now()+CC.shot.dur*1000:0; CC.slowK=K.slow; if(!K.news) ccBars.classList.add('on');
 if(K.news){ ccNews.querySelector('.head').textContent=opt.head||'AFTERMATH OVER '+((typeof MAP!=='undefined'&&MAP.name)||'THE CITY');
  ccNews.querySelector('.sub').textContent=opt.sub||'CHOPPER 7 · LIVE PICTURES'; ccNews.classList.add('on'); ccScan.classList.add('on'); }
 return true; }
function ccEndShot(){ CC.shot=null; CC.slow=0; ccBars.classList.remove('on'); ccNews.classList.remove('on'); ccScan.classList.remove('on'); for(const c of (typeof cams!=='undefined'?cams:[])) c.init=false; }
function ccPlace(dt){ const S=CC.shot; if(!S) return false; const a=S.a, b=S.b, K=S.K;
 if(!a.pos||!b.pos||(typeof CINE!=='undefined'&&CINE.on)){ ccEndShot(); return false; }
 const ac=a.chest?a.chest():a.pos.clone(), bc=b.chest?b.chest():b.pos.clone(), mid=ac.clone().lerp(bc,.5), span=Math.max(18,ac.distanceTo(bc)), sz=Math.max(a.scale||1,b.scale||1)*10;
 let pos, look;
 if(K.news){ S.ang=(S.ang==null?S.yaw0:S.ang)+dt*.18; const r=70+sz*2; pos=V(bc.x+Math.cos(S.ang)*r,bc.y+45+sz,bc.z+Math.sin(S.ang)*r);
  look=bc.clone(); look.x+=Math.sin(performance.now()/900)*1.5; look.y+=Math.cos(performance.now()/700)*1; }   // a little chopper sway
 else if(K.orbit){ const q=S.t/S.dur, ang=S.yaw0+q*1.2; const r=span*K.dist+sz; pos=V(bc.x+Math.cos(ang)*r,bc.y*.55+sz*.25,bc.z+Math.sin(ang)*r); look=bc.clone(); look.y*=.9; }
 else { const q=S.t/S.dur, r=span*K.dist+sz*.6; pos=mid.clone().addScaledVector(S.perp,r).addScaledVector(S.ab,-r*.25*(1-q)); pos.y=Math.max(3,mid.y*(.5+K.h)); look=mid.clone(); }
 camera.position.copy(typeof camSafe==='function'?camSafe(pos,look):pos); camera.lookAt(look); return true; }
{ const oC=updateCamera; updateCamera=function(dt){
  if(CC._save){ camera.position.copy(CC._save.p); camera.quaternion.copy(CC._save.q); camera.fov=CC._save.fov; camera.updateProjectionMatrix(); CC._save=null; }
  const r=oC(dt); const rdt=Math.min(.05,dt||0);
  if(CC.shot&&game.paused) return r;
  if(CC.shot||CC.punch>.01){ CC._save={p:camera.position.clone(),q:camera.quaternion.clone(),fov:camera.fov};
   if(CC.shot&&CC.shot.real&&game.state!=='ko'){ CC._afterNext=null; ccEndShot(); }   // a real K.O.: the game's own clip / results screen takes over
   if(CC.shot){ CC.shot.t=(performance.now()-CC.shot.w0)/1000; if(CC.shot.t>=CC.shot.dur){ const k=CC.shot.kind; ccEndShot(); if(k==='finisher'&&CC._afterNext){ const n=CC._afterNext; CC._afterNext=null; n(); } }
    else ccPlace(CC._rdt||rdt); }
   if(CC.punch>.01){ camera.fov=camera.fov-CC.punch*9; camera.updateProjectionMatrix(); } }
  CC.punch*=Math.exp(-6*(CC._rdt||rdt));
  return r; }; }
// real-time slow-mo / freeze (same way HEAVY FEEL does it; a timeScale set inside the frame, like the K.O. slow-mo, wins)
{ let last=performance.now(); const oL=loop; loop=function(now){ const rdt=Math.min(.05,(now-last)/1000); last=now; CC._rdt=rdt;
  ccBeamWatch();
  let k=1; if(!game.paused){ const tn=performance.now(); if(CC.freeze>tn){ k=.03; } else if(CC.slow>tn){ k=CC.slowK; } }
  if(k===1) return oL(now);
  const b=game.timeScale, set=b*k; game.timeScale=set; const r=oL(now); if(game.timeScale===set) game.timeScale=b; return r; }; }
// T051 hook: start the beam cut on its own when the beam clash turns on
function ccBeamWatch(){ let on=false, o=null;
 try{ if(typeof BC!=='undefined'&&BC) o=BC; else if(typeof BEAM_CLASH!=='undefined'&&BEAM_CLASH) o=BEAM_CLASH; }catch(e){}
 if(o) on=!!(o.on||o.active);
 if(on&&!CC.bcWas&&game.p&&game.e){ const a=o.a||o.att||o.kaiju||game.e, b=o.b||o.def||o.mech||game.p; cineCut('beam',a,b); kanjiCard('撃','#7fd4ff',{ms:700,draw:.6}); }
 CC.bcWas=on; }

// big launches + into-the-red hits -> slow-mo cut; remember who hit last (for the finisher)
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){ const hp0=this.hp, r=oTH.apply(this,arguments);
  if(src&&src.def&&this.hp<hp0){ this._ccBy=src; this._ccAtk=src.atk?src.atk.id:null; this._ccProj=!!(typeof V8!=='undefined'&&V8.proj); }
  if(src&&src.def&&!cont&&this.hp<hp0&&!this.dead&&game.state==='fight'&&!(typeof CINE!=='undefined'&&CINE.on)&&game.time>CC.cd){
   const lo=this.def.hp*.15, huge=(kb||0)>=60||(launch||0)>=20;
   if(hp0>=lo&&this.hp<lo&&!SB.infHp){ if(cineCut('nearko',src,this)){ CC.cd=game.time+4; kanjiCard('破','#ff4d3d',{ms:600,draw:.6}); } }
   else if(huge&&cineCut('launch',src,this)) CC.cd=game.time+3; }
  return r; }; }

// ---------------- 3. finishers + head cut-off ----------------
function ccBlade(f){ if(!f||!f.def) return false; const id=f.def.id; return id==='raikou'||(id==='valor'&&!(typeof isBrawl==='function'&&isBrawl(f))); }
function headCut(f,from){ if(!f||!f.P||!f.P.head) return false; const h=f.P.head; if(h._ccCut) return false;
 h.updateMatrixWorld(true); const c=h.clone(true), wp=new THREE.Vector3(), wq=new THREE.Quaternion(), ws=new THREE.Vector3(); h.matrixWorld.decompose(wp,wq,ws);
 c.position.copy(wp); c.quaternion.copy(wq); c.scale.copy(ws); scene.add(c); h.visible=false; h._ccCut=true; f._ccHeadless=true;
 const away=from&&from.pos?V(f.pos.x-from.pos.x,0,f.pos.z-from.pos.z).normalize():V(1,0,0), s=(f.scale||1);
 CC.heads.push({m:c,f,v:away.multiplyScalar(14*s).add(V(0,26*s,0)),spin:V(rand(-6,6),rand(-4,4),rand(-8,8)),life:9,ground:(ws.y||1)*1.2});
 try{ if(typeof burst==='function') burst(wp.clone(),0xffe08a,18,12); if(typeof ring==='function') ring(wp.x,wp.y,wp.z,6*s,0xffffff,.4); }catch(e){}
 return true; }
function ccHeadsTick(dt){ for(let i=CC.heads.length-1;i>=0;i--){ const H=CC.heads[i]; H.life-=dt; H.v.y-=38*dt; H.m.position.addScaledVector(H.v,dt);
  H.m.rotation.x+=H.spin.x*dt; H.m.rotation.y+=H.spin.y*dt; H.m.rotation.z+=H.spin.z*dt;
  if(H.m.position.y<H.ground){ H.m.position.y=H.ground; if(H.v.y<-6&&typeof dust==='function') dust(H.m.position.x,H.m.position.z,3,3); H.v.y*=-.3; H.v.x*=.55; H.v.z*=.55; H.spin.multiplyScalar(.5); }
  if(H.life<=0){ scene.remove(H.m); CC.heads.splice(i,1); } } }
function ccRestoreHeads(){ for(const H of CC.heads) scene.remove(H.m); CC.heads.length=0;
 for(const f of [game.p,game.e]) if(f&&f.P&&f.P.head&&f.P.head._ccCut){ f.P.head.visible=true; f.P.head._ccCut=false; f._ccHeadless=false; } }
{ const oU=updateFX; updateFX=function(dt){ oU(dt); if(CC.heads.length) ccHeadsTick(dt); }; }
{ const oR=startRound; startRound=function(){ ccRestoreHeads(); ccEndShot(); return oR.apply(this,arguments); }; }
{ const oR=sbReset; sbReset=function(){ ccRestoreHeads(); ccEndShot(); return oR.apply(this,arguments); }; }
// the finisher run: slow orbit + 終 (or 斬 for a head cut), then the aftermath chopper shot
function ccFinisher(loser,winner,real){ if(!loser||!winner) return; let cut=false;
 if(CC.fin){ const blade=ccBlade(winner)&&(!real||(loser._ccBy===winner&&!loser._ccProj));
  if(CC.head&&blade) cut=headCut(loser,winner);
  ccEndShot(); cineCut('finisher',winner,loser,{force:true,real,dur:real?1.5:2.2}); kanjiCard(cut?'斬':'終','#ff3d3d',{ms:1300,draw:cut?.8:.75,force:true}); ccFlash(); CC.punch=1.2;
  try{ if(typeof hvBass==='function') hvBass(1.6); }catch(e){} }
 if(CC.after){ const go=()=>cineCut('aftermath',winner,loser,{force:true,real,dur:real?4.6:4,head:`${winner.def.name} DEFEATS ${loser.def.name}`,sub:'CHOPPER 7 · LIVE OVER '+((typeof MAP!=='undefined'&&MAP.name)||'THE CITY')+(cut?' · "IT TOOK HIS HEAD CLEAN OFF"':'')});
  if(CC.fin) CC._afterNext=go; else setTimeout(go,real?1400:200); } }
{ const oE=endRound; endRound=function(loser,label){ const was=game.state; const r=oE.apply(this,arguments);
  if(was==='fight'&&game.state==='ko'&&label==='K.O.!'&&loser){ const w=loser===game.e?game.p:game.e; try{ ccFinisher(loser,w,true); }catch(e){ console.warn(e); } }
  return r; }; }

// ---------------- 4. throw freeze ----------------
{ const oG=grabHit; grabHit=function(f,o,dmg,kb,ln,dir){ const r=oG.apply(this,arguments);
  if(CC.throwF&&f&&o&&game.state==='fight'&&!(typeof CINE!=='undefined'&&CINE.on)&&game.time>CC.cd-2.5){ ccThrow(f,o); } return r; }; }
function ccThrow(f,o){ CC.freeze=performance.now()+200; CC.punch=1.4; ccFlash(); try{ if(typeof hvBass==='function') hvBass(1.2); if(navigator.vibrate) navigator.vibrate(50); }catch(e){}
 setTimeout(()=>{ if(CC.cuts) cineCut('throw',f,o); },200); CC.cd=game.time+3; }

// ---------------- ⚙ menu: CINEMATIC (SANDBOX 30) ----------------
const CCS=[['TITLE CARDS','cards','card'],['SLOW-MO CUTS','cuts','cut'],['FINISHERS','fin','fin'],['HEAD CUT-OFF','head','head'],['THROW FREEZE','throwF','throw'],['AFTERMATH SHOT','after','after']];
function ccTest(w){ const p=game.p, e=game.e; if(!p||!e) return; sbBase.menuOpen&&sbBase.menuOpen(false); const m=el('sbMenu'); if(m) m.classList.add('hide'); game.paused=false;
 setTimeout(()=>{ if(w==='card') kanjiCard(ccKanjiFor(p),p.def.glow||p.def.color,{ms:1200,force:true});
  else if(w==='cut') cineCut('launch',p,e,{force:true});
  else if(w==='fin') { const h=CC.head; CC.head=false; ccFinisher(e,p,false); CC.head=h; setTimeout(ccRestoreHeads,6500); }
  else if(w==='head'){ const f=CC.fin; CC.fin=true; const b=ccBlade; ccBlade=()=>true; ccFinisher(e,p,false); ccBlade=b; CC.fin=f; setTimeout(ccRestoreHeads,6500); }
  else if(w==='throw') ccThrow(p,e);
  else if(w==='after') cineCut('aftermath',p,e,{force:true,head:`${p.def.name} vs ${e.def.name}`,sub:'CHOPPER 7 · TEST SHOT'}); },120); }
function ccUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-cc]')) return; const kit=el('sbKit'); if(!kit) return;
 const d=document.createElement('div'); d.className='sec';
 d.innerHTML=`<div class="lbl">CINEMATIC (SANDBOX 30) — tap to turn a part off; TEST plays it now</div><div class="row">${CCS.map((c,i)=>`<button data-cc="${i}">${c[0]}</button>`).join('')}</div>
  <div class="row" style="margin-top:5px">${CCS.map(c=>`<button data-cct="${c[2]}">TEST ${c[0].split(' ')[0]}</button>`).join('')}</div>
  <div class="lbl" style="margin-top:5px;opacity:.75">Kanji strokes: KanjiVG by Ulrich Apel (CC BY-SA 3.0)</div>`;
 kit.closest('.sec').parentNode.insertBefore(d,kit.closest('.sec'));
 d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation();
  if(b.dataset.cct){ ccTest(b.dataset.cct); return; }
  const c=CCS[+b.dataset.cc]; CC[c[1]]=!CC[c[1]]; toast(c[0]+': '+(CC[c[1]]?'ON':'OFF'),'#ffb347',800); ccSync(); }); }
function ccSync(){ document.querySelectorAll('#sbMenu [data-cc]').forEach(b=>b.classList.toggle('on',!!CC[CCS[+b.dataset.cc][1]])); }
{ const oS=sbStart; sbStart=function(){ oS(); ccUI(); ccSync(); }; }
{ const oS=sbSync; sbSync=function(){ oS(); ccUI(); ccSync(); }; }
