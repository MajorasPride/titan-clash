/* ---- V8 UI: ultimate cutscene with speech, dossier select screen (007 style files), loadouts, settings, HUD extras ---- */
const v8css=document.createElement('style'); v8css.textContent=`
#v8cut{position:fixed;inset:0;pointer-events:none;z-index:60;display:none}
body.v8cutting #moves,body.v8cutting #moves2,body.v8cutting #touch{opacity:0;transition:opacity .2s}
#v8cut.on{display:block}
#v8cut .bar{position:absolute;left:0;right:0;height:12vh;background:#000;transition:transform .25s}
#v8cut .bar.t{top:0}#v8cut .bar.b{bottom:0}
#v8cut .band{position:absolute;left:-5vw;right:-5vw;top:58%;height:18vh;transform:skewY(-6deg);background:linear-gradient(90deg,var(--c) 0%,#000c 70%);box-shadow:0 0 40px var(--c);animation:cutIn .35s cubic-bezier(.2,1.4,.4,1) both}
#v8cut .who{position:absolute;left:6vw;top:61%;font-family:Bangers,'Comic Sans MS','Chalkboard SE',cursive;font-size:clamp(34px,7vw,84px);letter-spacing:3px;color:#fff;-webkit-text-stroke:3px #000;text-shadow:5px 5px 0 #000;transform:rotate(-6deg);animation:cutIn .4s .05s both}
#v8cut .ult{position:absolute;left:7vw;top:calc(61% + clamp(40px,8vw,96px));font-family:'Russo One';font-size:clamp(13px,1.8vw,22px);letter-spacing:4px;color:#ffd43b;transform:rotate(-6deg);text-shadow:2px 2px 0 #000}
#v8cut .say{position:absolute;right:6vw;top:18%;max-width:min(560px,70vw);background:#fff;color:#111;border:5px solid #111;border-radius:28px;padding:16px 24px;font-family:Bangers,'Comic Sans MS','Chalkboard SE',cursive;font-size:clamp(24px,3.6vw,46px);line-height:1.08;letter-spacing:1.5px;box-shadow:8px 8px 0 #111;transform:rotate(2deg);animation:pop .3s .25s cubic-bezier(.2,1.6,.4,1) both}
#v8cut .say:after{content:'';position:absolute;left:18%;bottom:-34px;border:18px solid transparent;border-top:22px solid #111}
#v8cut .say.roar{background:#ffefe0;color:#b3261e;font-size:clamp(30px,5vw,64px);transform:rotate(-3deg) scale(1.05)}
#v8cut .tag{display:block;font-family:Rajdhani;font-weight:700;font-size:13px;letter-spacing:2px;color:#555;margin-top:8px}
@keyframes cutIn{from{transform:translateX(-110%) skewY(-6deg)}}
.go.soon,.mbtn.soon{filter:grayscale(1) brightness(.6);opacity:.55;cursor:not-allowed;box-shadow:none!important} /* v8.1: STORY MODE + TITAN LAB coming soon */
@keyframes pop{from{transform:scale(0) rotate(12deg);opacity:0}}
.v8h{font-size:12px;font-weight:700;letter-spacing:1.5px;color:#cbd5e1;margin-top:3px;text-shadow:0 1px 3px #000}
.v8h .ul{color:#ffd43b}.v8h .st{display:inline-block;width:70px;height:5px;background:#24364a;border-radius:3px;vertical-align:middle;margin-left:4px}.v8h .st i{display:block;height:100%;background:#b48cff;border-radius:3px}
.side.right .v8h{text-align:right}
.ftabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:-2px}
.ftab{padding:7px 12px 6px;border-radius:9px 9px 0 0;background:#c9b48a;color:#3a2c14;font-family:'Russo One';font-size:14px;letter-spacing:1px;cursor:pointer;border:2px solid #8a7550;border-bottom:none;opacity:.75}
.ftab.k{background:#b9a17a}.ftab.sel{opacity:1;background:#e8d6ac;transform:translateY(-3px);box-shadow:0 -4px 12px -6px var(--c)}
.ftab small{font-family:Rajdhani;font-weight:700;font-size:10px;display:block;letter-spacing:2px;color:#6b5530}
#dossier{background:#e8d6ac;color:#2a2010;border:2px solid #8a7550;border-radius:0 10px 10px 10px;padding:12px 14px;position:relative;font-family:'Courier New',monospace;box-shadow:0 10px 30px #0008}
#dossier .stamp{position:absolute;right:12px;top:10px;border:3px solid #b3261e;color:#b3261e;font-family:'Russo One';font-size:13px;letter-spacing:2px;padding:2px 8px;transform:rotate(8deg);opacity:.8}
#dossier h3{font-family:'Russo One';font-size:24px;letter-spacing:2px;color:#1d1a12;margin:0}
#dossier .cn{font-size:13px;letter-spacing:2px;color:#6b5530;margin-bottom:6px}
#dossier .pg{display:flex;gap:4px;margin:6px 0 8px}
#dossier .pg button{flex:1;font-family:'Courier New',monospace;font-weight:700;font-size:12px;padding:5px;border:2px solid #8a7550;background:#d9c49a;color:#3a2c14;cursor:pointer;border-radius:5px}
#dossier .pg button.sel{background:#2a2010;color:#e8d6ac}
#dossier p{font-size:14px;line-height:1.35;margin:4px 0}
#dossier .row{display:flex;justify-content:space-between;font-size:13px;border-bottom:1px dashed #8a755088;padding:2px 0}
#dossier .mv b{display:inline-block;min-width:66px;color:#6b3a10}
#dossier .tree{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}
#dossier .br{border:2px solid #8a7550;border-radius:8px;padding:6px;cursor:pointer;background:#dccaa0}
#dossier .br.sel{border-color:#2a2010;background:#f3e5c2;box-shadow:0 0 0 2px #2a2010 inset}
#dossier .br .n{font-family:'Russo One';font-size:13px}
#dossier .node{font-size:12px;margin:4px 0;padding-left:16px;position:relative}#dossier .node:before{content:attr(data-t);position:absolute;left:0;font-weight:700;color:#b3261e}
#dossier .ch{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0}
#dossier .ch button{font-family:'Courier New',monospace;font-weight:700;font-size:12px;padding:4px 8px;border:2px solid #8a7550;background:#dccaa0;color:#2a2010;border-radius:999px;cursor:pointer}
#dossier .ch button.sel{background:#2a2010;color:#e8d6ac}
#dossier canvas{display:block;margin:0 auto}
#dossier .lb{font-weight:700;font-size:12px;letter-spacing:2px;margin-top:8px;color:#6b5530}
`; document.head.appendChild(v8css);
const cutEl=document.createElement('div'); cutEl.id='v8cut'; cutEl.innerHTML='<div class="bar t"></div><div class="bar b"></div><div class="band"></div><div class="who"></div><div class="ult"></div><div class="say"></div>'; document.body.appendChild(cutEl);

