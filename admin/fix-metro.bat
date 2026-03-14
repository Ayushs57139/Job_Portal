@echo off
echo ========================================
echo Metro Bundler Cache Reset
echo ========================================
echo.

echo [1/4] Stopping Node processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node processes stopped
) else (
    echo ℹ No Node processes running
)
echo.

echo [2/4] Clearing Metro cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ Cleared node_modules\.cache
) else (
    echo ℹ node_modules\.cache not found
)
echo.

echo [3/4] Clearing Expo cache...
if exist ".expo" (
    rmdir /s /q ".expo"
    echo ✓ Cleared .expo folder
) else (
    echo ℹ .expo folder not found
)
echo.

echo [4/4] Starting Metro with fresh cache...
echo.
echo ========================================
echo Running: npm start -- --reset-cache
echo ========================================
echo.
npm start -- --reset-cache
