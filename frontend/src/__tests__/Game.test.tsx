import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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
  devAdvance: vi.fn(),
  devBack: vi.fn(),
}))

import { Game } from '../pages/Game'
import { scanToken, devAdvance, devBack } from '../api/client'

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
  vi.mocked(devAdvance).mockReset()
  vi.mocked(devBack).mockReset()
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

describe('dev controls', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('dev panel not rendered without VITE_DEV_OVERRIDE', () => {
    vi.stubEnv('VITE_DEV_OVERRIDE', 'false')
    renderGame()
    expect(screen.queryByText('Skip →')).not.toBeInTheDocument()
    expect(screen.queryByText('← Back')).not.toBeInTheDocument()
  })

  test('dev panel rendered when VITE_DEV_OVERRIDE is true', () => {
    vi.stubEnv('VITE_DEV_OVERRIDE', 'true')
    renderGame()
    expect(screen.getByText('Skip →')).toBeInTheDocument()
    expect(screen.getByText('← Back')).toBeInTheDocument()
  })

  test('clicking Skip calls devAdvance and updates clue', async () => {
    vi.stubEnv('VITE_DEV_OVERRIDE', 'true')
    vi.mocked(devAdvance).mockResolvedValue({
      success: true,
      message: '[DEV] Skipped!',
      next_clue: 'Find the dance floor',
      completed: false,
    })
    renderGame()
    fireEvent.click(screen.getByText('Skip →'))
    await waitFor(() => {
      expect(devAdvance).toHaveBeenCalledWith('sess-1')
      expect(screen.getByText(/Find the dance floor/)).toBeInTheDocument()
    })
  })

  test('clicking Back calls devBack and updates clue', async () => {
    vi.stubEnv('VITE_DEV_OVERRIDE', 'true')
    vi.mocked(devBack).mockResolvedValue({
      success: true,
      message: '[DEV] Went back!',
      next_clue: 'Find the gift table',
      completed: false,
    })
    renderGame()
    fireEvent.click(screen.getByText('← Back'))
    await waitFor(() => {
      expect(devBack).toHaveBeenCalledWith('sess-1')
      expect(screen.getByText(/Find the gift table/)).toBeInTheDocument()
    })
  })
})
