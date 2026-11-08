/* =====================================================================
   v8.4.1 (Nov 7, 2026): WHO'S FINISHED, WHO'S NEXT. MajorasPride's idea:
   - Finished titans (VALOR, INFERNOTH) get no tag.
   - The titan being reworked next is highlighted: NEXT UP · IN THE LAB (ASHVIN for now).
   - The others still play on their old kit: OLD KIT · REWORK COMING.
   - A shadow card for the titan that isn't in the game yet: VOIDMAW · COMING SOON (can't be picked).
   The tags show on the select screen tabs and at the top of the titan file.
   To change who's next or finished, edit TITAN_STATUS (a titan with no entry = finished, no tag).
   ===================================================================== */
const TITAN_STATUS={raikou:'old',ragnavox:'next'};   // v8.4.5: ASHVIN finished (the twins). Mark the next titan with 'next' once Clayton picks it
const TITAN_SOON=[{name:'VOIDMAW',type:'kaiju',sub:'KAIJU · BEYOND THE STARS'}];
const STATUS_TXT={next:'NEXT UP · IN THE LAB',old:'OLD KIT · REWORK COMING'};
const STATUS_FILE={next:'Being reworked next. Playable now on its old kit; the new kit is being built in the sandbox.',
 old:'Playable on its old kit. Its rework comes after the titans ahead of it.'};
{ const s=document.createElement('style'); s.textContent=`
.ftab .tst{display:block;margin-top:3px;font:9px/1 'Russo One',sans-serif;letter-spacing:1px;border-radius:4px;padding:2px 5px;width:max-content}
.ftab .tst.next{background:#ffd43b;color:#2a2010;box-shadow:0 0 8px #ffd43b99}
.ftab .tst.old{background:#0000;color:#6b5530;border:1px dashed #8a7550}
.ftab.st-next{border-color:#e0b020;box-shadow:0 0 10px -2px #ffd43b}
.ftab.st-old{opacity:.6}.ftab.st-old.sel{opacity:1}
.ftab.soon{cursor:default;opacity:.55;background:#2a2620;border-color:#4a4236;color:#6b6253;text-shadow:0 0 6px #000;filter:grayscale(1)}
.ftab.soon small{color:#8a8070}
.ftab.soon .tst{background:#0b0a08;color:#cfc4ae}
#dossier .tnote{margin:6px 0 2px;padding:6px 9px;border-radius:6px;font:12px/1.35 Rajdhani,sans-serif;font-weight:700}
#dossier .tnote.next{background:#ffd43b55;border:1px solid #e0b020;color:#3a2c14}
#dossier .tnote.old{background:#0000;border:1px dashed #8a7550;color:#6b5530}
#dossier .tnote b{font-family:'Russo One';letter-spacing:1px;font-size:11px;margin-right:6px}`; document.head.appendChild(s); }
function titanTags(){ if(typeof v8tabs==='undefined'||vsMode==='story') return;
 v8tabs.querySelectorAll('.ftab[data-t]').forEach(t=>{ const st=TITAN_STATUS[t.dataset.t]; t.classList.remove('st-next','st-old'); const old=t.querySelector('.tst'); if(old) old.remove();
  if(!st) return; t.classList.add('st-'+st); const sp=document.createElement('span'); sp.className='tst '+st; sp.textContent=STATUS_TXT[st]; t.appendChild(sp); });
 v8tabs.querySelectorAll('.ftab.soon').forEach(x=>x.remove());
 for(const S of TITAN_SOON){ const d=document.createElement('div'); d.className='ftab soon'+(S.type==='kaiju'?' k':''); d.title='Coming soon';   // no data-t: it can't be picked
  d.innerHTML=`${S.name}<small>${S.sub}</small><span class="tst">COMING SOON</span>`; v8tabs.appendChild(d); }
 const d=getDef(selId), st=d&&TITAN_STATUS[d.id];
 if(st&&doss.style.display!=='none'){ const h=doss.querySelector('.cn'); if(h&&!doss.querySelector('.tnote')){ const n=document.createElement('div'); n.className='tnote '+st; n.innerHTML=`<b>${STATUS_TXT[st]}</b>${STATUS_FILE[st]}`; h.after(n); } } }
{ const o=renderDossier; renderDossier=function(){ const r=o(); try{ titanTags(); }catch(e){ console.error(e); } return r; }; }
