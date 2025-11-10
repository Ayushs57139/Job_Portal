# JobWala Deployment Script for Windows
# This script helps deploy the JobWala server to production

Write-Host "🚀 JobWala Deployment Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path "server\.env")) {
    Write-Host "⚠️  Warning: server\.env file not found" -ForegroundColor Yellow
    Write-Host "Creating from env.example..." -ForegroundColor Yellow
    if (Test-Path "server\env.example") {
        Copy-Item "server\env.example" "server\.env"
        Write-Host "✅ Created server\.env from env.example" -ForegroundColor Green
        Write-Host "⚠️  Please edit server\.env with your production values before continuing" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "❌ Error: server\env.example not found" -ForegroundColor Red
        exit 1
    }
}

# Check Node.js version
$nodeVersion = node -v
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Set-Location server
npm ci --only=production
Set-Location ..

# Check if PM2 is installed
$pm2Installed = Get-Command pm2 -ErrorAction SilentlyContinue

if ($pm2Installed) {
    Write-Host "✅ PM2 is installed" -ForegroundColor Green
    
    # Stop existing PM2 process if running
    $pm2List = pm2 list 2>&1
    if ($pm2List -match "jobwala-server") {
        Write-Host "🛑 Stopping existing PM2 process..." -ForegroundColor Yellow
        pm2 stop jobwala-server 2>&1 | Out-Null
        pm2 delete jobwala-server 2>&1 | Out-Null
    }
    
    # Start with PM2
    Write-Host "🚀 Starting server with PM2..." -ForegroundColor Cyan
    Set-Location server
    npm run prod
    Set-Location ..
    
    Write-Host ""
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Cyan
    Write-Host "  pm2 status              - Check server status"
    Write-Host "  pm2 logs jobwala-server - View logs"
    Write-Host "  pm2 restart jobwala-server - Restart server"
    Write-Host "  pm2 stop jobwala-server - Stop server"
} else {
    Write-Host "⚠️  PM2 not installed. Installing..." -ForegroundColor Yellow
    npm install -g pm2
    
    Write-Host "🚀 Starting server with PM2..." -ForegroundColor Cyan
    Set-Location server
    npm run prod
    Set-Location ..
    
    Write-Host ""
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
}

# Health check
Write-Host ""
Write-Host "🏥 Performing health check..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server is healthy!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Health check failed. Server may still be starting..." -ForegroundColor Yellow
    Write-Host "Check logs with: pm2 logs jobwala-server" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Configure reverse proxy (Nginx/Apache)"
Write-Host "  2. Set up SSL certificates"
Write-Host "  3. Configure domain DNS"
Write-Host "  4. Set up monitoring"
Write-Host ""
Write-Host "For more information, see DEPLOYMENT.md" -ForegroundColor Cyan

