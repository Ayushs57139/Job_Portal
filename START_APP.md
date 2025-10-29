# How to Start JobWala Application

## 🚀 Quick Start Commands

### Option 1: Start Both Backend and Frontend

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm start
```

Then press:
- `w` for web browser
- `a` for Android
- `i` for iOS

---

## 🔧 First Time Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=jobwala-super-secret-key-2025
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Create Admin Account (Optional)

```bash
cd server
node create-super-admin.js
```

Follow prompts to create admin user.

---

## 📱 Access the Application

After starting, access:
- **Web**: http://localhost:19006 (opens automatically)
- **Android**: Use Android emulator or physical device
- **iOS**: Use iOS simulator (Mac only)

---

## 🎯 Test Login

### Job Seeker
1. Register → Select "Job Seeker"
2. Fill details and register
3. Login → Select "Job Seeker"
4. Access User Dashboard

### Company
1. Register → Select "Employer" → "Company"
2. Fill company details
3. Login → Select "Employer" → "Company"
4. Access Company Dashboard

### Consultancy
1. Register → Select "Employer" → "Consultancy"
2. Fill consultancy details
3. Login → Select "Employer" → "Consultancy"
4. Access Consultancy Dashboard

### Admin
1. Create admin using script above
2. Login → Select "Admin"
3. Enter admin credentials
4. Access Admin Dashboard

---

## 🔍 Verify Backend is Running

Open browser: http://localhost:5000/api/health

Should see: `{"status":"OK","message":"Server is running"}`

---

## 📊 Check Available Data

### Get Jobs
http://localhost:5000/api/jobs

### Get Packages
http://localhost:5000/api/packages

---

## 🛠️ Troubleshooting

### Backend Won't Start
```bash
cd server
rm -rf node_modules
npm install
npm start
```

### Frontend Won't Start
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

### Can't Connect to Backend
1. Verify backend is running: http://localhost:5000/api/health
2. Check port 5000 is not in use
3. For Android, ensure API URL is `http://10.0.2.2:5000/api`

### Login Fails
1. Check userType matches account
2. For employers, verify employerType (company/consultancy)
3. Ensure backend is running
4. Check credentials are correct

---

## 📱 Platform-Specific Commands

### Web Development
```bash
npm run web
```

### Android Development
```bash
npm run android
```

### iOS Development (Mac only)
```bash
npm run ios
```

---

## 🧹 Clean Start

If you encounter issues, try a clean start:

```bash
# Clear all caches and reinstall
npm start -- --clear

# Or manually:
rm -rf node_modules
npm install
npm start
```

---

## 📚 Documentation

- `QUICK_START.md` - Detailed setup guide
- `BACKEND_FRONTEND_INTEGRATION.md` - Complete API documentation
- `INTEGRATION_SUMMARY.md` - What's been integrated

---

## ✅ Checklist

Before starting, ensure:
- [ ] Node.js installed (v14+)
- [ ] npm or yarn installed
- [ ] MongoDB connection configured
- [ ] Dependencies installed
- [ ] Backend running on port 5000
- [ ] Frontend started successfully

---

## 🎉 You're Ready!

Once both servers are running:
1. Open the app (web/mobile)
2. Register or login
3. Access your dashboard
4. Start using JobWala!

**Happy coding! 🚀**

