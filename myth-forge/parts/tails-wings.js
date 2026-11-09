// Tails + wings starter set (Nov 9 2026). Made in code for Mythic Forge (ours, no license).
// Tails grow along +Y from the hips, ~8 long. Wings grow along +Y from the shoulder blade, membrane toward +X.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const V = K.V3, TL = 'Tails', WG = 'Wings', src = 'Made in code for Mythic Forge (ours)';
  const spine = (bend = .6, len = 8) => K.cr([V(0, 0, 0), V(0, len * .3, -bend * .3), V(0, len * .62, -bend), V(0, len, -bend * .4)]);
  const tailTube = (c, r0, r1, flat = 1) => K.noise(K.taper(c, t => r1 + (r0 - r1) * Math.pow(1 - t, 1.3), 0, 48, 16, flat), .03, 2.5);
  const along = (c, n, fn, from = .05, to = .95) => [...Array(n).keys()].map(i => { const t = from + (to - from) * i / Math.max(1, n - 1), p = c.getPointAt(t), tg = c.getTangentAt(t); return fn(p, tg, t, i); });
  const placeOn = (g, p, tg, s, tilt = 0) => { const q = new T.Quaternion().setFromUnitVectors(V(0, 1, 0), tg), m = new T.Matrix4().compose(p, q, V(s, s, s));
    g.applyMatrix4(new T.Matrix4().makeRotationX(tilt)); return g.applyMatrix4(m); };
  const spike = (h, r) => { const g = new T.ConeGeometry(r, h, 10, 2); g.translate(0, h / 2, 0); return g; };
  const plate = () => K.extr([[0, 0], [.35, .15], [.5, .7], [0, 1.2], [-.5, .7], [-.35, .15]], .08, .03);
  return [
    {id: 'tw_tail_reptile', group: TL, sub: 'Reptile', name: 'Thick reptile tail', tags: ['tail', 'kaiju', 'lizard'], src,
      make: () => { const c = spine(.8); return [{geo: tailTube(c, .95, .08, .9), mat: 'scale'}]; }},
    {id: 'tw_tail_spiked', group: TL, sub: 'Spiked', name: 'Spiked kaiju tail', tags: ['tail', 'spikes', 'kaiju'], src,
      make: () => { const c = spine(.9); return [{geo: tailTube(c, 1, .08, .9), mat: 'scale'},
        {geo: K.merge(along(c, 9, (p, tg, t) => { const g = spike(.9 * (1 - t * .75), .22 * (1 - t * .6)); g.rotateX(-.35); g.translate(0, 0, 0); const top = p.clone(); top.z -= (1 - t) * .75 + .08; return placeOn(g, top, V(0, .35, -1).normalize(), 1); })), mat: 'horn'}]; }},
    {id: 'tw_tail_club', group: TL, sub: 'Club', name: 'Club tail', tags: ['tail', 'club', 'armored'], src,
      make: () => { const c = spine(.3, 7.5), club = new T.SphereGeometry(1, 20, 14); club.scale(1.1, .8, .9); club.translate(0, 7.5, -.12); K.noise(club, .12, 2);
        return [{geo: tailTube(c, .8, .25), mat: 'skin'}, {geo: club, mat: 'bone'},
          {geo: K.merge(K.ring(6, (i, a) => { const g = spike(.6, .2); g.rotateZ(Math.PI / 2); g.rotateY(a); g.translate(0, 7.5, -.12); return g; })), mat: 'horn'}]; }},
    {id: 'tw_tail_plated', group: TL, sub: 'Armored', name: 'Plated tail', tags: ['tail', 'plates', 'dino'], src,
      make: () => { const c = spine(.6); return [{geo: tailTube(c, .9, .1, .95), mat: 'skin'},
        {geo: K.merge(along(c, 8, (p, tg, t) => { const g = plate(); g.scale(1 - t * .6, 1 - t * .6, 1); const top = p.clone(); top.z -= (1 - t) * .7; return placeOn(g, top, V(0, .2, -1).normalize(), 1); })), mat: 'bone'}]; }},
    {id: 'tw_tail_fin', group: TL, sub: 'Aquatic', name: 'Finned sea tail', tags: ['tail', 'fin', 'fish'], src,
      make: () => { const c = spine(.2, 7), fin = K.extr([[0, 0], [1.6, .9], [.3, .1], [0, -.2], [-.3, .1], [-1.6, .9]], .06, .03); fin.rotateX(-Math.PI / 2); fin.rotateX(Math.PI / 2); fin.translate(0, 7, -.08);
        return [{geo: tailTube(c, .8, .14, .75), mat: 'scale'}, {geo: fin, mat: 'membrane'}]; }},
    {id: 'tw_tail_whip', group: TL, sub: 'Whip', name: 'Whip tail with stinger', tags: ['tail', 'stinger'], src,
      make: () => { const c = K.cr([V(0, 0, 0), V(0, 3, -.6), V(0, 6, .4), V(0, 8.5, 1.4)]), st = spike(1.1, .22); st.translate(0, 8.4, 1.3);
        return [{geo: tailTube(c, .55, .05), mat: 'chitin'}, {geo: st, mat: 'horn'}]; }},
    {id: 'tw_wing_bat', group: WG, sub: 'Membrane', name: 'Bat / dragon wing', tags: ['wing', 'dragon', 'membrane'], src,
      make: () => { const arm = K.cr([V(0, 0, 0), V(.2, 2.8, 0), V(.1, 5.2, 0)]), bones = [arm], tips = [[2.4, 7.4], [4.3, 6.4], [5.6, 4.4], [5.4, 2.0]];
        const fingers = tips.map(([x, y]) => K.cr([V(.1, 5.2, 0), V(x * .5, 5.2 + (y - 5.2) * .6 + .4, 0), V(x, y, 0)]));
        const s = new T.Shape(); s.moveTo(0, 0); s.lineTo(.1, 5.2); tips.forEach(([x, y], i) => { const [px, py] = i ? tips[i - 1] : [.1, 5.2]; if (i) s.quadraticCurveTo((x + px) / 2 - .2, (y + py) / 2 - .5, x, y); else s.lineTo(x, y); });
        s.quadraticCurveTo(3, .6, 0, 0); const mem = new T.ShapeGeometry(s, 16);
        const memB = mem.clone(); memB.scale(1, 1, -1); const ix = memB.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 1]; ix[i + 1] = t; }
        const claw = spike(.6, .12); claw.rotateZ(.4); claw.translate(.1, 5.3, 0);
        return [{geo: K.merge([K.taper(arm, .28, .16, 24, 10), ...fingers.map(f => K.taper(f, .14, .03, 20, 8)), claw.toNonIndexed ? claw : claw]), mat: 'bone'}, {geo: K.merge([mem, memB]), mat: 'membrane'}]; }},
    {id: 'tw_wing_insect', group: WG, sub: 'Insect', name: 'Insect wing', tags: ['wing', 'bug', 'glass'], src,
      make: () => { const s = new T.Shape(); s.moveTo(0, 0); s.bezierCurveTo(1.6, 1.5, 2.2, 5.5, .9, 7.2); s.bezierCurveTo(-.2, 6.5, -.6, 3, 0, 0);
        const g = K.extr(s, .02, .01), veins = K.merge([0, .3, .6, .9].map(k => K.taper(K.cr([V(0, 0, 0), V(.6 + k, 3 + k * 2, .02), V(.9 * (1 - k * .3), 6.6 - k * 1.5, .02)]), .04, .015, 16, 6)));
        return [{geo: g, mat: 'crystal'}, {geo: veins, mat: 'chitin'}]; }},
    {id: 'tw_wing_mech', group: WG, sub: 'Mech', name: 'Mech blade wing', tags: ['wing', 'mech', 'blade'], src,
      make: () => { const spar = new T.BoxGeometry(.45, 5.5, .45); spar.translate(0, 2.75, 0);
        const blades = K.merge([0, 1, 2, 3].map(i => { const b = K.extr([[0, 0], [.55, .3], [.4, 4.2 - i * .5], [0, 4.6 - i * .5]], .1, .03); b.rotateZ(-.5 - i * .28); b.translate(0, 5.2 - i * .9, 0); return b; }));
        return [{geo: spar, mat: 'darkmetal'}, {geo: blades, mat: 'paint'}]; }},
  ];
});
