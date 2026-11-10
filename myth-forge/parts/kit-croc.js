// Mythic Forge — CROCODILE KIT (Nov 9 2026, late). Original designs, made in code (ours).
// 🐊 Giant crocodile: one flat armoured body (pale belly plates, rows of keeled back scutes), tail segments with a double scute crest,
// thick neck with a scute shield. Used by the two crocodile body types (crawling + standing), which share the same bones so
// ⚙ › Skeleton › 🐊 Crawl ↔ Stand switches one creature between the two.
// Frames: torso = hips at the origin, +Y toward the head, +Z = belly (down on flat bodies), -Z = back.  `keel: 1` = rolled so -Z is up.
(function () {   // skins
  const M = window.FORGE_MATS; if (!M) return;
  M.LIST.push(['crocbelly', 'Crocodile belly (pale)', 'Lizards', 'scutes', 0xcfc79a, .5, 0], ['crocdark', 'Crocodile hide (swamp dark)', 'Lizards', 'scutes', 0x3b4a2c, .58, 0], ['crocsalt', 'Saltwater croc (grey-tan)', 'Lizards', 'scutes', 0x7d7a5c, .55, 0]);
})();
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const X = window.makeKit(T, K), {loft, ell, at, merge, plug, P, spike} = X, out = [];
  const Sy = rows => rows.map(([a, w, t, b, n]) => ({a, w, t, b: b ?? t, n: n || 2.4}));   // [y, halfWidth, belly(+Z), back(-Z), squareness]
  // value of column c of the section table at height y (straight-line between rows)
  const lerpAt = (rows, y, c) => { if (y <= rows[0][0]) return rows[0][c]; for (let i = 1; i < rows.length; i++) if (y <= rows[i][0]) { const a = rows[i - 1], b = rows[i], t = (y - a[0]) / (b[0] - a[0]); return a[c] + (b[c] - a[c]) * t; } return rows[rows.length - 1][c]; };
  // a keeled scute (bony back plate): low 4-sided pyramid, long along the body (+Y), pointing out of the back (-Z)
  const scute = (x, y, z, s, h = 1, tilt = 0) => { const g = new T.ConeGeometry(.5, .55 * h, 4, 1).rotateY(Math.PI / 4).translate(0, .275 * h, 0).rotateX(-Math.PI / 2).scale(s * .9, s * 1.5, s); if (tilt) g.rotateY(tilt); return g.translate(x, y, z); };
  // ---------------- body
  const BODY = [[-.5, .3, .26, .28, 2.4], [-.25, .7, .46, .46, 2.6], [.2, 1.0, .6, .56, 2.8], [.9, 1.2, .7, .6, 2.9], [2.0, 1.3, .8, .62, 3], [3.2, 1.27, .78, .62, 3], [4.1, 1.1, .68, .6, 2.9], [4.7, .88, .58, .55, 2.7], [5.0, .62, .46, .46, 2.5]];
  out.push({id: 'kcr_body', group: 'Torsos & Bellies', sub: 'Beast Bodies', name: 'Crocodile body (armoured)', tags: ['kit', 'croc', 'crocodile', 'gator', 'alligator', 'reptile', 'lizard', 'armor'], fitKind: 'torso', fitBox: [[-1.3, 0, -.7], [1.3, 5, .8]],
    make: () => { const body = loft(Sy(BODY), {axis: 'y', rad: 40, per: 5, noise: [.012, 4]}), plates = [], sc = [];
      for (let y = .15; y < 4.85; y += .4) { const w = lerpAt(BODY, y, 1), t = lerpAt(BODY, y, 2); for (const x of [-.34, .34]) plates.push(at(loft(Sy([[0, w * .3, .07, .05, 3.4], [.34, w * .3, .07, .05, 3.4]]), {axis: 'y', raw: true, rad: 12}), x * w, y - .17, t * .93)); }
      for (let i = 0, y = -.1; y < 4.9; y += .37, i++) { const w = lerpAt(BODY, y, 1), b = lerpAt(BODY, y, 3), n = lerpAt(BODY, y, 4);
        for (const fx of [-.72, -.42, -.14, .14, .42, .72]) { const x = fx * w, z = -b * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(fx), n)), 1 / n); sc.push(scute(x, y, z + .05, (.24 + .06 * (1 - Math.abs(fx))) * (w / 1.3 + .25), Math.abs(fx) < .2 ? 1.25 : .9, fx * -.5)); } }
      return [P(body, 'scale'), P(merge(sc), 'scale'), P(merge(plates), 'crocbelly')]; }});
  // ---------------- tail segment: one per tail bone; deeper than wide, double scute crest on top that the fitter keeps upright
  const TAIL = [[0, .5, .46, .54], [.5, .48, .45, .55], [1, .44, .42, .5]];
  const dome = secs => { const a = secs[0], z = secs[secs.length - 1], k = (r, f, y) => [y, r[1] * f, r[2] * f, r[3] * f, r[4]];
    return [k(a, .3, a[0] - a[1] * .42), k(a, .68, a[0] - a[1] * .3), k(a, .93, a[0] - a[1] * .12), ...secs, k(z, .93, z[0] + z[1] * .12), k(z, .68, z[0] + z[1] * .3), k(z, .3, z[0] + z[1] * .42)]; };
  const tailPlugs = [plug('tip', 'tailtip', [0, 1, 0], [0, 1, 0], 'out', {s: .55, segEnd: 1}), plug('back1', 'back', [0, .5, -.5], [0, 0, -1], 'out', {s: .45, back: [0, -1, 0]}), plug('belly1', 'belly', [0, .5, .44], [0, 0, 1], 'out', {s: .45, back: [0, -1, 0]})];
  out.push({id: 'kcr_tailseg', group: 'Tails', sub: '🔌 Tail segments', name: 'Crocodile tail segment (scute crest)', tags: ['kit', 'plug', 'tail', 'segment', 'croc', 'crocodile', 'gator', 'reptile'], fitKind: 'seg', unitLen: 1, perSeg: true, keel: 1, fitBox: [[-.37, 0, -.37], [.37, 1, .37]], plugs: tailPlugs,
    make: () => [P(loft(Sy(dome(TAIL)), {axis: 'y', rad: 24, per: 3, noise: [.012, 5]}), 'scale'),
      P(merge([.08, .4, .72].flatMap(y => [-1, 1].map(sd => scute(sd * .19, y + .12, -.47, .3, 1.5, sd * -.25)))), 'scale'),
      P(merge([.05, .37, .69].map(y => at(loft(Sy([[0, .3, .05, .04, 3.4], [.27, .3, .05, .04, 3.4]]), {axis: 'y', raw: true, rad: 10}), 0, y, .41))), 'crocbelly')]});
  // tail end: the two rows join into one tall crest (the paddle end of the tail)
  out.push({id: 'kcr_tailseg_fin', group: 'Tails', sub: '🔌 Tail segments', name: 'Crocodile tail end (single crest)', tags: ['kit', 'plug', 'tail', 'segment', 'croc', 'crocodile', 'gator', 'paddle'], fitKind: 'seg', unitLen: 1, perSeg: true, keel: 1, fitBox: [[-.37, 0, -.37], [.37, 1, .37]], plugs: tailPlugs,
    make: () => [P(loft(Sy(dome([[0, .4, .46, .56], [.5, .36, .45, .58], [1, .3, .42, .52]])), {axis: 'y', rad: 24, per: 3, noise: [.012, 5]}), 'scale'),
      P(merge([.02, .27, .52, .77].map(y => scute(0, y + .12, -.5, .34, 2.1))), 'scale')]});
  // ---------------- neck: short and thick, with the shield of big scutes behind the skull
  out.push({id: 'kcr_neck', group: 'Necks & Spines', sub: 'Necks', name: 'Crocodile neck (scute shield)', tags: ['kit', 'neck', 'segment', 'croc', 'crocodile', 'gator'], fitKind: 'seg', unitLen: 1, perSeg: true, keel: 1, fitBox: [[-.5, 0, -.5], [.5, 1, .5]],
    make: () => [P(loft(Sy(dome([[0, .78, .5, .5, 2.8], [.5, .7, .46, .48, 2.8], [1, .62, .42, .44, 2.8]])), {axis: 'y', rad: 26, per: 4, noise: [.012, 5]}), 'scale'),
      P(merge([.2, .62].flatMap(y => [-.36, -.12, .12, .36].map(x => scute(x, y, -.44, .3, 1.1, x * -.6)))), 'scale'),
      P(merge([.1, .5].map(y => at(loft(Sy([[0, .46, .05, .04, 3.4], [.34, .46, .05, .04, 3.4]]), {axis: 'y', raw: true, rad: 10}), 0, y, .43))), 'crocbelly')]});
  // ---------------- limbs: short and thick (fitBox makes them come in a quarter thicker than the usual limb), scutes down the outside
  const LIMB = {legU: ['_up', 'Crocodile thigh', [[0, .46, .46, .46], [.2, .58, .56, .6], [.5, .56, .52, .58], [.8, .46, .44, .46], [1, .4, .4, .4]]], legL: ['_low', 'Crocodile shin', [[0, .42, .42, .42], [.25, .48, .46, .52], [.6, .4, .38, .42], [1, .32, .32, .32]]],
    armU: ['_up', 'Crocodile upper arm', [[0, .44, .44, .44], [.25, .54, .52, .56], [.6, .5, .48, .5], [1, .38, .38, .38]]], armF: ['_low', 'Crocodile forearm', [[0, .4, .4, .4], [.25, .48, .46, .5], [.6, .4, .4, .4], [1, .31, .31, .31]]]};
  for (const [g, arm] of [['Legs & Feet', false], ['Arms & Shoulders', true]]) { const base = 'kcr_limb' + (arm ? '_arm' : ''), segBy = Object.fromEntries(Object.entries(LIMB).filter(([t]) => arm === /^arm/.test(t)).map(([t, v]) => [t, base + v[0]]));
    const mk = (id, name, secs) => out.push({id, group: g, sub: '🔌 Limb segments', name, fitKind: 'seg', unitLen: 1, perSeg: true, fitBox: [[-.45, 0, -.45], [.45, 1, .45]], segBy, tags: ['kit', 'limb', 'segment', 'croc', 'crocodile', 'gator', 'reptile'],
      make: () => [P(loft(Sy(dome(secs)), {axis: 'y', rad: 22, per: 4, noise: [.015, 5]}), 'scale'), P(merge([.2, .5, .78].map(y => scute(0, y, -lerpAt(secs, y, 3) * .92, .26, 1, 0))), 'scale')]});
    mk(base, arm ? 'Crocodile arm segment' : 'Crocodile leg segment', LIMB[arm ? 'armU' : 'legU'][2]); for (const [t, v] of Object.entries(LIMB)) if (arm === /^arm/.test(t)) mk(base + v[0], v[1], v[2]); }
  // ---------------- teeth: many short cones along a long narrow jaw, a few big ones (the ones that show when the mouth is shut)
  out.push({id: 'kcr_teeth', group: 'Jaws & Teeth', sub: '🔌 Tooth rows', name: 'Crocodile teeth row', plugAs: 'teeth', tags: ['kit', 'plug', 'teeth', 'croc', 'crocodile', 'gator'],
    make: () => { const gs = [], N = 15; for (const sd of [1, -1]) for (let i = 0; i < N; i++) { const t = i / (N - 1), x = sd * (.2 - .1 * t + .025 * Math.sin(t * Math.PI * 3) + (t > .9 ? -.03 : 0)), big = i === 3 || i === 9 || i === 12;
        gs.push(at(spike(big ? .085 : .045 + .012 * Math.sin(i * 2.3), big ? .022 : .016, .08, 0, 6, 7), x, 0, .03 + t * .95, 0, 0, -sd * 10)); }
      for (const x of [-.035, .035]) gs.push(at(spike(.05, .016, .05, 0, 6, 7), x, 0, 1.0)); return [P(merge(gs), 'tooth')]; }});
  return out;
});
