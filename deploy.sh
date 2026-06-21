#!/usr/bin/env bash
# deploy.sh — publish the static site to AWS S3 + invalidate CloudFront
# --------------------------------------------------------------------
# Prereqs: AWS CLI v2 + `aws configure`. One-time infra is in README.md.
#
# Usage:
#   BUCKET=learnwithpalla.com DIST_ID=E123ABC ./deploy.sh
#   BUCKET=learnwithpalla.com ./deploy.sh          # skip CF invalidation
set -euo pipefail

BUCKET="${BUCKET:?Set BUCKET, e.g. BUCKET=learnwithpalla.com}"
DIST_ID="${DIST_ID:-}"
REGION="${REGION:-ap-south-1}"   # Mumbai. Use ap-south-2 for Hyderabad.
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Uploading static assets (long cache)..."
aws s3 sync "$ROOT/assets" "s3://$BUCKET/assets" \
  --region "$REGION" \
  --cache-control "public,max-age=31536000,immutable" \
  --delete

echo "==> Uploading HTML + root files (no-cache)..."
aws s3 sync "$ROOT" "s3://$BUCKET" \
  --region "$REGION" \
  --cache-control "public,max-age=0,must-revalidate" \
  --exclude "assets/*" \
  --exclude "deploy.ps1" \
  --exclude "deploy.sh" \
  --exclude "README.md" \
  --exclude ".git/*" \
  --exclude ".gitignore" \
  --exclude "node_modules/*" \
  --exclude "tools/*" \
  --delete

if [ -n "$DIST_ID" ]; then
  echo "==> Invalidating CloudFront cache..."
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" >/dev/null
  echo "    Invalidation requested for /*"
else
  echo "==> No DIST_ID set; skipped CloudFront invalidation."
fi

echo ""
echo "✓ Deploy complete."
echo "  Live at: https://$BUCKET/  (once DNS + CloudFront are set up)"
