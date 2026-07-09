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

// balconyPromptと同じ固定レイアウト(左下=エアコン室外機/上=物干し竿/左=ガラス戸)で、左のガラス戸のカーテンだけ開いて奥に室内が見える版。
export const roomPrompt = (wallVibe, roomHint) =>
  `${FLAT_STYLE} A cute simple FLAT, head-on illustration of a Japanese apartment BALCONY, like a 2D game backdrop, filling the frame edge to edge. ${wallVibe} ` +
  `KEEP THE SAME FIXED BALCONY LAYOUT: ` +
  `(1) an air-conditioner OUTDOOR UNIT — a boxy metal aircon box with a big round fan grille and a pipe up to the wall — sits in the BOTTOM-LEFT corner; ` +
  `(2) a large sliding glass door is set into the wall on the LEFT side, right behind and above the outdoor unit, and HERE its curtains are pulled fully OPEN and tied back to the sides, so through the open glass door you clearly see the cozy room inside: ${roomHint}, a warm lamp glowing and inviting light spilling out; ` +
  `(3) a horizontal metal clothesline pole runs across the TOP; ` +
  `(4) the remaining apartment wall and a flat balcony floor fill the rest. ` +
  `Match the wall/door/floor/mood to this mansion. Keep it FLAT and head-on: no balcony side walls, no ceiling, no converging box perspective — only the room seen through the open doorway may show a hint of depth. ` +
  `NO sky or city view, NO outdoor scenery, NO plants or trees outside. Empty balcony stage: nothing on the pole, no objects on the floor except the fixed aircon outdoor unit. Simple flat shapes, warm flat colors, no text, no signs.`;

export const facadePrompt = (vibe) =>
  `${FLAT_STYLE} A cute simple front view of a small multi-story apartment building exterior with about four floors and a few windows and small balconies per floor, ${vibe}. ` +
  `Show the whole building facade straight from the front, centered, standing on a bit of ground with a plain simple sky behind. Simple flat shapes, warm flat colors, no text, no signs.`;

export const balconyPrompt = (vibe) =>
  `${FLAT_STYLE} A cute simple FLAT, head-on illustration of a Japanese apartment BALCONY, like a 2D game backdrop, filling the frame edge to edge. ${vibe} ` +
  `KEEP THIS FIXED BALCONY LAYOUT exactly (it must be identical across every mansion): ` +
  `(1) an air-conditioner OUTDOOR UNIT — a boxy metal aircon compressor box with a big round fan grille on its front, standing on the floor with a pipe running up to the wall — sits in the BOTTOM-LEFT corner; ` +
  `(2) a large sliding glass door with a curtain is set into the wall on the LEFT side, right behind and above the outdoor unit (the entrance from the room); ` +
  `(3) a horizontal metal clothesline pole runs across the TOP of the scene for hanging laundry; ` +
  `(4) the remaining apartment back wall and a simple flat balcony floor fill the rest. ` +
  `The aircon outdoor unit (bottom-left) and the clothesline pole (top) are permanent fixtures — ALWAYS include both, in these positions. ` +
  `Match the wall material and color, the sliding-door style, the floor and the overall mood to THIS mansion (per the description above) so each mansion looks distinct. ` +
  `Keep it FLAT and head-on like a stage backdrop: no room side walls, no ceiling, no converging box perspective, no enclosed alcove, no tilt. NO sky or city view, NO outdoor scenery, NO plants, NO trees. ` +
  `Empty stage: nothing hanging on the pole, no objects on the floor except the fixed aircon outdoor unit. Simple flat shapes, warm flat colors, thick clean outlines, no text, no signs.`;
