import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { SessionProvider } from '../context/SessionContext'

vi.mock('../api/client', () => ({
  startGame: vi.fn(),
}))

import { Home } from '../pages/Home'

function renderHome({ withSession = false, playerName = '' } = {}) {
  if (withSession) {
    localStorage.setItem(
      'scavenger_session',
      JSON.stringify({
        session_id: 'sess-1',
        current_clue: 'Find the bar',
        completed: false,
        player_name: playerName,
      }),
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

test('renders the start button when no session', () => {
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

test('does not show resume modal on load', () => {
  renderHome({ withSession: true })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('clicking start with an active session shows the resume modal', () => {
  renderHome({ withSession: true })
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText(/continue/i)).toBeInTheDocument()
  expect(screen.getByText(/new hunt/i)).toBeInTheDocument()
})

test('resume modal shows player name when available', () => {
  renderHome({ withSession: true, playerName: 'Alice' })
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByText(/Alice/)).toBeInTheDocument()
})

test('clicking Continue in resume modal navigates to /game', async () => {
  renderHome({ withSession: true })
  fireEvent.click(screen.getByRole('button'))
  fireEvent.click(screen.getByText(/continue/i))
  await waitFor(() => {
    expect(screen.getByTestId('game-page')).toBeInTheDocument()
  })
})

test('clicking Start a new hunt in resume modal clears session and navigates to /name', async () => {
  renderHome({ withSession: true })
  fireEvent.click(screen.getByRole('button'))
  fireEvent.click(screen.getByText(/new hunt/i))
  await waitFor(() => {
    expect(screen.getByTestId('name-page')).toBeInTheDocument()
  })
  expect(localStorage.getItem('scavenger_session')).toBeNull()
})
