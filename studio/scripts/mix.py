import json,subprocess,os,re
S=json.load(open('/home/claude/scripts/sync.json')); M='/home/claude/music'; O='/home/claude/build/audio'
os.makedirs(O,exist_ok=True)
for vid,c in S.items():
    ins=['-ss',str(c['start']),'-t','19','-i',f"{M}/{c['track']}.mp3"]
    fc=["[0:a]aformat=sample_rates=44100:channel_layouts=stereo,afade=t=in:d=0.04,afade=t=out:st=16.4:d=2.6[m]"]
    labels=['[m]']
    for k,cut in enumerate([]):
        ins+=['-i',f'{M}/sfx_whoosh.mp3']
        dl=int(max(0,cut-0.53)*1000)
        vol=0.45 if k<3 else 0.6
        fc.append(f"[{k+1}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={vol},adelay={dl}|{dl}[w{k}]"); labels.append(f'[w{k}]')
    fc.append(''.join(labels)+f"amix=inputs={len(labels)}:normalize=0:duration=first[mx]")
    base=['ffmpeg','-v','info','-y']+ins
    meas=subprocess.run(base+['-filter_complex',';'.join(fc)+';[mx]loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json[o]','-map','[o]','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(re.findall(r'\{[^{}]*\}',meas)[-1])
    ln=(f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
        f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    r=subprocess.run(['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(fc)+f';[mx]{ln},aresample=44100,atrim=0:19[o]','-map','[o]','-c:a','aac','-b:a','192k',f'{O}/{vid}.m4a'],capture_output=True,text=True)
    print(vid,r.returncode,r.stderr[-300:],'in_I',j['input_i'])
