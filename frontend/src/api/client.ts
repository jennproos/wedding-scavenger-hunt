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
}

export async function startGame(): Promise<StartResponse> {
  const res = await fetch(`${API_URL}/start`, { method: 'POST' })
  if (!res.ok) throw new Error(`Failed to start game: ${res.status}`)
  return res.json() as Promise<StartResponse>
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
  if (!res.ok) throw new Error(`Scan failed: ${res.status}`)
  return res.json() as Promise<ScanResponse>
}
