# Admin Deep Linking Implementation Guide

## Overview

This guide explains how the admin deep linking feature works, allowing users to access the admin area directly via URL (e.g., `http://localhost:8081/admin`).

## Features Implemented

### 1. **Admin Login Screen**
- Dedicated admin login page with enhanced security
- Checks existing authentication on mount
- Validates that the logged-in user is actually an admin
- Auto-redirects to dashboard if already logged in as admin
- Beautiful gradient UI with shield icon

### 2. **Deep Linking Configuration**
- React Navigation linking setup
- Multiple URL prefix support (localhost:8081, localhost:19006, custom app scheme)
- Comprehensive route mapping for all screens
- Admin-specific routes (`/admin`, `/admin/dashboard`)

### 3. **Route Protection**
- Authentication check on dashboard load
- User type verification (admin/superadmin only)
- Auto-redirect to login if not authenticated
- Auto-redirect to home if not authorized

## File Structure

```
JobWala-main/
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js          # Updated with deep linking config
│   │
│   └── screens/
│       ├── Auth/
│       │   └── AdminLoginScreen.js  # New admin login screen
│       │
│       └── Dashboard/
│           └── AdminDashboardScreen.js  # Updated with route protection
│
└── ADMIN_DEEP_LINKING_GUIDE.md      # This file
```

## URL Routes

### Admin Routes
- `/admin` → AdminLoginScreen
- `/admin/dashboard` → AdminDashboardScreen (protected)

### Company Routes
- `/company/dashboard` → CompanyDashboardScreen
- `/company/register` → CompanyRegisterScreen

### Consultancy Routes
- `/consultancy/dashboard` → ConsultancyDashboardScreen
- `/consultancy/register` → ConsultancyRegisterScreen

### User Routes
- `/dashboard` → UserDashboardScreen
- `/login` → LoginScreen
- `/register` → RegisterScreen

### Job Routes
- `/jobs` → JobsScreen
- `/jobs/:id` → JobDetailsScreen
- `/post-job` → PostJobScreen

### Other Routes
- `/` → HomeScreen
- `/companies` → CompaniesScreen
- `/companies/:id` → CompanyDetailsScreen
- `/services` → ServicesScreen
- `/blogs` → BlogsScreen
- `/blogs/:slug` → BlogDetailScreen
- `/social-updates` → SocialUpdatesScreen
- `/create-post` → CreateSocialPostScreen
- `/packages` → PackagesScreen

## How It Works

### 1. User Navigates to `/admin`

```
User enters: http://localhost:8081/admin
    ↓
React Navigation matches URL
    ↓
Routes to AdminLoginScreen
    ↓
AdminLoginScreen checks existing auth
    ↓
┌─────────────────────────┬──────────────────────────┐
│ Already logged in       │ Not logged in or         │
│ as admin?               │ not admin?               │
│                         │                          │
│ ✓ Redirect to           │ ✗ Show login form        │
│   AdminDashboard        │                          │
└─────────────────────────┴──────────────────────────┘
```

### 2. User Logs In

```
User fills login form
    ↓
Validates credentials
    ↓
Checks user type
    ↓
┌─────────────────────────┬──────────────────────────┐
│ User type is            │ User type is NOT         │
│ admin/superadmin?       │ admin/superadmin?        │
│                         │                          │
│ ✓ Login successful      │ ✗ Show error             │
│   Redirect to           │   "Not an admin account" │
│   AdminDashboard        │   Logout automatically   │
└─────────────────────────┴──────────────────────────┘
```

### 3. User Tries to Access `/admin/dashboard` Directly

```
User enters: http://localhost:8081/admin/dashboard
    ↓
React Navigation matches URL
    ↓
Routes to AdminDashboardScreen
    ↓
AdminDashboardScreen runs checkAuthAndLoadData()
    ↓
Checks if user is logged in
    ↓
┌──────────────────┬───────────────────┬──────────────────┐
│ Not logged in    │ Logged in but     │ Logged in and    │
│                  │ not admin         │ is admin         │
│                  │                   │                  │
│ ✗ Redirect to    │ ✗ Show error      │ ✓ Load dashboard │
│   AdminLogin     │   Redirect to     │   data           │
│                  │   Home            │                  │
└──────────────────┴───────────────────┴──────────────────┘
```