/* ---- who can understand whom: mechs and the elder tree speak plainly; other kaiju only roar,
   unless YOU are playing a kaiju, or ASHVIN (psychic twins) is in the fight on your side ---- */
const V8SAY={
 valor:['AS LONG AS I\'M STANDING... NOBODY ELSE FALLS!','THIS CITY IS MY SHIELD. AND I AM ITS SHIELD!'],
 ashvin:['TWO MINDS. ONE WILL. ECLIPSE!','WE SEE YOUR THOUGHTS... AND WE SAY NO.'],
 raikou:['YOU SAW ONE OF ME. THERE WERE A THOUSAND.','THUNDER DOESN\'T ASK PERMISSION.'],
 infernoth:['THE DEEP SENT ME. NOW... YOU BURN.','YOUR CITY IS WARM. I WILL MAKE IT WARMER.'],
 ragnavox:['THREE VOICES. ONE SONG. YOUR LAST.','SLEEP... AND DREAM OF US.'],
 worldroot:['I HAVE SEEN HOW THIS ENDS. LET ME SHOW YOU.','EVERY ROOT REMEMBERS. EVERY ROOT RETURNS.'],
};
const V8ROAR={infernoth:['GRRRAAAAHHH!!','HRRRNNN... GRAAAOOOO!!'],ragnavox:['SKREEEE-AAAAHH!!','KRAAA! KRAAA! KREEEEEE!!']};
function canUnderstand(sp){ if(sp.type!=='kaiju'&&!sp.kaiju||sp.def.id==='worldroot') return {ok:true,tag:''};
 const ears=[game.p].concat(game.vs2?[game.e]:[]).filter(Boolean); // the human players
 if(ears.some(f=>f.kaiju)) return {ok:true,tag:'KAIJU TONGUE (YOU ARE A KAIJU)'};
 if(ears.some(f=>f.def.id==='ashvin')) return {ok:true,tag:'PSYCHIC LINK: ASHVIN TRANSLATES'};
 return {ok:false,tag:'UNTRANSLATED · MECHS CAN\'T UNDERSTAND MONSTERS'}; }
