// node sheet.js dir  -> dir/sheet-N.png (6 creatures per sheet, 2 views each)
const sharp=require('/opt/npm-tools/node_modules/sharp'),fs=require('fs');
(async()=>{const d=process.argv[2];const ks=[...new Set(fs.readdirSync(d).filter(f=>/-a\.png$/.test(f)).map(f=>f.slice(0,-6)))];
const order=process.argv[3]?process.argv[3].split(','):ks;const T=400;let n=0;
for(let i=0;i<order.length;i+=6){const grp=order.slice(i,i+6);const comp=[];
 for(let j=0;j<grp.length;j++){const k=grp[j];const col=j%2,row=(j/2)|0;
  for(const [vi,v] of ['a','b'].entries()){const f=`${d}/${k}-${v}.png`;if(!fs.existsSync(f))continue;
   const m=await sharp(f).metadata();const s=Math.min(m.width,m.height);
   const buf=await sharp(f).extract({left:((m.width-s)/2)|0,top:((m.height-s)/2)|0,width:s,height:s}).resize(T,T).toBuffer();
   comp.push({input:buf,left:(col*2+vi)*T,top:row*T});}
  comp.push({input:Buffer.from(`<svg width="${T}" height="30"><rect width="${T}" height="30" fill="#000a"/><text x="6" y="22" font-size="20" fill="#fd0" font-family="sans-serif">${k}</text></svg>`),left:col*2*T,top:row*T});}
 await sharp({create:{width:4*T,height:3*T,channels:3,background:'#111'}}).composite(comp).png().toFile(`${d}/sheet-${n++}.png`);}
console.log(n,'sheets');})();
