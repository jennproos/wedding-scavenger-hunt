import { Confetti } from '../components/Confetti'

export function Final() {
  return (
    <div className="page final-page">
      <Confetti />
      <div className="final-content">
        <div className="cat-placeholder" aria-label="The cats">
          {/* Replace with <img src="/cat.jpg" alt="The cats" /> when ready */}
        </div>
        <h1>You have unlocked</h1>
        <h2>THE TRUE MASTERS OF THE HOUSE.</h2>
        <p className="claim">Show this screen to claim your treasure.</p>
        <p className="footer">Choose wisely. Chaos is watching.</p>
      </div>
    </div>
  )
}
