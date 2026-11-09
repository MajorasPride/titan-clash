// Titan Forge materials: procedural textures (made in code, ours) + triplanar mapping so any part looks textured without UVs.
(function () {
  const S = 512;
  const cv = () => { const c = document.createElement('canvas'); c.width = c.height = S; return [c, c.getContext('2d')]; };
  let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const R = (a, b) => a + rnd() * (b - a);
  const fill = (x, c) => { x.fillStyle = c; x.fillRect(0, 0, S, S); };
  // wrap-around drawing so textures tile
  const wrap = (x, f) => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { x.save(); x.translate(dx, dy); f(); x.restore(); } };
  function noiseLayer(x, n, rMin, rMax, cols, alpha = .15) { for (let i = 0; i < n; i++) { const px = R(0, S), py = R(0, S), r = R(rMin, rMax), c = cols[(rnd() * cols.length) | 0];
      x.globalAlpha = alpha; wrap(x, () => { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); }); } x.globalAlpha = 1; }
  const G = {
    plain(x) { fill(x, '#fff'); noiseLayer(x, 60, 20, 80, ['#ddd', '#fff'], .2); },
    skin(x) { fill(x, '#e8e8e8'); noiseLayer(x, 140, 10, 70, ['#bbb', '#fff', '#ccc'], .25); for (let i = 0; i < 1500; i++) { x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(R(0, S), R(0, S), 2, 2); } },
    scales(x, big) { fill(x, '#cfcfcf'); const n = big ? 8 : 16, w = S / n; for (let row = -1; row <= n * 1.6; row++) for (let c = -1; c <= n; c++) { const cx = c * w + (row % 2) * w / 2, cy = row * w * .6;
        const g = x.createRadialGradient(cx, cy + w * .1, w * .05, cx, cy, w * .62); g.addColorStop(0, '#ffffff'); g.addColorStop(.75, '#c8c8c8'); g.addColorStop(1, '#6a6a6a');
        x.fillStyle = g; x.beginPath(); x.arc(cx, cy, w * .58, 0, Math.PI); x.fill(); x.strokeStyle = 'rgba(40,40,40,.6)'; x.lineWidth = 1.5; x.stroke(); } },
    plates(x) { fill(x, '#bbb'); const n = 4, w = S / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const off = (j % 2) * w / 2, px = i * w + off, py = j * w;
        wrap(x, () => { const g = x.createLinearGradient(px, py, px, py + w); g.addColorStop(0, '#f2f2f2'); g.addColorStop(1, '#8a8a8a'); x.fillStyle = g; x.beginPath(); x.roundRect(px + 4, py + 4, w - 8, w - 8, 18); x.fill(); x.strokeStyle = '#444'; x.lineWidth = 3; x.stroke(); }); } },
    chitin(x) { fill(x, '#9a9a9a'); const r = 34; for (let j = -1; j < S / (r * 1.5) + 1; j++) for (let i = -1; i < S / (r * 1.73) + 1; i++) { const cx = i * r * 1.73 + (j % 2) * r * .86, cy = j * r * 1.5;
        x.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; x.lineTo(cx + Math.cos(a) * r * .95, cy + Math.sin(a) * r * .95); } x.closePath();
        const g = x.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#777'); x.fillStyle = g; x.fill(); x.strokeStyle = '#333'; x.lineWidth = 2; x.stroke(); } },
    fur(x) { fill(x, '#999'); x.lineCap = 'round'; for (let i = 0; i < 9000; i++) { const px = R(0, S), py = R(0, S), l = R(8, 22), a = R(1.3, 1.8), v = (R(110, 255)) | 0;
        x.strokeStyle = `rgba(${v},${v},${v},.55)`; x.lineWidth = R(1, 2.2); wrap(x, () => { x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }); } },
    feather(x) { fill(x, '#ccc'); for (let row = 0; row < 6; row++) for (let c = 0; c < 6; c++) { const cx = c * 86 + (row % 2) * 43, cy = row * 86; wrap(x, () => {
        x.fillStyle = row % 2 ? '#e8e8e8' : '#d8d8d8'; x.beginPath(); x.ellipse(cx, cy + 40, 30, 60, 0, 0, 7); x.fill(); x.strokeStyle = '#777'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, cy - 15); x.lineTo(cx, cy + 95); x.stroke();
        x.strokeStyle = 'rgba(90,90,90,.5)'; x.lineWidth = 1; for (let k = 0; k < 14; k++) { const y = cy + k * 7; x.beginPath(); x.moveTo(cx, y); x.lineTo(cx - 26, y + 14); x.moveTo(cx, y); x.lineTo(cx + 26, y + 14); x.stroke(); } }); } },
    membrane(x) { fill(x, '#d0d0d0'); noiseLayer(x, 80, 20, 90, ['#eee', '#aaa'], .3); x.strokeStyle = 'rgba(80,30,30,.55)';
      for (let i = 0; i < 26; i++) { let px = R(0, S), py = R(0, S), a = R(0, 7); x.lineWidth = R(1.5, 4); for (let k = 0; k < 6; k++) { const nx = px + Math.cos(a) * 40, ny = py + Math.sin(a) * 40; wrap(x, () => { x.beginPath(); x.moveTo(px, py); x.lineTo(nx, ny); x.stroke(); }); px = nx; py = ny; a += R(-.7, .7); x.lineWidth *= .8; } } },
    bone(x) { fill(x, '#f0ebe0'); noiseLayer(x, 120, 10, 60, ['#d8cfbd', '#fff8ea', '#c8bca4'], .35); x.strokeStyle = 'rgba(90,70,50,.45)';
      for (let i = 0; i < 18; i++) { let px = R(0, S), py = R(0, S); x.lineWidth = R(.8, 2); x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 7; k++) { px += R(-22, 22); py += R(-22, 22); x.lineTo(px, py); } x.stroke(); } },
    horn(x) { for (let y = 0; y < S; y += 4) { const v = 150 + Math.sin(y * .09) * 40 + R(-20, 20); x.fillStyle = `rgb(${v | 0},${v | 0},${v | 0})`; x.fillRect(0, y, S, 4); } for (let i = 0; i < 300; i++) { x.fillStyle = 'rgba(0,0,0,.1)'; x.fillRect(R(0, S), R(0, S), R(10, 60), 1); } },
    brushed(x) { fill(x, '#c8c8c8'); for (let i = 0; i < 3000; i++) { const v = (R(150, 255)) | 0; x.fillStyle = `rgba(${v},${v},${v},.25)`; x.fillRect(R(0, S) - 40, R(0, S), R(40, 200), 1); } },
    diamond(x) { G.brushed(x); x.fillStyle = 'rgba(255,255,255,.7)'; for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { x.save(); x.translate(i * 32 + 16, j * 32 + 16); x.rotate((i + j) % 2 ? .78 : -.78);
        x.fillStyle = '#eee'; x.fillRect(-12, -3, 24, 6); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(-12, 3, 24, 2); x.restore(); } },
    hexpanel(x) { fill(x, '#b5b5b5'); const r = 40; x.lineWidth = 3; for (let j = -1; j < 10; j++) for (let i = -1; i < 9; i++) { const cx = i * r * 1.73 + (j % 2) * r * .86, cy = j * r * 1.5;
        x.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.fillStyle = rnd() < .2 ? '#9a9a9a' : '#c8c8c8'; x.fill(); x.strokeStyle = '#3a3a3a'; x.stroke(); } },
    panels(x) { fill(x, '#cfcfcf'); x.strokeStyle = '#3c3c3c'; x.lineWidth = 3; const cut = (px, py, w, h, d) => { if (d > 3 || (d > 1 && rnd() < .35)) { x.strokeRect(px, py, w, h);
        for (const [a, b] of [[px + 7, py + 7], [px + w - 7, py + 7], [px + 7, py + h - 7], [px + w - 7, py + h - 7]]) { x.fillStyle = '#777'; x.beginPath(); x.arc(a, b, 3, 0, 7); x.fill(); } return; }
        if (w > h) { const s = R(.3, .7) * w; cut(px, py, s, h, d + 1); cut(px + s, py, w - s, h, d + 1); } else { const s = R(.3, .7) * h; cut(px, py, w, s, d + 1); cut(px, py + s, w, h - s, d + 1); } }; cut(0, 0, S, S, 0); },
    rust(x) { G.brushed(x); noiseLayer(x, 160, 8, 70, ['#a0521e', '#6e2c0a', '#c87a3a'], .45); for (let i = 0; i < 2000; i++) { x.fillStyle = 'rgba(80,30,5,.3)'; x.fillRect(R(0, S), R(0, S), 2, 2); } },
    damascus(x) { for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx += 4) { const v = 150 + Math.sin(y * .12 + Math.sin(xx * .03) * 4 + Math.sin(xx * .011) * 6) * 70; x.fillStyle = `rgb(${v | 0},${v | 0},${v | 0})`; x.fillRect(xx, y, 4, 1); } },
    wood(x) { for (let y = 0; y < S; y++) { const v = 150 + Math.sin(y * .25 + Math.sin(y * .02) * 8) * 35; x.fillStyle = `rgb(${v | 0},${(v * .95) | 0},${(v * .9) | 0})`; x.fillRect(0, y, S, 1); }
      for (let i = 0; i < 400; i++) { x.fillStyle = 'rgba(40,20,0,.15)'; x.fillRect(R(0, S), R(0, S), R(30, 160), 1); } for (let i = 0; i < 3; i++) { x.strokeStyle = 'rgba(60,30,10,.5)'; x.lineWidth = 3; x.beginPath(); x.ellipse(R(0, S), R(0, S), R(10, 20), R(5, 9), 0, 0, 7); x.stroke(); } },
    stone(x) { fill(x, '#a8a8a8'); noiseLayer(x, 200, 6, 50, ['#888', '#ccc', '#999'], .35); const pts = [...Array(30)].map(() => [R(0, S), R(0, S)]); x.strokeStyle = 'rgba(30,30,30,.55)'; x.lineWidth = 2;
      for (const [a, b] of pts) { let best = null, d = 1e9; for (const [c, e] of pts) { const dd = (a - c) ** 2 + (b - e) ** 2; if (dd > 1 && dd < d) { d = dd; best = [c, e]; } } x.beginPath(); x.moveTo(a, b); x.lineTo((a + best[0]) / 2 + R(-10, 10), (b + best[1]) / 2 + R(-10, 10)); x.stroke(); } },
    leather(x) { fill(x, '#b8b8b8'); noiseLayer(x, 300, 4, 22, ['#8a8a8a', '#d0d0d0'], .35); x.strokeStyle = 'rgba(60,60,60,.25)'; for (let i = 0; i < 200; i++) { x.lineWidth = 1; x.beginPath(); const px = R(0, S), py = R(0, S); x.moveTo(px, py); x.quadraticCurveTo(px + R(-20, 20), py + R(-20, 20), px + R(-30, 30), py + R(-30, 30)); x.stroke(); } },
    cloth(x) { fill(x, '#ccc'); for (let i = 0; i < S; i += 4) { x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(i, 0, 2, S); x.fillStyle = 'rgba(255,255,255,.15)'; x.fillRect(0, i, S, 2); } noiseLayer(x, 40, 30, 90, ['#aaa', '#eee'], .2); },
    slime(x) { fill(x, '#cfcfcf'); noiseLayer(x, 90, 20, 90, ['#fff', '#999'], .35); for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.arc(R(0, S), R(0, S), R(2, 9), 0, 7); x.fill(); } },
    blood(x) { G.plain(x); for (let i = 0; i < 26; i++) { const px = R(0, S), py = R(0, S), r = R(8, 40); x.fillStyle = `rgba(${(R(90, 150)) | 0},10,10,${R(.5, .85)})`; wrap(x, () => { x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
        for (let k = 0; k < 8; k++) { const a = R(0, 7), d = r * R(1.1, 2.2); x.beginPath(); x.arc(px + Math.cos(a) * d, py + Math.sin(a) * d, R(2, 7), 0, 7); x.fill(); } x.fillRect(px - 3, py, 6, R(20, 90)); }); } },
    lava(x) { fill(x, '#202020'); noiseLayer(x, 120, 10, 60, ['#3a3a3a', '#111'], .5); x.strokeStyle = '#ffffff'; for (let i = 0; i < 22; i++) { let px = R(0, S), py = R(0, S); x.lineWidth = R(2, 5); x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 8; k++) { px += R(-30, 30); py += R(-30, 30); x.lineTo(px, py); } x.stroke(); } },
    crystal(x) { fill(x, '#ddd'); for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,255,255,${R(.1, .5)})`; x.beginPath(); const px = R(0, S), py = R(0, S); x.moveTo(px, py); x.lineTo(px + R(-80, 80), py + R(-80, 80)); x.lineTo(px + R(-80, 80), py + R(-80, 80)); x.fill(); } },
    stripes(x) { fill(x, '#ddd'); x.fillStyle = '#222'; for (let i = 0; i < 14; i++) { const y0 = i * 38 + R(-6, 6); x.beginPath(); x.moveTo(0, y0); for (let xx = 0; xx <= S; xx += 32) x.lineTo(xx, y0 + Math.sin(xx * .03 + i) * 10 + R(-4, 4)); for (let xx = S; xx >= 0; xx -= 32) x.lineTo(xx, y0 + 12 + Math.sin(xx * .05 + i) * 8); x.fill(); } },
    spots(x) { fill(x, '#ddd'); for (let i = 0; i < 70; i++) { const px = R(0, S), py = R(0, S), r = R(10, 22); wrap(x, () => { x.fillStyle = '#333'; x.beginPath(); x.ellipse(px, py, r, r * .8, R(0, 3), 0, 7); x.fill(); x.fillStyle = '#9a8a70'; x.beginPath(); x.ellipse(px, py, r * .5, r * .4, 0, 0, 7); x.fill(); }); } },
    snake(x) { fill(x, '#ccc'); for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const cx = i * 64 + 32, cy = j * 64 + 32; x.fillStyle = (i + j) % 2 ? '#3a3a3a' : '#e8e8e8'; x.beginPath(); x.moveTo(cx, cy - 30); x.lineTo(cx + 30, cy); x.lineTo(cx, cy + 30); x.lineTo(cx - 30, cy); x.fill(); } G.scales_overlay(x); },
    scales_overlay(x) { x.globalAlpha = .35; const w = 22; for (let row = 0; row < 40; row++) for (let c = -1; c < 25; c++) { const cx = c * w + (row % 2) * w / 2, cy = row * w * .6; x.strokeStyle = '#000'; x.beginPath(); x.arc(cx, cy, w * .55, 0, Math.PI); x.stroke(); } x.globalAlpha = 1; },
    camo(x) { fill(x, '#999'); for (const c of ['#666', '#bbb', '#444']) for (let i = 0; i < 40; i++) { const px = R(0, S), py = R(0, S); x.fillStyle = c; wrap(x, () => { x.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * 7, r = R(15, 45); x.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r); } x.fill(); }); } },
    runes(x) { fill(x, '#555'); x.strokeStyle = '#fff'; x.lineWidth = 3; for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const cx = i * 64 + 32, cy = j * 64 + 32; x.beginPath(); for (let k = 0; k < 4; k++) { x.moveTo(cx + R(-18, 18), cy + R(-22, 22)); x.lineTo(cx + R(-18, 18), cy + R(-22, 22)); } x.stroke(); } },
    eye(x) { const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); g.addColorStop(0, '#fff'); g.addColorStop(1, '#ddd'); x.fillStyle = g; x.fillRect(0, 0, S, S); x.strokeStyle = 'rgba(160,30,30,.35)'; for (let i = 0; i < 30; i++) { x.lineWidth = 1; x.beginPath(); x.moveTo(R(0, S), R(0, S)); x.lineTo(R(0, S), R(0, S)); x.stroke(); } },
    screen(x) { fill(x, '#ddd'); for (let y = 0; y < S; y += 4) { x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, y, S, 2); } },
  };
  const texCache = {};
  function tex(T, kind) { if (texCache[kind]) return texCache[kind]; const [c, x] = cv(); seed = 7 + kind.length * 131; (G[kind] || G.plain)(x, kind === 'bigscales');
    if (kind === 'bigscales') G.scales(x, true); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return texCache[kind] = t; }
  // [key, name, category, texture, color, roughness, metalness, extra]
  const LIST = [
    ['skin', 'Skin', 'Skins & Scales', 'skin', 0x8a6a5a, .7, 0], ['scale', 'Lizard scales', 'Skins & Scales', 'scales', 0x5a7a4a, .55, 0], ['bigscale', 'Dragon scales', 'Skins & Scales', 'bigscales', 0x7a4a3a, .45, .1],
    ['plates', 'Armored plates', 'Skins & Scales', 'plates', 0x6a6a5a, .5, .05], ['snake', 'Snake pattern', 'Skins & Scales', 'snake', 0x9a8a5a, .45, 0], ['chitin', 'Insect chitin', 'Skins & Scales', 'chitin', 0x3a3a4a, .25, .2],
    ['fur', 'Fur', 'Skins & Scales', 'fur', 0x8a6a4a, .9, 0], ['tiger', 'Tiger stripes', 'Skins & Scales', 'stripes', 0xd08a3a, .8, 0], ['leopard', 'Leopard spots', 'Skins & Scales', 'spots', 0xd8b070, .8, 0],
    ['feather', 'Feathers', 'Skins & Scales', 'feather', 0xe8e0d0, .8, 0], ['membrane', 'Wing membrane', 'Skins & Scales', 'membrane', 0x7a3a3a, .6, 0, {side: 2, transparent: true, opacity: .92}],
    ['shark', 'Shark skin', 'Skins & Scales', 'skin', 0x6a7a8a, .4, 0], ['frog', 'Frog skin', 'Skins & Scales', 'slime', 0x4a9a3a, .25, 0], ['ghost', 'Ghost pale', 'Skins & Scales', 'skin', 0xd8e0e8, .6, 0],
    ['bone', 'Bone', 'Bone & Horn', 'bone', 0xe8dcc0, .75, 0], ['oldbone', 'Old bone', 'Bone & Horn', 'bone', 0xa8946a, .85, 0], ['bloodbone', 'Bloody bone', 'Bone & Horn', 'blood', 0xe8d8c0, .6, 0],
    ['horn', 'Horn', 'Bone & Horn', 'horn', 0x4a3e36, .5, 0], ['ivory', 'Ivory', 'Bone & Horn', 'horn', 0xf4ecd8, .35, 0], ['tooth', 'Tooth', 'Bone & Horn', 'bone', 0xf5f0e2, .3, 0],
    ['obsidian', 'Obsidian', 'Bone & Horn', 'crystal', 0x1a1a22, .1, .3],
    ['chrome', 'Shiny chrome', 'Metal', 'plain', 0xe8eef8, .14, 1], ['bluechrome', 'Blue chrome', 'Metal', 'plain', 0x6a9ae8, .1, 1], ['darkchrome', 'Black chrome', 'Metal', 'plain', 0x30343c, .1, 1],
    ['metal', 'Steel', 'Metal', 'brushed', 0xb8c0cc, .3, .85], ['darkmetal', 'Gunmetal', 'Metal', 'brushed', 0x3a3e46, .35, .8], ['gold', 'Gold', 'Metal', 'brushed', 0xe0b040, .25, 1],
    ['bronze', 'Bronze', 'Metal', 'brushed', 0xa86a3a, .35, .9], ['rust', 'Rusty metal', 'Metal', 'rust', 0x9a8a80, .8, .5], ['diamond', 'Diamond plate', 'Metal', 'diamond', 0xb0b8c0, .35, .85],
    ['hexmetal', 'Hex panels', 'Metal', 'hexpanel', 0x8a9098, .35, .7], ['damascus', 'Damascus steel', 'Metal', 'damascus', 0xb8bcc4, .25, .9], ['bloodmetal', 'Bloody metal', 'Metal', 'blood', 0xa8b0b8, .35, .7],
    ['paint', 'Mech paint (white)', 'Mech Paint', 'panels', 0xeef0f4, .4, .2], ['paint2', 'Mech paint (blue)', 'Mech Paint', 'panels', 0x2a5ad0, .4, .2], ['paintred', 'Mech paint (red)', 'Mech Paint', 'panels', 0xc8282a, .4, .2],
    ['paintyel', 'Mech paint (yellow)', 'Mech Paint', 'panels', 0xf0c020, .4, .2], ['paintblk', 'Mech paint (black)', 'Mech Paint', 'panels', 0x24262c, .35, .3], ['camo', 'Camo', 'Mech Paint', 'camo', 0x6a7a4a, .7, .1],
    ['rubber', 'Rubber / inner frame', 'Mech Paint', 'plain', 0x2a2a2e, .85, 0], ['screen', 'TV screen', 'Mech Paint', 'screen', 0x40e0ff, .2, 0, {emissive: 0x2090c0, emissiveIntensity: 1.2}],
    ['wood', 'Wood', 'Wood & Stone', 'wood', 0x8a5a30, .8, 0], ['darkwood', 'Dark wood', 'Wood & Stone', 'wood', 0x4a2e1a, .8, 0], ['stone', 'Stone', 'Wood & Stone', 'stone', 0x8a8a88, .9, 0],
    ['mossy', 'Mossy stone', 'Wood & Stone', 'stone', 0x5a7a4a, .9, 0], ['lavarock', 'Lava rock', 'Wood & Stone', 'lava', 0xffffff, .8, 0, {emissive: 0xff4a10, emissiveIntensity: 1.2, emap: true}],
    ['leather', 'Leather', 'Cloth & Leather', 'leather', 0x6a4a30, .7, 0], ['cloth', 'Cloth', 'Cloth & Leather', 'cloth', 0x6a3a8a, .9, 0], ['robe', 'Wizard robe', 'Cloth & Leather', 'runes', 0x3a2a7a, .8, 0],
    ['flesh', 'Raw flesh', 'Gooey', 'skin', 0xb04a4a, .35, 0], ['slime', 'Ooze', 'Gooey', 'slime', 0x7aff4a, .1, 0, {transparent: true, opacity: .85, emissive: 0x2a8a10, emissiveIntensity: .5}],
    ['tar', 'Black tar', 'Gooey', 'slime', 0x15151a, .05, .2], ['blood', 'Blood', 'Gooey', 'blood', 0x8a1010, .15, 0],
    ['crystal', 'Crystal (blue)', 'Glow & Crystal', 'crystal', 0x8fd4ff, .1, .1, {emissive: 0x2a7aff, emissiveIntensity: .6, transparent: true, opacity: .9, flat: true}],
    ['crystalred', 'Crystal (red)', 'Glow & Crystal', 'crystal', 0xff7a7a, .1, .1, {emissive: 0xff2a2a, emissiveIntensity: .6, transparent: true, opacity: .9, flat: true}],
    ['amethyst', 'Amethyst', 'Glow & Crystal', 'crystal', 0xc08aff, .1, .1, {emissive: 0x7a2aff, emissiveIntensity: .6, transparent: true, opacity: .9, flat: true}],
    ['gemblue', 'Blue orb gem', 'Glow & Crystal', 'crystal', 0x3a8aff, .05, .2, {emissive: 0x1a5aff, emissiveIntensity: 1.1}], ['gemred', 'Red orb gem', 'Glow & Crystal', 'crystal', 0xff3a4a, .05, .2, {emissive: 0xff1a2a, emissiveIntensity: 1.1}],
    ['gemgreen', 'Green orb gem', 'Glow & Crystal', 'crystal', 0x3aff8a, .05, .2, {emissive: 0x10c050, emissiveIntensity: 1.1}],
    ['eye', 'Eyeball', 'Glow & Crystal', 'eye', 0xffffff, .15, 0], ['glow', 'Glow (fire)', 'Glow & Crystal', 'plain', 0xffb070, .3, 0, {emissive: 0xff5a1a, emissiveIntensity: 2}],
    ['glowblue', 'Glow (energy)', 'Glow & Crystal', 'plain', 0x8ae0ff, .3, 0, {emissive: 0x20a0ff, emissiveIntensity: 2}], ['glowgreen', 'Glow (toxic)', 'Glow & Crystal', 'plain', 0xaaff7a, .3, 0, {emissive: 0x40ff20, emissiveIntensity: 2}],
    ['glowpurple', 'Glow (dark magic)', 'Glow & Crystal', 'plain', 0xd08aff, .3, 0, {emissive: 0x8a20ff, emissiveIntensity: 2}], ['runeglow', 'Glowing runes', 'Glow & Crystal', 'runes', 0x444455, .5, .3, {emissive: 0x40c0ff, emissiveIntensity: 1.5, emap: true}],
  ];
  const ALIAS = {paint2: 'paint2', fur: 'fur', feather: 'feather', stone: 'stone', wood: 'wood', cloth: 'cloth', leather: 'leather', chitin: 'chitin', glow: 'glow', screen: 'screen'};
  function makeMat(T, key, tint, tile) {
    const e = LIST.find(l => l[0] === key) || LIST[0], [, , , tk, col, rough, metal, ex = {}] = e, t = tex(T, tk);
    const m = new T.MeshStandardMaterial({color: col, roughness: rough, metalness: metal, side: ex.side === 2 ? T.DoubleSide : T.FrontSide, transparent: !!ex.transparent, opacity: ex.opacity ?? 1, flatShading: !!ex.flat});
    if (ex.emissive) { m.emissive = new T.Color(ex.emissive); m.emissiveIntensity = ex.emissiveIntensity; }
    if (tint && tint !== '#ffffff') m.color.multiply(new T.Color(tint));
    m.userData.key = key; m.userData.tile = tile || 1;
    m.onBeforeCompile = sh => {                                   // triplanar: texture from 3 directions, no UVs needed
      sh.uniforms.tpMap = {value: t}; sh.uniforms.tpScale = {value: .55 / (m.userData.tile || 1)}; sh.uniforms.tpEm = {value: ex.emap ? 1 : 0};
      sh.vertexShader = 'varying vec3 vTP; varying vec3 vTN;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vTP = transformed; vTN = objectNormal;');
      sh.fragmentShader = 'uniform sampler2D tpMap; uniform float tpScale; uniform float tpEm; varying vec3 vTP; varying vec3 vTN;\n' + sh.fragmentShader
        .replace('#include <map_fragment>', `vec3 bw = pow(abs(normalize(vTN)), vec3(4.0)); bw /= (bw.x + bw.y + bw.z + 1e-5);
          vec4 tpc = texture2D(tpMap, vTP.yz * tpScale) * bw.x + texture2D(tpMap, vTP.xz * tpScale) * bw.y + texture2D(tpMap, vTP.xy * tpScale) * bw.z;
          diffuseColor.rgb *= mix(tpc.rgb, vec3(1.0), tpEm);`)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= mix(1.0, smoothstep(0.35, 0.9, dot(tpc.rgb, vec3(.333))) * 2.5, tpEm);');
    };
    m.customProgramCacheKey = () => 'tp-' + key + '-' + (tile || 1);
    return m;
  }
  function addPattern(T, key, name, img) { const t = new T.Texture(img); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; texCache['pat:' + key] = t;
    if (!LIST.find(l => l[0] === key)) LIST.push([key, name, 'My Patterns', 'pat:' + key, 0xffffff, .6, 0]); }
  window.FORGE_MATS = {LIST, makeMat, tex, ALIAS, addPattern};
})();
