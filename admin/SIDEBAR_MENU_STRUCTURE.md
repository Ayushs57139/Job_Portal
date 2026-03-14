# Admin Sidebar Menu - Updated Structure

## 📋 Current Menu Structure

```
Free job wala
Admin Panel
─────────────────────────────────────

📊 Dashboard
👥 Users                    ← Companies & Consultancies are here!
   ├─ All Users
   ├─ Job Seekers
   ├─ Companies           ← Tab inside Users
   └─ Consultancies       ← Tab inside Users

🛡️ Role Management
💼 Jobs
➕ Post Job
📅 Job Events
📄 Applications
👨‍👩‍👧‍👦 Team Limits
📰 Blogs
✓ Verification
💳 KYC Management
✉️ Sales Enquiry
💬 Freejobwala Chat
🏠 Homepage
📊 Analytics
🔍 Resume Search
📋 Resume Management
👤 Candidate Search (Fastdex)
🔔 Job Alerts
📦 Package Management
💰 Razorpay Integration
📢 Advertisement Management
💬 Live Chat Support
⚙️ Settings
🖼️ Logo Management
📧 Email Templates
🖥️ SMTP Settings
📜 Email Logs
🔒 Login Security
📱 Social Updates
📚 Master Data Management
   ├─ Job Titles
   ├─ Key Skills
   ├─ Industries
   ├─ Sub-Industries
   ├─ Departments
   ├─ Sub-Departments
   ├─ Courses
   ├─ Specializations
   ├─ Education Fields
   └─ Locations
```

## 🎯 Users Screen Layout

When you click "Users" in the sidebar, you see:

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Management                           │
│                    Manage all registered users                   │
│                                                                   │
│  [Add User] [Sample CSV] [Import CSV] [Export CSV]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ All Users│ │Job Seekers│ │Companies │ │Consultancies│       │
│  │   250    │ │   150     │ │    75    │ │    25    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Statistics Cards (changes based on active tab)                  │
│                                                                   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Total │ │Active│ │Pending│ │Blocked│ │Verified│ │More...│    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🔍 Search by name, email, or contact person...                 │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User Table (filtered by active tab)                             │
│                                                                   │
│  ☐ Name          Email         Role      Status    Actions      │
│  ☐ Tech Corp     tech@...      EMPLOYER  Active    👁 ✏ ✓ 🗑   │
│  ☐ John Doe      john@...      JOBSEEKER Active    👁 ✏ ✓ 🗑   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Tab-Based Filtering

### All Users Tab (Default)
Shows everyone:
- Job Seekers
- Companies  
- Consultancies

**Statistics:**
- All Employers
- Active Employers
- Pending Employers
- Total Companies
- Total Consultancies
- And more...

### Job Seekers Tab
Shows only job seekers

**Statistics:**
- All Candidates
- Active Candidates
- Pending Candidates
- Blocked Candidates
- Excel Imported
- Job Applied
- Direct Registered
- Event Job Applied

### Companies Tab
Shows only companies (employers with type='company')

**Statistics:**
- Total Companies
- Active Companies
- Pending Companies
- Blocked Companies

### Consultancies Tab
Shows only consultancies (employers with type='consultancy')

**Statistics:**
- Total Consultancies
- Active Consultancies
- Pending Consultancies
- Blocked Consultancies

## 🔄 User Flow Examples

### Example 1: Managing Companies
```
1. Click "Users" in sidebar
2. Click "Companies" tab
3. See company statistics
4. Search/filter companies
5. Click eye icon to view details
6. Click edit icon to modify
7. Use bulk actions if needed
```

### Example 2: Managing Consultancies
```
1. Click "Users" in sidebar
2. Click "Consultancies" tab
3. See consultancy statistics
4. Search/filter consultancies
5. Click eye icon to view details
6. Click edit icon to modify
7. Use bulk actions if needed
```

