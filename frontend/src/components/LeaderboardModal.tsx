import { useEffect, useState } from 'react'
import { fetchLeaderboard } from '../api/client'
import type { LeaderboardEntry } from '../api/client'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type SortCol = 'name' | 'progress' | null
type SortDir = 'asc' | 'desc'

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

function sortEntries(entries: LeaderboardEntry[], col: SortCol, dir: SortDir): LeaderboardEntry[] {
  if (!col) return entries
  return [...entries].sort((a, b) => {
    if (col === 'name') {
      const cmp = a.player_name.localeCompare(b.player_name)
      return dir === 'asc' ? cmp : -cmp
    }
    // progress: completed > in-progress; within in-progress, higher clue_number first
    const aScore = a.completed ? 999 : a.clue_number
    const bScore = b.completed ? 999 : b.clue_number
    // asc = most progress first
    return dir === 'asc' ? bScore - aScore : aScore - bScore
  })
}

export function LeaderboardModal({ isOpen, onClose }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetchLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [isOpen])

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

  if (!isOpen) return null

  const displayed = sortEntries(entries, sortCol, sortDir)

  return (
    <div className="leaderboard-overlay" role="dialog" aria-modal="true">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h2 className="leaderboard-title">leaderboard</h2>
          <button
            className="leaderboard-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
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
              </tr>
            </thead>
            <tbody>
              {displayed.map(entry => (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
