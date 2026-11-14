// Mythic Forge — 2.0 kits in the parts library (T049, Nov 13 2026). Plain script, loaded after the parts/k2-<kit>.js data files.
// The six Blender kits (mech, kaiju, weapons, dragon, hydra, tree shepherd) ARE the parts list (T060): one category per kit, sorted by slot, in every mode.
// Everything older (code-made parts, free packs, imports) sits under the Old tab of the parts browser. No "new" labels anywhere.
// Each kit part keeps what the kit file says about it:
//   - plugs: where the next part clicks in (hip, knee, neck, tail, back plates...). Body pieces keep the pose they were modelled in ('frame');
//     plates, coats, feathers, weapons and shields point along the plug ('out'). Left-side plugs mirror right-side parts.
//   - hitbox: box + capsule, already at Forge size (entry.hitbox), for the Titan Clash sandbox (T050).
//   - colours: one number per kit material (paint by number), and every kit colour scheme as a one-tap pattern.
// Size: kit units x 2.4 (a kit mech is about 4.6 tall, a Forge titan about 11).
(function () {
  const S = 2.4, GROUP = 'Kit parts';   // T060: GROUP is now only the family name; each kit has its own category (KIT_GROUP)
  const KIT_GROUP = {mech: 'Mech parts', kaiju: 'Kaiju parts', weapons: 'Weapons & shields', dragon: 'Dragon parts', hydra: 'Hydra parts', tree: 'Tree shepherd parts'};
  const SLOT_ORDER = ['pelvis', 'hips', 'body', 'trunk', 'torso', 'chest', 'neck', 'head', 'jaw', 'face', 'horn', 'crest', 'crown', 'shoulder', 'upperarm', 'arm_up', 'forearm', 'arm_lo', 'hand', 'thigh', 'shin', 'foot', 'wing_in', 'wing_out', 'wing', 'feathers', 'tail', 'tail_tip', 'back', 'coat', 'extra', 'melee', 'gun', 'shield', 'mount', 'kaiju'];
  const AS = {   // slot -> what it plugs into
    pelvis: null, hips: null, body: null, trunk: null, torso: 'k-waist', chest: 'k-waist', head: 'k-neck', neck: 'k-neck', jaw: 'k-jaw', horn: 'horn', crest: 'crest',
    shoulder: 'k-arm', upperarm: 'k-arm', arm_up: 'k-arm', forearm: 'k-elbow', arm_lo: 'k-elbow', hand: 'k-hand', thigh: 'k-leg', shin: 'k-knee', foot: 'k-foot',
    tail: 'k-tail', tail_tip: 'k-tail', wing: 'k-wing', wing_in: 'k-wing', wing_out: 'k-wing2', feathers: 'k-feather', face: 'k-face', crown: 'k-crown',
    coat: 'back', extra: 'back', kaiju: 'back', melee: 'weapon', gun: 'weapon', shield: 'k-shield', mount: 'k-pod'};
  const BACK_AS = {mech: 'k-back', dragon: 'k-back', hydra: 'k-back', kaiju: 'back'};   // mech packs and dragon back plates sit in the body's frame; kaiju plates point along the plug
  // plug name (no _R / _L, no number) -> [type, 'frame' | 'out']
  const PL = {waist: ['k-waist', 'frame'], hip: ['k-leg', 'frame'], neck: ['k-neck', 'frame'], head: ['k-neck', 'frame'], tail: ['k-tail', 'frame'], shoulder: ['k-arm', 'frame'], arm: ['k-arm', 'frame'],
    elbow: ['k-elbow', 'frame'], wrist: ['k-hand', 'frame'], knee: ['k-knee', 'frame'], ankle: ['k-foot', 'frame'], jaw: ['k-jaw', 'frame'], horn: ['horn', 'frame'], crest: ['crest', 'frame'],
    wing: ['k-wing', 'frame'], coverts: ['k-feather', 'out'], secondaries: ['k-feather', 'out'], primaries: ['k-feather', 'out'], pod: ['k-pod', 'out'], mount: ['k-shield', 'out'], grip: ['weapon', 'out'],
    face: ['k-face', 'frame'], crown: ['k-crown', 'frame']};
  const plugKind = (name, slot, numbered) => {
    if (name === 'next') return slot === 'tail' ? ['k-tail', 'frame'] : ['k-neck', 'frame'];
    if (name === 'tip') return slot === 'wing_in' ? ['k-wing2', 'frame'] : slot === 'back' ? ['back', 'out'] : null;
    if (name === 'back') return numbered ? ['back', 'out'] : ['k-back', 'frame'];
    if (name === 'coat') return ['back', 'out'];
    return PL[name] || null; };
  const SLOT_NAME = {pelvis: 'hips', hips: 'hips', body: 'body', trunk: 'trunk', torso: 'chest', chest: 'chest', upperarm: 'upper arm', arm_up: 'upper arm', forearm: 'forearm', arm_lo: 'forearm', tail_tip: 'tail tip',
    wing_in: 'wing (inner)', wing_out: 'wing (outer)', melee: 'melee weapon', kaiju: 'kaiju weapon', mount: 'pod / cannon', extra: 'moss / leaves', coat: 'fur / feathers'};
  const kits = window.MF_KIT_DATA || [];
  window.MF_KIT_GROUPS = Object.values(KIT_GROUP);
  window.MF_KITS = {scale: S, group: GROUP, groupOf: KIT_GROUP, slotOrder: SLOT_ORDER, kits: kits.map(k => ({kit: k.kit, title: k.title, ticket: k.ticket, parts: k.parts.length, schemes: Object.keys(k.schemes)})),
    id: (kit, id) => 'k2_' + kit + '_' + id};
  (window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T) {
    const out = [];
    const geoOf = b64 => { const bin = atob(b64), n = bin.length >> 1, a = new Float32Array(n);
      for (let i = 0; i < n; i++) { let v = bin.charCodeAt(i * 2) | (bin.charCodeAt(i * 2 + 1) << 8); if (v > 32767) v -= 65536; a[i] = v / 200 * S; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(a, 3)); g.computeVertexNormals(); return g; };
    for (const k of kits) for (const p of k.parts) {
      const mats = [...new Set(p.m.map(x => x[0]))], glow = new Set(k.glow || []);
      const col = (sch, m) => { const c = sch[m] || k.base[m]; return c ? c + (glow.has(m) ? ':g' : '') : null; };
      const plugs = [];
      for (const [name, v] of Object.entries(p.plugs)) { const m = name.match(/^(.*?)(?:_(\d+\w?))?(?:_([RL]))?$/), kind = plugKind(m[1], p.slot, m[2] != null && m[1] !== 'neck'); if (!kind) continue;
        const pl = {id: name, t: kind[0], p: [v[0] * S, v[1] * S, v[2] * S].map(x => +x.toFixed(3)), d: [v[3], v[4], v[5]], o: kind[1], s: v[6] || 1};
        if (m[3]) { pl.side = m[3]; const twin = name.slice(0, -1) + (m[3] === 'R' ? 'L' : 'R'); if (p.plugs[twin]) pl.pairOf = twin; }
        plugs.push(pl); }
      const hb = p.hb, sc = a => a.map(x => +(x * S).toFixed(3));
      const patterns = {}; for (const [n, sch] of Object.entries(k.schemes)) { const map = {}; mats.forEach((m, i) => { const c = col(sch, m); if (c) map[i + 1] = c; }); patterns[n[0].toUpperCase() + n.slice(1).replace(/_/g, ' ')] = map; }
      const sn = SLOT_NAME[p.slot] || p.slot.replace(/_/g, ' ');
      out.push({id: 'k2_' + k.kit + '_' + p.id, group: KIT_GROUP[k.kit] || GROUP, sub: sn[0].toUpperCase() + sn.slice(1), kit2: true, name: p.name, about: p.about, tags: [k.kit, sn], facet: true, along: false,
        plugAs: p.slot === 'back' ? (BACK_AS[k.kit] || 'back') : AS[p.slot] !== undefined ? AS[p.slot] : null, plugs, sided: !!p.sided, kit: k.kit, kslot: p.slot, pbnNames: mats, patterns,
        hitbox: {box: {centre: sc(hb.box[0]), size: sc(hb.box[1])}, capsule: {axis: hb.cap[0], radius: +(hb.cap[1] * S).toFixed(3), length: +(hb.cap[2] * S).toFixed(3), centre: sc(hb.cap[3])}},
        src: '2.0 ' + k.title.toLowerCase() + ' (' + k.ticket + '): made in Blender for Titan Clash (ours)',
        make: () => p.m.map(([m, b64]) => ({geo: geoOf(b64), mat: 'col:' + (col({}, m) || '#8a8f98'), num: mats.indexOf(m) + 1}))});
    }
    const so = p => { const i = SLOT_ORDER.indexOf(p.kslot); return i < 0 ? 99 : i; };
    return out.sort((a, b) => so(a) - so(b));
  });
})();

