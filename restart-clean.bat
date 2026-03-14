@echo off
echo ========================================
echo  Clean Restart Script
echo ========================================
echo.

echo [1/4] Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/4] Clearing all caches...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo
echo Cache cleared!

echo.
echo [3/4] Waiting for processes to fully terminate...
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting development server...
echo.
echo ========================================
echo  Starting npm run web...
echo ========================================
echo.

npm run web
