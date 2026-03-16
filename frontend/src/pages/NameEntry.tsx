import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startGame, ApiError } from '../api/client'
import { useSession } from '../context/SessionContext'
import heartsPiercedByAnArrow from '../assets/stickers/Hearts_Pierced_By_An_Arrow.svg'
import swirlyArrow from '../assets/stickers/Swirly_Arrow.png'

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
    ;(document.activeElement as HTMLElement)?.blur()
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
    } catch (err) {
      setLoading(false)
      setFadingOut(false)
      setNudging(false)
      if (err instanceof ApiError && err.status === 409) {
        setNameError('That name is already on the hunt! Try a different one.')
      } else {
        throw err
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`page name-entry-page${fadingOut ? ' fading-out' : ''}`}>
      <button className="btn-home" onClick={() => navigate('/')} aria-label="Back">
        <img src={swirlyArrow} alt="" />
      </button>
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
        aria-label="Start the hunt"
      >
        <img src={heartsPiercedByAnArrow} className="btn-start-img" alt="" />
      </button>
    </div>
  )
}
