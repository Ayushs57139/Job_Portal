# Production startup script for JobWala Server (Windows)
# This script ensures the server starts with proper production settings

Write-Host "🚀 Starting JobWala Server in Production Mode" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    Write-Host "Please create .env file from env.example" -ForegroundColor Yellow
    exit 1
}

# Check if NODE_ENV is set to production
$envContent = Get-Content .env -Raw
if (-Not ($envContent -match "NODE_ENV=production")) {
    Write-Host "⚠️  Warning: NODE_ENV is not set to production in .env file" -ForegroundColor Yellow
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

# Check if JWT_SECRET is set and not default
if ($envContent -match "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production") {
    Write-Host "❌ Error: JWT_SECRET is still set to default value" -ForegroundColor Red
    Write-Host "Please change JWT_SECRET in .env file to a strong, random string" -ForegroundColor Yellow
    exit 1
}

# Check if MongoDB URI is set
if (-Not ($envContent -match "MONGODB_URI=.+") -or ($envContent -match "MONGODB_URI=$")) {
    Write-Host "❌ Error: MONGODB_URI is not set in .env file" -ForegroundColor Red
    exit 1
}

# Check Node.js version
$nodeVersion = node -v
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host "✅ Environment file found" -ForegroundColor Green
Write-Host "✅ Starting server..." -ForegroundColor Green
Write-Host ""

# Start with PM2 if available, otherwise use node directly
$pm2Installed = Get-Command pm2 -ErrorAction SilentlyContinue

if ($pm2Installed) {
    Write-Host "Using PM2 to start server..." -ForegroundColor Cyan
    pm2 start ecosystem.config.js --env production
    Write-Host ""
    Write-Host "✅ Server started with PM2" -ForegroundColor Green
    Write-Host "Use 'pm2 logs jobwala-server' to view logs" -ForegroundColor Cyan
    Write-Host "Use 'pm2 status' to check server status" -ForegroundColor Cyan
} else {
    Write-Host "PM2 not found. Starting with node directly..." -ForegroundColor Yellow
    Write-Host "⚠️  For production, it's recommended to use PM2: npm install -g pm2" -ForegroundColor Yellow
    Write-Host ""
    node index.js
}

