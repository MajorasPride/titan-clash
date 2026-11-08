# Titan Clash Sandbox

`titan-clash-sandbox.html` is the training ground: **one file that runs on its own** (no game folder needed). Double-click it. It starts as INFERNOTH vs a VALOR dummy; switch who you play (VALOR / VOIDMAW / INFERNOTH) and the dummy in the ⚙ menu, plus each one's loadout (Sandbox 14). Neon City buildings are on (turn them off in ⚙ for empty ground); no people/cars unless you turn them on; no disasters, news or timer.

**Rule:** new moves and mechanics get built and played here first. Only what MajorasPride OKs moves into the real game (`titan-clash.html`). Anything he doesn't like gets thrown out, and the game never had it.

## How it's built
- `sandbox/titan-clash-sandbox.html` = the game code (`game/`) + the test code in `sandbox/src/`, with three.js and the font packed inside. Rebuild it with `python3 sandbox/build_sandbox.py`. Keep it as its own file, separate from the game zip.
- The real game file is never changed by the sandbox build. Settings the sandbox turns off (crowds, disasters) are never saved, so the game isn't affected.
- When a test is approved: move its code from `sandbox/src/` into `game/tools/v8-src/`, run `python3 game/tools/build_v8.py`, then test the game.
- v8.3 (Nov 7, 2026): Sandbox 1 to 12 (VALOR, combat, 1/2/3, water, ultimates, fonts, ult camera, cutscene view) moved into the game. `sandbox/src/` now holds only sandbox-only code: `02-sandbox.js` (test menu, fills in `sbBase`), `03-voidmaw.js`, `05-fullscreen.js`, `07-speed.js`, `08` to `10` (INFERNOTH rework), `11-version.js` (SB_BUILD), `12-loadout.js` and `13-element-looks.js` (Sandbox 14). v8.4: 08 to 10, 12, 13 and 15 moved into the game (`game/tools/v8-src/32-37`); `sandbox/src/` keeps 02, 03, 05, 07, 11, `12-sandbox-loadout.js`, `14-meters.js` and `16-ashvin-sandbox.js`.

## The settings menu (cleaned up Nov 6, 2026)
On screen during the fight: only the **⚙ SANDBOX** button (top left) and a small damage counter (top right). Tap ⚙ (PC: Tab) to open the settings menu; the fight pauses while it's open.
- **Titans:** YOU and DUMMY, tap to switch who you play and who the dummy is.
- **The dummy:** STAND / BLOCK / FIGHT BACK.
- **Test tools:** SLOW-MO (30% speed), ∞ ENERGY, ∞ HEALTH (refills when it drops low), DAMAGE NUMBERS on/off.
- **Moves:** the move list for whoever you play, with live cooldowns.
- **↺ RESET FIGHT** (both titans back to the start, cooldowns cleared) and **✕ CLOSE** (or tap outside the box).
- Damage counter: combo damage, number of hits and the last move, plus floating damage numbers.

## Feedback (every test)
Feedback is the most important part. After every sandbox test, Claude asks the feedback questions from the Game Plan ("Feedback questions": the core set plus the set for what was built) and logs the answers here before anything moves into the game.

## Sandbox log (newest first)
### Sandbox 17b (Nov 8, 2026): small camera button
- MajorasPride: the camera angles are great, the button was massive on phone. Now a small round 🎥 icon right next to FULLSCREEN (no name on it); the view's name still shows for 1 second when you tap it.

### Sandbox 17 (Nov 8, 2026): fluid motion, MAGMA SURGE, camera views, roomier city, lock-on flash
Status: **testing**. Feedback: waiting. Code: `sandbox/src/17-motion.js`, `18-lock-flash.js`, `19-magma-surge.js`, `20-cam-views.js`, `21-flow.js`. Sandbox only (except the two game changes in v8.4.7 below).
- **Fluid motion (Soul Calibur style)** for every titan: joints are springs (hips and legs lead, arms and head follow a beat behind and settle), every move is retimed into wind-up, snap, impact hold and ease-out (the hit still lands at the same moment), a living fighting stance (bent knees, breathing, weight shift), walk sway and lean into turns, tails drag behind turns, and real body hit reactions. ⚙ → MOTION: NEW / OLD to compare. Cutscenes keep their own poses.
- **Less hit-pause pile-up:** the balance test found the game frozen in hit-pause 12% to 55% of busy fights. Each pause is shorter now, and pauses close together shrink.
- **No auto Combo Breaker** (MajorasPride). The other anti-stun-lock rules stay.
- **MAGMA SURGE** replaces INFERNOTH's Magma Wall (MELTDOWN medium): a rolling lava wave that knocks them down, eats small shots (Hot Blood: each one fills rage) and leaves burning ground.
- **🎥 CAM button** (PC: C): flips views mid-fight: TITAN CAM → ACTION CAM (over the right shoulder, crosshair, your titan strafes and faces where you aim) → OVER THE SHOULDER → FREE BEHIND → FIXED → NEWS CAM.
- **Lock-on:** the red diamond and LOCK-ON tag show for 1 second, then fade; the lock stays on.
- **Roomier Neon City:** checkerboard layout, about 84 buildings instead of about 194 (about 36 instead of 84 near the fight).
- Game v8.4.7 (also here): RAIKOU and RAGNAVOX hidden until their reworks (code kept, `TITAN_HIDDEN` in `38-titan-status.js`).