v8UltStart=function(f){ const tok=game.token, u=canUnderstand(f), lines=V8SAY[f.def.id]||['!'], line=u.ok?lines[(Math.random()*lines.length)|0]:(V8ROAR[f.def.id]||['RAAAAAH!!'])[(Math.random()*2)|0];
 cutEl.style.setProperty('--c',f.def.css); cutEl.querySelector('.who').textContent=f.def.name; cutEl.querySelector('.ult').textContent='ULTIMATE · '+f.def.ultName;
 const sb=cutEl.querySelector('.say'); sb.className='say'+(u.ok?'':' roar'); sb.innerHTML=`${line}${u.tag?`<span class="tag">${u.tag}</span>`:''}`;
 cutEl.classList.remove('on'); void cutEl.offsetWidth; cutEl.classList.add('on'); document.body.classList.add('v8cutting'); game.cut={f,t:0,dur:1.9}; game.timeScale=.02; f.setGlow(3);
 Snd.tone('sawtooth',90,600,.5,.12); if(f.kaiju) Snd.roar(); else Snd.mech(); if(SET.voice&&u.ok) try{ const s=new SpeechSynthesisUtterance(line.toLowerCase()); s.rate=1.05; s.pitch=f.kaiju?.3:f.def.id==='ashvin'?1.3:.8; speechSynthesis.speak(s); }catch(e){}
 News.add(`${f.def.name} UNLEASHES ITS ULTIMATE: ${f.def.ultName}!`,true);
 setTimeout(()=>{ cutEl.classList.remove('on'); document.body.classList.remove('v8cutting'); if(tok!==game.token) return; game.cut=null; for(const c of cams) c.init=false; if(game.state==='fight') game.timeScale=1; banner(f.def.ultName+'!',1400); flashScreen(f.def.css); game.shake=Math.max(game.shake,1); },1900); };
{ const o=clearFX; clearFX=function(){ o(); game.cut=null; cutEl.classList.remove('on'); document.body.classList.remove('v8cutting'); }; }

/* ---- HUD: stance, ultimate, flight stamina, upgrades ---- */
function v8HudSetup(){ for(const [pre,side] of [['p1','left'],['p2','right']]){ let d=el(pre+'v8'); if(!d){ d=document.createElement('div'); d.id=pre+'v8'; d.className='v8h'; document.querySelector('#hud .side.'+side).appendChild(d); } d.innerHTML=''; } }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); if(!game.p||game.mode!=='match') return;
  for(const [f,pre] of [[game.p,'p1'],[game.e,'p2']]){ const d=el(pre+'v8'); if(!d) continue; if(!isCore(f)){ d.innerHTML=''; continue; }
   const sp=f.cds[f.F.L]||0, ult=!f.ultUsed&&f.hp/f.def.hp<=.25, s=`${f.F.name}${sp>0?` · SPECIAL ${Math.ceil(sp)}s`:''}${ult?' · <span class="ul">★ ULTIMATE READY</span>':''}${f.upTier>1?` · UPG ${f.upTier}/3`:''}${f.def.id==='ragnavox'?` · FLY<span class="st"><i style="width:${f.stam|0}%"></i></span>`:''}`;
   if(d._s!==s){ d._s=s; d.innerHTML=s; } } }; }

/* ---- SETTINGS ---- */
{ const cs=el('sCam'); cs.innerHTML=`<option value="melee">Titan Cam: locked on your titan, rival always in view (default)</option><option value="behind">Free camera behind your titan</option><option value="shoulder">Over the shoulder (Gears style, close)</option><option value="fixed">Fixed cameras around the city</option><option value="news">News Cam: watch from Chopper 7 (unlock: win a fight)</option>`;
  cs.addEventListener('change',e=>{ if(e.target.value==='news'&&!(V8.wins>0)){ toast('WIN A FIGHT TO UNLOCK THE NEWS CAM','#ffd43b',1400); SET.cam='melee'; cs.value='melee'; save('tc_set',SET); } for(const c of cams) c.init=false; });
  const mk=(id,txt)=>{ const r=document.createElement('div'); r.className='setrow'; r.innerHTML=`${txt} <input type="checkbox" id="${id}">`; cs.parentNode.after(r); return r.querySelector('input'); };
  const ac=mk('sClimb','Auto climb (walk into a building to climb it)'); ac.addEventListener('change',e=>{ SET.autoClimb=e.target.checked; save('tc_set',SET); });
 }
{ const o=renderSettings; renderSettings=function(){ o(); el('sClimb').checked=SET.autoClimb!==false; if(SET.cam==='news'&&!(V8.wins>0)) el('sCam').value='melee'; }; }

