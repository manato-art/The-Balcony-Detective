// ヒントボタン用イラスト3枚を gpt-image-2 で生成
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FLAT_STYLE } from './style.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const dotenv = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
const rawKey = dotenv.match(/OPENAI_API_KEY=(.+)/)?.[1] || '';
const KEY = rawKey.replace(/\s+/g, '').trim();
if (!KEY) { console.error('OPENAI_API_KEY not found'); process.exit(1); }

const ITEMS = [
  {
    id: 'hint_observe',
    prompt: `${FLAT_STYLE} A cute flat cartoon illustration of a large magnifying glass with a big round blue eye visible through the lens, as if someone is peering through it to investigate. The magnifying glass has a warm brown wooden handle. Golden sparkle stars are scattered around it. The eye is bright blue with a dark pupil and a white highlight. Transparent background. No text, no letters, no signs. Centered, clean, simple, cute game icon style.`,
  },
  {
    id: 'hint_post',
    prompt: `${FLAT_STYLE} A cute flat cartoon illustration of a home-installed American-style residential mailbox, bright red, with a rounded top and a small red flag on the side raised up. A cream-colored envelope is sticking out of the open front. The mailbox sits on a short post. Golden sparkle stars around it. Transparent background. No text, no letters, no signs, no numbers. Centered, clean, simple, cute game icon style.`,
  },
  {
    id: 'hint_neighbor',
    prompt: `${FLAT_STYLE} A cute flat cartoon illustration of a friendly young Japanese woman shown from chest up, with brown hair in a bun on top of her head, wearing a soft pink top. She has one hand raised near her mouth in a whispering/gossiping gesture, with a small friendly smile and rosy cheeks. A round gray speech bubble with three dots (…) floats near her head. Golden sparkle stars around her. Transparent background. No text except the dots in the speech bubble. Centered, clean, simple, cute game avatar style.`,
  },
];

const outDir = path.join(ROOT, 'assets', 'ui');
fs.mkdirSync(outDir, { recursive: true });

async function gen(item) {
  console.log(`generating ${item.id}...`);
  const body = {
    model: 'gpt-image-2',
    prompt: item.prompt,
    size: '1024x1024',
    quality: 'low',
    n: 1,
  };
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }
  const j = await res.json();
  const b64 = j?.data?.[0]?.b64_json;
  if (!b64) throw new Error('no b64_json');
  const buf = Buffer.from(b64, 'base64');
  const out = path.join(outDir, item.id + '.png');
  fs.writeFileSync(out, buf);
  console.log(`  saved ${out} (${buf.length} bytes)`);
}

for (const item of ITEMS) {
  await gen(item);
}
console.log('done');
