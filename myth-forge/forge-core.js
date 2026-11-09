import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ====================================================================== basics
const $ = id => document.getElementById(id);
const K = window.makeK(THREE), MATS = window.FORGE_MATS, SKEL = window.FORGE_SKEL, D = Math.PI / 180;
const tip = (t, ms = 2200) => { $('tip').textContent = t; clearTimeout(tip._t); tip._t = setTimeout(() => $('tip').textContent = '', ms); };
const canvas = $('c'), renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
const scene = new THREE.Scene();
{ // studio reflections: bright soft-box panels so chrome and metal shine
  const es = new THREE.Scene(), c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#dfe8ff'); g.addColorStop(.45, '#8a93a8'); g.addColorStop(.55, '#3a3d48'); g.addColorStop(1, '#16161c'); x.fillStyle = g; x.fillRect(0, 0, 512, 256);
  x.fillStyle = '#ffffff'; x.fillRect(60, 40, 90, 50); x.fillRect(300, 30, 140, 40); x.fillStyle = '#9ac8ff'; x.fillRect(200, 95, 60, 30); x.fillStyle = '#ffd0a0'; x.fillRect(440, 90, 50, 40);
  const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
  scene.environment = new THREE.PMREMGenerator(renderer).fromEquirectangular(t).texture; }
const camera = new THREE.PerspectiveCamera(42, 1, .05, 1200);
const controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.target.set(0, 5.5, 0); camera.position.set(20, 12, 31);
const hemi = new THREE.HemisphereLight(0xdde4ff, 0x302820, 1.1), key = new THREE.DirectionalLight(0xffffff, 2.4), rim = new THREE.DirectionalLight(0x9ab8ff, 1.4);
key.position.set(12, 22, 16); rim.position.set(-14, 10, -18); scene.add(hemi, key, rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({color: 0x26262e, roughness: .95}));
const grid = new THREE.GridHelper(40, 40, 0x44444f, 0x2e2e36); grid.position.y = .01; scene.add(floor, grid);
const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), .4, .45, .92); composer.addPass(bloom); composer.addPass(new OutputPass());
let useBloom = true;

// ====================================================================== parts library
const LIB = {}, GROUP_ORDER = ['Basic Shapes & Clay', 'Part Makers (sliders)', 'Heads & Skulls', 'Jaws & Teeth', 'Horns & Crests', 'Eyes & Faces', 'Necks & Spines', 'Torsos & Bellies', 'Arms & Shoulders', 'Hands & Claws',
  'Legs & Feet', 'Tails', 'Wings', 'Back & Armor Plates', 'Tentacles & Extra Limbs', 'Bones & Skeleton', 'Mech Heads', 'Mech Torso & Core', 'Mech Arms & Legs', 'Mech Details', 'Mecha Dragon', 'Kaiju Kit', 'Turtle Kit', 'Weapons', 'Accessories & Magic', 'Free Packs (CC0)', 'My Imports'];
const MY = 'My Parts';
const ALONG = new Set(['Necks & Spines', 'Arms & Shoulders', 'Legs & Feet', 'Tails', 'Wings', 'Tentacles & Extra Limbs', 'Mech Arms & Legs', 'Heads & Skulls', 'Mech Heads', 'Torsos & Bellies', 'Mech Torso & Core', 'Hands & Claws']);
const isAlong = e => e.along != null ? e.along : ALONG.has(e.group) || (e.group === 'Mecha Dragon' && /Head|Neck|Wings|Limbs/.test(e.sub)) || e.id === 'md_chest' || e.id === 'md_belly';
for (const reg of (window.FORGE_PARTS || [])) { try { for (const p of reg(THREE, K)) LIB[p.id] = {...p, src: p.src || 'Made in code for Titan Forge (ours)'}; } catch (e) { console.error('parts file failed', e); } }
const genCache = new Map();
function pieces(id, params) {                                  // cached shared pieces of a library part (makers: per slider setting)
  const e = LIB[id]; if (!e) return [];
  if (params && e.makeP) { const key = id + JSON.stringify(params); if (!genCache.has(key)) { let raw = []; try { raw = e.makeP({...Object.fromEntries(e.params.map(q => [q.k, q.def])), ...params}); } catch (err) { console.error(id, err); }
      genCache.set(key, prep(raw)); if (genCache.size > 60) genCache.delete(genCache.keys().next().value); } return genCache.get(key); }
  if (!e._p) e._p = prep((() => { try { return e.make(); } catch (err) { console.error(id, err); return []; } })());
  return e._p;
}
function prep(raw) { return raw.filter(p => p && p.geo && p.geo.attributes.position && p.geo.attributes.position.count).map(p => { let g = p.geo;
      for (const a of Object.keys(g.attributes)) if (!['position', 'normal'].includes(a)) g.deleteAttribute(a);
      g = mergeVertices(g, 1e-4); g.computeVertexNormals(); return {geo: g, mat: p.mat || 'skin', matObj: p.matObj}; }); }
function piecesOld(id) {
  const e = LIB[id]; if (!e) return [];
  if (!e._p) { let raw = []; try { raw = e.make(); } catch (err) { console.error(id, err); }
    e._p = raw.filter(p => p && p.geo && p.geo.attributes.position && p.geo.attributes.position.count).map(p => { let g = p.geo;
      for (const a of Object.keys(g.attributes)) if (!['position', 'normal'].includes(a)) g.deleteAttribute(a);
      g = mergeVertices(g, 1e-4); g.computeVertexNormals(); return {geo: g, mat: p.mat || 'skin', matObj: p.matObj}; }); }
  return e._p;
}

// ====================================================================== state
const uid = () => Math.random().toString(36).slice(2, 9);
const blankProject = (skel = 'biped') => ({v: 1, name: 'New creature', skel, bones: JSON.parse(JSON.stringify(SKEL[skel].bones)), pose: {}, parts: [], fx: {glow: true, fog: false, mist: false, aura: false, drip: false, col: '#8a2aff', bg: 'studio'}});
let P = blankProject();
try { const s = JSON.parse(localStorage.getItem('titan-forge-cur') || 'null'); if (s && s.v) P = s; } catch (e) {}
const saveCur = () => { try { localStorage.setItem(typeof inWS !== 'undefined' && inWS ? 'titan-forge-ws' : 'titan-forge-cur', JSON.stringify(P)); } catch (e) { tip('Too big for quick save — use ⋯ Save as'); } };
const hist = [], fut = [];
const snap = () => { hist.push(JSON.stringify(P)); if (hist.length > 50) hist.shift(); fut.length = 0; };
function restore(j) { P = JSON.parse(j); rebuildSkeleton(); rebuildParts(); outliner(); syncEdit(); saveCur(); if (typeof boxUI === 'function') boxUI(); }
$('bUndo').onclick = () => { if (!hist.length) return tip('Nothing to undo'); fut.push(JSON.stringify(P)); restore(hist.pop()); };
$('bRedo').onclick = () => { if (!fut.length) return tip('Nothing to redo'); hist.push(JSON.stringify(P)); restore(fut.pop()); };

// ====================================================================== skeleton
const skelRoot = new THREE.Group(); scene.add(skelRoot);
let bones = {}, boneHelpers = [], showBones = true;
const jointMat = new THREE.MeshBasicMaterial({color: 0xff8a3a, depthTest: false, transparent: true, opacity: .6}), stickMat = new THREE.MeshBasicMaterial({color: 0xffd166, depthTest: false, transparent: true, opacity: .28});
const jointSelMat = new THREE.MeshBasicMaterial({color: 0x40ffb0, depthTest: false});
function basisFor(dir, up) {
  if (up) return new THREE.Quaternion();
  const y = dir.clone().normalize(), ref = Math.abs(y.z) > .9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
  const z = ref.sub(y.clone().multiplyScalar(ref.dot(y))).normalize(), x = new THREE.Vector3().crossVectors(y, z);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}
function rebuildSkeleton() {
  skelRoot.clear(); bones = {}; boneHelpers = [];
  const world = {};
  for (const [name, parent, h, t, tag, o0] of P.bones) { const o = o0 || {};
    const head = new THREE.Vector3(...h), tail = new THREE.Vector3(...t), q = basisFor(tail.clone().sub(head), o.up);
    const b = new THREE.Object3D(); b.name = name; b.userData = {tag, len: head.distanceTo(tail), restQ: null, parent};
    const pw = parent && world[parent];
    if (pw) { const inv = pw.m.clone().invert(); const local = new THREE.Matrix4().compose(head, q, new THREE.Vector3(1, 1, 1)).premultiply(inv);
      local.decompose(b.position, b.quaternion, new THREE.Vector3()); bones[parent].add(b); }
    else { b.position.copy(head); b.quaternion.copy(q); skelRoot.add(b); }
    world[name] = {m: new THREE.Matrix4().compose(head, q, new THREE.Vector3(1, 1, 1))};
    b.userData.restQ = b.quaternion.clone(); bones[name] = b;
    const pr = P.pose[name]; if (pr) b.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pr[0] * D, pr[1] * D, pr[2] * D)));
    b.userData.poseQ = b.quaternion.clone();
    // helpers
    const j = new THREE.Mesh(new THREE.SphereGeometry(.11, 12, 8), jointMat); j.renderOrder = 10; j.userData.bone = name; b.add(j); boneHelpers.push(j);
    const L = b.userData.len, st = new THREE.Mesh(new THREE.CylinderGeometry(.02, .055, L, 6).translate(0, L / 2, 0), stickMat); st.renderOrder = 9; st.userData.bone = name; b.add(st); boneHelpers.push(st);
  }
  boneOrder = P.bones.map(b => b[0]).sort((a, b) => { const ta = TAG_ORDER.indexOf(boneRow(a)[4]), tb = TAG_ORDER.indexOf(boneRow(b)[4]); return (ta < 0 ? 99 : ta) - (tb < 0 ? 99 : tb) || (a.endsWith('.R') - b.endsWith('.R')) || a.localeCompare(b, undefined, {numeric: true}); });
  boneOrder.forEach((n, i) => { const sp = numberSprite(i + 1); sp.userData.bone = n; sp.userData.num = i + 1; sp.position.set(.35, bones[n].userData.len * .5, 0); bones[n].add(sp); boneHelpers.push(sp); });
  boneHelpers.forEach(h => h.visible = showBones); markBone(); boneNumsUI();
}
let selBone = null, boneOrder = [];
const TAG_ORDER = ['head', 'jaw', 'neck', 'chest', 'spine', 'armU', 'armF', 'hand', 'legU', 'legL', 'foot', 'tail', 'wingA', 'wingB', 'wingC', 'extra'];
const niceBone = n => n.replace(/\.L$/, ' (L)').replace(/\.R$/, ' (R)').replace(/_x\d+/, '+').replace(/^./, c => c.toUpperCase());
function numberSprite(n) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#ff8a3a'; x.beginPath(); x.arc(32, 32, 28, 0, 7); x.fill();
  x.lineWidth = 4; x.strokeStyle = '#111'; x.stroke(); x.fillStyle = '#111'; x.font = 'bold ' + (n > 9 ? 28 : 34) + 'px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n, 32, 34);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: tx, depthTest: false, transparent: true, sizeAttenuation: false, toneMapped: false})); sp.scale.set(.036, .036, 1); sp.renderOrder = 12; return sp; }
function boneNumsUI() { for (const [id, add] of [['boneNums', false], ['boneNumsAdd', true]]) { const el = $(id); if (!el) continue; el.innerHTML = '';
  boneOrder.forEach((n, i) => { const b = document.createElement('button'); b.textContent = (i + 1) + ' ' + niceBone(n); b.className = n === selBone ? 'on' : ''; if (add) b.style.fontSize = '12px';
    b.onclick = () => goBone(n, add); el.append(b); }); } }
function goBone(n, add) { selBone = n; markBone(); boneNumsUI(); syncBoneUI();
  if (add && placing) { const lib = placing; placing = null; libUI(); const e = LIB[lib];
    if (e.whole) return placeAt({object: {userData: {bone: n}}, point: new THREE.Vector3(), face: null});
    if (addWeaponToPalm(lib, n)) return;
    return addPart(lib, n, [0, 0, 0], [0, 0, 0], isAlong(e) && modeBone ? undefined : 1); }
  const b = bones[n]; if (b) { const w = new THREE.Vector3(); b.getWorldPosition(w); controls.target.copy(w); const d = Math.max(10, b.userData.len * 6); camera.position.copy(w).add(new THREE.Vector3(.55, .4, 1).normalize().multiplyScalar(d)); }
  attachGizmo(); tip('Bone ' + (boneOrder.indexOf(n) + 1) + ': ' + niceBone(n) + (add ? ' — pick a part above, then tap this number again' : ''), 2500); }
function markBone() { boneHelpers.forEach(h => { if (h.geometry && h.geometry.type === 'SphereGeometry') h.material = h.userData.bone === selBone ? jointSelMat : jointMat; }); }
const boneRow = n => P.bones.find(b => b[0] === n);
const twinName = n => n.endsWith('.L') ? n.slice(0, -2) + '.R' : n.endsWith('.R') ? n.slice(0, -2) + '.L' : null;

// ====================================================================== parts in the scene
let views = {};                                                 // uid -> {G, M, meshes}
let sel = null, colorMode = false, wire = false, xray = false;
const matCache = {};
function matFor(key, tint, tile, vc) { const k = key + '|' + (tint || '') + '|' + (tile || 1) + (vc ? '|vc' : ''); if (!matCache[k]) { matCache[k] = MATS.makeMat(THREE, key, tint, tile); matCache[k].vertexColors = !!vc; } const m = matCache[k];
  m.wireframe = wire; if (xray) { const c = m.clone(); c.transparent = true; c.opacity = .4; c.depthWrite = false; return c; } return m; }
