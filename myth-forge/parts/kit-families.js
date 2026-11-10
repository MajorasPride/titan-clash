// Mythic Forge — NEW CREATURE FAMILIES KIT (Nov 10 2026). Original designs, made in code (ours). Prefix kf_.
// 🦴 Bone kit (skeleton limbs, rib cage, vertebrae, bone hands + feet): undead dragons, reapers, and the "skeleton version" layer of any creature.
// 😈 Demon kit (great horns, hooves, muscled torso), 👻 Reaper / shade kit (ragged hood + robe, mist trail), 🦖 Dinosaur kit (deep scaly body,
// back plates, tail spikes, feather tail fan), ⚙ Construct kit (riveted armour body, limbs, boots), 🚀 mech weapons (missile pod, energy blade, energy shield).
// Frames (same as the other kits): segments = origin at the start, +Y along the bone, unit length 1. Torso = hips at the origin, +Y toward the neck, +Z = chest / belly.
// Hands = wrist at the origin, +Y toward the fingers. Feet = ankle at the origin, toes toward +Z, sole at y = -.32. Plug parts (horns, plates, tail tips) = base at the origin, +Y out.
(function () {   // skins used by this kit
  const M = window.FORGE_MATS; if (!M) return;
  M.LIST.push(['rotflesh', 'Rotting flesh', 'Gooey', 'skin', 0x6a5a48, .6, 0], ['rothide', 'Dead dragon hide (grey-green)', 'Lizards', 'scutes', 0x4a5244, .7, 0], ['demonred', 'Demon hide (deep red)', 'Skins & Scales', 'skin', 0x8a1c18, .5, 0],
    ['demonash', 'Demon hide (ash black)', 'Skins & Scales', 'skin', 0x2a2226, .55, 0], ['dinogreen', 'Dinosaur hide (moss + stripes)', 'Lizards', 'iguana', 0x6a7a3a, .6, 0], ['dinorust', 'Dinosaur hide (rust)', 'Lizards', 'gecko', 0xa8622e, .6, 0],
    ['dinoslate', 'Dinosaur hide (slate blue)', 'Lizards', 'monitor', 0x4a6272, .6, 0], ['verdigris', 'Old bronze (green patina)', 'Metal', 'rust', 0x5a8a78, .7, .6],
    ['featherrust', 'Feathers (rust brown)', 'Skins & Scales', 'feather', 0x9a5a2e, .8, 0], ['featherdark', 'Feathers (raven black)', 'Skins & Scales', 'feather', 0x22222a, .7, 0]);
})();
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const X = window.makeKit(T, K), {loft, ell, at, merge, plug, pair, P, spike, claw, V3} = X, out = [];
  const Sy = rows => rows.map(([a, w, t, b, n]) => ({a, w, t, b: b ?? t, n: n || 2.3}));
  const add = (id, group, sub, name, ex, make) => out.push({id: 'kf_' + id, group, sub, name, tags: ['kit', ...(ex.tags || [])], ...ex, make});
  const tube = (pts, r0, r1 = r0, seg = 14, rad = 8, flat = 1) => K.taper(K.cr(pts.map(p => V3(...p))), r0, r1, seg, rad, flat);
  const box = (w, h, d, x = 0, y = 0, z = 0) => new T.BoxGeometry(w, h, d).translate(x, y, z);
  const cyl = (r0, r1, h, x = 0, y = 0, z = 0, seg = 16) => new T.CylinderGeometry(r0, r1, h, seg).translate(x, y + h / 2, z);

  // ====================================================================== 🦴 BONE KIT
  // one long bone: a thin shaft with a knuckle at each end
  const longBone = (L = 1, r = .1, k = .2, x = 0, z = 0) => at(loft(Sy([[-.03, k * .55, k * .5], [.03, k, k * .9], [.1, k * .92, k * .85], [.2, r * 1.15, r * 1.1], [.5, r, r], [.8, r * 1.15, r * 1.1], [.9, k * .85, k * .8], [.97, k * .9, k * .85], [1.03, k * .5, k * .45]].map(([a, w, t]) => [a * L, w, t])), {axis: 'y', rad: 14, per: 3, noise: [.006, 8]}), x, 0, z);
  const BONE = {legU: ['_up', 'Thigh bone', () => [longBone(1, .1, .22)]], legL: ['_low', 'Shin bones (pair)', () => [longBone(1, .085, .17, .06, .03), longBone(.96, .05, .1, -.13, -.04)]],
    armU: ['_up', 'Upper arm bone', () => [longBone(1, .085, .19)]], armF: ['_low', 'Forearm bones (pair)', () => [longBone(1, .06, .13, .08, 0), longBone(1, .055, .12, -.08, 0)]]};
  for (const [g, arm] of [['Legs & Feet', false], ['Arms & Shoulders', true]]) { const base = 'kf_limb_bone' + (arm ? '_arm' : ''), segBy = Object.fromEntries(Object.entries(BONE).filter(([t]) => arm === /^arm/.test(t)).map(([t, v]) => [t, base + v[0]]));
    const mk = (id, name, f) => out.push({id, group: g, sub: '🦴 Bone kit', name, fitKind: 'seg', unitLen: 1, perSeg: true, fitBox: [[-.37, 0, -.37], [.37, 1, .37]], segBy, tags: ['kit', 'limb', 'segment', 'bone', 'skeleton', 'undead'], make: () => [P(merge(f()), 'bone')]});
    mk(base, arm ? 'Bone arm segment' : 'Bone leg segment', BONE[arm ? 'armU' : 'legU'][2]); for (const [t, v] of Object.entries(BONE)) if (arm === /^arm/.test(t)) mk(base + v[0], v[1], v[2]); }
  // a vertebra (one per neck / tail / spine bone): drum body, a spine blade on the back (-Z), two side wings
  const vert = (sp = .5, wing = .42, r = .3) => merge([at(loft(Sy([[.04, r * .9, r * .8], [.14, r, r * .9], [.5, r * .8, r * .72], [.86, r, r * .9], [.96, r * .9, r * .8]]), {axis: 'y', rad: 16, per: 3}), 0, 0, 0),
    at(spike(sp, .11, .25, 0, 8, 8, .45), 0, .5, -r * .7, -100, 0, 0), ...[-1, 1].map(sd => at(spike(wing, .08, .15, 0, 8, 8, .5), sd * r * .7, .5, -.05, 0, 0, sd * -82)), at(ell(.1, .12, .1, 0, 0, 0, 10), 0, .98, 0)]);
  const segEx = (tags, ex = {}) => ({fitKind: 'seg', unitLen: 1, perSeg: true, keel: 1, fitBox: [[-.37, 0, -.37], [.37, 1, .37]], tags: ['segment', 'bone', 'skeleton', 'undead', ...tags], ...ex});
  const tailPlugs = [plug('tip', 'tailtip', [0, 1, 0], [0, 1, 0], 'out', {s: .55, segEnd: 1}), plug('back1', 'back', [0, .5, -.4], [0, 0, -1], 'out', {s: .4, back: [0, -1, 0]})];
  add('neckseg_bone', 'Necks & Spines', '🦴 Bone kit', 'Neck vertebra', segEx(['neck', 'spine', 'vertebra']), () => [P(vert(.45, .5, .32), 'bone')]);
  add('tailseg_bone', 'Tails', '🦴 Bone kit', 'Tail vertebra', segEx(['tail', 'spine', 'vertebra'], {plugs: tailPlugs}), () => [P(vert(.4, .3, .3), 'bone')]);
  // rib cage: spine column up the back, pairs of ribs curving round to a breast bone, hip bones at the bottom, shoulder blades at the top
  const cage = (rot) => { const H = 3.6, gs = [], dark = [], flesh = [];
    for (let i = 0; i < 9; i++) gs.push(at(vert(.3, .22, .22), 0, i * H / 9, -.5, 0, 0, 0, H / 9 * 1.02));
    for (let i = 0; i < 8; i++) { const y = 1.15 + i * .3, w = (.62 + .5 * Math.sin((i + 1.3) / 9 * Math.PI)) * 1.02, low = i < 2, fz = low ? .2 : .62, broken = rot && (i === 2 || i === 5);
      for (const sd of [-1, 1]) { if (broken && sd > 0) { gs.push(tube([[0, y + .05, -.48], [sd * w * .7, y, -.4], [sd * w, y - .12, -.05]], .075, .05, 10, 8)); continue; }
        gs.push(tube([[0, y + .05, -.48], [sd * w * .7, y, -.42], [sd * w, y - .12, -.02], [sd * w * .8, y - .26, fz * .75], [sd * (low ? w * .55 : .1), y - (low ? .42 : .34), fz]], .075, .05, 18, 8)); } }
    gs.push(at(loft(Sy([[1.55, .12, .06], [2.0, .2, .08], [2.9, .22, .08], [3.25, .3, .09], [3.4, .2, .07]]), {axis: 'y', rad: 12, per: 3}), 0, 0, .64));   // breast bone
    for (const sd of [-1, 1]) { gs.push(at(K.noise(ell(.52, .46, .16, 0, 0, 0, 16), .02, 4), sd * .52, .42, -.2, 20, sd * -38, sd * 18));   // hip wings
      gs.push(tube([[sd * .28, .1, .34], [sd * .62, .05, .2], [sd * .78, .3, -.1]], .09, .08, 10, 8));
      gs.push(at(ell(.34, .42, .07, 0, 0, 0, 14), sd * .62, 2.95, -.58, -8, sd * 25, sd * -12));   // shoulder blade
      gs.push(tube([[sd * .12, 3.42, .6], [sd * .6, 3.5, .35], [sd * 1.0, 3.42, -.2]], .07, .06, 10, 8)); }   // collar bone
    gs.push(tube([[-.28, .1, .34], [0, .0, .42], [.28, .1, .34]], .1, .1, 8, 8));
    const pcs = [P(merge(gs), 'bone')];
    if (rot) { flesh.push(at(K.noise(ell(.75, .9, .12, 0, 0, 0, 16), .05, 3), -.55, 2.3, .3, 0, -55, 0), at(K.noise(ell(.5, .6, .1, 0, 0, 0, 14), .05, 3), .3, 1.3, .42, 10, 20, 0), at(K.noise(ell(.6, .5, .1, 0, 0, 0, 14), .05, 3), .2, 3.0, -.6, 0, 170, 0),
        at(K.noise(ell(.3, 1.0, .25, 0, 0, 0, 14), .04, 3), 0, 1.6, -.2)); pcs.push(P(merge(flesh), 'rotflesh'));
      pcs.push(P(merge([at(ell(.22, .26, .2, 0, 0, 0, 12), .1, 2.5, .05), tube([[.1, 2.3, .05], [.3, 1.9, .2], [.1, 1.4, .1], [-.15, 1.0, .2]], .07, .03, 14, 6)]), 'glowgreen')); }   // a dead heart still glowing
    return pcs; };
  const cagePlugs = [...[.8, 1.6, 2.4, 3.2].map((y, i) => plug('back' + (i + 1), 'back', [0, y, -.72], [0, 0, -1], 'out', {s: .55, back: [0, -1, 0]}))];
  add('ribcage', 'Torsos & Bellies', '🦴 Bone kit', 'Rib cage + hips (skeleton body)', {fitKind: 'torso', fitBox: [[-1.15, 0, -.75], [1.15, 3.6, .75]], plugs: cagePlugs, tags: ['bone', 'skeleton', 'ribs', 'undead', 'torso']}, () => cage(false));
  add('ribcage_rot', 'Torsos & Bellies', '🦴 Bone kit', 'Rotting rib cage (flesh scraps, dead heart)', {fitKind: 'torso', fitBox: [[-1.15, 0, -.75], [1.15, 3.6, .75]], plugs: cagePlugs, tags: ['bone', 'skeleton', 'ribs', 'undead', 'zombie', 'rot', 'dragon', 'torso']}, () => cage(true));
  // skeletal hand: wrist bones, 4 long fingers of 3 bones each, a thumb. One piece (no finger plugs), slightly curled
  const fingerB = (L, r, curl) => { const gs = []; let y = 0, z = 0, a = 0; for (const f of [.45, .32, .23]) { const l = L * f; gs.push(at(at(longBone(l, r, r * 1.7), 0, 0, 0, a, 0, 0), 0, y, z)); y += Math.cos(a * K.D) * l; z += Math.sin(a * K.D) * l; a += curl; } return merge(gs); };
  add('hand_bone', 'Hands & Claws', '🦴 Bone kit', 'Skeleton hand', {fitKind: 'hand', tags: ['bone', 'skeleton', 'hand', 'undead', 'reaper']}, () => [P(merge([
    at(ell(.3, .16, .1, 0, 0, 0, 12), 0, .12, 0), ...[-.27, -.09, .09, .27].map((x, i) => at(longBone(.42, .035, .06), x * .8, .2, 0, 0, 0, -x * 22)),
    ...[-.27, -.09, .09, .27].map((x, i) => at(fingerB([.72, .86, .9, .78][i], .032, 16), x * 1.2, .62, 0, 0, 0, -x * 26)), at(fingerB(.62, .036, 14), .3, .2, .04, 10, 0, -58)]), 'bone')]);
  // skeletal foot: heel bone, long foot bones, 3 clawed toes (use on bird / dragon / dinosaur legs too)
  add('foot_bone', 'Legs & Feet', '🦴 Bone kit', 'Skeleton foot (3 clawed toes)', {fitKind: 'foot', tags: ['bone', 'skeleton', 'foot', 'undead', 'talon']}, () => [P(merge([
    at(ell(.2, .18, .26, 0, 0, 0, 12), 0, -.16, -.12), ...[-.22, 0, .22].flatMap(x => [at(longBone(.62, .045, .08), x * .6, -.18, .05, 82, 0, 0), at(at(fingerB(.7, .04, -8), 0, 0, 0, 86, 0, 0), x, -.24, .62, 0, x * 60, 0),
      at(at(claw(.3, .05, .5), 0, 0, 0, 100, 0, 0), x * 1.9, -.27, 1.26, 0, x * 60, 0)])]), 'bone')]);

  // ====================================================================== 😈 DEMON KIT
  const hornCurve = (pts, r, seg = 22, flat = 1) => { const g = K.taper(K.cr(pts.map(p => V3(...p))), t => r * (1 - t * .93), 0, seg, 12, flat), a = g.attributes.position; return g; };
  const ringsOn = (pts, r, n) => { const c = K.cr(pts.map(p => V3(...p))), gs = []; for (let i = 1; i <= n; i++) { const t = i / (n + 2), p = c.getPointAt(t), d = c.getTangentAt(t), g = new T.TorusGeometry(r * (1 - t * .93) * 1.04, r * .07, 6, 14); g.lookAt(d); gs.push(g.translate(p.x, p.y, p.z)); } return gs; };
  const RAM = [[0, 0, 0], [.25, .5, -.25], [.75, .7, -.6], [1.15, .35, -.6], [1.05, -.2, -.3], [.7, -.35, .1], [.55, -.05, .4]], BULL = [[0, 0, 0], [.45, .35, 0], [1.0, .6, .15], [1.45, 1.1, .5], [1.5, 1.7, .9]], TALL = [[0, 0, 0], [.1, .7, -.15], [.3, 1.4, -.35], [.25, 2.1, -.2], [.05, 2.7, .15]];
  const horn = (id, name, pts, r, tags) => add(id, 'Horns & Crests', '🔌 Horns', name, {plugAs: 'horn', tags: ['plug', 'horn', 'demon', ...tags]}, () => [P(merge([hornCurve(pts, r), ...ringsOn(pts, r, 7)]), 'horn')]);
  horn('horn_ram', 'Great ram horn (curled)', RAM, .26, ['ram', 'curled', 'devil']); horn('horn_bull', 'Great bull horn (forward)', BULL, .24, ['bull', 'oni', 'minotaur']); horn('horn_tall', 'Tall demon horn (twisting up)', TALL, .22, ['tall', 'fiend', 'antler']);
  // cloven hoof with a fetlock tuft
  add('foot_hoof', 'Legs & Feet', '🔌 Feet', 'Cloven hoof', {fitKind: 'foot', tags: ['hoof', 'demon', 'goat', 'satyr', 'minotaur', 'foot']}, () => [
    P(merge([-1, 1].map(sd => at(loft([{a: -.25, w: .15, t: .2, b: .2, y: -.12}, {a: .1, w: .2, t: .22, b: .22, y: -.1}, {a: .5, w: .19, t: .16, b: .2, y: -.12}, {a: .78, w: .1, t: .07, b: .16, y: -.16}].map(s => ({...s, n: 2.6})), {rad: 14, per: 3}), sd * .17, 0, 0, 0, sd * 5, 0))), 'horn'),
    P(K.noise(at(loft(Sy([[-.05, .3, .32], [.25, .36, .38], [.5, .26, .28]]), {axis: 'y', rad: 16, per: 3}), 0, -.12, .02), .03, 5), 'fur')]);
  // muscled demon torso: narrow waist, huge chest and traps, a ridge of spines down the back
  add('torso_demon', 'Torsos & Bellies', '😈 Demon kit', 'Demon torso (spined back)', {fitKind: 'torso', fitBox: [[-1.25, 0, -.8], [1.25, 3.6, .9]], tags: ['demon', 'devil', 'muscle', 'torso', 'fiend'],
    plugs: [.9, 1.6, 2.3, 3.0].map((y, i) => plug('back' + (i + 1), 'back', [0, y, -.66 - (i > 1 ? .12 : 0)], [0, .2, -1], 'out', {s: .6, back: [0, -1, 0]}))}, () => { const body = loft(Sy([[-.1, .5, .4, .4], [.2, .78, .56, .52], [.8, .7, .5, .48], [1.4, .68, .5, .5], [2.0, .95, .7, .62], [2.7, 1.2, .82, .72], [3.2, 1.18, .74, .72], [3.55, .8, .5, .55], [3.7, .4, .3, .3]]), {axis: 'y', rad: 36, per: 5, noise: [.015, 3]});
      const mus = [...[-1, 1].flatMap(sd => [ell(.5, .36, .22, sd * .46, 2.75, .62), ell(.2, .17, .1, sd * .2, 1.9, .52), ell(.2, .17, .1, sd * .2, 1.52, .5), ell(.2, .17, .1, sd * .2, 1.14, .49), ell(.4, .3, .3, sd * .75, 3.3, -.2), ell(.3, .7, .2, sd * .7, 2.1, -.45)])];
      return [P(body, 'skin'), P(K.noise(merge(mus), .01, 4), 'skin')]; });
  add('back_spine', 'Back & Armor Plates', '🔌 Back pieces', 'Back spine (bone spike)', {plugAs: 'back', tags: ['plug', 'back', 'spike', 'demon', 'bone']}, () => [P(merge([spike(.9, .12, .35, 0, 10, 8, .6), at(ell(.16, .08, .16, 0, 0, 0, 10), 0, .04, 0)]), 'bone')]);

  // ====================================================================== 👻 REAPER / SHADE KIT
  // ragged hood: open at the front, a point at the back, torn rim. Sits on the head bone (own size)
  add('hood_reaper', 'Horns & Crests', '👻 Reaper kit', 'Ragged hood', {tags: ['reaper', 'hood', 'death', 'shade', 'cloak', 'robe']}, () => { const g = loft([{a: -1.25, w: .25, t: .5, b: .3, y: 1.0}, {a: -.9, w: .8, t: 1.05, b: .85, y: 1.05}, {a: -.2, w: 1.08, t: 1.3, b: 1.05, y: 1.0}, {a: .5, w: 1.02, t: 1.3, b: 1.05, y: .95}, {a: .95, w: .92, t: 1.22, b: 1.0, y: .9}], {rad: 30, per: 4, cap1: false});
      const a = g.attributes.position; for (let i = 0; i < a.count; i++) { const z = a.getZ(i); if (z > .6) { const ang = Math.atan2(a.getY(i) - .9, a.getX(i)); a.setZ(i, z + .16 * Math.sin(ang * 9) * (z - .6) * 2.5); } } g.computeVertexNormals(); K.noise(g, .05, 2);
      const mantle = K.noise(loft(Sy([[.2, 1.0, 1.0, 1.0], [-.3, 1.5, 1.2, 1.3], [-.9, 1.9, 1.4, 1.6], [-1.3, 2.0, 1.45, 1.7]]), {axis: 'y', rad: 30, per: 4, cap0: false, cap1: false}), .06, 2);
      return [P(g.translate(0, -.32, .5), 'shadowcloth'), P(mantle.translate(0, -.1, .15), 'shadowcloth')]; });
  // long torn robe hanging from the hips (own size), hem cut into rags
  add('robe_reaper', 'Cloth & Capes', '👻 Reaper kit', 'Torn robe (hangs from the hips)', {ownSize: 1, tags: ['reaper', 'robe', 'death', 'shade', 'cloth', 'rags']}, () => { const g = loft(Sy([[.4, 1.15, 1.0], [-1.2, 1.4, 1.25], [-3.2, 1.9, 1.7], [-5.6, 2.4, 2.2]]), {axis: 'y', rad: 36, per: 6, cap0: false, cap1: false});
      const a = g.attributes.position; for (let i = 0; i < a.count; i++) { const y = a.getY(i); if (y < -3.6) { const ang = Math.atan2(a.getZ(i), a.getX(i)), k = (-3.6 - y) / 2; a.setY(i, y + k * (1.1 * Math.abs(Math.sin(ang * 7)) + .5 * Math.abs(Math.sin(ang * 17 + 1)))); } } g.computeVertexNormals();
      return [P(K.noise(g, .07, 1.6), 'shadowcloth')]; });
  // robed body: the upper half of the robe, belted with rope, a few ribs showing where the cloth has rotted through
  add('torso_robe', 'Torsos & Bellies', '👻 Reaper kit', 'Robed body (rotted cloth, ribs showing)', {fitKind: 'torso', fitBox: [[-1.2, 0, -.8], [1.2, 3.6, .8]], tags: ['reaper', 'robe', 'death', 'lich', 'monk', 'torso', 'cloth']}, () => [
    P(K.noise(loft(Sy([[-.3, .95, .8, .8], [.3, .9, .72, .75], [1.0, .7, .55, .6], [1.6, .78, .6, .66], [2.4, 1.05, .68, .78], [3.1, 1.2, .66, .8], [3.5, .9, .5, .62], [3.72, .45, .3, .36]]), {axis: 'y', rad: 34, per: 5}), .05, 2), 'shadowcloth'),
    P(merge([0, 1, 2, 3].flatMap(i => [-1, 1].map(sd => tube([[sd * .08, 2.75 - i * .26, .7 - i * .02], [sd * .5, 2.7 - i * .26, .62 - i * .02], [sd * .8, 2.55 - i * .26, .4]], .055, .04, 10, 6))).concat([at(loft(Sy([[1.9, .09, .05], [2.9, .12, .05]]), {axis: 'y', raw: true, rad: 8}), 0, 0, .7)])), 'bone'),
    P(merge([new T.TorusGeometry(.74, .06, 8, 28).rotateX(Math.PI / 2).scale(1, 1, .82).translate(0, 1.05, 0), tube([[.3, 1.05, .6], [.36, .5, .7], [.3, -.1, .78]], .05, .05, 8, 6), tube([[.42, 1.05, .56], [.5, .6, .66], [.52, .2, .7]], .05, .05, 8, 6)]), 'leather')]);
  // mist trail under a floating body (fitKind tail: +Y goes down the 'base' chain): a wide skirt of fog thinning to wisps
  add('base_mist', 'Tails', '👻 Reaper kit', 'Mist trail (floating base)', {fitKind: 'tail', tags: ['reaper', 'shade', 'ghost', 'mist', 'fog', 'float', 'base']}, () => { const core = loft(Sy([[0, 1.5, 1.5], [1.6, 1.9, 1.9], [3.4, 1.3, 1.3], [5.0, .6, .6], [6.0, .12, .12]]), {axis: 'y', rad: 26, per: 5, noise: [.22, .9]}), w = [];
      for (let i = 0; i < 7; i++) { const a0 = i / 7 * 6.283, pts = []; for (let j = 0; j <= 8; j++) { const t = j / 8, r = 1.6 * (1 - t * .75) + .25 * Math.sin(t * 6 + i), a = a0 + t * 1.6; pts.push([Math.cos(a) * r, .6 + t * 5.6, Math.sin(a) * r]); } w.push(tube(pts, .32, .03, 26, 7)); }
      return [P(core, 'shadowmist'), P(merge(w), 'shadowmist')]; });
  // great scythe: long crooked shaft, wide curved blade, a small lantern glow at the socket
  add('scythe', 'Weapons', 'Polearms', 'Reaper scythe', {tags: ['reaper', 'scythe', 'death', 'weapon', 'polearm']}, () => [P(tube([[0, -1.6, 0], [.08, .5, 0], [-.06, 3, 0], [.1, 5.6, 0], [0, 6.6, 0]], .075, .06, 30, 8), 'wood'),
    P(merge([at(K.extr([[0, 0], [-.5, .5], [-1.5, .7], [-2.6, .35], [-3.3, -.5], [-2.5, -.05], [-1.5, .15], [-.5, .05], [.1, -.3]], .05, .02), 0, 6.3, 0), cyl(.12, .12, .5, 0, 6.05, 0, 10)]), 'darkmetal'), P(ell(.14, .14, .14, .16, 6.1, 0, 10), 'glowgreen')]);
  // shade body: a hunched cloud of darkness with a ragged lower edge (floats; put a head and arms on it)
  add('torso_shade', 'Torsos & Bellies', '👻 Reaper kit', 'Shade body (living shadow)', {fitKind: 'torso', fitBox: [[-1.2, 0, -.8], [1.2, 3.6, .8]], tags: ['shade', 'shadow', 'ghost', 'wraith', 'torso']}, () => [
    P(loft(Sy([[-.6, .5, .4, .4], [0, .85, .6, .6], [1.0, .8, .55, .6], [2.0, 1.0, .65, .75], [2.9, 1.2, .7, .9], [3.4, .95, .55, .75], [3.75, .45, .3, .4]]), {axis: 'y', rad: 30, per: 5, noise: [.1, 1.4]}), 'shadowmist'),
    P(merge([...Array(9).keys()].map(i => { const a = i / 9 * 6.283; return tube([[Math.cos(a) * .7, .2, Math.sin(a) * .5], [Math.cos(a + .3) * .9, -.6, Math.sin(a + .3) * .7], [Math.cos(a + .8) * .7, -1.5, Math.sin(a + .8) * .5]], .22, .02, 12, 6); })), 'shadowmist')]);

  // ====================================================================== 🦖 DINOSAUR KIT
  // deep four-legged body: high arched back over the hips, heavy belly (plated dinosaurs, long-necks, horned ones). Lies flat: +Z = belly, -Z = back
  const DINO = [[-.6, .3, .3, .35], [-.2, .75, .7, .8], [.5, 1.1, 1.0, 1.25], [1.6, 1.25, 1.15, 1.5], [2.8, 1.2, 1.1, 1.35], [3.8, 1.0, .95, 1.0], [4.6, .75, .75, .7], [5.1, .45, .45, .45]];
  add('body_dino', 'Torsos & Bellies', 'Beast Bodies', 'Dinosaur body (arched back, 4 legs)', {fitKind: 'torso', fitBox: [[-1.2, 0, -.9], [1.2, 4.6, 1.2]], tags: ['dinosaur', 'stegosaurus', 'plated', 'quad', 'reptile'],
    plugs: [.3, 1.1, 1.9, 2.7, 3.5, 4.2].map((y, i) => plug('back' + (i + 1), 'back', [0, y, -[.9, 1.35, 1.5, 1.38, 1.1, .82][i]], [0, [-.25, -.1, 0, .1, .25, .3][i], -1], 'out', {s: [.75, 1.05, 1.2, 1.1, .85, .6][i], back: [0, -1, 0]}))},
    () => [P(loft(Sy(DINO.map(r => [...r, 2.5])), {axis: 'y', rad: 40, per: 5, noise: [.02, 3]}), 'scale'), P(K.noise(merge([-1, 1].flatMap(sd => [ell(.5, .95, .8, sd * .85, .5, .35), ell(.45, .8, .7, sd * .8, 3.9, .45)])), .02, 3), 'scale'),
      P(merge([...Array(11).keys()].map(i => at(loft(Sy([[0, .5, .06, .05, 3.2], [.36, .5, .06, .05, 3.2]]), {axis: 'y', raw: true, rad: 10}), 0, .2 + i * .4, [.86, 1.0, 1.08, 1.13, 1.14, 1.12, 1.08, 1.0, .92, .82, .72][i]))), 'paint2')]);
  // back plate: tall kite-shaped bony plate, thick at the root
  add('back_dinoplate', 'Back & Armor Plates', '🔌 Back pieces', 'Dinosaur back plate (kite)', {plugAs: 'back', tags: ['plug', 'back', 'plate', 'dinosaur', 'stegosaurus']}, () => [
    P(K.noise(K.extr([[-.28, 0], [-.62, .55], [-.3, 1.2], [0, 1.5], [.34, 1.15], [.6, .5], [.28, 0]], .1, .05).rotateY(Math.PI / 2), .012, 6), 'horn'), P(ell(.14, .1, .34, 0, .03, 0, 10), 'scale')]);
  // sail fin: a tall skin sail on long spines; a row of them down the back plugs joins into one sail
  add('back_sailfin', 'Back & Armor Plates', '🔌 Back pieces', 'Sail fin (tall spines + skin)', {plugAs: 'back', tags: ['plug', 'back', 'sail', 'fin', 'dinosaur', 'spinosaurus']}, () => [
    P(K.extr([[-.75, 0], [-.7, 1.9], [-.35, 2.25], [0, 2.4], [.35, 2.25], [.7, 1.9], [.75, 0]], .05, .02).rotateY(Math.PI / 2), 'membrane'), P(merge([-.6, -.2, .2, .6].map(z => at(spike(2.3 - Math.abs(z) * .5, .07, .02, 0, 8, 6), 0, 0, z))), 'scale')]);
  // upright dinosaur body with a tall sail down the back (the sail is part of the body, so it is one clean shape)
  add('torso_sail', 'Torsos & Bellies', 'Beast Bodies', 'Sail-back dinosaur body', {fitKind: 'torso', fitBox: [[-1.15, 0, -.85], [1.15, 3.6, .95]], tags: ['dinosaur', 'sail', 'spinosaurus', 'theropod', 'reptile', 'torso']}, () => { const pts = [], N = 22, L0 = -.5, L1 = 3.9;
      const h = t => 2.5 * Math.pow(Math.sin(Math.min(1, t * 1.02) * Math.PI), .7) * (1 - .22 * t) * (.94 + .06 * Math.cos(t * N * Math.PI));
      for (let i = 0; i <= N; i++) { const t = i / N; pts.push([.55 + h(t), L0 + (L1 - L0) * t]); } pts.push([.3, L1], [.3, L0]);
      const spines = []; for (let i = 1; i < N; i += 2) { const t = i / N, y = L0 + (L1 - L0) * t; spines.push(at(spike(.5 + h(t), .06, 0, 0, 6, 6), 0, y, -.3, -90, 0, 0)); }
      return [P(loft(Sy([[-.4, .45, .45, .45], [.2, .92, .82, .78], [1.1, 1.02, .92, .8], [2.1, .98, .88, .76], [3.0, .82, .74, .66], [3.55, .55, .5, .48], [3.75, .3, .3, .3]]), {axis: 'y', rad: 36, per: 5, noise: [.015, 3]}), 'scale'),
        P(K.extr(pts, .06, .02).rotateY(Math.PI / 2), 'membrane'), P(merge(spines), 'scale'),
        P(merge([...Array(9).keys()].map(i => at(loft(Sy([[0, .46, .06, .05, 3.2], [.3, .46, .06, .05, 3.2]]), {axis: 'y', raw: true, rad: 10}), 0, .1 + i * .38, [.74, .84, .88, .87, .85, .8, .74, .66, .56][i]))), 'paint2')]; });
  // tail spikes: two pairs of long spikes pointing out and back
  add('tip_tailspikes', 'Tails', '🔌 Tail tips', 'Tail spikes (2 pairs)', {plugAs: 'tailtip', tags: ['plug', 'tail', 'tip', 'spikes', 'dinosaur', 'stegosaurus', 'club']}, () => [P(merge([ell(.2, .34, .2, 0, .2, 0, 12)]), 'scale'),
    P(merge([-1, 1].flatMap(sd => [at(spike(1.25, .11, .1, 0, 10, 8), sd * .08, .12, 0, 0, 0, sd * -62), at(spike(1.05, .1, .1, 0, 10, 8), sd * .06, .42, 0, 0, 0, sd * -42)])), 'horn')]);
  // feather fan for a tail end (raptors, bird-dragons, phoenix later)
  add('tip_featherfan', 'Tails', '🔌 Tail tips', 'Feather tail fan', {plugAs: 'tailtip', tags: ['plug', 'tail', 'tip', 'feather', 'raptor', 'bird']}, () => [P(merge([-3, -2, -1, 0, 1, 2, 3].map(i => at(X.feather(1.7 - Math.abs(i) * .14, .2, .06), 0, 0, 0, 0, 0, i * -15).rotateY(Math.PI / 2))), 'feather')]);
  // sickle claw: the big raised killing claw of a raptor's foot (plugs onto a toe plug)
  add('claw_sickle', 'Hands & Claws', '🔌 Claws', 'Sickle claw (raptor)', {plugAs: 'claw', tags: ['plug', 'claw', 'raptor', 'dinosaur', 'sickle']}, () => [P(claw(.75, .13, .8, .55), 'horn')]);
  // neck frill + brow horns come as one crest piece for horned dinosaurs (plugs onto a crest plug)
  add('crest_frill', 'Horns & Crests', '🔌 Crests', 'Bony neck frill', {plugAs: 'crest', tags: ['plug', 'crest', 'frill', 'dinosaur', 'horned', 'shield']}, () => { const pts = []; for (let i = 0; i <= 14; i++) { const a = -1.35 + i / 14 * 2.7, r = 1.25 + .12 * Math.cos(i * Math.PI); pts.push([Math.sin(a) * r, Math.cos(a) * r]); } pts.push([.35, 0], [-.35, 0]);
      return [P(K.noise(at(K.extr(pts, .1, .04), 0, 0, 0, -28, 0, 0), .012, 5), 'scale'), P(merge([-1, 1].flatMap(sd => [-.9, -.45, 0].map(a => at(ell(.09, .12, .08, 0, 0, 0, 8), Math.sin(a) * 1.3 * -sd, Math.cos(a) * 1.3 * .88, -Math.cos(a) * 1.3 * .47)))), 'horn')]; });

  // ====================================================================== ⚙ CONSTRUCT KIT (clockwork warriors, living statues, dragon engines)
  const rivets = (r, y, n, z0 = 0) => [...Array(n).keys()].map(i => { const a = i / n * 6.283; return new T.SphereGeometry(.035, 6, 5).translate(Math.cos(a) * r, y, Math.sin(a) * r + z0); });
  add('torso_construct', 'Torsos & Bellies', '⚙ Construct kit', 'Construct body (riveted, glowing core)', {fitKind: 'torso', fitBox: [[-1.25, 0, -.8], [1.25, 3.6, .9]], tags: ['construct', 'golem', 'automaton', 'clockwork', 'armor', 'statue', 'torso'],
    plugs: [plug('back1', 'back', [0, 1.35, -.6], [0, 0, -1], 'out', {s: .8, back: [0, -1, 0]})]}, () => {
      const hull = loft(Sy([[0, .62, .46, .46, 3], [.5, .72, .52, .5, 3], [1.1, .6, .44, .44, 3], [1.5, .78, .56, .54, 3.2], [2.3, 1.15, .78, .7, 3.4], [3.1, 1.2, .78, .72, 3.4], [3.5, .9, .58, .58, 3], [3.65, .5, .36, .36, 2.6]]), {axis: 'y', rad: 36, per: 4});
      const bands = [.5, 1.5, 3.42].map((y, i) => at(loft(Sy([[0, [.76, .82, .96][i], [.56, .6, .64][i], [.54, .58, .62][i], 3.2], [.14, [.76, .82, .96][i], [.56, .6, .64][i], [.54, .58, .62][i], 3.2]]), {axis: 'y', raw: true, rad: 28}), 0, y - .07, 0));
      const gear = (R, n, th) => { const pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * 6.283, r = i % 2 ? R : R * .82; pts.push([Math.cos(a - .06) * r, Math.sin(a - .06) * r], [Math.cos(a + .06) * r, Math.sin(a + .06) * r]); } return K.extr(pts, th, .01); };
      return [P(hull, 'metal'), P(merge([...bands, at(gear(.5, 10, .14), 0, 2.4, -.74), at(gear(.28, 8, .12), .5, 1.75, -.66), new T.TorusGeometry(.36, .07, 8, 24).translate(0, 2.55, .78), ...rivets(.36, 2.55, 0), ...[-1, 1].flatMap(sd => [1.9, 2.3, 2.7, 3.1].map(y => new T.SphereGeometry(.05, 8, 6).translate(sd * .98, y, .42)))]), 'darkmetal'),
        P(merge([new T.SphereGeometry(.3, 16, 12).scale(1, 1, .5).translate(0, 2.55, .74), ...[-1, 1].map(sd => box(.07, .5, .04, sd * .55, 1.95, .7))]), 'glow')]; });
  const PLATE = {legU: ['_up', 'Construct thigh'], legL: ['_low', 'Construct shin'], armU: ['_up', 'Construct upper arm'], armF: ['_low', 'Construct forearm']};
  for (const [g, arm] of [['Legs & Feet', false], ['Arms & Shoulders', true]]) { const base = 'kf_limb_plate' + (arm ? '_arm' : ''), segBy = Object.fromEntries(Object.entries(PLATE).filter(([t]) => arm === /^arm/.test(t)).map(([t, v]) => [t, base + v[0]]));
    const mk = (id, name, low) => out.push({id, group: g, sub: '⚙ Construct kit', name, fitKind: 'seg', unitLen: 1, perSeg: true, fitBox: [[-.4, 0, -.4], [.4, 1, .4]], segBy, tags: ['kit', 'limb', 'segment', 'construct', 'golem', 'automaton', 'armor', 'clockwork'],
      make: () => [P(loft(Sy(low ? [[.1, .28, .28, .28, 3], [.2, .38, .4, .36, 3.2], [.6, .34, .36, .32, 3.2], [.92, .26, .26, .26, 3], [.98, .2, .2, .2, 3]] : [[.06, .3, .3, .3, 3], [.16, .4, .4, .4, 3.2], [.5, .37, .37, .37, 3.2], [.85, .3, .3, .3, 3], [.94, .22, .22, .22, 3]]), {axis: 'y', rad: 20, per: 3}), 'metal'),
        P(merge([new T.SphereGeometry(.27, 14, 10).translate(0, 0, 0), new T.TorusGeometry(low ? .36 : .39, .04, 6, 20).rotateX(Math.PI / 2).translate(0, low ? .24 : .2, 0), new T.TorusGeometry(low ? .3 : .33, .035, 6, 20).rotateX(Math.PI / 2).translate(0, low ? .8 : .78, 0), ...rivets(low ? .37 : .4, .5, 6)]), 'darkmetal')]});
    mk(base, arm ? 'Construct arm segment' : 'Construct leg segment', false); for (const [t, v] of Object.entries(PLATE)) if (arm === /^arm/.test(t)) mk(base + v[0], v[1], /L$|F$/.test(t)); }
  add('foot_plate', 'Legs & Feet', '⚙ Construct kit', 'Construct boot (armoured)', {fitKind: 'foot', tags: ['construct', 'golem', 'armor', 'boot', 'foot', 'automaton']}, () => [
    P(loft([{a: -.42, w: .3, t: .2, b: .2, y: -.12}, {a: -.1, w: .4, t: .32, b: .22, y: -.1}, {a: .5, w: .42, t: .2, b: .2, y: -.12}, {a: 1.0, w: .36, t: .12, b: .16, y: -.16}, {a: 1.2, w: .22, t: .06, b: .12, y: -.2}].map(s => ({...s, n: 3.2})), {rad: 20, per: 3}), 'metal'),
    P(merge([box(.9, .08, 1.7, 0, -.3, .38), new T.TorusGeometry(.36, .05, 6, 18).rotateX(Math.PI / 2).translate(0, .16, -.05), ...[-1, 1].map(sd => box(.06, .1, .7, sd * .3, -.02, .7))]), 'darkmetal')]);
  add('back_key', 'Back & Armor Plates', '🔌 Back pieces', 'Wind-up key', {plugAs: 'back', tags: ['plug', 'back', 'construct', 'clockwork', 'key', 'toy']}, () => [P(merge([cyl(.07, .07, .7), ...[-1, 1].map(sd => new T.TorusGeometry(.3, .07, 8, 20).translate(sd * .3, 1.0, 0))]), 'gold')]);

  // ====================================================================== 🚀 MECH WEAPONS (grip at the origin, +Y = up the weapon)
  add('wp_missilepod', 'Weapons', 'Mech weapons', 'Missile pod (9 tubes)', {tags: ['mech', 'weapon', 'missile', 'launcher', 'rocket', 'pod']}, () => { const tubes = [], tips = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const x = (i - 1) * .44, z = (j - 1) * .44;
      tubes.push(new T.CylinderGeometry(.18, .18, .3, 12, 1, true).translate(x, 2.25, z)); tips.push(new T.ConeGeometry(.14, .34, 12).translate(x, 2.2, z)); }
    return [P(merge([box(1.5, 1.9, 1.5, 0, 1.35, 0), box(.5, .5, .5, 0, .2, 0), box(1.62, .12, 1.62, 0, 2.3, 0)]), 'paint'), P(merge([...tubes, box(1.56, .1, 1.56, 0, .9, 0), box(1.56, .1, 1.56, 0, 1.7, 0), cyl(.1, .1, .6, 0, -.25, 0)]), 'darkmetal'), P(merge(tips), 'paint2')]; });
  add('wp_beamsaber', 'Weapons', 'Mech weapons', 'Energy blade (beam sword)', {tags: ['mech', 'weapon', 'sword', 'energy', 'beam', 'saber', 'blade']}, () => [
    P(merge([cyl(.11, .13, 1.0, 0, -.5, 0, 12), cyl(.2, .14, .16, 0, .5, 0, 12), cyl(.15, .15, .1, 0, -.56, 0, 12)]), 'metal'), P(merge([new T.TorusGeometry(.12, .025, 6, 14).rotateX(Math.PI / 2).translate(0, .1, 0), new T.TorusGeometry(.12, .025, 6, 14).rotateX(Math.PI / 2).translate(0, -.2, 0)]), 'darkmetal'),
    P(at(loft(Sy([[.6, .12, .12], [.9, .16, .16], [4.6, .13, .13], [5.4, .08, .08], [5.7, .01, .01]]), {axis: 'y', rad: 14, per: 3}), 0, 0, 0), 'glowblue')]);
  add('wp_energyshield', 'Weapons', 'Mech weapons', 'Energy shield (hex field)', {tags: ['mech', 'weapon', 'shield', 'energy', 'force field', 'barrier']}, () => { const g = new T.SphereGeometry(3.2, 28, 14, 0, Math.PI * 2, 0, .62).rotateX(Math.PI / 2).translate(0, .4, -2.7).scale(1, 1.25, 1);
    return [P(g, 'hexshield'), P(merge([box(.5, .9, .3, 0, .3, .1), cyl(.09, .09, .5, 0, -.2, 0, 10), new T.TorusGeometry(.42, .06, 8, 24).translate(0, .4, .3)]), 'darkmetal'), P(new T.SphereGeometry(.2, 12, 10).translate(0, .4, .32), 'glowblue')]; });
  return out;
});
