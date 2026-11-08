/* =====================================================================
   SANDBOX 19 (Nov 8, 2026): FIGHT LAB. (v8.5: LIMB HITS moved into the game, 50-limb-hits.js; the test tools below stay sandbox-only.) Ideas taken from four open-source fighting projects
   (studied Nov 8; all ideas rebuilt in our own code, nothing pasted in):
   Fray (Godot combat framework, MIT), Mugen3D (3D fight engine, MIT), ThirdPersonSmashDemo (MIT),
   fighting-game-prototype (three.js, no license, ideas only).
   1. LIMB HITS (⚙ → LIMB HITS, on by default here). Claws, fists, feet, jaws, tails, swords and staffs
      have real hit points that move with the animation. A hit only lands if that body part actually
      sweeps through the rival during the move's active window (no more "rival is in a cone in front
      of me = hit"). Moves without a body part (beams, stomps, AoE magic) keep the old check.
      Before: most melee hits were a range + angle check, and many kept checking until the move ended,
      so late hits landed after the swing was over.
   2. HITBOX VIEW (⚙ → HITBOXES). Blue cylinders = where each titan can be hit. Small dots = the hit
      points on the body; they turn red while that part is active. Red wedge = an old-style cone check.
   3. FRAME DATA (⚙ → FRAME DATA, plus a line under the damage counter). Measured live from the moves
      as you play them: startup (frames until the hit lands), total length, and advantage on hit and
      on block (positive = you can act first). 60 frames = 1 second. Shows what is safe and what is not.
   4. MOVE MAP (⚙ → MOVE MAP). Every time one move cancels into another, the route is written down,
      so we can see every combo route a titan really has (Fray-style move map).
   Switch everything off with the ⚙ buttons to compare with the old feel.
   ===================================================================== */
Object.assign(SB,{limb:true, hbox:false});
// v8.5: the limb-hit code itself (LAB, LAB_LIMB, labLimbFor, labTouch, the coneHit / melee checks) moved into the game: game/tools/v8-src/50-limb-hits.js

/* ---------- frame data: measured from real play ---------- */
{ const oS=FP.startAtk; FP.startAtk=function(id){ const prev=this.atk; const r=oS.apply(this,arguments);
  if(prev&&this.atk&&this.atk!==prev&&prev.t<prev.dur){ const key=prev.id+'>'+id, M=LAB.map[this.def.id]=LAB.map[this.def.id]||{}; const e=M[key]=M[key]||{n:0,hit:0}; e.n++; if(prev.landed||prev.hit&&prev._bh) e.hit++; }
  return r; }; }
{ const oT=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){ const a=src&&src.def&&src.atk, wasBlock=!!this.blocking, hp0=this.hp;
  const r=oT.apply(this,arguments); if(this.hp<hp0||wasBlock) this._labFlash=game.time;
  if(a&&!cont&&!a._labC){ a._labC=1; const id=a.id, C=(LAB.cards[src.def.id]=LAB.cards[src.def.id]||{}), c=C[id]=C[id]||{n:0,su:0,tot:0,hit:[],blk:[]};
   c.n++; c.su=Math.round(a.t*60); c.tot=Math.round((a.dur||a.t)*60);
   const adv=Math.round(((this.stun||0)-Math.max(0,(a.dur||0)-a.t))*60); (wasBlock?c.blk:c.hit).push(adv); if(c.hit.length>8) c.hit.shift(); if(c.blk.length>8) c.blk.shift();
   if(src===game.p) LAB.last={id,su:c.su,tot:c.tot,adv,blk:wasBlock,part:LAB.hitPart}; LAB.hitPart=null; }
  return r; }; }
const labAvg=L=>L.length?Math.round(L.reduce((s,x)=>s+x,0)/L.length):null;
const labSign=v=>v===null?'-':(v>0?'+'+v:''+v);

/* ---------- hitbox view ---------- */
const LABV={hurt:new Map(), dots:[], wedge:new Map()};
function labCone(f,R0,arc){ if(!SB.hbox||SB.limb&&f.atk&&labLimbFor(f,f.atk.id)) return; let w=LABV.wedge.get(f);
 if(!w){ w=new THREE.Mesh(new THREE.CircleGeometry(1,24,0,1),new THREE.MeshBasicMaterial({color:0xff3b3b,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false})); w.rotation.x=-Math.PI/2; w.frustumCulled=false; scene.add(w); LABV.wedge.set(f,w); }
 const A=Math.min(arc,Math.PI), R=R0+f.opp.radius()*.5; w.geometry.dispose(); w.geometry=new THREE.CircleGeometry(R,24,f.yaw-Math.PI/2-A,2*A);
 w.position.set(f.pos.x,f.pos.y+.6,f.pos.z); w.visible=true; w._t=game.time; }
