import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
// ====================================================================== 🔌 V3 (Nov 9 2026, TEST PAGE ONLY: window.MF_V3): connectors (plugs)
// Inlined after forge-core.js into test.html by build.py, so it shares its scope (P, LIB, views, buildPart, addPart...).
// A plug is a spot on a part where another part clicks in: {id, t: type, p, d, o: 'frame' | 'out', s, r, up: 'world', side, pairOf}.
// Parts say what they plug into with `plugAs` (or it's worked out from their group). A plugged part keeps pt.host = {u: host uid, k: plug id, b: base size}
// and follows its host whenever the host is rebuilt (moved, refit, swapped). Moving it by hand unplugs it (it stays where you put it).
const V3X = window.V3 = {bt: window.__btx};
const PLUG_NAMES = {crown: 'crown', bigeye: 'big eye', eye: 'eye', horn: 'horn', ear: 'ear', brow: 'brow', nose: 'nose', crest: 'crest', teeth: 'teeth', fang: 'fang', tongue: 'tongue', chin: 'chin', mane: 'mane', cheek: 'cheek', back: 'back / spikes', jaw: 'jaw',
  finger: 'finger', claw: 'claw', toe: 'toe', tailtip: 'tail tip', antenna: 'antenna', belly: 'belly plate', feather: 'feather', combine: 'combine', any: 'any part', glow: 'glow spot', face: 'face', mouth: 'mouth', inside: 'inside', tentacle: 'tentacle', oral: 'oral arm', weapon: 'weapon', 'k-waist': 'waist', 'k-neck': 'neck', 'k-jaw': 'jaw hinge', 'k-arm': 'shoulder', 'k-elbow': 'elbow', 'k-hand': 'wrist', 'k-leg': 'hip', 'k-knee': 'knee', 'k-foot': 'ankle', 'k-tail': 'tail', 'k-wing': 'wing root', 'k-wing2': 'wing tip', 'k-feather': 'feather row', 'k-back': 'back', 'k-face': 'face', 'k-crown': 'crown', 'k-shield': 'shield mount', 'k-pod': 'shoulder pod', armor: 'armor'};
function plugAsOf(e) { if (!e) return null; if (e.plugAs !== undefined) return e.plugAs; const g = e.group, s = e.sub || '', id = e.id || '';
  if (g === 'Eyes & Faces') { if (s === 'Eyes') return /third|cluster/.test(id) ? 'brow' : 'eye'; if (s === 'Ears') return 'ear';
    if (s === 'Face Pieces') return /brow/.test(id) ? 'brow' : /whisker|cheek/.test(id) ? 'cheek' : /barbel|beard/.test(id) ? 'chin' : /snout|snarl|pig/.test(id) ? 'nose' : null; return null; }
  if (g === 'Horns & Crests') return /Horns|Antlers/.test(s) ? 'horn' : /Crests/.test(s) ? 'crest' : null;
  if (g === 'Jaws & Teeth') return /Teeth & Tusks/.test(s) ? 'fang' : /Tooth Rows/.test(s) ? 'teeth' : /Lower Jaws|Beaks|Maws/.test(s) ? 'jaw' : null;
  if (g === 'Heads & Skulls' && /mane/.test(id)) return 'mane';
  if (g === 'Back & Armor Plates') return 'back';
  return null; }
// --- geometry samples of a library part (for auto plugs)
const sampCache = {};
function samples(lib, params) { const k = lib + JSON.stringify(params || ''); if (sampCache[k]) return sampCache[k]; const pts = [], nrm = [];
  for (const pc of pieces(lib, params)) { const g = pc.geo, a = g.attributes.position; if (!g.attributes.normal) g.computeVertexNormals(); const n = g.attributes.normal, step = Math.max(1, Math.floor(a.count / 2500));
    for (let i = 0; i < a.count; i += step) { pts.push(new THREE.Vector3(a.getX(i), a.getY(i), a.getZ(i))); nrm.push(new THREE.Vector3(n.getX(i), n.getY(i), n.getZ(i))); } }
  return sampCache[k] = {pts, nrm}; }
function support(S, dir, filt) { let best = -1e9, bi = -1; const d = new THREE.Vector3(...dir).normalize(); for (let i = 0; i < S.pts.length; i++) { if (filt && !filt(S.pts[i])) continue; const v = S.pts[i].dot(d); if (v > best) { best = v; bi = i; } } return bi < 0 ? null : S.pts[bi].clone(); }
function bestBy(S, score, filt) { let best = -1e9, bi = -1; for (let i = 0; i < S.pts.length; i++) { if (filt && !filt(S.pts[i])) continue; const v = score(S.pts[i], S.nrm[i]); if (v > best) { best = v; bi = i; } } return bi < 0 ? null : {p: S.pts[bi].clone(), n: S.nrm[bi].clone()}; }
const r3 = v => v.toArray().map(x => +x.toFixed(3));
const autoCache = {};
function autoPlugs(lib) { if (autoCache[lib]) return autoCache[lib]; const e = LIB[lib], kind = kindOf(e), out = []; if (plugAsOf(e)) return autoCache[lib] = out;
  try { if (!e || e.whole || e.params) return autoCache[lib] = out; const S = samples(lib), b = partBoxOf(lib), sz = b.getSize(new THREE.Vector3()), H = sz.y, L = sz.z, W = sz.x;
    const pr = (id, t, p, d, o = 'out', ex = {}) => { if (p) out.push({id, t, p: r3(p), d, o, ...ex}); };
    const pairOf = (id, t, p, d, o, ex = {}) => { if (!p) return; const q = p.clone(); q.x = Math.max(.05, Math.abs(q.x)); pr(id + 'R', t, q, [Math.abs(d[0]), d[1], d[2]], o, {...ex, side: 'R', pairOf: id + 'L'}); pr(id + 'L', t, new THREE.Vector3(-q.x, q.y, q.z), [-Math.abs(d[0]), d[1], d[2]], o, {...ex, side: 'L', pairOf: id + 'R'}); };
    if (kind === 'head') { const zb = b.min.z, ym = b.min.y;
      const eye = bestBy(S, (p, n) => n.dot(new THREE.Vector3(.6, .3, .7).normalize()) + p.y / H * .4, p => p.x > W * .1 && p.y > ym + H * .45 && p.z > zb + L * .25 && p.z < zb + L * .72);
      if (eye) { pairOf('eye', 'eye', eye.p.clone().addScaledVector(eye.n, -.08 * H), [.7, .3, .6], 'frame', {s: Math.max(.5, Math.min(1.2, H / 1.5)) * .8});
        pr('brow', 'brow', new THREE.Vector3(0, eye.p.y + H * .1, eye.p.z), [0, 0, 1], 'frame', {s: W / 1.6}); }
      pairOf('horn', 'horn', support(S, [.4, 1, -.3], p => p.x > W * .08), [.35, .9, -.35], 'out', {s: H / 2.2});
      pr('hornC', 'horn', support(S, [0, 1, .4], p => Math.abs(p.x) < W * .12), [0, 1, .25], 'out', {s: H / 3});
      pairOf('ear', 'ear', support(S, [1, .6, -.5], p => p.x > 0), [1, .45, -.2], 'out', {s: H / 2.2});
      pr('nose', 'nose', support(S, [0, .3, 1], p => Math.abs(p.x) < W * .15), [0, 0, 1], 'frame', {s: W / 2.2});
      pr('crest', 'crest', support(S, [0, 1, -.6], p => Math.abs(p.x) < W * .12), [0, 1, -.35], 'out', {s: H / 2});
      pairOf('cheek', 'cheek', support(S, [1, -.1, .35], p => p.x > 0 && p.y < ym + H * .6), [1, 0, .3], 'out', {s: H / 3});
      pr('mane', 'mane', new THREE.Vector3(0, ym + H * .45, zb + L * .12), [0, 0, -1], 'frame', {s: W / 3.2});
      pr('chin', 'chin', support(S, [0, -.7, .7], p => Math.abs(p.x) < W * .15), [0, -.6, .8], 'frame', {s: W / 2.5}); pr('crown', 'crown', support(S, [0, 1, 0]), [0, 1, 0], 'frame', {s: W / 1.8}); }
    else if (kind === 'jaw') { pr('teeth', 'teeth', new THREE.Vector3(0, b.max.y - .02, b.min.z + L * .08), [0, 1, 0], 'frame', {s: L * .85});
      pr('tongue', 'tongue', new THREE.Vector3(0, b.max.y - .08, b.min.z + L * .1), [0, 0, 1], 'frame', {s: L * .5}); pr('chin', 'chin', support(S, [0, -.7, .7]), [0, -.6, .8], 'frame', {s: W / 2.2}); }
    else if (kind === 'torso') { for (let i = 0; i < 4; i++) { const yy = b.min.y + H * (.22 + i * .19), p = support(S, [0, 0, -1], q => Math.abs(q.y - yy) < H * .08 && Math.abs(q.x) < W * .15); pr('back' + (i + 1), 'back', p, [0, 0, -1], 'out', {s: W / 3, back: [0, -1, 0]}); }
      pr('belly', 'belly', support(S, [0, 0, 1], q => Math.abs(q.y - (b.min.y + H * .4)) < H * .1 && Math.abs(q.x) < W * .15), [0, 0, 1], 'out', {s: W / 3, back: [0, -1, 0]});
      if (/Mech/.test(e.group)) for (const [id, d] of [['cmbTop', [0, 1, 0]], ['cmbBack', [0, 0, -1]], ['cmbR', [1, 0, 0]], ['cmbL', [-1, 0, 0]]]) pr(id, 'combine', support(S, d), d, 'out', {s: 1}); }
    else if (kind === 'tail' || kind === 'neck') { const tip = support(S, [0, 1, 0]); if (kind === 'tail') pr('tip', 'tailtip', tip, [0, 1, 0], 'out', {s: W / 1.4});
      for (let i = 0; i < 3; i++) { const yy = b.min.y + H * (.2 + i * .25); out.push({id: 'back' + (i + 1), t: 'back', p: [0, +yy.toFixed(3), 0], d: [0, 0, -1], o: 'out', up: 'world', s: W / 3 * (1 - i * .15), back: [0, -1, 0]}); } }
    else if (kind === 'seg') { out.push({id: 'tip', t: 'tailtip', p: [0, +b.max.y.toFixed(3), 0], d: [0, 1, 0], o: 'out', s: W / 1.4, segEnd: 1}, {id: 'back1', t: 'back', p: [0, +(b.min.y + H * .5).toFixed(3), 0], d: [0, 0, -1], o: 'out', up: 'world', s: W / 3, back: [0, -1, 0]}); }
    else if (kind === 'hand' || kind === 'foot') { /* fingers are part of these hands; kit palms have finger plugs */ }
  } catch (x) { console.warn('autoPlugs', lib, x); }
  return autoCache[lib] = out; }
function plugsOf(lib, pt) { const e = LIB[lib]; let base = e && e.plugs ? e.plugs : autoPlugs(lib); if (pt && pt.plugs && pt.plugs.length) base = base.concat(pt.plugs); return base; }
V3X.plugsOf = plugsOf; V3X.plugAsOf = plugAsOf;
const fits = (want, t) => want === t || t === 'any' || (want === 'finger' && t === 'toe') || (want === 'fang' && t === 'teeth') || (want === 'horn' && (t === 'crest' || t === 'antenna')) || (want === 'claw' && t === 'finger') || (want === 'back' && t === 'belly');
// size normalisation for some plug types (a part's own size -> standard size)
function plugNorm(lib, t) { const b = partBoxOf(lib), sz = b.getSize(new THREE.Vector3()); if (t === 'eye') return .52 / Math.max(.2, Math.max(sz.x, sz.y));
  if (t === 'teeth') return 1 / Math.max(.3, sz.z); if (t === 'combine') return 4 / Math.max(1, sz.y); if (t === 'tongue') return 1 / Math.max(.3, sz.z); return 1; }
// --- rest pose world matrix of a bone (same maths as rebuildSkeleton)
function restWorld(name) { const r = boneRow(name); if (!r) return new THREE.Matrix4(); const h = new THREE.Vector3(...r[2]), t = new THREE.Vector3(...r[3]); return new THREE.Matrix4().compose(h, basisFor(t.clone().sub(h), (r[5] || {}).up), new THREE.Vector3(1, 1, 1)); }
function plugMatrix(pl, hostM, bone) { const p = new THREE.Vector3(...pl.p); let q = new THREE.Quaternion();
  if (pl.o === 'out') { let d = new THREE.Vector3(...pl.d).normalize();
    if (pl.up === 'world') { const inv = new THREE.Matrix4().copy(restWorld(bone)).multiply(hostM).invert(), w = new THREE.Vector3(0, 1, 0).transformDirection(inv); w.y = 0; if (w.lengthSq() > 1e-4) d = w.normalize(); if (pl.down) d.negate(); }
    const Y = d, B = new THREE.Vector3(...(pl.back || [0, 0, -1])), Z = B.clone().negate(); Z.addScaledVector(Y, -Z.dot(Y)); if (Z.lengthSq() < 1e-6) Z.set(1, 0, 0).addScaledVector(Y, -Y.x); Z.normalize(); const Xv = new THREE.Vector3().crossVectors(Y, Z).normalize(); Z.crossVectors(Xv, Y);
    q.setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xv, Y, Z)); }
  if (pl.r) q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...pl.r.map(x => x * D))));
  return new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1)); }
