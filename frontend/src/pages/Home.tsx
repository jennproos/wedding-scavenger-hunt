import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startGame } from '../api/client'
import { useSession } from '../context/SessionContext'

export function Home() {
  const navigate = useNavigate()
  const { setSession } = useSession()
  const [loading, setLoading] = useState(false)

  async function handleStart() {
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
      <h1>Wedding Scavenger Hunt</h1>
      <p>Ready to explore? Your adventure begins here.</p>
      <button onClick={handleStart} disabled={loading}>
        {loading ? 'Starting…' : 'Start the Hunt'}
      </button>
    </div>
  )
}