### Sandbox 16b (Nov 7, 2026): rebuilt with v8.4.6 (RAGNAVOX marked NEXT UP on the select screen)

### Sandbox 16 (Nov 7, 2026): the twins moved into the game (v8.4.5)
- ASHVIN's kit and look moved to `game/tools/v8-src/42-43`, and the combo feel fix (`41-combo-feel.js`) is in the game too. They're still here (the sandbox is built from the game). `sandbox/src/16-ashvin-sandbox.js` keeps only the sandbox parts.
- Combo feel: tiny hit-pause and a visible flinch on every hit (no extra stun); whiffed lights cancel sooner; tag cut-ins count as landed so the combo keeps going; Sun's cut-in pops them up close instead of blasting them away.

### Sandbox 15g (Nov 7, 2026): the sun in the style of his reference
- **Feedback:** MajorasPride: "That's perfect." (sun symbol approved)
- MajorasPride didn't like the crowned cartoon face; picked "match your picture's style". Our own drawing in that mood: black wavy flame rays on a glowing cream-gold sunburst with fine radial lines, a dark ring with a white triangle border, and a dark bearded face drawn in pale strokes with glowing white eyes and a white star for the third eye, plus speckle grit. The rays still draw in with the air strikes; the ring and face appear at the end.

### Sandbox 15f (Nov 7, 2026): a godly sun
- MajorasPride: "more godly". Divine, not monstrous: a stern face with glowing white eyes, a shining star for the third eye, a jeweled crown, ruby earrings, a long curled beard and mustache, a firm closed mouth, golden-white light and thin light beams between the flames.

### Sandbox 15e (Nov 7, 2026): an angry sun god
- MajorasPride: the sun face looked too happy, make it god anger. Now a wrathful sun god: furrowed brows, glowing white eyes, an open third eye, a stern mouth with clenched teeth, a sweeping mustache and a beard of flames; darker red-orange colors (Lightning pair: gold and violet).

### Sandbox 15d (Nov 7, 2026): sun symbol polish
- The sun's flame rays are smooth, tapering flames (they looked zigzag), the symbol sits higher so its face shows above the rival, and the glow behind it is softer (it read as a brown disc).

