// ベランダ探偵 — ゲームロジック（UI非依存・node でもテスト可能）
(function (root) {
  const R = root.VT_RESIDENTS;
  const CATS_KEYS = ['normal', 'hot', 'trap', 'rare'];
  const MANSIONS = root.VT_MANSIONS;
  const ROOMS = root.VT_ROOMS;
  const WAIT_TABLE = root.VT_WAIT_TABLE;
  const CAUGHT_POST = root.VT_CAUGHT_POST;
  const TIMEOUT_ROAST = root.VT_TIMEOUT_ROAST;

  const byId = {};
  R.forEach((r) => { byId[r.id] = r; });

  let rng = Math.random;

  function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function weightedPick(pool) {
    const total = pool.reduce((s, p) => s + p[1], 0);
    let x = rng() * total;
    for (const [id, w] of pool) { x -= w; if (x < 0) return byId[id]; }
    return byId[pool[pool.length - 1][0]];
  }

  const G = { state: null };

  G.setRng = function (fn) { rng = fn || Math.random; };

  G.newGame = function ({ players, rounds, mansionId }) {
    const mansion = MANSIONS.find((m) => m.id === mansionId);
    if (!mansion) throw new Error('unknown mansion: ' + mansionId);
    const queue = [];
    for (let r = 0; r < rounds; r++) for (let p = 0; p < players.length; p++) queue.push(p);
    G.state = {
      players: players.map((name) => ({ name, score: 0, sips: 0, correct: 0 })),
      rounds,
      mansion,
      roomsLeft: shuffle(ROOMS),
      queue,
      waitUsed: [],
      combo: 0,
      turnNo: 0,
      turn: null,
    };
    return G.state;
  };

  // 6択生成: 正解 + confuse優先 + 同カテゴリ + 全体
  const CHOICE_N = 6;
  function buildChoices(res) {
    const ids = [res.id];
    const addFrom = (cands) => {
      for (const id of shuffle(cands)) {
        if (ids.length >= CHOICE_N) break;
        if (!ids.includes(id) && byId[id]) ids.push(id);
      }
    };
    addFrom(res.confuse || []);
    addFrom(R.filter((r) => r.cat === res.cat).map((r) => r.id));
    addFrom(R.map((r) => r.id));
    const order = shuffle(ids);
    return { choices: order.map((id) => byId[id]), answerIdx: order.indexOf(res.id) };
  }

  G.startTurn = function () {
    const s = G.state;
    if (!s || s.turnNo >= s.queue.length) return null;
    if (s.roomsLeft.length === 0) s.roomsLeft = shuffle(ROOMS);
    const room = s.roomsLeft.pop();
    const res = weightedPick(s.mansion.pool);
    const { choices, answerIdx } = buildChoices(res);
    const hints = shuffle(res.hints);
    s.turn = {
      playerIdx: s.queue[s.turnNo],
      room,
      resident: res,
      choices,
      answerIdx,
      shown: hints.slice(0, 4),         // 最初に見えているヒント
      hintQueue: hints.slice(4),        // 追加調査で出るヒント
      strongQueue: shuffle(res.strong), // 強ヒント
      used: {},                          // 使用済みアクション
      ambush: rng() < 0.12,              // 張り込み開始直後の住人帰宅カットイン
      ambushDone: false,
      locked: false,                     // 見つかった→調査不可
      timered: false,                    // 10秒回答モード
      caughtSips: 0,
      log: [],
      done: false,
    };
    return s.turn;
  };

  // 張り込み開始直後の帰宅カットイン: 誰かが一口飲んで逃走＝このターンは回答なしで終了
  // pattern: self(40%) / right(20%) / left(20%) / all=本人以外全員(20%)。隣は登録順。
  G.ambush = function () {
    const t = G.state.turn;
    if (!t || t.done || !t.ambush || t.ambushDone) return null;
    t.ambushDone = true;
    t.done = true;
    const s = G.state;
    const me = t.playerIdx;
    const n = s.players.length;
    let pattern = 'self';
    if (n >= 2) {
      const x = rng();
      pattern = x < 0.4 ? 'self' : x < 0.6 ? 'right' : x < 0.8 ? 'left' : 'all';
    }
    let drinkers;
    if (pattern === 'right') drinkers = [s.players[(me + 1) % n]];
    else if (pattern === 'left') drinkers = [s.players[(me - 1 + n) % n]];
    else if (pattern === 'all') drinkers = s.players.filter((_, i) => i !== me);
    else drinkers = [s.players[me]];
    drinkers.forEach((p) => { p.sips += 1; });
    return { pattern, drinkers, player: s.players[me] };
  };

  function popHint(t) {
    if (t.hintQueue.length) return { hint: t.hintQueue.shift(), strong: false };
    if (t.strongQueue.length) return { hint: t.strongQueue.shift(), strong: true };
    return null;
  }

  // 追加調査 kind: observe | post | wait | neighbor
  G.doAction = function (kind) {
    const t = G.state.turn;
    if (!t || t.done || t.locked || t.timered || t.used[kind]) return null;
    t.used[kind] = true;
    let ev;

    if (kind === 'observe') {
      const got = [];
      for (let i = 0; i < 2; i++) {
        const h = t.hintQueue.shift();
        if (h) got.push(h);
      }
      ev = got.length
        ? { type: 'hints', text: 'ベランダをじっくり観察した。', hints: got }
        : { type: 'none', text: 'これ以上ベランダから読み取れるものはない。' };
      got.forEach((h) => t.shown.push(h));
    } else if (kind === 'post') {
      if (rng() < (t.alerted ? 0.2 : 0.5)) {
        const p = popHint(t);
        ev = p
          ? { type: 'strong', text: 'ポスト周りを確認した。決定的な情報だ。', hints: [p.hint] }
          : { type: 'none', text: 'ポストからは何も読み取れなかった。' };
        if (p) t.shown.push(p.hint);
      } else {
        t.locked = true;
        t.caughtSips += 1;
        ev = { type: 'caught', text: pick(CAUGHT_POST) };
      }
    } else if (kind === 'wait') {
      // 同一ゲーム内で全12種を消化するまで重複しない
      const s = G.state;
      let cands = WAIT_TABLE.filter((e) => s.waitUsed.indexOf(e.id) === -1);
      if (!cands.length) { s.waitUsed = []; cands = WAIT_TABLE.slice(); }
      if (t.ambushDone) cands = cands.filter((e) => e.id !== 'kitaku'); // 二重帰宅防止
      const total = cands.reduce((a, e) => a + e.w, 0);
      let x = rng() * total;
      let evd = cands[cands.length - 1];
      for (const e of cands) { x -= e.w; if (x < 0) { evd = e; break; } }
      s.waitUsed.push(evd.id);

      if (evd.type === 'hint' || evd.type === 'strong') {
        const p = evd.type === 'strong' && t.strongQueue.length
          ? { hint: t.strongQueue.shift(), strong: true }
          : popHint(t);
        if (p) {
          t.shown.push(p.hint);
          ev = { type: p.strong ? 'strong' : 'hints', text: evd.text, hints: [p.hint] };
        } else {
          ev = { type: 'none', text: evd.text + ' …が、新しい発見はなかった。' };
        }
      } else if (evd.type === 'rumor') {
        ev = { type: 'rumor', text: evd.text + ' 噂: 「' + pick(t.resident.rumor) + '」' };
      } else if (evd.type === 'alert') {
        t.alerted = true;
        ev = { type: 'alert', text: evd.text };
      } else if (evd.type === 'rain') {
        t.hintQueue = [];
        ev = { type: 'rain', text: evd.text };
      } else if (evd.type === 'none') {
        ev = { type: 'none', text: evd.text };
      } else if (evd.type === 'caught') {
        t.locked = true;
        t.caughtSips += 1;
        ev = { type: 'caught', text: evd.text };
      } else {
        t.timered = true;
        ev = { type: 'timer', text: evd.text };
      }
      ev.id = evd.id;
    } else if (kind === 'neighbor') {
      if (rng() < 0.65) {
        ev = { type: 'rumor', text: '隣人の噂: 「' + pick(t.resident.rumor) + '」' };
      } else {
        const others = t.choices.filter((c) => c.id !== t.resident.id);
        ev = { type: 'rumor', text: '隣人の噂: 「' + pick(pick(others).rumor) + '」' };
      }
    } else {
      return null;
    }
    t.log.push(ev);
    return ev;
  };

  function usedCount(t) { return Object.keys(t.used).length; }

  function finish(t, correct, confident, timedOut) {
    const s = G.state;
    const p = s.players[t.playerIdx];
    const res = t.resident;
    let points = 0;
    let sips = t.caughtSips;
    const notes = [];
    if (t.caughtSips > 0) notes.push('見つかった分: ' + t.caughtSips + '口');

    if (correct) {
      points = 100;
      if (confident) { points += 50; notes.push('自信満々ボーナス +50'); }
      if (usedCount(t) === 0) { points += 50; notes.push('ノー調査ボーナス +50'); }
      p.correct += 1;
      s.combo += 1;
      if (s.combo >= 2) {
        const cb = Math.min(20 * (s.combo - 1), 100);
        points += cb;
        notes.push('コンボ x' + s.combo + ' +' + cb);
      }
    } else {
      s.combo = 0;
      const n = confident ? 2 : 1;
      sips += n;
      notes.push(confident ? '自信満々で外した: 二口' : '不正解: 一口');
    }
    p.score += points;
    p.sips += sips;
    t.done = true;

    const roast = timedOut
      ? TIMEOUT_ROAST
      : pick(correct ? res.roastRight : res.roastWrong);

    return { correct, timedOut: !!timedOut, resident: res, roast, points, sips, notes, player: p, combo: s.combo };
  }

  G.answer = function (choiceIdx, confident) {
    const t = G.state.turn;
    if (!t || t.done) return null;
    return finish(t, choiceIdx === t.answerIdx, !!confident, false);
  };

  G.timeout = function () {
    const t = G.state.turn;
    if (!t || t.done) return null;
    return finish(t, false, false, true);
  };

  G.nextTurn = function () {
    const s = G.state;
    s.turnNo += 1;
    s.turn = null;
    if (s.turnNo >= s.queue.length) return { done: true };
    return { done: false, playerIdx: s.queue[s.turnNo], player: s.players[s.queue[s.turnNo]] };
  };

  G.results = function () {
    const s = G.state;
    const rank = s.players.slice().sort((a, b) => b.score - a.score || a.sips - b.sips);
    const maxSips = Math.max.apply(null, s.players.map((p) => p.sips));
    return {
      rank,
      mvp: rank[0],
      ikenie: maxSips > 0 ? s.players.find((p) => p.sips === maxSips) : null,
    };
  };

  root.VT_GAME = G;
  if (typeof module !== 'undefined') module.exports = G;
})(typeof window !== 'undefined' ? window : globalThis);
