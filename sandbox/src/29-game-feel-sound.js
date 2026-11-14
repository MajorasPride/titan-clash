/* =====================================================================
   SANDBOX 29 (Nov 13, 2026, T054): GAME FEEL + SOUND — hits, roars, mech sounds, voices.
   Stacks on top of Sandbox 25 HEAVY FEEL (which already does hit-stop, shake, FOV punch and the bass boom),
   so this file only adds what was missing:
   1. IMPACT SOUNDS  a different sound for every kind of hit, layered on the old one:
                     metal clang (hit lands on a mech), flesh thud (on a kaiju), sword slash, beam / energy hit,
                     guard (blocked). Light / medium / heavy hits change the weight of each sound.
   2. DEBRIS         hits knock bits off: armour plates and sparks from mechs, scales and dust from kaiju.
   3. ROARS          one layered roar set per kaiju: INFERNOTH (deep fire roar + crackle), RAGNAVOX (three heads:
                     a chorus of three roars a beat apart), WORLDROOT (creaky wood + earth groan), VOIDMAW (eerie hum).
                     Plays on big moves, ultimates, on round start and when hurt badly.
   4. MECH SOUNDS    VALOR / ASHVIN / RAIKOU: servo whirr when they start moving or turn hard, a metal clank on each step.
   5. VOICES         news crew, citizens and ultimate callouts, made offline with Kokoro TTS (Apache 2.0) and packed
                     in 29-sound-data.js (small mp3s). Captions show at the bottom so they also work with the sound off.
   6. OLD SCHOOL     swaps the news crew for an old-time newsreel announcer (radio filter).
   Everything has a switch in ⚙ > GAME FEEL + SOUND (SANDBOX 29), plus a volume slider. Sounds are WebAudio, no files.
   ===================================================================== */
const GFS={impact:true, debris:true, roars:true, mech:true, voices:true, old:false, vol:.8, g:null, buf:{}, busyT:0, lastV:{}, n:{hits:0,roars:0,steps:0,voices:0,debris:0}};

// ---- own volume bus on top of the game's master gain ----
function gfsOk(){ return typeof Snd!=='undefined'&&Snd.ok&&Snd.ok(); }
function gfsBus(){ if(!gfsOk()) return null; if(!GFS.g){ try{ GFS.g=Snd.ctx.createGain(); GFS.g.connect(Snd.m||Snd.ctx.destination); }catch(_){ return null; } } GFS.g.gain.value=GFS.vol; return GFS.g; }
function gfsTone(type,f0,f1,dur,vol,delay,det){ const out=gfsBus(); if(!out) return; try{ const c=Snd.ctx, t=c.currentTime+(delay||0), o=c.createOscillator(), g=c.createGain();
  o.type=type; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur); if(det) o.detune.value=det;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+Math.min(.02,dur*.2)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t+dur+.05); }catch(_){} }
function gfsNoise(dur,f0,f1,vol,type,delay,q){ const out=gfsBus(); if(!out||!Snd.nb) return; try{ const c=Snd.ctx, t=c.currentTime+(delay||0), s=c.createBufferSource(), fl=c.createBiquadFilter(), g=c.createGain();
  s.buffer=Snd.nb; s.playbackRate.value=rand(.8,1.2); fl.type=type||'lowpass'; fl.frequency.setValueAtTime(f0,t); if(f1) fl.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur); if(q) fl.Q.value=q;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(fl); fl.connect(g); g.connect(out); s.start(t,rand(0,1)); s.stop(t+dur+.05); }catch(_){} }
// metal: a few inharmonic partials ringing out (a struck plate)
function gfsMetal(k,base,delay){ const b=base||rand(180,260); [1,2.76,5.4,8.93].forEach((m,i)=>gfsTone(i?'sine':'triangle',b*m,b*m*.985,(.5+.5*k)/(1+i*.6),(.16*k)/(1+i*.7),delay)); }

