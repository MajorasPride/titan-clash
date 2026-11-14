/* =====================================================================
   SANDBOX 27 (Nov 13, 2026, ticket T050): KIT BODIES. The 2.0 Blender kits become the real 3D bodies of the core six.
   VALOR, ASHVIN, RAIKOU (mech kit + weapons kit), INFERNOTH (kaiju kit), RAGNAVOX (hydra kit, three heads, wings as arms)
   and WORLDROOT (tree shepherd kit). Sandbox only: the game file is not touched.
   How it works:
   - The game still builds its old body first, with the same joints (torso, head, jaw, arms, elbows, hands, legs, knees, tail).
     Then this hides the old shapes, moves each joint to where the kit puts it (the kit's plugs) and hangs the kit part on that joint.
     So every move, pose and ultimate still drives the new body.
   - Build sheets (which part on which plug and joint) and the part data are in 27-kit-bodies-data.js, written by
     sandbox/tools/kit_bodies_data.py from the kit json files.
   - KIT HITBOXES: each kit part brings its hitbox (a box on the part). A limb hit (claw, fist, foot, jaw, tail, sword, staff)
     lands only if it sweeps through one of the rival's part boxes, not just a cylinder around him.
   - LIMB DAMAGE: the damage of a hit is counted on the body part it landed on (head, body, each arm / wing, each leg, tail).
     A part that has taken 10% of the titan's health looks scorched, at 22% badly scorched, with sparks and a callout.
     Looks only for now: no stat changes (the behaviours pass T052 decides what a damaged limb does).
   - ⚙ menu, section 2.0 KIT BODIES: KIT BODIES ↻, KIT HITBOXES, LIMB DAMAGE, SHOW KIT HITBOXES.
   - RAIKOU, RAGNAVOX and WORLDROOT can be picked as YOU or DUMMY here (they stay hidden / off the roster in the game).
     WORLDROOT has no kit of moves yet (his old moves are archived): he uses the basic kaiju attacks.
   ===================================================================== */
