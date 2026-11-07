/* =====================================================================
   v8.4.4 (Nov 7, 2026): PHONE HUD, NOTHING ON TOP OF THE CONTROLS. MajorasPride: "I don't like it sitting on the
   right, change it to the left for the rage bars. Buttons shouldn't be covered in general."
   Phone landscape only. The meters go in the free strip on the left under the health bars (right of the little
   titan icon), each as one compact line, so they never cover the joystick or the buttons:
   - row 1: your meter (INFERNOTH's ARMOR + RAGE, or VALOR's KO PUNCH)
   - row 2: the rival's INFERNOTH ARMOR + RAGE, marked RIVAL
   PC is unchanged.
   ===================================================================== */
{ const s=document.createElement('style'); s.textContent=`
@media (pointer:coarse) and (max-height:520px){
 .infHud,#koBar{left:90px!important;right:auto!important;width:auto!important;white-space:nowrap;font-size:9px!important}
 .infHud.l,#koBar{top:84px!important}
 .infHud.r{top:104px!important;text-align:left!important}
 .infHud.r::before{content:'RIVAL ';color:#ff8a5a}
 .infHud span{display:inline-block;vertical-align:middle;margin-right:4px}
 .infHud .t{display:inline-block;vertical-align:middle;width:58px;height:6px;margin:0 9px 0 0!important}
 #koBar .t{display:inline-block;vertical-align:middle;width:90px;height:6px;margin:0 0 0 6px!important}
}`; document.head.appendChild(s); }
