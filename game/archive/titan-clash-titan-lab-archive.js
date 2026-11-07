/* =====================================================================
   TITAN CLASH: TITAN LAB ARCHIVE (taken out of the game in v8.3, Nov 7, 2026)
   The Titan Lab (build your own titan) was hidden in v8.1 because it was built on the old 12 titans.
   In v8.3 its code came out of game/titan-clash.html so it can't be opened by mistake (the
   "+ BUILD YOUR OWN" card still opened it). Nothing was deleted: every piece is here with where it was.
   Kept in the game: CUSTOM (saved custom titans stay saved in the browser), CDEFS and refreshCustoms().
   To bring it back: rework customDef() for the core six, put the pieces back, add the card back.
   ===================================================================== */

/* ---- HTML: the Titan Lab screen (was before <div id="records">) ---- */
<div id="lab" class="screen hidden">
  <div class="panel">
    <h2>TITAN LAB</h2>
    <div class="note" style="margin:-6px 0 4px">Build your own titan. It gets its own news story!</div>
    <div class="lbl">SLOT</div><div class="chips" id="labSlots"></div>
    <div class="lbl">NAME</div>
    <div style="display:flex;gap:8px;align-items:center"><input id="labName" maxlength="14" style="flex:1;padding:9px 12px;border-radius:8px;border:2px solid #24364a;background:#0e1621;color:#fff;font-family:'Russo One';font-size:18px;letter-spacing:2px;text-transform:uppercase"><button class="chip" id="labRand">RANDOM NAME</button></div>
    <div class="lbl">TYPE</div><div class="chips" id="labType"></div>
    <div class="lbl">BODY</div><div class="chips" id="labBody"></div>
    <div id="labVehBox"><div class="lbl">TRANSFORMS INTO</div><div class="chips" id="labVeh"></div></div>
    <div class="lbl">MAIN COLOR</div><div class="sw" id="labC0"></div>
    <div class="lbl">ARMOR COLOR</div><div class="sw" id="labC1"></div>
    <div class="lbl">GLOW COLOR</div><div class="sw" id="labC2"></div>
    <div class="lbl">WHERE DID IT COME FROM?</div><div class="chips" id="labOrigin"></div>
    <div class="selbtns"><button class="mbtn" data-back>BACK</button><button class="mbtn" id="labDel">DELETE</button><button class="go" id="labSave">SAVE TITAN</button></div>
  </div>
</div>

/* ---- JS: origins + customDef() (was right after "let CUSTOM=...; let CDEFS=[];") ---- */
const KOR={volcano:{label:'A VOLCANO',from:'FROM INSIDE A VOLCANO',clue:'A GIANT EMPTY CAVE HAS BEEN FOUND INSIDE THE VOLCANO. IT IS STILL WARM',anc:'OLD CAVE PAINTINGS SHOW A FIRE BEAST THAT LOOKS JUST LIKE {N}'},
 sea:{label:'THE DEEP SEA',from:'FROM THE DEEP SEA',clue:'SUBMARINES FIND GIANT FOOTPRINTS ON THE OCEAN FLOOR',anc:'SAILORS\' STORIES FROM 500 YEARS AGO DESCRIBE A SEA GIANT JUST LIKE {N}'},
 space:{label:'OUTER SPACE',from:'FROM OUTER SPACE',clue:'A GLOWING CRATER HAS BEEN FOUND WHERE {N} LANDED',anc:'ANCIENT STAR MAPS SHOW A SHAPE THAT LOOKS EXACTLY LIKE {N}'},
 north:{label:'THE FROZEN NORTH',from:'FROM THE FROZEN NORTH',clue:'A HUGE BLOCK OF MELTED ICE SHOWS WHERE {N} WAS TRAPPED',anc:'OLD LEGENDS FROM THE NORTH TELL OF A GIANT SLEEPING IN THE ICE'},
 jungle:{label:'A HIDDEN JUNGLE',from:'FROM A HIDDEN JUNGLE',clue:'EXPLORERS FIND A LOST VALLEY FULL OF GIANT NESTS',anc:'TEMPLE CARVINGS DEEP IN THE JUNGLE SHOW {N} BEING WORSHIPPED AS A KING'}};
