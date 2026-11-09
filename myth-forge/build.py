import re,os
d=os.path.dirname(os.path.abspath(__file__))
h=open(d+'/page.html').read(); core=open(d+'/forge-core.js').read()
h=h.replace('<script type="module" src="forge-core.js"></script>','<script type="module">\n'+core+'\n</script>')
open(d+'/index.html','w').write(h); print('built',len(h))

h2=open(d+'/page-v2.html').read().replace('<script type="module" src="forge-core.js"></script>','<script type="module">\n'+core+'\n</script>')
open(d+'/test.html','w').write(h2); print('built test',len(h2))
