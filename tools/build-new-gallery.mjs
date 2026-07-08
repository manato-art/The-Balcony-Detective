// 新規22枚の確認ギャラリー tools/new-items.html を書き出す。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// id: [日本語名, 元の汎用画, 主な対象住人]
const ITEMS = {
  calendar: ['カレンダー（締切/月齢/丸印）', '封筒', '覆面作家・占い師・単身パパ'],
  manuscript: ['原稿・校正刷り', '封筒', '覆面作家・大学教授'],
  namecards: ['名刺の束', '封筒', 'ホスト・管理人'],
  resume: ['履歴書・シフト表', '封筒', 'フリーター'],
  flyer: ['チラシ・DM束', '封筒', 'ギャル・バンドマン他'],
  uchiwa: ['推しうちわ', '汎用の星', '女子大生・元アイドル・オタク'],
  slide_toy: ['すべり台のおもちゃ', '汎用の星', 'ファミリー'],
  ashtray: ['クリスタルの灰皿', '汎用の星', '伝説のホスト'],
  cat_toy: ['猫用おもちゃ', '汎用の星', '猫屋敷'],
  cosplay_prop: ['コスプレの小道具', '汎用の星', 'コスプレイヤー'],
  dakimakura: ['抱き枕カバー', '黄色いタオル', 'ガチオタク'],
  towel_sport: ['スポーツタオル', '黄色いタオル', '筋トレ・バンドマン・母'],
  stroller: ['ベビーカー', '自転車', 'ファミリー'],
  tricycle: ['三輪車', '自転車', '主婦・事故物件'],
  mug_pair: ['ペアのマグ/タンブラー', '空き缶', '新婚・インフルエンサー'],
  testtube: ['試験管（謎の液体）', '空き缶', '宇宙人'],
  apron: ['エプロン', '私服シャツ', '美容師・母・大食い'],
  workwear: ['作業着・軍手', '私服シャツ', '管理人・警察官'],
  uwabaki: ['子どもの上履き', 'サンダル', '主婦'],
  dress_shoes: ['磨かれた革靴', 'サンダル', '警察官'],
  hiking_boots: ['登山靴', 'サンダル', 'キャンプ沼の人'],
  nest: ['ハトの巣', '観葉植物', 'ハト'],
};
const V = Date.now();
const cards = Object.entries(ITEMS).map(([id, [name, from, who]], i) =>
  `<div class="cell"><div class="no">${i + 1}</div>` +
  `<div class="ph"><img loading="lazy" src="/assets/items/${id}.png?v=${V}" alt="${id}"></div>` +
  `<div class="nm">${name}</div><div class="ch">${from} → <b>専用の絵</b></div><div class="who">${who}</div></div>`
).join('');

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>新規22枚</title><style>
:root{--chk:#e7e2ee}*{box-sizing:border-box}
body{margin:0;font-family:"Hiragino Maru Gothic ProN","Hiragino Sans",system-ui,sans-serif;background:#faf7fb;color:#3a3442;padding:18px 12px 50px}
.wrap{max-width:1000px;margin:0 auto}h1{text-align:center;font-size:19px;margin:0 0 4px}
.lead{text-align:center;color:#8a8593;font-size:12.5px;margin:0 0 16px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.cell{position:relative;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 6px 16px rgba(60,40,80,.07);text-align:center;padding-bottom:9px}
.no{position:absolute;top:5px;left:8px;font-size:11px;font-weight:800;color:#c3b7d3}
.ph{aspect-ratio:1/1;background-image:linear-gradient(45deg,var(--chk) 25%,transparent 25%),linear-gradient(-45deg,var(--chk) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,var(--chk) 75%),linear-gradient(-45deg,transparent 75%,var(--chk) 75%);background-size:18px 18px;background-position:0 0,0 9px,9px -9px,-9px 0}
.ph img{width:100%;height:100%;object-fit:contain;display:block}
.nm{font-size:12.5px;font-weight:800;color:#463f52;margin-top:7px;padding:0 6px}
.ch{font-size:10.5px;color:#8a8593;margin-top:2px}
.who{font-size:10px;color:#b0a8bd;margin-top:3px;padding:0 6px}
</style></head><body><div class="wrap">
<h1>新しく描き足した ${Object.keys(ITEMS).length} 枚</h1>
<p class="lead">これまで「汎用の絵」に潰れていた別物を専用イラスト化（市松＝透過OK）。</p>
<div class="grid">${cards}</div></div></body></html>`;
fs.writeFileSync(path.join(ROOT, 'tools', 'new-items.html'), html);
console.log('tools/new-items.html 書き出し（' + Object.keys(ITEMS).length + '枚）');
