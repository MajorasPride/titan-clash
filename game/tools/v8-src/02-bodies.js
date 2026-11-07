/* ---- V8 BODIES: extra parts on top of the existing builders (real 3D models come later from the model chat) ---- */
V8DEFS.find(d=>d.id==='infernoth').baseScale=1.12;
V8DEFS.find(d=>d.id==='worldroot').baseScale=1.08;
const V8EL={fire:0xff6a1a,storm:0x9ff3ff,ice:0xcfefff,sound:0xb48cff};
function v8Dress(f){ const d=f.def, P=f.P, id=d.id; f.v8={};
 if(id==='valor'){ const mS=std(0xe9eef4,.35,.7), mR=std(0xc8323c,.4,.5), mG=glowM(0x7fd4ff,2.4), mD=std(0x1c2026,.5,.7);
  const sh=P.v8shield=grp(-1.2,-1.8,0,P.elL); const disc=mesh(Cy(2.7,2.7,.45,24),mS,0,0,0,sh); disc.rotation.z=Math.PI/2;
  const rim=mesh(new THREE.TorusGeometry(2.7,.22,8,28),mR,0,0,0,sh,true); rim.rotation.y=Math.PI/2; const core=mesh(Cy(1,1,.55,6),mG,0,0,0,sh,true); core.rotation.z=Math.PI/2;
  const sw=P.v8sword=grp(0,-.4,0,P.handR); mesh(BV(.8,.3,.8),mR,0,0,0,sw,true); mesh(BV(.25,1.2,.35),mD,0,.7,0,sw,true); mesh(BV(.24,9,.7),mS,0,-4.8,0,sw,true); mesh(BV(.08,9,.75),mG,0,-4.8,0,sw,true); sw.rotation.x=-Math.PI/2; sw.position.z=.4;
  const rf=P.v8rifle=grp(0,-.6,.6,P.handR); mesh(BV(1,1.1,4.4),mD,0,0,1,rf,true); const br=mesh(Cy(.28,.28,3.4,8),mS,0,.1,4.6,rf,true); br.rotation.x=Math.PI/2; mesh(BV(.5,.3,1.4),mG,0,.7,.8,rf,true); f.v8.rifleTip=grp(0,.1,6.4,rf);
  const back=P.v8back=grp(0,2.6,-2.6,P.torso); P.v8swordBack=sw.clone(true); P.v8swordBack.position.set(1.4,0,0); P.v8swordBack.rotation.set(0,0,.5); back.add(P.v8swordBack);
  P.v8rifleBack=rf.clone(true); P.v8rifleBack.position.set(-1.4,0,0); P.v8rifleBack.rotation.set(Math.PI/2,0,-.4); back.add(P.v8rifleBack); }
 if(id==='ashvin'){ const mGo=glowM(0xffc94d,2), mSi=glowM(0xd58bff,2.2);
  P.v8halo=[mesh(new THREE.TorusGeometry(2.2,.16,8,32),mGo,-.6,1.6,-1.4,P.head,true),mesh(new THREE.TorusGeometry(1.7,.14,8,32),mSi,.6,1.9,-1.6,P.head,true)];
  P.v8orbs=[0,1,2,3].map(i=>{ const m=mesh(S(.55,10,8),i%2?mSi:mGo,0,0,0,f.root,true); return m; }); }
 if(id==='raikou'){ const mY=glowM(0xfff06a,2.4); for(const s of[-1,1]){ const h=mesh(BV(.18,2.4,.18),mY,s*.9,2.6,.4,P.head,true); h.rotation.z=s*-.9; } }
 if(id==='infernoth'){ const mP=glowM(0xff5a1a,1.6), oct=new THREE.OctahedronGeometry(1,0); P.v8spines=[];
  for(let i=0;i<7;i++){ const big=1-Math.abs(i-3)/4; const m=mesh(oct,mP,0,.4+i*.85,-2.4-big*.6,P.torso,true); m.scale.set(.45,1.4+big*2.4,1.2+big); m.rotation.x=-.5; P.v8spines.push(m); }
  f.glowMats.push(mP); P.v8spineMat=mP; }
 if(id==='ragnavox'){ const heads=[P.head].concat(P.extraHeads||[]), els=['storm','fire','ice'];
  heads.forEach((h,i)=>{ h.userData.el=els[i]; h.traverse(o=>{ if(o.isMesh&&o.material&&o.material.emissive&&o.material.emissiveIntensity>.5){ o.material=o.material.clone(); o.material.color.setHex(V8EL[els[i]]); o.material.emissive.setHex(V8EL[els[i]]); } }); });
  P.v8heads=heads; if(P.wings) P.wings.forEach(w=>w.scale.set(1.45,1.1,1.25)); }
 if(id==='worldroot'){ P.v8motes=[0xff6a1a,0x5fd0ff,0xfff06a,0xcfefff].map(c=>mesh(S(.7,10,8),glowM(c,3),0,0,0,f.root,true)); }
 v8StanceVisual(f);
}
function v8StanceVisual(f){ const P=f.P, F=f.F; if(!P) return;
 if(f.def.id==='valor'&&P.v8sword){ const gun=F.name==='GUN'; P.v8sword.visible=!gun; P.v8rifle.visible=gun; P.v8swordBack.visible=gun; P.v8rifleBack.visible=!gun; }
 if(f.def.id==='infernoth'&&P.v8spineMat){ P.v8spineMat.userData.base=F.hot?3:1.6; }
}
function v8Anim(f,dt){ const P=f.P, T=game.time; if(!P) return;
 if(P.v8orbs){ P.v8orbs.forEach((m,i)=>{ const a=T*1.6+i*Math.PI/2, r=6.5*f.scale; m.position.set(Math.cos(a)*r/f.scale,(9+Math.sin(T*2+i)*.8),Math.sin(a)*r/f.scale); }); P.v8halo[0].rotation.z+=dt*.8; P.v8halo[1].rotation.z-=dt*1.1; }
 if(P.v8motes){ P.v8motes.forEach((m,i)=>{ const a=T*.9+i*Math.PI/2; m.position.set(Math.cos(a)*7,15+Math.sin(T*1.7+i)*1.2,Math.sin(a)*7); }); }
 if(f.def.id==='raikou'&&!f.dead&&Math.random()<dt*3&&game.mode==='match'){ const c=f.chest(); zapBolt(c.clone().add(V(rand(-3,3),rand(-2,4),rand(-3,3))),c.clone().add(V(rand(-3,3),rand(-4,2),rand(-3,3)))); }
 if(P.v8heads){ const cut=f.v8cut||{}; P.v8heads.forEach(h=>{ h.visible=!cut[h.userData.el]; }); }
 if(P.v8shield&&f.barrier&&f.barrier.kind==='shield'){ f.P.v8shield.scale.setScalar(1.6); } else if(P.v8shield) P.v8shield.scale.setScalar(1);
}