### Sandbox 15c (Nov 7, 2026): the twins' look
Code: `sandbox/src/17-ashvin-look.js`.
- **Swings:** painted staff ribbons from both ends of the bow-staff, in the fighting twin's element, with VALOR's ink outline (FIRE gold to red, ICE white to icy blue, LIGHTNING yellow with a flickering violet edge, WATER VALOR's blue). Hits, spins, slams, waves, spikes, tag cut-ins and the Flame Dash use the same painted splashes and curls (new ICE textures with frost sparkles).
- **SOLAR MANDALA:** the rune is now a sun (MajorasPride's reference: a sun with flame rays and a face; ours is our own drawing): wavy flame rays that appear with each air strike, then a ring with a triangle border and a face (15g: black flame rays and a dark god face, in the style of his reference).
- **TOTAL ECLIPSE:** the camera pulls way back, and a black moon with a glowing blue corona hangs in the sky.
- Light and spin reach fixed (they missed at normal range).

### Sandbox 15b (Nov 7, 2026): twin ultimate colors
- Ice is a real icy blue now (it read as white). Runes, beams and the ice pillar keep their colors instead of washing out to white. Sun's aura in TOTAL ECLIPSE is a smaller glow (it was a big tan ball), the combined beam is wider, and the crash dust is smaller.

### Sandbox 15 (Nov 7, 2026): ASHVIN, the twins
Status: **testing**. Code: `sandbox/src/16-ashvin-twins.js`. Sandbox only. Plan: Game Plan > Ideas Inbox > ASHVIN rework (voice call, Nov 7).
- Pick ASHVIN in ⚙ → TITANS (YOU or DUMMY). Two stances, one twin each: **SUN** (he: fast, fiery, buffs himself) and **MOON** (she: slower, harder hits, waves and curses). One bow-staff, held in the middle; Sun holds it in his right hand, Moon in her left. STANCE swaps twins faster and cheaper than other titans.
- **Element pairs** (⚙ LOADOUT → ELEMENT): DEFAULT / FIRE + ICE / LIGHTNING + WATER. Same moves, the element changes. Ice (new, ASHVIN only) slows. Water soaks, and a soaked rival takes +25% from Sun's lightning.
- **Tag-swap strings:** L L H or M H ends with the other twin cutting in. Moon cuts in with a staff spin + cold wave that shoves them back; Sun cuts in with a Dragon Ball style fire burst.
- **SUN:** L L L staff combo · M spinning staff · H flame slam · SPECIAL sun rune (armed after a moment, big flame blast when stepped on) · 1 Blaze Up (faster attacks 6s) · 2 Flame Dash (fire trail) · 3 Solar Flare (blinds them and knocks off their lock-on) · GRAB pole-vault over them, then a fire blast.
- **MOON:** L L L heavy staff · M frost wave · H ice spike under them · SPECIAL curse rune (slow + damage over time) · 1 Hex (+25% damage taken, 5s) · 2 Frost Prison (rooted 1.6s) · 3 Drain (steals energy 5s) · GRAB head tap, ice birdcage, wave blast.
- **SOLAR MANDALA** (Sun ultimate, rush in): launches them sky-high, 8 air strikes draw a giant sun rune behind them, slams them down, then both twins fire one combined beam that blasts them across the city. "THE SUN NEVER SETS ON US!" / "TWO HALVES, ONE SKY!"
- **TOTAL ECLIPSE** (Moon ultimate, aimed): the world goes pitch black and only her moon rune glows; an ice pillar launches them, Sun leaps up glowing like the sun and spikes them down (leaves the curse). "NIGHT FALLS... FOR YOU." / "SLEEP UNDER OUR ECLIPSE."
- Damage numbers: orange while Sun is fighting, icy blue for Moon.
- Numbers are first guesses (to tune from feedback). ASHVIN's old ability tree still shows on the select page; his paths come with the loadout pass.

### Sandbox 14g (Nov 7, 2026): rebuilt with the game's v8.4.4
- Phone: the armor/rage and KO meters are one-line rows on the left under the health bars; nothing covers the joystick or buttons.

### Sandbox 14f (Nov 7, 2026): rebuilt with the game's v8.4.3
- Titan Core fires the real ultimate; phone HUD fixes (KO bar, rival armor/rage bars). The KO bar CSS moved from `14-meters.js` into the game.

### Sandbox 14e (Nov 7, 2026): rebuilt with the game's v8.4.2
- VALOR's and INFERNOTH's moves break buildings again (they never hit buildings since the new kits). Comes from the game fix, `game/tools/v8-src/39-building-hits.js`.

### Sandbox 14d (Nov 7, 2026): rebuilt with the game's v8.4.1
- Same sandbox, rebuilt from v8.4.1 (the select screen's who's-next tags and the VOIDMAW coming-soon card). VOIDMAW is still playable here from ⚙ → TITANS.

### Sandbox 14c (Nov 7, 2026): VALOR's and INFERNOTH's work moved into the game (v8.4)
- The INFERNOTH rework (Sandbox 13 to 13g) and the loadout rework (Sandbox 14, 14b) are in the real game now. They're still in the sandbox too (it's built from the game), so VALOR and INFERNOTH stay as test titans and dummies.
- `sandbox/src/` keeps only sandbox things: the ⚙ menu, VOIDMAW, fullscreen, speed, the build tag, the ⚙ LOADOUT picks (`12-sandbox-loadout.js`) and METERS (`14-meters.js`).

### Sandbox 14b (Nov 7, 2026): bug fixes, METERS tool, loadout page follows the element
Status: **testing**. Code: `sandbox/src/14-meters.js`, `sandbox/src/15-loadout-page.js` (+ two game fixes, v8.3.1).
- **Fixed (also in the game, v8.3.1):** the heavy button stayed "KO!" after switching away from VALOR; buildings smashed while a cutscene hid them came back as ghosts.
- **⚙ → METERS:** NORMAL / ALWAYS FULL / OFF for INFERNOTH's rage and VALOR's KO Punch meter (you and the dummy). ALWAYS FULL rage means no stance switching (rage rule). SUPERS READY no longer fills VALOR's KO meter (that's why his bar always looked full; VALOR has no rage, that bar is his KO meter).
- Phone: VALOR's KO bar sits where INFERNOTH's armor/rage bars go, on one line (it covered the path card).
- **Rage check:** it works, but only fills from damage taken (about 22% of his health in BRAWLER, 15% in MELTDOWN), so it never fills against a STAND dummy.
- **Titan file page (ABILITIES & LOADOUT):** the path upgrades are worded for the picked element (names stay the same); the ELEMENT line says what it does, what it beats and how this titan looks in it; the FOCUS line lists the move swaps instead of the old +15%.
- Still to fix (found, not done): that page lists old ultimate names (LAST STAND: SHIELD OF DAWN, CORE MELTDOWN) and VALOR's heavy as "Heavy".

