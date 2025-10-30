# Master Data - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Prerequisites
- Server is running: `cd server && npm start`
- You have admin credentials

### Step 1: Seed the Database (1 minute)

**Using Postman or any API client:**

```
POST http://localhost:5000/api/admin/seed-master-data
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
  Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Master data seeded successfully!",
  "data": {
    "jobTitles": 480,
    "keySkills": 1000+,
    "industries": 48,
    "departments": 50,
    "courses": 10,
    "specializations": 8,
    "educationFields": 9,
    "locations": 20
  }
}
```

### Step 2: View in Admin Panel (1 minute)

1. Login to admin panel
2. Click on **"Master Data"** in sidebar
3. Click on any category (e.g., "Job Titles")
4. You'll see all the seeded data!

### Step 3: Test Add/Edit/Delete (2 minutes)

1. Click the **"+"** button to add a new item
2. Enter a name (e.g., "React Native Developer")
3. Click **Save**
4. ✅ Item added successfully!
5. Try editing and deleting to test all features

### Step 4: Verify Backend API (1 minute)

Test the API directly:
```
GET http://localhost:5000/api/admin/master-data/job-titles
```

You should see your data in the response!

## 📋 What You Get

After seeding, your master data will contain:

### Job Titles (480 items)
`Fresher, Software Developer, HR Manager, Data Scientist, Sales Executive, ...`

### Key Skills (1000+ items)
`JavaScript, Python, Communication, Leadership, React.js, Node.js, ...`

### Industries (48 items)
`Information Technology (IT), BFSI, Healthcare, Manufacturing, Education, ...`

### Departments (50 items)
`Software Engineering, Sales, Human Resources, Finance, Operations, ...`

## ✅ Verification Checklist

- [ ] Seed endpoint returns success
- [ ] Can view Job Titles in admin panel
- [ ] Can add a new Job Title
- [ ] Can edit an existing Job Title
- [ ] Can delete a Job Title
- [ ] Same for Key Skills
- [ ] Same for Industries
- [ ] Same for Departments

## 🎯 What's Dynamic

### ✅ Already Dynamic (No Code Changes Needed)
- Admin panel → Fully dynamic
- Backend APIs → Fully dynamic
- When you add/delete in admin → Immediately reflected in API

### ⚠️ Needs Update for Full Dynamism
- Job Post Form → Currently uses static data files
- To make dynamic: Follow instructions in `MASTER_DATA_COMPLETE_IMPLEMENTATION.md`

## 🔍 Where Is Everything?

**Seed Data File:**
```
server/seedData.js
```

**Seed API Endpoint:**
```
server/routes/admin.js (line ~3536)
POST /api/admin/seed-master-data
```

**Admin Screens:**
```
src/screens/Admin/MasterData/AdminJobTitlesScreen.js
src/screens/Admin/MasterData/AdminKeySkillsScreen.js
src/screens/Admin/MasterData/AdminIndustriesScreen.js
src/screens/Admin/MasterData/AdminDepartmentsScreen.js
... and more
```

**Backend API Routes:**
```
server/routes/admin.js
GET    /api/admin/master-data/job-titles
POST   /api/admin/master-data/job-titles
PUT    /api/admin/master-data/job-titles/:id
DELETE /api/admin/master-data/job-titles/:id
(Same pattern for key-skills, industries, departments, etc.)
```

## 💡 Pro Tips

1. **Run seed only once** - Running multiple times will skip duplicates
2. **Backup before testing** - Test delete functionality on non-critical data first
3. **Use search** - Master data screens have built-in search functionality
4. **Check stats** - Each screen shows total count of items

## 🆘 Need Help?

**Issue: Nothing shows in admin panel**
- Make sure you ran the seed endpoint first
- Check server console for errors
- Verify you're logged in as admin

**Issue: Can't add/edit/delete**
- Check your admin permissions (need `canManageSettings`)
- Check server console for errors
- Verify authentication token is valid

**Issue: Changes not in frontend form**
- This is expected! Frontend form uses static files
- To make dynamic, see `MASTER_DATA_COMPLETE_IMPLEMENTATION.md`

## 📞 What to Do Next?

1. ✅ Seed the database (Step 1 above)
2. ✅ Test in admin panel (Step 2-3 above)
3. ✅ Verify it works
4. 📖 Read `MASTER_DATA_COMPLETE_IMPLEMENTATION.md` for making form dynamic
5. 🎉 Enjoy your new master data system!

