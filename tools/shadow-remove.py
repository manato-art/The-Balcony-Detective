#!/usr/bin/env python3
# 焼き込みの接地影(gpt "soft contact shadow")を除去。影=明るい低彩度で輪郭線が無く外周(透明)と地続き。
# 外周の透明から「明るい×低彩度」画素へ領域を育て、暗い輪郭/彩度色で停止→到達した影だけ透明化。物体は輪郭線で守られる。
#   python3 tools/shadow-remove.py <dir>
import sys, os
import numpy as np
from PIL import Image, ImageFilter
def dil(m,s=7): return np.asarray(Image.fromarray((m*255).astype(np.uint8),'L').filter(ImageFilter.MaxFilter(s)))>0
DIR=sys.argv[1]
for f in sorted(os.listdir(DIR)):
    if not f.endswith('.png'): continue
    im=Image.open(os.path.join(DIR,f)).convert('RGBA'); arr=np.asarray(im).copy()
    alpha=arr[:,:,3]; rgb=arr[:,:,:3].astype(int)
    gray=rgb.mean(2); sat=rgb.max(2)-rgb.min(2)
    opaque=alpha>=12
    cand=(opaque&(gray>=190)&(gray<=242)&(sat<=22)) | (alpha<12)  # 影候補 or 透明
    grow=alpha<12
    for _ in range(60):
        nn=dil(grow,7)&cand
        if nn.sum()==grow.sum(): break
        grow=nn
    shadow=grow&opaque
    pct=100.0*shadow.mean()
    if shadow.any():
        arr[:,:,3]=np.where(shadow,0,alpha).astype(np.uint8); Image.fromarray(arr,'RGBA').save(os.path.join(DIR,f))
    if pct>0.2: print('%-16s 影除去 %.2f%%'%(f,pct))