function partGeo(pt, mi, base) {                                // per-instance geometry: subdivided + sculpted copy if needed
  const sd = pt.subdiv || 0, sc = pt.sculpt && pt.sculpt[mi], vp = pt.vpaint && pt.vpaint[mi];
  if (!sd && !sc && !vp && !(pt.cut && pt.cut.length)) return base;
  let g = base; for (let i = 0; i < sd; i++) g = subdivide(g);
  if (g === base) g = base.clone();
  if (sc) { const p = g.attributes.position; for (const v in sc) { const d = sc[v]; if (+v < p.count) p.setXYZ(+v, p.getX(+v) + d[0], p.getY(+v) + d[1], p.getZ(+v) + d[2]); } }
  if (vp) { const n = g.attributes.position.count, c = new Float32Array(n * 3).fill(1); for (const v in vp) if (+v < n) c.set(vp[v], +v * 3); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); }
  if (pt.cut && pt.cut.length) { const cut = new Set(pt.cut.filter(c => c.startsWith(mi + ':')).map(c => +c.split(':')[1])); if (cut.size) { const I = g.index.array, keep = [];
    for (let t = 0; t < I.length / 3; t++) if (!cut.has(t)) keep.push(I[t * 3], I[t * 3 + 1], I[t * 3 + 2]); g = g.clone(); g.setIndex(keep); } }
  g.computeVertexNormals(); g.userData.sub = sd; return g;
}
function subdivide(g) {                                         // split every triangle into 4 (welded)
  const p = g.attributes.position, I = g.index.array, pos = Array.from(p.array), mid = new Map(), out = [];
  const m = (a, b) => { const k = a < b ? a + '_' + b : b + '_' + a; if (mid.has(k)) return mid.get(k); const i = pos.length / 3;
    pos.push((pos[a * 3] + pos[b * 3]) / 2, (pos[a * 3 + 1] + pos[b * 3 + 1]) / 2, (pos[a * 3 + 2] + pos[b * 3 + 2]) / 2); mid.set(k, i); return i; };
  for (let t = 0; t < I.length; t += 3) { const a = I[t], b = I[t + 1], c = I[t + 2], ab = m(a, b), bc = m(b, c), ca = m(c, a); out.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca); }
  const n = new THREE.BufferGeometry(); n.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); n.setIndex(out); n.computeVertexNormals(); return n;
}
function buildPart(pt) {
  if (views[pt.uid]) { views[pt.uid].G.removeFromParent(); }
  const G = new THREE.Group(), M = new THREE.Group(); G.add(M); G.userData.uid = pt.uid;
  const parent = (pt.bone && bones[pt.bone]) || skelRoot; parent.add(G);
  const meshes = [];
  pieces(pt.lib, pt.params).forEach((pc, mi) => { if (pt.keep && !pt.keep.includes(mi)) return; const g = partGeo(pt, mi, pc.geo);
    const mat = colorMode ? new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL((hash(pt.uid) % 360) / 360, .6, .55)}) : pc.matObj && !pt.mat ? pc.matObj : matFor(pt.mat && pt.mat[mi] != null ? pt.mat[mi] : (pt.matAll || pc.mat), pt.tint, pt.tile, !!(pt.vpaint && pt.vpaint[mi]));
    const mesh = new THREE.Mesh(g, mat); mesh.userData = {uid: pt.uid, mi}; M.add(mesh); meshes.push(mesh); });
  M.scale.set((pt.flip ? -1 : 1) * (pt.w || 1), pt.l || 1, pt.w || 1); applyOff(pt, M);
  G.position.set(...pt.p); G.quaternion.setFromEuler(new THREE.Euler(...pt.r.map(x => x * D))); G.scale.setScalar(pt.s);
  G.visible = !pt.hidden && !(soloUid && soloUid !== pt.uid);
  views[pt.uid] = {G, M, meshes};
}
function applyOff(pt, M) { const o = pt.off; if (o) M.position.set(-o[0] * M.scale.x, -o[1] * M.scale.y, -o[2] * M.scale.z); else M.position.set(0, 0, 0); }
const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
let soloUid = null;
function rebuildParts() { Object.values(views).forEach(v => v.G.removeFromParent()); views = {}; P.parts.forEach(buildPart); attachGizmo(); }
const partBy = u => P.parts.find(p => p.uid === u);
const twinOf = pt => pt && pt.twin ? partBy(pt.twin) : null;
function mirrorInto(src, dst) {                                 // keep a mirrored twin in sync
  dst.p = [-src.p[0], src.p[1], src.p[2]]; dst.r = [src.r[0], -src.r[1], -src.r[2]]; dst.s = src.s; dst.l = src.l; dst.w = src.w; dst.flip = !src.flip;
  dst.mat = src.mat ? [...src.mat] : null; dst.matAll = src.matAll; dst.tint = src.tint; dst.tile = src.tile; dst.subdiv = src.subdiv; dst.sculpt = src.sculpt ? JSON.parse(JSON.stringify(src.sculpt)) : null; dst.cut = src.cut ? [...src.cut] : []; dst.vpaint = src.vpaint ? JSON.parse(JSON.stringify(src.vpaint)) : null;
  dst.keep = src.keep ? [...src.keep] : null; dst.off = src.off ? [...src.off] : null; dst.hidden = src.hidden; dst.params = src.params ? {...src.params} : null; buildPart(dst);
}
const syncTwin = pt => { const t = twinOf(pt); if (t) mirrorInto(pt, t); };

// ====================================================================== adding parts
let placing = null, modeBone = true, mirrorAdd = true;
function newPart(lib, bone, p, r, s = 1) { return {uid: uid(), lib, bone, p, r, s, l: 1, w: 1, flip: false, mat: null, matAll: null, tint: '#ffffff', subdiv: 0, sculpt: null, cut: [], hidden: false, twin: null}; }
function autoScale(lib, bone) { return autoFit(lib, bone)[0]; }
function autoFit(lib, bone) {                                  // fit limbs / tails / necks / wings to their bone chain -> [size, extra length stretch]
  const e = LIB[lib], b = bones[bone]; if (!e || !b || !isAlong(e)) return [1, 1];
  if (e.nofit || /Heads|Torsos|Mech Torso|Hands/.test(e.group) || /^md_(head|jaw|chest|belly)/.test(e.id)) return [1, 1];
  const box = new THREE.Box3(); pieces(lib).forEach(pc => { pc.geo.computeBoundingBox(); box.union(pc.geo.boundingBox); });
  const len = box.max.y - Math.max(0, box.min.y); if (len < .05) return [1, 1];
  const tag = b.userData.tag, kids = c => c.children.filter(k => !k.isMesh && k.userData && k.userData.len);
  let chain = b.userData.len, c = b;
  if (/armU|legU|wingA|legL|armF|wingB/.test(tag)) { for (let i = 0; i < 3; i++) { const k = kids(c)[0]; if (!k) break; chain += k.userData.len; c = k; } }
  else for (;;) { const k = kids(c).find(k => k.userData.tag === tag); if (!k) break; chain += k.userData.len; c = k; }
  const ratio = Math.min(4, Math.max(.25, chain / len)), sz = Math.min(1.6, Math.max(.6, Math.sqrt(ratio)));
  return [+sz.toFixed(3), +(ratio / sz).toFixed(3)];
}
function addPart(lib, bone, p, r, s) {
  snap(); const fit = s == null ? autoFit(lib, bone) : [s, 1], pt = newPart(lib, bone, p, r, fit[0]); pt.l = fit[1]; P.parts.push(pt);
  const tb = bone && twinName(bone);
  if (mirrorAdd && (tb ? bones[tb] : Math.abs(p[0]) > .25)) { const t = newPart(lib, tb || bone, [0, 0, 0], [0, 0, 0]); t.twin = pt.uid; pt.twin = t.uid; P.parts.push(t); mirrorInto(pt, t); }
  buildPart(pt); select(pt.uid); outliner(); saveCur();
  tip(LIB[lib].name + ' added' + (pt.twin ? ' (+ mirrored twin)' : '') + (LIB[lib].params ? ' — shape it with the sliders' : ' — Move tab to adjust'));
  if (LIB[lib].params) { document.querySelector('.tabs [data-tab="shape"]').click(); if (!focusOn) $('bFocus').click(); }
  else if (typeof inWS !== 'undefined' && inWS) frameObj(views[pt.uid].G, 1.4);
}
// weapons on a hand bone: grip goes in the palm, blade/barrel points forward (one hand only; Mirror copy for dual wield)
function palmGrip(lib, bone) { const e = LIB[lib], row = bone && boneRow(bone); if (!e || e.group !== 'Weapons' || !row || row[4] !== 'hand' || !bones[bone]) return null;
  return {p: [0, +(bones[bone].userData.len * .5).toFixed(3), .15], r: [90, 0, 0]}; }
function addWeaponToPalm(lib, bone) { const g = palmGrip(lib, bone); if (!g) return false; const m = mirrorAdd; mirrorAdd = false; addPart(lib, bone, g.p, g.r, 1); mirrorAdd = m;
  tip(LIB[lib].name + ' in the palm — Move tab › More › Mirror copy for the other hand', 3200); return true; }
function placeAt(hit) {
  const lib = placing; placing = null; libUI();
  let boneName = null;
  if (hit.object.userData.bone) boneName = hit.object.userData.bone;
  else if (hit.object.userData.uid) { const pt = partBy(hit.object.userData.uid); boneName = pt && pt.bone; }
  const e = LIB[lib], along = modeBone && isAlong(e) && boneName;
  if (addWeaponToPalm(lib, boneName)) return;
  if (e.whole) { const m = mirrorAdd; mirrorAdd = false; addPart(lib, null, [0, 0, 0], [0, 0, 0], 1); mirrorAdd = m; return tip(e.name + ' added as a whole body — sculpt it, erase bits, or add parts on top'); }
  if (along) return addPart(lib, boneName, [0, 0, 0], [0, 0, 0]);
  const B = (boneName && bones[boneName]) || skelRoot; B.updateMatrixWorld(true);
  const inv = B.matrixWorld.clone().invert(), lp = hit.point.clone().applyMatrix4(inv);
  let n = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
  const qW = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n.normalize()), bq = new THREE.Quaternion(); B.getWorldQuaternion(bq);
  const ql = bq.invert().multiply(qW), eu = new THREE.Euler().setFromQuaternion(ql);
  addPart(lib, boneName, lp.toArray().map(v => +v.toFixed(3)), [eu.x, eu.y, eu.z].map(v => +(v / D).toFixed(1)), 1);
}
$('bModeBone').onclick = () => { modeBone = true; $('bModeBone').classList.add('on'); $('bModeSurf').classList.remove('on'); };
$('bModeSurf').onclick = () => { modeBone = false; $('bModeSurf').classList.add('on'); $('bModeBone').classList.remove('on'); };
$('bMirrorAdd').onclick = e => { mirrorAdd = !mirrorAdd; e.target.classList.toggle('on', mirrorAdd); };
$('bAddCenter').onclick = () => { const lib = placing || visibleIds()[0]; if (!lib) return; placing = null; libUI();
  const b = (selBone && bones[selBone] && selBone) || (P.bones.find(b => b[4] === 'chest') || P.bones[0])[0]; addPart(lib, b, [0, 0, 0], [0, 0, 0]); };

// ====================================================================== library UI
let tagFilter = null, catsOpen = true;
let gFilter = GROUP_ORDER.find(g => Object.values(LIB).some(e => e.group === g)) || 'Basic Shapes & Clay', sFilter = null, query = '';
const userTags = (() => { try { return JSON.parse(localStorage.getItem('titan-forge-tags') || '{}'); } catch (e) { return {}; } })();
const tagsOf = id => [...(LIB[id].tags || []), ...(userTags[id] || [])];
const visibleIds = () => Object.keys(LIB).filter(id => { const e = LIB[id]; if (tagFilter && !tagsOf(id).includes(tagFilter)) return false; if (tagFilter === 'fav') return true; if (gFilter === MY && !query) return e.mine && (!sFilter || e.sub === sFilter); if (query) return (e.name + ' ' + e.group + ' ' + e.sub + ' ' + tagsOf(id).join(' ')).toLowerCase().includes(query);
  return e.group === gFilter && (!sFilter || e.sub === sFilter); });
function libUI() {
  const groups = [MY, ...GROUP_ORDER].filter(g => g === 'Free Packs (CC0)' || g === 'My Imports' || g === MY || Object.values(LIB).some(e => e.group === g));
  const SEC = {'My Parts': '⭐ YOURS', 'Basic Shapes & Clay': '🧱 START FROM CLAY + SLIDER MAKERS', 'Heads & Skulls': '🐲 CREATURE PARTS', 'Mech Heads': '🤖 MECH PARTS', 'Mecha Dragon': '🐉 KITS', 'Weapons': '⚔️ GEAR & MAGIC', 'Free Packs (CC0)': '📦 FREE MODEL PACKS'};
  $('grpToggle').textContent = (catsOpen ? '📂 Categories ▴' : '📂 ' + (query ? 'Search results' : gFilter) + '  ▾ (tap for all categories)'); $('groups').style.display = catsOpen ? '' : 'none';
  $('groups').innerHTML = ''; for (const g of groups) { if (SEC[g]) $('groups').append(Object.assign(document.createElement('div'), {className: 'sec', textContent: SEC[g]}));
    const n = Object.values(LIB).filter(e => g === MY ? e.mine : e.group === g).length, b = document.createElement('button');
    b.textContent = g + (n ? ` ${n}` : ''); b.className = !query && g === gFilter ? 'on' : ''; b.onclick = () => { gFilter = g; sFilter = null; query = ''; tagFilter = null; $('search').value = ''; catsOpen = false; libUI(); }; $('groups').append(b); }
  const subs = [...new Set(Object.values(LIB).filter(e => gFilter === MY ? e.mine : e.group === gFilter).map(e => e.sub))];
  $('subs').innerHTML = ''; if (!query && subs.length > 1) for (const s of [null, ...subs]) { const b = document.createElement('button'); b.textContent = s || 'All'; b.className = s === sFilter ? 'on' : ''; b.onclick = () => { sFilter = s; libUI(); }; $('subs').append(b); }
  const cnt = {}; Object.keys(LIB).filter(id => query ? true : (gFilter === MY ? LIB[id].mine : LIB[id].group === gFilter)).forEach(id => tagsOf(id).forEach(t => cnt[t] = (cnt[t] || 0) + 1));
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 24).map(x => x[0]); if (tagFilter && !top.includes(tagFilter)) top.unshift(tagFilter);
  $('tags').innerHTML = ''; for (const t of top) { const b = document.createElement('button'); b.textContent = '#' + t; b.className = t === tagFilter ? 'on' : ''; b.onclick = () => { tagFilter = tagFilter === t ? null : t; libUI(); }; $('tags').append(b); }
  { const b = document.createElement('button'); b.textContent = '＋ tag'; b.onclick = () => { if (!placing) return tip('Tap a part in the grid first, then ＋ tag'); const t = (prompt('Add tags to ' + LIB[placing].name + ' (comma separated)') || '').toLowerCase().split(',').map(x => x.trim().replace(/^#/, '')).filter(Boolean);
    if (!t.length) return; userTags[placing] = [...new Set([...(userTags[placing] || []), ...t])]; localStorage.setItem('titan-forge-tags', JSON.stringify(userTags)); libUI(); tip('Tagged'); }; $('tags').append(b); }
  { const b = document.createElement('button'); b.textContent = '⭐ favorites'; b.className = tagFilter === 'fav' ? 'on' : ''; b.onclick = () => { tagFilter = tagFilter === 'fav' ? null : 'fav'; query = tagFilter ? ' ' : ''; libUI(); }; $('tags').prepend(b); }
  const gr = $('lib'); gr.innerHTML = '';
  if (gFilter === 'Free Packs (CC0)' && !query) packButtons(gr);
  for (const id of visibleIds().slice(0, 240)) { const e = LIB[id], b = document.createElement('button'); b.className = 'item' + (placing === id ? ' on' : '');
    const img = document.createElement('img'); img.dataset.id = id; img.alt = ''; const fav = (userTags[id] || []).includes('fav'), st = Object.assign(document.createElement('span'), {textContent: fav ? '⭐' : '☆'}); st.style.cssText = 'position:absolute;top:2px;right:4px;font-size:16px';
    st.onclick = ev => { ev.stopPropagation(); const t = new Set(userTags[id] || []); t.has('fav') ? t.delete('fav') : t.add('fav'); userTags[id] = [...t]; localStorage.setItem('titan-forge-tags', JSON.stringify(userTags)); libUI(); };
    b.style.position = 'relative'; b.append(img, Object.assign(document.createElement('span'), {textContent: e.name}), st);
    b.onclick = () => { placing = placing === id ? null : id; libUI(); if (placing) tip(isAlong(e) && modeBone ? `Tap a bone dot for the ${e.name}` : `Tap the body where the ${e.name} goes`, 4000); };
    gr.append(b); thumbObs.observe(img); }
  if (!visibleIds().length && gFilter !== 'Free Packs (CC0)') gr.innerHTML = gFilter === MY ? '<div class="hint">Your own parts land here. Open ⋯ → 🛠 Create Asset (Workshop), build a hand, wing, head… then 💾 Save part.</div>' : '<div class="hint">Nothing here yet.</div>';
}
$('grpToggle').onclick = () => { catsOpen = !catsOpen; libUI(); };
$('search').oninput = e => { query = e.target.value.trim().toLowerCase(); libUI(); };
// thumbnails
let thumbR = null; const thumbCache = {};
const thumbObs = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; thumbObs.unobserve(en.target); const id = en.target.dataset.id; setTimeout(() => en.target.src = thumb(id), 0); }), {root: null});
function thumb(id) { if (thumbCache[id]) return thumbCache[id];
  try { if (!thumbR) { thumbR = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true}); thumbR.setSize(144, 144); thumbR.toneMapping = THREE.ACESFilmicToneMapping; }
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x404050, 1.6)); const L = new THREE.DirectionalLight(0xffffff, 2.2); L.position.set(3, 5, 4); sc.add(L);
    const g = new THREE.Group(); pieces(id).forEach(pc => g.add(new THREE.Mesh(pc.geo, pc.matObj || matFor(pc.mat)))); sc.add(g);
    const b = new THREE.Box3().setFromObject(g), c = b.getCenter(new THREE.Vector3()), s = Math.max(...b.getSize(new THREE.Vector3()).toArray()) || 1;
    const cam = new THREE.PerspectiveCamera(30, 1, .01, 200); cam.position.copy(c).add(new THREE.Vector3(s * 1.25, s * .7, s * 1.9)); cam.lookAt(c);
    thumbR.render(sc, cam); return thumbCache[id] = thumbR.domElement.toDataURL('image/webp', .8); } catch (e) { return ''; } }

