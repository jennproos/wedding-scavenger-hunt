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

`stage_data.py`

```python
import uuid

stages = {
    1: {
        "clue": "Before the dancing and the cheer...",
        "qr_token": str(uuid.uuid4()),
        "next": 2
    },
    2: {
        "clue": "Where drinks are poured...",
        "qr_token": str(uuid.uuid4()),
        "next": 3
    },
    3: {
        "clue": "Two tiny rulers of our home...",
        "qr_token": str(uuid.uuid4()),
        "next": None
    }
}
```

> **Warning:** Persist these UUIDs after generation (store in JSON or DB). Do NOT regenerate on server restart.

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

## 12. Testing Requirements

### Backend

Unit test:

- Correct stage progression
- Early stage scan rejected
- Completed session locked

### Frontend

- QR scan success
- Wrong scan error
- Session persistence across refresh

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
