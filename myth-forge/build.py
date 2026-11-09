import re,os
d=os.path.dirname(os.path.abspath(__file__))
core=open(d+'/forge-core.js').read()
page=open(d+'/page.html').read()
tag='<script type="module" src="forge-core.js"></script>'
# live page (index.html): unchanged behaviour
h=page.replace(tag,'<script type="module">\n'+core+'\n</script>')
open(d+'/index.html','w').write(h); print('built index.html',len(h))
# test page (test.html): + 🔌 V3 (plugs, kits, new skeletons, ooze...) — window.MF_V3, extra part files, forge-v3.js after the core
V3_FILES=['parts/kit-helpers.js','parts/kit-heads.js','parts/kit-limbs.js','parts/kit-wings.js','parts/kit-creatures.js','parts/kit-lowpoly.js','skeletons-v3.js','starters-v3.js']
v3=open(d+'/forge-v3.js').read()
extra='\n'.join('<script src="%s"></script>'%f for f in V3_FILES if os.path.exists(os.path.join(d,f)))
t=page.replace('<script>window.MF_V2 = 1;</script>','<script>window.MF_V2 = 1; window.MF_V3 = 1;</script>')
t=t.replace('<script src="starters.js"></script>','<script src="starters.js"></script>\n'+extra)
t=t.replace(tag,'<script type="module">\n'+core+'\n'+v3+'\n</script>')
open(d+'/test.html','w').write(t); print('built test.html (V3)',len(t))
