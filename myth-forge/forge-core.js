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
const LIB = {}, GROUP_ORDER = ['Base Body', 'Basic Shapes & Clay', 'Part Makers (sliders)', 'Heads & Skulls', 'Jaws & Teeth', 'Horns & Crests', 'Eyes & Faces', 'Necks & Spines', 'Torsos & Bellies', 'Arms & Shoulders', 'Hands & Claws',
  'Legs & Feet', 'Tails', 'Wings', 'Back & Armor Plates', 'Tentacles & Extra Limbs', 'Bones & Skeleton', 'Mech Heads', 'Mech Eyes & Faces', 'Mech Torso & Core', 'Mech Arms & Legs', 'Mech Details', 'Mecha Dragon', 'Kaiju Kit', 'Turtle Kit', 'Dino Kit', 'Cloth & Capes', 'Weapons', 'Accessories & Magic', 'Low-Poly Builds', 'Free Packs (CC0)', 'My Imports'];
const MY = 'My Parts';
const ALONG = new Set(['Necks & Spines', 'Arms & Shoulders', 'Legs & Feet', 'Tails', 'Wings', 'Tentacles & Extra Limbs', 'Mech Arms & Legs', 'Heads & Skulls', 'Mech Heads', 'Torsos & Bellies', 'Mech Torso & Core', 'Hands & Claws']);
const isAlong = e => e.along != null ? e.along : ALONG.has(e.group) || (e.group === 'Mecha Dragon' && /Head|Neck|Wings|Limbs/.test(e.sub)) || e.id === 'md_chest' || e.id === 'md_belly';
for (const reg of (window.FORGE_PARTS || [])) { try { for (const p of reg(THREE, K)) LIB[p.id] = {...p, src: p.src || 'Made in code for Titan Forge (ours)'}; } catch (e) { console.error('parts file failed', e); } }
// 🔷 low-poly versions of every body / mech / gear part (Nov 9): lpv_<id>, same group + body slot, faceted with fewer polygons (mech parts a bit finer so they keep their shape)
const LP_SKIP = /^(Base Body|Basic Shapes & Clay|Part Makers \(sliders\)|Free Packs \(CC0\)|My Imports|My Parts|Low-Poly Builds)$/;
for (const id of Object.keys(LIB)) { const e = LIB[id]; if (LP_SKIP.test(e.group) || e.params || e.lowpoly) continue; const lv = /^Mech |Mecha Dragon/.test(e.group) ? 4 : 2;
  LIB['lpv_' + id] = {...e, id: 'lpv_' + id, name: e.name + ' (low-poly)', lpv: id, tags: [...(e.tags || []), 'low poly'], make: () => pieces(id).map(pc => ({geo: lowpolyGeo(pc.geo, lv), mat: pc.mat})), _p: undefined};
  e.hasLpv = 'lpv_' + id; }
let lpParts = false; try { lpParts = localStorage.getItem('mf-lpparts') === '1'; } catch (x) {}
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
function restore(j) { P = JSON.parse(j); rebuildSkeleton(); rebuildParts(); outliner(); syncEdit(); saveCur(); if (typeof bodyUI === 'function') bodyUI(); if (typeof boxUI === 'function') boxUI(); }
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
    if (add && placing && LIB[placing] && groupForBone(n)[0] === LIB[placing].group) b.classList.add('sug');
    b.onclick = () => goBone(n, add); el.append(b); }); } }
const MECH_SKELS = new Set(['mech', 'walker', 'tank']);
function groupForBone(n) { const tag = (boneRow(n) || [])[4], mech = MECH_SKELS.has(P.skel);
  const m = mech ? {head: 'Mech Heads', jaw: 'Mech Heads', neck: 'Mech Torso & Core', chest: 'Mech Torso & Core', spine: 'Mech Torso & Core', armU: 'Mech Arms & Legs', armF: 'Mech Arms & Legs', hand: 'Mech Arms & Legs', legU: 'Mech Arms & Legs', legL: 'Mech Arms & Legs', foot: 'Mech Arms & Legs'}
    : {head: 'Heads & Skulls', jaw: 'Jaws & Teeth', neck: 'Necks & Spines', chest: 'Torsos & Bellies', spine: 'Torsos & Bellies', armU: 'Arms & Shoulders', armF: 'Arms & Shoulders', hand: 'Hands & Claws', legU: 'Legs & Feet', legL: 'Legs & Feet', foot: 'Legs & Feet', tail: 'Tails', wingA: 'Wings', wingB: 'Wings', wingC: 'Wings', extra: 'Tentacles & Extra Limbs'};
  const subFor = {foot: /foot|feet|hoof|paw/i, hand: null}; let g = m[tag]; if (g && !Object.values(LIB).some(e => e.group === g)) g = tag === 'tail' ? 'Part Makers (sliders)' : 'Part Makers (sliders)'; return [g, tag]; }
