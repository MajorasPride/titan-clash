# Mythic Forge — Build Log

Live: https://majoraspride.github.io/titan-clash/myth-forge/ · Newest first. Every change gets a line here (what was built + what still needs fixing).
Deeper technical notes for Claude are in `README.md` (same folder).

## ⚠️ To fix next (found by MajorasPride, Nov 9 2026, 4am, going through 🎓 Build together)
1. **Parts don't fit together on many body types.** Examples seen: on the Crab body the Crab carapace comes in tiny and hides under the legs; on the Four-legged beast the Beast body stands upright instead of lying along the spine. Plan: go through all 30 body types one by one (body, head, limbs, tail) and make every part line up and size right — the fit system (`fitPart`, `bodyInfo`) assumes an upright trunk (hips -> neck going up); 4-legged / flat bodies (crab, spider, insect, scorpion, quad, dragon, fish…) need their own rules.
2. **Missing parts for some body types.** Every body type should have at least one body part made for it (rule from MajorasPride: "unless it doesn't fit there"). Done for bodies (see below); still to check heads, legs, claws, tails for each type.
3. **Combine Mythic Forge with Titan Clash Studio** (Sketch Pad, Build Lab level/environment building, FX Lab, Stage) into **one shared website / app**. Asked Nov 9, plan to be talked through with him first.

## Nov 9, 2026
- **4:10am — every body type has a body made for it.** 🎓 Build together's Body step now opens on **⭐ Fits <your body type>**. New bodies (`parts/bodies-more.js`): Beast body (4 legs), Big cat / lion, Horse / centaur barrel, Bird (feathered), Fish / shark, Serpent (thick), Scorpion (plated), Gooey blob, Tank hull + treads, Walker cockpit hull. In "Mix" mode mech categories are marked 🤖.
- **3:30am — sculpting.** 16 new sculpt tools (Clay, Clay strips, Layer, Draw sharp, Elastic grab, Snake hook, Twist, Thumb, Scrape, Panel lines, ✂ Trim, 📏 Line flatten, 🛡 Mask, Stamps, brush edges + pen pressure, 🧽 Even out, ➖ Invert). 🗿 **Sculpt together** lessons (Horn, Claw, Muscle arm, Monster head, Mech armor plate) with 👀 **Show me**. 18 dense clay shapes to sculpt from. ⤢ = real full screen.
- **3:10am — new layout live.** 4 main tabs (Start / Build / Paint / Sculpt + ⚙), drag parts from the list onto the model, drag is the default, ✋ Free placement (even floating), arrow directions can be hidden, 🛠 Workshop up front, 📄 Copy / 📋 Paste, 🎓 **Build together** for every body type, quick bones / numbers buttons, cleaner Start tab, 9 **mech necks**. Old layout archived (`archive/page-v1-old-layout.html`).
- Earlier Nov 9: base body + fit system, body shape sliders, tails + wings, skins (cosmic, fur, candy, toys, glitter, chameleon, pearl, metal, gems, neon, weather, alien armor, bark from Lynocs CC0…), paint tools (skin brush, blend, blotch, burn, drip, glitter fall, fade away), mech faces, treefolk / spirits / kraken / moth / centipede, cloth + capes, low-poly versions of every part, game look (low-poly + toon + outlines). Hero tab built and removed (archived).

## Nov 8, 2026
- Myth Forge grew out of the Titan Clash parts editor; renamed **Mythic Forge**. Starters (Hero Mech, Basalt Kaiju, Sailback Spinosaur, Mecha Dragon), toy mode (Break apart, Sticky, Mold), Focus window, bone numbers, calmer screen, first-time tour, craft materials, double-tap to add.
