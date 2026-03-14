@echo off
echo Fixing React Native errors...
echo.

echo Step 1: Clearing Metro bundler cache...
rd /s /q node_modules\.cache 2>nul
rd /s /q .expo 2>nul
rd /s /q %TEMP%\metro-* 2>nul
rd /s /q %TEMP%\haste-map-* 2>nul
echo Cache cleared!
echo.

echo Step 2: Clearing watchman cache...
watchman watch-del-all 2>nul
echo Watchman cleared!
echo.

echo Step 3: Starting Metro with reset cache...
echo Run: npm start -- --reset-cache
echo.

echo Done! Now restart your development server with:
echo npm start -- --reset-cache
echo.
pause
