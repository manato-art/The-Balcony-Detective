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
  };

  // [正規表現, バリアント名, 対象kind（省略=全kind）]
  const RULES = [
    [/レース/, 'lace'],
    [/ドレス|ワンピース|衣装|ガウン/, 'dress'],
    [/タオル|背景布/, 'towel'],
    [/ジャージ|ユニフォーム|体操服/, 'jersey'],
    [/タンクトップ/, 'tank'],
    [/布団/, 'futon'],
    [/スカート|制服/, 'skirt'],
    [/法被/, 'happi'],
    [/スクラブ|白衣|白装束/, 'scrub'],
    [/柔道着|道着/, 'judo'],
    [/ドライフラワー|ハーブ|榊/, 'dryflower'],
    [/風鈴/, 'chime'],
    [/コスメ|化粧品|美容液|デパコス/, 'box_cosme'],
    [/シャンパングラスが/, 'flute', ['star']],
    [/シャンパン|ドンペリ/, 'box_crate', ['box']],
    [/機材|銀色|工具|無線/, 'box_case', ['box']],
    [/鶏むね|保冷|米|野菜|肉/, 'box_cool', ['box']],
    [/CD|台本|経済書|社内報|回覧|レシピ本|日記|雑誌|の本/, 'books'],
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
    [/薔薇|花束/, 'bouquet'],
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
    [/提灯/, 'lantern'],
    [/蜘蛛の巣/, 'cobweb'],
    [/ビールケース/, 'pcase'],
    [/アイマスク/, 'eyemask'],
    [/帽子/, 'hat_item', ['laundry']],
    [/盛り塩/, 'salt', ['alert']],
    [/メーター/, 'meter', ['alert']],
    [/お札|御札/, 'ofuda_v', ['alert']],
    [/ウィッグ/, 'wig', ['mirror']],
  ];

  function classify(text, kind) {
    for (const r of RULES) {
      if (r[0].test(text) && (!r[2] || r[2].indexOf(kind) !== -1)) return r[1];
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

    // アイテム（後列→前列の順に描画）
    const backM = [], frontM = [];
    (s.items || []).forEach((it, i) => {
      ((it.zone === 'back') ? backM : frontM).push(itemMarkup(it, i));
    });
    svg += backM.join('') + frontM.join('');

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
  root.VT_classify = classify;
  root.VT_VARIANTS = VARIANTS;
  root.VT_HANG_KINDS = HANG_KINDS;
  root.VT_ITEM_KINDS = ITEM_KINDS;
  if (typeof module !== 'undefined') module.exports = { scene, hintColor, classify, VARIANTS, RULES, HANG_KINDS, ITEM_KINDS };
})(typeof window !== 'undefined' ? window : globalThis);
