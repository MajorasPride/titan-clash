# Titan Clash: Think Tank Plan (Nov 5, 2026)

Status Nov 5 2026: steps 1–7 are built (first pass) in v7.1. See README-NEXT-CHAT.md → STATUS + WISHLIST for what's left. Live, editable copy of this plan:
https://claude.ai/artifact/T1B6ksLwqFMak5hnbFSjbi

## How to use this plan
1. Attach the newest game folder zip, `three.min.js` (r128) and this file.
2. Go through every change with MajorasPride before handing over a new version (short list of what and why, then wait for OK).
3. Screenshot the game to check art and UI.
4. Original titans only.
5. One section of this plan per chat. Suggest the others, don't start them.
6. MajorasPride mostly plays on **phone**; his brother plays on **PC**.

**Feel:** Dragon Ball Z: Budokai Tenkaichi 3 (big destructible arenas, smashing each other through terrain, using cover) mixed with the round-by-round disaster story. Borrow the feel, not the content.

## 1. Living battlefield
- **Damage carries over between rounds.** Today `startRound()` calls `makeCity()` and `resetDisaster()` every round; that must stop.
- **Buildings are strong, not paper thin.** Health per building (bigger = tougher). Light hits chip; heavy hits, throws, beams and charges bring them down.
- **Visible damage stages:** cracks → missing chunks → lean → collapse. Cracked stays cracked next round.
- **Wall slams:** a titan knocked into a building hits it and is staggered; the building takes damage too; enough slams bring it down on them.
- **Real cover:** hide behind a building to block shots until it breaks.
- Keep the v6 floor-by-floor destruction, rubble and crushed cars.

## 2. Disasters
Disasters belong to the map and step up once per round. Who is winning never changes the steps.

| Path | Round 1 | Round 2 | Round 3 |
|---|---|---|---|
| Normal | Light | You feel it | Extreme |
| Trigger broken in round 1 | Light + the crack | Extreme | **Ridiculous** (over the top) |
| Trigger broken in round 2+ | Light | You feel it | Extreme (no bonus) |

- **Trigger:** one thing per map the fight can break (e.g. the dam). Only breaking it in round 1 unlocks the ridiculous round 3. Hidden challenge.
- **Weather must be obvious on screen** each round: sky color, heavier rain/snow, fog, shaking.

| Map | Ridiculous round 3 |
|---|---|
| Flood Zone | Dam gone, skyscraper-tall wave hits the city |
| Volcano Island | Mountain top blows off, river turns to lava |
| Frozen Harbor | Ice shelf collapses, fight on breaking ice floes in a whiteout |
| Downtown | Power grid blows, neon goes dark, lightning everywhere |
| Desert Lab | Weather towers overload, several tornadoes plus lightning |
| The Rift | Rift tears open, ground breaks into floating chunks |

**Frozen Harbor rework:** drop the tidal waves (`hazard:'wave'`). Snow + slippery frozen river → frost patches that freeze titans ~1 s (frozen buildings/cars shatter in one hit) → whiteouts about every 25 s, 3 s warning, 4–5 s long, no lock-on, rival's glow faintly visible.

**Overlaps to fix:** hurricane and sandstorm are both wind + tornado; flood surge and avalanche are both a sweeping wall; Rift meteors never stop (make bursts with ground shadows).

## 3. People and the news crew
Real crowds rarely panic. Most carry on as normal at first (normalcy bias), stop and ask each other what's happening (milling), and many stay even when told to leave (pets, helping others).

| When | Crowd |
|---|---|
| Round 1: "this can't be real" | Most keep doing normal things; groups stare, some film; cars drive; only a few run |
| Between 1 and 2 | News: "EVACUATION ORDERED" |
| Round 2: leaving | Traffic jams out, abandoned cars, people carrying others or walking dogs; some freeze; a few board up and refuse |
| Round 3: ghost town | Streets almost empty; a few on rooftops waving; rescue boats/helicopters; silhouettes in lit windows |

**TV highlight clip between rounds (6–8 s, tap to skip):** replay of the biggest hit and biggest collapse, a shot of the disaster growing, anchor line + headline ("DAM CRACKING · EVACUATION ORDERED").

