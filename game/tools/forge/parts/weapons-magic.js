// Titan Forge parts: Weapons + Accessories & Magic  (id prefix wp_)
// Classic script. Orientation: grip / attach point at origin, part grows along +Y.
// Shields: handle at origin, face points +Y. Rings worn around a neck/waist (belt, collar, necklace,
// scarf) lie in the XZ plane around the origin. Hanging things (capes, drips, bells, chains) hang along +Y.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const {V3, at, bez, cr, merge} = K;
  const PI = Math.PI, TAU = PI * 2, sin = Math.sin, cos = Math.cos, abs = Math.abs, pow = Math.pow;
  const UP = new T.Vector3(0, 1, 0);
  let seed = 1;
  const srand = s => { seed = s; }, rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const rr = (a, b) => a + (b - a) * rnd();

  // ---------- generic helpers ----------
  function uvfix(g) {
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) { const p = g.attributes.position, a = new Float32Array(p.count * 2);
      for (let i = 0; i < p.count; i++) { a[i * 2] = (p.getX(i) + p.getZ(i)) * .5; a[i * 2 + 1] = p.getY(i) * .5; }
      g.setAttribute('uv', new T.BufferAttribute(a, 2)); }
    return g;
  }
  function bag() { const m = {}; const o = {
    add(mat, ...gs) { for (const g of gs.flat()) (m[mat] = m[mat] || []).push(uvfix(g)); return o; },
    out() { return Object.keys(m).map(k => ({geo: merge(m[k]), mat: k})); }}; return o; }
  const xf = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) => at(g, x, y, z, rx, ry, rz, s);
  function orient(g, p, dir, s = 1) { const q = new T.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
    g.applyMatrix4(new T.Matrix4().compose(p, q, typeof s === 'number' ? V3(s, s, s) : V3(...s))); return g; }
  const cyl = (r0, r1, h, seg = 16, y = 0, open = false) => at(new T.CylinderGeometry(r1, r0, h, seg, 1, open), 0, y + h / 2, 0);
  const sph = (r, w = 16, h = 12) => new T.SphereGeometry(r, w, h);
  const cone = (r, h, seg = 12) => at(new T.ConeGeometry(r, h, seg), 0, h / 2, 0);
  const tor = (R, r, rs = 8, ts = 32, arc = TAU) => new T.TorusGeometry(R, r, rs, ts, arc);
  const torY = (R, r, y = 0, rs = 8, ts = 32) => at(tor(R, r, rs, ts), 0, y, 0, PI / 2, 0, 0);
  const box = (w, h, d) => new T.BoxGeometry(w, h, d);
  function shp(pts) { const s = new T.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return s; }
  function ext(s, depth, bev = .03, bs = 2, cs = 32) { if (Array.isArray(s)) s = shp(s);
    const g = new T.ExtrudeGeometry(s, {depth, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: bs, curveSegments: cs});
    g.translate(0, 0, -depth / 2); return g; }
  function rbox(w, h, d, b = .04) { b = Math.min(b, w / 3, h / 3, d / 3);
    return ext([[-w / 2 + b, -h / 2 + b], [w / 2 - b, -h / 2 + b], [w / 2 - b, h / 2 - b], [-w / 2 + b, h / 2 - b]], d - 2 * b, b, 2); }
  function annulus(R1, R2, th, cs = 32) { const s = new T.Shape(); s.absarc(0, 0, R2, 0, TAU, false); const h = new T.Path(); h.absarc(0, 0, R1, 0, TAU, true); s.holes.push(h);
    const g = ext(s, th, Math.min(th * .3, .015), 1, cs); g.rotateX(-PI / 2); return g; }
  function fcurve(f) { const c = new T.Curve(); c.getPoint = (t, o = new T.Vector3()) => { const p = f(t); return o.set(p[0], p[1], p[2]); }; return c; }
  const tube = (c, r, seg = 48, rad = 6, closed = false) => new T.TubeGeometry(c, seg, r, rad, closed);
  function helix(r, y0, y1, turns, tr = .025, dir = 1, ph = 0) {
    return tube(fcurve(t => { const a = ph + dir * t * turns * TAU; return [cos(a) * r, y0 + (y1 - y0) * t, sin(a) * r]; }), tr, Math.max(16, Math.ceil(turns * 20)), 5); }
  function flat(g) { g = g.index ? g.toNonIndexed() : g; g.computeVertexNormals(); return g; }
  // position-based wobble (no cracks on seams / flat geometry)
  function wob(g, a = .05, f = 2) { const p = g.attributes.position, vn = K.vnoise;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), X = x * f, Y = y * f, Z = z * f;
      p.setXYZ(i, x + vn(X, Y, Z) * a, y + vn(X + 31.4, Y + 7.1, Z) * a, z + vn(X, Y + 17.3, Z + 3.3) * a); }
    p.needsUpdate = true; g.computeVertexNormals(); return g; }
  function svol(g) { const p = g.attributes.position, ix = g.index ? g.index.array : null, n = ix ? ix.length : p.count; let v = 0;
    for (let i = 0; i < n; i += 3) { const a = ix ? ix[i] : i, b = ix ? ix[i + 1] : i + 1, c = ix ? ix[i + 2] : i + 2;
      v += p.getX(a) * (p.getY(b) * p.getZ(c) - p.getZ(b) * p.getY(c)) - p.getY(a) * (p.getX(b) * p.getZ(c) - p.getZ(b) * p.getX(c)) + p.getZ(a) * (p.getX(b) * p.getY(c) - p.getY(b) * p.getX(c)); }
    return v / 6; }
  function lathe(pts, seg = 24) { const f = pts[0], l = pts[pts.length - 1]; if (f[0] > 1e-3 && l[0] > 1e-3 && (f[0] !== l[0] || f[1] !== l[1])) pts = [...pts, f]; const g = K.lathe(pts, seg); if (svol(g) < 0) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } g.computeVertexNormals(); } return g; }
  // K.taper comes out inside-out (negative volume); flip it here
  // (only the tube is reversed; its end caps are already wound outward)
  function taper(curve, r0, r1, seg = 24, rad = 10, fl = 1) { const g = K.taper(curve, r0, r1, seg, rad, fl), ix = g.index.array, n = seg * rad * 6;
    return g; }   // K.taper was fixed in k-helpers.js (Nov 8), so no flip needed now
  function fixWind(g) { const p = g.attributes.position, ix = g.index.array; let v = 0;
    for (let i = 0; i < ix.length; i += 3) { const a = ix[i], b = ix[i + 1], c = ix[i + 2];
      const ax = p.getX(a), ay = p.getY(a), az = p.getZ(a), bx = p.getX(b), by = p.getY(b), bz = p.getZ(b), cx = p.getX(c), cy = p.getY(c), cz = p.getZ(c);
      v += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx); }
    if (v < 0) { for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } g.index.needsUpdate = true; }
    return g; }
  // loft closed rings of [x,y,z] (same count), capped
  function loft(rings, {flat: fl = false, cap = true} = {}) { const n = rings[0].length, R = rings.length, pos = [], uv = [], idx = [], W = n + 1;
    rings.forEach((r, i) => { for (let j = 0; j <= n; j++) { const p = r[j % n]; pos.push(p[0], p[1], p[2]); uv.push(j / n, i / (R - 1)); } });
    for (let i = 0; i < R - 1; i++) for (let j = 0; j < n; j++) { const a = i * W + j, b = a + 1, c = a + W, d = c + 1; idx.push(a, c, b, b, c, d); }
    if (cap) [0, R - 1].forEach((i, k) => { const r = rings[i]; let cx = 0, cy = 0, cz = 0; r.forEach(p => { cx += p[0]; cy += p[1]; cz += p[2]; });
      const base = pos.length / 3; r.forEach(p => { pos.push(p[0], p[1], p[2]); uv.push(.5, .5); }); pos.push(cx / n, cy / n, cz / n); uv.push(.5, .5);
      const ci = base + n; for (let j = 0; j < n; j++) { const a = base + j, b = base + (j + 1) % n; k ? idx.push(a, b, ci) : idx.push(b, a, ci); } });
    let g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    if (cap) fixWind(g); if (fl) g = g.toNonIndexed(); g.computeVertexNormals(); return g; }
  // blade along +Y. w(t) half width (number or [spineSide(-x), edgeSide(+x)]), c(t) x-bend, th(t) half thickness
  function blade({len, seg = 24, w, c = () => 0, th, y0 = 0, single = false, cz = () => 0, bev = .4}) { const rings = [];
    for (let i = 0; i <= seg; i++) { const t = i / seg, y = y0 + t * len, ww = w(t), wl = Array.isArray(ww) ? ww[0] : ww, wr = Array.isArray(ww) ? ww[1] : ww, C = c(t), H = th(t), Z = cz(t);
      const pts = single ? [[C + wr, 0], [C + wr * .15 - wl * .1, H], [C - wl, H * .7], [C - wl, -H * .7], [C + wr * .15 - wl * .1, -H]]
        : [[C + wr, 0], [C + wr * bev, H], [C - wl * bev, H], [C - wl, 0], [C - wl * bev, -H], [C + wr * bev, -H]];
      rings.push(pts.map(([x, z]) => [x, y, z + Z])); }
    return loft(rings, {flat: true}); }
  // closed thin slab from a parametric mid-surface f(u,v)->[x,y,z]
  function sheet(f, nu, nv, th) { const pos = [], uv = [], idx = [], N = (nu + 1) * (nv + 1), F = (i, j) => i * (nv + 1) + j, e = 1e-3, fr = [], bk = [];
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const u = i / nu, v = j / nv, p = V3(...f(u, v));
      const pu = V3(...f(Math.min(u + e, 1), v)).sub(V3(...f(Math.max(u - e, 0), v))), pv = V3(...f(u, Math.min(v + e, 1))).sub(V3(...f(u, Math.max(v - e, 0))));
      const n = pu.cross(pv); if (n.lengthSq() < 1e-14) n.set(0, 0, 1); n.normalize().multiplyScalar(th / 2); fr.push(p.clone().add(n)); bk.push(p.clone().sub(n)); }
    [...fr, ...bk].forEach(p => pos.push(p.x, p.y, p.z));
    for (let k = 0; k < 2; k++) for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) uv.push(i / nu, j / nv);
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = F(i, j), b = F(i + 1, j), c = F(i, j + 1), d = F(i + 1, j + 1);
      idx.push(a, b, c, b, d, c, N + a, N + c, N + b, N + b, N + c, N + d); }
    const loop = []; for (let i = 0; i < nu; i++) loop.push(F(i, 0)); for (let j = 0; j < nv; j++) loop.push(F(nu, j));
    for (let i = nu; i > 0; i--) loop.push(F(i, nv)); for (let j = nv; j > 0; j--) loop.push(F(0, j));
    for (let k = 0; k < loop.length; k++) { const p = loop[k], q = loop[(k + 1) % loop.length]; idx.push(q, p, N + p, q, N + p, N + q); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    fixWind(g); g.computeVertexNormals(); return g; }
  // capped arc tube in the XZ plane (gap centred on +Z), radius R, tube r, arc fraction f of a full turn
  function arcXZ(R, r, f, y = 0, sz = 1, rad = 8) { return taper(fcurve(t => { const a = (t - .5) * TAU * f; return [sin(a) * R, y, -cos(a) * R * sz]; }), r, r, Math.ceil(48 * f), rad); }
  function fib(n) { return [...Array(n).keys()].map(i => { const y = 1 - 2 * (i + .5) / n, r = Math.sqrt(1 - y * y), a = i * 2.39996; return V3(cos(a) * r, y, sin(a) * r); }); }
  function crystal(r, h, sides = 6, tip = .28) { return flat(lathe([[0, 0], [r * .75, h * .06], [r, h * .18], [r * .92, h * (1 - tip)], [0, h]], sides)); }
  function chainAlong(b, mat, curve, lr = .1, th = .03) { const L = curve.getLength(), n = Math.max(2, Math.round(L / (lr * 2.3)));
    for (let i = 0; i < n; i++) { const t = (i + .5) / n, p = curve.getPointAt(t), tg = curve.getTangentAt(t); const g = tor(lr, th, 6, 14); g.scale(1, 1.55, 1); if (i % 2) g.rotateY(PI / 2); b.add(mat, orient(g, p, tg)); } }
  // rune glyphs built from strokes in a unit square
  const GLY = [[[0, 0, 0, 1], [0, 1, .6, .65], [0, .55, .6, .25]], [[.5, 0, .5, 1], [0, .7, .5, 1], [1, .7, .5, 1]], [[0, 0, .5, 1], [.5, 1, 1, 0], [.2, .4, .8, .4]],
    [[0, 0, 1, 1], [0, 1, 1, 0], [.5, 0, .5, 1]], [[0, 0, 0, 1], [0, .5, 1, 1], [0, .5, 1, 0]], [[.2, 0, .2, 1], [.8, 0, .8, 1], [.2, .5, .8, .5]], [[0, 1, 1, 1], [.5, 1, .5, 0], [0, 0, 1, .4]], [[.5, 0, .5, 1], [.5, .6, 1, .9], [.5, .3, 0, .6]]];
  function glyph(k, s = .2, w = .035, d = .02) { return merge(GLY[k % GLY.length].map(([x1, y1, x2, y2]) => { const dx = (x2 - x1) * s, dy = (y2 - y1) * s, L = Math.hypot(dx, dy) + w;
    const g = box(w, L, d); g.rotateZ(Math.atan2(-dx, dy)); g.translate((x1 + x2) / 2 * s - s / 2, (y1 + y2) / 2 * s - s / 2, 0); return g; })); }
  function leaf(L = .5, w = .2) { const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([w * pow(sin(PI * t), .8) * (1 - .3 * t), t * L]); }
    for (let i = 9; i > 0; i--) { const t = i / 10; pts.push([-w * pow(sin(PI * t), .8) * (1 - .3 * t), t * L]); }
    const g = ext(pts, .008, .008, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, p.getZ(i) + x * x * 1.2 - y * y * .25 / L); } g.computeVertexNormals(); return g; }
  function feather(L = .7, w = .12) { const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([w * sin(PI * pow(t, .7)), t * L]); } for (let i = 7; i > 0; i--) { const t = i / 8; pts.push([-w * .8 * sin(PI * pow(t, .7)), t * L]); } return ext(pts, .006, .006, 1); }
  // small skull facing +Z, centred near origin, ~1 unit wide at s=1
  function skull(b, s = 1, x = 0, y = 0, z = 0, ry = 0, rx = 0, eye = 'glow') {
    const P = g => at(g, 0, 0, 0, 0, 0, 0, s), M = g => at(P(g), x, y, z, rx, ry, 0);
    b.add('bone', M(wob(at(sph(.5, 18, 14), 0, .12, -.05, 0, 0, 0, [1, .92, 1.12]), .025, 4)));
    b.add('bone', M(wob(at(sph(.34, 14, 10), 0, -.12, .28, 0, 0, 0, [.95, .8, 1]), .02, 5)));
    b.add('bone', M(at(taper(bez(V3(-.33, .12, .28), V3(-.12, .2, .55), V3(.12, .2, .55), V3(.33, .12, .28)), .07, .07, 12, 6), 0, 0, 0)));
    b.add('bone', M(at(taper(bez(V3(-.28, -.28, .05), V3(-.3, -.5, .5), V3(.3, -.5, .5), V3(.28, -.28, .05)), .06, .06, 14, 6, .7), 0, 0, 0)));
    b.add(eye, M(at(sph(.1, 10, 8), -.16, .03, .5)), M(at(sph(.1, 10, 8), .16, .03, .5)));
    b.add('darkmetal', M(at(cone(.05, .12, 6), 0, -.12, .6, -PI / 2.2, 0, 0)));
    for (let i = 0; i < 6; i++) { const a = -.5 + i * .2; b.add('tooth', M(at(cone(.035, .1, 6), a * .45, -.25, .5 + .05 * cos(a * 2), PI, 0, 0))); }
  }

  // ---------- weapon sub-assemblies ----------
  function grip(b, {gl = 1.1, r = .13, wrap = 'cloth', core = 'leather', diamond = false, turns = 5, y0 = -gl / 2} = {}) { const y1 = y0 + gl;
    b.add(core, lathe([[0, y0], [r, y0], [r * 1.04, (y0 + y1) / 2], [r, y1], [0, y1]], 14));
    if (diamond) b.add(wrap, helix(r * 1.03, y0 + .04, y1 - .04, turns, r * .2, 1), helix(r * 1.03, y0 + .04, y1 - .04, turns, r * .2, -1));
    else b.add(wrap, helix(r * 1.04, y0 + .04, y1 - .04, turns, r * .24, 1)); return y1; }
  function crossGuard(b, mat, W, y, r = .085, curl = .25) {
    b.add(mat, taper(bez(V3(-W, y + curl, 0), V3(-W * .45, y - .05, 0), V3(W * .45, y - .05, 0), V3(W, y + curl, 0)), t => r * (.55 + .5 * sin(PI * t)), 0, 24, 8, .75));
    b.add(mat, at(sph(r * 1.25, 10, 8), -W, y + curl, 0), at(sph(r * 1.25, 10, 8), W, y + curl, 0)); }
  function haft(b, y0, y1, r, mat = 'wood', r1 = r * .9) { b.add(mat, wob(cyl(r, r1, y1 - y0, 12, y0), .006, 3)); }
  function ferrule(b, mat, y, r, h = .14) { b.add(mat, lathe([[r * .95, y], [r * 1.12, y + h * .2], [r * 1.12, y + h * .8], [r * .95, y + h]], 14)); }
  function wraps(b, mat, y0, y1, r, n = 3) { for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * (i + .5) / n; b.add(mat, torY(r * 1.02, r * .14, y, 6, 20)); } }
  function axePts(R = 1.2, h = .9, neck = .26) { const pts = [];
    for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([.12 + t * (R * .85 - .12), neck + (h - neck) * t * t]); }
    for (let i = 1; i < 16; i++) { const s = 1 - i / 8; pts.push([R * .85 + (R * .15 + .12) * (1 - s * s), h * s]); }
    for (let i = 0; i <= 8; i++) { const t = 1 - i / 8; pts.push([.12 + t * (R * .85 - .12), -(neck + (h - neck) * t * t)]); }
    pts.push([.12, -neck * .8]); pts.push([.12, neck * .8]); return pts; }
  function sharpenX(g, R, min = .18) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = Math.max(0, p.getX(i)); p.setZ(i, p.getZ(i) * Math.max(min, 1 - pow(x / R, 1.6) * .9)); } g.computeVertexNormals(); return g; }
  function spikedBall(b, r, y, n = 14, sl = .45, mat = 'darkmetal', smat = 'metal') { const c = typeof y === 'number' ? V3(0, y, 0) : y; b.add(mat, at(sph(r, 18, 14), c.x, c.y, c.z));
    fib(n).forEach(d => b.add(smat, orient(cone(r * .22, r * sl * 2, 8), c.clone().addScaledVector(d, r * .85), d))); }
  function stadium(w, y0, y1, n) { // outline of a bar (right side up, round tip, left side down) resampled to n points
    const r = w / 2, pts = []; for (let i = 0; i <= 20; i++) pts.push(V3(r, y0 + (y1 - r - y0) * i / 20, 0));
    for (let i = 1; i < 20; i++) { const a = i / 20 * PI; pts.push(V3(r * cos(a), y1 - r + r * sin(a), 0)); }
    for (let i = 0; i <= 20; i++) pts.push(V3(-r, y1 - r - (y1 - r - y0) * i / 20, 0));
    const c = new T.CatmullRomCurve3(pts, false, 'centripetal'); return [...Array(n).keys()].map(i => ({p: c.getPointAt(i / (n - 1)), t: c.getTangentAt(i / (n - 1))})); }
  function nozzle(b, R, L, mat = 'darkmetal', gm = 'glow') { b.add(mat, lathe([[R * .55, 0], [R * .7, L * .1], [R, L * .9], [R * 1.05, L], [R * .9, L], [R * .55, L * .3], [R * .5, L * .2]], 16)); b.add(gm, cyl(R * .5, R * .5, L * .05, 14, L * .25)); }

  const parts = [];
  const P = (id, group, sub, name, tags, make, s = 1) => parts.push({id: 'wp_' + id, group, sub, name, tags, make: () => { srand(s * 7919 + 13); return make(); }});
  const W = 'Weapons', A = 'Accessories & Magic';

  // ======================= WEAPONS : SWORDS =======================
  P('longsword', W, 'Swords', 'Knight longsword', ['sword', 'blade', 'knight'], () => { const b = bag();
    grip(b, {gl: 1.1, r: .13}); crossGuard(b, 'metal', .95, .62, .085, .25);
    b.add('metal', at(rbox(.4, .28, .26, .06), 0, .66, 0)); b.add('crystal', at(sph(.07, 10, 8), 0, .66, .13, 0, 0, 0, [1, 1, .5]), at(sph(.07, 10, 8), 0, .66, -.13, 0, 0, 0, [1, 1, .5]));
    b.add('metal', blade({len: 3.7, y0: .78, seg: 22, w: t => .23 * (1 - pow(t, 5)) * (1 - .18 * t) + .003, th: t => .055 * (1 - t * .6) + .004}));
    b.add('darkmetal', blade({len: 2.4, y0: .82, seg: 8, w: t => .045 * (1 - pow(t, 4)) + .002, th: t => .057 * (1 - t * .6 * .65) + .006}));
    b.add('metal', lathe([[0, -.9], [.1, -.89], [.19, -.78], [.2, -.7], [.15, -.6], [.09, -.56], [0, -.55]], 16));
    return b.out(); });
  P('greatsword', W, 'Swords', 'Rune greatsword', ['sword', 'two-handed', 'rune', 'glow'], () => { const b = bag();
    grip(b, {gl: 1.8, r: .15, turns: 8, y0: -1.1}); const gy = .7;
    b.add('darkmetal', taper(bez(V3(-1.3, gy - .35, 0), V3(-.6, gy + .25, 0), V3(.6, gy + .25, 0), V3(1.3, gy - .35, 0)), t => .1 * (.5 + .6 * sin(PI * t)), 0, 28, 8, .7));
    [-1, 1].forEach(s => b.add('metal', orient(cone(.08, .45, 8), V3(s * 1.3, gy - .35, 0), V3(s * .6, -1, 0))));
    b.add('darkmetal', at(rbox(.62, .4, .3, .08), 0, gy + .1, 0)); b.add('crystal', at(crystal(.12, .34, 6), 0, gy - .07, .16, PI / 2, 0, 0, [1, 1, .4]));
    const th = t => .075 * (1 - t * .55) + .005, w = t => t < .1 ? .17 : t < .13 ? .17 + (t - .1) / .03 * .25 : .42 * (1 - pow((t - .13) / .87, 6)) * (1 - .2 * t) + .004;
    b.add('metal', blade({len: 5.2, y0: .95, seg: 34, w, th}));
    b.add('leather', helix(.18, 1.0, 1.4, 3, .035, 1));
    for (let i = 0; i < 7; i++) { const t = .2 + i * .085, y = .95 + t * 5.2, H = th(t); b.add('glow', at(glyph(i, .22, .04, .02), 0, y, H + .004), at(glyph(i + 3, .22, .04, .02), 0, y, -H - .004)); }
    b.add('darkmetal', lathe([[0, -1.45], [.14, -1.42], [.24, -1.3], [.2, -1.16], [.12, -1.1], [0, -1.1]], 14)); b.add('crystal', at(sph(.11, 10, 8), 0, -1.48, 0));
    return b.out(); });
  P('katana', W, 'Swords', 'Curved katana', ['sword', 'katana', 'samurai', 'japan'], () => { const b = bag();
    grip(b, {gl: 1.35, r: .12, diamond: true, turns: 6, core: 'bone', wrap: 'cloth', y0: -.7});
    b.add('gold', at(sph(.07, 8, 6), 0, -.15, .12, 0, 0, 0, [1.6, .8, .6]), at(sph(.07, 8, 6), 0, .2, -.12, 0, 0, 0, [1.6, .8, .6]));
    b.add('darkmetal', lathe([[0, -.86], [.1, -.85], [.135, -.78], [.13, -.7], [0, -.7]], 14));
    b.add('darkmetal', at(lathe([[0, .65], [.36, .65], [.4, .68], [.4, .7], [.36, .73], [0, .73]], 28), 0, 0, 0, 0, 0, 0, [1, 1, .82]));
    b.add('gold', at(rbox(.18, .14, .14, .03), -.01, .8, 0));
    const W0 = .16, wl = .05;
    b.add('metal', blade({len: 4.0, y0: .82, seg: 44, single: true, c: t => -.32 * t * t, th: t => .045 * (1 - .5 * t) + .006,
      w: t => [wl * (1 - .3 * t), t < .9 ? W0 * (1 - .25 * t) : W0 * .78 - (W0 * .78 + wl * .7) * pow((t - .9) / .1, 1.4)]}));
    return b.out(); });
  P('scimitar', W, 'Swords', 'Desert scimitar', ['sword', 'curved', 'sabre'], () => { const b = bag();
    grip(b, {gl: 1.0, r: .12, core: 'wood', wrap: 'leather'});
    b.add('gold', taper(bez(V3(.42, .55, 0), V3(.75, .2, 0), V3(.6, -.45, 0), V3(.15, -.55, 0)), .045, .04, 20, 6));
    b.add('gold', at(rbox(.95, .14, .2, .05), .05, .58, 0)); b.add('gold', at(sph(.08, 10, 8), -.47, .6, 0));
    b.add('gold', at(lathe([[0, -.5], [.14, -.52], [.17, -.62], [.12, -.72], [0, -.78]], 12), 0, 0, 0, 0, 0, -.25));
    const wl = .05; b.add('metal', blade({len: 3.6, y0: .65, seg: 40, single: true, c: t => -.75 * t * t, th: t => .045 * (1 - .4 * t) + .006,
      w: t => [wl, t < .78 ? .12 + .2 * pow(t, 1.6) : (.12 + .2 * pow(.78, 1.6)) - (.12 + .2 * pow(.78, 1.6) + wl * .8) * pow((t - .78) / .22, 1.2)]}));
    return b.out(); });
  P('bonesword', W, 'Swords', 'Serrated bone sword', ['sword', 'bone', 'primal', 'monster'], () => { const b = bag();
    for (let i = 0; i < 5; i++) b.add('bone', wob(lathe([[0, -.6 + i * .22], [.15, -.6 + i * .22], [.18, -.5 + i * .22], [.15, -.4 + i * .22], [0, -.4 + i * .22]], 12), .02, 6));
    b.add('leather', helix(.16, -.55, .4, 3, .03, 1)); b.add('bone', wob(at(sph(.2, 12, 10), 0, -.72, 0), .04, 5));
    [-1, 1].forEach(s => b.add('bone', wob(taper(bez(V3(0, .5, 0), V3(s * .5, .4, 0), V3(s * .8, .7, 0), V3(s * .75, 1.1, .05)), .12, .02, 16, 8), .02, 5)));
    const teeth = 9, saw = t => { const f = (t * teeth) % 1; return .1 * (1 - f); };
    b.add('bone', wob(blade({len: 3.8, y0: .5, seg: teeth * 6, c: t => -.15 * t, th: t => .08 * (1 - .6 * t) + .008,
      w: t => [.22 * (1 - pow(t, 2.2)) + .01, (.2 + saw(t)) * (1 - pow(t, 2.5)) + .01]}), .025, 3));
    for (let i = 0; i < 6; i++) { const t = .15 + i * .12, y = .5 + t * 3.8, x = -.15 * t - .22 * (1 - pow(t, 2.2)); b.add('tooth', orient(cone(.05, .28 * (1 - t * .5), 7), V3(x + .03, y, 0), V3(-1, .9, 0))); }
    return b.out(); });
  P('crystalsword', W, 'Swords', 'Crystal blade', ['sword', 'crystal', 'magic'], () => { const b = bag();
    grip(b, {gl: 1.0, r: .12, core: 'darkmetal', wrap: 'cloth'});
    b.add('gold', at(lathe([[0, .5], [.25, .5], [.32, .58], [.22, .7], [0, .72]], 12), 0, 0, 0, 0, 0, 0, [1.6, 1, 1]));
    for (let i = 0; i < 7; i++) { const s = i % 2 ? 1 : -1, k = Math.floor(i / 2); const d = V3(s * (1 - k * .2), .6 + k * .5, rr(-.3, .3));
      b.add('crystal', orient(crystal(.07 + rnd() * .03, .45 + rnd() * .3, 5), V3(s * .2, .62, 0), d)); }
    b.add('crystal', blade({len: 3.4, y0: .68, seg: 14, bev: .12, w: t => .26 * (1 - pow(t, 1.4)) * (1 + .14 * sin(t * 25)) + .004, th: t => .1 * (1 - .7 * t) + .01}));
    b.add('crystal', at(crystal(.13, .4, 6), 0, -.55, 0, PI, 0, 0));
    return b.out(); });
  P('chainsword', W, 'Swords', 'Chainsword', ['sword', 'chainsaw', 'mech', 'sci-fi'], () => { const b = bag();
    grip(b, {gl: 1.0, r: .13, core: 'rubber', wrap: 'darkmetal', turns: 4});
    b.add('metal', taper(bez(V3(.18, .45, 0), V3(.55, .2, 0), V3(.45, -.5, 0), V3(.15, -.55, 0)), .045, .045, 16, 6));
    b.add('paint', at(rbox(.8, .85, .55, .1), 0, 1.0, 0)); for (let i = 0; i < 5; i++) b.add('darkmetal', at(rbox(.05, .55, .6, .02), -.3 + i * .15, 1.0, 0));
    [-1, 1].forEach(s => b.add('metal', at(cyl(.06, .05, .4, 10), s * .3, 1.25, -.25, 0, 0, s * .3)));
    b.add('darkmetal', lathe([[0, -.62], [.15, -.6], [.17, -.5], [0, -.5]], 12));
    const y0 = 1.35, y1 = 4.6, w = .62;
    b.add('metal', ext(shp([...[...Array(13).keys()].map(i => { const a = i / 12 * PI; return [w / 2 * cos(a) * .82, y1 - w / 2 + w / 2 * sin(a) * .82]; }), [-w / 2 * .82, y0], [w / 2 * .82, y0]]), .1, .03, 2));
    b.add('gold', at(rbox(.12, 2.4, .16, .03), 0, 2.85, 0));
    stadium(w, y0, y1, 46).forEach(({p, t}, i) => { const nrm = V3(t.y, -t.x, 0).normalize();
      b.add('darkmetal', orient(at(box(.09, .12, .14), 0, 0, 0), p, t));
      b.add('metal', orient(at(ext([[-.05, 0], [.05, 0], [.06, .1], [0, .16]], .06, .012, 1), 0, 0, 0, 0, 0, 0), p.clone().addScaledVector(nrm, .04), nrm.clone().addScaledVector(t, .7))); });
    return b.out(); });
  P('energyblade', W, 'Swords', 'Energy edge blade', ['sword', 'energy', 'glow', 'sci-fi'], () => { const b = bag();
    b.add('rubber', lathe([[0, -.6], [.14, -.6], [.14, .45], [0, .45]], 16)); for (let i = 0; i < 7; i++) b.add('rubber', torY(.145, .03, -.5 + i * .15, 6, 18));
    b.add('metal', lathe([[0, -.85], [.12, -.85], [.17, -.75], [.17, -.62], [.14, -.6], [0, -.6]], 18));
    b.add('metal', lathe([[0, .45], [.16, .45], [.22, .55], [.22, .72], [.3, .78], [.3, .86], [.18, .9], [0, .9]], 18)); b.add('glow', at(rbox(.06, .14, .05, .015), 0, .62, .22));
    [-1, 1].forEach(s => b.add('darkmetal', at(ext([[0, 0], [.4, .15], [.45, .3], [.05, .12]], .1, .03), s * .2, .72, 0, 0, s < 0 ? PI : 0, 0)));
    const w = t => .2 * (1 - pow(t, 3)) + .003, th = t => .045 * (1 - .5 * t) + .004;
    b.add('darkmetal', blade({len: 3.8, y0: .9, seg: 22, w, th}));
    b.add('glow', blade({len: 3.95, y0: .88, seg: 22, w: t => w(t) * 1.13 + .025 * (1 - t), th: t => th(t) * .35}));
    b.add('glow', blade({len: 3.0, y0: 1.0, seg: 10, w: t => .025 * (1 - t) + .004, th: t => th(t * .78) + .006}));
    return b.out(); });
  P('twinblade', W, 'Swords', 'Twin-blade staff', ['sword', 'double', 'staff'], () => { const b = bag();
    b.add('darkmetal', cyl(.12, .12, 2.2, 14, -1.1)); grip(b, {gl: .8, r: .13, y0: -.4, wrap: 'cloth'});
    [-1, 1].forEach(s => { b.add('gold', at(lathe([[0, 1.0], [.2, 1.0], [.28, 1.1], [.2, 1.25], [0, 1.25]], 14), 0, 0, 0, 0, 0, s < 0 ? PI : 0));
      const bl = blade({len: 2.9, y0: 1.2, seg: 32, single: true, c: t => -.45 * t * t, th: t => .05 * (1 - .5 * t) + .005, w: t => [.07, t < .8 ? .2 + .08 * sin(t * PI) : (.2 + .08 * sin(.8 * PI)) - (.27 + .05) * pow((t - .8) / .2, 1.3)]});
      b.add('metal', s < 0 ? at(bl, 0, 0, 0, 0, 0, PI) : bl); wraps(b, 'leather', s * .55 - .1, s * .55 + .1, .12, 2); });
    return b.out(); });
  P('cleaver', W, 'Swords', 'Monster cleaver', ['sword', 'cleaver', 'huge', 'hunter'], () => { const b = bag();
    grip(b, {gl: 1.6, r: .15, y0: -1.0, wrap: 'leather', core: 'wood', turns: 6});
    b.add('darkmetal', lathe([[0, -1.25], [.16, -1.22], [.22, -1.1], [.17, -1.0], [0, -1.0]], 14));
    const s = shp([[-.35, .65], [.75, .65], [.95, 1.1], [1.0, 4.4], [.55, 5.1], [-.35, 4.7]]); const h = new T.Path(); h.absarc(-.02, 4.2, .16, 0, TAU, true); s.holes.push(h);
    b.add('metal', sharpenX(ext(s, .1, .05, 2), 1.0, .22));
    b.add('darkmetal', at(rbox(.22, 4.0, .26, .06), -.36, 2.7, 0)); for (let i = 0; i < 8; i++) b.add('gold', at(sph(.05, 8, 6), -.24, 1.0 + i * .5, .13), at(sph(.05, 8, 6), -.24, 1.0 + i * .5, -.13));
    b.add('darkmetal', at(rbox(.7, .3, .36, .08), .05, .6, 0));
    return b.out(); });

  // ======================= AXES & HAMMERS =======================
  P('battleaxe', W, 'Axes & Hammers', 'Bearded battle axe', ['axe', 'viking'], () => { const b = bag();
    haft(b, -1.4, 4.0, .12); wraps(b, 'leather', -.6, .6, .12, 6); ferrule(b, 'metal', -1.5, .12, .16);
    b.add('metal', at(sharpenX(ext(axePts(1.3, 1.0, .3), .08, .05, 2), 1.4, .15), 0, 3.3, 0));
    b.add('metal', at(cyl(.2, .2, .8, 14), 0, 2.9, 0)); b.add('metal', orient(cone(.12, .7, 8), V3(-.15, 3.3, 0), V3(-1, .1, 0)));
    b.add('metal', at(cone(.1, .45, 8), 0, 3.7, 0)); [-1, 1].forEach(s => b.add('metal', at(box(.05, 1.0, .03), 0, 2.4, s * .12)));
    b.add('gold', torY(.21, .04, 2.95), torY(.21, .04, 3.65)); return b.out(); });
  P('doubleaxe', W, 'Axes & Hammers', 'Double-bit axe', ['axe', 'double', 'barbarian'], () => { const b = bag();
    haft(b, -1.2, 4.2, .13, 'darkmetal'); grip(b, {gl: 1.4, r: .15, y0: -.7, wrap: 'leather', core: 'leather'});
    [0, PI].forEach(r => b.add('metal', at(sharpenX(ext(axePts(1.15, 1.05, .32), .08, .05, 2), 1.3, .15), 0, 3.4, 0, 0, r, 0)));
    b.add('gold', lathe([[.18, 2.85], [.28, 2.95], [.3, 3.85], [.2, 3.95]], 16));
    b.add('metal', blade({len: .9, y0: 3.9, seg: 8, w: t => .14 * sin(PI * pow(t, .6)) + .002, th: t => .05}));
    spikedBall(b, .14, -1.3, 8, .4, 'gold', 'gold'); return b.out(); });
  P('warhammer', W, 'Axes & Hammers', 'War hammer', ['hammer', 'pick', 'knight'], () => { const b = bag();
    haft(b, -1.4, 3.7, .12); grip(b, {gl: 1.2, r: .14, y0: -.6}); ferrule(b, 'metal', 2.3, .12, .3);
    b.add('metal', at(rbox(1.0, .6, .6, .12), .25, 3.3, 0)); b.add('darkmetal', at(lathe([[0, 0], [.38, 0], [.42, .06], [.36, .14], [0, .14]], 8), .75, 3.3, 0, 0, 0, -PI / 2));
    b.add('metal', taper(bez(V3(-.2, 3.3, 0), V3(-.6, 3.35, 0), V3(-1.0, 3.1, 0), V3(-1.25, 2.75, 0)), .17, .01, 18, 8, .6));
    b.add('metal', at(cone(.12, .55, 8), .1, 3.55, 0)); b.add('gold', at(rbox(.6, .66, .66, .04), .25, 3.3, 0, 0, 0, 0, [.25, 1, 1]));
    b.add('metal', lathe([[0, -1.6], [.15, -1.55], [.15, -1.4], [0, -1.4]], 10)); return b.out(); });
  P('mechhammer', W, 'Axes & Hammers', 'Thruster mech hammer', ['hammer', 'mech', 'rocket', 'sci-fi'], () => { const b = bag();
    b.add('metal', cyl(.16, .16, 4.4, 16, -1.2)); for (let i = 0; i < 3; i++) b.add('darkmetal', at(lathe([[.16, 0], [.24, .05], [.24, .4], [.16, .45]], 16), 0, .9 + i * .7, 0));
    grip(b, {gl: 1.4, r: .18, y0: -.8, core: 'rubber', wrap: 'rubber', turns: 7}); b.add('darkmetal', lathe([[0, -1.5], [.25, -1.45], [.28, -1.2], [0, -1.15]], 14));
    const hy = 3.4, hl = 2.4, R = .75; b.add('darkmetal', at(lathe([[0, -hl / 2], [R * .85, -hl / 2], [R, -hl / 2 + .12], [R, hl / 2 - .12], [R * .85, hl / 2], [0, hl / 2]], 24), 0, hy, 0, 0, 0, PI / 2));
    for (let i = 0; i < 4; i++) b.add('paint', at(lathe([[R, 0], [R + .06, .03], [R + .06, .25], [R, .28]], 24), -hl / 2 + .2 + i * .58, hy, 0, 0, 0, -PI / 2));
    b.add('metal', at(lathe([[0, 0], [R * .9, 0], [R * .95, .12], [R * .7, .2], [0, .2]], 6), hl / 2, hy, 0, 0, 0, -PI / 2));
    [[0, .35], [.3, -.2], [-.3, -.2]].forEach(([z, y]) => { const g = bag(); nozzle(g, .2, .55);
      g.out().forEach(({geo, mat}) => b.add(mat, at(geo, -hl / 2, hy + y, z, 0, 0, PI / 2))); });
    b.add('paint2', at(rbox(.5, .5, .3, .08), 0, hy, R + .05)); b.add('glow', at(rbox(.3, .08, .05, .02), 0, hy + .1, R + .2));
    b.add('metal', at(cyl(.08, .08, 1.2, 10), 0, hy - 1.1, .35, -.25, 0, 0)); return b.out(); });
  P('maul', W, 'Axes & Hammers', 'Stone maul', ['hammer', 'stone', 'primal', 'giant'], () => { const b = bag();
    haft(b, -1.6, 3.4, .16); wraps(b, 'leather', -.8, .6, .16, 6);
    b.add('stone', flat(wob(at(new T.BoxGeometry(1.9, 1.2, 1.2, 4, 3, 3), 0, 3.45, 0), .14, 1.3)));
    [-.55, .55].forEach(x => { const g = lathe([[.9, -.12], [.97, -.08], [.97, .08], [.9, .12], [.86, 0]], 4); g.rotateY(PI / 4); g.rotateZ(PI / 2); b.add('darkmetal', flat(g.translate(x, 3.45, 0))); });
    b.add('leather', torY(.18, .05, 2.65)); b.add('bone', orient(cone(.07, .5, 6), V3(0, 2.7, .15), V3(.3, -1, 1))); return b.out(); });
  P('mace', W, 'Axes & Hammers', 'Flanged mace', ['mace', 'knight', 'cleric'], () => { const b = bag();
    b.add('metal', cyl(.11, .1, 3.2, 14, -.8)); grip(b, {gl: 1.1, r: .13, y0: -.6}); b.add('metal', lathe([[0, -.95], [.14, -.9], [.2, -.8], [.12, -.7], [0, -.68]], 12));
    b.add('metal', lathe([[0, 2.2], [.18, 2.25], [.3, 2.6], [.3, 2.95], [.15, 3.2], [0, 3.25]], 16));
    for (let i = 0; i < 7; i++) b.add('darkmetal', at(ext([[0, 0], [.32, .15], [.5, .5], [.42, .85], [.1, 1.05], [0, 1.0]], .05, .025), .2, 2.25, 0, 0, i / 7 * TAU, 0));
    b.add('gold', at(cone(.1, .4, 8), 0, 3.2, 0)); b.add('gold', torY(.13, .04, 2.15)); return b.out(); });
  P('morningstar', W, 'Axes & Hammers', 'Morning star flail', ['flail', 'chain', 'spiked'], () => { const b = bag();
    grip(b, {gl: 1.3, r: .13, y0: -.6, core: 'wood'}); b.add('metal', lathe([[0, -.8], [.15, -.75], [.18, -.62], [0, -.6]], 12));
    b.add('metal', lathe([[.13, .7], [.17, .75], [.17, 1.0], [.1, 1.1], [0, 1.15]], 12)); b.add('metal', at(tor(.1, .03, 6, 14), 0, 1.25, 0));
    chainAlong(b, 'darkmetal', bez(V3(0, 1.35, 0), V3(.4, 2.0, 0), V3(.7, 2.6, 0), V3(.75, 3.15, 0)), .09, .028);
    spikedBall(b, .45, 3.65, 18, .5); b.add('darkmetal', at(tor(.1, .03, 6, 14), .75, 3.2, 0, 0, PI / 2, 0)); b.add('metal', at(sph(.1, 8, 6), .75, 3.2, 0)); return b.out(); });

  // ======================= POLEARMS =======================
  P('spear', W, 'Polearms', 'Leaf spear', ['spear', 'pole', 'hoplite'], () => { const b = bag();
    haft(b, -2.4, 4.7, .1); wraps(b, 'leather', -.5, .5, .1, 4);
    b.add('metal', lathe([[.09, 4.4], [.12, 4.45], [.1, 4.75], [.07, 4.9]], 12)); b.add('gold', torY(.12, .035, 4.5));
    b.add('metal', blade({len: 1.5, y0: 4.85, seg: 16, w: t => .3 * pow(sin(PI * pow(t, .62)), .85) + .03 * (1 - t) + .002, th: t => .045 * (1 - .6 * t) + .004, bev: .25}));
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; b.add('cloth', taper(bez(V3(0, 4.45, 0), V3(cos(a) * .2, 4.3, sin(a) * .2), V3(cos(a) * .25, 3.9, sin(a) * .3), V3(cos(a) * .3 + .1, 3.5, sin(a) * .35)), .04, .015, 12, 5, .5)); }
    b.add('metal', at(cone(.1, .4, 8), 0, -2.4, 0, PI, 0, 0)); return b.out(); });
  P('trident', W, 'Polearms', 'Sea trident', ['trident', 'spear', 'ocean'], () => { const b = bag();
    haft(b, -2.0, 4.3, .11, 'gold', .1); grip(b, {gl: 1.2, r: .13, y0: -.6, core: 'leather', wrap: 'cloth'});
    b.add('gold', taper(bez(V3(-.75, 4.6, 0), V3(-.45, 4.15, 0), V3(.45, 4.15, 0), V3(.75, 4.6, 0)), t => .09 * (.7 + .4 * sin(PI * t)), 0, 20, 8));
    b.add('gold', lathe([[.1, 4.0], [.18, 4.15], [.16, 4.4], [.08, 4.5]], 14)); b.add('crystal', at(sph(.12, 12, 8), 0, 4.25, .14, 0, 0, 0, [1, 1, .6]));
    [-1, 0, 1].forEach(s => { const x = s * .75, top = s ? 5.8 : 6.2, y0 = s ? 4.55 : 4.4;
      b.add('metal', taper(s ? bez(V3(x, y0, 0), V3(x * 1.05, y0 + .5, 0), V3(x * .9, top - .5, 0)) : bez(V3(0, y0, 0), V3(0, 5, 0), V3(0, top - .4, 0)), .08, .05, 14, 8, .8));
      b.add('metal', blade({len: .6, y0: top - .42, seg: 6, c: () => s ? x * .9 : 0, w: t => [.13 * (1 - t) + (s < 0 ? .08 * (1 - t) : 0), .13 * (1 - t) + (s > 0 ? .08 * (1 - t) : 0)], th: t => .05 * (1 - t) + .005}));
      b.add('metal', orient(cone(.05, .3, 6), V3(s ? x * .9 + s * .05 : .07, top - .35, 0), V3(s || 1, -1.4, 0))); });
    b.add('gold', at(cone(.1, .35, 8), 0, -2.0, 0, PI, 0, 0)); return b.out(); });
  P('halberd', W, 'Polearms', 'Halberd', ['halberd', 'axe', 'pole', 'guard'], () => { const b = bag();
    haft(b, -2.2, 5.4, .1); wraps(b, 'leather', -.4, .4, .1, 3); wraps(b, 'leather', 1.8, 2.6, .1, 3);
    b.add('metal', at(sharpenX(ext([[0, -.5], [.6, -.75], [1.0, -.95], [1.15, -.4], [1.15, .5], [.95, .85], [.6, .3], [0, .35]], .07, .04, 2), 1.15, .15), .05, 4.9, 0));
    b.add('metal', taper(bez(V3(-.05, 5.0, 0), V3(-.5, 5.0, 0), V3(-.8, 4.8, 0), V3(-.95, 4.4, 0)), .12, .01, 16, 6, .5));
    b.add('metal', blade({len: 1.3, y0: 5.4, seg: 10, w: t => .11 * (1 - pow(t, 1.5)) + .002, th: t => .05}));
    b.add('metal', at(cyl(.14, .14, .8, 12), 0, 4.55, 0)); [-1, 1].forEach(s => b.add('metal', at(box(.05, 1.3, .03), 0, 3.8, s * .1)));
    b.add('cloth', at(sheet((u, v) => [(u - .5) * .4, -v * .9, .03 * sin(v * 8 + u * 3)], 6, 10, .02), 0, 4.15, .12, 0, 0, 0)); return b.out(); });
  P('scythe', W, 'Polearms', 'Reaper scythe', ['scythe', 'death', 'reaper'], () => { const b = bag();
    b.add('wood', wob(taper(cr([V3(0, -1.8, 0), V3(.08, 0, 0), V3(-.05, 2.5, 0), V3(.1, 5.2, 0)]), .12, .1, 24, 10), .01, 3));
    b.add('wood', at(taper(bez(V3(0, 0, 0), V3(0, .05, .35), V3(0, .15, .55)), .07, .06, 8, 8), .08, 1.7, 0));
    b.add('darkmetal', lathe([[.13, 5.0], [.17, 5.1], [.17, 5.45], [.1, 5.55]], 12)); b.add('bone', at(sph(.15, 10, 8), .1, 5.6, 0)); b.add('darkmetal', at(cone(.1, .5, 8), 0, -1.8, 0, PI, 0, 0));
    const bl = blade({len: 3.8, seg: 40, single: true, c: t => .9 * t * t, th: t => .05 * (1 - .6 * t) + .004, w: t => [.07 * (1 - t) + .01, .32 * (1 - pow(t, 1.3)) + .005]});
    b.add('metal', at(bl, .05, 5.3, 0, 0, 0, -PI / 2));
    b.add('darkmetal', at(ext([[0, -.12], [.35, -.18], [.35, .2], [0, .14]], .14, .03), 0, 5.3, 0)); return b.out(); });
  P('glaive', W, 'Polearms', 'Glaive', ['glaive', 'pole', 'blade'], () => { const b = bag();
    haft(b, -2.0, 4.4, .11, 'darkmetal', .11); grip(b, {gl: 1.3, r: .13, y0: -.65}); grip(b, {gl: .8, r: .13, y0: 2.6, wrap: 'cloth'});
    b.add('gold', lathe([[.12, 4.3], [.22, 4.4], [.22, 4.6], [.15, 4.7]], 14));
    b.add('metal', blade({len: 2.4, y0: 4.65, seg: 26, single: true, c: t => .25 * t * t, th: t => .06 * (1 - .5 * t) + .005, w: t => [.12, t < .75 ? .25 + .12 * t : (.34) - (.34 + .1) * pow((t - .75) / .25, 1.3)]}));
    b.add('metal', orient(cone(.07, .5, 6), V3(-.1, 4.9, 0), V3(-1, .6, 0))); b.add('gold', at(cone(.1, .4, 8), 0, -2.0, 0, PI, 0, 0)); return b.out(); });
  P('naginata', W, 'Polearms', 'Naginata', ['naginata', 'japan', 'pole', 'samurai'], () => { const b = bag();
    haft(b, -2.2, 3.9, .11, 'paint', .1); grip(b, {gl: 1.0, r: .125, y0: -.5, diamond: true, core: 'cloth', wrap: 'leather', turns: 4});
    b.add('darkmetal', lathe([[.1, 3.75], [.13, 3.8], [.13, 4.05], [.1, 4.1]], 12)); b.add('darkmetal', at(lathe([[0, 4.1], [.32, 4.1], [.34, 4.14], [.32, 4.17], [0, 4.17]], 24), 0, 0, 0, 0, 0, 0, [1, 1, .8]));
    b.add('gold', at(rbox(.16, .14, .14, .03), 0, 4.24, 0));
    b.add('metal', blade({len: 2.3, y0: 4.25, seg: 32, single: true, c: t => -.45 * t * t, th: t => .045 * (1 - .4 * t) + .005, w: t => [.05, t < .8 ? .14 + .1 * t : .22 - (.22 + .04) * pow((t - .8) / .2, 1.3)]}));
    b.add('metal', at(lathe([[0, 0], [.12, 0], [.11, .25], [0, .3]], 10), 0, -2.2, 0, PI, 0, 0)); return b.out(); });

  // ======================= STAFFS & WANDS =======================
  P('crystalstaff', W, 'Staffs & Wands', 'Crystal staff', ['staff', 'wizard', 'crystal', 'magic'], () => { const b = bag();
    b.add('wood', wob(taper(cr([V3(0, -1.6, 0), V3(.05, 1, 0), V3(-.04, 3.5, 0), V3(0, 4.6, 0)]), .1, .13, 24, 10), .015, 2.5)); wraps(b, 'leather', -.4, .4, .11, 4);
    b.add('gold', lathe([[.13, 4.4], [.2, 4.5], [.17, 4.7], [.08, 4.8]], 14));
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + PI / 4; b.add('gold', taper(bez(V3(cos(a) * .15, 4.65, sin(a) * .15), V3(cos(a) * .5, 4.9, sin(a) * .5), V3(cos(a) * .42, 5.6, sin(a) * .42), V3(cos(a) * .12, 5.85, sin(a) * .12)), .055, .015, 18, 6)); }
    b.add('crystal', at(crystal(.25, 1.25, 6, .3), 0, 4.75, 0)); b.add('glow', at(sph(.12, 10, 8), 0, 5.2, 0));
    b.add('glow', at(annulus(.62, .7, .03), 0, 5.25, 0, .3, 0, .2)); for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; b.add('crystal', at(crystal(.06, .25, 5), cos(a) * .8, 5.0 + i * .15, sin(a) * .8, .4, a, .3)); }
    b.add('gold', at(cone(.1, .3, 8), 0, -1.6, 0, PI, 0, 0)); return b.out(); });
  P('gnarledstaff', W, 'Staffs & Wands', 'Gnarled druid staff', ['staff', 'wood', 'druid', 'nature'], () => { const b = bag();
    const pts = [V3(0, -1.6, 0), V3(.08, -.5, .03), V3(-.06, .8, -.04), V3(.1, 2.2, .05), V3(-.05, 3.4, 0), V3(.2, 4.3, 0), V3(.55, 4.85, 0), V3(.4, 5.35, 0), V3(.0, 5.3, 0), V3(-.1, 4.9, 0)];
    b.add('wood', wob(taper(cr(pts), t => .14 * (1 - .65 * t) + .02 * sin(t * 40), 0, 70, 10), .035, 3));
    [[.9, V3(-.4, .5, .2)], [.6, V3(.5, .6, -.3)], [.45, V3(-.4, .8, -.2)]].forEach(([y, d], i) => { const p = V3(0, y * 4.4, 0); b.add('wood', wob(taper(bez(p, p.clone().addScaledVector(d, .5), p.clone().addScaledVector(d, .9).add(V3(0, .4, 0))), .06, .01, 12, 6), .02, 4)); b.add('paint2', orient(leaf(.35, .13), p.clone().addScaledVector(d, .9).add(V3(0, .4, 0)), d.clone().add(V3(0, 1, 0)))); });
    b.add('glow', at(sph(.26, 16, 12), .22, 4.85, 0)); for (let i = 0; i < 5; i++) b.add('paint2', orient(leaf(.4, .14), V3(.1, 4.2 + i * .05, 0), V3(cos(i * 1.3), .8, sin(i * 1.3))));
    b.add('fur', wob(at(sph(.2, 10, 8), .02, 3.9, 0, 0, 0, 0, [1, .6, 1]), .05, 6)); return b.out(); });
  P('skullstaff', W, 'Staffs & Wands', 'Necromancer skull staff', ['staff', 'skull', 'necromancer', 'dark'], () => { const b = bag();
    b.add('darkmetal', taper(cr([V3(0, -1.6, 0), V3(.03, 1.5, 0), V3(0, 4.2, 0)]), .1, .09, 12, 10)); grip(b, {gl: 1.0, r: .12, y0: -.5, core: 'leather', wrap: 'cloth'});
    for (let i = 0; i < 3; i++) b.add('bone', wob(lathe([[.09, 3.4 + i * .25], [.16, 3.47 + i * .25], [.16, 3.55 + i * .25], [.09, 3.62 + i * .25]], 10), .015, 6));
    skull(b, .9, 0, 4.65, 0); [-1, 1].forEach(s => b.add('horn', wob(taper(bez(V3(s * .3, 4.95, -.05), V3(s * .85, 5.1, -.2), V3(s * .9, 5.6, -.1), V3(s * .6, 5.85, .15)), .1, .01, 18, 8), .015, 5)));
    [-1, 1].forEach(s => { const c = bez(V3(s * .2, 4.15, .1), V3(s * .32, 3.6, .2), V3(s * .3, 3.2, .2)); for (let i = 0; i < 4; i++) b.add(i % 2 ? 'tooth' : 'bone', at(sph(.055, 8, 6), ...c.getPointAt(i / 3).toArray()));
      b.add('feather', orient(feather(.6, .1), V3(s * .3, 3.2, .2), V3(s * .2, -1, .1))); });
    b.add('darkmetal', at(cone(.09, .35, 8), 0, -1.6, 0, PI, 0, 0)); return b.out(); });
  P('orbscepter', W, 'Staffs & Wands', 'Orb scepter', ['scepter', 'orb', 'royal', 'magic'], () => { const b = bag();
    b.add('gold', lathe([[0, -.9], [.14, -.88], [.18, -.75], [.11, -.65], [.1, -.4], [.13, -.35], [.1, -.3], [.09, .5], [.13, .55], [.1, .6], [.09, 1.6], [.16, 1.7], [.22, 1.85], [.12, 2.0], [0, 2.02]], 18));
    grip(b, {gl: .9, r: .1, y0: -.3, core: 'cloth', wrap: 'gold', turns: 6});
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; b.add('gold', taper(bez(V3(cos(a) * .12, 1.9, sin(a) * .12), V3(cos(a) * .5, 2.1, sin(a) * .5), V3(cos(a) * .45, 2.6, sin(a) * .45), V3(cos(a) * .2, 2.85, sin(a) * .2)), .04, .02, 14, 6, .6)); b.add('crystal', at(sph(.05, 8, 6), cos(a) * .47, 2.35, sin(a) * .47)); }
    b.add('glow', at(sph(.35, 20, 16), 0, 2.4, 0)); b.add('gold', torY(.46, .025, 2.4, 6, 40), at(tor(.5, .02, 6, 40), 0, 2.4, 0, .4, 0, .3));
    b.add('gold', at(cone(.06, .3, 6), 0, 2.85, 0)); b.add('crystal', at(crystal(.06, .25, 6), 0, 3.1, 0)); return b.out(); });
  P('bostaff', W, 'Staffs & Wands', 'Bo staff', ['staff', 'monk', 'martial'], () => { const b = bag();
    b.add('wood', lathe([[0, -3.3], [.1, -3.3], [.13, -1.5], [.14, 0], [.13, 1.5], [.1, 3.3], [0, 3.3]], 14));
    [-1, 1].forEach(s => { b.add('metal', at(lathe([[0, 3.05], [.115, 3.05], [.125, 3.15], [.12, 3.4], [.07, 3.45], [0, 3.45]], 14), 0, 0, 0, s < 0 ? PI : 0, 0, 0)); b.add('metal', torY(.12, .03, s * 2.95), torY(.13, .03, s * 2.85)); });
    grip(b, {gl: .9, r: .14, y0: -.45, core: 'cloth', wrap: 'cloth', diamond: true, turns: 4}); wraps(b, 'leather', 1.2, 1.6, .135, 2); wraps(b, 'leather', -1.6, -1.2, .135, 2); return b.out(); });
  P('wand', W, 'Staffs & Wands', 'Rune wand', ['wand', 'magic', 'rune', 'glow'], () => { const b = bag();
    b.add('wood', lathe([[0, -.6], [.1, -.58], [.13, -.45], [.1, -.35], [.11, 0], [.08, 1.2], [.05, 2.0], [0, 2.05]], 14));
    b.add('glow', tube(fcurve(t => { const a = t * 4 * TAU, r = .11 - .055 * t + .006; return [cos(a) * r, -.2 + 2.1 * t, sin(a) * r]; }), .014, 90, 4));
    b.add('gold', lathe([[.1, -.4], [.135, -.37], [.135, -.3], [.11, -.27]], 12), torY(.09, .02, 1.1));
    b.add('crystal', at(crystal(.07, .35, 5), 0, 1.95, 0)); b.add('crystal', at(sph(.12, 10, 8), 0, -.66, 0)); return b.out(); });

  // ======================= RANGED =======================
  P('bow', W, 'Ranged', 'Recurve bow', ['bow', 'archer', 'ranged'], () => { const b = bag();
    grip(b, {gl: .8, r: .13, core: 'wood', wrap: 'leather'});
    [-1, 1].forEach(s => { b.add('wood', taper(bez(V3(0, s * .38, 0), V3(0, s * 1.5, .55), V3(0, s * 2.7, .25), V3(0, s * 3.05, -.2)), .13, .045, 30, 10, .45));
      b.add('bone', at(cone(.06, .25, 6), 0, s * 3.05, -.22, s > 0 ? -.8 : PI + .8, 0, 0)); b.add('gold', torY(.12, .025, s * .5)); });
    b.add('cloth', tube(fcurve(t => [0, -3.0 + 6.0 * t, -.2 - .1 * sin(PI * t) * 0]), .012, 6, 4));
    b.add('wood', at(cyl(.025, .025, 2.6, 6), 0, 0, -.2, PI / 2, 0, 0)); b.add('metal', at(cone(.05, .2, 6), 0, 0, 2.38, PI / 2, 0, 0));
    [0, 1, 2].forEach(i => b.add('feather', at(feather(.35, .06), 0, 0, -.12, PI / 2, i / 3 * TAU, 0))); return b.out(); });
  P('crossbow', W, 'Ranged', 'Heavy crossbow', ['crossbow', 'ranged', 'bolt'], () => { const b = bag();
    b.add('wood', at(rbox(.3, 3.0, .35, .08), 0, .9, .3)); b.add('wood', at(rbox(.26, .9, .3, .08), 0, -.1, -.05, -.35, 0, 0)); b.add('metal', at(box(.08, 1.6, .06), 0, 1.4, .5));
    b.add('wood', at(rbox(.32, 1.1, .45, .1), 0, -.9, .25, .1, 0, 0));
    [-1, 1].forEach(s => b.add('metal', taper(bez(V3(0, 2.25, .45), V3(s * .7, 2.25, .5), V3(s * 1.3, 2.0, .45), V3(s * 1.55, 1.9, .3)), .1, .04, 18, 8, .5)));
    b.add('cloth', tube(cr([V3(-1.55, 1.9, .3), V3(0, 1.05, .5), V3(1.55, 1.9, .3)]), .012, 20, 4)); b.add('darkmetal', at(rbox(.36, .25, .3, .05), 0, 1.0, .5));
    b.add('wood', at(cyl(.035, .035, 1.7, 6), 0, 1.15, .56)); b.add('metal', at(cone(.06, .25, 6), 0, 2.85, .56)); b.add('metal', at(tor(.18, .03, 6, 16), 0, 2.55, .3));
    b.add('metal', at(tor(.12, .025, 6, 14, PI), 0, .15, .05, 0, 0, PI)); return b.out(); });
  P('rifle', W, 'Ranged', 'Long rifle', ['gun', 'rifle', 'sniper', 'mech'], () => { const b = bag();
    b.add('darkmetal', at(rbox(.25, .6, .38, .06), 0, -.05, -.05, -.3, 0, 0)); b.add('darkmetal', at(rbox(.36, 1.6, .5, .08), 0, .65, .35));
    b.add('metal', cyl(.08, .07, 3.2, 14, 1.4).translate(0, 0, .42)); b.add('darkmetal', at(lathe([[.1, 0], [.14, .02], [.14, .35], [.1, .37]], 12), 0, 4.55, .42)); for (let i = 0; i < 3; i++) b.add('darkmetal', at(box(.3, .05, .08), 0, 4.65 + i * .08, .42));
    b.add('paint', at(rbox(.32, 1.3, .32, .07), 0, 2.0, .42)); for (let i = 0; i < 4; i++) b.add('darkmetal', at(box(.34, .08, .1), 0, 1.6 + i * .25, .5));
    b.add('darkmetal', cyl(.11, .11, 1.0, 14, .5).translate(0, 0, .82)); [0, 1].forEach(k => b.add('glow', at(cyl(.1, .1, .02, 14), 0, k ? 1.51 : .49, .82)));
    b.add('darkmetal', at(rbox(.16, .5, .2, .04), 0, .7, .1, .3, 0, 0)); b.add('paint', at(rbox(.3, 1.4, .4, .1), 0, -.85, .25, .12, 0, 0));
    b.add('metal', at(tor(.1, .025, 6, 14, PI), 0, .22, .1, 0, PI / 2, PI)); return b.out(); });
  P('gatling', W, 'Ranged', 'Gatling cannon', ['gun', 'gatling', 'minigun', 'mech'], () => { const b = bag();
    b.add('darkmetal', at(rbox(.3, .6, .3, .06), 0, 0, -.05)); b.add('paint', at(rbox(.8, 1.2, .8, .14), 0, .8, .45));
    b.add('darkmetal', at(lathe([[0, 0], [.42, 0], [.45, .1], [.45, .5], [0, .5]], 20), 0, 1.4, .45)); b.add('metal', at(cyl(.06, .06, 2.8, 8), 0, 1.9, .45));
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, x = cos(a) * .27, z = .45 + sin(a) * .27; b.add('metal', at(cyl(.07, .07, 2.7, 10), x, 1.9, z)); b.add('darkmetal', at(lathe([[.04, 0], [.08, 0], [.08, .12], [.04, .12]], 10), x, 4.5, z)); }
    [2.6, 4.0].forEach(y => b.add('darkmetal', at(lathe([[0, 0], [.4, 0], [.42, .04], [.42, .12], [.4, .16], [0, .16]], 20), 0, y, .45)));
    b.add('metal', at(lathe([[0, -.45], [.45, -.45], [.5, -.4], [.5, .4], [.45, .45], [0, .45]], 20), .75, .8, .45, 0, 0, PI / 2));
    chainAlong(b, 'gold', bez(V3(.75, .8, .95), V3(.6, 1.3, 1.1), V3(.25, 1.5, .95)), .07, .025); b.add('darkmetal', at(rbox(.12, .4, .5, .04), 0, .5, -.1)); return b.out(); });
  P('plasmacannon', W, 'Ranged', 'Plasma cannon', ['gun', 'plasma', 'energy', 'sci-fi'], () => { const b = bag();
    b.add('darkmetal', at(rbox(.3, .6, .3, .06), 0, 0, -.05, -.2, 0, 0));
    b.add('paint', at(lathe([[0, -.6], [.45, -.6], [.55, -.3], [.55, .9], [.38, 1.3], [.3, 3.2], [.38, 3.4], [.42, 3.9], [.3, 3.95], [0, 3.95]], 24), 0, .6, .5));
    for (let i = 0; i < 5; i++) b.add('glow', at(lathe([[.3, 0], [.4, .04], [.4, .16], [.3, .2]], 24), 0, 2.1 + i * .35, .5));
    b.add('glow', at(sph(.22, 14, 10), 0, 4.5, .5)); b.add('metal', at(lathe([[.24, 0], [.36, .1], [.36, .25], [.24, .3]], 20), 0, 4.15, .5));
    for (let i = 0; i < 8; i++) b.add('darkmetal', at(ext([[0, 0], [.35, .1], [.35, .8], [0, 1.0]], .03, .015, 1), 0, 0, 0, 0, i / 8 * TAU, 0).translate(cos(i / 8 * TAU) * .5, .5, .5 - sin(i / 8 * TAU) * .5));
    b.add('metal', tube(bez(V3(.5, .1, .5), V3(.9, .3, .3), V3(.8, 1.5, .5), V3(.35, 2.2, .5)), .06, 24, 8)); return b.out(); });
  P('missilepod', W, 'Ranged', 'Shoulder missile pod', ['missile', 'rocket', 'launcher', 'mech', 'shoulder'], () => { const b = bag();
    b.add('darkmetal', cyl(.35, .3, .4, 16)); b.add('metal', at(rbox(.6, .5, .6, .08), 0, .55, 0));
    b.add('paint', at(rbox(1.9, 1.7, 1.9, .14), 0, 1.6, 0)); b.add('paint2', at(rbox(1.95, .14, 1.95, .05), 0, 2.4, 0));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const x = (i - 1) * .55, z = (j - 1) * .55;
      b.add('darkmetal', at(lathe([[.2, 0], [.24, 0], [.24, .1], [.2, .1]], 14), x, 2.45, z)); b.add('metal', at(lathe([[0, 0], [.18, 0], [.18, .1], [.12, .3], [0, .38]], 12), x, 2.35, z)); }
    [-1, 1].forEach(s => b.add('darkmetal', at(rbox(.12, 1.0, 1.5, .04), s * 1.0, 1.6, 0))); b.add('glow', at(rbox(.4, .1, .05, .02), 0, 1.5, .97)); return b.out(); });
  P('railgun', W, 'Ranged', 'Railgun', ['gun', 'railgun', 'energy', 'mech'], () => { const b = bag();
    b.add('darkmetal', at(rbox(.26, .55, .3, .06), 0, 0, -.05, -.25, 0, 0)); b.add('paint', at(rbox(.6, 1.6, .7, .12), 0, .7, .45)); b.add('glow', at(lathe([[0, 0], [.18, 0], [.18, .5], [0, .5]], 16), 0, .6, .82, PI / 2, 0, 0, [1, .4, 1]));
    [-1, 1].forEach(s => b.add('metal', at(rbox(.16, 4.0, .32, .05), s * .2, 3.3, .45)));
    for (let i = 0; i < 6; i++) b.add(i % 2 ? 'darkmetal' : 'glow', at(lathe([[.36, 0], [.42, .03], [.42, .12], [.36, .15]], 6), 0, 1.8 + i * .55, .45, 0, PI / 6, 0, [1, 1, .75]));
    b.add('glow', at(box(.08, 3.6, .08), 0, 3.3, .45)); b.add('paint', at(rbox(.35, 1.2, .5, .1), 0, -.8, .35, .1, 0, 0)); b.add('darkmetal', at(cyl(.08, .08, .9, 10), 0, 1.0, .95, 0, 0, 0)); return b.out(); });
  P('flamethrower', W, 'Ranged', 'Flamethrower', ['gun', 'fire', 'flame'], () => { const b = bag();
    b.add('darkmetal', at(rbox(.26, .55, .3, .06), 0, 0, -.05, -.25, 0, 0)); b.add('metal', at(rbox(.4, 1.3, .45, .08), 0, .7, .4));
    b.add('darkmetal', cyl(.14, .12, 2.4, 14, 1.3).translate(0, 0, .4)); b.add('metal', at(lathe([[.13, 0], [.24, .3], [.26, .6], [.2, .62], [.12, .4]], 16), 0, 3.6, .4));
    for (let i = 0; i < 6; i++) b.add('metal', at(lathe([[.14, 0], [.24, .03], [.24, .07], [.14, .1]], 16), 0, 1.8 + i * .25, .4));
    b.add('glow', at(lathe([[0, 0], [.1, .05], [.06, .3], [0, .45]], 10), 0, 4.15, .4)); b.add('glow', at(cyl(.04, .04, .1, 8), .2, 3.6, .55));
    [-1, 1].forEach(s => b.add('paint', at(lathe([[0, 0], [.2, .02], [.25, .15], [.25, 1.05], [.2, 1.18], [0, 1.2]], 16), s * .3, -.4, .9)));
    b.add('rubber', tube(bez(V3(.3, .8, .9), V3(.6, 1.4, 1.0), V3(.3, 1.7, .6), V3(0, 1.4, .45)), .05, 24, 8)); b.add('metal', at(tor(.1, .025, 6, 14, PI), 0, .2, .08, 0, PI / 2, PI)); return b.out(); });
  P('bazooka', W, 'Ranged', 'Bazooka', ['gun', 'rocket', 'launcher'], () => { const b = bag();
    b.add('darkmetal', at(rbox(.26, .55, .3, .06), 0, 0, -.05, -.25, 0, 0)); b.add('paint', at(lathe([[.28, 0], [.33, .05], [.33, 4.4], [.3, 4.45], [.28, 4.4]], 20), 0, -1.6, .5));
    b.add('darkmetal', at(lathe([[.33, 0], [.48, -.4], [.5, -.45], [.42, -.45], [.29, -.1]], 20), 0, -1.6, .5)); b.add('darkmetal', at(lathe([[.33, 0], [.38, .05], [.38, .3], [.33, .35]], 20), 0, 2.4, .5));
    b.add('paint2', at(lathe([[0, 0], [.22, 0], [.25, .3], [.15, .65], [0, .75]], 16), 0, 2.75, .5)); b.add('darkmetal', at(rbox(.12, .6, .3, .03), 0, 1.5, .9)); b.add('glow', at(box(.04, .04, .05), 0, 1.7, 1.06));
    b.add('darkmetal', at(rbox(.22, .45, .26, .05), 0, 1.0, .0, -.25, 0, 0)); [.5, 2.0].forEach(y => b.add('metal', torY(.35, .04, y).translate(0, 0, .5))); return b.out(); });

  // ======================= SHIELDS (handle at origin, face toward +Y) =======================
  function domeShield(b, R, H, mat, rimMat, y0 = .25) { const top = r => y0 + H * (1 - pow(r / R, 2));
    const pts = []; for (let i = 0; i <= 12; i++) { const r = R * i / 12; pts.push([r, top(r) - .12]); }
    for (let i = 12; i >= 0; i--) { const r = R * i / 12; pts.push([r, top(r)]); }
    b.add(mat, lathe(pts, 40)); b.add(rimMat, torY(R, .08, y0 - .06, 8, 48)); return top; }
  P('roundshield', W, 'Shields', 'Round wooden shield', ['shield', 'round', 'viking'], () => { const b = bag(); const R = 1.7, top = domeShield(b, R, .25, 'wood', 'metal');
    b.add('metal', lathe([[0, top(0) + .2], [.3, top(0) + .12], [.42, top(0) + .02], [.44, top(.44) - .02]], 20));
    [0, PI / 2].forEach(a => b.add('metal', tube(fcurve(t => { const x = (t * 2 - 1) * R * .97; return [cos(a) * x, top(abs(x)) + .01, sin(a) * x]; }), .05, 30, 4)));
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = R * .9; b.add('metal', at(sph(.05, 6, 5), cos(a) * r, top(r) + .01, sin(a) * r)); }
    b.add('leather', tube(bez(V3(-.4, 0, 0), V3(-.3, -.12, 0), V3(.3, -.12, 0), V3(.4, 0, 0)), .06, 12, 6)); b.add('darkmetal', at(rbox(1.0, .14, .2, .04), 0, .1, 0)); return b.out(); });
  P('kiteshield', W, 'Shields', 'Kite shield', ['shield', 'knight', 'heraldry'], () => { const b = bag();
    const pts = []; for (let i = 0; i <= 12; i++) { const a = PI - i / 12 * PI; pts.push([cos(a) * 1.1, 1.0 + sin(a) * .5]); } pts.push([.85, -.6], [.0, -2.4], [-.85, -.6]);
    const bend = g => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) - .35 * p.getX(i) * p.getX(i)); g.computeVertexNormals(); return g; };
    const place = g => at(bend(g), 0, 0, 0, -PI / 2, 0, 0).translate(0, .45, .3);
    b.add('paint', place(ext(pts, .08, .06, 2))); 
    b.add('gold', place(tube(new T.CatmullRomCurve3(pts.map(([x, y]) => V3(x, y, .12)), true), .05, 60, 5)));
    b.add('paint2', place(ext([[0, 1.2], [.18, .5], [.6, .35], [.18, .2], [0, -1.6], [-.18, .2], [-.6, .35], [-.18, .5]], .04, .02).translate(0, 0, .12)));
    b.add('gold', place(at(sph(.14, 12, 8), 0, .35, .16, 0, 0, 0, [1, 1, .5])));
    b.add('leather', tube(bez(V3(-.4, 0, 0), V3(-.3, -.12, 0), V3(.3, -.12, 0), V3(.4, 0, 0)), .06, 12, 6)); b.add('darkmetal', at(rbox(1.0, .14, .2, .04), 0, .1, 0)); return b.out(); });
  P('towershield', W, 'Shields', 'Tower shield', ['shield', 'tower', 'tank', 'wall'], () => { const b = bag();
    const s = new T.Shape(); s.moveTo(-1.1, -2.2); s.lineTo(1.1, -2.2); s.lineTo(1.1, 1.7); s.quadraticCurveTo(0, 2.6, -1.1, 1.7); s.closePath();
    const hole = new T.Path(); hole.moveTo(-.55, 1.15); hole.lineTo(.55, 1.15); hole.lineTo(.55, 1.3); hole.lineTo(-.55, 1.3); hole.closePath(); s.holes.push(hole);
    const bend = g => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) - .3 * p.getX(i) * p.getX(i)); g.computeVertexNormals(); return g; };
    const place = g => at(bend(g), 0, 0, 0, -PI / 2, 0, 0).translate(0, .55, 0);
    b.add('metal', place(ext(s, .1, .07, 2, 16)));
    [-1, 0, 1].forEach(k => b.add('darkmetal', place(at(rbox(.12, 3.6, .1, .03), k * .75, -.3, .1))));
    [-1.6, -.4, .7].forEach(y => b.add('darkmetal', place(at(rbox(2.25, .14, .08, .03), 0, y, .1))));
    for (let i = 0; i < 8; i++) b.add('gold', place(at(sph(.06, 6, 5), (i % 4 - 1.5) * .55, i < 4 ? -2.0 : 1.6, .14)));
    b.add('leather', tube(bez(V3(-.4, 0, 0), V3(-.3, -.12, 0), V3(.3, -.12, 0), V3(.4, 0, 0)), .06, 12, 6)); b.add('darkmetal', at(rbox(1.0, .14, .2, .04), 0, .1, 0)); return b.out(); });
  P('spikedshield', W, 'Shields', 'Spiked buckler', ['shield', 'spiked', 'barbarian'], () => { const b = bag(); const R = 1.3, top = domeShield(b, R, .35, 'darkmetal', 'metal');
    b.add('metal', orient(cone(.25, 1.1, 10), V3(0, top(0) - .05, 0), UP)); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = R * .97; b.add('metal', orient(cone(.1, .55, 7), V3(cos(a) * r, top(r), sin(a) * r), V3(cos(a), .45, sin(a)))); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3, r = .6; b.add('metal', orient(cone(.08, .3, 6), V3(cos(a) * r, top(r) - .02, sin(a) * r), V3(cos(a) * .4, 1, sin(a) * .4))); }
    b.add('leather', tube(bez(V3(-.4, 0, 0), V3(-.3, -.12, 0), V3(.3, -.12, 0), V3(.4, 0, 0)), .06, 12, 6)); b.add('darkmetal', at(rbox(1.0, .14, .2, .04), 0, .1, 0)); return b.out(); });
  P('energyshield', W, 'Shields', 'Hex energy shield', ['shield', 'energy', 'hex', 'sci-fi', 'glow'], () => { const b = bag();
    b.add('darkmetal', lathe([[0, -.05], [.45, -.05], [.55, .1], [.5, .25], [.3, .32], [0, .32]], 24)); b.add('glow', torY(.42, .04, .27, 6, 32)); b.add('metal', at(rbox(.6, .2, .2, .05), 0, 0, 0));
    const Rs = 3.2, hexR = .27, pts = ring(6, (i, a) => [cos(a + PI / 6) * hexR * .9, sin(a + PI / 6) * hexR * .9]);
    for (let q = -6; q <= 6; q++) for (let r = -6; r <= 6; r++) { const x = hexR * Math.sqrt(3) * (q + r / 2), z = hexR * 1.5 * r; if (x * x + z * z > 1.75 * 1.75) continue;
      const d = V3(x, Math.sqrt(Rs * Rs - x * x - z * z), z).normalize(), p = d.clone().multiplyScalar(Rs).add(V3(0, .5 - Rs + .05, 0));
      b.add('glow', orient(at(ext(pts, .02, .012, 1), 0, 0, 0, -PI / 2, 0, 0), p, d)); }
    b.add('glow', torY(1.72, .045, .5 - (Rs - Math.sqrt(Rs * Rs - 1.72 * 1.72)) + .05, 6, 60)); return b.out(); });
  function ring(n, fn) { return [...Array(n).keys()].map(i => fn(i, i / n * TAU)); }
  P('boneshield', W, 'Shields', 'Bone shield', ['shield', 'bone', 'primal', 'monster'], () => { const b = bag();
    b.add('leather', at(lathe([[0, .1], [1.3, .1], [1.35, .15], [1.2, .3], [0, .4]], 20), 0, 0, 0, 0, 0, 0, [1, 1, 1.25]));
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; b.add('bone', wob(at(sph(.55, 14, 10), cos(a) * .95, .3, sin(a) * 1.15, 0, -a, 0, [1.2, .3, .6]), .04, 3)); }
    b.add('bone', wob(at(sph(.75, 16, 12), 0, .4, 0, 0, 0, 0, [1, .35, 1.1]), .05, 3)); skull(b, .8, 0, .7, .1, 0, -PI / 2.4);
    [-1, 1].forEach(s => b.add('horn', wob(taper(bez(V3(s * .5, .6, -.5), V3(s * 1.2, .9, -1.2), V3(s * .9, 1.0, -1.7)), .14, .01, 14, 8), .02, 5)));
    b.add('leather', tube(bez(V3(-.4, 0, 0), V3(-.3, -.12, 0), V3(.3, -.12, 0), V3(.4, 0, 0)), .06, 12, 6)); b.add('wood', at(cyl(.07, .07, 1.0, 8), 0, .07, 0, 0, 0, PI / 2)); return b.out(); });

  // ======================= CLAWS & FISTS =======================
  P('clawgauntlet', W, 'Claws & Fists', 'Claw gauntlet', ['claw', 'gauntlet', 'blade', 'assassin'], () => { const b = bag();
    b.add('darkmetal', lathe([[.35, 0], [.42, .1], [.45, .9], [.4, 1.3], [.3, 1.35], [.26, 1.3], [.36, .9], [.33, .1], [.3, 0], [.35, 0]], 18)); for (let i = 0; i < 3; i++) b.add('metal', at(lathe([[.44, 0], [.5, .04], [.5, .18], [.44, .22]], 18), 0, .15 + i * .4, 0));
    b.add('metal', at(rbox(.95, .4, .55, .12), 0, 1.45, .05)); b.add('glow', at(rbox(.12, .12, .04, .02), 0, .8, .45));
    [-1, 0, 1].forEach(k => b.add('metal', blade({len: 2.6 - abs(k) * .3, y0: 1.5, seg: 18, single: true, c: t => .25 * t * t, cz: t => .35 * t * t + .1, w: t => [.03, .1 * (1 - pow(t, 1.5)) + .005], th: t => .035 * (1 - .5 * t) + .004}).translate(k * .3, 0, 0)));
    return b.out(); });
  P('knuckle', W, 'Claws & Fists', 'Spiked knuckles', ['fist', 'knuckle', 'brawler'], () => { const b = bag();
    const s = new T.Shape(); s.moveTo(-.9, -.05); s.lineTo(.9, -.05); s.quadraticCurveTo(1.05, .3, .9, .7); s.lineTo(-.9, .7); s.quadraticCurveTo(-1.05, .3, -.9, -.05);
    for (let i = 0; i < 4; i++) { const h = new T.Path(); h.absarc(-.66 + i * .44, .32, .17, 0, TAU, true); s.holes.push(h); }
    b.add('metal', at(ext(s, .16, .05, 2, 12), 0, 0, 0)); b.add('darkmetal', at(rbox(1.5, .22, .3, .08), 0, -.28, 0)); b.add('leather', at(rbox(1.3, .12, .32, .04), 0, -.2, 0));
    for (let i = 0; i < 4; i++) b.add('metal', orient(cone(.1, .45, 8), V3(-.66 + i * .44, .74, 0), UP)); return b.out(); });
  P('drill', W, 'Claws & Fists', 'Spiral drill arm', ['drill', 'mech', 'mining'], () => { const b = bag();
    b.add('paint', lathe([[0, 0], [.55, 0], [.62, .1], [.62, .8], [.7, .9], [.7, 1.1], [.5, 1.2], [0, 1.2]], 24)); for (let i = 0; i < 6; i++) b.add('darkmetal', at(rbox(.12, .6, .1, .03), cos(i / 6 * TAU) * .63, .45, sin(i / 6 * TAU) * .63, 0, -i / 6 * TAU, 0));
    b.add('metal', lathe([[0, 1.15], [.5, 1.15], [.05, 4.3], [0, 4.35]], 20));
    for (let k = 0; k < 2; k++) b.add('metal', taper(fcurve(t => { const a = k * PI + t * 5 * TAU, r = .5 * (1 - t) + .02; return [cos(a) * r, 1.2 + t * 3.05, sin(a) * r]; }), t => .1 * (1 - t) + .02, 0, 140, 6, .5));
    b.add('glow', torY(.6, .04, 1.0, 6, 32)); return b.out(); });
  P('chainsaw', W, 'Claws & Fists', 'Chainsaw arm', ['chainsaw', 'saw', 'mech', 'horror'], () => { const b = bag();
    b.add('paint', at(rbox(1.0, 1.2, .9, .16), 0, .6, 0)); b.add('darkmetal', at(lathe([[0, 0], [.35, 0], [.38, .05], [.38, .2], [0, .2]], 18), .5, .6, 0, 0, 0, -PI / 2));
    b.add('metal', at(cyl(.08, .08, .5, 10), -.35, 1.1, .3, .3, 0, .3)); b.add('metal', tube(bez(V3(-.3, .2, .45), V3(-.2, -.3, .7), V3(.2, -.3, .7), V3(.3, .2, .45)), .06, 16, 6));
    const y0 = 1.1, y1 = 4.3, w = .7; b.add('metal', ext(shp([...[...Array(13).keys()].map(i => [w / 2 * .8 * cos(i / 12 * PI), y1 - w / 2 + w / 2 * .8 * sin(i / 12 * PI)]), [-w / 2 * .8, y0], [w / 2 * .8, y0]]), .08, .03));
    stadium(w, y0, y1, 50).forEach(({p, t}, i) => { const n = V3(t.y, -t.x, 0); b.add('darkmetal', orient(box(.1, .13, .15), p, t)); b.add('metal', orient(ext([[-.05, 0], [.05, 0], [.07, .12], [-.01, .18]], .05, .012, 1), p.clone().addScaledVector(n, .05), n.clone().addScaledVector(t, .6))); });
    return b.out(); });
  P('whip', W, 'Claws & Fists', 'Bullwhip', ['whip', 'leather', 'lash'], () => { const b = bag();
    grip(b, {gl: 1.0, r: .1, y0: -.5, core: 'leather', wrap: 'leather', diamond: true, turns: 5}); b.add('gold', lathe([[0, -.7], [.11, -.68], [.13, -.58], [.1, -.5], [0, -.5]], 12));
    b.add('leather', taper(cr([V3(0, .45, 0), V3(.05, 1.5, .1), V3(.6, 2.6, .3), V3(.2, 3.6, .1), V3(-.6, 4.4, -.2), V3(-.3, 5.4, 0), V3(.4, 6.0, .1)]), .095, .012, 120, 8));
    b.add('cloth', taper(bez(V3(.4, 6.0, .1), V3(.55, 6.2, .1), V3(.6, 6.45, .05)), .015, .004, 8, 5)); return b.out(); });
  P('kusarigama', W, 'Claws & Fists', 'Chain sickle', ['kusarigama', 'sickle', 'chain', 'ninja'], () => { const b = bag();
    grip(b, {gl: 1.3, r: .11, y0: -.6, core: 'wood', wrap: 'cloth', diamond: true, turns: 5}); b.add('darkmetal', lathe([[0, .68], [.1, .7], [.13, .74], [.13, .9], [.08, .95], [0, .96]], 12));
    b.add('metal', at(blade({len: 1.6, seg: 20, single: true, c: t => .5 * t * t, th: t => .04 * (1 - .5 * t) + .004, w: t => [.05, .16 * (1 - pow(t, 1.3)) + .004]}), 0, .85, 0, 0, 0, -PI / 2));
    b.add('metal', at(tor(.08, .025, 6, 12), 0, -.7, 0)); const c = cr([V3(0, -.78, 0), V3(.4, -.4, .3), V3(.9, .2, .5), V3(1.0, 1.0, .2), V3(.6, 1.6, -.2), V3(1.1, 2.0, -.3)]);
    chainAlong(b, 'darkmetal', c, .075, .022); const e = c.getPointAt(1).addScaledVector(c.getTangentAt(1), .22); spikedBall(b, .2, e, 10, .45);
    return b.out(); }, 1);

  // ======================= ACCESSORIES & MAGIC : MAGIC =======================
  P('runecircle', A, 'Magic', 'Rune magic circle', ['magic', 'circle', 'rune', 'glow', 'spell'], () => { const b = bag(), y = .03;
    b.add('glow', at(annulus(2.05, 2.2, .03), 0, y, 0), at(annulus(1.55, 1.62, .03), 0, y, 0), at(annulus(.42, .5, .03), 0, y, 0));
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = 1.83; b.add('glow', at(glyph(i, .26, .035, .03), cos(a) * r, y, sin(a) * r, -PI / 2, 0, -a - PI / 2)); }
    [0, PI].forEach(o => { const v = ring(3, (i, a) => V3(cos(a + o + PI / 2) * 1.55, y, sin(a + o + PI / 2) * 1.55)); v.forEach((p, i) => { const q = v[(i + 1) % 3], m = p.clone().add(q).multiplyScalar(.5), d = q.clone().sub(p); const g = box(.05, d.length(), .03); b.add('glow', orient(g, m, d)); }); });
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; b.add('glow', at(annulus(.12, .16, .03, 12), cos(a) * 1.0, y, sin(a) * 1.0)); }
    b.add('glow', at(glyph(3, .5, .05, .03), 0, y, 0, -PI / 2, 0, 0)); return b.out(); });
  P('spellrings', A, 'Magic', 'Gyro spell rings', ['magic', 'rings', 'orbit', 'glow'], () => { const b = bag(), y = 1.8;
    [[1.5, .0, 0], [1.25, .9, .3], [1.0, -.6, 1.2]].forEach(([R, rx, rz], k) => { b.add(k ? 'glow' : 'gold', at(annulus(R - .06, R, .05), 0, y, 0, rx, 0, rz));
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; b.add(k ? 'gold' : 'glow', at(glyph(i + k, .14, .025, .02), cos(a) * (R + .1), 0, sin(a) * (R + .1), -PI / 2, 0, -a - PI / 2).applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(rx, 0, rz))).translate(0, y, 0)); } });
    b.add('glow', at(sph(.3, 16, 12), 0, y, 0)); b.add('crystal', at(crystal(.12, .5, 4), 0, y + .35, 0), at(crystal(.12, .5, 4), 0, y - .35, 0, PI, 0, 0)); return b.out(); });
  P('orbitorbs', A, 'Magic', 'Orbiting orbs', ['magic', 'orbs', 'orbit', 'glow'], () => { const b = bag(), y = 1.5, R = 1.4, tilt = .35;
    const M = new T.Matrix4().makeRotationX(tilt);
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; b.add('glow', at(sph(.22, 16, 12), cos(a) * R, 0, sin(a) * R).applyMatrix4(M).translate(0, y, 0)); b.add('gold', at(tor(.28, .02, 6, 24), cos(a) * R, 0, sin(a) * R, PI / 2, 0, 0).applyMatrix4(M).translate(0, y, 0));
      b.add('glow', taper(fcurve(t => { const aa = a - .2 - t * .9, p = V3(cos(aa) * R, 0, sin(aa) * R).applyMatrix4(M); return [p.x, p.y + y, p.z]; }), .12, .01, 16, 6)); }
    b.add('glow', at(annulus(R - .02, R + .02, .015, 32), 0, 0, 0).applyMatrix4(M).translate(0, y, 0)); return b.out(); });
  P('crystalcluster', A, 'Magic', 'Floating crystal shards', ['magic', 'crystal', 'float', 'shards'], () => { const b = bag();
    for (let i = 0; i < 11; i++) { const d = fib(11)[i], h = rr(.5, 1.2), p = V3(0, 1.8, 0).addScaledVector(d, rr(.6, 1.1)); b.add('crystal', orient(crystal(h * .2, h, rnd() < .5 ? 5 : 6, .3), p, d.clone().add(V3(rr(-.3, .3), .2, rr(-.3, .3))))); }
    b.add('crystal', at(crystal(.35, 1.6, 6, .3), 0, 1.0, 0)); b.add('glow', at(ico(.22, 1), 0, 1.8, 0)); return b.out(); }, 3);
  function ico(r, d) { return new T.IcosahedronGeometry(r, d); }
  P('flamewisp', A, 'Magic', 'Flame wisp', ['magic', 'fire', 'flame', 'glow', 'spirit'], () => { const b = bag();
    const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([.6 * Math.sqrt(Math.max(0, sin(PI * Math.min(1, pow(t, .55))))) * pow(1 - t, .35) + .001, t * 2.6]); }
    const g = lathe(pts, 28), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = y / 2.6, f = 1 + .35 * k * sin(a * 5 + y * 3);
      p.setXYZ(i, x * f + .25 * sin(y * 2.2) * k, y, z * f + .12 * cos(y * 2.6) * k); }
    g.computeVertexNormals(); b.add('glow', wob(g, .05, 3));
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + rr(-.2, .2), r = .38, L = rr(1.6, 2.6), h = rr(.5, .9), o = V3(cos(a), 0, sin(a));
      b.add('glow', taper(bez(V3(cos(a) * r * .8, h, sin(a) * r * .8), o.clone().multiplyScalar(r * 1.6).add(V3(0, h + .5, 0)), o.clone().multiplyScalar(r * .9).add(V3(0, h + L * .8, 0)), o.clone().multiplyScalar(r * 1.4).add(V3(sin(a) * .3, h + L, -cos(a) * .3))), .17, .005, 18, 8)); }
    for (let i = 0; i < 5; i++) b.add('glow', at(sph(.05 + rnd() * .06, 8, 6), rr(-.7, .7), rr(2.4, 3.4), rr(-.7, .7))); return b.out(); }, 4);
  P('lightning', A, 'Magic', 'Lightning bolt', ['magic', 'lightning', 'storm', 'glow'], () => { const b = bag();
    const bolt = (pts, w) => { const L = [], R = []; pts.forEach(([x, y], i) => { const k = 1 - i / (pts.length - 1) * .85; L.push([x - w * k, y]); R.push([x + w * k, y]); }); return ext([...R, ...L.reverse()], .05, .025, 1); };
    const main = [[0, 0], [.35, .6], [-.1, 1.1], [.4, 1.7], [0, 2.2], [.5, 2.9], [.15, 3.4], [.45, 4.0]]; b.add('glow', bolt(main, .14));
    b.add('glow', bolt([[.4, 1.7], [.85, 2.0], [.75, 2.5], [1.15, 2.8]], .07)); b.add('glow', bolt([[0, 2.2], [-.45, 2.5], [-.3, 2.9], [-.7, 3.3]], .06), bolt([[.5, 2.9], [.2, 3.0], [-.05, 3.5]], .045).translate(0, 0, .05));
    return b.out(); });
  P('halo', A, 'Magic', 'Radiant halo', ['magic', 'halo', 'holy', 'angel', 'glow'], () => { const b = bag(), y = .8;
    b.add('gold', at(tor(1.0, .07, 10, 64), 0, y, 0, PI / 2, 0, 0)); b.add('glow', at(annulus(.82, .94, .03), 0, y, 0));
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, L = i % 2 ? .35 : .6; b.add('gold', orient(ext([[-.05, 0], [.05, 0], [0, L]], .03, .015, 1), V3(cos(a) * 1.07, y, sin(a) * 1.07), V3(cos(a), 0, sin(a)))); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + PI / 4; b.add('crystal', at(sph(.08, 8, 6), cos(a) * 1.0, y + .09, sin(a) * 1.0)); } return b.out(); });
  P('auraspikes', A, 'Magic', 'Aura spike crown', ['magic', 'aura', 'power', 'glow', 'spikes'], () => { const b = bag();
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 1.1, L = i % 2 ? 1.3 : 2.1, o = V3(cos(a), 0, sin(a));
      b.add('glow', taper(bez(o.clone().multiplyScalar(r), o.clone().multiplyScalar(r + .4).add(V3(0, L * .4, 0)), o.clone().multiplyScalar(r + .5).add(V3(0, L, 0))), .14, .005, 14, 6, .6)); }
    b.add('glow', at(annulus(1.0, 1.25, .04), 0, .02, 0)); return b.out(); });

  // ======================= CLOTHING =======================
  P('cape', A, 'Clothing', 'Hero cape', ['cape', 'cloak', 'cloth', 'hero'], () => { const b = bag();
    b.add('cloth', sheet((u, v) => { const x = (u - .5) * (2.4 + 1.8 * v), wrap = pow(1 - v, 3) * pow((u - .5) * 2, 2); return [x, v * 5.6, -1.1 * wrap + .16 * sin(u * PI * 7) * v + .25 * v * v]; }, 42, 24, .04));
    b.add('cloth', taper(bez(V3(-1.25, .02, -1.1), V3(-.6, -.1, .1), V3(.6, -.1, .1), V3(1.25, .02, -1.1)), .12, .12, 24, 8));
    [-1, 1].forEach(s => { b.add('gold', at(lathe([[0, 0], [.2, 0], [.22, .05], [.15, .1], [0, .1]], 18), s * .55, .1, .05, PI / 2, 0, 0)); b.add('crystal', at(sph(.08, 10, 8), s * .55, .1, .16)); });
    b.add('gold', tube(cr([V3(-.55, .1, .1), V3(0, .3, .2), V3(.55, .1, .1)]), .025, 16, 5)); return b.out(); });
  P('tatteredcloak', A, 'Clothing', 'Tattered cloak', ['cloak', 'cape', 'ragged', 'wraith'], () => { const b = bag();
    const jag = [...Array(13).keys()].map(() => rr(.55, 1)), J = u => { const x = u * 12, i = Math.min(11, Math.floor(x)), f = x - i; return jag[i] + (jag[i + 1] - jag[i]) * (f < .5 ? f * 2 * .3 : .3 + (f - .5) * 2 * .7); };
    const g = sheet((u, v) => { const L = 5.4 * J(u), x = (u - .5) * (2.6 + 2.2 * v); return [x + .1 * sin(v * 9 + u * 4), v * L, -1.0 * pow(1 - v, 3) * pow((u - .5) * 2, 2) + .2 * sin(u * PI * 9 + v * 2) * v]; }, 48, 26, .035);
    b.add('cloth', wob(g, .06, 1.6)); b.add('cloth', wob(taper(bez(V3(-1.3, .02, -1.0), V3(-.6, -.15, .15), V3(.6, -.15, .15), V3(1.3, .02, -1.0)), .16, .16, 24, 8), .04, 3));
    b.add('bone', at(sph(.13, 10, 8), 0, .05, .15, 0, 0, 0, [1.3, 1, .6])); return b.out(); }, 5);
  P('wizardhat', A, 'Clothing', 'Wizard hat', ['hat', 'wizard', 'witch', 'magic'], () => { const b = bag();
    const brim = lathe([[1.0, .05], [1.9, .0], [2.1, .05], [2.0, .1], [1.0, .14]], 40); const p = brim.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), r = Math.hypot(p.getX(i), p.getZ(i)); p.setY(i, p.getY(i) + .08 * sin(a * 3) * pow(r / 2, 3) - .12 * pow(r / 2, 4)); } brim.computeVertexNormals(); b.add('cloth', brim);
    const pts = [[0, .1]]; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([1.05 * pow(1 - t, 1.1) + .01, .1 + t * 3.4]); } pts.push([0, 3.5]); const c = lathe(pts, 28), q = c.attributes.position;
    for (let i = 0; i < q.count; i++) { const y = q.getY(i), k = Math.max(0, (y - 1.6) / 1.9); q.setX(i, q.getX(i) - pow(k, 2) * 1.1); q.setY(i, y - pow(k, 3) * .7); q.setZ(i, q.getZ(i) + sin(y * 4) * .03); }
    c.computeVertexNormals(); b.add('cloth', wob(c, .03, 2)); b.add('leather', lathe([[1.0, .12], [1.04, .14], [1.0, .5], [.94, .52]], 32)); b.add('gold', at(rbox(.36, .32, .1, .04), 0, .32, 1.02, -.04, 0, 0));
    for (let i = 0; i < 5; i++) { const a = rr(0, TAU), y = rr(.7, 1.8), r = 1.05 * pow(1 - (y - .1) / 3.4, 1.1) + .02; b.add('glow', at(ext(ring(10, (k, aa) => [cos(aa) * (k % 2 ? .05 : .12), sin(aa) * (k % 2 ? .05 : .12)]), .01, .008, 1), cos(a) * r, y, sin(a) * r, 0, -a + PI / 2, 0)); }
    return b.out(); }, 6);
  P('hood', A, 'Clothing', 'Deep hood', ['hood', 'cloak', 'rogue', 'monk'], () => { const b = bag();
    const g = sheet((u, v) => { const a = (u - .5) * TAU * .82, R = v < .25 ? 1.7 - v * 1.6 : 1.3 * Math.sqrt(Math.max(0, 1 - pow((v - .25) / .75, 2))) + .06, back = v > .25 ? pow((v - .25) / .75, 3) * .6 : 0;
      return [sin(a) * R, v * 2.8 - .3, -cos(a) * R * 1.1 - back]; }, 36, 22, .06); b.add('cloth', wob(g, .05, 2));
    b.add('cloth', wob(arcXZ(1.25, .1, .82, .55, 1.1), .03, 3)); return b.out(); });
  P('scarf', A, 'Clothing', 'Wind scarf', ['scarf', 'cloth', 'hero', 'neck'], () => { const b = bag();
    b.add('cloth', wob(at(tor(1.0, .26, 10, 40), 0, 0, 0, PI / 2, 0, 0, [1, 1, .55]), .06, 2.5)); b.add('cloth', wob(at(tor(.95, .22, 10, 40), 0, .3, 0, PI / 2 + .1, 0, 0, [1, 1, .5]), .05, 2.5));
    [[.3, 0], [.55, .9]].forEach(([x, ph], k) => b.add('cloth', sheet((u, v) => { const L = k ? 2.2 : 2.9; return [x + (u - .5) * .55 + .35 * sin(v * 4 + ph) * v, -.1 - v * L, .95 + .25 * v + .12 * sin(v * 7 + u + ph)]; }, 6, 24, .05)));
    [.3, .55].forEach(x => b.add('cloth', at(lathe([[0, -.25], [.2, -.2], [.25, 0], [.2, .2], [0, .25]], 10), x, -.05, .95, 0, 0, 0, [1.2, 1, .7])));
    return b.out(); });
  P('beltpouches', A, 'Clothing', 'Belt with pouches', ['belt', 'pouch', 'adventurer', 'waist'], () => { const b = bag();
    const S = g => at(g, 0, 0, 0, 0, 0, 0, [1.1, 1, .85]); b.add('leather', S(lathe([[1.7, -.2], [1.78, -.17], [1.78, .17], [1.7, .2], [1.66, .17], [1.66, -.17], [1.7, -.2]], 48)));
    const sb = new T.Shape(); sb.moveTo(-.3, -.25); sb.lineTo(.3, -.25); sb.lineTo(.3, .25); sb.lineTo(-.3, .25); sb.closePath(); const h = new T.Path(); h.moveTo(-.2, -.15); h.lineTo(-.2, .15); h.lineTo(.2, .15); h.lineTo(.2, -.15); h.closePath(); sb.holes.push(h);
    b.add('gold', at(ext(sb, .05, .025), 0, 0, 1.55)); b.add('gold', at(box(.05, .3, .06), 0, 0, 1.6));
    [[.9, .5, .55, .35], [1.6, .4, .45, .3], [2.4, .55, .5, .38], [3.6, .35, .4, .3], [4.4, .6, .55, .4]].forEach(([a, w, hh, d]) => { const x = cos(a) * 1.92, z = sin(a) * 1.6, ry = -a + PI / 2;
      b.add('leather', at(rbox(w, hh, d, .1), x, -.2, z, 0, ry, 0)); b.add('leather', at(rbox(w + .04, hh * .45, d * .4, .05), 0, 0, 0, 0, 0, 0).translate(0, .0, d * .35).applyMatrix4(new T.Matrix4().makeRotationY(ry)).translate(x, -.05, z)); b.add('gold', at(sph(.04, 6, 5), 0, 0, d / 2 + .03).applyMatrix4(new T.Matrix4().makeRotationY(ry)).translate(x, -.12, z)); });
    return b.out(); });
  P('robeskirt', A, 'Clothing', 'Robe skirt', ['robe', 'skirt', 'mage', 'monk'], () => { const b = bag();
    const fold = (g, n = 14, k = .07) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i), a = Math.atan2(z, x), f = 1 + k * sin(a * n) * Math.min(1, y / 4.5) * 1.4; p.setX(i, x * f); p.setZ(i, z * f); } g.computeVertexNormals(); return g; };
    const prof = []; for (let i = 0; i <= 16; i++) { const t = i / 16; prof.push([1.6 + .9 * pow(t, 1.3), t * 4.5]); } for (let i = 16; i >= 0; i--) { const t = i / 16; prof.push([1.53 + .9 * pow(t, 1.3), t * 4.5]); } prof.push([1.6, 0]);
    b.add('cloth', fold(lathe(prof, 72))); b.add('gold', fold(lathe([[2.47, 4.1], [2.56, 4.15], [2.56, 4.5], [2.5, 4.56], [2.45, 4.5]], 72)));
    b.add('cloth', lathe([[1.55, -.25], [1.68, -.22], [1.7, .2], [1.58, .25], [1.5, .2], [1.5, -.2], [1.55, -.25]], 48)); b.add('gold', taper(bez(V3(0, .1, 1.7), V3(.15, 1.0, 1.95), V3(-.1, 2.0, 2.05)), .06, .03, 14, 6), taper(bez(V3(.1, .1, 1.7), V3(.3, .9, 1.95), V3(.35, 1.8, 2.0)), .06, .03, 14, 6));
    return b.out(); });
  P('shouldercape', A, 'Clothing', 'Fur-trim mantle', ['mantle', 'capelet', 'shoulder', 'noble'], () => { const b = bag();
    b.add('cloth', sheet((u, v) => { const a = (u - .5) * TAU * .86, R = 1.0 + 1.5 * pow(v, .8); return [sin(a) * R * 1.15, v * 1.9 + .15 * sin(a * 9) * v * 0, -cos(a) * R + .12 * sin(a * 10) * v]; }, 56, 12, .05));
    b.add('fur', wob(arcXZ(1.05, .2, .86, .05, 1, 9), .08, 5));
    b.add('gold', tube(fcurve(t => { const a = (t - .5) * TAU * .86, R = 2.5; return [sin(a) * R * 1.15, 1.92, -cos(a) * R + .12 * sin(a * 10)]; }), .05, 80, 5)); return b.out(); });

  // ======================= TRINKETS =======================
  P('hangingchain', A, 'Trinkets', 'Shackle & chain', ['chain', 'shackle', 'prisoner', 'iron'], () => { const b = bag();
    b.add('darkmetal', lathe([[.75, -.2], [.85, -.15], [.85, .15], [.75, .2], [.72, 0], [.75, -.2]], 32));
    b.add('darkmetal', at(rbox(.3, .35, .2, .05), 0, .0, .85)); chainAlong(b, 'darkmetal', cr([V3(0, .2, .95), V3(.2, 1.2, 1.15), V3(-.1, 2.4, 1.1), V3(.15, 3.4, .95)]), .13, .04);
    b.add('darkmetal', at(tor(.15, .045, 6, 14, TAU * .8), .15, 3.6, .95, 0, 0, .5)); return b.out(); });
  P('drapedchains', A, 'Trinkets', 'Draped chains', ['chain', 'drape', 'iron', 'decor'], () => { const b = bag();
    [[1.8, 1.0, 0], [1.6, .55, .12]].forEach(([w, sag, z]) => { chainAlong(b, 'metal', fcurve(t => { const x = (t * 2 - 1) * w; return [x, sag * (1 - pow(x / w, 2)), z]; }), .11, .033); });
    [-1, 1].forEach(s => b.add('darkmetal', at(lathe([[0, 0], [.22, 0], [.24, .06], [.16, .12], [0, .14]], 16), s * 1.8, -.05, 0))); return b.out(); });
  P('padlock', A, 'Trinkets', 'Giant padlock', ['lock', 'padlock', 'iron'], () => { const b = bag();
    b.add('metal', at(tor(.42, .1, 10, 28, PI), 0, .52, 0, 0, 0, PI)); [-1, 1].forEach(s => b.add('metal', at(cyl(.1, .1, .4, 12), s * .42, .5, 0)));
    b.add('darkmetal', at(rbox(1.2, 1.0, .5, .14), 0, 1.35, 0)); b.add('gold', at(rbox(1.24, .1, .54, .04), 0, .95, 0), at(rbox(1.24, .1, .54, .04), 0, 1.75, 0));
    b.add('gold', at(lathe([[0, 0], [.14, 0], [.14, .04], [0, .04]], 14), 0, 1.3, .24, PI / 2, 0, 0)); b.add('rubber', at(cyl(.05, .05, .06, 8), 0, 1.28, .26, PI / 2, 0, 0), at(box(.05, .14, .06), 0, 1.38, .27));
    return b.out(); });
  P('bells', A, 'Trinkets', 'Bell cord', ['bells', 'shrine', 'cord', 'gold'], () => { const b = bag();
    b.add('cloth', tube(fcurve(t => { const x = (t * 2 - 1) * 1.4; return [x, .5 * (1 - x * x / 1.96), 0]; }), .05, 30, 6)); b.add('cloth', at(tor(.15, .05, 6, 16), -1.4, 0, 0), at(tor(.15, .05, 6, 16), 1.4, 0, 0));
    for (let i = 0; i < 5; i++) { const x = (i - 2) * .55, y0 = .5 * (1 - x * x / 1.96), L = .3 + (i % 2) * .25;
      b.add('cloth', at(cyl(.02, .02, L, 5), x, y0, 0)); const by = y0 + L; b.add('gold', at(lathe([[0, 0], [.08, 0], [.13, .05], [.16, .2], [.24, .38], [.26, .42], [.22, .42], [.14, .2], [0, .17]], 18), x, by, 0)); b.add('gold', at(tor(.05, .015, 5, 10), x, by, 0)); b.add('darkmetal', at(sph(.06, 8, 6), x, by + .4, 0)); }
    return b.out(); });
  P('skullnecklace', A, 'Trinkets', 'Skull & fang necklace', ['necklace', 'skull', 'tribal', 'teeth'], () => { const b = bag();
    const C = fcurve(t => { const a = t * TAU, f = pow(Math.max(0, sin(a)), 2); return [cos(a) * 1.35, -.6 * f, sin(a) * 1.25 + .1 * f]; }); b.add('leather', tube(C, .035, 80, 5, true));
    for (let i = 0; i < 9; i++) { const t = .07 + i * .045, p = C.getPointAt(t); if (i % 2 === 0) { skull(b, .3, p.x, p.y - .12, p.z, Math.atan2(p.x, p.z), 0, 'darkmetal'); }
      else { b.add('tooth', orient(taper(bez(V3(0, 0, 0), V3(0, -.15, .03), V3(0, -.38, .1)), .06, .005, 8, 6), p, V3(0, 1, 0))); b.add('bone', at(sph(.05, 8, 6), p.x, p.y, p.z)); } }
    for (let i = 0; i < 10; i++) { const t = .55 + i * .045, p = C.getPointAt(t % 1); b.add('wood', at(sph(.07, 8, 6), p.x, p.y, p.z)); }
    return b.out(); });
  P('banner', A, 'Trinkets', 'War banner', ['banner', 'flag', 'standard', 'army'], () => { const b = bag();
    haft(b, 0, 6.2, .08, 'wood', .07); b.add('gold', lathe([[0, 6.2], [.12, 6.2], [.1, 6.35], [0, 6.4]], 12)); b.add('gold', blade({len: .6, y0: 6.35, seg: 8, w: t => .14 * sin(PI * pow(t, .6)) + .002, th: () => .035}));
    b.add('wood', at(cyl(.05, .05, 2.2, 8), 0, 5.6, 0, 0, 0, PI / 2)); [-1, 1].forEach(s => b.add('gold', at(sph(.08, 8, 6), s * 1.1, 5.6, 0)));
    b.add('cloth', sheet((u, v) => { const x = (u - .5) * 2.0, cut = .45 * (1 - abs(u - .5) * 2); return [x, 5.55 - v * (3.0 - cut), .12 * sin(u * 6 + v * 3) + .1 * v * sin(u * 9)]; }, 24, 20, .04));
    b.add('paint2', at(ext(ring(10, (k, a) => [cos(a + PI / 2) * (k % 2 ? .22 : .5), sin(a + PI / 2) * (k % 2 ? .22 : .5)]), .02, .01, 1), 0, 4.4, .16));
    [-1, 1].forEach(s => b.add('cloth', at(cyl(.025, .01, .7, 5), s * 1.1, 4.9, 0))); return b.out(); });
  P('lantern', A, 'Trinkets', 'Hook lantern', ['lantern', 'light', 'glow', 'adventurer'], () => { const b = bag();
    b.add('darkmetal', cyl(.08, .07, 2.6, 10)); b.add('darkmetal', taper(bez(V3(0, 2.55, 0), V3(.1, 3.1, 0), V3(.9, 3.2, 0), V3(1.0, 2.75, 0)), .06, .045, 16, 6));
    const ly = 2.7; chainAlong(b, 'darkmetal', bez(V3(1.0, ly, 0), V3(1.0, ly - .2, 0), V3(1.0, ly - .4, 0)), .05, .015);
    const L = ly - .45; b.add('metal', at(lathe([[0, 0], [.05, 0], [.38, -.25], [.4, -.3], [.3, -.32], [0, -.32]], 16), 1.0, L, 0));
    b.add('crystal', at(lathe([[0, 0], [.27, 0], [.3, .2], [.3, .8], [.27, 1.0], [0, 1.0]], 16), 1.0, L - 1.32, 0)); b.add('glow', at(sph(.17, 12, 10), 1.0, L - .82, 0, 0, 0, 0, [1, 1.4, 1]));
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; b.add('metal', at(cyl(.025, .025, 1.0, 5), 1.0 + cos(a) * .31, L - 1.32, sin(a) * .31)); }
    b.add('metal', at(lathe([[0, 0], [.34, 0], [.36, .08], [.3, .12], [0, .12]], 16), 1.0, L - 1.44, 0)); return b.out(); });
  P('crown', A, 'Trinkets', 'Jeweled crown', ['crown', 'king', 'royal', 'gold'], () => { const b = bag();
    b.add('gold', lathe([[1.0, 0], [1.06, .02], [1.08, .4], [1.03, .45], [.98, .4], [.97, .02], [1.0, 0]], 48)); b.add('gold', torY(1.05, .04, .05, 6, 48), torY(1.06, .035, .42, 6, 48));
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, H = i % 2 ? .45 : .8; b.add('gold', at(ext([[-.22, 0], [.22, 0], [.06, H * .6], [0, H], [-.06, H * .6]], .04, .02, 1), cos(a) * 1.02, .4, sin(a) * 1.02, 0, -a + PI / 2, 0, [1, 1, 1]));
      b.add(i % 2 ? 'crystal' : 'gold', at(sph(i % 2 ? .06 : .07, 8, 6), cos(a) * 1.03, .4 + H + .04, sin(a) * 1.03)); b.add('crystal', at(sph(.07, 10, 8), cos(a) * 1.09, .23, sin(a) * 1.09, 0, -a, 0, [.5, 1, 1])); }
    b.add('crystal', at(crystal(.13, .35, 6), 0, .16, 1.1, PI / 2, 0, 0)); return b.out(); });
  P('spikecollar', A, 'Trinkets', 'Spiked collar', ['collar', 'spiked', 'beast', 'leather'], () => { const b = bag();
    b.add('leather', lathe([[1.1, -.25], [1.2, -.22], [1.22, 0], [1.2, .22], [1.1, .25], [1.06, 0], [1.1, -.25]], 48)); b.add('metal', torY(1.2, .03, -.18, 5, 48), torY(1.2, .03, .18, 5, 48));
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; if (abs(((a - PI / 2) + TAU) % TAU) < .3) continue; b.add('metal', orient(cone(.09, .45, 8), V3(cos(a) * 1.2, 0, sin(a) * 1.2), V3(cos(a), 0, sin(a)))); b.add('darkmetal', orient(cyl(.13, .13, .04, 10), V3(cos(a) * 1.2, 0, sin(a) * 1.2), V3(cos(a), 0, sin(a)))); }
    b.add('metal', at(tor(.25, .05, 8, 24), 0, -.3, 1.32)); return b.out(); });
  P('saddle', A, 'Trinkets', 'Beast saddle', ['saddle', 'mount', 'rider', 'leather'], () => { const b = bag(), R = 1.4;
    const back = (a, z, lift = 0) => [sin(a) * (R + lift), cos(a) * (R + lift) - R, z];
    b.add('cloth', sheet((u, v) => back((u - .5) * 2.4, (v - .5) * 2.6, .02), 30, 20, .04));
    b.add('leather', sheet((u, v) => { const z = (v - .5) * 1.8; return back((u - .5) * 1.5, z, .08 + .25 * pow(z / .9, 2) * (z > 0 ? 1.6 : 1) + .05 * (1 - pow((u - .5) * 2, 2))); }, 24, 20, .12));
    b.add('leather', taper(bez(V3(0, .3, .85), V3(0, .6, .95), V3(0, .75, 1.15)), .14, .1, 10, 10)); b.add('gold', at(sph(.13, 10, 8), 0, .78, 1.18));
    b.add('leather', taper(bez(V3(-.55, .45, -.9), V3(0, .75, -1.05), V3(.55, .45, -.9)), .1, .1, 14, 8));
    [-1, 1].forEach(s => { const p = back(s * 1.0, 0, .02); b.add('leather', at(cyl(.03, .03, 1.2, 5), p[0] + s * .05, p[1] - 1.2, p[2])); b.add('metal', at(box(.06, .05, .46), p[0] + s * .05, p[1] - 1.2, p[2])); b.add('metal', at(tor(.22, .04, 6, 16, PI), p[0] + s * .05, p[1] - 1.2, p[2], 0, PI / 2, PI)); [-1, 1].forEach(k => b.add('metal', at(sph(.045, 6, 5), p[0] + s * .05, p[1] - 1.2, p[2] + k * .22))); b.add('metal', at(box(.12, .05, .4), p[0] + s * .05, p[1] - 1.42, p[2])); });
    return b.out(); });
  P('furpauldron', A, 'Trinkets', 'Fur pauldron', ['pauldron', 'fur', 'armor', 'barbarian', 'shoulder'], () => { const b = bag();
    for (let i = 0; i < 3; i++) { const R = 1.3 - i * .15, y = .15 + i * .12; b.add('darkmetal', at(lathe([[R, 0], [R * .97, .25], [R * .8, .55], [R * .5, .75], [0, .82], [0, .7], [R * .45, .64], [R * .72, .46], [R * .88, .2], [R * .92, 0]].map(([r, yy]) => [r, yy]).reverse(), 30, 0), 0, y, 0, 0, 0, 0, [1, 1, 1.1])); }
    b.add('gold', at(tor(1.25, .04, 6, 40), 0, .2, 0, PI / 2, 0, 0, [1, 1.1, 1]));
    const fur = wob(at(tor(1.25, .3, 10, 40), 0, .05, 0, PI / 2, 0, 0, [1, 1.1, .7]), .1, 4); b.add('fur', fur);
    for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; b.add('fur', orient(cone(.14, .45 + rnd() * .2, 6), V3(cos(a) * 1.4, .05, sin(a) * 1.5), V3(cos(a), rr(-.5, .1), sin(a)))); }
    b.add('metal', orient(cone(.12, .5, 8), V3(0, .98, 0), UP)); return b.out(); }, 7);

  // ======================= GORE & OOZE =======================
  P('oozedrips', A, 'Gore & Ooze', 'Ooze drips', ['ooze', 'slime', 'drip', 'toxic'], () => { const b = bag();
    b.add('slime', wob(at(sph(1.1, 24, 12), 0, 0, 0, 0, 0, 0, [1, .25, .8]), .06, 2.5));
    [[-.7, 0, .9], [-.3, .3, 1.6], [.15, -.2, 1.1], [.5, .2, 2.0], [.8, -.1, .7], [0, .5, .8]].forEach(([x, z, L]) => b.add('slime', at(lathe([[0, 0], [.18, 0], [.1, L * .4], [.06, L * .8], [.12, L * .92], [.11, L * 1.02], [0, L * 1.06]], 14), x, .05, z)));
    for (let i = 0; i < 6; i++) b.add('slime', at(sph(.12 + rnd() * .1, 10, 8), rr(-.9, .9), -.2, rr(-.6, .6), 0, 0, 0, [1, .7, 1])); return b.out(); }, 2);
  function sphCap(r) { return new T.SphereGeometry(r, 18, 9, 0, TAU, 0, PI / 2); }
  P('slimepuddle', A, 'Gore & Ooze', 'Slime puddle', ['slime', 'puddle', 'ooze'], () => { const b = bag();
    const g = lathe([[0, 0], [1.4, 0], [1.6, .04], [1.55, .12], [1.2, .18], [0, .2]], 48), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), f = 1 + .22 * sin(a * 3 + 1) + .12 * sin(a * 7) + .06 * sin(a * 13); p.setX(i, x * f); p.setZ(i, z * f); } g.computeVertexNormals(); b.add('slime', g);
    for (let i = 0; i < 9; i++) b.add('slime', at(sphCap(.08 + rnd() * .18), rr(-1, 1), .15, rr(-1, 1)));
    for (let i = 0; i < 5; i++) { const a = rr(0, TAU), r = rr(1.8, 2.3); b.add('slime', at(sphCap(.12 + rnd() * .1), cos(a) * r, 0, sin(a) * r, 0, 0, 0, [1, .4, 1])); } return b.out(); }, 3);
  P('bloodsplat', A, 'Gore & Ooze', 'Splatter decal', ['blood', 'splat', 'decal', 'gore'], () => { const b = bag();
    const pts = []; for (let i = 0; i < 64; i++) { const a = i / 64 * TAU, lobe = pow(Math.max(0, sin(a * 5 + 1)), 8) * .9 + pow(Math.max(0, sin(a * 3 + 2)), 10) * .6; pts.push([cos(a) * (1 + lobe + .08 * sin(a * 17)), sin(a) * (1 + lobe + .08 * sin(a * 17))]); }
    b.add('flesh', at(ext(pts, .015, .012, 1), 0, .02, 0, -PI / 2, 0, 0));
    for (let i = 0; i < 12; i++) { const a = rr(0, TAU), r = rr(1.7, 2.8), s = rr(.06, .2); b.add('flesh', at(ext(ring(12, (k, aa) => [cos(aa) * s, sin(aa) * s * (1 + .5 * (k === 0))]), .012, .01, 1), cos(a) * r, .02, sin(a) * r, -PI / 2, 0, 0)); }
    return b.out(); }, 4);
  P('pustules', A, 'Gore & Ooze', 'Pustule cluster', ['boil', 'pustule', 'gross', 'flesh'], () => { const b = bag();
    b.add('flesh', wob(at(sphCap(1.2), 0, -.05, 0, 0, 0, 0, [1, .3, 1]), .06, 3));
    for (let i = 0; i < 12; i++) { const a = rr(0, TAU), r = rr(0, 1.0), s = rr(.15, .38), y = .32 * (1 - pow(r / 1.2, 2)) - .05; b.add('flesh', wob(at(sph(s, 14, 10), cos(a) * r, y + s * .4, sin(a) * r, 0, 0, 0, [1, .85, 1]), .02, 6)); b.add('slime', at(sph(s * .4, 10, 8), cos(a) * r, y + s * 1.1, sin(a) * r)); if (i % 3 === 0) b.add('glow', at(sph(s * .2, 8, 6), cos(a) * r, y + s * 1.35, sin(a) * r)); }
    return b.out(); }, 5);
  P('tentaclegrowth', A, 'Gore & Ooze', 'Tentacle growth', ['tentacle', 'growth', 'eldritch', 'flesh'], () => { const b = bag();
    b.add('flesh', wob(at(sphCap(.8), 0, -.05, 0, 0, 0, 0, [1, .4, 1]), .05, 3));
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + rr(-.3, .3), r = .4, o = V3(cos(a), 0, sin(a)), L = rr(1.6, 2.8);
      const c = cr([o.clone().multiplyScalar(r), o.clone().multiplyScalar(r + .3).add(V3(0, L * .35, 0)), o.clone().multiplyScalar(r - .1).add(V3(0, L * .7, 0)), o.clone().multiplyScalar(r + .5).add(V3(0, L * .9, 0)), o.clone().multiplyScalar(r + .9).add(V3(0, L * .82, 0))]);
      b.add('flesh', taper(c, .22, .015, 40, 10)); for (let k = 0; k < 8; k++) { const t = .1 + k * .1, p = c.getPointAt(t), rad = .22 + (.015 - .22) * pow(t, .9); b.add('skin', orient(sph(rad * .35, 8, 6), p.clone().addScaledVector(o, -rad * .85), o.clone().negate(), [1, .35, 1])); } }
    return b.out(); }, 6);
  P('eggsac', A, 'Gore & Ooze', 'Egg sac', ['egg', 'sac', 'brood', 'alien', 'slime'], () => { const b = bag();
    b.add('flesh', wob(at(sphCap(1.0), 0, -.05, 0, 0, 0, 0, [1, .3, 1]), .05, 3));
    for (let i = 0; i < 14; i++) { const d = fib(28)[i], p = V3(d.x * .7, .35 + d.y * .45 + .5, d.z * .7), s = rr(.22, .34); b.add('slime', wob(orient(sph(s, 14, 10), p, d, [1, 1.3, 1]), .015, 6)); }
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; b.add('flesh', taper(bez(V3(cos(a) * .9, 0, sin(a) * .9), V3(cos(a) * 1.1, .8, sin(a) * 1.1), V3(cos(a + .4) * .4, 1.5, sin(a + .4) * .4)), .06, .02, 16, 6)); }
    return b.out(); }, 8);
  P('cocoon', A, 'Gore & Ooze', 'Webbed cocoon', ['cocoon', 'web', 'pupa', 'spider'], () => { const b = bag();
    const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([.85 * pow(sin(PI * t), .8) + .001, .3 + t * 3.4]); } b.add('flesh', wob(lathe(pts, 24), .1, 1.5));
    for (let k = 0; k < 3; k++) b.add('slime', tube(fcurve(t => { const y = .3 + t * 3.4, r = .85 * pow(sin(PI * t), .8) + .04, a = k * 2.1 + t * 7 * (k % 2 ? -1 : 1); return [cos(a) * r, y, sin(a) * r]; }), .035, 120, 4));
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; b.add('slime', tube(bez(V3(cos(a) * .25, .4, sin(a) * .25), V3(cos(a) * .6, .1, sin(a) * .6), V3(cos(a) * 1.0, 0, sin(a) * 1.0)), .025, 10, 4)); }
    return b.out(); });

  // ======================= NATURE =======================
  P('vines', A, 'Nature', 'Leafy vines', ['vine', 'leaf', 'plant', 'jungle'], () => { const b = bag();
    for (let k = 0; k < 4; k++) { const ph = k * 1.6, x0 = (k - 1.5) * .45, L = rr(3, 4.5);
      const c = fcurve(t => [x0 + .3 * sin(t * 7 + ph), t * L, .25 * cos(t * 6 + ph)]); b.add('wood', taper(c, .07, .02, 40, 6));
      for (let i = 0; i < 9; i++) { const t = .08 + i * .1, p = c.getPointAt(t), s = 1 - t * .5; b.add('paint2', orient(leaf(.42 * s, .17 * s), p, V3(i % 2 ? 1 : -1, .7, rr(-.5, .5)))); }
      b.add('wood', taper(fcurve(t => { const p = c.getPointAt(1), a = t * TAU * 1.5; return [p.x + .15 * cos(a) * (1 - t), p.y + .1 * t, p.z + .15 * sin(a) * (1 - t)]; }), .025, .008, 16, 5)); }
    return b.out(); }, 9);
  P('mushrooms', A, 'Nature', 'Mushroom cluster', ['mushroom', 'fungus', 'forest', 'toadstool'], () => { const b = bag();
    [[0, 0, 1.6, .8], [.7, .3, 1.0, .5], [-.6, .4, .8, .45], [.3, -.6, .6, .35], [-.4, -.5, 1.2, .6]].forEach(([x, z, H, R], i) => { const lean = V3(x * .25, 1, z * .25).normalize();
      const st = lathe([[0, 0], [R * .3, 0], [R * .22, H * .3], [R * .18, H * .9], [0, H * .92]], 12); b.add('skin', orient(st, V3(x, 0, z), lean));
      const cap = lathe([[0, H * .85], [R * .5, H * .82], [R, H * .7], [R * 1.02, H * .74], [R * .85, H * .95], [R * .45, H * 1.08], [0, H * 1.12]], 24); b.add('paint', orient(cap, V3(x, 0, z), lean));
      b.add('flesh', orient(lathe([[R * .2, H * .86], [R * .95, H * .73], [R * .97, H * .735], [R * .2, H * .87]], 24), V3(x, 0, z), lean));
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + i, rr2 = R * .6; b.add('tooth', orient(at(sph(R * .08, 6, 5), cos(a) * rr2, H * .99, sin(a) * rr2, 0, 0, 0, [1, .4, 1]), V3(x, 0, z), lean)); } });
    return b.out(); });
  P('moss', A, 'Nature', 'Moss clump', ['moss', 'plant', 'growth', 'swamp'], () => { const b = bag();
    for (let i = 0; i < 7; i++) { const a = rr(0, TAU), r = rr(0, .8); b.add('fur', wob(at(sphCap(rr(.35, .6)), cos(a) * r, -.05, sin(a) * r, 0, 0, 0, [1, rr(.35, .6), 1]), .08, 4)); }
    for (let i = 0; i < 30; i++) { const a = rr(0, TAU), r = rr(0, 1.1); b.add('fur', orient(cone(.03, rr(.2, .4), 4), V3(cos(a) * r, .15 * (1 - r), sin(a) * r), V3(rr(-.3, .3), 1, rr(-.3, .3)))); }
    for (let i = 0; i < 5; i++) { const a = rr(0, TAU), r = rr(.9, 1.3); b.add('fur', taper(bez(V3(cos(a) * r * .8, .05, sin(a) * r * .8), V3(cos(a) * (r + .15), .12, sin(a) * (r + .15)), V3(cos(a) * (r + .35), -.05, sin(a) * (r + .35))), .08, .01, 10, 5)); }
    return b.out(); }, 10);
  P('coral', A, 'Nature', 'Branching coral', ['coral', 'reef', 'ocean'], () => { const b = bag();
    const grow = (p, d, L, r, depth) => { const e = p.clone().addScaledVector(d, L), m = p.clone().addScaledVector(d, L * .5).add(V3(rr(-.15, .15), 0, rr(-.15, .15)));
      b.add('stone', wob(taper(bez(p, m, e), r, r * .7, 10, 8), .02, 6)); b.add('stone', at(sph(r * .75, 7, 5), e.x, e.y, e.z));
      if (depth > 0) for (let i = 0; i < 2 + (depth > 1 ? 1 : 0); i++) { const nd = d.clone().add(V3(rr(-.8, .8), rr(.1, .5), rr(-.8, .8))).normalize(); grow(e, nd, L * .75, r * .72, depth - 1); } };
    grow(V3(0, 0, 0), V3(0, 1, 0), 1.0, .2, 3); b.add('stone', wob(at(sphCap(.45), 0, -.05, 0, 0, 0, 0, [1, .4, 1]), .05, 4)); return b.out(); }, 11);
  P('crystalgrowth', A, 'Nature', 'Crystal outcrop', ['crystal', 'cave', 'gem', 'mineral'], () => { const b = bag();
    b.add('stone', flat(wob(at(ico(.9, 1), 0, 0, 0, 0, 0, 0, [1.2, .45, 1]), .15, 1.6)));
    for (let i = 0; i < 9; i++) { const a = rr(0, TAU), r = rr(0, .7), d = V3(cos(a) * r * .9, 1, sin(a) * r * .9).normalize(), h = rr(.8, 2.2) * (1 - r * .5); b.add('crystal', orient(crystal(h * .18, h, 6, .25), V3(cos(a) * r, .1, sin(a) * r), d)); }
    for (let i = 0; i < 3; i++) b.add('glow', at(sph(.08, 8, 6), rr(-.5, .5), .35, rr(-.5, .5))); return b.out(); }, 12);
  P('roots', A, 'Nature', 'Gnarled roots', ['roots', 'wood', 'tree', 'ancient'], () => { const b = bag();
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rr(-.3, .3), o = V3(cos(a), 0, sin(a)), L = rr(2.2, 3.4);
      const c = cr([V3(0, 0, 0), o.clone().multiplyScalar(.35).add(V3(0, L * .3, 0)), o.clone().multiplyScalar(.8).add(V3(rr(-.2, .2), L * .65, rr(-.2, .2))), o.clone().multiplyScalar(1.2).add(V3(0, L, 0))]);
      b.add('wood', wob(taper(c, .32, .02, 30, 9), .05, 2.5)); const p = c.getPointAt(.55); b.add('wood', wob(taper(bez(p, p.clone().addScaledVector(o, .5).add(V3(0, .3, 0)), p.clone().addScaledVector(o, .8).add(V3(rr(-.3, .3), .9, 0))), .1, .01, 12, 6), .03, 3)); }
    b.add('wood', wob(at(sph(.5, 16, 12), 0, 0, 0, 0, 0, 0, [1, .6, 1]), .08, 3)); return b.out(); }, 13);
  P('branch', A, 'Nature', 'Leafy branch', ['branch', 'tree', 'leaf', 'wood'], () => { const b = bag();
    const c = cr([V3(0, 0, 0), V3(.2, 1.4, 0), V3(-.1, 2.8, .1), V3(.3, 4.2, 0)]); b.add('wood', wob(taper(c, .2, .03, 36, 9), .03, 3));
    for (let i = 0; i < 6; i++) { const t = .3 + i * .11, p = c.getPointAt(t), d = V3(i % 2 ? 1 : -1, .8, rr(-.5, .5)).normalize(), e = p.clone().addScaledVector(d, 1.1 - t * .5);
      b.add('wood', taper(bez(p, p.clone().addScaledVector(d, .4).add(V3(0, .1, 0)), e), .07 * (1.2 - t), .01, 10, 6));
      for (let k = 0; k < 5; k++) b.add('paint2', orient(leaf(.4, .16), e.clone().add(V3(rr(-.15, .15), rr(-.15, .15), rr(-.15, .15))), d.clone().add(V3(rr(-.8, .8), rr(0, .7), rr(-.8, .8))))); }
    for (let k = 0; k < 6; k++) b.add('paint2', orient(leaf(.45, .17), c.getPointAt(1), V3(rr(-1, 1), 1, rr(-1, 1)))); return b.out(); }, 14);
  P('rocks', A, 'Nature', 'Rock pile', ['rock', 'stone', 'boulder', 'rubble'], () => { const b = bag();
    [[0, 0, 1.0], [1.0, .3, .6], [-.9, .4, .7], [.3, -.9, .55], [-.3, .9, .45], [.9, -.6, .35], [-1.0, -.6, .3]].forEach(([x, z, s], i) => {
      const g = flat(wob(at(ico(s, 1), 0, 0, 0, rr(0, 3), rr(0, 3), 0, [1, rr(.6, .85), 1]), s * .22, 1.4 / s)); g.computeBoundingBox(); g.translate(x, -g.boundingBox.min.y - s * .15, z); b.add('stone', g); });
    return b.out(); }, 15);

  return parts;
});
