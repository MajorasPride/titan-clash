/* =====================================================================
   SANDBOX: FULLSCREEN MODE (Nov 6, 2026)
   ⛶ button next to ⚙ SANDBOX (PC: F11 still works too, or press the button).
   On: the browser goes fullscreen (phones also lock to landscape) and the TitanVision TV frame
   is taken away so the fight fills the whole screen. Off: back to normal with the TV frame.
   iPhone Safari can't do real fullscreen for web pages; there it still removes the TV frame.
   ===================================================================== */
SB.full=false;
{ const oTV=showTV; showTV=function(on){ oTV(on&&!SB.full); }; }
function sbFull(on){ SB.full=on; const d=document.documentElement;
 try{ if(on&&!document.fullscreenElement&&!document.webkitFullscreenElement){ const rq=d.requestFullscreen||d.webkitRequestFullscreen; if(rq){ const p=rq.call(d,{navigationUI:'hide'}); const lock=()=>{ try{ screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{}); }catch(e){} }; if(p&&p.then) p.then(lock).catch(()=>{}); else lock(); } }
  else if(!on&&(document.fullscreenElement||document.webkitFullscreenElement)){ const ex=document.exitFullscreen||document.webkitExitFullscreen; if(ex) ex.call(document); } }catch(e){}
 if(game.mode==='match') showTV(true);
 setTimeout(()=>dispatchEvent(new Event('resize')),120);
 const b=el('sbFull'); if(b){ b.textContent=on?'✕ EXIT FULL':'⛶ FULLSCREEN'; b.classList.toggle('on',on); }
 document.querySelectorAll('#sbMenu [data-f]').forEach(x=>x.classList.toggle('on',on)); }
// leaving fullscreen with Esc / the phone's back gesture turns the mode off too
for(const ev of ['fullscreenchange','webkitfullscreenchange']) document.addEventListener(ev,()=>{ if(SB.full&&!document.fullscreenElement&&!document.webkitFullscreenElement&&(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen)) sbFull(false); });
{ const s=document.createElement('style'); s.textContent=`#sbFull{position:fixed;left:132px;top:70px;z-index:20;background:#0e1621dd;border:2px solid #7fd4ff99;color:#cfe3f5;border-radius:14px;padding:6px 12px;font-family:'Russo One',sans-serif;font-size:12px;letter-spacing:2px;cursor:pointer;pointer-events:auto}
#sbFull.on{border-color:#ffd43b99;color:#ffd43b}
@media (pointer:coarse) and (max-height:520px){ #sbFull{top:58px;left:118px;padding:4px 10px;font-size:11px} }`; document.head.appendChild(s); }
function fsUI(){ if(el('sbFull')) return; const b=document.createElement('button'); b.id='sbFull'; b.textContent='⛶ FULLSCREEN'; document.body.appendChild(b);
 b.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); sbFull(!SB.full); });
 const m=el('sbMenu'); if(m){ const row=m.querySelector('[data-w]'); if(row&&!m.querySelector('[data-f]')){ const x=document.createElement('button'); x.dataset.f='1'; x.textContent='FULLSCREEN'; row.parentNode.appendChild(x);
  x.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); sbFull(!SB.full); }); } } }
{ const oS=sbStart; sbStart=function(){ oS(); fsUI(); }; }
