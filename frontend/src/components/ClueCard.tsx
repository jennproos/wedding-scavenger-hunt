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
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (isFinal) return
    setDisplayed('')
    setIsTyping(false)
    let intervalId: ReturnType<typeof setInterval> | null = null
    const startTimer = setTimeout(() => {
      setIsTyping(true)
      let i = 0
      intervalId = setInterval(() => {
        i++
        setDisplayed(clue.slice(0, i))
        if (i >= clue.length) {
          clearInterval(intervalId!)
          setIsTyping(false)
        }
      }, TYPING_SPEED_MS)
    }, TYPING_DELAY_MS)
    return () => {
      clearTimeout(startTimer)
      if (intervalId) clearInterval(intervalId)
      setIsTyping(false)
    }
  }, [clue, isFinal])

  const fillMask = {
    WebkitMaskImage: `url(${scrollSrc})`,
    maskImage: `url(${scrollSrc})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
  }

  const lines = (isFinal ? clue : displayed).split('\n')

  return (
    <div className="clue-card">
      <img src={scrollSrc} className="clue-card-bg" alt="" />
      <div className="clue-card-fill" style={fillMask} />
      <div className="clue-card-text">
        {lines.map((line, i) => (
          <p key={i} style={{ marginLeft: `${i * 4}%` }}>
            {line}
            {isTyping && i === lines.length - 1 && <span className="typing-cursor" />}
          </p>
        ))}
      </div>
    </div>
  )
}