const KB={on:true, hit:true, limb:true, show:false, pad:1.1, ids:['valor','ashvin','raikou','infernoth','ragnavox','worldroot'], geo:{}, log:[]};
const KB_LIMB_NAME={head:'HEAD', body:'BODY', armR:'RIGHT ARM', armL:'LEFT ARM', legR:'RIGHT LEG', legL:'LEFT LEG', tail:'TAIL'};
{
  const X=new THREE.Vector3(1,0,0), Y=new THREE.Vector3(0,1,0), Z=new THREE.Vector3(0,0,1), RAD=Math.PI/180;
  // kit angles (degrees, Blender XYZ) -> three.js turn: Blender x = three x, Blender y = three -z, Blender z = three y
  const rotQ=r=>{ const e=(ax,a)=>new THREE.Quaternion().setFromAxisAngle(ax,a*RAD); return e(Y,r[2]||0).multiply(e(Z,-(r[1]||0))).multiply(e(X,r[0]||0)); };
  const geoOf=(ref,i)=>{ const k=ref+'|'+i; if(KB.geo[k]) return KB.geo[k]; const bin=atob(KB_DATA.parts[ref].m[i][1]), n=bin.length>>1, a=new Float32Array(n);
    for(let j=0;j<n;j++){ let v=bin.charCodeAt(j*2)|(bin.charCodeAt(j*2+1)<<8); if(v>32767) v-=65536; a[j]=v/200; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(a,3)); g.computeVertexNormals(); return KB.geo[k]=g; };
  const GLOWKEY={glow:1,eye:1,crystal:1,fire:1,storm:1,venom:1};
  const hex=n=>'#'+(n>>>0).toString(16).padStart(6,'0');
  function matsFor(spec,d,b){ const [kit,name]=spec.scheme, S=KB_DATA.schemes, W=S.weapons||{base:{},all:{}};
    const sch=Object.assign({},W.base,S[kit].base,W.all[name]||{},S[kit].all[name]||{});
    if(name==='def') Object.assign(sch,{armor:hex(d.color),armor2:hex(d.accent),accent:hex(d.trim||d.glow),accent2:hex(d.accent),frame:'#3b414d',joint:'#252a33'});
    const mech=kit==='mech', cache={}, G=b.glowMats||[];
    const own={fire:0xff6a1a,storm:0x8fd8ff,venom:0x9dff5a};
    return key=>{ if(cache[key]) return cache[key]; let m;
      if(GLOWKEY[key]){ m=own[key]?glowM(own[key],1.6):key==='eye'?(G[1]||G[0]||glowM(d.glow,2)):(G[0]||glowM(d.glow,2)); m.userData.kbGlow=1; }
      else { m=std(new THREE.Color(sch[key]||'#8a8f98').getHex(),.62,mech||key==='blade'?.45:.06); m.flatShading=true; }
      return cache[key]=m; }; }
  const jointOf=(b,name)=>{ const P=b.P; if(name==='body') return b.body; const t=/^tail(\d+)$/.exec(name);
    if(t) return Array.isArray(P.tail)&&P.tail.length?P.tail[Math.min(+t[1],P.tail.length-1)]:P.torso;
    const s=/^side(\d)$/.exec(name); if(s){ P._kbSide=P._kbSide||[]; if(!P._kbSide[+s[1]]){ const g=new THREE.Group(); P.torso.add(g); P._kbSide[+s[1]]=g; } return P._kbSide[+s[1]]; }
    return P[name]||P.torso; };
  const jname=(b,name)=>{ const t=/^tail(\d+)$/.exec(name); return t&&Array.isArray(b.P.tail)&&b.P.tail.length?'tail'+Math.min(+t[1],b.P.tail.length-1):name; };
  const limbOf=jn=>/^(head|jaw|side)/.test(jn)?'head':/^(arm|el|hand)/.test(jn)?'arm'+jn.slice(-1):/^(leg|kn)/.test(jn)?'leg'+jn.slice(-1):/^tail/.test(jn)?'tail':'body';
  const left=jn=>/^(arm|el|hand|leg|kn)R$/.test(jn)?jn.slice(0,-1)+'L':jn;

  // 1. lay the figure out in kit units (right side + centre line only; the left side is the mirror)
  function layout(spec,b){ const nodes=[]; b.root.updateMatrixWorld(true);
    const jq=jn=>{ const q=new THREE.Quaternion(); jointOf(b,jn).getWorldQuaternion(q); return q; };
    const place=(ref,jn,q,pos,s,sided,par,fill)=>{ const nd={ref,part:KB_DATA.parts[ref],jn,q,pos,s,sided,par,fill,pivot:!par||par.jn!==jn}; nodes.push(nd); return nd; };
    const fills=(nd,usedPlugs)=>{ if(!spec.fill) return; for(const [pn,pl] of Object.entries(nd.part.plugs)){ if(usedPlugs[pn]) continue; const key=Object.keys(spec.fill).find(k=>pn===k||pn.startsWith(k+'_')); if(!key) continue;
        const dir=new THREE.Vector3(pl[3],pl[4],pl[5]).normalize(), q=nd.q.clone().multiply(new THREE.Quaternion().setFromUnitVectors(Y,dir));
        const f=place(spec.fill[key],nd.jn,q,nd.pos.clone().add(new THREE.Vector3(pl[0],pl[1],pl[2]).multiplyScalar(nd.s).applyQuaternion(nd.q)),nd.s*(pl[6]||1),nd.sided,nd,true); fills(f,{}); } };
    (function go(n,par,pos,sided){ const part=KB_DATA.parts[n.p]; if(!part){ KB.log.push('missing part '+n.p); return; }
      sided=sided||!!n.both; const jn=jname(b,n.j?n.j.replace('*','R'):par.jn), same=par&&par.jn===jn;
      const q=(same?par.q.clone():jq(jn)).multiply(rotQ(n.rot||[0,0,0])), nd=place(n.p,jn,q,pos,(par?par.s:1)*(n.s||1),sided,par,false), used={};
      for(const [pn,kid] of Object.entries(n.kids||{})){ if(!kid) continue; const pl=part.plugs[pn]; if(!pl){ KB.log.push(n.p+' has no plug '+pn); continue; } used[pn]=1; const tw=pn.replace(/_R$/,'_L'); used[tw]=1;
        go(kid,nd,nd.pos.clone().add(new THREE.Vector3(pl[0],pl[1],pl[2]).multiplyScalar(nd.s).applyQuaternion(nd.q)),sided); }
      fills(nd,used); })(spec.tree,null,new THREE.Vector3(),false);
    return nodes; }
  const corners=(nd,fn)=>{ const h=nd.part.hb; for(const sx of [-1,1]) for(const sy of [-1,1]) for(const sz of [-1,1])
    fn(new THREE.Vector3(h[0]+sx*h[3]/2,h[1]+sy*h[4]/2,h[2]+sz*h[5]/2).multiplyScalar(nd.s).applyQuaternion(nd.q).add(nd.pos)); };

  // 2. put it on the game's joints
  function dress(b,d){ const spec=KB_DATA.specs[d.id], P=b.P; if(!spec||!P||!P.torso) return;
    b.root.updateMatrixWorld(true);
    const oldTop=new THREE.Box3().setFromObject(P.head||P.torso).max.y, oldLeg=P.legR?P.legR.getWorldPosition(new THREE.Vector3()):new THREE.Vector3();
    const nodes=layout(spec,b); let lo=1e9, hi=-1e9; for(const nd of nodes) if(!nd.fill) corners(nd,p=>{ lo=Math.min(lo,p.y); hi=Math.max(hi,p.y); });
    const tor=nodes.find(n=>n.jn==='torso'), leg=nodes.find(n=>n.jn==='legR'); let S, off;
    if(spec.fit==='torso'){ S=6.8/(tor.pos.y-lo); off=new THREE.Vector3(tor.pos.x,lo,tor.pos.z); }      // mechs: the game keeps the torso joint 6.8 up
    else { S=Math.max(4,oldTop)/(hi-lo); off=new THREE.Vector3(0,lo,leg?leg.pos.z-oldLeg.z/S:0); }      // as tall as the old body, feet on the ground, legs under him
    const W=nd=>nd.pos.clone().sub(off).multiplyScalar(S);
    b.body.traverse(o=>{ if(o.isMesh){ o.visible=false; o.userData.kbOld=1; } });
    // joints, parents first
    for(const nd of nodes){ if(!nd.pivot||nd.jn==='body'||(spec.fit==='torso'&&nd.jn==='torso')) continue;
      for(const L of nd.sided?[0,1]:[0]){ const j=jointOf(b,L?left(nd.jn):nd.jn), w=W(nd); if(L) w.x=-w.x; if(!j||!j.parent||j===b.body) continue;
        b.root.updateMatrixWorld(true); j.position.copy(j.parent.worldToLocal(w)); if(nd.jn==='hips') P.hipY=j.position.y;
        if(/^side/.test(nd.jn)){ const pq=new THREE.Quaternion(); j.parent.getWorldQuaternion(pq); j.quaternion.copy(pq.invert().multiply(nd.q)); nd.q0=true; } } }
    b.root.updateMatrixWorld(true);
    // parts
    const mat=matsFor(spec,d,b), kb=P._kb={S, id:d.id, hb:[], limbG:{}, dmg:{}, stage:{}, mat, tips:{arms:[],legs:[],jaw:[],tail:[]}};
    const F=new THREE.Matrix4().makeScale(-1,1,1), one=new THREE.Vector3();
    for(const nd of nodes) for(const L of nd.sided?[0,1]:[0]){ const jn=L?left(nd.jn):nd.jn, j=jointOf(b,jn); if(!j) continue;
      const M=new THREE.Matrix4().compose(W(nd),nd.q,one.set(1,1,1).multiplyScalar(nd.s*S)); if(L) M.premultiply(F);
      const g=new THREE.Group(); new THREE.Matrix4().copy(j.matrixWorld).invert().multiply(M).decompose(g.position,g.quaternion,g.scale); j.add(g); g.userData.kb=nd.ref;
      nd.part.m.forEach((mm,i)=>{ const m=new THREE.Mesh(geoOf(nd.ref,i),mat(mm[0])); m.castShadow=true; m.receiveShadow=true; m.userData.kbMesh=1; g.add(m); outline(m,nd.s*S); });
      const limb=limbOf(jn); (kb.limbG[limb]=kb.limbG[limb]||[]).push(g);
      if(!nd.fill){ const h=nd.part.hb, c=new THREE.Vector3(h[0],h[1],h[2]), hf=new THREE.Vector3(h[3]/2,h[4]/2,h[5]/2); kb.hb.push({g,c,h:hf,limb,name:nd.part.name});
        const bx=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(h[3],h[4],h[5])),new THREE.LineBasicMaterial({color:limb==='body'?0x66d9ff:limb==='head'?0xff5a5a:0xffd43b})); bx.position.copy(c); bx.visible=KB.show; bx.userData.kbBox=1; g.add(bx);
        const tip=new THREE.Object3D(); tip.position.copy(c); g.add(tip); const sl=nd.part.slot;
        if(/^hand/.test(jn)||(/^el/.test(jn)&&/hand|wing_out/.test(sl))) kb.tips.arms.push(tip); else if(/^kn/.test(jn)&&sl==='foot') kb.tips.legs.push(tip);
        else if(jn==='jaw') kb.tips.jaw.push(tip); else if(/^tail/.test(jn)) kb.tips.tail.push(tip); } }
    if(kb.tips.jaw.length&&P.head) kb.tips.jaw.push(P.head); kb.tips.tail=kb.tips.tail.slice(-3);
    if(!kb.tips.arms.length) for(const k of ['elR','elL']){ const hb=kb.hb.filter(x=>x.g.parent===P[k]).pop(); if(hb){ const t=new THREE.Object3D(); t.position.copy(hb.c); hb.g.add(t); kb.tips.arms.push(t); } }
    // RAIKOU's katana from the weapons kit (blade along -y of its grip, like the old one)
    if(P.katana&&spec.weapons&&spec.weapons.katana) weapon(P.katana,spec.weapons.katana,kb,10,[0,0,Math.PI]);
    KB.last={id:d.id,S:+S.toFixed(3),parts:nodes.length,boxes:kb.hb.length}; }
  function weapon(parent,ref,kb,len,rot){ const part=KB_DATA.parts[ref]; if(!part) return null; const g=new THREE.Group(); g.scale.setScalar(len/Math.max(part.hb[3],part.hb[4],part.hb[5])); if(rot&&rot.length===9) g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(rot[0],rot[1],rot[2]),new THREE.Vector3(rot[3],rot[4],rot[5]),new THREE.Vector3(rot[6],rot[7],rot[8]))); else if(rot) g.rotation.set(rot[0],rot[1],rot[2]); parent.add(g);
    part.m.forEach((mm,i)=>{ const m=new THREE.Mesh(geoOf(ref,i),kb.mat(mm[0])); m.castShadow=true; m.userData.kbMesh=1; g.add(m); outline(m,g.scale.x); }); return g; }
  // ink outline at the same thickness as the old bodies (the kit parts are scaled up, so the game's own pass would draw it too thick)
  function outline(m,sc){ if(!SET.toon||typeof hullFor!=='function') return; const mt=m.material; if(mt.userData&&mt.userData.base!=null) return; try{ hullFor(m,.2/Math.max(.2,Math.abs(sc))); }catch(e){} }
  { const oA=addOutlines; addOutlines=function(root,t){ const mine=[]; root.traverse(o=>{ if(o.isMesh&&o.userData.kbMesh&&!o.userData.hull){ o.userData.hull=true; mine.push(o); } });
      try{ return oA.apply(this,arguments); } finally{ for(const o of mine) delete o.userData.hull; } }; }
  const hideAll=g=>g.traverse(o=>{ if(o.isMesh&&!o.userData.hull){ o.visible=false; o.userData.kbOld=1; } });

  { const oM=buildMech; buildMech=function(d){ const b=oM(d); if(KB.on&&b&&KB_DATA.specs[d.id]) try{ dress(b,d); }catch(e){ KB.log.push(d.id+': '+e.message); console.error(e); } return b; }; }
  { const oK=buildKaiju; buildKaiju=function(d){ const b=oK(d); if(KB.on&&b&&KB_DATA.specs[d.id]) try{ dress(b,d); }catch(e){ KB.log.push(d.id+': '+e.message); console.error(e); } return b; }; }
  // after the game has dressed the fighter: VALOR's sword and shield from the weapons kit, RAGNAVOX's side heads on their necks
  function kbAfter(f){ const P=f.P, kb=P&&P._kb; if(!kb||f._kbAfter) return; f._kbAfter=1; const spec=KB_DATA.specs[kb.id], w=spec.weapons||{};
    if(w.sword&&P.v8sword){ hideAll(P.v8sword); weapon(P.v8sword,w.sword,kb,9.4,[0,0,Math.PI]); if(P.v8swordBack){ hideAll(P.v8swordBack); weapon(P.v8swordBack,w.sword,kb,9.4,[0,0,Math.PI]); } }
    if(w.shield&&P.v8shield){ hideAll(P.v8shield); weapon(P.v8shield,w.shield,kb,5.2,[0,0,-1, -1,0,0, 0,1,0]); /* kit shield: face = +y, point = -z -> face out to his left, point down */ }
    if(P.extraHeads&&P._kbSide) P.extraHeads.forEach((c,i)=>{ const s=P._kbSide[i]; if(!s) return; c.traverse(m=>{ if(m.isMesh||m.isLineSegments) m.visible=false; }); c.position.copy(s.position); c.quaternion.copy(s.quaternion); c.scale.setScalar(1); }); }
  { const oD=v8Dress; v8Dress=function(f){ oD(f); try{ kbAfter(f); }catch(e){ KB.log.push('after: '+e.message); } }; }

  /* ---------- kit hitboxes drive the limb hits ---------- */
  const tmp=new THREE.Vector3(), tsc=new THREE.Vector3();
  function kbHitAt(o,kb,q,pad){ for(const hb of kb.hb){ hb.g.getWorldScale(tsc); const pl=pad/Math.max(1e-6,Math.abs(tsc.y)); tmp.copy(q); hb.g.worldToLocal(tmp);
      if(Math.abs(tmp.x-hb.c.x)<=hb.h.x+pl&&Math.abs(tmp.y-hb.c.y)<=hb.h.y+pl&&Math.abs(tmp.z-hb.c.z)<=hb.h.z+pl) return hb; } return null; }
  KB.hitAt=kbHitAt;
  { const oT=labTips; labTips=function(f){ if(f._labT) return f._labT; const T=oT(f), kb=f.P&&f.P._kb; if(kb) for(const k of ['arms','legs','jaw','tail']) if(kb.tips[k].length) T[k]=kb.tips[k]; return T; }; }
  { const oL=labTouch; labTouch=function(f,o,k){ const kb=o&&o.P&&o.P._kb; if(!KB.hit||!kb) return oL(f,o,k);
      const H=(f._labH&&f._labH[k])||[]; if(!H.length) H.push(labPts(f,k)); const pad=KB.pad*f.scale;
      const ok=q=>{ const hb=kbHitAt(o,kb,q,pad); if(hb){ o._kbLimb=hb.limb; o._kbPart=hb.name; o._kbT=game.time; KB.lastHit={on:o.def.id,limb:hb.limb,part:hb.name}; } return !!hb; };
      for(let i=0;i<H.length;i++){ const A=H[i], B=H[i+1]; for(let j=0;j<A.length;j++){ if(ok(A[j])) return A[j]; if(B&&B[j]) for(const s of [.33,.66]){ const q=A[j].clone().lerp(B[j],s); if(ok(q)) return q; } } }
      return null; }; }

  /* ---------- limb damage: the hit's damage is counted on the part it landed on ---------- */
  const darkCache={};
  const darker=(m,st)=>{ const k=m.uuid+'|'+st; if(!darkCache[k]){ const c=m.clone(); c.color.multiplyScalar(st>1?.38:.62); c.flatShading=true; c.userData.kbDark=st; darkCache[k]=c; } return darkCache[k]; };
  function kbLimbDmg(f,kb,limb,d){ kb.dmg[limb]=(kb.dmg[limb]||0)+d; const r=kb.dmg[limb]/(f.def.hp||1000), st=r>=.22?2:r>=.1?1:0; if(st<=(kb.stage[limb]||0)) return; kb.stage[limb]=st;
    for(const g of kb.limbG[limb]||[]) g.traverse(m=>{ if(m.isMesh&&!m.userData.hull&&!m.material.userData.kbGlow){ m.userData.kbBase=m.userData.kbBase||m.material; m.material=darker(m.userData.kbBase,st); } });
    const g0=(kb.limbG[limb]||[])[0]; if(g0&&typeof burst==='function'){ const p=new THREE.Vector3(); g0.getWorldPosition(p); burst(p,0xffb347,st>1?34:18,st>1?20:13); }
    const nm=kb.id==='ragnavox'&&/^arm/.test(limb)?(limb==='armR'?'RIGHT WING':'LEFT WING'):KB_LIMB_NAME[limb];
    if(typeof toast==='function') toast(f.def.name+': '+nm+(st>1?' BADLY DAMAGED':' DAMAGED'),st>1?'#ff5a5a':'#ffb347',1100); }
  KB.limbDmg=kbLimbDmg;
  { const oH=FP.takeHit; FP.takeHit=function(){ const hp0=this.hp, r=oH.apply(this,arguments), kb=this.P&&this.P._kb;
      if(kb){ const limb=this._kbLimb&&Math.abs(game.time-this._kbT)<.1?this._kbLimb:null; this._kbLimb=null; const d=hp0-this.hp; if(KB.limb&&limb&&d>0) try{ kbLimbDmg(this,kb,limb,d); }catch(e){} }
      return r; }; }
}

