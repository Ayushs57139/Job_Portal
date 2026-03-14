#!/usr/bin/env pwsh
# Fix Metro Bundler Errors Script

Write-Host "🔧 Fixing Metro Bundler Errors..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear Metro cache
Write-Host "Step 1: Clearing Metro bundler cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✓ Cleared node_modules\.cache" -ForegroundColor Green
}

if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
    Write-Host "✓ Cleared .expo" -ForegroundColor Green
}

# Step 2: Clear temp files
Write-Host ""
Write-Host "Step 2: Clearing temp files..." -ForegroundColor Yellow
$tempPath = [System.IO.Path]::GetTempPath()
Get-ChildItem -Path $tempPath -Filter "metro-*" -Directory -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $tempPath -Filter "haste-map-*" -Directory -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Cleared temp files" -ForegroundColor Green

# Step 3: Clear watchman (if available)
Write-Host ""
Write-Host "Step 3: Clearing watchman..." -ForegroundColor Yellow
try {
    watchman watch-del-all 2>$null
    Write-Host "✓ Cleared watchman" -ForegroundColor Green
} catch {
    Write-Host "⚠ Watchman not installed (optional)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ All caches cleared!" -ForegroundColor Green
Write-Host ""
Write-Host "Now starting Metro with reset cache..." -ForegroundColor Cyan
Write-Host ""

# Step 4: Start Metro with reset cache
npm start -- --reset-cache
