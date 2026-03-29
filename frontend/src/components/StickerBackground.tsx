import asset4  from '../assets/stickers/Asset 4wedding.svg'
import asset5  from '../assets/stickers/Asset 5wedding.svg'
import asset6  from '../assets/stickers/Asset 6wedding.svg'
import asset7  from '../assets/stickers/Asset 7wedding.svg'
import asset8  from '../assets/stickers/Asset 8wedding.svg'
import asset9  from '../assets/stickers/Asset 9wedding.svg'
import asset13 from '../assets/stickers/Asset 13wedding.svg'
import asset14 from '../assets/stickers/Asset 14wedding.svg'
import asset15 from '../assets/stickers/Asset 15wedding.svg'
import asset18 from '../assets/stickers/Asset 18wedding.svg'
import asset22 from '../assets/stickers/Asset 22wedding.svg'
import asset23 from '../assets/stickers/Asset 23wedding.svg'
import asset60 from '../assets/stickers/Asset 60wedding.svg'
import asset31 from '../assets/stickers/Asset 31wedding.svg'
import asset36 from '../assets/stickers/Asset 36wedding.svg'
import asset40 from '../assets/stickers/Asset 40wedding.svg'
import asset45 from '../assets/stickers/Asset 45wedding.svg'
import asset50 from '../assets/stickers/Asset 50wedding.svg'
import asset25 from '../assets/stickers/Asset 25wedding.svg'
import asset56 from '../assets/stickers/Asset 56wedding.svg'
import asset57 from '../assets/stickers/Asset 57wedding.svg'
import asset58 from '../assets/stickers/Asset 58wedding.svg'
import asset62 from '../assets/stickers/Asset 62wedding.svg'
import asset64 from '../assets/stickers/Asset 64wedding.svg'
import asset65 from '../assets/stickers/Asset 65wedding.svg'
import asset68 from '../assets/stickers/Asset 68wedding.svg'
import asset39 from '../assets/stickers/Asset 39wedding.svg'
import asset16 from '../assets/stickers/Asset 16wedding.svg'

// Sticker order — one per grid cell, curated
const SOURCES = [
  asset4,  asset5,  asset6,  asset7,
  asset8,  asset9,  asset13, asset14,
  asset15, asset18, asset22, asset23,
  asset60, asset31, asset36, asset40,
  asset45, asset50, asset25, asset56,
  asset57, asset58, asset62, asset64,
  asset65, asset68, asset39, asset16,
]

// 4 cols × 7 rows = 28 cells
// top/left refer to the CENTER of each sticker (translate(-50%,-50%) applied in CSS)
const COL_CENTERS = [12.5, 37.5, 62.5, 87.5]
const ROW_CENTERS = [7, 21, 35, 50, 64, 78, 92]

// Per-cell jitter [dx%, dy%] — keeps placement organic without overlapping
const JITTER: [number, number][] = [
  [ 3, -2], [-5,  3], [ 4, -3], [-3,  2],
  [-4,  3], [ 5, -2], [-3,  4], [ 4, -3],
  [ 3, -4], [-4,  3], [ 5, -2], [-3,  4],
  [-5,  2], [ 3, -3], [-4,  5], [ 5, -2],
  [ 4, -3], [-3,  4], [ 5, -4], [-4,  3],
  [-3,  5], [ 4, -3], [-5,  2], [ 3, -4],
  [ 5, -2], [-4,  3], [ 3, -5], [-5,  4],
]

const SIZES = [
  105, 110,  95, 115,
   60, 120, 105,  95,
  115, 100, 110, 105,
   90, 115, 100, 120,
  105,  95, 110, 100,
  120,  60,  95, 110,
  100, 115, 105,  90,
]

const ROTATIONS = [
  -18,  12,  -8,  20,
  -15,  25, -10,  15,
  -22,   8, -14,  18,
   10, -20,   5, -25,
   12,  -8,  22, -15,
    8, -12,  20,  -5,
   15, -22,  10, -18,
]

// Show ~half the stickers on mobile, spread across all 4 columns and all vertical zones
// top 0–33%:  0 (5%), 2 (4%), 3 (9%), 5 (19%)
// top 33–67%: 8 (31%), 11 (39%), 13 (47%), 14 (55%), 16 (61%)
// top 67–100%: 17 (68%), 23 (74%), 22 (80%), 20 (83%), 27 (96%)
const MOBILE_VISIBLE = new Set([0, 2, 3, 5, 8, 11, 13, 14, 16, 17, 23, 22, 20, 27])

const STICKERS = SOURCES.map((src, i) => {
  const col = i % 4
  const row = Math.floor(i / 4)
  const [dx, dy] = JITTER[i]
  return {
    src,
    left: `${COL_CENTERS[col] + dx}%`,
    top:  `${ROW_CENTERS[row] + dy}%`,
    size: SIZES[i],
    rotate: ROTATIONS[i],
    mobile: MOBILE_VISIBLE.has(i),
  }
})

export function StickerBackground() {
  return (
    <div className="sticker-layer" aria-hidden="true">
      {STICKERS.map((s, i) => (
        <img
          key={i}
          src={s.src}
          className={`sticker${s.mobile ? ' sticker--mobile' : ''}`}
          alt=""
          style={{
            top: s.top,
            left: s.left,
            '--size': `${s.size}px`,
            transform: `translate(-50%, -50%) rotate(${s.rotate}deg)`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
