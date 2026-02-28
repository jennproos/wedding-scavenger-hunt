# Wedding Scavenger Hunt

A wedding scavenger hunt web app for guests to play on their phones. Guests scan physical QR codes placed around the venue to progress through stages, with server-enforced ordering so no one can skip ahead. The final stage reveals a reward screen.

**Stack:** FastAPI (Python) + React (TypeScript/Vite)

See [plan.md](plan.md) for full architecture and design details.

## Dev Setup

**First time:**
```bash
make install                        # creates backend/venv, pip install, npm install
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

**Running (open two terminals):**
```bash
make dev-backend   # FastAPI on http://localhost:8000
make dev-frontend  # Vite on http://localhost:5173
```

**Other commands:**
```bash
make test          # run all tests (backend + frontend)
make test-backend  # pytest only
make test-frontend # vitest only
make qr            # generate QR code PNGs → backend/qr_codes/
make lint          # ESLint
make help          # list all targets
```

### Dev override panel

To skip/go back through stages without scanning real QR codes, enable the dev override in **both** places:

```bash
# backend/.env
DEV_OVERRIDE=true

# frontend/.env.local
VITE_DEV_OVERRIDE=true
```

This unlocks:
- `POST /dev/advance` and `POST /dev/back` API endpoints on the backend (return 404 in production)
- A **DEV / ← Back / Skip →** button panel on the Game screen

Never enable in production.

## Name Ideas

- What's in the mole hole?
