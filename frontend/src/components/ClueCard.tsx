import { useEffect, useState } from 'react'
import scrollSrc from '../assets/stickers/Scroll_Paper_Parchment.svg'

const TYPING_SPEED_MS = 14
const TYPING_DELAY_MS = 650

interface ClueCardProps {
  clue: string
  isFinal?: boolean
}

export function ClueCard({ clue, isFinal }: ClueCardProps) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (isFinal) return
    setDisplayed('')
    let intervalId: ReturnType<typeof setInterval> | null = null
    const startTimer = setTimeout(() => {
      let i = 0
      intervalId = setInterval(() => {
        i++
        setDisplayed(clue.slice(0, i))
        if (i >= clue.length) clearInterval(intervalId!)
      }, TYPING_SPEED_MS)
    }, TYPING_DELAY_MS)
    return () => {
      clearTimeout(startTimer)
      if (intervalId) clearInterval(intervalId)
    }
  }, [clue, isFinal])
  const fillMask = {
    WebkitMaskImage: `url(${scrollSrc})`,
    maskImage: `url(${scrollSrc})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
  }

  return (
    <div className="clue-card">
      <img src={scrollSrc} className="clue-card-bg" alt="" />
      <div className="clue-card-fill" style={fillMask} />
      <div className={`clue-card-text${isFinal ? ' clue-card-text--final' : ''}`}>
        {isFinal ? (
          <span className="clue-card-smiley" data-testid="clue-card-smiley">😊</span>
        ) : (
          displayed.split('\n').map((line, i) => (
            <p key={i} style={{ marginLeft: `${i * 0.6}rem` }}>{line}</p>
          ))
        )}
      </div>
    </div>
  )
}
