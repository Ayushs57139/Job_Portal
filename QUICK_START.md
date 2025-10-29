# JobWala - Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas account)
- Git
- Expo CLI: `npm install -g expo-cli`

## Quick Setup (5 Minutes)

### Step 1: Clone and Install

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd JobWala-main

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Backend

Create `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
NODE_ENV=development
```

**Note**: The MongoDB URI is already configured in the code, but you can override it with your own.

### Step 3: Start Backend

```bash
cd server
npm start
```

You should see:
```
Server running on port 5000
MongoDB Atlas connected successfully
```

### Step 4: Start Frontend (New Terminal)

```bash
# From project root
npm start
```

Then choose:
- Press `w` for web browser
- Press `a` for Android emulator
- Press `i` for iOS simulator

## Testing the Integration

### 1. Register a New User

**Job Seeker:**
1. Open the app
2. Navigate to Register
3. Select "Job Seeker"
4. Fill in details:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: password123
   - Phone: +1234567890
5. Click Register
6. Should redirect to User Dashboard

**Company:**
1. Navigate to Register
2. Select "Employer"
3. Select "Company"
4. Fill in details:
   - Name: Tech Corp
   - Email: admin@techcorp.com
   - Password: password123
   - Company Name: Tech Corp
   - Website: https://techcorp.com
5. Click Register
6. Should redirect to Company Dashboard

### 2. Login with Existing User

1. Navigate to Login
2. Select user type (Job Seeker, Employer, or Admin)
3. Enter credentials:
   - Login ID: email, user ID (JW12345678), or phone
   - Password: your password
4. Click Sign In
5. Should redirect to appropriate dashboard

### 3. Test Dashboard Features

**Job Seeker Dashboard:**
- View application count
- View saved jobs
- Browse jobs
- Access profile

**Company Dashboard:**
- View active jobs
- View applications received
- Post new job
- Manage company profile

**Consultancy Dashboard:**
- View active jobs
- View clients served
- Post new job
- Manage applications

**Admin Dashboard:**
- View total users
- View total jobs
- Manage users
- Approve/reject jobs

## Default Admin Account

To create an admin account, run:
```bash
cd server
node create-super-admin.js
```

Follow the prompts to create your admin account.

## API Testing

### Using Browser (for GET requests)
```
http://localhost:5000/api/health
http://localhost:5000/api/packages
http://localhost:5000/api/jobs
```

### Using Postman/Thunder Client

**Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "loginId": "user@example.com",
  "password": "password123",
  "userType": "jobseeker"
}
```

**Get Jobs:**
```
GET http://localhost:5000/api/jobs?location=New%20York
```

**Create Job (Employer):**
```
POST http://localhost:5000/api/jobs
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Software Engineer",
  "description": "We are looking for...",
  "location": {
    "city": "New York",
    "state": "NY"
  },
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "jobType": "full-time",
  "workMode": "remote"
}
```

## Common Commands

### Backend
```bash
cd server

# Start server
npm start

# Create admin user
node create-super-admin.js

# Seed database with sample data
node seed-all-data.js

# Run specific seeder
node seed-jobs.js
```

### Frontend
```bash
# Start development server
npm start

# Start on specific platform
npm run web
npm run android
npm run ios

# Clear cache and restart
npm start -- --clear
```

## Troubleshooting

### Backend won't start
1. Check if MongoDB is running
2. Verify .env file exists and has correct values
3. Check if port 5000 is available
4. Run: `npm install` in server directory

### Frontend won't connect to backend
1. Verify backend is running on port 5000
2. For Android emulator, check API URL is `http://10.0.2.2:5000/api`
3. Check console for error messages
4. Clear AsyncStorage: `AsyncStorage.clear()`

### Login fails
1. Verify user exists in database
2. Check userType matches account type
3. For employers, verify employerType is correct
4. Check password is correct
5. Verify JWT_SECRET is set in backend .env

### Dashboard shows no data
1. Check if token is saved in AsyncStorage
2. Verify API calls in network tab
3. Check backend console for errors
4. Ensure user is authenticated

## Database Seeding

To populate your database with sample data:

```bash
cd server

# Seed all master data
node seed-all-data.js

# Seed specific data
node seed-jobs.js          # Sample jobs
node seed-skills.js        # Skills
node seed-industries.js    # Industries
node seed-packages.js      # Packages
```

## Next Steps

After successful setup:

1. ✅ Explore the User Dashboard
2. ✅ Browse and search jobs
3. ✅ Apply for jobs (as Job Seeker)
4. ✅ Post jobs (as Company/Consultancy)
5. ✅ Manage applications (as Employer)
6. ✅ Admin panel features

## Production Deployment

### Backend (Node.js)
- Deploy to Heroku, AWS, or DigitalOcean
- Set environment variables
- Update CORS settings for production domain
- Use production MongoDB cluster

### Frontend (React Native/Expo)
- For web: `expo build:web`
- For mobile: Use EAS Build
- Update API URL to production backend
- Configure app.json for stores

## Support

If you encounter issues:
1. Check `BACKEND_FRONTEND_INTEGRATION.md` for detailed API docs
2. Review console logs
3. Check network requests in browser DevTools
4. Verify all environment variables

## Features Available

✅ User Authentication (All user types)
✅ Job Seeker Dashboard with stats
✅ Company Dashboard with analytics
✅ Consultancy Dashboard
✅ Admin Dashboard with system overview
✅ Job browsing and search
✅ Job application system
✅ Saved jobs functionality
✅ Profile management
✅ Real-time data refresh
✅ Logout functionality
✅ Error handling

## Demo Credentials

Create your own accounts using the registration flow, or use the admin creation script for admin access.

Happy coding! 🚀

