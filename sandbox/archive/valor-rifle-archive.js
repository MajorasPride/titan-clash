/* =====================================================================
   ARCHIVE: VALOR's RIFLE stance (sandbox version, Nov 6, 2026)
   Taken out of the sandbox on Nov 6, 2026 when MajorasPride swapped it for the BRAWLER stance.
   Kept here so it can come back. NOT loaded by the sandbox (it's outside sandbox/src/).
   From 01-valor-kit.js: the stance was
     ST('RIFLE',{speed:sp,gun:true,J:'vrifle',M:'buttstrike',K:'chargeshot',L:'grenade'})
   From 04-combat.js: MOVES.vrifle.noCharge=1; MOVES.grenade.noCharge=1; and the 'valor:1' combo strings.
   ===================================================================== */
 vrifle:{name:'Rifle Burst',dur:.42,ranged:1,anim:'vaim'},
 buttstrike:{name:'Rifle-Butt Smash',dur:.5,hitAt:.22,lunge:12,melee:[11,1.2,11,30,8],anim:'vbutt'},
 chargeshot:{name:'Charged Shot',dur:.8,hitAt:.45,ranged:1,anim:'vcharge'},
 grenade:{name:'Grenade Lob',dur:.7,cost:15,cd:3,ranged:1,anim:'vgrenade'},
POSES.vaim=(k,p,e,f)=>{ k.armR=-1.5; k.elR=-.05; k.azR=-.15; k.armL=-1.45; k.azL=.55; k.elL=-.55; k.twist=-.2; k.lean=-.05-(p<.5?.08*Math.sin(p*40):0); };
POSES.vbutt=(k,p,e)=>{ k.armR=lerp(-.3,-1.85,e); k.elR=lerp(-1.7,-.3,e); k.armL=lerp(-.5,-1.6,e); k.elL=-1; k.azL=.4; k.twist=lerp(.35,-.5,e); k.lean=.35*e; k.legL=-.45*e; };
POSES.vcharge=(k,p,e)=>{ const w=ph(p,0,.45), r=ez(ph(p,.45,.6)); k.armR=-1.55; k.elR=-.05; k.armL=-1.45; k.azL=.6; k.elL=-.5; k.lean=lerp(-.05*w,-.38,r)+(w<1?Math.sin(p*60)*.02:0); k.legR=.3; k.knL=.4*w; };
POSES.vgrenade=(k,p,e)=>{ const w=ez(ph(p,0,.4)), s=ez(ph(p,.4,.58)); k.armL=lerp(lerp(-.8,-2.9,w),-1.0,s); k.elL=lerp(-.4,-1.2,w)*(1-s); k.azL=-.15; k.twist=lerp(lerp(0,.45,w),-.35,s); k.lean=lerp(-.15*w,.25,s); k.armR=-1.2; k.elR=-.8; };
 vrifle(f,a,dt,pm,o){ const close=dist2(f,o)<20; if(close){ if(once(a,'b',.08)){ for(let i=-2;i<=2;i++){ f.shoot(130,0,2.6*pm,1.4,.4,6,0); const q=projs[projs.length-1]; const yy=Math.atan2(q.vel.x,q.vel.z)+i*.09, sp=q.vel.length(); q.vel.x=Math.sin(yy)*sp; q.vel.z=Math.cos(yy)*sp; } Snd.shot(); shells(f,3); } }
  else if((a.fired||0)<3&&a.t>=(a.fired||0)*.1){ a.fired=(a.fired||0)+1; f.shoot(170,0,3.6*pm,1.4,.38,5,0); shells(f,1); } },
 buttstrike(f,a,dt,pm,o){ const p=a.t/a.dur; a.act=p>.3&&p<.5; if(a.landed&&once(a,'c',0)) clangFX(o.chest().lerp(f.chest(),.4)); },
 chargeshot(f,a,dt,pm,o){ if(a.t<a.hitAt&&Math.random()<dt*40){ const t=V(); f.v8.rifleTip.getWorldPosition(t); burst(t,0x7fd4ff,1,3); }
  if(once(a,'f',a.hitAt)){ f.shoot(210,0,16*pm,3.6,1.6,40,8); shells(f,1); game.shake=Math.max(game.shake,.4); Snd.boom(); } },
 grenade(f,a,dt,pm,o){ if(once(a,'g',.4*a.dur)){ f.lob(.85,2,16*pm,8,1.3,0x7fd4ff,true); } },
function shells(f,n){ const t=V(); if(!f.v8.rifleTip) return; f.v8.rifleTip.getWorldPosition(t); for(let i=0;i<n;i++) burst(t.clone().add(V(Math.cos(f.yaw)*1.5,.5,-Math.sin(f.yaw)*1.5)),0xffd43b,1,6); }
 'valor:1':{ L:{id:'vrifle'}, LL:{id:'vrifle'}, LLL:{id:'buttstrike',end:1}, LH:{id:'chargeshot',end:1},
  M:{id:'buttstrike'}, MH:{id:'chargeshot',end:1}, MM:{id:'grenade',end:1} },

