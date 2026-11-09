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
  // ---- Nov 9 2026 myth starters. size 'fit' = body fit system, 'decor' = sized to the main part on that bone
  {id: 'treefolk', name: 'Elder Treefolk', skel: 'treefolk', fx: {glow: true, bg: 'day', aura: false}, parts: [
    ['tf_trunk', 'hips', [0, 0, 0], [0, 0, 0], 'fit'], ['tf_face_elder', 'head', [0, 0, 0], [0, 0, 0], 'fit'], ['tf_moss_beard', 'head', [0, 0, 0], [0, 0, 0], 'decor', 'solo'],
    ['tf_arm_branch', 'upperarm.L', [0, 0, 0], [0, 0, 0], 'fit'], ['tf_hand_twig', 'hand.L', [0, 0, 0], [0, 0, 0], 'fit'],
    ['tf_leg_root', 'thigh.L', [0, 0, 0], [0, 0, 0], 'fit'], ['tf_foot_roots', 'foot.L', [0, 0, 0], [0, 0, 0], 'fit'],
    ['tf_leaf_crown', 'branch.L', [0, 0, 0], [0, 0, 0], .8], ['tf_bark_pauldron', 'shoulder.L', [.3, .2, 0], [0, 0, -20], 1.1],
    ['tf_shelf_fungus', 'spine', [1.3, .3, .5], [0, 0, -80], 1, 'solo'], ['tf_toadstools', 'chest', [-.6, 1.4, .9], [30, 0, 10], 1, 'solo']]},
  {id: 'grudgespirit', name: 'Forest Grudge Spirit', skel: 'slim', fx: {glow: true, bg: 'void', mist: true, col: '#5aff9a', aura: false}, parts: [
    ['sp_torso_gaunt', 'hips', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'bark9'}], ['sp_skull_stag', 'head', [0, 0, 0], [0, 0, 0], 'fit'], ['tf_branch_antlers', 'head', [0, 0, 0], [0, 0, 0], 'decor', 'solo'],
    ['sp_hood', 'head', [0, 0, 0], [0, 0, 0], 'decor', 'solo'], ['sp_robe', 'hips', [0, 0, 0], [0, 0, 0], 1, 'solo'],
    ['sp_arm_gaunt', 'upperarm.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'bark9'}], ['sp_hand_claw', 'hand.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'bark9'}],
    ['tf_leg_root', 'thigh.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'bark9'}], ['tf_foot_roots', 'foot.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'bark9'}],
    ['sp_shimenawa', 'chest', [0, .6, 0], [0, 0, 0], .9, 'solo'], ['sp_wisps', 'hips', [0, -4, 0], [0, 0, 0], 1.2, 'solo']]},
  {id: 'yurei', name: 'Long-Hair Ghost', skel: 'slim', fx: {glow: true, bg: 'void', col: '#7ac8ff', mist: true}, parts: [
    ['sp_torso_gaunt', 'hips', [0, 0, 0], [0, 0, 0], 'fit'], ['sp_head_hair', 'head', [0, 0, 0], [0, 0, 0], 'fit'], ['sp_robe', 'hips', [0, 0, 0], [0, 0, 0], 1, {solo: true, mat: 'ragwhite', fade: .45}],
    ['sp_arm_gaunt', 'upperarm.L', [0, 0, 0], [0, 0, 0], 'fit'], ['sp_hand_claw', 'hand.L', [0, 0, 0], [0, 0, 0], 'fit'], ['sp_ofuda', 'chest', [0, 1.2, 1.0], [80, 0, 0], 1, 'solo'],
    ['sp_wisps', 'hips', [0, -4, 0], [0, 0, 0], 1.1, 'solo']]},
  {id: 'kraken', name: 'Kraken', skel: 'octopus', fx: {glow: true, bg: 'neon', col: '#2a6aff'}, parts: [
    ['kr_mantle', 'body', [0, 0, 0], [0, 0, 0], 'fit'], ['kr_beak', 'head', [0, 0, 0], [0, 0, 0], 'fit'],
    ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => [i === 0 || i === 4 ? 'kr_tentacle_club' : 'kr_tentacle', 'tent' + i + 'a', [0, 0, 0], [0, 0, 0], 'fit', 'solo'])]},
  {id: 'giantmoth', name: 'Giant Moth', skel: 'moth', fx: {glow: true, bg: 'neon', aura: true, col: '#ffd27a'}, parts: [
    ['mo_body', 'body', [0, 0, 0], [0, 0, 0], 'fit'], ['mo_abdomen', 'abdomen', [0, 0, 0], [0, 0, 0], 'fit'], ['mo_head', 'head', [0, 0, 0], [0, 0, 0], 'fit'],
    ['mo_wing', 'wing.L', [0, 0, 0], [0, 0, 0], 'fit'], ['mo_wing_hind', 'hindwing.L', [0, 0, 0], [0, 0, 0], 'fit'],
    ['cp_leg', 'leg1.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'mothfur'}], ['cp_leg', 'leg2.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'mothfur'}], ['cp_leg', 'leg3.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'mothfur'}]]},
  {id: 'mothman', name: 'Mothman', skel: 'angel', fx: {glow: true, bg: 'void', mist: true, col: '#ff2a2a'}, parts: [
    ['mo_torso_furry', 'hips', [0, 0, 0], [0, 0, 0], 'fit'], ['mo_head_mothman', 'head', [0, 0, 0], [0, 0, 0], 'fit'],
    ['sp_arm_gaunt', 'upperarm.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'mothdark'}], ['sp_hand_claw', 'hand.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'mothdark'}],
    ['sp_leg_gaunt', 'thigh.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'mothdark'}], ['mo_wing_dark', 'wing.L', [0, 0, 0], [0, 0, 0], 'fit']]},
  {id: 'centipede', name: 'Giant Centipede', skel: 'centipede', fx: {glow: true, bg: 'hell', aura: false}, parts: [
    ['cp_head', 'head', [0, 0, 0], [0, 0, 0], 'fit'], ['cp_fangs', 'jaw', [0, 0, 0], [0, 0, 0], 'fit'], ['cp_tail_feelers', 'tail1', [0, 0, 0], [0, 0, 0], 'fit', 'solo'],
    ...[...Array(12).keys()].flatMap(i => [['cp_segment', 'seg' + (i + 1), [0, 0, 0], [0, 0, 0], 'fit', 'solo'], ['cp_leg', 'leg' + (i + 1) + '.L', [0, 0, 0], [0, 0, 0], 'fit']])]},
  {id: 'sanddragon', name: 'Sand Spirit Dragon', skel: 'dragon', fx: {glow: true, bg: 'day', aura: true, col: '#ffc070'}, parts: [
    ['bd_torso_dragon', 'hips', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'sandglow'}], ['bd_neck_dragon', 'neck', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'sand'}],
    ['hd_head_dragon', 'head', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'sandgold'}], ['hd_jaw_dragon', 'jaw', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'sandgold'}],
    ['bd_leg_dragon', 'frontleg.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'sandblack'}], ['bd_leg_dragon', 'backleg.L', [0, 0, 0], [0, 0, 0], 'fit', {mat: 'sandblack'}],
    ['tw_tail_reptile', 'tail1', [0, 0, 0], [0, 0, 0], 'fit', {solo: true, mat: 'sand', fade: .45}], ['sd_wing_sand', 'wing.L', [0, 0, 0], [0, 0, 0], 'fit']]},
];
