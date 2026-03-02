import bouquet1   from '../assets/stickers/Bouquet_01.svg'
import bouquet2   from '../assets/stickers/Bouquet_02.svg'
import floral1    from '../assets/stickers/Floral_01.svg'
import floral2    from '../assets/stickers/Floral_02.svg'
import floral3    from '../assets/stickers/Floral_03.svg'
import floral4    from '../assets/stickers/Floral_04.svg'
import floral5    from '../assets/stickers/Floral_05.svg'
import floral6    from '../assets/stickers/Floral_06.svg'
import floral7    from '../assets/stickers/Floral_07.svg'
import floral8    from '../assets/stickers/Floral_08.svg'
import floral9    from '../assets/stickers/Floral_09.svg'
import wreath1    from '../assets/stickers/Wreath_01.svg'
import wreath2    from '../assets/stickers/Wreath_02.svg'
import wreath3    from '../assets/stickers/Wreath_03.svg'
import wreath4    from '../assets/stickers/Wreath_04.svg'
import wreath5    from '../assets/stickers/Wreath_05.svg'
import wreath6    from '../assets/stickers/Wreath_06.svg'
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
import groomBride1 from "../assets/stickers/Groom&Bride_01.svg"
import groomBride2 from "../assets/stickers/Groom&Bride_02.svg"
import tag1        from '../assets/stickers/Tag_01.svg'
import tag2        from '../assets/stickers/Tag_02.svg'
import note        from '../assets/stickers/Note.svg'
import costume     from '../assets/stickers/Costume.svg'
import church      from '../assets/stickers/Church.svg'
import wedding1   from '../assets/stickers/Wedding illustration-01.svg'
import wedding2   from '../assets/stickers/Wedding illustration-02.svg'
import wedding3   from '../assets/stickers/Wedding illustration-03.svg'
import wedding4   from '../assets/stickers/Wedding illustration-04.svg'
import wedding5   from '../assets/stickers/Wedding illustration-05.svg'
import wedding6   from '../assets/stickers/Wedding illustration-06.svg'
import wedding7   from '../assets/stickers/Wedding illustration-07.svg'
import wedding8   from '../assets/stickers/Wedding illustration-08.svg'
import wedding9   from '../assets/stickers/Wedding illustration-09.svg'
import wedding10  from '../assets/stickers/Wedding illustration-10.svg'