// ====================================================================== free CC0 packs (loaded when opened)
const PACKS = window.FORGE_PACK_INDEX || [];
const loadedPacks = new Set();
function packButtons(gr) { for (const pk of PACKS) { const b = document.createElement('button'); b.className = 'item'; b.style.minHeight = '64px';
  b.innerHTML = `<b>${pk.name}</b><span>${pk.count} models · ${loadedPacks.has(pk.id) ? 'loaded ✓' : 'tap to load'}</span>`; b.onclick = () => loadPack(pk); gr.append(b); } }
function packsUI() {}
function loadPack(pk) { if (loadedPacks.has(pk.id)) { query = pk.name.toLowerCase(); $('search').value = pk.name; return libUI(); }
  tip('Loading ' + pk.name + '…', 15000); const s = document.createElement('script'); s.src = 'packs/' + pk.file;
  s.onload = async () => { const data = window.FORGE_PACKS && window.FORGE_PACKS[pk.id]; if (!data) return tip('Pack failed to load');
    let n = 0; for (const [name, b64] of Object.entries(data.models)) { try { const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
      const sc = await new Promise((res, rej) => new GLTFLoader().parse(buf, '', g => res(g.scene), rej)); const pcs = sceneToPieces(sc, pk.whole ? 9 : 3);
      if (pcs.length) { LIB['pk:' + pk.id + ':' + name] = {group: 'Free Packs (CC0)', sub: pk.name, name: name.replace(/_/g, ' '), tags: [pk.name], src: data.credit, _p: pcs, whole: !!pk.whole}; n++; } } catch (e) { console.warn(name, e); } }
    loadedPacks.add(pk.id); query = pk.name.toLowerCase(); $('search').value = pk.name; libUI(); tip(n + ' models from ' + pk.name + ' ready', 2500); rebuildParts(); };
  s.onerror = () => tip('Could not load ' + pk.file); document.body.append(s); }
function sceneToPieces(root, size = 3) {
  root.updateMatrixWorld(true); const out = [];
  root.traverse(o => { if (!o.isMesh) return; let g = o.geometry.clone(); const src = g.attributes.position, fp = new Float32Array(src.count * 3);
    for (let i = 0; i < src.count; i++) { fp[i * 3] = src.getX(i); fp[i * 3 + 1] = src.getY(i); fp[i * 3 + 2] = src.getZ(i); }
    const keep = {}; for (const a of ['uv', 'color']) { const at = g.attributes[a]; if (at) { const n = at.itemSize, f = new Float32Array(at.count * n); for (let i = 0; i < at.count; i++) for (let k = 0; k < n; k++) f[i * n + k] = at.getComponent(i, k); keep[a] = new THREE.Float32BufferAttribute(f, n); } }
    for (const a of Object.keys(g.attributes)) g.deleteAttribute(a); g.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3)); for (const a in keep) g.setAttribute(a, keep[a]); g.applyMatrix4(o.matrixWorld);
    if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]);
    const mats = Array.isArray(o.material) ? o.material : [o.material], I = g.index.array, groups = g.groups.length ? g.groups : [{start: 0, count: I.length, materialIndex: 0}];
    for (const gr of groups) { const s = new THREE.BufferGeometry(); for (const a in g.attributes) s.setAttribute(a, g.attributes[a]); s.setIndex(Array.from(I.slice(gr.start, gr.start + gr.count)));
      const src = mats[gr.materialIndex] || mats[0]; const m = new THREE.MeshStandardMaterial({color: src && src.color ? src.color.clone() : 0xcccccc, map: g.attributes.uv && src && src.map || null, vertexColors: !!g.attributes.color, roughness: .65, metalness: 0});
      out.push({geo: s, mat: 'skin', matObj: m}); } });
  if (!out.length) return out;
  const b = new THREE.Box3(); out.forEach(p => { p.geo.computeBoundingBox(); b.union(p.geo.boundingBox); });
  const sz = b.getSize(new THREE.Vector3()), k = size / (Math.max(sz.x, sz.y, sz.z) || 1), c = b.getCenter(new THREE.Vector3());
  return out.map(p => { let g = p.geo.clone(); g.translate(-c.x, -b.min.y, -c.z); g.scale(k, k, k); const uv = null; g = mergeVertices(g, 1e-4); g.computeVertexNormals(); return {geo: g, mat: p.mat, matObj: p.matObj}; });
}

// ====================================================================== imports (kept in this browser only)
const IDB = () => new Promise((res, rej) => { const r = indexedDB.open('titan-forge', 2); r.onupgradeneeded = () => { for (const st of ['imports', 'projects', 'myparts', 'patterns']) if (!r.result.objectStoreNames.contains(st)) r.result.createObjectStore(st); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
async function idb(store, mode, fn) { const db = await IDB(); return new Promise(res => { const tx = db.transaction(store, mode), st = tx.objectStore(store), r = fn(st); tx.oncomplete = () => res(r && r.result); tx.onerror = () => res(null); }); }
async function idbAll(store) { const db = await IDB(); return new Promise(res => { const out = [], c = db.transaction(store).objectStore(store).openCursor();
  c.onsuccess = e => { const cur = e.target.result; if (cur) { out.push([cur.key, cur.value]); cur.continue(); } else res(out); }; c.onerror = () => res(out); }); }
const ext = n => n.toLowerCase().split('.').pop(), base = n => n.split('/').pop();
async function parseModel(name, buf, files) { const e = ext(name), mgr = new THREE.LoadingManager(), urls = {};
  if (files) mgr.setURLModifier(u => { const k = decodeURIComponent(base(u)); return files[k] ? (urls[k] || (urls[k] = URL.createObjectURL(new Blob([files[k]])))) : u; });
  try { if (e === 'glb' || e === 'gltf') return await new Promise((res, rej) => new GLTFLoader(mgr).parse(e === 'gltf' ? new TextDecoder().decode(buf) : buf, '', g => res(g.scene), rej));
    if (e === 'obj') { const {OBJLoader} = await import('three/addons/loaders/OBJLoader.js'); return new OBJLoader(mgr).parse(new TextDecoder().decode(buf)); }
    if (e === 'fbx') { const {FBXLoader} = await import('three/addons/loaders/FBXLoader.js'); return new FBXLoader(mgr).parse(buf, ''); } } catch (err) { console.warn(name, err); } return null; }
async function addImport(name, buf) { let n = 0; const sub = base(name).replace(/\.[^.]+$/, '').slice(0, 20);
  const reg = (id, sc) => { const pcs = sceneToPieces(sc); if (pcs.length) { LIB['imp:' + name + ':' + id] = {group: 'My Imports', sub, name: id.slice(0, 24), src: 'Your file ' + name + ' (check its license)', _p: pcs, file: name}; n++; } };
  if (ext(name) === 'zip') { const {unzipSync} = await import('three/addons/libs/fflate.module.js'); const z = unzipSync(new Uint8Array(buf)), files = {};
    for (const k in z) files[base(k)] = z[k].buffer.slice(z[k].byteOffset, z[k].byteOffset + z[k].byteLength);
    const pref = ['glb', 'gltf', 'fbx', 'obj'], best = {}; for (const k of Object.keys(z)) { if (!pref.includes(ext(k)) || k.includes('__MACOSX')) continue; const id = base(k).replace(/\.[^.]+$/, ''); if (!best[id] || pref.indexOf(ext(k)) < pref.indexOf(ext(best[id]))) best[id] = k; }
    for (const [id, k] of Object.entries(best)) { const sc = await parseModel(k, files[base(k)], files); if (sc) reg(id, sc); } }
  else { const sc = await parseModel(name, buf); if (sc) reg(sub, sc); } return n; }
$('bImport').onclick = () => $('fImport').click();
$('fImport').onchange = async e => { for (const f of e.target.files) { tip('Reading ' + f.name + '…', 30000); const buf = await f.arrayBuffer(); const n = await addImport(f.name, buf);
    if (!n) { tip("Couldn't read " + f.name, 4000); continue; } await idb('imports', 'readwrite', st => st.put(buf, f.name)); tip(n + ' model(s) added from ' + f.name, 3000); }
  e.target.value = ''; gFilter = 'My Imports'; sFilter = null; libUI(); };

// ====================================================================== selection + outliner
function select(u) { if (u && u !== sel && navigator.vibrate) try { navigator.vibrate(10); } catch (e) {} sel = u; attachGizmo(); outliner(); syncEdit(); highlight(); if (tab === 'shape') shapeUI(); }
let hl = null;
function highlight() { if (hl) { hl.removeFromParent(); hl = null; } const v = sel && views[sel]; if (!v || !v.meshes.length) return;
  const box = new THREE.Box3().setFromObject(v.M); hl = new THREE.Box3Helper(box, 0xffd166); hl.material.depthTest = false; hl.renderOrder = 11; scene.add(hl); setTimeout(() => { if (hl) { hl.removeFromParent(); hl = null; } }, 900); }
function outliner() {
  const el = $('outliner'); el.innerHTML = '';
  const add = (h) => { const x = document.createElement('h3'); x.textContent = h; el.append(x); };
  const tools = document.createElement('div'); tools.className = 'row';
  for (const [t, f] of [['Show all', () => { snap(); P.parts.forEach(p => { if (!p.boxed) p.hidden = false; }); soloUid = null; rebuildParts(); outliner(); saveCur(); }], ['Hide all', () => { snap(); P.parts.forEach(p => p.hidden = true); rebuildParts(); outliner(); saveCur(); }], ['Bones ' + (showBones ? 'on' : 'off'), () => $('bBones').click()]]) {
    const b = document.createElement('button'); b.textContent = t; b.onclick = f; tools.append(b); } el.append(tools);
  const byBone = {}; for (const pt of P.parts) (byBone[pt.bone || '(free)'] = byBone[pt.bone || '(free)'] || []).push(pt);
  if (!P.parts.length) { const d = document.createElement('div'); d.className = 'hint'; d.textContent = 'No parts yet. Use ＋ Add.'; el.append(d); }
  for (const [bn, list] of Object.entries(byBone)) { add(bn.toUpperCase());
    for (const pt of list) { const d = document.createElement('div'); d.className = 'ol' + (pt.uid === sel ? ' sel' : '') + (pt.hidden ? ' hid' : '');
      const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = (LIB[pt.lib] ? LIB[pt.lib].name : 'missing part') + (pt.twin ? (pt.flip ? ' (R)' : ' (L)') : '');
      const eye = document.createElement('button'); eye.textContent = pt.hidden ? '🙈' : '👁'; eye.onclick = ev => { ev.stopPropagation(); snap(); pt.hidden = !pt.hidden; buildPart(pt); outliner(); saveCur(); };
      const solo = document.createElement('button'); solo.textContent = soloUid === pt.uid ? '◉' : '◎'; solo.onclick = ev => { ev.stopPropagation(); soloUid = soloUid === pt.uid ? null : pt.uid; rebuildParts(); outliner(); };
      d.append(nm, eye, solo); d.onclick = () => { select(pt.uid); if (innerWidth < 760) $('outliner').classList.remove('open'); }; el.append(d); } }
}
$('bList').onclick = () => $('outliner').classList.toggle('open');

// ====================================================================== edit tab
const gizmo = new TransformControls(camera, canvas); gizmo.setSize(matchMedia('(pointer:coarse)').matches ? 1.4 : .9); scene.add(gizmo);
let gzTarget = 'part';
gizmo.addEventListener('dragging-changed', e => { controls.enabled = !e.value; if (e.value) snap(); else { writeBack(); saveCur(); } });
gizmo.addEventListener('objectChange', () => writeBack(true));
function writeBack(live) {
  if (gzTarget === 'bone') return boneWriteBack();
  if (gzTarget === 'joint') return jointWriteBack(live);
  const pt = partBy(sel), v = views[sel]; if (!pt || !v) return;
  pt.p = v.G.position.toArray().map(x => +x.toFixed(3)); const e = new THREE.Euler().setFromQuaternion(v.G.quaternion); pt.r = [e.x, e.y, e.z].map(x => +(x / D).toFixed(1));
  if (gizmo.mode === 'scale') { const s = v.G.scale; pt.l = +((pt.l || 1) * s.y / pt.s).toFixed(3); pt.w = +((pt.w || 1) * (s.x + s.z) / 2 / pt.s).toFixed(3); v.G.scale.setScalar(pt.s); v.M.scale.set((pt.flip ? -1 : 1) * pt.w, pt.l, pt.w); applyOff(pt, v.M); }
  syncTwin(pt); syncEdit(true);
}
function attachGizmo() { gizmo.detach(); gzTarget = 'part';
  if (tab === 'skel' && (poseMode || jointMode) && selBone && bones[selBone]) { gzTarget = poseMode ? 'bone' : 'joint'; gizmo.setMode(poseMode ? 'rotate' : 'translate'); gizmo.attach(bones[selBone]); return; }
  if (tab === 'edit' && sel && views[sel]) { gizmo.setMode(gzMode); gizmo.attach(views[sel].G); } }
let gzMode = 'translate';
document.querySelectorAll('[data-gz]').forEach(b => b.onclick = () => { gzMode = b.dataset.gz; document.querySelectorAll('[data-gz]').forEach(x => x.classList.toggle('on', x === b)); attachGizmo(); });
$('bLocal').onclick = e => { gizmo.setSpace(gizmo.space === 'world' ? 'local' : 'world'); e.target.classList.toggle('on', gizmo.space === 'local'); };
$('bSnap').onclick = e => { const on = gizmo.translationSnap == null; gizmo.setTranslationSnap(on ? .25 : null); gizmo.setRotationSnap(on ? 15 * D : null); e.target.textContent = on ? 'Snap on' : 'Snap off'; e.target.classList.toggle('on', on); };
function syncEdit(soft) { const pt = partBy(sel);
  $('grab').textContent = pt ? (LIB[pt.lib] ? LIB[pt.lib].name : 'part') + (pt.bone ? ' · on ' + pt.bone : '') : (selBone && tab === 'skel' ? 'Bone: ' + selBone : 'Myth Forge');
  if (!pt) return; for (const [s, v, k] of [['sSize', 'vSize', 's'], ['sLen', 'vLen', 'l'], ['sWid', 'vWid', 'w']]) { if (!soft || document.activeElement !== $(s)) $(s).value = pt[k] || 1; $(v).textContent = (+(pt[k] || 1)).toFixed(2); }
  $('bHide').textContent = pt.hidden ? 'Show' : 'Hide'; $('bUnlink').style.display = pt.twin ? '' : 'none'; $('tint').value = pt.tint || '#ffffff'; }
for (const [s, k] of [['sSize', 's'], ['sLen', 'l'], ['sWid', 'w']]) { $(s).onpointerdown = () => snap();
  $(s).oninput = e => { const pt = partBy(sel); if (!pt) return; pt[k] = +e.target.value; buildPart(pt); syncTwin(pt); attachGizmo(); syncEdit(true); saveCur(); }; }
$('bDup').onclick = () => { const pt = partBy(sel); if (!pt) return; snap(); const n = JSON.parse(JSON.stringify(pt)); n.uid = uid(); n.twin = null; n.p[0] += .6; P.parts.push(n); buildPart(n); select(n.uid); saveCur(); tip('Copy made'); };
$('bFlip').onclick = () => { const pt = partBy(sel); if (!pt) return; snap(); pt.flip = !pt.flip; buildPart(pt); syncTwin(pt); attachGizmo(); saveCur(); };
$('bMirrorPart').onclick = () => { const pt = partBy(sel); if (!pt || pt.twin) return tip(pt ? 'Already has a twin' : 'Pick a part'); snap(); const tb = pt.bone && twinName(pt.bone);
  const t = newPart(pt.lib, tb && bones[tb] ? tb : pt.bone, [0, 0, 0], [0, 0, 0]); t.twin = pt.uid; pt.twin = t.uid; P.parts.push(t); mirrorInto(pt, t); outliner(); saveCur(); tip('Mirrored twin made'); };
$('bUnlink').onclick = () => { const pt = partBy(sel), t = twinOf(pt); if (!t) return; snap(); pt.twin = t.twin = null; syncEdit(); outliner(); saveCur(); tip('Twins unlinked'); };
$('bDel').onclick = () => { const pt = partBy(sel); if (!pt) return; snap(); const t = twinOf(pt); P.parts = P.parts.filter(p => p !== pt && p !== t); [pt, t].forEach(x => x && views[x.uid] && views[x.uid].G.removeFromParent());
  sel = null; attachGizmo(); outliner(); syncEdit(); saveCur(); tip('Deleted' + (t ? ' (and its twin)' : '')); };
$('bHide').onclick = () => { const pt = partBy(sel); if (!pt) return; snap(); pt.hidden = !pt.hidden; buildPart(pt); syncTwin(pt); outliner(); syncEdit(); saveCur(); };
$('bSolo').onclick = () => { if (!sel) return; soloUid = soloUid === sel ? null : sel; rebuildParts(); outliner(); tip(soloUid ? 'Only this part shown — tap again to undo' : 'All parts shown'); };
$('bShowAll').onclick = () => { snap(); soloUid = null; P.parts.forEach(p => { if (!p.boxed) p.hidden = false; }); rebuildParts(); outliner(); saveCur(); };
let reattaching = false;
$('bReattach').onclick = () => { if (!sel) return; reattaching = true; showBones = true; boneHelpers.forEach(h => h.visible = true); tip('Tap the bone dot to move this part onto', 4000); };
function reattach(boneName) { const pt = partBy(sel); reattaching = false; if (!pt || !views[sel]) return; snap(); const G = views[sel].G, B = bones[boneName]; G.updateMatrixWorld(true); B.updateMatrixWorld(true);
  const m = G.matrixWorld.clone().premultiply(B.matrixWorld.clone().invert()), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(p, q, s);
  const e = new THREE.Euler().setFromQuaternion(q); pt.bone = boneName; pt.p = p.toArray().map(x => +x.toFixed(3)); pt.r = [e.x, e.y, e.z].map(x => +(x / D).toFixed(1)); pt.s = +s.y.toFixed(3);
  const g = palmGrip(pt.lib, boneName); if (g) { pt.p = g.p; pt.r = g.r; }
  buildPart(pt); attachGizmo(); outliner(); syncEdit(); saveCur(); tip(g ? 'In the palm of ' + niceBone(boneName) : 'Moved onto ' + boneName); }

// ====================================================================== shape tab (sliders for maker parts)
function shapeUI() { const el = $('shapeBox'), pt = partBy(sel), e = pt && LIB[pt.lib]; el.innerHTML = '';
  if (!e || !e.params) { el.innerHTML = '<div class="hint">Pick a part from ＋ Add → Part Makers (eye, finger, hand, horn, teeth, tail, wing, spikes, leg, ear), then shape it here with sliders. Any change keeps its mirrored twin in sync.</div>'; return; }
  const cur = {...Object.fromEntries(e.params.map(q => [q.k, q.def])), ...(pt.params || {})};
  for (const q of e.params) { const row = document.createElement('div');
    if (q.options) { row.className = 'row'; row.append(Object.assign(document.createElement('span'), {textContent: q.label, style: 'min-width:70px;font-size:13px'}));
      for (const o of q.options) { const b = document.createElement('button'); b.textContent = o; b.className = cur[q.k] === o ? 'on' : ''; b.style.minHeight = '34px'; b.style.fontSize = '12.5px';
        b.onclick = () => { snap(); pt.params = {...cur, [q.k]: o}; pt.sculpt = null; pt.cut = []; pt.vpaint = null; buildPart(pt); syncTwin(pt); attachGizmo(); saveCur(); shapeUI(); }; row.append(b); } }
    else { row.className = 'sl'; const r = Object.assign(document.createElement('input'), {type: 'range', min: q.min, max: q.max, step: q.step, value: cur[q.k]}), v = Object.assign(document.createElement('span'), {textContent: cur[q.k]});
      r.onpointerdown = () => snap(); r.oninput = () => { cur[q.k] = +r.value; v.textContent = r.value; pt.params = {...cur}; pt.sculpt = null; pt.cut = []; pt.vpaint = null; buildPart(pt); syncTwin(pt); attachGizmo(); };
      r.onchange = () => saveCur(); row.append(Object.assign(document.createElement('span'), {textContent: q.label}), r, v); }
    el.append(row); }
  const b = document.createElement('button'); b.textContent = 'Reset sliders'; b.onclick = () => { snap(); pt.params = null; buildPart(pt); syncTwin(pt); saveCur(); shapeUI(); }; el.append(b); }

// ====================================================================== paint tab
let matCat = MATS.LIST[0][2], paintTwin = true;
function matsUI() { const cats = [...new Set(MATS.LIST.map(l => l[2]))]; $('matCats').innerHTML = '';
  for (const c of cats) { const b = document.createElement('button'); b.textContent = c; b.className = c === matCat ? 'on' : ''; b.onclick = () => { matCat = c; matsUI(); }; $('matCats').append(b); }
  $('mats').innerHTML = ''; for (const [k, name, c] of MATS.LIST) { if (c !== matCat) continue; const b = document.createElement('button'); b.className = 'item';
    b.innerHTML = `<img src="${matThumb(k)}" alt=""><span>${name}</span>`; b.onclick = () => paint(k); $('mats').append(b); } }
let matR = null; const matThumbs = {};
function matThumb(k) { if (matThumbs[k]) return matThumbs[k]; try { if (!matR) { matR = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true}); matR.setSize(120, 120); matR.toneMapping = THREE.ACESFilmicToneMapping; }
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x303040, 1.3)); const L = new THREE.DirectionalLight(0xffffff, 2.6); L.position.set(2, 3, 4); sc.add(L);
  sc.add(new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), MATS.makeMat(THREE, k))); const cam = new THREE.PerspectiveCamera(30, 1, .1, 20); cam.position.set(0, 0, 4.2);
  matR.render(sc, cam); return matThumbs[k] = matR.domElement.toDataURL('image/webp', .8); } catch (e) { return ''; } }
