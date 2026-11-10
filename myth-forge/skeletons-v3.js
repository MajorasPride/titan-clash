// Mythic Forge — new body types (Nov 9 2026, test page). Same bone format as skeletons.js: [name, parent, head xyz, tail xyz, tag, opts].
(function () {
  const T = window.FORGE_SKEL; if (!T) return;
  const side = (b, s) => b.map(([n, p, h, t, tag, o]) => [n + (s > 0 ? '.L' : '.R'), p && p.endsWith('#') ? p.slice(0, -1) + (s > 0 ? '.L' : '.R') : p, [s * Math.abs(h[0]), h[1], h[2]], [s * Math.abs(t[0]), t[1], t[2]], tag, o]);
  const both = b => [...side(b, 1), ...side(b, -1)];
  const chain = (name, parent, pts, tag) => pts.slice(0, -1).map((h, i) => [name + (i + 1), i ? name + i : parent, h, pts[i + 1], tag]);
  const HEAD = (n, par, h, len = 1.2, fwd = .3) => [[n, par, h, [h[0], h[1] + len, h[2] + fwd], 'head', {up: 1}], [n.replace('head', 'jaw') === n ? n + 'jaw' : n.replace('head', 'jaw'), n, [h[0], h[1] + .1, h[2] + .3], [h[0], h[1] - .1, h[2] + 1.3], 'jaw', {up: 1}]];
  const quad = T.quad.bones;
  // 🦁 Chimera: lion body, a goat head growing out of its back, a snake tail (put the 🐍 Snake head tip on the tail's end plug)
  T.chimera = {name: 'Chimera (lion + goat + snake tail)', bones: [...quad.map(b => b[0] === 'neck' ? ['neck', 'chest', [0, 5.6, 2.2], [0, 7.2, 3.2], 'neck'] : b[0] === 'head' ? ['head', 'neck', [0, 7.2, 3.2], [0, 8.4, 3.6], 'head', {up: 1}] : b[0] === 'jaw' ? ['jaw', 'head', [0, 7.3, 3.5], [0, 7.0, 4.6], 'jaw', {up: 1}] : b),
    ['goatneck', 'spine', [0, 5.8, 0], [0, 7.6, -.3], 'neck'], ['goathead', 'goatneck', [0, 7.6, -.3], [0, 8.6, 0], 'head', {up: 1}], ['goatjaw', 'goathead', [0, 7.7, 0], [0, 7.5, .9], 'jaw', {up: 1}]]};
  // 🐲 Hydra with wing-arms: 2 legs, the arms are the wings, 3 necks, 2 tails
  const wy = T.wyvern.bones.filter(b => !/^(neck|head|jaw|tail)/.test(b[0]));
  T.hydra2 = {name: 'Hydra (2 legs, wing-arms, 3 heads)', bones: [...wy,
    ...[[-1, 'L'], [0, 'M'], [1, 'R']].flatMap(([x, n]) => [['neck' + n, 'chest', [x * .5, 8.4, .2], [x * 1.4, 10.2, 1.0], 'neck'], ['neck' + n + '2', 'neck' + n, [x * 1.4, 10.2, 1.0], [x * 1.9, 11.6, 1.6], 'neck'],
      ['head' + n, 'neck' + n + '2', [x * 1.9, 11.6, 1.6], [x * 1.9, 12.6, 2.0], 'head', {up: 1}], ['jaw' + n, 'head' + n, [x * 1.9, 11.7, 1.9], [x * 1.9, 11.5, 2.9], 'jaw', {up: 1}]]),
    ...chain('tailA', 'hips', [[-.3, 5.1, -.6], [-.6, 4.4, -2], [-1.1, 3.6, -3.6], [-1.7, 2.8, -5], [-2.3, 2.1, -6.4]], 'tail'),
    ...chain('tailB', 'hips', [[.3, 5.1, -.6], [.6, 4.4, -2], [1.1, 3.6, -3.6], [1.7, 2.8, -5], [2.3, 2.1, -6.4]], 'tail')]};
  // 🦗 Mantis: tall front body, raptor arms (put 🔪 scythe arms on the hands), 4 walking legs, wings, abdomen
  const bugLeg = (i, z, a, y = 3, reach = 3.6) => both([['leg' + i, 'body', [.7, y, z], [2.4, y + 1.6, z + a], 'legU'], ['leg' + i + 'b', 'leg' + i + '#', [2.4, y + 1.6, z + a], [reach, .3, z + a * 1.6], 'legL'], ['leg' + i + 'c', 'leg' + i + 'b#', [reach, .3, z + a * 1.6], [reach + .5, 0, z + a * 1.8], 'foot']]);
  T.mantis = {name: 'Mantis (blade arms)', bones: [['body', null, [0, 3.2, -.8], [0, 3.6, .8], 'chest'], ['abdomen', 'body', [0, 3.4, -.8], [0, 3.0, -5.6], 'tail'], ['neck', 'body', [0, 3.6, .8], [0, 7.0, 2.0], 'neck'],
    ['head', 'neck', [0, 7.0, 2.0], [0, 7.8, 2.6], 'head', {up: 1}], ['jaw', 'head', [0, 6.9, 2.4], [0, 6.6, 3.0], 'jaw', {up: 1}],
    ...both([['shoulder', 'neck', [.4, 6.2, 1.8], [.9, 6.0, 2.0], 'armU'], ['upperarm', 'shoulder#', [.9, 6.0, 2.0], [1.1, 4.4, 3.4], 'armU'], ['forearm', 'upperarm#', [1.1, 4.4, 3.4], [1.0, 6.0, 4.4], 'armF'], ['hand', 'forearm#', [1.0, 6.0, 4.4], [.9, 5.0, 5.4], 'hand'],
      ['antenna', 'head', [.25, 7.7, 2.5], [1.2, 10, 4.2], 'extra'], ['wing', 'body', [.5, 3.9, .2], [1.2, 4.3, -4.8], 'wingA']]), ...bugLeg(1, .2, .6), ...bugLeg(2, -.6, -.6)]};
  // 🐝 Wasp: 4 wings (front + hind), front legs are arms (put 🔪 drill stinger arms on them), stinger abdomen
  T.wasp = {name: 'Wasp / bee (4 wings)', bones: [['body', null, [0, 4, -.6], [0, 4.3, 1.2], 'chest'], ['waist', 'body', [0, 4, -.6], [0, 3.8, -1.4], 'tail'], ['abdomen', 'waist', [0, 3.8, -1.4], [0, 2.6, -5.2], 'tail'],
    ['head', 'body', [0, 4.3, 1.2], [0, 5.3, 2.0], 'head', {up: 1}], ['jaw', 'head', [0, 4.1, 1.8], [0, 3.8, 2.5], 'jaw', {up: 1}],
    ...both([['shoulder', 'body', [.5, 4.0, 1.0], [1.0, 3.9, 1.3], 'armU'], ['upperarm', 'shoulder#', [1.0, 3.9, 1.3], [1.8, 2.6, 2.4], 'armU'], ['forearm', 'upperarm#', [1.8, 2.6, 2.4], [1.6, 3.6, 3.8], 'armF'], ['hand', 'forearm#', [1.6, 3.6, 3.8], [1.5, 3.7, 4.8], 'hand'],
      ['antenna', 'head', [.25, 5.2, 1.9], [1.1, 7.2, 3.6], 'extra'], ['wing', 'body', [.5, 4.6, .6], [5.6, 5.8, -.4], 'wingA'], ['hindwing', 'body', [.5, 4.4, -.1], [4.0, 4.6, -1.6], 'wingA']]), ...bugLeg(2, -.1, .1, 3.6, 3.2), ...bugLeg(3, -.6, -.6, 3.6, 3.2)]};
  // 🦂 Upright bug (fossil blade-walker): stands on 2 legs, hook / scythe arms, short segmented tail
  T.uprightbug = {name: 'Upright bug (2 legs, blade arms)', bones: [['hips', null, [0, 4.6, 0], [0, 5.6, .1], 'spine'], ['spine', 'hips', [0, 5.6, .1], [0, 7.0, .3], 'spine'], ['chest', 'spine', [0, 7.0, .3], [0, 8.4, .5], 'chest'],
    ['neck', 'chest', [0, 8.4, .5], [0, 9.0, .9], 'neck'], ['head', 'neck', [0, 9.0, .9], [0, 10.0, 1.2], 'head', {up: 1}], ['jaw', 'head', [0, 9.0, 1.4], [0, 8.8, 2.0], 'jaw', {up: 1}],
    ...both([['shoulder', 'chest', [.6, 8.2, .3], [1.4, 8.2, .3], 'armU'], ['upperarm', 'shoulder#', [1.4, 8.2, .3], [1.9, 6.6, .9], 'armU'], ['forearm', 'upperarm#', [1.9, 6.6, .9], [2.0, 7.6, 2.2], 'armF'], ['hand', 'forearm#', [2.0, 7.6, 2.2], [2.0, 7.0, 3.2], 'hand'],
      ['thigh', 'hips', [.8, 4.6, 0], [1.2, 2.6, .8], 'legU'], ['shin', 'thigh#', [1.2, 2.6, .8], [1.1, .6, -.6], 'legL'], ['foot', 'shin#', [1.1, .6, -.6], [1.1, 0, .6], 'foot']]),
    ...chain('tail', 'hips', [[0, 4.5, -.6], [0, 3.6, -1.8], [0, 2.6, -2.8], [0, 1.6, -3.4]], 'tail')]};
  // 🐙 Kraken: huge mantle with fins, 8 arms + 2 long hunting tentacles
  const kr = []; for (let i = 0; i < 8; i++) { const a = (i + .5) / 8 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); kr.push(...chain('arm' + i, 'body', [[s * .9, 2.2, 2.6 + c * .9], [s * 2.4, 1.2, 3.6 + c * 2.4], [s * 3.6, .7, 4.2 + c * 3.8], [s * 4.6, .5, 4.6 + c * 5.0], [s * 5.4, .9, 4.8 + c * 6.0]], 'tail')); }
  for (const sd of [-1, 1]) kr.push(...chain('hunt' + (sd > 0 ? 'L' : 'R'), 'body', [[sd * .4, 2.4, 3.2], [sd * 1.0, 2.0, 5.2], [sd * 1.6, 1.6, 7.4], [sd * 2.0, 1.4, 9.6], [sd * 2.2, 1.6, 11.6], [sd * 2.2, 2.2, 13.2]], 'extra'));
  T.kraken = {name: 'Kraken (8 arms + 2 hunting tentacles)', bones: [['body', null, [0, 2.6, 2.4], [0, 6.0, -4.6], 'chest'], ['head', 'body', [0, 2.6, 2.4], [0, 3.6, 3.0], 'head', {up: 1}], ['jaw', 'head', [0, 2.2, 2.8], [0, 1.9, 3.6], 'jaw', {up: 1}],
    ...both([['fin', 'body', [.9, 5.4, -3.6], [3.2, 5.6, -4.8], 'wingA']]), ...kr]};
  // 🎐 Jellyfish: a bell that floats, a ring of trailing tentacles, frilly oral arms in the middle (no face)
  const jf = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), R = 3.1; jf.push(...chain('tent' + i, 'bell', [[s * R, 6.4, c * R], [s * (R + .2), 4.8, c * (R + .2)], [s * (R + .1), 3.2, c * (R + .1)], [s * R * .9, 1.6, c * R * .9], [s * R * .8, .3, c * R * .8]], 'tail')); }
  for (let i = 0; i < 4; i++) { const a = (i + .5) / 4 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); jf.push(...chain('oral' + i, 'bell', [[s * .5, 6.6, c * .5], [s * 1.0, 5.0, c * 1.0], [s * 1.2, 3.4, c * 1.2], [s * 1.0, 1.8, c * 1.0]], 'extra')); }
  T.jellyfish = {name: 'Jellyfish (bell + tentacles)', bones: [['bell', null, [0, 6.6, 0], [0, 10.2, 0], 'chest'], ...jf]};
  // 🐢 Giant snapping turtle (4 legs) and a bipedal turtle (stands like a kaiju)
  T.turtle = {name: 'Giant turtle (4 legs)', bones: [['hips', null, [0, 3.0, -2.4], [0, 3.4, -.6], 'spine'], ['chest', 'hips', [0, 3.4, -.6], [0, 3.3, 1.8], 'chest'],
    ['neck', 'chest', [0, 3.2, 1.8], [0, 3.4, 3.2], 'neck'], ['neck2', 'neck', [0, 3.4, 3.2], [0, 3.6, 4.4], 'neck'], ['head', 'neck2', [0, 3.6, 4.4], [0, 4.4, 5.0], 'head', {up: 1}], ['jaw', 'head', [0, 3.7, 4.7], [0, 3.4, 5.8], 'jaw', {up: 1}],
    ...both([['frontleg', 'chest', [1.8, 2.8, 1.4], [3.0, 1.8, 2.2], 'legU'], ['frontshin', 'frontleg#', [3.0, 1.8, 2.2], [3.2, .4, 2.4], 'legL'], ['frontfoot', 'frontshin#', [3.2, .4, 2.4], [3.4, 0, 3.4], 'foot'],
      ['backleg', 'hips', [1.6, 2.7, -2.2], [2.8, 1.6, -2.6], 'legU'], ['backshin', 'backleg#', [2.8, 1.6, -2.6], [2.9, .4, -2.8], 'legL'], ['backfoot', 'backshin#', [2.9, .4, -2.8], [3.0, 0, -2.0], 'foot']]),
    ...chain('tail', 'hips', [[0, 2.8, -2.8], [0, 2.4, -4.2], [0, 1.8, -5.6], [0, 1.2, -6.8], [0, .8, -7.8]], 'tail')]};
  T.turtle2 = {name: 'Bipedal turtle (stands up)', bones: [...T.kaiju.bones.filter(b => !/^tail/.test(b[0])), ...chain('tail', 'hips', [[0, 4.4, -.8], [0, 3.4, -2.2], [0, 2.2, -3.2], [0, 1.2, -3.8]], 'tail')]};
  // 🦅🐴 Hippogriff: eagle front (bird legs + wings), horse back
  T.hippogriff = {name: 'Hippogriff (eagle front, horse back)', bones: [...quad.map(b => b[0] === 'neck' ? ['neck', 'chest', [0, 5.6, 2.2], [0, 7.4, 3.0], 'neck'] : b[0] === 'head' ? ['head', 'neck', [0, 7.4, 3.0], [0, 8.4, 3.4], 'head', {up: 1}] : b[0] === 'jaw' ? ['jaw', 'head', [0, 7.6, 3.4], [0, 7.4, 4.3], 'jaw', {up: 1}] : b),
    ...both([['wing', 'chest', [.6, 6.0, 1.2], [3.2, 7.4, .6], 'wingA'], ['wingmid', 'wing#', [3.2, 7.4, .6], [6.2, 8.2, -.6], 'wingB'], ['wingtip', 'wingmid#', [6.2, 8.2, -.6], [9, 7.2, -2.2], 'wingC']])]};
  // 🫧 Ooze: a core with wobbly pseudopods that reach out (faces grow anywhere on the goo)
  const ps = []; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + .3, c = Math.cos(a), s = Math.sin(a); ps.push(...chain('pod' + i, 'core', [[s * 1.6, 1.4, c * 1.6], [s * 2.8, 1.8 + (i % 2), c * 2.8], [s * 3.8, 2.6 + (i % 2) * 1.2, c * 3.8], [s * 4.4, 3.6 + (i % 2) * 1.6, c * 4.4]], 'extra')); }
  T.ooze = {name: 'Ooze (core + pseudopods)', bones: [['core', null, [0, 0, 0], [0, 2.6, 0], 'spine'], ['top', 'core', [0, 2.6, 0], [0, 5.0, .2], 'chest'], ...ps]};
  // 👁 Beholder: a floating orb with one big eye and a crown of eye stalks
  const bh = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); bh.push(...chain('stalk' + i, 'orb', [[s * 1.4, 8.6, c * 1.2 - .6], [s * 2.2, 10.0, c * 2.0 - .8], [s * 2.6, 11.2, c * 2.4 - .6]], 'extra')); }
  T.beholder = {name: 'Beholder (orb + eye stalks)', bones: [['orb', null, [0, 4.6, 0], [0, 8.6, 0], 'chest'], ['head', 'orb', [0, 6.4, 1.6], [0, 7.4, 2.0], 'head', {up: 1}], ['jaw', 'head', [0, 5.4, 1.8], [0, 5.0, 2.8], 'jaw', {up: 1}], ...bh]};
  // 🟩 Blocky slime (block-game feel) and a low-poly jellyfish (same bones as the jellyfish, polygon-art parts)
  T.slime = {name: 'Blocky slime (cube)', bones: [['core', null, [0, 0, 0], [0, 1.6, 0], 'spine'], ['top', 'core', [0, 1.6, 0], [0, 3.2, 0], 'chest']]};
  T.jellyfish_lp = {name: 'Jellyfish (low-poly art)', bones: T.jellyfish.bones.map(b => b.slice())};
  // 🌋 elementals + ✨ gods (Nov 9, test page). 'Elemental (floats)': upper body + a 'base' chain hanging under the hips (whirlwind, wave, lava column...)
  const up = (y0 = 6.2) => [['hips', null, [0, y0, 0], [0, y0 + 1, 0], 'spine'], ['spine', 'hips', [0, y0 + 1, 0], [0, y0 + 2.1, .1], 'spine'], ['chest', 'spine', [0, y0 + 2.1, .1], [0, y0 + 3.5, .2], 'chest'],
    ['neck', 'chest', [0, y0 + 3.5, .2], [0, y0 + 4.1, .4], 'neck'], ['head', 'neck', [0, y0 + 4.1, .4], [0, y0 + 5.3, .6], 'head', {up: 1}], ['jaw', 'head', [0, y0 + 4.2, .7], [0, y0 + 4.0, 1.6], 'jaw', {up: 1}]];
  const armsAt = (y, sx = 1.1, nm = '', par = 'chest', len = 1) => both([['shoulder' + nm, par, [.7 * sx, y, .1], [1.6 * sx, y, 0], 'armU'], ['upperarm' + nm, 'shoulder' + nm + '#', [1.6 * sx, y, 0], [2.3 * sx, y - 1.6 * len, .3], 'armU'],
    ['forearm' + nm, 'upperarm' + nm + '#', [2.3 * sx, y - 1.6 * len, .3], [2.5 * sx, y - 3.0 * len, 1.0], 'armF'], ['hand' + nm, 'forearm' + nm + '#', [2.5 * sx, y - 3.0 * len, 1.0], [2.55 * sx, y - 3.8 * len, 1.3], 'hand']]);
  const baseCh = (y0 = 6.2) => chain('base', 'hips', [[0, y0, 0], [0, y0 - 2.0, 0], [0, y0 - 4.0, 0], [0, .3, 0]], 'tail');
  T.elemental = {name: '🌋 Elemental (floats, no legs)', bones: [...up(), ...armsAt(9.6), ...baseCh()]};
  T.sixarm = {name: '✨ Six-armed god (floats)', bones: [...up(), ...armsAt(9.7, 1.15), ...armsAt(8.9, 1.05, 'B', 'chest', .95), ...armsAt(8.1, .95, 'C', 'spine', .9), ...baseCh()]};
  T.hound2 = {name: '✨ Two-headed hound', bones: [...quad.filter(b => !['neck', 'head', 'jaw'].includes(b[0])), ...[[-1, 'L'], [1, 'R']].flatMap(([x, n]) => [['neck' + n, 'chest', [x * .5, 5.6, 2.2], [x * 1.1, 7.2, 3.2], 'neck'], ['head' + n, 'neck' + n, [x * 1.1, 7.2, 3.2], [x * 1.1, 8.2, 3.6], 'head', {up: 1}], ['jaw' + n, 'head' + n, [x * 1.1, 7.3, 3.5], [x * 1.1, 7.0, 4.5], 'jaw', {up: 1}]])]};
  // 🦈 Fish / shark (rebuilt Nov 9): one trunk from the tail stalk to the head, a short tail stalk for the tail fin, and a bone for every fin
  T.fish = {name: 'Fish / shark', bodyW: 2.3, bones: [['body', null, [0, 4, -3.0], [0, 4, -.4], 'spine'], ['chest', 'body', [0, 4, -.4], [0, 4, 3.0], 'chest'],
    ['head', 'chest', [0, 3.8, 3.6], [0, 4.2, 5.65], 'head', {up: 1}], ['jaw', 'head', [0, 3.7, 3.9], [0, 3.5, 5.2], 'jaw', {up: 1}],
    ...chain('tail', 'body', [[0, 4, -2.9], [0, 4.03, -3.9], [0, 4.06, -4.9], [0, 4.1, -5.9]], 'tail'),
    ['dorsal', 'chest', [0, 5.0, .9], [0, 6.5, -.4], 'extra'], ['dorsal2', 'body', [0, 4.62, -2.0], [0, 5.15, -2.7], 'extra'], ['anal', 'body', [0, 3.4, -2.0], [0, 2.9, -2.7], 'extra'],
    ...both([['fin', 'chest', [.9, 3.4, 1.9], [3.0, 2.3, .1], 'wingA'], ['pelvic', 'body', [.42, 3.2, -.9], [1.05, 2.6, -1.7], 'extra']])]};
  T.bonyfish = {name: '🐟 Fish (tall, scaled)', bodyW: 1.5, bones: T.fish.bones.map(b => b.slice())};
  // 🦞 Lobster: long shield body, two big claws, 4 pairs of walking legs, eye stalks, long feelers, a flat tail in 5 pieces that ends in a fan
  const lobLeg = (i, z, a) => both([['leg' + i, 'body', [.7, 2.4, z], [2.1, 3.1, z + a], 'legU'], ['leg' + i + 'b', 'leg' + i + '#', [2.1, 3.1, z + a], [3.1, .8, z + a * 1.5], 'legL'], ['leg' + i + 'c', 'leg' + i + 'b#', [3.1, .8, z + a * 1.5], [3.4, 0, z + a * 1.7], 'foot']]);
  T.lobster = {name: '🦞 Lobster / crayfish', bodyW: 2.2, bones: [['body', null, [0, 2.7, -1.4], [0, 2.8, 1.8], 'chest'], ['head', 'body', [0, 2.35, 1.75], [0, 2.8, 2.7], 'head', {up: 1}],
    ...both([['eyestalk', 'head', [.34, 3.0, 2.2], [.6, 3.7, 2.6], 'neck'], ['antenna', 'head', [.3, 2.95, 2.7], [2.4, 5.2, 7.2], 'extra'],
      ['clawarm', 'body', [.9, 2.5, 1.5], [2.5, 2.7, 2.9], 'armU'], ['clawfore', 'clawarm#', [2.5, 2.7, 2.9], [2.5, 2.9, 4.6], 'armF'], ['pincer', 'clawfore#', [2.5, 2.9, 4.6], [2.3, 2.9, 7.0], 'hand']]),
    ...lobLeg(1, 1.0, .5), ...lobLeg(2, .35, .15), ...lobLeg(3, -.3, -.2), ...lobLeg(4, -.95, -.5),
    ...chain('tail', 'body', [[0, 2.75, -1.35], [0, 2.75, -2.4], [0, 2.7, -3.4], [0, 2.6, -4.35], [0, 2.45, -5.2], [0, 2.25, -6.0]], 'tail')]};
  // 🐊 Giant crocodile (Nov 9 late): TWO body types with the SAME bone names, so one creature can switch between them (stance: the other key).
  // Crawling = belly low, legs sprawled out to the sides, tail on the ground. Standing = upright on its back legs, tail as a prop.
  const crocBones = (trunk, neckTip, headTip, jaw, arm, leg, tail) => [['hips', null, trunk[0], trunk[1], 'spine'], ['spine', 'hips', trunk[1], trunk[2], 'spine'], ['chest', 'spine', trunk[2], trunk[3], 'chest'],
    ['neck', 'chest', trunk[3], neckTip, 'neck'], ['head', 'neck', neckTip, headTip, 'head', {up: 1}], ['jaw', 'head', jaw[0], jaw[1], 'jaw', {up: 1}],
    ...both([['shoulder', 'chest', arm[0], arm[1], 'armU'], ['upperarm', 'shoulder#', arm[1], arm[2], 'armU'], ['forearm', 'upperarm#', arm[2], arm[3], 'armF'], ['hand', 'forearm#', arm[3], arm[4], 'hand'],
      ['thigh', 'hips', leg[0], leg[1], 'legU'], ['shin', 'thigh#', leg[1], leg[2], 'legL'], ['foot', 'shin#', leg[2], leg[3], 'foot']]), ...chain('tail', 'hips', tail, 'tail')];
  T.croc = {name: '🐊 Giant crocodile (crawling)', stance: 'croc2', stanceName: '🧍 Stand up', bones: crocBones([[0, 1.9, -2.4], [0, 2.0, -.9], [0, 2.0, .9], [0, 1.95, 2.6]], [0, 2.0, 3.5], [0, 2.4, 5.4], [[0, 1.85, 3.8], [0, 1.65, 5.3]],
    [[.9, 1.9, 2.3], [1.5, 1.9, 2.3], [2.5, 1.75, 1.8], [2.7, .4, 2.5], [2.8, .14, 3.4]], [[1.1, 1.9, -2.2], [2.6, 1.65, -1.7], [2.8, .45, -2.6], [2.9, 0, -1.5]],
    [[0, 1.9, -2.5], [0, 1.7, -4.0], [.15, 1.4, -5.5], [.4, 1.1, -7.0], [.5, .9, -8.4], [.3, .7, -9.7], [-.1, .6, -10.9], [-.5, .5, -12.0], [-.8, .45, -12.9]])};
  T.croc2 = {name: '🐊 Giant crocodile (standing)', stance: 'croc', stanceName: '🐊 Get down (crawl)', bones: crocBones([[0, 5.0, 0], [0, 6.3, .3], [0, 7.9, .8], [0, 9.4, 1.5]], [0, 10.1, 2.2], [0, 10.5, 4.1], [[0, 10.0, 2.5], [0, 9.8, 4.0]],
    [[.9, 9.0, 1.3], [1.5, 9.0, 1.3], [2.1, 7.6, 1.6], [2.2, 6.4, 2.6], [2.2, 5.8, 3.4]], [[1.1, 5.0, 0], [1.5, 3.0, .8], [1.5, .8, -.1], [1.5, 0, 1.2]],
    [[0, 4.9, -.7], [0, 3.9, -2.1], [.1, 2.8, -3.4], [.3, 1.9, -4.8], [.45, 1.2, -6.2], [.35, .75, -7.6], [0, .55, -8.9], [-.4, .5, -10.0], [-.7, .45, -10.9]])};
  // default builds that use the same bones under a new name (each is its own ⭐ default build + Build together body)
  const alias = (k, name, from) => { T[k] = {name, bones: (typeof from === 'string' ? T[from].bones : from).map(b => b.slice())}; };
  alias('storm_el', '🌋 Storm elemental', 'elemental'); alias('wind_el', '🌋 Wind elemental', 'elemental'); alias('water_el', '🌋 Water elemental', 'elemental');
  alias('fire_el', '🌋 Fire elemental', 'slim'); alias('ice_el', '🌋 Ice elemental', 'slim'); alias('lava_golem', '🌋 Lava golem', 'brute'); alias('stone_golem', '🌋 Stone golem', 'brute');
  alias('crystal_golem', '🌋 Crystal golem', 'brute'); alias('tree_giant', '🌋 Tree giant', 'brute'); alias('primordial', '🌋 Primordial titan (mixed elements)', 'kaiju');
  // 🦴 Colossal bone titan: skinless upper body (no legs) on a huge level spine that trails behind (the spine is the 'tail' chain)
  T.bone_colossus = {name: '🦴 Colossal bone titan (giant spine)', bones: [['hips', null, [0, 5.0, 0], [0, 6.2, .2], 'spine'], ['spine', 'hips', [0, 6.2, .2], [0, 7.6, .4], 'spine'], ['chest', 'spine', [0, 7.6, .4], [0, 9.2, .6], 'chest'],
    ['neck', 'chest', [0, 9.2, .6], [0, 9.9, 1.0], 'neck'], ['head', 'neck', [0, 9.9, 1.0], [0, 11.1, 1.3], 'head', {up: 1}], ['jaw', 'head', [0, 10.0, 1.4], [0, 9.8, 2.3], 'jaw', {up: 1}], ...armsAt(9.0, 1.2, '', 'chest', 1.2),
    ...chain('tail', 'hips', [...Array(11).keys()].map(i => [0, 4.6, -.6 - i * 1.7]), 'tail')]};
  alias('cosmic_god', '✨ Cosmic god (six arms)', 'sixarm'); alias('sea_god', '✨ Sea god', 'naga'); alias('death_god', '✨ God of passage (death)', 'slim'); alias('city_god', '✨ City god (star jar)', 'slim'); alias('chained_titan', '✨ Chained hunger titan', 'brute');
  // ---- 🧬 mix halves: any front half + any back half (four-legged family), see forge-v3.js
  window.FORGE_HALVES = ['quad', 'dragon', 'sphinx', 'chimera', 'hippogriff', 'centaur', 'hydra', 'turtle'];
  // defaults for Build together / ⭐ default builds of the new body types (step title -> part id)
  window.FORGE_DEF3 = {
    croc: {Body: 'kcr_body', Neck: 'kcr_neck', Head: 'kh_croc', Arms: 'kcr_limb_arm', Hands: 'kl_palm_beast', Legs: 'kcr_limb', Feet: 'kl_foot_dragon', 'Tail / tentacles': 'kcr_tailseg', Eyes: 'kp_eye_slit', Teeth: 'kcr_teeth', 'Tail tip': null, 'Back spikes': null, Horns: null, 'Face bits': null, _tailEnd: ['kcr_tailseg_fin', 3]},
    croc2: {Body: 'kcr_body', Neck: 'kcr_neck', Head: 'kh_croc', Arms: 'kcr_limb_arm', Hands: 'kl_palm_beast', Legs: 'kcr_limb', Feet: 'kl_foot_dragon', 'Tail / tentacles': 'kcr_tailseg', Eyes: 'kp_eye_slit', Teeth: 'kcr_teeth', 'Tail tip': null, 'Back spikes': null, Horns: null, 'Face bits': null, _tailEnd: ['kcr_tailseg_fin', 3]},
    fish: {Body: 'ks_shark_body', Head: 'kh_shark', Wings: 'ks_fin_pectoral', 'Extra limbs': 'ks_fin_dorsal', 'Tail / tentacles': 'ks_shark_tail', 'Tail tip': null, Eyes: 'ks_eye_shark', Teeth: 'kp_row_saw', 'Back spikes': null},
    bonyfish: {Body: 'ks_fish_body', Head: 'kh_fish', Wings: 'ks_fin_round', 'Extra limbs': 'ks_fin_spiny', 'Tail / tentacles': 'ks_fish_tail', 'Tail tip': null, Eyes: 'ks_eye_fish', Teeth: null, 'Back spikes': null},
    lobster: {Body: 'ks_lob_carapace', Head: 'ks_lob_face', Arms: 'ks_lob_arm', Hands: 'ks_lob_claw', Legs: 'ks_lob_leg', 'Tail / tentacles': 'ks_lob_seg', 'Tail tip': 'ks_lob_fan', 'Extra limbs': 'ks_lob_antenna', Eyes: null, 'Back spikes': null},
    chimera: {Body: 'bb_lion', Head: 'kh_cat', 'Tail / tentacles': 'bb_snake', 'Tail tip': 'kl_tip_snakehead'},
    hydra2: {Body: 'bd_torso_dragon', Head: 'hd_head_dragon', Wings: 'tw_wing_bat', 'Tail / tentacles': 'tw_tail_spiked'},
    mantis: {Body: 'bd_torso_thorax', Head: 'hd_head_mantis', Hands: 'kl_arm_scythe', Wings: 'tw_wing_insect', 'Tail / tentacles': 'bb_abdomen', 'Extra limbs': 'bb_antenna'},
    wasp: {Body: 'bd_torso_thorax', Head: 'hd_head_ant', Hands: 'kl_arm_drill', Wings: 'kw_insect_wasp', 'Tail / tentacles': 'bb_abdomen', 'Extra limbs': 'bb_antenna', 'Tail tip': 'kl_tip_stinger'},
    uprightbug: {Body: 'bd_torso_thorax', Head: 'hd_head_ant', Hands: 'kl_arm_hook', 'Tail / tentacles': 'kl_tailseg_ringed', 'Back spikes': 'kl_back_plate'},
    kraken: {Body: 'kr_mantle', Head: 'hd_head_octopus', 'Tail / tentacles': 'kr_tentacle', 'Extra limbs': 'kr_tentacle', Wings: 'bb_fin'},
    jellyfish: {Body: 'kj_bell', 'Tail / tentacles': 'kj_tentacle', 'Extra limbs': 'kj_oral', 'Glow spots': 'kj_spot'},
    turtle: {Body: 'kc_shell_snapper', Head: 'kh_turtle', 'Tail / tentacles': 'kl_tailseg_plated', 'Back spikes': 'kl_back_spike'},
    turtle2: {Body: 'kc_shell_snapper', Head: 'kh_turtle', Hands: 'kl_palm_kaiju', 'Tail / tentacles': 'kl_tailseg_plated'},
    hippogriff: {Body: 'bb_horse', Head: 'kh_bird', Wings: 'kw_feather_simple', 'Tail / tentacles': 'tw_tail_whip'},
    ooze: {Body: 'ko_goo', 'Extra limbs': 'ko_pod', 'Goo face': 'ko_face_wrong', Mouths: 'ko_mouth_toothy', Swallowed: 'ko_vic_skull'},
    slime: {Body: 'kv_slime_green', Swallowed: 'kv_slime_mini'},
    jellyfish_lp: {Body: 'kj_bell_lp', 'Tail / tentacles': 'kj_ribbon_lp', 'Extra limbs': 'kj_oral_lp'},
    storm_el: {Body: 'ke_cloudbody', Neck: 'kl_neckseg_skin', Head: 'kh_human', Arms: 'kl_limb_skin_arm', Hands: 'kl_palm_human', 'Tail / tentacles': 'ke_base_storm', Eyes: 'ke_eye_elemental', 'Crest / mane': 'ke_hair_storm', _elem: 'storm'},
    wind_el: {Body: 'bd_torso_brawler', Neck: 'kl_neckseg_skin', Head: 'kh_human', Arms: 'kl_limb_skin_arm', Hands: 'kl_palm_human', 'Tail / tentacles': 'ke_base_wind', Eyes: 'ke_eye_elemental', _elem: 'wind'},
    water_el: {Body: 'bd_torso_brawler', Neck: 'kl_neckseg_skin', Head: 'kh_human', Arms: 'kl_limb_skin_arm', Hands: 'kl_palm_human', 'Tail / tentacles': 'ke_base_wave', Eyes: 'ke_eye_elemental', 'Crest / mane': 'kg_tentacle_hair', _elem: 'water'},
    fire_el: {Body: 'sp_torso_gaunt', Neck: 'kl_neckseg_skin', Head: 'kh_human', Arms: 'kl_limb_skin_arm', Hands: 'kl_palm_human', Legs: 'kl_limb_skin', Feet: 'kl_foot_human', Eyes: 'ke_eye_elemental', 'Crest / mane': 'ke_hair_flame', _elem: 'fire'},
    ice_el: {Body: 'sp_torso_gaunt', Neck: 'kl_neckseg_skin', Head: 'kh_human', Arms: 'ke_iceseg_arm', Hands: 'kl_palm_human', Legs: 'ke_iceseg', Feet: 'kl_foot_human', Eyes: 'ke_eye_elemental', 'Crest / mane': 'ke_hair_ice', _elem: 'ice'},
    lava_golem: {Body: 'bd_torso_brawler', Neck: 'kl_neckseg_rock', Head: 'kh_golem', Arms: 'ke_rockseg_arm', Hands: 'kl_palm_kaiju', Legs: 'ke_rockseg', Feet: 'kl_foot_kaiju', Eyes: 'ke_eye_elemental', 'Crest / mane': 'ke_hair_flame', _elem: 'lava'},
    stone_golem: {Body: 'bd_torso_brawler', Neck: 'kl_neckseg_rock', Head: 'kh_golem', Arms: 'ke_rockseg_arm', Hands: 'kl_palm_kaiju', Legs: 'ke_rockseg', Feet: 'kl_foot_kaiju', Eyes: 'ke_eye_elemental', _elem: 'stone'},
    crystal_golem: {Body: 'ke_crystalbody', Neck: 'kl_neckseg_rock', Head: 'kh_golem', Arms: 'ke_rockseg_arm', Hands: 'kl_palm_kaiju', Legs: 'ke_rockseg', Feet: 'kl_foot_kaiju', Eyes: 'ke_eye_elemental', 'Back spikes': 'ke_crystals', _elem: 'crystal'},
    tree_giant: {Body: 'tf_trunk', Neck: 'kl_neckseg_rock', Head: 'kh_golem', Arms: 'tf_arm_branch', Hands: 'tf_hand_twig', Legs: 'tf_leg_root', Feet: 'tf_foot_roots', Eyes: 'ke_eye_elemental', _crown: 'ke_leafcrown', _elem: 'forest'},
    primordial: {Body: 'bd_torso_dragon', Neck: 'kl_neckseg_scaly', Head: 'kh_kaiju', Arms: 'kl_limb_scaly_arm', Hands: 'kl_palm_kaiju', Legs: 'kl_limb_scaly', Feet: 'kl_foot_kaiju', 'Tail / tentacles': 'kl_tailseg_scaly', Eyes: 'ke_eye_elemental', 'Back spikes': 'ke_crystals',
      _elem: {head: 'lava', jaw: 'lava', neck: 'lava', trunk: 'forest', 'arm.L': 'water', 'hand.L': 'water', 'arm.R': 'lava', 'hand.R': 'lava', leg: 'stone', foot: 'stone', tail: 'lava'}},
    cosmic_god: {Body: 'bd_torso_brawler', Neck: 'kl_neckseg_skin', Head: 'kg_face_cosmic', Arms: 'kl_limb_skin_arm', Hands: 'kl_palm_human', 'Tail / tentacles': 'ke_base_cosmic', 'Crest / mane': 'ke_hair_cosmic', _bigeye: 'kg_eye_galaxy', _neck: 'kg_serpent', _weapon: 'kg_orb', _elem: 'cosmic'},
    sea_god: {Body: 'bd_torso_naga', Neck: 'bd_neck_serpent', Head: 'kg_face_cosmic', Arms: 'kl_limb_skin_arm', Hands: 'kl_palm_human', 'Tail / tentacles': 'tw_tail_fin', Ears: 'kg_fin_ear', 'Crest / mane': 'kg_tentacle_hair', _crown: 'kg_crown_coral', _bigeye: 'kg_eye_galaxy', _weapon: 'kg_trident', _mat: {trunk: 'krakenskin', tail: 'krakenskin', head: 'starfield'}},
    death_god: {Body: 'sp_torso_gaunt', Neck: 'kl_neckseg_skin', Head: 'kg_face_cosmic', Arms: 'sp_arm_gaunt', Hands: 'sp_hand_claw', Legs: 'sp_leg_gaunt', _hood: 'kg_hood', _robe: 'kg_robe', _bigeye: 'kg_eye_galaxy', _weapon: 'kg_scythe', _mat: {head: 'starfield', trunk: 'void', arm: 'void', hand: 'void', leg: 'void'}},
    city_god: {Body: 'bd_torso_brawler', Neck: 'kl_neckseg_skin', Head: 'kh_human', Arms: 'kl_limb_skin_arm', Hands: 'kl_palm_human', Legs: 'kl_limb_skin', Feet: 'kl_foot_human', Eyes: 'ke_eye_elemental', _crown: 'kg_crown_gold', _halo: 'kg_halo', _robe: 'kg_robe', _weapon: 'kg_starjar', _mat: {trunk: 'ocean', arm: 'goldantique', leg: 'goldantique', head: 'goldantique'}},
    chained_titan: {Body: 'bd_torso_undead', Neck: 'kl_neckseg_skin', Head: 'kh_skull', Arms: 'sp_arm_gaunt', Hands: 'sp_hand_claw', Legs: 'sp_leg_gaunt', Eyes: 'kp_eye_glow', Teeth: 'kp_row_needle', _belly: 'kg_belly_maw', _shackles: 'kg_shackle', _chains: 'kg_chains', _mat: {all: 'ghost'}},
    bone_colossus: {Body: 'kt_muscle_torso', Neck: 'kl_neckseg_skin', Head: 'kh_skull', Arms: 'kl_limb_skin_arm', Hands: 'kl_palm_human', 'Tail / tentacles': 'kt_vertebra', Eyes: 'ke_eye_elemental', Teeth: 'kp_row_fang', Horns: null, 'Crest / mane': 'kt_hair_long', Fingers: 'kl_finger_human', Claws: 'kl_claw_nail',
      _mat: {head: 'muscle', jaw: 'muscle', neck: 'muscle', arm: 'muscle', hand: 'muscle'}, _elem: {head: 'steam', trunk: 'steam', arm: 'steam'}},
    hound2: {Body: 'bb_beast', Neck: 'bd_neck_maned', Head: 'kh_beast', Legs: 'kl_limb_fur', Feet: 'kl_foot_paw', Eyes: 'ke_eye_elemental', 'Tail / tentacles': 'tw_tail_whip', _mat: {all: 'void'}},
    elemental: {Body: 'bd_torso_brawler', Neck: 'kl_neckseg_rock', Head: 'kh_golem', Arms: 'kl_limb_skin_arm', Hands: 'kl_palm_human', 'Tail / tentacles': 'ke_base_rocks', _elem: 'stone'},
    sixarm: {Body: 'bd_torso_brawler', Neck: 'kl_neckseg_skin', Head: 'kh_human', Arms: 'kl_limb_skin_arm', Hands: 'kl_palm_human', 'Tail / tentacles': 'ke_base_cosmic'},
    beholder: {Body: 'ko_orb', Head: 'kp_eye_big', 'Extra limbs': 'ko_eyestalk', Eyes: 'kp_eye_round', Mouths: 'ko_mouth_toothy'}};
})();
