"""Titan Clash — Neon City test kit, made in Blender from code (bpy 5.x as a Python module).
6 original buildings, each with INTACT, DAMAGED and RUBBLE versions + pre-broken CHUNKS,
plus a road tile and a neon billboard. Every piece gets an invisible hitbox (box).
Low-poly, flat toon colours + outlines (Workbench, same 'toon' look as the Shoebox looks-test kit).
Run:  python3 city_kit.py            -> out/city_kit.json (for the sandbox + preview page), out/*.glb, out/city_kit.blend
      python3 city_kit.py render     -> also renders preview PNGs to out/png/
By MajorasPride. Original designs: no brands, no copied buildings."""
import bpy, bmesh, math, os, sys, json, random
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out"); os.makedirs(os.path.join(OUT, "png"), exist_ok=True)
RENDER = "render" in sys.argv
SEED = 7

# ---------------------------------------------------------------- palette (Neon City / DOWNTOWN map colours)
PAL = {
    "wallA": "2e2a48", "wallB": "363256", "wallC": "3e3460", "wallD": "28385a", "wallE": "3a2c58",
    "trim": "5a547c", "roof": "24203a", "metal": "6a6788", "glassD": "182238",
    "winC": "7fe8ff", "winP": "ff7fd1", "winV": "c9a0ff", "winY": "ffe08a",
    "neonC": "29e3ff", "neonP": "ff3fb4", "neonV": "b26bff", "neonY": "ffd23f", "neonG": "3dff9a",
    "asph": "1d1b28", "walk": "3a3848", "curb": "4a4658", "line": "ffd23f", "lineW": "d8d6e6",
    "scorch": "0c0b10", "concrete": "5c5866", "rebar": "8a5a3a", "hot": "ff6a1a",
}
GLOW = {k for k in PAL if k.startswith(("win", "neon")) or k in ("line", "hot")}


def srgb(h):
    c = [int(h[i:i+2], 16)/255 for i in (0, 2, 4)]
    return tuple(x/12.92 if x <= 0.04045 else ((x+0.055)/1.055)**2.4 for x in c)


MATS = {}
def M(key):
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new(key); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*srgb(PAL[key]), 1); b.inputs["Roughness"].default_value = .8
    if key in GLOW:
        b.inputs["Emission Color"].default_value = (*srgb(PAL[key]), 1); b.inputs["Emission Strength"].default_value = 2.
    m.diffuse_color = (*srgb(PAL[key]), 1)  # Workbench uses this
    m["key"] = key
    MATS[key] = m; return m


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATS.clear()


# ---------------------------------------------------------------- mesh helpers (z up in Blender)
class Kit:
    """Collects boxes into one bmesh with a material index per face."""
    def __init__(self):
        self.bm = bmesh.new(); self.keys = []

    def mi(self, key):
        if key not in self.keys: self.keys.append(key)
        return self.keys.index(key)

    def box(self, key, sx, sy, sz, x=0, y=0, z=0, rz=0., taper=1.):
        """Box with its bottom at z. taper < 1 shrinks the top (low-poly roofs)."""
        bm = self.bm; i = self.mi(key)
        hx, hy = sx/2, sy/2
        pts = [(-hx, -hy, 0), (hx, -hy, 0), (hx, hy, 0), (-hx, hy, 0)]
        top = [(px*taper, py*taper, sz) for px, py, _ in pts]
        R = Matrix.Rotation(rz, 3, 'Z')
        vs = [bm.verts.new(R @ Vector(p) + Vector((x, y, z))) for p in pts + top]
        F = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
        for f in F: bm.faces.new([vs[k] for k in f]).material_index = i

    def prism(self, key, pts2d, z0, z1):
        """Extruded polygon (sawtooth roofs, wedges)."""
        bm = self.bm; i = self.mi(key)
        b = [bm.verts.new((x, y, z0)) for x, y in pts2d]; t = [bm.verts.new((x, y, z1)) for x, y in pts2d]
        n = len(pts2d)
        bm.faces.new(list(reversed(b))).material_index = i; bm.faces.new(t).material_index = i
        for k in range(n): bm.faces.new([b[k], b[(k+1) % n], t[(k+1) % n], t[k]]).material_index = i

    def cyl(self, key, r, h, x=0, y=0, z=0, seg=8):
        bm = self.bm; i = self.mi(key)
        res = bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=h,
                                    matrix=Matrix.Translation((x, y, z+h/2)))
        for v in res["verts"]:
            for f in v.link_faces: f.material_index = i

    def obj(self, name):
        me = bpy.data.meshes.new(name)
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces)
        self.bm.to_mesh(me); self.bm.free()
        for k in self.keys: me.materials.append(M(k))
        o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
        return o