function paint(k) { const pt = partBy(sel); if (!pt) return tip('Tap a part first (or ☰ list)'); snap(); pt.matAll = k; pt.mat = null; buildPart(pt); if (paintTwin) syncTwin(pt); saveCur(); tip(MATS.LIST.find(l => l[0] === k)[1] + ' applied'); }
$('tint').onchange = e => { const pt = partBy(sel); if (!pt) return; snap(); pt.tint = e.target.value; buildPart(pt); if (paintTwin) syncTwin(pt); saveCur(); };
$('bTintClear').onclick = () => { $('tint').value = '#ffffff'; $('tint').onchange({target: $('tint')}); };
$('bPaintTwin').onclick = e => { paintTwin = !paintTwin; e.target.classList.toggle('on', paintTwin); };
$('bPaintAllSame').onclick = () => { const pt = partBy(sel); if (!pt) return; snap(); for (const o of P.parts) if (o.lib === pt.lib) { o.matAll = pt.matAll; o.mat = pt.mat; o.tint = pt.tint; buildPart(o); } saveCur(); tip('Every ' + LIB[pt.lib].name + ' painted the same'); };

// ====================================================================== sculpt
let brush = 'inflate', symSculpt = true, fingerView = false, penSeen = false, pressure = 1, stroking = false, lastHit = null;
document.querySelectorAll('[data-br]').forEach(b => b.onclick = () => { brush = b.dataset.br; document.querySelectorAll('[data-br]').forEach(x => x.classList.toggle('on', x === b)); });
$('bSymSculpt').onclick = e => { symSculpt = !symSculpt; e.target.classList.toggle('on', symSculpt); };
$('bFingerView').onclick = e => { fingerView = !fingerView; e.target.classList.toggle('on', fingerView); updateOrbit(); };
$('bSubdiv').onclick = () => { const pt = partBy(sel); if (!pt) return tip('Tap a part first');
  const tris = views[sel].meshes.reduce((s, m) => s + m.geometry.index.count / 3, 0); if (tris * 4 > 400000) return tip('Already very detailed');
  snap(); pt.subdiv = (pt.subdiv || 0) + 1; pt.sculpt = null; pt.cut = []; buildPart(pt); syncTwin(pt); attachGizmo(); saveCur(); tip('Detail level ' + pt.subdiv + ' (' + Math.round(tris * 4) + ' triangles)'); };
$('bResetSculpt').onclick = () => { const pt = partBy(sel); if (!pt) return; snap(); pt.sculpt = null; pt.cut = []; buildPart(pt); syncTwin(pt); saveCur(); };
let brushPaint = false, stylus = false;
const sculpting = () => tab === 'sculpt' || (tab === 'paint' && brushPaint);
$('bPen').onclick = e => { stylus = !stylus; e.target.classList.toggle('on', stylus); if (stylus) penSeen = true; updateOrbit();
  tip(stylus ? 'Stylus mode: pen sculpts / paints / taps, fingers only turn and zoom the view' : 'Stylus mode off', 3000); };
$('bBrushPaint').onclick = e => { brushPaint = !brushPaint; e.target.classList.toggle('on', brushPaint); updateOrbit(); tip(brushPaint ? (sel ? 'Draw on the part to paint it' : 'Tap a part first, then draw on it') : 'Brush paint off'); };
$('bBrushErase').onclick = () => { const pt = partBy(sel); if (!pt) return; snap(); pt.vpaint = null; buildPart(pt); syncTwin(pt); saveCur(); };
function paintStroke(x, y) { const pt = partBy(sel), v = views[sel]; if (!pt || !v) return; const hit = cast(x, y, v.meshes); if (!hit) return;
  const mesh = hit.object, mi = mesh.userData.mi; pt.vpaint = pt.vpaint || {};
  if (!pt.vpaint[mi]) { pt.vpaint[mi] = {}; buildPart(pt); return paintStroke(x, y); }
  const g = mesh.geometry, p = g.attributes.position, col = g.attributes.color; if (!col) return; const local = mesh.worldToLocal(hit.point.clone()), ws = new THREE.Vector3(); mesh.getWorldScale(ws);
  const R = (+$('sBrush').value) / Math.abs(ws.y), R2 = R * R, power = Math.min(1, +$('sStr').value * pressure), c = new THREE.Color($('brushCol').value), M = pt.vpaint[mi];
  const centers = [local]; if (symSculpt) centers.push(new THREE.Vector3(-local.x, local.y, local.z));
  for (const ce of centers) for (let i = 0; i < p.count; i++) { const d2 = (p.getX(i) - ce.x) ** 2 + (p.getY(i) - ce.y) ** 2 + (p.getZ(i) - ce.z) ** 2; if (d2 > R2) continue;
    const f = (1 - d2 / R2) * power, r = col.getX(i) + (c.r - col.getX(i)) * f, gg = col.getY(i) + (c.g - col.getY(i)) * f, b = col.getZ(i) + (c.b - col.getZ(i)) * f; col.setXYZ(i, r, gg, b); M[i] = [+r.toFixed(3), +gg.toFixed(3), +b.toFixed(3)]; }
  col.needsUpdate = true; }
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function cast(x, y, objs) { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); ray.camera = camera; return ray.intersectObjects(objs, false)[0]; }
const visibleMeshes = () => Object.values(views).filter(v => v.G.visible).flatMap(v => v.meshes);
const adjCache = new WeakMap();
function adj(g) { if (adjCache.has(g)) return adjCache.get(g); const I = g.index.array, n = g.attributes.position.count, nb = Array.from({length: n}, () => []);
  for (let t = 0; t < I.length; t += 3) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (a !== b) nb[I[t + a]].push(I[t + b]); adjCache.set(g, nb); return nb; }
function stroke(x, y) {
  const pt = partBy(sel), v = views[sel]; if (!pt || !v) return; const hit = cast(x, y, v.meshes); if (!hit) return;
  const mesh = hit.object, mi = mesh.userData.mi, g = mesh.geometry, p = g.attributes.position, nrm = g.attributes.normal;
  const local = mesh.worldToLocal(hit.point.clone()), ws = new THREE.Vector3(); mesh.getWorldScale(ws);
  const R = (+$('sBrush').value) / Math.abs(ws.y), R2 = R * R, power = Math.min(1, +$('sStr').value * pressure);
  if (brush === 'erase') { const I = g.index.array, cut = new Set(pt.cut || []); let n = 0;
    for (let t = 0; t < I.length / 3; t++) { let cx = 0, cy = 0, cz = 0; for (let j = 0; j < 3; j++) { const vv = I[t * 3 + j]; cx += p.getX(vv) / 3; cy += p.getY(vv) / 3; cz += p.getZ(vv) / 3; }
      if ((cx - local.x) ** 2 + (cy - local.y) ** 2 + (cz - local.z) ** 2 < R2) { cut.add(mi + ':' + t); n++; } }
    if (n) { if (pt.cut && pt.cut.length) tip('Erase is one-time per stroke here', 800); pt.cut = [...cut]; buildPart(pt); syncTwin(pt); } return; }
  if (g === pieces(pt.lib, pt.params)[mi].geo) { buildPartOwn(pt); return stroke(x, y); }
  pt.sculpt = pt.sculpt || {}; const S = pt.sculpt[mi] = pt.sculpt[mi] || {};
  const centers = [local]; if (symSculpt) centers.push(new THREE.Vector3(-local.x, local.y, local.z));
  const hn = hit.face.normal.clone(); let drag = null; if (brush === 'grab') { if (lastHit) drag = local.clone().sub(lastHit); lastHit = local.clone(); if (!drag) return; }
  const nb = (brush === 'smooth') ? adj(g) : null, moved = new Map();
  for (const [ci, c] of centers.entries()) for (let i = 0; i < p.count; i++) {
    const dx = p.getX(i) - c.x, dy = p.getY(i) - c.y, dz = p.getZ(i) - c.z, d2 = dx * dx + dy * dy + dz * dz; if (d2 > R2) continue;
    const f = (1 - d2 / R2) ** 2 * power, mv = new THREE.Vector3(), N = new THREE.Vector3(nrm.getX(i), nrm.getY(i), nrm.getZ(i));
    if (brush === 'inflate' || brush === 'deflate') mv.copy(N).multiplyScalar(f * R * .1 * (brush === 'inflate' ? 1 : -1));
    else if (brush === 'smooth') { let ax = 0, ay = 0, az = 0, k = 0; for (const o of nb[i]) { ax += p.getX(o); ay += p.getY(o); az += p.getZ(o); k++; } if (!k) continue; mv.set(ax / k - p.getX(i), ay / k - p.getY(i), az / k - p.getZ(i)).multiplyScalar(Math.min(1, f * 1.6)); }
    else if (brush === 'flatten') { const H = hn.clone(); if (ci) H.x = -H.x; mv.copy(H).multiplyScalar(-(dx * H.x + dy * H.y + dz * H.z) * f); }
    else if (brush === 'pinch') mv.set(-dx, -dy, -dz).multiplyScalar(f * .15);
    else if (brush === 'crease') mv.copy(N).multiplyScalar(-f * R * .08).add(new THREE.Vector3(-dx, -dy, -dz).multiplyScalar(f * .1));
    else if (brush === 'noise') mv.copy(N).multiplyScalar(K.vnoise(p.getX(i) * 6, p.getY(i) * 6, p.getZ(i) * 6) * f * R * .12);
    else if (brush === 'grab') { mv.copy(drag).multiplyScalar(f / power); if (ci) mv.x = -mv.x; }
    const prev = moved.get(i); moved.set(i, prev ? prev.add(mv) : mv); }
  for (const [i, mv] of moved) { p.setXYZ(i, p.getX(i) + mv.x, p.getY(i) + mv.y, p.getZ(i) + mv.z); const o = S[i] || [0, 0, 0]; S[i] = [o[0] + mv.x, o[1] + mv.y, o[2] + mv.z].map(v => +v.toFixed(4)); }
  if (moved.size) { p.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere(); }
}
function buildPartOwn(pt) { pt.sculpt = pt.sculpt || {}; const v = views[pt.uid]; v.meshes.forEach(m => { const mi = m.userData.mi; if (m.geometry === pieces(pt.lib, pt.params)[mi].geo) m.geometry = m.geometry.clone(); }); }
function updateOrbit() { controls.enabled = true; controls.touches.ONE = (!sculpting() || penSeen || stylus || fingerView) ? THREE.TOUCH.ROTATE : null;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN; controls.mouseButtons.LEFT = sculpting() ? null : THREE.MOUSE.ROTATE; if (!sculpting()) $('ring').style.display = 'none'; }
function ring(x, y) { const px = (+$('sBrush').value) * innerHeight / (camera.position.distanceTo(controls.target) * Math.tan(camera.fov * D / 2) * 2);
  const r = $('ring'); r.style.display = 'block'; r.style.left = x + 'px'; r.style.top = y + 'px'; r.style.width = r.style.height = px * 2 + 'px'; }

