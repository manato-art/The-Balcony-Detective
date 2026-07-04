// ベランダ探偵 — UI制御（Duolingo風ライトポップ + マスコット演出）
(function () {
  const G = window.VT_GAME;
  const I = window.VT_icon;
  const M = window.VT_mascot;
  const AV = window.VT_avatar;
  const F = window.VT_facade;
  const RP = window.VT_roomPos;
  const SC = window.VT_scene;
  const HC = window.VT_hintColor;
  const HK = window.VT_HANG_KINDS;
  const CATS = window.VT_CATS;
  const MANSIONS = window.VT_MANSIONS;
  const RULES = window.VT_DRINK_RULES;

  const $ = (s) => document.querySelector(s);
  const UI = {};
  window.UI = UI;

  const cfg = { players: ['', ''], rounds: 3, mansionId: null };
  let confOn = false;
  let timerInt = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function show(id) {
    document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
    $('#scr-' + id).classList.add('active');
    window.scrollTo(0, 0);
  }
  function vibrate(p) { if (navigator.vibrate) navigator.vibrate(p); }
  function bubbleRow(pose, size, html) {
    return '<div class="mascot-row"><div class="m-fig">' + M(pose, size) + '</div><div class="bubble">' + html + '</div></div>';
  }

  /* ============ タイトル ============ */
  function renderTitle() {
    $('#scr-title').innerHTML =
      '<div class="title-mascot">' + M('base', 190) + '</div>' +
      '<div class="title-kicker">NIGHT INVESTIGATION GAME</div>' +
      '<h1 class="title-name">ベランダ探偵</h1>' +
      '<p class="title-sub">洗濯物と生活感だけで、住人を当てろ。<br>ハト探偵と挑む、飲み会向け推理クソゲー。</p>' +
      '<div class="title-menu">' +
      '<button class="btn" onclick="UI.goSetup()">' + I('search') + '捜査開始</button>' +
      '<button class="btn ghost" onclick="UI.modal(\'howto\')">' + I('book') + '遊び方</button>' +
      '<button class="btn ghost" onclick="UI.modal(\'rules\')">' + I('beer') + '飲みルール</button>' +
      '</div>' +
      '<p class="title-note">お酒は20歳になってから。イッキ・飲酒の強要はダメ、絶対。ソフドリ参加OK。</p>';
  }

  /* ============ プレイヤー設定 ============ */
  UI.goSetup = function () { renderSetup(); show('setup'); };
  function renderSetup() {
    const rows = cfg.players.map((p, i) =>
      '<div class="player-row">' +
      '<input type="text" maxlength="10" placeholder="プレイヤー' + (i + 1) + '" value="' + esc(p) + '" oninput="UI.setName(' + i + ', this.value)">' +
      (cfg.players.length > 1 ? '<button class="del" aria-label="削除" onclick="UI.delPlayer(' + i + ')">' + I('x') + '</button>' : '') +
      '</div>').join('');
    $('#scr-setup').innerHTML =
      '<div class="head"><button class="back" aria-label="戻る" onclick="UI.goTitle()">' + I('arrow') + '</button><h1>捜査メンバー</h1></div>' +
      bubbleRow('point', 92, '一緒に張り込むメンバーを教えて！') +
      '<div class="section-label">プレイヤー名（1〜8人）</div>' +
      '<div id="playerList">' + rows + '</div>' +
      (cfg.players.length < 8 ? '<button class="add-row" onclick="UI.addPlayer()">' + I('user') + 'プレイヤーを追加</button>' : '') +
      '<div class="section-label">1人あたりの回数</div>' +
      '<div class="stepper">' +
      '<button aria-label="減らす" onclick="UI.setRounds(-1)">−</button>' +
      '<div class="val">' + cfg.rounds + '<small>回 × ' + cfg.players.length + '人</small></div>' +
      '<button aria-label="増やす" onclick="UI.setRounds(1)">＋</button>' +
      '</div>' +
      '<div class="foot"><button class="btn" onclick="UI.startGame()">' + I('search') + '捜査開始</button></div>';
  }
  UI.goTitle = function () { show('title'); };
  UI.setName = function (i, v) { cfg.players[i] = v; };
  UI.addPlayer = function () { if (cfg.players.length < 8) { cfg.players.push(''); renderSetup(); } };
  UI.delPlayer = function (i) { if (cfg.players.length > 1) { cfg.players.splice(i, 1); renderSetup(); } };
  UI.setRounds = function (d) { cfg.rounds = Math.min(5, Math.max(1, cfg.rounds + d)); renderSetup(); };

  /* ============ ゲーム開始（マンションはランダム選定） ============ */
  UI.startGame = function () {
    cfg.players = cfg.players.map((p, i) => p.trim() || 'プレイヤー' + (i + 1));
    cfg.mansionId = MANSIONS[Math.floor(Math.random() * MANSIONS.length)].id;
    G.newGame({ players: cfg.players, rounds: cfg.rounds, mansionId: cfg.mansionId });
    beginTurn();
  };

  /* ============ ターン開始（建物全景→対象部屋にズーム） ============ */
  function beginTurn() {
    const t = G.startTurn();
    const s = G.state;
    const name = s.players[t.playerIdx].name;
    const pos = RP(t.room);
    $('#scr-pass').innerHTML =
      '<div class="pass-top">' + bubbleRow('point', 86, '「<b>' + t.room + '号室</b>のベランダを調べて、<br>住人を当てて！」') + '</div>' +
      '<div class="facade-wrap" id="facadeWrap" style="transform-origin:' + pos.x + '% ' + pos.y + '%">' + F(s.mansion, t.room, 320) + '</div>' +
      '<div class="mname">' + s.mansion.name + '（' + (s.turnNo + 1) + '/' + s.queue.length + '件目）</div>' +
      '<div class="pass-label">スマホを渡して</div>' +
      '<div class="pass-name">' + esc(name) + '</div>' +
      '<button class="btn" id="zoomBtn" onclick="UI.zoomIn()">' + I('eye') + '張り込み開始</button>';
    show('pass');
  }
  UI.zoomIn = function () {
    const w = $('#facadeWrap');
    if (!w || w.classList.contains('zoom')) return;
    const b = $('#zoomBtn');
    if (b) b.disabled = true;
    vibrate([30]);
    w.classList.add('zoom');
    setTimeout(() => UI.goPlay(), 680);
  };

  /* ============ 捜査画面 ============ */
  const ACTIONS = [
    { k: 'observe', icon: 'eye', nm: 'ベランダ観察', risk: '安全・ヒント追加' },
    { k: 'post', icon: 'post', nm: 'ポスト周り', risk: '強ヒント／発覚率50%' },
    { k: 'wait', icon: 'clock', nm: 'しばらく待つ', risk: '何かが起きる…' },
    { k: 'neighbor', icon: 'chat', nm: '隣人に聞く', risk: '噂（嘘かも）' },
  ];
  UI.goPlay = function () {
    const t = G.state.turn;
    const s = G.state;
    const name = s.players[t.playerIdx].name;
    const pct = Math.round((s.turnNo / s.queue.length) * 100);
    $('#scr-play').innerHTML =
      '<div class="prog"><div class="prog-fill' + (s.combo >= 3 ? ' hot' : '') + '" style="width:' + Math.max(pct, 4) + '%"></div></div>' +
      '<div class="play-head">' +
      '<div class="who">' + I('user') + esc(name) + '</div>' +
      (s.combo >= 2 ? '<span class="combo-pill">' + I('star') + s.combo + 'コンボ中</span>' : '') +
      '<div class="room-chip">' + t.room + '号室</div>' +
      '</div>' +
      '<div class="scene-box" id="sceneBox"><div id="scene"></div><div class="scene-tip" id="sceneTip"></div></div>' +
      '<p class="scene-note">気になるアイテムはタップで確認</p>' +
      '<div class="section-label">容疑者リスト</div>' +
      '<div class="suspects">' +
      t.choices.map((c) =>
        '<button class="suspect" onclick="UI.openAnswer()">' + AV(c.id, 34) + '<span>' + c.name + '</span></button>').join('') +
      '</div>' +
      '<div class="section-label">捜査ログ</div>' +
      '<div class="log" id="log"><div class="log-line">' + t.room + '号室の張り込みを開始した。</div></div>' +
      '<div class="section-label">追加調査（各1回まで）</div>' +
      '<div class="action-grid" id="actions">' +
      ACTIONS.map((a) =>
        '<button class="action-card a-' + a.k + '" id="act-' + a.k + '" onclick="UI.act(\'' + a.k + '\')">' +
        I(a.icon) + '<div class="nm">' + a.nm + '</div><div class="risk">' + a.risk + '</div></button>').join('') +
      '</div>' +
      '<div class="cta-bar"><button class="btn" id="answerBtn" onclick="UI.openAnswer()">' + I('search') + '回答する</button></div>';
    newScene(t, s);
    renderScene();
    show('play');
  };

  /* ---- ベランダシーン管理 ---- */
  let scene = null;
  function newScene(t, s) {
    scene = {
      accent: s.mansion.accent,
      curtain: null, curtainClosed: false,
      light: false, rain: false, silhouette: false,
      items: [], freeHang: [0, 1, 2], freeFloor: [0, 1, 2, 3, 4],
    };
    t.shown.forEach((h) => pushItem(h, false, false));
  }
  function pushItem(h, strong, fresh) {
    const kind = h[1], label = h[0];
    const color = HC(label, kind);
    if (kind === 'curtain') {
      scene.curtain = { color, label };
      scene.curtainClosed = true;
      return;
    }
    let hang = HK.indexOf(kind) !== -1;
    let slot;
    if (hang && scene.freeHang.length) slot = scene.freeHang.shift();
    else if (!hang && scene.freeFloor.length) slot = scene.freeFloor.shift();
    else if (scene.freeFloor.length) { hang = false; slot = scene.freeFloor.shift(); }
    else if (scene.freeHang.length) { hang = true; slot = scene.freeHang.shift(); }
    else return;
    scene.items.push({ kind, color, label, slot, hang, strong: !!strong, fresh: !!fresh });
  }
  function renderScene() {
    $('#scene').innerHTML = SC(scene);
    scene.items.forEach((it) => { it.fresh = false; });
  }
  UI.itemTap = function (i) {
    const label = i === -1
      ? (scene.curtain && scene.curtain.label)
      : (scene.items[i] && scene.items[i].label);
    if (!label) return;
    const tip = $('#sceneTip');
    tip.textContent = label;
    tip.classList.add('on');
    clearTimeout(UI._tipT);
    UI._tipT = setTimeout(() => tip.classList.remove('on'), 2000);
  };
  function sceneFx(kind) {
    const box = $('#sceneBox');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'scene-fx ' + kind;
    el.innerHTML = kind === 'crow'
      ? '<svg viewBox="0 0 60 40" width="58"><path d="M8 24 Q17 10 30 20 Q43 10 52 24 L30 19 Z" fill="#3c3c46"/><circle cx="30" cy="15" r="6" fill="#3c3c46"/><path d="M34 14 l8 2 -8 2Z" fill="#ffc800"/></svg>'
      : '<svg viewBox="0 0 70 44" width="66"><ellipse cx="28" cy="30" rx="19" ry="11" fill="#8a93a5"/><circle cx="51" cy="22" r="9" fill="#8a93a5"/><path d="M45 15 l3 -7 4 6Z M53 14 l4 -6 3 7Z" fill="#8a93a5"/><path d="M10 28 q-9 -2 -6 -11" stroke="#8a93a5" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="48" cy="21" r="1.5" fill="#2e3a4d"/><circle cx="55" cy="21" r="1.5" fill="#2e3a4d"/></svg>';
    box.appendChild(el);
    setTimeout(() => el.remove(), 2300);
  }
  function addLog(text, cls) {
    const el = document.createElement('div');
    el.className = 'log-line' + (cls ? ' ' + cls : '');
    el.textContent = text;
    $('#log').appendChild(el);
  }
  function lockActions() {
    document.querySelectorAll('.action-card').forEach((b) => b.classList.add('used'));
    $('#answerBtn').classList.add('urge');
  }
  UI.act = function (kind) {
    const ev = G.doAction(kind);
    if (!ev) return;
    $('#act-' + kind).classList.add('used');
    if (ev.type === 'caught') {
      addLog(ev.text, 'bad');
      addLog('見つかった！一口飲め。ここからは回答のみ。', 'bad');
      $('#sceneBox').classList.add('shake');
      vibrate([80, 50, 80]);
      lockActions();
    } else if (ev.type === 'timer') {
      addLog(ev.text, 'bad');
      vibrate([200, 80, 200]);
      lockActions();
      // 窓に人影＋電気ON→ハト乱入
      scene.silhouette = true;
      scene.light = true;
      scene.curtainClosed = false;
      renderScene();
      setTimeout(showPanic, 700);
    } else if (ev.type === 'hints' || ev.type === 'strong') {
      addLog(ev.text, 'good');
      if (ev.id === 'curtain') { scene.curtainClosed = false; scene.light = true; }
      if (ev.id === 'light') scene.light = true;
      (ev.hints || []).forEach((h) => pushItem(h, ev.type === 'strong', true));
      renderScene();
    } else if (ev.type === 'rumor') {
      addLog(ev.text, 'rumor');
    } else if (ev.type === 'alert') {
      addLog(ev.text, 'warn');
      vibrate([60]);
      const r = document.querySelector('#act-post .risk');
      if (r) r.textContent = '強ヒント／発覚率80%!';
    } else if (ev.type === 'rain') {
      addLog(ev.text, 'warn');
      scene.rain = true;
      renderScene();
    } else {
      addLog(ev.text);
      if (ev.id === 'light') { scene.light = true; renderScene(); }
      if (ev.id === 'crow') sceneFx('crow');
      if (ev.id === 'cat') sceneFx('cat');
    }
  };

  /* ============ タイマー ============ */
  // 住人帰宅: ハトが焦って乱入 → 10秒回答モードへ
  function showPanic() {
    const ov = document.createElement('div');
    ov.className = 'panic-back';
    ov.innerHTML = '<div class="panic-box">' + M('shock', 150) +
      '<div class="panic-txt">住人が帰ってきた！！</div>' +
      '<div class="panic-sub">10秒以内に回答しろ！</div></div>';
    document.body.appendChild(ov);
    setTimeout(() => { ov.remove(); startTimer(10); UI.openAnswer(true); }, 1600);
  }
  function startTimer(sec) {
    let left = sec;
    const ov = $('#timer-overlay');
    ov.classList.remove('hidden');
    const draw = () => { ov.innerHTML = '<div class="timer-pill">' + I('clock') + '残り ' + left + ' 秒</div>'; };
    draw();
    timerInt = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        stopTimer();
        const r = G.timeout();
        if (r) renderReveal(r);
      } else draw();
    }, 1000);
  }
  function stopTimer() {
    if (timerInt) { clearInterval(timerInt); timerInt = null; }
    $('#timer-overlay').classList.add('hidden');
    const back = $('#answer-back');
    if (back) back.remove();
  }

  /* ============ 回答シート ============ */
  UI.openAnswer = function (forced) {
    const t = G.state.turn;
    if (!t || t.done) return;
    confOn = false;
    const abc = ['A', 'B', 'C', 'D'];
    const back = document.createElement('div');
    back.className = 'answer-back';
    back.id = 'answer-back';
    back.innerHTML =
      '<div class="answer-sheet">' +
      '<div class="handle"></div>' +
      '<h2>' + t.room + '号室の住人は？</h2>' +
      t.choices.map((c, i) =>
        '<button class="choice" onclick="UI.choose(' + i + ')">' +
        '<span class="avv">' + AV(c.id, 48) + '</span>' +
        '<span class="cname">' + c.name + '</span>' +
        '<span class="abc">' + abc[i] + '</span></button>').join('') +
      '<button class="conf-toggle" id="confToggle" onclick="UI.toggleConf()">' +
      '<span class="box">' + I('check') + '</span>自信満々で回答する（正解+50点／外したら二口）</button>' +
      (forced || t.timered ? '' : '<button class="btn ghost" onclick="UI.closeAnswer()">もう少し調べる</button>') +
      '</div>';
    if (!forced && !t.timered) back.addEventListener('click', (e) => { if (e.target === back) UI.closeAnswer(); });
    document.body.appendChild(back);
  };
  UI.closeAnswer = function () {
    const back = $('#answer-back');
    if (back) back.remove();
  };
  UI.toggleConf = function () {
    confOn = !confOn;
    $('#confToggle').classList.toggle('on', confOn);
  };
  UI.choose = function (i) {
    stopTimer();
    UI.closeAnswer();
    const r = G.answer(i, confOn);
    if (r) renderReveal(r);
  };

  /* ============ 結果発表 ============ */
  function renderReveal(r) {
    stopTimer();
    UI.closeAnswer();
    vibrate(r.correct ? [40] : [70, 50, 70]);
    const cat = CATS[r.resident.cat];
    const last = G.state.turnNo + 1 >= G.state.queue.length;
    const verdict = r.timedOut ? '時間切れ！' : r.correct ? '正解！' : '不正解…';
    $('#scr-reveal').innerHTML =
      '<div class="res-avatar">' + AV(r.resident.id, 150) + '</div>' +
      '<div><span class="tag ' + cat.color + '">' + cat.label + '</span></div>' +
      '<div class="res-name">' + r.resident.name + '</div>' +
      '<div class="res-desc">' + r.resident.desc + '</div>' +
      '<div class="reveal-mascot">' + bubbleRow(r.correct ? 'happy' : 'shock', 104, r.roast) + '</div>' +
      '<div class="result-banner ' + (r.correct ? 'ok' : 'ng') + '"><div class="inner">' +
      '<h3>' + I(r.correct ? 'check' : 'x') + verdict + (r.correct && r.combo >= 2 ? '　' + r.combo + 'コンボ！' : '') + '</h3>' +
      (r.sips > 0
        ? '<div class="drink">' + I('beer') + esc(r.player.name) + ' は ' + r.sips + '口 飲め</div>'
        : '<div class="drink">' + I('check') + 'セーフ。飲まなくてよし</div>') +
      '<div class="pts">獲得 +' + r.points + '点（合計 ' + r.player.score + '点）</div>' +
      (r.notes.length ? '<div class="notes">' + r.notes.join(' ／ ') + '</div>' : '') +
      '<button class="btn" onclick="UI.next()">' + I('arrow') + (last ? '結果発表へ' : '次のプレイヤーへ') + '</button>' +
      '</div></div>';
    show('reveal');
  }
  UI.next = function () {
    const n = G.nextTurn();
    if (n.done) renderFinal();
    else beginTurn();
  };

  /* ============ 最終結果 ============ */
  function renderFinal() {
    const res = G.results();
    const rows = res.rank.map((p, i) =>
      '<div class="rank-item' + (i === 0 ? ' first' : '') + '" style="animation-delay:' + (i * 90) + 'ms">' +
      '<div class="pos">' + (i + 1) + '</div>' +
      '<div class="info"><div class="nm">' + esc(p.name) + '</div>' +
      '<div class="st">正解 ' + p.correct + ' ／ 飲み ' + p.sips + '口</div></div>' +
      '<div class="sc">' + p.score + '</div></div>').join('');
    $('#scr-final').innerHTML =
      '<div class="final-mascot">' + M('happy', 140) + '</div>' +
      '<h1>捜査終了！</h1>' +
      '<div class="rank-list">' + rows + '</div>' +
      '<div class="badge-row">' +
      '<div class="badge-card mvp">' + I('trophy') + '<div class="bl">MVP名探偵</div><div class="bn">' + esc(res.mvp.name) + '</div></div>' +
      (res.ikenie ? '<div class="badge-card ikenie">' + I('beer') + '<div class="bl">今夜の生贄</div><div class="bn">' + esc(res.ikenie.name) + '</div></div>' : '') +
      '</div>' +
      '<div class="final-point">' + bubbleRow('point', 100, res.ikenie
        ? '今夜の生贄は…<b>' + esc(res.ikenie.name) + '</b>、キミだ！<br>責任を持って飲むように。'
        : '全員ほぼ無傷…！？優秀すぎる捜査班だ。') + '</div>' +
      '<div class="henken">最後の審判：全員で「一番偏見がキモかった人」を同時に指差せ。<br>一番指を集めた人は一口。</div>' +
      '<div class="foot" style="display:flex;flex-direction:column;gap:10px">' +
      '<button class="btn" onclick="UI.replay()">' + I('dice') + '同じメンバーでもう一回</button>' +
      '<button class="btn ghost" onclick="UI.goSetup()">' + I('users') + 'メンバーを変える</button>' +
      '<button class="btn ghost" onclick="UI.goTitle()">タイトルへ</button>' +
      '</div>';
    show('final');
  }
  UI.replay = function () { UI.startGame(); };

  /* ============ モーダル ============ */
  UI.modal = function (kind) {
    let inner = '';
    if (kind === 'rules') {
      inner = '<h2>' + I('beer') + '飲みルール</h2>' +
        RULES.map((r) => '<div class="rule-row"><span class="rr-l">' + r[0] + '</span><span class="rr-r">' + r[1] + '</span></div>').join('') +
        '<p class="modal-note">「全員同じ答え」「少数派で正解」は口頭で運用。飲めない人はソフドリで参加。強要は絶対禁止。</p>';
    } else {
      const steps = [
        'プレイヤーを登録して、現場のマンションを選ぶ。',
        '順番が来たらスマホを受け取る。「402号室の住人を当てて！」等のミッションが出る。',
        'ベランダの洗濯物・生活感ヒントを見て推理する。',
        '足りなければ追加調査。ただしポストは発覚率50%、「待つ」は何が起きるか分からない、隣人の噂は嘘かも。',
        '4択から回答。自信があれば「自信満々」宣言でボーナス（外すと二口）。',
        '正解発表と煽りを全員で読み上げて、飲みルールに従う。連続正解でコンボボーナス。',
      ];
      inner = '<h2>' + I('book') + '遊び方</h2>' +
        steps.map((s, i) => '<div class="howto-step"><span class="num">' + (i + 1) + '</span><span>' + s + '</span></div>').join('');
    }
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = '<div class="modal"><div class="handle"></div>' + inner +
      '<button class="btn ghost" onclick="UI.closeModal()">閉じる</button></div>';
    back.addEventListener('click', (e) => { if (e.target === back) UI.closeModal(); });
    back.id = 'modal-open';
    document.body.appendChild(back);
  };
  UI.closeModal = function () {
    const m = $('#modal-open');
    if (m) m.remove();
  };

  /* ============ init ============ */
  renderTitle();
  show('title');
})();
