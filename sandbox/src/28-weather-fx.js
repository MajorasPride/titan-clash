/* =====================================================================
   SANDBOX 28 (Nov 13, 2026, T053): WEATHER, FX KIT AND LIGHTING.
   MajorasPride's fix (Nov 13 6:56 PM): "can we fix the overlay of weather??" The old weather was a flat layer
   drawn over the screen (lens drops + streaks on a canvas in front of everything). Now the weather lives IN the
   3D world: rain, snow, ash, embers and sand fall through the city, are lit by the neon signs around them,
   splash on the ground and on the titans. Nothing is drawn over the HUD or the menus. The old lens layer is
   off (⚙ OLD LENS OVERLAY brings it back to compare). Weather STRENGTH slider in ⚙.
   Default night is never brightened: CLEAR / RAIN at NIGHT keep the map's own sky and fog.
   WEATHER (13): clear night, rain, thunderstorm (lightning strikes hit tall things: buildings or a titan),
     fog bank, snow, blizzard (slower footing, icy slide), sandstorm (low visibility, wind), heatwave haze
     (fire hits +8%, water -8%), typhoon wind (pushes projectiles and debris), volcanic ash, INFERNOTH fire sky
     (ember rain, fire hits +10%), RAGNAVOX storm sky (green strikes that never hit RAGNAVOX), and
     BRIGHT FOG / NEON HAZE (his "we can add bright fog and haze later": an option, off by default).
     Picked FIXED, ROUND BY ROUND, RANDOM, or KAIJU WEATHER (a kaiju in the fight brings its own sky).
     Time of day: NIGHT (default), DUSK, DAWN. Wet / icy roads reflect the neon (reflection streaks).
   FX KIT: one hit set per element (fire, water, ice, lightning, grass, dark, sound), beam cores, sword trails,
     spell circles with runes under ultimates and supers; uses the game's own sparks, dust, rings and debris.
   LIGHTING: neon bloom (three.js r128 UnrealBloomPass, MIT, in 28-bloom-lib.js); lightning flashes light the
     city (one light that is always in the scene, so nothing recompiles mid-fight).
   Choices: three.quarks and pmndrs postprocessing (named in the ticket) need ES modules and a newer three.js
   than the game's r128, so the same jobs are done with r128's own bloom and small shader particle systems.
   The Poly Haven HDRIs and Kenney Particle Pack are on his PC only; particle sprites are drawn in code.
   ===================================================================== */
const WTH={on:true,kind:'rain',mode:'fixed',str:.6,tod:'night',splash:true,wet:true,bloom:true,fx:true,trails:true,circles:true,lens:false,
 t:0,cur:null,lT:0,boltT:6,lp:[],lc:[],center:V(0,0,0),_slip:null,_rough:null,_mapL:null};
const WTH_TYPES={
 clear:  {n:'CLEAR NIGHT'},
 rain:   {n:'RAIN',p:'rain',rate:1,wet:1,mapRain:1},
 storm:  {n:'THUNDERSTORM',p:'rain',rate:1.6,wind:6,bolts:1,fog:1.15,wet:1,mapRain:1},
 fog:    {n:'FOG BANK',fog:2.4,mist:1},
 snow:   {n:'SNOW',p:'snow',rate:.8,slow:.92,icy:1},
 blizzard:{n:'BLIZZARD',p:'snow',rate:2.1,wind:14,slow:.82,fog:1.8,icy:1,fogCol:0x0d1220},
 sand:   {n:'SANDSTORM',p:'sand',rate:1.7,wind:18,fog:2.3,fogCol:0x1c140a},
 heat:   {n:'HEATWAVE HAZE',p:'heat',rate:.7,fog:1.25,fogCol:0x1a0c08,el:{fire:1.08,water:.92}},
 typhoon:{n:'TYPHOON WIND',p:'rain',rate:1.3,wind:28,push:1,wet:1,mapRain:1},
 ash:    {n:'VOLCANIC ASH',p:'ash',rate:1.2,fog:1.7,fogCol:0x0e0a0a,el:{fire:1.05}},
 ember:  {n:'INFERNOTH FIRE SKY',p:'ember',rate:1.2,sky:0x1a0402,fogCol:0x1a0503,el:{fire:1.1},kaiju:'infernoth'},
 chorus: {n:'RAGNAVOX STORM SKY',p:'rain',rate:1.8,wind:10,bolts:2,fog:1.2,sky:0x03100a,fogCol:0x04140c,wet:1,mapRain:1,kaiju:'ragnavox'},
 haze:   {n:'BRIGHT FOG / NEON HAZE',mist:2,fog:1.5,opt:1}};
const WTH_ORDER=['clear','rain','storm','fog','snow','blizzard','sand','heat','typhoon','ash','ember','chorus','haze'];
const WTH_ROUND=['rain','storm','fog','snow','sand','heat','typhoon','ash','blizzard'];   // round by round / random pool (haze is opt-in only)
const WTH_TOD={night:null,dusk:{sky:0x2a1030,fog:0x2a1426,k:.45},dawn:{sky:0x12202c,fog:0x2a2030,k:.4}};
const WTH_EL={fire:0xff6a20,water:0x4fc8ff,ice:0xbfefff,lightning:0xfff06a,grass:0x6aff7a,dark:0x9a4dff,sound:0xf4f0ff};
const wfxId=f=>String((f&&f.def&&(f.def.id||f.def.name))||'').toLowerCase();
function wfxEl(f){ if(!f) return 'sound'; const e=f.load&&f.load.el; if(e&&WTH_EL[e]) return e;
 return {valor:'water',ashvin:'sound',raikou:'lightning',infernoth:'fire',ragnavox:'lightning',worldroot:'grass',voidmaw:'dark'}[wfxId(f)]||'sound'; }