const STICKERS = [
  // Row 1 — top
  { src: bouquet1,   top: '1%',  left: '2%',  size: 120, rotate: -20, mobile: true  },
  { src: floral2,    top: '4%',  left: '24%', size: 72,  rotate:  15, mobile: false },
  { src: wedding1,   top: '2%',  left: '46%', size: 65,  rotate:  -8, mobile: false },
  { src: floral3,    top: '5%',  left: '67%', size: 78,  rotate:  20, mobile: true  },
  { src: wreath1,    top: '1%',  left: '84%', size: 100, rotate:  12, mobile: false },
  // Gap 1 (~10-16%)
  { src: floral6,    top: '11%', left: '14%', size: 68,  rotate: -18, mobile: false },
  { src: candles,    top: '12%', left: '50%', size: 65,  rotate:  10, mobile: true  },
  { src: groomShoe,  top: '10%', left: '74%', size: 62,  rotate:  -5, mobile: false },
  { src: floralGlass,top: '13%', left: '88%', size: 66,  rotate: -12, mobile: false },
  { src: floral1,    top: '15%', left: '38%', size: 60,  rotate: -12, mobile: false },
  { src: tag1,       top: '17%', left: '60%', size: 58,  rotate:  18, mobile: false },
  // Row 2 — upper-mid (~18-25%)
  { src: rings,      top: '20%', left: '8%',  size: 85,  rotate: -15, mobile: true  },
  { src: camera,     top: '18%', left: '36%', size: 75,  rotate: -22, mobile: false },
  { src: note,       top: '22%', left: '54%', size: 55,  rotate:  15, mobile: false },
  { src: heart,      top: '25%', left: '62%', size: 58,  rotate:   8, mobile: true  },
  { src: champagne,  top: '20%', left: '84%', size: 70,  rotate: -18, mobile: false },
  // Gap 2 (~29-38%)
  { src: wreath5,    top: '33%', left: '4%',  size: 85,  rotate: -22, mobile: false },
  { src: glasses,    top: '30%', left: '18%', size: 62,  rotate:  22, mobile: false },
  { src: groomBride1,top: '27%', left: '30%', size: 78,  rotate:  -8, mobile: true  },
  { src: wreath3,    top: '32%', left: '46%', size: 82,  rotate: -14, mobile: false },
  { src: wedding2,   top: '36%', left: '58%', size: 65,  rotate:  14, mobile: false },
  { src: brideShoe,  top: '29%', left: '74%', size: 60,  rotate:  10, mobile: false },
  { src: wedding6,   top: '35%', left: '82%', size: 68,  rotate:  16, mobile: false },
  // Row 3 — center (~40-44%)
  { src: bird,       top: '42%', left: '3%',  size: 65,  rotate:  25, mobile: true  },
  { src: floral5,    top: '40%', left: '28%', size: 82,  rotate: -28, mobile: false },
  { src: costume,    top: '45%', left: '44%', size: 64,  rotate: -14, mobile: true  },
  { src: bow,        top: '44%', left: '58%', size: 62,  rotate:  18, mobile: false },
  { src: candle,     top: '40%', left: '82%', size: 68,  rotate: -10, mobile: false },
  // Gap 3 (~49-58%)
  { src: tag2,       top: '48%', left: '6%',  size: 55,  rotate:  28, mobile: false },
  { src: floral7,    top: '51%', left: '20%', size: 74,  rotate:  20, mobile: false },
  { src: groom,      top: '50%', left: '46%', size: 70,  rotate:  -6, mobile: true  },
  { src: wreath4,    top: '52%', left: '70%', size: 78,  rotate:   8, mobile: false },
  { src: wedding7,   top: '54%', left: '86%', size: 70,  rotate: -20, mobile: false },
  { src: groomBride2,top: '57%', left: '32%', size: 76,  rotate:  10, mobile: false },
  // Row 4 — lower-mid (~60-65%)
  { src: floral4,    top: '62%', left: '10%', size: 90,  rotate:  15, mobile: true  },
  { src: ribbon,     top: '60%', left: '38%', size: 78,  rotate: -25, mobile: false },
  { src: wedding3,   top: '65%', left: '64%', size: 72,  rotate:  20, mobile: false },
  { src: wreath2,    top: '62%', left: '84%', size: 88,  rotate: -12, mobile: true  },
  // Gap 4 (~68-79%)
  { src: wedding8,   top: '68%', left: '6%',  size: 66,  rotate:  20, mobile: false },
  { src: wedding4,   top: '71%', left: '22%', size: 70,  rotate: -18, mobile: false },
  { src: wreath6,    top: '67%', left: '42%', size: 82,  rotate: -10, mobile: true  },
  { src: floral8,    top: '73%', left: '50%', size: 68,  rotate:  15, mobile: false },
  { src: bride,      top: '70%', left: '76%', size: 74,  rotate:  -8, mobile: false },
  { src: wedding9,   top: '75%', left: '64%', size: 70,  rotate: -16, mobile: false },
  { src: wedding10,  top: '78%', left: '18%', size: 68,  rotate:  24, mobile: false },
  { src: church,     top: '76%', left: '86%', size: 74,  rotate:   6, mobile: false },
  // Row 5 — bottom (~81-89%)
  { src: bouquet2,   top: '81%', left: '5%',  size: 112, rotate: -12, mobile: true  },
  { src: wineBottle, top: '84%', left: '28%', size: 62,  rotate:  12, mobile: false },
  { src: tag1,       top: '89%', left: '40%', size: 52,  rotate:  10, mobile: false },
  { src: floral9,    top: '82%', left: '50%', size: 68,  rotate: -15, mobile: true  },
  { src: letter,     top: '83%', left: '70%', size: 65,  rotate:  22, mobile: false },
  { src: floralGlass,top: '87%', left: '60%', size: 62,  rotate: -20, mobile: false },
  { src: wedding5,   top: '81%', left: '86%', size: 78,  rotate:  -8, mobile: false },
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
