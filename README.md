# Wedding Scavenger Hunt

A wedding scavenger hunt web app for guests to play on their phones. Guests enter 4-digit codes printed on physical cards placed around the venue to progress through stages, with server-enforced ordering so no one can skip ahead. The final stage reveals a reward screen.

**Live Demo**: https://wedding.jennproos.com/

**Stack:** FastAPI (Python) + React (TypeScript/Vite)

See [plan.md](plan.md) for full architecture and design details.

## Dev Setup

**First time:**
```bash
make install                        # creates backend/venv, pip install, npm install
cp .env.example .env                # edit with your SSH key path
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
make lint          # ESLint
make deploy-frontend # build + upload frontend + CloudFront invalidation
make deploy-backend  # SSH deploy backend + restart service
make help          # list all targets
```

### Dev override panel

To skip/go back through stages without entering real codes, enable the dev override in **both** places:

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

## Deployment

Deployment logic lives in scripts, and Make wraps them:

- `scripts/deploy-frontend.sh`
- `scripts/deploy-backend.sh`

This keeps deploy steps versioned/testable while still giving a simple `make` entrypoint.

### Frontend deploy

Defaults are set for this project, but can be overridden:

```bash
# optional overrides: API_URL, FRONTEND_BUCKET, CLOUDFRONT_DISTRIBUTION_ID, AWS_PROFILE
make deploy-frontend
```

### Backend deploy

Set `SSH_KEY_PATH` in your root `.env` (copied from `.env.example`) and then:

```bash
make deploy-backend
```

Optional overrides:

- `REMOTE_HOST` (default: `wedding-api.jennproos.com`)
- `REMOTE_USER` (default: `ec2-user`)
- `APP_DIR` (default: `app`)
- `BRANCH` (default: `main`)
- `SERVICE_NAME` (default: `scavenger`)

## Infrastructure (CDK)

The `infra/` folder contains the AWS CDK stack for production infrastructure.

### Prereqs

- AWS CLI configured (`aws configure`)
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- Python 3.11+

### First-time setup

```bash
make infra-venv
```

Create `infra/.env` (copy from `infra/.env.example`) and fill in values:

- `HOSTED_ZONE_ID`
- `KEY_NAME`
- `KEY_PATH`
- `GITHUB_REPO_URL`

### Bootstrap (first deploy in account/region)

```bash
cd infra
source .venv/bin/activate
cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

### Deploy / update infra

```bash
cd infra
source .venv/bin/activate
cdk diff
cdk deploy
```

For full infra details and post-deploy steps (HTTPS certbot, frontend bucket/distribution outputs, troubleshooting), see [infra/README.md](/Users/jenn.proos/Projects/Personal/wedding-scavenger-hunt/infra/README.md).

## Name Ideas

- What's in the mole hole?
