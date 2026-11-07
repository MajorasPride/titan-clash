/* =====================================================================
   SANDBOX TEST 10: NEW UI FONTS (picked Nov 6, 2026; files + licenses in sandbox/fonts/)
   - Press Start 2P (OFL): numbers. Timer, combo counter, damage counter, damage numbers, KO meter.
   - Rubik Dirt (OFL): big titles. FIGHT! / K.O. banners, ultimate names, cutscene titles.
   - Permanent Marker (Apache 2.0): ultimate lines (the quote in the cutscene).
   All three are free to use in a paid game. Bangers stays everywhere else for now.
   ===================================================================== */
{ const s=document.createElement('style'); s.textContent=`
#timer,#roundlbl{font-family:'Press Start 2P',monospace!important;letter-spacing:1px}
#p1cb,#p2cb{font-family:'Press Start 2P',monospace!important;font-size:clamp(10px,1.6vw,18px)!important;letter-spacing:0}
#sbInfo,#sbInfo b{font-family:'Press Start 2P',monospace!important;font-size:10px!important;line-height:1.6}
.sbnum{font-family:'Press Start 2P',monospace!important}
#koBar{font-family:'Press Start 2P',monospace!important;font-size:8px!important}
#banner{font-family:'Rubik Dirt','Russo One',sans-serif!important;letter-spacing:2px}
#v8cut .ult{font-family:'Rubik Dirt','Russo One',sans-serif!important}
#v8cut .say{font-family:'Permanent Marker',cursive!important}
#vcine .q{font-family:'Permanent Marker',cursive!important;letter-spacing:1px}
#vcine .tt{font-family:'Rubik Dirt','Russo One',sans-serif!important}
#vcine .w{font-family:'Rubik Dirt','Russo One',sans-serif!important}
body.vcine #lockTag,body.vcine #lockTag2,body.vcine #reticle,body.vcine #sbFull,body.vcine .sbnum{visibility:hidden!important}`; document.head.appendChild(s); }
// warm the fonts up so the first cutscene doesn't flash the old font
try{ for(const f of ["12px 'Press Start 2P'","12px 'Rubik Dirt'","12px 'Permanent Marker'"]) document.fonts.load(f); }catch(e){}
