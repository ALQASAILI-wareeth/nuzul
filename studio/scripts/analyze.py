import librosa, numpy as np, sys, json
res={}
for f in sys.argv[1:]:
    y,sr=librosa.load(f,sr=22050,mono=True)
    tempo,beats=librosa.beat.beat_track(y=y,sr=sr,units='time')
    tempo=float(np.atleast_1d(tempo)[0])
    rms=librosa.feature.rms(y=y,hop_length=512)[0]; t=librosa.times_like(rms,sr=sr,hop_length=512)
    db=20*np.log10(rms+1e-6)
    W=17.0
    best=None
    for b in beats:
        if b+W>t[-1]-1: break
        m=(t>=b)&(t<b+W)
        seg=db[m]
        s0=db[(t>=b)&(t<b+2)].mean()
        score=seg.mean()+0.5*s0-0.5*seg.std()
        if best is None or score>best[0]: best=(score,b,seg.mean(),s0)
    # energy profile 5s bins
    prof=[round(float(db[(t>=i)&(t<i+5)].mean()),1) for i in range(0,int(t[-1]),5)]
    cent=float(librosa.feature.spectral_centroid(y=y,sr=sr).mean())
    res[f]=dict(tempo=round(tempo,1),start=round(float(best[1]),2),wmean=round(float(best[2]),1),s0=round(float(best[3]),1),cent=int(cent),prof=prof)
    print(f,res[f],flush=True)
json.dump(res,open('analysis.json','w'))
