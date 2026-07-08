// ベランダ探偵 — イラスト素材ジェネレータ（OpenAI gpt-image-2 / 依存ゼロ・Node標準fetch）
//
// 使い方:
//   1. veranda-tantei/.env に OPENAI_API_KEY=sk-... を置く（.env は .gitignore 済み）
//   2. node tools/gen-art.mjs            … スタイルテスト（キャラ3・小物3・ベランダ1）を生成
//      node tools/gen-art.mjs <manifest.json>  … 任意マニフェストで量産
//   3. 生成物は assets/{chars,items,balcony}/<id>.png に保存
//
// 環境変数:
//   OPENAI_API_KEY          必須
//   OPENAI_IMAGE_QUALITY    low|medium|high|auto（既定 low＝最速・最安）
//   GEN_CONCURRENCY         同時実行数（既定 3。429が出るなら下げる）
//
// 実績パターン（ab-system-new-ui/server.js）に準拠:
//   model:'gpt-image-2' / 透過は background:'transparent'（拒否時はフォールバック）/ 戻りは b64_json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { charPrompt, itemPrompt, balconyPrompt } from './style.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dir, '..');

/* ---- .env ローダ（依存なし・既存の環境変数は上書きしない） ---- */
function loadEnv(p) {
  try {
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch (e) { /* .env が無くてもOK */ }
}
loadEnv(path.join(ROOT, '.env'));

// OpenAIキーに空白は含まれない。貼り付け事故で紛れた空白/改行を除去（安全な正規化）。
const KEY = (process.env.OPENAI_API_KEY || '').replace(/\s+/g, '');
if (!KEY) {
  console.error('✗ OPENAI_API_KEY が未設定です。veranda-tantei/.env に OPENAI_API_KEY=sk-... を置いてください。');
  process.exit(1);
}
const QUALITY = (process.env.OPENAI_IMAGE_QUALITY || 'low').toLowerCase();
const CONCURRENCY = Math.max(1, Number(process.env.GEN_CONCURRENCY || 3));

/* ---- スタイル定義（スクショから固定した世界観。全素材で共通の一節） ---- */
// スタイル/プロンプト部品は tools/style.mjs に集約（マニフェスト側と共有）。charPrompt/itemPrompt/balconyPrompt を import 済み。

/* ---- 既定マニフェスト＝スタイルテスト（スクショのキャラと同じ人物で直接見比べる） ---- */
const STYLE_TEST = [
  // 人物3体（host/nurse_night/kinniku）はデフォルメOK済みのため据え置き（再生成しない）
  { id: 'food_pizza',   dir: 'items', size: '1024x1024', transparent: true, prompt: itemPrompt('an open cardboard pizza box with one pepperoni pizza slice inside') },
  { id: 'gym_dumbbell', dir: 'items', size: '1024x1024', transparent: true, prompt: itemPrompt('a single black metal dumbbell resting on the ground') },
  { id: 'laundry_lace', dir: 'items', size: '1024x1024', transparent: true, prompt: itemPrompt('a piece of black lace lingerie hung on a clothes hanger') },
  { id: 'resort',       dir: 'balcony', size: '1536x1024', transparent: false, prompt: balconyPrompt('a resort-style apartment with an airy tropical vacation vibe, light sandy and aqua tones, a hint of a potted palm, bright and breezy') },
];

/* ---- 1枚生成（リトライ＋透過フォールバック） ---- */
async function genOne(item) {
  const outDir = path.join(ROOT, 'assets', item.dir);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, item.id + '.png');

  const baseBody = { model: 'gpt-image-2', prompt: item.prompt, size: item.size || '1024x1024', quality: QUALITY, n: 1 };
  const withBg = item.transparent ? { ...baseBody, background: 'transparent', output_format: 'png' } : baseBody;

  const attempt = async (body) => {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      const err = new Error('HTTP ' + res.status + ' ' + txt.slice(0, 200));
      err.status = res.status;
      err.body = txt;
      throw err;
    }
    const j = await res.json();
    const b64 = j?.data?.[0]?.b64_json;
    if (!b64) throw new Error('b64_json が空');
    return Buffer.from(b64, 'base64');
  };

  let lastErr;
  for (let i = 0; i < 4; i++) {
    try {
      let buf;
      try {
        buf = await attempt(withBg);
      } catch (e) {
        // 透過が拒否されたら透過なしで再試行（実績コードと同じ挙動）
        if (item.transparent && e.status === 400 && /background|transparent/i.test(e.body || '')) {
          buf = await attempt(baseBody);
        } else { throw e; }
      }
      fs.writeFileSync(outPath, buf);
      console.log('  ✓ ' + item.dir + '/' + item.id + '.png (' + Math.round(buf.length / 1024) + 'KB)');
      return { id: item.id, ok: true };
    } catch (e) {
      lastErr = e;
      const retriable = e.status === 429 || (e.status >= 500) || e.status === undefined;
      if (!retriable) break;
      const wait = 2000 * (i + 1);
      console.log('  … retry ' + item.id + ' (' + (e.status || 'net') + ') in ' + wait + 'ms');
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  console.error('  ✗ ' + item.id + ' 失敗: ' + (lastErr?.message || lastErr));
  return { id: item.id, ok: false, error: String(lastErr?.message || lastErr) };
}

/* ---- 並列プール ---- */
async function run(manifest) {
  console.log('生成開始: ' + manifest.length + '枚 / model=gpt-image-2 / quality=' + QUALITY + ' / 同時=' + CONCURRENCY);
  const queue = manifest.slice();
  const results = [];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const item = queue.shift();
      results.push(await genOne(item));
    }
  });
  await Promise.all(workers);
  const ok = results.filter((r) => r.ok).length;
  console.log('\n完了: ' + ok + '/' + results.length + ' 成功');
  const fail = results.filter((r) => !r.ok);
  if (fail.length) console.log('失敗: ' + fail.map((f) => f.id).join(', '));
}

/* ---- エントリ ---- */
const arg = process.argv[2];
let manifest = STYLE_TEST;
if (arg) {
  manifest = JSON.parse(fs.readFileSync(path.resolve(arg), 'utf8'));
}
run(manifest).catch((e) => { console.error(e); process.exit(1); });
