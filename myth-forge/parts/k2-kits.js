// Mythic Forge — 2.0 kits in the parts library (T049, Nov 13 2026). Plain script, loaded after the parts/k2-<kit>.js data files.
// The six Blender kits (mech, kaiju, weapons, dragon, hydra, tree shepherd) show up in their own "New Kits" tab, next to the old parts, in every mode.
// Each kit part keeps what the kit file says about it:
//   - plugs: where the next part clicks in (hip, knee, neck, tail, back plates...). Body pieces keep the pose they were modelled in ('frame');
//     plates, coats, feathers, weapons and shields point along the plug ('out'). Left-side plugs mirror right-side parts.
//   - hitbox: box + capsule, already at Forge size (entry.hitbox), for the Titan Clash sandbox (T050).
//   - colours: one number per kit material (paint by number), and every kit colour scheme as a one-tap pattern.
// Size: kit units x 2.4 (a kit mech is about 4.6 tall, a Forge titan about 11).
(function () {
  const S = 2.4, GROUP = 'New Kits';
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
  window.MF_KITS = {scale: S, group: GROUP, kits: kits.map(k => ({kit: k.kit, title: k.title, ticket: k.ticket, parts: k.parts.length, schemes: Object.keys(k.schemes)})),
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
      out.push({id: 'k2_' + k.kit + '_' + p.id, group: GROUP, sub: k.title, name: p.name, about: p.about, tags: ['new kit', k.kit, SLOT_NAME[p.slot] || p.slot], facet: true, along: false,
        plugAs: p.slot === 'back' ? (BACK_AS[k.kit] || 'back') : AS[p.slot] !== undefined ? AS[p.slot] : null, plugs, sided: !!p.sided, kit: k.kit, kslot: p.slot, pbnNames: mats, patterns,
        hitbox: {box: {centre: sc(hb.box[0]), size: sc(hb.box[1])}, capsule: {axis: hb.cap[0], radius: +(hb.cap[1] * S).toFixed(3), length: +(hb.cap[2] * S).toFixed(3), centre: sc(hb.cap[3])}},
        src: '2.0 ' + k.title.toLowerCase() + ' (' + k.ticket + '): made in Blender for Titan Clash (ours)',
        make: () => p.m.map(([m, b64]) => ({geo: geoOf(b64), mat: 'col:' + (col({}, m) || '#8a8f98'), num: mats.indexOf(m) + 1}))});
    }
    return out;
  });
})();
