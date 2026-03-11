import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { SessionProvider } from '../context/SessionContext'

vi.mock('../api/client', () => ({
  startGame: vi.fn().mockResolvedValue({
    session_id: 'test-session-id',
    clue_text: 'Find the gift table',
    player_name: 'Alice',
  }),
}))

import { NameEntry } from '../pages/NameEntry'
import { startGame } from '../api/client'

function renderNameEntry() {
  return render(
    <MemoryRouter initialEntries={['/name']}>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<div data-testid="home-page" />} />
          <Route path="/name" element={<NameEntry />} />
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

test('renders a name input', () => {
  renderNameEntry()
  expect(screen.getByRole('textbox')).toBeInTheDocument()
})

test('renders a submit button', () => {
  renderNameEntry()
  expect(screen.getByRole('button')).toBeInTheDocument()
})

test('submitting a valid name calls startGame and navigates to /game', async () => {
  renderNameEntry()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } })
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => {
    expect(startGame).toHaveBeenCalledWith('Alice')
    expect(screen.getByTestId('game-page')).toBeInTheDocument()
  })
})

test('submitting without a name shows an error and does not call startGame', async () => {
  renderNameEntry()
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
  expect(startGame).not.toHaveBeenCalled()
})

test('name longer than 30 chars shows an error', async () => {
  renderNameEntry()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'A'.repeat(31) } })
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
  expect(startGame).not.toHaveBeenCalled()
})
