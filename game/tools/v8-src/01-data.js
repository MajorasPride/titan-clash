/* =====================================================================
   v8.0 "CORE SIX" (Nov 6, 2026) — everything new in v8 lives in this block.
   Search for  V8  to find all of it. The old game above is untouched except
   for a few small marked edits (search  v8:  in the main script).
   ROSTER: 3 mechs (VALOR, ASHVIN, RAIKOU) + 3 kaiju (INFERNOTH, RAGNAVOX,
   WORLDROOT). v8.1: the old 12 titans, THE RIFT KING, the 5 old maps and the
   Vault are gone from the game (archives in MajorasPride's Google Drive:
   titan-clash-old-roster-archive.js, titan-clash-old-maps-archive.js).
   Story mode and Titan Lab are hidden until they're rebuilt for the core six.
   ===================================================================== */
const V8={proj:null,discs:[],fields:[],echoes:[],wins:0};
{ const s=load('tc_v8'); if(s) Object.assign(V8,s); }
function v8save(){ save('tc_v8',{wins:V8.wins||0}); }
if(SET.autoClimb==null) SET.autoClimb=true;
if('vault' in SET){ delete SET.vault; save('tc_set',SET); } // v8.1: the Vault setting is gone
if(!SET.v8){ SET.v8=1; if(SET.cam!=='behind') SET.cam='melee'; save('tc_set',SET); }
MAPS.city.name='NEON CITY'; MAPS.city.sub='Neon rain';

/* ---- STATS (1-10): Health, Attack speed, Defense, Mobility, Energy ---- */
const V8STAT={
 valor:{hp:6,atk:6,def:6,mob:6,en:6},
 ashvin:{hp:4,atk:5,def:4,mob:6,en:10},
 raikou:{hp:5,atk:9,def:3,mob:9,en:5},
 infernoth:{hp:9,atk:3,def:8,mob:3,en:6},
 ragnavox:{hp:7,atk:5,def:5,mob:7,en:6},
};
const statHp=s=>Math.round(760+s.hp*48), statSpd=s=>10+s.mob*1.25;
const atkMul=f=>{ const s=f&&f.def&&V8STAT[f.def.id]; return s?1.2-s.atk*.04:1; };       // move time (lower = faster)
const defMul=f=>{ const s=f&&f.def&&V8STAT[f.def.id]; return s?1.15-s.def*.03:1; };      // damage taken
const enMul=f=>{ const s=f&&f.def&&V8STAT[f.def.id]; return s?.55+s.en*.09:1; };         // energy regen
const costMul=f=>{ const s=f&&f.def&&V8STAT[f.def.id]; return s?1.15-s.en*.03:1; };      // energy cost

/* ---- stances: [J light, M medium (tap heavy), K heavy (hold heavy), L special] ---- */
const ST=(name,o)=>Object.assign({name,armor:1,power:1,jump:28,grab:true},o);
function v8stances(id,s){ const sp=statSpd(s);
 return {
  valor:[ST('SWORD',{speed:sp,J:'vsword',M:'shieldbash',K:'risingslash',L:'shieldthrow'}),ST('GUN',{speed:sp,J:'vrifle',M:'shieldbash',K:'rallystand',L:'dawncannon'})],
  ashvin:[ST('SUN TWIN',{speed:sp,J:'palm',M:'tkthrow',K:'psyburst',L:'mindbarrier'}),ST('MOON TWIN',{speed:sp,J:'psybolt',M:'mindscramble',K:'psyburst',L:'twinsplit'})],
  raikou:[ST('IAI',{speed:sp,power:1.1,J:'iaicut',M:'thunderstep',K:'risingthunder',L:'echoshift',iai:true}),ST('STORM',{speed:sp*1.08,power:.92,J:'stormslash',M:'thunderstep',K:'chainblade',L:'echoshift'}),ST('THUNDER GOD',{speed:sp*.9,power:1.2,armor:.92,J:'thunderslash',M:'chainblade',K:'thundercrash',L:'echoshift'})],
  infernoth:[ST('BRAWLER',{speed:sp,power:1.15,grab:false,jump:22,J:'claw',M:'magmatail',K:'infernoslam',L:'heatbeam'}),ST('MELTDOWN',{speed:sp*.88,power:1.3,armor:.9,grab:false,jump:18,J:'claw',M:'dorsalpulse',K:'magmatail',L:'heatbeam',hot:true})],
  ragnavox:['FIRE','STORM','ICE'].map((e,i)=>ST(e+' HEADS',{speed:sp,power:1.05,grab:false,jump:32,el:['fire','storm','ice'][i],J:'triplebite',M:'roarwave',K:'tremorstomp',L:'elementbreath'})),
 }[id]; }

