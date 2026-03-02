import { useNavigate } from 'react-router-dom'
import { Confetti } from '../components/Confetti'
import { useSession } from '../context/SessionContext'
import homeIcon from '../assets/stickers/Home.svg'

export function Final() {
  const navigate = useNavigate()
  const { clearSession } = useSession()

  function handleHome() {
    clearSession()
    navigate('/')
  }

  return (
    <div className="page final-page">
      <Confetti />
      <button className="btn-home" onClick={handleHome} aria-label="Home">
        <img src={homeIcon} className="btn-home-house" alt="" />
      </button>
      <div className="final-content">
        <div className="cat-placeholder" aria-label="The cats">
          {/* Replace with <img src="/cat.jpg" alt="The cats" /> when ready */}
        </div>
        <h1>You have unlocked</h1>
        <h2>THE TRUE MASTERS OF THE HOUSE.</h2>
        <p className="claim">Take 1 treat per guest below!</p>
        <p className="footer">Choose wisely. Chaos is watching.</p>
      </div>
    </div>
  )
}
