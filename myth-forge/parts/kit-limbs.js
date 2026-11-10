// Mythic Forge — LIMB KIT (Nov 9 2026, test page). Original, made in code (ours).
// Palms with 🔌 finger + thumb plugs, fingers with a 🔌 claw plug at the tip, claws; feet with 🔌 toe plugs; tail segments with
// 🔌 spike (top), belly and tip plugs; tail tips; back spikes / plates / crystals / sails; weapon arms (scythe, saw, drill stinger, hook).
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const X = window.makeKit(T, K), {loft, ell, spike, claw, at, merge, plug, pair, P, V3} = X, out = [];
  const add = (id, group, sub, name, ex, make) => out.push({id: 'kl_' + id, group, sub, name, tags: ['kit', 'plug', ...(ex.tags || [])], ...ex, make});
  const Sy = rows => rows.map(([a, w, t, b, n]) => ({a, w, t, b: b ?? t, n: n || 2.4}));   // [y, halfWidth, front(+Z), back(-Z), squareness]
  // ---------------- palms (hand bone, +Y toward the fingers, +Z = palm side the fingers curl to)
  const palm = (id, name, mat, nF, ex = {}) => { const W = ex.W || .46, top = ex.top || .95, plugs = [];
    for (let i = 0; i < nF; i++) { const x = nF === 1 ? 0 : -W * .72 + i * (W * 1.44 / (nF - 1)); plugs.push(plug('f' + (i + 1), 'finger', [x, top, .02], [x * .25, 1, .06], 'out', {s: ex.fs || .85 * (1 - Math.abs(x) * .3)})); }
    if (ex.thumb !== false) plugs.push(plug('thumb', 'finger', [W * .92, top * .38, .1], [.85, .45, .35], 'out', {s: (ex.fs || .85) * .78}));
    add('palm_' + id, 'Hands & Claws', '🔌 Palms', name, {fitKind: 'hand', plugs, tags: ['palm', 'hand', ...(ex.tags || [])]},
      () => [P(loft(Sy([[0, W * .62, .17, .15], [top * .45, W, .2, .17], [top * .9, W * 1.02, .16, .14], [top, W * .92, .12, .1]]), {axis: 'y', rad: 24, per: 4, noise: ex.noise || [.01, 5]}), mat)]); };
  palm('beast', 'Beast palm (4 fingers + thumb)', 'scale', 4, {tags: ['beast', 'dragon']});
  palm('kaiju', 'Kaiju palm (3 fingers + thumb)', 'scale', 3, {W: .52, fs: 1, tags: ['kaiju']});
  palm('human', 'Humanoid palm (4 fingers + thumb)', 'skin', 4, {W: .4, fs: .8, tags: ['human', 'ape']});
  palm('mech', 'Mech palm (4 fingers + thumb)', 'metal', 4, {W: .44, fs: .82, noise: [0, 1], tags: ['mech', 'robot']});
  palm('two', 'Two-finger grip palm', 'chitin', 2, {W: .4, fs: 1.1, thumb: true, tags: ['bug', 'alien']});
  // ---------------- fingers (+Y out, curl toward +Z), 🔌 claw plug at the tip
  function finger(L, r, curl, segs = 3, knuckle = 1.12) { const pts = [V3(0, 0, 0)]; let a = 0, y = 0, z = 0; for (let i = 0; i < segs; i++) { a += curl / segs; y += Math.cos(a) * L / segs; z += Math.sin(a) * L / segs; pts.push(V3(0, y, z)); }
    const c = new T.CatmullRomCurve3(pts), g = K.taper(c, t => r * (1 - .35 * t) * (1 + (knuckle - 1) * Math.max(0, Math.cos(t * segs * Math.PI * 2)) ), 0, 18, 10);
    const end = pts[pts.length - 1], tan = c.getTangentAt(1); return {g, tip: [0, +end.y.toFixed(3), +end.z.toFixed(3)], dir: [0, +tan.y.toFixed(3), +tan.z.toFixed(3)]}; }
  const fingerPart = (id, name, mat, L, r, curl, ex = {}) => { const f = finger(L, r, curl, ex.segs || 3, ex.kn || 1.12);
    add('finger_' + id, 'Hands & Claws', '🔌 Fingers & toes', name, {plugAs: 'finger', plugs: ex.noClaw ? [] : [plug('claw', 'claw', f.tip, f.dir, 'out', {s: ex.cs || 1, back: [0, -1, 0]})], tags: ['finger', 'toe', ...(ex.tags || [])]}, () => [P(f.g, mat), ...(ex.extra ? ex.extra(f) : [])]); };
  fingerPart('beast', 'Clawed finger', 'scale', .8, .1, .6);
  fingerPart('kaiju', 'Thick kaiju finger', 'scale', .75, .14, .5, {kn: 1.15});
  fingerPart('bony', 'Long bony finger', 'bone', 1.25, .07, .8, {segs: 4, kn: 1.3});
  fingerPart('human', 'Humanoid finger', 'skin', .7, .075, .35, {cs: .5});
  fingerPart('mech', 'Mech finger', 'metal', .7, .085, .3, {kn: 1.35, cs: .6});
  fingerPart('tentacle', 'Tentacle finger', 'flesh', 1.2, .09, 1.4, {segs: 6, kn: 1, noClaw: true});
  fingerPart('blade', 'Blade finger', 'darkmetal', 1.1, .05, .2, {noClaw: true, extra: f => [P(at(K.taper(K.bez(V3(), V3(0, .5, .02), V3(0, 1, .12)), .12, .01, 10, 6, .15), 0, f.tip[1] * .4, f.tip[2] * .4), 'metal')]});
  // ---------------- claws (base at origin, +Y out, hook toward +Z)
  add('claw_hook', 'Hands & Claws', '🔌 Claws', 'Hooked claw', {plugAs: 'claw', tags: ['claw', 'talon']}, () => [P(claw(.45, .07, .6), 'horn')]);
  add('claw_talon', 'Hands & Claws', '🔌 Claws', 'Long talon', {plugAs: 'claw', tags: ['claw', 'talon', 'bird']}, () => [P(claw(.75, .07, .9), 'horn')]);
  add('claw_nail', 'Hands & Claws', '🔌 Claws', 'Blunt nail', {plugAs: 'claw', tags: ['nail']}, () => [P(ell(.07, .09, .03, 0, .05, .04), 'horn')]);
  add('claw_crystal', 'Hands & Claws', '🔌 Claws', 'Crystal claw', {plugAs: 'claw', tags: ['crystal']}, () => [P(new T.ConeGeometry(.07, .5, 5).translate(0, .25, 0), 'crystal')]);
  add('claw_bone', 'Hands & Claws', '🔌 Claws', 'Bone spike claw', {plugAs: 'claw', tags: ['bone']}, () => [P(spike(.6, .07, -.1), 'bone')]);
  add('claw_mech', 'Hands & Claws', '🔌 Claws', 'Mech claw tip', {plugAs: 'claw', tags: ['mech']}, () => [P(claw(.35, .06, .4, .5), 'darkmetal')]);
  // ---------------- feet: modelled standing up like the mech feet (ankle at the origin, +Y up, toes toward +Z, sole at the bottom), the fit keeps them level with the ground; toes curl down
  const foot = (id, name, mat, nT, ex = {}) => { const W = ex.W || .5, plugs = [];
    for (let i = 0; i < nT; i++) { const x = nT === 1 ? 0 : -W * .7 + i * (W * 1.4 / (nT - 1)); plugs.push(plug('t' + (i + 1), 'toe', [x, -.32, 1.0], [x * .5, -.12, 1], 'out', {s: ex.ts || .8, back: [0, 1, 0]})); }
    if (ex.back) plugs.push(plug('tback', 'toe', [0, -.32, -.32], [0, -.15, -1], 'out', {s: (ex.ts || .8) * .8, back: [0, 1, 0]}));
    const S = rows => rows.map(([a, w, yt, yb, n]) => ({a, w, t: (yt - yb) / 2, b: (yt - yb) / 2, y: (yt + yb) / 2, n: n || 2.6}));
    add('foot_' + id, 'Legs & Feet', '🔌 Feet', name, {fitKind: 'foot', plugs, tags: ['foot', ...(ex.tags || [])]},
      () => [P(loft(S([[-.42, W * .5, .05, -.5], [-.1, W * .72, .12, -.52], [.35, W * .9, -.02, -.52], [.8, W, -.12, -.5], [1.02, W * .92, -.2, -.46]]), {rad: 24, per: 4, noise: [.01, 5]}), mat)]); };
  foot('dragon', 'Dragon foot (4 toes)', 'scale', 4, {tags: ['dragon', 'kaiju']});
  foot('kaiju', 'Kaiju foot (3 toes)', 'scale', 3, {W: .6, ts: 1, tags: ['kaiju', 'dinosaur']});
  foot('bird', 'Bird foot (3 + back toe)', 'scale', 3, {W: .35, ts: 1.1, back: true, tags: ['bird', 'griffin', 'raptor']});
  foot('paw', 'Beast paw (4 toes)', 'fur', 4, {W: .5, ts: .55, tags: ['paw', 'wolf', 'lion']});
  foot('human', 'Humanoid foot (5 toes)', 'skin', 5, {W: .42, ts: .4, tags: ['human']});
  // ---------------- limb segments: one per arm / leg bone (0..1 along +Y), so the hands and feet from the kit show (legs with built-in feet hide them)
  // rounded ends (ball joints): the ends of each segment are domes that sink into the next one, so bent knees / elbows show no gap or flat cuff
  const dome = secs => { const a = secs[0], z = secs[secs.length - 1], k = (r, f) => [r[0], r[1] * f, r[2] * f, (r[3] ?? r[2]) * f, r[4]];
    return [[a[0] - a[1] * .42, a[1] * .3, a[2] * .3, (a[3] ?? a[2]) * .3, a[4]], [a[0] - a[1] * .3, a[1] * .68, a[2] * .68, (a[3] ?? a[2]) * .68, a[4]], [a[0] - a[1] * .12, a[1] * .93, a[2] * .93, (a[3] ?? a[2]) * .93, a[4]], ...secs,
      k([z[0] + z[1] * .12, z[1], z[2], z[3], z[4]], .93), k([z[0] + z[1] * .3, z[1], z[2], z[3], z[4]], .68), k([z[0] + z[1] * .42, z[1], z[2], z[3], z[4]], .3)]; };
  const lseg = (id, name, mat, secs0, ex = {}) => { const secs = ex.flatEnds ? secs0 : dome(secs0); for (const [g, sub] of [['Legs & Feet', '🔌 Limb segments'], ['Arms & Shoulders', '🔌 Limb segments']]) out.push({id: 'kl_limb_' + id + (g === 'Arms & Shoulders' ? '_arm' : ''), group: g, sub, name, fitKind: 'seg', unitLen: 1, perSeg: true, ...(ex.fitBox ? {fitBox: ex.fitBox} : {}), tags: ['kit', 'limb', 'segment', ...(ex.tags || [])],
      make: () => [P(loft(Sy(secs), {axis: 'y', rad: 22, per: 4, noise: ex.noise || [.015, 5]}), mat), ...(ex.extra ? ex.extra() : [])]}); };
  lseg('scaly', 'Muscled scaly limb', 'scale', [[0, .4, .4, .4], [.22, .5, .5, .54], [.48, .5, .46, .56], [.78, .4, .38, .42], [1, .37, .37, .37]], {tags: ['kaiju', 'dragon']});
  lseg('fur', 'Furry limb', 'fur', [[0, .4, .4, .4], [.25, .5, .48, .54], [.6, .44, .42, .48], [1, .35, .35, .35]], {noise: [.03, 4], tags: ['beast', 'wolf', 'lion']});
  lseg('feather', 'Feathered limb', 'feather', [[0, .4, .4, .4], [.25, .52, .5, .56], [.6, .44, .42, .5], [1, .33, .33, .33]], {noise: [.035, 5], tags: ['bird', 'griffin', 'angel']});
  lseg('skin', 'Humanoid limb', 'skin', [[0, .36, .36, .36], [.25, .45, .44, .48], [.55, .42, .4, .46], [.82, .34, .33, .35], [1, .31, .31, .31]], {tags: ['human', 'ape']});
  lseg('chitin', 'Bug limb (jointed)', 'chitin', [[0, .4, .4], [.1, .44, .44], [.22, .3, .3], [.6, .27, .27], [.88, .26, .26], [1, .36, .36]], {fitBox: [[-.7, 0, -.7], [.7, 1, .7]], noise: [.004, 4], tags: ['bug', 'mantis', 'wasp', 'spider', 'crab']});
  lseg('mech', 'Mech limb (piston)', 'metal', [[-.06, .4, .4, .4, 4], [.1, .46, .46, .46, 4], [.45, .38, .38, .38, 4], [.85, .44, .44, .44, 4], [1.04, .36, .36, .36, 4]], {flatEnds: 1, noise: [0, 1], tags: ['mech'], extra: () => [P(at(X.seg(.8, .12), .3, .1, .3), 'darkmetal')]});
  lseg('bone', 'Bone limb (undead)', 'bone', [[0, .34, .34], [.08, .38, .38], [.2, .18, .18], [.85, .16, .16], [1, .34, .34]], {noise: [.01, 6], tags: ['undead', 'skeleton']});
  // ---------------- bug leg tip: the last (foot) bone of a bug leg — a jointed claw that tapers to a point on the ground
  out.push({id: 'kl_foot_bugtip', group: 'Legs & Feet', sub: '🔌 Feet', name: 'Bug leg tip (claw point)', fitKind: 'seg', unitLen: 1, perSeg: true, fitBox: [[-.8, 0, -.8], [.8, 1, .8]], tags: ['kit', 'bug', 'spider', 'crab', 'foot', 'tip'],
    make: () => [P(loft(Sy(dome([[0, .4, .4], [.12, .44, .44], [.3, .32, .32], [.6, .2, .2], [.85, .1, .1], [1, .03, .03]]).slice(0, -3)), {axis: 'y', rad: 18, per: 4, noise: [.004, 4]}), 'chitin'), P(merge([-1, 1].map(s => at(claw(.3, .07, .7), s * .12, .08, .2, 50, 0, s * 20))), 'horn')]});
  // ---------------- humanoid upper body on one bone (centaur / taur upper halves, statues): waist at 0, shoulders at 1, +Z = chest
  out.push({id: 'kl_torso_human', group: 'Torsos & Bellies', sub: 'Chests', name: 'Humanoid upper body (one bone)', fitKind: 'seg', unitLen: 1, perSeg: true, fitBox: [[-.95, 0, -.6], [.95, 1, .6]], tags: ['kit', 'centaur', 'taur', 'human', 'torso', 'upper body'],
    make: () => [P(loft(Sy(dome([[0, .46, .34, .32], [.25, .44, .32, .3], [.55, .6, .42, .36], [.82, .74, .44, .38], [1, .6, .32, .32]])), {axis: 'y', rad: 28, per: 4, noise: [.012, 5]}), 'skin'),
      P(merge([ell(.26, .16, .12, .28, .72, .36), ell(.26, .16, .12, -.28, .72, .36), ...[0, 1, 2].flatMap(i => [-1, 1].map(sd => ell(.11, .07, .06, sd * .13, .44 - i * .14, .33)))]), 'skin')]});
  // ---------------- eye stalk (crab / lobster / snail): thin stalk with the eye on the end; fitBox keeps it thin on a 'neck' bone
  out.push({id: 'kl_eyestalk', group: 'Necks & Spines', sub: 'Eye stalks', name: 'Eye on a stalk', fitKind: 'seg', unitLen: 1, perSeg: true, fitBox: [[-.9, 0, -.9], [.9, 1, .9]], tags: ['kit', 'eye', 'stalk', 'crab', 'lobster', 'snail'],
    make: () => [P(K.taper(K.bez(V3(), V3(0, .5, .05), V3(0, .9, 0)), .16, .11, 12, 10), 'chitin'), P(ell(.3, .3, .3, 0, 1.0, 0, 18), 'eye'), P(ell(.14, .14, .08, 0, 1.02, .26, 12), 'darkmetal')]});
  // ---------------- neck segments: one per neck bone, so any neck (short, long, three of them) is covered and bends with its bones
  const nseg = (id, name, mat, secs, ex = {}) => out.push({id: 'kl_neckseg_' + id, group: 'Necks & Spines', sub: 'Necks', name, fitKind: 'seg', unitLen: 1, perSeg: true, tags: ['kit', 'neck', 'segment', ...(ex.tags || [])],
    make: () => [P(loft(Sy(dome(secs)), {axis: 'y', rad: 24, per: 4, noise: ex.noise || [.015, 5]}), mat), ...(ex.extra ? ex.extra() : [])]});
  nseg('scaly', 'Scaly neck', 'scale', [[0, .56, .56, .6], [.5, .5, .5, .54], [1, .46, .46, .48]], {tags: ['dragon', 'kaiju', 'hydra'], extra: () => [P(merge([.2, .5, .8].map(y => at(loft(Sy([[0, .34, .05, .03, 3], [.24, .34, .05, .03, 3]]), {axis: 'y', raw: true, rad: 12}), 0, y - .12, .5 - y * .05))), 'skin')]});
  nseg('fur', 'Furry neck', 'fur', [[0, .58, .58, .62], [.5, .52, .5, .58], [1, .46, .46, .5]], {noise: [.04, 4], tags: ['beast', 'wolf', 'lion', 'horse']});
  nseg('skin', 'Humanoid neck', 'skin', [[0, .52, .5, .56], [.35, .44, .42, .48], [1, .42, .42, .44]], {tags: ['human', 'ape', 'giant']});
  nseg('feather', 'Feathered neck', 'feather', [[0, .58, .6, .6], [.5, .5, .52, .52], [1, .42, .42, .44]], {noise: [.04, 5], tags: ['bird', 'griffin']});
  nseg('chitin', 'Bug neck (ringed)', 'chitin', [[0, .5, .5], [.2, .56, .56], [.4, .44, .44], [.6, .52, .52], [.8, .42, .42], [1, .48, .48]], {noise: [.004, 4], tags: ['bug', 'mantis']});
  nseg('rock', 'Boulder neck', 'stone', [[0, .6, .6], [.5, .66, .62], [1, .54, .54]], {noise: [.07, 2.2], tags: ['golem', 'stone', 'elemental']});
  // ---------------- tail segments: one per tail bone (0..1 along +Y), 🔌 spike on top (world up), belly underneath, tip at the end
  const tseg = (id, name, mat, ex = {}) => add('tailseg_' + id, 'Tails', '🔌 Tail segments', name, {fitKind: 'seg', unitLen: 1, perSeg: true, plugs: [
      plug('tip', 'tailtip', [0, 1, 0], [0, 1, 0], 'out', {s: ex.ts || .55, segEnd: 1}), plug('back1', 'back', [0, .5, 0], [0, 0, -1], 'out', {up: 'world', s: .5, back: [0, -1, 0]}), plug('belly1', 'belly', [0, .5, 0], [0, 0, 1], 'out', {up: 'world', down: 1, s: .5, back: [0, -1, 0]})], tags: ['tail', 'segment', ...(ex.tags || [])]},
    () => [P(loft(Sy(ex.flatEnds ? ex.secs : dome(ex.secs || [[0, .5, .5], [.3, .52, .52], [.7, .47, .47], [1, .44, .44]])), {axis: 'y', rad: 22, per: 3, noise: ex.noise || [.015, 5]}), mat), ...(ex.extra ? ex.extra() : [])]);
  tseg('scaly', 'Scaly tail segment', 'scale');
  tseg('ringed', 'Ringed bug segment', 'chitin', {secs: [[-.05, .5, .5], [.15, .56, .56], [.8, .46, .46], [1.0, .5, .5]], noise: [.005, 4], tags: ['bug', 'scorpion']});
  tseg('plated', 'Armored segment (plate on top)', 'scale', {extra: () => [P(at(loft(Sy([[0, .42, .08, .08, 3], [.5, .48, .1, .1, 3], [.95, .4, .06, .06, 3]]), {axis: 'y', rad: 16}), 0, 0, -.48), 'stone')], tags: ['armor']});
  tseg('flesh', 'Fleshy segment', 'flesh', {noise: [.04, 3], tags: ['horror', 'ooze']});
  tseg('mech', 'Mech segment', 'metal', {flatEnds: 1, secs: [[-.05, .44, .44, .44, 4], [.1, .5, .5, .5, 4], [.85, .46, .46, .46, 4], [1.0, .4, .4, .4, 4]], noise: [0, 1], tags: ['mech']});
  // ---------------- tail tips (+Y out of the last segment)
  const tip = (id, name, mat, make, ex = {}) => add('tip_' + id, 'Tails', '🔌 Tail tips', name, {plugAs: 'tailtip', plugs: [], tags: ['tail tip', ...(ex.tags || [])]}, make);
  const flat = (pts, th) => X.panel(pts, th).rotateX(0);
  tip('spade', 'Spade tip', 'scale', () => [P(at(flat([[0, -.1], [.6, .5], [.15, .55], [0, 1.4], [-.15, .55], [-.6, .5]], .1), 0, 0, 0, 90, 0, 0).rotateX(-Math.PI / 2), 'scale')], {tags: ['dragon', 'demon']});
  tip('club', 'Club tip', 'bone', () => [P(merge([ell(.55, .45, .5, 0, .45, 0, 18), ...[0, 1, 2, 3].map(i => at(spike(.35, .1), Math.cos(i * 1.57) * .45, .45, Math.sin(i * 1.57) * .45, 0, -i * 90, 90))]), 'bone')], {tags: ['ankylo', 'club']});
  tip('blade', 'Blade tip', 'metal', () => [P(K.taper(K.bez(V3(), V3(0, .7, -.1), V3(0, 1.6, .2)), .3, .01, 14, 8, .12), 'metal')], {tags: ['blade', 'weapon']});
  tip('stinger', 'Stinger', 'chitin', () => [P(merge([ell(.25, .35, .25, 0, .25, 0, 16), at(claw(.8, .1, 1.1), 0, .45, 0)]), 'chitin'), P(ell(.04, .06, .04, 0, 1.1, .45), 'glow')], {tags: ['scorpion', 'wasp', 'bee']});
  tip('fin', 'Fin fan tip', 'membrane', () => [P(flat([[0, 0], [.9, 1.2], [.3, 1.0], [0, 1.4], [-.3, 1.0], [-.9, 1.2]], .04), 'membrane')], {tags: ['fish', 'sea']});
  tip('tuft', 'Fur tuft (lion)', 'fur', () => [P(K.noise(ell(.3, .55, .3, 0, .45, 0, 14), .08, 4), 'fur')], {tags: ['lion', 'chimera']});
  tip('crystal', 'Crystal cluster tip', 'crystal', () => [P(merge([new T.ConeGeometry(.2, 1.2, 6).translate(0, .6, 0), at(new T.ConeGeometry(.12, .7, 6).translate(0, .35, 0), .1, 0, 0, 0, 0, -25), at(new T.ConeGeometry(.12, .6, 6).translate(0, .3, 0), -.1, 0, .05, 20, 0, 25)]), 'crystal')], {tags: ['crystal']});
  tip('flame', 'Spirit flame tip', 'glow', () => [P(K.noise(K.taper(K.bez(V3(), V3(.1, .5, 0), V3(-.1, 1.2, 0)), .3, .01, 14, 10), .05, 4), 'glow')], {tags: ['fire', 'spirit']});
  tip('feather', 'Feather tuft', 'feather', () => [P(merge([-1, 0, 1].map(i => at(X.feather(1.1, .18), i * .12, 0, 0, 0, 0, -i * 18))), 'feather')], {tags: ['bird', 'angel']});
  // snake-head tip (the Chimera's tail): small wedge head with an open mouth
  tip('snakehead', 'Snake head tip', 'scale', () => { const S = rows => rows.map(([a, w, yt, yb, n]) => ({a, w, t: (yt - yb) / 2, b: (yt - yb) / 2, y: (yt + yb) / 2, n: n || 2.4}));
    const up = loft(S([[0, .25, .2, -.05], [.35, .32, .26, -.02], [.7, .24, .2, .0], [.9, .12, .12, .02]]), {rad: 20}), lo = at(loft(S([[0, .22, .02, -.12], [.5, .18, .02, -.1], [.8, .08, .02, -.05]]), {rad: 16}), 0, -.04, .05, 25);
    const g1 = new T.Matrix4().makeRotationX(-Math.PI / 2); up.applyMatrix4(g1); lo.applyMatrix4(g1); return [P(up, 'scale'), P(lo, 'scale'), P(at(merge([spike(.15, .025), at(spike(.15, .025), .12, 0, 0)]), -.06, .75, .04, 180), 'tooth'), P(merge([ell(.05, .05, .05, .15, .45, .12), ell(.05, .05, .05, -.15, .45, .12)]), 'glow')]; }, {tags: ['chimera', 'snake', 'head']});
  // ---------------- back spikes / plates / crystals / sails (+Y out of the back, sweep back -Z)
  const bk = (id, name, mat, make, ex = {}) => add('back_' + id, 'Back & Armor Plates', '🔌 Back spikes', name, {plugAs: 'back', tags: ['back', 'spike', ...(ex.tags || [])]}, make);
  bk('spike', 'Back spike', 'horn', () => [P(spike(1.1, .2, .35), 'horn')]);
  bk('plate', 'Dorsal plate', 'stone', () => [P(X.panel([[-.6, 0], [-.4, .7], [0, 1.4], [.45, .75], [.6, 0]], .12).rotateY(Math.PI / 2), 'stone')], {tags: ['stego', 'kaiju']});
  bk('crystal', 'Crystal shard', 'crystal', () => [P(merge([new T.ConeGeometry(.28, 1.6, 6).translate(0, .8, 0), at(new T.ConeGeometry(.16, .9, 6).translate(0, .45, 0), .15, 0, 0, 0, 0, -22)]), 'crystal')], {tags: ['crystal', 'kaiju']});
  bk('sail', 'Sail fin', 'membrane', () => [P(X.panel([[-.8, 0], [-.5, 1.3], [.2, 1.6], [.8, 0]], .05).rotateY(Math.PI / 2), 'membrane'), P(merge([-.5, -.1, .3].map(z => at(spike(1.4, .05, .05), 0, 0, z))), 'bone')], {tags: ['spino', 'fin']});
  bk('fin', 'Fish fin (back)', 'membrane', () => [P(X.panel([[-.5, 0], [-.3, .8], [.6, .3], [.5, 0]], .04).rotateY(Math.PI / 2), 'membrane')], {tags: ['fish']});
  bk('mech', 'Mech fin', 'metal', () => [P(X.panel([[-.4, 0], [-.2, 1.1], [.3, .9], [.4, 0]], .12).rotateY(Math.PI / 2), 'metal')], {tags: ['mech']});
  bk('quills', 'Quill bundle', 'horn', () => [P(merge([0, 1, 2, 3, 4].map(i => at(spike(1.2 - i * .1, .04, .2), (i - 2) * .08, 0, 0, 0, 0, (i - 2) * 9))), 'horn')], {tags: ['porcupine', 'quills']});
  add('belly_plate', 'Back & Armor Plates', '🔌 Belly plates', 'Belly scute', {plugAs: 'belly', tags: ['belly', 'plate']}, () => [P(loft([{a: 0, w: .45, t: .06, b: .02, n: 3}, {a: .7, w: .5, t: .06, b: .02, n: 3}], {axis: 'y', raw: true, rad: 16}), 'horn')]);
  // ---------------- weapon arms (swap a hand: scythe, saw, drill stinger, hook) — for mantis / wasp / fossil blade-walker builds
  const warm = (id, name, mat, make, ex = {}) => add('arm_' + id, 'Hands & Claws', '🔪 Weapon arms', name, {fitKind: 'hand', tags: ['weapon arm', ...(ex.tags || [])]}, make);
  warm('scythe', 'Scythe blade arm', 'chitin', () => [P(merge([ell(.22, .4, .22, 0, .3, 0, 14), K.taper(K.bez(V3(0, .5, 0), V3(0, 1.6, .2), V3(0, 2.4, 1.4)), .28, .02, 24, 8, .14)]), 'chitin'), P(merge([0, 1, 2, 3, 4, 5].map(i => at(spike(.14, .03), 0, .9 + i * .25, .15 + i * .07, 60))), 'horn')], {tags: ['mantis', 'scythe', 'blade']});
  warm('saw', 'Saw blade arm', 'metal', () => [P(merge([ell(.2, .35, .2, 0, .3, 0, 12), K.taper(K.bez(V3(0, .5, 0), V3(0, 1.4, .05), V3(0, 2.2, .1)), .32, .1, 16, 6, .12)]), 'metal'), P(merge([...Array(10).keys()].map(i => at(spike(.15, .05), 0, .7 + i * .15, .3, 90))), 'darkmetal')], {tags: ['saw', 'blade']});
  warm('drill', 'Drill stinger arm', 'chitin', () => { const g = K.taper(K.bez(V3(), V3(0, 1, 0), V3(0, 2.2, 0)), t => .32 * (1 - t) * (1 + .18 * Math.sin(t * 50)), 0, 60, 12); return [P(g, 'chitin'), P(ell(.33, .25, .33, 0, .1, 0), 'paint')]; }, {tags: ['wasp', 'bee', 'drill', 'stinger']});
  warm('hook', 'Hook claw arm', 'horn', () => [P(merge([ell(.22, .4, .22, 0, .3, 0, 14), claw(1.8, .2, 1.4, .5)]), 'horn')], {tags: ['hook', 'fossil', 'blade']});
  return out;
});
