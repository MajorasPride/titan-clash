# Titan Clash: read me first (handoff for the next chat)

Hi Claude. This is MajorasPride's game, and we build it together, one chat at a time. **Build onto this.** Don't start over. Everything you need is in this folder:

- `titan-clash.html`: the whole game. The long note at the top of the file has the history, the rules and a map of the code.
- `models/kenney-models.js`: Kenney buildings and cars (CC0), baked so they load when the game is double-clicked.
- `titan-clash-mcp/`: the agent-pilot server that lets Claude fly a titan. It hasn't changed since v5.
- `tools/bake_kenney.py`: the script that made `kenney-models.js`. Use it to add more Kenney pieces.
- **Start here: the "Titan Clash Handoff" Google Doc** (https://docs.google.com/document/d/1ZDMJVD08-JryRpFCsbLu4nV6pJUnmr5wOweyt11vHEw/edit), then the **"Titan Clash Game Plan"** (https://docs.google.com/document/d/1khXHE0--eEL4q5ewzN0EIQ273F98RB2JmtLHHxX30uY/edit) and the **"Titan Clash Dev Notes"** (https://docs.google.com/document/d/18GEBbO3RVWz87MaFAsQy0DsTLH3H0G9lFfMhYZOs8SE/edit). The old "Titan Clash Ideas" doc is retired (kept in Drive).
- `THINK-TANK-PLAN.md`: the older plan from the Nov 5 think tank.

`three.min.js` (three.js r128) is in this folder, so you can run the game headless and take screenshots.

## Ground rules
1. **Go through every change with me before you hand over a new version.** Give a short list of what and why, then wait for my OK.
2. **Screenshot the game** to check art and UI before showing it to me.
3. **Original titans only.** They can be inspired by Godzilla, Pacific Rim, Gundam, Macross or Blue-Eyes, but must not copy them.
4. The game is a **folder** and must still work when you double-click `titan-clash.html`. That means `fetch()` of local files is not allowed, but `<script src>` works. Put new assets in `.js` files with base64 inside, the same way `models/` does.
5. I plan big features in their **own chats**. Finish the job you were given, and suggest new things rather than starting them.
6. I play on PC and on my phone.

=====================================================================
## v8.5 everything from the sandbox (Nov 8, 2026)
=====================================================================
- **Rule from MajorasPride:** the game never has more than the sandbox. The sandbox has everything the game has, with ⚙ switches to turn things off, and all new work starts in the sandbox.
- Moved in: `44-motion.js` (fluid motion), `45-lock-flash.js` (lock-on flash, roomier city), `46-magma-surge.js` (Magma Wall archived: `archive/titan-clash-magma-wall-archive.js`), `47-cam-views.js` (🎥 / C), `48-flow.js` (hit-pause, no auto Combo Breaker; `FLOW.on`), `49-valor-kit.js` (Gunpla VALOR; `VK.on`), `50-limb-hits.js` (LIMB HITS; `SB.limb`). Notes: `patch-notes/v8.5.md`.
- Sandbox 20: `sandbox/src/24-compare.js` = the ⚙ IN THE GAME SINCE v8.5 switches.

=====================================================================
## Sandbox 19 FIGHT LAB (Nov 8, 2026, sandbox only)
=====================================================================
- `sandbox/src/23-fight-lab.js`: LIMB HITS (body-part hit points with swept checks, wraps `coneHit` and `FP.melee`; move-to-part list `LAB_LIMB`), HITBOXES view, live FRAME DATA cards, MOVE MAP of cancels. All toggles in the ⚙ menu. Details and next steps: `sandbox/SANDBOX.md` → Sandbox 19.
- From a study of Fray, Mugen3D, ThirdPersonSmashDemo (all MIT) and fighting-game-prototype (no license, ideas only). Credit the MIT ones if this moves into the game.

=====================================================================
## v8.4.7 unfinished titans hidden (Nov 8, 2026)
=====================================================================
- `38-titan-status.js`: `TITAN_HIDDEN=['raikou','ragnavox']` takes them out of `V8DEFS`/`ROSTER` (kept in `HIDDEN_DEFS`). `TITAN_STATUS` is empty for now. makeCity: `MAP.bGap` switch (off in the game). Notes: `patch-notes/v8.4.7.md`.
- **MYTH FORGE (Nov 8, read `myth-forge/README.md` first).** The INFERNOTH parts editor grew into its own builder for any creature, mech or prop: `myth-forge/` at the repo root, live at https://majoraspride.github.io/titan-clash/myth-forge/ . MajorasPride picked the name "Myth Forge" (it can be more than titans; the in-game Titan Lab should hook into it later). Phone-first + stylus.
  - **Nov 9: parts now fit the body.** Every body type starts with a base body (mannequin) to build on; parts swap in and size themselves to their slot (torso fills chest->hips, heads/limbs/hands/jaws match the body width); Dragon's Dogma-style body shape sliders refit everything; first tails + wings added. See `myth-forge/README.md` "Nov 9". Next: more tails/wings/back plates/tentacles, check each body type on his phone, per-part fit for kit pieces.
  - **Nov 9:** the 🧑 Hero tab was built, then removed the same night at his request (archived in `myth-forge/archive/`); he wants an asset-based character creator later. Added cosmic/galaxy skins, more fur and 🎨 Paint all. Later idea: an original Robotech-style robot. Bark skins added from Texture Pack by Lynocs (CC0 1.0, credited in myth-forge/README.md).
  - **Sounds he has (not in the repo):** "Must Have Horror Sound Effects" by yourpalrob (https://yourpalrob.itch.io/must-have-horror-sound-effects), free 150-sound pack (Ambient, Character, Monsters & Ghosts, House & Office, Stingers, Liquids; WAV). Terms: OK in commercial games, no credit needed, but NO redistributing/repacking the raw files — so never commit the raw WAVs to this public repo; only ship them baked into a game build. He plans to pay $1 (unlocks the full 1,120 sounds).
  - **Inspiration art he has (not in the repo):** "Monstrous Menagerie #1" by Tania Herrero (https://tania-herrero.itch.io/monstrous-menagerie-stock-art-set-1), 8 ink creature illustrations: Antediluvian Leviathan, Baleful Cockatrice, Ravenous Watcher (eye-stalk orb, good reference for the Beholder body type he asked for), Goblin Marauder (wolf rider), Dragon Tyrant, Shrouded Beast, Deathcap Emissary (mushroom/tree giant), Grandiose Lich. License CC-BY 4.0: use/modify in commercial work OK, credit "Tania Herrero" (tania-herrero.itch.io), no reselling/redistributing the images on their own, and the work using them must not contain AI-generated content. The artist said redrawing the designs for a game (with credit) is fine. Plan: use as idea references for original creatures; credit her if a design draws from one.
  - **Nov 9 (3am): new easier UI on a TEST page only** — https://majoraspride.github.io/titan-clash/myth-forge/test.html (4 main tabs, drag parts from the grid, drag by default, free/floating placement, hide gizmo arrows, Workshop up front, copy/paste, 🎓 Build together guide for every body type). He OK'd it the same night: it's now the LIVE layout (old one archived in myth-forge/archive/page-v1-old-layout.html). Mech necks added too. Later that night: 16 new sculpt tools (Nomad/Blender-style), 🗿 Sculpt together lessons with 👀 Show me demos, more dense clay shapes, real full screen — see myth-forge/README.md. **Mythic Forge has its own Build Log: myth-forge/BUILD-LOG.md (top = what to fix next: parts don't fit together on many body types; combine with Titan Clash Studio into one app).** Details: `myth-forge/README.md` "NEW UI — TEST PAGE".
  - **Nov 9 skins:** candy (20) and toy skins (clear toy plastic, army men, toy brick plastic). **Next asks:** Zoids-style animal mechs and Power Rangers/Megazord-style combining mechs in Mythic Forge — go through the plan with him first.
  - What's in: ~400 parts made in code (ours): Basic Shapes & Clay, creature heads/skulls/jaws/teeth/horns/crests/masks/eyes (parts/creature-heads.js, 119), creature bodies (parts/creature-body.js, PARTIAL: necks, spines, torsos, arms, hands, legs done; tails, wings, back plates, tentacles, bones were still being built when the chat ended), mech (parts/mech.js, 83), weapons + magic + clothing + gore/ooze + nature (parts/weapons-magic.js, 92), Mecha Dragon kit (parts/mecha-dragon.js: chrome segments, blue orb gems, orb-shield wings, helm with hammerhead crests), sphinx kit (parts/sphinx.js: manes, beard, paws, feathered wing, pharaoh collar, belt, bracers). Free Packs: 10 Quaternius CC0 packs in packs/ (animals, dinos, critters, sea, cute fish, mechs, knight = whole bodies; weapons, sci-fi guns, RPG items).
  - Editor: 27 skeleton body types (biped, mech, slim, brute, gorilla, four-arm, angel, centaur, naga, kaiju, quad, dragon, hydra (3 heads), wyvern/bird, sphinx, serpent, fish, octopus, spider, insect, scorpion, crab, walker, tank, blob, none) + save your own body type; parts snap to bones (limbs/tails/necks/wings auto-fit the bone chain) or stick to surfaces; L/R twins mirror every change; pose, move joints, extend/branch/delete bones; Idle/Walk/Roar/Fly/Attack/Slither previews; sculpt on every part (inflate, deflate, grab, smooth, flatten, pinch, crease, rough, erase, subdivide); 70 materials incl. chrome, orb gems, glass + stained glass, scales, fur, ooze, blood, lava; triplanar textures (no UVs needed); brush paint; image patterns; tags + favorites; Workshop (⋯ → Create Asset) saves your own parts to My Parts; ✒️ stylus mode; fog/mist/aura/drips/bloom; backgrounds; export .glb; hide/solo per part; ⤢ hides menus.
  - Later on Nov 8 (after his feedback "no mech parts", "hard to design little parts", "moving around is hard on phone"): categories are now a sorted grid (Yours / Clay + Slider Makers / Creature / Mech / Kits / Gear / Free Packs) that folds away; Part Makers (parts/makers.js: eye, finger, hand, horn, teeth, tail, wing, spike/crystal row, leg, ear) shaped with sliders in the new Shape tab (pt.params); 🔍 Focus mode isolates + frames one part; on-screen nav pad (zoom/orbit/pan/🎯 fit) + double-tap to center; Workshop now opens with a 'What do you want to design?' picker and a green size guide box; Hero Mech (model kit) starter built from mech parts + sword/shield/rifle. Numbered bones: every joint shows a number (head = 1, then jaw, neck, chest…; same order in the Skeleton tab 'Jump to bone #' grid and the Add tab 'Put it on bone #' chips, tap a number to jump or to drop the picked part there). Opens on an empty biped skeleton (he asked: don't start on the Mecha Dragon). Picking a bone (number chip or dot) switches the Add grid to that bone's category (jaw → Jaws & Teeth, hand → Hands & Claws; mech body types → Mech groups; groupForBone()); picking a category yourself overrides it until you pick another bone. Picking a part does NOT move the bone; instead the matching bone chips glow green (he was unsure which way he wanted it).
  - Starters: Hero Mech, Basalt Kaiju, Snapjaw Turtle Brute, Mecha Dragon (MajorasPride: "looks like a shining horse, I actually like it, but I need to work on it"). He wants the starters he sees to be a mech + a Godzilla-style kaiju (+ turtle monsters), not the Mecha Dragon.
  - **Nov 8 late (session 01KmrnUg7, pushed 06e6804 + the Mold/craft commit): he asked for a SIMPLE, NOT BUSY screen.** Bone numbers: # All / # Picked (selected bone + typed numbers, e.g. 2, 28) / # Off + Fade slider, under More in Add + Skeleton (localStorage `mf-nums`, default Picked). 🪟 Focus window: small zoomed window on the picked part (scissor render, drag = spin, pinch = zoom, Size S/M/L). Arrow pad hidden by default (FX/View → Arrow pad, `mf-nav`), lighter/smaller bone dots + sticks, less-used buttons in every tab moved into "More ▾" (<details class="more">). Weapons dropped on a hand bone go into the palm (palmGrip(): p=[0, len*.5, .15], r=[90,0,0], one hand; he'll tune weapon holding later). New kits: parts/kaiju-kit.js (kj_, "Basalt Kaiju": head/jaw/neck/chest/hips with belly scutes, pillar legs, clawed feet, small arms, per-bone tail segments, hex basalt-column dorsal rows with glowing magma seams) and parts/turtle-kit.js (tt_: spiked keel / smooth dome / ancient stone shells, belly plate, snapper beak head + jaw, wrinkled neck, thick limbs, 3-claw hands/feet, saw-tooth tail, spike row). Originals only (Tokka is TMNT's; ours is a generic snapping-turtle brute). Starter tuples accept size as [size, length]. NOTE: bone frames flip on tail3+ of the kaiju skeleton (basisFor ref switch), so tail parts there use Turn [0,180,0]. TOY MODE (Move tab): 🧩 Break apart = one part per touching piece cluster (pt.keep = piece indexes, pt.off = pivot at the cluster's base); 🧲 Sticky = drag any part (finger/pen/mouse), it sticks where dropped (re-parented to the bone of the part under it, +Y to the surface normal); drop off the model = 📦 Parts box (pt.boxed, chips at top of Add tab). 🫳 Mold (on by default, `mf-mold`): the dropped part squishes around what it lands on like clay (moldOnto(): 15x15 height grid raycast, writes into pt.sculpt; Sculpt › Undo all sculpt un-squishes). Craft (toy box) materials in materials.js, inspired by LittleBigPlanet's craft look (all textures ours, made in code): cardboard, white cardboard, polystyrene, sponge, pink floaty foam, felt, green felt, stitched felt, knitted wool, sackcloth, denim, patchwork quilt, crumpled paper, toy rubber, toy plastic. Guide: first-time tour (`mf-tour-done`, starts with Mech / Kaiju / Turtle buttons) + ⋯ → 🎓 tour and ❓ How to build. Name stays Myth Forge (he decided). Later: Paint tab 🎯 One piece only (tap one spike/crystal, then a material; pieceClusters(pt, strict) groups stacked bits) and a bigger Eye maker (eye shape incl. bug/compound, 12 pupils, pupil size, eyeball color, shine dot, bottom lid, lid skin, mech lens rim, brow ridge / spiky lashes / scar / tear streaks). NAME: he renamed it **Mythic Forge** (title/header/tour/help say Mythic Forge; folder + URL stay myth-forge/). Double-tap a part in the Add grid adds it at once (quickAdd). Nov 8, ~10pm: Snapjaw Turtle Brute is NO LONGER a starter (he said it doesn't need to be; the Turtle Kit parts + 3 shells stay in the library). New starter **Sailback Spinosaur** (parts/dino-kit.js, dn_: croc-snout head + jaw, neck, body, back sail with bone spines, big thigh, shin, 3-toed foot with dewclaw, hook-thumb hand, tail segments, paddle tail fin) on the new body type **'Dinosaur (2 legs, leaning)'** (T.theropod in skeletons.js: body leans forward, tail straight back). Tour start buttons are now 🤖 Mech / 🦖 Kaiju / 🦕 Dino. First pass only, not reviewed by him yet: head could be bigger, sail could sit higher. **NEXT (he asked, not built yet):** 1) a **Beholder** body type (floating round body, one big center eye, a ring of eye-stalk bones on top, big mouth/jaw, no legs) + beholder parts (eye stalks with the Eye maker); 2) let him **make his own skeleton and remove skeleton parts** easily: the tools exist but are hidden under Skeleton › More (＋ Extend bone, ＋ Branch, Delete bone, 💾 Save as my body type) — move them into the main Skeleton row, check Delete bone also removes child bones + their parts cleanly, and add 'Start from scratch' (No skeleton) with a short how-to; 3) a **three-headed dragon body type where the ARMS ARE THE WINGS** (Ghidorah-style layout: 3 necks/heads, wing-arms with finger bones holding the membrane, 2 legs, 2 tails). The hydra type has 4 legs + separate wings, so it's wrong for this. Keep designs original (no Toho/King Ghidorah copy). This also fits RAGNAVOX. He said the eye maker was "not bad first try" but wants more options; other makers may need the same.
  - **Next chat (Myth Forge):** 1) finish/verify parts/creature-body.js (tails, wings incl. bat/dragon membrane, back plates/crystal spines, tentacles, bones) and copy it in; 2) starters: INFERNOTH (his 8-angle GIF: stocky upright bronze-brown body, pale banded belly plates, wide flat horned head, double row of ice-blue crystal spikes neck to tail tip, long thick tail, 3-toed feet), RAGNAVOX (his GIF: golden-orange 3-headed dragon, horned heads with blue gem spots, pale belly, 4 legs, use the hydra body type), Sphinx (sphinx body type + sx_ parts), and a hand rebuild of his two Rodin models (chrome mecha dragon with round orb-shield wings and hammerhead crest; three-headed blue dragon) — he can't download Rodin GLBs (free plan), so rebuild them in code from his screenshots; 3) more Mecha Dragon polish (narrower wing fan, longer neck, bigger head); 4) put a Myth Forge link + notes in the Game Plan doc. Originals only (no Blue-Eyes / Yu-Gi-Oh / Godzilla copies).
- Parts editor v4 "PARTS LIBRARY" (Nov 8): new Library tab in `game/tools/infernoth-parts-editor.html`. 32 snap-on parts made in code (ours, no license needed): Horns (curved, spike, ram, antler), Claws + teeth (claw, talon set, fang, tooth row), Crystals + armor (crystal, crystal cluster, back plate, spike row, scale patch), Head (frill, skull helmet, brow ridge, glowing eye), Tail + wings (tail club, tail blade, bat wing, tentacle), Mech armor (armor plate, shoulder armor, knee guard, V-fin, blade fin, kite shield), Mech detail (thruster, vent, piston, visor, gun barrel). Pick a part, tap the body: it snaps to the surface (part's +Y lines up with the surface). Added parts get Move/Erase/Paint, "Copy to other side" makes a mirrored copy, "Delete part" removes it; listed under ADDED PARTS in ☰ Parts. Import file… takes .glb/.gltf/.obj/.fbx or a whole .zip pack (each model in the zip becomes a part, sized to ~3 units); imports are kept in the browser (IndexedDB `tc-parts-imports`), never in the repo, so paid packs aren't redistributed. Library slots in the save: `{k:-1, src:'L', lib:id, p (world), r (deg), s, flip, tint, cut.L}`. Free packs found for later: Quaternius Ultimate Monsters (CC0), MakeHuman CC0 horns; cheap: Low Poly Kit-Bash Set ($5, royalty-free, no redistribution). Avoid the 500+ Greebles pack (CC BY-ND = no changes allowed). The workspace couldn't download from those sites, so MajorasPride imports them himself.
- INFERNOTH parts editor (Nov 8): `game/tools/infernoth-parts-editor.html` (standalone, ~5 MB, both AI models embedded). His two AI models (Model 1 = walking, Model 2 = T-pose, both made from Meshy free-plan pictures through TRELLIS, so CC BY 4.0: credit Meshy if used) are cut into 11 parts (Head, Neck, Torso, Sail/back, Arm L/R, Leg L/R, Tail base/middle/tip) by position. The code-built v0.3 INFERNOTH is in too (exported from its test page, already split by its own joints): parts can come from Model 1, Model 2 or v0.3, and Base cycles Model 1 → Model 2 → v0.3. v2 (Nov 8, Blender-style): tabs Parts / Move / Sculpt / Paint / View, outliner, undo/redo (Ctrl+Z / Ctrl+Shift+Z), transform gizmo (G/R/S, world/local, snap), duplicate parts (Shift+D) + delete copies (X), flip/mirror and copy L↔R, sculpt brushes on Model 1/2 parts (inflate, deflate, smooth, flatten, grab) with X-mirror, per-part erase, tint/paint, camera views (1/3/7), wireframe, X-ray, isolate (H). Starts as all-v0.3 with v0.3 as base. Saves to localStorage key inf-editor2. v3 (Nov 8): phone-first for his Galaxy S23 Ultra: big touch buttons, parts list is a slide-in drawer (☰ Parts), bottom sheet collapses (tap the title), landscape puts the panel on the right; S Pen draws/sculpts with pressure and hover brush circle while fingers turn/pinch the view (no pen: one finger draws, two fingers turn/zoom, or 'Finger = turn view'); bigger gizmo on touch; small vibration on select. Per part: pick Model 1 / Model 2 / remove, move/turn/size sliders, erase brush for that part, undo; Base switch lines parts up to either body. Saves in the browser; "Copy settings" gives JSON to paste to Claude. Model 2's loose bits (his cleanup cuts) are left out. Not used by the game.
- INFERNOTH model (Nov 8, design only, nothing in the sandbox yet): tried iguana, dinosaur, Spinosaurus, AI models (Meshy/TRELLIS) and a model-kit version; MajorasPride picked the code-built **v0.3** look (iguana-style kaiju with crystal armor plates down the back/tail, two shoulder crystals, lava patches; crystals dull when calm, glow with rage/element; Edit sliders). Test page: https://claude.ai/artifact/TeBUtMpoZ3vu5TB9sKzwZN . No orange-and-blue-stripes / Greymon or Godzilla look-alikes (copyright). His AI Model 2 with his cleanup cuts is kept aside.
- Sandbox 18 (testing, Nov 8): new Gunpla-kit VALOR body + kite shield + sword (`sandbox/src/22-valor-kit.js`). Wraps `buildMech` (removes the old VALOR body meshes, keeps every joint, moves the joint spots), `v8Dress` (restyles sword/shield) and `v8DiscMesh` (thrown kite shield). Model built in test-page units, scaled x3 (`VK.S`). `VK.on=false` turns it off. Next idea: INFERNOTH as a marine iguana (not a Godzilla copy).
- Sandbox 17 (testing): fluid motion (`sandbox/src/17-motion.js`), lock-on flash + roomier city (`18`), MAGMA SURGE (`19`), camera views + ACTION CAM (`20`), hit-pause fix + no auto Combo Breaker (`21`).
- Balance test tool: `tools/balance_test.py` (CPU vs CPU, no screen, fake clock for the game's timers).

=====================================================================
## v8.4.5 "THE TWINS + COMBO FEEL" (Nov 7, 2026)
=====================================================================
- `41-combo-feel.js`: hit-pause by hit strength + a look-only flinch (root tilt, no stun) on every landed hit by a core titan; whiffed lights mark `landed` 0.1s after their hit moment so the string can continue.
- `42-ashvin-twins.js` (moved from sandbox `16-ashvin-twins.js`): the twins' kit, runes, statuses (hexT, rootT, drainT, ashSlowT, soakT, curse), element pairs (`f.load.pair`: fireice / lightwater; `ashEl(f)` gives the fighting twin's element), ultimates SOLAR MANDALA / TOTAL ECLIPSE (`CINE.ash`), select-page pair buttons. Tag cut-ins now count as landed.
- `43-ashvin-look.js` (moved from sandbox `17-ashvin-look.js`): staff ribbons, painted hits/arcs (ice textures), the sun symbol (canvas drawing), eclipse moon + camera.
- Sandbox keeps `16-ashvin-sandbox.js` (⚙ LOADOUT pair buttons, colored damage numbers, TITANS lists). `TITAN_STATUS`: ASHVIN finished; no titan marked next yet. Still to do for ASHVIN: loadout paths/goals/Focus swaps (his select page still shows the old ability tree). Notes: `patch-notes/v8.4.5.md`.

=====================================================================
## v8.4.4 phone HUD on the left (Nov 7, 2026)
=====================================================================
- `40-phone-hud.js` (phone landscape only): `.infHud` and `#koBar` become one-line rows at left:90px under the health bars (yours at 84px, the rival's at 104px with a RIVAL tag). Rule from MajorasPride: nothing may cover the joystick or buttons. Notes: `patch-notes/v8.4.4.md`.

=====================================================================
## v8.4.3 Titan Core + HUD fix (Nov 7, 2026)
=====================================================================
- `03-fighter.js`: a Titan Core (`f.coreReady`) now starts the real ultimate (`startAtk('ultimate')` + `v8UltStart`) for every core titan and leaves `ultUsed` alone. The old pre-v8.3 'super' path is no longer used by the core titans.
- Phone HUD: `#koBar` (14-valor-boxer.js) and `.infHud.r` (32-infernoth-brawler.js) moved. Notes: `patch-notes/v8.4.3.md`.

=====================================================================
## v8.4.2 buildings break again (Nov 7, 2026)
=====================================================================
- `39-building-hits.js`: the new kits' hit code (coneHit, landHit...) only checks the rival. A wrapper on `FP.update` calls `bldSwing()` once per attack when `a.t` passes `a.hitAt` (close-up moves only; ultimates and ranged moves have their own). Damage per button in `BLDHIT`. Testing tip: headless Chrome runs a few frames a second, so wait until `f.atk` ends (not a fixed time) and keep `f.yaw` facing the building (attacks face the camera's `aimYaw`). Notes: `patch-notes/v8.4.2.md`.

=====================================================================
## v8.4.1 "WHO'S NEXT" (Nov 7, 2026)
=====================================================================
- `38-titan-status.js`: select-screen tags + a note on the titan file. Edit `TITAN_STATUS` when a titan is finished (remove it) or becomes next (`'next'`); `TITAN_SOON` holds the shadow cards (VOIDMAW). Notes: `patch-notes/v8.4.1.md`.

=====================================================================
## v8.4 "NEW INFERNOTH + LOADOUT" (Nov 7, 2026)
=====================================================================
- Moved from `sandbox/src/` into `tools/v8-src/`: `32-infernoth-brawler.js` (armor, rage, BRAWLER), `33-infernoth-meltdown-ults.js` (MELTDOWN, KING, LAVA DOMAIN, GROUND ZERO), `34-poses-all.js`, `35-loadout.js` (paths, goals, Focus swaps, elements, upgrade card), `36-element-looks.js`, `37-loadout-page.js` (titan file page follows the element + DEFAULT picks on the select screen).
- DEFAULT: `loadOf()` now starts every pick on `'default'`; `loResolve()` turns it into the real pick when the fight starts (`f.loadRaw` keeps the raw picks for the upgrade card). Saved picks from before v8.4 were reset once (`tc_v84load`).
- Sandbox-only parts stayed in `sandbox/src/`: `12-sandbox-loadout.js` (⚙ LOADOUT picks, starts as INFERNOTH vs VALOR), `14-meters.js`. VOIDMAW is still sandbox-only. Notes: `patch-notes/v8.4.md`.

=====================================================================
## v8.3.1 bug fixes (Nov 7, 2026)
=====================================================================
- `14-valor-boxer.js`: the heavy button label goes back to HEAVY when the player isn't VALOR. SUPERS READY leaves the KO meter alone when `SB.meterCtl` is set (the sandbox's METERS tool).
- `24-cine-view.js`: `viewShow()` brings back only standing (or still-toppling) buildings after a cutscene hid them. Notes: `patch-notes/v8.3.1.md`.

=====================================================================
## v8.3 "NEW VALOR" (Nov 7, 2026)
=====================================================================
- The sandbox VALOR (both stances, combat, 1/2/3, water, both ultimates + cutscenes, fonts) is in the game: `tools/v8-src/10-...31-...js` (moved from `sandbox/src/`). `11-skill-keys.js` holds the 1/2/3 keys and the sandbox hooks (sbStart, sbSync, sbReset... call `sbBase`, which only the sandbox fills in). `30-game-settings.js` sets the sandbox test switches to normal play.
- WORLDROOT is off the roster (`archive/titan-clash-worldroot-archive.js`); Titan Lab code is out (`archive/titan-clash-titan-lab-archive.js`). Notes: `patch-notes/v8.3.md`.
- The sandbox is built from the game, so code that moves into the game must be taken out of `sandbox/src/` (or it loads twice).

=====================================================================
## v8.2.1 "APP" (Nov 6, 2026)
=====================================================================
- The game is a website + installable app (PWA) on GitHub Pages: https://majoraspride.github.io/titan-clash/ . Files: `manifest.webmanifest`, `sw.js` (offline helper, only runs over http/https, so double-click still works), `icons/`, repo-top `index.html` + `.nojekyll`. Notes: `patch-notes/v8.2.1.md`.
- Every push to main updates the website and the installed app. If you add a new core file the game loads, add it to `CORE` in `sw.js` and bump `CACHE`.

=====================================================================
## SANDBOX (Nov 6, 2026) — read SANDBOX.md
=====================================================================
- `sandbox/titan-clash-sandbox.html` = training ground, ONE standalone file (kept separate from the game zip) (VALOR vs an INFERNOTH dummy on empty ground). **New mechanics are built and tested there first**; only what MajorasPride OKs moves into `titan-clash.html`. Build: `python3 sandbox/build_sandbox.py` (game + `sandbox/src/`). Log of every sandbox test: `sandbox/SANDBOX.md`. Repo: github.com/MajorasPride/titan-clash (game/ and sandbox/).
- Sandbox 1 = fight feel (poses, blade hits, trails, clash, chains, 1/2/3 skills) + VALOR's full kit. Status: testing.
- Next sandbox ideas from MajorasPride: test the new dark-magic kaiju in the sandbox too. WORLDROOT is still in the game until v8.3 archives it.
- Testing tip: headless Chrome runs at ~2 fps, so step the game by hand: `requestAnimationFrame=()=>0` then call `loop(t)` with t += 16.7 (see how Sandbox 1 was tested).

=====================================================================
## v8.2 "NO MORE STUN LOCK" (Nov 6, 2026) — read this first
=====================================================================
- **The plan lives in the "Titan Clash Game Plan" Google Doc now** (plus the "Handoff" doc). The old Ideas doc is retired.
- Stun lock fixed: burn never stuns, light hits stun only every 5th hit, BREAK FREE after 2s of stun. New front AUTO-GUARD for small shots with a shield strip on the health bar. All in `tools/v8-src/08-guard.js`. Notes: `patch-notes/v8.2.md`.
- **Planned next (agreed with MajorasPride, see the Game Plan Ideas Inbox):** v8.3 archive WORLDROOT + new dark-magic kaiju (Shuma-Gorath / Biollante inspired) + ASHVIN sun/moon spell circles; v8.4 Risk of Rain 2 style 1/2/3 skills, weapon feel, aimed ultimates with anime/mecha cutscenes (3-6s, only on contact); v8.5 Robotech: Battlecry feel (movement, cel-shaded FX, building collapse).

=====================================================================
## v8.1 "CLEAN SLATE" (Nov 6, 2026) — read this first
=====================================================================
- **Main plan = the Titan Clash Ideas Google Doc:** https://docs.google.com/document/d/1McUnH3mbJuEy1T-i3bgr0xVrWU1NY_WrAHA1JVfoiYk/edit
  Read it first, and update it at the end of every chat. It's a living doc: the idea sections stay, the Wishlist is only for later (don't build from it), and everything that gets built goes into its **Build Log** with the version and the zip it's saved in.
- **Never delete anything** (Drive files, archives, old versions). MajorasPride keeps every version and archive so he can go back or see how the game was built. Archive removed code instead of deleting it.
- **Brainstorm before adding.** When MajorasPride gives a list, break it down into a clear checklist first, talk it through, then check items off. Don't add features he didn't ask for (the scope was his brother's idea and was removed in v8.1; it may come back after a brainstorm).
- The game is now **only the core six on NEON CITY**. Full notes: `patch-notes/v8.1.md`.
- **Gone from the game files** (saved in MajorasPride's Google Drive): the 12 old titans + THE RIFT KING (`titan-clash-old-roster-archive.js`), the 5 old maps with their disasters and screen weather (`titan-clash-old-maps-archive.js`), the Vault, `titan-clash-v6.html`. Full old game: `titan-clash-v7.3.zip`.
- **Elements:** Fire, Water, Lightning only (Steel + Anti-Magic put away). Defaults: VALOR Water, ASHVIN Fire, RAIKOU Lightning, INFERNOTH Fire, RAGNAVOX Lightning, WORLDROOT Water.
- **No scope** (MajorasPride hates it). Don't bring it back.
- **Hidden:** STORY MODE and TITAN LAB say COMING SOON. The story engine is still there for the new story; Titan Lab's `customDef` still points at the old titans' ids and needs a rework before it comes back. Destroy the City is unlocked from the start.
- `RULES={}` and `rosterSpecial()` are empty hooks now; use them for new per-titan rules.
- Everything below this section is history; anything it says about the Vault, old maps or old titans is out of date.

=====================================================================
## v8.0 "CORE SIX" (Nov 6, 2026) — read this first
=====================================================================
- The game now follows the **Titan Clash Ideas** Google Doc (MajorasPride's main plan). Full notes: `patch-notes/v8.0.md`.
- **Roster:** VALOR, ASHVIN, RAIKOU (mechs) vs INFERNOTH, RAGNAVOX, WORLDROOT (kaiju). (v8.0 kept the old titans + maps in a Vault; v8.1 removed them.) One map: NEON CITY.
- All v8 code = the `<!-- V8 START -->` block at the bottom of `titan-clash.html`; readable parts in `tools/v8-src/` + `tools/build_v8.py`.
- **Patch notes rule:** every update gets a file in `patch-notes/` (MajorasPride asked for a logged history folder).
- Speech rule for cutscenes: mechs + WORLDROOT speak plainly; other kaiju only roar unless the player is a kaiju or ASHVIN is on the player's side.
- Don't build anything from the doc's **Wishlist** until MajorasPride asks.
- Next ideas: real 3D models for the six, new story mode for the six, playtest tuning (damage, cooldowns, heavy-hold timing).

=====================================================================
## STATUS + WISHLIST (v7.3) (end of Nov 5, 2026) — read this first
=====================================================================
This may be the last update for a while, or the project may be handed to someone else. Everything below is up to date.

### Where the game is now (v7.3)
- Folder game, double-click `titan-clash.html`. three.js r128 loads from cdnjs, and falls back to `three.min.js` in the folder when offline (bundled since v7.1, MIT license).
- The full v7 change log is at the top of `titan-clash.html` (PART 13). Code pointers are listed further down in this README.
- MajorasPride plays mostly on **phone** (landscape); his brother plays on **PC**.
- Feel we're going for: **Dragon Ball Z Budokai Tenkaichi 3** (camera follows you, big destructible city, cover) + a round-by-round disaster story told by the Ch 7 news. We borrow ideas from Godzilla: Destroy All Monsters Melee (pick up and throw buildings) but **we are not copying Melee — make it better.**

### Done (Nov 5)
- Classic neon box buildings default; sturdy buildings with health, damage stages, wall slams, cover; damage carries over between rounds.
- Screen weather on the lens (rain drops, frost, sand, ash/embers, Rift glitches), stronger each round.
- Phone: landscape lock, new thumb buttons, lighter HUD.
- Disasters step up per round; map trigger landmark → ridiculous round 3; Frozen Harbor rework (frost patches, whiteouts); sandstorm stun bug fixed.
- Crowds by round (normalcy bias → evacuation → ghost town) + TV highlight clip between rounds.
- DAZED / lock-on breaks.
- LOCK button switches FREE LOOK ↔ LOCK-ON (Titan Cam) since v7.3.
- Titan Cam (solo: Budokai-style follow cam that stays behind YOUR titan, steady sweet-spot distance; 2P: one shared screen). v7.2 fixed it turning the wrong way. Pick up and throw small buildings.
- Roster rules: signature rule + weather traits per titan; mechs save people and get furious when the monster kills them.
- 5 new titans: Runewood (real tree-giant body, `buildTree`) and Komainu (stone guardian lion on all fours, `buildLion`) have their own bodies since v7.3; the rest are still on borrowed bodies: Wreckjaw, Gorynax, Kongamato, Komainu, Runewood, each with its special.
- Chopper 7 field reports with live news graphics; IMPOSSIBLE difficulty; all-neon mode; hidden Destroy the City (after story chapter 1).

### Wishlist (next chats, roughly in order)
1. **Playtest pass on phone**: camera feel, button sizes, damage numbers (buildings too tough/weak?), disaster strength per round.
2. **Real 3D models** for the 5 new titans (model chat: Meshy for titans only; cel shading + outlines). Then slimmer, detailed models for the old 7.
3. **New movesets** for the original 7 titans (only their rules/weather traits are done; plan section 5 in THINK-TANK-PLAN.md has the move ideas).
4. Rest of the new titans: Wreckjaw drills + rubble walls in robot form, Kongamato walking on its wing-arms + boat breaking, Gorynax chains, Komainu shrine.
5. **Rift King boss rework** (brainstorm first; plan says make it its own boss titan).
6. **Tidefang's roll** — ask MajorasPride what's wrong (too long, hard to steer, or leaves you open).
7. Harbor ridiculous round: real breaking ice floes to fight on.
8. **4-player free-for-all** (big job: the code assumes 2 titans, `game.p`/`game.e`).
9. Unlockables you earn (Titan Lab abilities/parts, modes, looks), more hidden story mini games.
10. Victory poses per titan, limb damage/blood polish in realistic mode, crowd silhouettes in lit windows, rescue helicopters/boats in round 3.

### Decisions already made (don't re-ask)
- Map trigger = a landmark you hit (⚠ sign); disasters can't break it.
- Runewood is fully immune to environment damage in round 3.
- Avalanche removed from Frozen Harbor (it overlapped the flood surge).
- Who's winning never changes the disaster steps.

### How to work with MajorasPride
- Short, simple explanations. Talk changes through before big rebuilds, unless he says "just build it" (he did on Nov 5).
- Screenshot PC and phone before handing over. Original titans only.

## What was done last (v7, Nov 5 2026, built while MajorasPride slept: needs his OK)
Plan step 1 is built, plus screen weather (MajorasPride asked for it early). Nothing is pushed anywhere; he reviews it first.
- **Classic box buildings are the default** again. Kenney looks stay in Settings, City look, and `models/` is kept. Saved settings switch to Classic once (`SET.v7`).
- **Sturdy buildings:** health per building (`bNew`: 30 + height×2.3 + footprint). All damage goes through `bHit(b,dmg,dx,dz,hy,by,px,pz)`; `smash()` has an 8th `dmg` argument.
  - Light punch ≈ 18, heavy ≈ 30, beam ≈ 105 per second, wall slam 22–80, charge 65. A small building takes about 4 light punches.
  - Stages (Classic): cracks, then top knocked off + hole + smoke, then leaning, then collapse into a rubble pile (`bRubble`). Neon maps get glowing ember cracks.
- **Wall slams** (`bContact`): knocked into a building = stagger + "WALL SLAM!"; if it breaks, "THROUGH THE WALL!". Walking into a building no longer flattens it.
- **Cover:** shots explode on walls with tiny splash past them; beams stop at the first building that holds.
- **CPU:** if it keeps walking into a building, it goes around or smashes through (end of `AI.update`).
- **Carry-over:** `startRound()` only builds the city in round 1. Later rounds call `carryCity()` and `resetDisaster(true)` (ground cracks stay). News gives a damage report.
- **Screen weather** (Settings, Weather on the screen; code `SCREEN WEATHER (v7)`): lens drops, frost corners and whiteout haze, sand grit and dust clouds, ash, embers and heat glow, Rift motes and glitches. Strength = round + disaster stage (`wxTarget`). Chopper 7 gets still lens drops, wind buffeting, a weather alert bar and signal breakup.
- Backup of the v6 file: `titan-clash-v6.html`.

### Then the rest of the plan (MajorasPride: "finish all the ideas, no need to stop")
Full list is in the v7 change log at the top of `titan-clash.html`. Code pointers (Ctrl+F):
- `PHONE CONTROLS (v7)` (CSS), `goLandscape`, `checkRotate`: phone layout, landscape lock, wider phone camera (`c.far`).
- `DISASTERS BY ROUND`, `disTarget`, `TRIG`, `makeTrigger`, `trigBroken`, `frostUpdate`, `whiteoutLock`, `blackout`: round-based disasters, triggers, ridiculous stage 4, Frozen Harbor rework.
- `CROWDS BY ROUND`, `crowdRole`: crowd behavior. `TV HIGHLIGHT CLIP`, `startClip`: between-round clip.
- `LOCK-ON BREAKS`, `daze()`, `updateDaze`: concussion and DAZED.
- `MELEE CAMERA`, `camMelee`, `shared()`: Melee-style side camera (default, Settings > Camera). `liftBuilding`: pick up and throw buildings.
- `ROSTER RULES (v7)`, `RULES`, `rosterTick`, `rosterSpecial`, `portal`: signature rules, weather traits, mechs saving people, new titans' specials.
- New titans in `ROSTER`: wreckjaw, gorynax, kongamato, komainu, runewood (built on existing bodies; Gorynax clones its head twice).
- `heliFocus`: Chopper 7 field reports. `IMPOSSIBLE`, `neonize` (all-neon), `game.destroy` (Destroy the City).

### Decisions I made on the open questions (change them if you want)
- Map trigger = a landmark you hit (it has a ⚠ sign). Disasters can't break it, only titans.
- Rune tree in round 3: fully immune to environment damage.
- Avalanche dropped from Frozen Harbor (it overlapped the flood surge); frost patches + whiteouts instead.
- Still open: Tidefang's roll, Rift King boss brainstorm.

### Not done yet (good next chats)
- New titans still use the old bodies (need their real 3D models from the model chat) and the current titans keep their old movesets; only signature rules and weather traits were added.
- Done in v7 finishing pass: Gorynax regrowing heads, Wreckjaw crane hook + rubble wall, Komainu twin spirit, Kongamato carry-throw. Still to do: Wreckjaw drills, Kongamato walking on its wing-arms, real ice floes in the harbor's ridiculous round.
- Unlockables beyond Destroy the City, 3–4 player free-for-all (Melee style), fight balance pass.

## Before v7 (v6)
- **City look setting** (Settings, City look):
  - Neon: Kenney models recolored for each map. This is the default.
  - Toy: Kenney's own bright colors.
  - Classic: the old box buildings.
  - Without `models/`, the game falls back to Classic.
- **Destruction:**
  - Punches and shots knock out the floors they hit, and the floors above drop down (`kPunch`).
  - Collapses pancake floor by floor and leave rubble piles (`kCollapse`, `kRubble`).
  - Toppled skyscrapers leave rubble along the line where they fell.
  - Cars get crushed, and their tires and doors fly off (`kWreckCar`).
  - Disasters already go through `crumble()` and `smash()`, so they use the new destruction automatically.
- **Speed:**
  - An intact building is a single mesh. It only splits into 3-floor chunks the first time it's hit (`kWake`).
  - Buildings in the outer ring (past radius 125) use simpler pieces.
  - The Downtown overview is about 1 million triangles. If a PC struggles, Classic is the fallback.
- **Fight settings** (Settings, Round time and Titan health):
  - The balanced default gives story rounds 150 s (boss 240 s) at 70% health, and other fights 120 s at 85% health. Story fights used to keep ending on the clock.
  - Health works by scaling the damage a titan takes, in `takeHit`. See `fightTime()` and `fightHp()`.
- **Notes:** the "gift from my brother" wording was removed. It's our game.

### Code pointers
Search the file with Ctrl+F for:
- `KENNEY CITY (v6)`: all the Kenney code. The globals are prefixed `KN`, `KTILE`, `KFLOOR` and `KCHUNK`. `KF` and `K` already exist in the game, so don't reuse those names.
- `makeCity`: picks Kenney or classic per building.
- `crumble`, `smash(x,z,rad,y,dx,dz,hy)`: `hy` is the hit height, used for knocking out floors.
- `v6 FIGHT SETTINGS`: the time and health settings.

### How I tested
1. Serve the folder with `python3 -m http.server` (or open it as `file://`).
2. Load it in Playwright with Chrome and SwiftShader.
3. Call `applyMap(id); makeCity();` for each map, `startMatch()` for fights, and `smash()` / `crumble()` / `wreckCar()` for destruction.
4. The game loads three.js from cdnjs. If that's blocked, point the script tag at the local `three.min.js` while testing.

## Think tank done (Nov 5, 2026): read THINK-TANK-PLAN.md first
The whole plan from the think tank is in **THINK-TANK-PLAN.md** in this folder (live copy: https://claude.ai/artifact/T1B6ksLwqFMak5hnbFSjbi). Short version:
- **Buildings decided:** use the Classic neon box buildings for now. Hide the Kenney buildings (make Classic the default City look) but keep them in the game and in `models/`.
- **Living battlefield:** damage carries over between rounds, buildings are sturdier (health, damage stages, wall slams, real cover).
- **Disasters step up once per round** (light, feel it, extreme). Breaking a map's trigger in round 1 makes round 3 ridiculous.
- **Crowds thin out each round** (based on real disaster behavior) + a short TV highlight clip between rounds.
- **Every titan gets a signature rule** and weather strengths/weaknesses. Mechs save people and get stronger the more people the monster kills. Lock-on can break (short, clearly shown).
- **New titans:** Wreckjaw (demolition mech built from a mystery kaiju), 3-headed dragon, Kongamato, Komainu, rune tree giant.
- **Phone first:** landscape lock, new button layout, wider camera.
- Feel: Dragon Ball Z Budokai Tenkaichi 3 style destruction and cover (feel only, nothing copied).
- Follow the **build order** at the end of the plan, one item per chat, and talk each change through first.

## Ideas for next chats (one chat each, talk it through with me first)
1. **Redo every titan** so each one's abilities are unique. Discuss the ability list with me before coding.
2. **Hidden mini games in story mode.** For example, "Destroy the city": run around and wreck as much as you can before the timer ends. The new floor-by-floor destruction makes this fun.
3. **Unlockables** you earn by playing: Titan Lab (create a kaiju/mech) abilities and parts, modes, looks.
4. **New modes:** an "all neon" mode where everything glows, and an IMPOSSIBLE difficulty.
5. **Phone HUD is too crowded during fights.** Make a lighter mobile layout: hide the move list, use smaller bars, keep the important info only.
6. **Fight balance:** play with the new time and health defaults, then tune them, or add per-titan tweaks.

## Character models (the art plan from earlier chats)
- **Titans:** Meshy (free plan: 100 credits and 10 downloads a month). Spend Meshy only on titans.
- **Props and set pieces:** Tripo (free, about 300 credits a month, models are CC BY so add a credit line), Hunyuan3D 2.1 or TRELLIS.2 on Hugging Face (needs my read-only HF token, which I'll delete afterwards). Use these for the volcano, lab dome, harbor crane, rift crystals and Chopper 7.
- **City buildings and cars:** Kenney kits (done). More free CC0 kits: City Kit Commercial/Industrial/Suburban. "Cyber City" on itch.io (check its license).
- **Steps for each titan:**
  1. Make a concept image and show it to me for yes or no.
  2. Generate the GLB (about 30–60k triangles).
  3. Rig it: Meshy auto-rig for humanoids and four-legged titans. Rig necks, wings and tails in code for the dragon and pterosaur.
  4. Bake it into a `models/*.js` file (see `tools/bake_kenney.py`).
  5. Load it with cel shading, outlines, glow and rim light.
  6. Hook its animations to the moves.
- **Roster:**
  - Mechs: Ironclad, Volt Rook, Blade Shogun.
  - Kaiju: Magmaw, Riftclaw, Tidefang, Novawing, Rift King (boss).
  - Planned new titans:
    - 3-headed dragon (Zmey Gorynych / Aži Dahāka lore, chained under Volcano Island; heads regrow unless all are cut)
    - Pterosaur Kongamato, "breaker of boats" (walks on its wing-arms, the dragon's servant)
    - Komainu lion-dog (a-un open and closed mouth stances)
    - Rune tree giant (World Tree guardian, rivalry with the dragon)
- **Dragon prompt:** original three-headed dragon kaiju. Sleek armored body on two digitigrade legs, bladed whip tail, three long serpentine necks with narrow horned heads, bat wings half-open. Storm-grey and violet scales with black stripes, silver belly plates, glowing lightning-blue eyes and throat seams. Symmetrical neutral pose, highly detailed, game-ready.
  - Negative prompt: extra legs, extra arms, fused heads, missing heads, blurry, low detail, cartoon chibi, base, ground plane, text, watermark.
- **Style line for prop prompts:** `stylized game asset, clean bold shapes, hand-painted textures, single object, no ground, no base, plain background`
- **Triangle budgets:** cars and props 2–5k, buildings 3–8k, titans 30–60k.

## Credits
Buildings and cars by Kenney (www.kenney.nl), CC0. The license files are in `models/`.

## Art direction update (Nov 9, 2026)
- **Titan Clash is going low-poly**: faceted, flat-shaded models with glowing accents (MajorasPride's references: low-poly kaiju battle art, papercraft kaiju, low-poly mechs). Mythic Forge has a 🔷 Low-poly look (FX / View) that also applies to exported .glb models, plus a 🔷 Low-poly building mode in Sculpt. Talk through with him whether toon/cel shading goes on top before changing the game's renderer.
- Decided Nov 9: the game look is **low-poly + toon shading + outlines** (Mythic Forge FX / View › 🎮 Game look shows it). Next game chat: port the toon shader + outlines into the game.
