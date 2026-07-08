#!/usr/bin/env python3
# 囲まれた透過漏れ(閉領域の市松)を除去。市松=「明るめ×近傍の明暗差>=30(2色が細かく交互)」。無地/輪郭/なだらか陰影は除外。
# 紙・格子系(カレンダー/新聞/名刺/ボードゲーム箱/蜘蛛の巣等)は誤検出源なのでDENYで除外。floodは使わない。
#   python3 tools/fix-enclosed.py <dir>
import sys, os
import numpy as np
from PIL import Image, ImageFilter
DENY = {'calendar','papers','mail','namecards','flyer','resume','manuscript','books','box_dice','cobweb','tarot','ofuda_v',
        'futon','towel','towel_white','towel_sport','dakimakura'}  # 格子/キルティング等の明るい模様は誤検出源
DIR = sys.argv[1]
for f in sorted(os.listdir(DIR)):
    if not f.endswith('.png'): continue
    if f[:-4] in DENY: 
        print('%-16s skip(deny)' % f); continue
    p = os.path.join(DIR, f)
    im = Image.open(p).convert('RGBA'); arr = np.asarray(im).copy(); alpha = arr[:,:,3]
    g = arr[:,:,:3].mean(axis=2).astype(np.uint8); gimg = Image.fromarray(g,'L')
    lmin = np.asarray(gimg.filter(ImageFilter.MinFilter(7))).astype(int)
    lmax = np.asarray(gimg.filter(ImageFilter.MaxFilter(7))).astype(int)
    gi = g.astype(int)
    checker = (alpha>12)&(gi>=178)&(lmin>=150)&(lmax<=256)&((lmax-lmin)>=30)
    m = Image.fromarray((checker*255).astype(np.uint8),'L')
    m = m.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(3))
    final = np.asarray(m)>0; pct = 100.0*final.mean()
    if final.any():
        arr[:,:,3] = np.where(final,0,alpha).astype(np.uint8); Image.fromarray(arr,'RGBA').save(p)
    if pct>0.3: print('%-16s %.2f%%' % (f, pct))
