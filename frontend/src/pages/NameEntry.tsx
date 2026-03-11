import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startGame } from '../api/client'
import { useSession } from '../context/SessionContext'
import heartsPiercedByAnArrow from '../assets/stickers/Hearts_Pierced_By_An_Arrow.svg'

export function NameEntry() {
  const navigate = useNavigate()
  const { setSession } = useSession()
  const [playerName, setPlayerName] = useState('')
  const [nameError, setNameError] = useState('')
  const [loading, setLoading] = useState(false)
  const [nudging, setNudging] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  function validate(name: string): string {
    if (!name.trim()) return 'Please enter your name'
    if (name.length > 30) return 'Name must be 30 characters or less'
    return ''
  }

  async function handleSubmit() {
    const error = validate(playerName)
    if (error) {
      setNameError(error)
      return
    }
    setNameError('')
    setNudging(true)
    setFadingOut(true)
    const fadeDelay = new Promise(resolve => setTimeout(resolve, 500))
    setLoading(true)
    try {
      const [data] = await Promise.all([startGame(playerName.trim()), fadeDelay])
      setSession({
        session_id: data.session_id,
        current_clue: data.clue_text,
        completed: false,
        is_final_clue: false,
        clue_number: 1,
        player_name: data.player_name,
      })
      navigate('/game')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`page name-entry-page${fadingOut ? ' fading-out' : ''}`}>
      <div className="name-entry-hero">
        <p className="home-subtitle">Who's on the hunt?</p>
      </div>
      <div className="name-input-wrapper">
        <input
          className="name-input"
          type="text"
          placeholder="Your name"
          maxLength={31}
          value={playerName}
          onChange={e => {
            setPlayerName(e.target.value)
            if (nameError) setNameError('')
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          aria-label="Your name"
          autoFocus
        />
        {nameError && (
          <p className="name-error" role="alert">{nameError}</p>
        )}
      </div>
      <button
        className={`btn-start${nudging ? ' btn-start--nudging' : ''}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        <img src={heartsPiercedByAnArrow} className="btn-start-img" alt="" />
      </button>
    </div>
  )
}