// ---- 1: impact sounds per hit type and class ----
const GFS_SND={
 clang(k){ gfsMetal(k); gfsNoise(.09,6000,1500,.35*k,'highpass'); gfsTone('square',420,120,.08,.08*k); },
 flesh(k){ gfsTone('sine',95,38,.28+.2*k,.55*k); gfsNoise(.22+.1*k,900,150,.45*k,'lowpass'); gfsNoise(.08,2400,600,.18*k,'bandpass',.01,2); },
 slash(k){ gfsNoise(.16,1200,7000,.32*k,'bandpass',0,3); gfsNoise(.12,7000,2500,.22*k,'highpass',.05); gfsTone('sawtooth',900,300,.12,.05*k,.04); },
 energy(k){ gfsTone('sawtooth',1300,180,.25,.12*k); gfsTone('sine',2200,600,.3,.1*k,.02,15); gfsNoise(.3,3000,400,.25*k,'bandpass',0,4); },
 guard(k){ gfsMetal(.6*k,rand(520,640)); gfsTone('square',1100,700,.06,.07*k); gfsNoise(.06,5000,0,.18*k,'highpass'); }
};
const GFS_K={light:.55,medium:.85,heavy:1.25};
function gfsHitType(src,tgt,blocked){ if(blocked) return 'guard';
 const a=src&&src.atk, id=a&&a.id, M=id&&MOVES[id];
 let limb=null; try{ if(id&&typeof labLimbFor==='function') limb=labLimbFor(src,id); }catch(_){}
 if(limb==='sword') return 'slash';
 if(!a||src.beamOn||id==='beam'||id==='super'||(M&&(M.proj||M.beam))||(typeof V8!=='undefined'&&V8.proj)) return 'energy';
 return tgt.kaiju?'flesh':'clang'; }

// ---- 2: debris knocked off on hits (uses the game's chunk + spark pools) ----
function gfsDebris(tgt,k,dir){ if(!GFS.debris||typeof chunks==='undefined') return; const p=tgt.chest?tgt.chest():tgt.pos.clone(); const n=Math.round(2+4*k);
 for(let i=0;i<n;i++){ const c=chunks[chunkI++%chunks.length]; c.m.material=tgt.kaiju?chunkMats[1]:(Math.random()<.5?chunkMats[3]:chunkMats[4]); c.m.visible=true; c.m.position.copy(p).add(V(rand(-1.5,1.5),rand(-1,1.5),rand(-1.5,1.5)));
  const sp=rand(8,16)*k; c.v.set(((dir&&dir.x)||rand(-1,1))*sp+rand(-5,5),rand(6,14)*k,((dir&&dir.z)||rand(-1,1))*sp+rand(-5,5));
  c.spin.set(rand(-9,9),rand(-9,9),rand(-9,9)); const s=tgt.kaiju?rand(.35,.8):rand(.3,.9); c.base.set(s*rand(.8,1.6),s*(tgt.kaiju?.35:.25),s*rand(.8,1.4)); c.life=rand(1.2,2.2); }
 if(tgt.kaiju){ dust(p.x,p.z,1.5+k,1+Math.round(k)); } else burst(p,0xffe6a8,Math.round(4+6*k),20);
 GFS.n.debris+=n; }

{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){
  const hp0=this.hp, blk=!!this.blocking, live=!this.dead&&!this.hidden&&!(this.inv>0); const r=oTH.call(this,src,dmg,kb,launch,cont,dir);
  if(cont||!live||!src||!src.def||src===HZ||(typeof CINE!=='undefined'&&CINE.on&&src.atk&&src.atk.id==='ultimate')) return r;
  const lost=hp0-this.hp; if(lost<=0&&!blk) return r;
  const c=src.atk?feelClass(src):'medium', huge=kb>=60||launch>=20, k=(huge?1.5:GFS_K[c])*(blk?.7:1);
  if(GFS.impact&&Snd.thr('gfsHit',45)){ const t=gfsHitType(src,this,blk&&lost<dmg*.5); GFS_SND[t](k); GFS.n.hits++; GFS.n.last=t; }
  if(!blk&&(c!=='light'||huge)) gfsDebris(this,k,dir);
  if(GFS.roars&&this.kaiju&&!blk&&(huge||c==='heavy')&&Math.random()<.45) gfsRoar(this,.6);
  if(this.hp<=0&&hp0>0) gfsSay(GFS.old?'old_ko':'news_ko',1.2,true);
  else if(huge&&Math.random()<.35) gfsSay(GFS.old?'old_hit':'news_hit',.4);
  return r; }; }