/* ---- SELECT SCREEN: 007-style dossiers ---- */
const doss=document.createElement('div'); doss.id='dossier'; el('grid').before(doss); let dPage=0;
const v8tabs=document.createElement('div'); v8tabs.className='ftabs'; doss.before(v8tabs); el('grid').style.marginTop='10px';
const COUNTER={valor:'infernoth',ashvin:'ragnavox',raikou:'ragnavox'}, COUNTERED={infernoth:'valor',ragnavox:'raikou'}; // v8.3: RAIKOU was always built for the three-headed dragon
function radar(d){ const s=V8STAT[d.id], keys=[['hp','HEALTH'],['atk','ATK SPEED'],['def','DEFENSE'],['mob','MOBILITY'],['en','ENERGY']], c=document.createElement('canvas'), W=270, H=220; c.width=W*2; c.height=H*2; c.style.width=W+'px'; c.style.height=H+'px'; const g=c.getContext('2d'); g.scale(2,2);
 const cx=W/2, cy=H/2+6, R=70, pt=(i,r)=>[cx+Math.sin(i/5*Math.PI*2)*r,cy-Math.cos(i/5*Math.PI*2)*r]; g.strokeStyle='#8a7550'; g.lineWidth=1;
 for(let k=1;k<=5;k++){ g.beginPath(); for(let i=0;i<=5;i++){ const [x,y]=pt(i%5,R*k/5); i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); }
 g.beginPath(); keys.forEach((k,i)=>{ const [x,y]=pt(i,R*s[k[0]]/10); i?g.lineTo(x,y):g.moveTo(x,y); }); g.closePath(); g.fillStyle=d.css+'99'; g.fill(); g.strokeStyle='#2a2010'; g.lineWidth=2; g.stroke();
 g.fillStyle='#2a2010'; g.font='bold 11px Courier New'; g.textAlign='center'; keys.forEach((k,i)=>{ const [x,y]=pt(i,R+22), v=s[k[0]], gr=v>=9?'A':v>=7?'B':v>=5?'C':v>=3?'D':'E'; g.fillText(k[1],x,y); g.font='bold 15px Russo One, Arial'; g.fillStyle='#b3261e'; g.fillText(gr,x,y+15); g.fillStyle='#2a2010'; g.font='bold 11px Courier New'; });
 return c; }
