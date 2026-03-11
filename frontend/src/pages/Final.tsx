import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Confetti } from '../components/Confetti'
import { useSession } from '../context/SessionContext'
import homeIcon from '../assets/stickers/Home.svg'
import familyPhoto from '../assets/family-photo.jpg'

export function Final() {
  const navigate = useNavigate()
  const { clearSession } = useSession()

  useEffect(() => {
    clearSession()
  }, [])

  function handleHome() {
    navigate('/')
  }

  return (
    <div className="page final-page">
      <Confetti />
      <button className="btn-home" onClick={handleHome} aria-label="Home">
        <img src={homeIcon} className="btn-home-house" alt="" />
      </button>
      <div className="final-content">
        <img src={familyPhoto} className="final-photo" alt="The happy couple" />
        <h1 className="final-title">You did it!</h1>
        <p className="final-subtitle">Every clue cracked. Every code conquered.</p>
        <p className="final-subtitle">The treasure is yours — if you dare open it.</p>
        <p className="treasure-label">The lock code is:</p>
        <p className="treasure-code">0509</p>
      </div>
    </div>
  )
}
