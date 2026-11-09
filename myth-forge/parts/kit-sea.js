// Mythic Forge — SEA KIT (Nov 9 2026, test page). Original designs, made in code (ours).
// 🦈 Shark / fish: one-piece bodies, plug heads with their own jaws, crescent + fan tails, a full fin set (dorsal, pectoral, small fins, spiny).
// 🦞 Lobster: carapace, face, flat tail segments, tail fan, crusher + cutter claws, jointed walking leg, whip antenna.
// Frames: torso = hips at the origin, +Y toward the head, +Z = belly (down on flat bodies), -Z = back.
//         head = neck joint at the origin, +Y up, face +Z.   fins (Wings) = leading edge along +Y, blade trails toward +X, thin along Z.
//         `keel: 1` parts (tails / tail segments) are rolled by the fitter so -Z is the back (up) and +Z the belly.
(function () {   // skins
  const M = window.FORGE_MATS; if (!M) return;
  M.LIST.push(['sharkgrey', 'Shark grey', 'Skins & Scales', 'skin', 0x5f6f80, .42, 0], ['sharkbelly', 'Shark belly (white)', 'Skins & Scales', 'skin', 0xe9edf0, .45, 0], ['sharkfin', 'Shark fin (dark)', 'Skins & Scales', 'skin', 0x4a5868, .45, 0, {side: 2}],
    ['fishscale', 'Fish scales (silver-blue)', 'Skins & Scales', 'scales', 0x6f9ab8, .3, .25], ['fishfin', 'Fish fin (see-through)', 'Skins & Scales', 'membrane', 0xd8a04a, .5, 0, {side: 2, transparent: true, opacity: .9}],
    ['lobster', 'Lobster shell (red)', 'Skins & Scales', 'chitin', 0xb8321e, .32, .05], ['lobsterdark', 'Lobster shell (dark)', 'Skins & Scales', 'chitin', 0x6e1c14, .35, .05], ['lobsterblue', 'Lobster shell (blue)', 'Skins & Scales', 'chitin', 0x2a5ea8, .3, .1],
    ['eyeblack', 'Eye (glossy black)', 'Glow & Crystal', 'plain', 0x08080a, .08, .1], ['fisheye', 'Fish eye (gold)', 'Glow & Crystal', 'plain', 0xd8b040, .2, .4],
    ['mouthdark', 'Mouth (dark inside)', 'Gooey', 'plain', 0x3a1218, .6, 0]);
})();
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const X = window.makeKit(T, K), {loft, ell, spike, at, merge, plug, pair, P, V3} = X, out = [];
  const add = (id, group, sub, name, ex, make) => out.push({id, group, sub, name, tags: ['kit', 'sea', ...(ex.tags || [])], ...ex, make});
  const Sy = rows => rows.map(([a, w, t, b, n, y]) => ({a, w, t, b: b ?? t, n: n || 2.2, y: y || 0}));                       // along +Y: [y, halfWidth, belly(+Z), back(-Z), squareness, z offset]
  const Sz = rows => rows.map(([a, w, yt, yb, n]) => ({a, w, t: (yt - yb) / 2, b: (yt - yb) / 2, y: (yt + yb) / 2, n: n || 2.3}));   // along +Z: [z, halfWidth, yTop, yBottom, squareness]
  // flat blade from an outline in the XY plane, thicker at the root (y = 0), paper thin at the edges
  function blade(pts, th = .09) { const g = K.extr(pts, th, th * .45, 2), a = g.attributes.position; let ymax = 0, xmax = 0; for (const p of pts) { ymax = Math.max(ymax, p[1]); xmax = Math.max(xmax, Math.abs(p[0])); }
    for (let i = 0; i < a.count; i++) { const k = 1 - .72 * Math.min(1, Math.max(a.getY(i) / ymax, 0) * .8 + Math.max(0, a.getX(i) / xmax) * .35); a.setZ(i, a.getZ(i) * k); } g.computeVertexNormals(); return g; }
  const mir = g => K.mirrorX(g);
  const both = g => merge([g, mir(g)]);

  // =============================================================== 🦈 BODIES (one piece, nose end at the top of +Y)
  // great-white style: deep chest, tapering to a thin tail stalk. Belly is a second, slightly bigger shell underneath (white).
  const sharkSecs = [[0, .3, .34, .36, 2.1], [.9, .5, .56, .6], [2.0, .78, .84, .92], [3.2, .98, 1.04, 1.12], [4.3, 1.0, 1.02, 1.1], [5.2, .93, .94, 1.0], [5.75, .86, .86, .92], [6.0, .8, .8, .86]];
  add('ks_shark_body', 'Torsos & Bellies', '🦈 Sea Bodies', 'Shark body (one piece)', {fitKind: 'torso', tags: ['shark', 'fish', 'body'],
    plugs: [plug('back1', 'back', [0, 3.6, -1.1], [0, 0, -1], 'out', {s: .6, back: [0, -1, 0]}), plug('back2', 'back', [0, 1.4, -.7], [0, 0, -1], 'out', {s: .4, back: [0, -1, 0]}), plug('belly', 'belly', [0, 3.0, 1.0], [0, 0, 1], 'out', {s: .5, back: [0, -1, 0]})]}, () => {
    const body = loft(Sy(sharkSecs), {axis: 'y', rad: 36, per: 5, noise: [.008, 3]});
    const belly = loft(Sy(sharkSecs.map(([a, w, t, b, n]) => [a, w * .9, t * 1.035, -.02, 2.4])), {axis: 'y', rad: 30, per: 5});
    const gills = []; for (let i = 0; i < 5; i++) for (const sd of [-1, 1]) gills.push(at(new T.BoxGeometry(.03, .06, .5 - i * .04), sd * (.99 - i * .012), 4.5 + i * .17, .1, 0, 0, sd * -5));
    return [P(body, 'sharkgrey'), P(belly, 'sharkbelly'), P(merge(gills), 'mouthdark')]; });
  // bony fish: taller and flatter side to side, scales, a soft lateral line
  const fishSecs = [[0, .2, .34, .34, 2.1], [.8, .34, .62, .62], [1.9, .52, .98, 1.0], [3.0, .64, 1.18, 1.22], [4.2, .66, 1.16, 1.2], [5.1, .6, 1.0, 1.06], [5.7, .52, .82, .9], [6.0, .44, .66, .74]];
  add('ks_fish_body', 'Torsos & Bellies', '🦈 Sea Bodies', 'Fish body (tall, scaled)', {fitKind: 'torso', tags: ['fish', 'carp', 'bass', 'piranha', 'body'],
    plugs: [plug('back1', 'back', [0, 3.6, -1.2], [0, 0, -1], 'out', {s: .6, back: [0, -1, 0]}), plug('belly', 'belly', [0, 3.0, 1.15], [0, 0, 1], 'out', {s: .5, back: [0, -1, 0]})]}, () => {
    const body = loft(Sy(fishSecs), {axis: 'y', rad: 36, per: 5, noise: [.006, 4]});
    const belly = loft(Sy(fishSecs.map(([a, w, t, b, n]) => [a, w * .86, t * 1.03, -.02, 2.4])), {axis: 'y', rad: 30, per: 5});
    const line = both(at(K.taper(K.bez(V3(0, .6, 0), V3(.26, 3.2, -.2), V3(0, 5.6, -.1)), .03, .02, 20, 6), .43, 0, -.05));
    return [P(body, 'fishscale'), P(belly, 'sharkbelly'), P(line, 'sharkfin')]; });

  // =============================================================== 🦈 HEADS (upper skull + its own jaw, 🔌 eyes / teeth / fins)
  function headPair(c) { const H = c.hinge, mouthLen = c.mouthLen, jw = c.jaw;
    const plugs = [plug('jaw', 'jaw', H, [0, -1, 0], 'frame'), ...pair('eye', 'eye', c.eye, c.eyeDir || [1, .1, .25], 'frame', {s: (c.eyeS || .6) * .62, sink: .1}),
      plug('teethU', 'teeth', [0, H[1] - .02, H[2] + .2], [0, -1, 0], 'frame', {s: mouthLen, r: [0, 0, 180]}), ...pair('fangU', 'fang', c.fang, [0, -1, .15], 'out', {s: .5}),
      plug('crest', 'crest', c.crest, [0, 1, -.35], 'out', {s: .7}), plug('nose', 'nose', c.nose, [0, 0, 1], 'frame', {s: .6}), plug('brow', 'brow', [0, c.eye[1] + .22, c.eye[2]], [0, 0, 1], 'frame', {s: .8}),
      ...pair('horn', 'horn', [c.eye[0] * .7, c.crest[1] - .05, c.eye[2] - .5], [.35, .9, -.35], 'out', {s: .6}), ...pair('cheek', 'cheek', [c.eye[0], c.eye[1] - .45, c.eye[2] - .2], [1, 0, .2], 'out', {s: .5}),
      ...pair('ear', 'ear', [c.eye[0] * 1.02, c.eye[1] - .1, c.eye[2] - .9], [1, .3, -.4], 'out', {s: .7}), plug('crown', 'crown', [0, c.crest[1], c.eye[2] - .3], [0, 1, 0], 'frame', {s: .8})];
    const jplugs = [plug('teeth', 'teeth', [0, .04, .2], [0, 1, 0], 'frame', {s: mouthLen}), ...pair('fang', 'fang', [c.fang[0], .04, mouthLen], [0, 1, .1], 'out', {s: .45}),
      plug('tongue', 'tongue', [0, -.02, .15], [0, 0, 1], 'frame', {s: mouthLen * .6}), plug('chin', 'chin', [0, jw.chin, mouthLen * .8], [0, -.6, .8], 'frame', {s: .6})];
    out.push({id: 'kh_' + c.id, group: 'Heads & Skulls', sub: '🔌 Plug heads', name: c.name + ' (upper)', tags: ['kit', 'plug', 'sea', 'upper skull', ...c.tags], upperOnly: true, jawFor: 'kh_' + c.id + '_jaw', plugs, kit: 'sea', make: c.make});
    out.push({id: 'kh_' + c.id + '_jaw', group: 'Jaws & Teeth', sub: 'Lower Jaws', name: c.name + ' jaw', tags: ['kit', 'plug', 'sea', 'jaw', ...c.tags], plugAs: 'jaw', plugs: jplugs, kit: 'sea', upperFor: 'kh_' + c.id, make: c.makeJaw}); }
  // shark: pointed snout that overhangs the mouth, dark mouth roof, nostril pits
  headPair({id: 'shark', name: 'Shark head', tags: ['shark', 'fish', 'great white'], hinge: [0, -.02, .15], mouthLen: 1.25, eye: [.7, .52, 1.25], eyeS: .42, fang: [.3, -.05, 1.3], crest: [0, .98, -.2], nose: [0, .3, 2.7], jaw: {chin: -.5},
    make: () => { const up = [[-1.0, .84, 1.12, -.04, 2.2], [-.3, .9, 1.16, -.04], [.4, .86, 1.08, -.03], [1.0, .76, .94, .0], [1.5, .62, .78, .04, 2.4], [2.0, .45, .6, .1, 2.5], [2.45, .27, .42, .16], [2.75, .1, .3, .22, 2.1]];
      const skull = loft(Sz(up), {rad: 34, per: 5, noise: [.008, 4]});
      const roof = at(ell(.6, .06, .72, 0, 0, 0, 14), 0, -.02, .78);
      const under = loft(Sz([[1.35, .58, .06, -.03, 2.6], [1.9, .44, .12, .04, 2.6], [2.4, .27, .18, .1, 2.4], [2.72, .09, .24, .19]]), {rad: 20, per: 4});
      const nost = both(at(ell(.05, .03, .09, 0, 0, 0, 8), .2, .14, 2.3));
      return [P(skull, 'sharkgrey'), P(under, 'sharkbelly'), P(merge([roof, nost]), 'mouthdark')]; },
    makeJaw: () => [P(loft(Sz([[-1.15, .76, .05, -.6, 2.3], [-.5, .82, .05, -.68], [.0, .8, .05, -.66], [.5, .72, .05, -.56], [.95, .56, .05, -.42, 2.4], [1.3, .38, .05, -.26], [1.5, .2, .05, -.12]]), {rad: 28, per: 5}), 'sharkbelly'),
      P(at(ell(.52, .05, .62, 0, 0, 0, 14), 0, .04, .6), 'mouthdark')]});
  // bony fish: blunt face, big eye, gill cover (a plate on each cheek), small mouth at the front
  headPair({id: 'fish', name: 'Fish head', tags: ['fish', 'carp', 'bass', 'piranha', 'gills'], hinge: [0, .0, .7], mouthLen: .8, eye: [.5, .62, 1.05], eyeS: .78, fang: [.14, 0, .7], crest: [0, 1.22, -.3], nose: [0, .5, 1.95], jaw: {chin: -.34},
    make: () => { const up = [[-1.0, .5, 1.02, -.06, 2.1], [-.3, .58, 1.2, -.06], [.4, .58, 1.2, -.04], [1.0, .5, 1.02, .0], [1.5, .38, .78, .04], [1.85, .24, .56, .1], [2.02, .1, .42, .2]];
      const skull = loft(Sz(up), {rad: 34, per: 5, noise: [.006, 4]});
      const gill = both(at(ell(.06, .62, .5, 0, 0, 0, 16), .56, .34, -.05, 0, 0, 0));
      const slit = both(at(ell(.03, .56, .06, 0, 0, 0, 10), .6, .34, -.52));
      return [P(skull, 'fishscale'), P(gill, 'fishscale'), P(slit, 'mouthdark')]; },
    makeJaw: () => [P(loft(Sz([[-1.2, .46, .05, -.9, 2.2], [-.5, .52, .05, -.98], [.1, .46, .05, -.8], [.55, .32, .05, -.5], [.85, .18, .06, -.22], [.98, .08, .06, -.08]]), {rad: 26, per: 5}), 'sharkbelly')]});

  add('ks_eye_shark', 'Eyes & Faces', '🔌 Eyes', 'Shark eye (black)', {plugAs: 'eye', plugs: [], tags: ['eye', 'shark', 'black']}, () => [P(ell(.26, .26, .2, 0, 0, 0, 16), 'eyeblack'), P(ell(.07, .07, .04, .08, .1, .17, 8), 'sharkbelly')]);
  add('ks_eye_fish', 'Eyes & Faces', '🔌 Eyes', 'Fish eye (round, gold ring)', {plugAs: 'eye', plugs: [], tags: ['eye', 'fish']}, () => [P(ell(.27, .27, .16, 0, 0, 0, 18), 'fisheye'), P(ell(.14, .14, .1, 0, 0, .1, 12), 'eyeblack')]);
  // =============================================================== 🦈 TAILS (tail stalk + tail fin in one piece; keel = fin stands upright)
  add('ks_shark_tail', 'Tails', '🦈 Sea Tails', 'Shark tail (crescent fin)', {fitKind: 'tail', keel: 1, along: true, tags: ['shark', 'tail', 'crescent', 'caudal'],
    plugs: [plug('back1', 'back', [0, .5, -.3], [0, 0, -1], 'out', {s: .3, back: [0, -1, 0]})]}, () => {
    const stalk = loft(Sy([[-.1, .3, .36, .38, 2.1], [.8, .2, .26, .27], [1.7, .12, .2, .2], [2.3, .09, .2, .2], [2.6, .05, .16, .16]]), {axis: 'y', rad: 20, per: 4});
    const keelL = both(at(ell(.09, .5, .035, 0, 0, 0, 10), .13, 1.9, 0));
    // outline: x = up (+) / down (-), y = along the tail
    const fin = blade([[.18, 1.9], [.9, 2.7], [1.75, 3.55], [2.05, 3.95], [1.9, 3.98], [1.2, 3.45], [.5, 3.02], [0, 2.86], [-.42, 3.02], [-.95, 3.5], [-1.3, 3.72], [-1.38, 3.56], [-.9, 2.75], [-.2, 1.95]], .1);
    const a = fin.attributes.position; for (let i = 0; i < a.count; i++) { const x = a.getX(i); a.setXYZ(i, a.getZ(i), a.getY(i), -x); } fin.computeVertexNormals();
    return [P(merge([stalk, keelL]), 'sharkgrey'), P(fin, 'sharkfin')]; });
  add('ks_fish_tail', 'Tails', '🦈 Sea Tails', 'Fish tail (forked fan)', {fitKind: 'tail', keel: 1, along: true, tags: ['fish', 'tail', 'fan', 'fork']}, () => {
    const stalk = loft(Sy([[-.1, .2, .42, .44, 2.1], [.9, .13, .3, .3], [1.8, .08, .26, .26], [2.2, .05, .3, .3]]), {axis: 'y', rad: 20, per: 4});
    const fin = blade([[.24, 1.9], [.75, 2.5], [1.4, 3.4], [1.5, 3.75], [1.0, 3.5], [.45, 3.15], [0, 2.95], [-.45, 3.15], [-1.0, 3.5], [-1.5, 3.75], [-1.4, 3.4], [-.75, 2.5], [-.24, 1.9]], .06);
    const a = fin.attributes.position; for (let i = 0; i < a.count; i++) { const x = a.getX(i); a.setXYZ(i, a.getZ(i), a.getY(i), -x); } fin.computeVertexNormals();
    const rays = []; for (let i = -4; i <= 4; i++) { if (!i) continue; const t = i / 4; rays.push(K.taper(K.bez(V3(0, 2.0, -t * .2), V3(0, 2.7, -t * .75), V3(0, 3.35 + Math.abs(t) * .25, -t * 1.3)), .022, .008, 8, 5)); }
    return [P(stalk, 'fishscale'), P(fin, 'fishfin'), P(merge(rays), 'sharkfin')]; });

  // =============================================================== 🦈 FINS (Wings group: go on fin bones; leading edge +Y, blade trails +X)
  const fin = (id, name, pts, mat, ex = {}) => add(id, 'Wings', '🦈 Fins', name, {fitKind: 'wing', tags: ['fin', 'fish', 'shark', ...(ex.tags || [])]}, () => [P(blade(pts, ex.th || .1), mat), ...(ex.extra ? ex.extra() : [])]);
  fin('ks_fin_dorsal', 'Shark back fin (dorsal)', [[-.1, -.05], [-.07, .5], [0, .9], [.07, 1.0], [.17, .98], [.3, .74], [.5, .6], [.74, .6], [.78, .5], [.6, .34], [.5, .0], [.2, -.12]], 'sharkfin', {tags: ['dorsal', 'back']});
  fin('ks_fin_pectoral', 'Shark side fin (pectoral)', [[-.05, -.05], [-.05, .5], [-.01, .9], [.03, 1.0], [.09, .97], [.19, .7], [.31, .36], [.4, .12], [.38, -.04], [.2, -.1]], 'sharkfin', {th: .07, tags: ['pectoral', 'side', 'flipper']});
  fin('ks_fin_small', 'Small fin (pelvic / anal / 2nd dorsal)', [[-.1, -.05], [-.04, .55], [.06, 1.0], [.2, .96], [.4, .56], [.7, .5], [.72, .36], [.5, .0], [.2, -.1]], 'sharkfin', {th: .07, tags: ['pelvic', 'anal']});
  fin('ks_fin_spiny', 'Spiny fish fin (rays + skin)', [[-.06, -.05], [0, 1.0], [.14, .9], [.3, .98], [.44, .8], [.6, .84], [.72, .62], [.88, .6], [.95, .3], [1.0, 0], [.4, -.08]], 'fishfin', {th: .03, tags: ['dorsal', 'spines', 'perch'],
    extra: () => [P(merge([[0, 1.02], [.3, 1.0], [.6, .86], [.88, .62]].map(([x, y]) => K.taper(K.bez(V3(x * .3, 0, 0), V3(x * .7, y * .5, 0), V3(x, y, 0)), .03, .008, 8, 5))), 'sharkfin')]});
  fin('ks_fin_round', 'Round fish fin (fan)', [[-.08, -.05], [-.1, .5], [.05, .95], [.3, 1.0], [.55, .85], [.7, .55], [.66, .2], [.45, -.02], [.2, -.1]], 'fishfin', {th: .03, tags: ['pectoral', 'fan'],
    extra: () => [P(merge([-.3, 0, .3, .6, .9].map(k => K.taper(K.bez(V3(.1, 0, 0), V3(.1 + k * .2, .45, 0), V3(.1 + k * .55, .9 - Math.abs(k - .2) * .25, 0)), .02, .006, 8, 5))), 'sharkfin')]});

  // =============================================================== 🦞 LOBSTER
  const SH = 'lobster', SD = 'lobsterdark';
  // carapace: head + chest shield in one, a horn (rostrum) between the eyes, a groove across the back, small spines
  add('ks_lob_carapace', 'Torsos & Bellies', '🦞 Lobster', 'Lobster carapace', {fitKind: 'torso', fitBox: [[-.95, 0, -.95], [.95, 3.2, .6]], tags: ['lobster', 'crayfish', 'shell', 'crustacean'],
    plugs: [plug('back1', 'back', [0, 1.6, -.95], [0, 0, -1], 'out', {s: .4, back: [0, -1, 0]}), plug('belly', 'belly', [0, 1.6, .5], [0, 0, 1], 'out', {s: .4, back: [0, -1, 0]})]}, () => {
    const shell = loft(Sy([[-.08, .7, .4, .7, 2.6], [.5, .9, .5, .9, 2.6], [1.3, .95, .52, .95, 2.6], [2.0, .9, .5, .9, 2.6], [2.5, .78, .45, .8, 2.5], [2.95, .58, .36, .62, 2.4], [3.25, .36, .26, .42, 2.3]]), {axis: 'y', rad: 34, per: 5, noise: [.01, 5]});
    const groove = at(new T.TorusGeometry(.9, .05, 8, 30, Math.PI), 0, 2.0, -.02, 90, 0, 180);
    const rost = at(spike(1.25, .16, .05, 0, 12, 8, .55), 0, 3.05, -.32, 6);
    const spines = []; for (const [x, y, z] of [[.5, 2.75, -.42], [.72, 2.35, -.5], [.3, 2.55, -.6]]) for (const sd of [-1, 1]) spines.push(at(spike(.22, .05, .1), sd * x, y, z, -40, 0, sd * -20));
    const under = loft(Sy([[0, .5, .5, -.2, 3], [1.5, .62, .6, -.2, 3], [3.0, .4, .42, -.15, 3]]), {axis: 'y', rad: 18, per: 3});
    return [P(shell, SH), P(merge([groove, rost, ...spines]), SD), P(under, 'sharkbelly')]; });
  // face: small plate under the horn, mouth parts, two short feelers; 🔌 eyes (stalk eyes sit on the eye stalk bones)
  add('ks_lob_face', 'Heads & Skulls', '🦞 Lobster', 'Lobster face (mouth parts)', {fitKind: 'head', tags: ['lobster', 'crayfish', 'face', 'crustacean'],
    plugs: [...pair('eye', 'eye', [.36, .52, .5], [.8, .5, .4], 'frame', {s: .4}), ...pair('horn', 'antenna', [.26, .5, .7], [.5, .5, .8], 'out', {s: .9}), plug('crest', 'crest', [0, .7, .2], [0, 1, 0], 'out', {s: .5})]}, () => {
    const plate = loft(Sz([[-.5, .5, .62, .0, 2.5], [.0, .52, .68, .02, 2.5], [.5, .4, .56, .08], [.85, .22, .42, .16]]), {rad: 24, per: 4});
    const mouth = both(merge([at(K.taper(K.bez(V3(), V3(.02, -.2, .3), V3(-.06, -.34, .62)), .09, .03, 10, 8), .16, .12, .5), at(K.taper(K.bez(V3(), V3(.04, -.12, .22), V3(0, -.2, .44)), .06, .02, 8, 6), .3, .16, .42)]));
    const feel = both(at(K.taper(K.bez(V3(), V3(.15, .2, .5), V3(.4, .5, 1.0)), .04, .01, 12, 6), .14, .46, .78));
    return [P(plate, SH), P(mouth, SD), P(feel, SD)]; });
  // tail segment: arched plate on top, soft underside, a point hanging down each side; one per tail bone
  add('ks_lob_seg', 'Tails', '🦞 Lobster', 'Lobster tail segment', {fitKind: 'seg', unitLen: 1, perSeg: true, keel: 1, fitBox: [[-.45, 0, -.3], [.45, 1, .15]], tags: ['lobster', 'crayfish', 'tail', 'segment', 'abdomen'],
    plugs: [plug('tip', 'tailtip', [0, 1, 0], [0, 1, 0], 'out', {s: 1, segEnd: 1}), plug('back1', 'back', [0, .5, -.44], [0, 0, -1], 'out', {s: .35, back: [0, -1, 0]}), plug('belly1', 'belly', [0, .5, .2], [0, 0, 1], 'out', {s: .35, back: [0, -1, 0]})]}, () => {
    const top = loft(Sy([[-.1, .6, .12, .42, 2.8], [.25, .66, .14, .46, 2.8], [.8, .62, .13, .43, 2.8], [1.06, .55, .1, .38, 2.8]]), {axis: 'y', rad: 26, per: 3});
    const under = loft(Sy([[-.05, .46, .22, -.05, 3], [.5, .5, .24, -.05, 3], [1.02, .44, .2, -.05, 3]]), {axis: 'y', rad: 16, per: 3});
    const pts = both(at(spike(.34, .13, 0, 0, 8, 6, .4), .6, .62, .08, 100, 0, -12));
    return [P(merge([top, pts]), SH), P(under, 'sharkbelly')]; });
  // tail fan: middle plate + two paddles each side
  add('ks_lob_fan', 'Tails', '🦞 Lobster', 'Lobster tail fan', {plugAs: 'tailtip', plugs: [], tags: ['lobster', 'crayfish', 'tail tip', 'fan']}, () => {
    const pad = (w, L) => { const g = blade([[-w * .35, 0], [-w, L * .55], [-w * .8, L * .92], [0, L], [w * .8, L * .92], [w, L * .55], [w * .35, 0]], .1); return g; };
    const mid = pad(.34, 1.1), ribs = [at(K.taper(K.bez(V3(), V3(0, .5, -.02), V3(0, 1.0, 0)), .035, .012, 8, 5), 0, 0, -.05)];
    const side = []; for (const sd of [-1, 1]) { side.push(at(pad(.3, 1.05), sd * .26, 0, .01, 0, 0, sd * -32), at(pad(.3, 1.0), sd * .36, -.02, .02, 0, 0, sd * -62));
      ribs.push(at(K.taper(K.bez(V3(), V3(0, .5, -.02), V3(0, .95, 0)), .03, .01, 8, 5), sd * .26, 0, -.04, 0, 0, sd * -32), at(K.taper(K.bez(V3(), V3(0, .5, -.02), V3(0, .9, 0)), .03, .01, 8, 5), sd * .36, -.02, -.03, 0, 0, sd * -62)); }
    return [P(merge([mid, ...side]), SH), P(merge(ribs), SD)]; });
  // claws: fat palm, a fixed finger and a moving thumb, knobbly teeth. +Y out, pinch along X
  const lobClaw = (id, name, o) => add(id, 'Hands & Claws', '🦞 Lobster', name, {fitKind: 'hand', fitBox: [[-.34, 0, -.3], [.34, 2.9, .3]], tags: ['lobster', 'crab', 'claw', 'pincer', 'crusher']}, () => {
    const W = o.W, palm = loft(Sy([[-.05, .22, .2, .2, 2.3], [.35, W * .8, .3 * o.t, .3 * o.t, 2.5], [.9, W, .36 * o.t, .36 * o.t, 2.5], [1.35, W * .82, .3 * o.t, .3 * o.t, 2.4], [1.6, W * .5, .2 * o.t, .2 * o.t, 2.3]]), {axis: 'y', rad: 26, per: 4, noise: [.012, 4]});
    const fx = K.taper(new T.CatmullRomCurve3([V3(-W * .45, 1.3, 0), V3(-W * .62, 1.3 + o.L * .4, 0), V3(-W * .45, 1.3 + o.L * .8, 0), V3(-W * .05, 1.3 + o.L, 0)]), t => (.3 - .26 * t) * o.t, 0, 20, 10, .8);
    const th = K.taper(new T.CatmullRomCurve3([V3(W * .5, 1.25, 0), V3(W * .82, 1.25 + o.L * .38, 0), V3(W * .62, 1.25 + o.L * .78, 0), V3(W * .12, 1.25 + o.L * .98, 0)]), t => (.26 - .22 * t) * o.t, 0, 20, 10, .8);
    const teeth = []; for (let k = 0; k < o.n; k++) { const t = .2 + k * (.6 / o.n); teeth.push(ell(.07 * o.k, .07 * o.k, .09 * o.k, -W * .4 + t * W * .2 + .12, 1.3 + o.L * t, 0, 8), ell(.06 * o.k, .06 * o.k, .08 * o.k, W * .55 - t * W * .25 - .1, 1.28 + o.L * t, 0, 8)); }
    const knob = ell(.16, .16, .2, W * .5, 1.25, 0, 10);
    return [P(merge([palm, fx, th, knob]), SH), P(merge(teeth), SD)]; });
  lobClaw('ks_lob_claw', 'Lobster crusher claw (fat)', {W: .62, L: 1.3, t: 1.15, n: 4, k: 1.5});
  lobClaw('ks_lob_claw_cut', 'Lobster cutter claw (slim)', {W: .46, L: 1.6, t: .9, n: 7, k: .8});
  // claw arm: three chunky jointed pieces
  add('ks_lob_arm', 'Arms & Shoulders', '🦞 Lobster', 'Lobster claw arm (jointed)', {fitKind: 'limb', tags: ['lobster', 'crab', 'arm', 'jointed']}, () => {
    const pc = (y0, L, r) => loft(Sy([[y0, r * .7, r * .7, r * .7, 2.4], [y0 + L * .3, r, r, r, 2.5], [y0 + L * .8, r * 1.05, r * 1.05, r * 1.05, 2.5], [y0 + L, r * .8, r * .8, r * .8, 2.4]]), {axis: 'y', rad: 18, per: 3});
    const sp = [1.5, 2.9].map(y => at(spike(.2, .06, .1), .2, y, 0, 0, 0, -70));
    return [P(merge([pc(0, 1.5, .26), pc(1.45, 1.4, .3), pc(2.8, 1.2, .33)]), SH), P(merge([ell(.2, .12, .2, 0, 1.47, 0, 10), ell(.22, .12, .22, 0, 2.82, 0, 10), ...sp]), SD)]; });
  // walking leg: thin jointed leg ending in a point
  add('ks_lob_leg', 'Legs & Feet', '🦞 Lobster', 'Lobster walking leg', {fitKind: 'limb', tags: ['lobster', 'crab', 'leg', 'jointed', 'bug']}, () => {
    const pc = (y0, L, r0, r1) => K.taper(K.bez(V3(0, y0, 0), V3(0, y0 + L * .5, 0), V3(0, y0 + L, 0)), t => (r0 + (r1 - r0) * t) * (.8 + .2 * Math.sin(Math.PI * t)), 0, 10, 10);
    return [P(merge([ell(.34, .2, .34, 0, .08, 0, 12), pc(0, 1.6, .17, .14), pc(1.6, 1.7, .13, .1), pc(3.3, 1.0, .09, .025)]), SH), P(merge([ell(.11, .08, .11, 0, 1.6, 0, 8), ell(.085, .07, .085, 0, 3.3, 0, 8)]), SD)]; });
  // long whip feeler with rings
  add('ks_lob_antenna', 'Tentacles & Extra Limbs', '🦞 Lobster', 'Lobster antenna (long whip)', {fitKind: 'limb', tags: ['lobster', 'antenna', 'feeler', 'whip']}, () => {
    const c = K.bez(V3(), V3(.05, 2.4, .25), V3(-.1, 5, -.3)), rings = []; for (let i = 1; i < 14; i++) { const p = c.getPointAt(i / 15); rings.push(ell(.055 * (1 - i / 17), .025, .055 * (1 - i / 17), p.x, p.y, p.z, 8)); }
    return [P(merge([K.taper(c, .05, .008, 30, 8), ell(.15, .22, .15, 0, .1, 0, 10)]), SH), P(merge(rings), SD)]; });
  return out;
});
