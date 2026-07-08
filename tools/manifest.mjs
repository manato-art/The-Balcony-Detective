// ベランダ探偵 — 本番アート生成マニフェスト生成器
// residents.js / mansions.js / scene.js の全要素に対応する画像リストを組み、tools/manifest-full.json に書き出す。
//   node tools/manifest.mjs   →  manifest-full.json（住人50 + ベランダ10 + 小物108）
// ファイル名は「住人id / マンションid / バリアントキー・base kind名」に一致させる（組み込み時にコードから引ける）。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { charPrompt, itemPrompt, balconyPrompt, facadePrompt, roomPrompt } from './style.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));

/* ===== 住人50体（idごとの見た目） chest-upのデフォルメアバター ===== */
const CHAR_LOOKS = {
  joshidai: "a cheerful female university student in her early 20s, casual trendy top, long brown hair, holding a smartphone, bright friendly smile",
  danshidai: "a friendly male university student wearing a hoodie with a backpack strap over one shoulder, black hair, easygoing smile",
  ol: "a neat female office worker in her late 20s, blouse and blazer, shoulder-length brown hair, tidy pleasant smile",
  kaishain: "a male company employee (salaryman) in a white dress shirt and necktie, short black hair, polite slightly weary smile",
  shufu: "a friendly housewife wearing a green apron over a shirt, brown hair tied in a bun, warm gentle smile",
  family: "a happy young father with a small child beside him, both in casual clothes, cheerful smiles",
  obachan: "a stylish beauty-conscious older lady with permed hair, colorful blouse and big earrings, bright makeup, confident cheerful smile",
  ojisan: "a middle-aged man living alone, plain t-shirt, a little unshaven and tired, gentle melancholic smile",
  freeter: "a laid-back young part-timer in a casual t-shirt, slightly messy hair, relaxed carefree smile",
  zaitaku: "a work-from-home worker in a comfy loungewear hoodie, headphones around the neck, mellow homebody smile",
  shinkon: "a happy newlywed young couple, a man and a woman close together, blissful smiles",
  ryugakusei: "a friendly international exchange student with a backpack, holding a Japanese textbook, polite bright smile",
  kyaba: "a glamorous nightclub hostess in an elegant sparkly dress, long styled hair, glossy makeup, confident cute smile",
  host: "a suave male nightclub host with silver-white swept-back hair, a sharp black formal suit, holding a single red rose, charming smile",
  minatoku: "a flashy upscale party girl in a designer outfit, big styled hair, holding a champagne glass, confident glam smile",
  influencer: "a trendy female influencer holding a smartphone up for a selfie, fashionable outfit, big camera-ready smile",
  jirai: "a jirai-kei girl in black-and-pink frilly fashion, twin tails, big teary cute eyes, a pink heart mood",
  gyaru: "a tanned gyaru girl with big voluminous blonde-brown hair, flashy makeup, colorful trendy clothes, energetic grin",
  kinniku: "a cheerful muscular young man in a white tank top, tanned and athletic, holding a dumbbell, big confident grin",
  biyoshi: "a stylish hairdresser with perfect trendy hair and a black apron, holding scissors, cool friendly smile",
  band: "a band musician with messy dyed hair, a black band t-shirt and leather jacket, holding an electric guitar, cool relaxed look",
  nurse: "a kind female night-shift nurse wearing a white nurse cap with a small red cross and a light-blue nurse uniform, gentle warm smile",
  otaku: "an enthusiastic male otaku fan with glasses and an anime t-shirt, holding a glowstick, big passionate smile",
  camper: "an outdoorsy camper in a flannel shirt and cap, holding a camping lantern, cheerful rugged smile",
  gamer: "a game streamer wearing a headset and gaming t-shirt, holding a game controller, focused-yet-fun grin",
  yoga: "a fit female yoga instructor in an athletic tank top, hair in a bun, serene calm confident smile",
  kanrinin: "a stern older apartment building manager in a cardigan vest and glasses, holding a bunch of keys, watchful but not scary look",
  police: "a friendly Japanese police officer in a navy police uniform and cap, upright posture, reassuring smile",
  chonaikai: "a cheerful neighborhood association chairman, an older man in a vest with a sash, community-leader smile",
  minimalist: "a minimalist person in plain simple monochrome clothes, very clean tidy look, calm zen expression",
  akiya: "a completely empty vacant apartment with nobody living there: a plain closed sliding door and a bare wall, muted grey tones, a subtle question mark, absolutely no person",
  sharehouse: "a share house shown as a group of four diverse young housemates squeezed together into one frame, all smiling cheerfully",
  papa: "a middle-aged father with glasses holding up a small pink girly dress on a hanger, embarrassed gentle smile",
  mama: "a middle-aged mother with grey hair in a bun holding boyish laundry, warm slightly lonely smile",
  cosplayer: "a cute cosplayer girl in a costume mixing nurse and sailor-uniform elements, a colorful wig, playful wink",
  kyoju: "an old university professor with round glasses and a short beard, a tweed jacket, holding a thick book, thoughtful kind smile",
  nekoyashiki: "a cozy cat-loving person surrounded by three cats and holding one cat, sleepy content smile",
  tanshin: "a lonely business dad on a solo work assignment, a dress shirt, a bit tired, faint happy smile",
  exidol: "a former female idol, still cute, holding a microphone, a faded stage sparkle, gentle nostalgic smile",
  geino: "a showbiz industry person in stylish casual clothes, sunglasses pushed up on the head, holding a phone, busy cool vibe",
  uranai: "a fortune teller woman wearing a shawl and headscarf, a crystal ball in front, mysterious knowing smile",
  reibai: "a spirit medium in a traditional white robe, calm serene eerie expression, a faint little ghost floating beside",
  legendhost: "a legendary retired host, a distinguished older man with silver hair in a flashy shiny suit, ultra-confident charming smile",
  toshika: "a genius investor in a sharp suit and glasses, holding a laptop showing a rising green chart, calm confident smirk",
  jiko: "a slightly spooky pale resident of a haunted apartment, uneasy calm smile, a faint transparent little ghost peeking behind",
  oogui: "a slim big-eater YouTuber surrounded by lots of food, holding chopsticks, cheerful hungry grin",
  fukumen: "a mysterious anonymous novelist with the face hidden by a mask and shadow, holding a book and a pen",
  enka: "an enka singer in a flashy sparkly kimono, holding a microphone, dramatic passionate expression",
  hato: "a plain cute grey pigeon bird sitting, a simple round chubby shape, innocent look",
  uchujin: "a cute little green alien with a big round head and big black eyes trying to look friendly, an adorable derpy expression",
};

