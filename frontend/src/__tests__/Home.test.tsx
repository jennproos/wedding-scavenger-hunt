import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { SessionProvider } from '../context/SessionContext'

vi.mock('../api/client', () => ({
  startGame: vi.fn().mockResolvedValue({
    session_id: 'test-session-id',
    clue_text: 'Find the gift table',
  }),
}))

import { Home } from '../pages/Home'

function renderHome() {
  return render(
    <MemoryRouter>
      <SessionProvider>
        <Home />
      </SessionProvider>
    </MemoryRouter>,
  )
}

test('renders the start button', () => {
  renderHome()
  expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
})

test('clicking Start calls startGame and navigates to /game', async () => {
  const { startGame } = await import('../api/client')
  renderHome()
  fireEvent.click(screen.getByRole('button', { name: /start/i }))
  await waitFor(() => {
    expect(startGame).toHaveBeenCalled()
  })
})
