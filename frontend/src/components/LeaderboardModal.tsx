import { useEffect, useState } from 'react'
import { fetchLeaderboard } from '../api/client'
import type { LeaderboardEntry } from '../api/client'

interface Props {
  isOpen: boolean
  onClose: () => void
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

export function LeaderboardModal({ isOpen, onClose }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetchLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="leaderboard-overlay" role="dialog" aria-modal="true">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h2 className="leaderboard-title">Leaderboard</h2>
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
                <th>Name</th>
                <th>Progress</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
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
      </div>
    </div>
  )
}
