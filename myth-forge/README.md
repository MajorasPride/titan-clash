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

## Nov 9, 2026 update: parts fit the body
- **Base body** (`parts/base-body.js`, group "Base Body"): smooth mannequin pieces. `buildBase()` covers every bone of any skeleton (trunk egg, capsule per limb bone, head, hands, feet, tail pieces, wings). New creature / new body type / first open start with it. 🧱 Base body on/off.
- **Fit system** (forge-core.js, "fit system"): `fitPart(lib, bone)` gives bone/p/r/size/length so a part fills its slot. `bodyInfo()` measures the trunk (hips -> neck) and body width W; everything is sized from W. Torsos fill the trunk (re-homed to the root spine bone, aimed at the neck). Heads ~0.5W wide on the neck. Limbs/necks/tails keep their own proportions, cover the whole limb if long (>=3.2) else one bone, only stretch if far too thick/thin. Hands/feet match the limb, jaws match the head, details (`decor`) match the big part on that bone. Kits/packs/clay/makers keep old behaviour (`kindOf` -> null).
- **Swap**: a main part dropped on a slot replaces what was there (base pieces + same kind), twins included (`swapOut`).
- `pt.fit = {kind, drop, cover[], tweaked}`. Moving/stretching by hand sets `tweaked`; auto refits (body type switch, joint edits, sliders) skip tweaked parts; ↻ Fit to body (Move tab) / ↻ Fit all parts (Skeleton) force it.
- **Body shape sliders** (Dragon's Dogma style): height, bulk, arm/leg/neck/tail length, head size. `applyBody()` rebuilds bones from `P.bodyBase` snapshot, keeps feet on the ground, refits. Joint edits clear the snapshot.
- `parts/tails-wings.js`: first real tails (reptile, spiked, club, plated, fin, whip stinger) and wings (bat/dragon, insect, mech blade).
- Tested with headless Chrome on 15 body types + mech/kaiju/dragon builds.

## Nov 9, 2026: 🧑 Hero tab (character creator) — REMOVED same night, archived in archive/hero-creator-v1.js + archive/hero-creator-core-v1.js. MajorasPride wants an asset-based character creator later instead.
- Our own RPG-style character creator (idea from Dragon's Dogma 2's creator; nothing copied). `hero.js` = options/presets (`window.FORGE_HERO`) + hero_* maker parts (group "Hero Creator"). forge-core.js section "hero creator": `buildHero()`, `heroUI()`.
- P.hero holds every choice. buildHero(): slim humanoid skeleton (+ tail for Beastfolk), frame/height/limb sliders via P.bodyBase + applyBody(), then rebuilds all hero_* parts with params = P.hero (other parts the user added stay).
- Races: Human, Elf, Beastfolk (fur, muzzle, mane, tail, beast ears), Orc (tusks), Mech (armor body, visor). Sections: Race, Body, Face (14 sliders), Hair (11 styles + beards + color), Outfit (tops, legs, feet, extras), Colors, Presets (Knight, Ranger, Mage, Beast Warrior, Orc Brute, Pilot, Mech, Random).
- Colors use tint on near-white "hero" materials (heroskin, herofur, herohair, herocloth, heroleather, herometal) so swatches give the exact color. Eyes/hair/hood share the head's fit so they line up. Skin under full clothing is left out (no z-fighting).
- Idea for later (MajorasPride): a Robotech-style robot. He shared a BattleTech-style mech sheet as reference — make an original design inspired by that boxy look, not a copy.

## Nov 9, 2026 (late): skins + Paint all
- New material categories in materials.js: **Fur** (zebra, giraffe, dalmatian, wolf, calico, shaggy, snow, black, fox; plus the old fur, tiger, leopard) and **Cosmic & Special** (galaxy, starfield, nebula, constellations, aurora, void, hologram, oil slick, opal, sun plasma, cyber grid, cosmic fur).
- Cosmic skins are shader effects (`ex.fx`, FX_GLSL/FX_MAIN in materials.js). `sky: 1` skins sample space by view direction so the stars stay put while the model moves (the classic "galaxy skin" look). Animated via `MATS.tick(t)` called from animate().
- 🎨 Paint all (Paint tab): a material or tint goes on every part at once.
- Bark skins: 10 Tree Bark textures from **Texture Pack by Lynocs** (https://lynocs.itch.io/texture-pack), **CC0 1.0** (credit optional; credited here). Baked diffuse x AO at 512px into `textures-bark.js` (base64, so the page still works from a double-clicked file). Materials `bark1`..`bark10`, category "Bark (Lynocs, CC0)". Material textures `img:<name>` read from `window.FORGE_TEX`. The pack also has Cave Walls, Alien and other sets (same CC0) he can send next.

## Credits
- Texture Pack by Lynocs (CC0 1.0) — Tree Bark. Thank you, Lynocs!
- Quaternius packs (CC0) — see packs/index.js.
