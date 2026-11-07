# Copies tools/v8-src/*.js into the <!-- V8 START --> ... <!-- V8 END --> block of titan-clash.html
import glob,re,os
here=os.path.dirname(os.path.abspath(__file__)); p=os.path.join(here,'..','titan-clash.html'); s=open(p,encoding='utf8').read()
code="\n".join(open(f,encoding='utf8').read() for f in sorted(glob.glob(os.path.join(here,'v8-src','*.js'))))
block="<!-- V8 START -->\n<script>\n'use strict';\n"+code+"\n</script>\n<!-- V8 END -->\n"
s=re.sub(r'<!-- V8 START -->.*?<!-- V8 END -->\n',lambda m:block,s,flags=re.S); open(p,'w',encoding='utf8').write(s); print('ok')
