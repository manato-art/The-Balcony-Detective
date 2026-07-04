// ベランダ探偵 — ベランダシーン描画（ヒント＝実物イラスト）
(function (root) {

  // 吊るす系のヒント種別（それ以外は床置き）
  const HANG_KINDS = ['laundry', 'kids', 'suit', 'umbrella'];

  // ヒント文からアイテムの色を推定
  function hintColor(text, kind) {
    if (/黒|ブラック/.test(text)) return '#4a4a58';
    if (/パステル/.test(text)) return '#ffd3e0';
    if (/ピンク|量産|リボン/.test(text)) return '#ff9ec7';
    if (/白|ホワイト/.test(text)) return '#f4f4f4';
    if (/紫/.test(text)) return '#a78bda';
    if (/紺|ネイビー|青/.test(text)) return '#5b7db1';
    if (/赤/.test(text)) return '#e05656';
    if (/金|ゴールド/.test(text)) return '#e6c368';
    if (/銀|シルバー/.test(text)) return '#cfd6df';
    if (/緑/.test(text)) return '#7ec95e';
    if (/ヒョウ柄|派手|キラキラ/.test(text)) return '#e0a437';
    if (/星|星柄/.test(text)) return '#7d5bb5';
    const def = {
      laundry: '#9fc0e8', kids: '#ffd166', suit: '#5b6478', bag: '#e8b4c8', can: '#c9d2da',
      sandal: '#e07856', protein: '#6b7a8c', plant: '#c96f4a', box: '#c99b66', guitar: '#4a4a58',
      dumbbell: '#6b7a8c', mirror: '#e6c368', camera: '#f4f4f4', crystal: '#b892ff', mail: '#f4f4f4',
      star: '#ff9ec7', bike: '#5b7db1', umbrella: '#7d5bb5', trophy: '#e6c368', alert: '#ffcf5c', megaphone: '#e07856',
    };
    return def[kind] || '#9fc0e8';
  }

  /* ---- アイテム形状（床置き: 底が(0,0)で上に負 / 吊り: 上が(0,0)で下に正） ---- */
  function shade(c) { return c === '#f4f4f4' ? '#d8d8d8' : '#00000022'; }

  const ITEMS = {
    laundry: (c) => '<path d="M0 4 q0 -5 5 -5" stroke="#8a93a5" stroke-width="2.5" fill="none"/>' +
      '<path d="M-9 12 L0 6 L9 12 l10 7 -4.5 6.5 -5.5 -3.5 v20 a4.5 4.5 0 0 1 -4.5 4.5 h-9 a4.5 4.5 0 0 1 -4.5 -4.5 v-20 l-5.5 3.5 -4.5 -6.5 Z" fill="' + c + '"/>' +
      '<path d="M-9 12 h18 l2 5 h-22 Z" fill="' + shade(c) + '"/>',
    kids: (c) => '<path d="M0 4 q0 -4 4 -4" stroke="#8a93a5" stroke-width="2" fill="none"/>' +
      '<path d="M-6 10 L0 6 L6 10 l7 5 -3.5 5 -3.5 -2.5 v14 a3.5 3.5 0 0 1 -3.5 3.5 h-5 a3.5 3.5 0 0 1 -3.5 -3.5 v-14 l-3.5 2.5 -3.5 -5 Z" fill="' + c + '"/>' +
      '<circle cx="0" cy="22" r="3" fill="#fff" opacity=".85"/>',
    suit: (c) => '<path d="M0 3 q0 -5 5 -5" stroke="#8a93a5" stroke-width="2.5" fill="none"/>' +
      '<path d="M-13 10 h26 v32 a5 5 0 0 1 -5 5 h-16 a5 5 0 0 1 -5 -5 Z" fill="' + c + '"/><path d="M0 10 v37" stroke="#fff" stroke-width="2" opacity=".6"/><circle cx="0" cy="22" r="2" fill="#fff" opacity=".7"/>',
    umbrella: (c) => '<path d="M0 2 v40 q0 6 -6 6" stroke="#8a6f4d" stroke-width="3" fill="none"/>' +
      '<path d="M0 4 l-9 30 q9 -6 9 0 q0 -6 9 0 Z" fill="' + c + '"/><path d="M0 4 l-9 30 M0 4 l9 30 M0 4 v30" stroke="' + shade(c) + '" stroke-width="1.5"/>',
    bag: (c) => '<path d="M-13 0 v-24 h26 v24 Z" fill="' + c + '"/><path d="M-7 -24 a7 7 0 0 1 14 0" stroke="#8a6f4d" stroke-width="2.5" fill="none"/><circle cx="0" cy="-13" r="3.5" fill="#fff" opacity=".85"/>',
    can: (c) => '<rect x="-13" y="-20" width="11" height="20" rx="2.5" fill="' + c + '"/><path d="M-13 -16 h11" stroke="#fff" stroke-width="1.5" opacity=".6"/>' +
      '<g transform="translate(6 -5) rotate(75)"><rect x="-5" y="-9" width="11" height="19" rx="2.5" fill="' + c + '"/></g><ellipse cx="-7.5" cy="-20" rx="5.5" ry="2" fill="#e8edf2"/>',
    sandal: (c) => '<ellipse cx="-9" cy="-4" rx="8" ry="4.5" fill="' + c + '"/><path d="M-13 -6 l4 4 4 -4" stroke="#fff" stroke-width="1.8" fill="none"/>' +
      '<ellipse cx="9" cy="-3" rx="8" ry="4.5" fill="' + c + '" opacity=".92"/><path d="M5 -5 l4 4 4 -4" stroke="#fff" stroke-width="1.8" fill="none"/>',
    protein: (c) => '<rect x="-13" y="-34" width="26" height="34" rx="5" fill="' + c + '"/><rect x="-9" y="-42" width="18" height="9" rx="3" fill="#3c4654"/>' +
      '<rect x="-13" y="-24" width="26" height="11" fill="#ffc800"/><circle cx="0" cy="-18.5" r="4" fill="#fff"/>',
    plant: (c) => '<path d="M-11 0 l-2 -16 h26 l-2 16 Z" fill="' + c + '"/>' +
      '<path d="M0 -16 v-8" stroke="#4c8c3f" stroke-width="2.5"/><path d="M0 -22 c-2 -10 -10 -13 -16 -12 2 8 9 12 16 12Z" fill="#6fbf5a"/><path d="M0 -22 c2 -10 10 -13 16 -12 -2 8 -9 12 -16 12Z" fill="#58a84a"/>',
    box: () => '<rect x="-16" y="-24" width="32" height="24" rx="2" fill="#c99b66"/><path d="M-16 -17 h32 M0 -24 v24" stroke="#a87c4a" stroke-width="2"/><rect x="-5" y="-24" width="10" height="7" fill="#e8d9c2"/>',
    guitar: (c) => '<path d="M-9 0 c-8 -9 -8 -24 0 -31 l3 -13 h12 l3 13 c8 7 8 22 0 31 Z" fill="' + c + '"/><circle cx="0" cy="-14" r="3" fill="#8a93a5"/><circle cx="-4" cy="-38" r="1.5" fill="#8a93a5"/><circle cx="4" cy="-38" r="1.5" fill="#8a93a5"/>',
    dumbbell: (c) => '<rect x="-19" y="-11" width="38" height="5" rx="2.5" fill="#8a93a5"/><rect x="-21" y="-18" width="8" height="18" rx="3" fill="' + c + '"/><rect x="13" y="-18" width="8" height="18" rx="3" fill="' + c + '"/>',
    mirror: (c) => '<ellipse cx="0" cy="-27" rx="13" ry="20" fill="' + c + '"/><ellipse cx="0" cy="-27" rx="9" ry="15" fill="#dceafb"/><path d="M-4 -34 l5 -5 M-1 -28 l7 -7" stroke="#fff" stroke-width="2"/><path d="M-7 0 l7 -8 7 8" stroke="' + c + '" stroke-width="3" fill="none"/>',
    camera: (c) => '<circle cx="0" cy="-34" r="13" fill="none" stroke="' + c + '" stroke-width="4.5"/><circle cx="0" cy="-34" r="13" fill="#fffbe8" opacity=".55"/>' +
      '<path d="M0 -21 v9 M0 -12 l-9 12 M0 -12 l9 12" stroke="#5b6478" stroke-width="2.5" fill="none"/>',
    crystal: (c) => '<path d="M-10 0 h20 l3 5 h-26 Z" fill="#8a63b8"/><circle cx="0" cy="-11" r="11" fill="' + c + '"/><circle cx="-4" cy="-15" r="3.5" fill="#fff" opacity=".75"/>',
    mail: () => '<g transform="rotate(-6)"><rect x="-15" y="-14" width="30" height="18" rx="2" fill="#fff" stroke="#d8d8d8"/><path d="M-15 -12 L0 -2 L15 -12" stroke="#e05656" stroke-width="1.8" fill="none"/></g>' +
      '<rect x="-12" y="-4" width="26" height="4" rx="1" fill="#eee4d2"/>',
    star: (c) => '<circle cx="0" cy="-22" r="13" fill="' + c + '"/><path d="M0 -29 l2.2 4.4 5 .7 -3.6 3.5 .9 5 -4.5 -2.4 -4.5 2.4 .9 -5 -3.6 -3.5 5 -.7Z" fill="#fff"/><rect x="-2.5" y="-10" width="5" height="10" rx="2" fill="' + c + '"/>',
    bike: (c) => '<circle cx="-12" cy="-8" r="8" fill="none" stroke="#5b6478" stroke-width="2.5"/><circle cx="12" cy="-8" r="8" fill="none" stroke="#5b6478" stroke-width="2.5"/>' +
      '<path d="M-12 -8 l6 -13 h11 l7 13 M-6 -21 h-5 M1 -21 l-2 -4 h5" stroke="' + c + '" stroke-width="2.5" fill="none"/>',
    trophy: (c) => '<path d="M-9 -30 h18 v9 a9 9 0 0 1 -18 0 Z" fill="' + c + '"/><path d="M-9 -28 h-5 a5 5 0 0 0 5 7 M9 -28 h5 a5 5 0 0 1 -5 7" stroke="' + c + '" stroke-width="2.5" fill="none"/>' +
      '<path d="M0 -13 v5 M-7 0 h14 l-2 -8 h-10 Z" fill="' + c + '" stroke="' + c + '" stroke-width="2"/>',
    alert: (c) => '<rect x="-13" y="-30" width="26" height="22" rx="3" fill="#fff" stroke="' + c + '" stroke-width="2.5"/><path d="M0 -25 v9 M0 -13 v.5" stroke="#e05656" stroke-width="3" stroke-linecap="round"/><path d="M-5 0 l5 -8 5 8" stroke="#8a93a5" stroke-width="2.5" fill="none"/>',
    megaphone: (c) => '<path d="M-14 -8 v-10 l22 -9 v28 l-22 -9Z" fill="' + c + '"/><rect x="-19" y="-16" width="6" height="7" rx="2" fill="#8a93a5"/>' +
      '<path d="M12 -19 q6 6 0 12 M16 -23 q10 10 0 20" stroke="' + c + '" stroke-width="2" fill="none" opacity=".7"/>',
  };
  const ITEM_KINDS = Object.keys(ITEMS);

  // スロット座標（吊り3 + 床5）
  const HANG_X = [224, 277, 330];
  const FLOOR_X = [48, 116, 184, 252, 320];

  function itemMarkup(it, idx) {
    const draw = ITEMS[it.kind] || ITEMS.box;
    const hang = it.hang;
    const x = hang ? HANG_X[it.slot] : FLOOR_X[it.slot];
    const y = hang ? 52 : 230;
    const hit = hang
      ? '<rect x="-22" y="-4" width="44" height="56" fill="transparent"/>'
      : '<rect x="-22" y="-52" width="44" height="56" fill="transparent"/>';
    // 位置=外側g(属性) / 拡大=中間g(属性) / アニメ=内側g(CSSクラス) で分離
    return '<g transform="translate(' + x + ' ' + y + ')" onclick="UI.itemTap(' + idx + ')">' +
      '<g transform="scale(1.32)">' +
      '<g class="sc-item' + (it.fresh ? ' fresh' : '') + (it.strong ? ' strong' : '') + (hang ? ' sway' : '') + '">' +
      (hang ? '' : '<ellipse cx="0" cy="1" rx="17" ry="3.5" fill="#000" opacity=".08"/>') +
      draw(it.color) + hit + '</g></g></g>';
  }

  const WALLS = {
    amber: '#f6ead2', pink: '#fbe3ee', cyan: '#e2f1fb', purple: '#efe6fb', green: '#e8f6e0',
  };

  // s: { accent, curtain:{color,label}|null, curtainClosed, light, rain, silhouette, items:[...] }
  function scene(s) {
    const wall = WALLS[s.accent] || '#eef1f5';
    const glass = s.light ? '#ffe9a8' : '#bcd6e8';
    const cc = (s.curtain && s.curtain.color) || '#eceff3';
    // カーテン: closed=左右で窓を覆う / open=端に寄る
    const curtW = s.curtainClosed ? 70 : 16;
    const curtAttr = s.curtain ? ' class="sc-item" onclick="UI.itemTap(-1)"' : '';
    let svg = '<svg viewBox="0 0 360 280" width="100%" aria-hidden="true">' +
      '<rect x="0" y="0" width="360" height="280" fill="' + wall + '"/>' +
      '<rect x="0" y="0" width="360" height="8" fill="#00000010"/>' +
      // 窓
      '<rect x="30" y="22" width="160" height="106" rx="4" fill="#fff"/>' +
      '<rect x="38" y="30" width="144" height="90" fill="' + glass + '"/>' +
      '<path d="M110 30 v90" stroke="#fff" stroke-width="4"/>' +
      (s.silhouette
        ? '<g class="sil-in"><circle cx="110" cy="66" r="13" fill="#3c3450"/><path d="M88 120 q0 -26 22 -26 t22 26 Z" fill="#3c3450"/></g>'
        : '') +
      '<g' + curtAttr + '>' +
      '<rect x="38" y="30" width="' + curtW + '" height="90" fill="' + cc + '"/>' +
      '<rect x="' + (182 - curtW) + '" y="30" width="' + curtW + '" height="90" fill="' + cc + '"/>' +
      '<path d="M38 30 h144" stroke="#c8ccd4" stroke-width="3"/>' +
      (s.curtainClosed ? '<path d="M' + (38 + curtW / 2) + ' 34 v82 M' + (182 - curtW / 2) + ' 34 v82" stroke="#00000014" stroke-width="6"/>' : '') +
      '</g>' +
      // 物干しロープ
      '<path d="M198 52 L354 52" stroke="#9aa3b5" stroke-width="3"/>' +
      '<path d="M198 52 v-10 M354 52 v-10" stroke="#9aa3b5" stroke-width="4" stroke-linecap="round"/>' +
      // 床
      '<rect x="0" y="232" width="360" height="48" fill="#d7dade"/>' +
      '<path d="M0 232 h360" stroke="#b9bec7" stroke-width="2"/>';

    // アイテム
    (s.items || []).forEach((it, i) => { svg += itemMarkup(it, i); });

    // 手すり（低め・薄めでアイテムを隠さない）
    svg += '<rect x="0" y="240" width="360" height="34" fill="#cfe6f4" opacity=".35"/>' +
      '<rect x="0" y="234" width="360" height="7" rx="3.5" fill="#aebccb"/>' +
      '<path d="M46 241 v33 M136 241 v33 M226 241 v33 M316 241 v33" stroke="#aebccb" stroke-width="4" opacity=".5"/>';

    // 雨
    if (s.rain) {
      svg += '<rect x="0" y="0" width="360" height="280" fill="#4a6fa5" opacity=".16"/>';
      const drops = [20, 55, 95, 130, 170, 205, 245, 280, 315, 345];
      drops.forEach((dx, i) => {
        svg += '<path d="M' + dx + ' ' + (14 + (i % 3) * 60) + ' l-6 18" stroke="#7cb3e8" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>';
      });
    }
    return svg + '</svg>';
  }

  root.VT_scene = scene;
  root.VT_hintColor = hintColor;
  root.VT_HANG_KINDS = HANG_KINDS;
  root.VT_ITEM_KINDS = ITEM_KINDS;
  if (typeof module !== 'undefined') module.exports = { scene, hintColor, HANG_KINDS, ITEM_KINDS };
})(typeof window !== 'undefined' ? window : globalThis);
