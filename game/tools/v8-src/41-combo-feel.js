/* =====================================================================
   v8.4.5 (Nov 7, 2026): COMBO FEEL. MajorasPride: "the fighting combos feel weird still" -> fix all of it:
   - IMPACT: every landed hit gets a tiny hit-pause (light 0.035s, medium 0.05s, heavy / string enders / charged 0.08s)
     and the rival visibly flinches (a quick recoil). The flinch is only a look: it does NOT stun, so the
     anti-stun-lock rules (v8.2: light hits stun only every 5th hit, Combo Breaker) stay as they are.
   - TIMING: a whiffed LIGHT can be cancelled into the next button a bit after its hit moment (it used to lock you
     into the whole swing); landed hits still cancel right away like before.
   - TAG SWAP (ASHVIN): handled in 42-ashvin-twins.js (cut-ins count as landed, Sun's cut-in pops them up close).
   ===================================================================== */
const FEEL={stop:{light:.035,medium:.05,heavy:.08}, flinch:.16};
function feelClass(src){ const A=src.atk, F=src.F||{}; if(!A) return 'medium'; if(A.end||(A.chg||0)>=.5) return 'heavy';
 if(LIGHT.includes(A.id)||A.id===F.J) return 'light'; if(A.id===F.K||(HEAVYSET[F.K]&&HEAVYSET[F.K].includes(A.id))) return 'heavy'; return 'medium'; }
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){ const hp0=this.hp; const r=oTH.call(this,src,dmg,kb,launch,cont,dir);
  if(!cont&&this.hp<hp0&&src&&src.def&&src!==HZ&&isCore(src)&&!CINE.on&&src.atk&&src.atk.id!=='ultimate'){
   const c=feelClass(src); game.hitStop=Math.max(game.hitStop||0,FEEL.stop[c]); this.flinchT=FEEL.flinch*(c==='heavy'?1.4:1); this.flinchDir=Math.atan2((dir&&dir.x)||0,(dir&&dir.z)||1)-this.yaw; }
  return r; }; }
// the flinch: a quick recoil of the whole body, away from the hit
{ const oA=v8Anim; v8Anim=function(f,dt){ oA(f,dt); if(!f.root||CINE.on) return;
  if(f.flinchT>0){ f.flinchT=Math.max(0,f.flinchT-dt); const q=Math.sin((1-f.flinchT/FEEL.flinch)*Math.PI)*.22*(f.flinchT>0?1:0), d=f.flinchDir||0;
   f.root.rotation.x=-Math.cos(d)*q; f.root.rotation.z=Math.sin(d)*q; f._flinched=1; }
  else if(f._flinched){ f._flinched=0; f.root.rotation.x=0; f.root.rotation.z=0; } }; }
// whiffed lights can cancel a little after their hit moment
{ const oI=v8Input; v8Input=function(f,inp,dt){ const A=f.atk;
  if(A&&A.str&&!A.landed&&A.hitAt!=null&&A.t>=A.hitAt+.1&&(LIGHT.includes(A.id)||A.id===(f.F&&f.F.J))&&(inp.punch>0||inp.medium>0||inp.heavy>0)&&f.stun<=0) A.landed=true;   // lets the string cancel go through
  return oI(f,inp,dt); }; }