/* ===== マンション10種のベランダ（正面ビュー・空舞台） ===== */
const MANSION_VIBES = {
  boro: "a shabby cheap old apartment, worn peeling beige walls, a rusty simple railing, dingy but characterful, muted brown tones",
  gakusei: "a plain simple student apartment, light neutral cheap-modern walls, tidy but basic, youthful casual bright tones",
  hankagai: "a downtown nightlife studio apartment, a hint of colorful city neon glow behind, a slightly gaudy urban night mood, deep evening tones",
  tawaman: "a luxury high-rise tower apartment, sleek light walls and big glass, a far-below city skyline, upscale clean cool tones",
  kogai: "a cozy suburban family apartment, warm homey beige walls, green park and trees in the background, bright and wholesome",
  designers: "a stylish designer apartment with exposed grey concrete walls, minimalist and modern, cool calm grey-and-white tones",
  shataku: "a plain company-housing danchi block apartment, uniform functional pale concrete walls, retro nostalgic muted tones",
  koukyu: "a quiet upscale low-rise apartment, elegant refined cream walls, tasteful and calm with a few leafy plants, soft muted tones",
  zakkyo: "a shady mixed-use tenant-building apartment, slightly grimy worn walls, a mysterious moody run-down vibe, dim muted tones",
  resort: "a resort-style apartment with an airy tropical vacation vibe, light sandy and aqua tones, a hint of a potted palm, ocean and bright sky, breezy",
};

