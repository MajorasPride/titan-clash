// Dino kit (ours): a sail-backed, croc-snouted river dinosaur in the Spinosaurus style (a real animal, our own sculpt).
// Made for the "Dinosaur (2 legs, leaning)" body type; parts work on any skeleton.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const {V3} = K, G = 'Dino Kit', P = (geo, mat) => ({geo, mat}), PI = Math.PI;
  const body = (prof, seg = 26, sx = 1, sz = 1, nz = .035, nf = 2.4) => K.noise(K.lathe(prof.map(([r, y]) => [Math.max(.01, r), y]), seg).scale(sx, 1, sz), nz, nf);
  const lerpP = (prof, y) => { for (let i = 1; i < prof.length; i++) { const [r0, y0] = prof[i - 1], [r1, y1] = prof[i]; if (y <= y1) return r0 + (r1 - r0) * (y - y0) / Math.max(1e-6, y1 - y0); } return prof[prof.length - 1][0]; };
  const claw = (x, y, z, len, r, dir) => { const d = dir || V3(0, 1, 0), a = V3(x, y, z), b = a.clone().addScaledVector(d, len * .55).add(V3(0, 0, len * .05)), c = a.clone().addScaledVector(d, len).add(V3(0, -len * .3, 0)); return P(K.taper(K.bez(a, b, c), r, r * .07, 12, 8, .75), 'horn'); };
  // long croc snout (head bone keeps world axes: +Y up, face +Z)
  const SNOUT = [[.02, -.45], [.42, -.4], [.52, -.1], [.5, .3], [.38, .8], [.28, 1.3], [.24, 1.8], [.27, 2.15], [.3, 2.35], [.22, 2.55], [.02, 2.62]];
  return [
    {id: 'dn_head', group: G, sub: 'Head', name: 'Croc-snout dino head', tags: ['dinosaur', 'head', 'snout'], along: true, nofit: true, make: () => {
      const g = K.lathe(SNOUT, 28); g.rotateX(PI / 2); g.scale(1, .72, 1); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i); if (y < -.08) p.setY(i, -.08 + (y + .08) * .2); if (y > 0 && z < .6) p.setY(i, y * (1 + (.6 - z) * .45)); }
      g.translate(0, .3, 0); K.noise(g, .025, 3.5); const out = [P(g, 'scale')];
      out.push(P(K.noise(new T.SphereGeometry(.22, 14, 10).scale(.7, 1.2, 1.6).translate(0, .62, .55), .02, 4), 'scale'));          // little crest on the nose
      for (const s of [-1, 1]) {
        out.push(P(new T.SphereGeometry(.075, 12, 10).scale(1.2, .8, 1).translate(s * .33, .55, -.02), 'eye'));
        out.push(P(K.taper(K.bez(V3(s * .2, .66, .2), V3(s * .38, .7, -.02), V3(s * .4, .6, -.25)), .07, .03, 10, 6), 'scale'));      // brow
        for (let i = 0; i < 11; i++) { const z = .35 + i * .2, R = lerpP(SNOUT, z) * .9, h = i > 8 ? .22 : .15, t = new T.ConeGeometry(.04, h, 6); t.rotateX(PI); t.translate(s * R, .22 - h / 2 - .02, z); out.push(P(t, 'tooth')); } }
      return out; }},
    {id: 'dn_jaw', group: G, sub: 'Head', name: 'Croc-snout dino jaw', tags: ['dinosaur', 'jaw', 'teeth'], along: true, nofit: true, make: () => {
      const prof = [[.02, -.4], [.38, -.35], [.42, .2], [.3, .9], [.22, 1.6], [.24, 2.1], [.2, 2.3], [.02, 2.38]];
      const g = K.lathe(prof, 22); g.rotateX(PI / 2); g.scale(.95, .42, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setY(i, 0);
      g.computeVertexNormals(); g.translate(0, -.03, .05); K.noise(g, .02, 4); const out = [P(g, 'scale')];
      for (const s of [-1, 1]) for (let i = 0; i < 10; i++) { const z = .35 + i * .19, R = lerpP(prof, z - .05) * .85, t = new T.ConeGeometry(.035, .13 + (i > 7 ? .06 : 0), 6); t.translate(s * R, .05, z); out.push(P(t, 'tooth')); }
      return out; }},
    {id: 'dn_neck', group: G, sub: 'Body', name: 'Dino neck', tags: ['dinosaur', 'neck'], along: true, nofit: true, make: () => [P(body([[.8, -.4], [.78, .3], [.65, 1.0], [.55, 1.6], [.5, 1.9]], 22, .85, 1), 'scale')]},
    {id: 'dn_body', group: G, sub: 'Body', name: 'Dino body (hips to chest)', tags: ['dinosaur', 'torso', 'belly'], along: true, nofit: true, make: () =>
      [P(body([[.05, -1.3], [.9, -1.1], [1.3, -.4], [1.45, .7], [1.5, 1.9], [1.38, 2.9], [1.1, 3.7], [.8, 4.3], [.05, 4.45]], 30, .78, 1.08, .04), 'scale')]},
    {id: 'dn_sail', group: G, sub: 'Back', name: 'Back sail', tags: ['dinosaur', 'sail', 'back', 'fin'], make: () => {
      // +Y = out of the back, the sail runs along local Z
      const L = 2.4, Hm = 3.4, h = z => { const t = (z + L) / (2 * L); return Hm * Math.pow(Math.sin(t * PI), .8) * (1 - .25 * Math.abs(t - .42)) * (.9 + .1 * Math.sin(t * PI * 2)); };
      const pts = []; for (let i = 0; i <= 40; i++) { const z = -L + 2 * L * i / 40; pts.push([z, h(z)]); } for (let i = 40; i >= 0; i--) pts.push([-L + 2 * L * i / 40, -.1]);
      const sail = K.extr(pts, .05, .02); sail.rotateY(-PI / 2); const pos = sail.attributes.position;
      for (let i = 0; i < pos.count; i++) { const y = pos.getY(i), z = pos.getZ(i); pos.setX(i, pos.getX(i) + Math.sin(z * 3.2) * .06 * Math.min(1, y / 1.5)); } sail.computeVertexNormals();
      const out = [P(sail, 'membrane')];
      for (let i = 0; i < 13; i++) { const z = -L * .95 + i * (L * 1.9 / 12), top = h(z) * 1.04; if (top < .2) continue;
        out.push(P(K.taper(K.bez(V3(0, -.1, z), V3(Math.sin(z * 3.2) * .05, top * .55, z - .04), V3(0, top, z - .1)), .07, .02, 14, 6), 'bone')); }
      return out; }},
    {id: 'dn_thigh', group: G, sub: 'Legs', name: 'Big dino thigh', tags: ['dinosaur', 'leg', 'thigh'], make: () => [P(body([[.05, -.5], [.85, -.35], [1.05, .3], [.95, 1.1], [.7, 1.7], [.5, 2.05], [.05, 2.15]], 24, .85, 1.05, .04), 'scale')]},
    {id: 'dn_shin', group: G, sub: 'Legs', name: 'Dino shin', tags: ['dinosaur', 'leg', 'shin'], make: () => [P(body([[.05, -.3], [.52, -.2], [.55, .5], [.42, 1.3], [.34, 1.9], [.36, 2.15], [.05, 2.25]], 20, .9, 1, .03), 'scale')]},
    {id: 'dn_foot', group: G, sub: 'Legs', name: 'Three-toed dino foot', tags: ['dinosaur', 'foot', 'claws'], nofit: true, make: () => {
      const out = [P(K.taper(K.bez(V3(0, 0, 0), V3(0, .8, .05), V3(0, 1.5, .1)), .34, .3, 14, 12), 'scale'), P(K.noise(new T.SphereGeometry(.38, 14, 10).translate(0, 1.55, .1), .02, 4), 'scale')];
      const fwd = V3(0, .68, .73).normalize();                                   // along the ground, forward, in this bone's space
      for (const [x, len] of [[-.3, .9], [0, 1.15], [.3, .9]]) { const a = V3(x * .6, 1.55, .1), d = fwd.clone().add(V3(x * .9, 0, 0)).normalize(), b = a.clone().addScaledVector(d, len);
        out.push(P(K.taper(K.bez(a, a.clone().lerp(b, .5), b), .17, .1, 10, 8), 'scale'), claw(b.x, b.y, b.z, .32, .08, d)); }
      out.push(P(K.taper(K.bez(V3(0, 1.2, -.2), V3(0, 1.0, -.45), V3(0, .85, -.6)), .09, .02, 8, 6), 'horn'));    // dewclaw
      return out; }},
    {id: 'dn_upperarm', group: G, sub: 'Arms', name: 'Dino upper arm', tags: ['dinosaur', 'arm'], make: () => [P(body([[.05, -.2], [.32, -.1], [.34, .4], [.27, .9], [.24, 1.1], [.05, 1.15]], 16, 1, 1, .02), 'scale')]},
    {id: 'dn_forearm', group: G, sub: 'Arms', name: 'Dino forearm', tags: ['dinosaur', 'arm'], make: () => [P(body([[.05, -.15], [.27, -.05], [.27, .4], [.22, .8], [.05, .9]], 16, 1, 1, .02), 'scale')]},
    {id: 'dn_hand', group: G, sub: 'Arms', name: 'Hook-thumb dino hand', tags: ['dinosaur', 'hand', 'claws'], nofit: true, make: () => {
      const out = [P(K.noise(new T.SphereGeometry(.26, 14, 10).scale(1, 1.2, .7).translate(0, .2, 0), .02, 4), 'scale')];
      for (let i = 0; i < 3; i++) { const x = (i - 1) * .14, a = V3(x, .35, 0), b = V3(x * 1.1, .7, .12); out.push(P(K.taper(K.bez(a, a.clone().lerp(b, .5), b), .08, .06, 8, 8), 'scale'), claw(b.x, b.y, b.z, .22, .05, V3(0, .6, .8).normalize())); }
      out.push(claw(.22, .3, .15, .45, .09, V3(.2, .5, .85).normalize()));     // the big hook thumb claw
      return out; }},
    {id: 'dn_tail', group: G, sub: 'Tail', name: 'Dino tail segment', tags: ['dinosaur', 'tail'], along: true, nofit: true, make: () =>
      [P(body([[.9, -.15], [1.0, .05], [.95, .55], [.86, 1.0], [.8, 1.12], [.05, 1.16]], 22, .8, 1.05, .03), 'scale')]},
    {id: 'dn_tail_fin', group: G, sub: 'Tail', name: 'Paddle tail fin', tags: ['dinosaur', 'tail', 'fin', 'swim'], make: () => {
      const L = 1.4, pts = []; for (let i = 0; i <= 24; i++) { const z = -L + 2 * L * i / 24; pts.push([z, 1.1 * Math.sin((z + L) / (2 * L) * PI)]); } pts.push([L, -.1], [-L, -.1]);
      const f = K.extr(pts, .05, .02); f.rotateY(-PI / 2); return [P(f, 'membrane')]; }},
  ];
});
