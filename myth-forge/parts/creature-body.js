/* Titan Forge parts - creature body (bd_). Classic script, not a module.
   Orientation: attach point at origin, part grows +Y.
   Necks/spines: front (throat) +Z, dorsal -Z.  Torsos: hips at origin, up +Y, belly +Z.
   Arms/legs: +Y from shoulder/hip to wrist/foot; elbows/knees flex toward +Z; feet: toes +Z, sole faces +Y.
   Hands: wrist at origin, fingers +Y, palm (curl side) +Z.  Tails: +Y out, dorsal +Z.
   Wings: +Y out of shoulder blade, membrane spreads toward +X, thickness along Z.
   Back plates: +Y out of the back, rows run along Z (+Z = toward the head). */
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  'use strict';
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

  // ---------- shared builders ----------
  function finger(lens, r, bends, o = {}) {
    const pts = [V3()]; let a = 0, p = V3();
    lens.forEach((l, i) => { a += (bends[i] || 0) * D; p = p.clone().add(V3(0, cos(a) * l, sin(a) * l)); pts.push(p); });
    const fr = fracs(pts), tr = o.taper == null ? .38 : o.taper, kn = o.knuckle == null ? .13 : o.knuckle;
    const rf = t => r * (1 - tr * t) * (1 + kn * fr.slice(1, -1).reduce((s, f) => s + gauss(t, f, .05), 0));
    const skin = [sweep(pts, rf, {seg: 9 * lens.length, rad: o.rad || 12, ref: [1, 0, 0], sy: o.flat || 1})];
    const d = V3(0, cos(a), sin(a)), n = V3(0, -sin(a), cos(a)), tipR = r * (1 - tr), cl = [];
    skin.push(ell(tipR * (o.flat || 1), tipR, tipR, p.x, p.y, p.z, 12, 8));
    if (o.claw) cl.push(place(claw(o.claw, tipR * (o.clawR || 1.05), o.curl || 1, o.clawFlat || .55), p.clone().addScaledVector(n, -tipR * .3).addScaledVector(d, -tipR * .2), d, n));
    if (o.pad) skin.push(ell(tipR * 1.1, tipR * 1.15, tipR * .5, p.x, p.y, p.z + tipR * .55, 12, 8));
    return {skin, claw: cl, pts, tip: p, d, n};
  }
  // hand: wrist origin, fingers +Y, palm +Z. o.fingers [{x,y,z,spread,len,r,bends,claw,...}], o.thumb {pos,dir,up,...}
  function hand(o) {
    const S = [], C = [], [pw, pl, pt] = o.palm, F = [];
    S.push(nz(ell(pw, pl * .62, pt, 0, pl * .5, 0, 22, 14), .015, 4));
    S.push(sweep([[0, -.05, 0], [0, pl * .45, 0]], pw * .55, {seg: 6, rad: 16, sy: pt / pw * 1.2}));
    const doF = (f, base, d, up) => { const R = finger(f.len, f.r, f.bends, f), m = pm(base, d, up); R.skin.forEach(g => g.applyMatrix4(m)); R.claw.forEach(g => g.applyMatrix4(m)); S.push(...R.skin); C.push(...R.claw); R.wpts = R.pts.map(q => q.clone().applyMatrix4(m)); F.push(R); return R; };
    (o.fingers || []).forEach(f => { const sp = (f.spread || 0) * D; doF(f, V3(f.x, f.y == null ? pl * .95 : f.y, f.z || 0), V3(sin(sp), cos(sp), f.dz || 0), [0, 0, 1]); });
    if (o.thumb) doF(o.thumb, v(o.thumb.pos), v(o.thumb.dir), o.thumb.up || [-1, 0, 1]);
    return {S, C, F};
  }

  // membrane wing (bat / dragon). Points in units * s. fingers [{a deg, L, bend}]
  function memWing(o) {
    const s = o.s || 1, sc = q => v(q).multiplyScalar(s), O = V3(), E = sc(o.E), W = sc(o.W), Fp = sc(o.F || [o.E[0] * .4, -.8, 0]);
    const R = (o.r || .16) * s, bm = o.boneMat || 'skin', G = [], MB = [], CL = [];
    G.push([limb([O, O.clone().lerp(E, .45).add(V3(0, 0, .04 * s)), E, E.clone().lerp(W, .5), W], [R * 1.6, R * 1.15, R * .95, R * .72, R * .62], {seg: 40, rad: 14}), bm]);
    G.push([[ell(R * 1.05, R * 1.05, R, E.x, E.y, E.z, 14, 10), ell(R * .85, R * .85, R * .8, W.x, W.y, W.z, 14, 10), ell(R * 1.7, R * 1.6, R * 1.5, 0, 0, 0, 16, 10)], bm]);
    const edges = [];
    o.fingers.forEach((f, k) => {
      const pts = [W.clone()]; let a = f.a * D, p = W.clone();
      for (let i = 0; i < 3; i++) { a -= (f.bend == null ? 8 : f.bend) * D * (i ? 1 : .3); p = p.clone().add(V3(cos(a), sin(a), (f.z || 0) / 3).multiplyScalar(f.L * s / 3)); pts.push(p); }
      const c = crv(pts); edges.push(c);
      G.push([sweep(c, t => R * lerp(.6, .14, t) * (1 + (o.knobs ? .5 : .18) * (gauss(t, .34, .035) + gauss(t, .67, .035))), {seg: 34, rad: 9}), bm]);
      if (o.knobs) pts.slice(1, 3).forEach(q => G.push([ell(R * .45, R * .45, R * .45, q.x, q.y, q.z, 10, 8), bm]));
      if (o.tipClaw) CL.push(place(claw(.32 * s, R * .3, 1, .6), p, V3(cos(a), sin(a), 0), [0, 0, -1]));
    });
    if (o.thumb !== false) { const ta = (o.thumbA || 100) * D; CL.push(place(claw(.5 * s * (o.thumb || 1), R * .55, 1.2, .6), W, V3(cos(ta), sin(ta), .2), [cos(ta - 1.4), sin(ta - 1.4), 0])); }
    edges.push(crv([W, E.clone().lerp(W, .15), E, Fp]));
    if (o.membrane !== false) {
      const th = (o.th || .035) * s, bil = o.billow == null ? .07 : o.billow, sag = o.sag == null ? .28 : o.sag;
      for (let k = 0; k < edges.length - 1; k++) {
        const A = edges[k], Bc = edges[k + 1], sg = k === edges.length - 2 ? (o.sagLast == null ? sag * 1.15 : o.sagLast) : sag;
        MB.push(sheet((u, w) => {
          let uu = u * (1 - sg * 4 * w * (1 - w));
          if (o.torn) uu *= 1 - o.torn * pow(u, 3) * (.5 + .5 * K.vnoise(w * 7 + k * 5.3, 1.7, k)) * (.15 + 4 * w * (1 - w));
          uu = clamp(uu, 0, 1); const a = A.getPointAt(uu), b = Bc.getPointAt(uu), p = a.clone().lerp(b, w);
          p.z += bil * sin(PI * w) * sin(PI * min(1, uu * 1.1)) * a.distanceTo(b); return p;
        }, o.nu || 16, o.nv || 8, th, {skip: o.holes ? (u, w) => u > .2 && K.vnoise(u * 5 + k * 3.1, w * 4.3, k * 1.7) > o.holes : null}));
      }
      const arm = crv([O, E, W]), chord = new T.LineCurve3(O.clone().add(V3(0, .15 * s, 0)), W);
      MB.push(sheet((u, w) => arm.getPointAt(u).lerp(chord.getPointAt(u), w * (1 - .2 * sin(PI * u))), 14, 4, th));
    }
    G.push([MB, o.memMat || 'membrane'], [CL, o.clawMat || 'horn']);
    if (o.fur) G.push([nz(ell(R * 2.6, R * 2.4, R * 2.2, R * .6, R * .8, 0, 18, 12), .05, 6), 'fur']);
    return G;
  }

  // feather: base at origin, along +Y, flat in XY, cupped toward -Z
  function featherG(L, w, o = {}) {
    const tp = o.tip || 3, cam = o.cam == null ? .25 : o.cam, bend = o.bend == null ? .05 : o.bend;
    return sheet((u, q) => { const x = (q - .5) * 2, sh = sqrt(sstep(0, .16, u)) * pow(max(0, 1 - pow(u, tp)), .55), ww = w * sh * (x < 0 ? .7 : 1); return V3(x * ww, u * L, -cam * ww * x * x + bend * L * u * u); },
      o.nu || 8, o.nv || 4, o.th || max(.012, L * .01), {nrm: [0, 0, 1]});
  }
  function featherWing(o) {
    const s = o.s || 1, sc = a => v(a).multiplyScalar(s), O = V3(), E = sc(o.E), W = sc(o.W), H = sc(o.H), R = (o.r || .2) * s, FE = [], CV = [];
    const arm = limb([O, E, W, H], [R * 1.7, R * 1.2, R * .85, R * .3], {seg: 44, rad: 14});
    const perp = d => V3(d.y, -d.x, 0).normalize();
    const hd = H.clone().sub(W).normalize(), fd = W.clone().sub(E).normalize(), ud = E.clone().sub(O).normalize();
    const row = (A, B, n, dirF, lenF, wF, z, list, tip) => { for (let i = 0; i < n; i++) { const t = n < 2 ? 0 : i / (n - 1), L = lenF(t) * s, g = featherG(L, wF(t) * s, {tip: tip || 3, bend: o.bend == null ? .05 : o.bend}); place(g, A.clone().lerp(B, t).add(V3(0, 0, (z + i * .008) * s)), dirF(t), [0, 0, 1]); list.push(g); } };
    row(W, H, o.np || 10, t => perp(hd).lerp(hd, lerp(.15, o.pSpread || .85, pow(t, 1.2))).normalize(), t => o.Lp * lerp(.78, 1, sstep(0, .8, t)) * (t > .92 ? .93 : 1), t => (o.wp || .3) * (o.finger && t > .55 ? .62 : 1), 0, FE, o.ptip || 3);
    row(E, W, o.ns || 10, t => perp(fd).lerp(fd, lerp(0, .15, t)).normalize(), t => o.Ls * lerp(.9, 1, t), () => o.ws || .3, -.03, FE, 2.2);
    row(O.clone().lerp(E, .12), E, o.nt || 5, t => perp(ud).lerp(perp(fd), t).normalize(), t => o.Ls * lerp(.55, .85, t), () => (o.ws || .3) * 1.1, -.06, FE, 2);
    const ad = t => fd.clone().lerp(hd, sstep(.45, .85, t)).normalize();
    row(O.clone().lerp(E, .2), W.clone().lerp(H, .75), o.nc || 18, t => perp(ad(t)).lerp(ad(t), .3).normalize(), t => o.Ls * .5 * lerp(.8, 1, t), () => (o.ws || .3) * .9, .05, CV, 2);
    row(O.clone().lerp(E, .3), W.clone().lerp(H, .45), o.nc2 || 15, t => perp(ad(t)).lerp(ad(t), .35).normalize(), t => o.Ls * .28, () => (o.ws || .3) * .7, .1, CV, 1.8);
    return [[[arm, ell(R * 1.9, R * 1.8, R * 1.6, 0, 0, 0, 16, 10)], o.mat || 'feather'], [FE, o.mat || 'feather'], [CV, o.mat2 || o.mat || 'feather']];
  }
  // polar fan sheet in XY from origin; Rf(aDeg) outline radius
  function fan(a0, a1, Rf, o = {}) {
    return sheet((u, w) => { const ad = lerp(a0, a1, w), a = ad * D, R = Rf(ad); return V3(cos(a) * R * u, sin(a) * R * u, o.z ? o.z(u, w, R) : .06 * sin(PI * u) * R * sin(PI * w)); }, o.nu || 14, o.nv || 18, o.th || .025, {nrm: [0, 0, 1]});
  }
  const fanPt = (a, Rf, u, o = {}) => { const R = Rf(a), w = 0; return V3(cos(a * D) * R * u, sin(a * D) * R * u, 0); };
  function veinsFan(angles, Rf, r, a0, a1) { return angles.map(a => { const pts = [0, .33, .66, .97].map(u => { const p = fanPt(a, Rf, u); const w = (a - a0) / (a1 - a0); p.z = .06 * sin(PI * u) * Rf(a) * sin(PI * w) + .015; return p; }); return sweep(pts, t => r * (1 - .6 * t), {seg: 14, rad: 5}); }); }
  // long blade sheet along +Y, width toward local +X
  const blade = (L, Wf, o = {}) => sheet((u, w) => V3(w * Wf(u), u * L, (o.cz || 0) * sin(PI * u) * (1 - w) + (o.cw || 0) * w * w), o.nu || 22, o.nv || 5, o.th || .02, {nrm: [0, 0, 1]});

  // vertebra: centrum along +Y (height h), spinous process toward -Z (dorsal), slanting to -Y
  function vertebra(r, h, o = {}) {
    const lo = o.lo, gs = [];
    gs.push(lth(lo ? [[.001, 0], [r * .85, 0], [r, h * .15], [r * .8, h * .5], [r, h * .85], [r * .85, h], [.001, h]] : dens([[.001, 0], [r * .85, 0], [r, h * .12], [r * .8, h * .5], [r, h * .88], [r * .85, h], [.001, h]], 14), lo ? 10 : 14));
    gs.push(sweep([[-r * .7, h * .5, -r * .5], [0, h * .5, -r * 1.25], [r * .7, h * .5, -r * .5]], r * .2, {seg: lo ? 6 : 8, rad: lo ? 5 : 6}));
    gs.push(place(horn(r * (o.spine || 2.2), r * .32, .5, {seg: lo ? 6 : 8, rad: lo ? 5 : 6, flat: .45}), [0, h * .5, -r * 1.1], [0, -.3, -1], [0, -1, 0]));
    if (o.trans !== false) for (const sd of [-1, 1]) gs.push(place(horn(r * (o.trans || 1.3), r * .2, .2, {seg: lo ? 5 : 6, rad: 5, flat: .6}), [sd * r * .75, h * .5, -r * .25], [sd, -.1, -.25], [0, -1, 0]));
    return gs;
  }
  // chain of vertebrae along curve; dorsal side = ref direction
  function spineChain(c, n, s0, s1, ref, o = {}) {
    const gs = [], fr = frameFn(c, ref, o.pt), L = c.getLength() / n, disc = [];
    for (let i = 0; i < n; i++) { const t = (i + .5) / n, f = fr(t), s = lerp(s0, s1, i / max(1, n - 1)), r = (o.r || .3) * s, h = L * (o.fill || .8);
      const vg = vertebra(r, h, {lo: o.lo, spine: o.spine, trans: o.trans}); place(vg, f.p.clone().addScaledVector(f.T, -h / 2), f.T, f.U.clone().negate()); gs.push(...vg);
      if (o.discs && i < n - 1) { const f2 = fr((i + 1) / n), dg = ell(r * .8, L * .16, r * .8, 0, 0, 0, 12, 6); place(dg, f2.p, f2.T, f2.U); disc.push(dg); } }
    return {bone: gs, disc};
  }
  function spikeRow(fr, rf, n, t0, t1, lenF, rF, tilt = 35, curve = .4, fl = 1, o = {}) {
    const gs = []; for (let i = 0; i < n; i++) { const t = lerp(t0, t1, n < 2 ? 0 : i / (n - 1)), f = fr(t), r = rf(t), U = o.side ? f.U.clone().multiplyScalar(cos(o.side)).addScaledVector(f.S, sin(o.side)) : f.U;
      const d = U.clone().multiplyScalar(cos(tilt * D)).addScaledVector(f.T, -sin(tilt * D)); const g = horn(lenF(t), rF(t), curve, {flat: fl, seg: 10, rad: 8}); place(g, f.p.clone().addScaledVector(U, r * .8), d, f.T.clone().negate()); gs.push(g); }
    return gs;
  }
  function bellyPlates(fr, rf, n, t0, t1, len, w = 1) {
    const gs = []; for (let i = 0; i < n; i++) { const t = lerp(t0, t1, (i + .5) / n), f = fr(t), r = rf(t), sl = len * (t1 - t0) / n;
      const g = ell(r * .8 * w, sl * .64, r * .2, 0, 0, 0, 16, 6); g.rotateX(.15); place(g, f.p.clone().addScaledVector(f.U, -r * .84), f.T, f.U.clone().negate()); gs.push(g); }
    return gs;
  }
  // crab / scorpion chela along +Y (pinch along X)
  function pincer(o = {}) {
    const b = o.bulb || 1, fl = o.fl || 1.6, fr = o.fr || 1, C = [], Hn = [];
    C.push(nz(lth(dens([[.001, 0], [.32, 0], [.5, .25], [.78 * b, .75], [.82 * b, 1.15], [.62, 1.5], [.4, 1.68], [.001, 1.72]], 40), 28, 1, o.pz || .72), .025, 3));
    const fx = sweep([[-.3, 1.4, 0], [-.36, 1.4 + fl * .4, 0], [-.24, 1.4 + fl * .78, 0], [.06, 1.4 + fl, 0]], t => lerp(.3 * fr, .025, pow(t, .9)), {seg: 26, rad: 12, ref: [0, 0, 1], sy: .7});
    const dc = sweep([[.3, 1.5, 0], [.38, 1.5 + fl * .4, 0], [.26, 1.5 + fl * .76, 0], [-.02, 1.5 + fl * .97, 0]], t => lerp(.27 * fr, .025, pow(t, .9)), {seg: 26, rad: 12, ref: [0, 0, 1], sy: .7});
    const ft = [], dt = [], cf = crv([[-.3, 1.4, 0], [-.36, 1.4 + fl * .4, 0], [-.24, 1.4 + fl * .78, 0], [.06, 1.4 + fl, 0]]), cd = crv([[.3, 1.5, 0], [.38, 1.5 + fl * .4, 0], [.26, 1.5 + fl * .76, 0], [-.02, 1.5 + fl * .97, 0]]);
    for (let k = 0; k < (o.teeth || 6); k++) { const t = .18 + k * .11, p = cf.getPointAt(t), r = lerp(.3 * fr, .03, t) * .8; ft.push(place(cone(.13 * fr, .05 * fr, 6), p.clone().add(V3(r, 0, 0)), [1, .3, 0], [0, 0, 1]));
      const q = cd.getPointAt(t + .04), r2 = lerp(.27 * fr, .03, t) * .8; dt.push(place(cone(.11 * fr, .045 * fr, 6), q.clone().add(V3(-r2, 0, 0)), [-1, .3, 0], [0, 0, 1])); }
    const hinge = new T.Matrix4().makeTranslation(.3, 1.5, 0).multiply(new T.Matrix4().makeRotationZ(-(o.open == null ? 12 : o.open) * D)).multiply(new T.Matrix4().makeTranslation(-.3, -1.5, 0));
    [dc, ...dt].forEach(g => g.applyMatrix4(hinge));
    C.push(fx, dc, ell(.2, .2, .2, .3, 1.5, 0, 10, 8)); Hn.push(...ft, ...dt);
    const s = o.s || 1; [...C, ...Hn].forEach(g => g.scale(s, s, s));
    return {C, Hn};
  }
  function longBone(L, r, o = {}) {
    const pr = [[.001, 0], [r * 1.25, L * .008], [r * 1.8, L * .05], [r * 1.55, L * .11], [r * 1.05, L * .2], [r * .9, L * .5], [r * 1.05, L * .8], [r * 1.55, L * .89], [r * 1.8, L * .95], [r * 1.25, L * .992], [.001, L]];
    const g = o.lo ? lth([[.001, 0], [r * 1.5, L * .04], [r * 1.2, L * .15], [r * .9, L * .5], [r * 1.2, L * .85], [r * 1.5, L * .96], [.001, L]], 9, 1, .85) : nz(lth(dens(pr, 40), 22, 1, .82), r * .05, 3);
    const gs = [g]; if (o.condyles) for (const sd of [-1, 1]) gs.push(ell(r * 1.05, r * 1.0, r * 1.2, sd * r * .85, L - r * .4, 0, 14, 10));
    return gs;
  }
  // hex crystal along +Y (flat shaded)
  const crystal = (h, r, sides = 6) => flat(lth([[.001, -.05], [r, 0], [r * 1.08, h * .7], [.001, h]], sides));
  function ribcage(s = 1, o = {}) {
    const B = [], sp = crv([[0, 0, -1.0 * s], [0, 2.2 * s, -1.15 * s], [0, 4.4 * s, -.9 * s]]), ch = spineChain(sp, 11, 1, .8, [0, 0, -1], {r: .26 * s, lo: true, fill: .82});
    B.push(...ch.bone); const n = o.n || 9;
    for (let i = 0; i < n; i++) { const y = s * (4.0 - i * .38), w = s * (.85 + .6 * sin(PI * (i + 1.5) / (n + 1))), fl = i >= n - 2;
      for (const sd of [-1, 1]) { const pts = [[sd * .22 * s, y, -1.0 * s], [sd * w * .95, y - .15 * s, -.72 * s], [sd * w * 1.1, y - .45 * s, .1 * s], [sd * w * .78, y - .8 * s, .82 * s], [sd * .24 * s, y - .9 * s, 1.08 * s]];
        B.push(sweep(fl ? pts.slice(0, 4) : pts, t => .085 * s * (1 - .3 * t), {seg: 22, rad: 7, ref: [0, 1, 0], sx: .55, sy: 1.5})); } }
    B.push(sweep([[0, 3.25 * s, 1.1 * s], [0, 2.3 * s, 1.18 * s], [0, 1.2 * s, 1.0 * s]], t => .17 * s * (1 - .5 * t * t), {seg: 18, rad: 10, sx: 1.6, sy: .45}));
    return B;
  }

  // ---------- parts ----------
  const parts = [], add = (id, group, sub, name, tags, make) => parts.push({id: 'bd_' + id, group, sub, name, tags, make});
  const NS = 'Necks & Spines', TB = 'Torsos & Bellies', AS = 'Arms & Shoulders', HC = 'Hands & Claws', LF = 'Legs & Feet', TL = 'Tails', WG = 'Wings', BA = 'Back & Armor Plates', TE = 'Tentacles & Extra Limbs', BS = 'Bones & Skeleton';

  // ===== Necks & Spines =====
  add('neck_serpent', NS, 'Necks', 'Serpent neck', ['snake', 'naga', 'scaled', 'long'], () => {
    const c = crv([[0, 0, 0], [0, 1.2, .45], [0, 2.4, -.25], [0, 3.6, .25], [0, 4.6, .85]]), rf = t => lerp(.72, .44, t), ref = [0, 0, -1];
    const g = sweep(c, t => rf(t) * grooves(26, .03, 14)(t), {seg: 110, rad: 22, ref, prof: a => 1 + .08 * pow(max(0, sin(a)), 10) - .07 * pow(max(0, -sin(a)), 2)});
    return out([[nz(g, .012, 8), 'scale'], [bellyPlates(frameFn(c, ref), rf, 18, .03, .97, c.getLength(), .9), 'leather']]);
  });
  add('neck_dragon', NS, 'Necks', 'Dragon neck', ['dragon', 'spikes', 'long', 'd&d'], () => {
    const c = crv([[0, 0, 0], [0, 1.4, -.4], [0, 3.0, -.3], [0, 4.4, .4], [0, 5.3, 1.5]]), rf = t => lerp(.9, .42, pow(t, .8)), ref = [0, 0, -1], fr = frameFn(c, ref);
    const body = sweep(c, rf, {seg: 120, rad: 22, ref, prof: a => 1 + .12 * pow(max(0, sin(a)), 14) - .06 * pow(max(0, -sin(a)), 2)});
    return out([[nz(body, .015, 6), 'scale'], [spikeRow(fr, rf, 11, .04, .94, t => lerp(.75, .3, t), t => lerp(.14, .07, t), 38, .5, .5), 'horn'], [bellyPlates(fr, rf, 18, .02, .97, c.getLength(), .95), 'leather']]);
  });
  add('neck_bull', NS, 'Necks', 'Bull neck (thick)', ['beast', 'muscle', 'hump', 'short'], () => {
    const c = crv([[0, 0, 0], [0, .7, .15], [0, 1.5, .55]]);
    const g = sweep(c, t => lerp(1.2, .8, sstep(0, 1, t)), {seg: 40, rad: 30, ref: [0, 0, -1], sx: 1.12,
      prof: (a, t) => (1 + .35 * pow(max(0, sin(a)), 1.5) * gauss(t, .3, .32) + .12 * pow(max(0, -sin(a)), 3) * gauss(t, .55, .3)) * (1 - .03 * pow(abs(sin(t * 6 * PI)), 6) * max(0, -sin(a)))});
    return out([[nz(g, .05, 2.5), 'skin']]);
  });
  add('neck_bird', NS, 'Necks', 'Bird neck with ruff', ['bird', 'griffin', 'feather', 'long'], () => {
    rs(11); const c = crv([[0, 0, 0], [0, .9, -.35], [0, 1.9, .15], [0, 2.7, .1], [0, 3.3, .5]]), rf = t => lerp(.34, .2, t) * (1 + .3 * gauss(t, 0, .15)), ref = [0, 0, -1], fr = frameFn(c, ref);
    const fs = []; [[.03, 22, .8, .2], [.12, 18, .6, .16], [.22, 16, .45, .13]].forEach(([t, n, L, w], k) => { const f = fr(t), r = rf(t);
      for (let i = 0; i < n; i++) { const a = i / n * TAU + k * .14, rd = f.S.clone().multiplyScalar(cos(a)).addScaledVector(f.U, sin(a)), g = featherG(L * rr(.85, 1.1), w, {tip: 2.2, cam: .2, bend: -.1});
        place(g, f.p.clone().addScaledVector(rd, r * .8), f.T.clone().multiplyScalar(.75).addScaledVector(rd, .6), rd); fs.push(g); } });
    return out([[nz(sweep(c, rf, {seg: 70, rad: 16, ref}), .01, 8), 'feather'], [fs, 'feather']]);
  });
  add('neck_insect', NS, 'Necks', 'Segmented insect neck', ['bug', 'chitin', 'segmented'], () => {
    const c = crv([[0, 0, 0], [0, 1.6, .25], [0, 3.2, .75]]), n = 5, ref = [0, 0, -1], fr = frameFn(c, ref), L = c.getLength() / n, seg = [], sp = [];
    for (let i = 0; i < n; i++) { const f = fr((i + .5) / n), s = lerp(1, .78, i / (n - 1));
      const g = lth(dens([[.001, 0], [.34, 0], [.46, .1], [.52, .34], [.47, .58], [.36, .68], [.001, .7]].map(([r, y]) => [r * s, y * L / .72]), 24), 22, 1.1, .95);
      place(g, f.p.clone().addScaledVector(f.T, -L * .47), f.T, f.U.clone().negate()); seg.push(g);
      for (const sd of [-1, 1]) { const rd = f.U.clone().multiplyScalar(cos(.5)).addScaledVector(f.S, sd * sin(.5)); sp.push(place(horn(.38 * s, .07 * s, .5, {seg: 8, rad: 7}), f.p.clone().addScaledVector(f.T, L * .12).addScaledVector(rd, .45 * s), rd.clone().addScaledVector(f.T, -.4), f.T.clone().negate())); } }
    return out([[seg, 'chitin'], [sweep(c, .28, {seg: 30, rad: 12}), 'flesh'], [sp, 'horn']]);
  });
  add('neck_turtle', NS, 'Necks', 'Wrinkled turtle neck', ['turtle', 'tortoise', 'wrinkles'], () => {
    const c = crv([[0, 0, 0], [0, 1.0, .3], [0, 1.9, .15], [0, 2.6, .55]]);
    const g = sweep(c, t => lerp(.66, .42, t), {seg: 64, rad: 26, ref: [0, 0, -1], prof: (a, t) => 1 + .045 * sin(t * 70 + sin(a * 3) * 1.8) * (.6 + .4 * cos(a * 2))});
    const folds = [0, 1].map(k => { const tg = new T.TorusGeometry(.68 + k * .05, .14 - k * .035, 12, 40); tg.rotateX(PI / 2); tg.translate(0, .1 + k * .3, .04 * k); return nz(tg, .03, 5); });
    return out([[[nz(g, .03, 5), ...folds], 'skin']]);
  });
  add('neck_sauropod', NS, 'Necks', 'Titan long neck', ['sauropod', 'dinosaur', 'very long', 'brachio'], () => {
    const c = crv([[0, 0, 0], [0, 2.2, -.6], [0, 4.5, -.4], [0, 6.3, .5], [0, 7.2, 1.6]]);
    const g = sweep(c, t => lerp(1.05, .33, pow(t, .7)), {seg: 130, rad: 22, ref: [0, 0, -1], prof: (a, t) => 1 + .09 * pow(max(0, sin(a)), 6) * (.5 + .5 * cos(t * 16 * TAU)) - .05 * pow(max(0, -sin(a)), 2)});
    return out([[nz(g, .02, 3), 'skin']]);
  });
  add('neck_maned', NS, 'Necks', 'Maned beast neck', ['lion', 'horse', 'mane', 'fur'], () => {
    rs(7); const c = crv([[0, 0, 0], [0, 1.2, .1], [0, 2.4, .5], [0, 3.2, 1.0]]), rf = t => lerp(.95, .58, t), ref = [0, 0, -1], fr = frameFn(c, ref), mane = [];
    for (let i = 0; i < 46; i++) { const t = rr(0, .92), f = fr(t), sd = rr(-.9, .9), U = f.U.clone().multiplyScalar(cos(sd)).addScaledVector(f.S, sin(sd)), L = rr(.9, 1.5) * (1.1 - t * .4);
      const d = U.clone().multiplyScalar(.55).addScaledVector(f.T, -.7).add(V3(0, 0, -.2)), p0 = f.p.clone().addScaledVector(U, rf(t) * .8);
      const p1 = p0.clone().addScaledVector(d, L * .5), p2 = p0.clone().addScaledVector(d, L).add(V3(0, -.25 * L, -.1));
      mane.push(sweep([p0, p1, p2], tt => .16 * (1 - tt) + .01, {seg: 8, rad: 6, sy: .5, ref: [0, 0, -1]})); }
    return out([[nz(sweep(c, rf, {seg: 60, rad: 22, ref}), .03, 3), 'fur'], [mane, 'fur']]);
  });
  // spines
  add('spine_vertebrae', NS, 'Spines', 'Vertebra chain', ['bone', 'skeleton', 'undead', 'spine'], () => {
    const c = crv([[0, 0, 0], [0, 1.5, .2], [0, 3, -.1], [0, 4.5, .25], [0, 5.6, .75]]), ch = spineChain(c, 16, 1, .6, [0, 0, -1], {r: .32, discs: true});
    return out([[ch.bone, 'bone'], [ch.disc, 'flesh']]);
  });
  add('spine_serpent', NS, 'Spines', 'Serpent spine with ribs', ['bone', 'snake', 'undead', 'long'], () => {
    const c = crv([[0, 0, 0], [0, 1.8, .6], [0, 3.6, -.4], [0, 5.4, .5], [0, 7.0, .2]]), n = 22, fr = frameFn(c, [0, 0, -1]), L = c.getLength() / n, B = [];
    for (let i = 0; i < n; i++) { const f = fr((i + .5) / n), s = lerp(1, .45, i / (n - 1)), r = .26 * s, h = L * .82, vg = vertebra(r, h, {lo: true});
      for (const sd of [-1, 1]) vg.push(sweep([[sd * r * .7, h * .5, -r * .2], [sd * r * 2.3, h * .3, r * .7], [sd * r * 1.9, h * .05, r * 2.3]], tt => r * .14 * (1 - .5 * tt), {seg: 8, rad: 5}));
      place(vg, f.p.clone().addScaledVector(f.T, -h / 2), f.T, f.U.clone().negate()); B.push(...vg); }
    return out([[B, 'bone']]);
  });
  add('spine_glow', NS, 'Spines', 'Glowing nerve spine', ['bone', 'glow', 'magic', 'undead'], () => {
    const c = crv([[0, 0, 0], [0, 1.6, -.2], [0, 3.2, .1], [0, 4.6, .5]]), n = 12, fr = frameFn(c, [0, 0, -1]), L = c.getLength() / n, B = [], G = [];
    for (let i = 0; i < n; i++) { const f = fr((i + .5) / n), s = lerp(1, .7, i / (n - 1)), r = .3 * s, h = L * .78, vg = vertebra(r, h, {spine: 2.4});
      const node = ell(r * .32, r * .32, r * .32, 0, h * .5 - r * .55, -r * 3.2, 10, 8); place([...vg, node], f.p.clone().addScaledVector(f.T, -h / 2), f.T, f.U.clone().negate()); B.push(...vg); G.push(node); }
    G.push(sweep(c, t => .1 * (1 + .4 * sin(t * 40)), {seg: 80, rad: 8}));
    return out([[B, 'bone'], [G, 'glow']]);
  });
  add('spine_armored', NS, 'Spines', 'Armored spine segments', ['chitin', 'armor', 'segmented', 'tail'], () => {
    const c = crv([[0, 0, 0], [0, 1.8, .3], [0, 3.6, -.1], [0, 5.0, .4]]), n = 14, fr = frameFn(c, [0, 0, -1]), L = c.getLength() / n, S = [], Kk = [];
    for (let i = 0; i < n; i++) { const f = fr((i + .3) / n), s = lerp(1, .55, i / (n - 1)), hh = L * 1.35;
      const g = lth(dens([[.001, 0], [.5 * s, 0], [.62 * s, hh * .25], [.58 * s, hh * .85], [.46 * s, hh], [.001, hh]], 20), 24); place(g, f.p, f.T, f.U.clone().negate()); S.push(g);
      Kk.push(place(horn(.45 * s, .12 * s, .4, {flat: .4, seg: 8, rad: 8}), f.p.clone().addScaledVector(f.U, .55 * s).addScaledVector(f.T, hh * .45), f.U.clone().addScaledVector(f.T, -.6), f.T.clone().negate())); }
    return out([[S, 'chitin'], [Kk, 'horn'], [sweep(c, .3, {seg: 40, rad: 10}), 'flesh']]);
  });

  // ===== Torsos & Bellies =====
  add('torso_brawler', TB, 'Chests', 'Brawler chest', ['humanoid', 'muscle', 'kaiju', 'abs'], () => {
    const d = dens([[.001, 0], [.9, .05], [1.15, .35], [1.2, .9], [1.1, 1.6], [1.22, 2.3], [1.45, 3.0], [1.6, 3.5], [1.5, 3.95], [1.1, 4.3], [.62, 4.55], [.5, 4.75], [.001, 4.8]], 60), sz = .72, G = [nz(lth(d, 44, 1, sz), .02, 2)];
    for (const sd of [-1, 1]) { G.push(onL(d, 1, sz, 3.35, sd * .42, .7, .5, .36, .45), onL(d, 1, sz, 2.9, sd * 1.35, .55, 1.0, .45, .55), onL(d, 1, sz, 4.15, PI + sd * .55, .6, .45, .4, .5));
      for (const y of [1.45, 1.95, 2.45]) G.push(onL(d, 1, sz, y, sd * .24, .25, .21, .15, .4)); }
    return out([[G, 'skin']]);
  });
  add('torso_dragon', TB, 'Chests', 'Dragon chest', ['dragon', 'd&d', 'belly plates', 'keel'], () => {
    const d = dens([[.001, 0], [.8, .05], [1.05, .4], [1.12, 1.0], [1.28, 1.8], [1.48, 2.6], [1.52, 3.2], [1.32, 3.8], [.92, 4.25], [.56, 4.5], [.001, 4.6]], 60), sz = .9, P = [];
    for (let i = 0; i < 12; i++) { const y = lerp(.35, 3.95, i / 11), s = lsurf(d, y, 0, 1, sz), g = ell(s.r * .42 + .15, .27, .1, 0, 0, 0, 16, 6); g.rotateX(-.2); placeN(g, s.p.clone().addScaledVector(s.n, -.04), s.n); P.push(g); }
    return out([[[nz(lth(d, 44, 1, sz), .02, 2), onL(d, 1, sz, 3.3, .6, .65, .6, .4), onL(d, 1, sz, 3.3, -.6, .65, .6, .4)], 'scale'], [P, 'leather']]);
  });
  add('torso_round', TB, 'Chests', 'Chubby belly body', ['cute', 'chubby', 'monster', 'round'], () => {
    const d = dens([[.001, 0], [1.0, .08], [1.55, .6], [1.75, 1.4], [1.7, 2.2], [1.45, 2.9], [1.0, 3.4], [.55, 3.65], [.001, 3.75]], 50);
    return out([[lth(d, 44, 1, .92), 'skin'], [ell(1.2, 1.25, .45, 0, 1.6, 1.22, 28, 18), 'paint2']]);
  });
  add('torso_spider', TB, 'Bug & Shell', 'Spider abdomen', ['spider', 'arachnid', 'bug'], () => {
    const d = dens([[.001, 0], [.25, .1], [.3, .35], [1.2, .9], [1.75, 1.9], [1.7, 2.9], [1.2, 3.7], [.4, 4.1], [.001, 4.2]], 60), sz = .85, M = [], Sp = [];
    for (let i = 0; i < 5; i++) for (const sd of [-1, 1]) { const s = lsurf(d, 1.3 + i * .5, sd * (.35 - i * .03), 1, sz), g = ell(.22 - i * .02, .14, .05, 0, 0, 0, 12, 6); placeN(g, s.p, s.n); M.push(g); }
    for (let k = 0; k < 3; k++) Sp.push(place(cone(.35, .1, 8), [(k - 1) * .16, 4.05, 0], [(k - 1) * .3, 1, 0]));
    return out([[[nz(lth(d, 44, 1, sz), .02, 3), Sp], 'chitin'], [M, 'paint']]);
  });
  add('torso_thorax', TB, 'Bug & Shell', 'Insect thorax', ['bug', 'beetle', 'chitin', 'segmented'], () => {
    const G = [[[.001, 0], [.75, .05], [1.0, .5], [1.0, 1.1], [.8, 1.5], [.001, 1.55]], [[.001, 1.35], [.85, 1.4], [1.15, 1.9], [1.15, 2.7], [.9, 3.1], [.001, 3.15]], [[.001, 3.0], [.6, 3.05], [.8, 3.4], [.75, 3.9], [.45, 4.15], [.001, 4.2]]].map(p => lth(dens(p, 30), 32, 1, .85));
    const sock = []; [.7, 2.1, 3.45].forEach(y => { for (const sd of [-1, 1]) { const t = new T.TorusGeometry(.22, .07, 8, 18); t.rotateY(PI / 2); t.translate(sd * .98, y, .15); sock.push(t); } });
    return out([[[...G, ...sock], 'chitin']]);
  });
  add('torso_crab', TB, 'Bug & Shell', 'Crab carapace', ['crab', 'shell', 'crustacean'], () => {
    const g = deform(ell(2.0, 1.35, .85, 0, 1.35, 0, 48, 32), q => { if (q.z > 0) q.z *= .35; q.z -= .12 * sin(q.x * 3) * sin(q.y * 2.4) * (q.z < 0 ? 1 : 0); }), S = [];
    for (let i = 0; i < 12; i++) { const a = (i < 6 ? lerp(18, 160, i / 5) : lerp(200, 340, (i - 6) / 5)) * D, p = V3(1.98 * cos(a), 1.35 + 1.33 * sin(a), 0); S.push(place(horn(.45, .12, .3, {seg: 8, rad: 8}), p, [cos(a) / 2, sin(a) / 1.35 + .3, 0], [0, 0, -1])); }
    return out([[nz(g, .03, 3), 'chitin'], [S, 'horn']]);
  });
  add('torso_undead', TB, 'Odd', 'Rotting ribcage torso', ['undead', 'horror', 'zombie', 'bone'], () => {
    return out([[ribcage(1), 'bone'], [[nz(ell(1.1, .9, .9, 0, .7, .1, 24, 16), .1, 2), nz(ell(.6, .45, .5, -.9, 4.1, -.4), .08, 3)], 'flesh'], [nz(ell(.35, .4, .32, .15, 2.9, .05), .05, 4), 'glow']]);
  });
  add('torso_slug', TB, 'Odd', 'Slug body', ['slug', 'slime', 'soft', 'gastropod'], () => {
    const g = deform(lth(dens([[.001, 0], [1.5, .02], [1.55, .18], [1.15, .35], [1.15, 1.2], [1.0, 2.4], [.8, 3.4], [.5, 4.0], [.001, 4.25]], 50), 48), q => { if (q.y < .35) { const k = 1 + .06 * sin(Math.atan2(q.x, q.z) * 9); q.x *= k; q.z *= k; } });
    return out([[nz(g, .04, 2), 'slime'], [nz(ell(1.2, 1.1, .7, 0, 2.3, -.55, 24, 16), .05, 3), 'flesh']]);
  });
  add('torso_bloated', TB, 'Odd', 'Bloated horror belly', ['horror', 'pustules', 'gross'], () => {
    rs(5); const d = dens([[.001, 0], [1.2, .1], [1.9, .9], [2.0, 1.9], [1.6, 2.9], [.9, 3.5], [.001, 3.7]], 40), P = [];
    for (let i = 0; i < 18; i++) { const s = lsurf(d, rr(.6, 3.0), rr(-2.5, 2.5)), r = rr(.12, .3); P.push(ell(r, r, r, s.p.x, s.p.y, s.p.z, 12, 8)); }
    return out([[nz(lth(d, 44), .15, 1.5), 'flesh'], [P, 'glow']]);
  });
  add('torso_naga', TB, 'Odd', 'Serpent coil base', ['naga', 'lamia', 'snake', 'coil'], () => {
    const pts = []; for (let k = 0; k <= 26; k++) { const a = k * .42, R = lerp(1.9, .5, k / 26), y = k < 18 ? .5 + k * .03 : 1.04 + (k - 18) * .38; pts.push([R * cos(a), y, R * sin(a)]); } pts.push([0, 4.4, 0]);
    return out([[sweep(pts, t => lerp(.08, .62, sstep(0, .45, t)) * grooves(60, .03, 12)(t), {seg: 220, rad: 18, pt: true, ref: [0, 1, 0]}), 'scale']]);
  });

  // ===== Arms & Shoulders =====
  const armBase = (pts, radii, mus, mat, o = {}) => { const G = [nz(limb(pts, radii, {seg: 60, rad: 20}), o.n || .02, 3)]; mus.forEach(m => G.push(nz(ell(...m, 18, 12), .015, 4))); return G; };
  add('arm_brawler', AS, 'Humanoid', 'Brawler arm', ['humanoid', 'muscle', 'kaiju', 'wrist'], () => out([[armBase([[0, 0, 0], [0, .9, -.05], [0, 2.0, -.15], [0, 3.0, .15], [0, 4.0, .4]], [.55, .6, .42, .42, .3],
    [[.66, .7, .62, 0, .4, 0], [.36, .62, .38, 0, 1.25, .2], [.38, .7, .38, 0, 1.3, -.25], [.42, .7, .38, .05, 2.7, .12], [.3, .3, .3, 0, 2.0, -.25]]), 'skin']]));
  add('arm_kaiju', AS, 'Beast', 'Kaiju armored arm', ['kaiju', 'armor', 'spike', 'wrist'], () => {
    const P = []; for (let i = 0; i < 5; i++) { const g = K.extr([[-.32, 0], [.32, 0], [.26, .62], [0, .8], [-.26, .62]], .08, .05); g.rotateY(PI / 2); g.rotateX(-.3); g.translate(.58 - i * .02, 2.55 + i * .4, .1); P.push(g); }
    return out([[armBase([[0, 0, 0], [0, 1.2, -.1], [0, 2.4, -.25], [0, 3.6, .2], [0, 4.6, .4]], [.8, .72, .5, .6, .45], [[.85, .8, .8, 0, .45, 0], [.5, .8, .5, 0, 1.3, .2]], 'scale', {n: .03}), 'scale'], [[...P, place(horn(1.0, .22, .4), [0, 2.4, -.6], [0, -.3, -1], [0, -1, 0])], 'horn']]);
  });
  add('arm_mantis', AS, 'Bug & Crab', 'Mantis scythe arm', ['mantis', 'bug', 'blade', 'scythe'], () => {
    const tib = crv([[0, 3.6, 1.05], [0, 3.1, 1.45], [0, 2.4, 1.5], [0, 1.85, 1.2]]), S = [];
    for (let i = 0; i < 9; i++) { const t = .12 + i * .09, p = tib.getPointAt(t); S.push(place(cone(.16, .04, 6), p.clone().add(V3(0, 0, -.1)), [0, -.2, -1], [0, 1, 0])); }
    for (let i = 0; i < 6; i++) S.push(place(horn(.25, .05, .3, {seg: 6, rad: 6}), [0, 1.9 + i * .3, .45 + i * .1], [0, .4, 1], [0, 1, 0]));
    return out([[[limb([[0, 0, 0], [0, .8, .15], [0, 1.5, .3]], [.28, .25, .22], {seg: 20, rad: 14}), sweep([[0, 1.5, .3], [0, 2.6, .55], [0, 3.6, .95]], t => .3 * (1 - .4 * t), {seg: 30, rad: 14, sx: .65}), sweep(tib, t => .17 * (1 - .85 * t), {seg: 30, rad: 12, ref: [1, 0, 0], sy: .35}), ell(.24, .24, .24, 0, 3.6, 1.0)], 'chitin'], [[...S, place(claw(.5, .06, 1.2, .5), [0, 1.85, 1.2], [0, -1, -.4], [0, 0, -1])], 'horn']]);
  });
  add('arm_crab', AS, 'Bug & Crab', 'Crab claw arm', ['crab', 'pincer', 'claw'], () => {
    const pc = pincer({s: 1.25}); [...pc.C, ...pc.Hn].forEach(g => g.translate(0, 2.6, 0));
    return out([[[limb([[0, 0, 0], [0, 1.0, .1], [0, 1.9, 0]], [.38, .42, .32], {seg: 24, rad: 16}), ell(.36, .45, .34, 0, 2.2, 0), ...pc.C], 'chitin'], [pc.Hn, 'horn']]);
  });
  add('arm_raptor', AS, 'Beast', 'Feathered raptor arm', ['raptor', 'dinosaur', 'feather', 'claws'], () => {
    const h = hand({palm: [.18, .3, .1], fingers: [-1, 0, 1].map(k => ({x: k * .1, spread: k * 12, len: [.35, .3, .25], r: .06, bends: [5, 10, 10], claw: .4}))}); [...h.S, ...h.C].forEach(g => g.translate(0, 2.3, .1));
    const F = []; for (let i = 0; i < 8; i++) F.push(place(featherG(1.0 - i * .05, .14), [0, .9 + i * .18, -.05], [0, .35, -1], [1, 0, 0]));
    return out([[[limb([[0, 0, 0], [0, 1.1, -.25], [0, 2.3, .1]], [.3, .2, .14], {seg: 30, rad: 14}), ...h.S], 'scale'], [F, 'feather'], [h.C, 'horn']]);
  });
  add('arm_wing', AS, 'Beast', 'Wing-arm (half folded)', ['bat', 'wyvern', 'membrane', 'wing'], () => out(memWing({s: .9, E: [.5, 1.7, 0], W: [.4, 3.4, 0], F: [.25, .5, 0], r: .15, fingers: [{a: 105, L: 3.0, bend: 4}, {a: 88, L: 2.8, bend: 4}, {a: 72, L: 2.5, bend: 4}, {a: 58, L: 2.1, bend: 4}], thumb: 1.4, thumbA: 120, sag: .2})));
  add('shoulder_spiked', AS, 'Shoulders', 'Spiked pauldron', ['armor', 'spikes', 'shoulder'], () => {
    const S = [place(horn(1.4, .2, .3), [0, .75, 0], [0, 1, 0], [0, 0, -1])]; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + .4; S.push(place(horn(.9, .15, .4), [sin(a) * .65, .5, cos(a) * .65], [sin(a), .9, cos(a)], [0, 1, 0])); }
    const dome = new T.SphereGeometry(1, 32, 12, 0, TAU, 0, PI / 2); dome.scale(1.0, .75, 1.0);
    return out([[[nz(smoothN(dome), .02, 3)], 'scale'], [S, 'horn']]);
  });
  add('shoulder_crystal', AS, 'Shoulders', 'Crystal shoulder cluster', ['crystal', 'magic', 'gem'], () => {
    rs(3); const C = []; for (let i = 0; i < 7; i++) { const a = rr(0, TAU), tl = i ? rr(.3, .7) : 0; C.push(place(crystal(rr(.8, 1.6) * (i ? 1 : 1.4), rr(.12, .22)), [sin(a) * .3 * tl * 2, .2, cos(a) * .3 * tl * 2], [sin(a) * tl, 1, cos(a) * tl], [0, 0, 1])); }
    return out([[nz(ell(.8, .35, .8, 0, .05, 0, 24, 12), .08, 3), 'stone'], [C, 'crystal']]);
  });

  // ===== Hands & Claws =====
  add('hand_clawed', HC, 'Hands', 'Clawed hand', ['monster', 'humanoid', 'claws', '5 fingers'], () => {
    const h = hand({palm: [.55, .75, .22], fingers: [-.36, -.12, .12, .36].map((x, i) => ({x, spread: [-10, -3, 3, 10][i], len: [.45, .35, .28].map(l => l * [1, 1.1, 1.05, .9][i]), r: .11, bends: [10, 18, 20], claw: .35})),
      thumb: {pos: [.5, .35, .15], dir: [1, .8, .6], len: [.35, .3], r: .12, bends: [10, 15], claw: .32}}); return out([[h.S, 'skin'], [h.C, 'horn']]);
  });
  add('hand_kaiju', HC, 'Hands', 'Kaiju three-finger hand', ['kaiju', 'claws', 'big'], () => {
    const h = hand({palm: [.7, .8, .32], fingers: [-.38, 0, .38].map((x, i) => ({x, spread: (i - 1) * 9, len: [.55, .45, .35], r: .19, bends: [10, 15, 15], claw: .55})), thumb: {pos: [.62, .35, .2], dir: [1, .7, .7], len: [.4, .3], r: .18, bends: [10, 10], claw: .45}});
    return out([[h.S, 'scale'], [h.C, 'horn']]);
  });
  add('hand_eagle', HC, 'Talons & Paws', 'Eagle talon', ['bird', 'griffin', 'talon'], () => {
    const h = hand({palm: [.3, .55, .22], fingers: [-.18, 0, .18].map((x, i) => ({x, spread: (i - 1) * 25, len: [.4, .3, .25], r: .09, bends: [15, 15, 15], claw: .5, curl: 1.3})), thumb: {pos: [0, .55, -.15], dir: [0, -.5, 1], up: [0, 1, 0], len: [.35, .25], r: .1, bends: [10, 15], claw: .5, curl: 1.3}});
    return out([[[...h.S, sweep([[0, -.4, 0], [0, .4, 0]], .2, {seg: 10, rad: 14, prof: (a, t) => 1 - .05 * pow(abs(cos(t * 6 * PI)), 8)})], 'scale'], [h.C, 'horn']]);
  });
  add('hand_bear', HC, 'Talons & Paws', 'Bear paw', ['bear', 'beast', 'paw', 'pads'], () => {
    const h = hand({palm: [.75, .6, .35], fingers: [-.5, -.25, 0, .25, .5].map((x, i) => ({x, y: .9 - abs(i - 2) * .08, spread: (i - 2) * 9, len: [.22, .18], r: .16, bends: [15, 20], claw: .45, curl: .6, pad: true}))});
    return out([[h.S.map(g => nz(g, .02, 6)), 'fur'], [ell(.5, .3, .12, 0, .5, .3), 'skin'], [h.C, 'horn']]);
  });
  add('hand_crab', HC, 'Pincers', 'Crab pincer', ['crab', 'pincer', 'claw'], () => { const p = pincer({s: 1.3}); return out([[p.C, 'chitin'], [p.Hn, 'horn']]); });
  add('hand_scorpion', HC, 'Pincers', 'Scorpion pincer', ['scorpion', 'pincer'], () => { const p = pincer({s: 1.2, bulb: 1.25, pz: .85, fl: 1.9, fr: .75, open: 18, teeth: 8}); return out([[p.C, 'chitin'], [p.Hn, 'horn']]); });
  add('hand_sickle', HC, 'Claws', 'Sickle claws', ['claws', 'blade', 'therizino'], () => {
    const C = [-.25, 0, .25].map((x, i) => place(claw([1.5, 1.8, 1.3][i], .16, 1.2, .3), [x, .4, .1], [x * .6, 1, .1], [0, 0, 1]));
    return out([[nz(ell(.55, .45, .3, 0, .2, 0), .02, 3), 'scale'], [C, 'horn']]);
  });
  add('hand_webbed', HC, 'Hands', 'Webbed hand', ['frog', 'fish', 'amphibian', 'web'], () => {
    const h = hand({palm: [.45, .6, .16], fingers: [-.3, -.1, .1, .3].map((x, i) => ({x, spread: (i - 1.5) * 15, len: [.5, .4, .3], r: .07, bends: [5, 6, 6], pad: true}))}), W = [];
    for (let k = 0; k < 3; k++) { const A = crv(h.F[k].wpts), B = crv(h.F[k + 1].wpts); W.push(sheet((u, w) => { const uu = u * (1 - .35 * 4 * w * (1 - w)); return A.getPointAt(uu).lerp(B.getPointAt(uu), w); }, 10, 4, .02)); }
    return out([[h.S, 'skin'], [W, 'membrane']]);
  });
  add('hand_hoof', HC, 'Hooves', 'Horse hoof', ['horse', 'hoof', 'centaur'], () => {
    const hoof = deform(lth(dens([[.001, 0], [.3, 0], [.36, .25], [.46, .55], [.5, .64], [.001, .65]], 20), 28), q => { q.z += (q.y) * .3; });
    hoof.translate(0, .7, 0); return out([[[nz(ell(.38, .32, .38, 0, .15, 0), .03, 4), sweep([[0, .1, 0], [0, .8, .1]], .3, {seg: 8, rad: 18})], 'fur'], [hoof, 'horn']]);
  });
  add('claw_great', HC, 'Claws', 'Great curved claw', ['claw', 'single'], () => out([[claw(2.0, .3, 1.1, .5), 'horn'], [new T.TorusGeometry(.26, .07, 8, 18).rotateX(PI / 2), 'scale']]));

  // ===== Legs & Feet =====
  const toes = (n, base, len, r, claw, spread = 14, mat) => { const S = [], C = []; for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * spread * D, f = finger(len, r, [5, 10, 10], {claw, curl: .9}); const m = pm(V3(base[0] + (i - (n - 1) / 2) * r * 2.1, base[1], base[2]), V3(sin(a), .15, cos(a)), [0, 1, 0]); f.skin.forEach(g => g.applyMatrix4(m)); f.claw.forEach(g => g.applyMatrix4(m)); S.push(...f.skin); C.push(...f.claw); } return {S, C}; };
  add('leg_beast', LF, 'Beast Legs', 'Beast hind leg', ['wolf', 'digitigrade', 'beast', 'paw'], () => {
    const t = toes(4, [0, 4.2, .2], [.24, .18], .085, .22);
    return out([[[nz(limb([[0, 0, 0], [0, 1.7, .55], [0, 3.1, -.45], [0, 4.2, -.1]], [.65, .42, .26, .2], {seg: 60, rad: 18}), .02, 3), nz(ell(.6, 1.0, .62, 0, .7, .15), .02, 3), ell(.2, .2, .22, 0, 3.1, -.5), ell(.32, .15, .36, 0, 4.25, .05), ...t.S], 'fur'], [t.C, 'horn']]);
  });
  add('leg_pillar', LF, 'Beast Legs', 'Titan pillar leg', ['elephant', 'plantigrade', 'kaiju', 'heavy'], () => {
    const d = dens([[.001, 0], [.9, .05], [1.0, .6], [.85, 1.6], [.72, 2.4], [.7, 3.2], [.78, 3.8], [.92, 4.15], [.95, 4.3], [.001, 4.32]], 50);
    const g = deform(lth(d, 40), q => { const w = 1 - .03 * pow(abs(sin(q.y * 9)), 6) * (gauss(q.y, 2.3, .4) + gauss(q.y, 3.9, .25)); q.x *= w; q.z *= w; }), N = [];
    for (let i = 0; i < 5; i++) { const s = lsurf(d, 4.12, (i - 2) * .45), e = ell(.2, .15, .1, 0, 0, 0, 12, 8); placeN(e, s.p, s.n); N.push(e); }
    return out([[nz(g, .02, 4), 'skin'], [N, 'horn']]);
  });
  add('leg_bird', LF, 'Bird & Dino', 'Bird leg', ['bird', 'chicken', 'griffin', 'talons'], () => {
    const t = toes(3, [0, 4.2, .2], [.4, .3, .25], .08, .3, 30), back = finger([.3, .2], .07, [5, 5], {claw: .28}); place([...back.skin, ...back.claw], [0, 4.2, 0], [0, .1, -1], [0, 1, 0]);
    return out([[nz(ell(.45, .8, .45, 0, .6, 0), .04, 5), 'feather'], [[sweep([[0, .5, 0], [0, 1.6, .2], [0, 2.5, -.2]], [.2, .13], {seg: 24, rad: 14}), sweep([[0, 2.5, -.2], [0, 3.6, .1], [0, 4.2, .15]], .1, {seg: 30, rad: 12, prof: (a, tt) => 1 - .06 * pow(abs(cos(tt * 14 * PI)), 8)}), ...t.S, ...back.skin], 'scale'], [[...t.C, ...back.claw], 'horn']]);
  });
  add('leg_dragon', LF, 'Bird & Dino', 'Dragon hind leg', ['dragon', 'd&d', 'digitigrade', 'claws'], () => {
    const t = toes(3, [0, 4.3, .25], [.4, .3], .14, .45, 18);
    return out([[[nz(limb([[0, 0, 0], [0, 1.9, .7], [0, 3.3, -.5], [0, 4.3, -.1]], [.85, .55, .36, .3], {seg: 60, rad: 20}), .02, 3), nz(ell(.85, 1.2, .8, 0, .8, .2), .02, 3), ell(.3, .3, .3, 0, 3.3, -.55), ...t.S], 'scale'], [[...t.C, place(horn(.7, .14, .4), [0, 1.9, .9], [0, -.2, 1], [0, -1, 0])], 'horn']]);
  });
  add('leg_spider', LF, 'Bug Legs', 'Spider leg', ['spider', 'arachnid', 'bug'], () => {
    const J = [[0, 0, 0], [0, .4, .15], [0, 2.0, 1.5], [0, 2.4, 1.55], [0, 3.9, .6], [0, 5.0, -.3], [0, 5.5, -.6]], S = [], B = [];
    for (let i = 0; i < J.length - 1; i++) { const r0 = lerp(.2, .05, i / 6); S.push(sweep([J[i], J[i + 1]], [r0, r0 * .8], {seg: 8, rad: 12})); B.push(ell(r0 * 1.15, r0 * 1.15, r0 * 1.15, ...J[i + 1], 10, 8)); }
    return out([[[...S, ...B], 'chitin']]);
  });
  add('leg_insect', LF, 'Bug Legs', 'Beetle leg', ['beetle', 'bug', 'spurs'], () => {
    const tb = crv([[0, 1.8, .9], [0, 3.6, .3]]), Sp = []; for (let i = 0; i < 6; i++) { const p = tb.getPointAt(.15 + i * .14); Sp.push(place(cone(.18, .04, 6), p.clone().add(V3(0, 0, -.1)), [0, .5, -1])); }
    const tars = []; for (let i = 0; i < 5; i++) tars.push(ell(.08, .12, .08, 0, 3.7 + i * .2, .25 - i * .05, 10, 8));
    return out([[[ell(.32, .3, .32, 0, .15, 0), sweep([[0, .3, 0], [0, 1.0, .5], [0, 1.8, .9]], t => .28 * (1 - .4 * t) * (1 + .3 * sin(PI * t)), {seg: 20, rad: 14, sx: .6}), sweep(tb, [.14, .09], {seg: 16, rad: 12}), ...tars], 'chitin'], [[...Sp, place(claw(.25, .04, 1), [.05, 4.6, 0], [0, 1, 0]), place(claw(.25, .04, 1), [-.05, 4.6, 0], [0, 1, 0])], 'horn']]);
  });
  add('leg_frog', LF, 'Beast Legs', 'Frog leg', ['frog', 'toad', 'jumping'], () => {
    const t = toes(5, [0, 2.9, .5], [.35, .3], .05, 0, 16), W = [];
    return out([[[nz(limb([[0, 0, 0], [0, 1.2, 1.0], [0, 2.2, -.3], [0, 2.9, .5]], [.6, .35, .18, .14], {seg: 50, rad: 16}), .02, 3), nz(ell(.62, .7, .7, 0, .5, .45), .02, 3), ...t.S], 'skin']]);
  });


  return parts;
});