## Code Implementation

### AdminLoginScreen.js

Key features:
```javascript
// Check existing authentication on mount
useEffect(() => {
  checkExistingAuth();
}, []);

const checkExistingAuth = async () => {
  const user = await api.getCurrentUserFromStorage();
  if (user && (user.userType === 'admin' || user.userType === 'superadmin')) {
    // Already logged in as admin
    navigation.replace('AdminDashboard');
  }
};

// Login with admin validation
const handleLogin = async () => {
  const response = await api.login({
    loginId: loginId.trim(),
    password: password.trim(),
    userType: 'admin',
  });

  if (response.user.userType === 'admin' || response.user.userType === 'superadmin') {
    // Valid admin account
    navigation.replace('AdminDashboard');
  } else {
    // Not an admin account
    await api.logout();
    Alert.alert('Access Denied', 'This is not an admin account.');
  }
};
```

### AppNavigator.js

Deep linking configuration:
```javascript
const linking = {
  prefixes: [
    'http://localhost:8081',
    'http://localhost:19006', 
    'jobwala://'
  ],
  config: {
    screens: {
      Home: '',
      AdminLogin: 'admin',
      AdminDashboard: 'admin/dashboard',
      // ... other routes
    },
  },
};

<NavigationContainer linking={linking}>
  {/* Stack Navigator */}
</NavigationContainer>
```

### AdminDashboardScreen.js

Route protection:
```javascript
useEffect(() => {
  checkAuthAndLoadData();
}, []);

const checkAuthAndLoadData = async () => {
  const userData = await api.getCurrentUserFromStorage();
  
  if (!userData) {
    // Not logged in
    Alert.alert(
      'Authentication Required',
      'Please login to access the admin dashboard.',
      [{ text: 'OK', onPress: () => navigation.replace('AdminLogin') }]
    );
    return;
  }

  if (userData.userType !== 'admin' && userData.userType !== 'superadmin') {
    // Not authorized
    Alert.alert(
      'Access Denied',
      'You do not have permission to access the admin dashboard.',
      [{ text: 'OK', onPress: () => navigation.replace('Home') }]
    );
    return;
  }

  // Authorized - load dashboard
  setUser(userData);
  await loadDashboardData();
};
```

## Security Features

### 1. **Authentication Check**
- Every protected route checks if user is logged in
- Uses AsyncStorage to verify token existence
- Redirects to login if not authenticated

### 2. **Authorization Check**
- Verifies user type matches required permission
- Admins can only access admin routes
- Companies can only access company routes
- Consultancies can only access consultancy routes

### 3. **Automatic Logout**
- If non-admin tries to login via admin page
- System automatically logs them out
- Prevents unauthorized access

### 4. **Session Validation**
- Checks authentication on every dashboard load
- Handles expired tokens gracefully
- Redirects to appropriate login page

## Testing the Feature

### Test Case 1: Direct URL Access (Not Logged In)

1. **Open browser/app**
2. **Navigate to**: `http://localhost:8081/admin`
3. **Expected**: AdminLoginScreen appears
4. **Try**: `http://localhost:8081/admin/dashboard`
5. **Expected**: Redirected to AdminLoginScreen with alert

### Test Case 2: Admin Login Flow

1. **Navigate to**: `http://localhost:8081/admin`
2. **Enter**: Valid admin credentials
3. **Click**: Sign In
4. **Expected**: Redirected to AdminDashboard
5. **Verify**: Dashboard shows admin stats

### Test Case 3: Non-Admin Account

1. **Navigate to**: `http://localhost:8081/admin`
2. **Enter**: Company/Consultancy/User credentials
3. **Click**: Sign In
4. **Expected**: Error message "Not an admin account"
5. **Verify**: Automatically logged out

