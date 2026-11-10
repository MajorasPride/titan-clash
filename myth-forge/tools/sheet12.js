const sharp=require('/opt/npm-tools/node_modules/sharp'),fs=require('fs');
(async()=>{const d=process.argv[2];const ks=[...new Set(fs.readdirSync(d).filter(f=>/-a\.png$/.test(f)).map(f=>f.slice(0,-6)))];const T=300,PER=15;let n=0;
for(let i=0;i<ks.length;i+=PER){const grp=ks.slice(i,i+PER);const comp=[];
 for(let j=0;j<grp.length;j++){const k=grp[j];const col=j%5,row=(j/5)|0;const f=`${d}/${k}-a.png`;const m=await sharp(f).metadata();const s=Math.min(m.width,m.height);
  comp.push({input:await sharp(f).extract({left:((m.width-s)/2)|0,top:((m.height-s)/2)|0,width:s,height:s}).resize(T,T).toBuffer(),left:col*T,top:row*T});
  comp.push({input:Buffer.from(`<svg width="${T}" height="24"><rect width="${T}" height="24" fill="#000a"/><text x="5" y="18" font-size="16" fill="#fd0" font-family="sans-serif">${k}</text></svg>`),left:col*T,top:row*T});}
 await sharp({create:{width:5*T,height:3*T,channels:3,background:'#111'}}).composite(comp).png().toFile(`${d}/all-${n++}.png`);}
console.log(n,'sheets',ks.length);})();