// ====================================================================== T060: glow slot colours + one-tap kit starters
// Glow slot: a paint-by-number key 'col:#rrggbb:...G<rrggbb>[x<strength>]' makes that piece shine in the G colour (bloom picks it up on a dark background).
(function () {
  const M = window.FORGE_MATS; if (!M || M._k2glow) return; M._k2glow = true; const mk = M.makeMat;
  M.makeMat = function (T, key, tint, tile) { const g = typeof key === 'string' && key.startsWith('col:') && key.match(/G([0-9a-fA-F]{6})(?:x([\d.]+))?/);
    if (!g) return mk.call(this, T, key, tint, tile);
    const m = mk.call(this, T, key.replace(/G[0-9a-fA-F]{6}(?:x[\d.]+)?/, ''), tint, tile); m.emissive = new T.Color('#' + g[1]); m.emissiveIntensity = g[2] ? +g[2] : 2.2; m.userData.key = key; return m; };
})();
// Starters (Q054): the kits' sample builds, clicked together through their plugs and painted in their own scheme. Ids are kit part ids ('weapons:x' = from another kit).
// back / coat = the part that goes on every numbered back / coat plug (plates, fur, leaves). The loader lives in forge-v3.js (window.mfLoadKitStarter).
window.MF_KIT_STARTERS = [
  {name: 'Vanguard', kit: 'mech', scheme: 'vanguard', face: 'head_vanguard', parts: ['pelvis_skirt', 'torso_sleek', 'head_vanguard', 'back_thrusters', 'shoulder_round', 'upperarm_sleek', 'forearm_gauntlet', 'hand_kit', 'thigh_sleek', 'shin_sleek', 'foot_heeled', 'weapons:energy_sword']},
  {name: 'Bulwark', kit: 'mech', scheme: 'bulwark', face: 'head_bulwark', parts: ['pelvis_heavy', 'torso_heavy', 'head_bulwark', 'back_reactor', 'shoulder_block', 'upperarm_heavy', 'forearm_cuff', 'hand_kit', 'thigh_heavy', 'shin_heavy', 'foot_tread', 'weapons:gatling', 'weapons:shield_tower']},
  {name: 'Titanheart', kit: 'mech', scheme: 'titanheart', face: 'head_titanheart', parts: ['pelvis_skirt', 'torso_emblem', 'head_titanheart', 'back_wings', 'shoulder_fin', 'upperarm_sleek', 'forearm_rocket', 'hand_kit', 'thigh_sleek', 'shin_super', 'foot_heeled', 'weapons:great_sword']},
  {name: 'Ranger', kit: 'mech', scheme: 'ranger', face: 'head_ranger', parts: ['pelvis_fauld', 'torso_cockpit', 'head_ranger', 'back_ammo', 'shoulder_layered', 'upperarm_sleek', 'forearm_intake', 'hand_kit', 'thigh_sleek', 'shin_nacelle', 'foot_roller', 'weapons:beam_rifle']},
  {name: 'Falcon', kit: 'mech', scheme: 'falcon', face: 'head_falcon', parts: ['pelvis_longskirt', 'torso_sleek', 'head_falcon', 'back_jetfold', 'shoulder_siren', 'upperarm_sleek', 'forearm_bracer', 'hand_kit', 'thigh_sleek', 'shin_sleek', 'foot_talon', 'weapons:beam_pistol']},
  {name: 'Paladin', kit: 'mech', scheme: 'paladin', face: 'head_paladin', parts: ['pelvis_longskirt', 'torso_knight', 'head_paladin', 'back_pylons', 'shoulder_pylon', 'upperarm_heavy', 'forearm_bracer', 'hand_kit', 'thigh_heavy', 'shin_heavy', 'foot_sabaton', 'weapons:lance', 'weapons:shield_kite']},
  {name: 'Wraith', kit: 'mech', scheme: 'wraith', face: 'head_wraith', parts: ['pelvis_skirt', 'torso_bio', 'head_wraith', 'back_sabers', 'shoulder_spike', 'upperarm_sleek', 'forearm_spines', 'hand_kit', 'thigh_sleek', 'shin_bio', 'foot_talon', 'weapons:scythe']},
  {name: 'Mule', kit: 'mech', scheme: 'mule', face: 'head_mule', parts: ['pelvis_heavy', 'torso_grunt', 'head_mule', 'back_ammo', 'shoulder_block', 'upperarm_heavy', 'forearm_cuff', 'hand_kit', 'thigh_heavy', 'shin_heavy', 'foot_tread', 'weapons:bazooka']},
  {name: 'Patrol', kit: 'mech', scheme: 'patrol', face: 'head_patrol', parts: ['pelvis_fauld', 'torso_grunt', 'head_patrol', 'back_thrusters', 'shoulder_round', 'upperarm_sleek', 'forearm_gauntlet', 'hand_kit', 'thigh_sleek', 'shin_sleek', 'foot_heeled', 'weapons:beam_rifle']},
  {name: 'Lionheart', kit: 'mech', scheme: 'lionheart', face: 'torso_lion', parts: ['pelvis_heavy', 'torso_lion', 'head_titanheart', 'back_wings', 'shoulder_layered', 'upperarm_heavy', 'forearm_gauntlet', 'hand_kit', 'thigh_heavy', 'shin_super', 'foot_sabaton', 'weapons:war_hammer']},
  {name: 'Gorunda', kit: 'kaiju', scheme: 'gorunda', face: 'head_kaiju', back: 'plate_dorsal', parts: ['body_kaiju', 'neck_thick', 'head_kaiju', 'jaw_kaiju', 'arm_kaiju', 'forearm_kaiju', 'hand_claw', 'thigh_heavy', 'shin_heavy', 'foot_stomp', 'tail_heavy_1', 'tail_heavy_2', 'tail_heavy_3', 'tail_heavy_4']},
  {name: 'Brawlok', kit: 'kaiju', scheme: 'brawlok', face: 'head_ape', coat: 'tuft_fur', parts: ['body_ape', 'neck_beast', 'head_ape', 'jaw_ape', 'arm_ape', 'forearm_ape', 'hand_fist', 'thigh_ape', 'shin_ape', 'foot_paw', 'tail_stub_1', 'tail_stub_2']},
  {name: 'Rexhorn', kit: 'kaiju', scheme: 'rexhorn', face: 'head_rex', back: 'spike_row', parts: ['body_dino', 'neck_thick', 'head_rex', 'jaw_rex', 'arm_tiny', 'forearm_tiny', 'hand_tiny', 'thigh_digi', 'shin_digi', 'foot_bird', 'tail_thin_1', 'tail_thin_2', 'tail_thin_3', 'tail_thin_4']},
  {name: 'Fenrake', kit: 'kaiju', scheme: 'fenrake', face: 'head_wolf', coat: 'tuft_fur', parts: ['body_beast', 'neck_beast', 'head_wolf', 'jaw_wolf', 'arm_ape', 'forearm_ape', 'hand_claw', 'thigh_beast', 'shin_beast', 'foot_paw', 'tail_fur_1', 'tail_fur_2', 'tail_fur_3']},
  {name: 'Razorquill', kit: 'kaiju', scheme: 'razorquill', face: 'head_raptor', coat: 'tuft_feather', parts: ['body_raptor', 'neck_long', 'head_raptor', 'jaw_raptor', 'arm_raptor', 'forearm_raptor', 'hand_talon', 'thigh_light', 'shin_light', 'foot_sickle', 'tail_thin_1', 'tail_thin_2', 'tail_thin_3', 'tail_thin_4']},
  {name: 'Snapshell', kit: 'kaiju', scheme: 'snapshell', face: 'head_turtle', parts: ['body_shell', 'neck_thick', 'head_turtle', 'jaw_turtle', 'arm_kaiju', 'forearm_kaiju', 'hand_claw', 'thigh_short', 'shin_short', 'foot_splay', 'tail_stub_1', 'tail_stub_2']},
  {name: 'Sailspine', kit: 'kaiju', scheme: 'sailspine', face: 'head_spino', back: 'sail_panel', parts: ['body_sail', 'neck_long', 'head_spino', 'jaw_spino', 'arm_kaiju', 'forearm_kaiju', 'hand_claw', 'thigh_heavy', 'shin_heavy', 'foot_stomp', 'tail_croc_1', 'tail_croc_2', 'tail_croc_3', 'tail_croc_4']},
  {name: 'Marshjaw', kit: 'kaiju', scheme: 'marshjaw', face: 'head_croc', back: 'plate_dorsal', parts: ['body_croc', 'neck_thick', 'head_croc', 'jaw_croc', 'arm_kaiju', 'forearm_kaiju', 'hand_claw', 'thigh_short', 'shin_short', 'foot_splay', 'tail_croc_1', 'tail_croc_2', 'tail_croc_3', 'tail_croc_4']},
  {name: 'Infernoth', kit: 'kaiju', scheme: 'infernoth', face: 'head_kaiju_horned', back: 'crystal_cluster', parts: ['body_kaiju_slim', 'neck_thick', 'head_kaiju_horned', 'jaw_kaiju', 'arm_kaiju', 'forearm_kaiju', 'hand_claw', 'thigh_digi', 'shin_digi', 'foot_stomp', 'tail_heavy_1', 'tail_heavy_2', 'tail_heavy_3', 'tail_heavy_4']},
  {name: 'Night red', kit: 'dragon', scheme: 'night_red', face: 'head_dragon_horned', parts: ['hips_heavy', 'chest_dragon', 'neck_dragon', 'head_dragon_horned', 'jaw_dragon', 'horn_swept', 'wing_inner', 'wing_outer', 'arm_up_heavy', 'arm_lo_heavy', 'claw_hand', 'thigh_heavy', 'shin_digi', 'foot_lizard', 'tail_dragon', 'tip_spade', 'back_dragon_plates']},
  {name: 'Sleek white', kit: 'dragon', scheme: 'sleek_white', face: 'head_dragon', parts: ['hips_lean', 'chest_dragon', 'neck_dragon', 'head_dragon', 'jaw_dragon', 'horn_swept', 'wing_inner', 'wing_outer', 'arm_up_small', 'arm_lo_quad', 'lizard_hand', 'thigh_lean', 'shin_digi', 'foot_bird', 'tail_dragon', 'tip_blade']},
  {name: 'Bonewraith', kit: 'dragon', scheme: 'bonewraith', face: 'head_skull', parts: ['hips_bone', 'chest_bone', 'neck_bone', 'head_skull', 'jaw_skull', 'wing_inner_bone', 'wing_outer_torn', 'arm_up_quad', 'arm_lo_quad', 'claw_hand', 'thigh_quad', 'shin_quad', 'foot_lizard', 'tail_bone', 'tip_hook', 'back_bone_spines']},
  {name: 'Cogwyrm', kit: 'dragon', scheme: 'cogwyrm', face: 'head_engine', parts: ['hips_heavy', 'chest_engine', 'neck_engine', 'head_engine', 'jaw_engine', 'wing_inner_engine', 'wing_outer_engine', 'arm_up_heavy', 'arm_lo_heavy', 'claw_hand', 'thigh_heavy', 'shin_digi', 'foot_heavy', 'tail_engine', 'tip_blade', 'back_vents']},
  {name: 'Plumelord', kit: 'dragon', scheme: 'plumelord', face: 'head_feathered', parts: ['hips_lean', 'chest_dragon', 'neck_dragon', 'head_feathered', 'jaw_beak_dragon', 'crest_feather', 'wing_inner_feather', 'wing_outer_feather', 'fg_coverts', 'fg_secondaries', 'fg_primaries', 'arm_up_small', 'arm_lo_feather', 'lizard_hand', 'thigh_lean', 'shin_digi', 'foot_bird', 'tail_feather', 'tip_fan', 'back_feathers']},
  {name: 'Talonwing', kit: 'dragon', scheme: 'talonwing', face: 'head_wyvern', parts: ['hips_lean', 'chest_dragon', 'neck_dragon', 'head_wyvern', 'jaw_dragon', 'horn_swept', 'wing_inner', 'wing_outer', 'wing_thumb', 'thigh_heavy', 'shin_digi', 'foot_bird', 'tail_dragon', 'tip_spade']},
  {name: 'Tidecoil', kit: 'dragon', scheme: 'tidecoil', face: 'head_serpent', parts: ['hips_serpent', 'chest_serpent', 'neck_serpent', 'head_serpent', 'jaw_dragon', 'crest_fin', 'flipper', 'flipper_tip', 'tail_serpent', 'tip_fin']},
  {name: 'RAGNAVOX', kit: 'hydra', scheme: 'ragnavox', face: 'head_hydra_fire', heads: ['head_hydra_fire', 'head_hydra_storm', 'head_hydra_venom'], parts: ['hips_heavy', 'chest_hydra3', 'neck_hydra', 'jaw_hydra', 'horn_ragna', 'wing_inner', 'wing_outer', 'arm_up_quad', 'arm_lo_quad', 'lizard_hand', 'thigh_heavy', 'shin_digi', 'foot_heavy', 'tail_dragon']},
  {name: 'Pentarch', kit: 'hydra', scheme: 'pentarch', face: 'head_hydra', heads: ['head_hydra', 'head_hydra_fire', 'head_hydra_storm', 'head_hydra_venom', 'head_serpent_hydra'], parts: ['hips_quad', 'chest_hydra5', 'neck_hydra_scaled', 'jaw_hydra', 'arm_up_quad', 'arm_lo_quad', 'lizard_hand', 'thigh_quad', 'shin_quad', 'foot_lizard', 'tail_dragon']},
  {name: 'Shellmaw', kit: 'hydra', scheme: 'shellmaw', face: 'head_snapper', parts: ['hips_quad', 'chest_hydra_turtle', 'neck_snapper', 'head_snapper', 'jaw_beak_snapper', 'back_shell', 'arm_up_quad', 'arm_lo_quad', 'lizard_hand', 'thigh_quad', 'shin_quad', 'foot_heavy', 'tail_bone']},
  {name: 'Bone hydra', kit: 'hydra', scheme: 'bonehydra', face: 'head_skull', parts: ['hips_bone', 'chest_hydra_bone', 'neck_bone', 'head_skull', 'jaw_skull', 'arm_up_quad', 'arm_lo_quad', 'lizard_hand', 'thigh_quad', 'shin_quad', 'foot_lizard', 'tail_bone', 'back_bone_spines']},
  {name: 'Coilthrone', kit: 'hydra', scheme: 'coilthrone', face: 'head_serpent_hydra', parts: ['hips_serpent', 'chest_hydra_serpent', 'neck_serpent', 'head_serpent_hydra', 'tail_serpent', 'tip_fin']},
  {name: 'Oak shepherd', kit: 'tree', scheme: 'oak', face: 'face_kind', coat: 'leaf_cluster', back: 'moss_patch', parts: ['trunk_oak', 'face_kind', 'crown_oak', 'arm_branch', 'forearm_branch', 'hand_twig', 'leg_root', 'shin_root', 'foot_roots']},
  {name: 'Willow shepherd', kit: 'tree', scheme: 'willow', face: 'face_bearded', coat: 'hanging_moss', parts: ['trunk_slim', 'face_bearded', 'crown_willow', 'arm_twisted', 'forearm_twisted', 'hand_claw', 'leg_root', 'shin_root', 'foot_roots']},
  {name: 'Cherry shepherd', kit: 'tree', scheme: 'cherry', face: 'crown_blossom', coat: 'blossom_cluster', parts: ['trunk_slim', 'face_kind', 'crown_blossom', 'arm_branch', 'forearm_branch', 'hand_twig', 'leg_root', 'shin_root', 'foot_roots']},
  {name: 'Ghost tree', kit: 'tree', scheme: 'ghost', face: 'face_ghost', parts: ['trunk_twisted', 'face_ghost', 'crown_dead', 'arm_twisted', 'forearm_twisted', 'hand_claw', 'leg_root', 'shin_root', 'foot_roots']},
  {name: 'Stoneroot', kit: 'tree', scheme: 'stoneroot', face: 'face_stone', coat: 'moss_patch', parts: ['trunk_stone', 'face_stone', 'crown_moss', 'arm_stone', 'forearm_stone', 'hand_stone', 'leg_stone', 'shin_stone', 'foot_stone']},
  {name: 'Mushroom shepherd', kit: 'tree', scheme: 'mushroom', face: 'crown_mushroom', coat: 'fungus_shelf', parts: ['trunk_stalk', 'face_kind', 'crown_mushroom', 'arm_stalk', 'forearm_stalk', 'hand_nub', 'leg_stalk', 'shin_stalk', 'foot_bulb']}];
(function () { const data = {}; for (const k of window.MF_KIT_DATA || []) data[k.kit] = k;
  const L = (kit, id) => id.includes(':') ? 'k2_' + id.replace(':', '_') : 'k2_' + kit + '_' + id;
  window.MF_KIT_STARTERS = window.MF_KIT_STARTERS.filter(st => data[st.kit] && data[st.kit].schemes[st.scheme]).map(st => { const sch = data[st.kit].schemes[st.scheme], base = data[st.kit].base;
    const sw = [...new Set(Object.keys(sch).slice(0, 6).map(m => sch[m] || base[m]))].slice(0, 4);
    return {...st, face: L(st.kit, st.face), ids: st.parts.map(id => L(st.kit, id)), heads: (st.heads || []).map(id => L(st.kit, id)), coat: st.coat && L(st.kit, st.coat), back: st.back && L(st.kit, st.back), swatch: sw, about: data[st.kit].title + ', ' + st.name + ' colours'}; }); })();
