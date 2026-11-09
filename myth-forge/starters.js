// Starter creatures: [lib id, bone, position (bone space), rotation deg, size or null = fit to bone, extra]
window.FORGE_STARTERS = [
  {id: 'heromech', name: 'Hero Mech (model kit)', skel: 'mech', fx: {glow: true, bg: 'studio', aura: false}, parts: [
    ['mk_torso_waist', 'hips', [0, -.3, 0], [0, 0, 0], 1.1], ['mk_torso_abdomen', 'spine', [0, -.2, 0], [0, 0, 0], 1], ['mk_torso_hero', 'chest', [0, -1.7, 0], [0, 0, 0], .95],
    ['mk_torso_backpack', 'chest', [0, -.2, -1.0], [-90, 0, 0], .9], ['mk_head_vcrest', 'head', [0, -.3, 0], [0, 0, 0], 1.1], ['mk_sh_round', 'shoulder.L', [.4, 0, 0], [0, 0, 0], 1.15],
    ['mk_arm_upper', 'upperarm.L', [0, 0, 0], [0, 0, 0], 1], ['mk_arm_forearm', 'forearm.L', [0, 0, 0], [0, 0, 0], 1], ['mk_hand_open', 'hand.L', [0, 0, 0], [0, 0, 0], .9],
    ['mk_leg_thigh', 'thigh.L', [0, 0, 0], [0, 0, 0], 1], ['mk_leg_shin', 'shin.L', [0, 0, 0], [0, 0, 0], 1], ['mk_foot_armored', 'foot.L', [0, -.2, .3], [-90, 0, 0], 1],
    ['wp_longsword', 'hand.R', [0, .4, .2], [90, 0, 0], 1, 'solo'], ['wp_kiteshield', 'forearm.L', [.5, 1.1, 0], [0, 90, -90], .6, 'solo'], ['wp_rifle', 'chest', [1.4, 1.6, -1.2], [-90, 0, 0], .7]]},
  {id: 'mechadragon', name: 'Mecha Dragon', skel: 'dragon', fx: {glow: true, bg: 'neon', col: '#3a8aff', aura: true}, parts: [
    ['md_belly', 'hips', [0, 0, 0], [0, 180, 0], 1.05], ['md_chest', 'spine', [0, 0, 0], [0, 180, 0], .95], ['md_neck', 'neck', [0, 0, 0], [0, 0, 0], null],
    ['md_head', 'head', [0, -.3, -.4], [0, 0, 0], 1.4], ['md_jaw', 'jaw', [0, -.05, -.1], [8, 0, 0], 1.4], ['md_tail', 'tail1', [0, 0, 0], [0, 0, 0], null],
    ['md_wing', 'wing.L', [0, 0, 0], [0, 0, 0], null], ['md_leg', 'frontleg.L', [0, 0, 0], [0, 0, 0], null], ['md_leg', 'backleg.L', [0, 0, 0], [0, 0, 0], 1.05],
    ['md_shoulder', 'chest', [-1.1, .2, .5], [0, 0, 70], 1], ['md_dorsal', 'spine', [0, .2, 1.3], [90, 0, 0], 1], ['md_orb', 'hips', [-.95, .9, .5], [0, 0, 80], .7]]},
];