const LAB_DOT=new THREE.SphereGeometry(1,8,6);
function labDraw(){ const on=SB.hbox&&game.mode==='match'&&game.p; const F=on?[game.p,game.e]:[];
 for(const [f,m] of LABV.hurt) if(!on||!F.includes(f)){ m.visible=false; }
 for(const [f,w] of LABV.wedge) if(!on||game.time-w._t>.12) w.visible=false;
 let di=0;
 for(const f of F){ if(!f) continue; let m=LABV.hurt.get(f);
  if(!m){ m=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,16,1,true),new THREE.MeshBasicMaterial({color:0x3fa9ff,wireframe:true,transparent:true,opacity:.45,depthWrite:false})); m.frustumCulled=false; scene.add(m); LABV.hurt.set(f,m); }
  const R=f.radius(), y0=f.pos.y-1, y1=f.chest().y+6*f.scale; m.scale.set(R,y1-y0,R); m.position.set(f.pos.x,(y0+y1)/2,f.pos.z); m.visible=!f.hidden&&!f.dead;
  m.material.color.setHex(game.time-(f._labFlash||-9)<.15?0xffffff:0x3fa9ff);
  const a=f.atk, k=a?labLimbFor(f,a.id):null, act=a&&k&&(a.act||a._lab0!==undefined&&!a._labSeen&&a.t-a._lab0<=LAB.lateWin);
  for(const key of ['arms','legs','jaw','tail','sword','staff']){ const H=f._labH&&f._labH[key]; if(!H||!H[0]) continue;
   for(const p of H[0]){ let d=LABV.dots[di]; if(!d){ d=new THREE.Mesh(LAB_DOT,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthTest:false})); d.renderOrder=9; d.frustumCulled=false; scene.add(d); LABV.dots.push(d); }
    const hot=key===k&&act; d.material.color.setHex(hot?0xff3b3b:0xd8e6f2); d.material.opacity=hot?.95:.55; d.scale.setScalar((hot?1.1:.7)*f.scale); d.position.copy(p); d.visible=true; di++; } } }
 for(;di<LABV.dots.length;di++) LABV.dots[di].visible=false; }

/* ---------- ⚙ menu: buttons, frame data cards, move map ---------- */
function labName(id){ return MOVES[id]?MOVES[id].name:id; }
function labMenu(){ const m=el('sbMenu'); if(!m) return;
 if(!m.querySelector('[data-t=limb]')){ const row=[...m.querySelectorAll('.sec')].find(s=>s.querySelector('[data-t=slow]')); if(row){ const r=row.querySelector('.row');
   r.insertAdjacentHTML('beforeend','<button data-t="limb">LIMB HITS</button><button data-t="hbox">HITBOXES</button>'); }
  const kit=el('sbKit'); if(kit) kit.closest('.sec').insertAdjacentHTML('afterend','<div class="sec"><div class="lbl">FRAME DATA (60 = 1 second · + = you act first)</div><div id="sbFrames"></div></div><div class="sec"><div class="lbl">MOVE MAP (routes you used)</div><div id="sbMap"></div></div>'); }
 const p=game.p; if(!p) return; const C=LAB.cards[p.def.id]||{}, ids=Object.keys(C);
 const fr=el('sbFrames'); if(fr) fr.innerHTML=ids.length?`<table class="sbFd"><tr><th>MOVE</th><th>STARTUP</th><th>TOTAL</th><th>ON HIT</th><th>ON BLOCK</th></tr>${ids.map(id=>{ const c=C[id]; return `<tr><td>${labName(id)}</td><td>${c.su}f</td><td>${c.tot}f</td><td>${labSign(labAvg(c.hit))}</td><td>${labSign(labAvg(c.blk))}</td></tr>`; }).join('')}</table>`:'<div style="color:#9fb3c8;font-size:11px">Hit the dummy and each move shows up here. Set the dummy to BLOCK to see on-block numbers.</div>';
 const M=LAB.map[p.def.id]||{}, ks=Object.keys(M); const mp=el('sbMap');
 if(mp) mp.innerHTML=ks.length?ks.map(k=>{ const [a,b]=k.split('>'), e=M[k]; return `<div>${labName(a)} → ${labName(b)} <span style="color:#9fb3c8">×${e.n}${e.hit===e.n?' · on hit':e.hit?' · '+e.hit+' on hit':' · on whiff'}</span></div>`; }).join(''):'<div style="color:#9fb3c8;font-size:11px">Cancel one move into another and the route shows up here.</div>'; }
{ const s=document.createElement('style'); s.textContent='.sbFd{width:100%;border-collapse:collapse;font-size:11px}.sbFd th{color:#9fb3c8;text-align:left;font-weight:normal;padding:2px 4px}.sbFd td{padding:2px 4px;border-top:1px solid #24364a}#sbInfo .fd{color:#9fb3c8;font-size:10px}'; document.head.appendChild(s); }
{ const o=sbBase.menuOpen; sbBase.menuOpen=function(on){ o(on); if(on){ labMenu(); sbSync(); } }; }
{ const o=sbBase.sync; sbBase.sync=function(){ o(); labMenu(); }; }
{ const o=sbBase.reset; sbBase.reset=function(){ o(); LAB.last=null; }; }
// under the damage counter: the last move's frame data; and draw the hitbox view every frame
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ labDraw(); const i=el('sbInfo'), L=LAB.last;
   if(i&&SB.showDmg&&L&&!i.querySelector('.fd')) i.insertAdjacentHTML('beforeend',`<br><span class="fd">${labName(L.id)}: ${L.su}f startup · ${labSign(L.adv)} on ${L.blk?'block':'hit'}${L.part&&SB.limb?' · '+L.part:''}</span>`);
   if(SB.menu&&Math.random()<.1) labMenu(); }catch(e){ console.error(e); } }; }

