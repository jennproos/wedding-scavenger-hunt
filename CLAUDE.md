# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A wedding scavenger hunt web app. Guests scan physical QR codes to progress through stages, with server-enforced ordering (no skipping). Final stage reveals a cat reward screen.

**Tech stack:** FastAPI (Python) backend + React (TypeScript/Vite) frontend
**Deployment target:** Vercel (frontend) + Render or Fly.io (backend)

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload          # Dev server
python qr_generator.py             # Generate printable QR code PNGs
pytest                             # Run tests
pytest tests/test_routes.py::test_name  # Single test
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Dev server
npm run build  # Production build
npm run lint   # Lint
```

**Frontend env var:** `VITE_API_URL` — set to backend base URL.

## Architecture

### Core Security Principle
All stage progression is validated server-side. QR codes contain only opaque UUID tokens — never stage IDs or URLs. The frontend never knows which stage a token belongs to.

### Backend (`backend/`)
- `main.py` — FastAPI app entry, CORS config
- `stage_data.py` — Stage definitions with `clue`, `qr_token` (UUID), and `next` pointer. **QR tokens must be persisted (JSON or DB) and never regenerated on restart.**
- `models.py` — Pydantic models: `Session`, `StartResponse`, `ScanRequest`, `ScanResponse`
- `routes.py` — `POST /start` (creates session, returns first clue), `POST /scan` (validates token, advances stage)
- `services/session_service.py` — Session CRUD (in-memory dict for simple mode, Redis for scale)
- `services/stage_service.py` — Stage lookup and progression logic
- `qr_generator.py` — Generates PNG QR codes from `stage_data.py` tokens for printing

Session model: `{ session_id, current_stage, completed }`.
Scan validation: compare scanned token against `stages[session.current_stage]["qr_token"]`. Wrong token → playful error, never a technical message.

### Frontend (`frontend/src/`)
- `pages/` — `Home.tsx` (start screen), `Game.tsx` (active clue + scanner), `Final.tsx` (cat reward + confetti)
- `components/` — `ClueCard.tsx`, `QRScanner.tsx` (uses `html5-qrcode`), `Confetti.tsx`
- `api/client.ts` — API calls to `/start` and `/scan`
- `context/SessionContext.tsx` — Stores `session_id`, `current_clue`, `completed` in `localStorage` for persistence across refresh

Routes: `/` → Home, `/game` → Game, `/final` → Final.

## Key Design Decisions
- **No login.** Sessions identified by UUID stored in localStorage.
- **Stage tokens are UUIDs**, not sequential or guessable.
- **Fun error messages** on wrong scans (e.g., "Patience, explorer 👀") — never expose technical details.
- **Final screen** shows a full-screen cat image + confetti when `completed: true`.
- UI palette: dark brown background, sage green cards, dusty pink buttons, cream text.
