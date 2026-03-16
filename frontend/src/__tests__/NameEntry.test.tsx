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
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
}))

import { NameEntry } from '../pages/NameEntry'
import { startGame, ApiError } from '../api/client'

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
  expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(1)
})

test('back button navigates to the home page', async () => {
  renderNameEntry()
  fireEvent.click(screen.getByRole('button', { name: /back/i }))
  await waitFor(() => {
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })
})

test('submitting a valid name calls startGame and navigates to /game', async () => {
  renderNameEntry()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } })
  fireEvent.click(screen.getByRole('button', { name: /start the hunt/i }))
  await waitFor(() => {
    expect(startGame).toHaveBeenCalledWith('Alice')
    expect(screen.getByTestId('game-page')).toBeInTheDocument()
  })
})

test('submitting without a name shows an error and does not call startGame', async () => {
  renderNameEntry()
  fireEvent.click(screen.getByRole('button', { name: /start the hunt/i }))
  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
  expect(startGame).not.toHaveBeenCalled()
})

test('shows an error when the name is already taken (409)', async () => {
  vi.mocked(startGame).mockRejectedValueOnce(new ApiError(409, 'That name is already on the hunt!'))
  renderNameEntry()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } })
  fireEvent.click(screen.getByRole('button', { name: /start the hunt/i }))
  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('already')
  })
})

test('name longer than 30 chars shows an error', async () => {
  renderNameEntry()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'A'.repeat(31) } })
  fireEvent.click(screen.getByRole('button', { name: /start the hunt/i }))
  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
  expect(startGame).not.toHaveBeenCalled()
})
