// Kaiju kit (original design, ours): "Basalt kaiju" — a heavy upright reptile titan with rows of
// hexagonal basalt-column dorsal plates and magma glowing between the column stacks.
// Inspired by the classic giant-monster silhouette (thick legs, big tail, upright), not a copy of any character.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const {V3} = K, G = 'Kaiju Kit', P = (geo, mat) => ({geo, mat}), PI = Math.PI;
  const lerpProfile = (prof, y) => { for (let i = 1; i < prof.length; i++) { const [r0, y0] = prof[i - 1], [r1, y1] = prof[i]; if (y <= y1) return r0 + (r1 - r0) * (y - y0) / Math.max(1e-6, y1 - y0); } return prof[prof.length - 1][0]; };
  const body = (prof, seg = 28, sx = 1, sz = 1, nz = .04, nf = 2.2) => { const g = K.lathe(prof.map(([r, y]) => [Math.max(.01, r), y]), seg); g.scale(sx, 1, sz); return K.noise(g, nz, nf); };

  // ---- basalt column stack: obsidian hex prisms with glowing magma seams between them
  function column(r, h, x = 0, z = 0, tilt = 0, seed = 0) {
    const out = [], n = h > 1.2 ? 3 : h > .6 ? 2 : 1, gap = Math.min(.07, h * .05), segH = (h - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) { const y0 = i * (segH + gap), rr = r * (1 - i * .12), top = i === n - 1;
      const g = new T.CylinderGeometry(top ? rr * .55 : rr * .92, rr, segH, 6, 1); g.translate(0, y0 + segH / 2, 0);
      if (top) { const p = g.attributes.position; for (let k = 0; k < p.count; k++) if (p.getY(k) > y0 + segH * .99) p.setY(k, y0 + segH + (((k * 7 + seed * 3) % 5) - 2) * rr * .12); g.computeVertexNormals(); }
      out.push(P(g, 'obsidian'));
      if (!top) { const s = new T.CylinderGeometry(rr * .8, rr * .8, gap * 1.6, 6); s.translate(0, y0 + segH + gap / 2, 0); out.push(P(s, 'glow')); } }
    for (const p of out) { p.geo.rotateY((seed * 1.3) % 1); p.geo.rotateX(tilt); p.geo.rotateZ(((seed * 37) % 7 - 3) * .025); p.geo.translate(x, 0, z); }
    return out;
  }
  // a row of columns along local Z, tallest in the middle (+Y = out of the back)
  function dorsalRow(r, h, n = 5, spread = 1) {
    const out = [];
    for (let i = 0; i < n; i++) { const t = n === 1 ? 0 : i / (n - 1) * 2 - 1, hh = h * (1 - .55 * t * t), z = t * spread * r * 2.2;
      out.push(...column(r * (1 - .25 * Math.abs(t)), hh, 0, z, t * .38, i + 1));
      if (Math.abs(t) < .1) for (const sx of [-1, 1]) out.push(...column(r * .6, hh * .45, sx * r * 1.3, z, 0, i + 5)); }
    return out;
  }
  // belly scutes: horizontal plate bands across the front (+Z) of a body profile
  function scutes(prof, y0, y1, step, sz = .85, mat = 'oldbone') {
    const out = [];
    for (let y = y0; y <= y1 + 1e-6; y += step) { const R = lerpProfile(prof, y), g = new T.TorusGeometry(R * .97, .12, 6, 22, 1.7);
      g.rotateZ(PI / 2 - .85); g.rotateX(PI / 2); g.scale(1, 1, sz); g.translate(0, y, 0); out.push(P(g, mat)); }
    return out;
  }
  const claw = (x, y, z, len, r, rx = 0, rz = 0) => { const g = K.taper(K.bez(V3(0, 0, 0), V3(0, len * .55, len * .1), V3(0, len, len * .45)), r, r * .08, 10, 8, .8); return P(K.at(g, x, y, z, rx, 0, rz), 'horn'); };

  // ---- profiles (radius, height)
  const HIP = [[.05, -.95], [1.0, -.85], [1.6, -.4], [1.85, .4], [1.88, 1.3], [1.72, 2.2], [1.58, 2.9], [1.4, 3.1]];
  const CHEST = [[1.5, -1.4], [1.6, -.6], [1.56, .2], [1.42, .8], [1.15, 1.3], [.9, 1.55], [.05, 1.62]];

  return [
    // ---------------- head + jaw (head bone keeps world axes: +Y up, face toward +Z)
    {id: 'kj_head', group: G, sub: 'Head', name: 'Basalt kaiju head', tags: ['kaiju', 'reptile', 'head'], along: true, nofit: true, make: () => {
      const prof = [[.02, -.65], [.55, -.6], [.78, -.35], [.84, 0], [.8, .5], [.7, 1.0], [.6, 1.5], [.5, 1.85], [.32, 2.05], [.02, 2.13]];
      const g = K.lathe(prof, 30); g.rotateX(PI / 2); g.scale(.86, .72, 1.08);
      const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i);
        if (y < -.2 && z > .1) p.setY(i, -.2 + (y + .2) * .2);                       // flat mouth line under the snout
        if (y > .35) p.setY(i, y + Math.max(0, .5 - Math.abs(z - .9)) * .25); }       // heavy brow hump
      g.translate(0, .38, 0); K.noise(g, .035, 3);
      const out = [P(g, 'scale')];
      for (const s of [-1, 1]) {
        out.push(P(K.taper(K.bez(V3(s * .25, .95, 1.7), V3(s * .62, 1.0, 1.15), V3(s * .72, .88, .4)), .15, .05, 18, 8), 'scale'));   // brow ridge
        out.push(P(new T.SphereGeometry(.075, 14, 10).scale(1.5, .55, 1).translate(s * .52, .78, 1.2), 'glow'));                                  // eye
        out.push(P(new T.SphereGeometry(.1, 10, 8).translate(s * .2, .5, 2.02), 'obsidian'));                                                   // nostril
        out.push(P(K.taper(K.bez(V3(s * .5, .9, -.25), V3(s * .75, 1.05, -.6), V3(s * .95, 1.25, -1.05)), .16, .02, 14, 7), 'obsidian'));     // back-of-skull spikes
        out.push(P(K.taper(K.bez(V3(s * .62, .55, -.3), V3(s * .92, .55, -.55), V3(s * 1.15, .6, -.85)), .11, .02, 12, 6), 'obsidian'));
        for (let i = 0; i < 8; i++) { const z = .4 + i * .225, R = lerpProfile(prof, z) * .86 * .92, t = new T.ConeGeometry(.055, .2 - i * .008, 6); t.rotateX(PI); t.translate(s * R, -.29, z); out.push(P(t, 'tooth')); } }
      for (let i = 0; i < 2; i++) { const t = new T.ConeGeometry(.06, .22, 6); t.rotateX(PI); t.translate((i - .5) * .2, -.29, 2.2); out.push(P(t, 'tooth')); }
      out.push(...column(.13, .5, 0, -.15, -.3, 2).map(c => (c.geo.translate(0, 1.0, 0), c)), ...column(.1, .35, 0, .3, -.3, 4).map(c => (c.geo.translate(0, 1.05, 0), c)));
      return out; }},
    {id: 'kj_jaw', group: G, sub: 'Head', name: 'Basalt kaiju jaw', tags: ['kaiju', 'jaw', 'teeth'], along: true, nofit: true, make: () => {
      const prof = [[.02, -.55], [.55, -.5], [.72, -.2], [.7, .4], [.6, .9], [.5, 1.35], [.36, 1.7], [.02, 1.82]];
      const g = K.lathe(prof, 26); g.rotateX(PI / 2); g.scale(.82, .5, 1.08);
      const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setY(i, 0);
      g.computeVertexNormals(); g.translate(0, -.05, 0); K.noise(g, .025, 3);
      const out = [P(g, 'scale')], tongue = new T.SphereGeometry(.4, 14, 8).scale(1, .25, 2.2).translate(0, -.04, .7); out.push(P(tongue, 'flesh'));
      for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const z = .2 + i * .22, R = lerpProfile(prof, z) * .82 * .9, t = new T.ConeGeometry(.05, .18 - i * .008, 6); t.translate(s * R, .05, z); out.push(P(t, 'tooth')); }
      return out; }},
    // ---------------- neck + body
    {id: 'kj_neck', group: G, sub: 'Body', name: 'Thick kaiju neck', tags: ['kaiju', 'neck'], along: true, nofit: true, make: () => {
      const prof = [[1.1, -.5], [1.08, 0], [1.0, .5], [.92, .95], [.85, 1.3]], g = body(prof, 26, 1, .9);
      return [P(g, 'scale'), ...scutes(prof, -.3, 1.0, .45, .9 * .98)]; }},
    {id: 'kj_chest', group: G, sub: 'Body', name: 'Barrel chest', tags: ['kaiju', 'torso', 'chest'], along: true, nofit: true, make: () =>
      [P(body(CHEST, 32, 1, .8, .05), 'scale'), ...scutes(CHEST, -1.2, .9, .5, .8 * .98)]},
    {id: 'kj_hips', group: G, sub: 'Body', name: 'Heavy hips + belly', tags: ['kaiju', 'torso', 'belly', 'hips'], along: true, nofit: true, make: () =>
      [P(body(HIP, 32, 1, .85, .05), 'scale'), ...scutes(HIP, -.3, 2.7, .5, .85 * .98)]},
    // ---------------- legs
    {id: 'kj_thigh', group: G, sub: 'Legs', name: 'Pillar thigh', tags: ['kaiju', 'leg', 'thigh'], make: () =>
      [P(body([[.05, -.5], [.8, -.35], [1.05, .3], [1.0, 1.2], [.84, 1.9], [.72, 2.25], [.05, 2.4]], 26, 1, 1, .05), 'scale')]},
    {id: 'kj_shin', group: G, sub: 'Legs', name: 'Pillar shin', tags: ['kaiju', 'leg', 'shin'], make: () => {
      const g = body([[.05, -.3], [.74, -.15], [.76, .6], [.66, 1.4], [.62, 2.1], [.68, 2.35], [.05, 2.5]], 24, 1, 1, .04), knee = K.noise(new T.SphereGeometry(.5, 16, 12).scale(1, .9, .7).translate(0, .05, .38), .03, 3);
      return [P(g, 'scale'), P(knee, 'scale')]; }},
    {id: 'kj_foot', group: G, sub: 'Legs', name: 'Clawed stomper foot', tags: ['kaiju', 'foot', 'claws'], nofit: true, make: () => {
      const pad = K.noise(new T.SphereGeometry(.75, 24, 14).scale(1.05, 1.15, .6).translate(0, .55, -.05), .04, 2.5), ankle = K.noise(new T.SphereGeometry(.62, 18, 12).translate(0, .05, .05), .03, 3);
      const out = [P(pad, 'scale'), P(ankle, 'scale')];
      for (const x of [-.45, 0, .45]) { const toe = K.taper(K.bez(V3(x * .8, .9, -.1), V3(x, 1.35, -.15), V3(x * 1.15, 1.7, -.3)), .26, .17, 12, 10); out.push(P(K.noise(toe, .02, 4), 'scale'));
        out.push(claw(x * 1.15, 1.68, -.3, .42, .12, -.5, 0)); }
      out.push(P(K.taper(K.bez(V3(0, .15, -.25), V3(0, -.2, -.35), V3(0, -.55, -.55)), .2, .08, 10, 8), 'scale'), claw(0, -.5, -.55, .3, .09, PI * .75));
      return out; }},
    // ---------------- arms (smaller, like the classic kaiju silhouette)
    {id: 'kj_upperarm', group: G, sub: 'Arms', name: 'Kaiju upper arm', tags: ['kaiju', 'arm'], make: () =>
      [P(body([[.05, -.3], [.5, -.2], [.56, .4], [.48, 1.1], [.42, 1.45], [.05, 1.55]], 20, 1, 1, .03), 'scale')]},
    {id: 'kj_forearm', group: G, sub: 'Arms', name: 'Kaiju forearm', tags: ['kaiju', 'arm'], make: () =>
      [P(body([[.05, -.2], [.44, -.1], [.46, .5], [.38, 1.15], [.34, 1.4], [.05, 1.48]], 20, 1, 1, .03), 'scale')]},
    {id: 'kj_hand', group: G, sub: 'Arms', name: 'Four-claw kaiju hand', tags: ['kaiju', 'hand', 'claws'], nofit: true, make: () => {
      const palm = K.noise(new T.SphereGeometry(.4, 16, 12).scale(1, 1.1, .7).translate(0, .3, 0), .025, 3), out = [P(palm, 'scale')];
      for (let i = 0; i < 4; i++) { const x = (i - 1.5) * .2, f = K.taper(K.bez(V3(x, .5, 0), V3(x * 1.15, .85, .1), V3(x * 1.2, 1.05, .35)), .11, .07, 10, 8); out.push(P(f, 'scale'), claw(x * 1.2, 1.03, .35, .28, .065, .9)); }
      out.push(P(K.taper(K.bez(V3(.32, .3, .2), V3(.45, .5, .45), V3(.4, .62, .65)), .12, .07, 10, 8), 'scale'), claw(.4, .6, .65, .24, .06, 1.2));
      return out; }},
    // ---------------- tail (one segment per tail bone so it bends with the animation)
    {id: 'kj_tail', group: G, sub: 'Tail', name: 'Tail segment', tags: ['kaiju', 'tail'], along: true, nofit: true, make: () => {
      const prof = [[.9, -.15], [1.0, .05], [.97, .55], [.88, .98], [.82, 1.12], [.05, 1.16]];
      return [P(body(prof, 24, 1, .9, .035, 2.5), 'scale'), ...scutes(prof, .15, .95, .4, .9 * .98)]; }},
    {id: 'kj_tailtip', group: G, sub: 'Tail', name: 'Tail tip', tags: ['kaiju', 'tail'], along: true, nofit: true, make: () =>
      [P(body([[.9, -.15], [1.0, .05], [.85, .6], [.55, 1.3], [.25, 1.9], [.05, 2.25]], 22, 1, .9, .03, 2.5), 'scale')]},
    // ---------------- dorsal plates (stick on the back: +Y = out of the back, row runs along local Z)
    {id: 'kj_dorsal_l', group: G, sub: 'Dorsal plates', name: 'Basalt dorsal row (big)', tags: ['kaiju', 'spikes', 'plates', 'back', 'glow'], make: () => dorsalRow(.34, 2.3, 5, .8)},
    {id: 'kj_dorsal_m', group: G, sub: 'Dorsal plates', name: 'Basalt dorsal row (medium)', tags: ['kaiju', 'spikes', 'plates', 'back', 'glow'], make: () => dorsalRow(.27, 1.6, 5, .8)},
    {id: 'kj_dorsal_s', group: G, sub: 'Dorsal plates', name: 'Basalt dorsal row (small)', tags: ['kaiju', 'spikes', 'plates', 'back', 'glow'], make: () => dorsalRow(.19, 1.0, 4, .8)},
    {id: 'kj_column', group: G, sub: 'Dorsal plates', name: 'Single basalt column', tags: ['kaiju', 'spike', 'glow', 'rock'], make: () => column(.25, 1.6, 0, 0, 0, 3)},
  ];
});
