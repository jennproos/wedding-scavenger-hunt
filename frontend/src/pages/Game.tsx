import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClueCard } from '../components/ClueCard'
import { CodeInput } from '../components/CodeInput'
import { LeaderboardModal } from '../components/LeaderboardModal'
import { scanToken, devAdvance, devBack, backClue, ApiError } from '../api/client'
import { useSession } from '../context/SessionContext'
import swirlyArrow from '../assets/stickers/Swirly_Arrow.png'
import homeIcon from '../assets/stickers/Home.svg'


export function Game() {
  const navigate = useNavigate()
  const { session, setSession, clearSession } = useSession()
  const [clueKey, setClueKey] = useState(0)
  const [fadingOut, setFadingOut] = useState(false)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const pendingRef = useRef<{ completed: boolean; next_clue?: string; is_final_clue?: boolean; session: typeof session } | null>(null)

  const DEV = import.meta.env.VITE_DEV_OVERRIDE === 'true'

  const handleScan = useCallback(
    async (code: string): Promise<boolean> => {
      if (!session) return false
      try {
        const result = await scanToken(session.session_id, code)
        if (!result.success) return false
        pendingRef.current = { completed: result.completed, next_clue: result.next_clue, is_final_clue: result.is_final_clue, session }
        return true
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // Session expired (backend restarted) — clear and restart
          clearSession()
          navigate('/')
        }
        return false
      }
    },
    [session, clearSession, navigate],
  )

  const handleSuccessReady = useCallback(() => {
    setCodeModalOpen(false)
    const pending = pendingRef.current
    if (!pending || !pending.session) return
    pendingRef.current = null
    if (pending.completed) {
      setSession({ ...pending.session, completed: true })
      navigate('/final')
    } else if (pending.next_clue) {
      setFadingOut(true)
      setTimeout(() => {
        setFadingOut(false)
        setClueKey(k => k + 1)
        setSession({
          ...pending.session!,
          current_clue: pending.next_clue!,
          is_final_clue: pending.is_final_clue,
          clue_number: (pending.session!.clue_number ?? 1) + 1,
        })
      }, 400)
    }
  }, [setSession, navigate])

  const handleDevAdvance = useCallback(async () => {
    if (!session) return
    const result = await devAdvance(session.session_id)
    if (!result.success) return
    if (result.completed) {
      setSession({ ...session, completed: true })
      navigate('/final')
      return
    }
    if (result.next_clue) {
      setSession({ ...session, current_clue: result.next_clue, clue_number: (session.clue_number ?? 1) + 1 })
    }
  }, [session, setSession, navigate])

  const handleDevBack = useCallback(async () => {
    if (!session) return
    const result = await devBack(session.session_id)
    if (!result.success) return
    if (result.next_clue) {
      setSession({ ...session, current_clue: result.next_clue, clue_number: Math.max(1, (session.clue_number ?? 1) - 1) })
    }
  }, [session, setSession])

  const handleBack = useCallback(async () => {
    if (!session) return
    if ((session.clue_number ?? 1) <= 1) {
      clearSession()
      navigate('/')
      return
    }
    const result = await backClue(session.session_id)
    if (!result.success || !result.next_clue) return
    setFadingOut(true)
    setTimeout(() => {
      setFadingOut(false)
      setClueKey(k => k + 1)
      setSession({
        ...session,
        current_clue: result.next_clue!,
        is_final_clue: result.is_final_clue,
        clue_number: Math.max(1, (session.clue_number ?? 1) - 1),
      })
    }, 400)
  }, [session, clearSession, navigate, setSession])

  if (!session) {
    return (
      <div className="page">
        <p>No active session. <a href="/">Start a new hunt</a>.</p>
      </div>
    )
  }

  return (
    <div className="page game-page">
      <div className="btn-nav">
        <div className="btn-nav-left">
          <button className="btn-home" onClick={handleBack} aria-label="Back">
            <img src={swirlyArrow} alt="" />
          </button>
          <button className="btn-home" onClick={() => navigate('/')} aria-label="Home">
            <img src={homeIcon} className="btn-home-house" alt="" />
          </button>
        </div>
        {session.player_name && (
          <div className="player-name-bar">
            <span className="player-name-text">{session.player_name}</span>
            <button className="trophy-btn" onClick={() => setLeaderboardOpen(true)} aria-label="Open leaderboard">🏆</button>
          </div>
        )}
      </div>
      <p className="clue-number-label">
        <span className="clue-number-word">clue</span>{session.clue_number ?? 1}
      </p>
      <div className={`clue-wrapper${fadingOut ? ' clue-wrapper--fading-out' : ''}`}>
        <ClueCard key={clueKey} clue={session.current_clue} isFinal={session.is_final_clue} />
      </div>
      <div className="game-input-area">
        <button className="btn-enter-code" onClick={() => setCodeModalOpen(true)}>
          enter code
        </button>
      </div>
      {DEV && (
        <div className="dev-controls">
          <span className="dev-label">DEV</span>
          <button onClick={handleDevBack}>← Back</button>
          <button onClick={handleDevAdvance}>Skip →</button>
        </div>
      )}
      {codeModalOpen && (
        <div className="code-entry-overlay" onClick={() => setCodeModalOpen(false)}>
          <div className="code-entry-sheet" onClick={e => e.stopPropagation()}>
            <button className="code-entry-close" onClick={() => setCodeModalOpen(false)} aria-label="Close">✕</button>
            <CodeInput key={clueKey} onSubmit={handleScan} onSuccessReady={handleSuccessReady} />
          </div>
        </div>
      )}
      <LeaderboardModal isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
    </div>
  )
}
