import { useEffect, useState } from 'react'

interface Piece {
  id: number
  left: number
  color: string
  delay: number
  duration: number
}

const COLORS = ['#c4847a', '#7a9e7e', '#f5f0e8', '#e8c4a0', '#a0c4e8']

export function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    const generated: Piece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 3,
      duration: 2.5 + Math.random() * 2,
    }))
    setPieces(generated)
  }, [])

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
