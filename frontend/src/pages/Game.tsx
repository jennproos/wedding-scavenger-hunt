import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClueCard } from '../components/ClueCard'
import { CodeInput } from '../components/CodeInput'
import { scanToken, devAdvance, devBack } from '../api/client'
import { useSession } from '../context/SessionContext'
import swirlyArrow from '../assets/stickers/Swirly_Arrow.png'


export function Game() {
  const navigate = useNavigate()
  const { session, setSession, clearSession } = useSession()
  const [error, setError] = useState<string | null>(null)

  const DEV = import.meta.env.VITE_DEV_OVERRIDE === 'true'

  const handleScan = useCallback(
    async (code: string) => {
      if (!session) return
      setError(null)
      const result = await scanToken(session.session_id, code)
      if (!result.success) {
        setError(result.message)
        return
      }
      if (result.completed) {
        setSession({ ...session, completed: true })
        navigate('/final')
        return
      }
      if (result.next_clue) {
        setSession({ ...session, current_clue: result.next_clue })
      }
    },
    [session, setSession, navigate],
  )

  const handleDevAdvance = useCallback(async () => {
    if (!session) return
    const result = await devAdvance(session.session_id)
    if (!result.success) {
      setError(result.message)
      return
    }
    if (result.completed) {
      setSession({ ...session, completed: true })
      navigate('/final')
      return
    }
    if (result.next_clue) {
      setSession({ ...session, current_clue: result.next_clue })
    }
  }, [session, setSession, navigate])

  const handleDevBack = useCallback(async () => {
    if (!session) return
    const result = await devBack(session.session_id)
    if (!result.success) {
      setError(result.message)
      return
    }
    if (result.next_clue) {
      setSession({ ...session, current_clue: result.next_clue })
    }
  }, [session, setSession])

  if (!session) {
    return (
      <div className="page">
        <p>No active session. <a href="/">Start a new hunt</a>.</p>
      </div>
    )
  }

  function handleHome() {
    clearSession()
    navigate('/')
  }

  return (
    <div className="page game-page">
      <button className="btn-home" onClick={handleHome}>
        <img src={swirlyArrow} alt="Home" />
      </button>
      <ClueCard clue={session.current_clue} />
      {error && <p className="error-message">{error}</p>}
      <CodeInput onSubmit={handleScan} />
      {DEV && (
        <div className="dev-controls">
          <span className="dev-label">DEV</span>
          <button onClick={handleDevBack}>← Back</button>
          <button onClick={handleDevAdvance}>Skip →</button>
        </div>
      )}
    </div>
  )
}
