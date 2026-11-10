import re,os
d=os.path.dirname(os.path.abspath(__file__))
core=open(d+'/forge-core.js').read()
page=open(d+'/page.html').read()
tag='<script type="module" src="forge-core.js"></script>'
# live page (index.html): unchanged behaviour
h=page.replace(tag,'<script type="module">\n'+core+'\n</script>')
# Nov 9 2026 (2.0 round 1): MajorasPride said to build straight into the real page, so index.html is now the SAME build as test.html (written at the end).
# The old live page (no V3) is kept in archive/index-live-before-2.0-nov9.html; `h` above is that old layout build, no longer written.
# test page (test.html): + 🔌 V3 (plugs, kits, new skeletons, ooze...) — window.MF_V3, extra part files, forge-v3.js after the core
V3_FILES=['parts/kit-helpers.js','parts/kit-heads.js','parts/kit-limbs.js','parts/kit-wings.js','parts/kit-creatures.js','parts/kit-lowpoly.js','parts/kit-elementals.js','parts/kit-sea.js','parts/kit-croc.js','skeletons-v3.js']
v3=open(d+'/forge-v3.js').read()
mm=open(d+'/forge-m.js').read()   # 📱 phone layout, radial wheels, Studio button, Mark tool (test page only)
extra='\n'.join('<script src="%s"></script>'%f for f in V3_FILES if os.path.exists(os.path.join(d,f)))
t=page.replace('<script>window.MF_V2 = 1;</script>','<script>window.MF_V2 = 1; window.MF_V3 = 1; window.MF_M = 1;</script>')
t=t.replace('<script src="starters.js"></script>','<script src="starters.js"></script>\n'+extra)
t=t.replace(tag,'<script type="module">\n'+core+'\n'+v3+'\n'+mm+'\n</script>')
open(d+'/test.html','w').write(t); print('built test.html (V3)',len(t))
open(d+'/index.html','w').write(t); print('built index.html (same as test.html)',len(t))