// ---- 3: kaiju roars, one layered set each ----
const GFS_ROAR={
 infernoth(k){ gfsTone('sawtooth',150,55,1.4*k,.22*k); gfsTone('sawtooth',101,42,1.5*k,.2*k,0,-20); gfsTone('square',300,120,.9*k,.05*k,.08);
  gfsNoise(1.3*k,800,180,.35*k,'lowpass'); for(let i=0;i<6;i++) gfsNoise(.05,3000,0,.12*k,'highpass',.2+i*.17); },          // + fire crackle
 ragnavox(k){ [[190,70,0],[150,55,.22],[240,90,.44]].forEach(([a,b,d],i)=>{ gfsTone('sawtooth',a,b,1.1*k,.15*k,d,i*12); gfsTone('triangle',a*1.5,b*1.5,.9*k,.06*k,d); gfsNoise(1*k,1200,250,.2*k,'bandpass',d,2); }); }, // three heads, a beat apart
 worldroot(k){ gfsTone('sawtooth',62,40,1.8*k,.22*k); gfsTone('triangle',88,52,1.6*k,.15*k,.1);
  for(let i=0;i<7;i++) gfsNoise(.09,rand(400,900),rand(150,300),.18*k,'bandpass',.1+i*.21,9);                                // creaking wood
  gfsNoise(1.8*k,240,60,.4*k,'lowpass',.15); },                                                                                 // earth rumble
 voidmaw(k){ gfsTone('sine',110,98,2*k,.18*k); gfsTone('sine',165,150,2*k,.12*k,.05,8); gfsTone('sawtooth',55,48,1.8*k,.1*k); gfsNoise(1.8*k,500,2000,.12*k,'bandpass',.1,6); },
 any(k){ gfsTone('sawtooth',170,60,1.3*k,.2*k); gfsNoise(1.2*k,700,200,.3*k,'lowpass'); }
};
function gfsRoar(f,k){ if(!GFS.roars||!f||!f.kaiju||!gfsOk()||!Snd.thr('gfsRoar'+(f===game.p?0:1),1600)) return; (GFS_ROAR[f.def.id]||GFS_ROAR.any)(k||1); GFS.n.roars++; }
{ const oA=FP.startAtk; FP.startAtk=function(id){ const r=oA.apply(this,arguments); try{ const M=MOVES[id];
  if(this.kaiju&&(id==='ultimate'||id==='super'||(M&&(M.dur>=1.1||M.beam))||(this.F&&id===this.F.K))) gfsRoar(this,id==='ultimate'?1.4:1);
  if(!this.kaiju&&GFS.mech&&(id==='ultimate'||id==='super')) { gfsMech.servo(1.4); }
  if(id==='ultimate'){ const mine=this===game.p;
   if(this.def.id==='ragnavox') gfsSay('ult_chorus',.2,true); else if(mine) gfsSay(Math.random()<.5?'ult_go':'ult_finish',.15,true);
   setTimeout(()=>gfsSay(GFS.old?'old_ult':'news_ult',.2),1900); } }catch(_){} return r; }; }

