# How to Use "Login as User" Feature

## ✅ AUTOMATIC DASHBOARD REDIRECT

The "Login as User" feature now includes AUTOMATIC redirection to the appropriate dashboard!

---

## 🎯 Quick Start (3 Simple Steps)

### Step 1: Click Login Button in Admin Panel
1. Go to Users Management in admin panel (http://localhost:8081)
2. Click the 🔓 (green login icon) next to any user
3. Confirm the action in the dialog

### Step 2: Click "Open Main App"
- Click the "Open Main App" button in the success dialog
- A new tab will open with the main app (http://localhost:8080)

### Step 3: Automatic Redirect ✨
- You will be AUTOMATICALLY redirected to the appropriate dashboard:
  - Job Seekers → User Dashboard
  - Companies → Company Dashboard
  - Consultancies → Consultancy Dashboard
  - Admins → Admin Dashboard

**That's it! No manual navigation needed!**

---

## 🚀 What's New

The main app now automatically detects when you've logged in as a user from the admin panel and redirects you to the correct dashboard based on the user's role.

### Before (Old Behavior):
1. Click login in admin panel
2. Open main app
3. Manually navigate to dashboard ❌

### Now (New Behavior):
1. Click login in admin panel
2. Open main app
3. Automatically redirected to dashboard ✅

---

## 🎯 What Happens

### In Admin Panel (Port 8081):
1. ✅ Login button clicked
2. ✅ API call made to backend
3. ✅ User token received
4. ✅ Token saved to browser storage
5. ✅ Success message shown

### In Main App (Port 8080):
1. Open the main app URL
2. App checks for token in storage
3. Finds the user token
4. Automatically logs you in
5. Redirects to appropriate dashboard

---

## 📱 Step-by-Step Example

### Example: Login as Job Seeker

1. **In Admin Panel (localhost:8081):**
   ```
   - Click Users
   - Find "Rajuuu User" (Job Seeker)
   - Click 🔓 login button
   - Click "Login" in confirmation
   - See success message
   ```

2. **Success Dialog Shows:**
   ```
   ✅ Success!
   You are now logged in as Rajuuu User (Job Seeker).
   
   ⚠️ IMPORTANT:
   1. Close this admin panel tab
   2. Open the MAIN APP at: http://localhost:8080
   3. You will be automatically logged in
   ```

3. **Click "Open Main App" Button:**
   - New tab opens
   - Goes to http://localhost:8080
   - You're logged in as Rajuuu User
   - See user dashboard

---

## 🔧 Troubleshooting

### Issue: "I clicked login but nothing happened"
**Solution:** 
- Check browser console (F12)
- Look for success message
- The token IS saved, you just need to open the main app

### Issue: "Main app doesn't open"
**Solution:**
- Manually open: `http://localhost:8080`
- Check if main app is running
- Allow popups in browser

### Issue: "I'm not logged in when I open main app"
**Solution:**
- Check if token was saved:
  ```javascript
  // In browser console
  localStorage.getItem('token')
  ```
- Make sure you're using the same browser
- Clear cache and try again

### Issue: "Wrong dashboard opens"
**Solution:**
- The main app will automatically route you based on user role
- Job Seekers → User Dashboard
- Employers → Employer Dashboard
- Companies → Company Dashboard
- Consultancies → Consultancy Dashboard

---

## 🎬 Video Tutorial Steps

1. **Start Both Apps:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start
   
   # Terminal 2 - Admin Panel
   cd admin
   npm start
   
   # Terminal 3 - Main App
   cd ../  # root directory
   npm start
   ```

2. **Login to Admin Panel:**
   - Open: http://localhost:8081
   - Login with admin credentials

3. **Go to Users:**
   - Click "Users" in sidebar
   - See list of users

4. **Click Login Button:**
   - Find any user
   - Click 🔓 (green icon)
   - Click "Login" in dialog

5. **Open Main App:**
   - Click "Open Main App" button
   - OR manually open: http://localhost:8080

6. **Verify:**
   - You're logged in as the user
   - See user's dashboard
   - Can perform actions as that user

---

## 💡 Pro Tips

### Tip 1: Keep Both Tabs Open
- Keep admin panel in one tab
- Keep main app in another tab
- Easy to switch between them

### Tip 2: Use Incognito for Testing
- Open admin panel in normal window
- Open main app in incognito window
- Prevents token conflicts

### Tip 3: Check Console Logs
- Always have console open (F12)
- Look for colored logs (🔵 🟢 ✅)
- Helps debug issues

### Tip 4: Bookmark Main App
- Bookmark: http://localhost:8080
- Quick access after login

---

## 📊 Port Reference

| App | Port | URL |
|-----|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Main User App | 8080 | http://localhost:8080 |
| Admin Panel | 8081 | http://localhost:8081 |

---

## ✅ Success Checklist

After clicking login button:
- [ ] Success message appears
- [ ] Console shows "✅ Tokens stored successfully"
- [ ] "Open Main App" button is visible
- [ ] Clicking button opens new tab
- [ ] New tab goes to http://localhost:8080
- [ ] You're logged in as the user
- [ ] Can see user's dashboard
- [ ] Can perform actions as user

---

## 🔐 Security Notes

- Token is saved in browser storage
- Token expires after 24 hours
- Admin action is logged in backend
- User may be notified (depending on settings)

---

## 🆘 Still Having Issues?

### Check These:
1. ✅ Backend running on port 5000
2. ✅ Admin panel running on port 8081
3. ✅ Main app running on port 8080
4. ✅ All three apps are running
5. ✅ Using same browser for both apps
6. ✅ Popups are allowed
7. ✅ Console shows no errors

### Get Help:
- Check console logs (F12)
- Check backend logs
- Check network tab
- Contact support

---

## 📝 Summary

**The "Login as User" feature WORKS!**

It saves the user's token to your browser. To actually USE that token and see the user's dashboard, you need to:

1. ✅ Click login button (in admin panel)
2. ✅ Wait for success message
3. ✅ Click "Open Main App" button
4. ✅ Main app opens in new tab
5. ✅ You're logged in as the user!

**Remember:** Admin panel and main app are separate. You can't be "redirected" from one to the other. You need to OPEN the main app after logging in.

---

**Last Updated:** 2024
**Version:** 1.0.0