function hostMatrix(h) { const G = new THREE.Matrix4().compose(new THREE.Vector3(...h.p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...h.r.map(x => x * D))), new THREE.Vector3(h.s, h.s, h.s));
  const sx = (h.flip ? -1 : 1) * (h.w || 1), sy = h.l || 1, sz = h.w || 1, o = h.off, M = new THREE.Matrix4().compose(o ? new THREE.Vector3(-o[0] * sx, -o[1] * sy, -o[2] * sz) : new THREE.Vector3(), new THREE.Quaternion(), new THREE.Vector3(sx, sy, sz));
  return {G, M, both: G.clone().multiply(M)}; }
// put a plugged part where its plug is (bone space of the host, or of the jaw bone for jaws)
function seat(pt) { const h = pt.host && partBy(pt.host.u); if (!h) { if (pt.host) pt.host = null; return false; }
  const pl = plugsOf(h.lib, h).find(q => q.id === pt.host.k); if (!pl) { pt.host = null; return false; }
  const hm = hostMatrix(h), T = hm.both.clone().multiply(plugMatrix(pl, hm.both, h.bone)); let bone = h.bone;
  if (pl.t === 'jaw' && h.bone) { const jb = P.bones.find(r => r[1] === h.bone && r[4] === 'jaw'); if (jb && bones[jb[0]]) { const rel = restWorld(h.bone).invert().multiply(restWorld(jb[0])); T.premultiply(rel.invert()); bone = jb[0]; } }
  if (pl.side === 'L' && LIB[pt.lib] && LIB[pt.lib].sided) T.multiply(new THREE.Matrix4().makeScale(-1, 1, 1));   // 2.0 kits (T049): a right-side kit part on a left-side plug is mirrored
  let flip = false; if (T.determinant() < 0) { T.multiply(new THREE.Matrix4().makeScale(-1, 1, 1)); flip = true; }
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); T.decompose(p, q, s); const eu = new THREE.Euler().setFromQuaternion(q);
  const base = +(((s.x + s.y + s.z) / 3) * (pl.s || 1) * plugNorm(pt.lib, pl.t)).toFixed(4);
  pt.host.b = base; pt.bone = bone; pt.p = r3(p); pt.r = [eu.x, eu.y, eu.z].map(x => +(x / D).toFixed(1)); pt.s = +(base * (pt.ps || 1)).toFixed(4); pt.flip = flip !== !!pt.selfFlip;
  if (pl.sink) { const dir = new THREE.Vector3(...pl.d).normalize().applyQuaternion(q); pt.p = r3(p.addScaledVector(dir, -pl.sink * base)); }
  return true; }
V3X.seat = seat;
let reseating = 0;
V3X.kids = pt => { if (reseating > 40) return; reseating++; try { for (const k of P.parts) if (k.host && k.host.u === pt.uid && k !== pt) { if (seat(k)) buildPart(k); } } finally { reseating--; } };
V3X.unplug = pt => { if (pt && pt.host) { pt.host = null; tip('Unplugged — drag it near a 🔌 dot to plug it back in', 2200); } };
V3X.resized = pt => { if (pt && pt.host && pt.host.b) pt.ps = +(pt.s / pt.host.b).toFixed(3); };
// --- all plugs in the scene (world positions) that a part could go into
function scenePlugs(want, opts = {}) { const out = []; for (const h of P.parts) { if (h.boxed || h.hidden || !views[h.uid] || h.uid === opts.not) continue; const ps = plugsOf(h.lib, h); if (!ps.length) continue;
    const v = views[h.uid]; v.M.updateMatrixWorld(true);
    for (const pl of ps) { if (want && !fits(want, pl.t)) continue; const w = new THREE.Vector3(...pl.p).applyMatrix4(v.M.matrixWorld), used = P.parts.find(c => c.host && c.host.u === h.uid && c.host.k === pl.id && c.uid !== opts.not);
      out.push({h, pl, w, used}); } } return out; }
V3X.scenePlugs = scenePlugs;
const famOfBone = n => { const r = boneRow(n); return r ? FAMILY[r[4]] : null; };
// pick the plug for a part: near the screen point if given, else the first free one on the bone it was dropped on (or the head)
function findPlug(lib, bone, sx, sy) { const want = plugAsOf(LIB[lib]); if (!want) return null; const all = scenePlugs(want); if (!all.length) return null;
  if (sx != null) { let best = null, bd = 80; for (const c of all) { const [x, y, z] = toScreen(c.w); if (z > 1) continue; const d = Math.hypot(x - sx, y - sy) + (c.used ? 18 : 0); if (d < bd) { bd = d; best = c; } } if (best) return best; }
  const near = n => { if (!n) return []; const r = boneRow(n); return [n, r && r[1], ...P.bones.filter(q => q[1] === n).map(q => q[0])].filter(Boolean); };
  const lastSeg = c => !c.pl.segEnd || !P.bones.some(q => q[1] === c.h.bone && FAMILY[q[4]] === famOfBone(c.h.bone));
  const order = c => (lastSeg(c) ? 0 : 100) + (near(bone).includes(c.h.bone) ? 0 : famOfBone(c.h.bone) === famOfBone(bone) ? 1 : 2) * 10 + (c.used ? 5 : 0) + (c.pl.side === 'L' ? 1 : 0) + (c.h.bone && c.h.bone.endsWith('.L') ? 2 : 0);
  return all.sort((a, b) => order(a) - order(b))[0]; }
V3X.findPlug = findPlug;
// plug a library part in (with a mirrored twin on the paired plug); returns the new part or null
function plugIn(lib, c, opts = {}) { const {h, pl} = c; if (c.used && !opts.keep) removeParts([c.used]);
  const pt = newPart(lib, h.bone, [0, 0, 0], [0, 0, 0]); pt.host = {u: h.uid, k: pl.id}; seat(pt); P.parts.push(pt);
  // twin: the paired plug on the same host, or the same plug on the host's twin
  let tw = null; if (mirrorAdd && opts.twin !== false) { let th = null, tk = null; if (pl.pairOf) { th = h; tk = pl.pairOf; } else if (h.twin) { th = partBy(h.twin); tk = pl.id; }
    if (th && plugsOf(th.lib, th).some(q => q.id === tk)) { const used = P.parts.find(x => x.host && x.host.u === th.uid && x.host.k === tk); if (used && !opts.keep) removeParts([used]);
      tw = newPart(lib, th.bone, [0, 0, 0], [0, 0, 0]); tw.host = {u: th.uid, k: tk}; tw.twin = pt.uid; pt.twin = tw.uid; seat(tw); P.parts.push(tw); buildPart(tw); } }
  buildPart(pt); return pt; }
V3X.plugIn = plugIn;
// called first thing in addPart: plug-able parts go into a plug when there is one
// Dropped ON a part (V3X.hit = that part): it goes into a free matching plug of THAT part (or the part it is plugged into / parts plugged into it)
// when one is close to the finger; if that part has no such plug it stays right where it was dropped, on that part. It never jumps to another body part.
V3X.tryAdd = (lib, bone, p, r, s) => { const at = V3X.at, hitU = V3X.hit; V3X.at = null; V3X.hit = null; if (V3X.skip) return false; const e = LIB[lib]; if (!e || !plugAsOf(e)) return false;
  let c = null;
  if (hitU && at && partBy(hitU)) { const hp = partBy(hitU), grp = new Set([hitU]); if (hp.host) grp.add(hp.host.u); for (const k of P.parts) if (k.host && grp.has(k.host.u)) grp.add(k.uid);
    let bd = 170; for (const q of scenePlugs(plugAsOf(e))) { if (!grp.has(q.h.uid)) continue; const [x, y, z] = toScreen(q.w); if (z > 1) continue; const d = Math.hypot(x - at[0], y - at[1]) + (q.used ? 60 : 0); if (d < bd) { bd = d; c = q; } }
    if (!c) { V3X.stuck = (LIB[hp.lib] || {}).name || 'that part'; return false; } }
  else { if (s != null && !V3X.force) return false; c = findPlug(lib, bone, at && at[0], at && at[1]); }
  if (!c) return false;
  snap(); const pt = plugIn(lib, c); select(pt.uid); outliner(); saveCur(); tip('🔌 ' + e.name + ' plugged into the ' + (PLUG_NAMES[c.pl.t] || c.pl.t) + (pt.twin ? ' (both sides)' : ''), 2000); return true; };
// a new main part (head swap etc.): plugged parts whose host is gone move onto it if it has the same plug, else onto a matching free plug, else they go
V3X.adopt = pt => { const ps = plugsOf(pt.lib, pt); if (!ps.length) return; let moved = 0;
  for (const k of P.parts) { if (!k.host || partBy(k.host.u)) continue; let pl = ps.find(q => q.id === k.host.k); if (!pl) { const want = plugAsOf(LIB[k.lib]); pl = want && ps.find(q => fits(want, q.t) && !P.parts.some(o => o.host && o.host.u === pt.uid && o.host.k === q.id)); }
    if (!pl) continue; k.host = {u: pt.uid, k: pl.id}; if (seat(k)) { buildPart(k); moved++; } }
  if (moved) tip('🔌 ' + moved + ' part' + (moved > 1 ? 's' : '') + ' moved onto the new ' + (LIB[pt.lib] ? LIB[pt.lib].name : 'part'), 2200); };
V3X.orphans = () => { const gone = P.parts.filter(k => k.host && !partBy(k.host.u)); if (gone.length) removeParts(gone); return gone.length; };
// upper skull + its own jaw: add the matching jaw when a kit upper skull goes on (and remove the mannequin jaw)
V3X.afterAdd = pt => { const e = LIB[pt.lib]; if (!e) return; if (V3X.stuck) { const nm = V3X.stuck; V3X.stuck = null; setTimeout(() => tip('Stuck on the ' + nm + ' right where you let go (no 🔌 spot for it there). ✋ Drag to slide it.', 3200), 30); } if (e.upperOnly) { const jb = P.bones.filter(r => r[4] === 'jaw' && (r[1] === pt.bone)).map(r => r[0]);
    removeParts(P.parts.filter(p => jb.includes(p.bone) && !p.host && (p.lib.startsWith('base_') || kindOf(LIB[p.lib]) === 'jaw')));
    if (e.jawFor && LIB[e.jawFor] && !P.parts.some(k => k.host && k.host.u === pt.uid && k.host.k === 'jaw')) { const c = {h: pt, pl: plugsOf(pt.lib, pt).find(q => q.id === 'jaw')}; if (c.pl) { const m = mirrorAdd; mirrorAdd = false; plugIn(e.jawFor, c); mirrorAdd = m; } } }
  V3X.adopt(pt); V3X.orphans(); };

// --- 🔌 plug dots: shown while you drag a part from the grid / move a plugged part, or always with the 🔌 button
let plugDots = null, plugAlways = false; try { plugAlways = localStorage.getItem('mf-plugs') === '1'; } catch (x) {}
const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 4, 32, 32, 30); g.addColorStop(0, '#fff'); g.addColorStop(.35, '#fff'); g.addColorStop(.45, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
function clearDots() { if (plugDots) { plugDots.removeFromParent(); plugDots.traverse(o => o.material && o.material.dispose()); plugDots = null; } }
function showPlugs(want) { clearDots(); plugDots = new THREE.Group(); plugDots.renderOrder = 20;
  for (const c of scenePlugs(want === true ? null : want)) { const m = new THREE.SpriteMaterial({map: dotTex, color: c.used ? 0xff9a3a : 0x3ae0ff, depthTest: false, transparent: true, sizeAttenuation: false}); const sp = new THREE.Sprite(m); sp.scale.setScalar(c.used ? .022 : .03); sp.position.copy(c.w); sp.renderOrder = 20; sp.userData.plug = c; plugDots.add(sp); }
  scene.add(plugDots); }
function hidePlugs() { clearDots(); if (plugAlways) showPlugs(true); }
V3X.dragStart = id => { const want = plugAsOf(LIB[id]); if (want) { showPlugs(want); plugDots.userData.drag = 1; const n = scenePlugs(want).length; if (n) tip('🔌 Let go on a glowing dot to plug it in (' + n + ' spots)', 2600); } };
V3X.dragEnd = () => hidePlugs();
V3X.refreshDots = () => { if (plugAlways && !(plugDots && plugDots.userData.drag)) showPlugs(true); };
// moving a plugged part with your finger: let go near a matching dot = plug in there, else it unplugs and stays where you let go
V3X.dropMoved = (pt, x, y) => { const want = plugAsOf(LIB[pt.lib]); if (!want) { if (pt.host) pt.host = null; return false; } const all = scenePlugs(want, {not: pt.uid}); let best = null, bd = 60;
  for (const c of all) { if (c.h.uid === pt.uid || (c.h.host && c.h.host.u === pt.uid)) continue; const [sx, sy, sz] = toScreen(c.w); if (sz > 1) continue; const d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = c; } }
  if (!best) { if (pt.host) { pt.host = null; tip('Unplugged — it stays here. Drag it near a 🔌 dot to plug it back in', 2400); } return false; }
  if (best.used && best.used !== pt) removeParts([best.used]); pt.host = {u: best.h.uid, k: best.pl.id}; pt.ps = 1; seat(pt); buildPart(pt); const tw = twinOf(pt); if (tw) { tw.twin = null; pt.twin = null; }
  tip('🔌 Plugged into the ' + (PLUG_NAMES[best.pl.t] || best.pl.t), 1600); return true; };
