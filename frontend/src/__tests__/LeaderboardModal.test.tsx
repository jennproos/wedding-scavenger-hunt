import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('../api/client', () => ({
  fetchLeaderboard: vi.fn(),
}))

import { LeaderboardModal } from '../components/LeaderboardModal'
import { fetchLeaderboard } from '../api/client'

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
})

test('does not render when isOpen is false', () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue([])
  render(<LeaderboardModal isOpen={false} onClose={() => {}} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('renders when isOpen is true', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue([])
  render(<LeaderboardModal isOpen={true} onClose={() => {}} />)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

test('shows loading state while fetching', async () => {
  vi.mocked(fetchLeaderboard).mockReturnValue(new Promise(() => {}))
  render(<LeaderboardModal isOpen={true} onClose={() => {}} />)
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
})

test('renders leaderboard entries after loading', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue(mockEntries)
  render(<LeaderboardModal isOpen={true} onClose={() => {}} />)
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })
})

test('shows completed duration for finished players', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue(mockEntries)
  render(<LeaderboardModal isOpen={true} onClose={() => {}} />)
  await waitFor(() => {
    expect(screen.getByText(/42 min/i)).toBeInTheDocument()
  })
})

test('shows clue number for in-progress players', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue(mockEntries)
  render(<LeaderboardModal isOpen={true} onClose={() => {}} />)
  await waitFor(() => {
    expect(screen.getByText(/clue 3/i)).toBeInTheDocument()
  })
})

test('shows empty state when no entries', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue([])
  render(<LeaderboardModal isOpen={true} onClose={() => {}} />)
  await waitFor(() => {
    expect(screen.getByText(/no players yet/i)).toBeInTheDocument()
  })
})

test('clicking Name header sorts entries by name A→Z', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue(mockEntries)
  render(<LeaderboardModal isOpen={true} onClose={() => {}} />)
  await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
  fireEvent.click(screen.getByRole('columnheader', { name: /name/i }))
  const cells = screen.getAllByRole('cell').filter(c => ['Alice', 'Bob', 'Carol'].includes(c.textContent ?? ''))
  expect(cells.map(c => c.textContent)).toEqual(['Alice', 'Bob', 'Carol'])
})

test('clicking Name header twice reverses to Z→A', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue(mockEntries)
  render(<LeaderboardModal isOpen={true} onClose={() => {}} />)
  await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
  fireEvent.click(screen.getByRole('columnheader', { name: /name/i }))
  fireEvent.click(screen.getByRole('columnheader', { name: /name/i }))
  const cells = screen.getAllByRole('cell').filter(c => ['Alice', 'Bob', 'Carol'].includes(c.textContent ?? ''))
  expect(cells.map(c => c.textContent)).toEqual(['Carol', 'Bob', 'Alice'])
})

test('clicking Progress header sorts by most progress first', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue(mockEntries)
  render(<LeaderboardModal isOpen={true} onClose={() => {}} />)
  await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
  fireEvent.click(screen.getByRole('columnheader', { name: /progress/i }))
  const cells = screen.getAllByRole('cell').filter(c => ['Alice', 'Bob', 'Carol'].includes(c.textContent ?? ''))
  // Alice completed (highest), Carol clue 4, Bob clue 3
  expect(cells.map(c => c.textContent)).toEqual(['Alice', 'Carol', 'Bob'])
})

test('close button calls onClose', async () => {
  vi.mocked(fetchLeaderboard).mockResolvedValue([])
  const onClose = vi.fn()
  render(<LeaderboardModal isOpen={true} onClose={onClose} />)
  fireEvent.click(screen.getByRole('button', { name: /close/i }))
  expect(onClose).toHaveBeenCalled()
})
