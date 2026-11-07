"""Bake selected Kenney GLB models into one JS file the game can load from file://.
Usage: python3 bake.py <mb_glb_dir> <car_glb_dir> <out.js>
Each model -> list of parts {n: name, p: positions, m: normals, u: uvs, i: indices} (base64),
with node transforms already applied. Car wheels are merged into one 'wheels' part.
Colour sheets are stored as raw 128x128 RGBA pixels so the game can build textures synchronously."""
import json, struct, sys, base64, os
import numpy as np
from PIL import Image

MB_DIR, CAR_DIR, OUT = sys.argv[1:4]
PIECES = ['building-window','building-windows','building-windows-sills','building-window-balcony','building-windows-round',
 'building-windows-sills-round','building-window-wide','building-window-wide-sill','building-window-awnings','building-window-large',
 'building-window-sill','building-windows-high-middle','building-door-window','building-window-door-window','building-door',
 'building-corner','building-corner-window','building-corner-window-sill','building-corner-window-narrow',
 'roof-flat-detail-a','roof-flat-detail-b','roof-flat-detail-c','detail-ac-a','detail-ac-b']
CARS = ['sedan','taxi','police','van','suv','hatchback-sports','delivery','truck','ambulance','firetruck','garbage-truck','suv-luxury','sedan-sports']
DEBRIS = ['debris-door','debris-door-window','debris-bumper','debris-tire','debris-plate-a','debris-plate-small-a','debris-spoiler-a']
CT = {5126: ('f4', 4), 5123: ('u2', 2), 5125: ('u4', 4), 5121: ('u1', 1)}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}

def read_glb(path):
    d = open(path, 'rb').read()
    jl = struct.unpack('<I', d[12:16])[0]
    j = json.loads(d[20:20 + jl])
    bo = 20 + jl
    bl = struct.unpack('<I', d[bo:bo + 4])[0]
    return j, d[bo + 8:bo + 8 + bl]

def accessor(j, binb, idx):
    a = j['accessors'][idx]; bv = j['bufferViews'][a['bufferView']]
    dt, sz = CT[a['componentType']]; n = NC[a['type']]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = bv.get('byteStride', 0)
    if stride and stride != sz * n:
        rows = [np.frombuffer(binb, dtype='<' + dt, count=n, offset=off + k * stride) for k in range(a['count'])]
        return np.array(rows)
    arr = np.frombuffer(binb, dtype='<' + dt, count=a['count'] * n, offset=off)
    return arr.reshape(a['count'], n) if n > 1 else arr.copy()

def quat_mat(q):
    x, y, z, w = q
    return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                     [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                     [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])

def node_mat(n):
    M = np.eye(4)
    if 'matrix' in n: return np.array(n['matrix']).reshape(4, 4).T
    R = quat_mat(n.get('rotation', [0, 0, 0, 1])); S = np.diag(n.get('scale', [1, 1, 1]))
    M[:3, :3] = R @ S; M[:3, 3] = n.get('translation', [0, 0, 0]); return M

def bake(path):
    j, binb = read_glb(path); parts = []
    def walk(ni, parent):
        n = j['nodes'][ni]; M = parent @ node_mat(n)
        if 'mesh' in n:
            for prim in j['meshes'][n['mesh']]['primitives']:
                at = prim['attributes']
                p = accessor(j, binb, at['POSITION']).astype(np.float32)
                nm = accessor(j, binb, at['NORMAL']).astype(np.float32)
                uv = accessor(j, binb, at['TEXCOORD_0']).astype(np.float32)
                idx = accessor(j, binb, prim['indices']).astype(np.uint32) if 'indices' in prim else np.arange(len(p), dtype=np.uint32)
                p = (np.c_[p, np.ones(len(p))] @ M.T)[:, :3].astype(np.float32)
                N3 = np.linalg.inv(M[:3, :3]).T; nm = nm @ N3.T; nm /= np.linalg.norm(nm, axis=1, keepdims=True) + 1e-9
                parts.append([n.get('name', ''), p, nm.astype(np.float32), uv, idx])
        for c in n.get('children', []): walk(c, M)
    for r in j['scenes'][j.get('scene', 0)]['nodes']: walk(r, np.eye(4))
    return parts

def merge(parts, name):
    P, Nm, U, I = [], [], [], []; base = 0
    for _, p, nm, uv, idx in parts:
        P.append(p); Nm.append(nm); U.append(uv); I.append(idx + base); base += len(p)
    return [name, np.vstack(P), np.vstack(Nm), np.vstack(U), np.concatenate(I)]

def enc(parts):
    out = []
    for name, p, nm, uv, idx in parts:
        it = idx.astype(np.uint16) if idx.max() < 65535 else idx.astype(np.uint32)
        out.append({'n': name, 'p': base64.b64encode(np.round(p, 4).astype(np.float32).tobytes()).decode(),
                    'm': base64.b64encode(nm.astype(np.float32).tobytes()).decode(),
                    'u': base64.b64encode(uv.astype(np.float32).tobytes()).decode(),
                    'i': base64.b64encode(it.tobytes()).decode(), 'w': 32 if it.dtype == np.uint32 else 16})
    return out

models = {}
for nme in PIECES:
    models[nme] = enc([merge(bake(os.path.join(MB_DIR, nme + '.glb')), 'main')])
for nme in CARS:
    ps = bake(os.path.join(CAR_DIR, nme + '.glb'))
    body = [q for q in ps if not q[0].startswith('wheel')]; wheels = [q for q in ps if q[0].startswith('wheel')]
    models['car:' + nme] = enc([merge(body, 'body')] + ([merge(wheels, 'wheels')] if wheels else []))
for nme in DEBRIS:
    models['deb:' + nme] = enc([merge(bake(os.path.join(CAR_DIR, nme + '.glb')), 'main')])

def sheet(path):
    im = Image.open(path).convert('RGBA').resize((128, 128), Image.NEAREST)
    return base64.b64encode(np.array(im, dtype=np.uint8).tobytes()).decode()

data = {'v': 1, 'size': 128, 'sheet': {'mb': sheet(os.path.join(MB_DIR, 'Textures/colormap.png')),
        'car': sheet(os.path.join(CAR_DIR, 'Textures/colormap.png'))}, 'models': models}
with open(OUT, 'w') as f:
    f.write('/* Titan Clash: Kenney 3D models (CC0, www.kenney.nl), baked for the game by Claude.\n'
            '   Modular Buildings 2.1 + Car Kit 3.1. Geometry is base64 Float32/Uint16; colour sheets are 128x128 RGBA.\n'
            '   Rebuild with bake.py from the original Kenney zips if you add more pieces. */\n')
    f.write('window.KENNEY_MODELS=' + json.dumps(data, separators=(',', ':')) + ';\n')
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB', len(models), 'models')
