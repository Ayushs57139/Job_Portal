# Testing "Login as User" Feature

## 🧪 How to Test

### Prerequisites
1. Admin panel running on `http://localhost:8081`
2. Main app running on `http://localhost:8080` (or different port)
3. Backend API running with the endpoint implemented
4. At least one test user in the database

---

## 📋 Test Steps

### Step 1: Open Browser Console
Before testing, open the browser console (F12) to see debug logs.

### Step 2: Navigate to Users Management
1. Login to admin panel
2. Click "Users" in the sidebar
3. You should see the list of users

### Step 3: Click Login Button
1. Find any user in the table
2. Look at the Actions column (last column)
3. Click the middle button (🔓 green login icon)

### Step 4: Check Console Logs
You should see these logs in the console:
```
Attempting to login as user: <user_id>
Making API call to: http://localhost:8081/api/admin/login-as-user/<user_id>
API Response: { success: true, token: "...", user: {...} }
Tokens stored successfully
```

### Step 5: Confirm Dialog
A confirmation dialog will appear with:
- User's name
- Email
- Role
- Type (if employer)

Click "Login" to proceed.

### Step 6: Success Message
If successful, you'll see:
```
Success
Logged in as [User Type] successfully!

You will be redirected to the user panel. Please close this admin panel and open the main app at:

http://localhost:8081/[dashboard-url]
```

### Step 7: Redirect
- **On Web:** Automatically redirects to the user dashboard
- **On Mobile:** Shows instructions to open the main app

---

## 🔍 What to Check

### Console Logs
Check for these messages:
- ✅ "Attempting to login as user"
- ✅ "Making API call to"
- ✅ "API Response"
- ✅ "Tokens stored successfully"

### AsyncStorage
Check if tokens are stored:
```javascript
// In browser console
AsyncStorage.getItem('token').then(console.log)
AsyncStorage.getItem('user').then(console.log)
```

### API Response
The API should return:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "JOBSEEKER",
    "employerType": null
  }
}
```

---

## ❌ Common Issues & Solutions

### Issue 1: Button Not Responding
**Symptoms:** Click button, nothing happens

**Check:**
1. Open browser console
2. Look for JavaScript errors
3. Check if `handleLoginAsUser` function is defined

**Solution:**
```bash
# Restart the app
cd admin
npm start
```

### Issue 2: API Error
**Symptoms:** Error message "Failed to login as user"

**Check Console:**
```
API Response: { success: false, message: "..." }
```

**Possible Causes:**
- Backend API endpoint not implemented
- Wrong API URL
- Authentication token invalid

**Solution:**
1. Check if backend is running
2. Verify API endpoint exists: `POST /api/admin/login-as-user/:userId`
3. Check admin token is valid

### Issue 3: Delete Button Not Working
**Symptoms:** Click delete, nothing happens

**Check Console:**
```
Delete user clicked: <user_id>
Deleting user: <user_id>
Delete response: { ... }
```

**Solution:**
1. Check if backend DELETE endpoint exists
2. Verify admin has delete permissions
3. Check network tab for API call

### Issue 4: Wrong Dashboard URL
**Symptoms:** Redirected to wrong page

**Check:**
- User role in database
- User employerType field
- Console logs showing dashboard URL

**Solution:**
Update the dashboard URL logic in the code.

---

## 🎯 Test Cases

### Test Case 1: Login as Job Seeker
1. Find a user with role: `JOBSEEKER`
2. Click login button
3. Confirm action
4. Should redirect to: `http://localhost:8081/user-dashboard`

### Test Case 2: Login as Employer
1. Find a user with role: `EMPLOYER` (no specific type)
2. Click login button
3. Confirm action
4. Should redirect to: `http://localhost:8081/employer-dashboard`

### Test Case 3: Login as Company
1. Find a user with role: `EMPLOYER` and type: `COMPANY`
2. Click login button
3. Confirm action
4. Should redirect to: `http://localhost:8081/company-dashboard`

### Test Case 4: Login as Consultancy
1. Find a user with role: `EMPLOYER` and type: `CONSULTANCY`
2. Click login button
3. Confirm action
4. Should redirect to: `http://localhost:8081/consultancy-dashboard`

### Test Case 5: Cancel Login
1. Click login button
2. Click "Cancel" in dialog
3. Should stay on users page
4. No API call should be made

### Test Case 6: Delete User
1. Click delete button (🗑️)
2. Confirm deletion
3. User should be removed from list
4. Success message should appear

---

## 🐛 Debugging

### Enable Debug Mode
Add this to see all logs:
```javascript
// In AdminUsersScreen.js
console.log('User object:', user);
console.log('API_URL:', API_URL);
console.log('Admin token:', await AsyncStorage.getItem('token'));
```

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click login button
4. Look for POST request to `/admin/login-as-user/:userId`
5. Check request headers and response

### Check AsyncStorage
```javascript
// In browser console
AsyncStorage.getAllKeys().then(keys => {
  keys.forEach(key => {
    AsyncStorage.getItem(key).then(value => {
      console.log(key, value);
    });
  });
});
```

---

## 📊 Expected Behavior

### Before Login
```
AsyncStorage:
- token: admin_token
- adminToken: admin_token (maybe)
- user: admin_user_data
```

### After Login
```
AsyncStorage:
- token: user_token
- userToken: user_token
- user: user_data
- adminToken: (removed)
```

### Navigation
- **Web:** `window.location.href` changes to dashboard URL
- **Mobile:** Shows instruction message

---

## 🔧 Manual Testing Checklist

- [ ] Admin panel loads correctly
- [ ] Users list displays
- [ ] Login button is visible (green icon)
- [ ] Delete button is visible (red icon)
- [ ] View button is visible (blue icon)
- [ ] Click login button shows confirmation
- [ ] Confirmation shows correct user info
- [ ] Cancel button works
- [ ] Login button makes API call
- [ ] Success message appears
- [ ] Tokens are stored correctly
- [ ] Redirect works (web)
- [ ] Instructions shown (mobile)
- [ ] Delete button shows confirmation
- [ ] Delete button removes user
- [ ] Page refreshes after delete

---

## 🚀 Quick Test Script

Run this in browser console after clicking login:
```javascript
// Check if function exists
console.log('handleLoginAsUser exists:', typeof handleLoginAsUser !== 'undefined');

// Check API URL
console.log('API_URL:', API_URL);

// Check tokens
AsyncStorage.getItem('token').then(token => console.log('Current token:', token));

// Check user data
AsyncStorage.getItem('user').then(user => console.log('Current user:', user));
```

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________
Environment: [ ] Web [ ] iOS [ ] Android

Test Results:
[ ] Login as Job Seeker - PASS/FAIL
[ ] Login as Employer - PASS/FAIL
[ ] Login as Company - PASS/FAIL
[ ] Login as Consultancy - PASS/FAIL
[ ] Delete User - PASS/FAIL
[ ] Cancel Actions - PASS/FAIL

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

## 🆘 Need Help?

### Check These Files:
1. `admin/src/screens/Admin/AdminUsersScreen.js` - Main file
2. `admin/src/config/api.js` - API configuration
3. `admin/src/navigation/AdminNavigator.js` - Navigation setup

### Console Commands:
```javascript
// Check if buttons are rendered
document.querySelectorAll('[data-testid="login-button"]').length

// Check event listeners
console.log('Event listeners:', getEventListeners(document.querySelector('.actionButton')))

// Force trigger function
handleLoginAsUser({ _id: 'test-id', role: 'JOBSEEKER', email: 'test@test.com' })
```

---

**Last Updated:** 2024
**Version:** 1.0.0
