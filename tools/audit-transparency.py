#!/usr/bin/env python3
# 全アイテムの「不透明なまま残った市松(背景焼き込み)」を監査。
# 各画像の外周(alpha0)から市松2色(濃い灰C1・白C2)を実測し、不透明画素で「近傍にC1とC2が両方ある(=市松)」領域を検出。
#   python3 tools/audit-transparency.py <dir>
import sys, os
import numpy as np
from PIL import Image, ImageFilter

DIR = sys.argv[1]
def dil(mask, size):
    return np.asarray(Image.fromarray((mask*255).astype(np.uint8),'L').filter(ImageFilter.MaxFilter(size)))>0

rows=[]
for f in sorted(os.listdir(DIR)):
    if not f.endswith('.png'): continue
    im=Image.open(os.path.join(DIR,f)).convert('RGBA'); arr=np.asarray(im)
    alpha=arr[:,:,3]; g=arr[:,:,:3].mean(2)
    bg = alpha<12
    if bg.sum()<200: 
        rows.append((f,0.0,'(外周少・判定不可)')); continue
    bgg=g[bg]
    C1=np.percentile(bgg,20); C2=np.percentile(bgg,88)  # 濃い灰 / 白
    if C2-C1<18: 
        rows.append((f,0.0,'(市松の2色差小)')); continue
    op=alpha>=12
    nd=op&(np.abs(g-C1)<12); nl=op&(np.abs(g-C2)<12)
    checker=(nd|nl)&dil(nd,11)&dil(nl,11)   # 近傍にC1とC2が両在
    pct=100.0*checker.mean()
    rows.append((f,pct,'C1=%d C2=%d'%(C1,C2)))
rows.sort(key=lambda r:-r[1])
print('=== 市松残り 上位(>=0.3%) ===')
n=0
for f,p,info in rows:
    if p>=0.3: print('  %-18s %.2f%%  %s'%(f,p,info)); n+=1
print('該当:',n,'/',len(rows))