// ====================================================================== pointer handling
const touches = new Set(); let down = null;
canvas.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch') touches.add(e.pointerId);
  if (e.pointerType === 'pen' && !penSeen) { penSeen = true; updateOrbit(); tip('S Pen found: pen sculpts, fingers turn the view'); }
  if (stroking && touches.size > 1) { stroking = false; saveCur(); }
  down = [e.clientX, e.clientY];
  const toolPtr = sculpting() && (e.pointerType === 'pen' || (e.pointerType === 'mouse' && e.button === 0) || (e.pointerType === 'touch' && !stylus && !penSeen && !fingerView && touches.size === 1));
  if (toolPtr && sel) { pressure = e.pointerType === 'pen' && e.pressure > 0 ? .35 + e.pressure * 1.3 : 1; snap(); stroking = true; lastHit = null; brushAt(e.clientX, e.clientY); ring(e.clientX, e.clientY); }
}, true);
canvas.addEventListener('pointermove', e => { if (!sculpting()) return; if (e.pointerType !== 'touch' || stroking) ring(e.clientX, e.clientY);
  if (stroking) { if (e.pointerType === 'pen' && e.pressure > 0) pressure = .35 + e.pressure * 1.3; brushAt(e.clientX, e.clientY); } });
const brushAt = (x, y) => tab === 'paint' ? paintStroke(x, y) : stroke(x, y);
addEventListener('pointercancel', e => touches.delete(e.pointerId));
canvas.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('pointerup', e => {
  touches.delete(e.pointerId);
  if (stroking) { stroking = false; const pt = partBy(sel); if (pt) syncTwin(pt); saveCur(); down = null; return; }
  if (!down || gizmo.dragging || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 7 || e.target !== canvas) { down = null; return; }
  down = null;
  const helpers = showBones || placing || reattaching || tab === 'skel' ? boneHelpers.filter(h => h.visible) : [];
  const hitB = cast(e.clientX, e.clientY, helpers), hitP = cast(e.clientX, e.clientY, visibleMeshes());
  if (reattaching) { if (hitB) reattach(hitB.object.userData.bone); else tip('Tap an orange bone dot'); return; }
  if (placing) { const useBone = hitB && (!hitP || modeBone && isAlong(LIB[placing]) || hitB.distance < hitP.distance);
    const h = useBone ? hitB : hitP; if (!h) return tip(P.bones.length ? 'Tap a bone dot or the body' : 'Use "Add without tapping"'); return placeAt(h); }
  if (tab === 'skel' && hitB) { selBone = hitB.object.userData.bone; markBone(); attachGizmo(); syncBoneUI(); boneNumsUI(); return; }
  if (hitP) { select(hitP.object.userData.uid); return; }
  if (hitB) { selBone = hitB.object.userData.bone; markBone(); syncBoneUI(); tip('Bone ' + selBone + ' (new parts go here with "Add without tapping")'); return; }
});

// ====================================================================== skeleton tab
let poseMode = false, jointMode = false, anim = 'none', animT = 0;
const STARTERS = window.FORGE_STARTERS || [];
function loadStarter(st) { const keep = mirrorAdd; snap(); P = blankProject(st.skel); P.name = st.name; Object.assign(P.fx, st.fx || {}); rebuildSkeleton(); rebuildParts();
  for (const [lib, bone, p, r, s, flag] of st.parts) { if (!LIB[lib]) { console.warn('starter part missing', lib); continue; } if (!bones[bone]) { console.warn('starter bone missing', bone); continue; }
    const fit = s == null ? autoFit(lib, bone) : Array.isArray(s) ? s : [s, 1], pt = newPart(lib, bone, p, r, fit[0]); pt.l = fit[1]; P.parts.push(pt); buildPart(pt); const tb = twinName(bone);
    if (flag !== 'solo' && (tb ? bones[tb] : Math.abs(p[0]) > .25)) { const t = newPart(lib, tb || bone, [0, 0, 0], [0, 0, 0]); t.twin = pt.uid; pt.twin = t.uid; P.parts.push(t); mirrorInto(pt, t); } }
  mirrorAdd = keep; sel = null; applyFX(); outliner(); saveCur(); frameAll(); tip(st.name + ' loaded — tap any part to change it'); }
function startersUI() { const el = $('starters'); if (!el) return; el.innerHTML = ''; for (const st of STARTERS) { const b = document.createElement('button'); b.textContent = st.name;
  b.onclick = () => { if (P.parts.length && !confirm('Load ' + st.name + '? Your current creature is replaced (save it first with ⋯ if you want it).')) return; loadStarter(st); skelUI(); }; el.append(b); } }
const mySkels = (() => { try { return JSON.parse(localStorage.getItem('titan-forge-skels') || '{}'); } catch (e) { return {}; } })();
for (const [k, v] of Object.entries(mySkels)) SKEL[k] = v;
$('bSaveSkel').onclick = () => { const n = prompt('Name this body type (e.g. My mech frame)'); if (!n) return; const k = 'my_' + Date.now().toString(36);
  mySkels[k] = SKEL[k] = {name: '★ ' + n, bones: JSON.parse(JSON.stringify(P.bones))}; localStorage.setItem('titan-forge-skels', JSON.stringify(mySkels)); P.skel = k; skelUI(); saveCur(); tip('Saved — it is in the body type list now'); };
function skelUI() { startersUI(); $('skels').innerHTML = ''; for (const [k, s] of Object.entries(SKEL)) { const b = document.createElement('button'); b.textContent = s.name; b.className = P.skel === k ? 'on' : '';
  b.onclick = () => { if (P.parts.length && !confirm('Switch body type? Parts stay on bones with the same name; others move to the body.')) return; snap(); P.skel = k; P.bones = JSON.parse(JSON.stringify(s.bones)); P.pose = {};
    const names = new Set(P.bones.map(b => b[0])), fb = (P.bones.find(b => b[4] === 'chest') || P.bones[0])[0]; P.parts.forEach(p => { if (p.bone && !names.has(p.bone)) p.bone = fb; });
    rebuildSkeleton(); rebuildParts(); skelUI(); outliner(); saveCur(); frameAll(); }; $('skels').append(b); } }
function syncBoneUI() { const b = selBone && bones[selBone]; $('boneHint').textContent = b ? `Bone: ${selBone} (${b.userData.tag})` : 'Tap an orange joint to pick a bone. Parts on a bone move with it.';
  if (b) { $('sBone').value = 1; $('vBone').textContent = b.userData.len.toFixed(2); } syncEdit(); }
$('bBones').onclick = e => { showBones = !showBones; e.target.classList.toggle('on', showBones); boneHelpers.forEach(h => h.visible = showBones); outliner(); };
$('bPose').onclick = e => { poseMode = !poseMode; jointMode = false; e.target.classList.toggle('on', poseMode); $('bJoint').classList.remove('on'); attachGizmo(); tip(poseMode ? 'Tap a joint, then turn it' : 'Pose mode off'); };
$('bJoint').onclick = e => { jointMode = !jointMode; poseMode = false; e.target.classList.toggle('on', jointMode); $('bPose').classList.remove('on'); attachGizmo(); tip(jointMode ? 'Tap a joint, then drag it (moves everything after it too)' : 'Joint mode off'); };
$('bResetPose').onclick = () => { snap(); P.pose = {}; rebuildSkeleton(); rebuildParts(); saveCur(); };
function boneWriteBack() { const b = bones[selBone]; if (!b) return; const rel = b.userData.restQ.clone().invert().multiply(b.quaternion), e = new THREE.Euler().setFromQuaternion(rel);
  P.pose[selBone] = [e.x, e.y, e.z].map(x => +(x / D).toFixed(1)); b.userData.poseQ = b.quaternion.clone();
  const tw = twinName(selBone); if (tw && bones[tw]) { P.pose[tw] = [P.pose[selBone][0], -P.pose[selBone][1], -P.pose[selBone][2]]; const t = bones[tw]; t.quaternion.copy(t.userData.restQ).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...P.pose[tw].map(x => x * D)))); t.userData.poseQ = t.quaternion.clone(); } saveCur(); }
let jointStart = null;
function jointWriteBack(live) { const b = bones[selBone]; if (!b) return; b.updateMatrixWorld(true); const head = new THREE.Vector3().setFromMatrixPosition(b.matrixWorld), row = boneRow(selBone);
  const d = head.clone().sub(new THREE.Vector3(...row[2])); if (d.lengthSq() < 1e-8) return; if (live) return;
  const moveSub = (n, dd) => { const r = boneRow(n); r[2] = r[2].map((v, i) => +(v + dd.getComponent(i)).toFixed(3)); r[3] = r[3].map((v, i) => +(v + dd.getComponent(i)).toFixed(3)); P.bones.filter(x => x[1] === n).forEach(x => moveSub(x[0], dd)); };
  const tw = twinName(selBone); moveSub(selBone, d); if (tw && boneRow(tw)) moveSub(tw, new THREE.Vector3(-d.x, d.y, d.z));
  const par = row[1] && boneRow(row[1]); if (par && P.bones.filter(x => x[1] === row[1]).length === 1) { par[3] = [...row[2]]; const tp = twinName(row[1]); if (tw && tp && boneRow(tp)) boneRow(tp)[3] = [...boneRow(tw)[2]]; }
  rebuildSkeleton(); rebuildParts(); attachGizmo(); saveCur(); }
$('sBone').onpointerdown = () => { snap(); jointStart = selBone && JSON.parse(JSON.stringify(P.bones)); };
$('sBone').oninput = e => { if (!selBone || !jointStart) return; P.bones = JSON.parse(JSON.stringify(jointStart)); const k = +e.target.value;
  const scaleBone = n => { const r = boneRow(n), h = new THREE.Vector3(...r[2]), t = new THREE.Vector3(...r[3]), nt = h.clone().add(t.clone().sub(h).multiplyScalar(k)), d = nt.clone().sub(t); r[3] = nt.toArray().map(v => +v.toFixed(3));
    const shift = (c, dd) => { const rr = boneRow(c); rr[2] = rr[2].map((v, i) => +(v + dd.getComponent(i)).toFixed(3)); rr[3] = rr[3].map((v, i) => +(v + dd.getComponent(i)).toFixed(3)); P.bones.filter(x => x[1] === c).forEach(x => shift(x[0], dd)); };
    P.bones.filter(x => x[1] === n && new THREE.Vector3(...x[2]).distanceTo(t) < .3).forEach(x => shift(x[0], d)); };
  scaleBone(selBone); const tw = twinName(selBone); if (tw && boneRow(tw)) scaleBone(tw); $('vBone').textContent = k.toFixed(2) + '×'; rebuildSkeleton(); rebuildParts(); saveCur(); };
$('bAddBone').onclick = () => { if (!selBone) return tip('Tap a joint first'); snap(); const add = (n, sfx) => { const r = boneRow(n), h = new THREE.Vector3(...r[2]), t = new THREE.Vector3(...r[3]), nt = t.clone().add(t.clone().sub(h).multiplyScalar(.8));
    const nm = n.replace(/\.(L|R)$/, '') + '_x' + (P.bones.length) + sfx; P.bones.push([nm, n, t.toArray(), nt.toArray().map(v => +v.toFixed(3)), r[4], r[5]]); return nm; };
  const tw = twinName(selBone); const n1 = add(selBone, selBone.endsWith('.L') ? '.L' : selBone.endsWith('.R') ? '.R' : ''); if (tw && boneRow(tw)) add(tw, tw.endsWith('.L') ? '.L' : '.R');
  selBone = n1; rebuildSkeleton(); rebuildParts(); syncBoneUI(); saveCur(); tip('Bone added — attach parts to it'); };
$('bAddBranch').onclick = () => { if (!selBone) return tip('Tap the joint the new limb/head grows from'); snap(); const r = boneRow(selBone), h = new THREE.Vector3(...r[3]);
  const n = 'extra' + P.bones.length; P.bones.push([n + '.L', selBone, [h.x + .6, h.y, h.z], [h.x + 2.4, h.y - .4, h.z + .4], 'extra'], [n + '.R', selBone, [h.x - .6, h.y, h.z], [h.x - 2.4, h.y - .4, h.z + .4], 'extra']);
  selBone = n + '.L'; rebuildSkeleton(); rebuildParts(); syncBoneUI(); saveCur(); tip('New limb bones (both sides) — move joints / add parts'); };
$('bDelBone').onclick = () => { if (!selBone) return; const r = boneRow(selBone); if (!r[1]) return tip("Can't delete the root bone"); snap();
  const kill = new Set(), mark = n => { kill.add(n); P.bones.filter(x => x[1] === n).forEach(x => mark(x[0])); }; mark(selBone); const tw = twinName(selBone); if (tw && boneRow(tw)) mark(tw);
  P.bones = P.bones.filter(b => !kill.has(b[0])); P.parts.forEach(p => { if (kill.has(p.bone)) p.bone = r[1]; }); selBone = r[1]; rebuildSkeleton(); rebuildParts(); syncBoneUI(); outliner(); saveCur(); };
document.querySelectorAll('[data-anim]').forEach(b => b.onclick = () => { anim = b.dataset.anim; animT = 0; document.querySelectorAll('[data-anim]').forEach(x => x.classList.toggle('on', x === b));
  if (anim === 'none') Object.values(bones).forEach(bn => { bn.quaternion.copy(bn.userData.poseQ); bn.position.copy(bn.userData.basePos || bn.position); }); });
function animate(dt) {
  if (anim === 'none') return; animT += dt; const t = animT, Q = new THREE.Quaternion(), E = new THREE.Euler();
  for (const b of Object.values(bones)) { const {tag} = b.userData, side = b.name.endsWith('.L') ? 1 : b.name.endsWith('.R') ? -1 : 0; let x = 0, y = 0, z = 0;
    const idx = +(b.name.match(/(\d+)/) || [0, 0])[1] || 0, front = /front|arm|shoulder|leg1|leg3/.test(b.name) ? 1 : -1;
    if (anim === 'idle') { if (tag === 'chest' || tag === 'spine') x = Math.sin(t * 1.6) * .03; if (tag === 'neck') x = Math.sin(t * 1.6 + .5) * .05; if (tag === 'head') y = Math.sin(t * .7) * .12;
      if (tag === 'tail') { y = Math.sin(t * 1.4 - idx * .6) * .12; } if (tag === 'jaw') x = Math.max(0, Math.sin(t * .9)) * .08; if (/wing/.test(tag)) z = side * Math.sin(t * 1.2) * .05; if (tag === 'armU') z = side * Math.sin(t * 1.6) * .04; }
    if (anim === 'walk' || anim === 'swim') { const ph = t * 4.2 + (side > 0 ? 0 : Math.PI) + (front > 0 ? Math.PI : 0) + idx * 1.3;
      if (anim === 'walk') { if (tag === 'legU') x = Math.sin(ph) * .5; if (tag === 'legL') x = Math.max(0, -Math.cos(ph)) * .6; if (tag === 'foot') x = Math.sin(ph) * .2; if (tag === 'armU') x = Math.sin(ph + Math.PI) * .35; if (tag === 'armF') x = -.2 - Math.max(0, Math.sin(ph)) * .3;
        if (tag === 'spine' || tag === 'chest') y = Math.sin(t * 4.2) * .05; if (tag === 'tail') y = Math.sin(t * 4.2 - idx * .7) * .18; if (tag === 'head') x = Math.sin(t * 8.4) * .03; }
      else { if (tag === 'spine' || tag === 'tail') y = Math.sin(t * 3 - idx * .8) * .28; if (tag === 'legU') x = Math.sin(ph) * .3; } }
    if (anim === 'roar') { const r = Math.min(1, Math.max(0, Math.sin(t * 1.4) * 1.6)); if (tag === 'jaw') x = r * .55; if (tag === 'head') x = -r * .35 + Math.sin(t * 30) * .02 * r; if (tag === 'neck') x = -r * .25;
      if (tag === 'chest') x = -r * .12; if (tag === 'armU') z = side * r * .5; if (/wing/.test(tag)) z = -side * r * .6; if (tag === 'tail') y = Math.sin(t * 6 - idx) * .2 * r; }
    if (anim === 'fly') { if (tag === 'wingA') z = -side * Math.sin(t * 5) * .7; if (tag === 'wingB') z = -side * Math.sin(t * 5 - .6) * .5; if (tag === 'wingC') z = -side * Math.sin(t * 5 - 1.2) * .4;
      if (tag === 'legU') x = .6; if (tag === 'legL') x = .8; if (tag === 'tail') x = Math.sin(t * 2.5 - idx * .5) * .08; if (tag === 'armU') x = .3; }
    if (anim === 'attack') { const c = (t * 1.5) % 1, k = c < .4 ? -c / .4 : c < .5 ? -1 + (c - .4) * 20 : Math.max(0, 1 - (c - .5) * 2); if (tag === 'armU' && side > 0) x = -k * 1.4; if (tag === 'armF' && side > 0) x = k < 0 ? -k * .9 : 0;
      if (tag === 'chest') y = -k * .3; if (tag === 'tail') y = k * .4; if (tag === 'head') x = k * .15; if (tag === 'jaw') x = Math.max(0, k) * .4; }
    E.set(x, y, z); b.quaternion.copy(b.userData.poseQ).multiply(Q.setFromEuler(E)); }
  const root = skelRoot.children[0]; if (root) { if (!root.userData.basePos) root.userData.basePos = root.position.clone(); root.position.y = root.userData.basePos.y + (anim === 'walk' ? Math.abs(Math.sin(t * 4.2)) * .12 : anim === 'fly' ? 1.5 + Math.sin(t * 5) * .3 : anim === 'idle' ? Math.sin(t * 1.6) * .04 : 0); }
}

