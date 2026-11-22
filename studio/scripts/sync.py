import librosa, numpy as np, json
M='/home/claude/music'
PICK={'01_nuzul_intro':('c_intro_wayhome',None),'02_dubai':('c_dubai_medina',None),'03_istanbul':('c_ist_goldensand',None),
      '04_switzerland':('c_sw_romantic',None),'05_maldives':('c_mv_tropchill',None)}
A=json.load(open(f'{M}/analysis_calm.json'))
TOTAL=16.0; TARGETS=[2.6,4.8,7.0,9.2,11.4,13.6]; FPS=30
out={}
for vid,(trk,st) in PICK.items():
    y,sr=librosa.load(f'{M}/{trk}.mp3',sr=22050)
    S=st if st is not None else A[f'{trk}.mp3']['start']
    oenv=librosa.onset.onset_strength(y=y,sr=sr); ot=librosa.times_like(oenv,sr=sr)
    _,beats=librosa.beat.beat_track(onset_envelope=oenv,sr=sr,units='time')
    # snap start to strongest onset beat near S
    def strength(b): i=np.argmin(abs(ot-b)); return oenv[max(0,i-2):i+3].max()
    near=[b for b in beats if abs(b-S)<0.8]; S=max(near,key=strength) if near else S
    cuts=[]
    for tg in TARGETS:
        cand=[b-S for b in beats if abs((b-S)-tg)<0.5 and (not cuts or (b-S)-cuts[-1]>1.6)]
        c=max(cand,key=lambda r:strength(r+S)-0.3*abs(r-tg)) if cand else tg
        cuts.append(round(c*FPS)/FPS)
    edges=[0]+cuts+[TOTAL]
    durs=[round(edges[i+1]-edges[i],4) for i in range(len(edges)-1)]
    out[vid]=dict(track=trk,start=round(float(S),3),cuts=cuts,durs=durs)
    print(vid,out[vid])
json.dump(out,open('sync.json','w'),indent=1)