### Example 3: Managing Job Seekers
```
1. Click "Users" in sidebar
2. Click "Job Seekers" tab
3. See job seeker statistics
4. Search/filter candidates
5. Click eye icon to view details
6. Download resume if available
7. Use bulk actions if needed
```

### Example 4: Viewing All Users
```
1. Click "Users" in sidebar
2. Stay on "All Users" tab (default)
3. See combined statistics
4. Search across all user types
5. Filter by role if needed
6. Manage any user type
```

## 🎨 Visual Hierarchy

```
Sidebar Menu
    │
    ├─ Dashboard
    │
    ├─ Users ◄─── YOU ARE HERE
    │   │
    │   ├─ Tab: All Users
    │   │   └─ Shows: Job Seekers + Companies + Consultancies
    │   │
    │   ├─ Tab: Job Seekers
    │   │   └─ Shows: Only Job Seekers
    │   │
    │   ├─ Tab: Companies
    │   │   └─ Shows: Only Companies
    │   │
    │   └─ Tab: Consultancies
    │       └─ Shows: Only Consultancies
    │
    ├─ Role Management
    │
    └─ ... (other menu items)
```

## 💡 Key Benefits

### Before (Separate Menu Items)
```
Sidebar:
├─ Users
├─ Companies        ← Separate menu item
├─ Consultancies    ← Separate menu item
└─ ...

Problems:
- More clicks to switch between user types
- Cluttered sidebar
- Harder to compare user types
- Inconsistent navigation
```

### After (Integrated Tabs)
```
Sidebar:
├─ Users
│  ├─ All Users
│  ├─ Job Seekers
│  ├─ Companies      ← Tab inside Users
│  └─ Consultancies  ← Tab inside Users
└─ ...

Benefits:
✅ Single click to access Users
✅ Easy tab switching
✅ Cleaner sidebar
✅ Unified interface
✅ Better UX
```

## 🚀 Quick Actions

### From Any Tab
- **Search**: Type in search box
- **Filter**: Click statistics cards
- **Bulk Select**: Use checkboxes
- **Bulk Actions**: Select multiple → Bulk Actions button
- **Export**: Click Export CSV
- **Import**: Click Import CSV
- **Add User**: Click Add User button

### Per User Actions
- **View**: 👁 Eye icon
- **Edit**: ✏️ Edit icon
- **Verify**: ✓ Checkmark icon (if unverified)
- **Toggle Status**: 🚫/✓ Ban/Check icon
- **Delete**: 🗑️ Trash icon
- **Login As**: 🔑 Login icon (if available)

## 📱 Responsive Design

### Mobile View
```
┌─────────────────┐
│ ☰ Menu          │
├─────────────────┤
│ User Management │
│                 │
│ [Actions...]    │
│                 │
│ Tabs (scroll)   │
│ ◄ [All][Jobs]► │
│                 │
│ Stats (scroll)  │
│ ◄ [Card][Card]►│
│                 │
│ Search          │
│ 🔍 Search...    │
│                 │
│ Users List      │
│ (scrollable)    │
└─────────────────┘
```

### Desktop View
```
┌──────────┬────────────────────────────────────────┐
│          │ User Management                         │
│ Sidebar  │                                         │
│          │ [Actions Row]                           │
│ ├─Users  │                                         │
│ ├─Jobs   │ [All] [Job Seekers] [Companies] [...]  │
│ ├─...    │                                         │
│          │ [Stats Cards Row]                       │
│          │                                         │
│          │ [Search Bar]                            │
│          │                                         │
│          │ [Users Table]                           │
│          │                                         │
└──────────┴────────────────────────────────────────┘
```

## ✅ Summary

**Old Structure:**
- Users (separate)
- Companies (separate)
- Consultancies (separate)

**New Structure:**
- Users
  - All Users tab
  - Job Seekers tab
  - Companies tab
  - Consultancies tab

**Result:** Cleaner, more intuitive, unified user management! 🎉
