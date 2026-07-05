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
  const S = window.VT_SOUND || { sfx: function () {}, tension: function () {} };
  const D = window.VT_DEX || { unlockItem: function () {}, unlockResident: function () {}, itemCount: function () { return 0; }, resCount: function () { return 0; } };
  const CATS = window.VT_CATS;
  const MANSIONS = window.VT_MANSIONS;
  const RULES = window.VT_DRINK_RULES;

  const $ = (s) => document.querySelector(s);
  const UI = {};
  window.UI = UI;

  const cfg = { players: ['プレイヤー1', 'プレイヤー2'], rounds: 3, mansionId: null };
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
      '<button class="btn ghost" onclick="UI.goDex()">' + I('star') + '図鑑</button>' +
      '<button class="btn ghost" onclick="UI.modal(\'howto\')">' + I('book') + '遊び方</button>' +
      '<button class="btn ghost" onclick="UI.modal(\'rules\')">' + I('beer') + '飲みルール</button>' +
      '</div>' +
      '<p class="title-note">お酒は20歳になってから。イッキ・強要はダメ、絶対。ソフドリ参加OK。</p>';
  }

  /* ============ プレイヤー設定 ============ */
  UI.goSetup = function () { renderSetup(); show('setup'); };
  function renderSetup() {
    const rows = cfg.players.map((p, i) =>
      '<div class="player-row">' +
      '<input type="text" maxlength="10" placeholder="プレイヤー' + (i + 1) + '" value="' + esc(p) + '" onfocus="var i=this;setTimeout(function(){i.select()},0)" oninput="UI.setName(' + i + ', this.value)">' +
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
  UI.addPlayer = function () { if (cfg.players.length < 8) { cfg.players.push('プレイヤー' + (cfg.players.length + 1)); renderSetup(); } };
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
    S.sfx('whoosh');
    w.classList.add('zoom');
    setTimeout(() => UI.goPlay(), 680);
  };

  /* ============ 捜査画面 ============ */
  const ACTIONS = [
    { k: 'observe', icon: 'eye', nm: '観察', risk: '安全' },
    { k: 'post', icon: 'post', nm: 'ポスト', risk: '発覚50%' },
    { k: 'wait', icon: 'clock', nm: '待つ', risk: '？？？' },
    { k: 'neighbor', icon: 'chat', nm: '聞き込み', risk: '嘘かも' },
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
      '<div class="section-label">追加調査（各1回まで）</div>' +
      '<div class="action-grid" id="actions">' +
      ACTIONS.map((a) =>
        '<button class="action-card a-' + a.k + '" id="act-' + a.k + '" onclick="UI.act(\'' + a.k + '\')">' +
        I(a.icon) + '<div class="nm">' + a.nm + '</div><div class="risk">' + a.risk + '</div></button>').join('') +
      '</div>' +
      '<div class="section-label">捜査ログ</div>' +
      '<div class="log" id="log"><div class="log-line">' + t.room + '号室の張り込みを開始した。</div></div>' +
      '<div class="section-label">容疑者リスト</div>' +
      '<div class="suspects">' +
      t.choices.map((c) =>
        '<button class="suspect" onclick="UI.openAnswer()">' + AV(c.id, 34) + '<span>' + c.name + '</span></button>').join('') +
      '</div>' +
      '<div class="cta-bar"><button class="btn" id="answerBtn" onclick="UI.openAnswer()">' + I('search') + '回答する</button></div>';
    newScene(t, s);
    renderScene();
    show('play');
    if (t.ambush && !t.ambushDone) setTimeout(showAmbush, 750);
  };

  // パチンコ風カットイン: 住人帰宅！→ぐい→逃走（張り込み開始直後にランダム発生）
  // ボタンを押すまで表示し、押したらこのターンは終了して次のプレイヤーへ
  function showAmbush() {
    const r = G.ambush();
    if (!r) return;
    vibrate([220, 90, 220, 90, 300]);
    S.sfx('cutin');
    S.tension(true);
    setTimeout(() => S.sfx('drink'), 700);
    let drinkText, btnText;
    if (r.pattern === 'right') {
      drinkText = 'とばっちり！右隣の ' + esc(r.drinkers[0].name) + ' が一口';
      btnText = '隣が飲んだら逃走';
    } else if (r.pattern === 'left') {
      drinkText = 'とばっちり！左隣の ' + esc(r.drinkers[0].name) + ' が一口';
      btnText = '隣が飲んだら逃走';
    } else if (r.pattern === 'all') {
      drinkText = 'もらい事故！' + esc(r.player.name) + ' 以外の全員が一口';
      btnText = '全員飲んだら逃走';
    } else {
      drinkText = esc(r.player.name) + ' は動揺で一口';
      btnText = 'グイッ してから逃走';
    }
    const ov = document.createElement('div');
    ov.className = 'cutin-back';
    ov.id = 'cutin';
    ov.innerHTML =
      '<div class="cutin-stripes"></div><div class="cutin-flash"></div>' +
      '<div class="cutin-box">' +
      '<div class="cutin-mascot">' + M('shock', 128) + '</div>' +
      '<div class="cutin-title">住人帰宅！！</div>' +
      '<div class="cutin-sub">まさかのタイミングで帰ってきた——完全に目が合った</div>' +
      '<div class="cutin-drink">' + I('beer') + drinkText + '</div>' +
      '<div><button class="btn cutin-btn" onclick="UI.ambushFlee()">' + I('arrow') + btnText + '</button></div>' +
      '</div>';
    document.body.appendChild(ov);
  }
  UI.ambushFlee = function () {
    const ov = $('#cutin');
    if (ov) ov.remove();
    vibrate([40]);
    S.tension(false);
    UI.next();
  };

  // 管理人に見つかったカットイン → グイッしてから最終回答ページへ
  function showCaughtCutin(subText) {
    const t = G.state.turn;
    if (!t || t.done) return;
    const p = G.state.players[t.playerIdx];
    vibrate([180, 80, 180]);
    S.sfx('cutin');
    S.tension(true);
    setTimeout(() => S.sfx('drink'), 700);
    const ov = document.createElement('div');
    ov.className = 'cutin-back kanri';
    ov.id = 'cutin';
    ov.innerHTML =
      '<div class="cutin-stripes"></div><div class="cutin-flash"></div>' +
      '<div class="cutin-box">' +
      '<div class="cutin-mascot">' + AV('kanrinin', 112) + '</div>' +
      '<div class="cutin-title">見つかった！！</div>' +
      '<div class="cutin-sub">' + subText + '</div>' +
      '<div class="cutin-drink">' + I('beer') + esc(p.name) + ' は一口</div>' +
      '<div><button class="btn cutin-btn" onclick="UI.caughtGo()">' + I('arrow') + 'グイッ してから回答する</button></div>' +
      '</div>';
    document.body.appendChild(ov);
  }
  UI.caughtGo = function () {
    const ov = $('#cutin');
    if (ov) ov.remove();
    vibrate([40]);
    S.tension(false);
    renderFinalAnswer();
  };

  // ベランダ＋容疑者リストだけの最終回答ページ（容疑者タップ＝即回答）
  function renderFinalAnswer() {
    const t = G.state.turn;
    const s = G.state;
    const name = s.players[t.playerIdx].name;
    $('#scr-play').innerHTML =
      '<div class="play-head">' +
      '<div class="who">' + I('user') + esc(name) + '</div>' +
      '<div class="room-chip">' + t.room + '号室</div>' +
      '</div>' +
      '<div class="scene-box" id="sceneBox"><div id="scene"></div><div class="scene-tip" id="sceneTip"></div></div>' +
      '<div class="final-q">' + t.room + '号室の住人はこの中の誰だ？<br>容疑者をタップで即回答！</div>' +
      '<div class="suspects">' +
      t.choices.map((c, i) =>
        '<button class="suspect" onclick="UI.finalChoose(' + i + ')">' + AV(c.id, 34) + '<span>' + c.name + '</span></button>').join('') +
      '</div>';
    renderScene();
    window.scrollTo(0, 0);
  }
  UI.finalChoose = function (i) {
    const r = G.answer(i, false);
    if (r) renderReveal(r);
  };

  /* ---- ベランダシーン管理 ---- */
  let scene = null;
  function newScene(t, s) {
    scene = {
      accent: s.mansion.accent,
      curtain: null, curtainClosed: false,
      light: false, rain: false, silhouette: false,
      items: [], freeHang: [0, 1, 2], freeFloor: [0, 1, 2, 3, 4], freeBack: [0, 1, 2, 3],
    };
    t.shown.forEach((h) => pushItem(h, false, false));
    // シークレットアイテム（低確率・図鑑コレクション）
    if (t.secretItem) {
      let zone = null, slot;
      if (scene.freeBack.length) { zone = 'back'; slot = scene.freeBack.shift(); }
      else if (scene.freeFloor.length) { zone = 'floor'; slot = scene.freeFloor.shift(); }
      if (zone) {
        scene.items.push({ kind: 'box', variant: t.secretItem.v, color: '#ffc800', label: 'シークレット発見！ ' + t.secretItem.name, slot, zone, strong: true, fresh: true });
        D.unlockItem('s:' + t.secretItem.id);
      }
    }
  }
  function pushItem(h, strong, fresh) {
    const kind = h[1], label = h[0];
    const color = HC(label, kind);
    if (kind === 'curtain') {
      scene.curtain = { color, label };
      scene.curtainClosed = true;
      return;
    }
    const variant = window.VT_classify(label, kind);
    const vdef = variant && window.VT_VARIANTS[variant];
    const wantHang = vdef ? !!vdef.hang : HK.indexOf(kind) !== -1;
    let zone, slot;
    if (wantHang && scene.freeHang.length) { zone = 'hang'; slot = scene.freeHang.shift(); }
    else if (!wantHang && scene.freeFloor.length) { zone = 'floor'; slot = scene.freeFloor.shift(); }
    else if (scene.freeBack.length) { zone = 'back'; slot = scene.freeBack.shift(); }
    else if (scene.freeFloor.length) { zone = 'floor'; slot = scene.freeFloor.shift(); }
    else if (scene.freeHang.length) { zone = 'hang'; slot = scene.freeHang.shift(); }
    else return;
    scene.items.push({ kind, variant, color, label, slot, zone, strong: !!strong, fresh: !!fresh });
    D.unlockItem(variant ? 'v:' + variant : 'k:' + kind);
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
      $('#sceneBox').classList.add('shake');
      vibrate([80, 50, 80]);
      S.sfx('caught');
      lockActions();
      setTimeout(() => showCaughtCutin(ev.text), 550);
    } else if (ev.type === 'timer') {
      addLog(ev.text, 'bad');
      vibrate([200, 80, 200]);
      S.sfx('alarm');
      lockActions();
      // 窓に人影＋電気ON→ハト乱入
      scene.silhouette = true;
      scene.light = true;
      scene.curtainClosed = false;
      renderScene();
      setTimeout(showPanic, 700);
    } else if (ev.type === 'hints' || ev.type === 'strong') {
      addLog(ev.text, 'good');
      S.sfx(ev.type === 'strong' ? 'strong' : 'pop');
      if (ev.id === 'curtain') { scene.curtainClosed = false; scene.light = true; }
      if (ev.id === 'light') scene.light = true;
      (ev.hints || []).forEach((h) => pushItem(h, ev.type === 'strong', true));
      renderScene();
    } else if (ev.type === 'rumor') {
      addLog(ev.text, 'rumor');
      S.sfx('rumor');
    } else if (ev.type === 'alert') {
      addLog(ev.text, 'warn');
      S.sfx('warn');
      vibrate([60]);
      const r = document.querySelector('#act-post .risk');
      if (r) r.textContent = '発覚80%!';
    } else if (ev.type === 'rain') {
      addLog(ev.text, 'warn');
      S.sfx('warn');
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
    S.tension(true);
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
    S.sfx('tick');
    timerInt = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        stopTimer();
        S.sfx('timeup');
        const r = G.timeout();
        if (r) renderReveal(r);
      } else { draw(); S.sfx('tick'); }
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
    const abc = ['A', 'B', 'C', 'D', 'E', 'F'];
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
    S.tension(false);
    vibrate(r.correct ? [40] : [70, 50, 70]);
    if (r.correct) {
      S.sfx('correct');
      if (r.combo >= 2) setTimeout(() => S.sfx('combo'), 450);
    } else {
      S.sfx('wrong');
      if (r.sips > 0) setTimeout(() => S.sfx('drink'), 600);
    }
    D.unlockResident(r.resident.id);
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
    S.sfx('fanfare');
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

  /* ============ 図鑑（発見型コレクション） ============ */
  let dexTab = 'res';
  UI.goDex = function () { renderDex(); show('dex'); };
  UI.setDexTab = function (t) { dexTab = t; renderDex(); };
  function itemCatalog() {
    const seen = {};
    const list = [];
    (window.VT_RESIDENTS || []).forEach((r) => {
      r.hints.concat(r.strong).forEach((h) => {
        if (h[1] === 'curtain') return;
        const v = window.VT_classify(h[0], h[1]);
        const key = v ? 'v:' + v : 'k:' + h[1];
        if (seen[key]) return;
        seen[key] = true;
        list.push({ key, spec: v ? { kind: h[1], variant: v } : { kind: h[1] }, label: h[0], color: HC(h[0], h[1]) });
      });
    });
    (window.VT_SECRET_ITEMS || []).forEach((s) => {
      list.push({ key: 's:' + s.id, spec: { kind: 'box', variant: s.v }, label: s.name, color: '#ffc800', secret: true });
    });
    return list;
  }
  function renderDex() {
    const RS = window.VT_RESIDENTS;
    let gridHtml, prog;
    if (dexTab === 'items') {
      const cat = itemCatalog();
      const got = cat.filter((c) => D.itemCount(c.key) > 0).length;
      prog = 'アイテム発見 ' + got + ' / ' + cat.length;
      gridHtml = cat.map((c) => {
        const ok = D.itemCount(c.key) > 0;
        return '<div class="dex-tile' + (ok ? '' : ' locked') + (c.secret ? ' secret' : '') + '">' +
          window.VT_itemSVG(c.spec, c.color, 52) +
          '<div class="dnm">' + (ok ? c.label : '？？？') + '</div>' +
          (c.secret ? '<div class="dsec">SECRET</div>' : '') +
          '</div>';
      }).join('');
    } else {
      const got = RS.filter((r) => D.resCount(r.id) > 0).length;
      prog = '人物発見 ' + got + ' / ' + RS.length;
      gridHtml = RS.map((r) => {
        const ok = D.resCount(r.id) > 0;
        const sec = r.cat === 'secret';
        return '<div class="dex-tile' + (ok ? '' : ' locked') + (sec ? ' secret' : '') + '">' +
          '<div class="dav">' + AV(r.id, 40) + '</div>' +
          '<div class="dnm">' + (ok ? r.name : '？？？') + '</div>' +
          (sec ? '<div class="dsec">SECRET</div>' : (ok ? '<div class="dct">遭遇 ' + D.resCount(r.id) + '回</div>' : '')) +
          '</div>';
      }).join('');
    }
    $('#scr-dex').innerHTML =
      '<div class="head"><button class="back" aria-label="戻る" onclick="UI.goTitle()">' + I('arrow') + '</button><h1>図鑑</h1></div>' +
      '<div class="dex-tabs">' +
      '<button class="' + (dexTab === 'res' ? 'on' : '') + '" onclick="UI.setDexTab(\'res\')">' + I('users') + '人物</button>' +
      '<button class="' + (dexTab === 'items' ? 'on' : '') + '" onclick="UI.setDexTab(\'items\')">' + I('box') + 'アイテム</button>' +
      '</div>' +
      '<div class="dex-prog">' + prog + '</div>' +
      '<div class="dex-grid">' + gridHtml + '</div>';
  }

  /* ============ モーダル ============ */
  UI.modal = function (kind) {
    let inner = '';
    if (kind === 'rules') {
      inner = '<h2>' + I('beer') + '飲みルール</h2>' +
        RULES.map((r) => '<div class="rule-row"><span class="rr-l">' + r[0] + '</span><span class="rr-r">' + r[1] + '</span></div>').join('') +
        '<p class="modal-note">「全員同じ答え」「少数派で正解」は口頭で運用。飲めない人はソフドリで参加。強要は絶対禁止。</p>';
    } else {
      const figFacade = '<div class="howto-fig facade">' + F(MANSIONS[3], '402', 200) + '</div>';
      const figScene = '<div class="howto-fig">' + SC({
        accent: 'pink',
        curtain: { color: '#ffd3e0', label: '' }, curtainClosed: true,
        light: false, rain: false, silhouette: false,
        items: [
          { kind: 'laundry', variant: 'lace', color: '#4a4a58', label: '', slot: 0, zone: 'hang' },
          { kind: 'laundry', variant: 'dress', color: '#ffc800', label: '', slot: 1, zone: 'hang' },
          { kind: 'box', variant: 'box_crate', color: '#c99b66', label: '', slot: 1, zone: 'floor' },
          { kind: 'bag', variant: 'bag_brand', color: '#f7f3ea', label: '', slot: 3, zone: 'floor' },
        ],
      }) + '</div>';
      const figActs = '<div class="howto-fig pad"><div class="action-grid">' +
        ACTIONS.map((a) => '<div class="action-card a-' + a.k + '">' + I(a.icon) + '<div class="nm">' + a.nm + '</div><div class="risk">' + a.risk + '</div></div>').join('') +
        '</div></div>';
      const figSus = '<div class="howto-fig pad"><div class="suspects">' +
        '<div class="suspect">' + AV('kyaba', 30) + '<span>キャバ嬢</span></div>' +
        '<div class="suspect">' + AV('obachan', 30) + '<span>美容意識高めのおばちゃん</span></div>' +
        '</div></div>';
      const figCutin = '<div class="howto-cutin"><span>住人帰宅！！</span></div>';
      const figResult = '<div class="howto-result">' + I('check') + '正解！　セーフ。飲まなくてよし</div>';
      const figDex = '<div class="howto-fig pad"><div class="dex-grid">' +
        '<div class="dex-tile secret">' + window.VT_itemSVG({ kind: 'box', variant: 'sec_goldhato' }, '#ffc800', 44) + '<div class="dnm">金のハト像</div><div class="dsec">SECRET</div></div>' +
        '<div class="dex-tile locked">' + window.VT_itemSVG({ kind: 'box', variant: 'sec_ufo' }, '#ffc800', 44) + '<div class="dnm">？？？</div></div>' +
        '<div class="dex-tile locked"><div class="dav">' + AV('hato', 34) + '</div><div class="dnm">？？？</div></div>' +
        '</div></div>';
      const steps = [
        ['ミッションを受け取る', 'マンションはランダムに決まる。「<b>402号室の住人を当てて！</b>」のように部屋が指定されるので、張り込み開始でその部屋にズームイン。', figFacade],
        ['ベランダで推理する', '干してある服・置いてあるモノが手がかり。ただし<b>黒レース＝キャバ嬢とは限らない</b>のがこのゲームの罠。アイテムはタップで名前が見える。', figScene],
        ['追加調査でヒントを増やす', '各1回まで。<b>観察</b>は安全、<b>ポスト</b>は50%で管理人に発覚（一口＋強制回答）、<b>待つ</b>は帰宅・雨・カメラ等なにかが起きる、<b>聞き込み</b>は嘘が混ざる。', figActs],
        ['容疑者から回答する', '4人の容疑者から1人を選ぶ。<b>自信満々</b>宣言で正解+50点、外したら二口。連続正解でコンボボーナス。', figSus],
        ['ハプニングに耐える', '張り込み開始直後、たまに住人が帰ってくる。目が合ったら飲んで逃げるしかない。誰が飲むかはその時次第（本人／右隣／左隣／全員）。', figCutin],
        ['飲みと結果発表', '正解=セーフ、不正解=一口。全員が回し終えたら結果発表。最後に「一番偏見がキモかった人」を全員で同時に指差して一口。', figResult],
        ['図鑑を埋める', '出会った住人と見つけたアイテムは図鑑に記録されていく。低確率でしか出ない<b>シークレット</b>も存在するらしい…', figDex],
      ];
      inner = '<h2>' + I('book') + '遊び方</h2>' +
        steps.map((s, i) =>
          '<div class="hstep"><div class="hs-head"><span class="num">' + (i + 1) + '</span>' + s[0] + '</div>' +
          '<p>' + s[1] + '</p>' + s[2] + '</div>').join('');
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
