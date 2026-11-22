import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

spec = json.load(open('/home/claude/scripts/videos.json'))
SYNC = json.load(open('/home/claude/scripts/sync.json'))
FT = '/home/claude/footage'
OV = '/home/claude/build/ov'
SC = '/home/claude/build/scenes'
OUT = '/home/claude/out'
OUT2 = '/home/claude/out/music'
os.makedirs(SC, exist_ok=True)
os.makedirs(OUT2, exist_ok=True)
ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30',
       '-g', '60', '-profile:v', 'high', '-an', '-movflags', '+faststart']
FIRST, SHOT, END = 3.8, 3.2, 3.6
X = 0.4  # crossfade length


def cover(cx, zoom_dur, punch=0.0):
    return (f"fps=30,scale=w='if(gt(iw/ih,1080/1920),-2,1080)':h='if(gt(iw/ih,1080/1920),1920,-2)':flags=bicubic,"
            f"crop=1080:1920:'max(0,min(iw-1080,iw*{cx}-540))':'(ih-1920)/2',"
            f"scale=w='trunc(1080*(1+0.06*t/{zoom_dur}+{punch}*pow(max(0,1-t/0.28),2))/2)*2':h=-2:eval=frame:flags=bicubic,"
            f"crop=1080:1920,setsar=1,eq=saturation=1.08:contrast=1.03")


def slide(st):
    return f"y='if(lt(t,{st}),36,max(0,36-(t-{st})*90))'"


def run(cmd, out):
    tmp = out[:-4] + '.tmp.mp4'
    r = subprocess.run(cmd + [tmp], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(out + '\n' + r.stderr[-2000:])
    os.replace(tmp, out)
    return out


def scene(vid, i, s):
    d = SYNC[vid]['durs'][i] + (X / 2 if i == 0 else X)
    out = f'{SC}/{vid}_{i}.mp4'
    st = s['ss'] if i == 0 else max(0, s['ss'] - X / 2)
    cmd = ['ffmpeg', '-v', 'error', '-y', '-ss', str(st), '-t', str(d), '-i', f"{FT}/{s['src']}.mp4",
           '-loop', '1', '-framerate', '30', '-t', str(d), '-i', f'{OV}/frame.png',
           '-loop', '1', '-framerate', '30', '-t', str(d), '-i', f'{OV}/{vid}_cap{i}.png']
    fc = (f"[0:v]{cover(s['cx'], d, 0 if i == 0 else 0.03)}[v0];[1:v]format=rgba[f];[v0][f]overlay=shortest=1[v1];"
          f"[2:v]format=rgba,fade=in:st=0.35:d=0.4:alpha=1[c];")
    if i == 0:
        cmd += ['-loop', '1', '-framerate', '30', '-t', str(d), '-i', f'{OV}/{vid}_hook.png']
        fc += (f"[3:v]format=rgba[h];[v1][h]overlay=0:0:shortest=1[v2];"
               f"[v2][c]overlay={slide(0.35)}:shortest=1,format=yuv420p[out]")
    else:
        fc += f"[v1][c]overlay={slide(0.35)}:shortest=1,format=yuv420p[out]"
    return run(cmd + ['-filter_complex', fc, '-map', '[out]', '-frames:v', str(round(d * 30))] + ENC, out)


HOLD = -1.0  # extra seconds the end card stays frozen
TOTAL = 17.0 + HOLD


def endcard(vid, s):
    out = f'{SC}/{vid}_9end.mp4'
    d = SYNC[vid]['durs'][-1] + X / 2 + HOLD
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                         '-of', 'csv=p=0', f"{FT}/{s['src']}.mp4"]))
    start = min(s['ss'] + SYNC[vid]['durs'][-2], dur - 0.5)
    bg = f'{SC}/{vid}_endbg.png'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-i', f"{FT}/{s['src']}.mp4", '-frames:v', '1',
                    '-vf', f"{cover(s['cx'], 8)},scale=270:480,boxblur=12:2,scale=1080:1920,"
                           f"drawbox=x=0:y=0:w=iw:h=ih:color=0x003050@0.45:t=fill", bg], check=True)
    cmd = ['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', bg,
           '-loop', '1', '-framerate', '30', '-t', str(d), '-i', f'{OV}/{vid}_end.png']
    fc = (f"[0:v]format=rgba,loop=-1:1,trim=duration={d},setpts=N/30/TB[b];"
          f"[1:v]format=rgba,fade=in:st=0.3:d=0.45:alpha=1[e];[b][e]overlay={slide(0.3)}:shortest=1,format=yuv420p[out]")
    return run(cmd + ['-filter_complex', fc, '-map', '[out]', '-frames:v', str(round(d * 30))] + ENC, out)


def assemble(vid, n):
    parts = [f'{SC}/{vid}_{i}.mp4' for i in range(n)] + [f'{SC}/{vid}_9end.mp4']
    cuts = SYNC[vid]['cuts']
    out = f'{OUT2}/{vid}.mp4'
    aud = f'/home/claude/build/audio/{vid}.m4a'
    cmd = ['ffmpeg', '-v', 'error', '-y']
    for p in parts:
        cmd += ['-i', p]
    cmd += ['-i', aud]
    fc, prev = [], '[0:v]'
    for k, c in enumerate(cuts):
        lab = f'[x{k}]'
        fc.append(f"{prev}[{k + 1}:v]xfade=transition=fade:duration={X}:offset={c - X / 2:.4f}{lab}")
        prev = lab
    fc.append(f"{prev}format=yuv420p[v]")
    cmd += ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', f'{len(parts)}:a',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', '30', '-g', '60',
            '-c:a', 'copy', '-t', str(TOTAL), '-movflags', '+faststart']
    return run(cmd, out)


if __name__ == '__main__':
    only = sys.argv[1:] or None
    jobs = []
    with ThreadPoolExecutor(int(os.environ.get('J', '4'))) as ex:
        for v in spec:
            if only and v['id'] not in only:
                continue
            for i, s in enumerate(v['shots']):
                jobs.append(ex.submit(scene, v['id'], i, s))
            jobs.append(ex.submit(endcard, v['id'], v['shots'][-1]))
        for j in jobs:
            print('done', j.result(), flush=True)
    for v in spec:
        if only and v['id'] not in only:
            continue
        print('final', assemble(v['id'], len(v['shots'])))
