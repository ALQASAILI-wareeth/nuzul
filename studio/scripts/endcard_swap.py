"""Replace only the ending card of the finished videos (media/nuzul_*.mp4) with the texts in videos.json.

Why: the videos were rendered with "best price" endings. NUZUL shows no prices, so the ending now uses the
approved wording. The footage is not needed: the ending is a frozen blurred frame, so the last clean frame of
each video (after the cross-fade, before the old text fades in) is reused as the background and the new card is
faded in with the original timing (fade 0.45 s, 36 px slide at 90 px/s). The frozen background
is taken straight from the video stream (no RGB round trip), so there is no brightness or colour jump.
Audio is copied untouched.

Usage (from the repository root):  python3 studio/scripts/endcard_swap.py <output-folder> [<folder with the original videos>]

The originals are the videos of commit fbded98 ("best price" endings); without the second argument they are read
from media/. Take them from git when media/ already holds the new versions:
    git show fbded98:media/nuzul_01_nuzul_intro.mp4 > orig/nuzul_01_nuzul_intro.mp4   (and the other four)
"""
import json, os, subprocess, sys, types
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'media'))
SRC = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'media'))
TMP = os.path.join(OUT, '_endcard_tmp')
os.makedirs(TMP, exist_ok=True)

# load the overlay helpers with local paths (the original script points at the first render machine)
src = open(os.path.join(ROOT, 'studio', 'scripts', 'overlays.py'), encoding='utf-8').read()
src = src.replace("FD = '/home/claude/fonts/'", "FD = %r" % (os.path.join(ROOT, 'studio', 'fonts') + os.sep))
src = src.replace("OUT = '/home/claude/build/ov'", "OUT = %r" % TMP).split("if __name__ == '__main__':")[0]
ov = types.ModuleType('ov'); exec(compile(src, 'overlays', 'exec'), ov.__dict__)
spec = json.load(open(os.path.join(ROOT, 'studio', 'scripts', 'videos.json'), encoding='utf-8'))


def frame(path, k):
    out = os.path.join(TMP, 'f_%d.png' % k)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-vf', "select='eq(n\\,%d)'" % k, '-vsync', '0',
                    '-frames:v', '1', out], check=True)
    return np.asarray(Image.open(out).convert('RGB')).astype(int)


def find_timing(path, first=360):
    """Return the index of the last text-free frame of the frozen ending (the old text starts fading in after it)."""
    seq = os.path.join(TMP, 's_%03d.png')
    for f in os.listdir(TMP):
        if f.startswith('s_'):
            os.remove(os.path.join(TMP, f))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-vf', "select='gte(n\\,%d)',scale=270:480" % first,
                    '-vsync', '0', seq], check=True)
    fr = {}
    for f in sorted(os.listdir(TMP)):
        if f.startswith('s_'):
            fr[first + int(f[2:5]) - 1] = np.asarray(Image.open(os.path.join(TMP, f)).convert('RGB')).astype(int)
    last_k = max(fr); last = fr[last_k]
    bgpart = lambda a: np.concatenate([a[:130], a[405:]])        # rows without card text (scaled by 1/4)
    k = last_k
    while k - 1 in fr and np.abs(bgpart(fr[k - 1]) - bgpart(last)).mean() <= 1.2:
        k -= 1
    base = fr[k]; kb = k
    while kb + 1 in fr and np.abs(fr[kb + 1][150:375] - base[150:375]).mean() < 0.25:
        kb += 1
    return kb


for v in spec:
    vid = v['id']
    src_mp4 = os.path.join(SRC, 'nuzul_%s.mp4' % vid)
    kb = find_timing(src_mp4); tf = kb / 30.0
    card = os.path.join(TMP, vid + '_end.png'); ov.endcard_layer(v['cta']).save(card)
    out = os.path.join(OUT, 'nuzul_%s.mp4' % vid); tmp = out[:-4] + '.new.mp4'
    # input 1 = the same video opened at the clean frame: that frame is frozen as the background, so the picture
    # never leaves the video's own colour space (no RGB round trip, no brightness or colour jump)
    fc = ("[1:v]trim=end_frame=1,loop=loop=-1:size=1,setpts=N/30/TB,trim=duration=16[bg];"
          "[2:v]format=rgba,fade=in:st=%.4f:d=0.45:alpha=1[e];"
          "[bg][e]overlay=x=0:y='if(lt(t,%.4f),36,max(0,36-(t-%.4f)*90))':shortest=1[seg];"
          "[0:v][seg]overlay=enable='gte(t,%.4f)':shortest=1,format=yuv420p[v]") % (tf, tf, tf, kb / 30.0 - 0.005)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src_mp4, '-ss', '%.4f' % (kb / 30.0 - 0.001), '-i', src_mp4,
                    '-loop', '1', '-framerate', '30', '-t', '16', '-i', card, '-filter_complex', fc,
                    '-map', '[v]', '-map', '0:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-r', '30', '-g', '60',
                    '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-t', '16', '-movflags', '+faststart', tmp],
                   check=True)
    os.replace(tmp, out)
    print(vid, 'background frame', kb, 'text starts', round(tf, 4), '->', out, os.path.getsize(out), 'bytes', flush=True)
