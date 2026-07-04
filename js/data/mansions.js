// マンションタイプ（10種）pool: [住人id, 重み]
const VT_MANSIONS = [
  { id:'boro', name:'ボロアパート', desc:'家賃3万。壁は紙。', icon:'home', accent:'amber',
    pool:[['ojisan',30],['band',20],['danshidai',15],['jiko',8],['minimalist',7],['mama',5],['kanrinin',5],['uranai',4],['chonaikai',4],['akiya',2]] },
  { id:'gakusei', name:'学生マンション', desc:'単位と青春の巣窟。', icon:'building', accent:'cyan',
    pool:[['danshidai',25],['joshidai',25],['gyaru',10],['band',8],['sharehouse',8],['mama',6],['jirai',6],['kinniku',5],['akiya',4],['papa',3]] },
  { id:'hankagai', name:'繁華街ワンルーム', desc:'夜が本番の街。', icon:'store', accent:'pink',
    pool:[['kyaba',20],['host',15],['jirai',12],['nurse',12],['gyaru',10],['biyoshi',8],['band',6],['obachan',6],['uranai',4],['jiko',4],['legendhost',3]] },
  { id:'tawaman', name:'港区タワマン', desc:'家賃=あなたの年収。', icon:'tower', accent:'purple',
    pool:[['minatoku',20],['influencer',15],['toshika',12],['geino',10],['kyaba',8],['host',8],['ol',8],['exidol',7],['kaishain',6],['legendhost',6]] },
  { id:'kogai', name:'郊外ファミリーマンション', desc:'日曜の朝はラジオ体操。', icon:'building', accent:'green',
    pool:[['family',25],['shufu',18],['papa',10],['mama',10],['chonaikai',8],['obachan',8],['kaishain',8],['police',6],['nurse',5],['kanrinin',4],['uranai',3]] },
  { id:'designers', name:'デザイナーズマンション', desc:'コンクリ打ちっぱなし。冬は寒い。', icon:'building', accent:'cyan',
    pool:[['biyoshi',18],['influencer',15],['ol',15],['minimalist',12],['host',8],['minatoku',8],['band',6],['geino',6],['toshika',6],['joshidai',6]] },
  { id:'shataku', name:'社宅・団地', desc:'人事異動と共に人が入れ替わる。', icon:'building', accent:'amber',
    pool:[['kaishain',25],['shufu',15],['family',12],['police',10],['chonaikai',9],['ojisan',9],['obachan',8],['kinniku',5],['kanrinin',4],['mama',4],['exidol',3]] },
  { id:'koukyu', name:'高級低層マンション', desc:'静かで上品。住人は謎。', icon:'home', accent:'purple',
    pool:[['obachan',18],['exidol',12],['toshika',12],['geino',10],['ol',10],['shufu',10],['minatoku',8],['uranai',8],['legendhost',7],['kanrinin',5]] },
  { id:'zakkyo', name:'怪しい雑居ビル風マンション', desc:'2階から上が謎。', icon:'warn', accent:'pink',
    pool:[['uranai',18],['reibai',15],['jiko',12],['akiya',10],['minimalist',10],['band',8],['jirai',8],['ojisan',8],['kyaba',6],['legendhost',5]] },
  { id:'resort', name:'リゾート風マンション', desc:'常夏。ただし千葉。', icon:'palm', accent:'green',
    pool:[['kinniku',18],['influencer',15],['minatoku',12],['gyaru',10],['exidol',8],['family',8],['biyoshi',8],['geino',7],['toshika',7],['obachan',7]] },
];

// 部屋番号 101-105 / 201-205 / 301-305 / 401-405
const VT_ROOMS = [];
for (let f = 1; f <= 4; f++) for (let r = 1; r <= 5; r++) VT_ROOMS.push(String(f * 100 + r));

if (typeof window !== 'undefined') { window.VT_MANSIONS = VT_MANSIONS; window.VT_ROOMS = VT_ROOMS; }
if (typeof module !== 'undefined') { module.exports = { VT_MANSIONS, VT_ROOMS }; }
