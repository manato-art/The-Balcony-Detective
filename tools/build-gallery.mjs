// 全生成アセットの確認用ギャラリー(tools/gallery-all.html)を組む。
//   node tools/build-gallery.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dir, '..');
const { VT_RESIDENTS } = require(ROOT + '/js/data/residents.js');
const { VT_MANSIONS } = require(ROOT + '/js/data/mansions.js');

const cName = {}, cCat = {};
VT_RESIDENTS.forEach((r) => { cName[r.id] = r.name; cCat[r.id] = r.cat; });
const mName = {};
VT_MANSIONS.forEach((m) => { mName[m.id] = m.name; });

const ls = (d) => fs.readdirSync(path.join(ROOT, 'assets', d)).filter((f) => f.endsWith('.png')).map((f) => f.replace('.png', ''));

const CAT_ORDER = ['normal', 'hot', 'trap', 'rare', 'secret'];
const chars = ls('chars').sort((a, b) => (CAT_ORDER.indexOf(cCat[a]) - CAT_ORDER.indexOf(cCat[b])) || a.localeCompare(b));
const balc = ls('balcony');
const items = ls('items').sort();

const V = Date.now();
const card = (dir, id, label, cls) =>
  `<div class="cell ${cls || ''}"><div class="ph"><img loading="lazy" src="/assets/${dir}/${id}.png?v=${V}" alt="${id}"></div><div class="lb">${label}</div></div>`;

const html =
`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>全アセット確認 — ベランダ探偵</title><style>
:root{--chk:#e7e2ee}*{box-sizing:border-box}
body{margin:0;font-family:"Hiragino Maru Gothic ProN","Hiragino Sans",system-ui,sans-serif;background:#faf7fb;color:#3a3442;padding:22px 14px 60px}
.wrap{max-width:1100px;margin:0 auto}h1{text-align:center;font-size:20px;margin:0 0 4px}
.lead{text-align:center;color:#8a8593;font-size:13px;margin:0 0 20px}
h2{font-size:14px;letter-spacing:.08em;color:#6a6478;border-left:5px solid #58cc02;padding-left:10px;margin:28px 0 12px}
.grid{display:grid;gap:12px}
.chars-grid{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}
.balc-grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.items-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr))}
.cell{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 6px 16px rgba(60,40,80,.07);text-align:center}
.cell .ph{aspect-ratio:1/1}
.balc-grid .cell .ph{aspect-ratio:3/2}
.cell img{width:100%;height:100%;object-fit:cover;display:block}
.items-grid .cell .ph{background-image:linear-gradient(45deg,var(--chk) 25%,transparent 25%),linear-gradient(-45deg,var(--chk) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,var(--chk) 75%),linear-gradient(-45deg,transparent 75%,var(--chk) 75%);background-size:18px 18px;background-position:0 0,0 9px,9px -9px,-9px 0}
.items-grid .cell img{object-fit:contain}
.cell .lb{padding:7px 4px;font-size:11.5px;font-weight:800;color:#55505e;line-height:1.3}
.base .lb{color:#b0788a}
.badge{display:inline-block;font-size:10px;font-weight:800;color:#fff;background:#b7a9c9;border-radius:6px;padding:1px 5px;margin-left:3px}
</style></head><body><div class="wrap">
<h1>全アセット確認（${chars.length + balc.length + items.length}枚）</h1>
<p class="lead">住人${chars.length}・ベランダ${balc.length}・小物${items.length}。デフォルメ調で揃ってるか／変な絵がないか、ざっと見てください。</p>
<h2>住人 ${chars.length}体</h2>
<div class="grid chars-grid">${chars.map((id) => card('chars', id, (cName[id] || id) + ' <span class="badge">' + (cCat[id] || '') + '</span>')).join('')}</div>
<h2>ベランダ背景 ${balc.length}種（正面）</h2>
<div class="grid balc-grid">${balc.map((id) => card('balcony', id, mName[id] || id)).join('')}</div>
<h2>小物 ${items.length}種（透過）</h2>
<div class="grid items-grid">${items.map((id) => card('items', id, id)).join('')}</div>
</div></body></html>`;

fs.writeFileSync(path.join(ROOT, 'tools', 'gallery-all.html'), html);
console.log('書き出し: tools/gallery-all.html （住人' + chars.length + ' / ベランダ' + balc.length + ' / 小物' + items.length + '）');
