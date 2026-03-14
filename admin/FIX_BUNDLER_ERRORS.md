# Fix Bundler Errors - Complete Guide

## 🔴 Errors You're Seeing

1. **Uncaught ReferenceError: AppEntry.bundleJsFile is not defined**
2. **"shadow" style props are deprecated warnings**

## ✅ Solution

These errors are caused by Metro bundler cache issues. Follow these steps:

### Step 1: Stop Everything

1. **Stop Metro bundler** (if running)
   - Press `Ctrl + C` in the terminal running Metro

2. **Close the browser tab** with localhost:8081

### Step 2: Clear All Caches

Run these commands in the `admin` folder:

```bash
# Clear Metro cache
rd /s /q node_modules\.cache
rd /s /q .expo
rd /s /q %TEMP%\metro-*
rd /s /q %TEMP%\haste-map-*

# Clear watchman (if installed)
watchman watch-del-all
```

**OR** simply run the provided batch file:
```bash
fix-errors.bat
```

### Step 3: Start Fresh

```bash
npm start -- --reset-cache
```

### Step 4: Reload the App

Once Metro starts:
1. Press `w` to open in web browser
2. Or press `r` to reload if already open

## 🎯 Quick Fix (One Command)

If you want to do everything in one go:

```bash
rd /s /q node_modules\.cache & rd /s /q .expo & npm start -- --reset-cache
```

## 🔍 Understanding the Errors

### AppEntry.bundleJsFile Error
- **Cause**: Metro bundler cache corruption
- **Solution**: Clear cache and restart
- **Why it happens**: Old cached bundle files conflict with new code

### Shadow Props Warnings
- **Cause**: React Native deprecation warnings (not errors)
- **Impact**: None - these are just warnings
- **Status**: Already properly handled with Platform checks
- **Action**: Can be ignored or will be fixed in future React Native updates

## 📝 Alternative Methods

### Method 1: Nuclear Option (Complete Reset)
```bash
# Delete everything and reinstall
rd /s /q node_modules
rd /s /q .expo
rd /s /q node_modules\.cache
npm install
npm start -- --reset-cache
```

### Method 2: Expo CLI Reset
```bash
npx expo start -c
```

### Method 3: Manual Cache Clear
1. Close Metro bundler
2. Delete these folders:
   - `admin/node_modules/.cache`
   - `admin/.expo`
   - `C:\Users\[YourUser]\AppData\Local\Temp\metro-*`
   - `C:\Users\[YourUser]\AppData\Local\Temp\haste-map-*`
3. Restart: `npm start -- --reset-cache`

## 🚀 Prevention

To avoid these errors in the future:

1. **Always use reset cache after major changes:**
   ```bash
   npm start -- --reset-cache
   ```

2. **Clear cache before pulling new code:**
   ```bash
   rd /s /q node_modules\.cache
   git pull
   npm start -- --reset-cache
   ```

3. **Use the provided scripts:**
   - `clear-cache.bat` - Clears all caches
   - `fix-errors.bat` - Fixes bundler errors

## 🔧 Troubleshooting

### If errors persist after clearing cache:

1. **Check if Metro is fully stopped:**
   ```bash
   # Kill all node processes
   taskkill /F /IM node.exe
   ```

2. **Check port 8081:**
   ```bash
   # See what's using port 8081
   netstat -ano | findstr :8081
   
   # Kill the process (replace PID with actual process ID)
   taskkill /F /PID [PID]
   ```

3. **Reinstall dependencies:**
   ```bash
   rd /s /q node_modules
   npm install
   npm start -- --reset-cache
   ```

4. **Check for conflicting processes:**
   - Close other React Native projects
   - Close other Metro bundlers
   - Close Android Studio/Xcode if open

### If shadow warnings bother you:

These are just warnings and don't affect functionality. To suppress them:

1. **Option 1**: Ignore them (recommended)
   - They're already properly handled
   - Will be fixed in future React Native versions

2. **Option 2**: Update React Native
   ```bash
   npm update react-native
   ```

3. **Option 3**: Use LogBox to hide warnings
   Add to `App.js`:
   ```javascript
   import { LogBox } from 'react-native';
   LogBox.ignoreLogs(['shadow']);
   ```

## ✅ Expected Result

After following these steps, you should see:

```
Metro waiting on exp://192.168.x.x:8081
› Press w │ open web
› Press a │ open Android
› Press i │ open iOS simulator
› Press r │ reload app
```

And the app should load without errors!

## 📞 Still Having Issues?

If you still see errors after trying all methods:

1. **Check your code for syntax errors:**
   ```bash
   npm run lint
   ```

2. **Check for missing dependencies:**
   ```bash
   npm install
   ```

3. **Verify Node.js version:**
   ```bash
   node --version
   # Should be 16.x or higher
   ```

4. **Check npm version:**
   ```bash
   npm --version
   # Should be 8.x or higher
   ```

5. **Try a different port:**
   ```bash
   npm start -- --port 8082 --reset-cache
   ```

## 🎉 Summary

**Quick Fix:**
```bash
rd /s /q node_modules\.cache & rd /s /q .expo & npm start -- --reset-cache
```

**That's it!** Your app should now work without errors. 🚀