// on-screen 🔌 button (next to 🔍 Focus): show every plug
(() => { const vt = $('vtools'); if (!vt) return; const b = document.createElement('button'); b.id = 'bPlugs'; b.className = 'vx'; b.innerHTML = '🔌 Plugs'; vt.appendChild(b);
  const ui = () => b.classList.toggle('on', plugAlways); ui();
  b.onclick = () => { plugAlways = !plugAlways; try { localStorage.setItem('mf-plugs', plugAlways ? '1' : '0'); } catch (x) {} if (plugAlways) showPlugs(true); else clearDots(); ui();
    tip(plugAlways ? '🔌 Blue dots = free plugs, orange = something is plugged in. Drag a part onto a dot.' : 'Plug dots hidden', 2600); };
  if (plugAlways) setTimeout(() => showPlugs(true), 600); })();
// test hooks (headless checks only)
window.__v3 = {addPart: (...a) => addPart(...a), P: () => P, LIB, views: () => views, partBy, sel: () => sel, select, rebuild: () => rebuildParts(), frame: () => frameAll(), frameObj: (u, k) => views[u] && frameObj(views[u].G, k || 1.3), nb: () => { showBones = false; boneHelpers.forEach(h => h.visible = false); applyNums && applyNums(); }, show: w => showPlugs(w), hide: () => clearDots(), cam: (x, y, z, tx, ty, tz) => { camera.position.set(x, y, z); controls.target.set(tx, ty, tz); controls.update(); }, removeParts, buildDefault: (k, s) => window.__def(k, s), bones: () => bones, fit: (l, b) => fitPart(l, b), mirror: v => (v == null ? mirrorAdd : (mirrorAdd = v)), drop: (lib, bone, at) => { placing = lib; placeAt({object: {userData: {bone}}, point: new THREE.Vector3(...at), face: null}); }};
window.__v3.look = (us, dir = [1, .2, .3], k = 2.4) => { const b = new THREE.Box3(); (us == null ? Object.keys(views) : Array.isArray(us) ? us : [us]).forEach(u => { if (views[u]) b.expandByObject(views[u].G); }); if (b.isEmpty()) b.setFromObject(skelRoot);
  const c = b.getCenter(new THREE.Vector3()), r = b.getSize(new THREE.Vector3()).length() / 2, d = new THREE.Vector3(...dir).normalize(); camera.position.copy(c).addScaledVector(d, r * k + .5); controls.target.copy(c); camera.near = .01; camera.updateProjectionMatrix(); controls.update(); };
window.__v3.ids = lib => P.parts.filter(p => !lib || p.lib === lib || (lib.test && lib.test(p.lib))).map(p => p.uid);

// ====================================================================== 🎓 Build together: plug steps + matched kits per skeleton (V3)
// fill every free plug of one kind (the step's kind, or the part's own kind)
V3X.fillAll = (id, type, bones) => { const want = plugAsOf(LIB[id]) || type; if (!want) return 0; let n = 0;
  for (let k = 0; k < 60; k++) { const free = scenePlugs(want).filter(c => !c.used && !c.pl.opt && c.h.lib !== id && (type ? c.pl.t === type : c.pl.t === want) && (!bones || bones.has(c.h.bone)) && (!c.pl.segEnd || !P.bones.some(q => q[1] === c.h.bone && FAMILY[q[4]] === FAMILY[(boneRow(c.h.bone) || [])[4]]))).sort((a, b) => ((a.pl.side === 'L') + (a.h.bone || '').endsWith('.L') * 2) - ((b.pl.side === 'L') + (b.h.bone || '').endsWith('.L') * 2));
    if (!free.length) break; plugIn(id, free[0]); n++; } return n; };
const STEP_T = {eye: 1, teeth: 1, fang: 1, tongue: 1, horn: 1, ear: 1, finger: 1, claw: 1, toe: 1, tailtip: 1, back: 1, belly: 1};
V3X.plugsFor = how => { const t = (how || '').split(':')[1]; const all = scenePlugs(t || null); return t ? all.length : all.filter(c => /brow|nose|cheek|chin|crest|mane|antenna/.test(c.pl.t)).length; };
// what's on the model right now
const onModel = re => P.parts.find(p => !p.boxed && re.test(p.lib));
const KIT_HEAD = {dragon: 'kh_dragon', wyvern: 'kh_dragon', hydra: 'kh_dragon', hydra2: 'kh_dragon', kaiju: 'kh_kaiju', biped: 'kh_kaiju', theropod: 'kh_kaiju', quad: 'kh_beast', centaur: 'kh_human', angel: 'kh_human', slim: 'kh_skull', sphinx: 'kh_cat', chimera: 'kh_cat', hippogriff: 'kh_bird', bird: 'kh_bird',
  serpent: 'kh_serpent', naga: 'kh_serpent', turtle: 'kh_turtle', turtle2: 'kh_turtle', brute: 'kh_brute', gorilla: 'kh_ape', fourarm: 'kh_brute', fish: 'kh_shark', bonyfish: 'kh_fish', spider: 'kh_bug', insect: 'kh_bug', mantis: 'kh_bug', wasp: 'kh_bug', uprightbug: 'kh_bug', scorpion: 'kh_bug'};
const KIT_HAND = {kaiju: 'kl_palm_kaiju', biped: 'kl_palm_kaiju', theropod: 'kl_palm_kaiju', hydra2: 'kl_palm_beast', brute: 'kl_palm_human', gorilla: 'kl_palm_human', fourarm: 'kl_palm_human', angel: 'kl_palm_human', slim: 'kl_palm_human', naga: 'kl_palm_human', centaur: 'kl_palm_human', turtle2: 'kl_palm_kaiju', uprightbug: 'kl_arm_hook', mantis: 'kl_arm_scythe', wasp: 'kl_arm_drill'};
const KIT_FOOT = {kaiju: 'kl_foot_kaiju', biped: 'kl_foot_kaiju', theropod: 'kl_foot_dragon', dragon: 'kl_foot_dragon', wyvern: 'kl_foot_dragon', hydra: 'kl_foot_dragon', hydra2: 'kl_foot_dragon', quad: 'kl_foot_paw', chimera: 'kl_foot_paw', sphinx: 'kl_foot_paw', centaur: 'kl_foot_paw',
  bird: 'kl_foot_bird', hippogriff: 'kl_foot_bird', brute: 'kl_foot_human', gorilla: 'kl_foot_human', slim: 'kl_foot_human', fourarm: 'kl_foot_human', angel: 'kl_foot_human', turtle: 'kl_foot_kaiju', turtle2: 'kl_foot_kaiju'};
const KIT_TAIL = {kaiju: 'kl_tailseg_scaly', biped: 'kl_tailseg_scaly', theropod: 'kl_tailseg_scaly', dragon: 'kl_tailseg_scaly', wyvern: 'kl_tailseg_scaly', hydra: 'kl_tailseg_scaly', hydra2: 'kl_tailseg_scaly', scorpion: 'kl_tailseg_ringed', chimera: 'kl_tailseg_scaly', turtle: 'kl_tailseg_plated', turtle2: 'kl_tailseg_plated'};
const KIT_TIP = {dragon: 'kl_tip_spade', wyvern: 'kl_tip_stinger', hydra: 'kl_tip_spade', hydra2: 'kl_tip_spade', scorpion: 'kl_tip_stinger', chimera: 'kl_tip_snakehead', sphinx: 'kl_tip_tuft', quad: 'kl_tip_tuft', fish: 'kl_tip_fin', kaiju: null, biped: null, wasp: 'kl_tip_stinger'};
const KIT_BACK = {serpent: 'kl_back_fin', kaiju: 'kl_back_crystal', biped: 'kl_back_plate', dragon: 'kl_back_spike', hydra: 'kl_back_spike', hydra2: 'kl_back_spike', turtle: 'kl_back_spike', turtle2: 'kl_back_spike', theropod: null};
// 🎨 creature themes (2.0): one skin family per default creature, so a default build never mixes green legs with a brown chest.
// t = limb / neck kit type, m = main skin, belly = second skin for belly pieces, fam = per body-family overrides (see famKey)
const THEME = {croc: {t: 'scaly', m: 'croc'}, croc2: {t: 'scaly', m: 'croc'}, biped: {t: 'scaly', m: 'croc'}, kaiju: {t: 'scaly', m: 'scale'}, theropod: {t: 'scaly', m: 'monitor'}, dragon: {t: 'scaly', m: 'scale'}, wyvern: {t: 'scaly', m: 'iguanablack'}, hydra: {t: 'scaly', m: 'alligator'}, hydra2: {t: 'scaly', m: 'komodo'},
  turtle: {t: 'scaly', m: 'alligator'}, turtle2: {t: 'scaly', m: 'alligator'}, serpent: {t: 'scaly', m: 'snake'}, quad: {t: 'fur', m: 'fur'}, sphinx: {t: 'fur', m: 'fur'}, chimera: {t: 'fur', m: 'fur', fam: {tail: 'snake'}}, gorilla: {t: 'fur', m: 'blackfur', keep2: 1},
  centaur: {t: 'fur', m: 'fur', fam: {arm: 'skin', hand: 'skin', head: 'skin', jaw: 'skin', neck: 'skin'}, limbs: {Arms: 'skin', Neck: 'skin'}}, hippogriff: {t: 'fur', m: 'fur', fam: {head: 'feather', neck: 'feather'}, limbs: {Neck: 'feather'}},
  bird: {t: 'feather', m: 'feather', fam: {leg: 'horn', foot: 'horn'}, limbs: {Legs: 'scaly'}}, angel: {t: 'skin', m: 'skin'}, brute: {t: 'skin', m: 'skin'}, fourarm: {t: 'skin', m: 'skin'}, slim: {t: 'bone', m: 'oldbone', limbs: {Neck: 'skin'}},
  spider: {t: 'chitin', m: 'antblack'}, insect: {t: 'chitin', m: 'jewelbeetle'}, scorpion: {t: 'chitin', m: 'stagbeetle'}, crab: {t: 'chitin', m: 'chitinred'}, mantis: {t: 'chitin', m: 'mantis'}, wasp: {t: 'chitin', m: 'wasp'}, uprightbug: {t: 'chitin', m: 'chitin'}, moth: {t: 'chitin'},
  demon: {t: 'skin', m: 'demonred', fam: {leg: 'blackfur', foot: 'blackfur', wing: 'demonash'}}, stego: {t: 'scaly', m: 'dinogreen'}, raptor: {t: 'feather', m: 'featherrust'}, ptero: {t: 'skin', m: 'dinoslate', fam: {wing: 'dinoslate'}}, spino: {t: 'scaly', m: 'dinoslate'}};
