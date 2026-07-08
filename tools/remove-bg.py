#!/usr/bin/env python3
# gpt-image-2 が描いた不透明な市松/白背景を、4隅からのフラッドフィルで透明化する。
# 物体の太い輪郭でフィルが止まるため、物体内部の白は保持される。
#   python3 remove-bg.py <dir> [thresh]
import sys, os
import numpy as np
from PIL import Image, ImageDraw

DIR = sys.argv[1]
THRESH = int(sys.argv[2]) if len(sys.argv) > 2 else 80
SENT = (0, 254, 1)  # フラッド用センチネル色（物体内部には到達しないので衝突しない）

for f in sorted(os.listdir(DIR)):
    if not f.endswith('.png'):
        continue
    p = os.path.join(DIR, f)
    orig = np.asarray(Image.open(p).convert('RGB'))
    H, W = orig.shape[:2]
    work = Image.open(p).convert('RGB')
    # 種点=4隅+各辺中点。物体に乗ってしまう暗い点は除外（min>180の明るい点のみ種にする）
    seeds = [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1),
             (W // 2, 0), (W // 2, H - 1), (0, H // 2), (W - 1, H // 2)]
    for (x, y) in seeds:
        if int(orig[y, x].min()) > 180:
            ImageDraw.floodfill(work, (x, y), SENT, thresh=THRESH)
    warr = np.asarray(work)
    bg = np.all(warr == SENT, axis=2)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    out = np.dstack([orig, alpha]).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(p)
    print('%-18s 透明化 %2.0f%%' % (f, 100 * bg.mean()))
