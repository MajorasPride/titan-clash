// Mecha dragon parts (original design, ours): chrome segmented armor, blue orb gems, blade-feather wings, sharp crests.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const {V3, D} = K, G = 'Mecha Dragon';
  const P = (geo, mat) => ({geo, mat});
  // ---- building blocks ----
  function orb(r = .25, x = 0, y = 0, z = 0, face = 'z') {        // glowing gem in a chrome bezel, facing +Z (or +Y)
    const gem = new T.SphereGeometry(r, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), bez = new T.TorusGeometry(r * 1.08, r * .22, 10, 28), back = new T.CylinderGeometry(r * 1.2, r * 1.3, r * .35, 28).rotateX(Math.PI / 2).translate(0, 0, -r * .18);
    const out = [P(gem, 'gemblue'), P(bez, 'chrome'), P(back, 'darkchrome')];
    out.forEach(p => { if (face === 'y') p.geo.rotateX(-Math.PI / 2); p.geo.translate(x, y, z); }); return out;
  }
  function blade(L, w, t = .07, curl = 0) {                         // sharp feather / fin blade along +Y
    const g = K.extr([[0, 0], [w * .55, L * .12], [w * .6, L * .7], [w * .1, L], [-w * .25, L * .78], [-w * .4, L * .1]], t, t * .4);
    if (curl) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) / L; p.setZ(i, p.getZ(i) + curl * y * y); } g.computeVertexNormals(); } return g;
  }
  function segChain(curve, n, r0, r1, opt = {}) {                   // armored segments along a curve (necks, tails)
    const out = [], up = V3(0, 1, 0);
    for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + .92) / n, a = curve.getPointAt(t0), b = curve.getPointAt(t1), L = a.distanceTo(b), r = r0 + (r1 - r0) * (i / Math.max(1, n - 1));
      const q = new T.Quaternion().setFromUnitVectors(up, b.clone().sub(a).normalize());
      const shell = K.lathe([[r * .78, 0], [r * 1.02, L * .12], [r * 1.06, L * .55], [r * .96, L * .9], [r * .82, L * 1.02], [r * .7, L * 1.02]], 20);
      const lip = new T.TorusGeometry(r * 1.03, r * .07, 6, 24).rotateX(Math.PI / 2).translate(0, L * .12, 0);
      const core = new T.CylinderGeometry(r * .66, r * .66, L * 1.15, 14).translate(0, L * .5, 0);
      for (const [g, m] of [[shell, 'chrome'], [lip, 'bluechrome'], [core, 'darkchrome']]) { g.applyQuaternion(q); g.translate(a.x, a.y, a.z); out.push(P(g, m)); }
      if (opt.fins) { const f = blade(r * 1.4, r * 1.2, .05).rotateX(-Math.PI / 2 + .5).translate(0, L * .45, r * .9); f.applyQuaternion(q); f.translate(a.x, a.y, a.z); out.push(P(f, 'chrome')); }
      if (opt.orbs && i % opt.orbs === 0) for (const p of orb(r * .32, 0, L * .5, r * 1.02)) { p.geo.applyQuaternion(q); p.geo.translate(a.x, a.y, a.z); out.push(p); } }
    return out;
  }
  const shellLimb = (L, r0, r1, bulge = .15) => K.lathe([...Array(11).keys()].map(i => { const t = i / 10; return [Math.max(.02, (r0 + (r1 - r0) * t) * (1 + Math.sin(t * Math.PI) * bulge)), t * L]; }), 22);
  function talons(n, len, r, spread, curl = .8, z0 = 0) { const out = []; for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * spread;
      const g = K.taper(K.bez(V3(0, 0, 0), V3(0, len * .25, len * .45), V3(0, -len * curl * .5, len)), r, .01, 16, 8, .65); g.rotateY(a); g.translate(Math.sin(a) * r * 1.6, 0, z0 + Math.cos(a) * r); out.push(P(g, 'chrome')); } return out; }
  const taper = (g, k) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); p.setX(i, p.getX(i) * (1 - k * Math.max(0, Math.min(1, z / 2.4)))); } g.computeVertexNormals(); return g; };
  // ---- parts ----
  return [
    {id: 'md_head', group: G, sub: 'Head', name: 'Mecha dragon helm', tags: ['dragon', 'mech', 'head', 'chrome'], make: () => {
      const skull = taper(K.extr([[-.6, .25], [-.5, 1.05], [.2, 1.3], [1.2, 1.02], [2.2, .7], [2.55, .5], [2.35, .38], [1.2, .42], [.2, .3]], 1.15, .14, 3).rotateY(-Math.PI / 2), .6);
      const out = [P(skull, 'chrome'), P(taper(K.extr([[-.3, .9], [.4, 1.38], [1.4, 1.1], [2.1, .78], [1.3, .98], [.3, 1.18]], .5, .05).rotateY(-Math.PI / 2), .5), 'bluechrome')];
      out.push(P(K.taper(K.bez(V3(0, 1.2, -.2), V3(0, 2.1, -.6), V3(0, 2.6, -2.1)), .26, .01, 24, 10, .35), 'chrome'));                          // swept crest horn
      for (const s of [1, -1]) { const fin = blade(2, .55, .06).rotateX(-1.25).rotateZ(s * .5).translate(s * .55, .85, -.1); out.push(P(s > 0 ? fin : K.mirrorX(blade(2, .55, .06).rotateX(-1.25).rotateZ(.5)).translate(-.55, .85, -.1), 'chrome'));
        out.push(P(new T.BoxGeometry(.32, .07, .1).rotateY(s * .35).rotateZ(s * -.25).translate(s * .36, .98, 1.18), 'glowblue'));               // eye slits
        out.push(P(blade(.9, .3, .05).rotateX(-1.4).rotateZ(s * .9).translate(s * .5, .55, .6), 'bluechrome')); }                                   // cheek blades
      out.push(...orb(.2, 0, 1.24, .45, 'y').map(p => (p.geo.rotateX(-.35), p)));
      out.push(P(K.extr([[0, 0], [1.6, .35], [2.3, .2], [1.7, -.1], [.2, -.25]], .14, .06).rotateX(-Math.PI / 2).rotateY(-.25).translate(.35, 1.15, -.35), 'chrome'));     // hammerhead side crests
      out.push(P(K.mirrorX(K.extr([[0, 0], [1.6, .35], [2.3, .2], [1.7, -.1], [.2, -.25]], .14, .06).rotateX(-Math.PI / 2).rotateY(-.25)).translate(-.35, 1.15, -.35), 'chrome'));
      out.push(P(K.extr([[0, 0], [1.7, .02], [1.6, .16]], .7, .02).rotateY(-Math.PI / 2).translate(0, .26, .5), 'glow'));                          // fire in the mouth
      for (let i = 0; i < 5; i++) for (const s of [1, -1]) out.push(P(new T.ConeGeometry(.05, .2, 6).rotateX(Math.PI).translate(s * (.42 - i * .06), .28, .7 + i * .35), 'chrome'));
      return out; }},
    {id: 'md_jaw', group: G, sub: 'Head', name: 'Mecha dragon jaw', tags: ['dragon', 'jaw'], make: () => {
      const j = taper(K.extr([[-.3, .05], [2.15, -.05], [2.3, .12], [1.2, .22], [0, .28]], .95, .08).rotateY(-Math.PI / 2), .6), out = [P(j, 'chrome')];
      for (let i = 0; i < 5; i++) for (const s of [1, -1]) out.push(P(new T.ConeGeometry(.05, .2, 6).translate(s * (.38 - i * .055), .36, .5 + i * .33), 'chrome'));
      out.push(P(K.extr([[0, .2], [1.8, .15], [1.7, .26]], .6, .02).rotateY(-Math.PI / 2), 'glow')); return out; }},
    {id: 'md_neck', group: G, sub: 'Neck & Tail', name: 'Segmented chrome neck', tags: ['dragon', 'neck'], make: () => segChain(K.bez(V3(0, 0, 0), V3(0, 1.6, .2), V3(0, 3.4, .9)), 7, .72, .55, {fins: true, orbs: 3})},
    {id: 'md_tail', group: G, sub: 'Neck & Tail', name: 'Segmented chrome tail', tags: ['dragon', 'tail'], make: () => {
      const c = K.bez(V3(0, 0, 0), V3(0, 3, .4), V3(0, 6, -.6), V3(0, 8.2, .3)), out = segChain(c, 12, .78, .22, {fins: true, orbs: 4}), tip = c.getPointAt(1);
      out.push(P(K.extr([[0, 0], [.55, .5], [.25, 1.8], [0, 2.3], [-.25, 1.8], [-.55, .5]], .1, .05).translate(tip.x, tip.y - .1, tip.z), 'bluechrome')); return out; }},
    {id: 'md_wing', group: G, sub: 'Wings', name: 'Orb-shield mech wing', tags: ['dragon', 'wing', 'mech', 'orb'], make: () => {
      const out = [P(K.extr([[-.2, 0], [.25, .1], [.3, 2.4], [.1, 3.4], [-.15, 3.3], [-.22, 2.3]], .34, .1), 'chrome'), P(new T.CylinderGeometry(.16, .16, 2.6, 12).translate(.05, 1.4, -.28), 'darkchrome')];
      const cx = .9, cy = 3.6;                                                                  // round shield plate with the big orb
      const disc = new T.SphereGeometry(1.7, 40, 20, 0, Math.PI * 2, 0, .55).scale(1, 1.35, 1).rotateX(Math.PI / 2).translate(cx, cy, -1.55); out.push(P(disc, 'chrome'));
      out.push(P(new T.TorusGeometry(.92, .07, 8, 40).scale(1, 1.3, 1).translate(cx, cy, .2), 'bluechrome'), ...orb(.45, cx, cy, .3));
      const L = [5.4, 5.6, 5.2, 4.6, 3.8, 3.0]; L.forEach((len, i) => { const a = (8 + i * 19) * D, f = blade(len, .85, .08, -.2).translate(0, .9, 0).rotateZ(-a).translate(cx, cy, -.12 - i * .03);
        out.push(P(f, i % 2 ? 'paint' : 'chrome'), P(blade(len * .65, .25, .03).translate(.05, 1.2, 0).rotateZ(-a).translate(cx, cy, -.02 - i * .03), 'bluechrome')); });
      out.push(P(K.extr([[0, 0], [.3, .3], [.2, 4.2], [0, 4.8], [-.15, 4]], .2, .06).rotateZ(.15).translate(-.1, 3.4, -.1), 'chrome'), ...orb(.24, .05, .4, .2));
      return out; }},
    {id: 'md_wing_blade', group: G, sub: 'Wings', name: 'Blade-feather mech wing', tags: ['dragon', 'wing', 'mech'], make: () => {
      const out = [P(K.extr([[-.18, 0], [.22, .1], [.32, 3.4], [.12, 7.2], [-.12, 7.0], [-.2, 3.3]], .32, .1), 'chrome'), P(K.extr([[0, .3], [.12, 3.2], [.05, 6.6], [-.06, 3.2]], .38, .02), 'bluechrome')];
      const L = [5.6, 5.2, 4.6, 4, 3.3, 2.6]; L.forEach((len, i) => { const y = 1.6 + i * 1.0, a = (28 + i * 17) * D; const f = blade(len, .8 - i * .05, .07, -.25).rotateZ(-a).translate(.1, y, -.04 * i); out.push(P(f, i % 2 ? 'chrome' : 'paint'));
        out.push(P(blade(len * .7, .25, .03).rotateZ(-a).translate(.12, y + .1, .06 - .04 * i), 'bluechrome')); });
      out.push(...orb(.34, .05, .7, .2), ...orb(.3, .05, 3.6, .2), ...orb(.24, .05, 6.2, .2)); return out; }},
    {id: 'md_chest', group: G, sub: 'Body', name: 'Orb-core chest', tags: ['dragon', 'torso', 'mech'], make: () => {
      const shell = K.lathe([[.9, 0], [1.4, .4], [1.65, 1.5], [1.55, 2.6], [1.1, 3.2], [.7, 3.4]], 32).scale(1, 1, .82), out = [P(shell, 'chrome')];
      for (let i = 0; i < 4; i++) out.push(P(new T.TorusGeometry(1.45 - Math.abs(i - 1.5) * .12, .06, 8, 40).rotateX(Math.PI / 2).scale(1, 1, .82).translate(0, .7 + i * .65, 0), 'bluechrome'));
      out.push(...orb(.62, 0, 1.6, 1.36)); for (const s of [1, -1]) out.push(...orb(.22, s * 1.05, 2.5, .95));
      out.push(P(K.extr([[-1, 0], [1, 0], [.6, .5], [0, .9], [-.6, .5]], .2, .06).rotateX(-.3).translate(0, 2.5, 1.05), 'chrome')); return out; }},
    {id: 'md_belly', group: G, sub: 'Body', name: 'Armored hips', tags: ['dragon', 'hips'], make: () => [P(K.lathe([[.7, 0], [1.3, .3], [1.4, 1.2], [1.1, 1.9], [.6, 2.1]], 28).scale(1, 1, .85), 'chrome'),
      P(new T.TorusGeometry(1.36, .07, 8, 40).rotateX(Math.PI / 2).scale(1, 1, .85).translate(0, .9, 0), 'bluechrome'), ...orb(.35, 0, 1, 1.15)]},
    {id: 'md_leg', group: G, sub: 'Limbs', name: 'Dragon mech leg', tags: ['dragon', 'leg'], make: () => {
      const out = [P(shellLimb(2.6, .62, .42, .3), 'chrome'), P(new T.CylinderGeometry(.32, .32, 2.4, 14).translate(0, 3.8, 0), 'darkchrome'), P(shellLimb(2.2, .48, .32, .1).translate(0, 2.7, 0), 'chrome')];
      out.push(P(K.extr([[-.4, 0], [.4, 0], [.25, 1.3], [0, 1.7], [-.25, 1.3]], .14, .05).rotateX(.25).translate(0, 2.7, .46), 'bluechrome'), ...orb(.3, 0, 2.6, .62));
      out.push(P(new T.SphereGeometry(.42, 20, 14).scale(1, .8, 1.3).translate(0, 4.95, .2), 'chrome'), ...talons(3, 1.1, .16, .45, .6, .3).map(p => (p.geo.translate(0, 5.1, .2), p)), ...talons(1, .6, .12, 0, .6, 0).map(p => (p.geo.rotateY(Math.PI).translate(0, 5.1, -.2), p)));
      return out; }},
    {id: 'md_arm', group: G, sub: 'Limbs', name: 'Dragon mech arm + claw', tags: ['dragon', 'arm'], make: () => {
      const out = [P(shellLimb(2.1, .55, .4, .2), 'chrome'), P(shellLimb(1.9, .4, .3, .1).translate(0, 2.2, 0), 'chrome'), ...orb(.24, 0, 2.15, .48),
        P(blade(1.6, .4, .06).rotateX(.15).translate(0, 2.4, -.32), 'bluechrome'), P(new T.SphereGeometry(.34, 16, 12).scale(1.2, .8, 1).translate(0, 4.2, 0), 'chrome')];
      for (let i = 0; i < 4; i++) { const a = (i - 1.5) * .35; const g = K.taper(K.bez(V3(0, 0, 0), V3(0, .5, .1), V3(0, .9, .55)), .1, .01, 14, 8, .6); g.rotateY(a).translate(Math.sin(a) * .25, 4.35, Math.cos(a) * .15); out.push(P(g, 'chrome')); } return out; }},
    {id: 'md_shoulder', group: G, sub: 'Body', name: 'Swept blade pauldron', tags: ['dragon', 'shoulder', 'mech'], make: () => [P(new T.SphereGeometry(.85, 28, 16, 0, Math.PI * 2, 0, Math.PI * .55).scale(1.1, .8, 1), 'chrome'),
      P(blade(2.2, .7, .08, -.3).rotateX(-1.2).translate(.2, .5, -.1), 'chrome'), P(blade(1.6, .45, .06, -.2).rotateX(-1.0).rotateZ(-.4).translate(.5, .35, -.1), 'bluechrome'), ...orb(.26, 0, .55, .5).map(p => (p.geo.rotateX(-.6), p))]},
    {id: 'md_orb', group: G, sub: 'Gems & Fins', name: 'Blue orb gem', tags: ['orb', 'gem', 'glow'], make: () => orb(.4, 0, .1, 0, 'y')},
    {id: 'md_orb_big', group: G, sub: 'Gems & Fins', name: 'Big core orb', tags: ['orb', 'gem', 'core'], make: () => [...orb(.9, 0, .2, 0, 'y'), P(new T.TorusGeometry(1.25, .08, 8, 40).rotateX(Math.PI / 2).translate(0, .15, 0), 'bluechrome')]},
    {id: 'md_dorsal', group: G, sub: 'Gems & Fins', name: 'Dorsal blade row', tags: ['fin', 'spine', 'blade'], make: () => [...Array(5).keys()].map(i => P(blade(1.6 - i * .2, .7 - i * .08, .07, -.2).rotateX(-.45).translate(0, 0, -i * .7), i % 2 ? 'bluechrome' : 'chrome'))},
    {id: 'md_finpair', group: G, sub: 'Gems & Fins', name: 'Twin swept fins', tags: ['fin', 'blade'], make: () => [P(blade(2, .6, .07, -.3).rotateZ(-.35), 'chrome'), P(K.mirrorX(blade(2, .6, .07, -.3).rotateZ(-.35)), 'chrome'), ...orb(.2, 0, .1, .2)]},
  ];
});
