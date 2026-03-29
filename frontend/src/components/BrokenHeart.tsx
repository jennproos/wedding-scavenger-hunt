import { useState } from 'react'
import heartSrc from '../assets/stickers/Heart.svg'

const COLORS = ['#c4847a', '#e8b4b0', '#7a9e7e', '#d4a0a0', '#c4847a', '#f5c06e', '#b8827e']

interface Particle {
  id: number
  tx: number
  ty: number
  color: string
  size: number
}

export function BrokenHeart() {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
      const distance = 60 + Math.random() * 80
      return {
        id: i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        color: COLORS[i % COLORS.length],
        size: 5 + Math.random() * 7,
      }
    }),
  )

  return (
    <div className="broken-heart-overlay" aria-hidden="true" data-testid="broken-heart">
      <div className="broken-heart-container">
        <img src={heartSrc} className="broken-heart-half broken-heart-left" alt="" />
        <img src={heartSrc} className="broken-heart-half broken-heart-right" alt="" />
      </div>
      {particles.map((p) => (
        <div
          key={p.id}
          className="broken-heart-particle"
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