/* ---- the CORE SIX ---- */
const V8DEFS=[
 {id:'valor',name:'VALOR',type:'mech',chassis:'heavy',vehicle:'tank',tag:'The leader. Balanced, brave, never gives up. Shield, sword and rifle.',color:0x2f5fa8,accent:0xe9eef4,trim:0xc8323c,glow:0x7fd4ff,css:'#7fd4ff',beam:'Dawn Cannon',superName:'LAST STAND',ultName:'LAST STAND: SHIELD OF DAWN',cls:'VANGUARD',code:'AEGIS-1',country:'UNITED STATES'},
 {id:'ashvin',name:'ASHVIN',type:'mech',chassis:'slim',vehicle:'racer',tag:'Twin psychic pilots. Huge energy, lower health. Moves things with their minds.',color:0xe7e2d6,accent:0xf29a2e,trim:0x2e7f8f,glow:0xd58bff,css:'#d58bff',beam:'Psychic Wave',superName:'TWIN ECLIPSE',ultName:'TWIN ECLIPSE',cls:'MYSTIC',code:'TWIN LOTUS',country:'INDIA'},
 {id:'raikou',name:'RAIKOU',type:'mech',chassis:'samurai',vehicle:'jet',tag:'Lightning samurai. Three stances, blinding speed, Echo Shift.',color:0x1b1a24,accent:0x6b3fd1,trim:0xffd43b,glow:0xfff06a,css:'#fff06a',beam:'Echo Shift',superName:'THOUSAND ECHOES',ultName:'THOUSAND ECHOES',cls:'STRIKER',code:'RJ-07 "FLASH"',country:'JAPAN'},
 {id:'infernoth',name:'INFERNOTH',type:'kaiju',kbody:'volcano',tag:'Heavy fire titan from the deep. Heat beam, dorsal blasts, magma tail.',color:0x24201f,accent:0x3a2a24,glow:0xff5a1a,css:'#ff7a3a',beam:'Heat Beam',superName:'CORE MELTDOWN',ultName:'CORE MELTDOWN',altColor:0x2a1610,altScale:1,cls:'COLOSSUS',code:'K-01 "FURNACE"',origin:'NATURAL DISASTER'},
 {id:'ragnavox',name:'RAGNAVOX',type:'kaiju',kbody:'winged',heads:3,tag:'Three-headed sound dragon on long wings. Each head holds an element.',color:0x3c3a4f,accent:0x241f33,glow:0xb48cff,css:'#b48cff',beam:'Element Breath',superName:'CHORUS OF RUIN',ultName:'CHORUS OF RUIN',altColor:0x3c3a4f,altScale:1,cls:'STRIKER',code:'K-02 "CHOIR"',origin:'NIGHTMARE'},
];
for(const d of V8DEFS){ const s=V8STAT[d.id]; d.core=true; d.hp=statHp(s); d.stances=v8stances(d.id,s); d.forms=[d.stances[0],d.stances[1]];
 d.st=[{valor:3,ashvin:3,raikou:4,infernoth:5,ragnavox:4}[d.id],Math.max(1,Math.round(s.mob/2)),Math.max(1,Math.round(s.def/2))]; }
ROSTER.unshift(...V8DEFS);
const isCore=f=>!!(f&&f.def&&V8STAT[f.def.id]);

