# Employer Registration & Login - Quick Guide

## 🎉 What's New

You now have **complete employer registration and login flows** that match your design specifications!

## 📱 New Screens Created

1. ✅ **Employer Options Screen** - Choose between Company or Consultancy
2. ✅ **Company Registration Form** - Full registration for companies
3. ✅ **Consultancy Registration Form** - Full registration for consultancies

All screens are built with **pure React Native** - no HTML!

---

## 🚀 How to Use

### For Companies:

#### **Step 1: Access Employer Options**
From your Home screen or navigation, go to "For Employers" section.

#### **Step 2: Choose Company**
You'll see two cards:
- **Company** (Dark Gray) - For direct employers
- **Consultancy** (Purple) - For recruitment agencies

Click on the **Company** card.

#### **Step 3: Register or Login**

**To Register:**
1. Click "Company Registration" button
2. Fill in the form:
   - Personal Info (Name, Email, Phone, Password)
   - Company Info (Company Name, Designation)
   - Where you heard about us
   - Accept terms & conditions
3. Click "Register"
4. You'll be redirected to Company Dashboard

**To Login:**
1. Click "Company Login" button
2. Enter credentials (Email/Phone/User ID and Password)
3. Select "Employer" type and "Company" sub-type
4. Click "Sign In"
5. You'll be redirected to Company Dashboard

---

### For Consultancies:

#### **Step 1: Access Employer Options**
Same as above

#### **Step 2: Choose Consultancy**
Click on the **Consultancy** card (Purple one).

#### **Step 3: Register or Login**

**To Register:**
1. Click "Consultancy Registration" button
2. Fill in the form:
   - Personal Info (Name, Email, Phone, Password)
   - Consultancy Info (Consultancy Name, Designation)
   - Where you heard about us
   - Accept terms & conditions
3. Click "Create Consultancy Account"
4. You'll be redirected to Consultancy Dashboard

**To Login:**
1. Click "Consultancy Login" button
2. Enter credentials
3. Select "Employer" type and "Consultancy" sub-type
4. Click "Sign In"
5. You'll be redirected to Consultancy Dashboard

---

## 📋 Form Fields Reference

### Personal Information (Both Forms):
- **First Name** * (Required)
- **Last Name** * (Required)
- **Email ID** * (Must be valid email)
- **Mobile Number** * (10 digits, starts with 6-9)
- **WhatsApp Available** (Optional checkbox)
- **Password** * (Minimum 6 characters)

### Company Information:
- **Your Company Name** * (Required)
- **Your Designation** * (Required)
- **From Where You Heard About Us** * (Dropdown selection)

### Consultancy Information:
- **Your Consultancy Name** * (Required)
- **Your Designation** * (Required)
- **From Where You Heard About Us** * (Dropdown selection)

### Terms & Conditions:
- **Agree to Terms** * (Required - must check)
- **Receive Updates** (Optional)

---

## 🎨 Visual Design

### Employer Options Screen:
```
┌─────────────────────────────────────┐
│     Free job wala                   │
│                                     │
│  Choose Your Employer Type          │
│  Select whether you're a company... │
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │   Company    │  │ Consultancy  ││
│  │ (Dark Gray)  │  │  (Purple)    ││
│  │              │  │              ││
│  │  🏢 Icon     │  │  👥 Icon     ││
│  │              │  │              ││
│  │ Company      │  │ Consultancy  ││
│  │ Description  │  │ Description  ││
│  │              │  │              ││
│  │ [Login]      │  │ [Login]      ││
│  │ [Register]   │  │ [Register]   ││
│  └──────────────┘  └──────────────┘│
└─────────────────────────────────────┘
```

### Company Registration:
```
┌─────────────────────────────────────┐
│  🏢 Company Registration Form       │
│  Let's Get Started...               │
│  [Direct Employer]                  │
├─────────────────────────────────────┤
│  Personal Information               │
│  ┌──────────┐  ┌──────────┐        │
│  │First Name│  │Last Name │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │Email ID  │  │Mobile No.│        │
│  └──────────┘  └──────────┘        │
│  ┌────────────────────────┐        │
│  │Password                │        │
│  └────────────────────────┘        │
│                                     │
│  Company Information                │
│  ┌──────────┐  ┌──────────┐        │
│  │Company   │  │Designtion│        │
│  └──────────┘  └──────────┘        │
│  ┌────────────────────────┐        │
│  │Heard About Us ▼        │        │
│  └────────────────────────┘        │
│                                     │
│  ☐ Agree to Terms                  │
│  ☐ Receive Updates                 │
│                                     │
│  ┌────────────────────────┐        │
│  │      Register          │        │
│  └────────────────────────┘        │
│                                     │
│  Already have an account? Login    │
└─────────────────────────────────────┘
```

