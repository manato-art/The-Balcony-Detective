#!/usr/bin/env python3
# 囲まれた背景残り(車輪の中/スポーク間 等、外周フラッドが届かない閉領域の影・市松)を透明化。
# 物体=不透明かつ(彩度あり or 暗い輪郭)。非物体=透明 or 明るい低彩度。非物体を外周から連結成長させ、
# 到達しなかった非物体(=囲まれた穴)だけ透明化。輪郭で囲まれた明るい"物体"は外周と地続きなので守られる。
#   python3 tools/fill-enclosed-bg.py <dir>
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
    obj = opaque & ((sat>28) | (gray<140))     # 物体=彩度 or 暗い輪郭
    nonobj = ~obj                                # 透明 or 明るい低彩度
    # 外周(画像端)の非物体から連結成長
    seed=np.zeros_like(nonobj); seed[0,:]=nonobj[0,:]; seed[-1,:]=nonobj[-1,:]; seed[:,0]=nonobj[:,0]; seed[:,-1]=nonobj[:,-1]
    grow=seed.copy()
    for _ in range(80):
        nn=dil(grow,7)&nonobj
        if nn.sum()==grow.sum(): break
        grow=nn
    enclosed = nonobj & opaque & (~grow)        # 到達しなかった不透明の非物体=囲まれた背景残り
    enclosed = dil(enclosed,3)&nonobj           # 少し広げて境界も
    pct=100.0*enclosed.mean()
    if enclosed.any():
        arr[:,:,3]=np.where(enclosed,0,alpha).astype(np.uint8); Image.fromarray(arr,'RGBA').save(os.path.join(DIR,f))
    if pct>0.2: print('%-16s 閉領域除去 %.2f%%'%(f,pct))