// ---- 4: mech servo + footstep clank ----
const gfsMech={ servo(k){ gfsTone('sawtooth',180,520,.28*k,.05*k); gfsTone('square',260,780,.25*k,.03*k,.02); gfsNoise(.25*k,1500,3500,.05*k,'bandpass',0,6); },
 clank(k){ gfsMetal(.45*k,rand(110,150)); gfsTone('sine',70,30,.25,.3*k); gfsNoise(.1,700,150,.2*k,'lowpass'); } };
{ const oUp=FP.update; FP.update=function(dt,inp,opp){ const y0=this.yaw, m0=this.moveAmt||0; const r=oUp.call(this,dt,inp,opp);
  if(GFS.mech&&!this.kaiju&&!this.dead&&!this.hidden&&game.mode==='match'&&dt>0&&gfsOk()){ const near=this===game.p?1:.6, mv=this.moveAmt||0;
   if(mv>.3&&m0<=.3&&Snd.thr('gfsServo'+(this===game.p?0:1),500)) gfsMech.servo(.8*near);
   else if(y0!=null&&Math.abs(angDiff(y0,this.yaw))>dt*3.5&&Snd.thr('gfsTurn'+(this===game.p?0:1),700)) gfsMech.servo(.5*near);
   if(this.onGround&&mv>.25){ this._gfsStep=(this._gfsStep==null?.3:this._gfsStep)-dt*(.8+mv*1.1); if(this._gfsStep<=0){ this._gfsStep=.55; gfsMech.clank(.7*near); GFS.n.steps++; } } } return r; }; }

// ---- 5 + 6: voice lines (decoded once from 29-sound-data.js) + captions ----
const GFS_WHO={news_open:'CH7 NEWS',news_hit:'CH7 NEWS',news_ult:'CH7 NEWS',news_ko:'CH7 NEWS',cit_run:'CITIZEN',cit_car:'CITIZEN',cit_robot:'CITIZEN',ult_go:'',ult_finish:'',ult_chorus:'RAGNAVOX',old_open:'NEWSREEL',old_hit:'NEWSREEL',old_ult:'NEWSREEL',old_ko:'NEWSREEL'};
function gfsDecode(key){ if(GFS.buf[key]||typeof GFS_VOX==='undefined'||!GFS_VOX[key]||!gfsOk()) return Promise.resolve(GFS.buf[key]||null);
 try{ const b=atob(GFS_VOX[key].a), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i);
  return new Promise(res=>{ try{ const p=Snd.ctx.decodeAudioData(u.buffer,x=>{ GFS.buf[key]=x; res(x); },()=>res(null)); if(p&&p.catch) p.catch(()=>res(null)); }catch(_){ res(null); } }); }catch(_){ return Promise.resolve(null); } }
function gfsCaption(key){ if(typeof GFS_VOX==='undefined'||!GFS_VOX[key]) return; let d=el('gfsCap'); if(!d){ d=document.createElement('div'); d.id='gfsCap';
  d.style.cssText="position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:18;max-width:80vw;text-align:center;font:600 14px/1.3 Rajdhani,sans-serif;color:#fff;text-shadow:0 2px 0 #000,0 0 6px #000;pointer-events:none;transition:opacity .4s;opacity:0"; document.body.appendChild(d); }
 const w=GFS_WHO[key]; d.innerHTML=(w?`<b style="font-family:'Russo One';font-size:10px;letter-spacing:2px;color:${key.startsWith('old')?'#e8d9a8':key.startsWith('news')?'#ffd43b':'#7fd4ff'}">${w}</b> `:'')+GFS_VOX[key].t.replace(/</g,'&lt;'); d.style.opacity='1';
 clearTimeout(d._t); d._t=setTimeout(()=>d.style.opacity='0',2600); }
function gfsSay(key,delay,force){ if(!GFS.voices||game.mode!=='match') return false; const now=performance.now();
 if(!force&&(now<GFS.busyT||now-(GFS.lastV[key]||-1e9)<12000)) return false; GFS.lastV[key]=now; GFS.busyT=now+4000;
 setTimeout(()=>{ if(!GFS.voices||game.mode!=='match') return; gfsCaption(key); GFS.n.voices++; GFS.n.lastVoice=key;
  gfsDecode(key).then(buf=>{ const out=gfsBus(); if(!buf||!out) return; try{ const s=Snd.ctx.createBufferSource(), g=Snd.ctx.createGain(); g.gain.value=1.1; s.buffer=buf; s.connect(g); g.connect(out); s.start(); GFS.busyT=performance.now()+buf.duration*1000+600; }catch(_){} }); },(delay||0)*1000);
 return true; }
