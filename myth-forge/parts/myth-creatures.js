// Mythic Forge parts: MYTH CREATURES (Nov 9 2026). Original designs made in code.
//  tf_ Treefolk (walking trees: trunk, bark faces, branch arms, root legs, moss, mushrooms, vines, leaves)
//  sp_ Spirits (Japanese / old-pagan folk horror: pale masks, stag skull, long hair ghost, gaunt limbs, robes, rope + paper, spirit flames)
//  kr_ Kraken   mo_ Giant moth + Mothman   cp_ Giant centipede   sd_ Sand spirit (sand wings)
// Same orientation rules as creature-body.js. Face pieces (beards, hoods) use the head frame: neck at origin, face toward +Z.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const V3 = K.V3, D = K.D, merge = K.merge;
  const PI = Math.PI, TAU = PI * 2, sin = Math.sin, cos = Math.cos, pow = Math.pow, abs = Math.abs, exp = Math.exp, max = Math.max, min = Math.min, sqrt = Math.sqrt;
  const clamp = (x, a, b) => max(a, min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const gauss = (t, c, w) => exp(-((t - c) / w) * ((t - c) / w));
  const v = a => (a && a.isVector3) ? a.clone() : V3(a[0], a[1], a[2]);
  let seed = 1;
  const rs = s => { seed = s; }, rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, rr = (a, b) => a + (b - a) * rnd();
  const grooves = (n, d, sh = 12) => t => 1 - d * pow(abs(cos(t * n * PI)), sh);

  function crv(p, closed) { if (p instanceof T.Curve) return p; const P = p.map(v); if (P.length === 2 && !closed) return new T.LineCurve3(P[0], P[1]); return new T.CatmullRomCurve3(P, !!closed, 'centripetal'); }
  function subC(c, a, b) { const s = new T.Curve(); s.getPoint = (t, o) => c.getPointAt(clamp(lerp(a, b, t), 0, 1), o || V3()); return s; }

  // average normals of vertices sharing a position (kills UV-seam shading lines)
  function smoothN(g) {
    const p = g.attributes.position, n = g.attributes.normal; if (!n) return g; const m = new Map();
    const k = i => Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4);
    for (let i = 0; i < p.count; i++) { const key = k(i); let a = m.get(key); if (!a) m.set(key, a = [0, 0, 0]); a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); }
    for (let i = 0; i < p.count; i++) { const a = m.get(k(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
    n.needsUpdate = true; return g;
  }
  const nz = (g, a, f) => smoothN(K.noise(smoothN(g), a, f));
  function deform(g, fn) { const p = g.attributes.position, q = V3(); for (let i = 0; i < p.count; i++) { q.fromBufferAttribute(p, i); fn(q); p.setXYZ(i, q.x, q.y, q.z); } p.needsUpdate = true; g.computeVertexNormals(); return smoothN(g); }
  const flat = g => { g = g.index ? g.toNonIndexed() : g; g.computeVertexNormals(); return g; };

  function frames(c, seg, ref, pt) {
    const F = [], r0 = v(ref || [0, 0, 1]); let prevU = null;
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, p = c.getPointAt(t), tg = c.getTangentAt(t).normalize();
      let U = (pt && prevU) ? prevU.clone() : r0.clone(); U.addScaledVector(tg, -U.dot(tg));
      if (U.lengthSq() < 1e-6) { U = prevU ? prevU.clone() : V3(1, 0, 0); U.addScaledVector(tg, -U.dot(tg)); if (U.lengthSq() < 1e-6) U = V3(0, 1, 0).addScaledVector(tg, -tg.y); }
      U.normalize(); prevU = U; F.push({p, T: tg, U, S: V3().crossVectors(U, tg).normalize(), t});
    }
    return F;
  }
  function frameFn(c, ref, pt) { const N = 240, F = frames(c, N, ref, pt); return t => F[Math.round(clamp(t, 0, 1) * N)]; }

  // tube along a curve. rf(t) radius; o: seg, rad, ref, pt, sx, sy (num|fn t), prof(a,t), cap
  function sweep(path, rf, o = {}) {
    const c = crv(path), seg = o.seg || 32, rad = o.rad || 12, F = frames(c, seg, o.ref, o.pt);
    const R = typeof rf === 'function' ? rf : Array.isArray(rf) ? (t => lerp(rf[0], rf[1], t)) : (() => rf);
    const sx = o.sx == null ? 1 : o.sx, sy = o.sy == null ? 1 : o.sy, prof = o.prof, pos = [], uv = [], idx = [], W = rad + 1;
    for (let i = 0; i <= seg; i++) {
      const f = F[i], t = i / seg, r = max(R(t), .003), ax = typeof sx === 'function' ? sx(t) : sx, ay = typeof sy === 'function' ? sy(t) : sy;
      for (let j = 0; j <= rad; j++) { const a = j / rad * TAU, m = prof ? prof(a, t) : 1, ca = cos(a) * r * ax * m, sa = sin(a) * r * ay * m;
        pos.push(f.p.x + f.S.x * ca + f.U.x * sa, f.p.y + f.S.y * ca + f.U.y * sa, f.p.z + f.S.z * ca + f.U.z * sa); uv.push(j / rad, t); }
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * W + j, b = a + 1, cc = a + W, d = cc + 1; idx.push(a, b, cc, b, d, cc); }
    if (o.cap !== false) for (const [i, fl] of [[0, true], [seg, false]]) { const p = F[i].p, ci = pos.length / 3; pos.push(p.x, p.y, p.z); uv.push(.5, i / seg);
      for (let j = 0; j < rad; j++) { const a = i * W + j, b = a + 1; if (fl) idx.push(b, a, ci); else idx.push(a, b, ci); } }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    return smoothN(g);
  }

  // closed thin slab from a parametric surface f(u,v)->V3. th number or fn(u,v). o.skip(u,v) -> holes
  function sheet(f, nu, nv, th = .03, o = {}) {
    const P = [], N = [], id = (i, j) => i * (nv + 1) + j;
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) P.push(f(i / nu, j / nv));
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) {
      const du = P[id(min(i + 1, nu), j)].clone().sub(P[id(max(i - 1, 0), j)]), dv = P[id(i, min(j + 1, nv))].clone().sub(P[id(i, max(j - 1, 0))]);
      const n = V3().crossVectors(du, dv); N.push(n.lengthSq() < 1e-14 ? null : n.normalize());
    }
    for (let pass = 0; pass < 4; pass++) for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) if (!N[id(i, j)]) {
      const nb = [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].find(([a, b]) => a >= 0 && a <= nu && b >= 0 && b <= nv && N[id(a, b)]);
      if (nb) N[id(i, j)] = N[id(nb[0], nb[1])].clone(); else if (pass === 3) N[id(i, j)] = v(o.nrm || [0, 0, 1]);
    }
    const H = typeof th === 'function' ? th : () => th, pos = [], uv = [], idx = [], B = (nu + 1) * (nv + 1);
    for (const s of [1, -1]) for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const p = P[id(i, j)], n = N[id(i, j)], h = H(i / nu, j / nv) / 2 * s; pos.push(p.x + n.x * h, p.y + n.y * h, p.z + n.z * h); uv.push(i / nu, j / nv); }
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { if (o.skip && o.skip((i + .5) / nu, (j + .5) / nv)) continue; const a = id(i, j), b = id(i + 1, j), c = id(i, j + 1), d = id(i + 1, j + 1); idx.push(a, b, c, b, d, c, B + a, B + c, B + b, B + b, B + c, B + d); }
    const wall = (A, Bk) => { const k = pos.length / 3; for (const q of [A, Bk, B + A, B + Bk]) { pos.push(pos[q * 3], pos[q * 3 + 1], pos[q * 3 + 2]); uv.push(uv[q * 2], uv[q * 2 + 1]); } idx.push(k + 2, k + 3, k, k + 3, k + 1, k); };
    for (let i = 0; i < nu; i++) { wall(id(i, 0), id(i + 1, 0)); wall(id(i + 1, nv), id(i, nv)); }
    for (let j = 0; j < nv; j++) { wall(id(nu, j), id(nu, j + 1)); wall(id(0, j + 1), id(0, j)); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }

  // basis: local +Y -> d, local +Z -> up (orthogonalised)
  function pm(p, d, up = [0, 0, 1], s = 1) {
    const Y = v(d).normalize(), u = v(up); let Z = u.addScaledVector(Y, -u.dot(Y));
    if (Z.lengthSq() < 1e-8) { Z = abs(Y.x) < .9 ? V3(1, 0, 0) : V3(0, 0, 1); Z.addScaledVector(Y, -Z.dot(Y)); }
    Z.normalize(); const X = V3().crossVectors(Y, Z), m = new T.Matrix4().makeBasis(X, Y, Z);
    if (s !== 1) m.scale(typeof s === 'number' ? V3(s, s, s) : v(s)); m.setPosition(v(p)); return m;
  }
  function place(gs, p, d, up, s) { const m = pm(p, d, up, s); (Array.isArray(gs) ? gs : [gs]).forEach(g => g.applyMatrix4(m)); return gs; }
  // basis: local +Z -> n exactly, local +Y -> yHint projected
  function placeN(gs, p, n, yHint = [0, 1, 0]) {
    const Z = v(n).normalize(), h = v(yHint); let Y = h.addScaledVector(Z, -h.dot(Z)); if (Y.lengthSq() < 1e-8) Y = abs(Z.x) < .9 ? V3(1, 0, 0) : V3(0, 1, 0), Y.addScaledVector(Z, -Y.dot(Z));
    Y.normalize(); const X = V3().crossVectors(Y, Z), m = new T.Matrix4().makeBasis(X, Y, Z); m.setPosition(v(p)); (Array.isArray(gs) ? gs : [gs]).forEach(g => g.applyMatrix4(m)); return gs;
  }
  const xf = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) => K.at(g, x, y, z, rx, ry, rz, s);

  const ell = (rx, ry, rz, x = 0, y = 0, z = 0, w = 18, h = 12) => { const g = new T.SphereGeometry(1, w, h); g.scale(rx, ry, rz); g.translate(x, y, z); return g; };
  const dens = (pts, n = 40) => new T.SplineCurve(pts.map(([x, y]) => new T.Vector2(x, y))).getSpacedPoints(n).map(p => [max(p.x, .0008), p.y]);
  const lth = (pts, seg = 28, sx = 1, sz = 1) => { const g = new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(max(x, .0008), y)), seg); if (sx !== 1 || sz !== 1) g.scale(sx, 1, sz); return smoothN(g); };
  function lr(pts, y) { for (let i = 1; i < pts.length; i++) if (y <= pts[i][1]) { const [r0, y0] = pts[i - 1], [r1, y1] = pts[i]; return lerp(r0, r1, (y - y0) / ((y1 - y0) || 1)); } return pts[pts.length - 1][0]; }
  function lsurf(pts, y, phi, sx = 1, sz = 1) { const r = lr(pts, y), dr = (lr(pts, y + .03) - lr(pts, y - .03)) / .06, s = sin(phi), c = cos(phi); return {p: V3(r * s * sx, y, r * c * sz), n: V3(s / sx, -dr, c / sz).normalize(), r}; }
  // ellipsoid bulge sitting on a lathe surface
  function onL(d, sx, sz, y, phi, rx, ry, rz, sink = .5, amt = .015) { const s = lsurf(d, y, phi, sx, sz), g = ell(rx, ry, rz, 0, 0, 0, 18, 12); placeN(g, s.p.clone().addScaledVector(s.n, -rz * sink), s.n, [0, 1, 0]); return amt ? nz(g, amt, 4) : g; }
  const cone = (h, r, rad = 10) => { const g = new T.ConeGeometry(r, h, rad, 1); g.translate(0, h / 2, 0); return g; };

  function claw(L, r, curl = 1, fl = .55) { return sweep([[0, 0, 0], [0, L * .4, L * .07 * curl], [0, L * .75, L * .24 * curl], [0, L, L * .52 * curl]], t => r * pow(max(1 - t, 0), .8), {seg: 14, rad: 10, ref: [1, 0, 0], sy: fl}); }
  function horn(L, r, curve = .25, o = {}) { return sweep([[0, 0, 0], [0, L * .5, L * .12 * curve], [0, L, L * .45 * curve]], t => r * pow(max(1 - t, 0), o.p || 1), {seg: o.seg || 12, rad: o.rad || 10, ref: [1, 0, 0], sy: o.flat || 1}); }
  const fracs = pts => { const P = pts.map(v), L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + P[i].distanceTo(P[i - 1])); return L.map(x => x / L[L.length - 1]); };
  const keyed = (ts, rsx) => t => { for (let i = 1; i < ts.length; i++) if (t <= ts[i] + 1e-9) return lerp(rsx[i - 1], rsx[i], sstep(ts[i - 1], ts[i], t)); return rsx[rsx.length - 1]; };
  const limb = (pts, radii, o = {}) => sweep(pts, o.mul ? (t => keyed(fracs(pts), radii)(t) * o.mul(t)) : keyed(fracs(pts), radii), o);

  function out(list) { const by = new Map(); for (const [g, m] of list) { const arr = (Array.isArray(g) ? g.flat(3) : [g]).filter(Boolean); if (!arr.length) continue; if (!by.has(m)) by.set(m, []); by.get(m).push(...arr); }
    return [...by].map(([mat, gs]) => ({geo: gs.length === 1 ? gs[0] : merge(gs), mat})); }

  // ---------- myth helpers ----------
  const BARK = 'bark2', DW = 'darkwood', at = K.at;
  // bark ridges around a vertical-ish lathe: radial grooves that twist with height
  const barkify = (g, n = 7, d = .07, tw = .5) => deform(g, q => { const a = Math.atan2(q.x, q.z), r = 1 - d * pow(abs(cos(a * n * .5 + q.y * tw)), 3); q.x *= r; q.z *= r; });
  const wood = (g, n, d, a = .05, f = 1.4) => nz(barkify(g, n, d), a, f);
  // tapering branch with bark noise
  const twig = (pts, r0, r1, seg = 18, rad = 8) => nz(sweep(pts, t => lerp(r0, r1, pow(t, .8)), {seg, rad}), r0 * .12, 3);
  // recursive branching (antlers, crowns, roots). returns list of geos; tips collects end points
  function branchy(p, d, len, r, depth, o = {}, list = [], tips = []) {
    p = v(p); d = v(d).normalize(); const bend = v(o.bend || [0, .25, 0]);
    const mid = p.clone().addScaledVector(d, len * .5).addScaledVector(V3(rr(-.15, .15), rr(-.1, .1), rr(-.15, .15)), len);
    const end = p.clone().addScaledVector(d.clone().add(bend).normalize(), len);
    list.push(twig([p, mid, end], r, r * (depth ? .62 : .2), 14, depth > 1 ? 9 : 7));
    if (!depth) { tips.push({p: end, d: end.clone().sub(mid).normalize()}); return {list, tips}; }
    const kids = o.kids || 2;
    for (let k = 0; k < kids; k++) { const sp = (o.spread || 35) * D, a = rr(-1, 1), side = V3(cos(a * 3 + k * 2.4), rr(-.2, .3), sin(a * 3 + k * 2.4)).normalize();
      const nd = d.clone().applyAxisAngle(V3().crossVectors(d, side).normalize(), (k % 2 ? 1 : -1) * sp * rr(.6, 1.1));
      branchy(end, nd, len * rr(.55, .75), r * .62, depth - 1, o, list, tips); }
    return {list, tips};
  }
  // a single leaf: base at origin, along +Y, face +Z
  function leaf(L = 1, W = .35, curl = .15) { return sheet((u, w) => { const s = pow(sin(PI * min(1, u * 1.05)), .75), x = (w - .5) * 2 * W * s; return V3(x, u * L, curl * L * (x / W) * (x / W) - .1 * L * u * u); }, 10, 6, .012); }
  function leafCluster(n, c, R, L = .6, seedv = 1) { rs(seedv); const out = []; for (let i = 0; i < n; i++) { const d = V3(rr(-1, 1), rr(-.3, 1), rr(-1, 1)).normalize(), p = v(c).addScaledVector(d, R * rr(.3, 1));
    out.push(place(leaf(L * rr(.7, 1.2), L * .32), p, d, [rr(-1, 1), rr(-1, 1), rr(-1, 1)])); } return out; }
  // lumpy foliage ball
  const bush = (r, x, y, z, a = .25) => nz(ell(r, r * .85, r, x, y, z, 22, 16), r * a, 1.6 / r);
  const P = [];
  const add = (id, group, sub, name, tags, make, extra) => P.push(Object.assign({id, group, sub, name, tags, make}, extra || {}));
  const HS = 'Heads & Skulls', EF = 'Eyes & Faces', HC = 'Horns & Crests', TB = 'Torsos & Bellies', AS = 'Arms & Shoulders', HN = 'Hands & Claws', LF = 'Legs & Feet',
    TL = 'Tails', WG = 'Wings', BA = 'Back & Armor Plates', TE = 'Tentacles & Extra Limbs', JT = 'Jaws & Teeth', AM = 'Accessories & Magic';

  // ======================================================================= TREEFOLK
  function trunk(o = {}) {
    const H = o.h || 4.4, pts = dens([[1.75, 0], [1.35, .5], [1.2, 1.2], [1.25, 2.2], [1.45, 3.2], [1.55, 3.8], [1.2, H - .2], [.6, H], [.05, H + .05]], 46);
    const g = wood(lth(pts, 44, 1, .85), 8, .08, .06, 1.1);
    if (o.hunch) deform(g, q => { const t = q.y / H; q.z += .9 * t * t; q.y -= .25 * t * t; });
    const L = [[g, BARK]]; rs(o.seed || 3);
    for (let i = 0; i < 7; i++) { const a = rr(0, TAU), y = rr(.6, 3.6), s = lsurf(pts, y, a, 1, .85); L.push([nz(ell(rr(.18, .3), rr(.22, .34), .16, 0, 0, 0, 14, 10), .03, 5), BARK]); placeN(L[L.length - 1][0], s.p, s.n); }
    for (let i = 0; i < 3; i++) { const a = rr(1.4, 4.9), y = rr(2.4, 3.8), s = lsurf(pts, y, a, 1, .85), d = s.n.clone().add(V3(0, .5, 0)).normalize();
      L.push([twig([s.p.clone().addScaledVector(s.n, -.1), s.p.clone().addScaledVector(d, .5), s.p.clone().addScaledVector(d, .9).add(V3(0, .25, 0))], .2, .1, 8, 8), BARK]); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3, c = cos(a), sn = sin(a);
      L.push([twig([[sn * 1.2, .9, c * 1.0], [sn * 1.9, .3, c * 1.6], [sn * 2.3, -.05, c * 2.0]], .3, .06, 12, 8), BARK]); }
    const kn = lsurf(pts, 1.9, .5, 1, .85); L.push([ell(.16, .22, .1, 0, 0, 0, 12, 8), DW]); placeN(L[L.length - 1][0], kn.p, kn.n);
    return out(L);
  }
  add('tf_trunk', TB, 'Treefolk', 'Living trunk', ['treefolk', 'tree', 'bark', 'ent', 'wood'], () => trunk());
  add('tf_trunk_hunch', TB, 'Treefolk', 'Old hunched trunk', ['treefolk', 'tree', 'bark', 'old', 'hunched'], () => trunk({hunch: 1, seed: 9}));

  function faceBase(L, o = {}) {   // log head: neck at 0, face +Z
    const g = wood(ell(.95, 1.25, .88, 0, 1.15, 0, 34, 24), 9, .07, .05, 1.6); L.push([g, BARK]);
    L.push([nz(sweep([[-.7, 1.5, .55], [-.3, 1.42, .86], [0, 1.32, .92], [.3, 1.42, .86], [.7, 1.5, .55]], t => .17 * (1 - .3 * gauss(t, .5, .2)), {seg: 24, rad: 10}), .02, 6), BARK]);
    for (const s of [-1, 1]) { L.push([ell(.17, .13, .1, s * .3, 1.2, .8, 14, 10), DW]); L.push([ell(.055, .05, .04, s * .3, 1.2, .87, 10, 8), o.eye || 'glowgreen']); }
  }
  add('tf_face_elder', HS, 'Treefolk Faces', 'Elder bark face', ['treefolk', 'face', 'old', 'wise', 'ent'], () => {
    const L = []; faceBase(L);
    L.push([nz(sweep([[0, 1.3, .88], [0, 1.05, 1.08], [0, .85, 1.12]], t => lerp(.15, .07, t), {seg: 14, rad: 10}), .015, 6), BARK]);       // knot nose
    L.push([ell(.3, .07, .08, 0, .6, .8, 16, 8), DW]);                                                                                 // mouth crack
    for (const s of [-1, 1]) L.push([nz(ell(.2, .17, .14, s * .45, .9, .72, 12, 10), .02, 5), BARK]);                                     // cheek burls
    L.push(...leafCluster(14, [0, 2.3, -.1], .5, .45, 4).map(g => [g, 'leaf']));
    return out(L);
  });
  add('tf_face_skull', HS, 'Treefolk Faces', 'Skull in the branches', ['treefolk', 'skull', 'bone', 'branches', 'creepy'], () => {
    const L = [], b = 'bone';
    L.push([nz(ell(.62, .56, .66, 0, 1.25, -.05, 28, 20), .02, 3), b]); L.push([nz(ell(.44, .42, .38, 0, .98, .38, 24, 16), .02, 3), b]);
    for (const s of [-1, 1]) { L.push([ell(.15, .13, .08, s * .22, 1.1, .64, 14, 10), DW]); L.push([ell(.05, .05, .03, s * .22, 1.1, .7, 10, 8), 'glowgreen']); }
    L.push([ell(.07, .11, .05, 0, .86, .73, 10, 8), DW]);
    for (let i = 0; i < 6; i++) { const x = (i - 2.5) * .08; L.push([place(cone(.12, .035, 6), V3(x, .66, .64 - abs(x) * .4), V3(0, -1, .1)), 'tooth']); }
    rs(11);
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6, ang = a + t * 2.4, r = .75 + .15 * sin(t * 7 + k); pts.push([sin(ang) * r, .1 + t * 2.0, cos(ang) * r * .9 - .1]); }
      L.push([twig(pts, .1, .03, 30, 7), BARK]); }
    const br = branchy([0, 1.8, -.2], [0, 1, -.2], .7, .07, 2, {spread: 40}); L.push(...br.list.map(g => [g, BARK]));
    return out(L);
  });
  add('tf_face_hollow', HS, 'Treefolk Faces', 'Hollow knot face', ['treefolk', 'stump', 'hollow', 'glowing eyes'], () => {
    const L = [], pts = dens([[.85, 0], [.8, .8], [.86, 1.6], [.7, 2.0], [.05, 2.05]], 30);
    const g = wood(lth(pts, 40, 1, .9), 9, .08, .05, 1.8); deform(g, q => { if (q.y > 1.7) q.y += .25 * K.vnoise(q.x * 4, 0, q.z * 4); }); L.push([g, BARK]);
    for (const s of [-1, 1]) { L.push([ell(.2, .17, .1, s * .3, 1.25, .76, 14, 10), DW]); L.push([ell(.04, .06, .03, s * .3, 1.22, .83, 10, 8), 'glow']); }
    L.push([ell(.28, .34, .12, 0, .62, .76, 16, 12), DW]);
    L.push(...leafCluster(10, [0, 2.1, 0], .45, .5, 7).map(g2 => [g2, 'leaf']));
    return out(L);
  });

  add('tf_arm_branch', AS, 'Treefolk', 'Branch arm', ['treefolk', 'branch', 'arm', 'wood'], () => {
    const L = [], pts = [[0, 0, 0], [.12, 1.5, .1], [-.08, 2.9, .4], [0, 4.6, .25]];
    L.push([wood(limb(pts, [.58, .46, .4, .3], {seg: 40, rad: 14}), 6, .1, .05, 1.6), BARK]);
    L.push([nz(ell(.42, .4, .4, -.05, 2.9, .38, 14, 10), .06, 3), BARK]);
    rs(5); for (const [y, a] of [[1.2, .6], [2.2, -2.3], [3.4, 2.2]]) { const p = V3(sin(a) * .35, y, cos(a) * .35), d = V3(sin(a), .9, cos(a)).normalize();
      L.push([twig([p, p.clone().addScaledVector(d, .6), p.clone().addScaledVector(d, 1.1).add(V3(0, .2, 0))], .1, .025, 10, 6), BARK]);
      L.push(...leafCluster(4, p.clone().addScaledVector(d, 1.1), .15, .35, y * 10).map(g => [g, 'leaf'])); }
    return out(L);
  });
  add('tf_hand_twig', HN, 'Treefolk', 'Twig claw hand', ['treefolk', 'twig', 'fingers', 'claw'], () => {
    const L = [[nz(ell(.42, .38, .3, 0, .3, 0, 16, 12), .05, 3), BARK]];
    for (const [x, sp, len] of [[-.24, -18, 1.25], [-.08, -6, 1.45], [.08, 6, 1.4], [.24, 18, 1.15]]) { const a = sp * D;
      L.push([twig([[x, .45, 0], [x + sin(a) * len * .4, .45 + len * .45, .12], [x + sin(a) * len * .75, .45 + len * .8, .35], [x + sin(a) * len * .85, .45 + len, .62]], .09, .015, 16, 7), BARK]); }
    L.push([twig([[.3, .3, .1], [.6, .6, .35], [.7, .9, .65]], .09, .015, 12, 7), BARK]);
    return out(L);
  });
  add('tf_hand_leafblade', HN, 'Treefolk', 'Leaf-blade hand', ['treefolk', 'leaf', 'blade', 'druid'], () => {
    const L = [[nz(ell(.38, .36, .3, 0, .25, 0, 16, 12), .05, 3), BARK]];
    for (const [a, l] of [[-28, 1.6], [-9, 2.1], [9, 2.0], [28, 1.5]]) L.push([place(leaf(l, .3, .25), V3(sin(a * D) * .2, .4, 0), V3(sin(a * D), cos(a * D), .15), [0, 0, 1]), 'leaf']);
    return out(L);
  });
  add('tf_leg_root', LF, 'Treefolk', 'Root leg', ['treefolk', 'root', 'leg', 'wood'], () => {
    const L = [], pts = [[0, 0, 0], [.05, 1.6, .25], [0, 3.0, -.1], [0, 4.4, .05]];
    L.push([wood(limb(pts, [.72, .6, .52, .55], {seg: 40, rad: 14}), 7, .1, .06, 1.4), BARK]);
    for (let k = 0; k < 3; k++) { const p = []; for (let i = 0; i <= 8; i++) { const t = i / 8, a = k * 2.1 + t * 4; p.push([sin(a) * .62, t * 4.3, cos(a) * .58]); } L.push([twig(p, .12, .1, 36, 7), BARK]); }
    for (let i = 0; i < 6; i++) { const a = (i / 6 - .5) * 2.6, c = cos(a), sn = sin(a);
      L.push([twig([[sn * .3, 4.2, c * .3], [sn * .9, 4.5, c * 1.0], [sn * 1.5, 4.55, c * 1.6]], .22, .05, 12, 7), BARK]); }
    return out(L);
  });
  add('tf_foot_roots', LF, 'Treefolk', 'Root foot', ['treefolk', 'root', 'foot'], () => {
    const L = [[wood(lth(dens([[.7, 0], [.62, .5], [.5, .95], [.05, 1.0]], 16), 24), 6, .1, .05, 2), BARK]];
    for (let i = 0; i < 7; i++) { const a = (i / 7 - .5) * 3.6, c = cos(a), sn = sin(a), l = i === 3 ? 1.9 : rr(1.1, 1.6);
      L.push([twig([[sn * .3, .5, c * .3], [sn * .8, .2, c * .8], [sn * l, .05, c * l]], .2, .04, 12, 7), BARK]); }
    return out(L);
  });
  add('tf_moss_beard', EF, 'Treefolk', 'Moss beard', ['treefolk', 'moss', 'beard', 'old'], () => {
    const L = []; rs(21);
    L.push([nz(ell(.62, .22, .25, 0, .55, .78, 18, 10), .05, 4), 'moss']);
    for (let i = 0; i < 22; i++) { const x = rr(-.55, .55), len = rr(.9, 2.0) * (1 - abs(x) * .6), z = .82 - x * x * .6;
      L.push([nz(sweep([[x, .55, z], [x * 1.05, .2, z + .05], [x * .9 + rr(-.1, .1), .55 - len * .7, z], [x * .85, .55 - len, z - .1]], t => lerp(.1, .02, t), {seg: 14, rad: 6}), .02, 6), 'moss']); }
    return out(L);
  });
  add('tf_shelf_fungus', AM, 'Treefolk', 'Shelf mushrooms', ['treefolk', 'mushroom', 'fungus', 'bracket'], () => {
    const L = [];
    for (const [z, r, x] of [[-.35, .55, 0], [0, .42, .25], [.3, .34, -.15], [.55, .24, .1]]) {
      const g = lth(dens([[0, -.06], [r * .98, -.05], [r, 0], [r * .9, .06], [0, .1]], 16), 30); g.scale(1, 1, 1); const half = deform(g, q => { q.z = abs(q.z) * .9; });
      L.push([nz(at(half, x, 0, z, -PI / 2, 0, 0), .01, 6), 'mushcap']);
    }
    return out(L);
  }, {surface: true});
  add('tf_toadstools', AM, 'Treefolk', 'Toadstool cluster', ['treefolk', 'mushroom', 'toadstool', 'cute'], () => {
    const L = []; rs(31);
    for (let i = 0; i < 5; i++) { const x = rr(-.35, .35), z = rr(-.35, .35), h = rr(.25, .6), r = rr(.12, .25);
      L.push([sweep([[x, 0, z], [x + rr(-.05, .05), h * .5, z], [x, h, z]], t => r * lerp(.38, .3, t), {seg: 6, rad: 10}), 'mushstalk']);
      L.push([lth(dens([[0, h - .02], [r, h], [r * .95, h + r * .25], [r * .5, h + r * .55], [0, h + r * .62]], 14), 24).translate(0, 0, 0).translate(x, 0, z), 'mushcap']); }
    return out(L);
  }, {surface: true});
  add('tf_vines', AM, 'Treefolk', 'Hanging vines', ['treefolk', 'vines', 'ivy', 'leaves'], () => {
    const L = []; rs(41);
    for (let k = 0; k < 6; k++) { const x0 = (k - 2.5) * .35, len = rr(1.6, 3.2), pts = [];
      for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([x0 + sin(t * 5 + k) * .12, .05 + sin(t * PI) * .08, t * len]); }
      L.push([sweep(pts, .03, {seg: 30, rad: 6}), 'leaf']);
      for (let i = 1; i < 8; i++) { const t = i / 8, p = V3(x0 + sin(t * 5 + k) * .12, .08, t * len); L.push([place(leaf(.28, .14, .2), p, V3(i % 2 ? 1 : -1, .6, .3), [0, 1, 0]), 'leaf']); } }
    return out(L);
  }, {surface: true});
  add('tf_moss_patch', AM, 'Treefolk', 'Moss clump', ['treefolk', 'moss', 'patch'], () => [{geo: nz(ell(.7, .22, .55, 0, .05, 0, 26, 12), .08, 3), mat: 'moss'}], {surface: true});
  add('tf_leaf_crown', HC, 'Treefolk', 'Leafy crown', ['treefolk', 'leaves', 'canopy', 'crown', 'tree'], () => {
    const L = [], br = branchy([0, 0, 0], [0, 1, 0], 1.1, .22, 2, {spread: 38, kids: 3}); L.push(...br.list.map(g => [g, BARK]));
    br.tips.forEach((t, i) => L.push([bush(rr(.5, .75), t.p.x, t.p.y + .2, t.p.z, .3), 'leaf']));
    L.push([bush(1.0, 0, 2.1, 0, .25), 'leaf']);
    return out(L);
  });
  add('tf_branch_antlers', HC, 'Treefolk', 'Branch antlers', ['treefolk', 'antlers', 'branches', 'spirit', 'leshen'], () => {
    rs(51); const L = [];
    for (const s of [-1, 1]) { const br = branchy([s * .35, 1.5, -.1], [s * .7, 1, -.25], .8, .09, 3, {spread: 30, kids: 2, bend: [s * .15, .3, 0]}); L.push(...br.list.map(g => [g, BARK])); }
    return out(L);
  });
  add('tf_bark_pauldron', BA, 'Treefolk', 'Bark shoulder plate', ['treefolk', 'bark', 'armor', 'shoulder', 'moss'], () => {
    const g = wood(new T.SphereGeometry(1, 30, 16, 0, TAU, 0, PI / 2.3).scale(1.1, .7, .9), 7, .12, .06, 1.6);
    return out([[g, BARK], [nz(ell(.75, .18, .6, 0, .62, 0, 20, 10), .06, 3), 'moss'], [nz(ell(.18, .15, .18, .5, .45, .3, 10, 8), .02, 5), BARK]]);
  });
  add('tf_leaf_blades', BA, 'Treefolk', 'Leaf blade fan', ['treefolk', 'leaf', 'blades', 'druid', 'back'], () => {
    const L = []; for (let i = 0; i < 5; i++) { const a = (i - 2) * 22 * D; L.push([place(leaf(2.4 - abs(i - 2) * .35, .36, .25), V3(sin(a) * .2, 0, 0), V3(sin(a), cos(a), -.25), [0, 0, 1]), 'leaf']); }
    L.push([nz(ell(.3, .2, .25, 0, 0, 0, 12, 8), .04, 4), BARK]);
    return out(L);
  });

  // ======================================================================= SPIRITS (Japanese + old-pagan folk horror, original designs)
  const GH = 'ghost', CL = 'shadowcloth';
  add('sp_mask_pale', HS, 'Spirit', 'Pale spirit mask', ['spirit', 'mask', 'yokai', 'ghost', 'noh'], () => {
    const L = [];
    L.push([nz(ell(.78, 1.0, .8, 0, 1.15, -.2, 28, 20), .05, 2), CL]);                                                          // shadow behind the mask
    const m = sheet((u, w) => { const a = (w - .5) * 2.1, y = .45 + u * 1.5, r = .74 * pow(sin(PI * (.06 + u * .88)), .55); return V3(sin(a) * r, y, cos(a) * r * .9 + .08); }, 22, 18, .06);
    L.push([m, 'porcelain']);
    for (const s of [-1, 1]) { L.push([at(ell(.16, .035, .04, 0, 0, 0, 14, 6), s * .25, 1.28, .78, 0, 0, s * .18), 'tar']); L.push([ell(.025, .025, .02, s * .25, 1.28, .81, 8, 6), 'glowpurple']); }
    L.push([ell(.07, .03, .02, 0, .72, .77, 10, 6), 'blood']);
    for (const s of [-1, 1]) L.push([ell(.1, .035, .02, s * .25, 1.45, .73, 10, 6), 'tar']);                                    // painted brows
    return out(L);
  });
  add('sp_skull_stag', HS, 'Spirit', 'Stag skull spirit', ['spirit', 'skull', 'deer', 'stag', 'leshen', 'pagan'], () => {
    const L = [], b = 'oldbone';
    L.push([nz(ell(.5, .5, .55, 0, 1.25, -.15, 26, 18), .02, 3), b]);
    L.push([nz(sweep([[0, 1.15, .1], [0, 1.0, .7], [0, .82, 1.25], [0, .7, 1.6]], t => lerp(.36, .14, pow(t, .8)), {seg: 24, rad: 16, sx: 1, sy: .8}), .015, 5), b]);
    for (const s of [-1, 1]) { L.push([ell(.15, .14, .12, s * .3, 1.22, .22, 14, 10), DW]); L.push([ell(.06, .06, .05, s * .32, 1.22, .28, 10, 8), s > 0 ? 'glow' : 'glowgreen']); }
    L.push([ell(.08, .05, .3, 0, .95, 1.1, 10, 8), DW]);
    for (let i = 0; i < 5; i++) for (const s of [-1, 1]) L.push([place(cone(.08, .03, 5), V3(s * .1, .68, .9 + i * .14), V3(0, -1, 0)), 'tooth']);
    return out(L);
  });
  add('sp_head_grudge', HS, 'Spirit', 'Horned grudge mask', ['spirit', 'mask', 'oni', 'horns', 'demon', 'japanese'], () => {
    const L = [];
    L.push([nz(ell(.78, .98, .8, 0, 1.1, -.15, 28, 20), .05, 2), CL]);
    const m = sheet((u, w) => { const a = (w - .5) * 2.2, y = .35 + u * 1.55, r = .78 * pow(sin(PI * (.05 + u * .9)), .45); return V3(sin(a) * r, y, cos(a) * r * .88 + .08); }, 22, 18, .06);
    L.push([m, 'porcelain']);
    for (const s of [-1, 1]) { L.push([at(ell(.17, .08, .05, 0, 0, 0, 14, 8), s * .26, 1.3, .8, 0, 0, s * -.35), 'gold']); L.push([ell(.04, .04, .02, s * .26, 1.3, .84, 8, 6), 'tar']);
      L.push([horn(.9, .12, .5), 'ivory']); place(L[L.length - 1][0], V3(s * .42, 1.75, .25), V3(s * .5, 1, -.15), [0, 0, 1]); }
    L.push([ell(.42, .16, .06, 0, .72, .78, 20, 10), 'blood']);
    for (let i = 0; i < 9; i++) { const x = (i - 4) * .085; L.push([place(cone(.07, .025, 5), V3(x, .82, .82 - x * x * .3), V3(0, -1, .1)), 'tooth']); }
    for (const s of [-1, 1]) L.push([place(cone(.22, .045, 6), V3(s * .3, .6, .78), V3(s * .1, 1, .2)), 'tooth']);
    return out(L);
  });
  add('sp_head_hair', HS, 'Spirit', 'Long-haired ghost', ['spirit', 'ghost', 'hair', 'yurei', 'onryo', 'japanese'], () => {
    const L = [[nz(ell(.62, .82, .66, 0, 1.15, 0, 26, 18), .01, 3), GH]]; rs(61);
    for (let i = 0; i < 70; i++) { const a = rr(-PI, PI), front = abs(a) < 1.2, top = V3(sin(a) * .35, 1.95, cos(a) * .35 - .05), r = .7, len = rr(2.2, 3.6) * (front ? 1 : 1.15);
      const pts = [top, V3(sin(a) * r, 1.6, cos(a) * r * (front ? 1.15 : 1)), V3(sin(a) * (r + .06), .9, cos(a) * (r + .1) * (front ? 1.2 : 1)), V3(sin(a) * (r + rr(0, .2)), 1.95 - len * .7, cos(a) * (r + .2)), V3(sin(a) * (r + rr(-.1, .3)), 1.95 - len, cos(a) * (r + .2) + rr(-.2, .2))];
      L.push([sweep(pts, t => lerp(.045, .012, t), {seg: 20, rad: 5}), 'ghosthair']); }
    L.push([ell(.045, .045, .03, .14, 1.18, .66, 10, 8), 'glow']);                                                               // one eye peeking through
    return out(L);
  });
  add('sp_torso_gaunt', TB, 'Spirit', 'Gaunt ribbed torso', ['spirit', 'gaunt', 'ribs', 'starved', 'ghoul', 'mothman'], () => {
    const pts = dens([[.62, 0], [.55, .6], [.5, 1.3], [.78, 2.3], [.95, 3.0], [1.05, 3.5], [.65, 3.9], [.3, 4.05], [.05, 4.08]], 40), L = [[nz(lth(pts, 36, 1.15, .75), .02, 3), GH]];
    for (let i = 0; i < 6; i++) { const y = 2.0 + i * .28, r = lr(pts, y); L.push([sweep(K.ring(9, (k, a) => a).slice(0, 9).map((_, k) => { const a = (-75 + k * 18.75) * D; return [sin(a) * r * 1.16, y - abs(sin(a)) * .12, cos(a) * r * .77]; }), .05, {seg: 24, rad: 6}), GH]); }
    for (const s of [-1, 1]) L.push([sweep([[s * .1, 3.75, .45], [s * .5, 3.85, .4], [s * .95, 3.7, .2]], .07, {seg: 12, rad: 8}), GH]);
    for (let i = 0; i < 9; i++) L.push([ell(.07, .08, .07, 0, .5 + i * .38, -.56 + (i > 5 ? -.08 : 0), 8, 6), GH]);
    return out(L);
  });
  add('sp_arm_gaunt', AS, 'Spirit', 'Long gaunt arm', ['spirit', 'gaunt', 'arm', 'long', 'mothman'], () => out([
    [limb([[0, 0, 0], [0, 1.4, 0], [0, 2.7, .05], [0, 2.85, .08], [0, 4.4, .25], [0, 5.4, .3]], [.34, .22, .17, .2, .14, .11], {seg: 50, rad: 12}), GH],
    [ell(.17, .2, .17, 0, 2.78, -.04, 12, 10), GH]]));
  add('sp_hand_claw', HN, 'Spirit', 'Long-claw hand', ['spirit', 'claws', 'long fingers', 'ghoul', 'mothman'], () => {
    const L = [[ell(.26, .38, .12, 0, .3, 0, 14, 10), GH]];
    for (const [x, sp, l] of [[-.18, -12, 1.5], [-.06, -4, 1.8], [.06, 4, 1.75], [.18, 12, 1.45]]) { const a = sp * D, e = V3(x + sin(a) * l, .6 + l, .45);
      L.push([sweep([[x, .55, 0], [x + sin(a) * l * .45, .6 + l * .48, .05], e], t => lerp(.055, .03, t), {seg: 18, rad: 7}), GH]);
      L.push([place(claw(.45, .03, 1.2), e, V3(sin(a), .7, .6), [0, 0, 1]), 'horn']); }
    L.push([sweep([[.22, .25, .05], [.5, .55, .25], [.6, .9, .5]], .05, {seg: 10, rad: 6}), GH]); L.push([place(claw(.35, .028, 1), V3(.6, .9, .5), V3(.2, .6, .7), [0, 0, 1]), 'horn']);
    return out(L);
  });
  add('sp_leg_gaunt', LF, 'Spirit', 'Long gaunt leg', ['spirit', 'gaunt', 'leg', 'mothman'], () => {
    const L = [[limb([[0, 0, 0], [0, 2.0, .1], [0, 2.25, .15], [0, 4.0, -.2], [0, 4.6, -.1]], [.42, .25, .24, .17, .15], {seg: 50, rad: 12}), GH], [ell(.2, .24, .22, 0, 2.15, .18, 12, 10), GH]];
    for (const a of [-20, 0, 20]) { const d = V3(sin(a * D), .1, cos(a * D)); L.push([sweep([[0, 4.6, 0], V3(0, 4.6, 0).addScaledVector(d, .6), V3(0, 4.62, 0).addScaledVector(d, 1.1)], t => lerp(.09, .04, t), {seg: 10, rad: 7}), GH]); L.push([place(claw(.3, .035, 1), V3(0, 4.62, 0).addScaledVector(d, 1.1), d, [0, -1, 0]), 'horn']); }
    return out(L);
  });
  add('sp_tail_wisp', TL, 'Spirit', 'Ghost tail (floating)', ['spirit', 'ghost', 'wisp', 'no legs', 'yurei'], () =>
    [{geo: sweep([[0, 0, 0], [.2, 2, .3], [-.3, 4, -.2], [.25, 5.6, .4], [0, 6.6, 0]], t => .9 * pow(1 - t, 1.3) + .02, {seg: 60, rad: 18, sy: .7, prof: (a, t) => 1 + .12 * sin(a * 5 + t * 9)}), mat: 'ectoplasm'}], {fade: {amt: .5}});
  function rag(o) {   // tattered hanging cloth: ring of radius r0->r1 hanging from y0 down by len, cut ragged at the hem
    rs(o.seed || 71); const cuts = [...Array(o.n || 18)].map(() => rr(.55, 1));
    return sheet((u, w) => { const a = o.a0 + (o.a1 - o.a0) * u, y = o.y0 - w * o.len, r = lerp(o.r0, o.r1, pow(w, .8)) * (1 + .05 * sin(a * 9 + w * 6)); return V3(sin(a) * r, y, cos(a) * r * (o.sz || 1) + (o.dz || 0)); },
      o.nu || 48, o.nv || 18, .03, {skip: (u, w) => w > cuts[Math.min(cuts.length - 1, (u * cuts.length) | 0)]});
  }
  add('sp_robe', AM, 'Spirit', 'Tattered robe skirt', ['spirit', 'robe', 'cloth', 'tattered', 'leshen', 'pagan'], () => out([
    [rag({a0: -PI + .25, a1: PI - .25, y0: .4, len: 4.6, r0: .95, r1: 1.5, sz: .8, seed: 72}), 'ragcloth'], [sweep(K.ring(25, (i, a) => [sin(a * 25 / 24) * 1.0, .35, cos(a * 25 / 24) * .82]), .07, {seg: 48, rad: 8}), 'leather']]));
  add('sp_hood', AM, 'Spirit', 'Tattered hood & mantle', ['spirit', 'hood', 'mantle', 'cloak', 'leshen'], () => {
    const hood = sheet((u, w) => { const a = -2.4 + u * 4.8, ph = w * PI * .55; return V3(sin(a) * sin(ph + .5) * .82, .3 + cos(ph + .5) * 1.1 + 1.0, -cos(a) * sin(ph + .5) * .8 + .05); }, 30, 14, .04);
    return out([[hood, 'ragcloth'], [rag({a0: -PI, a1: PI, y0: .45, len: 1.5, r0: .6, r1: 1.35, sz: .8, seed: 73, n: 22}), 'ragcloth']]);
  });
  function flame(h, r) { return lth(dens([[0, 0], [r * .8, r * .25], [r, r * .9], [r * .7, h * .55], [r * .25, h * .85], [0, h]], 18), 18); }
  add('sp_wisps', AM, 'Spirit', 'Spirit flames (hitodama)', ['spirit', 'flames', 'wisps', 'ghost fire', 'hitodama'], () => {
    const L = []; rs(81); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, R = rr(2.2, 3), y = rr(1, 4), f = flame(.8, .28);
      at(f, 0, 0, 0, rr(-.3, .3), 0, rr(-.3, .3)); f.translate(cos(a) * R, y, sin(a) * R); L.push([f, 'glowblue']);
      L.push([sweep([[cos(a) * R, y + .05, sin(a) * R], [cos(a) * R + .2, y - .5, sin(a) * R], [cos(a) * R - .1, y - 1.1, sin(a) * R + .1]], t => .12 * (1 - t) + .01, {seg: 14, rad: 7}), 'glowblue']); }
    return out(L);
  });
  add('sp_eye_orbs', AM, 'Spirit', 'Floating eye spirits', ['spirit', 'eyes', 'orbs', 'floating', 'creepy'], () => {
    const L = []; rs(91); for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5, c = V3(cos(a) * 2.4, 2 + i * .8, sin(a) * 2.4), r = .38;
      L.push([ell(r, r, r, c.x, c.y, c.z, 22, 16), 'chitin']); L.push([ell(r * .62, r * .62, r * .3, c.x, c.y, c.z + r * .85, 18, 12), 'eye']);
      for (let k = 0; k < 4; k++) { const b = k / 4 * TAU; L.push([sweep([c.clone().add(V3(cos(b) * .2, -r * .8, sin(b) * .2)), c.clone().add(V3(cos(b) * .35, -r - .5, sin(b) * .35)), c.clone().add(V3(cos(b + 1) * .3, -r - 1.2, sin(b + 1) * .3))], t => .05 * (1 - t) + .008, {seg: 14, rad: 6}), 'chitin']); } }
    return out(L);
  });
  add('sp_shimenawa', AM, 'Spirit', 'Sacred rope & paper streamers', ['spirit', 'rope', 'shimenawa', 'shide', 'shrine', 'japanese'], () => {
    const L = [], R = 1.25;
    for (const ph of [0, PI]) L.push([sweep(K.ring(97, (i) => { const t = i / 96, a = t * TAU; return [sin(a) * (R + .06 * cos(t * 60 + ph)), .06 * sin(t * 60 + ph), cos(a) * (R + .06 * cos(t * 60 + ph)) * .85]; }), .085, {seg: 190, rad: 8, cap: false}), 'sack']);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + .26, x = sin(a) * R, z = cos(a) * R * .85, pts = [[-.1, 0], [.1, 0], [.1, -.35], [-.06, -.35], [-.06, -.7], [.14, -.7], [.14, -1.05], [-.02, -1.05], [-.02, -1.4], [-.18, -1.4], [-.18, -1.05], [-.06, -1.05], [-.06, -.7], [-.26, -.7], [-.26, -.35], [-.1, -.35]];
      const g = new T.ExtrudeGeometry(K.shape(pts), {depth: .015, bevelEnabled: false}); at(g, x, -.05, z, 0, a, 0); L.push([g, 'paper']); }
    return out(L);
  });
  add('sp_ofuda', AM, 'Spirit', 'Paper talismans', ['spirit', 'talisman', 'ofuda', 'paper', 'seal'], () => {
    const L = []; for (let i = 0; i < 3; i++) { const x = (i - 1) * .32, g = sheet((u, w) => V3(x + (w - .5) * .26, -u * 1.1, .04 * sin(u * 3 + i)), 8, 3, .01); L.push([g, 'paper']);
      for (let k = 0; k < 4; k++) L.push([bx3(x, -.2 - k * .22, .015, .14, .05, .01), 'blood']); }
    return out(L);
  }, {surface: true});
  function bx3(x, y, z, w, h, d) { return new T.BoxGeometry(w, h, d).translate(x, y, z); }

  // ======================================================================= SAND SPIRIT
  add('sd_wing_sand', WG, 'Sand Spirit', 'Sand wing (fades away)', ['sand', 'wing', 'spirit', 'dust', 'fade'], () => {
    const L = []; rs(101);
    L.push([limb([[0, 0, 0], [.3, 2.4, 0], [.2, 4.8, -.1], [-.1, 7.2, 0]], [.32, .22, .16, .06], {seg: 40, rad: 10}), 'sandstone']);
    for (let k = 0; k < 9; k++) { const t0 = k / 9, rib = sheet((u, w) => { const y = lerp(.4, 7 - k * .45, u), x = w * (1.2 + k * .55) * sin(PI * (.1 + .8 * u)), z = .25 * sin(u * 5 + k) + .15 * w * w * sin(k); return V3(x + .3 * sin(u * 3 + k), y - w * (1.4 + k * .25) * u, z + k * .03); }, 26, 6, .05);
      L.push([nz(rib, .08, 2.2), 'sand']); }
    for (let i = 0; i < 40; i++) { const r = rr(.06, .2); L.push([nz(ell(r, r * .8, r, rr(1, 5.5), rr(0, 6), rr(-.4, .4), 8, 6), r * .3, 6), 'sand']); }
    return out(L);
  }, {fade: {amt: .55}});

  // ======================================================================= KRAKEN
  add('kr_mantle', TB, 'Sea Monster', 'Kraken mantle & eyes', ['kraken', 'octopus', 'squid', 'sea monster', 'mantle'], () => {
    const pts = dens([[1.5, 0], [1.9, .6], [1.7, 1.4], [1.85, 2.6], [1.8, 3.8], [1.3, 4.9], [.5, 5.4], [.05, 5.5]], 44), L = [];
    const g = nz(lth(pts, 44, 1, .95), .1, 1.1); deform(g, q => { q.z -= .35 * pow(max(0, q.y - 1.5) / 4, 2) * 2; }); L.push([g, 'krakenskin']);
    rs(111); for (let i = 0; i < 30; i++) { const s = lsurf(pts, rr(1.2, 4.6), rr(0, TAU), 1, .95), w = ell(rr(.06, .13), rr(.06, .13), .06, 0, 0, 0, 8, 6); placeN(w, s.p, s.n); L.push([w, 'krakenskin']); }
    for (const s of [-1, 1]) { const a = s * 62 * D, sf = lsurf(pts, 1.2, a, 1, .95); const e = ell(.45, .42, .3, 0, 0, 0, 22, 16), lid = sweep([[-.5, .25, .1], [0, .52, .2], [.5, .25, .1]], .14, {seg: 14, rad: 8}), pu = ell(.3, .08, .05, 0, 0, .28, 14, 8);
      placeN([e, lid, pu], sf.p.clone().addScaledVector(sf.n, -.05), sf.n); L.push([e, 'eyegold'], [lid, 'krakenskin'], [pu, 'tar']); }
    const sp = lsurf(pts, 1.0, 140 * D, 1, .95); L.push([place(sweep([[0, 0, 0], [0, .5, .1], [0, .9, .05]], t => lerp(.22, .3, t), {seg: 10, rad: 12}), sp.p, sp.n.clone().add(V3(0, .4, 0)), [0, 1, 0]), 'krakenskin']);
    return out(L);
  });
  function tentacle(len, r, o = {}) {
    const n = 9, pts = []; for (let i = 0; i <= n; i++) { const t = i / n, c = o.curl == null ? 1 : o.curl, ang = pow(t, 3) * 4.5 * c; pts.push(V3(0, t * len * (1 - .25 * pow(t, 3) * c), sin(ang) * len * .12 * t + .2 * sin(t * 4))); }
    const curve = crv(pts), L = [[sweep(curve, t => o.club && t > .78 && t < .95 ? r * .45 * (1 + 1.4 * gauss(t, .87, .05)) : r * pow(1 - t, o.club ? .5 : 1) + .015, {seg: 80, rad: 14, ref: [0, 0, 1], sx: 1, sy: .85}), 'krakenskin']];
    const F = frameFn(curve, [0, 0, 1]);
    for (let i = 1; i < (o.club ? 16 : 22); i++) { const t = o.club ? .76 + i / 16 * .2 : i / 24, f = F(t), rad = (o.club && t > .78 ? r * .45 * (1 + 1.4 * gauss(t, .87, .05)) : r * pow(1 - t, o.club ? .5 : 1) + .015);
      for (const side of (o.club ? [-.35, .35] : [-.3, .3])) { const nrm = f.U.clone().multiplyScalar(cos(side)).addScaledVector(f.S, sin(side)), p = f.p.clone().addScaledVector(nrm, rad * .85), sr = rad * (o.club ? .32 : .34);
        const ring = new T.TorusGeometry(sr, sr * .35, 6, 14), disc = new T.CylinderGeometry(sr * .8, sr * .8, sr * .2, 14).rotateX(PI / 2); placeN([ring, disc], p, nrm, f.T); L.push([ring, 'sucker'], [disc, 'flesh']);
        if (o.club && i % 3 === 0) L.push([place(claw(sr * 1.4, sr * .3, 1), p.clone().addScaledVector(nrm, sr * .2), nrm, f.T), 'horn']); } }
    return out(L);
  }
  add('kr_tentacle', TE, 'Kraken', 'Kraken tentacle', ['kraken', 'tentacle', 'suckers', 'octopus'], () => tentacle(7.5, .5));
  add('kr_tentacle_club', TE, 'Kraken', 'Hooked club tentacle', ['kraken', 'squid', 'tentacle', 'hooks'], () => tentacle(9, .32, {club: 1, curl: .4}));
  add('kr_beak', JT, 'Maws & Mandibles', 'Kraken beak', ['kraken', 'beak', 'squid', 'octopus'], () => {
    const up = sweep([[0, .1, -.2], [0, .45, .35], [0, .2, .85], [0, -.15, 1.05]], t => .42 * pow(1 - t, .7) + .02, {seg: 24, rad: 16, sx: 1, sy: .75}), lo = sweep([[0, -.05, -.15], [0, -.3, .3], [0, -.25, .7], [0, .0, .8]], t => .36 * pow(1 - t, .7) + .02, {seg: 22, rad: 14});
    return out([[up, 'chitin'], [lo, 'chitin'], [lth(dens([[.7, -.3], [.75, .1], [.55, .4], [.1, .45]], 12), 24).translate(0, 0, -.2), 'krakenskin']]);
  });

  // ======================================================================= GIANT MOTH + MOTHMAN
  function mothWing(o) {   // spar +Y, wing area spreads toward +X; o.L length, o.W width, o.hind rounded hindwing
    const L = o.L || 7, W = o.W || 3.6, mat = o.mat || 'mothwing', out2 = [];
    const ch = u => o.hind ? W * pow(sin(PI * min(1, u * 1.02)), .7) : W * (.35 + .9 * u) * pow(sin(PI * min(1, .12 + u * .9)), .5);
    const surf = (u, w) => { const c = ch(u), x = w * c, y = u * L - w * c * (o.hind ? .5 : .35) * u; return V3(x, y + (o.hind ? -w * c * .2 : 0), .3 * sin(PI * w) * (1 - u) + .12 * sin(u * 6)); };
    out2.push([sheet(surf, 40, 20, .04), mat]);
    for (const [u0, u1] of [[.05, .95], [.2, .9], [.35, .85], [.5, .8]]) out2.push([sweep([...Array(8)].map((_, i) => { const w = i / 7; return surf(lerp(u0, u1, w * .6 + .2 * w), w * .95).add(V3(0, 0, .03)); }), .025, {seg: 20, rad: 5}), 'chitin']);
    out2.push([sweep([0, .25, .5, .75, 1].map(u => surf(u, 0).add(V3(0, 0, .02))), t => .1 * (1 - t) + .02, {seg: 30, rad: 8}), 'chitin']);
    if (o.spot !== false) { const c = surf(o.hind ? .55 : .58, o.hind ? .5 : .45);
      for (const [r, m, dz] of [[.9, o.ring1 || 'tar', .04], [.68, o.ring2 || 'ivory', .06], [.45, o.ring3 || 'eyegold', .08], [.18, 'tar', .1]]) out2.push([new T.CylinderGeometry(r * (o.spotS || 1), r * (o.spotS || 1), .02, 32).rotateX(PI / 2).translate(c.x, c.y, c.z + dz), m]); }
    if (o.band) for (let i = 0; i < 2; i++) out2.push([sweep([...Array(10)].map((_, k) => surf(.3 + i * .35 + .05 * sin(k), k / 9 * .98).add(V3(0, 0, .05))), .09, {seg: 24, rad: 5, sy: .3}), o.band]);
    if (o.tail) out2.push([sweep([surf(.45, .9), surf(.45, .9).add(V3(1.2, -1.6, .2)), surf(.45, .9).add(V3(1.6, -3.4, .1))], t => .35 * (1 - t) + .08, {seg: 20, rad: 8, sy: .15}), mat]);
    return out(out2);
  }
  add('mo_wing', WG, 'Moth', 'Giant moth forewing', ['moth', 'wing', 'eye spot', 'kaiju', 'insect'], () => mothWing({band: 'mothdark'}));
  add('mo_wing_hind', WG, 'Moth', 'Moth hindwing (tailed)', ['moth', 'wing', 'hindwing', 'luna', 'insect'], () => mothWing({hind: 1, L: 5, W: 3.2, tail: 1, spotS: .8}));
  add('mo_wing_dark', WG, 'Moth', 'Dark moth wing (Mothman)', ['moth', 'wing', 'dark', 'mothman', 'cryptid'], () => mothWing({mat: 'mothdark', spot: true, ring1: 'blood', ring2: 'tar', ring3: 'gemred', band: 'tar', spotS: .6}));
  add('mo_body', TB, 'Moth', 'Fuzzy moth thorax', ['moth', 'thorax', 'fuzzy', 'insect'], () => {
    const L = [[nz(ell(1.2, 1.5, 1.3, 0, 1.4, 0, 30, 22), .12, 2.5), 'mothfur']], g = nz(ell(1.45, .6, 1.4, 0, 2.7, .2, 26, 14), .2, 3); L.push([g, 'mothfur']);
    return out(L);
  });
  add('mo_abdomen', TL, 'Moth', 'Moth abdomen', ['moth', 'abdomen', 'fuzzy', 'insect'], () => {
    const L = []; for (let i = 0; i < 7; i++) { const y = .4 + i * .62, r = 1.05 * pow(1 - i / 8, .7) * (1 - .4 * pow(i / 7, 2)); L.push([nz(ell(r, .42, r * .92, 0, y, 0, 24, 12), .06, 4), i % 2 ? 'mothdark' : 'mothfur']); }
    return out(L);
  });
  function antenna(base, dir, len, side) {
    const L = [], c = crv([base, base.clone().addScaledVector(dir, len * .5).add(V3(0, len * .12, 0)), base.clone().addScaledVector(dir, len)]);
    L.push([sweep(c, t => .05 * (1 - t) + .015, {seg: 24, rad: 6}), 'chitin']);
    for (let i = 2; i < 30; i++) { const t = i / 30, p = c.getPointAt(t), tg = c.getTangentAt(t), bl = .45 * sin(PI * t) + .06;
      for (const s of [-1, 1]) { const d = V3(s * side, -.3, s * .6).normalize().addScaledVector(tg, .3).normalize(); L.push([place(cone(bl, .018, 4), p, d, tg), 'mothfur']); } }
    return L;
  }
  add('mo_head', HS, 'Moth', 'Giant moth head', ['moth', 'head', 'antennae', 'compound eyes', 'kaiju'], () => {
    const L = [[nz(ell(.7, .62, .65, 0, .9, .25, 24, 18), .06, 4), 'mothfur'], [nz(ell(.9, .55, .7, 0, .45, -.1, 22, 14), .14, 3), 'mothfur']];
    for (const s of [-1, 1]) { L.push([ell(.42, .48, .42, s * .52, 1.0, .42, 24, 18), 'mothyeye']); L.push(...antenna(V3(s * .25, 1.45, .55), V3(s * .7, 1, .5).normalize(), 2.6, s)); }
    L.push([sweep([[0, .55, .7], [0, .3, .95], [0, .1, .85], [0, .15, .7]], .04, {seg: 16, rad: 6}), 'chitin']);
    return out(L);
  });
  add('mo_head_mothman', HS, 'Moth', 'Mothman head', ['mothman', 'cryptid', 'red eyes', 'moth', 'horror'], () => {
    const L = [[nz(ell(.85, .95, .7, 0, .85, 0, 26, 20), .1, 3), 'mothdark'], [nz(ell(1.35, .5, .9, 0, .3, -.1, 26, 14), .22, 2.5), 'mothdark']];
    for (const s of [-1, 1]) { L.push([at(ell(.32, .4, .2, 0, 0, 0, 22, 16), s * .36, 1.0, .58, 0, s * .3, s * -.35), 'gemred']);
      L.push(...antenna(V3(s * .22, 1.6, .25), V3(s * .5, 1, -.3).normalize(), 1.4, s).map(([g, m]) => [g, m === 'mothfur' ? 'mothdark' : m])); }
    return out(L);
  });
  add('mo_torso_furry', TB, 'Moth', 'Furry cryptid torso', ['mothman', 'fur', 'torso', 'cryptid', 'moth'], () => {
    const pts = dens([[.7, 0], [.6, .7], [.62, 1.4], [.95, 2.4], [1.15, 3.2], [1.0, 3.8], [.5, 4.1], [.05, 4.15]], 40);
    const L = [[nz(lth(pts, 36, 1.15, .8), .06, 2), 'mothdark']]; rs(121);
    for (let i = 0; i < 26; i++) { const s = lsurf(pts, rr(2.6, 3.9), rr(0, TAU), 1.15, .8); L.push([place(cone(rr(.3, .6), rr(.12, .2), 6), s.p.clone().addScaledVector(s.n, -.05), s.n.clone().add(V3(0, -.9, 0)).normalize()), 'mothdark']); }
    return out(L);
  });

  // ======================================================================= GIANT CENTIPEDE
  add('cp_segment', TB, 'Centipede', 'Centipede body segment', ['centipede', 'segment', 'armor', 'bug'], () => {
    // along +Y (head -> tail), dorsal plate on +Z side so it can be flipped if needed; unit length 1
    const plate = sheet((u, w) => { const a = (w - .5) * PI * 1.05; return V3(sin(a) * .95, u * 1.05 - .02, cos(a) * .55 + .12); }, 10, 16, .07);
    const belly = ell(.7, .55, .38, 0, .5, -.05, 18, 12);
    return out([[plate, 'chitinred'], [belly, 'chitin'], [sweep([[-.95, .95, .12], [0, .98, .68], [.95, .95, .12]], .05, {seg: 16, rad: 6}), 'chitin']]);
  }, {fitKind: 'seg', unitLen: 1, perSeg: true});
  add('cp_leg', LF, 'Centipede', 'Centipede leg', ['centipede', 'leg', 'bug', 'spiky'], () => out([
    [limb([[0, 0, 0], [0, 1.3, .25], [0, 1.4, .3], [0, 2.8, -.1], [0, 3.4, -.3]], [.16, .12, .12, .08, .02], {seg: 36, rad: 8}), 'chitinred'], [ell(.14, .16, .14, 0, 1.35, .28, 10, 8), 'chitin']]));
  add('cp_head', HS, 'Centipede', 'Centipede head', ['centipede', 'head', 'antennae', 'bug'], () => {
    const L = [[nz(ell(.95, .45, 1.0, 0, .55, .4, 24, 14), .02, 4), 'chitinred'], [ell(.8, .3, .8, 0, .32, .45, 20, 10), 'chitin']];
    for (const s of [-1, 1]) { L.push([sweep([[s * .3, .7, 1.2], [s * .9, 1.4, 2.2], [s * 1.5, 1.8, 3.4], [s * 2.2, 1.6, 4.6]], t => .07 * (1 - t) + .015, {seg: 30, rad: 6}), 'chitin']); L.push([ell(.1, .1, .08, s * .5, .8, 1.15, 8, 6), 'tar']); }
    return out(L);
  });
  add('cp_fangs', JT, 'Maws & Mandibles', 'Venom claws (forcipules)', ['centipede', 'fangs', 'venom', 'pincers'], () => {
    const L = []; for (const s of [-1, 1]) { L.push([sweep([[s * .5, 0, 0], [s * .9, -.1, .6], [s * .65, -.15, 1.3], [s * .15, -.1, 1.6]], t => .2 * pow(1 - t, .7) + .02, {seg: 24, rad: 10}), 'chitinred']); L.push([place(claw(.5, .06, 1.2), V3(s * .15, -.1, 1.6), V3(-s, 0, .4), [0, -1, 0]), 'tar']); }
    return out(L);
  });
  add('cp_tail_feelers', TL, 'Centipede', 'Tail feelers', ['centipede', 'tail', 'feelers', 'bug'], () => out([[sweep([[-.2, 0, 0], [-.7, 1.4, .2], [-1.2, 3, 0]], t => .12 * (1 - t) + .02, {seg: 20, rad: 6}), 'chitinred'], [sweep([[.2, 0, 0], [.7, 1.4, .2], [1.2, 3, 0]], t => .12 * (1 - t) + .02, {seg: 20, rad: 6}), 'chitinred']]));

  // ======================================================================= MASKS (head frame: face toward +Z, eye line y~1.2, front z~.85)
  const MK = 'Masks';
  const maskSurf = (W = .62, H = .8, cy = 1.1, z = .82) => (u, w) => { const a = (w - .5) * 2, b = (u - .5) * 2; return V3(a * W, cy + b * H, z - .45 * a * a * W - .15 * b * b); };
  const eyeHole = (u, w, cy = 1.1, H = .8, W = .62) => { const x = (w - .5) * 2 * W, y = (u - .5) * 2 * H + cy; return ((abs(x) - .26) / .14) ** 2 + ((y - 1.22) / .08) ** 2 < 1; };
  add('tf_mask_leaf', EF, MK, 'Leaf mask', ['mask', 'leaf', 'treefolk', 'forest', 'druid'], () => {
    const L = []; rs(131);
    for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, r = i % 2 ? .52 : .38, p = V3(cos(a) * r * .95, 1.15 + sin(a) * r * 1.15, .8 - (cos(a) * r) ** 2 * .5);
      if (abs(p.y - 1.22) < .1 && abs(abs(p.x) - .26) < .14) continue;
      L.push([place(leaf(rr(.45, .7), .2, .3), p, V3(cos(a), sin(a) * 1.2, .25), [0, 0, 1]), i % 3 ? 'leaf' : 'leafautumn']); }
    for (const s2 of [-1, 1]) L.push([sweep(K.ring(17, (i, a) => [s2 * .26 + cos(a * 17 / 16) * .17, 1.22 + sin(a * 17 / 16) * .1, .83]), .025, {seg: 32, rad: 6}), BARK]);
    L.push([sweep([[0, 1.4, .86], [0, 1.15, .9], [0, .85, .86]], .03, {seg: 12, rad: 6}), BARK]);
    return out(L);
  });
  add('tf_mask_bark', EF, MK, 'Bark mask', ['mask', 'bark', 'treefolk', 'wood', 'pagan'], () => {
    const m = wood(sheet(maskSurf(.62, .78), 18, 14, .1, {skip: (u, w) => eyeHole(u, w, 1.1, .78)}), 9, .06, .03, 3);
    return out([[m, BARK], [nz(ell(.42, .1, .12, 0, 1.75, .66, 16, 8), .04, 5), 'moss'], [sweep([[0, 1.2, .9], [0, 1.0, 1.05], [0, .88, 1.0]], t => lerp(.07, .04, t), {seg: 10, rad: 8}), BARK]]);
  });
  add('sp_mask_fox', EF, MK, 'Fox spirit mask', ['mask', 'fox', 'kitsune', 'spirit', 'japanese', 'festival'], () => {
    const L = [], m = sheet((u, w) => { const a = (w - .5) * 2, b = (u - .5) * 2, sn = max(0, .5 - u) * 2; return V3(a * .6 * (1 - .55 * sn), 1.15 + b * .7, .82 - .4 * a * a * .6 + .45 * sn * sn); }, 20, 16, .06, {skip: (u, w) => eyeHole(u, w, 1.15, .7, .6)});
    L.push([m, 'porcelain']);
    for (const s2 of [-1, 1]) { L.push([place(cone(.55, .2, 4), V3(s2 * .38, 1.7, .62), V3(s2 * .35, 1, -.1)), 'porcelain']); L.push([place(cone(.4, .1, 4), V3(s2 * .38, 1.74, .68), V3(s2 * .35, 1, -.1)), 'blood']);
      L.push([sweep([[s2 * .14, 1.3, .86], [s2 * .3, 1.38, .82], [s2 * .48, 1.3, .7]], .028, {seg: 12, rad: 6}), 'blood']); L.push([sweep([[s2 * .1, .9, .98], [s2 * .3, .95, .9], [s2 * .5, 1.0, .7]], .02, {seg: 12, rad: 6}), 'blood']); }
    L.push([ell(.06, .04, .04, 0, .72, 1.15, 10, 8), 'tar']); L.push([ell(.04, .07, .02, 0, 1.55, .9, 8, 6), 'blood']);
    return out(L);
  });
  add('sp_mask_wood', EF, MK, 'Carved pagan mask', ['mask', 'wood', 'pagan', 'tribal', 'antlers', 'spirit'], () => {
    const L = [[sheet(maskSurf(.6, .85, 1.1, .8), 18, 14, .09, {skip: (u, w) => eyeHole(u, w, 1.1, .85, .6)}), 'darkwood']];
    for (let i = 0; i < 4; i++) L.push([sweep([[-.35 + i * .01, .7 + i * .08, .78 - .05], [0, .62 + i * .08, .86], [.35 - i * .01, .7 + i * .08, .73]], .018, {seg: 14, rad: 5}), 'ivory']);
    for (const s2 of [-1, 1]) { const br = branchy([s2 * .4, 1.75, .6], [s2 * .5, 1, -.1], .45, .05, 2, {spread: 30}); L.push(...br.list.map(g => [g, 'oldbone'])); L.push([ell(.03, .03, .02, s2 * .26, 1.22, .74, 8, 6), 'glow']); }
    L.push([sweep([[0, 1.62, .78], [0, 1.4, .84], [0, 1.05, .9]], .03, {seg: 12, rad: 6}), 'blood']);
    return out(L);
  });

  // ======================================================================= CLOTH & CAPES (Nov 9 night). Capes/chains go on the chest bone (+Y up the spine, front +Z),
  // shroud on the head bone (head frame), scarf on the neck bone, sash on the hips bone.
  const CC = 'Cloth & Capes';
  function capeSheet(o) { rs(o.seed || 141); const holes = [...Array(o.holes || 0)].map(() => [rr(-.8, .8), rr(.25, .85), rr(.04, .1)]), cuts = [...Array(26)].map(() => rr(o.tat ? .8 : 1, 1));
    return sheet((u, w) => { const a = (u - .5) * 2, W = o.w || 1.5; return V3(a * (W + w * (o.flare || 1.8)), 1.1 - w * (o.len || 7), -(o.back || .9) - w * 1.6 - .32 * sin(a * 9 + w * 2) * w - .3 * w * w * cos(a * 2.5)); },
      34, 24, .04, {skip: (u, w) => w > cuts[(u * 25.9) | 0] || holes.some(([hx, hy, hr]) => ((u - .5) * 2 - hx) ** 2 * .3 + (w - hy) ** 2 < hr * hr)}); }
  add('cl_cape_tattered', CC, 'Capes', 'Tattered battle cape', ['cape', 'cloak', 'tattered', 'burnt', 'super robot', 'villain'], () => out([
    [capeSheet({tat: 1, seed: 142}), 'capeblack'], [sweep([[-1.6, 1.15, -.55], [-.8, 1.3, -.95], [0, 1.35, -1.0], [.8, 1.3, -.95], [1.6, 1.15, -.55]], .12, {seg: 24, rad: 8}), 'capeblack']]), {fade: {amt: .3, style: 'burn'}});
  add('cl_cape_royal', CC, 'Capes', 'Royal cape + clasp', ['cape', 'royal', 'hero', 'king'], () => out([
    [capeSheet({seed: 143, flare: 1.4}), 'capered'], [sweep([[-1.6, 1.15, -.5], [-.8, 1.35, -.9], [0, 1.4, -.98], [.8, 1.35, -.9], [1.6, 1.15, -.5]], .16, {seg: 24, rad: 10}), 'velvet'],
    ...[-1, 1].map(s2 => [new T.CylinderGeometry(.22, .22, .1, 24).rotateX(PI / 2).translate(s2 * 1.45, 1.2, -.3), 'gold'])]));
  add('cl_shroud', CC, 'Shrouds & Scarves', 'Wasteland head shroud', ['shroud', 'hood', 'gauze', 'wrap', 'desert', 'megatron'], () => {
    rs(151); const cuts = [...Array(30)].map(() => rr(.75, 1));
    const g = sheet((u, w) => { const a = -2.75 + u * 5.5, el = w < .45 ? (w / .45) * 1.35 : 1.35, r = w < .45 ? 1.05 * sin(.25 + el) : 1.15 + (w - .45) * 1.6, y = w < .45 ? 1.15 + 1.05 * cos(.25 + el) : 1.2 - (w - .45) * 4.2;
      return V3(sin(a) * r + .12 * sin(u * 31) * w, y + .12 * sin(u * 23 + w * 4) * w, -cos(a) * r * .95 + .2 * w * w); }, 44, 22, .035, {skip: (u, w) => w > cuts[(u * 29.9) | 0]});
    return out([[nz(g, .03, 3), 'gauze']]);
  });
  add('cl_scarf', CC, 'Shrouds & Scarves', 'Long flowing scarf', ['scarf', 'neck', 'hero', 'ninja', 'flowing'], () => {
    const L = []; for (const [y, r] of [[.05, .78], [.32, .74]]) L.push([sweep(K.ring(41, (i) => { const a = i / 40 * TAU; return [sin(a) * r, y + .06 * sin(a * 3), cos(a) * r * .9]; }), .16, {seg: 80, rad: 10, sy: .55, cap: false}), 'capered']);
    rs(161); for (const [s2, len] of [[1, 4.2], [-1, 3.3]]) { const cuts = [...Array(6)].map(() => rr(.85, 1));
      L.push([sheet((u, w) => { const t = w; return V3(s2 * (.25 + .5 * t) + (u - .5) * .42, .1 - t * len * .45 + .2 * sin(t * 5), .75 - t * len - .25 * sin(t * 4 + s2)); }, 6, 26, .04, {skip: (u, w) => w > cuts[(u * 5.9) | 0]}), 'capered']); }
    L.push([nz(ell(.22, .18, .18, .1, .15, .82, 12, 10), .03, 5), 'capered']);
    return out(L);
  });
  add('cl_chains', CC, 'Chains & Straps', 'Hanging chains', ['chains', 'iron', 'prisoner', 'megatron', 'rusty'], () => {
    const L = [], link = (p, d, i) => { const g = new T.TorusGeometry(.13, .04, 6, 14).scale(1, 1.6, 1); return place(g.rotateY(i % 2 ? PI / 2 : 0), p, d, [0, 0, 1]); };
    for (const pts of [[[1.3, 1.1, .5], [.6, -.4, 1.2], [-.3, -1.4, 1.1], [-1.2, -2.6, .7]], [[-1.4, .9, .4], [-1.1, -1.2, 1.1], [-.8, -2.7, .9]]]) { const c = crv(pts), n = (c.getLength() / .32) | 0;
      for (let i = 0; i <= n; i++) L.push([link(c.getPointAt(i / n), c.getTangentAt(i / n), i), 'rustchain']); }
    return out(L);
  });
  add('cl_sash', CC, 'Chains & Straps', 'Waist sash + loincloth', ['sash', 'loincloth', 'belt', 'warrior', 'cloth'], () => {
    const L = [[sweep(K.ring(33, (i) => { const a = i / 32 * TAU; return [sin(a) * 1.05, .2 + .05 * sin(a * 2), cos(a) * .85]; }), .14, {seg: 64, rad: 8, sy: .6, cap: false}), 'leather']];
    rs(171); for (const zs of [1, -1]) { const cuts = [...Array(8)].map(() => rr(.8, 1));
      L.push([sheet((u, w) => V3((u - .5) * (.8 + w * .2), .15 - w * 2.6, zs * (.85 + w * .25 + .08 * sin(u * 9))), 10, 16, .04, {skip: (u, w) => w > cuts[(u * 7.9) | 0]}), 'canvas']); }
    return out(L);
  });

  // ======================================================================= CHERRY BLOSSOM (Nov 9): blossom crowns + petals for a cherry blossom tree monster
  function flower(r) { const L = []; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; L.push(place(sheet((u, w) => { const x = (w - .5) * 2 * r * .55 * sin(PI * min(1, u * 1.1)); return V3(x, u * r, .25 * r * u * u - .1 * r * (x / r) * (x / r)); }, 4, 3, r * .05), V3(0, 0, 0), V3(cos(a), sin(a), .35), [0, 0, 1])); } return L; }
  function blossomBall(c, R, n, seedv) { rs(seedv); const out2 = []; for (let i = 0; i < n; i++) { const d = V3(rr(-1, 1), rr(-.4, 1), rr(-1, 1)).normalize(), p = v(c).addScaledVector(d, R * rr(.55, 1)), f = flower(rr(.13, .22));
      const m = pm(p, d, [rr(-1, 1), rr(-1, 1), rr(-1, 1)]); f.forEach(g => g.applyMatrix4(m)); out2.push(...f); } return out2; }
  add('tf_blossom_crown', HC, 'Treefolk', 'Cherry blossom crown', ['treefolk', 'cherry blossom', 'sakura', 'flowers', 'crown', 'pink'], () => {
    const L = [], br = branchy([0, 0, 0], [0, 1, 0], 1.0, .2, 2, {spread: 42, kids: 3}); L.push(...br.list.map(g => [g, 'cherrybark']));
    br.tips.forEach((t, i) => { L.push([bush(rr(.45, .65), t.p.x, t.p.y + .15, t.p.z, .35), 'blossom']); L.push(...blossomBall(t.p.clone().add(V3(0, .15, 0)), .7, 14, 200 + i).map(g => [g, i % 3 ? 'blossom' : 'blossomwhite'])); });
    L.push([bush(.9, 0, 1.9, 0, .3), 'blossom']); L.push(...blossomBall(V3(0, 1.9, 0), 1.0, 22, 299).map(g => [g, 'blossomdeep']));
    return out(L);
  }, {glit: true});
  add('tf_blossom_branch', AM, 'Treefolk', 'Blossom branch (stick on)', ['treefolk', 'cherry blossom', 'sakura', 'branch', 'flowers'], () => {
    const L = [], br = branchy([0, 0, 0], [0, 1, .3], .8, .1, 2, {spread: 35, kids: 2}); L.push(...br.list.map(g => [g, 'cherrybark']));
    br.tips.forEach((t, i) => L.push(...blossomBall(t.p, .3, 6, 400 + i).map(g => [g, 'blossom']))); return out(L);
  }, {surface: true});
  add('tf_face_blossom', HS, 'Treefolk Faces', 'Sleeping blossom face', ['treefolk', 'cherry blossom', 'sakura', 'calm', 'spirit'], () => {
    const L = []; L.push([wood(ell(.9, 1.2, .85, 0, 1.15, 0, 34, 24), 9, .06, .04, 1.6), 'cherrybark']);
    for (const s2 of [-1, 1]) L.push([sweep([[s2 * .14, 1.22, .82], [s2 * .3, 1.17, .86], [s2 * .46, 1.22, .8]], .03, {seg: 12, rad: 6}), 'darkwood']);
    L.push([sweep([[-.12, .72, .82], [0, .68, .85], [.12, .72, .82]], .025, {seg: 10, rad: 6}), 'darkwood']);
    L.push(...blossomBall(V3(.45, 1.95, .2), .35, 9, 501).map(g => [g, 'blossom']), ...blossomBall(V3(-.35, 2.0, -.1), .3, 7, 502).map(g => [g, 'blossomwhite']));
    for (const s2 of [-1, 1]) L.push([ell(.1, .06, .03, s2 * .42, .95, .74, 10, 6), 'blossomdeep']);
    return out(L);
  });

  return P;
});
