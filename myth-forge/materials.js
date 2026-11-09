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
  if (uFur > .5) fx *= .55 + diffuseColor.r * .9;
  diffuseColor.rgb = (uFur > .5 ? diffuseColor.rgb * .2 : vec3(base)) + fx * .1; totalEmissiveRadiance += fx * diffuse;
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
      sh.uniforms.tpMap = {value: t}; sh.uniforms.tpScale = {value: .55 / (m.userData.tile || 1)}; sh.uniforms.tpEm = {value: ex.emap ? 1 : 0}; sh.uniforms.tpEc = {value: ex.ecol ? 1 : 0};
      sh.vertexShader = 'varying vec3 vTP; varying vec3 vTN;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vTP = transformed; vTN = objectNormal;');
      sh.fragmentShader = 'uniform sampler2D tpMap; uniform float tpScale; uniform float tpEm; uniform float tpEc; varying vec3 vTP; varying vec3 vTN;\n' + sh.fragmentShader
        .replace('#include <map_fragment>', `vec3 bw = pow(abs(normalize(vTN)), vec3(4.0)); bw /= (bw.x + bw.y + bw.z + 1e-5);
          vec4 tpc = texture2D(tpMap, vTP.yz * tpScale) * bw.x + texture2D(tpMap, vTP.xz * tpScale) * bw.y + texture2D(tpMap, vTP.xy * tpScale) * bw.z;
          diffuseColor.rgb *= mix(tpc.rgb, vec3(1.0), tpEm);`)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= mix(1.0, smoothstep(0.35, 0.9, dot(tpc.rgb, vec3(.333))) * 2.5, tpEm); totalEmissiveRadiance *= mix(vec3(1.0), tpc.rgb, tpEc);');
    };
    if (ex.fx && (ex.sky || ex.fx === 5 || ex.fx === 6 || ex.fx === 10 || ex.fx === 11)) { m.envMapIntensity = .12; m.roughness = Math.max(m.roughness, .75); m.metalness = 0; }   // space skins: dark and deep, not shiny-washed
    if (ex.fx) { const prev = m.onBeforeCompile; m.onBeforeCompile = sh => { prev(sh); sh.uniforms.uT = FX_T; sh.uniforms.uFx = {value: ex.fx}; sh.uniforms.uSky = {value: ex.sky ? 1 : 0}; sh.uniforms.uFur = {value: ex.furmix ? 1 : 0};
      sh.vertexShader = 'varying vec3 vWP;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'varying vec3 vWP; uniform float uT; uniform int uFx; uniform float uSky; uniform float uFur;\n' + FX_GLSL + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + FX_MAIN); }; }
    m.customProgramCacheKey = () => 'tp-' + key + '-' + (tile || 1);
    return m;
  }
  function addPattern(T, key, name, img) { const t = new T.Texture(img); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; texCache['pat:' + key] = t;
    if (!LIST.find(l => l[0] === key)) LIST.push([key, name, 'My Patterns', 'pat:' + key, 0xffffff, .6, 0]); }
  window.FORGE_MATS = {LIST, makeMat, tex, ALIAS, addPattern, tick: t => { FX_T.value = t; }};
})();
