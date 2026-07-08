// 追加22バリアントの生成マニフェストを書き出す（style.mjs の itemPrompt で世界観統一）。
//   node tools/manifest-new.mjs  →  tools/manifest-new.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { itemPrompt } from './style.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// id = scene.js の variant キーに一致させる（assets/items/{id}.png に出力される）
const DESCS = {
  // 郵便から切り出し
  calendar: 'a small tear-off wall calendar with a big red circle marked on one date',
  manuscript: 'a neat stack of white manuscript papers with a red pen lying on top',
  namecards: 'a small stack of white business cards wrapped with a paper band',
  resume: 'a single sheet of resume paper with a tiny id photo in the top corner',
  flyer: 'a colorful fanned-out pile of promotional flyers and postcards',
  // 星型から切り出し
  uchiwa: 'a round idol cheering hand fan (uchiwa) with a big star design, on a handle',
  slide_toy: 'a small colorful kids playground slide toy',
  ashtray: 'a sparkling clear cut-crystal glass ashtray',
  cat_toy: 'a cat teaser wand toy with a feather and a small bell',
  cosplay_prop: 'a fake foam prop fantasy sword for cosplay',
  // タオルから切り出し
  dakimakura: 'a long hug body pillow with a pastel printed cover, hanging on a pole',
  towel_sport: 'a sports towel with a bold colored logo stripe, hanging on a pole',
  // 自転車から切り出し
  stroller: 'a cute baby stroller with a sun canopy',
  tricycle: "a child's red tricycle",
  // 缶から切り出し
  mug_pair: 'two matching ceramic mugs standing side by side',
  testtube: 'a small wooden rack holding test tubes of glowing green liquid',
  // 洗濯物から切り出し
  apron: 'a work apron hanging on a wall hook',
  workwear: 'a folded work jacket with a pair of cotton work gloves on top, on a pole',
  // サンダルから切り出し
  uwabaki: "a pair of children's white indoor school shoes with red toe caps",
  dress_shoes: 'a pair of shiny polished black leather dress shoes',
  hiking_boots: 'a pair of brown lace-up hiking boots',
  // 観葉から切り出し
  nest: 'a round messy bird nest built from twigs',
};

const manifest = Object.entries(DESCS).map(([id, d]) => ({
  id, dir: 'items', size: '1024x1024', transparent: true, prompt: itemPrompt(d),
}));

fs.writeFileSync(path.join(ROOT, 'tools', 'manifest-new.json'), JSON.stringify(manifest, null, 2));
console.log('manifest-new.json: ' + manifest.length + '枚');
