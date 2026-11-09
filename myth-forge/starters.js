// Starter creatures: [lib id, bone, position (bone space), rotation deg, size or null = fit to bone, extra]
window.FORGE_STARTERS = [
  {id: 'heromech', name: 'Hero Mech (model kit)', skel: 'mech', fx: {glow: true, bg: 'studio', aura: false}, parts: [
    ['mk_torso_waist', 'hips', [0, -.3, 0], [0, 0, 0], 1.1], ['mk_torso_abdomen', 'spine', [0, -.2, 0], [0, 0, 0], 1], ['mk_torso_hero', 'chest', [0, -1.7, 0], [0, 0, 0], .95],
    ['mk_torso_backpack', 'chest', [0, -.2, -1.0], [-90, 0, 0], .9], ['mk_head_vcrest', 'head', [0, -.3, 0], [0, 0, 0], 1.1], ['mk_sh_round', 'shoulder.L', [.4, 0, 0], [0, 0, 0], 1.15],
    ['mk_arm_upper', 'upperarm.L', [0, 0, 0], [0, 0, 0], 1], ['mk_arm_forearm', 'forearm.L', [0, 0, 0], [0, 0, 0], 1], ['mk_hand_open', 'hand.L', [0, 0, 0], [0, 0, 0], .9],
    ['mk_leg_thigh', 'thigh.L', [0, 0, 0], [0, 0, 0], 1], ['mk_leg_shin', 'shin.L', [0, 0, 0], [0, 0, 0], 1], ['mk_foot_armored', 'foot.L', [0, -.2, .3], [-90, 0, 0], 1],
    ['wp_longsword', 'hand.R', [0, .4, .2], [90, 0, 0], 1, 'solo'], ['wp_kiteshield', 'forearm.L', [.5, 1.1, 0], [0, 90, -90], .6, 'solo'], ['wp_rifle', 'chest', [1.4, 1.6, -1.2], [-90, 0, 0], .7]]},
  {id: 'basaltkaiju', name: 'Basalt Kaiju', skel: 'kaiju', fx: {glow: true, bg: 'neon', aura: false}, parts: [
    ['kj_hips', 'hips', [0, 0, 0], [0, 0, 0], 1], ['kj_chest', 'chest', [0, 0, 0], [0, 0, 0], 1], ['kj_neck', 'neck', [0, 0, 0], [0, 0, 0], 1],
    ['kj_head', 'head', [0, 0, 0], [0, 0, 0], 1], ['kj_jaw', 'jaw', [0, 0, 0], [0, 0, 0], 1],
    ['kj_thigh', 'thigh.L', [0, 0, 0], [0, 0, 0], 1], ['kj_shin', 'shin.L', [0, 0, 0], [0, 0, 0], 1], ['kj_foot', 'foot.L', [0, 0, 0], [0, 0, 0], 1],
    ['kj_upperarm', 'upperarm.L', [0, 0, 0], [0, 0, 0], 1], ['kj_forearm', 'forearm.L', [0, 0, 0], [0, 0, 0], 1], ['kj_hand', 'hand.L', [0, 0, 0], [0, 0, 0], 1],
    ['kj_tail', 'tail1', [0, 0, 0], [0, 0, 0], [1.2, 1.68]], ['kj_tail', 'tail2', [0, 0, 0], [0, 0, 0], [1.0, 2.24]], ['kj_tail', 'tail3', [0, 0, 0], [0, 180, 0], [.84, 2.56]],
    ['kj_tail', 'tail4', [0, 0, 0], [0, 180, 0], [.68, 3.07]], ['kj_tail', 'tail5', [0, 0, 0], [0, 180, 0], [.54, 3.37]], ['kj_tailtip', 'tail6', [0, 0, 0], [0, 180, 0], [.42, 1.81]],
    ['kj_dorsal_l', 'chest', [0, .45, -1.0], [-55, 0, 0], 1], ['kj_dorsal_l', 'spine', [0, .9, -1.25], [-60, 0, 0], 1], ['kj_dorsal_m', 'hips', [0, .6, -1.45], [-70, 0, 0], 1],
    ['kj_dorsal_s', 'neck', [0, .35, -.85], [-55, 0, 0], 1], ['kj_dorsal_m', 'tail1', [0, 1.0, -.95], [-75, 0, 0], .9], ['kj_dorsal_s', 'tail2', [0, 1.1, -.82], [-75, 0, 0], 1],
    ['kj_dorsal_s', 'tail3', [0, 1.1, .7], [75, 0, 0], .85], ['kj_dorsal_s', 'tail4', [0, 1.1, .56], [75, 0, 0], .7], ['kj_dorsal_s', 'tail5', [0, 1.0, .44], [75, 0, 0], .55]]},
  {id: 'sailback', name: 'Sailback Spinosaur', skel: 'theropod', fx: {glow: true, bg: 'day', aura: false}, parts: [
    ['dn_body', 'hips', [0, 0, 0], [0, 0, 0], 1], ['dn_neck', 'neck', [0, 0, 0], [0, 0, 0], 1], ['dn_head', 'head', [0, 0, 0], [0, 0, 0], 1], ['dn_jaw', 'jaw', [0, 0, 0], [0, 0, 0], 1],
    ['dn_sail', 'spine', [0, .5, -1.25], [-90, 0, 0], 1],
    ['dn_thigh', 'thigh.L', [0, 0, 0], [0, 0, 0], 1], ['dn_shin', 'shin.L', [0, 0, 0], [0, 0, 0], 1], ['dn_foot', 'foot.L', [0, 0, 0], [0, 0, 0], 1],
    ['dn_upperarm', 'upperarm.L', [0, 0, 0], [0, 0, 0], 1], ['dn_forearm', 'forearm.L', [0, 0, 0], [0, 0, 0], 1], ['dn_hand', 'hand.L', [0, 0, 0], [0, 0, 0], 1],
    ['dn_tail', 'tail1', [0, 0, 0], [0, 0, 0], [1.05, 1.9]], ['dn_tail', 'tail2', [0, 0, 0], [0, 0, 0], [.9, 2.25]], ['dn_tail', 'tail3', [0, 0, 0], [0, 0, 0], [.74, 2.8]],
    ['dn_tail', 'tail4', [0, 0, 0], [0, 0, 0], [.6, 3.4]], ['dn_tail', 'tail5', [0, 0, 0], [0, 0, 0], [.47, 3.9]], ['dn_tail', 'tail6', [0, 0, 0], [0, 0, 0], [.36, 4.5]],
    ['dn_tail_fin', 'tail4', [0, .9, .45], [90, 0, 0], .8, 'solo']]},
  {id: 'mechadragon', name: 'Mecha Dragon', skel: 'dragon', fx: {glow: true, bg: 'neon', col: '#3a8aff', aura: true}, parts: [
    ['md_belly', 'hips', [0, 0, 0], [0, 180, 0], 1.05], ['md_chest', 'spine', [0, 0, 0], [0, 180, 0], .95], ['md_neck', 'neck', [0, 0, 0], [0, 0, 0], null],
    ['md_head', 'head', [0, -.3, -.4], [0, 0, 0], 1.4], ['md_jaw', 'jaw', [0, -.05, -.1], [8, 0, 0], 1.4], ['md_tail', 'tail1', [0, 0, 0], [0, 0, 0], null],
    ['md_wing', 'wing.L', [0, 0, 0], [0, 0, 0], null], ['md_leg', 'frontleg.L', [0, 0, 0], [0, 0, 0], null], ['md_leg', 'backleg.L', [0, 0, 0], [0, 0, 0], 1.05],
    ['md_shoulder', 'chest', [-1.1, .2, .5], [0, 0, 70], 1], ['md_dorsal', 'spine', [0, .2, 1.3], [90, 0, 0], 1], ['md_orb', 'hips', [-.95, .9, .5], [0, 0, 80], .7]]},
];
