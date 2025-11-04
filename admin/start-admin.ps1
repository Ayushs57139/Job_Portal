# Admin Panel Startup Script for Windows
Write-Host "Starting Free Job Wala Admin Panel..." -ForegroundColor Green
Write-Host "Admin panel will run on: http://localhost:8081" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting admin panel..." -ForegroundColor Green
npm start

