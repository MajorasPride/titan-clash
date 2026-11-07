# Titan Clash patch notes: v1 to v7.3

Copied from the change log at the top of `titan-clash.html` (Part 13).

```
v1  First version: 4 titans, smashable city, CPU opponent.
v2  TV news frame, Chopper 7, backstories, split screen, key mapping,
    controllers, new transform system, cars and tiny people.
v3  Story mode + Rift King, Titan Lab, 3 new titans, 4 new maps,
    climbing, throws, power-ups, tanks, falling skyscrapers, music,
    news anchor voice, super moves, records.
v3  From here on we build it ourselves. New changes below:
v4  Phase 1 (look & feel): cartoon cel shading + outlines (Settings toggle),
    Chopper 7 cam moved top-left, smoother menus/HUD, victory pose with
    sky beams, Ch 7 after-battle report (damage, combos, people lost...).
v4  Neon art sample: neon Downtown + green Rift, rim light, model-kit armor,
    glowing dorsal plates.
v5  COMBAT: heavier hits (hit-stop, impact flash, victim shudder), 3-hit light
    combos with a finisher + cancel into heavy, PARRY (tap block right before
    a hit), HEAT meter (guns overheat, melee cools), tank hull/turret split.
    LIMBS: arms/legs/tails crippled per limb (HUD paper doll); Realistic mode
    tears them off; optional Blood (glowing kaiju blood, oil for mechs).
    WORLD: arena 1.7x bigger (104 -> 177), rivers (wading slows, sea kaiju
    swim fast, water cools heat), 3-stage DISASTERS on every map that attack
    both titans, new FLOOD ZONE map.
    AI: commander CPU (orders shown under P2's bars) + AI AGENT PILOT: the
    titan-clash-mcp server lets Claude or other agents fly a titan.
v6  CITY: buildings and cars are now Kenney 3D models (free CC0 kits,
    www.kenney.nl) in models/kenney-models.js. Settings > City look:
    Neon (recolored for each map), Toy (Kenney's bright colors) or
    Classic (the old boxes). Punches and shots knock out the floors they
    hit and the floors above drop down; collapses pancake floor by floor
    and leave rubble piles; cars get crushed and lose wheels and doors.
    Outer-ring buildings use simpler pieces so big maps stay fast.
    FIGHTS: Settings > Round time and Titan health. Balanced default:
    story rounds 150s (boss 240s) with 70% health, other fights 120s
    with 85% health (story fights kept ending on the clock).
    NOTES: this is our game now (removed the gift/hand-over wording).
v7  (Think-tank plan step 1 + screen weather, built Nov 5 2026 while
    MajorasPride slept; waiting for his OK.)
    CITY: Classic neon box buildings are the default again (Kenney looks
    still in Settings > City look, models/ folder kept).
    STURDY BUILDINGS: every building has health (bigger = tougher), all
    damage goes through bHit(). Stages: cracks -> top knocked off + hole
    + smoke -> leaning -> collapse into a rubble pile. Neon maps get
    glowing ember cracks. WALL SLAMS stagger a titan knocked into a
    building; enough slams bring it down on them. COVER: shots stop at
    walls, beams stop at the first building that holds. The CPU goes
    around or smashes through when a building blocks it.
    CARRY-OVER: the city, rubble and ground cracks stay between rounds;
    the news gives a damage report at the start of rounds 2 and 3.
    SCREEN WEATHER (Settings > Weather on the screen): lens rain drops
    that slide and get pushed when the camera turns, frost corners and
    whiteout haze, sand grit and dust clouds, ash + embers + heat glow,
    Rift motes and glitches. Grows each round and disaster stage.
    Chopper 7 cam: still lens drops, wind buffeting, alert bar, signal
    breakup when it's extreme.
    (Later the same day MajorasPride said "finish all the ideas, no need to
    stop", so the rest of the think-tank plan was built in one go:)
    PHONE: fullscreen + landscape lock (turn-your-phone screen otherwise),
    new buttons (big LIGHT/HEAVY/SPECIAL/BLOCK by the thumb, small
    JUMP/ROLL/GRAB ring, FORM/SUPER/LOCK up top), lighter phone HUD,
    wider phone camera (72 deg) that pulls back when titans are apart.
    DISASTERS BY ROUND: stage = round (light / feel it / extreme). Each map
    has a TRIGGER landmark (dam, substation, magma plug, ice anchor,
    weather tower, rift seal); breaking it in round 1 makes round 2
    extreme and round 3 RIDICULOUS (stage 4: blackout + lightning, the
    mountain blows, ice shelf collapse, tornado outbreak, rift tears open,
    skyscraper-tall wave). Boss fights keep the old timer stages.
    Frozen Harbor rework: no tidal waves or avalanche; frost patches
    freeze titans ~1s and make buildings shatter in one hit; whiteouts
    with a 3s warning drop lock-on and show only the rival's glow.
    Overlaps fixed: hurricane has no tornado now; meteors come in bursts.
    Bug fix: weather chip damage (sand, lava) no longer stuns every frame
    (the sandstorm used to freeze you in place); tornadoes wander and
    give 4s to escape after a throw.
    CROWDS: round 1 people walk, stare, film (normalcy bias); between
    rounds EVACUATION ORDERED; round 2 they leave (some freeze or refuse),
    traffic jams; round 3 ghost town with people waving from rooftops.
    TV HIGHLIGHT CLIP between rounds (tap/click to skip): biggest hit,
    biggest collapse, next round's forecast with a Ch 7 headline.
    LOCK-ON BREAKS: 3 knockdowns in 12s or a 30+ damage blow = DAZED 2.5s
    (cracked reticle + countdown ring, wobbly aim, 15s immunity, never
    during your own super). daze() is used by Kongamato's screech.
    TITAN CAM (our own, ideas borrowed from monster brawlers like Godzilla
    Melee, made better): default camera locked on your titan with the rival
    in view, dead zone so it never swings (v7.1); shared side view in 2P; every titan can rip up a small
    building, hold it overhead and throw it (Settings > Camera).
    ROSTER RULES (RULES table): signature rule + weather traits per titan
    (Ironclad plates, Volt Rook charge, Shogun honor, Magmaw heat,
    Riftclaw pinch, Tidefang water, Novawing gravity). Mechs carry
    scared people to safety; the monster's victims make the mech furious
    (up to +30%). Report shows PEOPLE SAVED.
    NEW TITANS (first versions on existing bodies): WRECKJAW (momentum,
    kaiju heart takes over for 4s), GORYNAX 3-headed dragon (each special
    = lightning/fire/ice storm), KONGAMATO (screech dazes), KOMAINU
    (A/UN stances, heals near the center shrine), RUNEWOOD (regrows when
    still, time portal once a round, immune to environment in round 3).
    EXTRAS: IMPOSSIBLE difficulty, ALL-NEON mode (Settings), hidden DESTROY
    THE CITY mini game (unlocks after story chapter 1), Chopper 7 FIELD
    REPORTS (the news cam cuts to tornadoes, waves, the dam, meteors,
    whiteouts and falling skyscrapers with live news graphics).
    FINISHING TOUCHES: Gorynax heads get cut off by heavy hits and grow back
    in 8s (cut all 3 = stunned, takes +30%); Wreckjaw crane hook pulls the
    rival in (robot) or dumps a rubble wall (dozer); Komainu's twin spirit
    fights beside it once below 30% health; Kongamato carries a grabbed
    rival high into the sky and hurls them.
v7.1 CAMERA: MajorasPride: the camera was good at the start of a fight but got
    too disjointed later. Solo Titan Cam (camFollow) now works like Budokai
    Tenkaichi 3: behind your titan, eased turning toward the rival (never
    snaps), a 'sweet spot' distance that barely changes all fight. Fixed a
    bug where a code comment had switched off the camera's aim line.
    We are NOT copying Melee: borrow good ideas, make them better.
v7.3 MajorasPride's feedback: LOCK button again switches FREE LOOK <-> LOCK-ON
    (Titan Cam). Runewood got a real tree-giant body (buildTree) and Komainu
    a real stone guardian lion body on all fours (buildLion), modeled on the
    traditional temple statues.
v7.2 CAMERA FIX: the camera turned the WRONG way (angDiff(a,b) means 'turn
    from a to b'; it was called backwards), so it drifted until it sat behind
    the RIVAL. Fixed in camFollow and the 2P side cam. Tested: camera stays
    behind your titan with the rival ahead 97-100% of the time.
```