def windows_grid(k, face, w, h, z0, cols, rows, key, inset=.08, ww=.55, wh=.5, d=.12, cx=0., skip=None):
    """Lit window panes on one face. face: 'S','N','E','W' at half-width w/2 (x for S/N, y for E/W)."""
    rnd = random.random
    for r in range(rows):
        for c in range(cols):
            if skip and skip(r, c): continue
            if rnd() < .22: kk = "glassD"   # some windows are dark (nobody home)
            else: kk = key if rnd() < .8 else random.choice(["winC", "winP", "winV", "winY"])
            u = (c + .5)/cols - .5; v = z0 + (r + .5)*h/rows
            pw, ph = ww*w/cols, wh*h/rows
            if face in "SN":
                y = (-1 if face == "S" else 1)*(face_d[0]/2 + d/2 - inset)
                k.box(kk, pw, d, ph, cx + u*w, y, v - ph/2)
            else:
                x = (1 if face == "E" else -1)*(face_d[1]/2 + d/2 - inset)
                k.box(kk, d, pw, ph, x, cx + u*w, v - ph/2)

face_d = [10, 10]  # (depth along y, width along x) of the current block — set by each building


def neon_frame(k, key, sx, sy, z, t=.22):
    for (bx, by, px, py) in [(sx+t, t, 0, -sy/2), (sx+t, t, 0, sy/2), (t, sy+t, -sx/2, 0), (t, sy+t, sx/2, 0)]:
        k.box(key, bx, by, t, px, py, z)


# ---------------------------------------------------------------- the 6 buildings (original designs)
# each returns (object, height). Footprints about 9-11 units (a city lane is 17).
def b_spire():
    """NEEDLE TOWER: tall slim tower, a setback, corner neon strips, a mast on top."""
    k = Kit(); W, D, H = 9, 9, 26
    face_d[:] = [D, W]
    k.box("wallA", W, D, H); k.box("trim", W+.5, D+.5, .6, z=H*.62)
    k.box("wallB", W*.7, D*.7, 6, z=H); k.box("roof", W*.72, D*.72, .4, z=H+6)
    for sx in (-1, 1):
        for sy in (-1, 1):
            k.box("neonC", .25, .25, H-1, sx*W/2, sy*D/2, .5)
    for f in "SNEW": windows_grid(k, f, W-1.4, H*.6-2, 1.5, 4, 9, "winC")
    for f in "SNEW": windows_grid(k, f, W-1.4, H*.36-1.5, H*.64, 4, 5, "winC")
    k.box("metal", .35, .35, 7, z=H+6.4); k.box("neonP", .6, .6, .6, z=H+13.2)
    k.box("metal", 1.6, 1.6, 1.4, 2, 1.5, H+6.4)
    neon_frame(k, "neonP", W*.7, D*.7, H+5.6)
    return k.obj("needle_tower"), H+14


def b_office():
    """RIBBON OFFICE: wide block, long window bands, AC units and a roof-edge neon line."""
    k = Kit(); W, D, H = 11, 9, 22
    face_d[:] = [D, W]
    k.box("wallD", W, D, H)
    for i in range(7):
        z = 2 + i*2.9
        k.box("winY" if i % 3 else "winC", W+.12, .15, 1.3, 0, -D/2-.02, z)
        k.box("winY" if i % 3 else "winC", W+.12, .15, 1.3, 0, D/2+.02, z)
        k.box("glassD", .15, D-1, 1.3, W/2+.02, 0, z); k.box("glassD", .15, D-1, 1.3, -W/2-.02, 0, z)
    k.box("trim", W+.3, D+.3, .5, z=H)
    for (x, y) in [(-3, -2), (-1, -2), (2.5, 1.5)]:
        k.box("metal", 1.5, 1.5, 1.1, x, y, H+.5); k.cyl("roof", .5, .2, x, y, H+1.6, 6)
    k.box("metal", 2.2, 2, 2.4, -3, 2.2, H+.5)
    neon_frame(k, "neonG", W, D, H+.5)
    k.box("trim", 3, .6, 3.4, 0, -D/2-.3, 0)   # lobby
    k.box("neonC", 3.2, .2, .25, 0, -D/2-.65, 3.4)
    return k.obj("ribbon_office"), H+3


def b_apartment():
    """STACK APARTMENTS: balconies on the front, a water tank and a vertical sign blade."""
    k = Kit(); W, D, H = 10, 8, 17
    face_d[:] = [D, W]
    k.box("wallC", W, D, H)
    for r in range(5):
        for c in range(3):
            x = (c-1)*3.2; z = 1.8 + r*3
            k.box("trim", 2.6, 1.0, .25, x, -D/2-.5, z)              # balcony slab
            k.box("metal", 2.6, .1, .8, x, -D/2-.98, z+.25)          # railing
            k.box(random.choice(["winY", "winP", "winY", "glassD"]), 1.6, .15, 1.6, x, -D/2-.02, z+.5)
    for f in "NEW": windows_grid(k, f, W-2, H-2, 1, 3, 5, "winY")
    k.box("trim", W+.3, D+.3, .45, z=H)
    for sx in (-1, 1): k.box("metal", .25, .25, 2.4, sx*.9+2.5, 1.5, H+.45)
    k.cyl("wallE", 1.4, 2.2, 2.5, 1.5, H+2.7, 8); k.box("roof", 3.2, 3.2, .2, 2.5, 1.5, H+4.9, taper=.3)
    k.box("roof", .5, 3.2, H*.6, W/2+.25, -D/2+1.8, H*.3)          # sign blade
    k.box("neonV", .2, 3.4, .2, W/2+.55, -D/2+1.8, H*.3); k.box("neonV", .2, 3.4, .2, W/2+.55, -D/2+1.8, H*.9-.2)
    for i in range(5): k.box(random.choice(["neonP", "neonV"]), .15, 2.4, 1.3, W/2+.55, -D/2+1.8, H*.33+.4+i*1.9)
    return k.obj("stack_apartments"), H+5


