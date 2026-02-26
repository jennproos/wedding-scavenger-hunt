import { renderHook, act } from '@testing-library/react'
import { SessionProvider, useSession } from '../context/SessionContext'

function wrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

beforeEach(() => {
  localStorage.clear()
})

test('initial state is null', () => {
  const { result } = renderHook(() => useSession(), { wrapper })
  expect(result.current.session).toBeNull()
})

test('setSession updates state', () => {
  const { result } = renderHook(() => useSession(), { wrapper })
  act(() => {
    result.current.setSession({
      session_id: 'abc-123',
      current_clue: 'Find the gift table',
      completed: false,
    })
  })
  expect(result.current.session).toEqual({
    session_id: 'abc-123',
    current_clue: 'Find the gift table',
    completed: false,
  })
})

test('state is persisted to localStorage on set', () => {
  const { result } = renderHook(() => useSession(), { wrapper })
  act(() => {
    result.current.setSession({
      session_id: 'xyz-456',
      current_clue: 'Find the bar',
      completed: false,
    })
  })
  const stored = JSON.parse(localStorage.getItem('scavenger_session') ?? 'null')
  expect(stored).toEqual({
    session_id: 'xyz-456',
    current_clue: 'Find the bar',
    completed: false,
  })
})

test('state is restored from localStorage on mount', () => {
  const saved = {
    session_id: 'saved-id',
    current_clue: 'Clue from previous visit',
    completed: false,
  }
  localStorage.setItem('scavenger_session', JSON.stringify(saved))

  const { result } = renderHook(() => useSession(), { wrapper })
  expect(result.current.session).toEqual(saved)
})

test('clearSession resets state and localStorage', () => {
  const { result } = renderHook(() => useSession(), { wrapper })
  act(() => {
    result.current.setSession({
      session_id: 'to-clear',
      current_clue: 'Some clue',
      completed: false,
    })
  })
  act(() => {
    result.current.clearSession()
  })
  expect(result.current.session).toBeNull()
  expect(localStorage.getItem('scavenger_session')).toBeNull()
})
