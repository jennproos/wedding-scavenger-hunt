import { useState } from 'react'
import champagneSrc from '../assets/stickers/Champagne.svg'

const COLORS = ['#c4847a', '#f5c06e', '#7a9e7e', '#f5f0e8', '#e8d4a0', '#ffd700', '#c4a87a']

interface Particle {
  id: number
  tx: number
  ty: number
  color: string
  size: number
}

export function ChampagnePop() {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
      const distance = 90 + Math.random() * 110
      return {
        id: i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        color: COLORS[i % COLORS.length],
        size: 7 + Math.random() * 9,
      }
    }),
  )

  return (
    <div className="champagne-overlay" aria-hidden="true" data-testid="champagne-pop">
      <img src={champagneSrc} className="champagne-bottle" alt="" />
      {particles.map((p) => (
        <div
          key={p.id}
          className="champagne-particle"
          style={
            {
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
