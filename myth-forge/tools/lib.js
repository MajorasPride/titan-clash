// Mythic Forge headless harness (not in the repo). Usage: const H = require('./lib'); const {page, close} = await H.open('phone');
const {chromium} = require('/opt/npm-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = '/home/claude/titan-clash/myth-forge', THREE = '/home/claude/harness/node_modules/three';
const MIME = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png'};
let server, port;
async function serve() {
  if (server) return port;
  server = http.createServer((q, s) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/test.html'; const f = path.join(ROOT, p);
    fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, {'content-type': MIME[path.extname(f)] || 'application/octet-stream'}); s.end(d); }); });
  await new Promise(r => server.listen(0, r)); port = server.address().port; return port;
}
const SIZES = {phone: {viewport: {width: 412, height: 915}, hasTouch: true, isMobile: true, deviceScaleFactor: 1}, pc: {viewport: {width: 1920, height: 1080}, deviceScaleFactor: 1}, pcs: {viewport: {width: 1100, height: 800}, deviceScaleFactor: 1}};
async function open(size = 'phone', file = 'test.html') {
  await serve();
  const browser = await chromium.launch({executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox']});
  const ctx = await browser.newContext(SIZES[size]);
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\/(.*)/, (route, req) => { const m = req.url().match(/three@0\.160\.0\/(.*)$/); const f = path.join(THREE, m[1].split('?')[0]);
    fs.readFile(f, (e, d) => e ? route.fulfill({status: 404}) : route.fulfill({status: 200, contentType: 'text/javascript', body: d})); });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1|localhost|cdn\.jsdelivr)/, r => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e.stack || e.message).slice(0, 600)));
  page.on('dialog', d => d.accept());
  await page.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); let q = []; window.__free = false; window.requestAnimationFrame = f => { if (window.__free) return raf(f); q.push(f); return q.length; }; window.__frames = n => { for (let i = 0; i < n; i++) { const qq = q; q = []; const t = performance.now(); qq.forEach(f => { try { f(t); } catch (e) { console.error(e); } }); } }; try { localStorage.setItem('mf-tour2-done', '1'); localStorage.setItem('mf-m-intro', '1'); localStorage.setItem('mf-tour-done', '1'); } catch (e) {} });
  await page.goto(`http://127.0.0.1:${port}/${file}`);
  await page.waitForFunction(() => window.__def && window.__v3 && window.__btx, null, {timeout: 60000});
  await page.evaluate(() => window.__frames(3));
  return {page, errs, browser, close: () => browser.close()};
}
module.exports = {open, serve, stop: () => server && server.close()};
