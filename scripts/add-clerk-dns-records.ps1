# Creates Clerk custom-domain CNAME records in Cloudflare for archivolt.dev.
# Requires: CLOUDFLARE_API_TOKEN with Zone.DNS Edit on archivolt.dev
# Create token: https://dash.cloudflare.com/profile/api-tokens (template: Edit zone DNS)

$ErrorActionPreference = "Stop"
$ZoneName = "archivolt.dev"

$token = $env:CLOUDFLARE_API_TOKEN
if (-not $token) {
  Write-Host "Set CLOUDFLARE_API_TOKEN, then re-run this script." -ForegroundColor Yellow
  exit 1
}

$headers = @{
  Authorization = "Bearer $token"
  "Content-Type"  = "application/json"
}

$zoneRes = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=$ZoneName" -Headers $headers
if (-not $zoneRes.success -or $zoneRes.result.Count -eq 0) {
  throw "Zone not found: $ZoneName"
}
$zoneId = $zoneRes.result[0].id
Write-Host "Zone: $ZoneName ($zoneId)"

$records = @(
  @{ name = "clerk"; content = "frontend-api.clerk.services" },
  @{ name = "accounts"; content = "accounts.clerk.services" },
  @{ name = "clkmail"; content = "mail.2fyf360s6iv5.clerk.services" },
  @{ name = "clk._domainkey"; content = "dkim1.2fyf360s6iv5.clerk.services" },
  @{ name = "clk2._domainkey"; content = "dkim2.2fyf360s6iv5.clerk.services" }
)

foreach ($r in $records) {
  $body = @{
    type    = "CNAME"
    name    = $r.name
    content = $r.content
    proxied = $false
    ttl     = 1
  } | ConvertTo-Json

  try {
    $create = Invoke-RestMethod -Method Post `
      -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" `
      -Headers $headers -Body $body
    if ($create.success) {
      Write-Host "Created: $($r.name) -> $($r.content)" -ForegroundColor Green
      continue
    }
  } catch {
    $err = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($err.errors[0].code -eq 81057) {
      Write-Host "Exists: $($r.name)" -ForegroundColor Cyan
      continue
    }
    throw
  }
}

Write-Host ""
Write-Host "Done. In Clerk Dashboard, click Verify on each DNS record (grey cloud / DNS only required)."
