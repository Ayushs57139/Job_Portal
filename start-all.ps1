# Start both backend server and frontend app
Write-Host "Starting JobWala Application..." -ForegroundColor Green
Write-Host ""

# Start backend server in background
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start" -WindowStyle Minimized

# Wait a bit for server to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend app..." -ForegroundColor Cyan
Write-Host ""
npm start

