import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startGame } from '../api/client'
import { useSession } from '../context/SessionContext'

export function Home() {
  const navigate = useNavigate()
  const { session, setSession } = useSession()
  const [loading, setLoading] = useState(false)

  const hasSession = session !== null && !session.completed

  async function handleStart() {
    if (hasSession) {
      navigate('/game')
      return
    }
    setLoading(true)
    try {
      const data = await startGame()
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
    <div className="page home-page">
      <div className="home-hero">
        <p className="home-date">May 9, 2026</p>
        <h1 className="home-names">Jenn &amp; Cole</h1>
        <p className="home-subtitle">Wedding Scavenger Hunt</p>
      </div>
      <button onClick={handleStart} disabled={loading}>
        {hasSession ? 'Return to the Hunt' : (loading ? 'Starting…' : 'Start the Hunt')}
      </button>
    </div>
  )
}