## 4. Rules for all titans
- One **signature rule** per titan plus its own moves and role. No more shared punch/kick/beam or claw/tail spin/beam.
- **Weather strengths and weaknesses** per titan (map advantage is fine).
- **Mechs save people** and resist some elements by build. **The more people the monster kills, the stronger the mech gets.**
- **Lock-on breaks (not annoying):** concussion (3 knockdowns in ~12 s or a hard head hit → "DAZED" 2.5 s), a few "dislocate" moves (e.g. Kongamato's screech), whiteouts. Max 2–3 s, cracked reticle + countdown ring, ~15 s immunity after, never during your own super/finisher, applies to CPU and Player 2 too.

## 5. Current roster rework
Today 5 of 8 base forms share the beam; Ironclad = Volt Rook robot moves; Magmaw = Riftclaw beast moves.

| Titan | Signature rule | Form 1 | Form 2 | Weather |
|---|---|---|---|---|
| Ironclad | Armor plates break off, can be bolted back | Robot grappler: bear hugs, suplexes, throws through buildings; stronger as crew is hurt; cockpit opens for a last punch | Tank fortress: shield walls protect people, artillery, turrets | Shrugs off wind/lightning; slow in floods |
| Volt Rook | Builds static charge | Robot hit-and-run, afterimages; pulls lightning onto itself and throws it back | Racer charges by drifting; drains streetlights/power lines | Loves storms and wet ground; sand weakens it |
| Blade Shogun | Honor meter: fight clean, save people | Samurai: fast/heavy/counter stances; best parry; perfect parry → cinematic slash | Jet sky ace: dogfights, dive slashes | Wind throws the jet off; whiteouts don't affect it |
| Magmaw | Stronger the hotter it runs, stalls at max | Beast: rock crust that bursts off as shrapnel, lava trails | Eruption: living volcano, eats buildings to fuel its super | Strong in eruptions; snow/floods cool it but harden armor |
| Riftclaw | Pinch and hold | Crab: shell blocks anything, spins out like a buzzsaw | Abyss: burrows, pops up anywhere; acid melts armor and buildings | Strong after quakes; lava burns it underground |
| Tidefang | Owns the water | Serpent: coils rivals and skyscrapers; venom slows and stops healing | Leviathan: one giant whirlpool mouth (3 heads go to the dragon) | Dives through rivers/floods; huge in Flood Zone; ice/lava lock it out |
| Novawing | Gravity control | Wyvern: fights mostly in the air | Supernova: starlight charge, calls down star pieces (its "family") | Stronger at night; sandstorm dims it; whiteout/snow grounds it |

Rift King should become its own boss titan (not brainstormed yet).

## 6. New titans
| Titan | Signature rule | Key moves | Notes |
|---|---|---|---|
| **Wreckjaw** (mech) | Momentum: unstoppable once moving | Robot: wrecking-ball arm, crane hook, drills, builds rubble walls. Bulldozer/train: straight-line ram, dumps rubble | Built from an **unknown first kaiju**; its heart beats louder as people die and at full power **takes over for a few wild seconds**. Shrugs off wind/sand, slides on ice |
| **3-headed dragon** | Lightning, fire, ice heads | Each head's special summons its own storm; heads regrow unless all 3 cut fast; breaks chains to grow stronger | Chained under Volcano Island; rival of the tree giant |
| **Kongamato** (pterosaur) | Rules the sky | Swoop and grab; screech stuns, shatters windows, breaks lock-on | Rides storm winds; boat breaker (Harbor, Flood Zone); the dragon's servant |
| **Komainu** (lion-dog) | A (open, attack) / Un (closed, guard) stances | Guardian near its shrine; twin spirit; ward-breaker seals | |
| **Rune tree giant** | Rune magic (traps, heals, shields) | Roots; regrowth; seasons; **time portal every round** throws the rival into a ruined future city where the disaster hits them, not the tree | Immune to environment damage in round 3. Whoever is in the portal gets a rippling, warped screen |

## 7. Camera, phone and city look
- **City look: Classic box buildings for now.** Hide the Kenney buildings (make Classic the default City look) but **keep them in the game and the `models/` folder**. Classic buildings need the new destruction + sturdier rules.
- **Camera:** MajorasPride loses the other monster and the city. Today the camera stays a fixed distance, aims ahead of you (not between titans), 65° view.
- **Phone: wider camera** that pulls back when apart, moves in when close. PC stays as is for now.
- **Phone: lock landscape** in fullscreen (Android Chrome); fall back to a "turn your phone" screen.
- **Phone buttons:** today 10 same-size buttons in one grid. Better: 3–4 big attack buttons by the thumb (light, heavy, special, block), a small ring (roll, jump, grab), rare ones up top (transform, super, lock). Hide the move list, smaller bars.

## 8. Open questions (answered Nov 5: trigger = landmark to hit · Runewood fully immune in round 3 · avalanche dropped)
- Each map's round-1 trigger: one landmark to hit, or knocking your rival into it?
- Rune tree giant in round 3: fully immune, or does lava/fire still burn it?
- Tidefang's roll: too long, hard to steer, or leaves you open?
- Rift King boss brainstorm.
- Keep the avalanche as Frozen Harbor's big moment?

## 9. Suggested build order (one chat each)
1. City look → Classic + sturdier buildings + damage that carries over between rounds ✅ built in v7 (waiting for MajorasPride's OK). Screen weather also added early.
2. Phone: landscape lock, new buttons, wider camera ✅ v7
3. Disasters by round, visible weather, Frozen Harbor rework ✅ v7
4. Crowds thinning + TV highlight clip ✅ v7
5. Lock-on breaks ✅ v7
6. Roster rework, one titan per chat ✅ v7 first pass (signature rules + weather traits; movesets still to do)
7. New titans (Wreckjaw first, then dragon + Kongamato) ✅ v7 first versions (all five, on placeholder bodies)

Research sources (crowd behavior): Gizmodo "The frozen calm of normalcy bias"; Psychology Today "Relax—Everything Is Under Control"; The Conversation via 1News "Why some people don't evacuate during a disaster"; The Weather Network "Why don't people evacuate disasters?"