def b_arcade():
    """ARCADE STRIP: low wide shop, big glowing front frame, canopy, a box sign on the roof."""
    k = Kit(); W, D, H = 11, 9, 9
    face_d[:] = [D, W]
    k.box("wallE", W, D, H)
    k.box("glassD", W-1.6, .2, 4.6, 0, -D/2-.05, .3)
    for i in range(5): k.box(random.choice(["winP", "winV", "winC"]), 1.3, .25, 3.2, -3.6+i*1.8, -D/2-.08, .8)
    k.box("trim", W+1, 2.6, .35, 0, -D/2-1.1, 5.1)                # canopy
    k.box("neonP", W+1.1, .2, .25, 0, -D/2-2.4, 5.15)
    neon_frame(k, "neonY", W-.6, .3, 5.6); k.box("neonY", .25, .25, 5, -W/2+.2, -D/2-.1, .4); k.box("neonY", .25, .25, 5, W/2-.2, -D/2-.1, .4)
    for f in "EW": windows_grid(k, f, D-2, 3, 5.6, 3, 1, "winV")
    k.box("trim", W+.3, D+.3, .4, z=H)
    for sx in (-1, 1): k.box("metal", .3, .3, 2, sx*3, 0, H+.4)
    k.box("roof", 8, 1, 3.2, 0, 0, H+2.2)                          # roof box sign
    k.box("neonC", 8.2, 1.1, .22, 0, 0, H+2.1); k.box("neonC", 8.2, 1.1, .22, 0, 0, H+5.3)
    for i in range(6): k.box(random.choice(["neonP", "neonC", "neonY"]), 1, 1.15, 2.2, -3.1+i*1.25, 0, H+2.7)
    return k.obj("arcade_strip"), H+5.6


def b_stepped():
    """TIER TOWER: three stacked tiers, each smaller, with a neon ring at every step."""
    k = Kit()
    tiers = [(11, 10, 12, "wallB"), (8.5, 7.5, 10, "wallA"), (6, 5, 7, "wallC")]
    z = 0
    for i, (w, d, h, key) in enumerate(tiers):
        face_d[:] = [d, w]
        k.box(key, w, d, h, z=z)
        for f in "SNEW": windows_grid(k, f, (w if f in "SN" else d)-1.4, h-2, z+1, 4 if w > 7 else 3, max(2, int(h/2.6)), ["winV", "winC", "winP"][i])
        k.box("trim", w+.4, d+.4, .45, z=z+h); neon_frame(k, ["neonV", "neonC", "neonP"][i], w+.4, d+.4, z+h+.45)
        z += h + .45
    k.box("roof", 4.5, 3.6, 2.6, z=z, taper=.45); k.box("neonY", .5, .5, .5, z=z+2.6)
    return k.obj("tier_tower"), z+3


def b_warehouse():
    """SAWTOOTH WAREHOUSE: low and wide, sawtooth roof with glowing skylights, roll-up doors."""
    k = Kit(); W, D, H = 11, 10, 6.5
    face_d[:] = [D, W]
    k.box("wallD", W, D, H)
    n = 4
    for i in range(n):                                          # sawtooth teeth along y
        y0 = -D/2 + i*D/n; y1 = y0 + D/n
        k.prism("roof", [(-W/2, y0), (-W/2, y1)], 0, 0) if False else None
        bm = k.bm; mi = k.mi("roof"); gi = k.mi("winC")
        v = [bm.verts.new(p) for p in [(-W/2, y0, H), (W/2, y0, H), (W/2, y1, H), (-W/2, y1, H), (-W/2, y1, H+2.2), (W/2, y1, H+2.2)]]
        bm.faces.new([v[0], v[1], v[5], v[4]]).material_index = mi      # slope
        bm.faces.new([v[2], v[3], v[4], v[5]]).material_index = gi      # glowing skylight (steep side)
        bm.faces.new([v[0], v[4], v[3]]).material_index = mi; bm.faces.new([v[1], v[2], v[5]]).material_index = mi
        bm.faces.new([v[0], v[3], v[2], v[1]]).material_index = mi
    for i in range(3):
        x = -3.4 + i*3.4
        k.box("metal", 2.6, .2, 3.6, x, -D/2-.05, 0)
        for s in range(5): k.box("trim", 2.6, .25, .08, x, -D/2-.1, .5+s*.65)
        k.box("neonY" if i != 1 else "neonG", 2.8, .25, .2, x, -D/2-.12, 3.7)
    k.box("neonG", W+.1, .15, .3, 0, D/2+.04, H-1)
    k.cyl("metal", .9, 1.8, 3.6, 3.4, H+2.2, 8); k.box("metal", .25, .25, 2.2, 3.6, 3.4, H)
    return k.obj("sawtooth_warehouse"), H+4


