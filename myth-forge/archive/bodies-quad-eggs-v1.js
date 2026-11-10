// Archived Nov 9 2026 (late), looks round 2: the old four-legged bodies (plain lathe eggs) from parts/bodies-more.js. Replaced by shaped bodies (haunches, tucked waist, deep chest, shoulders).
// Not loaded by the page.
/*
    S('beast', TB, 'Beast Bodies', 'Beast body (4 legs)', ['quad', 'wolf', 'bear', 'beast', 'animal', 'fur'], () => {
      const g = body(4.6, t => (1.05 + .25 * Math.sin(t * Math.PI * .95) + .2 * sm(.55, .85, t)) * end(t * 1.02 + .01), 1.0, 1.15);
      const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i); p.setZ(i, z + (z > 0 ? .25 * Math.sin(y / 4.6 * Math.PI) : 0) * .6); }
      g.computeVertexNormals(); return [{geo: noise(g, .03, 2), mat: 'fur'}]; }),
    S('lion', TB, 'Beast Bodies', 'Big cat / lion body', ['lion', 'tiger', 'sphinx', 'cat', 'beast'], () => {
      const g = body(4.8, t => (.95 + .15 * Math.sin(t * Math.PI) + .45 * sm(.55, .9, t)) * end(t * 1.02 + .01), 1.0, 1.1);
      const mane = body(1.6, t => (1.75 - .3 * t) * end(t), 1.05, 1.1, 48, 24); at(mane, 0, 3.4, .05); noise(mane, .12, 3);
      return [{geo: noise(g, .02, 2), mat: 'fur'}, {geo: mane, mat: 'fur'}]; }),
    S('horse', TB, 'Beast Bodies', 'Horse / centaur barrel', ['horse', 'centaur', 'taur', 'barrel', 'beast'], () => {
      const g = body(5.2, t => (1.1 + .3 * Math.sin(t * Math.PI)) * end(t * 1.03 + .01), .95, 1.2);
      return [{geo: noise(g, .02, 1.5), mat: 'skin'}]; }),
*/