/* ---- lore (country built each mech to counter one kaiju) ---- */
Object.assign(LORE,{
 valor:{org:'U.S. TITAN COMMAND',from:'',bio:'Built by the United States to stop INFERNOTH. Its shield is made from the same heat-proof alloy as a space capsule. Its pilot has never left a person behind.',
  lines:['VALOR\'S PILOT REFUSES TO RETREAT UNTIL THE STREET IS EMPTY','TITAN COMMAND: "VALOR WAS BUILT TO TAKE A HEAT BEAM TO THE FACE. WE HOPE."','KIDS ACROSS THE COUNTRY ARE MAKING VALOR SHIELDS OUT OF TRASH CAN LIDS','VALOR\'S SHIELD JUST BOUNCED OFF THREE BUILDINGS AND CAME BACK. PHYSICS EXPERTS ARE UPSET'],
  heli:'CHOPPER 7: "VALOR JUST GAVE US A THUMBS UP. I\'M NOT CRYING, IT\'S THE RAIN."'},
 ashvin:{org:'INDIA\'S TWIN-MIND PROGRAM',from:'',bio:'Built by India to fight RAGNAVOX. Twin pilots share one mind, so the dragon\'s roar can\'t scare both of them at once. They can lift a bus with a thought.',
  lines:['ASHVIN\'S TWIN PILOTS FINISH EACH OTHER\'S... SENTENCES','A CAR JUST FLOATED PAST OUR NEWS VAN. ASHVIN SAYS SORRY','SCIENTISTS: THE TWINS\' MINDS ARE "LOUDER THAN THE DRAGON"'],
  heli:'CHOPPER 7: "ASHVIN IS LOOKING AT US. I CAN HEAR IT IN MY HEAD. IT SAYS HELLO."'},
 raikou:{org:'JAPAN\'S RAIJIN PROJECT',from:'',bio:'Built by Japan to cut down RAGNAVOX, one lightning blade for every head. Its pilot trained 20 years with a real sword before touching the controls.',
  lines:['RAIKOU MOVED SO FAST OUR CAMERA ONLY CAUGHT ITS ECHOES','RAIJIN PROJECT: "RAIKOU IS FASTER THAN LIGHTNING. TECHNICALLY IT IS LIGHTNING."','EVERY STREET LIGHT IN THE CITY FLICKERS WHEN RAIKOU DRAWS ITS SWORD'],
  heli:'CHOPPER 7: "I BLINKED AND THERE WERE THREE RAIKOUS. NOW THERE\'S ONE. I NEED A NAP."'},
 infernoth:{org:'',from:'FROM THE BURNING VENTS UNDER THE PACIFIC',bio:'A natural disaster with legs. It slept in the boiling vents of the Ring of Fire until the ocean got too warm. It glows hotter the more it gets hurt.',
  lines:['THE OCEAN IS BOILING WHERE INFERNOTH CLIMBED OUT','INFERNOTH\'S SPINES ARE GLOWING. EXPERTS SAY "RUN"','FIREFIGHTERS ASK INFERNOTH TO PLEASE STOP. IT DID NOT STOP'],
  heli:'CHOPPER 7: "INFERNOTH\'S BACK JUST LIT UP LIKE A STOVE. WE ARE FLYING HIGHER."'},
 ragnavox:{org:'',from:'FROM THE STORM CLOUDS OF A NIGHTMARE',bio:'A three-headed dragon people dreamed about for centuries before it was real. Its true weapon is sound. Each head carries an element: fire, storm and ice.',
  lines:['RAGNAVOX\'S ROAR SET OFF EVERY CAR ALARM IN THREE CITIES','PEOPLE REPORT DREAMING ABOUT RAGNAVOX LAST NIGHT. ALL OF THEM','ALL THREE HEADS ARE SINGING. NOBODY LIKES THE SONG'],
  heli:'CHOPPER 7: "ALL THREE HEADS ARE HUMMING THE SAME NOTE. MY TEETH HURT."'},
});