/* ---------- Sandbox 19b (Nov 8, 2026): phone, the damage / frame data box moves out of the way ----------
   MajorasPride (phone screenshot): the box sat on top of STANCE / SUPER / LOCK. "I don't need this for mobile
   unless it's off to the side and fades away." Phone landscape only (PC unchanged):
   - small, no background, on the left under the ARMOR / RAGE rows (nothing there covers a button)
   - shows when a hit lands, then fades out after 1.5 seconds
   - the move-name line is dropped on phone (the frame data line already names the move) */
{ const s=document.createElement('style'); s.textContent=`
@media (pointer:coarse) and (max-height:520px){
 #sbInfo{left:90px!important;right:auto!important;top:124px!important;text-align:left!important;background:none!important;border:none!important;padding:0!important;
  text-shadow:0 1px 2px #000,0 0 4px #000;max-width:45vw;transition:opacity .5s ease-out}
 #sbInfo,#sbInfo b{font-size:8px!important;line-height:1.5!important}
 #sbInfo .big{font-size:10px!important}
 #sbInfo .mv{display:none}
 #sbInfo .fd{font-size:7px!important}
 #sbInfo.labFade{opacity:0}
}`; document.head.appendChild(s); }
const LABF={t:-99, k:''};
{ const o=updateHUD; updateHUD=function(dt){ o(dt); try{ const i=el('sbInfo'); if(!i) return; const C=SB.combo||{}, k=(C.t||0)+'|'+(C.n||0);
   if(k!==LABF.k){ LABF.k=k; LABF.t=performance.now(); }
   i.innerHTML=i.innerHTML.replace(/<br>([^<]*<b>[^<]*<\/b>)/,'<br><span class="mv">$1</span>');
   i.classList.toggle('labFade',performance.now()-LABF.t>1500&&!SB.menu); }catch(e){} }; }

/* ---------- Sandbox 19c (Nov 8, 2026): phone, even smaller ----------
   MajorasPride: "still in the way, move it off the buttons, a lot smaller and faded. I can't see the match or buttons."
   Any touch screen now (not only short screens): ONE tiny faded line on the left under ARMOR / RAGE,
   e.g. "8 DMG · 1 HIT · Claw 18f -14". It fades out 1.5s after the last hit. PC unchanged. */
const LAB_PHONE=matchMedia('(pointer:coarse)').matches||('ontouchstart' in window);
if(LAB_PHONE){ document.body.classList.add('labPhone'); const s=document.createElement('style'); s.textContent=`
 body.labPhone #sbInfo{left:90px!important;right:auto!important;top:124px!important;bottom:auto!important;text-align:left!important;background:none!important;border:none!important;
  padding:0!important;max-width:40vw;white-space:nowrap;overflow:hidden;opacity:.6;transition:opacity .5s ease-out;text-shadow:0 1px 2px #000}
 body.labPhone #sbInfo,body.labPhone #sbInfo *{font:7px/1.3 'Press Start 2P',monospace!important;color:#cfe3f5!important}
 body.labPhone #sbInfo.labFade{opacity:0!important}`; document.head.appendChild(s); }
{ const o=updateHUD; updateHUD=function(dt){ o(dt); if(!LAB_PHONE) return; try{ const i=el('sbInfo'); if(!i||!SB.showDmg) return; const C=SB.combo||{}, live=C.n&&game.time-C.t<1.6, L=LAB.last;
   i.textContent=(live?Math.round(C.dmg)+' DMG · '+C.n+(C.n>1?' HITS':' HIT'):'')+(L?(live?' · ':'')+labName(L.id)+' '+L.su+'f '+labSign(L.adv):''); }catch(e){} }; }
