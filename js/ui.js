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

  // プレイヤー名のデフォルト（localStorage vt_players に自動保存・起動時に復元）
  const DEFAULT_PLAYERS = ['プレイヤー1', 'プレイヤー2'];
  function loadSavedPlayers() {
    try {
      const s = JSON.parse(localStorage.getItem('vt_players') || 'null');
      if (Array.isArray(s) && s.length >= 1 && s.length <= 8 && s.every((n) => typeof n === 'string')) return s.slice(0, 8);
    } catch (e) { /* noop */ }
    return DEFAULT_PLAYERS.slice();
  }
  function savePlayers() {
    try { localStorage.setItem('vt_players', JSON.stringify(cfg.players)); } catch (e) { /* noop */ }
  }
  const cfg = { players: loadSavedPlayers(), rounds: 3, mansionId: null };
  let confOn = false;
  let timerInt = null;
  let timerLeft = 0;

  /* ---- ゲーム設定（localStorage永続・ロジックに反映） ---- */
  const CFG_DEFAULT = { ambush: 0.18, post: 0.3, secret: 0.03 };
  let gameCfg = Object.assign({}, CFG_DEFAULT);
  try {
    const saved = JSON.parse(localStorage.getItem('vt_gamecfg') || 'null');
    if (saved) gameCfg = Object.assign(gameCfg, saved);
  } catch (e) { /* noop */ }
  function applyCfg() {
    G.setConfig({ ambush: gameCfg.ambush, postCaught: gameCfg.post, secret: gameCfg.secret });
  }
  function saveCfg() {
    try { localStorage.setItem('vt_gamecfg', JSON.stringify(gameCfg)); } catch (e) { /* noop */ }
  }
  applyCfg();

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function syncFixedPad() {
    var bar = $('#ctaBar'), play = $('#scr-play');
    if (bar && play && !bar.hidden) play.style.paddingBottom = (bar.offsetHeight + 16) + 'px';
    var banner = document.querySelector('.result-banner'), rev = $('#scr-reveal');
    if (banner && rev) rev.style.paddingBottom = (banner.offsetHeight + 16) + 'px';
  }
  function show(id) {
    document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
    $('#scr-' + id).classList.add('active');
    var cb = $('#ctaBar'); if (cb) cb.hidden = (id !== 'play');
    if (id === 'play' || id === 'reveal') requestAnimationFrame(syncFixedPad);
    window.scrollTo(0, 0);
  }
  window.addEventListener('resize', syncFixedPad);
  function vibrate(p) { if (navigator.vibrate) navigator.vibrate(p); }
  function bubbleRow(pose, size, html) {
    return '<div class="mascot-row"><div class="m-fig">' + M(pose, size) + '</div><div class="bubble">' + html + '</div></div>';
  }

  /* ============ タイトル ============ */
  function renderTitle() {
    $('#scr-title').innerHTML =
      '<button class="cfg-btn" aria-label="ゲーム設定" onclick="UI.modal(\'settings\')">' + I('gear') + '</button>' +
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
      '<p class="title-note">お酒は20歳になってから。<br>イッキ、強要はダメ、絶対。ソフトドリ参加OK。</p>';
  }

  /* ============ プレイヤー設定 ============ */
  UI.goSetup = function () { renderSetup(); show('setup'); setTimeout(maybeSetupTutorial, 400); };
  function renderSetup() {
    const rows = cfg.players.map((p, i) =>
      '<div class="player-row">' +
      '<div class="pinput">' +
      '<input type="text" maxlength="10" placeholder="プレイヤー' + (i + 1) + '" value="' + esc(p) + '" onfocus="var i=this;setTimeout(function(){i.select()},0)" oninput="UI.setName(' + i + ', this.value)">' +
      '<span class="pcount' + (p.length >= 10 ? ' max' : '') + '" id="pcount-' + i + '">' + p.length + '/10</span>' +
      '</div>' +
      (cfg.players.length > 1 ? '<button class="del" aria-label="削除" onclick="UI.delPlayer(' + i + ')">' + I('x') + '</button>' : '') +
      '</div>').join('');
    $('#scr-setup').innerHTML =
      '<div class="head"><button class="back" aria-label="戻る" onclick="UI.goTitle()">' + I('arrow') + '</button><h1>捜査メンバー</h1></div>' +
      bubbleRow('point', 92, '一緒に張り込むメンバーを教えて！') +
      '<div class="section-label pl-head">プレイヤー名（1〜8人・各10文字まで）' +
      '<button class="reset-players" onclick="UI.resetPlayers()">初期化</button></div>' +
      '<div id="playerList">' + rows + '</div>' +
      (cfg.players.length < 8 ? '<button class="add-row" onclick="UI.addPlayer()">' + I('user') + 'プレイヤーを追加</button>' : '') +
      '<div class="section-label">何ゲーム遊ぶ？（1周＝1ゲーム）</div>' +
      '<div class="stepper" id="roundStepper">' +
      '<button aria-label="減らす" onclick="UI.setRounds(-1)">−</button>' +
      '<div class="val">' + cfg.rounds + '<small>ゲーム</small></div>' +
      '<button aria-label="増やす" onclick="UI.setRounds(1)">＋</button>' +
      '</div>' +
      '<p class="setup-hint">1ゲームで全員が1回ずつ回答（全' + (cfg.players.length * cfg.rounds) + 'ターン）</p>' +
      '<div class="foot"><button class="btn" onclick="UI.startGame()">' + I('search') + '捜査開始</button></div>';
  }
  UI.goTitle = function () { show('title'); };
  UI.setName = function (i, v) {
    cfg.players[i] = v;
    const c = document.getElementById('pcount-' + i);
    if (c) { c.textContent = v.length + '/10'; c.classList.toggle('max', v.length >= 10); }
  };
  UI.addPlayer = function () { if (cfg.players.length < 8) { cfg.players.push('プレイヤー' + (cfg.players.length + 1)); renderSetup(); } };
  UI.delPlayer = function (i) { if (cfg.players.length > 1) { cfg.players.splice(i, 1); renderSetup(); } };
  UI.resetPlayers = function () {
    cfg.players = DEFAULT_PLAYERS.slice();
    try { localStorage.removeItem('vt_players'); } catch (e) { /* noop */ }
    renderSetup();
  };
  UI.setRounds = function (d) { cfg.rounds = Math.min(5, Math.max(1, cfg.rounds + d)); renderSetup(); };

  /* ============ ゲーム開始（マンションはランダム選定） ============ */
  UI.startGame = function () {
    cfg.players = cfg.players.map((p, i) => p.trim() || 'プレイヤー' + (i + 1));
    savePlayers();  // 次回のためにプレイヤー名を自動保存
    cfg.mansionId = MANSIONS[Math.floor(Math.random() * MANSIONS.length)].id;
    G.newGame({ players: cfg.players, rounds: cfg.rounds, mansionId: cfg.mansionId });
    beginTurn();
  };

  /* ============ ターン開始（建物全景→対象部屋にズーム） ============ */
  function beginTurn() {
    const t = G.startTurn();
    const s = G.state;
    const name = s.players[t.playerIdx].name;
    const pos = RP(t.room, s.mansion.id);
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
    { k: 'observe', icon: 'eye', nm: '観察', risk: '小リスク・小リターン', desc: '変化を詳しく見る', rl: 1, rt: 1, sc: '#66bb6a' },
    { k: 'post', icon: 'post', nm: 'ポスト確認', risk: '中リスク・中リターン', desc: '玄関のポストを見る', rl: 2, rt: 2, sc: '#ffa726' },
    { k: 'neighbor', icon: 'chat', nm: '聞き込み', risk: '大リスク・大リターン', desc: '近隣から情報を得る', rl: 3, rt: 3, sc: '#ec407a' },
  ];
  function actionRisk(a) {
    return a.k === 'post' ? '発見率' + Math.round(gameCfg.post * 100) + '%' : a.risk;
  }
  var SH_D = 'm12 3 8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6Z';
  var ST_D = 'm12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8Z';
  function meterSVG(n, color, d) {
    var h = '';
    for (var i = 0; i < 3; i++) h += '<svg class="m-ico" viewBox="0 0 24 24"><path d="' + d + '" fill="' + (i < n ? color : '#d5d5d5') + '"/></svg>';
    return h;
  }
  // マンションaccent→表示色（タイプの識別用）
  const MANSION_COLOR = { amber: '#d99a00', cyan: '#1899d6', pink: '#e0559f', purple: '#a855f7', green: '#46a302' };
  UI.goPlay = function () {
    const t = G.state.turn;
    const s = G.state;
    const name = s.players[t.playerIdx].name;
    const pct = Math.round((s.turnNo / s.queue.length) * 100);
    $('#scr-play').innerHTML =
      '<div class="prog"><div class="prog-fill' + (s.combo >= 3 ? ' hot' : '') + '" style="width:' + Math.max(pct, 4) + '%"></div></div>' +
      '<div class="play-guide">' +
      '<div class="pg-turn">' + I('user') + '<b>' + esc(name) + '</b>の番' +
      (s.combo >= 2 ? '<span class="combo-pill">' + I('star') + s.combo + 'コンボ中</span>' : '') + '</div>' +
      '<div class="pg-main"><div class="pg-fig">' + M('point', 54) + '</div>' +
      '<div class="pg-txt">' +
      '<div class="pg-mansion" style="--mc:' + (MANSION_COLOR[s.mansion.accent] || '#5b6675') + '">' + I(s.mansion.icon) + '<b>' + s.mansion.name + '</b><small>' + s.mansion.desc + '</small></div>' +
      '<div class="pg-q"><span class="pg-room">' + t.room + '号室</span>の住人はだれ？</div>' +
      '<div class="pg-instr">ベランダの様子から、下の<b>住人</b>を当てよう！</div>' +
      '</div></div></div>' +
      '<div class="ev-frame">' +
      '<div class="sec-head ev-head">' + I('search') + ' ベランダの証拠<span class="ev-hint">アイテムをタップして確認</span></div>' +
      '<div class="scene-box" id="sceneBox"><div id="scene"></div><div class="scene-tip" id="sceneTip"></div></div>' +
      '</div>' +
      '<div class="who-section">' +
      '<div class="sec-head who-head">' + I('user') + ' だれが住んでいる？</div>' +
      '<div class="suspect-strip" id="suspects">' +
      t.choices.map((c, ci) =>
        '<button class="suspect-mini mf-in" data-ci="' + ci + '" style="animation-delay:' + (ci * 80) + 'ms" onclick="UI.selSuspect(' + ci + ')"><span class="sm-check">' + I('check') + '</span><span class="sm-av">' + AV(c.id, 72) + '</span><span class="sm-nm">' + c.name + '</span></button>').join('') +
      '</div></div>' +
      '<div class="inv-section">' +
      '<div class="sec-head inv-head">' + I('sparkle') + ' 追加調査</div>' +
      '<div class="action-grid" id="actions">' +
      ACTIONS.map((a) =>
        '<button class="action-card a-' + a.k + '" id="act-' + a.k + '" onclick="UI.act(\'' + a.k + '\')">' +
        '<div class="ac-icon-wrap"><img src="assets/ui/hint_' + a.k + '.webp" alt="' + a.nm + '"></div>' +
        '<div class="ac-body"><div class="nm">' + a.nm + '</div>' +
        '<div class="risk">' + actionRisk(a) + '</div>' +
        '<div class="ac-desc">' + a.desc + '</div>' +
        '<div class="ac-meters">' +
        '<div class="ac-meter"><span class="meter-label">リスク</span>' + meterSVG(a.rl, a.sc, SH_D) + '</div>' +
        '<div class="ac-meter"><span class="meter-label">リターン</span>' + meterSVG(a.rt, '#ffc107', ST_D) + '</div>' +
        '</div></div></button>').join('') +
      '</div></div>';
    $('#ctaBar').innerHTML =
      '<div class="cta-pair">' +
      '<button class="btn cta-normal" id="answerBtn" onclick="UI.submitAnswer(false)">' +
      '<span class="cta-title">' + I('search') + '回答する</span>' +
      '<span class="cta-rule cta-rule-g">不正解 一口飲む</span></button>' +
      '<button class="btn cta-conf" id="confBtn" onclick="UI.submitAnswer(true)">' +
      '<span class="cta-title">' + I('star') + '自信満々で回答！</span>' +
      '<span class="cta-rule cta-rule-y">正解+50pt / 不正解 二口</span></button>' +
      '</div>';
    newScene(t, s);
    renderScene();
    show('play');
    // 初回アカウントの最初のターン(turnNo 0)は、ガイド保護のため帰宅ハプニングを必ず抑制。
    // 2ターン目以降は通常どおり設定の確率で出現する。
    if (s.turnNo === 0 && playGuidePending()) t.ambush = false;
    if (t.ambush && !t.ambushDone) setTimeout(showAmbush, 750);
    else setTimeout(maybeTutorial, 400);
  };

  /* ---- 容疑者カード選択 ---- */
  UI.selSuspect = function (ci) {
    var strip = $('#suspects');
    if (!strip) return;
    var btns = strip.querySelectorAll('.suspect-mini');
    btns.forEach(function (b, i) { b.classList.toggle('selected', i === ci); });
    var cb = document.querySelector('.cta-conf');
    if (cb) cb.classList.add('mf-press');
  };

  function getSelectedSuspect() {
    var strip = $('#suspects');
    if (!strip) return -1;
    var btns = strip.querySelectorAll('.suspect-mini');
    for (var i = 0; i < btns.length; i++) { if (btns[i].classList.contains('selected')) return i; }
    return -1;
  }

  UI.submitAnswer = function (confident) {
    var t = G.state.turn;
    if (!t || t.done) return;
    var ci = getSelectedSuspect();
    if (ci < 0) {
      var sec = document.querySelector('.who-section');
      if (sec) { sec.classList.remove('shake'); void sec.offsetWidth; sec.classList.add('shake'); }
      return;
    }
    stopTimer();
    var r = G.answer(ci, confident);
    if (r) renderReveal(r);
  };

  /* ---- 初回だけの指差しチュートリアル（スポットライト式・画面ごと） ---- */
  const TUT_STEPS = [
    { sel: '#sceneBox', text: 'まずは<b>ベランダ</b>を調査！干してある服や置いてある物が手がかり。' },
    { sel: '.suspect-strip', text: 'この中の<b>誰か</b>が住人。ヒントと見比べて推理しよう。' },
    { sel: '.cta-pair', text: '容疑者を選んで<b>回答</b>！<b>自信満々</b>なら高得点を狙えるよ。' },
  ];
  const SETUP_STEPS = [
    { sel: '#playerList', text: 'まず<b>遊ぶ人の名前</b>を入れてね。タップで書き換えできるよ。' },
    { sel: '#roundStepper', text: '<b>何ゲーム遊ぶか</b>をここで決めよう。' },
    { sel: '#scr-setup .foot .btn', text: '準備ができたら<b>捜査開始</b>！' },
  ];
  function maybeTutorial() { runTutorial(TUT_STEPS, 'vt_tut_play'); }
  function maybeSetupTutorial() { runTutorial(SETUP_STEPS, 'vt_tut_setup'); }
  // 初回プレイガイド(vt_tut_play)が未表示か＝「初めて遊ぶアカウント」か。
  function playGuidePending() {
    try { return !localStorage.getItem('vt_tut_play'); } catch (e) { return false; }
  }
  function runTutorial(steps, key) {
    try { if (localStorage.getItem(key)) return; } catch (e) { return; }
    if (!$(steps[0].sel)) return;
    let idx = 0;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ov = document.createElement('div');
    ov.className = 'tut-back'; ov.id = 'tut';
    ov.innerHTML = '<div class="tut-hole"></div><div class="tut-tip"></div>';
    ov.addEventListener('click', () => { idx += 1; (idx >= steps.length) ? endTut() : showStep(); });
    document.body.appendChild(ov);
    function endTut() { ov.remove(); try { localStorage.setItem(key, '1'); } catch (e) { /* noop */ } }
    function showStep() {
      const step = steps[idx];
      const el = $(step.sel);
      if (!el) { endTut(); return; }
      el.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' });
      setTimeout(() => {
        const r = el.getBoundingClientRect();
        const pad = 8;
        const hole = ov.querySelector('.tut-hole');
        hole.style.cssText = 'top:' + (r.top - pad) + 'px;left:' + (r.left - pad) + 'px;width:' + (r.width + pad * 2) + 'px;height:' + (r.height + pad * 2) + 'px;';
        const tip = ov.querySelector('.tut-tip');
        const below = r.top < window.innerHeight * 0.5;
        tip.innerHTML =
          '<div class="tt-fig">' + M('point', 66) + '</div>' +
          '<div class="tt-bubble">' + step.text +
          '<div class="tt-foot"><span class="tt-dots">' + steps.map((_, j) => '<i' + (j === idx ? ' class="on"' : '') + '></i>').join('') + '</span>' +
          '<span class="tt-next">' + (idx === steps.length - 1 ? 'はじめる' : 'つぎへ') + ' →</span></div></div>';
        tip.classList.toggle('below', below);
        tip.style.top = below ? (r.bottom + 14) + 'px' : '';
        tip.style.bottom = below ? '' : (window.innerHeight - r.top + 14) + 'px';
      }, smooth ? 340 : 20);
    }
    showStep();
  }

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
      drinkText = 'とばっちり！右隣のプレイヤーが一口';
      btnText = '隣が飲んだら逃走';
    } else if (r.pattern === 'left') {
      drinkText = 'とばっちり！左隣のプレイヤーが一口';
      btnText = '隣が飲んだら逃走';
    } else if (r.pattern === 'all') {
      drinkText = 'もらい事故！' + esc(r.player.name) + '以外の全員が一口';
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
      '<div class="final-q">' + t.room + '号室の住人はこの中の誰だ？<br>住人をタップで即回答！</div>' +
      '<div class="suspects">' +
      t.choices.map((c, i) =>
        '<button class="suspect" onclick="UI.finalChoose(' + i + ')">' + AV(c.id, 56) + '<span>' + c.name + '</span></button>').join('') +
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
      mansionId: s.mansion.id,
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
    // 各ヒント文の専用イラスト(VT_HINT_ART)を最優先。無ければ従来の classify にフォールバック。
    const variant = (window.VT_HINT_ART && window.VT_HINT_ART[label]) || window.VT_classify(label, kind);
    const vkey = variant || kind;
    // 同じ見た目のアイテムは重複させない（中身が違っても同フォルムなら1つだけ表示）
    if (scene.items.some((it) => (it.variant || it.kind) === vkey)) return;
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
    if (scene.curtain && !scene.curtainClosed) scene.curtainShown = true; // 開演出は初回のみ
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
  function lockActions() {
    document.querySelectorAll('.action-card').forEach((b) => b.classList.add('used'));
    $('#answerBtn').classList.add('urge');
  }
  function showEventToast(text, tag, cls) {
    const box = $('#sceneBox');
    if (!box) return;
    const prev = box.querySelector('.ev-toast');
    if (prev) prev.remove();
    const el = document.createElement('div');
    el.className = 'ev-toast ' + (cls || '');
    el.innerHTML = '<div class="ev-toast-ribbon"></div>' +
      '<div class="ev-toast-body"><div class="ev-toast-text">' + text + '</div>' +
      (tag ? '<span class="ev-toast-tag">' + tag + '</span>' : '') + '</div>';
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add('on'));
    setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 400); }, 3200);
  }
  UI.act = function (kind) {
    const btn = $('#act-' + kind);
    if (btn && btn.classList.contains('used')) return;
    const ev = G.doAction(kind);
    if (!ev) return;
    btn.classList.add('used');

    if (kind === 'neighbor' && ev.type !== 'caught' && ev.type !== 'timer') {
      if (ev.type === 'hints' || ev.type === 'strong') {
        S.sfx(ev.type === 'strong' ? 'strong' : 'pop');
        (ev.hints || []).forEach((h) => pushItem(h, ev.type === 'strong', true));
        renderScene();
        var hintName = (ev.hints && ev.hints[0]) ? ev.hints[0][0] : '';
        showEventToast(ev.text, hintName, 'good');
      } else if (ev.type === 'rumor') {
        S.sfx('rumor');
        showEventToast(ev.text, '確定噂', 'rumor');
      } else if (ev.type === 'alert') {
        S.sfx('warn');
        vibrate([60]);
        const r = document.querySelector('#act-post .risk');
        if (r) r.textContent = '発覚' + Math.round(Math.min(gameCfg.post + 0.3, 0.95) * 100) + '%!';
        showEventToast(ev.text, '発覚率 UP', 'warn');
      } else if (ev.type === 'rain') {
        S.sfx('warn');
        scene.rain = true;
        renderScene();
        showEventToast(ev.text, 'ヒント打ち止め', 'warn');
      } else {
        showEventToast(ev.text, '収穫なし', 'none');
      }
      var sb = $('#sceneBox');
      if (sb) sb.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    if (ev.type === 'caught') {
      var wEl = document.createElement('div');
      wEl.className = 'mf-warn';
      wEl.innerHTML = '<div class="wpul"><svg class="wtri" viewBox="0 0 64 60"><path class="ws" d="M32 5L60 53H4z"/><rect class="wb" x="29.2" y="21" width="5.6" height="15" rx="2.8"/><circle class="wd" cx="32" cy="44" r="3"/></svg></div>';
      $('#sceneBox').appendChild(wEl);
      $('#sceneBox').classList.add('shake');
      vibrate([80, 50, 80]);
      S.sfx('caught');
      lockActions();
      setTimeout(function() { if (wEl.parentNode) wEl.remove(); showCaughtCutin(ev.text); }, 550);
    } else if (ev.type === 'timer') {
      vibrate([200, 80, 200]);
      S.sfx('alarm');
      lockActions();
      scene.silhouette = true;
      scene.light = true;
      scene.curtainClosed = false;
      renderScene();
      setTimeout(showPanic, 700);
    } else if (ev.type === 'hints' || ev.type === 'strong') {
      S.sfx(ev.type === 'strong' ? 'strong' : 'pop');
      if (ev.id === 'curtain') {
        if (!scene.curtain) scene.curtain = { color: '#ffe0b3', label: '' };
        scene.curtainClosed = false;
        scene.light = true;
      }
      if (ev.id === 'light') scene.light = true;
      (ev.hints || []).forEach((h) => pushItem(h, ev.type === 'strong', true));
      renderScene();
    } else if (ev.type === 'rumor') {
      S.sfx('rumor');
    } else if (ev.type === 'alert') {
      S.sfx('warn');
      vibrate([60]);
      const r = document.querySelector('#act-post .risk');
      if (r) r.textContent = '発覚' + Math.round(Math.min(gameCfg.post + 0.3, 0.95) * 100) + '%!';
    } else if (ev.type === 'rain') {
      S.sfx('warn');
      scene.rain = true;
      renderScene();
    } else {
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
    setTimeout(() => { ov.remove(); startTimer(10); UI.openAnswer(true); drawTimer(); }, 1600);
  }
  // カウントダウン表示: 回答シートを開いている間は大きなバナー、無ければ上部ピル
  function drawTimer() {
    var circ = 138.2;
    var off = circ * (1 - timerLeft / 10);
    var rg = '<div class="mf-ring"><svg viewBox="0 0 52 52"><circle class="rtrk" cx="26" cy="26" r="22"/><circle class="rbar' + (timerLeft <= 3 ? ' low' : '') + '" cx="26" cy="26" r="22" style="stroke-dashoffset:' + off + '"/></svg><span class="rsec">' + timerLeft + '</span></div>';
    const cd = $('#answerCountdown');
    const ov = $('#timer-overlay');
    if (cd) {
      cd.innerHTML = rg + '<span>住人帰宅中！</span>';
      cd.classList.toggle('urgent', timerLeft <= 3);
      if (ov) ov.classList.add('hidden');
    } else if (ov) {
      ov.classList.remove('hidden');
      ov.innerHTML = '<div class="timer-pill">' + rg + '</div>';
    }
  }
  function startTimer(sec) {
    timerLeft = sec;
    drawTimer();
    S.sfx('tick');
    timerInt = setInterval(() => {
      timerLeft -= 1;
      if (timerLeft <= 0) {
        stopTimer();
        S.sfx('timeup');
        const r = G.timeout();
        if (r) renderReveal(r);
      } else { drawTimer(); S.sfx('tick'); }
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
    const timed = forced || t.timered;
    const abc = ['A', 'B', 'C', 'D', 'E', 'F'];
    const back = document.createElement('div');
    back.className = 'answer-back';
    back.id = 'answer-back';
    back.innerHTML =
      '<div class="answer-sheet' + (timed ? ' timed' : '') + '">' +
      '<div class="handle"></div>' +
      (timed ? '<div class="answer-countdown" id="answerCountdown">' + I('clock') + '<span>住人帰宅中！ のこり<b>' + timerLeft + '</b>秒で回答！</span></div>' : '') +
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
    var mfConfetti = r.correct
      ? '<div class="mf-confetti"><span class="pc c1"></span><span class="pc c2"></span><span class="pc c3"></span><span class="pc c4"></span><span class="pc c5"></span><span class="pc c6"></span><span class="pc c7"></span><span class="pc c8"></span><span class="pc c9"></span><span class="pc c10"></span></div>'
      : '';
    var mfCoin = r.correct && r.points > 0
      ? '<div class="mf-coin"><span class="gc-cico"></span><span class="gc-odo"><span class="gc-reel"><b class="gc-n">' + (r.player.score - r.points) + '</b><b class="gc-n">' + r.player.score + '</b></span></span><span class="gc-plus">+' + r.points + '</span></div>'
      : '';
    var mfStreak = r.correct && r.combo >= 2
      ? '<div class="mf-streak"><div class="gs-fbox"><i class="gs-flame"></i><i class="gs-flame gs-inner"></i></div><div class="gs-txt">' + r.combo + '</div><div class="gs-label">連続正解</div></div>'
      : '';
    var wasConfWrong = !r.correct && !r.timedOut && r.notes.some(function(n) { return n.indexOf('自信満々') >= 0; });
    var mfDosun = wasConfWrong
      ? '<div class="mf-dosun"><div class="dd ddl"></div><div class="dd ddr"></div><div class="dw"></div><div class="df"></div></div>'
      : '';
    var mfName = '';
    for (var ni = 0; ni < r.resident.name.length; ni++) mfName += '<span class="mf-fu" style="animation-delay:' + (600 + ni * 50) + 'ms">' + esc(r.resident.name[ni]) + '</span>';
    var tDone = G.state.turnNo + 1, tTotal = G.state.queue.length;
    var pFrom = Math.round(((tDone - 1) / tTotal) * 100);
    var pTo = Math.round((tDone / tTotal) * 100);
    var mfXP = '<div class="mf-xp"><span class="xr">' + tDone + '/' + tTotal + '</span><div class="xt"><div class="xf" style="--from:' + pFrom + '%;--to:' + pTo + '%"><i class="xs"></i></div></div></div>';
    $('#scr-reveal').innerHTML =
      mfConfetti +
      mfDosun +
      '<div class="mf-flip"><div class="flip-card"><div class="flip-front">' + AV(r.resident.id, 150) + '</div><div class="flip-back"><span class="flip-q">' + I('search') + '</span><span class="flip-label">だれ？</span></div></div></div>' +
      '<div><span class="tag ' + cat.color + '">' + cat.label + '</span></div>' +
      '<div class="res-name">' + mfName + '</div>' +
      '<div class="res-desc">' + r.resident.desc + '</div>' +
      '<div class="reveal-mascot">' + bubbleRow(r.correct ? 'happy' : 'shock', 104, r.roast) + '</div>' +
      '<div class="result-banner ' + (r.correct ? 'ok' : 'ng') + '"><div class="inner">' +
      '<h3>' + I(r.correct ? 'check' : 'x') + verdict + (r.correct && r.combo >= 2 ? '　' + r.combo + 'コンボ！' : '') + '</h3>' +
      mfCoin + mfStreak +
      (r.sips > 0
        ? '<div class="drink">' + I('beer') + esc(r.player.name) + ' は ' + r.sips + '口 飲め</div>'
        : '<div class="drink">' + I('check') + 'セーフ。飲まなくてよし</div>') +
      '<div class="pts">獲得 +' + r.points + '点（合計 ' + r.player.score + '点）</div>' +
      mfXP +
      (r.notes.length ? '<div class="notes">' + r.notes.join(' ／ ') + '</div>' : '') +
      '<button class="btn" onclick="UI.next()">' + I('arrow') + (last ? '結果発表へ' : '次のプレイヤーへ') + '</button>' +
      '</div></div>';
    show('reveal');
  }
  UI.next = function () {
    $('#scr-reveal').innerHTML = '';
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
      '<div class="mf-levelup"><i class="glu-rays"></i><i class="glu-wave"></i>' +
      '<span class="glu-p glu-p1"><i class="glu-dot"></i></span><span class="glu-p glu-p2"><i class="glu-dot"></i></span><span class="glu-p glu-p3"><i class="glu-dot"></i></span>' +
      '<span class="glu-p glu-p4"><i class="glu-dot"></i></span><span class="glu-p glu-p5"><i class="glu-dot"></i></span><span class="glu-p glu-p6"><i class="glu-dot"></i></span>' +
      '<div class="glu-inner">' + M('happy', 120) + '</div></div>' +
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
        // シーン(pushItem)と同じ優先順位: 専用イラスト(HINT_ART) → classify。図鑑の解錠キーと表示を一致させる。
        const v = (window.VT_HINT_ART && window.VT_HINT_ART[h[0]]) || window.VT_classify(h[0], h[1]);
        const key = v ? 'v:' + v : 'k:' + h[1];
        if (seen[key]) return;
        seen[key] = true;
        list.push({ key, spec: v ? { kind: h[1], variant: v } : { kind: h[1] }, slug: v || h[1], label: h[0], color: HC(h[0], h[1]) });
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
        const slug = c.slug || c.spec.variant || c.spec.kind;
        return '<div class="dex-tile' + (ok ? '' : ' locked') + (c.secret ? ' secret' : '') + '">' +
          '<div class="di"><img src="assets/items/' + slug + '.webp" alt="" onerror="this.style.visibility=\'hidden\'"></div>' +
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
  const CFG_OPTS = {
    ambush: { label: '住人帰宅ハプニング', sub: '張り込み開始直後にカットインが乱入する確率', opts: [['なし', 0], ['たまに', 0.10], ['ふつう', 0.18], ['多め', 0.30], ['地獄', 0.50]] },
    post: { label: '管理人の厳しさ', sub: 'ポスト調査で見つかる確率（カメラ作動後は+30%）', opts: [['ゆるい', 0.10], ['ふつう', 0.30], ['鬼', 0.50]] },
    secret: { label: 'シークレット出現率', sub: 'ハト・宇宙人・金のハト像などのレア遭遇', opts: [['ふつう', 0.03], ['多め', 0.08], ['祭り', 0.15]] },
  };
  function cfgSeg(key) {
    return '<div class="seg" id="seg-' + key + '">' + CFG_OPTS[key].opts.map((o) =>
      '<button data-v="' + o[1] + '" class="' + (Math.abs(gameCfg[key] - o[1]) < 1e-9 ? 'on' : '') + '" onclick="UI.setCfg(\'' + key + '\',' + o[1] + ')">' +
      '<span class="sl">' + o[0] + '</span><span class="sp">' + Math.round(o[1] * 100) + '%</span></button>').join('') + '</div>';
  }
  UI.setCfg = function (key, val) {
    gameCfg[key] = val;
    saveCfg();
    applyCfg();
    const seg = $('#seg-' + key);
    if (seg) seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', Math.abs(parseFloat(b.dataset.v) - val) < 1e-9));
  };
  UI.resetCfg = function () {
    gameCfg = Object.assign({}, CFG_DEFAULT);
    saveCfg();
    applyCfg();
    Object.keys(CFG_OPTS).forEach((k) => UI.setCfg(k, gameCfg[k]));
  };

  UI.modal = function (kind) {
    let inner = '';
    if (kind === 'settings') {
      inner = '<h2>' + I('gear') + 'ゲーム設定</h2>' +
        Object.keys(CFG_OPTS).map((k) =>
          '<div class="set-row"><div class="set-l">' + CFG_OPTS[k].label + '<small>' + CFG_OPTS[k].sub + '</small></div>' + cfgSeg(k) + '</div>').join('') +
        '<button class="btn ghost" onclick="UI.resetCfg()">おすすめ設定に戻す</button>' +
        '<p class="modal-note">設定は次のターンから反映され、この端末に保存されます。</p>';
    } else if (kind === 'rules') {
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
        ['追加調査でヒントを増やす', '各1回まで。<b>観察</b>は小リスク・小リターン、<b>ポスト確認</b>は中リスクで管理人に発覚の恐れ、<b>聞き込み</b>は大リスク・大リターンのギャンブル。', figActs],
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