BUILDINGS = [b_spire, b_office, b_apartment, b_arcade, b_stepped, b_warehouse]


# ---------------------------------------------------------------- breaking things
def bbox(o):
    cs = [o.matrix_world @ Vector(c) for c in o.bound_box]
    lo = Vector((min(c.x for c in cs), min(c.y for c in cs), min(c.z for c in cs)))
    hi = Vector((max(c.x for c in cs), max(c.y for c in cs), max(c.z for c in cs)))
    return lo, hi


def jag(name, r, loc, scale=(1, 1, 1), seed=0):
    """A jagged low-poly rock shape used as a 'bite' cutter."""
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r)
    rr = random.Random(seed)
    for v in bm.verts: v.co *= rr.uniform(.75, 1.25)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(M("concrete"))
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    o.location = loc; o.scale = scale; o.rotation_euler = (rr.random()*3, rr.random()*3, rr.random()*3)
    return o


def boolean(target, cutter, op='DIFFERENCE'):
    md = target.modifiers.new("b", 'BOOLEAN'); md.object = cutter; md.operation = op; md.solver = 'EXACT'
    md.use_self = True; md.use_hole_tolerant = True
    bpy.context.view_layer.objects.active = target
    with bpy.context.temp_override(object=target, active_object=target):
        bpy.ops.object.modifier_apply(modifier=md.name)


def dup(o, name):
    c = o.copy(); c.data = o.data.copy(); c.name = name; bpy.context.scene.collection.objects.link(c); return c


def kill(o): bpy.data.objects.remove(o, do_unlink=True)


def scorch_new_faces(o, before=None):
    """Faces the cut made (they carry the cutter's concrete material) get mixed: concrete, scorch, a few glowing hot."""
    me = o.data
    for sl in o.material_slots:
        if sl.material is None: sl.material = M("concrete")
    keys = [sl.material["key"] for sl in o.material_slots]
    for k in ("concrete", "scorch", "hot"):
        if k not in keys: me.materials.append(M(k)); keys.append(k)
    rr = random.Random(len(me.polygons)); ci = keys.index("concrete")
    for p in me.polygons:
        if p.material_index != ci: continue
        x = rr.random()
        p.material_index = keys.index("hot" if x < .12 else "scorch" if x < .85 else "concrete")


def centers(o): return [(round(p.center.x, 2), round(p.center.y, 2), round(p.center.z, 2)) for p in o.data.polygons]



def split_parts(o):
    """Split into loose parts (every box is one). Returns (big manifold blocks, small detail parts)."""
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    with bpy.context.temp_override(active_object=o, selected_editable_objects=[o], object=o):
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
    parts = [x for x in bpy.context.scene.objects if x.type == 'MESH' and (x == o or x.name.startswith(o.name + "."))]
    big, small = [], []
    for x in parts:
        lo, hi = bbox(x); e = hi - lo
        (big if min(e) > 2.5 and e.x*e.y*e.z > 60 else small).append(x)
    return big, small


def join(objs, name):
    objs = [x for x in objs if x and len(x.data.polygons)]
    keep = objs[0]
    with bpy.context.temp_override(active_object=keep, selected_editable_objects=objs, object=keep):
        bpy.ops.object.join()
    keep.name = name; keep.data.name = name
    return keep


def overlap(a, b, pad=0.):
    la, ha = bbox(a); lb, hb = bbox(b)
    return all(la[i] <= hb[i]+pad and lb[i] <= ha[i]+pad for i in range(3))


def inside_cutter(pt, c):
    q = c.matrix_world.inverted() @ pt
    return q.length < .95