// round start: the news opens (or the newsreel), kaiju roar at each other
{ const oSR=startRound; startRound=function(){ const r=oSR.apply(this,arguments); try{ GFS.busyT=0;
  setTimeout(()=>{ if(game.mode!=='match') return; gfsSay(GFS.old?'old_open':'news_open',0,true); [game.p,game.e].forEach((f,i)=>f&&f.kaiju&&setTimeout(()=>gfsRoar(f,1),400+i*900)); },900); }catch(_){} return r; }; }
// citizens: buildings coming down, cars getting crushed
{ const oC=Snd.crumble; Snd.crumble=function(){ const r=oC.apply(this,arguments); if(game.mode==='match'&&Math.random()<.3) gfsSay(Math.random()<.5?'cit_run':'cit_robot',.3); return r; }; }
{ const oC=Snd.crunch; Snd.crunch=function(){ const r=oC.apply(this,arguments); if(game.mode==='match'&&Math.random()<.4) gfsSay('cit_car',.2); return r; }; }

// ---- ⚙ menu: GAME FEEL + SOUND (SANDBOX 29) ----
const GFSS=[['IMPACT SOUNDS','impact'],['DEBRIS','debris'],['ROARS','roars'],['MECH SOUNDS','mech'],['VOICES','voices'],['OLD SCHOOL NEWSCASTER','old']];
function gfsUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-gfs]')) return; const kit=el('sbKit'); if(!kit) return;
 const d=document.createElement('div'); d.className='sec';
 d.innerHTML=`<div class="lbl">GAME FEEL + SOUND (SANDBOX 29) — hits, debris, roars, mech sounds, voices</div><div class="row">${GFSS.map((c,i)=>`<button data-gfs="${i}">${c[0]}</button>`).join('')}<button data-gfs="test">▶ TEST</button></div>
 <div class="row" style="align-items:center;margin-top:6px"><span class="lbl" style="margin:0">VOLUME</span><input data-gfsvol type="range" min="0" max="100" value="${Math.round(GFS.vol*100)}" style="flex:1;accent-color:#7fd4ff"></div>`;
 kit.closest('.sec').parentNode.insertBefore(d,kit.closest('.sec'));
 d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation();
  if(b.dataset.gfs==='test'){ gfsTest(); return; }
  const c=GFSS[+b.dataset.gfs]; GFS[c[1]]=!GFS[c[1]]; toast(c[0]+': '+(GFS[c[1]]?'ON':'OFF'),'#7fd4ff',800); gfsSync(); });
 d.querySelector('[data-gfsvol]').addEventListener('input',e=>{ GFS.vol=+e.target.value/100; if(GFS.g) GFS.g.gain.value=GFS.vol; }); }
function gfsSync(){ document.querySelectorAll('#sbMenu [data-gfs]').forEach(b=>{ const c=GFSS[+b.dataset.gfs]; if(c) b.classList.toggle('on',!!GFS[c[1]]); }); }
// ▶ TEST: one of each so they can be heard side by side
function gfsTest(){ if(Snd.init) Snd.init(); const seq=[()=>GFS_SND.clang(1),()=>GFS_SND.flesh(1),()=>GFS_SND.slash(1),()=>GFS_SND.energy(1),()=>GFS_SND.guard(1),()=>gfsMech.clank(1),()=>gfsMech.servo(1)];
 seq.forEach((f,i)=>setTimeout(f,i*450)); const k=[game.p,game.e].find(f=>f&&f.kaiju); if(k) setTimeout(()=>{ Snd.last['gfsRoar'+(k===game.p?0:1)]=0; gfsRoar(k,1); },seq.length*450+200);
 setTimeout(()=>gfsSay(GFS.old?'old_hit':'news_hit',0,true),seq.length*450+1800); }
{ const oS=sbStart; sbStart=function(){ oS.apply(this,arguments); gfsUI(); gfsSync(); }; }
{ const oS=sbSync; sbSync=function(){ oS.apply(this,arguments); gfsUI(); gfsSync(); }; }
