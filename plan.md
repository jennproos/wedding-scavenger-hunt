# Wedding Scavenger Hunt Web App

**Tech Stack:** FastAPI (Python) + React (TypeScript)
**Deployment:** Vercel (frontend) + Render/Fly.io (backend)
**Architecture:** Session-based, stage-locked QR validation

## 1. Product Goals

### Functional Goals

Guests start a scavenger hunt from their phones.

Each stage:

- Displays a clue.
- Requires scanning a physical QR code.
- Unlocks the next stage.

Users cannot skip stages.

Final stage reveals a silly reward screen (e.g., cats).

Admin can generate QR codes for printing.

### Non-Functional Goals

- No login required.
- Lightweight and fast.
- Stage progression strictly enforced server-side.
- No ability to guess or brute-force future stages.
- Fun error messaging (not technical errors).

## 2. High-Level Architecture

```
[ React Frontend ]
        |
[ FastAPI Backend ]
        |
[ In-memory store or Redis ]
```

**Core Principle:** All progression validation happens server-side. QR codes contain opaque tokens only.

## 3. Game Logic Design

### 3.1 Stage Locking Model

Each session has:

- `session_id`
- `current_stage`
- `completed`

Each stage has:

- `id`
- `clue_text`
- `qr_token` (UUID)
- `next_stage` (nullable)

### Validation Rule

When a QR is scanned:

1. Fetch session.
2. Determine expected stage.
3. Compare scanned token to expected stage token.
4. If mismatch → return playful error.
5. If match → advance stage.

## 4. Backend Design (FastAPI)

### 4.1 Project Structure

```
backend/
├── main.py
├── models.py
├── stage_data.py
├── routes.py
├── services/
│   ├── session_service.py
│   └── stage_service.py
├── qr_generator.py
└── requirements.txt
```

### 4.2 Data Models

`models.py`

```python
from pydantic import BaseModel
from typing import Optional

class Session(BaseModel):
    session_id: str
    current_stage: int
    completed: bool = False


class StartResponse(BaseModel):
    session_id: str
    clue_text: str


class ScanRequest(BaseModel):
    session_id: str
    token: str


class ScanResponse(BaseModel):
    success: bool
    message: str
    next_clue: Optional[str] = None
    completed: bool = False
```

### 4.3 Stage Configuration

`stage_data.py` — **5 stages** (gift table → bar → photo area → dance floor → hidden cat station)

On first import, UUIDs are generated and written to `stages.json`. On subsequent imports, tokens are loaded from `stages.json` — never regenerated. **`stages.json` must be committed to git.**

**Stage clues:**

| Stage | Location | Clue (opening lines) |
|-------|----------|----------------------|
| 1 | Gift table | "Before the dancing and the cheer, / there's a place for words sincere…" |
| 2 | Bar | "Love takes bravery — this much is true. / Sometimes it starts with a drink or two…" |
| 3 | Photo area | "Some nights fade, but not this one. / We're saving proof of all this fun…" |
| 4 | Dance floor | "When the music starts and shoes come off, / grace disappears and moves get soft…" |
| 5 | Cat station | "Two tiny rulers of our domain, / soft of paw and loud of reign…" |

> **Warning:** `stages.json` is the source of truth for all printed QR codes. Losing it = reprinting everything.

### 4.4 Session Storage Strategy

**Option A (Simple Wedding Mode)**

In-memory dictionary:

```python
sessions = {}
```

**Option B (Safer)**

Redis store — expire sessions after 6 hours.

### 4.5 API Endpoints

**POST /start**

Creates session and returns first clue.

Response:

```json
{
  "session_id": "uuid",
  "clue_text": "Stage 1 clue..."
}
```

**POST /scan**

Validates QR token.

Request:

```json
{
  "session_id": "uuid",
  "token": "scanned-uuid"
}
```

Success Response:

```json
{
  "success": true,
  "message": "Unlocked!",
  "next_clue": "Next stage clue...",
  "completed": false
}
```

Wrong Stage Response:

