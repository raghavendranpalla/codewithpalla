<#
  deploy.ps1 — publish the static site to AWS S3 + invalidate CloudFront
  --------------------------------------------------------------------
  Prereqs: AWS CLI v2 installed and `aws configure` done (or env creds).
  One-time infra setup (bucket, CloudFront, cert) is in README.md.

  Usage:
    ./deploy.ps1 -Bucket "learnwithpalla.com" -DistributionId "E123ABC..."
    ./deploy.ps1 -Bucket "learnwithpalla.com"        # skip CF invalidation
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $Bucket,
  [string] $DistributionId = "",
  [string] $Region = "ap-south-1"   # Mumbai. Use ap-south-2 for Hyderabad.
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# Files/folders that must NOT be uploaded to the website bucket.
$excludes = @(
  "--exclude", "deploy.ps1",
  "--exclude", "deploy.sh",
  "--exclude", "README.md",
  "--exclude", ".git/*",
  "--exclude", ".gitignore",
  "--exclude", "*.psd",
  "--exclude", "node_modules/*",
  "--exclude", "tools/*"
)

Write-Host "==> Uploading hashed/static assets (long cache)..." -ForegroundColor Cyan
# assets/ rarely change per file; cache them hard.
aws s3 sync "$root/assets" "s3://$Bucket/assets" `
  --region $Region `
  --cache-control "public,max-age=31536000,immutable" `
  --delete

Write-Host "==> Uploading HTML + root files (no-cache so updates show instantly)..." -ForegroundColor Cyan
# Everything else (html, robots, sitemap, favicon at root) — short cache.
aws s3 sync "$root" "s3://$Bucket" `
  --region $Region `
  --cache-control "public,max-age=0,must-revalidate" `
  --exclude "assets/*" `
  @excludes `
  --delete

if ($DistributionId -ne "") {
  Write-Host "==> Invalidating CloudFront cache..." -ForegroundColor Cyan
  aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*" | Out-Null
  Write-Host "    Invalidation requested for /*" -ForegroundColor DarkGray
} else {
  Write-Host "==> No -DistributionId given; skipped CloudFront invalidation." -ForegroundColor Yellow
}

Write-Host "`n✓ Deploy complete." -ForegroundColor Green
Write-Host "  Live at: https://$Bucket/  (once DNS + CloudFront are set up)" -ForegroundColor Green