const MOR={military:{label:'THE MILITARY',org:'THE CITY DEFENSE FORCE',built:'UNDER A FOOTBALL STADIUM'},lab:{label:'A SECRET LAB',org:'A SECRET LAB',built:'INSIDE A HIDDEN MOUNTAIN'},space:{label:'THE SPACE AGENCY',org:'THE SPACE AGENCY',built:'ON THE MOON'},navy:{label:'THE NAVY',org:'THE NAVY',built:'INSIDE A GIANT SUBMARINE'}};
/* TITAN LAB (hidden in v8.1): customDef still builds on the old titans' ids. Rework it for the core six before showing the Lab again. */
function customDef(c){ const base=c.type==='mech'?({heavy:'ironclad',slim:'voltrook',samurai:'shogun'}[c.body]):({volcano:'magmaw',crab:'riftclaw',serpent:'tidefang',winged:'novawing'}[c.body]); const Bd=ROSTER.find(d=>d.id===base), N=c.name;
 const d=Object.assign({},Bd,{id:c.id,base,name:N,custom:true,hidden:false,color:c.col[0],accent:c.col[1],glow:c.col[2],css:hexs(c.col[2]),altColor:shade(c.col[0]),superName:N+' FURY',baseScale:1});
 if(c.type==='mech'){ const O=MOR[c.origin]||MOR.military; d.chassis=c.body; d.vehicle=c.veh; d.forms=[CH[c.body],VH[c.veh]]; d.hp=950; d.st=[4,4,4]; d.tag=`Custom robot built by ${O.label.toLowerCase()}.`;
  LORE[c.id]={org:O.org,from:'',bio:`Built by ${O.org.toLowerCase()} ${O.built.toLowerCase()}. Designed in the Titan Lab.`,lines:[`${N} WAVES AT THE CROWD. THE CROWD WAVES BACK`,`TOY STORES REPORT ${N} ACTION FIGURES ARE SOLD OUT`],heli:`CHOPPER 7: "${N} LOOKS EVEN BIGGER UP CLOSE!"`};
  STORY[c.id]=[`BREAKING: ${O.org} UNVEILS A BRAND NEW GIANT ROBOT: ${N}`,`${N} WAS BUILT IN SECRET ${O.built}`,`NEW: ${N}'S PILOTS TRAINED FOR FIVE YEARS ON A GIANT VIDEO GAME`,`LEAKED FILES SAY ${N} CAN LIFT A WHOLE BUS WITH ONE HAND`,`ENGINEERS REVEAL ${N} CAN TURN INTO A ${VH[c.veh].name} IN TWO SECONDS`,`${O.org}: "${N} IS OUR BEST ROBOT YET. WE HAVE SAID THAT BEFORE"`,`LATEST: KIDS ACROSS THE CITY ARE ALREADY DRESSING UP AS ${N}`]; }
 else { const O=KOR[c.origin]||KOR.volcano; d.kbody=c.body; d.forms=KF[c.body]; d.tag=`Custom monster from ${O.label.toLowerCase()}.`;
  LORE[c.id]={org:'',from:O.from,bio:`A brand new monster ${O.from.toLowerCase()}. Discovered in the Titan Lab.`,lines:[`${N}'S ROAR CAN BE HEARD THREE TOWNS AWAY`,`LOCAL DOGS REFUSE TO BARK AT ${N}`],heli:`CHOPPER 7: "${N} JUST LOOKED RIGHT AT OUR CAMERA!"`};
  STORY[c.id]=[`BREAKING: A NEW MONSTER HAS ARRIVED ${O.from}`,'WITNESSES SAY IT IS TALLER THAN A SKYSCRAPER AND VERY, VERY LOUD',`SCIENTISTS NAME THE CREATURE "${N}"`,'NEW: '+O.clue.replace('{N}',N),O.anc.replace('{N}',N),`SCIENTISTS NOW BELIEVE ${N} HAS BEEN SLEEPING FOR THOUSANDS OF YEARS`,`LATEST: ${N} HAS BEEN SEEN STARING AT THE MOON. EXPERTS DO NOT KNOW WHY`]; }
 return d; }

