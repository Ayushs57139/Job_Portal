#!/bin/bash

# Server startup script with auto-restart capability
# This script will automatically restart the server if it crashes

echo "Starting JobWala Server..."
echo "Press Ctrl+C to stop"

# Function to check if PM2 is installed
check_pm2() {
    if command -v pm2 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to start with PM2
start_with_pm2() {
    echo "Using PM2 for process management..."
    pm2 start ecosystem.config.js --env production
    pm2 logs jobwala-server
}

# Function to start without PM2 (fallback)
start_without_pm2() {
    echo "PM2 not found. Starting with auto-restart script..."
    echo "Warning: For production, install PM2: npm install -g pm2"
    
    while true; do
        echo "[$(date)] Starting server..."
        node index.js
        
        # If server exits, wait before restarting
        EXIT_CODE=$?
        echo "[$(date)] Server exited with code: $EXIT_CODE"
        
        if [ $EXIT_CODE -eq 0 ]; then
            echo "Server shut down normally. Exiting..."
            break
        fi
        
        echo "Server crashed. Restarting in 5 seconds..."
        sleep 5
    done
}

# Main logic
if check_pm2; then
    start_with_pm2
else
    start_without_pm2
fi

