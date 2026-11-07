/* =====================================================================
   SANDBOX TEST 11: ULTIMATE BODY POSES (Nov 6, 2026)
   MajorasPride: "Why is the model just staying there when doing the ultimate? ... looked stiff in those T poses."
   Cause: the ultimate used one fixed pose ('roar2', arms up) for the whole move, so VALOR held it while
   the code slid him around. Now every step of both ultimates has its own pose, timed to the same
   moments as the effects (from a.t and the moment it hits, a.hitT). Legs run whenever he moves.
   Other titans keep the old ultimate pose until they get their own.
   ===================================================================== */
MOVES.ultimate.anim='vult';
// timing helper: 0..1 between two times (seconds)
const uq=(t,a,b)=>ez(clamp((t-a)/(b-a),0,1));
// running legs + arm pump (used whenever he moves during an ultimate)
function uRun(k,sp){ const T=game.time*(sp||16); k.legL=-.9*Math.sin(T); k.legR=.9*Math.sin(T); k.knL=.6+.4*Math.cos(T); k.knR=.6-.4*Math.cos(T); }
// the old one-pose ultimate, for the other titans
function uRoar(k){ k.headX=-.7; k.jaw=1; k.armL=k.armR=-2.4; k.azL=-.5; k.azR=.5; k.lean=-.3; }

POSES.vult=(k,p,e,f,a)=>{ if(!f||f.def.id!=='valor') return uRoar(k);
 return (isBrawl(f)||a.brawl)?uPoseBrawl(k,f,a):uPoseSword(k,f,a); };

/* ---------------- SWORD: TIDECREST OATH ---------------- */
function uPoseSword(k,f,a){ const t=a.t, S=f.v8||{};
 // a miss: the sword drops, he stumbles a little and recovers
 if(a.miss){ k.armR=-.7; k.elR=-.6; k.azR=.2; k.armL=-.6; k.elL=-1.2; k.azL=.3; k.lean=.3; k.knL=.5; k.knR=.2; k.legL=-.4; k.headX=.2; S.blade=-1.2; return; }
 if(a.hitT==null){
  // 1. plant the feet, sword raised high while the water gathers into it
  const up=uq(t,0,.3), th=uq(t,.5,.66);
  k.legL=lerp(-.45*up,-.8,th); k.knL=lerp(.45*up,.35,th); k.legR=lerp(.35*up,.4,th); k.knR=lerp(.45*up,.55,th);
  k.armL=-1.1; k.elL=-1.3; k.azL=.4;                                                  // shield up on guard
  // 2. thrust forward: the dragon launches off the tip
  k.armR=lerp(lerp(-.6,-2.95,up),-1.5,th); k.elR=lerp(-.15,0,th); k.azR=lerp(.15,-.1,th);
  k.twist=lerp(lerp(0,.35,up),-.5,th); k.lean=lerp(lerp(0,-.2,up),.42,th); k.headX=lerp(-.25*up,.1,th);
  S.blade=lerp(lerp(-1.4,-2.9,up),-Math.PI/2,th); return; }
 const kk=t-a.hitT;
 if(kk<1.05){ // 3. the dragon coils: he holds his guard, sword pointed at the rival, knees bent
  const s=uq(kk,0,.25), br=Math.sin(game.time*6)*.04;
  k.armR=lerp(-1.5,-1.25,s); k.elR=lerp(0,-.55,s); k.azR=-.05; k.armL=-1.15; k.elL=-1.3; k.azL=.45;
  k.legL=-.55; k.knL=.55; k.legR=.4; k.knR=.65; k.lean=.18+br; k.twist=-.2; S.blade=-1.75; return; }
 if(kk<1.4){ // 4. the draw-cut: wind the blade back across his body, then one huge cut through
  const w=uq(kk,1.05,1.15), c=uq(kk,1.15,1.24);
  k.twist=lerp(lerp(-.2,1.0,w),-1.1,c); k.armR=lerp(-1.25,-1.4,w); k.elR=lerp(-.55,-.25,w); k.azR=lerp(lerp(-.05,.85,w),-.7,c);
  k.armL=lerp(-1.15,-.6,c); k.elL=-1.3; k.azL=.45; k.lean=lerp(.18,.4,c); k.legL=lerp(-.55,-.95,c); k.knL=lerp(.55,.45,c); k.legR=lerp(.4,.6,c); k.knR=lerp(.65,.3,c);
  S.blade=-Math.PI/2; return; }
 // 5. he turns his back (the code flips him at 1.4) and sheathes on the click, then stands tall
 const sh=Math.sin(uq(kk,1.4,1.75)*Math.PI), st=uq(kk,1.7,1.95);
 k.armR=lerp(-.6-2.3*sh,-.25,st); k.elR=lerp(-.4-1.2*sh,-.2,st); k.azR=.15+.35*sh; k.twist=-.25*sh;
 k.armL=lerp(-.7,-.25,st); k.elL=lerp(-1.1,-.3,st); k.azL=.25; k.lean=lerp(.08,-.05,st); k.headX=lerp(-.1*sh,.18,st);   // calm, head slightly down
 k.legL=lerp(-.3,0,st); k.knL=lerp(.25,0,st); k.legR=lerp(.2,0,st); k.knR=lerp(.25,0,st); S.blade=lerp(-1.2,-.15,uq(kk,1.4,1.75)); }

