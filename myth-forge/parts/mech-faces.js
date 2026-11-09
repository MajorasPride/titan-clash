// Mythic Forge parts: MECH EYES & FACES kit + new mech heads (id prefix mf_)
// Group 'Mech Eyes & Faces' = small pieces you stick on ANY head (visors, eyes, faceplates, crests, side gear).
// They are modelled in the shared mech-head frame: neck at origin, eye line y~1.05, face front z~0.55, head ~1.1 wide,
// so dropped on a head bone they land on the face of a mech head. Original designs (inspired by real-robot / super-robot
// anime genres and sci-fi helmets in general; no copied characters). Classic script, no modules.
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

  // ---------------------------------------------------------------- kit helpers
  // bend a flat front piece around the head: z drops off toward the sides (k = curve strength)
  function bendZ(g, k = .45, cx = 0) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) - cx; p.setZ(i, p.getZ(i) - k * x * x); } g.computeVertexNormals(); return g; }
  const front = (pts, t, z, k = .45, b = .02) => bendZ(at(fr(pts, t, b), 0, 0, z), k);       // flat outline in XY, wrapped onto the face at depth z
  const tube = (pts, r0, r1 = r0, seg = 24, rad = 8) => taper(cr(pts.map(v3)), r0, r1, seg, rad);
  const dome = (r, sz = .6) => new T.SphereGeometry(r, 32, 14, 0, TAU, 0, PI / 2).rotateX(PI / 2).scale(1, 1, sz);   // half ball facing +Z
  const disc = (r, t, x, y, z, seg = 24) => cyZ(r, t, x, y, z, seg);

  const P = [];
  const GF = 'Mech Eyes & Faces', GH = 'Mech Heads';
  const KIT = {};   // builders reused by the full heads below
  const part = (id, group, sub, name, tags, fn) => { KIT[id] = fn; P.push({id: 'mf_' + id, group, sub, name, tags: ['mech', 'face kit', ...tags], make: () => fn().out()}); };

  // =================================================================== VISORS
  part('visor_t', GF, 'Visors', 'T-visor', ['visor', 't-visor', 'helmet', 'glow'], () => {
    const b = B();
    b.add('darkmetal', band([[.5, .98], [.6, .98], [.6, 1.14], [.5, 1.14]], -58, 58, 28));
    b.add('glow', band([[.6, 1.02], [.612, 1.02], [.612, 1.1], [.6, 1.1]], -52, 52, 28));
    for (const y of [[1.14, 1.18], [.94, .98]]) b.add('paint2', band([[.55, y[0]], [.635, y[0]], [.635, y[1]], [.55, y[1]]], -60, 60, 28));
    b.add('darkmetal', bx(0, .84, .58, .14, .3, .08, .015));
    b.add('glow', bx(0, .85, .617, .055, .26, .012, .004));
    b.sym('paint2', bx(.09, .84, .6, .035, .34, .09, .01));
    return b;
  });
  part('visor_band', GF, 'Visors', 'Wraparound glass visor', ['visor', 'glass', 'band', 'pilot'], () => {
    const b = B();
    b.add('darkmetal', band([[.5, .93], [.57, .93], [.57, 1.19], [.5, 1.19]], -80, 80, 36));
    b.add('glassblue', band([[.57, .95], [.61, .97], [.61, 1.15], [.57, 1.17]], -76, 76, 36));
    b.add('glow', band([[.585, 1.05], [.592, 1.05], [.592, 1.075], [.585, 1.075]], -70, 70, 36));
    b.add('paint2', band([[.55, 1.17], [.64, 1.17], [.64, 1.22], [.55, 1.22]], -82, 82, 36));
    b.add('paint2', band([[.55, .9], [.63, .9], [.63, .95], [.55, .95]], -82, 82, 36));
    b.sym('metal', at(cy(.05, .05, 12), .6 * Math.sin(80 * D), 1.06, .6 * Math.cos(80 * D), 0, 0, -PI / 2 + .2));
    return b;
  });
  part('visor_slit', GF, 'Visors', 'Single glow slit', ['visor', 'slit', 'scanner', 'sleek'], () => {
    const b = B();
    b.add('darkmetal', band([[.52, 1.0], [.6, 1.01], [.6, 1.09], [.52, 1.1]], -50, 50, 28));
    b.add('glow', band([[.6, 1.035], [.608, 1.035], [.608, 1.065], [.6, 1.065]], -44, 44, 28));
    b.add('glow', ball(.035, 0, 1.05, .615, 16, 10));
    b.add('paint', front([[-.05, 1.1], [.05, 1.1], [.035, 1.42], [0, 1.48], [-.035, 1.42]], .06, .6, .3));    // nose ridge up the brow
    b.sym('paint', front([[.06, .99], [.4, 1.0], [.33, .86], [.12, .78], [.05, .82]], .05, .6, .5));           // cheek blades
    return b;
  });
  part('visor_dome', GF, 'Visors', 'Bubble dome visor', ['visor', 'dome', 'glass', 'super robot'], () => {
    const b = B();
    b.add('darkmetal', disc(.4, .06, 0, 1.05, .5, 32));
    b.add('glassblue', at(dome(.36, .55), 0, 1.05, .53));
    b.add('metal', ringZ(.37, .035, 0, 1.05, .53, 8, 40));
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; b.add('metal', at(cyZ(.022, .03, 0, 0, 0, 6), Math.cos(a) * .37, 1.05 + Math.sin(a) * .37, .57)); }
    b.sym('glow', ball(.06, .13, 1.08, .58, 16, 10));
    b.add('glow', bx(0, .93, .56, .26, .025, .02, .006));
    return b;
  });
  part('visor_v', GF, 'Visors', 'Angry V visor', ['visor', 'v', 'angry', 'villain'], () => {
    const b = B();
    b.add('darkmetal', front([[-.52, 1.2], [0, 1.0], [.52, 1.2], [.54, 1.04], [0, .84], [-.54, 1.04]], .09, .56, .5));
    b.add('glow', front([[-.46, 1.13], [0, .97], [.46, 1.13], [.47, 1.08], [0, .9], [-.47, 1.08]], .03, .61, .5));
    b.add('paint2', front([[-.56, 1.25], [0, 1.05], [.56, 1.25], [.55, 1.2], [0, 1.0], [-.55, 1.2]], .05, .6, .5));
    return b;
  });

  // =================================================================== EYES
  part('eyes_twin', GF, 'Eyes', 'Twin hero eyes', ['eyes', 'twin-eye', 'hero', 'real robot'], () => {
    const b = B();
    b.sym('darkmetal', front([[.03, 1.0], [.34, 1.08], [.38, 1.0], [.29, .92], [.05, .93]], .06, .57, .45));
    b.sym('glow', front([[.07, 1.0], [.31, 1.05], [.33, 1.0], [.27, .955], [.08, .96]], .03, .605, .45));
    b.add('paint', front([[-.42, 1.1], [-.06, 1.1], [0, 1.04], [.06, 1.1], [.42, 1.1], [.4, 1.17], [-.4, 1.17]], .08, .6, .45));   // brow
    return b;
  });
  part('eye_mono_rail', GF, 'Eyes', 'Mono-eye on a rail', ['eye', 'mono-eye', 'rail', 'scout'], () => {
    const b = B();
    b.add('darkmetal', band([[.48, .97], [.58, .97], [.58, 1.13], [.48, 1.13]], -72, 72, 32));
    b.add('metal', band([[.55, 1.13], [.62, 1.13], [.62, 1.16], [.55, 1.16]], -74, 74, 32));
    b.add('metal', band([[.55, .94], [.62, .94], [.62, .97], [.55, .97]], -74, 74, 32));
    const a = 18 * D; b.put(mLens(.065, .08, 'glow'), .5 * Math.sin(a), 1.05, .5 * Math.cos(a), 0, a, 0);
    b.sym('metal', at(cy(.035, .06, 10), .6 * Math.sin(72 * D), 1.05, .6 * Math.cos(72 * D), 0, 0, -PI / 2));
    return b;
  });
  part('eyes_goggles', GF, 'Eyes', 'Night-vision goggles', ['goggles', 'lens', 'night vision', 'soldier'], () => {
    const b = B();
    for (const s of [-1, 1]) {
      b.add('darkmetal', cyZ(.13, .22, s * .18, 1.05, .62, 24));
      b.add('metal', ringZ(.13, .02, s * .18, 1.05, .73, 6, 24));
      b.add('glassblue', disc(.1, .02, s * .18, 1.05, .73));
      b.add('glow', ringZ(.075, .012, s * .18, 1.05, .74, 4, 24));
    }
    b.add('darkmetal', bx(0, 1.05, .6, .16, .12, .16, .03));
    b.add('metal', rod([0, 1.12, .6], [0, 1.4, .48], .03, 8)); b.add('darkmetal', bx(0, 1.42, .44, .18, .08, .14, .02));
    return b;
  });
  part('eyes_quad', GF, 'Eyes', 'Quad sensor cluster', ['eyes', 'lens', 'cluster', 'sensor'], () => {
    const b = B();
    b.add('darkmetal', front(rr(.42, .34, .06), .16, .55, .4).translate(0, 1.05, 0));
    for (const [x, y, r] of [[-.09, 1.12, .06], [.09, 1.12, .06], [-.09, .98, .05], [.09, .98, .05]]) b.put(mLens(r, .07, 'glow'), x, y, .6);
    b.sym('glow', ball(.022, .25, 1.05, .61, 10, 8));
    b.add('paint2', front([[-.26, 1.24], [.26, 1.24], [.22, 1.29], [-.22, 1.29]], .06, .58, .4));
    return b;
  });
  part('eye_big_round', GF, 'Eyes', 'Big round cyclops eye', ['eye', 'cyclops', 'round', 'lens'], () => {
    const b = B();
    b.add('darkmetal', disc(.28, .08, 0, 1.05, .46, 32));
    b.add('metal', ringZ(.27, .03, 0, 1.05, .5, 8, 40));
    b.put(mLens(.15, .18, 'glow'), 0, 1.05, .48);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3; b.add('metal', at(cyZ(.02, .03, 0, 0, 0, 6), Math.cos(a) * .23, 1.05 + Math.sin(a) * .23, .52)); }
    return b;
  });
  part('eyes_round_pair', GF, 'Eyes', 'Round super-robot eyes', ['eyes', 'round', 'super robot', 'old school'], () => {
    const b = B();
    for (const s of [-1, 1]) { b.add('darkmetal', disc(.16, .06, s * .22, 1.03, .55)); b.put(mLens(.1, .12, 'glow'), s * .22, 1.03, .56); }
    b.add('paint', front([[-.46, 1.2], [.46, 1.2], [.42, 1.28], [-.42, 1.28]], .14, .58, .35));   // heavy brow
    return b;
  });

  // =================================================================== FACEPLATES
  part('face_vent', GF, 'Faceplates', 'Vented mouthguard', ['faceplate', 'mouth', 'vents', 'hero'], () => {
    const b = B();
    b.add('paint2', front([[-.3, .93], [.3, .93], [.25, .7], [0, .58], [-.25, .7]], .1, .58, .5));
    for (const x of [-.12, -.06, 0, .06, .12]) b.add('darkmetal', bendZ(bx(x, .8, .64, .025, .16 - Math.abs(x) * .4, .02, .006), .5));
    b.sym('paint', front([[.26, .93], [.36, .95], [.34, .78], [.27, .72]], .08, .55, .5));   // cheek guards
    return b;
  });
  part('face_chin', GF, 'Faceplates', 'Chin plate', ['chin', 'faceplate', 'hero'], () => {
    const b = B();
    b.add('paint', front([[-.17, .66], [.17, .66], [.12, .5], [-.12, .5]], .16, .56, .5, .03));
    b.add('darkmetal', bx(0, .6, .65, .12, .02, .02, .005));
    return b;
  });
  part('face_superjaw', GF, 'Faceplates', 'Heavy super-robot jaw', ['jaw', 'grille', 'super robot', 'heavy'], () => {
    const b = B();
    b.add('darkmetal', bx(0, .74, .38, .9, .36, .44, .06));
    for (let i = 0; i < 5; i++) b.add('metal', bx(0, .62 + i * .055, .61, .62, .022, .04, .008));
    b.add('paint', bx(0, .56, .44, .7, .08, .4, .03));
    b.sym('metal', cyX(.12, .1, .48, .82, .36, 20)); b.sym('darkmetal', cyX(.06, .14, .5, .82, .36, 12));   // hinge bolts
    return b;
  });
  part('face_respirator', GF, 'Faceplates', 'Respirator mask', ['respirator', 'filters', 'hoses', 'soldier'], () => {
    const b = B();
    b.add('darkmetal', rod([0, .8, .48], [0, .74, .76], .14, 18, .09));
    b.add('metal', disc(.085, .025, 0, .735, .77)); for (const y of [.71, .735, .76]) b.add('darkmetal', bx(0, y, .785, .12, .01, .01, .002));
    for (const s of [-1, 1]) {
      b.add('darkmetal', rod([s * .16, .78, .5], [s * .3, .68, .66], .08, 14));
      b.add('metal', onN(cy(.088, .04, 14), [s * .3, .68, .66], [s * .14, -.1, .16]));
      b.add('rubber', tube([[s * .32, .62, .6], [s * .4, .45, .45], [s * .36, .3, .2], [s * .28, .2, .05]], .028));
    }
    b.add('paint2', front([[-.3, .95], [.3, .95], [.22, .7], [-.22, .7]], .06, .53, .5));
    return b;
  });
  part('face_fangs', GF, 'Faceplates', 'Fang mask', ['mask', 'fangs', 'villain', 'teeth'], () => {
    const b = B(), pts = [[-.34, .96], [.34, .96], [.3, .72]];
    for (let i = 0; i <= 6; i++) { const x = .3 - i * .1; pts.push([x - .05, i % 2 ? .66 : .56]); }
    pts.push([-.3, .72]);
    b.add('paint2', front(pts, .08, .58, .5));
    b.sym('glow', front([[.08, .9], [.2, .9], [.12, .7]], .02, .625, .5));
    b.add('darkmetal', front([[-.05, .93], [.05, .93], [0, .82]], .02, .625, .5));
    return b;
  });

  // =================================================================== CRESTS & FINS
  part('crest_vfin', GF, 'Crests & Fins', 'V-fin crest', ['v-fin', 'crest', 'antenna', 'hero'], () => {
    const b = B();
    b.add('paint', front([[-.09, 1.2], [.09, 1.2], [.1, 1.3], [0, 1.38], [-.1, 1.3]], .1, .58, .3));
    b.add('glow', at(fr(ngon(6, .04, PI / 2, 0, 1.28), .03, .008), 0, 0, .64));
    b.sym('gold', at(fr([[.04, 1.26], [.12, 1.24], [.86, 1.84], [.8, 1.95], [.62, 1.86]], .045, .012), 0, 0, .56, -.2, 0, 0));
    return b;
  });
  part('crest_quad', GF, 'Crests & Fins', 'Four-fin crest', ['fins', 'crest', 'antenna', 'ace'], () => {
    const b = B();
    b.add('paint', front([[-.1, 1.18], [.1, 1.18], [.12, 1.3], [0, 1.4], [-.12, 1.3]], .1, .58, .3));
    b.add('glow', at(fr(ngon(4, .045, 0, 0, 1.29), .03, .008), 0, 0, .64));
    b.sym('gold', at(fr([[.04, 1.28], [.12, 1.26], [.9, 1.92], [.84, 2.02], [.64, 1.92]], .045, .012), 0, 0, .56, -.3, 0, 0));
    b.sym('gold', at(fr([[.06, 1.24], [.12, 1.22], [.62, 1.5], [.6, 1.56], [.44, 1.5]], .04, .01), 0, 0, .58, -.05, 0, 0));
    return b;
  });
  part('crest_blade', GF, 'Crests & Fins', 'Blade horn antenna', ['horn', 'blade', 'unicorn', 'crest'], () => {
    const b = B();
    b.add('paint', front([[-.12, 1.18], [.12, 1.18], [.08, 1.34], [-.08, 1.34]], .12, .56, .3));
    b.add('gold', at(fr([[-.07, 1.3], [.07, 1.3], [.02, 2.2], [0, 2.3], [-.02, 2.2]], .06, .02), 0, 0, .55, -.25, 0, 0));
    b.add('paint2', at(fr([[-.015, 1.36], [.015, 1.36], [0, 2.1]], .08, .01), 0, 0, .55, -.25, 0, 0));
    return b;
  });
  part('crest_horns', GF, 'Crests & Fins', 'Swept side horns', ['horns', 'demon', 'samurai', 'villain'], () => {
    const b = B();
    for (const s of [-1, 1]) b.add('paint2', taper(bez(V3(s * .38, 1.32, .28), V3(s * .8, 1.55, .25), V3(s * .95, 2.05, -.2)), .1, .015, 28, 10, .7));
    b.sym('metal', at(cy(.12, .08, 16), .38, 1.3, .3, 0, 0, -PI / 2.6));
    return b;
  });
  part('crest_ears', GF, 'Crests & Fins', 'Pointed ear fins', ['ears', 'cat', 'fins', 'cute'], () => {
    const b = B();
    for (const s of [-1, 1]) {
      const ear = at(fr([[-.18, 0], [.18, 0], [.02, .42]], .1, .03), 0, 0, 0, 0, 0, s * -.25);
      b.add('paint', at(ear, s * .32, 1.48, .02, -.2, 0, 0));
      const inner = at(fr([[-.1, .04], [.1, .04], [.01, .3]], .03, .008), 0, 0, 0, 0, 0, s * -.25);
      b.add('glow', at(inner, s * .32, 1.48, .065, -.2, 0, 0));
    }
    return b;
  });

  // =================================================================== SIDE GEAR
  part('side_sensors', GF, 'Side Gear', 'Ear sensor pods', ['ears', 'sensors', 'pods', 'antenna'], () => {
    const b = B();
    b.sym('paint2', cyX(.16, .12, .6, 1.03, 0, 24)); b.sym('darkmetal', cyX(.11, .04, .67, 1.03, 0, 20)); b.sym('glow', cyX(.045, .03, .69, 1.03, 0, 12));
    b.sym('metal', rod([.62, 1.15, -.04], [.7, 1.55, -.28], .022, 8, .01)); b.sym('glow', ball(.03, .7, 1.56, -.29, 10, 8));
    return b;
  });
  part('side_guns', GF, 'Side Gear', 'Head guns (twin)', ['guns', 'vulcan', 'weapons', 'head guns'], () => {
    const b = B();
    for (const s of [-1, 1]) { b.add('paint', bx(s * .44, 1.22, .3, .16, .14, .3, .03)); b.add('darkmetal', rod([s * .44, 1.22, .4], [s * .44, 1.22, .62], .035, 10)); b.add('metal', ringZ(.04, .01, s * .44, 1.22, .62, 4, 12)); }
    return b;
  });
  part('side_antenna', GF, 'Side Gear', 'Whip antenna (one side)', ['antenna', 'radio', 'commander'], () => {
    const b = B();
    b.add('darkmetal', bx(.6, 1.05, -.12, .14, .32, .34, .03)); b.add('metal', bx(.68, 1.05, -.12, .02, .24, .26, .005));
    b.add('metal', rod([.64, 1.2, -.22], [.78, 2.25, -.75], .025, 8, .008)); b.add('glow', ball(.03, .78, 2.26, -.76, 10, 8));
    return b;
  });
  part('side_cables', GF, 'Side Gear', 'Hanging cables', ['cables', 'wires', 'exposed', 'damaged'], () => {
    const b = B();
    const runs = [[.45, 1.15, -.2, .32, .02], [.52, .95, -.05, .26, .03], [.35, 1.3, -.35, .2, .022], [-.4, 1.1, -.3, -.3, .025], [.2, .9, .25, .18, .018]];
    for (const [x, y, z, xe, r] of runs) {
      b.add('rubber', tube([[x, y, z], [x * 1.25, y - .35, z - .1], [x * 1.05, y - .7, z + .05], [xe, .15, -.05]], r, r));
      b.add('metal', onN(cy(r * 1.6, .06, 8), [x, y, z], [x, .3, z])); b.add('metal', onN(cy(r * 1.6, .06, 8), [xe, .15, -.05], [0, -1, 0]));
    }
    return b;
  });
  part('side_lamp', GF, 'Side Gear', 'Rail lamp & camera', ['lamp', 'light', 'camera', 'rail', 'soldier'], () => {
    const b = B();
    b.add('metal', bx(.5, 1.35, .05, .07, .06, .7, .01));
    b.add('darkmetal', cyZ(.09, .26, .6, 1.42, .25, 20)); b.add('glow', disc(.07, .02, .6, 1.42, .385)); b.add('metal', ringZ(.09, .012, .6, 1.42, .38, 4, 20));
    b.add('darkmetal', bx(.6, 1.4, -.12, .16, .14, .18, .03)); b.add('glassblue', disc(.04, .02, .6, 1.42, -.02));
    return b;
  });

  // =================================================================== BLANK HEADS (build a face from the kit)
  const roundShell = (k = 1) => hl([[.3 * k, .5], [.5 * k, .58], [.6 * k, .85], [.6 * k, 1.2], [.52 * k, 1.45], [.32 * k, 1.6], [0, 1.64]], 40).scale(1, 1, .95);
  part('head_blank_round', GH, 'Blank (build a face)', 'Blank round helmet', ['blank', 'helmet', 'build your own'], () => {
    const b = B().put(mNeck(.55, .28));
    b.add('paint', roundShell());
    b.add('darkmetal', band([[.42, .5], [.56, .62], [.56, .66], [.42, .58]], -180, 180, 36));
    return b;
  });
  part('head_blank_box', GH, 'Blank (build a face)', 'Blank box helmet', ['blank', 'boxy', 'build your own'], () => {
    const b = B().put(mNeck(.5, .28));
    b.add('paint', bx(0, 1.07, 0, 1.08, 1.0, 1.08, .12));
    b.add('darkmetal', bx(0, .54, 0, .9, .1, .9, .03));
    return b;
  });

  // =================================================================== FULL HEADS (show the kit off)
  part('head_winghero', GH, 'Hero', 'Wing-fin hero head', ['hero', 'fins', 'twin-eye', 'real robot'], () => {
    const b = B().put(mNeck(.5, .26));
    b.add('paint', roundShell(.95));
    b.add('darkmetal', band([[.5, .62], [.585, .62], [.585, 1.0], [.5, 1.0]], -42, 42, 24));        // dark face recess
    b.put(KIT.eyes_twin()); b.put(KIT.face_vent()); b.put(KIT.face_chin());
    b.add('paint2', band([[.54, 1.14], [.6, 1.16], [.56, 1.5], [.5, 1.5]], -22, 22, 12));           // forehead ridge
    b.add('paint', front([[-.08, 1.18], [.08, 1.18], [.1, 1.3], [0, 1.4], [-.1, 1.3]], .1, .6, .3));
    b.add('glow', at(fr(ngon(6, .04, PI / 2, 0, 1.28), .03, .008), 0, 0, .66));
    b.sym('gold', at(fr([[.04, 1.27], [.14, 1.24], [.5, 1.42], [1.0, 1.7], [.95, 1.78], [.45, 1.58]], .045, .012), 0, 0, .58, -.35, .1, 0));   // swept wing fins
    b.sym('gold', at(fr([[.1, 1.2], [.16, 1.2], [.55, 1.3], [.5, 1.36]], .04, .01), 0, 0, .58, -.2, .1, 0));
    b.put(KIT.side_sensors());
    b.sym('paint2', sd([[.25, .7], [-.2, .62], [-.35, .95], [.15, 1.05]], .08, .02).translate(.58, 0, 0));   // side cheek armour
    return b;
  });
  part('head_ironsuper', GH, 'Super Robot', 'Iron giant head', ['super robot', 'heavy', 'dome', 'old school', 'boxy'], () => {
    const b = B().put(mNeck(.45, .32));
    b.add('darkmetal', bx(0, 1.0, 0, 1.2, .9, 1.1, .14));
    b.add('darkmetal', bx(0, 1.48, -.05, 1.0, .12, .95, .05));
    b.add('glassblue', at(new T.SphereGeometry(.36, 32, 12, 0, TAU, 0, PI / 2).scale(1, .7, 1), 0, 1.53, -.05));   // glass lid on top
    b.add('glow', ball(.12, 0, 1.6, -.05, 16, 10)); b.add('metal', ringY(.37, .035, 1.53, 8, 40));
    b.add('darkmetal', bx(0, 1.25, .5, 1.14, .14, .2, .05));                                                       // heavy brow
    b.put(KIT.eyes_round_pair(), 0, 0, .0);
    b.put(KIT.face_superjaw(), 0, -.08, .02);
    b.sym('metal', cyX(.2, .12, .64, 1.0, 0, 24)); b.sym('darkmetal', cyX(.1, .2, .7, 1.0, 0, 12));                 // big side bolts
    for (const y of [.86, .94]) b.sym('metal', bx(.61, y + .25, -.35, .04, .03, .3, .006));
    return b;
  });
  part('head_cutaway', GH, 'Sensor', 'Cut-away cable head', ['exposed', 'cables', 'cyclops', 'sensor', 'damaged'], () => {
    const b = B().put(mNeck(.5, .26));
    b.add('paint', band([[.2, 1.6], [.5, 1.5], [.62, 1.2], [.6, .85], [.52, .7], [.46, .74], [.53, .88], [.55, 1.18], [.45, 1.43], [.18, 1.53]], -8, 262, 40));   // shell, open at the front-left
    b.add('paint2', band([[.6, 1.0], [.66, 1.0], [.66, 1.07], [.6, 1.07]], -6, 160, 24));
    b.add('darkmetal', at(hl([[0, .55], [.32, .6], [.36, .9], [.34, 1.25], [.22, 1.42], [0, 1.45]], 24), 0, 0, -.05));   // inner frame skull
    for (let i = 0; i < 6; i++) { const a = (-85 + i * 14) * D, r = .4; b.add('rubber', tube([[Math.sin(a) * r, 1.35 - i * .08, Math.cos(a) * r - .1], [Math.sin(a) * .5, 1.05 - i * .05, Math.cos(a) * .45], [Math.sin(a) * .45, .7, Math.cos(a) * .3], [Math.sin(a) * .25, .3, Math.cos(a) * .15]], .025 + (i % 2) * .01)); }
    b.add('metal', rod([-.15, .7, .1], [-.35, 1.1, .2], .035, 10)); b.add('metal', rod([-.33, 1.06, .19], [-.37, 1.2, .22], .05, 10));    // piston
    b.put(KIT.eye_big_round(), 0, 0, -.1, 0, -.75, 0);
    b.add('darkmetal', bx(.3, .78, .45, .3, .1, .2, .02)); b.add('glow', bx(.3, .78, .555, .2, .02, .01, .004));   // jaw slot
    b.add('screen', at(fr(rr(.2, .14, .03), .02, .005), .42, 1.25, .38, 0, .7, 0));
    return b;
  });

  return P;
});
