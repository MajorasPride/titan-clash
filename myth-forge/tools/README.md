# Mythic Forge test tools (headless Chrome)
Not part of the app. Paths inside assume the repo is at `/home/claude/titan-clash` and a scratch folder `/home/claude/harness` with `npm i three@0.160.0` (copy these files there and run them from it). Needs Playwright + Google Chrome.
- `lib.js` — opens the page (phone 412x915 touch, `pc` 1920x1080, `pcs` 1100x800), serves three.js locally, steps frames by hand (`__frames(n)`).
- `node defs.js pcs shots [k1,k2]` — screenshots of every ⭐ default build; `node sheet.js shots` makes contact sheets.
- `node walk.js <phone|pc> <simple|complex> [k1,k2]` — Build together from step 1 to 🎉 Done with real taps; prints PASS / FAIL per body type.
- `node parts.js parts/kit-limbs.js ...` — runs every `make()` in node (catches a broken parts file, which fails silently in the page).
- `node shot.js "k:style:dx,dy,dz:zoom:libRegex"` close-ups; `node looks.js k1,k2` game look + block toy look; `mont.js` joins pictures.
- Before building: `cat forge-core.js forge-v3.js forge-m.js > /tmp/all.mjs && node --check /tmp/all.mjs` (a syntax error means the page never loads and every tool times out after 60 s).
- Two walks run side by side on 2 cores (about 7 minutes for all body types each).
- `node stance.js` — crocodile stance switch (crawl → stand → crawl): part counts, button text, page errors. `node sheet12.js dir` — 15 creatures per contact sheet. `node parts0.js parts/bodies-more.js` — like parts.js for the core part files. `node bend.js` — body types whose trunk bends sharply.
- `node dock.js` thumb dock at phone size; `node eth.js` every ethereal skin + the shadow version on the dragon; `node mk.js` Mark everywhere (mark, resize, delete, undo).
- `node shp.js` adding one part vs a mirrored pair + a picture of the basic shapes; `node mul.js` Multiply + curve (row, arc, ring, tail).
- `node wings.js [libs] [body types]` wing / fin fit numbers (root gap, reach past the bone tip, membrane side; `MODES=L,R,both` or `def`); `node wshot.js out "k:lib" ...` pictures of a wing dropped on the body on each side (`k:def` = the ⭐ default); `node wingdrop.js` which bone a wing dropped on the body goes to (T031, Nov 13).
