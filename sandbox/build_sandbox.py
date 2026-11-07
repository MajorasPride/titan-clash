# Builds titan-clash-sandbox.html (one standalone file) = the game code (../game) + the sandbox test code in src/.
# The real game file is never changed by this script. Run it after editing tools/sandbox-src/ or the game.
import glob, os
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..', 'game')
s = open(os.path.join(root, 'titan-clash.html'), encoding='utf8').read()

# small hook in the old animation code so new moves can have their own poses (POSES in the sandbox code)
a = "else if(id==='throw'){ const q=Math.min(1,p/.4); k.armR=lerp(-2.9,-1.2,q); k.elR=-.2; k.lean=.2*q; k.twist=-.3*q; }"
assert s.count(a) == 1, 'pose hook anchor not found'
if 'POSES[id](k,p,e,this,a)' not in s:  # v8.3: the game has this hook itself now
    s = s.replace(a, a + "\n   else if(typeof POSES!=='undefined'&&POSES[id]) POSES[id](k,p,e,this,a); // sandbox: per-move poses")

code = "\n".join(open(f, encoding='utf8').read() for f in sorted(glob.glob(os.path.join(here, 'src', '*.js'))))
# sandbox fonts (sandbox/fonts/*.woff2, licenses next to them) packed in as @font-face so the file stays standalone
import base64
fams = {'press-start-2p': 'Press Start 2P', 'permanent-marker': 'Permanent Marker', 'rubik-dirt': 'Rubik Dirt'}
faces = ''
for k, fam in fams.items():
    fp = os.path.join(here, 'fonts', k + '-latin-400-normal.woff2')
    if os.path.exists(fp):
        b64 = base64.b64encode(open(fp, 'rb').read()).decode()
        faces += "@font-face{font-family:'%s';src:url(data:font/woff2;base64,%s) format('woff2');font-display:swap}\n" % (fam, b64)
block = "<!-- SANDBOX START -->\n<style>" + faces + "</style>\n<script>\n'use strict';\n" + code + "\n</script>\n<!-- SANDBOX END -->\n"
anchor = "<!-- V8 END -->\n"
assert s.count(anchor) == 1
s = s.replace(anchor, anchor + block)
s = s.replace("<title>", "<title>SANDBOX · ", 1)
# standalone: one file, nothing else needed. three.js and the font go inside; the Kenney models aren't needed (empty ground)
rd = lambda f: open(os.path.join(root, f), encoding='utf8').read()
for tag, rep in [('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '<script>' + rd('three.min.js') + '</script>'),
                 ('<script src="models/kenney-models.js"></script>', ''),
                 ('<script src="fonts/bangers-font.js"></script>', '<script>' + rd('fonts/bangers-font.js') + '</script>')]:
    assert s.count(tag) == 1, tag
    s = s.replace(tag, rep)
s = s.replace('<script src="fonts/ui-fonts.js"></script>', '')  # v8.3: the game's font file; the sandbox packs its own fonts below
fb = """<script>window.THREE||document.write('<script src="three.min.js"><\\/script>')</script>"""
s = s.replace(fb, '')
notes = open(os.path.join(here, 'SANDBOX.md'), encoding='utf8').read().replace('--', '- -')
s = s.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- ===== TITAN CLASH SANDBOX (standalone). The sandbox test code is between SANDBOX START and SANDBOX END.\n' + notes + '\n===== -->', 1)
open(os.path.join(here, 'titan-clash-sandbox.html'), 'w', encoding='utf8').write(s)
print('ok: sandbox/titan-clash-sandbox.html (one file, runs on its own)')
