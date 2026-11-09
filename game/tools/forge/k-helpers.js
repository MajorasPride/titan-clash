// Titan Forge helper kit. Works in the browser (pass THREE) and in node tests.
// Usage: const K = makeK(THREE);
function makeK(T) {
  const V3 = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z), V2 = (x = 0, y = 0) => new T.Vector2(x, y), D = Math.PI / 180;
  const bez = (...p) => p.length === 3 ? new T.QuadraticBezierCurve3(...p) : new T.CubicBezierCurve3(...p);
  const cr = pts => new T.CatmullRomCurve3(pts);
  function taper(curve, r0, r1, seg = 24, rad = 10, flat = 1) {
    const pos = [], idx = [], fr = curve.computeFrenetFrames(seg, false);
    for (let i = 0; i <= seg; i++) { const t = i / seg, c = curve.getPointAt(t), r = typeof r0 === 'function' ? r0(t) : r0 + (r1 - r0) * Math.pow(t, .9);
      for (let j = 0; j < rad; j++) { const a = j / rad * Math.PI * 2, N = fr.normals[i], B = fr.binormals[i], ca = Math.cos(a) * flat, sa = Math.sin(a);
        pos.push(c.x + (N.x * ca + B.x * sa) * r, c.y + (N.y * ca + B.y * sa) * r, c.z + (N.z * ca + B.z * sa) * r); } }
    for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * rad + j, b = i * rad + (j + 1) % rad, c = a + rad, d = b + rad; idx.push(a, b, c, b, d, c); }
    const tip = curve.getPointAt(1), bas = curve.getPointAt(0), ti = pos.length / 3; pos.push(tip.x, tip.y, tip.z, bas.x, bas.y, bas.z); const bi = ti + 1;
    for (let j = 0; j < rad; j++) { idx.push(seg * rad + j, seg * rad + (j + 1) % rad, ti); idx.push((j + 1) % rad, j, bi); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  const at = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) => g.applyMatrix4(new T.Matrix4().compose(V3(x, y, z), new T.Quaternion().setFromEuler(new T.Euler(rx, ry, rz)), typeof s === 'number' ? V3(s, s, s) : V3(...s)));
  const shape = pts => { const s = new T.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return s; };
  const extr = (pts, depth = .2, bev = .06, curveSeg = 2) => { const g = new T.ExtrudeGeometry(pts instanceof T.Shape ? pts : shape(pts), {depth, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: curveSeg, curveSegments: 12}); g.translate(0, 0, -depth / 2); return g; };
  const lathe = (pts, seg = 24) => new T.LatheGeometry(pts.map(([x, y]) => V2(x, y)), seg);
  // smooth 3D value noise
  const hash = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
  const sm = t => t * t * (3 - 2 * t);
  function vnoise(x, y, z) { const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), fx = sm(x - X), fy = sm(y - Y), fz = sm(z - Z); let r = 0;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) r += hash(X + i, Y + j, Z + k) * (i ? fx : 1 - fx) * (j ? fy : 1 - fy) * (k ? fz : 1 - fz); return r * 2 - 1; }
  function noise(g, amt = .05, f = 2) { g = g.index ? g : g; if (!g.attributes.normal) g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), d = (vnoise(x * f, y * f, z * f) + .5 * vnoise(x * f * 2.1, y * f * 2.1, z * f * 2.1)) * amt;
      p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d); } p.needsUpdate = true; g.computeVertexNormals(); return g; }
  function merge(gs) { const list = gs.map(g => { g = g.index ? g.toNonIndexed() : g.clone(); if (!g.attributes.normal) g.computeVertexNormals(); return g; });
    const names = ['position', 'normal', 'uv'].filter(a => list.every(g => g.attributes[a])), out = new T.BufferGeometry();
    for (const a of names) { const sz = list[0].attributes[a].itemSize, arr = new Float32Array(list.reduce((s, g) => s + g.attributes[a].array.length, 0)); let o = 0;
      for (const g of list) { arr.set(g.attributes[a].array, o); o += g.attributes[a].array.length; } out.setAttribute(a, new T.BufferAttribute(arr, sz)); } return out; }
  function mirrorX(g) { g = (g.index ? g.toNonIndexed() : g.clone()); g.scale(-1, 1, 1); const p = g.attributes.position.array;
    for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; } g.computeVertexNormals(); return g; }
  const ring = (n, fn) => [...Array(n).keys()].map(i => fn(i, i / n * Math.PI * 2));
  return {V3, V2, D, bez, cr, taper, at, shape, extr, lathe, noise, vnoise, merge, mirrorX, ring};
}
if (typeof module !== 'undefined') module.exports = {makeK}; else window.makeK = makeK;
