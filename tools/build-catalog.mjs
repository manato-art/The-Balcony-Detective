// 全ベランダ(10)＋全アイテム(264)のイラスト一覧カタログ catalog.html を生成（人に渡す共有用）。
// ゲーム本体の世界観(M PLUS Rounded 1c / Duolingo緑 / 角丸カード)に合わせる。画像は同一オリジンのwebpを参照。
//   node tools/build-catalog.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = (p) => path.join(ROOT, p);

/* ---- データ読み込み ---- */
let msrc = fs.readFileSync(A('js/data/mansions.js'), 'utf8').replace(/const VT_MANSIONS/, 'VT_MANSIONS');
let VT_MANSIONS; eval(msrc);
const mansions = VT_MANSIONS;

const art = JSON.parse(fs.readFileSync(A('tools/_hint-art.json'), 'utf8')); // 文 -> slug
const hintsRows = JSON.parse(fs.readFileSync(A('tools/_hints.json'), 'utf8')); // [{t, ic}]
const iconByText = Object.fromEntries(hintsRows.map((r) => [r.t, r.ic]));
const sc = require('../js/scene.js');
const secretName = {}; (sc.SECRET_ITEMS || []).forEach((s) => { if (s.v) secretName[s.v] = s.name; });

// slug -> それを使うヒント文[]
const inv = {};
for (const [t, s] of Object.entries(art)) (inv[s] = inv[s] || []).push(t);

// 未カバー11件の手動名
const MANUAL = {
  box_cat: '猫の段ボール', box_open: '開いた段ボール箱', camera: 'カメラ', dumbbell: 'ダンベル',
  flute: 'フルート', guitar: 'ギター', pcase: 'PCケース', ring: '指輪', star: 'スター（推しマーク）',
  suitcase: 'スーツケース', tube: 'チューブ（絵の具など）',
};
const MANUAL_CAT = {
  box_cat: 'box', box_open: 'box', camera: 'star', dumbbell: 'dumbbell', flute: 'guitar',
  guitar: 'guitar', pcase: 'star', ring: 'mirror', star: 'star', suitcase: 'bag', tube: 'star',
};

// icon -> 見出しカテゴリ
const CATS = [
  ['laundry', '洗濯物・衣類'], ['box', '箱・荷物・通販'], ['mail', '郵便・紙もの'],
  ['can', '飲みもの・空き容器'], ['plant', '植物・ガーデン'], ['bag', 'バッグ・履きもの'],
  ['star', '趣味・推し活・機材'], ['dumbbell', '運動・筋トレ'], ['kids', '子ども・乗りもの'],
  ['mirror', '美容・身だしなみ'], ['other', '生活感・その他'],
];
const CAT_LABEL = Object.fromEntries(CATS);
const ICON_TO_CAT = {
  laundry: 'laundry', suit: 'laundry', box: 'box', mail: 'mail', can: 'can', plant: 'plant',
  sandal: 'bag', bag: 'bag', star: 'star', camera: 'star', guitar: 'star', crystal: 'star',
  dumbbell: 'dumbbell', protein: 'dumbbell', kids: 'kids', bike: 'kids', mirror: 'mirror',
  alert: 'other', umbrella: 'other', megaphone: 'other', trophy: 'other', curtain: 'other',
};

const mode = (arr) => { const c = {}; let best = arr[0], bn = 0; for (const x of arr) { c[x] = (c[x] || 0) + 1; if (c[x] > bn) { bn = c[x]; best = x; } } return best; };
const shortest = (arr) => arr.slice().sort((a, b) => a.length - b.length)[0];

