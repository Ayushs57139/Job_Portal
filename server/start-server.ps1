# Server startup script with auto-restart capability for PowerShell
# This script will automatically restart the server if it crashes

Write-Host "Starting JobWala Server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

# Function to check if PM2 is installed
function Test-PM2 {
    try {
        $null = Get-Command pm2 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Function to start with PM2
function Start-WithPM2 {
    Write-Host "Using PM2 for process management..." -ForegroundColor Cyan
    pm2 start ecosystem.config.js --env production
    pm2 logs jobwala-server
}

# Function to start without PM2 (fallback)
function Start-WithoutPM2 {
    Write-Host "PM2 not found. Starting with auto-restart script..." -ForegroundColor Yellow
    Write-Host "Warning: For production, install PM2: npm install -g pm2" -ForegroundColor Yellow
    
    while ($true) {
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Starting server..." -ForegroundColor Gray
        node index.js
        
        # If server exits, wait before restarting
        $ExitCode = $LASTEXITCODE
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Server exited with code: $ExitCode" -ForegroundColor Gray
        
        if ($ExitCode -eq 0) {
            Write-Host "Server shut down normally. Exiting..." -ForegroundColor Green
            break
        }
        
        Write-Host "Server crashed. Restarting in 5 seconds..." -ForegroundColor Red
        Start-Sleep -Seconds 5
    }
}

# Main logic
if (Test-PM2) {
    Start-WithPM2
} else {
    Start-WithoutPM2
}

