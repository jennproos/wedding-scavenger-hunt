import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Final } from '../pages/Final'
import { SessionProvider } from '../context/SessionContext'
import type { SessionState } from '../context/SessionContext'

function renderWithSession(session: SessionState | null) {
  if (session) {
    localStorage.setItem('scavenger_session', JSON.stringify(session))
  } else {
    localStorage.removeItem('scavenger_session')
  }
  return render(
    <MemoryRouter initialEntries={['/final']}>
      <SessionProvider>
        <Routes>
          <Route path="/final" element={<Final />} />
          <Route path="/" element={<div>home page</div>} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  )
}

test('redirects to / when no session exists', () => {
  renderWithSession(null)
  expect(screen.getByText('home page')).toBeInTheDocument()
})

test('redirects to / when session is not completed', () => {
  renderWithSession({
    session_id: 'abc',
    current_clue: 'some clue',
    completed: false,
    player_name: 'Tester',
  })
  expect(screen.getByText('home page')).toBeInTheDocument()
})

test('renders final page when session is completed', () => {
  renderWithSession({
    session_id: 'abc',
    current_clue: 'some clue',
    completed: true,
    player_name: 'Tester',
  })
  expect(screen.getByText(/YOU DID IT/i)).toBeInTheDocument()
})

test('renders the prize message', () => {
  render(
    <MemoryRouter>
      <SessionProvider>
        <Final />
      </SessionProvider>
    </MemoryRouter>,
  )
  expect(screen.getByText(/You have unlocked/i)).toBeInTheDocument()
  expect(screen.getByText(/TRUE MASTERS OF THE HOUSE/i)).toBeInTheDocument()
})

test('renders claim instruction', () => {
  render(
    <MemoryRouter>
      <SessionProvider>
        <Final />
      </SessionProvider>
    </MemoryRouter>,
  )
  expect(screen.getByText(/Take 1 treat per guest below/i)).toBeInTheDocument()
})

test('renders confetti', () => {
  const { container } = render(
    <MemoryRouter>
      <SessionProvider>
        <Final />
      </SessionProvider>
    </MemoryRouter>,
  )
  expect(container.querySelector('.confetti')).toBeInTheDocument()
})
