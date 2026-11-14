# Titan Clash sandbox: kit bodies data (T050, Nov 13 2026).
# Reads the 2.0 Blender kit files (json) and writes sandbox/src/27-kit-bodies-data.js: only the parts the core six use
# (meshes, plugs, hitboxes), the kit colour schemes, and the build sheet (which part sits on which plug and which game joint it moves with).
# Usage: python3 sandbox/tools/kit_bodies_data.py <folder with mech_kit_R2.json, kaiju_kit.json, weapons_kit.json, hydra_kit.json, tree_shepherd_kit.json>
# To change a titan's build, edit SPECS below and run this again, then python3 sandbox/build_sandbox.py.
import json, sys, os
src = sys.argv[1]; here = os.path.dirname(os.path.abspath(__file__))
KITS = {'mech': 'mech_kit_R2.json', 'kaiju': 'kaiju_kit.json', 'weapons': 'weapons_kit.json', 'hydra': 'hydra_kit.json', 'tree': 'tree_shepherd_kit.json'}
K = {k: json.load(open(os.path.join(src, f))) for k, f in KITS.items()}
PARTS = {k: {p['id']: p for p in d['parts']} for k, d in K.items()}

def N(p, j=None, rot=(0, 0, 0), w=1, kids=None, both=0, only=None, s=1, fill=None):
    n = {'p': p, 'rot': list(rot)}
    if j: n['j'] = j
    if not w: n['w'] = 0
    if kids: n['kids'] = kids
    if both: n['both'] = 1
    if only: n['only'] = only
    if s != 1: n['s'] = s
    return n

def mech(sheet, weapons=None):
    m = lambda slot: 'mech:' + sheet[slot]
    hand_kids = {}
    arm = N(m('shoulder'), 'arm*', both=1, kids={'arm': N(m('upperarm'), 'arm*', kids={'elbow': N(m('forearm'), 'el*', kids={'wrist': N('mech:hand_kit', 'hand*', kids=hand_kids)})})})
    leg = N(m('thigh'), 'leg*', both=1, kids={'knee': N(m('shin'), 'kn*', kids={'ankle': N(m('foot'), 'kn*')})})
    return N(m('pelvis'), 'body', kids={'waist': N(m('torso'), 'torso', kids={'neck': N(m('head'), 'head'), 'back': N(m('back'), 'torso'), 'shoulder_R': arm}), 'hip_R': leg})

def chain(part, n, j, rot, first_rot, tip=None, decay=1, w0=1, step=1):
    node = tip
    for i in range(n - 1, -1, -1):
        node = N(part if isinstance(part, str) else part[i], j % (i * step) if '%' in j else j, rot=first_rot if i == 0 else rot, w=w0 if i == 0 else 0, s=1 if i == 0 else decay, kids={'next': node} if node else None)
    return node

