import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { SessionProvider } from '../context/SessionContext'

// Mock QRScanner so we control when onScan fires
let capturedOnScan: ((token: string) => void) | null = null
vi.mock('../components/QRScanner', () => ({
  QRScanner: ({ onScan }: { onScan: (token: string) => void }) => {
    capturedOnScan = onScan
    return <div data-testid="mock-qr-scanner" />
  },
}))

vi.mock('../api/client', () => ({
  scanToken: vi.fn(),
}))

import { Game } from '../pages/Game'
import { scanToken } from '../api/client'

function renderGame(clue = 'Find the gift table') {
  localStorage.setItem(
    'scavenger_session',
    JSON.stringify({ session_id: 'sess-1', current_clue: clue, completed: false }),
  )
  return render(
    <MemoryRouter initialEntries={['/game']}>
      <SessionProvider>
        <Routes>
          <Route path="/game" element={<Game />} />
          <Route path="/final" element={<div data-testid="final-page" />} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  capturedOnScan = null
  vi.mocked(scanToken).mockReset()
})

test('displays the current clue', () => {
  renderGame('Find the gift table')
  expect(screen.getByText(/Find the gift table/)).toBeInTheDocument()
})

test('shows playful error on wrong scan', async () => {
  vi.mocked(scanToken).mockResolvedValue({
    success: false,
    message: 'Patience, explorer 👀',
    completed: false,
  })
  renderGame()
  capturedOnScan!('wrong-token')
  await waitFor(() => {
    expect(screen.getByText(/Patience/)).toBeInTheDocument()
  })
})

test('updates clue on correct scan', async () => {
  vi.mocked(scanToken).mockResolvedValue({
    success: true,
    message: 'Onward!',
    next_clue: 'Find the bar',
    completed: false,
  })
  renderGame()
  capturedOnScan!('correct-token')
  await waitFor(() => {
    expect(screen.getByText(/Find the bar/)).toBeInTheDocument()
  })
})

test('navigates to /final when completed', async () => {
  vi.mocked(scanToken).mockResolvedValue({
    success: true,
    message: 'You have unlocked THE TRUE MASTERS.',
    completed: true,
  })
  renderGame()
  capturedOnScan!('final-token')
  await waitFor(() => {
    expect(screen.getByTestId('final-page')).toBeInTheDocument()
  })
})
