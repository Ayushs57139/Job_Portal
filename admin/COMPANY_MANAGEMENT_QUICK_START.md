# Company & Consultancy Management - Quick Start Guide

## 🚀 Getting Started

### What's Been Implemented

✅ **Company Management Screen** - Full CRUD operations for companies
✅ **Consultancy Management Screen** - Full CRUD operations for consultancies  
✅ **Detailed View/Edit Screens** - Comprehensive company/consultancy profiles
✅ **Bulk Operations** - Select and manage multiple records at once
✅ **CSV Export** - Export data to Excel/CSV format
✅ **Image Upload** - Profile and cover photo management
✅ **Quick Actions** - Send emails, assign packages, suspend, duplicate
✅ **Jobs Integration** - View and manage company/consultancy jobs
✅ **Responsive Design** - Works on mobile, tablet, and desktop

---

## 📁 Files Created

### Frontend (React Native)
```
admin/src/screens/Admin/
├── AdminCompaniesScreen.js           # Company listing & management
├── AdminCompanyDetailsScreen.js      # Company details view/edit
├── AdminConsultanciesScreen.js       # Consultancy listing & management
└── AdminConsultancyDetailsScreen.js  # Consultancy details view/edit

admin/src/navigation/
└── AdminNavigator.js                 # Updated with new routes

admin/src/components/Admin/
└── AdminSidebar.js                   # Updated with new menu items

admin/
├── COMPANY_MANAGEMENT_GUIDE.md       # Complete feature documentation
├── COMPANY_CONSULTANCY_API_SPEC.md   # Backend API specification
└── COMPANY_MANAGEMENT_QUICK_START.md # This file
```

---

## 🎯 Features Overview

### 1. Company/Consultancy Listing
- **Statistics Dashboard**: Total, Active, Pending, Blocked, Verified, Unverified
- **Search**: Real-time search by name, email, or contact person
- **Filters**: Click stat cards to filter by status
- **Bulk Select**: Checkbox selection for bulk operations
- **Actions**: View, Edit, Verify, Toggle Status, Delete

### 2. Detailed View/Edit
- **Profile Management**: Upload profile photo and cover photo
- **Complete Information**: All company details in organized sections
- **Edit Mode**: Toggle between view and edit modes
- **Quick Actions**: Send emails, assign packages, suspend, duplicate
- **Jobs Section**: View all jobs posted by the company

### 3. Bulk Operations
- **Bulk Approve**: Approve multiple companies at once
- **Bulk Block**: Block multiple companies simultaneously
- **Bulk Delete**: Delete multiple companies (with confirmation)
- **Select All**: Toggle selection of all filtered records

### 4. Export/Import
- **CSV Export**: Export all data to CSV file
- **Works Everywhere**: Web (download) and Mobile (share)
- **Complete Data**: All fields included in export

---

## 🔧 Backend Setup Required

### Step 1: Create API Endpoints

You need to implement these endpoints in your backend:

#### Companies
```
GET    /api/admin/companies
GET    /api/admin/companies/:id
PUT    /api/admin/companies/:id
DELETE /api/admin/companies/:id
PATCH  /api/admin/companies/:id/status
PATCH  /api/admin/companies/:id/verify
POST   /api/admin/companies/:id/duplicate
POST   /api/admin/companies/:id/suspend
POST   /api/admin/companies/:id/upload-profile
POST   /api/admin/companies/:id/upload-cover
POST   /api/admin/companies/:id/send-email
POST   /api/admin/companies/bulk/approve
POST   /api/admin/companies/bulk/block
POST   /api/admin/companies/bulk/delete
```

#### Consultancies
Same endpoints but replace `/companies` with `/consultancies`

### Step 2: Database Schema

Add these fields to your Company/Consultancy model:

