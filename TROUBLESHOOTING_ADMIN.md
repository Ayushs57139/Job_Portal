# Admin Panel Troubleshooting Guide

## Issue: 500 Error When Accessing /admin

### Error Messages:
```
AppEntry.bundle:1 Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Refused to execute script from 'http://localhost:8081/node_modules/expo/AppEntry.bundle...' 
because its MIME type ('application/json') is not executable
```

## Solutions

### Solution 1: Clear Cache and Restart (Most Common Fix)

**Windows PowerShell:**
```powershell
# Stop current server (Ctrl+C)

# Option A: Using npx
npx expo start --clear

# Option B: Using npm
npm start -- --clear

# Option C: For web only
npx expo start --web --clear
```

**macOS/Linux:**
```bash
# Stop current server (Ctrl+C)

# Clear and start
npm start -- --clear

# Or
expo start --clear
```

### Solution 2: Deep Cache Clear

**Windows PowerShell:**
```powershell
# 1. Stop the server (Ctrl+C)

# 2. Clear watchman (if installed)
watchman watch-del-all

# 3. Delete cache directories
Remove-Item -Recurse -Force node_modules\.cache
Remove-Item -Recurse -Force .expo

# 4. Restart
npm start
```

**macOS/Linux:**
```bash
# 1. Stop the server

# 2. Clear watchman
watchman watch-del-all

# 3. Delete cache directories
rm -rf node_modules/.cache
rm -rf .expo
rm -rf web-build

# 4. Restart
npm start
```

### Solution 3: Full Reset

**If the above don't work:**

```powershell
# Windows
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npx expo start --clear
```

```bash
# macOS/Linux
rm -rf node_modules
rm package-lock.json
npm install
npm start -- --clear
```

### Solution 4: Check Port Conflicts

The issue might be port 8081 is already in use:

**Windows:**
```powershell
# Find what's using port 8081
netstat -ano | findstr :8081

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Restart server
npm start
```

**macOS/Linux:**
```bash
# Find what's using port 8081
lsof -i :8081

# Kill the process
kill -9 <PID>

# Restart server
npm start
```

### Solution 5: Change Port

If port 8081 has persistent issues:

**Edit package.json:**
```json
{
  "scripts": {
    "start": "expo start --port 19006"
  }
}
```

Then update `AppNavigator.js`:
```javascript
const linking = {
  prefixes: [
    'http://localhost:19006',  // Updated port
    'jobwala://'
  ],
  // ...
};
```

## Common Issues and Fixes

### Issue: White Screen on /admin

**Cause:** JavaScript bundle not loading

**Fix:**
1. Check browser console for errors
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try incognito/private mode
4. Restart Expo server with `--clear`

### Issue: "Cannot find module" errors

**Cause:** Missing dependencies or cache issues

**Fix:**
```powershell
# Reinstall dependencies
npm install

# Clear cache and restart
npx expo start --clear
```

### Issue: Deep linking not working on web

**Cause:** Metro bundler routing issue

**Fix:**
1. Always access the root first: `http://localhost:8081`
2. Then navigate to: `http://localhost:8081/admin`
3. Or refresh the page with F5

### Issue: MIME type error persists

**Cause:** Server returning error response as JSON

**Fix:**
1. Check terminal for bundling errors
2. Look for TypeScript/ESLint errors
3. Fix any import errors
4. Restart with clear cache

## Verification Steps

After applying fixes:

### Step 1: Check Server is Running
```
✓ Metro bundler should show: "Bundling complete..."
✓ No red errors in terminal
✓ Server accessible at http://localhost:8081
```

### Step 2: Test Root Route
```
Navigate to: http://localhost:8081
Expected: Home page loads
```

### Step 3: Test Admin Route
```
Navigate to: http://localhost:8081/admin
Expected: Admin login screen loads
```

### Step 4: Check Browser Console
```
Open DevTools (F12)
Console tab should show no errors
Network tab should show 200 responses
```

## Quick Diagnostics

Run these checks if issues persist:

### 1. Check Node Version
```bash
node --version
# Should be v14+ (v16+ recommended)
```