### Sandbox 14 (Nov 7, 2026): loadout rework for VALOR and INFERNOTH
Status: **testing**. Code: `sandbox/src/12-loadout.js`, `sandbox/src/13-element-looks.js`. Sandbox only. Plan: Game Plan > Ideas Inbox > Loadout rethink.
- **⚙ menu → LOADOUT:** PATH, FOCUS and ELEMENT for you and the dummy. Every pick starts on **DEFAULT** (the titan's normal setup), so players don't see which one was the original. Changing a pick restarts the fight. New test tool: **ALL UPGRADES** (all 3 at once).
- **Paths:** VALOR = SENTINEL / COMMANDER, INFERNOTH = MAGMA HEART / NUCLEAR BREATH. Every upgrade works in both stances, on a different move in each (full list in the Game Plan). The 1st upgrade is there from the start; the 2nd and 3rd unlock from goals (VALOR: blocks/slips, big hit on the shield, combos, people saved; INFERNOTH: armor shrugs, rages, big hits taken, buildings destroyed, burn time). From round 2 on everyone has all 3. Card top right (phone: one line at the bottom) shows the path, the upgrades and the next goal.
- **Focus = move swaps:** HYBRID = the kit as it is. VALOR MELEE: Shield Rush (Sword & Shield special), Tidebreaker (3). VALOR RANGED: Water Cannon Punch (Brawler special), Tide Lance (1). INFERNOTH MELEE: Searing Jaws (MELTDOWN special), Lava Charge (MELTDOWN 1). INFERNOTH RANGED: Fault Line (BRAWLER special), Boulder Toss (BRAWLER 1).
- **Elements:** Fire = 3 heat then a 3s burn (never a stun). Water = 2s slow, heals only standing in a river. Lightning = every 5th hit in a row shocks and zaps the nearest building. Matchups: Water burns for half as long and clears the Fire titan's heat; a burning Lightning titan loses its shock count; Lightning shocks Water every 4th hit.
- **Element looks (full swap):** VALOR in Fire = painted flame curls, ember bursts, fire rings, flame ribbon; Lightning = painted bolts, spark stars, jagged purple-edged ribbon. INFERNOTH in Water = blue to cyan rage glow, water splashes and rings instead of lava; Lightning = purple to white glow, plasma, zaps, lightning strikes in LAVA DOMAIN. Ultimate names stay the same.
- **Fixes:** Fury maxes out at +10% (was +30%). The CPU always gets a real element. Water no longer heals in rain.
- Not in the game's select screen yet; that comes when it moves into the game (with the DEFAULT option there too).
### Sandbox 13g (Nov 7, 2026): LAVA DOMAIN as one continuous beam, longer cutscenes
- LAVA DOMAIN: one continuous high-heat beam from his mouth (white-hot core, blue-white plasma glow, hotter than his orange special beam). It pins them and pushes them back, slowly tilts up carrying them, flings them off the top, and keeps going into the sky. Then 15s of lava rain.
- INFERNOTH's cutscenes are longer (slower slow-motion, more time for the beam pin and rise and for GROUND ZERO's build-up).

### Sandbox 13f (Nov 7, 2026): KING without buildings, cleanup, build tag
- KING: the tail WHACK now sends them flying in an arc across the city and they crash down (no flying through buildings, since smashed buildings still showed).
- The old climb-slam KING he saw was a cached old copy (GitHub Pages takes a few minutes, and browsers keep old copies). The sandbox now shows its build (e.g. "SANDBOX 13f") in the bottom-right corner and the ⚙ menu.
- Cleanup: the never-used old VALOR ultimate versions and the WORLDROOT leftovers came out of the code into game/archive/ (titan-clash-old-valor-ults-archive.js, titan-clash-worldroot-archive.js). No change to how anything plays.

### Sandbox 13d (Nov 7, 2026): new KING ultimate
Status: **testing**. Code: `sandbox/src/09-infernoth-meltdown-ults.js`. Sandbox only.
- MajorasPride didn't like the skyscraper climb ("looks funny"). New KING: charge, jaw grab and shake, toss them straight up super high, a batter's wind-up while they fall (back turned, tail cocked), then a tail WHACK that sends them tumbling through three buildings (it picks the direction with the most buildings). "THIS IS MY LAND." / "BOW TO YOUR KING."

### Sandbox 13c (Nov 7, 2026): lava that looks like lava, no more "same pose"
Status: **testing**. Code: `sandbox/src/09-infernoth-meltdown-ults.js`, `sandbox/src/10-poses-all.js`. Sandbox only.
- **Lava:** falling lava is now molten rocks that drop from the sky onto a glowing shadow, splash, and leave a pool that cools from orange to dark red (no more glowing beams). Eruption, burrow and volcano leap are lava fountains. Spit drips.
- **LAVA DOMAIN:** the beam comes out of his mouth; lava rain lasts about 15 seconds, then the sky clears.
- **GROUND ZERO:** the cracked screen only lasts the round it happened (the orange sky stays for the match).
- **Poses:** INFERNOTH has a pose for every step of all three ultimates. Every other titan's ultimate and the old arms-up specials (ASHVIN's psychic moves, RAGNAVOX's roar, dorsal pulse) now have their own motion.

### Sandbox 13b (Nov 7, 2026): INFERNOTH MELTDOWN kit + all three ultimates
Status: **testing**. Feedback: waiting. Code: `sandbox/src/09-infernoth-meltdown-ults.js` (+ the BRAWLER heavy fix in 08). Sandbox only.
- **Fix:** BRAWLER's heavy (jaw grab) slid forward fast while you held it to charge. Now he only lunges after you let go. Its damage is a little lower (it beats blocks).
- **MELTDOWN:** L L L lava spit (3rd one burns) · M magma wall (blocks shots, burns on touch, one at a time) · H eruption (geyser under the rival; hold = farther) · Special heat beam that leaves burning ground · GRAB shove-off · 1 Meteor Spit · 2 Obsidian Shell (half damage 4s, small shots bounce back) · 3 Volcano Core (lava bombs all around for ~3s).
- **KING** (BRAWLER ultimate): charge, grab, climb the tallest building nearby, pile-drive off the top. "THIS IS MY LAND." / "BOW TO YOUR KING."
- **LAVA DOMAIN** (MELTDOWN ultimate): aimed beam blasts them away, then into the sky: lava rains for the rest of the round (glowing shadows first; half damage to fire titans, none to INFERNOTH), red-orange sky. "KNEEL." / "I AM KING OF ALL."
- **GROUND ZERO** (secret: ultimate ready + in rage): grab, detonate. Levels the area, 75% of the rival's max health, INFERNOTH drops to 1 HP. "YOU CANNOT HIDE." / "FATE WILL DECIDE NOW!" cracking into a roar. Cracked screen + orange-red sky for the rest of the match; round 2 or 3 = fireball rain that hurts him too. A miss uses it up.
- Tip: turn off ∞ HEALTH in ⚙ to see GROUND ZERO leave him at 1 HP.

