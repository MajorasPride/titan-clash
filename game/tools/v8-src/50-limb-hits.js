/* =====================================================================
   v8.5 (Nov 8, 2026): LIMB HITS (from Sandbox 19, the FIGHT LAB). MajorasPride: "feels good", push it to the game.
   Claws, fists, feet, jaws, tails, VALOR's sword and ASHVIN's staff have hit points that move with the
   animation. A hit only lands if that body part sweeps through the rival during the move's active window
   (before: "rival is in a cone in front of me = hit", and many moves kept checking until they ended).
   Moves with no body part (beams, stomps, AoE magic) keep the old check. Move-to-part list: LAB_LIMB.
   Idea from a study of open-source fighting projects: Fray (Godot combat framework, MIT), Mugen3D (MIT),
   ThirdPersonSmashDemo (MIT). Our own code; nothing pasted in.
   The sandbox keeps the test tools (hitbox view, frame data, move map) and an on/off switch (sandbox/src/23-fight-lab.js).
   ===================================================================== */
const LAB={pad:2.2, hist:7, lateWin:.2, cards:{}, map:{}, last:null};
SB.limb=true;   // on in the game; the sandbox ⚙ has a LIMB HITS switch to compare with the old cone checks

/* ---------- which body part does each move use ---------- */
const LAB_LIMB={kclaw:'arms',kbite:'jaw',ktailwhip:'tail',starpunch:'arms',bsweep:'legs',vupper:'arms',vspin:'sword',vslash:'sword',
 risingslash:'sword',swordthrust:'sword',vcross:'sword',vcleave:'sword',vairslash:'sword',asLight:'staff',asSpin:'staff',amLight:'staff'};
const LAB_ANIM={punch:'arms',kick:'legs',spin:'tail',bite:'jaw',slam:'arms'};
function labLimbFor(f,id){ let k=LAB_LIMB[id]; if(!k){ const M=MOVES[id]; k=M&&LAB_ANIM[M.anim]; }
 if(k==='sword'&&!(f.v8&&f.v8.swordTip)) k='arms';
 if(k==='tail'&&!(f.P&&f.P.tail)) return null; return k||null; }

/* ---------- tip points: the far end of each body part ---------- */
function labFar(g){ if(!g) return null; let best=null, bd=-1; const w=V(), o=V(); g.getWorldPosition(o);
 g.traverse(m=>{ if(!m.isMesh||m===g) return; m.getWorldPosition(w); const d=w.distanceToSquared(o); if(d>bd){ bd=d; best=m; } }); return best||g; }
function labTips(f){ if(f._labT) return f._labT; const P=f.P||{}, T={}; const one=g=>{ const m=labFar(g); return m?[m]:[]; };
 T.arms=[...one(P.armL),...one(P.armR)]; T.legs=[...one(P.legL),...one(P.legR)];
 T.jaw=[...one(P.jaw),...(P.head?[P.head]:[])];
 if(Array.isArray(P.tail)&&P.tail.length){ const n=P.tail.length; T.tail=[P.tail[Math.max(0,n-3)],P.tail[Math.max(0,n-2)],...one(P.tail[n-1])]; } else T.tail=[];
 return f._labT=T; }
function labPts(f,k){ if(k==='sword'){ const b=V(),t=V(); f.v8.swordBase.getWorldPosition(b); f.v8.swordTip.getWorldPosition(t); return [0,.35,.7,1].map(q=>b.clone().lerp(t,q)); }
 if(k==='staff'){ const E=typeof staffEnds==='function'?staffEnds(f):null; return E?E.map(e=>{ const p=V(); e.getWorldPosition(p); return p; }):[]; }
 const L=labTips(f)[k]||[]; return L.map(m=>{ const p=V(); m.getWorldPosition(p); return p; }); }
// every frame: remember where each part was, so a fast swing still counts the space it swept through
{ const oU=FP.update; FP.update=function(dt,inp,opp){ const r=oU.apply(this,arguments); try{ labTrack(this); }catch(e){} return r; }; }
function labTrack(f){ if(!SB.limb&&!SB.hbox) return; const a=f.atk, k=a?labLimbFor(f,a.id):null; f._labH=f._labH||{};
 for(const key of ['arms','legs','jaw','tail','sword','staff']){ const H=f._labH[key]=f._labH[key]||[]; if(key!==k&&!SB.hbox){ H.length=0; continue; }
  if((key==='sword'&&!(f.v8&&f.v8.swordTip))||(key==='staff'&&!(f.P&&(f.P.ashStaffR||f.P.ashStaffL)))) continue;
  H.unshift(labPts(f,key)); if(H.length>LAB.hist) H.length=LAB.hist; } }
function labTouch(f,o,k){ const H=(f._labH&&f._labH[k])||[]; if(!H.length) H.push(labPts(f,k)); const R=o.radius()+LAB.pad*f.scale, y0=o.pos.y-1, y1=o.chest().y+6*o.scale;
 const ok=q=>q.y>=y0&&q.y<=y1&&Math.hypot(q.x-o.pos.x,q.z-o.pos.z)<R;
 for(let i=0;i<H.length;i++){ const A=H[i], B=H[i+1]; for(let j=0;j<A.length;j++){ if(ok(A[j])) return A[j]; if(B&&B[j]) for(const s of [.33,.66]){ const q=A[j].clone().lerp(B[j],s); if(ok(q)) return q; } } }
 return null; }
// the active window: hits only count while the move is active (or a short moment after the first check, for moves with no window)
function labWindow(a){ if(a.act) { a._labSeen=1; return true; } if(a._labSeen) return false; if(a._lab0===undefined) a._lab0=a.t; return a.t-a._lab0<=LAB.lateWin; }

/* ---------- the hit checks ---------- */
{ const oC=coneHit; coneHit=function(f,a,o,rg,arc,dmg,kb,ln,kind){ if(typeof labCone==='function') labCone(f,rg*f.scale,arc);
  const k=SB.limb&&isCore(f)?labLimbFor(f,a.id):null; if(!k) return oC.apply(this,arguments);
  if(a._bh||!canHit(o)) return false; if(!labWindow(a)) return false;
  const q=labTouch(f,o,k); if(!q) return false; LAB.hitPart=k; return landHit(f,a,o,dmg,kb,ln,q,kind); }; }
{ const oM=FP.melee; FP.melee=function(rg,arc,dmg,kb,ln){ if(typeof labCone==='function') labCone(this,rg,arc); const a=this.atk, o=this.opp;
  const k=SB.limb&&a?labLimbFor(this,a.id):null; if(!k||!o) return oM.apply(this,arguments);
  const q=labTouch(this,o,k), h=o.hidden; if(!q){ o.hidden=true; try{ oM.apply(this,arguments); } finally{ o.hidden=h; } return false; }  // keeps the building / prop smashing, no hit
  const r=oM.apply(this,arguments); if(r) return true; if(o.dead||o.hidden) return false; o.takeHit(this,dmg,kb,ln,false); return true; }; }