V3X.THEME = THEME; V3X.noHead = k => !!(OVR[k] && OVR[k].Head === null);
const BODYM = new Set(['skin', 'scale', 'fur', 'feather', 'chitin', 'bigscale', 'plates']);
V3X.theme = uids => { const th = THEME[P.skel]; if (!th || !th.m || (V3X.bt && V3X.bt.BT.style === 'mech')) return; let ch = false;
  for (const u of uids || []) { const pt = partBy(u); if (!pt || pt.matAll || pt.mat || pt.elem || !LIB[pt.lib] || /^base_/.test(pt.lib)) continue; let pcs; try { pcs = pieces(pt.lib, pt.params); } catch (x) { continue; }
    const body = pcs.map(q => q.mat).filter(m => BODYM.has(m)); if (!body.length) continue; const cnt = {}; body.forEach(m => cnt[m] = (cnt[m] || 0) + 1);
    const dom = BODYM.has(pcs[0].mat) ? pcs[0].mat : Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0], host = pt.host && partBy(pt.host.u), fk = famKey(host || pt), m = (th.fam && (th.fam[fk[0]] ?? th.fam[fk[1]])) || th.m;
    if (fk[1] === 'wing' && !(th.fam && th.fam.wing)) continue;   // wings keep their own feathers / membrane
    const arr = pcs.map(q => q.mat === dom ? (m !== dom ? m : null) : /^paint2?$/.test(q.mat) ? (th.belly || m) : (BODYM.has(q.mat) && th.belly ? th.belly : null)); if (arr.some(Boolean)) { pt.mat = arr; ch = true; } }
  if (ch) rebuildParts(); };
// per-skeleton overrides that win over everything else (2.0 fixes): the octopus mantle IS the head, eye stalks get real stalks, serpents are built from bending segments
const OVR = {octopus: {Head: null}, kraken: {Head: null}, blob: {Head: 'kp_eye_big', Body: 'bb_blob'}, crab: {Neck: 'kl_eyestalk', Hands: 'bd_hand_crab'}, lobster: {Neck: 'kl_eyestalk'}, serpent: {Body: 'kl_tailseg_scaly', Head: 'kh_serpent'},
  scorpion: {Hands: 'bd_hand_scorpion'}, spider: {'Tail / tentacles': 'bb_abdomen'}, insect: {'Tail / tentacles': 'bb_abdomen'}};
const NECKSEG = {scaly: 'kl_neckseg_scaly', fur: 'kl_neckseg_fur', skin: 'kl_neckseg_skin', feather: 'kl_neckseg_feather', chitin: 'kl_neckseg_chitin', bone: 'kl_neckseg_skin', rock: 'kl_neckseg_rock'};
V3X.defFor = (skel, t, style, level) => { const cx = true, mech = style === 'mech';   // 2.0: Simple and Complex build the SAME creature (the kit parts are the ones that fit every skeleton); Simple only asks fewer questions
  if (!mech && OVR[skel] && OVR[skel][t] !== undefined) return OVR[skel][t];
  { const th = THEME[skel], own3 = (V3X.DEF3[skel] || {})[t]; if (cx && !mech && th && own3 === undefined && !/^naga/.test(skel)) { const lt = (th.limbs && th.limbs[t]) || th.t;
      if (t === 'Legs') return 'kl_limb_' + lt; if (t === 'Arms') return 'kl_limb_' + lt + '_arm'; if (t === 'Neck') return NECKSEG[lt] || 'kl_neckseg_skin'; if (t === 'Feet' && th.t === 'chitin') return 'kl_foot_bugtip'; } }
  if (/^naga/.test(skel) && !mech && ['Body', 'Head', 'Tail / tentacles', 'Neck', 'Arms', 'Hands'].includes(t)) { const d = ((window.MF_DEF_CORE || {})[skel] || {})[t]; if (d !== undefined) return d; }   // 🐍 nagas: one-piece snake body + naga torsos/heads
  // custom per-skeleton defaults (new body types)
  const kitMain = cx && !mech && ({Head: KIT_HEAD, Hands: KIT_HAND, Feet: KIT_FOOT, 'Tail / tentacles': KIT_TAIL}[t] || {})[skel]; if (kitMain) return kitMain;
  if (cx && !mech && (t === 'Legs' && KIT_FOOT[skel] || t === 'Arms' && KIT_HAND[skel] && !/mantis|wasp|uprightbug/.test(skel))) { const m = /paw/.test(KIT_FOOT[skel] || '') ? 'fur' : /human/.test((t === 'Arms' ? KIT_HAND : KIT_FOOT)[skel] || '') ? 'skin' : 'scaly'; return 'kl_limb_' + m + (t === 'Arms' ? '_arm' : ''); }
  if (cx && mech && (t === 'Legs' || t === 'Arms') && !/walker|tank/.test(skel)) return undefined;
  const own = (V3X.DEF3[skel] || {})[t]; if (own !== undefined && !mech) return own;
  if (cx && mech) { if (t === 'Hands') return 'kl_palm_mech'; if (t === 'Tail / tentacles' && !/walker|tank/.test(skel)) return 'kl_tailseg_mech'; }
  const kitHead = onModel(/^kh_/), hk = kitHead && kitHead.lib.slice(3);
  if (t === 'Eyes') return mech ? null : kitHead ? (hk === 'shark' ? 'ks_eye_shark' : hk === 'fish' ? 'ks_eye_fish' : hk === 'bug' ? 'kp_eye_compound' : /golem|skull/.test(hk) ? 'kp_eye_glow' : /brute|ape/.test(hk) ? 'kp_eye_lidded' : /dragon|kaiju|serpent|croc|cat|beast/.test(hk) ? 'kp_eye_slit' : 'kp_eye_round') : null;
  if (t === 'Teeth') return kitHead ? ({shark: 'kp_row_saw', fish: 'kp_row_needle', dragon: 'kp_row_fang', kaiju: 'kp_row_fang', beast: 'kp_row_fang', cat: 'kp_row_fang', croc: 'kp_row_saw', serpent: 'kp_row_needle', brute: 'kp_row_molar', ape: 'kp_row_fang', skull: 'kp_row_molar'}[hk] || null) : null;
  if (t === 'Fangs') return kitHead && hk === 'cat' ? 'kp_fang_saber' : kitHead && hk === 'serpent' ? 'kp_fang_venom' : null;
  if (t === 'Tongue') return kitHead && hk === 'serpent' ? 'kp_tongue_fork' : null;
  if (t === 'Horns') return mech ? undefined : kitHead ? ({dragon: 'kp_horn_swept', kaiju: 'kp_horn_short'}[hk] || null) : undefined;
  if (t === 'Ears') return kitHead && /beast|cat/.test(hk) ? 'kp_ear_point' : null;
  if (t === 'Face bits') return kitHead && /dragon|kaiju/.test(hk) ? 'kp_brow_ridge' : null;
  if (t === 'Crest / mane') return kitHead && hk === 'cat' && /chimera|sphinx/.test(skel) ? 'kp_mane_fur' : kitHead && hk === 'bug' ? 'kp_ant_straight' : null;
  if (t === 'Fingers') { const pm = onModel(/^kl_palm_/); return pm ? {kaiju: 'kl_finger_kaiju', human: 'kl_finger_human', mech: 'kl_finger_mech', beast: 'kl_finger_beast', two: 'kl_finger_bony'}[pm.lib.slice(8)] : null; }
  if (t === 'Claws') { const pm = onModel(/^kl_palm_/); return pm && /mech/.test(pm.lib) ? 'kl_claw_mech' : pm && /human/.test(pm.lib) ? 'kl_claw_nail' : 'kl_claw_hook'; }
  if (t === 'Toes') { const ft = onModel(/^kl_foot_/); return ft ? {dragon: 'kl_finger_beast', kaiju: 'kl_finger_kaiju', bird: 'kl_finger_beast', paw: 'kl_finger_human', human: 'kl_finger_human'}[ft.lib.slice(8)] : null; }
  if (t === 'Toe claws') return null;
  if (t === 'Tail tip') return KIT_TIP[skel] !== undefined ? KIT_TIP[skel] : null;
  if (t === 'Back spikes') return mech ? null : KIT_BACK[skel] !== undefined ? KIT_BACK[skel] : null;
  if (t === 'Belly') return null;
  return undefined; };
V3X.DEF3 = window.FORGE_DEF3 || {};

// ====================================================================== new body types: defaults, ⭐ default builds, fitting bodies (V3)
if (V3X.bt) { const {DEF, BODY_FOR, defUI} = V3X.bt; for (const [k, d] of Object.entries(window.FORGE_DEF3 || {})) { if (!DEF[k]) DEF[k] = d; }
  Object.assign(BODY_FOR, {chimera: ['bb_lion', 'bb_beast'], hydra2: ['bd_torso_dragon'], mantis: ['bd_torso_thorax'], wasp: ['bd_torso_thorax', 'bd_torso_spider'], uprightbug: ['bd_torso_thorax', 'bd_torso_brawler'], kraken: ['kr_mantle'],
    croc: ['kcr_body', 'bd_torso_dragon'], croc2: ['kcr_body', 'bd_torso_dragon'], fish: ['ks_shark_body', 'ks_fish_body', 'bb_fish'], bonyfish: ['ks_fish_body', 'ks_shark_body', 'bb_fish'], lobster: ['ks_lob_carapace', 'bd_torso_crab'],
    jellyfish: ['kj_bell'], turtle: ['kc_shell_snapper', 'tt_shell'], turtle2: ['kc_shell_snapper', 'tt_shell'], hippogriff: ['bb_horse', 'bb_beast'], ooze: ['ko_goo', 'ko_puddle', 'bb_blob'], beholder: ['ko_orb'], blob: ['ko_goo', 'bb_blob', 'bd_torso_slug', 'bd_torso_bloated']});
  try { defUI(); } catch (x) {} }
// parts that keep their own size on the body (jellyfish bell)
const _afterAdd = V3X.afterAdd; V3X.afterAdd = pt => { const e = LIB[pt.lib]; if (e && e.ownSize && !pt.fit && !pt.host) { pt.s = e.ownSize; buildPart(pt); syncTwin(pt); } if (e && e.ownSize && pt.fit) { pt.s = e.ownSize; pt.l = 1; pt.fit.tweaked = true; buildPart(pt); syncTwin(pt); } _afterAdd(pt); };

// ====================================================================== 🔢 paint by number + 🫧 ooze & horror tools + 🤖 mech it (panel at the top of 🎨 Paint)
const numsOf = pt => { const out = new Map(); pieces(pt.lib, pt.params).forEach((pc, mi) => { if (pc.num == null) return; if (!out.has(pc.num)) out.set(pc.num, []); out.get(pc.num).push(mi); }); return out; };
const curCol = (pt, mi) => { const k = pt.mat && pt.mat[mi]; if (k && k.startsWith('col:')) return k.slice(4); const pc = pieces(pt.lib, pt.params)[mi]; const l = MATS.LIST.find(x => x[0] === ((pt.mat && pt.mat[mi]) || pt.matAll || pc.mat)); return l ? '#' + (l[4] | 0).toString(16).padStart(6, '0') : '#888888'; };
function setNum(pt, num, key) { const ms = numsOf(pt).get(num) || []; const n = pieces(pt.lib, pt.params).length; pt.mat = pt.mat && pt.mat.length === n ? pt.mat : Array(n).fill(null).map((_, i) => pt.mat && pt.mat[i] != null ? pt.mat[i] : pt.matAll || null);
  ms.forEach(mi => pt.mat[mi] = key); buildPart(pt); const t = twinOf(pt); if (t && paintTwin) { t.mat = [...pt.mat]; buildPart(t); } }
let numLabels = null, showNumLabels = true;
function numLabelsUI() { if (numLabels) { numLabels.removeFromParent(); numLabels = null; } const pt = partBy(sel), v = pt && views[pt.uid]; if (!pt || !v || !showNumLabels || tab !== 'paint') return; const nums = numsOf(pt); if (!nums.size) return;
  numLabels = new THREE.Group(); const pcs = pieces(pt.lib, pt.params); skelRoot.updateMatrixWorld(true);
  for (const [num, mis] of nums) { if (num === 0) continue; const b = new THREE.Box3(); mis.forEach(mi => { pcs[mi].geo.computeBoundingBox(); b.union(pcs[mi].geo.boundingBox); }); const c = b.getCenter(new THREE.Vector3());
    const sp = numberSprite(num); sp.material = sp.material.clone(); sp.material.depthTest = false; sp.material.sizeAttenuation = false; sp.renderOrder = 30; const w = c.clone().applyMatrix4(v.M.matrixWorld); sp.position.copy(w); sp.scale.set(.04, .04, 1); numLabels.add(sp); }
  scene.add(numLabels); }