// ====================================================================== FX + view
const fogCol = new THREE.Color(), BGS = {studio: [0x1c1c22, 0x26262e], neon: [0x0a0618, 0x140c24], day: [0x9ec8ee, 0x6a7a5a], hell: [0x2a0804, 0x3a1206], void: [0x000000, 0x050508]};
let neonCity = null;
function applyFX() { const f = P.fx, [bg, gr] = BGS[f.bg] || BGS.studio; scene.background = new THREE.Color(bg); floor.material.color.set(gr); useBloom = f.glow;
  scene.fog = f.fog ? new THREE.FogExp2(f.bg === 'day' ? 0xb8d0e8 : new THREE.Color(f.col).multiplyScalar(.25), .035) : null;
  hemi.intensity = f.bg === 'day' ? 1.6 : f.bg === 'void' ? .6 : 1.1; hemi.color.set(f.bg === 'hell' ? 0xff9a6a : f.bg === 'neon' ? 0x9a8aff : 0xdde4ff);
  if (f.bg === 'neon' && !neonCity) { neonCity = new THREE.Group(); for (let i = 0; i < 70; i++) { const a = Math.random() * 7, r = 70 + Math.random() * 60, h = 6 + Math.random() * 30, w = 3 + Math.random() * 4;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshStandardMaterial({color: 0x0c0c16, emissive: [0xff2a8a, 0x2ad0ff, 0xa02aff, 0xffb02a][i % 4], emissiveIntensity: .12})); m.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r); neonCity.add(m);
      const e = new THREE.Mesh(new THREE.BoxGeometry(w * 1.01, .25, w * 1.01), new THREE.MeshBasicMaterial({color: [0xff2a8a, 0x2ad0ff, 0xa02aff, 0xffb02a][i % 4]})); e.position.set(m.position.x, h - .5, m.position.z); neonCity.add(e); } scene.add(neonCity); }
  if (neonCity) neonCity.visible = f.bg === 'neon'; grid.visible = f.bg === 'studio';
  mist.visible = f.mist; aura.visible = f.aura; drips.visible = f.drip; mist.material.color.set(f.col); aura.material.color.set(f.col);
  for (const [id, k] of [['bGlow', 'glow'], ['bFog', 'fog'], ['bMist', 'mist'], ['bAura', 'aura'], ['bDrip', 'drip']]) $(id).classList.toggle('on', !!f[k]);
  document.querySelectorAll('[data-bg]').forEach(b => b.classList.toggle('on', b.dataset.bg === f.bg)); $('fxCol').value = f.col; }
// particles: mist, aura, ooze drips
const mkPts = (n, size, col, fn) => { const g = new THREE.BufferGeometry(), a = new Float32Array(n * 3); for (let i = 0; i < n; i++) fn(a, i); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return new THREE.Points(g, new THREE.PointsMaterial({size, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, color: col, opacity: .5, blending: THREE.AdditiveBlending})); };
const mist = mkPts(260, 5, 0x8a2aff, (a, i) => { const r = Math.random() * 14, t = Math.random() * 7; a[i * 3] = Math.cos(t) * r; a[i * 3 + 1] = Math.random() * 1.2; a[i * 3 + 2] = Math.sin(t) * r; });
const aura = mkPts(400, .5, 0x8a2aff, (a, i) => { const t = Math.random() * 7, r = 2.5 + Math.random() * 2; a[i * 3] = Math.cos(t) * r; a[i * 3 + 1] = Math.random() * 11; a[i * 3 + 2] = Math.sin(t) * r; });
const drips = mkPts(120, .35, 0x7aff4a, (a, i) => { a[i * 3] = (Math.random() - .5) * 4; a[i * 3 + 1] = Math.random() * 9; a[i * 3 + 2] = (Math.random() - .5) * 3; });
drips.material.blending = THREE.NormalBlending; drips.material.opacity = .9; scene.add(mist, aura, drips);
function fxTick(dt, t) { if (aura.visible) { aura.rotation.y += dt * .4; const p = aura.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) + dt * (1 + (i % 5) * .3); if (y > 12) y = 0; p.setY(i, y); } p.needsUpdate = true; }
  if (mist.visible) mist.rotation.y += dt * .05;
  if (drips.visible) { const p = drips.geometry.attributes.position, box = new THREE.Box3(); Object.values(views).forEach(v => v.G.visible && box.expandByObject(v.G)); if (box.isEmpty()) box.set(new THREE.Vector3(-2, 0, -2), new THREE.Vector3(2, 9, 2));
    for (let i = 0; i < p.count; i++) { let y = p.getY(i) - dt * (1.5 + (i % 7) * .5); if (y < 0) { p.setXYZ(i, box.min.x + Math.random() * (box.max.x - box.min.x), box.min.y + Math.random() * (box.max.y - box.min.y), box.min.z + Math.random() * (box.max.z - box.min.z)); } else p.setY(i, y); } p.needsUpdate = true; } }
for (const [id, k] of [['bGlow', 'glow'], ['bFog', 'fog'], ['bMist', 'mist'], ['bAura', 'aura'], ['bDrip', 'drip']]) $(id).onclick = () => { P.fx[k] = !P.fx[k]; applyFX(); saveCur(); };
document.querySelectorAll('[data-bg]').forEach(b => b.onclick = () => { P.fx.bg = b.dataset.bg; applyFX(); saveCur(); });
$('fxCol').oninput = e => { P.fx.col = e.target.value; applyFX(); saveCur(); };
let spin = false; $('bSpin').onclick = e => { spin = !spin; e.target.classList.toggle('on', spin); };
function frameAll() { const b = new THREE.Box3().setFromObject(skelRoot); if (b.isEmpty()) return; const c = b.getCenter(new THREE.Vector3()), r = b.getSize(new THREE.Vector3()).length() / 2;
  const dir = camera.position.clone().sub(controls.target).normalize(); controls.target.copy(c); camera.position.copy(c).add(dir.multiplyScalar(r / Math.tan(camera.fov * D / 2) * 1.05)); }
$('bFrame') && ($('bFrame').onclick = frameAll);
const camTo = v => { const t = controls.target, d = camera.position.distanceTo(t); camera.position.copy(t).add(new THREE.Vector3(...v).normalize().multiplyScalar(d)); };
document.querySelectorAll('[data-cam]').forEach(b => b.onclick = () => camTo({front: [0, .15, 1], side: [1, .15, 0], back: [0, .15, -1], top: [0, 1, .01]}[b.dataset.cam]));
$('bWire').onclick = e => { wire = !wire; e.target.classList.toggle('on', wire); Object.values(matCache).forEach(m => m.wireframe = wire); rebuildParts(); };
$('bXray').onclick = e => { xray = !xray; e.target.classList.toggle('on', xray); rebuildParts(); };
let city = null; $('bScale').onclick = e => { if (!city) { city = new THREE.Group(); for (let i = 0; i < 6; i++) { const h = 3 + Math.random() * 5, m = new THREE.Mesh(new THREE.BoxGeometry(2.5, h, 2.5), new THREE.MeshStandardMaterial({color: 0x3a4250}));
  m.position.set(-9 + i * 3.6, h / 2, -6); city.add(m); } scene.add(city); city.visible = false; } city.visible = !city.visible; e.target.classList.toggle('on', city.visible); };

// ====================================================================== phone navigation: nav pad, double-tap to center, focus a part
function orbitBy(az, el) { const t = controls.target, off = camera.position.clone().sub(t), sp = new THREE.Spherical().setFromVector3(off); sp.theta += az; sp.phi = Math.min(Math.PI - .05, Math.max(.05, sp.phi + el)); camera.position.copy(t).add(new THREE.Vector3().setFromSpherical(sp)); }
function zoomBy(k) { const t = controls.target; camera.position.copy(t).add(camera.position.clone().sub(t).multiplyScalar(k)); }
function panBy(dx) { const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0).multiplyScalar(dx); camera.position.add(right); controls.target.add(right); }
function frameObj(obj, pad = 1.25) { const b = new THREE.Box3().setFromObject(obj); if (b.isEmpty()) return; const c = b.getCenter(new THREE.Vector3()), r = Math.max(.6, b.getSize(new THREE.Vector3()).length() / 2);
  const dir = camera.position.clone().sub(controls.target).normalize(); controls.target.copy(c); camera.position.copy(c).add(dir.multiplyScalar(r / Math.tan(camera.fov * D / 2) * pad)); }
let navHeld = null;
document.querySelectorAll('[data-nav]').forEach(b => { const act = () => { const a = b.dataset.nav; ({zin: () => zoomBy(.88), zout: () => zoomBy(1.13), left: () => orbitBy(-.12, 0), right: () => orbitBy(.12, 0), up: () => orbitBy(0, -.1), down: () => orbitBy(0, .1),
    pl: () => panBy(-camera.position.distanceTo(controls.target) * .06), pr: () => panBy(camera.position.distanceTo(controls.target) * .06), fit: () => sel && views[sel] ? frameObj(views[sel].G) : frameAll()})[a](); };
  b.addEventListener('pointerdown', e => { e.preventDefault(); act(); clearInterval(navHeld); navHeld = setInterval(act, 90); }); });
addEventListener('pointerup', () => clearInterval(navHeld)); addEventListener('pointercancel', () => clearInterval(navHeld));
$('bNav').onclick = e => { $('nav').classList.toggle('hide'); const on = !$('nav').classList.contains('hide'); e.target.classList.toggle('on', on); try { localStorage.setItem('mf-nav', on ? '1' : '0'); } catch (x) {} };
try { if (localStorage.getItem('mf-nav') === '1') { $('nav').classList.remove('hide'); $('bNav').classList.add('on'); } } catch (x) {}
$('bFocus2').onclick = () => $('bFocus').click();
let lastTap = 0;
canvas.addEventListener('pointerup', e => { const now = performance.now(); if (now - lastTap < 320 && !sculpting()) { const h = cast(e.clientX, e.clientY, visibleMeshes()); if (h) { controls.target.copy(h.point); tip('Centered here', 900); } } lastTap = now; });
let focusOn = false;
$('bFocus').onclick = () => { if (!$('bFocus').isConnected) return; if (!sel) return tip('Tap a part first'); focusOn = !focusOn; soloUid = focusOn ? sel : null; showBones = !focusOn; boneHelpers.forEach(h => h.visible = showBones);
  rebuildParts(); outliner(); if (focusOn) { frameObj(views[sel].G, 1.9); tip('Focus: only this part. Sculpt / paint / move it, then tap Focus again', 3500); } else frameAll(); $('bFocus').textContent = focusOn ? '↩ Back to whole creature' : '🔍 Focus on this part'; };

// ====================================================================== tabs, sheet, fullscreen
let tab = 'add';
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { tab = b.dataset.tab; document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.id === 'p-' + tab)); $('sheet').classList.remove('min');
  if (tab !== 'add') { placing = null; } if (tab === 'add') libUI(); if (tab === 'paint') matsUI(); if (tab === 'shape') shapeUI(); if (tab === 'skel') { skelUI(); syncBoneUI(); }
  if (tab === 'sculpt' && !sel) tip('Tap a part to sculpt it'); attachGizmo(); updateOrbit(); syncEdit(); });
{ // sheet: tap the handle to cycle small / half / tall, or drag it up and down
  const sh = $('sheet'), g = $('grab'); let y0 = null, moved = false;
  const setState = st => { sh.classList.toggle('min', st === 'min'); sh.classList.toggle('tall', st === 'tall'); };
  g.addEventListener('pointerdown', e => { y0 = e.clientY; moved = false; g.setPointerCapture(e.pointerId); });
  g.addEventListener('pointermove', e => { if (y0 == null) return; const d = e.clientY - y0; if (Math.abs(d) > 30) { moved = true; setState(d > 0 ? (sh.classList.contains('tall') ? 'mid' : 'min') : (sh.classList.contains('min') ? 'mid' : 'tall')); y0 = e.clientY; } });
  g.addEventListener('pointerup', () => { if (!moved) setState(sh.classList.contains('min') ? 'mid' : sh.classList.contains('tall') ? 'min' : 'tall'); y0 = null; }); }
$('bFull').onclick = () => { document.body.classList.add('full'); gizmo.detach(); resize(); };
$('restore').onclick = () => { document.body.classList.remove('full'); attachGizmo(); resize(); };
$('bMenu').onclick = () => $('menu').classList.toggle('open');
addEventListener('pointerdown', e => { if (!$('menu').contains(e.target) && e.target !== $('bMenu')) $('menu').classList.remove('open'); });

// ====================================================================== projects, export
$('mNew').onclick = () => { if (P.parts.length && !confirm('Start a new creature? (Save first if you want to keep this one)')) return; snap(); P = blankProject(P.skel); rebuildSkeleton(); rebuildParts(); outliner(); applyFX(); saveCur(); tip('New creature'); };
$('mSave').onclick = async () => { const n = prompt('Name this creature', P.name); if (!n) return; P.name = n; await idb('projects', 'readwrite', st => st.put(JSON.stringify(P), n)); saveCur(); tip('Saved "' + n + '"'); };
$('mLoad').onclick = async () => { const all = await idbAll('projects'); if (!all.length) return tip('Nothing saved yet');
  const n = prompt('Type a name to open:\n' + all.map(a => '• ' + a[0]).join('\n')); const f = all.find(a => a[0] === n); if (!f) return; snap(); restore(f[1]); applyFX(); tip('Opened "' + n + '"'); };
$('mCopy').onclick = () => { const txt = 'MYTH FORGE: ' + JSON.stringify(P); const o = $('out'); o.value = txt; o.style.display = 'block'; o.select(); setTimeout(() => o.style.display = 'none', 6000);
  try { navigator.clipboard.writeText(txt).then(() => tip('Copied! Paste it to Claude.')); } catch (e) {} };
$('mPaste').onclick = () => { const t = prompt('Paste a MYTH FORGE project'); if (!t) return; try { const j = t.replace(/^(TITAN|MYTH) FORGE:\s*/, ''); JSON.parse(j); snap(); restore(j); applyFX(); } catch (e) { tip('That text is not a project'); } };
$('mExport').onclick = async () => { const {GLTFExporter} = await import('three/addons/exporters/GLTFExporter.js'); const was = showBones; boneHelpers.forEach(h => h.visible = false); gizmo.detach();
  new GLTFExporter().parse(skelRoot, r => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r], {type: 'model/gltf-binary'})); a.download = (P.name || 'creature').replace(/\W+/g, '-') + '.glb'; a.click();
    boneHelpers.forEach(h => h.visible = was); attachGizmo(); tip('Downloaded — send it to Claude to put in the game'); }, e => tip('Export failed'), {binary: true, onlyVisible: true}); };
