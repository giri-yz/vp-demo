# check-zip.ps1 - VPNexues pre-upload gate for GoDaddy deploy zips
# usage:  .\check-zip.ps1 "C:\path\vpnexues-godaddy.zip"
# Rule: NO zip is sent to the head / uploaded to GoDaddy unless this prints ALL GREEN.

param([string]$ZipPath)

if (-not (Test-Path -LiteralPath $ZipPath)) { Write-Host "ZIP NOT FOUND: $ZipPath" -ForegroundColor Red; exit 2 }

Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [IO.Compression.ZipFile]::OpenRead($ZipPath)
$tmp = Join-Path $env:TEMP ("zipgate_" + (Get-Random))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

# ---- structure ----
$badPaths   = @($z.Entries | Where-Object { $_.FullName -match '\\' }).Count
$hasIndex   = @($z.Entries | Where-Object { $_.FullName -eq 'index.html' }).Count -ge 1
$htEntry    = $z.Entries | Where-Object { $_.FullName -eq '.htaccess' } | Select-Object -First 1
$hasHt      = [bool]$htEntry
$srcLeak    = @($z.Entries | Where-Object { $_.FullName -match '(^|/)\.env|\.tsx?$|(^|/)src/|node_modules' }).Count

# ---- pull out the files that carry the truth ----
foreach ($e in ($z.Entries | Where-Object { $_.FullName -eq 'index.html' -or $_.FullName -eq '.htaccess' -or $_.FullName -like 'assets/httpClient-*.js' })) {
  $name = Split-Path $e.Name -Leaf
  [IO.Compression.ZipFileExtensions]::ExtractToFile($e, (Join-Path $tmp $name), $true)
}
$z.Dispose()

$idxRaw = Get-Content (Join-Path $tmp 'index.html') -Raw -ErrorAction SilentlyContinue
$hcFile = Get-ChildItem $tmp -Filter 'httpClient-*.js' -ErrorAction SilentlyContinue | Select-Object -First 1
$hcRaw  = if ($hcFile) { Get-Content $hcFile.FullName -Raw } else { '' }
$htRaw  = Get-Content (Join-Path $tmp '.htaccess') -Raw -ErrorAction SilentlyContinue
$htLen  = if ($htRaw) { $htRaw.Length } else { 0 }

# ---- every chunk index.html references must exist in the zip ----
$missing = 0
if ($idxRaw) {
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $z2 = [IO.Compression.ZipFile]::OpenRead($ZipPath)
  $names = @{}
  foreach ($e in $z2.Entries) { $names[$e.FullName.TrimStart('./')] = $true }
  $z2.Dispose()
  foreach ($m in [regex]::Matches($idxRaw, '(?:src|href)="(/assets/[^"]+)"')) {
    $p = $m.Groups[1].Value.TrimStart('/')
    if (-not $names[$p]) { $missing++ }
  }
}

# ---- full text of the extracted files, for secret scanning ----
$allText = ''
foreach ($f in (Get-ChildItem $tmp -File)) { $allText += (Get-Content $f.FullName -Raw) }

# ---- the gate ----
$checks = [ordered]@{
  'zip opens / index.html at root'      = [bool]$idxRaw
  'forward-slash paths (cPanel-safe)'   = ($badPaths -eq 0)
  '.htaccess included'                  = $hasHt
  '.htaccess hardened (R=404 + no-cache)' = ($htRaw -and $htRaw -match 'R=404' -and $htRaw -match 'no-cache|no-store|access plus 0')
  'Firebase key baked (AIzaSy)'         = ($hcRaw -match 'AIzaSy')
  'backend URL = Render (GoDaddy)'      = ($hcRaw -match 'vpnexues-api\.onrender\.com')
  'API base valid (no doubled URL)'     = ($hcRaw -notmatch 'onrender\.com=' -and $hcRaw -notmatch 'baseURL:`[^`]*=')
  'all referenced chunks present'       = ($missing -eq 0)
  'no secrets / sources in zip'         = ($srcLeak -eq 0 -and $allText -notmatch 'service_role')
  'no localhost baked in bundle'        = ($hcRaw -notmatch 'localhost:8080')
}
$fail = 0
foreach ($k in $checks.Keys) {
  if ($checks[$k]) { "[PASS] $k" } else { "[FAIL] $k"; $fail++ }
}
if ($fail -eq 0) { Write-Host "ALL GREEN - safe to send: $ZipPath" -ForegroundColor Green }
else             { Write-Host "$fail CHECK(S) FAILED - DO NOT SEND: $ZipPath" -ForegroundColor Red }
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
if ($fail -ne 0) { exit 1 }
