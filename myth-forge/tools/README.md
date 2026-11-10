# Mythic Forge test tools (headless Chrome)
Not part of the app. Paths inside assume the repo is at `/home/claude/titan-clash` and a scratch folder `/home/claude/harness` with `npm i three@0.160.0` (copy these files there and run them from it). Needs Playwright + Google Chrome.
- `lib.js` — opens the page (phone 412x915 touch, `pc` 1920x1080, `pcs` 1100x800), serves three.js locally, steps frames by hand (`__frames(n)`).
- `node defs.js pcs shots [k1,k2]` — screenshots of every ⭐ default build; `node sheet.js shots` makes contact sheets.
- `node walk.js <phone|pc> <simple|complex> [k1,k2]` — Build together from step 1 to 🎉 Done with real taps; prints PASS / FAIL per body type.
- `node parts.js parts/kit-limbs.js ...` — runs every `make()` in node (catches a broken parts file, which fails silently in the page).
- `node shot.js "k:style:dx,dy,dz:zoom:libRegex"` close-ups; `node looks.js k1,k2` game look + block toy look; `mont.js` joins pictures.