/* ---------- lights the particles pick up: the nearest neon signs (refreshed twice a second) ---------- */
const WTH_NL=8;
for(let i=0;i<WTH_NL;i++){ WTH.lp.push(V(0,-999,0)); WTH.lc.push(new THREE.Color(0,0,0)); }
const WTH_U={lp:{value:WTH.lp},lc:{value:WTH.lc},amb:{value:new THREE.Color(.3,.32,.4)},flash:{value:0},cam:{value:V()},op:{value:1},t:{value:0},px:{value:1}};
function wfxGather(){ const c=WTH.center, list=[], w=V();
 for(const b of city){ if(!b.alive||!b.signs) continue; const dx=b.x-c.x, dz=b.z-c.z; if(dx*dx+dz*dz>200*200) continue;
  b.signs.children.forEach(m=>{ const col=m.material&&m.material.color; if(!col) return; m.getWorldPosition(w); list.push({p:w.clone(),c:col,d:w.distanceToSquared(c)}); }); }
 list.sort((a,b)=>a.d-b.d);
 const N=MAP.neon||NEONPAL, pick=[]; for(const L of list){ if(pick.length>=WTH_NL-2) break; if(pick.every(q=>q.p.distanceToSquared(L.p)>14*14)) pick.push(L); }
 for(let i=0;pick.length<WTH_NL;i++){ const a=i*2.1+.6; pick.push({p:V(c.x+Math.cos(a)*55,22,c.z+Math.sin(a)*55),c:new THREE.Color(N[i%N.length]),fb:1}); }  // fallback glow around the fight (empty ground)
 pick.forEach((L,i)=>{ WTH.lp[i].copy(L.p); WTH.lc[i].copy(L.c).multiplyScalar(L.fb?.6:1.4); });
 WTH._signs=pick.filter(L=>!L.fb); }

/* ---------- shared shader bits: neon lighting + fade near the camera (nothing hugs the lens) ---------- */
const WTH_LIT=`uniform vec3 lp[${WTH_NL}]; uniform vec3 lc[${WTH_NL}]; uniform vec3 amb; uniform float flash; uniform vec3 cam;
vec3 neonLit(vec3 wp){ vec3 c=amb+vec3(.55,.6,.75)*flash*1.6; for(int i=0;i<${WTH_NL};i++){ float d=distance(wp,lp[i]); c+=lc[i]*(1.0/(1.0+d*d*.0035)); } return c; }
float camFade(vec3 wp){ float d=distance(wp,cam); return smoothstep(4.0,14.0,d)*(1.0-smoothstep(150.0,230.0,d)); }`;
// rain: line streaks
const WTH_RN=2600, wfxRP=new Float32Array(WTH_RN*6), wfxRA=new Float32Array(WTH_RN*2), wfxDrops=[];
for(let i=0;i<WTH_RN;i++){ wfxDrops.push({x:rand(-90,90),y:rand(0,110),z:rand(-90,90),v:rand(.85,1.15)}); wfxRA[i*2]=.05; wfxRA[i*2+1]=1; }
const wfxRainG=new THREE.BufferGeometry(); wfxRainG.setAttribute('position',new THREE.BufferAttribute(wfxRP,3)); wfxRainG.setAttribute('a',new THREE.BufferAttribute(wfxRA,1));
const wfxU=()=>Object.assign({},WTH_U,{op:{value:1}});   // shared lights, own opacity
const wfxRain=new THREE.LineSegments(wfxRainG,new THREE.ShaderMaterial({uniforms:wfxU(),transparent:true,depthWrite:false,fog:false,
 vertexShader:WTH_LIT+`attribute float a; varying vec3 vc; varying float va; void main(){ vec3 wp=position; vc=neonLit(wp); va=a*camFade(wp); gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.0); }`,
 fragmentShader:`uniform float op; varying vec3 vc; varying float va; void main(){ gl_FragColor=vec4(min(vc*1.5,vec3(1.4)),va*op); }`}));
wfxRain.frustumCulled=false; wfxRain.visible=false; wfxRain.renderOrder=3; scene.add(wfxRain);
// flakes: snow, sand, ash, embers, heat motes (round soft points)
function wfxPoints(n,blend){ const g=new THREE.BufferGeometry(), P=new Float32Array(n*3), S=new Float32Array(n), C=new Float32Array(n*3), A=new Float32Array(n);
 g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('sz',new THREE.BufferAttribute(S,1)); g.setAttribute('tint',new THREE.BufferAttribute(C,3)); g.setAttribute('al',new THREE.BufferAttribute(A,1));
 const m=new THREE.Points(g,new THREE.ShaderMaterial({uniforms:wfxU(),transparent:true,depthWrite:false,fog:false,blending:blend||THREE.NormalBlending,
  vertexShader:WTH_LIT+`uniform float px; attribute float sz; attribute vec3 tint; attribute float al; varying vec3 vc; varying float va;
   void main(){ vec3 wp=position; vec4 mv=viewMatrix*vec4(wp,1.0); vc=tint.r<0.0?-tint:tint*neonLit(wp); va=al*camFade(wp); gl_PointSize=clamp(sz*px*900.0/-mv.z,1.5,160.0); gl_Position=projectionMatrix*mv; }`,
  fragmentShader:`uniform float op; varying vec3 vc; varying float va; void main(){ vec2 q=gl_PointCoord-.5; float r=dot(q,q)*4.0; if(r>1.0) discard; gl_FragColor=vec4(min(vc,vec3(1.5)),va*op*(1.0-r)); }`}));
 m.frustumCulled=false; m.visible=false; m.renderOrder=3; scene.add(m); return {m,P,S,C,A,n,list:[]}; }
const wfxFl=wfxPoints(1800), wfxMist=wfxPoints(140), wfxSpl=wfxPoints(500), wfxFxP=wfxPoints(900,THREE.AdditiveBlending), wfxSmoke=wfxPoints(160);
for(let i=0;i<wfxFl.n;i++) wfxFl.list.push({x:rand(-80,80),y:rand(0,90),z:rand(-80,80),ph:rand(0,6.28),v:rand(.7,1.3)});
for(let i=0;i<wfxMist.n;i++) wfxMist.list.push({x:rand(-120,120),y:rand(2,18),z:rand(-120,120),ph:rand(0,6.28),s:rand(10,20)});
const WTH_FLK={snow:{c:[1.1,1.12,1.2],s:.6,vy:-7,sway:2.2},sand:{c:[.75,.6,.4],s:.28,vy:-2,sway:1},ash:{c:[.42,.4,.4],s:.42,vy:-3.2,sway:1.6},
 ember:{c:[-1.6,-.55,-.15],s:.38,vy:-4,sway:2,glow:1},heat:{c:[-.5,-.25,-.12],s:.9,vy:3,sway:.6,glow:1,rise:1}};
