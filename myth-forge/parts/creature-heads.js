// Titan Forge parts: creature heads, skulls, jaws, teeth, horns, crests, eyes & faces.  Prefix hd_
// Classic script (not a module). Orientation: attach point at origin, part grows along +Y, faces/fronts toward +Z.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  'use strict';
  const V3 = K.V3, D = K.D, PI = Math.PI, TAU = PI * 2, at = K.at, bez = K.bez, cr = K.cr;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const v3 = p => p && p.isVector3 ? p.clone() : V3(p[0], p[1], p[2]);

  // ---------- geometry core ----------
  function mk(pos, idx, uv) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    if (uv) g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g; }
  // smooth normals across coincident vertices (UV seams, poles)
  function weld(g) { g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal, m = new Map();
    for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 1e4) + '_' + Math.round(p.getY(i) * 1e4) + '_' + Math.round(p.getZ(i) * 1e4);
      let a = m.get(k); if (!a) { a = [0, 0, 0, []]; m.set(k, a); } a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); a[3].push(i); }
    for (const a of m.values()) { const l = Math.hypot(a[0], a[1], a[2]) || 1; for (const i of a[3]) n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
    n.needsUpdate = true; return g; }
  // organic noise without seam cracks
  function nz(g, amt, f = 3, seed = 0) { if (!amt) return g; weld(g); const p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const d = (K.vnoise(x * f + seed, y * f, z * f) + .5 * K.vnoise(x * f * 2.3, y * f * 2.3 + seed, z * f * 2.3)) * amt;
      p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d); }
    p.needsUpdate = true; return weld(g); }
  function deform(g, fns) { if (!fns || !fns.length) return g; const p = g.attributes.position, v = V3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); for (const f of fns) f(v); p.setXYZ(i, v.x, v.y, v.z); } p.needsUpdate = true; return g; }
  function ensureUV(g) { if (g.attributes.uv) return g; const p = g.attributes.position, uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) { uv[i * 2] = (p.getX(i) + p.getZ(i)) * .5; uv[i * 2 + 1] = p.getY(i) * .5; } g.setAttribute('uv', new T.BufferAttribute(uv, 2)); return g; }
  function mir(g) { g = g.clone(); g.scale(-1, 1, 1);
    if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i += 3) { const t = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = t; } g.index.needsUpdate = true; }
    else for (const k in g.attributes) { const at_ = g.attributes[k], s = at_.itemSize, a = at_.array;
      for (let i = 0; i < a.length; i += 3 * s) for (let j = 0; j < s; j++) { const t = a[i + s + j]; a[i + s + j] = a[i + 2 * s + j]; a[i + 2 * s + j] = t; } }
    return g; }
  const Qt = (from, to) => new T.Quaternion().setFromUnitVectors(v3(from).normalize(), v3(to).normalize());
  // rotate so +Y points along dir (with optional spin around own axis first), then move to pos
  function orient(g, pos, dir, spin = 0, s = 1) { const q = Qt([0, 1, 0], dir); if (spin) q.multiply(new T.Quaternion().setFromAxisAngle(V3(0, 1, 0), spin));
    return g.applyMatrix4(new T.Matrix4().compose(v3(pos), q, typeof s === 'number' ? V3(s, s, s) : v3(s))); }
  // rotate so +Z points along dir (eyes / faces)
  function aimZ(g, pos, dir, s = 1) { return g.applyMatrix4(new T.Matrix4().compose(v3(pos), Qt([0, 0, 1], dir), V3(s, s, s))); }

  // ---------- deformers (operate on a Vector3 in place) ----------
  const fall = q => q >= 1 ? 0 : (1 - q * q) * (1 - q * q);
  function dent(c, rr, d, dir, sharp) { const C = v3(c), R = typeof rr === 'number' ? [rr, rr, rr] : rr, Dd = v3(dir).normalize();
    return v => { const q = Math.hypot((v.x - C.x) / R[0], (v.y - C.y) / R[1], (v.z - C.z) / R[2]); if (q < 1) v.addScaledVector(Dd, d * (sharp ? Math.pow(1 - q, sharp) : fall(q))); }; }
  const dpair = (c, rr, d, dir, sharp) => [dent(c, rr, d, dir, sharp), dent([-c[0], c[1], c[2]], rr, d, [-dir[0], dir[1], dir[2]], sharp)];
  function ridge(pts, r, h, dir, sharp) { const P = pts.map(v3), Dd = v3(dir).normalize(), ab = V3(), tp = V3();
    return v => { let best = 1e9; for (let i = 0; i < P.length - 1; i++) { ab.subVectors(P[i + 1], P[i]); const t = clamp(tp.subVectors(v, P[i]).dot(ab) / ab.lengthSq(), 0, 1);
        const d = tp.copy(P[i]).addScaledVector(ab, t).distanceTo(v); if (d < best) best = d; }
      const q = best / r; if (q < 1) v.addScaledVector(Dd, h * (sharp ? Math.pow(1 - q, sharp) : fall(q))); }; }
  const rpair = (pts, r, h, dir, sharp) => [ridge(pts, r, h, dir, sharp), ridge(pts.map(p => [-p[0], p[1], p[2]]), r, h, [-dir[0], dir[1], dir[2]], sharp)];
  // radial bulge from an axis point (pushes away from point c)
  function swell(c, r, d) { const C = v3(c), tp = V3(); return v => { tp.subVectors(v, C); const q = tp.length() / r; if (q < 1 && tp.lengthSq() > 1e-9) v.addScaledVector(tp.normalize(), d * fall(q)); }; }

  // ---------- smooth key tracks ----------
  function track(keys) { const L = keys[0].length; keys = keys.map(k => k.length < L ? k.concat(Array(L - k.length).fill(k[k.length - 1])) : k);
    return t => { let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
      const k0 = keys[Math.max(i - 1, 0)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(i + 2, keys.length - 1)];
      const h = (k2[0] - k1[0]) || 1, u = clamp((t - k1[0]) / h, 0, 1), u2 = u * u, u3 = u2 * u, out = [];
      for (let j = 1; j < L; j++) { const m1 = (k2[j] - k0[j]) / ((k2[0] - k0[0]) || 1) * h, m2 = (k3[j] - k1[j]) / ((k3[0] - k1[0]) || 1) * h;
        out.push((2 * u3 - 3 * u2 + 1) * k1[j] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * k2[j] + (u3 - u2) * m2); }
      return out; }; }
  // superellipse section. v = [w, hTop, hBot, yc, exp]
  function sec(v, a, f = 1) { const w = Math.max(v[0], 1e-3), ht = Math.max(v[1], 1e-3), hb = Math.max(v[2], 1e-3), yc = v[3], e = v[4] || 2, p = 2 / e;
    const c = Math.cos(a), s = Math.sin(a);
    return [Math.sign(c) * Math.pow(Math.abs(c), p) * w * f, yc + Math.sign(s) * Math.pow(Math.abs(s), p) * (s > 0 ? ht : hb) * f]; }
  // loft along +Z through keys [z, halfWidth, halfHeightTop, halfHeightBottom, yCenter, exponent]; rounded end caps
  function loft(keys, o = {}) { const rad = o.rad || 36, n = o.seg || 40, cs = o.capSeg || 8, tr = track(keys), z0 = keys[0][0], z1 = keys[keys.length - 1][0];
    const half = v => Math.min(v[0], (v[1] + v[2]) / 2), s0 = tr(z0), s1 = tr(z1), c0 = (o.cap0 ?? .7) * half(s0), c1 = (o.cap1 ?? .7) * half(s1), rings = [];
    for (let k = cs; k >= 1; k--) { const th = k / cs * PI / 2; rings.push([z0 - Math.sin(th) * c0, s0, Math.cos(th)]); }
    for (let i = 0; i <= n; i++) { const z = lerp(z0, z1, i / n); rings.push([z, tr(z), 1]); }
    for (let k = 1; k <= cs; k++) { const th = k / cs * PI / 2; rings.push([z1 + Math.sin(th) * c1, s1, Math.cos(th)]); }
    const pos = [], uv = [], idx = [];
    rings.forEach(([z, v, f], i) => { for (let j = 0; j <= rad; j++) { const [x, y] = sec(v, j / rad * TAU, f); pos.push(x, y, z); uv.push(j / rad, i / (rings.length - 1)); } });
    for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + 1, c = a + rad + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
    const g = mk(pos, idx, uv); deform(g, o.def); return o.noise ? nz(g, o.noise[0], o.noise[1], o.noise[2] || 0) : weld(g); }
  // point on loft surface at z, angle (deg; 0=+X side, 90=top, -90=bottom)
  function surf(keys) { const tr = track(keys); return (z, adeg, f = 1) => { const [x, y] = sec(tr(z), adeg * D, f); return V3(x, y, z); }; }
  // sweep a section along a curve. rf(t) -> r or [rSide, rUp]. o.up = direction of the 'rUp' axis.
  function sweep(curve, rf, o = {}) { if (typeof rf !== 'function') { const r0 = rf; rf = () => r0; } const seg = o.seg || 24, rad = o.rad || 12, up = v3(o.up || [0, 0, 1]), pos = [], uv = [], idx = [];
    let N = null; const B = V3(), Tg = V3();
    for (let i = 0; i <= seg; i++) { const t = i / seg, c = curve.getPointAt(t); Tg.copy(curve.getTangentAt(t)).normalize();
      if (!N) { N = up.clone().addScaledVector(Tg, -up.dot(Tg)); if (N.lengthSq() < 1e-6) N = V3(1, 0, 0).addScaledVector(Tg, -Tg.x); N.normalize(); }
      else N.addScaledVector(Tg, -N.dot(Tg)).normalize();
      B.crossVectors(N, Tg).normalize(); const r = rf(t), rx = Array.isArray(r) ? r[0] : r, ry = Array.isArray(r) ? r[1] : r;
      for (let j = 0; j <= rad; j++) { const a = j / rad * TAU, ca = Math.cos(a), sa = Math.sin(a), m = o.shape ? o.shape(t, a) : 1, off = o.off ? o.off(t, a, rx, ry) : 0;
        pos.push(c.x + (B.x * ca * rx + N.x * sa * ry) * m + N.x * off, c.y + (B.y * ca * rx + N.y * sa * ry) * m + N.y * off, c.z + (B.z * ca * rx + N.z * sa * ry) * m + N.z * off);
        uv.push(j / rad, t); } }
    for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + 1, c = a + rad + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
    if (o.cap !== false) { const e = curve.getPointAt(1), s = curve.getPointAt(0), ti = pos.length / 3; pos.push(e.x, e.y, e.z, s.x, s.y, s.z); uv.push(.5, 1, .5, 0);
      for (let j = 0; j < rad; j++) { idx.push(seg * (rad + 1) + j, seg * (rad + 1) + j + 1, ti); idx.push(j + 1, j, ti + 1); } }
    const g = mk(pos, idx, uv); deform(g, o.def); return o.noise ? nz(g, o.noise[0], o.noise[1], o.noise[2] || 0) : weld(g); }
  const sphere = (r, ws = 24, hs = 16) => new T.SphereGeometry(r, ws, hs);
  const ell = (rx, ry, rz, ws = 24, hs = 16) => new T.SphereGeometry(1, ws, hs).scale(rx, ry, rz);
  const lathe = (pts, seg = 28) => weld(K.lathe(pts, seg));
  // thick spherical cap around +Y (eyelids, domes)
  function shell(R, th, amax, seg = 24, n = 10) { const pts = [];
    for (let i = n; i >= 0; i--) { const a = i / n * amax; pts.push([R * Math.sin(a) + 1e-4, R * Math.cos(a)]); }
    for (let i = 0; i <= n; i++) { const a = i / n * amax; pts.push([(R - th) * Math.sin(a) + 1e-4, (R - th) * Math.cos(a)]); }
    pts.push(pts[0].slice()); return K.lathe(pts, seg); }

  // ---------- pieces / placement ----------
  const P = (geo, mat) => ({geo, mat});
  const sym = list => list.concat(list.map(p => P(mir(p.geo), p.mat)));
  function pack(list) { const by = new Map(); for (const p of list) { if (!by.has(p.mat)) by.set(p.mat, []); by.get(p.mat).push(ensureUV(p.geo)); }
    return [...by].map(([mat, gs]) => P(gs.length === 1 ? gs[0] : K.merge(gs), mat)); }
  function bbox(list) { const b = new T.Box3(); for (const p of list) { p.geo.computeBoundingBox(); b.union(p.geo.boundingBox); } return b; }
  // head-style placement: scale so largest dim = size, x centered, bottom at y=0 (minus yDip), neck point at zFrac of depth
  function place(list, size, zFrac = .3, yFrac = 0, ref) { const b0 = bbox(list), s = size / Math.max(...b0.getSize(V3()).toArray()), b = ref ? bbox([{geo: ref}]) : b0;
    const tx = -(b.min.x + b.max.x) / 2, ty = -(b.min.y + (b.max.y - b.min.y) * yFrac), tz = -(b.min.z + (b.max.z - b.min.z) * zFrac);
    const m = new T.Matrix4().makeScale(s, s, s).multiply(new T.Matrix4().makeTranslation(tx, ty, tz)); for (const p of list) p.geo.applyMatrix4(m); return pack(list); }
  // keep origin, just scale so largest dim = size
  function fit(list, size) { const b = bbox(list), s = size / Math.max(...b.getSize(V3()).toArray()); for (const p of list) p.geo.scale(s, s, s); return pack(list); }

  // ---------- feature builders ----------
  // eyeball looking +Z, centred on origin
  function eye(r, o = {}) { const L = [], ws = o.ws || 24;
    L.push(P(sphere(r, ws, Math.round(ws * .7)), o.sclera || 'eye'));
    if (o.iris !== false) { const ia = o.ia || .62;
      L.push(P(at(new T.SphereGeometry(r * 1.012, ws, 7, 0, TAU, 0, ia), 0, 0, 0, PI / 2, 0, 0), o.iris || 'paint'));
      if (o.pupil !== 'none') { const pa = o.pa || ia * .5, pg = at(new T.SphereGeometry(r * 1.024, ws, 6, 0, TAU, 0, pa), 0, 0, 0, PI / 2, 0, 0);
        const sx = o.pupil === 'slit' ? .26 : 1, sy = o.pupil === 'goat' ? .3 : 1;
        deform(pg, [v => { v.x *= sx; v.y *= sy; v.setLength(r * 1.024); }]); pg.computeVertexNormals(); L.push(P(pg, o.pmat || 'darkmetal'));
        if (o.shine !== false) L.push(P(sphere(r * .12, 8, 6).translate(r * .3, r * .32, r * .93), o.shineMat || 'eye')); } }
    if (o.lid) { // upper lid (o.lid = open angle in degrees from the top) and optional lower lid
      L.push(P(at(shell(r * 1.12, r * .14, o.lid * D, ws), 0, 0, 0, (o.lidTilt ?? -12) * D, 0, 0), o.lidMat || 'skin'));
      if (o.low) L.push(P(at(shell(r * 1.1, r * .12, o.low * D, ws), 0, 0, 0, PI - (o.lowTilt ?? 30) * D, 0, 0), o.lidMat || 'skin')); }
    return L; }
  function placeList(list, fn) { for (const p of list) fn(p.geo); return list; }
  // put a pair of eyes: c = centre of right (+x) eye, dir = gaze of right eye
  const eyes = (c, r, dir, o) => sym(placeList(eye(r, o), g => aimZ(g, c, dir)));
  // leaf / ear / fin blade along a curve; w width, th thickness; cup > 0 makes the +up face concave
  function leaf(curve, w, th, o = {}) { const prof = o.prof || (t => Math.pow(Math.sin(PI * clamp(.18 + t * .82, 0, 1)), .7) * (1 - t * .25));
    return sweep(curve, t => [Math.max(w * prof(t), .002), Math.max(th * (1 - t * .7), .002)], {seg: o.seg || 18, rad: o.rad || 14, up: o.up || [0, 0, 1],
      off: o.cup ? (t, a, rx) => o.cup * rx * Math.cos(a) * Math.cos(a) : null, noise: o.noise}); }
  // horn/tooth cone along curve, base radius r (or [rSide,rUp]), optional ridges
  function cone(curve, r, o = {}) { const p = o.pow ?? .85, tip = o.tip ?? .02, rr = Array.isArray(r) ? r : [r, r];
    const f = t => { const k = lerp(1, tip, Math.pow(t, p)) * (o.prof ? o.prof(t) : 1); return [rr[0] * k, rr[1] * k]; };
    return sweep(curve, f, {seg: o.seg || 24, rad: o.rad || 14, up: o.up || [0, 0, 1], shape: o.ridges ? (t, a) => 1 + o.ridges[1] * Math.pow(Math.abs(Math.cos(a * o.ridges[0] / 2 + t * (o.twist || 0))), 6) * (1 - t * .6) : o.shape, noise: o.noise}); }
  // simple tooth: base at origin growing +Y, curving toward +Z by `curl`
  const tooth = (len, r, curl = .2, o = {}) => cone(bez(V3(0, 0, 0), V3(0, len * .55, curl * len * .25), V3(0, len, curl * len)), o.flat ? [r * o.flat, r] : r,
    {seg: o.seg || 10, rad: o.rad || 8, pow: o.pow ?? 1.1, tip: .01, up: [0, 0, 1]});
  // row of teeth placed at points with direction; items: [pos, dir, len, r, curl, flat]
  function teeth(items, mat = 'tooth', o = {}) { return items.map(([p, d, l, r, c = .15, fl]) => P(orient(tooth(l, r, c, {flat: fl, rad: o.rad, seg: o.seg}), p, d, o.spin || 0), mat)); }
  // teeth along a loft gumline: zs list, angle deg on loft, size fn(z)->[len, r, curl], dir (for +x side), both sides
  function gum(S, zs, adeg, size, dir, o = {}) { const it = zs.map(z => { const [l, r, c, fl] = size(z), p = S(z, adeg).add(V3(0, o.dy || 0, 0)); p.x *= o.xin ?? .95;
      return [p, typeof dir === 'function' ? dir(z) : dir, l, r, c, fl]; }); return sym(teeth(it, o.mat, o)); }
  const range = (a, b, n) => [...Array(n).keys()].map(i => lerp(a, b, n === 1 ? 0 : i / (n - 1)));

  // U-shaped lower jaw. hw half width at hinge, L length (hinge z=0 -> chin z=L), h height, th thickness, drop: chin y
  function mandible(o) { const hw = o.hw, L = o.L, h = o.h, th = o.th || h * .4, dy = o.drop || 0, flare = o.flare ?? .8;
    const half = [[hw, 0, 0], [hw * .96, dy * .3, L * .3], [hw * flare * .8, dy * .7, L * .65], [hw * (o.chinW ?? .35), dy, L * .92]];
    if (o.rise) half.unshift([hw * .97, o.rise, -L * .07]);
    const off = v3(o.pos || [0, 0, 0]), pts = half.map(v3).concat([V3(0, dy, L + (o.chinZ ?? 0))], half.slice().reverse().map(p => V3(-p[0], p[1], p[2]))).map(p => p.add(off));
    const c = cr(pts), hp = o.hprof || (t => { const u = Math.abs(t - .5) * 2; return lerp(o.chinH ?? .8, 1, u) * (o.rise ? 1 - .35 * sstep(.85, 1, u) : 1); });
    const g = sweep(c, t => [th * (o.thprof ? o.thprof(t) : 1), h * hp(t) / 2], {seg: o.seg || 60, rad: o.rad || 14, up: [0, 1, 0], noise: o.noise, def: o.def,
      shape: (t, a) => 1 - .25 * Math.max(0, -Math.sin(a)) * (o.keel ?? 1)});
    return {geo: g, curve: c}; }
  // teeth along a mandible curve: ts list of t (0..0.5 = right side), size fn(t)->[len,r,curl,flat], pointing up
  function jawTeeth(curve, ts, size, yoff, o = {}) { const it = []; for (const t of ts) { const p = curve.getPointAt(t), [l, r, c, fl] = size(t); p.y += yoff; it.push([p, o.dir || [0, 1, 0], l, r, c, fl]);
      if (Math.abs(t - .5) > .01) { const q = curve.getPointAt(1 - t); q.y += yoff; it.push([q, o.dir ? [-o.dir[0], o.dir[1], o.dir[2]] : [0, 1, 0], l, r, c, fl]); } }
    return teeth(it, o.mat, o); }
  // skull void (dark socket filler)
  const voidBall = (c, r, mat = 'darkmetal') => P(ell(r[0] ?? r, r[1] ?? r, r[2] ?? r, 14, 10).translate(c.x ?? c[0], c.y ?? c[1], c.z ?? c[2]), mat);

  const parts = [];
  const add = (id, group, sub, name, tags, make) => parts.push({id: 'hd_' + id, group, sub, name, tags, make});
  const HS = 'Heads & Skulls', JT = 'Jaws & Teeth', HC = 'Horns & Crests', EF = 'Eyes & Faces';

  // ---------- shared curves ----------
  function fcurve(fn) { const c = new T.Curve(); c.getPoint = (t, o = new T.Vector3()) => { const p = fn(t); return o.set(p[0], p[1], p[2]); }; return c; }
  // general horn curve from origin: up +Y, sweeping back (-Z) by `back`, out (+X) by `out`, tip hook `hook` (+ = forward/up)
  const hornCurve = (L, back = .5, out = .2, hook = 0) => bez(V3(0, 0, 0), V3(out * L * .1, L * .45, -back * L * .05), V3(out * L * .45, L * (.85 - back * .3), -back * L * .45), V3(out * L * .6, L * (.95 - back * .55) + hook * L * .25, -back * L * .8 + hook * L * .2));
  // ram spiral: starts up, curls back, down and forward around a centre while drifting outward (+X)
  const ramCurve = (R, turns = 1.15, drift = .9, shrink = .55) => fcurve(t => { const th = t * TAU * turns, r = R * (1 - shrink * t); return [drift * R * Math.pow(t, .8), r * Math.sin(th), -R + r * Math.cos(th) - (R - r) * .3]; });
  // a horn piece in place: base point p, aimed so that its local +Y follows dir, local -Z back. (curve built at origin)
  const hornAt = (curve, r, p, dir, o = {}, mat = 'horn') => P(orient(cone(curve, r, Object.assign({seg: 30, rad: 14, pow: .9, ridges: o.ridges}, o)), p, dir, o.spin || 0), mat);
  const spike = (L, r, curl = .15) => cone(bez(V3(0, 0, 0), V3(0, L * .5, -curl * L * .2), V3(0, L, -curl * L)), r, {seg: 10, rad: 8, pow: 1});

  // ---------- skull builder ----------
  function skullB(c) {
    const S = surf(c.k), def = [...(c.def || [])], pcs = [], side = [], vm = c.voidMat || 'darkmetal';
    for (const [z, a, rr, d, dir, vs] of c.holes || []) { const p = Array.isArray(z) ? v3(z) : S(z, a), R = typeof rr === 'number' ? [rr, rr, rr] : rr, dn = v3(dir).normalize();
      const vb = voidBall(p.clone().addScaledVector(dn, d * .6), R.map(x => x * (vs || .6)), vm);
      if (Math.abs(p.x) < .02) { def.push(dent(p.toArray(), R, d, dir)); pcs.push(vb); } else { def.push(...dpair(p.toArray(), R, d, dir)); side.push(vb); } }
    if (c.crest) def.push(ridge(c.crest[0], c.crest[1], c.crest[2], [0, 1, 0], 1.5));
    const main = loft(c.k, {def, noise: c.noise || [.008, 6], rad: c.rad || 36, seg: c.seg || 36, cap0: c.cap0, cap1: c.cap1});
    pcs.push(P(main, 'bone'));
    if (c.arch) { const [z0, a0, z1, a1, bow, r] = c.arch, a = S(z0, a0), b = S(z1, a1); a.x *= .92; b.x *= .95;
      side.push(P(sweep(bez(a, V3((a.x + b.x) / 2 + bow, (a.y + b.y) / 2 - .03, (a.z + b.z) / 2), b), t => [r * .65, r * (1.3 - .4 * Math.sin(PI * t))], {seg: 16, rad: 10, up: [0, 1, 0]}), 'bone')); }
    for (const [zs, a, size, dir, o] of c.up || []) pcs.push(...gum(S, zs, a, size, dir, o));
    if (c.jaw) { const m = mandible(c.jaw); pcs.push(P(m.geo, 'bone'));
      if (c.cor) { const p = m.curve.getPointAt(.035); side.push(P(orient(cone(bez(V3(0, 0, 0), V3(0, c.cor * .5, 0), V3(0, c.cor, -c.cor * .2)), [c.jaw.h * .14, c.jaw.h * .45], {rad: 10, seg: 8}), p, [0, 1, .15]), 'bone')); }
      for (const [ts, size, yo, o] of c.jt || []) pcs.push(...jawTeeth(m.curve, ts, size, yo, o));
      if (c.jx) c.jx(pcs, m, side); }
    if (c.extra) c.extra(pcs, S, side);
    return place(pcs.concat(sym(side)), c.size || 2.4, c.zf ?? .25, c.yf ?? 0, main);
  }
  // ---------- fleshed head builder ----------
  function headB(c) {
    const S = surf(c.k), pcs = [], side = [];
    const main = loft(c.k, {def: c.def, noise: c.noise, cap0: c.cap0, cap1: c.cap1, rad: c.rad || 36, seg: c.seg || 36}); pcs.push(P(main, c.mat));
    if (c.jaw) pcs.push(P(loft(c.jaw, {def: c.jdef, noise: c.noise, cap0: c.jc0 ?? .6, cap1: c.jc1 ?? .7, rad: 28, seg: 24}), c.jmat || c.mat));
    if (c.eye) { const [z, a, r, dir, o, inset] = c.eye; pcs.push(...eyes(S(z, a).addScaledVector(v3(dir).normalize(), -(inset ?? .3) * r), r, dir, o)); }
    if (c.extra) c.extra(pcs, S, side);
    return place(pcs.concat(sym(side)), c.size || 2.6, c.zf ?? .3, c.yf ?? 0, main);
  }
  const at3 = (p, x, y, z) => p.clone().add(V3(x, y, z));

  // =====================================================================
  // HEADS & SKULLS — Skulls (bone, eye sockets, nasal holes, cheekbones)
  // =====================================================================
  add('skull_wolf', HS, 'Skulls', 'Wolf skull', ['canine', 'bone', 'skull', 'undead'], () => skullB({
    k: [[-0.9, .30, .32, .25, .18, 2.2], [-0.6, .48, .52, .30, .22, 2.2], [-0.25, .50, .46, .28, .18, 2.3], [0.1, .38, .36, .22, .12, 2.4], [0.45, .25, .26, .17, .02, 2.6], [0.85, .19, .2, .13, -.03, 2.7], [1.15, .16, .16, .11, -.05, 2.7]],
    holes: [[.1, 40, .2, .22, [-.7, -.2, -.6]], [-.35, 8, [.16, .22, .28], .15, [-1, 0, 0]], [[0, -.02, 1.27], 0, [.1, .09, .15], .22, [0, 0, -1]]],
    crest: [[[0, .48, -.9], [0, .74, -.55], [0, .66, -.2], [0, .5, .1]], .09, .07], arch: [.25, -15, -.55, -5, .26, .065],
    up: [[[1.2, 1.14], -60, () => [.09, .025, .1], [0, -1, .15]], [[1.02], -52, () => [.3, .05, .3], [.08, -1, .1]], [range(.85, .05, 6), -45, z => [.08 + .07 * (1 - Math.abs(z - .25)), .05, 0, .5], [.08, -1, .05]]],
    jaw: {hw: .36, L: 1.55, rise: .28, h: .22, th: .065, drop: -.1, chinW: .3, pos: [0, -.3, -.35]}, cor: .3,
    jt: [[[.493, .48], () => [.07, .022, .1], .09], [[.462], () => [.24, .045, -.3], .09], [range(.43, .3, 6), t => [.07 + .05 * (1 - Math.abs(t - .34) * 8), .045, 0, .5], .09]], size: 2.3}));

  const catSkull = saber => skullB({
    k: [[-0.75, .26, .30, .24, .18, 2.2], [-0.45, .42, .50, .30, .22, 2.2], [-0.1, .44, .46, .30, .17, 2.3], [0.2, .42, .38, .28, .08, 2.4], [0.42, .32, .28, .25, -.04, 2.5], [0.58, .26, .21, .2, -.08, 2.5]],
    holes: [[.2, 40, .22, .25, [-.5, -.2, -.8]], [-.35, 5, [.16, .2, .25], .16, [-1, 0, 0]], [[0, -.04, .7], 0, [.1, .1, .14], .2, [0, 0, -1]]],
    crest: [[[0, .5, -.8], [0, .72, -.45], [0, .66, -.1], [0, .55, .12]], .08, .06], arch: [.32, -10, -.55, -5, .36, .07],
    up: [[[.66, .62], -62, () => [.07, .025, .1], [0, -1, .15]], [[.5], -48, () => saber ? [.95, .085, .35, .45] : [.42, .07, .25], [.06, -1, .1]], [range(.35, .12, 3), -40, () => [.1, .06, 0, .5], [.08, -1, 0]]],
    jaw: {hw: .42, L: .98, rise: .3, h: .26, th: .07, drop: saber ? -.12 : -.04, chinW: .4, chinH: saber ? 1.7 : .9, pos: [0, -.34, -.32]}, cor: .28,
    jt: [[[.494, .482], () => [.06, .02, .1], .1], [[.455], () => saber ? [.12, .04, -.2] : [.3, .06, -.3], .1], [range(.42, .33, 3), () => [.09, .055, 0, .5], .1]], size: 2.1});
  add('skull_bigcat', HS, 'Skulls', 'Big cat skull', ['feline', 'bone', 'skull'], () => catSkull(false));
  add('skull_saber', HS, 'Skulls', 'Sabertooth skull', ['feline', 'bone', 'skull', 'prehistoric'], () => catSkull(true));

  add('skull_bear', HS, 'Skulls', 'Bear skull', ['ursine', 'bone', 'skull'], () => skullB({
    k: [[-0.9, .3, .32, .26, .16, 2.2], [-0.55, .52, .52, .32, .22, 2.2], [-0.15, .56, .5, .3, .2, 2.3], [0.25, .4, .4, .26, .1, 2.4], [0.7, .29, .27, .21, -.02, 2.5], [1.0, .25, .22, .18, -.05, 2.5]],
    holes: [[.2, 40, .19, .2, [-.6, -.2, -.7]], [-.4, 8, [.18, .24, .32], .15, [-1, 0, 0]], [[0, -.02, 1.12], 0, [.12, .12, .15], .22, [0, 0, -1]]],
    crest: [[[0, .5, -.98], [0, .78, -.6], [0, .74, -.25], [0, .62, .1]], .1, .1], arch: [.35, -12, -.65, -5, .34, .075],
    up: [[[1.06, 1.01], -62, () => [.09, .03, .1], [0, -1, .15]], [[.9], -50, () => [.34, .075, .25], [.06, -1, .1]], [range(.7, .1, 5), -48, () => [.07, .085, 0, .8], [.05, -1, 0]]],
    jaw: {hw: .44, L: 1.62, rise: .32, h: .3, th: .08, drop: -.06, chinW: .35, pos: [0, -.36, -.42]}, cor: .38,
    jt: [[[.494, .482], () => [.08, .025, .1], .13], [[.462], () => [.28, .065, -.3], .13], [range(.43, .3, 5), () => [.06, .08, 0, .8], .13]], size: 2.5}));

  add('skull_croc', HS, 'Skulls', 'Crocodile skull', ['reptile', 'bone', 'skull', 'swamp'], () => skullB({
    k: [[-0.8, .42, .24, .12, .12, 2.6], [-0.45, .55, .22, .13, .1, 2.6], [-0.05, .42, .17, .1, .05, 2.8], [0.6, .27, .11, .08, 0, 3], [1.35, .2, .085, .07, 0, 3], [1.8, .25, .09, .075, 0, 3], [2.0, .2, .08, .07, 0, 3]],
    holes: [[-.12, 68, .14, .14, [-.3, -1, -.2]], [-.55, 72, [.11, .1, .12], .1, [-.2, -1, 0]], [-.55, 5, [.1, .08, .16], .1, [-1, 0, 0]], [[0, .07, 1.92], 0, .07, .08, [0, -1, -.2]]],
    noise: [.012, 10], seg: 48,
    up: [[range(1.98, -.1, 15), -25, z => [.1 + .1 * Math.exp(-Math.pow((z - 1.75) * 5, 2)) + .08 * Math.exp(-Math.pow((z - .5) * 4, 2)), .035, .15], [.25, -1, 0]]],
    jaw: {hw: .5, L: 2.72, h: .16, th: .085, drop: .04, chinW: .35, flare: .95, pos: [0, -.14, -.72]}, cor: .14,
    jt: [[range(.485, .12, 14), t => [.08 + .07 * Math.exp(-Math.pow((t - .45) * 30, 2)), .032, .15], .07, {dir: [.3, 1, 0]}]], size: 2.9, zf: .15}));

  add('skull_trex', HS, 'Skulls', 'Theropod skull', ['dinosaur', 'tyrant', 'bone', 'skull', 'prehistoric'], () => skullB({
    k: [[-0.95, .42, .38, .32, .1, 2.4], [-0.6, .58, .46, .38, .1, 2.4], [-0.2, .46, .44, .36, .04, 2.6], [0.35, .32, .4, .32, -.04, 2.8], [0.95, .26, .32, .26, -.1, 2.8], [1.35, .22, .25, .2, -.12, 2.8]],
    holes: [[-.45, 50, .15, .18, [-.6, -.4, -.3]], [.38, 15, [.12, .18, .34], .14, [-1, 0, 0]], [-.78, 12, [.1, .2, .14], .13, [-1, 0, 0]], [.9, 20, [.06, .07, .1], .06, [-1, 0, 0]], [1.32, 50, .07, .08, [-.3, -.5, -.6]]],
    crest: [[[0, .5, -.3], [0, .44, 1.2]], .08, .04], noise: [.012, 8],
    up: [[range(1.35, -.05, 10), -62, z => [.16 + .14 * Math.sin(clamp((z + .1) / 1.3, 0, 1) * PI * .9), .065, .3, .55], [.05, -1, .1]]],
    jaw: {hw: .5, L: 2.05, rise: .3, h: .36, th: .09, drop: -.12, chinW: .3, chinH: .85, pos: [0, -.42, -.75]}, cor: .2,
    jt: [[range(.47, .22, 8), t => [.18, .06, .2, .55], .16]],
    extra: (pcs, S, side) => side.push(P(orient(spike(.18, .08, .1), S(-.5, 60), [.3, 1, .1]), 'bone')), size: 2.9, zf: .2}));

  add('skull_dragon', HS, 'Skulls', 'Dragon skull', ['dragon', 'bone', 'skull', 'undead', 'fantasy'], () => skullB({
    k: [[-0.9, .38, .36, .28, .15, 2.3], [-0.55, .52, .48, .32, .18, 2.3], [-0.15, .48, .4, .3, .12, 2.4], [0.35, .32, .3, .24, .03, 2.6], [1.0, .24, .22, .18, -.04, 2.7], [1.45, .22, .2, .16, -.05, 2.7]],
    holes: [[-.1, 42, .2, .22, [-.6, -.3, -.6]], [-.62, 10, [.14, .2, .26], .14, [-1, 0, 0]], [.55, 20, [.08, .12, .22], .1, [-1, 0, 0]], [1.42, 50, .065, .08, [-.2, -.6, -.6]]],
    crest: [[[0, .5, -.6], [0, .36, .4]], .08, .05], arch: [.15, -20, -.75, -8, .18, .05], noise: [.01, 7],
    up: [[range(1.5, .2, 9), -52, z => [z > 1.1 && z < 1.3 ? .42 : .14, z > 1.1 && z < 1.3 ? .06 : .04, .25], [.08, -1, .1]]],
    jaw: {hw: .45, L: 2.0, rise: .26, h: .24, th: .07, drop: -.08, chinW: .3, pos: [0, -.32, -.6]}, cor: .25,
    jt: [[range(.48, .22, 8), t => [t > .44 ? .3 : .12, .04, -.2], .1]],
    jx: (pcs, m, side) => { for (const t of [.12, .22, .32]) { const p = m.curve.getPointAt(t); p.y -= .1; side.push(P(orient(spike(.25, .05, .4), p, [.4, -1, -.6]), 'bone')); } },
    extra: (pcs, S, side) => { side.push(hornAt(hornCurve(1.6, .9, .25, .15), .16, S(-.7, 55), [.2, .5, -.6], {ridges: [7, .05]}),
      hornAt(hornCurve(.9, .8, .3), .1, S(-.85, 15), [.6, .1, -.7]), P(orient(spike(.3, .07, .3), S(-.2, 52), [.3, 1, -.4]), 'horn'));
      for (const z of [.2, .45, .7]) side.push(P(orient(spike(.12, .04, .2), S(z, 70), [.3, 1, -.3]), 'bone')); }, size: 2.9, zf: .3}));

  add('skull_bull', HS, 'Skulls', 'Horned bull skull', ['bovine', 'bone', 'skull', 'desert', 'undead'], () => skullB({
    k: [[-0.5, .44, .35, .25, .25, 2.4], [-0.25, .5, .34, .28, .2, 2.5], [0.15, .44, .3, .25, .12, 2.5], [0.7, .3, .22, .2, 0, 2.4], [1.3, .22, .17, .15, -.08, 2.4], [1.6, .2, .14, .13, -.1, 2.4]],
    holes: [[.05, 18, .2, .24, [-.9, -.1, -.3]], [[0, -.02, 1.6], 0, [.1, .12, .3], .25, [0, 0, -1]], [.9, 30, [.05, .05, .15], .05, [-.7, -.6, 0]]],
    def: [...dpair([.42, .12, .05], .26, .06, [1, .2, .3])], noise: [.01, 6],
    up: [[range(1.0, .25, 5), -58, () => [.06, .065, 0, .8], [.05, -1, 0]]],
    jaw: {hw: .38, L: 1.95, rise: .26, h: .2, th: .06, drop: -.1, chinW: .25, pos: [0, -.33, -.38]}, cor: .3,
    jt: [[range(.495, .46, 4), () => [.08, .03, .3, .5], .07, {dir: [.15, .5, 1]}], [range(.38, .25, 4), () => [.06, .06, 0, .8], .07]],
    extra: (pcs, S, side) => side.push(hornAt(bez(V3(0, 0, 0), V3(.3, .1, 0), V3(.75, .45, .15), V3(.8, 1.0, .35)), .18, S(-.42, 30), [1, .1, 0], {spin: -PI / 2})), size: 2.9, zf: .2}));

  add('skull_bird', HS, 'Skulls', 'Raptor bird skull', ['bird', 'bone', 'skull'], () => skullB({
    k: [[-0.7, .32, .36, .3, .25, 2], [-0.4, .48, .52, .38, .25, 2.1], [-0.05, .44, .42, .3, .2, 2.1], [0.3, .24, .26, .16, .1, 2.2], [0.6, .15, .2, .1, .03, 2.2], [0.8, .1, .15, .06, -.02, 2.2]],
    holes: [[-.05, 25, .26, .3, [-1, -.1, -.2], .5], [.45, 40, [.05, .05, .12], .06, [-.5, -.5, -.2]]],
    jaw: {hw: .3, L: 1.2, h: .1, th: .045, drop: .05, chinW: .08, pos: [0, -.08, -.32]}, cor: .1,
    extra: (pcs, S, side) => { const p = S(-.05, 25); side.push(P(at(new T.TorusGeometry(.16, .025, 8, 24), p.x - .1, p.y, p.z, 0, PI / 2 - .2, 0), 'bone'));
      pcs.push(P(sweep(bez(V3(0, .08, .7), V3(0, .14, 1.15), V3(0, -.28, 1.2)), t => [.1 * (1 - t * .85), .12 * (1 - t * .8)], {seg: 20, rad: 12, up: [0, 1, 0]}), 'horn')); }, size: 2.0, zf: .3}));

  add('skull_demon', HS, 'Skulls', 'Demon skull', ['demon', 'humanoid', 'bone', 'skull', 'undead', 'fantasy'], () => skullB({
    k: [[-0.75, .45, .5, .35, .38, 2], [-0.4, .62, .76, .45, .36, 2], [0.0, .64, .74, .5, .3, 2], [0.3, .6, .55, .55, .15, 2.3], [0.5, .52, .38, .52, .0, 2.8], [0.62, .48, .3, .5, -.06, 2.8]], cap1: .38,
    holes: [[[.23, .2, .74], 0, [.19, .17, .2], .26, [0, -.1, -1], .75], [[0, -.12, .79], 0, [.07, .12, .12], .16, [0, 0, -1]], [[.5, .32, .1], 0, [.14, .28, .28], .08, [-1, 0, 0]]],
    def: [...dpair([.42, -.02, .58], .2, .08, [1, -.2, .6]), ridge([[-.38, .38, .68], [0, .36, .74], [.38, .38, .68]], .1, .07, [0, .3, 1])],
    jaw: {hw: .46, L: .8, h: .26, th: .08, drop: -.06, chinW: .55, chinH: 1.2, flare: .95, pos: [0, -.62, -.1], rise: .32}, cor: .25,
    jt: [[range(.49, .37, 6), t => [t > .45 ? .1 : .09, .045, 0, t > .45 ? .5 : 1], .12]],
    extra: (pcs, S, side) => { const row = []; for (const x of range(.04, .32, 6)) row.push([V3(x, -.4, .68 - x * x * 1.6), [0, -1, .05], x > .2 ? .13 : .14, .045, 0, x > .2 ? 1 : .5]);
      side.push(...teeth(row), P(orient(spike(.32, .06, .1), V3(.26, -.38, .58), [0, -1, .1]), 'tooth'));
      side.push(hornAt(ramCurve(.42, 1.0, .9), .16, V3(.42, .55, .12), [.5, 1, .1], {ridges: [10, .06]})); }, size: 2.5, zf: .45}));

  add('skull_snake', HS, 'Skulls', 'Serpent skull', ['snake', 'reptile', 'bone', 'skull'], () => skullB({
    k: [[-0.6, .25, .22, .15, .1, 2.2], [-0.3, .32, .26, .15, .1, 2.2], [0.1, .28, .2, .12, .06, 2.3], [0.6, .2, .13, .09, 0, 2.4], [0.95, .15, .1, .08, -.02, 2.4]],
    holes: [[.25, 30, .15, .15, [-.7, -.2, -.6]], [-.25, 5, [.1, .1, .2], .08, [-1, 0, 0]], [[0, .02, 1.04], 0, .05, .06, [0, 0, -1]]],
    up: [[[.85], -40, () => [.45, .05, .5], [0, -1, .45]], [range(.6, -.1, 6), -40, () => [.07, .015, .5], [0, -1, .3]]],
    jaw: {hw: .3, L: 1.35, rise: .2, h: .1, th: .04, drop: -.25, chinW: .12, pos: [0, -.22, -.5]}, cor: .1,
    jt: [[range(.45, .2, 6), () => [.06, .015, .5], .04]], size: 2.0, zf: .25}));

  // =====================================================================
  // HEADS & SKULLS — Beast heads (fleshed, mammals)
  // =====================================================================
  const earGeo = (h, w, o = {}) => leaf(bez(V3(0, 0, 0), V3(0, h * .5, (o.lean || 0) * h * .3), V3((o.out || 0) * h, h, (o.lean || 0) * h)), w, o.th || w * .25,
    {cup: o.cup ?? .6, prof: o.round ? (t => Math.pow(Math.sin(PI * clamp(.22 + t * .78, 0, 1)), .55)) : o.prof, noise: o.noise});
  const tuft = (l, r, curl = .4) => cone(bez(V3(0, 0, 0), V3(0, l * .5, -.1 * l), V3(0, l, -curl * l)), [r, r * .45], {rad: 8, seg: 10, pow: 1});
  const discNose = (r, d) => at(lathe([[0, 0], [r * .85, 0], [r, d * .3], [r, d * .7], [r * .85, d], [0, d]], 28), 0, 0, 0, PI / 2, 0, 0);

  add('head_wolf', HS, 'Beast Heads', 'Wolf head', ['canine', 'fur', 'beast'], () => headB({ mat: 'fur', noise: [.025, 7], cap0: .8, cap1: .45,
    k: [[-0.85, .36, .42, .32, .14, 2.1], [-0.5, .58, .62, .42, .16, 2.1], [-0.1, .56, .52, .4, .1, 2.2], [0.3, .34, .34, .27, -.02, 2.3], [0.7, .25, .25, .2, -.08, 2.4], [1.05, .21, .2, .17, -.1, 2.4]],
    def: [...rpair([[.1, .4, .2], [.32, .38, .0]], .12, .05, [0, 1, .3]), ...dpair([.3, .3, .15], .14, .05, [-.6, -.1, -.6])],
    jaw: [[-0.3, .38, .12, .2, -.32], [0.2, .3, .1, .16, -.34], [0.65, .2, .08, .12, -.33], [0.98, .16, .07, .1, -.3]],
    eye: [.13, 32, .09, [.5, .12, .86], {pupil: 'round', lid: 70, lidMat: 'fur'}],
    extra: (pcs, S, side) => { pcs.push(P(nz(ell(.13, .09, .1, 18, 12).translate(0, .04, 1.15), .01, 8), 'rubber'));
      side.push(P(orient(earGeo(.62, .2, {lean: -.25, out: .12, noise: [.01, 8]}), at3(S(-.4, 62), -.05, -.05, 0), [.35, 1, -.15]), 'fur'));
      side.push(...teeth([[at3(S(.8, -62), 0, .02, 0), [0, -1, .1], .16, .035, .2]]));
      for (const [z, a, l] of [[-.15, -20, .35], [-.3, -40, .42], [-.45, -5, .3], [-.5, -55, .38], [-.7, -30, .3]]) side.push(P(orient(tuft(l, .08), S(z, a), [.9, -.3, -.6]), 'fur')); } }));

  const catHead = mane => headB({ mat: 'fur', noise: [.015, 8], cap0: .8, cap1: .55,
    k: [[-0.7, .36, .42, .3, .15, 2], [-0.35, .56, .62, .44, .15, 2], [0.0, .58, .54, .44, .1, 2.1], [0.28, .44, .34, .34, -.04, 2.2], [0.45, .36, .24, .28, -.1, 2.3]],
    def: [...dpair([.13, -.12, .6], .17, -.09, [.3, 0, 1]), ...rpair([[.08, .44, .22], [.32, .4, .12]], .1, .04, [0, 1, .4]), ridge([[0, .36, .2], [0, .16, .5]], .1, .04, [0, 1, .3])],
    jaw: [[-0.15, .3, .1, .16, -.38], [0.25, .24, .08, .14, -.42], [0.46, .16, .07, .1, -.4]],
    eye: [.2, 34, .11, [.35, .1, .93], {pupil: 'round', ia: .72, iris: 'gold', lid: 62, lidMat: 'fur'}],
    extra: (pcs, S, side) => { pcs.push(P(ell(.1, .065, .06, 16, 10).translate(0, -.02, .64), 'rubber'));
      side.push(P(orient(earGeo(.32, .2, {round: true, cup: .7}), at3(S(-.3, 55), -.03, -.05, 0), [.35, 1, .05]), 'fur'));
      side.push(...teeth([[at3(S(.36, -70), 0, .0, 0), [0, -1, .05], .14, .03, .15]]));
      for (let i = 0; i < 4; i++) side.push(P(orient(cone(bez(V3(0, 0, 0), V3(0, .3, 0), V3(0, .55, -.1 - i * .06)), .012, {seg: 8, rad: 5}), V3(.24, -.08 - i * .05, .58), [1, .1 - i * .15, .35]), 'horn'));
      if (mane) { pcs.push(P(nz(ell(.95, 1.0, .55, 32, 22).translate(0, .15, -.45), .09, 3), 'fur'));
        for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 11; i++) { const a = -100 + i * 19 + ring * 9, r = a * D, R = .92 - ring * .05;
          side.push(P(orient(cone(bez(V3(0, 0, 0), V3(0, .25, -.05), V3(0, .45, -.25)), [.22, .14], {seg: 10, rad: 8, pow: 1.2, noise: [.02, 6]}), V3(Math.cos(r) * R * .95, .15 + Math.sin(r) * R, -.35 - ring * .3), [Math.cos(r), Math.sin(r), -.5 - ring * .3]), 'fur')); } }
      else for (const [z, a, l] of [[-.1, -30, .3], [-.25, -50, .34], [-.3, -15, .26]]) side.push(P(orient(tuft(l, .08), S(z, a), [.9, -.3, -.6]), 'fur')); } });
  add('head_bigcat', HS, 'Beast Heads', 'Big cat head', ['feline', 'fur', 'beast'], () => catHead(false));
  add('head_lion', HS, 'Beast Heads', 'Maned lion head', ['feline', 'fur', 'beast', 'mane'], () => catHead(true));

  add('head_bear', HS, 'Beast Heads', 'Bear head', ['ursine', 'fur', 'beast'], () => headB({ mat: 'fur', noise: [.03, 6], cap0: .8, cap1: .5,
    k: [[-0.75, .42, .45, .36, .15, 2], [-0.35, .62, .62, .46, .15, 2], [0.05, .58, .52, .44, .08, 2.1], [0.4, .32, .3, .28, -.06, 2.2], [0.75, .25, .22, .22, -.1, 2.2]],
    def: [...rpair([[.1, .36, .25], [.3, .34, .1]], .12, .04, [0, 1, .3])],
    jaw: [[-0.2, .36, .1, .18, -.36], [0.3, .25, .08, .14, -.36], [0.68, .18, .07, .1, -.33]],
    eye: [.2, 35, .065, [.45, .15, .88], {pupil: 'round', ia: .8, sclera: 'darkmetal', iris: 'leather', lid: 75, lidMat: 'fur'}],
    extra: (pcs, S, side) => { pcs.push(P(nz(ell(.15, .1, .1, 18, 12).translate(0, -.0, .9), .01, 8), 'rubber'));
      side.push(P(orient(earGeo(.26, .17, {round: true, cup: .8}), at3(S(-.35, 58), -.03, -.05, 0), [.55, 1, -.1]), 'fur')); } }));

  add('head_boar', HS, 'Beast Heads', 'Tusked boar head', ['pig', 'boar', 'fur', 'beast', 'tusk'], () => headB({ mat: 'fur', noise: [.025, 7], cap0: .8, cap1: .2,
    k: [[-0.7, .4, .45, .35, .15, 2.2], [-0.3, .46, .46, .38, .1, 2.3], [0.2, .36, .34, .3, -.05, 2.4], [0.7, .26, .24, .22, -.15, 2.4], [1.0, .22, .2, .2, -.2, 2.4]],
    jaw: [[-0.35, .36, .08, .18, -.32], [0.3, .28, .07, .15, -.36], [0.85, .2, .06, .1, -.38]],
    eye: [.05, 35, .06, [.6, .15, .78], {pupil: 'round', lid: 65, lidMat: 'fur'}],
    extra: (pcs, S, side) => { pcs.push(P(discNose(.21, .1).translate(0, -.2, 1.02), 'skin'));
      side.push(P(ell(.035, .06, .02, 10, 8).translate(.08, -.2, 1.13), 'darkmetal'));
      side.push(P(orient(earGeo(.4, .17, {lean: .1, cup: .5}), at3(S(-.45, 60), -.03, -.05, 0), [.6, 1, .2]), 'fur'));
      side.push(hornAt(bez(V3(0, 0, 0), V3(0, .25, 0), V3(.1, .45, -.15), V3(.05, .55, -.35)), .065, at3(S(.78, -35), 0, -.05, 0), [.5, 1, .25], {}, 'tooth'));
      for (let i = 0; i < 9; i++) { const z = -.75 + i * .1; pcs.push(P(orient(tuft(.28 + .1 * Math.sin(i), .06, .5), S(z, 90), [0, 1, -.5]), 'fur')); } } }));

  add('head_ape', HS, 'Beast Heads', 'Great ape head', ['primate', 'ape', 'fur', 'beast', 'kaiju'], () => headB({ mat: 'fur', noise: [.025, 7], cap0: .8, cap1: .5,
    k: [[-0.7, .42, .5, .4, .2, 2], [-0.35, .55, .62, .45, .2, 2], [0.05, .56, .56, .5, .12, 2.1], [0.3, .5, .4, .5, .02, 2.3]],
    def: [ridge([[0, .7, -.7], [0, .84, -.3], [0, .74, .05]], .12, .1, [0, 1, 0], 1.5)],
    eye: null, zf: .4,
    extra: (pcs, S, side) => {
      pcs.push(P(loft([[0.05, .4, .25, .35, -.12, 2.2], [0.4, .38, .22, .32, -.2, 2.3], [0.62, .32, .18, .28, -.24, 2.3]], {noise: [.008, 9], cap1: .5}), 'skin'));
      pcs.push(P(loft([[0.0, .36, .1, .2, -.45], [0.4, .34, .1, .22, -.5], [0.58, .28, .08, .18, -.48]], {noise: [.008, 9], cap1: .6}), 'skin'));
      pcs.push(P(sweep(cr([V3(-.46, .22, .38), V3(-.2, .24, .56), V3(0, .2, .6), V3(.2, .24, .56), V3(.46, .22, .38)]), t => [.1, .085], {seg: 30, rad: 12, up: [0, 1, 0], noise: [.01, 8]}), 'skin'));
      pcs.push(...eyes(V3(.19, .1, .5), .065, [.15, 0, 1], {pupil: 'round', ia: .8, iris: 'leather', lid: 70, lidMat: 'skin'}));
      side.push(P(ell(.06, .035, .04, 12, 8).translate(.09, -.03, .74), 'darkmetal'), P(ell(.12, .1, .03, 14, 10).translate(.0, .0, 0), 'skin'));
      side.push(P(orient(earGeo(.2, .15, {round: true, cup: .5}), at3(S(-.05, 5), -.03, 0, 0), [1, .3, -.3]), 'skin'));
      side.push(...teeth([[V3(.2, -.28, .66), [0, -1, .05], .2, .04, .15]])); } }));

  add('head_bull', HS, 'Beast Heads', 'Bull head', ['bovine', 'bull', 'fur', 'beast', 'minotaur'], () => headB({ mat: 'fur', noise: [.02, 6], cap0: .8, cap1: .4,
    k: [[-0.6, .5, .42, .36, .25, 2.2], [-0.2, .56, .44, .4, .2, 2.3], [0.3, .42, .36, .34, 0, 2.3], [0.8, .36, .28, .3, -.2, 2.3], [1.1, .4, .25, .3, -.3, 2.3]],
    def: [...dpair([.14, -.3, 1.22], [.06, .08, .1], .08, [.1, 0, -1])],
    jaw: [[-0.3, .42, .1, .2, -.25], [0.4, .32, .08, .16, -.42], [0.95, .3, .07, .14, -.55]],
    eye: [-.1, 12, .085, [.9, .15, .4], {pupil: 'goat', iris: 'leather', lid: 65, lidMat: 'fur'}],
    extra: (pcs, S, side) => { pcs.push(P(at(new T.TorusGeometry(.13, .025, 10, 28), 0, -.42, 1.2, 0, 0, 0), 'gold'));
      side.push(P(orient(earGeo(.38, .15, {cup: .5}), at3(S(-.4, 18), -.03, 0, 0), [1, -.1, -.2], -PI / 2), 'fur'));
      side.push(hornAt(bez(V3(0, 0, 0), V3(.15, .35, 0), V3(.15, .75, .3), V3(-.1, 1.0, .55)), .17, at3(S(-.5, 35), -.05, 0, 0), [1, .35, .05], {spin: -PI / 2, ridges: [8, .03]})); } }));

  add('head_ram', HS, 'Beast Heads', 'Ram head', ['goat', 'sheep', 'ram', 'fur', 'beast'], () => headB({ mat: 'fur', noise: [.035, 6], cap0: .8, cap1: .4,
    k: [[-0.6, .42, .42, .34, .2, 2.1], [-0.25, .46, .44, .36, .18, 2.2], [0.25, .34, .36, .3, 0, 2.2], [0.75, .26, .28, .26, -.15, 2.2], [1.0, .24, .2, .22, -.22, 2.2]],
    def: [ridge([[0, .32, .2], [0, .18, .8]], .14, .05, [0, 1, .2])],
    jaw: [[-0.3, .34, .08, .18, -.25], [0.4, .26, .07, .14, -.35], [0.9, .2, .06, .12, -.42]],
    eye: [-.05, 18, .07, [.92, .15, .35], {pupil: 'goat', iris: 'gold', lid: 65, lidMat: 'fur'}],
    extra: (pcs, S, side) => { side.push(P(orient(earGeo(.3, .12, {cup: .5}), at3(S(-.45, 5), -.03, 0, 0), [1, -.3, -.3], -PI / 2), 'fur'));
      side.push(P(ell(.03, .045, .02, 10, 8).translate(.08, -.18, 1.12), 'darkmetal'));
      side.push(hornAt(ramCurve(.36, 1.3, 1.5, .6), .17, at3(S(-.4, 55), -.05, 0, 0), [.3, 1, -.1], {ridges: [14, .05], pow: .6, tip: .08, seg: 40})); } }));

  add('head_rhino', HS, 'Beast Heads', 'Rhino head', ['rhino', 'skin', 'beast', 'horn', 'kaiju'], () => headB({ mat: 'skin', noise: [.02, 6], cap0: .8, cap1: .4,
    k: [[-0.9, .42, .42, .36, .15, 2.2], [-0.45, .48, .46, .42, .1, 2.3], [0.1, .4, .38, .4, -.05, 2.3], [0.65, .34, .32, .34, -.18, 2.3], [1.05, .32, .28, .3, -.25, 2.3]],
    def: [...rpair([[.4, .3, -.6], [.45, -.2, -.5]], .06, .05, [1, 0, 0]), ...rpair([[.4, .25, -.2], [.42, -.25, -.15]], .05, .03, [1, 0, 0])],
    jaw: [[-0.55, .38, .08, .22, -.32], [0.3, .32, .07, .18, -.42], [0.95, .26, .06, .14, -.5]],
    eye: [.0, 8, .05, [.95, .1, .3], {pupil: 'round', iris: 'leather', lid: 65, lidMat: 'skin'}],
    extra: (pcs, S, side) => { pcs.push(hornAt(bez(V3(0, 0, 0), V3(0, .45, 0), V3(0, .8, -.15), V3(0, 1.05, -.4)), [.22, .28], at3(S(.88, 90), 0, -.04, 0), [0, 1, .45], {pow: .9, noise: [.01, 8]}));
      pcs.push(hornAt(bez(V3(0, 0, 0), V3(0, .2, 0), V3(0, .35, -.05)), [.15, .18], at3(S(.35, 90), 0, -.03, 0), [0, 1, .15]));
      side.push(P(orient(earGeo(.32, .14, {cup: .9}), at3(S(-.7, 60), -.03, 0, 0), [.4, 1, -.3]), 'skin')); } }));

  add('head_trunk', HS, 'Beast Heads', 'Trunk beast head', ['elephant', 'mammoth', 'skin', 'beast', 'tusk', 'kaiju'], () => headB({ mat: 'skin', noise: [.02, 5], cap0: .8, cap1: .4,
    k: [[-0.5, .6, .7, .5, .2, 2], [-0.1, .66, .75, .55, .2, 2], [0.25, .6, .62, .55, .1, 2.1], [0.45, .5, .5, .5, 0, 2.2]], zf: .4, yf: .1,
    eye: [.25, 25, .055, [.8, .1, .6], {pupil: 'round', iris: 'leather', lid: 65, lidMat: 'skin'}],
    extra: (pcs, S, side) => {
      pcs.push(P(sweep(cr([V3(0, -.05, .45), V3(0, -.5, .75), V3(0, -1.2, .8), V3(0, -1.75, .65), V3(0, -2.0, .85)]), t => lerp(.26, .09, Math.pow(t, .8)), {seg: 60, rad: 18, up: [0, 0, 1],
        shape: (t, a) => 1 + .05 * Math.pow(Math.sin(t * 90), 2) * (Math.sin(a) > -.3 ? 1 : .3)}), 'skin'));
      side.push(hornAt(bez(V3(0, 0, 0), V3(0, .6, 0), V3(-.05, 1.1, .35), V3(-.2, 1.25, .8)), .1, V3(.3, -.42, .38), [.25, -1, .8], {pow: 1.4, tip: .1}, 'tooth'));
      side.push(P(orient(leaf(bez(V3(0, 0, 0), V3(.1, .45, -.1), V3(0, .95, -.25)), .55, .05, {cup: -.2, prof: t => Math.pow(Math.sin(PI * clamp(.15 + t * .85, 0, 1)), .5), noise: [.02, 5]}), at3(S(-.05, 0), -.05, 0, 0), [.6, -1, -.6], -PI / 2), 'skin')); } }));

  add('head_bat', HS, 'Beast Heads', 'Bat head', ['bat', 'fur', 'beast', 'vampire', 'night'], () => headB({ mat: 'fur', noise: [.02, 8], cap0: .8, cap1: .45,
    k: [[-0.45, .42, .44, .36, .15, 2], [-0.1, .48, .46, .4, .12, 2], [0.2, .38, .32, .32, 0, 2.1], [0.4, .26, .22, .22, -.06, 2.1]], zf: .4,
    jaw: [[-0.2, .34, .06, .14, -.3], [0.35, .2, .05, .1, -.28]],
    eye: [.12, 35, .05, [.6, .2, .78], {sclera: 'darkmetal', iris: false}],
    extra: (pcs, S, side) => { pcs.push(P(leaf(bez(V3(0, -.05, .48), V3(0, .15, .52), V3(0, .3, .46)), .12, .025, {cup: .4}), 'skin'), P(ell(.12, .07, .06, 14, 10).translate(0, -.08, .5), 'skin'));
      side.push(P(ell(.025, .03, .02, 8, 6).translate(.05, -.08, .555), 'darkmetal'));
      side.push(P(orient(earGeo(1.0, .38, {cup: .7, lean: -.2, out: .15}), at3(S(-.15, 55), -.05, -.05, 0), [.5, 1, -.1]), 'membrane'));
      side.push(...teeth([[V3(.09, -.2, .5), [0, -1, .1], .16, .03, .1]]), ...teeth([[V3(.08, -.27, .45), [0, 1, .1], .1, .025, -.1]])); } }));

  // =====================================================================
  // HEADS & SKULLS — Reptiles & dragons
  // =====================================================================
  // flat sail fin from a 2D outline [[z,y],...] lying in the ZY plane (thickness along X)
  const spl = pts => { const sh = new T.Shape(); sh.moveTo(pts[0][0], pts[0][1]); sh.splineThru(pts.slice(1).concat([pts[0]]).map(([x, y]) => V2(x, y))); return sh; };
  const V2 = K.V2;
  const sail = (pts, th = .04) => at(K.extr(spl(pts), th, th * .4, 2), 0, 0, 0, 0, -PI / 2, 0);
  // radial fan fin lying in the XY plane (face +Z); spines from origin at angles a0..a1 (deg, 0=+X, 90=+Y)
  function fan(n, len, a0, a1, o = {}) { const pts = [[0, 0]], sp = [];
    for (let i = 0; i < n; i++) { const a = lerp(a0, a1, i / (n - 1)) * D, L = len * (o.lf ? o.lf(i / (n - 1)) : 1);
      pts.push([Math.cos(a) * L, Math.sin(a) * L]); sp.push([a, L]);
      if (i < n - 1) { const b = lerp(a0, a1, (i + .5) / (n - 1)) * D, L2 = len * (o.lf ? o.lf((i + .5) / (n - 1)) : 1) * (o.dip ?? .78); pts.push([Math.cos(b) * L2, Math.sin(b) * L2]); } }
    const L = [P(K.extr(spl(pts), o.th || .025, .012, 1), o.mat || 'membrane')];
    for (const [a, l] of sp) L.push(P(cone(K.V3 && bez(V3(0, 0, 0), V3(Math.cos(a) * l * .5, Math.sin(a) * l * .5, 0), V3(Math.cos(a) * l * 1.04, Math.sin(a) * l * 1.04, 0)), o.r || .035, {seg: 8, rad: 6, pow: 1}), o.smat || 'bone'));
    return L; }
  const xform = (list, m) => placeList(list, g => g.applyMatrix4(m));
  const M = (p, rx = 0, ry = 0, rz = 0, s = 1) => new T.Matrix4().compose(v3(p), new T.Quaternion().setFromEuler(new T.Euler(rx, ry, rz)), V3(s, s, s));

  add('head_croc', HS, 'Reptile Heads', 'Crocodile head', ['reptile', 'croc', 'scale', 'swamp'], () => {
    const jk = [[-0.6, .5, .08, .16, -.27, 2.5], [0, .42, .06, .13, -.24, 2.7], [1.0, .24, .05, .1, -.2, 2.9], [1.9, .22, .05, .09, -.2, 2.9]], JS = surf(jk);
    return headB({ mat: 'scale', noise: [.012, 9], cap0: .7, cap1: .5, seg: 48, zf: .15,
      k: [[-0.8, .48, .3, .2, .1, 2.5], [-0.45, .58, .3, .2, .08, 2.5], [-0.05, .46, .22, .16, .04, 2.7], [0.6, .3, .13, .12, 0, 2.9], [1.4, .22, .1, .1, 0, 2.9], [1.85, .26, .11, .1, .01, 2.9], [2.0, .22, .1, .09, .01, 2.9]],
      def: [...dpair([.24, .3, -.15], .2, .12, [0, 1, .2]), dent([0, .14, 1.9], .12, .05, [0, 1, 0]), ...dpair([.06, .17, 1.95], .03, .03, [0, -1, 0])],
      jaw: jk, size: 3.0,
      extra: (pcs, S, side) => { pcs.push(...eyes(V3(.22, .37, -.14), .07, [.45, .7, .55], {pupil: 'slit', iris: 'gold', lid: 62, lidMat: 'scale', low: 50}));
        side.push(...teeth(range(1.95, .1, 13).map(z => [at3(S(z, -22), -.02, -.02, 0), [.2, -1, 0], .11 + .07 * Math.exp(-Math.pow((z - 1.75) * 5, 2)), .03, .15])));
        side.push(...teeth(range(1.85, .2, 11).map(z => [at3(JS(z, 20), -.02, .02, 0), [.2, 1, 0], .1 + .08 * Math.exp(-Math.pow((z - 1.55) * 6, 2)), .03, .1])));
        for (const [z, a] of [[-.95, 80], [-.95, 55], [-1.15, 75], [-1.15, 45], [-.75, 82]]) { const p = S(Math.max(z, -.8), a); p.z = z + .2; side.push(P(nz(ell(.07, .05, .09, 10, 8), .01, 9).translate(p.x, p.y, p.z), 'scale')); } } }); });

  add('head_monitor', HS, 'Reptile Heads', 'Monitor lizard head', ['reptile', 'lizard', 'scale'], () => headB({ mat: 'scale', noise: [.006, 12], cap0: .7, cap1: .6, size: 2.4,
    k: [[-0.7, .36, .32, .26, .08, 2.1], [-0.35, .44, .36, .28, .08, 2.1], [0.1, .36, .28, .22, .02, 2.2], [0.6, .22, .18, .14, -.04, 2.3], [1.05, .14, .12, .1, -.06, 2.3]],
    def: [...dpair([.08, .02, 1.08], .03, .025, [0, 0, -1]), ...dpair([.42, -.05, -.55], .07, .04, [-1, 0, 0]), ...rpair([[.22, .3, -.2], [.18, .26, .15]], .07, .03, [.3, 1, 0])],
    jaw: [[-0.45, .38, .06, .16, -.22], [0.3, .28, .05, .12, -.2], [0.95, .12, .04, .07, -.15]],
    eye: [-.05, 30, .065, [.85, .15, .5], {pupil: 'round', iris: 'gold', lid: 60, lidMat: 'scale', low: 55}],
    extra: (pcs, S, side) => { pcs.push(P(sweep(bez(V3(0, -.17, .8), V3(0, -.22, 1.15), V3(0, -.2, 1.4)), .03, {seg: 12, rad: 8}), 'flesh'));
      side.push(P(cone(bez(V3(0, -.2, 1.38), V3(.04, -.2, 1.5), V3(.09, -.21, 1.6)), .022, {seg: 8, rad: 6}), 'flesh')); } }));

  const snakeHead = hood => headB({ mat: 'scale', noise: [.006, 12], cap0: .6, cap1: .6, size: hood ? 2.6 : 2.0, zf: hood ? .55 : .2, yf: hood ? -.9 : 0,
    k: hood ? [[-0.6, .26, .2, .18, .03, 2.3], [-0.3, .42, .24, .2, .04, 2.3], [0.1, .38, .2, .16, .02, 2.4], [0.45, .26, .15, .12, -.02, 2.5], [0.62, .2, .12, .1, -.04, 2.5]]
      : [[-0.8, .24, .18, .18, 0, 2.3], [-0.5, .36, .22, .2, .05, 2.3], [-0.25, .56, .26, .2, .05, 2.3], [0.1, .46, .2, .16, .02, 2.4], [0.45, .28, .15, .12, -.02, 2.5], [0.7, .2, .12, .1, -.04, 2.5]],
    def: [...rpair([[.2, .22, -.05], [.26, .2, .25]], .07, .035, [.3, 1, 0]), ...dpair([.1, .03, hood ? .72 : .8], .03, .025, [0, 0, -1]), ...dpair([.24, .0, hood ? .38 : .42], .035, .03, [-.6, 0, -.6])],
    jaw: hood ? [[-0.5, .3, .04, .12, -.17], [0.0, .34, .04, .12, -.18], [0.55, .2, .04, .08, -.15]] : [[-0.6, .3, .04, .12, -.17], [0.0, .38, .04, .12, -.18], [0.6, .2, .04, .08, -.15]],
    eye: [.06, 24, .075, [.75, .2, .62], {pupil: hood ? 'round' : 'slit', iris: 'gold', lid: 58, lidMat: 'scale'}],
    extra: (pcs, S, side) => { if (!hood) return;
      const out = [[0, -1.6], [.3, -1.5], [.62, -1.0], [.85, -.35], [.78, .2], [.5, .45], [.2, .42], [0, .32]], pts = out.concat(out.slice(1, -1).reverse().map(([x, y]) => [-x, y]));
      const hg = K.extr(spl(pts), .05, .025, 2); deform(hg, [v => { v.z -= v.x * v.x * .45; }]); weld(hg);
      pcs.push(P(hg.translate(0, -.15, -.45), 'scale'), P(nz(sweep(bez(V3(0, -1.75, -.5), V3(0, -1.0, -.45), V3(0, -.1, -.4)), .2, {seg: 16, rad: 14, cap: true}), .01, 8), 'scale')); } });
  add('head_viper', HS, 'Reptile Heads', 'Viper head', ['snake', 'reptile', 'scale', 'venom'], () => snakeHead(false));
  add('head_cobra', HS, 'Reptile Heads', 'Hooded cobra head', ['snake', 'reptile', 'scale', 'hood', 'venom'], () => snakeHead(true));

  add('head_theropod', HS, 'Reptile Heads', 'Tyrant dino head', ['dinosaur', 'tyrant', 'scale', 'prehistoric', 'kaiju'], () => headB({ mat: 'scale', noise: [.015, 8], cap0: .7, cap1: .55, size: 2.9, zf: .2,
    k: [[-0.9, .46, .44, .36, .1, 2.4], [-0.55, .58, .5, .4, .1, 2.4], [-0.15, .46, .46, .38, .04, 2.6], [0.4, .33, .42, .33, -.04, 2.7], [0.95, .27, .33, .26, -.1, 2.7], [1.3, .23, .26, .2, -.12, 2.7]],
    def: [...dpair([.32, .38, -.42], .14, -.08, [.5, 1, .2]), ...dpair([.1, .18, 1.38], .05, .05, [0, -.4, -1]), ridge([[0, .5, -.3], [0, .45, 1.1]], .1, .04, [0, 1, 0])],
    jaw: [[-0.75, .46, .15, .28, -.47], [0, .35, .12, .3, -.47], [0.8, .23, .1, .22, -.42], [1.22, .17, .08, .15, -.37]],
    eye: [-.45, 42, .08, [.75, .2, .62], {pupil: 'slit', iris: 'gold', lid: 55, lidMat: 'scale', low: 55}],
    extra: (pcs, S, side) => { side.push(...teeth(range(1.3, 0, 9).map(z => [at3(S(z, -58), .0, .03, 0), [.1, -1, .05], .22 + .07 * Math.sin((z + .2) * 2.2), .055, .25, .6])));
      side.push(P(orient(spike(.16, .07, .2), S(-.42, 55), [.3, 1, .1]), 'horn'));
      for (const z of range(-.8, .2, 6)) pcs.push(P(nz(ell(.06, .045, .1, 10, 8), .006, 10).translate(0, S(z, 90).y + .01, z), 'scale')); } }));

  add('head_dragon', HS, 'Dragon Heads', 'Sleek dragon head', ['dragon', 'scale', 'fantasy', 'horn'], () => headB({ mat: 'scale', noise: [.01, 9], cap0: .7, cap1: .55, size: 2.8, zf: .25,
    k: [[-0.85, .36, .36, .28, .12, 2.2], [-0.5, .5, .46, .32, .14, 2.3], [-0.1, .44, .36, .28, .08, 2.4], [0.4, .3, .24, .2, 0, 2.6], [1.0, .22, .17, .15, -.04, 2.6], [1.4, .2, .15, .13, -.05, 2.6]],
    def: [...rpair([[.2, .38, -.35], [.3, .34, .08]], .08, .07, [.3, 1, .2], 1.3), ...dpair([.12, .13, 1.4], .07, -.05, [0, 1, .3]), ...dpair([.12, .14, 1.47], .03, .04, [0, -.2, -1])],
    jaw: [[-0.45, .42, .1, .18, -.3], [0.2, .32, .08, .15, -.3], [0.9, .2, .07, .11, -.27], [1.32, .17, .06, .09, -.25]],
    eye: [-.04, 36, .085, [.6, .15, .78], {pupil: 'slit', iris: 'glow', lid: 58, lidMat: 'scale', low: 55}],
    extra: (pcs, S, side) => { const B = (p, a, b, c) => bez(V3(0, 0, 0), V3(...a), V3(...b), V3(...c));
      side.push(hornAt(B(0, [0, .5, 0], [.1, .85, -.25], [.25, 1.0, -.8]), .13, S(-.6, 55), [.25, .6, -.75], {ridges: [7, .05]}));
      side.push(hornAt(B(0, [0, .3, 0], [.05, .5, -.15], [.12, .6, -.45]), .08, S(-.75, 10), [.6, .1, -.8]));
      for (const [z, a, l] of [[-.35, -30, .3], [-.5, -45, .38], [-.2, -15, .22]]) side.push(P(orient(spike(l, .045, .4), S(z, a), [.85, -.2, -.6]), 'horn'));
      for (const z of range(-.5, .4, 6)) pcs.push(P(orient(spike(.1 + (.4 - z) * .08, .04, .4), S(z, 90), [0, 1, -.4]), 'horn'));
      side.push(...teeth([[at3(S(1.15, -50), 0, .02, 0), [.05, -1, .1], .26, .045, .3], [at3(S(.85, -55), 0, .02, 0), [.05, -1, .1], .14, .035, .2]])); } }));

  add('head_dragon_brute', HS, 'Dragon Heads', 'Horned brute dragon head', ['dragon', 'scale', 'fantasy', 'horn', 'kaiju'], () => headB({ mat: 'scale', noise: [.02, 6], cap0: .7, cap1: .55, size: 2.9, zf: .25,
    k: [[-0.85, .5, .5, .4, .15, 2.4], [-0.45, .66, .56, .45, .15, 2.4], [0.0, .6, .48, .42, .08, 2.6], [0.5, .42, .36, .34, -.02, 2.8], [0.95, .36, .32, .3, -.06, 2.8], [1.15, .34, .28, .26, -.08, 2.8]],
    def: [...rpair([[.12, .5, -.2], [.42, .44, -.05], [.5, .3, -.3]], .12, .1, [.3, 1, .3], 1.2), ...dpair([.14, .1, 1.27], .05, .06, [0, -.2, -1])],
    jaw: [[-0.5, .56, .12, .3, -.42], [0.3, .48, .1, .28, -.45], [1.0, .36, .1, .24, -.4], [1.2, .32, .1, .2, -.36]],
    eye: [-.1, 30, .07, [.7, .2, .7], {pupil: 'slit', iris: 'glow', lid: 50, lidMat: 'scale'}, .5],
    extra: (pcs, S, side) => { pcs.push(hornAt(bez(V3(0, 0, 0), V3(0, .3, 0), V3(0, .55, -.1), V3(0, .7, -.3)), [.16, .2], S(.85, 90), [0, 1, .5]));
      side.push(hornAt(bez(V3(0, 0, 0), V3(.15, .4, 0), V3(.3, .8, .3), V3(.15, 1.1, .7)), .2, at3(S(-.35, 45), -.04, 0, 0), [1, .5, -.2], {spin: -PI / 2, ridges: [8, .05]}));
      side.push(hornAt(hornCurve(.9, .9, .2), .14, S(-.75, 35), [.4, .3, -.8], {ridges: [6, .05]}), hornAt(hornCurve(.6, .9, .2), .1, S(-.7, -5), [.7, -.1, -.7]));
      side.push(hornAt(bez(V3(0, 0, 0), V3(0, .25, 0), V3(0, .45, .1)), .1, at3(S(.95, -20), 0, -.2, 0), [.25, 1, .1], {}, 'tooth'));
      for (const [z, a] of [[.6, -40], [.3, -45], [0, -50], [-.3, -45]]) side.push(P(orient(spike(.18, .06, .3), at3(S(z, a), 0, -.14, 0), [.5, -1, -.3]), 'horn')); } }));

  add('head_wyvern', HS, 'Dragon Heads', 'Wyvern head', ['wyvern', 'dragon', 'scale', 'fantasy', 'crest'], () => headB({ mat: 'scale', noise: [.008, 10], cap0: .7, cap1: .4, size: 2.6,
    k: [[-0.8, .3, .3, .24, .1, 2.1], [-0.45, .42, .4, .28, .12, 2.2], [-0.05, .36, .3, .24, .06, 2.3], [0.5, .2, .2, .16, -.02, 2.4], [1.1, .1, .14, .1, -.08, 2.3]],
    def: [...rpair([[.16, .32, -.25], [.22, .28, .1]], .07, .05, [.3, 1, .2], 1.3)],
    jaw: [[-0.5, .3, .06, .14, -.22], [0.4, .18, .05, .1, -.2], [1.0, .08, .04, .06, -.18]],
    eye: [0, 34, .07, [.65, .15, .74], {pupil: 'slit', iris: 'glow', lid: 58, lidMat: 'scale'}],
    extra: (pcs, S, side) => { pcs.push(P(sail([[.1, .15], [-.3, .62], [-.85, .9], [-1.25, .7], [-1.05, .5], [-.9, .38], [-.6, .2]], .03).translate(0, S(-.3, 90).y - .22, 0), 'membrane'));
      for (const [z0, z1, y1] of [[.0, -.3, .62], [-.2, -.85, .88], [-.5, -1.25, .66]]) pcs.push(P(cone(bez(V3(0, S(z0, 90).y - .05, z0), V3(0, (S(z0, 90).y + y1 + .2) / 2, (z0 + z1) / 2), V3(0, y1 + .2, z1 - .05)), .035, {seg: 12, rad: 6}), 'bone'));
      side.push(...teeth(range(1.0, .1, 7).map(z => [at3(S(z, -40), 0, .0, 0), [.05, -1, .1], .1, .022, .2])));
      side.push(hornAt(hornCurve(.5, .9, .3), .07, S(-.7, 30), [.5, .4, -.7])); } }));

  add('head_seaserpent', HS, 'Dragon Heads', 'Sea serpent head', ['serpent', 'sea', 'dragon', 'scale', 'fin', 'leviathan'], () => headB({ mat: 'scale', noise: [.008, 10], cap0: .7, cap1: .6, size: 2.7,
    k: [[-0.85, .36, .34, .3, .05, 2.1], [-0.45, .46, .4, .34, .06, 2.1], [0.0, .42, .34, .3, .02, 2.2], [0.55, .3, .24, .22, -.02, 2.3], [1.0, .22, .17, .16, -.04, 2.3]],
    jaw: [[-0.5, .38, .08, .18, -.28], [0.3, .3, .07, .15, -.28], [0.95, .18, .06, .1, -.24]],
    eye: [-.05, 30, .11, [.7, .2, .68], {pupil: 'round', iris: 'glow', ia: .7, lid: 62, lidMat: 'scale'}],
    extra: (pcs, S, side) => { side.push(...xform(fan(6, .85, 95, -35, {lf: t => 1 - .4 * t}), M(at3(S(-.5, 5), -.05, 0, 0), 0, PI / 2 - .35, 0)));
      pcs.push(...xform(fan(7, .9, 170, 100, {lf: t => .7 + .3 * Math.sin(t * PI)}), M(S(-.35, 90).add(V3(0, -.05, .1)), 0, -PI / 2, 0)));
      side.push(P(cone(cr([V3(.2, -.25, .85), V3(.3, -.45, .7), V3(.35, -.8, .75), V3(.3, -1.1, .9)]), .03, {seg: 20, rad: 6}), 'flesh'));
      side.push(...teeth([[at3(S(.9, -55), 0, .0, 0), [.05, -1, .1], .18, .03, .25], [at3(S(.65, -50), 0, .0, 0), [.05, -1, .1], .12, .025, .2]])); } }));

  add('head_dragon_pup', HS, 'Cute Heads', 'Chibi dragon pup head', ['cute', 'chibi', 'dragon', 'pal', 'scale'], () => headB({ mat: 'scale', cap0: .8, cap1: .6, size: 2.2, zf: .4,
    k: [[-0.55, .5, .55, .45, .1, 2], [-0.15, .62, .64, .52, .1, 2], [0.2, .56, .5, .46, 0, 2], [0.45, .4, .3, .32, -.12, 2.1], [0.6, .32, .22, .25, -.16, 2.1]],
    def: [...dpair([.1, -.08, .82], .03, .03, [0, 0, -1])],
    jaw: [[-0.1, .4, .08, .16, -.38], [0.45, .26, .06, .12, -.38]],
    eye: [.18, 22, .18, [.3, .05, .95], {pupil: 'round', ia: 1.0, pa: .45, iris: 'paint', lid: 40, lidMat: 'scale'}, .45],
    extra: (pcs, S, side) => { side.push(hornAt(hornCurve(.35, .9, .2), .09, S(-.3, 62), [.2, 1, -.5], {pow: 1.2, tip: .15}));
      side.push(...xform(fan(4, .32, 90, -10, {r: .025, smat: 'scale'}), M(at3(S(-.3, 10), -.03, 0, 0), 0, PI / 2 - .3, 0)));
      side.push(...teeth([[at3(S(.5, -60), 0, .02, 0), [0, -1, .1], .07, .025, .1]]));
      pcs.push(P(ell(.18, .12, .1, 14, 10).translate(0, -.32, .5), 'skin')); } }));

  // =====================================================================
  // HEADS & SKULLS — Bird heads
  // =====================================================================
  // hooked beak along a curve (up axis = +Y); w/h = base half-width/height
  const beak = (curve, w, h, o = {}) => sweep(curve, t => [w * Math.max(1 - Math.pow(t, o.p || 1.2) * (o.k || .92), .02), h * Math.max(1 - Math.pow(t, o.p || 1.2) * .9, .02)],
    {seg: o.seg || 26, rad: 16, up: [0, 1, 0], shape: (t, a) => 1 + (o.ridge ?? .12) * Math.max(0, Math.sin(a)) * Math.sin(a), noise: o.noise});
  const feather = (L, w) => leaf(bez(V3(0, 0, 0), V3(0, L * .5, -.05 * L), V3(0, L, -.25 * L)), w, w * .15, {cup: .3, prof: t => Math.pow(Math.sin(PI * clamp(.12 + t * .88, 0, 1)), .6) * (1 - .3 * t), seg: 12, rad: 10});

  add('head_eagle', HS, 'Bird Heads', 'Eagle head', ['bird', 'raptor', 'feather', 'beak', 'griffin'], () => headB({ mat: 'feather', noise: [.02, 8], cap0: .8, cap1: .5, size: 2.2, zf: .35,
    k: [[-0.6, .34, .4, .3, .2, 2], [-0.25, .46, .5, .36, .2, 2], [0.1, .42, .44, .3, .15, 2], [0.35, .28, .32, .2, .08, 2.1], [0.5, .2, .24, .15, .05, 2.1]],
    def: [...rpair([[.12, .42, .25], [.3, .38, .1], [.36, .34, -.1]], .1, .07, [.3, 1, .3], 1.3)],
    eye: [.08, 26, .1, [.75, .15, .65], {pupil: 'round', iris: 'gold', ia: .75, lid: 55, lidMat: 'feather'}],
    extra: (pcs, S, side) => { pcs.push(P(beak(bez(V3(0, .1, .4), V3(0, .2, .78), V3(0, .1, .95), V3(0, -.22, .95)), .17, .2, {p: 1.4}), 'horn'));
      pcs.push(P(beak(bez(V3(0, -.12, .4), V3(0, -.2, .62), V3(0, -.18, .76)), .14, .07, {ridge: 0}), 'horn'), P(sweep(cr([V3(-.2, .02, .45), V3(0, .24, .5), V3(.2, .02, .45)]), .06, {seg: 16, rad: 10, up: [0, 0, 1]}), 'skin'));
      for (let i = 0; i < 7; i++) { const a = -40 + i * 22; side.push(P(orient(feather(.45 + .1 * Math.sin(i), .1), S(-.55, a), [.4 * Math.cos(a * D), .4 * Math.sin(a * D), -1]), 'feather')); } } }));

  add('head_owl', HS, 'Bird Heads', 'Owl head', ['bird', 'owl', 'feather', 'night'], () => headB({ mat: 'feather', noise: [.012, 9], cap0: .8, cap1: .22, size: 2.0, zf: .45,
    k: [[-0.5, .5, .52, .45, .1, 2], [-0.15, .64, .62, .52, .1, 2], [0.15, .66, .6, .5, .08, 2.3], [0.3, .62, .56, .48, .06, 2.7]],
    def: [...dpair([.26, .12, .44], [.3, .32, .3], .14, [0, 0, -1])], rad: 40,
    extra: (pcs, S, side) => { pcs.push(...eyes(V3(.25, .12, .32), .15, [.15, .02, 1], {pupil: 'round', iris: 'gold', ia: .85, pa: .5, lid: 50, lidMat: 'feather'}));
      pcs.push(P(beak(bez(V3(0, .05, .36), V3(0, .02, .5), V3(0, -.16, .52)), .07, .08, {p: 1}), 'horn'));
      side.push(P(sweep(cr([V3(.02, .38, .42), V3(.35, .45, .38), V3(.6, .15, .3), V3(.52, -.25, .32), V3(.2, -.38, .4), V3(.02, -.3, .44)]), .04, {seg: 40, rad: 8}), 'feather'));
      for (const [x, ang] of [[.42, 20], [.32, 8]]) side.push(P(orient(feather(.4, .07), V3(x, .5, .1), [Math.sin(ang * D), 1, -.3]), 'feather')); } }));

  add('head_parrot', HS, 'Bird Heads', 'Parrot head', ['bird', 'parrot', 'feather', 'beak', 'tropical'], () => headB({ mat: 'feather', noise: [.01, 9], cap0: .8, cap1: .5, size: 2.0, zf: .35,
    k: [[-0.5, .38, .42, .34, .2, 2], [-0.15, .46, .5, .4, .2, 2], [0.15, .42, .44, .36, .15, 2], [0.32, .34, .36, .3, .1, 2.1]],
    eye: [.05, 22, .07, [.85, .15, .5], {pupil: 'round', iris: 'gold', lid: 55, lidMat: 'skin'}],
    extra: (pcs, S, side) => { side.push(P(at(new T.TorusGeometry(.1, .03, 8, 24), 0, 0, 0, 0, PI / 2 - .55, 0).translate(...S(.05, 22).add(V3(.0, 0, 0)).toArray()), 'skin'));
      pcs.push(P(beak(cr([V3(0, .2, .3), V3(0, .3, .6), V3(0, .15, .85), V3(0, -.2, .82), V3(0, -.4, .7)]), .2, .24, {p: 1.6, k: .9}), 'horn'));
      pcs.push(P(beak(bez(V3(0, -.12, .32), V3(0, -.25, .55), V3(0, -.12, .68)), .17, .12, {ridge: 0}), 'darkmetal'));
      for (let i = 0; i < 6; i++) pcs.push(P(orient(feather(.55 + i * .06, .15), S(-.05 - i * .1, 90), [0, 1, -.4 - i * .25]), 'feather')); } }));

  // =====================================================================
  // HEADS & SKULLS — Sea & swamp heads
  // =====================================================================
  add('head_shark', HS, 'Sea Heads', 'Shark head', ['shark', 'fish', 'sea', 'skin', 'teeth'], () => headB({ mat: 'skin', noise: [.004, 10], cap0: .3, cap1: 1.0, size: 2.8, zf: .15,
    k: [[-0.9, .5, .45, .45, 0, 2.2], [-0.3, .52, .44, .44, 0, 2.2], [0.3, .42, .32, .36, 0, 2.2], [0.8, .26, .2, .22, .06, 2.1], [1.15, .15, .12, .12, .1, 2]],
    def: [ridge([[.44, -.24, -.2], [.32, -.33, .2], [0, -.36, .38], [-.32, -.33, .2], [-.44, -.24, -.2]], .07, .1, [0, 1, 0]),
      ...[0, 1, 2, 3, 4].flatMap(i => rpair([[.5, .22, -.45 - i * .1], [.52, -.22, -.4 - i * .1]], .03, .06, [-1, 0, 0], 1)), ...dpair([.1, -.02, 1.22], .03, .03, [0, .3, -1])],
    eye: [.42, 15, .055, [.95, .05, .3], {sclera: 'darkmetal', iris: false}],
    extra: (pcs, S, side) => { const mouth = cr([V3(.44, -.24, -.2), V3(.32, -.33, .2), V3(0, -.35, .38), V3(-.32, -.33, .2), V3(-.44, -.24, -.2)]);
      pcs.push(P(sweep(mouth, .05, {seg: 40, rad: 8}), 'flesh'));
      for (let i = 0; i <= 22; i++) { const t = i / 22, p = mouth.getPointAt(t), sz = .75 + .35 * Math.sin(t * PI);
        pcs.push(P(orient(tooth(.15 * sz, .05 * sz, .05, {flat: .35}), p.clone().add(V3(0, .02, 0)), [0, -1, .25]), 'tooth'), P(orient(tooth(.1 * sz, .04 * sz, .05, {flat: .35}), p.add(V3(0, .06, -.04)), [0, -1, .6]), 'tooth')); } } }));

  add('head_angler', HS, 'Sea Heads', 'Anglerfish head', ['fish', 'deep sea', 'angler', 'lure', 'horror'], () => {
    const m = mandible({hw: .62, L: 1.15, h: .2, th: .09, drop: .1, chinW: .6, flare: .98, pos: [0, -.42, -.35], chinZ: .1});
    return headB({ mat: 'skin', noise: [.03, 5], cap0: .8, cap1: .3, size: 2.6, zf: .35,
      k: [[-0.8, .55, .6, .55, 0, 2], [-0.3, .7, .66, .6, 0, 2], [0.2, .66, .6, .55, 0, 2], [0.5, .55, .5, .48, 0, 2.2]],
      def: [dent([0, -.15, .68], [.52, .36, .4], .38, [0, .1, -1])],
      eye: [.0, 40, .05, [.7, .3, .65], {pupil: 'round', iris: 'glow', sclera: 'darkmetal'}],
      extra: (pcs, S, side) => { pcs.push(P(m.geo, 'skin'), P(ell(.45, .25, .2, 18, 12).translate(0, -.18, .35), 'flesh'));
        pcs.push(...jawTeeth(m.curve, range(.48, .2, 9), t => [.18 + .22 * Math.sin(t * 5), .025, .25], .08, {dir: [0, 1, -.1]}));
        side.push(...teeth(range(.03, .55, 7).map(x => [V3(x, .2 - x * x * .5, .62 - x * x * .6), [0, -1, .35], .15 + .1 * Math.cos(x * 4), .022, .3])));
        pcs.push(P(cone(cr([S(.1, 90).add(V3(0, -.05, 0)), V3(0, 1.0, .25), V3(0, 1.2, .7), V3(0, .9, 1.05)]), .04, {seg: 30, rad: 8, tip: .4}), 'skin'), P(sphere(.1, 16, 12).translate(0, .85, 1.1), 'glow'));
        for (const [z, a] of [[-.2, -20], [-.5, -10], [-.4, -40]]) side.push(P(orient(leaf(bez(V3(0, 0, 0), V3(0, .15, 0), V3(0, .3, -.1)), .08, .02, {cup: 0}), S(z, a), [1, -.2, -.3]), 'skin')); } }); });

  add('head_piranha', HS, 'Sea Heads', 'Piranha head', ['fish', 'piranha', 'river', 'teeth'], () => headB({ mat: 'scale', noise: [.004, 12], cap0: .5, cap1: .6, size: 2.0, zf: .25,
    k: [[-0.7, .3, .55, .5, 0, 2], [-0.3, .36, .6, .5, 0, 2], [0.15, .3, .45, .4, -.05, 2.1], [0.5, .22, .3, .3, -.12, 2.2]],
    def: [...rpair([[.32, .35, -.35], [.36, 0, -.42], [.32, -.35, -.35]], .04, .03, [1, 0, 0]), ...dpair([.08, .05, .7], .03, .02, [0, 0, -1])],
    jaw: [[-0.2, .26, .12, .25, -.42], [0.3, .22, .1, .2, -.38], [0.62, .17, .1, .14, -.3]],
    eye: [-.05, 25, .09, [.95, .1, .3], {pupil: 'round', iris: 'gold', ia: .8}],
    extra: (pcs, S, side) => { const JS = surf([[-0.2, .26, .12, .25, -.42], [0.3, .22, .1, .2, -.38], [0.62, .17, .1, .14, -.3]]);
      side.push(...teeth(range(.68, .2, 6).map(z => [at3(JS(z, 60), -.01, 0, 0), [0, 1, .2], .1, .04, .05, .35])), ...teeth(range(.62, .3, 4).map(z => [at3(S(z, -70), -.02, 0, 0), [0, -1, .2], .05, .03, .05, .35])));
      side.push(...xform(fan(5, .3, 120, 200, {mat: 'membrane', r: .015, smat: 'scale'}), M(S(-.5, -40), 0, PI / 2, 0))); } }));

  add('head_viperfish', HS, 'Sea Heads', 'Fang fish head', ['fish', 'deep sea', 'viperfish', 'fang', 'horror'], () => headB({ mat: 'slime', noise: [.006, 10], cap0: .6, cap1: .6, size: 2.3, zf: .25,
    k: [[-0.7, .32, .36, .3, .05, 2], [-0.3, .4, .4, .34, .05, 2], [0.1, .34, .3, .28, .02, 2.1], [0.4, .24, .2, .18, 0, 2.2]],
    jaw: [[-0.4, .32, .06, .16, -.3], [0.3, .24, .05, .12, -.34], [0.75, .16, .05, .08, -.32]],
    eye: [.05, 25, .13, [.85, .2, .5], {pupil: 'round', iris: 'paint', ia: .8, pa: .6}],
    extra: (pcs, S, side) => { side.push(hornAt(bez(V3(0, 0, 0), V3(0, .4, -.05), V3(0, .7, -.2)), .035, V3(.12, -.3, .76), [.05, 1, -.15], {pow: 1, tip: .02}, 'tooth'));
      side.push(hornAt(bez(V3(0, 0, 0), V3(0, .3, .05), V3(0, .5, -.1)), .03, at3(S(.45, -60), 0, .0, 0), [.05, -1, -.1], {pow: 1, tip: .02}, 'tooth'));
      for (let i = 0; i < 7; i++) side.push(P(sphere(.022, 8, 6).translate(...S(-.6 + i * .14, -55).toArray()), 'glow'));
      pcs.push(P(cone(bez(V3(0, .3, -.4), V3(0, .6, -.5), V3(0, .5, -.9)), .03, {seg: 14, rad: 6}), 'slime'), P(sphere(.06, 12, 8).translate(0, .5, -.9), 'glow')); } }));

  add('head_toad', HS, 'Sea Heads', 'Warty toad head', ['frog', 'toad', 'amphibian', 'swamp', 'skin'], () => headB({ mat: 'skin', noise: [.025, 10], cap0: .7, cap1: .5, size: 2.4, zf: .35,
    k: [[-0.6, .62, .4, .3, 0, 2.3], [-0.2, .78, .38, .32, 0, 2.4], [0.3, .7, .3, .3, -.05, 2.5], [0.65, .5, .2, .24, -.1, 2.6]],
    def: [...dpair([.4, .32, -.05], .22, .14, [0, 1, 0]), ...dpair([.5, .25, -.45], [.15, .1, .25], .1, [.3, 1, 0]), ...dpair([.1, .1, .82], .025, .025, [0, 0, -1])],
    jaw: [[-0.45, .7, .06, .2, -.28], [0.2, .72, .06, .22, -.3], [0.62, .5, .05, .16, -.3]],
    extra: (pcs, S, side) => { pcs.push(...eyes(V3(.4, .44, -.02), .16, [.45, .65, .6], {pupil: 'goat', iris: 'gold', ia: .8, lid: 52, lidMat: 'skin', low: 60}));
      for (let i = 0; i < 16; i++) { const z = -.5 + (i * .37) % 1.1, a = 10 + (i * 47) % 80; side.push(P(sphere(.03 + (i % 3) * .015, 8, 6).translate(...S(z, a).toArray()), 'skin')); } } }));

  add('head_turtle', HS, 'Sea Heads', 'Snapping turtle head', ['turtle', 'reptile', 'beak', 'swamp'], () => headB({ mat: 'scale', noise: [.015, 10], cap0: .7, cap1: .4, size: 2.2, zf: .3,
    k: [[-0.75, .4, .38, .34, .05, 2.2], [-0.35, .5, .44, .38, .08, 2.3], [0.1, .44, .36, .32, .04, 2.3], [0.45, .3, .25, .24, -.05, 2.4], [0.65, .22, .18, .18, -.1, 2.4]],
    jaw: [[-0.5, .4, .08, .2, -.32], [0.2, .34, .07, .16, -.32], [0.5, .22, .06, .1, -.3]],
    eye: [.1, 30, .07, [.8, .2, .55], {pupil: 'round', iris: 'gold', lid: 55, lidMat: 'scale', low: 55}],
    extra: (pcs, S, side) => { pcs.push(P(beak(bez(V3(0, .0, .45), V3(0, .05, .78), V3(0, -.12, .9), V3(0, -.36, .85)), .22, .2, {p: 1.5}), 'horn'));
      pcs.push(P(beak(bez(V3(0, -.3, .4), V3(0, -.35, .62), V3(0, -.28, .76)), .2, .09, {ridge: 0}), 'horn'));
      for (const [z, x, w] of [[-.4, 0, .16], [-.1, 0, .14], [-.25, .2, .12], [.1, .17, .1]]) for (const sx of x ? [1, -1] : [1]) pcs.push(P(nz(ell(w, .04, w * .8, 12, 8), .005, 9).translate(x * sx, S(z, 90).y - .01 - x * .2, z), 'scale')); } }));

  add('head_octopus', HS, 'Sea Heads', 'Octopus mantle head', ['octopus', 'cephalopod', 'sea', 'tentacle', 'horror'], () => {
    const base = nz(ell(.62, .45, .58, 32, 24), .02, 5), pcs = [P(base, 'skin')], side = [];
    pcs.push(P(nz(lathe(range(0, 1, 24).map(t => [Math.max(.001, .8 * Math.pow(Math.sin(PI * t), .5) * (1 - .2 * t)), 2.0 * t]), 40), .04, 3).applyMatrix4(M([0, .1, -.1], -.45, 0, 0)), 'skin'));
    pcs.push(...eyes(V3(.48, .12, .22), .14, [.85, .15, .5], {pupil: 'goat', iris: 'gold', ia: .8, lid: 60, lidMat: 'skin', low: 60}));
    side.push(P(nz(ell(.18, .12, .16, 14, 10), .01, 8).translate(.45, .25, .2), 'skin'));
    pcs.push(P(cone(bez(V3(.35, -.2, .15), V3(.6, -.3, .1), V3(.75, -.2, -.1)), .1, {seg: 12, rad: 10, tip: .6}), 'skin'));
    for (let i = 0; i < 8; i++) { const a = (i + .5) / 8 * TAU, dx = Math.sin(a), dz = Math.cos(a);
      pcs.push(P(cone(cr([V3(dx * .3, -.25, dz * .3), V3(dx * .55, -.6, dz * .55), V3(dx * .6, -1.0, dz * .5), V3(dx * .45, -1.25, dz * .35), V3(dx * .38, -1.2, dz * .55)]), .17, {seg: 30, rad: 12, pow: .8, tip: .1}), 'skin')); }
    return place(pcs.concat(sym(side)), 2.8, .5, .2, base); });

  // =====================================================================
  // HEADS & SKULLS — Bug heads
  // =====================================================================
  const compound = (r, det = 3) => { const g = new T.IcosahedronGeometry(r, det); g.computeVertexNormals(); return g; }; // faceted
  const antenna = (pts, r = .02, beads = 0) => { const c = cr(pts.map(v3)), L = [P(cone(c, r, {seg: 40, rad: 6, tip: .4, pow: 1}), 'chitin')];
    for (let i = 1; i <= beads; i++) L.push(P(ell(r * 1.6, r * 1.6, r * 2.2, 8, 6).applyMatrix4(M(c.getPointAt(.35 + .65 * i / beads))), 'chitin')); return L; };
  const blob = (rx, ry, rz, fns, nzA = 0, nzF = 5, ws = 36, hs = 26) => { const g = ell(rx, ry, rz, ws, hs); deform(g, fns); return nzA ? nz(g, nzA, nzF) : weld(g); };

  add('head_mantis', HS, 'Bug Heads', 'Mantis head', ['insect', 'mantis', 'bug', 'chitin'], () => {
    const main = blob(.72, .55, .3, [v => { const ty = (v.y + .55) / 1.1; v.x *= .3 + .7 * ty; v.z += .12 * (1 - ty) - .05 * ty; }, dent([0, .55, .05], .25, .1, [0, -1, 0])], .005, 8);
    const pcs = [P(main, 'chitin')], side = [];
    side.push(P(compound(.2).scale(1, 1.25, 1).translate(.62, .36, .02), 'crystal'));
    side.push(...antenna([[.1, .4, .18], [.2, .9, .1], [.38, 1.5, -.25], [.6, 1.9, -.7]], .018));
    side.push(P(sphere(.035, 10, 8).translate(.07, .28, .27), 'glow')); pcs.push(P(sphere(.035, 10, 8).translate(0, .34, .26), 'glow'));
    pcs.push(P(nz(ell(.16, .1, .07, 14, 10), .004, 9).translate(0, -.42, .2), 'chitin'));
    side.push(P(cone(bez(V3(.1, -.48, .15), V3(.14, -.6, .25), V3(.03, -.62, .3)), [.05, .03], {seg: 12, rad: 8}), 'chitin'));
    side.push(P(cone(cr([V3(.14, -.45, .12), V3(.2, -.65, .2), V3(.18, -.85, .28), V3(.12, -.95, .35)]), .028, {seg: 16, rad: 6, tip: .5}), 'chitin'));
    return place(pcs.concat(sym(side)), 2.0, 0, .1, main); });

  add('head_ant', HS, 'Bug Heads', 'Ant head with mandibles', ['insect', 'ant', 'bug', 'chitin', 'mandible'], () => {
    const main = blob(.6, .55, .42, [v => { const ty = (v.y + .55) / 1.1; v.x *= .75 + .35 * ty; }, dent([0, .58, 0], .3, .14, [0, -1, 0])], .006, 8);
    const pcs = [P(main, 'chitin')], side = [];
    side.push(P(compound(.11, 2).scale(.8, 1.1, 1).translate(.58, .12, .12), 'crystal'));
    const mc = bez(V3(.3, -.36, .22), V3(.42, -.38, .5), V3(.25, -.4, .7), V3(.03, -.41, .66));
    side.push(P(sweep(mc, t => [lerp(.12, .025, t), lerp(.06, .02, t)], {seg: 24, rad: 12, up: [0, 1, 0]}), 'chitin'));
    for (const t of [.45, .6, .72, .85]) { const p = mc.getPointAt(t), tg = mc.getTangentAt(t); side.push(P(orient(spike(.08, .025, 0), p, [-tg.z, 0, tg.x]), 'chitin')); }
    side.push(...antenna([[.2, .25, .35], [.38, .55, .45], [.55, .85, .5]], .028), ...antenna([[.55, .85, .5], [.62, .9, .8], [.62, .75, 1.1], [.58, .55, 1.3]], .022, 7));
    return place(pcs.concat(sym(side)), 2.2, 0, .1, main); });

  add('head_spider', HS, 'Bug Heads', 'Spider head', ['spider', 'arachnid', 'bug', 'chitin', 'fang', 'horror'], () => {
    const k = [[-0.8, .55, .35, .3, .1, 2.1], [-0.3, .65, .45, .32, .15, 2.1], [0.2, .55, .5, .3, .2, 2.2], [0.5, .42, .44, .28, .2, 2.3]];
    const main = loft(k, {noise: [.012, 9], cap1: .5, def: [dent([0, .62, .4], .25, -.08, [0, 1, .3])]}), pcs = [P(main, 'chitin')], side = [];
    for (const [p, r] of [[[.12, .48, .64], .1], [[.28, .45, .57], .065], [[.14, .64, .48], .055], [[.32, .6, .42], .055]]) side.push(...placeList(eye(r, {sclera: 'darkmetal', iris: false}), g => g.translate(...p)));
    const ch = cr([V3(.16, .08, .55), V3(.17, -.2, .68), V3(.15, -.5, .7)]);
    side.push(P(sweep(ch, t => lerp(.15, .1, t), {seg: 16, rad: 14, noise: [.012, 10]}), 'chitin'));
    side.push(hornAt(bez(V3(0, 0, 0), V3(0, .15, 0), V3(-.08, .26, -.06), V3(-.12, .3, -.15)), .05, V3(.15, -.58, .72), [-.6, -1, .15], {pow: 1, tip: .02}, 'darkmetal'));
    side.push(P(cone(cr([V3(.38, -.05, .35), V3(.52, -.2, .65), V3(.48, -.15, .9), V3(.42, -.45, 1.05)]), .055, {seg: 24, rad: 8, tip: .5, noise: [.008, 10]}), 'chitin'));
    return place(pcs.concat(sym(side)), 2.2, .1, 0, main); });

  add('head_crab', HS, 'Bug Heads', 'Crab head', ['crab', 'crustacean', 'sea', 'chitin', 'eyestalk'], () => {
    const main = blob(1.05, .3, .72, [v => { v.y += .18 * (1 - (v.x * v.x) / 1.1) * (v.y > 0 ? 1 : .2); }], .015, 6), pcs = [P(main, 'chitin')], side = [];
    for (let i = 0; i < 5; i++) { const a = (25 + i * 13) * D; side.push(P(orient(spike(.2, .06, -.2), V3(Math.sin(a) * 1.0, .05, Math.cos(a) * .68), [Math.sin(a), .15, Math.cos(a)]), 'chitin')); }
    side.push(P(orient(spike(.14, .04, 0), V3(.07, .2, .7), [.15, .2, 1]), 'chitin'));
    const st = bez(V3(.22, .2, .58), V3(.25, .42, .66), V3(.32, .55, .74)); side.push(P(sweep(st, t => lerp(.05, .04, t), {seg: 10, rad: 10}), 'chitin'));
    side.push(...placeList(eye(.075, {sclera: 'darkmetal', iris: false}), g => g.translate(.33, .6, .76)));
    side.push(P(cone(cr([V3(.12, .08, .7), V3(.25, .1, 1.1), V3(.5, .25, 1.5), V3(.7, .5, 1.75)]), .018, {seg: 24, rad: 6, tip: .3}), 'chitin'));
    side.push(P(at(K.extr([[-.08, -.18], [.08, -.18], [.1, .1], [0, .16], [-.1, .1]], .04, .015, 1), .1, -.2, .66, -.2, 0, 0), 'chitin'));
    return place(pcs.concat(sym(side)), 2.6, .1, 0, main); });

  // =====================================================================
  // HEADS & SKULLS — Alien & horror heads
  // =====================================================================
  add('head_demon', HS, 'Alien & Horror Heads', 'Demon head', ['demon', 'humanoid', 'horn', 'fantasy', 'horror'], () => headB({ mat: 'skin', noise: [.012, 8], cap0: .8, cap1: .35, size: 2.6, zf: .45,
    k: [[-0.7, .45, .55, .4, .35, 2], [-0.35, .58, .72, .5, .35, 2], [0.05, .6, .7, .6, .25, 2], [0.35, .55, .5, .65, .1, 2.2], [0.55, .46, .35, .6, -.05, 2.4]],
    def: [...dpair([.2, .2, .68], [.15, .1, .12], .08, [0, 0, -1]), ridge([[-.4, .34, .62], [-.15, .33, .7], [0, .3, .72], [.15, .33, .7], [.4, .34, .62]], .09, .09, [0, .3, 1]),
      ...dpair([.4, -.02, .5], .18, -.08, [1, 0, .6]), dent([0, -.02, .72], [.1, .17, .14], -.12, [0, -.2, 1]), ...dpair([.05, -.12, .8], .035, .03, [0, .3, -1]), ridge([[0, .7, -.1], [0, .62, .4]], .1, .04, [0, 1, 0])],
    jaw: [[-0.2, .48, .12, .2, -.42], [0.3, .46, .1, .22, -.48], [0.56, .34, .08, .18, -.48]],
    extra: (pcs, S, side) => { pcs.push(...eyes(V3(.2, .19, .64), .065, [.1, 0, 1], {sclera: 'glow', pupil: 'slit', iris: 'glow', pmat: 'darkmetal', shine: false}));
      side.push(...teeth([[V3(.17, -.33, .7), [0, -1, .1], .22, .045, .2], [V3(.26, -.4, .62), [0, 1, .1], .16, .04, -.2]]));
      side.push(P(orient(earGeo(.55, .16, {lean: -.6, cup: .4}), V3(.56, .12, -.05), [1, .5, -.6]), 'skin'));
      side.push(hornAt(hornCurve(1.3, .8, .35, .2), .17, V3(.3, .62, .32), [.3, 1, .3], {ridges: [9, .05], seg: 36})); } }));

  add('head_xeno', HS, 'Alien & Horror Heads', 'Long-skull alien head', ['alien', 'xeno', 'sci-fi', 'horror', 'chitin'], () => {
    const k = [[-1.6, .12, .12, .12, .9, 2], [-1.0, .3, .3, .28, .65, 2], [-0.4, .4, .42, .38, .35, 2], [0.1, .36, .36, .35, .1, 2], [0.55, .25, .24, .26, -.05, 2.2], [0.8, .2, .18, .2, -.1, 2.2]], S0 = surf(k);
    const ribs = range(-1.3, -.1, 9).map(z => ridge(range(-20, 200, 13).map(a => S0(z, a).toArray()), .05, .05, [0, 1, .3], 1.2));
    return headB({ mat: 'chitin', noise: [.004, 10], cap0: .6, cap1: .5, size: 2.9, zf: .55, def: ribs, k,
      jaw: [[-0.2, .3, .08, .14, -.32], [0.4, .24, .07, .12, -.32], [0.8, .16, .06, .09, -.28]],
      extra: (pcs, S, side) => { side.push(...teeth(range(.03, .2, 6).map(x => [V3(x, -.2, .92 - x * x * 3), [0, -1, .15], .14, .028, 0, .7])), ...teeth(range(.03, .18, 5).map(x => [V3(x, -.29, .88 - x * x * 3), [0, 1, .15], .11, .025, 0, .7])));
        pcs.push(P(sweep(cr([V3(-.24, -.24, .78), V3(0, -.25, .92), V3(.24, -.24, .78)]), .035, {seg: 20, rad: 8}), 'flesh'));
        for (const [z, a] of [[.25, 32], [.05, 38]]) side.push(P(ell(.07, .016, .03, 12, 8).applyMatrix4(M(S(z, a), 0, .5, -.25)), 'glow')); } }); });

  add('head_grey', HS, 'Alien & Horror Heads', 'Grey alien head', ['alien', 'grey', 'sci-fi'], () => {
    const main = blob(.7, .72, .72, [v => { if (v.y < 0) { const k = -v.y / .72; v.x *= 1 - .55 * k; v.z = v.z * (1 - .25 * k) + .2 * k; } }, ...dpair([.04, -.22, .66], .02, .015, [0, 0, -1]), ridge([[-.08, -.48, .55], [.08, -.48, .55]], .02, .02, [0, 0, -1])], 0);
    const pcs = [P(main, 'skin')], side = [];
    const eg = ell(.25, .12, .1, 24, 16); deform(eg, [v => { v.z -= v.x * v.x * .9; }]); weld(eg);
    side.push(P(eg.applyMatrix4(M([.27, .02, .6], 0, .45, -.42)), 'darkmetal'));
    return place(pcs.concat(sym(side)), 2.0, .45, 0, main); });

  add('head_hive', HS, 'Alien & Horror Heads', 'Hive alien head', ['alien', 'insectoid', 'bug', 'chitin', 'sci-fi', 'mandible'], () => {
    const k = [[-0.7, .45, .45, .35, .1, 2.6], [-0.3, .55, .5, .4, .1, 2.6], [0.2, .45, .4, .35, 0, 2.8], [0.55, .3, .3, .3, -.1, 2.8]], S0 = surf(k);
    const plates = range(-.6, .35, 5).map(z => ridge(range(-30, 210, 9).map(a => S0(z, a).toArray()), .06, .04, [0, 1, .5], 1.5));
    return headB({ mat: 'chitin', noise: [.004, 10], cap0: .7, cap1: .5, size: 2.6, zf: .3, def: plates, k,
      extra: (pcs, S, side) => { side.push(P(compound(.09, 2).translate(...at3(S(.32, 28), -.03, 0, 0).toArray()), 'glow'), P(compound(.065, 2).translate(...at3(S(.08, 14), -.03, 0, 0).toArray()), 'glow'));
        const mc = bez(V3(.32, -.3, .35), V3(.62, -.34, .6), V3(.42, -.38, .9), V3(.1, -.4, .85));
        side.push(P(sweep(mc, t => [lerp(.1, .02, t), lerp(.06, .015, t)], {seg: 24, rad: 12, up: [0, 1, 0]}), 'chitin'));
        for (let i = 0; i < 3; i++) side.push(P(cone(cr([V3(.06 + i * .07, -.32, .5), V3(.1 + i * .08, -.5, .62), V3(.06 + i * .1, -.7, .6)]), .025, {seg: 14, rad: 6}), 'flesh'));
        side.push(hornAt(hornCurve(1.0, 1.1, .25), [.1, .2], S(-.4, 70), [.15, .5, -.9], {ridges: [4, .1]}, 'chitin')); } }); });

  add('head_ghoul', HS, 'Alien & Horror Heads', 'Ghoul head', ['undead', 'ghoul', 'zombie', 'humanoid', 'horror'], () => headB({ mat: 'skin', noise: [.012, 14], cap0: .8, cap1: .35, size: 2.4, zf: .45,
    k: [[-0.65, .42, .5, .4, .35, 2], [-0.3, .52, .65, .45, .3, 2], [0.05, .5, .62, .55, .2, 2], [0.35, .42, .45, .62, .05, 2.2], [0.5, .34, .32, .6, -.1, 2.4]],
    def: [...dpair([.17, .14, .58], [.12, .1, .12], .12, [0, 0, -1]), ...dpair([.3, -.22, .45], .16, .1, [-1, 0, -.3]), ...dpair([.34, .0, .45], .1, -.04, [1, 0, .4]),
      dent([0, -.04, .66], [.06, .1, .1], .1, [0, 0, -1]), ridge([[-.3, .26, .58], [0, .25, .64], [.3, .26, .58]], .07, .05, [0, .3, 1])],
    jaw: [[-0.2, .4, .1, .2, -.5], [0.3, .34, .08, .22, -.62], [0.5, .26, .07, .18, -.65]],
    extra: (pcs, S, side) => { pcs.push(voidBall([0, -.06, .6], [.04, .07, .05]));
      side.push(P(sphere(.035, 10, 8).translate(.17, .14, .5), 'glow'), voidBall([.17, .14, .48], .07));
      side.push(...teeth(range(.02, .16, 5).map(x => [V3(x, -.36, .6 - x * x * 2), [0, -1, .1], .12, .03, 0, .6])), ...teeth(range(.02, .15, 5).map(x => [V3(x, -.46, .56 - x * x * 2), [0, 1, .1], .1, .028, 0, .6])));
      side.push(P(orient(earGeo(.4, .14, {lean: -.6, cup: .4, noise: [.008, 12]}), V3(.46, .1, -.05), [1, .4, -.6]), 'skin')); } }));

  // =====================================================================
  // HEADS & SKULLS — Cute heads (pal / pocket-monster style, original)
  // =====================================================================
  add('head_chibi_fox', HS, 'Cute Heads', 'Chibi fox critter head', ['cute', 'chibi', 'fox', 'pal', 'fur'], () => headB({ mat: 'fur', cap0: .8, cap1: .6, size: 2.2, zf: .4, noise: [.006, 6],
    k: [[-0.55, .55, .6, .5, .15, 2], [-0.15, .68, .68, .56, .15, 2], [0.2, .62, .58, .5, .05, 2], [0.45, .36, .3, .3, -.1, 2.1], [0.62, .24, .2, .2, -.15, 2.1]],
    eye: [.22, 18, .19, [.3, .02, .95], {pupil: 'round', ia: 1.0, pa: .5, iris: 'paint', lid: 38, lidMat: 'fur'}, .5],
    extra: (pcs, S, side) => { pcs.push(P(ell(.08, .06, .06, 14, 10).translate(0, -.08, .74), 'rubber'));
      const ep = at3(S(-.25, 58), -.05, -.05, 0); side.push(P(orient(earGeo(.75, .3, {cup: .5, out: .1}), ep, [.4, 1, -.05]), 'fur'), P(orient(earGeo(.55, .18, {cup: .2, out: .08}), ep.clone().add(V3(0, .05, .05)), [.4, 1, -.05]), 'skin'));
      for (const [a, l] of [[-10, .35], [-30, .38], [-50, .3]]) side.push(P(orient(cone(bez(V3(0, 0, 0), V3(0, l * .5, 0), V3(0, l, -l * .4)), [.12, .08], {seg: 10, rad: 10, pow: 1.3}), S(-.05, a), [1, -.4, -.4]), 'fur'));
      pcs.push(P(cone(bez(V3(0, .5, .35), V3(0, .8, .3), V3(0, .9, .05)), [.1, .06], {seg: 12, rad: 10, pow: 1.3}), 'fur')); } }));

  // =====================================================================
  // JAWS & TEETH — lower jaws (hinge at origin, chin toward +Z)
  // =====================================================================
  function boneJaw(o, jt, size, extra) { const m = mandible(o), pcs = [P(m.geo, o.mat || 'bone')];
    if (o.rise) for (const t of [.035, .965]) { const p = m.curve.getPointAt(t); pcs.push(P(orient(cone(bez(V3(0, 0, 0), V3(0, o.rise * .5, 0), V3(0, o.rise * .9, -o.rise * .2)), [o.h * .14, o.h * .4], {rad: 10, seg: 8}), p.add(V3(0, -o.rise * .3, o.L * .12)), [0, 1, .15]), o.mat || 'bone')); }
    for (const [ts, sz, yo, oo] of jt) pcs.push(...jawTeeth(m.curve, ts, sz, yo, oo)); if (extra) extra(pcs, m); return fit(pcs, size); }
  add('jaw_wolf', JT, 'Lower Jaws', 'Canine jaw (bone)', ['canine', 'bone', 'jaw', 'undead'], () => boneJaw({hw: .36, L: 1.55, h: .22, th: .065, drop: -.1, chinW: .3, rise: .28, pos: [0, -.28, 0]},
    [[[.493, .48], () => [.07, .022, .1], .09], [[.462], () => [.24, .045, -.3], .09], [range(.43, .3, 6), t => [.07 + .05 * (1 - Math.abs(t - .34) * 8), .045, 0, .5], .09]], 1.7));
  add('jaw_humanoid', JT, 'Lower Jaws', 'Brute jaw (bone)', ['humanoid', 'bone', 'jaw', 'undead', 'demon'], () => boneJaw({hw: .46, L: .8, h: .26, th: .08, drop: -.06, chinW: .55, chinH: 1.2, flare: .95, rise: .38, pos: [0, -.38, 0]},
    [[range(.49, .37, 6), t => [t > .45 ? .1 : .09, .045, 0, t > .45 ? .5 : 1], .12], [[.44], () => [.24, .05, -.2], .12]], 1.3));
  add('jaw_croc', JT, 'Lower Jaws', 'Crocodile lower jaw', ['croc', 'reptile', 'scale', 'jaw', 'swamp'], () => {
    const jk = [[0, .5, .1, .16, -.12, 2.5], [0.6, .42, .07, .13, -.12, 2.7], [1.6, .24, .06, .1, -.1, 2.9], [2.5, .22, .06, .09, -.1, 2.9]], JS = surf(jk);
    return fit([P(loft(jk, {noise: [.01, 9], cap0: .6, seg: 40}), 'scale'), ...sym(teeth(range(2.5, .7, 12).map(z => [at3(JS(z, 25), -.03, .0, 0), [.15, 1, 0], .1 + .08 * Math.exp(-Math.pow((z - 2.15) * 6, 2)), .03, .1])))], 2.8); });
  add('jaw_tyrant', JT, 'Lower Jaws', 'Tyrant lower jaw', ['dinosaur', 'tyrant', 'scale', 'jaw', 'kaiju'], () => {
    const jk = [[0, .5, .15, .3, -.2, 2.4], [0.7, .4, .12, .32, -.25, 2.5], [1.5, .27, .1, .24, -.22, 2.6], [1.95, .2, .08, .16, -.18, 2.6]], JS = surf(jk);
    return fit([P(loft(jk, {noise: [.015, 8], cap0: .6}), 'scale'), ...sym(teeth(range(1.95, .7, 8).map(z => [at3(JS(z, 40), -.03, -.02, 0), [.05, 1, 0], .2, .06, -.2, .6])))], 2.2); });
  add('jaw_dragon', JT, 'Lower Jaws', 'Dragon lower jaw', ['dragon', 'scale', 'jaw', 'fantasy'], () => {
    const jk = [[0, .45, .1, .2, -.15, 2.3], [0.7, .34, .08, .16, -.16, 2.5], [1.5, .22, .07, .12, -.14, 2.6], [1.9, .18, .06, .09, -.12, 2.6]], JS = surf(jk), side = [];
    side.push(...teeth(range(1.9, .6, 8).map(z => [at3(JS(z, 40), -.02, -.01, 0), [.05, 1, -.05], z > 1.7 ? .3 : .12, z > 1.7 ? .05 : .035, -.25])));
    for (const z of [.3, .7, 1.1]) side.push(P(orient(spike(.3, .06, .4), at3(JS(z, -50), 0, .02, 0), [.4, -1, -.7]), 'horn'));
    side.push(P(orient(spike(.22, .05, .5), JS(1.75, -85), [.2, -1, .3]), 'horn'));
    return fit([P(loft(jk, {noise: [.01, 9], cap0: .6}), 'scale'), ...sym(side)], 2.2); });

  // =====================================================================
  // JAWS & TEETH — maws, mandibles, beaks (back at origin, mouth toward +Z)
  // =====================================================================
  add('jaw_shark_ring', JT, 'Maws & Mandibles', 'Shark jaw ring', ['shark', 'teeth', 'maw', 'bone', 'sea'], () => {
    const ring = new T.CatmullRomCurve3(range(0, 1, 17).slice(0, 16).map(t => { const a = t * TAU; return V3(Math.cos(a) * .95, .62 + Math.sin(a) * .62 * (Math.sin(a) > 0 ? 1 : .85), -Math.abs(Math.sin(a)) * .12); }), true);
    const pcs = [P(sweep(ring, () => [.09, .11], {seg: 80, rad: 10, up: [0, 0, 1], cap: false}), 'bone')];
    for (let row = 0; row < 3; row++) for (let i = 0; i < 26; i++) { const t = (i + row * .33) / 26, p = ring.getPointAt(t), c = V3(0, .62, -.3 - row * .1), up = Math.sin(t * TAU) > 0, sz = (1 - row * .22) * (up ? 1 : .85);
      pcs.push(P(orient(tooth(.24 * sz, .07 * sz, .05, {flat: .35}), p.clone().add(V3(0, 0, -row * .07)), c.clone().sub(p).normalize().add(V3(0, 0, .6 - row * .3))), 'tooth')); }
    return fit(pcs, 2.0); });
  add('jaw_lamprey', JT, 'Maws & Mandibles', 'Lamprey maw', ['lamprey', 'leech', 'worm', 'teeth', 'maw', 'horror'], () => {
    const disc = at(lathe([[0, -.35], [.22, -.3], [.3, -.05], [.55, .05], [.85, .02], [1.0, -.08], [1.0, -.25], [.9, -.35], [.001, -.4]].reverse(), 48), 0, 0, 0, PI / 2, 0, 0);
    const pcs = [P(nz(disc, .015, 6).translate(0, 0, .4), 'flesh'), P(ell(.25, .25, .1, 18, 10).translate(0, 0, .12), 'darkmetal')];
    for (const [R, n, L] of [[.35, 10, .14], [.55, 16, .12], [.75, 22, .1]]) for (let i = 0; i < n; i++) { const a = (i + (n % 2) * .5) / n * TAU, p = V3(Math.cos(a) * R, Math.sin(a) * R, .43 + R * .02);
      pcs.push(P(orient(tooth(L, L * .4, .3), p, V3(-Math.cos(a) * .7, -Math.sin(a) * .7, 1)), 'tooth')); }
    return fit(pcs, 1.8); });
  add('jaw_mandibles', JT, 'Maws & Mandibles', 'Insect mandibles', ['insect', 'ant', 'bug', 'chitin', 'mandible', 'pincer'], () => {
    const mc = bez(V3(.35, 0, 0), V3(.62, -.02, .45), V3(.45, -.04, .9), V3(.05, -.05, 1.0)), side = [P(sweep(mc, t => [lerp(.16, .025, t), lerp(.08, .02, t)], {seg: 30, rad: 14, up: [0, 1, 0]}), 'chitin')];
    for (const t of [.5, .62, .73, .84]) { const p = mc.getPointAt(t), tg = mc.getTangentAt(t); side.push(P(orient(spike(.12, .035, 0), p, [-tg.z, 0, tg.x]), 'chitin')); }
    side.push(P(ell(.14, .1, .12, 14, 10).translate(.35, 0, 0), 'chitin'));
    return fit(sym(side), 1.5); });
  add('jaw_chelicerae', JT, 'Maws & Mandibles', 'Spider fangs (chelicerae)', ['spider', 'arachnid', 'fang', 'chitin', 'venom'], () => {
    const side = [P(sweep(cr([V3(.16, 0, 0), V3(.18, -.25, .15), V3(.15, -.6, .2)]), t => lerp(.16, .1, t), {seg: 16, rad: 14, noise: [.012, 10]}), 'chitin')];
    side.push(hornAt(bez(V3(0, 0, 0), V3(0, .2, 0), V3(-.1, .34, -.08), V3(-.15, .4, -.2)), .06, V3(.15, -.68, .22), [-.6, -1, .15], {pow: 1, tip: .02}, 'darkmetal'));
    return fit(sym(side), 1.2); });
  add('jaw_beak_raptor', JT, 'Beaks', 'Raptor beak', ['bird', 'raptor', 'beak', 'griffin'], () => fit([
    P(beak(bez(V3(0, .1, 0), V3(0, .2, .38), V3(0, .1, .55), V3(0, -.22, .55)), .17, .2, {p: 1.4}), 'horn'), P(beak(bez(V3(0, -.12, 0), V3(0, -.2, .22), V3(0, -.18, .36)), .14, .07, {ridge: 0}), 'horn'),
    P(sweep(cr([V3(-.2, .02, .05), V3(0, .24, .1), V3(.2, .02, .05)]), .06, {seg: 16, rad: 10, up: [0, 0, 1]}), 'skin')], 1.0));
  add('jaw_beak_parrot', JT, 'Beaks', 'Hooked parrot beak', ['bird', 'parrot', 'beak'], () => fit([
    P(beak(cr([V3(0, .2, 0), V3(0, .3, .3), V3(0, .15, .55), V3(0, -.2, .52), V3(0, -.4, .4)]), .2, .24, {p: 1.6, k: .9}), 'horn'), P(beak(bez(V3(0, -.12, .02), V3(0, -.25, .25), V3(0, -.12, .38)), .17, .12, {ridge: 0}), 'darkmetal')], 1.0));
  add('jaw_beak_turtle', JT, 'Beaks', 'Snapping beak', ['turtle', 'beak', 'reptile'], () => fit([
    P(beak(bez(V3(0, 0, 0), V3(0, .05, .33), V3(0, -.12, .45), V3(0, -.36, .4)), .24, .2, {p: 1.5}), 'horn'), P(beak(bez(V3(0, -.3, -.05), V3(0, -.35, .17), V3(0, -.28, .31)), .22, .09, {ridge: 0}), 'horn')], 1.0));

  // =====================================================================
  // JAWS & TEETH — single teeth & tusks (base at origin, tip along +Y)
  // =====================================================================
  add('tooth_fang', JT, 'Teeth & Tusks', 'Curved fang', ['tooth', 'fang', 'canine'], () => fit([P(tooth(1, .16, .35, {seg: 18, rad: 12}), 'tooth')], .5));
  add('tooth_saber', JT, 'Teeth & Tusks', 'Saber tooth', ['tooth', 'saber', 'sabertooth', 'blade'], () => fit([P(cone(bez(V3(0, 0, 0), V3(0, .6, .05), V3(0, 1.2, .35)), [.07, .17], {seg: 30, rad: 14, pow: 1.3, tip: .01,
    shape: (t, a) => 1 + .25 * Math.max(0, Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 4) * (1 - t)}), 'tooth')], .9));
  add('tooth_serrated', JT, 'Teeth & Tusks', 'Serrated dino tooth', ['tooth', 'dinosaur', 'tyrant', 'serrated'], () => fit([P(cone(bez(V3(0, 0, 0), V3(0, .5, .05), V3(0, 1, .25)), [.12, .22], {seg: 40, rad: 16, pow: 1.2, tip: .01,
    shape: (t, a) => 1 + .06 * Math.pow(Math.abs(Math.sin(a)), 20) * (Math.sin(t * 70) > 0 ? 1 : 0)}), 'tooth')], .6));
  add('tooth_tusk', JT, 'Teeth & Tusks', 'Great tusk', ['tusk', 'elephant', 'mammoth', 'ivory'], () => fit([P(cone(cr([V3(0, 0, 0), V3(0, .8, .15), V3(.15, 1.5, .7), V3(.35, 1.8, 1.4)]), .22, {seg: 40, rad: 18, pow: 1.6, tip: .12, noise: [.004, 6]}), 'tooth')], 2.0));
  add('tooth_boar_tusk', JT, 'Teeth & Tusks', 'Curled boar tusk', ['tusk', 'boar', 'pig', 'ivory'], () => fit([P(cone(fcurve(t => { const a = t * PI * 1.15, r = .5 * (1 - t * .2); return [t * .15, Math.sin(a) * r, (1 - Math.cos(a)) * r * -1 + .0]; }), [.1, .12], {seg: 30, rad: 14, pow: 1.1, tip: .05}), 'tooth')], .8));
  add('tooth_snake_pair', JT, 'Teeth & Tusks', 'Venom fang pair', ['snake', 'fang', 'venom', 'tooth'], () => fit([P(nz(ell(.42, .08, .14, 20, 10), .005, 8), 'flesh'),
    ...sym([P(orient(tooth(.75, .055, .5, {seg: 18, rad: 10}), V3(.25, 0, 0), [0, 1, 0]), 'tooth'), P(orient(tooth(.18, .03, .3), V3(.12, 0, .05), [0, 1, 0]), 'tooth')])], .7));
  add('tooth_walrus_pair', JT, 'Teeth & Tusks', 'Walrus tusk pair', ['tusk', 'walrus', 'ivory', 'tooth'], () => fit([P(nz(ell(.5, .1, .18, 20, 10), .01, 8), 'skin'),
    ...sym([P(orient(cone(bez(V3(0, 0, 0), V3(.02, .7, .05), V3(.06, 1.4, .25)), .09, {seg: 24, rad: 12, pow: 1.5, tip: .15}), V3(.2, 0, 0), [.08, 1, 0]), 'tooth')])], 1.4));

  // =====================================================================
  // JAWS & TEETH — tooth rows (U-shaped row on y=0, teeth point +Y, front toward +Z)
  // =====================================================================
  const uArc = (hw, L) => cr([V3(hw, 0, 0), V3(hw * .95, 0, L * .45), V3(hw * .65, 0, L * .85), V3(0, 0, L), V3(-hw * .65, 0, L * .85), V3(-hw * .95, 0, L * .45), V3(-hw, 0, 0)]);
  const rowAlong = (curve, n, fn, mat = 'tooth') => { const L = []; for (let i = 0; i < n; i++) { const t = (i + .5) / n, p = curve.getPointAt(t), g = fn(t, i); if (g) L.push(P(orient(g, p, [0, 1, 0], Math.atan2(curve.getTangentAt(t).x, curve.getTangentAt(t).z)), mat)); } return L; };
  const gumBar = (curve, r = .07) => P(sweep(curve, () => [r * 1.3, r], {seg: 50, rad: 10, up: [0, 1, 0], noise: [.006, 10]}), 'flesh');
  add('row_beast', JT, 'Tooth Rows', 'Beast tooth row', ['teeth', 'row', 'canine', 'beast'], () => { const c = uArc(.45, 1.1);
    return fit([gumBar(c), ...rowAlong(c, 14, t => { const u = Math.abs(t - .5); return u < .08 ? tooth(.12, .03, .1, {flat: .6}) : u < .14 ? tooth(.38, .06, .25) : tooth(.12, .055, 0, {flat: .5}); })], 1.4); });
  add('row_shark', JT, 'Tooth Rows', 'Shark tooth rows', ['teeth', 'row', 'shark', 'sea'], () => { const c = uArc(.5, 1.0), L = [gumBar(c, .09)];
    for (let r = 0; r < 3; r++) { const cc = uArc(.5 - r * .07, 1.0 - r * .1); L.push(...placeList(rowAlong(cc, 16, () => tooth(.2 - r * .04, .07 - r * .01, .05, {flat: .3})), g => g.applyMatrix4(M([0, 0, -r * .03], -r * .45, 0, 0)))); }
    return fit(L, 1.4); });
  add('row_needle', JT, 'Tooth Rows', 'Needle teeth row', ['teeth', 'row', 'needle', 'deep sea', 'horror'], () => { const c = uArc(.5, 1.0);
    return fit([gumBar(c, .06), ...rowAlong(c, 18, (t, i) => tooth(.25 + .25 * Math.abs(Math.sin(i * 2.1)), .025, .3 + .2 * Math.sin(i)))], 1.4); });
  add('row_molars', JT, 'Tooth Rows', 'Grinding molar row', ['teeth', 'row', 'molar', 'herbivore'], () => { const c = uArc(.45, 1.1);
    return fit([gumBar(c, .08), ...rowAlong(c, 12, t => { const g = lathe([[.001, 0], [.09, 0], [.1, .08], [.08, .12], [.05, .1], [.001, .13]], 14); g.scale(1, 1, 1.3); return nz(g, .006, 30); })], 1.4); });
  add('row_baleen', JT, 'Tooth Rows', 'Baleen comb', ['whale', 'baleen', 'filter', 'sea'], () => { const c = uArc(.5, 1.1);
    return fit([gumBar(c, .06), ...rowAlong(c, 34, t => { const h = .45 * (1 - Math.pow(Math.abs(t - .5) * 2, 2) * .6); const g = K.extr([[-.015, 0], [.015, 0], [.004, h], [-.004, h * .95]], .12, .006, 1); return g; }, 'horn')], 1.4); });

  // =====================================================================
  // HORNS & CRESTS (base at origin, grow +Y, sweep back toward -Z, outward toward +X; front faces +Z)
  // =====================================================================
  const hornPart = (curve, r, o = {}, size = 2, mat = 'horn') => fit([P(cone(curve, r, Object.assign({seg: 40, rad: 16, pow: .9}, o)), mat)], size);
  add('horn_bull', HC, 'Horns', 'Bull horn', ['horn', 'bull', 'bovine', 'minotaur'], () => hornPart(bez(V3(0, 0, 0), V3(.35, .3, 0), V3(.75, .75, .2), V3(.6, 1.2, .5)), .2, {ridges: [8, .03]}, 1.6));
  add('horn_dragon', HC, 'Horns', 'Swept dragon horn', ['horn', 'dragon', 'fantasy'], () => hornPart(cr([V3(0, 0, 0), V3(0, .6, -.15), V3(.15, 1.2, -.7), V3(.25, 1.5, -1.6), V3(.2, 1.75, -2.2)]), .24, {ridges: [7, .05]}, 2.4));
  add('horn_ram', HC, 'Horns', 'Ram spiral horn', ['horn', 'ram', 'goat', 'spiral'], () => hornPart(ramCurve(.6, 1.35, 1.4, .6), .26, {ridges: [16, .05], pow: .6, tip: .08, seg: 70}, 1.8));
  add('horn_ibex', HC, 'Horns', 'Ridged ibex horn', ['horn', 'ibex', 'goat'], () => hornPart(bez(V3(0, 0, 0), V3(0, .9, -.1), V3(.1, 1.6, -.8), V3(.2, 1.7, -1.6)), [.14, .2], {pow: 1.1, tip: .1,
    shape: (t, a) => 1 + .12 * Math.max(0, Math.sin(a)) * Math.pow(Math.max(0, Math.sin(t * 60)), 3) * (1 - t * .5)}, 2.2));
  add('horn_kudu', HC, 'Horns', 'Corkscrew horn', ['horn', 'kudu', 'antelope', 'spiral'], () => hornPart(fcurve(t => { const a = t * TAU * 2.2, r = .25 * Math.sin(PI * Math.min(t * 1.4, 1)) + .02; return [r * (Math.cos(a) - 1) * -1, t * 2.2, r * Math.sin(a)]; }), .14, {seg: 80, tip: .05, pow: 1.1}, 2.4));
  add('horn_unicorn', HC, 'Horns', 'Unicorn spiral horn', ['horn', 'unicorn', 'spiral', 'magic'], () => hornPart(bez(V3(0, 0, 0), V3(0, 1, 0), V3(0, 2, 0)), .16, {seg: 80, rad: 24, pow: 1, tip: .01,
    shape: (t, a) => 1 + .12 * Math.sin(a * 2 + t * 48)}, 1.8, 'crystal'));
  add('horn_rhino', HC, 'Horns', 'Rhino horn', ['horn', 'rhino', 'nose'], () => hornPart(bez(V3(0, 0, 0), V3(0, .5, 0), V3(0, .9, -.2), V3(0, 1.15, -.5)), [.26, .36], {pow: .9, noise: [.01, 8]}, 1.3));
  add('horn_demon', HC, 'Horns', 'Banded demon horn', ['horn', 'demon', 'devil', 'fantasy'], () => hornPart(cr([V3(0, 0, 0), V3(.1, .5, -.25), V3(.3, .9, -.35), V3(.4, 1.3, -.1), V3(.35, 1.55, .3)]), .22, {pow: .8,
    shape: (t, a) => 1 + .09 * Math.pow(Math.max(0, Math.sin(t * 45)), 4) * (1 - t)}, 1.8));
  add('antler_deer', HC, 'Antlers', 'Stag antler', ['antler', 'deer', 'stag', 'elk'], () => { const beam = cr([V3(0, 0, 0), V3(.15, .6, -.15), V3(.45, 1.3, -.35), V3(.6, 2.0, -.25), V3(.55, 2.5, .05)]);
    const L = [P(cone(beam, .13, {seg: 50, rad: 12, pow: .8, tip: .2, noise: [.008, 8]}), 'bone')];
    for (const [t, l, d] of [[.12, .7, [0, .5, 1]], [.38, .8, [.1, 1, .7]], [.6, .7, [.2, 1, .5]], [.8, .55, [-.1, 1, .4]], [.9, .5, [.4, 1, -.2]]]) L.push(P(orient(cone(bez(V3(0, 0, 0), V3(0, l * .5, 0), V3(0, l, -l * .2)), .07, {seg: 14, rad: 10, pow: .9}), beam.getPointAt(t), d), 'bone'));
    return fit(L, 2.6); });
  add('antler_moose', HC, 'Antlers', 'Palmate antler', ['antler', 'moose', 'elk', 'palmate'], () => { const L = [P(cone(bez(V3(0, 0, 0), V3(.4, .2, 0), V3(.75, .4, 0)), .13, {seg: 16, rad: 12, tip: .7}), 'bone')];
    const pts = [[0, -.2], [.5, -.35], [1.1, -.2], [1.5, .2], [1.3, .7], [.7, .85], [.1, .5]]; const pg = K.extr(spl(pts), .07, .03, 2); deform(pg, [v => { v.z -= v.x * v.x * .12; }]); nz(pg, .015, 5);
    L.push(P(pg.applyMatrix4(M([0, .3, 0])), 'bone'));
    for (let i = 0; i < 7; i++) { const a = (-20 + i * 22) * D; L.push(P(orient(cone(bez(V3(0, 0, 0), V3(0, .2, 0), V3(0, .35, .05)), .05, {seg: 10, rad: 8}), V3(.7 + Math.cos(a) * .85, .55 + Math.sin(a) * .65, -.05), [Math.cos(a), Math.sin(a) + .4, -.2]), 'bone')); }
    return fit(L, 2.4); });
  add('horn_crystal', HC, 'Horns', 'Crystal horn cluster', ['crystal', 'magic', 'gem', 'horn'], () => { const L = [P(nz(ell(.45, .18, .4, 20, 12), .04, 4), 'stone')];
    for (const [x, z, h, r, tx, tz] of [[0, 0, 1.4, .17, 0, 0], [.22, .1, .9, .12, .3, .1], [-.2, .12, .8, .11, -.3, .15], [.05, -.22, 1.0, .12, .05, -.35], [-.15, -.15, .6, .09, -.2, -.2]]) {
      const g = new T.CylinderGeometry(r, r, h, 6, 1).translate(0, h / 2, 0), tip = new T.ConeGeometry(r, r * 2, 6).translate(0, h + r, 0); L.push(P(K.merge([g, tip]).applyMatrix4(M([x, 0, z], tz, 0, -tx)), 'crystal')); }
    return fit(L, 1.6); });
  const frillPart = (spiky) => { const n = 9, pts = [[-.9, 0]]; for (let i = 0; i <= n; i++) { const a = PI - i / n * PI; pts.push([Math.cos(a) * 1.1, .2 + Math.sin(a) * 1.0]); if (i < n) { const b = PI - (i + .5) / n * PI; pts.push([Math.cos(b) * 1.0, .2 + Math.sin(b) * .9]); } } pts.push([.9, 0]);
    const g = K.extr(spl(pts), .08, .04, 2); deform(g, [v => { v.z -= v.x * v.x * .25 + v.y * .45; }]); weld(g); const L = [P(g, 'bone')];
    for (let i = 0; i <= n; i++) { const a = PI - i / n * PI, p = V3(Math.cos(a) * 1.1, .2 + Math.sin(a) * 1.0, 0); p.z -= p.x * p.x * .25 + p.y * .45;
      L.push(P(spiky ? orient(spike(.7 + .3 * Math.sin(a), .08, .2), p, [Math.cos(a), Math.sin(a), -.4]) : sphere(.09, 10, 8).translate(p.x, p.y, p.z), 'horn')); }
    return fit(L, 2.4); };
  add('crest_frill', HC, 'Crests & Frills', 'Ceratopsian frill', ['frill', 'triceratops', 'dinosaur', 'crest'], () => frillPart(false));
  add('crest_spike_frill', HC, 'Crests & Frills', 'Spiked frill', ['frill', 'spike', 'dinosaur', 'crest'], () => frillPart(true));
  add('crest_fin', HC, 'Crests & Frills', 'Head fin crest', ['fin', 'crest', 'membrane', 'wyvern', 'sea'], () => { const L = [P(sail([[.2, 0], [-.1, .7], [-.6, 1.1], [-1.1, .9], [-.9, .55], [-.8, .3], [-.5, 0]], .035), 'membrane')];
    for (const [z0, z1, y1] of [[.1, -.15, .75], [-.15, -.6, 1.12], [-.4, -1.08, .93], [-.55, -.82, .5]]) L.push(P(cone(bez(V3(0, 0, z0), V3(0, y1 * .5, (z0 + z1) / 2), V3(0, y1, z1)), .04, {seg: 12, rad: 6}), 'bone'));
    return fit(L, 1.8); });
  add('crest_feathers', HC, 'Crests & Frills', 'Feather crest', ['feather', 'crest', 'bird', 'cockatoo'], () => fit(range(0, 1, 7).map((t, i) => P(orient(feather(1.0 + .3 * Math.sin(t * PI), .16), V3(0, 0, .1 - t * .3), [0, 1, -.2 - t * 1.4]), 'feather')), 1.6));
  add('crest_tube', HC, 'Crests & Frills', 'Tube crest', ['crest', 'hadrosaur', 'dinosaur', 'tube'], () => fit([P(cone(cr([V3(0, 0, 0), V3(0, .5, -.3), V3(0, .8, -1.0), V3(0, .95, -1.8)]), [.16, .22], {seg: 40, rad: 16, pow: 1.5, tip: .55}), 'scale')], 2.0));
  add('crest_casque', HC, 'Crests & Frills', 'Casque helmet crest', ['crest', 'cassowary', 'bird', 'casque'], () => fit([P(nz(weld(K.extr(spl([[-.6, 0], [.5, 0], [.45, .5], [.1, 1.0], [-.3, .9], [-.55, .4]]), .14, .07, 3)).applyMatrix4(M([0, 0, 0], 0, -PI / 2, 0)), .01, 5), 'horn')], 1.2));
  add('crest_spike_crown', HC, 'Crests & Frills', 'Crown of spikes', ['crown', 'spike', 'king', 'horn'], () => { const L = [P(at(new T.TorusGeometry(.8, .1, 10, 40), 0, .05, 0, PI / 2, 0, 0), 'bone')];
    for (let i = 0; i < 11; i++) { const a = i / 11 * TAU, front = Math.cos(a); L.push(P(orient(spike(.45 + .35 * (front + 1) / 2, .08, .15), V3(Math.sin(a) * .8, .1, Math.cos(a) * .8), [Math.sin(a) * .3, 1, Math.cos(a) * .3]), 'horn')); }
    return fit(L, 1.8); });

  // ---------- masks & helmets (worn over a head; open at bottom/back, face toward +Z) ----------
  add('mask_bone', HC, 'Masks & Helms', 'Beast skull mask', ['mask', 'bone', 'skull', 'tribal', 'undead'], () => {
    const g = ell(.8, .7, .6, 36, 24); deform(g, [v => { if (v.z < 0) v.z *= .15; v.z += Math.max(0, .5 - Math.abs(v.x)) * Math.max(0, -v.y) * .6; }, ...dpair([.3, .15, .55], [.17, .14, .2], .2, [0, 0, -1]), dent([0, -.3, .75], [.08, .1, .12], .15, [0, 0, -1])]); weld(g);
    const L = [P(g, 'bone'), ...sym([voidBall([.3, .15, .42], .1), hornAt(hornCurve(1.0, .9, .4), .12, V3(.5, .45, .1), [.4, 1, -.3], {ridges: [8, .04]})]), voidBall([0, -.3, .62], .05)];
    L.push(...sym(teeth(range(.05, .28, 4).map(x => [V3(x, -.55, .6 - x * .4), [0, -1, .1], .14, .035, .1]))));
    return place(L, 1.9, .2, 0, g); });
  add('mask_tribal', HC, 'Masks & Helms', 'Carved tribal mask', ['mask', 'tribal', 'wood', 'shaman'], () => {
    const g = ell(.6, .9, .25, 32, 24); deform(g, [v => { if (v.z < 0) v.z *= .2; }, ...dpair([.22, .25, .2], [.17, .07, .2], .1, [0, 0, -1]), dent([0, -.45, .2], [.22, .08, .2], .1, [0, 0, -1]), ridge([[0, .5, .25], [0, -.2, .3]], .07, .08, [0, 0, 1])]); weld(g);
    const L = [P(g, 'wood'), P(sweep(cr([V3(-.45, .6, .1), V3(0, .82, .2), V3(.45, .6, .1)]), .03, {seg: 20, rad: 6}), 'paint'), P(sweep(cr([V3(-.3, -.15, .2), V3(0, -.25, .24), V3(.3, -.15, .2)]), .025, {seg: 20, rad: 6}), 'paint2')];
    for (let i = 0; i < 9; i++) { const a = (i / 8 * 160 + 10) * D; L.push(P(orient(feather(.6, .1), V3(Math.cos(a) * .55, .1 + Math.sin(a) * .85, -.05), [Math.cos(a), Math.sin(a), -.2]), 'feather')); }
    return place(L, 2.0, .2, 0, g); });
  add('helm_knight', HC, 'Masks & Helms', 'Monster knight helm', ['helmet', 'knight', 'armor', 'metal'], () => {
    const dome = lathe([[.62, 0], [.66, .3], [.65, .7], [.55, 1.05], [.3, 1.28], [.001, 1.33]], 40); deform(dome, [v => { v.z *= 1.15; }]);
    const L = [P(dome, 'darkmetal'), P(at(new T.TorusGeometry(.64, .04, 8, 40), 0, .02, 0, PI / 2, 0, 0).scale(1, 1, 1.15), 'metal'), P(sail([[-.8, .9], [-.2, 1.5], [.4, 1.35], [.3, 1.1], [-.5, .9]], .06), 'metal')];
    for (const y of [.55, .68]) L.push(P(at(new T.BoxGeometry(.7, .035, .1), 0, y, .7), 'rubber'));
    L.push(...sym([hornAt(hornCurve(1.0, .4, .6, .4), .12, V3(.6, .8, 0), [1, .6, 0], {ridges: [8, .04]})]));
    return place(L, 2.2, .5, 0, dome); });
  add('mask_plague', HC, 'Masks & Helms', 'Plague beak mask', ['mask', 'plague', 'beak', 'leather', 'horror'], () => {
    const hood = ell(.55, .62, .55, 32, 22), L = [P(hood, 'leather')];
    L.push(P(cone(bez(V3(0, -.05, .4), V3(0, -.12, 1.0), V3(0, -.45, 1.5)), [.24, .2], {seg: 30, rad: 18, pow: .9, tip: .04}), 'leather'));
    L.push(...sym([P(at(new T.TorusGeometry(.13, .035, 8, 24), .22, .12, .5, 0, .3, 0), 'metal'), P(ell(.12, .12, .05, 16, 10).applyMatrix4(M([.22, .12, .5], 0, .3, 0)), 'crystal')]));
    return place(L, 2.0, .4, 0, hood); });

  // =====================================================================
  // EYES & FACES (eyeballs centred on origin, gaze +Z; face pieces: back at origin, front +Z)
  // =====================================================================
  const eyePart = (o, size = .6) => fit(eye(.5, Object.assign({ws: 32}, o)), size);
  add('eye_beast', EF, 'Eyes', 'Beast eye', ['eye', 'beast', 'mammal'], () => eyePart({pupil: 'round', iris: 'paint', lid: 62, lidMat: 'skin'}));
  add('eye_reptile', EF, 'Eyes', 'Reptile slit eye', ['eye', 'reptile', 'dragon', 'slit'], () => eyePart({pupil: 'slit', iris: 'gold', ia: .9, lid: 58, low: 55, lidMat: 'scale'}));
  add('eye_goat', EF, 'Eyes', 'Goat bar eye', ['eye', 'goat', 'demon', 'octopus'], () => eyePart({pupil: 'goat', iris: 'gold', ia: .9, lid: 60, lidMat: 'skin'}));
  add('eye_glow', EF, 'Eyes', 'Glowing eye', ['eye', 'glow', 'magic', 'undead'], () => eyePart({sclera: 'glow', iris: 'glow', pupil: 'slit', shine: false, lid: 55, low: 50, lidMat: 'scale'}));
  add('eye_cute', EF, 'Eyes', 'Big cute eye', ['eye', 'cute', 'chibi', 'pal'], () => fit([...eye(.5, {ws: 32, ia: 1.05, pa: .5, iris: 'paint', pupil: 'round'}), P(sphere(.07, 10, 8).translate(-.18, -.2, .46), 'eye')], .7));
  add('eye_compound', EF, 'Eyes', 'Compound bug eye', ['eye', 'insect', 'compound', 'bug'], () => fit([P(compound(.5, 4).scale(1, 1.2, .9), 'crystal'), P(at(new T.TorusGeometry(.45, .06, 8, 32), 0, 0, -.25, 0, 0, 0).scale(1, 1.2, 1), 'chitin')], .8));
  add('eye_spider_cluster', EF, 'Eyes', 'Spider eye cluster', ['eye', 'spider', 'cluster', 'arachnid'], () => { const L = [P(nz(ell(.75, .45, .25, 24, 16), .01, 8), 'chitin')];
    for (const [x, y, r] of [[.17, .02, .17], [.45, .05, .11], [.2, .3, .09], [.5, .3, .08]]) L.push(...sym(placeList(eye(r, {sclera: 'darkmetal', iris: false}), g => g.translate(x, y, .2))));
    return fit(L, 1.0); });
  add('eye_stalk', EF, 'Eyes', 'Eyestalk', ['eye', 'stalk', 'crab', 'snail', 'alien'], () => fit([P(cone(bez(V3(0, 0, 0), V3(0, .6, 0), V3(0, 1.0, .15)), .09, {seg: 20, rad: 12, tip: .6}), 'flesh'),
    ...placeList(eye(.18, {pupil: 'round', iris: 'paint', lid: 60, lidMat: 'flesh'}), g => g.translate(0, 1.08, .2))], 1.2));
  add('eye_horror_cluster', EF, 'Eyes', 'Horror eye cluster', ['eye', 'horror', 'cluster', 'eldritch'], () => { const L = [P(nz(ell(.8, .6, .35, 28, 20), .05, 4), 'flesh')];
    for (const [x, y, r, gx, gy] of [[0, 0, .2, 0, 0], [.4, .2, .12, .3, .2], [-.38, .15, .14, -.2, .1], [.25, -.3, .1, .2, -.3], [-.3, -.28, .09, -.4, -.2], [.05, .38, .08, 0, .5], [.6, -.1, .07, .5, 0]])
      L.push(...placeList(eye(r, {ws: 16, pupil: 'slit', iris: 'paint2', lid: 60, low: 60, lidMat: 'flesh'}), g => aimZ(g, V3(x, y, .28), V3(gx, gy, 1))));
    return fit(L, 1.2); });
  add('eye_third', EF, 'Eyes', 'Third eye', ['eye', 'third eye', 'magic', 'forehead'], () => fit([...placeList(eye(.3, {sclera: 'glow', iris: 'paint', pupil: 'round', shine: false}), g => g.scale(1, 1.4, 1)),
    ...placeList([P(shell(.36, .06, 70 * D, 28), 'skin'), P(at(shell(.36, .06, 70 * D, 28), 0, 0, 0, PI, 0, 0), 'skin')], g => g.applyMatrix4(M([0, 0, 0], 0, 0, PI / 2)).scale(1, 1.4, 1))], .6));
  add('face_brow', EF, 'Face Pieces', 'Heavy brow ridge', ['brow', 'face', 'brute', 'ridge'], () => fit([P(sweep(cr([V3(-.6, -.05, -.15), V3(-.3, .05, .05), V3(0, 0, .1), V3(.3, .05, .05), V3(.6, -.05, -.15)]), t => [.15, .1 + .04 * Math.sin(t * PI)], {seg: 40, rad: 14, up: [0, 1, 0], noise: [.012, 8]}), 'skin')], 1.2));
  add('face_cheek_spikes', EF, 'Face Pieces', 'Cheek spike fan', ['spike', 'cheek', 'face', 'dragon'], () => fit(range(-25, 25, 4).map(a => P(orient(spike(.7 - Math.abs(a) / 100, .07, .5), V3(0, 0, 0), [Math.sin(a * D) * .3, 1, -.4 + Math.cos(a * D) * .0 + a / 60]), 'horn')), .9));
  add('face_whiskers', EF, 'Face Pieces', 'Whisker set', ['whisker', 'cat', 'face', 'fur'], () => fit([P(nz(ell(.18, .14, .1, 14, 10), .008, 10), 'fur'),
    ...range(-.08, .08, 4).map((y, i) => P(cone(bez(V3(0, y, .05), V3(.5, y + .05 * (i - 1.5), .1), V3(1.1, y - .1 + .08 * (i - 1.5), -.2)), .014, {seg: 16, rad: 5}), 'horn'))], 1.0));
  add('face_barbels', EF, 'Face Pieces', 'Catfish barbels', ['barbel', 'catfish', 'whisker', 'sea'], () => fit(sym([P(cone(cr([V3(.1, 0, 0), V3(.4, -.1, .2), V3(.6, -.5, .25), V3(.55, -1.0, .1), V3(.7, -1.3, .2)]), .05, {seg: 40, rad: 8, tip: .2}), 'flesh')]), 1.2));
  add('face_snarl', EF, 'Face Pieces', 'Snarling lips', ['mouth', 'lips', 'snarl', 'fang'], () => { const up = cr([V3(-.45, -.05, -.1), V3(-.2, .08, .12), V3(0, .04, .18), V3(.2, .08, .12), V3(.45, -.05, -.1)]), lo = cr([V3(-.42, -.12, -.1), V3(-.2, -.24, .1), V3(0, -.26, .14), V3(.2, -.24, .1), V3(.42, -.12, -.1)]);
    const L = [P(sweep(up, .06, {seg: 30, rad: 10, noise: [.008, 10]}), 'flesh'), P(sweep(lo, .055, {seg: 30, rad: 10, noise: [.008, 10]}), 'flesh'), P(ell(.38, .1, .1, 20, 10).translate(0, -.08, 0), 'darkmetal')];
    L.push(...sym(teeth([[V3(.17, .04, .1), [0, -1, .2], .26, .05, .2], [V3(.08, .04, .15), [0, -1, .2], .1, .03, 0, .6], [V3(.2, -.2, .08), [0, 1, .2], .18, .04, -.2]])));
    return fit(L, 1.0); });
  add('face_pig_snout', EF, 'Face Pieces', 'Pig snout', ['nose', 'snout', 'pig', 'boar', 'orc'], () => fit([P(nz(cone(bez(V3(0, 0, 0), V3(0, 0, .15), V3(0, -.02, .3)), .26, {seg: 10, rad: 24, tip: .9, pow: 1}), .01, 6), 'skin'),
    P(discNose(.25, .08).translate(0, -.02, .28), 'skin'), ...sym([P(ell(.05, .08, .03, 10, 8).translate(.1, -.02, .37), 'darkmetal')])], .7));
  add('face_snout_horns', EF, 'Face Pieces', 'Snout horn row', ['horn', 'nose', 'snout', 'dino'], () => fit([.0, .3, .55].map((z, i) => P(orient(cone(bez(V3(0, 0, 0), V3(0, .2, 0), V3(0, .35 - i * .08, -.08)), .1 - i * .02, {seg: 12, rad: 12}), V3(0, 0, -z), [0, 1, .3]), 'horn')), .8));
  add('ear_pointed', EF, 'Ears', 'Pointed ear', ['ear', 'elf', 'demon', 'goblin'], () => fit([P(earGeo(1.0, .28, {lean: -.5, cup: .5, out: .1}), 'skin')], 1.0));
  add('ear_round', EF, 'Ears', 'Round ear', ['ear', 'bear', 'mouse', 'cute'], () => fit([P(earGeo(.8, .4, {round: true, cup: .8}), 'fur')], .7));
  add('ear_bat', EF, 'Ears', 'Bat ear', ['ear', 'bat', 'vampire', 'membrane'], () => fit([P(earGeo(1.2, .45, {cup: .7, lean: -.2, out: .15}), 'membrane')], 1.2));
  add('ear_fin', EF, 'Ears', 'Fin ear', ['ear', 'fin', 'fish', 'sea', 'aquatic'], () => fit(fan(5, 1.0, 90, 160, {lf: t => 1 - .35 * t}), 1.0));

  //__PARTS__

  return parts;
});
