/* =====================================================================================================
   SANDBOX 18: NEW VALOR MODEL, GUNPLA-KIT STYLE (Nov 8, 2026)
   MajorasPride loved the code-built VALOR test page ("perfect, marvelous"), so his body replaces the old
   box VALOR here. Built like a Gundam model kit: an inner frame (dark metal joints, bones, pistons)
   with white / blue / gold armor plates clipped on top, plus vents, bolts, sensors and fingers.
   - Uses the SAME joints as the old VALOR (torso, head, arms, elbows, hands, legs, knees), so every
     move, pose, ultimate and the new fluid motion still work. Only the joint spots moved to fit him.
   - Sword and kite shield are restyled too. The kite shield sits on a forearm mount, and the thrown
     shield (Cap throws, Shield Barrage) is the kite shield now.
   - Sandbox only. The game keeps the old VALOR until MajorasPride OKs moving this over.
   ===================================================================================================== */
const VK = { S: 3 };   // test-page units -> game units (test model is ~4.2 tall, game mechs ~13)
{
  const KM = () => ({
    white: std(0xe2e7ee, .32, .15), blue: std(0x1f45a8, .3, .35), navy: std(0x142a63, .35, .35),
    frame: std(0x2c3240, .5, .75), dark: std(0x0f131b, .8, .3), steel: std(0xd3dbe6, .2, .95), gold: std(0xd9ac3c, .28, 1),
  });
  // rounded, tapered armor block: top face scaled by tx/tz and pushed forward by sz (like the test page)
  function armor(w, h, d, tx = 1, tz = 1, r = .04, sz = 0) {
    const b = Math.max(.004, Math.min(r, w / 2.4, h / 2.4, d / 2.4)), x = w / 2 - b, y = h / 2 - b;
    const sh = new THREE.Shape(); sh.moveTo(-x, -y); sh.lineTo(x, -y); sh.lineTo(x, y); sh.lineTo(-x, y); sh.lineTo(-x, -y);
    const g = new THREE.ExtrudeGeometry(sh, {depth: Math.max(.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 1});
    g.translate(0, 0, -(d - 2 * b) / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + h / 2) / h; p.setX(i, p.getX(i) * (1 + (tx - 1) * t)); p.setZ(i, p.getZ(i) * (1 + (tz - 1) * t) + sz * t); }
    g.computeVertexNormals(); return g;
  }
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (a, b, h, s = 12) => new THREE.CylinderGeometry(a, b, h, s);
  // inner group in test-page units, scaled up to game size
  const inner = (parent, x = 0, y = 0, z = 0, s = VK.S) => { const g = grp(x, y, z, parent); g.scale.setScalar(s); return g; };
  let M, G;
  const part = (geo, mat, parent, pos = [0, 0, 0], rot = [0, 0, 0], big = false) => { const m = mesh(geo, mat, pos[0], pos[1], pos[2], parent, !big); m.rotation.set(...rot); return m; };
  const bolt = (p, pos, rot = [Math.PI / 2, 0, 0], r = .022) => part(cyl(r, r, .02, 6), M.steel, p, pos, rot);
  function vent(p, pos, w, h, n, rot = [0, 0, 0]) { const v = new THREE.Group(); v.position.set(...pos); v.rotation.set(...rot); p.add(v);
    part(box(w, h, .02), M.dark, v); for (let i = 0; i < n; i++) part(box(w * .9, h / n * .35, .03), M.frame, v, [0, -h / 2 + (i + .5) * h / n, .01]); return v; }
  function piston(p, a, b, r = .035) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
    const g = new THREE.Group(); g.position.copy(A.clone().add(B).multiplyScalar(.5)); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); p.add(g);
    part(cyl(r, r, len * .55), M.frame, g, [0, -len * .2, 0]); part(cyl(r * .6, r * .6, len * .55), M.steel, g, [0, len * .2, 0]); }

  function legKit(P, s) {           // s = game side (-1 = L, +1 = R)
    const L = s < 0 ? 'L' : 'R', leg = P['leg' + L], kn = P['kn' + L];
    leg.position.set(.32 * s * VK.S, 2.05 * VK.S, 0); kn.position.set(0, -.84 * VK.S, 0);
    const T = inner(leg), K = inner(kn);   // thigh (hip -> knee) and shin (knee -> foot)
    part(new THREE.SphereGeometry(.17, 14, 10), M.frame, T, [0, 0, 0], [0, 0, 0], true);
    part(armor(.32, .78, .36, 1.12, 1.08, .05), M.frame, T, [0, -.4, 0], [0, 0, 0], true);
    part(armor(.36, .62, .1, 1.08, 1, .04), M.white, T, [0, -.36, .2], [0, 0, 0], true);
    part(armor(.08, .55, .3, 1, 1.1, .03), M.white, T, [.19 * s, -.36, 0]);
    part(box(.04, .4, .02), M.blue, T, [.235 * s, -.36, 0]);
    piston(T, [0, -.55, -.15], [0, -.8, -.18]);
    // knee + shin (positions relative to the knee joint)
    part(cyl(.13, .13, .34, 14), M.frame, K, [0, 0, 0], [0, 0, Math.PI / 2]);
    part(cyl(.06, .06, .38, 8), M.steel, K, [0, 0, 0], [0, 0, Math.PI / 2]);
    const kg = part(armor(.34, .32, .16, 1.25, 1, .05, .05), M.blue, K, [0, -.02, .2], [-.2, 0, 0], true);
    part(box(.12, .05, .02), G, kg, [0, .02, .09]); bolt(kg, [-.11, -.08, .085]); bolt(kg, [.11, -.08, .085]);
    part(cyl(.09, .11, .9, 10), M.frame, K, [0, -.58, -.02]);
    piston(K, [0, -.05, -.2], [0, -.51, -.22]);
    part(armor(.5, 1.05, .5, .8, .85, .07), M.white, K, [0, -.61, 0], [0, 0, 0], true);
    part(armor(.3, .75, .07, .7, 1, .03), M.blue, K, [0, -.58, .265], [-.04, 0, 0]);
    vent(K, [0, -.31, .305], .16, .12, 3, [-.04, 0, 0]);
    part(box(.12, .03, .03), G, K, [0, -.84, .29]);
    part(armor(.1, .7, .42, 1, 1.2, .03), M.white, K, [.27 * s, -.56, -.02], [0, 0, .08 * s]);
    part(box(.02, .5, .06), M.gold, K, [.325 * s, -.56, .05], [0, 0, .08 * s]);
    part(cyl(.12, .12, .26, 12), M.frame, K, [0, -1.11, 0], [0, 0, Math.PI / 2]);
    const boot = new THREE.Group(); boot.position.set(0, -1.16, .1); K.add(boot);
    part(armor(.3, .14, .5, 1, 1, .03), M.frame, boot, [0, 0, .02]);
    part(armor(.48, .24, .78, .85, .78, .05, .04), M.navy, boot, [0, 0, 0], [0, 0, 0], true);
    part(box(.5, .06, .82), M.dark, boot, [0, -.12, 0]);
    part(armor(.44, .08, .26, .9, 1, .03), M.gold, boot, [0, .07, .32], [.35, 0, 0]);
    part(armor(.2, .2, .18, .6, 1, .03), M.white, boot, [0, .08, -.38], [-.3, 0, 0]);
  }

  function armKit(P, s) {
    const L = s < 0 ? 'L' : 'R', arm = P['arm' + L], el = P['el' + L], hand = P['hand' + L];
    // joint spots: shoulder on the chest, elbow and hand at this model's arm lengths
    arm.position.set(.68 * s * VK.S, (.1 / VK.S + .88) * VK.S, 0);
    el.position.set(.12 * s * VK.S, -.66 * VK.S, 0); hand.position.set(0, -.72 * VK.S, 0);
    const A = inner(arm), E = inner(el), H = inner(hand);
    part(new THREE.SphereGeometry(.16, 14, 10), M.frame, A);
    const pd = new THREE.Group(); pd.position.set(.12 * s, .12, 0); pd.rotation.z = -.25 * s; A.add(pd);
    part(armor(.5, .34, .56, 1.15, 1.1, .07), M.white, pd, [0, 0, 0], [0, 0, 0], true);
    part(armor(.44, .16, .5, 1.1, 1, .05), M.white, pd, [.04 * s, .22, 0]);
    part(armor(.52, .09, .58, 1, 1, .03), M.blue, pd, [0, -.2, 0]);
    part(box(.02, .06, .4), G, pd, [.26 * s, 0, 0]);
    bolt(pd, [.15 * s, .05, .28]); bolt(pd, [-.1 * s, .05, .28]);
    part(armor(.2, .5, .22, 1.1, 1.1, .04), M.frame, A, [.12 * s, -.36, 0], [0, 0, 0], true);
    part(armor(.24, .32, .12, 1.1, 1, .03), M.white, A, [.14 * s, -.34, .08]);
    // forearm (relative to the elbow)
    part(cyl(.11, .11, .26, 12), M.frame, E, [0, 0, 0], [0, 0, Math.PI / 2]);
    part(armor(.18, .16, .14, 1.2, 1, .03), M.blue, E, [0, .02, -.12], [.4, 0, 0]);
    part(cyl(.07, .08, .55, 10), M.frame, E, [0, -.33, 0]);
    part(armor(.32, .56, .34, 1.25, 1.2, .06), M.white, E, [0, -.33, 0], [0, 0, 0], true);
    const fp = part(armor(.2, .32, .06, 1, 1, .02), M.blue, E, [-.06 * s, -.32, .18]);
    vent(fp, [0, -.04, .035], .12, .12, 3);
    part(box(.02, .36, .04), G, E, [.19 * s, -.34, 0]);
    part(cyl(.11, .11, .06, 12), M.steel, E, [0, -.63, 0]);
    if (s < 0) {   // shield mount on VALOR's shield arm (outer side)
      part(armor(.1, .36, .16, 1, 1, .02), M.frame, E, [-.2, -.36, 0]);
      for (const y of [-.12, .12]) part(armor(.06, .06, .24, 1, 1, .015), M.gold, E, [-.24, -.36 + y, 0]);
    }
    // hand: palm, curled fingers, thumb (relative to the wrist)
    part(armor(.17, .18, .16, 1, 1, .03), M.navy, H);
    for (let i = 0; i < 4; i++) { const f = new THREE.Group(); f.position.set(-.06 + i * .04, -.1, .03); f.rotation.x = .6; H.add(f);
      part(armor(.032, .09, .04, 1, 1, .012), M.frame, f, [0, -.04, 0]); part(armor(.03, .07, .038, 1, 1, .012), M.frame, f, [0, -.1, .03], [.9, 0, 0]); }
    part(armor(.05, .1, .05, 1, 1, .015), M.frame, H, [-.1 * s, -.04, .06], [.4, 0, .5 * s]);
    part(box(.12, .03, .02), M.gold, H, [0, .03, .085]);
  }

  function bodyKit(b, P) {
    // waist + skirt armor sit on the body (hips)
    const W = inner(b.body);
    part(armor(.78, .34, .5, 1.1, 1, .06), M.frame, W, [0, 2.1, 0], [0, 0, 0], true);
    const fs = part(armor(.44, .44, .08, 1.3, 1, .03, .06), M.blue, W, [0, 1.98, .28], [.12, 0, 0], true);
    part(new THREE.OctahedronGeometry(.07), M.gold, fs, [0, .08, .05]); part(box(.03, .22, .02), M.gold, fs, [0, -.08, .045]);
    for (const s of [-1, 1]) { const sk = part(armor(.1, .52, .44, 1, 1, .03), M.white, W, [.48 * s, 1.98, 0], [0, 0, -.12 * s], true);
      part(box(.02, .32, .04), G, sk, [.055 * s, -.02, 0]); bolt(sk, [.055 * s, .19, .14], [0, 0, Math.PI / 2]); bolt(sk, [.055 * s, .19, -.14], [0, 0, Math.PI / 2]); }
    part(armor(.5, .4, .08, 1.2, 1, .03, -.05), M.white, W, [0, 2.0, -.28], [-.15, 0, 0]);
    // torso: the game moves P.torso (breathing); this model's torso origin is 0.1 above it
    const T = inner(P.torso, 0, .1, 0);
    part(armor(.5, .32, .38, 1.2, 1.1, .05), M.frame, T, [0, .12, 0], [0, 0, 0], true);
    for (let i = 0; i < 3; i++) part(armor(.38 - i * .02, .08, .06, 1, 1, .02), M.white, T, [0, .03 + i * .1, .2]);
    const C = new THREE.Group(); C.position.y = .66; T.add(C);
    part(armor(.66, .6, .46, 1.3, 1.1, .05), M.frame, C, [0, .02, -.02]);
    part(armor(1.0, .72, .62, 1.4, 1.1, .08), M.blue, C, [0, 0, 0], [0, 0, 0], true);
    part(armor(1.05, .2, .52, 1.15, 1, .05), M.white, C, [0, .42, -.02], [0, 0, 0], true);
    for (const s of [-1, 1]) {
      const pec = part(armor(.48, .36, .09, 1.4, 1, .04), M.white, C, [.33 * s, .06, .33], [.1, -.2 * s, 0]); bolt(pec, [.18 * s, -.12, .05]);
      vent(C, [.36 * s, -.24, .335], .22, .14, 4, [.05, -.2 * s, 0]);
      part(box(.04, .12, .02), G, C, [.55 * s, .02, .24], [0, -.5 * s, 0]);
    }
    const core = part(cyl(.12, .12, .06, 6), G, C, [0, -.06, .37], [Math.PI / 2, 0, 0]); P.core = core;
    part(new THREE.TorusGeometry(.155, .035, 8, 6), M.gold, C, [0, -.06, .37]);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; bolt(C, [Math.cos(a) * .21, -.06 + Math.sin(a) * .21, .36], [Math.PI / 2, 0, 0], .015); }
    // backpack thrusters
    const pk = new THREE.Group(); pk.position.set(0, .05, -.42); C.add(pk);
    part(armor(.72, .62, .3, 1.1, 1, .06), M.navy, pk, [0, 0, 0], [0, 0, 0], true);
    vent(pk, [0, .05, -.155], .3, .3, 5, [0, Math.PI, 0]);
    for (const s of [-1, 1]) { const th = new THREE.Group(); th.position.set(.24 * s, -.22, -.14); pk.add(th);
      part(cyl(.12, .15, .5, 14), M.white, th); part(cyl(.16, .13, .06, 14), M.gold, th, [0, .2, 0]);
      part(new THREE.CylinderGeometry(.17, .2, .16, 14, 1, true), M.frame, th, [0, -.32, 0]); part(cyl(.13, .13, .02, 14), G, th, [0, -.3, 0]);
      const fin = part(armor(.08, .75, .32, .3, 1, .03), M.blue, pk, [.4 * s, .38, -.05], [.3, 0, -.35 * s]); part(box(.02, .5, .04), G, fin, [.04 * s, 0, .1]); }
    // head (its own joint so head turns still work)
    P.head.position.set(0, (.1 + .66 + .62) * VK.S, .02 * VK.S);
    const Hd = inner(P.head);
    part(cyl(.11, .14, .18, 10), M.frame, Hd, [0, -.08, 0]);
    for (let i = 0; i < 3; i++) part(new THREE.TorusGeometry(.12, .012, 6, 12), M.steel, Hd, [0, -.13 + i * .05, 0], [Math.PI / 2, 0, 0]);
    part(armor(.34, .34, .38, .85, .9, .06), M.white, Hd, [0, .14, 0], [0, 0, 0], true);
    part(armor(.16, .12, .3, .6, 1, .03, .02), M.blue, Hd, [0, .3, .02]);
    part(armor(.27, .13, .1, 1.2, 1, .03), M.navy, Hd, [0, .05, .18]);
    part(box(.26, .05, .03), G, Hd, [0, .15, .2]);
    part(armor(.07, .12, .12, .6, 1, .02), M.gold, Hd, [0, 0, .2]);
    for (const s of [-1, 1]) {
      part(armor(.04, .4, .05, .5, 1, .012), M.gold, Hd, [.11 * s, .42, .16], [0, 0, -.55 * s]);
      part(armor(.06, .2, .14, 1, .5, .02), M.white, Hd, [.16 * s, .08, .12]);
      const ear = new THREE.Group(); ear.position.set(.19 * s, .17, -.02); Hd.add(ear);
      part(cyl(.07, .07, .05, 12), M.frame, ear, [0, 0, 0], [0, 0, Math.PI / 2]); part(cyl(.035, .035, .06, 12), G, ear, [.01 * s, 0, 0], [0, 0, Math.PI / 2]);
      part(armor(.04, .24, .16, 1, .4, .015), M.blue, ear, [.03 * s, .05, -.06], [.2, 0, -.15 * s]);
    }
    part(cyl(.012, .012, .32, 6), M.steel, Hd, [-.13, .4, -.1], [-.3, 0, .25]);
    part(new THREE.OctahedronGeometry(.045), G, Hd, [0, .33, .18]);
  }

  // Swap VALOR's body: build the old one (keeps every joint, the vehicle, beam spots), then take its body meshes off
  const oldBuild = buildMech;
  buildMech = function (d) {
    const b = oldBuild(d);
    if (!d || d.id !== 'valor' || !VK.on) return b;
    const old = []; b.body.traverse(o => { if (o.isMesh) old.push(o); });
    for (const m of old) m.parent.remove(m);
    M = KM(); G = b.glowMats[0];
    bodyKit(b, b.P); for (const s of [-1, 1]) { legKit(b.P, s); armKit(b.P, s); }
    return b;
  };

  // Sword + kite shield in VALOR's hands (the game adds them after the body)
  function swordKit(parent) {   // blade points down -y like the old sword, ~9 long
    const g = inner(parent, 0, 0, 0, 3.8); g.rotation.z = Math.PI;
    part(cyl(.042, .042, .34, 10), M.dark, g);
    for (let i = 0; i < 4; i++) part(new THREE.TorusGeometry(.045, .01, 6, 12), M.gold, g, [0, -.12 + i * .08, 0], [Math.PI / 2, 0, 0]);
    const gd = new THREE.Group(); gd.position.y = .2; g.add(gd);
    part(armor(.16, .1, .12, 1, 1, .02), M.gold, gd);
    for (const s of [-1, 1]) part(armor(.24, .06, .08, .5, 1, .02), M.gold, gd, [.18 * s, .02, 0], [0, 0, .25 * s]);
    part(new THREE.OctahedronGeometry(.055), G, gd, [0, 0, .065]);
    part(new THREE.SphereGeometry(.06, 10, 8), M.gold, g, [0, -.21, 0]);
    const bs = new THREE.Shape(); bs.moveTo(-.09, 0); bs.lineTo(.09, 0); bs.lineTo(.085, 1.9); bs.lineTo(0, 2.18); bs.lineTo(-.085, 1.9); bs.closePath();
    const bg = new THREE.ExtrudeGeometry(bs, {depth: .026, bevelEnabled: true, bevelThickness: .02, bevelSize: .016, bevelSegments: 2}); bg.translate(0, 0, -.013);
    part(bg, M.steel, g, [0, .25, 0], [0, 0, 0], true);
    for (const z of [-.035, .035]) part(box(.028, 1.75, .012), G, g, [0, 1.15, z]);
    part(armor(.14, .18, .07, .6, 1, .02), M.blue, g, [0, .33, 0]);
    return g;
  }
  const kiteShape = () => { const k = new THREE.Shape(); k.moveTo(0, .75); k.quadraticCurveTo(.55, .72, .55, .3); k.quadraticCurveTo(.5, -.35, 0, -.85);
    k.quadraticCurveTo(-.5, -.35, -.55, .3); k.quadraticCurveTo(-.55, .72, 0, .75); return k; };
  const ext = (shape, depth, scale = 1, bev = .02) => { const g = new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 14}); g.center(); g.scale(scale, scale, 1); return g; };
  function kiteKit(parent, glow) {  // face points +z of the returned group
    const g = inner(parent), ks = kiteShape();
    part(ext(ks, .05, 1.06, .02), M.gold, g, [0, 0, -.02]);
    part(ext(ks, .07, 1, .03), M.blue, g, [0, 0, 0], [0, 0, 0], true);
    part(ext(ks, .02, .76, .01), M.white, g, [0, -.02, .06]);
    const w = new THREE.Shape(); w.moveTo(-.28, 0); w.bezierCurveTo(-.15, .22, 0, -.18, .12, .05); w.bezierCurveTo(.2, .2, .3, .12, .3, 0);
    w.lineTo(.3, -.09); w.bezierCurveTo(.22, .04, .12, -.06, .06, -.12); w.bezierCurveTo(-.05, -.25, -.18, .05, -.28, -.09); w.closePath();
    part(ext(w, .02, 1, 0), glow, g, [0, 0, .09]);
    part(armor(.05, 1.1, .03, 1, 1, .012), M.gold, g, [0, -.08, .08]);
    part(armor(.7, .05, .03, 1, 1, .012), M.gold, g, [0, .32, .08]);
    for (let i = 0; i < 10; i++) { const t = i / 10 * Math.PI * 2, c = Math.cos(t);
      bolt(g, [Math.sin(t) * .46 * (c < 0 ? 1 + c * .55 : 1), .05 + c * (c > 0 ? .55 : .75), .07], [Math.PI / 2, 0, 0], .02); }
    return g;
  }
  const hideKids = g => g.children.forEach(c => { if (c.isMesh) c.visible = false; });
  const oldDress = v8Dress;
  v8Dress = function (f) {
    oldDress(f); const P = f.P;
    if (!VK.on || f.def.id !== 'valor' || !P || !P.v8sword) return;
    M = M || KM(); G = f.glowMats ? f.glowMats[0] : glowM(0x7fd4ff, 2.4);
    hideKids(P.v8sword); const sw = swordKit(P.v8sword);
    if (P.v8swordBack) { hideKids(P.v8swordBack); P.v8swordBack.add(sw.clone(true)); }
    if (P.v8shield) { hideKids(P.v8shield); P.v8shield.position.set(-.95, -1.08, 0); const k = kiteKit(P.v8shield, G); k.rotation.y = -Math.PI / 2; }
  };
  // the thrown shield is the kite shield too
  const oldDisc = v8DiscMesh;
  v8DiscMesh = function () {
    if (!VK.on) return oldDisc();
    M = M || KM(); const g = new THREE.Group(); kiteKit(g, glowM(0x7fd4ff, 2.4)); scene.add(g); return g;
  };
}
VK.on = true;