/* ---- アイテム一覧を組む ---- */
const slugs = fs.readdirSync(A('assets/items')).filter((f) => f.endsWith('.webp')).map((f) => f.slice(0, -5));
const items = slugs.map((slug) => {
  let name, catKey;
  if (inv[slug]) {
    name = shortest(inv[slug]);
    const icons = inv[slug].map((t) => iconByText[t]).filter(Boolean);
    catKey = ICON_TO_CAT[mode(icons)] || 'other';
  } else if (secretName[slug]) {
    name = secretName[slug]; catKey = 'star';
  } else {
    name = MANUAL[slug] || slug; catKey = ICON_TO_CAT[MANUAL_CAT[slug] || 'alert'] || 'other';
  }
  return { slug, name, catKey, secret: !!secretName[slug], variants: (inv[slug] || []).length };
});
// カテゴリ順→名前順
const catOrder = Object.fromEntries(CATS.map(([k], i) => [k, i]));
items.sort((a, b) => (catOrder[a.catKey] - catOrder[b.catKey]) || a.name.localeCompare(b.name, 'ja'));
const byCat = {};
for (const it of items) (byCat[it.catKey] = byCat[it.catKey] || []).push(it);

/* ---- HTML生成 ---- */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-4 9 4-9 4-9-4Z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/></svg>',
};

const balconyCards = mansions.map((m) => `
      <article class="bcard">
        <div class="bimgs">
          <figure><img loading="lazy" src="assets/balcony/${m.id}.webp" width="300" height="200" alt="${esc(m.name)}のベランダ"><figcaption>ベランダ</figcaption></figure>
          <figure><img loading="lazy" src="assets/room/${m.id}.webp" width="300" height="200" alt="${esc(m.name)}の室内(カーテンを開けた状態)"><figcaption>カーテンオープン</figcaption></figure>
        </div>
        <div class="bmeta"><h3>${esc(m.name)}</h3><p>${esc(m.desc || '')}</p></div>
      </article>`).join('');

