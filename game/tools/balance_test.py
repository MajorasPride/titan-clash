"""Titan Clash balance test: CPU vs CPU fights with no screen.
Usage: python3 balance.py GAME_DIR ROUNDS_PER_PAIR OUT_JSON
Both sides use the same HARD CPU brain and the same damage scale, so only the kits differ."""
import sys, json, subprocess, time, os
from playwright.sync_api import sync_playwright

game_dir, n, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '--bind', '127.0.0.1'], cwd=game_dir,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)

HOOK = r"""
() => {
  window.requestAnimationFrame = () => 0;
  render = () => {}; renderPip = () => {}; wxDraw = () => {};
  try { Snd.init = () => {}; Music.start = () => {}; Music.tick = () => {}; } catch (e) {}
  requestLock = () => {}; goLandscape = () => {};
  window.STAT = null;
  { let hsv = 0; Object.defineProperty(game, 'hitStop', { get() { return hsv; }, set(v) { if (STAT && v > hsv + 1e-4) { const st = (new Error().stack || '').split('\n')[2] || ''; const m = st.match(/:(\d+):\d+\)?$/); const k = (m ? m[1] : '?'); STAT.hsl = STAT.hsl || {}; STAT.hsl[k] = (STAT.hsl[k] || 0) + (v - Math.max(0, hsv)); } hsv = v; }, configurable: true }); }
  { const oT = toast; toast = function (t) { if (STAT) { STAT.toasts = STAT.toasts || {}; const k = String(t).slice(0, 18); STAT.toasts[k] = (STAT.toasts[k] || 0) + 1; } return oT.apply(this, arguments); }; }
  // fake clock: timers fire on the test's own time, not real time
  window.VT = { now: 0, q: [], id: 1 };
  window.setTimeout = (fn, ms) => { const id = VT.id++; VT.q.push({ id, at: VT.now + (ms || 0), fn }); return id; };
  window.clearTimeout = (id) => { VT.q = VT.q.filter(x => x.id !== id); };
  window.vtick = (ms) => { VT.now += ms; for (let g = 0; g < 50; g++) { const due = VT.q.filter(x => x.at <= VT.now); if (!due.length) break; VT.q = VT.q.filter(x => x.at > VT.now); for (const x of due) { try { typeof x.fn === 'function' && x.fn(); } catch (e) {} } } };
  const oHit = Fighter.prototype.takeHit;
  Fighter.prototype.takeHit = function (src, dmg, kb, launch, cont, dir) {
    const hp0 = this.hp, hs0 = game.hitStop || 0; const r = oHit.apply(this, arguments); const d = hp0 - this.hp;
    if (STAT && (game.hitStop || 0) > hs0 + 1e-4) { const k = (src && src.def ? src.def.id : 'hz') + ':' + ((src && src.atk && src.atk.id) || (cont ? 'cont' : 'none')); STAT.hs = STAT.hs || {}; STAT.hs[k] = (STAT.hs[k] || 0) + 1; }
    if (STAT && d > 0 && src && src.def) {
      const mv = (src.atk && src.atk.id) || (cont ? 'over-time' : 'other');
      const k = src.def.id + ':' + (src.F && src.F.name || '') + ':' + mv;
      const m = STAT.moves[k] = STAT.moves[k] || { dmg: 0, hits: 0 }; m.dmg += d; m.hits++;
    }
    return r;
  };
  const oStart = Fighter.prototype.startAtk;
  Fighter.prototype.startAtk = function (id) {
    if (STAT && this.def) { const k = this.def.id + ':' + (this.F && this.F.name || '') + ':' + id; STAT.used[k] = (STAT.used[k] || 0) + 1; }
    return oStart.apply(this, arguments);
  };
}
"""

ROUND = r"""
([a, b]) => {
  selId = a; oppId = b; mapSel = 'neon'; vsMode = 'cpu'; diff = 'hard';
  try { COST[a] = 'classic'; } catch (e) {}
  STAT = STAT || { moves: {}, used: {} };
  VT.q = []; startMatch();
  game.cfg = Object.assign({}, DIFF.hard, { dmg: 1 });
  game.p.pilot = new AI(game.p, game.e, game.cfg);
  ai = new AI(game.e, game.p, game.cfg);
  game.timeScale = 1;
  let slow = 0, t = performance.now(), steps = 0, stunRun = [0, 0], maxStun = [0, 0], maxCombo = [0, 0];
  const F = [game.p, game.e];
  // let the intro countdown run
  vtick(1600);  // countdown -> FIGHT!
  const t0 = game.time;
  while (game.state === 'fight' && steps < 12000) {
    t += 16.7; vtick(16.7); if ((game.hitStop||0) > 0) slow++; if (game.timeScale < .9) (window.TSC = window.TSC || {})[game.timeScale.toFixed(2) + (game.cut ? 'cut' : '') + ((typeof CINE!=='undefined'&&CINE.on) ? 'cine' : '')] = ((window.TSC||{})[game.timeScale.toFixed(2) + (game.cut ? 'cut' : '') + ((typeof CINE!=='undefined'&&CINE.on) ? 'cine' : '')] || 0) + 1; loop(t); steps++; 
    for (let i = 0; i < 2; i++) {
      const f = F[i];
      if (f.stun > 0) { stunRun[i] += game.time - (f._lt || game.time); maxStun[i] = Math.max(maxStun[i], stunRun[i]); } else stunRun[i] = 0;
      maxCombo[i] = Math.max(maxCombo[i], f.combo || 0); f._lt = game.time;
    }
  }
  const hpA = game.p.hp / game.p.def.hp, hpB = game.e.hp / game.e.def.hp;
  const ko = game.p.hp <= 0 || game.e.hp <= 0;
  const dbg = {  ts: game.timeScale, hs: game.hitStop, cut: !!game.cut, cine: (typeof CINE!=='undefined')&&CINE.on, q: VT.q.length };
  const endState = game.state, endTimer = game.timer, paused = game.paused, steps_ = steps;
  const tsc = window.TSC || {}; window.TSC = {};
  return { tsc, slowFrac: +(slow/Math.max(1,steps)).toFixed(2), dbg, endState, endTimer, paused, steps: steps_, a, b, winner: hpA >= hpB ? a : b, ko, time: game.time - t0, hpA, hpB, maxStun, maxCombo,
           stanceA: game.p.F && game.p.F.name, stanceB: game.e.F && game.e.F.name };
}
"""

roster = os.environ.get('ROSTER','valor,ashvin,infernoth').split(',')
results = []
with sync_playwright() as p:
    br = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio'])
    pg = br.new_page(viewport={'width': 960, 'height': 540})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:8765/titan-clash.html')
    pg.wait_for_function('typeof startMatch==="function" && typeof Fighter!=="undefined"', timeout=60000)
    time.sleep(2)
    pg.evaluate(HOOK)
    for i, a in enumerate(roster):
        for b in roster[i + 1:]:
            for k in range(n):
                # swap sides every other fight so side doesn't matter
                x, y = (a, b) if k % 2 == 0 else (b, a)
                try:
                    r = pg.evaluate(ROUND, [x, y])
                except Exception as e:
                    r = {'a': x, 'b': y, 'error': str(e)[:300]}
                results.append(r)
                print(json.dumps(r), flush=True)
    stat = pg.evaluate('STAT')
    json.dump({'results': results, 'stat': stat, 'errors': errs[:30]}, open(out, 'w'), indent=1)
    br.close()
srv.terminate()
