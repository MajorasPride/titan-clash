// Starter creatures: [lib id, bone, position (bone space), rotation deg, size or null = fit to bone, extra]
window.FORGE_STARTERS = [
  {id: 'mechadragon', name: 'Mecha Dragon', skel: 'dragon', fx: {glow: true, bg: 'neon', col: '#3a8aff', aura: true}, parts: [
    ['md_belly', 'hips', [0, 0, 0], [0, 180, 0], 1.05], ['md_chest', 'spine', [0, 0, 0], [0, 180, 0], .95], ['md_neck', 'neck', [0, 0, 0], [0, 0, 0], null],
    ['md_head', 'head', [0, -.3, -.4], [0, 0, 0], 1.4], ['md_jaw', 'jaw', [0, -.05, -.1], [8, 0, 0], 1.4], ['md_tail', 'tail1', [0, 0, 0], [0, 0, 0], null],
    ['md_wing', 'wing.L', [0, 0, 0], [0, 0, 0], null], ['md_leg', 'frontleg.L', [0, 0, 0], [0, 0, 0], null], ['md_leg', 'backleg.L', [0, 0, 0], [0, 0, 0], 1.05],
    ['md_shoulder', 'chest', [-1.1, .2, .5], [0, 0, 70], 1], ['md_dorsal', 'spine', [0, .2, 1.3], [90, 0, 0], 1], ['md_orb', 'hips', [-.95, .9, .5], [0, 0, 80], .7]]},
];
