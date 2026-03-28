import bouquet1   from '../assets/stickers/Bouquet_01.svg'
import bouquet2   from '../assets/stickers/Bouquet_02.svg'
import rings      from '../assets/stickers/Rings.svg'
import heart      from '../assets/stickers/Heart.svg'
import bird       from '../assets/stickers/Bird.svg'
import champagne  from '../assets/stickers/Champagne.svg'
import candle     from '../assets/stickers/Candle.svg'
import candles    from '../assets/stickers/Candles.svg'
import bow        from '../assets/stickers/Bow.svg'
import camera     from '../assets/stickers/Camera.svg'
import ribbon     from '../assets/stickers/Ribbon.svg'
import glasses    from '../assets/stickers/Glasses.svg'
import bride      from '../assets/stickers/Bride.svg'
import groom      from '../assets/stickers/Groom.svg'
import brideShoe  from "../assets/stickers/Bride's shoe.svg"
import groomShoe  from "../assets/stickers/Groom's shoe.svg"
import wineBottle from '../assets/stickers/Wine bottle.svg'
import letter     from '../assets/stickers/Letter.svg'
import floralGlass from '../assets/stickers/Floral glass.svg'
import tag1        from '../assets/stickers/Tag_01.svg'
import tag2        from '../assets/stickers/Tag_02.svg'
import note        from '../assets/stickers/Note.svg'
import costume     from '../assets/stickers/Costume.svg'
import church      from '../assets/stickers/Church.svg'
import asset1      from '../assets/stickers/Asset 1wedding.svg'
import asset2      from '../assets/stickers/Asset 2wedding.svg'
import asset3      from '../assets/stickers/Asset 3wedding.svg'
import asset4      from '../assets/stickers/Asset 4wedding.svg'
import asset5      from '../assets/stickers/Asset 5wedding.svg'
import asset6      from '../assets/stickers/Asset 6wedding.svg'
import asset7      from '../assets/stickers/Asset 7wedding.svg'
import asset9      from '../assets/stickers/Asset 9wedding.svg'
import asset10     from '../assets/stickers/Asset 10wedding.svg'
import asset11     from '../assets/stickers/Asset 11wedding.svg'
import asset12     from '../assets/stickers/Asset 12wedding.svg'
import asset13     from '../assets/stickers/Asset 13wedding.svg'
import asset14     from '../assets/stickers/Asset 14wedding.svg'
import asset15     from '../assets/stickers/Asset 15wedding.svg'
import asset16     from '../assets/stickers/Asset 16wedding.svg'
import asset17     from '../assets/stickers/Asset 17wedding.svg'
import asset18     from '../assets/stickers/Asset 18wedding.svg'
import asset19     from '../assets/stickers/Asset 19wedding.svg'
import asset20     from '../assets/stickers/Asset 20wedding.svg'
import asset21     from '../assets/stickers/Asset 21wedding.svg'
import asset22     from '../assets/stickers/Asset 22wedding.svg'
import asset25     from '../assets/stickers/Asset 25wedding.svg'
import asset30     from '../assets/stickers/Asset 30wedding.svg'
import asset40     from '../assets/stickers/Asset 40wedding.svg'
import asset50     from '../assets/stickers/Asset 50wedding.svg'
import asset60     from '../assets/stickers/Asset 60wedding.svg'

