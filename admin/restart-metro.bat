@echo off
echo ========================================
echo RESTARTING METRO BUNDLER
echo ========================================
echo.
echo This will fix the "AdminconsultanciesScreen is not defined" error
echo.

echo [1/5] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node processes stopped
    timeout /t 2 /nobreak >nul
) else (
    echo ℹ No Node processes running
)
echo.

echo [2/5] Clearing Metro bundler cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ Cleared Metro cache
) else (
    echo ℹ Metro cache not found
)
echo.

echo [3/5] Clearing Expo cache...
if exist ".expo" (
    rmdir /s /q ".expo"
    echo ✓ Cleared Expo cache
) else (
    echo ℹ Expo cache not found
)
echo.

echo [4/5] Clearing temp caches...
if exist "%TEMP%\metro-*" (
    rmdir /s /q "%TEMP%\metro-*" 2>nul
    echo ✓ Cleared temp Metro cache
) else (
    echo ℹ No temp Metro cache found
)
if exist "%TEMP%\haste-map-*" (
    rmdir /s /q "%TEMP%\haste-map-*" 2>nul
    echo ✓ Cleared temp haste-map cache
) else (
    echo ℹ No temp haste-map cache found
)
echo.

echo [5/5] Starting Metro with fresh cache...
echo.
echo ========================================
echo All caches cleared!
echo Starting Metro bundler...
echo ========================================
echo.
echo Once Metro starts, press 'w' to open in browser
echo.
npm start -- --reset-cache