---

## 🔄 Navigation Paths

### Registration Path:
```
Home 
  → EmployerOptions 
    → CompanyRegister / ConsultancyRegister
      → Fill Form
        → Register (API Call)
          → CompanyDashboard / ConsultancyDashboard
```

### Login Path:
```
Home 
  → EmployerOptions 
    → Click Login
      → LoginScreen (with employer type preset)
        → Enter Credentials
          → CompanyDashboard / ConsultancyDashboard
```

---

## ⚠️ Validation Rules

### Email:
- Must contain @ symbol
- Must have domain (e.g., .com)
- Example: `user@company.com` ✅
- Example: `user` ❌

### Phone Number:
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9
- Example: `9876543210` ✅
- Example: `1234567890` ❌

### Password:
- Minimum 6 characters
- Example: `mypass123` ✅
- Example: `pass` ❌

### Required Fields:
All fields marked with * (asterisk) are mandatory

---

## 🐛 Troubleshooting

### Issue: Can't see Employer Options
**Solution:** Navigate from Home → "For Employers" section

### Issue: Registration button doesn't work
**Solution:** 
1. Fill all required fields (marked with *)
2. Check Terms & Conditions checkbox
3. Ensure email and phone are valid

### Issue: Email error
**Solution:** Use valid email format (e.g., name@domain.com)

### Issue: Phone number error
**Solution:** 
- Use 10 digits only
- Start with 6, 7, 8, or 9
- Don't include +91 or spaces

### Issue: Password error
**Solution:** Use at least 6 characters

### Issue: After registration, nothing happens
**Solution:** Check console for API errors, ensure backend is running

---

## 🎯 Quick Test

### Test Company Registration:
1. **Navigate:** Home → EmployerOptions
2. **Click:** Company Registration
3. **Fill Form:**
   - First Name: John
   - Last Name: Doe
   - Email: john@techcorp.com
   - Phone: 9876543210
   - Password: password123
   - Company: Tech Corp
   - Designation: HR Manager
   - Heard About: Google Search
4. **Check:** Terms & Conditions
5. **Click:** Register
6. **Expected:** Redirect to Company Dashboard

### Test Consultancy Registration:
1. **Navigate:** Home → EmployerOptions
2. **Click:** Consultancy Registration
3. **Fill Form:**
   - First Name: Jane
   - Last Name: Smith
   - Email: jane@recruitpro.com
   - Phone: 9123456789
   - Password: password123
   - Consultancy: Recruit Pro
   - Designation: Director
   - Heard About: Social Media
4. **Check:** Terms & Conditions
5. **Click:** Create Consultancy Account
6. **Expected:** Redirect to Consultancy Dashboard

---

## 📊 Features Summary

✅ **Pure React Native** - No HTML components
✅ **Responsive Design** - Works on all screen sizes
✅ **Form Validation** - Client-side validation
✅ **Error Messages** - Clear, user-friendly errors
✅ **Loading States** - Shows "Registering..." during API call
✅ **Success Handling** - Auto-redirect to dashboard
✅ **API Integration** - Connected to backend
✅ **Checkbox Options** - WhatsApp availability, Updates
✅ **Dropdown Select** - For "Heard About Us"
✅ **Terms & Conditions** - Required checkbox with links

---

## 🔗 Related Documentation

- `LOGIN_SCREEN_DESIGN.md` - Login screen details
- `EMPLOYER_SCREENS_DOCUMENTATION.md` - Technical documentation
- `BACKEND_FRONTEND_INTEGRATION.md` - API integration guide
- `QUICK_START.md` - Getting started guide

---

## 📞 Need Help?

If you encounter any issues:
1. Check validation errors on form
2. Verify backend is running
3. Check console for API errors
4. Review error messages

---

**Happy Recruiting! 🚀**

Your employer registration system is now complete and ready to use!

