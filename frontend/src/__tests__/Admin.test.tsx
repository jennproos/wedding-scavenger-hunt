import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('../api/client', () => ({
  fetchLeaderboard: vi.fn(),
  clearLeaderboard: vi.fn(),
  verifyAdminPassword: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
}))

import { Admin } from '../pages/Admin'
import { fetchLeaderboard, clearLeaderboard, verifyAdminPassword } from '../api/client'

const mockEntries = [
  {
    session_id: 'sess-1',
    player_name: 'Alice',
    clue_number: 5,
    completed: true,
    start_time: '2026-03-10T12:00:00',
    completion_time: '2026-03-10T12:42:00',
  },
  {
    session_id: 'sess-2',
    player_name: 'Bob',
    clue_number: 3,
    completed: false,
    start_time: '2026-03-10T12:05:00',
    completion_time: null,
  },
  {
    session_id: 'sess-3',
    player_name: 'Carol',
    clue_number: 4,
    completed: false,
    start_time: '2026-03-10T12:10:00',
    completion_time: null,
  },
]

beforeEach(() => {
  vi.mocked(fetchLeaderboard).mockReset()
  vi.mocked(clearLeaderboard).mockReset()
  vi.mocked(verifyAdminPassword).mockReset()
})

async function authenticate() {
  vi.mocked(verifyAdminPassword).mockResolvedValue(undefined)
  fireEvent.change(screen.getByPlaceholderText(/admin password/i), { target: { value: 'secret' } })
  fireEvent.click(screen.getByRole('button', { name: /^enter$/i }))
  await waitFor(() => expect(screen.queryByRole('button', { name: /^enter$/i })).not.toBeInTheDocument())
}

// --- Gate tests ---

test('shows password form on mount', () => {
  render(<Admin />)
  expect(screen.getByPlaceholderText(/admin password/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^enter$/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /clear leaderboard/i })).not.toBeInTheDocument()
})

test('shows error on wrong password', async () => {
  const { ApiError } = await import('../api/client')
  vi.mocked(verifyAdminPassword).mockRejectedValue(new ApiError(401, 'Incorrect password'))
  render(<Admin />)
  fireEvent.change(screen.getByPlaceholderText(/admin password/i), { target: { value: 'bad' } })
  fireEvent.click(screen.getByRole('button', { name: /^enter$/i }))
  await waitFor(() => {
    expect(screen.getByText(/incorrect password/i)).toBeInTheDocument()
  })
  expect(screen.getByRole('button', { name: /^enter$/i })).toBeInTheDocument()
})

test('shows admin panel after correct password', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue(mockEntries)
  render(<Admin />)
  await authenticate()
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
  expect(screen.getByRole('button', { name: /clear leaderboard/i })).toBeInTheDocument()
})

// --- Panel tests (all require auth first) ---

test('renders leaderboard table with entries', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue(mockEntries)
  render(<Admin />)
  await authenticate()
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })
})

test('shows empty state when no entries', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue([])
  render(<Admin />)
  await authenticate()
  await waitFor(() => {
    expect(screen.getByText(/no players yet/i)).toBeInTheDocument()
  })
})

test('has "Clear Leaderboard" button', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue([])
  render(<Admin />)
  await authenticate()
  expect(screen.getByRole('button', { name: /clear leaderboard/i })).toBeInTheDocument()
})

test('clicking clear shows confirm buttons', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue([])
  render(<Admin />)
  await authenticate()
  fireEvent.click(screen.getByRole('button', { name: /clear leaderboard/i }))
  expect(screen.getByRole('button', { name: /confirm clear/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  expect(screen.queryByPlaceholderText(/password/i)).not.toBeInTheDocument()
})

test('clicking confirm clear calls clearLeaderboard with stored password', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue([])
  vi.mocked(clearLeaderboard).mockResolvedValue(undefined)
  render(<Admin />)
  await authenticate()
  fireEvent.click(screen.getByRole('button', { name: /clear leaderboard/i }))
  fireEvent.click(screen.getByRole('button', { name: /confirm clear/i }))
  await waitFor(() => {
    expect(clearLeaderboard).toHaveBeenCalledWith('secret')
  })
})

test('shows error on 401 from clear', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue([])
  const { ApiError } = await import('../api/client')
  vi.mocked(clearLeaderboard).mockRejectedValue(new ApiError(401, 'Incorrect password'))
  render(<Admin />)
  await authenticate()
  fireEvent.click(screen.getByRole('button', { name: /clear leaderboard/i }))
  fireEvent.click(screen.getByRole('button', { name: /confirm clear/i }))
  await waitFor(() => {
    expect(screen.getByText(/incorrect password/i)).toBeInTheDocument()
  })
})

test('hides confirm area on cancel', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue([])
  render(<Admin />)
  await authenticate()
  fireEvent.click(screen.getByRole('button', { name: /clear leaderboard/i }))
  expect(screen.getByRole('button', { name: /confirm clear/i })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
  expect(screen.queryByRole('button', { name: /confirm clear/i })).not.toBeInTheDocument()
})

test('clicking Name header sorts by name A→Z', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue(mockEntries)
  render(<Admin />)
  await authenticate()
  await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
  fireEvent.click(screen.getByRole('columnheader', { name: /name/i }))
  const cells = screen.getAllByRole('cell').filter(c => ['Alice', 'Bob', 'Carol'].includes(c.textContent ?? ''))
  expect(cells.map(c => c.textContent)).toEqual(['Alice', 'Bob', 'Carol'])
})

test('clicking Progress header sorts by most progress first', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue(mockEntries)
  render(<Admin />)
  await authenticate()
  await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
  fireEvent.click(screen.getByRole('columnheader', { name: /progress/i }))
  const cells = screen.getAllByRole('cell').filter(c => ['Alice', 'Bob', 'Carol'].includes(c.textContent ?? ''))
  expect(cells.map(c => c.textContent)).toEqual(['Alice', 'Carol', 'Bob'])
})

test('refetches leaderboard on success', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValueOnce(mockEntries).mockResolvedValueOnce([])
  vi.mocked(clearLeaderboard).mockResolvedValue(undefined)
  render(<Admin />)
  await authenticate()
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
  fireEvent.click(screen.getByRole('button', { name: /clear leaderboard/i }))
  fireEvent.click(screen.getByRole('button', { name: /confirm clear/i }))
  await waitFor(() => {
    expect(fetchLeaderboard).toHaveBeenCalledTimes(2)
  })
})
