import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import { StickerBackground } from './components/StickerBackground'
import { Home } from './pages/Home'
import { NameEntry } from './pages/NameEntry'
import { Game } from './pages/Game'
import { Final } from './pages/Final'

const weddingTime = new Date('2026-05-09T17:00:00')
const copyrightName = new Date() >= weddingTime ? 'Jenn Randall' : 'Jenn Proos'

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <StickerBackground />
        <p className="copyright">© {copyrightName}</p>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/name" element={<NameEntry />} />
          <Route path="/game" element={<Game />} />
          <Route path="/final" element={<Final />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  )
}
