// More dense clay starting shapes for sculpting body parts (ours, Nov 9 2026). Group 'Basic Shapes & Clay'.
// Every shape has lots of evenly spread points so the sculpt brushes look smooth. Attach point at origin, grows along +Y, front +Z.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  'use strict';
  const G = 'Basic Shapes & Clay', V3 = K.V3;
  const C = (id, sub, name, tags, make, mat = 'skin') => ({id: 'bc_' + id, group: G, sub, name, tags: ['clay', 'sculpt', 'shape', ...tags], make: () => [{geo: make(), mat}]});
  const tube = (pts, rf, seg = 80, rad = 36) => K.taper(K.cr(pts.map(p => V3(...p))), rf, 0, seg, rad);
  const lath = (pts, seg = 64) => K.lathe(pts, seg);
  // smooth closed profile for lathe (n points between y0 and y1 with radius function)
  const prof = (n, h, rf) => [...Array(n + 1).keys()].map(i => { const t = i / n; return [Math.max(1e-3, rf(t)), t * h]; });
  return [
    C('head', 'Body clay', 'Clay head blob', ['head', 'skull'], () => { const g = new T.SphereGeometry(1.2, 72, 54); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const fz = z > 0 ? 1 + .35 * Math.max(0, -y / 1.2 + .2) : .95; z *= fz; y *= y < 0 ? .85 : 1.05; x *= 1 - .12 * Math.max(0, -y / 1.2); p.setXYZ(i, x, y + 1.15, z); }
      g.computeVertexNormals(); return g; }),
    C('snout', 'Body clay', 'Clay snout / muzzle', ['snout', 'muzzle', 'jaw', 'face'], () => lath(prof(48, 2.2, t => .8 * Math.sqrt(Math.sin(Math.min(1, t * 1.1) * Math.PI * .5 + .02)) * (1 - .45 * t) * (t > .95 ? Math.sqrt((1 - t) / .05) : 1)), 64).scale(1, 1, .8).rotateX(Math.PI / 2).translate(0, .8, 0)),
    C('horn', 'Body clay', 'Clay horn base', ['horn', 'spike', 'tusk'], () => tube([[0, 0, 0], [0, 1, .1], [0, 2, .5], [0, 2.8, 1.2]], t => .5 * (1 - t) + .02, 90, 40)),
    C('claw', 'Body clay', 'Clay claw base', ['claw', 'talon', 'nail'], () => tube([[0, 0, 0], [0, .8, .15], [0, 1.4, .55], [0, 1.7, 1.1]], t => .32 * Math.pow(1 - t, .8) + .01, 70, 32)),
    C('finger', 'Body clay', 'Clay finger / toe', ['finger', 'toe', 'digit'], () => tube([[0, 0, 0], [0, .7, .05], [0, 1.4, .15], [0, 1.9, .3]], t => .22 * (1 - .3 * t) * (t > .9 ? Math.sqrt((1 - t) / .1) : 1) + .01, 60, 28)),
    C('hand', 'Body clay', 'Clay hand (palm + fingers)', ['hand', 'paw', 'fist'], () => { const palm = new T.SphereGeometry(.75, 48, 36); palm.scale(1, 1.1, .45); palm.translate(0, .8, 0);
      const fingers = [-.45, -.15, .15, .45].map((x, i) => K.at(tube([[0, 0, 0], [0, .5, .05], [0, 1.0, .2], [0, 1.3, .4]], t => .15 * (1 - .3 * t) + .01, 50, 20), x, 1.5, 0, 0, 0, -x * .25, .9 + (i === 1 || i === 2 ? .15 : 0)));
      const thumb = K.at(tube([[0, 0, 0], [0, .45, .1], [0, .85, .3]], t => .17 * (1 - .3 * t) + .01, 40, 20), .65, .6, .15, 0, 0, -.9); return K.merge([palm, ...fingers, thumb]); }),
    C('foot', 'Body clay', 'Clay foot', ['foot', 'paw', 'hoof'], () => { const g = new T.SphereGeometry(1, 64, 48); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); y = y < 0 ? y * .25 : y * .55; z = z > 0 ? z * 1.6 : z * .7; x *= z > .8 ? 1.15 : .85; p.setXYZ(i, x * .8, y + .3, z * .9 + .4); }
      g.computeVertexNormals(); return g; }),
    C('muscle', 'Body clay', 'Clay arm (muscle)', ['arm', 'muscle', 'limb'], () => tube([[0, 0, 0], [0, 1.2, .15], [0, 2.4, 0], [0, 3.6, .2], [0, 4.4, .3]], t => .55 + .18 * Math.exp(-((t - .25) ** 2) / .02) + .1 * Math.exp(-((t - .62) ** 2) / .015) - .2 * t, 110, 40)),
    C('leg', 'Body clay', 'Clay leg (thigh + calf)', ['leg', 'thigh', 'calf', 'limb'], () => tube([[0, 0, 0], [0, 1.6, .25], [0, 3, 0], [0, 4.6, -.15], [0, 5.2, .1]], t => .78 - .3 * t + .14 * Math.exp(-((t - .65) ** 2) / .012), 120, 40)),
    C('tail', 'Body clay', 'Clay tail', ['tail', 'whip'], () => tube([[0, 0, 0], [0, 2, -.3], [0, 4, .2], [0, 6, -.2], [0, 7.5, .3]], t => .7 * (1 - t) + .03, 160, 32)),
    C('tentacle', 'Body clay', 'Clay tentacle', ['tentacle', 'octopus', 'kraken'], () => tube([[0, 0, 0], [.3, 1.8, 0], [-.2, 3.6, .3], [.4, 5.2, .1], [.9, 6.2, -.3]], t => .55 * Math.pow(1 - t, 1.1) + .02, 160, 32)),
    C('wing', 'Body clay', 'Clay wing plate', ['wing', 'membrane', 'fin'], () => { const g = new T.BoxGeometry(4, 3, .18, 64, 48, 2); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setXYZ(i, x * (1 - .3 * (y + 1.5) / 3), y, p.getZ(i) * (1 - .6 * Math.abs(x) / 2)); }
      g.translate(2, 1.5, 0); g.computeVertexNormals(); return g; }),
    C('chest', 'Body clay', 'Clay chest (dense)', ['torso', 'chest', 'body'], () => { const g = lath(prof(60, 4.4, t => 1.2 + .6 * Math.sin(t * Math.PI * .9) - (t > .92 ? (t - .92) * 9 : 0) + (t < .06 ? (t - .06) * 8 : 0)), 72); g.scale(1, 1, .75); return g; }),
    C('shell', 'Body clay', 'Clay shell / back plate', ['shell', 'carapace', 'plate', 'back'], () => new T.SphereGeometry(1.6, 72, 36, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, .55, 1.25)),
    C('block', 'Mech clay', 'Mech block (dense)', ['mech', 'box', 'armor', 'hard'], () => { const g = new T.BoxGeometry(2, 2, 2, 32, 32, 32); g.translate(0, 1, 0); return g; }, 'paint'),
    C('plate', 'Mech clay', 'Mech armor plate (dense)', ['mech', 'plate', 'armor', 'panel'], () => { const g = new T.BoxGeometry(2.6, .3, 2, 52, 4, 40); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) + .25 * (1 - (x / 1.3) ** 2) * .6 + .15 * (1 - (z / 1) ** 2) * .4); } g.translate(0, .15, 0); g.computeVertexNormals(); return g; }, 'paint'),
    C('pipe', 'Mech clay', 'Mech tube (dense)', ['mech', 'pipe', 'cylinder', 'barrel'], () => new T.CylinderGeometry(.6, .6, 2.6, 64, 48).translate(0, 1.3, 0), 'metal'),
    C('wedge', 'Mech clay', 'Mech wedge (dense)', ['mech', 'wedge', 'armor'], () => { const g = new T.BoxGeometry(2, 2, 2, 32, 32, 32); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i); p.setZ(i, z * (1 - .5 * (y + 1) / 2) - .5 * (y + 1) / 2 * .5); } g.translate(0, 1, 0); g.computeVertexNormals(); return g; }, 'paint'),
  ];
});
