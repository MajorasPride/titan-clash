// ====================================================================== 📱 M (Nov 9 2026 5pm, TEST PAGE ONLY: window.MF_M)
// Inlined after forge-core.js + forge-v3.js into test.html by build.py, so it shares their scope (P, LIB, views, select, paint, tab...).
// 1. Phone layout: the creature fills the screen, one slim bottom bar (Add / Select / Paint / Sculpt / More). A tool's options slide up, then tuck away.
// 2. 🎬 Studio button (top bar): Level Builder, Sketch Pad, FX Lab, Stage as their own spaces.
// 3. ◎ Radial tool wheels: press and hold anywhere, the pen's side button, right-click on PC, or the ◎ button. One wheel per mode, sub-wheels with Back, pages.
// 4. 🔖 Mark tool (Paint): mark several parts (or pieces), paint them all together, save marks as groups.
{
  const M = window.MFM = {};
  const css = document.createElement('style'); css.textContent = `
  #mbar{display:none}
  body.mfm #mbar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:6;background:var(--pn);border-top:1px solid var(--ln);padding:4px 4px calc(4px + env(safe-area-inset-bottom));gap:4px}
  #mbar button{flex:1 1 0;min-height:50px;font:700 11.5px system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:2px;border-radius:10px}
  #mbar button i{font-style:normal;font-size:20px;line-height:1}
  body.mfm #sheet,body.mfm #sheet.tall,body.mfm #sheet.min{height:auto;max-height:50vh;bottom:calc(59px + env(safe-area-inset-bottom));transform:translateY(calc(100% + 90px));transition:transform .16s ease-out;border-bottom:1px solid var(--ln)}
  body.mfm.mup #sheet{transform:none}
  body.mfm.gdrag #sheet{transform:translateY(calc(100% + 90px));opacity:1}
  body.mfm #sheet .tops,body.mfm #sheet #subtabs{display:none!important}
  body.mfm #sheet.min .pane.on{display:block!important}
  #msub{display:none}
  body.mfm #msub{display:flex;gap:5px;align-items:center;flex:none;margin-bottom:5px;overflow-x:auto}
  #msub button{min-height:38px;padding:4px 10px;font-size:13px;flex:none}
  #msub .sp{flex:1}
  body.mfm #vtools{bottom:calc(68px + env(safe-area-inset-bottom))}
  body.mfm.mup #vtools{display:none}
  body.mfm #tip{top:auto;bottom:calc(72px + env(safe-area-inset-bottom))}
  body.mfm.mup #tip{bottom:calc(50vh + 72px)}
  body.mfm.guiding #mbar,body.mfm.full #mbar{display:none}
  body.mfm .top h1{display:none}
  body.mfm.guiding:not(.gside) #vtools{bottom:calc(56vh + 8px)}
  #guide .gb{position:sticky;bottom:calc(-8px - env(safe-area-inset-bottom));background:rgba(30,26,20,.98);padding:6px 0 calc(8px + env(safe-area-inset-bottom));margin-top:4px;z-index:2}
  #studio{position:fixed;inset:0;z-index:40;background:rgba(12,12,16,.97);display:none;flex-direction:column;padding:max(14px,env(safe-area-inset-top)) 14px 14px;overflow:auto}
  #studio.open{display:flex}
  #studio h2{font:800 20px system-ui;color:var(--ac);margin:4px 0 2px;letter-spacing:1px}
  #studio p{margin:0 0 12px;opacity:.7;font-size:13px}
  #studio .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
  #studio .card{display:flex;flex-direction:column;gap:4px;align-items:flex-start;text-align:left;min-height:120px;padding:12px;border-radius:14px;border:1px solid var(--ln);background:#24242c;color:var(--tx);text-decoration:none;font:700 15px system-ui}
  #studio .card i{font-style:normal;font-size:34px;line-height:1.1}
  #studio .card small{font-weight:500;font-size:12px;opacity:.7}
  #studio .card.here{border-color:var(--ac)}
  #studio .x{align-self:flex-end;min-height:44px;padding:6px 16px}
  #wheelBg{position:fixed;inset:0;z-index:30;display:none;touch-action:none}
  #wheel{position:fixed;z-index:31;display:none;pointer-events:none;touch-action:none;user-select:none;-webkit-user-select:none}
  #wheel svg{display:block;filter:drop-shadow(0 4px 14px rgba(0,0,0,.6))}
  #wheel path{fill:rgba(34,34,42,.94);stroke:#5a5a68;stroke-width:1.2}
  #wheel path.hot{fill:#ff8a3a;stroke:#ffd0a8}
  #wheel path.nav{fill:rgba(50,46,62,.96)}
  #wheel path.off{opacity:.35}
  #wheel path.lit{fill:rgba(74,58,34,.96);stroke:var(--ac,#ff8c32)}
  #wheel circle{fill:rgba(20,20,26,.96);stroke:#5a5a68;stroke-width:1.2}
  #wheel .lb{position:absolute;transform:translate(-50%,-50%);text-align:center;font:700 10.5px/1.1 system-ui;color:#f4f0e6;width:66px;pointer-events:none}
  #wheel .lb i{display:block;font-style:normal;font-size:19px;line-height:1.15}
  #wheel .lb.hot{color:#1a1208}
  #wheel .mid{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:700 10px/1.1 system-ui;color:#c8c4b8;text-align:center;width:70px;pointer-events:none}
  #markRow button.on{background:#12606e;border-color:#35e0ff;color:#dffaff}
  #markGroups button{position:relative;padding-right:30px}
  #markGroups button span{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:22px;height:22px;line-height:22px;border-radius:50%;background:rgba(0,0,0,.35);font-size:12px}
  #mintro{position:fixed;left:10px;right:10px;bottom:calc(70px + env(safe-area-inset-bottom));z-index:35;background:rgba(30,26,20,.97);border:1px solid var(--ac);border-radius:14px;padding:12px;font-size:13.5px;line-height:1.4;max-width:460px;margin:0 auto;box-shadow:0 4px 18px rgba(0,0,0,.5)}
  #mintro b{color:var(--ac2,#ffd166)} #mintro button{margin-top:8px;min-height:42px;width:100%}
  #sdock{position:fixed;left:6px;bottom:calc(68px + env(safe-area-inset-bottom));z-index:5;display:none;flex-direction:column;gap:6px;align-items:center;touch-action:none;user-select:none;-webkit-user-select:none}
  body.sdockR #sdock{left:auto;right:6px} body.sdockR.sdockOn #vtools{right:auto;left:6px} body.sdockR.sdockOn #vtools .vk{align-self:flex-start}
  body.sdockOn #sdock{display:flex} body.mup #sdock,body.guiding #sdock,body.full #sdock{display:none}
  #sdock button{width:54px;min-height:46px;padding:2px;border-radius:14px;font:700 10px/1.1 system-ui;background:rgba(40,40,50,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
  #sdock button i{font-style:normal;font-size:19px;line-height:1}
  #sdock button.big{min-height:58px;border-color:var(--ac,#ff8c32)} #sdock button.big i{font-size:26px}
  #sdock button.on{background:#5a3a14;border-color:var(--ac,#ff8c32);color:#ffd9b0}
  #sdock .pad{width:54px;height:96px;border-radius:14px;border:1px solid #4c4c58;background:rgba(40,40,50,.92);position:relative;overflow:hidden;font:700 10px/1.1 system-ui;color:#f4f0e6;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:5px 0;touch-action:none}
  #sdock .pad .fill{position:absolute;left:0;right:0;bottom:0;background:rgba(255,140,50,.38);pointer-events:none}
  #sdock .pad span{position:relative;pointer-events:none} #sdock .pad .v{font-size:13px}
  #sdock .pad.drag{border-color:var(--ac,#ff8c32)}
  #sdock.small .x2{display:none}
  `; document.head.append(css);
  const mk = (tag, props, ...kids) => { const x = Object.assign(document.createElement(tag), props || {}); x.append(...kids); return x; };
  const click = q => { const b = typeof q === 'string' ? document.querySelector(q) : q; if (b) b.click(); return !!b; };
  const phone = () => !(innerWidth >= 760 && innerWidth > innerHeight);
  const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; };

  // ------------------------------------------------------------------ 1. phone layout
  const TOOLS = {add: ['add'], select: ['edit', 'shape'], paint: ['paint'], sculpt: ['sculpt', 'shape'], more: ['start', 'skel', 'fx']};
  const TOOL_BTN = [['add', '＋', 'Add'], ['select', '👆', 'Select'], ['paint', '🎨', 'Paint'], ['sculpt', '🗿', 'Sculpt'], ['more', '⚙', 'More']];
  const TAB_NAME = {add: '＋ Add parts', edit: '✋ Move & size', shape: '🎚 Shape sliders', paint: '🎨 Paint', sculpt: '🗿 Sculpt', start: '🏁 Start', skel: '🦴 Skeleton & pose', fx: '👁 View & look'};
  let tool = 'add', pinned = LS('mf-m-pin') === '1';
  const bar = mk('div', {id: 'mbar'}); document.body.append(bar);
  const msub = mk('div', {id: 'msub'}); $('grab').after(msub);
  const up = () => document.body.classList.contains('mup');
  // when the menu slides up and the creature would sit behind it, fit the creature into what is left of the screen
  const hiddenBehind = () => { try { const b = new THREE.Box3().setFromObject(skelRoot); if (b.isEmpty()) return false; const c = b.getCenter(new THREE.Vector3()).project(camera), y = (1 - c.y) / 2 * innerHeight; return y > $('sheet').getBoundingClientRect().top - 30; } catch (e) { return false; } };
  const setUp = on => { if (up() === !!on) return; document.body.classList.toggle('mup', !!on); setTimeout(() => { resize(); if (on && hiddenBehind()) frameAll(); }, 200); barUI(); };
  const toolOf = t => (TOOLS[tool].includes(t) ? tool : Object.keys(TOOLS).find(k => TOOLS[k].includes(t))) || 'more';
  function barUI() { bar.innerHTML = ''; for (const [k, ic, name] of TOOL_BTN) bar.append(mk('button', {className: k === tool ? 'on' : '', onclick: () => setTool(k, !(k === tool && up()))}, mk('i', {textContent: ic}), name + (k === tool && up() ? ' ▾' : '')));
    msub.innerHTML = ''; const tabs = TOOLS[tool]; if (tabs.length > 1) for (const t of tabs) msub.append(mk('button', {textContent: TAB_NAME[t], className: t === tab ? 'on' : '', onclick: () => click(tabBtn(t))}));
    else msub.append(mk('b', {textContent: TAB_NAME[tabs[0]], style: 'font-size:13px;padding:0 4px'}));
    msub.append(mk('span', {className: 'sp'}), mk('button', {textContent: pinned ? '📌 Stays open' : '📌', title: 'Keep this open while I work on the model', className: pinned ? 'on' : '', onclick: () => { pinned = !pinned; LS('mf-m-pin', pinned ? '1' : '0'); barUI(); tip(pinned ? '📌 The menu stays open while you work' : 'The menu tucks away when you touch the model', 2200); }}),
      mk('button', {textContent: '▾ Tuck', onclick: () => setUp(false)})); }
  let quiet = false;
  function setTool(k, open) { tool = k; if (!TOOLS[k].includes(tab)) { quiet = true; click(tabBtn(TOOLS[k][0])); quiet = false; } if (open !== undefined) setUp(open); barUI(); }
  M.setTool = setTool; M.setUp = setUp; M.up = up; M.tool = () => tool;
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => { tool = toolOf(b.dataset.tab); if (!quiet && document.body.classList.contains('mfm')) setUp(true); barUI(); }));
  // touching the model tucks the menu away (unless pinned)
  canvas.addEventListener('pointerdown', () => { if (document.body.classList.contains('mfm') && up() && !pinned) setUp(false); }, true);
  // the handle: tap or drag down = tuck (no small / tall states in this layout)
  $('sheet').addEventListener('pointerdown', e => { if (!document.body.classList.contains('mfm') || !e.target.closest('#grab')) return; e.stopPropagation(); setUp(false); }, true);
  const layout = () => { const on = phone(); if (document.body.classList.contains('mfm') !== on) { document.body.classList.toggle('mfm', on); $('sheet').classList.remove('min', 'tall'); if (on) document.body.classList.remove('mup'); barUI(); setTimeout(resize, 60); } };
  addEventListener('resize', layout); layout(); barUI();
  if (document.body.classList.contains('mfm')) setTimeout(() => { try { frameAll(); } catch (e) {} }, 350);
  // Paint: skins first. The 🌋 Element / 🤖 Mech it / 🫧 Ooze block folds away under the skins instead of sitting on top of them
  { let v = $('v3paint'); if (!v && window.MF_V3) v = mk('div', {id: 'v3paint'}); if (v) { const d = mk('details', {className: 'more', id: 'v3fold'}, mk('summary', {textContent: '🌋 Elements · 🤖 Mech it · 🔢 Paint by number · 🫧 Ooze ▾'})); const after = $('sBright') ? $('sBright').closest('.sl') : $('mats'); after.after(d); d.append(v); } }
  // first run on a phone: one short card in place of the old 9-step tour
  setTimeout(() => { if (!document.body.classList.contains('mfm')) return; if ($('tour').style.display !== 'none') tourEnd(); if (LS('mf-m-intro')) return;
    const c = mk('div', {id: 'mintro'}); c.innerHTML = '<b>New phone layout</b><br>Your creature gets the whole screen. The bar at the bottom has your tools: tap one and its options slide up, touch the model and they tuck away.<br><b>◎ Tool wheel:</b> press and hold on the screen (or the pen\'s side button), then flick toward a tool.<br><b>🎬 Studio</b> (top) opens the Level Builder, Sketch Pad and FX Lab.';
    c.append(mk('button', {textContent: 'Got it', className: 'on', onclick: () => { c.remove(); LS('mf-m-intro', '1'); }})); document.body.append(c); }, 900);

  // ------------------------------------------------------------------ 2. Studio button
  const studio = mk('div', {id: 'studio'}); document.body.append(studio);
  const ICONS = {'Creature Forge': '🐉', 'Level Builder': '🏙', 'Sketch Pad': '✏️', 'FX Lab': '✨', 'Stage': '🎬'};
  function studioOpen() { studio.innerHTML = ''; studio.append(mk('button', {className: 'x', textContent: '✕ Close', onclick: () => studio.classList.remove('open')}), mk('h2', {textContent: '🎬 STUDIO'}), mk('p', {textContent: 'Each tool is its own space. Things you make are shared between them.'}));
    const cards = mk('div', {className: 'cards'}); studio.append(cards);
    document.querySelectorAll('#sections a.sec').forEach(a => { const sm = a.querySelector('small'), name = a.childNodes[0].textContent.replace(/^[^A-Za-z]+/, '').trim(), here = a.classList.contains('on');
      const c = mk('a', {className: 'card' + (here ? ' here' : '')}, mk('i', {textContent: ICONS[name] || '🧰'}), name, mk('small', {textContent: here ? 'You are here' : sm ? sm.textContent : ''}));
      if (here) c.onclick = () => studio.classList.remove('open'); else { c.href = a.getAttribute('href'); if (a.target) { c.target = a.target; c.rel = 'noopener'; } } cards.append(c); });
    studio.classList.add('open'); }
  const bStudio = mk('button', {id: 'bStudio', textContent: '🎬 Studio', onclick: studioOpen}); $('bList').after(bStudio); M.studio = studioOpen;

  // ------------------------------------------------------------------ 3. radial tool wheels
  const R = 126, R0 = 38, MAXS = 8;
  const wbg = mk('div', {id: 'wheelBg'}), wel = mk('div', {id: 'wheel'}); document.body.append(wbg, wel);
  let W = null;   // {x, y, stack: [{t, items, page}], hold: pointerId | null, hot: -1, slots: []}
  const nudge = (id, f, add) => () => { const el = $(id); if (!el) return; const lo = +el.min, hi = +el.max, v = Math.max(lo, Math.min(hi, add ? +el.value + f : +el.value * f)); el.value = v; el.dispatchEvent(new Event('input', {bubbles: true})); el.dispatchEvent(new Event('change', {bubbles: true})); };
  const go = t => () => { quiet = true; click(tabBtn(t)); quiet = false; tool = toolOf(t); barUI(); };
  const goOpen = t => () => { click(tabBtn(t)); };
  const needSel = f => () => { if (!sel) return tip('Tap a part first', 1600); f(); };
  const B = (i, t, q, extra) => ({i, t, run: () => click(q), ...(extra || {})});
  const lit = q => () => { const b = document.querySelector(q); return !!(b && b.classList.contains('on')); };
  const toolsSub = () => [{i: '＋', t: 'Add parts', run: goOpen('add')}, {i: '👆', t: 'Select', run: go('edit')}, {i: '🎨', t: 'Paint', run: go('paint')}, {i: '🗿', t: 'Sculpt', run: go('sculpt')},
    {i: '🏁', t: 'Start', run: goOpen('start')}, {i: '🦴', t: 'Skeleton', run: goOpen('skel')}, {i: '👁', t: 'View & look', run: goOpen('fx')}, B('🎓', 'Build together', '#bGuide'), {i: '🎬', t: 'Studio', run: studioOpen}, B('💾', 'Save as', '#mSave'), B('⤢', 'Full screen', '#bFull')];
  const sizeSub = () => [{i: '➕', t: 'Bigger', keep: 1, run: needSel(nudge('sSize', 1.1))}, {i: '➖', t: 'Smaller', keep: 1, run: needSel(nudge('sSize', 1 / 1.1))}, {i: '↕', t: 'Longer', keep: 1, run: needSel(nudge('sLen', 1.1))}, {i: '↕', t: 'Shorter', keep: 1, run: needSel(nudge('sLen', 1 / 1.1))},
    {i: '↔', t: 'Wider', keep: 1, run: needSel(nudge('sWid', 1.1))}, {i: '↔', t: 'Thinner', keep: 1, run: needSel(nudge('sWid', 1 / 1.1))}, B('↻', 'Fit to body', '#bRefit')];
  const catsSub = () => GROUP_ORDER.filter(g => g !== 'Base Body' && Object.values(LIB).some(e => e.group === g)).map(g => ({i: '📂', t: g.replace(' & ', ' + ').replace(/\s*\(.*\)/, ''), run: () => { click(tabBtn('add')); gFilter = g; sFilter = null; query = ''; $('search').value = ''; libUI(); }}));
  const viewSub = () => [B('🎯', 'Fit screen', '[data-nav="fit"]'), B('🔍', 'Focus', '#bFocus'), B('🔗', 'Joint', '#bJointV'), B('🙈', 'Hide part', '#bHide'), B('☝', 'Only this', '#bSolo'), B('👁', 'Show all', '#bShowAll'), B('🦴', 'Bones', '#bVBones'), B('🔌', 'Plugs', '#bPlugsV'), B('🪟', 'Window', '#bFWin')];
  const brushName = k => { const b = document.querySelector('[data-br="' + k + '"]'); return b ? b.textContent.replace(/^[^A-Za-z]+/, '') : k; };
  const brushSub = ks => () => ks.map(k => ({i: '🖌', t: brushName(k), run: () => click('[data-br="' + k + '"]'), on: lit('[data-br="' + k + '"]')}));
  const skinsSub = () => [...new Set(MATS.LIST.map(l => l[2]))].map(c => ({i: '🧴', t: c.replace(/\s*\(.*\)/, '').replace(' & ', ' + '), sub: () => MATS.LIST.filter(l => l[2] === c).map(l => ({i: '', t: l[1], col: l[4], run: () => { matCat = c; paint(l[0]); if (tab === 'paint') matsUI(); }}))}));
  const markSub = () => [{i: '🔖', t: markMode ? 'Marking: ON' : 'Mark parts', run: () => setMark(!markMode), on: () => markMode}, {i: '🧴', t: 'Skin on marked', sub: skinsSub}, {i: '🧽', t: 'Clear marks', run: () => clearMarks()}, {i: '💾', t: 'Save group', run: () => { click(tabBtn('paint')); saveGroupUI(); }},
    ...(P.markGroups || []).map((g, n) => ({i: '📁', t: g.n, run: () => loadGroup(n)}))];
  const WHEELS = {
    build: () => [{i: '＋', t: 'Add', sub: catsSub}, {i: '👆', t: typeof selOnly !== 'undefined' && selOnly ? 'Pick → Drag' : 'Drag → Pick', run: () => click('#bPickV')},
      {i: '🎯', t: 'Arrows', sub: () => [{i: '✥', t: 'Move', run: () => { click('#bArrowMode'); click('[data-gz="translate"]'); }}, {i: '⟳', t: 'Turn', run: () => { click('#bArrowMode'); click('[data-gz="rotate"]'); }}, {i: '⤡', t: 'Stretch', run: () => { click('#bArrowMode'); click('[data-gz="scale"]'); }}, B('👆', 'Arrows off', '#bPickMode')]},
      {i: '📏', t: 'Size', sub: sizeSub}, {i: '⧉', t: 'Copy', sub: () => [B('⧉', 'Duplicate', '#bDup'), B('🪞', 'Mirror copy', '#bMirrorPart'), B('📄', 'Copy', '#bCopy'), B('📋', 'Paste', '#bPaste'), B('📄', 'Copy all', '#bCopyAll'), B('🧩', 'Break apart', '#bBreak')]},
      {i: '🗑', t: 'Remove', run: needSel(() => click('#bTrash') || click('#bDel'))}, {i: '👁', t: 'View', sub: viewSub}, {i: '🧰', t: 'Tools', sub: toolsSub}],
    paint: () => [{i: '🧴', t: 'Skins', sub: skinsSub}, {i: '🖌', t: 'Brushes', sub: () => [...['color', 'skin', 'blend', 'blotch', 'spray'].map(k => ({i: '🖌', t: (document.querySelector('[data-pb="' + k + '"]') || {textContent: k}).textContent.replace(/^[^A-Za-z]+/, ''), run: () => { const b = document.querySelector('[data-pb="' + k + '"]'); if (b && !b.classList.contains('on')) b.click(); }, on: lit('[data-pb="' + k + '"]')})),
        {i: '👆', t: 'Brush off', run: () => click('[data-pb].on')}, B('🧽', 'Clear paint', '#bBrushErase')]},
      {i: '🔖', t: 'Mark', sub: markSub, on: () => markMode || marks.size > 0}, {i: '🎨', t: 'Paint all', run: () => click('#bPaintAll'), on: lit('#bPaintAll')},
      {i: '📏', t: 'Brush size', sub: () => [{i: '➕', t: 'Bigger', keep: 1, run: nudge('sPSize', 1.2)}, {i: '➖', t: 'Smaller', keep: 1, run: nudge('sPSize', 1 / 1.2)}, {i: '💪', t: 'Stronger', keep: 1, run: nudge('sPStr', .1, 1)}, {i: '🪶', t: 'Softer', keep: 1, run: nudge('sPStr', -.1, 1)}, {i: '🔆', t: 'Brighter', keep: 1, run: nudge('sBright', .05, 1)}, {i: '🔅', t: 'Darker', keep: 1, run: nudge('sBright', -.05, 1)}]},
      {i: '🪞', t: 'Both sides', run: () => click('#bPaintTwin'), on: lit('#bPaintTwin')}, {i: '✨', t: 'Effects', sub: () => [B('💨', 'Fade away', '#bFade'), B('💧', 'Drip', '#bPDrip'), B('✨', 'Glitter', '#bGlit'), B('🎯', 'One piece', '#bPiecePaint'), B('🖼', 'Sticker', '#bSticker')]}, {i: '🧰', t: 'Tools', sub: toolsSub}],
    sculpt: () => [{i: '🧱', t: 'Build up', sub: brushSub(['clay', 'strips', 'layer', 'inflate', 'sharp'])}, {i: '✊', t: 'Shape', sub: brushSub(['grab', 'elastic', 'snake', 'twist', 'thumb', 'pinch'])}, {i: '🧽', t: 'Smooth', sub: brushSub(['smooth', 'relax', 'flatten', 'scrape', 'crease'])},
      {i: '✂', t: 'Detail + cut', sub: brushSub(['noise', 'stamp', 'panel', 'trim', 'lineflat', 'erase', 'mask'])},
      {i: '📏', t: 'Brush size', sub: () => [{i: '➕', t: 'Bigger', keep: 1, run: nudge('sBrush', 1.2)}, {i: '➖', t: 'Smaller', keep: 1, run: nudge('sBrush', 1 / 1.2)}, {i: '💪', t: 'Stronger', keep: 1, run: nudge('sStr', .1, 1)}, {i: '🪶', t: 'Softer', keep: 1, run: nudge('sStr', -.1, 1)}]},
      {i: '➖', t: 'Dig in', run: () => click('#bInv'), on: lit('#bInv')}, {i: '⋯', t: 'More', sub: () => [B('🪞', 'Mirror', '#bSymSculpt'), B('🔬', 'More detail', '#bSubdiv'), B('🧽', 'Even out', '#bEven'), B('🛡', 'Clear mask', '[data-mask="clear"]'), B('🛡', 'Invert mask', '[data-mask="invert"]'), B('🎓', 'Sculpt lessons', '#bSculptGuide')]}, {i: '🧰', t: 'Tools', sub: toolsSub}]};
  const modeNow = () => tab === 'paint' ? 'paint' : tab === 'sculpt' ? 'sculpt' : 'build';
  const MODE_NAME = {build: 'Build', paint: 'Paint', sculpt: 'Sculpt'};
  function slotsNow() { const lv = W.stack[W.stack.length - 1], isSub = W.stack.length > 1, free = MAXS - (isSub ? 1 : 0); let items = lv.items, slots;
    if (items.length > free) { const per = free - 2, pages = Math.ceil(items.length / per); lv.page = Math.max(0, Math.min(pages - 1, lv.page)); slots = items.slice(lv.page * per, lv.page * per + per); while (slots.length < per) slots.push(null);
      slots.push({i: '▶', t: 'Next page', nav: 'next', off: lv.page >= pages - 1}, {i: '◀', t: 'Prev page', nav: 'prev', off: lv.page <= 0}); lv.pages = pages; }
    else { slots = items.slice(); while (slots.length < Math.min(4, free)) slots.push(null); lv.pages = 1; }
    if (isSub) slots.push({i: '↩', t: 'Back', nav: 'back'}); return slots; }
  const arc = (a0, a1, r0, r1) => { const p = (a, r) => (R + 4 + r * Math.cos(a)).toFixed(1) + ' ' + (R + 4 + r * Math.sin(a)).toFixed(1); return `M${p(a0, r0)}L${p(a0, r1)}A${r1} ${r1} 0 0 1 ${p(a1, r1)}L${p(a1, r0)}A${r0} ${r0} 0 0 0 ${p(a0, r0)}Z`; };
  function wheelDraw() { const slots = W.slots = slotsNow(), n = slots.length, da = Math.PI * 2 / n, lv = W.stack[W.stack.length - 1], S = (R + 4) * 2;
    let h = `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">`;
    slots.forEach((s, i) => { const a = -Math.PI / 2 + i * da; h += `<path data-i="${i}" class="${[i === W.hot && s && !s.off ? 'hot' : '', s && s.nav ? 'nav' : '', !s || s.off ? 'off' : '', s && s.on && s.on() ? 'lit' : ''].join(' ')}" d="${arc(a - da / 2 + .02, a + da / 2 - .02, R0 + 3, R)}"/>`; });
    h += `<circle cx="${R + 4}" cy="${R + 4}" r="${R0}"/></svg>`;
    slots.forEach((s, i) => { if (!s) return; const a = -Math.PI / 2 + i * da, rr = (R + R0) / 2 + 4, sw = s.col != null ? `<i><span style="display:inline-block;width:20px;height:20px;border-radius:50%;border:1px solid #fff8;background:#${(s.col | 0).toString(16).padStart(6, '0')}"></span></i>` : `<i>${s.i || ''}</i>`;
      h += `<div class="lb${i === W.hot && !s.off ? ' hot' : ''}" style="left:${(R + 4 + rr * Math.cos(a)).toFixed(1)}px;top:${(R + 4 + rr * Math.sin(a)).toFixed(1)}px;${s.off ? 'opacity:.35' : ''}">${sw}${String(s.t).replace(/</g, '&lt;')}${s.sub ? ' ›' : ''}</div>`; });
    h += `<div class="mid">${W.stack.length > 1 ? String(lv.t).replace(/</g, '&lt;') : MODE_NAME[W.mode] + ' wheel'}${lv.pages > 1 ? '<br>' + (lv.page + 1) + ' / ' + lv.pages : ''}<br>✕</div>`;
    wel.innerHTML = h; wel.style.display = 'block'; wel.style.left = W.x - R - 4 + 'px'; wel.style.top = W.y - R - 4 + 'px'; wbg.style.display = W.hold == null ? 'block' : 'none'; }
  function wheelOpen(x, y, holdId) { const mode = modeNow(); W = {mode, x: Math.max(R + 8, Math.min(innerWidth - R - 8, x)), y: Math.max(R + 56, Math.min(innerHeight - R - 8, y)), stack: [{t: mode, items: WHEELS[mode](), page: 0}], hold: holdId == null ? null : holdId, hot: -1, t0: performance.now()};
    if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {} wheelDraw(); }
  function wheelClose() { W = null; wel.style.display = 'none'; wbg.style.display = 'none'; }
  const slotAt = (x, y, far) => { const dx = x - W.x, dy = y - W.y, d = Math.hypot(dx, dy); if (d < R0) return -1; if (!far && d > R + 22) return -2; const n = W.slots.length, da = Math.PI * 2 / n; let a = Math.atan2(dy, dx) + Math.PI / 2 + da / 2; a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); return Math.floor(a / da) % n; };
  function wheelPick(i) { const s = W.slots[i]; if (!s || s.off) return; const lv = W.stack[W.stack.length - 1]; W.hold = null; W.hot = -1;
    if (s.nav === 'back') { W.stack.pop(); return wheelDraw(); } if (s.nav === 'next') { lv.page++; return wheelDraw(); } if (s.nav === 'prev') { lv.page--; return wheelDraw(); }
    if (s.sub) { W.stack.push({t: s.t, items: typeof s.sub === 'function' ? s.sub() : s.sub, page: 0}); return wheelDraw(); }
    if (s.keep) { try { s.run(); } catch (e) { console.error(e); } return wheelDraw(); }
    wheelClose(); try { s.run(); } catch (e) { console.error(e); } }
  M.wheel = {open: wheelOpen, close: wheelClose, pick: wheelPick, state: () => W, slotAt};
  // tap mode: the backdrop takes the taps
  wbg.addEventListener('pointerdown', e => { e.preventDefault(); if (!W) return; const i = slotAt(e.clientX, e.clientY); if (i < 0) return wheelClose(); wheelPick(i); });
  wbg.addEventListener('contextmenu', e => e.preventDefault());
  // hold mode: the finger / pen that opened the wheel is still down; flick toward a slice and let go
  addEventListener('pointermove', e => { if (!W || W.hold !== e.pointerId) return; e.stopImmediatePropagation(); const i = slotAt(e.clientX, e.clientY, true), hot = i >= 0 && W.slots[i] && !W.slots[i].off ? i : -1; if (hot !== W.hot) { W.hot = hot; wheelDraw(); } }, true);
  addEventListener('pointerup', e => { if (!W || W.hold !== e.pointerId) return; const i = W.hot; W.hold = null; W.hot = -1; holdOff(); if (i >= 0) wheelPick(i); else wheelDraw(); }, true);
  addEventListener('pointercancel', e => { if (W && W.hold === e.pointerId) { W.hold = null; holdOff(); wheelDraw(); } }, true);
  let orbitWas = null; const holdOn = () => { if (orbitWas == null) { orbitWas = controls.enabled; controls.enabled = false; } }, holdOff = () => { if (orbitWas != null) { controls.enabled = orbitWas; orbitWas = null; } };
  // press and hold on the model view; the pen's side button; right-click on PC
  let lp = null; const lpStop = () => { if (lp) { clearTimeout(lp.t); lp = null; } };
  const busy = () => (typeof stroking !== 'undefined' && stroking) || !!placing || (typeof drag !== 'undefined' && drag) || window.__gdOn || (typeof lpMode !== 'undefined' && lpMode && tab === 'sculpt');
  canvas.addEventListener('pointerdown', e => { if (W) return;
    if (e.pointerType === 'pen' && (e.button === 2 || e.button === 5 || (e.buttons & 2) || (e.buttons & 32))) { e.stopImmediatePropagation(); e.preventDefault(); holdOn(); return wheelOpen(e.clientX, e.clientY, e.pointerId); }
    if (e.pointerType === 'mouse') { if (e.button === 2) lp = {id: e.pointerId, x: e.clientX, y: e.clientY, mouse: true, t: 0, t0: performance.now()}; return; }
    if (lp) return lpStop();   // a second finger = zoom / turn, not a hold
    lp = {id: e.pointerId, x: e.clientX, y: e.clientY, t: setTimeout(() => { const q = lp; lp = null; if (!q || W || busy() || touches.size > 1) return; holdOn(); wheelOpen(q.x, q.y, q.id); }, 480)}; }, true);
  addEventListener('pointermove', e => { if (lp && e.pointerId === lp.id && Math.hypot(e.clientX - lp.x, e.clientY - lp.y) > 9) lpStop(); }, true);
  addEventListener('pointerup', e => { if (!lp || e.pointerId !== lp.id) return; const q = lp; lpStop(); if (q.mouse && performance.now() - q.t0 < 450 && Math.hypot(e.clientX - q.x, e.clientY - q.y) < 6 && !W) wheelOpen(e.clientX, e.clientY); }, true);
  addEventListener('pointercancel', lpStop, true);
  addEventListener('keydown', e => { if (e.key === 'Escape' && W) wheelClose(); });
  // every important action also has a visible button: ◎ opens the wheel in the middle of the view
  const bWheel = mk('button', {id: 'bWheelV', className: 'vk', textContent: '◎ Wheel', onclick: () => wheelOpen(innerWidth / 2, Math.max(R + 60, innerHeight * .42))}); $('vtools').prepend(bWheel);

  // ------------------------------------------------------------------ 4. 🔖 Mark tool (Paint)
  // a mark = one part (key = uid) or, with 🎯 One piece only on, one piece of a part (key = uid:first piece index)
  const marks = new Map(); let markMode = false, mhl = null, mhlKey = '';
  const row = mk('div', {className: 'row', id: 'markRow'}), grp = mk('div', {className: 'chips', id: 'markGroups'}), hint = mk('div', {className: 'hint', id: 'markHint'});
  $('bPaintAll').parentNode.after(row, grp, hint);
  const bMark = mk('button', {id: 'bMark', onclick: () => setMark(!markMode)}), bClr = mk('button', {id: 'bMarkClear', textContent: 'Clear marks', onclick: () => clearMarks()}), bSave = mk('button', {id: 'bMarkSave', textContent: '💾 Save group', onclick: () => saveGroupUI()});
  const mCol = mk('input', {type: 'color', id: 'markCol', value: '#c03020', title: 'Colour for everything marked', style: 'width:56px;height:40px;border:0;background:none'});
  row.append(bMark, mCol, bClr, bSave);
  const live = () => { for (const [k, m] of marks) if (!partBy(m.u)) marks.delete(k); return marks; };
  function markUI() { live(); bMark.textContent = markMode ? '🔖 Marking: ON (' + marks.size + ')' : marks.size ? '🔖 Mark parts (' + marks.size + ' marked)' : '🔖 Mark parts'; bMark.classList.toggle('on', markMode); mCol.style.display = bClr.style.display = bSave.style.display = marks.size ? '' : 'none';
    hint.textContent = markMode ? 'Tap every part you want on the model (both wings, the tail, the back spikes…). Tap one again to unmark it. Then tap a skin or pick a colour: it goes on all of them.' : marks.size ? 'Skins and the colour here go on the ' + marks.size + ' marked parts. Clear marks to paint one part at a time again.' : '';
    grp.innerHTML = ''; (P.markGroups || []).forEach((g, n) => { const b = mk('button', {textContent: '📁 ' + g.n + ' (' + g.m.length + ')', onclick: () => loadGroup(n)}); b.append(mk('span', {textContent: '✕', onclick: e => { e.stopPropagation(); snap(); P.markGroups.splice(n, 1); saveCur(); markUI(); }})); grp.append(b); }); }
  function setMark(on) { markMode = !!on; if (on) { if (tab === 'paint' && $('bPaintAll').classList.contains('on')) click('#bPaintAll'); tip(tab === 'paint' ? '🔖 Tap the parts you want to paint together' : '🔖 Tap the parts you want to mark. Tap one again to unmark it', 2600); } markUI(); }
  function clearMarks() { marks.clear(); markUI(); hlDraw(); }
  function toggleMark(u) { const pt = partBy(u); if (!pt) return; let key = u, ids = null;
    if (typeof piecePaint !== 'undefined' && piecePaint && lastPick && lastPick.uid === u) { const g = pieceClusters(pt, true).find(x => x.ids.includes(lastPick.mi)); ids = g ? g.ids : [lastPick.mi]; key = u + ':' + ids[0]; }
    const on = !marks.has(key); const put = (k, m) => on ? marks.set(k, m) : marks.delete(k); put(key, {u, ids});
    const tw = null;   // each side is tapped on its own (tapping the other wing must add it, not undo the pair)
    if (navigator.vibrate) try { navigator.vibrate(8); } catch (e) {} markUI(); hlDraw(); tip((on ? '🔖 Marked: ' : 'Unmarked: ') + (LIB[pt.lib] ? LIB[pt.lib].name : 'part') + (ids ? ' (one piece)' : tw ? ' (both sides)' : '') + ' · ' + marks.size + ' marked', 1500); }
  function hlDraw() { live(); const key = [...marks.keys()].join('|') + '#' + marks.size; if (mhl) { mhl.traverse(o => { if (o.geometry) o.geometry.dispose(); }); mhl.removeFromParent(); mhl = null; } mhlKey = key; if (!marks.size) return;
    mhl = new THREE.Group(); for (const m of marks.values()) { const v = views[m.u]; if (!v || !v.G.visible) continue; const box = new THREE.Box3(); if (m.ids) v.meshes.filter(o => m.ids.includes(o.userData.mi)).forEach(o => box.expandByObject(o)); else box.setFromObject(v.M);
      if (box.isEmpty()) continue; const h = new THREE.Box3Helper(box, 0x35e0ff); h.material.depthTest = false; h.material.transparent = true; h.material.opacity = .9; h.renderOrder = 12; mhl.add(h); } scene.add(mhl); }
  setInterval(() => { if (marks.size || mhl) { if (typeof stroking !== 'undefined' && stroking) return; hlDraw(); } }, 500);
  const markedParts = () => [...live().values()].map(m => ({pt: partBy(m.u), ids: m.ids}));
  function paintMarked(k) { snap(); for (const {pt, ids} of markedParts()) { if (ids) { const n = pieces(pt.lib, pt.params).length; pt.mat = pt.mat || Array(n).fill(pt.matAll || null); ids.forEach(i => pt.mat[i] = k); } else { pt.matAll = k; pt.mat = null; } buildPart(pt); }
    saveCur(); paintNowUI(); hlDraw(); tip(MATS.LIST.find(l => l[0] === k)[1] + ' on ' + marks.size + ' marked parts', 2000); }
  const _mPaint = paint; paint = function (k) { if (live().size && !(brushPaint && paintBrush === 'skin')) return paintMarked(k); return _mPaint(k); };
  const _mSelect = select; select = function (u) { const r = _mSelect(u); if (markMode && u && !markJump) toggleMark(u); return r; };
  mCol.onchange = e => { if (!live().size) return; snap(); for (const {pt} of markedParts()) { pt.tint = e.target.value; buildPart(pt); } saveCur(); tip('Colour on ' + marks.size + ' marked parts', 1800); };
  function saveGroupUI() { if (!live().size) return tip('Mark some parts first', 1800); hint.textContent = ''; const inp = mk('input', {type: 'text', placeholder: 'Group name (wings, back scales…)', style: 'flex:1;min-height:40px;padding:4px 8px;border-radius:8px;border:1px solid #4c4c58;background:#1c1c22;color:inherit'});
    const ok = mk('button', {textContent: 'Save', className: 'on', onclick: () => { snap(); P.markGroups = P.markGroups || []; const n = (inp.value || '').trim() || 'Group ' + (P.markGroups.length + 1); const ex = P.markGroups.findIndex(g => g.n === n), rec = {n, m: [...marks.values()].map(m => ({u: m.u, ids: m.ids}))};
      if (ex >= 0) P.markGroups[ex] = rec; else P.markGroups.push(rec); saveCur(); markUI(); tip('💾 Group "' + n + '" saved with this creature', 2200); }});
    hint.append(mk('div', {className: 'row'}, inp, ok)); inp.focus(); }
  function loadGroup(n) { const g = (P.markGroups || [])[n]; if (!g) return; marks.clear(); for (const m of g.m) if (partBy(m.u)) marks.set(m.ids ? m.u + ':' + m.ids[0] : m.u, {u: m.u, ids: m.ids || null}); if (tab !== 'paint') click(tabBtn('paint')); markUI(); hlDraw(); tip('📁 ' + g.n + ': ' + marks.size + ' parts marked. Tap a skin or colour.', 2400); }
  // ---- 🔖 Mark everywhere (Nov 10 2026: "Mark part is way too handy to not use anywhere else. Like deleting etc and sculpting")
  // Build (✋ Move & size): mark parts, then delete / hide / copy them all at once. Sculpt: with parts marked and Marking off, the brush works on whichever MARKED part
  // is under it (it picks that part for you), so you can sculpt across both wings or every back plate without re-selecting; unmarked parts are left alone.
  let markJump = false; const extraBtns = [], extraRows = [];
  const mkRow = (pane, kind) => { const host = $(pane); if (!host) return; const r = mk('div', {className: 'row', style: 'flex-wrap:wrap'}), h = mk('div', {className: 'hint'}); const b = mk('button', {onclick: () => setMark(!markMode)}); extraBtns.push(b); r.append(b);
    const act = (t, f) => { const x = mk('button', {textContent: t, onclick: f}); x.dataset.need = '1'; r.append(x); return x; };
    if (kind === 'build') { act('🗑 Delete marked', () => { const ps = markedParts().map(m => m.pt).filter(Boolean); if (!ps.length) return; snap(); const n = ps.length; removeParts(ps); marks.clear(); rebuildParts(); outliner(); saveCur(); markUI(); hlDraw(); tip('🗑 ' + n + ' marked parts removed (↶ Undo brings them back)', 2600); });
      act('🙈 Hide marked', () => { const ps = markedParts().map(m => m.pt).filter(Boolean); if (!ps.length) return; snap(); const hide = ps.some(q => !q.hidden); ps.forEach(q => q.hidden = hide); rebuildParts(); outliner(); saveCur(); hlDraw(); tip((hide ? '🙈 Hidden: ' : '👁 Shown: ') + ps.length + ' marked parts (tap again to ' + (hide ? 'show' : 'hide') + ')', 2400); });
      act('↔ Bigger', () => sizeMarked(1.1)); act('↔ Smaller', () => sizeMarked(1 / 1.1)); }
    else { act('Undo sculpt on marked', () => { const ps = markedParts().map(m => m.pt).filter(Boolean); if (!ps.length) return; snap(); ps.forEach(q => { q.sculpt = null; q.cut = []; buildPart(q); }); saveCur(); tip('Sculpt undone on ' + ps.length + ' marked parts', 2000); });
      act('More detail on marked', () => { const ps = markedParts().map(m => m.pt).filter(Boolean); if (!ps.length) return; snap(); ps.forEach(q => { if ((q.subdiv || 0) < 2) { q.subdiv = (q.subdiv || 0) + 1; q.sculpt = null; q.cut = []; buildPart(q); } }); saveCur(); tip('More detail on ' + ps.length + ' marked parts', 2000); }); }
    act('Clear marks', () => clearMarks()); host.prepend(r, h); extraRows.push({r, h, kind}); };
  const sizeMarked = k => { const ps = markedParts().map(m => m.pt).filter(Boolean); if (!ps.length) return; snap(); ps.forEach(q => { q.s = +(q.s * k).toFixed(4); }); rebuildParts(); saveCur(); hlDraw(); };
  mkRow('p-edit', 'build'); mkRow('p-sculpt', 'sculpt');
  const _markUI = markUI; markUI = function () { _markUI(); for (const b of extraBtns) { b.textContent = markMode ? '🔖 Marking: ON (' + marks.size + ')' : marks.size ? '🔖 Mark parts (' + marks.size + ' marked)' : '🔖 Mark parts'; b.classList.toggle('on', markMode); }
    for (const {r, h, kind} of extraRows) { r.querySelectorAll('[data-need]').forEach(x => x.style.display = marks.size ? '' : 'none');
      h.textContent = markMode ? 'Tap every part you want on the model. Tap one again to unmark it. Then turn Marking off' + (kind === 'sculpt' ? ' and sculpt: the brush only works on the marked parts and moves between them by itself.' : ' and use the buttons here on all of them.') : marks.size ? (kind === 'sculpt' ? 'Sculpting only touches the ' + marks.size + ' marked parts. The brush picks the marked part under it.' : marks.size + ' parts marked.') : ''; } };
  // Sculpt + marks: before the brush stroke starts, pick the marked part under the pointer (window capture runs before the canvas handlers)
  addEventListener('pointerdown', e => { if (e.target !== canvas || tab !== 'sculpt' || markMode || !live().size) return; const h = cast(e.clientX, e.clientY - (e.pointerType === 'touch' ? fingerOff : 0), visibleMeshes()); const u = h && h.object.userData.uid; if (!u) return;
    const ok = [...marks.values()].some(m => m.u === u); if (ok && u !== sel) { markJump = true; try { select(u); } finally { markJump = false; } }
    else if (!ok && u !== sel) { /* an unmarked part: leave the pick where it is, the stroke only lands on the picked (marked) part */ } }, true);
  M.mark = {set: setMark, toggle: toggleMark, clear: clearMarks, marks, save: saveGroupUI, load: loadGroup, paint: paintMarked}; markUI();
  // ------------------------------------------------------------------ 5. 👍 Thumb dock (sculpt + brush paint; Nov 10 2026, "sculpting is a little hard on the phone")
  // Shows while a brush is in use (Sculpt tab, or Paint with a brush on). Undo / redo, brush size and strength as drag pads (drag up = more),
  // dig in, quick smooth, and ☝ Offset: the brush works a bit above the finger so the finger does not cover it. ⇄ moves the dock to the other side.
  {
    const dock = mk('div', {id: 'sdock'}); document.body.append(dock);
    let prevBrush = null, offOn = LS('mf-sd-off') === '1', small = LS('mf-sd-small') !== '0';
    if (LS('mf-sd-side') === 'R') document.body.classList.add('sdockR');
    const ids = () => tab === 'paint' ? ['sPSize', 'sPStr'] : ['sBrush', 'sStr'];
    const btn = (ic, label, fn, cls) => mk('button', {className: cls || '', onclick: fn}, mk('i', {textContent: ic}), label);
    const bU = btn('↶', 'Undo', () => click('#bUndo'), 'big'), bR = btn('↷', 'Redo', () => click('#bRedo'), 'x2');
    const pad = (name, which) => { const fill = mk('div', {className: 'fill'}), v = mk('span', {className: 'v'}), el = mk('div', {className: 'pad'}, fill, mk('span', {textContent: name}), v, mk('span', {textContent: '↕'}));
      const inp = () => $(ids()[which]); let d = null;
      const show = () => { const i = inp(); if (!i) return; const t = (+i.value - +i.min) / (+i.max - +i.min); fill.style.height = Math.round(t * 100) + '%'; v.textContent = which ? Math.round(t * 100) + '%' : (+i.value).toFixed(1); };
      const set = val => { const i = inp(); i.value = Math.min(+i.max, Math.max(+i.min, val)); i.dispatchEvent(new Event('input', {bubbles: true})); show();
        if (!which) { const r = canvas.getBoundingClientRect(); ring(r.left + r.width / 2, r.top + r.height * .42); } };
      el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); const i = inp(); d = {id: e.pointerId, y: e.clientY, v: +i.value, span: +i.max - +i.min, moved: false}; el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch (x) {} });
      el.addEventListener('pointermove', e => { if (!d || e.pointerId !== d.id) return; if (Math.abs(e.clientY - d.y) > 3) d.moved = true; set(d.v + (d.y - e.clientY) / 150 * d.span); });
      const end = e => { if (!d || e.pointerId !== d.id) return; const q = d; d = null; el.classList.remove('drag');
        if (!q.moved) { const r = el.getBoundingClientRect(), i = inp(); set(+i.value + (e.clientY < r.top + r.height / 2 ? 1 : -1) * q.span / 12); }   // a tap on the top half = a step up, bottom half = a step down
        if (!which) setTimeout(() => { if (!stroking) $('ring').style.display = 'none'; }, 700); tip((which ? 'Strength ' : 'Brush size ') + v.textContent, 900); };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.show = show; return el; };
    const pSize = pad('Size', 0), pStr = pad('Power', 1);
    const bDig = btn('➖', 'Dig in', () => { click('#bInv'); ui(); }), bSm = btn('🧽', 'Smooth', () => { if (brush === 'smooth' && prevBrush) { click('[data-br="' + prevBrush + '"]'); prevBrush = null; } else { prevBrush = brush; click('[data-br="smooth"]'); } ui(); });
    const bOff = btn('☝', 'Offset', () => { offOn = !offOn; LS('mf-sd-off', offOn ? '1' : '0'); ui(); tip(offOn ? '☝ Offset on: the brush works a little above your finger, so you can see it' : 'Offset off: the brush is right under your finger', 2600); }, 'x2');
    const bSide = btn('⇄', 'Side', () => { const r = document.body.classList.toggle('sdockR'); LS('mf-sd-side', r ? 'R' : 'L'); try { resize(); } catch (e) {} }, 'x2');
    const bMin = btn('⋯', '', () => { small = !small; LS('mf-sd-small', small ? '1' : '0'); ui(); });
    dock.append(bU, bR, pSize, pStr, bDig, bSm, bOff, bSide, bMin);
    function ui() { dock.classList.toggle('small', small); pSize.show(); pStr.show(); const sc = tab === 'sculpt';
      bDig.style.display = bSm.style.display = sc ? '' : 'none'; bDig.classList.toggle('on', typeof sInv !== 'undefined' && !!sInv); bSm.classList.toggle('on', brush === 'smooth' && !!prevBrush); bOff.classList.toggle('on', offOn);
      fingerOff = offOn && document.body.classList.contains('sdockOn') ? 64 : 0; }
    const want = () => document.body.classList.contains('mfm') && sculpting() && !(typeof lpMode !== 'undefined' && lpMode) && !markMode;
    const sync = () => { const on = want(); if (document.body.classList.contains('sdockOn') !== on) { document.body.classList.toggle('sdockOn', on); } if (on) ui(); else fingerOff = 0; };
    setInterval(sync, 300); document.querySelectorAll('.tabs button,[data-pb],[data-br]').forEach(b => b.addEventListener('click', () => setTimeout(sync, 0)));
    M.dock = {sync, ui, el: dock};
  }

  // ------------------------------------------------------------------ 6. ✖ Multiply + curve (Nov 10 2026: "Add ways to connect easily. Then multiply if needed and curve out. Easily")
  // ✋ Move & size › ✖ Multiply: pick a part, set Copies. The copies join end to end (Gap 1 = touching), Curve bends the whole row into an arc or a full ring,
  // Twist turns each copy a bit more, Grow makes each copy bigger or smaller (tails, horns, tentacles, chains, fences, wheels of spikes). The copies are normal parts.
  if ($('copyRow')) {
    const box = mk('details', {className: 'more', id: 'mulBox'}, mk('summary', {textContent: '✖ Multiply + curve (row, arc, ring) ▾'})); $('copyRow').after(box);
    const hint = mk('div', {className: 'hint', textContent: 'Pick a part, then slide Copies. They connect end to end. Curve bends the row, 360 makes a ring.'}); box.append(hint);
    let mul = null, axis = 'y';   // mul = {src, uids}
    const V = THREE.Vector3, M4 = THREE.Matrix4, Q = THREE.Quaternion, E = THREE.Euler, R = Math.PI / 180;
    const sl = (label, min, max, step, val, fmt) => { const i = mk('input', {type: 'range', min, max, step, value: val}), v = mk('span', {textContent: fmt(val)}); i.addEventListener('pointerdown', () => { if (!mul || mul.src !== sel) begin(); });
      i.addEventListener('input', () => { v.textContent = fmt(+i.value); regen(); }); i.addEventListener('change', () => saveCur()); box.append(mk('div', {className: 'sl'}, mk('span', {textContent: label}), i, v)); return i; };
    const sN = sl('Copies', 0, 24, 1, 0, v => v ? '+' + v : 'none'), sGap = sl('Gap', 0, 3, .05, 1, v => v === 1 ? 'touching' : v.toFixed(2)), sCurve = sl('Curve', -360, 360, 5, 0, v => v + '°'), sTwist = sl('Twist', -180, 180, 5, 0, v => v + '°'), sGrow = sl('Grow', .7, 1.3, .01, 1, v => v === 1 ? 'same' : Math.round(v * 100) + '%');
    const seg = mk('div', {className: 'row'}); box.append(seg); const AX = [['y', '⬆ Along the part'], ['x', '➡ Sideways'], ['z', '⬈ Front / back']];
    const axUI = () => { seg.innerHTML = ''; seg.append(mk('span', {className: 'hint', textContent: 'Direction:', style: 'margin:0'})); for (const [k, t] of AX) seg.append(mk('button', {textContent: t, className: k === axis ? 'on' : '', onclick: () => { axis = k; axUI(); if (!mul || mul.src !== sel) begin(); regen(); saveCur(); }})); };
    const row2 = mk('div', {className: 'row'}); box.append(row2);
    const preset = (t, f) => row2.append(mk('button', {textContent: t, onclick: () => { if (!partBy(sel)) return tip('Pick a part first', 1600); if (!mul || mul.src !== sel) begin(); f(); [sN, sGap, sCurve, sTwist, sGrow].forEach(i => i.dispatchEvent(new Event('input'))); saveCur(); }}));
    preset('⭕ Ring of 8', () => { sN.value = 7; sCurve.value = 360; sGap.value = 1.6; sTwist.value = 0; sGrow.value = 1; axis = 'x'; axUI(); });
    preset('🐍 Tail (shrinks, curls)', () => { sN.value = 8; sCurve.value = 70; sGap.value = .9; sTwist.value = 0; sGrow.value = .9; axis = 'y'; axUI(); });
    preset('▦ Straight row of 5', () => { sN.value = 4; sCurve.value = 0; sGap.value = 1; sTwist.value = 0; sGrow.value = 1; axis = 'x'; axUI(); });
    row2.append(mk('button', {textContent: '✔ Keep', className: 'on', onclick: () => { if (mul) { tip('✔ ' + mul.uids.length + ' copies kept. Pick any of them to change it on its own', 2400); mul = null; sN.value = 0; sN.dispatchEvent(new Event('input')); } }}),
      mk('button', {textContent: '✕ Remove copies', onclick: () => { if (mul && mul.uids.length) { removeParts(mul.uids.map(partBy).filter(Boolean)); mul.uids = []; rebuildParts(); outliner(); saveCur(); } sN.value = 0; hint.textContent = 'Copies removed.'; }}));
    function begin() { const pt = partBy(sel); if (!pt) return; snap(); mul = {src: pt.uid, uids: []}; }
    function regen() { if (!mul) { if (+sN.value) { begin(); if (!mul) return tip('Pick a part first', 1600); } else return; } const src = partBy(mul.src); if (!src) { mul = null; return; }
      const old = mul.uids.map(partBy).filter(Boolean); if (old.length) removeParts(old); mul.uids = [];
      const n = +sN.value, gap = +sGap.value, curve = +sCurve.value * R, twist = +sTwist.value * R, grow = +sGrow.value; if (!n) { rebuildParts(); outliner(); hint.textContent = 'Slide Copies to add copies of the picked part.'; return; }
      const b = partBoxOf(src.lib, src.params), size = b.getSize(new V()), L = (axis === 'y' ? size.y * (src.l || 1) : axis === 'x' ? size.x * (src.w || 1) : size.z * (src.w || 1)) * gap;
      const dir = axis === 'y' ? new V(0, 1, 0) : axis === 'x' ? new V(1, 0, 0) : new V(0, 0, 1), bend = axis === 'y' ? new V(1, 0, 0) : new V(0, 1, 0), th = curve / (n + (Math.abs(+sCurve.value) >= 360 ? 1 : 0));
      const half = new M4().makeRotationAxis(bend, th / 2), step = new M4().multiply(half).multiply(new M4().makeTranslation(dir.x * L, dir.y * L, dir.z * L)).multiply(half).multiply(new M4().makeRotationAxis(dir, twist / n));
      let m = new M4().compose(new V(...src.p), new Q().setFromEuler(new E(...src.r.map(x => x * R))), new V(1, 1, 1)), sc = src.s; const pos = new V(), q = new Q(), s3 = new V();
      for (let i = 0; i < n; i++) { m = m.clone().multiply(step); if (grow !== 1) { /* each copy a bit bigger / smaller: the step shrinks with it so the pieces stay joined */ const k = new M4().makeScale(grow, grow, grow); step.copy(new M4().multiply(k).multiply(step).multiply(new M4().copy(k).invert())); step.setPosition(new V().setFromMatrixPosition(step).multiplyScalar(grow)); }
        sc *= grow; m.decompose(pos, q, s3); const e = new E().setFromQuaternion(q), c = JSON.parse(JSON.stringify(src)); c.uid = uid(); c.twin = null; c.host = null; c.mulOf = src.uid; c.p = pos.toArray().map(x => +x.toFixed(4)); c.r = [e.x, e.y, e.z].map(x => +(x / R).toFixed(3)); c.s = +sc.toFixed(4);
        if (c.fit) c.fit = {...c.fit, tweaked: true}; P.parts.push(c); buildPart(c); mul.uids.push(c.uid); }
      outliner(); hint.textContent = n + ' copies. ✔ Keep when it looks right, or keep sliding.'; }
    axUI(); M.multiply = {regen, set: (o) => { if (!mul || mul.src !== sel) begin(); if (o.axis) { axis = o.axis; axUI(); } for (const [k, i] of [['n', sN], ['gap', sGap], ['curve', sCurve], ['twist', sTwist], ['grow', sGrow]]) if (o[k] != null) i.value = o[k]; regen(); saveCur(); return mul ? mul.uids.length : 0; }};
  }
}
