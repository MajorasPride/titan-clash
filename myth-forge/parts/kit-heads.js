// Mythic Forge — HEAD KIT (Nov 9 2026, test page). Original designs, made in code (ours).
// Every upper skull comes with a matching lower jaw that clicks into its 🔌 jaw hinge, and plugs for
// eyes, horns, ears, brow, nose, crest, upper teeth, fangs and mane. Jaws have plugs for teeth, fangs, tongue and chin.
// Head frame: neck joint at the origin, +Y up, face toward +Z (same as every other head). Jaw origin = hinge.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const X = window.makeKit(T, K), {loft, ell, spike, at, merge, plug, pair, P, V3} = X;
  const out = [];
  // sections given as [z, halfWidth, yTop, yBottom, squareness]
  const S = rows => rows.map(([a, w, yt, yb, n]) => ({a, w, t: (yt - yb) / 2, b: (yt - yb) / 2, y: (yt + yb) / 2, n: n || 2.4}));
  function headPair(c) {
    const up = c.upper, jw = c.jaw, H = c.hinge, mouthLen = c.mouthLen || 1.6;
    const plugs = [plug('jaw', 'jaw', H, [0, -1, 0], 'frame'), ...pair('eye', 'eye', c.eye, c.eyeDir || [.7, .3, .55], 'frame', {s: (c.eyeS || .85) * .62, sink: .12}),
      ...pair('horn', 'horn', c.horn, c.hornDir || [.35, .9, -.35], 'out', {s: c.hornS || .75}), plug('hornC', 'horn', c.hornC || [0, c.horn[1] + .02, c.brow[2] + .15], [0, 1, .25], 'out', {s: .6, opt: 1}),
      ...pair('ear', 'ear', c.ear, [1, .45, -.2], 'out', {s: c.earS || .8}), plug('brow', 'brow', c.brow, [0, 0, 1], 'frame', {s: c.browS || .85}),
      plug('nose', 'nose', c.nose, [0, 0, 1], 'frame', {s: c.noseS || .7}), plug('crest', 'crest', c.crest, [0, 1, -.35], 'out', {s: c.crestS || .8}),
      plug('teethU', 'teeth', [0, H[1] - .02, H[2] + .25], [0, -1, 0], 'frame', {s: mouthLen, r: [0, 0, 180]}),
      ...pair('fangU', 'fang', c.fang, [0, -1, .15], 'out', {s: c.fangS || .7}), plug('mane', 'mane', c.mane || [0, c.horn[1] * .55, (c.upper ? c.upper[0][0] : -.6) + .1], [0, 0, -1], 'frame', {s: c.maneS || .55}),
      ...pair('cheek', 'cheek', c.cheek || [c.eye[0] * .9, c.eye[1] * .55, c.eye[2] + .55], [1, 0, .3], 'out', {s: .6}),
      plug('back1', 'back', [0, c.crest[1] - .05, c.crest[2] - .1], [0, .6, -1], 'out', {s: .5}), plug('crown', 'crown', [0, c.crest[1] + .02, (c.brow[2] + c.crest[2]) / 2], [0, 1, 0], 'frame', {s: .9})];
    const jplugs = [plug('teeth', 'teeth', [0, jw.rim || .04, .25], [0, 1, 0], 'frame', {s: mouthLen}), ...pair('fang', 'fang', c.fangJ || [c.fang[0], .04, mouthLen + .05], [0, 1, .1], 'out', {s: (c.fangS || .7) * .85}),
      plug('tongue', 'tongue', [0, (jw.rim || .04) - .06, .15], [0, 0, 1], 'frame', {s: mouthLen * .6}), plug('chin', 'chin', [0, jw.chin || -.25, mouthLen + .15], [0, -.6, .8], 'frame', {s: .7})];
    // humanoid skulls are stacked bottom to top (upperY rows: [y, halfWidth, front(+Z), back(-Z), squareness]) so the face profile can be shaped; snouted heads are lofted back to front (upper)
    const upGeo = () => { const gs = [c.upperY ? loft(c.upperY.map(([a, w, t, b, n]) => ({a, w, t, b: b ?? t, n: n || 2.3})), {axis: 'y', rad: 36, per: 5, noise: c.noise || [.012, 5]}) : loft(S(up), {rad: 32, per: 5, noise: c.noise || [.012, 5]})]; if (c.extra) gs.push(...c.extra()); return gs; };
    out.push({id: 'kh_' + c.id, group: 'Heads & Skulls', sub: '🔌 Plug heads', name: c.name + ' (upper)', tags: ['kit', 'plug', 'upper skull', ...(c.tags || [])], upperOnly: true, jawFor: 'kh_' + c.id + '_jaw', plugs, kit: c.kit,
      make: () => upGeo().map((g, i) => P(g, i ? ((c.extraMats || [])[i - 1] || c.extraMat || c.mat) : c.mat))});
    out.push({id: 'kh_' + c.id + '_jaw', group: 'Jaws & Teeth', sub: 'Lower Jaws', name: c.name + ' jaw', tags: ['kit', 'plug', 'jaw', ...(c.tags || [])], plugAs: 'jaw', plugs: jplugs, kit: c.kit, upperFor: 'kh_' + c.id,
      make: () => [P(loft(S(jw.secs), {rad: 28, per: 5, noise: c.noise || [.012, 5]}), c.jawMat || c.mat), ...(jw.extra ? jw.extra().map(g => P(g, jw.extraMat || 'tooth')) : [])]});
  }
  // ---- dragon: long, sleek, ridged brow
  headPair({id: 'dragon', name: 'Dragon head', kit: 'dragon', mat: 'scale', tags: ['dragon', 'wyvern', 'hydra'],
    upper: [[-.6, .42, .9, .3], [-.25, .58, 1.12, .2], [.3, .58, 1.18, .16], [.85, .48, 1.0, .15, 2.6], [1.4, .38, .8, .14, 2.8], [1.95, .3, .64, .15, 2.8], [2.28, .2, .5, .2, 2.4]],
    jaw: {secs: [[-.05, .4, .06, -.22], [.4, .4, .06, -.27], [1.0, .33, .06, -.24], [1.6, .26, .06, -.18], [2.05, .17, .06, -.12]]},
    hinge: [0, .2, .05], mouthLen: 1.75, eye: [.46, .98, .62], brow: [0, 1.12, .62], horn: [.36, 1.14, -.05], ear: [.55, .92, -.3], nose: [0, .66, 2.1], crest: [0, 1.15, -.35], fang: [.2, .17, 1.85],
    extra: () => [merge([ell(.2, .09, .32, .38, 1.12, .58), ell(.2, .09, .32, -.38, 1.12, .58)]), merge([spike(.5, .09, .4, 0), ...[0, 1, 2].map(i => at(spike(.38 - i * .08, .07, .5), 0, 1.0 - i * .05, -.55 - i * .25, -60))].map((g, i) => i ? g : at(g, 0, 1.16, -.15, -55)))]});
  // ---- kaiju: deep, blunt, heavy jaw (tyrant-like, original)
  headPair({id: 'kaiju', name: 'Kaiju head', kit: 'kaiju', mat: 'scale', tags: ['kaiju', 'dinosaur', 'tyrant'],
    upper: [[-.65, .55, 1.0, .35, 2.2], [-.2, .72, 1.3, .2, 2.4], [.4, .7, 1.36, .14, 2.6], [1.0, .6, 1.18, .12, 2.8], [1.6, .5, .95, .12, 3], [2.05, .42, .78, .16, 3], [2.3, .3, .62, .24, 2.4]],
    jaw: {secs: [[-.05, .56, .06, -.35], [.5, .58, .06, -.45], [1.1, .52, .06, -.42], [1.7, .43, .06, -.33], [2.15, .3, .06, -.2]], chin: -.4},
    hinge: [0, .2, .05], mouthLen: 1.9, eye: [.58, 1.12, .7], brow: [0, 1.3, .7], horn: [.45, 1.3, .05], ear: [.68, 1.05, -.3], nose: [0, .8, 2.2], crest: [0, 1.32, -.3], fang: [.3, .17, 1.95], hornS: .8,
    extra: () => [merge([ell(.26, .12, .36, .45, 1.28, .72), ell(.26, .12, .36, -.45, 1.28, .72)])]});
  // ---- beast (wolf-like)
  headPair({id: 'beast', name: 'Beast head', kit: 'beast', mat: 'fur', tags: ['wolf', 'beast', 'dog'],
    upper: [[-.55, .5, 1.05, .25, 2.2], [-.1, .66, 1.4, .2, 2.2], [.45, .58, 1.36, .2, 2.3], [.95, .36, .98, .18, 2.5], [1.5, .27, .74, .17, 2.6], [1.95, .2, .62, .2, 2.4]],
    jaw: {secs: [[-.05, .38, .05, -.2], [.5, .32, .05, -.24], [1.1, .24, .05, -.2], [1.75, .16, .05, -.13]]},
    hinge: [0, .22, .1], mouthLen: 1.55, eye: [.4, 1.1, .8], eyeDir: [.72, .25, .65], eyeS: .58, brow: [0, 1.26, .75], horn: [.32, 1.38, .1], ear: [.42, 1.36, -.05], earS: .9, nose: [0, .74, 1.95], crest: [0, 1.4, -.2], fang: [.17, .2, 1.6],
    extraMats: ['fur', 'rubber'], extra: () => [merge([-1, 1].map(sd => at(ell(.2, .07, .26, 0, 0, 0), sd * .36, 1.25, .8, 0, sd * 28, sd * -14))), merge([ell(.13, .1, .11, 0, .66, 1.97), ell(.05, .04, .05, .07, .64, 2.05), ell(.05, .04, .05, -.07, .64, 2.05)])]});
  // ---- big cat: round skull, short muzzle
  headPair({id: 'cat', name: 'Big cat head', kit: 'beast', mat: 'fur', tags: ['lion', 'cat', 'tiger', 'chimera', 'sphinx'],
    upper: [[-.55, .58, 1.1, .3, 2.1], [-.1, .78, 1.5, .2, 2.1], [.45, .72, 1.5, .18, 2.2], [.9, .5, 1.12, .18, 2.3], [1.3, .38, .9, .2, 2.4], [1.55, .28, .78, .24, 2.2]],
    jaw: {secs: [[-.05, .44, .05, -.24], [.5, .38, .05, -.3], [1.0, .28, .05, -.25], [1.4, .18, .05, -.16]]},
    hinge: [0, .22, .1], mouthLen: 1.25, eye: [.42, 1.2, .82], eyeDir: [.45, .25, .85], eyeS: .64, extraMats: ['fur', 'rubber'], extra: () => [merge([-1, 1].map(sd => at(ell(.22, .07, .24, 0, 0, 0), sd * .4, 1.36, .84, 0, sd * 20, sd * -12))), merge([ell(.13, .09, .1, 0, .84, 1.58)])], brow: [0, 1.36, .78], horn: [.4, 1.46, .1], ear: [.55, 1.36, -.05], earS: .85, nose: [0, .9, 1.55], crest: [0, 1.5, -.2], fang: [.2, .2, 1.3], fangS: .85, mane: [0, .75, -.45], maneS: .5});
  // ---- crocodile: long, flat
  headPair({id: 'croc', name: 'Crocodile head', kit: 'sea', mat: 'scale', tags: ['croc', 'gator', 'reptile', 'turtle'],
    upper: [[-.5, .5, .75, .2, 2.6], [0, .58, .82, .14, 2.8], [.6, .48, .7, .12, 3.2], [1.3, .36, .55, .12, 3.4], [2.0, .3, .46, .12, 3.4], [2.5, .26, .42, .14, 3], [2.72, .18, .36, .18, 2.4]],
    jaw: {secs: [[-.05, .5, .04, -.18], [.6, .42, .04, -.2], [1.4, .3, .04, -.15], [2.2, .26, .04, -.12], [2.62, .18, .04, -.1]], chin: -.15},
    hinge: [0, .16, .05], mouthLen: 2.35, eye: [.47, .85, .52], eyeDir: [.8, .4, .42], eyeS: .7, brow: [0, .9, .45], horn: [.35, .84, .0], hornS: .55, ear: [.5, .7, -.2], earS: .5, nose: [0, .46, 2.6], crest: [0, .85, -.25], fang: [.22, .14, 2.2], fangS: .6,
    extra: () => [merge([ell(.18, .12, .2, .32, .82, .45), ell(.18, .12, .2, -.32, .82, .45), ell(.17, .075, .2, 0, .4, 2.5), ell(.05, .04, .06, .07, .45, 2.56), ell(.05, .04, .06, -.07, .45, 2.56),
      ...[-.3, 0, .3].flatMap(x => [0, 1].map(i => ell(.13, .05, .13, x, .8 - Math.abs(x) * .12, -.28 + i * .3))), ...[.9, 1.3, 1.7, 2.1].flatMap(z => [-1, 1].map(sd => ell(.05, .03, .12, sd * (.19 - z * .03), .58 - z * .055, z)))])]});
  // ---- bird / griffin: hooked upper beak
  headPair({id: 'bird', name: 'Bird head (beak)', kit: 'beast', mat: 'feather', extraMat: 'horn', jawMat: 'horn', tags: ['bird', 'eagle', 'griffin', 'hippogriff', 'beak'],
    upper: [[-.5, .5, 1.15, .3, 2.1], [-.05, .64, 1.35, .25, 2.1], [.45, .5, 1.18, .25, 2.2], [.75, .3, .9, .28, 2.2]],
    jaw: {secs: [[-.05, .3, .05, -.12], [.5, .24, .05, -.14], [1.0, .14, .05, -.1], [1.25, .05, .04, -.05]], chin: -.1},
    hinge: [0, .28, .25], mouthLen: 1.1, eye: [.42, 1.0, .55], eyeDir: [.85, .2, .4], eyeS: .7, brow: [0, 1.25, .55], horn: [.3, 1.32, .0], hornS: .6, ear: [.5, 1.1, -.2], earS: .6, nose: [0, .95, .95], crest: [0, 1.36, -.15], fang: [.12, .25, 1.0], fangS: .4,
    extra: () => [loft(S([[.6, .3, .95, .3, 2], [1.0, .2, .86, .26, 2.2], [1.35, .12, .66, .18, 2.2], [1.55, .06, .4, .02, 2], [1.58, .02, .12, -.12, 2]]), {rad: 20, per: 4})]});
  // ---- turtle: short, beaked, snapping
  headPair({id: 'turtle', name: 'Snapping turtle head', kit: 'sea', mat: 'skin', extraMat: 'horn', jawMat: 'horn', tags: ['turtle', 'snapping', 'beak', 'tortoise'],
    upper: [[-.5, .52, .95, .25, 2.4], [0, .62, 1.05, .2, 2.4], [.6, .54, .98, .18, 2.6], [1.15, .4, .8, .2, 2.6], [1.45, .3, .7, .24, 2.4]],
    jaw: {secs: [[-.05, .5, .05, -.25], [.6, .44, .05, -.3], [1.2, .3, .05, -.24], [1.55, .14, .08, -.16]], chin: -.3},
    hinge: [0, .2, .05], mouthLen: 1.3, eye: [.42, .9, .85], eyeDir: [.75, .3, .55], eyeS: .65, brow: [0, 1.0, .85], horn: [.35, 1.02, .2], hornS: .55, ear: [.55, .8, -.1], earS: .5, nose: [0, .78, 1.45], crest: [0, 1.05, -.2], fang: [.15, .2, 1.4], fangS: .4,
    extra: () => [loft(S([[1.1, .38, .82, .22, 2.4], [1.4, .3, .76, .2, 2.4], [1.62, .12, .62, .04, 2], [1.68, .04, .3, -.1, 2]]), {rad: 20, per: 4})]});
  // ---- ogre / brute (reworked Nov 9): wide heavy face, thick brow, big underbite jaw for tusks (id stays kh_brute so old saves still open)
  headPair({id: 'brute', name: 'Ogre head', kit: 'kaiju', mat: 'skin', tags: ['ogre', 'troll', 'humanoid', 'brute', 'giant'],
    upperY: [[.26, .6, .78, .3], [.5, .7, .86, .52], [.82, .73, .8, .7], [1.06, .71, .88, .78], [1.27, .63, .62, .77], [1.5, .47, .36, .6], [1.66, .2, .12, .3]],
    jaw: {secs: [[-.1, .62, .05, -.28], [.35, .72, .06, -.44, 2.8], [.75, .64, .07, -.48, 3], [1.0, .44, .07, -.38, 2.8]], chin: -.46, extra: () => [merge([-1, 1].map(sd => at(spike(.62, .11, -.35, sd * .12), sd * .42, .02, .86)))]},
    hinge: [0, .3, .0], mouthLen: .92, eye: [.31, .9, .84], eyeDir: [.22, .02, 1], eyeS: .8, brow: [0, 1.08, .86], horn: [.42, 1.42, .1], hornS: .7, ear: [.74, .86, -.05], earS: .85, nose: [0, .5, .92], noseS: .6, crest: [0, 1.66, -.15], fang: [.34, .3, .8], fangJ: [.4, .07, .9], fangS: .75,
    extra: () => [merge([ell(.34, .1, .2, .34, 1.17, .76), ell(.34, .1, .2, -.34, 1.17, .76), ell(.17, .2, .2, 0, .68, .86), ell(.13, .1, .12, .12, .58, .9), ell(.13, .1, .12, -.12, .58, .9), ell(.1, .22, .16, .72, .9, -.02), ell(.1, .22, .16, -.72, .9, -.02)])]});
  // ---- human / giant: clean humanoid head (angels, centaurs, elemental giants, gods)
  headPair({id: 'human', name: 'Giant head (humanoid)', kit: 'kaiju', mat: 'skin', tags: ['human', 'giant', 'angel', 'centaur', 'titan', 'god', 'humanoid'],
    upperY: [[.28, .38, .6, .28], [.48, .49, .67, .48], [.78, .55, .65, .68], [1.02, .57, .69, .74], [1.3, .56, .62, .75], [1.56, .45, .42, .6], [1.72, .2, .16, .3]],
    jaw: {secs: [[-.1, .38, .04, -.2], [.3, .42, .04, -.3], [.52, .34, .04, -.3, 2.6], [.64, .2, .04, -.24, 2.6]], chin: -.28},
    hinge: [0, .3, .0], mouthLen: .62, eye: [.24, .86, .6], eyeDir: [.18, .02, 1], eyeS: .72, brow: [0, 1.0, .7], horn: [.34, 1.5, .15], hornS: .6, ear: [.57, .8, -.05], earS: .6, nose: [0, .5, .72], noseS: .45, crest: [0, 1.72, -.15], fang: [.18, .3, .6], fangS: .35,
    extra: () => [merge([ell(.22, .06, .12, .25, 1.0, .62), ell(.22, .06, .12, -.25, 1.0, .62), at(ell(.1, .22, .16, 0, 0, 0), 0, .7, .72, -14), ell(.11, .07, .09, 0, .56, .76), ell(.07, .17, .12, .57, .82, -.02), ell(.07, .17, .12, -.57, .82, -.02), ell(.2, .05, .08, 0, .36, .6)])]});
  // ---- ape: low skull with a crest, heavy brow, long muzzle
  headPair({id: 'ape', name: 'Ape head', kit: 'beast', mat: 'fur', extraMat: 'skin', jawMat: 'skin', tags: ['ape', 'gorilla', 'kong', 'monkey', 'beast giant'],
    upperY: [[.28, .5, .96, .3], [.5, .58, 1.02, .5], [.72, .62, .8, .66], [.95, .66, .74, .76], [1.12, .64, .8, .78], [1.3, .55, .5, .78], [1.54, .36, .2, .62], [1.68, .14, .02, .42]],
    jaw: {secs: [[-.1, .5, .04, -.24], [.4, .56, .05, -.38], [.82, .5, .05, -.4, 2.8], [1.04, .34, .05, -.3, 2.6]], chin: -.4},
    hinge: [0, .3, .0], mouthLen: .98, eye: [.27, .93, .78], eyeDir: [.18, 0, 1], eyeS: .68, brow: [0, 1.12, .78], horn: [.38, 1.4, .0], hornS: .6, ear: [.67, .92, -.1], earS: .7, nose: [0, .62, 1.0], noseS: .6, crest: [0, 1.68, -.3], fang: [.3, .3, .88], fangS: .7,
    extra: () => [merge([ell(.5, .22, .3, 0, .47, .74), ell(.6, .09, .14, 0, 1.15, .74), ell(.12, .08, .1, .1, .66, 1.0), ell(.12, .08, .1, -.1, .66, 1.0), ell(.08, .2, .16, .66, .92, -.08), ell(.08, .2, .16, -.66, .92, -.08)])]});
  // ---- golem: carved boulder head, slab brow, block jaw
  headPair({id: 'golem', name: 'Golem head (stone)', kit: 'kaiju', mat: 'stone', tags: ['golem', 'stone', 'statue', 'construct', 'elemental'], noise: [.045, 2.6],
    upperY: [[.26, .52, .62, .46, 3.6], [.6, .64, .7, .62, 3.6], [1.0, .68, .74, .68, 3.4], [1.3, .62, .6, .64, 3.2], [1.52, .42, .38, .44, 3]],
    jaw: {secs: [[-.1, .54, .04, -.3, 3.6], [.35, .6, .05, -.4, 3.6], [.74, .52, .05, -.36, 3.4]], chin: -.4},
    hinge: [0, .3, .0], mouthLen: .68, eye: [.3, .9, .76], eyeDir: [.1, 0, 1], eyeS: .7, brow: [0, 1.1, .76], horn: [.44, 1.4, .1], hornS: .7, ear: [.68, .9, 0], earS: .6, nose: [0, .56, .76], noseS: .5, crest: [0, 1.52, -.1], fang: [.3, .3, .6], fangS: .5,
    extra: () => [merge([at(new T.BoxGeometry(1.34, .22, .34), 0, 1.13, .62, 8), at(new T.BoxGeometry(.24, .4, .26), 0, .72, .76, -10), at(new T.BoxGeometry(.3, .5, .5), .72, .8, .1, 0, 0, -8), at(new T.BoxGeometry(.3, .5, .5), -.72, .8, .1, 0, 0, 8)])]});
  // ---- skull: bare humanoid skull with dark sockets (undead, reapers, bone titans)
  headPair({id: 'skull', name: 'Giant skull', kit: 'kaiju', mat: 'bone', extraMats: ['mouthdark', 'bone'], tags: ['skull', 'undead', 'skeleton', 'reaper', 'bone', 'lich'],
    upperY: [[.26, .32, .58, .18], [.46, .42, .64, .4], [.68, .56, .6, .62], [.95, .57, .67, .72], [1.25, .58, .63, .76], [1.52, .46, .42, .62], [1.69, .2, .16, .3]],
    jaw: {secs: [[-.12, .46, .03, -.1], [.25, .46, .04, -.2, 2.8], [.5, .36, .04, -.24, 2.8], [.66, .22, .04, -.2, 2.6]], chin: -.22},
    hinge: [0, .3, .0], mouthLen: .6, eye: [.24, .88, .5], eyeDir: [.15, 0, 1], eyeS: .5, brow: [0, 1.04, .68], horn: [.34, 1.5, .15], hornS: .6, ear: [.56, .8, -.05], earS: .5, nose: [0, .5, .7], noseS: .4, crest: [0, 1.69, -.15], fang: [.18, .3, .58], fangS: .4,
    extra: () => [merge([ell(.17, .17, .12, .24, .88, .56), ell(.17, .17, .12, -.24, .88, .56), at(ell(.07, .13, .08, 0, 0, 0), .04, .6, .62, 0, 0, -12), at(ell(.07, .13, .08, 0, 0, 0), -.04, .6, .62, 0, 0, 12)]),
      merge([ell(.26, .06, .12, .26, 1.07, .6), ell(.26, .06, .12, -.26, 1.07, .6), ell(.1, .14, .22, .55, .7, .3), ell(.1, .14, .22, -.55, .7, .3)])]});
  // ---- serpent: wedge head
  headPair({id: 'serpent', name: 'Serpent head', kit: 'sea', mat: 'scale', tags: ['snake', 'serpent', 'naga', 'viper', 'sea serpent'],
    upper: [[-.45, .45, .7, .2, 2.4], [0, .62, .82, .15, 2.6], [.6, .56, .78, .13, 2.8], [1.2, .4, .66, .14, 2.8], [1.65, .26, .52, .18, 2.4]],
    jaw: {secs: [[-.05, .55, .04, -.18], [.6, .44, .04, -.2], [1.2, .3, .04, -.15], [1.6, .16, .04, -.1]], chin: -.15},
    hinge: [0, .17, .05], mouthLen: 1.45, eye: [.46, .7, .75], eyeDir: [.85, .35, .35], eyeS: .6, brow: [0, .82, .75], horn: [.4, .8, .1], hornS: .55, ear: [.6, .6, -.1], earS: .6, nose: [0, .55, 1.65], crest: [0, .84, -.15], fang: [.18, .14, 1.4], fangS: .75});
  // ---- bug: round head, mandibles click into the jaw plug, antennae on top
  headPair({id: 'bug', name: 'Bug head', kit: 'bug', mat: 'chitin', tags: ['bug', 'insect', 'ant', 'wasp', 'mantis', 'beetle'],
    upper: [[-.5, .5, .9, .1, 2.2], [-.1, .74, 1.25, .05, 2.2], [.4, .72, 1.25, .05, 2.3], [.8, .5, 1.0, .1, 2.4], [1.0, .3, .75, .2, 2.2]],
    jaw: {secs: [[-.05, .3, .04, -.1], [.3, .26, .04, -.12], [.55, .14, .04, -.08]]},
    hinge: [0, .18, .7], mouthLen: .5, eye: [.62, .78, .35], eyeDir: [1, .2, .3], eyeS: 1.15, brow: [0, 1.15, .7], horn: [.25, 1.24, .45], hornDir: [.3, .9, .3], hornS: .6, ear: [.6, 1.1, -.1], earS: .5, nose: [0, .9, .98], crest: [0, 1.25, -.1], fang: [.3, .12, .95], fangS: .5});
  // ======== Nov 10 2026: heads for the new creature families (all original, made in code) ========
  // ---- rot dragon: a dragon SKULL (undead dragons). Dark eye sockets, nose holes, cracked brow horns, scraps of flesh still on the cheeks
  headPair({id: 'rotdragon', name: 'Undead dragon skull', kit: 'dragon', mat: 'bone', jawMat: 'bone', extraMats: ['mouthdark', 'bone', 'flesh'], tags: ['dragon', 'undead', 'zombie', 'skull', 'bone', 'lich', 'rot'],
    upper: [[-.6, .4, .86, .32], [-.25, .56, 1.08, .24], [.3, .56, 1.12, .2], [.8, .44, .93, .2, 2.6], [1.4, .34, .72, .19, 2.8], [1.95, .27, .58, .19, 2.8], [2.3, .18, .47, .24, 2.4]],
    jaw: {secs: [[-.05, .4, .05, -.13], [.4, .38, .05, -.16], [1.0, .3, .05, -.14], [1.6, .23, .05, -.11], [2.05, .15, .05, -.07]], extraMat: 'bone',
      extra: () => [merge([-1, 1].map(sd => at(spike(.42, .07, .3, 0, 8, 8), sd * .4, -.1, .1, 150, 0, sd * 12)))]},
    hinge: [0, .22, .05], mouthLen: 1.75, eye: [.45, .93, .6], eyeS: .55, eyeDir: [.75, .2, .6], brow: [0, 1.1, .6], horn: [.36, 1.1, -.08], hornS: .9, ear: [.55, .9, -.3], nose: [0, .62, 2.1], crest: [0, 1.12, -.36], fang: [.2, .19, 1.85],
    extra: () => [merge([ell(.2, .17, .2, .45, .93, .6), ell(.2, .17, .2, -.45, .93, .6), ell(.07, .05, .15, .09, .56, 2.08), ell(.07, .05, .15, -.09, .56, 2.08), ell(.1, .2, .16, .5, .62, .1), ell(.1, .2, .16, -.5, .62, .1)]),
      merge([...[-1, 1].flatMap(sd => [at(ell(.24, .08, .34, 0, 0, 0), sd * .4, 1.1, .56, 0, sd * 10, sd * -18), at(spike(.75, .09, .35, 0, 10, 8), sd * .52, .78, -.3, -105, sd * -20, 0), at(spike(.4, .06, .3, 0, 8, 8), sd * .5, .55, -.15, -120, sd * -30, 0)]),
        ...[0, 1, 2, 3].map(i => at(spike(.42 - i * .07, .07, .4, 0, 8, 8), 0, 1.1 - i * .04, -.2 - i * .22, -50 - i * 6))]),
      K.noise(merge([at(ell(.22, .16, .05, 0, 0, 0), .5, .62, .72, 0, 70, 0), at(ell(.18, .22, .05, 0, 0, 0), -.52, .7, .3, 0, -80, 0), at(ell(.2, .1, .3, 0, 0, 0), .12, 1.13, .2, 0, 0, 8), at(ell(.14, .05, .3, 0, 0, 0), -.2, .86, 1.3, 0, 0, -25)]), .03, 6)]});
  // ---- demon: broad horned face, heavy angry brow, sharp cheekbones, long pointed chin
  headPair({id: 'demon', name: 'Demon head', kit: 'kaiju', mat: 'skin', extraMats: ['skin', 'horn'], tags: ['demon', 'devil', 'fiend', 'oni', 'menacing', 'horned'],
    upperY: [[.2, .3, .6, .2], [.42, .44, .72, .42], [.66, .56, .7, .62], [.92, .6, .76, .72], [1.2, .6, .7, .76], [1.48, .5, .5, .64], [1.68, .24, .2, .32]],
    jaw: {secs: [[-.12, .47, .03, -.12], [.25, .46, .04, -.27, 2.6], [.52, .33, .04, -.36, 2.4], [.76, .14, .04, -.34, 2.2]], chin: -.34, extraMat: 'horn', extra: () => [at(spike(.3, .07, .2, 0, 8, 8), 0, -.3, .74, 160, 0, 0)]},
    hinge: [0, .3, .0], mouthLen: .66, eye: [.26, .9, .62], eyeDir: [.2, 0, 1], eyeS: .46, brow: [0, 1.08, .76], horn: [.4, 1.48, .12], hornDir: [.7, .75, -.1], hornS: 1.15, ear: [.6, .86, -.05], earS: .75, nose: [0, .56, .8], noseS: .4, crest: [0, 1.68, -.15], fang: [.2, .3, .64], fangS: .55,
    extra: () => [merge([...[-1, 1].flatMap(sd => [at(ell(.3, .09, .16, 0, 0, 0), sd * .27, 1.06, .68, 0, sd * 14, sd * -20), at(ell(.12, .09, .2, 0, 0, 0), sd * .5, .68, .42, 0, sd * 30, 0)]), at(ell(.1, .2, .13, 0, 0, 0), 0, .68, .74, -12, 0, 0), ell(.13, .07, .08, 0, .54, .76)]),
      merge([...[-2, -1, 0, 1, 2].map(i => at(spike(.2 - Math.abs(i) * .03, .05, .2, 0, 6, 6), i * .13, 1.6 - Math.abs(i) * .05, .05, -20, 0, i * -14))])]});
  // ---- goat: long face, flat forehead for the horns, a beard under the chin (chimera's second head, satyrs, beast-men)
  headPair({id: 'goat', name: 'Goat head', kit: 'beast', mat: 'fur', extraMats: ['rubber', 'horn'], tags: ['goat', 'ram', 'chimera', 'satyr', 'beast'],
    upper: [[-.5, .42, .98, .3, 2.2], [-.1, .52, 1.22, .22, 2.2], [.4, .46, 1.16, .2, 2.3], [.9, .33, .92, .2, 2.5], [1.4, .26, .74, .2, 2.6], [1.75, .2, .6, .25, 2.4]],
    jaw: {secs: [[-.05, .3, .05, -.16], [.5, .26, .05, -.2], [1.1, .2, .05, -.17], [1.6, .14, .05, -.12]], extraMat: 'fur', extra: () => [K.noise(at(spike(.7, .13, .25, 0, 10, 10), 0, -.14, 1.15, 172, 0, 0), .02, 5)]},
    hinge: [0, .22, .1], mouthLen: 1.4, eye: [.4, 1.0, .58], eyeDir: [.9, .2, .3], eyeS: .52, brow: [0, 1.18, .55], horn: [.22, 1.22, -.02], hornDir: [.3, .75, -.6], hornS: 1.1, ear: [.5, .98, -.22], earS: .95, nose: [0, .7, 1.72], crest: [0, 1.22, -.32], fang: [.13, .2, 1.45], fangS: .4,
    extra: () => [merge([ell(.13, .09, .1, 0, .6, 1.76), ell(.045, .035, .05, .07, .6, 1.84), ell(.045, .035, .05, -.07, .6, 1.84)]),
      merge([-1, 1].flatMap(sd => { const pts = [[sd * .2, 1.18, 0], [sd * .3, 1.75, -.25], [sd * .5, 2.1, -.75], [sd * .75, 2.1, -1.3], [sd * .95, 1.8, -1.7]].map(p => V3(...p)), c = K.cr(pts), gs = [K.taper(c, t => .15 * (1 - t * .9), 0, 20, 10)];
        for (let i = 1; i <= 7; i++) { const t = i / 9, q = c.getPointAt(t), g = new T.TorusGeometry(.15 * (1 - t * .9) * 1.05, .014, 5, 12); g.lookAt(c.getTangentAt(t)); gs.push(g.translate(q.x, q.y, q.z)); } return gs; }))]});
  // ---- raptor: narrow hunting snout, feather quills at the back of the skull
  headPair({id: 'raptor', name: 'Raptor head (feathered dinosaur)', kit: 'kaiju', mat: 'scale', extraMats: ['feather'], tags: ['raptor', 'dinosaur', 'feathered', 'hunter'],
    upper: [[-.5, .36, .84, .28], [-.15, .46, 1.02, .2], [.35, .44, 1.02, .18, 2.5], [.9, .32, .82, .17, 2.7], [1.5, .24, .63, .17, 2.8], [1.95, .16, .49, .2, 2.4]],
    jaw: {secs: [[-.05, .33, .05, -.18], [.5, .3, .05, -.2], [1.1, .23, .05, -.17], [1.75, .13, .05, -.1]]},
    hinge: [0, .2, .05], mouthLen: 1.5, eye: [.39, .88, .55], eyeS: .46, brow: [0, 1.02, .55], horn: [.3, 1.02, -.05], ear: [.45, .8, -.3], nose: [0, .6, 1.85], crest: [0, 1.04, -.3], fang: [.15, .17, 1.55],
    extra: () => [merge([-2, -1, 0, 1, 2].map(i => at(X.feather(.8 - Math.abs(i) * .1, .15, .1), i * .13, .96 - Math.abs(i) * .04, -.3, -84 - Math.abs(i) * 3, 0, i * -10)))]});
  // ---- pterosaur: very long toothless beak, a long blade crest sweeping back from the skull
  headPair({id: 'ptero', name: 'Pterosaur head (beak + crest)', kit: 'bird', mat: 'skin', extraMats: ['horn'], jawMat: 'horn', tags: ['pterosaur', 'pterodactyl', 'dinosaur', 'beak', 'flyer'],
    upper: [[-.5, .36, .82, .3], [-.1, .46, .97, .25], [.4, .4, .92, .25, 2.4], [1.0, .25, .68, .28, 2.4], [1.8, .16, .52, .3, 2.2], [2.6, .09, .42, .33, 2.2], [3.2, .035, .37, .34, 2]],
    jaw: {secs: [[-.05, .3, .05, -.12], [.6, .24, .05, -.14], [1.5, .14, .05, -.1], [2.4, .07, .05, -.07], [3.05, .03, .05, -.03]]},
    hinge: [0, .25, .05], mouthLen: 2.6, eye: [.37, .8, .42], eyeS: .5, brow: [0, .97, .4], horn: [.25, .97, -.1], hornS: .5, ear: [.42, .7, -.3], earS: .5, nose: [0, .5, 2.9], noseS: .4, crest: [0, .97, -.3], fang: [.08, .26, 2.4], fangS: .3,
    extra: () => [merge([at(spike(2.0, .2, .25, 0, 14, 10, .3), 0, .86, -.2, -72, 0, 0), at(loft([{a: .9, w: .13, t: .1, b: .1, y: .72}, {a: 2.0, w: .1, t: .08, b: .08, y: .58}, {a: 3.1, w: .04, t: .04, b: .04, y: .42}], {rad: 12, per: 3}), 0, 0, 0)])]});
  // ---- construct: a riveted war helm with a glowing visor slit instead of eyes, a fin crest on top (clockwork warriors, living statues)
  headPair({id: 'construct', name: 'Construct helm (visor)', kit: 'kaiju', mat: 'metal', jawMat: 'darkmetal', extraMats: ['glow', 'darkmetal'], noise: [0, 1], tags: ['construct', 'golem', 'automaton', 'clockwork', 'statue', 'armor', 'knight'],
    upperY: [[.2, .44, .6, .5, 3.2], [.5, .57, .67, .6, 3.2], [.9, .61, .7, .66, 3], [1.3, .59, .66, .66, 2.8], [1.6, .42, .44, .5, 2.6], [1.76, .16, .16, .2, 2.4]],
    jaw: {secs: [[-.12, .46, .03, -.14, 3.2], [.3, .46, .04, -.32, 3.2], [.64, .32, .04, -.32, 3]], chin: -.3, extraMat: 'metal', extra: () => [merge([-.24, 0, .24].map(x => new T.BoxGeometry(.05, .26, .05).translate(x, -.16, .62)))]},
    hinge: [0, .3, .0], mouthLen: .55, eye: [.24, .96, .62], eyeDir: [.15, 0, 1], eyeS: .4, brow: [0, 1.12, .7], horn: [.4, 1.5, .1], hornS: .8, ear: [.62, .9, -.05], earS: .6, nose: [0, .6, .7], noseS: .4, crest: [0, 1.76, -.15], fang: [.2, .3, .6], fangS: .4,
    extra: () => [merge([new T.BoxGeometry(.86, .09, .1).translate(0, .96, .66), new T.BoxGeometry(.07, .34, .1).translate(0, .78, .68)]),
      merge([K.extr([[-.75, 0], [-.45, .38], [.25, .46], [.7, .1], [.55, 0]], .07, .02).rotateY(-Math.PI / 2).translate(0, 1.66, 0), new T.BoxGeometry(1.3, .1, .16).translate(0, 1.16, .64), new T.TorusGeometry(.6, .05, 8, 28).rotateX(Math.PI / 2).translate(0, .42, .04),
        ...[-1, 1].flatMap(sd => [-.3, 0, .3].map(z => new T.SphereGeometry(.05, 8, 6).translate(sd * .6, 1.0, z)))])]});
  out.forEach(e => { if (e.plugs) for (const p of e.plugs) if (p.id === 'hornC' && e.id === 'kh_bug') { p.t = 'antenna'; } });
  // bug heads: antenna plugs
  const bug = out.find(e => e.id === 'kh_bug'); bug.plugs.push(...pair('ant', 'antenna', [.25, 1.22, .55], [.35, .85, .45], 'out', {s: .9}));

  // =================== small kit pieces that plug in ===================
  const add = (id, group, sub, name, plugAs, make, ex = {}) => out.push({id: 'kp_' + id, group, sub, name, tags: ['kit', 'plug', plugAs, ...(ex.tags || [])], plugAs, make, ...ex});
  // tooth rows: along +Z from 0 to 1 (scaled to the mouth by the plug), U-shaped, teeth point +Y
  const rowCurve = t => V3((.36 - .2 * t) * Math.cos(t * Math.PI * .5) * (t < .999 ? 1 : 1), 0, t);
  function toothRow(kind) { const gs = [], N = kind === 'needle' ? 14 : kind === 'molar' ? 6 : 9;
    for (const sd of [1, -1]) for (let i = 0; i < N; i++) { const t = i / (N - 1), x = sd * (.23 - .16 * t * t), z = .04 + t * .94, s = kind === 'molar' ? .6 : 1;
      let g; if (kind === 'molar') g = ell(.06, .05, .07, 0, .03, 0, 8); else if (kind === 'saw') g = spike(.12 + .05 * Math.sin(t * 9), .045, .05); else if (kind === 'needle') g = spike(.11, .018, .08); else g = spike(.09 + .08 * (t > .7 ? 1.4 : 1) * (1 - t * .3), .04, .2);
      gs.push(at(g, x, 0, z, 0, 0, 0, s)); }
    if (kind === 'fang') for (const sd of [1, -1]) gs.push(at(spike(.3, .06, .28), sd * .09, 0, .92));
    return merge(gs); }
  for (const [k, n] of [['fang', 'Fang row'], ['needle', 'Needle teeth row'], ['saw', 'Saw teeth row'], ['molar', 'Molar row']]) add('row_' + k, 'Jaws & Teeth', '🔌 Tooth rows', n, 'teeth', () => [P(toothRow(k), 'tooth')]);
  add('fang_hook', 'Jaws & Teeth', '🔌 Fangs', 'Hooked fang', 'fang', () => [P(spike(.55, .08, .35), 'tooth')]);
  add('fang_saber', 'Jaws & Teeth', '🔌 Fangs', 'Saber fang', 'fang', () => [P(K.taper(K.bez(V3(), V3(0, .5, .04), V3(0, 1.1, .2)), .1, .01, 14, 10, .55), 'tooth')]);
  add('fang_tusk', 'Jaws & Teeth', '🔌 Fangs', 'Tusk', 'fang', () => [P(spike(.9, .13, .6, .3), 'tooth')]);
  add('fang_venom', 'Jaws & Teeth', '🔌 Fangs', 'Venom fang (glow tip)', 'fang', () => [P(spike(.6, .07, .3), 'tooth'), P(at(ell(.03, .05, .03), 0, .58, -.17), 'glow')]);
  add('tongue_fork', 'Jaws & Teeth', '🔌 Tongues', 'Forked tongue', 'tongue', () => [P(merge([K.taper(K.bez(V3(), V3(0, .05, .5), V3(0, .02, .9)), .1, .05, 12, 10, .4), at(K.taper(K.bez(V3(), V3(.05, 0, .15), V3(.12, -.02, .3)), .045, .01, 8, 8, .5), 0, .02, .9), at(K.taper(K.bez(V3(), V3(-.05, 0, .15), V3(-.12, -.02, .3)), .045, .01, 8, 8, .5), 0, .02, .9)]), 'flesh')]);
  add('tongue_long', 'Jaws & Teeth', '🔌 Tongues', 'Long hanging tongue', 'tongue', () => [P(K.taper(K.bez(V3(), V3(0, .05, .7), V3(0, -.4, 1.3)), .16, .08, 16, 12, .35), 'flesh')]);
  add('tongue_maw', 'Jaws & Teeth', '🔌 Tongues', 'Toothed tongue (horror)', 'tongue', () => [P(K.taper(K.bez(V3(), V3(0, .05, .5), V3(0, .1, 1.0)), .14, .07, 14, 12, .5), 'flesh'), P(merge([0, 1, 2, 3].map(i => at(spike(.08, .03), 0, .08, .3 + i * .18))), 'tooth')], {horror: 1});
  // eyes made for plugs (centered, looking +Z)
  const eyeball = (r, pupil, iris = 'eye') => [P(ell(r, r, r, 0, 0, 0, 20), iris), P(ell(r * .45, pupil === 'slit' ? r * .8 : r * .45, r * .2, 0, 0, r * .9, 12), 'darkmetal')];
  add('eye_round', 'Eyes & Faces', '🔌 Eyes', 'Round eye', 'eye', () => eyeball(.26, 'round'));
  add('eye_slit', 'Eyes & Faces', '🔌 Eyes', 'Slit eye', 'eye', () => eyeball(.26, 'slit'));
  add('eye_glow', 'Eyes & Faces', '🔌 Eyes', 'Glowing eye', 'eye', () => [P(ell(.25, .2, .22, 0, 0, 0, 18), 'glow')]);
  add('eye_lidded', 'Eyes & Faces', '🔌 Eyes', 'Angry lidded eye', 'eye', () => [...eyeball(.24, 'slit'), P(at(ell(.32, .14, .3, 0, 0, 0, 16), 0, .16, .04, -18, 0, -12), 'scale')]);
  add('eye_bulge', 'Eyes & Faces', '🔌 Eyes', 'Bulging horror eye', 'eye', () => [...eyeball(.34, 'round'), P(merge([0, 1, 2, 3, 4].map(i => at(K.taper(K.bez(V3(), V3(.02, .1, .05), V3(.04, .2, .02)), .012, .004, 6, 5), Math.cos(i * 1.3) * .3, Math.sin(i * 1.3) * .3, -.05, 0, 0, i * 72))), 'flesh')], {horror: 1});
  add('eye_compound', 'Eyes & Faces', '🔌 Eyes', 'Compound eye', 'eye', () => [P(K.noise(ell(.34, .42, .32, 0, 0, 0, 24), .02, 30), 'darkmetal')]);
  // horns (base at origin, grow +Y, sweep back -Z)
  add('horn_swept', 'Horns & Crests', '🔌 Horns', 'Swept horn', 'horn', () => [P(spike(1.6, .2, .55, .1, 16, 12), 'horn')]);
  add('horn_short', 'Horns & Crests', '🔌 Horns', 'Short horn nub', 'horn', () => [P(spike(.6, .16, .15), 'horn')]);
  add('horn_hook', 'Horns & Crests', '🔌 Horns', 'Hooked horn', 'horn', () => [P(K.taper(K.bez(V3(), V3(.1, .9, -.6), V3(.2, 1.4, .3)), .2, .02, 16, 12), 'horn')]);
  add('horn_crystal', 'Horns & Crests', '🔌 Horns', 'Crystal horn', 'horn', () => [P(merge([new T.ConeGeometry(.18, 1.3, 6).translate(0, .65, 0), at(new T.ConeGeometry(.1, .7, 6).translate(0, .35, 0), .1, .1, 0, 0, 0, -25)]), 'crystal')]);
  add('horn_ridged', 'Horns & Crests', '🔌 Horns', 'Ridged ram horn', 'horn', () => [P(K.taper(K.bez(V3(), V3(.4, .6, -.4), V3(.6, -.1, -.6), V3(.5, -.4, .1)), t => .2 * (1 - t * .8) * (1 + .12 * Math.sin(t * 60)), 0, 40, 12), 'horn')]);
  // ears
  add('ear_point', 'Eyes & Faces', '🔌 Ears', 'Pointed ear', 'ear', () => [P(K.taper(K.bez(V3(), V3(0, .5, -.05), V3(0, .9, -.15)), .25, .02, 12, 10, .3), 'skin')]);
  add('ear_frill', 'Eyes & Faces', '🔌 Ears', 'Frill ear', 'ear', () => [P(X.panel([[0, 0], [.4, .5], [.2, .9], [-.1, .6]], .03), 'membrane')]);
  add('ear_round', 'Eyes & Faces', '🔌 Ears', 'Round ear', 'ear', () => [P(ell(.28, .3, .08, 0, .26, 0), 'fur')]);
  // brow, nose, cheek, chin, mane, crest, antenna
  add('brow_ridge', 'Eyes & Faces', '🔌 Face bits', 'Brow ridge', 'brow', () => [P(merge([ell(.28, .1, .2, .35, 0, 0), ell(.28, .1, .2, -.35, 0, 0)]), 'scale')]);
  add('brow_spikes', 'Eyes & Faces', '🔌 Face bits', 'Spiked brow', 'brow', () => [P(merge([-1, 1].flatMap(s => [0, 1, 2].map(i => at(spike(.3 - i * .06, .05, .5), s * (.2 + i * .14), 0, -.05, -60, 0, s * -20)))), 'horn')]);
  add('nose_horn', 'Eyes & Faces', '🔌 Face bits', 'Nose horn', 'nose', () => [P(at(spike(.7, .14, .25), 0, 0, 0, -20), 'horn')]);
  add('nose_nostrils', 'Eyes & Faces', '🔌 Face bits', 'Flared nostrils', 'nose', () => [P(merge([ell(.1, .07, .1, .12, 0, 0), ell(.1, .07, .1, -.12, 0, 0)]), 'darkmetal')]);
  add('cheek_spikes', 'Eyes & Faces', '🔌 Face bits', 'Cheek spikes', 'cheek', () => [P(merge([0, 1, 2].map(i => at(spike(.5 - i * .1, .06, .3), 0, 0, -i * .15, 0, -10 * i, 0))), 'horn')]);
  add('chin_barbels', 'Eyes & Faces', '🔌 Face bits', 'Chin barbels', 'chin', () => [P(merge([-1, 1].map(s => K.taper(K.bez(V3(s * .1, 0, 0), V3(s * .2, -.4, .1), V3(s * .1, -.9, .2)), .04, .01, 12, 6))), 'flesh')]);
  add('chin_beard', 'Eyes & Faces', '🔌 Face bits', 'Spiky beard', 'chin', () => [P(merge([-2, -1, 0, 1, 2].map(i => at(spike(.5 - Math.abs(i) * .08, .05, -.2), i * .1, 0, 0, 180 - i * 6))), 'horn')]);
  add('mane_spikes', 'Heads & Skulls', '🔌 Manes', 'Spike mane', 'mane', () => [P(merge([...Array(9).keys()].map(i => { const a = (i / 8 - .5) * 2.4; return at(spike(1.4, .12, .4), Math.sin(a) * .8, Math.cos(a) * .8, 0, -100, 0, -a * 57); })), 'horn')]);
  add('mane_fur', 'Heads & Skulls', '🔌 Manes', 'Fur ruff', 'mane', () => [P(K.noise(new T.TorusGeometry(1.15, .55, 12, 24).scale(1, 1.1, .7), .12, 3), 'fur')]);
  add('crest_fin', 'Horns & Crests', '🔌 Crests', 'Fin crest', 'crest', () => [P(X.panel([[0, 0], [.1, 1.1], [-.9, .4], [-1.1, 0]].map(([x, y]) => [x, y]), .04).rotateY(-Math.PI / 2), 'membrane')]);
  add('crest_spikes', 'Horns & Crests', '🔌 Crests', 'Spike crest', 'crest', () => [P(merge([0, 1, 2, 3].map(i => at(spike(.8 - i * .14, .1, .4), 0, 0, -i * .2, -i * 10))), 'horn')]);
  add('ant_straight', 'Eyes & Faces', '🔌 Antennae', 'Bug antenna', 'antenna', () => [P(K.taper(K.bez(V3(), V3(0, 1, .2), V3(0, 2, -.2)), .04, .02, 16, 6), 'chitin')]);
  add('ant_feather', 'Eyes & Faces', '🔌 Antennae', 'Feathery moth antenna', 'antenna', () => [P(merge([K.taper(K.bez(V3(), V3(0, .8, .1), V3(0, 1.6, -.2)), .035, .02, 14, 6), ...[...Array(10).keys()].flatMap(i => [-1, 1].map(s => at(K.taper(K.bez(V3(), V3(s * .12, .02, 0), V3(s * .24, -.06, 0)), .012, .004, 4, 4), 0, .25 + i * .13, -.02 * i)))]), 'fur')]);
  add('ant_club', 'Eyes & Faces', '🔌 Antennae', 'Clubbed antenna', 'antenna', () => [P(merge([K.taper(K.bez(V3(), V3(0, .7, .1), V3(0, 1.4, 0)), .035, .03, 12, 6), ell(.09, .2, .09, 0, 1.5, 0)]), 'chitin')]);
  // bug mandibles (jaw plug on bug heads)
  out.push({id: 'kp_mandibles', group: 'Jaws & Teeth', sub: 'Maws & Mandibles', name: 'Pincer mandibles', tags: ['kit', 'plug', 'jaw', 'bug'], plugAs: 'jaw', kit: 'bug',
    make: () => [P(merge([-1, 1].map(s => K.taper(K.bez(V3(s * .2, 0, 0), V3(s * .55, 0, .5), V3(s * .1, 0, .9)), .1, .02, 16, 8, .6))), 'chitin')]});
  return out;
});
