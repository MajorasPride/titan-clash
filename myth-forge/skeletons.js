// Titan Forge skeleton templates. Each bone: [name, parent, head xyz, tail xyz, tag, opts]. World units: a titan is ~11 tall, facing +Z.
// Tags drive the preview animations: spine, chest, neck, head, jaw, tail, armU/armF/hand, legU/legL/foot, wingA/wingB/wingC, extra.
// opts.up = keep world axes (heads: +Y up, face +Z).
(function () {
  const sideL = b => b.map(([n, p, h, t, tag, o]) => [n + '.L', p && p.endsWith('#') ? p.slice(0, -1) + '.L' : p, [Math.abs(h[0]), h[1], h[2]], [Math.abs(t[0]), t[1], t[2]], tag, o]);
  const sideR = b => b.map(([n, p, h, t, tag, o]) => [n + '.R', p && p.endsWith('#') ? p.slice(0, -1) + '.R' : p, [-Math.abs(h[0]), h[1], h[2]], [-Math.abs(t[0]), t[1], t[2]], tag, o]);
  const both = b => [...sideL(b), ...sideR(b)];
  const chain = (name, parent, pts, tag) => pts.slice(0, -1).map((h, i) => [name + (i + 1), i ? name + i : parent, h, pts[i + 1], tag]);
  const T = {};
  T.biped = {name: 'Biped kaiju', bones: [
    ['hips', null, [0, 5.2, 0], [0, 6.2, 0], 'spine'], ['spine', 'hips', [0, 6.2, 0], [0, 7.4, .1], 'spine'], ['chest', 'spine', [0, 7.4, .1], [0, 8.6, .2], 'chest'],
    ['neck', 'chest', [0, 8.6, .2], [0, 9.4, .6], 'neck'], ['head', 'neck', [0, 9.4, .6], [0, 10.6, .9], 'head', {up: 1}], ['jaw', 'head', [0, 9.5, .9], [0, 9.3, 1.9], 'jaw', {up: 1}],
    ...both([['shoulder', 'chest', [.6, 8.4, .1], [1.5, 8.4, 0], 'armU'], ['upperarm', 'shoulder#', [1.5, 8.4, 0], [2.1, 6.9, .2], 'armU'], ['forearm', 'upperarm#', [2.1, 6.9, .2], [2.3, 5.5, .8], 'armF'], ['hand', 'forearm#', [2.3, 5.5, .8], [2.35, 4.7, 1.1], 'hand'],
      ['thigh', 'hips', [.9, 5.2, 0], [1.1, 3.0, .4], 'legU'], ['shin', 'thigh#', [1.1, 3.0, .4], [1.1, .7, -.2], 'legL'], ['foot', 'shin#', [1.1, .7, -.2], [1.1, 0, 1.1], 'foot']]),
    ...chain('tail', 'hips', [[0, 5.1, -.6], [0, 4.4, -2], [0, 3.6, -3.6], [0, 2.8, -5], [0, 2.1, -6.4], [0, 1.6, -7.6]], 'tail')]};
  T.mech = {name: 'Mech / humanoid', bones: T.biped.bones.filter(b => !b[0].startsWith('tail')).map(b => b[0] === 'jaw' ? null : b).filter(Boolean)};
  T.quad = {name: 'Four-legged beast', bones: [
    ['hips', null, [0, 5, -2.2], [0, 5.3, -.8], 'spine'], ['spine', 'hips', [0, 5.3, -.8], [0, 5.5, .8], 'spine'], ['chest', 'spine', [0, 5.5, .8], [0, 5.6, 2.2], 'chest'],
    ['neck', 'chest', [0, 5.6, 2.2], [0, 7, 3.4], 'neck'], ['head', 'neck', [0, 7, 3.4], [0, 7.6, 4.6], 'head', {up: 1}], ['jaw', 'head', [0, 6.9, 3.7], [0, 6.6, 4.9], 'jaw', {up: 1}],
    ...both([['frontleg', 'chest', [1.2, 5, 2], [1.4, 2.8, 2.2], 'legU'], ['frontshin', 'frontleg#', [1.4, 2.8, 2.2], [1.4, .6, 2.1], 'legL'], ['frontfoot', 'frontshin#', [1.4, .6, 2.1], [1.4, 0, 2.9], 'foot'],
      ['backleg', 'hips', [1.2, 4.8, -2.2], [1.4, 2.8, -1.6], 'legU'], ['backshin', 'backleg#', [1.4, 2.8, -1.6], [1.4, .7, -2.4], 'legL'], ['backfoot', 'backshin#', [1.4, .7, -2.4], [1.4, 0, -1.6], 'foot']]),
    ...chain('tail', 'hips', [[0, 5, -2.4], [0, 4.6, -3.8], [0, 4, -5.2], [0, 3.3, -6.6], [0, 2.7, -8], [0, 2.3, -9.2]], 'tail')]};
  const wings = both([['wing', 'chest#', [.6, 6.0, 1.2], [3.2, 7.4, .6], 'wingA'], ['wingmid', 'wing#', [3.2, 7.4, .6], [6.2, 8.2, -.6], 'wingB'], ['wingtip', 'wingmid#', [6.2, 8.2, -.6], [9, 7.2, -2.2], 'wingC']])
    .map(b => (b[1] === 'chest.L' || b[1] === 'chest.R') ? [b[0], 'chest', ...b.slice(2)] : b);
  T.dragon = {name: 'Dragon (4 legs + wings)', bones: [...T.quad.bones.map(b => b[0] === 'neck' ? ['neck', 'chest', [0, 5.6, 2.2], [0, 7.6, 3.2], 'neck'] : b[0] === 'head' ? ['head', 'neck', [0, 7.6, 3.2], [0, 8.2, 4.4], 'head', {up: 1}] : b[0] === 'jaw' ? ['jaw', 'head', [0, 7.5, 3.5], [0, 7.2, 4.8], 'jaw', {up: 1}] : b), ...wings]};
  T.hydra = {name: 'Hydra (3 heads, 4 legs)', bones: [...T.quad.bones.filter(b => !['neck', 'head', 'jaw'].includes(b[0])),
    ...[[-1.3, -1], [0, 0], [1.3, 1]].flatMap(([x, s], i) => { const n = ['L', 'M', 'R'][i]; return [['neck' + n, 'chest', [x * .5, 5.6, 2.2], [x * 1.6, 8.4, 3.4], 'neck'], ['head' + n, 'neck' + n, [x * 1.6, 8.4, 3.4], [x * 1.8, 9.2, 4.4], 'head', {up: 1}], ['jaw' + n, 'head' + n, [x * 1.6, 8.3, 3.7], [x * 1.7, 8.0, 4.9], 'jaw', {up: 1}]]; })]};
  T.wyvern = {name: 'Wyvern / bird (2 legs + wings)', bones: [...T.biped.bones.filter(b => !/shoulder|upperarm|forearm|hand/.test(b[0])), ...both([['wing', 'chest', [.6, 8.2, 0], [3.4, 9.4, -.4], 'wingA'], ['wingmid', 'wing#', [3.4, 9.4, -.4], [6.4, 9.8, -1.4], 'wingB'], ['wingtip', 'wingmid#', [6.4, 9.8, -1.4], [9.2, 8.6, -2.6], 'wingC']])]};
  T.serpent = {name: 'Serpent / sea monster', bones: [...chain('body', null, [[0, .8, -9], [0, .9, -7.5], [0, 1, -6], [0, 1.2, -4.5], [0, 1.6, -3], [0, 2.4, -1.6], [0, 3.6, -.4], [0, 5.2, .4], [0, 6.8, .8], [0, 8.2, 1]], 'spine'),
    ['head', 'body9', [0, 8.2, 1], [0, 9.2, 1.6], 'head', {up: 1}], ['jaw', 'head', [0, 8.2, 1.3], [0, 7.9, 2.5], 'jaw', {up: 1}]].map(b => b[0] === 'body1' ? ['body1', null, b[2], b[3], 'spine'] : b)};
  const spLeg = (i, z, a) => both([['leg' + i, 'body', [.8, 3.4, z], [3.2, 5, z + a], 'legU'], ['leg' + i + 'b', 'leg' + i + '#', [3.2, 5, z + a], [5, 2.4, z + a * 1.6], 'legL'], ['leg' + i + 'c', 'leg' + i + 'b#', [5, 2.4, z + a * 1.6], [5.6, 0, z + a * 2], 'foot']]);
  T.spider = {name: 'Spider / bug (8 legs)', bones: [['body', null, [0, 3.4, -.6], [0, 3.6, 1.2], 'chest'], ['abdomen', 'body', [0, 3.6, -.6], [0, 4.6, -4.4], 'tail'], ['head', 'body', [0, 3.6, 1.2], [0, 4.4, 2.2], 'head', {up: 1}],
    ['jaw', 'head', [0, 3.3, 1.9], [0, 2.8, 2.7], 'jaw', {up: 1}], ...spLeg(1, 1, 1.1), ...spLeg(2, .4, .3), ...spLeg(3, -.2, -.3), ...spLeg(4, -.6, -1.1),
    ...both([['palp', 'head', [.4, 3.6, 2], [.8, 3, 3], 'armF']])]};
  T.crab = {name: 'Crab / crustacean', bones: [['body', null, [0, 3.2, -1.2], [0, 3.6, 1.2], 'chest'], ['head', 'body', [0, 3.6, 1.2], [0, 4.2, 1.8], 'head', {up: 1}],
    ...both([['eyestalk', 'head', [.4, 4, 1.6], [.6, 5.2, 1.8], 'neck'], ['clawarm', 'body', [1.4, 3.4, 1], [3.4, 4, 2.6], 'armU'], ['clawfore', 'clawarm#', [3.4, 4, 2.6], [3.6, 4.4, 4.6], 'armF'], ['pincer', 'clawfore#', [3.6, 4.4, 4.6], [3.6, 4.4, 6.2], 'hand']]),
    ...spLeg(1, .6, .5).map(b => b), ...spLeg(2, -.4, -.1), ...spLeg(3, -1.4, -.7)]};

  // ---- more stickman presets ----
  const arms = (y, sx, len = 1, par = 'chest', nm = '') => both([['shoulder' + nm, par, [.6 * sx, y, .1], [1.5 * sx, y, 0], 'armU'], ['upperarm' + nm, 'shoulder' + nm + '#', [1.5 * sx, y, 0], [2.1 * sx, y - 1.5 * len, .2], 'armU'],
    ['forearm' + nm, 'upperarm' + nm + '#', [2.1 * sx, y - 1.5 * len, .2], [2.3 * sx, y - 2.9 * len, .8], 'armF'], ['hand' + nm, 'forearm' + nm + '#', [2.3 * sx, y - 2.9 * len, .8], [2.35 * sx, y - 3.7 * len, 1.1], 'hand']]);
  const legs = (hy, sx = 1, k = 1) => both([['thigh', 'hips', [.9 * sx, hy, 0], [1.1 * sx, hy * .58, .4], 'legU'], ['shin', 'thigh#', [1.1 * sx, hy * .58, .4], [1.1 * sx, hy * .14, -.2 * k], 'legL'], ['foot', 'shin#', [1.1 * sx, hy * .14, -.2 * k], [1.1 * sx, 0, 1.1], 'foot']]);
  const core = (hy, ch, nk = 1, head = 1.2) => [['hips', null, [0, hy, 0], [0, hy + 1, 0], 'spine'], ['spine', 'hips', [0, hy + 1, 0], [0, (hy + 1 + ch) / 2 + .3, .1], 'spine'], ['chest', 'spine', [0, (hy + 1 + ch) / 2 + .3, .1], [0, ch, .2], 'chest'],
    ['neck', 'chest', [0, ch, .2], [0, ch + .8 * nk, .5], 'neck'], ['head', 'neck', [0, ch + .8 * nk, .5], [0, ch + .8 * nk + head, .7], 'head', {up: 1}], ['jaw', 'head', [0, ch + .8 * nk + .1, .7], [0, ch + .8 * nk - .1, 1.6], 'jaw', {up: 1}]];
  T.slim = {name: 'Slim humanoid', bones: [...core(5.6, 8.8, 1, 1.1), ...arms(8.6, .85), ...legs(5.6, .8)]};
  T.brute = {name: 'Heavy brute / ogre', bones: [...core(4.4, 8.2, .6, 1), ...arms(8, 1.35, 1.25), ...legs(4.4, 1.25)]};
  T.gorilla = {name: 'Gorilla / knuckle walker', bones: [['hips', null, [0, 4.2, -1], [0, 5.2, -.4], 'spine'], ['spine', 'hips', [0, 5.2, -.4], [0, 6.4, .6], 'spine'], ['chest', 'spine', [0, 6.4, .6], [0, 7.2, 1.6], 'chest'],
    ['neck', 'chest', [0, 7.2, 1.6], [0, 7.6, 2.3], 'neck'], ['head', 'neck', [0, 7.6, 2.3], [0, 8.6, 2.6], 'head', {up: 1}], ['jaw', 'head', [0, 7.6, 2.6], [0, 7.3, 3.3], 'jaw', {up: 1}],
    ...both([['shoulder', 'chest', [.8, 7, 1.4], [2, 7, 1.4], 'armU'], ['upperarm', 'shoulder#', [2, 7, 1.4], [2.4, 4.2, 2.2], 'armU'], ['forearm', 'upperarm#', [2.4, 4.2, 2.2], [2.5, 1.2, 2.6], 'armF'], ['hand', 'forearm#', [2.5, 1.2, 2.6], [2.5, 0, 3], 'hand']]), ...legs(4.2, 1.1)]};
  T.fourarm = {name: 'Four-armed warrior', bones: [...core(5.2, 8.8), ...arms(8.4, 1), ...arms(7.2, .9, .9, 'chest', 'B')]};
  T.angel = {name: 'Winged humanoid / angel', bones: [...core(5.6, 8.8, 1, 1.1), ...arms(8.6, .9), ...legs(5.6, .85),
    ...both([['wing', 'chest', [.4, 8.4, -.6], [2.8, 10.2, -1.4], 'wingA'], ['wingmid', 'wing#', [2.8, 10.2, -1.4], [5.6, 11, -2], 'wingB'], ['wingtip', 'wingmid#', [5.6, 11, -2], [8.2, 9.6, -2.6], 'wingC']])]};
  T.centaur = {name: 'Centaur / beast-taur', bones: [...T.quad.bones.filter(b => !['neck', 'head', 'jaw'].includes(b[0])), ['torso', 'chest', [0, 5.6, 2.2], [0, 7.6, 2.6], 'chest'],
    ['neck', 'torso', [0, 7.6, 2.6], [0, 8.3, 2.8], 'neck'], ['head', 'neck', [0, 8.3, 2.8], [0, 9.4, 3], 'head', {up: 1}], ['jaw', 'head', [0, 8.4, 3], [0, 8.2, 3.8], 'jaw', {up: 1}], ...arms(7.4, .9, .9, 'torso').map(b => [b[0], b[1], [b[2][0], b[2][1], b[2][2] + 2.4], [b[3][0], b[3][1], b[3][2] + 2.4], b[4]])]};
  T.naga = {name: 'Naga (snake tail + body)', bones: [...chain('tailseg', null, [[0, .6, -7], [0, .6, -5], [0, .7, -3], [0, 1, -1.2], [0, 2.2, 0], [0, 4, .3]], 'tail'), ['hips', 'tailseg5', [0, 4, .3], [0, 5, .3], 'spine'],
    ['spine', 'hips', [0, 5, .3], [0, 6.2, .3], 'spine'], ['chest', 'spine', [0, 6.2, .3], [0, 7.6, .4], 'chest'], ['neck', 'chest', [0, 7.6, .4], [0, 8.3, .6], 'neck'], ['head', 'neck', [0, 8.3, .6], [0, 9.4, .8], 'head', {up: 1}],
    ['jaw', 'head', [0, 8.4, .8], [0, 8.2, 1.7], 'jaw', {up: 1}], ...arms(7.4, .9, .9)].map(b => b[0] === 'tailseg1' ? ['tailseg1', null, b[2], b[3], 'tail'] : b)};
  T.walker = {name: 'Mech walker (reverse knees)', bones: [['hips', null, [0, 6, 0], [0, 7.2, 0], 'spine'], ['chest', 'hips', [0, 7.2, 0], [0, 8.6, .2], 'chest'], ['head', 'chest', [0, 8.6, .4], [0, 9.6, .8], 'head', {up: 1}],
    ...both([['thigh', 'hips', [1, 6, 0], [1.4, 4.2, 1.6], 'legU'], ['shin', 'thigh#', [1.4, 4.2, 1.6], [1.4, 1.4, -.8], 'legL'], ['foot', 'shin#', [1.4, 1.4, -.8], [1.4, 0, .6], 'foot'], ['gun', 'chest', [1.6, 8, .2], [2.6, 8, 2.4], 'armF']])]};
  T.tank = {name: 'Tank base + upper body', bones: [['base', null, [0, 0, -1.5], [0, 0, 1.5], 'spine'], ['hips', 'base', [0, 2.6, 0], [0, 3.6, 0], 'spine'], ['chest', 'hips', [0, 3.6, 0], [0, 6, .2], 'chest'],
    ['head', 'chest', [0, 6, .3], [0, 7, .5], 'head', {up: 1}], ...arms(5.8, 1.1), ...both([['tread', 'base', [1.6, .9, -2], [1.6, .9, 2], 'legU']])]};
  T.bird = {name: 'Bird / griffin', bones: [...T.wyvern.bones]};
  T.fish = {name: 'Fish / shark', bones: [...chain('body', null, [[0, 4, 3], [0, 4, 1.2], [0, 4, -.8], [0, 4, -2.8], [0, 4, -4.6], [0, 4, -6.2]], 'tail'), ['head', 'body1', [0, 4, 3], [0, 4.3, 4.6], 'head', {up: 1}],
    ['jaw', 'head', [0, 3.7, 3.4], [0, 3.4, 4.8], 'jaw', {up: 1}], ['dorsal', 'body2', [0, 4.8, 1], [0, 6.6, .2], 'extra'], ...both([['fin', 'body1', [.9, 3.6, 2.4], [2.6, 3, 1.4], 'wingA']])].map(b => b[0] === 'body1' ? ['body1', null, b[2], b[3], 'chest'] : b)};
  T.octopus = {name: 'Octopus / squid', bones: [['body', null, [0, 3, 0], [0, 7, -.6], 'chest'], ['head', 'body', [0, 3.6, .6], [0, 4.6, 1.2], 'head', {up: 1}],
    ...[...Array(8).keys()].flatMap(i => { const a = i / 8 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), n = 'tent' + i; return [[n + 'a', 'body', [sn * .7, 2.8, c * .7], [sn * 2.6, 1.2, c * 2.6], 'tail'], [n + 'b', n + 'a', [sn * 2.6, 1.2, c * 2.6], [sn * 4.4, .4, c * 4.4], 'tail'], [n + 'c', n + 'b', [sn * 4.4, .4, c * 4.4], [sn * 6, .6, c * 6], 'tail']]; })]};
  T.insect = {name: 'Insect (6 legs)', bones: [['body', null, [0, 3, -.6], [0, 3.2, 1.4], 'chest'], ['abdomen', 'body', [0, 3.2, -.6], [0, 3.8, -4.4], 'tail'], ['head', 'body', [0, 3.2, 1.4], [0, 3.9, 2.4], 'head', {up: 1}],
    ['jaw', 'head', [0, 2.9, 2.1], [0, 2.5, 3], 'jaw', {up: 1}], ...spLeg(1, 1.2, .8), ...spLeg(2, .4, 0), ...spLeg(3, -.4, -.8), ...both([['antenna', 'head', [.3, 3.9, 2.2], [1.2, 6, 4], 'extra']])]};
  T.scorpion = {name: 'Scorpion', bones: [...T.insect.bones.filter(b => !b[0].startsWith('abdomen') && !b[0].startsWith('antenna')), ...chain('tail', 'body', [[0, 3.2, -.6], [0, 3.6, -2.4], [0, 4.8, -3.8], [0, 6.6, -4.2], [0, 8.2, -3.4], [0, 8.6, -1.8]], 'tail'),
    ...both([['clawarm', 'body', [1, 3.2, 1.4], [2.6, 3.8, 2.8], 'armU'], ['clawfore', 'clawarm#', [2.6, 3.8, 2.8], [2.4, 4, 4.6], 'armF'], ['pincer', 'clawfore#', [2.4, 4, 4.6], [2.2, 4, 6.2], 'hand']])]};
  T.kaiju = {name: 'Heavy kaiju (big tail)', bones: [...core(4.6, 8.4, .7, 1.2), ...arms(8, 1.1, .8), ...legs(4.6, 1.3, 1.4), ...chain('tail', 'hips', [[0, 4.5, -.8], [0, 3.6, -2.6], [0, 2.6, -4.6], [0, 1.8, -6.6], [0, 1.2, -8.6], [0, .9, -10.4], [0, .8, -12]], 'tail')]};
  T.sphinx = {name: 'Sphinx (lion + wings)', bones: [...T.quad.bones.map(b => b[0] === 'neck' ? ['neck', 'chest', [0, 5.6, 2.2], [0, 7.4, 2.8], 'neck'] : b[0] === 'head' ? ['head', 'neck', [0, 7.4, 2.8], [0, 8.6, 3.1], 'head', {up: 1}] : b[0] === 'jaw' ? ['jaw', 'head', [0, 7.4, 3.1], [0, 7.2, 3.9], 'jaw', {up: 1}] : b), ...wings]};
  T.blob = {name: 'Blob / no legs', bones: [['body', null, [0, 0, 0], [0, 4, 0], 'spine'], ['top', 'body', [0, 4, 0], [0, 7, .3], 'chest'], ['head', 'top', [0, 7, .3], [0, 8.5, .6], 'head', {up: 1}]]};
  T.none = {name: 'No skeleton (free build)', bones: [['root', null, [0, 0, 0], [0, 2, 0], 'spine']]};
  window.FORGE_SKEL = T;
})();
