# Titan Forge (game/tools/forge/)

MajorasPride's creature + mech builder for Titan Clash. Open `titan-forge.html` (GitHub Pages link or double-click). Not used by the game directly: it exports `.glb` models (⋯ → Download model) that Claude then puts into the game.

## Files
- `titan-forge.html` — BUILT file (do not edit by hand). Run `python3 build.py` after editing `index.html` or `forge-core.js`.
- `index.html` — page + UI. `forge-core.js` — the editor (inlined into titan-forge.html by build.py so it works from file://).
- `k-helpers.js` — geometry helper kit `K` used by every parts file. `materials.js` — procedural textures (ours) + triplanar shader. `skeletons.js` — body types.
- `parts/*.js` — part libraries (classic scripts, `FORGE_PARTS.push((THREE,K)=>[...])`). Spec: `PARTS-SPEC.md`.
  basic.js (clay + shapes), creature-heads.js, creature-body.js, mech.js, weapons-magic.js. All made in code = ours, no license.
- `packs/*.js` — Quaternius CC0 models (base64 GLB, animations/skins stripped, quantized), loaded only when opened. `packs/index.js` lists them.

## How it works
- Project `P` = {skel, bones [[name,parent,head,tail,tag,opts]], pose, parts [{uid, lib, bone, p, r(deg), s, l, w, flip, matAll, tint, subdiv, sculpt{mi:{v:[dx,dy,dz]}}, cut[], hidden, twin}], fx}.
- Parts hang on bones (move with pose/animation). L/R twins mirror every change (local X flip).
- Placing: "Snap to bone" lines limbs/tails/necks/wings/heads up with the bone and auto-sizes to the bone chain; "Stick on surface" aligns +Y with the tapped surface.
- Whole-body pack models (animals, dinos, mechs…) come in at full size as a base body.
- Imports (.glb/.gltf/.obj/.fbx/.zip) stay in the browser (IndexedDB `titan-forge`), never the repo.
- Saves: quick save in localStorage `titan-forge-cur`; named saves in IndexedDB.
