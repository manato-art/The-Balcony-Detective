// ベランダ探偵 — 画像生成の「スタイル指定」＋プロンプト部品（副作用なし・生成/マニフェスト双方から import）
// 承認済みタッチ：デフォルメ・シンプルフラット / 小物も同テイスト / ベランダは正面ビュー。

// 人物・ベランダ用（デフォルメ・シンプルフラット）
export const FLAT_STYLE =
  'Very simple, deformed, flat cartoon illustration for a cute, warm casual mobile game. ' +
  'Flat solid colors with only a subtle hint of soft shading, thick clean rounded outlines, big rounded simple shapes, ' +
  'minimal detail, sticker-like and adorable, wholesome and friendly, cohesive consistent style. ' +
  'Looks like a simple friendly quiz-app avatar / flat sticker illustration. ' +
  'STRICTLY: not realistic, not anime, not semi-realistic; no detailed rendering, no gradients, no glossy shading, ' +
  'no photorealism, no muscle definition, no individual hair strands, no text, no letters, no signs, no watermark. ' +
  'Keep it very simple, flat, cute and deformed.';

// 小物用（人物・ベランダと同じデフォルメに揃える）
export const ITEM_STYLE =
  'Very simple, deformed, flat cartoon game-item icon for a cute, warm casual mobile game. ' +
  'Flat solid colors with only a subtle hint of soft shading, thick clean rounded outlines, big rounded simple shapes, ' +
  'minimal detail, cute and appealing, cohesive consistent style. Not realistic, no gradients, no photorealism, no text.';

export const charPrompt = (desc) =>
  `${FLAT_STYLE} A single friendly character shown from the chest up as a simple flat avatar with a minimal simplified face ` +
  `(small simple dot-like eyes, tiny or no nose, a small friendly smile, softly rounded face, optional rosy cheeks), ` +
  `facing the viewer, centered, on a plain soft off-white background, no text, no frame. The character is ${desc}.`;

export const itemPrompt = (desc) =>
  `${ITEM_STYLE} A single everyday object drawn as a clean game item icon: ${desc}. ` +
  `Centered, gentle three-quarter view, isolated on a fully transparent background. NO drop shadow, NO contact shadow, NO ground, NO floor under it. No text, no people, no hands.`;

// ベランダ画角はそのまま（balconyPromptと同じ壁・戸・床・物干し竿）で、真ん中のガラス戸のカーテンだけが開いて奥に室内が見える版。
export const roomPrompt = (wallVibe, roomHint) =>
  `${FLAT_STYLE} A FLAT, head-on view of an apartment balcony, filling the frame edge to edge, composed like a flat stage backdrop for a 2D side-scroller game — NOT a boxed-in room. ${wallVibe} ` +
  `Show only the apartment back wall facing the viewer flat-on with a large sliding glass door in the middle, a horizontal metal clothesline pole across the upper part, and the balcony floor as a flat strip along the very bottom. ` +
  `The door's curtains are pulled fully OPEN and tied back to the far left and right sides of the doorway, ` +
  `so through the open glass door you can clearly see the cozy room inside: ${roomHint}, a warm lamp glowing and inviting light spilling out. ` +
  `Keep it FLAT and open: do NOT draw balcony side walls, a ceiling, room corners, converging perspective, or an enclosed alcove — only the room seen through the doorway may show a hint of depth. ` +
  `Absolutely NO front railing or guard fence, NO sky, NO outdoor scenery, NO trees, NO city view, NO horizon. ` +
  `Empty balcony stage: no people, no laundry, no objects on the balcony floor. Simple flat shapes, warm flat colors, no text, no signs.`;

export const facadePrompt = (vibe) =>
  `${FLAT_STYLE} A cute simple front view of a small multi-story apartment building exterior with about four floors and a few windows and small balconies per floor, ${vibe}. ` +
  `Show the whole building facade straight from the front, centered, standing on a bit of ground with a plain simple sky behind. Simple flat shapes, warm flat colors, no text, no signs.`;

export const balconyPrompt = (vibe) =>
  `${FLAT_STYLE} A FLAT, head-on view of an apartment balcony, filling the frame edge to edge, composed like a flat stage backdrop for a 2D side-scroller game — NOT a boxed-in room. ${vibe} ` +
  `Show only the apartment back wall facing the viewer flat-on (a sliding glass door and a curtain are set into it), a horizontal metal clothesline pole across the upper part for hanging laundry, and the balcony floor as a flat strip along the very bottom. ` +
  `Keep it FLAT and open: do NOT draw side walls, a ceiling, room corners, converging perspective, or an enclosed alcove — it must not look like standing inside a box. ` +
  `Give this mansion its OWN distinct look (wall material & color, door style, floor, and mood should clearly differ from other mansions and match the building's class). ` +
  `Absolutely NO front railing or guard fence, NO sky, NO outdoor scenery, NO trees, NO city view, NO horizon. ` +
  `Empty stage: no people, no laundry, no objects on the floor. Simple flat shapes, warm flat colors, no text, no signs.`;
