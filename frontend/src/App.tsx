import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import { StickerBackground } from './components/StickerBackground'
import { Home } from './pages/Home'
import { Game } from './pages/Game'
import { Final } from './pages/Final'

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <StickerBackground />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/final" element={<Final />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  )
}
