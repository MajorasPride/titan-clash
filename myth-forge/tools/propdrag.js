// real pointer ✋ Drag of a part with Soft move on (PC mouse / phone finger)
const H = require('./lib');
(async () => { const size = process.argv[2] || 'pc', {page, errs, close} = await H.open(size); const fr = n => page.evaluate(n => window.__frames(n), n);
  const r0 = await page.evaluate(() => { window.__fresh('biped'); window.__def('biped'); document.querySelector('.tabs [data-tab="edit"]').click(); document.getElementById('bDragMode').click();
    const V = window.__v3, P = V.P(), pt = P.parts.find(p => p.twin && /hand/.test(p.bone || '')) || P.parts.find(p => p.twin && /arm/.test(p.bone || '')) || P.parts.find(p => p.twin); V.select(pt.uid); V.frameObj(pt.uid, 3); window.__frames(2);
    window.__prop.set({on: true, r: 1.2, f: 'smooth'}); window.__w0 = {}; P.parts.forEach(p => { const v = V.views()[p.uid]; if (v) window.__w0[p.uid] = v.G.getWorldPosition(v.G.position.clone()).toArray(); }); return pt.uid; });
  if (size === 'phone') await page.evaluate(() => { document.body.classList.remove('mup'); });
  const t = await page.evaluate(u => { const V = window.__v3; for (let y = 100; y < innerHeight - 150; y += 8) for (let x = 20; x < innerWidth - 20; x += 8) { const el = document.elementFromPoint(x, y); if (!el || el.tagName !== 'CANVAS') continue; if (window.__hitUid && window.__hitUid(x, y) === u) return [x, y]; } return null; }, r0);
  if (!t) { console.log('no target'); await close(); process.exit(1); }
  const [x, y] = t;
  if (size === 'phone') { const c = await page.context().newCDPSession(page); const tp = (type, x, y) => c.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y}]}); await tp('touchStart', x, y); for (let i = 1; i <= 8; i++) { await tp('touchMove', x + i * 12, y - i * 4); await fr(1); } await tp('touchEnd'); }
  else { await page.mouse.move(x, y); await page.mouse.down(); for (let i = 1; i <= 8; i++) { await page.mouse.move(x + i * 12, y - i * 4); await fr(1); } await page.mouse.up(); }
  await fr(3);
  const r = await page.evaluate(u => { const V = window.__v3, P = V.P(), out = {}; P.parts.forEach(p => { const v = V.views()[p.uid], a = window.__w0[p.uid]; if (v && a) out[p.uid] = +v.G.getWorldPosition(v.G.position.clone()).distanceTo(v.G.position.clone().fromArray(a)).toFixed(3); });
    const pt = V.partBy(u), o = Object.entries(out).filter(([k]) => k !== u && k !== pt.twin); return {self: out[u], twin: out[pt.twin], moved: o.filter(([, d]) => d > .005).length, still: o.filter(([, d]) => d <= .005).length, max: Math.max(...o.map(([, d]) => d))}; }, r0);
  r.errs = errs; console.log(size, JSON.stringify(r)); await close(); process.exit(r.moved > 0 && !errs.length ? 0 : 1); })();
