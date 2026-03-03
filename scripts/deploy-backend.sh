#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-wedding-api.jennproos.com}"
REMOTE_USER="${REMOTE_USER:-ec2-user}"
SSH_KEY_PATH="${SSH_KEY_PATH:-}"
APP_DIR="${APP_DIR:-app}"
BRANCH="${BRANCH:-main}"
SERVICE_NAME="${SERVICE_NAME:-scavenger}"

if [[ -z "$SSH_KEY_PATH" ]]; then
  echo "SSH_KEY_PATH is required (path to your .pem key)"
  exit 1
fi

if [[ ! -f "$SSH_KEY_PATH" ]]; then
  echo "SSH key not found: $SSH_KEY_PATH"
  exit 1
fi

SSH_ARGS=(-i "$SSH_KEY_PATH" -o StrictHostKeyChecking=accept-new)

echo "Deploying backend to $REMOTE_USER@$REMOTE_HOST (branch: $BRANCH)"
ssh "${SSH_ARGS[@]}" "$REMOTE_USER@$REMOTE_HOST" \
  "set -euo pipefail; \
   cd '$APP_DIR'; \
   git fetch origin; \
   git checkout '$BRANCH'; \
   git pull --ff-only origin '$BRANCH'; \
   sudo systemctl restart '$SERVICE_NAME'; \
   sudo systemctl --no-pager status '$SERVICE_NAME' | head -n 20"

echo "Backend deploy complete"
