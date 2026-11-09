// Basic shapes & clay: smooth, high-detail starting blobs for sculpting from scratch (ours).
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const G = 'Basic Shapes & Clay', bl = (id, sub, name, make, mat = 'skin') => ({id: 'bs_' + id, group: G, sub, name, tags: ['clay', 'sculpt', 'shape'], make: () => [{geo: make(), mat}]});
  const sph = (r, s = 1) => new T.SphereGeometry(r, 64, 48).translate(0, r, 0);
  return [
    bl('ball', 'Clay', 'Clay ball', () => sph(1)), bl('egg', 'Clay', 'Clay egg', () => K.lathe([...Array(33).keys()].map(i => { const a = i / 32 * Math.PI; return [Math.sin(a) * (1 - .25 * Math.cos(a)) * .9 + 1e-3, (1 - Math.cos(a)) * 1.3]; }), 64)),
    bl('capsule', 'Clay', 'Clay capsule', () => new T.CapsuleGeometry(.7, 2.2, 24, 48).translate(0, 1.8, 0)),
    bl('torso', 'Clay', 'Clay torso blob', () => K.noise(K.lathe([[0.001, 0], [1.1, .3], [1.5, 1.4], [1.7, 2.6], [1.4, 3.6], [.7, 4.1], [0.001, 4.2]], 64).scale(1, 1, .8), .04, 1.2)),
    bl('limb', 'Clay', 'Clay limb', () => K.taper(K.bez(K.V3(0, 0, 0), K.V3(0, 1.5, .2), K.V3(0, 3, 0)), t => .55 - t * .25 + Math.sin(t * Math.PI) * .12, 0, 48, 32)),
    bl('flat', 'Clay', 'Clay slab', () => new T.BoxGeometry(2, .4, 2, 24, 6, 24).translate(0, .2, 0)),
    bl('cyl', 'Shapes', 'Cylinder', () => new T.CylinderGeometry(.6, .6, 2, 40, 12).translate(0, 1, 0), 'metal'),
    bl('cone', 'Shapes', 'Cone / spike', () => new T.ConeGeometry(.6, 2, 40, 12).translate(0, 1, 0), 'horn'),
    bl('torus', 'Shapes', 'Ring', () => new T.TorusGeometry(1, .22, 24, 64).rotateX(Math.PI / 2).translate(0, .22, 0), 'metal'),
    bl('box', 'Shapes', 'Rounded box', () => K.extr([[-1, -1], [1, -1], [1, 1], [-1, 1]], 1.6, .25, 4).rotateX(-Math.PI / 2).translate(0, 1, 0), 'paint'),
    bl('dome', 'Shapes', 'Dome', () => new T.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), 'paint'),
    bl('wedge', 'Shapes', 'Wedge', () => K.extr([[-1, 0], [1, 0], [1, .3], [-1, 1.4]], 1.2, .08), 'paint'),
    bl('star', 'Shapes', 'Star', () => K.extr(K.ring(10, (i, a) => [Math.sin(a) * (i % 2 ? .45 : 1), Math.cos(a) * (i % 2 ? .45 : 1) + 1]), .3, .06), 'gold'),
    bl('hemi', 'Shapes', 'Half pipe', () => new T.CylinderGeometry(1, 1, 2, 40, 1, true, 0, Math.PI).translate(0, 1, 0), 'paint'),
  ];
});
