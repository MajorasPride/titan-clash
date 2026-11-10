// Build together walk: node walk.js <phone|pc> <simple|complex> [k1,k2] -> walk-<size>-<level>.json
// Every step: the Next button must be on screen and on top; it is pressed with a real tap / click until 🎉 Done.
const H = require('./lib'), fs = require('fs');
(async () => {
  const size = process.argv[2] || 'phone', level = process.argv[3] || 'complex', only = process.argv[4] ? process.argv[4].split(',') : null;
  const {page, errs, close} = await H.open(size);
  await page.evaluate(l => localStorage.setItem('mf-btlevel', l), level);
  const keys = (await page.evaluate(() => Object.keys(window.__dbg().SKEL))).filter(k => k !== 'none' && (!only || only.includes(k)));
  const out = {}, vp = page.viewportSize();
  const libs = () => page.evaluate(() => window.__v3.P().parts.filter(p => !p.boxed).map(p => p.lib).sort());
  for (const k of keys) { const n0 = errs.length, r = {steps: 0, ok: false, notes: []};
    try {
      await page.evaluate(k => { window.__fresh(k); window.__def(k); }, k); const want = await libs();
      await page.evaluate(k => { localStorage.removeItem('mf-bt-resume'); window.__fresh(k); document.getElementById('bGuide').click(); }, k);
      for (let i = 0; i < 90; i++) {
        const st = await page.evaluate(() => { const BT = window.__btx.BT; if (!BT.on) return {done: true}; const bs = [...document.querySelectorAll('#guide .gb button')], b = bs[bs.length - 1]; if (!b) return {none: true};
          const q = b.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, top = document.elementFromPoint(x, y);
          return {x, y, w: q.width, h: q.height, hit: top === b || b.contains(top), label: b.textContent, step: (BT.steps[BT.i] || {}).t || (BT.steps[BT.i] || {}).k, i: BT.i, n: BT.steps.length}; });
        if (st.done) { r.ok = true; break; } if (st.none) { r.notes.push('no Next button at step ' + i); break; }
        if (!(st.x > 0 && st.y > 0 && st.x < vp.width && st.y < vp.height)) r.notes.push('Next off screen at ' + st.step); else if (!st.hit) r.notes.push('Next covered at ' + st.step); else if (st.h < 30) r.notes.push('Next too small at ' + st.step);
        if (st.hit && st.x > 0 && st.y > 0 && st.x < vp.width && st.y < vp.height) { if (size === 'phone') await page.touchscreen.tap(st.x, st.y); else await page.mouse.click(st.x, st.y); }
        else await page.evaluate(() => { const bs = [...document.querySelectorAll('#guide .gb button')]; bs[bs.length - 1].click(); });
         r.steps++; if (i % 6 === 5) await page.evaluate(() => window.__frames(1));
      }
      await page.evaluate(() => window.__frames(1));
      const fin = await page.evaluate(() => { const P = window.__v3.P(), F = window.__dbg().FAMILY, on = new Set(); P.parts.forEach(p => { on.add(p.bone); ((p.fit && p.fit.cover) || []).forEach(c => on.add(c)); });
        const fams = {}; P.bones.forEach(b => { const f = F[b[4]] || 'trunk'; (fams[f] = fams[f] || []).push(b[0]); });
        const empty = Object.entries(fams).filter(([f, bs]) => f !== 'jaw' && !bs.some(b => on.has(b)) && !(f === 'head' && (window.V3.noHead(P.skel) || P.parts.some(p => p.host && /eye_big/.test(p.lib))))).map(([f]) => f);
        return {n: P.parts.length, base: P.parts.filter(p => p.lib.startsWith('base_')).map(p => p.bone), empty}; });
      const got = await libs(); const diff = []; const cw = {}, cg = {}; want.forEach(l => cw[l] = (cw[l] || 0) + 1); got.forEach(l => cg[l] = (cg[l] || 0) + 1);
      for (const l of new Set([...want, ...got])) if ((cw[l] || 0) !== (cg[l] || 0)) diff.push(l + ' ' + (cg[l] || 0) + '/' + (cw[l] || 0));
      Object.assign(r, fin, {diff});
    } catch (e) { r.notes.push('EXC ' + String(e.message).slice(0, 160)); }
    r.errs = errs.slice(n0); r.pass = r.ok && !r.errs.length && !r.notes.length && !(r.base || []).length && !(r.empty || []).length && !(r.diff || []).length;
    out[k] = r; console.log((r.pass ? 'PASS ' : 'FAIL ') + k, JSON.stringify({steps: r.steps, n: r.n, base: r.base, empty: r.empty, diff: r.diff, notes: r.notes, errs: r.errs}));
  }
  fs.writeFileSync(`walk-${size}-${level}${only ? '-part' : ''}.json`, JSON.stringify(out, null, 1));
  await close(); H.stop();
})();
