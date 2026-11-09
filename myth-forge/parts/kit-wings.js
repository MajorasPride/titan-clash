// Mythic Forge — WING KIT (Nov 9 2026, test page). Original, made in code (ours).
// Every wing is split into NUMBERED pieces (num) for 🔢 Paint by number: membrane panels between the fingers, feather rows
// (primaries, secondaries, coverts, alula, scapulars), vein cells on bug wings. Wing frame (same as tails-wings.js): shoulder at the origin,
// the arm runs up +Y, the wing spreads toward +X (the editor mirrors it for the left side).
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const X = window.makeKit(T, K), {ell, spike, claw, at, merge, P, V3, panel} = X, out = [];
  const add = (id, sub, name, ex, make) => out.push({id: 'kw_' + id, group: 'Wings', sub, name, fitKind: 'wing', tags: ['kit', 'wing', 'paint by number', ...(ex.tags || [])], ...ex, make});
  const bone = (a, b, r0, r1 = r0 * .7) => K.taper(K.bez(V3(...a), V3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] || 0) * .5 + (b[2] || 0) * .5 + .05), V3(...b)), r0, r1, 10, 8);
  // scalloped edge: points from a to b sagging toward `toward` (membrane edges between finger tips)
  const sag = (a, b, toward, amt = .35, n = 5) => { const pts = []; for (let i = 1; i < n; i++) { const t = i / n, s = Math.sin(t * Math.PI) * amt; pts.push([a[0] + (b[0] - a[0]) * t + (toward[0] - (a[0] + b[0]) / 2) * s * .5, a[1] + (b[1] - a[1]) * t + (toward[1] - (a[1] + b[1]) / 2) * s * .5]); } return pts; };
  // ---------------- 🦇 membrane wing (complex): arm + 4 finger bones + 4 numbered skin panels + thumb claw
  function membrane(o = {}) { const S = o.s || 1, sh = [0, 0], el = [.35 * S, 2.6 * S], wr = [1.0 * S, 4.6 * S], tips = [[.7 * S, 7.6 * S], [3.0 * S, 7.2 * S], [5.0 * S, 5.4 * S], [5.7 * S, 2.6 * S]], base = [2.4 * S, -.25 * S];
    const pcs = [], th = .035;
    // panels between neighbouring fingers (1-3), and the arm panel (4) back to the body
    for (let i = 0; i < 3; i++) pcs.push(P(panel([wr, tips[i], ...sag(tips[i], tips[i + 1], wr, o.rag ? .9 : .45), tips[i + 1]], th), o.mat || 'membrane', i + 1));
    pcs.push(P(panel([sh, el, wr, tips[3], ...sag(tips[3], base, wr, o.rag ? .9 : .4), base], th), o.mat || 'membrane', 4));
    const bm = o.bone || 'scale'; pcs.push(P(merge([bone([0, 0, 0], [...el, 0], .22, .17), bone([...el, 0], [...wr, 0], .17, .13), ...tips.map(t => bone([...wr, 0], [...t, 0], .1, .03)), at(claw(.5, .08, .6), wr[0], wr[1], 0, 0, 0, 25)]), bm, 5));
    if (o.rag) { pcs.forEach(p => { if (p.num <= 4) K.noise(p.geo, .04, 2); }); }
    return pcs; }
  add('bat', '🔌 Membrane (numbered)', 'Bat / dragon wing (4 panels)', {tags: ['dragon', 'bat', 'wyvern', 'demon'], pbnNames: ['Panel 1', 'Panel 2', 'Panel 3', 'Arm panel', 'Bones']}, () => membrane());
  add('bat_rag', '🔌 Membrane (numbered)', 'Ragged undead wing', {tags: ['undead', 'torn', 'horror'], pbnNames: ['Panel 1', 'Panel 2', 'Panel 3', 'Arm panel', 'Bones']}, () => membrane({rag: true, bone: 'bone'}));
  // simple 2-part membrane wing: inner + outer
  add('bat_simple', '🟢 Simple wings (2 parts)', 'Simple bat wing (inner + outer)', {tags: ['simple', 'bat', 'dragon'], pbnNames: ['Inner', 'Outer']}, () => [
    P(panel([[0, 0], [.5, 4.4], [3.4, 5.6], [4.6, 3.4], [2.6, 1.2], [2.2, -.2]], .05), 'membrane', 1), P(panel([[.5, 4.4], [.8, 7.4], [3.4, 7.0], [5.4, 5.2], [4.6, 3.4], [3.4, 5.6]], .05), 'membrane', 2)]);
  // ---------------- 🪶 feathered wing (complex): 7 numbered feather rows, like a real bird wing
  function feathered(o = {}) { const S = o.s || 1, el = [.4 * S, 2.8 * S], wr = [.8 * S, 5.0 * S], hand = [.9 * S, 6.6 * S], rows = [];
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const row = (n, from, to, L0, L1, W, ang0, ang1, z, num, mat = 'feather') => { const gs = []; for (let i = 0; i < n; i++) { const t = n === 1 ? 0 : i / (n - 1), p = lerp(from, to, t), L = (L0 + (L1 - L0) * t) * S, a = ang0 + (ang1 - ang0) * t;
        gs.push(at(X.feather(L, W * S, .06), p[0], p[1], z - i * .004, 0, 0, a)); } rows.push(P(merge(gs), mat, num)); };
    row(10, wr, hand, 3.4, 2.4, .32, -70, -12, -.02, 1);            // 1 primaries (long, at the hand)
    row(11, [.2 * S, .6 * S], wr, 3.0, 3.2, .34, -100, -82, -.03, 2); // 2 secondaries (along the forearm)
    row(8, wr, hand, 1.5, 1.0, .26, -78, -25, .04, 3);              // 3 primary coverts
    row(11, [.25 * S, .9 * S], wr, 1.6, 1.5, .28, -100, -85, .03, 4); // 4 secondary coverts
    row(14, [.1 * S, .4 * S], hand, .8, .6, .2, -95, -40, .07, 5);  // 5 marginal coverts (front edge)
    row(3, lerp(wr, hand, .1), lerp(wr, hand, .35), .7, .55, .14, -20, 5, .09, 6); // 6 alula (thumb tuft)
    row(7, [-.1 * S, -.2 * S], [.3 * S, 1.2 * S], 2.0, 1.4, .3, -120, -100, .05, 7); // 7 scapulars (shoulder)
    rows.push(P(merge([bone([0, 0, 0], [...el, .03], .2, .15), bone([...el, .03], [...wr, .03], .15, .1), bone([...wr, .03], [...hand, .03], .1, .05)]), o.bone || 'feather', 8));
    return rows; }
  const FN = ['Primaries', 'Secondaries', 'Primary coverts', 'Secondary coverts', 'Marginal coverts', 'Alula', 'Scapulars', 'Arm'];
  add('feather', '🔌 Feathered (numbered rows)', 'Feathered wing (7 feather rows)', {tags: ['angel', 'bird', 'griffin', 'hippogriff', 'sphinx', 'feather'], pbnNames: FN,
    patterns: {'Eagle': {1: '#2a1c12', 2: '#3a2818', 3: '#5a3e22', 4: '#6a4a2a', 5: '#8a6a40', 6: '#2a1c12', 7: '#7a5a34', 8: '#6a4a2a'}, 'Angel white': {1: '#f4f2ea', 2: '#ffffff', 3: '#efece2', 4: '#fbfaf6', 5: '#ffffff', 6: '#e8e2d2', 7: '#f6f4ee', 8: '#f0ece0'},
      'Fallen (black + red)': {1: '#0e0e10', 2: '#1a1418', 3: '#5a0c10', 4: '#2a1216', 5: '#8a1018', 6: '#0e0e10', 7: '#1a1418', 8: '#2a1216'}, 'Phoenix': {1: '#ff3a10', 2: '#ff7a10', 3: '#ffb020', 4: '#ffd040', 5: '#fff0a0', 6: '#ff3a10', 7: '#ff9020', 8: '#c03010'},
      'Blue jay': {1: '#1a3a8a', 2: '#2a5ab0', 3: '#ffffff', 4: '#3a6ac0', 5: '#6a9ae0', 6: '#0a1a40', 7: '#8aaad0', 8: '#5a7aa0'}}}, () => feathered());
  add('feather_simple', '🟢 Simple wings (2 parts)', 'Simple feathered wing (inner + outer)', {tags: ['simple', 'angel', 'bird', 'feather'], pbnNames: ['Inner', 'Outer']}, () => {
    const scal = (a, b, n, d) => { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push([a[0] + (b[0] - a[0]) * t + (i % 2 ? d : 0), a[1] + (b[1] - a[1]) * t - (i % 2 ? d * .6 : 0)]); } return pts; };
    return [P(panel([[0, 0], [.8, 5.0], ...scal([3.6, 4.2], [3.0, -.4], 6, .35), [1.0, -.6]], .06), 'feather', 1), P(panel([[.8, 5.0], [.9, 6.6], [1.4, 9.6], ...scal([3.4, 8.6], [3.6, 4.2], 6, .35)], .06), 'feather', 2)]; });
  // ---------------- 🐝 / 🦋 bug wings: vein lines + numbered cells. Pairs = forewing + hindwing; 🪝 Hooked (bees / wasps): hindwing latched under the forewing
  // a wing outline from base (0,0) along +Y-ish; cells = fan wedges from the base, split by a cross vein
  function veinWing(outline, nRad, cross = .5, len = 1) { const N = outline.length, cells = [], veins = [], base = [0, 0];
    const at2 = t => { const f = t * (N - 1), i = Math.min(N - 2, Math.floor(f)), u = f - i; return [outline[i][0] + (outline[i + 1][0] - outline[i][0]) * u, outline[i][1] + (outline[i + 1][1] - outline[i][1]) * u]; };
    const ends = [...Array(nRad + 1).keys()].map(k => at2(k / nRad)), mid = ends.map(e => [e[0] * cross, e[1] * cross]);
    for (let k = 0; k < nRad; k++) { const seg = []; for (let j = 0; j <= 4; j++) seg.push(at2((k + j / 4) / nRad));
      cells.push([base, mid[k], mid[k + 1]]); cells.push([mid[k], ...seg, mid[k + 1]]); }
    for (const e of ends) veins.push(K.taper(K.bez(V3(0, 0, .02), V3(e[0] * .5, e[1] * .5, .025), V3(e[0], e[1], .02)), .028 * len, .01, 8, 5));
    for (let k = 0; k < nRad; k++) veins.push(K.taper(K.bez(V3(mid[k][0], mid[k][1], .022), V3((mid[k][0] + mid[k + 1][0]) / 2, (mid[k][1] + mid[k + 1][1]) / 2, .022), V3(mid[k + 1][0], mid[k + 1][1], .022)), .018 * len, .018 * len, 4, 5));
    return {cells, veins}; }
  const ovalWing = (L, W, back = .15) => { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12, a = t * Math.PI; pts.push([Math.sin(a) * W * (1 - back * Math.cos(a)), (1 - Math.cos(a)) * L / 2]); } return pts.reverse(); };
  function wingPair(fore, hind, o) { const pcs = []; let n = 1; const cellMat = o.cell || 'membrane';
    const put = (w, place) => { const vw = veinWing(w.outline, w.rad, w.cross, w.L / 6); vw.cells.forEach(c => pcs.push(P(place(panel(c, .02)), cellMat, n++))); pcs.push(P(place(merge(vw.veins)), o.vein || 'chitin', 0)); return vw; };
    put(fore, g => g); const hk = o.hook ? 1 : 0;
    put(hind, g => hk ? at(g, .5, .3, -.03, 0, 0, -28) : at(g, .3, -.4, -.03, 0, 0, -72));
    if (o.eyespots) for (const [x, y, r] of o.eyespots) { pcs.push(P(at(new T.CircleGeometry(r, 24), x, y, .035), 'membrane', n++), P(at(new T.CircleGeometry(r * .55, 20), x, y, .04), 'membrane', n++), P(at(new T.CircleGeometry(r * .22, 16), x, y, .045), 'membrane', n++)); }
    return pcs; }
  const hookP = [{k: 'hook', label: '🪝 Hooked together', options: ['yes', 'no'], def: 'yes'}];
  const bugWing = (id, name, fore, hind, ex) => out.push({id: 'kw_' + id, group: 'Wings', sub: '🔌 Bug wings (numbered cells)', name, fitKind: 'wing', tags: ['kit', 'wing', 'bug', 'insect', 'paint by number', ...(ex.tags || [])], params: ex.params, patterns: ex.patterns, pbnNames: ex.pbnNames,
    makeP: p => wingPair(fore, hind, {...ex, hook: !p || p.hook !== 'no'}), make: () => wingPair(fore, hind, {...ex, hook: ex.params ? true : ex.hook})});
  const wasp = {outline: [[0, 0], [.5, 1.5], [1.1, 3.5], [1.4, 5.2], [1.2, 6.2], [.6, 6.4], [.2, 5.8], [-.1, 4], [-.15, 2], [0, 0]].map(([x, y]) => [x, y]), rad: 5, cross: .55, L: 6.4};
  const waspH = {outline: [[0, 0], [.6, 1.2], [1.0, 2.6], [.9, 3.8], [.4, 4.2], [0, 3.6], [-.1, 2], [0, 0]], rad: 4, cross: .5, L: 4.2};
  bugWing('insect_wasp', 'Wasp / bee wings (fore + hind)', wasp, waspH, {params: hookP, cell: 'clearyellow', vein: 'darkmetal', tags: ['wasp', 'bee', 'hornet', 'clear']});
  bugWing('insect_fly', 'Dragonfly wings (fore + hind)', {outline: ovalWing(7.6, 1.0), rad: 6, cross: .45, L: 7.6}, {outline: ovalWing(7.0, 1.3), rad: 6, cross: .45, L: 7}, {cell: 'clearblue', vein: 'darkmetal', tags: ['dragonfly', 'fairy', 'clear']});
  // 🦋 moth wings: broad, many cells + eyespots, with 5 pattern presets (paint by number)
  const mothF = {outline: [[0, 0], [1.2, 1.4], [3.0, 3.6], [4.6, 5.6], [5.2, 6.8], [4.6, 7.2], [3.0, 7.0], [1.4, 6.4], [.3, 5.0], [-.1, 2.6], [0, 0]], rad: 6, cross: .45, L: 7.2};
  const mothH = {outline: [[0, 0], [1.6, .6], [3.2, 1.6], [4.2, 3.0], [4.0, 4.4], [3.0, 5.0], [1.4, 4.6], [.3, 3.2], [0, 1.4], [0, 0]], rad: 5, cross: .45, L: 5.0};
  // cell numbers: forewing 1-12, hindwing 13-22, eyespots 23-25. Patterns give each number a colour (the numbers stay, you can repaint any of them)
  const fill = (n, f) => Object.fromEntries([...Array(n).keys()].map(i => [i + 1, f(i + 1)]));
  const MP = {
    'Bark camouflage': fill(25, i => ['#4e3f31', '#8a7560', '#b8a486', '#6e5e4c'][(i * 7) % 4]),
    'Eyespots': fill(25, i => i <= 12 ? (i % 2 ? '#7a6248' : '#c9b08a') : i <= 22 ? (i % 2 ? '#c9b08a' : '#a8906a') : ['#e8d9b5', '#1f2a44', '#f4f0e0'][i - 23]),
    'Warning stripes': fill(25, i => i <= 12 ? (i % 2 ? '#1a1a1a' : '#f2e6c9') : i <= 22 ? (i % 2 ? '#e8642c' : '#1a1a1a') : '#f5c431'),
    'Hidden flash': fill(25, i => i <= 12 ? (i % 2 ? '#6b6358' : '#8f877a') : i <= 22 ? (i % 3 ? '#d9302c' : '#1a1a1a') : ['#1a1a1a', '#d9302c', '#1a1a1a'][i - 23]),
    'Skull / ghost': fill(25, i => i <= 12 ? (i % 3 === 0 ? '#2a2a2a' : '#edebe4') : i <= 22 ? (i % 2 ? '#bdb8ae' : '#2a2a2a') : ['#edebe4', '#7a1f1f', '#2a2a2a'][i - 23])};
  bugWing('moth', 'Moth wings (paint by number)', mothF, mothH, {hook: true, cell: 'fur', vein: 'fur', eyespots: [[2.6, 2.4, .7]], patterns: MP, tags: ['moth', 'butterfly', 'mothman']});
  bugWing('butterfly', 'Butterfly wings (paint by number)', {...mothF, rad: 5}, {...mothH, rad: 5}, {hook: true, cell: 'membrane', vein: 'darkmetal', eyespots: [[2.6, 2.4, .6]], patterns: MP, tags: ['butterfly', 'fairy']});
  return out;
});