// splash + FX particle pool (life-based)
function wfxEmit(sys,p,v,life,sz,tint,al,grav){ const L=sys.list; let o; if(L.length<sys.n){ o={}; L.push(o); } else { o=L[sys.i=(sys.i||0)%sys.n]; sys.i++; }
 o.p=p.clone?p.clone():V(p.x,p.y,p.z); o.v=v; o.life=o.max=life; o.sz=sz; o.tint=tint; o.al=al; o.g=grav==null?30:grav; o.grow=0; return o; }
function wfxStep(sys,dt){ const L=sys.list; let k=0;
 for(const o of L){ if(o.life>0){ o.life-=dt; o.v.y-=o.g*dt; o.p.addScaledVector(o.v,dt); if(o.p.y<.05&&o.g>0){ o.p.y=.05; o.v.set(0,0,0); } if(o.drag) o.v.multiplyScalar(Math.exp(-o.drag*dt)); o.sz+=o.grow*dt; } }
 for(const o of L){ if(o.life<=0) continue; const q=o.life/o.max; sys.P[k*3]=o.p.x; sys.P[k*3+1]=o.p.y; sys.P[k*3+2]=o.p.z; sys.S[k]=o.sz; sys.C[k*3]=o.tint[0]; sys.C[k*3+1]=o.tint[1]; sys.C[k*3+2]=o.tint[2]; sys.A[k]=o.al*Math.min(1,q*2.5); k++; }
 sys.m.geometry.setDrawRange(0,k); sys.m.visible=k>0; if(k) wfxDirty(sys); }
function wfxDirty(s){ const a=s.m.geometry.attributes; a.position.needsUpdate=a.sz.needsUpdate=a.tint.needsUpdate=a.al.needsUpdate=true; }

/* ---------- lightning strikes (one light, always in the scene) ---------- */
const wfxBoltL=new THREE.PointLight(0xcfe0ff,0,320,1.6); wfxBoltL.position.set(0,-50,0); scene.add(wfxBoltL);
const wfxBolts=[];
function wfxBolt(green){ const T=WTH_TYPES[WTH.kind]||{}, c=WTH.center; let tgt=null, tall=null, best=0;
 const fs=[game.p,game.e].filter(f=>f&&!f.dead&&!f.hidden&&!(green&&wfxId(f)==='ragnavox'));
 if(fs.length&&Math.random()<.3) tgt=fs[(Math.random()*fs.length)|0];
 if(!tgt){ for(const b of city){ if(!b.alive) continue; const d=Math.hypot(b.x-c.x,b.z-c.z); if(d>130||d<12) continue; const s=b.h-d*.08; if(s>best){ best=s; tall=b; } } }
 let top; if(tgt) top=V(tgt.pos.x,tgt.pos.y+11*(tgt.scale||1),tgt.pos.z); else if(tall) top=V(tall.x,tall.h,tall.z); else top=V(c.x+rand(-60,60),0,c.z+rand(-60,60));
 const pts=[], N=12, sx=top.x+rand(-25,25), sz=top.z+rand(-25,25); for(let i=0;i<=N;i++){ const q=i/N; pts.push(V(sx+(top.x-sx)*q+(i&&i<N?rand(-5,5):0),170+(top.y-170)*q,sz+(top.z-sz)*q+(i&&i<N?rand(-5,5):0))); }
 const col=green?0x9dffc8:0xe6efff, g=new THREE.BufferGeometry().setFromPoints(pts), grp=new THREE.Group();
 grp.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:1,toneMapped:false})));
 const mid=pts[N>>1], len=pts[0].distanceTo(top), core=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,len,5,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
 core.position.copy(pts[0]).lerp(top,.5); core.lookAt(top); core.rotateX(Math.PI/2); grp.add(core); scene.add(grp); wfxBolts.push({grp,life:.3});
 wfxBoltL.color.setHex(green?0x7dffb0:0xcfe0ff); wfxBoltL.position.copy(top).add(V(0,8,0)); wfxBoltL.intensity=7;
 flash=Math.max(flash,.85); setTimeout(()=>{ try{ Snd.thunder(); }catch(_){} },rand(60,260)); game.shake=Math.max(game.shake||0,.35);
 burst(top.clone(),col,14,26); ring(top.x,Math.max(.3,top.y-2),top.z,10,col,.45);
 if(tgt){ const d=tgt.def.hp*.02; tgt.hp=Math.max(1,tgt.hp-d); if(typeof dmgNum==='function'&&SB.showDmg) dmgNum(tgt,d,true); toast((tgt.def.name||'TITAN')+' STRUCK BY LIGHTNING','#cfe0ff',900); }
 else if(tall){ try{ bHit(tall,40,0,0,tall.h*.8,null,tall.x,tall.z); }catch(_){} } }

