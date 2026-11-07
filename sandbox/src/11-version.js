/* Which sandbox build is this? Shown small in the top-right corner and in the ⚙ menu, so an old (cached) copy is easy to spot.
   Bump SB_BUILD every time the sandbox is pushed. */
const SB_BUILD='15d · Nov 7';
{ const d=document.createElement('div'); d.id='sbVer'; d.textContent='SANDBOX '+SB_BUILD;
  d.style.cssText="position:fixed;right:8px;bottom:6px;z-index:25;font:10px/1 'Russo One',sans-serif;letter-spacing:1px;color:#9fb3c8;opacity:.75;pointer-events:none";
  document.body.appendChild(d); }
{ const o=sbBase.menuOpen; sbBase.menuOpen=function(on){ o(on); const h=document.querySelector('#sbMenu h3'); if(h&&!h.querySelector('.ver')){ const s=document.createElement('span'); s.className='ver'; s.style.cssText='font-size:10px;color:#9fb3c8'; s.textContent='BUILD '+SB_BUILD; h.appendChild(s); } }; }
