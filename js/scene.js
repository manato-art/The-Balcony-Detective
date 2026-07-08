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

  /* ---- キーワード特化イラスト（タップ無しで判別できるように） ---- */
  const HOOK = '<path d="M0 4 q0 -5 5 -5" stroke="#8a93a5" stroke-width="2.5" fill="none"/>';
  const SHIRT = (c) => '<path d="M-9 12 L0 6 L9 12 l10 7 -4.5 6.5 -5.5 -3.5 v20 a4.5 4.5 0 0 1 -4.5 4.5 h-9 a4.5 4.5 0 0 1 -4.5 -4.5 v-20 l-5.5 3.5 -4.5 -6.5 Z" fill="' + c + '"/>';

  const VARIANTS = {
    lace: { hang: true, draw: (c) => HOOK + '<path d="M-8 8 L-10 16 M8 8 L10 16" stroke="' + c + '" stroke-width="2"/>' +
      '<path d="M-11 15 h22 v12 h-22 Z" fill="' + c + '"/><circle cx="-7.3" cy="27" r="3.7" fill="' + c + '"/><circle cx="0" cy="27" r="3.7" fill="' + c + '"/><circle cx="7.3" cy="27" r="3.7" fill="' + c + '"/>' +
      '<circle cx="-5" cy="20" r="1.3" fill="#fff" opacity=".8"/><circle cx="2" cy="23" r="1.3" fill="#fff" opacity=".8"/><circle cx="7" cy="19" r="1.3" fill="#fff" opacity=".8"/>' },
    dress: { hang: true, draw: (c) => HOOK + '<path d="M-5 8 h10 l2 9 7 21 h-28 l7 -21 Z" fill="' + c + '"/><path d="M-7 17 h14" stroke="#fff" stroke-width="1.8" opacity=".6"/><path d="M3 26 l1.2 2.6 2.8.4 -2 2 .5 2.8 -2.5 -1.3 -2.5 1.3 .5 -2.8 -2 -2 2.8 -.4Z" fill="#fff" opacity=".85"/>' },
    towel: { hang: true, draw: (c) => '<rect x="-13" y="-3" width="26" height="30" rx="3" fill="' + c + '"/><path d="M-13 4 h26" stroke="' + shade(c) + '" stroke-width="2.5"/><path d="M-13 21 h26" stroke="#fff" stroke-width="2" opacity=".5"/>' },
    jersey: { hang: true, draw: (c) => HOOK + SHIRT(c) + '<path d="M-13.5 20 h27" stroke="#fff" stroke-width="3"/><circle cx="0" cy="30" r="4.5" fill="#fff"/><path d="M-9 12 l-8 6 M9 12 l8 6" stroke="#fff" stroke-width="2" opacity=".7"/>' },
    tank: { hang: true, draw: (c) => HOOK + '<rect x="-9" y="8" width="4" height="9" fill="' + c + '"/><rect x="5" y="8" width="4" height="9" fill="' + c + '"/><path d="M-9 16 h18 v18 a4 4 0 0 1 -4 4 h-10 a4 4 0 0 1 -4 -4 Z" fill="' + c + '"/>' },
    futon: { hang: true, draw: (c) => '<rect x="-20" y="-4" width="40" height="32" rx="5" fill="' + c + '"/><path d="M-20 4 h40" stroke="' + shade(c) + '" stroke-width="2.5"/><circle cx="-9" cy="16" r="4" fill="#fff" opacity=".55"/><circle cx="9" cy="16" r="4" fill="#fff" opacity=".55"/>' },
    skirt: { hang: true, draw: (c) => HOOK + '<rect x="-8" y="8" width="16" height="4.5" rx="2" fill="' + shade(c) + '"/><path d="M-8 12 h16 l7 20 h-30 Z" fill="' + c + '"/><path d="M-5 12 l-4 20 M0 12 v20 M5 12 l4 20" stroke="#00000022" stroke-width="1.6"/>' },
    happi: { hang: true, draw: (c) => HOOK + SHIRT(c) + '<path d="M-4 12 v27 M4 12 v27" stroke="#fff" stroke-width="2.6"/><path d="M-13.5 34 h27" stroke="#e05656" stroke-width="3"/>' },
    scrub: { hang: true, draw: (c) => HOOK + SHIRT(c) + '<path d="M-4 12 l4 5 4 -5" stroke="#fff" stroke-width="2" fill="none"/><path d="M6 24 v7 M2.5 27.5 h7" stroke="#e05656" stroke-width="2.4"/>' },
    judo: { hang: true, draw: (c) => HOOK + SHIRT('#f4f4f4') + '<path d="M-4 12 l4 6 4 -6" stroke="#d8d8d8" stroke-width="2" fill="none"/><rect x="-13.5" y="28" width="27" height="5" fill="#2e2e3e"/>' },
    dryflower: { hang: true, draw: () => '<path d="M0 0 v6" stroke="#8a6f4d" stroke-width="2"/><path d="M0 6 l-9 17 M0 6 l-3 20 M0 6 l3 20 M0 6 l9 17" stroke="#b08a5a" stroke-width="2.4"/>' +
      '<circle cx="-9" cy="25" r="3.5" fill="#d8a0b0"/><circle cx="-3" cy="28" r="3.5" fill="#c9b0d8"/><circle cx="3" cy="28" r="3.5" fill="#d8c9a0"/><circle cx="9" cy="25" r="3.5" fill="#d8a0b0"/>' },
    chime: { hang: true, draw: (c) => '<path d="M0 0 v5" stroke="#8a93a5" stroke-width="2"/><path d="M-8 14 a8 8 0 0 1 16 0 v3 h-16 Z" fill="' + c + '"/><path d="M0 17 v7" stroke="#8a93a5" stroke-width="1.8"/><rect x="-4.5" y="24" width="9" height="13" rx="2" fill="#fff" stroke="#e5e5e5"/>' },
    box_cosme: { draw: () => '<rect x="-15" y="-20" width="30" height="20" rx="3" fill="#ffd3e0"/><path d="M-15 -14 h30" stroke="#f0b3c8" stroke-width="2"/>' +
      '<rect x="-3" y="-34" width="6" height="9" rx="1.5" fill="#e05656"/><rect x="-4.5" y="-26" width="9" height="6" rx="1.5" fill="#8a6f7a"/><path d="M8 -26 l1 2.2 2.4.3 -1.7 1.7 .4 2.4 -2.1 -1.1 -2.1 1.1 .4 -2.4 -1.7 -1.7 2.4 -.3Z" fill="#e6a4bc"/>' },
    box_crate: { draw: () => '<rect x="-4" y="-36" width="8" height="18" rx="3" fill="#2e5d3a"/><rect x="-2.5" y="-41" width="5" height="7" rx="1" fill="#e6c368"/>' +
      '<rect x="-16" y="-20" width="32" height="20" fill="#c99b66"/><path d="M-16 -20 h32 M-16 -10 h32" stroke="#a87c4a" stroke-width="2"/><path d="M-8 -20 v20 M8 -20 v20" stroke="#a87c4a" stroke-width="1.6"/>' },
    box_case: { draw: () => '<rect x="-17" y="-22" width="34" height="22" rx="3" fill="#b9c3cd"/><rect x="-6" y="-27" width="12" height="6" rx="2.5" fill="#8a93a5"/>' +
      '<circle cx="-13" cy="-18" r="1.3" fill="#7b8794"/><circle cx="13" cy="-18" r="1.3" fill="#7b8794"/><circle cx="-13" cy="-4" r="1.3" fill="#7b8794"/><circle cx="13" cy="-4" r="1.3" fill="#7b8794"/><path d="M-17 -11 h34" stroke="#98a3b0" stroke-width="2"/>' },
    box_cool: { draw: () => '<rect x="-15" y="-19" width="30" height="19" rx="3" fill="#fff" stroke="#dfe6ec"/><rect x="-15" y="-24" width="30" height="7" rx="3" fill="#6fc7e8"/>' +
      '<path d="M0 -14 v9 M-4 -12 l8 5 M-4 -7 l8 -5" stroke="#6fc7e8" stroke-width="1.8"/>' },
    books: { draw: () => '<rect x="-14" y="-6" width="28" height="6" rx="1" fill="#e05656"/><rect x="-12" y="-12" width="24" height="6" rx="1" fill="#5b7db1"/><rect x="-13" y="-18" width="26" height="6" rx="1" fill="#7ec95e"/><path d="M-10 -3 h20 M-8 -9 h16 M-9 -15 h18" stroke="#fff" stroke-width="1.2" opacity=".6"/>' },
    papers: { draw: () => '<rect x="-14" y="-5" width="28" height="5" rx="1" fill="#eceff3"/><rect x="-13" y="-10" width="26" height="5" rx="1" fill="#e0e4ea"/><rect x="-14" y="-15" width="28" height="5" rx="1" fill="#eceff3"/><path d="M-9 -12.5 h14 M-9 -7.5 h18 M-9 -2.5 h12" stroke="#aab4c4" stroke-width="1.4"/>' },
    can_tower: { draw: (c) => '<g fill="' + c + '"><rect x="-15" y="-15" width="9" height="15" rx="2"/><rect x="-4.5" y="-15" width="9" height="15" rx="2"/><rect x="6" y="-15" width="9" height="15" rx="2"/><rect x="-10" y="-30" width="9" height="15" rx="2"/><rect x="1" y="-30" width="9" height="15" rx="2"/><rect x="-4.5" y="-45" width="9" height="15" rx="2"/></g>' +
      '<path d="M-13 -11 h5 M-2.5 -11 h5 M8 -11 h5 M-8 -26 h5 M3 -26 h5 M-2.5 -41 h5" stroke="#fff" stroke-width="1.6" opacity=".7"/>' },
    can_energy: { draw: (c) => '<rect x="-6" y="-27" width="12" height="27" rx="3" fill="' + c + '"/><path d="M2 -23 l-6 9 h6 l-5 9" stroke="#ffc800" stroke-width="2.2" fill="none" stroke-linejoin="round"/>' },
    bottles: { draw: () => '<g fill="#8a5a3a"><rect x="-14" y="-12" width="7" height="12" rx="2"/><rect x="-3.5" y="-12" width="7" height="12" rx="2"/><rect x="7" y="-12" width="7" height="12" rx="2"/></g>' +
      '<g fill="#e6c368"><rect x="-12.5" y="-15" width="4" height="4" rx="1"/><rect x="-2" y="-15" width="4" height="4" rx="1"/><rect x="8.5" y="-15" width="4" height="4" rx="1"/></g>' },
    bag_brand: { draw: () => '<path d="M-13 0 v-24 h26 v24 Z" fill="#f7f3ea"/><path d="M-6 -24 a6 6 0 0 1 12 0" stroke="#3c3c46" stroke-width="2.5" fill="none"/>' +
      '<path d="M-5 -15 h10 M-5 -11 h10" stroke="#3c3c46" stroke-width="1.6"/><path d="M0 -4 l-3 -2.5 3 -2.5 3 2.5Z" fill="#e6c368"/>' },
    bag_conv: { draw: () => '<path d="M-11 0 v-17 q0 -4 4 -4 l1.5 -5 h11 l1.5 5 q4 0 4 4 v17 Z" fill="#fff" stroke="#e0e4ea"/><path d="M-11 -13 h22" stroke="#6fc7e8" stroke-width="2.5"/>' },
    bonsai: { draw: () => '<path d="M-14 -5 h28 l-3 5 h-22 Z" fill="#8a6f4d"/><path d="M-1 -5 q-2 -9 5 -13" stroke="#6b4a2f" stroke-width="3.2" fill="none"/>' +
      '<ellipse cx="6" cy="-21" rx="10" ry="5.5" fill="#4c8c3f"/><ellipse cx="-5" cy="-14" rx="7" ry="4" fill="#58a84a"/>' },
    tomato: { draw: (c) => '<path d="M-11 0 l-2 -14 h26 l-2 14 Z" fill="' + c + '"/><path d="M0 -14 v-16 M0 -24 h-8 M0 -19 h8" stroke="#4c8c3f" stroke-width="2.2"/>' +
      '<circle cx="-8" cy="-22" r="3.5" fill="#e05656"/><circle cx="8" cy="-17" r="3.5" fill="#e05656"/><circle cx="-2" cy="-30" r="3.5" fill="#e05656"/>' },
    plant_big: { draw: (c) => '<path d="M-11 0 l-2 -14 h26 l-2 14 Z" fill="' + c + '"/><path d="M0 -14 v-22" stroke="#4c8c3f" stroke-width="3"/>' +
      '<ellipse cx="-9" cy="-33" rx="9" ry="5" fill="#58a84a" transform="rotate(-32 -9 -33)"/><ellipse cx="9" cy="-33" rx="9" ry="5" fill="#58a84a" transform="rotate(32 9 -33)"/><ellipse cx="0" cy="-40" rx="5.5" ry="9" fill="#6fbf5a"/>' },
    ring: { draw: (c) => '<circle cx="0" cy="-15" r="12.5" fill="none" stroke="' + c + '" stroke-width="8"/>' +
      '<path d="M-12.5 -15 a12.5 12.5 0 0 1 6.2 -10.8" stroke="#fff" stroke-width="8" fill="none"/><path d="M12.5 -15 a12.5 12.5 0 0 1 -6.2 10.8" stroke="#fff" stroke-width="8" fill="none"/>' },
    teddy: { draw: () => '<circle cx="-6" cy="-26" r="3" fill="#c99b66"/><circle cx="6" cy="-26" r="3" fill="#c99b66"/><circle cx="0" cy="-20" r="8" fill="#c99b66"/>' +
      '<ellipse cx="0" cy="-8" rx="9" ry="8" fill="#c99b66"/><ellipse cx="0" cy="-17" rx="4" ry="3" fill="#e8d5b5"/><circle cx="-3" cy="-22" r="1.2" fill="#3c3c46"/><circle cx="3" cy="-22" r="1.2" fill="#3c3c46"/>' },
    flag: { draw: () => '<path d="M-3 0 v-36" stroke="#8a93a5" stroke-width="2.5"/><rect x="-3" y="-36" width="21" height="13" fill="#fff" stroke="#e5e5e5"/><circle cx="7.5" cy="-29.5" r="4.2" fill="#e05656"/>' },
    tarot: { draw: () => '<rect x="-13" y="-16" width="26" height="16" rx="2" fill="#4a4066"/><path d="M0 -11 l1.5 3.5 3.5.5 -2.5 2.4 .6 3.6 -3.1 -1.7 -3.1 1.7 .6 -3.6 -2.5 -2.4 3.5 -.5Z" fill="#e6c368"/>' +
      '<g transform="rotate(-14 -9 -20)"><rect x="-14" y="-28" width="10" height="15" rx="1.5" fill="#fff" stroke="#d8d8d8"/></g><g transform="rotate(12 9 -20)"><rect x="4" y="-28" width="10" height="15" rx="1.5" fill="#fff" stroke="#d8d8d8"/></g>' },
    beads: { draw: (c) => { let b = ''; for (let i = 0; i < 9; i++) { const a = Math.PI * 2 * i / 9; b += '<circle cx="' + (Math.cos(a) * 9).toFixed(1) + '" cy="' + (-13 + Math.sin(a) * 9).toFixed(1) + '" r="2.6" fill="' + c + '"/>'; } return b + '<circle cx="0" cy="-2" r="3.2" fill="' + shade(c) + '"/>'; } },
    bouquet: { draw: () => '<path d="M-9 0 h18 l-5 -14 h-8 Z" fill="#f0e2c8"/><path d="M-4 -14 l-3 -8 M0 -14 v-9 M4 -14 l3 -8" stroke="#4c8c3f" stroke-width="2"/>' +
      '<circle cx="-7" cy="-24" r="4.5" fill="#e05656"/><circle cx="0" cy="-27" r="4.5" fill="#ff9ec7"/><circle cx="7" cy="-24" r="4.5" fill="#e05656"/>' },
    salt: { draw: () => '<path d="M-13 0 l5.5 -13 5.5 13 Z" fill="#fff" stroke="#e0e4ea"/><path d="M2 0 l5.5 -13 5.5 13 Z" fill="#fff" stroke="#e0e4ea"/>' },
    meter: { draw: () => '<rect x="-11" y="-26" width="22" height="19" rx="3" fill="#e8eef2" stroke="#b9c3cd"/><circle cx="0" cy="-18" r="5.5" fill="#fff" stroke="#8a93a5"/><path d="M0 -18 l3.5 -3" stroke="#e05656" stroke-width="1.8"/><path d="M-6 -7 v7 M6 -7 v7" stroke="#8a93a5" stroke-width="2.2"/>' },
    ofuda_v: { draw: () => '<rect x="-7" y="-32" width="14" height="32" rx="1.5" fill="#fff" stroke="#e5e5e5"/><path d="M0 -28 v24 M-4 -24 h8 M-4 -16 h8" stroke="#e05656" stroke-width="2"/>' },
    wig: { draw: (c) => '<circle cx="0" cy="-19" r="9" fill="#f3e3d3"/><path d="M-9 -19 a9 9 0 0 1 18 0 v7 q-9 7 -18 0 Z" fill="' + c + '"/><path d="M0 -10 v6 M-7 -2 q7 5 14 0" stroke="#8a93a5" stroke-width="2.2" fill="none"/>' },
    flute: { draw: () => '<path d="M-4.5 -30 h9 l-2 12 h-5 Z" fill="#fff2cf" stroke="#e0c98f"/><path d="M0 -18 v14 M-5 -3 h10" stroke="#e0c98f" stroke-width="2.4"/><circle cx="-1" cy="-27" r="1.1" fill="#fff"/><circle cx="2" cy="-24" r="1.1" fill="#fff"/>' },
    tapioca: { draw: () => '<path d="M-9 -20 l2 20 h14 l2 -20 Z" fill="#efe0c8"/><g fill="#3c3446"><circle cx="-4" cy="-4" r="1.8"/><circle cx="1" cy="-3" r="1.8"/><circle cx="5" cy="-5" r="1.8"/><circle cx="-1" cy="-7" r="1.8"/></g><path d="M-9 -20 a9 5 0 0 1 18 0Z" fill="#fff"/><path d="M2 -23 l4 -12" stroke="#ff86d0" stroke-width="3.2" stroke-linecap="round"/>' },
    gamepad: { draw: (c) => '<rect x="-15" y="-16" width="30" height="13" rx="6.5" fill="' + c + '"/><path d="M-9 -9.5 h6 M-6 -12.5 v6" stroke="#fff" stroke-width="2"/><circle cx="7" cy="-12" r="1.8" fill="#fff"/><circle cx="11" cy="-9" r="1.8" fill="#fff"/>' },
    sake: { draw: () => '<rect x="-6" y="-33" width="12" height="33" rx="3" fill="#5d4a2e"/><rect x="-2.5" y="-41" width="5" height="9" rx="1.5" fill="#5d4a2e"/><rect x="-4.5" y="-24" width="9" height="13" rx="1" fill="#fff"/><circle cx="0" cy="-18" r="3" fill="#e05656"/>' },
    wine: { draw: () => '<rect x="-5" y="-30" width="10" height="30" rx="3.5" fill="#4a2438"/><rect x="-2" y="-38" width="4" height="9" rx="1.5" fill="#4a2438"/><rect x="-3.5" y="-21" width="7" height="9" rx="1" fill="#f0e2c8"/>' },
    golf: { draw: (c) => '<g transform="rotate(7)"><rect x="-9" y="-34" width="18" height="34" rx="6" fill="' + c + '"/><path d="M-4 -34 l-2 -9 M2 -34 l1 -9 M7 -34 l3 -8" stroke="#8a93a5" stroke-width="2.6" stroke-linecap="round"/><circle cx="-6.5" cy="-44" r="2.5" fill="#8a93a5"/><path d="M-9 -22 h18" stroke="#00000022" stroke-width="3"/></g>' },
    surf: { draw: (c) => '<g transform="rotate(5)"><path d="M0 0 q-9 -18 0 -46 q9 28 0 46Z" fill="' + c + '"/><path d="M0 -8 v-30" stroke="#fff" stroke-width="1.8"/></g>' },
    skate: { draw: (c) => '<path d="M-16 -8 q0 3 3 3 h26 q3 0 3 -3" stroke="' + c + '" stroke-width="4.5" fill="none"/><circle cx="-9" cy="-2.8" r="2.9" fill="#3c3446"/><circle cx="9" cy="-2.8" r="2.9" fill="#3c3446"/>' },
    yogamat: { draw: (c) => '<rect x="-6.5" y="-28" width="13" height="28" rx="6" fill="' + c + '"/><ellipse cx="0" cy="-27" rx="6.5" ry="4" fill="#fff" opacity=".75"/><circle cx="0" cy="-27" r="2.2" fill="' + c + '"/>' },
    broom: { draw: () => '<path d="M6 -12 l5 -24" stroke="#b08a5a" stroke-width="3" stroke-linecap="round"/><path d="M-1 0 l4 -13 7 1.6 -1.5 13.4 Z" fill="#e0c98f"/><path d="M1 -1 l2 -10 M5 0 l1.5 -10 M8.5 0 l1 -10" stroke="#c9ab72" stroke-width="1.6"/><path d="M-12 0 a5 5 0 0 1 0 -9 a5 5 0 0 1 4 9Z" fill="#8a93a5"/>' },
    bucket: { draw: (c) => '<path d="M10 0 l4 -31" stroke="#b08a5a" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="-33" r="4" fill="#e0e4ea"/><path d="M-12 0 l2 -15 h17 l2 15 Z" fill="' + c + '"/><path d="M-9.5 -15 a9.5 8 0 0 1 18 0" stroke="#8a93a5" stroke-width="2.2" fill="none"/>' },
    fan_elec: { draw: (c) => '<circle cx="0" cy="-25" r="11" fill="none" stroke="' + c + '" stroke-width="3"/><ellipse cx="0" cy="-30" rx="3.5" ry="5.5" fill="' + c + '" opacity=".55"/><ellipse cx="-4.7" cy="-22" rx="5.5" ry="3.5" fill="' + c + '" opacity=".55" transform="rotate(30 -4.7 -22)"/><ellipse cx="4.7" cy="-22" rx="5.5" ry="3.5" fill="' + c + '" opacity=".55" transform="rotate(-30 4.7 -22)"/><circle cx="0" cy="-25" r="2.8" fill="' + c + '"/><path d="M0 -14 v9 M-6 0 h12" stroke="' + c + '" stroke-width="3"/>' },
    candle: { draw: () => '<rect x="-13" y="-14" width="7" height="14" rx="2" fill="#fff"/><rect x="-2" y="-19" width="7" height="19" rx="2" fill="#f7ead2"/><rect x="8" y="-11" width="7" height="11" rx="2" fill="#fff"/><path d="M-9.5 -16 q2.5 -4 0 -6.5 q-2.5 2.5 0 6.5Z" fill="#ffc800"/><path d="M1.5 -21 q2.5 -4 0 -6.5 q-2.5 2.5 0 6.5Z" fill="#ff9600"/><path d="M11.5 -13 q2.5 -4 0 -6.5 q-2.5 2.5 0 6.5Z" fill="#ffc800"/>' },
    rod: { draw: () => '<path d="M-8 0 L13 -44" stroke="#8a6f4d" stroke-width="2.6" stroke-linecap="round"/><path d="M13 -44 q7 9 -1 17" stroke="#c8ccd4" stroke-width="1.3" fill="none"/><circle cx="-2" cy="-10" r="2.6" fill="#5b6478"/>' },
    keyboardp: { draw: () => '<rect x="-17" y="-13" width="34" height="13" rx="2" fill="#3c3446"/><rect x="-15" y="-10" width="30" height="9" rx="1" fill="#fff"/><path d="M-10 -10 v9 M-5 -10 v9 M0 -10 v9 M5 -10 v9 M10 -10 v9" stroke="#c8ccd4" stroke-width="1"/><g fill="#3c3446"><rect x="-12" y="-10" width="3" height="5"/><rect x="-7" y="-10" width="3" height="5"/><rect x="3" y="-10" width="3" height="5"/><rect x="8" y="-10" width="3" height="5"/></g>' },
    petbowl: { draw: (c) => '<path d="M-11 0 l1.8 -8 h18.4 l1.8 8 Z" fill="' + c + '"/><path d="M-4 -10 q4 -4.5 8 0 q-4 4.5 -8 0Z" fill="#6fc7e8"/><path d="M4 -10 l4 -3 v6 Z" fill="#6fc7e8"/>' },
    glow: { draw: (c) => '<g transform="rotate(-22)"><rect x="-3" y="-29" width="6" height="25" rx="3" fill="' + c + '"/><rect x="-3" y="-34" width="6" height="5" rx="2" fill="#3c3446"/></g><g transform="rotate(22)"><rect x="-3" y="-29" width="6" height="25" rx="3" fill="#7cc7ff"/><rect x="-3" y="-34" width="6" height="5" rx="2" fill="#3c3446"/></g>' },
    lantern: { hang: true, draw: () => '<path d="M0 0 v5" stroke="#8a93a5" stroke-width="2"/><rect x="-4.5" y="5" width="9" height="4" rx="1.5" fill="#3c3446"/><ellipse cx="0" cy="21" rx="11.5" ry="13" fill="#e05656"/><path d="M-11 21 h22 M-9.5 14 h19 M-9.5 28 h19" stroke="#00000022" stroke-width="1.6"/><rect x="-4.5" y="32" width="9" height="4" rx="1.5" fill="#3c3446"/>' },
    cobweb: { draw: () => '<g stroke="#c8d0dc" stroke-width="1.5" fill="none"><path d="M0 -36 v36 M0 -36 l15 26 M0 -36 l-15 26"/><path d="M-7.5 -23 q7.5 5.5 15 0 M-11 -13 q11 8 22 0"/></g><circle cx="5" cy="-18" r="2.2" fill="#8a93a5"/>' },
    pcase: { draw: () => '<rect x="-15" y="-16" width="30" height="16" rx="2" fill="#ffc800"/><path d="M-15 -8 h30 M-7 -16 v16 M7 -16 v16" stroke="#e6a800" stroke-width="2"/><rect x="-10" y="-13" width="8" height="3.5" rx="1" fill="#fff" opacity=".8"/>' },
    eyemask: { draw: (c) => '<path d="M-12 -16 a12 9 0 0 1 24 0 v3 a12 9 0 0 1 -24 0Z" fill="' + c + '"/><path d="M-12 -15 q-6 -1 -8 -5 M12 -15 q6 -1 8 -5" stroke="' + c + '" stroke-width="2.2" fill="none"/><path d="M-6 -14 q2 2 4 0 M2 -14 q2 2 4 0" stroke="#fff" stroke-width="1.6" fill="none"/>' },
    hat_item: { draw: (c) => '<path d="M-14 -6 h28" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/><path d="M-9 -6 q0 -13 9 -13 t9 13Z" fill="' + c + '"/><path d="M-9 -9 h18" stroke="#00000025" stroke-width="2.5"/>' },
    laptop: { draw: () => '<rect x="-13" y="-25" width="24" height="15" rx="2" fill="#3c3446"/><rect x="-11" y="-23" width="20" height="11" rx="1" fill="#7cc7ff"/><path d="M-9 -20 h9 M-9 -16 h13" stroke="#fff" stroke-width="1.5" opacity=".7"/><path d="M-15 -10 h28 l3 7 h-34 Z" fill="#5b6478"/>' },
    // --- 中身が分かる箱シリーズ ---
    box_stack: { draw: () => '<rect x="-16" y="-20" width="32" height="20" rx="2" fill="#c99b66"/><path d="M-16 -14 h32 M0 -20 v20" stroke="#a87c4a" stroke-width="2"/><rect x="-12" y="-36" width="26" height="17" rx="2" fill="#d4a976"/><path d="M-12 -31 h26 M1 -36 v17" stroke="#b08a5a" stroke-width="2"/>' },
    box_open: { draw: () => '<rect x="-15" y="-18" width="30" height="18" rx="2" fill="#c99b66"/><path d="M-15 -18 l-6 -8 8 2Z M15 -18 l6 -8 -8 2Z" fill="#b08a5a"/><rect x="-11" y="-16" width="22" height="8" fill="#8a6f4d"/><path d="M-6 -18 q6 -8 12 0" stroke="#e8d9c2" stroke-width="3" fill="none"/>' },
    box_tall: { draw: () => '<rect x="-12" y="-30" width="24" height="30" rx="2" fill="#c99b66"/><path d="M-12 -22 h24 M0 -30 v8" stroke="#a87c4a" stroke-width="2"/><rect x="-7" y="-17" width="14" height="10" rx="1.5" fill="#fff"/><path d="M-4 -14 h8 M-4 -11 h5" stroke="#aab4c4" stroke-width="1.6"/>' },
    box_gift: { draw: () => '<rect x="-14" y="-20" width="28" height="20" rx="2" fill="#fff" stroke="#f0e2e2"/><path d="M0 -20 v20 M-14 -10 h28" stroke="#e05656" stroke-width="3.5"/><path d="M0 -20 c-6 -8 -12 -2 -6 2 M0 -20 c6 -8 12 -2 6 2" stroke="#e05656" stroke-width="2.5" fill="none"/>' },
    box_gadget: { draw: () => '<rect x="-16" y="-24" width="32" height="24" rx="2" fill="#eceff3"/><path d="M-16 -18 h32" stroke="#c8d0dc" stroke-width="2"/><rect x="-8" y="-15" width="16" height="12" rx="2" fill="#fff" stroke="#c8d0dc"/><path d="M1 -13 l-4 5 h4 l-3 5" stroke="#f5a623" stroke-width="2" fill="none" stroke-linejoin="round"/>' },
    box_med: { draw: () => '<rect x="-14" y="-20" width="28" height="20" rx="3" fill="#fff" stroke="#e0e4ea"/><path d="M0 -15 v10 M-5 -10 h10" stroke="#e05656" stroke-width="3.5"/>' },
    box_jewel: { draw: () => '<rect x="-11" y="-16" width="22" height="16" rx="3" fill="#2e2e3e"/><path d="M-4 -23 h8 l3 4 -7 6 -7 -6Z" fill="#7cc7ff"/><path d="M-4 -23 l4 4 4 -4 M-7 -19 h14" stroke="#fff" stroke-width="1" opacity=".7"/>' },
    box_figure: { draw: () => '<rect x="-13" y="-28" width="26" height="28" rx="2" fill="#ff9ec7"/><rect x="-8" y="-24" width="16" height="18" rx="2" fill="#dceafb"/><circle cx="0" cy="-19" r="3" fill="#ffd9b3"/><path d="M0 -16 v6 M-4 -13 h8 M0 -10 l-3 4 M0 -10 l3 4" stroke="#5b6478" stroke-width="1.8" fill="none"/>' },
    box_music: { draw: () => '<rect x="-16" y="-24" width="32" height="24" rx="2" fill="#c99b66"/><path d="M-16 -17 h32" stroke="#a87c4a" stroke-width="2"/><rect x="-8" y="-15" width="16" height="12" rx="2" fill="#fff"/><circle cx="-2" cy="-6.5" r="2" fill="#5b6478"/><path d="M0 -6.5 v-6 l4 1" stroke="#5b6478" stroke-width="1.8" fill="none"/>' },
    box_dice: { draw: () => '<rect x="-15" y="-22" width="30" height="22" rx="2" fill="#7ec95e"/><rect x="-9" y="-17" width="18" height="12" rx="2" fill="#fff"/><circle cx="-4" cy="-13" r="1.5" fill="#3c3446"/><circle cx="4" cy="-9" r="1.5" fill="#3c3446"/><circle cx="4" cy="-13" r="1.5" fill="#3c3446"/><circle cx="-4" cy="-9" r="1.5" fill="#3c3446"/>' },
    box_glasses: { draw: () => '<rect x="-15" y="-20" width="30" height="20" rx="2" fill="#5b7db1"/><rect x="-10" y="-15" width="20" height="10" rx="2" fill="#fff"/><circle cx="-4" cy="-10" r="2.6" fill="none" stroke="#3c3446" stroke-width="1.5"/><circle cx="4" cy="-10" r="2.6" fill="none" stroke="#3c3446" stroke-width="1.5"/><path d="M-1.4 -10 h2.8" stroke="#3c3446" stroke-width="1.5"/>' },
    box_coffee: { draw: () => '<rect x="-14" y="-24" width="28" height="24" rx="2" fill="#8a5a3a"/><rect x="-8" y="-18" width="16" height="12" rx="2" fill="#fff"/><path d="M-4 -14 h7 v4 a3.5 3.5 0 0 1 -7 0Z" stroke="#8a5a3a" stroke-width="1.6" fill="none"/><path d="M3 -13 h2 a2 2 0 0 1 -2 3" stroke="#8a5a3a" stroke-width="1.4" fill="none"/><path d="M-2 -17 q1 -1.5 0 -3 M1 -17 q1 -1.5 0 -3" stroke="#8a5a3a" stroke-width="1.2" fill="none"/>' },
    box_air: { draw: () => '<rect x="-16" y="-22" width="32" height="22" rx="2" fill="#f7f3ea"/><path d="M-16 -22 h32" stroke="#e05656" stroke-width="3" stroke-dasharray="5 4"/><path d="M-16 -2 h32" stroke="#5b7db1" stroke-width="3" stroke-dasharray="5 4"/><path d="M-6 -15 h12 M-2 -18 l4 3 -4 3" stroke="#5b7db1" stroke-width="1.8" fill="none"/>' },
    box_bottles: { draw: () => '<g fill="#5b7db1"><rect x="-11" y="-30" width="6" height="12" rx="2"/><rect x="-3" y="-30" width="6" height="12" rx="2"/><rect x="5" y="-30" width="6" height="12" rx="2"/></g><rect x="-15" y="-20" width="30" height="20" rx="2" fill="#c99b66"/><path d="M-15 -13 h30" stroke="#a87c4a" stroke-width="2"/>' },
    box_baby: { draw: () => '<rect x="-15" y="-22" width="30" height="22" rx="3" fill="#fff" stroke="#f0e2e2"/><circle cx="-2" cy="-12" r="4.5" fill="#ffc800"/><circle cx="2.5" cy="-15" r="2.5" fill="#ffc800"/><path d="M5 -15 l3 -1 -2 2.5Z" fill="#ff9600"/><circle cx="2" cy="-15.7" r="0.8" fill="#3c3446"/>' },
    box_pizza: { draw: () => '<rect x="-17" y="-11" width="34" height="11" rx="2" fill="#e05656"/><path d="M-17 -8 h34" stroke="#c53030" stroke-width="1.6"/><path d="M-6 -22 l12 0 -6 11Z" fill="#ffc800" stroke="#e6a800"/><circle cx="-1" cy="-18" r="1.5" fill="#e05656"/><circle cx="3" cy="-16" r="1.5" fill="#e05656"/>' },
    box_cat: { draw: () => '<rect x="-15" y="-22" width="30" height="22" rx="2" fill="#e8d5b5"/><circle cx="0" cy="-10" r="3" fill="#8a6f4d"/><circle cx="-5" cy="-15" r="1.8" fill="#8a6f4d"/><circle cx="0" cy="-16.5" r="1.8" fill="#8a6f4d"/><circle cx="5" cy="-15" r="1.8" fill="#8a6f4d"/>' },
    suitcase: { draw: (c) => '<path d="M-4 -46 h8 M-3 -46 v6 M3 -46 v6" stroke="#8a93a5" stroke-width="2.5" fill="none"/><rect x="-11" y="-40" width="22" height="38" rx="5" fill="' + c + '"/><path d="M-4 -40 v38 M4 -40 v38" stroke="#00000022" stroke-width="2.5"/><circle cx="-6" cy="-1" r="2.5" fill="#3c3446"/><circle cx="6" cy="-1" r="2.5" fill="#3c3446"/>' },
    chairs: { draw: (c) => '<g transform="rotate(8)"><rect x="-10" y="-34" width="7" height="34" rx="2" fill="' + c + '"/><rect x="-9" y="-20" width="5" height="20" rx="2" fill="#00000022"/></g><g transform="rotate(14)"><rect x="1" y="-32" width="7" height="32" rx="2" fill="' + c + '"/></g>' },
    firewood: { draw: () => '<g stroke="#6b4a2f" stroke-width="1.5"><circle cx="-8" cy="-5" r="5" fill="#b08a5a"/><circle cx="1" cy="-5" r="5" fill="#c99b66"/><circle cx="10" cy="-5" r="5" fill="#b08a5a"/><circle cx="-3.5" cy="-13" r="5" fill="#c99b66"/><circle cx="5.5" cy="-13" r="5" fill="#b08a5a"/></g><circle cx="-8" cy="-5" r="2" fill="#8a6f4d"/><circle cx="1" cy="-5" r="2" fill="#a87c4a"/><circle cx="10" cy="-5" r="2" fill="#8a6f4d"/><circle cx="-3.5" cy="-13" r="2" fill="#a87c4a"/><circle cx="5.5" cy="-13" r="2" fill="#8a6f4d"/>' },
    bulb: { draw: () => '<circle cx="0" cy="-20" r="9" fill="#ffe08a"/><path d="M-3 -20 q3 4 0 8 M3 -20 q-3 4 0 8" stroke="#e6a800" stroke-width="1.5" fill="none"/><rect x="-4.5" y="-11" width="9" height="8" rx="2" fill="#8a93a5"/><path d="M-4.5 -8.5 h9 M-4.5 -5.5 h9" stroke="#6b7a8c" stroke-width="1.3"/><path d="M-11 -29 l3 3 M11 -29 l-3 3 M0 -34 v4" stroke="#ffc800" stroke-width="2" stroke-linecap="round"/>' },
    tube: { draw: (c) => '<g transform="rotate(-24)"><rect x="-5" y="-38" width="10" height="38" rx="3" fill="' + c + '"/><ellipse cx="0" cy="-38" rx="5" ry="2.5" fill="#fff"/><path d="M-5 -10 h10" stroke="#00000022" stroke-width="2.5"/></g>' },
    bowls: { draw: () => '<path d="M-11 -3 a11 6 0 0 0 22 0Z" fill="#e05656"/><path d="M-10 -9 a10 5.5 0 0 0 20 0Z" fill="#fff" stroke="#e0e4ea"/><path d="M-9 -15 a9 5 0 0 0 18 0Z" fill="#e05656"/><path d="M-8 -20 a8 4.5 0 0 0 16 0Z" fill="#fff" stroke="#e0e4ea"/>' },
    sack: { draw: () => '<path d="M-12 0 q-3 -14 4 -22 l-2 -5 h20 l-2 5 q7 8 4 22Z" fill="#f0e2c8" stroke="#d9c49a"/><path d="M-8 -27 h16" stroke="#b08a5a" stroke-width="2.5"/><circle cx="0" cy="-11" r="4.5" fill="none" stroke="#e05656" stroke-width="1.6"/><circle cx="0" cy="-11" r="1.3" fill="#e05656"/>' },
    lanyard: { draw: (c) => '<path d="M-7 -30 l7 9 7 -9" stroke="' + c + '" stroke-width="2.5" fill="none"/><rect x="-7" y="-21" width="14" height="18" rx="2" fill="#fff" stroke="#e0e4ea"/><circle cx="0" cy="-16" r="2.8" fill="#c8d0dc"/><path d="M-4 -10 h8 M-4 -6.5 h6" stroke="#aab4c4" stroke-width="1.5"/>' },
    // --- シークレットアイテム ---
    sec_goldhato: { draw: () => '<path d="M-10 0 h20 l2 4 h-24Z" fill="#b57800"/><ellipse cx="0" cy="-14" rx="10" ry="11" fill="#ffc800"/><circle cx="0" cy="-27" r="6.5" fill="#ffc800"/><circle cx="-2" cy="-28" r="1.2" fill="#7a5514"/><path d="M-6.5 -25 l-4 2 4 1.5Z" fill="#e6a800"/><path d="M8 -18 q6 -4 5 -10" stroke="#e6a800" stroke-width="2.5" fill="none"/>' },
    sec_ufo: { draw: () => '<path d="M0 -26 a9 7 0 0 1 9 7 h-18 a9 7 0 0 1 9 -7Z" fill="#7cc7ff" opacity=".8"/><ellipse cx="0" cy="-17" rx="17" ry="6.5" fill="#8a93a5"/><circle cx="-9" cy="-16" r="1.8" fill="#ffc800"/><circle cx="0" cy="-14.5" r="1.8" fill="#e05656"/><circle cx="9" cy="-16" r="1.8" fill="#ffc800"/><path d="M-8 -11 l-3 9 M8 -11 l3 9 M0 -10 v9" stroke="#aab4c4" stroke-width="2"/>' },
    sec_chest: { draw: () => '<path d="M-14 -22 a14 9 0 0 1 28 0Z" fill="#8a5a3a"/><rect x="-14" y="-22" width="28" height="20" rx="2" fill="#a87c4a"/><path d="M-14 -22 h28" stroke="#6b4a2f" stroke-width="2"/><rect x="-14" y="-14" width="28" height="4" fill="#ffc800"/><rect x="-4" y="-16" width="8" height="9" rx="2" fill="#ffc800"/><circle cx="0" cy="-12" r="1.6" fill="#7a5514"/>' },
  };

  // シークレットアイテム（低確率でベランダに出現・図鑑コレクション用）
  const SECRET_ITEMS = [
    { id: 'goldhato', v: 'sec_goldhato', name: '金のハト像' },
    { id: 'ufo', v: 'sec_ufo', name: '小さなUFO' },
    { id: 'chest', v: 'sec_chest', name: '謎の宝箱' },
  ];

  // [正規表現, バリアント名, 対象kind（省略=全kind）]
  const RULES = [
    // --- 色指定バリアント（基準色と違う色を明示するヒント専用。最優先で色を拾う） ---
    [/真っ白なタオル|白いタオル/, 'towel_white', ['laundry']],
    [/黒のサロンエプロン|黒.*エプロン/, 'apron_black', ['laundry']],
    [/黒シャツ|黒Tシャツ|黒T|黒い服|黒キャップ/, 'laundry_black', ['laundry']],
    [/紺色/, 'laundry_navy', ['laundry']],
    [/パステル/, 'laundry_pastel', ['laundry']],
    [/ヒョウ柄/, 'laundry_leopard', ['laundry']],
    [/白スニーカー/, 'sandal_white', ['sandal']],
    [/ヒョウ柄/, 'sandal_leopard', ['sandal']],
    // --- 追加バリアント（集約されすぎた汎用画から「描き分けられる別物」を切り出し。順序=最優先） ---
    [/エプロン/, 'apron', ['laundry']],
    [/作業着|軍手|白手袋/, 'workwear', ['laundry']],
    [/抱き枕/, 'dakimakura', ['laundry']],
    [/スポーツタオル|部活タオル|ライブのタオル/, 'towel_sport', ['laundry']],
    [/ベビーカー/, 'stroller', ['bike']],
    [/三輪車|補助輪/, 'tricycle', ['bike']],
    [/ペアのマグ|タンブラー/, 'mug_pair', ['can']],
    [/試験管/, 'testtube', ['can']],
    [/カレンダー|ラジオ体操のカード/, 'calendar', ['mail']],
    [/原稿|校正刷り|学会ポスター/, 'manuscript', ['mail']],
    [/名刺/, 'namecards', ['mail']],
    [/履歴書|シフト表/, 'resume', ['mail']],
    [/うちわ/, 'uchiwa', ['star']],
    [/すべり台/, 'slide_toy', ['star']],
    [/灰皿/, 'ashtray', ['star']],
    [/猫用おもちゃ/, 'cat_toy', ['star']],
    [/小道具|武器っぽい/, 'cosplay_prop', ['star']],
    [/上履き/, 'uwabaki', ['sandal']],
    [/革靴/, 'dress_shoes', ['sandal']],
    [/登山靴/, 'hiking_boots', ['sandal']],
    [/小枝|どう見ても巣/, 'nest', ['plant']],
    [/間接照明|深夜だけ電気/, 'lamp'],  // 照明系ヒント→ランプ（⚠注意板だと意味不明なため）
    [/隕石/, 'meteor', ['alert']],       // 宇宙人: 隕石っぽい石→隕石（⚠板だと意味不明）
    [/アンテナ/, 'antenna', ['alert']],  // 宇宙人: アンテナが3本→アンテナ
    [/三脚/, 'tripod', ['camera']],      // 三脚→三脚（カメラ絵だと意味が違う）
    // --- 既存 ---
    [/レース/, 'lace'],
    [/ドレス|ワンピース|衣装|ガウン|着物/, 'dress'],
    [/タオル|背景布/, 'towel'],
    [/ジャージ|ユニフォーム|体操服/, 'jersey'],
    [/タンクトップ/, 'tank'],
    [/布団|テント|寝袋|毛布/, 'futon'],
    [/スカート|制服/, 'skirt'],
    [/法被/, 'happi'],
    [/スクラブ|白衣|白装束/, 'scrub'],
    [/柔道着|道着/, 'judo'],
    [/ドライフラワー|ハーブ|榊/, 'dryflower'],
    [/風鈴/, 'chime'],
    [/コスメ|化粧品|美容液|デパコス|香水|カラコン|タンニング/, 'box_cosme'],
    [/フィギュア/, 'box_figure', ['box']],
    [/段ボールが2|段ボールの山|段ボール山|箱の山|箱が積|菓子箱タワー/, 'box_stack', ['box']],
    [/米袋/, 'sack'],
    [/ピザ/, 'box_pizza'],
    [/薬/, 'box_med', ['box']],
    [/アクセ|ジュエリー/, 'box_jewel', ['box']],
    [/引き出物|ケーキ|菓子|スイーツ|プレゼント/, 'box_gift', ['box']],
    [/家電|加湿器|炊飯器|チェア|クッション|鍋|ミシン|ルーター|Wi-?Fi|ヘッドセット|スタンド|ディフューザー/, 'box_gadget', ['box']],
    [/ボードゲーム/, 'box_dice', ['box']],
    [/眼鏡|メガネ/, 'box_glasses', ['box']],
    [/コーヒー/, 'box_coffee', ['box']],
    [/国際便|エアメール/, 'box_air', ['box']],
    [/ミネラルウォーター|水の箱/, 'box_bottles', ['box']],
    [/おむつ|ベビー/, 'box_baby', ['box']],
    [/キャットタワー|爪とぎ|猫砂|キャットフード/, 'box_cat', ['box']],
    [/キャリー|スーツケース/, 'suitcase'],
    [/折りたたみ椅子/, 'chairs'],
    [/薪/, 'firewood'],
    [/電球/, 'bulb'],
    [/筒|ポスター/, 'tube', ['box']],
    [/出前の器|丼/, 'bowls'],
    [/楽器|エフェクター/, 'box_music', ['box']],
    [/名札|ストラップ/, 'lanyard', ['star']],
    [/シャンパングラスが/, 'flute', ['star']],
    [/シャンパン|ドンペリ/, 'box_crate', ['box']],
    [/機材|銀色|工具|無線/, 'box_case', ['box']],
    [/鶏むね|保冷|米|野菜|肉|クーラーボックス|レトルト|ネットスーパー|生協|食品/, 'box_cool', ['box']],
    [/CD|円盤|台本|経済書|社内報|回覧|レシピ本|日記|雑誌|の本|テキスト/, 'books', ['box', 'mail']],
    [/新聞|業界紙|プリント/, 'papers'],
    [/タワー|袋詰め/, 'can_tower', ['can']],
    [/エナドリ|エナジー/, 'can_energy', ['can']],
    [/栄養ドリンク/, 'bottles', ['can']],
    [/ブランド/, 'bag_brand', ['bag']],
    [/コンビニ/, 'bag_conv', ['bag']],
    [/盆栽/, 'bonsai', ['plant']],
    [/トマト/, 'tomato', ['plant']],
    [/立派な観葉/, 'plant_big', ['plant']],
    [/浮き輪/, 'ring', ['star']],
    [/ぬいぐるみ/, 'teddy', ['star']],
    [/国旗/, 'flag', ['star']],
    [/タロット/, 'tarot', ['star']],
    [/数珠|パワーストーン/, 'beads', ['star']],
    [/薔薇|花束|紅白の花/, 'bouquet'],
    [/タピオカ/, 'tapioca', ['can']],
    [/コントローラー/, 'gamepad'],
    [/一升瓶|お清めの酒/, 'sake', ['can']],
    [/ワイン/, 'wine', ['can', 'box']],
    [/ゴルフ/, 'golf', ['bag']],
    [/サーフボード/, 'surf'],
    [/スケボー|スケート/, 'skate', ['bike']],
    [/ヨガマット|ピラティス/, 'yogamat', ['dumbbell']],
    [/ほうき|ちりとり/, 'broom'],
    [/バケツ|モップ/, 'bucket'],
    [/扇風機/, 'fan_elec'],
    [/キャンドル|アロマ|線香/, 'candle'],
    [/釣り竿|釣竿/, 'rod'],
    [/キーボード/, 'keyboardp'],
    [/ごはん皿/, 'petbowl'],
    [/ペンライト|光るブレスレット/, 'glow'],
    [/提灯|ランタン/, 'lantern'],
    [/蜘蛛の巣/, 'cobweb'],
    [/ビールケース/, 'pcase'],
    [/アイマスク/, 'eyemask'],
    [/ノートPC|パソコン|モニター|ゲーミング/, 'laptop'],
    [/帽子/, 'hat_item', ['laundry']],
    [/盛り塩/, 'salt', ['alert']],
    [/メーター/, 'meter', ['alert']],
    [/お札|御札/, 'ofuda_v', ['alert']],
    [/ウィッグ/, 'wig', ['mirror']],
    // チラシ/DM/フライヤー束（郵便の中で「封筒じゃない紙束」だけ最後にまとめて切り出し） ---
    [/チラシ|フライヤー|DM|ＤＭ/, 'flyer', ['mail']],
  ];

  function classify(text, kind) {
    for (const r of RULES) {
      if (r[0].test(text) && (!r[2] || r[2].indexOf(kind) !== -1)) return r[1];
    }
    // 未分類の箱は3種の見た目に分散（同じ箱が並ばないように）
    if (kind === 'box') {
      const h = (text.charCodeAt(0) + text.length) % 3;
      return h === 1 ? 'box_open' : h === 2 ? 'box_tall' : null;
    }
    return null;
  }

  // スロット座標（吊り3 + 前列5 + 後列4）
  const HANG_X = [224, 277, 330];
  const FLOOR_X = [48, 116, 184, 252, 320];
  const BACK_X = [82, 150, 218, 288];

  function itemMarkup(it, idx) {
    const vdef = it.variant && VARIANTS[it.variant];
    const draw = vdef ? vdef.draw : (ITEMS[it.kind] || ITEMS.box);
    const zone = it.zone || (it.hang ? 'hang' : 'floor');
    let x, y, sc;
    if (zone === 'hang') { x = HANG_X[it.slot]; y = 52; sc = 1.32; }
    else if (zone === 'back') { x = BACK_X[it.slot]; y = 196; sc = 1.06; }
    else { x = FLOOR_X[it.slot]; y = 230; sc = 1.32; }
    const hang = zone === 'hang';
    const hit = hang
      ? '<rect x="-22" y="-4" width="44" height="56" fill="transparent"/>'
      : '<rect x="-22" y="-52" width="44" height="56" fill="transparent"/>';
    // 位置=外側g(属性) / 拡大=中間g(属性) / アニメ=内側g(CSSクラス) で分離
    return '<g transform="translate(' + x + ' ' + y + ')" onclick="UI.itemTap(' + idx + ')">' +
      '<g transform="scale(' + sc + ')">' +
      '<g class="sc-item' + (it.fresh ? ' fresh' : '') + (it.strong ? ' strong' : '') + (hang ? ' sway' : '') + '">' +
      (hang ? '' : '<ellipse cx="0" cy="1" rx="17" ry="3.5" fill="#000" opacity=".08"/>') +
      draw(it.color) + hit + '</g></g></g>';
  }

  // accent→代表マンション（mansionId未指定時のフォール）
  const ACCENT_MANSION = { amber: 'boro', cyan: 'gakusei', pink: 'hankagai', purple: 'tawaman', green: 'resort' };
  // マンションごとの環境光（小物と背景を同じ光でなじませる薄いオーバーレイ）
  const LIGHT = {
    boro: 'rgba(190,150,70,.16)', gakusei: 'rgba(210,205,180,.09)', hankagai: 'rgba(255,80,175,.20)',
    tawaman: 'rgba(120,175,255,.12)', kogai: 'rgba(255,205,130,.12)', designers: 'rgba(185,195,215,.11)',
    shataku: 'rgba(205,175,120,.12)', koukyu: 'rgba(255,222,150,.12)', zakkyo: 'rgba(120,85,165,.20)',
    resort: 'rgba(255,200,120,.14)',
  };

  // 物体ごとの表示「高さ」係数（実物の高さ基準・独立3レビューの中央値）。幅は cell() でアスペクト比から算出。
  const SIZE = {
    alert:0.95, antenna:1.25, apron:1.15, apron_black:1.15, ashtray:0.4, bag:0.85,
    bag_brand:0.88, bag_conv:0.72, beads:0.45, bike:1.65, bonsai:0.75, books:0.58,
    bottles:0.41, bouquet:1.04, bowls:0.67, box:1, box_air:1.06, box_baby:1.05,
    box_bottles:0.95, box_case:1.08, box_cat:0.92, box_coffee:0.9, box_cool:1, box_cosme:0.9,
    box_crate:0.95, box_dice:0.9, box_figure:0.9, box_gadget:1.02, box_gift:0.9, box_glasses:0.9,
    box_jewel:0.9, box_med:0.9, box_music:1.08, box_open:0.96, box_pizza:0.9, box_stack:1.1,
    box_tall:1.1, broom:1.3, bucket:1.3, bulb:0.41, calendar:0.8, camera:1.38,
    can:0.42, can_energy:0.42, can_tower:0.95, candle:0.43, cat_toy:0.65, chairs:1.78,
    chime:0.55, cobweb:0.55, cosplay_prop:1.18, crystal:0.48, dakimakura:1.35, dress:1.25,
    dress_shoes:0.9, dryflower:0.82, dumbbell:0.8, eyemask:0.41, fan_elec:1.6, firewood:0.82,
    flag:1.2, flute:0.72, flyer:0.42, futon:1.4, gamepad:0.47, glow:0.5,
    golf:1.42, guitar:1.2, happi:1.18, hat_item:0.55, hiking_boots:0.92, jersey:1.22,
    judo:1.24, keyboardp:1.3, kids:1.07, lace:1.2, lamp:1.2, lantern:0.78,
    lanyard:0.52, laptop:0.62, laundry:1.15, laundry_black:1.15, laundry_leopard:1.15, laundry_navy:1.15,
    laundry_pastel:1.15, mail:0.44, manuscript:0.46, megaphone:0.72, meteor:0.58, meter:0.82,
    mirror:0.5, mug_pair:0.43, namecards:0.4, nest:0.48, ofuda_v:0.5, papers:0.49,
    pcase:0.9, petbowl:0.4, plant:0.75, plant_big:1.5, protein:1.2, resume:0.4,
    ring:0.98, rod:1.5, sack:1.4, sake:1, salt:0.4, sandal:0.9,
    sandal_leopard:0.9, sandal_white:0.9, scrub:1.22, sec_chest:0.58, sec_goldhato:0.58, sec_ufo:0.48,
    skate:1.12, skirt:1.06, slide_toy:1.8, star:0.95, stroller:1.7, suit:1.24,
    suitcase:1.19, surf:1.4, tank:1.1, tapioca:0.5, tarot:0.45, teddy:0.75,
    testtube:0.55, tomato:0.85, towel:1.17, towel_sport:1.17, towel_white:1.12, tricycle:1.6,
    trophy:0.68, tube:1.08, uchiwa:0.58, umbrella:1.05, uwabaki:0.55, wig:0.62,
    wine:0.85, workwear:1.22, yogamat:1.4, tripod:1.35,
    // --- 新規122アイテム（実物の高さ係数・表示高さ%≈SIZE×18） ---
    alien_disc:0.75, alien_goo:0.5, amenity_bag:0.55, backdrop_cloth:1.5, bag_delivery:0.7, bento_box:0.45,
    box_books:0.95, box_cake:0.65, box_carry:0.95, box_champagne:0.95, box_champagne_glass:0.9, box_cushion:0.85,
    box_fan:0.55, box_fruit:0.7, box_hairdye:0.85, box_incense:0.55, box_intl:1.05, box_iron:0.8,
    box_perfume:0.85, box_photo:0.75, box_photos:0.7, box_shoes:0.6, box_spice:0.6, box_veggie:1,
    box_watch:0.5, breadcrumbs:0.38, can_ashtray:0.42, candy_bag:0.5, cat_food_can:0.4, catalog:0.42,
    cd_stack:0.42, champagne_glass:0.72, cleaning_set:1.3, clothesline_rope:0.4, clothespin:0.4, clothespins:0.4,
    condensation:0.45, cooler_bag:0.65, cupnoodle_tower:1, delivery_bag:0.85, delivery_notice:0.4, deterrent_disc:0.42,
    diary:0.42, director_chair:1.75, dust_layer:0.4, egg:0.36, empty_clothesline:0.45, empty_corner:0.5,
    empty_doormat:0.4, empty_shelf:1, eyelash_case:0.4, fan_towel:1.15, feathers:0.4, gateball_mallet:1,
    gloves:0.42, glow_bracelet:0.4, glowing_plant:1.05, guitar_case:1.15, gym_bag:0.95, gym_gloves:0.42,
    gym_uniform_kids:0.95, incense:0.42, kairanban:0.5, kimono:1.35, laundry_pole:0.45, laundry_white:1.1,
    leggings:1.1, magazines:0.6, magnet:0.4, mail_air:0.4, mailbox:0.5, map:0.42,
    med_notebook:0.4, metal_box:0.95, monitor:0.65, nail_case:0.42, nameplate:0.42, necktie:1.05,
    newspaper:0.55, nurse_shoes:0.45, party_decor:0.6, penlight:0.5, pigeon:0.55, platform_shoes:0.45,
    postcard:0.4, poster_tube:0.95, pullup_bar:1.6, ring_light:1.3, rolled_poster:1.05, safety_net:1.4,
    sailor_uniform:1.05, sakaki_branch:0.65, sandal_glitter:0.4, scissor_case:0.42, shoe_pile:0.55, sleeping_bag:1.25,
    slippers:0.4, spacesuit:1.4, stage_costume:1.2, stepladder:1.3, sun_cushion:0.45, sunglasses:0.42,
    swim_ring:1.1, synth_keyboard:1.15, taiso_card:0.4, tapestry:1.3, tent:1.25, tickets:0.4,
    toolbox:0.85, toothbrush_cup:0.5, trash_bag:1.15, tumbler:0.62, twigs:0.55, uchiwa_ita:0.6,
    vacancy_sign:0.75, vacuum_bag:0.95, wall_green:1, welcome_board:1, white_gloves:0.45, white_robe:1.3,
    window_dark:1.2, work_gloves:0.45,
  };
  // 各アイテム画像のアスペクト比(w/h)。高さ係数×アスペクトで表示幅%を出す（縦長の絵が巨大化しない）。
  const ASPECT = {
    alert:0.91, antenna:0.61, apron:0.67, apron_black:0.62, ashtray:1.21, bag:0.88,
    bag_brand:0.95, bag_conv:0.83, beads:0.98, bike:1.21, bonsai:0.89, books:1.04,
    bottles:0.91, bouquet:0.97, bowls:0.9, box:1.01, box_air:1.1, box_baby:0.95,
    box_bottles:1.06, box_case:1.3, box_cat:1.05, box_coffee:0.81, box_cool:1.12, box_cosme:1,
    box_crate:0.9, box_dice:1.22, box_figure:0.85, box_gadget:1.06, box_gift:0.98, box_glasses:1.09,
    box_jewel:0.76, box_med:0.96, box_music:0.86, box_open:1.17, box_pizza:0.96, box_stack:0.84,
    box_tall:0.74, broom:0.79, bucket:0.85, bulb:0.7, calendar:1.03, camera:1.09,
    can:0.67, can_energy:0.55, can_tower:0.83, candle:1.06, cat_toy:0.96, chairs:1.11,
    chime:0.52, cobweb:1.01, cosplay_prop:0.75, crystal:0.65, dakimakura:0.58, dress:0.69,
    dress_shoes:1.4, dryflower:0.72, dumbbell:1.27, eyemask:1.38, fan_elec:0.71, firewood:1.17,
    flag:0.83, flute:0.37, flyer:0.97, futon:1.42, gamepad:1.37, glow:0.89,
    golf:0.63, guitar:0.67, happi:1.06, hat_item:1.45, hiking_boots:1.12, jersey:0.79,
    judo:0.77, keyboardp:1.5, kids:0.73, lace:0.67, lamp:0.48, lantern:0.54,
    lanyard:0.65, laptop:1.03, laundry:0.85, laundry_black:0.84, laundry_leopard:0.93, laundry_navy:0.9,
    laundry_pastel:0.86, mail:1.14, manuscript:1.17, megaphone:0.87, meteor:1.04, meter:0.77,
    mirror:0.69, mug_pair:1.9, namecards:1.33, nest:1.25, ofuda_v:0.77, papers:1.06,
    pcase:1.05, petbowl:1.26, plant:0.75, plant_big:0.84, protein:0.73, resume:0.9,
    ring:1.32, rod:0.77, sack:0.96, sake:0.69, salt:1.24, sandal:1.24,
    sandal_leopard:1.25, sandal_white:1.37, scrub:0.82, sec_chest:1.14, sec_goldhato:0.73, sec_ufo:1.27,
    skate:1.33, skirt:0.89, slide_toy:1.07, star:0.83, stroller:0.96, suit:0.74,
    suitcase:0.61, surf:0.41, tank:0.66, tapioca:0.66, tarot:1.09, teddy:0.76,
    testtube:1.11, tomato:0.7, towel:1.14, towel_sport:1.15, towel_white:0.98, tricycle:1.26,
    trophy:0.87, tube:1.26, uchiwa:0.77, umbrella:0.58, uwabaki:1.23, wig:1.02,
    wine:0.47, workwear:1.23, yogamat:1.37, tripod:0.56,
    // --- 新規122アイテム（webpから実測 w/h・縦長の膨張防止） ---
    alien_disc:1.45, alien_goo:0.94, amenity_bag:1.02, backdrop_cloth:1.03, bag_delivery:0.77, bento_box:1.28,
    box_books:1.06, box_cake:0.94, box_carry:0.94, box_champagne:0.45, box_champagne_glass:0.87, box_cushion:0.97,
    box_fan:0.96, box_fruit:0.85, box_hairdye:1.01, box_incense:0.9, box_intl:1.0, box_iron:0.9,
    box_perfume:0.4, box_photo:0.97, box_photos:1.02, box_shoes:1.25, box_spice:1.1, box_veggie:1.07,
    box_watch:0.83, breadcrumbs:1.59, can_ashtray:1.03, candy_bag:0.81, cat_food_can:1.82, catalog:0.97,
    cd_stack:0.88, champagne_glass:0.35, cleaning_set:0.94, clothesline_rope:3.28, clothespin:0.4, clothespins:1.9,
    condensation:0.84, cooler_bag:0.87, cupnoodle_tower:0.46, delivery_bag:1.08, delivery_notice:0.99, deterrent_disc:0.68,
    diary:0.88, director_chair:0.82, dust_layer:1.26, egg:0.83, empty_clothesline:1.18, empty_corner:1.44,
    empty_doormat:1.55, empty_shelf:0.93, eyelash_case:0.95, fan_towel:1.65, feathers:1.12, gateball_mallet:0.55,
    gloves:1.02, glow_bracelet:1.46, glowing_plant:0.79, guitar_case:0.49, gym_bag:1.16, gym_gloves:1.21,
    gym_uniform_kids:0.98, incense:0.4, kairanban:0.93, kimono:0.88, laundry_pole:1.54, laundry_white:1.37,
    leggings:0.8, magazines:1.13, magnet:0.91, mail_air:1.32, mailbox:1.04, map:1.29,
    med_notebook:0.88, metal_box:1.02, monitor:0.93, nail_case:1.12, nameplate:1.33, necktie:0.76,
    newspaper:1.25, nurse_shoes:1.15, party_decor:1.11, penlight:0.63, pigeon:0.86, platform_shoes:1.27,
    postcard:1.25, poster_tube:0.91, pullup_bar:1.52, ring_light:0.53, rolled_poster:1.19, safety_net:0.8,
    sailor_uniform:0.77, sakaki_branch:0.56, sandal_glitter:1.29, scissor_case:1.02, shoe_pile:1.13, sleeping_bag:1.25,
    slippers:1.37, spacesuit:1.17, stage_costume:0.78, stepladder:0.66, sun_cushion:1.49, sunglasses:1.61,
    swim_ring:1.35, synth_keyboard:0.62, taiso_card:0.71, tapestry:0.93, tent:1.19, tickets:1.13,
    toolbox:0.97, toothbrush_cup:0.9, trash_bag:0.92, tumbler:0.55, twigs:1.29, uchiwa_ita:0.84,
    vacancy_sign:0.79, vacuum_bag:1.54, wall_green:0.85, welcome_board:0.88, white_gloves:1.02, white_robe:0.73,
    window_dark:0.9, work_gloves:1.26,
  };

  // 「N着/N枚/N本…」や「大量」を絵の個数に反映（最大3）。既に山/タワー等で複数を表す絵は増やさない。
  const MULTI_SKIP = { box_stack: 1, can_tower: 1, chairs: 1, firewood: 1, bowls: 1, sack: 1, papers: 1, box_bottles: 1 };
  function itemCount(label, key) {
    if (MULTI_SKIP[key] || !label) return 1;
    const m = label.match(/(\d+)\s*(着|枚|本|足|個|台|匹|冊|杯|箱|束|袋|色|セット)/);
    if (m) return Math.min(Math.max(parseInt(m[1], 10), 1), 3);
    if (/大量|たくさん|いっぱい|複数/.test(label)) return 3;
    return 1;
  }

  // s: { accent, mansionId, curtain, curtainClosed, light, rain, silhouette, items:[...] }
  // 背景=assets/balcony/{mansionId}.png / 小物=assets/items/{variant||kind}.png。1アイテム=1セル(接地影＋微ゆらぎ)。
  function scene(s) {
    const mid = s.mansionId || ACCENT_MANSION[s.accent] || 'resort';
    const items = s.items || [];
    const isHang = (it) => (it.zone || (it.hang ? 'hang' : 'floor')) === 'hang';
    const hang = [], floor = [];
    items.forEach((it, i) => { (isHang(it) ? hang : floor).push({ it, i }); });
    const cell = (o, k) => {
      const key = o.it.variant || o.it.kind || 'box';
      const cls = 'sc-i' + (o.it.fresh ? ' fresh' : '') + (o.it.strong ? ' strong' : '');
      const rot = [-2, 3, -3, 2, -4, 3, -1][k % 7];    // 軽い傾き(deg)
      const jit = [1, 0.97, 1.04, 0.98, 1.02, 0.96][k % 6]; // 軽い揺らぎ
      // 表示高さ係数(実物基準) × 画像アスペクト(w/h) → 表示幅%。縦長の絵が縦に巨大化しない。
      const w = Math.max(4, Math.min(38, (SIZE[key] || 0.9) * (ASPECT[key] || 1) * 18 * jit));
      const dy = [0, 3, -2, 4, 1, -3][k % 6];          // 接地の微上下(%)
      const src = 'assets/items/' + key + '.webp';
      const n = itemCount(o.it.label, key);            // 個数（1〜3）をヒント文から
      const OFF = [-32, 34, -60];                       // 追加コピーの横オフセット%
      let extra = '';
      for (let i = 0; i < n - 1 && i < OFF.length; i++) {
        extra += '<img class="' + cls + ' sc-x" style="--exx:' + OFF[i] + '%" src="' + src + '" alt="" onerror="this.style.visibility=\'hidden\'">';
      }
      return '<div class="sc-cell' + (n > 1 ? ' sc-multi' : '') + '" style="--w:' + w.toFixed(1) + '%;--rot:' + rot + 'deg;--dy:' + dy + '%" onclick="UI.itemTap(' + o.i + ')">' +
        '<span class="sc-sh"></span>' + extra +
        '<img class="' + cls + '" src="' + src + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
        '</div>';
    };
    // カーテン有り＆開いた時は背景を室内イラストに切替。初回だけカーテンが左右に開く演出。
    const roomOpen = !!(s.curtain && !s.curtainClosed);
    const bgDir = roomOpen ? 'room' : 'balcony';
    let fx = '';
    if (LIGHT[mid]) fx += '<div class="sc-fx sc-tint" style="background:' + LIGHT[mid] + '"></div>';
    if (s.light && !roomOpen) fx += '<div class="sc-fx sc-glow"></div>';
    if (s.silhouette) fx += '<div class="sc-fx sc-sil"></div>';
    if (s.rain) fx += '<div class="sc-fx sc-rain"></div>';
    if (roomOpen && !s.curtainShown) fx += '<div class="sc-open"><span class="sc-cl-l"></span><span class="sc-cl-r"></span></div>';
    return '<div class="sc-wrap" style="background-image:url(assets/' + bgDir + '/' + mid + '.webp)">' +
      '<div class="sc-row sc-hang">' + hang.map(cell).join('') + '</div>' +
      '<div class="sc-row sc-floor">' + floor.map(cell).join('') + '</div>' +
      fx + '</div>';
  }

  // 単体アイテムのSVG（ギャラリー/デバッグ用）
  function itemSVG(spec, color, size) {
    const vdef = spec.variant && VARIANTS[spec.variant];
    const draw = vdef ? vdef.draw : (ITEMS[spec.kind] || ITEMS.box);
    const hang = vdef ? !!vdef.hang : HANG_KINDS.indexOf(spec.kind) !== -1;
    const vb = hang ? '-30 -6 60 66' : '-30 -58 60 64';
    return '<svg viewBox="' + vb + '" width="' + (size || 72) + '" aria-hidden="true">' +
      (hang ? '<path d="M-30 0 h60" stroke="#c8d0dc" stroke-width="2"/>' : '<path d="M-30 2 h60" stroke="#c8d0dc" stroke-width="2"/>') +
      draw(color || '#9fc0e8') + '</svg>';
  }

  root.VT_scene = scene;
  root.VT_itemSVG = itemSVG;
  root.VT_hintColor = hintColor;
  root.VT_classify = classify;
  root.VT_VARIANTS = VARIANTS;
  root.VT_HANG_KINDS = HANG_KINDS;
  root.VT_ITEM_KINDS = ITEM_KINDS;
  root.VT_SECRET_ITEMS = SECRET_ITEMS;
  if (typeof module !== 'undefined') module.exports = { scene, hintColor, classify, VARIANTS, RULES, HANG_KINDS, ITEM_KINDS, SECRET_ITEMS };
})(typeof window !== 'undefined' ? window : globalThis);
