# Titan Clash Sandbox

`titan-clash-sandbox.html` is the training ground: **one file that runs on its own** (no game folder needed). Double-click it. Pick who you play (YOU: VALOR / VOIDMAW) and the dummy (INFERNOTH / VOIDMAW / VALOR). Neon City buildings are on (turn them off in ⚙ for empty ground); no people/cars unless you turn them on; no disasters, news or timer.

**Rule:** new moves and mechanics get built and played here first. Only what MajorasPride OKs moves into the real game (`titan-clash.html`). Anything he doesn't like gets thrown out, and the game never had it.

## How it's built
- `sandbox/titan-clash-sandbox.html` = the game code (`game/`) + the test code in `sandbox/src/`, with three.js and the font packed inside. Rebuild it with `python3 sandbox/build_sandbox.py`. Keep it as its own file, separate from the game zip.
- The real game file is never changed by the sandbox build. Settings the sandbox turns off (crowds, disasters) are never saved, so the game isn't affected.
- When a test is approved: move its code from `sandbox/src/` into `game/tools/v8-src/`, run `python3 game/tools/build_v8.py`, then test the game.
- v8.3 (Nov 7, 2026): Sandbox 1 to 12 (VALOR, combat, 1/2/3, water, ultimates, fonts, ult camera, cutscene view) moved into the game. `sandbox/src/` now holds only sandbox-only code: `02-sandbox.js` (test menu, fills in `sbBase`), `03-voidmaw.js`, `05-fullscreen.js`, `07-speed.js`.

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
