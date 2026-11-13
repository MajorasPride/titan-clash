// Wing / fin fit check (T031, Nov 13 2026): node wings.js [libs] [body types]  (MODES=L,R,both|def OUT=file.json) -> gap (root to shoulder), reach (tip vs bone tip), membrane direction per side
// node wingprobe.js [libs] [skels] -> per (skel, lib, side, mode) metrics
const H = require('./lib'), fs = require('fs');
const LIBS = (process.argv[2] || 'bb_fin,tw_wing_bat,kw_bat,kw_bat_simple,kw_bat_rag,kw_feather,kw_feather_simple,sx_wing_feather,tw_wing_insect,kw_insect_wasp,kw_insect_fly,kw_moth,kw_butterfly,mo_wing,mo_wing_hind,mo_wing_dark,ks_fin_pectoral,ks_fin_round,ks_fin_spiny,ks_fin_small,tw_wing_mech,sd_wing_sand,base_wing').split(',');
const SK = (process.argv[3] || 'bird,dragon,wyvern,angel,demon,fish,bonyfish,kraken,moth,wasp').split(',');
(async () => { const {page, errs, close} = await H.open('pcs'); const out = [];
 for (const k of SK) for (const lib of LIBS) for (const mode of (process.env.MODES || 'L,R,both').split(',')) {
  const r = await page.evaluate(([k, lib, mode]) => { const V = window.__v3, T = window.THREE_ || null;
   window.__fresh(k); const bones = V.bones(), P = V.P(); const wb = P.bones.filter(b => b[4] === 'wingA' && /^(wing|fin)\.(L|R)$/.test(b[0]));
   if (!wb.length) return null; const name = mode === 'R' ? wb.find(b => b[0].endsWith('.R'))[0] : wb.find(b => b[0].endsWith('.L'))[0];
   let added; if (mode === 'def') { window.__def(k); added = V.P().parts.filter(p => /^(wing|fin|hindwing)\.(L|R)$/.test(p.bone)); } else {
   V.mirror(mode === 'both'); const before = new Set(P.parts.map(p => p.uid)); V.addPart(lib, name, [0, 0, 0], [0, 0, 0]); V.mirror(false);
   added = V.P().parts.filter(p => !before.has(p.uid)); } window.__frames(1);
   const res = {};
   for (const pt of added) { const v = V.views()[pt.uid]; if (!v) continue; v.G.updateMatrixWorld(true); const pts = [];
    v.G.traverse(o => { if (!o.isMesh || !o.visible || !o.geometry.attributes.position) return; const a = o.geometry.attributes.position, n = a.count, st = Math.max(1, Math.floor(n / 400)); for (let i = 0; i < n; i += st) { const p = new o.position.constructor(a.getX(i), a.getY(i), a.getZ(i)).applyMatrix4(o.matrixWorld); pts.push(p); } });
    const b = bones[pt.bone]; const s0 = b.getWorldPosition(new pts[0].constructor()); let c = b; const tags = []; // chain end
    const chainEnd = (() => { const rows = P.bones; let n = pt.bone; for (;;) { const kid = rows.find(r => r[1] === n && /^wing/.test(r[4])); if (!kid) break; n = kid[0]; } const bb = bones[n]; return bb.localToWorld(new pts[0].constructor(0, bb.userData.len, 0)); })();
    const spar = chainEnd.clone().sub(s0), L = spar.length(); spar.normalize();
    let near = 1e9, far = null, fd = 0; const cen = new pts[0].constructor(); pts.forEach(p => { const d = p.distanceTo(s0); if (d < near) near = d; if (d > fd) { fd = d; far = p; } cen.add(p); }); cen.multiplyScalar(1 / pts.length);
    const off = cen.clone().sub(s0); const along = off.dot(spar); const perp = off.clone().addScaledVector(spar, -along);
    const fdir = far.clone().sub(s0).normalize();
    const mn = [1e9,1e9,1e9], mx = [-1e9,-1e9,-1e9]; pts.forEach(p => { ['x','y','z'].forEach((a, i) => { mn[i] = Math.min(mn[i], p[a]); mx[i] = Math.max(mx[i], p[a]); }); });
    res[pt.bone + (res[pt.bone] ? '#' + pt.lib : '')] = {lib: pt.lib, s: pt.s, r: pt.r, flip: pt.flip, L: +L.toFixed(2), gap: +(near / L).toFixed(2), reach: +(fd / L).toFixed(2), ang: +(Math.acos(Math.max(-1, Math.min(1, fdir.dot(spar)))) * 57.3).toFixed(0), perp: perp.toArray().map(x => +(x / L).toFixed(2)), cen: cen.toArray().map(x => +x.toFixed(2)), s0: s0.toArray().map(x => +x.toFixed(2)), spar: spar.toArray().map(x => +x.toFixed(2)), mn: mn.map(x=>+x.toFixed(2)), mx: mx.map(x=>+x.toFixed(2))};
   }
   return {n: added.length, res};
  }, [k, lib, mode]);
  if (!r) continue; out.push({k, lib, mode, ...r}); console.log(k, lib, mode, JSON.stringify(r.res)); }
 fs.writeFileSync(process.env.OUT || 'wingprobe.json', JSON.stringify(out, null, 1)); console.log('errs', errs.slice(0, 5)); await close(); H.stop(); })();
