import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { SessionProvider } from '../context/SessionContext'

vi.mock('../api/client', () => ({
  startGame: vi.fn(),
}))

import { Home } from '../pages/Home'

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
          <Route path="/name" element={<div data-testid="name-page" />} />
          <Route path="/game" element={<div data-testid="game-page" />} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
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

test('clicking Start with no session navigates to /name', async () => {
  renderHome()
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => {
    expect(screen.getByTestId('name-page')).toBeInTheDocument()
  })
})

test('with an existing session, clicking Start navigates to /game without calling startGame', async () => {
  renderHome({ withSession: true })
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => {
    expect(screen.getByTestId('game-page')).toBeInTheDocument()
  })
})