/* ---------- RAIKOU, RAGNAVOX and WORLDROOT in the sandbox lists ---------- */
const KB_WORLDROOT={id:'worldroot',name:'WORLDROOT',type:'kaiju',kbody:'tree',tag:'Elder world-tree titan from the stars. Grass and time magic. Sees the future.',color:0x6b5a48,accent:0x3f8a3a,glow:0x9dffb0,css:'#9dffb0',beam:'Future Portal',superName:'RAGNAROK BLOOM',ultName:'RAGNAROK BLOOM',altColor:0x6b5a48,altScale:1,cls:'MYSTIC',code:'K-03 "ORACLE"',origin:'ALIEN'};
{ const oG=getDef; getDef=function(id){ const h=(typeof HIDDEN_DEFS!=='undefined'?HIDDEN_DEFS:[]).find(d=>d.id===id); if(h) return h;
    if(id==='worldroot'){ const base=ROSTER.find(d=>d.id==='infernoth')||ROSTER[0]; return KB.wr=KB.wr||Object.assign({},base,KB_WORLDROOT); } return oG(id); }; }
try{ if(typeof LORE!=='undefined'&&!LORE.worldroot) LORE.worldroot=Object.assign({},LORE.infernoth,{lines:['THE ELDER TREE WALKS: WORLDROOT SEEN OVER NEON CITY','WORLDROOT STIRS. FORESTS ARE GROWING OVERNIGHT']}); }catch(e){}
{ const oA=allDefs; allDefs=function(){ const L=oA().slice(); for(const id of ['raikou','ragnavox','worldroot']) if(!L.some(d=>d.id===id)) L.push(getDef(id)); return L; }; }   // so the sandbox can start a fight against them
for(const id of ['raikou','ragnavox','worldroot']){ if(!SB_PLAY.includes(id)) SB_PLAY.push(id); if(!SB_DUMMIES.includes(id)) SB_DUMMIES.push(id); }