/* ---------- wet / icy roads: neon reflection streaks on the ground ---------- */
const wfxRefTex=(()=>{ const c=document.createElement('canvas'); c.width=32; c.height=128; const g=c.getContext('2d'), gr=g.createLinearGradient(0,0,0,128);
 gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(.25,'rgba(255,255,255,.9)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,32,128);
 const h=g.createLinearGradient(0,0,32,0); h.addColorStop(0,'rgba(0,0,0,1)'); h.addColorStop(.5,'rgba(0,0,0,0)'); h.addColorStop(1,'rgba(0,0,0,1)'); g.globalCompositeOperation='destination-out'; g.fillStyle=h; g.fillRect(0,0,32,128);
 return new THREE.CanvasTexture(c); })();
const wfxRefs=[]; for(let i=0;i<10;i++){ const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:wfxRefTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
 m.rotation.x=-Math.PI/2; m.visible=false; m.renderOrder=2; scene.add(m); wfxRefs.push(m); }
function wfxRefUpdate(wet){ const S=WTH._signs||[], cp=camera.position;
 wfxRefs.forEach((m,i)=>{ const L=S[i]; if(!L||wet<=0||!WTH.wet){ m.visible=false; return; }
  const dx=cp.x-L.p.x, dz=cp.z-L.p.z, d=Math.hypot(dx,dz)||1, len=Math.min(60,10+L.p.y*1.6);
  m.position.set(L.p.x+dx/d*len*.5,.12+i*.002,L.p.z+dz/d*len*.5); m.rotation.set(-Math.PI/2,0,Math.atan2(dx,dz)); m.scale.set(4+L.p.y*.12,len,1);
  m.material.color.copy(L.c); m.material.opacity=.32*wet; m.visible=true; }); }

/* ---------- choosing the weather ---------- */
function wfxPick(){ const fs=[game.p,game.e].filter(Boolean).map(wfxId);
 if(WTH.mode==='kaiju'){ if(fs.includes('ragnavox')) return 'chorus'; if(fs.includes('infernoth')) return 'ember'; return WTH.kind; }
 if(WTH.mode==='round') return WTH_ROUND[(Math.max(1,game.round||1)-1)%WTH_ROUND.length];
 if(WTH.mode==='random') return WTH_ROUND[(Math.random()*WTH_ROUND.length)|0];
 return WTH.kind; }
function wfxApply(k){ const T=WTH_TYPES[k]||WTH_TYPES.clear; WTH.cur=k;
 if(WTH._mapL==null) WTH._mapL=MAP.lightning||0;
 MAP.lightning=!WTH.on?WTH._mapL:T.bolts===2?2:(T.mapRain?WTH._mapL:0);
 MAP.weather=!WTH.on||T.mapRain?'rain':'none'; if(!WEATHER.none) WEATHER.none={vy:0,len:[0,0,0],color:0,op:0,vx:0};
 DIS.fogK=WTH.on?(1+((T.fog||1)-1)*Math.min(1,.4+WTH.str)):1;
 DIS.windK=WTH.on&&T.wind?T.wind*(.5+WTH.str*.8)*.12:0; if(T.wind) DIS.wind.set(1,0,.35).normalize();
 if(WTH._slip==null) WTH._slip=DIS.slip; DIS.slip=WTH.on&&T.icy?.55:WTH._slip;
 if(WTH._rough==null) WTH._rough=ground.material.roughness; ground.material.roughness=WTH.on&&(T.wet||T.icy)&&WTH.wet?.3:WTH._rough;
 WTH.boltT=rand(2,5); wfxGather(); }
{ const oSR=startRound; startRound=function(){ const r=oSR.apply(this,arguments); try{ WTH._mapL=null; wfxApply(wfxPick()); }catch(e){} return r; }; }
{ const oAM=applyMap; applyMap=function(id){ const r=oAM(id); WTH._mapL=null; WTH._rough=null; return r; }; }

/* ---------- per frame ---------- */
function wfxUpdate(dt){ const T=WTH_TYPES[WTH.cur]||WTH_TYPES.clear, on=WTH.on&&game.mode==='match', S=WTH.str, cp=camera.position;
 WTH.t+=dt; WTH_U.t.value=WTH.t; WTH_U.cam.value.copy(cp); WTH_U.flash.value=Math.max(flash||0,wfxBoltL.intensity/7)*1;
 WTH_U.px.value=renderer.getPixelRatio()*(innerHeight/900);
 const p=game.p, e=game.e; if(p&&e) WTH.center.set((p.pos.x+e.pos.x)/2,0,(p.pos.z+e.pos.z)/2); else WTH.center.set(cp.x,0,cp.z);
 WTH.lT-=dt; if(WTH.lT<=0){ WTH.lT=.5; wfxGather(); }
 rain.visible=!on&&!WTH.on;   // the old flat rain lines are replaced by the 3D rain
 const wind=V(DIS.wind.x,0,DIS.wind.z).multiplyScalar(DIS.windK*9);
 // rain
 const rainOn=on&&T.p==='rain'&&S>0; wfxRain.visible=rainOn;
 if(rainOn){ const n=Math.min(WTH_RN,(700+2600*S*(T.rate||1)/1.6)|0), cx=WTH.center.x*.5+cp.x*.5, cz=WTH.center.z*.5+cp.z*.5, len=1.6+1.6*S, vy=90+20*S;
  const fs=[p,e].filter(f=>f&&!f.hidden&&!f.dead).map(f=>({x:f.pos.x,z:f.pos.z,r:(f.radius?f.radius():4)*.8,top:f.pos.y+(f.scale||1)*11}));
  let spl=0; const splMax=WTH.splash?(30+120*S)*dt*60/60:0;
  for(let i=0;i<WTH_RN;i++){ const d=wfxDrops[i], o=i*6;
   if(i>=n){ wfxRP[o+1]=wfxRP[o+4]=-500; continue; }
   d.y-=vy*d.v*dt; d.x+=wind.x*dt; d.z+=wind.z*dt;
   if(d.x-cx>90) d.x-=180; if(d.x-cx<-90) d.x+=180; if(d.z-cz>90) d.z-=180; if(d.z-cz<-90) d.z+=180;
   let hit=-1; for(const f of fs){ if(d.y<f.top&&d.y>f.top-6&&Math.abs(d.x-f.x)<f.r&&Math.abs(d.z-f.z)<f.r){ hit=f.top-rand(0,4); break; } }
   if(d.y<0||hit>=0){ if(spl<splMax*3&&WTH.splash&&Math.hypot(d.x-cp.x,d.z-cp.z)<70&&Math.random()<.5){ spl++; const y=hit>=0?hit:.1;
     for(let k=0;k<(hit>=0?3:2);k++) wfxEmit(wfxSpl,V(d.x,y,d.z),V(rand(-3,3),rand(5,10),rand(-3,3)),rand(.18,.32),rand(.12,.22),[.75,.82,1],.8,40); }
    d.y=rand(85,110); d.x=cx+rand(-90,90); d.z=cz+rand(-90,90); }
   const tx=wind.x*.012*len, tz=wind.z*.012*len;
   wfxRP[o]=d.x; wfxRP[o+1]=d.y; wfxRP[o+2]=d.z; wfxRP[o+3]=d.x-tx; wfxRP[o+4]=d.y+len; wfxRP[o+5]=d.z-tz; }
  wfxRainG.attributes.position.needsUpdate=true; wfxRain.material.uniforms.op.value=.3+.35*S; }
 // flakes
 const F=WTH_FLK[T.p], flOn=on&&!!F&&S>0; wfxFl.m.visible=flOn;
 if(flOn){ const n=Math.min(wfxFl.n,(400+1700*S*(T.rate||1)/1.5)|0), cx=WTH.center.x*.5+cp.x*.5, cz=WTH.center.z*.5+cp.z*.5;
  wfxFl.m.material.blending=F.glow?THREE.AdditiveBlending:THREE.NormalBlending;
  for(let i=0;i<n;i++){ const d=wfxFl.list[i];
   d.y+=F.vy*d.v*dt; d.x+=(wind.x+Math.sin(WTH.t*1.3+d.ph)*F.sway)*dt; d.z+=(wind.z+Math.cos(WTH.t*1.1+d.ph)*F.sway)*dt;
   if(d.y<0) d.y+=90; if(d.y>90) d.y-=90; if(d.x-cx>60) d.x-=120; if(d.x-cx<-60) d.x+=120; if(d.z-cz>60) d.z-=120; if(d.z-cz<-60) d.z+=120;
   wfxFl.P[i*3]=d.x; wfxFl.P[i*3+1]=F.rise?(d.y*.25):d.y; wfxFl.P[i*3+2]=d.z; wfxFl.S[i]=F.s*(F.glow?(.7+.5*Math.sin(WTH.t*6+d.ph)):1);
   wfxFl.C[i*3]=F.c[0]; wfxFl.C[i*3+1]=F.c[1]; wfxFl.C[i*3+2]=F.c[2]; wfxFl.A[i]=F.rise?.22:(.75+.25*S); }
  wfxFl.m.geometry.setDrawRange(0,n); wfxDirty(wfxFl); }
 // mist: fog bank (dark, lit by neon) or neon haze (glowing)
 const mOn=on&&T.mist&&S>0; wfxMist.m.visible=!!mOn;
 if(mOn){ const glow=T.mist===2; wfxMist.m.material.blending=glow?THREE.AdditiveBlending:THREE.NormalBlending; const cx=WTH.center.x, cz=WTH.center.z;
  wfxMist.list.forEach((d,i)=>{ d.x+=(wind.x*.3+Math.sin(WTH.t*.2+d.ph)*1.2)*dt; if(d.x-cx>120) d.x-=240; if(d.x-cx<-120) d.x+=240; if(d.z-cz>120) d.z-=240; if(d.z-cz<-120) d.z+=240;
   wfxMist.P[i*3]=d.x; wfxMist.P[i*3+1]=d.y; wfxMist.P[i*3+2]=d.z; wfxMist.S[i]=d.s; const k=glow?.55:.3; wfxMist.C[i*3]=k; wfxMist.C[i*3+1]=k; wfxMist.C[i*3+2]=k*1.1; wfxMist.A[i]=(glow?.07:.2)*(.5+S); });
  wfxDirty(wfxMist); }
 // splashes + FX particles
 wfxStep(wfxSpl,dt); wfxStep(wfxFxP,dt); wfxStep(wfxSmoke,dt);
 // wind pushes projectiles and debris (typhoon, sandstorm, blizzard)
 if(on&&T.wind&&DIS.windK>0){ const k=T.push?1:.35; for(const pr of projs){ if(pr.vel) pr.vel.addScaledVector(wind,dt*.5*k); } for(const c of chunks){ if(c.life>0) c.v.addScaledVector(wind,dt*.8*k); } for(const d of dusts){ if(d.life>0) d.v.addScaledVector(wind,dt*.6); } }
 // lightning strikes
 if(on&&T.bolts&&game.state==='fight'){ WTH.boltT-=dt; if(WTH.boltT<=0){ WTH.boltT=rand(4,9)/(.5+S); wfxBolt(T.bolts===2); } }
 for(let i=wfxBolts.length-1;i>=0;i--){ const b=wfxBolts[i]; b.life-=dt; b.grp.children.forEach(m=>m.material.opacity=Math.max(0,b.life/.3)*(Math.random()<.3?.4:1)); if(b.life<=0){ scene.remove(b.grp); b.grp.children.forEach(m=>{ m.geometry.dispose(); m.material.dispose(); }); wfxBolts.splice(i,1); } }
 wfxBoltL.intensity=Math.max(0,wfxBoltL.intensity-dt*28);
 wfxRefUpdate(on&&(T.wet||T.icy)?(T.icy?.6:1)*(.4+.6*S):0);
 wfxTrails(dt); wfxCircles(dt); }

/* sky + fog colour per weather and time of day, applied after the game's own lightning flash (default night untouched) */
{ const oL=lightning; lightning=function(dt){ oL(dt); if(!WTH.on||game.mode!=='match') return; const T=WTH_TYPES[WTH.cur]||{}, D=WTH_TOD[WTH.tod], f=flash>0?flash*.5:0;
  if(!T.sky&&!T.fogCol&&!D){ if(WTH._tint){ WTH._tint=0; if(!MAP.lightning){ scene.background.copy(SKY); scene.fog.color.setHex(MAP.fog); } } return; } WTH._tint=1;
  const sky=new THREE.Color(T.sky!=null?T.sky:MAP.sky), fog=new THREE.Color(T.fogCol!=null?T.fogCol:MAP.fog);
  if(D){ sky.lerp(new THREE.Color(D.sky),D.k); fog.lerp(new THREE.Color(D.fog),D.k); }
  scene.background.copy(sky).offsetHSL(0,0,f*.12); scene.fog.color.copy(fog).offsetHSL(0,0,f*.1); }; }
{ const oF=updateFX; updateFX=function(dt){ oF(dt); try{ wfxUpdate(dt); }catch(e){ if(!WTH._err){ WTH._err=1; console.warn('weather',e); } } }; }
// the old flat lens layer: off unless ⚙ OLD LENS OVERLAY is on; the Chopper 7 news cam keeps its own TV lens
{ const oW=wxDraw; wxDraw=function(dt){ if(WTH.lens||!WTH.on) return oW(dt); if(WX._cl!==1){ wxG.clearRect(0,0,wxCv.width,wxCv.height); WX._cl=1; WX.drops.length=0; WX.trails.length=0; }
  const pipOn=!el('pipBox').classList.contains('hidden'); if(pipOn) wxPip(dt,(WTH_TYPES[WTH.cur]||{}).p==='rain'?'rain':'none',WTH.str); };
  const oT=wxTarget; wxTarget=function(){ return WTH.lens?oT():0; }; }

/* ---------- fight effects: footing, element boosts ---------- */
{ const oUp=FP.update; FP.update=function(dt,inp,opp){ const T=WTH_TYPES[WTH.cur]||{};
  if(!WTH.on||!T.slow||!inp||game.mode!=='match') return oUp.call(this,dt,inp,opp);
  const mx=inp.mx, mz=inp.mz, k=1-(1-T.slow)*(.5+WTH.str*.8); inp.mx=(mx||0)*k; inp.mz=(mz||0)*k; const r=oUp.call(this,dt,inp,opp); inp.mx=mx; inp.mz=mz; return r; }; }
{ const oTH=FP.takeHit; FP.takeHit=function(src,dmg,kb,launch,cont,dir){ const T=WTH_TYPES[WTH.cur]||{};
  if(WTH.on&&T.el&&src&&src.def&&game.mode==='match'){ const m=T.el[wfxEl(src)]; if(m) dmg*=m; }
  const hp0=this.hp, r=oTH.call(this,src,dmg,kb,launch,cont,dir), lost=hp0-this.hp;
  if(WTH.fx&&lost>0&&src&&src.def&&!cont) try{ fxkHit(wfxEl(src),this.chest(),Math.min(2,.5+lost/40)); }catch(_){}
  return r; }; }

/* =====================================================================
   FX KIT: element hit sets, beam cores, sword trails, spell circles
   ===================================================================== */
const FXK={};
function fxkHit(el,p,k){ const c=WTH_EL[el]||0xffffff, col=new THREE.Color(c), t=[col.r*1.4,col.g*1.4,col.b*1.4].map(v=>-Math.max(.05,v));   // negative tint = unlit glow
 k=k||1; burst(p.clone(),c,(6+8*k)|0,18+10*k); if(typeof impact==='function') impact(p.clone(),c,4*k);
 const n=(10+14*k)|0, E=(v,l,s,g,a)=>wfxEmit(wfxFxP,p.clone().add(V(rand(-1.5,1.5),rand(-1.5,1.5),rand(-1.5,1.5))),v,l,s,t,a==null?1:a,g);
 if(el==='fire'){ for(let i=0;i<n;i++){ const o=E(V(rand(-6,6),rand(4,14),rand(-6,6)),rand(.4,.9),rand(.5,1.1)*k,-6); o.drag=2; } for(let i=0;i<4;i++){ const o=wfxEmit(wfxSmoke,p.clone(),V(rand(-2,2),rand(3,6),rand(-2,2)),rand(1,1.6),rand(2,3)*k,[.25,.22,.22],.45,-2); o.grow=3; } }
 else if(el==='water'){ for(let i=0;i<n;i++) E(V(rand(-12,12),rand(4,16),rand(-12,12)),rand(.4,.8),rand(.35,.7)*k,40); ring(p.x,Math.max(.3,p.y-4),p.z,7*k,c,.4); }
 else if(el==='ice'){ for(let i=0;i<n;i++){ const o=E(V(rand(-14,14),rand(-2,10),rand(-14,14)),rand(.3,.6),rand(.3,.6)*k,22); o.drag=1; } }
 else if(el==='lightning'){ fxkArc(p,c,k); for(let i=0;i<n;i++) E(V(rand(-20,20),rand(-6,16),rand(-20,20)),rand(.1,.25),rand(.25,.45)*k,0); }
 else if(el==='grass'){ for(let i=0;i<n;i++){ const o=E(V(rand(-7,7),rand(3,9),rand(-7,7)),rand(.8,1.4),rand(.4,.7)*k,6); o.drag=1.5; } }
 else if(el==='dark'){ for(let i=0;i<6;i++){ const o=wfxEmit(wfxSmoke,p.clone().add(V(rand(-2,2),rand(-2,2),rand(-2,2))),V(rand(-3,3),rand(-1,3),rand(-3,3)),rand(.8,1.3),rand(2,3.5)*k,[.12,.04,.2],.75,0); o.grow=4; o.drag=1.2; } for(let i=0;i<n/2;i++) E(V(rand(-5,5),rand(-5,5),rand(-5,5)),rand(.4,.7),rand(.4,.7)*k,0); }
 else { for(let i=0;i<3;i++) setTimeout(()=>ring(p.x,p.y,p.z,(5+i*3)*k,c,.35),i*70); for(let i=0;i<n/2;i++) E(V(rand(-16,16),rand(-8,8),rand(-16,16)),rand(.15,.3),rand(.2,.4),0); } }
function fxkArc(p,c,k){ const grp=new THREE.Group(); for(let j=0;j<3;j++){ const pts=[p.clone()]; let q=p.clone(); for(let i=0;i<6;i++){ q=q.clone().add(V(rand(-3,3),rand(-3,3),rand(-3,3)).multiplyScalar(k)); pts.push(q); }
  grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:c,transparent:true,toneMapped:false}))); }
 scene.add(grp); wfxBolts.push({grp,life:.2}); }
