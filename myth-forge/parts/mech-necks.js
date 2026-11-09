// Mythic Forge parts: MECH NECKS (id prefix mn_, every id has "neck" so it fits the neck slot)
// Group 'Necks & Spines', sub 'Mech Necks'. Neck base (on the chest) at the origin, grows along +Y toward the head, front = +Z.
// Short necks for humanoid mechs; long segmented / crane / hose necks for mech dragons, Zoids-style beasts and serpents.
// All original hard-surface designs (Nov 9, 2026). Classic script, no modules.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  'use strict';
  const {V3, D, at, taper, cr, lathe, extr, merge} = K;
  const NS = 'Necks & Spines', SUB = 'Mech Necks', UP = V3(0, 1, 0);
  const cyl = (rt, rb, h, seg = 20) => new T.CylinderGeometry(rt, rb, h, seg, 1);
  const box = (w, h, d) => new T.BoxGeometry(w, h, d);
  const ball = (r, s = 18) => new T.SphereGeometry(r, s, Math.round(s * .7));
  const tor = (r, t, s = 28) => new T.TorusGeometry(r, t, 8, s);
  // put a +Y-up geometry at point p, its +Y along dir (with an optional extra spin round that axis)
  function orient(g, p, dir, spin = 0) { const q = new T.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
    if (spin) q.multiply(new T.Quaternion().setFromAxisAngle(UP, spin)); return g.applyMatrix4(new T.Matrix4().compose(p, q, V3(1, 1, 1))); }
  // piston from a to b: barrel (darker) on the a side, chrome rod on the b side
  function piston(a, b, r = .07) { a = V3(...a); b = V3(...b); const d = b.clone().sub(a), L = d.length(), m = a.clone().addScaledVector(d, .5);
    const barrel = orient(at(cyl(r, r, L * .55, 12), 0, -L * .2, 0), m.clone(), d), rod = orient(at(cyl(r * .55, r * .55, L * .55, 10), 0, L * .2, 0), m.clone(), d);
    const caps = [a, b].map(p => orient(ball(r * 1.15, 10), p.clone(), d)); return {barrel, rod, caps}; }
  const P = (id, name, tags, make) => ({id, group: NS, sub: SUB, name, tags: ['mech', 'robot', 'neck', ...tags], make});
  const out = list => list.filter(([g]) => g).map(([g, mat]) => ({geo: Array.isArray(g) ? merge(g) : g, mat}));

  return [
    P('mn_neck_piston', 'Piston neck', ['hydraulic', 'short', 'humanoid'], () => {
      const core = [at(cyl(.3, .36, 1.1, 20), 0, .55, 0), at(lathe([[.001, 0], [.62, 0], [.66, .08], [.58, .2], [.4, .26], [.001, .26]], 28), 0, 0, 0)];
      const top = [at(ball(.34, 20), 0, 1.15, 0), at(cyl(.42, .3, .14, 20), 0, 1.04, 0)];
      const ps = [[-.42, .12, -.05], [.42, .12, -.05]].map(([x, y, z]) => piston([x, y, z], [x * .62, 1.0, z + .08], .075));
      const rings = [at(tor(.33, .035), 0, .4, 0, Math.PI / 2), at(tor(.32, .035), 0, .7, 0, Math.PI / 2)];
      const front = at(extr([[-.26, 0], [.26, 0], [.2, .75], [0, .86], [-.2, .75]], .07, .025), 0, .2, .33);
      return out([[core, 'darkmetal'], [top, 'metal'], [ps.map(p => p.barrel), 'paint2'], [[...ps.map(p => p.rod), ...ps.flatMap(p => p.caps)], 'metal'], [rings, 'metal'], [front, 'paint']]);
    }),
    P('mn_neck_gorget', 'Armored gorget neck', ['knight', 'armor', 'plates', 'short', 'humanoid'], () => {
      const core = at(cyl(.28, .32, 1.2, 18), 0, .6, 0), bands = [];
      for (let i = 0; i < 4; i++) { const r = .66 - i * .08, y = i * .26, h = .34;
        bands.push(at(lathe([[r * .78, 0], [r, .04], [r * 1.02, h * .55], [r * .9, h], [r * .74, h * .96]], 32), 0, y, 0)); }
      const ridge = [0, 1, 2, 3].map(i => at(extr([[-.06, 0], [.06, 0], [.03, .3], [-.03, .3]], .08, .02), 0, i * .26 + .02, .62 - i * .08, -.12));
      return out([[core, 'darkmetal'], [bands, 'paint'], [ridge, 'paint2']]);
    }),
    P('mn_neck_cables', 'Cable bundle neck', ['cables', 'wires', 'exposed', 'short'], () => {
      const core = at(cyl(.22, .26, 1.25, 16), 0, .62, 0), cables = [];
      for (let i = 0; i < 7; i++) { const a0 = i / 7 * Math.PI * 2, pts = [];
        for (let k = 0; k <= 6; k++) { const t = k / 6, a = a0 + t * 1.3, r = .34 + .06 * Math.sin(t * Math.PI); pts.push(V3(Math.cos(a) * r, t * 1.25, Math.sin(a) * r)); }
        cables.push(taper(cr(pts), .065, .055, 30, 8)); }
      const clamps = [at(tor(.4, .05, 24), 0, .06, 0, Math.PI / 2), at(tor(.38, .05, 24), 0, .62, 0, Math.PI / 2), at(tor(.4, .05, 24), 0, 1.2, 0, Math.PI / 2)];
      const plates = [at(lathe([[.001, 0], [.58, 0], [.6, .1], [.42, .16], [.001, .16]], 24), 0, 0, 0), at(lathe([[.001, 0], [.42, 0], [.46, .08], [.3, .14], [.001, .14]], 24), 0, 1.22, 0)];
      const lamp = at(box(.12, .5, .06), 0, .62, .25);
      return out([[core, 'darkmetal'], [cables, 'rubber'], [clamps, 'metal'], [plates, 'paint'], [lamp, 'glow']]);
    }),
    P('mn_neck_ball', 'Ball-joint neck', ['joint', 'swivel', 'short', 'humanoid', 'model kit'], () => {
      const base = [at(lathe([[.001, 0], [.6, 0], [.64, .1], [.5, .22], [.001, .22]], 28), 0, 0, 0), at(tor(.5, .06, 28), 0, .22, 0, Math.PI / 2)];
      const joint = at(ball(.42, 22), 0, .5, 0), shaft = at(cyl(.2, .24, .6, 16), 0, .95, 0), top = at(cyl(.36, .26, .16, 20), 0, 1.28, 0);
      const pins = [-1, 1].map(s => at(cyl(.12, .12, .14, 12), s * .44, .5, 0, 0, 0, Math.PI / 2));
      return out([[base, 'paint'], [[joint, top], 'metal'], [shaft, 'darkmetal'], [pins, 'paint2']]);
    }),
    P('mn_neck_super', 'Super robot V-collar neck', ['super robot', 'hero', 'collar', 'short', 'humanoid'], () => {
      const core = at(cyl(.34, .4, .9, 20), 0, .45, 0), top = at(cyl(.4, .34, .12, 20), 0, .92, 0);
      const vcol = at(extr([[-1.05, .55], [-.75, .62], [0, .05], [.75, .62], [1.05, .55], [0, -.12]], .16, .05), 0, .12, .42, -.25);
      const back = at(extr([[-.8, 0], [.8, 0], [.6, .55], [-.6, .55]], .14, .04), 0, 0, -.4, .3);
      const fins = [-1, 1].map(s => at(extr([[0, 0], [.42, .1], [.6, .62], [.1, .4]], .08, .03), s * .46, .15, -.05, 0, s > 0 ? 0 : Math.PI, 0));
      const gem = at(new T.OctahedronGeometry(.13, 0), 0, .32, .55, 0, 0, Math.PI / 4);
      return out([[core, 'darkmetal'], [top, 'metal'], [[vcol, back], 'paint'], [fins, 'paint2'], [gem, 'glow']]);
    }),
    P('mn_neck_turret', 'Turret ring neck', ['tank', 'turret', 'ring', 'walker', 'wide', 'short'], () => {
      const ring = at(lathe([[.5, 0], [1.0, 0], [1.05, .12], [.95, .3], [.5, .3]], 36), 0, 0, 0), core = at(cyl(.48, .55, .6, 24), 0, .3, 0);
      const teeth = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; teeth.push(at(box(.1, .14, .12), Math.cos(a) * 1.06, .07, Math.sin(a) * 1.06, 0, -a, 0)); }
      const bolts = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; bolts.push(at(cyl(.05, .05, .06, 8), Math.cos(a) * .78, .32, Math.sin(a) * .78)); }
      const cap = at(cyl(.5, .55, .1, 24), 0, .64, 0), lamp = at(box(.5, .06, .06), 0, .5, .5);
      return out([[ring, 'paint'], [core, 'darkmetal'], [teeth, 'metal'], [[...bolts, cap], 'metal'], [lamp, 'glow']]);
    }),
    P('mn_neck_segmented', 'Segmented mech dragon neck', ['dragon', 'zoids', 'beast', 'long', 'segments', 'armor'], () => {
      const c = cr([V3(0, 0, 0), V3(0, 1.3, -.35), V3(0, 2.8, -.2), V3(0, 4.0, .45), V3(0, 4.8, 1.4)]), n = 9, cores = [], caps = [], lights = [], links = [];
      for (let i = 0; i < n; i++) { const t = (i + .5) / n, p = c.getPointAt(t), d = c.getTangentAt(t), s = 1 - i * .055;
        cores.push(orient(cyl(.42 * s, .48 * s, .44, 8), p.clone(), d, Math.PI / 8));
        const cap = at(extr([[-.55, 0], [.55, 0], [.4, .42], [0, .5], [-.4, .42]], .5 * s, .04), 0, .2 * s, -.12, Math.PI / 2 - .12, 0, 0); cap.scale(s, s, s);
        caps.push(orient(cap, p.clone(), d));
        lights.push(orient(at(box(.16 * s, .08, .26), 0, 0, .46 * s), p.clone(), d));
        if (i < n - 1) { const t2 = (i + 1) / n, p2 = c.getPointAt(t2); links.push(orient(cyl(.22 * s, .22 * s, .3, 12), p2, c.getTangentAt(t2))); } }
      const hose = taper(cr([0, .25, .5, .75, 1].map(t => c.getPointAt(t).clone().add(V3(0, 0, .42 - t * .14)))), .09, .07, 60, 8);
      return out([[cores, 'darkmetal'], [caps, 'paint'], [links, 'metal'], [lights, 'glow'], [hose, 'rubber']]);
    }),
    P('mn_neck_crane', 'Twin-strut crane neck', ['walker', 'zoids', 'beast', 'long', 'struts', 'hydraulic'], () => {
      const c = cr([V3(0, 0, 0), V3(0, 1.6, .2), V3(0, 3.0, .7), V3(0, 3.9, 1.5)]), struts = [], bars = [], ps = [];
      for (const sx of [-.28, .28]) { const pts = [0, .2, .4, .6, .8, 1].map(t => c.getPointAt(t).clone().add(V3(sx, 0, 0))); struts.push(taper(cr(pts), .13, .1, 40, 6, .7)); }
      for (let i = 1; i < 6; i++) { const t = i / 6, p = c.getPointAt(t), d = c.getTangentAt(t); bars.push(orient(at(box(.62, .1, .12), 0, 0, 0), p.clone(), d)); }
      for (const t of [.12, .55]) { const a = c.getPointAt(t), b = c.getPointAt(t + .3); const p = piston([a.x, a.y, a.z - .25], [b.x, b.y, b.z - .22], .08); ps.push(p); }
      const base = at(lathe([[.001, 0], [.62, 0], [.6, .2], [.4, .3], [.001, .3]], 24), 0, 0, 0), top = c.getPointAt(1), joint = at(ball(.3, 16), top.x, top.y, top.z);
      const eye = [.3, .7].map(t => { const p = c.getPointAt(t); return at(box(.12, .12, .12), p.x, p.y, p.z + .18); });
      return out([[struts, 'paint'], [bars, 'darkmetal'], [ps.map(p => p.barrel), 'paint2'], [[...ps.map(p => p.rod), ...ps.flatMap(p => p.caps), joint], 'metal'], [base, 'darkmetal'], [eye, 'glow']]);
    }),
    P('mn_neck_hose', 'Ribbed hose neck', ['serpent', 'flexible', 'long', 'tube', 'ribbed'], () => {
      const c = cr([V3(0, 0, 0), V3(0, 1.1, .35), V3(0, 2.2, -.1), V3(0, 3.3, .3), V3(0, 3.9, .9)]), rf = t => .42 - t * .14;
      const tube = taper(c, rf, 0, 90, 16), ribs = [];
      for (let i = 1; i < 22; i++) { const t = i / 22; ribs.push(orient(at(tor(rf(t) + .02, .045, 22), 0, 0, 0, Math.PI / 2), c.getPointAt(t).clone(), c.getTangentAt(t))); }
      const ends = [orient(cyl(.5, .55, .22, 20), c.getPointAt(0).clone().add(V3(0, .08, 0)), c.getTangentAt(0)), orient(cyl(.34, .34, .2, 18), c.getPointAt(1).clone(), c.getTangentAt(1))];
      return out([[tube, 'rubber'], [ribs, 'darkmetal'], [ends, 'paint']]);
    }),
  ];
});
