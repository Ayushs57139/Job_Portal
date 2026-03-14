# Company Management System - Complete Guide

## Overview
The Company Management System provides comprehensive tools for managing companies and consultancies in the admin panel. This system includes full CRUD operations, bulk actions, advanced filtering, and detailed company profiles.

## Features Implemented

### 1. Company Listing Screen (`AdminCompaniesScreen.js`)

#### Statistics Dashboard
- **Total Companies**: Shows all registered companies
- **Active Companies**: Companies that are active and verified
- **Pending Companies**: Companies awaiting verification
- **Blocked Companies**: Companies that have been blocked
- **Verified Companies**: Companies with verified status
- **Unverified Companies**: Companies pending verification

#### Search & Filter
- **Search**: Search by company name, email, or contact person
- **Status Filters**: Filter by ALL, ACTIVE, PENDING, BLOCKED, VERIFIED, UNVERIFIED
- **Real-time Filtering**: Instant results as you type

#### Bulk Operations
- **Bulk Select**: Select multiple companies using checkboxes
- **Bulk Approve**: Approve multiple companies at once
- **Bulk Block**: Block multiple companies simultaneously
- **Bulk Delete**: Delete multiple companies (with confirmation)
- **Select All**: Toggle selection of all filtered companies

#### Export/Import
- **CSV Export**: Export all companies to CSV file
  - Includes: Company Name, Email, Contact Person, Phone, Address, City, State, Website, Industry, Status, Verified, Joined Date
  - Works on both web and mobile platforms
- **CSV Import**: Import companies from CSV file (coming soon)

#### Company Actions (Per Row)
- **View Details**: Navigate to detailed company view
- **Edit**: Navigate to edit mode
- **Verify**: Verify unverified companies
- **Toggle Status**: Activate/Deactivate company
- **Delete**: Remove company (with confirmation)

### 2. Company Details Screen (`AdminCompanyDetailsScreen.js`)

#### View/Edit Modes
- **View Mode**: Display all company information in read-only format
- **Edit Mode**: Enable editing of all company fields
- **Toggle**: Easy switch between view and edit modes
- **Save Changes**: Update company information with validation

#### Profile Management
- **Profile Photo**: Upload and manage company logo
  - Square aspect ratio (1:1)
  - Image picker integration
  - Preview before upload
- **Cover Photo**: Upload and manage company cover image
  - Widescreen aspect ratio (16:9)
  - Image picker integration
  - Preview before upload

#### Company Information Fields
- **Basic Info**:
  - Company Name (required)
  - Email (required)
  - Phone
  - Contact Person
  
- **Address Details**:
  - Full Address (multi-line)
  - City
  - State
  - Country
  - Pincode
  
- **Business Info**:
  - Website URL
  - Industry
  - Founded Year
  - Company Size
  - Description (multi-line)
  
- **Additional Fields** (extensible):
  - Sectors (array)
  - Departments (array)
  - Designation
  - Job Publish Date
  - Deadline Date
  - Expiry Date
  - Open Positions

#### Quick Actions
- **Send Email**: Send various types of emails
  - Activation Link
  - Password Reset Link
  - Custom Emails
- **Assign Package**: Assign subscription packages to company
- **Duplicate Company**: Create a copy of the company
- **Suspend Company**: Temporarily suspend company access
- **Manage Comments**: View and manage admin comments
- **Manage Permissions**: Control super user and sub-user permissions

#### Jobs Management
- **View Posted Jobs**: See all jobs posted by the company
- **Job Count**: Display total number of jobs
- **Job Cards**: Quick preview of each job
  - Job Title
  - Location
  - Status (Active/Inactive)
  - Posted Date
- **Navigate to Jobs**: Click to view full job details
- **View All Jobs**: Link to filtered jobs list for this company

#### Status Indicators
- **Active/Inactive Badge**: Visual status indicator
- **Verified Badge**: Shows verification status with checkmark icon
- **Last Active**: Display last activity timestamp
- **Joined Date**: Show registration date

### 3. Navigation Integration

#### Sidebar Menu
- New "Companies" menu item added
- Icon: business-outline
- Position: Between "Users" and "Role Management"
- Active state highlighting

#### Routes
- `/admin/companies` - Company listing
- `/admin/companies/:id` - Company details (view mode)
- `/admin/companies/:id?mode=edit` - Company details (edit mode)

## Backend API Endpoints Required

### Company Management
```
GET    /api/admin/companies                    - List all companies
GET    /api/admin/companies/:id                - Get company details
PUT    /api/admin/companies/:id                - Update company
DELETE /api/admin/companies/:id                - Delete company
PATCH  /api/admin/companies/:id/status         - Toggle active status
PATCH  /api/admin/companies/:id/verify         - Verify company
POST   /api/admin/companies/:id/duplicate      - Duplicate company
POST   /api/admin/companies/:id/suspend        - Suspend company
```

