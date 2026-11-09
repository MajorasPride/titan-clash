// Part MAKERS: parts you shape with sliders (great on a phone). Each has params; the editor shows them in the Shape tab.
(window.FORGE_PARTS = window.FORGE_PARTS || []).push(function (T, K) {
  const {V3, D} = K, P = (geo, mat) => ({geo, mat}), G = 'Part Makers (sliders)';
  const opt = (k, label, options, def) => ({k, label, options, def}), num = (k, label, min, max, step, def) => ({k, label, min, max, step, def});
  const finger = (len, thick, segs, curl, claw, clawLen) => { const out = []; let p = V3(0, 0, 0), a = 0; const sl = len / segs;
    for (let i = 0; i < segs; i++) { a += curl * D; const q = p.clone().add(V3(0, Math.cos(a) * sl, Math.sin(a) * sl)), r = thick * (1 - i * .18 / segs * 2);
      out.push(P(K.taper(K.bez(p, p.clone().lerp(q, .5), q), r, r * .88, 10, 12), 'skin'), P(new T.SphereGeometry(r * 1.02, 12, 10).translate(q.x, q.y, q.z), 'skin')); p = q; }
    if (claw) { const dir = V3(0, Math.cos(a + curl * D), Math.sin(a + curl * D)), tip = p.clone().add(dir.clone().multiplyScalar(clawLen)).add(V3(0, 0, clawLen * .35));
      out.push(P(K.taper(K.bez(p, p.clone().add(dir.multiplyScalar(clawLen * .5)), tip), thick * .75, .01, 14, 10, .7), 'horn')); }
    return out; };
  const M = [
    {id: 'mkr_eye', name: 'Eye maker', sub: 'Faces', params: [opt('shape', 'Eye shape', ['round', 'almond', 'cat', 'tall oval', 'wide', 'bug (compound)'], 'round'),
      opt('pupil', 'Pupil', ['round', 'slit', 'goat bar', 'star', 'none', 'spiral', 'cross', 'ring', 'crescent', 'double', 'heart', 'diamond'], 'slit'), num('pupilSize', 'Pupil size', .2, 1.8, .05, 1),
      num('size', 'Size', .2, 2, .05, .6), num('iris', 'Iris size', .2, .95, .05, .6),
      opt('irisMat', 'Iris', ['glow', 'glowblue', 'glowgreen', 'glowpurple', 'gold', 'gemred', 'gemblue', 'gemgreen', 'amethyst', 'crystal', 'screen', 'eye'], 'glow'),
      opt('sclera', 'Eyeball', ['white', 'black', 'yellow', 'red', 'glowing', 'chrome'], 'white'), opt('shine', 'Shine dot', ['yes', 'no'], 'yes'),
      num('lid', 'Top eyelid', 0, 1, .05, .25), num('lowLid', 'Bottom eyelid', 0, 1, .05, 0), num('squint', 'Angry tilt', -40, 40, 1, 12),
      opt('lidMat', 'Eyelid skin', ['skin', 'scale', 'chitin', 'metal', 'fur'], 'skin'),
      opt('socket', 'Socket rim', ['none', 'bone ring', 'scale ring', 'metal ring', 'mech lens'], 'scale ring'), opt('extra', 'Extra', ['none', 'brow ridge', 'spiky lashes', 'scar', 'tear streaks'], 'none')],
      make: p => { const r = p.size / 2, sh = {round: [1, 1], almond: [1.25, .8], cat: [1.35, .7], 'tall oval': [.75, 1.3], wide: [1.5, .85], 'bug (compound)': [1, 1]}[p.shape] || [1, 1];
        const scl = {white: 'eye', black: 'obsidian', yellow: 'paintyel', red: 'gemred', glowing: 'glow', chrome: 'chrome'}[p.sclera] || 'eye', out = [];
        if (p.shape === 'bug (compound)') { const g = new T.IcosahedronGeometry(r, 3).toNonIndexed(); g.computeVertexNormals(); out.push(P(g, p.irisMat === 'eye' ? 'chitin' : p.irisMat)); }
        else { out.push(P(new T.SphereGeometry(r, 32, 24), scl)); const ir = r * p.iris;
          out.push(P(new T.SphereGeometry(r * 1.002, 32, 16, 0, Math.PI * 2, 0, Math.asin(Math.min(.99, p.iris))).rotateX(Math.PI / 2), p.irisMat));
          const pz = r * 1.01, pw = ir * .5 * p.pupilSize, add = g => out.push(P(g.translate(0, 0, pz), 'darkmetal'));
          const flat = pts => K.extr(pts, .01, 0);
          if (p.pupil === 'round') add(new T.CircleGeometry(pw, 24)); else if (p.pupil === 'slit') add(new T.CircleGeometry(pw, 24).scale(.25, 1.6, 1)); else if (p.pupil === 'goat bar') add(new T.CircleGeometry(pw, 24).scale(1.7, .3, 1));
          else if (p.pupil === 'star') add(flat(K.ring(10, (i, a) => [Math.sin(a) * pw * (i % 2 ? .4 : 1), Math.cos(a) * pw * (i % 2 ? .4 : 1)])));
          else if (p.pupil === 'spiral') add(new T.TorusGeometry(pw * .6, pw * .12, 6, 40, Math.PI * 3.2));
          else if (p.pupil === 'cross') { add(new T.PlaneGeometry(pw * .35, pw * 2)); add(new T.PlaneGeometry(pw * 2, pw * .35).translate(0, 0, .002)); }
          else if (p.pupil === 'ring') add(new T.RingGeometry(pw * .6, pw, 32));
          else if (p.pupil === 'crescent') add(flat([...Array(25).keys()].map(i => { const a = i / 24 * Math.PI; return [Math.cos(a) * pw, Math.sin(a) * pw - pw * .3]; }).concat([...Array(25).keys()].reverse().map(i => { const a = i / 24 * Math.PI; return [Math.cos(a) * pw * .8, Math.sin(a) * pw * .55 - pw * .3]; }))));
          else if (p.pupil === 'double') { add(new T.CircleGeometry(pw * .6, 20).translate(-pw * .55, 0, 0)); add(new T.CircleGeometry(pw * .6, 20).translate(pw * .55, 0, 0)); }
          else if (p.pupil === 'heart') add(flat([...Array(40).keys()].map(i => { const t = i / 40 * Math.PI * 2; return [16 * Math.sin(t) ** 3 * pw / 17, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * pw / 17]; })));
          else if (p.pupil === 'diamond') add(flat([[0, pw * 1.3], [pw * .6, 0], [0, -pw * 1.3], [-pw * .6, 0]]));
          if (p.shine === 'yes') out.push(P(new T.SphereGeometry(r * .09, 10, 8).translate(r * .3, r * .32, r * .96), 'glowblue')); }
        if (p.lid > 0) out.push(P(new T.SphereGeometry(r * 1.06, 32, 16, 0, Math.PI * 2, 0, Math.PI * p.lid * .55).rotateZ(p.squint * D), p.lidMat));
        if (p.lowLid > 0) out.push(P(new T.SphereGeometry(r * 1.05, 32, 16, 0, Math.PI * 2, Math.PI - Math.PI * p.lowLid * .45, Math.PI * p.lowLid * .45).rotateZ(-p.squint * D * .4), p.lidMat));
        if (p.socket === 'mech lens') { for (const [k, rr] of [[0, 1.1], [1, 1.28]]) out.push(P(new T.TorusGeometry(r * rr, r * (.08 + k * .04), 8, 40).translate(0, 0, -r * .1 * k), k ? 'darkmetal' : 'metal'));
          for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; out.push(P(new T.BoxGeometry(r * .12, r * .3, r * .12).translate(Math.cos(a) * r * 1.42, Math.sin(a) * r * 1.42, 0).rotateZ(0), 'metal')); } }
        else if (p.socket !== 'none') out.push(P(new T.TorusGeometry(r * 1.08, r * .18, 10, 32), {'bone ring': 'bone', 'scale ring': 'scale', 'metal ring': 'metal'}[p.socket]));
        if (p.extra === 'brow ridge') out.push(P(K.taper(K.bez(V3(-r * 1.3, r * .9, r * .3), V3(0, r * 1.45, r * .55), V3(r * 1.3, r * .9 + Math.tan(p.squint * D) * r * .6, r * .3)), r * .22, r * .16, 16, 8), p.lidMat));
        else if (p.extra === 'spiky lashes') for (let i = 0; i < 7; i++) { const a = (i / 6 - .5) * 2.2, x = Math.sin(a) * r * 1.02, y = Math.cos(a) * r * 1.02; out.push(P(K.taper(K.bez(V3(x, y, r * .3), V3(x * 1.3, y * 1.3, r * .4), V3(x * 1.6, y * 1.6 + r * .15, r * .3)), r * .06, .005, 8, 6), 'horn')); }
        else if (p.extra === 'scar') out.push(P(K.taper(K.bez(V3(-r * .5, r * 1.5, r * .5), V3(r * .1, 0, r * 1.15), V3(r * .4, -r * 1.5, r * .5)), r * .06, r * .03, 20, 6), 'flesh'));
        else if (p.extra === 'tear streaks') for (const x of [-.25, .25]) out.push(P(K.taper(K.bez(V3(x * r, -r * .85, r * .6), V3(x * r * 1.2, -r * 1.4, r * .7), V3(x * r * 1.1, -r * 2.1, r * .5)), r * .07, r * .03, 14, 6), p.irisMat));
        if (sh[0] !== 1 || sh[1] !== 1) out.forEach(o => o.geo.scale(sh[0], sh[1], 1));
        return out; }},
    {id: 'mkr_finger', name: 'Finger / toe maker', sub: 'Hands', params: [num('len', 'Length', .3, 3, .05, 1.2), num('thick', 'Thickness', .04, .5, .01, .14), num('segs', 'Joints', 1, 5, 1, 3), num('curl', 'Curl', -30, 60, 1, 12), opt('claw', 'Claw', ['yes', 'no'], 'yes'), num('clawLen', 'Claw length', .05, 1.5, .05, .35)],
      make: p => finger(p.len, p.thick, p.segs, p.curl, p.claw === 'yes', p.clawLen)},
    {id: 'mkr_hand', name: 'Hand maker', sub: 'Hands', params: [num('fingers', 'Fingers', 1, 7, 1, 4), num('len', 'Finger length', .3, 3, .05, 1.1), num('thick', 'Thickness', .05, .5, .01, .16), num('spread', 'Spread', 0, 40, 1, 14), num('curl', 'Curl', -20, 70, 1, 18),
      opt('thumb', 'Thumb', ['yes', 'no'], 'yes'), opt('claw', 'Claws', ['yes', 'no'], 'yes'), num('clawLen', 'Claw length', .05, 1.5, .05, .4), num('palm', 'Palm size', .4, 2, .05, .9)],
      make: p => { const out = [P(K.noise(new T.SphereGeometry(p.palm * .55, 24, 16).scale(1, 1.15, .55).translate(0, p.palm * .55, 0), .01, 3), 'skin')];
        for (let i = 0; i < p.fingers; i++) { const t = p.fingers > 1 ? i / (p.fingers - 1) - .5 : 0, f = finger(p.len * (1 - Math.abs(t) * .3), p.thick, 3, p.curl, p.claw === 'yes', p.clawLen);
          f.forEach(pc => { pc.geo.rotateZ(-t * p.spread * 2 * D).translate(t * p.palm * .9, p.palm * 1.05, 0); out.push(pc); }); }
        if (p.thumb === 'yes') finger(p.len * .7, p.thick * 1.1, 2, p.curl, p.claw === 'yes', p.clawLen * .8).forEach(pc => { pc.geo.rotateZ(-1.0).rotateY(-.6).translate(p.palm * .45, p.palm * .4, .1); out.push(pc); });
        return out; }},
    {id: 'mkr_horn', name: 'Horn maker', sub: 'Horns', params: [num('len', 'Length', .3, 6, .05, 2), num('base', 'Base width', .05, 1.2, .01, .3), num('curve', 'Curve', -2, 2, .05, .8), num('twist', 'Spiral', 0, 3, .05, 0), num('rings', 'Ridges', 0, 30, 1, 0),
      opt('mat', 'Material', ['horn', 'bone', 'ivory', 'crystal', 'obsidian', 'gold', 'chrome', 'lavarock'], 'horn')],
      make: p => { const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, a = t * p.twist * Math.PI * 2; pts.push(V3(Math.sin(a) * p.twist * .25 * t, t * p.len, -p.curve * t * t * p.len * .5 + Math.cos(a) * p.twist * .25 * t - p.twist * .25 * t)); }
        const c = K.cr(pts), out = [P(K.taper(c, p.base, .01, 48, 14), p.mat)];
        for (let i = 1; i <= p.rings; i++) { const t = i / (p.rings + 1), q = c.getPointAt(t), tg = c.getTangentAt(t), g = new T.TorusGeometry(p.base * (1 - t * .9) * 1.02, p.base * .06 * (1 - t), 6, 16).rotateX(Math.PI / 2);
          g.applyQuaternion(new T.Quaternion().setFromUnitVectors(V3(0, 1, 0), tg)); out.push(P(g.translate(q.x, q.y, q.z), p.mat)); } return out; }},
    {id: 'mkr_tooth', name: 'Teeth maker', sub: 'Teeth', params: [num('count', 'Teeth', 1, 30, 1, 10), num('len', 'Length', .05, 1.5, .01, .3), num('width', 'Width', .02, .4, .01, .08), num('arc', 'Jaw width', 0, 3, .05, 1.2),
      num('curve', 'Hook', -1, 1, .05, .2), opt('style', 'Style', ['fangs', 'all same', 'shark (jagged)', 'tusks at front'], 'fangs'), opt('mat', 'Material', ['tooth', 'bone', 'metal', 'crystal', 'gold', 'obsidian'], 'tooth')],
      make: p => { const out = []; for (let i = 0; i < p.count; i++) { const t = p.count > 1 ? i / (p.count - 1) : .5, a = (t - .5) * Math.PI * .9, x = Math.sin(a) * p.arc, z = Math.cos(a) * p.arc - p.arc;
        let L = p.len, w = p.width; if (p.style === 'fangs' && (i === 1 || i === p.count - 2)) { L *= 2.2; w *= 1.4; } if (p.style === 'shark (jagged)') L *= .7 + (i % 2) * .5; if (p.style === 'tusks at front' && Math.abs(t - .5) < .12) { L *= 3; w *= 2; }
        out.push(P(K.taper(K.bez(V3(0, 0, 0), V3(0, L * .5, 0), V3(0, L, p.curve * L * .5)), w, .005, 10, 8, .8).rotateY(a).translate(x, 0, z), p.mat)); } return out; }},
    {id: 'mkr_tail', name: 'Tail maker', sub: 'Tails', params: [num('len', 'Length', 1, 14, .1, 7), num('base', 'Base thickness', .1, 2, .02, .7), num('sway', 'Wave', -3, 3, .05, .6), num('curlTip', 'Tip curl', -3, 3, .05, .8),
      opt('tip', 'Tip', ['none', 'spade', 'club', 'blade', 'stinger', 'flame', 'fin', 'crystal'], 'spade'), num('spikes', 'Back spikes', 0, 20, 1, 6), opt('mat', 'Material', ['scale', 'bigscale', 'skin', 'chitin', 'chrome', 'fur', 'bone'], 'scale')],
      make: p => { const c = K.cr([V3(0, 0, 0), V3(p.sway * .3, p.len * .3, 0), V3(-p.sway * .3, p.len * .65, .2), V3(p.curlTip * .3, p.len * .9, p.curlTip * .5), V3(p.curlTip * .5, p.len, p.curlTip)]), out = [P(K.taper(c, p.base, .03, 60, 16), p.mat)], e = c.getPointAt(1), tg = c.getTangentAt(1);
        const q = new T.Quaternion().setFromUnitVectors(V3(0, 1, 0), tg), at = g => { g.applyQuaternion(q); g.translate(e.x, e.y, e.z); return g; };
        if (p.tip === 'spade') out.push(P(at(K.extr([[0, -.1], [.6, .5], [.15, .7], [0, 1.5], [-.15, .7], [-.6, .5]], .08, .04)), 'horn'));
        if (p.tip === 'club') out.push(P(at(new T.IcosahedronGeometry(.6, 1).translate(0, .4, 0)), 'bone'));
        if (p.tip === 'blade') out.push(P(at(K.extr([[0, 0], [.35, .4], [.15, 2], [0, 2.4], [-.1, 1.6]], .06, .03)), 'metal'));
        if (p.tip === 'stinger') out.push(P(at(new T.SphereGeometry(.35, 16, 12).scale(1, 1.4, 1).translate(0, .3, 0)), 'chitin'), P(at(K.taper(K.bez(V3(0, .6, 0), V3(0, 1.1, .2), V3(0, 1.3, .8)), .14, .005, 14, 8)), 'horn'));
        if (p.tip === 'flame') out.push(P(at(new T.ConeGeometry(.35, 1.4, 12).translate(0, .7, 0)), 'glow'));
        if (p.tip === 'fin') out.push(P(at(K.extr([[0, 0], [1, .8], [.6, 1.2], [0, .6], [-.6, 1.2], [-1, .8]], .05, .02)), 'membrane'));
        if (p.tip === 'crystal') out.push(P(at(new T.LatheGeometry([V2(0, 0), V2(.3, .2), V2(.3, 1), V2(0, 1.5)], 6)), 'crystal'));
        for (let i = 0; i < p.spikes; i++) { const t = (i + .5) / p.spikes * .92, s = c.getPointAt(t), tt = c.getTangentAt(t), r = (p.base + (.03 - p.base) * t) * 1.6;
          const g = new T.ConeGeometry(r * .35, r * 1.2, 8).translate(0, r * .6, 0).rotateX(-Math.PI / 2 + .4); g.applyQuaternion(new T.Quaternion().setFromUnitVectors(V3(0, 1, 0), tt)); out.push(P(g.translate(s.x, s.y, s.z - r * .2), 'horn')); }
        return out; }},
    {id: 'mkr_wing', name: 'Wing maker', sub: 'Wings', params: [num('span', 'Span', 2, 14, .1, 7), num('fingers', 'Finger bones', 2, 7, 1, 4), opt('type', 'Type', ['membrane (dragon / bat)', 'feathers', 'blades (mech)', 'insect (clear)'], 'membrane (dragon / bat)'),
      num('droop', 'Droop', 0, 1, .05, .45), num('ragged', 'Torn edges', 0, 1, .05, 0), opt('mat', 'Material', ['membrane', 'feather', 'chrome', 'glass', 'skin', 'stained'], 'membrane')],
      make: p => { const out = [], arm = K.bez(V3(0, 0, 0), V3(.2, p.span * .3, -.2), V3(.4, p.span * .45, -.3)), wrist = arm.getPointAt(1); out.push(P(K.taper(arm, .22, .14, 20, 10), p.type.startsWith('blades') ? 'chrome' : 'bone'));
        const tips = []; for (let i = 0; i < p.fingers; i++) { const t = p.fingers > 1 ? i / (p.fingers - 1) : 0, a = (15 + t * (95 + p.droop * 40)) * D, L = p.span * (.6 - t * .22);
          const tip = wrist.clone().add(V3(Math.sin(a) * L, Math.cos(a) * L, -.3 - t * .4)); tips.push(tip);
          if (!p.type.startsWith('feathers')) out.push(P(K.taper(K.bez(wrist, wrist.clone().lerp(tip, .5).add(V3(0, .3, 0)), tip), .1, .02, 14, 8), p.type.startsWith('blades') ? 'chrome' : 'bone')); }
        if (p.type.startsWith('membrane') || p.type.startsWith('insect')) { const pts = [[0, 0], [wrist.x, wrist.y]]; tips.forEach((tp, i) => { pts.push([tp.x, tp.y]); const nx = tips[i + 1] || V3(.2, -.4, 0), m = tp.clone().lerp(nx, .5);
            pts.push([m.x - (m.x - wrist.x) * (.25 + p.ragged * .3 * Math.sin(i * 7)), m.y - (m.y - wrist.y) * (.25 + p.ragged * .3)]); }); pts.push([.2, -.2]);
          out.push(P(K.extr(pts, .02, 0).translate(0, 0, -.3), p.type.startsWith('insect') ? 'glass' : p.mat)); }
        if (p.type.startsWith('feathers') || p.type.startsWith('blades')) { for (let i = 0; i < 14; i++) { const t = i / 13, a = (10 + t * 110) * D, L = p.span * (.25 + (1 - Math.abs(t - .25)) * .35), w = .5;
            out.push(P(K.extr([[0, 0], [w * .5, L * .15], [w * .5, L * .75], [0, L], [-w * .3, L * .7], [-w * .3, L * .1]], .05, .02).rotateZ(-a).translate(wrist.x * (1 - t * .5), wrist.y * (1 - t * .7), -.2 - t * .2), p.type.startsWith('blades') ? 'chrome' : p.mat)); } }
        return out; }},
    {id: 'mkr_spikes', name: 'Spike / crystal row maker', sub: 'Spikes', params: [num('count', 'Count', 1, 20, 1, 7), num('len', 'Biggest', .2, 4, .05, 1.6), num('shrink', 'Shrink', 0, .95, .05, .5), num('gap', 'Gap', .1, 2, .05, .6), num('lean', 'Lean back', -60, 60, 1, 25),
      num('rows', 'Rows', 1, 3, 1, 2), opt('shape', 'Shape', ['crystal', 'spike', 'plate', 'blade'], 'crystal'), opt('mat', 'Material', ['crystal', 'crystalred', 'amethyst', 'horn', 'bone', 'chrome', 'bigscale'], 'crystal')],
      make: p => { const out = []; for (let r = 0; r < p.rows; r++) for (let i = 0; i < p.count; i++) { const t = p.count > 1 ? i / (p.count - 1) : 0, L = p.len * (1 - t * p.shrink), x = p.rows === 1 ? 0 : (r / (p.rows - 1) - .5) * L * .9;
        let g; if (p.shape === 'crystal') g = new T.LatheGeometry([V2(0, 0), V2(L * .18, L * .12), V2(L * .18, L * .72), V2(0, L)], 6); else if (p.shape === 'spike') g = new T.ConeGeometry(L * .16, L, 10).translate(0, L / 2, 0);
        else if (p.shape === 'plate') g = K.extr([[0, 0], [L * .4, L * .3], [L * .25, L * .9], [0, L], [-L * .25, L * .9], [-L * .4, L * .3]], .08, .04); else g = K.extr([[0, 0], [L * .25, L * .15], [L * .05, L], [-L * .2, L * .5]], .05, .02);
        out.push(P(g.rotateX(-p.lean * D).rotateZ(x * .3).translate(x, 0, -i * p.gap), p.mat)); } return out; }},
    {id: 'mkr_leg', name: 'Leg maker', sub: 'Legs', params: [opt('type', 'Type', ['dino / digitigrade', 'pillar (elephant)', 'human-like', 'insect / spider', 'bird'], 'dino / digitigrade'), num('len', 'Length', 2, 8, .1, 5), num('thick', 'Thickness', .1, 1.5, .02, .55),
      num('toes', 'Toes', 1, 5, 1, 3), num('clawLen', 'Claws', 0, 1.2, .05, .35), opt('mat', 'Material', ['scale', 'skin', 'fur', 'chitin', 'chrome', 'bigscale'], 'scale')],
      make: p => { const L = p.len, w = p.thick, ty = p.type; let pts, rs;
        if (ty.startsWith('dino')) { pts = [V3(0, 0, 0), V3(0, L * .4, .5 * w), V3(0, L * .72, -.4 * w), V3(0, L, .2)]; rs = t => w * (1.3 - t * .7); }
        else if (ty.startsWith('pillar')) { pts = [V3(0, 0, 0), V3(0, L * .5, .1), V3(0, L, 0)]; rs = t => w * (1.5 - t * .2); }
        else if (ty.startsWith('human')) { pts = [V3(0, 0, 0), V3(0, L * .48, .15), V3(0, L, -.05)]; rs = t => w * (1.2 - t * .5); }
        else if (ty.startsWith('insect')) { pts = [V3(0, 0, 0), V3(0, L * .35, L * .25), V3(0, L, L * .1)]; rs = t => w * (.5 - t * .4) + .02; }
        else { pts = [V3(0, 0, 0), V3(0, L * .35, -.5 * w), V3(0, L * .75, .3 * w), V3(0, L, 0)]; rs = t => w * (1 - t * .75); }
        const out = [P(K.taper(K.cr(pts), rs, 0, 50, 16), p.mat)], e = pts[pts.length - 1];
        if (!ty.startsWith('insect')) out.push(P(new T.SphereGeometry(w * .8, 18, 12).scale(1.2, .55, 1.5).translate(e.x, e.y, e.z + w * .4), p.mat));
        for (let i = 0; i < p.toes; i++) { const t = p.toes > 1 ? i / (p.toes - 1) - .5 : 0, a = t * 1.1, base = V3(e.x + Math.sin(a) * w * .8, e.y, e.z + w * .4 + Math.cos(a) * w * .8);
          if (p.clawLen > 0) out.push(P(K.taper(K.bez(base, base.clone().add(V3(Math.sin(a) * p.clawLen * .5, .1, Math.cos(a) * p.clawLen * .5)), base.clone().add(V3(Math.sin(a) * p.clawLen, .3, Math.cos(a) * p.clawLen))), w * .22, .005, 12, 8, .7), 'horn')); }
        return out; }},
    {id: 'mkr_ear', name: 'Ear / fin maker', sub: 'Faces', params: [num('len', 'Length', .2, 3, .05, 1), num('width', 'Width', .1, 2, .05, .5), num('point', 'Pointy', 0, 1, .05, .7), num('bend', 'Bend back', -60, 90, 1, 20), num('notches', 'Notches', 0, 6, 1, 0),
      opt('mat', 'Material', ['skin', 'fur', 'membrane', 'scale', 'chrome', 'crystal'], 'skin')],
      make: p => { const pts = [[-p.width / 2, 0]]; const n = p.notches; for (let i = 0; i <= 8; i++) { const t = i / 8, y = t * p.len, wv = p.width / 2 * (1 - Math.pow(t, 1 + p.point * 2)) * (n && i % 2 && i < 8 ? .7 : 1); pts.push([wv, y]); }
        for (let i = 8; i >= 0; i--) { const t = i / 8; pts.push([-p.width / 2 * (1 - Math.pow(t, 1 + p.point * 2)), t * p.len]); }
        return [P(K.extr(pts.slice(1), .05, .02).rotateX(-p.bend * D), p.mat)]; }},
  ];
  return M.map(m => ({id: m.id, group: G, sub: m.sub, name: m.name, tags: ['maker', 'sliders'], params: m.params, makeP: m.make, make: () => m.make(Object.fromEntries(m.params.map(q => [q.k, q.def])))}));
  function V2(x, y) { return new T.Vector2(x, y); }
});