function v3PaintUI() { let el = $('v3paint'); if (!el) { el = document.createElement('div'); el.id = 'v3paint'; $('paintNow').after(el); }
  const pt = partBy(sel), e = pt && LIB[pt.lib]; el.innerHTML = ''; if (!pt || !e) return numLabelsUI();
  const h = (tag, html, cls) => { const x = document.createElement(tag); x.innerHTML = html; if (cls) x.className = cls; el.append(x); return x; };
  const nums = numsOf(pt);
  if (nums.size) { h('div', '🔢 <b>Paint by number</b> — each number is a piece. Tap a colour to change every piece with that number' + (paintTwin ? ' (both sides)' : '') + '.', 'how');
    const r = h('div', '', 'row'); r.style.flexWrap = 'wrap';
    for (const [num, mis] of [...nums].sort((a, b) => a[0] - b[0])) { const lab = num === 0 ? 'veins' : (e.pbnNames && e.pbnNames[num - 1]) || num; const wrap = document.createElement('label'); wrap.style.cssText = 'display:inline-flex;align-items:center;gap:4px;margin:2px 6px 2px 0;font-size:13px';
      const inp = document.createElement('input'); inp.type = 'color'; inp.value = curCol(pt, mis[0]); inp.style.cssText = 'width:34px;height:30px;border:0;background:none;padding:0';
      inp.onchange = () => { snap(); setNum(pt, num, 'col:' + inp.value); saveCur(); numLabelsUI(); }; wrap.append(Object.assign(document.createElement('b'), {textContent: num === 0 ? '·' : num}), inp, Object.assign(document.createElement('span'), {textContent: num === 0 ? 'veins' : (e.pbnNames && e.pbnNames[num - 1]) || ''})); r.append(wrap); }
    const r2 = h('div', '', 'row'); const b = (t, f, on) => { const x = Object.assign(document.createElement('button'), {textContent: t, onclick: f}); if (on) x.className = 'on'; r2.append(x); return x; };
    b('🔢 Numbers on model', () => { showNumLabels = !showNumLabels; v3PaintUI(); }, showNumLabels);
    b('🎨 Picked skin → number…', () => { const n = prompt('Which number gets the skin ' + (MATS.LIST.find(l => l[0] === (pt.matAll || '')) || [, 'you pick next'])[1] + '? (' + [...nums.keys()].join(', ') + ')'); if (n == null) return; const k = window.__v3lastSkin || pt.matAll; if (!k) return tip('Tap a skin first, then press this'); snap(); setNum(pt, +n, k); saveCur(); });
    if (e.patterns) { h('div', 'Patterns:', 'hint'); const r3 = h('div', '', 'row'); r3.style.flexWrap = 'wrap';
      for (const [name, map] of Object.entries(e.patterns)) r3.append(Object.assign(document.createElement('button'), {textContent: name, onclick: () => { snap(); for (const [n, c] of Object.entries(map)) setNum(pt, +n, 'col:' + c); saveCur(); v3PaintUI(); tip('🎨 ' + name, 1400); }})); } }
  // 🫧 ooze tools
  const goo = /^jelly/.test(pt.matAll || '') || /ko_goo|ko_puddle|bb_blob|kj_bell/.test(pt.lib) || pieces(pt.lib, pt.params).some(pc => /^jelly/.test(pc.mat));
  const inside = pt.host && plugsOf((partBy(pt.host.u) || {}).lib || '', partBy(pt.host.u)).some(q => q.id === pt.host.k && q.t === 'inside');
  if (goo || inside || P.parts.some(p => /^(ko_|kj_)/.test(p.lib))) { h('div', '🫧 <b>Ooze & horror</b>', 'step');
    if (goo) { const r = h('div', '<span class="hint" style="margin:0">🌫 Murk</span>', 'row'); const s = document.createElement('input'); s.type = 'range'; s.min = 0; s.max = 1; s.step = .05; s.value = pt.murk ?? .4; s.style.flex = 1;
      s.oninput = () => { pt.murk = +s.value; buildPart(pt); syncTwin(pt); saveCur(); }; r.append(s); }
    const r = h('div', '', 'row'); r.style.flexWrap = 'wrap'; const b = (t, f, on) => { const x = Object.assign(document.createElement('button'), {textContent: t, onclick: f}); if (on) x.className = 'on'; r.append(x); return x; };
    if (!goo) b('🫥 Swallow it', () => swallow(pt));
    if (inside) { b('🖐 Breakout', () => { snap(); pt.dep = pt.dep < 0 ? 0 : -.9; seat(pt); buildPart(pt); saveCur(); v3PaintUI(); tip(pt.dep < 0 ? '🖐 Pushing out through the goo' : 'Back inside', 1600); }, pt.dep < 0);
      const r2 = h('div', '<span class="hint" style="margin:0">⬇ Depth</span>', 'row'); const d = document.createElement('input'); d.type = 'range'; d.min = -1; d.max = 1; d.step = .05; d.value = pt.dep || 0; d.style.flex = 1; d.oninput = () => { pt.dep = +d.value; seat(pt); buildPart(pt); saveCur(); }; r2.append(d);
      const r3 = h('div', '<span class="hint" style="margin:0">🫠 Digested</span>', 'row'); const g = document.createElement('input'); g.type = 'range'; g.min = 0; g.max = 1; g.step = .05; g.value = pt.dig || 0; g.style.flex = 1; g.oninput = () => { digest(pt, +g.value); }; r3.append(g); }
    const r4 = h('div', '<span class="hint" style="margin:0">🩸 Horror:</span>', 'row'); for (const [lv, t] of [[0, 'Creepy'], [1, 'Nightmare'], [2, 'Full horror']]) r4.append(Object.assign(document.createElement('button'), {textContent: t, className: (P.fx.horror || 0) === lv ? 'on' : '', onclick: () => { snap(); P.fx.horror = lv; rebuildParts(); saveCur(); v3PaintUI(); tip(['😶 Creepy: wrong, no gore', '👁 Nightmare: stolen faces, struggling victims, bones', '🩸 Full horror: flesh and blood'][lv], 2200); }})); }
  // 🤖 mech it
  h('div', '🤖 <b>Mech it</b> — turn this part (or everything) into machine parts. One part = cyborg.', 'step'); const rm = h('div', '', 'row');
  rm.append(Object.assign(document.createElement('button'), {textContent: '🤖 Mech this part', onclick: () => mechIt([pt])}), Object.assign(document.createElement('button'), {textContent: '🤖 Mech it all', onclick: () => mechIt(P.parts.filter(p => !p.boxed && !p.twinDone))}), Object.assign(document.createElement('button'), {textContent: '↩ Undo mech', onclick: () => unMech(pt)}));
  numLabelsUI(); }
const _select = select; select = function (u) { _select(u); try { v3PaintUI(); } catch (x) { console.warn(x); } };
document.querySelectorAll('[data-tab],[data-top]').forEach(b => b.addEventListener('click', () => setTimeout(() => { try { v3PaintUI(); } catch (x) {} }, 30)));
const _paint = paint; paint = function (k) { window.__v3lastSkin = k; return _paint(k); };

// ---- per-part look: murk (see-through amount), horror level visibility, full-horror blood tint, digested
V3X.post = pt => { const v = views[pt.uid], e = LIB[pt.lib]; if (!v) return;
  if (e && e.horror && (P.fx.horror || 0) < e.horror) v.G.visible = false;
  const blood = (P.fx.horror || 0) >= 2;
  if (pt.murk != null || blood) v.meshes.forEach(m => { const k = m.material && m.material.userData && m.material.userData.key; if (!k || !/^jelly/.test(k)) return; const c = m.material.clone(); c.onBeforeCompile = m.material.onBeforeCompile; c.customProgramCacheKey = m.material.customProgramCacheKey;
    if (pt.murk != null) { c.opacity = .2 + pt.murk * .75; c.depthWrite = pt.murk > .85; } if (blood && k !== 'jellyblood') c.color.lerp(new THREE.Color(0x8a1018), .45); m.material = c; }); };
const _kids = V3X.kids; V3X.kids = pt => { V3X.post(pt); _kids(pt); };
// seat: depth inside the goo / breakout (pushes along the plug direction)
const _seat = seat; V3X.seat = seat = function (pt) { const ok = _seat(pt); if (ok && pt.dep) { const h = partBy(pt.host.u), pl = plugsOf(h.lib, h).find(q => q.id === pt.host.k);
    if (pl && pt.bone === h.bone) { const d = new THREE.Vector3(...pl.d).transformDirection(hostMatrix(h).both); pt.p = r3(new THREE.Vector3(...pt.p).addScaledVector(d, -pt.dep * (pt.host.b || 1) * 1.6)); } } return ok; };
function swallow(pt) { const blobs = P.parts.filter(h => h !== pt && plugsOf(h.lib, h).some(q => q.t === 'inside') && views[h.uid]); if (!blobs.length) return tip('Add a 🫧 goo body first (Ooze body type, or Build › Torsos › 🫧 Ooze)', 3000);
  const wp = new THREE.Vector3(); views[pt.uid].G.getWorldPosition(wp); const goo = blobs.sort((a, b) => views[a.uid].G.getWorldPosition(new THREE.Vector3()).distanceTo(wp) - views[b.uid].G.getWorldPosition(new THREE.Vector3()).distanceTo(wp))[0];
  const free = plugsOf(goo.lib, goo).filter(q => q.t === 'inside' && !P.parts.some(o => o.host && o.host.u === goo.uid && o.host.k === q.id)); if (!free.length) return tip('The goo is full — make it bigger or add another goo body');
  snap(); const tw = twinOf(pt); if (tw) { removeParts([tw]); pt.twin = null; } pt.host = {u: goo.uid, k: free[0].id}; pt.ps = .9; pt.dep = 0; seat(pt); buildPart(pt); outliner(); saveCur(); v3PaintUI(); tip('🫥 Swallowed! Use Depth, Digested and 🖐 Breakout', 2600); }
function digest(pt, a) { pt.dig = a; if (!pt.digMat) pt.digMat = pt.matAll || '_'; if (a > .66) pt.matAll = 'bonedirty'; else pt.matAll = pt.digMat === '_' ? null : pt.digMat; pt.fade = a > .05 ? {amt: Math.min(.85, a * .9), dust: false, style: 'dust'} : null; buildPart(pt); saveCur(); }
// ---- 🤖 mech it: swap a part for a mech part made for the same slot (kept fit), else give it a machine skin. ↩ brings the old part back
const MECH_SRC = {head: ['Mech Heads'], torso: ['Mech Torso & Core'], limb: ['Mech Arms & Legs'], hand: ['Mech Arms & Legs'], foot: ['Mech Arms & Legs'], neck: ['Necks & Spines'], tail: ['Tails'], wing: ['Wings'], seg: ['Tails'], jaw: ['Mech Eyes & Faces']};
function mechFor(pt) { const e = LIB[pt.lib], k = kindOf(e); if (!k || k === 'decor') return null; const tag = (boneRow(pt.bone) || [])[4], fam = FAMILY[tag];
  const ok = id => { const x = LIB[id]; if (!x || x.lpv || !MECH_SRC[k]) return false; if (!MECH_SRC[k].includes(x.group)) return false; const xk = kindOf(x); if (xk !== k) return false;
    if (k === 'limb') return fam === 'leg' ? /Legs/.test(x.sub) || /leg/.test(id) : /Arms/.test(x.sub) || /arm/.test(id); if (k === 'neck') return /Mech/.test(x.sub); if (k === 'tail' || k === 'seg') return /mech/i.test(x.name + id); if (k === 'wing') return /Mech/.test(x.sub); return true; };
  const list = Object.keys(LIB).filter(ok); return list.length ? list : null; }
function mechIt(list) { snap(); let n = 0, sk = 0; const done = new Set();
  for (const pt of list) { if (done.has(pt.uid) || pt.mechOf) continue; const t = twinOf(pt); if (t) done.add(t.uid); done.add(pt.uid); const opts = mechFor(pt);
    if (opts) { const pick = opts[(hash(pt.uid) + (pt.mechN || 0)) % opts.length]; const old = {lib: pt.lib, matAll: pt.matAll, mat: pt.mat}; [pt, t].forEach(x => { if (!x) return; x.mechOf = old; x.lib = pick; x.matAll = null; x.mat = null; x.mechN = (x.mechN || 0) + 1; });
      if (pt.fit) { pt.fit.tweaked = false; refitPart(pt, true); } else buildPart(pt); if (t) { t.lib = pick; mirrorInto(pt, t); } n++; }
    else { [pt, t].forEach(x => { if (!x) return; x.mechOf = {lib: x.lib, matAll: x.matAll, mat: x.mat}; x.matAll = /eye|glow/.test(x.lib) ? 'glow' : 'metal'; x.mat = null; buildPart(x); }); sk++; } }
  outliner(); saveCur(); tip('🤖 ' + (n ? n + ' part' + (n > 1 ? 's' : '') + ' swapped for mech parts' : '') + (n && sk ? ', ' : '') + (sk ? sk + ' got a metal skin' : '') + ' — ↩ Undo mech brings them back', 2600); v3PaintUI(); }
function unMech(pt) { if (!pt || !pt.mechOf) return tip('This part was not mech-ed'); snap(); const t = twinOf(pt); [pt, t].forEach(x => { if (!x || !x.mechOf) return; Object.assign(x, x.mechOf); x.mechOf = null; }); if (pt.fit) refitPart(pt, true); else buildPart(pt); if (t) mirrorInto(pt, t); saveCur(); v3PaintUI(); tip('↩ Back to flesh', 1400); }