// beam core: a glowing cylinder with a white centre, for beams and the T051 beam clash (FXK.beam(from,to,el,life))
FXK.beam=function(a,b,el,life){ const c=WTH_EL[el]||0xffffff, len=a.distanceTo(b), grp=new THREE.Group();
 [[2.4,.35,c],[1,.9,0xffffff]].forEach(([r,o,col])=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,10,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false})); grp.add(m); });
 grp.position.copy(a).lerp(b,.5); grp.lookAt(b); grp.children.forEach(m=>m.rotation.x=Math.PI/2); scene.add(grp); const L=life||.6; wfxBolts.push({grp,life:L});
 burst(b.clone(),c,12,24); return grp; };
// sword trails: a ribbon behind the blade while a sword move swings
const wfxTr=new Map();
function wfxTrails(dt){ for(const f of [game.p,game.e]){ if(!f) continue; let T=wfxTr.get(f);
  const sw=WTH.on&&WTH.trails&&f.atk&&!f.hidden&&typeof labLimbFor==='function'&&labLimbFor(f,f.atk.id)==='sword'&&f.v8&&f.v8.swordTip;
  if(!T){ const g=new THREE.BufferGeometry(), P=new Float32Array(24*3), A=new Float32Array(24); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('al',new THREE.BufferAttribute(A,1));
   const idx=[]; for(let i=0;i<11;i++){ const a=i*2; idx.push(a,a+1,a+2,a+1,a+3,a+2); } g.setIndex(idx);
   const m=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(WTH_EL[wfxEl(f)])}},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
    vertexShader:'attribute float al; varying float va; void main(){ va=al; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'uniform vec3 c; varying float va; void main(){ gl_FragColor=vec4(mix(c,vec3(1.0),va*.5)*1.6,va*.8); }'}));
   m.frustumCulled=false; m.visible=false; scene.add(m); T={m,s:[]}; wfxTr.set(f,T); }
  if(sw){ const b=V(), t=V(); f.v8.swordBase.getWorldPosition(b); f.v8.swordTip.getWorldPosition(t); T.s.unshift([b,t]); if(T.s.length>12) T.s.length=12; T.m.material.uniforms.c.value.setHex(WTH_EL[wfxEl(f)]); }
  else if(T.s.length) T.s.pop();
  if(T.s.length<2){ T.m.visible=false; continue; }
  const P=T.m.geometry.attributes.position.array, A=T.m.geometry.attributes.al.array, n=T.s.length;
  for(let i=0;i<12;i++){ const s=T.s[Math.min(i,n-1)], q=i<n?1-i/n:0; P[i*6]=s[0].x; P[i*6+1]=s[0].y; P[i*6+2]=s[0].z; P[i*6+3]=s[1].x; P[i*6+4]=s[1].y; P[i*6+5]=s[1].z; A[i*2]=q*.15; A[i*2+1]=q; }
  T.m.geometry.attributes.position.needsUpdate=T.m.geometry.attributes.al.needsUpdate=true; T.m.visible=true; } }