/* ===== アイテム（透過PNG） ===== */
// バリアント87種（scene.js VARIANTS のキー = ファイル名）
const VARIANT_DESCS = {
  lace: "a set of black lace lingerie hanging on a clothes hanger",
  dress: "a pretty one-piece dress hanging on a clothes hanger",
  towel: "a folded bath towel hanging over a rail",
  jersey: "a sports team jersey shirt hanging on a hanger",
  tank: "a plain tank top hanging on a hanger",
  futon: "a futon mattress hung over a railing to air out",
  skirt: "a pleated skirt hanging on a hanger",
  happi: "a Japanese festival happi coat hanging on a hanger",
  scrub: "a set of medical scrubs and a white coat hanging on a hanger",
  judo: "a white judo and karate gi uniform hanging on a hanger",
  dryflower: "a small bunch of dried flowers hanging upside down",
  chime: "a Japanese glass wind chime (furin) hanging",
  box_cosme: "an open box overflowing with cosmetics and makeup bottles",
  box_crate: "a wooden crate holding champagne bottles",
  box_case: "a silver hard-shell equipment case",
  box_cool: "a white insulated cooler food box with a blue lid",
  books: "a neat stack of a few colorful books",
  papers: "a stack of folded newspapers and papers",
  can_tower: "a tower of stacked empty drink cans",
  can_energy: "a tall energy drink can with a lightning bolt",
  bottles: "a few small brown nutritional drink bottles",
  bag_brand: "a fancy luxury-brand paper shopping bag",
  bag_conv: "a white convenience-store plastic shopping bag",
  bonsai: "a small bonsai tree in a shallow pot",
  tomato: "a potted cherry-tomato plant with little red tomatoes",
  plant_big: "a big leafy potted houseplant",
  ring: "a colorful inflatable swim ring",
  teddy: "a cute brown teddy bear plush",
  flag: "a small national flag on a short pole",
  tarot: "a few tarot cards fanned out",
  beads: "a loop of round prayer and power-stone beads",
  bouquet: "a bouquet of red and pink roses",
  salt: "two little cone-shaped mounds of purifying salt",
  meter: "a boxy electric utility meter with a round dial",
  ofuda_v: "a white paper talisman charm with red markings",
  wig: "a hair wig on a round stand",
  flute: "a tall champagne flute glass",
  tapioca: "a bubble tea cup with tapioca pearls and a straw",
  gamepad: "a black game controller",
  sake: "a large Japanese sake bottle",
  wine: "a bottle of red wine",
  golf: "a golf bag full of clubs",
  surf: "a tall surfboard standing up",
  skate: "a skateboard",
  yogamat: "a rolled-up yoga mat",
  broom: "a broom with a dustpan",
  bucket: "a cleaning bucket with a mop",
  fan_elec: "a small electric fan",
  candle: "a few small aroma candles",
  rod: "a fishing rod",
  keyboardp: "a computer keyboard",
  petbowl: "a pet food bowl with kibble",
  glow: "a couple of glowing idol penlight sticks",
  lantern: "a red Japanese paper lantern (chochin) hanging",
  cobweb: "a dusty spider web with a little spider",
  pcase: "a plastic beer-bottle crate case",
  eyemask: "a sleep eye mask",
  hat_item: "a hat",
  laptop: "an open laptop computer",
  box_stack: "a stack of two cardboard moving boxes",
  box_open: "an open cardboard box",
  box_tall: "a tall cardboard box",
  box_gift: "a white gift box tied with a red ribbon",
  box_gadget: "a cardboard box with an electronic gadget peeking out",
  box_med: "a white first-aid medicine box with a red cross",
  box_jewel: "a small dark box with a shiny blue jewel",
  box_figure: "a pink box with a little anime figure inside",
  box_music: "a cardboard box with a small musical instrument",
  box_dice: "a board-game box with dice",
  box_glasses: "a box containing a pair of eyeglasses",
  box_coffee: "a brown box with a coffee cup design",
  box_air: "an international air-mail cardboard box with a red-and-blue border",
  box_bottles: "a cardboard box holding mineral water bottles",
  box_baby: "a white box with cute baby items",
  box_pizza: "an open cardboard pizza box with a slice of pepperoni pizza",
  box_cat: "a cardboard box with cat paw prints and cat items",
  suitcase: "a travel suitcase standing up",
  chairs: "a couple of folding camping chairs",
  firewood: "a small stack of chopped firewood logs",
  bulb: "a glowing yellow light bulb",
  tube: "a rolled poster in a cardboard tube",
  bowls: "a stack of empty delivery rice bowls",
  sack: "a big sack of rice",
  lanyard: "an ID card hanging from a neck lanyard",
  sec_goldhato: "a shiny golden statue of a pigeon",
  sec_ufo: "a small cute flying-saucer UFO",
  sec_chest: "a wooden treasure chest with gold trim",
};

// 汎用 base kind 21種（scene.js ITEMS のキー = ファイル名。バリアント未一致時のフォール用）
const BASE_DESCS = {
  laundry: "a plain t-shirt hanging on a clothes hanger",
  kids: "a small child outfit hanging on a hanger",
  suit: "a dark business suit jacket hanging on a hanger",
  umbrella: "a closed folded umbrella",
  bag: "a simple everyday handbag",
  can: "a single drink can",
  sandal: "a pair of sandals on the floor",
  protein: "a large tub of protein powder",
  plant: "a small green potted plant",
  box: "a plain closed cardboard box",
  guitar: "an acoustic guitar",
  dumbbell: "a single black dumbbell",
  mirror: "a hand mirror",
  camera: "a camera",
  crystal: "a purple crystal gemstone",
  mail: "a small pile of letters and mail",
  star: "a cute yellow star ornament",
  bike: "a bicycle",
  trophy: "a gold trophy cup",
  alert: "a warning notice sign",
  megaphone: "a megaphone",
};