```json
{
  "success": false,
  "message": "Patience, explorer"
}
```

Final Stage Response:

```json
{
  "success": true,
  "message": "You have unlocked the chaos.",
  "completed": true
}
```

## 5. Anti-Skip Strategy

### 5.1 Server-Enforced Stage Matching

```python
if scanned_token != expected_stage["qr_token"]:
    return playful_error
```

### 5.2 Tokens Must Be

- Random UUIDs
- Not guessable
- Not sequential
- Not exposed in frontend

### 5.3 QR Codes Contain ONLY

```
uuid-token
```

NOT:

```
/stage/3
```

## 6. Frontend Design (React + TypeScript)

### 6.1 Project Structure

```
src/
├── pages/
│   ├── Home.tsx
│   ├── Game.tsx
│   └── Final.tsx
├── components/
│   ├── ClueCard.tsx
│   ├── QRScanner.tsx
│   └── Confetti.tsx
├── api/
│   └── client.ts
├── context/
│   └── SessionContext.tsx
└── styles/
```

### 6.2 Routing

- `/` → Home
- `/game` → Active game
- `/final` → Final reveal

### 6.3 State Management

Store:

- `session_id`
- `current_clue`
- `completed`

Persist via `localStorage`.

### 6.4 QR Scanning

Library: `html5-qrcode`

Flow:

1. Scan token.
2. Call `/scan`.
3. Update clue or redirect to `/final`.

## 7. Final Screen Design

When `completed = true`:

- Display full-screen silly cat image.
- Add confetti animation.
- Show: "Show this screen to claim your prize."

Optional: Generate a unique "claim code" from backend.

## 8. QR Code Generation Script

`qr_generator.py`

```python
import qrcode
from stage_data import stages

for stage_id, stage in stages.items():
    img = qrcode.make(stage["qr_token"])
    img.save(f"qr_stage_{stage_id}.png")
```

Print and place at venue.

## 9. UI Style Guidelines

### Colors

- **Dark brown:** background
- **Sage green:** cards
- **Dusty pink:** buttons
- **Cream:** text background

### Design Vibes

- Rounded cards
- Soft shadows
- Subtle grain texture
- Slightly playful error messaging

## 10. Deployment Plan

### Backend

- Render or Fly.io
- Enable CORS
- Use environment variable for production base URL

### Frontend

- Vercel
- Environment variable: `VITE_API_URL`

## 11. Optional Enhancements

- Leaderboard
- Admin dashboard
- Time tracking
- Session expiration
- Rate limiting
- Analytics

## 12. Test-Driven Development

### TDD Cycle

All features must follow this cycle — no exceptions:

1. **Write the test first.** Define the expected behavior before writing any implementation code.
2. **Run it and verify it fails.** Confirm the test fails for the right reason (not a syntax error or import failure).
3. **Implement the minimum code** to make the test pass.
4. **Run the test again and verify it passes.**
5. **Refactor** if needed, keeping tests green.

Never implement a feature without a failing test first.

### Backend Test Cases

Use `pytest`. Tests live in `backend/tests/`.

- `POST /start` returns a valid `session_id` and `clue_text`
- `POST /scan` with correct token advances session and returns next clue
- `POST /scan` with wrong token returns a playful error, does not advance stage
- `POST /scan` on a completed session returns an appropriate response
- Stage tokens are UUIDs and are not sequential or guessable

### Frontend Test Cases

Use Vitest + React Testing Library. Tests live in `frontend/src/__tests__/`.

- QR scan success updates clue and advances UI state
- Wrong scan displays a friendly error message
- Session state persists across page refresh (localStorage)
- Completed session redirects to `/final`

### Running Tests

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

## 13. Future-Proofing Notes

- Store stages in DB for editability.
- Add admin route to regenerate tokens.
- Allow multiple concurrent sessions.
- Add Redis if high guest count.

## 14. Summary

This system ensures:

- No skipping ahead
- No guessing stages
- No manual URL manipulation
- Clean UX
- Server-controlled progression
- Indie wedding vibes
