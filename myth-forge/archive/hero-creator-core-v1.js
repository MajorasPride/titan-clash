// ARCHIVED Nov 9 2026: Hero tab code from forge-core.js (removed at MajorasPride's request; an asset-based character creator comes later).
// Needs archive/hero-creator-v1.js (parts + options). Hook it back by pasting this above addPart() in forge-core.js, adding the 🧑 Hero tab + p-hero pane to page.html and calling heroUI() on tab switch.
// ====================================================================== hero creator (hero.js has the pieces + options)
// P.hero holds every choice. buildHero() puts a humanoid skeleton under it (tail for Beastfolk), shapes it with the body
// sliders, then rebuilds every hero_* part from scratch; other parts the user added (weapons etc.) stay where they are.
const HERO = window.FORGE_HERO, HERO_LIBS = id => id.startsWith('hero_');
function heroBones(h) { const src = JSON.parse(JSON.stringify(SKEL.slim.bones)), f = h.frame || 0;
  src.forEach(r => { const sc = r[4] === 'legU' || r[0] === 'hips' ? 1 + f * .14 : r[4] === 'armU' || r[4] === 'armF' || r[4] === 'hand' ? 1 - f * .12 : 1;
    if (/\.(L|R)$/.test(r[0]) && (r[4] === 'legU' || r[4] === 'legL' || r[4] === 'foot')) { r[2][0] *= 1 + f * .14; r[3][0] *= 1 + f * .14; }
    else if (/\.(L|R)$/.test(r[0])) { r[2][0] *= sc; r[3][0] *= sc; } });
  if (h.race === 'beast') { const pts = [[0, 5.5, -.5], [0, 4.6, -1.6], [0, 3.8, -2.8], [0, 3.4, -4.2]]; pts.slice(0, -1).forEach((hd, i) => src.push(['tail' + (i + 1), i ? 'tail' + i : 'hips', hd, pts[i + 1], 'tail'])); }
  return src; }
