import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { removeLeaderboardEntry } from '../api/client'
import { useSession } from '../context/SessionContext'
import heartsPiercedByAnArrow from '../assets/stickers/Hearts_Pierced_By_An_Arrow.svg'

export function Home() {
  const navigate = useNavigate()
  const { session, clearSession } = useSession()
  const [nudging, setNudging] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const hasSession = session !== null && !session.completed

  async function handleStart() {
    if (hasSession) {
      setShowModal(true)
      return
    }
    setNudging(true)
    setFadingOut(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    navigate('/name')
  }

  async function handleContinue() {
    setFadingOut(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    navigate('/game')
  }

  async function handleNewHunt() {
    if (session?.session_id) {
      removeLeaderboardEntry(session.session_id)
    }
    clearSession()
    setFadingOut(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    navigate('/name')
  }

  return (
    <div className={`page home-page${fadingOut ? ' fading-out' : ''}`}>
      <div className="home-hero">
        <p className="home-date">May 9, 2026</p>
        <h1 className="home-names">Jenn &amp; Cole</h1>
        <p className="home-subtitle">Wedding Scavenger Hunt</p>
      </div>
      <button className={`btn-start${nudging ? ' btn-start--nudging' : ''}`} onClick={handleStart}>
        <img src={heartsPiercedByAnArrow} className="btn-start-img" alt="" />
      </button>
      {showModal && (
        <div className="resume-overlay" role="dialog" aria-modal="true">
          <div className="resume-card">
            {session?.player_name ? (
              <p className="resume-greeting">Welcome back, {session.player_name}!</p>
            ) : (
              <p className="resume-greeting">Welcome back!</p>
            )}
            <div className="resume-actions">
              <button className="btn-resume-continue" onClick={handleContinue}>
                Continue the hunt
              </button>
              <button className="btn-resume-new" onClick={handleNewHunt}>
                Start a new hunt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
