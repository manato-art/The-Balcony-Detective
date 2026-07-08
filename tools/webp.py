#!/usr/bin/env python3
# PNGを縮小＋WebP化して読み込みを軽量化。表示サイズに合わせて最大幅を制限。
#   python3 tools/webp.py
import os
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')
# (dir, 最大幅, 品質, alpha保持)
CFG = [('balcony',1024,80,False), ('room',1024,80,False), ('facade',640,82,False),
       ('items',512,88,True), ('chars',384,88,True)]
gp = gw = 0
for d, maxw, q, alpha in CFG:
    dp = os.path.join(ROOT, d)
    if not os.path.isdir(dp): continue
    tp = tw = n = 0
    for f in sorted(os.listdir(dp)):
        if not f.endswith('.png'): continue
        p = os.path.join(dp, f)
        img = Image.open(p)
        if img.width > maxw:
            img = img.resize((maxw, round(img.height*maxw/img.width)), Image.LANCZOS)
        img = img.convert('RGBA' if alpha else 'RGB')
        out = p[:-4] + '.webp'
        img.save(out, 'WEBP', quality=q, method=6)
        tp += os.path.getsize(p); tw += os.path.getsize(out); n += 1
    gp += tp; gw += tw
    print('%-8s %3d枚  PNG %5dKB -> WebP %4dKB  (%.0f%%減)' % (d, n, tp//1024, tw//1024, 100*(1-tw/max(tp,1))))
print('---- 合計  PNG %5dKB -> WebP %4dKB  (%.0f%%減) ----' % (gp//1024, gw//1024, 100*(1-gw/max(gp,1))))
