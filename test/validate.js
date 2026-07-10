// データ整合性 + ロジックのシミュレーション検証（node test/validate.js）
const { VT_ICON_PATHS } = require('../js/icons.js');
const { VT_RESIDENTS, VT_CATS } = require('../js/data/residents.js');
const { VT_MANSIONS, VT_ROOMS } = require('../js/data/mansions.js');
const ev = require('../js/data/events.js');

const SCE = require('../js/scene.js');
Object.assign(globalThis, {
  VT_RESIDENTS, VT_CATS, VT_MANSIONS, VT_ROOMS,
  VT_NEIGHBOR_TABLE: ev.VT_NEIGHBOR_TABLE,
  VT_CAUGHT_POST: ev.VT_CAUGHT_POST,
  VT_TIMEOUT_ROAST: ev.VT_TIMEOUT_ROAST,
  VT_SECRET_ITEMS: SCE.SECRET_ITEMS,
});
const G = require('../js/game.js');

let fails = 0;
function ok(cond, msg) {
  if (!cond) { fails++; console.error('  NG: ' + msg); }
}

// 再現可能な乱数（LCG）
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

console.log('[1] 住人データ');
const ids = new Set();
const validCats = Object.keys(VT_CATS);
for (const r of VT_RESIDENTS) {
  ok(!ids.has(r.id), 'id重複: ' + r.id); ids.add(r.id);
  ok(validCats.includes(r.cat), r.id + ': catが不正 ' + r.cat);
  ok(VT_ICON_PATHS[r.icon], r.id + ': アイコン欠落 ' + r.icon);
  ok(r.hints.length >= 9, r.id + ': hintsが少ない ' + r.hints.length);
  ok(r.strong.length >= 2, r.id + ': strongが少ない');
  ok(r.rumor.length >= 2, r.id + ': rumorが少ない');
  ok(r.roastWrong.length >= 1 && r.roastRight.length >= 1, r.id + ': 煽り文欠落');
  ok(r.confuse.length >= 3, r.id + ': confuseが少ない');
  for (const h of r.hints.concat(r.strong)) ok(VT_ICON_PATHS[h[1]], r.id + ': ヒントアイコン欠落 ' + h[1]);
  for (const c of r.confuse) ok(VT_RESIDENTS.some((x) => x.id === c), r.id + ': confuse不明id ' + c);
}
ok(VT_RESIDENTS.length === 50, '住人が50種でない: ' + VT_RESIDENTS.length);

console.log('[2] マンションデータ');
const mids = new Set();
for (const m of VT_MANSIONS) {
  ok(!mids.has(m.id), 'マンションid重複: ' + m.id); mids.add(m.id);
  ok(VT_ICON_PATHS[m.icon], m.id + ': アイコン欠落');
  const cats = new Set();
  for (const [id, w] of m.pool) {
    const r = VT_RESIDENTS.find((x) => x.id === id);
    ok(r, m.id + ': pool不明id ' + id);
    ok(w > 0, m.id + ': 重みが0以下 ' + id);
    if (r) cats.add(r.cat);
  }
  ok(cats.size >= 3, m.id + ': カテゴリの多様性不足');
}
ok(VT_MANSIONS.length === 10, 'マンションが10種でない');
ok(VT_ROOMS.length === 20, '部屋が20でない: ' + VT_ROOMS.length);

console.log('[3] ゲームシミュレーション（各マンション×300ターン）');
const rng = lcg(20260704);
G.setRng(rng);
const kinds = ['observe', 'post', 'neighbor'];
let turns = 0, timers = 0, caughts = 0, corrects = 0;
const neighborTypes = {};
for (const m of VT_MANSIONS) {
  G.newGame({ players: ['A', 'B', 'C'], rounds: 5, mansionId: m.id });
  for (let i = 0; i < 300; i++) {
    G.state.queue.push(i % 3); // ターンを無限に補給
    const t = G.startTurn();
    ok(t, m.id + ': startTurn失敗');
    ok(/^[1-4]0[1-5]$/.test(t.room), '部屋番号が不正: ' + t.room);
    ok(t.choices.length === 4, '4択でない: ' + t.choices.length);
    ok(new Set(t.choices.map((c) => c.id)).size === 4, '4択に重複');
    ok(t.choices[t.answerIdx].id === t.resident.id, 'answerIdx不整合');
    ok(t.shown.length === 4, '初期ヒントが4でない');
    // ランダムに0〜4回調査
    const n = Math.floor(rng() * 5);
    for (let a = 0; a < n; a++) {
      const kind = kinds[Math.floor(rng() * 3)];
      const e = G.doAction(kind);
      if (e && kind === 'neighbor') neighborTypes[e.type] = (neighborTypes[e.type] || 0) + 1;
      if (e && e.type === 'caught') caughts++;
      if (e && e.type === 'timer') timers++;
    }
    // 回答 or タイムアウト
    let r;
    if (G.state.turn.timered && rng() < 0.5) {
      r = G.timeout();
      ok(r && !r.correct && r.timedOut, 'timeoutの結果が不正');
    } else {
      const pickIdx = Math.floor(rng() * 4);
      const conf = rng() < 0.3;
      r = G.answer(pickIdx, conf);
      ok(r, 'answerがnull');
      ok(r.correct === (pickIdx === t.answerIdx), 'correct判定不整合');
      if (!r.correct) ok(r.sips >= (conf ? 2 : 1), '不正解なのに飲みが少ない');
      if (r.correct) ok(r.points >= 100, '正解なのに100点未満');
    }
    ok(typeof r.roast === 'string' && r.roast.length > 0, '煽り文が空');
    ok(G.answer(0, false) === null, '二重回答が通ってしまう');
    turns++;
    G.nextTurn();
  }
  const res = G.results();
  ok(res.rank.length === 3 && res.mvp, m.id + ': results不正');
}
console.log('  ' + turns + 'ターン実行 / 発覚' + caughts + '回 / 帰宅タイマー' + timers + '回');
console.log('  聞き込みイベント内訳: ' + JSON.stringify(neighborTypes));
ok(caughts > 0 && timers > 0, 'イベント分岐が一度も発生していない（確率ロジック疑い）');
for (const ty of ['hints', 'strong', 'rumor', 'none', 'alert', 'rain', 'caught', 'timer']) {
  ok(neighborTypes[ty] > 0, '聞き込みイベント「' + ty + '」が一度も発生していない');
}

