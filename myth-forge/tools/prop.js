// 🫧 Soft move (T036) check: node prop.js <phone|pc> -> prints JSON, exit 1 on failure
// 1. parts: on a ⭐ default, soft-move one part; near parts move less than it, far parts stay, twins mirror
// 2. low-poly: add a block, pick a face, drag it with a real pointer (mouse on PC, finger on phone); soft on moves more points than soft off
// 3. falloff shapes + the soft arrow buttons; phone dock shows while Soft move is on
const H = require('./lib');
(async () => {
  const size = process.argv[2] || 'pc', {page, errs, close} = await H.open(size), R = {size, ok: true, notes: []}, bad = m => { R.ok = false; R.notes.push(m); };
  const fr = n => page.evaluate(n => window.__frames(n), n);
  // falloff
  R.fall = await page.evaluate(() => { const o = {}; for (const f of ['smooth', 'sharp', 'linear', 'constant']) { window.__prop.set({f, r: 2}); o[f] = [0, .5, 1, 1.5, 2, 3].map(d => +window.__prop.fall(d).toFixed(3)); } return o; });
  for (const [f, a] of Object.entries(R.fall)) { if (a[0] !== 1 || a[4] !== 0 || a[5] !== 0) bad('falloff ' + f + ' ends wrong ' + a); for (let i = 1; i < 5; i++) if (a[i] > a[i - 1]) bad('falloff ' + f + ' grows'); }
  // 1. parts
  R.parts = await page.evaluate(() => { window.__fresh('biped'); window.__def('biped'); const V = window.__v3, P = V.P();
    const pick = P.parts.find(p => p.twin && /hand|forearm|arm/.test(p.bone || '')) || P.parts.find(p => p.twin); if (!pick) return {err: 'no twin part'};
    window.__prop.set({on: true, r: 1.2, f: 'smooth'}); const r = window.__prop.tryPart(pick.uid, [0, .5, 0]); if (!r) return {err: 'tryPart null'};
    const mv = Object.entries(r.out).filter(([u]) => u !== pick.uid && u !== pick.twin);
    return {n: r.n, parts: P.parts.length, self: r.out[pick.uid], twin: r.out[pick.twin], moved: mv.filter(([, d]) => d > .005).length, max: Math.max(...mv.map(([, d]) => d)), still: mv.filter(([, d]) => d <= .005).length}; });
  if (R.parts.err) bad(R.parts.err); else { if (!(R.parts.n > 0)) bad('no nearby part moved'); if (!(R.parts.max <= R.parts.self + 1e-3)) bad('a neighbour moved more than the picked part'); if (!(R.parts.still > 0)) bad('every part moved (reach ignored)'); if (!(R.parts.twin > .3)) bad('twin did not follow'); }
  R.partsOff = await page.evaluate(() => { window.__prop.set({on: false}); const P = window.__v3.P(), u = P.parts[0].uid; return window.__prop.tryPart(u, [0, .5, 0]); });
  if (R.partsOff !== null) bad('soft move off still moved parts');
  // 2. low-poly drag with a real pointer
  const lp = async soft => {
    await page.evaluate(soft => { window.__fresh('biped'); document.querySelector('.tabs [data-tab="sculpt"]').click(); if (!window.__lpOn) { document.getElementById('bLP').click(); window.__lpOn = 1; }
      document.getElementById('lpBlock').click(); document.querySelector('.tabs [data-tab="sculpt"]').click(); window.__prop.set({on: soft, r: .9, f: 'linear'}); }, soft);
    await page.evaluate(() => { const V = window.__v3; V.frameObj(V.sel(), 2.2); window.__frames(2); });
    // simpler: tap the middle of the screen part by scanning for a pixel that hits the block
    const pts = await page.evaluate(() => { const out = []; for (let y = 120; y < innerHeight - 200; y += 24) for (let x = 40; x < innerWidth - 40; x += 24) out.push([x, y]); return out; });
    let target = await page.evaluate(pts => { const V = window.__v3; for (const [x, y] of pts) { const el = document.elementFromPoint(x, y); if (!el || el.tagName !== 'CANVAS') continue; if (window.__lpHit(x, y) >= 0) return [x, y]; } return null; }, pts);
    if (!target) return {err: 'no low-poly face on screen'};
    let fi = await page.evaluate(([x, y]) => window.__lpHit(x, y), target); const target0 = target.slice();
    await page.evaluate(fi => { window.__lp.tap(fi); document.getElementById('lpCut').click(); window.__lp.tap(0); document.getElementById('lpCut2').click(); window.__frames(1); }, fi);
    const t2 = await page.evaluate(pts => { for (const [x, y] of pts) { const el = document.elementFromPoint(x, y); if (el && el.tagName === 'CANVAS' && window.__lpHit(x, y) >= 0) return [x, y]; } return null; }, pts);
    if (!t2) return {err: 'face lost after cuts'}; target[0] = t2[0]; target[1] = t2[1]; fi = await page.evaluate(([x, y]) => window.__lpHit(x, y), target);
    await page.evaluate(fi => { window.__lp.tap(fi); }, fi);
    const before = await page.evaluate(() => JSON.stringify(window.__lpPoly().v));
    const [x, y] = target;
    if (size === 'phone') { const c = await page.context().newCDPSession(page); const tp = (type, x, y) => c.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y}]});
      await tp('touchStart', x, y); for (let i = 1; i <= 6; i++) { await tp('touchMove', x, y - i * 10); await fr(1); } await tp('touchEnd'); }
    else { await page.mouse.move(x, y); await page.mouse.down(); for (let i = 1; i <= 6; i++) { await page.mouse.move(x, y - i * 10); await fr(1); } await page.mouse.up(); }
    await fr(2);
    return page.evaluate(b0 => { const v0 = JSON.parse(b0), v1 = window.__lpPoly().v; let n = 0, full = 0; const d = v1.map((p, i) => Math.hypot(p[0] - v0[i][0], p[1] - v0[i][1], p[2] - v0[i][2]));
      const mx = Math.max(...d); d.forEach(x => { if (x > 1e-4) n++; if (x > mx - 1e-4) full++; }); return {moved: n, full, max: +mx.toFixed(3), verts: v1.length, dragging: window.__prop.lpDragging(), w: window.__prop.lastW(), on: window.__prop.PR.on}; }, before);
  };
  R.lpOff = await lp(false); R.lpOn = await lp(true);
  if (R.lpOff.err || R.lpOn.err) bad('low-poly: ' + (R.lpOff.err || R.lpOn.err));
  else { if (!(R.lpOff.max > .05)) bad('face drag did not move the face'); if (R.lpOff.moved !== R.lpOff.full) bad('soft off moved extra points'); if (!(R.lpOn.moved > R.lpOn.full)) bad('soft on did not bring nearby points'); if (R.lpOn.dragging) bad('drag stuck'); }
  // soft arrow button
  R.arrow = await page.evaluate(() => { const V = window.__v3, pt = V.partBy(V.sel()); const v0 = JSON.stringify(window.__lpPoly().v); document.querySelector('[data-lpm="0,1,0"]').click(); const v1 = window.__lpPoly().v, a = JSON.parse(v0);
    return v1.filter((p, i) => Math.hypot(p[0] - a[i][0], p[1] - a[i][1], p[2] - a[i][2]) > 1e-4).length; });
  if (!(R.arrow > R.lpOn.full)) bad('soft ⬆ Up did not bring nearby points');
  R.undo = await page.evaluate(() => { const V = window.__v3, n0 = JSON.stringify(window.__lpPoly().v); document.getElementById('bUndo').click(); const pt = V.partBy(V.sel()); return !!pt && JSON.stringify(window.__lpPoly().v) !== n0; });
  if (!R.undo) bad('undo did not undo the soft move');
  R.mirror = await page.evaluate(() => { document.getElementById('lpMirror').click(); const a = window.__lpPoly(); window.__lp.tap(0); document.querySelector('[data-lpm="1,0,0"]').click(); const b = window.__lpPoly();
    return {mirror: !!b.mirror, midOff: a.v.filter((p, i) => Math.abs(p[0]) < 1e-4 && b.v[i] && Math.abs(b.v[i][0]) > 1e-4).length, moved: b.v.filter((p, i) => Math.hypot(p[0] - a.v[i][0], p[1] - a.v[i][1], p[2] - a.v[i][2]) > 1e-4).length}; });
  if (!R.mirror.mirror || R.mirror.midOff || !R.mirror.moved) bad('mirror + soft move broke the middle line');
  // UI
  R.ui = await page.evaluate(() => { const rows = document.querySelectorAll('.propbox'); document.querySelector('.tabs [data-tab="edit"]').click(); window.__prop.set({on: true}); return {rows: rows.length}; });
  await page.waitForTimeout(400); R.ui.dock = await page.evaluate(() => document.body.classList.contains('pdockOn'));   // (it hides while the tool sheet is pulled up, like the sculpt dock)
  if (R.ui.rows !== 2) bad('expected 2 Soft move rows'); if (size === 'phone' && !R.ui.dock) bad('phone dock not shown'); if (size === 'pc' && R.ui.dock) bad('dock shown on PC');
  await page.evaluate(() => window.__prop.set({on: false}));
  R.errs = errs; if (errs.length) bad('page errors');
  console.log(JSON.stringify(R, null, 1)); await close(); process.exit(R.ok ? 0 : 1);
})();
