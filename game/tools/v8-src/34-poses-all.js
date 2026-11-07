/* =====================================================================
   SANDBOX 13c (Nov 7, 2026): NO MORE "SAME POSE". In the game since v8.4 (moved from the sandbox).
   MajorasPride: "every character has that stupid same pose. Fix that."
   Every ultimate (for titans without their own cutscene poses) and every special/skill that used the
   generic arms-up roar ('roar' / 'roar2') now has its own motion with a wind-up, a release and a recovery.
   p = 0..1 through the move; T = game time (for shakes and loops).
   ===================================================================== */
const pz=(p,a,b)=>ez(clamp((p-a)/(b-a),0,1));
const MOVEPOSE={tkthrow:'pthrow',psyburst:'pburst',mindbarrier:'pbarrier',mindscramble:'pscramble',twinsplit:'psplit',dorsalpulse:'kpulse',roarwave:'kroarwave'};
for(const id in MOVEPOSE) if(MOVES[id]) MOVES[id].anim=MOVEPOSE[id];

// ASHVIN (twin psychics)
POSES.pthrow=(k,p,e)=>{ const w=pz(p,0,.45), s=pz(p,.45,.65), r=pz(p,.8,1);       // lift with one hand, hurl it forward
 k.armR=lerp(lerp(-.4,-2.7,w),-1.5,s); k.azR=lerp(.4,-.1,s); k.elR=lerp(-.2,0,s); k.armL=lerp(-.5,-1.2,w); k.azL=-.5; k.twist=lerp(lerp(0,-.5,w),.45,s)*(1-r); k.lean=.25*s*(1-r); k.headX=-.25*w*(1-s); };
POSES.pburst=(k,p,e)=>{ const w=pz(p,0,.45), s=pz(p,.45,.6);                         // gather at the chest, blast outward
 k.armL=k.armR=lerp(-1,-1.5,s); k.elL=k.elR=lerp(lerp(-.4,-1.7,w),-.1,s); k.azL=lerp(lerp(-.2,.45,w),-1,s); k.azR=lerp(lerp(.2,-.45,w),1,s); k.lean=lerp(lerp(0,.25,w),-.2,s); k.knL=k.knR=.35*w; k.headX=-.2*s; };
POSES.pbarrier=(k,p,e)=>{ const w=pz(p,0,.5); k.armL=k.armR=-1.45*w; k.azL=.65*w; k.azR=-.65*w; k.elL=k.elR=-.9*w; k.knL=k.knR=.35*w; k.lean=.12*w; k.headX=.15*w; };
POSES.pscramble=(k,p,e)=>{ const w=pz(p,0,.4), T=game.time;                          // fingers to the temples, mind attack
 k.armL=k.armR=-2.2*w; k.elL=k.elR=-2*w; k.azL=.35*w; k.azR=-.35*w; k.headX=lerp(0,.3,w); k.twist=Math.sin(T*9)*.12*w; k.lean=-.1*w; };
POSES.psplit=(k,p,e)=>{ const w=pz(p,0,.35), s=pz(p,.35,.8);                         // arms spread, spin into two
 k.armL=k.armR=-1.4*w; k.azL=-1.2*w; k.azR=1.2*w; k.elL=k.elR=0; k.twist=s*Math.PI*1.2; k.lean=-.1*w; };
// kaiju
POSES.kpulse=(k,p,e)=>{ const w=pz(p,0,.45), s=pz(p,.45,.6);                         // hunch, then arch back as the back flashes
 k.lean=lerp(lerp(0,.55,w),-.35,s); k.armL=k.armR=lerp(-.6,-.2,s); k.azL=lerp(-.25,-.9,s); k.azR=lerp(.25,.9,s); k.knL=k.knR=lerp(.6*w,.2,s); k.headX=lerp(.3*w,-.5,s); k.jaw=1.2*s; };