### Test Case 4: Already Logged In

1. **Login** as admin via AdminLoginScreen
2. **Navigate to**: `http://localhost:8081/admin` (in new tab/reload)
3. **Expected**: Automatically redirected to AdminDashboard
4. **Verify**: No login form shown

### Test Case 5: Session Persistence

1. **Login** as admin
2. **Close** browser/app
3. **Reopen** browser/app
4. **Navigate to**: `http://localhost:8081/admin`
5. **Expected**: Redirected to AdminDashboard (if token valid)

### Test Case 6: Unauthorized Access

1. **Login** as regular user/company
2. **Try to access**: `http://localhost:8081/admin/dashboard`
3. **Expected**: Alert "Access Denied" → Redirected to Home

## URL Schemes Supported

### Development URLs
- `http://localhost:8081/*` (Expo web)
- `http://localhost:19006/*` (Expo alternative port)

### Production URL
- `https://yourdomain.com/*` (Add to prefixes when deploying)

### Deep Link Scheme
- `jobwala://*` (For mobile apps)

## Adding New Protected Routes

To add a new protected route:

1. **Add route to linking config** in `AppNavigator.js`:
```javascript
config: {
  screens: {
    // ... existing routes
    NewProtectedScreen: 'new-route',
  },
}
```

2. **Add authentication check** in the screen:
```javascript
useEffect(() => {
  checkAuth();
}, []);

const checkAuth = async () => {
  const user = await api.getCurrentUserFromStorage();
  if (!user) {
    navigation.replace('Login');
    return;
  }
  // Add authorization checks as needed
};
```

3. **Add screen to Stack Navigator**:
```javascript
<Stack.Screen 
  name="NewProtectedScreen" 
  component={NewProtectedScreen}
  options={{ title: 'New Protected Screen' }}
/>
```

## Common Issues & Solutions

### Issue 1: Deep links not working on web

**Solution**: Make sure you're accessing via the correct port:
- Expo web usually runs on port 19006
- Metro bundler on port 8081
- Check your `linking.prefixes` array includes the port you're using

### Issue 2: Infinite redirect loop

**Solution**: Check that your authentication check doesn't cause unnecessary re-renders:
- Use `useEffect` with empty dependency array `[]`
- Use `navigation.replace()` instead of `navigation.navigate()`
- Ensure loading state is managed properly

### Issue 3: Routes not matching

**Solution**: Verify route names match exactly:
- Screen name in Stack.Navigator
- Route name in linking config
- Navigation calls throughout the app

### Issue 4: Mobile deep links not working

**Solution**: For mobile apps:
- Configure `app.json` with deep link scheme
- Test with `npx uri-scheme open jobwala://admin --ios`
- Check iOS Universal Links / Android App Links setup

## Production Deployment

### Web Deployment

1. **Update linking prefixes** with production URL:
```javascript
prefixes: [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
]
```

2. **Configure web server** to handle client-side routing:
- Apache: Use `.htaccess` with RewriteRule
- Nginx: Configure try_files directive
- Netlify/Vercel: Add `_redirects` or `vercel.json`

### Mobile Deployment

1. **Configure app.json**:
```json
{
  "expo": {
    "scheme": "jobwala",
    "ios": {
      "associatedDomains": ["applinks:yourdomain.com"]
    },
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "data": {
          "scheme": "https",
          "host": "yourdomain.com"
        }
      }]
    }
  }
}
```

2. **Test deep links**:
```bash
# iOS
npx uri-scheme open jobwala://admin --ios

# Android
adb shell am start -W -a android.intent.action.VIEW -d "jobwala://admin"
```

## Conclusion

The admin deep linking feature provides:
- ✅ Direct URL access to admin area
- ✅ Automatic authentication checking
- ✅ Secure route protection
- ✅ Beautiful dedicated admin login screen
- ✅ Seamless user experience
- ✅ Support for multiple URL schemes
- ✅ Easy to extend for new routes

All routes are properly protected and validated, ensuring only authorized users can access admin features.

