// Titan Forge parts: MECH (id prefix mk_)
// Groups: Mech Heads, Mech Torso & Core, Mech Arms & Legs, Mech Details.
// Original hard-surface designs (layered armour over a dark inner frame, panel gaps,
// pistons, vents, thrusters). Classic script, no modules.
// Orientation (per PARTS-SPEC): attach point at origin, part grows along +Y.
//  - Heads: neck at origin, face toward +Z.
//  - Torsos: waist/hip at origin, chest up +Y, front +Z.
//  - Arms/legs: +Y runs shoulder/hip -> hand/foot. Front of limb +Z, outer side +X
//    (right-hand side; the editor mirrors for the left). Palms face -X. Feet: sole on the +Y side, toes +Z.
//  - Surface-mounted parts (Mech Details, chest cores, backpacks, shoulder pauldrons):
//    +Y = out of the surface; the part's "top" edge points toward -Z.
//  - Wing binders follow the wing rule: +Y out of the back, spreading toward +X.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  'use strict';
  const {V3, V2, D, at, taper, bez, cr} = K;
  const PI = Math.PI, TAU = PI * 2;
  const v3 = p => (p && p.isVector3) ? p : V3(p[0], p[1], p[2]);
  const lerp3 = (a, b, t) => v3(a).clone().lerp(v3(b), t);

  // ---------------------------------------------------------------- geometry basics
  function uvfix(g) {
    if (!g.attributes.uv) {
      const p = g.attributes.position, uv = new Float32Array(p.count * 2);
      for (let i = 0; i < p.count; i++) { uv[i * 2] = (p.getX(i) + p.getZ(i)) * .5; uv[i * 2 + 1] = p.getY(i) * .5; }
      g.setAttribute('uv', new T.BufferAttribute(uv, 2));
    }
    if (!g.attributes.normal) g.computeVertexNormals();
    return g;
  }
  function swapWinding(g) {
    for (const a of ['position', 'normal', 'uv']) {
      const A = g.attributes[a]; if (!A) continue; const s = A.itemSize, arr = A.array;
      for (let i = 0; i < arr.length; i += 3 * s) for (let k = 0; k < s; k++) { const t = arr[i + s + k]; arr[i + s + k] = arr[i + 2 * s + k]; arr[i + 2 * s + k] = t; }
    }
    return g;
  }
  // mirror across X keeping smooth normals and correct winding
  function mir(g) { g = g.index ? g.toNonIndexed() : g.clone(); uvfix(g); g.scale(-1, 1, 1); return swapWinding(g); }
  function flip(g) { g = g.index ? g.toNonIndexed() : g; uvfix(g); swapWinding(g); const n = g.attributes.normal.array; for (let i = 0; i < n.length; i++) n[i] = -n[i]; return g; }

  // part builder: collects geometry per material, merges at the end
  function B() {
    const m = {};
    const o = {
      m,
      add(mat, ...gs) { for (const g of gs.flat(4)) if (g) (m[mat] = m[mat] || []).push(uvfix(g)); return o; },
      sym(mat, ...gs) { for (const g of gs.flat(4)) if (g) { o.add(mat, g); o.add(mat, mir(g)); } return o; },
      _put(s, a, mirror) { for (const k in s.m) for (const g of s.m[k]) { let c = at(g.clone(), a[0], a[1], a[2], a[3], a[4], a[5], a[6] === undefined ? 1 : a[6]); if (mirror) c = mir(c); o.add(k, c); } return o; },
      put(s, ...a) { return o._put(s, a, false); },
      sput(s, ...a) { o._put(s, a, false); return o._put(s, a, true); },
      out() { return Object.keys(m).map(k => ({geo: K.merge(m[k]), mat: k})); }
    };
    return o;
  }
  const sh = pts => { const s = new T.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return s; };
  const pth = pts => { const s = new T.Path(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return s; };
  const holed = (outer, ...holes) => { const s = sh(outer); holes.forEach(h => s.holes.push(pth(h))); return s; };
  // bevelled extrusion whose outline stays inside the given points; thickness t along Z, centred
  function ex(src, t, b = .03, seg = 1) {
    const s = src instanceof T.Shape ? src : sh(src); b = Math.max(0, Math.min(b, t * .45)); const dep = Math.max(t - 2 * b, .002);
    const g = new T.ExtrudeGeometry(s, {depth: dep, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: seg, curveSegments: 8});
    g.translate(0, 0, -dep / 2); return g;
  }
  const fr = (pts, t, b) => ex(pts, t, b);                                           // shape in XY, thickness Z
  const sd = (pts, t, b) => ex(pts.map(([z, y]) => [-z, y]), t, b).rotateY(PI / 2);   // shape in (z,y), thickness X
  const tp = (pts, t, b) => ex(pts.map(([x, z]) => [x, -z]), t, b).rotateX(-PI / 2);  // shape in (x,z), thickness Y
  const rect = (w, h, cx = 0, cy = 0) => [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
  function rr(w, h, r, n = 4, cx = 0, cy = 0) {
    const p = [], c = [[w / 2 - r, h / 2 - r], [-w / 2 + r, h / 2 - r], [-w / 2 + r, -h / 2 + r], [w / 2 - r, -h / 2 + r]];
    c.forEach(([x, y], q) => { for (let i = 0; i <= n; i++) { const a = (q + i / n) * PI / 2; p.push([cx + x + r * Math.cos(a), cy + y + r * Math.sin(a)]); } });
    return p;
  }
  const cham = (w, h, c, cx = 0, cy = 0) => [[-w / 2 + c, -h / 2], [w / 2 - c, -h / 2], [w / 2, -h / 2 + c], [w / 2, h / 2 - c], [w / 2 - c, h / 2], [-w / 2 + c, h / 2], [-w / 2, h / 2 - c], [-w / 2, -h / 2 + c]].map(([x, y]) => [x + cx, y + cy]);
  const ngon = (n, r, rot = 0, cx = 0, cy = 0) => [...Array(n)].map((_, i) => { const a = rot + i / n * TAU; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  function cbox(w, h, d, b = .03) { b = Math.min(b, w * .3, h * .3, d * .3); return ex(rect(w, h), d, b); }
  const bx = (x, y, z, w, h, d, b = .03, rx = 0, ry = 0, rz = 0) => at(cbox(w, h, d, b), x, y, z, rx, ry, rz);
  function cy(r, h, seg = 16, r2 = r, y = 0) { const g = new T.CylinderGeometry(r2, r, h, seg); g.translate(0, y + h / 2, 0); return g; }
  const cyX = (r, h, x, y, z, seg = 16) => at(cy(r, h, seg, r, -h / 2), x, y, z, 0, 0, PI / 2);   // axis along X, centred
  const cyZ = (r, h, x, y, z, seg = 16) => at(cy(r, h, seg, r, -h / 2), x, y, z, PI / 2, 0, 0);   // axis along Z, centred
  function orientY(g, dir) { return g.applyQuaternion(new T.Quaternion().setFromUnitVectors(V3(0, 1, 0), v3(dir).clone().normalize())); }
  function rod(a, b, r, seg = 10, r2 = r) { a = v3(a); b = v3(b); const d = b.clone().sub(a), L = d.length(); return orientY(cy(r, L, seg, r2), d).translate(a.x, a.y, a.z); }
  function beam(a, b, w, d, bev = .03) { a = v3(a); b = v3(b); const dir = b.clone().sub(a), L = dir.length(); const g = cbox(w, L, d, bev).translate(0, L / 2, 0); return orientY(g, dir).translate(a.x, a.y, a.z); }
  // beam whose length runs in the YZ plane (rotation about X only, keeps X width axis)
  function beamYZ(a, b, w, d, bev = .03) { a = v3(a); b = v3(b); const dy = b.y - a.y, dz = b.z - a.z, L = Math.hypot(dy, dz); return at(cbox(w, L, d, bev).translate(0, L / 2, 0), a.x, a.y, a.z, Math.atan2(dz, dy), 0, 0); }
  const ball = (r, x = 0, y = 0, z = 0, ws = 16, hs = 12) => new T.SphereGeometry(r, ws, hs).translate(x, y, z);
  const ringY = (R, r, y = 0, rs = 6, ts = 32) => new T.TorusGeometry(R, r, rs, ts).rotateX(PI / 2).translate(0, y, 0);
  const ringZ = (R, r, x = 0, y = 0, z = 0, rs = 6, ts = 32) => new T.TorusGeometry(R, r, rs, ts).translate(x, y, z);
  const ringX = (R, r, x = 0, y = 0, z = 0, rs = 6, ts = 32) => new T.TorusGeometry(R, r, rs, ts).rotateY(PI / 2).translate(x, y, z);
  function area(P) { let a = 0; for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length]; a += x1 * y2 - x2 * y1; } return a / 2; }
  // crisp lathe: splits the profile at corners so hard edges stay hard. profile [[r,y],...] bottom->top
  function hl(pts, seg = 32, closed = false, phi0 = 0, phiL = TAU, crease = 32) {
    let P = pts.map(p => [Math.max(0, p[0]), p[1]]);
    if (closed) { if (area(P) < 0) P.reverse(); P.push(P[0]); }
    const runs = []; let cur = [P[0]]; const cT = Math.cos(crease * D);
    for (let i = 1; i < P.length; i++) {
      cur.push(P[i]);
      if (i < P.length - 1) {
        const ax = P[i][0] - P[i - 1][0], ay = P[i][1] - P[i - 1][1], bx_ = P[i + 1][0] - P[i][0], by = P[i + 1][1] - P[i][1];
        const c = (ax * bx_ + ay * by) / ((Math.hypot(ax, ay) * Math.hypot(bx_, by)) || 1);
        if (c < cT) { runs.push(cur); cur = [P[i]]; }
      }
    }
    runs.push(cur);
    return K.merge(runs.filter(r => r.length > 1).map(r => new T.LatheGeometry(r.map(([x, y]) => V2(x, y)), seg, phi0, phiL)));
  }
  // solid curved plate: closed (r,y) profile swept from angle a0 to a1 (degrees, 0 = +Z, 90 = +X), capped
  function band(pts, a0, a1, seg = 12) {
    let P = pts.slice(); if (area(P) < 0) P.reverse();
    const cap = new T.ShapeGeometry(sh(P));
    return K.merge([hl(P, seg, true, a0 * D, (a1 - a0) * D), cap.clone().rotateY(a0 * D - PI / 2), flip(cap.clone()).rotateY(a1 * D - PI / 2)]);
  }
  // point on a lathe surface: radius r at angle a (deg), height y
  const polar = (r, a, y) => [r * Math.sin(a * D), y, r * Math.cos(a * D)];
  const bolt = (r = .035) => cy(r, r * .7, 6, r * .8);   // hex bolt head, base y=0 grows +Y
  // place g (built pointing +Y) at p, pointing along n
  const onN = (g, p, n) => orientY(g, n).translate(...(v3(p).toArray()));
  function gearShape(r, teeth, depth = .12, hole = .35) {
    const pts = []; const n = teeth * 4;
    for (let i = 0; i < n; i++) { const a = i / n * TAU, rr_ = (i % 4 < 2) ? r : r - depth; pts.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); }
    return holed(pts, ngon(24, r * hole).reverse());
  }
  function displacedPlane(w, h, bulge, sx = 18, sy = 14) {
    const g = new T.PlaneGeometry(w, h, sx, sy), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) / (w / 2), y = p.getY(i) / (h / 2); p.setZ(i, bulge * (1 - x * x * .9) * (1 - y * y * .9)); }
    g.computeVertexNormals(); return g;
  }

  // ---------------------------------------------------------------- modules (sub-builders)
  // thruster bell: base at origin, exhaust toward +Y
  function mThruster(r = .3, L = .6, ribs = 8) {
    const s = B();
    s.add('darkmetal', cy(r * .62, L * .2, 16, r * .55));
    s.add('metal', ringY(r * .58, r * .07, L * .2, 6, 24));
    s.add('darkmetal', hl([[r * .45, L * .2], [r * .55, L * .26], [r * .78, L * .6], [r, L], [r * .92, L], [r * .7, L * .62], [r * .5, L * .3], [r * .4, L * .22]], 24, true));
    s.add('metal', hl([[r * .9, L * .95], [r * 1.05, L * .95], [r * 1.05, L * 1.03], [r * .9, L * 1.03]], 24, true));
    s.add('glow', cy(r * .5, .02, 18, r * .5, L * .27), cy(r * .18, L * .2, 10, .01, L * .28));
    for (let i = 0; i < ribs; i++) { const a = i / ribs * 360; s.add('metal', rod(polar(r * .6, a, L * .28), polar(r * 1.0, a, L * .93), r * .035, 5)); }
    return s;
  }
  // slatted vent, facing +Z, back at z=0
  function mVent(w = .6, h = .4, n = 5, frameMat = 'metal') {
    const s = B(), t = Math.min(w, h) * .13, d = .07;
    s.add(frameMat, at(ex(holed(rect(w, h), rect(w - 2 * t, h - 2 * t)), d, .012), 0, 0, d / 2));
    s.add('darkmetal', bx(0, 0, .012, w - 2 * t + .02, h - 2 * t + .02, .024, .004));
    const ih = (h - 2 * t) / n;
    for (let i = 0; i < n; i++) s.add('darkmetal', bx(0, -h / 2 + t + (i + .5) * ih, d * .5, w - 2 * t, ih * 1.05, .012, .004, -40 * D));
    return s;
  }
  // round fan vent facing +Z
  function mFan(r = .4, blades = 9) {
    const s = B();
    s.add('metal', at(hl([[r * .82, 0], [r, 0], [r, .06], [r * .92, .1], [r * .82, .1]], 28, true), 0, 0, 0, PI / 2, 0, 0));
    s.add('darkmetal', at(cy(r * .84, .02, 28), 0, 0, 0, PI / 2, 0, 0));
    for (let i = 0; i < blades; i++) s.add('darkmetal', at(at(cbox(r * .7, .012, r * .22, .004), r * .45, .05, 0, 30 * D, 0, 0), 0, 0, 0, 0, i / blades * TAU, 0).rotateX(PI / 2));
    s.add('metal', at(hl([[0, .03], [r * .2, .03], [r * .18, .09], [0, .11]], 16), 0, 0, 0, PI / 2, 0, 0));
    for (let i = 0; i < 3; i++) s.add('metal', at(cbox(r * 1.7, .025, .02, .005), 0, 0, .1, 0, 0, i * PI / 3));
    return s;
  }
  // lens / camera eye facing +Z, base at z=0
  function mLens(r = .2, d = .18, eyeMat = 'glow') {
    const s = B();
    s.add('darkmetal', at(hl([[r * 1.35, 0], [r * 1.4, d * .15], [r * 1.4, d * .75], [r * 1.25, d], [r * 1.05, d], [r * 1.0, d * .7], [r * .9, d * .6], [0, d * .6]], 28), 0, 0, 0, PI / 2, 0, 0));
    s.add('metal', at(ringY(r * 1.4, r * .07, d * .45, 6, 28), 0, 0, 0, PI / 2, 0, 0));
    s.add(eyeMat, at(new T.SphereGeometry(r, 24, 12, 0, TAU, 0, PI / 2.6).translate(0, d * .6 - r * .45, 0), 0, 0, 0, PI / 2, 0, 0));
    s.add('glow', at(ringY(r * .78, r * .05, d * .72, 4, 28), 0, 0, 0, PI / 2, 0, 0));
    return s;
  }
  function mNeck(h = .5, r = .3) {
    const s = B();
    s.add('darkmetal', cy(r, h, 18, r * .9));
    for (let i = 0; i < 3; i++) s.add('metal', ringY(r * 1.0, .035, .1 + i * (h - .2) / 2, 6, 24));
    for (let i = 0; i < 4; i++) { const a = i * 90 + 45; s.add('rubber', rod(polar(r * 1.3, a, 0), polar(r * 1.05, a, h), .045, 6)); }
    return s;
  }
  // hydraulic piston from a to b (sleeve at a, rod at b)
  function piston(bd, a, b, r = .06, sleeveMat = 'darkmetal') {
    a = v3(a); b = v3(b);
    bd.add(sleeveMat, rod(a, lerp3(a, b, .58), r, 12));
    bd.add('metal', rod(lerp3(a, b, .54), lerp3(a, b, .6), r * 1.25, 12));
    bd.add('metal', rod(lerp3(a, b, .5), b, r * .5, 10));
    bd.add('darkmetal', ball(r * 1.1, a.x, a.y, a.z, 10, 8), ball(r * .9, b.x, b.y, b.z, 10, 8));
    return bd;
  }
  // ribbed hose along a curve
  function hose(curve, r = .05, ribs = 10, mat = 'rubber') {
    return taper(curve, t => r * (1 + .16 * (.5 + .5 * Math.cos(t * ribs * TAU))), 0, Math.max(16, ribs * 4), 8);
  }
  function hoseFull(bd, curve, r = .05, ribs = 10) {
    bd.add('rubber', hose(curve, r, ribs));
    const p0 = curve.getPointAt(0), t0 = curve.getTangentAt(0), p1 = curve.getPointAt(1), t1 = curve.getTangentAt(1);
    bd.add('metal', rod(p0.clone().addScaledVector(t0, -.02), p0.clone().addScaledVector(t0, r * 2.4), r * 1.35, 10));
    bd.add('metal', rod(p1.clone().addScaledVector(t1, -r * 2.4), p1.clone().addScaledVector(t1, .02), r * 1.35, 10));
    return bd;
  }
  // hazard stripe plate face +Z
  function mStripes(w, h, n = 5, d = .04) {
    const s = B(); s.add('darkmetal', bx(0, 0, d / 2, w, h, d, .01));
    const sw = w / n;
    for (let i = 0; i < n; i++) { const x0 = -w / 2 + i * sw; s.add('paint2', at(fr([[x0, -h / 2], [x0 + sw * .5, -h / 2], [x0 + sw * .5 + h * .5, h / 2], [x0 + h * .5, h / 2]].map(([x, y]) => [Math.min(w / 2, Math.max(-w / 2, x)), y]), .012, .003), 0, 0, d + .006)); }
    return s;
  }
  // gear cluster facing +Z
  function mGear(r = .3, teeth = 14, t = .08) {
    const s = B(); s.add('metal', at(ex(gearShape(r, teeth, r * .14, .32), t, .01), 0, 0, t / 2));
    s.add('darkmetal', at(cy(r * .34, t * 1.6, 16), 0, 0, 0, PI / 2, 0, 0));
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; s.add('darkmetal', at(cy(r * .07, t * .4, 8, r * .07, t), Math.cos(a) * r * .6, Math.sin(a) * r * .6, 0, PI / 2, 0, 0)); }
    return s;
  }
  // closed armoured fist (wrist at origin, knuckles toward +Y, palm -X)
  function mFist(sc = 1) {
    const s = B();
    s.add('darkmetal', ball(.2, 0, .05, 0), cy(.17, .25, 12, .2, .05));
    s.add('paint2', at(fr(cham(.5, .62, .1), .52, .04), 0, .55, 0, 0, PI / 2, 0));   // palm block (shape in zy)
    s.add('paint', at(sd([[-.3, .32], [.3, .32], [.33, .72], [.28, .9], [-.28, .9], [-.33, .72]], .12, .03), .3, 0, 0));    // back-of-hand guard
    s.add('darkmetal', bx(.2, .78, 0, .06, .04, .5, .01));
    for (let i = 0; i < 4; i++) {
      const z = -.21 + i * .14;
      s.add('darkmetal', cyZ(.06, .12, .1, .96, z, 10));
      s.add('paint2', bx(-.02, 1.02, z, .3, .15, .12, .03));                     // proximal (along -X at top)
      s.add('darkmetal', cyZ(.055, .12, -.2, 1.0, z, 10));
      s.add('paint2', bx(-.27, .86, z, .13, .26, .12, .03));                     // middle (down)
      s.add('paint2', bx(-.16, .7, z, .2, .11, .115, .03, 0, 0, -.2));          // distal (back)
      s.add('paint', bx(.08, 1.1, z, .2, .05, .12, .015));                       // knuckle armour
    }
    s.add('paint2', at(cbox(.14, .34, .14, .03), -.12, .62, .32, -.35, 0, .5)); // thumb
    s.add('darkmetal', cyZ(.07, .14, 0, .42, .3, 10));
    for (const z of [-.18, 0, .18]) s.add('metal', at(bolt(.025), .36, .55, z, 0, 0, -PI / 2));
    return sc === 1 ? s : B().put(s, 0, 0, 0, 0, 0, 0, sc);
  }

  // ---------------------------------------------------------------- limb builders (shared by single + full parts)
  function bUpperArm() {
    const s = B();
    s.add('darkmetal', ball(.42, 0, 0, 0, 20, 14));
    s.add('metal', ringY(.38, .05, .2, 6, 28));
    s.add('darkmetal', cy(.26, 1.7, 12, .26, .25));
    s.add('paint', hl([[.36, .45], [.46, .55], [.48, 1.4], [.42, 1.62], [.34, 1.62], [.36, .45]], 8, true, PI / 8));
    s.add('darkmetal', hl([[.45, .92], [.5, .94], [.5, 1.0], [.45, 1.02]], 8, true, PI / 8));
    s.add('paint2', band([[.48, .6], [.58, .64], [.58, 1.3], [.48, 1.36]], 50, 130, 8));               // outer plate
    s.add('paint2', band([[.48, .62], [.56, .66], [.56, 1.25], [.48, 1.3]], -40, 25, 6));              // front plate
    for (const y of [.75, 1.2]) s.add('metal', onN(bolt(.03), polar(.58, 90, y), [1, 0, 0]));
    // elbow
    s.add('darkmetal', cyX(.3, .66, 0, 1.95, 0, 20), bx(0, 1.72, 0, .5, .3, .42, .05));
    s.add('metal', cyX(.2, .76, 0, 1.95, 0, 16));
    s.add('gold', cyX(.08, .8, 0, 1.95, 0, 10));
    piston(s, [0, .6, .44], [0, 1.72, .3], .05);
    return s;
  }
  function bForearm() {
    const s = B();
    s.add('darkmetal', cyX(.26, .55, 0, 0, 0, 18), cy(.24, 1.9, 10, .2, .1));
    s.add('paint', sd([[.4, .3], [.48, 1.5], [.4, 1.92], [-.38, 1.92], [-.46, 1.45], [-.34, .3], [0, .2]], .78, .06));
    s.add('darkmetal', bx(0, 1.15, 0, .82, .04, .9, .01));                                              // panel gap ring
    s.add('paint2', at(sd([[.36, .5], [.4, 1.4], [.3, 1.75], [-.3, 1.75], [-.36, 1.3], [-.26, .5]], .1, .03), .42, 0, 0));  // outer layered plate
    s.add('paint', at(sd([[.25, .7], [.28, 1.3], [.2, 1.55], [-.2, 1.55], [-.25, 1.2], [-.18, .7]], .06, .02), .49, 0, 0));
    s.add('paint2', at(fr([[-.3, -.15], [.3, -.15], [.36, .25], [0, .5], [-.36, .25]], .14, .04), 0, 0, -.42, -.25, 0, 0)); // elbow cap (back)
    s.add('gold', at(fr([[-.12, .0], [.12, .0], [0, .22]], .05, .015), 0, .05, -.5, -.25, 0, 0));
    s.put(mVent(.3, .45, 4), -.43, 1.2, 0, 0, -PI / 2, 0);                                            // inner vent
    for (const y of [.62, 1.62]) for (const z of [-.18, .2]) s.add('metal', onN(bolt(.028), [.53, y, z], [1, 0, 0]));
    s.add('metal', ringY(.25, .06, 1.98, 6, 24));
    s.add('darkmetal', ball(.2, 0, 2.08, 0, 14, 10));
    return s;
  }
  function bThigh() {
    const s = B();
    s.add('darkmetal', ball(.45, 0, 0, 0, 20, 14), cy(.3, 2.2, 10, .3, .2));
    s.add('paint', sd([[.55, .35], [.62, 1.0], [.55, 2.15], [.35, 2.4], [-.45, 2.4], [-.55, 1.6], [-.5, .45], [0, .25]], 1.05, .07));
    s.add('darkmetal', bx(0, 1.25, 0, 1.08, .045, 1.2, .01), bx(0, .5, .45, 1.0, .03, .3, .01));
    s.add('paint2', at(sd([[.5, .55], [.56, 1.1], [.5, 2.0], [.32, 2.2], [.2, 2.2], [.2, .55]], 1.12, .05), 0, 0, 0));        // front armour layer
    s.add('paint', at(sd([[.4, .7], [.45, 1.2], [.4, 1.9], [.22, 2.05], [-.3, 2.05], [-.38, 1.4], [-.3, .7]], .08, .025), .58, 0, 0));
    s.add('paint', at(sd([[.4, .7], [.45, 1.2], [.4, 1.9], [.22, 2.05], [-.3, 2.05], [-.38, 1.4], [-.3, .7]], .08, .025), -.58, 0, 0));
    s.put(mVent(.4, .5, 5), .63, 1.35, -.05, 0, PI / 2, 0);
    for (const y of [.85, 1.75]) for (const z of [-.15, .25]) s.add('metal', onN(bolt(.03), [.62, y, z], [1, 0, 0]));
    piston(s, [.3, .5, -.55], [.3, 2.3, -.42], .07); piston(s, [-.3, .5, -.55], [-.3, 2.3, -.42], .07);
    s.add('darkmetal', cyX(.36, .9, 0, 2.6, 0, 22));
    s.add('metal', cyX(.24, 1.02, 0, 2.6, 0, 16));
    s.add('gold', cyX(.1, 1.06, 0, 2.6, 0, 10));
    return s;
  }
  function bShin() {
    const s = B();
    s.add('darkmetal', cyX(.32, .8, 0, 0, 0, 20), cy(.27, 2.5, 10, .22, .1));
    s.add('paint2', at(sd([[.25, -.45], [.6, -.25], [.62, .2], [.45, .45], [.15, .35], [.1, -.2]], .72, .05), 0, 0, 0));     // knee cap
    s.add('gold', at(sd([[.5, -.15], [.66, .05], [.5, .2]], .2, .02), 0, 0, 0));
    s.add('paint', sd([[.42, .35], [.5, 1.6], [.4, 2.45], [-.3, 2.5], [-.45, 2.0], [-.62, 1.0], [-.45, .35]], .9, .07));
    s.add('darkmetal', bx(0, 1.55, 0, .93, .04, 1.2, .01));
    s.add('paint2', at(sd([[.45, .5], [.52, 1.5], [.42, 2.35], [.25, 2.35], [.28, .5]], .96, .04), 0, 0, 0));                  // shin guard
    s.add('darkmetal', at(sd([[.5, 1.0], [.54, 1.1], [.54, 1.9], [.5, 2.0]], 1.0, .01), 0, 0, 0));
    for (const x of [-.22, .22]) s.put(mThruster(.17, .42, 6), x, 1.95, -.62, 0, 0, 0);                                         // calf thrusters (+Y = down)
    s.add('darkmetal', bx(0, 1.85, -.52, .7, .25, .2, .04));
    s.put(mVent(.36, .5, 5), .46, 1.0, -.1, 0, PI / 2, 0); s.put(mVent(.36, .5, 5), -.46, 1.0, -.1, 0, -PI / 2, 0);
    piston(s, [0, .3, -.5], [0, 1.65, -.55], .06);
    s.add('metal', ringY(.24, .06, 2.55, 6, 24));
    s.add('darkmetal', ball(.27, 0, 2.72, 0, 16, 12));
    return s;
  }
  function bFootArmored() {
    const s = B();
    s.add('darkmetal', ball(.28, 0, 0, 0, 16, 12), cyX(.2, .7, 0, .18, 0, 14));
    s.add('paint', sd([[-.65, .4], [-.2, .25], [.55, .3], [1.25, .55], [1.45, .8], [1.45, .95], [-.75, .95], [-.8, .7]], .95, .06));
    s.add('paint2', at(sd([[.45, .35], [1.2, .58], [1.38, .8], [.5, .8], [.3, .55]], 1.0, .05), 0, 0, 0));                      // toe cap
    s.add('darkmetal', at(sd([[.42, .42], [.48, .4], [.5, .85], [.44, .85]], 1.02, .01), 0, 0, 0));
    s.add('paint2', at(sd([[-.35, .1], [.3, .05], [.42, .32], [-.4, .38]], .75, .05), 0, 0, 0));                             // ankle guard
    s.add('rubber', bx(0, 1.0, .35, .98, .12, 2.15, .03));
    for (let i = 0; i < 8; i++) s.add('darkmetal', bx(0, 1.07, -.6 + i * .27, .9, .04, .1, .01));
    s.add('darkmetal', at(sd([[-.8, .5], [-1.05, .75], [-1.0, .92], [-.75, .92]], .5, .04), 0, 0, 0));                        // heel spur
    for (const x of [-.48, .48]) { s.add('metal', onN(bolt(.03), [x, .7, .1], [Math.sign(x), 0, 0])); s.add('metal', onN(bolt(.03), [x, .7, -.4], [Math.sign(x), 0, 0])); }
    piston(s, [.34, .1, -.3], [.34, .7, -.6], .045); piston(s, [-.34, .1, -.3], [-.34, .7, -.6], .045);
    return s;
  }

  const P = [];
  const part = (id, group, sub, name, tags, make) => P.push({id: 'mk_' + id, group, sub, name, tags, make});
  const GH = 'Mech Heads', GT = 'Mech Torso & Core', GL = 'Mech Arms & Legs', GD = 'Mech Details';

  // =================================================================== MECH HEADS
  part('head_knight', GH, 'Knight', 'Knight visor helm', ['knight', 'helm', 'visor'], () => {
    const s = B();
    s.add('paint', hl([[0, .42], [.58, .42], [.66, .5], [.77, .8], [.83, 1.15], [.83, 1.45], [.77, 1.72], [.62, 1.95], [.36, 2.1], [0, 2.15]], 40));
    s.add('paint2', band([[.82, 1.0], [.89, 1.03], [.9, 1.25], [.84, 1.27]], -65, 65, 28));
    s.add('paint2', band([[.84, 1.35], [.9, 1.37], [.88, 1.58], [.8, 1.62]], -65, 65, 28));
    s.add('glow', band([[.76, 1.27], [.865, 1.27], [.865, 1.35], [.76, 1.35]], -60, 60, 28));
    s.add('paint', band([[.6, .44], [.69, .42], [.91, .98], [.83, 1.0]], -72, 72, 28));                  // chin bevor
    s.add('darkmetal', band([[.62, .9], [.86, .93], [.86, .95], [.62, .93]], -72, 72, 28));
    for (let k = -3; k <= 3; k++) s.add('darkmetal', at(at(cbox(.045, .26, .05, .01), 0, 0, 0, 20 * D), ...polar(.8, k * 13, .7), 0, k * 13 * D, 0));
    s.add('gold', ringY(.6, .04, .45, 6, 36));
    for (let i = 0; i < 16; i++) s.add('metal', ball(.03, ...polar(.66, i * 22.5, .54), 6, 5));
    s.add('paint2', sd([[.45, 1.95], [.15, 2.28], [-.45, 2.42], [-1.05, 2.2], [-.95, 2.08], [-.35, 2.16], [.05, 2.08]], .09, .025));
    s.add('gold', sd([[.4, 2.0], [.12, 2.26], [.02, 2.27], [.3, 1.98]], .11, .015));
    for (const side of [1, -1]) {
      s.add('metal', at(cy(.21, .08, 24), .8 * side, 1.3, 0, 0, 0, -PI / 2 * side));
      s.add('darkmetal', at(cy(.14, .12, 20), .8 * side, 1.3, 0, 0, 0, -PI / 2 * side));
      s.add('gold', at(cy(.06, .16, 10), .8 * side, 1.3, 0, 0, 0, -PI / 2 * side));
    }
    for (let i = 0; i < 2; i++) s.add(i ? 'paint2' : 'paint', band([[.6 + i * .06, .5 - i * .17], [.66 + i * .06, .48 - i * .17], [.78 + i * .07, .2 - i * .17], [.72 + i * .07, .22 - i * .17]], 110, 250, 20));
    const b = B().put(mNeck(.55, .32)); b.put(s, 0, 0, 0, 0, 0, 0, [1, 1, 1.12]);
    return b.out();
  });

  part('head_vcrest', GH, 'Hero', 'Tri-fin hero head', ['hero', 'crest', 'v-fin', 'twin-eye'], () => {
    const b = B().put(mNeck(.5, .28));
    b.add('darkmetal', bx(0, .95, 0, .86, .7, .86, .06));
    b.add('paint', sd([[.42, .9], [.5, 1.22], [.38, 1.5], [-.1, 1.62], [-.5, 1.48], [-.56, .85], [-.35, .62], [.1, .64]], .98, .07));
    b.add('darkmetal', sd([[.44, 1.08], [.52, 1.1], [.5, 1.2], [.42, 1.18]], 1.0, .01));
    b.add('paint2', at(sd([[.35, 1.48], [-.1, 1.6], [-.48, 1.47], [-.4, 1.4], [-.1, 1.5], [.3, 1.4]], .5, .03), 0, .03, 0));   // top ridge plate
    b.sym('paint2', bx(.55, 1.02, -.05, .16, .52, .62, .04));
    b.sym('metal', at(cy(.14, .06, 20), .63, 1.05, -.05, 0, 0, -PI / 2));
    b.sym('glow', at(cy(.07, .09, 12), .63, 1.05, -.05, 0, 0, -PI / 2));
    b.add('paint2', at(fr([[-.3, .95], [.3, .95], [.24, .7], [0, .55], [-.24, .7]], .14, .04), 0, 0, .46));                 // face plate
    for (const y of [.86, .8, .74]) b.add('darkmetal', bx(0, y, .54, .22 - (.86 - y), .025, .02, .006));
    b.add('darkmetal', bx(0, 1.04, .44, .8, .16, .16, .02));
    b.sym('glow', at(fr([[.05, .99], [.33, 1.06], [.34, .99], [.08, .965]], .05, .012), 0, .03, .52));
    b.add('gold', at(fr([[-.07, 1.18], [.07, 1.18], [.08, 1.28], [0, 1.34], [-.08, 1.28]], .1, .02), 0, 0, .52));
    b.add('glow', at(fr(ngon(6, .045, PI / 2, 0, 1.255), .04, .01), 0, 0, .58));
    b.sym('gold', at(fr([[.05, 1.24], [.13, 1.22], [.82, 1.86], [.78, 1.98], [.6, 1.9]], .05, .015), 0, 0, .5, -.25, 0, 0));
    b.sym('paint2', at(fr([[.12, 1.25], [.17, 1.25], [.45, 1.5], [.4, 1.53]], .04, .01), 0, 0, .5, -.2, 0, 0));
    b.add('gold', at(fr([[-.05, 1.3], [.05, 1.3], [0, 1.82]], .05, .015), 0, 0, .48, -.35, 0, 0));
    b.sym('metal', rod([.3, 1.4, -.45], [.42, 1.75, -.85], .025, 6, .01));
    b.sym('darkmetal', bx(.38, .7, .2, .1, .18, .3, .02));
    b.sym('metal', mVentBars());
    return b.out();
    function mVentBars() { const g = []; for (let i = 0; i < 3; i++) g.push(bx(.44, .66 + i * .05, .2, .02, .025, .26, .005)); return g; }
  });

  part('head_monoeye', GH, 'Scout', 'Mono-eye dome', ['mono-eye', 'dome', 'rail'], () => {
    const b = B().put(mNeck(.45, .3)), s = B();
    s.add('paint', hl([[0, .4], [.72, .4], [.82, .5], [.9, .8], [.86, 1.15], [.68, 1.42], [.36, 1.58], [0, 1.62]], 40));
    s.add('darkmetal', band([[.84, .87], [.93, .89], [.93, 1.11], [.86, 1.14]], -82, 82, 32));
    s.add('metal', band([[.87, .85], [.95, .86], [.95, .89], [.87, .9]], -84, 84, 32));
    s.add('metal', band([[.87, 1.11], [.95, 1.11], [.95, 1.14], [.86, 1.15]], -84, 84, 32));
    s.add('paint2', band([[.4, 1.52], [.6, 1.42], [.62, 1.46], [.42, 1.56]], 0, 360, 36));
    s.add('paint2', hl([[.74, .38], [.82, .38], [.84, .5], [.76, .5]], 36, true));
    for (let i = 0; i < 18; i++) s.add('metal', onN(bolt(.03), polar(.82, i * 20, .44), polar(1, i * 20, 0)));
    const b2 = B().put(s, 0, 0, 0, 0, 0, 0, [1, 1, 1.05]); b.put(b2);
    const ea = 14, ep = polar(.9, ea, 1.0); ep[2] *= 1.05;
    b.add('darkmetal', at(cy(.14, .06, 20), ...ep, PI / 2, ea * D, 0));
    b.add('glow', ball(.105, ep[0] + Math.sin(ea * D) * .04, ep[1], ep[2] + .04, 16, 12));
    b.add('gold', at(ringY(.14, .018, 0, 4, 20), ep[0], ep[1], ep[2] + .04, PI / 2, ea * D, 0));
    for (const sd_ of [1, -1]) hoseFull(b, K.cr([V3(.72 * sd_, .7, .35), V3(.6 * sd_, .45, .75), V3(.3 * sd_, .25, .7), V3(.18 * sd_, .15, .32)]), .065, 9);
    b.add('paint2', at(fr([[-.25, .45], [.25, .45], [.2, .8], [-.2, .8]], .2, .04), 0, 0, .78, -.25, 0, 0));
    for (let i = 0; i < 3; i++) b.add('darkmetal', at(bx(0, .52 + i * .1, .89, .3, .03, .02, .006), 0, 0, 0, 0, 0, 0));
    b.add('paint2', sd([[.1, 1.58], [-.2, 1.95], [-.35, 1.95], [-.3, 1.62]], .06, .02));
    b.add('metal', rod([.2, 1.5, -.3], [.38, 2.0, -.5], .02, 6, .008));
    b.sym('darkmetal', at(cy(.12, .3, 14), .3, .9, -.82, PI / 2 + .3, 0, 0));
    b.sym('metal', at(cy(.09, .02, 14, .09, .3), .3, .9, -.82, PI / 2 + .3, 0, 0));
    return b.out();
  });

  part('head_twineye', GH, 'Hero', 'Twin-eye faceplate', ['twin-eye', 'faceplate', 'antenna'], () => {
    const b = B().put(mNeck(.45, .28));
    b.add('darkmetal', bx(0, .95, -.02, .82, .72, .84, .06));
    b.add('paint', sd([[.3, 1.2], [.38, 1.42], [.1, 1.62], [-.4, 1.58], [-.55, 1.25], [-.5, .8], [-.3, .7], [-.3, 1.1], [.2, 1.12]], .94, .06));
    b.add('paint2', at(sd([[.3, 1.42], [.1, 1.58], [-.4, 1.54], [-.38, 1.5], [.08, 1.53], [.26, 1.4]], .4, .02), 0, .03, 0));
    b.add('paint', at(fr([[-.42, 1.18], [.42, 1.18], [.46, 1.25], [.3, 1.32], [-.3, 1.32], [-.46, 1.25]], .26, .04), 0, 0, .32));   // brow
    b.add('darkmetal', bx(0, 1.07, .4, .74, .14, .1, .02));
    b.sym('glow', at(fr([[.06, 1.03], [.32, 1.05], [.34, 1.11], [.1, 1.12]], .05, .015), 0, 0, .46));
    b.add('paint2', at(fr([[-.34, 1.0], [.34, 1.0], [.32, .78], [.12, .6], [-.12, .6], [-.32, .78]], .16, .045), 0, 0, .42));      // face plate
    for (let i = -2; i <= 2; i++) b.add('darkmetal', bx(i * .06, .74, .51, .025, .2 - Math.abs(i) * .03, .02, .006));
    b.add('darkmetal', bx(0, .92, .51, .5, .02, .02, .005));
    b.sym('paint', at(fr([[0, -.25], [.18, -.2], [.2, .25], [0, .3]], .12, .03), .46, .9, .08, 0, PI / 2, 0));                  // cheek guards
    b.sym('darkmetal', at(cy(.15, .05, 22), .47, 1.0, -.15, 0, 0, -PI / 2));
    b.sym('metal', at(hl([[0, 0], [.13, 0], [.13, .04], [.06, .1], [0, .1]], 20), .52, 1.0, -.15, 0, 0, -PI / 2));
    for (let i = 0; i < 6; i++) b.sym('darkmetal', at(cbox(.02, .12, .015, .004), .55, 1.0 + Math.cos(i * PI / 3) * .09, -.15 + Math.sin(i * PI / 3) * .09, i * PI / 3, 0, 0));
    b.sym('paint2', at(fr([[0, 0], [.08, 0], [.05, .9], [.0, .95]], .045, .012), .32, 1.3, .1, -.95, 0, -.45));                // swept antennas
    b.sym('metal', at(cy(.04, .1, 8), .3, 1.27, .1, -.95, 0, -.45));
    b.add('darkmetal', at(fr([[-.15, 0], [.15, 0], [.1, .12], [-.1, .12]], .1, .02), 0, .55, .3));
    return b.out();
  });

  part('head_insect', GH, 'Beast', 'Insect sensor head', ['insect', 'compound-eye', 'mandible'], () => {
    const b = B();
    for (let i = 0; i < 4; i++) { b.add(i % 2 ? 'metal' : 'darkmetal', cy(.28 - i * .02, .12, 14, .28 - i * .02, i * .12)); }
    const body = B();
    body.add('paint', hl([[0, -.85], [.25, -.8], [.45, -.6], [.52, -.25], [.5, .2], [.42, .55], [.25, .8], [0, .88]], 28));
    body.add('darkmetal', ...[-.35, .05, .45].map(y => hl([[.5 - Math.abs(y) * .15, y - .03], [.56 - Math.abs(y) * .15, y], [.5 - Math.abs(y) * .15, y + .03]], 28, true)));
    b.put(body, 0, .95, -.05, PI / 2 + .12, 0, 0, [1, 1, .85]);
    b.add('paint2', at(sd([[.6, 1.2], [.1, 1.45], [-.7, 1.35], [-.8, 1.2], [-.1, 1.3], [.4, 1.15]], .5, .04), 0, 0, 0));
    for (const s_ of [1, -1]) {
      const c = V3(.3 * s_, 1.02, .58);
      b.add('darkmetal', ball(.25, c.x, c.y, c.z, 18, 14));
      const pts = []; const N = 60;
      for (let i = 0; i < N; i++) { const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), a = i * 2.39996; const d = V3(Math.cos(a) * r, y, Math.sin(a) * r); if (d.z * .8 + d.x * s_ * .45 > .25) pts.push(d); }
      for (const d of pts) b.add('glow', ball(.05, c.x + d.x * .25, c.y + d.y * .25, c.z + d.z * .25, 6, 5));
      b.add('metal', at(ringY(.255, .02, 0, 4, 28), c.x, c.y, c.z, PI / 2 - .3, s_ * .5, 0));
      b.add('metal', taper(K.bez(V3(.2 * s_, .72, .62), V3(.38 * s_, .5, 1.0), V3(.12 * s_, .48, 1.25)), .06, .012, 16, 7, .6));
      b.add('glow', ball(.025, .12 * s_, .48, 1.25, 6, 5));
      b.add('darkmetal', ball(.07, .2 * s_, .72, .62, 10, 8));
      b.add('metal', taper(K.cr([V3(.12 * s_, 1.38, .3), V3(.3 * s_, 1.8, .55), V3(.55 * s_, 2.2, .45), V3(.75 * s_, 2.45, .15)]), .035, .01, 24, 6));
      for (const t of [.25, .5, .75]) { const p = K.cr([V3(.12 * s_, 1.38, .3), V3(.3 * s_, 1.8, .55), V3(.55 * s_, 2.2, .45), V3(.75 * s_, 2.45, .15)]).getPointAt(t); b.add('darkmetal', ball(.045 - t * .02, p.x, p.y, p.z, 8, 6)); }
      b.add('darkmetal', ball(.07, .12 * s_, 1.38, .3, 10, 8));
    }
    b.add('glow', ball(.06, 0, 1.25, .78, 10, 8));
    b.add('paint2', at(fr([[-.12, -.15], [.12, -.15], [.06, .15], [-.06, .15]], .12, .03), 0, .75, .7, .5, 0, 0));
    return b.out();
  });

  part('head_kabuto', GH, 'Samurai', 'Samurai kabuto', ['samurai', 'kabuto', 'horns'], () => {
    const b = B().put(mNeck(.5, .28));
    const bowl = [[0, .95], [.68, .95], [.72, 1.1], [.7, 1.35], [.6, 1.58], [.38, 1.74], [0, 1.79]];
    b.add('paint', hl(bowl, 40));
    const prof = K.cr([V3(.71, 1.0, 0), V3(.71, 1.3, 0), V3(.62, 1.56, 0), V3(.4, 1.73, 0), V3(.08, 1.795, 0)]);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, m = new T.Matrix4().makeRotationY(a); const c = K.cr(prof.getPoints(8).map(p => p.clone().applyMatrix4(m).multiplyScalar(1.01))); b.add('metal', taper(c, .018, .012, 16, 5)); }
    b.add('gold', hl([[0, 1.77], [.12, 1.77], [.12, 1.81], [.08, 1.85], [0, 1.85]], 20));
    b.add('paint2', band([[.68, .95], [1.0, .86], [1.0, .9], [.72, 1.01]], -70, 70, 28));                  // brim
    b.add('gold', band([[.99, .855], [1.03, .855], [1.03, .91], [.99, .91]], -70, 70, 28));
    for (let i = 0; i < 4; i++) {
      const yt = .96 - i * .16, rt = .7 + i * .1, yb = yt - .2, rb = rt + .12;
      b.add(i % 2 ? 'paint2' : 'paint', band([[rt, yt], [rb, yb], [rb + .05, yb + .01], [rt + .05, yt + .01]], 62, 298, 28));
      b.add('darkmetal', band([[rb - .02, yb - .015], [rb + .05, yb - .015], [rb + .05, yb + .01], [rb - .02, yb + .01]], 62, 298, 28));
      for (let k = 0; k < 9; k++) b.add('gold', ball(.022, ...polar(rt + .07, 75 + k * 26.25, yt - .1), 5, 4));
    }
    b.sym('paint', at(fr([[0, -.05], [.36, -.08], [.42, .32], [0, .38]], .05, .015), ...polar(.86, 64, .8), 0, (64 + 90) * D - PI, .2));   // fukigaeshi
    b.sym('gold', at(fr([[.05, .0], [.32, -.02], [.36, .28], [.05, .32]], .02, .005), ...polar(.89, 64, .8), 0, (64 + 90) * D - PI, .2));
    b.add('gold', at(fr([[-.22, 0], [.22, 0], [.16, .28], [0, .36], [-.16, .28]], .07, .02), 0, .98, .76, -.25, 0, 0));
    b.add('glow', at(fr(ngon(16, .07, 0, 0, .16), .04, .01), 0, .98, .81, -.25, 0, 0));
    b.sym('gold', taper(K.bez(V3(.1, 1.08, .8), V3(.5, 1.3, 1.05), V3(.85, 1.9, .9), V3(.75, 2.55, .55)), .085, .015, 28, 10, .38));
    b.add('darkmetal', band([[.55, .45], [.66, .48], [.7, .9], [.6, .92]], -58, 58, 24));                 // menpo mask
    b.sym('glow', at(fr([[.05, 0], [.24, .03], [.22, .07], [.06, .06]], .03, .008), 0, .78, .69));
    b.add('paint2', at(fr([[-.18, 0], [.18, 0], [.12, .14], [-.12, .14]], .06, .015), 0, .55, .68, .2, 0, 0));
    for (let i = -2; i <= 2; i++) b.add('gold', bx(i * .055, .6, .72, .02, .1, .02, .005, .2, 0, 0));
    b.sym('paint2', at(fr([[0, 0], [.2, .02], [.24, .1], [.02, .08]], .05, .015), .04, .66, .69, 0, 0, -.15));     // mustache plates
    return b.out();
  });

  part('head_skull', GH, 'Brute', 'Chrome skull head', ['skull', 'jaw', 'menacing'], () => {
    const b = B().put(mNeck(.4, .3));
    b.add('metal', ball(.7, 0, 1.38, -.05, 32, 22).scale(1, 1, 1).applyMatrix4(new T.Matrix4().makeScale(1, .92, 1.1)).translate(0, .11, .005));
    b.add('metal', band([[.62, 1.38], [.74, 1.36], [.76, 1.48], [.66, 1.52]], -65, 65, 24));            // brow ridge
    for (const s_ of [1, -1]) {
      b.add('darkmetal', ball(.2, .26 * s_, 1.24, .66, 18, 14).applyMatrix4(new T.Matrix4().makeScale(1, 1, 1)));
      b.add('glow', ball(.065, .26 * s_, 1.23, .82, 12, 10));
      b.add('metal', at(fr([[0, 0], [.32, .05], [.36, .2], [.05, .12]], .1, .03), .28 * s_, 1.0, .5, 0, -s_ * .7, 0));
      piston(b, [.56 * s_, 1.12, .1], [.48 * s_, .62, .38], .05);
    }
    b.add('darkmetal', at(fr([[-.09, .0], [.09, .0], [0, .2]], .12, .02), 0, 1.02, .74, 0, 0, PI));
    for (let k = -4; k <= 4; k++) b.add('tooth', at(cbox(.07, .14, .07, .02), ...polar(.66, k * 11, .86), 0, k * 11 * D, 0));
    b.add('darkmetal', band([[.5, .52], [.64, .56], [.7, .8], [.58, .8]], -62, 62, 24));
    for (let k = -4; k <= 4; k++) b.add('tooth', at(cbox(.065, .12, .07, .02), ...polar(.63, k * 11, .74), 0, k * 11 * D, 0));
    b.add('paint', band([[.45, .42], [.66, .45], [.7, .58], [.56, .6]], -64, 64, 24));
    b.add('darkmetal', band([[.6, .95], [.69, .95], [.69, .99], [.6, .99]], -50, 50, 24));
    for (let i = 0; i < 5; i++) b.add('darkmetal', at(sd([[.15, 0], [-.4, .02], [-.7, -.2], [-.2, -.08]], .05, .015), (i - 2) * .14, 2.02 - Math.abs(i - 2) * .05, -.15));
    b.add('rubber', ...[1, -1].map(s_ => hose(K.cr([V3(.45 * s_, 1.1, -.55), V3(.55 * s_, .7, -.5), V3(.3 * s_, .3, -.3)]), .05, 8)));
    return b.out();
  });

  part('head_cyclops', GH, 'Brute', 'Cyclops lens head', ['cyclops', 'lens', 'single-eye'], () => {
    const b = B().put(mNeck(.4, .3));
    b.add('darkmetal', bx(0, .85, 0, 1.1, .6, .9, .06));
    b.add('paint', sd([[.5, .7], [.62, 1.1], [.4, 1.4], [-.3, 1.45], [-.6, 1.2], [-.6, .7], [-.3, .5], [.3, .5]], 1.24, .08));
    const lens = B().put(mLens(.27, .32, 'eye'));
    b.put(lens, 0, .95, .5);
    b.add('glow', at(cy(.12, .02, 20), 0, .95, .71, PI / 2, 0, 0));
    b.add('rubber', ...[...Array(24)].map((_, i) => at(cbox(.03, .06, .03, .005), Math.cos(i / 24 * TAU) * .39, .95 + Math.sin(i / 24 * TAU) * .39, .64, 0, 0, i / 24 * TAU)));
    b.add('paint2', at(fr([[-.56, .2], [-.38, .45], [.38, .45], [.56, .2], [.5, .12], [-.5, .12]], .3, .05), 0, 1.1, .38, -.3, 0, 0));  // brow hood
    b.sym('paint2', at(fr([[0, 0], [.3, .05], [.32, .5], [0, .55]], .12, .03), .64, .65, .1, 0, PI / 2, 0));
    b.sym('metal', at(mLensG(), .66, 1.15, .35));
    for (let i = 0; i < 4; i++) b.add('darkmetal', at(fr([[0, 0], [.04, 0], [.12, .25], [.06, .25]], .05, .015), 0, 1.4 - i * .02, .2 - i * .22, 0, PI / 2, 0));
    for (let i = 0; i < 4; i++) b.add('darkmetal', at(sd([[0, 0], [-.18, .22], [-.26, .22], [-.12, 0]], .05, .015), 0, 1.4, .15 - i * .2));
    b.add('gold', at(fr([[-.1, 0], [.1, 0], [0, -.1]], .04, .01), 0, .6, .5));
    return b.out();
    function mLensG() { return ball(.07, 0, 0, 0, 10, 8); }
  });

  part('head_bunker', GH, 'Heavy', 'Heavy bunker head', ['heavy', 'bunker', 'periscope', 'tank'], () => {
    const b = B().put(mNeck(.35, .34));
    b.add('darkmetal', bx(0, .7, 0, 1.6, .6, 1.2, .06));
    b.add('paint', sd([[.55, .45], [.72, .7], [.5, 1.05], [-.55, 1.1], [-.7, .9], [-.65, .45]], 1.7, .08));
    b.add('paint2', at(sd([[.45, 1.0], [-.5, 1.06], [-.55, 1.0], [.4, .94]], 1.5, .03), 0, .06, 0));
    b.add('darkmetal', at(fr([[-.75, -.04], [.75, -.04], [.75, .04], [-.75, .04]], .1, .01), 0, .78, .66, -.6, 0, 0));
    b.add('glow', at(fr([[-.7, -.018], [.7, -.018], [.7, .018], [-.7, .018]], .1, .005), 0, .78, .67, -.6, 0, 0));
    b.add('paint2', at(fr([[-.8, 0], [.8, 0], [.7, .22], [-.7, .22]], .14, .04), 0, .42, .62, .55, 0, 0));    // chin plate
    for (let i = -3; i <= 3; i++) b.add('metal', onN(bolt(.03), [i * .22, .5, .7], [0, -.3, 1]));
    for (const x of [-.4, 0, .4]) { b.add('darkmetal', bx(x, 1.2, .05, .18, .22, .22, .03)); b.add('crystal', bx(x, 1.22, .17, .14, .1, .03, .01)); b.add('metal', bx(x, 1.33, .05, .2, .03, .24, .01)); }
    for (const s_ of [1, -1]) for (let i = 0; i < 3; i++) {
      b.add('darkmetal', at(cy(.07, .32, 12), .9 * s_, .65 + i * .16, .1, -.5, 0, -s_ * 1.0));
      b.add('paint2', at(cy(.06, .02, 12, .06, .3), .9 * s_, .65 + i * .16, .1, -.5, 0, -s_ * 1.0));
    }
    b.sym('paint', bx(.88, .7, .05, .1, .55, .7, .03));
    b.sym('glow', at(cy(.08, .04, 16), .55, .95, .58, PI / 2 - .5, 0, 0));
    b.sym('metal', at(hl([[.08, 0], [.11, 0], [.11, .08], [.08, .08]], 16, true), .55, .95, .58, PI / 2 - .5, 0, 0));
    b.add('metal', rod([-.6, 1.05, -.5], [-.7, 2.0, -.7], .025, 6, .01));
    b.add('darkmetal', at(cy(.06, .12, 10), -.6, 1.02, -.5));
    for (let i = 0; i < 5; i++) b.add('darkmetal', bx(-.3 + i * .15, 1.0, -.65, .04, .12, .3, .01, -.3, 0, 0));
    return b.out();
  });

  part('head_tv', GH, 'Retro', 'Retro TV head', ['tv', 'screen', 'retro', 'antenna'], () => {
    const b = B().put(mNeck(.35, .26));
    b.add('darkmetal', cyX(.12, .5, 0, .38, 0, 14));
    b.add('paint', at(fr(rr(1.56, 1.2, .18, 4), .8, .06), 0, 1.0, -.08));
    b.add('paint2', at(ex(holed(rr(1.62, 1.26, .2, 4), rr(1.02, .86, .14, 4, -.24, 0)), .14, .04), 0, 1.0, .36));
    b.add('darkmetal', at(ex(holed(rr(1.06, .9, .15, 4, -.24, 0), rr(.98, .82, .12, 4, -.24, 0)), .06, .01), 0, 1.0, .29));
    b.add('screen', at(displacedPlane(1.0, .84, .06), -.24, 1.0, .3));
    for (const y of [.25, .03]) {
      b.add('metal', at(hl([[0, 0], [.1, 0], [.1, .03], [.085, .05], [.085, .09], [.06, .11], [0, .11]], 18), .52, 1.0 + y, .42, PI / 2, 0, 0));
      for (let i = 0; i < 12; i++) b.add('darkmetal', at(cbox(.012, .012, .06, .003), .52 + Math.cos(i / 12 * TAU) * .088, 1.0 + y + Math.sin(i / 12 * TAU) * .088, .49));
      b.add('glow', bx(.52, 1.0 + y + .07, .52, .015, .03, .02, .004));
    }
    for (let i = 0; i < 5; i++) b.add('darkmetal', bx(.52, .74 - i * .05, .44, .22, .022, .02, .005));
    b.add('glow', ball(.025, .38, .5, .44, 8, 6));
    b.add('darkmetal', at(hl([[0, 0], [.2, 0], [.18, .08], [.1, .12], [0, .13]], 20), 0, 1.6, -.05));
    b.sym('metal', rod([.04, 1.68, -.05], [.62, 2.55, -.15], .018, 6, .012));
    b.sym('metal', ball(.04, .62, 2.55, -.15, 8, 6));
    for (let i = 0; i < 6; i++) b.add('darkmetal', bx(0, .65 + i * .12, -.5, 1.0, .03, .03, .008));
    b.sym('rubber', bx(.62, .4, .1, .16, .06, .5, .02));
    b.add('gold', bx(-.24, .5, .44, .3, .04, .02, .006));
    return b.out();
  });

  part('head_crt', GH, 'Retro', 'CRT monitor head', ['crt', 'screen', 'retro', 'computer'], () => {
    const b = B().put(mNeck(.4, .26));
    b.add('paint', at(fr(rr(1.4, 1.14, .12, 3), .42, .05), 0, 1.0, .18));
    const back = new T.CylinderGeometry(.5, 1.0, .72, 4, 1).rotateY(PI / 4); back.applyMatrix4(new T.Matrix4().makeScale(1.38 / 1.414, 1, 1.1 / 1.414));
    b.add('paint', at(back, 0, 1.0, -.38, -PI / 2, 0, 0));
    b.add('paint2', at(ex(holed(rr(1.3, 1.04, .14, 4), rr(1.06, .82, .16, 5)), .12, .035), 0, 1.0, .42));
    b.add('darkmetal', at(ex(holed(rr(1.08, .84, .16, 5), rr(1.0, .76, .14, 5)), .06, .01), 0, 1.0, .37));
    b.add('screen', at(displacedPlane(1.04, .8, .1), 0, 1.0, .36));
    for (let i = 0; i < 7; i++) b.add('darkmetal', at(cbox(.5, .025, .025, .006), 0, 1.0 + .26 + i * 0.0, -.2 - i * .07, -.32, 0, 0).translate(0, -i * .02, 0));
    b.add('darkmetal', bx(0, .47, .44, .9, .1, .06, .02));
    for (let i = 0; i < 4; i++) b.add(i === 0 ? 'glow' : 'metal', bx(-.38 + i * .12, .47, .48, .07, .04, .03, .008));
    b.add('metal', at(hl([[0, 0], [.07, 0], [.07, .04], [.05, .06], [0, .06]], 14), .38, .47, .47, PI / 2, 0, 0));
    b.sym('darkmetal', at(cbox(.06, .5, .1, .02), .73, 1.05, .1));
    b.add('metal', at(new T.TorusGeometry(.22, .018, 6, 28), .3, 1.86, -.2, 0, .4, 0));
    b.add('metal', rod([.3, 1.58, -.2], [.3, 1.66, -.2], .04, 8), rod([-.3, 1.58, -.25], [-.45, 2.3, -.35], .015, 6, .01));
    b.add('darkmetal', at(cy(.08, .06, 12), -.3, 1.57, -.25));
    b.add('glow', ball(.03, -.45, 2.3, -.35, 8, 6));
    b.add('rubber', bx(0, .45, -.1, 1.2, .06, .9, .02));
    return b.out();
  });

  part('head_monitor', GH, 'Retro', 'Flat monitor head', ['monitor', 'screen', 'display'], () => {
    const b = B();
    b.add('darkmetal', cy(.18, .55, 16, .14));
    b.add('metal', ringY(.16, .03, .1, 6, 20), ringY(.15, .03, .25, 6, 20));
    b.add('darkmetal', cyX(.12, .4, 0, .62, 0, 16), bx(0, .62, 0, .22, .28, .2, .03));
    b.add('darkmetal', bx(0, 1.12, -.2, .9, .62, .2, .06));
    for (let i = 0; i < 5; i++) b.add('metal', bx(0, .92 + i * .1, -.31, .7, .03, .02, .006));
    b.add('paint', at(fr(rr(1.8, 1.08, .06, 3), .12, .03), 0, 1.15, -.06));
    b.add('paint2', at(ex(holed(rr(1.8, 1.08, .06, 3), rect(1.66, .94)), .05, .01), 0, 1.15, .03));
    b.add('screen', at(new T.PlaneGeometry(1.66, .94, 2, 2), 0, 1.15, .01));
    b.add('darkmetal', bx(0, .6 + .01, -.06, .4, .06, .12, .02));
    b.add('gold', bx(0, .64, .04, .2, .02, .02, .005));
    b.add('glow', ball(.015, .8, .64, .05, 6, 5));
    b.add('darkmetal', bx(0, 1.72, -.04, .26, .1, .14, .03));
    b.put(mLens(.03, .04, 'eye'), 0, 1.72, .03);
    b.sym('darkmetal', bx(.95, 1.15, -.06, .1, .7, .14, .03));
    b.sym('metal', ...[0, 1, 2, 3, 4, 5].map(i => bx(1.0, .9 + i * .1, -.06, .02, .05, .1, .005)));
    b.sym('darkmetal', at(cy(.07, .12, 12), 1.0, 1.55, -.06, 0, 0, -PI / 2));
    b.sym('glow', at(cy(.04, .02, 12, .04, .12), 1.0, 1.55, -.06, 0, 0, -PI / 2));
    return b.out();
  });

  part('head_camera', GH, 'Sensor', 'Camera-lens head', ['camera', 'lens', 'recording'], () => {
    const b = B().put(mNeck(.4, .26));
    b.add('paint', bx(0, .95, -.05, 1.0, .72, .9, .07));
    b.add('darkmetal', bx(0, .95, -.05, 1.02, .04, .92, .01));
    b.add('paint2', at(sd([[.4, 1.3], [-.4, 1.3], [-.5, 1.38], [-.3, 1.48], [.3, 1.46]], .7, .04), 0, 0, 0));
    const L = [[.0, 0], [.36, 0], [.38, .05], [.38, .12], [.34, .14], [.34, .18], [.36, .2], [.36, .24], [.34, .26], [.34, .3], [.36, .32], [.36, .36], [.34, .38], [.34, .42], [.3, .44], [.3, .52], [.33, .54], [.42, .72], [.4, .74], [.29, .58], [.24, .56], [0, .56]];
    b.add('darkmetal', at(hl(L, 36, false, 0, TAU, 25), 0, .95, .4, PI / 2, 0, 0));
    b.add('rubber', at(hl([[.355, .14], [.375, .14], [.375, .42], [.355, .42]], 36, true), 0, .95, .4, PI / 2, 0, 0));
    for (let i = 0; i < 24; i++) b.add('rubber', at(cbox(.02, .26, .02, .004), ...polar(.38, i * 15, 0), 0, i * 15 * D, 0).rotateX(PI / 2).translate(0, .95, .68));
    b.add('metal', at(ringY(.37, .02, .06, 6, 32), 0, .95, .4, PI / 2, 0, 0));
    b.add('eye', at(new T.SphereGeometry(.3, 28, 10, 0, TAU, 0, PI / 4).translate(0, .43, 0), 0, .95, .4, PI / 2, 0, 0));
    b.add('glow', at(ringY(.18, .012, .55, 4, 28), 0, .95, .4, PI / 2, 0, 0));
    b.add('darkmetal', bx(-.15, 1.48, -.25, .3, .2, .5, .04));
    b.add('darkmetal', at(cy(.06, .14, 12), -.15, 1.48, -.6, PI / 2, 0, 0).translate(0, 0, .14));
    b.add('rubber', rod([.25, 1.32, .1], [.25, 1.6, .1], .03, 8), at(cy(.07, .2, 12), .25, 1.62, .0, PI / 2, 0, 0));
    b.add('glow', ball(.04, .38, 1.22, .42, 10, 8));
    b.add('darkmetal', at(fr(rr(.5, .36, .04, 2), .05, .015), -.62, .95, .05, 0, -PI / 2 - .5, 0));
    b.add('screen', at(fr(rr(.44, .3, .03, 2), .01, 0), -.65, .95, .07, 0, -PI / 2 - .5, 0).translate(-.012, 0, -.02));
    b.add('metal', cyZ(.03, .2, -.52, .95, -.1, 8));
    for (let i = 0; i < 3; i++) b.add('darkmetal', bx(.51, .8 + i * .12, -.1, .02, .06, .5, .006));
    b.add('gold', bx(.3, 1.21, .41, .2, .05, .02, .006));
    return b.out();
  });

  part('head_hunter', GH, 'Scout', 'Hunter wedge head', ['wedge', 'hunter', 'blade', 'sleek'], () => {
    const b = B().put(mNeck(.45, .26));
    b.add('darkmetal', bx(0, .85, -.1, .7, .45, .9, .05));
    b.add('paint', sd([[1.0, .95], [.45, 1.28], [-.35, 1.38], [-.75, 1.1], [-.6, .7], [-.2, .6], [.55, .72]], .78, .07));
    b.add('paint2', at(sd([[.8, 1.06], [.4, 1.3], [-.3, 1.4], [-.65, 1.18], [-.3, 1.3], [.35, 1.22]], .5, .03), 0, .02, 0));
    b.add('darkmetal', sd([[.98, .96], [1.02, .95], [.5, 1.27], [.44, 1.27]], .5, .01));
    for (let i = 0; i < 3; i++) b.sym('glow', at(fr([[0, 0], [.14, .02], [.12, .05], [0, .035]], .02, .005), .39, .98 + i * .07, .55 - i * .17, 0, PI / 2 - .25, 0));
    b.add('darkmetal', sd([[1.15, .82], [.4, .68], [.2, .6], [.6, .74]], .1, .02));
    b.sym('paint2', at(fr([[0, 0], [.55, .25], [.62, .45], [.1, .2]], .05, .015), .3, 1.1, -.55, 0, -.5, .1));
    b.sym('metal', at(fr([[0, 0], [.4, .18], [.44, .22], [.05, .08]], .02, .005), .32, 1.12, -.52, 0, -.5, .1));
    b.sym('darkmetal', bx(.41, .85, -.15, .06, .25, .5, .02));
    for (let i = 0; i < 4; i++) b.sym('metal', bx(.445, .76 + i * .06, -.15, .02, .025, .42, .005));
    return b.out();
  });

  part('head_canopy', GH, 'Pilot', 'Bubble canopy head', ['canopy', 'cockpit', 'glass', 'pilot'], () => {
    const b = B().put(mNeck(.35, .32));
    b.add('paint', hl([[.0, .35], [.62, .35], [.72, .45], [.74, .62], [.68, .7], [0, .7]], 36));
    b.add('darkmetal', hl([[.72, .52], [.76, .52], [.76, .56], [.72, .56]], 36, true));
    b.add('crystal', new T.SphereGeometry(.64, 32, 16, 0, TAU, 0, PI / 2).translate(0, .7, 0));
    for (let i = 0; i < 3; i++) b.add('metal', at(new T.TorusGeometry(.655, .025, 6, 32, PI), 0, .7, 0, 0, i * PI / 3, 0));
    b.add('darkmetal', bx(0, .86, -.18, .34, .32, .1, .04), bx(0, .75, -.05, .34, .08, .3, .03));
    b.add('paint2', ball(.13, 0, 1.08, -.08, 14, 10));
    b.add('glow', bx(0, 1.08, .04, .16, .05, .03, .01));
    b.add('darkmetal', at(bx(0, .9, .35, .5, .05, .16, .02), 0, 0, 0));
    b.add('glow', bx(0, .93, .35, .44, .01, .12, .003));
    for (let i = 0; i < 10; i++) b.add(i % 3 ? 'glow' : 'gold', ball(.025, ...polar(.73, i * 36, .63), 6, 5));
    b.sym('paint2', at(fr([[0, 0], [.35, 0], [.3, .12], [0, .15]], .1, .03), .6, .45, -.1, 0, -.3, 0));
    b.add('metal', rod([0, .7, -.62], [0, 1.65, -.85], .02, 6, .01));
    b.add('darkmetal', bx(0, .66, -.62, .14, .12, .1, .02));
    return b.out();
  });

  // =================================================================== MECH TORSO & CORE
  part('torso_hero', GT, 'Chests', 'Heroic vent chest', ['hero', 'chest', 'vents', 'torso'], () => {
    const b = B();
    b.add('darkmetal', cy(.5, .35, 18, .45), bx(0, 1.4, -.05, 2.0, 2.6, 1.3, .08));
    for (let i = 0; i < 3; i++) {
      const y = .45 + i * .36, w = 1.25 + i * .12;
      b.add('paint2', at(fr(cham(w, .3, .08), 1.1, .05), 0, y, 0));
      b.add('paint', at(fr([[-w / 2 + .1, -.13], [w / 2 - .1, -.13], [w / 2 - .14, .12], [-w / 2 + .14, .12]], .1, .03), 0, y, .58));
    }
    b.add('paint2', at(fr([[-1.25, 1.5], [1.25, 1.5], [1.5, 2.6], [1.38, 3.2], [-1.38, 3.2], [-1.5, 2.6]], 1.6, .1), 0, 0, -.05));
    b.add('darkmetal', at(fr([[-1.2, 1.4], [1.2, 1.4], [1.25, 1.52], [-1.25, 1.52]], 1.5, .02), 0, 0, -.05));
    const pec = [[.1, 2.15], [1.1, 2.2], [1.36, 2.65], [1.22, 3.08], [.12, 3.02]];
    b.sym('paint', at(fr(pec, .18, .05), 0, 0, .78));
    b.sym('paint', at(fr([[.2, 1.65], [1.0, 1.7], [1.06, 2.05], [.16, 2.02]], .12, .04), 0, 0, .75, .12, 0, 0));
    b.sym('gold', at(fr([[.12, 3.0], [1.2, 3.06], [1.22, 3.1], [.12, 3.05]], .2, .01), 0, 0, .79));
    for (const s_ of [1, -1]) b.put(mVent(.6, .42, 5, 'metal'), .64 * s_, 2.62, .87, 0, s_ * .1, 0);
    b.add('darkmetal', at(fr([[-.1, 1.75], [.1, 1.75], [.12, 3.1], [-.12, 3.1]], .3, .03), 0, 0, .78));
    b.add('glow', at(fr([[-.28, .2], [0, -.05], [.28, .2], [.28, .3], [0, .06], [-.28, .3]], .06, .015), 0, 2.2, .95));
    b.add('darkmetal', cy(.42, .25, 18, .38, 3.15), ringY(.44, .05, 3.2, 6, 28));
    b.sym('paint', at(fr([[0, 0], [.55, 0], [.62, .32], [.1, .25]], .3, .05), .38, 3.12, -.1, 0, 0, .2));
    b.sym('darkmetal', cyX(.36, .3, 1.55, 2.72, 0, 22));
    b.sym('metal', cyX(.25, .36, 1.6, 2.72, 0, 18));
    b.sym('gold', cyX(.1, .4, 1.62, 2.72, 0, 10));
    b.sym('darkmetal', at(fr([[0, 0], [.04, 0], [.04, .7], [0, .7]], 1.0, .005), 1.38, 1.85, -.05, 0, 0, -.25));
    for (const s_ of [1, -1]) b.put(mThruster(.2, .35, 6), .6 * s_, 2.3, -.95, -PI / 2 - .3, 0, 0);
    b.add('darkmetal', bx(0, 2.4, -.88, 1.5, .8, .2, .05));
    b.add('paint', at(fr([[-1.0, .3], [1.0, .3], [1.1, 1.0], [.9, 1.3], [-.9, 1.3], [-1.1, 1.0]], .16, .05), 0, 0, -.72));
    b.add('paint2', at(fr([[-.8, .45], [.8, .45], [.85, .95], [-.85, .95]], .06, .02), 0, 0, -.81));
    b.sym('paint', at(fr([[.25, 1.6], [1.25, 1.65], [1.4, 2.6], [1.3, 3.1], [.85, 3.1], [.8, 2.05], [.25, 2.0]], .16, .05), 0, 0, -.88));
    for (const x of [-.95, -.35, .35, .95]) b.add('metal', onN(bolt(.035), [x, 1.62, .86], [0, 0, 1]));
    return b.out();
  });

  part('torso_barrel', GT, 'Chests', 'Barrel reactor chest', ['barrel', 'reactor', 'core', 'diesel'], () => {
    const b = B(), s = B();
    s.add('paint', hl([[0, .95], [.9, .95], [1.3, 1.3], [1.46, 1.9], [1.46, 2.6], [1.3, 3.0], [.95, 3.25], [0, 3.3]], 40));
    s.add('darkmetal', hl([[1.43, 1.6], [1.5, 1.6], [1.5, 1.66], [1.43, 1.66]], 40, true), hl([[1.4, 2.82], [1.47, 2.82], [1.47, 2.88], [1.4, 2.88]], 40, true));
    s.add('paint2', band([[1.45, 1.75], [1.55, 1.78], [1.55, 2.72], [1.45, 2.75]], 62, 118, 10), band([[1.45, 1.75], [1.55, 1.78], [1.55, 2.72], [1.45, 2.75]], 242, 298, 10));
    for (const a of [70, 110, 250, 290]) for (const y of [1.9, 2.6]) s.add('metal', onN(bolt(.035), polar(1.55, a, y), polar(1, a, 0)));
    b.put(s, 0, 0, 0, 0, 0, 0, [1, 1, .8]);
    b.add('darkmetal', cy(.55, .3, 18, .5));
    const bel = []; for (let i = 0; i <= 8; i++) bel.push([i % 2 ? .62 : .72, .3 + i * .085]);
    b.add('rubber', hl(bel, 28, false, 0, TAU, 20));
    const fz = 1.46 * .8;
    b.add('metal', at(hl([[.5, 0], [.62, 0], [.65, .08], [.62, .16], [.5, .16]], 32, true), 0, 2.2, fz - .02, PI / 2, 0, 0));
    b.add('darkmetal', at(cy(.52, .06, 32), 0, 2.2, fz - .02, PI / 2, 0, 0));
    b.add('glow', at(new T.SphereGeometry(.42, 28, 14, 0, TAU, 0, PI / 2), 0, 2.2, fz, PI / 2, 0, 0));
    b.add('darkmetal', at(ringY(.3, .02, .22, 4, 28), 0, 2.2, fz, PI / 2, 0, 0), at(ringY(.16, .02, .36, 4, 24), 0, 2.2, fz, PI / 2, 0, 0));
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; b.add('paint2', at(cbox(.12, .26, .14, .03), Math.cos(a) * .64, 2.2 + Math.sin(a) * .64, fz + .08, 0, 0, a + PI / 2)); }
    for (let i = 0; i < 16; i++) { const a = (i + .5) / 16 * TAU; b.add('metal', at(bolt(.025), Math.cos(a) * .57, 2.2 + Math.sin(a) * .57, fz + .14, PI / 2, 0, 0)); }
    b.sym('darkmetal', ball(.42, 1.32, 2.75, 0, 20, 14));
    b.sym('metal', cyX(.3, .2, 1.68, 2.75, 0, 18));
    for (const x of [-.55, .55]) {
      b.add('darkmetal', rod([x, 2.0, -1.1], [x, 4.0, -1.1], .14, 16));
      b.add('metal', ringY(.16, .03, 0, 6, 18).translate(x, 2.4, -1.1), ringY(.16, .03, 0, 6, 18).translate(x, 3.4, -1.1));
      b.add('darkmetal', hl([[.13, 3.95], [.2, 4.0], [.2, 4.12], [.16, 4.12], [.16, 4.02], [.12, 4.0]], 16, true).translate(x, 0, -1.1));
      b.add('darkmetal', bx(x, 2.0, -1.05, .3, .2, .3, .04));
    }
    b.add('darkmetal', cy(.45, .2, 20, .4, 3.25), ringY(.45, .04, 3.3, 6, 24));
    return b.out();
  });

  part('torso_cockpit', GT, 'Chests', 'Cockpit hatch chest', ['cockpit', 'hatch', 'pilot', 'chest'], () => {
    const b = B();
    b.add('darkmetal', cy(.5, .4, 18, .45), bx(0, .9, 0, 1.4, 1.0, 1.1, .06));
    for (let i = 0; i < 2; i++) b.add('paint2', at(fr(cham(1.3 + i * .15, .32, .08), 1.2, .05), 0, .62 + i * .38, 0));
    b.add('paint', at(fr([[-1.2, 1.3], [1.2, 1.3], [1.45, 2.3], [1.4, 3.1], [-1.4, 3.1], [-1.45, 2.3]], 1.7, .1), 0, 0, 0));
    b.add('darkmetal', at(fr([[-1.47, 2.28], [1.47, 2.28], [1.47, 2.32], [-1.47, 2.32]], 1.74, .01), 0, 0, 0));
    b.add('metal', at(ex(holed(rr(1.2, 1.15, .18, 4, 0, 2.2), rr(1.0, .95, .12, 4, 0, 2.2)), .12, .02), 0, 0, .86));
    b.add('darkmetal', at(fr(rr(1.02, .97, .12, 4, 0, 2.2), .04, .005), 0, 0, .84));
    b.add('paint2', at(fr(rr(.98, .93, .12, 4, 0, 2.2), .14, .04), 0, 0, .93));
    b.add('crystal', at(fr(rr(.5, .22, .06, 3, 0, 2.42), .04, .01), 0, 0, 1.0));
    b.add('darkmetal', at(ex(holed(rr(.58, .3, .08, 3, 0, 2.42), rr(.5, .22, .06, 3, 0, 2.42)), .04, .01), 0, 0, 1.01));
    b.add('metal', rod([-.25, 2.0, 1.04], [.25, 2.0, 1.04], .03, 8));
    b.add('metal', rod([-.25, 2.0, 1.0], [-.25, 2.0, 1.05], .04, 8), rod([.25, 2.0, 1.0], [.25, 2.0, 1.05], .04, 8));
    for (const x of [-.35, .35]) { b.add('darkmetal', cyX(.06, .2, x, 2.8, .95, 12)); b.add('metal', cyX(.04, .24, x, 2.8, .95, 10)); }
    for (let i = 0; i < 7; i++) b.add(i % 2 ? 'darkmetal' : 'paint2', at(fr([[0, 0], [.1, 0], [.18, .1], [.08, .1]], .04, .006), -.5 + i * .14, 1.66, .94));
    b.sym('metal', at(fr([[0, 0], [.1, 0], [.1, .08], [0, .08]], .04, .01), .45, 1.72, .92));
    for (const s_ of [1, -1]) b.put(mVent(.4, .55, 6, 'darkmetal'), 1.05 * s_, 2.1, .78, 0, s_ * .5, 0);
    b.sym('darkmetal', at(cy(.12, .1, 16), 1.12, 3.0, .7, PI / 2 - .3, 0, 0));
    b.sym('glow', at(cy(.09, .02, 16, .09, .1), 1.12, 3.0, .7, PI / 2 - .3, 0, 0));
    b.sym('metal', at(ringY(.12, .02, .1, 4, 16), 1.12, 3.0, .7, PI / 2 - .3, 0, 0));
    b.sym('darkmetal', cyX(.36, .3, 1.5, 2.7, 0, 22));
    b.sym('metal', cyX(.26, .36, 1.55, 2.7, 0, 18));
    b.add('darkmetal', cy(.4, .2, 18, .36, 3.08));
    b.sym('paint2', at(fr([[0, 0], [.6, 0], [.7, .25], [.12, .3]], 1.2, .05), .3, 3.08, -.2));
    return b.out();
  });

  part('torso_screen', GT, 'Chests', 'Screen-belly torso', ['screen', 'tv', 'belly', 'retro'], () => {
    const b = B();
    b.add('darkmetal', cy(.5, .3, 18, .45));
    b.add('paint', at(fr(rr(2.3, 1.6, .35, 5), 1.5, .08), 0, 1.15, 0));
    b.add('paint2', at(ex(holed(rr(2.1, 1.4, .3, 5), rr(1.6, 1.02, .16, 4)), .14, .04), 0, 1.15, .78));
    b.add('darkmetal', at(ex(holed(rr(1.64, 1.06, .17, 4), rr(1.56, .98, .14, 4)), .06, .01), 0, 1.15, .72));
    b.add('screen', at(displacedPlane(1.6, 1.02, .06), 0, 1.15, .72));
    for (let i = 0; i < 4; i++) b.add(i === 1 ? 'glow' : 'metal', bx(-.45 + i * .3, .48, .82, .16, .06, .05, .015));
    b.add('darkmetal', bx(0, 1.98, 0, 2.2, .12, 1.4, .03));
    b.add('paint', at(fr([[-1.35, 2.0], [1.35, 2.0], [1.55, 2.6], [1.42, 3.15], [-1.42, 3.15], [-1.55, 2.6]], 1.6, .1), 0, 0, -.02));
    b.sym('paint2', at(fr([[.15, 2.15], [1.15, 2.15], [1.32, 2.6], [1.2, 3.0], [.15, 3.0]], .14, .04), 0, 0, .8));
    for (const s_ of [1, -1]) for (let i = 0; i < 6; i++) b.add('darkmetal', bx(.66 * s_, 2.32 + i * .1, .89, .7, .035, .02, .006));
    b.add('gold', at(fr(ngon(5, .14, PI / 2, 0, 2.55), .06, .015), 0, 0, .86));
    b.sym('darkmetal', cyX(.36, .3, 1.55, 2.7, 0, 22));
    b.sym('metal', cyX(.25, .36, 1.6, 2.7, 0, 18));
    b.add('darkmetal', cy(.42, .2, 18, .38, 3.12));
    b.add('metal', rod([1.1, 3.1, -.3], [1.25, 3.9, -.4], .025, 6, .012));
    b.add('glow', ball(.04, 1.25, 3.9, -.4, 8, 6));
    b.sym('rubber', at(fr(rr(.2, .8, .08, 2), .1, .03), 1.17, 1.15, .3, 0, PI / 2, 0));
    return b.out();
  });

  part('core_turbine', GT, 'Cores', 'Turbine core', ['turbine', 'fan', 'core', 'nuclear'], () => {
    const b = B();
    b.add('paint2', hl([[.68, 0], [.98, 0], [1.04, .1], [1.04, .3], [.95, .42], [.7, .42], [.7, .36], [.68, .36]], 40, true));
    b.add('darkmetal', hl([[.98, .14], [1.07, .14], [1.07, .2], [.98, .2]], 40, true));
    b.add('darkmetal', cy(.7, .05, 40));
    b.add('glow', cy(.66, .02, 40, .66, .05));
    for (let i = 0; i < 14; i++) b.add('metal', at(at(cbox(.5, .02, .17, .006), .42, .2, 0, 38 * D), 0, 0, 0, 0, i / 14 * TAU, 0));
    b.add('metal', hl([[0, .1], [.2, .1], [.2, .25], [.14, .38], [.06, .44], [0, .45]], 20));
    b.add('gold', hl([[0, .42], [.07, .42], [0, .5]], 12));
    for (let i = 0; i < 3; i++) b.add('darkmetal', at(cbox(1.4, .04, .06, .01), 0, .4, 0, 0, i * PI / 3, 0));
    for (let i = 0; i < 20; i++) b.add('metal', at(bolt(.025), ...polar(.86, i * 18, .42)));
    for (let i = 0; i < 4; i++) b.add('paint', at(fr([[-.12, 0], [.12, 0], [.08, .3], [-.08, .3]], .1, .03), ...polar(1.08, i * 90 + 45, .2), PI / 2, i * PI / 2 + PI / 4, 0).translate(...polar(.02, i * 90 + 45, 0)));
    return b.out();
  });

  part('core_orb', GT, 'Cores', 'Caged reactor orb', ['reactor', 'orb', 'core', 'energy'], () => {
    const b = B();
    b.add('paint2', at(tp(ngon(8, .75, PI / 8), .16, .04), 0, .08, 0));
    b.add('darkmetal', at(tp(ngon(8, .6, PI / 8), .1, .02), 0, .2, 0));
    for (let i = 0; i < 8; i++) b.add('metal', at(bolt(.03), ...polar(.66, i * 45, .16)));
    b.add('glow', ball(.42, 0, .65, 0, 28, 20));
    for (let i = 0; i < 6; i++) { const a = i * 60, c = K.cr([V3(...polar(.5, a, .22)), V3(...polar(.58, a, .5)), V3(...polar(.54, a, .85)), V3(...polar(.25, a, 1.08)), V3(0, 1.12, 0)]); b.add('metal', taper(c, .035, .02, 20, 6)); }
    b.add('gold', at(new T.TorusGeometry(.56, .025, 6, 40), 0, .65, 0, .4, 0, .2), at(new T.TorusGeometry(.62, .025, 6, 40), 0, .65, 0, -.5, .9, 0));
    b.add('darkmetal', hl([[0, 1.08], [.14, 1.08], [.14, 1.16], [.08, 1.22], [0, 1.24]], 16));
    b.add('glow', ball(.04, 0, 1.26, 0, 8, 6));
    for (let i = 0; i < 12; i++) b.add('darkmetal', at(cbox(.02, .18, .16, .005), ...polar(.66, i * 30 + 15, .25), 0, (i * 30 + 15) * D, 0));
    return b.out();
  });

  part('torso_abdomen', GT, 'Waist', 'Layered abdomen', ['abdomen', 'waist', 'segments'], () => {
    const b = B();
    b.add('darkmetal', cy(.35, 1.7, 14), ball(.4, 0, 0, 0, 16, 10), ball(.36, 0, 1.75, 0, 16, 10));
    for (let i = 0; i < 4; i++) {
      const y = .2 + i * .37, r0 = .75 + i * .08, s = B();
      s.add(i % 2 ? 'paint2' : 'paint', hl([[r0 - .1, y], [r0, y + .04], [r0 + .06, y + .25], [r0 - .02, y + .3], [r0 - .15, y + .3]], 8, true, PI / 8));
      s.add('darkmetal', hl([[r0 - .2, y + .28], [r0 - .06, y + .28], [r0 - .06, y + .4], [r0 - .2, y + .4]], 8, true, PI / 8));
      s.add('paint', band([[r0 + .03, y + .07], [r0 + .1, y + .09], [r0 + .1, y + .22], [r0 + .05, y + .24]], -25, 25, 4));
      b.put(s, 0, 0, 0, 0, 0, 0, [1, 1, .72]);
    }
    for (const s_ of [1, -1]) piston(b, [.5 * s_, .15, -.3], [.55 * s_, 1.65, -.42], .06);
    b.add('gold', at(fr([[-.1, 0], [.1, 0], [0, -.12]], .04, .01), 0, 1.55, .79));
    return b.out();
  });

  part('torso_waist', GT, 'Waist', 'Waist & skirt armor', ['waist', 'skirt', 'pelvis', 'hips'], () => {
    const b = B();
    b.add('darkmetal', bx(0, .55, 0, 1.5, .6, .95, .08));
    b.sym('darkmetal', ball(.32, .6, .15, 0, 18, 12));
    b.sym('metal', cyX(.22, .2, .55, .15, 0, 16));
    b.add('paint2', at(fr([[-.3, .55], [.3, .55], [.22, .05], [-.22, .05]], .7, .06), 0, 0, .15));
    b.add('gold', at(fr([[-.15, .38], [0, .25], [.15, .38], [.15, .46], [0, .33], [-.15, .46]], .06, .015), 0, 0, .52));
    b.add('paint', hl([[1.0, .9], [1.06, .95], [1.06, 1.25], [1.0, 1.3], [.85, 1.3], [.85, .9]], 32, true).applyMatrix4(new T.Matrix4().makeScale(1, 1, .7)));
    b.add('darkmetal', hl([[1.05, 1.06], [1.09, 1.06], [1.09, 1.12], [1.05, 1.12]], 32, true).applyMatrix4(new T.Matrix4().makeScale(1, 1, .7)));
    b.add('gold', at(fr(rr(.34, .24, .05, 2), .06, .02), 0, 1.1, .75));
    b.add('darkmetal', at(fr(rr(.2, .1, .03, 2), .04, .01), 0, 1.1, .79));
    const fs = [[.08, 1.0], [.72, 1.0], [.7, .2], [.28, .02], [.08, .2]];
    for (const s_ of [1, -1]) {
      const sk = B();
      sk.add('paint', fr(fs, .12, .04));
      sk.add('paint2', at(fr([[.16, .88], [.62, .88], [.6, .3], [.3, .16], [.16, .3]], .06, .02), 0, 0, .06));
      sk.add('darkmetal', at(fr([[.16, .6], [.61, .6], [.61, .63], [.16, .63]], .02, .004), 0, 0, .095));
      sk.add('metal', at(bolt(.03), .2, .92, .06, PI / 2, 0, 0), at(bolt(.03), .64, .92, .06, PI / 2, 0, 0));
      sk.add('darkmetal', cyX(.06, .55, .4, 1.0, -.07, 10));
      b._put(sk, [0, 0, .75, -.18, 0, 0, 1], s_ < 0);
      const ss = B();
      ss.add('paint', fr([[-.45, 1.05], [.45, 1.05], [.4, .1], [0, -.05], [-.38, .1]], .12, .04));
      ss.add('paint2', at(fr([[-.35, .95], [.35, .95], [.3, .22], [0, .1], [-.3, .22]], .05, .015), 0, 0, .07));
      ss.add('darkmetal', cyZ(.07, .6, 0, 1.0, -.08, 10));
      ss.put(mThruster(.1, .18, 4), 0, .5, .06, PI / 2, 0, 0);
      b._put(ss, [1.12, 0, 0, 0, PI / 2, .2, 1], s_ < 0);
    }
    const rs = B();
    rs.add('paint', fr([[-.75, 1.05], [.75, 1.05], [.65, .1], [-.65, .1]], .12, .04));
    rs.add('paint2', at(fr([[-.6, .92], [.6, .92], [.52, .25], [-.52, .25]], .05, .015), 0, 0, -.07));
    for (const x of [-.3, .3]) rs.put(mThruster(.14, .26, 5), x, .55, -.06, -PI / 2, 0, 0);
    b.put(rs, 0, 0, -.78, .18, 0, 0);
    return b.out();
  });

  part('torso_backpack', GT, 'Back', 'Thruster backpack', ['backpack', 'thrusters', 'jetpack', 'booster'], () => {
    // built facing +Z on a wall (up = +Y), then laid so it grows +Y with its top toward -Z
    const s = B();
    s.add('darkmetal', bx(0, 0, .06, 1.6, 1.8, .12, .03));
    s.add('paint', at(fr([[-.8, -1.1], [.8, -1.1], [1.0, -.6], [1.0, .9], [.7, 1.15], [-.7, 1.15], [-1.0, .9], [-1.0, -.6]], .7, .08), 0, 0, .45));
    s.add('paint2', at(fr([[-.62, -.5], [.62, -.5], [.78, .7], [.55, .95], [-.55, .95], [-.78, .7]], .12, .04), 0, 0, .83));
    s.add('darkmetal', at(fr([[-1.02, .18], [1.02, .18], [1.02, .22], [-1.02, .22]], .74, .005), 0, 0, .45));
    s.put(mVent(.7, .4, 5), 0, .35, .89);
    s.put(mStripes(.9, .16, 6, .03), 0, -.7, .8);
    for (const x of [-.5, .5]) { s.put(mThruster(.32, .7, 10), x, -1.0, .45, 0, 0, PI); s.add('darkmetal', bx(x, -1.0, .45, .55, .14, .5, .04)); }
    for (const x of [-.6, .6]) s.put(mThruster(.13, .25, 5), x, 1.1, .5, 0, 0, 0);
    for (const s_ of [1, -1]) {
      s.add('metal', cy(.26, 1.5, 20, .26, -.75).translate(1.18 * s_, 0, .4));
      s.add('metal', ball(.26, 1.18 * s_, .75, .4, 20, 10), ball(.26, 1.18 * s_, -.75, .4, 20, 10));
      for (const y of [-.5, 0, .5]) s.add('darkmetal', ringY(.27, .035, y, 6, 24).translate(1.18 * s_, 0, .4));
      s.add('darkmetal', bx(1.04 * s_, .45, .4, .2, .12, .2, .03), bx(1.04 * s_, -.45, .4, .2, .12, .2, .03));
      s.add('paint2', at(cy(.06, .12, 10), 1.18 * s_, .98, .4));
    }
    hoseFull(s, K.cr([V3(-.3, .95, .85), V3(0, 1.25, .8), V3(.3, .95, .85)]), .05, 8);
    return B().put(s, 0, 0, 0, -PI / 2, 0, 0).out();
  });

  part('torso_wings', GT, 'Back', 'Wing binders', ['wings', 'binder', 'flight', 'fins'], () => {
    const b = B();
    b.add('darkmetal', cyZ(.22, .5, 0, 0, 0, 18), ball(.2, 0, .3, 0, 14, 10));
    b.add('metal', cyZ(.14, .6, 0, 0, 0, 14));
    b.add('darkmetal', beam([0, .2, 0], [.55, .95, 0], .22, .3, .05));
    b.add('paint2', at(fr([[-.05, .15], [.12, .05], [.66, .82], [.5, .98]], .36, .05), 0, 0, 0));
    piston(b, [.18, .05, .2], [.62, .7, .2], .05);
    b.add('darkmetal', cyZ(.18, .44, .6, .95, 0, 16));
    const pod = [[0, -.22], [.6, -.3], [2.8, -.12], [3.3, .1], [2.9, .3], [.6, .32], [0, .22]];
    const P_ = B();
    P_.add('paint', fr(pod, .32, .07));
    P_.add('paint2', at(fr([[.3, -.14], [2.6, -.06], [2.95, .1], [2.6, .2], [.3, .2]], .08, .025), 0, 0, .17));
    P_.add('paint2', at(fr([[.3, -.14], [2.6, -.06], [2.95, .1], [2.6, .2], [.3, .2]], .08, .025), 0, 0, -.17));
    P_.add('darkmetal', at(fr([[1.4, -.24], [1.46, -.24], [1.46, .3], [1.4, .3]], .36, .005), 0, 0, 0));
    P_.add('glow', at(fr([[.6, -.33], [2.8, -.15], [2.8, -.12], [.6, -.3]], .1, .005), 0, 0, 0));
    P_.add('gold', at(fr([[2.9, .3], [3.3, .1], [3.36, .12], [2.95, .34]], .2, .01), 0, 0, 0));
    for (const x of [.8, 1.9]) P_.add('metal', at(bolt(.03), x, .05, .21, PI / 2, 0, 0), at(bolt(.03), x, .05, -.21, -PI / 2, 0, 0));
    P_.put(mThruster(.13, .28, 5), .15, .0, 0, 0, 0, PI / 2);
    b.put(P_, .65, .95, 0, 0, 0, .45);
    const fins = [[0, -.08], [2.4, -.04], [2.6, .02], [2.4, .08], [0, .08]];
    for (let i = 0; i < 3; i++) {
      const fsB = B(); fsB.add(i % 2 ? 'paint' : 'paint2', fr(fins.map(([x, y]) => [x * (1 - i * .12), y]), .06, .02));
      fsB.add('glow', at(fr([[.2, -.09], [2.1 * (1 - i * .12), -.05], [2.1 * (1 - i * .12), -.035], [.2, -.075]], .03, .004), 0, 0, 0));
      b.put(fsB, .95, 1.05, .22 + i * .08, 0, 0, .1 - i * .22);
    }
    b.add('darkmetal', cyZ(.1, .5, .95, 1.05, .3, 12));
    return b.out();
  });

  part('torso_siege', GT, 'Chests', 'Siege armor torso', ['heavy', 'siege', 'tank', 'smokestack'], () => {
    const b = B();
    b.add('darkmetal', cy(.6, .35, 18, .55), bx(0, 1.0, 0, 1.8, 1.2, 1.3, .08));
    b.add('paint2', at(fr(cham(2.1, .45, .12), 1.4, .06), 0, .7, 0));
    b.add('paint', at(fr([[-1.7, 1.25], [1.7, 1.25], [1.8, 2.9], [1.5, 3.2], [-1.5, 3.2], [-1.8, 2.9]], 1.9, .1), 0, 0, -.05));
    for (let i = 0; i < 3; i++) {
      const y = 1.45 + i * .55;
      b.add(i % 2 ? 'paint' : 'paint2', at(fr([[-1.45 + i * .05, -.22], [1.45 - i * .05, -.22], [1.4 - i * .05, .26], [-1.4 + i * .05, .26]], .22, .05), 0, y, .98, -.3, 0, 0));
      for (let k = -2; k <= 2; k++) b.add('metal', at(bolt(.03), k * .55, y + .14, 1.07, PI / 2 - .3, 0, 0));
    }
    b.put(mStripes(1.6, .18, 9, .03), 0, 1.15, .9);
    b.add('paint2', at(fr([[-.9, 0], [.9, 0], [.75, .45], [-.75, .45]], .5, .06), 0, 3.15, -.1));
    b.add('darkmetal', at(fr([[-.55, 0], [.55, 0], [.45, .35], [-.45, .35]], .52, .02), 0, 3.25, -.05));
    b.sym('darkmetal', cyX(.42, .35, 1.82, 2.6, 0, 22));
    b.sym('metal', cyX(.3, .42, 1.88, 2.6, 0, 18));
    b.sym('paint2', bx(1.84, 2.0, 0, .2, .7, 1.4, .05));
    for (const x of [-1.1, -.75, .75, 1.1]) {
      b.add('darkmetal', rod([x, 2.5, -1.05], [x, 4.0, -1.15], .12, 14));
      b.add('darkmetal', hl([[.1, 3.95], [.17, 4.0], [.17, 4.1], [.14, 4.1], [.14, 4.02], [.1, 4.0]], 14, true).translate(x, 0, -1.15));
      b.add('metal', ringY(.14, .025, 0, 6, 16).translate(x, 3.0, -1.08));
    }
    b.add('darkmetal', bx(0, 2.5, -1.05, 2.6, .4, .3, .05));
    b.sym('darkmetal', at(cy(.16, .14, 18), 1.2, 3.0, .8, PI / 2 - .2, 0, 0));
    b.sym('glow', at(cy(.12, .02, 18, .12, .14), 1.2, 3.0, .8, PI / 2 - .2, 0, 0));
    b.sym('metal', at(ringY(.16, .025, .15, 4, 18), 1.2, 3.0, .8, PI / 2 - .2, 0, 0));
    return b.out();
  });

  part('torso_frame', GT, 'Frames', 'Inner frame torso', ['frame', 'skeleton', 'inner-frame', 'gunpla'], () => {
    const b = B();
    b.add('darkmetal', cy(.4, .3, 16, .35));
    for (let i = 0; i < 7; i++) { b.add('darkmetal', at(fr(cham(.42, .24, .06), .36, .04), 0, .45 + i * .34, -.25)); b.add('metal', cy(.12, .1, 10, .12, .55 + i * .34).translate(0, 0, -.25)); }
    b.add('darkmetal', bx(0, .45, 0, 1.3, .2, .8, .05), bx(0, 2.95, -.1, 2.8, .26, .7, .06));
    for (const s_ of [1, -1]) for (let i = 0; i < 3; i++) {
      const y = 1.3 + i * .48, c = K.cr([V3(.12 * s_, y, -.32), V3(.85 * s_, y + .05, -.25), V3(1.05 * s_, y + .1, .25), V3(.5 * s_, y + .12, .62), V3(.12 * s_, y + .12, .65)]);
      b.add('metal', taper(c, .06, .05, 24, 8, .7));
    }
    b.add('darkmetal', bx(0, 2.2, .62, .26, 1.6, .1, .03));
    b.add('glow', cy(.3, .9, 20, .3, 1.5).translate(0, 0, .15));
    b.add('metal', cy(.38, .1, 20, .38, 1.45).translate(0, 0, .15), cy(.38, .1, 20, .38, 2.4).translate(0, 0, .15));
    for (let i = 0; i < 6; i++) b.add('darkmetal', rod(V3(...polar(.33, i * 60, 1.5)).add(V3(0, 0, .15)), V3(...polar(.33, i * 60, 2.45)).add(V3(0, 0, .15)), .03, 6));
    for (const s_ of [1, -1]) { piston(b, [.5 * s_, .5, .2], [1.15 * s_, 2.85, .1], .08); piston(b, [.45 * s_, .5, -.3], [.9 * s_, 2.85, -.35], .06); }
    b.sym('darkmetal', cyX(.36, .4, 1.5, 2.85, -.1, 22));
    b.sym('metal', cyX(.24, .46, 1.56, 2.85, -.1, 18));
    b.add('paint', at(fr([[-.75, 0], [.75, 0], [.6, .35], [-.6, .35]], .3, .05), 0, 3.08, -.1));
    b.add('darkmetal', cy(.32, .2, 16, .28, 3.3).translate(0, 0, -.1));
    b.add('rubber', ...[1, -1].map(s_ => hose(K.cr([V3(.3 * s_, .55, .4), V3(.7 * s_, 1.4, .7), V3(.55 * s_, 2.4, .7), V3(.3 * s_, 2.9, .3)]), .05, 12)));
    return b.out();
  });

  part('torso_slim', GT, 'Chests', 'Interceptor chest', ['slim', 'interceptor', 'fast', 'sleek'], () => {
    const b = B();
    b.add('darkmetal', cy(.38, .35, 16, .34));
    for (let i = 0; i < 3; i++) b.add(i % 2 ? 'paint2' : 'darkmetal', at(fr(cham(.75 + i * .1, .28, .08), .75 + i * .05, .05), 0, .5 + i * .3, 0));
    b.add('paint', at(fr([[-.5, 1.3], [.5, 1.3], [1.35, 2.5], [1.2, 3.0], [-1.2, 3.0], [-1.35, 2.5]], 1.3, .1), 0, 0, -.05));
    b.add('darkmetal', at(fr([[-.52, 1.3], [.52, 1.3], [.55, 1.36], [-.55, 1.36]], 1.2, .01), 0, 0, -.05));
    b.sym('paint2', at(fr([[.06, 1.5], [.5, 1.5], [1.2, 2.5], [1.08, 2.85], [.06, 2.75]], .14, .04), 0, 0, .64, 0, .12, 0));
    b.add('darkmetal', at(fr([[-.07, 1.45], [.07, 1.45], [.07, 2.85], [-.07, 2.85]], .2, .02), 0, 0, .64));
    b.put(mLens(.16, .14, 'glow'), 0, 2.35, .74);
    b.sym('paint', at(fr([[0, 0], [.35, .02], [1.0, .6], [.9, .7], [.1, .3]], .08, .025), .2, 2.95, .2, -.35, 0, 0));
    for (const s_ of [1, -1]) {
      const ds = B();
      ds.add('paint2', at(ex(holed(rr(.5, .42, .1, 3), rr(.36, .28, .06, 3)), .7, .04), 0, 0, 0));
      ds.add('darkmetal', at(fr(rr(.38, .3, .06, 3), .02, .005), 0, 0, -.1));
      for (let i = 0; i < 4; i++) ds.add('darkmetal', bx(0, -.1 + i * .065, .1, .36, .02, .3, .005));
      b._put(ds, [1.25, 2.1, .1, 0, 0, 0, 1], s_ < 0);
    }
    b.sym('darkmetal', cyX(.3, .3, 1.3, 2.65, 0, 20));
    b.sym('metal', cyX(.2, .36, 1.35, 2.65, 0, 16));
    b.add('darkmetal', cy(.3, .2, 16, .27, 2.98));
    for (const s_ of [1, -1]) b.put(mThruster(.16, .3, 6), .45 * s_, 2.2, -.72, -PI / 2 - .4, 0, 0);
    return b.out();
  });

  part('torso_collar', GT, 'Chests', 'Armored neck collar', ['collar', 'gorget', 'neck', 'guard'], () => {
    const b = B();
    b.add('darkmetal', hl([[.42, 0], [.62, 0], [.62, .14], [.42, .14]], 36, true));
    for (let i = 0; i < 3; i++) {
      const y = .08 + i * .12, r = .66 - i * .06;
      b.add(i % 2 ? 'paint2' : 'paint', band([[r, y], [r + .22, y - .02], [r + .2, y + .04], [r - .02, y + .1]], 40, 320, 28));
    }
    b.add('paint', band([[.6, .3], [.7, .28], [.92, .72], [.84, .76]], 128, 232, 20));
    b.add('paint2', band([[.7, .38], [.75, .38], [.93, .66], [.88, .7]], 140, 220, 16));
    b.add('gold', band([[.9, .7], [.95, .68], [.97, .76], [.9, .79]], 128, 232, 20));
    for (const a of [150, 180, 210]) b.add('darkmetal', at(cbox(.04, .3, .03, .008), ...polar(.86, a, .55), -.75, a * D, 0).rotateX(0));
    b.sym('paint2', at(fr([[0, 0], [.3, 0], [.38, .35], [.06, .25]], .08, .02), ...polar(.8, 35, .2), 0, 35 * D, 0));
    for (let i = 0; i < 12; i++) b.add('metal', onN(bolt(.025), polar(.62, 45 + i * 24, .07), polar(1, 45 + i * 24, 0)));
    return b.out();
  });

  // =================================================================== MECH ARMS & LEGS
  part('arm_upper', GL, 'Arms', 'Armored upper arm', ['upper arm', 'bicep', 'shoulder joint'], () => bUpperArm().out());
  part('arm_forearm', GL, 'Arms', 'Armored forearm', ['forearm', 'gauntlet', 'armor'], () => bForearm().out());

  part('arm_frame_forearm', GL, 'Arms', 'Inner-frame forearm', ['forearm', 'frame', 'skeleton', 'pistons'], () => {
    const b = B();
    b.add('darkmetal', cyX(.24, .6, 0, 0, 0, 18));
    b.add('metal', cyX(.15, .7, 0, 0, 0, 14));
    for (const x of [-.22, .22]) { b.add('darkmetal', beamYZ([x, .05, .0], [x, 1.95, .0], .1, .3, .03)); for (let i = 0; i < 5; i++) b.add('metal', cyX(.05, .12, x, .35 + i * .35, .12, 8), cyX(.05, .12, x, .35 + i * .35, -.12, 8)); }
    for (const y of [.5, 1.2, 1.8]) b.add('darkmetal', bx(0, y, 0, .5, .08, .22, .02));
    b.add('darkmetal', at(fr([[-.2, .3], [.2, .3], [.05, 1.0], [.2, 1.7], [-.2, 1.7], [-.05, 1.0]], .05, .01), 0, 0, -.14));
    piston(b, [0, .15, .25], [0, 1.75, .2], .07);
    piston(b, [.0, .2, -.25], [0, 1.7, -.22], .05);
    b.add('rubber', hose(K.cr([V3(.3, .1, -.1), V3(.36, .8, .1), V3(.3, 1.4, -.12), V3(.26, 1.9, .05)]), .04, 14));
    b.add('rubber', hose(K.cr([V3(-.3, .1, .1), V3(-.36, .9, -.1), V3(-.3, 1.5, .12), V3(-.26, 1.9, -.05)]), .035, 14));
    b.add('paint', at(sd([[.25, .25], [.32, .7], [.28, .95], [-.2, .95], [-.25, .25]], .62, .05), 0, 0, 0));
    b.add('paint2', at(sd([[.2, .35], [.25, .75], [.15, .85], [-.15, .85], [-.18, .35]], .08, .02), .32, 0, 0));
    b.add('darkmetal', hl([[.22, 1.92], [.3, 1.95], [.3, 2.05], [.22, 2.08]], 20, true));
    b.add('metal', ringY(.24, .04, 2.0, 6, 24));
    b.add('darkmetal', ball(.2, 0, 2.18, 0, 14, 10));
    return b.out();
  });

  part('arm_full', GL, 'Arms', 'Complete mech arm', ['arm', 'full', 'fist', 'standard'], () => {
    const b = B().put(bUpperArm()); b.put(bForearm(), 0, 1.95, 0); b.put(mFist(), 0, 4.1, 0);
    return b.out();
  });

  part('sh_round', GL, 'Shoulders', 'Layered round pauldron', ['pauldron', 'shoulder', 'round', 'layered'], () => {
    const s = B();
    s.add('paint', hl([[.95, -.2], [1.0, -.12], [.98, .2], [.82, .55], [.5, .8], [0, .86]], 36));
    s.add('darkmetal', hl([[0, -.15], [.9, -.15], [.95, -.2], [0, -.2]].reverse(), 36));
    s.add('paint2', band([[.92, .1], [1.04, .1], [.9, .48], [.8, .45]], -60, 240, 28));
    s.add('gold', hl([[.97, -.22], [1.04, -.22], [1.04, -.16], [.97, -.14]], 36, true));
    for (let i = 0; i < 3; i++) { const r0 = .96 + i * .1, y0 = -.2 - i * .22; s.add(i % 2 ? 'paint' : 'paint2', band([[r0, y0], [r0 + .07, y0], [r0 + .25, y0 - .3], [r0 + .18, y0 - .31]], 35 + i * 5, 145 - i * 5, 18)); s.add('darkmetal', band([[r0 + .02, y0 - .02], [r0 + .2, y0 - .29], [r0 + .17, y0 - .29], [r0, y0 - .02]], 38 + i * 5, 142 - i * 5, 18)); }
    s.add('paint2', band([[.35, .78], [.52, .78], [.4, .92], [.3, .9]], -40, 40, 10));
    for (let i = 0; i < 12; i++) s.add('metal', onN(bolt(.03), polar(.98, i * 30, -.05), polar(1, i * 30, 0)));
    s.add('darkmetal', ball(.35, 0, .0, 0, 16, 12));
    return B().put(s, .25, .2, 0, 0, 0, -.25).out();
  });

  part('sh_block', GL, 'Shoulders', 'Thruster block shoulder', ['shoulder', 'block', 'thrusters', 'box'], () => {
    const b = B();
    b.add('darkmetal', ball(.35, 0, 0, 0, 16, 12));
    b.add('paint', at(sd([[.75, -.1], [.8, .35], [.6, .7], [-.6, .7], [-.8, .4], [-.75, -.1]], 1.5, .08), .25, 0, 0));
    b.add('paint2', at(sd([[.62, .58], [.55, .78], [-.55, .78], [-.62, .58]], 1.3, .05), .25, 0, 0));
    b.add('darkmetal', at(sd([[.8, .3], [.82, .3], [.82, .36], [.8, .36]], 1.54, .005), .25, 0, 0));
    b.add('paint2', at(fr([[-.6, -.6], [.6, -.6], [.7, .1], [.55, .55], [-.55, .55], [-.7, .1]], .14, .04), 1.0, .05, 0, 0, PI / 2, 0));
    b.put(mStripes(.9, .14, 6, .025), 1.07, -.35, 0, 0, PI / 2, 0);
    b.put(mVent(.6, .35, 4), 1.07, .2, 0, 0, PI / 2, 0);
    for (const z of [-.3, .3]) b.put(mThruster(.15, .3, 5), .5, .3, -.78, -PI / 2, 0, 0);
    for (const z of [-.5, .5]) for (const y of [-.5, .45]) b.add('metal', at(bolt(.03), 1.07, y, z, 0, 0, -PI / 2));
    b.add('glow', bx(.25, .79, .4, .5, .02, .06, .005));
    return b.out();
  });

  part('sh_fin', GL, 'Shoulders', 'Finned blade pauldron', ['shoulder', 'spike', 'fin', 'blade'], () => {
    const s = B();
    s.add('darkmetal', ball(.33, 0, 0, 0, 16, 12));
    s.add('paint', hl([[.85, -.25], [.95, 0], [.82, .42], [.45, .7], [0, .76]], 6, false, PI / 6, TAU, 20));
    s.add('darkmetal', hl([[0, -.2], [.82, -.2], [.85, -.25], [0, -.25]].reverse(), 6, false, PI / 6));
    s.add('paint2', band([[.84, .2], [.98, .2], [.84, .55], [.74, .5]], 40, 140, 3));
    for (let i = 0; i < 3; i++) { const r0 = .92 + i * .1, y0 = -.2 - i * .24; s.add(i % 2 ? 'paint2' : 'paint', band([[r0, y0], [r0 + .07, y0], [r0 + .3, y0 - .32], [r0 + .22, y0 - .33]], 30 + i * 8, 150 - i * 8, 3)); }
    s.add('gold', hl([[.93, -.28], [1.0, -.28], [1.0, -.2], [.93, -.2]], 6, true, PI / 6));
    for (const z of [-.18, .18]) {
      s.add('paint2', at(sd([[.55, .55], [.1, .82], [-.7, 1.3], [-1.05, 1.32], [-.55, .9], [-.4, .5]], .07, .02), .0, 0, 0).translate(0, 0, 0).applyMatrix4(new T.Matrix4().makeTranslation(z > 0 ? .3 : .55, z > 0 ? 0 : -.12, 0)));
    }
    s.add('gold', at(sd([[-.7, 1.3], [-1.05, 1.32], [-.95, 1.26], [-.66, 1.24]], .09, .01), .3, 0, 0));
    s.add('paint', at(sd([[.95, .1], [1.5, .25], [1.0, .38]], .1, .03), .55, 0, 0));
    for (let i = 0; i < 6; i++) s.add('metal', onN(bolt(.03), polar(.96, 40 + i * 20, -.02), polar(1, 40 + i * 20, 0)));
    return B().put(s, .2, .2, 0, 0, 0, -.25).out();
  });

  part('sh_shield', GL, 'Shoulders', 'Shield shoulder plate', ['shoulder', 'shield', 'heavy', 'emblem'], () => {
    const b = B();
    b.add('darkmetal', ball(.33, 0, 0, 0, 16, 12), cyX(.14, .6, .3, .1, 0, 12));
    b.add('darkmetal', bx(.55, .1, 0, .3, .5, .7, .05));
    const s = B();
    s.add('paint', band([[1.0, -1.4], [1.12, -1.38], [1.15, .55], [1.02, .62]], 30, 150, 20));
    s.add('paint2', band([[1.12, -1.2], [1.18, -1.18], [1.2, .38], [1.14, .42]], 45, 135, 16));
    s.add('gold', band([[1.11, -1.42], [1.16, -1.42], [1.16, -1.36], [1.11, -1.36]], 30, 150, 20));
    s.add('darkmetal', band([[1.14, -.45], [1.2, -.45], [1.2, -.4], [1.14, -.4]], 32, 148, 20));
    for (const a of [40, 140]) for (const y of [-1.25, -.4, .4]) s.add('metal', onN(bolt(.035), polar(1.13, a, y), polar(1, a, 0)));
    b.put(s, -.4, .6, 0, 0, 0, 0);
    b.add('gold', at(fr([[0, .25], [.2, .05], [.12, -.22], [-.12, -.22], [-.2, .05]], .06, .02), .82, .15, 0, 0, PI / 2, 0));
    b.add('glow', at(fr(ngon(6, .06, 0, 0, 0), .04, .01), .86, .15, 0, 0, PI / 2, 0));
    return b.out();
  });

  part('sh_missile', GL, 'Shoulders', 'Missile shoulder pod', ['shoulder', 'missiles', 'launcher', 'pod'], () => {
    const b = B();
    b.add('darkmetal', ball(.3, 0, 0, 0, 16, 12), bx(0, .35, 0, .5, .3, .5, .05));
    b.add('paint', bx(0, .85, -.05, 1.2, .8, 1.3, .07));
    b.add('darkmetal', bx(0, .85, .6, 1.08, .68, .02, .005));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = -.39 + c * .26, y = .64 + r * .21;
      b.add('darkmetal', cyZ(.09, .1, x, y, .62, 12));
      b.add('paint2', at(hl([[0, 0], [.07, 0], [.07, .04], [.03, .1], [0, .12]], 12), x, y, .6, PI / 2, 0, 0));
    }
    b.add('paint2', at(fr([[-.6, 0], [.6, 0], [.6, .1], [-.6, .1]], 1.0, .03), 0, 1.25, .05, 0, 0, 0));
    b.add('paint2', at(fr([[-.62, 0], [.62, 0], [.62, .06], [-.62, .06]], .3, .02), 0, 1.3, .75, -.9, 0, 0));
    b.add('darkmetal', cyX(.04, 1.26, 0, 1.3, .6, 10));
    b.sym('paint2', bx(.62, .85, -.05, .06, .6, 1.1, .02));
    b.put(mStripes(.8, .1, 5, .02), 0, 1.28, -.5, -PI / 2, 0, 0);
    b.add('glow', bx(-.45, 1.31, .4, .1, .02, .05, .005));
    return b.out();
  });

  part('hand_rocket', GL, 'Hands', 'Rocket fist', ['rocket punch', 'fist', 'booster'], () => {
    const b = B();
    b.add('darkmetal', ball(.2, 0, 0, 0, 14, 10));
    b.put(mThruster(.3, .5, 8), 0, .55, 0, 0, 0, PI);
    b.add('paint', hl([[.3, .5], [.38, .55], [.42, 1.05], [.36, 1.15], [.28, 1.15]], 8, true, PI / 8));
    b.add('darkmetal', hl([[.4, .78], [.44, .78], [.44, .83], [.4, .83]], 8, true, PI / 8));
    for (let i = 0; i < 4; i++) b.add('paint2', at(fr([[0, 0], [.3, .1], [.3, .4], [0, .55]], .05, .015), ...polar(.4, i * 90 + 45, .55), 0, (i * 90 + 45 - 90) * D, 0));
    b.add('glow', ...[0, 1, 2, 3].map(i => at(cbox(.02, .25, .06, .005), ...polar(.43, i * 90, .85), 0, i * 90 * D, 0)));
    b.put(mFist(1.15), 0, 1.05, 0);
    return b.out();
  });

  part('arm_drill', GL, 'Arms', 'Drill arm', ['drill', 'arm', 'weapon', 'spiral'], () => {
    const b = B();
    b.add('darkmetal', cyX(.26, .55, 0, 0, 0, 18));
    b.add('paint', hl([[.3, .15], [.48, .3], [.55, 1.2], [.6, 1.4], [.5, 1.55], [.3, 1.55]], 8, true, PI / 8));
    b.add('darkmetal', hl([[.54, .75], [.58, .75], [.58, .8], [.54, .8]], 8, true, PI / 8));
    for (let i = 0; i < 4; i++) b.put(mVent(.25, .45, 4), ...polar(.55, i * 90 + 45, 1.0), 0, (i * 90 + 45) * D, 0);
    b.add('metal', hl([[.48, 1.5], [.56, 1.5], [.56, 1.68], [.48, 1.68]], 28, true));
    b.add('gold', ringY(.57, .03, 1.59, 6, 32));
    b.add('metal', hl([[0, 1.6], [.46, 1.68], [.04, 3.4], [0, 3.42]], 28));
    const pts = []; for (let i = 0; i <= 120; i++) { const t = i / 120, y = 1.72 + t * 1.6, r = .45 * (1 - t) + .04, a = t * 5 * TAU; pts.push(V3(Math.sin(a) * r, y, Math.cos(a) * r)); }
    b.add('darkmetal', taper(K.cr(pts), t => .07 * (1 - t) + .015, 0, 200, 6, .45));
    for (let i = 0; i < 8; i++) b.add('metal', at(bolt(.03), ...polar(.56, i * 45, 1.68)));
    piston(b, [.0, .3, -.5], [0, 1.4, -.62], .06);
    return b.out();
  });

  part('hand_claw', GL, 'Hands', 'Talon claw hand', ['claw', 'talon', 'hand', 'grabber'], () => {
    const b = B();
    b.add('darkmetal', ball(.22, 0, 0, 0, 14, 10), cy(.2, .3, 12, .24, .05));
    b.add('paint', at(fr(cham(.55, .6, .12), .55, .05), 0, .6, 0, 0, PI / 2, 0));
    b.add('paint2', at(sd([[-.3, .35], [.3, .35], [.25, .85], [-.25, .85]], .1, .03), .3, 0, 0));
    for (let i = 0; i < 3; i++) {
      const z = -.2 + i * .2, s = B();
      s.add('darkmetal', cyZ(.08, .14, 0, 0, 0, 12));
      s.add('paint2', bx(0, .25, 0, .18, .45, .15, .04));
      s.add('darkmetal', cyZ(.07, .15, 0, .5, 0, 12));
      s.add('metal', taper(K.bez(V3(0, .5, 0), V3(.02, .85, 0), V3(-.25, 1.05, 0)), .09, .01, 18, 8, .5));
      piston(s, [.12, .05, 0], [.12, .42, 0], .03);
      b.put(s, -.02, .92, z, 0, 0, .15);
    }
    const th = B();
    th.add('darkmetal', cyZ(.08, .14, 0, 0, 0, 12));
    th.add('paint2', bx(0, .2, 0, .16, .36, .14, .04));
    th.add('metal', taper(K.bez(V3(0, .38, 0), V3(.02, .65, 0), V3(-.2, .8, 0)), .08, .01, 16, 8, .5));
    b.put(th, -.25, .55, .32, -.4, 0, .9);
    return b.out();
  });

  part('hand_open', GL, 'Hands', 'Articulated 5-finger hand', ['hand', 'fingers', 'articulated', 'open'], () => {
    const b = B();
    b.add('darkmetal', ball(.2, 0, 0, 0, 14, 10), cy(.17, .25, 12, .2, .05));
    b.add('darkmetal', at(fr(cham(.48, .58, .08), .42, .04), -.02, .55, 0, 0, PI / 2, 0));
    b.add('paint', at(sd([[-.3, .3], [.3, .3], [.33, .7], [.28, .85], [-.28, .85], [-.33, .7]], .1, .03), .22, 0, 0));
    b.add('paint2', at(sd([[-.2, .4], [.2, .4], [.22, .72], [-.22, .72]], .05, .015), .29, 0, 0));
    b.add('rubber', at(sd([[-.25, .35], [.25, .35], [.28, .8], [-.28, .8]], .05, .015), -.24, 0, 0));
    const fing = (z, lens, curl) => {
      const s = B(); let p = V3(0, 0, 0), a = 0;
      lens.forEach((L, i) => {
        s.add('darkmetal', cyZ(.055 - i * .006, .12, p.x, p.y, 0, 10));
        a += curl[i];
        const dir = V3(-Math.sin(a), Math.cos(a), 0), c = p.clone().addScaledVector(dir, L / 2 + .03);
        s.add('paint2', at(cbox(.12 - i * .01, L, .11 - i * .008, .025), c.x, c.y, 0, 0, 0, a));
        s.add('paint', at(cbox(.04, L * .7, .08 - i * .008, .012), c.x + Math.cos(a) * .06, c.y + Math.sin(a) * .06, 0, 0, 0, a));
        p = p.clone().addScaledVector(dir, L + .06);
      });
      if (lens.length) s.add('darkmetal', at(cy(.035, .05, 8, .01), p.x, p.y - .02, 0, 0, 0, a));
      b.put(s, 0, .88, z);
    };
    fing(-.21, [.22, .16, .12], [.05, .12, .15]);
    fing(-.07, [.26, .18, .13], [.03, .1, .12]);
    fing(.07, [.26, .18, .13], [.04, .11, .13]);
    fing(.21, [.22, .15, .11], [.06, .14, .16]);
    for (let i = 0; i < 4; i++) b.add('paint', bx(.06, .9, -.21 + i * .14, .18, .08, .12, .02));
    const th = B(); let p = V3(0, 0, 0);
    th.add('darkmetal', ball(.07, 0, 0, 0, 10, 8));
    th.add('paint2', at(cbox(.13, .22, .12, .03), 0, .14, 0)); th.add('darkmetal', cyX(.05, .13, 0, .28, 0, 10));
    th.add('paint2', at(cbox(.11, .16, .1, .025), 0, .38, 0, 0, 0, 0));
    th.add('paint', at(cbox(.04, .14, .08, .01), .06, .14, 0));
    b.put(th, -.08, .42, .26, .7, 0, .3);
    return b.out();
  });

  part('hand_fist', GL, 'Hands', 'Armored fist', ['fist', 'hand', 'punch'], () => mFist(1.2).out());

  part('arm_missile', GL, 'Arms', 'Missile-pod forearm', ['missiles', 'forearm', 'launcher', 'weapon'], () => {
    const b = B();
    b.add('darkmetal', cyX(.26, .55, 0, 0, 0, 18), cy(.24, 1.9, 10, .2, .1));
    b.add('paint', sd([[.36, .25], [.42, 1.8], [-.4, 1.8], [-.34, .25], [0, .15]], .66, .05));
    const pod = B();
    pod.add('paint2', bx(0, 1.05, 0, .55, 1.5, .78, .06));
    pod.add('darkmetal', bx(0, 1.05, 0, .57, .03, .8, .005));
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const x = -.12 + r * .24, z = -.24 + c * .24;
      pod.add('darkmetal', cy(.09, .08, 12, .09, 1.76).translate(x, 0, z));
      pod.add('metal', hl([[0, 1.72], [.07, 1.72], [.07, 1.78], [.03, 1.86], [0, 1.88]], 12).translate(x, 0, z));
    }
    pod.add('darkmetal', bx(0, 1.82, 0, .5, .02, .72, .005));
    pod.put(mStripes(.6, .12, 5, .02), .28, .5, 0, 0, PI / 2, 0);
    pod.add('darkmetal', cyZ(.06, .82, -.25, .35, 0, 10), cyZ(.06, .82, -.25, 1.6, 0, 10));
    b.put(pod, .62, 0, 0);
    b.add('metal', ringY(.24, .06, 1.98, 6, 24));
    b.add('darkmetal', ball(.2, 0, 2.08, 0, 14, 10));
    piston(b, [-.35, .3, 0], [-.4, 1.6, 0], .05);
    return b.out();
  });

  part('arm_pile', GL, 'Arms', 'Pile-bunker forearm', ['pile bunker', 'spike', 'forearm', 'weapon'], () => {
    const b = B();
    b.add('darkmetal', cyX(.26, .55, 0, 0, 0, 18));
    b.add('paint', sd([[.4, .25], [.5, 1.6], [.45, 1.9], [-.45, 1.9], [-.5, 1.5], [-.38, .25], [0, .15]], .8, .06));
    b.add('darkmetal', hl([[.25, 1.0], [.32, 1.05], [.34, 2.1], [.28, 2.2], [.2, 2.2]], 20, true).translate(0, 0, .55));
    for (const y of [1.3, 1.6, 1.9]) b.add('metal', ringY(.34, .03, y, 6, 20).translate(0, 0, .55));
    b.add('metal', rod([0, 2.2, .55], [0, 3.1, .55], .12, 12));
    b.add('metal', hl([[0, 3.05], [.14, 3.05], [.02, 3.65], [0, 3.66]], 12).translate(0, 0, .55));
    b.add('darkmetal', hl([[.1, 2.25], [.2, 2.25], [.2, 2.35], [.1, 2.35]], 14, true).translate(0, 0, .55));
    for (const x of [-.25, .25]) piston(b, [x, .6, .45], [x, 2.15, .5], .06);
    b.add('paint2', at(sd([[.3, .5], [.38, 1.4], [.3, 1.7], [-.3, 1.7], [-.35, 1.2], [-.25, .5]], .1, .03), .45, 0, 0));
    b.put(mVent(.3, .45, 4), -.45, 1.2, 0, 0, -PI / 2, 0);
    b.add('metal', ringY(.25, .06, 1.98, 6, 24));
    b.add('darkmetal', ball(.2, 0, 2.08, 0, 14, 10));
    b.put(mStripes(.4, .1, 4, .02), 0, 2.4, .36, 0, 0, 0);
    return b.out();
  });

  part('leg_thigh', GL, 'Legs', 'Heavy thigh', ['thigh', 'leg', 'heavy', 'hip'], () => bThigh().out());
  part('leg_shin', GL, 'Legs', 'Thruster shin', ['shin', 'calf', 'thrusters', 'knee'], () => bShin().out());

  part('leg_full', GL, 'Legs', 'Complete mech leg', ['leg', 'full', 'biped', 'standard'], () => {
    const b = B().put(bThigh()); b.put(bShin(), 0, 2.6, 0); b.put(bFootArmored(), 0, 5.32, 0);
    return b.out();
  });

  part('leg_chicken', GL, 'Legs', 'Reverse-joint walker leg', ['chicken walker', 'digitigrade', 'reverse joint', 'leg'], () => {
    const b = B();
    const hip = V3(0, 0, 0), knee = V3(0, 1.5, .85), ank = V3(0, 3.0, -.65), foot = V3(0, 4.25, .05);
    b.add('darkmetal', ball(.42, 0, 0, 0, 18, 12));
    // thigh
    b.add('darkmetal', beamYZ(hip, knee, .5, .4, .06));
    b.add('paint', at(beamYZ([0, .2, .1], [0, 1.4, .8], .72, .5, .08), 0, 0, 0));
    b.add('paint2', at(beamYZ([0, .4, .32], [0, 1.25, .82], .62, .2, .05), 0, 0, 0));
    piston(b, [0, .25, -.35], [0, 1.4, .45], .08);
    b.add('darkmetal', cyX(.32, .8, 0, knee.y, knee.z, 20)); b.add('metal', cyX(.2, .9, 0, knee.y, knee.z, 14));
    // shin (back)
    b.add('darkmetal', beamYZ(knee, ank, .44, .36, .05));
    b.add('paint', beamYZ([0, 1.6, .7], [0, 2.85, -.5], .6, .55, .08));
    b.add('paint2', at(beamYZ([0, 1.7, .9], [0, 2.7, -.2], .5, .12, .03), 0, 0, 0));
    for (const x of [-.32, .32]) piston(b, [x, 1.55, .55], [x, 2.85, -.75], .06);
    b.put(mThruster(.16, .3, 5), 0, 2.1, -.25, -PI / 2 - .4, 0, 0);
    b.add('darkmetal', cyX(.3, .76, 0, ank.y, ank.z, 20)); b.add('metal', cyX(.18, .86, 0, ank.y, ank.z, 14));
    // metatarsal
    b.add('darkmetal', beamYZ(ank, foot, .36, .3, .05));
    b.add('paint', beamYZ([0, 3.1, -.5], [0, 4.0, -.05], .48, .4, .06));
    piston(b, [0, 3.05, -.95], [0, 4.0, -.3], .05);
    b.add('darkmetal', ball(.24, foot.x, foot.y, foot.z, 14, 10));
    // toes (sole toward +Y)
    for (const a of [-.45, 0, .45]) {
      const s = B();
      s.add('paint2', at(beamYZ([0, 0, 0], [0, .15, .75], .2, .2, .05), 0, 0, 0));
      s.add('darkmetal', cyX(.09, .24, 0, .15, .75, 12));
      s.add('metal', taper(K.bez(V3(0, .15, .8), V3(0, .2, 1.05), V3(0, .4, 1.15)), .085, .01, 14, 8, .55));
      b.put(s, foot.x, foot.y, foot.z, 0, a, 0);
    }
    const sp = B(); sp.add('paint2', beamYZ([0, 0, 0], [0, .2, -.5], .18, .18, .04)); sp.add('metal', taper(K.bez(V3(0, .2, -.5), V3(0, .3, -.7), V3(0, .45, -.72)), .07, .01, 12, 8, .55));
    b.put(sp, foot.x, foot.y, foot.z);
    return b.out();
  });

  part('leg_tank', GL, 'Legs', 'Tank-tread leg', ['tank', 'treads', 'tracks', 'leg'], () => {
    const b = B();
    b.add('darkmetal', ball(.4, 0, 0, 0, 18, 12));
    b.add('paint', sd([[.4, .2], [.5, 1.6], [.35, 2.3], [-.35, 2.3], [-.5, 1.6], [-.4, .2]], .7, .07));
    b.add('paint2', at(sd([[.35, .4], [.42, 1.5], [.3, 2.1], [.15, 2.1], [.15, .4]], .76, .04), 0, 0, 0));
    for (const z of [-.3, .3]) piston(b, [.0, .5, z * 1.6], [0, 2.4, z * 2.6], .07);
    const cyc = 3.1, R = .5, L = 1.0;
    b.add('darkmetal', bx(0, cyc, 0, .62, .8, 2.0, .05));
    for (const z of [-L, L]) { b.add('darkmetal', cyX(R * .92, .6, 0, cyc, z, 24)); b.add('metal', cyX(R * .5, .66, 0, cyc, z, 18)); for (let i = 0; i < 6; i++) b.add('metal', at(bolt(.03), .33, cyc + Math.sin(i * PI / 3) * R * .35, z + Math.cos(i * PI / 3) * R * .35, 0, 0, -PI / 2)); }
    for (const z of [-.33, .33]) { b.add('darkmetal', cyX(R * .55, .6, 0, cyc + .2, z, 18)); b.add('metal', cyX(R * .3, .64, 0, cyc + .2, z, 14)); }
    // track loop (stadium in YZ plane)
    const per = 2 * (2 * L) + TAU * R, N = 46;
    for (let i = 0; i < N; i++) {
      let d = i / N * per, y, z, ang;
      if (d < 2 * L) { z = -L + d; y = cyc + R; ang = 0; }
      else if ((d -= 2 * L) < PI * R) { const a = d / R; z = L + Math.sin(a) * R; y = cyc + Math.cos(a) * R; ang = -a; }
      else if ((d -= PI * R) < 2 * L) { z = L - d; y = cyc - R; ang = PI; }
      else { d -= 2 * L; const a = d / R; z = -L - Math.sin(a) * R; y = cyc - Math.cos(a) * R; ang = PI - a; }
      const nrm = V3(0, Math.cos(ang), Math.sin(ang));
      b.add('rubber', at(cbox(.72, .07, .13, .015), 0, y + nrm.y * .04, z + nrm.z * .04, -ang, 0, 0));
      b.add('darkmetal', at(cbox(.72, .06, .03, .008), 0, y + nrm.y * .1, z + nrm.z * .1, -ang, 0, 0));
    }
    for (const s_ of [1, -1]) {
      const sk = B();
      sk.add('paint', sd([[-1.4, .45], [1.4, .45], [1.62, .1], [1.45, -.35], [-1.45, -.35], [-1.62, .1]], .08, .025));
      sk.add('paint2', at(sd([[-1.1, .3], [1.1, .3], [1.2, .05], [-1.2, .05]], .04, .012), .05, 0, 0));
      sk.add('darkmetal', at(sd([[-1.3, -.12], [1.3, -.12], [1.3, -.09], [-1.3, -.09]], .04, .005), .05, 0, 0));
      for (let i = 0; i < 5; i++) sk.add('metal', at(bolt(.03), .05, .38, -1.0 + i * .5, 0, 0, -PI / 2));
      b._put(sk, [.43, cyc - .05, 0, 0, 0, 0, 1], s_ < 0);
    }
    b.add('paint2', at(sd([[-1.0, 0], [1.0, 0], [.9, .12], [-.9, .12]], .78, .03), 0, cyc - .78, 0));
    return b.out();
  });

  part('leg_hover', GL, 'Legs', 'Hover skirt', ['hover', 'skirt', 'antigrav', 'levitate'], () => {
    const b = B();
    b.add('darkmetal', ball(.4, 0, 0, 0, 18, 12), cy(.32, 1.0, 16, .38, .2));
    b.add('paint', hl([[.45, .9], [.6, .95], [1.15, 1.6], [1.4, 2.2], [1.35, 2.3], [1.0, 2.3], [.4, 1.2]], 40, true));
    for (let i = 0; i < 8; i++) b.add(i % 2 ? 'paint2' : 'paint', band([[.65, 1.05], [.72, 1.05], [1.38, 1.95], [1.3, 1.98]], i * 45 + 4, i * 45 + 41, 6));
    b.add('darkmetal', hl([[1.2, 2.2], [1.45, 2.2], [1.45, 2.35], [1.2, 2.35]], 40, true));
    b.add('glow', hl([[.95, 2.32], [1.3, 2.32], [1.3, 2.36], [.95, 2.36]], 40, true));
    b.add('darkmetal', hl([[0, 2.25], [.98, 2.25], [.98, 2.3], [0, 2.3]], 40, true));
    for (let i = 0; i < 6; i++) b.put(mThruster(.15, .2, 5), ...polar(.6, i * 60 + 30, 2.25), 0, 0, 0);
    b.put(mThruster(.28, .25, 8), 0, 2.25, 0);
    for (let i = 0; i < 4; i++) { const a = i * 90 + 45; b.add('paint2', at(fr([[0, 0], [.4, .2], [.45, .7], [0, .5]], .07, .02), ...polar(1.25, a, 1.5), 0, (a - 90) * D, 0)); }
    for (let i = 0; i < 16; i++) b.add('metal', onN(bolt(.03), polar(1.42, i * 22.5, 2.275), polar(1, i * 22.5, 0)));
    for (const z of [-.3, .3]) piston(b, [0, .1, z], [0, 1.0, z * 2.4], .05);
    return b.out();
  });

  part('foot_armored', GL, 'Feet', 'Armored mech foot', ['foot', 'boot', 'armored'], () => bFootArmored().out());

  part('foot_claw', GL, 'Feet', 'Clawed mech foot', ['foot', 'claws', 'talons', 'raptor'], () => {
    const b = B();
    b.add('darkmetal', ball(.28, 0, 0, 0, 16, 12));
    b.add('paint', sd([[-.45, .2], [.4, .2], [.75, .5], [.7, .75], [-.55, .8], [-.6, .5]], .8, .07));
    b.add('paint2', at(sd([[-.3, .15], [.3, .15], [.5, .4], [-.4, .45]], .65, .04), 0, 0, 0));
    b.add('rubber', bx(0, .82, .05, .7, .1, 1.1, .03));
    for (const [a, sc] of [[-.4, .9], [0, 1.0], [.4, .9]]) {
      const s = B();
      s.add('darkmetal', cyX(.11, .26, 0, .55, .65, 12));
      s.add('paint2', at(beamYZ([0, .55, .65], [0, .7, 1.1], .22, .2, .05), 0, 0, 0));
      s.add('paint', bx(0, .58, .9, .2, .06, .4, .02, -.3));
      s.add('metal', taper(K.bez(V3(0, .7, 1.12), V3(0, .72, 1.5), V3(0, 1.05, 1.62)), .11, .01, 18, 8, .55));
      b.put(s, 0, 0, 0, 0, a, 0, sc);
    }
    const sp = B(); sp.add('darkmetal', cyX(.1, .24, 0, .6, -.5, 12));
    sp.add('metal', taper(K.bez(V3(0, .62, -.55), V3(0, .7, -.9), V3(0, 1.0, -.95)), .1, .01, 16, 8, .55));
    b.put(sp);
    for (const s_ of [1, -1]) piston(b, [.3 * s_, .05, -.25], [.32 * s_, .55, -.45], .04);
    return b.out();
  });

  // =================================================================== MECH DETAILS
  // all details: +Y = out of the surface, top edge toward -Z
  const surf = s => B().put(s, 0, 0, 0, -PI / 2, 0, 0).out();     // module facing +Z -> facing +Y

  part('dt_piston', GD, 'Hydraulics', 'Hydraulic piston', ['piston', 'hydraulic', 'actuator'], () => {
    const b = B();
    for (const z of [-.7, .7]) { b.add('darkmetal', at(fr([[-.14, 0], [.14, 0], [.1, .22], [-.1, .22]], .1, .02), 0, 0, z, 0, PI / 2, 0).translate(.07, 0, 0)); b.add('darkmetal', at(fr([[-.14, 0], [.14, 0], [.1, .22], [-.1, .22]], .1, .02), 0, 0, z, 0, PI / 2, 0).translate(-.07, 0, 0)); b.add('metal', cyX(.04, .26, 0, .17, z, 8)); }
    b.add('darkmetal', bx(0, .02, -.7, .36, .04, .36, .01), bx(0, .02, .7, .36, .04, .36, .01));
    piston(b, [0, .17, -.7], [0, .17, .7], .09, 'paint2');
    b.add('gold', rod([0, .17, -.25], [0, .17, -.2], .1, 12));
    return b.out();
  });

  part('dt_piston_rack', GD, 'Hydraulics', 'Twin piston rack', ['pistons', 'hydraulic', 'twin'], () => {
    const b = B();
    b.add('darkmetal', bx(0, .04, 0, .7, .08, 1.7, .02));
    for (const x of [-.18, .18]) {
      b.add('darkmetal', bx(x, .16, -.7, .14, .2, .14, .03), bx(x, .16, .7, .14, .2, .14, .03));
      piston(b, [x, .2, -.65], [x, .2, .65], .075);
    }
    b.add('rubber', hose(K.cr([V3(-.32, .1, -.8), V3(-.38, .3, -.2), V3(-.3, .25, .4), V3(-.18, .2, .55)]), .035, 12));
    b.add('metal', ...[-.6, 0, .6].map(z => bx(0, .1, z, .5, .04, .08, .01)));
    return b.out();
  });

  part('dt_hose', GD, 'Hydraulics', 'Ribbed hose arch', ['hose', 'cable', 'tube', 'ribbed'], () => {
    const b = B();
    hoseFull(b, K.cr([V3(0, .05, -.8), V3(0, .45, -.5), V3(0, .55, .1), V3(0, .3, .6), V3(0, .05, .8)]), .09, 14);
    hoseFull(b, K.cr([V3(.22, .05, -.7), V3(.25, .35, -.4), V3(.22, .42, .1), V3(.2, .2, .55), V3(.18, .05, .7)]), .06, 12);
    for (const z of [-.8, .8]) b.add('darkmetal', bx(.1, .03, z, .55, .06, .25, .02));
    b.add('darkmetal', bx(.1, .03, -.8, .5, .06, .02, .005));
    return b.out();
  });

  part('dt_cables', GD, 'Hydraulics', 'Cable loom', ['cables', 'wires', 'loom', 'bundle'], () => {
    const b = B();
    for (let i = 0; i < 6; i++) {
      const x = (i - 2.5) * .07, h = .14 + (i % 3) * .05;
      b.add(i % 2 ? 'rubber' : 'darkmetal', taper(K.cr([V3(x, .03, -.9), V3(x * 1.4, h, -.4), V3(x * .8 + .05, h + .04, .2), V3(x, .03, .9)]), .025, .025, 32, 6));
    }
    for (const z of [-.5, 0, .5]) { b.add('metal', at(new T.TorusGeometry(.24, .025, 6, 20, PI), 0, .02, z, 0, 0, 0).scale(1, .9, 1)); }
    for (const z of [-.9, .9]) b.add('darkmetal', bx(0, .05, z, .5, .1, .14, .03));
    for (const z of [-.9, .9]) for (let i = 0; i < 6; i++) b.add('glow', bx((i - 2.5) * .07, .11, z, .03, .02, .03, .004));
    return b.out();
  });

  part('dt_balljoint', GD, 'Hydraulics', 'Ball joint socket', ['joint', 'ball', 'socket', 'articulation'], () => {
    const b = B();
    b.add('paint2', at(tp(ngon(8, .42, PI / 8), .1, .03), 0, .05, 0));
    b.add('darkmetal', hl([[.26, .1], [.36, .1], [.36, .26], [.3, .32], [.24, .32]], 24, true));
    b.add('metal', ball(.26, 0, .32, 0, 22, 16));
    b.add('darkmetal', rod([0, .32, 0], [0, .85, 0], .12, 14));
    b.add('metal', ringY(.14, .03, .7, 6, 18));
    b.add('darkmetal', hl([[.12, .82], [.22, .85], [.22, .95], [.12, .97]], 16, true));
    for (let i = 0; i < 8; i++) b.add('metal', at(bolt(.025), ...polar(.36, i * 45 + 22.5, .1)));
    return b.out();
  });

  part('dt_vent', GD, 'Vents & Exhaust', 'Slatted vent', ['vent', 'grille', 'slats', 'intake'], () => {
    const s = B(); s.add('paint2', at(fr(cham(1.0, .7, .1), .06, .02), 0, 0, .03)); s.put(mVent(.82, .52, 6), 0, 0, .06);
    for (const [x, y] of [[-.43, -.28], [.43, -.28], [-.43, .28], [.43, .28]]) s.add('metal', at(bolt(.025), x, y, .06, PI / 2, 0, 0));
    return surf(s);
  });

  part('dt_fan', GD, 'Vents & Exhaust', 'Round fan vent', ['fan', 'vent', 'intake', 'cooling'], () => {
    const s = B(); s.add('paint2', at(fr(ngon(8, .58, PI / 8), .06, .02), 0, 0, .03)); s.put(mFan(.48, 11), 0, 0, .06);
    for (let i = 0; i < 8; i++) s.add('metal', at(bolt(.022), Math.cos(i * PI / 4) * .53, Math.sin(i * PI / 4) * .53, .06, PI / 2, 0, 0));
    return surf(s);
  });

  part('dt_exhaust', GD, 'Vents & Exhaust', 'Exhaust stacks', ['exhaust', 'smokestack', 'pipes', 'diesel'], () => {
    const b = B();
    b.add('darkmetal', at(tp(cham(.9, .4, .1), .1, .03), 0, .05, 0));
    for (let i = 0; i < 3; i++) {
      const x = -.3 + i * .3, h = 1.0 + (i === 1 ? .25 : 0);
      b.add('metal', rod([x, .1, 0], [x, h, -.08], .1, 16));
      b.add('darkmetal', hl([[.08, h - .05], [.13, h - .02], [.13, h + .08], [.11, h + .1], [.1, h + .02], [.08, h]], 16, true).translate(x, 0, -.08));
      b.add('darkmetal', ringY(.11, .022, 0, 6, 16).translate(x, .4, -.03));
      b.add('paint2', at(fr([[-.08, 0], [.08, 0], [.08, .3], [-.08, .3]], .02, .005), x, .5, -.04 + .1, -.08, 0, 0));
    }
    b.add('metal', bx(0, .25, -.02, .8, .08, .16, .02));
    return b.out();
  });

  part('dt_fins', GD, 'Vents & Exhaust', 'Cooling fins', ['heatsink', 'fins', 'cooling', 'radiator'], () => {
    const b = B();
    b.add('darkmetal', bx(0, .04, 0, .9, .08, 1.2, .02));
    for (let i = 0; i < 11; i++) { const z = -.5 + i * .1; b.add('metal', at(fr([[-.4, 0], [.4, 0], [.35, .3 + Math.sin(i / 10 * PI) * .12], [-.35, .3 + Math.sin(i / 10 * PI) * .12]], .025, .006), 0, .08, z)); }
    b.add('darkmetal', cyZ(.04, 1.15, .3, .2, 0, 10), cyZ(.04, 1.15, -.3, .2, 0, 10));
    b.add('glow', bx(0, .09, 0, .82, .01, 1.12, .003));
    return b.out();
  });

  part('dt_thruster_l', GD, 'Thrusters', 'Large thruster', ['thruster', 'engine', 'booster', 'nozzle'], () => {
    const b = B();
    b.add('paint2', at(tp(ngon(8, .62, PI / 8), .14, .04), 0, .07, 0));
    for (let i = 0; i < 8; i++) b.add('metal', at(bolt(.03), ...polar(.54, i * 45 + 22.5, .14)));
    b.put(mThruster(.55, 1.1, 12), 0, .12, 0);
    for (let i = 0; i < 4; i++) { const a = i * 90; piston(b, polar(.48, a, .16), polar(.36, a, .45), .035); }
    return b.out();
  });

  part('dt_thruster_s', GD, 'Thrusters', 'Vernier cluster', ['verniers', 'thrusters', 'rcs', 'small'], () => {
    const b = B();
    b.add('darkmetal', at(tp(rr(.8, .8, .15, 3), .1, .03), 0, .05, 0));
    for (const [x, z] of [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]]) b.put(mThruster(.15, .3, 5), x, .1, z, (z > 0 ? .25 : -.25), 0, (x > 0 ? -.25 : .25));
    b.put(mThruster(.1, .22, 4), 0, .1, 0);
    return b.out();
  });

  part('dt_sensor', GD, 'Sensors & Lights', 'Sensor cluster', ['sensor', 'camera', 'lens', 'array'], () => {
    const s = B();
    s.add('darkmetal', at(fr(cham(.8, .55, .12), .14, .04), 0, 0, .07));
    s.put(mLens(.15, .14, 'eye'), -.18, .02, .14);
    s.put(mLens(.08, .1, 'glow'), .16, .1, .14);
    s.put(mLens(.06, .08, 'glow'), .2, -.12, .14);
    s.put(mLens(.05, .07, 'eye'), .05, -.15, .14);
    s.add('paint2', at(fr([[-.4, .22], [.4, .22], [.36, .3], [-.36, .3]], .2, .03), 0, 0, .12));
    s.add('metal', rod([.32, .22, .1], [.42, .55, .1], .015, 6, .01));
    return surf(s);
  });

  part('dt_antenna', GD, 'Sensors & Lights', 'Blade antenna', ['antenna', 'blade', 'comms'], () => {
    const b = B();
    b.add('darkmetal', hl([[0, 0], [.14, 0], [.14, .06], [.1, .1], [0, .1]], 16));
    b.add('paint2', sd([[.08, .05], [-.05, .05], [-.4, 1.3], [-.36, 1.4]], .06, .015));
    b.add('metal', rod([.05, .08, .0], [.0, 1.6, .25], .02, 6, .008));
    b.add('glow', ball(.03, 0, 1.6, .25, 8, 6));
    for (let i = 0; i < 3; i++) b.add('metal', bx(0, .3 + i * .25, -.02 - i * .08, .02, .05, .18, .005));
    return b.out();
  });

  part('dt_radar', GD, 'Sensors & Lights', 'Radar dish', ['radar', 'dish', 'comms', 'sensor'], () => {
    const b = B();
    b.add('darkmetal', hl([[0, 0], [.22, 0], [.22, .08], [.12, .14], [0, .14]], 18));
    b.add('darkmetal', rod([0, .1, 0], [0, .6, 0], .06, 10));
    b.add('metal', cyX(.08, .2, 0, .6, 0, 12));
    const dish = B();
    dish.add('metal', hl([[0, 0], [.2, .015], [.4, .06], [.55, .14], [.58, .16], [.56, .17], [.38, .08], [.2, .035], [0, .02]], 32, true));
    dish.add('darkmetal', hl([[.56, .14], [.6, .14], [.6, .18], [.56, .18]], 32, true));
    dish.add('darkmetal', rod([0, 0, 0], [0, .38, 0], .02, 6));
    for (let i = 0; i < 3; i++) dish.add('darkmetal', rod(polar(.5, i * 120, .13), [0, .38, 0], .01, 4));
    dish.add('glow', ball(.04, 0, .4, 0, 8, 6));
    b.put(dish, 0, .6, 0, -.6, 0, 0);
    return b.out();
  });

  part('dt_spotlight', GD, 'Sensors & Lights', 'Spotlight', ['light', 'lamp', 'spotlight', 'headlight'], () => {
    const b = B();
    b.add('darkmetal', at(tp(rr(.5, .3, .06, 2), .08, .02), 0, .04, 0));
    b.add('darkmetal', bx(-.2, .2, 0, .04, .3, .14, .01), bx(.2, .2, 0, .04, .3, .14, .01));
    b.add('metal', cyX(.04, .48, 0, .3, 0, 10));
    const L = B();
    L.add('paint2', hl([[0, -.16], [.08, -.16], [.16, -.06], [.19, .08], [.15, .1], [0, .1]], 24, true, 0, TAU, 25));
    L.add('metal', hl([[.15, .08], [.2, .08], [.2, .13], [.15, .13]], 24, true));
    L.add('glow', new T.SphereGeometry(.16, 20, 8, 0, TAU, 0, PI / 3).translate(0, .02, 0));
    for (let i = -1; i <= 1; i++) L.add('darkmetal', bx(i * .08, .14, 0, .015, .02, .32, .004));
    b.put(L, 0, .3, 0, -.5, 0, 0);
    return b.out();
  });

  part('dt_gauges', GD, 'Sensors & Lights', 'Gauge cluster', ['gauge', 'dial', 'meter', 'panel'], () => {
    const s = B();
    s.add('darkmetal', at(fr(rr(.9, .5, .06, 3), .06, .02), 0, 0, .03));
    for (const [x, r] of [[-.25, .17], [.12, .13], [.33, .08]]) {
      s.add('metal', at(hl([[r * .85, 0], [r, 0], [r, .05], [r * .9, .07], [r * .85, .07]], 20, true), x, .02, .06, PI / 2, 0, 0));
      s.add('screen', at(cy(r * .86, .015, 20), x, .02, .06, PI / 2, 0, 0));
      s.add('glow', at(cbox(.012, r * .7, .01, .003), x + r * .25, .02 + r * .2, .085, 0, 0, -.8));
      for (let k = 0; k < 7; k++) { const a = -PI * .75 + k / 6 * PI * 1.5; s.add('darkmetal', bx(x + Math.sin(a) * r * .7, .02 + Math.cos(a) * r * .7, .082, .012, .03, .008, .002, 0, 0, -a)); }
    }
    for (let i = 0; i < 4; i++) s.add(i === 3 ? 'glow' : 'paint2', bx(-.33 + i * .1, -.18, .07, .06, .05, .03, .01));
    s.add('gold', bx(.2, -.18, .065, .3, .04, .02, .006));
    return surf(s);
  });

  part('dt_plate_hex', GD, 'Armor Plates', 'Hex armor plate', ['armor', 'plate', 'hex', 'panel'], () => {
    const b = B();
    b.add('paint', at(tp(ngon(6, .6, 0), .12, .04), 0, .06, 0));
    b.add('paint2', at(tp(ngon(6, .42, 0), .06, .02), 0, .14, 0));
    b.add('darkmetal', at(tp(ngon(6, .25, 0), .04, .01), 0, .18, 0));
    for (let i = 0; i < 6; i++) { const a = i * PI / 3; b.add('metal', at(bolt(.025), Math.cos(a) * .5, .12, Math.sin(a) * .5)); b.add('darkmetal', at(cbox(.15, .012, .02, .003), Math.cos(a + PI / 6) * .45, .121, Math.sin(a + PI / 6) * .45, 0, -a - PI / 6 + PI / 2, 0)); }
    return b.out();
  });

  part('dt_plate_layer', GD, 'Armor Plates', 'Layered armor plate', ['armor', 'plate', 'layered', 'panel'], () => {
    const b = B();
    b.add('darkmetal', at(tp(cham(1.2, 1.4, .18), .06, .02), 0, .03, 0));
    b.add('paint', at(tp(cham(1.1, 1.3, .16), .1, .035), 0, .1, 0));
    b.add('paint2', at(tp([[-.45, -.55], [.45, -.55], [.5, .2], [.3, .5], [-.3, .5], [-.5, .2]], .06, .02), 0, .18, 0));
    b.add('paint', at(tp([[-.3, -.4], [.3, -.4], [.32, .05], [-.32, .05]], .04, .012), 0, .23, 0));
    b.add('darkmetal', at(tp([[-.52, .25], [.52, .25], [.52, .28], [-.52, .28]], .02, .003), 0, .15, 0));
    for (const [x, z] of [[-.48, -.58], [.48, -.58], [-.48, .58], [.48, .58]]) b.add('metal', at(bolt(.03), x, .15, z));
    return b.out();
  });

  part('dt_plate_kite', GD, 'Armor Plates', 'Kite armor plate', ['armor', 'plate', 'wedge', 'kite', 'angled'], () => {
    const b = B();
    const k = [[0, -.9], [.45, -.2], [.4, .45], [0, .7], [-.4, .45], [-.45, -.2]];
    b.add('paint', at(tp(k, .12, .04), 0, .06, 0));
    b.add('paint2', at(tp(k.map(([x, z]) => [x * .7, z * .7 - .05]), .06, .02), 0, .14, 0));
    b.add('darkmetal', at(tp([[-.02, -.6], [.02, -.6], [.02, .4], [-.02, .4]], .03, .004), 0, .17, 0));
    b.add('gold', at(tp([[0, .45], [.18, .3], [0, .2], [-.18, .3]], .04, .01), 0, .18, 0));
    for (const [x, z] of [[.3, -.2], [-.3, -.2], [0, .55]]) b.add('metal', at(bolt(.025), x, .12, z));
    return b.out();
  });

  part('dt_chevron', GD, 'Armor Plates', 'Chevron plates', ['chevron', 'stripes', 'arrow', 'trim'], () => {
    const b = B();
    for (let i = 0; i < 3; i++) {
      const z = .35 - i * .32, c = [[-.5, z + .1], [0, z - .2], [.5, z + .1], [.5, z + .25], [0, z - .05], [-.5, z + .25]];
      b.add(i === 1 ? 'paint2' : 'paint', at(tp(c, .1 - i * .015, .03), 0, .05, 0));
      b.add('darkmetal', at(tp(c.map(([x, zz]) => [x * .9, zz + .02]).slice(0, 3).concat(c.map(([x, zz]) => [x * .9, zz + .02]).slice(0, 3).reverse().map(([x, zz]) => [x, zz + .025])), .02, .004), 0, .1 - i * .008, 0));
    }
    return b.out();
  });

  part('dt_rivets', GD, 'Armor Plates', 'Riveted panel', ['rivets', 'bolts', 'panel', 'plate'], () => {
    const b = B();
    b.add('paint', at(tp(rr(1.2, .8, .08, 3), .08, .025), 0, .04, 0));
    b.add('darkmetal', at(tp(rect(1.0, .02, 0, 0), .02, .004), 0, .08, 0));
    for (let i = 0; i < 9; i++) for (const z of [-.33, .33]) b.add('metal', ball(.028, -.52 + i * .13, .08, z, 8, 6));
    for (const x of [-.55, .55]) for (let i = 0; i < 4; i++) b.add('metal', ball(.028, x, .08, -.2 + i * .13, 8, 6));
    b.add('paint2', at(tp(rr(.4, .16, .04, 2, -.25, .15), .03, .01), 0, .09, 0));
    b.add('darkmetal', at(tp(rect(.3, .06, -.25, .15), .02, .004), 0, .1, 0));
    b.add('paint2', at(tp(rr(.3, .2, .04, 2, .3, -.15), .03, .01), 0, .09, 0));
    return b.out();
  });

  part('dt_warning', GD, 'Armor Plates', 'Warning stripe plate', ['warning', 'hazard', 'stripes', 'caution'], () => {
    const s = B(); s.add('darkmetal', at(fr(cham(1.1, .5, .06), .05, .015), 0, 0, .025));
    s.put(mStripes(.9, .3, 8, .03), 0, 0, .05);
    s.add('metal', bx(-.5, 0, .07, .03, .3, .03, .005), bx(.5, 0, .07, .03, .3, .03, .005));
    for (const x of [-.48, .48]) for (const y of [-.18, .18]) s.add('metal', at(bolt(.02), x, y, .05, PI / 2, 0, 0));
    return surf(s);
  });

  part('dt_hatch', GD, 'Armor Plates', 'Access hatch', ['hatch', 'door', 'panel', 'access'], () => {
    const s = B();
    s.add('metal', at(ex(holed(rr(.9, .7, .1, 3), rr(.74, .54, .06, 3)), .06, .015), 0, 0, .03));
    s.add('darkmetal', at(fr(rr(.76, .56, .07, 3), .02, .005), 0, 0, .01));
    s.add('paint2', at(fr(rr(.72, .52, .06, 3), .07, .02), 0, 0, .05));
    s.add('metal', rod([-.15, -.08, .1], [.15, -.08, .1], .02, 8), rod([-.15, -.08, .08], [-.15, -.08, .11], .03, 8), rod([.15, -.08, .08], [.15, -.08, .11], .03, 8));
    for (const x of [-.25, .25]) s.add('darkmetal', cyX(.03, .12, x, .28, .07, 10));
    s.put(mStripes(.4, .06, 4, .01), 0, .15, .085);
    s.add('glow', bx(.28, -.18, .09, .05, .03, .02, .005));
    return surf(s);
  });

  part('dt_emblem_wing', GD, 'Emblems', 'Winged chest emblem', ['emblem', 'crest', 'wings', 'badge'], () => {
    const s = B();
    s.add('gold', at(fr([[0, -.32], [.15, -.12], [.15, .18], [0, .3], [-.15, .18], [-.15, -.12]], .1, .03), 0, 0, .05));
    s.add('glow', at(fr(ngon(6, .07, PI / 2, 0, 0), .05, .012), 0, 0, .11));
    s.add('paint2', at(fr([[-.1, -.2], [.1, -.2], [.1, .12], [0, .2], [-.1, .12]], .04, .01), 0, 0, .1));
    for (const s_ of [1, -1]) for (let i = 0; i < 4; i++) {
      const w = [[.16, .1 - i * .1], [.55 + i * -.07, .28 - i * .1], [.75 - i * .1, .3 - i * .14], [.18, .02 - i * .1]].map(([x, y]) => [x * s_, y]);
      s.add(i % 2 ? 'gold' : 'metal', at(fr(w, .05 - i * .006, .012), 0, 0, .04));
    }
    return surf(s);
  });

  part('dt_emblem_shield', GD, 'Emblems', 'Shield emblem', ['emblem', 'shield', 'badge', 'insignia'], () => {
    const s = B();
    const sh_ = [[0, -.45], [.3, -.25], [.36, .15], [.32, .35], [0, .3], [-.32, .35], [-.36, .15], [-.3, -.25]];
    s.add('metal', at(fr(sh_, .08, .025), 0, 0, .04));
    s.add('paint2', at(fr(sh_.map(([x, y]) => [x * .8, y * .8]), .05, .015), 0, 0, .08));
    s.add('gold', at(fr([[-.04, -.25], [.04, -.25], [.04, .18], [-.04, .18]], .04, .01), 0, 0, .1), at(fr([[-.2, .02], [.2, .02], [.2, .08], [-.2, .08]], .04, .01), 0, 0, .1));
    s.add('gold', at(fr([[0, .22], [.1, .12], [0, .02], [-.1, .12]], .03, .008), 0, .0, .12));
    s.add('metal', at(fr([[-.28, .36], [-.14, .52], [0, .4], [.14, .52], [.28, .36], [0, .32]], .05, .015), 0, 0, .04));
    return surf(s);
  });

  part('dt_emblem_star', GD, 'Emblems', 'Star crest plate', ['emblem', 'star', 'crest', 'badge'], () => {
    const s = B();
    s.add('darkmetal', at(fr(ngon(24, .42, 0), .05, .015), 0, 0, .025));
    s.add('metal', at(ex(holed(ngon(32, .4, 0), ngon(32, .34, 0).reverse()), .05, .01), 0, 0, .06));
    const st = []; for (let i = 0; i < 10; i++) { const a = PI / 2 + i * PI / 5, r = i % 2 ? .13 : .3; st.push([Math.cos(a) * r, Math.sin(a) * r]); }
    s.add('gold', at(fr(st, .06, .02), 0, 0, .08));
    s.add('glow', at(fr(ngon(5, .05, PI / 2), .03, .008), 0, 0, .11));
    return surf(s);
  });

  part('dt_pipes', GD, 'Power & Mechanics', 'Pipe run', ['pipes', 'plumbing', 'conduit'], () => {
    const b = B();
    for (const [x, r, h] of [[-.22, .07, .2], [0, .09, .28], [.22, .06, .16]]) {
      const c = K.cr([V3(x, 0, -.9), V3(x, h, -.75), V3(x, h, -.2), V3(x + .05, h + .08, .1), V3(x, h, .4), V3(x, h, .75), V3(x, 0, .9)]);
      b.add('metal', K.taper(c, r, r, 64, 12));
      for (const t of [.25, .5, .75]) { const p = c.getPointAt(t), tg = c.getTangentAt(t); b.add('darkmetal', onN(cy(r * 1.45, .04, 12, r * 1.45, -.02), p, tg)); }
    }
    for (const z of [-.45, .45]) b.add('darkmetal', bx(0, .1, z, .7, .2, .08, .02));
    b.add('glow', bx(0, .2, -.45, .1, .03, .09, .006));
    return b.out();
  });

  part('dt_gears', GD, 'Power & Mechanics', 'Gear train', ['gears', 'cogs', 'mechanism', 'clockwork'], () => {
    const s = B();
    s.add('darkmetal', at(fr(rr(1.1, .7, .1, 3), .06, .02), 0, 0, .03));
    s.put(mGear(.3, 16, .08), -.25, .02, .06);
    s.put(mGear(.2, 11, .08), .2, .1, .06, 0, 0, .15);
    s.put(mGear(.14, 9, .06), .36, -.18, .14, 0, 0, .1);
    s.add('gold', at(cy(.05, .12, 10), .36, -.18, .1, PI / 2, 0, 0));
    return surf(s);
  });

  part('dt_cell', GD, 'Power & Mechanics', 'Reactor cell', ['reactor', 'cell', 'battery', 'canister', 'energy'], () => {
    const b = B();
    const s = B();
    s.add('darkmetal', hl([[0, 0], [.2, 0], [.24, .04], [.24, .16], [.2, .2], [0, .2]], 20));
    s.add('glow', cy(.15, .8, 20, .15, .2));
    for (let i = 0; i < 4; i++) s.add('metal', rod(polar(.2, i * 90 + 45, .2), polar(.2, i * 90 + 45, 1.0), .025, 6));
    for (const y of [.45, .75]) s.add('metal', ringY(.17, .02, y, 6, 20));
    s.add('darkmetal', hl([[0, 1.0], [.2, 1.0], [.24, 1.04], [.24, 1.16], [.18, 1.2], [.1, 1.2], [.1, 1.26], [0, 1.26]], 20));
    s.add('paint2', at(cbox(.08, .12, .02, .005), 0, .1, .245));
    b.put(s, 0, .26, 0, PI / 2, 0, 0).add('darkmetal', bx(0, .06, .25, .45, .12, .2, .03), bx(0, .06, .95, .45, .12, .2, .03));
    b.add('darkmetal', bx(0, .02, .6, .5, .04, 1.4, .01));
    return b.out();
  });

  part('dt_tank', GD, 'Power & Mechanics', 'Fuel tank', ['tank', 'fuel', 'canister', 'propellant'], () => {
    const b = B(), s = B();
    s.add('paint2', hl([[0, -.5], [.18, -.48], [.26, -.4], [.28, -.3], [.28, .3], [.26, .4], [.18, .48], [0, .5]], 22));
    for (const y of [-.25, 0, .25]) s.add('darkmetal', ringY(.285, .025, y, 6, 22));
    s.add('metal', hl([[0, .48], [.08, .48], [.08, .56], [0, .58]], 12));
    s.add('glow', at(cbox(.08, .05, .02, .006), 0, .1, .285));
    for (let i = 0; i < 2; i++) b.put(s, -.3 + i * .6, .3, 0, PI / 2, 0, 0);
    for (const z of [-.3, .3]) b.add('darkmetal', bx(0, .08, z, 1.0, .16, .1, .03));
    hoseFull(b, K.cr([V3(-.3, .32, -.56), V3(0, .5, -.66), V3(.3, .32, -.56)]), .03, 6);
    return b.out();
  });

  return P;
});
