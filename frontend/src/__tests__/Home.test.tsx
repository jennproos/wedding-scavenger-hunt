import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { SessionProvider } from '../context/SessionContext'

vi.mock('../api/client', () => ({
  startGame: vi.fn().mockResolvedValue({
    session_id: 'test-session-id',
    clue_text: 'Find the gift table',
  }),
}))

import { Home } from '../pages/Home'
import { startGame } from '../api/client'

function renderHome({ withSession = false } = {}) {
  if (withSession) {
    localStorage.setItem(
      'scavenger_session',
      JSON.stringify({ session_id: 'sess-1', current_clue: 'Find the bar', completed: false }),
    )
  }
  return render(
    <MemoryRouter initialEntries={['/']}>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<div data-testid="game-page" />} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.mocked(startGame).mockClear()
})

test('renders the couple names', () => {
  renderHome()
  expect(screen.getByText(/Jenn & Cole/)).toBeInTheDocument()
})

test('renders the wedding date', () => {
  renderHome()
  expect(screen.getByText(/May 9, 2026/)).toBeInTheDocument()
})

test('renders the start button', () => {
  renderHome()
  expect(screen.getByRole('button')).toBeInTheDocument()
})

test('clicking Start calls startGame and navigates to /game', async () => {
  renderHome()
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => {
    expect(startGame).toHaveBeenCalled()
  })
})
