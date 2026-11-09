/* Titan Clash Studio · shared library on this device (IndexedDB).
   art    = drawings saved from the Sketch Pad (transparent PNG), used by FX Lab and Stage
   models = builds saved from the Build Lab (as .glb), used by Stage */
const StudioLib={db:null,
 open(){return this.db||(this.db=new Promise((res,rej)=>{try{const r=indexedDB.open('titan-studio',1);r.onupgradeneeded=()=>{const d=r.result;['art','models'].forEach(n=>{if(!d.objectStoreNames.contains(n))d.createObjectStore(n,{keyPath:'id'})})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}}))},
 async tx(store,mode,fn){const db=await this.open();return new Promise((res,rej)=>{const t=db.transaction(store,mode),s=t.objectStore(store);let out;const q=fn(s);if(q)q.onsuccess=()=>{out=q.result};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)})},
 put(store,obj){obj.at=obj.at||Date.now();return this.tx(store,'readwrite',s=>s.put(obj))},
 get(store,id){return this.tx(store,'readonly',s=>s.get(id))},
 all(store){return this.tx(store,'readonly',s=>s.getAll()).then(a=>(a||[]).sort((x,y)=>(y.at||0)-(x.at||0)))},
 del(store,id){return this.tx(store,'readwrite',s=>s.delete(id))}
};
