const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface StartResponse {
  session_id: string
  clue_text: string
  player_name: string
}

export interface ScanResponse {
  success: boolean
  message: string
  next_clue?: string
  completed: boolean
  is_final_clue?: boolean
}

export interface LeaderboardEntry {
  session_id: string
  player_name: string
  clue_number: number
  completed: boolean
  start_time: string | null
  completion_time: string | null
}

export async function startGame(playerName: string): Promise<StartResponse> {
  const res = await fetch(`${API_URL}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_name: playerName }),
  })
  if (!res.ok) throw new Error(`Failed to start game: ${res.status}`)
  return res.json() as Promise<StartResponse>
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function scanToken(
  session_id: string,
  token: string,
): Promise<ScanResponse> {
  const res = await fetch(`${API_URL}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, token }),
  })
  if (!res.ok) throw new ApiError(res.status, `Scan failed: ${res.status}`)
  return res.json() as Promise<ScanResponse>
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_URL}/leaderboard`)
  if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`)
  return res.json() as Promise<LeaderboardEntry[]>
}

export async function verifyAdminPassword(password: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/ping`, {
    headers: { Authorization: `Bearer ${password}` },
  })
  if (res.status === 401) throw new ApiError(401, 'Incorrect password')
  if (!res.ok) throw new Error(`Verify failed: ${res.status}`)
}

export async function clearLeaderboard(password: string): Promise<void> {
  const res = await fetch(`${API_URL}/leaderboard`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${password}` },
  })
  if (res.status === 401) throw new ApiError(401, 'Incorrect password')
  if (!res.ok) throw new Error(`Clear failed: ${res.status}`)
}

export async function devAdvance(session_id: string): Promise<ScanResponse> {
  const res = await fetch(`${API_URL}/dev/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id }),
  })
  if (!res.ok) throw new Error(`Dev advance failed: ${res.status}`)
  return res.json() as Promise<ScanResponse>
}

export async function backClue(session_id: string): Promise<ScanResponse> {
  const res = await fetch(`${API_URL}/back`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id }),
  })
  if (!res.ok) throw new ApiError(res.status, `Back failed: ${res.status}`)
  return res.json() as Promise<ScanResponse>
}

export async function devBack(session_id: string): Promise<ScanResponse> {
  const res = await fetch(`${API_URL}/dev/back`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id }),
  })
  if (!res.ok) throw new Error(`Dev back failed: ${res.status}`)
  return res.json() as Promise<ScanResponse>
}