// ====================================================================== 🧬 mix halves (any front half + any back half), 🔌 make-your-own plugs, 🔗 combine (V3)
function mixBones(front, back) { const A = SKEL[front].bones, B = SKEL[back].bones, under = (bs, root) => { const set = new Set([root]); let more = true; while (more) { more = false; for (const b of bs) if (b[1] && set.has(b[1]) && !set.has(b[0])) { set.add(b[0]); more = true; } } return set; };
  const fa = under(A, 'chest'), fb = under(B, 'chest'), ca = A.find(b => b[0] === 'chest'), cb = B.find(b => b[0] === 'chest'); if (!ca || !cb) return null;
  const off = [cb[2][0] - ca[2][0], cb[2][1] - ca[2][1], cb[2][2] - ca[2][2]], mv = v => [v[0] + off[0], v[1] + off[1], v[2] + off[2]];
  return [...B.filter(b => !fb.has(b[0])), ...A.filter(b => fa.has(b[0])).map(b => [b[0], b[1], mv(b[2]), mv(b[3]), b[4], b[5]])]; }
(() => { const ps = $('p-start'); if (!ps) return; const d = document.createElement('details'); d.className = 'pick'; d.innerHTML = '<summary>🧬 Mix halves (front of one + back of another) ▾</summary><div class="hint">Like a hippogriff: eagle front, horse back. Pick a front, then a back.</div><div class="row"><select id="mxF"></select><select id="mxB"></select><button id="mxGo">🧬 Make it</button></div>';
  ps.append(d); const opts = (window.FORGE_HALVES || []).filter(k => SKEL[k]).map(k => `<option value="${k}">${SKEL[k].name.split(' (')[0]}</option>`).join(''); $('mxF').innerHTML = opts; $('mxB').innerHTML = opts; $('mxB').value = 'quad';
  $('mxGo').onclick = () => { const f = $('mxF').value, b = $('mxB').value, bones = mixBones(f, b); if (!bones) return tip('Those two can\'t be joined'); const k = 'mix_' + f + '_' + b;
    SKEL[k] = {name: 'Mix: ' + SKEL[f].name.split(' (')[0] + ' front + ' + SKEL[b].name.split(' (')[0] + ' back', bones}; if (P.parts.some(p => !p.lib.startsWith('base_')) && !confirm('Start a new mixed body? (Save first if you want to keep this one)')) return;
    snap(); P = blankProject(k); rebuildSkeleton(); buildBase(); rebuildParts(); outliner(); applyFX(); bodyUI(); skelUI(); saveCur(); frameAll(); tip('🧬 ' + SKEL[k].name + ' — 🎓 Build together works on it too', 3000); }; })();
// a project that was built on a mixed body keeps its bones; re-register the mixed body type on load
if (P && P.skel && P.skel.startsWith('mix_') && !SKEL[P.skel]) SKEL[P.skel] = {name: 'Mixed body', bones: P.bones};

// 🔌 Add plug here: tap the picked part where something should plug in (your own plugs, kept on this part and on parts you 💾 save from the Workshop)
const PLUG_TYPES = ['any', 'eye', 'horn', 'ear', 'teeth', 'fang', 'finger', 'claw', 'toe', 'back', 'tailtip', 'face', 'mouth', 'inside', 'glow', 'weapon', 'combine', 'antenna', 'crest', 'mane'];
let plugTap = false;
canvas.addEventListener('pointerdown', e => { if (!plugTap) return; const pt = partBy(sel), v = pt && views[pt.uid]; if (!v) return; const h = cast(e.clientX, e.clientY, v.meshes); if (!h) return tip('Tap on the picked part', 1500);
  e.stopImmediatePropagation(); e.preventDefault(); plugTap = false; const t = prompt('What plugs in here?\n' + PLUG_TYPES.join(', '), 'any'); if (!t) return; v.M.updateMatrixWorld(true);
  const p = v.M.worldToLocal(h.point.clone()), n = h.face ? h.face.normal.clone() : new THREE.Vector3(0, 1, 0); snap(); pt.plugs = pt.plugs || []; const id = 'my' + (pt.plugs.length + 1);
  pt.plugs.push({id, t: PLUG_TYPES.includes(t.trim()) ? t.trim() : 'any', p: r3(p), d: r3(n), o: 'out', s: .6, mine: 1}); const tw = twinOf(pt); if (tw) tw.plugs = pt.plugs.map(q => ({...q})); saveCur(); showPlugs(true); setTimeout(() => { if (!plugAlways) clearDots(); }, 2500);
  tip('🔌 Plug added (' + pt.plugs[pt.plugs.length - 1].t + ') — drag parts onto it', 2400); }, true);
// 🔗 combine: plug a whole saved creature (or mech) into a 🔌 combine plug on this one — mechs lock together into a giant
async function combineUI() { let all = []; try { all = await idbAll('projects'); } catch (x) {} if (!all.length) return tip('Save a creature or mech first (⋯ › Save as), then combine it here', 3200);
  const names = all.map(([n]) => n), pick = prompt('Which saved one plugs in?\n' + names.map((n, i) => (i + 1) + '. ' + n).join('\n'), '1'); const rec = all[(+pick || 0) - 1]; if (!rec) return;
  const keep = JSON.stringify(P), other = JSON.parse(rec[1]); const pcs = [];
  try { P = other; rebuildSkeleton(); rebuildParts(); skelRoot.updateMatrixWorld(true); for (const pt of P.parts) { const v = views[pt.uid]; if (!v || pt.hidden || pt.boxed) continue; v.meshes.forEach(m => { const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); const mi = m.userData.mi; pcs.push({geo: g, mat: pt.mat && pt.mat[mi] != null ? pt.mat[mi] : (pt.matAll || (pieces(pt.lib, pt.params)[mi] || {}).mat || 'skin')}); }); } }
  finally { P = JSON.parse(keep); rebuildSkeleton(); rebuildParts(); }
  const b = new THREE.Box3(); pcs.forEach(p => { p.geo.computeBoundingBox(); b.union(p.geo.boundingBox); }); const c = b.getCenter(new THREE.Vector3()); pcs.forEach(p => p.geo.translate(-c.x, -b.min.y, -c.z));
  const id = 'cmb:' + rec[0].replace(/\W+/g, '_'); LIB[id] = {id, group: 'My Parts', sub: '🔗 Combined', name: '🔗 ' + rec[0], mine: true, tags: ['combine'], plugAs: 'combine', src: 'Your saved creature', make: () => pcs.map(p => ({geo: p.geo.clone(), mat: p.mat}))}; delete autoCache[id];
  const c2 = scenePlugs('combine').find(q => !q.used); if (c2) { snap(); const pt = plugIn(id, c2, {twin: false}); select(pt.uid); outliner(); saveCur(); tip('🔗 ' + rec[0] + ' combined!', 2200); }
  else { addPart(id, (P.bones.find(r => r[4] === 'chest') || P.bones[0])[0], [0, 0, 0], [0, 0, 0], 1); tip('No 🔌 combine plug free — add one with 🔌 Add plug here (type: combine), then drag it there', 3600); } }
(() => { const row = $('copyRow'); if (!row) return; const r = document.createElement('div'); r.className = 'row'; r.innerHTML = '<button id="bAddPlug">🔌 Add plug here</button><button id="bCombine">🔗 Combine a saved one</button><button id="bUnplug">⏏ Unplug</button>'; row.after(r);
  $('bAddPlug').onclick = () => { if (!sel) return tip('Pick a part first'); plugTap = true; tip('Tap the picked part where the plug goes', 3000); };
  $('bCombine').onclick = combineUI; $('bUnplug').onclick = () => { const pt = partBy(sel); if (!pt || !pt.host) return tip('This part is not plugged in'); snap(); V3X.unplug(pt); saveCur(); }; })();
// Workshop 💾 Save part keeps your plugs (in the saved part's space) + asks what it plugs into
const _reg = registerMine; registerMine = function (rec) { if (V3X.pendingPlugs && !rec.plugs) { rec.plugs = V3X.pendingPlugs.map(q => ({...q, p: [q.p[0], q.p[1] - rec.base[1], q.p[2]]})); rec.plugAs = V3X.pendingAs || null; V3X.pendingPlugs = null; idb('myparts', 'readwrite', st => st.put(rec, rec.id)); }
  _reg(rec); if (rec.plugs) LIB[rec.id].plugs = rec.plugs; if (rec.plugAs) LIB[rec.id].plugAs = rec.plugAs; };
(() => { const b = $('bSaveAsset'); if (!b) return; const old = b.onclick; b.onclick = async () => { const pl = []; skelRoot.updateMatrixWorld(true);
    for (const pt of P.parts) { const v = views[pt.uid]; if (!v || pt.hidden || !pt.plugs) continue; for (const q of pt.plugs) { const w = new THREE.Vector3(...q.p).applyMatrix4(v.M.matrixWorld), d = new THREE.Vector3(...q.d).transformDirection(v.M.matrixWorld); pl.push({...q, p: r3(w), d: r3(d)}); } }
    V3X.pendingPlugs = pl.length ? pl : null; const as = prompt('Does this part plug into something? (leave empty = no)\n' + PLUG_TYPES.slice(1).join(', '), ''); V3X.pendingAs = as && as.trim() || null; if (V3X.pendingAs && !V3X.pendingPlugs) V3X.pendingPlugs = [];
    await old(); }; })();

// ====================================================================== 🔷 low-poly that looks good (V3): flat facets + a little colour per facet, low-poly twins for kit parts too
// every low-poly part (🔷 low-poly parts, 🔷 Low-poly look, or parts marked facet) is shown with flat facets; each facet gets a slightly different shade, like polygon art
const facetCache = new Map();
function facetGeo(g, amt) { const key = g.uuid + '|' + amt; if (facetCache.has(key)) return facetCache.get(key); const n = g.index ? g.toNonIndexed() : g.clone(); n.computeVertexNormals();
  const p = n.attributes.position, col = new Float32Array(p.count * 3);
  for (let t = 0; t < p.count; t += 3) { const cx = (p.getX(t) + p.getX(t + 1) + p.getX(t + 2)) * 7.31, cy = (p.getY(t) + p.getY(t + 1) + p.getY(t + 2)) * 3.17, cz = (p.getZ(t) + p.getZ(t + 1) + p.getZ(t + 2)) * 5.03;
    const h = Math.abs(Math.sin(cx * 12.9898 + cy * 78.233 + cz * 37.719) * 43758.5453) % 1, v = 1 - amt / 2 + h * amt; for (let k = 0; k < 3; k++) col.set([v, v, v], (t + k) * 3); }
  n.setAttribute('color', new THREE.BufferAttribute(col, 3)); n.userData.low = true; if (facetCache.size > 600) facetCache.delete(facetCache.keys().next().value); facetCache.set(key, n); return n; }
let facetAmt = .22; try { const v = localStorage.getItem('mf-facet'); if (v != null) facetAmt = +v; } catch (x) {}
const _post = V3X.post; V3X.post = pt => { _post(pt); const v = views[pt.uid], e = LIB[pt.lib]; if (!v || !e || colorMode) return; if (!(e.lpv || e.facet || P.fx.lowpoly) || pt.sculpt || pt.vpaint || pt.layer || (pt.layerX && pt.layerX.some(Boolean))) return;
  v.meshes.forEach(m => { if (m.userData.mi == null || !m.geometry.attributes.position) return; const mk = (m.material.userData || {}).key || ''; const fxm = mk === 'glow' || (MATS.LIST.find(l => l[0] === mk) || [])[7] && (MATS.LIST.find(l => l[0] === mk)[7].fx || MATS.LIST.find(l => l[0] === mk)[7].emissive);
    if (fxm) { m.geometry = facetGeo(m.geometry, 0); return; } m.geometry = facetGeo(m.geometry, facetAmt); const c = m.material.clone(); c.onBeforeCompile = m.material.onBeforeCompile; c.customProgramCacheKey = m.material.customProgramCacheKey; c.vertexColors = true; c.flatShading = true; c.needsUpdate = true; m.material = c; }); };
// low-poly twins for the kit parts made with sliders, and hand-made polygon-art twins for the jellyfish
for (const id of Object.keys(LIB)) { const e = LIB[id]; if (!e.params || !e.makeP || e.lpv || e.hasLpv || !(e.tags || []).includes('kit')) continue;
  LIB['lpv_' + id] = {...e, id: 'lpv_' + id, name: e.name + ' (low-poly)', lpv: id, tags: [...(e.tags || []), 'low poly'], makeP: q => pieces(id, q).map(pc => ({geo: lowpolyGeo(pc.geo, 2), mat: pc.mat, num: pc.num})), make: () => pieces(id).map(pc => ({geo: lowpolyGeo(pc.geo, 2), mat: pc.mat, num: pc.num})), _p: undefined}; e.hasLpv = 'lpv_' + id; }