$('mCredits').onclick = () => { const used = [...new Set(P.parts.map(p => LIB[p.lib] && LIB[p.lib].src).filter(Boolean))];
  alert('Parts used in this creature come from:\n\n' + (used.length ? used.map(s => '• ' + s).join('\n') : '• (no parts yet)') + '\n\nMade-in-code parts and materials are ours. Free Packs are CC0 (public domain): free for any use, credit optional. "Your file" imports: check their license.'); };

// ====================================================================== workshop (create your own parts)
let inWS = false, wsBack = null;
function enterWS() { if (inWS) return; wsBack = JSON.stringify(P); inWS = true; document.body.classList.add('ws'); P = blankProject('none'); P.name = 'Workshop'; P.fx.bg = 'studio';
  rebuildSkeleton(); showBones = false; boneHelpers.forEach(h => h.visible = false); rebuildParts(); applyFX(); outliner(); syncEdit(); $('bSaveAsset').style.display = $('bExitWork').style.display = ''; $('menu').classList.remove('open');
  gFilter = 'Basic Shapes & Clay'; sFilter = null; document.querySelector('.tabs [data-tab="add"]').click();
  tip('Workshop: add clay or any part, sculpt / paint / stack pieces, then 💾 Save part', 5000); }
function exitWS() { if (!inWS) return; if (P.parts.length && !confirm('Leave the Workshop? Save your part first (💾) if you want to keep it.')) return; inWS = false; document.body.classList.remove('ws');
  if (guide) { guide.removeFromParent(); guide = null; } showBones = true; P = JSON.parse(wsBack); $('bSaveAsset').style.display = $('bExitWork').style.display = 'none'; rebuildSkeleton(); rebuildParts(); applyFX(); outliner(); syncEdit(); frameAll(); }
const WS_KINDS = [['Heads', '🐲 Head', 'Heads & Skulls'], ['Faces & Eyes', '👁 Face / eyes', 'Eyes & Faces'], ['Horns', '🦄 Horns / crest', 'Horns & Crests'], ['Necks', '🦒 Neck', 'Necks & Spines'], ['Bodies', '🫁 Body / torso', 'Torsos & Bellies'],
  ['Arms', '💪 Arm', 'Arms & Shoulders'], ['Hands & Claws', '✋ Hand / claw', 'Hands & Claws'], ['Legs', '🦵 Leg', 'Legs & Feet'], ['Feet', '🦶 Foot', 'Legs & Feet'], ['Tails', '🦎 Tail', 'Tails'], ['Wings', '🪽 Wing', 'Wings'],
  ['Armor & Plates', '🛡 Armor / plates', 'Back & Armor Plates'], ['Weapons', '⚔️ Weapon', 'Weapons'], ['Mech parts', '🤖 Mech part', 'Mech Details'], ['Gear & Magic', '✨ Gear / magic', 'Accessories & Magic'], ['Other', '🧱 Anything', 'Basic Shapes & Clay']];
const GUIDE = {Heads: [2.6, 2.4, 3], 'Faces & Eyes': [1.2, .8, .8], Horns: [.8, 2, .8], Necks: [1.4, 3.5, 1.4], Bodies: [3.4, 4.5, 2.6], Arms: [1.2, 4.5, 1.2], 'Hands & Claws': [1.4, 2, 1], Legs: [1.4, 5, 1.6], Feet: [1.2, 1, 2.4], Tails: [1.4, 8, 1.4], Wings: [5, 8, .4], 'Armor & Plates': [1.6, 1.6, .4], Weapons: [.6, 6, .3], 'Mech parts': [1.5, 1.5, 1.5], 'Gear & Magic': [2, 2, 2], Other: [2, 2, 2]};
let wsKind = 'Other', guide = null;
$('mWork').onclick = () => { $('menu').classList.remove('open'); $('wsKinds').innerHTML = ''; for (const [k, label, grp] of WS_KINDS) { const b = document.createElement('button'); b.textContent = label; b.style.minHeight = '56px'; b.style.fontSize = '15px';
  b.onclick = () => { $('wsPick').style.display = 'none'; wsKind = k; enterWS(); gFilter = grp; libUI(); showGuide(k); $('wsBadge').textContent = 'WORKSHOP · designing: ' + label.replace(/^\S+\s/, ''); }; $('wsKinds').append(b); } $('wsPick').style.display = 'block'; };
$('wsCancel').onclick = () => $('wsPick').style.display = 'none';
function showGuide(k) { if (guide) guide.removeFromParent(); const [w, h, d] = GUIDE[k] || [2, 2, 2]; guide = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), new THREE.MeshBasicMaterial({color: 0x40ffb0, wireframe: true, transparent: true, opacity: .25})); guide.add(box);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 10), new THREE.MeshBasicMaterial({color: 0xff8a3a})); guide.add(dot);
  const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, h * .5, d / 2), 1, 0x40ffb0); guide.add(arrow); scene.add(guide); frameObj(box, 1.4);
  tip('Green box = normal size for a ' + k.toLowerCase() + '. Orange dot = where it attaches. Arrow = front.', 6000); } $('bExitWork').onclick = exitWS;
const MY_SUBS = ['Heads', 'Faces & Eyes', 'Horns', 'Necks', 'Bodies', 'Arms', 'Hands & Claws', 'Legs', 'Feet', 'Tails', 'Wings', 'Armor & Plates', 'Weapons', 'Mech parts', 'Gear & Magic', 'Other'];
const ALONG_SUBS = new Set(['Heads', 'Necks', 'Bodies', 'Arms', 'Legs', 'Tails', 'Wings']);
$('bSaveAsset').onclick = async () => {
  const vis = P.parts.filter(p => !p.hidden && views[p.uid]); if (!vis.length) return tip('Add something first');
  const name = prompt('Name your part', 'My part'); if (!name) return;
  const def = Math.max(1, MY_SUBS.indexOf(wsKind) + 1), sub = prompt('Which category?\n' + MY_SUBS.map((s, i) => (i + 1) + '. ' + s).join('\n'), String(def)); const cat = MY_SUBS[(+sub || def) - 1] || 'Other';
  skelRoot.updateMatrixWorld(true); const pieces = [];
  for (const pt of vis) { const v = views[pt.uid]; v.meshes.forEach(m => { const mi = m.userData.mi, g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld);
    const mk = pt.mat && pt.mat[mi] != null ? pt.mat[mi] : (pt.matAll || (pieces_of(pt)[mi] || {}).mat || 'skin');
    pieces.push({pos: Array.from(g.attributes.position.array, v => +v.toFixed(4)), idx: Array.from(g.index.array), mat: mk, tint: pt.tint, tile: pt.tile || 1}); }); }
  const box = new THREE.Box3(); for (const pc of pieces) for (let i = 0; i < pc.pos.length; i += 3) box.expandByPoint(new THREE.Vector3(pc.pos[i], pc.pos[i + 1], pc.pos[i + 2]));
  const tg = (prompt('Tags (optional, comma separated) e.g. lion, gold, sphinx', '') || '').toLowerCase().split(',').map(x => x.trim().replace(/^#/, '')).filter(Boolean);
  const id = 'my:' + Date.now().toString(36), rec = {id, name, sub: cat, tags: tg, along: ALONG_SUBS.has(cat), base: [0, Math.min(0, box.min.y), 0], pieces, made: new Date().toISOString().slice(0, 10)};
  await idb('myparts', 'readwrite', st => st.put(rec, id)); registerMine(rec); tip('Saved "' + name + '" to My Parts → ' + cat, 3500);
};
const pieces_of = pt => pieces(pt.lib, pt.params);
function registerMine(rec) { LIB[rec.id] = {id: rec.id, group: 'My Parts', sub: rec.sub, name: rec.name, mine: true, tags: rec.tags || [], along: rec.along, src: 'Made by you in the Workshop (yours)',
  make: () => rec.pieces.map(pc => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pc.pos, 3)); g.setIndex(pc.idx); g.translate(0, -rec.base[1], 0); return {geo: g, mat: pc.mat}; })}; delete LIB[rec.id]._p; }
async function loadMine() { try { for (const [, rec] of await idbAll('myparts')) registerMine(rec); } catch (e) {} }
// delete own parts from the Add grid with a long press
addEventListener('contextmenu', async e => { const img = e.target.closest && e.target.closest('.item') && e.target.closest('.item').querySelector('img'); const id = img && img.dataset.id;
  if (!id || !LIB[id] || !LIB[id].mine) return; e.preventDefault(); if (!confirm('Delete your part "' + LIB[id].name + '"?')) return; await idb('myparts', 'readwrite', st => st.delete(id)); delete LIB[id]; libUI(); });
// patterns
$('bPattern').onclick = () => $('fPattern').click();
$('fPattern').onchange = async e => { for (const f of e.target.files) { const url = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
    const key = 'pat_' + Date.now().toString(36), name = f.name.replace(/\.[^.]+$/, '').slice(0, 18); await idb('patterns', 'readwrite', st => st.put({key, name, url}, key)); await addPat({key, name, url}); }
  e.target.value = ''; matCat = 'My Patterns'; matsUI(); tip('Pattern added — tap it to paint the selected part'); };
const addPat = rec => new Promise(res => { const img = new Image(); img.onload = () => { MATS.addPattern(THREE, rec.key, rec.name, img); delete matThumbs[rec.key]; res(); }; img.onerror = res; img.src = rec.url; });
async function loadPatterns() { try { for (const [, rec] of await idbAll('patterns')) await addPat(rec); } catch (e) {} }
$('bPatternDel').onclick = async () => { const pt = partBy(sel), k = pt && pt.matAll; if (!k || !k.startsWith('pat_')) return tip('Select a part painted with one of your patterns'); if (!confirm('Remove this pattern?')) return;
  await idb('patterns', 'readwrite', st => st.delete(k)); const i = MATS.LIST.findIndex(l => l[0] === k); if (i >= 0) MATS.LIST.splice(i, 1); P.parts.forEach(p => { if (p.matAll === k) p.matAll = null; }); rebuildParts(); matsUI(); saveCur(); };
$('sTile').onpointerdown = () => snap();
$('sTile').oninput = e => { const pt = partBy(sel); if (!pt) return; pt.tile = +e.target.value; buildPart(pt); if (paintTwin) syncTwin(pt); saveCur(); };


// ====================================================================== bone numbers on the model: all / picked / off, fade, size (saved)
const NUMS = Object.assign({mode: 'pick', pick: [], fade: .7, size: .8}, (() => { try { return JSON.parse(localStorage.getItem('mf-nums')) || {}; } catch (e) { return {}; } })());
const saveNums = () => { try { localStorage.setItem('mf-nums', JSON.stringify(NUMS)); } catch (e) {} };
function numShown(sp) { if (NUMS.mode === 'off') return false; if (NUMS.mode === 'all') return true; return sp.userData.bone === selBone || NUMS.pick.includes(sp.userData.num); }
function applyNums() { for (const h of boneHelpers) { if (!h.isSprite) continue; h.visible = showBones && numShown(h); const s = .036 * NUMS.size * (h.userData.bone === selBone ? 1.15 : 1); h.scale.set(s, s, 1); h.material.opacity = h.userData.bone === selBone ? 1 : NUMS.fade; } }
function numCtlUI() { for (const id of ['numCtlAdd', 'numCtlSkel']) { const el = $(id); if (!el) continue; el.innerHTML = '';
  for (const [m, t] of [['all', '# All'], ['pick', '# Picked'], ['off', '# Off']]) { const b = document.createElement('button'); b.textContent = t; b.className = NUMS.mode === m ? 'on' : '';
    b.onclick = () => { NUMS.mode = m; saveNums(); numCtlUI(); tip(m === 'pick' ? 'Only the bone you picked + the numbers you type show' : m === 'off' ? 'Numbers hidden (dots stay)' : 'All numbers', 1600); }; el.append(b); }
  const f = document.createElement('input'); f.type = 'range'; f.min = .15; f.max = 1; f.step = .05; f.value = NUMS.fade; f.title = 'Fade numbers'; f.style.flex = '1'; f.style.minWidth = '70px';
  f.oninput = () => { NUMS.fade = +f.value; saveNums(); }; el.append(Object.assign(document.createElement('span'), {textContent: 'Fade', style: 'font-size:12px;opacity:.7'}), f);
  if (NUMS.mode === 'pick') { const i = document.createElement('input'); i.type = 'text'; i.inputMode = 'numeric'; i.placeholder = 'Show #s, e.g. 2, 28'; i.value = NUMS.pick.join(', ');
    i.onchange = () => { NUMS.pick = [...new Set((i.value.match(/\d+/g) || []).map(Number))]; saveNums(); numCtlUI(); }; el.append(i); } } }
numCtlUI();

// ====================================================================== focus window: a small window that stays zoomed on the picked part while the big view shows everything
const fwCam = new THREE.PerspectiveCamera(35, 1, .05, 3000), FW = {on: false, size: 1, az: .6, el: .35, zoom: 1}, FW_SIZES = [['S', .36], ['M', .5], ['L', .68]];
function fwLayout() { const w = Math.round(Math.min(innerWidth * FW_SIZES[FW.size][1], innerHeight * .42)); Object.assign($('fwin').style, {width: w + 'px', height: w + 'px'}); $('fwSize').textContent = 'Size ' + FW_SIZES[FW.size][0]; }
function fwToggle() { FW.on = !FW.on; $('fwin').classList.toggle('on', FW.on); ['bFWin', 'bFWin2'].forEach(id => $(id) && $(id).classList.toggle('on', FW.on)); fwLayout(); if (FW.on && !sel) tip('Tap a part to see it in the window', 2200); }
$('bFWin').onclick = fwToggle; $('bFWin2').onclick = fwToggle; $('fwClose').onclick = fwToggle;
$('fwSize').onclick = () => { FW.size = (FW.size + 1) % FW_SIZES.length; fwLayout(); };
{ const pts = new Map(); let pinch0 = 0; const el = $('fwin');
  el.addEventListener('pointerdown', e => { if (e.target.tagName === 'BUTTON') return; e.preventDefault(); e.stopPropagation(); el.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
  el.addEventListener('pointermove', e => { const p = pts.get(e.pointerId); if (!p) return; e.stopPropagation();
    if (pts.size === 1) { FW.az -= (e.clientX - p[0]) * .012; FW.el = Math.max(-1.45, Math.min(1.45, FW.el + (e.clientY - p[1]) * .01)); }
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch0) FW.zoom = Math.max(.3, Math.min(4, FW.zoom * pinch0 / d)); pinch0 = d; } });
  const up = e => { pts.delete(e.pointerId); pinch0 = 0; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { e.preventDefault(); FW.zoom = Math.max(.3, Math.min(4, FW.zoom * (e.deltaY > 0 ? 1.1 : .9))); }, {passive: false}); }
const fwBox = new THREE.Box3(), fwC = new THREE.Vector3(), fwS = new THREE.Vector3();
function fwRender() { if (!FW.on) return; const v = sel && views[sel], pt = sel && partBy(sel); $('fwCap').textContent = v ? (pt && LIB[pt.lib] ? LIB[pt.lib].name || pt.lib : 'Part') : 'Tap a part';
  if (!v) return; fwBox.setFromObject(v.G); if (fwBox.isEmpty()) return; fwBox.getCenter(fwC); const r = Math.max(.3, fwBox.getSize(fwS).length() / 2), d = r / Math.tan(fwCam.fov * D / 2) * 1.25 * FW.zoom;
  fwCam.position.set(fwC.x + d * Math.cos(FW.el) * Math.sin(FW.az), fwC.y + d * Math.sin(FW.el), fwC.z + d * Math.cos(FW.el) * Math.cos(FW.az)); fwCam.lookAt(fwC); fwCam.near = Math.max(.01, d / 200); fwCam.far = d * 50; fwCam.updateProjectionMatrix();
  const rc = $('fwin').getBoundingClientRect(), x = rc.left + 2, w = rc.width - 4, h = rc.height - 4, y = innerHeight - rc.bottom + 2;
  const hidden = []; for (const h2 of boneHelpers) if (h2.visible) { h2.visible = false; hidden.push(h2); }
  for (const k in views) if (k !== sel && views[k].G.visible) { views[k].G.visible = false; hidden.push(views[k].G); }
  if (gizmo.visible) { gizmo.visible = false; hidden.push(gizmo); } const hlWas = typeof hl !== 'undefined' && hl ? hl.visible : null; if (hlWas !== null) hl.visible = false;
  renderer.setScissorTest(true); renderer.setScissor(x, y, w, h); renderer.setViewport(x, y, w, h); renderer.render(scene, fwCam);
  renderer.setScissorTest(false); renderer.setViewport(0, 0, innerWidth, innerHeight); hidden.forEach(o => o.visible = true); if (hlWas !== null) hl.visible = hlWas; }