console.log('[3a] 帰宅アンブッシュ');
G.newGame({ players: ['A', 'B', 'C'], rounds: 5, mansionId: 'gakusei' });
let ambushes = 0;
const patterns = {};
for (let i = 0; i < 200; i++) {
  G.state.queue.push(i % 3);
  const t = G.startTurn();
  const me = t.playerIdx;
  if (t.ambush) {
    ambushes++;
    const before = G.state.players.map((p) => p.sips);
    const r = G.ambush();
    ok(r && r.drinkers && r.drinkers.length >= 1, 'ambushの戻り値不正');
    patterns[r.pattern] = (patterns[r.pattern] || 0) + 1;
    ok(G.ambush() === null, 'ambushが二重発火する');
    // 飲む対象の検証
    const expectIdx = r.pattern === 'self' ? [me]
      : r.pattern === 'right' ? [(me + 1) % 3]
      : r.pattern === 'left' ? [(me + 2) % 3]
      : [0, 1, 2].filter((x) => x !== me);
    G.state.players.forEach((p, idx) => {
      const want = before[idx] + (expectIdx.indexOf(idx) !== -1 ? 1 : 0);
      ok(p.sips === want, r.pattern + ': ' + p.name + 'のsips不正 ' + p.sips + '≠' + want);
    });
    ok(G.answer(t.answerIdx, false) === null, '逃走後に回答できてしまう');
    ok(G.doAction('observe') === null, '逃走後に調査できてしまう');
  } else {
    ok(G.ambush() === null, 'ambushフラグ無しで発火');
    G.answer(0, false);
  }
  G.nextTurn();
}
console.log('  200ターン中アンブッシュ' + ambushes + '回 / パターン内訳: ' + JSON.stringify(patterns));
ok(ambushes > 5 && ambushes < 60, 'アンブッシュ発生率が想定外: ' + ambushes + '/200');
ok(Object.keys(patterns).length >= 3, '飲みパターンの多様性不足: ' + JSON.stringify(patterns));

console.log('[3d] ゲーム設定の反映');
G.setConfig({ ambush: 0 });
G.newGame({ players: ['A'], rounds: 5, mansionId: 'boro' });
let amb0 = 0;
for (let i = 0; i < 200; i++) { G.state.queue.push(0); if (G.startTurn().ambush) amb0++; G.answer(0, false); G.nextTurn(); }
ok(amb0 === 0, 'ambush=0でも発生: ' + amb0);
G.setConfig({ ambush: 1 });
G.newGame({ players: ['A'], rounds: 5, mansionId: 'boro' });
let amb1 = 0;
for (let i = 0; i < 50; i++) { G.state.queue.push(0); if (G.startTurn().ambush) amb1++; G.answer(0, false); G.nextTurn(); }
ok(amb1 === 50, 'ambush=1で全発生しない: ' + amb1);
G.setConfig({ ambush: 0.18, postCaught: 0.5, secret: 0.03 }); // 既定に戻す
console.log('  ambush=0で0回 / ambush=1で50回 → 設定反映OK');

console.log('[3s] シークレット');
G.newGame({ players: ['A'], rounds: 5, mansionId: 'boro' });
let secRes = 0, secItems = 0;
for (let i = 0; i < 1000; i++) {
  G.state.queue.push(0);
  const t = G.startTurn();
  if (t.resident.cat === 'secret') secRes++;
  else ok(t.choices.every((c) => c.cat !== 'secret'), '通常回の選択肢にシークレット混入');
  if (t.secretItem) secItems++;
  G.answer(0, false);
  G.nextTurn();
}
console.log('  1000ターン中 シークレット住人' + secRes + '回 / シークレットアイテム' + secItems + '回');
ok(secRes > 5 && secRes < 90, 'シークレット住人の出現率が想定外: ' + secRes + '/1000');
ok(secItems > 10 && secItems < 110, 'シークレットアイテムの出現率が想定外: ' + secItems + '/1000');
const DX = require('../js/dex.js');
ok(typeof DX.unlockItem === 'function' && typeof DX.resCount === 'function', 'dexモジュール不正');

