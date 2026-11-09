// Mythic Forge: LOW-POLY BUILDS (Nov 9 2026). A part made of polygons you build yourself in Sculpt › 🔷 Low-poly
// (pull faces out, connect, cut loops, weld). Shape data lives in the part: pt.params.poly = {v: [[x,y,z]...], f: [[i,j,k,l]...], mirror}.
// Faces are listed counter-clockwise seen from outside. Each face of n points becomes n-2 triangles, in order (used to know which face you tapped).
(function () {
  const box = (w = 1, h = 1, d = 1, y0 = 0) => { const x = w / 2, z = d / 2; return {v: [[-x, y0, -z], [x, y0, -z], [x, y0, z], [-x, y0, z], [-x, y0 + h, -z], [x, y0 + h, -z], [x, y0 + h, z], [-x, y0 + h, z]],
    f: [[0, 1, 2, 3], [4, 7, 6, 5], [3, 2, 6, 7], [1, 0, 4, 5], [2, 1, 5, 6], [0, 3, 7, 4]]}; };
  const tube = (n = 8, r = .5, h = 1.5) => { const v = [], f = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; v.push([Math.sin(a) * r, 0, Math.cos(a) * r]); }
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; v.push([Math.sin(a) * r, h, Math.cos(a) * r]); }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; f.push([i, j, n + j, n + i]); } f.push([...Array(n).keys()].reverse()); f.push([...Array(n).keys()].map(i => n + i)); return {v, f}; };
  // flat-shaded triangles; mirror = also build the -X copy (faces lying on x=0 are skipped so the halves join)
  function build(T, poly) { const pos = [], add = (P, f, mx) => { const pts = f.map(i => P[i]); for (let k = 1; k < pts.length - 1; k++) { let a = pts[0], b = pts[k], c = pts[k + 1];
      if (mx) { a = [-a[0], a[1], a[2]]; const b2 = [-c[0], c[1], c[2]]; c = [-b[0], b[1], b[2]]; b = b2; } pos.push(...a, ...b, ...c); } };
    for (const f of poly.f) add(poly.v, f, false);
    if (poly.mirror) for (const f of poly.f) { if (f.every(i => Math.abs(poly.v[i][0]) < 1e-4)) continue; add(poly.v, f, true); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g; }
  window.FORGE_POLY = {box, tube, build};
  (window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T) {
    const G = 'Low-Poly Builds', mk = poly => [{geo: build(T, poly), mat: 'paint'}];
    return [{id: 'lp_block', group: G, sub: 'Start shapes', name: 'Low-poly block', tags: ['low poly', 'block', 'build', 'polygon'], params: [], lowpoly: true, makeP: p => mk(p.poly || box()), make: () => mk(box())},
      {id: 'lp_tube', group: G, sub: 'Start shapes', name: 'Low-poly tube (8 sides)', tags: ['low poly', 'tube', 'build', 'polygon'], params: [], lowpoly: true, makeP: p => mk(p.poly || tube()), make: () => mk(tube())}];
  });
})();