def make_damaged(src, h, seed):
    """Corner bites, a chewed-off top and a blown-out hole."""
    rr = random.Random(seed); o = dup(src, src.name + "_damaged"); before = centers(o)
    lo, hi = bbox(o); top = hi.z
    cut = []
    W, D = hi.x-lo.x, hi.y-lo.y; body = min(top, h)*.86
    sx, sy = rr.choice([-1, 1]), -1
    W, D = min(W, 12), min(D, 11)
    cut.append(jag("c1", 1, (sx*W*.45, sy*D*.45, body*1.02), (W*.62, D*.62, max(5, body*.36)), seed))                   # chewed-off top corner
    cut.append(jag("c4", 1, (-sx*W*.5, -sy*D*.5, body*1.1), (W*.35, D*.35, max(3, body*.2)), seed+3))                   # second bite                          # chewed-off top corner
    cut.append(jag("c2", 1, (rr.uniform(-.2, .2)*W, lo.y, body*rr.uniform(.3, .5)), (W*.24+1.4, 3.6, max(2.6, body*.12)), seed+1))  # front hole
    cut.append(jag("c3", 1, (-sx*hi.x, rr.uniform(-.2, .2)*D, body*rr.uniform(.55, .7)), (3.4, D*.2+1, max(2, body*.09)), seed+2))  # side hole
    big, small = split_parts(o); keep = []
    for x in big + small:          # every box is watertight on its own, so the exact boolean is clean per part
        for c in cut:
            if overlap(x, c): boolean(x, c)
        if len(x.data.polygons) >= 4: keep.append(x)
        else: kill(x)
    big, small = keep, []
    for c in cut: kill(c)
    o = join(big + small, src.name + "_damaged")
    scorch_new_faces(o)
    # tilt a little: damaged buildings start to lean
    o.data.transform(Matrix.Shear('XZ', 4, (rr.uniform(-.02, .02), rr.uniform(-.02, .02))))
    return o


