// Turtle monster kit (original design, ours): a hulking mutant snapping-turtle brute — spiked keel shell,
// hooked beak, armored belly plate, big claws. Genre-inspired (giant mutant turtle bruisers), not a copy of any character.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const {V3} = K, G = 'Turtle Kit', P = (geo, mat) => ({geo, mat}), PI = Math.PI;
  const body = (prof, seg = 26, sx = 1, sz = 1, nz = .04, nf = 2.4) => K.noise(K.lathe(prof.map(([r, y]) => [Math.max(.01, r), y]), seg).scale(sx, 1, sz), nz, nf);
  const spike = (x, y, z, h, r, rx = 0, rz = 0, mat = 'horn') => P(K.at(K.taper(K.bez(V3(0, 0, 0), V3(0, h * .6, -h * .05), V3(0, h, -h * .25)), r, r * .06, 10, 7), x, y, z, rx, 0, rz), mat);
  const claw = (x, y, z, len, r, rx = 0, rz = 0) => P(K.at(K.taper(K.bez(V3(0, 0, 0), V3(0, len * .55, len * .1), V3(0, len, len * .5)), r, r * .07, 10, 8, .8), x, y, z, rx, 0, rz), 'horn');

  // carapace: +Y = out of the back, length runs along local Z (toward the head when put on the back with Turn -90)
  function shell(W = 2.3, H = 1.35, L = 3.1, keels = true, mat = 'mossy') {
    const dome = new T.SphereGeometry(1, 40, 20, 0, PI * 2, 0, PI / 2).scale(W, H, L), p = dome.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) / W, z = p.getZ(i) / L, y = p.getY(i);            // scute grooves: a hex-ish grid pressed into the dome
      const gx = Math.abs(Math.sin(x * 4.2)), gz = Math.abs(Math.sin(z * 5.4 + (Math.floor(x * 1.35 + 2) % 2) * 1.2)), groove = Math.min(gx, gz) < .14 ? -.06 : 0;
      p.setY(i, y + groove * (y > .05 ? 1 : 0)); }
    dome.computeVertexNormals(); K.noise(dome, .035, 2);
    const rim = new T.TorusGeometry(1, .16, 8, 48).rotateX(PI / 2).scale(W * 1.02, 1, L * 1.02).translate(0, .02, 0);
    const out = [P(dome, mat), P(rim, 'oldbone')];
    for (let i = 0; i < 18; i++) { const a = i / 18 * PI * 2, x = Math.cos(a) * W * 1.06, z = Math.sin(a) * L * 1.06;      // saw-tooth rim
      const t = new T.ConeGeometry(.2, .75, 5).rotateZ(-PI / 2).rotateY(-a).translate(x + Math.cos(a) * .2, .02, z + Math.sin(a) * .2); out.push(P(t, 'oldbone')); }
    if (keels) for (const kx of [-.55, 0, .55]) for (let i = 0; i < 5; i++) { const z = (i - 2) * L * .34, ux = kx * W, s = 1 - Math.abs(i - 2) * .15 - Math.abs(kx) * .35;  // 3 spiked keels
      const yy = H * Math.sqrt(Math.max(0, 1 - (ux / W) ** 2 - (z / L) ** 2)) - .05; out.push(spike(ux, yy, z, .75 * s, .2 * s, -.35, kx * -.6)); }
    return out;
  }
  return [
    {id: 'tt_shell', group: G, sub: 'Shell', name: 'Spiked keel shell', tags: ['turtle', 'shell', 'armor', 'back', 'spikes'], make: () => shell()},
    {id: 'tt_shell_smooth', group: G, sub: 'Shell', name: 'Smooth dome shell', tags: ['turtle', 'shell', 'armor', 'back'], make: () => shell(2.2, 1.5, 2.8, false, 'plates')},
    {id: 'tt_shell_ancient', group: G, sub: 'Shell', name: 'Ancient stone shell', tags: ['turtle', 'shell', 'rock', 'back'], make: () => shell(2.5, 1.7, 3.3, true, 'stone')},
    {id: 'tt_plastron', group: G, sub: 'Shell', name: 'Belly plate', tags: ['turtle', 'belly', 'armor'], make: () => {
      const g = new T.SphereGeometry(1, 28, 12, 0, PI * 2, 0, PI / 2).scale(1.55, .35, 2.4); K.noise(g, .02, 3); const out = [P(g, 'oldbone')];
      for (let i = -2; i <= 2; i++) out.push(P(new T.BoxGeometry(2.6 - Math.abs(i) * .45, .06, .07).translate(0, .33 - Math.abs(i) * .04, i * .82), 'darkwood'));
      out.push(P(new T.BoxGeometry(.07, .06, 4.2).translate(0, .34, 0), 'darkwood'));
      return out; }},
    {id: 'tt_head', group: G, sub: 'Head', name: 'Snapper beak head', tags: ['turtle', 'head', 'beak'], along: true, nofit: true, make: () => {
      const prof = [[.02, -.5], [.55, -.45], [.72, -.15], [.74, .35], [.66, .85], [.52, 1.25], [.3, 1.5], [.02, 1.55]];
      const g = K.lathe(prof, 28); g.rotateX(PI / 2); g.scale(1, .75, 1); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) if (p.getY(i) < -.15) p.setY(i, -.15 + (p.getY(i) + .15) * .25);
      g.translate(0, .4, 0); g.computeVertexNormals(); K.noise(g, .045, 3.2);
      const beak = K.taper(K.bez(V3(0, .6, 1.05), V3(0, .62, 1.55), V3(0, .1, 1.78)), .5, .07, 16, 12, .8), out = [P(g, 'scale'), P(beak, 'oldbone')];
      for (const s of [-1, 1]) { out.push(P(new T.SphereGeometry(.11, 14, 10).translate(s * .5, .72, .95), 'eye'));
        out.push(P(K.taper(K.bez(V3(s * .3, .9, 1.25), V3(s * .62, .95, .95), V3(s * .7, .82, .55)), .1, .04, 12, 7), 'scale'));
        for (let i = 0; i < 4; i++) out.push(P(new T.SphereGeometry(.09 + i * .02, 8, 6).translate(s * (.5 + i * .05), .25 + i * .12, -.1 - i * .12), 'horn')); }   // cheek knobs
      return out; }},
    {id: 'tt_jaw', group: G, sub: 'Head', name: 'Snapper beak jaw', tags: ['turtle', 'jaw', 'beak'], along: true, nofit: true, make: () => {
      const prof = [[.02, -.45], [.55, -.4], [.62, .2], [.48, .85], [.3, 1.25], [.02, 1.35]];
      const g = K.lathe(prof, 24); g.rotateX(PI / 2); g.scale(.95, .45, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setY(i, 0);
      g.computeVertexNormals(); g.translate(0, -.08, 0); K.noise(g, .03, 3);
      const beak = K.taper(K.bez(V3(0, -.1, .9), V3(0, -.15, 1.25), V3(0, .12, 1.45)), .36, .05, 14, 10, .8);
      return [P(g, 'scale'), P(beak, 'oldbone')]; }},
    {id: 'tt_neck', group: G, sub: 'Body', name: 'Wrinkled turtle neck', tags: ['turtle', 'neck'], along: true, nofit: true, make: () => {
      const out = [P(body([[.95, -.4], [.88, .2], [.8, .7], [.72, 1.2]], 24, 1, .9, .05, 3), 'scale')];
      for (let i = 0; i < 4; i++) out.push(P(new T.TorusGeometry(.86 - i * .05, .07, 6, 24).rotateX(PI / 2).scale(1, 1, .9).translate(0, -.1 + i * .32, 0), 'scale'));
      return out; }},
    {id: 'tt_torso', group: G, sub: 'Body', name: 'Brute turtle torso', tags: ['turtle', 'torso'], along: true, nofit: true, make: () =>
      [P(body([[.6, -1.4], [1.5, -1.1], [1.75, -.2], [1.8, .9], [1.7, 1.9], [1.5, 2.7], [1.0, 3.2], [.05, 3.3]], 30, 1, .85, .05), 'scale')]},
    {id: 'tt_limb', group: G, sub: 'Arms & Legs', name: 'Thick scaly limb', tags: ['turtle', 'arm', 'leg'], make: () => {
      const out = [P(body([[.05, -.35], [.62, -.25], [.7, .4], [.6, 1.2], [.52, 1.6], [.05, 1.7]], 22, 1, 1, .05, 3), 'scale')];
      for (let i = 0; i < 3; i++) out.push(spike(0, .35 + i * .42, -.55, .3, .09, -1.3));   // little spikes down the back of the limb
      return out; }},
    {id: 'tt_hand', group: G, sub: 'Arms & Legs', name: 'Three-claw turtle hand', tags: ['turtle', 'hand', 'claws'], nofit: true, make: () => {
      const out = [P(K.noise(new T.SphereGeometry(.48, 16, 12).scale(1.1, 1, .7).translate(0, .32, 0), .03, 3), 'scale')];
      for (let i = 0; i < 3; i++) { const x = (i - 1) * .28; out.push(P(K.taper(K.bez(V3(x, .55, 0), V3(x * 1.1, .85, .08), V3(x * 1.15, 1.02, .3)), .15, .1, 10, 8), 'scale'), claw(x * 1.15, 1.0, .3, .4, .1, .8)); }
      out.push(P(K.taper(K.bez(V3(.42, .3, .2), V3(.55, .5, .45), V3(.5, .6, .65)), .14, .08, 10, 8), 'scale'), claw(.5, .58, .65, .3, .08, 1.1));
      return out; }},
    {id: 'tt_foot', group: G, sub: 'Arms & Legs', name: 'Clawed turtle foot', tags: ['turtle', 'foot', 'claws'], nofit: true, make: () => {
      const out = [P(K.noise(new T.SphereGeometry(.7, 20, 12).scale(1.05, 1.15, .55).translate(0, .5, -.05), .04, 2.5), 'scale')];
      for (const x of [-.42, 0, .42]) out.push(P(K.taper(K.bez(V3(x * .8, .85, -.1), V3(x, 1.2, -.15), V3(x * 1.1, 1.45, -.28)), .22, .15, 10, 8), 'scale'), claw(x * 1.1, 1.43, -.28, .35, .1, -.5));
      return out; }},
    {id: 'tt_tail', group: G, sub: 'Body', name: 'Saw-tooth stub tail', tags: ['turtle', 'tail', 'spikes'], make: () => {
      const out = [P(body([[.55, 0], [.5, .5], [.36, 1.1], [.18, 1.6], [.03, 1.9]], 18, 1, .9, .04), 'scale')];
      for (let i = 0; i < 4; i++) out.push(spike(0, .25 + i * .38, -.45 + i * .09, .32 - i * .05, .1 - i * .015, -1.2));
      return out; }},
    {id: 'tt_spikes', group: G, sub: 'Spikes', name: 'Spike row (clip anywhere)', tags: ['turtle', 'spikes'], make: () => [0, 1, 2].map(i => spike(0, 0, (i - 1) * .45, .5 - Math.abs(i - 1) * .12, .14))},
  ];
});
