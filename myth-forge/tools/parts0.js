// like parts.js but for core part files (K only)
const T=require('three');global.window={};const src=f=>require('fs').readFileSync('/home/claude/titan-clash/myth-forge/'+f,'utf8');
eval(src('k-helpers.js')+';global.makeK=makeK;');const K=makeK(T);K.D=Math.PI/180;(0,eval)(src('parts/kit-helpers.js'));
for(const f of process.argv.slice(2)){window.FORGE_PARTS=[];(0,eval)(src(f));for(const fac of window.FORGE_PARTS){const list=fac(T,K);let n=0;for(const e of list){try{const ps=e.make({});for(const p of ps){const a=p.geo.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){console.log(e.id,'NaN');break;}}n++;}catch(x){console.log(e.id,'MAKE ERR',x.message);}}console.log(f,'ok',n,'of',list.length);}}
