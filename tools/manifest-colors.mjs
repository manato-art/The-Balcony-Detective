// 色指定ヒント専用の色違いバリアント生成マニフェスト。
//   node tools/manifest-colors.mjs  →  tools/manifest-colors.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { itemPrompt } from './style.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const DESCS = {
  towel_white: 'a pure clean white fluffy bath towel hanging on a pole',
  laundry_black: 'a plain solid black t-shirt hanging on a clothes hanger',
  laundry_navy: 'a navy blue collared shirt hanging on a clothes hanger',
  laundry_pastel: 'soft pastel pink and mint colored clothes hanging on a clothes hanger',
  laundry_leopard: 'a leopard-print patterned top hanging on a clothes hanger',
  apron_black: 'a solid black work apron hanging on a wall hook',
  sandal_white: 'a pair of clean plain white sneakers',
  sandal_leopard: 'a pair of leopard-print patterned sandals',
};

const manifest = Object.entries(DESCS).map(([id, d]) => ({
  id, dir: 'items', size: '1024x1024', transparent: true, prompt: itemPrompt(d),
}));

fs.writeFileSync(path.join(ROOT, 'tools', 'manifest-colors.json'), JSON.stringify(manifest, null, 2));
console.log('manifest-colors.json: ' + manifest.length + '枚');