### Sandbox 13 (Nov 7, 2026): INFERNOTH rework part 1 (armor, rage, BRAWLER kit)
Status: **testing**. Feedback: waiting. Code: `sandbox/src/08-infernoth-brawler.js`. Sandbox only, not in the game. The sandbox now starts as INFERNOTH vs a VALOR dummy (switch in ⚙).
- **Armor:** light hits and small shots never stun him. **Armor bar** (left/right under the HUD): each shrugged-off light hit drains it; 8 hits = ARMOR BROKEN for 3s (he flinches like everyone). Refills after 2s without hits.
- **Rage:** fills as he takes damage (BRAWLER slower, 6s rage; MELTDOWN faster, 4s). Full = nothing staggers him. No stance switching in rage. **Rage glow:** plates light up from the tail tip to his head; white-hot in rage.
- **BRAWLER:** L L L claw, claw, bite · M tail whip (knocks down) · H jaw grab-and-toss (beats block, slow lunge, a miss leaves him open; hold to charge = longer shake, farther throw) · Special seismic stomp · GRAB (F / phone GRAB): building smash if a building is close, otherwise tail throw · 1 Pounce · 2 Burrow (lava spout at the exit for 1s) · 3 Volcano Leap.
- Every stance has its own 1/2/3 now (MELTDOWN keeps its old set until Sandbox 14).
- Balance tweaks: BRAWLER power 1.15 -> 1.1, long recovery on missed grabs. Numbers to tune from feedback.

