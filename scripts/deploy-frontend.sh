#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

API_URL="${API_URL:-https://wedding-api.jennproos.com}"
FRONTEND_BUCKET="${FRONTEND_BUCKET:-weddingscavengerhuntinfrast-frontendbucketefe2e19c-m2xx3fo8a4mt}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-E3S1IB6803P3BA}"
AWS_PROFILE="${AWS_PROFILE:-}"

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required"
  exit 1
fi

AWS_ARGS=()
if [[ -n "$AWS_PROFILE" ]]; then
  AWS_ARGS+=(--profile "$AWS_PROFILE")
fi

echo "Building frontend with VITE_API_URL=$API_URL"
cd "$FRONTEND_DIR"
VITE_API_URL="$API_URL" npm run build

echo "Syncing dist/ to s3://$FRONTEND_BUCKET"
aws "${AWS_ARGS[@]+"${AWS_ARGS[@]}"}" s3 sync dist/ "s3://$FRONTEND_BUCKET" --delete

echo "Creating CloudFront invalidation for $CLOUDFRONT_DISTRIBUTION_ID"
aws "${AWS_ARGS[@]+"${AWS_ARGS[@]}"}" cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"

echo "Frontend deploy complete"