// ====================================================================== toy mode: break a part into its pieces, drag parts and they stick where you drop them, parts box
function pieceClusters(pt) { const pcs = pieces(pt.lib, pt.params), boxes = pcs.map(pc => { pc.geo.computeBoundingBox(); const b = pc.geo.boundingBox.clone(), s = b.getSize(new THREE.Vector3()).length(); return b.expandByScalar(Math.max(.005, s * .01)); });
  const par = pcs.map((_, i) => i), f = i => par[i] === i ? i : (par[i] = f(par[i]));
  for (let i = 0; i < pcs.length; i++) for (let j = i + 1; j < pcs.length; j++) if (boxes[i].intersectsBox(boxes[j])) par[f(i)] = f(j);
  const groups = {}; pcs.forEach((_, i) => { if (pt.keep && !pt.keep.includes(i)) return; (groups[f(i)] = groups[f(i)] || []).push(i); });
  return Object.values(groups).map(ids => { const b = new THREE.Box3(); ids.forEach(i => b.union(boxes[i])); const cc = b.getCenter(new THREE.Vector3()); return {ids, off: [+cc.x.toFixed(3), +b.min.y.toFixed(3), +cc.z.toFixed(3)]}; }); }
function splitOne(pt, groups) { const v = views[pt.uid]; v.G.updateMatrix(); const out = [];
  for (const g of groups) { const q = JSON.parse(JSON.stringify(pt)); q.uid = uid(); q.keep = g.ids; q.twin = null;
    const o0 = pt.off || [0, 0, 0], d = new THREE.Vector3(g.off[0] - o0[0], g.off[1] - o0[1], g.off[2] - o0[2]).multiply(v.M.scale).applyMatrix4(v.G.matrix);
    q.p = d.toArray().map(x => +x.toFixed(3)); q.off = g.off;
    if (q.sculpt) for (const k of Object.keys(q.sculpt)) if (!g.ids.includes(+k)) delete q.sculpt[k];
    out.push(q); }
  P.parts.splice(P.parts.indexOf(pt), 1, ...out); v.G.removeFromParent(); delete views[pt.uid]; out.forEach(buildPart); return out; }
$('bBreak').onclick = () => { const pt = partBy(sel); if (!pt) return tip('Tap a part first'); const groups = pieceClusters(pt); if (groups.length < 2) return tip('This part is already one piece');
  snap(); const tw = pt.twin && partBy(pt.twin), a = splitOne(pt, groups); if (tw) { const b = splitOne(tw, pieceClusters(tw)); a.forEach((q, i) => { if (b[i]) { q.twin = b[i].uid; b[i].twin = q.uid; } }); }
  select(a[0].uid); outliner(); saveCur(); tip('Broke into ' + groups.length + ' pieces — turn on 🧲 Sticky and drag them anywhere', 3500); };
let sticky = false, drag = null;
function setSticky(on) { sticky = on; $('bSticky').classList.toggle('on', on); if (on) { gizmo.detach(); tip('Sticky on: drag a part with your finger or pen — it sticks where you let go. Drop it off the model to put it in the Parts box', 4200); } else attachGizmo(); }
$('bSticky').onclick = () => setSticky(!sticky);
const dragPlane = new THREE.Plane(), dragTmp = new THREE.Vector3();
function stickyHit(x, y) { const own = drag ? views[drag.uid].meshes : []; return cast(x, y, visibleMeshes().filter(m => !own.includes(m))); }
canvas.addEventListener('pointerdown', e => { if (!sticky || sculpting() || placing || touches.size > 1 || (e.pointerType === 'mouse' && e.button !== 0)) return;
  const h = cast(e.clientX, e.clientY, visibleMeshes()); if (!h) return; const uid0 = h.object.userData.uid, v = views[uid0]; if (!v) return;
  e.stopImmediatePropagation(); e.preventDefault(); snap(); select(uid0); gizmo.detach(); controls.enabled = false;
  const G = v.G; G.updateMatrixWorld(true); const wp = new THREE.Vector3(), wq = new THREE.Quaternion(); G.getWorldPosition(wp); G.getWorldQuaternion(wq);
  const ws = new THREE.Vector3(); G.getWorldScale(ws); scene.attach(G);
  drag = {uid: uid0, id: e.pointerId, grab: h.point.clone().sub(wp), q0: wq.clone(), moved: false, hit: null};
  dragPlane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()).negate(), h.point); try { canvas.setPointerCapture(e.pointerId); } catch (x) {} }, true);
canvas.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; e.stopImmediatePropagation(); drag.moved = true; const G = views[drag.uid].G, pt = partBy(drag.uid);
  const h = stickyHit(e.clientX, e.clientY); drag.hit = h;
  if (h) { G.position.copy(h.point); const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize() : new THREE.Vector3(0, 1, 0);
    if (!isAlong(LIB[pt.lib]) || pt.keep) G.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); else G.quaternion.copy(drag.q0); drag.n = n; }
  else { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(dragPlane, dragTmp)) G.position.copy(dragTmp).sub(drag.grab); G.quaternion.copy(drag.q0); } }, true);
function endDrag(e) { if (!drag || (e && e.pointerId !== drag.id)) return; const d = drag; drag = null; controls.enabled = true; const pt = partBy(d.uid), v = views[d.uid]; if (!pt || !v) return;
  if (!d.moved) { buildPart(pt); return; }
  if (d.hit) { const tgt = partBy(d.hit.object.userData.uid), boneName = (tgt && tgt.bone) || null, B = (boneName && bones[boneName]) || skelRoot;
    v.G.updateMatrixWorld(true); B.updateMatrixWorld(true); const m = v.G.matrixWorld.clone().premultiply(B.matrixWorld.clone().invert()), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(p, q, s);
    const eu = new THREE.Euler().setFromQuaternion(q); pt.bone = boneName; pt.p = p.toArray().map(x => +x.toFixed(3)); pt.r = [eu.x, eu.y, eu.z].map(x => +(x / D).toFixed(1));
    buildPart(pt); const tw = pt.twin && partBy(pt.twin); if (tw) { tw.bone = (boneName && twinName(boneName)) || boneName; mirrorInto(pt, tw); }
    if (navigator.vibrate) try { navigator.vibrate(18); } catch (x) {} tip('Stuck on ' + (tgt && LIB[tgt.lib] ? LIB[tgt.lib].name : 'the body'), 1400); }
  else { pt.boxed = true; pt.hidden = true; const tw = pt.twin && partBy(pt.twin); if (tw) { tw.twin = null; pt.twin = null; } buildPart(pt); sel = null; tip('Put in the Parts box (Add tab) — tap it there to stick it back on', 3000); }
  outliner(); boxUI(); saveCur(); }
addEventListener('pointerup', endDrag, true); addEventListener('pointercancel', endDrag, true);
let unboxing = null;
function boxUI() { const el = $('boxRow'); if (!el) return; el.innerHTML = ''; const box = P.parts.filter(p => p.boxed); $('boxWrap').style.display = box.length ? '' : 'none';
  for (const pt of box) { const b = document.createElement('button'); b.textContent = (LIB[pt.lib] ? LIB[pt.lib].name : 'part') + (pt.keep ? ' piece' : ''); b.className = unboxing === pt.uid ? 'on' : '';
    b.onclick = () => { unboxing = unboxing === pt.uid ? null : pt.uid; boxUI(); if (unboxing) tip('Tap the model where it should stick', 2500); }; el.append(b); }
  if (box.length) { const b = document.createElement('button'); b.textContent = '🗑 Empty box'; b.onclick = () => { if (!confirm('Delete the ' + box.length + ' part(s) in the box?')) return; snap(); P.parts = P.parts.filter(p => !p.boxed); rebuildParts(); unboxing = null; boxUI(); outliner(); saveCur(); }; el.append(b); } }
canvas.addEventListener('pointerup', e => { if (!unboxing) return; const h = cast(e.clientX, e.clientY, visibleMeshes()); if (!h) return; const pt = partBy(unboxing); unboxing = null; if (!pt) return boxUI();
  snap(); pt.boxed = false; pt.hidden = false; const tgt = partBy(h.object.userData.uid); pt.bone = (tgt && tgt.bone) || null; const B = (pt.bone && bones[pt.bone]) || skelRoot; B.updateMatrixWorld(true);
  const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize() : new THREE.Vector3(0, 1, 0), bq = new THREE.Quaternion(); B.getWorldQuaternion(bq);
  const ql = bq.invert().multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n)), eu = new THREE.Euler().setFromQuaternion(ql);
  pt.p = h.point.clone().applyMatrix4(B.matrixWorld.clone().invert()).toArray().map(x => +x.toFixed(3)); pt.r = [eu.x, eu.y, eu.z].map(x => +(x / D).toFixed(1));
  buildPart(pt); select(pt.uid); boxUI(); outliner(); saveCur(); tip('Stuck back on', 1200); });
boxUI();

// ====================================================================== guide: first-time tour + help page
$('mHelp').onclick = () => { $('menu').classList.remove('open'); $('help').classList.add('open'); };
$('helpX').onclick = () => $('help').classList.remove('open');
const tabBtn = t => document.querySelector('.tabs [data-tab="' + t + '"]');
const TOUR = [
  {t: 'Welcome to Myth Forge', p: 'Build monsters and mechs like a toy: snap parts on, drag them around, sculpt and paint. Pick something to start with:', start: true},
  {sel: '.tabs [data-tab="add"]', pre: () => tabBtn('add').click(), t: 'Add parts', p: 'The Add tab has every part. Tap a category, then a part.'},
  {sel: '#lib', pre: () => tabBtn('add').click(), t: 'Snap it on', p: 'After picking a part, tap an orange dot (a bone) or the body. It snaps on. Mirror L/R adds the other side too.'},
  {sel: '.tabs [data-tab="edit"]', pre: () => tabBtn('edit').click(), t: 'Move', p: 'Tap any part on the model, then use Move / Turn / Stretch and the Size slider.'},
  {sel: '#bSticky', pre: () => tabBtn('edit').click(), t: '🧲 Sticky (toy mode)', p: 'Turn this on and drag parts with your finger or pen. They stick where you let go. Drop one off the model and it goes in the Parts box.'},
  {sel: '#bBreak', pre: () => tabBtn('edit').click(), t: '🧩 Break apart', p: 'A row of spikes or crystals is one part. Break it apart to move or remove them one by one.'},
  {sel: '#bFWin', pre: () => tabBtn('edit').click(), t: '🪟 Focus window', p: 'A small window that stays zoomed on the part you picked, while you still see the whole creature.'},
  {sel: '.tabs [data-tab="sculpt"]', t: 'Sculpt + Paint', p: 'Sculpt pushes and pulls like clay (the S Pen works great). Paint has materials and a brush.'},
  {sel: '#bMenu', t: 'Save + help', p: '⋯ has Save as, Download model, ❓ How to build, and this tour again. Have fun!'}];
let tourI = 0;
function tourShow() { const s = TOUR[tourI], el = $('tour'), card = el.querySelector('.card'), hole = el.querySelector('.hole'); el.style.display = 'block'; if (s.pre) s.pre();
  card.querySelector('h4').textContent = s.t; card.querySelector('p').textContent = s.p; const bs = card.querySelector('.btns'); bs.innerHTML = '';
  bs.append(Object.assign(document.createElement('span'), {className: 'dots', textContent: (tourI + 1) + ' / ' + TOUR.length}));
  const add = (t, f, on) => { const b = document.createElement('button'); b.textContent = t; if (on) b.className = 'on'; b.onclick = f; bs.append(b); };
  if (s.start) { for (const [t, id] of [['🤖 Mech', 'heromech'], ['🦖 Kaiju', 'basaltkaiju'], ['🐢 Turtle', 'snapjaw']]) add(t, () => { const st = STARTERS.find(x => x.id === id); if (st) { loadStarter(st); skelUI(); } tourI++; tourShow(); }, true);
    add('Keep what I have', () => { tourI++; tourShow(); }); add('Skip tour', tourEnd); }
  else { add('Skip', tourEnd); if (tourI > 0) add('Back', () => { tourI--; tourShow(); }); add(tourI === TOUR.length - 1 ? 'Done' : 'Next', () => { if (tourI === TOUR.length - 1) tourEnd(); else { tourI++; tourShow(); } }, true); }
  requestAnimationFrame(() => { const t = s.sel && document.querySelector(s.sel); if (t) { t.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = t.getBoundingClientRect(), pad = 6;
      Object.assign(hole.style, {display: 'block', left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: Math.min(r.height, innerHeight * .5) + pad * 2 + 'px'});
      const below = r.top < innerHeight * .45; Object.assign(card.style, below ? {top: Math.min(innerHeight - 220, r.top + Math.min(r.height, innerHeight * .5) + 16) + 'px', bottom: 'auto'} : {bottom: Math.max(12, innerHeight - r.top + 16) + 'px', top: 'auto'}); }
    else { hole.style.display = 'none'; Object.assign(card.style, {top: '30%', bottom: 'auto'}); } }); }
function tourEnd() { $('tour').style.display = 'none'; try { localStorage.setItem('mf-tour-done', '1'); } catch (e) {} }
function tourStart() { $('menu').classList.remove('open'); tourI = 0; tourShow(); }
$('mTour').onclick = tourStart;
try { if (!localStorage.getItem('mf-tour-done')) setTimeout(tourStart, 700); } catch (e) {}
// ====================================================================== loop
function resize() { renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight;
  const sh = $('sheet'), land = innerWidth >= 760 && innerWidth > innerHeight, full = document.body.classList.contains('full');
  const cover = full ? 0 : land ? 0 : sh.getBoundingClientRect().height, side = full || !land ? 0 : sh.getBoundingClientRect().width;
  camera.setViewOffset(innerWidth, innerHeight, side / 2, cover / 2 - 25, innerWidth, innerHeight); camera.updateProjectionMatrix(); }
new ResizeObserver(() => resize()).observe($('sheet'));
addEventListener('resize', resize); resize();
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => { const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime; controls.update(); animate(dt); fxTick(dt, t);
  if (spin) skelRoot.rotation.y += dt * .5; applyNums(); if (useBloom) composer.render(); else renderer.render(scene, camera); fwRender(); });
addEventListener('keydown', e => { if (e.target.tagName === 'INPUT') return; const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); (e.shiftKey ? $('bRedo') : $('bUndo')).click(); }
  else if (k === 'delete' || k === 'x') $('bDel').click(); else if (k === 'h') $('bHide').click(); else if (k === 'g') document.querySelector('[data-gz=translate]').click();
  else if (k === 'r') document.querySelector('[data-gz=rotate]').click(); else if (k === 's' && !e.ctrlKey) document.querySelector('[data-gz=scale]').click(); });

// ====================================================================== start
(async () => {
  try { for (const [name, buf] of await idbAll('imports')) await addImport(name, buf); } catch (e) {}
  await loadMine(); await loadPatterns();
  rebuildSkeleton(); rebuildParts(); applyFX(); libUI(); outliner(); updateOrbit(); frameAll();
  tip(Object.keys(LIB).length + ' parts ready. Pick one and tap a bone dot.', 3500);
  window.FORGE = {P: () => P, LIB, addPart, bones: () => bones, views: () => views, select, rebuildParts};   // for testing
})();
