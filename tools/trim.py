#!/usr/bin/env python3
# 透過PNGを「中身の外接矩形」に切り詰める。これで img の下端＝物体の底になり、接地影が足元に正しく付く。
#   python3 trim.py <dir> [pad]
import sys, os
from PIL import Image

DIR = sys.argv[1]
PAD = int(sys.argv[2]) if len(sys.argv) > 2 else 6

for f in sorted(os.listdir(DIR)):
    if not f.endswith('.png'):
        continue
    p = os.path.join(DIR, f)
    img = Image.open(p).convert('RGBA')
    # アルファ>0 の外接矩形
    alpha = img.getchannel('A')
    bbox = alpha.getbbox()
    if not bbox:
        continue
    l, t, r, b = bbox
    l = max(0, l - PAD); t = max(0, t - PAD)
    r = min(img.width, r + PAD); b = min(img.height, b + PAD)
    img.crop((l, t, r, b)).save(p)
    print('%-18s %dx%d' % (f, r - l, b - t))
