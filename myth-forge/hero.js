// Mythic Forge HERO CREATOR — our own character creator in the spirit of big RPG creators (body + face sliders, races, hair, outfits).
// Everything here is made in code for Mythic Forge (ours, no license). Each hero piece is a slider "maker" part, so the normal
// Move / Sculpt / Paint / Export tools keep working on a hero. forge-core.js (section "hero creator") builds a hero from P.hero.
(function () {
  // ------------------------------------------------------------------ options + presets (data the UI reads)
  const H = window.FORGE_HERO = {};
  H.RACES = [['human', 'Human'], ['elf', 'Elf'], ['beast', 'Beastfolk'], ['orc', 'Orc'], ['mech', 'Mech']];
  H.SKIN = ['#f6d7c3', '#e8b896', '#d29a72', '#a8714c', '#7a4c30', '#4e3020', '#9fb37a', '#7f9fb8', '#b8b2c8', '#d8d8d8'];
  H.FUR = ['#d9a35a', '#b07038', '#6e4a30', '#3a2c26', '#e8e0d0', '#9a9a9a', '#2a2a2e', '#c86a3a'];
  H.METAL = ['#e8ecf2', '#9aa4b2', '#3a3e46', '#c8a040', '#b04030', '#3060c0', '#2f7a4a', '#e0e0a0'];
  H.HAIR = ['#1a1412', '#3a2418', '#6a4024', '#a06a38', '#d8b070', '#e8dcc0', '#b03020', '#8a8a8a', '#f0f0f0', '#4060c0', '#7a3aa0', '#30a070'];
  H.CLOTH = ['#7a1e1e', '#1e3a7a', '#2e5a2e', '#5a3a1e', '#2a2a2e', '#e8e0d0', '#6a2a7a', '#c08a30', '#3a6a7a', '#8a8a8a'];
  H.EYES = [['eyebrown', 'Brown'], ['eyeblue', 'Blue'], ['eyegreen', 'Green'], ['eyegrey', 'Grey'], ['gold', 'Gold'], ['gemred', 'Red'], ['amethyst', 'Violet'], ['glowblue', 'Glowing']];
  H.HAIRSTYLES = [['short', 'Short'], ['buzz', 'Buzz cut'], ['swept', 'Swept back'], ['long', 'Long'], ['ponytail', 'Ponytail'], ['topknot', 'Top knot'], ['braids', 'Braids'],
    ['mohawk', 'Mohawk'], ['spiky', 'Spiky'], ['mane', 'Wild mane'], ['bald', 'Bald']];
  H.BEARDS = [['none', 'None'], ['stubble', 'Stubble'], ['goatee', 'Goatee'], ['full', 'Full beard'], ['braided', 'Braided beard']];
  H.EARS = [['auto', 'Match race'], ['human', 'Round'], ['elf', 'Pointed'], ['beast', 'Beast'], ['none', 'None']];
  H.TOPS = [['none', 'None'], ['tunic', 'Tunic'], ['vest', 'Leather vest'], ['plate', 'Plate armor'], ['robe', 'Long robe'], ['suit', 'Pilot suit']];
  H.LEGS = [['none', 'None'], ['pants', 'Pants'], ['greaves', 'Armored legs'], ['suit', 'Pilot suit']];
  H.FEET = [['none', 'Barefoot'], ['boots', 'Boots'], ['sabatons', 'Armored boots']];
  H.EXTRAS = [['cloak', 'Cloak'], ['hood', 'Hood'], ['pauldrons', 'Shoulder armor'], ['bracers', 'Bracers'], ['belt', 'Belt'], ['scarf', 'Scarf']];
  // slider defs: [key, label, min, max, default]
  H.BODY = [['height', 'Height', .7, 1.35, 1], ['bulk', 'Width', .75, 1.45, 1], ['muscle', 'Muscle', 0, 1, .4], ['weight', 'Weight', 0, 1, .3], ['frame', 'Frame (broad ↔ curvy)', 0, 1, 0],
    ['arms', 'Arm length', .8, 1.25, 1], ['legs', 'Leg length', .8, 1.25, 1], ['neck', 'Neck length', .4, 1.6, .7], ['head', 'Head size', .8, 1.25, 1]];
  H.FACE = [['hw', 'Head width', .82, 1.12, .95], ['hh', 'Head height', .95, 1.25, 1.08], ['jaw', 'Jaw width', .55, 1.05, .78], ['chin', 'Chin', 0, 1, .4], ['cheek', 'Cheekbones', 0, 1, .4],
    ['brow', 'Brow', 0, 1, .35], ['nose', 'Nose length', 0, 1, .45], ['noseW', 'Nose width', 0, 1, .4], ['eyeSize', 'Eye size', .6, 1.5, 1], ['eyeSpace', 'Eye spacing', 0, 1, .5],
    ['eyeTilt', 'Eye tilt', -1, 1, 0], ['lips', 'Lips', 0, 1, .4], ['muzzle', 'Muzzle (beast)', 0, 1, .6], ['tusks', 'Tusks (orc)', 0, 1, .5]];
  H.defaults = () => ({race: 'human', skin: H.SKIN[1], hairCol: H.HAIR[1], eye: 'eyebrown', hair: 'short', beard: 'none', ears: 'auto',
    top: 'tunic', legsOut: 'pants', feet: 'boots', extras: ['belt'], col1: H.CLOTH[1], col2: H.CLOTH[3], metal: H.METAL[1],
    ...Object.fromEntries(H.BODY.map(s => [s[0], s[4]])), ...Object.fromEntries(H.FACE.map(s => [s[0], s[4]]))});
  H.PRESETS = [
    ['Knight', {race: 'human', skin: H.SKIN[1], hair: 'short', hairCol: H.HAIR[2], beard: 'stubble', top: 'plate', legsOut: 'greaves', feet: 'sabatons', extras: ['cloak', 'pauldrons', 'belt'], col1: H.CLOTH[0], col2: H.CLOTH[4], metal: H.METAL[1], muscle: .65, bulk: 1.1, jaw: .9, brow: .55}],
    ['Ranger', {race: 'elf', skin: H.SKIN[0], hair: 'long', hairCol: H.HAIR[4], top: 'vest', legsOut: 'pants', feet: 'boots', extras: ['hood', 'bracers', 'belt'], col1: H.CLOTH[2], col2: H.CLOTH[3], muscle: .35, bulk: .9, frame: .7, jaw: .62, cheek: .7, eye: 'eyegreen'}],
    ['Mage', {race: 'human', skin: H.SKIN[3], hair: 'swept', hairCol: H.HAIR[8], beard: 'full', top: 'robe', legsOut: 'pants', feet: 'boots', extras: ['hood', 'scarf'], col1: H.CLOTH[6], col2: H.CLOTH[7], muscle: .15, weight: .35, eye: 'glowblue', height: 1.05}],
    ['Beast Warrior', {race: 'beast', skin: H.FUR[0], hair: 'mane', hairCol: H.HAIR[3], top: 'vest', legsOut: 'pants', feet: 'none', extras: ['bracers', 'belt', 'pauldrons'], col1: H.CLOTH[3], col2: H.CLOTH[4], muscle: .85, bulk: 1.3, height: 1.15, eye: 'gold', muzzle: .75}],
    ['Orc Brute', {race: 'orc', skin: H.SKIN[6], hair: 'mohawk', hairCol: H.HAIR[0], top: 'none', legsOut: 'greaves', feet: 'boots', extras: ['belt', 'bracers', 'pauldrons'], col1: H.CLOTH[4], col2: H.CLOTH[3], muscle: 1, bulk: 1.4, weight: .55, jaw: 1.05, brow: .9, tusks: .8, eye: 'gemred'}],
    ['Pilot', {race: 'human', skin: H.SKIN[2], hair: 'ponytail', hairCol: H.HAIR[6], top: 'suit', legsOut: 'suit', feet: 'boots', extras: ['belt'], col1: H.CLOTH[9], col2: H.CLOTH[4], frame: .8, muscle: .3, bulk: .9, eye: 'eyeblue'}],
    ['Mech', {race: 'mech', skin: H.METAL[0], top: 'none', legsOut: 'none', feet: 'none', extras: ['pauldrons'], metal: H.METAL[5], col1: H.CLOTH[1], eye: 'glowblue', muscle: .6, bulk: 1.15, height: 1.1}],
  ];
  H.random = () => { const pick = a => a[Math.floor(Math.random() * a.length)], h = H.defaults(), r = Math.random;
    h.race = pick(H.RACES)[0]; h.skin = pick(h.race === 'beast' ? H.FUR : h.race === 'mech' ? H.METAL : h.race === 'orc' ? H.SKIN.slice(5) : H.SKIN.slice(0, 7));
    h.hair = pick(H.HAIRSTYLES)[0]; h.hairCol = pick(H.HAIR); h.eye = pick(H.EYES)[0]; h.beard = r() < .35 ? pick(H.BEARDS)[0] : 'none';
    h.top = pick(H.TOPS)[0]; h.legsOut = pick(H.LEGS.slice(0, 3))[0]; h.feet = pick(H.FEET)[0]; h.extras = H.EXTRAS.filter(() => r() < .35).map(e => e[0]);
    h.col1 = pick(H.CLOTH); h.col2 = pick(H.CLOTH); h.metal = pick(H.METAL);
    for (const [k, , lo, hi] of [...H.BODY, ...H.FACE]) h[k] = +(lo + (hi - lo) * (.25 + r() * .5)).toFixed(2); h.frame = +r().toFixed(2); return h; };
})();

