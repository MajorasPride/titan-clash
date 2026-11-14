// ====================================================================== 🫧 Soft move = proportional edit (T036, Nov 13 2026; Blender's idea, our own code)
// Turn it on, then move something: things near it move too, less the further away they are, out to the Reach.
//  - ✋ Move & size: dragging a part (✋ Drag or 🎯 Arrows "Move") also moves nearby parts. Plugged parts that are moved get unplugged
//    (the same as moving one by hand); parts plugged onto a moved part follow it. Twins (🪞) follow on the other side.
//  - 🗿 Sculpt › 🔷 Low-poly: pick faces, then DRAG one of the orange faces (new) or use the arrow / Bigger / Smaller / Tilt / Twist buttons:
//    nearby points move softly. 🪞 Mirror on a low-poly part keeps working (middle points stay in the middle).
// Reach (radius, in world units) + falloff shape (Smooth, Sharp, Linear, Constant) are shared by both, saved on this device (mf-prop).
// Phone: a small dock shows a Reach drag pad (drag up = bigger) while Soft move is on. A see-through ball shows the Reach.
// Built into the module after forge-m.js by build.py, so it uses the core's own functions (no globals needed).
{
  const PLS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; };
  const PF = {smooth: '〰 Smooth', sharp: '📌 Sharp', linear: '📐 Linear', constant: '▬ Constant'}, PFK = Object.keys(PF);
  const PR = {on: false, r: 1.5, f: 'smooth'};
  try { const s = JSON.parse(PLS('mf-prop') || 'null'); if (s) { PR.r = Math.min(6, Math.max(.1, +s.r || 1.5)); if (PF[s.f]) PR.f = s.f; PR.on = !!s.on; } } catch (e) {}
  const psave = () => PLS('mf-prop', JSON.stringify(PR));
  // weight for a distance d: 1 at the grabbed thing, 0 at the Reach
  const fall = d => { if (d >= PR.r) return 0; const t = d / PR.r, u = 1 - t;
    return PR.f === 'sharp' ? u * u : PR.f === 'linear' ? u : PR.f === 'constant' ? 1 : u * u * (3 - 2 * u); };
  window.mfPropW = fall;

  // ---- the Reach ball
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({color: 0x8fd0ff, wireframe: true, transparent: true, opacity: .22, depthTest: false, depthWrite: false}));
  ball.raycast = () => {}; ball.renderOrder = 9; ball.visible = false; scene.add(ball); let ballT = 0;
  function ballAt(c, ms = 1200) { if (!c) return; ball.position.copy(c); ball.scale.setScalar(PR.r); ball.visible = true; clearTimeout(ballT); if (ms) ballT = setTimeout(() => { ball.visible = false; }, ms); }
  function ballCenter() {
    if (tab === 'sculpt' && lpMode) { const pt = lpPart(); if (!pt || !views[pt.uid] || !lpSel.size) return null; const poly = lpGet(pt), ids = lpVerts(poly); if (!ids.length) return null;
      const mw = views[pt.uid].meshes[0].matrixWorld, c = new THREE.Vector3(); ids.forEach(i => c.add(new THREE.Vector3(...poly.v[i]).applyMatrix4(mw))); return c.multiplyScalar(1 / ids.length); }
    const v = views[sel]; return v ? v.G.getWorldPosition(new THREE.Vector3()) : null; }

  // ---- UI: one row in ✋ Move & size and one in the 🔷 Low-poly box (same settings)
  const rows = [];
  function mkRow() { const row = document.createElement('div'); row.className = 'propbox';
    row.innerHTML = '<div class="row"><button class="pOn">🫧 Soft move: off</button><button class="pF">〰 Smooth</button></div>' +
      '<div class="sl"><span>Reach</span><input class="pR" type="range" min=".1" max="6" step=".05"><span class="pV"></span></div>';
    row.querySelector('.pOn').onclick = () => setOn(!PR.on);
    row.querySelector('.pF').onclick = () => { PR.f = PFK[(PFK.indexOf(PR.f) + 1) % PFK.length]; psave(); ui(); tip('Soft move falloff: ' + PF[PR.f] + (PR.f === 'constant' ? ' (everything in reach moves the same)' : PR.f === 'sharp' ? ' (only close things move much)' : ''), 2000); };
    const r = row.querySelector('.pR'); r.oninput = () => { PR.r = +r.value; psave(); ui(); ballAt(ballCenter()); };
    rows.push(row); return row; }
  function setOn(on) { PR.on = on; psave(); ui(); if (on) { tip('🫧 Soft move on: move a part (or low-poly faces) and things nearby follow softly, out to the Reach ball', 3200); ballAt(ballCenter(), 1800); } else { tip('Soft move off', 1200); ball.visible = false; } }
  function ui() { rows.forEach(row => { const b = row.querySelector('.pOn'); b.textContent = '🫧 Soft move: ' + (PR.on ? 'on' : 'off'); b.classList.toggle('on', PR.on);
      row.querySelector('.pF').textContent = PF[PR.f]; row.querySelector('.pF').style.display = row.querySelector('.sl').style.display = PR.on ? '' : 'none';
      const r = row.querySelector('.pR'); if (document.activeElement !== r) r.value = PR.r; row.querySelector('.pV').textContent = PR.r.toFixed(2); });
    if (dock) dockUI(); }
  { const sz = $('sSize'), slEl = sz && sz.closest('.sl'); if (slEl) slEl.after(mkRow()); const lpS = $('sLP'), lpSl = lpS && lpS.closest('.sl'); if (lpSl) lpSl.after(mkRow()); }

  // ---- phone dock (only on the phone layout, only while Soft move is on in ✋ Move & size or 🔷 Low-poly)
  const st = document.createElement('style'); st.textContent = `
  #pdock{position:fixed;left:6px;bottom:calc(68px + env(safe-area-inset-bottom));z-index:5;display:none;flex-direction:column;gap:6px;align-items:center;touch-action:none;user-select:none;-webkit-user-select:none}
  body.sdockR #pdock{left:auto;right:6px} body.pdockOn #pdock{display:flex} body.mup #pdock,body.guiding #pdock,body.full #pdock{display:none}
  #pdock button{width:54px;min-height:46px;padding:2px;border-radius:14px;font:700 10px/1.1 system-ui;background:rgba(40,40,50,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
  #pdock button i{font-style:normal;font-size:19px;line-height:1} #pdock button.on{background:#5a3a14;border-color:var(--ac,#ff8c32);color:#ffd9b0}
  #pdock .pad{width:54px;height:110px;border-radius:14px;border:1px solid #4c4c58;background:rgba(40,40,50,.92);position:relative;overflow:hidden;font:700 10px/1.1 system-ui;color:#f4f0e6;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:5px 0;touch-action:none}
  #pdock .pad .fill{position:absolute;left:0;right:0;bottom:0;background:rgba(143,208,255,.32);pointer-events:none} #pdock .pad span{position:relative;pointer-events:none} #pdock .pad .v{font-size:13px} #pdock .pad.drag{border-color:#8fd0ff}`;
  document.head.append(st);
  const dock = document.createElement('div'); dock.id = 'pdock'; document.body.append(dock);
  const dbtn = (ic, label, fn) => { const b = document.createElement('button'); b.innerHTML = '<i>' + ic + '</i>' + label; b.onclick = fn; return b; };
  const dPad = document.createElement('div'); dPad.className = 'pad'; dPad.innerHTML = '<div class="fill"></div><span>Reach</span><span class="v"></span><span>↕</span>';
  const dF = dbtn('〰', 'Smooth', () => rows[0] && rows[0].querySelector('.pF').click()), dOff = dbtn('🫧', 'Soft off', () => setOn(false));
  dock.append(dPad, dF, dOff);
  { let d = null; const setR = v => { PR.r = Math.min(6, Math.max(.1, +v.toFixed(2))); psave(); ui(); ballAt(ballCenter(), 900); };
    dPad.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); d = {id: e.pointerId, y: e.clientY, v: PR.r, moved: false}; dPad.classList.add('drag'); try { dPad.setPointerCapture(e.pointerId); } catch (x) {} });
    dPad.addEventListener('pointermove', e => { if (!d || e.pointerId !== d.id) return; if (Math.abs(e.clientY - d.y) > 3) d.moved = true; setR(d.v + (d.y - e.clientY) / 150 * 5.9); });
    const end = e => { if (!d || e.pointerId !== d.id) return; const q = d; d = null; dPad.classList.remove('drag'); if (!q.moved) { const r = dPad.getBoundingClientRect(); setR(PR.r + (e.clientY < r.top + r.height / 2 ? .25 : -.25)); } tip('Reach ' + PR.r.toFixed(2), 900); };
    dPad.addEventListener('pointerup', end); dPad.addEventListener('pointercancel', end); }
  function dockUI() { const t = (PR.r - .1) / 5.9; dPad.querySelector('.fill').style.height = Math.round(t * 100) + '%'; dPad.querySelector('.v').textContent = PR.r.toFixed(1);
    dF.innerHTML = '<i>' + PF[PR.f].split(' ')[0] + '</i>' + PF[PR.f].split(' ')[1]; }
  const dockWant = () => PR.on && document.body.classList.contains('mfm') && (tab === 'edit' || (tab === 'sculpt' && lpMode));
  setInterval(() => { const on = dockWant(); if (document.body.classList.contains('pdockOn') !== on) document.body.classList.toggle('pdockOn', on); }, 300);
  ui();

  // ---- parts: who moves, and how much
  let PD = null;   // {uid, start: Vector3, list: [{pt, v, w, w0 (world start), twin}], follow: [{v, w, w0}]}
  function partStart(uid, startWorld) { const pt0 = partBy(uid); if (!PR.on || !pt0 || !views[uid]) return null;
    const tw0 = pt0.twin, list = [], taken = new Set([uid]); if (tw0) taken.add(tw0);
    for (const pt of P.parts) { if (taken.has(pt.uid)) continue; const v = views[pt.uid]; if (!v || !v.G.visible || pt.boxed || pt.hidden || (LIB[pt.lib] && LIB[pt.lib].live)) continue;
      const w0 = v.G.getWorldPosition(new THREE.Vector3()), w = fall(w0.distanceTo(startWorld)); if (w <= .001) continue;
      list.push({pt, v, w, w0}); taken.add(pt.uid); if (pt.twin) taken.add(pt.twin); }
    // parts plugged onto a moved part (and not moved themselves) follow it; their place gets fixed again when the host is rebuilt
    const wOf = new Map([[uid, 1], ...list.map(o => [o.pt.uid, o.w])]), follow = [];
    for (let pass = 0; pass < 4; pass++) for (const pt of P.parts) { if (wOf.has(pt.uid) || !pt.host || !wOf.has(pt.host.u) || pt.host.u === uid) continue; const v = views[pt.uid]; if (!v) continue;
      wOf.set(pt.uid, wOf.get(pt.host.u)); follow.push({v, w: wOf.get(pt.host.u), w0: v.G.getWorldPosition(new THREE.Vector3())}); }
    return {uid, start: startWorld.clone(), list, follow}; }
  const _t = new THREE.Vector3();
  function placeWorld(G, world) { _t.copy(world); if (G.parent) G.parent.worldToLocal(_t); G.position.copy(_t); }
  function partMove(cur) { if (!PD) return; const d = cur.clone().sub(PD.start);
    for (const o of PD.list) { placeWorld(o.v.G, o.w0.clone().addScaledVector(d, o.w)); const tw = o.pt.twin && views[o.pt.twin]; if (tw) tw.G.position.set(-o.v.G.position.x, o.v.G.position.y, o.v.G.position.z); }
    for (const o of PD.follow) placeWorld(o.v.G, o.w0.clone().addScaledVector(d, o.w));
    if (d.lengthSq() > 1e-8) PD.any = true; ballAt(cur, 0); }
  function partEnd(keep) { const D0 = PD; PD = null; ball.visible = false; if (!D0 || !D0.any) return 0; const moved = D0.list.filter(o => P.parts.includes(o.pt));
    if (keep) { moved.forEach(o => { o.pt.host = null; o.pt.p = o.v.G.position.toArray().map(x => +x.toFixed(3)); if (o.pt.fit) o.pt.fit.tweaked = true; });
      moved.forEach(o => { buildPart(o.pt); syncTwin(o.pt); }); }
    else moved.forEach(o => { buildPart(o.pt); syncTwin(o.pt); });
    D0.follow.forEach(o => { const u = o.v.G.userData.uid, pt = partBy(u); if (pt && !keep) buildPart(pt); });
    if (keep && moved.length) { outliner(); saveCur(); } return moved.length; }

  // 🎯 Arrows (gizmo, Move only)
  gizmo.addEventListener('dragging-changed', e => {
    if (e.value) { if (gzTarget !== 'part' || gizmo.mode !== 'translate' || !sel || !views[sel]) return; PD = partStart(sel, views[sel].G.getWorldPosition(new THREE.Vector3())); }
    else if (PD) { const n = partEnd(true); if (n) tip('🫧 Soft move: ' + n + ' nearby part' + (n > 1 ? 's' : '') + ' moved too', 1600); } });
  gizmo.addEventListener('objectChange', () => { if (PD && views[PD.uid]) partMove(views[PD.uid].G.getWorldPosition(new THREE.Vector3())); });

  // ✋ Drag (finger / pen / mouse): watch the core's `drag` every frame
  let DR = null;
  (function loop() { requestAnimationFrame(loop);
    if (drag && drag !== DR) { DR = drag; const pt = partBy(drag.uid), b = pt && ((pt.bone && bones[pt.bone]) || skelRoot);
      if (pt && b && PR.on) { b.updateMatrixWorld(true); PD = partStart(drag.uid, b.localToWorld(new THREE.Vector3(...pt.p))); } }
    if (DR && drag === DR && PD && drag.moved && views[PD.uid]) partMove(views[PD.uid].G.getWorldPosition(new THREE.Vector3()));
    if (DR && drag !== DR) { const pt = partBy(DR.uid), mv = DR.moved; DR = null; if (PD) { const keep = !!(pt && !pt.boxed && mv); const n = partEnd(keep); if (keep && n) tip('🫧 Soft move: ' + n + ' nearby part' + (n > 1 ? 's' : '') + ' moved too', 1600); } }
  })();

  // ---- 🔷 low-poly: soft versions of the arrow / Bigger / Smaller / Tilt / Twist buttons
  function lpWeights(pt, poly, ids) { const mw = views[pt.uid].meshes[0].matrixWorld, W = poly.v.map(p => new THREE.Vector3(...p).applyMatrix4(mw)), S = new Set(ids);
    return poly.v.map((_, i) => { if (S.has(i)) return 1; let m = 1e9; for (const j of ids) { const d = W[i].distanceTo(W[j]); if (d < m) m = d; } return fall(m); }); }
  const _lpXform = lpXform;
  lpXform = fn => { const pt = PR.on && lpPart(); if (!pt || !views[pt.uid] || !lpSel.size) return _lpXform(fn); snap();
    const poly = lpGet(pt), ids = lpVerts(poly), before = poly.v.map(p => p.slice()), c = vmul(ids.reduce((s, i) => vadd(s, poly.v[i]), [0, 0, 0]), 1 / ids.length), w = lpWeights(pt, poly, ids), all = [];
    poly.v.forEach((p, i) => { if (w[i] <= .001) return; const q = fn(p.slice(), c); poly.v[i] = vadd(p, vmul(vsub(q, p), w[i])); all.push(i); });
    lpKeepMid(poly, all, before); lpSet(pt, poly); ballAt(ballCenter()); };

  // ---- 🔷 low-poly: drag a picked (orange) face to move it; with Soft move on, nearby points follow
  let LD = null;
  function rayAt(x, y) { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.ray; }
  addEventListener('pointerdown', e => { if (tab !== 'sculpt' || !lpMode || !lpSel.size || e.target !== canvas || touches.size > 0 || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const pt = lpPart(); if (!pt || !views[pt.uid]) return; const y = offY(e), hit = cast(e.clientX, y, views[pt.uid].meshes); if (!hit) return;
    const poly = lpGet(pt), fi = triToFace(poly, hit.faceIndex); if (fi < 0 || !lpSel.has(fi)) return;   // tapping a face that is not picked still picks it
    e.stopImmediatePropagation(); e.preventDefault(); controls.enabled = false; snap();
    const ids = lpVerts(poly), mw = views[pt.uid].meshes[0].matrixWorld.clone();
    LD = {id: e.pointerId, uid: pt.uid, fi, poly0: poly, ids, w: PR.on ? lpWeights(pt, poly, ids) : poly.v.map((_, i) => ids.includes(i) ? 1 : 0), inv: mw.clone().invert(), p0: hit.point.clone(), x0: e.clientX, y0: y, moved: false, raf: 0,
      plane: new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()).negate(), hit.point)};
    window.__lastW = LD.w.filter(x => x > .001).length; pt.sculpt = null; pt.cut = []; pt.vpaint = null; pt.layer = null; pt.layerX = null; try { canvas.setPointerCapture(e.pointerId); } catch (x) {} }, true);
  function lpApply(LD, x, y) { const pt = partBy(LD.uid); if (!pt) return; const hp = new THREE.Vector3(); if (!rayAt(x, y).intersectPlane(LD.plane, hp)) return;
    const a = LD.p0.clone().applyMatrix4(LD.inv), b = hp.applyMatrix4(LD.inv), dl = [b.x - a.x, b.y - a.y, b.z - a.z], poly = JSON.parse(JSON.stringify(LD.poly0)), all = [];
    poly.v.forEach((p, i) => { if (LD.w[i] <= .001) return; poly.v[i] = vadd(p, vmul(dl, LD.w[i])); all.push(i); }); lpKeepMid(poly, all, LD.poly0.v);
    pt.params = {poly}; buildPart(pt); syncTwin(pt); lpDraw(); if (PR.on) ballAt(ballCenter(), 0); }
  addEventListener('pointermove', e => { if (!LD || e.pointerId !== LD.id) return; e.stopImmediatePropagation(); const x = e.clientX, y = offY(e);
    if (!LD.moved && Math.hypot(x - LD.x0, y - LD.y0) < 4) return; LD.moved = true; LD.nx = x; LD.ny = y;
    if (!LD.raf) LD.raf = requestAnimationFrame(() => { if (!LD) return; LD.raf = 0; lpApply(LD, LD.nx, LD.ny); }); }, true);
  const lpEnd = e => { if (!LD || e.pointerId !== LD.id) return; e.stopImmediatePropagation(); const d = LD; LD = null; touches.delete(e.pointerId); controls.enabled = true; ball.visible = false; down = null;
    if (d.moved) { if (d.raf) cancelAnimationFrame(d.raf); lpApply(d, d.nx, d.ny); saveCur(); tip(PR.on ? '🫧 Moved the picked faces; nearby points followed softly' : 'Moved the picked faces (turn on 🫧 Soft move to bring nearby points along)', 1800); }
    else { const pt = partBy(d.uid); lpSel.delete(d.fi); if (pt) { pt.params = {poly: d.poly0}; buildPart(pt); } lpDraw(); } };   // a tap on a picked face un-picks it, as before
  addEventListener('pointerup', lpEnd, true); addEventListener('pointercancel', lpEnd, true);

  window.__lpHit = (x, y) => { const pt = lpPart(); if (!pt || !views[pt.uid]) return -1; const h = cast(x, y, views[pt.uid].meshes); return h ? triToFace(lpGet(pt), h.faceIndex) : -1; };   // test hook
  window.__hitUid = (x, y) => { const h = cast(x, y, visibleMeshes()); return h ? h.object.userData.uid : null; };   // test hook
  window.__lpPoly = () => { const pt = lpPart(); return pt ? lpGet(pt) : null; };   // test hook
  window.__lpWhy = () => ({tab, lpMode, n: lpSel.size, pt: !!lpPart(), touches: touches.size});   // test hook
  window.__prop = {PR, set: o => { Object.assign(PR, o); psave(); ui(); }, fall, setOn, lpDragging: () => !!LD, lastW: () => window.__lastW, partDrag: () => !!PD,
    // test hook (headless checks): soft-move part u by [dx,dy,dz] world units the way a drag would, return how far every other part moved
    tryPart: (u, d) => { const v = views[u]; if (!v) return null; const s0 = v.G.getWorldPosition(new THREE.Vector3()), before = {}; P.parts.forEach(p => { if (views[p.uid]) before[p.uid] = views[p.uid].G.getWorldPosition(new THREE.Vector3()); });
      PD = partStart(u, s0); if (!PD) return null; const cur = s0.clone().add(new THREE.Vector3(...d)); placeWorld(v.G, cur); partMove(cur); const pt = partBy(u); pt.p = v.G.position.toArray(); buildPart(pt); syncTwin(pt); const n = partEnd(true);
      const out = {}; P.parts.forEach(p => { const b = before[p.uid], vv = views[p.uid]; if (b && vv) out[p.uid] = +vv.G.getWorldPosition(new THREE.Vector3()).distanceTo(b).toFixed(3); }); return {n, out}; }};
}
