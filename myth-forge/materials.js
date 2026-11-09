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
  // which cells get dark marks for the bead / fish-scale skins
  function spotAt(cx, cy, kind) { const u = cx / S, v = cy / S, sn = Math.sin, n = sn(u * 13.1 + sn(v * 7.3) * 2) * sn(v * 11.7 + sn(u * 5.1) * 2);
    if (kind === 'blob') return n > .45; if (kind === 'ring') { const d = Math.abs(sn(u * 18) * sn(v * 18)); return d > .55 && d < .85; } if (kind === 'band') return Math.abs(sn(v * 9 + sn(u * 6) * .6)) > .85;
    if (kind === 'stripe') return sn(u * 10 + sn(v * 4)) > .6; if (kind === 'koi') return n > .25; return false; }
  const G = {
    plain(x) { fill(x, '#fff'); noiseLayer(x, 60, 20, 80, ['#ddd', '#fff'], .2); },
    // ---- creature skins (Nov 9 2026). Grey-scale patterns; color comes from the material, so the same pattern makes many skins.
    beads(x, o = {}) { fill(x, o.bg || '#9a9a9a'); const n = o.n || 34, w = S / n;
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { const cx = i * w + (j % 2) * w / 2 + R(-1, 1), cy = j * w * .87, r = w * R(.42, .56), sp = o.spots && spotAt(cx, cy, o.spots);
        const g = x.createRadialGradient(cx - r * .3, cy - r * .3, r * .1, cx, cy, r); g.addColorStop(0, sp ? '#5a5a5a' : '#ffffff'); g.addColorStop(1, sp ? '#202020' : '#8a8a8a');
        wrap(x, () => { x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }); } },
    gecko(x) { G.beads(x, {n: 40, spots: 'blob'}); },
    monitor(x) { G.beads(x, {n: 46, spots: 'ring'}); },
    iguana(x) { G.beads(x, {n: 30, spots: 'band'}); },
    chameleon(x) { G.beads(x, {n: 52, bg: '#b8b8b8', spots: 'stripe'}); },
    scutes(x) { fill(x, '#7a7a7a'); const rows = 6, cols = 5, w = S / cols, h = S / rows;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const px = i * w + (j % 2) * w * .5, py = j * h; wrap(x, () => { const g = x.createLinearGradient(px, py, px + w, py + h); g.addColorStop(0, '#e8e8e8'); g.addColorStop(1, '#8a8a8a');
        x.fillStyle = g; x.beginPath(); x.roundRect(px + 5, py + 5, w - 10, h - 10, 14); x.fill(); x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(px + w / 2, py + h / 2, w * .12, h * .25, 0, 0, 7); x.fill(); }); }
      for (let i = 0; i < 4000; i++) { x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(R(0, S), R(0, S), 2, 2); } },
    fishscale(x, o = {}) { fill(x, '#808080'); const n = o.n || 12, w = S / n;
      for (let row = -1; row <= n * 2.2; row++) for (let c = -1; c <= n; c++) { const cx = c * w + (row % 2) * w / 2, cy = row * w * .45, pat = o.koi ? spotAt(cx, cy, 'koi') : 0;
        const g = x.createRadialGradient(cx, cy - w * .2, w * .05, cx, cy, w * .7); g.addColorStop(0, pat ? '#3a3a3a' : '#ffffff'); g.addColorStop(.7, pat ? '#2a2a2a' : '#d0d0d0'); g.addColorStop(1, '#606060');
        wrap(x, () => { x.fillStyle = g; x.beginPath(); x.arc(cx, cy, w * .62, 0, Math.PI); x.fill(); x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 1.2; x.beginPath(); x.arc(cx, cy, w * .6, .2, Math.PI - .2); x.stroke(); }); } },
    koi(x) { G.fishscale(x, {n: 10, koi: 1}); },
    denticle(x) { fill(x, '#c4c4c4'); for (let i = 0; i < 9000; i++) { const px = R(0, S), py = R(0, S); x.fillStyle = rnd() < .5 ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.14)'; x.beginPath(); x.ellipse(px, py, 3.2, 1.6, .25, 0, 7); x.fill(); }
      for (let k = 0; k < 14; k++) { x.strokeStyle = 'rgba(0,0,0,.1)'; x.lineWidth = 2; x.beginPath(); const y = R(0, S); x.moveTo(0, y); for (let i = 0; i <= S; i += 32) x.lineTo(i, y + Math.sin(i * .02 + k) * 8); x.stroke(); } },
    whaleshark(x) { G.denticle(x); x.fillStyle = 'rgba(255,255,255,.85)'; for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) { const px = i * S / 9 + (j % 2) * S / 18 + R(-6, 6), py = j * S / 9 + R(-6, 6); wrap(x, () => { x.beginPath(); x.arc(px, py, R(6, 11), 0, 7); x.fill(); }); }
      x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 4; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(0, i * S / 9 + S / 18); x.lineTo(S, i * S / 9 + S / 18); x.stroke(); } },
    whale(x) { fill(x, '#b0b0b0'); noiseLayer(x, 120, 30, 120, ['#9a9a9a', '#c4c4c4', '#a4a4a4'], .35);
      for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(255,255,255,${R(.15, .45)})`; x.lineWidth = R(1, 3); x.beginPath(); const px = R(0, S), py = R(0, S); x.moveTo(px, py); x.lineTo(px + R(-60, 60), py + R(10, 50)); x.stroke(); }
      for (let k = 0; k < 6; k++) { const cx = R(0, S), cy = R(0, S); for (let i = 0; i < 40; i++) { const px = cx + R(-40, 40), py = cy + R(-30, 30), r = R(3, 8); wrap(x, () => { x.fillStyle = '#e8e8e8'; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); x.fillStyle = '#5a5a5a'; x.beginPath(); x.arc(px, py, r * .4, 0, 7); x.fill(); }); } } },
    papillae(x, o = {}) { fill(x, '#a0a0a0'); noiseLayer(x, 90, 30, 90, ['#7a7a7a', '#c8c8c8'], .35);
      for (let i = 0; i < 700; i++) { const px = R(0, S), py = R(0, S), r = R(2, 9); wrap(x, () => { const g = x.createRadialGradient(px - r * .3, py - r * .3, 1, px, py, r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, 'rgba(90,90,90,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); }); }
      if (o.rings) { for (let i = 0; i < 26; i++) { const px = R(0, S), py = R(0, S), r = R(12, 22); wrap(x, () => { x.strokeStyle = '#1a1a1a'; x.lineWidth = 7; x.beginPath(); x.arc(px, py, r, 0, 7); x.stroke(); x.strokeStyle = '#ffffff'; x.lineWidth = 3; x.beginPath(); x.arc(px, py, r, 0, 7); x.stroke(); }); } }
      if (o.chroma) { for (let i = 0; i < 900; i++) { const px = R(0, S), py = R(0, S), r = R(1.5, 6); wrap(x, () => { x.fillStyle = `rgba(30,30,30,${R(.3, .8)})`; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); }); } }
      if (o.stripes) { for (let k = 0; k < 8; k++) { x.fillStyle = 'rgba(20,20,20,.75)'; const y = k * S / 8; x.beginPath(); x.moveTo(0, y); for (let i = 0; i <= S; i += 16) x.lineTo(i, y + Math.sin(i * .03 + k) * 10); x.lineTo(S, y + 26); x.lineTo(0, y + 26); x.fill(); } } },
    octopus(x) { G.papillae(x); }, blueringed(x) { G.papillae(x, {rings: 1}); }, squid(x) { G.papillae(x, {chroma: 1}); }, mimic(x) { G.papillae(x, {stripes: 1}); },
    silk(x) { fill(x, '#d8d8d8'); for (let i = 0; i < 520; i++) { const y = R(-40, S + 40), a = R(-.35, .35); x.strokeStyle = `rgba(${rnd() < .6 ? '255,255,255' : '150,150,150'},${R(.25, .7)})`; x.lineWidth = R(.6, 2.4);
      x.beginPath(); for (let k = 0; k <= 8; k++) { const px = k * S / 8; x.lineTo(px, y + Math.tan(a) * px + Math.sin(k + i) * 3); } x.stroke(); } },
    grub(x) { fill(x, '#dcdcdc'); for (let k = 0; k < S; k += 42) { const g = x.createLinearGradient(0, k, 0, k + 42); g.addColorStop(0, '#9a9a9a'); g.addColorStop(.2, '#f2f2f2'); g.addColorStop(.85, '#d0d0d0'); g.addColorStop(1, '#8a8a8a'); x.fillStyle = g; x.fillRect(0, k, S, 42); }
      for (let i = 0; i < 2500; i++) { x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(R(0, S), R(0, S), 2, 2); } },
    scratch(x, o = {}) { fill(x, '#000'); for (let i = 0; i < (o.n || 160); i++) { const px = R(0, S), py = R(0, S), a = R(0, Math.PI), L = R(20, o.L || 140); x.strokeStyle = `rgba(255,255,255,${R(.5, 1)})`; x.lineWidth = R(.6, o.w || 2.2);
      wrap(x, () => { x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * L * .5 + R(-8, 8), py + Math.sin(a) * L * .5 + R(-8, 8), px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke(); }); } },
    claws(x) { fill(x, '#000'); for (let k = 0; k < 7; k++) { const px = R(0, S), py = R(0, S), a = R(-.5, .5) + Math.PI / 3, L = R(140, 240);
      for (let j = 0; j < 4; j++) { x.strokeStyle = '#fff'; x.lineWidth = 9 - j * .5; x.lineCap = 'round'; const ox = Math.cos(a + Math.PI / 2) * j * 20, oy = Math.sin(a + Math.PI / 2) * j * 20;
        wrap(x, () => { x.beginPath(); x.moveTo(px + ox, py + oy); x.lineTo(px + ox + Math.cos(a) * L, py + oy + Math.sin(a) * L); x.stroke(); }); } } },
    chips(x) { fill(x, '#000'); for (let i = 0; i < 90; i++) { const px = R(0, S), py = R(0, S), r = R(4, 22); x.fillStyle = '#fff'; wrap(x, () => { x.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * 7, rr2 = r * R(.5, 1.1); x.lineTo(px + Math.cos(a) * rr2, py + Math.sin(a) * rr2); } x.fill(); }); } },
    jade(x) { fill(x, '#cfcfcf'); noiseLayer(x, 140, 30, 140, ['#b4b4b4', '#e6e6e6', '#c0c0c0'], .3); noiseLayer(x, 60, 10, 40, ['#f4f4f4', '#a8a8a8'], .25);
      for (let k = 0; k < 10; k++) { x.strokeStyle = `rgba(255,255,255,${R(.15, .35)})`; x.lineWidth = R(1, 3); x.beginPath(); let px = R(0, S), py = R(0, S); x.moveTo(px, py); for (let i = 0; i < 8; i++) { px += R(-40, 40); py += R(10, 50); x.lineTo(px, py); } x.stroke(); } },
    sand(x) { fill(x, '#d9d9d9'); for (let k = 0; k < S; k += 9) { x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= S; i += 16) x.lineTo(i, k + Math.sin(i * .03 + k) * 4); x.stroke(); }
      for (let i = 0; i < 26000; i++) { const v = (R(120, 255)) | 0; x.fillStyle = `rgba(${v},${v},${v},${R(.35, .9)})`; x.fillRect(R(0, S), R(0, S), R(1, 2.6), R(1, 2.6)); } },
    leaf(x) { fill(x, '#cfcfcf'); noiseLayer(x, 80, 20, 60, ['#bbb', '#e6e6e6'], .25); x.strokeStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < 9; k++) { const cx = R(0, S), cy = R(0, S); x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + 120, cy - 120); x.stroke();
      x.lineWidth = 1.5; for (let j = 1; j < 6; j++) { const px = cx + j * 20, py = cy - j * 20; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 26, py + 4); x.moveTo(px, py); x.lineTo(px - 4, py - 26); x.stroke(); } } },
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
    stained(x) { const pts = [...Array(46)].map(() => [R(0, S), R(0, S)]), cols = ['#d42a2a', '#2a5ad4', '#e8c02a', '#2ab45a', '#8a2ad4', '#e8782a', '#2ac8d4'], img = x.createImageData(S, S), cIdx = pts.map(() => (rnd() * cols.length) | 0);
      const rgb = cols.map(c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);
      for (let yy = 0; yy < S; yy++) for (let xx = 0; xx < S; xx++) { let d1 = 1e9, d2 = 1e9, k = 0; for (let i = 0; i < pts.length; i++) { let dx = Math.abs(xx - pts[i][0]), dy = Math.abs(yy - pts[i][1]); dx = Math.min(dx, S - dx); dy = Math.min(dy, S - dy); const d = dx * dx + dy * dy; if (d < d1) { d2 = d1; d1 = d; k = i; } else if (d < d2) d2 = d; }
        const edge = Math.sqrt(d2) - Math.sqrt(d1) < 5, o = (yy * S + xx) * 4, c = rgb[cIdx[k]], sh = .75 + .25 * Math.sin(xx * .05 + yy * .03);
        if (edge) { img.data[o] = img.data[o + 1] = img.data[o + 2] = 20; } else { img.data[o] = c[0] * sh; img.data[o + 1] = c[1] * sh; img.data[o + 2] = c[2] * sh; } img.data[o + 3] = 255; } x.putImageData(img, 0, 0); },
    // ---- craft / toy-box textures (ours, made in code)
    cardboard(x) { fill(x, '#d8d8d8'); for (let y = 0; y < S; y += 16) { const g = x.createLinearGradient(0, y, 0, y + 16); g.addColorStop(0, 'rgba(0,0,0,.10)'); g.addColorStop(.5, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,.10)'); x.fillStyle = g; x.fillRect(0, y, S, 16); }
      for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(${rnd() < .5 ? '0,0,0' : '255,255,255'},.08)`; x.fillRect(R(0, S), R(0, S), R(2, 9), 1); }
      x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(0, 300, S, 46); x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, 300, S, 2); x.fillRect(0, 344, S, 2); noiseLayer(x, 30, 30, 90, ['#bbb', '#eee'], .15); },
    polystyrene(x) { fill(x, '#e4e4e4'); for (let i = 0; i < 1400; i++) { const px = R(0, S), py = R(0, S), r = R(6, 13); wrap(x, () => { const g = x.createRadialGradient(px - r * .3, py - r * .3, 1, px, py, r); g.addColorStop(0, '#ffffff'); g.addColorStop(.8, '#e6e6e6'); g.addColorStop(1, '#b8b8b8');
        x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); }); } },
    sponge(x) { fill(x, '#e0e0e0'); noiseLayer(x, 120, 10, 40, ['#f4f4f4', '#c8c8c8'], .3); for (let i = 0; i < 900; i++) { const px = R(0, S), py = R(0, S), r = R(1.5, 7); x.fillStyle = `rgba(40,40,40,${R(.25, .6)})`; wrap(x, () => { x.beginPath(); x.ellipse(px, py, r, r * R(.6, 1), R(0, 3), 0, 7); x.fill(); }); } },
    felt(x) { fill(x, '#cfcfcf'); x.lineCap = 'round'; for (let i = 0; i < 14000; i++) { const px = R(0, S), py = R(0, S), a = R(0, 7), l = R(3, 9), v = (R(150, 245)) | 0; x.strokeStyle = `rgba(${v},${v},${v},.35)`; x.lineWidth = R(.6, 1.4);
        x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + R(-4, 4), py + R(-4, 4), px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } },
    knit(x) { fill(x, '#9a9a9a'); const w = 32, h = 28; for (let j = 0; j < S / h; j++) for (let i = 0; i < S / w; i++) { const cx = i * w + w / 2, cy = j * h;
        for (const s of [-1, 1]) { const g = x.createLinearGradient(cx, cy, cx + s * w * .45, cy + h); g.addColorStop(0, '#e8e8e8'); g.addColorStop(1, '#a8a8a8'); x.fillStyle = g;
          x.beginPath(); x.ellipse(cx + s * w * .24, cy + h * .55, w * .22, h * .62, s * -.5, 0, 7); x.fill(); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1.5; x.stroke(); } } },
    burlap(x) { fill(x, '#a8a8a8'); for (let i = 0; i < S; i += 10) { const v = (R(170, 230)) | 0; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i + R(-1, 1), 0, R(5, 7), S); }
      for (let j = 0; j < S; j += 10) for (let i = 0; i < S; i += 20) { const v = (R(160, 225)) | 0; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i + ((j / 10) % 2) * 10, j + R(-1, 1), 10, R(5, 7)); }
      for (let i = 0; i < 1200; i++) { x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = .7; const px = R(0, S), py = R(0, S); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R(-8, 8), py + R(-8, 8)); x.stroke(); } },
    denim(x) { fill(x, '#b0b0b0'); for (let k = -S; k < S * 2; k += 5) { x.strokeStyle = rnd() < .5 ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.18)'; x.lineWidth = 2; x.beginPath(); x.moveTo(k, 0); x.lineTo(k + S * .45, S); x.stroke(); }
      noiseLayer(x, 50, 30, 100, ['#fff', '#888'], .15); x.setLineDash([10, 7]); x.strokeStyle = '#e8c070'; x.lineWidth = 3; for (const y of [120, 132, 380, 392]) { x.beginPath(); x.moveTo(0, y); x.lineTo(S, y); x.stroke(); } x.setLineDash([]); },
    patchwork(x) { const cols = ['#d84a3a', '#3a7ad8', '#e8c040', '#4aa85a', '#9a4ad0', '#e8883a', '#e8e0d0', '#3ab0b8'], n = 4, w = S / n;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = cols[(i * 3 + j * 5 + ((rnd() * 2) | 0)) % cols.length]; x.fillRect(i * w, j * w, w, w);
        const k = (i + j) % 3; x.fillStyle = 'rgba(255,255,255,.18)'; if (k === 0) for (let d = 0; d < w; d += 16) x.fillRect(i * w + d, j * w, 7, w); else if (k === 1) for (let a = 0; a < 9; a++) { x.beginPath(); x.arc(i * w + R(10, w - 10), j * w + R(10, w - 10), R(4, 10), 0, 7); x.fill(); } }
      for (let i = 0; i < 1500; i++) { x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(R(0, S), R(0, S), 2, 2); }
      x.setLineDash([9, 7]); x.strokeStyle = '#f4ecd8'; x.lineWidth = 3; for (let k = 0; k <= n; k++) for (const o of [-6, 6]) { x.beginPath(); x.moveTo(k * w + o, 0); x.lineTo(k * w + o, S); x.moveTo(0, k * w + o); x.lineTo(S, k * w + o); x.stroke(); } x.setLineDash([]);
      x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 2; for (let k = 0; k <= n; k++) { x.beginPath(); x.moveTo(k * w, 0); x.lineTo(k * w, S); x.moveTo(0, k * w); x.lineTo(S, k * w); x.stroke(); } },
    stitched(x) { G.felt(x); x.setLineDash([12, 8]); x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 3.5; for (const y of [64, 192, 320, 448]) { x.beginPath(); x.moveTo(0, y); for (let xx = 0; xx <= S; xx += 64) x.lineTo(xx, y + Math.sin(xx * .05) * 6); x.stroke(); } x.setLineDash([]);
      for (let i = 0; i < 6; i++) { const px = R(40, S - 40), py = R(40, S - 40); x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 3; for (const d of [-1, 1]) { x.beginPath(); x.moveTo(px - 9, py - 9 * d); x.lineTo(px + 9, py + 9 * d); x.stroke(); } } },
    paper(x) { fill(x, '#ececec'); const pts = [...Array(40)].map(() => [R(0, S), R(0, S)]); for (let i = 0; i < 90; i++) { const [a, b] = pts[(rnd() * pts.length) | 0], [c2, d] = pts[(rnd() * pts.length) | 0];
        const g = x.createLinearGradient(a, b, c2, d); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, rnd() < .5 ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.strokeStyle = g; x.lineWidth = R(1, 3); x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke(); }
      noiseLayer(x, 60, 20, 80, ['#ddd', '#fff'], .2); },
    zebra(x) { fill(x, '#f0f0f0'); x.fillStyle = '#151515'; for (let i = 0; i < 16; i++) { const x0 = i * 32 + R(-5, 5); x.beginPath(); x.moveTo(x0, 0);
        for (let y = 0; y <= S; y += 32) x.lineTo(x0 + Math.sin(y * .02 + i) * 14 + R(-4, 4), y); for (let y = S; y >= 0; y -= 32) x.lineTo(x0 + 9 + R(0, 9) + Math.sin(y * .02 + i) * 14, y); x.fill(); } G.fur_over(x); },
    giraffe(x) { fill(x, '#f2e6c8'); const pts = [...Array(26)].map(() => [R(0, S), R(0, S)]); x.fillStyle = '#8a4a1e';
      for (const [a, b] of pts) wrap(x, () => { x.beginPath(); for (let k = 0; k < 7; k++) { const an = k / 7 * 7, r = R(30, 46); x.lineTo(a + Math.cos(an) * r, b + Math.sin(an) * r); } x.fill(); }); G.fur_over(x); },
    dalmatian(x) { fill(x, '#f4f4f4'); for (let i = 0; i < 60; i++) { const px = R(0, S), py = R(0, S), r = R(5, 16); x.fillStyle = '#111'; wrap(x, () => { x.beginPath(); x.ellipse(px, py, r, r * R(.7, 1), R(0, 3), 0, 7); x.fill(); }); } G.fur_over(x); },
    wolf(x) { const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, '#3a3a3a'); g.addColorStop(.5, '#9a9a9a'); g.addColorStop(1, '#f0f0f0'); x.fillStyle = g; x.fillRect(0, 0, S, S); G.fur_over(x, 1.4); },
    calico(x) { fill(x, '#f4f0ea'); for (const c of ['#d8803a', '#1a1a1a']) for (let i = 0; i < 9; i++) { const px = R(0, S), py = R(0, S); x.fillStyle = c; wrap(x, () => { x.beginPath(); for (let k = 0; k < 10; k++) { const an = k / 10 * 7, r = R(30, 70); x.lineTo(px + Math.cos(an) * r, py + Math.sin(an) * r); } x.fill(); }); } G.fur_over(x); },
    shaggy(x) { fill(x, '#8a8a8a'); x.lineCap = 'round'; for (let i = 0; i < 6000; i++) { const px = R(0, S), py = R(0, S), l = R(22, 48), a = R(1.35, 1.75) + Math.sin(px * .02) * .2, v = (R(100, 255)) | 0;
        x.strokeStyle = `rgba(${v},${v},${v},.5)`; x.lineWidth = R(1.5, 3.5); wrap(x, () => { x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l * .5 + R(-6, 6), py + Math.sin(a) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }); } },
    fur_over(x, k = 1) { x.lineCap = 'round'; for (let i = 0; i < 5000; i++) { const px = R(0, S), py = R(0, S), l = R(6, 16) * k, a = R(1.3, 1.8), v = rnd() < .5 ? '255,255,255' : '0,0,0';
        x.strokeStyle = `rgba(${v},.13)`; x.lineWidth = R(1, 2); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } },
    // ---- candy (ours, made in code)
    candycane(x) { fill(x, '#f6f2f0'); x.fillStyle = '#d81e2a'; for (let k = -S; k < S * 2; k += 64) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 26, 0); x.lineTo(k + 26 + S, S); x.lineTo(k + S, S); x.fill(); }
      x.fillStyle = '#2a9a4a'; for (let k = -S + 32; k < S * 2; k += 128) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 8, 0); x.lineTo(k + 8 + S, S); x.lineTo(k + S, S); x.fill(); } noiseLayer(x, 30, 40, 120, ['#fff'], .12); },
    peppermint(x) { fill(x, '#f6f2f0'); const n = 2, w = S / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const cx = i * w + w / 2, cy = j * w + w / 2;
        for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; x.fillStyle = k % 2 ? '#f6f2f0' : '#d81e2a'; x.beginPath(); x.moveTo(cx, cy); for (let t = 0; t <= 1.001; t += .1) { const r = t * w * .46, aa = a + t * 1.2; x.lineTo(cx + Math.cos(aa) * r, cy + Math.sin(aa) * r); }
          for (let t = 1; t >= 0; t -= .1) { const r = t * w * .46, aa = a + Math.PI / 4 + t * 1.2; x.lineTo(cx + Math.cos(aa) * r, cy + Math.sin(aa) * r); } x.fill(); } } },
    sprinkles(x, base) { fill(x, base || '#f4a8c8'); noiseLayer(x, 40, 30, 90, ['#fff', '#e888b0'], .2); const cols = ['#ff4040', '#40a0ff', '#ffe040', '#40d070', '#ffffff', '#b060ff', '#ff9a30'];
      for (let i = 0; i < 520; i++) { const px = R(0, S), py = R(0, S), a = R(0, 3.2); x.strokeStyle = cols[(rnd() * cols.length) | 0]; x.lineWidth = 6; x.lineCap = 'round'; wrap(x, () => { x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 14, py + Math.sin(a) * 14); x.stroke(); }); } },
    glazed(x) { G.sprinkles(x, '#6a3a1e'); },
    chocolate(x) { fill(x, '#5a3018'); const n = 4, w = S / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const px = i * w, py = j * w, g = x.createLinearGradient(px, py, px + w, py + w);
        g.addColorStop(0, '#8a5230'); g.addColorStop(.5, '#6a3a1e'); g.addColorStop(1, '#3a1c0c'); x.fillStyle = g; x.fillRect(px + 8, py + 8, w - 16, w - 16); x.fillStyle = '#7a4626'; x.fillRect(px + 20, py + 20, w - 40, w - 40); } },
    cottoncandy(x) { fill(x, '#f8c8e0'); noiseLayer(x, 260, 15, 70, ['#ffffff', '#b8d8ff', '#ffb0d8', '#e8c8ff'], .35); x.lineCap = 'round'; for (let i = 0; i < 2500; i++) { x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 1; const px = R(0, S), py = R(0, S); x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + R(-20, 20), py + R(-20, 20), px + R(-30, 30), py + R(-30, 30)); x.stroke(); } },
    marshmallow(x) { fill(x, '#fbf4f0'); noiseLayer(x, 160, 10, 60, ['#ffffff', '#f0e0e4', '#fde8ee'], .4); for (let i = 0; i < 3000; i++) { x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(R(0, S), R(0, S), 2, 2); } },
    honeycomb(x) { fill(x, '#b8701a'); const r = 30; for (let j = -1; j < S / (r * 1.5) + 1; j++) for (let i = -1; i < S / (r * 1.73) + 1; i++) { const cx = i * r * 1.73 + (j % 2) * r * .86, cy = j * r * 1.5;
        x.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; x.lineTo(cx + Math.cos(a) * r * .82, cy + Math.sin(a) * r * .82); } x.closePath();
        const g = x.createRadialGradient(cx, cy, 2, cx, cy, r); g.addColorStop(0, '#ffd870'); g.addColorStop(1, '#e09a28'); x.fillStyle = g; x.fill(); } },
    waffle(x) { fill(x, '#d8a058'); x.strokeStyle = '#a86a28'; x.lineWidth = 14; for (let k = -S; k < S * 2; k += 64) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + S, S); x.stroke(); x.beginPath(); x.moveTo(k, S); x.lineTo(k + S, 0); x.stroke(); }
      noiseLayer(x, 80, 10, 40, ['#f0c070', '#9a5a20'], .25); },
    licorice(x) { fill(x, '#141012'); for (let k = -S; k < S * 2; k += 40) { const g = x.createLinearGradient(k, 0, k + 40, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g;
        x.save(); x.transform(1, 0, .6, 1, 0, 0); x.fillRect(k - S, 0, 40, S); x.restore(); } },
    jellybean(x) { fill(x, '#ffffff'); noiseLayer(x, 50, 30, 100, ['#f0f0f0', '#ffffff'], .3); for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(${rnd() < .5 ? '120,20,60' : '255,255,255'},.55)`; x.beginPath(); x.arc(R(0, S), R(0, S), R(1.5, 4), 0, 7); x.fill(); } },
    caramel(x) { fill(x, '#c8781e'); noiseLayer(x, 120, 20, 90, ['#f0a040', '#8a4a10', '#ffd080'], .35); x.strokeStyle = 'rgba(255,220,150,.35)'; for (let i = 0; i < 40; i++) { x.lineWidth = R(2, 6); x.beginPath(); let px = R(0, S), py = R(0, S); x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += R(-40, 40); py += R(10, 40); x.lineTo(px, py); } x.stroke(); } },
    lollipop(x) { const cols = ['#ff4a4a', '#ffa030', '#ffe840', '#50d060', '#40a8ff', '#a060ff']; for (let k = -S, i = 0; k < S * 2; k += 32, i++) { x.fillStyle = cols[((i % cols.length) + cols.length) % cols.length]; x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 32, 0); x.lineTo(k + 32 + S, S); x.lineTo(k + S, S); x.fill(); } },
    frosting(x) { fill(x, '#f8f0e8'); x.strokeStyle = 'rgba(200,170,150,.35)'; x.lineWidth = 3; for (let y = 10; y < S; y += 22) { x.beginPath(); for (let xx = 0; xx <= S; xx += 16) x.lineTo(xx, y + Math.sin(xx * .05 + y) * 8); x.stroke(); } noiseLayer(x, 60, 20, 80, ['#ffffff'], .3); },
    moldplastic(x) { fill(x, '#f2f2f2'); noiseLayer(x, 50, 30, 120, ['#ffffff', '#e4e4e4'], .25); for (let i = 0; i < 600; i++) { x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(R(0, S), R(0, S), 2, 2); } },
    frost(x) { fill(x, '#eef4fa'); noiseLayer(x, 300, 3, 18, ['#ffffff', '#c8d4e0'], .35); },
    screen(x) { fill(x, '#ddd'); for (let y = 0; y < S; y += 4) { x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, y, S, 2); } },
  };
  // ---- cosmic & special skins (shader effects, ours). "sky" skins are a window into space: the stars stay put while the model moves, like galaxy skins in games.
  const FX_T = {value: 0};
  const FX_GLSL = `
float h3(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y), mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = .5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + 1.7; a *= .5; } return s; }
float stars(vec3 d, float dens, float t){ vec3 c = floor(d), f = fract(d) - .5; float h = h3(c); vec3 o = vec3(h3(c + 3.1), h3(c + 7.7), h3(c + 1.3)) - .5;
  float r = length(f - o * .6); return step(1.0 - dens, h) * smoothstep(.13, .0, r) * (.55 + .45 * sin(t * 3.0 + h * 40.0)); }
