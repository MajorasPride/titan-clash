// Mythic Forge — CREATURE KIT (Nov 9 2026, test page). Original, made in code (ours).
// 🫧 Ooze (goo body with 🔌 inside / face / mouth plugs, pseudopods, grow-a-face, mouths, things to swallow), 🎐 jellyfish,
// 👁 beholder bits, 🐢 giant snapping turtle shell (numbered scutes). Also adds the Jelly & Ooze + Horror skins and 'col:#hex' paint-by-number colours.
(function () {   // ---- skins (test page only): pushed into the shared material list
  const M = window.FORGE_MATS; if (!M) return;
  const J = (k, n, col, op, em, ei = .35, rough = .15) => [k, n, 'Jelly & Ooze', 'plain', col, rough, 0, {transparent: true, opacity: op, side: 2, emissive: em, emissiveIntensity: ei}];
  M.LIST.push(J('jellygreen', 'Ooze green', 0x6adf4a, .62, 0x2a8a1a), J('jellypurple', 'Ooze purple', 0x9a5aff, .6, 0x5a2ad0), J('jellycyan', 'Neon jelly (cyan)', 0x6af0ff, .45, 0x20c0ff, .9), J('jellyclear', 'Clear jelly', 0xe8f4ff, .32, 0x8ab0d0, .15, .05),
    J('jellymurk', 'Murky swamp goo', 0x5a6a2a, .86, 0x1a2a0a, .2, .4), J('jellyghost', 'Ghost jelly', 0xd8e8ff, .38, 0xa0c0ff, .6), J('jellyblood', 'Blood jelly', 0xa01018, .7, 0x500008, .35), J('jellytar', 'Black tar', 0x14110e, .92, 0x000000, 0, .1),
    J('jellyhoney', 'Honey goo', 0xffb020, .7, 0x8a4a00, .3), J('jellypink', 'Bubblegum goo', 0xff7ab8, .6, 0xb02a6a, .3), J('jellyglass', 'Purple glass (jellyfish)', 0xb8a0ff, .4, 0x7a4aff, .7, .02),
    ['fleshraw', 'Raw flesh', 'Horror', 'octopus', 0xb04a4a, .45, 0, {}], ['gore', 'Wet gore', 'Horror', 'plain', 0x7a0a10, .15, .1, {}], ['muscle', 'Exposed muscle', 'Horror', 'bark1', 0xa83a3a, .5, 0, {}],
    ['bonedirty', 'Old bone', 'Horror', 'plain', 0xd8ccb0, .7, 0, {}], ['vein', 'Pulsing veins', 'Horror', 'plain', 0x6a1020, .4, 0, {emissive: 0x6a0010, emissiveIntensity: .6}]);
  const mk = M.makeMat;   // paint by number colours: material key 'col:#rrggbb'
  M.makeMat = function (T, key, tint, tile) { if (typeof key === 'string' && key.startsWith('col:')) { const [hex, fl = ''] = key.slice(4).split(':');   // flags: g = glows a little, c = see-through, s = shiny
    const m = new T.MeshStandardMaterial({color: new T.Color(hex), roughness: fl.includes('s') ? .25 : .6, metalness: 0, side: T.DoubleSide, transparent: fl.includes('c'), opacity: fl.includes('c') ? .72 : 1});
    if (fl.includes('g')) { m.emissive = new T.Color(hex); m.emissiveIntensity = .35; } if (tint && tint !== '#ffffff') m.color.multiply(new T.Color(tint)); m.userData.key = key; return m; } return mk.call(this, T, key, tint, tile); };
})();
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const X = window.makeKit(T, K), {loft, ell, spike, claw, at, merge, plug, pair, P, V3, orient} = X, out = [];
  const add = (id, group, sub, name, ex, make) => out.push({id, group, sub, name, tags: ['kit', ...(ex.tags || [])], ...ex, make});
  const Sy = rows => rows.map(([a, w, t, b, n]) => ({a, w, t, b: b ?? t, n: n || 2.2}));
  // ================= 🫧 OOZE =================
  const insides = [[0, 1.0, .2], [.6, 1.6, -.2], [-.7, 1.3, .1], [.2, 2.3, .3], [-.3, .7, -.5], [.8, .8, .5]].map(([x, y, z], i) => plug('in' + (i + 1), 'inside', [x, y, z], [x, .2, z || .01], 'out', {s: .6, opt: i ? 1 : 0}));
  const faces = [plug('face1', 'face', [0, 2.0, 1.55], [0, .25, 1], 'out', {s: .9, back: [0, -1, 0]}), plug('face2', 'face', [1.3, 1.5, .9], [.8, .2, .6], 'out', {s: .7, back: [0, -1, 0], opt: 1}), plug('face3', 'face', [-1.1, 2.4, .7], [-.7, .5, .5], 'out', {s: .6, back: [0, -1, 0], opt: 1})];
  const mouths = [[0, .9, 1.7, [0, -.1, 1]], [1.5, 1.0, -.4, [1, 0, -.2]], [-1.4, 1.2, -.6, [-1, .1, -.3]], [0, 3.1, -.6, [0, 1, -.4]]].map(([x, y, z, d], i) => plug('mouth' + (i + 1), 'mouth', [x, y, z], d, 'out', {s: .8, back: [0, -1, 0], opt: i ? 1 : 0}));
  add('ko_goo', 'Torsos & Bellies', '🫧 Ooze', 'Goo body (see-through)', {fitKind: 'torso', plugs: [...insides, ...faces, ...mouths, plug('top', 'back', [0, 3.3, 0], [0, 1, 0], 'out', {s: .6})], tags: ['ooze', 'blob', 'slime', 'goo', 'jelly'], pbnNames: ['Goo', 'Core']},
    () => [P(K.noise(loft(Sy([[-.1, 1.6, 1.6, 1.6], [.4, 2.2, 2.0, 2.0], [1.4, 2.0, 1.8, 1.8], [2.4, 1.5, 1.4, 1.5], [3.2, .8, .8, .9], [3.5, .3, .3, .3]]), {axis: 'y', rad: 36, per: 5}), .18, 1.4), 'jellygreen', 1),
      P(K.noise(ell(.55, .5, .55, 0, 1.4, 0, 18), .06, 3), 'vein', 2)]);
  add('ko_puddle', 'Torsos & Bellies', '🫧 Ooze', 'Goo puddle (flat)', {fitKind: 'torso', plugs: [...insides.map(p => ({...p, p: [p.p[0] * 1.4, p.p[1] * .35, p.p[2] * 1.4]})), ...faces.slice(0, 2), ...mouths.slice(0, 2)], tags: ['ooze', 'puddle']},
    () => [P(K.noise(ell(3.2, 1.0, 3.0, 0, .7, 0, 30), .25, 1.2), 'jellymurk', 1)]);
  // pseudopod: reaches out along its bones; 🔌 'any' plug at the tip = it can hold any stolen part (claw, jaw, wing...)
  add('ko_pod', 'Tentacles & Extra Limbs', '🫧 Ooze', 'Pseudopod (goo arm)', {plugs: [plug('tip', 'any', [0, 5.6, 0], [0, 1, 0], 'out', {s: .5})], tags: ['ooze', 'pseudopod', 'tentacle']},
    () => [P(K.noise(K.taper(K.bez(V3(), V3(.3, 2.6, .2), V3(0, 5.6, 0)), t => .55 * (1 - t * .65) * (1 + .15 * Math.sin(t * 13)), 0, 30, 14), .07, 2), 'jellygreen')]);
  // 😶 grow a face: a face that forms out of the goo. Wrongness: 0 = almost right, 1 = very wrong (eyes drift apart, smile too wide, it melts)
  const faceP = [{k: 'wrong', label: '😶 Wrongness', min: 0, max: 1, step: .05, def: .45}, {k: 'eyes', label: 'Eyes', min: 1, max: 7, step: 1, def: 2}, {k: 'mouth', label: 'Mouth width', min: .2, max: 1.6, step: .05, def: .8}, {k: 'melt', label: 'Melting', min: 0, max: 1, step: .05, def: .3}];
  function face(p) { const w = p.wrong, gs = [], eyes = [], mouth = [], n = Math.round(p.eyes);
    for (let i = 0; i < n; i++) { const sp = n === 1 ? 0 : (i / (n - 1) - .5) * (.9 + w * 1.4), y = .35 + Math.sin(i * 2.3) * w * .25, r = .17 * (1 + Math.sin(i * 1.7 + 1) * w * .5);
      eyes.push(ell(r, r * (1 - w * .3 * (i % 2)), r, sp, .08, y + .2, 16)); gs.push(at(K.noise(ell(r * 1.35, r * .6, r * 1.3, 0, 0, 0, 14), .02, 4), sp, .02, y + .2)); }
    const mw = p.mouth * (1 + w * .6), mo = []; for (let i = 0; i <= 16; i++) { const t = i / 16 - .5; mo.push(V3(t * mw, .05, -.35 - Math.pow(Math.abs(t * 2), 2) * (.1 + w * .35) * -1 - p.melt * .3 * Math.sin(t * 9))); }
    mouth.push(K.taper(new T.CatmullRomCurve3(mo), .07 + w * .03, .05, 24, 8, .5));
    const teeth = []; for (let i = 0; i < 9 + w * 8; i++) { const t = i / (8 + w * 8) - .5; teeth.push(at(spike(.1 + w * .08 * Math.random(), .025), t * mw * .9, .06, -.32 + Math.pow(Math.abs(t * 2), 2) * (.1 + w * .35), 180)); }
    const skin = K.noise(ell(1.0 + mw * .35, .25, 1.05, 0, -.05, 0, 24), .04 + p.melt * .12, 3); if (p.melt > 0) { const a = skin.attributes.position; for (let i = 0; i < a.count; i++) { const z = a.getZ(i); if (z < 0) a.setZ(i, z * (1 + p.melt * .8)); } skin.computeVertexNormals(); }
    return [P(skin, 'jellygreen', 1), P(merge(gs), 'flesh', 2), P(merge(eyes), 'eye', 3), P(merge(mouth), 'darkmetal', 4), P(merge(teeth), 'tooth', 5)]; }
  out.push({id: 'ko_face_wrong', group: 'Eyes & Faces', sub: '🫧 Ooze faces', name: '😶 Grow a face (wrongness slider)', tags: ['kit', 'ooze', 'face', 'horror', 'maker'], plugAs: 'face', params: faceP, makeP: face, make: () => face(Object.fromEntries(faceP.map(q => [q.k, q.def]))), pbnNames: ['Goo skin', 'Lids', 'Eyes', 'Mouth', 'Teeth']});
  // 👄 mouth stamps (+Y = out of the surface)
  const mouthPart = (id, name, make, ex = {}) => add('ko_mouth_' + id, 'Jaws & Teeth', '👄 Mouth stamps', name, {plugAs: 'mouth', tags: ['ooze', 'mouth', 'stamp', 'horror'], ...ex}, make);
  mouthPart('toothy', 'Toothy mouth', () => [P(new T.TorusGeometry(.42, .1, 10, 28).scale(1.4, 1, .6).rotateX(Math.PI / 2), 'flesh'), P(ell(.55, .05, .25, 0, -.04, 0), 'darkmetal'), P(merge([...Array(14).keys()].map(i => { const a = i / 14 * Math.PI * 2; return at(spike(.16, .04), Math.cos(a) * .52, 0, Math.sin(a) * .24, 0, 0, 0); }).map((g, i) => { const a = i / 14 * Math.PI * 2; return at(g, 0, 0, 0, Math.sin(a) * -60, 0, Math.cos(a) * 60); })), 'tooth')]);
  mouthPart('ring', 'Lamprey ring mouth', () => [P(new T.TorusGeometry(.45, .12, 10, 28).rotateX(Math.PI / 2), 'flesh'), P(ell(.42, .03, .42, 0, -.06, 0), 'darkmetal'), P(merge([0, 1, 2].flatMap(r => [...Array(12).keys()].map(i => { const a = i / 12 * Math.PI * 2 + r * .3, R = .38 - r * .1; return at(spike(.1, .03), Math.cos(a) * R, -.02 * r, Math.sin(a) * R, Math.sin(a) * 70, 0, -Math.cos(a) * 70); }))), 'tooth')]);
  mouthPart('slit', 'Vertical slit mouth', () => [P(ell(.12, .05, .6, 0, 0, 0), 'darkmetal'), P(merge([-1, 1].map(s => K.taper(K.bez(V3(s * .14, 0, -.6), V3(s * .22, .04, 0), V3(s * .14, 0, .6)), .07, .07, 12, 8))), 'flesh'), P(merge([...Array(8).keys()].flatMap(i => [-1, 1].map(s => at(spike(.1, .025), s * .12, 0, -.5 + i * .14, 0, 0, s * 80)))), 'tooth')]);
  mouthPart('scream', 'Screaming mouth', () => [P(new T.TorusGeometry(.4, .14, 10, 24).scale(1, 1, 1.4).rotateX(Math.PI / 2), 'flesh'), P(ell(.38, .1, .52, 0, -.1, 0), 'darkmetal')], {horror: 1});
  // goo eyes (grow anywhere on the goo: they plug into 🔌 face spots, or stick anywhere in ✋ Free)
  add('ko_eye_goo', 'Eyes & Faces', '🫧 Ooze faces', 'Goo eye', {plugAs: 'face', tags: ['ooze', 'eye']}, () => [P(ell(.32, .32, .32, 0, .1, 0, 18), 'jellyclear'), P(ell(.2, .2, .2, 0, .12, .05, 16), 'eye'), P(ell(.08, .08, .05, 0, .3, .1, 10), 'darkmetal')]);
  add('ko_eye_cluster', 'Eyes & Faces', '🫧 Ooze faces', 'Eye cluster (opens when you get close)', {plugAs: 'face', tags: ['ooze', 'eye', 'horror'], horror: 0},
    () => [P(merge([...Array(9).keys()].map(i => { const a = i * 2.4, r = .2 + i * .07; return ell(.12 + (i % 3) * .04, .12, .12 + (i % 3) * .04, Math.cos(a) * r, .05, Math.sin(a) * r, 12); })), 'eye'), P(merge([...Array(9).keys()].map(i => { const a = i * 2.4, r = .2 + i * .07; return ell(.05, .03, .05, Math.cos(a) * r, .16, Math.sin(a) * r, 8); })), 'darkmetal')]);
  // 🫥 things to swallow (they plug into the goo's 🔌 inside spots); horror 1 = Nightmare, 2 = Full horror only
  const vic = (id, name, make, horror, ex = {}) => add('ko_vic_' + id, 'Accessories & Magic', '🫥 Swallowed', name, {plugAs: 'inside', horror, tags: ['ooze', 'swallowed', 'victim', 'horror'], ...ex}, make);
  vic('skull', 'Floating skull', () => [P(merge([ell(.42, .4, .48, 0, .45, 0, 18), ell(.3, .18, .3, 0, .1, .2, 12)]), 'bonedirty'), P(merge([ell(.11, .12, .06, .15, .5, .42), ell(.11, .12, .06, -.15, .5, .42)]), 'darkmetal')], 1);
  vic('ribs', 'Ribcage', () => [P(merge([K.taper(K.bez(V3(0, 0, -.3), V3(0, .7, -.35), V3(0, 1.4, -.3)), .07, .06, 12, 6), ...[...Array(6).keys()].flatMap(i => [-1, 1].map(s => K.taper(K.bez(V3(0, .2 + i * .22, -.3), V3(s * .5, .15 + i * .22, 0), V3(s * .2, .05 + i * .22, .35)), .035, .02, 12, 6)))]), 'bonedirty')], 1);
  vic('hand', 'Reaching hand', () => [P(merge([ell(.3, .35, .1, 0, .3, 0, 12), ...[-1.5, -.5, .5, 1.5].map(i => at(K.taper(K.bez(V3(), V3(0, .25, .02), V3(0, .5, .1)), .05, .035, 8, 6), i * .12, .6, 0)), at(K.taper(K.bez(V3(), V3(.15, .15, 0), V3(.3, .3, .05)), .05, .035, 8, 6), .25, .25, 0)]), 'skin')], 1);
  vic('helmet', 'Knight helmet', () => [P(merge([K.lathe([[.0, 0], [.4, .05], [.42, .4], [.38, .7], [.2, .85], [0, .9]].map(([r, y]) => [r, y]), 18)]), 'metal'), P(ell(.25, .04, .1, 0, .45, .37), 'darkmetal')], 0);
  vic('sword', 'Swallowed sword', () => [P(merge([at(new T.BoxGeometry(.08, 1.6, .02), 0, .8, 0), at(new T.BoxGeometry(.4, .06, .06), 0, 0, 0)]), 'metal')], 0);
  vic('chunk', 'Flesh chunk', () => [P(K.noise(ell(.4, .3, .35, 0, .25, 0, 14), .08, 3), 'fleshraw'), P(K.noise(ell(.15, .12, .12, .2, .4, .1, 8), .03, 4), 'bonedirty')], 2);
  vic('halfeaten', 'Half-eaten victim', () => [P(merge([ell(.35, .5, .25, 0, .5, 0, 14), at(K.taper(K.bez(V3(), V3(.1, -.4, 0), V3(.15, -.9, .1)), .12, .08, 10, 8), .15, .1, 0), at(K.taper(K.bez(V3(), V3(.4, .2, 0), V3(.7, .3, .1)), .1, .07, 10, 8), .3, .8, 0)]), 'skin'), P(K.noise(ell(.3, .2, .22, -.05, .9, .02, 12), .06, 3), 'gore'), P(merge([0, 1, 2].map(i => K.taper(K.bez(V3(-.2, .7 + i * .12, 0), V3(-.35, .72 + i * .12, .1), V3(-.25, .75 + i * .12, .2)), .03, .02, 8, 5))), 'bonedirty')], 2);
  vic('blood', 'Blood cloud', () => [P(K.noise(ell(.9, .7, .8, 0, .5, 0, 16), .25, 1.5), 'jellyblood')], 2);
  // ================= 🎐 JELLYFISH (no face) =================
  const bellProfile = (R, H) => { const pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI / 2; pts.push([R * Math.cos(a) * (1 + .06 * Math.sin(i * 1.3)), H * Math.sin(a)]); } pts.push([0, H]); return pts.reverse().map(([r, y]) => [Math.max(.001, r), y]); };
  const spots = [...Array(8).keys()].map(i => { const a = i / 8 * Math.PI * 2, r = 1.9 + (i % 2) * .6; return plug('spot' + (i + 1), 'glow', [Math.sin(a) * r, Math.sqrt(Math.max(0, 1 - (r / 3.2) ** 2)) * 3.4, Math.cos(a) * r], [Math.sin(a), .8, Math.cos(a)], 'out', {s: .5}); });
  add('kj_bell', 'Torsos & Bellies', '🎐 Jellyfish', 'Jellyfish bell (glass + glowing core)', {fitKind: 'torso', ownSize: 1, plugs: [...spots, plug('top', 'glow', [0, 3.4, 0], [0, 1, 0], 'out', {s: .7}), plug('in1', 'inside', [0, 1.2, 0], [0, -1, .01], 'out', {s: .6})], tags: ['jellyfish', 'jelly', 'sea', 'bell'], pbnNames: ['Bell', 'Core', 'Rim frill'],
    patterns: {'Neon cyan': {1: '#6af0ff', 2: '#3ae0ff', 3: '#b0faff'}, 'Purple glass': {1: '#b8a0ff', 2: '#7a3aff', 3: '#e0d0ff'}, 'Moon jelly': {1: '#e8f0ff', 2: '#ffb0d8', 3: '#ffffff'}, 'Blood moon': {1: '#ff6a6a', 2: '#8a0010', 3: '#ffb0a0'}}},
    () => [P(K.lathe(bellProfile(3.2, 3.4), 40), 'jellyglass', 1), P(K.noise(K.lathe(bellProfile(1.9, 2.2).map(([r, y]) => [r, y + .2]), 28), .08, 2.5), 'glow', 2),
      P(merge([...Array(24).keys()].map(i => { const a = i / 24 * Math.PI * 2; return at(K.taper(K.bez(V3(), V3(0, -.3, .1), V3(0, -.6, .3)), .18, .02, 6, 6, .3), Math.sin(a) * 3.15, .05, Math.cos(a) * 3.15, 0, a * 57.3, 0); })), 'jellycyan', 3)]);
  add('kj_tentacle', 'Tentacles & Extra Limbs', '🎐 Jellyfish', 'Trailing tentacle', {tags: ['jellyfish', 'tentacle', 'sting']}, () => [P(K.taper(new T.CatmullRomCurve3([V3(), V3(.15, 1.5, .05), V3(-.1, 3, -.05), V3(.12, 4.5, .02), V3(0, 6, 0)]), .09, .02, 40, 6), 'jellycyan')]);
  add('kj_oral', 'Tentacles & Extra Limbs', '🎐 Jellyfish', 'Frilly oral arm', {tags: ['jellyfish', 'frill', 'oral arm']}, () => { const g = K.taper(new T.CatmullRomCurve3([V3(), V3(.1, 1.6, 0), V3(-.1, 3.2, 0), V3(0, 4.8, 0)]), t => .45 * (1 - t * .7), .05, 48, 16, .25); const a = g.attributes.position;
    for (let i = 0; i < a.count; i++) { const y = a.getY(i), x = a.getX(i); a.setZ(i, a.getZ(i) + Math.sin(y * 7) * .18 * Math.abs(x) * 3); } g.computeVertexNormals(); return [P(g, 'jellyglass')]; });
  add('kj_spot', 'Accessories & Magic', '🎐 Jellyfish', 'Glow spot', {plugAs: 'glow', tags: ['glow', 'spot', 'jellyfish', 'light']}, () => [P(ell(.22, .1, .22, 0, .05, 0, 14), 'glow')]);
  // ================= 👁 BEHOLDER bits =================
  add('ko_orb', 'Torsos & Bellies', '👁 Beholder', 'Floating orb body', {fitKind: 'torso', plugs: [plug('big', 'bigeye', [0, 2.2, 2.2], [0, 0, 1], 'frame', {s: 1}), ...[...Array(10).keys()].map(i => { const a = i / 10 * Math.PI * 2; return plug('m' + i, 'mouth', [Math.sin(a) * 2.25, 1.0, Math.cos(a) * 2.25], [Math.sin(a), -.3, Math.cos(a)], 'out', {s: .6, opt: 1}); }).slice(3, 7)], tags: ['beholder', 'orb', 'eye']},
    () => [P(K.noise(ell(2.3, 2.2, 2.3, 0, 2.0, 0, 32), .06, 3), 'scale')]);
  add('kp_eye_big', 'Eyes & Faces', '👁 Beholder', 'Great central eye', {plugAs: 'bigeye', tags: ['beholder', 'eye', 'big']}, () => [P(ell(.95, .95, .5, 0, 0, 0, 28), 'eye'), P(ell(.4, .55, .2, 0, 0, .42, 18), 'darkmetal'), P(new T.TorusGeometry(1.0, .18, 10, 32), 'scale')]);
  add('ko_eyestalk', 'Tentacles & Extra Limbs', '👁 Beholder', 'Eye stalk', {plugs: [plug('tip', 'eye', [0, 2.5, .12], [0, 1, .3], 'frame', {s: .9})], tags: ['beholder', 'stalk', 'eye']}, () => [P(K.taper(K.bez(V3(), V3(.15, 1.2, -.1), V3(0, 2.4, .1)), .2, .1, 18, 10), 'scale')]);
  // ================= 🐢 GIANT SNAPPING TURTLE SHELL (numbered scutes) =================
  // trunk runs up +Y (tail -> head), dome on -Z (back), belly plate on +Z. 1 = shell, 2-6 = middle scutes, 7-14 = side scutes, 15 = keel ridges, 16 = saw edge, 17 = belly plate
  function shell() { const L = 6, Wd = 2.7, Hd = 2.0, y0 = -.4, pcs = [];
    const dome = (u, v) => { const y = y0 + u * L, x = (v * 2 - 1) * Wd * Math.sin(Math.PI * (.08 + u * .84)), r = Math.sqrt(Math.max(0, 1 - (x / Wd) ** 2)); return V3(x, y, -Hd * r * Math.sin(Math.PI * (.05 + u * .9)) - .05); };
    const pos = [], idx = [], NU = 30, NV = 26;
    for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) pos.push(...dome(i / NU, j / NV).toArray());
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = i * (NV + 1) + j, b = a + 1, c = a + NV + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const dg = new T.BufferGeometry(); dg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); dg.setIndex(idx); dg.computeVertexNormals(); { const mid = (NU / 2 | 0) * (NV + 1) + (NV / 2 | 0); if (dg.attributes.normal.getZ(mid) > 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } dg.setIndex(idx); dg.computeVertexNormals(); } } pcs.push(P(K.noise(dg, .03, 3), 'scale', 1));
    const scute = (u, v, rw, rl, num, mat = 'stone') => { const p = dome(u, v), q = dome(Math.min(1, u + .01), v), n = V3().subVectors(dome(u, Math.min(1, v + .01)), p).cross(V3().subVectors(q, p)).normalize(); if (n.z > 0) n.negate();
      const s = ell(rw, .12, rl, 0, 0, 0, 16); orient(s, p.addScaledVector(n, .05).toArray(), n.toArray(), [0, -1, 0]); pcs.push(P(K.noise(s, .015, 6), mat, num)); };
    for (let k = 0; k < 5; k++) scute(.12 + k * .19, .5, .55, .55, 2 + k);
    for (let k = 0; k < 4; k++) for (const v of [.22, .78]) scute(.18 + k * .2, v, .5, .55, 7 + k * 2 + (v > .5 ? 1 : 0));
    const ridges = []; for (const v of [.33, .5, .67]) for (let k = 0; k < 7; k++) { const u = .12 + k * .12, p = dome(u, v); ridges.push(at(spike(.45 - Math.abs(v - .5), .14, .5), p.x, p.y, p.z - .08, -90 - 25, 0, 0)); }
    pcs.push(P(merge(ridges), 'horn', 15));
    const saw = []; for (let k = 0; k < 9; k++) { const v = k / 8, p = dome(.02, v); saw.push(at(spike(.5, .16, .1), p.x, p.y + .1, p.z * .6, 180, 0, 0)); }
    pcs.push(P(merge(saw), 'horn', 16));
    pcs.push(P(loft(Sy([[y0 + .3, Wd * .55, .12, .05, 3], [y0 + L * .5, Wd * .78, .14, .05, 3], [y0 + L - .4, Wd * .5, .12, .05, 3]]), {axis: 'y', rad: 24}), 'horn', 17));
    return pcs; }
  const shellPlugs = [...[...Array(5).keys()].map(k => plug('ridge' + (k + 1), 'back', [0, -.4 + (.12 + k * .19) * 6, -2.05], [0, 0, -1], 'out', {s: .6, back: [0, -1, 0]})), ...[.25, .5, .75].map((u, k) => plug('moss' + (k + 1), 'any', [(k - 1) * 1.2, -.4 + u * 6, -1.85], [0, 0, -1], 'out', {s: .7, back: [0, -1, 0]}))];
  add('kc_shell_snapper', 'Torsos & Bellies', '🐢 Turtle', 'Snapping turtle shell (numbered scutes)', {fitKind: 'torso', plugs: shellPlugs, tags: ['turtle', 'shell', 'snapping', 'tortoise', 'paint by number'],
    pbnNames: ['Shell', 'Middle 1', 'Middle 2', 'Middle 3', 'Middle 4', 'Middle 5', 'Side 1', 'Side 2', 'Side 3', 'Side 4', 'Side 5', 'Side 6', 'Side 7', 'Side 8', 'Ridges', 'Saw edge', 'Belly plate'],
    patterns: {'Mossy snapper': {1: '#4a4a2a', 2: '#5a5a32', 3: '#4e5230', 4: '#5a5a32', 5: '#4e5230', 6: '#5a5a32', 15: '#3a3420', 16: '#3a3420', 17: '#b8a070'}, 'Island turtle': {1: '#6a5a3a', 2: '#7a8a4a', 3: '#6a7a3a', 4: '#7a8a4a', 5: '#6a7a3a', 6: '#7a8a4a', 15: '#8a8070', 16: '#5a4a30', 17: '#d8c090'}}}, shell);
  return out;
});