console.log('[3b] 聞き込みイベントの重複なし保証');
const NEIGHBOR_N = ev.VT_NEIGHBOR_TABLE.length;
ok(NEIGHBOR_N === 10, '聞き込みイベントが10種でない: ' + NEIGHBOR_N);
G.newGame({ players: ['A'], rounds: 5, mansionId: 'boro' });
for (let i = 0; i < NEIGHBOR_N; i++) {
  G.state.queue.push(0);
  G.startTurn();
  ok(G.doAction('neighbor'), '聞き込みがnullを返した');
  G.answer(0, false);
  G.nextTurn();
}
ok(G.state.neighborUsed.length === NEIGHBOR_N && new Set(G.state.neighborUsed).size === NEIGHBOR_N,
  '同一ゲーム' + NEIGHBOR_N + '回の聞き込みでイベントが重複した: ' + G.state.neighborUsed.join(','));

console.log('[4] キャラクター描画');
const CH = require('../js/characters.js');
for (const r of VT_RESIDENTS) {
  ok(CH.AVATARS[r.id], r.id + ': アバター定義なし');
  const svg = CH.avatar(r.id, 96);
  ok(typeof svg === 'string' && svg.indexOf('<svg') === 0 && svg.indexOf('</svg>') > 0, r.id + ': アバターSVG不正');
}
for (const pose of ['base', 'point', 'happy', 'shock']) {
  const svg = CH.mascot(pose, 160);
  ok(svg.indexOf('<svg') === 0 && svg.indexOf('</svg>') > 0, 'マスコット' + pose + 'が不正');
}
ok(CH.avatar('unknown-id', 96).indexOf('<svg') === 0, '未知IDでフォールバックしない');
for (const m of VT_MANSIONS) {
  ok(CH.BUILDINGS[m.id], m.id + ': ビルイラスト定義なし');
  const svg = CH.building(m.id, 92);
  ok(svg.indexOf('<svg') === 0 && svg.indexOf('</svg>') > 0, m.id + ': ビルSVG不正');
}

console.log('[5] シーン描画・建物全景');
const SC = require('../js/scene.js');
for (const r of VT_RESIDENTS) {
  for (const h of r.hints.concat(r.strong)) {
    ok(h[1] === 'curtain' || SC.ITEM_KINDS.indexOf(h[1]) !== -1, r.id + ': イラスト未定義のヒント種別 ' + h[1]);
  }
}
// バリアント: 全ルールの参照先が存在し、全ヒント文でclassifyが安全に動く
for (const r of SC.RULES) ok(SC.VARIANTS[r[1]], 'RULES参照先バリアント欠落: ' + r[1]);
let variantHits = 0;
for (const r of VT_RESIDENTS) {
  for (const h of r.hints.concat(r.strong)) {
    const v = SC.classify(h[0], h[1]);
    if (v) { variantHits++; ok(typeof SC.VARIANTS[v].draw('#ccc') === 'string', v + ': draw不正'); }
  }
}
console.log('  特化イラスト適用ヒント数: ' + variantHits);
ok(variantHits >= 50, '特化イラストの適用数が少なすぎる: ' + variantHits);
const vItems = Object.keys(SC.VARIANTS).map((v, i) => ({ kind: 'box', variant: v, color: '#ccc', label: v, slot: i % 4, zone: SC.VARIANTS[v].hang ? 'hang' : (i % 2 ? 'back' : 'floor'), strong: false, fresh: false }));
ok(SC.scene({ accent: 'green', items: vItems }).split('sc-item').length - 1 >= vItems.length, 'バリアント描画不正');

const testItems = SC.ITEM_KINDS.map((k, i) => ({ kind: k, color: '#ccc', label: k, slot: i % 4, zone: SC.HANG_KINDS.indexOf(k) !== -1 ? 'hang' : (i % 2 ? 'back' : 'floor'), strong: false, fresh: false }));
const ssvg = SC.scene({ accent: 'cyan', curtain: { color: '#fff', label: 'c' }, curtainClosed: true, light: true, rain: true, silhouette: true, items: testItems });
ok(ssvg.indexOf('<svg') === 0 && ssvg.split('sc-item').length - 1 >= SC.ITEM_KINDS.length, 'シーンSVG生成不正');
for (const room of VT_ROOMS) {
  const fsvg = CH.facade(VT_MANSIONS[0], room, 300);
  ok(fsvg.indexOf('fc-target') > 0 && fsvg.indexOf('<svg') === 0, room + ': 全景SVG不正');
  const p = CH.roomPos(room);
  ok(p.x > 0 && p.x < 100 && p.y > 0 && p.y < 100, room + ': roomPos範囲外 ' + JSON.stringify(p));
}

if (fails > 0) {
  console.error('\nFAIL: ' + fails + '件');
  process.exit(1);
}
console.log('\nPASS: 全チェック緑');
