const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface StartResponse {
  session_id: string
  clue_text: string
}

export interface ScanResponse {
  success: boolean
  message: string
  next_clue?: string
  completed: boolean
  is_final_clue?: boolean
}

export async function startGame(): Promise<StartResponse> {
  const res = await fetch(`${API_URL}/start`, { method: 'POST' })
  if (!res.ok) throw new Error(`Failed to start game: ${res.status}`)
  return res.json() as Promise<StartResponse>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
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