// spell circles: a turning rune ring under a titan when an ultimate or super starts
const wfxRuneTex={}; function wfxRune(el){ if(wfxRuneTex[el]) return wfxRuneTex[el]; const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d'), col='#'+new THREE.Color(WTH_EL[el]).getHexString();
 g.strokeStyle=col; g.fillStyle=col; g.shadowColor=col; g.shadowBlur=8; g.lineWidth=4; g.translate(128,128);
 [118,96,60].forEach((r,i)=>{ g.lineWidth=i===1?2:4; g.beginPath(); g.arc(0,0,r,0,7); g.stroke(); });
 const G='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'; g.font='bold 18px serif'; g.textAlign='center'; g.textBaseline='middle';
 for(let i=0;i<20;i++){ const a=i/20*Math.PI*2; g.save(); g.rotate(a); g.fillText(G[(i*7+el.length)%G.length],0,-107); g.restore(); }
 g.beginPath(); for(let i=0;i<=6;i++){ const a=i*4/6*Math.PI*2-Math.PI/2; const x=Math.cos(a)*92, y=Math.sin(a)*92; i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke();   // star
 return wfxRuneTex[el]=new THREE.CanvasTexture(c); }
const wfxCirc=[];
function fxkCircle(f,el,life){ const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:wfxRune(el),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
 m.rotation.x=-Math.PI/2; const s=(f.radius?f.radius():5)*4.2; m.scale.set(s,s,1); m.position.set(f.pos.x,.2,f.pos.z); scene.add(m); wfxCirc.push({m,f,life:life||1.8,max:life||1.8}); }
function wfxCircles(dt){ for(let i=wfxCirc.length-1;i>=0;i--){ const c=wfxCirc[i]; c.life-=dt; const q=c.life/c.max; c.m.material.opacity=Math.min(1,(1-q)*6)*Math.min(1,q*3)*.9; c.m.rotation.z+=dt*1.4;
  c.m.position.set(c.f.pos.x,.2+Math.max(0,c.f.pos.y)*0,c.f.pos.z); if(c.life<=0){ scene.remove(c.m); c.m.geometry.dispose(); c.m.material.dispose(); wfxCirc.splice(i,1); } } }
{ const oS=FP.startAtk; FP.startAtk=function(id){ const r=oS.apply(this,arguments);
  try{ if(WTH.fx&&WTH.circles&&this.atk&&(id==='ultimate'||id==='super'||/spell|hex|rune|magic/i.test(String(id)))) fxkCircle(this,wfxEl(this),id==='ultimate'?2.6:1.6); }catch(_){}
  return r; }; }
FXK.hit=fxkHit; FXK.circle=fxkCircle; FXK.arc=fxkArc;

/* =====================================================================
   NEON BLOOM: the game's render, through r128's UnrealBloomPass (half resolution, quarter on phones).
   The scene pass writes the same sRGB colours the screen gets, so with the glow off the picture is unchanged.
   ===================================================================== */
const WBL={comp:null,bloom:null,w:0,h:0};
function wblMake(){ if(!THREE.EffectComposer||!THREE.UnrealBloomPass) return null; const W=innerWidth, H=innerHeight, pr=renderer.getPixelRatio();
 const rt=renderer.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget?new THREE.WebGLMultisampleRenderTarget(W*pr,H*pr,{format:THREE.RGBAFormat}):undefined; if(rt) rt.samples=4;
 const base=rt||new THREE.WebGLRenderTarget(W*pr,H*pr,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat}); base.texture.encoding=THREE.sRGBEncoding;   // same output as the screen (sky clear colour included)
 const c=new THREE.EffectComposer(renderer,base); c.addPass(new THREE.RenderPass(scene,camera));
 const k=isTouch?.25:.5, b=new THREE.UnrealBloomPass(new THREE.Vector2(W*k,H*k),.45,.35,.86); c.addPass(b); c.addPass(new THREE.ShaderPass(THREE.CopyShader));   // plain copy to the screen (no second tone map)
 WBL.comp=c; WBL.bloom=b; WBL.w=W; WBL.h=H; return c; }
{ const oR=render; render=function(){ const split=game.mode==='match'&&game.vs2&&game.state!=='over'&&!(typeof shared==='function'&&shared());
  if(!WTH.bloom||split) return oR();
  try{ if(!WBL.comp||WBL.w!==innerWidth||WBL.h!==innerHeight){ if(WBL.comp){ WBL.comp.renderTarget1.dispose(); WBL.comp.renderTarget2.dispose(); } WBL.comp=null; if(!wblMake()) return oR(); }
   WBL.comp.passes[0].camera=camera; WBL.bloom.strength=.45+.5*Math.max(flash||0,wfxBoltL.intensity/7)*.6+((WTH_TYPES[WTH.cur]||{}).mist===2?.25:0);
   renderer.shadowMap.needsUpdate=true; applyFade(0); WBL.comp.render(); }
  catch(e){ if(!WBL._err){ WBL._err=1; console.warn('bloom off',e); } WTH.bloom=false; oR(); } }; }

