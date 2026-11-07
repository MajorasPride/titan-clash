/* =====================================================================
   v8.3 (Nov 7, 2026): the move list panel (PC, bottom left) for the new controls.
   LIGHT / MEDIUM / HEAVY are their own buttons now (hold any of them to charge), 1 / 2 / 3 skills
   with cooldowns, and VALOR's ultimate name follows his stance (TIDECREST OATH / SHIELD BARRAGE).
   ===================================================================== */
const ULT_BY_STANCE={valor:f=>(typeof isBrawl==='function'&&isBrawl(f))?'SHIELD BARRAGE':'TIDECREST OATH'};
{ const oRM=refreshMoves; refreshMoves=function(i){ const f=i?game.e:game.p; if(!f||!f.def.stances||!f.F) return oRM(i); const F=f.F, c=cams[i];
  const key=f.alt+'|'+!!f.held+'|'+c.lock; if(key!==f._mk){ f._mk=key; movesT[i]=Math.max(movesT[i],7); }
  const L=SKILLS[f.def.id]||[];
  const sig=['v83',f.stIdx,L.map((S,n)=>Math.ceil(f.cds['sk'+(n+1)]||0)).join(','),Math.ceil((f.cds&&f.cds[F.L])||0),f.ultUsed,!!f.held,c.lock,padActive(i),game.vs2,f.superReady(),JSON.stringify(BS)].join('|'); if(sig===movesSig[i]) return; movesSig[i]=sig;
  const k=a=>`<kbd>${bindLabel(a,i)}</kbd>`, nm=id=>id?moveName(f,id):'-', cost=id=>id&&MOVES[id]&&MOVES[id].cost?` <span class="c">⚡${v8Cost(f,id)}</span>`:'';
  const spCd=Math.ceil((f.cds&&f.cds[F.L])||0), ult=ULT_BY_STANCE[f.def.id]?ULT_BY_STANCE[f.def.id](f):(f.def.ultName||f.def.superName);
  el(i?'moves2':'moves').innerHTML=`<div class="fm" style="color:${f.def.css}">${game.vs2?'P'+(i+1)+' · ':''}${f.def.name} · ${F.name}</div>
   <div>${k('punch')} Light: ${f.held?'Swing '+(f.held.kind==='bld'?'building':f.held.kind):nm(F.J)} <span class="c">(string them: L L L, L L M ...)</span></div>
   <div>${k('medium')} Medium: ${nm(F.M)}${cost(F.M)}</div>
   <div>${k('heavy')} Heavy: ${f.held?'Throw '+(f.held.kind==='bld'?'building':f.held.kind):nm(F.K)}${f.held?'':cost(F.K)} <span class="c">(hold any attack to charge)</span></div>
   <div class="${spCd>0?'dim':''}">${k('special')} ${nm(F.L)}${cost(F.L)}${spCd>0?` <span class="c">(${spCd}s)</span>`:''}</div>
   ${L.map((S,n)=>{ const cd=Math.ceil(f.cds['sk'+(n+1)]||0); return `<div class="${cd>0?'dim':''}">${k('sk'+(n+1))} ${MOVES[S.id]?MOVES[S.id].name:S.id} <span class="c">⚡${S.cost} · ${cd>0?cd+'s':S.cd+'s cooldown'}</span></div>`; }).join('')}
   <div class="${F.grab?'':'dim'}">${k('grab')} ${F.grab?(f.held?'Throw it':'Grab car / girder / rival'):"Can't grab in this stance"}</div>
   <div>${k('dodge')} Quick escape dash (any direction, deflects shots)</div>
   <div class="${F.jump?'':'dim'}">${k('jump')} ${F.jump?'Jump':"Can't jump"} &nbsp; ${k('block')} Block <span class="c">(tap right before a hit = PARRY)</span></div>
   <div>${k('transform')} Stance → ${f.def.stances[((f.stIdx||0)+1)%f.def.stances.length].name} <span class="c">⚡8</span></div>${f.def.id==='ragnavox'?`<div>${k('jump')} again in the air: FLY (stamina) · ${k('heavy')} while flying: Sky Dive</div>`:''}
   <div class="${f.superReady()?'':'dim'}">${k('super')} ULTIMATE: ${ult}${f.superReady()?' <b style="color:#ffd43b">READY!</b>':' <span class="c">(below 25% health, once per match)</span>'}</div>
   <div>${k('lock')} Lock-on: <b style="color:${c.lock?'#ff8080':'#9fb3c8'}">${c.lock?'ON':'OFF'}</b></div>`; }; }