def voronoi_cells(lo, hi, n, rr):
    """Convex cells filling the box (seeds pushed toward the upper half, where hits land)."""
    pts = [Vector((rr.uniform(lo.x, hi.x), rr.uniform(lo.y, hi.y), lo.z + (hi.z-lo.z)*rr.random()**.6)) for _ in range(n)]
    cells = []
    for i, p in enumerate(pts):
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1)
        for v in bm.verts: v.co = Vector(((lo.x+hi.x)/2 + v.co.x*(hi.x-lo.x+2), (lo.y+hi.y)/2 + v.co.y*(hi.y-lo.y+2), (lo.z+hi.z)/2 + v.co.z*(hi.z-lo.z+2)))
        for j, q in enumerate(pts):
            if i == j: continue
            mid = (p+q)/2; nrm = (q-p).normalized()
            geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
            r = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=mid, plane_no=nrm, clear_outer=True)
            edges = [e for e in r["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
            if edges: bmesh.ops.edgenet_fill(bm, edges=edges)
        me = bpy.data.meshes.new("cell"); bm.to_mesh(me); bm.free(); me.materials.append(M("concrete"))
        o = bpy.data.objects.new("cell", me); bpy.context.scene.collection.objects.link(o)
        cells.append(o)
    return cells


def make_chunks(src, n, seed):
    """Pre-broken chunks: the real building cut into convex pieces (so a chunk shows its windows and neon)."""
    rr = random.Random(seed); lo, hi = bbox(src)
    pts = [Vector((rr.uniform(lo.x, hi.x), rr.uniform(lo.y, hi.y), lo.z + (hi.z-lo.z)*rr.random()**.6)) for _ in range(n)]
    rr2 = random.Random(seed); cells = voronoi_cells(lo, hi, n, rr2)    # same seeds (same random stream)
    work = dup(src, src.name + "_w"); big, small = split_parts(work)
    groups = [[] for _ in range(n)]
    near = lambda v: min(range(n), key=lambda k: (pts[k]-v).length)
    for x in big + small:
        l2, h2 = bbox(x)
        corners = {near(Vector((a, b, c))) for a in (l2.x, h2.x) for b in (l2.y, h2.y) for c in (l2.z, h2.z)}
        if len(corners) == 1: groups[corners.pop()].append(x); continue      # the whole part sits in one cell
        for i, cell in enumerate(cells):
            if not overlap(x, cell): continue
            c = dup(x, f"{src.name}_c{i}"); boolean(c, cell, 'INTERSECT')
            if len(c.data.polygons) >= 4: groups[i].append(c)
            else: kill(c)
        kill(x)
    for cell in cells: kill(cell)
    out = []
    for i, g in enumerate(groups):
        if not g: continue
        c = join(g, f"{src.name}_chunk{i}"); scorch_new_faces(c)
        lo2, hi2 = bbox(c); ctr = (lo2+hi2)/2
        c.data.transform(c.matrix_world); c.matrix_world = Matrix.Identity(4)
        c.data.transform(Matrix.Translation(-ctr)); c.location = ctr
        out.append(c)
    return out


def make_rubble(src, h, seed):
    """A low pile: a mound, broken slabs, shards and a few neon bits still glowing."""
    rr = random.Random(seed); lo, hi = bbox(src); W, D = hi.x-lo.x, hi.y-lo.y
    k = Kit(); ph = min(3.6, 1 + h*.07)
    wall0 = next((sl.material["key"] for sl in src.material_slots if sl.material and sl.material["key"].startswith("wall")), "wallA")
    pts = [(math.cos(a)*W*.62*rr.uniform(.85, 1.1), math.sin(a)*D*.62*rr.uniform(.85, 1.1)) for a in [i*math.tau/9 for i in range(9)]]
    bm = k.bm; mi = k.mi("concrete")
    base = [bm.verts.new((x, y, 0)) for x, y in pts]; midr = [bm.verts.new((x*.6, y*.6, ph*.55*rr.uniform(.6, 1.3))) for x, y in pts]
    peak = bm.verts.new((rr.uniform(-1.5, 1.5), rr.uniform(-1.5, 1.5), ph*.8))
    for i in range(9):
        j = (i+1) % 9
        bm.faces.new([base[i], base[j], midr[j], midr[i]]).material_index = mi
        bm.faces.new([midr[i], midr[j], peak]).material_index = k.mi("scorch" if i % 3 == 0 else wall0 if i % 3 == 1 else "concrete")
    keys = [s.material["key"] for s in src.material_slots if s.material]
    wall = next((x for x in keys if x.startswith("wall")), "wallA")
    for i in range(10):     # slabs
        a = rr.random()*math.tau; r = rr.uniform(0, W*.45)
        k.box(rr.choice([wall, wall, "trim", "scorch"]), rr.uniform(1.5, 3.5), rr.uniform(1.2, 3), rr.uniform(.4, .9),
              math.cos(a)*r, math.sin(a)*r, rr.uniform(0, ph*.5), rz=rr.random()*3, taper=rr.uniform(.6, 1))
    for i in range(5):      # sticking-out beams + bits of neon
        a = rr.random()*math.tau; r = rr.uniform(0, W*.35)
        k.box("rebar", .2, .2, rr.uniform(1.5, 3), math.cos(a)*r, math.sin(a)*r, ph*.3, rz=rr.random()*3, taper=.5)
    glows = [x for x in keys if x.startswith("neon")] or ["neonC"]
    for i in range(3):
        a = rr.random()*math.tau; r = rr.uniform(W*.2, W*.5)
        k.box(rr.choice(glows), rr.uniform(1, 2.5), .2, .2, math.cos(a)*r, math.sin(a)*r, rr.uniform(.2, ph*.4), rz=rr.random()*3)
    o = k.obj(src.name + "_rubble")
    # a few real broken pieces of this building (windows and neon still on them) toppled onto the pile
    pieces = make_chunks(src, 6, seed+50)
    pieces.sort(key=lambda c: -len(c.data.polygons))
    for j, c in enumerate(pieces):
        if j >= 4: kill(c); continue
        lo2, hi2 = bbox(c); ext = hi2-lo2; sz = max(ext); f = min(1, (W*.36)/max(sz, .1))
        lay = Matrix.Rotation(math.pi/2*rr.choice([-1, 1]) + rr.uniform(-.25, .25), 4, 'X') if ext.z > max(ext.x, ext.y) else Matrix.Rotation(rr.uniform(-.3, .3), 4, 'X')
        c.data.transform(Matrix.Scale(f, 4)); c.data.transform(Matrix.Rotation(rr.random()*6, 4, 'Z') @ lay)
        a = j*math.tau/4 + rr.uniform(-.4, .4); r = W*rr.uniform(.12, .3)
        lo3, hi3 = bbox(c); c.location = (math.cos(a)*r, math.sin(a)*r, -(lo3.z - c.location.z) + rr.uniform(0, ph*.2))
        o2 = c
        with bpy.context.temp_override(selected_editable_objects=[o, o2], active_object=o, object=o):
            bpy.ops.object.join()
    for p in o.data.polygons: p.use_smooth = False
    return o, ph


# ---------------------------------------------------------------- road + billboard
def road():
    """One 17x17 road tile (a city lane): asphalt, lane dashes, crosswalk, sidewalks and curbs."""
    k = Kit(); L = 17
    k.box("asph", L, L, .1)
    for sx in (-1, 1):
        k.box("walk", 2.4, L, .3, sx*(L/2-1.2), 0, 0); k.box("curb", .25, L, .34, sx*(L/2-2.4), 0, 0)
    for i in range(4): k.box("line", .25, 2, .02, 0, -6 + i*4, .1)
    for i in range(6): k.box("lineW", 1.4, .7, .02, -4.6 + i*1.85, L/2-1.4, .1)    # crosswalk
    for sx in (-1, 1):  # street lamps
        k.box("metal", .2, .2, 5, sx*(L/2-1.6), -4, .3); k.box("metal", 1.2, .2, .2, sx*(L/2-2.1), -4, 5.2); k.box("neonP", .5, .3, .2, sx*(L/2-2.6), -4, 5.0)
    return k.obj("road_straight"), 5.4


def billboard():
    """Neon billboard on a pole. The panel is a glowing blank: the game paints its sign text on it."""
    k = Kit()
    k.box("metal", .6, .6, 9); k.box("trim", 1.4, 1.4, .4, z=0)
    k.box("metal", 7, .5, .4, 0, 0, 9); k.box("roof", 7.6, .6, 3.6, 0, 0, 9.4)
    k.box("winP", 7, .2, 3, 0, -.32, 9.7); k.box("winV", 7, .2, 3, 0, .32, 9.7)   # glowing panels, both faces (sign faces)
    neon_frame(k, "neonC", 7.7, .7, 9.3); neon_frame(k, "neonC", 7.7, .7, 13.0)
    for i in range(4): k.box("metal", .1, .1, 1.2, -3 + i*2, -.6, 8.3)  # lamp arms
    k.box("metal", 7, .5, .12, 0, -.7, 9.1)                  # catwalk
    return k.obj("neon_billboard"), 13.3


# ---------------------------------------------------------------- export (json for three.js: y-up, flat triangles)
import base64, struct
def pack(arr): return base64.b64encode(struct.pack("<%dh" % len(arr), *[int(round(v*50)) for v in arr])).decode()


def mesh_json(o):
    """Triangles grouped by material: {key: [x,y,z,...]} in three.js axes (x, z, -y), 2 decimals."""
    me = o.data; me.calc_loop_triangles(); keys = [s.material["key"] if s.material else "concrete" for s in o.material_slots]
    groups = {}
    for t in me.loop_triangles:
        key = keys[t.material_index]; arr = groups.setdefault(key, [])
        for vi in t.vertices:
            v = me.vertices[vi].co
            arr += [v.x, v.z, -v.y]
    return {k: pack(v) for k, v in groups.items()}


def hitbox(o):
    lo, hi = bbox(o); c = (lo+hi)/2; s = hi-lo
    return [round(c.x, 2), round(c.z, 2), round(-c.y, 2), round(s.x, 2), round(s.z, 2), round(s.y, 2)]  # centre + size, y-up


def add_hitbox_obj(o):
    """Invisible box in the .blend too (kit standard), parented to the piece."""
    lo, hi = bbox(o); me = bpy.data.meshes.new("HB_" + o.name); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts: v.co = Vector((v.co.x*(hi.x-lo.x), v.co.y*(hi.y-lo.y), v.co.z*(hi.z-lo.z))) + (lo+hi)/2 - o.location
    bm.to_mesh(me); bm.free(); hb = bpy.data.objects.new("HB_" + o.name, me); bpy.context.scene.collection.objects.link(hb)
    hb.parent = o; hb.display_type = 'WIRE'; hb.hide_render = True; hb["hitbox"] = True
    return hb


def main():
    random.seed(SEED); reset()
    kit = {"version": 1, "made": "Nov 13, 2026", "by": "MajorasPride", "units": "1 = game unit (a city lane is 17)",
           "palette": {k: "#" + v for k, v in PAL.items()}, "glow": sorted(GLOW), "buildings": [], "props": []}
    lineup = []
    for i, fn in enumerate(BUILDINGS):
        random.seed(SEED*100 + i)
        o, h = fn(); lo, hi = bbox(o)
        dmg = make_damaged(o, h, 11+i)
        chunks = make_chunks(o, 9, 21+i)
        rub, rh = make_rubble(o, h, 31+i)
        e = {"id": o.name, "name": fn.__doc__.split(":")[0], "about": fn.__doc__.split(":", 1)[1].strip(),
             "size": [round(hi.x-lo.x, 2), round(h, 2), round(hi.y-lo.y, 2)],
             "intact": mesh_json(o), "damaged": mesh_json(dmg), "rubble": mesh_json(rub),
             "hitbox": {"intact": hitbox(o), "damaged": hitbox(dmg), "rubble": hitbox(rub)},
             "chunks": [{"at": [round(c.location.x, 2), round(c.location.z, 2), round(-c.location.y, 2)], "mesh": mesh_json(c), "hitbox": hitbox(c)} for c in chunks]}
        kit["buildings"].append(e)
        for p in [o, dmg, rub] + chunks: add_hitbox_obj(p)
        lineup.append((o, dmg, rub, chunks, h))
        print(f"  {o.name}: h={h:.1f} intact {len(o.data.polygons)}f, damaged {len(dmg.data.polygons)}f, rubble {len(rub.data.polygons)}f, {len(chunks)} chunks")
    props = []
    for fn in (road, billboard):
        o, h = fn(); add_hitbox_obj(o); props.append(o)
        kit["props"].append({"id": o.name, "name": fn.__doc__.split(".")[0], "mesh": mesh_json(o), "hitbox": hitbox(o)})
    js = os.path.join(OUT, "city_kit.json")
    json.dump(kit, open(js, "w"), separators=(",", ":"))
    print("json", os.path.getsize(js)//1024, "KB")
    # lay everything out in rows so the .blend is easy to look through: intact / damaged / rubble / chunks
    for i, (o, dmg, rub, chunks, h) in enumerate(lineup):
        x = i*16
        o.location.x = x; dmg.location.x = x; dmg.location.y = 20; rub.location.x = x; rub.location.y = 40
        for c in chunks: c.location.x += x; c.location.y += 60; c.location.z += 0
    props[0].location = (-24, 0, 0); props[1].location = (-24, 20, 0)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "city_kit.blend"))
    try:
        bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "city_kit.glb"), export_format='GLB', export_extras=True)
    except Exception as ex: print("glb export skipped:", ex)
    if RENDER: renders(lineup, props)


