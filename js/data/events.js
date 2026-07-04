// ランダムイベント（「しばらく待つ」用）と各種テキスト
// type: hint=ヒント / strong=強ヒント / rumor=本物の噂 / none=空振り
//       alert=以後ポスト発覚率UP / rain=洗濯物ヒント打ち止め / caught=発覚 / timer=10秒回答
// w: 出現重み。同一ゲーム内では全種類消化するまで同じイベントは出ない。
const VT_WAIT_TABLE = [
  { id: 'curtain',  w: 10, type: 'hint',   text: '風でカーテンが開いた！部屋の中が一瞬見えた。' },
  { id: 'light',    w: 8,  type: 'hint',   text: '部屋の電気がついた。生活パターンが読めるぞ。' },
  { id: 'mekure',   w: 8,  type: 'hint',   text: '風で洗濯物がめくれて、奥の一枚が見えた。' },
  { id: 'takuhai',  w: 8,  type: 'strong', text: '宅配業者が来た。荷物のラベルをチラ見できた。' },
  { id: 'neighbor', w: 9,  type: 'rumor',  text: '隣人がゴミ出しに出てきた。聞いてもいないのに喋り出した。' },
  { id: 'crow',     w: 8,  type: 'none',   text: 'カラスが洗濯物を荒らして逃げた。収穫なし。' },
  { id: 'cat',      w: 6,  type: 'none',   text: '猫が通った。かわいい。それだけ。' },
  { id: 'tv',       w: 6,  type: 'none',   text: '隣の部屋のテレビの音しか聞こえない。' },
  { id: 'camera',   w: 8,  type: 'alert',  text: '防犯カメラがゆっくりこっちを向いた…マークされた。ポスト調査の発覚率が上がる！' },
  { id: 'rain',     w: 7,  type: 'rain',   text: '雨が降ってきた！住人が洗濯物を取り込んでしまった…もう新しい洗濯物ヒントは出ない。' },
  { id: 'kanrinin', w: 12, type: 'caught', text: '管理人が巡回してきた！目が合った。完全に合った。' },
  { id: 'kitaku',   w: 10, type: 'timer',  text: '住人が帰ってきた！！10秒以内に回答しろ！' },
];

const VT_CAUGHT_POST = [
  'ポストを覗き込んでいたら、背後に管理人が立っていた。',
  '「何かご用ですか」——管理人だ。終わった。',
];

const VT_TIMEOUT_ROAST = 'モタモタしてたら住人と目が合いました。逃げてください。';

// 飲みルール（表示用）
const VT_DRINK_RULES = [
  ['不正解', '一口'],
  ['正解', 'セーフ'],
  ['管理人に見つかる', '一口'],
  ['自信満々で外す', '二口'],
  ['全員が同じ答えで外す', '全員一口'],
  ['少数派で正解', '他全員一口'],
  ['一番偏見がキモかった人', '一口'],
];

if (typeof window !== 'undefined') {
  window.VT_WAIT_TABLE = VT_WAIT_TABLE;
  window.VT_CAUGHT_POST = VT_CAUGHT_POST;
  window.VT_TIMEOUT_ROAST = VT_TIMEOUT_ROAST;
  window.VT_DRINK_RULES = VT_DRINK_RULES;
}
if (typeof module !== 'undefined') {
  module.exports = { VT_WAIT_TABLE, VT_CAUGHT_POST, VT_TIMEOUT_ROAST, VT_DRINK_RULES };
}
