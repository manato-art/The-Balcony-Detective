// ランダムイベント（「しばらく待つ」用）と各種テキスト
const VT_WAIT_EVENTS = {
  // type: hint=追加ヒント / none=空振り / caught=見つかった / timer=10秒回答
  hint: [
    '風でカーテンが開いた！部屋の中が一瞬見えた。',
    '部屋の電気がついた。生活パターンが読めるぞ。',
    '宅配業者が来た。荷物のラベルをチラ見できた。',
    '風で洗濯物がめくれて、奥の一枚が見えた。',
  ],
  none: [
    'カラスが洗濯物を荒らして逃げていった。収穫なし。',
    '雨がパラついてきた。住人は現れない。',
    '隣の部屋のテレビの音しか聞こえない。',
    '猫が通った。かわいい。それだけ。',
  ],
  caught: [
    '管理人が巡回してきた！目が合った。完全に合った。',
    '防犯カメラがゆっくりこっちを向いた…見られている！',
  ],
  timer: [
    '住人が帰ってきた！！10秒以内に回答しろ！',
  ],
};

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
  window.VT_WAIT_EVENTS = VT_WAIT_EVENTS;
  window.VT_CAUGHT_POST = VT_CAUGHT_POST;
  window.VT_TIMEOUT_ROAST = VT_TIMEOUT_ROAST;
  window.VT_DRINK_RULES = VT_DRINK_RULES;
}
if (typeof module !== 'undefined') {
  module.exports = { VT_WAIT_EVENTS, VT_CAUGHT_POST, VT_TIMEOUT_ROAST, VT_DRINK_RULES };
}