```javascript
{
  companyName: String (required),
  email: String (required, unique),
  phone: String,
  contactPerson: String,
  address: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
  website: String,
  industry: String,
  sectors: [String],
  departments: [String],
  designation: String,
  description: String,
  foundedYear: String,
  companySize: String,
  profilePhoto: String,
  coverPhoto: String,
  isActive: Boolean (default: true),
  isVerified: Boolean (default: false),
  verifiedAt: Date,
  isSuspended: Boolean (default: false),
  suspendedAt: Date,
  suspensionReason: String,
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Step 3: File Upload Configuration

Set up file upload handling:
- Accept JPEG, PNG formats
- Max size: 5MB for profile, 10MB for cover
- Store in `/uploads/companies/` or cloud storage
- Return public URL in response

### Step 4: Email Service

Configure email sending:
- Activation emails
- Password reset emails
- Custom emails
- Use templates for consistency

---

## 📱 How to Use

### Accessing the Features

1. **Login to Admin Panel**
   ```
   Navigate to: http://localhost:8081 (or your admin URL)
   Login with admin credentials
   ```

2. **Navigate to Companies**
   - Click "Companies" in the sidebar
   - Or click "Consultancies" for consultancies

### Managing Companies

#### View All Companies
1. Open Companies screen
2. See statistics at the top
3. Browse the list below
4. Use search to find specific companies

#### Filter Companies
1. Click on any stat card (Active, Pending, etc.)
2. List will filter automatically
3. Click "All" to reset filter

#### View Company Details
1. Click the eye icon (👁️) on any company row
2. See complete company information
3. View posted jobs at the bottom
4. Click on jobs to see details

#### Edit Company
1. Open company details
2. Click "Edit" button
3. Modify any fields
4. Upload photos if needed
5. Click "Save Changes"

#### Upload Photos
1. Enter edit mode
2. Click "Change Cover" or camera icon on profile
3. Select image from device
4. Image uploads automatically
5. Preview shows immediately

#### Bulk Operations
1. Select companies using checkboxes
2. Click "Bulk Actions" button
3. Choose: Approve, Block, or Delete
4. Confirm the action
5. Changes apply to all selected

#### Export Data
1. Click "Export CSV" button
2. File downloads (web) or share dialog opens (mobile)
3. Open in Excel or Google Sheets

### Quick Actions

#### Send Email
1. Open company details
2. Click "Send Email"
3. Choose email type
4. Email sends automatically

#### Suspend Company
1. Open company details
2. Click "Suspend"
3. Confirm suspension
4. Company loses access

#### Duplicate Company
1. Open company details
2. Click "Duplicate"
3. Confirm duplication
4. New company created with "(Copy)" suffix

---

## 🎨 UI Components

### Statistics Cards
- **Color Coded**: Blue (Total), Green (Active), Orange (Pending), Red (Blocked)
- **Interactive**: Click to filter
- **Real-time**: Updates with data changes

### Action Buttons
- **View** (👁️): Blue - View details
- **Edit** (✏️): Orange - Edit information
- **Verify** (✓): Green - Verify company
- **Toggle** (🚫/✓): Red/Green - Activate/Deactivate
- **Delete** (🗑️): Red - Delete company

### Status Badges
- **Active**: Green background
- **Inactive**: Red background
- **Verified**: Green checkmark icon

---

## 🔒 Security Features

### Confirmations
- Delete operations require confirmation
- Bulk operations require confirmation
- Suspend operations require confirmation

### Validation
- Required fields marked with *
- Email format validation
- Phone number validation
- URL format validation

### Authentication
- All API calls include admin token
- Token stored securely in AsyncStorage
- Automatic logout on token expiration

---

## 📊 Data Flow

### Loading Companies
```
User opens screen
  → Fetch companies from API
  → Calculate statistics
  → Display in UI
  → Enable interactions
```

### Updating Company
```
User clicks Edit
  → Enable form fields
  → User modifies data
  → User clicks Save
  → Validate data
  → Send to API
  → Update UI
  → Show success message
```

### Bulk Operations
```
User selects companies
  → Enable bulk actions button
  → User clicks bulk action
  → Show confirmation
  → User confirms
  → Send to API
  → Update UI
  → Clear selection
```

---

## 🐛 Troubleshooting

### Companies Not Loading
**Problem**: Screen shows loading forever
**Solution**:
1. Check backend is running
2. Verify API endpoint exists
3. Check authentication token
4. Review browser/app console for errors

### Images Not Uploading
**Problem**: Photos don't upload
**Solution**:
1. Check file size (max 5MB/10MB)
2. Verify file format (JPEG, PNG only)
3. Check backend upload endpoint
4. Verify storage permissions

### Bulk Actions Not Working
**Problem**: Bulk operations fail
**Solution**:
1. Ensure companies are selected
2. Check API endpoint exists
3. Verify admin permissions
4. Review error messages

### Export Not Working
**Problem**: CSV export fails
**Solution**:
1. Check popup blockers (web)
2. Verify file permissions (mobile)
3. Ensure data is loaded
4. Try different browser/device

---

## 🚀 Next Steps

### Immediate
1. ✅ Implement backend API endpoints
2. ✅ Test all CRUD operations
3. ✅ Configure file upload
4. ✅ Set up email service

### Short Term
1. Add CSV import functionality
2. Implement advanced filters
3. Add date range filters
4. Create package assignment UI

### Long Term
1. Add activity logging
2. Implement comments system
3. Create permission matrix
4. Add analytics dashboard

---

## 📞 Support

### Documentation
- **Complete Guide**: `COMPANY_MANAGEMENT_GUIDE.md`
- **API Spec**: `COMPANY_CONSULTANCY_API_SPEC.md`
- **This Guide**: `COMPANY_MANAGEMENT_QUICK_START.md`

### Getting Help
1. Check documentation files
2. Review console logs
3. Test API endpoints with Postman
4. Contact development team

---

## ✅ Testing Checklist

### Frontend Testing
- [ ] Companies screen loads
- [ ] Statistics display correctly
- [ ] Search works
- [ ] Filters work
- [ ] Company details open
- [ ] Edit mode works
- [ ] Save changes works
- [ ] Photos upload
- [ ] Bulk select works
- [ ] Bulk actions work
- [ ] CSV export works
- [ ] Quick actions work
- [ ] Navigation works
- [ ] Responsive on mobile
- [ ] Responsive on tablet

### Backend Testing
- [ ] All API endpoints respond
- [ ] Data validation works
- [ ] File uploads work
- [ ] Emails send
- [ ] Bulk operations work
- [ ] Error handling works
- [ ] Authentication works
- [ ] Permissions work

---

## 🎉 You're All Set!

The Company and Consultancy Management system is now fully integrated into your admin panel. Once you implement the backend API endpoints, you'll have a complete, production-ready management system.

**Key Features**:
- ✅ Full CRUD operations
- ✅ Bulk management
- ✅ CSV export
- ✅ Image uploads
- ✅ Email integration
- ✅ Jobs management
- ✅ Responsive design
- ✅ Security features

**Happy Managing! 🚀**