# ---------------------------------------------------------------- preview renders (toon: flat colour + outlines)
def setup_render(w, h):
    s = bpy.context.scene
    s.render.engine = 'BLENDER_WORKBENCH'
    sh = s.display.shading; sh.color_type = 'MATERIAL'; sh.light = 'STUDIO'; sh.show_specular_highlight = False
    sh.show_object_outline = True; sh.object_outline_color = (0, 0, 0)
    sh.show_cavity = True; sh.cavity_type = 'WORLD'; sh.cavity_ridge_factor = 0; sh.cavity_valley_factor = 1
    sh.show_shadows = True; sh.shadow_intensity = .35
    s.display.render_aa = '8'
    s.render.film_transparent = False
    s.world = s.world or bpy.data.worlds.new("W")
    sh.background_type = 'VIEWPORT'; sh.background_color = srgb("0c0820")
    s.render.resolution_x, s.render.resolution_y = w, h
    s.view_settings.view_transform = 'Standard'; s.view_settings.exposure = .9
    s.render.image_settings.file_format = 'PNG'
    return s


def cam_at(target, dist, ortho, el=24, az=-35):
    s = bpy.context.scene
    cam = s.camera or bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
    if not s.camera: s.collection.objects.link(cam); s.camera = cam
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = ortho
    e, a = math.radians(el), math.radians(az)
    cam.location = Vector(target) + Vector((math.sin(a)*math.cos(e), -math.cos(a)*math.cos(e), math.sin(e)))*dist
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat('-Z', 'Y').to_euler()