/* =====================================================================
   ⚙ menu: WEATHER + FX (SANDBOX 28)
   ===================================================================== */
const WTH_SW=[['3D WEATHER','on'],['SPLASHES','splash'],['WET ROADS','wet'],['BLOOM','bloom'],['FX KIT','fx'],['SWORD TRAILS','trails'],['SPELL CIRCLES','circles'],['OLD LENS OVERLAY','lens']];
function wfxUI(){ const m=el('sbMenu'); if(!m||m.querySelector('[data-wfx]')) return; const kit=el('sbKit'); if(!kit) return;
 const d=document.createElement('div'); d.className='sec'; d.dataset.wfx='sec';
 d.innerHTML=`<div class="lbl">WEATHER + FX (NEW · SANDBOX 28) — weather now falls in the 3D city, lit by the neon</div>
 <div class="row">${WTH_ORDER.map(k=>`<button data-wfx="k:${k}">${WTH_TYPES[k].n}</button>`).join('')}</div>
 <div class="lbl" style="margin-top:6px">EACH ROUND</div><div class="row">${[['fixed','FIXED'],['round','ROUND BY ROUND'],['random','RANDOM'],['kaiju','KAIJU WEATHER']].map(c=>`<button data-wfx="m:${c[0]}">${c[1]}</button>`).join('')}</div>
 <div class="lbl" style="margin-top:6px">TIME OF DAY</div><div class="row">${['night','dusk','dawn'].map(t=>`<button data-wfx="t:${t}">${t.toUpperCase()}</button>`).join('')}</div>
 <div class="lbl" style="margin-top:6px">STRENGTH <span data-wfxv></span></div><input data-wfx="str" type="range" min="0" max="100" step="5" style="width:100%">
 <div class="row" style="margin-top:6px">${WTH_SW.map((c,i)=>`<button data-wfx="s:${i}">${c[0]}</button>`).join('')}</div>
 <div class="lbl" style="margin-top:6px">FX KIT TEST (in front of you)</div><div class="row">${Object.keys(WTH_EL).map(e=>`<button data-wfx="x:${e}">${e.toUpperCase()}</button>`).join('')}<button data-wfx="x:beam">BEAM</button><button data-wfx="x:circle">SPELL CIRCLE</button><button data-wfx="x:bolt">LIGHTNING</button></div>`;
 kit.closest('.sec').parentNode.insertBefore(d,kit.closest('.sec'));
 d.querySelector('input').addEventListener('input',e=>{ WTH.str=e.target.value/100; wfxApply(WTH.cur||WTH.kind); wfxSync(); });
 d.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation(); const [t,v]=b.dataset.wfx.split(':');
  if(t==='k'){ WTH.kind=v; WTH.mode='fixed'; WTH.on=true; wfxApply(v); toast('WEATHER: '+WTH_TYPES[v].n,'#7fd4ff',900); }
  else if(t==='m'){ WTH.mode=v; wfxApply(wfxPick()); toast('WEATHER: '+b.textContent+' · now '+WTH_TYPES[WTH.cur].n,'#7fd4ff',1100); }
  else if(t==='t'){ WTH.tod=v; toast('TIME OF DAY: '+v.toUpperCase(),'#7fd4ff',800); }
  else if(t==='s'){ const c=WTH_SW[+v]; WTH[c[1]]=!WTH[c[1]]; if(c[1]==='on'||c[1]==='wet') wfxApply(WTH.cur||WTH.kind); if(c[1]==='lens'){ WX._cl=0; } toast(c[0]+': '+(WTH[c[1]]?'ON':'OFF'),'#7fd4ff',800); }
  else if(t==='x') wfxTest(v);
  wfxSync(); }); }
