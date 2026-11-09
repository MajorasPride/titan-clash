// Mythic Forge kit helpers (Nov 9 2026, test page). Shared geometry builders for the plug kits (kit-*.js).
// window.makeKit(THREE, K) -> {loft, sec, ell, spike, claw, seg, merge, at, plug, mirrorPlugs, ...}
// Plugs: {id, t: type, p: [x,y,z], d: [x,y,z] (out direction), o: 'frame' | 'out', s: size factor, r: [deg] extra turn, up: 'world'}
(function () {
  window.makeKit = function (T, K) {
    const V3 = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);
    const ss = (c, n) => Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    // smooth a list of section objects by Catmull-Rom on each number field
    function smooth(secs, per = 4) { if (secs.length < 3) return secs; const out = [], keys = Object.keys(secs[0]).filter(k => typeof secs[0][k] === 'number');
      const cr = (a, b, c, d, t) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
      for (let i = 0; i < secs.length - 1; i++) for (let j = 0; j < per; j++) { const t = j / per, o = {}; for (const k of keys) { const g = q => (secs[Math.max(0, Math.min(secs.length - 1, q))][k] ?? secs[0][k]); o[k] = cr(g(i - 1), g(i), g(i + 1), g(i + 2), t); } out.push(o); }
      out.push({...secs[secs.length - 1]}); return out; }
    // loft along an axis: sections {a (position along axis), w (half width x), t (up half), b (down half), y (center offset on the up axis), x (center offset on x), n (squareness 2 = round, 4 = boxy)}
    // axis 'z' (heads: up = +Y) or 'y' (limbs / segments: up = +Z)
    function loft(secs, o = {}) { const S = o.raw ? secs : smooth(secs, o.per || 4), R = o.rad || 28, axis = o.axis || 'z', pos = [], idx = [];
      for (const s of S) { const n = s.n || 2.2; for (let j = 0; j < R; j++) { const a = j / R * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), u = ss(c, n) * s.w + (s.x || 0), v = (sn >= 0 ? s.t : s.b) * ss(sn, n) + (s.y || 0);
          if (axis === 'z') pos.push(u, v, s.a); else pos.push(u, s.a, v); } }
      for (let i = 0; i < S.length - 1; i++) for (let j = 0; j < R; j++) { const a = i * R + j, b = i * R + (j + 1) % R, c = a + R, d = b + R; if (axis === 'z') idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d); }
      const cap = (i, flip) => { const s = S[i], ci = pos.length / 3; if (axis === 'z') pos.push(s.x || 0, s.y || 0, s.a); else pos.push(s.x || 0, s.a, s.y || 0);
        for (let j = 0; j < R; j++) { const a = i * R + j, b = i * R + (j + 1) % R; if ((axis === 'z') !== flip) idx.push(ci, b, a); else idx.push(ci, a, b); } };
      if (o.cap0 !== false) cap(0, false); if (o.cap1 !== false) cap(S.length - 1, true);
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      if (o.noise) K.noise(g, o.noise[0], o.noise[1]); return g; }
    const ell = (rx, ry, rz, x = 0, y = 0, z = 0, seg = 18) => new T.SphereGeometry(1, seg, Math.max(8, seg * .6 | 0)).scale(rx, ry, rz).translate(x, y, z);
    // tapered horn / spike from origin along +Y, curling toward -Z (curl) and +X (out)
    const spike = (L, r, curl = .15, out = 0, seg = 12, rad = 10, flat = 1) => K.taper(K.bez(V3(0, 0, 0), V3(out * L * .3, L * .5, -curl * L * .2), V3(out * L, L, -curl * L)), r, r * .04, seg, rad, flat);
    // a claw: hooked toward +Z, base at origin, along +Y
    const claw = (L, r, hook = .45, flat = .7) => K.taper(K.bez(V3(0, 0, 0), V3(0, L * .55, L * .05), V3(0, L * .95, hook * L * .55)), r, r * .05, 14, 10, flat);
    // capsule segment from origin along +Y
    const seg = (L, r0, r1 = r0, z = 0) => K.taper(K.bez(V3(0, 0, z), V3(0, L * .5, z), V3(0, L, z)), t => (r0 + (r1 - r0) * t) * (.86 + .14 * Math.sin(Math.PI * Math.min(1, t * 1.05))), 0, 10, 12);
    const at = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) => K.at(g, x, y, z, rx * K.D, ry * K.D, rz * K.D, s);
    const merge = gs => K.merge(gs.filter(Boolean).map(g => g.index ? g.toNonIndexed() : g));
    // orient a geometry built along +Y so +Y follows dir (and -Z stays as close to `back` as possible)
    function orient(g, p, dir, back = [0, 0, -1]) { const Y = V3(...dir).normalize(), B = V3(...back), Z = B.clone().negate(); Z.addScaledVector(Y, -Z.dot(Y)); if (Z.lengthSq() < 1e-6) Z.set(1, 0, 0); Z.normalize(); const X = V3().crossVectors(Y, Z);
      g.applyMatrix4(new T.Matrix4().makeBasis(X, Y, Z).setPosition(p[0], p[1], p[2])); return g; }
    const plug = (id, t, p, d = [0, 1, 0], o = 'out', ex = {}) => ({id, t, p, d, o, ...ex});
    // L/R pair from a right-side (+X) plug
    const pair = (id, t, p, d, o = 'out', ex = {}) => [plug(id + 'R', t, [Math.abs(p[0]), p[1], p[2]], [Math.abs(d[0]), d[1], d[2]], o, {...ex, side: 'R', pairOf: id + 'L'}),
      plug(id + 'L', t, [-Math.abs(p[0]), p[1], p[2]], [-Math.abs(d[0]), d[1], d[2]], o, {...ex, side: 'L', pairOf: id + 'R'})];
    const P = (geo, mat, num) => num != null ? {geo, mat, num} : {geo, mat};
    // flat panel (polygon in the XY plane, thickness th) - wing membranes, vein cells, feathers
    function panel(pts, th = .03, bow = 0) { const sh = new T.Shape(pts.map(p => new T.Vector2(p[0], p[1]))), g = new T.ExtrudeGeometry(sh, {depth: th, bevelEnabled: false, curveSegments: 4}); g.translate(0, 0, -th / 2);
      if (bow) { const a = g.attributes.position; for (let i = 0; i < a.count; i++) { const x = a.getX(i), y = a.getY(i); a.setZ(i, a.getZ(i) - bow * Math.sin(Math.min(1, Math.hypot(x, y) / 8) * Math.PI) * .5); } g.computeVertexNormals(); } return g; }
    // feather: quill along +Y with a vane, length L, width W
    function feather(L, W, curve = .08) { const pts = []; const N = 10; for (let i = 0; i <= N; i++) { const t = i / N; pts.push([W * Math.sin(Math.PI * Math.pow(t, .7)) * (t < .95 ? 1 : .3), t * L]); }
      for (let i = N; i >= 0; i--) { const t = i / N; pts.push([-W * .55 * Math.sin(Math.PI * Math.pow(t, .7)), t * L]); }
      const g = panel(pts, .025); const a = g.attributes.position; for (let i = 0; i < a.count; i++) { const y = a.getY(i); a.setZ(i, a.getZ(i) - curve * y * y / L); } g.computeVertexNormals(); return g; }
    return {V3, smooth, loft, ell, spike, claw, seg, at, merge, orient, plug, pair, P, panel, feather, ss};
  };
})();
