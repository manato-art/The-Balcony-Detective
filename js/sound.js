// ベランダ探偵 — BGM/効果音（Web Audio 完全生成・音声ファイル不使用）
(function (root) {
  if (typeof window === 'undefined') {
    if (typeof module !== 'undefined') module.exports = { sfx: function () {}, toggle: function () {}, muted: function () { return true; } };
    return;
  }

  let ctx = null, master = null, sfxG = null, bgmG = null, noiseBuf = null;
  let muted = false;
  try { muted = localStorage.getItem('vt_mute') === '1'; } catch (e) { /* private mode */ }
  let bgmOn = false, bgmTimer = null, nextBar = 0, barIdx = 0;

  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
    sfxG = ctx.createGain(); sfxG.gain.value = 0.5; sfxG.connect(master);
    bgmG = ctx.createGain(); bgmG.gain.value = 0.13; bgmG.connect(master);
    const len = Math.floor(ctx.sampleRate * 0.5);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function tone(freq, t0, dur, type, vol, dest, slideTo) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 1), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(dest || sfxG);
    o.start(t0); o.stop(t0 + dur + 0.03);
  }

  function noise(t0, dur, vol, hpFreq, dest) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    const f = ctx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = hpFreq || 3000;
    s.connect(f); f.connect(g); g.connect(dest || sfxG);
    s.start(t0); s.stop(t0 + dur + 0.03);
  }

  /* ================= 効果音 ================= */
  const SFX = {
    tap:     (t) => { tone(700, t, 0.05, 'square', 0.12, sfxG, 520); },
    pop:     (t) => { tone(520, t, 0.07, 'sine', 0.3); tone(820, t + 0.05, 0.09, 'sine', 0.25); },
    strong:  (t) => { [880, 1108, 1318, 1760].forEach((f, i) => tone(f, t + i * 0.06, 0.12, 'sine', 0.22)); noise(t, 0.25, 0.05, 6000); },
    rumor:   (t) => { tone(330, t, 0.12, 'triangle', 0.25, sfxG, 392); tone(392, t + 0.13, 0.14, 'triangle', 0.22, sfxG, 330); },
    warn:    (t) => { tone(440, t, 0.1, 'square', 0.2); tone(415, t + 0.12, 0.16, 'square', 0.2); },
    caught:  (t) => { tone(160, t, 0.35, 'sawtooth', 0.4, sfxG, 70); noise(t, 0.15, 0.2, 1200); tone(120, t + 0.18, 0.4, 'sawtooth', 0.35, sfxG, 60); },
    cutin:   (t) => { [220, 277, 330].forEach((f) => tone(f, t, 0.4, 'sawtooth', 0.16)); noise(t, 0.2, 0.25, 2000); tone(440, t + 0.12, 0.3, 'square', 0.15, sfxG, 466); },
    alarm:   (t) => { for (let i = 0; i < 4; i++) tone(i % 2 ? 660 : 880, t + i * 0.11, 0.1, 'square', 0.22); },
    tick:    (t) => { tone(1250, t, 0.03, 'square', 0.14); },
    timeup:  (t) => { tone(185, t, 0.5, 'square', 0.35); tone(180, t + 0.05, 0.5, 'sawtooth', 0.2); },
    correct: (t) => { [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.08, 0.16, 'triangle', 0.3)); noise(t + 0.3, 0.3, 0.05, 7000); },
    combo:   (t) => { [659, 784, 988, 1175, 1319].forEach((f, i) => tone(f, t + i * 0.05, 0.1, 'sine', 0.22)); },
    wrong:   (t) => { tone(400, t, 0.3, 'sawtooth', 0.25, sfxG, 200); tone(300, t + 0.22, 0.4, 'sawtooth', 0.25, sfxG, 140); },
    drink:   (t) => { tone(300, t, 0.1, 'sine', 0.3, sfxG, 170); tone(280, t + 0.13, 0.12, 'sine', 0.3, sfxG, 150); tone(600, t + 0.3, 0.08, 'sine', 0.2); },
    whoosh:  (t) => { noise(t, 0.4, 0.25, 600); tone(220, t, 0.35, 'triangle', 0.12, sfxG, 880); },
    fanfare: (t) => {
      [[523, 659, 784], [587, 740, 880], [659, 831, 988], [784, 988, 1175]].forEach((ch, i) =>
        ch.forEach((f) => tone(f, t + i * 0.16, i === 3 ? 0.5 : 0.15, 'triangle', 0.2)));
      noise(t + 0.48, 0.4, 0.06, 6000);
    },
  };

  function sfx(name) {
    if (!ctx || !SFX[name]) return;
    try { SFX[name](ctx.currentTime + 0.01); } catch (e) { /* noop */ }
  }

  /* ================= BGM（スニーキー張り込みループ） ================= */
  const BPM = 104;
  const SPB = 60 / BPM;            // 1拍
  const BAR = SPB * 4;             // 1小節
  // Am → F → C → G の4小節ループ
  const PROG = [
    { bass: 110.0, notes: [220.0, 261.6, 329.6] },  // Am
    { bass: 87.31, notes: [174.6, 220.0, 261.6] },  // F
    { bass: 130.8, notes: [196.0, 261.6, 329.6] },  // C
    { bass: 98.0,  notes: [196.0, 246.9, 293.7] },  // G
  ];
  const MELODY = [null, 440, null, 523.3, null, null, 494, null]; // 2小節に一度のモチーフ

  function scheduleBar(t, idx) {
    const p = PROG[idx % 4];
    for (let i = 0; i < 8; i++) {
      const swing = (i % 2) ? SPB * 0.08 : 0;   // 8分にスウィング
      const tt = t + i * SPB / 2 + swing;
      // ベース（スタッカート）
      tone(i === 6 ? p.bass * 1.5 : p.bass, tt, 0.14, 'square', 0.22, bgmG);
      // ハット（裏拍）
      if (i % 2) noise(tt, 0.04, 0.1, 7000, bgmG);
    }
    // コードのつまびき（1・3拍目）
    tone(p.notes[0], t, 0.3, 'triangle', 0.1, bgmG);
    tone(p.notes[2], t + SPB * 2, 0.3, 'triangle', 0.09, bgmG);
    // モチーフ（偶数小節のみ）
    if (idx % 2 === 0) {
      MELODY.forEach((f, i) => { if (f) tone(f, t + i * SPB / 2, 0.16, 'triangle', 0.12, bgmG); });
    }
  }

  function bgmLoop() {
    if (!bgmOn || !ctx) return;
    const t = Math.max(ctx.currentTime + 0.06, nextBar);
    scheduleBar(t, barIdx);
    nextBar = t + BAR;
    barIdx++;
    bgmTimer = setTimeout(bgmLoop, Math.max((nextBar - ctx.currentTime - 0.35) * 1000, 60));
  }

  function startBgm() {
    if (bgmOn || !ctx) return;
    bgmOn = true;
    nextBar = 0; barIdx = 0;
    bgmLoop();
  }
  function stopBgm() {
    bgmOn = false;
    if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null; }
  }

  /* ================= ミュート・初期化 ================= */
  function applyMute() {
    if (master) master.gain.value = muted ? 0 : 1;
    const btn = document.getElementById('muteBtn');
    if (btn && window.VT_icon) {
      btn.innerHTML = window.VT_icon(muted ? 'mute' : 'sound');
      btn.classList.toggle('off', muted);
    }
  }
  function toggle() {
    muted = !muted;
    try { localStorage.setItem('vt_mute', muted ? '1' : '0'); } catch (e) { /* noop */ }
    applyMute();
    if (!muted && ctx) sfx('pop');
  }

  function unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    startBgm();
  }
  document.addEventListener('pointerdown', unlock, { once: true });

  // ボタンタップ音（capture段階で拾う。ミュートボタン自身は除く）
  document.addEventListener('click', (e) => {
    if (!ctx) return;
    const b = e.target && e.target.closest ? e.target.closest('button') : null;
    if (b && b.id !== 'muteBtn') sfx('tap');
  }, true);

  // ミュートボタン設置
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.id = 'muteBtn';
    btn.className = 'mute-btn';
    btn.setAttribute('aria-label', 'サウンド切り替え');
    btn.addEventListener('click', (e) => { e.stopPropagation(); unlock(); toggle(); });
    document.body.appendChild(btn);
    applyMute();
  });

  root.VT_SOUND = { sfx, toggle, muted: () => muted, bgm: (on) => (on ? startBgm() : stopBgm()) };
  if (typeof module !== 'undefined') module.exports = root.VT_SOUND;
})(typeof window !== 'undefined' ? window : globalThis);
