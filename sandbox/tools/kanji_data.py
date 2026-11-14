# Writes sandbox/src/30-cinematic-data.js: stroke paths (in stroke order) for the kanji title cards.
# Source: KanjiVG by Ulrich Apel, CC BY-SA 3.0 (https://kanjivg.tagaini.net). Only the stroke path data is kept.
# Run: python3 sandbox/tools/kanji_data.py
import json, os, re, urllib.request
here = os.path.dirname(os.path.abspath(__file__))
# kanji -> meaning shown under the card
K = {'炎': 'BLAZE', '嵐': 'STORM', '水': 'WATER', '剣': 'SWORD', '王': 'KING', '怒': 'RAGE', '終': 'THE END', '破': 'BREAK',
     '巨': 'TITAN', '雷': 'THUNDER', '盾': 'SHIELD', '竜': 'DRAGON', '樹': 'GREAT TREE', '斬': 'CUT DOWN', '撃': 'STRIKE',
     '滅': 'RUIN', '魂': 'SOUL', '翼': 'WINGS'}
BASE = 'https://raw.' + 'githubusercontent.com/KanjiVG/kanjivg/master/kanji/%05x.svg'
out = {}
for ch, mean in K.items():
    svg = urllib.request.urlopen(BASE % ord(ch), timeout=20).read().decode('utf8')
    paths = re.findall(r'<path[^>]*?\sd="([^"]+)"', svg)
    assert paths, ch
    out[ch] = {'m': mean, 'p': paths}
    print(ch, mean, len(paths), 'strokes')
js = ('/* Kanji stroke paths for the Sandbox 30 title cards, in stroke order (109x109 box).\n'
      '   From KanjiVG by Ulrich Apel, CC BY-SA 3.0, https://kanjivg.tagaini.net . Made by sandbox/tools/kanji_data.py. */\n'
      'const KANJI=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(here, '..', 'src', '30-cinematic-data.js'), 'w', encoding='utf8').write(js)
print('ok', len(js), 'bytes')