vec3 hue(float h){ return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
`;
  const FX_MAIN = `{
  vec3 Vd = normalize(vViewPosition); float ndv = abs(dot(normalize(normal), Vd)), fr = pow(1.0 - ndv, 2.0);
  vec3 q = uSky > .5 ? normalize(vWP - cameraPosition) * 3.0 + vWP * .02 : vTP * .45; float t = uT; vec3 fx = vec3(0.0); float base = .012;
  if (uFx == 1) { float n = fbm(q * 1.5 + vec3(0.0, 0.0, t * .03)), n2 = fbm(q * 3.2 + 5.0);
    fx = vec3(.006, .004, .02) + vec3(.3, .06, .5) * smoothstep(.5, .85, n) + vec3(.05, .25, .7) * smoothstep(.62, .9, n2) * .8 + vec3(.9, .3, .6) * smoothstep(.75, .95, n) * .5;
    fx += vec3(1.0) * (stars(q * 20.0, .07, t) * 3.0 + stars(q * 55.0, .12, t * 1.3) * 1.5) + vec3(.45, .3, 1.0) * fr * .35; }
  else if (uFx == 2) { fx = vec3(.002, .002, .008) + vec3(1.0) * (stars(q * 18.0, .06, t) * 3.5 + stars(q * 45.0, .1, t * 1.4) * 1.8 + stars(q * 110.0, .16, t * .7) * .8) + vec3(.3, .4, .9) * fr * .12; }
  else if (uFx == 3) { float n = fbm(q * 1.2 + t * .02), m = fbm(q * 2.4 - 3.0);
    fx = vec3(.01, .0, .02) + vec3(1.0, .2, .5) * smoothstep(.48, .85, n) + vec3(.1, .7, .9) * smoothstep(.58, .9, m) * .8 + vec3(1.0) * stars(q * 25.0, .08, t) * 2.5; }
  else if (uFx == 4) { fx = vec3(.004, .004, .014) + vec3(.01, .02, .06) * fbm(q * 2.0); vec3 c = floor(q * 6.0), f = fract(q * 6.0) - .5; float h = h3(c);
    fx += vec3(1.0, .8, .35) * (stars(q * 6.0, .55, t) * 4.0 + stars(q * 30.0, .1, t) * 1.5);
    float ln = smoothstep(.02, .0, abs(f.x + f.y * (h - .5) * 2.0) * .5) * step(.6, h) * step(abs(f.y), .45); fx += vec3(.9, .7, .3) * ln * .5; }
  else if (uFx == 5) { float y = q.y * .8 + fbm(q * .8 + vec3(0.0, t * .15, 0.0)) * 2.0; float b = pow(abs(sin(y * 3.0 + t * .4)), 6.0);
    fx = vec3(.0, .006, .012) + mix(vec3(.1, 1.0, .5), vec3(.6, .2, 1.0), .5 + .5 * sin(y + t * .3)) * b * 1.4 + vec3(1.0) * stars(q * 30.0, .05, t) * .6; }
  else if (uFx == 6) { float sw = fbm(vec3(atan(q.x, q.z) * 2.0 + t * .3, q.y * 1.5, length(q.xz) - t * .2));
    fx = vec3(.0) + vec3(.55, .1, 1.0) * pow(fr, 1.5) * 2.2 + vec3(.9, .3, 1.0) * smoothstep(.62, .8, sw) * .5 * fr; base = .02; }
  else if (uFx == 7) { float sc = .5 + .5 * sin(vWP.y * 60.0 - t * 4.0); fx = hue(fr * 1.4 + vWP.y * .08 + t * .1) * (.25 + fr * 1.6) + vec3(.2, .9, 1.0) * sc * .18; base = .25; }
  else if (uFx == 8) { float n = fbm(q * 1.4); fx = hue(n * 2.0 + fr * 1.5 + t * .02) * (.12 + fr * .9); base = .03; }
  else if (uFx == 9) { float n = fbm(q * 3.0); vec3 c = floor(q * 14.0); fx = hue(h3(c) + fr + n) * smoothstep(.55, .9, vn(q * 14.0)) * .45 + hue(fr * 1.2 + n) * fr * .25; base = .6; }
  else if (uFx == 10) { float n = fbm(q * 2.0 + vec3(0.0, -t * .4, t * .1)), m = fbm(q * 5.0 - vec3(0.0, t * .8, 0.0));
    fx = mix(vec3(1.0, .25, .0), vec3(1.0, .9, .3), smoothstep(.4, .75, n)) * (.8 + m) * 1.3 + vec3(1.0, .6, .2) * fr; base = .3; }
  else if (uFx == 11) { vec3 g = abs(fract(q * 2.0) - .5); float ln = smoothstep(.04, .0, min(min(g.x, g.y), g.z) - .0); float pulse = .5 + .5 * sin(q.y * 3.0 - t * 2.0);
    fx = vec3(.0, .02, .04) + vec3(.1, .9, 1.0) * ln * (.6 + pulse) + vec3(.9, .2, 1.0) * fr * .5; base = .05; }
  else if (uFx == 12 || uFx == 13) { vec3 w = q * (uFx == 12 ? 1.6 : 1.0) + vec3(t * .05, -t * .08, t * .04); float n = fbm(w), c = pow(1.0 - abs(fbm(w * 2.2 + 3.0) * 2.0 - 1.0), 6.0);
    vec3 deep = uFx == 12 ? vec3(.0, .12, .3) : vec3(.0, .02, .08); fx = deep * (.6 + n) + vec3(.4, .85, 1.0) * c * (uFx == 12 ? .7 : .25) + vec3(.5, .8, 1.0) * fr * .7;
    if (uFx == 13) fx += vec3(.2, 1.0, .9) * stars(q * 22.0, .05, t) * 2.0; base = .02; }
  else if (uFx == 14) { float n = fbm(q * 2.0), cr = smoothstep(.04, .0, abs(vn(q * 4.0) - .5)) + smoothstep(.03, .0, abs(vn(q * 9.0 + 2.0) - .5)) * .6;
    fx = vec3(.12, .3, .45) * (.4 + n * .6) + vec3(.7, .9, 1.0) * cr * .55 + vec3(.5, .8, 1.0) * fr * .6; base = .25; }
  else if (uFx == 15) { vec3 c = floor(q * 7.0 + vec3(0.0, t * .3, 0.0)), f = fract(q * 7.0 + vec3(0.0, t * .3, 0.0)) - .5; float b = smoothstep(.42, .3, length(f)) - smoothstep(.3, .2, length(f)) * .6;
    fx = vec3(.25, .35, .4) * (.5 + fbm(q * 3.0) * .5) + vec3(.8) * b * step(.35, h3(c)) * .6 + vec3(.6, .8, .9) * fr * .3; base = .5; }
  else if (uFx == 16) { float a1 = smoothstep(.035, .0, abs(fbm(q * 1.8 + vec3(floor(t * 8.0) * .37)) - .5)), a2 = smoothstep(.02, .0, abs(fbm(q * 3.5 - vec3(floor(t * 11.0) * .21)) - .5));
    fx = vec3(.02, .02, .06) + vec3(.6, .8, 1.0) * a1 * 3.0 + vec3(.8, .6, 1.0) * a2 * 1.5 + vec3(.3, .5, 1.0) * fr * .6; base = .02; }
  else if (uFx == 17) { float n = fbm(q * 1.5 + vec3(t * .2, t * .1, -t * .15)), m = sin(n * 12.0 + t * 2.0) * .5 + .5;
    fx = mix(vec3(.6, .1, 1.0), vec3(1.0, .3, .7), m) * (.5 + n) * 1.4 + vec3(1.0, .7, 1.0) * fr; base = .05; }
  else if (uFx == 18) { vec2 uv = q.xy * 3.0 + q.z * 1.7; uv.x *= 1.1547; uv.y += mod(floor(uv.x), 2.0) * .5; vec2 g = abs(fract(uv) - .5); float e = smoothstep(.06, .0, abs(max(g.x * 1.5 + g.y, g.y * 2.0) - .98) * .5);
    float pulse = .5 + .5 * sin(q.y * 4.0 - t * 3.0); fx = vec3(.0, .05, .08) + vec3(.2, .9, 1.0) * e * (.5 + pulse) + vec3(.3, .8, 1.0) * fr * 1.2; base = .03; }
  else if (uFx == 19) { float n = fbm(q * 1.2 + vec3(0.0, -t * .5, 0.0)), m = fbm(q * 2.6 + vec3(t * .1, -t * .9, 0.0));
    fx = vec3(.1, .9, .7) * smoothstep(.45, .8, n) * .9 + vec3(.6, 1.0, .9) * smoothstep(.6, .85, m) * .6 + vec3(.3, 1.0, .8) * fr; base = .02; }
  else if (uFx >= 20 && uFx <= 23) { float n = fbm(q * 1.8 + vec3(0.0, -t * 1.3, t * .2)), m = fbm(q * 4.0 + vec3(0.0, -t * 2.2, 0.0)), fl = smoothstep(.3, .9, n + m * .35);
    vec3 c0 = vec3(.6, .05, .0), c1 = vec3(1.0, .45, .05), c2 = vec3(1.0, .95, .5);
    if (uFx == 21) { c0 = vec3(.02, .1, .6); c1 = vec3(.1, .5, 1.0); c2 = vec3(.8, .95, 1.0); }
    if (uFx == 22) { c0 = vec3(.05, .0, .08); c1 = vec3(.45, .0, .7); c2 = vec3(.9, .5, 1.0); }
    if (uFx == 23) { float cr = smoothstep(.06, .0, abs(vn(q * 2.5) - .5)) * (.7 + .3 * sin(t * 2.0)); fx = vec3(.03, .02, .02) * fbm(q * 3.0) + mix(c1, c2, .4) * cr * 2.5; base = .06; }
    else { fx = mix(mix(c0, c1, smoothstep(.0, .55, fl)), c2, smoothstep(.55, 1.0, fl)) * (.22 + fl * .95) + c1 * fr * .4; base = .03; } }
  else if (uFx == 24) { fx = vec3(.03, .025, .02) * fbm(q * 4.0) + vec3(1.0, .45, .1) * stars(q * 14.0 + vec3(0.0, -t * .6, 0.0), .1, t) * 3.0 + vec3(1.0, .3, .05) * smoothstep(.62, .8, fbm(q * 2.0 - vec3(0.0, t * .2, 0.0))) * .5; base = .05; }
  else if (uFx == 25) { float n = fbm(q * 1.3 + vec3(0.0, t * .05, 0.0)); diffuseColor.rgb *= mix(vec3(1.0), hue(t * .04 + q.y * .12 + n * .9) * 1.7, .85); fx = hue(t * .04 + n + fr) * fr * .35; }
  else if (uFx == 26) { vec3 g = q * 9.0; vec3 c = floor(g); float h = h3(c), tw = pow(.5 + .5 * sin(t * (3.0 + h * 5.0) + h * 40.0 + dot(Vd, vec3(7.0, 11.0, 5.0)) * 6.0), 14.0);
    float fl = step(.55, h) * smoothstep(.35, .0, length(fract(g) - .5)); vec3 c2 = floor(q * 23.0); float h2 = h3(c2), tw2 = pow(.5 + .5 * sin(t * 4.0 + h2 * 50.0 + dot(Vd, vec3(13.0, 3.0, 9.0)) * 9.0), 18.0);
    fx = (diffuse * 2.2 + vec3(.6)) * fl * tw * 2.2 + vec3(1.0) * step(.7, h2) * tw2 * smoothstep(.3, .0, length(fract(q * 23.0) - .5)) * 1.6 + diffuse * fr * .25; }
  else if (uFx == 27) { float n = fbm(q * .9); vec3 sh = hue(fr * .9 + n * .35 + .55); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * (.75 + sh * .5), .6); fx = mix(sh, vec3(1.0), .45) * pow(fr, 1.4) * .55 + vec3(1.0) * pow(max(dot(normalize(normal), Vd), 0.0), 40.0) * .15; }
  else if (uFx == 28) { float n = fbm(q * 1.1 + vec3(t * .08, t * .03, -t * .05)), m = fbm(q * 2.3 - vec3(t * .12, 0.0, t * .06)); float d = smoothstep(.3, .85, n * .7 + m * .45);
    fx = (vec3(.75, .8, .88) * (.25 + d * .8) + vec3(.9, .95, 1.0) * fr * .25) * .5; diffuseColor.a *= .2 + d * .75; base = .35; }
  else if (uFx == 29) { float n = fbm(q * 1.0 + vec3(t * .1, 0.0, t * .04)), fl = step(.985, h3(vec3(floor(t * 6.0)))) + step(.993, h3(vec3(floor(t * 9.0) + 3.0))) * .7;
    float bolt = smoothstep(.03, .0, abs(fbm(q * 2.2 + vec3(floor(t * 6.0) * .37)) - .5)) * fl;
    fx = mix(vec3(.04, .045, .06), vec3(.3, .32, .38), smoothstep(.35, .8, n)) + vec3(.6, .7, 1.0) * fl * .5 * n + vec3(.8, .85, 1.0) * bolt * 4.0; base = .05; }
  else if (uFx == 30) { vec3 r = vec3(q.x * 30.0, q.y * 2.0 + t * 9.0, q.z * 30.0); float s2 = step(.93, h3(floor(vec3(r.x, r.y * .25, r.z)))) * smoothstep(.5, .0, abs(fract(r.y * .25) - .5) - .2);
    float n = fbm(q * 1.2 + vec3(t * .05, 0.0, 0.0)); fx = mix(vec3(.08, .1, .14), vec3(.22, .26, .32), n) + vec3(.6, .7, .85) * s2 * .9 + vec3(.4, .5, .7) * fr * .3; base = .06; }
  else if (uFx == 31) { vec3 g = q * 6.0 + vec3(sin(t * .7 + q.y) * .3, t * 1.4, 0.0); vec3 c = floor(g); float h = h3(c), f = smoothstep(.22, .0, length(fract(g) - .5 - (vec3(h3(c + 2.0), h3(c + 5.0), h3(c + 9.0)) - .5) * .5));
    vec3 g2 = q * 13.0 + vec3(0.0, t * 2.2, 0.0); float f2 = smoothstep(.18, .0, length(fract(g2) - .5)) * step(.6, h3(floor(g2)));
    fx = vec3(.2, .24, .32) * (.6 + fbm(q * 1.5) * .5) + vec3(1.0) * (f * step(.45, h) + f2 * .7) * .9; base = .15; }
  else if (uFx == 32) { float a = atan(q.x, q.z), sw = fbm(vec3(a * 1.5 + t * .9, q.y * 1.5 - t * .4, length(q.xz) * 2.0)), gr = h3(floor(q * 40.0 + vec3(t * 8.0, 0.0, 0.0)));
    fx = mix(vec3(.45, .3, .15), vec3(.95, .72, .4), smoothstep(.3, .8, sw)) * .8 + vec3(1.0, .85, .6) * step(.97, gr) * .6; base = .15; }
  else if (uFx == 33) { float a = atan(q.x, q.z), r = length(q.xz), sp = fbm(vec3(a * 2.0 - t * 2.5 + r * 3.0, q.y * 1.2 + t * .5, r));
    fx = mix(vec3(.15, .16, .18), vec3(.6, .62, .66), smoothstep(.35, .75, sp)) * (.7 + .3 * sin(a * 6.0 - t * 6.0 + q.y * 3.0)) + vec3(.7, .75, .8) * fr * .4; base = .1; }
  else if (uFx == 34) { float n = fbm(q * .9 + vec3(t * .06, 0.0, t * .03)), cl = smoothstep(.5, .78, n);
    fx = (mix(vec3(.25, .55, .95), vec3(1.0, 1.0, 1.0), cl) * (.85 + .15 * fbm(q * 3.0)) + vec3(1.0, .95, .8) * fr * .25) * .5; base = .3; }
  else if (uFx == 35) { float n = fbm(q * 1.4 + vec3(t * .15, -t * .1, 0.0)), f = pow(abs(sin(n * 9.0 + t * .6)), 10.0);
    fx = mix(vec3(.02, .02, .05), vec3(.2, .05, .3), n) + vec3(.6, .3, 1.0) * f * .8 + vec3(1.0) * stars(q * 20.0, .04, t) * 1.5; base = .03; }
  else if (uFx == 36) { vec3 g = abs(fract(vTP * 1.4) - .5); float ln = smoothstep(.025, .0, min(min(abs(g.x - .38), abs(g.y - .38)), abs(g.z - .38))) * step(.45, h3(floor(vTP * 1.4)));
    float pulse = .6 + .4 * sin(vTP.y * 2.0 - t * 2.5); fx = diffuse * 0.0 + vec3(.25, .75, 1.0) * ln * pulse * 1.6 + vec3(.5, .8, 1.0) * fr * .12; }
  else if (uFx == 37) { float n = fbm(q * 2.5 + vec3(0.0, t * .15, 0.0)), v = smoothstep(.04, .0, abs(vn(q * 5.0 + t * .1) - .5)); diffuseColor.rgb *= .7 + n * .6; fx = vec3(.5, .8, .1) * v * (.5 + .5 * sin(t * 2.0 + n * 6.0)) * .9 + vec3(.6, .7, .2) * fr * .2; }
  if (uFur > .5) fx *= .55 + diffuseColor.r * .9;
  if (uKeep > .5) totalEmissiveRadiance += fx; else { diffuseColor.rgb = (uFur > .5 ? diffuseColor.rgb * .2 : vec3(base)) + fx * .1; totalEmissiveRadiance += fx * diffuse; }
}`;
  const texCache = {};
  function tex(T, kind) { if (texCache[kind]) return texCache[kind];
    if (kind.startsWith('img:')) { const img = new Image(), t = new T.Texture(img); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;   // embedded picture textures (textures-*.js)
      img.onload = () => { t.needsUpdate = true; }; img.src = (window.FORGE_TEX || {})[kind.slice(4)] || ''; return texCache[kind] = t; } const [c, x] = cv(); seed = 7 + kind.length * 131; (G[kind] || G.plain)(x, kind === 'bigscales');
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
    ['glass', 'Clear glass', 'Glass', 'plain', 0xd8ecff, .02, .1, {transparent: true, opacity: .28, side: 2}], ['glassblue', 'Blue glass', 'Glass', 'plain', 0x6aa8ff, .02, .1, {transparent: true, opacity: .4, side: 2}],
    ['frosted', 'Frosted glass', 'Glass', 'frost', 0xe8f0f8, .5, 0, {transparent: true, opacity: .6, side: 2}], ['stained', 'Stained glass', 'Glass', 'stained', 0xffffff, .15, 0, {transparent: true, opacity: .85, side: 2, emissive: 0xffffff, emissiveIntensity: .7, ecol: true}],
    ['stainedsolid', 'Stained glass (solid)', 'Glass', 'stained', 0xffffff, .2, 0, {emissive: 0xffffff, emissiveIntensity: .4, ecol: true}], ['glassred', 'Ruby glass', 'Glass', 'plain', 0xff4a5a, .02, .1, {transparent: true, opacity: .45, side: 2}],
    ['eye', 'Eyeball', 'Glow & Crystal', 'eye', 0xffffff, .15, 0], ['glow', 'Glow (fire)', 'Glow & Crystal', 'plain', 0xffb070, .3, 0, {emissive: 0xff5a1a, emissiveIntensity: 2}],
    ['glowblue', 'Glow (energy)', 'Glow & Crystal', 'plain', 0x8ae0ff, .3, 0, {emissive: 0x20a0ff, emissiveIntensity: 2}], ['glowgreen', 'Glow (toxic)', 'Glow & Crystal', 'plain', 0xaaff7a, .3, 0, {emissive: 0x40ff20, emissiveIntensity: 2}],
    ['glowpurple', 'Glow (dark magic)', 'Glow & Crystal', 'plain', 0xd08aff, .3, 0, {emissive: 0x8a20ff, emissiveIntensity: 2}], ['runeglow', 'Glowing runes', 'Glow & Crystal', 'runes', 0x444455, .5, .3, {emissive: 0x40c0ff, emissiveIntensity: 1.5, emap: true}],
    ['cardboard', 'Cardboard', 'Craft (toy box)', 'cardboard', 0xb88a5a, .9, 0], ['cardwhite', 'White cardboard', 'Craft (toy box)', 'cardboard', 0xe8e2d6, .9, 0],
    ['polystyrene', 'Polystyrene foam', 'Craft (toy box)', 'polystyrene', 0xf4f4f0, .85, 0], ['sponge', 'Sponge', 'Craft (toy box)', 'sponge', 0xe8c84a, .95, 0], ['floaty', 'Pink floaty foam', 'Craft (toy box)', 'sponge', 0xf09ac0, .95, 0],
    ['felt', 'Felt', 'Craft (toy box)', 'felt', 0xc04a4a, 1, 0], ['feltgreen', 'Green felt', 'Craft (toy box)', 'felt', 0x4a9a5a, 1, 0], ['stitchfelt', 'Stitched felt', 'Craft (toy box)', 'stitched', 0x5a7ad0, 1, 0],
    ['knit', 'Knitted wool', 'Craft (toy box)', 'knit', 0xd8b890, .95, 0], ['sack', 'Sackcloth (burlap)', 'Craft (toy box)', 'burlap', 0xb89a6a, 1, 0], ['denim', 'Denim', 'Craft (toy box)', 'denim', 0x4a6a9a, .9, 0],
    ['patchwork', 'Patchwork quilt', 'Craft (toy box)', 'patchwork', 0xffffff, .95, 0], ['paper', 'Crumpled paper', 'Craft (toy box)', 'paper', 0xf0ece0, .9, 0],
    ['heroskin', 'Skin (tint it)', 'Tint-friendly (white)', 'skin', 0xf4ece6, .62, 0], ['herofur', 'Fur (tint it)', 'Tint-friendly (white)', 'fur', 0xf2ede6, .9, 0], ['herohair', 'Hair (tint it)', 'Tint-friendly (white)', 'fur', 0xf6f2ec, .5, 0],
    ['herolip', 'Lips', 'Skins & Scales', 'skin', 0xd8a8a0, .5, 0], ['herocloth', 'Cloth (tint it)', 'Tint-friendly (white)', 'plain', 0xf2f2f2, .88, 0], ['heroleather', 'Leather (tint it)', 'Tint-friendly (white)', 'leather', 0xe8dcd0, .62, 0],
    ['herometal', 'Metal (tint it)', 'Tint-friendly (white)', 'plain', 0xf2f4f8, .32, .8], ['eyebrown', 'Brown eye', 'Glow & Crystal', 'plain', 0x5a3a20, .2, 0], ['eyeblue', 'Blue eye', 'Glow & Crystal', 'plain', 0x3a7ac0, .2, 0],
    ['eyegreen', 'Green eye', 'Glow & Crystal', 'plain', 0x3a8a4a, .2, 0], ['eyegrey', 'Grey eye', 'Glow & Crystal', 'plain', 0x8a949e, .2, 0],
    ['zebra', 'Zebra', 'Fur', 'zebra', 0xffffff, .85, 0], ['giraffe', 'Giraffe', 'Fur', 'giraffe', 0xffffff, .85, 0], ['dalmatian', 'Dalmatian', 'Fur', 'dalmatian', 0xffffff, .85, 0],
    ['wolf', 'Wolf (dark back, light belly)', 'Fur', 'wolf', 0xd8d0c8, .9, 0], ['calico', 'Calico', 'Fur', 'calico', 0xffffff, .88, 0], ['shaggy', 'Shaggy long fur', 'Fur', 'shaggy', 0x9a7a5a, .95, 0],
    ['whitefur', 'Snow fur', 'Fur', 'fur', 0xf4f4f4, .9, 0], ['blackfur', 'Black fur', 'Fur', 'fur', 0x2a2a2e, .85, 0], ['redfox', 'Fox fur', 'Fur', 'fur', 0xd0682a, .88, 0],
    ['galaxy', 'Galaxy', 'Cosmic & Special', 'plain', 0xffffff, .35, .1, {fx: 1, sky: 1}], ['starfield', 'Starfield', 'Cosmic & Special', 'plain', 0xffffff, .3, .1, {fx: 2, sky: 1}],
    ['nebula', 'Nebula', 'Cosmic & Special', 'plain', 0xffffff, .4, 0, {fx: 3, sky: 1}], ['constellation', 'Constellations (gold)', 'Cosmic & Special', 'plain', 0xffffff, .3, .3, {fx: 4, sky: 1}],
    ['aurora', 'Aurora', 'Cosmic & Special', 'plain', 0xffffff, .5, 0, {fx: 5}], ['void', 'Void / black hole', 'Cosmic & Special', 'plain', 0xffffff, .25, .2, {fx: 6}],
    ['hologram', 'Hologram', 'Cosmic & Special', 'plain', 0xffffff, .2, .3, {fx: 7}], ['oilslick', 'Oil slick (rainbow sheen)', 'Cosmic & Special', 'plain', 0xffffff, .15, .9, {fx: 8}],
    ['opal', 'Opal', 'Cosmic & Special', 'plain', 0xffffff, .2, .1, {fx: 9}], ['solar', 'Sun plasma', 'Cosmic & Special', 'plain', 0xffffff, .6, 0, {fx: 10}],
    ['cybergrid', 'Cyber grid', 'Cosmic & Special', 'plain', 0xffffff, .4, .5, {fx: 11}], ['cosmicfur', 'Cosmic fur', 'Cosmic & Special', 'fur', 0xffffff, .8, 0, {fx: 1, sky: 1, furmix: 1}],
    ['bark1', 'Bark 1', 'Bark (Lynocs, CC0)', 'img:bark1', 0xffffff, .85, 0], ['bark2', 'Bark 2', 'Bark (Lynocs, CC0)', 'img:bark2', 0xffffff, .85, 0], ['bark3', 'Bark 3', 'Bark (Lynocs, CC0)', 'img:bark3', 0xffffff, .85, 0], ['bark4', 'Bark 4', 'Bark (Lynocs, CC0)', 'img:bark4', 0xffffff, .85, 0], ['bark5', 'Bark 5', 'Bark (Lynocs, CC0)', 'img:bark5', 0xffffff, .85, 0], ['bark6', 'Bark 6', 'Bark (Lynocs, CC0)', 'img:bark6', 0xffffff, .85, 0], ['bark7', 'Bark 7', 'Bark (Lynocs, CC0)', 'img:bark7', 0xffffff, .85, 0], ['bark8', 'Bark 8', 'Bark (Lynocs, CC0)', 'img:bark8', 0xffffff, .85, 0], ['bark9', 'Bark 9', 'Bark (Lynocs, CC0)', 'img:bark9', 0xffffff, .85, 0], ['bark10', 'Bark 10', 'Bark (Lynocs, CC0)', 'img:bark10', 0xffffff, .85, 0],
    ['candycane', 'Candy cane', 'Candy', 'candycane', 0xffffff, 0.25, 0],
    ['peppermint', 'Peppermint swirl', 'Candy', 'peppermint', 0xffffff, 0.15, 0],
    ['sprinkles', 'Pink frosting + sprinkles', 'Candy', 'sprinkles', 0xffffff, 0.5, 0],
    ['glazed', 'Chocolate glaze + sprinkles', 'Candy', 'glazed', 0xffffff, 0.25, 0],
    ['chocolate', 'Chocolate bar', 'Candy', 'chocolate', 0xffffff, 0.35, 0],
    ['cottoncandy', 'Cotton candy', 'Candy', 'cottoncandy', 0xffb8de, 0.95, 0],
    ['marshmallow', 'Marshmallow', 'Candy', 'marshmallow', 0xe8dcd8, 0.9, 0],
    ['honeycomb', 'Honeycomb toffee', 'Candy', 'honeycomb', 0xffffff, 0.3, 0],
    ['waffle', 'Waffle cone', 'Candy', 'waffle', 0xffffff, 0.8, 0],
    ['licorice', 'Licorice', 'Candy', 'licorice', 0xffffff, 0.2, 0],
    ['jellybean', 'Jelly bean (tint it)', 'Candy', 'jellybean', 0xff6a9a, 0.25, 0],
    ['caramel', 'Caramel', 'Candy', 'caramel', 0xffffff, 0.2, 0],
    ['lollipop', 'Rainbow lollipop', 'Candy', 'lollipop', 0xffffff, 0.15, 0],
    ['frosting', 'Vanilla frosting', 'Candy', 'frosting', 0xe8dccc, 0.6, 0],
    ['gummyred', 'Gummy (red)', 'Candy', 'plain', 0xff2a3a, 0.12, 0, {transparent: true, opacity: .82}],
    ['gummygreen', 'Gummy (green)', 'Candy', 'plain', 0x40e050, 0.12, 0, {transparent: true, opacity: .82}],
    ['gummyblue', 'Gummy (blue)', 'Candy', 'plain', 0x3a8aff, 0.12, 0, {transparent: true, opacity: .82}],
    ['gummyorange', 'Gummy (orange)', 'Candy', 'plain', 0xffa020, 0.12, 0, {transparent: true, opacity: .82}],
    ['rockcandy', 'Rock candy', 'Candy', 'crystal', 0xf0a8f0, 0.08, 0.1, {transparent: true, opacity: .9}],
    ['hardcandy', 'Hard candy (tint it)', 'Candy', 'plain', 0xffd040, 0.05, 0, {transparent: true, opacity: .88}],
    ['clearred', 'Clear toy (red)', 'Toys: clear plastic', 'plain', 0xff3040, .04, 0, {transparent: true, opacity: .55, emissive: 0xff3040, emissiveIntensity: .12}],
    ['clearyellow', 'Clear toy (yellow)', 'Toys: clear plastic', 'plain', 0xffd820, .04, 0, {transparent: true, opacity: .55, emissive: 0xffd820, emissiveIntensity: .12}],
    ['cleargreen', 'Clear toy (green)', 'Toys: clear plastic', 'plain', 0x30d050, .04, 0, {transparent: true, opacity: .55, emissive: 0x30d050, emissiveIntensity: .12}],
    ['clearblue', 'Clear toy (blue)', 'Toys: clear plastic', 'plain', 0x3080ff, .04, 0, {transparent: true, opacity: .55, emissive: 0x3080ff, emissiveIntensity: .12}],
    ['clearpurple', 'Clear toy (purple)', 'Toys: clear plastic', 'plain', 0xb060ff, .04, 0, {transparent: true, opacity: .55, emissive: 0xb060ff, emissiveIntensity: .12}],
    ['clearpink', 'Clear toy (pink)', 'Toys: clear plastic', 'plain', 0xff70c0, .04, 0, {transparent: true, opacity: .55, emissive: 0xff70c0, emissiveIntensity: .12}],
    ['clearorange', 'Clear toy (orange)', 'Toys: clear plastic', 'plain', 0xff8a20, .04, 0, {transparent: true, opacity: .55, emissive: 0xff8a20, emissiveIntensity: .12}],
    ['clearsmoke', 'Clear toy (smoke)', 'Toys: clear plastic', 'plain', 0x9aa0aa, .04, 0, {transparent: true, opacity: .55, emissive: 0x9aa0aa, emissiveIntensity: .12}],
    ['clearice', 'Clear toy (crystal)', 'Toys: clear plastic', 'plain', 0xe8f4ff, .03, 0, {transparent: true, opacity: .3, emissive: 0x8ab0d0, emissiveIntensity: .08}],
    ['armygreen', 'Army man green', 'Toys: army men', 'moldplastic', 0x5a7a3a, .55, 0],
    ['armytan', 'Army man tan', 'Toys: army men', 'moldplastic', 0xc8a878, .55, 0],
    ['armygrey', 'Army man grey', 'Toys: army men', 'moldplastic', 0x8a8e94, .55, 0],
    ['armyblue', 'Army man blue', 'Toys: army men', 'moldplastic', 0x3a5aa0, .55, 0],
    ['armyred', 'Army man red', 'Toys: army men', 'moldplastic', 0xa83a32, .55, 0],
    ['armyblack', 'Army man black', 'Toys: army men', 'moldplastic', 0x2a2a2c, .55, 0],
    ['toyred', 'Toy brick red', 'Toys: plastic', 'plain', 0xd8262a, .18, 0],
    ['toyyellow', 'Toy brick yellow', 'Toys: plastic', 'plain', 0xf8c818, .18, 0],
    ['toyblue', 'Toy brick blue', 'Toys: plastic', 'plain', 0x1f5ad0, .18, 0],
    ['toygreen', 'Toy brick green', 'Toys: plastic', 'plain', 0x22a03a, .18, 0],
    ['toywhite', 'Toy brick white', 'Toys: plastic', 'plain', 0xeeeeea, .18, 0],
    ['toyblack', 'Toy brick black', 'Toys: plastic', 'plain', 0x222224, .18, 0],
    ['toyorange', 'Toy brick orange', 'Toys: plastic', 'plain', 0xf07a18, .18, 0],
    ['toypurple', 'Toy brick purple', 'Toys: plastic', 'plain', 0x7a3ab8, .18, 0],
    ['vinyl', 'Vinyl figure (tint it)', 'Toys: plastic', 'moldplastic', 0xf0e8e0, .4, 0],
    ['glitterplastic', 'Glitter plastic', 'Toys: plastic', 'crystal', 0xb070e0, .2, .35],
    ['sand', 'Sand', 'Sand', 'sand', 0xd8b47a, .95, 0], ['sandgold', 'Golden sand', 'Sand', 'sand', 0xf0c060, .55, .35], ['sandwhite', 'White sand', 'Sand', 'sand', 0xf2ead8, .95, 0],
    ['sandred', 'Red desert sand', 'Sand', 'sand', 0xc8683a, .95, 0], ['sandblack', 'Black volcanic sand', 'Sand', 'sand', 0x2a2826, .8, .1], ['sandstone', 'Sandstone', 'Sand', 'stone', 0xc8a070, .9, 0],
    ['sandglow', 'Spirit sand (glowing)', 'Sand', 'sand', 0xffd890, .6, 0, {emissive: 0xc07a20, emissiveIntensity: .7}],
    ['moss', 'Moss', 'Plants & Fungus', 'fur', 0x4f7a2a, .95, 0], ['leaf', 'Green leaves', 'Plants & Fungus', 'leaf', 0x4a8a2e, .6, 0, {side: 2}], ['leafautumn', 'Autumn leaves', 'Plants & Fungus', 'leaf', 0xc8642a, .6, 0, {side: 2}],
    ['leafdead', 'Dead leaves', 'Plants & Fungus', 'leaf', 0x7a6440, .8, 0, {side: 2}], ['leafspirit', 'Spirit leaves (glow)', 'Plants & Fungus', 'leaf', 0x9affd0, .5, 0, {side: 2, emissive: 0x20a070, emissiveIntensity: .8}],
    ['mushcap', 'Mushroom cap', 'Plants & Fungus', 'spots', 0xb0502a, .6, 0], ['mushstalk', 'Mushroom stalk', 'Plants & Fungus', 'skin', 0xeee4cc, .7, 0], ['mushglow', 'Glowing mushroom', 'Plants & Fungus', 'spots', 0x6ad0ff, .4, 0, {emissive: 0x2080ff, emissiveIntensity: 1}],
    ['porcelain', 'Porcelain mask', 'Spirit', 'plain', 0xf4f0ea, .25, 0], ['shadowcloth', 'Shadow cloth', 'Spirit', 'cloth', 0x1a1820, .95, 0], ['ghosthair', 'Ghost hair (black)', 'Spirit', 'fur', 0x141416, .5, 0],
    ['ragcloth', 'Moss-green rags', 'Spirit', 'burlap', 0x3e5a36, 1, 0], ['ragwhite', 'White burial rags', 'Spirit', 'burlap', 0xe8e4da, 1, 0], ['ectoplasm', 'Ectoplasm (see-through)', 'Spirit', 'plain', 0xbfe8ff, .3, 0, {transparent: true, opacity: .55, emissive: 0x3a7aa0, emissiveIntensity: .8, side: 2}],
    ['krakenskin', 'Kraken skin', 'Skins & Scales', 'skin', 0x8a3a4a, .45, 0], ['sucker', 'Sucker rings', 'Skins & Scales', 'skin', 0xe8c0b0, .5, 0], ['chitinred', 'Red chitin', 'Skins & Scales', 'chitin', 0x8a2a1a, .3, .2],
    ['mothwing', 'Moth wing dust', 'Skins & Scales', 'feather', 0xc8b490, .9, 0, {side: 2}], ['mothdark', 'Dark moth fur', 'Skins & Scales', 'fur', 0x2a2420, .95, 0, {side: 2}], ['mothfur', 'Moth fur', 'Skins & Scales', 'fur', 0xd8ccb0, .95, 0],
    ['eyegold', 'Gold eye', 'Glow & Crystal', 'plain', 0xffc040, .2, 0, {emissive: 0xa06000, emissiveIntensity: .6}], ['mothyeye', 'Compound eye (dark)', 'Glow & Crystal', 'crystal', 0x3a1a2a, .1, .3, {emissive: 0x5a1030, emissiveIntensity: .5}],
    ['gecko', 'Leopard gecko', 'Lizards', 'gecko', 0xe8c060, .55, 0], ['gecko2', 'Day gecko (green)', 'Lizards', 'gecko', 0x4ac040, .45, 0], ['monitor', 'Monitor lizard', 'Lizards', 'monitor', 0x7a7458, .6, 0],
    ['komodo', 'Komodo dragon', 'Lizards', 'beads', 0x6a5a48, .75, 0], ['iguana', 'Green iguana', 'Lizards', 'iguana', 0x6aa04a, .5, 0], ['iguanablack', 'Marine iguana', 'Lizards', 'iguana', 0x3a3a3a, .7, 0],
    ['chameleon', 'Chameleon', 'Lizards', 'chameleon', 0x5ad070, .45, 0], ['chameleonred', 'Panther chameleon', 'Lizards', 'chameleon', 0xe85a3a, .45, 0], ['gila', 'Gila monster', 'Lizards', 'gecko', 0xe87a50, .6, 0],
    ['croc', 'Crocodile hide', 'Lizards', 'scutes', 0x5a6a3a, .55, 0], ['alligator', 'Alligator (dark)', 'Lizards', 'scutes', 0x2e3428, .6, 0], ['albinocroc', 'Albino gator', 'Lizards', 'scutes', 0xf0e8d0, .5, 0],
    ['fish', 'Silver fish', 'Fish & Sea', 'fishscale', 0xc8d4e0, .25, .45], ['fishgold', 'Goldfish', 'Fish & Sea', 'fishscale', 0xff9a30, .3, .2], ['koi', 'Koi (white + orange)', 'Fish & Sea', 'koi', 0xffffff, .3, .1],
    ['koired', 'Koi (red + black)', 'Fish & Sea', 'koi', 0xe84a2a, .3, .1], ['bass', 'Green bass', 'Fish & Sea', 'fishscale', 0x6a8a4a, .35, .15], ['tuna', 'Tuna blue', 'Fish & Sea', 'fishscale', 0x3a5a8a, .25, .4],
    ['sharkgrey', 'Shark (grey)', 'Fish & Sea', 'denticle', 0x7a8590, .45, 0], ['sharkblue', 'Blue shark', 'Fish & Sea', 'denticle', 0x4a6aa0, .4, 0], ['greatwhite', 'Great white (dark top)', 'Fish & Sea', 'denticle', 0x4a5258, .45, 0],
    ['whaleshark', 'Whale shark', 'Fish & Sea', 'whaleshark', 0x5a7590, .5, 0], ['whale', 'Humpback whale', 'Fish & Sea', 'whale', 0x3a4048, .5, 0], ['bluewhale', 'Blue whale', 'Fish & Sea', 'whale', 0x6a84a0, .5, 0],
    ['orca', 'Orca black', 'Fish & Sea', 'whale', 0x1c1e22, .3, 0], ['belugawhite', 'Beluga white', 'Fish & Sea', 'whale', 0xf2f0ea, .45, 0],
    ['octopus', 'Octopus (red)', 'Fish & Sea', 'octopus', 0xb04a3a, .45, 0], ['octopusbrown', 'Octopus (mottled brown)', 'Fish & Sea', 'octopus', 0x8a6a4a, .5, 0], ['blueringed', 'Ringed octopus (yellow)', 'Fish & Sea', 'blueringed', 0xe8c040, .4, 0, {emissive: 0x000000}],
    ['squid', 'Squid (chromatophores)', 'Fish & Sea', 'squid', 0xf0b0a0, .3, 0], ['mimic', 'Striped mimic octopus', 'Fish & Sea', 'mimic', 0xe8d0b0, .45, 0], ['deepsea', 'Deep-sea glow squid', 'Fish & Sea', 'squid', 0x5a3a8a, .3, 0, {emissive: 0x3a1a8a, emissiveIntensity: .6}],
    ['silk', 'Silk cocoon', 'Insects', 'silk', 0xf2ece0, .6, 0], ['silkgold', 'Golden silk', 'Insects', 'silk', 0xe8c060, .4, .3], ['silkdark', 'Dark spider silk', 'Insects', 'silk', 0x3a3640, .5, 0],
    ['silkglow', 'Glowing silk', 'Insects', 'silk', 0xd8f0ff, .5, 0, {emissive: 0x5a8aff, emissiveIntensity: .6}], ['jewelbeetle', 'Jewel beetle', 'Insects', 'chitin', 0x2aa06a, .15, .8], ['stagbeetle', 'Stag beetle (glossy)', 'Insects', 'chitin', 0x2a1a14, .15, .3],
    ['ladybug', 'Ladybug', 'Insects', 'spots', 0xd8281a, .25, 0], ['wasp', 'Wasp stripes', 'Insects', 'stripes', 0xf0c020, .35, 0], ['bee', 'Fuzzy bee', 'Insects', 'stripes', 0xe8b030, .9, 0],
    ['mantis', 'Mantis green', 'Insects', 'chitin', 0x7ac84a, .35, 0], ['antblack', 'Ant (black gloss)', 'Insects', 'chitin', 0x141214, .15, .2], ['firefly', 'Firefly glow', 'Insects', 'grub', 0xe8ff7a, .4, 0, {emissive: 0x9aff20, emissiveIntensity: 1.2}],
    ['grub', 'Grub / larva', 'Insects', 'grub', 0xf0e8d0, .45, 0], ['caterpillar', 'Green caterpillar', 'Insects', 'grub', 0x7ad04a, .5, 0], ['butterflyblue', 'Morpho wing blue', 'Insects', 'feather', 0x2a8aff, .2, .5, {side: 2}],
    ['ocean', 'Ocean water', 'Water', 'plain', 0xffffff, .05, .1, {fx: 12, transparent: true, opacity: .88}], ['deepwater', 'Deep sea (glow specks)', 'Water', 'plain', 0xffffff, .1, .1, {fx: 13}],
    ['ice', 'Ice', 'Water', 'plain', 0xffffff, .08, .1, {fx: 14, transparent: true, opacity: .9}], ['foam', 'Bubbly foam', 'Water', 'plain', 0xffffff, .6, 0, {fx: 15}],
    ['wet', 'Wet glossy (tint it)', 'Water', 'skin', 0x6a7a8a, .05, .15], ['waterclear', 'Clear water', 'Water', 'plain', 0x8ad0ff, .02, .1, {transparent: true, opacity: .45, side: 2}],
    ['lightning', 'Lightning arcs', 'Energy', 'plain', 0xffffff, .3, 0, {fx: 16}], ['plasma', 'Plasma', 'Energy', 'plain', 0xffffff, .3, 0, {fx: 17}], ['hexshield', 'Force field (hex)', 'Energy', 'plain', 0xffffff, .2, .2, {fx: 18, transparent: true, opacity: .75, side: 2}],
    ['spiritaura', 'Spirit aura', 'Energy', 'plain', 0xffffff, .4, 0, {fx: 19}], ['holo2', 'Hologram (energy)', 'Energy', 'plain', 0xffffff, .2, .3, {fx: 7}], ['grid2', 'Cyber grid (energy)', 'Energy', 'plain', 0xffffff, .4, .5, {fx: 11}],
    ['fire', 'Fire (moving)', 'Fire', 'plain', 0xffffff, .6, 0, {fx: 20}], ['bluefire', 'Blue fire', 'Fire', 'plain', 0xffffff, .6, 0, {fx: 21}], ['darkflame', 'Dark flame', 'Fire', 'plain', 0xffffff, .6, 0, {fx: 22}],
    ['lavacrack', 'Lava cracks (glowing)', 'Fire', 'plain', 0xffffff, .8, 0, {fx: 23}], ['embers', 'Ash + embers', 'Fire', 'plain', 0xffffff, .9, 0, {fx: 24}], ['sunfire', 'Sun plasma', 'Fire', 'plain', 0xffffff, .6, 0, {fx: 10}],
    ['gauze', 'Gauze / old wrap', 'Cloth', 'burlap', 0xd8c89a, 1, 0, {side: 2}], ['gauzedirty', 'Dirty gauze', 'Cloth', 'burlap', 0xa8946a, 1, 0, {side: 2}], ['canvas', 'Canvas', 'Cloth', 'cloth', 0xb8a888, .95, 0, {side: 2}],
    ['capered', 'Cape red', 'Cloth', 'cloth', 0xa0141a, .85, 0, {side: 2}], ['capeblack', 'Cape black', 'Cloth', 'cloth', 0x1c1a20, .85, 0, {side: 2}], ['velvet', 'Royal purple velvet', 'Cloth', 'felt', 0x4a1a6a, .9, 0, {side: 2}],
    ['silkcloth', 'Silk (shiny)', 'Cloth', 'cloth', 0xe8e0f0, .3, .1, {side: 2}], ['camocloth', 'Camo cloth', 'Cloth', 'camo', 0x6a7a4a, .95, 0, {side: 2}], ['rustchain', 'Rusty iron', 'Cloth', 'rust', 0x6a4a3a, .7, .6],
    ['glitter', 'Glitter (silver)', 'Glitter', 'plain', 0xc8ccd8, .3, .7, {fx: 26, keep: 1}], ['glittergold', 'Gold glitter', 'Glitter', 'plain', 0xd8a830, .3, .8, {fx: 26, keep: 1}], ['glitterpink', 'Pink glitter', 'Glitter', 'plain', 0xe860b0, .3, .5, {fx: 26, keep: 1}],
    ['glitterblue', 'Blue glitter', 'Glitter', 'plain', 0x3a6ae8, .3, .6, {fx: 26, keep: 1}], ['glitterpurple', 'Purple glitter', 'Glitter', 'plain', 0x8a3ae0, .3, .6, {fx: 26, keep: 1}], ['glittergreen', 'Green glitter', 'Glitter', 'plain', 0x2ab05a, .3, .6, {fx: 26, keep: 1}],
    ['glitterred', 'Red glitter', 'Glitter', 'plain', 0xd82a3a, .3, .6, {fx: 26, keep: 1}], ['glitterblack', 'Black glitter', 'Glitter', 'plain', 0x1a1a22, .3, .7, {fx: 26, keep: 1}], ['glitterrainbow', 'Rainbow glitter (oil sheen)', 'Glitter', 'plain', 0xb0b0c0, .2, .8, {fx: 26, keep: 1}],
    ['chameleonshift', 'Chameleon (colour-shifting)', 'Chameleon', 'chameleon', 0xffffff, .4, 0, {fx: 25, keep: 1}], ['chameleonsmooth', 'Chameleon smooth skin', 'Chameleon', 'skin', 0xffffff, .45, 0, {fx: 25, keep: 1}],
    ['chameleonmetal', 'Chameleon car paint', 'Chameleon', 'plain', 0xffffff, .2, .7, {fx: 25, keep: 1}], ['chameleonscale', 'Chameleon dragon scales', 'Chameleon', 'bigscales', 0xffffff, .4, .1, {fx: 25, keep: 1}],
    ['scratches', 'Scratches (light)', 'Scratches & Wear', 'scratch', 0xd8d8d8, .4, .6, {transparent: true, cut: 1}], ['scratchesdark', 'Scratches (dark)', 'Scratches & Wear', 'scratch', 0x1a1a1a, .7, 0, {transparent: true, cut: 1}],
    ['clawmarks', 'Claw marks', 'Scratches & Wear', 'claws', 0x2a1414, .8, 0, {transparent: true, cut: 1}], ['clawglow', 'Glowing claw marks', 'Scratches & Wear', 'claws', 0xff8a3a, .5, 0, {transparent: true, cut: 1, emissive: 0xff5a1a, emissiveIntensity: 1.5}],
    ['paintchips', 'Chipped paint (bare metal)', 'Scratches & Wear', 'chips', 0xb8bcc4, .35, .8, {transparent: true, cut: 1}], ['rustspots', 'Rust patches', 'Scratches & Wear', 'chips', 0x8a4a2a, .9, .2, {transparent: true, cut: 1}],
    ['scorch', 'Scorch marks', 'Scratches & Wear', 'chips', 0x141210, 1, 0, {transparent: true, cut: 1}],
    ['pearl', 'Pearl white', 'Pearlescent', 'plain', 0xf2eee8, .25, .15, {fx: 27, keep: 1}], ['pearlpink', 'Pink pearl', 'Pearlescent', 'plain', 0xf0c8d8, .25, .15, {fx: 27, keep: 1}], ['pearlblue', 'Blue pearl', 'Pearlescent', 'plain', 0xb8d0f0, .25, .15, {fx: 27, keep: 1}],
    ['pearlblack', 'Black pearl', 'Pearlescent', 'plain', 0x2a2830, .2, .25, {fx: 27, keep: 1}], ['pearlgold', 'Gold pearl', 'Pearlescent', 'plain', 0xe8d0a0, .25, .35, {fx: 27, keep: 1}], ['pearlmint', 'Mint pearl', 'Pearlescent', 'plain', 0xc8f0dc, .25, .15, {fx: 27, keep: 1}],
    ['pearlscale', 'Pearl dragon scales', 'Pearlescent', 'bigscales', 0xf2eee8, .3, .15, {fx: 27, keep: 1}],
    ['goldpolished', 'Polished gold', 'Metal', 'plain', 0xffc848, .12, 1], ['goldantique', 'Antique gold', 'Metal', 'brushed', 0xc89a40, .4, .9], ['rosegold', 'Rose gold', 'Metal', 'plain', 0xf0a890, .15, 1], ['whitegold', 'White gold', 'Metal', 'plain', 0xf0ead8, .12, 1],
    ['silver', 'Silver', 'Metal', 'brushed', 0xd8dce4, .25, 1], ['silverpolished', 'Polished silver', 'Metal', 'plain', 0xeef0f4, .06, 1], ['platinum', 'Platinum', 'Metal', 'plain', 0xd0d4d8, .18, 1],
    ['copper', 'Copper', 'Metal', 'brushed', 0xd07a4a, .3, 1], ['brass', 'Brass', 'Metal', 'brushed', 0xc8a050, .3, 1], ['titanium', 'Titanium (blue-purple)', 'Metal', 'plain', 0x8a8ad8, .2, .9, {fx: 27, keep: 1}], ['gunmetalblue', 'Blued steel', 'Metal', 'brushed', 0x3a4258, .3, 1],
    ['jade', 'Jade', 'Gems & Stone', 'jade', 0x3aa86a, .15, 0, {emissive: 0x0a3a1a, emissiveIntensity: .5}], ['jadeimperial', 'Imperial jade (bright)', 'Gems & Stone', 'jade', 0x2ad070, .1, 0, {emissive: 0x0a5a2a, emissiveIntensity: .7}],
    ['jadewhite', 'White jade', 'Gems & Stone', 'jade', 0xe8f0e0, .15, 0, {emissive: 0x2a3a2a, emissiveIntensity: .3}], ['jadedark', 'Dark jade', 'Gems & Stone', 'jade', 0x1a5a3a, .15, 0], ['jadelavender', 'Lavender jade', 'Gems & Stone', 'jade', 0xb8a0e0, .15, 0, {emissive: 0x2a1a4a, emissiveIntensity: .4}],
    ['marble', 'White marble', 'Gems & Stone', 'jade', 0xf0eeea, .2, 0], ['marbleblack', 'Black marble', 'Gems & Stone', 'jade', 0x44444c, .15, .1], ['obsidian', 'Obsidian', 'Gems & Stone', 'plain', 0x101014, .05, .3], ['obsidianrainbow', 'Rainbow obsidian', 'Gems & Stone', 'plain', 0x18161c, .05, .3, {fx: 27, keep: 1}], ['obsidiansnow', 'Snowflake obsidian', 'Gems & Stone', 'jade', 0x26262c, .08, .2],
    ['obsidianlava', 'Obsidian with glowing cracks', 'Gems & Stone', 'plain', 0xffffff, .1, .2, {fx: 23}], ['obsidianglass', 'Obsidian glass (see-through)', 'Gems & Stone', 'plain', 0x1a1620, .02, .3, {transparent: true, opacity: .8}],
    ['ruby', 'Ruby', 'Gems & Stone', 'crystal', 0xe01a3a, .05, .2, {emissive: 0x6a0010, emissiveIntensity: .6, flat: true}], ['sapphire', 'Sapphire', 'Gems & Stone', 'crystal', 0x1a4ae0, .05, .2, {emissive: 0x001a6a, emissiveIntensity: .6, flat: true}],
    ['emerald', 'Emerald', 'Gems & Stone', 'crystal', 0x1ac05a, .05, .2, {emissive: 0x005a1a, emissiveIntensity: .6, flat: true}], ['topaz', 'Topaz', 'Gems & Stone', 'crystal', 0xf0a020, .05, .2, {emissive: 0x6a3a00, emissiveIntensity: .6, flat: true}],
    ['neonpink', 'Neon pink', 'Neon', 'plain', 0xff4ab0, .3, 0, {emissive: 0xff2a9a, emissiveIntensity: 1.6}], ['neongreen', 'Neon green', 'Neon', 'plain', 0x7aff4a, .3, 0, {emissive: 0x3aff2a, emissiveIntensity: 1.6}],
    ['neonblue', 'Neon blue', 'Neon', 'plain', 0x4a7aff, .3, 0, {emissive: 0x2a4aff, emissiveIntensity: 1.8}], ['neoncyan', 'Neon cyan', 'Neon', 'plain', 0x4affff, .3, 0, {emissive: 0x1ae0ff, emissiveIntensity: 1.6}],
    ['neonorange', 'Neon orange', 'Neon', 'plain', 0xff9a3a, .3, 0, {emissive: 0xff6a0a, emissiveIntensity: 1.6}], ['neonyellow', 'Neon yellow', 'Neon', 'plain', 0xffff5a, .3, 0, {emissive: 0xf0e01a, emissiveIntensity: 1.5}],
    ['neonpurple', 'Neon purple', 'Neon', 'plain', 0xb05aff, .3, 0, {emissive: 0x8a2aff, emissiveIntensity: 1.8}], ['neonred', 'Neon red', 'Neon', 'plain', 0xff3a4a, .3, 0, {emissive: 0xff1a2a, emissiveIntensity: 1.7}],
    ['neonwhite', 'Neon white', 'Neon', 'plain', 0xffffff, .3, 0, {emissive: 0xd0e0ff, emissiveIntensity: 1.4}], ['neonlime', 'Neon lime', 'Neon', 'plain', 0xd0ff3a, .3, 0, {emissive: 0xa0ff1a, emissiveIntensity: 1.5}],
    ['fog', 'Fog (moving mist)', 'Weather', 'plain', 0xffffff, .9, 0, {fx: 28, transparent: true, side: 2}], ['fogdense', 'Thick fog', 'Weather', 'plain', 0xffffff, .9, 0, {fx: 28}],
    ['stormcloud', 'Storm clouds + lightning', 'Weather', 'plain', 0xffffff, .8, 0, {fx: 29}], ['rain', 'Rain storm', 'Weather', 'plain', 0xffffff, .3, .1, {fx: 30}], ['snowfall', 'Snowfall', 'Weather', 'plain', 0xffffff, .7, 0, {fx: 31}],
    ['sandstorm', 'Sandstorm', 'Weather', 'sand', 0xffffff, .9, 0, {fx: 32}], ['tornado', 'Tornado swirl', 'Weather', 'plain', 0xffffff, .8, 0, {fx: 33}], ['sunnysky', 'Sunny sky + clouds', 'Weather', 'plain', 0xffffff, .6, 0, {fx: 34}],
    ['nightstorm', 'Eerie night storm', 'Weather', 'plain', 0xffffff, .6, 0, {fx: 35}], ['aurora2', 'Aurora sky', 'Weather', 'plain', 0xffffff, .5, 0, {fx: 5}],
    ['alienpurple', 'Alien shimmer armor (purple)', 'Alien Armor', 'plain', 0x6a3aa8, .2, .8, {fx: 27, keep: 1}], ['alienblue', 'Alien shimmer armor (blue)', 'Alien Armor', 'plain', 0x2a4ab0, .2, .8, {fx: 27, keep: 1}],
    ['alienred', 'Alien shimmer armor (red)', 'Alien Armor', 'plain', 0xa82a3a, .2, .8, {fx: 27, keep: 1}], ['aliengold', 'Alien shimmer armor (gold)', 'Alien Armor', 'plain', 0xc8a03a, .2, .9, {fx: 27, keep: 1}],
    ['alienwhite', 'Alien shimmer armor (white)', 'Alien Armor', 'plain', 0xd8d8e8, .2, .7, {fx: 27, keep: 1}], ['aliengreen', 'Alien shimmer armor (green)', 'Alien Armor', 'plain', 0x3a8a4a, .2, .8, {fx: 27, keep: 1}],
    ['ancientmachine', 'Ancient machine (glowing lines)', 'Alien Armor', 'panels', 0xa8acb4, .3, .8, {fx: 36, keep: 1}], ['ancientdark', 'Ancient machine (dark)', 'Alien Armor', 'panels', 0x3a3c44, .3, .8, {fx: 36, keep: 1}],
    ['brutearmor', 'Brute armor (rough)', 'Alien Armor', 'hexpanel', 0x4a3c3a, .55, .7], ['bruteplate', 'Brute plate (blue-grey)', 'Alien Armor', 'brushed', 0x4a5868, .45, .8],
    ['infection', 'Infection flesh (glowing veins)', 'Alien Armor', 'octopus', 0xb0a060, .5, 0, {fx: 37, keep: 1}], ['infectiondark', 'Infection flesh (rotten)', 'Alien Armor', 'octopus', 0x6a6a3a, .6, 0, {fx: 37, keep: 1}],
    ['energysword', 'Plasma energy (blue)', 'Alien Armor', 'plain', 0x8ad0ff, .2, 0, {emissive: 0x3a9aff, emissiveIntensity: 2.2}], ['plasmagreen', 'Plasma energy (green)', 'Alien Armor', 'plain', 0xaaff8a, .2, 0, {emissive: 0x4aff3a, emissiveIntensity: 2}],
    ['toyrubber', 'Toy rubber', 'Craft (toy box)', 'plain', 0xe85a3a, .55, 0], ['toyplastic', 'Shiny toy plastic', 'Craft (toy box)', 'plain', 0x3a8ae8, .25, 0],
  ];
  const ALIAS = {paint2: 'paint2', fur: 'fur', feather: 'feather', stone: 'stone', wood: 'wood', cloth: 'cloth', leather: 'leather', chitin: 'chitin', glow: 'glow', screen: 'screen'};
  function makeMat(T, key, tint, tile) {
    const e = LIST.find(l => l[0] === key) || LIST[0], [, , , tk, col, rough, metal, ex = {}] = e, t = tex(T, tk);
    const m = new T.MeshStandardMaterial({color: col, roughness: rough, metalness: metal, side: ex.side === 2 ? T.DoubleSide : T.FrontSide, transparent: !!ex.transparent, opacity: ex.opacity ?? 1, flatShading: !!ex.flat});
    if (ex.emissive) { m.emissive = new T.Color(ex.emissive); m.emissiveIntensity = ex.emissiveIntensity; }
    if (tint && tint !== '#ffffff') m.color.multiply(new T.Color(tint));
    m.userData.key = key; m.userData.tile = tile || 1;
    m.onBeforeCompile = sh => {                                   // triplanar: texture from 3 directions, no UVs needed
      sh.uniforms.tpMap = {value: t}; sh.uniforms.tpScale = {value: .55 / (m.userData.tile || 1)}; sh.uniforms.tpEm = {value: ex.emap ? 1 : 0}; sh.uniforms.tpEc = {value: ex.ecol ? 1 : 0}; sh.uniforms.tpA = {value: ex.cut ? 1 : 0};
      sh.vertexShader = 'varying vec3 vTP; varying vec3 vTN;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vTP = transformed; vTN = objectNormal;');
      sh.fragmentShader = 'uniform sampler2D tpMap; uniform float tpScale; uniform float tpEm; uniform float tpEc; uniform float tpA; varying vec3 vTP; varying vec3 vTN;\n' + sh.fragmentShader
        .replace('#include <map_fragment>', `vec3 bw = pow(abs(normalize(vTN)), vec3(4.0)); bw /= (bw.x + bw.y + bw.z + 1e-5);
          vec4 tpc = texture2D(tpMap, vTP.yz * tpScale) * bw.x + texture2D(tpMap, vTP.xz * tpScale) * bw.y + texture2D(tpMap, vTP.xy * tpScale) * bw.z;
          diffuseColor.a *= mix(1.0, smoothstep(.25, .6, tpc.r), tpA); diffuseColor.rgb *= mix(mix(tpc.rgb, vec3(1.0), tpEm), vec3(1.0), tpA);`)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= mix(1.0, smoothstep(0.35, 0.9, dot(tpc.rgb, vec3(.333))) * 2.5, tpEm); totalEmissiveRadiance *= mix(vec3(1.0), tpc.rgb, tpEc);');
    };
    if (ex.fx && (ex.sky || ex.fx === 5 || ex.fx === 6 || ex.fx === 10 || ex.fx === 11)) { m.envMapIntensity = .12; m.roughness = Math.max(m.roughness, .75); m.metalness = 0; }   // space skins: dark and deep, not shiny-washed
    if (ex.fx) { const prev = m.onBeforeCompile; m.onBeforeCompile = sh => { prev(sh); sh.uniforms.uT = FX_T; sh.uniforms.uFx = {value: ex.fx}; sh.uniforms.uSky = {value: ex.sky ? 1 : 0}; sh.uniforms.uFur = {value: ex.furmix ? 1 : 0}; sh.uniforms.uKeep = {value: ex.keep ? 1 : 0};
      sh.vertexShader = 'varying vec3 vWP;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'varying vec3 vWP; uniform float uT; uniform int uFx; uniform float uSky; uniform float uFur; uniform float uKeep;\n' + FX_GLSL + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + FX_MAIN); }; }
    m.customProgramCacheKey = () => 'tp-' + key + '-' + (tile || 1);
    return m;
  }
  function addPattern(T, key, name, img) { const t = new T.Texture(img); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; texCache['pat:' + key] = t;
    if (!LIST.find(l => l[0] === key)) LIST.push([key, name, 'My Patterns', 'pat:' + key, 0xffffff, .6, 0]); }
  window.FORGE_MATS = {LIST, makeMat, tex, ALIAS, addPattern, tick: t => { FX_T.value = t; }};
})();
