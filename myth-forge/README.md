# Mythic Forge (myth-forge/)

Renamed from Myth Forge on Nov 8, 2026 (MajorasPride's call). The folder and link stay `myth-forge/` so old links keep working.

MajorasPride's creature + mech builder for Titan Clash. Open `index.html` (GitHub Pages link or double-click). Not used by the game directly: it exports `.glb` models (⋯ → Download model) that Claude then puts into the game.

## Files
- `index.html` — BUILT file (do not edit by hand). Run `python3 build.py` after editing `index.html` or `forge-core.js`.
- `page.html` — page + UI. `forge-core.js` — the editor (inlined into titan-forge.html by build.py so it works from file://).
- `k-helpers.js` — geometry helper kit `K` used by every parts file. `materials.js` — procedural textures (ours) + triplanar shader. `skeletons.js` — body types.
- `parts/*.js` — part libraries (classic scripts, `FORGE_PARTS.push((THREE,K)=>[...])`). Spec: `PARTS-SPEC.md`.
  basic.js (clay + shapes), creature-heads.js, creature-body.js, mech.js, weapons-magic.js, mecha-dragon.js, sphinx.js, kaiju-kit.js (Basalt Kaiju), turtle-kit.js (Snapjaw turtle + 3 shells). All made in code = ours, no license.
- `packs/*.js` — Quaternius CC0 models (base64 GLB, animations/skins stripped, quantized), loaded only when opened. `packs/index.js` lists them.

## How it works
- Project `P` = {skel, bones [[name,parent,head,tail,tag,opts]], pose, parts [{uid, lib, bone, p, r(deg), s, l, w, flip, matAll, tint, subdiv, sculpt{mi:{v:[dx,dy,dz]}}, cut[], hidden, twin}], fx}.
- Parts hang on bones (move with pose/animation). L/R twins mirror every change (local X flip).
- Placing: "Snap to bone" lines limbs/tails/necks/wings/heads up with the bone and auto-sizes to the bone chain; "Stick on surface" aligns +Y with the tapped surface.
- Whole-body pack models (animals, dinos, mechs…) come in at full size as a base body.
- Imports (.glb/.gltf/.obj/.fbx/.zip) stay in the browser (IndexedDB `titan-forge`), never the repo.
- Saves: quick save in localStorage `titan-forge-cur`; named saves in IndexedDB.

## Nov 8, 2026 update
- Starters: Hero Mech, Basalt Kaiju (original Godzilla-style), Snapjaw Turtle Brute (original mutant snapping turtle), Mecha Dragon. Starter part size can be `[size, length]`.
- Toy mode: 🧩 Break apart (part -> one part per touching piece cluster, `pt.keep` = piece indexes, `pt.off` = pivot) and 🧲 Sticky (drag a part, it sticks where dropped; off the model -> 📦 Parts box, `pt.boxed`).
- Bone numbers: All / Picked / Off + Fade (localStorage `mf-nums`). 🪟 Focus window (scissor render of the picked part).
- Calmer screen: arrow pad hidden by default (`mf-nav`), lighter bones, less-used buttons under "More ▾" in each tab.
- Weapons dropped on a hand bone go into the palm (grip in palm, pointing forward). How they hold weapons gets tuned later.
- Guide: first-time tour (`mf-tour-done`), ⋯ → 🎓 tour and ❓ How to build.
- 🫳 Mold (default on, `mf-mold`): a part dropped in Sticky mode squishes around the surface it lands on (moldOnto, stored as pt.sculpt).
- Craft (toy box) materials: cardboard, polystyrene, sponge, floaty foam, felt, stitched felt, knit, sackcloth, denim, patchwork, paper, toy rubber/plastic (procedural, ours; look inspired by LittleBigPlanet).
- Two chats can work on Myth Forge at once: always `git fetch` + rebase before pushing, and rebuild index.html after a merge.
- Double-tap a part in the Add grid = add it right away (quickAdd): picked bone, else the first bone whose category fits; weapons into the right hand's palm.
- Starters now: Hero Mech, Basalt Kaiju, Sailback Spinosaur (dino-kit.js on the 'theropod' body type), Mecha Dragon. Turtle Kit stays as parts only.
- Asked for next: Beholder body type; easy make-your-own skeleton / remove bones (tools are under Skeleton › More now); 3-headed dragon body type with wing-arms (arms are the wings), 2 legs, 2 tails.
