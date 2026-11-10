// node mont.js out.png a.png b.png ... (tiles 550, 3 per row)
const sharp=require('/opt/npm-tools/node_modules/sharp');(async()=>{const [out,...fs_]=process.argv.slice(2);const T=+process.env.T||540,C=+process.env.C||3;const comp=[];
for(let i=0;i<fs_.length;i++){const m=await sharp(fs_[i]).metadata();const s=Math.min(m.width,m.height);comp.push({input:await sharp(fs_[i]).extract({left:((m.width-s)/2)|0,top:((m.height-s)/2)|0,width:s,height:s}).resize(T,T).toBuffer(),left:(i%C)*T,top:((i/C)|0)*T});}
await sharp({create:{width:C*T,height:Math.ceil(fs_.length/C)*T,channels:3,background:'#111'}}).composite(comp).png().toFile(out);})();
