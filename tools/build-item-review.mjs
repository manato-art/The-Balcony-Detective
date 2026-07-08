// 小物レビュー用一覧(tools/items-review.html): 画像＋キー名＋「本来の意味(対応ヒント語)」を並べる。
//   node tools/build-item-review.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dir, '..');
const SCE = require(ROOT + '/js/scene.js'); // RULES, ITEM_KINDS, SECRET_ITEMS など

// RULES から variant→対応する日本語ヒント語
const MEAN = {};
for (const r of SCE.RULES) {
  const v = r[1];
  const words = r[0].source.replace(/[?\\]/g, '').replace(/\|/g, '／');
  MEAN[v] = MEAN[v] ? MEAN[v] + '／' + words : words;
}
// 汎用 base kind
Object.assign(MEAN, {
  laundry: '洗濯物（シャツ）', kids: '子供服', suit: 'スーツ', umbrella: '傘', bag: 'かばん', can: '缶',
  sandal: 'サンダル', protein: 'プロテイン', plant: '鉢植え（小）', box: '段ボール箱', guitar: 'ギター',
  dumbbell: 'ダンベル', mirror: '手鏡', camera: 'カメラ', crystal: 'クリスタル/宝石', mail: '郵便物',
  star: '星型の雑貨', bike: '自転車', trophy: 'トロフィー', alert: '警告/注意板', megaphone: 'メガホン',
});
// 未分類の箱フォール
Object.assign(MEAN, { box_open: '（箱の見た目・中身不明）開いた箱', box_tall: '（箱の見た目・中身不明）背の高い箱' });
// シークレット
for (const s of SCE.SECRET_ITEMS) MEAN[s.v] = 'シークレット: ' + s.name;

const V = Date.now();
const files = fs.readdirSync(path.join(ROOT, 'assets', 'items')).filter((f) => f.endsWith('.png')).map((f) => f.replace('.png', '')).sort();

const cards = files.map((id, i) => {
  const mean = MEAN[id] || '（要確認・意味未登録）';
  const warn = MEAN[id] ? '' : ' warn';
  return `<div class="cell${warn}"><div class="no">${i + 1}</div>` +
    `<div class="ph"><img loading="lazy" src="/assets/items/${id}.png?v=${V}" alt="${id}"></div>` +
    `<div class="key">${id}</div><div class="mean">${mean}</div></div>`;
}).join('');

const html =
`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>小物 見比べ表 — ベランダ探偵</title><style>
:root{--chk:#e7e2ee}*{box-sizing:border-box}
body{margin:0;font-family:"Hiragino Maru Gothic ProN","Hiragino Sans",system-ui,sans-serif;background:#faf7fb;color:#3a3442;padding:20px 14px 60px}
.wrap{max-width:1080px;margin:0 auto}h1{text-align:center;font-size:20px;margin:0 0 4px}
.lead{text-align:center;color:#8a8593;font-size:13px;margin:0 0 18px;line-height:1.7}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.cell{position:relative;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 6px 16px rgba(60,40,80,.07);text-align:center;padding-bottom:8px}
.cell.warn{outline:2px solid #ff9600}
.no{position:absolute;top:5px;left:7px;font-size:11px;font-weight:800;color:#b7a9c9}
.ph{aspect-ratio:1/1;background-image:linear-gradient(45deg,var(--chk) 25%,transparent 25%),linear-gradient(-45deg,var(--chk) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,var(--chk) 75%),linear-gradient(-45deg,transparent 75%,var(--chk) 75%);background-size:18px 18px;background-position:0 0,0 9px,9px -9px,-9px 0}
.ph img{width:100%;height:100%;object-fit:contain;display:block}
.key{font-size:12px;font-weight:800;color:#55505e;margin-top:6px;font-family:ui-monospace,monospace}
.mean{font-size:11px;color:#8a8593;line-height:1.4;padding:2px 8px 0;word-break:break-all}
</style></head><body><div class="wrap">
<h1>小物 見比べ表（${files.length}個）</h1>
<p class="lead">各カード＝ <b>画像</b> / <b>キー名</b> / <b>本来の意味（対応するヒント語）</b>。<br>「絵が意味と合ってない」ものがあれば、<b>番号かキー名</b>で教えてください（例:「12番 box_cool が保冷箱に見えない」）。</p>
<div class="grid">${cards}</div>
</div></body></html>`;

fs.writeFileSync(path.join(ROOT, 'tools', 'items-review.html'), html);
console.log('書き出し: tools/items-review.html （' + files.length + '個 / 意味未登録: ' + files.filter((f) => !MEAN[f]).length + '）');