/* ---- JS: the Titan Lab screen code (was before "// ---- records ----") ---- */
// ---- Titan Lab ----
const PAL=[0xd63a3a,0xff8a2b,0xf2c12e,0x2bb673,0x1f8f8f,0x2f7de1,0x5b3fd1,0xd94fd8,0xf0f0f0,0x8a96a3,0x3a3f46,0x15151c];
const GPAL=[0xff5a14,0xffa640,0xffd23f,0x51ff7a,0x4dff9a,0x5ff6ff,0x66a3ff,0xc78bff,0xff4d9d,0xffffff];
const NA=['IRON','STORM','THUNDER','SHADOW','CRYSTAL','MEGA','TITAN','NOVA','BLAZE','FROST','ROCK','VENOM','SKY','DOOM','TURBO','STAR'], NBm=['GUARD','STRIKER','KNIGHT','RANGER','ZERO','PRIME','FIST','BOLT'], NBk=['FANG','CLAW','MAW','JAW','HORN','SCALE','TOOTH','TAIL'];
let labC=null, labSlot=0;
function newCustom(){ return {id:'c'+Date.now().toString(36),name:'',type:'kaiju',body:'volcano',veh:'tank',col:[0x2bb673,0x15151c,0xffd23f],origin:'volcano'}; }
function randName(t){ return NA[(Math.random()*NA.length)|0]+(t==='mech'?' '+NBm[(Math.random()*NBm.length)|0]:NBk[(Math.random()*NBk.length)|0]); }
function labOpen(){ labSlot=Math.min(labSlot,CUSTOM.length); labC=CUSTOM[labSlot]?JSON.parse(JSON.stringify(CUSTOM[labSlot])):newCustom(); if(!labC.name) labC.name=randName(labC.type); renderLab(); labPreview(); }
function labPreview(){ if(preview) preview.remove(); const c=Object.assign({},labC,{name:(labC.name||'?').toUpperCase()}); preview=new Fighter(customDef(c),false); preview.yaw=.5; }
function renderLab(){ const c=labC;
 el('labSlots').innerHTML=[0,1,2,3].map(i=>`<button class="chip ${i===labSlot?'sel':''}" data-s="${i}">${CUSTOM[i]?CUSTOM[i].name:'EMPTY'}</button>`).join('');
 el('labName').value=c.name;
 el('labType').innerHTML=[['kaiju','KAIJU (MONSTER)'],['mech','MECH (ROBOT)']].map(([k,l])=>`<button class="chip ${c.type===k?'sel':''}" data-t="${k}">${l}</button>`).join('');
 const bodies=c.type==='mech'?[['heavy','HEAVY'],['slim','SPEEDY'],['samurai','SAMURAI']]:[['volcano','BEAST'],['crab','CRAB'],['serpent','SEA SERPENT'],['winged','WINGED']];
 el('labBody').innerHTML=bodies.map(([k,l])=>`<button class="chip ${c.body===k?'sel':''}" data-b="${k}">${l}</button>`).join('');
 show('labVehBox',c.type==='mech'); el('labVeh').innerHTML=[['tank','TANK'],['racer','RACE CAR'],['jet','FIGHTER JET']].map(([k,l])=>`<button class="chip ${c.veh===k?'sel':''}" data-v="${k}">${l}</button>`).join('');
 for(let i=0;i<3;i++) el('labC'+i).innerHTML=(i===2?GPAL:PAL).map(col=>`<button style="background:${hexs(col)}" class="${c.col[i]===col?'sel':''}" data-col="${col}" data-i="${i}"></button>`).join('');
 const O=c.type==='mech'?MOR:KOR; el('labOrigin').innerHTML=Object.keys(O).map(k=>`<button class="chip ${c.origin===k?'sel':''}" data-or="${k}">${O[k].label}</button>`).join('');
 show('labDel',!!CUSTOM[labSlot]); }
el('lab').addEventListener('click',e=>{ const t=e.target; let ch=false;
 if(t.dataset.s!=null&&t.closest('#labSlots')){ labSlot=+t.dataset.s; labOpen(); return; }
 if(t.dataset.t){ labC.type=t.dataset.t; labC.body=labC.type==='mech'?'heavy':'volcano'; labC.origin=labC.type==='mech'?'military':'volcano'; ch=true; }
 if(t.dataset.b){ labC.body=t.dataset.b; ch=true; } if(t.dataset.v){ labC.veh=t.dataset.v; ch=true; } if(t.dataset.or){ labC.origin=t.dataset.or; ch=true; }
 if(t.dataset.col){ labC.col[+t.dataset.i]=+t.dataset.col; ch=true; }
 if(ch){ renderLab(); labPreview(); } });
el('labName').addEventListener('input',e=>{ labC.name=e.target.value.toUpperCase().replace(/[^A-Z0-9 \-]/g,'').slice(0,14); });
el('labName').addEventListener('change',()=>labPreview());
el('labRand').addEventListener('click',()=>{ labC.name=randName(labC.type); renderLab(); labPreview(); });
el('labSave').addEventListener('click',()=>{ labC.name=(labC.name||randName(labC.type)).trim().toUpperCase()||randName(labC.type); CUSTOM[labSlot]=JSON.parse(JSON.stringify(labC)); save('tc_customs',CUSTOM); refreshCustoms(); toast(`${labC.name} SAVED! FIND IT ON THE TITAN SELECT SCREEN`,'#51ff7a',1600); selId=labC.id; renderLab(); });
el('labDel').addEventListener('click',()=>{ if(!CUSTOM[labSlot]) return; CUSTOM.splice(labSlot,1); save('tc_customs',CUSTOM); refreshCustoms(); if(!getDef(selId)||getDef(selId).id!==selId) selId='valor'; labOpen(); });

/* ---- select screen: the "+ BUILD YOUR OWN" card (was added to the end of el('grid').innerHTML in renderSelect) ---- */
  +`<div class="card" data-lab="1" style="--c:#9fb3c8;display:flex;align-items:center;justify-content:center;text-align:center"><div><div class="t" style="color:#9fb3c8">+ BUILD YOUR OWN</div><p>Open the Titan Lab</p></div></div>`

/* ---- select screen click: open the lab ---- */
if(c.dataset.lab){ go('lab'); return; } 

/* ---- go(): open the lab ---- */
 else if(s==='lab'){ labOpen(); }

/* ---- SCREENS list (had 'lab') ---- */
const SCREENS=['title','select','controls','settings','howto','lab','records'];