### Sandbox 12 (Nov 6, 2026): both ultimates redone (Shield Barrage + flash-step Tidecrest Oath)
Status: **testing**. Feedback: waiting. Code: `sandbox/src/15-shield-barrage.js`, `sandbox/src/16-sword-flash.js`. Sandbox only, not in the game.
- **Brawler: SHIELD BARRAGE** (MajorasPride: "forget the ground thing", 4 throws that bounce back, dynamic, cinematic). Aimed throw (a miss = no cutscene), then SPIN TOSS, JUMP SPIN TOSS, a throw off the CHIN (slow-mo, head snaps back), catch, charge behind the giant water shield (kept, his pick), ULTIMATE SHIELD BASH (freeze), and the monster flies off in a straight line like a beam with a water trail and crashes far away. New camera angle every throw. The Sandbox 10 tackle / pin / slam code is still in 11-valor-cine.js but no longer used.
- **Sword: TIDECREST OATH** (MajorasPride: lunging, super fast cuts; a BlazBlue-style super; finish with an Akuma pose and a dragon in the sky). Draw stance, then an aimed LUNGE (a miss = no cutscene). On a hit: the world goes dark like a fighting-game super, 6 flash-step cuts through the monster from every side, each pass leaving fading blue afterimage clones. He lands far side, back to the camera in an Akuma-style stand, while a giant painted water dragon (our own design) draws itself coiling up through the clouds behind the monster. On the sheathe click, every cut opens and one giant cut splits the monster and the sky, and the dragon bursts into water.
- Ultimate lines unchanged. Brawler ultimate renamed SHIELD BARRAGE (was SHIELD PIN).
- **Sword v3, Hibiki's Astral (BlazBlue: Central Fiction) as the reference** (his call, our style on top): the lunge lands, black smoke swallows the monster, VALOR and a **water clone of VALOR** dash through it from opposite sides at once (an X every pass), the last pass is the crossing slash, and the screen cuts to black for a beat. Then the Akuma stand, the dragon and the sky cut.
- **Final city shot** (his reference: a dragon in a figure-8 coil over a night city in a lightning storm): after the sky cut, a wide shot over Neon City, VALOR in front with his back turned (Akuma stand), the water dragon (our own design, not the reference's dragon) coiled in a figure-8 over the skyline with lightning cracking around it.
- **Brawler v2:** VALOR runs at the monster while he throws (closing the gap every throw), catches on the run, lunging throws like Cap's MvC shield throw. Some shots from a flat side-on fighting-game angle. More shots on VALOR (the catch, behind him for the chin throw, a longer hero shot at the end) because he said "show VALOR more".
- **Sword update (Nov 6, late):** shield ultimate approved as is ("perfect"). Sword: buildings hidden for the whole cutscene; the sky dragon, lightning and final city shot are archived in `sandbox/archive/sword-sky-dragon-archive.js` (they didn't show on screen); the stand is now VALOR turning to face the camera with his sword raised, the monster behind him.
- **Buildings in cutscenes (Nov 7):** instead of hiding the whole city, only the buildings standing between the camera and the two titans are hidden, frame by frame, during both ultimate cutscenes (`sandbox/src/18-cine-view.js`).
- **Ultimate camera** (`sandbox/src/17-ult-camera.js`): when an ultimate lands, 1 in 3 times the whole cutscene plays from a flat side-on fighting-game camera; the rest are cinematic. The sword's Akuma stand + final dragon shot always stay cinematic. ⚙ menu: ULT CAMERA: RANDOM / CINEMATIC / FIGHTING GAME.
### Sandbox 11 (Nov 6, 2026): ultimate body poses (no more stiff "T-pose")
Status: **testing**. Feedback: waiting. Code: `sandbox/src/14-ult-poses.js`. Sandbox only, not in the game.
- Why: MajorasPride: "Why is the model just staying there when doing the ultimate?" The ultimate used one fixed pose (arms up) the whole time while the code slid VALOR around.
- **Tidecrest Oath (sword):** plants his feet and raises the sword while the water gathers, thrusts forward to launch the dragon, holds his guard while it coils, winds back and does one huge draw-cut, turns away and sheathes on the click, then stands tall.
- **Shield Pin (brawler):** wind-up and shield throw, reaches out and catches the ricochet, sprints behind the water shield (running legs), low tackle, down on one knee with alternating shield bash / right punch, stands with the shield raised in both hands, then slams it down.
- Misses get their own stumble pose. Other titans keep the old ultimate pose until they get their own.
### Sandbox 10 (Nov 6, 2026): the two ultimates rebuilt to play completely differently
Status: **testing**. Feedback: waiting. Code: end of `sandbox/src/11-valor-cine.js`.
- Why: MajorasPride said both ultimates were "literally the same" (both rushed in and punched).
- **Sword: TIDECREST OATH = long range.** He plants his feet, water gathers into the raised sword, and he launches a giant painted water dragon straight ahead (aimed, steers a little). Dragon hits = cutscene ("LET THEM COME."): the dragon coils and squeezes, VALOR (still far away) does one draw-cut that paints a slash line across the gap, turns his back, sheathes with a *click*, and the dragon bursts. Dragon misses = it crashes far away, no cutscene.
- **Brawler: SHIELD PIN = up close** (inspired by Captain America pinning Iron Man in Civil War, our own moves). He throws the shield (aimed). Shield hits = cutscene ("THIS CITY HAS A SHIELD!"): the rival staggers, VALOR leaps after the shield and catches it mid-air, tackles the rival flat, pins them with 4 shield bashes, raises the shield (top-down freeze) and slams it down. Shield misses = it flies off and comes back, no cutscene.
- **Shield Pin v3 (Civil War style, MajorasPride's notes):** the cutscene opens on the shield smacking the monster (slow-mo close-up), the shield ricochets straight back and VALOR catches it, he charges behind a **giant painted water shield** (spinning rings, foam rim, a wave curl in the middle, no American star) that bursts into a wall of water as he takes the monster's legs out and it DROPS flat, then 4 pinned shield bashes, raise (top-down freeze) and SLAM. Water trails, wakes, ripples and splash columns all the way through.
- No stars anywhere: the Brawler announcement card uses a spinning water whirl, and the KO Star Punch is now just the KO Punch.
- Intro lines on the announcement card stay: "IF I DON'T... WHO WILL!" (Sword) and "FEAR NOT! I'M HERE NOW!" (Brawler).

### Sandbox 9 (Nov 6, 2026): real ultimate cutscenes + new fonts + more kinds of water
Status: **testing**. Feedback: waiting. Code: `sandbox/src/11-valor-cine.js`, `12-fonts.js`, `13-water-more.js`, fonts in `sandbox/fonts/` (license files next to them).
- **Ultimate flow:** PRESS = a short announcement card (his name + the ultimate's name, no quote, no voice). LANDS = a directed cutscene of the ability: HUD hidden, black bars, camera shots, freeze frames, the quote as big text. MISS = no cutscene. Voice is off (text only).
- **Lines:** Sword says "IF I DON'T... WHO WILL!" on the announcement card and "LET THEM COME." when it lands. Brawler says "FEAR NOT! I'M HERE NOW!" on the announcement and "THIS CITY HAS A SHIELD!" when it lands. Rule for every ultimate: an intro line on press + a quote only if it lands. Each stance has its own announcement card (Sword: painted waves on deep blue with a whirlpool; Brawler: comic halftone with a gold starburst). The Sword ultimate now lunges in, so it lands from normal fighting distance.
- **TIDECREST OATH shots:** quote close-up → orbit through the flash cuts → low shot of the water dragon → freeze + white flash on the rising cut → "already cut" shot: VALOR faces the camera and sheathes while the wave crashes behind him.
- **STAR RUSH shots** (renamed from All Day Star Rush): quote close-up → every punch is a new camera angle with a comic word and halftone dots → freeze on the KO uppercut → camera follows them up the geyser. Brawler line: "THIS CITY HAS A SHIELD!" (MajorasPride's pick).
- The cutscene camera never ends up inside a building.
- **Fonts:** Press Start 2P (timer, combo counter, damage counter and numbers, KO meter), Rubik Dirt (big banners like FIGHT! and K.O., ultimate names, cutscene titles, comic words), Permanent Marker (the quote). Packed into the sandbox file by `build_sandbox.py`.
- **More water:** whirlpools, droplet sprays, foam bursts, breaking wave crests and ground ripples, mixed randomly on every hit.

### Sandbox 8 (Nov 6, 2026): two ultimates for VALOR, one per stance
Status: **testing**. Feedback: waiting. Code: `sandbox/src/10-valor-ults.js`.
- **Sword & Shield: TIDECREST OATH.** Line: "IF I DON'T... WHO WILL!" (MajorasPride's pick, a Goku-style hero line). Knight's salute, 6 flash cuts through the rival (each leaves painted water), a water dragon coils around them, one huge rising cut, then he turns his back, sheathes with a *click* and the wave crashes down. Demon Slayer feel, our own moves.
- **Brawler: ALL DAY STAR RUSH.** Line: "I CAN DO THIS ALL DAY!" Star-rush charge; on contact a comic-panel beatdown (POW! BAM!), then a KO uppercut up a giant water geyser. A miss = short recovery.
- **Announce first, cutscene only on a hit** (MajorasPride's rule for every ultimate): pressing it shouts the ultimate's name right away with no freeze; the freeze-frame cutscene with the quote plays only when the attack lands (Sword: rival within dash range; Brawler: the charge connects). A miss = no cutscene, short recovery. VALOR only so far; the other titans get it when their ultimates are redone.
- Ultimates can't be cut short by the Combo Breaker or Break Free. Fire them any time with SUPERS READY.

### Sandbox 7 (Nov 6, 2026): painted water for VALOR (Okami ink + Demon Slayer flow)
Status: **testing**. Feedback: waiting. Code: `sandbox/src/09-water-fx.js`.
- MajorasPride picked "both": flowing water ribbons with black ink outlines, Japanese woodblock wave style. Water stays VALOR's element (no light magic).
- Sword swings leave a painted water ribbon (deep blue, white foam edge, ink outline). Hits throw ink-outlined wave curls and splashes.
- Tide Hook = arc of curling waves. Leg Sweep, Shield Dive, Spin Slash, Overhead Cleave, Sword Plunge = painted wave ring on the ground. Geyser Uppercut and Rising Slash = rising column of curls (the plain white geyser pillar is gone). Shield Throw, Follow Dash and Charging Star leave water trails. KO Star Punch = big wave burst.
- Only VALOR for now. If it's a keeper, every element gets its own painted look.

### Sandbox 6 (Nov 6, 2026): Brawler = boxer (Little Mac style) + Leg Sweep + SUPERS READY
Status: **testing**. Feedback: waiting. Code: `sandbox/src/08-valor-boxer.js`.
- MajorasPride said yes to: a leg sweep, Little Mac style boxing, and both together.
- Faster, snappier jabs. **Leg Sweep** (L L M or M M): low spinning kick that trips the rival.
- **Weave:** tap BLOCK in Brawler = duck/slip, can't be hit for a moment. Keep holding = normal block (shield in hand only).
- **KO meter** (bar under VALOR's health): fills when you land hits (+12) or slip a hit (+20), drops when you get hit (-25). Full = next HEAVY is the **KO Star Punch** (huge hit, smashes a block). Phone HEAVY button says KO! when it's ready.
- **Weak in the air:** Brawler jumps lower and has no air jabs (Shield Dive still works).
- **SUPERS READY** (⚙ test tools, on by default), like MvC2 training mode: the ultimate works at any health, any time, and the KO meter stays full. The ultimate is still the old one (Last Stand: Shield of Dawn) until the cutscene work.

### Sandbox 5 (Nov 6, 2026): TITAN SPEED test
Status: **testing**. Feedback: waiting. Code: `sandbox/src/07-speed.js`.
- ⚙ menu → TITAN SPEED: 100% (now) · 115% · 130%. Speeds up both titans' movement and every attack (wind-up, swing, recovery). Cooldowns, energy and damage stay the same. To help decide if the titans should be faster.
- Decided Nov 6: 1/2/3 stay their own abilities (not combo enders).

### Sandbox 4 (Nov 6, 2026): VALOR's BRAWLER stance + air stun lock fix
Status: **testing**. Feedback: waiting. Code: `sandbox/src/06-valor-brawler.js`.
- Why: MajorasPride felt the rifle kit was "meh" and asked for a full brawler stance instead (sword away, shield kept, Captain America style, Water attacks, no beam). He also pulled off a 27+ hit air combo without trying.
- **The rifle stance is gone from the sandbox.** Its code is kept in `sandbox/archive/valor-rifle-archive.js` (not loaded). The real game still has its old GUN stance until he OKs this.
- **BRAWLER:** sword on the back, fists + shield. Light = Jab Combo (jab, cross, shield bash; a punch if the shield is out; works in the air). Medium = Tide Hook (water hook, pushes back). Heavy = Shield Throw (ricochets back, 2.5s cooldown); **HEAVY again while it flies = Follow Dash** to the rival. Special = Geyser Uppercut (launcher, JUMP to chase, 15 energy, 3s). Jump + Heavy = Shield Dive (water shockwave). Strings: L L L, L L M, L M, M, M M, air L L L.
- **Shield out = no blocking and no auto-guard** (both stances) until it comes back.
- **Stance stats:** SWORD & SHIELD = power +10%, takes 10% less damage. BRAWLER = 10% faster, power -10%, energy refills 15% faster. Swap shows a short "sheathe / draw" pose and a stats toast.
- **Stun lock fix (everyone):** air light attacks (Air Slash, air jabs) now follow the 5th-hit stun rule; max 3 light attacks per jump (land to attack in the air again); **COMBO BREAKER** after 10 hits in a row, the one getting hit breaks free (pushed out, 1s no stun).
- Note: INFERNOTH also has a stance called BRAWLER. Might want a different name for one of them.

### Sandbox 3 (Nov 6, 2026): combat feel (charge, combo strings, wall splat) + new button layout
Status: **testing**. Feedback: waiting. Code: `sandbox/src/04-combat.js`.
- **3 attack buttons:** LIGHT, MEDIUM, HEAVY are separate now (PC: J / K / L, Special moved to U). Medium no longer hides in "tap heavy".
- **Hold to charge** any of the 3: the titan freezes at the wind-up and powers up. Full at 1.2s (up to 2x damage, more knockback, MAX breaks a block). Fires by itself at 2s. Charge bar under your titan.
- **Combo strings (target combos):** the button order picks the swing. VALOR sword: L L L, L L M (Spin Slash), L L H (Cross Cut), L M, L M H, L H (Overhead Cleave, ground bounce), M M (Shield Uppercut, launcher), M H (Lunging Thrust). Air: L L L (Air Slash) then H (Sword Plunge). VALOR rifle and VOIDMAW have their own strings. Full list in the ⚙ menu.
- **Launchers:** after Rising Slash, Shield Uppercut or Overhead Cleave hits, press JUMP to chase the rival into the air.
- **Combo fling:** each hit in a string pushes a little more; finishers fling the rival a tad.
- **Wall splat:** combo a rival into a building and they get pinned + stunned, then bounce back off. Break-away is rock-paper-scissors: STRIKE beats DASH, DASH beats GRAB, GRAB beats BLOCK (wall throw), BLOCK beats STRIKE (brace off the wall). The dummy picks too (BLOCK mode = always block, FIGHT BACK = random).
- **Phone layout:** LIGHT big in the corner, MEDIUM / HEAVY / SPECIAL around it, 1 2 3 in an outer arc, BLOCK / DASH / JUMP / GRAB to the left. 1/2/3 have a cooldown sweep (spin) and flash when ready. PC gets a 1/2/3 bar at the bottom.
- **Fullscreen:** ⛶ FULLSCREEN button next to ⚙ (also in the menu). Browser fullscreen + landscape lock on phones, and the TitanVision TV frame is removed so the fight fills the screen. iPhone Safari can't go truly fullscreen; it still drops the frame.
- **Arena (⚙ menu):** BUILDINGS on/off (on by default now, so walls can be tested), PEOPLE & CARS on/off, WALL SPLAT on/off.
### Sandbox 2 (Nov 6, 2026): VOIDMAW, the dark-magic kaiju
Status: **testing**. Feedback: waiting.
- One giant eye on a body of roots and tentacles, purple rune ring, back tentacles that sway, an eye that follows the rival. Inspired by Shuma-Gorath and Biollante, our own design.
- Light = Tentacle Lash (3-hit combo, long reach). Medium = Vine Sweep (trips). Heavy = Eye Slam when standing, Root Burrow (dives underground and bursts up) when moving. Special = Eye Ring (sticks to the rival, pops after 1.2s; blocking stops it).
- 1 Vine Grab (pulls the rival in from far away). 2 Spore Cloud (turns into spores, can't be hit, reforms away). 3 Dark Rift (spinning purple spell circle that drains health and energy and slows; never stuns).
- One form for now (no stance switch). Ultimate (eye gate, black hands, blood red sky) comes with the cutscene work.
- New panel buttons: YOU (VALOR / VOIDMAW) and DUMMY (INFERNOTH / VOIDMAW / VALOR).

### Sandbox 1 (Nov 6, 2026): fight feel + VALOR's full kit
Status: **testing**. Not in the game yet. Feedback: waiting.
- Every VALOR move has its own pose (wind-up, swing, follow-through) instead of the generic punch.
- The sword hits along its real path, with a slash trail, a "shing" and slash sparks. Shield hits clang.
- **Clash:** if both titans' attacks land at the same moment, sparks fly and both get pushed back.
- **Chains:** light → medium → heavy → special or 1/2/3 cancel into each other when a hit lands.
- **1 / 2 / 3 skills** with their own cooldowns and energy cost. Keys: 1 2 3 (P2: 8 9 0). Phone: three small buttons near your right thumb.
- **VALOR, Sword & Shield:** Light = 3-hit combo (slash, backhand, shield punch). Medium = Shield Bash (drains guard). Heavy = Rising Slash launcher when standing, Lunging Thrust when moving, Sword Plunge in the air. Special = Shield Throw.
- **VALOR, Rifle** (replaced by BRAWLER in Sandbox 4, archived): Light = Rifle Burst. Medium = Rifle-Butt Smash. Heavy = Charged Shot (breaks through the guard). Special = Grenade Lob.
- **VALOR skills:** 1 Charging Star (shoulder charge, can't be stunned, 6s). 2 Rally Wall (blocks the front and counter-slashes, 10s). 3 Dawn Cannon (beam, 14s).
- INFERNOTH (FIGHT BACK mode) uses temporary 1/2/3 skills: Dorsal Pulse, Magma Tail, Heat Beam.
- Not done yet: game controllers can't use 1/2/3 yet; ultimates and their cutscenes are still the old ones.