let heroBusy = false;
function buildHero(fresh) {
  const h = P.hero = {...HERO.defaults(), ...(P.hero || {})}; heroBusy = true;
  const keep = P.parts.filter(p => !HERO_LIBS(p.lib) && !p.lib.startsWith('base_'));
  P.parts = keep; Object.values(views).forEach(v => v.G.removeFromParent()); views = {};
  P.skel = 'slim'; P.bodyBase = heroBones(h); P.body = {height: h.height * (1 - (h.frame || 0) * .05), bulk: h.bulk, arms: h.arms, legs: h.legs, neck: h.neck, tail: 1, head: h.head};
  applyBody();
  const hp = {...h, extras: undefined, _hero: 'yes'}; delete hp.extras;
  const tintFor = {skin: h.race === 'mech' ? h.metal : h.skin, hair: h.hairCol, c1: h.col1, c2: h.col2, metal: h.metal};
  const put = (lib, bone, tint, f0) => { if (!boneRow(bone)) return null; const f = f0 || fitPart(lib, bone); if (!f) return null;
    const pt = newPart(lib, f.bone, f.p, f.r, f.s); pt.l = f.l; pt.fit = f.fit; pt.params = hp; pt.tint = tint || '#ffffff'; P.parts.push(pt);
    const tb = twinName(f.bone); if (tb && bones[tb]) { const t = newPart(lib, tb, [0, 0, 0], [0, 0, 0]); t.twin = pt.uid; pt.twin = t.uid; t.fit = {...f.fit, cover: f.fit.cover.map(c => twinName(c) || c)}; P.parts.push(t); mirrorInto(pt, t); }
    return pt; };
  const same = (lib, base, tint, grow = 1) => { const f = {...base, s: +(base.s * grow).toFixed(3), fit: {...base.fit, kind: 'decor'}}; return put(lib, base.bone, tint, f); };
  // body
  // skin pieces that clothes cover fully are left out (no skin poking through the cloth)
  const sleevesOn = h.top === 'tunic' || h.top === 'robe' || h.top === 'suit', pantsOn = h.legsOut !== 'none', topOn = h.top !== 'none';
  const torsoFit = fitPart('hero_torso', 'chest'), torso = topOn ? {...torsoFit, bone: torsoFit.bone} : put('hero_torso', 'chest', tintFor.skin); put('hero_neck', 'neck', tintFor.skin);
  for (const [lib, b, covered] of [['hero_upper', 'upperarm.L', sleevesOn], ['hero_fore', 'forearm.L', sleevesOn && h.top !== 'tunic'], ['hero_thigh', 'thigh.L', pantsOn], ['hero_shin', 'shin.L', pantsOn], ['hero_hand', 'hand.L']]) if (!covered) put(lib, b, tintFor.skin);
  if (h.feet === 'none') put('hero_foot', 'foot.L', tintFor.skin); else put('hero_boot', 'foot.L', tintFor.c2);
  if (h.race === 'beast') put('hero_tail', 'tail1', tintFor.skin);
  // head (eyes + hair share the head's fit so they line up exactly)
  const hf0 = fitPart('hero_head', 'head'); if (hf0) { hf0.s = +(hf0.s * 1.28).toFixed(3); hf0.p = [0, -.22 * hf0.s, .05 * hf0.s]; }
  const head = put('hero_head', 'head', tintFor.skin, hf0);
  if (head) { const hf = {bone: head.bone, p: head.p, r: head.r, s: head.s, l: 1, fit: {kind: 'decor', drop: head.bone, cover: [head.bone]}};
    put('hero_eyes', head.bone, '#ffffff', hf); if (h.race !== 'mech') put('hero_hair', head.bone, tintFor.hair, hf);
    if ((h.extras || []).includes('hood')) put('hero_hood', head.bone, tintFor.c1, hf); }
  // outfit
  if (torso && topOn) same('hero_top', torso, h.top === 'plate' ? tintFor.metal : h.top === 'vest' ? tintFor.c2 : tintFor.c1);
  if (sleevesOn) { put('hero_sleeveU', 'upperarm.L', tintFor.c1); if (h.top !== 'tunic') put('hero_sleeveF', 'forearm.L', tintFor.c1); }
  if (pantsOn) { const t = h.legsOut === 'greaves' ? tintFor.metal : h.legsOut === 'suit' ? tintFor.c1 : tintFor.c2; put('hero_pantsU', 'thigh.L', t); put('hero_pantsL', 'shin.L', t); }
  const ex = h.extras || [];
  if (torso && ex.includes('cloak')) same('hero_cloak', torso, tintFor.c1);
  if (torso && ex.includes('belt')) same('hero_belt', torso, tintFor.c2);
  if (torso && ex.includes('scarf')) { const nb = 'neck'; if (boneRow(nb)) put('hero_scarf', nb, tintFor.c1, {bone: nb, p: [0, 0, 0], r: [0, 0, 0], s: +(bodyInfo().W / 2.4).toFixed(3), l: 1, fit: {kind: 'decor', drop: nb, cover: [nb]}}); }
  if (ex.includes('pauldrons')) { const b = 'upperarm.L'; if (boneRow(b)) put('hero_paul', b, tintFor.metal, {bone: b, p: [0, .15, 0], r: [0, 0, -20], s: +(thickFor(bodyInfo(), 'armU') * 1.25).toFixed(3), l: 1, fit: {kind: 'decor', drop: b, cover: [b]}}); }
  if (ex.includes('bracers')) { const f = fitPart('hero_fore', 'forearm.L'); if (f) put('hero_bracer', 'forearm.L', tintFor.c2, {...f, s: +(f.s * 1.12).toFixed(3), l: +(f.l * .55).toFixed(3), p: [0, f.l * .4 * f.s, 0], fit: {...f.fit, kind: 'decor'}}); }
  P.name = P.name && P.name !== 'New creature' ? P.name : 'New hero';
  rebuildParts(); outliner(); saveCur(); heroBusy = false; if (fresh) frameAll(); }
