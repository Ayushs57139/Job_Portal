# 🚀 Quick Fix Guide - Bundler Errors

## ⚡ Fastest Solution (Copy & Paste)

Open PowerShell in the `admin` folder and run:

```powershell
Remove-Item -Recurse -Force node_modules\.cache,.expo -ErrorAction SilentlyContinue; npm start -- --reset-cache
```

**OR** use the provided script:

```powershell
.\fix-bundler.ps1
```

**OR** use the batch file:

```cmd
fix-errors.bat
```

## 🎯 What This Does

1. ✅ Clears Metro bundler cache
2. ✅ Clears Expo cache
3. ✅ Restarts Metro with fresh cache
4. ✅ Fixes all bundler errors

## 📋 Step-by-Step (If Above Doesn't Work)

### 1. Stop Metro Bundler
Press `Ctrl + C` in the terminal

### 2. Clear Caches
```powershell
Remove-Item -Recurse -Force node_modules\.cache
Remove-Item -Recurse -Force .expo
```

### 3. Start Fresh
```powershell
npm start -- --reset-cache
```

### 4. Reload App
Press `w` to open in browser or `r` to reload

## 🔴 Common Errors Fixed

- ✅ `AppEntry.bundleJsFile is not defined`
- ✅ `Uncaught ReferenceError`
- ✅ Metro bundler cache issues
- ✅ Stale bundle errors

## ⚠️ Warnings (Can Ignore)

- `"shadow" style props are deprecated` - These are just warnings, not errors
- They don't affect functionality
- Already properly handled in the code

## 💡 Pro Tips

**Always clear cache when:**
- Switching branches
- Pulling new code
- After npm install
- Seeing weird bundler errors

**Quick command:**
```powershell
npm start -- --reset-cache
```

## 🆘 Still Not Working?

Try the nuclear option:

```powershell
# Stop everything
taskkill /F /IM node.exe

# Delete and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Start fresh
npm start -- --reset-cache
```

## ✅ Success Indicators

You should see:
```
Metro waiting on exp://...
› Press w │ open web
› Press a │ open Android
```

And the app loads without errors! 🎉

## 📞 Quick Reference

| Problem | Solution |
|---------|----------|
| Bundler errors | `npm start -- --reset-cache` |
| Port 8081 busy | `taskkill /F /IM node.exe` |
| Stale cache | `Remove-Item -Recurse -Force node_modules\.cache,.expo` |
| Complete reset | Delete `node_modules`, run `npm install` |

---

**TL;DR**: Run `.\fix-bundler.ps1` or `npm start -- --reset-cache` 🚀