/* ===== マニフェスト組み立て ===== */
const manifest = [];
for (const [id, look] of Object.entries(CHAR_LOOKS))
  manifest.push({ id, dir: 'chars', size: '1024x1024', transparent: false, prompt: charPrompt(look) });
// ベランダは近接・柵なし・背景/風景なしの専用vibe（外観facadeとは別。壁の質感だけ描写）
const BALCONY_VIBES = {
  boro: "The walls are shabby, cracked and worn, a cheap dim old apartment.",
  gakusei: "The walls are plain, simple and basic, a cheap student apartment.",
  hankagai: "The walls have a slightly gaudy nightlife feel with soft colorful neon light, an urban night mood.",
  tawaman: "The walls are sleek, modern and luxurious with a big clean glass door, upscale.",
  kogai: "The walls are cozy, warm and homey with a cheerful family feel.",
  designers: "The walls are exposed grey concrete, minimalist and stylish, cool-toned.",
  shataku: "The walls are plain functional pale concrete, a retro danchi apartment feel.",
  koukyu: "The walls are elegant and refined cream, tasteful and quietly upscale.",
  zakkyo: "The walls are grimy, worn and run-down, a shady moody dim apartment.",
  resort: "The walls are light sandy and airy with a warm breezy tropical resort feel.",
};
const balconies = [];
for (const [id, vibe] of Object.entries(BALCONY_VIBES))
  balconies.push({ id, dir: 'balcony', size: '1536x1024', transparent: false, prompt: balconyPrompt(vibe) });
manifest.push(...balconies);
fs.writeFileSync(path.join(__dir, 'manifest-balcony.json'), JSON.stringify(balconies, null, 1));
for (const [id, desc] of Object.entries({ ...VARIANT_DESCS, ...BASE_DESCS }))
  manifest.push({ id, dir: 'items', size: '1024x1024', transparent: true, prompt: itemPrompt(desc) });

// マンション外観(facade)10種 — 単独生成できるよう manifest-facade.json にも書き出し
const facades = [];
for (const [id, vibe] of Object.entries(MANSION_VIBES))
  facades.push({ id, dir: 'facade', size: '1024x1024', transparent: false, prompt: facadePrompt(vibe) });
manifest.push(...facades);
fs.writeFileSync(path.join(__dir, 'manifest-facade.json'), JSON.stringify(facades, null, 1));

// 室内(カーテンを開けた時に見える部屋)10種 — マンション別
const ROOM_VIBES = {
  boro: "a cramped shabby messy room with old worn furniture, dim and cluttered",
  gakusei: "a small simple student room with a low table and floor cushions, basic and casual",
  hankagai: "a small dim room with moody colorful nightlife lighting, a bit messy",
  tawaman: "a spacious luxurious modern living room with a stylish sofa, elegant and bright",
  kogai: "a cozy warm family living room with a green sofa and family photos, homey",
  designers: "a stylish minimalist room with designer furniture, cool-toned and tidy",
  shataku: "a plain modest tidy room with simple functional retro furniture",
  koukyu: "an elegant refined tasteful living room, quiet and upscale",
  zakkyo: "a dim cluttered mysterious room, moody and a bit run-down",
  resort: "a bright airy room with a light tropical resort feel, breezy and cheerful",
};
const rooms = [];
// ベランダと同じ壁vibe＋画角(3:2)で、カーテンを開けて奥に室内(ROOM_VIBES)が見える版。
for (const id of Object.keys(ROOM_VIBES))
  rooms.push({ id, dir: 'room', size: '1536x1024', transparent: false, prompt: roomPrompt(BALCONY_VIBES[id], ROOM_VIBES[id]) });
manifest.push(...rooms);
fs.writeFileSync(path.join(__dir, 'manifest-room.json'), JSON.stringify(rooms, null, 1));

const outPath = path.join(__dir, 'manifest-full.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 1));
console.log('書き出し: ' + outPath);
console.log('合計 ' + manifest.length + ' 枚 = 住人' + Object.keys(CHAR_LOOKS).length +
  ' + ベランダ' + Object.keys(MANSION_VIBES).length +
  ' + 小物' + (Object.keys(VARIANT_DESCS).length + Object.keys(BASE_DESCS).length) +
  '（バリアント' + Object.keys(VARIANT_DESCS).length + '＋汎用' + Object.keys(BASE_DESCS).length + '）');
