// 聞き込みランダムイベント（旧「しばらく待つ」を統合）
// type: hint=ヒント / strong=強ヒント / rumor=確定噂 / none=空振り
//       alert=ポスト発覚率UP / rain=ヒント打ち止め / caught=発覚 / timer=10秒回答
// w: 出現重み。同一ゲーム内では全種類消化するまで同じイベントは出ない。
const VT_NEIGHBOR_TABLE = [
  { id: 'chat',     w: 10, type: 'hint',   text: '隣人がペラペラ喋り出した。有力な情報だ。' },
  { id: 'garbage',  w: 8,  type: 'hint',   text: 'ゴミ捨て場で住人の知り合いと遭遇。つい話してくれた。' },
  { id: 'phone',    w: 8,  type: 'hint',   text: '住人の電話が漏れ聞こえた。生活が少し見えた。' },
  { id: 'takuhai',  w: 8,  type: 'strong', text: '宅配業者と雑談できた。決定的な手がかりだ。' },
  { id: 'idobata',  w: 9,  type: 'rumor',  text: '井戸端会議に混ざれた。確度の高い噂を入手。' },
  { id: 'granny',   w: 8,  type: 'none',   text: 'おばあちゃんに捕まった。天気の話しかしない。' },
  { id: 'camera',   w: 8,  type: 'alert',  text: '聞き込みが怪しまれた。ポスト確認の発覚率が上がった。' },
  { id: 'rain',     w: 7,  type: 'rain',   text: '雨が降り出して全員引っ込んだ。もう新しいヒントは出ない。' },
  { id: 'kanrinin', w: 12, type: 'caught', text: '聞き込み中に管理人と鉢合わせた！' },
  { id: 'kitaku',   w: 10, type: 'timer',  text: '住人が帰ってきた！！聞き込みしてる場合じゃない！' },
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
  window.VT_NEIGHBOR_TABLE = VT_NEIGHBOR_TABLE;
  window.VT_CAUGHT_POST = VT_CAUGHT_POST;
  window.VT_TIMEOUT_ROAST = VT_TIMEOUT_ROAST;
  window.VT_DRINK_RULES = VT_DRINK_RULES;
}
if (typeof module !== 'undefined') {
  module.exports = { VT_NEIGHBOR_TABLE, VT_CAUGHT_POST, VT_TIMEOUT_ROAST, VT_DRINK_RULES };
}
