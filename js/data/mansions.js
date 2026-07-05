// マンションタイプ（10種）pool: [住人id, 重み]
const VT_MANSIONS = [
  { id:'boro', name:'ボロアパート', desc:'家賃3万。壁は紙。', icon:'home', accent:'amber',
    pool:[['ojisan',26],['band',18],['danshidai',13],['freeter',12],['jiko',8],['minimalist',7],['fukumen',5],['mama',5],['kanrinin',4],['uranai',4],['chonaikai',4],['akiya',2]] },
  { id:'gakusei', name:'学生マンション', desc:'単位と青春の巣窟。', icon:'building', accent:'cyan',
    pool:[['danshidai',20],['joshidai',20],['ryugakusei',10],['gyaru',9],['otaku',8],['band',7],['sharehouse',7],['gamer',6],['freeter',6],['mama',5],['jirai',5],['kinniku',4],['akiya',3],['papa',3]] },
  { id:'hankagai', name:'繁華街ワンルーム', desc:'夜が本番の街。', icon:'store', accent:'pink',
    pool:[['kyaba',18],['host',14],['jirai',11],['nurse',11],['gyaru',9],['biyoshi',8],['gamer',6],['band',6],['obachan',6],['cosplayer',5],['enka',4],['uranai',4],['jiko',4],['legendhost',3]] },
  { id:'tawaman', name:'港区タワマン', desc:'家賃=あなたの年収。', icon:'tower', accent:'purple',
    pool:[['minatoku',18],['influencer',14],['toshika',11],['geino',9],['zaitaku',8],['kyaba',8],['host',7],['ol',7],['exidol',6],['kaishain',6],['legendhost',6],['oogui',5]] },
  { id:'kogai', name:'郊外ファミリーマンション', desc:'日曜の朝はラジオ体操。', icon:'building', accent:'green',
    pool:[['family',22],['shufu',16],['shinkon',12],['papa',9],['mama',9],['tanshin',8],['chonaikai',7],['obachan',7],['kaishain',7],['nekoyashiki',6],['police',5],['nurse',4],['kanrinin',4],['uranai',3]] },
  { id:'designers', name:'デザイナーズマンション', desc:'コンクリ打ちっぱなし。冬は寒い。', icon:'building', accent:'cyan',
    pool:[['biyoshi',16],['influencer',13],['ol',13],['minimalist',11],['zaitaku',10],['yoga',8],['host',7],['minatoku',7],['cosplayer',6],['band',5],['geino',5],['toshika',5],['joshidai',5]] },
  { id:'shataku', name:'社宅・団地', desc:'人事異動と共に人が入れ替わる。', icon:'building', accent:'amber',
    pool:[['kaishain',22],['shufu',13],['tanshin',12],['family',10],['police',9],['chonaikai',8],['ojisan',8],['shinkon',8],['obachan',7],['kyoju',5],['kinniku',4],['kanrinin',4],['mama',4],['exidol',3]] },
  { id:'koukyu', name:'高級低層マンション', desc:'静かで上品。住人は謎。', icon:'home', accent:'purple',
    pool:[['obachan',16],['exidol',11],['toshika',11],['geino',9],['ol',9],['shufu',9],['kyoju',8],['minatoku',7],['uranai',7],['enka',6],['yoga',6],['legendhost',6],['kanrinin',4]] },
  { id:'zakkyo', name:'怪しい雑居ビル風マンション', desc:'2階から上が謎。', icon:'warn', accent:'pink',
    pool:[['uranai',16],['reibai',13],['jiko',11],['akiya',9],['minimalist',9],['fukumen',8],['band',7],['jirai',7],['ojisan',7],['cosplayer',6],['kyaba',6],['otaku',5],['legendhost',4]] },
  { id:'resort', name:'リゾート風マンション', desc:'常夏。ただし千葉。', icon:'palm', accent:'green',
    pool:[['kinniku',15],['influencer',13],['camper',10],['minatoku',10],['gyaru',9],['yoga',8],['exidol',7],['family',7],['biyoshi',7],['shinkon',6],['geino',6],['toshika',6],['obachan',6],['oogui',5]] },
];

// 部屋番号 101-105 / 201-205 / 301-305 / 401-405
const VT_ROOMS = [];
for (let f = 1; f <= 4; f++) for (let r = 1; r <= 5; r++) VT_ROOMS.push(String(f * 100 + r));

if (typeof window !== 'undefined') { window.VT_MANSIONS = VT_MANSIONS; window.VT_ROOMS = VT_ROOMS; }
if (typeof module !== 'undefined') { module.exports = { VT_MANSIONS, VT_ROOMS }; }