const itemSections = CATS.filter(([k]) => byCat[k] && byCat[k].length).map(([k, label]) => `
      <h3 class="cat">${esc(label)}<span>${byCat[k].length}</span></h3>
      <div class="igrid">
        ${byCat[k].map((it) => `<figure class="icell${it.secret ? ' sec' : ''}"><div class="ibox"><img loading="lazy" src="assets/items/${it.slug}.webp" width="120" height="120" alt="${esc(it.name)}"></div><figcaption>${esc(it.name)}${it.secret ? '<b>SECRET</b>' : ''}</figcaption></figure>`).join('\n        ')}
      </div>`).join('');

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ベランダ探偵 — イラスト図鑑（ベランダ${mansions.length}種・アイテム${items.length}種）</title>
<meta name="description" content="ベランダ探偵に登場する全${mansions.length}種のベランダと全${items.length}種のアイテムのイラスト一覧。">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800;900&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#eaf4ff; --surface:#fff; --border:#e5e5e5; --text:#3c3c3c; --text2:#6f7a8a;
    --green:#58cc02; --green-d:#46a302; --green-t:#58a700; --blue:#1cb0f6; --gold:#ffc800; --pink:#ff86d0; --radius:16px;
  }
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{margin:0;background:linear-gradient(180deg,#eaf4ff,#f4faff 340px,#f7fbff);color:var(--text);
    font-family:"M PLUS Rounded 1c","Hiragino Maru Gothic ProN","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans JP",sans-serif;
    font-weight:800;line-height:1.6;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:1080px;margin:0 auto;padding:0 16px 64px;}
  /* ヘッダー */
  header.top{text-align:center;padding:34px 16px 22px;}
  .badge{display:inline-block;background:#fff;border:2px solid var(--green-l,#d7ffb8);color:var(--green-t);
    font-size:12.5px;font-weight:900;letter-spacing:.08em;border-radius:999px;padding:5px 14px;box-shadow:0 2px 0 #cdeeae;}
  header.top h1{font-size:clamp(24px,6vw,38px);font-weight:900;margin:14px 0 6px;color:var(--text);}
  header.top p{margin:0 auto;max-width:560px;color:var(--text2);font-weight:800;font-size:14px;}
  .counts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px;}
  .counts a{display:flex;align-items:center;gap:8px;text-decoration:none;background:#fff;border:2px solid var(--border);
    border-bottom-width:4px;border-radius:14px;padding:9px 16px;color:var(--text);font-weight:900;transition:transform .1s;}
  .counts a:active{transform:translateY(2px);}
  .counts a .n{color:var(--green-t);font-size:20px;}
  .counts a svg{width:20px;height:20px;color:var(--blue);}
  /* セクション見出し */
  .sec-h{display:flex;align-items:center;gap:10px;margin:40px 0 14px;padding-top:8px;flex-wrap:wrap;}
  .sec-h .ic{flex:none;width:30px;height:30px;color:#fff;background:var(--green);border-radius:9px;padding:5px;box-shadow:0 3px 0 var(--green-d);}
  .sec-h.blue .ic{background:var(--blue);box-shadow:0 3px 0 #1899d6;}
  .sec-h h2{font-size:20px;font-weight:900;margin:0;white-space:nowrap;}
  .sec-h span{color:var(--text2);font-weight:800;font-size:13px;flex:1 1 100%;padding-left:40px;margin-top:-4px;}
  /* ベランダ */
  .bgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;}
  .bcard{background:#fff;border:2px solid var(--border);border-bottom-width:4px;border-radius:var(--radius);overflow:hidden;}
  .bimgs{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:var(--border);}
  .bimgs figure{margin:0;position:relative;background:#fff;}
  .bimgs img{display:block;width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;}
  .bimgs figcaption{position:absolute;left:6px;bottom:6px;background:rgba(0,0,0,.5);color:#fff;font-size:10px;font-weight:900;padding:2px 7px;border-radius:999px;}
  .bmeta{padding:10px 14px 12px;}
  .bmeta h3{margin:0;font-size:16px;font-weight:900;}
  .bmeta p{margin:2px 0 0;font-size:12.5px;color:var(--text2);font-weight:800;}
  /* アイテム */
  .cat{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:900;color:var(--green-t);margin:26px 0 12px;}
  .cat span{background:var(--green-l,#d7ffb8);color:var(--green-t);font-size:11.5px;border-radius:999px;padding:1px 9px;}
  .igrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;}
  .icell{margin:0;background:#fff;border:2px solid var(--border);border-bottom-width:4px;border-radius:14px;padding:8px 5px 7px;text-align:center;}
  .icell.sec{border-color:var(--gold);background:#fffaf0;}
  .ibox{aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;}
  .ibox img{max-width:100%;max-height:100%;width:auto;height:auto;}
  .icell figcaption{margin-top:4px;font-size:10.5px;font-weight:800;line-height:1.3;color:var(--text);
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
  .icell.sec figcaption b{display:block;color:#b57800;font-size:8px;letter-spacing:.12em;}
  footer{text-align:center;color:var(--text2);font-size:12px;font-weight:800;margin-top:48px;}
  @media (max-width:560px){
    .igrid{grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px;}
    .bgrid{grid-template-columns:1fr;}
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <span class="badge">ベランダ探偵 — イラスト図鑑</span>
    <h1>ぜんぶのベランダとアイテム</h1>
    <p>ゲームに登場する全${mansions.length}種のベランダと、全${items.length}種のアイテムのイラスト一覧です。</p>
    <nav class="counts">
      <a href="#balcony">${ICON.home}<span class="n">${mansions.length}</span>ベランダ</a>
      <a href="#items">${ICON.box}<span class="n">${items.length}</span>アイテム</a>
    </nav>
  </header>

  <section id="balcony">
    <div class="sec-h"><span class="ic">${ICON.home}</span><h2>ベランダ</h2><span>${mansions.length}種（各マンション：ベランダ／カーテンを開けた室内）</span></div>
    <div class="bgrid">${balconyCards}
    </div>
  </section>

  <section id="items">
    <div class="sec-h blue"><span class="ic">${ICON.box}</span><h2>アイテム</h2><span>${items.length}種（ヒントに対応した専用イラスト）</span></div>
    ${itemSections}
  </section>

  <footer>ベランダ探偵 — the-balcony-detective</footer>
</div>
</body>
</html>`;

fs.writeFileSync(A('catalog.html'), html);
console.log('catalog.html 生成:', 'ベランダ', mansions.length, '/ アイテム', items.length, '/', (html.length / 1024).toFixed(0) + 'KB');
console.log('カテゴリ別:', CATS.filter(([k]) => byCat[k]).map(([k, l]) => l + ':' + byCat[k].length).join(' / '));
