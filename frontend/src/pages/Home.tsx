import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startGame } from '../api/client'
import { useSession } from '../context/SessionContext'
import cloudSrc from '../assets/stickers/Cloud.svg'

export function Home() {
  const navigate = useNavigate()
  const { session, setSession } = useSession()
  const [loading, setLoading] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  const hasSession = session !== null && !session.completed

  async function handleStart() {
    setFadingOut(true)
    const fadeDelay = new Promise(resolve => setTimeout(resolve, 500))
    if (hasSession) {
      await fadeDelay
      navigate('/game')
      return
    }
    setLoading(true)
    try {
      const [data] = await Promise.all([startGame(), fadeDelay])
      setSession({
        session_id: data.session_id,
        current_clue: data.clue_text,
        completed: false,
      })
      navigate('/game')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`page home-page${fadingOut ? ' fading-out' : ''}`}>
      <div className="home-hero">
        <p className="home-date">May 9, 2026</p>
        <h1 className="home-names">Jenn &amp; Cole</h1>
        <p className="home-subtitle">Wedding Scavenger Hunt</p>
      </div>
      <button onClick={handleStart} disabled={loading}>
        <img src={cloudSrc} className="cloud-btn-bg" alt="" />
        <span className="cloud-btn-text">
          {hasSession ? 'return to the hunt' : 'start the hunt'}
        </span>
      </button>
    </div>
  )
}
