import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchLeaderboard, clearLeaderboard, verifyAdminPassword, removeLeaderboardEntry, ApiError } from '../api/client'
import homeIcon from '../assets/stickers/Home.svg'
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

function formatTimestamp(timeStr: string): string {
  return parseUTC(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDuration(startTime: string, completionTime: string): string {
  const secs = Math.round((parseUTC(completionTime).getTime() - parseUTC(startTime).getTime()) / 1000)
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function Admin() {
  const navigate = useNavigate()
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
  const [pendingDelete, setPendingDelete] = useState<LeaderboardEntry | null>(null)

  function loadLeaderboard() {
    setLoading(true)
    fetchLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false))
  }

  async function handleDeleteEntry() {
    if (!pendingDelete) return
    await removeLeaderboardEntry(pendingDelete.session_id)
    setEntries(prev => prev.filter(e => e.session_id !== pendingDelete.session_id))
    setPendingDelete(null)
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
      <div className="page admin-page">
        <div className="admin-nav">
          <button className="btn-home" onClick={() => navigate('/')} aria-label="Home">
            <img src={homeIcon} className="btn-home-house" alt="" />
          </button>
          <span className="admin-nav-title">Admin</span>
        </div>
        <input
          type="password"
          placeholder="admin password"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleEnter() }}
          className="name-input"
        />
        {authError && <p className="name-error">{authError}</p>}
        <button className="btn-enter-code" onClick={handleEnter} disabled={verifying}>
          Enter
        </button>
      </div>
    )
  }

  return (
    <div className="page admin-page">
      <div className="admin-nav">
        <button className="btn-home" onClick={() => navigate('/')} aria-label="Home">
          <img src={homeIcon} className="btn-home-house" alt="" />
        </button>
        <span className="admin-nav-title">Admin</span>
      </div>
      <div className="leaderboard-card" style={{ width: '100%', maxWidth: 600 }}>
        <div className="leaderboard-header">
          <button
            className="admin-refresh-btn"
            onClick={loadLeaderboard}
            disabled={loading}
            aria-label="Refresh"
          >
            ↻
          </button>
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
                <th>Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortEntries(entries, sortCol, sortDir).map(entry => (
                <tr key={entry.session_id}>
                  <td>{entry.player_name}</td>
                  <td>
                    {entry.completed ? 'done!' : `clue ${entry.clue_number}`}
                  </td>
                  <td>
                    {entry.start_time ? formatTimestamp(entry.start_time) : '—'}
                  </td>
                  <td>
                    {entry.completed && entry.start_time && entry.completion_time
                      ? formatDuration(entry.start_time, entry.completion_time)
                      : '—'}
                  </td>
                  <td>
                    <button className="admin-delete-btn" onClick={() => setPendingDelete(entry)} aria-label={`Delete ${entry.player_name}`}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: '1.5rem' }}>
          {!showConfirm ? (
            entries.length > 0 && (
              <button className="btn-enter-code" onClick={handleClearClick}>
                Clear Leaderboard
              </button>
            )
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
      {pendingDelete && (
        <div className="resume-overlay" role="dialog" aria-modal="true">
          <div className="resume-card">
            <p className="resume-greeting">are you sure you want to remove <strong>{pendingDelete.player_name}</strong> from the hunt??</p>
            <div className="resume-actions">
              <button className="btn-resume-continue" onClick={handleDeleteEntry}>yep, bye!</button>
              <button className="btn-resume-new" onClick={() => setPendingDelete(null)}>nvm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