def shot(name):
    s = bpy.context.scene; s.render.filepath = os.path.join(OUT, "png", name + ".png"); bpy.ops.render.render(write_still=True)


def only(objs):
    keep = set(objs)
    for o in bpy.context.scene.objects:
        if o.type == 'MESH': o.hide_render = not (o in keep and not o.get("hitbox"))


def renders(lineup, props):
    # ground + a titan-height marker (VALOR is about 18 units)
    bpy.ops.mesh.primitive_plane_add(size=400, location=(40, 30, -.01)); g = bpy.context.object; g.data.materials.append(M("asph")); g.name = "ground"
    k = Kit(); k.box("neonC", .35, .35, 18); k.box("neonC", 2, .35, .35, z=18); mark = k.obj("titan_18u")
    s = setup_render(1600, 900)
    # 1) lineup of the six intact buildings with the titan-height marker
    mark.location = (-9, 0, 0)
    only([l[0] for l in lineup] + [g, mark]); cam_at((38, 0, 12), 200, 112, el=16, az=-18); shot("01_lineup")
    # 2) per building: intact -> damaged -> rubble side by side, + chunks pulled apart
    s.render.resolution_x, s.render.resolution_y = 1500, 900
    for i, (o, dmg, rub, chunks, h) in enumerate(lineup):
        x = i*16
        o.location = (x-14, 0, 0); dmg.location = (x, 0, 0); rub.location = (x+14, 0, 0)
        only([o, dmg, rub, g]); cam_at((x, 0, h*.45), 200, max(56, h*1.25*1500/900), el=18, az=-22); shot(f"{i+2:02d}_{o.name}_states")
        o.location = (x, 0, 0)
    # 3) chunks exploded view of building 0 and 4
    for i in (0, 4):
        o, dmg, rub, chunks, h = lineup[i]
        for c in chunks:
            base = c.location.copy(); c["base"] = list(base)
        ctr = sum((Vector(c["base"]) for c in chunks), Vector())/len(chunks)
        for c in chunks: c.location = ctr + (Vector(c["base"]) - ctr)*1.35 + Vector((0, 0, 1.5))
        only(chunks + [g]); cam_at((ctr.x, ctr.y, h*.5), 200, h*1.6*1500/900, el=20, az=-30); shot(f"09_{o.name}_chunks")
    # 4) props
    props[0].location = (0, 0, 0); props[1].location = (0, 0, .4)
    only(props + [g]); cam_at((0, 0, 4), 200, 30, el=34, az=-30); shot("10_road_billboard")
    # 5) street scene: road + buildings around a titan marker
    for i, (o, *_r) in enumerate(lineup): o.location = ((i % 3)*17 - 17, (13 if i < 3 else -13), 0); o.rotation_euler.z = 0 if i < 3 else math.pi
    props[0].location = (-17, 0, 0); props[0].rotation_euler.z = math.pi/2
    r2 = dup(props[0], "road2"); r2.location = (0, 0, 0); r3 = dup(props[0], "road3"); r3.location = (17, 0, 0)
    props[1].location = (8, 6, 0)
    mark.location = (0, 0, 0)
    only([l[0] for l in lineup] + [props[0], r2, r3, props[1], g, mark]); cam_at((0, 0, 10), 200, 92, el=28, az=-40); shot("00_street")


if __name__ == "__main__":
    main()
