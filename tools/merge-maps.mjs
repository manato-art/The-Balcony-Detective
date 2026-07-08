// 8バッチのマッピング(_map0..7.json)を統合し、
//   - tools/_hint-art.json : { ヒント文: slug } の全対応表
//   - tools/_newgen.json   : [{id:slug, dir:'_newitems', size, transparent, prompt}] 生成用マニフェスト
// を書き出す。既存 assets/items/*.webp にある slug は再利用（生成しない）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { itemPrompt } from './style.mjs';

const T = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(T, '..');

const EXISTING = new Set(
  fs.readdirSync(path.join(ROOT, 'assets/items')).filter(f => f.endsWith('.webp')).map(f => f.slice(0, -5))
);
const hints = JSON.parse(fs.readFileSync(path.join(T, '_hints.json'), 'utf8')); // id順
const idText = hints.map(r => r.t);
const idIcon = hints.map(r => r.ic);

const HINT_ART = {};        // text -> slug
const newPrompt = {};       // slug -> english prompt (最初の非空)
const slugCount = {};       // slug -> 使用ヒント数
let missing = 0;

for (let b = 0; b < 8; b++) {
  const p = path.join(T, `_map${b}.json`);
  if (!fs.existsSync(p)) { console.warn('!! 欠落: _map' + b + '.json'); missing++; continue; }
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const x of m) {
    const text = idText[x.id];
    if (text == null) { console.warn('!! 不明id', x.id, 'batch', b); continue; }
    let slug = String(x.slug || '').trim();
    // curtain slug は特別扱い(pushItemの kind==='curtain' 経路)に任せる → 上書きしない
    if (slug === 'curtain') continue;
    if (!slug) continue;
    HINT_ART[text] = slug;
    slugCount[slug] = (slugCount[slug] || 0) + 1;
    if (x.prompt && !newPrompt[slug]) newPrompt[slug] = x.prompt;
  }
}

// slug → それを使うヒントの元icon集合。icon=curtain のヒントは pushItem で短絡し item 化されないため、
// 「curtain iconのヒントだけが使う新規slug」は死にslug → 生成しない。
const iconByText = Object.fromEntries(hints.map(r => [r.t, r.ic]));
const slugIcons = {};
for (const [t, s] of Object.entries(HINT_ART)) (slugIcons[s] = slugIcons[s] || new Set()).add(iconByText[t]);
const isCurtainOnly = (s) => slugIcons[s] && [...slugIcons[s]].every(ic => ic === 'curtain');

const allSlugs = [...new Set(Object.values(HINT_ART))];
const needGen = allSlugs.filter(s => !EXISTING.has(s) && !isCurtainOnly(s));
const needGenNoPrompt = needGen.filter(s => !newPrompt[s]);

// 生成マニフェスト（プロンプトある新規のみ）
const gen = needGen.filter(s => newPrompt[s]).map(s => ({
  id: s, dir: '_newitems', size: '1024x1024', transparent: true,
  prompt: itemPrompt(newPrompt[s]),
}));

fs.writeFileSync(path.join(T, '_hint-art.json'), JSON.stringify(HINT_ART, null, 0));
fs.writeFileSync(path.join(T, '_newgen.json'), JSON.stringify(gen, null, 1));
fs.writeFileSync(path.join(T, '_newprompts.json'), JSON.stringify(newPrompt, null, 1));

console.log('=== 統合結果 ===');
console.log('欠落バッチ:', missing);
console.log('ヒント→slug 対応:', Object.keys(HINT_ART).length, '/', idText.length);
console.log('使用slug総数:', allSlugs.length, '(既存再利用', allSlugs.length - needGen.length, '+ 新規', needGen.length, ')');
console.log('生成する新規:', gen.length);
if (needGenNoPrompt.length) console.log('!! プロンプト欠落の新規slug(要手当):', needGenNoPrompt.join(', '));
console.log('');
console.log('=== 新規slug一覧(使用数付き) ===');
needGen.sort((a, b) => (slugCount[b] || 0) - (slugCount[a] || 0))
  .forEach(s => console.log(String(slugCount[s] || 0).padStart(3), s, '—', (newPrompt[s] || '(プロンプト無)').slice(0, 55)));