for (const [a, b] of [['kj_bell', 'kj_bell_lp'], ['kj_tentacle', 'kj_ribbon_lp'], ['kj_oral', 'kj_oral_lp']]) if (LIB[a] && LIB[b]) { LIB[a].hasLpv = b; }
// 🔷 facet shading slider (View tab › Low-poly look row)
(() => { const b = $('bLowLook'); if (!b) return; const r = document.createElement('div'); r.className = 'row'; r.innerHTML = '<span class="hint" style="margin:0">🔷 Facet shading</span><input type="range" id="sFacet" min="0" max=".5" step=".02" style="flex:1">'; b.parentElement.after(r);
  $('sFacet').value = facetAmt; $('sFacet').oninput = e => { facetAmt = +e.target.value; try { localStorage.setItem('mf-facet', facetAmt); } catch (x) {} rebuildParts(); }; })();

// ====================================================================== 🌋 Element on any part (V3): swaps the skin + grows element bits on the part (flames, rocks, crystals, leaves, ice, lightning, stars...)
const ELEM = {lava: {n: '🌋 Lava', mat: 'lavacrack', bits: [['rock', 'lavarock', .5], ['flame', 'fire', .35]]}, stone: {n: '🪨 Stone', mat: 'stone', bits: [['rock', 'stone', .6]]}, crystal: {n: '💎 Crystal', mat: 'stone', bits: [['shard', 'gemgreen', .55]]},
  forest: {n: '🌳 Forest', mat: 'bark3', bits: [['leaf', 'leaf', .55], ['vine', 'moss', .25]]}, water: {n: '🌊 Water', mat: 'ocean', bits: [['drop', 'waterclear', .4], ['swirl', 'foam', .25]]}, fire: {n: '🔥 Fire', mat: 'fire', bits: [['flame', 'fire', .6]]},
  ice: {n: '🧊 Ice', mat: 'ice', bits: [['shard', 'ice', .55]]}, wind: {n: '🌪 Wind', mat: 'fog', bits: [['swirl', 'fogdense', .5]]}, storm: {n: '⛈ Storm', mat: 'stormcloud', bits: [['bolt', 'lightning', .4], ['puff', 'stormcloud', .4]]},
  cosmic: {n: '🌌 Cosmic', mat: 'galaxy', bits: [['star', 'glow', .45], ['star', 'glowblue', .25]]}, gold: {n: '👑 Gold', mat: 'goldpolished', bits: [['shard', 'goldpolished', .3]]}, sand: {n: '🏜 Sand', mat: 'sand', bits: [['puff', 'sandstorm', .3]]},
  void: {n: '🕳 Void', mat: 'void', bits: [['star', 'glowpurple', .35]]}, steam: {n: '♨ Steam', mat: 'muscle', bits: [['puff', 'fog', .45]]}};
const bitGeo = {}; function bitG(k) { if (bitGeo[k]) return bitGeo[k]; const V = (x, y, z) => new THREE.Vector3(x, y, z); let g;
  if (k === 'rock') g = new THREE.DodecahedronGeometry(.5, 0).scale(1, .7, 1).translate(0, .15, 0);
  else if (k === 'flame') g = K.taper(K.bez(V(0, 0, 0), V(.2, .6, 0), V(-.1, 1.4, .05)), .32, .01, 10, 7);
  else if (k === 'shard') g = new THREE.ConeGeometry(.22, 1.3, 5).translate(0, .6, 0);
  else if (k === 'leaf') g = new THREE.IcosahedronGeometry(.5, 0).scale(1, .45, .8).translate(0, .2, 0);
  else if (k === 'vine') g = K.taper(K.bez(V(0, 0, 0), V(.4, .3, .2), V(.8, .1, .5)), .06, .02, 10, 5);
  else if (k === 'drop') g = new THREE.SphereGeometry(.22, 8, 6).scale(1, 1.4, 1).translate(0, .4, 0);
  else if (k === 'swirl') g = new THREE.TorusGeometry(.45, .07, 5, 18, Math.PI * 1.4).rotateX(Math.PI / 2).translate(0, .3, 0);
  else if (k === 'bolt') { const pts = []; for (let i = 0; i <= 6; i++) pts.push(V((i % 2 ? .25 : -.25) * (1 - i / 8), i * .3, (i % 3 - 1) * .15)); g = K.taper(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0), .06, .015, 24, 5); }
  else if (k === 'puff') g = new THREE.IcosahedronGeometry(.55, 1).translate(0, .25, 0);
  else g = new THREE.OctahedronGeometry(.18, 0).scale(.5, 2.2, .5).translate(0, .3, 0);   // star sparkle
  return bitGeo[k] = g; }
function elemBits(pt, v) { const el = ELEM[pt.elem]; if (!el) return; const S = samples(pt.lib, pt.params); if (!S.pts.length) return; const b = partBoxOf(pt.lib, pt.params), diag = b.getSize(new THREE.Vector3()).length(); let seed = hash(pt.uid) || 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const G = new THREE.Group(); G.userData.elem = 1;
  for (const [kind, mat, dens] of el.bits) { const n = Math.round(Math.min(40, Math.max(3, diag * 5 * dens))), gs = [];
    for (let i = 0; i < n; i++) { const j = Math.floor(rnd() * S.pts.length), p = S.pts[j], nn = S.nrm[j].clone().normalize(); if (kind === 'flame' && nn.y < -.2) continue; const g = bitG(kind).clone(), s = diag * .07 * (.6 + rnd() * .8);
      g.scale(s, s, s); g.rotateY(rnd() * 6.28); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), nn)); g.translate(p.x - nn.x * s * .1, p.y - nn.y * s * .1, p.z - nn.z * s * .1); const ng = g.index ? g.toNonIndexed() : g; ng.computeVertexNormals(); const q = new THREE.BufferGeometry(); q.setAttribute('position', ng.attributes.position); q.setAttribute('normal', ng.attributes.normal); gs.push(q); }
    if (!gs.length) continue; const m = new THREE.Mesh(mergeGeometries(gs), matFor(mat, pt.tint, pt.tile)); m.raycast = () => {}; G.add(m); }
  v.M.add(G); }
const _post2 = V3X.post; V3X.post = pt => { _post2(pt); const v = views[pt.uid]; if (v && pt.elem && !colorMode) try { elemBits(pt, v); } catch (x) { console.warn('elem', x); } };
function setElem(list, k) { snap(); for (const pt of list) for (const x of [pt, twinOf(pt)]) { if (!x) continue; if (k) { if (x.elemPrev === undefined) x.elemPrev = x.matAll || null; x.elem = k; x.matAll = ELEM[k].mat; x.mat = null; } else { x.elem = null; if (x.elemPrev !== undefined) { x.matAll = x.elemPrev; delete x.elemPrev; } } buildPart(x); } saveCur(); }
V3X.setElem = setElem;
// ⭐ default builds: elements, skins and god pieces (crown, halo, robe, hood, big eye, collar, weapon, belly maw, shackles, chains) from FORGE_DEF3 '_' keys
const famKey = pt => { const r = boneRow(pt.bone); if (!r) return 'trunk'; const f = FAMILY[r[4]] || 'trunk', side = pt.bone.endsWith('.L') ? '.L' : pt.bone.endsWith('.R') ? '.R' : ''; return [f + side, f]; };
// extras for the older body types (same '_' keys as FORGE_DEF3): the centaur's human upper body, the angel's halo
const EXTRA = {centaur: {_seg: [['kl_torso_human', 'torso']]}, angel: {_halo: 'kg_halo'}};
V3X.afterDefault = k => { const d0 = (window.FORGE_DEF3 || {})[k], d = d0 || EXTRA[k] ? {...(d0 || {}), ...(EXTRA[k] || {})} : null; if (!d) return; if (P.fin === k) return; P.fin = k;   // once per creature (Build together calls it too when the part steps are done)
  for (const [id, bn] of d._seg || []) if (LIB[id] && boneRow(bn) && !P.parts.some(p => p.lib === id)) { const mm = mirrorAdd; mirrorAdd = false; V3X.skip = true; addPart(id, bn, [0, 0, 0], [0, 0, 0]); V3X.skip = false; mirrorAdd = mm; const np = P.parts[P.parts.length - 1]; if (np && np.lib === id) V3X.theme([np.uid]); } if (d._tailEnd) { const [id, n] = d._tailEnd, tb = P.bones.filter(r => r[4] === 'tail'), ends = tb.filter(r => !tb.some(q => q[1] === r[0])); if (LIB[id] && !P.parts.some(p => p.lib === id)) for (const e0 of ends) { let r = e0; for (let i = 0; i < n && r && r[4] === 'tail'; i++) { if (!tb.some(q => q[0] === r[1])) break; const mm = mirrorAdd; mirrorAdd = false; V3X.skip = true; addPart(id, r[0], [0, 0, 0], [0, 0, 0]); V3X.skip = false; mirrorAdd = mm; const np = P.parts[P.parts.length - 1]; if (np && np.lib === id) V3X.theme([np.uid]); r = boneRow(r[1]); } } }
  // _swap: {bone: [from, to]} gives one head bone a different head (the chimera's goat head). The jaw follows; manes and sabre fangs come off that head
  const swapped = []; for (const [bn, [from, to]] of Object.entries(d._swap || {})) { const hp = P.parts.find(p => p.bone === bn && p.lib === from); if (!hp || !LIB[to]) continue; hp.lib = to; hp.mat = null;
    const jaw = P.parts.find(p => p.host && p.host.u === hp.uid && p.lib === from + '_jaw'); if (jaw && LIB[to + '_jaw']) { jaw.lib = to + '_jaw'; jaw.mat = null; }
    const kids = P.parts.filter(p => p.host && (p.host.u === hp.uid || (jaw && p.host.u === jaw.uid)) && p !== jaw), drop = kids.filter(p => /kp_mane_|kp_fang_saber|kp_ear_/.test(p.lib)); if (drop.length) removeParts(drop);
    swapped.push(hp, jaw, ...kids.filter(p => !drop.includes(p))); }
  if (swapped.length) { rebuildParts(); swapped.filter(Boolean).forEach(p => { if (p.host) seat(p); }); V3X.theme(swapped.filter(Boolean).map(p => p.uid)); }
  const main = P.parts.filter(p => !p.host || /^(back|tailtip|jaw|finger|toe|ear|claw)$/.test((plugsOf((partBy(p.host.u) || {}).lib || '', partBy(p.host.u)).find(q => q.id === p.host.k) || {}).t || ''));
  const pick = (map, pt) => { if (typeof map === 'string') return map; const [a, b] = famKey(pt); return map[a] ?? map[b] ?? map.all; };
  if (d._mat) for (const pt of P.parts) { const m = pick(d._mat, pt); if (m && !(LIB[pt.lib] && /eye|Weapons/.test(LIB[pt.lib].group + (LIB[pt.lib].plugAs || '')))) { pt.matAll = m; pt.mat = null; } }
  if (d._elem) for (const pt of main) { const e = pick(d._elem, pt); if (e && ELEM[e]) { pt.elemPrev = pt.matAll || null; pt.elem = e; pt.matAll = ELEM[e].mat; pt.mat = null; } }
  const m = mirrorAdd; mirrorAdd = true; const headB = (P.bones.find(r => r[4] === 'head') || [])[0], chestB = (P.bones.find(r => r[4] === 'chest') || [])[0], hipsB = (P.bones.find(r => r[0] === 'hips') || P.bones[0])[0], neckB = (P.bones.find(r => r[4] === 'neck') || [])[0];
  const plugAll = (id, type) => { if (id && LIB[id]) V3X.fillAll(id, type); };
  plugAll(d._bigeye, 'bigeye'); plugAll(d._crown, 'crown'); plugAll(d._halo, 'mane'); plugAll(d._belly, 'belly');
  const deco = (id, bone) => { if (id && LIB[id] && bone) { V3X.skip = true; const mm = mirrorAdd; mirrorAdd = false; addPart(id, bone, [0, 0, 0], [0, 0, 0], LIB[id].ownSize || undefined); mirrorAdd = mm; V3X.skip = false; } };
  deco(d._hood, headB); deco(d._robe, hipsB); deco(d._neck, neckB); deco(d._chains, chestB);
  if (d._shackles) for (const r of P.bones.filter(r => r[4] === 'hand' && !r[0].endsWith('.L'))) { V3X.skip = true; addPart(d._shackles, r[0], [0, 0, 0], [0, 0, 0]); V3X.skip = false; }
  if (d._weapon) { const h = P.bones.find(r => r[4] === 'hand' && r[0].endsWith('.R')); if (h) addWeaponToPalm(d._weapon, h[0]); }
  mirrorAdd = m; rebuildParts(); };
