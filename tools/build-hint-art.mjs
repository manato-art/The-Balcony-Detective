// tools/_hint-art.json (ヒント文→slug) から js/data/hint-art.js を生成。
// 実在する assets/items/{slug}.webp のものだけ採用し、無いslugは除外(実行時 classify にフォールバック)。
//   node tools/build-hint-art.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const T = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(T, '..');

const art = JSON.parse(fs.readFileSync(path.join(T, '_hint-art.json'), 'utf8'));
const have = new Set(
  fs.readdirSync(path.join(ROOT, 'assets/items')).filter(f => f.endsWith('.webp')).map(f => f.slice(0, -5))
);

const out = {};
let dropped = [];
for (const [text, slug] of Object.entries(art)) {
  if (have.has(slug)) out[text] = slug;
  else dropped.push(text + ' → ' + slug);
}

const body =
  '// 自動生成 (tools/build-hint-art.mjs) — 各ヒント文を専用イラストslugへ対応させる全対応表。\n' +
  '// 手編集しない。更新は residents.js 変更後に tools のマッピングを再実行して再生成する。\n' +
  '(function (root) {\n  root.VT_HINT_ART = ' + JSON.stringify(out, null, 0) + ';\n' +
  '})(typeof window !== "undefined" ? window : globalThis);\n';

fs.writeFileSync(path.join(ROOT, 'js/data/hint-art.js'), body);
console.log('hint-art.js 生成:', Object.keys(out).length, 'エントリ採用 /', dropped.length, '除外(webp無)');
if (dropped.length) console.log('除外:', dropped.slice(0, 20).join(' , '));
