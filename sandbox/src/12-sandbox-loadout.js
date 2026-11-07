/* =====================================================================
   SANDBOX ONLY: the ⚙ menu's LOADOUT picks (Sandbox 14). The loadout code itself is in the game
   since v8.4 (game/tools/v8-src/35-loadout.js); this part only lets the sandbox pick for you and the dummy.
   ===================================================================== */
/* ---------- loadouts in the sandbox: DEFAULT first, then every choice ---------- */
SB.lo=SB.lo||{};
const loKey=side=>side+':'+(side==='me'?SB.me:SB.opp);
const loGet=side=>SB.lo[loKey(side)]||(SB.lo[loKey(side)]={sub:'default',focus:'default',el:'default'});
function loApply(){ for(const [f,side] of [[game.p,'me'],[game.e,'opp']]){ if(!f||!isCore(f)) continue; f.loadRaw=Object.assign({},loGet(side)); f.load=loResolve(f.loadRaw,f.def.id); lxResetFighter(f); }
 lxClear(); if(typeof lookApply==='function') lookApply(); }
{ const o=sbStart; sbStart=function(){ o(); loApply(); loUI(); loSync(); }; }
function loUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-lo]')) return; const box=m.querySelector('.box'), secs=box.querySelectorAll('.sec');
 const d=document.createElement('div'); d.className='sec'; d.innerHTML='<div class="lbl">LOADOUT (picked before the fight · every pick starts on DEFAULT)</div><div id="sbLo"></div>';
 box.insertBefore(d,secs[2]); d.dataset.lo=1;
 const tools=m.querySelector('[data-t=slow]').parentNode, b=document.createElement('button'); b.dataset.allup='1'; b.textContent='ALL UPGRADES'; tools.appendChild(b);
 b.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); SB.allUp=!SB.allUp; if(!SB.allUp){ for(const f of [game.p,game.e]) lxResetFighter(f); } loSync(); });
 d.addEventListener('pointerdown',e=>{ const bt=e.target.closest('button'); if(!bt) return; e.preventDefault(); e.stopPropagation();
  const L=loGet(bt.dataset.side); L[bt.dataset.k]=bt.dataset.v; sbStart(); sbMenuOpen(true); }); }
function loRow(side,id,k,label,opts){ const L=loGet(side); return `<div class="row" style="align-items:center;margin:3px 0"><span style="font-size:10px;letter-spacing:1px;color:#9fb3c8;min-width:64px">${label}</span>${opts.map(([v,n])=>`<button data-side="${side}" data-k="${k}" data-v="${v}" class="${L[k]===v?'on':''}">${n}</button>`).join('')}</div>`; }
function loSync(){ const box=el('sbLo'); if(!box) return; let h='';
 for(const [side,f,who] of [['me',game.p,'YOU'],['opp',game.e,'DUMMY']]){ if(!f||!isCore(f)) continue; const id=f.def.id, T=V8TREE[id];
  h+=`<div style="margin:6px 0 2px;font-size:11px;color:#7fd4ff">${who}: ${f.def.name}</div>`;
  if(T) h+=loRow(side,id,'sub','PATH',[['default','DEFAULT'],['A',T.A.n],['B',T.B.n]]);
  h+=loRow(side,id,'focus','FOCUS',[['default','DEFAULT'],['melee','MELEE'],['hybrid','HYBRID'],['ranged','RANGED']]);
  h+=loRow(side,id,'el','ELEMENT',[['default','DEFAULT'],['fire','FIRE'],['water','WATER'],['lightning','LIGHTNING']]); }
 box.innerHTML=h; const b=document.querySelector('#sbMenu [data-allup]'); if(b) b.classList.toggle('on',!!SB.allUp); }
{ const o=sbBase.sync; sbBase.sync=function(){ o(); loSync(); }; }
{ const s=document.createElement('style'); s.textContent='#p2ord{display:none!important} #sbSk{bottom:14px!important}'; document.head.appendChild(s); }   // the upgrade card replaces the P2 order line; no news ticker in the sandbox
/* the sandbox starts as INFERNOTH vs a VALOR dummy (switch in ⚙) */
if(!SB_PLAY.includes('infernoth')) SB_PLAY.push('infernoth');
SB.me='infernoth'; SB.opp='valor';
