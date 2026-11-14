# Mythic Forge: turn the 2.0 Blender kit files (json with plugs, hitboxes and meshes) into part-data scripts (T049, Nov 13 2026).
# Usage: python3 tools/kits2js.py <folder with mech_kit_R2.json, kaiju_kit.json, weapons_kit.json, dragon_kit.json, hydra_kit.json, tree_shepherd_kit.json>
# Writes parts/k2-<kit>.js (data only). parts/k2-kits.js reads them and adds the parts to the library ("New Kits" tab).
# A part another kit already has (same id and same mesh) is written once, in the kit it came from.
import json, sys, os, hashlib
src = sys.argv[1]; out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'parts')
ORDER = [('mech', 'mech_kit_R2.json', 'Mech kit'), ('kaiju', 'kaiju_kit.json', 'Kaiju kit'), ('weapons', 'weapons_kit.json', 'Weapons kit'),
         ('dragon', 'dragon_kit.json', 'Dragon kit'), ('hydra', 'hydra_kit.json', 'Hydra kit'), ('tree', 'tree_shepherd_kit.json', 'Tree shepherd kit')]
seen = {}; total = 0
r3 = lambda v: [round(x, 3) for x in v]
for key, fn, title in ORDER:
    d = json.load(open(os.path.join(src, fn))); parts = []; skipped = []
    for p in d['parts']:
        meshes = [[m, b] for grp in ('frame', 'armor') for m, b in (p.get(grp) or {}).items()]
        h = hashlib.md5(json.dumps(meshes).encode()).hexdigest()
        if seen.get(p['id']) and seen[p['id']][1] == h: skipped.append(p['id']); continue
        if p['id'] not in seen: seen[p['id']] = (key, h)
        plugs = {n: r3(pl['at']) + r3(pl['dir']) + ([round(pl['scale'], 3)] if 'scale' in pl else []) for n, pl in p['plugs'].items()}
        hb = p['hitbox']; parts.append({'id': p['id'], 'slot': p['slot'], 'name': p['name'], 'about': p.get('about', ''), 'sided': bool(p.get('sided')), 'plugs': plugs, 'm': meshes,
            'hb': {'box': [r3(hb['box']['centre']), r3(hb['box']['size'])], 'cap': [hb['capsule']['axis'], hb['capsule']['radius'], hb['capsule']['length'], r3(hb['capsule']['centre'])]}})
    sch = d['schemes']; base = list(sch.keys())[0]
    data = {'kit': key, 'title': title, 'ticket': d.get('ticket'), 'glow': d.get('glow', []), 'base': sch[base], 'schemes': {k: v for k, v in sch.items() if k != base}, 'parts': parts, 'shared': skipped}
    js = '// Mythic Forge 2.0 kit data: %s (%s, made in Blender by MajorasPride with Claude, ours). Built by tools/kits2js.py; do not edit by hand.\n(window.MF_KIT_DATA = window.MF_KIT_DATA || []).push(%s);\n' % (title, d.get('ticket'), json.dumps(data, separators=(',', ':')))
    open(os.path.join(out, 'k2-%s.js' % key), 'w').write(js); total += len(parts)
    print(key, len(parts), 'parts,', len(skipped), 'shared with an earlier kit,', len(js) // 1024, 'KB')
print('total', total)
