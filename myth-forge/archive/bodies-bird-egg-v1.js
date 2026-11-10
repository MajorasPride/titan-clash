// archived Nov 10 2026 (looks round 3): the old bb_bird body (an egg with a ruff of cones). Kept for reference, not loaded.
    S('bird', TB, 'Bird Bodies', 'Bird body (feathered)', ['bird', 'griffin', 'feather', 'avian'], () => {
      const g = body(3.6, t => (1.2 * Math.sin(Math.min(1, t * 1.05) * Math.PI) ** .7 + .05) * (1 - .25 * t), 1.0, 1.25);
      const ruff = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; ruff.push(at(new T.ConeGeometry(.22, .8, 6), Math.cos(a) * .95, 2.9, Math.sin(a) * 1.1, Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2)); }
      return [{geo: noise(g, .025, 3), mat: 'feather'}, {geo: merge(ruff), mat: 'feather'}]; }),
