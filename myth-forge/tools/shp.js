const H=require('./lib');
(async()=>{const {page,errs,close}=await H.open('pcs');
const r=await page.evaluate(()=>{const A=window.__v3,out={};window.__fresh('none');let n0=A.P().parts.length;A.addPart('bs_torus',null,[1.5,0,0],[0,0,0],1);out.ringNoSkel=A.P().parts.length-n0;
 window.__fresh('biped');n0=A.P().parts.length;const arm=A.P().bones.find(b=>/upperarm\.L|armU/.test(b[0]+b[4]))[0];A.addPart('bs_torus',arm,[0,0,0],[0,0,0],1);out.ringOnArm=A.P().parts.length-n0;out.arm=arm;
 document.getElementById('bMirrorAdd').click();n0=A.P().parts.length;A.addPart('bs_cube',arm,[0,0,0],[0,0,0],1);out.cubeMirrorOn=A.P().parts.length-n0;document.getElementById('bMirrorAdd').click();return out;});
console.log(JSON.stringify(r),errs);
// picture of the new shapes
await page.evaluate(()=>{const A=window.__v3,L=window.__dbg().LIB;window.__fresh('none');const ids=Object.keys(L).filter(k=>/^bs_/.test(k)&&/Hard shapes|Flats/.test(L[k].sub));ids.forEach((id,i)=>{A.addPart(id,null,[(i%8-3.5)*3.4,0,((i/8|0)-2)*4],[0,0,0],1);});A.nb();
 const st=document.createElement('style');st.textContent='#sheet,#vtools,#mbar,#tip,#outliner,#fwin{display:none!important}';document.head.appendChild(st);A.look(null,[.2,.9,1],1.25);window.__frames(3);});
await page.screenshot({path:'shapes.png'});await close();H.stop();})();
