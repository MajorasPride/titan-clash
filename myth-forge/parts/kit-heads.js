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
      ...pair('fangU', 'fang', c.fang, [0, -1, .15], 'out', {s: c.fangS || .7}), plug('mane', 'mane', c.mane || [0, c.horn[1] * .55, c.upper[0][0] + .1], [0, 0, -1], 'frame', {s: c.maneS || .55}),
      ...pair('cheek', 'cheek', c.cheek || [c.eye[0] * .9, c.eye[1] * .55, c.eye[2] + .55], [1, 0, .3], 'out', {s: .6}),
      plug('back1', 'back', [0, c.crest[1] - .05, c.crest[2] - .1], [0, .6, -1], 'out', {s: .5}), plug('crown', 'crown', [0, c.crest[1] + .02, (c.brow[2] + c.crest[2]) / 2], [0, 1, 0], 'frame', {s: .9})];
    const jplugs = [plug('teeth', 'teeth', [0, jw.rim || .04, .25], [0, 1, 0], 'frame', {s: mouthLen}), ...pair('fang', 'fang', c.fangJ || [c.fang[0], .04, mouthLen + .05], [0, 1, .1], 'out', {s: (c.fangS || .7) * .85}),
      plug('tongue', 'tongue', [0, (jw.rim || .04) - .06, .15], [0, 0, 1], 'frame', {s: mouthLen * .6}), plug('chin', 'chin', [0, jw.chin || -.25, mouthLen + .15], [0, -.6, .8], 'frame', {s: .7})];
    const upGeo = () => { const gs = [loft(S(up), {rad: 32, per: 5, noise: c.noise || [.012, 5]})]; if (c.extra) gs.push(...c.extra()); return gs; };
    out.push({id: 'kh_' + c.id, group: 'Heads & Skulls', sub: '🔌 Plug heads', name: c.name + ' (upper)', tags: ['kit', 'plug', 'upper skull', ...(c.tags || [])], upperOnly: true, jawFor: 'kh_' + c.id + '_jaw', plugs, kit: c.kit,
      make: () => upGeo().map((g, i) => P(g, i ? (c.extraMat || c.mat) : c.mat))});
    out.push({id: 'kh_' + c.id + '_jaw', group: 'Jaws & Teeth', sub: 'Lower Jaws', name: c.name + ' jaw', tags: ['kit', 'plug', 'jaw', ...(c.tags || [])], plugAs: 'jaw', plugs: jplugs, kit: c.kit, upperFor: 'kh_' + c.id,
      make: () => [P(loft(S(jw.secs), {rad: 28, per: 5, noise: c.noise || [.012, 5]}), c.jawMat || c.mat)]});
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
    hinge: [0, .22, .1], mouthLen: 1.55, eye: [.38, 1.12, .78], eyeDir: [.55, .3, .75], brow: [0, 1.26, .75], horn: [.32, 1.38, .1], ear: [.42, 1.36, -.05], earS: .9, nose: [0, .74, 1.95], crest: [0, 1.4, -.2], fang: [.17, .2, 1.6]});
  // ---- big cat: round skull, short muzzle
  headPair({id: 'cat', name: 'Big cat head', kit: 'beast', mat: 'fur', tags: ['lion', 'cat', 'tiger', 'chimera', 'sphinx'],
    upper: [[-.55, .58, 1.1, .3, 2.1], [-.1, .78, 1.5, .2, 2.1], [.45, .72, 1.5, .18, 2.2], [.9, .5, 1.12, .18, 2.3], [1.3, .38, .9, .2, 2.4], [1.55, .28, .78, .24, 2.2]],
    jaw: {secs: [[-.05, .44, .05, -.24], [.5, .38, .05, -.3], [1.0, .28, .05, -.25], [1.4, .18, .05, -.16]]},
    hinge: [0, .22, .1], mouthLen: 1.25, eye: [.42, 1.2, .82], eyeDir: [.45, .25, .85], brow: [0, 1.36, .78], horn: [.4, 1.46, .1], ear: [.55, 1.36, -.05], earS: .85, nose: [0, .9, 1.55], crest: [0, 1.5, -.2], fang: [.2, .2, 1.3], fangS: .85, mane: [0, .75, -.45], maneS: .5});
  // ---- crocodile: long, flat
  headPair({id: 'croc', name: 'Crocodile head', kit: 'sea', mat: 'scale', tags: ['croc', 'gator', 'reptile', 'turtle'],
    upper: [[-.5, .5, .75, .2, 2.6], [0, .58, .82, .14, 2.8], [.6, .48, .7, .12, 3.2], [1.3, .36, .55, .12, 3.4], [2.0, .3, .46, .12, 3.4], [2.5, .26, .42, .14, 3], [2.72, .18, .36, .18, 2.4]],
    jaw: {secs: [[-.05, .5, .04, -.18], [.6, .42, .04, -.2], [1.4, .3, .04, -.15], [2.2, .26, .04, -.12], [2.62, .18, .04, -.1]], chin: -.15},
    hinge: [0, .16, .05], mouthLen: 2.35, eye: [.35, .86, .45], eyeDir: [.4, .8, .2], eyeS: .7, brow: [0, .9, .45], horn: [.35, .84, .0], hornS: .55, ear: [.5, .7, -.2], earS: .5, nose: [0, .46, 2.6], crest: [0, .85, -.25], fang: [.22, .14, 2.2], fangS: .6,
    extra: () => [merge([ell(.18, .12, .2, .32, .82, .45), ell(.18, .12, .2, -.32, .82, .45)])]});
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
  // ---- brute / ape: flat face, heavy brow (humanoids, kaiju-men, ogres)
  headPair({id: 'brute', name: 'Brute head', kit: 'kaiju', mat: 'skin', tags: ['ape', 'ogre', 'humanoid', 'brute', 'gorilla'],
    upper: [[-.55, .6, 1.5, .35, 2.1], [-.15, .74, 1.75, .25, 2.1], [.3, .72, 1.75, .22, 2.2], [.62, .6, 1.4, .25, 2.4], [.82, .45, 1.0, .3, 2.6]],
    jaw: {secs: [[-.05, .62, .05, -.3], [.4, .6, .05, -.4], [.8, .46, .05, -.4], [1.0, .3, .05, -.3]], chin: -.42},
    hinge: [0, .3, .1], mouthLen: .85, eye: [.36, 1.22, .62], eyeDir: [.3, .15, .95], eyeS: .7, brow: [0, 1.38, .66], horn: [.5, 1.7, .1], ear: [.74, 1.15, -.05], earS: .9, nose: [0, 1.0, .9], crest: [0, 1.76, -.15], fang: [.25, .3, .85], fangS: .6,
    extra: () => [ell(.68, .14, .2, 0, 1.4, .6)]});
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
