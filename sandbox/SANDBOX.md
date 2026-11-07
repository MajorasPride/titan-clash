# Titan Clash Sandbox

`titan-clash-sandbox.html` is the training ground: **one file that runs on its own** (no game folder needed). Double-click it. Pick who you play (YOU: VALOR / VOIDMAW) and the dummy (INFERNOTH / VOIDMAW / VALOR). Neon City buildings are on (turn them off in ⚙ for empty ground); no people/cars unless you turn them on; no disasters, news or timer.

**Rule:** new moves and mechanics get built and played here first. Only what MajorasPride OKs moves into the real game (`titan-clash.html`). Anything he doesn't like gets thrown out, and the game never had it.

## How it's built
- `sandbox/titan-clash-sandbox.html` = the game code (`game/`) + the test code in `sandbox/src/`, with three.js and the font packed inside. Rebuild it with `python3 sandbox/build_sandbox.py`. Keep it as its own file, separate from the game zip.
- The real game file is never changed by the sandbox build. Settings the sandbox turns off (crowds, disasters) are never saved, so the game isn't affected.
- When a test is approved: move its code from `sandbox/src/` into `game/tools/v8-src/`, run `python3 game/tools/build_v8.py`, then test the game.

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
- **VALOR, Rifle:** Light = Rifle Burst. Medium = Rifle-Butt Smash. Heavy = Charged Shot (breaks through the guard). Special = Grenade Lob.
- **VALOR skills:** 1 Charging Star (shoulder charge, can't be stunned, 6s). 2 Rally Wall (blocks the front and counter-slashes, 10s). 3 Dawn Cannon (beam, 14s).
- INFERNOTH (FIGHT BACK mode) uses temporary 1/2/3 skills: Dorsal Pulse, Magma Tail, Heat Beam.
- Not done yet: game controllers can't use 1/2/3 yet; ultimates and their cutscenes are still the old ones.
