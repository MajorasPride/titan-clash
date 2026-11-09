// Base Body: smooth mannequin pieces that cover any skeleton so there is always a body to build on.
// Made in code for Mythic Forge (ours). Every piece is unit sized; the fit system (forge-core.js, "fit system")
// sizes it to its bone. fitKind tells the fit system what slot the piece fills.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const G = 'Base Body';
  // smooth capsule along +Y from y=0 to y=1, radius r0 at the bottom -> r1 at the top, rounded ends that poke out a little so joints overlap
  const capsule = (r0, r1, squash = 1) => { const pts = [], n = 30, cap = .2;   // body y 0..1, round caps poke out past both joints so pieces overlap
    for (let i = 0; i <= n; i++) { const y = -cap + (1 + 2 * cap) * i / n, k = Math.min(1, Math.max(0, y)), r = r0 + (r1 - r0) * k;
      const out = y < 0 ? -y / cap : y > 1 ? (y - 1) / cap : 0; pts.push([Math.max(.001, r * Math.sqrt(Math.max(0, 1 - out * out))), y]); }
    const g = K.lathe(pts, 22); if (squash !== 1) g.scale(1, 1, squash); g.computeVertexNormals(); return g; };
  const egg = (rx, ry, rz, cy, cz = 0) => { const g = new T.SphereGeometry(1, 28, 20); g.scale(rx, ry, rz); g.translate(0, cy, cz); return g; };
  const trunk = () => { const pts = [[.001, -.04], [.62, 0], [.86, .12], [.96, .32], [1, .55], [.96, .78], [.8, .93], [.5, 1.02], [.001, 1.05]];
    const g = K.lathe(pts, 30); g.scale(1, 1, .78); g.computeVertexNormals(); return g; };
  const wing = () => { const s = new T.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(.06, .55, 0, 1); s.quadraticCurveTo(.3, .78, .55, .7);
    s.quadraticCurveTo(.4, .5, .42, .32); s.quadraticCurveTo(.22, .2, 0, 0);
    const g = new T.ExtrudeGeometry(s, {depth: .025, bevelEnabled: true, bevelThickness: .01, bevelSize: .01, bevelSegments: 1, curveSegments: 14}); g.translate(0, 0, -.0125);
    const spar = capsule(.035, .02); spar.scale(1, 1, 1); return [g, spar]; };
  const src = 'Made in code for Mythic Forge (ours)';
  return [
    {id: 'base_trunk', group: G, sub: 'Body', name: 'Base body (trunk)', fitKind: 'torso', tags: ['base', 'body', 'torso'], src, make: () => [{geo: trunk(), mat: 'skin'}]},
    {id: 'base_seg', unitLen: 1, group: G, sub: 'Limbs', name: 'Base limb', fitKind: 'seg', tags: ['base', 'limb', 'arm', 'leg', 'neck'], src, make: () => [{geo: capsule(.5, .4), mat: 'skin'}]},
    {id: 'base_seg_thick', unitLen: 1, group: G, sub: 'Limbs', name: 'Base limb (chunky)', fitKind: 'seg', tags: ['base', 'limb'], src, make: () => [{geo: capsule(.5, .46, .92), mat: 'skin'}]},
    {id: 'base_tailseg', unitLen: 1, group: G, sub: 'Tail', name: 'Base tail piece', fitKind: 'seg', tags: ['base', 'tail'], src, make: () => [{geo: capsule(.5, .36), mat: 'skin'}]},
    {id: 'base_head', group: G, sub: 'Head', name: 'Base head', fitKind: 'head', tags: ['base', 'head'], src, make: () => [{geo: egg(.5, .44, .56, .42, .14), mat: 'skin'}]},
    {id: 'base_jaw', group: G, sub: 'Head', name: 'Base jaw', fitKind: 'jaw', tags: ['base', 'jaw'], src, make: () => [{geo: egg(.3, .13, .4, -.03, .28), mat: 'skin'}]},
    {id: 'base_hand', group: G, sub: 'Hands & Feet', name: 'Base hand', fitKind: 'hand', tags: ['base', 'hand'], src, make: () => [{geo: egg(.5, .5, .24, .42), mat: 'skin'}]},
    {id: 'base_foot', group: G, sub: 'Hands & Feet', name: 'Base foot', fitKind: 'hand', tags: ['base', 'foot'], src, make: () => [{geo: egg(.5, .58, .3, .45), mat: 'skin'}]},
    {id: 'base_wing', group: G, sub: 'Wings', name: 'Base wing', fitKind: 'wing', along: true, tags: ['base', 'wing'], src, make: () => wing().map(g => ({geo: g, mat: 'membrane'}))},
  ].map(p => { const m = p.make; p.make = () => m().map(x => x.geo ? x : x); return p; });
});