let manualCat = false;                                          // you picked a category yourself: bones stop changing it until you tap a bone again
function catForBone(n) { const [g] = groupForBone(n); if (!g) return; gFilter = g; sFilter = null; query = ''; tagFilter = null; $('search').value = ''; catsOpen = false; manualCat = false; if (tab === 'add') libUI(); }
function goBone(n, add) { selBone = n; markBone(); boneNumsUI(); syncBoneUI(); if (!(add && placing)) catForBone(n);
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
function matFor(key, tint, tile, vc) { const k = key + '|' + (tint || '') + '|' + (tile || 1) + (vc ? '|vc' : ''); if (!matCache[k]) { matCache[k] = toonMat(MATS.makeMat(THREE, key, tint, tile)); matCache[k].vertexColors = !!vc; styleMat(matCache[k]); } const m = matCache[k];
  m.wireframe = wire; if (xray) { const c = m.clone(); c.transparent = true; c.opacity = .4; c.depthWrite = false; return c; } return m; }
// ---- eye glow color: recolors every 'Glow (fire)' piece (eyes, visors, lamps) on the model (P.fx.eyeGlow)
// ---- 🎨 toon shading (P.fx.toon): light falls in 3 flat bands with a hard small highlight; ✏ outlines (P.fx.outline) = dark inverted-hull edge around every part
function toonMat(m) { if (!P || !P.fx || !P.fx.toon) return m; const prev = m.onBeforeCompile, pck = m.customProgramCacheKey;
  m.onBeforeCompile = sh => { prev(sh); sh.fragmentShader = sh.fragmentShader.replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
    { float dl = dot(diffuseColor.rgb, vec3(.333)) + 1e-4, f = dot(reflectedLight.directDiffuse, vec3(.333)) / dl * 3.14159;
      float q = f < .18 ? .28 : f < .65 ? .62 : 1.0; reflectedLight.directDiffuse = diffuseColor.rgb * q * 1.05 / 3.14159;
      float id = dot(reflectedLight.indirectDiffuse, vec3(.333)) / dl * 3.14159; reflectedLight.indirectDiffuse = diffuseColor.rgb * (id < .5 ? .32 : .45) / 3.14159;
      float sp = dot(reflectedLight.directSpecular, vec3(.333)); reflectedLight.directSpecular = vec3(smoothstep(.32, .38, sp)) * .35; reflectedLight.indirectSpecular *= .25; }`); };
  m.customProgramCacheKey = () => pck() + '-toon'; return m; }
const outlineMat = new THREE.MeshBasicMaterial({color: 0x0a0a10, side: THREE.BackSide});
outlineMat.onBeforeCompile = sh => { sh.uniforms.uOut = {value: .035}; sh.vertexShader = 'uniform float uOut;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normalize(normal) * uOut;'); };
function addOutline(M, mesh, pt) { if (!P.fx.outline) return; const s = Math.max(.2, pt.s || 1); const om = outlineMat.clone(); om.onBeforeCompile = sh => { sh.vertexShader = 'uniform float uOut;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normalize(normal) * uOut;'); sh.uniforms.uOut = {value: .05 / s}; };
  om.customProgramCacheKey = () => 'outline'; const o = new THREE.Mesh(mesh.geometry, om); o.raycast = () => {}; M.add(o); }
function styleMat(m) { if (!m || !m.userData || m.userData.key !== 'glow') return m; const u = m.userData; if (!u.baseEm) { u.baseEm = m.emissive.clone(); u.baseCol = m.color.clone(); }
  const g = P && P.fx && P.fx.eyeGlow; if (g) { const c = new THREE.Color(g); m.emissive.copy(c); m.color.copy(c).lerp(new THREE.Color(1, 1, 1), .45); } else { m.emissive.copy(u.baseEm); m.color.copy(u.baseCol); } return m; }
function applyEyeGlow() { Object.values(matCache).forEach(styleMat); Object.values(views).forEach(v => v.meshes.forEach(m => styleMat(m.material))); }
// ---- fade away: the far end of a part dissolves into drifting dust (sand wings, galaxy skins…). pt.fade = {amt 0..1, dust bool}
const FADE_T = {value: 0};
const FADE_GLSL = `uniform float uFadeA; uniform float uFadeR; uniform float uFT; uniform float uBurn; float fadeEdge = 0.0; float fadeChar = 0.0;
float fh(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float fn3(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(mix(fh(i), fh(i + vec3(1, 0, 0)), f.x), mix(fh(i + vec3(0, 1, 0)), fh(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(fh(i + vec3(0, 0, 1)), fh(i + vec3(1, 0, 1)), f.x), mix(fh(i + vec3(0, 1, 1)), fh(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
`;
const FADE_MAIN = `{ float fd = length(vTP) / max(uFadeR, 1e-3), st = 1.0 - uFadeA, sc = 3.0 / max(uFadeR * .3, .05);
  vec3 q = vTP * sc + vec3(0.0, -uFT * .7, uFT * .3); float n = fn3(q) * .62 + fn3(q * 2.7) * .38;
  float e = smoothstep(st, 1.0, fd); e = max(e, uBurn * smoothstep(.68, .8, fn3(vTP * sc * .45 + 7.3)) * min(1.0, uFadeA * 1.6)); float cut = e * 1.1 - .05; if (n < cut) discard;
  fadeEdge = (1.0 - smoothstep(0.0, .09, n - cut)) * step(.001, e); fadeChar = (1.0 - smoothstep(0.0, .25, n - cut)) * step(.001, e) * uBurn; diffuseColor.rgb *= 1.0 - fadeChar * .8; }`;
// ---- skin layer: a second skin painted on with the 🧴 Skin brush (pt.layer = {mat, m: {piece: {vertex: amount}}}), drawn on top through a mask
function layerMat(pt, fR) {
  const m = fR ? fadeMat(pt.layer.mat, null, pt.tile, false, pt, fR) : toonMat(MATS.makeMat(THREE, pt.layer.mat, null, pt.tile)); styleMat(m);
  m.transparent = true; m.depthWrite = false; m.polygonOffset = true; m.polygonOffsetFactor = -1; m.polygonOffsetUnits = -2;
  const prev = m.onBeforeCompile, pck = m.customProgramCacheKey;
  m.onBeforeCompile = sh => { prev(sh); sh.vertexShader = 'attribute float lmask; varying float vLm;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vLm = lmask;');
    sh.fragmentShader = 'varying float vLm;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n gl_FragColor.a *= clamp(vLm, 0.0, 1.0); if (gl_FragColor.a < .01) discard;'); };
  m.customProgramCacheKey = () => pck() + '-layer'; return m; }
// ---- 💧 drip off: drips hang from the bottom of a part (in its own skin) and drops fall and splash. pt.drip = {amt 0..1, melt}
const dripRoot = new THREE.Group(); scene.add(dripRoot);
const dripGeo = (() => { const g = new THREE.LatheGeometry([[0, .02], [.5, -.05], [.46, -.35], [.26, -.66], [.2, -.8], [.36, -.9], [.38, -.97], [.26, -1.03], [0, -1.05]].map(([x, y]) => new THREE.Vector2(x, y)), 12); g.computeVertexNormals(); return g; })();
const dropGeo = new THREE.SphereGeometry(.5, 10, 8);
function makeDrip(pt) { const key = pt.matAll || (pieces(pt.lib, pt.params)[0] || {}).mat || 'skin', mat = matFor(key, pt.tint, pt.tile), N = Math.round(6 + pt.drip.amt * 30);
  const st = new THREE.InstancedMesh(dripGeo, mat, N), dr = new THREE.InstancedMesh(dropGeo, mat, N * 2); [st, dr].forEach(m => { m.frustumCulled = false; m.raycast = () => {}; m.count = 0; dripRoot.add(m); });
  return {pt, st, dr, N, init: false, S: [], D: []}; }
function killDrip(v) { const d = v && v.drip; if (!d) return; d.st.removeFromParent(); d.dr.removeFromParent(); v.drip = null; }
function dripTick(dt) { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S3 = new THREE.Vector3(), P3 = new THREE.Vector3();
  for (const v of Object.values(views)) { const d = v.drip; if (!d) continue; const vis = v.G.visible; d.st.visible = d.dr.visible = vis; if (!vis) continue;
    if (!d.init) { d.init = true; const cand = [], wn = new THREE.Vector3(), nm = new THREE.Matrix3(); let R = .1;
      for (const me of v.meshes) { me.updateWorldMatrix(true, false); nm.getNormalMatrix(me.matrixWorld); const p = me.geometry.attributes.position, n = me.geometry.attributes.normal;
        for (let i = 0; i < p.count; i++) { wn.set(n.getX(i), n.getY(i), n.getZ(i)).applyMatrix3(nm).normalize(); R = Math.max(R, Math.hypot(p.getX(i), p.getY(i), p.getZ(i)));
          if (d.pt.drip.melt ? wn.y < .4 : wn.y < -.35) cand.push([me, i]); } }
      if (!cand.length) v.meshes.forEach(me => { for (let i = 0; i < me.geometry.attributes.position.count; i += 7) cand.push([me, i]); });
      const ws = new THREE.Vector3(); v.meshes[0] && v.meshes[0].getWorldScale(ws); d.r = R * Math.abs(ws.y || 1) * .022 * (.6 + d.pt.drip.amt);
      for (let k = 0; k < d.N && cand.length; k++) { const [me, i] = cand[(Math.random() * cand.length) | 0], p = me.geometry.attributes.position;
        d.S.push({me, lp: new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)), ph: Math.random(), sp: .25 + Math.random() * .45, L: 2.5 + Math.random() * 4}); } }
    let n = 0; for (const s of d.S) { s.ph += dt * s.sp; const wp = s.lp.clone().applyMatrix4(s.me.matrixWorld);
      if (s.ph >= 1) { s.ph = 0; if (d.D.length < d.N * 2) d.D.push({p: wp.clone().add(new THREE.Vector3(0, -d.r * s.L, 0)), vy: 0, sz: d.r * .8, t: 0, splat: 0}); }
      const L = d.r * s.L * (.25 + .75 * s.ph * s.ph); M4.compose(wp, Q, S3.set(d.r, L, d.r)); d.st.setMatrixAt(n++, M4); }
    d.st.count = n; d.st.instanceMatrix.needsUpdate = true;
    let m = 0; d.D = d.D.filter(o => { o.t += dt; if (!o.splat) { o.vy -= 18 * dt; o.p.y += o.vy * dt; if (o.p.y <= .02) { o.p.y = .02; o.splat = .35; } } else { o.splat -= dt; if (o.splat <= 0) return false; }
      const k = o.splat ? Math.max(0, o.splat / .35) : 1; M4.compose(o.p, Q, o.splat ? S3.set(o.sz * 2.6 * k + .01, o.sz * .25, o.sz * 2.6 * k + .01) : S3.set(o.sz, o.sz * 1.35, o.sz)); d.dr.setMatrixAt(m++, M4); return true; });
    d.dr.count = m; d.dr.instanceMatrix.needsUpdate = true; } }
// ---- 🔷 low-poly look (P.fx.lowpoly 0..3): every part is shown (and exported) faceted, with fewer polygons — the Titan Clash art style
const LOWLV = ['off', 'light', 'chunky', 'very chunky'], lowCache = new Map();
function lowpolyGeo(g, lv) { const key = g.uuid + '|' + lv; if (lowCache.has(key)) return lowCache.get(key);
  g.computeBoundingBox(); const bb = g.boundingBox, diag = bb.max.distanceTo(bb.min) || 1, cell = diag / [0, 16, 10, 6, 26][lv];
  const p = g.attributes.position, extra = ['color', 'lmask'].filter(a => g.attributes[a]), cid = new Map(), sums = [], ids = new Int32Array(p.count);
  for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) / cell) + ',' + Math.round(p.getY(i) / cell) + ',' + Math.round(p.getZ(i) / cell); let c = cid.get(k);
    if (c == null) { c = sums.length; cid.set(k, c); sums.push({n: 0, p: [0, 0, 0], e: extra.map(a => new Array(g.attributes[a].itemSize).fill(0))}); }
    const s = sums[c]; s.n++; s.p[0] += p.getX(i); s.p[1] += p.getY(i); s.p[2] += p.getZ(i); extra.forEach((a, j) => { const A = g.attributes[a]; for (let q = 0; q < A.itemSize; q++) s.e[j][q] += A.array[i * A.itemSize + q]; }); ids[i] = c; }
  const I = g.index ? g.index.array : [...Array(p.count).keys()], pos = [], ex = extra.map(() => []);
  for (let t = 0; t < I.length; t += 3) { const a = ids[I[t]], b = ids[I[t + 1]], c = ids[I[t + 2]]; if (a === b || b === c || a === c) continue;
    for (const k of [a, b, c]) { const s = sums[k]; pos.push(s.p[0] / s.n, s.p[1] / s.n, s.p[2] / s.n); extra.forEach((_, j) => ex[j].push(...s.e[j].map(v => v / s.n))); } }
  const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); extra.forEach((a, j) => o.setAttribute(a, new THREE.Float32BufferAttribute(ex[j], g.attributes[a].itemSize)));
  o.computeVertexNormals(); o.userData.low = true; if (lowCache.size > 400) lowCache.delete(lowCache.keys().next().value); lowCache.set(key, o); return o; }
function resetMats() { for (const k in matCache) delete matCache[k]; rebuildParts(); }
$('bToon').onclick = () => { P.fx.toon = !P.fx.toon; lowLookUI(); resetMats(); saveCur(); tip(P.fx.toon ? 'Toon shading on: flat cartoon light bands' : 'Toon shading off'); };
$('bOutline').onclick = () => { P.fx.outline = !P.fx.outline; lowLookUI(); rebuildParts(); saveCur(); tip(P.fx.outline ? 'Outlines on' : 'Outlines off'); };
$('bGameLook').onclick = () => { const on = !(P.fx.lowpoly && P.fx.toon && P.fx.outline); P.fx.lowpoly = on ? 1 : 0; P.fx.toon = on; P.fx.outline = on; lowLookUI(); resetMats(); saveCur(); tip(on ? 'Game look: low-poly + toon + outlines (Titan Clash style)' : 'Game look off'); };
$('bLowLook').onclick = () => { P.fx.lowpoly = ((P.fx.lowpoly || 0) + 1) % 4; lowLookUI(); rebuildParts(); saveCur(); tip(P.fx.lowpoly ? 'Low-poly look: ' + LOWLV[P.fx.lowpoly] + ' (sculpt/paint brushes pause while it is on)' : 'Low-poly look off', 2400); };
function lowLookUI() { const b = $('bLowLook'); if (b) { b.textContent = '🔷 Low-poly look: ' + LOWLV[P.fx.lowpoly || 0]; b.classList.toggle('on', !!P.fx.lowpoly); }
  if ($('bToon')) { $('bToon').classList.toggle('on', !!P.fx.toon); $('bOutline').classList.toggle('on', !!P.fx.outline); $('bGameLook').classList.toggle('on', !!(P.fx.lowpoly && P.fx.toon && P.fx.outline)); } }
function partRadius(pt) { let R = .1; pieces(pt.lib, pt.params).forEach(pc => { const a = pc.geo.attributes.position; for (let i = 0; i < a.count; i++) R = Math.max(R, Math.hypot(a.getX(i), a.getY(i), a.getZ(i))); }); return R; }
function fadeMat(key, tint, tile, vc, pt, R) {
  const m = toonMat(MATS.makeMat(THREE, key, tint, tile)); m.vertexColors = !!vc; styleMat(m); m.userData.fadeU = {uFadeA: {value: pt.fade.amt}, uFadeR: {value: R}, uFT: FADE_T, uBurn: {value: pt.fade.style === 'burn' ? 1 : 0}};
  const prev = m.onBeforeCompile, pck = m.customProgramCacheKey; m.side = THREE.DoubleSide;
  m.onBeforeCompile = sh => { prev(sh); Object.assign(sh.uniforms, m.userData.fadeU); sh.fragmentShader = FADE_GLSL + sh.fragmentShader.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n' + FADE_MAIN)
    .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += mix(diffuseColor.rgb * .9, vec3(3.0, 1.1, .25), uBurn) * fadeEdge;'); };
  m.customProgramCacheKey = () => pck() + '-fade'; return m; }
let dustTex = null;
function makeDust(pt, view, R) {                                  // drifting grains that blow off the fading end
  if (!dustTex) { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.5, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); dustTex = new THREE.CanvasTexture(c); }
  const st = 1 - pt.fade.amt, src = []; view.meshes.forEach(me => { const a = me.geometry.attributes.position; for (let i = 0; i < a.count; i += 3) { const x = a.getX(i), y = a.getY(i), z = a.getZ(i), d = Math.hypot(x, y, z) / R; if (d > st + pt.fade.amt * .25) src.push([x, y, z, me.material]); } });
  if (!src.length) return null; const N = Math.max(20, Math.round(Math.min(320, 60 + src.length >> 2) * (pt.fade.mul || 1))), O = new Float32Array(N * 3), V = new Float32Array(N * 3), A = new Float32Array(N), Lf = new Float32Array(N), pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const [x, y, z] = src[(Math.random() * src.length) | 0], l = Math.hypot(x, y, z) || 1; O.set([x, y, z], i * 3);
    V.set([x / l * .5 + (Math.random() - .5) * .5, y / l * .5 + (Math.random() - .5) * .5 + .15, z / l * .5 + (Math.random() - .5) * .5].map(v => v * R * .18), i * 3); Lf[i] = 1.2 + Math.random() * 2.2; A[i] = Math.random() * Lf[i]; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m0 = src[0][3], key = (m0.userData && m0.userData.key) || '';
  const glowy = /galaxy|star|nebula|const|aurora|void|holo|opal|sun|cyber|cosmic|glow|ecto|spirit|leafspirit|sandglow/.test(key) || (m0.emissive && m0.emissive.getHex() > 0 && m0.emissiveIntensity > .4);
  const burn = pt.fade.style === 'burn', glit = pt.fade.style === 'glitter', col = burn ? new THREE.Color(1, .45, .12) : glit ? new THREE.Color(1, 1, 1) : m0.color.clone(); if (glowy && !burn) col.lerp(new THREE.Color(1, 1, 1), .35);
  const pm = new THREE.PointsMaterial({size: Math.max(.04, R * (glit ? .028 : .022)), map: dustTex, color: col, transparent: true, depthWrite: false, opacity: .9, blending: glowy || burn || glit ? THREE.AdditiveBlending : THREE.NormalBlending, vertexColors: glit});
  if (glit) { const base = m0.color.clone(), cc = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const c = base.clone().lerp(new THREE.Color().setHSL(Math.random(), .8, .7), .35).multiplyScalar(1.6); cc.set([c.r, c.g, c.b], i * 3); } g.setAttribute('color', new THREE.BufferAttribute(cc, 3)); }
  const pts = new THREE.Points(g, pm); pts.frustumCulled = false; pts.raycast = () => {}; view.M.add(pts); return {pts, O, V, A, L: Lf, N, grav: burn ? -.6 : glit ? 1.2 : 1.6, glit, R}; }
const _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _dn = new THREE.Vector3();
function fadeTick(dt) { FADE_T.value += dt; for (const v of Object.values(views)) for (const d of [v.dust, v.glit]) { if (!d) continue; const p = d.pts.geometry.attributes.position;
  v.M.getWorldQuaternion(_q); v.M.getWorldScale(_s); _dn.set(0, -1, 0).applyQuaternion(_q.invert()).divideScalar(Math.max(.05, Math.abs(_s.y))).multiplyScalar(d.grav * d.R * .35 * Math.abs(_s.y));   // world "down" in the part's own space
  for (let i = 0; i < d.N; i++) { d.A[i] += dt; if (d.A[i] > d.L[i]) d.A[i] = 0; const a = d.A[i], k = a * (1 + a * .35) * (d.grav > 0 ? .5 : 1), g2 = a * a;
    p.setXYZ(i, d.O[i * 3] + d.V[i * 3] * k + _dn.x * g2, d.O[i * 3 + 1] + d.V[i * 3 + 1] * k + _dn.y * g2, d.O[i * 3 + 2] + d.V[i * 3 + 2] * k + _dn.z * g2); }
  p.needsUpdate = true; if (d.glit) { const c = d.pts.geometry.attributes.color; d.tw = (d.tw || 0) + dt; if (d.tw > .08) { d.tw = 0; if (!d.C0) d.C0 = c.array.slice(); for (let i = 0; i < d.N; i += 3) { const j = (Math.random() * d.N) | 0, f = Math.random() < .3 ? 2.4 : .35; c.setXYZ(j, d.C0[j * 3] * f, d.C0[j * 3 + 1] * f, d.C0[j * 3 + 2] * f); } c.needsUpdate = true; } } } }
function partGeo(pt, mi, base) {                                // per-instance geometry: subdivided + sculpted copy if needed
  const sd = pt.subdiv || 0, sc = pt.sculpt && pt.sculpt[mi], vp = pt.vpaint && pt.vpaint[mi], lm = pt.layer && pt.layer.m && pt.layer.m[mi];
  if (!sd && !sc && !vp && !lm && !(pt.cut && pt.cut.length)) return base;
  let g = base; for (let i = 0; i < sd; i++) g = subdivide(g);
  if (g === base) g = base.clone();
  if (sc) { const p = g.attributes.position; for (const v in sc) { const d = sc[v]; if (+v < p.count) p.setXYZ(+v, p.getX(+v) + d[0], p.getY(+v) + d[1], p.getZ(+v) + d[2]); } }
  if (vp) { const n = g.attributes.position.count, c = new Float32Array(n * 3).fill(1); for (const v in vp) if (+v < n) c.set(vp[v], +v * 3); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); }
  if (lm) { const n = g.attributes.position.count, a = new Float32Array(n); for (const v in lm) if (+v < n) a[+v] = lm[v]; g.setAttribute('lmask', new THREE.Float32BufferAttribute(a, 1)); }
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
  if (views[pt.uid]) { views[pt.uid].G.removeFromParent(); killDrip(views[pt.uid]); }
  const G = new THREE.Group(), M = new THREE.Group(); G.add(M); G.userData.uid = pt.uid;
  const parent = (pt.bone && bones[pt.bone]) || skelRoot; parent.add(G);
  const meshes = [], fR = pt.fade && !colorMode ? partRadius(pt) : 0;
  pieces(pt.lib, pt.params).forEach((pc, mi) => { if (pt.keep && !pt.keep.includes(mi)) return; let g = partGeo(pt, mi, pc.geo); if (P.fx.lowpoly && !(LIB[pt.lib] && LIB[pt.lib].lowpoly)) g = lowpolyGeo(g, P.fx.lowpoly);
    const mat = fR ? fadeMat(pt.mat && pt.mat[mi] != null ? pt.mat[mi] : (pt.matAll || pc.mat), pt.tint, pt.tile, !!(pt.vpaint && pt.vpaint[mi]), pt, fR) : colorMode ? new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL((hash(pt.uid) % 360) / 360, .6, .55)}) : pc.matObj && !pt.mat ? pc.matObj : matFor(pt.mat && pt.mat[mi] != null ? pt.mat[mi] : (pt.matAll || pc.mat), pt.tint, pt.tile, !!(pt.vpaint && pt.vpaint[mi]));
    const mesh = new THREE.Mesh(g, mat); mesh.userData = {uid: pt.uid, mi}; M.add(mesh); meshes.push(mesh);
    if (!colorMode) addOutline(M, mesh, pt);
    if (g.attributes.lmask && !colorMode) { const ov = new THREE.Mesh(g, layerMat(pt, fR)); ov.raycast = () => {}; ov.renderOrder = 2; M.add(ov); } });
  M.scale.set((pt.flip ? -1 : 1) * (pt.w || 1), pt.l || 1, pt.w || 1); applyOff(pt, M);
  G.position.set(...pt.p); G.quaternion.setFromEuler(new THREE.Euler(...pt.r.map(x => x * D))); G.scale.setScalar(pt.s);
  G.visible = !pt.hidden && !(soloUid && soloUid !== pt.uid);
  views[pt.uid] = {G, M, meshes};
  if (fR && pt.fade.dust !== false) views[pt.uid].dust = makeDust(pt, views[pt.uid], fR);
  if (pt.drip && !colorMode) views[pt.uid].drip = makeDrip(pt);
  if (pt.glit && !colorMode) views[pt.uid].glit = makeDust({fade: {amt: .95, style: 'glitter', mul: .4 + pt.glit.amt * 1.4}}, views[pt.uid], partRadius(pt));
}
function applyOff(pt, M) { const o = pt.off; if (o) M.position.set(-o[0] * M.scale.x, -o[1] * M.scale.y, -o[2] * M.scale.z); else M.position.set(0, 0, 0); }
const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
let soloUid = null;
function rebuildParts() { Object.values(views).forEach(v => { v.G.removeFromParent(); killDrip(v); }); views = {}; P.parts.forEach(buildPart); attachGizmo(); }
const partBy = u => P.parts.find(p => p.uid === u);
const twinOf = pt => pt && pt.twin ? partBy(pt.twin) : null;
function mirrorInto(src, dst) {                                 // keep a mirrored twin in sync
  dst.p = [-src.p[0], src.p[1], src.p[2]]; dst.r = [src.r[0], -src.r[1], -src.r[2]]; dst.s = src.s; dst.l = src.l; dst.w = src.w; dst.flip = !src.flip;
  dst.mat = src.mat ? [...src.mat] : null; dst.matAll = src.matAll; dst.tint = src.tint; dst.tile = src.tile; dst.subdiv = src.subdiv; dst.sculpt = src.sculpt ? JSON.parse(JSON.stringify(src.sculpt)) : null; dst.cut = src.cut ? [...src.cut] : []; dst.vpaint = src.vpaint ? JSON.parse(JSON.stringify(src.vpaint)) : null;
  dst.fade = src.fade ? {...src.fade} : null; dst.drip = src.drip ? {...src.drip} : null; dst.glit = src.glit ? {...src.glit} : null; dst.layer = src.layer ? JSON.parse(JSON.stringify(src.layer)) : null; dst.keep = src.keep ? [...src.keep] : null; dst.off = src.off ? [...src.off] : null; dst.hidden = src.hidden; dst.params = src.params ? {...src.params} : null; buildPart(dst);
}
const syncTwin = pt => { const t = twinOf(pt); if (t) mirrorInto(pt, t); };

// ====================================================================== adding parts
let placing = null, modeBone = true, mirrorAdd = true;
function newPart(lib, bone, p, r, s = 1) { const f = LIB[lib] && LIB[lib].fade; return {uid: uid(), lib, bone, p, r, s, l: 1, w: 1, flip: false, mat: null, matAll: null, tint: '#ffffff', subdiv: 0, sculpt: null, cut: [], hidden: false, twin: null, fade: f ? {amt: f.amt || .5, dust: true, style: f.style || 'dust'} : null}; }
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
// ====================================================================== fit system
// Every bone-snapped part sizes itself to its slot on the skeleton, and to the parts next to it, so pieces line up:
// torsos fill the trunk (hips -> neck), heads sit on the neck at a size that matches the body, limbs/tails/necks fill their
// bone chain at a thickness set by the body width, hands/feet match the limb, jaws match the head, small details match
// whatever big part is on that bone. pt.fit = {kind, drop, cover[]}; pt.fit.tweaked = user moved/stretched it by hand.
const v3 = a => new THREE.Vector3(...a);
const kidRows = n => P.bones.filter(r => r[1] === n);
const restQOf = r => basisFor(v3(r[3]).sub(v3(r[2])), r[5] && r[5].up);
const TRUNK_TAGS = new Set(['spine', 'chest']);
const FAMILY = {armU: 'arm', armF: 'arm', legU: 'leg', legL: 'leg', tail: 'tail', neck: 'neck', wingA: 'wing', wingB: 'wing', wingC: 'wing', extra: 'extra', spine: 'trunk', chest: 'trunk', hand: 'hand', foot: 'foot', head: 'head', jaw: 'jaw'};
const KITS = /^(Mecha Dragon|Kaiju Kit|Dino Kit|Turtle Kit|Free Packs \(CC0\)|My Imports|My Parts|Basic Shapes & Clay|Part Makers \(sliders\))$/;
function kindOf(e) { if (!e) return null; if (e.fitKind) return e.fitKind; const g = e.group, id = e.id, sub = e.sub || '';
  if (KITS.test(g) || e.whole || e.params) return null;
  if (g === 'Torsos & Bellies' || (g === 'Mech Torso & Core' && (sub === 'Chests' || sub === 'Frames') && id !== 'mk_torso_collar')) return 'torso';
  if (g === 'Heads & Skulls') return /mane/.test(id) ? 'decor' : 'head';
  if (g === 'Mech Heads') return 'head';
  if (g === 'Jaws & Teeth') return /Lower Jaws|Beaks|Maws/.test(sub) ? 'jaw' : 'decor';
  if (g === 'Necks & Spines') return /neck/.test(id) ? 'neck' : null;
  if (g === 'Arms & Shoulders') return /shoulder/.test(id) ? 'decor' : 'limb';
  if (g === 'Legs & Feet') return /foot|feet/i.test(sub + id) ? 'foot' : 'limb';
  if (g === 'Mech Arms & Legs') return sub === 'Shoulders' ? 'decor' : sub === 'Hands' ? 'hand' : sub === 'Feet' ? 'foot' : 'limb';
  if (g === 'Hands & Claws') return 'hand';
  if (g === 'Tails') return 'tail'; if (g === 'Tentacles & Extra Limbs') return 'limb'; if (g === 'Wings') return 'wing';
  return 'decor'; }
const boxCache = {};
function partBoxOf(lib, params) { const k = lib + JSON.stringify(params || ''); if (boxCache[k]) return boxCache[k]; const b = new THREE.Box3();
  pieces(lib, params).forEach(pc => { pc.geo.computeBoundingBox(); b.union(pc.geo.boundingBox); }); if (b.isEmpty()) b.set(new THREE.Vector3(-.5, 0, -.5), new THREE.Vector3(.5, 1, .5)); return boxCache[k] = b; }
function bodyInfo() {                                           // trunk path, start/end, length and body width W for the current skeleton
  const R = Object.fromEntries(P.bones.map(r => [r[0], r])), tr = P.bones.filter(r => TRUNK_TAGS.has(r[4]) && !/\.(L|R)$/.test(r[0]));
  let path = null;
  for (const r of tr.filter(r => !r[1] || !R[r[1]] || !TRUNK_TAGS.has(R[r[1]][4]))) { const p = [r]; for (;;) { const k = kidRows(p[p.length - 1][0]).find(x => TRUNK_TAGS.has(x[4]) && !/\.(L|R)$/.test(x[0])); if (!k) break; p.push(k); } if (!path || p.length > path.length) path = p; }
  if (!path) { const r = P.bones[0]; path = [r]; }
  const start = v3(path[0][2]), end = v3(path[path.length - 1][3]), len = Math.max(.3, start.distanceTo(end)), names = new Set(path.map(r => r[0]));
  let sh = 0, hp = 0; for (const r of P.bones) { if (!names.has(r[1])) continue;
    if (r[4] === 'armU') { const stub = kidRows(r[0]).find(k => k[4] === 'armU'); sh = Math.max(sh, Math.abs((stub ? r[3] : r[2])[0])); }
    if (r[4] === 'legU') hp = Math.max(hp, Math.abs(r[2][0])); }
  let W = Math.max(sh * 2 * .85, hp * 2 * 1.2, len * .42, .8); if (!sh && !hp) { const mean = path.reduce((a, r) => a + v3(r[2]).distanceTo(v3(r[3])), 0) / path.length; W = Math.max(.8, Math.min(len * .55, mean * 1.3)); } W = Math.min(W, len * 1.4 + 1);
  return {R, path, names, start, end, len, W, root: path[0][0]}; }
function aimRot(R, from, endPt) {                               // rotation (deg, bone space of `from`) that points +Y at endPt
  const r = R[from], d = endPt.clone().sub(v3(r[2])); if (d.lengthSq() < 1e-6) return [0, 0, 0]; d.applyQuaternion(restQOf(r).invert()).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d), eu = new THREE.Euler().setFromQuaternion(q); return [eu.x, eu.y, eu.z].map(v => +(v / D).toFixed(1)); }
function limbChain(R, bone) {                                   // bones of the same limb from `bone` outward (stops before hands/feet)
  const fam = FAMILY[R[bone][4]], out = [R[bone]]; for (;;) { const k = kidRows(out[out.length - 1][0]).filter(x => FAMILY[x[4]] === fam); if (k.length !== 1) break; out.push(k[0]); } return out; }
function thickFor(B, tag, i = 0) { const W = B.W; return {armU: .3, armF: .26, legU: .38, legL: .3, neck: .3, tail: .42 * Math.pow(.84, i), extra: .2, spine: .5, chest: .55, wingA: .12, wingB: .1, wingC: .08, hand: .28, foot: .32, head: .45, jaw: .3}[tag] * W || W * .25; }
const MAIN_KINDS = new Set(['torso', 'head', 'jaw', 'limb', 'neck', 'tail', 'wing', 'hand', 'foot', 'seg']);
const mainOn = (bone, not) => P.parts.find(p => p !== not && p.bone === bone && p.fit && MAIN_KINDS.has(p.fit.kind) && !p.boxed);
function fitPart(lib, bone) {
  const e = LIB[lib], kind = kindOf(e); if (!kind || kind === 'decor' || !bone || !boneRow(bone)) return null;
  const B = bodyInfo(), R = B.R, W = B.W, bx = partBoxOf(lib), pw = Math.max(.05, bx.max.x - bx.min.x), pd = Math.max(.05, bx.max.z - bx.min.z);
  const plen = Math.max(.05, bx.max.y - Math.max(0, bx.min.y)), thick = (pw + pd) / 2, tag = R[bone][4];
  const out = {bone, p: [0, 0, 0], r: [0, 0, 0], s: 1, l: 1, fit: {kind, drop: bone, cover: [bone]}};
  const stretch = (len, T, lo = .5, hi = 2.2) => { let s = T / thick, l = len / (plen * s); if (l > hi) { l = hi; s = len / (plen * l); } if (l < lo) { l = lo; s = len / (plen * l); } s = Math.min(4, Math.max(.15, s)); return [+s.toFixed(3), +(len / (plen * s)).toFixed(3)]; };
  if (kind === 'torso') {
    if (FAMILY[tag] !== 'trunk' && !B.names.has(bone)) { out.s = +(W / pw).toFixed(3); return out; }  // a torso dropped on a limb: just size it
    out.bone = B.root; out.fit.cover = B.path.map(r => r[0]); out.r = aimRot(R, B.root, B.end); out.s = +Math.min(4, Math.max(.2, W / pw)).toFixed(3);
    out.l = +Math.min(2.4, Math.max(.45, B.len / (plen * out.s))).toFixed(3); return out; }
  if (kind === 'seg') {                                          // base-body piece: exactly this bone
    const r = R[bone], len = Math.max(.15, v3(r[2]).distanceTo(v3(r[3]))); let i = 0, c = r; while (c[1] && R[c[1]] && R[c[1]][4] === tag) { i++; c = R[c[1]]; }
    if (!c[1] && tag === 'tail') { i = 0; let d = r; for (;;) { const k = kidRows(d[0]).find(x => x[4] === tag); if (!k) break; i++; d = k; } }   // tail grows out of the root (naga): thick end is the body end
    const T = FAMILY[tag] === 'trunk' ? thickFor(B, tag) * Math.pow(.93, i) : thickFor(B, tag, i); out.s = +(T / thick).toFixed(3); out.l = +(len / ((e.unitLen || plen) * out.s)).toFixed(3); return out; }
  if (kind === 'head') { const hl = v3(R[bone][2]).distanceTo(v3(R[bone][3])), tw = Math.min(W * .8, Math.max(W * .5, hl * .9));
    out.s = +Math.min(4, Math.max(.2, tw * bodyK('head') / pw)).toFixed(3); return out; }
  if (kind === 'jaw') { const hp = R[bone][1] && mainOn(R[bone][1]); if (hp && hp.fit.kind === 'head') { out.s = +(hp.s * .95).toFixed(3); return out; }
    const jl = v3(R[bone][2]).distanceTo(v3(R[bone][3])); out.s = +Math.min(3, Math.max(.2, jl * 1.15 / pd)).toFixed(3); return out; }
  if (kind === 'hand' || kind === 'foot') { const par = R[bone][1] && R[R[bone][1]], ptag = FAMILY[tag] === 'hand' || FAMILY[tag] === 'foot' ? (par ? par[4] : tag) : tag;
    const T = thickFor(B, ptag) * 1.3; out.s = +Math.min(4, Math.max(.15, T / pw)).toFixed(3);
    if (kind === 'foot' && FAMILY[tag] === 'foot') { // mech feet are modelled upright (+Y up, +Z forward): keep them level with the ground
      const q = restQOf(R[bone]).invert(), eu = new THREE.Euler().setFromQuaternion(q); out.r = [eu.x, eu.y, eu.z].map(v => +(v / D).toFixed(1));
      const ank = v3(R[bone][2]), drop = new THREE.Vector3(0, -(ank.y + bx.min.y * out.s), .15 * W).applyQuaternion(q); out.p = drop.toArray().map(v => +v.toFixed(3)); }
    return out; }
  if (kind === 'wing') { const ch = limbChain(R, bone), end = v3(ch[ch.length - 1][3]), len = v3(R[bone][2]).distanceTo(end);
    out.fit.cover = ch.map(r => r[0]); out.s = +Math.min(12, Math.max(.3, len * 1.05 / Math.max(plen, pw * .8))).toFixed(3);
    // aim the spar at the wing tip and roll it so the membrane (+X) trails backward and a bit down
    const r0 = R[bone], qi = restQOf(r0).invert(), y = end.clone().sub(v3(r0[2])).normalize(), side = Math.sign(r0[3][0] - r0[2][0]) || 1;
    let x = new THREE.Vector3(0, -.35, -1).addScaledVector(y, -new THREE.Vector3(0, -.35, -1).dot(y)); if (x.lengthSq() < 1e-4) x.set(0, -1, 0); x.normalize();
    if (side < 0) x.negate(); const z = new THREE.Vector3().crossVectors(x, y), m = new THREE.Matrix4().makeBasis(x, y, z), q = new THREE.Quaternion().setFromRotationMatrix(m).premultiply(qi);
    const eu = new THREE.Euler().setFromQuaternion(q); out.r = [eu.x, eu.y, eu.z].map(v => +(v / D).toFixed(1)); out.fit.cover = ch.map(r => r[0]); return out; }
  // limbs / necks / tails: keep the part's own proportions (uniform size) and fill the limb; long parts cover the whole limb,
  // short ones (mech upper arm, shin…) one bone. Only stretch when the part would come out much too thick or thin for this body.
  let start = bone; if (tag === 'armU') { const stub = kidRows(bone).find(k => k[4] === 'armU'); if (stub && B.names.has(R[bone][1])) start = stub[0]; }
  out.bone = start; out.fit.drop = bone; const ch = limbChain(R, start), T = thickFor(B, R[start][4]), rw = partRootW(lib);
  const lens = []; let acc = 0; ch.forEach(r => { acc += v3(r[2]).distanceTo(v3(r[3])); lens.push(acc); });
  let n = kind === 'tail' || kind === 'neck' ? ch.length : plen >= 3.2 ? ch.length : 1;
  if (kind === 'limb' && plen >= 3.2 && ch.length > 2) { let bestE = 1e9; lens.forEach((L, i) => { const e2 = Math.abs(Math.log(L / (plen * T / rw))); if (i && e2 < bestE) { bestE = e2; n = i + 1; } }); }
  const used = ch.slice(0, n), end = v3(used[used.length - 1][3]), len = v3(R[start][2]).distanceTo(end);
  let sz = len / plen, l = 1; const wNow = rw * sz; if (wNow > T * 1.7 || wNow < T * .55) { sz = Math.min(T * 1.7, Math.max(T * .55, wNow)) / rw; l = Math.min(2.5, Math.max(.4, len / (plen * sz))); sz = len / (plen * l); }
  out.s = +sz.toFixed(3); out.l = +l.toFixed(3); out.r = aimRot(R, start, end); out.fit.cover = used.map(r => r[0]);
  if (e.group === 'Legs & Feet' && n === ch.length) kidRows(used[used.length - 1][0]).filter(k => FAMILY[k[4]] === 'foot').forEach(k => out.fit.cover.push(k[0]));   // these legs come with their own feet
  return out; }
const rootWCache = {};
function partRootW(lib) { if (rootWCache[lib]) return rootWCache[lib]; const bx = partBoxOf(lib), lim = Math.max(0, bx.min.y) + (bx.max.y - Math.max(0, bx.min.y)) * .35; let lo = 1e9, hi = -1e9;
  pieces(lib).forEach(pc => { const a = pc.geo.attributes.position; for (let i = 0; i < a.count; i++) if (a.getY(i) <= lim) { const x = a.getX(i); if (x < lo) lo = x; if (x > hi) hi = x; } });
  return rootWCache[lib] = hi > lo ? Math.max(.05, hi - lo) : Math.max(.05, bx.max.x - bx.min.x); }
function decorScale(bone) { const m = bone && mainOn(bone); if (m) return +Math.min(2, Math.max(.4, m.lib.startsWith('base_') ? bodyInfo().W / 2.6 : m.s)).toFixed(3);
  return +Math.min(2, Math.max(.5, bodyInfo().W / 3.2)).toFixed(3); }
function removeParts(list) { const kill = new Set(); list.forEach(p => { kill.add(p); const t = twinOf(p); if (t) kill.add(t); });
  P.parts = P.parts.filter(p => !kill.has(p)); kill.forEach(p => { if (views[p.uid]) { views[p.uid].G.removeFromParent(); killDrip(views[p.uid]); } }); return kill.size; }
const SLOT = k => k === 'seg' || k === 'limb' || k === 'neck' || k === 'tail' ? 'chain' : k === 'hand' || k === 'foot' ? 'end' : k;
function swapOut(fit) {                                         // a new main part replaces what was in its slot (base pieces + same-kind parts)
  const cover = new Set(fit.cover), sk = SLOT(fit.kind);
  const old = P.parts.filter(p => p.fit && !p.boxed && cover.has(p.bone) && MAIN_KINDS.has(p.fit.kind) && (SLOT(p.fit.kind) === sk || (sk === 'chain' && p.lib.startsWith('base_')) || (p.lib.startsWith('base_') && fit.kind === 'torso' && p.fit.kind === 'seg'))
    && !(fit.kind === 'torso' && SLOT(p.fit.kind) !== 'torso' && !p.lib.startsWith('base_')));
  // a limb/neck/tail part also clears base pieces on the rest of the bones it covers
  return old.length ? removeParts(old.filter(p => !p.twin || P.parts.includes(p))) : 0; }
function applyFit(pt, f) { pt.bone = f.bone; pt.p = f.p; pt.r = f.r; pt.s = f.s; pt.l = f.l; pt.w = 1; pt.fit = {...f.fit, tweaked: false}; }
function refitPart(pt, force) { if (!pt.fit || (pt.fit.tweaked && !force) || pt.twin && P.parts.indexOf(partBy(pt.twin)) < P.parts.indexOf(pt) && partBy(pt.twin).fit) return false;
  const f = fitPart(pt.lib, pt.fit.drop && boneRow(pt.fit.drop) ? pt.fit.drop : pt.bone); if (!f) return false; applyFit(pt, f); buildPart(pt); syncTwin(pt); return true; }
function refitAll(force) { let n = 0; const order = [...P.parts].sort((a, b) => (a.fit && a.fit.kind === 'head' ? 0 : 1) - (b.fit && b.fit.kind === 'head' ? 0 : 1));
  order.forEach(p => { if (P.parts.includes(p) && refitPart(p, force)) n++; }); return n; }
function buildBase() {                                          // cover every bone of any skeleton with a smooth base body
  snap(); const B = bodyInfo(), R = B.R, keep = mirrorAdd; mirrorAdd = true; removeParts(P.parts.filter(p => p.lib.startsWith('base_')));
  const has = b => P.parts.some(p => p.bone === b && p.fit && MAIN_KINDS.has(p.fit.kind)), add = (lib, b) => { if (b.endsWith('.R') && boneRow(twinName(b))) return; const f = fitPart(lib, b); if (!f) return;
    const pt = newPart(lib, f.bone, f.p, f.r, f.s); pt.l = f.l; pt.fit = f.fit; P.parts.push(pt); const tb = twinName(f.bone); if (tb && bones[tb]) { const t = newPart(lib, tb, [0, 0, 0], [0, 0, 0]); t.twin = pt.uid; pt.twin = t.uid; t.fit = {...f.fit, cover: f.fit.cover.map(twinName)}; P.parts.push(t); } };
  const longBody = B.len > B.W * 2.6;
  if (!longBody && !B.path.some(r => has(r[0]))) add('base_trunk', B.root);
  for (const r of P.bones) { const [n, , , , tag] = r; if (has(n)) continue; const fam = FAMILY[tag];
    if (fam === 'trunk') { if (longBody || !B.names.has(n)) add('base_seg', n); continue; }
    if (tag === 'armU' && kidRows(n).some(k => k[4] === 'armU') && B.names.has(r[1])) continue;   // shoulder stub: the trunk covers it
    if (fam === 'head') add('base_head', n); else if (fam === 'jaw') continue;
    else if (fam === 'hand') add('base_hand', n); else if (fam === 'foot') add(/^(spider|insect|scorpion|crab)$/.test(P.skel) ? 'base_tailseg' : 'base_foot', n);
    else if (fam === 'wing') { if (tag === 'wingA') add('base_wing', n); }
    else if (fam === 'tail') add('base_tailseg', n); else add(tag === 'legU' ? 'base_seg_thick' : 'base_seg', n); }
  P.parts.forEach(p => { if (p.twin && p.lib.startsWith('base_') && !p.p) {} });
  mirrorAdd = keep; rebuildParts(); P.parts.filter(p => p.twin && p.lib.startsWith('base_')).forEach(p => { const t = partBy(p.twin); if (t && P.parts.indexOf(t) > P.parts.indexOf(p)) mirrorInto(p, t); });
  outliner(); saveCur(); }
const hasBase = () => P.parts.some(p => p.lib.startsWith('base_'));
// ====================================================================== body shape sliders (Dragon's Dogma style)
// Sliders reshape the skeleton from a snapshot (P.bodyBase) and every fitted part refits, so the whole creature stays connected.
const BODY_SL = [['height', 'Height', .6, 1.6], ['bulk', 'Bulk', .6, 1.7], ['arms', 'Arm length', .5, 1.8], ['legs', 'Leg length', .5, 1.8], ['neck', 'Neck length', .3, 2.5], ['tail', 'Tail length', .3, 2], ['head', 'Head size', .6, 1.6]];
const bodyK = k => (P.body && P.body[k]) || 1;
function applyBody() {
  if (!P.bodyBase) P.bodyBase = JSON.parse(JSON.stringify(P.bones)); const bones = JSON.parse(JSON.stringify(P.bodyBase)), R = Object.fromEntries(bones.map(r => [r[0], r]));
  const shift = (n, d) => bones.filter(x => x[1] === n).forEach(x => { x[2] = x[2].map((v, i) => v + d[i]); x[3] = x[3].map((v, i) => v + d[i]); shift(x[0], d); });
  const fam = {arms: ['armU', 'armF', 'hand'], legs: ['legU', 'legL'], neck: ['neck'], tail: ['tail']};
  for (const [k, tags] of Object.entries(fam)) { const s = bodyK(k); if (s === 1) continue;
    for (const r of bones) { if (!tags.includes(r[4])) continue; if (k === 'arms' && r[4] === 'armU' && bones.some(x => x[1] === r[0] && x[4] === 'armU') && TRUNK_TAGS.has((R[r[1]] || [])[4])) continue;
      const h = r[2], t = r[3], nt = h.map((v, i) => v + (t[i] - v) * s), d = nt.map((v, i) => v - t[i]); r[3] = nt;
      bones.filter(x => x[1] === r[0]).forEach(x => { const near = Math.hypot(...x[2].map((v, i) => v - t[i])) < .35; if (near || x[4] === r[4] || FAMILY[x[4]] === 'hand' || FAMILY[x[4]] === 'foot' || FAMILY[x[4]] === 'head') { x[2] = x[2].map((v, i) => v + d[i]); x[3] = x[3].map((v, i) => v + d[i]); shift(x[0], d); } }); } }
  const b = bodyK('bulk'), h = bodyK('height'); bones.forEach(r => { r[2] = [r[2][0] * b, r[2][1] * h, r[2][2] * Math.sqrt(b)]; r[3] = [r[3][0] * b, r[3][1] * h, r[3][2] * Math.sqrt(b)]; });
  const feet = bones.filter(r => r[4] === 'foot' || r[4] === 'legL'); if (feet.length) { const lo = Math.min(...feet.flatMap(r => [r[2][1], r[3][1]])); if (Math.abs(lo) > .01) bones.forEach(r => { r[2][1] -= lo; r[3][1] -= lo; }); }
  bones.forEach(r => { r[2] = r[2].map(v => +v.toFixed(3)); r[3] = r[3].map(v => +v.toFixed(3)); });
  P.bones = bones; rebuildSkeleton(); refitAll(false); rebuildParts(); saveCur(); }
function bodyUI() { const el = $('bodySl'); if (!el) return; el.innerHTML = '';
  for (const [k, name, lo, hi] of BODY_SL) { const row = document.createElement('div'); row.className = 'sl'; row.innerHTML = `<span>${name}</span><input type="range" min="${lo}" max="${hi}" step=".01" value="${bodyK(k)}"><span>${bodyK(k).toFixed(2)}</span>`;
    const inp = row.querySelector('input'), val = row.lastChild; inp.onpointerdown = () => snap(); inp.oninput = () => { P.body = P.body || {}; P.body[k] = +inp.value; val.textContent = (+inp.value).toFixed(2); applyBody(); }; el.append(row); } }
function addPart(lib, bone, p, r, s) {
  snap(); let pt, swapped = 0; const ff = s == null && modeBone !== false ? fitPart(lib, bone) : null;
  if (ff) { swapped = MAIN_KINDS.has(ff.fit.kind) ? swapOut(ff.fit) : 0; pt = newPart(lib, ff.bone, ff.p, ff.r, ff.s); pt.l = ff.l; pt.fit = ff.fit; bone = ff.bone; p = ff.p; }
  else { const fit = s == null ? (kindOf(LIB[lib]) === 'decor' ? [decorScale(bone), 1] : autoFit(lib, bone)) : [s, 1]; pt = newPart(lib, bone, p, r, fit[0]); pt.l = fit[1]; }
  P.parts.push(pt);
  const tb = bone && twinName(bone);
  if (mirrorAdd && (tb ? bones[tb] : Math.abs(p[0]) > .25)) { const t = newPart(lib, tb || bone, [0, 0, 0], [0, 0, 0]); t.twin = pt.uid; pt.twin = t.uid; if (pt.fit) t.fit = {...pt.fit, drop: twinName(pt.fit.drop) || pt.fit.drop, cover: pt.fit.cover.map(c => twinName(c) || c)}; P.parts.push(t); mirrorInto(pt, t); }
  buildPart(pt); select(pt.uid); outliner(); saveCur();
  tip(LIB[lib].name + (swapped ? ' swapped in' : ' added') + (pt.twin ? ' (+ mirrored twin)' : '') + (LIB[lib].params ? ' — shape it with the sliders' : (window.MF_V2 ? ' — drag it to move it' : ' — Move tab to adjust')));
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
  const e = LIB[lib], along = modeBone && boneName && (isAlong(e) || MAIN_KINDS.has(kindOf(e)));
  if (addWeaponToPalm(lib, boneName)) return;
  if (e.whole) { const m = mirrorAdd; mirrorAdd = false; addPart(lib, null, [0, 0, 0], [0, 0, 0], 1); mirrorAdd = m; return tip(e.name + ' added as a whole body — sculpt it, erase bits, or add parts on top'); }
  if (along) return addPart(lib, boneName, [0, 0, 0], [0, 0, 0]);
  const B = (boneName && bones[boneName]) || skelRoot; B.updateMatrixWorld(true);
  const inv = B.matrixWorld.clone().invert(), lp = hit.point.clone().applyMatrix4(inv);
  let n = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
  const qW = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n.normalize()), bq = new THREE.Quaternion(); B.getWorldQuaternion(bq);
  const ql = bq.invert().multiply(qW), eu = new THREE.Euler().setFromQuaternion(ql);
  addPart(lib, boneName, lp.toArray().map(v => +v.toFixed(3)), [eu.x, eu.y, eu.z].map(v => +(v / D).toFixed(1)), kindOf(e) ? decorScale(boneName) : 1);
}
$('bModeBone').onclick = () => { modeBone = true; $('bModeBone').classList.add('on'); $('bModeSurf').classList.remove('on'); };
$('bModeSurf').onclick = () => { modeBone = false; $('bModeSurf').classList.add('on'); $('bModeBone').classList.remove('on'); };
$('bMirrorAdd').onclick = e => { mirrorAdd = !mirrorAdd; e.target.classList.toggle('on', mirrorAdd); };
$('bAddCenter').onclick = () => { const lib = placing || visibleIds()[0]; if (!lib) return; placing = null; libUI();
  const b = (selBone && bones[selBone] && selBone) || (P.bones.find(b => b[4] === 'chest') || P.bones[0])[0]; addPart(lib, b, [0, 0, 0], [0, 0, 0]); };

// ====================================================================== library UI
// double-tap a part in the grid = add it right away: on the picked bone, else the first bone that fits its category (weapons go in a hand)
let lastLibTap = {};
function quickAdd(id) { const e = LIB[id]; if (!e) return;
  if (e.whole) { const m = mirrorAdd; mirrorAdd = false; addPart(id, null, [0, 0, 0], [0, 0, 0], 1); mirrorAdd = m; return; }
  const names = P.bones.map(b => b[0]), side = n => n.endsWith('.R') ? 1 : 0;
  if (e.group === 'Weapons') { const h = names.find(n => (boneRow(n) || [])[4] === 'hand' && n.endsWith('.R')) || names.find(n => (boneRow(n) || [])[4] === 'hand'); if (h && addWeaponToPalm(id, h)) return; }
  let b = selBone && bones[selBone] ? selBone : null;
  if (!b) { const fit = names.filter(n => groupForBone(n)[0] === e.group).sort((x, y) => side(x) - side(y)); b = fit[0] || (P.bones.find(r => r[4] === 'chest') || P.bones[0])[0]; }
  addPart(id, b, [0, 0, 0], [0, 0, 0]); tip(e.name + ' added on ' + niceBone(b) + ' — double-tap parts to add them fast', 2400); }
let tagFilter = null, catsOpen = true;
let gFilter = GROUP_ORDER.find(g => Object.values(LIB).some(e => e.group === g)) || 'Basic Shapes & Clay', sFilter = null, query = '';
const userTags = (() => { try { return JSON.parse(localStorage.getItem('titan-forge-tags') || '{}'); } catch (e) { return {}; } })();
const tagsOf = id => [...(LIB[id].tags || []), ...(userTags[id] || [])];
const visibleIds = () => Object.keys(LIB).filter(id => { const e = LIB[id]; if (lpParts ? e.hasLpv : e.lpv) return false; if (tagFilter && !tagsOf(id).includes(tagFilter)) return false; if (tagFilter === 'fav') return true; if (gFilter === MY && !query) return e.mine && (!sFilter || e.sub === sFilter); if (query) return (e.name + ' ' + e.group + ' ' + e.sub + ' ' + tagsOf(id).join(' ')).toLowerCase().includes(query);
  return e.group === gFilter && (!sFilter || e.sub === sFilter); });
function libUI() {
  const groups = [MY, ...GROUP_ORDER].filter(g => g === 'Free Packs (CC0)' || g === 'My Imports' || g === MY || Object.values(LIB).some(e => e.group === g));
  const SEC = {'My Parts': '⭐ YOURS', 'Basic Shapes & Clay': '🧱 START FROM CLAY + SLIDER MAKERS', 'Heads & Skulls': '🐲 CREATURE PARTS', 'Mech Heads': '🤖 MECH PARTS', 'Mecha Dragon': '🐉 KITS', 'Weapons': '⚔️ GEAR & MAGIC', 'Free Packs (CC0)': '📦 FREE MODEL PACKS'};
  $('grpToggle').textContent = (catsOpen ? '📂 Categories ▴' : '📂 ' + (query ? 'Search results' : gFilter) + '  ▾ (tap for all categories)'); $('groups').style.display = catsOpen ? '' : 'none';
  $('groups').innerHTML = ''; for (const g of groups) { if (SEC[g]) $('groups').append(Object.assign(document.createElement('div'), {className: 'sec', textContent: SEC[g]}));
    const n = Object.values(LIB).filter(e => !(lpParts ? e.hasLpv : e.lpv) && (g === MY ? e.mine : e.group === g)).length, b = document.createElement('button');
    b.textContent = g + (n ? ` ${n}` : ''); b.className = !query && g === gFilter ? 'on' : ''; b.onclick = () => { gFilter = g; sFilter = null; query = ''; tagFilter = null; $('search').value = ''; catsOpen = false; manualCat = true; libUI(); }; $('groups').append(b); }
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
    b.onclick = ev => { const now = ev.timeStamp; if (lastLibTap.id === id && now - lastLibTap.t < 450) { lastLibTap = {}; placing = null; libUI(); boneNumsUI(); return quickAdd(id); } lastLibTap = {id, t: now};
      placing = placing === id ? null : id; libUI(); boneNumsUI(); if (placing) tip(isAlong(e) && modeBone ? `Tap a bone dot for the ${e.name}` : `Tap the body where the ${e.name} goes`, 4000); };
    gr.append(b); thumbObs.observe(img); }
  if (!visibleIds().length && gFilter !== 'Free Packs (CC0)') gr.innerHTML = gFilter === MY ? '<div class="hint">Your own parts land here. Open ⋯ → 🛠 Create Asset (Workshop), build a hand, wing, head… then 💾 Save part.</div>' : '<div class="hint">Nothing here yet.</div>';
}
$('grpToggle').onclick = () => { catsOpen = !catsOpen; libUI(); };
const lpPartsUI = () => { $('bLPParts').textContent = '🔷 Low-poly parts: ' + (lpParts ? 'on' : 'off'); $('bLPParts').classList.toggle('on', lpParts); }; lpPartsUI();
$('bLPParts').onclick = () => { lpParts = !lpParts; try { localStorage.setItem('mf-lpparts', lpParts ? '1' : '0'); } catch (x) {} lpPartsUI(); libUI(); tip(lpParts ? 'Showing the low-poly version of every part' : 'Showing the normal smooth parts', 2000); };
$('bLPSwap').onclick = () => { if (!P.parts.length) return tip('Build or load something first'); snap(); const toLow = P.parts.some(p => LIB[p.lib] && LIB[p.lib].hasLpv); let n = 0;
  for (const p of P.parts) { const e = LIB[p.lib]; const nid = toLow ? e && e.hasLpv : e && e.lpv; if (!nid || !LIB[nid]) continue; p.lib = nid; p.sculpt = null; p.cut = []; p.vpaint = null; p.layer = null; p.keep = null; n++; }
  rebuildParts(); outliner(); saveCur(); $('bLPSwap').textContent = toLow ? '🔷 Swap back to smooth' : '🔷 Swap my model to low-poly'; tip(n + ' parts swapped to ' + (toLow ? 'low-poly' : 'smooth') + ' (sculpt / brushed paint on them was cleared)', 3000); };
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
  if (pt.fit) pt.fit.tweaked = true; pt.p = v.G.position.toArray().map(x => +x.toFixed(3)); const e = new THREE.Euler().setFromQuaternion(v.G.quaternion); pt.r = [e.x, e.y, e.z].map(x => +(x / D).toFixed(1));
  if (gizmo.mode === 'scale') { const s = v.G.scale; pt.l = +((pt.l || 1) * s.y / pt.s).toFixed(3); pt.w = +((pt.w || 1) * (s.x + s.z) / 2 / pt.s).toFixed(3); v.G.scale.setScalar(pt.s); v.M.scale.set((pt.flip ? -1 : 1) * pt.w, pt.l, pt.w); applyOff(pt, v.M); }
  syncTwin(pt); syncEdit(true);
}
function attachGizmo() { gizmo.detach(); gzTarget = 'part'; if (sticky && tab === 'edit') return;
  if (tab === 'skel' && (poseMode || jointMode) && selBone && bones[selBone]) { gzTarget = poseMode ? 'bone' : 'joint'; gizmo.setMode(poseMode ? 'rotate' : 'translate'); gizmo.attach(bones[selBone]); return; }
  if (tab === 'edit' && sel && views[sel]) { gizmo.setMode(gzMode); gizmo.attach(views[sel].G); } }
let gzMode = 'translate';
document.querySelectorAll('[data-gz]').forEach(b => b.onclick = () => { gzMode = b.dataset.gz; document.querySelectorAll('[data-gz]').forEach(x => x.classList.toggle('on', x === b)); attachGizmo(); });
$('bLocal').onclick = e => { gizmo.setSpace(gizmo.space === 'world' ? 'local' : 'world'); e.target.classList.toggle('on', gizmo.space === 'local'); };
$('bSnap').onclick = e => { const on = gizmo.translationSnap == null; gizmo.setTranslationSnap(on ? .25 : null); gizmo.setRotationSnap(on ? 15 * D : null); e.target.textContent = on ? 'Snap on' : 'Snap off'; e.target.classList.toggle('on', on); };
function syncEdit(soft) { const pt = partBy(sel);
  $('grab').textContent = pt ? (LIB[pt.lib] ? LIB[pt.lib].name : 'part') + (pt.bone ? ' · on ' + pt.bone : '') : (selBone && tab === 'skel' ? 'Bone: ' + selBone : 'Mythic Forge');
  if (!pt) return; for (const [s, v, k] of [['sSize', 'vSize', 's'], ['sLen', 'vLen', 'l'], ['sWid', 'vWid', 'w']]) { if (!soft || document.activeElement !== $(s)) $(s).value = pt[k] || 1; $(v).textContent = (+(pt[k] || 1)).toFixed(2); }
  $('bHide').textContent = pt.hidden ? 'Show' : 'Hide'; $('bUnlink').style.display = pt.twin ? '' : 'none'; $('tint').value = pt.tint || '#ffffff'; fadeUI(pt); paintNowUI(); }
for (const [s, k] of [['sSize', 's'], ['sLen', 'l'], ['sWid', 'w']]) { $(s).onpointerdown = () => snap();
  $(s).oninput = e => { const pt = partBy(sel); if (!pt) return; if (pt.fit) pt.fit.tweaked = true; pt[k] = +e.target.value; buildPart(pt); syncTwin(pt); attachGizmo(); syncEdit(true); saveCur(); }; }
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
    b.innerHTML = `<img src="${matThumb(k)}" alt=""><span>${name}</span>`; b.dataset.k = k; b.onclick = () => paint(k); $('mats').append(b); } paintNowUI(); }
// which skin is on the selected part (and which one the 🧴 Skin brush paints) — shown at the top of the Paint tab and outlined in the grid
const matName = k => (MATS.LIST.find(l => l[0] === k) || [k, k])[1];
function paintNowUI() { const el = $('paintNow'); if (!el) return; const pt = partBy(sel);
  { const mk = pt && (pt.matAll || (pt.mat && pt.mat.find(x => x)) || (pieces(pt.lib, pt.params)[0] || {}).mat), c = mk && (MATS.LIST.find(l => l[0] === mk) || [])[2]; if (c && c !== matCat && tab === 'paint' && pt.uid !== paintNowUI.last) { paintNowUI.last = pt.uid; matCat = c; return matsUI(); } if (pt) paintNowUI.last = pt.uid; }
  const main = pt ? (pt.matAll || (pt.mat && pt.mat.find(x => x)) || (pieces(pt.lib, pt.params)[0] || {}).mat) : null, mixed = pt && !pt.matAll && pt.mat && new Set(pt.mat.filter(Boolean)).size > 1;
  const br = brushPaint && paintBrush === 'skin' ? skinBrushMat : null, lay = pt && pt.layer ? pt.layer.mat : null;
  el.innerHTML = !pt ? '🎨 Tap a part to see its skin' + (paintAll ? ' — 🎨 Paint all is ON (skins go on every part)' : '') :
    `<img src="${matThumb(main)}" alt=""><div><b>${LIB[pt.lib] ? LIB[pt.lib].name : 'Part'}</b>${pt.twin && paintTwin ? ' (+ other side)' : ''}<br>Skin: <b>${matName(main)}</b>${mixed ? ' + other pieces' : ''}${lay ? '<br>Brushed on: <b>' + matName(lay) + '</b>' : ''}${br ? '<br>🧴 Brush paints: <b>' + matName(br) + '</b>' : ''}${paintAll ? '<br><b>🎨 Paint all is ON</b>' : ''}</div>`;
  document.querySelectorAll('#mats .item').forEach(b => { b.classList.toggle('cur', !!main && b.dataset.k === main); b.classList.toggle('brush', !!br && b.dataset.k === br); }); }
let matR = null; const matThumbs = {};
function matThumb(k) { if (matThumbs[k]) return matThumbs[k]; try { if (!matR) { matR = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true}); matR.setSize(120, 120); matR.toneMapping = THREE.ACESFilmicToneMapping; }
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x303040, 1.3)); const L = new THREE.DirectionalLight(0xffffff, 2.6); L.position.set(2, 3, 4); sc.add(L);
  sc.add(new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), MATS.makeMat(THREE, k))); const cam = new THREE.PerspectiveCamera(30, 1, .1, 20); cam.position.set(0, 0, 4.2);
  matR.render(sc, cam); return matThumbs[k] = matR.domElement.toDataURL('image/webp', .8); } catch (e) { return ''; } }
var piecePaint = false, lastPick = null;
$('bPiecePaint').onclick = () => { piecePaint = !piecePaint; $('bPiecePaint').classList.toggle('on', piecePaint); tip(piecePaint ? 'One piece: tap a spike / crystal / bit on the model, then tap a material' : 'Whole part gets painted', 2600); };
let paintAll = false;
function paint(k) { if (brushPaint && paintBrush === 'skin') { skinBrushMat = k; pbUI(); const pt = partBy(sel); if (pt && pt.layer && pt.layer.mat !== k) { snap(); pt.layer.mat = k; buildPart(pt); if (paintTwin) syncTwin(pt); saveCur(); }
    return tip('Skin brush: ' + MATS.LIST.find(l => l[0] === k)[1] + ' — draw it on', 1800); }
  if (paintAll) { snap(); for (const o of P.parts) if (!o.boxed) { o.matAll = k; o.mat = null; buildPart(o); } saveCur(); return tip(MATS.LIST.find(l => l[0] === k)[1] + ' on the whole creature'); }
  const pt = partBy(sel); if (!pt) return tip('Tap a part first, or turn on 🎨 Paint all'); snap();
  if (piecePaint) { if (!lastPick || lastPick.uid !== sel) return tip('Tap the piece on the model first'); const g = pieceClusters(pt, true).find(x => x.ids.includes(lastPick.mi)), ids = g ? g.ids : [lastPick.mi];
    const n = pieces(pt.lib, pt.params).length; pt.mat = pt.mat || Array(n).fill(null); ids.forEach(i => pt.mat[i] = k); buildPart(pt); if (paintTwin) syncTwin(pt); saveCur(); paintNowUI(); return tip(MATS.LIST.find(l => l[0] === k)[1] + ' on that piece only'); }
  pt.matAll = k; pt.mat = null; buildPart(pt); if (paintTwin) syncTwin(pt); saveCur(); paintNowUI(); tip(MATS.LIST.find(l => l[0] === k)[1] + ' applied to ' + (LIB[pt.lib] ? LIB[pt.lib].name : 'the part') + (pt.twin && paintTwin ? ' (both sides)' : '')); }
$('bPaintAll').onclick = e => { paintAll = !paintAll; e.target.classList.toggle('on', paintAll); paintNowUI(); if (paintAll) { piecePaint = false; $('bPiecePaint').classList.remove('on'); } tip(paintAll ? 'Paint all on: a material or tint now goes on every part' : 'Paint all off: paints the part you tap', 2600); };
$('tint').onchange = e => { if (paintAll) { snap(); for (const o of P.parts) if (!o.boxed) { o.tint = e.target.value; buildPart(o); } return saveCur(); } const pt = partBy(sel); if (!pt) return; snap(); pt.tint = e.target.value; buildPart(pt); if (paintTwin) syncTwin(pt); saveCur(); };
function fadeUI(pt) { pt = pt || partBy(sel); const on = !!(pt && pt.fade); $('bFade').classList.toggle('on', on); $('fadeRow').style.display = on ? '' : 'none';
  if (on) { $('sFade').value = pt.fade.amt; $('vFade').textContent = (+pt.fade.amt).toFixed(2); $('bDust').classList.toggle('on', pt.fade.dust !== false); $('bFadeStyle').textContent = {burn: 'Style: 🔥 Burn', glitter: 'Style: ✨ Glitter'}[pt.fade.style] || 'Style: 💨 Dust'; }
  const gl = !!(pt && pt.glit); $('bGlit').classList.toggle('on', gl); $('glitRow').style.display = gl ? '' : 'none'; if (gl) { $('sGlit').value = pt.glit.amt; }
  const dr = !!(pt && pt.drip); $('bPDrip').classList.toggle('on', dr); $('dripRow').style.display = dr ? '' : 'none'; if (dr) { $('sDrip').value = pt.drip.amt; $('vDrip').textContent = (+pt.drip.amt).toFixed(2); $('bMelt').classList.toggle('on', !!pt.drip.melt); } }
const fadeTargets = () => { if (paintAll) return P.parts.filter(o => !o.boxed); const pt = partBy(sel); if (!pt) return []; const t = twinOf(pt); return t ? [pt, t] : [pt]; };
$('bFade').onclick = () => { const L = fadeTargets(); if (!L.length) return tip('Tap a part first (or turn on Paint all)'); snap(); const on = !L[0].fade;
  L.forEach(o => { o.fade = on ? {amt: .5, dust: true, style: 'dust'} : null; buildPart(o); }); fadeUI(L[0]); saveCur(); tip(on ? 'Fade away on — the far end dissolves into drifting dust' : 'Fade away off'); };
$('bFadeStyle').onclick = () => { const L = fadeTargets().filter(o => o.fade); if (!L.length) return; snap(); const st = {dust: 'burn', burn: 'glitter', glitter: 'dust'}[L[0].fade.style || 'dust']; L.forEach(o => { o.fade.style = st; buildPart(o); }); fadeUI(L[0]); saveCur();
  tip({burn: 'Burn: holes burn through with glowing edges and embers', glitter: 'Glitter: the end sparkles away and glitter falls off', dust: 'Dust: the end crumbles away and the grains fall like sand'}[st]); };
$('bPDrip').onclick = () => { const L = fadeTargets(); if (!L.length) return tip('Tap a part first (or turn on Paint all)'); snap(); const on = !L[0].drip; L.forEach(o => { o.drip = on ? {amt: .5, melt: false} : null; buildPart(o); }); fadeUI(L[0]); saveCur();
  tip(on ? 'Drip on — drips in the part\'s own skin (galaxy drips galaxy)' : 'Drip off'); };
$('sDrip').oninput = e => { $('vDrip').textContent = (+e.target.value).toFixed(2); };
$('sDrip').onchange = e => { snap(); fadeTargets().forEach(o => { if (o.drip) { o.drip.amt = +e.target.value; buildPart(o); } }); saveCur(); };
$('bMelt').onclick = () => { const L = fadeTargets().filter(o => o.drip); if (!L.length) return; snap(); const m = !L[0].drip.melt; L.forEach(o => { o.drip.melt = m; buildPart(o); }); fadeUI(L[0]); saveCur(); tip(m ? 'Melt: drips from all over the part' : 'Drips from the bottom edges'); };
$('bGlit').onclick = () => { const L = fadeTargets(); if (!L.length) return tip('Tap a part first (or turn on Paint all)'); snap(); const on = !L[0].glit; L.forEach(o => { o.glit = on ? {amt: .5} : null; buildPart(o); }); fadeUI(L[0]); saveCur();
  tip(on ? 'Glitter fall on — sparkles shed off the part (works with or without Fade / Drip)' : 'Glitter fall off'); };
$('sGlit').onchange = e => { snap(); fadeTargets().forEach(o => { if (o.glit) { o.glit.amt = +e.target.value; buildPart(o); } }); saveCur(); };
$('sFade').onpointerdown = () => snap();
$('sFade').oninput = e => { const v = +e.target.value; $('vFade').textContent = v.toFixed(2); fadeTargets().forEach(o => { if (!o.fade) return; o.fade.amt = v; const w = views[o.uid]; if (w) w.meshes.forEach(m => m.material.userData.fadeU && (m.material.userData.fadeU.uFadeA.value = v)); }); };
$('sFade').onchange = () => { fadeTargets().forEach(o => o.fade && buildPart(o)); saveCur(); };
$('bDust').onclick = () => { const L = fadeTargets().filter(o => o.fade); if (!L.length) return; snap(); const on = L[0].fade.dust === false; L.forEach(o => { o.fade.dust = on; buildPart(o); }); fadeUI(L[0]); saveCur(); };
$('eyeGlow').oninput = e => { P.fx.eyeGlow = e.target.value; applyEyeGlow(); };
$('eyeGlow').onchange = () => saveCur();
$('bEyeGlowReset').onclick = () => { delete P.fx.eyeGlow; applyFX(); saveCur(); tip('Eye glow back to default'); };
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
let paintBrush = 'color', skinBrushMat = 'galaxy';
const PB_TIP = {color: 'Color brush: draw on the part with the color next to it', skin: 'Skin brush: tap any skin below to pick it, then draw it on (one brushed skin per part)', blend: 'Blend: rub where two paints meet to mix them softly', blotch: 'Blotch: tap to splat paint (the color next to 🖌) that runs down the skin'};
function pbUI() { document.querySelectorAll('[data-pb]').forEach(b => b.classList.toggle('on', brushPaint && b.dataset.pb === paintBrush)); $('pbRow').style.display = brushPaint ? '' : 'none';
  const nm = (MATS.LIST.find(l => l[0] === skinBrushMat) || [])[1]; $('pbHint').textContent = PB_TIP[paintBrush] + (paintBrush === 'skin' ? ' — now: ' + nm : ''); paintNowUI(); }
document.querySelectorAll('[data-pb]').forEach(b => b.onclick = () => { const k = b.dataset.pb; brushPaint = !(brushPaint && paintBrush === k); paintBrush = k; pbUI(); updateOrbit();
  tip(brushPaint ? (sel ? PB_TIP[k] : 'Tap a part first, then draw on it') : 'Brush off', 2600); });
$('bBrushErase').onclick = () => { const pt = partBy(sel); if (!pt) return; snap(); pt.vpaint = null; pt.layer = null; buildPart(pt); syncTwin(pt); saveCur(); tip('Brushed paint cleared'); };
function paintStroke(x, y) { const pt = partBy(sel), v = views[sel]; if (!pt || !v) return; const hit = cast(x, y, v.meshes); if (!hit) return;
  if (paintBrush === 'blotch') return lastHit ? null : (lastHit = true, blotchStroke(pt, hit, x, y));
  if (paintBrush !== 'color') return layerStroke(pt, hit, x, y);
  const mesh = hit.object, mi = mesh.userData.mi; pt.vpaint = pt.vpaint || {};
  if (!pt.vpaint[mi]) { pt.vpaint[mi] = {}; buildPart(pt); return paintStroke(x, y); }
  const g = mesh.geometry, p = g.attributes.position, col = g.attributes.color; if (!col) return; const local = mesh.worldToLocal(hit.point.clone()), ws = new THREE.Vector3(); mesh.getWorldScale(ws);
  const R = (+$('sPSize').value) / Math.abs(ws.y), R2 = R * R, power = Math.min(1, +$('sPStr').value * pressure), c = new THREE.Color($('brushCol').value), M = pt.vpaint[mi];
  const centers = [local]; if (symSculpt) centers.push(new THREE.Vector3(-local.x, local.y, local.z));
  for (const ce of centers) for (let i = 0; i < p.count; i++) { const d2 = (p.getX(i) - ce.x) ** 2 + (p.getY(i) - ce.y) ** 2 + (p.getZ(i) - ce.z) ** 2; if (d2 > R2) continue;
    const f = (1 - d2 / R2) * power, r = col.getX(i) + (c.r - col.getX(i)) * f, gg = col.getY(i) + (c.g - col.getY(i)) * f, b = col.getZ(i) + (c.b - col.getZ(i)) * f; col.setXYZ(i, r, gg, b); M[i] = [+r.toFixed(3), +gg.toFixed(3), +b.toFixed(3)]; }
  col.needsUpdate = true; }
// 🩸 blotch: a splat with a ragged edge, then runs trickle downhill over the mesh (follows the lowest neighbour each step)
function blotchStroke(pt, hit, x, y) { const mesh = hit.object, mi = mesh.userData.mi; pt.vpaint = pt.vpaint || {};
  if (!pt.vpaint[mi]) { pt.vpaint[mi] = {}; buildPart(pt); lastHit = null; return paintStroke(x, y); }
  const g = mesh.geometry, p = g.attributes.position, col = g.attributes.color; if (!col) return; const M = pt.vpaint[mi], c = new THREE.Color($('brushCol').value), nb = adj(g);
  const local = mesh.worldToLocal(hit.point.clone()), ws = new THREE.Vector3(); mesh.getWorldScale(ws); const R = (+$('sPSize').value) / Math.abs(ws.y), power = Math.min(1, +$('sPStr').value * 2.2);
  const set = (i, f) => { f = Math.min(1, f); const r = col.getX(i) + (c.r - col.getX(i)) * f, gg = col.getY(i) + (c.g - col.getY(i)) * f, b = col.getZ(i) + (c.b - col.getZ(i)) * f; col.setXYZ(i, r, gg, b); M[i] = [+r.toFixed(3), +gg.toFixed(3), +b.toFixed(3)]; };
  const wy = i => new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(mesh.matrixWorld).y, seeds = [];
  const ph = Math.random() * 9; for (let i = 0; i < p.count; i++) { const dx = p.getX(i) - local.x, dy = p.getY(i) - local.y, dz = p.getZ(i) - local.z, d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const ang = Math.atan2(dy, dx + dz), rr2 = R * (.75 + .35 * Math.sin(ang * 5 + ph) + .15 * Math.sin(ang * 11 + ph * 2)); if (d > rr2) continue; set(i, power * (1 - Math.pow(d / rr2, 3))); if (d > rr2 * .7) seeds.push(i); }
  seeds.sort((a, b) => wy(a) - wy(b)); const runs = Math.min(seeds.length, 3 + ((Math.random() * 4) | 0));
  for (let k = 0; k < runs; k++) { let i = seeds[(k * 2 + ((Math.random() * 3) | 0)) % seeds.length], amt = power, steps = 0; const seen = new Set();
    while (amt > .08 && steps++ < 160) { seen.add(i); set(i, amt); nb[i].forEach(o => set(o, amt * .45)); let best = -1, by = wy(i);
      for (const o of nb[i]) { if (seen.has(o)) continue; const y2 = wy(o); if (y2 < by - 1e-5) { by = y2; best = o; } } if (best < 0) break; i = best; amt *= .985; } }
  col.needsUpdate = true; }
function layerStroke(pt, hit, x, y) { const mesh = hit.object, mi = mesh.userData.mi;
  if (paintBrush === 'skin') { pt.layer = pt.layer || {mat: skinBrushMat, m: {}}; if (!pt.layer.m[mi]) { pt.layer.m[mi] = {}; buildPart(pt); return paintStroke(x, y); } }
  const g = mesh.geometry, p = g.attributes.position, A = g.attributes.lmask, col = g.attributes.color, local = mesh.worldToLocal(hit.point.clone()), ws = new THREE.Vector3(); mesh.getWorldScale(ws);
  const R = (+$('sPSize').value) / Math.abs(ws.y), R2 = R * R, power = Math.min(1, +$('sPStr').value * pressure), centers = [local]; if (symSculpt) centers.push(new THREE.Vector3(-local.x, local.y, local.z));
  if (paintBrush === 'blend' && !A && !col) return tip('Paint something with the color or skin brush first, then blend it', 1600);
  const nb = paintBrush === 'blend' ? adj(g) : null, LM = pt.layer && pt.layer.m[mi], VP = pt.vpaint && pt.vpaint[mi];
  for (const ce of centers) for (let i = 0; i < p.count; i++) { const d2 = (p.getX(i) - ce.x) ** 2 + (p.getY(i) - ce.y) ** 2 + (p.getZ(i) - ce.z) ** 2; if (d2 > R2) continue; const f = (1 - d2 / R2) * power;
    if (paintBrush === 'skin') { const val = A.getX(i) + (1 - A.getX(i)) * f; A.setX(i, val); LM[i] = +val.toFixed(2); continue; }
    const k = nb[i]; if (!k.length) continue; const t = Math.min(1, f * 1.4);
    if (A && LM) { let s = 0; for (const o of k) s += A.getX(o); const val = A.getX(i) + (s / k.length - A.getX(i)) * t; A.setX(i, val); LM[i] = +val.toFixed(2); }
    if (col && VP) { let r = 0, gg = 0, b = 0; for (const o of k) { r += col.getX(o); gg += col.getY(o); b += col.getZ(o); } const n = k.length;
      col.setXYZ(i, col.getX(i) + (r / n - col.getX(i)) * t, col.getY(i) + (gg / n - col.getY(i)) * t, col.getZ(i) + (b / n - col.getZ(i)) * t); VP[i] = [+col.getX(i).toFixed(3), +col.getY(i).toFixed(3), +col.getZ(i).toFixed(3)]; } }
  if (A) A.needsUpdate = true; if (col) col.needsUpdate = true; }
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let castCam = null;   // set while a stroke comes from the focus window: rays go through the window's own camera
function cast(x, y, objs) { const c = castCam, cam = c ? c.cam : camera;
  if (c) ndc.set((x - c.rect.left) / c.rect.width * 2 - 1, -((y - c.rect.top) / c.rect.height) * 2 + 1); else ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, cam); ray.camera = cam; return ray.intersectObjects(objs, false)[0]; }
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
const brushAt = (x, y) => P.fx.lowpoly && !lpMode ? (lastHit ? null : (lastHit = true, tip('Turn off 🔷 Low-poly look (FX / View) to sculpt or brush paint', 2200))) : tab === 'paint' ? paintStroke(x, y) : lpMode ? (lastHit ? null : (lastHit = true, lpTap(x, y))) : stroke(x, y);
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
  if (hitP) { lastPick = {uid: hitP.object.userData.uid, mi: hitP.object.userData.mi}; select(hitP.object.userData.uid); if (piecePaint && tab === 'paint') tip('Piece picked — tap a material', 1400); return; }
  if (hitB) { selBone = hitB.object.userData.bone; markBone(); syncBoneUI(); boneNumsUI(); catForBone(selBone); tip('Bone ' + (boneOrder.indexOf(selBone) + 1) + ': ' + niceBone(selBone) + ' — showing parts for it'); return; }
});

// ====================================================================== 🔷 low-poly building (Sculpt tab)
let lpMode = false, lpSel = new Set(), lpUid = null, lpHL = null;
const LPF = window.FORGE_POLY;
const lpPart = () => { const pt = partBy(sel); return pt && LIB[pt.lib] && LIB[pt.lib].lowpoly ? pt : null; };
const lpGet = pt => JSON.parse(JSON.stringify((pt.params && pt.params.poly) || (pt.lib === 'lp_tube' ? LPF.tube() : LPF.box())));
function lpSet(pt, poly) { pt.params = {poly}; pt.sculpt = null; pt.cut = []; pt.vpaint = null; pt.layer = null; buildPart(pt); syncTwin(pt); lpDraw(); saveCur(); }
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], vmul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
function fNorm(poly, f) { let x = 0, y = 0, z = 0; for (let i = 0; i < f.length; i++) { const a = poly.v[f[i]], b = poly.v[f[(i + 1) % f.length]]; x += (a[1] - b[1]) * (a[2] + b[2]); y += (a[2] - b[2]) * (a[0] + b[0]); z += (a[0] - b[0]) * (a[1] + b[1]); }
  const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; }
const fCent = (poly, f) => vmul(f.reduce((s, i) => vadd(s, poly.v[i]), [0, 0, 0]), 1 / f.length);
const ekey = (a, b) => a < b ? a + '_' + b : b + '_' + a;
function lpCompact(poly) { const used = [...new Set(poly.f.flat())].sort((a, b) => a - b), map = new Map(used.map((o, i) => [o, i])); poly.v = used.map(i => poly.v[i]); poly.f = poly.f.map(f => f.map(i => map.get(i))); return poly; }
function triToFace(poly, t) { let k = 0; for (let i = 0; i < poly.f.length; i++) { const n = poly.f[i].length - 2; if (t < k + n) return i; k += n; }
  if (poly.mirror) for (let i = 0; i < poly.f.length; i++) { if (poly.f[i].every(j => Math.abs(poly.v[j][0]) < 1e-4)) continue; const n = poly.f[i].length - 2; if (t < k + n) return i; k += n; } return -1; }
function lpDraw() { if (lpHL) { lpHL.removeFromParent(); lpHL.geometry.dispose(); lpHL = null; } const pt = lpPart(); if (!lpMode || !pt || !lpSel.size || !views[pt.uid]) return;
  const poly = lpGet(pt), f = [...lpSel].filter(i => poly.f[i]).map(i => poly.f[i]); if (!f.length) return;
  const sh = {v: poly.v.map(p => p.slice()), f, mirror: poly.mirror}; f.forEach(ff => { const n = fNorm(poly, ff); ff.forEach(i => { sh.v[i] = vadd(poly.v[i], vmul(n, .015)); }); });
  lpHL = new THREE.Mesh(LPF.build(THREE, sh), new THREE.MeshBasicMaterial({color: 0xff8a2a, transparent: true, opacity: .55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2}));
  lpHL.raycast = () => {}; views[pt.uid].M.add(lpHL); }
function lpTap(x, y) { const pt = lpPart(); if (!pt) return tip('Tap a low-poly part (or press ➕ Block)', 1800); if (lpUid !== pt.uid) { lpSel.clear(); lpUid = pt.uid; }
  const hit = cast(x, y, views[pt.uid].meshes); if (!hit) return; const fi = triToFace(lpGet(pt), hit.faceIndex); if (fi < 0) return;
  lpSel.has(fi) ? lpSel.delete(fi) : lpSel.add(fi); lpDraw(); }
function lpNeed(n = 1) { const pt = lpPart(); if (!pt) { tip('Pick a low-poly part first (➕ Block)'); return null; } if (lpSel.size < n) { tip(n === 1 ? 'Tap a face first' : 'Pick ' + n + ' faces first'); return null; } snap(); return pt; }
const lpStep = () => +$('sLP').value;
function lpVerts(poly) { return [...new Set([...lpSel].flatMap(i => poly.f[i] || []))]; }
function lpKeepMid(poly, ids, before) { if (!poly.mirror) return; ids.forEach(i => { if (Math.abs(before[i][0]) < 1e-4) poly.v[i][0] = 0; }); }
function lpExtrude(d) { const pt = lpNeed(); if (!pt) return; const poly = lpGet(pt), S = [...lpSel], cnt = new Map(), vn = new Map();
  S.forEach(fi => { const f = poly.f[fi], n = fNorm(poly, f); f.forEach((a, k) => { const b = f[(k + 1) % f.length], key = ekey(a, b); cnt.set(key, (cnt.get(key) || 0) + 1); vn.set(a, vadd(vn.get(a) || [0, 0, 0], n)); }); });
  const map = new Map(); for (const [i, n] of vn) { const l = Math.hypot(...n) || 1, nv = vadd(poly.v[i], vmul(n, d / l)); if (poly.mirror && Math.abs(poly.v[i][0]) < 1e-4) nv[0] = 0; map.set(i, poly.v.length); poly.v.push(nv); }
  S.forEach(fi => { const f = poly.f[fi]; f.forEach((a, k) => { const b = f[(k + 1) % f.length]; if (cnt.get(ekey(a, b)) === 1) poly.f.push([a, b, map.get(b), map.get(a)]); }); poly.f[fi] = f.map(i => map.get(i)); });
  lpSet(pt, poly); tip(d > 0 ? 'Pulled out — press again to keep growing' : 'Pushed in'); }
function lpXform(fn) { const pt = lpNeed(); if (!pt) return; const poly = lpGet(pt), ids = lpVerts(poly), before = poly.v.map(p => p.slice()), c = vmul(ids.reduce((s, i) => vadd(s, poly.v[i]), [0, 0, 0]), 1 / ids.length);
  ids.forEach(i => { poly.v[i] = fn(poly.v[i], c); }); lpKeepMid(poly, ids, before); lpSet(pt, poly); }
function lpRot(ax, sg) { const a = sg * 15 * D, cs = Math.cos(a), sn = Math.sin(a);
  lpXform((p, c) => { const q = vsub(p, c); let r; if (ax === 'x') r = [q[0], q[1] * cs - q[2] * sn, q[1] * sn + q[2] * cs]; else if (ax === 'y') r = [q[0] * cs + q[2] * sn, q[1], -q[0] * sn + q[2] * cs]; else r = [q[0] * cs - q[1] * sn, q[0] * sn + q[1] * cs, q[2]]; return vadd(c, r); }); }
function lpConnect() { const pt = lpNeed(2); if (!pt) return; if (lpSel.size !== 2) return tip('Pick exactly 2 faces to connect'); const poly = lpGet(pt), [ia, ib] = [...lpSel], A = poly.f[ia], Bf = poly.f[ib];
  if (A.length !== Bf.length) return tip('Both faces need the same number of corners'); const n = A.length, Br = [...Bf].reverse(); let best = 0, bd = 1e9;
  for (let k = 0; k < n; k++) { let s = 0; for (let i = 0; i < n; i++) { const p = poly.v[A[i]], q = poly.v[Br[(i + k) % n]]; s += Math.hypot(...vsub(p, q)); } if (s < bd) { bd = s; best = k; } }
  for (let i = 0; i < n; i++) { const a0 = A[i], a1 = A[(i + 1) % n], b0 = Br[(i + best) % n], b1 = Br[(i + 1 + best) % n]; poly.f.push([a0, a1, b1, b0]); }
  poly.f = poly.f.filter((_, i) => i !== ia && i !== ib); lpSel.clear(); lpSet(pt, lpCompact(poly)); tip('Connected — a bridge joins the two faces'); }
function lpCut(dir) { const pt = lpNeed(); if (!pt) return; const poly = lpGet(pt), f0 = [...lpSel][0]; if (poly.f[f0].length !== 4) return tip('Cut loops need a 4-sided face');
  const eFaces = new Map(); poly.f.forEach((f, fi) => f.forEach((a, k) => { const key = ekey(a, f[(k + 1) % f.length]); (eFaces.get(key) || eFaces.set(key, []).get(key)).push(fi); }));
  const split = new Map(); const walk = (fi, a, b) => { while (true) { const f = poly.f[fi]; if (f.length !== 4 || split.has(fi)) return; let p = -1; for (let k = 0; k < 4; k++) if (ekey(f[k], f[(k + 1) % 4]) === ekey(a, b)) p = k; if (p < 0) return;
      split.set(fi, p); const c = f[(p + 2) % 4], d = f[(p + 3) % 4], nx = (eFaces.get(ekey(c, d)) || []).find(o => o !== fi); if (nx == null) return; fi = nx; a = c; b = d; } };
  const f = poly.f[f0], p = dir ? 1 : 0; walk(f0, f[p], f[(p + 1) % 4]); const back = (eFaces.get(ekey(f[p], f[(p + 1) % 4])) || []).find(o => o !== f0); if (back != null) walk(back, f[p], f[(p + 1) % 4]);
  const mid = new Map(), M = (a, b) => { const key = ekey(a, b); if (!mid.has(key)) { mid.set(key, poly.v.length); poly.v.push(vmul(vadd(poly.v[a], poly.v[b]), .5)); } return mid.get(key); }, out = [];
  poly.f.forEach((ff, fi) => { if (!split.has(fi)) return out.push(ff); const k = split.get(fi), q = [0, 1, 2, 3].map(j => ff[(k + j) % 4]), m01 = M(q[0], q[1]), m23 = M(q[2], q[3]); out.push([q[0], m01, m23, q[3]], [m01, q[1], q[2], m23]); });
  poly.f = out; lpSel.clear(); lpSet(pt, poly); tip('Cut a loop through ' + split.size + ' faces — pick faces on either side to move them'); }
function lpWeld() { const pt = lpPart(); if (!pt) return tip('Pick a low-poly part first'); snap(); const poly = lpGet(pt), n = poly.v.length, par = [...Array(n).keys()], fd = i => par[i] === i ? i : (par[i] = fd(par[i])), th = lpStep() * .5;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.hypot(...vsub(poly.v[i], poly.v[j])) < th) par[fd(j)] = fd(i);
  poly.f = poly.f.map(f => { const g = f.map(fd).filter((x, k, a) => x !== a[(k + a.length - 1) % a.length]); return g; }).filter(f => new Set(f).size >= 3);
  const before = poly.f.length; lpSel.clear(); lpSet(pt, lpCompact(poly)); tip('Welded points closer than the Step size (' + before + ' faces)'); }
function lpMirror() { const pt = lpPart(); if (!pt) return tip('Pick a low-poly part first'); snap(); const poly = lpGet(pt);
  if (!poly.mirror) { poly.v.forEach(p => { if (p[0] < .02) p[0] = 0; }); poly.f = poly.f.filter(f => !f.every(i => poly.v[i][0] === 0)); poly.mirror = true; tip('Mirror on: build the right side, the left copies it (the left half was folded to the middle)', 3200); }
  else { const n = poly.v.length, map = poly.v.map((p, i) => Math.abs(p[0]) < 1e-4 ? i : -1); poly.v.forEach((p, i) => { if (map[i] < 0) { map[i] = poly.v.length; poly.v.push([-p[0], p[1], p[2]]); } });
    const add = []; poly.f.forEach(f => { if (!f.every(i => Math.abs(poly.v[i][0]) < 1e-4)) add.push([...f].reverse().map(i => map[i])); }); poly.f.push(...add); poly.mirror = false; tip('Mirror off: both sides are now real faces you can change separately'); }
  lpSel.clear(); lpSet(pt, poly); }
function lpNew(lib) { const b = selBone || (P.bones.find(r => r[0] === 'chest') || P.bones[0] || [])[0]; if (!b) return tip('Add a skeleton bone first');
  const keep = mirrorAdd; mirrorAdd = false; addPart(lib, b, [0, 0, 0], [0, 0, 0], 1); mirrorAdd = keep; lpSel.clear(); lpUid = sel; tip('Low-poly ' + (lib === 'lp_tube' ? 'tube' : 'block') + ' added — tap a face, then ⬆ Pull out', 2600); }
$('bLP').onclick = e => { lpMode = !lpMode; e.target.classList.toggle('on', lpMode); $('lpBox').style.display = lpMode ? '' : 'none'; lpDraw(); tip(lpMode ? 'Low-poly on: tap faces of a low-poly part to pick them' : 'Low-poly off: brushes sculpt again', 2200); };
$('lpBlock').onclick = () => lpNew('lp_block'); $('lpTube').onclick = () => lpNew('lp_tube');
$('lpPull').onclick = () => lpExtrude(lpStep()); $('lpPush').onclick = () => lpExtrude(-lpStep() * .5);
$('lpBig').onclick = () => lpXform((p, c) => vadd(c, vmul(vsub(p, c), 1.15))); $('lpSmall').onclick = () => lpXform((p, c) => vadd(c, vmul(vsub(p, c), .87)));
$('lpConnect').onclick = lpConnect; $('lpCut').onclick = () => lpCut(0); $('lpCut2').onclick = () => lpCut(1); $('lpWeld').onclick = lpWeld; $('lpMirror').onclick = lpMirror;
$('lpDel').onclick = () => { const pt = lpNeed(); if (!pt) return; const poly = lpGet(pt); poly.f = poly.f.filter((_, i) => !lpSel.has(i)); lpSel.clear(); lpSet(pt, lpCompact(poly)); };
$('lpClear').onclick = () => { lpSel.clear(); lpDraw(); }; $('lpAll').onclick = () => { const pt = lpPart(); if (!pt) return; lpSel = new Set(lpGet(pt).f.keys()); lpUid = pt.uid; lpDraw(); };
document.querySelectorAll('[data-lpm]').forEach(b => b.onclick = () => { const d = b.dataset.lpm.split(',').map(Number); lpXform(p => vadd(p, vmul(d, lpStep()))); });
document.querySelectorAll('[data-lpr]').forEach(b => b.onclick = () => { const [ax, sg] = b.dataset.lpr.split(','); lpRot(ax, +sg); });
// ====================================================================== skeleton tab
let poseMode = false, jointMode = false, anim = 'none', animT = 0;
const STARTERS = window.FORGE_STARTERS || [];
function loadStarter(st) { const keep = mirrorAdd; snap(); P = blankProject(st.skel); P.name = st.name; Object.assign(P.fx, st.fx || {}); rebuildSkeleton(); rebuildParts();
  // part: [lib, bone, pos, rot, size ('fit' = body fit system, null = old auto fit, number or [size, length]), flag ('solo' or {solo, mat, tint, fade})]
  for (const [lib, bone, p, r, s, flag] of st.parts) { if (!LIB[lib]) { console.warn('starter part missing', lib); continue; } if (!bones[bone]) { console.warn('starter bone missing', bone); continue; }
    const o = flag && typeof flag === 'object' ? flag : {solo: flag === 'solo'}; let pt = null;
    if (s === 'fit') { const f = fitPart(lib, bone); if (f) { pt = newPart(lib, f.bone, f.p, f.r, f.s); pt.l = f.l; pt.fit = f.fit; } }
    if (!pt) { const fit = s === 'decor' ? [decorScale(bone), 1] : s == null || s === 'fit' ? autoFit(lib, bone) : Array.isArray(s) ? s : [s, 1]; pt = newPart(lib, bone, p, r, fit[0]); pt.l = fit[1]; }
    if (o.mat) pt.matAll = o.mat; if (o.tint) pt.tint = o.tint; if (o.fade) pt.fade = {amt: o.fade, dust: true}; if (o.glit) pt.glit = {amt: o.glit};
    P.parts.push(pt); buildPart(pt); const tb = twinName(pt.bone);
    if (!o.solo && (tb ? bones[tb] : Math.abs(p[0]) > .25)) { const t = newPart(lib, tb || pt.bone, [0, 0, 0], [0, 0, 0]); t.twin = pt.uid; pt.twin = t.uid;
      if (pt.fit) t.fit = {...pt.fit, drop: twinName(pt.fit.drop) || pt.fit.drop, cover: pt.fit.cover.map(c => twinName(c) || c)}; P.parts.push(t); mirrorInto(pt, t); } }
  mirrorAdd = keep; sel = null; applyFX(); outliner(); saveCur(); frameAll(); tip(st.name + ' loaded — tap any part to change it'); }
function startersUI() { const el = $('starters'); if (!el) return; el.innerHTML = ''; for (const st of STARTERS) { const b = document.createElement('button'); b.textContent = st.name;
  b.onclick = () => { if (P.parts.length && !confirm('Load ' + st.name + '? Your current creature is replaced (save it first with ⋯ if you want it).')) return; loadStarter(st); skelUI(); }; el.append(b); } }
const mySkels = (() => { try { return JSON.parse(localStorage.getItem('titan-forge-skels') || '{}'); } catch (e) { return {}; } })();
for (const [k, v] of Object.entries(mySkels)) SKEL[k] = v;
$('bSaveSkel').onclick = () => { const n = prompt('Name this body type (e.g. My mech frame)'); if (!n) return; const k = 'my_' + Date.now().toString(36);
  mySkels[k] = SKEL[k] = {name: '★ ' + n, bones: JSON.parse(JSON.stringify(P.bones))}; localStorage.setItem('titan-forge-skels', JSON.stringify(mySkels)); P.skel = k; skelUI(); saveCur(); tip('Saved — it is in the body type list now'); };
function skelUI() { startersUI(); $('skels').innerHTML = ''; for (const [k, s] of Object.entries(SKEL)) { const b = document.createElement('button'); b.textContent = s.name; b.className = P.skel === k ? 'on' : '';
  b.onclick = () => { if (P.parts.length && !confirm('Switch body type? Parts stay on bones with the same name; others move to the body.')) return; snap(); P.skel = k; P.bones = JSON.parse(JSON.stringify(s.bones)); P.pose = {};
    const names = new Set(P.bones.map(b => b[0])), fb = (P.bones.find(b => b[4] === 'chest') || P.bones[0])[0]; P.parts.forEach(p => { if (p.bone && !names.has(p.bone)) p.bone = fb; if (p.fit && p.fit.drop && !names.has(p.fit.drop)) p.fit.drop = p.bone; }); P.bodyBase = null; P.body = {};
    rebuildSkeleton(); const had = P.parts.length; if (had) { refitAll(false); if (hasBase()) buildBase(); } else buildBase(); rebuildParts(); skelUI(); bodyUI(); outliner(); saveCur(); frameAll(); if (!had) tip('Base body ready — tap a body part, then pick a part to swap it in', 3500); }; $('skels').append(b); } }
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
  P.bodyBase = null; P.body = {}; rebuildSkeleton(); refitAll(false); rebuildParts(); attachGizmo(); bodyUI(); saveCur(); }
$('sBone').onpointerdown = () => { snap(); jointStart = selBone && JSON.parse(JSON.stringify(P.bones)); };
$('sBone').oninput = e => { if (!selBone || !jointStart) return; P.bones = JSON.parse(JSON.stringify(jointStart)); const k = +e.target.value;
  const scaleBone = n => { const r = boneRow(n), h = new THREE.Vector3(...r[2]), t = new THREE.Vector3(...r[3]), nt = h.clone().add(t.clone().sub(h).multiplyScalar(k)), d = nt.clone().sub(t); r[3] = nt.toArray().map(v => +v.toFixed(3));
    const shift = (c, dd) => { const rr = boneRow(c); rr[2] = rr[2].map((v, i) => +(v + dd.getComponent(i)).toFixed(3)); rr[3] = rr[3].map((v, i) => +(v + dd.getComponent(i)).toFixed(3)); P.bones.filter(x => x[1] === c).forEach(x => shift(x[0], dd)); };
    P.bones.filter(x => x[1] === n && new THREE.Vector3(...x[2]).distanceTo(t) < .3).forEach(x => shift(x[0], d)); };
  scaleBone(selBone); const tw = twinName(selBone); if (tw && boneRow(tw)) scaleBone(tw); $('vBone').textContent = k.toFixed(2) + '×'; P.bodyBase = null; P.body = {}; rebuildSkeleton(); refitAll(false); rebuildParts(); saveCur(); };
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
  if (MATS.tick) MATS.tick(performance.now() / 1000);
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
  document.querySelectorAll('[data-bg]').forEach(b => b.classList.toggle('on', b.dataset.bg === f.bg)); $('fxCol').value = f.col; if ($('eyeGlow')) $('eyeGlow').value = f.eyeGlow || '#ff5a1a'; applyEyeGlow(); lowLookUI(); }
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
  if (tab !== 'add') { placing = null; } if (tab === 'add') libUI(); if (tab === 'paint') matsUI(); if (tab === 'shape') shapeUI(); if (tab === 'skel' || tab === 'start') { skelUI(); syncBoneUI(); } if (tab === 'start') bodyUI();
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
$('mNew').onclick = () => { if (P.parts.length && !confirm('Start a new creature? (Save first if you want to keep this one)')) return; snap(); P = blankProject(P.skel); rebuildSkeleton(); buildBase(); rebuildParts(); outliner(); applyFX(); bodyUI(); saveCur(); tip('New creature — base body ready to build on'); };
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
addEventListener('contextmenu', async e => { if (window.MF_V2) { if (e.target.closest && e.target.closest('#lib')) e.preventDefault(); return; } const img = e.target.closest && e.target.closest('.item') && e.target.closest('.item').querySelector('img'); const id = img && img.dataset.id;
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
function fwToggle() { FW.on = !FW.on; $('fwin').classList.toggle('on', FW.on); ['bFWin', 'bFWin2', 'bFWin3', 'bFWin4'].forEach(id => $(id) && $(id).classList.toggle('on', FW.on)); fwLayout(); if (FW.on && !sel) tip('Tap a part to see it in the window', 2200); }
$('bFWin').onclick = fwToggle; $('bFWin2').onclick = fwToggle; ['bFWin3', 'bFWin4'].forEach(id => $(id) && ($(id).onclick = fwToggle)); $('fwClose').onclick = fwToggle;
$('fwSize').onclick = () => { FW.size = (FW.size + 1) % FW_SIZES.length; fwLayout(); };
{ const pts = new Map(); let pinch0 = 0; const el = $('fwin');
  // sculpt / brush paint right inside the window: pen (or one finger when there's no pen) draws, other fingers turn and pinch the window view
  const inWin = fn => { const rc = el.getBoundingClientRect(); castCam = {cam: fwCam, rect: {left: rc.left + 2, top: rc.top + 2, width: rc.width - 4, height: rc.height - 4}}; try { fn(); } finally { castCam = null; } };
  let fwDraw = null;
  el.addEventListener('pointerdown', e => { if (e.target.tagName === 'BUTTON') return; e.preventDefault(); e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch (err) {}
    if (e.pointerType === 'pen' && !penSeen) { penSeen = true; updateOrbit(); }
    const tool = sculpting() && sel && pts.size === 0 && (e.pointerType === 'pen' || (e.pointerType === 'mouse' && e.button === 0) || (e.pointerType === 'touch' && !stylus && !penSeen && !fingerView));
    if (tool) { fwDraw = e.pointerId; pressure = e.pointerType === 'pen' && e.pressure > 0 ? .35 + e.pressure * 1.3 : 1; snap(); stroking = true; lastHit = null; $('ring').style.display = 'none'; inWin(() => brushAt(e.clientX, e.clientY)); return; }
    if (!sculpting() && e.pointerType === 'pen') tip('To sculpt in this window, open the Sculpt tab (or Paint → Brush paint)', 2600);
    if (fwDraw != null && e.pointerType === 'touch') { stroking = false; fwDraw = null; saveCur(); }      // a second finger turns a stroke into a view move
    pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
  el.addEventListener('pointermove', e => { if (fwDraw === e.pointerId) { e.stopPropagation(); if (stroking) { if (e.pointerType === 'pen' && e.pressure > 0) pressure = .35 + e.pressure * 1.3; inWin(() => brushAt(e.clientX, e.clientY)); } return; }
    const p = pts.get(e.pointerId); if (!p) return; e.stopPropagation();
    if (pts.size === 1) { FW.az -= (e.clientX - p[0]) * .012; FW.el = Math.max(-1.45, Math.min(1.45, FW.el + (e.clientY - p[1]) * .01)); }
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch0) FW.zoom = Math.max(.3, Math.min(4, FW.zoom * pinch0 / d)); pinch0 = d; } });
  const up = e => { if (fwDraw === e.pointerId) { fwDraw = null; if (stroking) { stroking = false; const pt = partBy(sel); if (pt) syncTwin(pt); saveCur(); } return; } pts.delete(e.pointerId); pinch0 = 0; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
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
function pieceClusters(pt, strict) { const pcs = pieces(pt.lib, pt.params), boxes = pcs.map(pc => { pc.geo.computeBoundingBox(); const b = pc.geo.boundingBox.clone(), s = b.getSize(new THREE.Vector3()).length(); return b.expandByScalar(Math.max(.005, s * .01)); });
  const par = pcs.map((_, i) => i), f = i => par[i] === i ? i : (par[i] = f(par[i]));
  const ctr = boxes.map(b => b.getCenter(new THREE.Vector3())), wid = boxes.map(b => { const s = b.getSize(new THREE.Vector3()); return Math.min(s.x, s.z); });
  const linked = (i, j) => boxes[i].intersectsBox(boxes[j]) && (!strict || Math.hypot(ctr[i].x - ctr[j].x, ctr[i].z - ctr[j].z) < .5 * Math.min(wid[i], wid[j]) + 1e-3);
  for (let i = 0; i < pcs.length; i++) for (let j = i + 1; j < pcs.length; j++) if (linked(i, j)) par[f(i)] = f(j);
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
var sticky = false, drag = null;
function setSticky(on) { sticky = on; $('bSticky').classList.toggle('on', on); if (on) { gizmo.detach(); tip('Sticky on: drag a part with your finger or pen — it sticks where you let go. Drop it off the model to put it in the Parts box', 4200); } else attachGizmo(); }
$('bSticky').onclick = () => setSticky(!sticky);
const dragPlane = new THREE.Plane(), dragTmp = new THREE.Vector3();
function stickyHit(x, y) { const own = drag ? views[drag.uid].meshes : []; return cast(x, y, visibleMeshes().filter(m => !own.includes(m))); }
canvas.addEventListener('pointerdown', e => { if (!sticky || sculpting() || placing || touches.size > 1 || (e.pointerType === 'mouse' && e.button !== 0)) return;
  if (window.MF_V2 && !['add', 'edit', 'start'].includes(tab)) return;
  const h = cast(e.clientX, e.clientY, visibleMeshes()); if (!h) return; const uid0 = h.object.userData.uid, v = views[uid0]; if (!v) return;
  if (window.MF_V2 && uid0 !== sel) return;   // v2: drag only the part you picked; touching other parts still turns the view
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
    buildPart(pt); if (mold) moldOnto(pt, d.hit.point, d.n || new THREE.Vector3(0, 1, 0)); const tw = pt.twin && partBy(pt.twin); if (tw) { tw.bone = (boneName && twinName(boneName)) || boneName; mirrorInto(pt, tw); }
    if (navigator.vibrate) try { navigator.vibrate(18); } catch (x) {} tip('Stuck on ' + (tgt && LIB[tgt.lib] ? LIB[tgt.lib].name : 'the body'), 1400); }
  else if (window.MF_V2 && !overBoxZone(e)) floatPart(pt, v);
  else { pt.boxed = true; pt.hidden = true; const tw = pt.twin && partBy(pt.twin); if (tw) { tw.twin = null; pt.twin = null; } buildPart(pt); sel = null; tip('Put in the Parts box (Add tab) — tap it there to stick it back on', 3000); }
  outliner(); boxUI(); saveCur(); }
addEventListener('pointerup', endDrag, true); addEventListener('pointercancel', endDrag, true);
let mold = true; try { mold = localStorage.getItem('mf-mold') !== '0'; } catch (x) {}
$('bMold').classList.toggle('on', mold);
$('bMold').onclick = () => { mold = !mold; $('bMold').classList.toggle('on', mold); try { localStorage.setItem('mf-mold', mold ? '1' : '0'); } catch (x) {} tip(mold ? 'Mold on: dropped parts squish around what they land on, like clay' : 'Mold off: parts stay their own shape', 2400); };
// clay mold: press the dropped part onto the surface under it (bottom wraps the curve, buried bits squish out onto the surface)
function moldOnto(pt, c, n) { const v = views[pt.uid]; if (!v) return; buildPartOwn(pt); v.G.updateMatrixWorld(true); n = n.clone().normalize();
  const own = new Set(v.meshes), targets = visibleMeshes().filter(m => !own.has(m)); if (!targets.length) return;
  const u = new THREE.Vector3().crossVectors(n, Math.abs(n.y) < .9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize(), w2 = new THREE.Vector3().crossVectors(n, u);
  let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9, lo = 1e9, hi = -1e9; const W = new THREE.Vector3();
  for (const m of v.meshes) { const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { W.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld).sub(c); const a = W.dot(u), b = W.dot(w2), h = W.dot(n);
    a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b); lo = Math.min(lo, h); hi = Math.max(hi, h); } }
  const N = 14, H = new Float32Array((N + 1) * (N + 1)), rc = new THREE.Raycaster(), size = Math.max(a1 - a0, b1 - b0, hi - lo, .05), up = hi + size;
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const a = a0 + (a1 - a0) * i / N, b = b0 + (b1 - b0) * j / N, o = c.clone().addScaledVector(u, a).addScaledVector(w2, b).addScaledVector(n, up);
    rc.set(o, n.clone().negate()); rc.far = up + size * 2; const h = rc.intersectObjects(targets, false)[0]; H[j * (N + 1) + i] = h ? h.point.clone().sub(c).dot(n) : NaN; }
  const surf = (a, b) => { const fi = Math.max(0, Math.min(N - 1e-4, (a - a0) / Math.max(1e-6, a1 - a0) * N)), fj = Math.max(0, Math.min(N - 1e-4, (b - b0) / Math.max(1e-6, b1 - b0) * N)), i = fi | 0, j = fj | 0, ti = fi - i, tj = fj - j;
    const q = [H[j * (N + 1) + i], H[j * (N + 1) + i + 1], H[(j + 1) * (N + 1) + i], H[(j + 1) * (N + 1) + i + 1]]; if (q.some(Number.isNaN)) { const ok = q.filter(x => !Number.isNaN(x)); return ok.length ? ok.reduce((s, x) => s + x, 0) / ok.length : NaN; }
    return (q[0] * (1 - ti) + q[1] * ti) * (1 - tj) + (q[2] * (1 - ti) + q[3] * ti) * tj; };
  const gap = Math.max(.05, size * .22), eps = size * .01, inv = new THREE.Matrix4(), L = new THREE.Vector3(); let moved = 0;
  for (const m of v.meshes) { const mi = m.userData.mi, p = m.geometry.attributes.position; inv.copy(m.matrixWorld).invert(); pt.sculpt = pt.sculpt || {}; const S = pt.sculpt[mi] = pt.sculpt[mi] || {};
    for (let i = 0; i < p.count; i++) { W.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); const r = W.clone().sub(c), s = surf(r.dot(u), r.dot(w2)); if (Number.isNaN(s)) continue;
      const d = r.dot(n) - s; let d2 = d; if (d < 0) d2 = eps + -d * .12; else if (d < gap) d2 = eps + d * d / gap; if (Math.abs(d2 - d) < 1e-5) continue;
      W.addScaledVector(n, d2 - d); L.copy(W).applyMatrix4(inv); const ox = p.getX(i), oy = p.getY(i), oz = p.getZ(i), e = S[i] || [0, 0, 0];
      S[i] = [+(e[0] + L.x - ox).toFixed(4), +(e[1] + L.y - oy).toFixed(4), +(e[2] + L.z - oz).toFixed(4)]; p.setXYZ(i, L.x, L.y, L.z); moved++; }
    p.needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere(); m.geometry.computeBoundingBox(); }
  if (moved) tip('Molded on — Sculpt › Undo all sculpt to un-squish', 1600); }
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
  {t: 'Welcome to Mythic Forge', p: 'Build monsters and mechs like a toy: snap parts on, drag them around, sculpt and paint. Pick something to start with:', start: true},
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
  if (s.start) { for (const [t, id] of [['🤖 Mech', 'heromech'], ['🦖 Kaiju', 'basaltkaiju'], ['🦕 Dino', 'sailback']]) add(t, () => { const st = STARTERS.find(x => x.id === id); if (st) { loadStarter(st); skelUI(); } tourI++; tourShow(); }, true);
    add('Keep what I have', () => { tourI++; tourShow(); }); add('Skip tour', tourEnd); }
  else { add('Skip', tourEnd); if (tourI > 0) add('Back', () => { tourI--; tourShow(); }); add(tourI === TOUR.length - 1 ? 'Done' : 'Next', () => { if (tourI === TOUR.length - 1) tourEnd(); else { tourI++; tourShow(); } }, true); }
  requestAnimationFrame(() => { const t = s.sel && document.querySelector(s.sel); if (t) { t.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = t.getBoundingClientRect(), pad = 6;
      Object.assign(hole.style, {display: 'block', left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: Math.min(r.height, innerHeight * .5) + pad * 2 + 'px'});
      const below = r.top < innerHeight * .45; Object.assign(card.style, below ? {top: Math.min(innerHeight - 220, r.top + Math.min(r.height, innerHeight * .5) + 16) + 'px', bottom: 'auto'} : {bottom: Math.max(12, innerHeight - r.top + 16) + 'px', top: 'auto'}); }
    else { hole.style.display = 'none'; Object.assign(card.style, {top: '30%', bottom: 'auto'}); } }); }
function tourEnd() { $('tour').style.display = 'none'; try { localStorage.setItem(window.MF_V2 ? 'mf-tour2-done' : 'mf-tour-done', '1'); } catch (e) {} }
function tourStart() { $('menu').classList.remove('open'); tourI = 0; tourShow(); }
$('mTour').onclick = tourStart;
try { if (!localStorage.getItem(window.MF_V2 ? 'mf-tour2-done' : 'mf-tour-done')) setTimeout(tourStart, 700); } catch (e) {}
// ====================================================================== loop
function resize() { renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight;
  const sh = $('sheet'), land = innerWidth >= 760 && innerWidth > innerHeight, full = document.body.classList.contains('full');
  const cover = full ? 0 : land ? 0 : sh.getBoundingClientRect().height, side = full || !land ? 0 : sh.getBoundingClientRect().width;
  camera.setViewOffset(innerWidth, innerHeight, side / 2, cover / 2 - 25, innerWidth, innerHeight); camera.updateProjectionMatrix(); }
new ResizeObserver(() => resize()).observe($('sheet'));
addEventListener('resize', resize); resize();
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => { const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime; controls.update(); animate(dt); fxTick(dt, t); fadeTick(dt); dripTick(dt);
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
  tip(Object.keys(LIB).length + (window.MF_V2 ? ' parts ready — press and hold one, then drag it onto the model' : ' parts ready. Pick one and tap a bone dot.'), 3500);
  window.FORGE = {P: () => P, LIB, addPart, bones: () => bones, views: () => views, select, rebuildParts};   // for testing
})();

// fit / base body buttons
$('bBase').onclick = () => { if (hasBase()) { snap(); removeParts(P.parts.filter(p => p.lib.startsWith('base_'))); rebuildParts(); outliner(); saveCur(); return tip('Base body removed (your own parts stay)'); }
  buildBase(); rebuildParts(); tip('Base body built — tap any piece, then pick a part to swap it in', 3500); };
$('bRefitAll').onclick = () => { snap(); const n = refitAll(true); rebuildParts(); saveCur(); tip(n + ' parts fitted to the body'); };
$('bRefit').onclick = () => { const pt = partBy(sel); if (!pt) return tip('Tap a part first'); snap(); if (!pt.fit) { const f = fitPart(pt.lib, pt.bone); if (!f) return tip("This part doesn't have a body slot — move it by hand"); pt.fit = f.fit; }
  refitPart(pt, true); attachGizmo(); syncEdit(); saveCur(); tip('Fitted to the body'); };
bodyUI();
if (!P.parts.length && P.skel !== 'none') { buildBase(); rebuildParts(); setTimeout(frameAll, 50); }   // every skeleton starts with a base body to build on
window.__ls = loadStarter; window.__fa = () => frameAll(); window.__nb = () => { showBones = false; boneHelpers.forEach(h => h.visible = false); }; window.__cam = (x, y, z, tx, ty, tz) => { camera.position.set(x, y, z); controls.target.set(tx, ty, tz); }; window.__sel = u => select(u); window.__P = () => P; window.__add = (l, b, s) => addPart(l, b, [0, 0, 0], [0, 0, 0], s); window.__rb = () => rebuildParts(); window.__lp = {tap: (fi) => { lpSel.add(fi); lpDraw(); }, mode: () => $("bLP").click()};   // test hooks (headless checks)

// ====================================================================== v2 UI (test page test.html, window.MF_V2): 4 main tabs, drag parts from the grid, drag by default,
// free placement (stays where you drop it, even in the air), Workshop up front, copy / paste parts between creatures and the Workshop.
function overBoxZone(e) { const z = $('boxZone'); if (!z || !e || z.style.display === 'none') return false; const r = z.getBoundingClientRect(); return r.width > 0 && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
function nearestBone(wp) { let best = null, bd = 1e9; const q = new THREE.Vector3(); for (const [n, b] of Object.entries(bones)) { b.getWorldPosition(q); const d = q.distanceTo(wp); if (d < bd) { bd = d; best = n; } } return best; }
function toBoneSpace(obj, boneName) { const B = (boneName && bones[boneName]) || skelRoot; obj.updateMatrixWorld(true); B.updateMatrixWorld(true);
  const m = obj.matrixWorld.clone().premultiply(B.matrixWorld.clone().invert()), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(p, q, s); const eu = new THREE.Euler().setFromQuaternion(q);
  return {p: p.toArray().map(x => +x.toFixed(3)), r: [eu.x, eu.y, eu.z].map(x => +(x / D).toFixed(1))}; }
// a part dragged off the model stays floating where you let go; it hangs on the closest bone so it still moves with the body
function floatPart(pt, v) { const wp = new THREE.Vector3(); v.G.getWorldPosition(wp); const bn = nearestBone(wp), t = toBoneSpace(v.G, bn);
  pt.bone = bn; pt.p = t.p; pt.r = t.r; buildPart(pt); const tw = pt.twin && partBy(pt.twin); if (tw) { tw.bone = (bn && twinName(bn)) || bn; mirrorInto(pt, tw); }
  tip('Floating here' + (bn ? ' — it moves with the ' + niceBone(bn) : ''), 1800); }
if (window.MF_V2) {
  // ---- main tabs: Start / Build / Paint / Sculpt / ⚙ ; each holds one or two of the old panes
  const GROUPS = {start: ['start'], build: ['add', 'edit'], paint: ['paint'], sculpt: ['sculpt', 'shape'], more: ['skel', 'fx']};
  const lastSub = {start: 'start', build: 'add', paint: 'paint', sculpt: 'sculpt', more: 'skel'};
  const topOf = t => Object.keys(GROUPS).find(g => GROUPS[g].includes(t)) || 'build';
  function syncTops() { const g = topOf(tab); lastSub[g] = tab; let n = 0;
    document.querySelectorAll('#tops button').forEach(b => b.classList.toggle('on', b.dataset.top === g));
    document.querySelectorAll('#subtabs button').forEach(b => { const show = GROUPS[g].includes(b.dataset.tab); b.style.display = show ? '' : 'none'; if (show) n++; });
    $('subtabs').style.display = n > 1 ? '' : 'none'; }
  document.querySelectorAll('#subtabs button').forEach(b => { const f = b.onclick; b.onclick = ev => { f(ev); syncTops(); }; });
  document.querySelectorAll('#tops button').forEach(b => b.onclick = () => tabBtn(lastSub[b.dataset.top]).click());
  $('bGoBuild').onclick = () => tabBtn('add').click();
  syncTops();

  // ---- drag is the default way to move things; arrows are for fine-tuning
  const dragUI = () => { $('bDragMode').classList.toggle('on', sticky); $('bArrowMode').classList.toggle('on', !sticky); $('gzRow').style.display = sticky ? 'none' : '';
    $('editHow').innerHTML = sticky ? '👉 <b>Tap</b> a part to pick it, then <b>drag</b> it. Let go on the body = it sticks there. Let go in the air = it floats there.' : '👉 Tap a part, then drag the arrows (Move), rings (Turn) or boxes (Stretch).'; };
  const setDrag = on => { sticky = on; $('bSticky').classList.toggle('on', on); attachGizmo(); dragUI(); };
  $('bDragMode').onclick = () => setDrag(true); $('bArrowMode').onclick = () => setDrag(false); $('bSticky').onclick = () => setDrag(!sticky);
  setDrag(true);
  // hide any arrow / ring direction you don't want (red = left-right, green = up-down, blue = front-back); remembered
  let AX = {X: true, Y: true, Z: true}; try { AX = {...AX, ...JSON.parse(localStorage.getItem('mf-axes') || '{}')}; } catch (x) {}
  const axUI = () => { for (const k of 'XYZ') { gizmo['show' + k] = AX[k]; $('ax' + k).classList.toggle('on', AX[k]); } $('axRow').style.display = sticky ? 'none' : ''; };
  for (const k of 'XYZ') $('ax' + k).onclick = () => { AX[k] = !AX[k]; if (!AX.X && !AX.Y && !AX.Z) { AX[k] = true; return tip('Keep at least one direction — or use ✋ Drag for no arrows', 2200); } try { localStorage.setItem('mf-axes', JSON.stringify(AX)); } catch (x) {} axUI(); };
  const dragUI0 = dragUI; $('bDragMode').addEventListener('click', axUI); $('bArrowMode').addEventListener('click', axUI); axUI();
  // parts-box drop zone shows while dragging a part
  addEventListener('pointermove', () => { if (drag && drag.moved) $('boxZone').style.display = 'block'; }, true);
  addEventListener('pointerup', () => setTimeout(() => $('boxZone').style.display = 'none', 0), true);
  addEventListener('pointercancel', () => $('boxZone').style.display = 'none', true);

  // ---- drag a part from the grid onto the model (press and hold, or slide sideways out of the grid)
  const ghost = $('ghost'); let gd = null, eatClick = false;
  const screenOf = o => { const v = new THREE.Vector3(); o.getWorldPosition(v); v.project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight, v.z]; };
  function nearestBoneOnScreen(x, y, max) { let best = null, bd = max; for (const [n, b] of Object.entries(bones)) { const [sx, sy, sz] = screenOf(b); if (sz > 1) continue; const d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = n; } } return best; }
  function airPoint(x, y) { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); const pl = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()).negate(), controls.target), out = new THREE.Vector3();
    return ray.ray.intersectPlane(pl, out) ? out : controls.target.clone(); }
  function dropLib(id, x, y) { const e = LIB[id]; if (!e) return; const sr = $('sheet').getBoundingClientRect(); if (y > sr.top && x > sr.left) return tip('Let go over the model to add it', 1800);
    const hitB = cast(x, y, boneHelpers.filter(h => h.visible)), hitP = cast(x, y, visibleMeshes()), noBones = !Object.keys(bones).length;
    if (modeBone && !noBones) { const h = hitB && (!hitP || isAlong(e) || hitB.distance < hitP.distance) ? hitB : hitP; if (h) { placing = id; return placeAt(h); }
      const nb = nearestBoneOnScreen(x, y, 110); if (!nb) return tip('Let go on the model or near an orange dot', 2200); if (!addWeaponToPalm(id, nb)) addPart(id, nb, [0, 0, 0], [0, 0, 0]); return; }
    if (hitP || hitB) { placing = id; return placeAt(hitP || hitB); }
    // free + let go in the air: it stays right there
    const wp = airPoint(x, y), bn = nearestBone(wp), B = (bn && bones[bn]) || skelRoot; B.updateMatrixWorld(true); const lp = wp.clone().applyMatrix4(B.matrixWorld.clone().invert());
    const m = mirrorAdd; mirrorAdd = mirrorAdd && !noBones; addPart(id, bn, lp.toArray().map(v => +v.toFixed(3)), [0, 0, 0], e.whole ? 1 : kindOf(e) ? decorScale(bn) : 1); mirrorAdd = m; }
  const endGD = () => { if (gd && gd.timer) clearTimeout(gd.timer); gd = null; window.__gdOn = false; ghost.style.display = 'none'; document.body.classList.remove('gdrag'); };
  const startGD = () => { if (!gd || gd.on) return; gd.on = true; window.__gdOn = true; if (navigator.vibrate) try { navigator.vibrate(15); } catch (x) {}
    ghost.src = gd.src || ''; ghost.style.display = 'block'; ghost.style.left = gd.x + 'px'; ghost.style.top = gd.y + 'px'; document.body.classList.add('gdrag'); tip('Drag it onto the model and let go', 2500); };
  $('lib').addEventListener('pointerdown', e => { const b = e.target.closest('.item'), img = b && b.querySelector('img'); if (!img || !img.dataset.id || e.target.closest('.del,.fav')) return;
    gd = {id: img.dataset.id, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, src: img.src, pid: e.pointerId, on: false};
    gd.timer = setTimeout(startGD, e.pointerType === 'mouse' ? 99999 : 260); });
  addEventListener('pointermove', e => { if (!gd || e.pointerId !== gd.pid) return; gd.x = e.clientX; gd.y = e.clientY; const dx = Math.abs(e.clientX - gd.x0), dy = Math.abs(e.clientY - gd.y0);
    if (!gd.on) { if (dx > 14 && dx > dy * 1.3 || (e.pointerType === 'mouse' && dx + dy > 8)) startGD(); else if (dy > 10) endGD(); return; }
    ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; e.preventDefault(); }, {capture: true, passive: false});
  $('lib').addEventListener('touchmove', e => { if (gd && gd.on) e.preventDefault(); }, {passive: false});
  addEventListener('pointerup', e => { if (!gd || e.pointerId !== gd.pid) return; const g = gd; endGD(); if (!g.on) return; eatClick = true; setTimeout(() => eatClick = false, 400);
    placing = null; libUI(); dropLib(g.id, e.clientX, e.clientY); }, true);
  addEventListener('pointercancel', e => { if (gd && e.pointerId === gd.pid) endGD(); }, true);
  $('lib').addEventListener('click', e => { if (eatClick) { e.stopPropagation(); e.preventDefault(); } }, true);
  // own parts get a 🗑 on the grid item (long press is now drag)
  new MutationObserver(() => { document.querySelectorAll('#lib .item').forEach(b => { const img = b.querySelector('img'), id = img && img.dataset.id; if (!id || !LIB[id] || !LIB[id].mine || b.querySelector('.del')) return;
    const d = Object.assign(document.createElement('span'), {className: 'del', textContent: '🗑'}); d.style.cssText = 'position:absolute;top:2px;left:4px;font-size:15px';
    d.onclick = async ev => { ev.stopPropagation(); if (!confirm('Delete your part "' + LIB[id].name + '"?')) return; await idb('myparts', 'readwrite', st => st.delete(id)); delete LIB[id]; libUI(); }; b.append(d); }); }).observe($('lib'), {childList: true});

  // ---- copy / paste parts (works between creatures, saves and the Workshop)
  const CLIP = 'mf-clip';
  $('bCopy').onclick = () => { const pt = partBy(sel); if (!pt) return tip('Tap a part first'); try { localStorage.setItem(CLIP, JSON.stringify([pt])); } catch (x) { return tip('Too big to copy'); } tip('Copied ' + (LIB[pt.lib] ? LIB[pt.lib].name : 'part') + ' — 📋 Paste it anywhere, even in another creature', 2600); pasteUI(); };
  $('bCopyAll').onclick = () => { const list = P.parts.filter(p => !p.hidden && !p.boxed && !p.lib.startsWith('base_')); if (!list.length) return tip('Nothing to copy (base body pieces are skipped)');
    try { localStorage.setItem(CLIP, JSON.stringify(list)); } catch (x) { return tip('Too big to copy — use 💾 Save part in the Workshop'); } tip('Copied ' + list.length + ' parts', 2000); pasteUI(); };
  $('bPaste').onclick = () => { let list; try { list = JSON.parse(localStorage.getItem(CLIP) || 'null'); } catch (x) {} if (!list || !list.length) return tip('Copy a part first');
    snap(); const names = new Set(Object.keys(bones)), fb = (selBone && bones[selBone] && selBone) || ((P.bones.find(b => b[4] === 'chest') || P.bones[0] || [null])[0]), map = {};
    list.forEach(o => map[o.uid] = uid()); let last = null;
    for (const o of list) { const n = JSON.parse(JSON.stringify(o)); n.uid = map[o.uid]; n.twin = o.twin && map[o.twin] ? map[o.twin] : null; n.boxed = false; n.hidden = false; n.fit = null;
      if (!n.bone || !names.has(n.bone)) { n.bone = names.size ? fb : null; } if (list.length === 1) n.p = [n.p[0] + .4, n.p[1], n.p[2]]; P.parts.push(n); buildPart(n); last = n; }
    if (last) select(last.uid); outliner(); saveCur(); tip('Pasted ' + list.length + ' part' + (list.length > 1 ? 's' : '') + ' — drag to place', 2200); };
  const pasteUI = () => { let n = 0; try { n = (JSON.parse(localStorage.getItem(CLIP) || '[]') || []).length; } catch (x) {} $('bPaste').textContent = '📋 Paste' + (n ? ' (' + n + ')' : ''); }; pasteUI();

  // ---- Workshop up front: build a part on its own (no skeleton), save it to My Parts, then drag it onto any creature
  const goWS = () => $('mWork').click(); $('bWS1').onclick = goWS; $('bWS2').onclick = goWS;


  // ---- 🎓 Build together: a step-by-step build for ANY body type. Each step asks a multiple-choice question, then shows parts to pick;
  // tapping one = "do it for me" (placed on every matching bone, e.g. all 8 tentacles), or "I'll do it myself" opens the parts grid.
  const BT = {on: false, i: 0, steps: [], style: 'creature', pick: null, added: [], small: false, t: null};
  const famBones = fam => P.bones.filter(r => (fam === 'trunk' ? TRUNK_TAGS.has(r[4]) || FAMILY[r[4]] === 'trunk' : FAMILY[r[4]] === fam)).map(r => r[0]);
  const famRoots = fam => { const set = new Set(famBones(fam)); return [...set].filter(n => !set.has((boneRow(n) || [])[1])); };
  const hasFam = fam => famBones(fam).length > 0;
  const mineNow = () => P.parts.filter(p => !p.lib.startsWith('base_') && !p.boxed);
  const openCat = (g, sub) => { tabBtn('add').click(); gFilter = g; sFilter = sub || null; query = ''; tagFilter = null; $('search').value = ''; catsOpen = false; libUI(); };
  const C = (g, subs) => ({g, subs});   // a parts source: group + (optional) only these subs
  const PARTSTEPS = [   // [family, title, question, creature sources, mech sources, optional, how to place]
    ['trunk', 'Body', 'What kind of body?', [C('Torsos & Bellies')], [C('Mech Torso & Core', ['Chests', 'Frames'])], false, 'trunk'],
    ['neck', 'Neck', 'What kind of neck?', [C('Necks & Spines', ['Necks'])], [C('Necks & Spines', ['Necks'])], true],
    ['head', 'Head', 'What kind of head?', [C('Heads & Skulls')], [C('Mech Heads')], false],
    ['jaw', 'Jaw', 'Jaw or mouth?', [C('Jaws & Teeth', ['Lower Jaws', 'Maws & Mandibles', 'Beaks'])], [], true],
    ['head', 'Face', 'Eyes or a face?', [C('Eyes & Faces')], [C('Mech Eyes & Faces')], true, 'decor'],
    ['head', 'Horns', 'Horns, crest or a mask?', [C('Horns & Crests')], [C('Mech Eyes & Faces', ['Crests & Fins'])], true, 'decor'],
    ['arm', 'Arms', 'What kind of arms?', [C('Arms & Shoulders', ['Humanoid', 'Beast', 'Bug & Crab', 'Treefolk', 'Spirit'])], [C('Mech Arms & Legs', ['Arms'])], false],
    ['hand', 'Hands', 'Hands, claws or pincers?', [C('Hands & Claws')], [C('Mech Arms & Legs', ['Hands'])], true],
    ['leg', 'Legs', 'What kind of legs?', [C('Legs & Feet')], [C('Mech Arms & Legs', ['Legs'])], false],
    ['foot', 'Feet', 'What kind of feet?', [C('Legs & Feet')], [C('Mech Arms & Legs', ['Feet'])], true],
    ['wing', 'Wings', 'What kind of wings?', [C('Wings')], [C('Wings', ['Mech'])], false],
    ['tail', 'Tail / tentacles', 'Tail or tentacles?', [C('Tails'), C('Tentacles & Extra Limbs')], [C('Tails')], false],
    ['extra', 'Extra limbs', 'What goes on the extra limbs?', [C('Tentacles & Extra Limbs'), C('Tails'), C('Wings')], [C('Tentacles & Extra Limbs')], true],
    ['trunk', 'Armor + extras', 'Add some extras?', [C('Back & Armor Plates'), C('Accessories & Magic'), C('Cloth & Capes')], [C('Mech Arms & Legs', ['Shoulders']), C('Mech Details'), C('Cloth & Capes')], true, 'decor'],
    ['hand', 'Weapon', 'Give it a weapon?', [C('Weapons')], [C('Weapons')], true, 'weapon']];
  const SHAPES = [['Normal', {}], ['Tall + slim', {height: 1.25, bulk: .8, legs: 1.15}], ['Big + bulky', {bulk: 1.45, height: 1.05, head: .9}], ['Short + stocky', {height: .8, bulk: 1.3, legs: .75}],
    ['Long neck + tail', {neck: 1.8, tail: 1.6}], ['Long arms', {arms: 1.45}], ['Big head', {head: 1.4}]];
  const SKINCATS = ['Skins & Scales', 'Lizards', 'Fur', 'Fish & Sea', 'Insects', 'Metal', 'Mech Paint', 'Alien Armor', 'Gems & Stone', 'Glow & Crystal', 'Neon', 'Fire', 'Cosmic & Special', 'Toys: plastic', 'Candy', 'Bark (Lynocs, CC0)'];
  const srcOf = st => BT.style === 'mech' ? (st.mech.length ? st.mech : st.cre) : BT.style === 'mix' ? [...st.mech, ...st.cre] : st.cre;
  const choicesOf = st => { const out = []; for (const c of srcOf(st)) { const subs = [...new Set(Object.values(LIB).filter(e => e.group === c.g && !e.lpv && (!c.subs || c.subs.includes(e.sub))).map(e => e.sub))];
    subs.forEach(sb => out.push({g: c.g, sub: sb, label: sb})); } return out; };
  const partsOf = ch => Object.keys(LIB).filter(id => { const e = LIB[id]; return e.group === ch.g && e.sub === ch.sub && (lpParts ? !e.hasLpv : !e.lpv); });
  function btPlace(st, id) { if (BT.added.length) { removeParts(BT.added.map(partBy).filter(Boolean)); BT.added = []; }
    snap(); const before = new Set(P.parts.map(p => p.uid)), e = LIB[id], m = mirrorAdd, keepMode = modeBone; modeBone = true;
    if (st.how === 'weapon') { const hands = famBones('hand'), h = hands.find(n => n.endsWith('.R')) || hands[0]; if (!h || !addWeaponToPalm(id, h)) addPart(id, (P.bones.find(r => r[4] === 'chest') || P.bones[0])[0], [0, 0, 0], [0, 0, 0]); }
    else if (st.how === 'trunk' || st.how === 'decor') { const tb = st.fam === 'trunk' ? (P.bones.find(r => r[4] === 'chest') || P.bones.find(r => TRUNK_TAGS.has(r[4])) || P.bones[0])[0] : famRoots(st.fam)[0]; mirrorAdd = false; addPart(id, tb, [0, 0, 0], [0, 0, 0]); }
    else { const roots = famRoots(st.fam); mirrorAdd = false; roots.forEach(r => addPart(id, r, [0, 0, 0], [0, 0, 0])); }
    mirrorAdd = m; modeBone = keepMode; BT.added = P.parts.filter(p => !before.has(p.uid)).map(p => p.uid); rebuildParts(); outliner(); saveCur();
    tip(e.name + ' on ✓' + (st.how === 'decor' ? ' — drag it where you want it' : ''), 2200); btShow(); }
  function btSteps() { const steps = [];
    steps.push({k: 'style'}); steps.push({k: 'body'}); steps.push({k: 'shape'});
    for (const [fam, t, q, cre, mech, opt, how] of PARTSTEPS) { if (!hasFam(fam)) continue; const st = {k: 'part', fam, t, q, cre, mech, opt, how};
      if (choicesOf(st).length) steps.push(st); }
    steps.push({k: 'move'}, {k: 'paint'}, {k: 'clean'}, {k: 'look'}, {k: 'save'}); BT.steps = steps; }
  function btShow() { const el = $('guide'); if (!BT.on) return; const st = BT.steps[BT.i], N = BT.steps.length; document.body.classList.add('guiding'); el.style.display = 'block'; el.classList.toggle('small', BT.small);
    el.innerHTML = ''; const h = (tag, cls, html) => { const x = document.createElement(tag); if (cls) x.className = cls; if (html != null) x.innerHTML = html; el.append(x); return x; };
    const head = h('div', 'gh'); const titles = {style: 'What are we building?', body: 'Pick a body', shape: 'Body shape', move: 'Move things around', paint: 'Paint it', clean: 'Clean up', look: 'Game look', save: 'Save it'};
    head.innerHTML = `<b>🎓 ${BT.i + 1}/${N} · ${st.k === 'part' ? st.t : titles[st.k]}</b>`; const mini = Object.assign(document.createElement('button'), {className: 'mini', textContent: BT.small ? '▾' : '▴', onclick: () => { BT.small = !BT.small; btShow(); }}); head.append(mini);
    if (BT.small) return;
    const q = t => h('div', 'gp', t), row = cls => h('div', cls || 'gc'), btn = (r, t, f, on) => { const b = Object.assign(document.createElement('button'), {textContent: t, onclick: f}); if (on) b.className = 'on'; r.append(b); return b; };
    const nav = (nextLabel, extra) => { const r = row('gb'); btn(r, '✕', btEnd); if (BT.i) btn(r, '◀', () => btGo(BT.i - 1)); if (extra) extra(r); btn(r, nextLabel || 'Next ▶', () => BT.i === N - 1 ? btEnd(true) : btGo(BT.i + 1), true); };
    if (st.k === 'style') { q('A mech, a creature, or a mix of both? (You can always use any part later.)'); const r = row();
      for (const [k, t] of [['mech', '🤖 Mech'], ['creature', '🐲 Creature'], ['mix', '🔀 Mix of both']]) btn(r, t, () => { BT.style = k; btGo(1); }, BT.style === k); nav(); return; }
    if (st.k === 'body') { q('Which body (skeleton)? Every body comes with a grey mannequin to build on. Tap one:'); const r = row('gc scroll');
      btn(r, '✓ Keep the one I have', () => { btSteps(); btGo(2); }, true);
      for (const [k, sk] of Object.entries(SKEL)) { if (k === 'none') continue; btn(r, sk.name, () => { if (mineNow().length && !confirm('Start fresh on a ' + sk.name + '? Parts you added will be cleared (save first if you want them).')) return;
        snap(); P = blankProject(k); rebuildSkeleton(); buildBase(); rebuildParts(); outliner(); applyFX(); bodyUI(); saveCur(); frameAll(); btSteps(); btGo(2); }, P.skel === k); } nav(); return; }
    if (st.k === 'shape') { q('What shape should it be? (Fine-tune any time with the sliders in 🏁 Start.)'); const r = row();
      for (const [t, v] of SHAPES) btn(r, t, () => { snap(); P.body = {...v}; applyBody(); bodyUI(); }, JSON.stringify(P.body || {}) === JSON.stringify(v));
      btn(r, '🎚 Sliders', () => tabBtn('start').click()); nav(); return; }
    if (st.k === 'part') { const chs = choicesOf(st), roots = st.how ? [] : famRoots(st.fam);
      q(st.q + (roots.length > 1 ? ` <span class="go">(goes on all ${roots.length})</span>` : '') + (st.opt ? ' <span class="go">optional</span>' : '')); const r = row();
      if (!BT.pick || !chs.some(c => c.g === BT.pick.g && c.sub === BT.pick.sub)) BT.pick = chs[0];
      chs.forEach(c => btn(r, c.label, () => { BT.pick = c; btShow(); }, BT.pick === c || (BT.pick.g === c.g && BT.pick.sub === c.sub)));
      const ids = partsOf(BT.pick), grid = row('gg');
      ids.slice(0, 12).forEach(id => { const b = document.createElement('button'), im = document.createElement('img'); im.src = thumb(id); b.append(im, Object.assign(document.createElement('span'), {textContent: LIB[id].name}));
        if (BT.added.some(u => (partBy(u) || {}).lib === id)) b.className = 'on'; b.onclick = () => btPlace(st, id); grid.append(b); });
      const tools = row(); btn(tools, '🎲 Surprise me', () => btPlace(st, ids[Math.random() * ids.length | 0]));
      btn(tools, '✋ I\'ll drag one on myself', () => { openCat(BT.pick.g, BT.pick.sub); BT.small = true; btShow(); });
      nav(BT.added.length ? 'Next ▶' : 'Skip ▶'); return; }
    if (st.k === 'move') { q('Anything look off? Tap a part (orange outline), then drag it. Let go on the body = sticks. Let go in the air = floats. Size slider and 🎯 Arrows are in ✋ Move & size.');
      const r = row(); btn(r, '✋ Open Move & size', () => { tabBtn('edit').click(); BT.small = true; btShow(); }); nav(); return; }
    if (st.k === 'paint') { q('What should it be made of? Tap a kind, then a skin — it goes on every part. (Paint single parts later in 🎨 Paint.)'); const r = row('gc scroll');
      BT.skin = BT.skin || SKINCATS[0]; SKINCATS.forEach(c => btn(r, c, () => { BT.skin = c; btShow(); }, BT.skin === c));
      const g = row('gc scroll'); MATS.LIST.filter(l => l[2] === BT.skin).forEach(l => { const b = btn(g, l[1], () => { snap(); P.parts.forEach(p => { p.matAll = l[0]; p.mat = null; }); rebuildParts(); saveCur(); tip(l[1] + ' on everything', 1800); });
        const c = '#' + (l[4] | 0).toString(16).padStart(6, '0'); b.style.borderLeft = '14px solid ' + c; });
      nav(); return; }
    if (st.k === 'clean') { q(hasBase() ? 'Some grey mannequin pieces still show where you didn\'t put a part. Remove them?' : 'No mannequin pieces left — looking clean!'); const r = row();
      if (hasBase()) { btn(r, '🧱 Remove them', () => { $('bBase').click(); btShow(); }, true); btn(r, 'Keep them', () => btGo(BT.i + 1)); } nav(); return; }
    if (st.k === 'look') { q('Titan Clash is low-poly with toon shading and outlines. See it that way?'); const r = row();
      btn(r, '🎮 Yes, game look', () => { if (!(P.fx.lowpoly && P.fx.toon)) $('bGameLook').click(); }, !!(P.fx.lowpoly && P.fx.toon)); btn(r, 'Not now', () => btGo(BT.i + 1)); nav(); return; }
    if (st.k === 'save') { q('You built a titan! 🎉 Save it so you can come back to it.'); const r = row(); btn(r, '💾 Save as…', () => $('mSave').click(), true); btn(r, '⬇ Download for the game (.glb)', () => $('mExport').click()); nav('🎉 Done'); return; } }
  function btGo(i) { BT.i = Math.max(0, Math.min(BT.steps.length - 1, i)); BT.added = []; BT.pick = null; BT.small = false; const st = BT.steps[BT.i];
    if (st.k === 'part' || st.k === 'style' || st.k === 'body' || st.k === 'shape') { $('sheet').classList.add('min'); } btShow(); }
  function btStart() { $('menu').classList.remove('open'); BT.on = true; btSteps(); BT.style = P.skel === 'mech' || P.skel === 'walker' || P.skel === 'tank' ? 'mech' : 'creature'; btGo(0); }
  function btEnd(won) { BT.on = false; $('guide').style.display = 'none'; document.body.classList.remove('guiding'); $('sheet').classList.remove('min'); if (won === true) tip('🎉 Titan built! Start › 🎓 Build together to make another', 4000); }
  $('bGuide').onclick = btStart; $('mGuide').onclick = btStart;
  // ---- first-time tour for the new layout
  TOUR.length = 0; TOUR.push(
    {t: 'Welcome to Mythic Forge', p: 'Build monsters and mechs like a toy: drag parts on, move them around, sculpt and paint. Pick something to start with:', start: true},
    {sel: '#tops [data-top="start"]', pre: () => tabBtn('start').click(), t: '🏁 Start', p: 'Starters to remix, empty body types, and body shape sliders. 🎓 Build a titan step by step walks you from a bare skeleton to a finished mech or kaiju.'},
    {sel: '#lib', pre: () => tabBtn('add').click(), t: '🧩 Build › Add parts', p: 'Press and hold a part, then drag it onto your model. (Or tap it, then tap the model. Double-tap = add it fast.)'},
    {sel: '#placeSeg', pre: () => tabBtn('add').click(), t: 'Snap or Free', p: '🦴 Snap lines parts up with the bones and sizes them to fit. ✋ Free puts it exactly where you let go — even floating in the air.'},
    {sel: '#bWS1', pre: () => tabBtn('add').click(), t: '🛠 Workshop', p: 'Build a part on its own, no skeleton: stack shapes, sculpt, paint, then 💾 Save part. It shows up in My Parts to drag onto any creature.'},
    {sel: '[data-tab="edit"]', pre: () => tabBtn('edit').click(), t: '✋ Move & size', p: 'Tap a part to pick it, then drag it. Drop it on the body and it sticks; drop it in the air and it floats. 🎯 Arrows are there for fine-tuning.'},
    {sel: '#copyRow', pre: () => tabBtn('edit').click(), t: '📄 Copy / 📋 Paste', p: 'Copy a part (or all of them) and paste it into another creature or the Workshop.'},
    {sel: '#vtools', t: '🔍 Focus', p: 'These stay on screen: 🔍 shows only the picked part, 🪟 keeps a zoomed window on it.'},
    {sel: '#tops', t: 'Paint, Sculpt, ⚙', p: '🎨 Paint = skins, brushes and effects. 🗿 Sculpt = push and pull like clay, plus shape sliders. ⚙ = skeleton, poses, view and look.'},
    {sel: '#bMenu', t: 'Save + help', p: '⋯ has Save as, Download model, ❓ How to build, and this tour again. Have fun!'});
}
window.__dbg = () => ({LIB, SKEL, MATS, FAMILY});   // test hook