### 2. Check npm Version
```bash
npm --version
# Should be v6+ (v8+ recommended)
```

### 3. Check Expo CLI Version
```bash
npx expo --version
# Should be latest version
```

### 4. Check for Port Conflicts
```powershell
# Windows
netstat -ano | findstr :8081

# macOS/Linux
lsof -i :8081
```

### 5. Check Dependencies
```bash
npm list react-navigation
npm list expo
npm list react-native
```

## Development Best Practices

### Always Start Fresh
```bash
# Clear cache before starting
npm start -- --clear
```

### Use Correct URLs
- Development: `http://localhost:8081/admin`
- NOT: `localhost:8081/admin` (missing http://)
- NOT: `127.0.0.1:8081/admin` (use localhost for deep linking)

### Browser Console
- Keep DevTools open (F12)
- Watch Console tab for errors
- Check Network tab for failed requests
- Clear cache regularly (Ctrl+Shift+Delete)

## Platform-Specific Issues

### Windows

**Issue:** `ENOENT: no such file or directory`
- Run terminal as Administrator
- Check file paths don't exceed 260 characters
- Use short path names (avoid spaces)

**Issue:** Permission denied
- Close any antivirus temporarily
- Run as Administrator
- Check file permissions

### macOS

**Issue:** `EACCES` permission error
```bash
sudo chown -R $USER ~/.npm
sudo chown -R $USER node_modules
```

**Issue:** Watchman errors
```bash
brew update
brew reinstall watchman
```

### Linux

**Issue:** `ENOSPC` (file watchers)
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Advanced Debugging

### Enable Verbose Logging
```bash
EXPO_DEBUG=true npm start
```

### Check Bundle Loading
```javascript
// In browser console
console.log('Bundle loaded:', typeof AppRegistry !== 'undefined');
```

### Test Without Deep Linking
1. Remove `linking` prop from NavigationContainer
2. Restart app
3. If works, issue is with deep linking config
4. Add linking back gradually

### Check Import Paths
```javascript
// Verify all imports are correct
import AdminLoginScreen from '../screens/Auth/AdminLoginScreen';
// Not: import AdminLoginScreen from './AdminLoginScreen'; (wrong path)
```

## Still Not Working?

### Last Resort Steps:

1. **Complete Clean Install**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force web-build
Remove-Item package-lock.json
npm cache clean --force
npm install
npx expo start --clear
```

2. **Check for Conflicting Packages**
```bash
npm ls react-navigation
# Should show only one version
```

3. **Verify File Structure**
```
src/
├── navigation/
│   └── AppNavigator.js ✓
└── screens/
    └── Auth/
        └── AdminLoginScreen.js ✓
```

4. **Test Basic Navigation**
```javascript
// Temporarily simplify AppNavigator.js
// Remove linking prop
<NavigationContainer>
  {/* ... */}
</NavigationContainer>
```

5. **Contact Support**
- Check GitHub issues
- Expo forums
- React Navigation docs

## Success Indicators

✅ Terminal shows: "Metro bundler ready"
✅ No red errors in terminal
✅ Browser loads: `http://localhost:8081`
✅ Admin login appears at: `http://localhost:8081/admin`
✅ Browser console: No errors
✅ Network tab: All resources load with 200 status

## Useful Commands Reference

```bash
# Start fresh
npm start -- --clear

# Start for web only
npx expo start --web

# Start with tunnel (for mobile testing)
npx expo start --tunnel

# Check for updates
npx expo-cli upgrade

# Diagnose issues
npx expo-doctor

# Clear everything
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

If issues persist:

1. **Check terminal output** for specific error messages
2. **Check browser console** (F12) for JavaScript errors
3. **Share error logs** when seeking help
4. **Mention your environment**: OS, Node version, Expo version
5. **List steps taken** to help others diagnose

---

**Remember:** Most issues are resolved by:
1. Clearing cache: `npm start -- --clear`
2. Restarting server
3. Refreshing browser

If you see 500 errors, it's almost always a bundling/cache issue that clearing cache will fix!

