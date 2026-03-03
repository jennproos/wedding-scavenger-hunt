import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { SessionProvider } from '../context/SessionContext'

// Mock CodeInput so we control when onSubmit fires
let capturedOnScan: ((code: string) => Promise<boolean>) | null = null
let capturedOnSuccessReady: (() => void) | null = null
vi.mock('../components/CodeInput', () => ({
  CodeInput: ({ onSubmit, onSuccessReady }: {
    onSubmit: (code: string) => Promise<boolean>
    onSuccessReady?: () => void
  }) => {
    capturedOnScan = onSubmit
    capturedOnSuccessReady = onSuccessReady ?? null
    return <div data-testid="mock-code-input" />
  },
}))

vi.mock('../api/client', () => ({
  scanToken: vi.fn(),
  devAdvance: vi.fn(),
  devBack: vi.fn(),
  backClue: vi.fn(),
  checkSession: vi.fn().mockResolvedValue(true),
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) { super(message); this.status = status }
  },
}))

import { Game } from '../pages/Game'
import { scanToken, devAdvance, devBack, backClue, checkSession } from '../api/client'

function renderGame(clue = 'Find the gift table', { is_final_clue = false } = {}) {
  localStorage.setItem(
    'scavenger_session',
    JSON.stringify({ session_id: 'sess-1', current_clue: clue, is_final_clue, completed: false }),
  )
  return render(
    <MemoryRouter initialEntries={['/game']}>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<div data-testid="home-page" />} />
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
  capturedOnSuccessReady = null
  vi.mocked(scanToken).mockReset()
  vi.mocked(devAdvance).mockReset()
  vi.mocked(devBack).mockReset()
  vi.mocked(backClue).mockReset()
  vi.mocked(checkSession).mockResolvedValue(true)
})

test('redirects home and clears session when session is not found on backend', async () => {
  vi.mocked(checkSession).mockResolvedValue(false)
  renderGame()
  await waitFor(() => {
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })
  expect(localStorage.getItem('scavenger_session')).toBeNull()
})

test('renders a back button', () => {
  renderGame()
  expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
})

test('back button on clue 1 clears session and navigates to home', async () => {
  renderGame()
  fireEvent.click(screen.getByRole('button', { name: /back/i }))
  await waitFor(() => {
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })
  expect(localStorage.getItem('scavenger_session')).toBeNull()
})

test('back button on clue 2+ calls backClue and shows previous clue', async () => {
  vi.mocked(backClue).mockResolvedValue({
    success: true,
    message: 'Went back!',
    next_clue: 'Find the gift table',
    completed: false,
  })
  localStorage.setItem(
    'scavenger_session',
    JSON.stringify({ session_id: 'sess-1', current_clue: 'Find the bar', clue_number: 2, completed: false }),
  )
  render(
    <MemoryRouter initialEntries={['/game']}>
      <SessionProvider>
        <Routes>
          <Route path="/game" element={<Game />} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: /back/i }))
  await waitFor(() => {
    expect(backClue).toHaveBeenCalledWith('sess-1')
    expect(screen.getByText(/Find the gift table/)).toBeInTheDocument()
  }, { timeout: 5000 })
})

test('displays the current clue', async () => {
  renderGame('Find the gift table')
  await waitFor(() => expect(screen.getByText(/Find the gift table/)).toBeInTheDocument(), { timeout: 5000 })
})

test('shows the current clue number', () => {
  localStorage.setItem(
    'scavenger_session',
    JSON.stringify({ session_id: 'sess-1', current_clue: 'Find the bar', clue_number: 3, completed: false }),
  )
  render(
    <MemoryRouter initialEntries={['/game']}>
      <SessionProvider>
        <Routes>
          <Route path="/game" element={<Game />} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  )
  expect(screen.getByText('3')).toBeInTheDocument()
})

test('returns false on wrong scan', async () => {
  vi.mocked(scanToken).mockResolvedValue({
    success: false,
    message: 'Patience, explorer 👀',
    completed: false,
  })
  renderGame()
  const result = await capturedOnScan!('wrong-token')
  expect(result).toBe(false)
})

test('updates clue when onSuccessReady is called after correct scan', async () => {
  vi.mocked(scanToken).mockResolvedValue({
    success: true,
    message: 'Onward!',
    next_clue: 'Find the bar',
    completed: false,
  })
  renderGame()
  await capturedOnScan!('correct-token')
  capturedOnSuccessReady!()
  await waitFor(() => {
    expect(screen.getByText(/Find the bar/)).toBeInTheDocument()
  }, { timeout: 5000 })
})

test('navigates to /final when onSuccessReady is called after completing', async () => {
  vi.mocked(scanToken).mockResolvedValue({
    success: true,
    message: 'You have unlocked THE TRUE MASTERS.',
    completed: true,
  })
  renderGame()
  await capturedOnScan!('final-token')
  capturedOnSuccessReady!()
  await waitFor(() => {
    expect(screen.getByTestId('final-page')).toBeInTheDocument()
  })
})

describe('final clue', () => {
  test('does not render CodeInput when session is on final clue', () => {
    renderGame('Find the cats', { is_final_clue: true })
    expect(screen.queryByTestId('mock-code-input')).not.toBeInTheDocument()
  })

  test('renders claim button when session is on final clue', () => {
    renderGame('Find the cats', { is_final_clue: true })
    expect(screen.getByRole('button', { name: /claim/i })).toBeInTheDocument()
  })

  test('clicking claim navigates to /final', async () => {
    renderGame('Find the cats', { is_final_clue: true })
    fireEvent.click(screen.getByRole('button', { name: /claim/i }))
    await waitFor(() => {
      expect(screen.getByTestId('final-page')).toBeInTheDocument()
    })
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
    }, { timeout: 5000 })
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
    }, { timeout: 5000 })
  })
})