(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const V = K.V3, G = 'Hero Creator', src = 'Made in code for Mythic Forge (ours)';
  const P = (geo, mat) => ({geo, mat}), gauss = (x, y, z, cx, cy, cz, sx, sy, sz) => Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2 + ((z - cz) / sz) ** 2));
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const ell = (rx, ry, rz, x = 0, y = 0, z = 0, w = 24, h = 16) => { const g = new T.SphereGeometry(1, w, h); g.scale(rx, ry, rz); g.translate(x, y, z); return g; };
  const cone = (r, h, x, y, z, rx = 0, ry = 0, rz = 0, seg = 12) => { const g = new T.ConeGeometry(r, h, seg); g.translate(0, h / 2, 0); return K.at(g, x, y, z, rx, ry, rz); };
  const mech = p => p.race === 'mech', skinMat = p => mech(p) ? 'herometal' : p.race === 'beast' ? 'herofur' : 'heroskin';
  // ---------------------------------------------------------------- head shape shared by head, eyes and hair (unit head ~2 wide, attach point at the bottom)
  const HY = p => p.hh * .98;                                   // head centre height above the neck
  const ES = p => .26 + p.eyeSpace * .14;                      // eye x
  function shapeHead(g, p, grow = 0) { const a = g.attributes.position, v = new T.Vector3();
    for (let i = 0; i < a.count; i++) { v.fromBufferAttribute(a, i); let {x, y, z} = v; const lower = sstep(0, -.95, y);
      x *= p.hw * (1 + grow) * (1 - lower * (1 - p.jaw)); y *= p.hh * (1 + grow); z *= .98 * (1 + grow);
      if (z > 0) z += lower * p.chin * .22 * Math.max(0, z);
      z += p.cheek * .1 * (gauss(x, y, z, .55, -.05, .6, .25, .2, .3) + gauss(x, y, z, -.55, -.05, .6, .25, .2, .3));
      z += p.brow * .12 * gauss(x, y, z, 0, .28, .92, .55, .1, .25);
      if (!grow) z -= .1 * (gauss(x, y, z, ES(p), .12, .85, .14, .1, .2) + gauss(x, y, z, -ES(p), .12, .85, .14, .1, .2));
      a.setXYZ(i, x, y + HY(p), z); }
    g.computeVertexNormals(); return g; }
  // ---------------------------------------------------------------- body pieces
  const limbProfile = (r0, r1, bump, at, n = 30) => { const pts = [], cap = .16;
    for (let i = 0; i <= n; i++) { const y = -cap + (1 + 2 * cap) * i / n, k = Math.min(1, Math.max(0, y)), out = y < 0 ? -y / cap : y > 1 ? (y - 1) / cap : 0;
      const r = (r0 + (r1 - r0) * k) * (1 + bump * Math.exp(-(((k - at) / .22) ** 2))); pts.push([Math.max(.001, r * Math.sqrt(Math.max(0, 1 - out * out))), y]); } return pts; };
  const SEGS = {upper: [.5, .38, .55, .35], fore: [.44, .3, .45, .25], thigh: [.5, .38, .4, .3], shin: [.42, .3, .45, .25], neck: [.42, .4, .1, .5]};
  const segGeo = (p, kind, grow = 0) => { const [r0, r1, mb, at] = SEGS[kind], m = p.muscle * mb + p.weight * .18, rad = mech(p) ? 8 : 22;
    const g = K.lathe(limbProfile(r0 * (1 + grow) * (1 + p.weight * .15), r1 * (1 + grow), m, at), rad); if (kind === 'upper' || kind === 'thigh') g.scale(1, 1, .92); g.computeVertexNormals(); return g; };
  function torsoGeo(p, grow = 0) {                             // y 0 = hips, 1 = base of the neck; width ~2
    const f = p.frame, w = p.weight, pts = [[.001, -.06], [.62 + f * .1 + w * .1, -.02], [.8 + f * .14 + w * .1, .1], [.74 + f * .04 + w * .18, .28], [.64 - f * .08 + w * .26, .42],
      [.74 - f * .02 + w * .16, .58], [.9 - f * .06 + p.muscle * .06 + w * .08, .76], [.97 - f * .12 + p.muscle * .06, .88], [.62, .99], [.3, 1.03], [.001, 1.05]];
    const g = K.lathe(pts.map(([r, y]) => [r * (1 + grow), y]), mech(p) ? 8 : 40, ), a = g.attributes.position; g.scale(1, 1, .62 + w * .12);
    if (!mech(p)) { const chest = p.muscle * .1 + f * .12, abs = p.muscle > .45 && w < .5 ? (p.muscle - .45) * .06 : 0;   // chest, abs and belly pushed out of the body itself (clothes follow)
      for (let i = 0; i < a.count; i++) { const x = a.getX(i), y = a.getY(i), z = a.getZ(i); if (z <= 0) continue; const k = z / (Math.abs(x) + z + .001);
        let d = chest * (gauss(x, y, 0, .34, .72 - f * .04, 0, .26, .13, 1) + gauss(x, y, 0, -.34, .72 - f * .04, 0, .26, .13, 1)) + w * .22 * gauss(x, y, 0, 0, .38, 0, .4, .2, 1);
        if (abs) d += abs * gauss(x, y, 0, 0, .42, 0, .22, .16, 1) * (.6 + .4 * Math.cos(y * 48)) * (Math.abs(x) < .2 ? 1 : 0);
        a.setZ(i, z + d * k); } }
    g.computeVertexNormals(); return g; }
  function torsoMuscles(p) { const out = [], m = p.muscle, f = p.frame;
    if (mech(p)) { out.push(P(K.at(new T.BoxGeometry(1.1, .32, .3), 0, .74, .52), 'herometal'), P(ell(.22, .22, .08, 0, .62, .6), 'glowblue')); return out; }
    return out; }
  function handGeo(p) { const out = [], mt = skinMat(p), palm = ell(.46, .42, .2, 0, .36, 0, 16, 12); out.push(P(palm, mt));
    const fingers = [[-.3, .95], [-.1, 1.05], [.1, 1], [.29, .88]];
    for (const [x, l] of fingers) { const c = K.bez(V(x, .66, 0), V(x * 1.05, .66 + l * .3, .06), V(x * 1.1, .66 + l * .55, .2)); out.push(P(mech(p) ? K.at(new T.BoxGeometry(.13, l * .58, .14), x, .66 + l * .29, .06) : K.taper(c, .085, .065, 10, 8), mt));
      if (p.race === 'beast' || p.race === 'orc') out.push(P(cone(.05, .16, x * 1.1, .66 + l * .55, .2, 1.2), 'horn')); }
    out.push(P(K.taper(K.bez(V(.4, .25, .05), V(.62, .45, .15), V(.6, .7, .3)), .1, .07, 10, 8), mt)); return out; }
  const footGeo = (p, grow = 0) => [P(ell(.42 * (1 + grow), .62 * (1 + grow), .3 * (1 + grow), 0, .45, -.04), skinMat(p))];
  // ---------------------------------------------------------------- head
  function headParts(p) { const out = [], mt = skinMat(p), race = p.race;
    if (mech(p)) { const helm = ell(.92 * p.hw, .95 * p.hh, .95, 0, HY(p), 0, 8, 6); helm.computeVertexNormals(); out.push(P(helm, 'herometal'), P(K.at(new T.BoxGeometry(1.5 * p.hw, .5, .5), 0, HY(p) - .45, .55), 'herometal'));
      out.push(P(cone(.07, .9, .5 * p.hw, HY(p) + .55, -.2, 0, 0, -.35), 'herometal'), P(K.at(new T.TorusGeometry(.42, .06, 8, 24), 0, HY(p) - .1, -.6, 0, 0, 0), 'herometal')); return out; }
    out.push(P(shapeHead(new T.SphereGeometry(1, 64, 48), p), mt));
    const nl = .18 + p.nose * .3, nw = .1 + p.noseW * .1, ntop = V(0, HY(p) + .2, .9), ntip = V(0, HY(p) - .12, .92 + nl);
    if (race === 'beast') { const mz = .35 + p.muzzle * .45; out.push(P(ell(.42 * p.hw, .3, mz, 0, HY(p) - .3, .7 + mz * .4), mt), P(ell(.13, .09, .1, 0, HY(p) - .16, .72 + mz * 1.38), 'obsidian'),
      P(ell(.36 * p.hw, .14, mz * .8, 0, HY(p) - .55, .66 + mz * .3), mt)); }
    else { out.push(P(K.taper(K.bez(ntop, V(0, HY(p) + .02, .98 + nl * .6), ntip), nw * .7, nw * 1.25, 12, 10, .8), mt), P(ell(nw * 1.4, nw * .9, nw, 0, ntip.y - .02, ntip.z - .06), mt));
      const lw = .2 + p.jaw * .08, ly = HY(p) - .5 - p.chin * .04; out.push(P(ell(lw, .045 + p.lips * .04, .09, 0, ly + .06, .9 + p.chin * .08), 'herolip'), P(ell(lw * .9, .04 + p.lips * .05, .08, 0, ly - .04, .88 + p.chin * .08), 'herolip'));
      if (race === 'orc' && p.tusks > .05) for (const sx of [-1, 1]) out.push(P(cone(.07, .2 + p.tusks * .4, sx * lw * .8, ly - .06, .82, -.25, 0, sx * -.25), 'ivory')); }
    const ears = p.ears === 'auto' ? {human: 'human', elf: 'elf', beast: 'beast', orc: 'elf'}[race] : p.ears;
    for (const sx of [-1, 1]) { const ex = sx * p.hw * .98;
      if (ears === 'human') out.push(P(ell(.08, .26, .17, ex, HY(p) + .02, -.02), mt));
      if (ears === 'elf') { let e = K.taper(K.bez(V(0, 0, 0), V(.12, .25, -.12), V(.22, .62, -.38)), .16, .015, 14, 10, .45); e.rotateZ(-.2); if (sx < 0) e = K.mirrorX(e); e.translate(ex, HY(p) - .1, -.02); out.push(P(e, mt)); }
      if (ears === 'beast') out.push(P(cone(.24, .55, sx * .48 * p.hw, HY(p) + .72 * p.hh, -.1, -.15, 0, sx * -.35, 4), mt)); }
    return out; }
  function lidParts(p) { const out = [], r = .13 * p.eyeSize; if (mech(p)) return out;
    for (const sx of [-1, 1]) { const x = sx * ES(p), y = HY(p) + .12, z = .76, tilt = p.eyeTilt * .25 * sx;
      const lid = new T.SphereGeometry(r * 1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI * .4); K.at(lid, 0, 0, 0, -.25, 0, tilt); lid.translate(x, y, z); out.push(P(lid, skinMat(p))); }
    return out; }
  function browParts(p) { const out = []; if (mech(p)) return out;
    for (const sx of [-1, 1]) { const x = sx * ES(p), y = HY(p) + .12, z = .76, tilt = p.eyeTilt * .25 * sx;
      out.push(P(K.taper(K.bez(V(x - sx * .14, y + .18 + p.brow * .03, z + .12), V(x, y + .23 + p.brow * .04 - tilt * .2, z + .15), V(x + sx * .17, y + .16 - tilt * .3, z + .08)), .035, .02, 10, 6, .6), 'herohair')); }
    return out; }
  function eyeParts(p) { const out = [], r = .13 * p.eyeSize;
    if (mech(p)) { out.push(P(K.at(new T.BoxGeometry(1.25 * p.hw, .2, .2), 0, HY(p) + .08, .82), p.eye === 'eyebrown' ? 'glowblue' : p.eye)); return out; }
    for (const sx of [-1, 1]) { const x = sx * ES(p), y = HY(p) + .12, z = .76; const tilt = p.eyeTilt * .25 * sx;
      out.push(P(ell(r, r, r, x, y, z, 20, 14), 'eye'));
      const iris = new T.SphereGeometry(r * 1.004, 20, 10, 0, Math.PI * 2, 0, .62); iris.rotateX(Math.PI / 2); iris.translate(x, y, z); out.push(P(iris, p.eye));
      const pup = new T.SphereGeometry(r * 1.008, 16, 6, 0, Math.PI * 2, 0, p.race === 'beast' ? .2 : .26); if (p.race === 'beast') pup.scale(.5, 1.3, 1); pup.rotateX(Math.PI / 2); pup.translate(x, y, z); out.push(P(pup, 'obsidian'));
    }
    return out; }
  // ---------------------------------------------------------------- hair (tinted separately)
  function hairParts(p) { const out = [], hy = HY(p), mt = 'herohair', st = p.hair;
    const cap = (grow, theta = .5) => { const g = new T.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI * theta); g.rotateX(-.42); shapeHead(g, p, grow); K.noise(g, .02, 6); return g; };
    if (p.race === 'mech') return out; out.push(...browParts(p));
    if (st === 'buzz') out.push(P(cap(.03, .48), mt));
    else if (st !== 'bald' && st !== 'mane') out.push(P(cap(.08, .52), mt));
    if (st === 'swept') out.push(P(K.at(ell(.8 * p.hw, .35, .9), 0, hy + .55, -.15, -.3), mt));
    if (st === 'long') { const back = K.taper(K.cr([V(0, hy + .4, -.75), V(0, hy - .3, -1), V(0, hy - 1.3, -.95), V(0, hy - 2.1, -.7)]), .82 * p.hw, .5, 24, 18, .4); out.push(P(K.noise(back, .03, 5), mt));
      for (const sx of [-1, 1]) out.push(P(K.taper(K.cr([V(sx * .85 * p.hw, hy + .2, .1), V(sx * .95 * p.hw, hy - .6, 0), V(sx * .8 * p.hw, hy - 1.4, -.15)]), .2, .1, 14, 10, .6), mt)); }
    if (st === 'ponytail') { out.push(P(ell(.18, .18, .18, 0, hy + .35, -1.02), 'heroleather')); out.push(P(K.noise(K.taper(K.cr([V(0, hy + .35, -1.05), V(0, hy, -1.35), V(0, hy - .9, -1.3), V(0, hy - 1.6, -1.1)]), .26, .06, 24, 12), .02, 5), mt)); }
    if (st === 'topknot') out.push(P(ell(.34, .3, .34, 0, hy + p.hh * 1.02, -.25), mt), P(K.at(new T.TorusGeometry(.2, .05, 8, 20), 0, hy + p.hh * .85, -.22, Math.PI / 2), 'heroleather'));
    if (st === 'braids') for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) out.push(P(ell(.15, .17, .15, sx * .82 * p.hw, hy - .1 - i * .28, -.15), mt));
    if (st === 'mohawk') for (let i = 0; i < 9; i++) { const a = -.5 + i * .17; out.push(P(cone(.16, .5 + Math.sin(i / 8 * Math.PI) * .25, 0, hy + Math.cos(a) * p.hh * .98, Math.sin(a) * .98, a - .1, 0, 0, 6), mt)); }
    if (st === 'spiky') for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, el = .5 + (i % 3) * .25, dx = Math.cos(a) * Math.sin(el), dz = Math.sin(a) * Math.sin(el) - .25, dy = Math.cos(el);
      const g = cone(.17, .55, 0, 0, 0); g.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(V(0, 1, 0), V(dx, dy, dz).normalize()))); g.translate(dx * p.hw * .85, hy + dy * p.hh * .85, dz * .85); out.push(P(g, mt)); }
    if (st === 'mane') { const m = new T.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI * .8); m.rotateX(-1.2); m.scale(p.hw * 1.42, p.hh * 1.38, 1.15); m.translate(0, hy - .1, -.12); K.noise(m, .12, 3); out.push(P(m, mt)); }
    const lowerFace = (grow, top) => { const g = new T.SphereGeometry(1, 40, 20, 0, Math.PI * 2, Math.PI * top, Math.PI * (1 - top)); g.rotateX(.55); shapeHead(g, p, grow); K.noise(g, .02, 7); return g; };
    if (p.beard === 'stubble') out.push(P(lowerFace(.015, .62), mt));
    if (p.beard === 'full' || p.beard === 'braided') { out.push(P(lowerFace(.06, .6), mt)); out.push(P(K.noise(ell(.36 * p.jaw + .14, .36, .24, 0, hy - .8, .68), .04, 5), mt));
      if (p.beard === 'braided') out.push(P(K.taper(K.cr([V(0, hy - 1.2, .66), V(0, hy - 1.6, .7), V(0, hy - 1.9, .6)]), .12, .05, 12, 8), mt)); }
    if (p.beard === 'goatee') out.push(P(ell(.17, .26, .12, 0, hy - .78, .9 + p.chin * .1), mt));
    return out; }
  // ---------------------------------------------------------------- outfit pieces (their own parts so each takes its own color)
  const shell = p => mech(p) ? 0 : .12;
  function topParts(p) { const out = [], t = p.top, g = shell(p);
    if (t === 'tunic') { out.push(P(torsoGeo(p, .05), 'herocloth')); const sk = K.lathe([[.85 + p.frame * .12 + p.weight * .1, .12], [.95 + p.frame * .1, -.1], [1.02, -.32], [.98, -.34]], 32); sk.scale(1, 1, .7); out.push(P(sk, 'herocloth')); }
    if (t === 'vest') { const v = torsoGeo(p, .06); out.push(P(v, 'heroleather')); }
    if (t === 'suit') out.push(P(torsoGeo(p, .025), 'herocloth'), P(K.at(new T.TorusGeometry(.45, .03, 6, 32), 0, .98, 0, Math.PI / 2), 'herometal'), P(ell(.25, .3, .08, 0, .66, .64 + p.weight * .08), 'herometal'));
    if (t === 'plate') { out.push(P(torsoGeo(p, .1), 'herometal')); out.push(P(K.at(K.extr([[0, .5], [.55, .35], [.5, -.2], [0, -.45], [-.5, -.2], [-.55, .35]], .12, .05), 0, .62, .62 + p.weight * .1), 'herometal'));
      const sk = K.lathe([[.86 + p.frame * .1, .14], [1.02, -.12], [1.06, -.3]], 12); sk.scale(1, 1, .72); out.push(P(sk, 'herometal')); }
    if (t === 'robe') { out.push(P(torsoGeo(p, .06), 'herocloth')); const r = K.lathe([[.86 + p.frame * .1 + p.weight * .1, .15], [1.0, -.4], [1.25, -1.2], [1.5, -1.95], [1.48, -1.98]], 36); r.scale(1, 1, .8); out.push(P(r, 'herocloth')); }
    return out; }
  const sleeve = (kind, mat, grow) => p => [P(segGeo(p, kind, grow), mat)];
  function bootGeo(p, armored) { return [P(ell(.48, .7, .36, 0, .44, -.04), armored ? 'herometal' : 'heroleather'), P(K.lathe([[.5, -.05], [.56, .3], [.6, .32]], 18).translate(0, -.04, 0), armored ? 'herometal' : 'heroleather')]; }
  const cloak = p => { const s = new T.Shape(); s.moveTo(-1, 0); s.quadraticCurveTo(0, .15, 1, 0); s.lineTo(1.25, -2.6); s.quadraticCurveTo(0, -2.9, -1.25, -2.6); s.closePath();
    const g = new T.ExtrudeGeometry(s, {depth: .04, bevelEnabled: false, curveSegments: 12}); const a = g.attributes.position;
    for (let i = 0; i < a.count; i++) { const x = a.getX(i), y = a.getY(i); a.setZ(i, a.getZ(i) - .25 * x * x - .1 * Math.sin(x * 6) * (-y / 2.6) + y * .1); } g.computeVertexNormals(); g.translate(0, .98, -.62); return [P(g, 'herocloth')]; };
  const hood = p => { const g = new T.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI * .62); g.rotateX(-.75); shapeHead(g, p, .16); return [P(g, 'herocloth')]; };
  const paul = () => [P(K.at(new T.SphereGeometry(.55, 20, 12, 0, Math.PI * 2, 0, Math.PI * .5), 0, 0, 0, 0, 0, 0), 'herometal'), P(K.at(new T.SphereGeometry(.6, 20, 12, 0, Math.PI * 2, 0, Math.PI * .3), 0, -.12, 0), 'herometal')];
  const bracer = () => [P(K.lathe([[.5, .05], [.53, .45], [.47, .9]], 16), 'heroleather')];
  const belt = p => [P(K.at(new T.TorusGeometry(.78 + p.frame * .12 + p.weight * .14, .07, 8, 40), 0, .13, 0, Math.PI / 2).scale(1, 1, .7 + p.weight * .12), 'heroleather'), P(K.at(new T.BoxGeometry(.3, .22, .08), 0, .13, .58 + p.weight * .1), 'herometal')];
  const scarf = p => [P(K.at(new T.TorusGeometry(.45, .14, 10, 28), 0, .02, .05, Math.PI / 2 - .2), 'herocloth'), P(K.taper(K.cr([V(.2, 0, .4), V(.35, -.6, .55), V(.3, -1.2, .45)]), .12, .1, 14, 8, .4), 'herocloth')];
  const tail = p => [P(K.taper(K.cr([V(0, 0, 0), V(0, 2, -.4), V(0, 4, .3), V(0, 5.4, 1.2)]), .32, .12, 30, 12), skinMat(p)), P(K.noise(ell(.3, .55, .3, 0, 5.5, 1.3), .05, 4), 'herohair')];
  // ---------------------------------------------------------------- register (params = the whole hero; editor passes P.hero)
  const DEF = window.FORGE_HERO.defaults(), params = [{k: '_hero', label: 'Hero', options: ['yes'], def: 'yes'}];
  const mk = (id, name, fitKind, fn, more = {}) => ({id, group: G, sub: more.sub || 'Body', name, fitKind, params, hero: true, tags: ['hero'], src, along: more.along,
    makeP: p => fn({...DEF, ...p}), make: () => fn(DEF), ...more});
  return [
    mk('hero_torso', 'Hero torso', 'torso', p => [P(torsoGeo(p), skinMat(p)), ...torsoMuscles(p)]),
    mk('hero_upper', 'Hero upper arm', 'seg', p => [P(segGeo(p, 'upper'), skinMat(p))], {unitLen: 1}),
    mk('hero_fore', 'Hero forearm', 'seg', p => [P(segGeo(p, 'fore'), skinMat(p))], {unitLen: 1}),
    mk('hero_thigh', 'Hero thigh', 'seg', p => [P(segGeo(p, 'thigh'), skinMat(p))], {unitLen: 1}),
    mk('hero_shin', 'Hero shin', 'seg', p => [P(segGeo(p, 'shin'), skinMat(p))], {unitLen: 1}),
    mk('hero_neck', 'Hero neck', 'seg', p => [P(segGeo(p, 'neck'), skinMat(p))], {unitLen: 1}),
    mk('hero_hand', 'Hero hand', 'hand', handGeo),
    mk('hero_foot', 'Hero foot', 'hand', p => footGeo(p)),
    mk('hero_head', 'Hero head', 'head', p => [...headParts(p), ...lidParts(p)], {sub: 'Head'}),
    mk('hero_eyes', 'Hero eyes', null, eyeParts, {sub: 'Head'}),
    mk('hero_hair', 'Hero hair', null, hairParts, {sub: 'Head'}),
    mk('hero_tail', 'Hero tail', 'tail', tail),
    mk('hero_top', 'Hero top', 'torso', topParts, {sub: 'Outfit'}),
    mk('hero_sleeveU', 'Hero sleeve', 'seg', sleeve('upper', 'herocloth', .07), {sub: 'Outfit', unitLen: 1}),
    mk('hero_sleeveF', 'Hero sleeve (lower)', 'seg', sleeve('fore', 'herocloth', .07), {sub: 'Outfit', unitLen: 1}),
    mk('hero_pantsU', 'Hero pants', 'seg', p => [P(segGeo(p, 'thigh', .07), p.legsOut === 'greaves' ? 'herometal' : 'herocloth')], {sub: 'Outfit', unitLen: 1}),
    mk('hero_pantsL', 'Hero pants (lower)', 'seg', p => [P(segGeo(p, 'shin', .08), p.legsOut === 'greaves' ? 'herometal' : 'herocloth')], {sub: 'Outfit', unitLen: 1}),
    mk('hero_boot', 'Hero boot', 'hand', p => bootGeo(p, p.feet === 'sabatons'), {sub: 'Outfit'}),
    mk('hero_cloak', 'Hero cloak', null, cloak, {sub: 'Outfit'}),
    mk('hero_hood', 'Hero hood', null, hood, {sub: 'Outfit'}),
    mk('hero_paul', 'Hero shoulder armor', null, paul, {sub: 'Outfit'}),
    mk('hero_bracer', 'Hero bracer', null, bracer, {sub: 'Outfit'}),
    mk('hero_belt', 'Hero belt', null, belt, {sub: 'Outfit'}),
    mk('hero_scarf', 'Hero scarf', null, scarf, {sub: 'Outfit'}),
  ];
});
