/* =====================================================================
   SANDBOX TEST 11: MORE KINDS OF PAINTED WATER (Nov 6, 2026)
   MajorasPride: "Water is cool af, but add a little more different ones."
   New painted pieces (same ink outline + woodblock style):
   - WHIRL: a spiral whirlpool (geyser, rising slash, ground rings)
   - SPRAY: an arc of droplets flung sideways (punches, sweeps, dashes)
   - FOAM: a bubbly foam burst (hits, landings)
   - CREST: a long breaking wave line (hook, flash cuts, crash)
   - RIPPLE: flat painted ripples on the ground (footsteps of big moves)
   Hits now pick a random mix, so no two hits look the same.
   ===================================================================== */
function drawWhirl(x){ const c=128; x.lineWidth=12; for(let k=0;k<2;k++){ x.beginPath(); for(let i=0;i<=120;i++){ const a=i/120*Math.PI*4+k*Math.PI, r=10+i*.85; x.lineTo(c+Math.cos(a)*r,c+Math.sin(a)*r); }
  x.strokeStyle='#0b0f1e'; x.lineWidth=16; x.stroke(); x.strokeStyle=k?'#7fd8ff':'#2f8ff0'; x.lineWidth=9; x.stroke(); }
 x.beginPath(); x.arc(c,c,12,0,7); x.fillStyle='#fff'; x.fill(); x.lineWidth=4; x.strokeStyle='#0b0f1e'; x.stroke(); }
function drawSpray(x){ for(let i=0;i<11;i++){ const t=i/10, px=30+t*200, py=200-Math.sin(t*Math.PI)*150, r=6+Math.sin(t*Math.PI)*12;
  x.beginPath(); x.arc(px,py,r,0,7); x.fillStyle=i%3?'#7fd8ff':'#ffffff'; x.fill(); x.lineWidth=4; x.strokeStyle='#0b0f1e'; x.stroke(); }
 x.beginPath(); x.moveTo(30,200); x.quadraticCurveTo(128,0,230,200); x.strokeStyle='#2f8ff0'; x.lineWidth=5; x.setLineDash([10,14]); x.stroke(); x.setLineDash([]); }
function drawFoam(x){ const pts=[[128,128,34],[80,100,22],[176,96,24],[90,170,20],[170,168,26],[128,64,18],[128,196,16],[52,140,12],[206,134,13],[66,62,9],[196,58,10]];
 for(const [px,py,r] of pts){ x.beginPath(); x.arc(px,py,r,0,7); x.fillStyle='#ffffff'; x.fill(); x.lineWidth=5; x.strokeStyle='#0b0f1e'; x.stroke();
  x.beginPath(); x.arc(px-r*.3,py-r*.3,r*.3,0,7); x.fillStyle='#bfeeff'; x.fill(); } }
function drawCrest(x){ x.beginPath(); x.moveTo(6,200); for(let i=0;i<=5;i++){ const bx=6+i*48; x.bezierCurveTo(bx+10,150,bx+30,120,bx+44,150); x.bezierCurveTo(bx+40,170,bx+30,166,bx+34,156); }
 x.lineTo(250,230); x.lineTo(6,230); x.closePath(); x.fillStyle=wfxBlue(x,110,230); x.fill(); x.lineWidth=7; x.strokeStyle='#0b0f1e'; x.stroke();
 x.strokeStyle='#ffffff'; x.lineWidth=5; x.beginPath(); for(let i=0;i<=5;i++){ const bx=6+i*48; x.moveTo(bx+8,170); x.quadraticCurveTo(bx+22,132,bx+40,148); } x.stroke(); }
function drawRipple(x){ const c=128; for(const [r,w,col] of [[110,7,'#2f8ff0'],[78,6,'#7fd8ff'],[46,5,'#ffffff']]){ x.beginPath(); x.arc(c,c,r,0,7); x.strokeStyle='#0b0f1e'; x.lineWidth=w+6; x.stroke(); x.strokeStyle=col; x.lineWidth=w; x.stroke(); } }
{ const o=wfxTex; wfxTex=function(k){ const D={whirl:drawWhirl,spray:drawSpray,sprayM:x=>{ x.translate(256,0); x.scale(-1,1); drawSpray(x); },foam:drawFoam,crest:drawCrest,ripple:drawRipple}[k];
  if(!D) return o(k); if(!WFX.tex[k]) WFX.tex[k]=wfxCanvas(D); return WFX.tex[k]; }; }
