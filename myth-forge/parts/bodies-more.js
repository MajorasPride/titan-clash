// Mythic Forge: torso / body parts so EVERY body type has one made for it (Nov 9 2026, ours). Prefix bb_.
// Torso rule (same as every torso): hips at the origin, grows along +Y toward the neck/head end, +Z = front/chest. On bodies that lie flat
// (4 legs, fish, snake…) the fitter turns +Z into the belly (down), so bellies / belly plates go on +Z and back fins / plates on -Z.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  'use strict';
  const {V3, lathe, taper, cr, at, merge, noise, extr} = K, TB = 'Torsos & Bellies', MT = 'Mech Torso & Core';
  const prof = (n, h, rf) => [...Array(n + 1).keys()].map(i => { const t = i / n; return [Math.max(1e-3, rf(t)), t * h]; });
  const S = (id, group, sub, name, tags, make) => ({id: 'bb_' + id, group, sub, name, tags, make});
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const end = t => Math.sqrt(Math.max(0, Math.sin(Math.min(1, Math.max(0, t)) * Math.PI)));   // rounded ends
  function body(h, rf, sx = 1, sz = 1, seg = 64, n = 60) { const g = lathe(prof(n, h, rf), seg); g.scale(sx, 1, sz); return g; }
  // fin / plate from a 2D outline, standing on the +Z side (spine side)
  // fin from a 2D outline: outline x runs along the body (+Y), outline y sticks out along dir*Z
  const fin = (pts, th, y, dir) => extr(pts.map(([a, b2]) => [a, b2 * dir]), th, th * .3).applyMatrix4(new T.Matrix4().makeBasis(V3(0, 1, 0), V3(0, 0, 1), V3(1, 0, 0))).translate(0, y, 0);
  return [
    // Looks round 2 (Nov 9 late): four-legged bodies are shaped animals now (rump, haunches, tucked waist, deep chest, shoulders, brisket in front of the legs).
    // The spine runs along the TOP of the body (short back side, deep belly side), so the leg roots sit inside the flanks. `fitBox` is the hips-to-neck span:
    // the rump (behind y = 0) and the brisket (past the box) overhang it on purpose. Old egg bodies: archive/bodies-quad-eggs-v1.js
    ...[['beast', 'Beast body (4 legs)', ['quad', 'wolf', 'bear', 'beast', 'animal', 'fur'], 'fur', 4.6, [.03, 3],
        [[-.75, .25, .3, .25], [-.5, .62, .75, .5], [-.1, .95, 1.15, .62], [.5, 1.05, 1.3, .66], [1.5, .86, 1.0, .62], [2.6, .98, 1.3, .66], [3.6, 1.1, 1.55, .74], [4.3, 1.08, 1.5, .78], [4.9, .85, 1.15, .7], [5.3, .5, .7, .5], [5.5, .2, .3, .25]], [.44, .9, .95], [.44, .95, 1.0]],
      ['lion', 'Big cat / lion body', ['lion', 'tiger', 'sphinx', 'cat', 'beast'], 'fur', 4.8, [.02, 3],
        [[-.7, .25, .3, .25], [-.45, .6, .72, .5], [-.1, .9, 1.1, .6], [.5, 1.02, 1.25, .64], [1.6, .76, .86, .58], [2.8, .95, 1.25, .66], [3.8, 1.12, 1.6, .76], [4.5, 1.1, 1.55, .8], [5.1, .85, 1.15, .7], [5.5, .5, .7, .5], [5.7, .2, .3, .25]], [.46, .95, 1.0], [.48, 1.0, 1.05]],
      ['horse', 'Horse / centaur barrel', ['horse', 'centaur', 'taur', 'barrel', 'beast'], 'skin', 5.2, [.015, 2],
        [[-.8, .25, .3, .25], [-.55, .62, .75, .5], [-.1, .95, 1.2, .62], [.6, 1.06, 1.35, .68], [1.8, .98, 1.3, .64], [3.0, 1.04, 1.45, .66], [4.1, 1.1, 1.55, .72], [4.9, 1.04, 1.45, .76], [5.5, .82, 1.1, .68], [5.9, .5, .7, .5], [6.1, .2, .3, .25]], [.46, 1.0, 1.05], [.44, 1.0, 1.05]]
    ].map(([id, name, tags, mat, H, nz, rows, hip, sh]) => ({...S(id, TB, 'Beast Bodies', name, tags, () => { const X = window.makeKit(T, K);
      const g = X.loft(rows.map(([a, w, t, b]) => ({a, w, t, b, n: 2.5})), {axis: 'y', rad: 44, per: 5, noise: nz});
      const bl = (r, x, y, z) => new T.SphereGeometry(1, 20, 14).scale(r[0], r[1], r[2]).translate(x, y, z);
      const mus = noise(merge([-1, 1].flatMap(sd => [bl(hip, sd * .82, .2, .5), bl(sh, sd * .86, H - .3, .62)]).map(q => q.toNonIndexed())), nz[0], nz[1]);
      const out = [{geo: g, mat}, {geo: mus, mat}];
      if (id === 'lion') { const mane = body(1.5, t => (1.5 - .25 * t) * end(t), 1.05, 1.15, 48, 24); at(mane, 0, H - 1.2, .3); out.push({geo: noise(mane, .12, 3), mat: 'fur'}); }
      return out; }), fitBox: [[-1.12, 0, -.8], [1.12, H, 1.6]]})),
    S('bird', TB, 'Bird Bodies', 'Bird body (feathered)', ['bird', 'griffin', 'feather', 'avian'], () => {
      const g = body(3.6, t => (1.2 * Math.sin(Math.min(1, t * 1.05) * Math.PI) ** .7 + .05) * (1 - .25 * t), 1.0, 1.25);
      const ruff = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; ruff.push(at(new T.ConeGeometry(.22, .8, 6), Math.cos(a) * .95, 2.9, Math.sin(a) * 1.1, Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2)); }
      return [{geo: noise(g, .025, 3), mat: 'feather'}, {geo: merge(ruff), mat: 'feather'}]; }),
    S('fish', TB, 'Sea Bodies', 'Fish / shark body', ['fish', 'shark', 'sea', 'aquatic'], () => {
      const g = body(5.4, t => (.25 + 1.0 * Math.sin(Math.min(1, t * 1.05) * Math.PI) ** .8) * (t > .97 ? (1 - t) / .03 : 1) + .02, .75, 1.0);
      const dorsal = fin([[0, -.95], [1.5, -.95], [.25, -2.4]], .1, 2.0, 1), side = [-1, 1].map(s => at(extr([[0, 0], [.9, -.2], [.1, .4]], .06, .02), s * .7, 3.2, .4, -.3, 0, s * .9));
      const belly = fin([[0, .9], [.7, .9], [.1, 1.4]], .06, 1.2, 1);
      return [{geo: g, mat: 'scale'}, {geo: merge([dorsal, ...side, belly]), mat: 'membrane'}]; }),
    {...S('snake', TB, 'Sea Bodies', 'Serpent body (thick)', ['snake', 'serpent', 'naga', 'eel', 'sea'], () => {
      const c = cr([V3(0, 0, 0), V3(.15, 1.5, .1), V3(-.1, 3, -.05), V3(0, 4.2, .1)]); const g = taper(c, t => .95 - .15 * t, 0, 100, 40);
      const belly = []; for (let i = 0; i < 16; i++) { const t = (i + .5) / 16, p = c.getPointAt(t); belly.push(at(new T.BoxGeometry(1.2 - .2 * t, .2, .25), p.x, p.y, p.z + .82 - .12 * t)); }
      return [{geo: noise(g, .02, 4), mat: 'scale'}, {geo: merge(belly), mat: 'leather'}]; }), fitKind: 'tail'},   // follows the whole spine like a tail
    // one piece per spine bone, so a curvy serpent skeleton gets a curvy body (unit length 1, overlaps a little so there are no gaps)
    {...S('snakeseg', TB, 'Sea Bodies', 'Serpent body segment', ['snake', 'serpent', 'eel', 'segment'], () => {
      const g = new T.CylinderGeometry(.5, .5, 1.25, 32, 6).translate(0, .5, 0), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = 1 + .05 * Math.sin(Math.max(0, Math.min(1, y)) * Math.PI); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } g.computeVertexNormals();
      const plate = new T.BoxGeometry(.62, .32, .16).translate(0, .5, .48); return [{geo: noise(g, .01, 6), mat: 'scale'}, {geo: plate, mat: 'leather'}]; }), fitKind: 'seg', unitLen: 1, perSeg: true},
    // small missing pieces found by the default builds (Nov 9): antennae, spider palps + abdomen, fish fins, bird tail fan
    {...S('antenna', 'Tentacles & Extra Limbs', 'Bug Bits', 'Bug antenna', ['antenna', 'feeler', 'bug', 'insect', 'moth'], () => {
      const c = cr([V3(0, 0, 0), V3(0, 1.2, .3), V3(0, 2.2, .9), V3(0, 2.8, 1.8)]), g = taper(c, t => .09 - .05 * t, 0, 60, 10), knobs = [];
      for (let i = 1; i < 12; i++) { const p = c.getPointAt(i / 12); knobs.push(at(new T.SphereGeometry(.07 - .002 * i, 10, 8), p.x, p.y, p.z)); }
      return [{geo: g, mat: 'chitin'}, {geo: merge(knobs), mat: 'chitin'}]; }), fitKind: 'limb'},
    {...S('palp', 'Arms & Shoulders', 'Bug & Crab', 'Spider palp', ['spider', 'palp', 'pedipalp', 'bug'], () => {
      const c = cr([V3(0, 0, 0), V3(0, .9, .3), V3(0, 1.6, .1), V3(0, 2.1, .4)]); return [{geo: noise(taper(c, t => .2 - .08 * t, 0, 50, 14), .01, 8), mat: 'chitin'}, {geo: at(new T.SphereGeometry(.17, 16, 12), 0, 2.1, .4), mat: 'chitin'}]; }), fitKind: 'limb'},
    {...S('abdomen', 'Tails', 'Bug Bits', 'Bug abdomen (big)', ['spider', 'abdomen', 'bug', 'insect', 'ant'], () => {
      const g = body(3.2, t => (1.25 * Math.sin(Math.min(1, t * 1.02 + .03) * Math.PI) ** .7) * (1 - .15 * t), 1, 1.05, 48, 40);
      const bands = []; for (let i = 1; i < 6; i++) bands.push(at(new T.TorusGeometry(1.0 * Math.sin(i / 6 * Math.PI) ** .7 + .05, .04, 6, 40).rotateX(Math.PI / 2), 0, i * .53, 0));
      return [{geo: g, mat: 'chitin'}, {geo: merge(bands), mat: 'chitin'}]; }), fitKind: 'tail'},
    {...S('fin', 'Wings', 'Fins', 'Fish fin', ['fish', 'fin', 'shark', 'sea', 'aquatic'], () => {
      const g = extr([[0, 0], [.5, .1], [2.2, 1.6], [1.4, 1.8], [.3, 1.2]], .06, .03).applyMatrix4(new T.Matrix4().makeBasis(V3(1, 0, 0), V3(0, 1, 0), V3(0, 0, 1))); return [{geo: g, mat: 'membrane'}]; }), fitKind: 'wing'},
    {...S('tailfan', 'Tails', 'Bird', 'Bird tail fan', ['bird', 'tail', 'feather', 'fan'], () => {
      const fs = []; for (let i = 0; i < 9; i++) { const a = (i - 4) * .16; fs.push(at(K.extr([[-.12, 0], [.12, 0], [.18, 2.4], [0, 2.8], [-.18, 2.4]], .04, .02), 0, 0, 0, 0, 0, a)); }
      return [{geo: merge(fs), mat: 'feather'}]; }), fitKind: 'tail'},
    S('scorpion', TB, 'Bug & Shell', 'Scorpion body (plated)', ['scorpion', 'bug', 'plates', 'chitin', 'arachnid'], () => {
      const segs = [], plates = []; for (let i = 0; i < 6; i++) { const y = i * .72, w = 1.25 - .07 * i;
        segs.push(at(new T.SphereGeometry(w, 40, 24), 0, y + .4, 0).scale(1, 1, .55)); plates.push(at(new T.SphereGeometry(w * 1.04, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2.4).rotateX(-Math.PI / 2), 0, y + .45, -.1).scale(1, 1, .6)); }
      return [{geo: merge(segs), mat: 'flesh'}, {geo: merge(plates), mat: 'chitin'}]; }),
    S('blob', TB, 'Odd', 'Gooey blob body', ['blob', 'slime', 'ooze', 'goo'], () => {
      const g = body(3.4, t => (1.7 * Math.sin(Math.min(1, t * 1.02 + .02) * Math.PI) ** .55) * (1 + .25 * Math.max(0, .35 - t)), 1, 1, 64, 50); noise(g, .18, 1.2);
      const drips = []; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + .3; drips.push(taper(cr([V3(Math.cos(a) * 1.55, .5, Math.sin(a) * 1.55), V3(Math.cos(a) * 1.75, .1, Math.sin(a) * 1.75), V3(Math.cos(a) * 1.85, -.05, Math.sin(a) * 1.85)]), .22, .1, 16, 10)); }
      return [{geo: g, mat: 'slime'}, {geo: merge(drips), mat: 'slime'}]; }),
    {...S('tank', MT, 'Bases', 'Tank hull + treads', ['tank', 'treads', 'mech', 'vehicle', 'base'], () => {
      const hull = at(extr([[-1.6, -1.2], [1.6, -1.2], [1.9, 0], [1.6, 1.2], [-1.6, 1.2], [-1.9, 0]], 1.0, .1), 0, .9, 0, Math.PI / 2); hull.rotateY(Math.PI / 2);
      const treads = [-1, 1].map(s => at(new T.CapsuleGeometry(.55, 3.2, 8, 24).rotateX(Math.PI / 2), s * 1.25, .55, 0)); const wheels = [];
      for (const s of [-1, 1]) for (let i = 0; i < 5; i++) wheels.push(at(new T.CylinderGeometry(.35, .35, .3, 20).rotateZ(Math.PI / 2), s * 1.42, .5, -1.4 + i * .7));
      const ring = at(new T.CylinderGeometry(.9, 1.0, .25, 32), 0, 1.5, 0);
      return [{geo: hull, mat: 'paint'}, {geo: merge(treads), mat: 'rubber'}, {geo: merge(wheels), mat: 'darkmetal'}, {geo: ring, mat: 'metal'}]; }), fitKind: 'torso'},
    {...S('walker', MT, 'Bases', 'Walker cockpit hull', ['walker', 'mech', 'cockpit', 'pod', 'beast-mech'], () => {
      const pod = body(2.8, t => (1.3 * Math.sin(Math.min(1, t * 1.05 + .03) * Math.PI) ** .7), 1.1, 1.35, 32, 30);
      const glass = at(new T.SphereGeometry(.75, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), 0, 1.7, 1.05).scale(1.1, .8, 1);
      const hips = [-1, 1].map(s => at(new T.CylinderGeometry(.45, .45, .5, 20).rotateZ(Math.PI / 2), s * 1.35, .9, 0));
      const vents = [0, 1, 2].map(i => at(new T.BoxGeometry(.7, .08, .3), 0, .9 + i * .25, -1.25));
      return [{geo: pod, mat: 'paint'}, {geo: glass, mat: 'glow'}, {geo: merge(hips), mat: 'darkmetal'}, {geo: merge(vents), mat: 'metal'}]; }), fitKind: 'torso'},
  ];
});
