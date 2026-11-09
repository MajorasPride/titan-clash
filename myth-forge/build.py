import re,os
d=os.path.dirname(os.path.abspath(__file__))
core=open(d+'/forge-core.js').read()
h=open(d+'/page.html').read().replace('<script type="module" src="forge-core.js"></script>','<script type="module">\n'+core+'\n</script>')
open(d+'/index.html','w').write(h); print('built',len(h))
open(d+'/test.html','w').write(h); print('test.html = same page (old test link keeps working)')
