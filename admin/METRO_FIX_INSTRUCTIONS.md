# 🚀 Metro Bundler Error Fix - Step by Step

## Current Error
```
Uncaught ReferenceError: AppEntry.bundleJsFile is not defined
```

This is a Metro bundler cache corruption issue. Here's how to fix it:

## ✅ Solution (Choose One Method)

### Method 1: Use the Fix Script (Easiest)
```bash
cd admin
fix-metro.bat
```

This will:
1. Stop all Node processes
2. Clear Metro cache
3. Clear Expo cache
4. Start Metro with fresh cache

### Method 2: Manual Commands
```bash
cd admin

# Stop Metro (press Ctrl+C if running)

# Clear caches
rmdir /s /q node_modules\.cache
rmdir /s /q .expo

# Start fresh
npm start -- --reset-cache
```

### Method 3: Use Expo CLI
```bash
cd admin
npx expo start -c
```

## 🎯 What to Expect

After running the fix, you should see:
```
Metro waiting on exp://192.168.x.x:8081
› Press w │ open web
› Press a │ open Android
› Press i │ open iOS simulator
```

Then press `w` to open in browser or `r` to reload.

## ⚠️ About the Shadow Warnings

You might see warnings like:
```
"shadow" style props are deprecated
```

These are just warnings, NOT errors. They don't affect functionality and can be safely ignored.

## 🔴 If Still Not Working

Try the nuclear option:
```bash
cd admin

# Stop everything
taskkill /F /IM node.exe

# Delete and reinstall
rmdir /s /q node_modules
npm install

# Start fresh
npm start -- --reset-cache
```

## 📋 Quick Reference

| Issue | Command |
|-------|---------|
| Cache errors | `npm start -- --reset-cache` |
| Port busy | `taskkill /F /IM node.exe` |
| Complete reset | Delete `node_modules`, run `npm install` |

## ✅ Success Checklist

- [ ] Metro bundler starts without errors
- [ ] Browser opens at localhost:8081
- [ ] App loads successfully
- [ ] No "AppEntry.bundleJsFile" errors
- [ ] Navigation works

## 💡 Prevention Tips

Always clear cache when:
- Pulling new code
- Switching branches
- After npm install
- Seeing bundler errors

Quick command: `npm start -- --reset-cache`

---

**TL;DR**: Run `fix-metro.bat` in the admin folder 🚀
