# Makes the sandbox voice lines (T054) offline with Kokoro TTS (kokoro-onnx runner: MIT; Kokoro-82M weights + voices: Apache 2.0)
# and writes sandbox/src/29-sound-data.js (small mono mp3s as base64).
# Needs: pip install kokoro-onnx soundfile --break-system-packages, ffmpeg, and the two model files from
# https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 (kokoro-v1.0.int8.onnx, voices-v1.0.bin) in MODEL_DIR.
# Run: python3 sandbox/tools/make_voices.py /path/to/model_dir
import os, sys, base64, subprocess, tempfile, json
import soundfile as sf
from kokoro_onnx import Kokoro
MODEL_DIR = sys.argv[1] if len(sys.argv) > 1 else '.'
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, '..', 'src', '29-sound-data.js')
# id: (voice, speed, text, filter)  filter: '' = clean, 'tv' = news van radio, 'old' = 1950s newsreel radio
LINES = {
 'news_open':  ('am_michael', 1.0,  "This is Channel Seven, live over Neon City.", 'tv'),
 'news_hit':   ('am_michael', 1.05, "Massive damage downtown! Stay in your shelters!", 'tv'),
 'news_ult':   ('am_michael', 1.08, "Get the chopper closer, we need that shot!", 'tv'),
 'news_ko':    ('am_michael', 1.05, "A titan is down! I repeat, a titan is down!", 'tv'),
 'cit_run':    ('af_heart',   1.15, "Run! It's coming this way!", ''),
 'cit_car':    ('am_adam',    1.1,  "My car! That was my car!", ''),
 'cit_robot':  ('af_bella',   1.1,  "Is that a giant robot?", ''),
 'ult_go':     ('am_onyx',    0.95, "Ultimate!", ''),
 'ult_finish': ('am_onyx',    0.95, "Finish it!", ''),
 'ult_chorus': ('am_fenrir',  0.85, "Chorus of Ruin!", ''),
 'old_open':   ('bm_george',  0.95, "Good evening, ladies and gentlemen. A monster walks among us tonight!", 'old'),
 'old_hit':    ('bm_george',  1.0,  "Folks, this reporter has never seen anything like it!", 'old'),
 'old_ult':    ('bm_george',  1.0,  "Heavens above, look at the size of that thing!", 'old'),
 'old_ko':     ('bm_george',  1.0,  "The titan has fallen! What a spectacle!", 'old'),
}
FILT = {'': 'highpass=f=70,loudnorm=I=-16:TP=-1.5',
        'tv': 'highpass=f=250,lowpass=f=5000,acompressor=threshold=-20dB:ratio=4,loudnorm=I=-16:TP=-1.5',
        'old': 'highpass=f=400,lowpass=f=3200,acompressor=threshold=-24dB:ratio=6,aecho=0.6:0.3:18:0.25,loudnorm=I=-16:TP=-1.5'}
def pick(*names):
    for n in names:
        p = os.path.join(MODEL_DIR, n)
        if os.path.exists(p): return p
    sys.exit('model file missing in ' + MODEL_DIR + ': ' + names[0])
k = Kokoro(pick('kokoro-v1.0.int8.onnx', 'kokoro.onnx'), pick('voices-v1.0.bin', 'voices.bin'))
data, total = {}, 0
with tempfile.TemporaryDirectory() as td:
    for key, (voice, speed, text, f) in LINES.items():
        samples, sr = k.create(text, voice=voice, speed=speed, lang='en-gb' if voice.startswith('b') else 'en-us')
        w = os.path.join(td, key + '.wav'); m = os.path.join(td, key + '.mp3'); sf.write(w, samples, sr)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', w, '-af', FILT[f], '-ac', '1', '-ar', '22050', '-b:a', '32k', m], check=True)
        b = open(m, 'rb').read(); total += len(b); data[key] = {'t': text, 'a': base64.b64encode(b).decode()}
js = ("/* SANDBOX 29 (T054) voice lines, made offline by sandbox/tools/make_voices.py with Kokoro TTS\n"
      "   (Kokoro-82M weights + voices: Apache 2.0; kokoro-onnx runner: MIT). Mono 32 kbps mp3, base64. */\n"
      "const GFS_VOX=" + json.dumps(data, separators=(',', ':')) + ";\n")
open(out, 'w', encoding='utf8').write(js)
print('ok', len(data), 'lines,', total // 1024, 'KB mp3,', len(js) // 1024, 'KB js')