/* ---- new moves (melee: [range, arc, damage, knockback, launch]) ---- */
Object.assign(MOVES,{
 vsword:{name:'Sword Slash',dur:.36,hitAt:.14,melee:[13,1.3,8.5,10,0],anim:'punch'},
 shieldbash:{name:'Shield Bash',dur:.5,hitAt:.2,lunge:16,melee:[11,1.2,12,34,6],anim:'punch'},
 risingslash:{name:'Rising Slash',dur:.7,hitAt:.32,melee:[12.5,1.3,15,14,26],anim:'swing'},
 vrifle:{name:'Rifle / Close Blaster',dur:.42,ranged:1,anim:'punch'},
 rallystand:{name:'Rally Stand',dur:2.6,cost:20,cd:8,moveMul:0,anim:'block'},
 dawncannon:{name:'Dawn Cannon (hold)',dur:3,cost:45,cd:9,moveMul:.05,ranged:1,anim:'beam',sweep:1.4},
 shieldthrow:{name:'Shield Throw',dur:.45,cost:25,cd:5,ranged:1,anim:'swing'},
 palm:{name:'Psychic Palm',dur:.38,hitAt:.15,melee:[12,1.3,7.5,9,0],anim:'punch'},
 psybolt:{name:'Psy Bolts',dur:.3,ranged:1,en:3,anim:'punch'},
 tkthrow:{name:'Telekinetic Throw',dur:.9,cost:20,cd:4,ranged:1,anim:'roar'},
 psyburst:{name:'Psy Burst',dur:.7,hitAt:.35,anim:'roar2'},
 mindbarrier:{name:'Mind Barrier',dur:.4,cost:25,cd:9,anim:'roar'},
 mindscramble:{name:'Mind Scramble',dur:.6,cost:30,cd:10,ranged:1,anim:'roar'},
 twinsplit:{name:'Twin Split',dur:.6,cost:40,cd:14,anim:'roar2'},
 iaicut:{name:'Iai Draw-Cut',dur:.5,hitAt:.28,melee:[14,1.2,13,16,0],anim:'swing'},
 stormslash:{name:'Storm Slashes',dur:.26,hitAt:.1,melee:[12.5,1.4,6,7,0],anim:'punch'},
 thunderslash:{name:'Thunder Slash',dur:.55,hitAt:.26,melee:[14,1.4,12,14,0],anim:'swing'},
 thunderstep:{name:'Thunder Step',dur:.35,cost:12,cd:3,anim:'swing'},
 risingthunder:{name:'Rising Thunder',dur:.7,hitAt:.3,melee:[12,1.4,14,12,28],anim:'swing'},
 chainblade:{name:'Chain Lightning Blade',dur:.6,hitAt:.25,cost:15,cd:3,melee:[14,1.5,11,14,0],anim:'swing'},
 thundercrash:{name:'Thunder Crash',dur:.8,hitAt:.4,anim:'swing'},
 echoshift:{name:'Echo Shift (hold)',dur:3,cost:30,cd:6,moveMul:0,anim:'block'},
 magmatail:{name:'Magma Tail Slam',dur:.85,hitAt:.42,melee:[15,Math.PI,15,26,12],anim:'spin'},
 infernoslam:{name:'Inferno Uppercut',dur:.8,hitAt:.4,melee:[12,1.3,17,18,28],anim:'kick'},
 dorsalpulse:{name:'Dorsal Pulse',dur:.7,cost:20,cd:5,anim:'roar2'},
 heatbeam:{name:'Sweeping Heat Beam',dur:2.6,cost:45,cd:8,moveMul:.1,ranged:1,anim:'beam',sweep:1.35},
 triplebite:{name:'Triple Bite',dur:.5,multi:[.1,.22,.34],melee:[13,1.3,4.5,7,0],anim:'bite'},
 roarwave:{name:'Roar Shockwave',dur:.7,cost:10,cd:2.5,ranged:1,anim:'roar'},
 tremorstomp:{name:'Tremor Stomp',dur:.9,hitAt:.45,anim:'slam'},
 elementbreath:{name:'Element Breath',dur:1.9,cost:35,cd:6,moveMul:.15,ranged:1,anim:'beam',sweep:1.6},
 skydive:{name:'Sky Dive',dur:1.1,noGrav:1,moveMul:0,anim:'dive'},
 branch:{name:'Branch Swipe',dur:.45,hitAt:.2,melee:[13,1.3,8,10,0],anim:'punch'},
 rootwhip:{name:'Root Whip',dur:.6,cost:12,cd:3,ranged:1,anim:'slam'},
 rootslam:{name:'Root Eruption',dur:.85,hitAt:.45,anim:'slam'},
 futureportal:{name:'Future Portal Shot',dur:.6,cost:35,cd:8,ranged:1,anim:'roar'},
 overgrowth:{name:'Overgrowth',dur:.6,cost:25,cd:10,anim:'roar2'},
 timeskip:{name:'Time Skip',dur:.6,cost:35,cd:12,ranged:1,anim:'roar2'},
 stance:{name:'Stance',dur:.3,moveMul:.5,anim:'block'},
 ultimate:{name:'ULTIMATE',dur:3.2,moveMul:0,anim:'roar2'},
});
LIGHT.push('vsword','palm','stormslash','branch','iaicut','thunderslash');
Object.assign(HEAT,{vrifle:9,psybolt:6});
MOVES.slash.anim='swing'; // v8 fix: the samurai body swings its katana instead of punching with it (Titan Lab samurai)

