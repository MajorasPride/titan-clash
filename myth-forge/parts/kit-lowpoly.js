// Mythic Forge — LOW-POLY specials (Nov 9 2026, test page). Original, made in code (ours).
// 🟩 Blocky slimes (a voxel / block-game feel: see-through cube goo, a cube core inside, square eyes + mouth, little cube drips)
// 🎐 Low-poly jellyfish: faceted bell in colour bands + flat faceted ribbon tentacles (colour patterns via 🔢 paint by number).
// Every piece is numbered, colours are 'col:#hex[:flags]' (g = glow, c = see-through, s = shiny). `facet: true` = always shown with flat facets.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const X = window.makeKit(T, K), {at, merge, plug, P, V3} = X, out = [];
  const box = (w, h, d, x = 0, y = 0, z = 0) => new T.BoxGeometry(w, h, d).translate(x, y, z);
  const add = (id, group, sub, name, ex, make) => out.push({id, group, sub, name, facet: true, tags: ['kit', 'low poly', ...(ex.tags || [])], ...ex, make});
  // ================= 🟩 BLOCKY SLIMES =================
  const SL = {green: ['#6adf4a', '#3a9a2a', '#1a3a12'], magma: ['#3a1a14', '#ff7a1a', '#ffd040'], blue: ['#5ab0ff', '#2a5ad0', '#0a1a3a'], purple: ['#b07aff', '#6a2ad0', '#1a0a3a'], pink: ['#ff8ac8', '#d03a8a', '#3a0a1a']};
  const slime = (col, o = {}) => { const [goo, core, dark] = col, s = o.s || 1, pcs = [];
    pcs.push(P(box(3.2 * s, 3.2 * s, 3.2 * s, 0, 1.6 * s, 0), 'col:' + goo + ':c', 1));                                  // 1 outer goo (see-through)
    pcs.push(P(box(1.9 * s, 1.9 * s, 1.9 * s, 0, 1.45 * s, 0), 'col:' + core, 2));                                      // 2 inner core cube
    pcs.push(P(merge([box(.55 * s, .55 * s, .12 * s, -.7 * s, 2.15 * s, 1.62 * s), box(.55 * s, .55 * s, .12 * s, .7 * s, 2.15 * s, 1.62 * s)]), 'col:' + dark, 3));   // 3 square eyes
    pcs.push(P(merge([box(.22 * s, .22 * s, .1 * s, -.55 * s, 2.0 * s, 1.68 * s), box(.22 * s, .22 * s, .1 * s, .85 * s, 2.0 * s, 1.68 * s)]), 'col:#ffffff:g', 4));   // 4 eye shine
    pcs.push(P(merge([box(.9 * s, .28 * s, .12 * s, 0, 1.2 * s, 1.62 * s), box(.2 * s, .2 * s, .1 * s, .3 * s, 1.0 * s, 1.62 * s)]), 'col:' + dark, 5));                 // 5 mouth
    if (o.drips !== false) pcs.push(P(merge([box(.4 * s, .4 * s, .4 * s, 1.3 * s, .2 * s, 1.3 * s), box(.3 * s, .3 * s, .3 * s, -1.4 * s, .15 * s, .9 * s), box(.5 * s, .25 * s, .5 * s, -1.0 * s, .12 * s, -1.4 * s), box(.25 * s, .5 * s, .25 * s, 1.6 * s, 2.6 * s, -.4 * s)]), 'col:' + goo + ':c', 6));   // 6 drips
    return pcs; };
  const slimePlugs = [plug('face1', 'face', [0, 2.0, 1.62], [0, 0, 1], 'out', {s: .7, back: [0, -1, 0], opt: 1}), plug('in1', 'inside', [0, 1.5, 0], [0, 1, .01], 'out', {s: .55}), plug('in2', 'inside', [.6, 1.0, -.5], [1, 0, -1], 'out', {s: .45, opt: 1}), plug('top', 'back', [0, 3.2, 0], [0, 1, 0], 'out', {s: .6})];
  const SN = ['Goo', 'Core', 'Eyes', 'Eye shine', 'Mouth', 'Drips'];
  const pat = Object.fromEntries(Object.entries(SL).map(([k, [g, c, d]]) => [k[0].toUpperCase() + k.slice(1), {1: g + ':c', 2: c, 3: d, 5: d, 6: g + ':c'}]));
  for (const [k, c] of Object.entries(SL)) add('kv_slime_' + k, 'Torsos & Bellies', '🟩 Blocky slimes', 'Blocky slime (' + k + ')', {fitKind: 'torso', ownSize: 1, plugs: slimePlugs, pbnNames: SN, patterns: pat, tags: ['slime', 'ooze', 'blob', 'cube', 'voxel', 'block']}, () => slime(c));
  // magma-style stack: slabs with gaps that glow (block-game feel, original)
  add('kv_slime_stack', 'Torsos & Bellies', '🟩 Blocky slimes', 'Stacked lava slime', {fitKind: 'torso', ownSize: 1, plugs: slimePlugs, pbnNames: ['Slabs', 'Glowing core', 'Eyes'], tags: ['slime', 'lava', 'magma', 'cube', 'voxel']}, () => [
    P(merge([0, 1, 2, 3].map(i => box(3, .55, 3, 0, .35 + i * .78, 0))), 'col:#3a1a14', 1), P(box(2.4, 2.9, 2.4, 0, 1.55, 0), 'col:#ff7a1a:g', 2), P(merge([box(.5, .35, .1, -.7, 2.25, 1.52), box(.5, .35, .1, .7, 2.25, 1.52)]), 'col:#ffd040:g', 3)]);
  add('kv_slime_eye', 'Eyes & Faces', '🟩 Blocky slimes', 'Square slime eye', {plugAs: 'face', tags: ['slime', 'eye', 'cube']}, () => [P(box(.55, .12, .55, 0, .06, 0), 'col:#1a3a12', 1), P(box(.22, .08, .22, -.12, .14, .12), 'col:#ffffff:g', 2)]);
  add('kv_slime_mini', 'Accessories & Magic', '🟩 Blocky slimes', 'Mini slime cube (split-off)', {plugAs: 'inside', tags: ['slime', 'cube', 'mini']}, () => slime(SL.green, {s: .28, drips: false}));
  add('kv_cube_drip', 'Accessories & Magic', '🟩 Blocky slimes', 'Cube drips', {tags: ['slime', 'drip', 'cube']}, () => [P(merge([box(.4, .4, .4, 0, .2, 0), box(.25, .25, .25, .5, .12, .3), box(.3, .6, .3, -.4, .3, -.2)]), 'col:#6adf4a:c', 1)]);
  // ================= 🎐 LOW-POLY JELLYFISH (like faceted polygon-art jellyfish) =================
  // bell: few sides, colour bands top -> rim (1-5), inner glow (6). Tentacles: flat ribbons with a zig-zag, colour bands (1-3)
  function lpBell(R = 3.2, H = 3.4, sides = 9, rings = 5) { const pcs = [], ring = i => { const a = (i / rings) * Math.PI / 2; return {r: R * Math.sin(a) * (1 + .05 * Math.sin(i * 2.1)), y: H * Math.cos(a)}; };
    for (let i = 0; i < rings; i++) { const A = ring(i), B = ring(i + 1), pos = [];
      for (let j = 0; j < sides; j++) { const a0 = (j + (i % 2) * .5) / sides * Math.PI * 2, a1 = (j + 1 + (i % 2) * .5) / sides * Math.PI * 2, b0 = (j + ((i + 1) % 2) * .5) / sides * Math.PI * 2, b1 = (j + 1 + ((i + 1) % 2) * .5) / sides * Math.PI * 2;
        const p = (r, y, a) => [r * Math.sin(a), y, r * Math.cos(a)], a0p = p(A.r, A.y, a0), a1p = p(A.r, A.y, a1), b0p = p(B.r, B.y, b0), b1p = p(B.r, B.y, b1);
        pos.push(...a0p, ...b0p, ...a1p, ...a1p, ...b0p, ...b1p); }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); pcs.push(P(g, 'col:#888', i + 1)); }
    const inner = new T.IcosahedronGeometry(1, 0).scale(R * .55, H * .45, R * .55).translate(0, H * .32, 0); pcs.push(P(inner, 'col:#888', 6)); return pcs; }
  function ribbon(L = 6, W = .5, zig = .35, seg = 7, twist = .6) { const pts = []; for (let i = 0; i <= seg; i++) { const t = i / seg, w = W * (1 - t * .85), x = (i % 2 ? zig : -zig) * (1 - t * .3), a = t * twist;
      pts.push([x - Math.cos(a) * w, -t * L, -Math.sin(a) * w], [x + Math.cos(a) * w, -t * L, Math.sin(a) * w]); }
    const bands = [[], [], []]; for (let i = 0; i < seg; i++) { const b = Math.min(2, Math.floor(i / seg * 3)), a = pts[i * 2], c = pts[i * 2 + 1], d = pts[i * 2 + 2], e = pts[i * 2 + 3]; bands[b].push(...a, ...d, ...c, ...c, ...d, ...e); }
    return bands.map((pos, i) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.rotateX(Math.PI); g.computeVertexNormals(); return P(g, 'col:#888', i + 1); }); }
  const JP = {'Neon sunset': {1: '#3ae0d0:g', 2: '#5ab0ff:g', 3: '#a05aff:g', 4: '#e03ab0:g', 5: '#ff3a7a:g', 6: '#ff7ad0:g'}, 'Lavender': {1: '#5a3ad0', 2: '#8a5ae0', 3: '#b48af0', 4: '#d8b0f8', 5: '#c04ab0', 6: '#f0d0f8:c'},
    'Deep blue': {1: '#3ae0ff:g', 2: '#2a8af0', 3: '#1a4ad0', 4: '#10208a', 5: '#c04ae0', 6: '#3ae0ff:g'}, 'Teal glass': {1: '#4ab0a0:c', 2: '#3a90a0:c', 3: '#2a6a8a:c', 4: '#1a4a6a:c', 5: '#14304a:c', 6: '#80e0d0:g'}};
  const TP = {'Neon sunset': {1: '#e03ab0:g', 2: '#ff5a5a:g', 3: '#ffb03a:g'}, 'Lavender': {1: '#e8b8f0', 2: '#f0c8f0', 3: '#fae0fa'}, 'Deep blue': {1: '#2a5ae0', 2: '#1a3ab0', 3: '#c04ae0'}, 'Teal glass': {1: '#2a6a8a:c', 2: '#3a8aa0:c', 3: '#4ab0a0:c'}};
  const withPat = (pcs, p) => pcs.map(pc => ({...pc, mat: 'col:' + (p[pc.num] || '#888888')}));
  add('kj_bell_lp', 'Torsos & Bellies', '🎐 Jellyfish', 'Low-poly jellyfish bell', {fitKind: 'torso', ownSize: 1, pbnNames: ['Top', 'Band 2', 'Band 3', 'Band 4', 'Rim', 'Inside glow'], patterns: JP,
    plugs: [...[...Array(6).keys()].map(i => plug('spot' + (i + 1), 'glow', [Math.sin(i) * 2, 2.6, Math.cos(i) * 2], [Math.sin(i), .8, Math.cos(i)], 'out', {s: .4})), plug('in1', 'inside', [0, 1.2, 0], [0, -1, .01], 'out', {s: .6})], tags: ['jellyfish', 'bell', 'polygon']}, () => withPat(lpBell(), JP['Neon sunset']));
  add('kj_ribbon_lp', 'Tentacles & Extra Limbs', '🎐 Jellyfish', 'Low-poly ribbon tentacle', {pbnNames: ['Top', 'Middle', 'Tip'], patterns: TP, tags: ['jellyfish', 'tentacle', 'ribbon', 'polygon']}, () => withPat(ribbon(6, .45, .3, 7, 1.2), TP['Neon sunset']));
  add('kj_oral_lp', 'Tentacles & Extra Limbs', '🎐 Jellyfish', 'Low-poly oral arm (wide ribbon)', {pbnNames: ['Top', 'Middle', 'Tip'], patterns: TP, tags: ['jellyfish', 'oral arm', 'ribbon', 'polygon']}, () => withPat(ribbon(5, .8, .45, 6, 2.2), TP['Lavender']));
  add('kj_thread_lp', 'Tentacles & Extra Limbs', '🎐 Jellyfish', 'Low-poly thread tentacle', {pbnNames: ['Top', 'Middle', 'Tip'], patterns: TP, tags: ['jellyfish', 'thread', 'polygon']}, () => withPat(ribbon(7, .1, .2, 9, .3), TP['Neon sunset']));
  return out;
});
