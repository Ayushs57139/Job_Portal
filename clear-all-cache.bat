@echo off
echo Clearing all caches and restarting fresh...

echo.
echo [1/6] Stopping any running Metro bundler...
taskkill /F /IM node.exe 2>nul

echo.
echo [2/6] Removing node_modules cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [3/6] Removing .expo cache...
if exist .expo rmdir /s /q .expo

echo.
echo [4/6] Removing Metro bundler cache...
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-*
if exist %TEMP%\react-* rmdir /s /q %TEMP%\react-*

echo.
echo [5/6] Removing Expo cache...
if exist %USERPROFILE%\.expo rmdir /s /q %USERPROFILE%\.expo

echo.
echo [6/6] Clearing watchman (if installed)...
watchman watch-del-all 2>nul

echo.
echo ========================================
echo Cache cleared successfully!
echo ========================================
echo.
echo Now run: npm run web
echo.
pause