const STICKERS = [
  // Row 1 — top
  { src: bouquet1,   top: '1%',  left: '2%',  size: 120, rotate: -20, mobile: true  },
  { src: asset2,     top: '4%',  left: '24%', size: 70,  rotate:  12, mobile: true  },
  { src: asset1,     top: '2%',  left: '46%', size: 65,  rotate:  -8, mobile: false },
  { src: asset3,     top: '5%',  left: '67%', size: 72,  rotate: -15, mobile: true  },
  { src: asset4,     top: '2%',  left: '84%', size: 80,  rotate:  10, mobile: false },
  // Gap 1 (~10-16%)
  { src: asset6,     top: '11%', left: '14%', size: 65,  rotate: -18, mobile: false },
  { src: candles,    top: '12%', left: '50%', size: 65,  rotate:  10, mobile: true  },
  { src: groomShoe,  top: '10%', left: '74%', size: 62,  rotate:  -5, mobile: false },
  { src: floralGlass,top: '13%', left: '88%', size: 66,  rotate: -12, mobile: false },
  { src: asset7,     top: '15%', left: '38%', size: 60,  rotate:  12, mobile: true  },
  { src: tag1,       top: '17%', left: '60%', size: 58,  rotate:  18, mobile: false },
  // Row 2 — upper-mid (~18-25%)
  { src: rings,      top: '20%', left: '8%',  size: 85,  rotate: -15, mobile: true  },
  { src: camera,     top: '18%', left: '36%', size: 75,  rotate: -22, mobile: false },
  { src: note,       top: '22%', left: '54%', size: 55,  rotate:  15, mobile: false },
  { src: heart,      top: '25%', left: '62%', size: 58,  rotate:   8, mobile: false },
  { src: champagne,  top: '20%', left: '84%', size: 70,  rotate: -18, mobile: true  },
  // Gap 2 (~29-38%)
  { src: glasses,    top: '30%', left: '18%', size: 62,  rotate:  22, mobile: false },
  { src: asset9,     top: '27%', left: '30%', size: 75,  rotate:  -8, mobile: true  },
  { src: asset11,    top: '32%', left: '46%', size: 78,  rotate: -14, mobile: true  },
  { src: asset5,     top: '36%', left: '58%', size: 65,  rotate:  14, mobile: false },
  { src: brideShoe,  top: '29%', left: '74%', size: 60,  rotate:  10, mobile: false },
  { src: asset25,    top: '35%', left: '82%', size: 68,  rotate:  16, mobile: false },
  // Row 3 — center (~40-44%)
  { src: bird,       top: '42%', left: '3%',  size: 65,  rotate:  25, mobile: true  },
  { src: asset12,    top: '40%', left: '28%', size: 78,  rotate: -25, mobile: true  },
  { src: costume,    top: '28%', left: '88%', size: 64,  rotate:  15, mobile: false },
  { src: bow,        top: '44%', left: '58%', size: 62,  rotate:  18, mobile: true  },
  { src: candle,     top: '40%', left: '82%', size: 68,  rotate: -10, mobile: false },
  // Gap 3 (~49-58%)
  { src: tag2,       top: '48%', left: '6%',  size: 55,  rotate:  28, mobile: true  },
  { src: asset13,    top: '51%', left: '20%', size: 70,  rotate:  20, mobile: false },
  { src: asset16,    top: '57%', left: '32%', size: 72,  rotate:  10, mobile: true  },
  { src: groom,      top: '58%', left: '6%',  size: 70,  rotate:  12, mobile: false },
  { src: asset14,    top: '52%', left: '70%', size: 75,  rotate:   8, mobile: true  },
  { src: asset30,    top: '54%', left: '86%', size: 70,  rotate: -20, mobile: false },
  // Row 4 — lower-mid (~60-65%)
  { src: asset17,    top: '62%', left: '10%', size: 85,  rotate:  15, mobile: true  },
  { src: ribbon,     top: '60%', left: '38%', size: 78,  rotate: -25, mobile: true  },
  { src: asset10,    top: '65%', left: '64%', size: 72,  rotate:  20, mobile: true  },
  { src: asset18,    top: '62%', left: '84%', size: 85,  rotate: -12, mobile: false },
  // Gap 4 (~68-79%)
  { src: asset40,    top: '68%', left: '6%',  size: 66,  rotate:  20, mobile: false },
  { src: asset15,    top: '71%', left: '22%', size: 70,  rotate: -18, mobile: true  },
  { src: asset19,    top: '67%', left: '42%', size: 80,  rotate: -10, mobile: false },
  { src: asset21,    top: '73%', left: '50%', size: 65,  rotate:  15, mobile: false },
  { src: bride,      top: '70%', left: '76%', size: 74,  rotate:  -8, mobile: true  },
  { src: asset50,    top: '75%', left: '64%', size: 70,  rotate: -16, mobile: true  },
  { src: asset60,    top: '78%', left: '18%', size: 68,  rotate:  24, mobile: true  },
  { src: church,     top: '76%', left: '86%', size: 74,  rotate:   6, mobile: true  },
  // Row 5 — bottom (~81-89%)
  { src: bouquet2,   top: '81%', left: '5%',  size: 112, rotate: -12, mobile: true  },
  { src: wineBottle, top: '84%', left: '28%', size: 62,  rotate:  12, mobile: true  },
  { src: asset22,    top: '82%', left: '50%', size: 65,  rotate: -15, mobile: false },
  { src: letter,     top: '83%', left: '70%', size: 65,  rotate:  22, mobile: true  },
  { src: asset20,    top: '81%', left: '86%', size: 78,  rotate:  -8, mobile: true  },
]

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
            transform: `rotate(${s.rotate}deg)`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
