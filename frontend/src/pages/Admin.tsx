import { useEffect, useState } from 'react'
import { fetchLeaderboard, clearLeaderboard, verifyAdminPassword, ApiError } from '../api/client'
import type { LeaderboardEntry } from '../api/client'

type SortCol = 'name' | 'progress' | null
type SortDir = 'asc' | 'desc'

function sortEntries(entries: LeaderboardEntry[], col: SortCol, dir: SortDir): LeaderboardEntry[] {
  if (!col) return entries
  return [...entries].sort((a, b) => {
    if (col === 'name') {
      const cmp = a.player_name.localeCompare(b.player_name)
      return dir === 'asc' ? cmp : -cmp
    }
    const aScore = a.completed ? 999 : a.clue_number
    const bScore = b.completed ? 999 : b.clue_number
    // asc = most progress first
    return dir === 'asc' ? bScore - aScore : aScore - bScore
  })
}

function parseUTC(s: string): Date {
  return new Date(s.endsWith('Z') || s.includes('+') ? s : s + 'Z')
}

function formatDuration(startTime: string, completionTime: string): string {
  const start = parseUTC(startTime).getTime()
  const end = parseUTC(completionTime).getTime()
  const mins = Math.round((end - start) / 60000)
  return `${mins} min`
}

export function Admin() {
  const [authedPassword, setAuthedPassword] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [clearError, setClearError] = useState('')
  const [clearing, setClearing] = useState(false)
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function loadLeaderboard() {
    setLoading(true)
    fetchLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authedPassword) loadLeaderboard()
  }, [authedPassword])

  async function handleEnter() {
    setVerifying(true)
    setAuthError('')
    try {
      await verifyAdminPassword(passwordInput)
      setAuthedPassword(passwordInput)
      setPasswordInput('')
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setAuthError('Incorrect password')
      } else {
        setAuthError('Something went wrong')
      }
    } finally {
      setVerifying(false)
    }
  }

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  function indicator(col: SortCol) {
    if (sortCol !== col) return null
    return sortDir === 'asc' ? ' ▲' : ' ▼'
  }

  function handleClearClick() {
    setShowConfirm(true)
    setClearError('')
  }

  function handleCancel() {
    setShowConfirm(false)
    setClearError('')
  }

  async function handleConfirmClear() {
    setClearing(true)
    setClearError('')
    try {
      await clearLeaderboard(authedPassword)
      setShowConfirm(false)
      loadLeaderboard()
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setClearError('Incorrect password')
      } else {
        setClearError('Something went wrong')
      }
    } finally {
      setClearing(false)
    }
  }

  if (!authedPassword) {
    return (
      <div className="page">
        <h1>Admin</h1>
        <input
          type="password"
          placeholder="Admin password"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 6, border: 'none', fontSize: '1rem' }}
        />
        {authError && <p style={{ color: '#e05c5c', margin: '0.5rem 0 0' }}>{authError}</p>}
        <button className="btn-enter-code" onClick={handleEnter} disabled={verifying}>
          Enter
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="leaderboard-card" style={{ width: '100%', maxWidth: 600 }}>
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">Admin</h1>
        </div>
        {loading ? (
          <p className="leaderboard-loading">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="leaderboard-empty">No players yet</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th
                  role="columnheader"
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer' }}
                >
                  Name{indicator('name')}
                </th>
                <th
                  role="columnheader"
                  onClick={() => handleSort('progress')}
                  style={{ cursor: 'pointer' }}
                >
                  Progress{indicator('progress')}
                </th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {sortEntries(entries, sortCol, sortDir).map(entry => (
                <tr key={entry.session_id}>
                  <td>{entry.player_name}</td>
                  <td>
                    {entry.completed ? 'Done!' : `Clue ${entry.clue_number}`}
                  </td>
                  <td>
                    {entry.completed && entry.start_time && entry.completion_time
                      ? formatDuration(entry.start_time, entry.completion_time)
                      : entry.start_time
                      ? `${Math.round((Date.now() - parseUTC(entry.start_time).getTime()) / 60000)} min ago`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: '1.5rem' }}>
          {!showConfirm ? (
            <button className="btn-enter-code" onClick={handleClearClick}>
              Clear Leaderboard
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              {clearError && <p style={{ color: '#e05c5c', margin: 0 }}>{clearError}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-enter-code" onClick={handleConfirmClear} disabled={clearing}>
                  Confirm Clear
                </button>
                <button className="btn-enter-code" onClick={handleCancel} style={{ opacity: 0.7 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