let heroT = null; const heroSoon = () => { clearTimeout(heroT); heroT = setTimeout(() => buildHero(), 90); };
let heroSec = 'race';
function heroUI() { const el = $('heroBox'); if (!el) return; const h = P.hero = {...HERO.defaults(), ...(P.hero || {})}; el.innerHTML = '';
  const sec = document.createElement('div'); sec.className = 'chips';
  for (const [k, n] of [['race', 'Race'], ['body', 'Body'], ['face', 'Face'], ['hair', 'Hair'], ['outfit', 'Outfit'], ['colors', 'Colors'], ['presets', 'Presets']]) { const b = document.createElement('button'); b.textContent = n; b.className = heroSec === k ? 'on' : ''; b.onclick = () => { heroSec = k; heroUI(); const hd = P.parts.find(p => p.lib === 'hero_head'), v = hd && views[hd.uid];
    if ((k === 'face' || k === 'hair') && v) frameObj(v.G, 1.7); else if (k === 'body' || k === 'outfit' || k === 'presets') frameAll(); }; sec.append(b); }
  el.append(sec);
  const lbl = t => { const d = document.createElement('div'); d.className = 'lbl'; d.textContent = t; el.append(d); };
  const chips = (key, opts, multi) => { const row = document.createElement('div'); row.className = 'chips';
    for (const [v, n] of opts) { const b = document.createElement('button'); b.textContent = n; const on = multi ? (h[key] || []).includes(v) : h[key] === v; b.className = on ? 'on' : '';
      b.onclick = () => { snap(); if (multi) { const a = new Set(h[key] || []); a.has(v) ? a.delete(v) : a.add(v); h[key] = [...a]; } else h[key] = v; buildHero(); heroUI(); }; row.append(b); } el.append(row); };
  const sliders = list => { for (const [k, n, lo, hi] of list) { const row = document.createElement('div'); row.className = 'sl'; row.innerHTML = `<span>${n}</span><input type="range" min="${lo}" max="${hi}" step=".01" value="${h[k]}"><span>${(+h[k]).toFixed(2)}</span>`;
    const inp = row.querySelector('input'), val = row.lastChild; inp.onpointerdown = () => snap(); inp.oninput = () => { h[k] = +inp.value; val.textContent = (+inp.value).toFixed(2); heroSoon(); }; el.append(row); } };
  const swatches = (key, cols) => { const row = document.createElement('div'); row.className = 'chips';
    for (const c of cols) { const b = document.createElement('button'); b.style.cssText = `background:${c};min-width:38px;min-height:38px;border:${h[key] === c ? '3px solid #fff' : '1px solid #555'}`; b.onclick = () => { snap(); h[key] = c; buildHero(); heroUI(); }; row.append(b); }
    const pick = document.createElement('input'); pick.type = 'color'; pick.value = h[key]; pick.style.cssText = 'width:44px;height:38px;border:0;background:none'; pick.oninput = () => { h[key] = pick.value; heroSoon(); }; row.append(pick); el.append(row); };
  if (heroSec === 'race') { lbl('Race'); chips('race', HERO.RACES); lbl('Ears'); chips('ears', HERO.EARS);
    const d = document.createElement('div'); d.className = 'hint'; d.textContent = 'Beastfolk get fur, a muzzle and a tail. Orcs get tusks. Mech turns the body to armor with a visor. Pick a preset to start fast.'; el.append(d); }
  if (heroSec === 'body') sliders(HERO.BODY);
  if (heroSec === 'face') sliders(HERO.FACE.filter(s => (s[0] !== 'muzzle' || h.race === 'beast') && (s[0] !== 'tusks' || h.race === 'orc')));
  if (heroSec === 'hair') { lbl('Hair style'); chips('hair', HERO.HAIRSTYLES); lbl('Beard'); chips('beard', HERO.BEARDS); lbl('Hair color'); swatches('hairCol', HERO.HAIR); }
  if (heroSec === 'outfit') { lbl('Top'); chips('top', HERO.TOPS); lbl('Legs'); chips('legsOut', HERO.LEGS); lbl('Feet'); chips('feet', HERO.FEET); lbl('Extras (tap to add/remove)'); chips('extras', HERO.EXTRAS, true); }
  if (heroSec === 'colors') { lbl(h.race === 'beast' ? 'Fur' : h.race === 'mech' ? 'Body metal' : 'Skin'); swatches(h.race === 'mech' ? 'metal' : 'skin', h.race === 'beast' ? HERO.FUR : h.race === 'mech' ? HERO.METAL : HERO.SKIN);
    lbl('Eyes'); chips('eye', HERO.EYES); lbl('Outfit main color'); swatches('col1', HERO.CLOTH); lbl('Outfit second color'); swatches('col2', HERO.CLOTH); if (h.race !== 'mech') { lbl('Armor metal'); swatches('metal', HERO.METAL); } }
  if (heroSec === 'presets') { const row = document.createElement('div'); row.className = 'chips';
    for (const [n, o] of HERO.PRESETS) { const b = document.createElement('button'); b.textContent = n; b.onclick = () => { snap(); P.hero = {...HERO.defaults(), ...o}; buildHero(true); heroUI(); }; row.append(b); }
    const r = document.createElement('button'); r.textContent = '🎲 Random'; r.onclick = () => { snap(); P.hero = HERO.random(); buildHero(true); heroUI(); }; row.append(r); el.append(row);
    const d = document.createElement('div'); d.className = 'hint'; d.textContent = 'Every hero piece is a normal part: after making a hero you can still sculpt, paint, swap parts or add weapons. Changing a Hero slider rebuilds the hero pieces (your other parts stay).'; el.append(d); }
  const go = document.createElement('div'); go.className = 'row';
  const nb = document.createElement('button'); nb.textContent = P.parts.some(p => HERO_LIBS(p.lib)) ? '↻ Rebuild hero' : '🧑 Make a hero'; nb.onclick = () => { if (!P.parts.some(p => HERO_LIBS(p.lib)) && P.parts.some(p => !p.lib.startsWith('base_')) && !confirm('Make a hero? The current creature body is replaced (weapons and extra parts stay).')) return; snap(); buildHero(true); heroUI(); };
  go.append(nb); el.prepend(go); }