/* ---------------- BRAWLER: SHIELD PIN ---------------- */
function uPoseBrawl(k,f,a){ const t=a.t;
 if(a.miss){ k.armL=-.4; k.elL=-.8; k.azL=.3; k.armR=-1; k.elR=-1.5; k.lean=.3; k.twist=.3; k.knL=.4; k.knR=.3; k.legL=-.3; k.headX=.2; return; }
 if(a.hitT==null){
  // 1. wind up and throw the shield (released at 0.3s), then hold the follow-through while it flies
  const w=uq(t,0,.26), s=uq(t,.26,.4);
  k.armL=lerp(-1.1,-1.4,w); k.azL=lerp(lerp(.2,1.1,w),-.85,s); k.elL=lerp(lerp(-1.2,-1.4,w),0,s);
  k.twist=lerp(lerp(0,-.8,w),.6,s); k.lean=lerp(lerp(0,-.1,w),.25,s); k.armR=-.5; k.elR=-1.1;
  k.legL=lerp(.2*w,-.7,s); k.knL=lerp(.3*w,.3,s); k.legR=lerp(-.2*w,.4,s); k.knR=lerp(.5*w,.4,s); return; }
 const kk=t-a.hitT;
 if(kk<.5){ // 2. the shield ricochets back: he reaches out and catches it, pulling it in to his chest
  const r=uq(kk,.05,.4), c=uq(kk,.45,.5);
  k.armL=lerp(-1.4,-1.65,r)*(1-c)+(-1.5)*c; k.elL=lerp(0,-.05,r)*(1-c)+(-.5)*c; k.azL=lerp(-.85,-.1,r);
  k.twist=lerp(.6,-.15,r); k.lean=lerp(.25,.05,r)+.15*c; k.armR=-1.1; k.elR=-1.5; k.azR=.3;
  k.legL=-.5; k.knL=.4; k.legR=.35; k.knR=.5; return; }
 if(kk<.8){ // 3. the charge: shield forward, full sprint
  uRun(k,20); k.lean=.6; k.armL=-1.55; k.elL=-.15; k.azL=.5; k.armR=-.9; k.elR=-1.5; k.azR=.2; k.headX=.25; return; }
 if(kk<.98){ // 4. the tackle: low and hard into the legs
  const d=uq(kk,.8,.88); k.lean=lerp(.6,.95,d); k.armL=lerp(-1.55,-1.2,d); k.elL=-.2; k.azL=.4; k.armR=-1.3; k.elR=-1.2; k.azR=-.2;
  k.legL=lerp(-.9,-1.2,d); k.knL=1.1; k.legR=lerp(.5,.7,d); k.knR=.9; k.headX=.35; return; }
 if(kk<1.6){ // 5. pinned: down on one knee over them, alternating shield bash (left) and right punch
  const i=clamp(Math.floor((kk-1)/.16),0,3), ph0=1+i*.16, q=kk<1?0:clamp((kk-ph0)/.16,0,1), hit=Math.sin(q*Math.PI), L=i%2===0;
  k.lean=.85; k.headX=.4; k.legL=-1.1; k.knL=1.3; k.legR=.6; k.knR=1.4;
  if(L){ k.armL=lerp(-1.9,-1.0,hit); k.elL=lerp(-1.3,-.1,hit); k.azL=.3; k.armR=-1.3; k.elR=-1.5; k.azR=.3; k.twist=.35*hit; }
  else { k.armR=lerp(-1.9,-1.0,hit); k.elR=lerp(-1.5,-.1,hit); k.azR=-.05; k.armL=-1.5; k.elL=-1.2; k.azL=.45; k.twist=-.4*hit; } return; }
 // 6. stand up, shield raised high in both hands... 7. ...SLAM it down
 const u=uq(kk,1.6,1.82), s=uq(kk,1.9,2.0), rec=uq(kk,2.25,2.55);
 k.armL=lerp(lerp(-1.5,-2.95,u),-.9,s); k.armR=lerp(lerp(-1.3,-2.85,u),-.9,s); k.elL=k.elR=lerp(lerp(-1.2,-.2,u),-.15,s); k.azL=lerp(.4,-.15,u); k.azR=lerp(.3,.15,u);
 k.lean=lerp(lerp(.85,-.25,u),.75,s)*(1-rec*.6); k.headX=lerp(lerp(.4,-.4,u),.35,s);
 k.legL=lerp(lerp(-1.1,-.3,u),-.9,s)*(1-rec); k.knL=lerp(lerp(1.3,.2,u),1.0,s)*(1-rec*.7); k.legR=lerp(lerp(.6,.2,u),.5,s)*(1-rec); k.knR=lerp(lerp(1.4,.2,u),.8,s)*(1-rec*.7); }
