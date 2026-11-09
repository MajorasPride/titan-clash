// 🐍 Snake bodies (Nov 9 2026, for MajorasPride's naga): ONE smooth piece from the waist to the tail tip, made from the creature's own
// tail bones and rebuilt whenever those bones move, so it bends with the skeleton (no stacked segments, no seams).
// Belly plates down the front, overlapping scales on the back, optional spike row. Plus two naga torsos that blend into it.
// All made in code (ours). Original designs; the reference pictures were only for the feel.
(function () {
  // pts: THREE.Vector3[] from the tail tip to the waist. R: body radius at the waist. o.spikes: dorsal spike row.
  window.MF_SNAKE = function (T, K, pts, R, o) {
    o = o || {};
    if (pts.length < 2) return [];
    const curve = new T.CatmullRomCurve3(pts.map(p => p.clone()), false, 'centripetal'), L = Math.max(.5, curve.getLength());
    const sp = R * .34, N = Math.max(48, Math.min(o.lite ? 120 : 220, Math.round(L / (sp / 3.2)))), M = o.lite ? 40 : 56;
    const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const down = (o.down || new T.Vector3(0, -1, 0)).clone().normalize(), front = (o.front || new T.Vector3(0, 0, 1)).clone().normalize(), up = down.clone().negate();   // world down / front, given in the part's own space
    const P = [], TT = [], B = [], S = []; let prev = null;
    for (let i = 0; i <= N; i++) { const u = i / N, p = curve.getPointAt(u), t = curve.getTangentAt(u).normalize();
      const h = Math.min(1, Math.max(0, t.dot(up)) * 1.25);   // lying flat: belly faces down; rising up: belly faces the front
      let b = down.clone().multiplyScalar(1 - h).addScaledVector(front, h); b.addScaledVector(t, -b.dot(t));
      if (b.lengthSq() < 1e-4) b = prev ? prev.clone() : new T.Vector3(0, 0, 1); b.normalize();
      if (prev) { b.lerp(prev, .3); b.addScaledVector(t, -b.dot(t)).normalize(); }
      prev = b.clone(); P.push(p); TT.push(t); B.push(b); S.push(new T.Vector3().crossVectors(t, b).normalize()); }
    const rad = u => R * (.09 + .91 * ss(0, .5, u)) * (u > .965 ? Math.sqrt(Math.max(0, 1 - Math.pow((u - .965) / .035, 2))) * .85 + .15 : 1);
    const pos = [], nc = Math.max(10, Math.round(2 * Math.PI * R / (sp * 1.05)));
    for (let i = 0; i <= N; i++) { const u = i / N, s = u * L, r = rad(u);
      for (let j = 0; j < M; j++) { const a = j / M * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), k = c > 0 ? 1 - .2 * c * c * c : 1;
        const wb = 1 - ss(.15, .45, c), wbel = ss(.5, .75, c);
        const col = j / M * nc, ci = Math.floor(col), fu = ((s / sp + (ci % 2) * .5) % 1 + 1) % 1, fc = col - ci;
        const e1 = (fu - .5) / .55, e2 = (fc - .5) / .55, scale = Math.max(0, 1 - e1 * e1 - e2 * e2);   // smooth domed scales in offset rows (no sharp steps = no dark streaks)
        const plate = .5 - .5 * Math.cos((((s / (R * .42)) % 1) + 1) % 1 * Math.PI * 2);                 // belly scutes, soft ridge per plate
        const bump = 1 + (.06 * scale * wb + .04 * plate * wbel) * ss(.04, .2, u);
        const d = B[i].clone().multiplyScalar(c * k).addScaledVector(S[i], sn * 1.06).multiplyScalar(r * bump);
        pos.push(P[i].x + d.x, P[i].y + d.y, P[i].z + d.z); } }
    const tip = P[0].clone().addScaledVector(TT[0], -R * .12), top = P[N].clone().addScaledVector(TT[N], R * .02);
    const iTip = pos.length / 3; pos.push(tip.x, tip.y, tip.z); const iTop = iTip + 1; pos.push(top.x, top.y, top.z);
    const back = [], belly = [], cj = j => Math.cos((j + .5) / M * Math.PI * 2), isBelly = j => cj(j) > .5, isBack = j => cj(j) <= .62;   // the two overlap a little so no seam shows
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const j2 = (j + 1) % M, a = i * M + j, b = i * M + j2, c = (i + 1) * M + j, d = (i + 1) * M + j2;
      if (isBelly(j)) belly.push(a, c, b, b, c, d); if (isBack(j)) back.push(a, c, b, b, c, d); }
    for (let j = 0; j < M; j++) { const j2 = (j + 1) % M; back.push(iTip, j2, j); back.push(iTop, N * M + j, N * M + j2); }
    const posB = pos.slice(); for (let i = 0; i <= N; i++) for (let j = 0; j < M; j++) { const v = (i * M + j) * 3; for (let k = 0; k < 3; k++) posB[v + k] = P[i].getComponent(k) + (pos[v + k] - P[i].getComponent(k)) * 1.015; }   // belly plates sit just on top
    const geo = (idx, arr) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(arr, 3)); g.setIndex(idx); return g; };
    const out = [{geo: geo(back, pos), mat: 'scale'}, {geo: geo(belly, posB), mat: 'leather'}];
    if (o.spikes) { const sk = []; for (let s = L * .1; s < L * .9; s += sp * 2.4) { const u = s / L, i = Math.round(u * N), r = rad(u), h = r * .62;
        const g = new T.ConeGeometry(r * .16, h, 7, 1).translate(0, h / 2, 0), dir = B[i].clone().negate().addScaledVector(TT[i], -.45).normalize();
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir)); const at = P[i].clone().addScaledVector(B[i], -r * .92); g.translate(at.x, at.y, at.z); sk.push(g); }
      if (sk.length) out.push({geo: K.merge(sk), mat: 'horn'}); }
    return out;
  };
  // the picture in the parts list: a rearing S-curve (the real one is made from your creature's bones)
  const demo = T => [[0, .5, -5.6], [1.3, .6, -4.2], [.3, .7, -2.6], [-1, .9, -1.6], [-.5, 1.7, -.3], [0, 3, .2], [0, 4.2, .3]].map(p => new T.Vector3(...p));

  (window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
    const V = (x, y, z) => new T.Vector3(x, y, z), ell = (rx, ry, rz) => new T.SphereGeometry(1, 20, 14).scale(rx, ry, rz);
    // torso profile helper: lathe, squashed front-back
    const torso = (prof, depth) => K.lathe(prof, 48).scale(1, 1, depth);
    // a ring of overlapping leaf scales around the hips: the snake's scales climbing up onto the torso and fading out
    const scaleRing = (r0, y0, rows, depth, size) => { const g = [];
      for (let k = 0; k < rows; k++) { const n = Math.round(22 - k * 3), y = y0 + k * size * .9, r = r0 * (1 - k * .03), sz = size * (1 - k * .22);
        for (let i = 0; i < n; i++) { const a = (i + (k % 2) * .5) / n * Math.PI * 2, x = Math.sin(a) * r, z = Math.cos(a) * r * depth;
          const leaf = ell(sz * .55, sz * .8, sz * .12); leaf.rotateX(-.25); leaf.rotateY(a); leaf.translate(x, y, z); g.push(leaf); } }
      return K.merge(g); };
    const humanProf = [[.001, 0], [.9, .02], [.92, .5], [.86, 1.0], [.74, 1.55], [.78, 2.0], [.98, 2.55], [1.16, 3.05], [1.22, 3.45], [1.1, 3.8], [.74, 4.0], [.42, 4.12], [.001, 4.15]];
    const beastProf = [[.001, 0], [1.0, .02], [1.05, .5], [1.0, 1.1], [.95, 1.6], [1.05, 2.1], [1.32, 2.7], [1.55, 3.2], [1.6, 3.6], [1.42, 3.95], [.95, 4.2], [.55, 4.32], [.001, 4.35]];
    const out = [];
    out.push({id: 'sk_snake', group: 'Tails', sub: '🐍 Snake bodies', name: 'Snake body (one piece, bends)', fitKind: 'snake', live: 'snake',
      tags: ['snake', 'naga', 'lamia', 'serpent', 'coil', 'body', 'tail', 'one piece'], make: () => window.MF_SNAKE(T, K, demo(T), 1, {})});
    out.push({id: 'sk_snake_spiked', group: 'Tails', sub: '🐍 Snake bodies', name: 'Snake body (spiked back)', fitKind: 'snake', live: 'snake', spikes: 1,
      tags: ['snake', 'naga', 'serpent', 'spikes', 'body', 'tail', 'one piece'], make: () => window.MF_SNAKE(T, K, demo(T), 1, {spikes: 1})});
    out.push({id: 'sk_torso_naga', group: 'Torsos & Bellies', sub: '🐍 Naga', name: 'Naga torso (human-style)', fitKind: 'torso', tags: ['naga', 'lamia', 'humanoid', 'slim', 'snake'],
      make: () => { const body = K.noise(torso(humanProf, .72), .012, 2), m = [body];
        for (const sd of [-1, 1]) { m.push(K.at(ell(.42, .3, .2), sd * .42, 3.25, .62, 0, 0, sd * .15));   // chest
          m.push(K.at(ell(.22, .4, .14), sd * .78, 2.2, .45, 0, 0, sd * -.3)); }                            // obliques
        for (const y of [1.75, 2.15, 2.55]) for (const sd of [-1, 1]) m.push(K.at(ell(.17, .15, .05), sd * .18, y, .6, 0, 0, 0));   // abs
        return [{geo: K.merge(m.map(g => g.index ? g.toNonIndexed() : g)), mat: 'skin'}, {geo: scaleRing(.93, .25, 4, .74, .32), mat: 'scale'}]; }});
    out.push({id: 'sk_torso_nagabeast', group: 'Torsos & Bellies', sub: '🐍 Naga', name: 'Naga torso (beast, scaled)', fitKind: 'torso', tags: ['naga', 'snake', 'beast', 'muscle', 'scales', 'serpent warrior'],
      make: () => { const body = K.noise(torso(beastProf, .74), .025, 3), m = [body], plates = [], sp = [];
        for (const sd of [-1, 1]) { m.push(K.at(ell(.62, .42, .26), sd * .55, 3.45, .82, 0, 0, sd * .12)); m.push(K.at(ell(.5, .55, .4), sd * 1.35, 3.6, 0, 0, 0, sd * .3)); }
        const rAt = y => { for (let i = 1; i < beastProf.length; i++) if (beastProf[i][1] >= y) { const [r0, y0] = beastProf[i - 1], [r1, y1] = beastProf[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 1; };
        for (let i = 0; i < 8; i++) { const y = .35 + i * .3, r = rAt(y) * .74 + .04; plates.push(new T.CylinderGeometry(r, r * 1.02, .22, 20, 1, true, -.8, 1.6).translate(0, y, 0)); }   // ribbed belly plates (front)
        for (let i = 0; i < 5; i++) { const h = .55 - i * .06; sp.push(K.at(new T.ConeGeometry(.1, h, 6).translate(0, h / 2, 0), 0, 1.3 + i * .6, -.76, -1.2, 0, 0)); }
        return [{geo: K.merge(m.map(g => g.index ? g.toNonIndexed() : g)), mat: 'scale'}, {geo: K.merge(plates.map(g => g.index ? g.toNonIndexed() : g)), mat: 'leather'}, {geo: K.merge(sp.map(g => g.index ? g.toNonIndexed() : g)), mat: 'horn'}]; }});
    out.push({id: 'sk_neck_naga', group: 'Necks & Spines', sub: 'Necks', name: 'Naga neck (humanoid)', fitKind: 'neck', tags: ['naga', 'humanoid', 'neck', 'slim'],
      make: () => { const n = K.lathe([[.001, 0], [.62, 0], [.5, .25], [.4, .7], [.37, 1.2], [.36, 1.7], [.001, 1.72]], 32).scale(1, 1, .88), m = [n];
        for (const sd of [-1, 1]) m.push(K.at(new T.CylinderGeometry(.09, .12, 1.3, 10), sd * .22, .75, .2, -.25, 0, sd * .35));   // neck muscles
        return [{geo: K.merge(m), mat: 'skin'}]; }});
    // humanoid naga head: smooth face, brow, nose, slit-pupil eyes, small fin-ears and a scaled crest down the back (original)
    out.push({id: 'sk_head_naga', group: 'Heads & Skulls', sub: '🐍 Naga', name: 'Naga warrior head (humanoid)', tags: ['naga', 'lamia', 'humanoid', 'face', 'snake', 'crest'],
      make: () => { const skull = K.lathe([[.001, 0], [.42, .05], [.6, .45], [.72, 1.0], [.74, 1.45], [.62, 1.85], [.38, 2.08], [.001, 2.15]], 40).scale(1, 1, 1.12).translate(0, .15, .1);
        const face = [skull, K.at(ell(.5, .55, .35), 0, .55, .55, 0, 0, 0), K.at(ell(.62, .14, .3), 0, 1.22, .62, 0, 0, 0)];   // jaw / chin, brow
        face.push(K.at(new T.ConeGeometry(.12, .42, 10).scale(1, 1, .8), 0, .95, .92, 1.25, 0, 0));                                   // nose
        for (const sd of [-1, 1]) face.push(K.at(ell(.07, .26, .2), sd * .74, 1.05, .1, 0, 0, sd * .3));                            // fin ears
        const eyes = [], pupils = [], crest = [];
        for (const sd of [-1, 1]) { eyes.push(K.at(ell(.16, .11, .08), sd * .3, 1.06, .78, 0, sd * .25, 0)); pupils.push(K.at(ell(.025, .09, .03), sd * .31, 1.06, .85, 0, sd * .25, 0)); }
        for (let i = 0; i < 8; i++) { const a = -.2 + i * .28, y = 1.95 - i * .22, z = -.2 - i * .13; crest.push(K.at(ell(.3 - i * .02, .22, .07), 0, y, z, a, 0, 0)); }
        return [{geo: K.merge(face), mat: 'skin'}, {geo: K.merge(eyes), mat: 'eye'}, {geo: K.merge(pupils), mat: 'darkmetal'}, {geo: K.merge(crest), mat: 'scale'}]; }});
    return out;
  });
})();