/* ---------- ⚙ menu ---------- */
const KBSW=[
 ['KIT BODIES',()=>KB.on,v=>{ KB.on=v; sbStart(); },1],
 ['KIT HITBOXES',()=>KB.hit,v=>{ KB.hit=v; }],
 ['LIMB DAMAGE',()=>KB.limb,v=>{ KB.limb=v; }],
 ['SHOW KIT HITBOXES',()=>KB.show,v=>{ KB.show=v; for(const f of [game.p,game.e]) if(f&&f.root) f.root.traverse(o=>{ if(o.userData.kbBox) o.visible=v; }); }]];
function kbUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-kb]')) return; const kit=el('sbKit'); if(!kit) return;
 const d=document.createElement('div'); d.className='sec';
 d.innerHTML=`<div class="lbl">2.0 KIT BODIES (the core six rebuilt from the Blender kits · ↻ restarts the fight)</div><div class="row">${KBSW.map((c,i)=>`<button data-kb="${i}">${c[0]}${c[3]?' ↻':''}</button>`).join('')}</div>`;
 kit.closest('.sec').parentNode.insertBefore(d,kit.closest('.sec'));
 d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation(); const c=KBSW[+b.dataset.kb], v=!c[1]();
  c[2](v); toast(c[0]+': '+(v?'ON':'OFF'),'#7fd4ff',800); if(c[3]) sbMenuOpen(true); kbSync(); }); }
function kbSync(){ document.querySelectorAll('#sbMenu [data-kb]').forEach(b=>b.classList.toggle('on',!!KBSW[+b.dataset.kb][1]())); }
{ const oS=sbStart; sbStart=function(){ oS(); kbUI(); kbSync(); }; }
{ const oS=sbSync; sbSync=function(){ oS(); kbUI(); kbSync(); }; }
