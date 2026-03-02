# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A wedding scavenger hunt web app. Guests enter 4-digit codes printed on physical venue cards to progress through stages, with server-enforced ordering (no skipping). Final stage reveals a cat reward screen.

**Tech stack:** FastAPI (Python) backend + React (TypeScript/Vite) frontend
**Deployment target:** Vercel (frontend) + Render or Fly.io (backend)

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload          # Dev server
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
All stage progression is validated server-side. Physical cards show only a 4-digit code — never stage IDs. The frontend never knows which stage a code belongs to.

### Backend (`backend/`)
- `main.py` — FastAPI app entry, CORS config
- `stage_data.py` — Stage definitions with `clue`, `code` (4-digit string), and `next` pointer. **Codes are persisted in `stages.json` and never regenerated on restart.**
- `models.py` — Pydantic models: `Session`, `StartResponse`, `ScanRequest`, `ScanResponse`
- `routes.py` — `POST /start` (creates session, returns first clue), `POST /scan` (validates code, advances stage)
- `services/session_service.py` — Session CRUD (in-memory dict for simple mode, Redis for scale)
- `services/stage_service.py` — Stage lookup and progression logic

Session model: `{ session_id, current_stage, completed }`.
Scan validation: compare entered code against `stages[session.current_stage]["code"]`. Wrong code → playful error, never a technical message.

### Frontend (`frontend/src/`)
- `pages/` — `Home.tsx` (start screen), `Game.tsx` (active clue + code input), `Final.tsx` (cat reward + confetti)
- `components/` — `ClueCard.tsx`, `CodeInput.tsx` (4-digit entry boxes), `Confetti.tsx`
- `api/client.ts` — API calls to `/start` and `/scan`
- `context/SessionContext.tsx` — Stores `session_id`, `current_clue`, `completed` in `localStorage` for persistence across refresh

Routes: `/` → Home, `/game` → Game, `/final` → Final.

## Development Philosophy

### Test-Driven Development

TDD is a core principle. Always follow this cycle:

1. Write the test first.
2. Run it and verify it fails.
3. Implement the code.
4. Run the test again and verify it passes.

Never implement a feature without a failing test first.

## Key Design Decisions
- **No login.** Sessions identified by UUID stored in localStorage.
- **Stage codes are 4-digit strings** stored in `stages.json` — edit before printing cards.
- **Fun error messages** on wrong codes (e.g., "Patience, explorer 👀") — never expose technical details.
- **Final screen** shows a full-screen cat image + confetti when `completed: true`.
- UI palette: dark brown background, sage green cards, dusty pink buttons, cream text.
