import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClueCard } from '../components/ClueCard'
import { QRScanner } from '../components/QRScanner'
import { scanToken } from '../api/client'
import { useSession } from '../context/SessionContext'

export function Game() {
  const navigate = useNavigate()
  const { session, setSession } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const handleScan = useCallback(
    async (token: string) => {
      if (!session || scanning) return
      setScanning(true)
      setError(null)
      try {
        const result = await scanToken(session.session_id, token)
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
      } finally {
        setScanning(false)
      }
    },
    [session, scanning, setSession, navigate],
  )

  if (!session) {
    return (
      <div className="page">
        <p>No active session. <a href="/">Start a new hunt</a>.</p>
      </div>
    )
  }

  return (
    <div className="page game-page">
      <ClueCard clue={session.current_clue} />
      {error && <p className="error-message">{error}</p>}
      <QRScanner onScan={handleScan} />
    </div>
  )
}
