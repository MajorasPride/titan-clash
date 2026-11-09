// Sphinx / beast-king parts (our own designs): great manes, lion paws, feathered wings, armored collar, belt, bracers.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const {V3, D} = K, P = (geo, mat) => ({geo, mat});
  let sd = 3; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  function lock(base, dir, len, r, curl) {                         // one tapered hair lock with a curl at the tip
    const b = V3(...base), d = V3(...dir).normalize(), side = V3(-d.z, 0, d.x).normalize().multiplyScalar(curl), down = V3(0, -len * .35, 0);
    return K.taper(K.bez(b, b.clone().add(d.clone().multiplyScalar(len * .5)), b.clone().add(d.clone().multiplyScalar(len)).add(side).add(down)), r, .02, 14, 7, .7);
  }
  function mane(rows, rad, len, thick, spread = 1) { sd = 7; const gs = [];
    for (let row = 0; row < rows; row++) { const n = 14 + row * 5, rr = rad + row * .25, y = 1.2 - row * .35;
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 * spread - Math.PI * spread + (row % 2) * .1, front = Math.cos(a);
        if (front > .92 && row < 2) continue;                       // keep the face clear
        const base = [Math.sin(a) * rr * .7, y + rnd() * .3, Math.cos(a) * rr * .55 - .2], dir = [Math.sin(a), -.15 - row * .25 + rnd() * .3, Math.cos(a) * .6 - .4];
        gs.push(lock(base, dir, len * (.75 + rnd() * .5) * (1 + row * .25), thick * (1 - row * .1), (rnd() - .5) * .8)); } }
    return K.merge(gs); }
  const paw = (s = 1) => { const out = [P(K.noise(new T.SphereGeometry(.7 * s, 28, 18).scale(1.1, .55, 1.3).translate(0, .35 * s, .2 * s), .02, 3), 'fur')];
    for (let i = 0; i < 4; i++) { const a = (i - 1.5) * .38; out.push(P(K.noise(new T.SphereGeometry(.24 * s, 16, 12).scale(1, .8, 1.2).translate(Math.sin(a) * .62 * s, .2 * s, .2 * s + Math.cos(a) * .7 * s), .01, 4), 'fur'));
      out.push(P(K.taper(K.bez(V3(0, 0, 0), V3(0, .1, .25 * s), V3(0, -.15 * s, .45 * s)), .07 * s, .005, 10, 6, .7).translate(Math.sin(a) * .66 * s, .22 * s, .2 * s + Math.cos(a) * .86 * s), 'horn')); } return out; };
  function featherWing(L = 7.5) { sd = 11; const out = [P(K.taper(K.bez(V3(0, 0, 0), V3(.4, L * .45, -.3), V3(1.6, L, -.6)), .28, .08, 30, 10), 'feather')];
    const feather = (len, w) => { const g = K.extr([[0, 0], [w * .5, len * .15], [w * .55, len * .75], [0, len], [-w * .35, len * .7], [-w * .3, len * .1]], .05, .02);
      const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) / len; p.setZ(i, p.getZ(i) - y * y * .5); } g.computeVertexNormals(); return g; };
    for (let row = 0; row < 3; row++) { const n = [14, 11, 8][row], fl = [3.4, 2.2, 1.3][row];
      for (let i = 0; i < n; i++) { const t = (i + .5) / n, y = t * L * .95, a = (100 - t * 75) * D, len = fl * (1.2 - t * .4) * (.9 + rnd() * .2);
        out.push(P(feather(len, .55 - row * .1).rotateZ(-a).translate(.1 + t * 1.4 - row * .15, y, -.05 - row * .06 + t * -.4), ['feather', 'feather', 'feather'][row])); } }
    return out; }
  return [
    {id: 'sx_mane_great', group: 'Heads & Skulls', sub: 'Manes & Hair', name: 'Great beast mane', tags: ['mane', 'lion', 'sphinx', 'hair'], make: () => [P(mane(4, 1.0, 1.4, .17), 'fur')]},
    {id: 'sx_mane_wild', group: 'Heads & Skulls', sub: 'Manes & Hair', name: 'Wild storm mane', tags: ['mane', 'hair', 'wild'], make: () => [P(K.noise(mane(5, 1.1, 1.9, .14), .03, 2), 'fur')]},
    {id: 'sx_mane_short', group: 'Heads & Skulls', sub: 'Manes & Hair', name: 'Short ruff mane', tags: ['mane', 'ruff'], make: () => [P(mane(2, .9, .9, .16), 'fur')]},
    {id: 'sx_beard', group: 'Eyes & Faces', sub: 'Face Pieces', name: 'Braided king beard', tags: ['beard', 'sphinx', 'hair'], make: () => { sd = 5; const gs = [];
      for (let i = 0; i < 9; i++) { const x = (i - 4) * .14; gs.push(K.taper(K.bez(V3(x, 0, 0), V3(x * 1.2, -.7, .15), V3(x * .4, -1.6 - Math.abs(4 - i) * -.08, .05)), .1, .03, 16, 7)); }
      return [P(K.merge(gs), 'fur'), P(new T.TorusGeometry(.18, .05, 8, 16).rotateX(Math.PI / 2).translate(0, -1.3, .05), 'gold')]; }},
    {id: 'sx_paw_front', group: 'Hands & Claws', sub: 'Paws', name: 'Big lion paw', tags: ['paw', 'lion', 'cat', 'sphinx'], make: () => paw(1)},
    {id: 'sx_paw_hand', group: 'Hands & Claws', sub: 'Paws', name: 'Beast-king clawed hand', tags: ['hand', 'claw', 'sphinx'], make: () => { const out = [P(K.noise(new T.SphereGeometry(.55, 24, 16).scale(1, 1.2, .6).translate(0, .55, 0), .02, 3), 'skin')];
      for (let i = 0; i < 5; i++) { const thumb = i === 4, x = thumb ? .5 : (i - 1.5) * .26, c = thumb ? K.bez(V3(x, .5, .1), V3(x + .35, .8, .3), V3(x + .4, 1.05, .55)) : K.bez(V3(x, 1.05, 0), V3(x * 1.1, 1.6, .2), V3(x * 1.1, 1.85, .6));
        out.push(P(K.taper(c, .13, .08, 14, 10), 'skin')); const tp = c.getPointAt(1); out.push(P(K.taper(K.bez(V3(0, 0, 0), V3(0, .15, .1), V3(0, .1, .38)), .07, .005, 10, 6, .7).translate(tp.x, tp.y, tp.z), 'horn')); }
      return out; }},
    {id: 'sx_wing_feather', group: 'Wings', sub: 'Feathered', name: 'Great sphinx wing', tags: ['wing', 'feather', 'sphinx', 'angel'], make: () => featherWing(7.5)},
    {id: 'sx_collar', group: 'Accessories & Magic', sub: 'Clothing', name: 'Pharaoh collar', tags: ['collar', 'sphinx', 'gold', 'armor'], make: () => { const out = [];
      for (let r = 0; r < 4; r++) out.push(P(new T.CylinderGeometry(1.25 + r * .32, 1.4 + r * .32, .22, 48, 1, true).translate(0, -r * .2, 0), r % 2 ? 'paint2' : 'gold'));
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; out.push(P(new T.SphereGeometry(.09, 10, 8).translate(Math.sin(a) * 2.45, -.62, Math.cos(a) * 2.45), 'gemblue')); }
      return out; }},
    {id: 'sx_belt', group: 'Accessories & Magic', sub: 'Clothing', name: 'Champion belt + loincloth', tags: ['belt', 'sphinx', 'gold'], make: () => [P(new T.CylinderGeometry(1.5, 1.55, .45, 48, 1, true), 'gold'),
      P(K.extr([[-.45, .3], [.45, .3], [.5, -.3], [0, -.45], [-.5, -.3]], .12, .05).translate(0, 0, 1.55), 'gold'), P(new T.SphereGeometry(.15, 16, 12).translate(0, 0, 1.68), 'gemred'),
      P(K.extr([[-.7, -.2], [.7, -.2], [.55, -2.4], [0, -2.6], [-.55, -2.4]], .06, .02).translate(0, 0, 1.5), 'cloth'), P(K.extr([[-.8, -.2], [.8, -.2], [.6, -2.1], [-.6, -2.1]], .06, .02).translate(0, 0, -1.5), 'cloth')]},
    {id: 'sx_bracer', group: 'Accessories & Magic', sub: 'Clothing', name: 'Gold arm bracer', tags: ['bracer', 'armor', 'gold'], make: () => [P(new T.CylinderGeometry(.62, .55, 1.4, 32, 1, true).translate(0, .7, 0), 'gold'),
      ...[.15, 1.25].map(y => P(new T.TorusGeometry(.6, .06, 8, 32).rotateX(Math.PI / 2).translate(0, y, 0), 'paint2')), P(new T.SphereGeometry(.14, 14, 10).translate(0, .7, .6), 'gemblue')]},
    {id: 'sx_shoulder_spike', group: 'Arms & Shoulders', sub: 'Shoulder Armor', name: 'Horned shoulder guard', tags: ['shoulder', 'spike', 'sphinx'], make: () => [P(new T.SphereGeometry(.9, 28, 14, 0, Math.PI * 2, 0, Math.PI * .5).scale(1.1, .7, 1), 'gold'),
      P(K.taper(K.bez(V3(.4, .4, 0), V3(1.2, .9, 0), V3(1.6, 1.8, -.3)), .22, .01, 18, 10), 'horn'), P(new T.TorusGeometry(.95, .06, 8, 32).rotateX(Math.PI / 2).scale(1.1, 1, 1), 'paint2')]},
  ];
});