/* ---- LOADOUTS (Risk of Rain style, picked before the fight) ---- */
const V8FOCUS={melee:{n:'MELEE / SWORD',d:'+15% close-up damage, -15% ranged'},ranged:{n:'RANGED / MAGE',d:'+15% ranged damage, -15% close-up'},hybrid:{n:'HYBRID',d:'No penalties, +15% energy regen'}};
const V8ELEM={fire:{n:'FIRE',c:'#ff7a3a',d:'Hits burn (damage over time); specials explode'},water:{n:'WATER',c:'#5fd0ff',d:'Hits slow the rival; heal in rivers and rain'},lightning:{n:'LIGHTNING',c:'#fff06a',d:'Hits can chain-zap and shock (tiny stun)'}}; // v8.1: Steel and Anti-Magic are put away for now

/* ---- ABILITY TREES (Diablo style): class -> 2 sub-classes -> 3 upgrades each, unlocked DURING the fight ----
   Tier 1 at the start, tier 2 after dealing 120 damage (or at round 2), tier 3 after 300 (or round 3). */
const V8TREE={
 valor:{A:{n:'SENTINEL',nodes:[['Tempered Shield','Shield Throw bounces 2 more times','bounce'],['Hold the Line','Rally Stand lasts 1.5s longer and reflects big shots too','rally'],['Unbreakable','Take 12% less damage','armor12']]},
        B:{n:'COMMANDER',nodes:[['Quick Draw','Stance swaps are instant and free','freeswap'],['Rally Cry','Saving people gives double energy','savecry'],['Dawn Overcharge','Dawn Cannon charges 40% faster and hits 20% harder','dawn']]}},
 ashvin:{A:{n:'ORACLE TWIN',nodes:[['Deep Focus','Energy regen +30%','regen30'],['Mirror Mind','Mind Barrier lasts longer and throws shots back faster','barrier'],['Mind Crush','Mind Scramble also drains 25 energy','scramble']]},
         B:{n:'KINETIC TWIN',nodes:[['Heavy Thoughts','Telekinetic Throw hurls 2 objects','tk2'],['Split Second','Twin Split lasts 4s longer','split'],['Psychic Storm','Psy Burst launches higher and hits 25% harder','burst']]}},
 raikou:{A:{n:'BLADE SAINT',nodes:[['Clean Cut','Light attacks +12% damage','light12'],['Iai Master','Blocking in IAI stance counter-cuts every melee hit','iaicounter'],['Fifth Echo','Echo Shift makes 2 more echoes and hits harder','echo']]},
         B:{n:'STORM RUNNER',nodes:[['Static Feet','Move 10% faster','speed10'],['Flash Step','Thunder Step cooldown halved','step'],['Overcharge','Chain Lightning jumps to 2 more buildings','chain']]}},
 infernoth:{A:{n:'MAGMA HEART',nodes:[['Hot Blood','Burning Rage kicks in sooner','rage'],['Molten Hide','Take 12% less damage','armor12'],['Lava Wake','Magma Tail leaves twice the lava','lava']]},
            B:{n:'NUCLEAR BREATH',nodes:[['Long Fuse','Heat Beam lasts 0.6s longer','beamlong'],['Wide Beam','Heat Beam is wider and burns buildings faster','beamwide'],['Pulse Core','Dorsal Pulse cooldown halved','pulse']]}},
 ragnavox:{A:{n:'SKY TYRANT',nodes:[['Long Wings','Flight stamina drains 35% slower','wings'],['Thunder Dive','Sky Dive hits 30% harder','dive'],['Gale Roar','Roar Shockwave pushes twice as far','roar']]},
           B:{n:'HEAD KEEPER',nodes:[['Hydra Blood','Cut heads grow back in 5s instead of 10s','regrow'],['Elemental Fury','Element Breath hits 20% harder','breath'],['Three Voices','Roar Shockwave uses the head\'s element too','voices']]}},
};
const V8LOAD=Object.assign({},load('tc_v8load')||{});
const V8DEFEL={valor:'water',ashvin:'fire',raikou:'lightning',infernoth:'fire',ragnavox:'lightning'};
function loadOf(id){ const L=V8LOAD[id]||(V8LOAD[id]={focus:'hybrid',el:V8DEFEL[id]||'fire',sub:'A'}); if(!V8ELEM[L.el]) L.el=V8DEFEL[id]||'fire'; return L; } // v8.1: saved Steel / Anti-Magic picks switch to the new default
function saveLoad(){ save('tc_v8load',V8LOAD); }
const up=(f,flag)=>!!(f&&f.ups&&f.ups.has(flag));
