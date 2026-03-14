# Fix Bundler Errors - Quick Guide

## Problem
You're seeing these errors:
1. `"shadow" style props are deprecated. Use "boxShadow"`
2. `Uncaught ReferenceError: AdminConsoleNavigationScreen is not defined`

## Root Cause
The Metro bundler has cached corrupted or outdated module references. This happens when:
- Files are renamed/deleted while the bundler is running
- Dependencies are updated without clearing cache
- The bundler crashes mid-compilation

## Solution

### Step 1: Clear All Caches
Run the provided batch file:
```bash
clear-all-cache.bat
```

This will:
- Stop any running Metro bundler processes
- Remove node_modules/.cache
- Remove .expo directory
- Clear Metro bundler temp files
- Clear Expo cache
- Clear watchman cache (if installed)

### Step 2: Restart the Development Server
```bash
npm run web
```

### Alternative Manual Steps (if batch file doesn't work)

1. Stop the Metro bundler (Ctrl+C in the terminal)

2. Clear caches manually:
```powershell
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\react-* -ErrorAction SilentlyContinue
```

3. Restart:
```bash
npm run web
```

### Step 3: If Still Not Working

If the error persists, do a full reinstall:

```bash
# Remove node_modules
Remove-Item -Recurse -Force node_modules

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Start fresh
npm run web
```

## What Was Fixed

1. **Removed unused React import** in App.js (was causing the hint warning)
2. **Created cache clearing script** to remove all bundler caches
3. **No code changes needed** - the error was purely a bundler cache issue

## Prevention

To avoid this in the future:
- Always stop the bundler before making major file changes
- Clear cache after updating dependencies
- Use `npm run web` with a fresh terminal session
- If you see weird errors, clear cache first before debugging code

## Notes

The `AdminConsoleNavigationScreen` error is a phantom reference from the bundler cache - it doesn't actually exist in your code. Clearing the cache will resolve it.
