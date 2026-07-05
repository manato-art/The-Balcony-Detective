// ベランダ探偵 — キャラクター描画（マスコット + 住人アバター / フラットSVG）
(function (root) {

  /* ================= マスコット: ハト探偵ポッポ ================= */
  // pose: base(虫眼鏡) / point(指差し) / happy(喜び) / shock(驚き)
  function mascot(pose, size) {
    size = size || 160;
    const P = pose || 'base';
    let wings = '', extras = '', eyes = '', beak = '';

    if (P === 'happy') {
      wings = '<path d="M46 96 Q18 70 26 48 Q46 58 56 84 Z" fill="#9fb4d1"/>' +
              '<path d="M154 96 Q182 70 174 48 Q154 58 144 84 Z" fill="#9fb4d1"/>';
      eyes = '<path d="M64 88 q12 -14 24 0" stroke="#2e3a4d" stroke-width="6" fill="none" stroke-linecap="round"/>' +
             '<path d="M112 88 q12 -14 24 0" stroke="#2e3a4d" stroke-width="6" fill="none" stroke-linecap="round"/>';
      beak = '<path d="M88 100 q12 14 24 0 l-12 12 Z" fill="#f5a623"/><path d="M90 103 q10 10 20 0 q-4 9 -10 9 t-10 -9Z" fill="#d9822b"/>';
      extras = star(30, 42, 7, '#ffc800') + star(172, 36, 9, '#ffc800') + star(184, 92, 6, '#ff86d0');
    } else if (P === 'shock') {
      wings = '<path d="M52 110 Q34 92 44 78 Q60 86 62 104 Z" fill="#9fb4d1"/>' +
              '<path d="M148 110 Q166 92 156 78 Q140 86 138 104 Z" fill="#9fb4d1"/>';
      eyes = eye(76, 88, 17, 4.5) + eye(124, 88, 17, 4.5);
      beak = '<ellipse cx="100" cy="108" rx="10" ry="12" fill="#d9822b"/><path d="M88 100 l12 -6 12 6 -12 6 Z" fill="#f5a623"/>';
      extras = '<path d="M170 60 q6 10 0 16 q-6 -6 0 -16Z" fill="#7cc7ff"/>' +
               '<path d="M56 40 l6 10 M68 34 l2 12 M44 50 l10 6" stroke="#8fa3bd" stroke-width="4" stroke-linecap="round"/>';
    } else if (P === 'point') {
      wings = '<path d="M46 118 Q28 108 30 92 Q46 96 54 110 Z" fill="#9fb4d1"/>' +
              '<path d="M140 92 Q168 60 186 52 Q184 74 156 100 Z" fill="#9fb4d1"/>' +
              '<circle cx="184" cy="52" r="9" fill="#9fb4d1"/>';
      eyes = eye(76, 88, 16, 7) + eye(124, 88, 16, 7);
      beak = '<path d="M86 100 l14 -5 14 5 -14 9 Z" fill="#f5a623"/><path d="M92 106 q8 8 16 0 l-8 8 Z" fill="#d9822b"/>';
    } else {
      wings = '<path d="M46 118 Q28 108 30 92 Q46 96 54 110 Z" fill="#9fb4d1"/>' +
              '<path d="M138 100 Q150 84 148 72 Q160 80 158 96 Q152 106 142 108 Z" fill="#9fb4d1"/>';
      eyes = eye(76, 88, 16, 7) + eye(124, 88, 16, 7);
      beak = '<path d="M86 100 l14 -5 14 5 -14 9 Z" fill="#f5a623"/>';
      extras = '<circle cx="158" cy="86" r="17" fill="#bfe6ff" fill-opacity=".45" stroke="#5b6b7f" stroke-width="6"/>' +
               '<path d="M170 99 L184 120" stroke="#8a5a3a" stroke-width="9" stroke-linecap="round"/>';
    }

    return '<svg viewBox="0 0 200 200" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<ellipse cx="100" cy="190" rx="52" ry="7" fill="#000" opacity=".08"/>' +
      '<path d="M64 168 Q46 182 34 180 Q44 168 56 158 Z" fill="#8fa6c4"/>' +
      '<ellipse cx="100" cy="120" rx="62" ry="66" fill="#c3d3e8"/>' +
      '<ellipse cx="100" cy="146" rx="40" ry="36" fill="#e9f0fa"/>' +
      '<path d="M68 118 q32 -18 64 0 q-10 -16 -32 -16 t-32 16Z" fill="#35d0ba"/>' +
      '<path d="M76 112 q24 -12 48 0 q-8 -10 -24 -10 t-24 10Z" fill="#b892ff" opacity=".85"/>' +
      wings +
      '<path d="M84 182 l-4 12 M90 182 l0 12 M96 182 l4 12" stroke="#f0925a" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<path d="M104 182 l-4 12 M110 182 l0 12 M116 182 l4 12" stroke="#f0925a" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      eyes + '<ellipse cx="100" cy="97" rx="6" ry="4" fill="#f4f7fc"/>' + beak +
      // ディアストーカー帽
      '<path d="M50 62 Q50 26 100 26 Q150 26 150 62 L150 68 Q100 56 50 68 Z" fill="#c99b66"/>' +
      '<path d="M50 64 Q100 52 150 64 L150 72 Q100 60 50 72 Z" fill="#96683a"/>' +
      '<ellipse cx="44" cy="66" rx="14" ry="7" fill="#b8875a" transform="rotate(-14 44 66)"/>' +
      '<ellipse cx="156" cy="66" rx="14" ry="7" fill="#b8875a" transform="rotate(14 156 66)"/>' +
      '<circle cx="100" cy="26" r="6" fill="#96683a"/>' +
      '<path d="M72 38 Q100 30 128 38 M62 50 Q100 40 138 50" stroke="#b8875a" stroke-width="3" fill="none" opacity=".8"/>' +
      extras +
      '</svg>';
  }

  function eye(cx, cy, r, pr) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff"/>' +
      '<circle cx="' + cx + '" cy="' + (cy + 2) + '" r="' + pr + '" fill="#2e3a4d"/>' +
      '<circle cx="' + (cx + 2.5) + '" cy="' + (cy - 1) + '" r="' + (pr * .35) + '" fill="#fff"/>';
  }
  function star(cx, cy, r, c) {
    return '<path d="M' + cx + ' ' + (cy - r) + ' L' + (cx + r * .3) + ' ' + (cy - r * .3) + ' L' + (cx + r) + ' ' + cy +
      ' L' + (cx + r * .3) + ' ' + (cy + r * .3) + ' L' + cx + ' ' + (cy + r) + ' L' + (cx - r * .3) + ' ' + (cy + r * .3) +
      ' L' + (cx - r) + ' ' + cy + ' L' + (cx - r * .3) + ' ' + (cy - r * .3) + ' Z" fill="' + c + '"/>';
  }

  /* ================= 住人アバター ================= */
  const SKIN = { light: '#ffd9b3', tan: '#e8a86c', pale: '#f3e3d3', ghost: '#e4eef0' };

  // 髪 (style, color) — head: circle cx60 cy56 r32
  function hair(style, c) {
    const half = '<path d="M28 56 A32 32 0 0 1 92 56 Z" fill="' + c + '"/>';
    switch (style) {
      case 'short': return half;
      case 'messy': return half + '<path d="M28 56 l8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8 Z" fill="' + c + '" transform="translate(0 -1)"/>';
      case 'spiky': return half + '<path d="M34 40 l4 -14 6 12 6 -16 6 14 6 -16 6 16 6 -12 4 12" stroke="' + c + '" stroke-width="8" fill="' + c + '" stroke-linejoin="round"/>';
      case 'bob': return half + '<path d="M28 54 h10 v26 q-10 -2 -10 -12 Z" fill="' + c + '"/><path d="M92 54 h-10 v26 q10 -2 10 -12 Z" fill="' + c + '"/>';
      case 'mash': return '<path d="M28 60 A32 32 0 0 1 92 60 L92 64 Q60 56 28 64 Z" fill="' + c + '"/>';
      case 'long': return '<path d="M24 56 q0 -34 36 -34 t36 34 v40 q0 12 -12 12 h-48 q-12 0 -12 -12 Z" fill="' + c + '" opacity=".999"/>';
      case 'bun': return half + '<circle cx="60" cy="20" r="11" fill="' + c + '"/>';
      case 'twin': return half + '<ellipse cx="20" cy="76" rx="10" ry="20" fill="' + c + '"/><ellipse cx="100" cy="76" rx="10" ry="20" fill="' + c + '"/>';
      case 'pony': return half + '<ellipse cx="94" cy="82" rx="9" ry="22" fill="' + c + '" transform="rotate(-18 94 82)"/>';
      case 'curly': return half + '<circle cx="30" cy="52" r="9" fill="' + c + '"/><circle cx="42" cy="40" r="9" fill="' + c + '"/><circle cx="60" cy="34" r="10" fill="' + c + '"/><circle cx="78" cy="40" r="9" fill="' + c + '"/><circle cx="90" cy="52" r="9" fill="' + c + '"/>';
      case 'bald': return '<path d="M30 50 q4 -6 10 -6 v10 q-6 0 -10 -4Z" fill="' + c + '"/><path d="M90 50 q-4 -6 -10 -6 v10 q6 0 10 -4Z" fill="' + c + '"/>';
      case 'thin': return '<path d="M28 54 q2 -10 12 -14 v18 q-8 0 -12 -4Z" fill="' + c + '"/><path d="M92 54 q-2 -10 -12 -14 v18 q8 0 12 -4Z" fill="' + c + '"/><ellipse cx="60" cy="30" rx="12" ry="5" fill="' + c + '"/>';
      case 'center': return '<path d="M28 56 A32 32 0 0 1 92 56 Z" fill="' + c + '"/><path d="M60 24 l-6 20 h12 Z" fill="' + (style === 'center' ? '#00000000' : c) + '"/><path d="M60 26 l-5 16 10 0 Z" fill="rgba(0,0,0,.12)"/>';
      default: return half;
    }
  }

  // 帽子・被り物
  function hat(type, c) {
    switch (type) {
      case 'cap': return '<path d="M30 46 Q30 20 60 20 T90 46 Z" fill="' + c + '"/><path d="M84 42 q22 -2 26 6 q-14 6 -28 2 Z" fill="' + c + '"/>';
      case 'police': return '<path d="M28 44 Q28 22 60 22 T92 44 L92 50 H28 Z" fill="' + c + '"/><path d="M40 50 h40 q10 0 12 6 h-64 q2 -6 12 -6Z" fill="#22304a"/><circle cx="60" cy="36" r="6" fill="#ffc800"/>';
      case 'hood': return '<path d="M20 66 Q16 14 60 14 T100 66 Q100 78 88 76 Q92 34 60 34 T32 76 Q20 78 20 66Z" fill="' + c + '"/>';
      case 'crown': return '<path d="M40 26 l6 -14 8 10 6 -14 6 14 8 -10 6 14 Z" fill="#ffc800"/><rect x="40" y="24" width="40" height="6" rx="3" fill="#e6a800"/>';
      case 'band': return '<rect x="27" y="40" width="66" height="10" rx="5" fill="' + c + '"/>';
      case 'nurse': return '<path d="M42 26 h36 l-4 12 h-28 Z" fill="#fff" stroke="#e5e5e5"/><path d="M60 29 v6 M57 32 h6" stroke="#ff4b4b" stroke-width="2.5"/>';
      default: return '';
    }
  }

  // 小物
  function acc(a) {
    switch (a) {
      case 'glasses': return '<circle cx="49" cy="58" r="8" fill="none" stroke="#3c3c3c" stroke-width="2.5"/><circle cx="71" cy="58" r="8" fill="none" stroke="#3c3c3c" stroke-width="2.5"/><path d="M57 58 h6" stroke="#3c3c3c" stroke-width="2.5"/>';
      case 'sunglasses': return '<rect x="40" y="52" width="17" height="12" rx="5" fill="#2e2e3e"/><rect x="63" y="52" width="17" height="12" rx="5" fill="#2e2e3e"/><path d="M57 57 h6" stroke="#2e2e3e" stroke-width="3"/>';
      case 'mask': return '<rect x="44" y="62" width="32" height="18" rx="8" fill="#fff" stroke="#e5e5e5"/><path d="M44 66 L30 60 M76 66 L90 60" stroke="#d8d8d8" stroke-width="2"/>';
      case 'lashes': return '<path d="M42 54 l-5 -3 M45 51 l-4 -4 M78 54 l5 -3 M75 51 l4 -4" stroke="#3c3c3c" stroke-width="2" stroke-linecap="round"/>';
      case 'stubble': return '<g fill="#7a6a5a" opacity=".55"><circle cx="52" cy="74" r="1.4"/><circle cx="58" cy="77" r="1.4"/><circle cx="64" cy="77" r="1.4"/><circle cx="70" cy="74" r="1.4"/><circle cx="55" cy="80" r="1.4"/><circle cx="66" cy="80" r="1.4"/></g>';
      case 'earring': return '<circle cx="30" cy="66" r="3" fill="#ffc800"/><circle cx="90" cy="66" r="3" fill="#ffc800"/>';
      case 'tear': return '<path d="M76 66 q5 6 0 10 q-5 -4 0 -10Z" fill="#7cc7ff"/>';
      case 'sweat': return '<path d="M88 44 q5 7 0 11 q-5 -4 0 -11Z" fill="#7cc7ff"/>';
      case 'mic': return '<rect x="92" y="108" width="7" height="22" rx="3" fill="#5b6b7f" transform="rotate(14 95 118)"/><circle cx="98" cy="104" r="9" fill="#3c3c3c"/><circle cx="98" cy="104" r="9" fill="none" stroke="#8a8a8a" stroke-width="2" stroke-dasharray="2.5 2.5"/>';
      case 'dumbbell': return '<g transform="translate(0 4)"><rect x="10" y="112" width="8" height="22" rx="3" fill="#5b6b7f"/><rect x="30" y="112" width="8" height="22" rx="3" fill="#5b6b7f"/><rect x="15" y="119" width="18" height="7" rx="3" fill="#8a9bb0"/></g>';
      case 'scissors': return '<g transform="rotate(-30 96 116)"><path d="M96 100 l0 22 M90 104 l12 16" stroke="#8a9bb0" stroke-width="3" stroke-linecap="round"/><circle cx="94" cy="124" r="4" fill="none" stroke="#8a9bb0" stroke-width="3"/><circle cx="104" cy="122" r="4" fill="none" stroke="#8a9bb0" stroke-width="3"/></g>';
      case 'crystal': return '<circle cx="60" cy="128" r="14" fill="#ce82ff" opacity=".85"/><circle cx="55" cy="123" r="4" fill="#fff" opacity=".7"/><path d="M44 138 h32 l3 6 h-38 Z" fill="#8a63b8"/>';
      case 'glass': return '<path d="M94 100 l10 0 -3 12 -4 0 Z" fill="#fff2cf" stroke="#e0c98f"/><path d="M99 112 v12 M94 126 h10" stroke="#e0c98f" stroke-width="2.5"/>';
      case 'guitar': return '<path d="M18 96 L44 128" stroke="#8a5a3a" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="94" r="4" fill="#5b3d26"/><ellipse cx="46" cy="132" rx="13" ry="11" fill="#c99b66"/><circle cx="46" cy="132" r="4" fill="#5b3d26"/>';
      case 'ofuda': return '<g transform="rotate(8 92 116)"><rect x="86" y="100" width="14" height="30" rx="2" fill="#fff" stroke="#e5e5e5"/><path d="M93 104 v20 M89 108 h8 M89 114 h8" stroke="#ff4b4b" stroke-width="2"/></g>';
      case 'rose': return '<circle cx="42" cy="104" r="6" fill="#ff4b4b"/><circle cx="42" cy="104" r="2.5" fill="#c53030"/><path d="M42 110 v6" stroke="#3a7f3a" stroke-width="2"/>';
      case 'cloth': return '<path d="M88 104 q14 -4 22 4 q-4 12 -16 12 q-8 -2 -6 -16Z" fill="#ffb8d1"/><path d="M92 108 q8 -2 14 2" stroke="#ff8fb5" stroke-width="2" fill="none"/>';
      case 'armband': return '<rect x="22" y="100" width="14" height="10" rx="3" fill="#ff4b4b"/>';
      case 'sparkle': return star(26, 36, 6, '#ffc800') + star(96, 30, 7, '#ffc800') + star(104, 76, 5, '#ff86d0');
      case 'chart': return '<g transform="translate(84 100)"><rect x="0" y="0" width="26" height="20" rx="3" fill="#fff" stroke="#e5e5e5"/><path d="M4 14 l6 -6 4 3 8 -8" stroke="#58cc02" stroke-width="2.5" fill="none"/></g>';
      case 'badge': return '<circle cx="42" cy="102" r="5" fill="#ffc800"/><path d="M42 99 l1 2 2 0 -1.6 1.4 .6 2.2 -2 -1.3 -2 1.3 .6 -2.2 -1.6 -1.4 2 0Z" fill="#e6a800"/>';
      case 'leopard': return '<g fill="#7a5514" opacity=".8"><circle cx="42" cy="106" r="3"/><circle cx="56" cy="116" r="3"/><circle cx="72" cy="106" r="3"/><circle cx="64" cy="130" r="3"/><circle cx="46" cy="128" r="3"/><circle cx="78" cy="122" r="3"/></g>';
      case 'ribbon': return '<path d="M52 96 l8 5 8 -5 -2 8 2 8 -8 -5 -8 5 2 -8 Z" fill="#ff86d0"/>';
      case 'necklace': return '<path d="M46 96 q14 12 28 0" stroke="#ffc800" stroke-width="2.5" fill="none"/><circle cx="60" cy="103" r="3" fill="#ffc800"/>';
      case 'headset': return '<path d="M30 50 a30 30 0 0 1 60 0" stroke="#3c3446" stroke-width="5" fill="none"/><rect x="24" y="46" width="11" height="17" rx="4" fill="#3c3446"/><rect x="85" y="46" width="11" height="17" rx="4" fill="#3c3446"/><path d="M30 62 q-7 9 8 11" stroke="#3c3446" stroke-width="3" fill="none"/><circle cx="40" cy="73" r="3" fill="#3c3446"/>';
      case 'cat': return '<g transform="translate(90 92)"><circle cx="0" cy="0" r="9.5" fill="#e0a437"/><path d="M-6 -6 l-3.5 -7 6 2.5Z" fill="#e0a437"/><path d="M6 -6 l3.5 -7 -6 2.5Z" fill="#e0a437"/><circle cx="-3" cy="-1" r="1.3" fill="#3c3446"/><circle cx="3" cy="-1" r="1.3" fill="#3c3446"/><path d="M-1.5 2.5 q1.5 1.5 3 0" stroke="#3c3446" stroke-width="1.2" fill="none"/></g>';
      default: return '';
    }
  }

  // 口
  function mouth(type) {
    if (type === 'open') return '<ellipse cx="60" cy="71" rx="6" ry="5" fill="#a2543f"/>';
    if (type === 'flat') return '<path d="M54 71 h12" stroke="#a2543f" stroke-width="2.5" stroke-linecap="round"/>';
    if (type === 'frown') return '<path d="M54 73 q6 -5 12 0" stroke="#a2543f" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    return '<path d="M54 69 q6 5 12 0" stroke="#a2543f" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  }

  function torso(c, opts) {
    opts = opts || {};
    let t = '<path d="M26 150 v-24 q0 -24 34 -24 t34 24 v24 Z" fill="' + c + '"/>';
    if (opts.wide) t = '<path d="M14 150 v-20 q0 -30 46 -30 t46 30 v20 Z" fill="' + c + '"/>' +
      '<circle cx="18" cy="122" r="12" fill="' + (opts.skin || SKIN.light) + '"/><circle cx="102" cy="122" r="12" fill="' + (opts.skin || SKIN.light) + '"/>';
    if (opts.vneck) t += '<path d="M48 102 l12 14 12 -14 Z" fill="' + (opts.skin || SKIN.light) + '"/>';
    if (opts.tie) t += '<path d="M56 102 h8 l-2 6 h-4 Z" fill="' + opts.tie + '"/><path d="M58 108 h4 l3 22 -5 8 -5 -8 Z" fill="' + opts.tie + '"/>';
    if (opts.collar) t += '<path d="M46 102 l14 10 14 -10 -6 -4 -8 6 -8 -6 Z" fill="#fff"/>';
    if (opts.apron) t += '<path d="M38 116 h44 v34 h-44 Z" fill="' + opts.apron + '"/><path d="M38 116 q22 -8 44 0" stroke="' + opts.apron + '" stroke-width="5" fill="none"/>';
    if (opts.buttons) t += '<circle cx="60" cy="116" r="2.2" fill="#fff"/><circle cx="60" cy="128" r="2.2" fill="#fff"/><circle cx="60" cy="140" r="2.2" fill="#fff"/>';
    return t;
  }

  function head(skin) { return '<circle cx="60" cy="56" r="32" fill="' + skin + '"/>'; }
  function neck(skin) { return '<rect x="51" y="76" width="18" height="30" rx="5" fill="' + skin + '"/>'; }

  function face(cfg) {
    let e;
    if (cfg.eye === 'happy') e = '<path d="M44 58 q5 -6 10 0 M66 58 q5 -6 10 0" stroke="#3c3c3c" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    else if (cfg.eye === 'sleepy') e = '<path d="M45 58 h8 M67 58 h8" stroke="#3c3c3c" stroke-width="2.5" stroke-linecap="round"/>';
    else if (cfg.eye === 'sharp') e = '<circle cx="49" cy="59" r="3.2" fill="#3c3c3c"/><circle cx="71" cy="59" r="3.2" fill="#3c3c3c"/><path d="M43 51 l12 3 M77 51 l-12 3" stroke="#3c3c3c" stroke-width="2.5" stroke-linecap="round"/>';
    else e = '<circle cx="49" cy="58" r="3.4" fill="#3c3c3c"/><circle cx="71" cy="58" r="3.4" fill="#3c3c3c"/>';
    const b = cfg.blush === false ? '' : '<circle cx="42" cy="66" r="4.5" fill="#ff9d9d" opacity=".4"/><circle cx="78" cy="66" r="4.5" fill="#ff9d9d" opacity=".4"/>';
    return e + b + mouth(cfg.mouth);
  }

  /* ---- 住人ごとの見た目定義 ---- */
  const AVATARS = {
    joshidai:  { skin: 'light', hair: ['long', '#a06a45'], top: '#ffd3e0', accs: [], f: {} },
    danshidai: { skin: 'light', hair: ['messy', '#3b3b3b'], top: '#6ea8fe', accs: [], f: { mouth: 'open' } },
    ol:        { skin: 'light', hair: ['bob', '#3b3b3b'], top: '#fff2cf', topOpts: { collar: true }, accs: ['earring'], f: {} },
    kaishain:  { skin: 'light', hair: ['short', '#3b3b3b'], top: '#44546e', topOpts: { tie: '#d64545' }, accs: [], f: { eye: 'sleepy', mouth: 'flat', blush: false } },
    shufu:     { skin: 'light', hair: ['bun', '#5a4632'], top: '#fff', topOpts: { apron: '#8fd694' }, accs: [], f: {} },
    family:    { special: 'family' },
    obachan:   { skin: 'light', hair: ['curly', '#b28fc9'], top: '#e0a437', accs: ['leopard', 'lashes', 'earring'], f: { mouth: 'open' } },
    ojisan:    { skin: 'light', hair: ['thin', '#6b6b6b'], top: '#dfe6ee', accs: ['stubble'], f: { eye: 'sleepy', mouth: 'flat', blush: false } },
    kyaba:     { skin: 'light', hair: ['curly', '#f7c948'], top: '#ff5c8a', accs: ['lashes', 'earring', 'necklace', 'sparkle'], f: {} },
    host:      { skin: 'light', hair: ['spiky', '#d9dde3'], top: '#2e2e3e', topOpts: { vneck: true }, accs: ['rose'], f: { eye: 'sharp', blush: false } },
    minatoku:  { skin: 'light', hair: ['long', '#4a3728'], top: '#fff', topOpts: { collar: false }, accs: ['earring', 'necklace', 'glass'], f: { eye: 'happy' } },
    influencer:{ skin: 'light', hair: ['bob', '#3b3b3b'], top: '#fff', accs: ['sparkle', 'earring'], f: { mouth: 'open' } },
    jirai:     { skin: 'pale', hair: ['twin', '#3b3b3b'], top: '#2e2e3e', accs: ['ribbon', 'tear', 'lashes'], f: { mouth: 'frown' } },
    gyaru:     { skin: 'tan', hair: ['long', '#ffe08a'], top: '#e0a437', accs: ['leopard', 'lashes'], f: { mouth: 'open' } },
    kinniku:   { special: 'muscle' },
    biyoshi:   { skin: 'light', hair: ['mash', '#a8b6c8'], top: '#2e2e3e', topOpts: { apron: '#454554' }, accs: ['scissors'], f: {} },
    band:      { skin: 'light', hair: ['long', '#3b3b3b'], top: '#2e2e3e', accs: ['guitar'], f: { eye: 'sleepy', blush: false } },
    nurse:     { skin: 'light', hair: ['pony', '#5a4632'], top: '#9fd8e8', accs: [], hat: ['nurse'], f: { eye: 'sleepy', mouth: 'flat' } },
    kanrinin:  { skin: 'light', hair: ['bald', '#8a8a8a'], top: '#98a7b5', topOpts: { buttons: true }, hat: ['cap', '#5d6d7e'], accs: ['glasses', 'armband'], f: { mouth: 'flat', blush: false } },
    police:    { skin: 'light', hair: ['short', '#3b3b3b'], top: '#2e3f5c', topOpts: { buttons: true }, hat: ['police', '#2e3f5c'], accs: ['badge'], f: { eye: 'sharp', mouth: 'flat', blush: false } },
    chonaikai: { skin: 'light', hair: ['bald', '#e8e8e8'], top: '#7d8b74', accs: ['armband'], f: { eye: 'happy', mouth: 'open' } },
    minimalist:{ skin: 'light', hair: ['center', '#3b3b3b'], top: '#f5f5f5', accs: [], f: { mouth: 'flat', blush: false } },
    akiya:     { special: 'empty' },
    sharehouse:{ special: 'share' },
    papa:      { skin: 'light', hair: ['thin', '#6b6b6b'], top: '#7d9c86', accs: ['glasses', 'cloth', 'sweat'], f: { mouth: 'frown' } },
    mama:      { skin: 'light', hair: ['bun', '#8a8a8a'], top: '#fff', topOpts: { apron: '#ffb8c6' }, accs: [], f: { eye: 'sleepy', mouth: 'flat' } },
    exidol:    { skin: 'light', hair: ['twin', '#ff9ad5'], top: '#fff', accs: ['mic', 'sparkle', 'ribbon'], f: { eye: 'happy', mouth: 'open' } },
    geino:     { skin: 'light', hair: ['short', '#3b3b3b'], top: '#2e2e3e', hat: ['cap', '#1f1f2b'], accs: ['sunglasses', 'mask'], f: { blush: false } },
    uranai:    { skin: 'light', hair: ['long', '#5a4a6b'], top: '#7d5bb5', hat: ['hood', '#7d5bb5'], accs: ['crystal'], f: { eye: 'sharp', blush: false } },
    reibai:    { skin: 'pale', hair: ['long', '#2e2e3e'], top: '#f5f5ef', accs: ['ofuda'], f: { eye: 'sleepy', mouth: 'flat', blush: false } },
    legendhost:{ skin: 'light', hair: ['spiky', '#e8e2d5'], top: '#f5f5ef', topOpts: { vneck: true }, hat: ['crown'], accs: ['rose', 'necklace', 'sparkle'], f: { eye: 'sharp' } },
    toshika:   { skin: 'light', hair: ['short', '#3b3b3b'], top: '#2e2e3e', accs: ['glasses', 'chart'], f: { mouth: 'flat', blush: false } },
    jiko:      { special: 'ghost' },
    // 追加住人
    freeter:   { skin: 'light', hair: ['messy', '#8b5a3c'], top: '#79b8f0', accs: [], f: { eye: 'sleepy' } },
    zaitaku:   { skin: 'light', hair: ['messy', '#3b3b3b'], top: '#98a7b5', accs: ['glasses'], f: { eye: 'sleepy', mouth: 'flat', blush: false } },
    shinkon:   { special: 'couple' },
    ryugakusei:{ skin: 'tan', hair: ['curly', '#3b3b3b'], top: '#ffc800', accs: [], f: { eye: 'happy', mouth: 'open' } },
    otaku:     { skin: 'light', hair: ['short', '#3b3b3b'], top: '#c94f4f', accs: ['glasses'], f: { mouth: 'open' } },
    camper:    { skin: 'tan', hair: ['short', '#5a4632'], hat: ['cap', '#6b8f5a'], top: '#7d8b74', accs: ['stubble'], f: { eye: 'happy' } },
    gamer:     { skin: 'pale', hair: ['messy', '#3b3b3b'], top: '#2e2e3e', accs: ['headset'], f: { eye: 'sharp', blush: false } },
    yoga:      { skin: 'tan', hair: ['pony', '#5a4632'], top: '#b892f5', accs: [], f: { eye: 'happy' } },
    cosplayer: { skin: 'light', hair: ['twin', '#7cc7ff'], top: '#2e2e3e', accs: ['sparkle', 'lashes'], f: {} },
    kyoju:     { skin: 'light', hair: ['thin', '#8a8a8a'], top: '#8a6f4d', topOpts: { tie: '#5b3d26' }, accs: ['glasses'], f: { mouth: 'flat', blush: false } },
    nekoyashiki:{ skin: 'light', hair: ['bun', '#6b6b6b'], top: '#e8d5b5', accs: ['cat'], f: { eye: 'happy' } },
    tanshin:   { skin: 'light', hair: ['short', '#3b3b3b'], top: '#5b6478', topOpts: { tie: '#7d9c86' }, accs: ['stubble'], f: { eye: 'sleepy', mouth: 'frown', blush: false } },
    oogui:     { skin: 'light', hair: ['bob', '#3b3b3b'], top: '#ffc800', accs: [], f: { mouth: 'open' } },
    fukumen:   { skin: 'pale', hair: ['messy', '#4a4a58'], hat: ['hood', '#4a4a58'], top: '#4a4a58', accs: ['sunglasses'], f: { mouth: 'flat', blush: false } },
    enka:      { skin: 'light', hair: ['bun', '#2e2e3e'], top: '#7d2440', accs: ['earring', 'necklace'], f: { eye: 'happy' } },
    hato:      { special: 'hato' },
    uchujin:   { special: 'alien' },
  };

  function buildStandard(cfg, size) {
    const skin = SKIN[cfg.skin] || SKIN.light;
    const topOpts = Object.assign({ skin: skin }, cfg.topOpts || {});
    let s = '';
    if (cfg.hair && cfg.hair[0] === 'long') s += hair('long', cfg.hair[1]); // 後ろ髪
    s += neck(skin);
    s += torso(cfg.top, topOpts);
    s += head(skin);
    if (cfg.hair && cfg.hair[0] !== 'long') s += hair(cfg.hair[0], cfg.hair[1]);
    else if (cfg.hair) s += '<path d="M28 56 A32 32 0 0 1 92 56 L92 50 Q60 24 28 50 Z" fill="' + cfg.hair[1] + '"/>';
    if (cfg.hat) s += hat(cfg.hat[0], cfg.hat[1]);
    s += face(cfg.f || {});
    (cfg.accs || []).forEach((a) => { s += acc(a); });
    return s;
  }

  function buildSpecial(kind) {
    if (kind === 'empty') {
      return '<circle cx="60" cy="56" r="32" fill="none" stroke="#c8d0dc" stroke-width="3" stroke-dasharray="7 7"/>' +
        '<path d="M26 150 v-24 q0 -24 34 -24 t34 24 v24 Z" fill="none" stroke="#c8d0dc" stroke-width="3" stroke-dasharray="7 7"/>' +
        '<text x="60" y="70" text-anchor="middle" font-size="38" font-weight="900" fill="#aab4c4">?</text>';
    }
    if (kind === 'ghost') {
      return '<g opacity=".8">' +
        neck(SKIN.ghost) +
        '<path d="M26 150 v-24 q0 -24 34 -24 t34 24 v24 Z" fill="#9fb3c8"/>' +
        head(SKIN.ghost) + hair('messy', '#4a5568') +
        '<circle cx="49" cy="58" r="3.4" fill="#3c3c3c"/><circle cx="71" cy="58" r="3.4" fill="#3c3c3c"/>' + mouth('flat') +
        '</g>' +
        '<circle cx="22" cy="100" r="6" fill="#cfe3ef" opacity=".8"/><path d="M22 106 q-6 8 2 14" stroke="#cfe3ef" stroke-width="4" fill="none" opacity=".7"/>' +
        '<circle cx="100" cy="80" r="5" fill="#cfe3ef" opacity=".8"/><path d="M100 85 q6 8 -2 12" stroke="#cfe3ef" stroke-width="3.5" fill="none" opacity=".7"/>';
    }
    if (kind === 'share') {
      const p1 = '<g transform="translate(-24 26) scale(.72)">' + neck(SKIN.light) + torso('#6ea8fe') + head(SKIN.light) + hair('short', '#3b3b3b') + face({}) + '</g>';
      const p2 = '<g transform="translate(24 26) scale(.72)">' + neck(SKIN.tan) + torso('#8fd694') + head(SKIN.tan) + hair('bob', '#5a4632') + face({ eye: 'happy' }) + '</g>';
      const p3 = '<g transform="translate(0 10) scale(.78)">' + neck(SKIN.light) + torso('#ffc800') + head(SKIN.light) + hair('messy', '#8b5a3c') + face({ mouth: 'open' }) + '</g>';
      return p1 + p2 + p3;
    }
    if (kind === 'family') {
      const parent = '<g transform="translate(-16 12) scale(.86)">' + neck(SKIN.light) + torso('#7d9c86') + head(SKIN.light) + hair('short', '#3b3b3b') + face({ eye: 'happy' }) + '</g>';
      const kid = '<g transform="translate(34 74) scale(.48)">' + neck(SKIN.light) + torso('#ffc800') + head(SKIN.light) + hair('messy', '#5a4632') + face({ mouth: 'open' }) + '</g>';
      return parent + kid;
    }
    if (kind === 'hato') {
      return '<ellipse cx="60" cy="146" rx="30" ry="4" fill="#000" opacity=".07"/>' +
        '<path d="M38 132 Q28 140 20 139 Q27 132 34 126Z" fill="#8fa6c4"/>' +
        '<ellipse cx="60" cy="105" rx="36" ry="40" fill="#c3d3e8"/>' +
        '<ellipse cx="60" cy="122" rx="24" ry="21" fill="#e9f0fa"/>' +
        '<path d="M42 104 q18 -11 36 0 q-6 -10 -18 -10 t-18 10Z" fill="#35d0ba"/>' +
        '<circle cx="60" cy="62" r="21" fill="#c3d3e8"/>' +
        '<circle cx="52" cy="58" r="6" fill="#fff"/><circle cx="52" cy="59" r="2.8" fill="#2e3a4d"/>' +
        '<circle cx="68" cy="58" r="6" fill="#fff"/><circle cx="68" cy="59" r="2.8" fill="#2e3a4d"/>' +
        '<path d="M54 68 l6 -3 6 3 -6 5Z" fill="#f5a623"/>' +
        '<path d="M52 142 l-2 7 M57 142 v7 M66 142 l2 7 M71 142 v7" stroke="#f0925a" stroke-width="3.5" stroke-linecap="round"/>';
    }
    if (kind === 'alien') {
      return '<path d="M60 8 v10" stroke="#7ec95e" stroke-width="3"/><circle cx="60" cy="6" r="4" fill="#ffc800"/>' +
        neck('#9fe07a') +
        '<path d="M26 150 v-24 q0 -24 34 -24 t34 24 v24 Z" fill="#cfd6df"/>' +
        '<path d="M40 116 h40" stroke="#aab4c4" stroke-width="2.5"/>' +
        '<ellipse cx="60" cy="52" rx="31" ry="28" fill="#9fe07a"/>' +
        '<ellipse cx="48" cy="52" rx="8" ry="12" fill="#2e3a4d" transform="rotate(-12 48 52)"/>' +
        '<ellipse cx="72" cy="52" rx="8" ry="12" fill="#2e3a4d" transform="rotate(12 72 52)"/>' +
        '<circle cx="46" cy="47" r="2.5" fill="#fff"/><circle cx="70" cy="47" r="2.5" fill="#fff"/>' +
        '<path d="M56 70 q4 3 8 0" stroke="#4c8c3f" stroke-width="2" fill="none"/>';
    }
    if (kind === 'couple') {
      const a = '<g transform="translate(-21 14) scale(.84)">' + neck(SKIN.light) + torso('#6fc7e8') + head(SKIN.light) + hair('short', '#3b3b3b') + face({ eye: 'happy' }) + '</g>';
      const b = '<g transform="translate(23 14) scale(.84)">' + neck(SKIN.light) + torso('#ff9ec7') + head(SKIN.light) + hair('bob', '#8b5a3c') + face({ eye: 'happy' }) + '</g>';
      return a + b + '<path d="M60 18 a4 4 0 0 1 7 -2.6 a4 4 0 0 1 7 2.6 c0 4.5 -7 9 -7 9 s-7 -4.5 -7 -9Z" fill="#ff5c8a"/>';
    }
    if (kind === 'muscle') {
      const skin = SKIN.tan;
      return neck(skin) + torso('#fff', { wide: true, skin: skin }) + head(skin) + hair('short', '#3b3b3b') +
        face({ eye: 'sharp', mouth: 'open' }) + acc('dumbbell') + acc('sweat');
    }
    return '';
  }

  function avatar(id, size) {
    size = size || 96;
    const cfg = AVATARS[id];
    const inner = !cfg ? buildSpecial('empty') : (cfg.special ? buildSpecial(cfg.special) : buildStandard(cfg));
    return '<svg viewBox="0 0 120 150" width="' + size + '" height="' + Math.round(size * 1.25) + '" aria-hidden="true">' + inner + '</svg>';
  }

  /* ================= マンション デフォルメイラスト ================= */
  function win(x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="' + (c || '#eaf6ff') + '"/>'; }

  const BUILDINGS = {
    boro:
      '<rect x="30" y="30" width="76" height="70" rx="3" fill="#e6d3b0"/>' +
      '<rect x="26" y="23" width="84" height="10" rx="3" fill="#a98f6d"/>' +
      '<rect x="36" y="60" width="8" height="26" fill="#d3bd93"/><rect x="92" y="42" width="7" height="34" fill="#d3bd93"/>' +
      win(40, 40, 15, 13, '#cfe3f0') + win(80, 40, 15, 13, '#cfe3f0') + win(40, 62, 15, 13, '#ffe08a') +
      '<rect x="62" y="74" width="16" height="26" rx="2" fill="#8a6f4d"/><circle cx="74" cy="88" r="1.6" fill="#e6d3b0"/>' +
      '<path d="M70 30 l-4 12 5 8" stroke="#b09b74" stroke-width="2" fill="none"/>' +
      '<path d="M96 23 l8 -13 M104 10 l7 5" stroke="#7d8b96" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
      '<path d="M32 100 q4 -7 10 0 Z" fill="#8fbf6a"/>',
    gakusei:
      '<rect x="36" y="20" width="72" height="80" rx="4" fill="#7ec3f7"/>' +
      '<rect x="36" y="20" width="72" height="9" rx="4" fill="#5ba7e0"/>' +
      win(46, 36, 16, 13) + win(78, 36, 16, 13) + win(46, 56, 16, 13, '#ffe08a') + win(78, 56, 16, 13) +
      '<rect x="62" y="78" width="18" height="22" rx="2" fill="#4a90cd"/><path d="M71 78 v22" stroke="#7ec3f7" stroke-width="2"/>' +
      '<circle cx="22" cy="94" r="7" fill="none" stroke="#5b6b7f" stroke-width="2.5"/><circle cx="38" cy="94" r="7" fill="none" stroke="#5b6b7f" stroke-width="2.5"/>' +
      '<path d="M22 94 l7 -12 h6 l3 12 M29 82 h-6" stroke="#5b6b7f" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    hankagai:
      '<rect x="54" y="14" width="44" height="86" rx="3" fill="#f791be"/>' +
      win(62, 24, 12, 10, '#ffe9f4') + win(80, 24, 12, 10, '#ffe08a') + win(62, 42, 12, 10, '#ffe9f4') + win(80, 42, 12, 10, '#ffe9f4') +
      '<rect x="36" y="22" width="16" height="12" rx="2" fill="#ffc800"/><rect x="36" y="38" width="16" height="12" rx="2" fill="#b892f5"/><rect x="36" y="54" width="16" height="12" rx="2" fill="#6fc7e8"/>' +
      '<path d="M40 26 h8 M40 30 h8 M40 42 h8 M40 46 h8 M40 58 h8 M40 62 h8" stroke="#fff" stroke-width="2"/>' +
      '<path d="M54 78 h44 l-4 10 h-36 Z" fill="#fff"/><path d="M58 78 l-3 10 M66 78 l-2 10 M74 78 l-1 10 M82 78 l0 10 M90 78 l1 10" stroke="#f76e9c" stroke-width="3"/>' +
      '<rect x="66" y="88" width="14" height="12" fill="#d16693"/>' + star(76, 8, 7, '#ffc800'),
    tawaman:
      '<rect x="52" y="8" width="40" height="92" rx="4" fill="#b892f5"/>' +
      '<rect x="58" y="14" width="7" height="80" rx="2" fill="#d3bcfa"/><rect x="70" y="14" width="7" height="80" rx="2" fill="#d3bcfa"/><rect x="82" y="14" width="5" height="80" rx="2" fill="#d3bcfa"/>' +
      '<path d="M72 8 v-6" stroke="#8a63b8" stroke-width="3" stroke-linecap="round"/><circle cx="72" cy="1.5" r="2" fill="#ff4b4b"/>' +
      '<rect x="64" y="88" width="16" height="12" rx="2" fill="#e6c368"/>' +
      '<circle cx="26" cy="28" r="8" fill="#fff" opacity=".95"/><circle cx="36" cy="31" r="6" fill="#fff" opacity=".95"/><rect x="18" y="30" width="26" height="6" rx="3" fill="#fff" opacity=".95"/>',
    kogai:
      '<rect x="32" y="34" width="78" height="66" rx="4" fill="#fdeccb"/>' +
      '<rect x="32" y="34" width="78" height="9" rx="4" fill="#8fd694"/>' +
      win(40, 50, 17, 14, '#fff') + win(63, 50, 17, 14, '#fff') + win(86, 50, 17, 14, '#fff') +
      win(40, 74, 17, 14, '#fff') + win(63, 74, 17, 14, '#ffe08a') + win(86, 74, 17, 14, '#fff') +
      '<path d="M40 60 h17 M63 60 h17 M86 60 h17 M40 84 h17 M63 84 h17 M86 84 h17" stroke="#d9c49a" stroke-width="2"/>' +
      '<rect x="17" y="76" width="5" height="24" fill="#8a5a3a"/><circle cx="19" cy="70" r="11" fill="#7ec95e"/><circle cx="12" cy="78" r="7" fill="#8fd694"/>' +
      '<circle cx="124" cy="16" r="8" fill="#ffd166"/><path d="M124 3 v-2 M135 16 h2 M132 8 l2 -2 M132 24 l2 2" stroke="#ffd166" stroke-width="2.5" stroke-linecap="round"/>',
    designers:
      '<rect x="42" y="16" width="58" height="84" rx="2" fill="#cdd4dc"/>' +
      '<rect x="28" y="42" width="48" height="58" rx="2" fill="#aeb7c2"/>' +
      '<rect x="36" y="52" width="26" height="24" rx="2" fill="#eef3f7"/>' +
      '<circle cx="88" cy="30" r="8" fill="#eef3f7"/>' +
      '<rect x="84" y="60" width="10" height="40" fill="#7b8794"/>' +
      '<path d="M28 42 h48" stroke="#98a3b0" stroke-width="2"/>',
    shataku:
      '<rect x="22" y="30" width="96" height="70" rx="3" fill="#f2e3c2"/>' +
      '<rect x="64" y="30" width="13" height="70" fill="#dcc9a2"/>' +
      win(30, 40, 24, 14, '#fff') + win(86, 40, 24, 14, '#fff') + win(30, 64, 24, 14, '#fff') + win(86, 64, 24, 14, '#ffe08a') +
      '<path d="M30 49 h24 M86 49 h24 M30 73 h24 M86 73 h24" stroke="#c9b58c" stroke-width="2.5"/>' +
      '<rect x="66" y="86" width="9" height="14" fill="#8a7a5c"/>' +
      '<rect x="94" y="18" width="16" height="12" rx="3" fill="#98a7b5"/><rect x="98" y="14" width="8" height="5" rx="2" fill="#7b8794"/>' +
      '<rect x="26" y="34" width="10" height="8" rx="2" fill="#4a90cd"/><path d="M29 38 h4" stroke="#fff" stroke-width="2"/>',
    koukyu:
      '<rect x="28" y="36" width="88" height="64" rx="6" fill="#f8f4ec"/>' +
      '<path d="M36 46 h12 v18 a6 6 0 0 1 -12 0 Z" fill="#dceafb" transform="translate(0 0)"/>' +
      '<path d="M58 46 h12 v18 a6 6 0 0 1 -12 0 Z" fill="#dceafb"/>' +
      '<path d="M96 46 h12 v18 a6 6 0 0 1 -12 0 Z" fill="#dceafb"/>' +
      '<path d="M60 82 h24 l4 8 h-32 Z" fill="#e6c368"/><path d="M66 82 l-2 8 M72 82 l0 8 M78 82 l2 8" stroke="#f8f4ec" stroke-width="2"/>' +
      '<rect x="66" y="90" width="12" height="10" fill="#9c8a5f"/>' +
      '<circle cx="34" cy="96" r="6" fill="#6fbf5a"/><circle cx="46" cy="97" r="5" fill="#7ec95e"/><circle cx="108" cy="96" r="6" fill="#6fbf5a"/>' +
      '<path d="M18 100 v-22" stroke="#9c8a5f" stroke-width="3"/><circle cx="18" cy="74" r="4" fill="#ffe08a"/>',
    zakkyo:
      '<rect x="50" y="10" width="44" height="90" rx="3" fill="#7a6da3"/>' +
      win(58, 20, 12, 10, '#5d5382') + win(76, 20, 12, 10, '#ffe08a') + win(58, 38, 12, 10, '#5d5382') + win(76, 38, 12, 10, '#5d5382') +
      '<rect x="96" y="26" width="18" height="14" rx="2" fill="#4a4066"/><circle cx="105" cy="33" r="4.5" fill="#ce82ff"/>' +
      '<rect x="96" y="46" width="18" height="14" rx="2" fill="#3c3455"/><path d="M108 49 a5 5 0 1 0 0 8 a4 4 0 0 1 0 -8Z" fill="#ffc800"/>' +
      '<rect x="96" y="66" width="18" height="14" rx="2" fill="#54486e"/><path d="M99 73 q6 -6 12 0 q-6 6 -12 0Z" fill="#fff"/><circle cx="105" cy="73" r="2" fill="#3c3455"/>' +
      '<rect x="58" y="80" width="28" height="20" fill="#4a4066"/><path d="M62 90 h20" stroke="#8d7fb8" stroke-width="2"/>' +
      '<path d="M60 10 l-6 -8 M54 2 l8 2" stroke="#5d5382" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M84 6 l5 4 5 -4 v4 l-5 3 -5 -3Z" fill="#3c3455"/>',
    resort:
      '<rect x="42" y="26" width="70" height="74" rx="6" fill="#fff"/>' +
      '<rect x="42" y="26" width="70" height="9" rx="4" fill="#6fc7e8"/>' +
      '<path d="M52 44 h14 v14 a7 7 0 0 1 -14 0Z" fill="#cfe8f7"/><path d="M74 44 h14 v14 a7 7 0 0 1 -14 0Z" fill="#cfe8f7"/><path d="M96 44 h10 v14 a5 5 0 0 1 -10 0Z" fill="#cfe8f7"/>' +
      '<path d="M68 100 v-18 a8 8 0 0 1 16 0 v18Z" fill="#6fc7e8"/>' +
      '<path d="M24 100 q-2 -26 6 -42" stroke="#b8804f" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M30 58 q-14 -8 -24 -2 q10 8 24 2Z" fill="#58cc74"/><path d="M30 58 q0 -14 12 -20 q2 12 -12 20Z" fill="#58cc74"/><path d="M30 58 q14 -6 22 4 q-12 6 -22 -4Z" fill="#47b062"/>' +
      '<circle cx="126" cy="14" r="8" fill="#ffd166"/>' +
      '<path d="M20 104 q8 -6 16 0 t16 0 t16 0" stroke="#a8dcf2" stroke-width="3" fill="none" stroke-linecap="round"/>',
  };

  function building(id, size) {
    size = size || 92;
    const inner = BUILDINGS[id] || BUILDINGS.gakusei;
    return '<svg viewBox="0 0 140 110" width="' + size + '" height="' + Math.round(size * 110 / 140) + '" aria-hidden="true">' +
      '<ellipse cx="70" cy="103" rx="54" ry="6" fill="#000" opacity=".07"/>' + inner + '</svg>';
  }

  /* ================= 建物全景（ターン開始時・対象部屋ハイライト） ================= */
  const FACADE_SKY = { amber: '#fff3d6', pink: '#ffe4f0', cyan: '#ddf4ff', purple: '#f0e5ff', green: '#e4f7dd' };
  const FACADE_ROOF = { amber: '#e6b95c', pink: '#f791be', cyan: '#6fb9e8', purple: '#b892f5', green: '#8fd694' };

  function facadeCell(room) {
    const n = parseInt(room, 10);
    const c = (n % 10) - 1;          // 0..4
    const f = Math.floor(n / 100);   // 1..4
    return { x: 40 + c * 50, y: 42 + (4 - f) * 52, w: 42, h: 44 };
  }

  // ズーム原点（%）
  function roomPos(room) {
    const cl = facadeCell(room);
    return { x: Math.round((cl.x + cl.w / 2) / 320 * 100), y: Math.round((cl.y + cl.h / 2) / 292 * 100) };
  }

  function facade(mansion, room, size) {
    size = size || 300;
    const sky = FACADE_SKY[mansion.accent] || '#ddf4ff';
    const roof = FACADE_ROOF[mansion.accent] || '#6fb9e8';
    let cells = '';
    for (let f = 1; f <= 4; f++) {
      for (let c = 0; c < 5; c++) {
        const x = 40 + c * 50, y = 42 + (4 - f) * 52;
        const lit = (f * 5 + c) % 4 === 1;
        cells += '<rect x="' + (x + 5) + '" y="' + (y + 3) + '" width="32" height="20" rx="2" fill="' + (lit ? '#ffe9a8' : '#bcd6e8') + '"/>' +
          '<rect x="' + x + '" y="' + (y + 25) + '" width="42" height="17" rx="2" fill="#cfe6f4" opacity=".85"/>' +
          '<path d="M' + x + ' ' + (y + 25) + ' h42" stroke="#aebccb" stroke-width="2.5"/>';
      }
    }
    const t = facadeCell(room);
    const target = '<rect x="' + (t.x - 4) + '" y="' + (t.y - 3) + '" width="' + (t.w + 8) + '" height="' + (t.h + 8) + '" rx="6" fill="#ff960022" stroke="#ff9600" stroke-width="3.5" class="fc-target"/>';
    return '<svg viewBox="0 0 320 292" width="' + size + '" aria-hidden="true">' +
      '<rect x="0" y="0" width="320" height="292" rx="16" fill="' + sky + '"/>' +
      '<circle cx="285" cy="34" r="12" fill="#fff" opacity=".9"/><circle cx="270" cy="39" r="8" fill="#fff" opacity=".9"/>' +
      '<rect x="30" y="34" width="260" height="230" rx="5" fill="#f4f1ec"/>' +
      '<rect x="24" y="24" width="272" height="14" rx="5" fill="' + roof + '"/>' +
      cells + target +
      '<path d="M140 264 h40 v-22 a6 6 0 0 1 6 -6 h-52 a6 6 0 0 1 6 6 Z" fill="#e8e2d5"/>' +
      '<rect x="150" y="244" width="20" height="20" rx="2" fill="#8a7a5c"/>' +
      '<rect x="128" y="236" width="64" height="7" rx="3" fill="' + roof + '"/>' +
      '<circle cx="112" cy="252" r="9" fill="#6fbf5a"/><circle cx="210" cy="252" r="9" fill="#6fbf5a"/>' +
      '<rect x="0" y="264" width="320" height="28" rx="10" fill="#d8dade"/>' +
      '<path d="M20 278 h30 M70 278 h30 M120 278 h30 M170 278 h30 M220 278 h30 M270 278 h30" stroke="#fff" stroke-width="3" stroke-dasharray="12 18"/>' +
      '</svg>';
  }

  root.VT_mascot = mascot;
  root.VT_facade = facade;
  root.VT_roomPos = roomPos;
  root.VT_avatar = avatar;
  root.VT_AVATARS = AVATARS;
  root.VT_building = building;
  root.VT_BUILDINGS = BUILDINGS;
  if (typeof module !== 'undefined') module.exports = { mascot, avatar, AVATARS, building, BUILDINGS, facade, roomPos };
})(typeof window !== 'undefined' ? window : globalThis);
