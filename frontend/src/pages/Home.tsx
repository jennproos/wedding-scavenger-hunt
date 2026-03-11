import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import heartsPiercedByAnArrow from '../assets/stickers/Hearts_Pierced_By_An_Arrow.svg'

export function Home() {
  const navigate = useNavigate()
  const { session } = useSession()
  const [nudging, setNudging] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  const hasSession = session !== null && !session.completed

  async function handleStart() {
    setNudging(true)
    setFadingOut(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    navigate(hasSession ? '/game' : '/name')
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
    </div>
  )
}
