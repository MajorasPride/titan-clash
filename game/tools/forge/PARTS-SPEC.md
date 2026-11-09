# Titan Forge part-file spec (read fully before writing a parts file)

Titan Forge is a phone-first browser editor (three.js r160) where MajorasPride kitbashes kaiju and mechs for his game Titan Clash. Parts snap onto a skeleton / body. Parts files are **classic scripts** (NOT ES modules, so the page still works when double-clicked from disk). Each file registers part factories:

```js
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  // T = THREE (r160).  K = helper kit (see below).
  return [
    {id: 'skull_canine', group: 'Heads & Skulls', sub: 'Skulls', name: 'Wolf skull', tags: ['canine','bone'],
     make: () => [ {geo: someBufferGeometry, mat: 'bone'}, {geo: other, mat: 'tooth'} ] },
    ...
  ];
});
```

## Rules for every part
- `make()` returns an array of pieces `{geo, mat}`. `geo` = THREE.BufferGeometry (indexed or not, the editor handles it). `mat` = one of the material keys below (string). Keep each part under ~25k triangles; most should be 300–6000.
- **Orientation:** the part's attach point (where it joins the body) is at the origin (0,0,0) and the part grows along **+Y** (outward from the surface it snaps to). Faces/front of heads, skulls, jaws, masks point toward **+Z** when +Y is "out of the neck". For limbs, +Y runs from the shoulder/hip toward the hand/foot. Tails/necks: +Y from the body outward. Wings: +Y out from the shoulder blade, membrane spreading toward +X (the editor mirrors to make a left one). Weapons: grip at origin, blade/barrel along +Y.
- **Scale:** a whole titan is ~11 units tall. A head ~2–3 units, a horn 1–2.5, a tooth 0.2–0.6, an arm ~4–5, a wing ~6–9 span, a tail ~6–9.
- Must look GOOD and detailed, not blocky: use LatheGeometry, TubeGeometry, ExtrudeGeometry with bevels, merged primitives, tapered tubes, noise displacement, enough segments. Silhouette matters most. Think Zelda / Pokémon / D&D / Monster Hunter / Pacific Rim / Gundam model kits.
- **Original designs only.** Inspired by real animals and genres is great; do NOT copy specific copyrighted characters (no Godzilla, Blue-Eyes, Gundam RX-78, Jaeger Gipsy Danger etc.). Generic real-animal anatomy (wolf skull, crocodile jaw, spider leg, eagle wing) is fine.
- Pure geometry code only: no network, no textures loaded from files (the editor applies materials/textures).
- `id` unique and prefixed by your file (e.g. `an_`, `mk_`, `wp_`), `group` from the list below, `sub` = a sub-category inside the group, short friendly `name`.

## Groups (use exactly these names)
`Heads & Skulls`, `Jaws & Teeth`, `Horns & Crests`, `Eyes & Faces`, `Necks & Spines`, `Torsos & Bellies`, `Arms & Shoulders`, `Hands & Claws`, `Legs & Feet`, `Tails`, `Wings`, `Back & Armor Plates`, `Tentacles & Extra Limbs`, `Bones & Skeleton`, `Mech Heads`, `Mech Torso & Core`, `Mech Arms & Legs`, `Mech Details`, `Weapons`, `Accessories & Magic`.

## Material keys (the editor owns them; it also adds textures and lets the user swap)
`bone`, `tooth`, `horn`, `skin`, `scale`, `chitin`, `fur`, `feather`, `membrane`, `flesh`, `slime`, `crystal`, `eye`, `glow`, `metal`, `darkmetal`, `gold`, `paint`, `paint2`, `rubber`, `wood`, `stone`, `cloth`, `leather`, `screen`.

## K helpers (provided by the editor; you may also write your own inside your file)
- `K.taper(curve, r0, r1, seg=24, radial=10, flat=1)` → tube along a THREE.Curve3 that thins from r0 to r1, capped. `flat` < 1 squashes it (claws, blades).
- `K.bez(...points)` → Quadratic (3 pts) or Cubic (4 pts) Bezier curve. `K.cr(points)` → CatmullRomCurve3.
- `K.V3(x,y,z)`, `K.V2(x,y)`.
- `K.at(geo, x,y,z, rx,ry,rz, s)` → transforms geo in place and returns it (radians).
- `K.extr(points2D, depth, bevel)` → extruded beveled flat shape centered on z.
- `K.lathe(points2D, seg)` → LatheGeometry from [[r,y],...].
- `K.noise(geo, amount, freq)` → displaces vertices along normals with smooth noise (organic look) and recomputes normals; returns geo.
- `K.merge(geos)` → one BufferGeometry from several (same attributes).
- `K.mirrorX(geo)` → mirrored copy (fixes winding).
- `K.ring(n, fn)` → array of fn(i, angle) for i<n around a circle.
- `D` (degrees→radians) available as `K.D`.

## Testing
Write a small node script that loads three (`npm i three@0.160.0` in a scratch folder), a stub K (copy the helper implementations from /home/claude/forge/k-helpers.js), runs every `make()`, and checks: no NaN positions, tri counts in range, bbox sizes sensible, ids unique. Report the list of parts (group / sub / name / tris) at the end.