SPECS = {
 'valor': {'scheme': ['mech', 'vanguard'], 'fit': 'torso', 'weapons': {'sword': 'weapons:great_sword', 'shield': 'weapons:shield_kite'},
   'tree': mech({'pelvis': 'pelvis_skirt', 'torso': 'torso_sleek', 'head': 'head_vanguard', 'back': 'back_wings', 'shoulder': 'shoulder_round', 'upperarm': 'upperarm_sleek', 'forearm': 'forearm_gauntlet', 'thigh': 'thigh_sleek', 'shin': 'shin_sleek', 'foot': 'foot_heeled'})},
 'ashvin': {'scheme': ['mech', 'def'], 'fit': 'torso',
   'tree': mech({'pelvis': 'pelvis_skirt', 'torso': 'torso_sleek', 'head': 'head_falcon', 'back': 'back_jetfold', 'shoulder': 'shoulder_round', 'upperarm': 'upperarm_sleek', 'forearm': 'forearm_intake', 'thigh': 'thigh_sleek', 'shin': 'shin_nacelle', 'foot': 'foot_heeled'})},
 'raikou': {'scheme': ['mech', 'def'], 'fit': 'torso', 'weapons': {'katana': 'weapons:katana'},
   'tree': mech({'pelvis': 'pelvis_fauld', 'torso': 'torso_knight', 'head': 'head_paladin', 'back': 'back_sabers', 'shoulder': 'shoulder_layered', 'upperarm': 'upperarm_sleek', 'forearm': 'forearm_bracer', 'thigh': 'thigh_sleek', 'shin': 'shin_sleek', 'foot': 'foot_sabaton'})},
 # the kaiju kit's INFERNOTH build (crystal back and shoulders). rot = degrees, kit convention (Blender XYZ), relative to the game joint the part
 # moves with, or to its parent part when both sit on the same joint. Limbs, heads, jaws and tails hang in the joint's own frame (rot 0): the game poses them.
 'infernoth': {'scheme': ['kaiju', 'infernoth'], 'fit': 'height', 'fill': {'back': 'kaiju:plate_dorsal', 'tip': 'kaiju:crystal_tip', 'crest': 'kaiju:crystal_cluster'},
   'tree': N('kaiju:body_kaiju', 'torso', rot=(-90, 0, 0), kids={
     'neck': N('kaiju:neck_thick', 'torso', rot=(42, 0, 0), kids={'head': N('kaiju:head_kaiju_horned', 'head', kids={'jaw': N('kaiju:jaw_kaiju', 'jaw')})}),
     'hip_R': N('kaiju:thigh_heavy', 'leg*', both=1, kids={'knee': N('kaiju:shin_heavy', 'kn*', kids={'ankle': N('kaiju:foot_stomp', 'kn*')})}),
     'shoulder_R': N('kaiju:arm_kaiju', 'arm*', both=1, kids={'elbow': N('kaiju:forearm_kaiju', 'el*', kids={'wrist': N('kaiju:hand_claw', 'el*')})}),
     'tail': chain(['kaiju:tail_heavy_1', 'kaiju:tail_heavy_2', 'kaiju:tail_heavy_3', 'kaiju:tail_heavy_4'], 4, 'tail%d', (0, 0, 0), (0, 0, 0), step=2)})},
 # hydra kit, RAGNAVOX ground stance: three heads (storm, fire, venom), arms are wings (scaled up 1.6, his note)
 'ragnavox': {'scheme': ['hydra', 'ragnavox'], 'fit': 'height',
   'tree': N('hydra:hips_heavy', 'hips', rot=(-14, 0, 0), kids={
     'waist': N('hydra:chest_hydra3', 'torso', rot=(-50, 0, 0), kids={
        'neck': chain('hydra:neck_hydra_scaled', 5, 'torso', (-7, 0, 0), (-8, 0, 0), tip=N('hydra:head_hydra_storm', 'head', kids={'jaw': N('hydra:jaw_hydra', 'jaw'), 'horn': N('hydra:horn_ragna', 'head')})),
        'neck_2': chain('hydra:neck_hydra_scaled', 5, 'torso', (-7, 0, 0), (-4, 0, 38), tip=N('hydra:head_hydra_fire', 'side0', kids={'jaw': N('hydra:jaw_hydra', 'side0', rot=(14, 0, 0)), 'horn': N('hydra:horn_ragna', 'side0')})),
        'neck_3': chain('hydra:neck_hydra_scaled', 5, 'torso', (-7, 0, 0), (-4, 0, -38), tip=N('hydra:head_hydra_venom', 'side1', kids={'jaw': N('hydra:jaw_hydra', 'side1', rot=(14, 0, 0))})),
        'back': N('hydra:back_dragon_plates', 'torso'),
        'shoulder_R': N('hydra:wing_inner', 'arm*', rot=(0, -55, 0), both=1, s=1.6, kids={'elbow': N('hydra:wing_outer', 'el*', rot=(0, -25, 0), kids={'wrist': N('hydra:wing_thumb', 'el*')})})}),
     'back': N('hydra:back_dragon_plates', 'hips'),
     'hip_R': N('hydra:thigh_heavy', 'leg*', both=1, kids={'knee': N('hydra:shin_digi', 'kn*', kids={'ankle': N('hydra:foot_bird', 'kn*')})}),
     'tail': chain('hydra:tail_dragon', 9, 'tail%d', (0, 0, 0), (0, 0, 0), tip=N('hydra:tip_blade', 'tail8'), decay=.9)})},
 # tree shepherd kit, the great oak build
 'worldroot': {'scheme': ['tree', 'oak'], 'fit': 'height', 'fill': {'coat': 'tree:leaf_cluster', 'back': 'tree:moss_patch'},
   'tree': N('tree:trunk_oak', 'torso', kids={'crown': N('tree:crown_oak', 'head'), 'face': N('tree:face_bearded', 'torso'),
     'shoulder_R': N('tree:arm_branch', 'arm*', both=1, kids={'elbow': N('tree:forearm_branch', 'el*', kids={'wrist': N('tree:hand_twig', 'el*')})}),
     'hip_R': N('tree:leg_root', 'leg*', both=1, kids={'knee': N('tree:shin_root', 'kn*', kids={'ankle': N('tree:foot_roots', 'kn*')})})})},
}

used = set()
def walk(n):
    used.add(n['p'])
    for k in (n.get('kids') or {}).values():
        if k: walk(k)
for sp in SPECS.values():
    walk(sp['tree'])
    for v in list((sp.get('fill') or {}).values()) + list((sp.get('weapons') or {}).values()) + list(sp.get('sideHeads') or []): used.add(v)
r3 = lambda v: [round(x, 3) for x in v]
parts = {}
for ref in sorted(used):
    kit, pid = ref.split(':'); p = PARTS[kit][pid]; hb = p['hitbox']['box']
    parts[ref] = {'slot': p['slot'], 'name': p['name'], 'plugs': {n: r3(pl['at']) + r3(pl['dir']) + [round(pl.get('scale', 1), 3)] for n, pl in p['plugs'].items()},
                  'm': [[m, b] for grp in ('frame', 'armor') for m, b in (p.get(grp) or {}).items()], 'hb': r3(hb['centre']) + r3(hb['size'])}
schemes = {k: {'base': list(d['schemes'].values())[0], 'all': d['schemes'], 'glow': d.get('glow', [])} for k, d in K.items()}
data = {'specs': SPECS, 'parts': parts, 'schemes': schemes}
out = os.path.join(here, '..', 'src', '27-kit-bodies-data.js')
js = '// Sandbox 27 data: kit parts for the core six (made in Blender, ours). Written by sandbox/tools/kit_bodies_data.py; do not edit by hand.\nconst KB_DATA=' + json.dumps(data, separators=(',', ':')) + ';\n'
open(out, 'w').write(js); print(len(parts), 'parts,', len(js) // 1024, 'KB ->', out)