function wfxTest(v){ const p=game.p; if(!p) return; const fw=V(Math.sin(p.yaw||0),0,Math.cos(p.yaw||0)), at=p.chest().addScaledVector(fw,14);
 if(v==='beam') FXK.beam(p.chest().addScaledVector(fw,4),at.clone().addScaledVector(fw,40),wfxEl(p),.8);
 else if(v==='circle') fxkCircle(p,wfxEl(p),2.4);
 else if(v==='bolt') wfxBolt(false);
 else fxkHit(v,at,1.4); }
function wfxSync(){ document.querySelectorAll('#sbMenu [data-wfx]').forEach(b=>{ const [t,v]=String(b.dataset.wfx).split(':');
  if(t==='k') b.classList.toggle('on',WTH.on&&WTH.cur===v); else if(t==='m') b.classList.toggle('on',WTH.mode===v); else if(t==='t') b.classList.toggle('on',WTH.tod===v);
  else if(t==='s') b.classList.toggle('on',!!WTH[WTH_SW[+v][1]]); else if(t==='str') b.value=Math.round(WTH.str*100); });
 const s=document.querySelector('#sbMenu [data-wfxv]'); if(s) s.textContent=Math.round(WTH.str*100)+'%'; }
{ const oS=sbStart; sbStart=function(){ oS(); wfxUI(); wfxSync(); }; }
{ const oS=sbSync; sbSync=function(){ oS(); wfxUI(); wfxSync(); }; }