function renderDossier(){ const story=vsMode==='story', d=getDef(selId); v8tabs.style.display=doss.style.display=story?'none':'';
 v8tabs.innerHTML=V8DEFS.map(t=>`<div class="ftab ${t.type==='kaiju'?'k':''} ${t.id===selId?'sel':''}" style="--c:${t.css}" data-t="${t.id}">${t.name}<small>${t.type==='mech'?'MECH · '+t.country:'KAIJU · '+t.origin}</small></div>`).join('');
 if(!story) el('grid').querySelectorAll('.card').forEach(cd=>{ const t=cd.dataset.id&&getDef(cd.dataset.id); if(t&&t.core) cd.style.display='none'; });
 if(story||!d.core){ doss.style.display='none'; return; }
 const L=loadOf(d.id), T=V8TREE[d.id], s=V8STAT[d.id], lore=LORE[d.id]||{}, foe=allDefs().find(x=>x.id===(COUNTER[d.id]||COUNTERED[d.id]));
 let h=`<div class="stamp">${d.type==='mech'?'TOP SECRET':'THREAT FILE'}</div><h3 style="color:${d.css};-webkit-text-stroke:.5px #2a2010">${d.name}</h3><div class="cn">CODE NAME: ${d.code} · CLASS: ${d.cls}</div>
 <div class="pg">${['1 · FILE','2 · STATS','3 · ABILITIES & LOADOUT'].map((p,i)=>`<button data-pg="${i}" class="${dPage===i?'sel':''}">${p}</button>`).join('')}</div>`;
 if(dPage===0){ h+=`<p>${lore.bio||d.tag}</p><div class="row"><span>${d.type==='mech'?'BUILT BY':'ORIGIN'}</span><b>${d.type==='mech'?d.country:d.origin}</b></div>
  <div class="row"><span>${d.type==='mech'?'BUILT TO COUNTER':'COUNTERED BY'}</span><b>${foe?foe.name:'?'}</b></div><div class="row"><span>STANCES</span><b>${d.stances.map(x=>x.name).join(' / ')}</b></div>
  <div class="row"><span>SPEECH</span><b>${d.type==='mech'?(d.id==='ashvin'?'HUMAN + READS KAIJU MINDS':'HUMAN'):d.id==='worldroot'?'ANCIENT (EVERYONE UNDERSTANDS)':'KAIJU ONLY (ROARS TO HUMANS)'}</b></div><div class="row"><span>ULTIMATE</span><b>${d.ultName}</b></div>`; }
 if(dPage===1){ h+=`<div id="radarBox"></div><div class="row"><span>HEALTH</span><b>${d.hp}</b></div><div class="row"><span>ATTACK SPEED</span><b>${s.atk}/10</b></div><div class="row"><span>DEFENSE</span><b>${s.def}/10</b></div><div class="row"><span>MOBILITY</span><b>${s.mob}/10</b></div><div class="row"><span>ENERGY</span><b>${s.en}/10</b></div>`; }
 if(dPage===2){ h+=`<div class="lb">STANCES (FORM BUTTON SWITCHES · SHORT DELAY + 8 ENERGY)</div><div class="ch">${d.stances.map((x,i)=>`<button data-st="${i}" class="${(preview&&preview.stIdx===i)?'sel':''}">${x.name}</button>`).join('')}</div>`;
  const F=d.stances[preview&&preview.def===d?preview.stIdx||0:0], f={def:d}; h+=`<div class="mv"><b>LIGHT</b> ${moveName(f,F.J)}<br><b>MEDIUM</b> ${moveName(f,F.M)} (tap heavy)<br><b>HEAVY</b> ${moveName(f,F.K)} (hold heavy)<br><b>SPECIAL</b> ${moveName(f,F.L)}<br><b>ULTIMATE</b> ${d.ultName} (below 25% health)</div>`;
  h+=`<div class="lb">ABILITY TREE · ${d.cls} (UPGRADES UNLOCK DURING THE FIGHT)</div><div class="tree">${['A','B'].map(k=>`<div class="br ${L.sub===k?'sel':''}" data-sub="${k}"><div class="n">${T[k].n}</div>${T[k].nodes.map((n,i)=>`<div class="node" data-t="${i+1}">${n[0]}: ${n[1]}</div>`).join('')}</div>`).join('')}</div>`;
  h+=`<div class="lb">FOCUS</div><div class="ch">${Object.entries(V8FOCUS).map(([k,v])=>`<button data-fo="${k}" class="${L.focus===k?'sel':''}" title="${v.d}">${v.n}</button>`).join('')}</div><p style="font-size:12px">${V8FOCUS[L.focus].d}</p>`;
  h+=`<div class="lb">ELEMENT</div><div class="ch">${Object.entries(V8ELEM).map(([k,v])=>`<button data-el="${k}" class="${L.el===k?'sel':''}" style="${L.el===k?'':'color:'+v.c+';text-shadow:0 0 1px #000'}">${v.n}</button>`).join('')}</div><p style="font-size:12px">${V8ELEM[L.el].d}</p>`; }
 doss.innerHTML=h; if(dPage===1) el('radarBox').appendChild(radar(d)); }
v8tabs.addEventListener('click',e=>{ const t=e.target.closest('[data-t]'); if(!t) return; selId=t.dataset.t; pform=false; renderSelect(); setPreview(); });
doss.addEventListener('click',e=>{ const b=e.target.closest('button,[data-sub]'); if(!b) return; const L=loadOf(selId);
 if(b.dataset.pg!=null) dPage=+b.dataset.pg; if(b.dataset.sub) L.sub=b.dataset.sub; if(b.dataset.fo) L.focus=b.dataset.fo; if(b.dataset.el) L.el=b.dataset.el;
 if(b.dataset.st!=null&&preview){ preview.stIdx=+b.dataset.st; v8StanceVisual(preview); }
 saveLoad(); renderDossier(); Snd.tone('square',500,700,.05,.04); });
{ const o=renderSelect; renderSelect=function(){ o(); const d=getDef(selId), core=!!d.core&&vsMode!=='story';
  el('pform').style.display=el('pform').previousElementSibling.style.display=core?'none':'';
  el('mapc').innerHTML=[`<button class="chip ${mapSel==='random'?'sel':''}" data-map="random">RANDOM</button>`].concat(mapIds().map(k=>`<button class="chip ${mapSel===k?'sel':''}" data-map="${k}">${MAPS[k].name}</button>`)).join('');
  el('selTitle').textContent=vsMode==='story'?'CLASSIC STORY: CHOOSE YOUR HERO':'TITAN FILES: CHOOSE YOUR TITAN'; renderDossier(); }; }
{ const o=renderFormInfo; renderFormInfo=function(){ o(); const d=getDef(selId); if(d.core&&vsMode!=='story') el('formInfo').innerHTML=`<div class="fn" style="color:${d.css}">${d.name}</div><div class="fm">${d.tag}</div>`; }; }