POSES.kroarwave=(k,p,e)=>{ const w=pz(p,0,.35), s=pz(p,.35,.55), T=game.time;          // head thrust forward, a roar that shakes the body
 k.lean=lerp(lerp(0,-.2,w),.4,s); k.headX=lerp(lerp(0,-.4,w),.35,s); k.jaw=lerp(.3,1.5,s); k.armL=k.armR=lerp(-.6,-.1,s); k.azL=-.6*s; k.azR=.6*s; k.twist=Math.sin(T*45)*.05*s; };

/* ultimates for titans without their own cutscene poses yet */
const ULTP={
 ashvin(k,t,T){ if(t<1.1){ const w=Math.min(1,t/.6); k.armL=k.armR=-1.6*w; k.azL=.5*w; k.azR=-.5*w; k.elL=k.elR=-1.1*w; k.headX=-.3*w; k.knL=k.knR=.3*w; k.twist=Math.sin(T*6)*.08; return; }   // eyes sync, hands together
  if(t<2.6){ k.armL=k.armR=-1.55; k.azL=.12; k.azR=-.12; k.elL=k.elR=0; k.lean=.2; k.knL=.5; k.knR=.1; k.legL=-.4; k.twist=Math.sin(T*30)*.03; return; }                                     // twin palms forward: the beam
  const r=Math.min(1,(t-2.6)/.4); k.armL=k.armR=lerp(-1.55,-.4,r); k.azL=-.6*r; k.azR=.6*r; k.headX=-.2; },
 raikou(k,t,T){ if(t<.8){ const w=Math.min(1,t/.4); k.knL=k.knR=.75*w; k.legL=-.5*w; k.lean=.45*w; k.armR=-.7*w; k.azR=-.7*w; k.elR=-1*w; k.armL=-.6*w; k.azL=.4*w; k.twist=.65*w; return; } // iai draw stance
  if(t<2.4){ const s=Math.sin(T*20); k.twist=s*.9; k.armR=-1.3+s*1.2; k.azR=-s*.9; k.elR=-.2; k.armL=-.8-s*.4; k.lean=.35; k.knL=k.knR=.5; k.legL=s*.5; k.legR=-s*.5; return; } // flurry of cuts
  const r=Math.min(1,(t-2.4)/.5); k.twist=lerp(.9,-.3,r); k.armR=lerp(-1.6,-.5,r); k.azR=lerp(.8,-.2,r); k.armL=-.6; k.lean=lerp(.35,0,r); k.knL=k.knR=.3*(1-r); },                   // sheathe
 ragnavox(k,t,T){ if(t<1){ const w=Math.min(1,t/.7); k.lean=-.45*w; k.armL=k.armR=-2.6*w; k.azL=-.9*w; k.azR=.9*w; k.headX=-.6*w; k.jaw=.6*w; return; }   // rear up, wings wide
  if(t<2.6){ k.lean=.3; k.headX=.25; k.jaw=1.45; k.armL=k.armR=-1.8; k.azL=-1.1; k.azR=1.1; k.twist=Math.sin(T*35)*.04; return; }                             // the braided breath
  const r=Math.min(1,(t-2.6)/.4); k.lean=.3*(1-r); k.headX=-.3*r; k.jaw=1.2*(1-r)+.3; k.armL=k.armR=-1.8+r; },
 voidmaw(k,t,T){ const s=Math.sin(T*6); k.armL=-2.2+s*.4; k.armR=-2.2-s*.4; k.azL=-.8; k.azR=.8; k.elL=k.elR=-.6+s*.3; k.jaw=Math.min(1.3,t); k.headX=-.25; k.lean=-.1+Math.sin(T*2)*.05; },
};
{ const oP=POSES.vult; POSES.vult=(k,p,e,f,a)=>{ const U=f&&ULTP[f.def.id]; if(U&&a) return U(k,a.t,game.time); return oP(k,p,e,f,a); }; }
