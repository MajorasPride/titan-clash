/* =====================================================================
   v8.3 (Nov 7, 2026): the parts of the sandbox panel the real game needs.
   The new VALOR + combat code came from the sandbox (sandbox/src/). The sandbox had a ⚙ test menu;
   the game doesn't, so its hooks (sbStart, sbSync, sbReset ...) are plain no-ops here that the
   ported files chain onto. sbReset is called at the start of every round to clear leftovers.
   - Keys for 1 / 2 / 3 (solo: 1 2 3 · 2-player P1: 1 2 3 · P2: 8 9 0)
   - Phone buttons for 1 / 2 / 3 with a cooldown number
   ===================================================================== */
BUFF.push('sk1','sk2','sk3');
ACTIONS.splice(ACTIONS.findIndex(a=>a[0]==='super')+1,0,['sk1','Skill 1'],['sk2','Skill 2'],['sk3','Skill 3']);
Object.assign(DEF_SETS.solo,{sk1:['Digit1',''],sk2:['Digit2',''],sk3:['Digit3','']}); Object.assign(DEF_SETS.p1,{sk1:['Digit1',''],sk2:['Digit2',''],sk3:['Digit3','']}); Object.assign(DEF_SETS.p2,{sk1:['Digit8',''],sk2:['Digit9',''],sk3:['Digit0','']});
for(const st in BS) for(const k of ['sk1','sk2','sk3']) if(!BS[st][k]) BS[st][k]=DEF_SETS[st][k].slice();
rebuildCodeMap(); for(const I of inps) I.sk1=I.sk2=I.sk3=0;

// sandbox menu hooks: nothing to do in the real game, the ported code chains onto these
// (the sandbox file fills in sbBase with its real test-menu versions; the game leaves it empty)
let sbBase={};
function sbStart(){ if(sbBase.start) sbBase.start(); } function sbSync(){ if(sbBase.sync) sbBase.sync(); } function sbMenuOpen(on){ if(sbBase.menuOpen) sbBase.menuOpen(on); }
function sbKitRender(){ if(sbBase.kit) sbBase.kit(); } function sbReset(){ if(sbBase.reset) sbBase.reset(); }
const keyName=a=>{ try{ return bindLabel(a,0); }catch(e){ return a; } };

{ const s=document.createElement('style'); s.textContent=`
#tbtns .sk{width:44px!important;height:44px!important;font-size:15px!important;background:#163654dd!important;border-color:#7fd4ff99!important}
#tbtns .sk1{right:150px;bottom:150px}#tbtns .sk2{right:200px;bottom:120px}#tbtns .sk3{right:140px;bottom:200px}
#tbtns .sk .c{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#ff9f43;background:#000a;border-radius:50%}`; document.head.appendChild(s); }
function skButtons(){ const tb=el('tbtns'); if(!tb||tb.querySelector('.sk')) return;
 for(const n of [1,2,3]){ const bt=document.createElement('button'); bt.className='sk sk'+n; bt.dataset.k='sk'+n; bt.innerHTML=n+'<span class="c" style="display:none"></span>'; tb.appendChild(bt);
  bt.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); bt.classList.add('on'); inps[0]['sk'+n]=.25; if(navigator.vibrate) try{ navigator.vibrate(12); }catch(_){} });
  const rel=()=>bt.classList.remove('on'); bt.addEventListener('pointerup',rel); bt.addEventListener('pointercancel',rel); } }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ const p=game.p; if(!p||game.mode!=='match') return;
  document.querySelectorAll('#tbtns .sk').forEach((b,i)=>{ const c=p.cds['sk'+(i+1)]||0, s=b.querySelector('.c'); if(!s) return; s.style.display=c>0?'flex':'none'; if(c>0) s.textContent=Math.ceil(c); }); }catch(e){ console.error(e); } }; }
