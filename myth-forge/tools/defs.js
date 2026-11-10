// screenshots of every body type's default build: node defs.js [size] [outdir] [k1,k2,...]
const H = require('./lib'), fs = require('fs');
(async () => {
  const size = process.argv[2] || 'pcs', out = process.argv[3] || '/home/claude/harness/shots', only = process.argv[4] ? process.argv[4].split(',') : null;
  fs.mkdirSync(out, {recursive: true});
  const {page, errs, close} = await H.open(size);
  const keys = await page.evaluate(() => Object.keys(window.__dbg().SKEL));
  console.log(keys.length, 'body types');
  const rep = {};
  for (const k of keys) { if (only && !only.includes(k)) continue;
    const n0 = errs.length;
    const r = await page.evaluate(k => { try { window.__fresh(k); window.__def(k); } catch (e) { return {err: String(e)}; }
      const P = window.__v3.P(); window.__v3.nb();
      return {n: P.parts.length, base: P.parts.filter(p => p.lib.startsWith('base_')).map(p => p.bone)}; }, k);
    await page.evaluate(() => { if(!window.__sh){window.__sh=1;const st=document.createElement('style');st.textContent='#sheet,#vtools,#mbar,#tip,#outliner,#fwin,.top ~ button, body > button{display:none!important}';document.head.appendChild(st);} window.__v3.look(null, [1, .25, .8], 1.9); });
    await page.evaluate(() => window.__frames(2));
    const cv = await page.$('#c');
    await page.screenshot({path: `${out}/${k}-a.png`});
    await page.evaluate(() => window.__v3.look(null, [-.15, .1, 1], 1.9)); await page.evaluate(() => window.__frames(2));
    await page.screenshot({path: `${out}/${k}-b.png`});
    rep[k] = {...r, errs: errs.slice(n0)};
    console.log(k, JSON.stringify(rep[k]));
  }
  fs.writeFileSync(out + '/report.json', JSON.stringify(rep, null, 1));
  await close(); H.stop();
})();