// 🌋 Element row in the Paint tab panel
const _v3p = v3PaintUI; v3PaintUI = function () { _v3p(); const el = $('v3paint'), pt = partBy(sel); if (!el || !pt) return; const h = document.createElement('div'); h.className = 'step'; h.innerHTML = '🌋 <b>Element</b> — make ' + (paintAll ? 'every part' : 'this part') + ' out of an element (mix them: lava head, water arm…)'; el.prepend(h);
  const r = document.createElement('div'); r.className = 'row'; r.style.flexWrap = 'wrap'; h.after(r); const list = () => paintAll ? P.parts.filter(p => !p.boxed && !p.host) : [pt];
  r.append(Object.assign(document.createElement('button'), {textContent: '🚫 None', className: pt.elem ? '' : 'on', onclick: () => { setElem(list(), null); v3PaintUI(); }}));
  for (const [k, e] of Object.entries(ELEM)) r.append(Object.assign(document.createElement('button'), {textContent: e.n, className: pt.elem === k ? 'on' : '', onclick: () => { setElem(list(), k); v3PaintUI(); tip(e.n + (paintAll ? ' on everything' : ''), 1400); }})); };

// ====================================================================== 🐊 stance switch (Nov 9 late): body types that share bone names (SKEL[k].stance = the other key)
// One creature, two poses: every bone moves to the other body type's place, fitted parts refit, plugged parts follow. Parts moved by hand keep their place on their bone.
V3X.stance = () => { const cur = SKEL[P.skel], to = cur && cur.stance; if (!to || !SKEL[to]) return false; snap();
  const nb = detailBones(JSON.parse(JSON.stringify(SKEL[to].bones))), names = new Set(nb.map(b => b[0])), fb = (nb.find(b => b[4] === 'chest') || nb[0])[0];
  P.parts.forEach(p => { if (p.bone && !names.has(p.bone)) p.bone = fb; if (p.fit && p.fit.drop && !names.has(p.fit.drop)) p.fit.drop = p.bone; });
  if (P.fin === P.skel) P.fin = to; P.skel = to; P.bones = nb; P.pose = {}; P.bodyBase = null; P.body = {};
  rebuildSkeleton(); if (P.parts.length) { refitAll(false); if (hasBase()) buildBase(); } else buildBase(); rebuildParts(); skelUI(); bodyUI(); outliner(); saveCur(); frameAll();
  tip((SKEL[to].name || '').replace(/^\S+\s/, '') + ' — same creature, other stance. Tap again to switch back.', 2600); return true; };
{ const sync = () => { const s = SKEL[P.skel], on = !!(s && s.stance && SKEL[s.stance]); for (const id of ['bStance', 'bStanceV']) { const b = $(id); if (!b) continue; b.style.display = on ? '' : 'none'; if (on) b.textContent = id === 'bStanceV' ? (s.stanceName || '🔁 Other stance') : '🔁 ' + (s.stanceName || 'Other stance').replace(/^\S+\s/, '') + ' (same creature)'; } };
  const _ol = outliner; outliner = function (...a) { const r = _ol.apply(this, a); try { sync(); } catch (x) {} return r; };
  for (const id of ['bStance', 'bStanceV']) if ($(id)) $(id).onclick = () => V3X.stance(); sync(); }

// ====================================================================== 🦶 raised ankles (looks round 2): a kit foot on a foot bone whose ankle is high off the ground (dinosaur, bird legs)
// sits at the toe end of that bone (fitPart, `fit.digi`); the bone itself gets a limb segment (the long foot bone between ankle and toes), so the foot is not left floating under the shin.
{ const _aa = V3X.afterAdd; let busy = false; V3X.afterAdd = pt => { _aa(pt); if (busy || !pt.fit || !pt.fit.digi || mainOnChain(pt.bone)) return; const par = (boneRow(pt.bone) || [])[1], up = par && P.parts.find(p => p.bone === par && p.fit && p.fit.kind === 'seg' && LIB[p.lib] && LIB[p.lib].perSeg && !p.boxed);
    const id = up ? ((LIB[up.lib].segBy || {}).legL || up.lib) : 'kl_limb_scaly_low'; if (!LIB[id]) return; busy = true; const mm = mirrorAdd, sel0 = sel; mirrorAdd = false; V3X.skip = true;
    try { addPart(id, pt.bone, [0, 0, 0], [0, 0, 0]); const np = P.parts[P.parts.length - 1]; if (np && np.lib === id) { if (up && up.mat) { np.mat = [...up.mat]; buildPart(np); } else V3X.theme([np.uid]); } } finally { V3X.skip = false; mirrorAdd = mm; busy = false; } if (sel0) select(sel0); }; }
function mainOnChain(bone) { return P.parts.some(p => p.bone === bone && p.fit && p.fit.kind === 'seg' && !p.boxed && !p.lib.startsWith('base_')); }

// ====================================================================== 🌫 Shadow version (Nov 10 2026): the whole creature as drifting shadow mist, eyes left glowing. Tap again to get the skins back.
V3X.shadowAll = () => { snap(); const on = !P.fx.shadow; let n = 0;
  for (const pt of P.parts) { const e = LIB[pt.lib]; if (!e) continue; const eye = /eye/i.test((e.plugAs || '') + ' ' + e.id), keep = e.group === 'Weapons';
    if (on) { if (keep) continue; pt.shPrev = {a: pt.matAll || null, m: pt.mat ? [...pt.mat] : null}; pt.matAll = eye ? 'glowpurple' : 'shadowmist'; pt.mat = null; n++; }
    else if (pt.shPrev) { pt.matAll = pt.shPrev.a; pt.mat = pt.shPrev.m; delete pt.shPrev; n++; } }
  P.fx.shadow = on ? 1 : 0; rebuildParts(); saveCur(); V3X.shadowUI(); tip(on ? '🌫 Shadow version: ' + n + ' parts turned to drifting shadow (tap again to bring the skins back)' : 'Skins are back', 2600); };
V3X.shadowUI = () => { const b = $('bShadowAll'); if (b) { b.textContent = P.fx && P.fx.shadow ? '🌫 Shadow version: ON (tap for skins)' : '🌫 Shadow version (whole creature)'; b.classList.toggle('on', !!(P.fx && P.fx.shadow)); } };
if ($('bPaintAll')) { const b = Object.assign(document.createElement('button'), {id: 'bShadowAll', onclick: () => V3X.shadowAll()}); $('bPaintAll').parentNode.append(b); V3X.shadowUI(); setInterval(V3X.shadowUI, 1500); }


// ====================================================================== 🧭 Modes (T035, Nov 13 2026): Mythic Forge is a general builder. Start › "What are you making?": ✨ Blank (default, T040), 🐾 Creature, 🧑 Character, 🪑 Prop, 🦖 Titan.
// Data + list filters live in modes.js (window.mfModeHas / mfGroupOk / mfPartOk). A mode only hides things in lists; search still finds every part.
// Each project remembers its mode (P.mode). Old saves have none: they open in the mode that fits their body type (window.mfModeOf).
// 🦖 Titan mode also shows: kaiju + mech body types, mech kits + mech weapons, a 📏 person for scale (1.8 m, not exported), and ⋯ › 🦖 Export for Titan Clash.
{ const MD = window.MF_MODES || {}; let lastP = null, buddy = null;
  const wrap = Object.assign(document.createElement('div'), {id: 'modeBox'}); wrap.style.cssText = 'margin:2px 0 8px;padding:6px;border:1px solid #4c4c58;border-radius:10px';
  const ps = $('p-start'); if (ps) ps.prepend(wrap);
  const tcBtn = Object.assign(document.createElement('button'), {id: 'mExportTC', textContent: '🦖 Export for Titan Clash (.glb)', onclick: () => { window.__tcExport = true; $('mExport').click(); }});
  if ($('mExport')) $('mExport').after(tcBtn);
  function buddyOn(on) { if (!on) { if (buddy) buddy.visible = false; return; }
    if (!buddy) { buddy = new THREE.Group(); buddy.name = 'scaleBuddy'; const m = new THREE.MeshStandardMaterial({color: 0xb8b8c4, roughness: .8});
      const body = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, .3, 10), m); body.position.y = .15; const head = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 10), m); head.position.y = .36;
      buddy.add(body, head); scene.add(buddy); }   // a titan is about 11 units tall (about 50 m), so a 1.8 m person is about 0.4 units
    const bx = new THREE.Box3().setFromObject(skelRoot); buddy.position.set(isFinite(bx.max.x) ? bx.max.x + .5 : 3, isFinite(bx.min.y) ? Math.max(0, bx.min.y) : 0, isFinite(bx.max.z) ? (bx.min.z + bx.max.z) / 2 + .6 : 1); buddy.visible = true; }
  function ui() { const cur = window.mfMode ? window.mfMode() : 'blank'; wrap.innerHTML = '';
    wrap.append(Object.assign(document.createElement('div'), {className: 'lbl', textContent: 'What are you making?'}));
    const seg = Object.assign(document.createElement('div'), {className: 'chips wrap', id: 'modeSeg'}); for (const [m, d] of Object.entries(MD)) { const b = Object.assign(document.createElement('button'), {textContent: d.name, className: m === cur ? 'on' : ''}); b.dataset.mode = m; b.onclick = () => window.mfSetMode(m, true); seg.append(b); } wrap.append(seg);
    wrap.append(Object.assign(document.createElement('div'), {className: 'hint', textContent: (MD[cur] || {}).hint || ''}));
    const r = Object.assign(document.createElement('div'), {className: 'row'});
    if (cur === 'prop' || cur === 'blank') r.append(Object.assign(document.createElement('button'), {id: 'bModeEmpty', textContent: cur === 'prop' ? '📦 Start a new prop (no skeleton)' : '✨ Start empty (no skeleton)', onclick: () => { if (P.parts.some(p => !p.lib.startsWith('base_')) && !confirm('Start empty? What is on screen is replaced (save first if you want to keep it).')) return; snap(); P = blankProject('none'); rebuildSkeleton(); rebuildParts(); outliner(); applyFX(); bodyUI(); skelUI(); saveCur(); frameAll(); tip(cur === 'prop' ? '📦 New prop: drag shapes, gear and magic items from 🧩 Build' : '✨ Empty: drag in anything from 🧩 Build', 2600); }}));
    if (cur === 'titan') r.append(Object.assign(document.createElement('button'), {id: 'bScaleBuddy', textContent: '📏 Person for scale: ' + (localStorage.getItem('mf-buddy') === '0' ? 'off' : 'on'), onclick: () => { try { localStorage.setItem('mf-buddy', localStorage.getItem('mf-buddy') === '0' ? '1' : '0'); } catch (x) {} ui(); }}));
    else { const on = window.mfTitanExportShown && window.mfTitanExportShown(); r.append(Object.assign(document.createElement('button'), {id: 'bTcAll', textContent: '🦖 Titan Clash export in every mode: ' + (on ? 'on' : 'off'), onclick: () => { try { localStorage.setItem('mf-tc-all', on ? '0' : '1'); } catch (x) {} ui(); }})); }
    if (r.children.length) wrap.append(r);
    tcBtn.style.display = window.mfTitanExportShown && window.mfTitanExportShown() ? '' : 'none';
    let bOn = false; try { bOn = cur === 'titan' && localStorage.getItem('mf-buddy') !== '0'; } catch (x) {} buddyOn(bOn); }
  function relist() { skelUI(); if (window.__mfDefUI) window.__mfDefUI(); try { if (!window.mfGroupOk(gFilter)) { gFilter = GROUP_ORDER.find(g => window.mfGroupOk(g) && Object.values(LIB).some(e => e.group === g)) || gFilter; sFilter = null; } } catch (x) {} libUI(); ui(); }
  // user picks a mode: lists change, and the creature on screen is marked with it (nothing on it is removed)
  window.mfSetMode = (m, user) => { if (!window.mfSetModeRaw(m)) return; if (user && P) { P.mode = m; saveCur(); } relist(); if (user) tip((MD[m] || {}).name + ' mode: ' + ((MD[m] || {}).hint || ''), 2600); };
  // a project opened (save, starter, paste, undo): old saves get the mode of their body type; the app follows the project's mode
  const watch = () => { if (P === lastP) return; lastP = P; if (!P) return; if (!P.mode || !MD[P.mode]) P.mode = window.mfModeOf(P.skel);
    if (P.mode !== window.mfMode()) { window.mfSetModeRaw(P.mode); relist(); } else ui(); };
  watch(); setInterval(watch, 400);
  window.__mode = {set: (m, u) => window.mfSetMode(m, u), cur: () => window.mfMode(), of: k => window.mfModeOf(k), buddy: () => !!(buddy && buddy.visible), tc: () => tcBtn.style.display !== 'none'}; }