// flat ground pieces can use any texture now
function wfxFlat(k,x,z,r,life,y,spin){ const m=new THREE.MeshBasicMaterial({map:wfxTex(k),transparent:true,depthWrite:false,fog:false,toneMapped:false,side:THREE.DoubleSide});
 const g=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m); g.rotation.x=-Math.PI/2; g.position.set(x,(y||0)+.45,z); g.scale.setScalar(r*.3); g.renderOrder=4; scene.add(g);
 WFX.list.push({o:g,m,t:0,life,size:r,grow:1,ring:1,geo:g.geometry}); if(spin) WFX.list[WFX.list.length-1].rspin=spin; }
{ const o=wfxTick; wfxTick=function(dt){ for(const E of WFX.list) if(E.rspin) E.o.rotation.z+=E.rspin*dt; o(dt); }; }

/* hits: a random mix every time */
{ const o=wfxHit; wfxHit=function(at,size){ const r=Math.random(); size*=1.6;
  if(r<.33){ wfxSprite('foam',at,size*.8,.4,{grow:.7,top:1}); wfxSprite(Math.random()<.5?'spray':'sprayM',at.clone().add(V(0,size*.2,0)),size,.4,{grow:.5,top:1}); }
  else if(r<.66){ wfxSprite('splash',at,size*.9,.38,{grow:.8,rot:rand(0,6),top:1}); wfxSprite('crest',at.clone().add(V(0,-size*.2,0)),size*1.1,.45,{grow:.4,top:1}); }
  else o(at,size/1.6); }; }
/* extra layers on the big moves */
const WMORE={
 thook(f,a){ if(once(a,'wm',a.hitAt*.8)){ const c=f.chest().addScaledVector(V(Math.sin(f.yaw),0,Math.cos(f.yaw)),10*f.scale); wfxSprite('crest',c,20*f.scale,.5,{grow:.4}); } },
 bsweep(f,a){ if(once(a,'wm',.4*a.dur)){ wfxFlat('ripple',f.pos.x,f.pos.z,16*f.scale,.6); for(let i=0;i<3;i++){ const g=f.yaw+i*2.1; wfxSprite(i%2?'spray':'sprayM',V(f.pos.x+Math.sin(g)*10,3,f.pos.z+Math.cos(g)*10),12,.45,{grow:.5}); } } },
 geyser(f,a){ if(once(a,'wm',a.hitAt)){ const x=f.pos.x+Math.sin(f.yaw)*9*f.scale, z=f.pos.z+Math.cos(f.yaw)*9*f.scale; wfxFlat('whirl',x,z,14,.8,0,6); wfxSprite('foam',V(x,4,z),14,.5,{grow:.6}); } },
 risingslash(f,a){ if(once(a,'wm',.45*a.dur)) wfxFlat('whirl',f.pos.x+Math.sin(f.yaw)*7,f.pos.z+Math.cos(f.yaw)*7,10,.6,0,-6); },
 bdive(f,a){ if(a.landT!=null&&once(a,'wm',0)){ wfxFlat('ripple',f.pos.x,f.pos.z,34,.9); wfxSprite('foam',f.pos.clone().add(V(0,4,0)),18,.5,{grow:.7}); } },
 swordplunge(f,a){ if(a.landT!=null&&once(a,'wm',0)) wfxFlat('ripple',f.pos.x,f.pos.z,24,.8); },
 bdash(f,a,dt){ if(a.t<.22&&Math.random()<dt*12) wfxSprite(Math.random()<.5?'spray':'sprayM',f.pos.clone().add(V(0,4,0)),9,.35,{grow:.4}); },
 bweave(f,a){ if(once(a,'wm',0)) wfxSprite('foam',f.pos.clone().add(V(0,3,0)),8,.35,{grow:.5}); },
 starpunch(f,a){ if(a._bh&&once(a,'wm',0)){ wfxSprite('crest',f.opp.chest(),28,.6,{grow:.5,top:1}); wfxFlat('whirl',f.opp.pos.x,f.opp.pos.z,20,.8,0,8); } },
 ultimate(f,a){ if(a._cut&&!a.brawl&&once(a,'wm1',1.8)) wfxFlat('whirl',f.opp.pos.x,f.opp.pos.z,26,1,0,5);
  if(a._cut&&!a.brawl&&once(a,'wm2',2.62)) wfxSprite('crest',f.opp.chest().add(V(0,6,0)),40,.8,{grow:.4});
  if(a.brawl&&a.contact!=null&&once(a,'wm3',a.contact+1.45)) wfxFlat('whirl',f.opp.pos.x,f.opp.pos.z,24,1,0,7); },
};
{ const oUA=FP.updateAtk; FP.updateAtk=function(dt){ const a=this.atk; oUA.call(this,dt); if(!a||this.atk!==a||!isV(this)) return; const h=WMORE[a.id]; if(h) try{ h(this,a,dt); }catch(e){ console.error(e); } }; }