### Bulk Operations
```
POST   /api/admin/companies/bulk/approve       - Bulk approve
POST   /api/admin/companies/bulk/block         - Bulk block
POST   /api/admin/companies/bulk/delete        - Bulk delete
```

### Image Upload
```
POST   /api/admin/companies/:id/upload-profile - Upload profile photo
POST   /api/admin/companies/:id/upload-cover   - Upload cover photo
```

### Email Operations
```
POST   /api/admin/companies/:id/send-email     - Send email to company
```

### Jobs
```
GET    /api/admin/companies/:id/jobs           - Get company jobs
```

## Usage Guide

### Viewing Companies
1. Navigate to "Companies" from the sidebar
2. View statistics cards at the top
3. Use search bar to find specific companies
4. Click on stat cards to filter by status
5. Click on any company row to view details

### Editing Company Information
1. Open company details
2. Click "Edit" button in the header
3. Modify any fields as needed
4. Upload profile/cover photos if desired
5. Click "Save Changes" to update
6. Click "Cancel" to discard changes

### Bulk Operations
1. Select companies using checkboxes
2. Click "Bulk Actions" button
3. Choose action: Approve, Block, or Delete
4. Confirm the action
5. Selected companies will be updated

### Exporting Data
1. Click "Export CSV" button
2. File will download automatically (web) or share dialog will open (mobile)
3. Open in Excel, Google Sheets, or any CSV viewer

### Managing Company Jobs
1. Open company details
2. Scroll to "Posted Jobs" section
3. View job cards with quick info
4. Click on a job to view full details
5. Click "View All" to see all company jobs

### Sending Emails
1. Open company details
2. Click "Send Email" quick action
3. Select email type:
   - Activation Link
   - Password Reset
   - Custom Email
4. Email will be sent to company's registered email

### Suspending a Company
1. Open company details
2. Click "Suspend" quick action
3. Confirm suspension
4. Company will be marked as suspended
5. Company users will lose access

## Responsive Design

### Mobile (< 768px)
- Single column layout
- Stacked form fields
- Horizontal scrolling for stats cards
- Collapsible sections
- Touch-optimized buttons

### Tablet (768px - 1024px)
- Two-column form layout
- Optimized spacing
- Larger touch targets

### Desktop (> 1024px)
- Full multi-column layout
- Side-by-side form fields
- Maximum information density
- Hover effects

## Security Features

### Confirmation Dialogs
- Delete operations require confirmation
- Bulk operations require confirmation
- Suspend operations require confirmation
- Prevents accidental data loss

### Permission Checks
- Admin authentication required
- Token-based API calls
- Role-based access control (ready for implementation)

### Data Validation
- Required field validation
- Email format validation
- Phone number validation
- URL format validation

## Future Enhancements

### Planned Features
1. **CSV Import**: Bulk import companies from CSV
2. **Advanced Filters**: Filter by industry, location, size
3. **Date Range Filters**: Filter by registration date
4. **Package Management**: Full package assignment UI
5. **Comments System**: Admin notes and comments
6. **Activity Log**: Track all company activities
7. **Sub-user Management**: Manage company team members
8. **Permission Matrix**: Granular permission control
9. **Email Templates**: Customizable email templates
10. **Notification System**: Real-time notifications

### Integration Points
- **Payment Gateway**: Link to Razorpay for subscriptions
- **Email Service**: SMTP integration for emails
- **Storage Service**: Cloud storage for images
- **Analytics**: Company activity analytics
- **Reporting**: Generate company reports

## Troubleshooting

### Common Issues

**Companies not loading**
- Check API endpoint is correct
- Verify authentication token
- Check network connection
- Review backend logs

**Images not uploading**
- Verify image picker permissions
- Check file size limits
- Ensure correct API endpoint
- Check backend storage configuration

**Bulk actions not working**
- Ensure companies are selected
- Check API endpoint
- Verify admin permissions
- Review error messages

**Export not working**
- Check browser popup blockers (web)
- Verify file system permissions (mobile)
- Ensure data is loaded
- Check CSV generation logic

## Technical Details

### Dependencies
- `react-native`: Core framework
- `@expo/vector-icons`: Icons
- `expo-image-picker`: Image selection
- `expo-document-picker`: File selection
- `expo-file-system`: File operations
- `expo-sharing`: File sharing
- `@react-native-async-storage/async-storage`: Local storage

### State Management
- React hooks (useState, useEffect)
- Local component state
- No external state management library required

### Styling
- StyleSheet API
- Responsive design utilities
- Platform-specific styles
- Dynamic styling based on screen size

### Performance
- Lazy loading of images
- Efficient list rendering
- Debounced search
- Optimized re-renders

## Support

For issues or questions:
1. Check this documentation
2. Review backend API documentation
3. Check console logs for errors
4. Contact development team

## Version History

### v1.0.0 (Current)
- Initial release
- Company listing with stats
- Company details view/edit
- Bulk operations
- CSV export
- Image upload
- Quick actions
- Jobs integration
- Responsive design
