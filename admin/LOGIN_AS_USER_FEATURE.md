# Login as User Feature - Quick Guide

## Overview
The "Login as User" feature allows administrators to log into the platform as any user (Job Seeker, Employer, Company, or Consultancy) for support and troubleshooting purposes.

## Location
**Admin Panel → Users Management → Actions Column**

## How to Use

### Step 1: Navigate to Users Management
1. Login to Admin Panel
2. Click "Users" in the sidebar
3. You'll see the list of all users

### Step 2: Find the User
- Use the search bar to find a specific user
- Filter by role: All, Job Seekers, All Employers
- View user details: Name, Email, Role, Status

### Step 3: Click "Login as User"
In the Actions column, you'll see three buttons:
- 👁️ **Eye icon** - View user details
- 🔓 **Login icon** (green) - Login as this user
- 🗑️ **Trash icon** - Delete user

Click the **Login icon** (middle button)

### Step 4: Confirm Action
A confirmation dialog will appear showing:
- User's full name
- Email address
- Role (Job Seeker, Employer, Company, Consultancy)
- Warning that you'll be logged out from admin panel

Click **"Login"** to proceed or **"Cancel"** to abort

### Step 5: You're Now Logged In as the User
- You'll be automatically redirected to the appropriate dashboard:
  - **Job Seekers** → User Dashboard
  - **Employers** → Employer Dashboard
  - **Companies** → Company Dashboard
  - **Consultancies** → Consultancy Dashboard

## User Types Supported

### 1. Job Seeker
- Role: `JOBSEEKER`
- Dashboard: User Dashboard
- Can apply for jobs, manage profile, view applications

### 2. Employer
- Role: `EMPLOYER`
- Dashboard: Employer Dashboard
- Can post jobs, view applications, manage company profile

### 3. Company
- Role: `EMPLOYER`
- Type: `COMPANY`
- Dashboard: Company Dashboard
- Full company features and management

### 4. Consultancy
- Role: `EMPLOYER`
- Type: `CONSULTANCY`
- Dashboard: Consultancy Dashboard
- Consultancy-specific features

## Visual Guide

```
Users Management Screen
┌─────────────────────────────────────────────────────────────┐
│ Name          Email              Role        Actions         │
├─────────────────────────────────────────────────────────────┤
│ John Doe      john@email.com     JOBSEEKER   👁️ 🔓 🗑️      │
│ ABC Company   abc@company.com    EMPLOYER    👁️ 🔓 🗑️      │
│ XYZ Consult   xyz@consult.com    EMPLOYER    👁️ 🔓 🗑️      │
└─────────────────────────────────────────────────────────────┘
                                                  ↑
                                          Login as User Button
```

## Important Notes

### Security
- ⚠️ This action is logged for audit purposes
- ⚠️ Use only when necessary for support
- ⚠️ You will be logged out from admin panel
- ⚠️ The user may be notified (depending on settings)

### Returning to Admin Panel
To return to admin panel:
1. Logout from the user account
2. Navigate to admin login page
3. Login with your admin credentials

### What You Can Do as the User
- ✅ View everything the user sees
- ✅ Perform actions on their behalf
- ✅ Test features and functionality
- ✅ Troubleshoot issues
- ✅ Verify user reports

### What You Cannot Do
- ❌ Change the user's password (without their knowledge)
- ❌ Delete the user's account while logged in as them
- ❌ Access admin features

## Use Cases

### 1. Support Ticket Resolution
**Scenario:** User reports they can't apply for jobs
**Action:**
1. Login as the user
2. Navigate to job listings
3. Try to apply for a job
4. Identify the issue
5. Fix or document the problem

### 2. Feature Testing
**Scenario:** Test new feature from user perspective
**Action:**
1. Login as a test user
2. Test the new feature
3. Verify functionality
4. Document any issues

### 3. Data Verification
**Scenario:** Verify user's profile data
**Action:**
1. Login as the user
2. Check profile information
3. Verify resume, documents
4. Confirm data accuracy

### 4. Training & Demos
**Scenario:** Show team how user interface works
**Action:**
1. Login as demo user
2. Demonstrate features
3. Show user workflows
4. Train support team

## Troubleshooting

### Issue: Button not visible
**Solution:** 
- Refresh the page
- Check if you have admin permissions
- Verify you're on the Users Management screen

### Issue: Login fails
**Solution:**
- Check internet connection
- Verify user account is active
- Ensure user is not already logged in
- Contact system administrator

### Issue: Wrong dashboard after login
**Solution:**
- Check user's role and type in database
- Verify navigation logic
- Report bug to development team

### Issue: Can't return to admin
**Solution:**
- Logout from user account
- Clear browser cache
- Navigate to admin login URL directly
- Use incognito/private window

## Best Practices

### Do's ✅
- ✅ Document why you logged in as user
- ✅ Inform the user if making changes
- ✅ Use for legitimate support purposes
- ✅ Logout immediately after resolving issue
- ✅ Keep session time minimal

### Don'ts ❌
- ❌ Don't share user credentials
- ❌ Don't make unauthorized changes
- ❌ Don't access sensitive data unnecessarily
- ❌ Don't stay logged in longer than needed
- ❌ Don't use for personal purposes

## Technical Details

### API Endpoint
```
POST /api/admin/login-as-user/:userId
```

### Request Headers
```
Authorization: Bearer <admin_token>
```

### Response
```json
{
  "success": true,
  "token": "user_jwt_token",
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

### Token Storage
- User token stored in: `AsyncStorage.token`
- User data stored in: `AsyncStorage.user`
- Admin token removed from storage

### Navigation Logic
```javascript
if (role === 'JOBSEEKER') {
  navigate to UserDashboard
} else if (role === 'EMPLOYER') {
  if (employerType === 'COMPANY') {
    navigate to CompanyDashboard
  } else if (employerType === 'CONSULTANCY') {
    navigate to ConsultancyDashboard
  } else {
    navigate to EmployerDashboard
  }
}
```

## Audit Trail

Each "Login as User" action should log:
- Admin ID
- User ID
- Timestamp
- IP Address
- User Agent
- Action performed

## Compliance

### GDPR Considerations
- User should be notified of admin access
- Access should be logged and auditable
- Purpose should be documented
- Data minimization principle applies

### Security Compliance
- Two-factor authentication recommended
- Session timeout enforced
- Activity monitoring enabled
- Regular audit reviews

## FAQ

**Q: Will the user know I logged in as them?**
A: Depends on system settings. Typically, users receive a notification email.

**Q: Can I change the user's password?**
A: Not recommended. Use password reset feature instead.

**Q: How long can I stay logged in as user?**
A: Session timeout applies (typically 24 hours), but logout immediately after resolving issue.

**Q: Can multiple admins login as same user?**
A: Yes, but not recommended. Coordinate with team.

**Q: What if I make a mistake while logged in as user?**
A: Document the change and inform the user. Undo if possible.

## Support

For issues or questions:
- Technical Support: admin@yourcompany.com
- Documentation: /admin/docs
- Help Center: /admin/help

---

**Last Updated:** 2024
**Version:** 1.0.0
**Feature Status:** ✅ Active
