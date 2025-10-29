# Employer Screens Documentation

## Overview
This document covers the employer-related screens including the employer options selection, company registration, and consultancy registration forms.

## 🎨 Screens Created

### 1. Employer Options Screen
**File:** `src/screens/Auth/EmployerOptionsScreen.js`

**Purpose:** Allows users to choose between Company or Consultancy registration/login

#### Design Features:
- **Logo:** Freejobwala branding at top
- **Title:** "Choose Your Employer Type"
- **Subtitle:** Explanatory text about the selection
- **Two Cards:**
  1. **Company Card** (Dark Gray Gradient)
     - Icon: Business building
     - Title: "Company"
     - Description: For businesses hiring talent directly
     - Buttons: Company Login, Company Registration
     
  2. **Consultancy Card** (Purple Gradient)
     - Icon: People
     - Title: "Consultancy"
     - Description: For recruitment agencies and consulting firms
     - Buttons: Consultancy Login, Consultancy Registration

#### Color Schemes:
- **Company Card Gradient:** `#2c3e50` → `#34495e` (Dark gray)
- **Consultancy Card Gradient:** `#6366f1` → `#8b5cf6` (Purple)
- **Background:** `#f8fafc` (Light gray)

#### Navigation:
```javascript
// To Company Login
navigation.navigate('Login', { userType: 'employer', employerType: 'company' })

// To Company Registration
navigation.navigate('CompanyRegister')

// To Consultancy Login
navigation.navigate('Login', { userType: 'employer', employerType: 'consultancy' })

// To Consultancy Registration
navigation.navigate('ConsultancyRegister')
```

---

### 2. Company Registration Screen
**File:** `src/screens/Auth/CompanyRegisterScreen.js`

**Purpose:** Registration form for companies

#### Design Features:

**Header (Dark Gradient):**
- Company icon
- Title: "Company Registration Form"
- Subtitle: "Let's Get Started, Tell Us about Your Company"
- Badge: "Direct Employer"

**Form Sections:**

1. **Personal Information:**
   - First Name * (required)
   - Last Name * (required)
   - Email ID * (email validation)
   - Mobile Number * (10-digit validation)
   - WhatsApp Available checkbox
   - Password * (minimum 6 characters)

2. **Company Information:**
   - Your Company Name * (required)
   - Your Designation * (required)
   - From Where You Heard About Us * (dropdown)
     - Google Search
     - Social Media
     - Friend Referral
     - Advertisement
     - Other

3. **Terms & Conditions:**
   - Agree to Terms and Conditions * (required)
   - Receive updates and newsletters (optional)

4. **Actions:**
   - Register button (Dark gray)
   - Login here link

#### Field Validations:
```javascript
// Email validation
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// Phone validation (Indian format)
/^[6-9]\d{9}$/.test(phone)

// Password
password.length >= 6
```

#### API Integration:
```javascript
const registrationData = {
  firstName,
  lastName,
  email,
  phone,
  password,
  userType: 'employer',
  employerType: 'company',
  company: {
    name: companyName,
    designation,
    heardAboutUs,
  },
};

await api.register(registrationData);
```

---

### 3. Consultancy Registration Screen
**File:** `src/screens/Auth/ConsultancyRegisterScreen.js`

**Purpose:** Registration form for consultancies

#### Design Features:

**Header (Purple Gradient):**
- People icon
- Title: "Consultancy Registration"
- Subtitle: "Let's Get Started, Tell Us about Your Consultancy"
- Badge: "Recruitment & Consulting Partner"

**Form Sections:**

1. **Personal Information:**
   - First Name * (required)
   - Last Name * (required)
   - Email ID * (email validation)
   - Mobile Number * (10-digit validation)
   - WhatsApp Available checkbox
   - Password * (minimum 6 characters)

2. **Consultancy Information:**
   - Your Consultancy Name * (required)
   - Your Designation * (required)
   - From Where You Heard About Us * (dropdown)

3. **Terms & Conditions:**
   - Agree to Terms and Conditions * (required)
   - Receive updates and newsletters (optional)

4. **Actions:**
   - Create Consultancy Account button (Purple)
   - Login here link

#### API Integration:
```javascript
const registrationData = {
  firstName,
  lastName,
  email,
  phone,
  password,
  userType: 'employer',
  employerType: 'consultancy',
  consultancy: {
    name: consultancyName,
    designation,
    heardAboutUs,
  },
};

await api.register(registrationData);
```

---

## 🎯 User Flow

### Complete Employer Registration Flow:

1. **User wants to register as employer**
   ```
   Home/Register → EmployerOptions
   ```

2. **User chooses Company**
   ```
   EmployerOptions → Click "Company Registration" → CompanyRegister
   ```

3. **User fills Company form**
   ```
   CompanyRegister → Fill all fields → Click "Register"
   ```

4. **Success**
   ```
   → API call → Success → Navigate to CompanyDashboard
   ```

### Complete Employer Login Flow:

1. **User wants to login**
   ```
   Home → EmployerOptions
   ```

2. **User chooses Company Login**
   ```
   EmployerOptions → Click "Company Login" → Login Screen (with employer type set)
   ```

3. **User logs in**
   ```
   Login → Enter credentials → Navigate to CompanyDashboard
   ```

---

## 📱 Responsive Design

### Layout Behavior:

**Employer Options Screen:**
- **Wide Screen (>768px):** Two cards side by side
- **Mobile:** Cards stacked vertically

**Registration Screens:**
- **Form Fields:** 
  - Two-column layout on wide screens
  - Single column on mobile
- **Padding:** Responsive based on screen size

---

## 🎨 Styling Details

### Company Registration:
```javascript
Header Gradient: ['#2c3e50', '#34495e']
Button Color: #2c3e50
Background: #f8fafc
Card Background: #ffffff
```

### Consultancy Registration:
```javascript
Header Gradient: ['#6366f1', '#8b5cf6']
Button Color: #6366f1
Background: #f8fafc
Card Background: #ffffff
```

### Common Elements:
```javascript
Input Border: #e2e8f0
Label Color: #1e293b
Error Color: #ef4444
Link Color: #6366f1
Checkbox Active: #6366f1
```

---

## 🔧 Technical Implementation

### Components Used:
- Pure React Native components
- LinearGradient (expo-linear-gradient)
- Ionicons (@expo/vector-icons)
- No HTML or web-specific components

### State Management:
```javascript
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  whatsappAvailable: false,
  password: '',
  companyName: '', // or consultancyName
  designation: '',
  heardAboutUs: '',
  agreeToTerms: false,
  receiveUpdates: false,
});
```

### Error Handling:
```javascript
const [errors, setErrors] = useState({});

// Validation
if (!formData.firstName.trim()) {
  newErrors.firstName = 'First name is required';
}

// Display
{errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
```

---

## 📊 Form Validation Rules

### Required Fields (marked with *):
1. First Name
2. Last Name
3. Email ID
4. Mobile Number
5. Password
6. Company/Consultancy Name
7. Designation
8. Heard About Us
9. Agree to Terms

### Optional Fields:
1. WhatsApp Available
2. Receive Updates

### Validation Messages:
```javascript
{
  firstName: 'First name is required',
  email: 'Please enter a valid email',
  phone: 'Please enter a valid 10-digit mobile number',
  password: 'Password must be at least 6 characters',
  agreeToTerms: 'You must agree to the terms and conditions',
}
```

---

## 🚀 Testing

### Test Cases:

1. **Navigation Test:**
   - Navigate from Home to EmployerOptions ✓
   - Click Company Registration → CompanyRegister ✓
   - Click Consultancy Registration → ConsultancyRegister ✓
   - Click Login buttons → Login screen with correct params ✓

2. **Form Validation Test:**
   - Submit empty form → Show all required field errors ✓
   - Enter invalid email → Show email error ✓
   - Enter 9-digit phone → Show phone error ✓
   - Enter 5-char password → Show password error ✓
   - Don't check terms → Show terms error ✓

3. **Registration Test:**
   - Fill all fields correctly → Call API ✓
   - Successful registration → Navigate to dashboard ✓
   - Failed registration → Show error alert ✓

4. **UI Test:**
   - Cards display correctly ✓
   - Gradients render properly ✓
   - Icons show correctly ✓
   - Responsive on different screen sizes ✓

---

## 📁 File Structure

```
src/
├── screens/
│   └── Auth/
│       ├── EmployerOptionsScreen.js      (NEW)
│       ├── CompanyRegisterScreen.js      (NEW)
│       └── ConsultancyRegisterScreen.js  (NEW)
└── navigation/
    └── AppNavigator.js                   (UPDATED)
```

---

## 🔗 API Endpoints Used

### Registration:
```javascript
POST /api/auth/register

Body:
{
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  password: string,
  userType: 'employer',
  employerType: 'company' | 'consultancy',
  company?: {
    name: string,
    designation: string,
    heardAboutUs: string,
  },
  consultancy?: {
    name: string,
    designation: string,
    heardAboutUs: string,
  }
}

Response:
{
  token: string,
  user: {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    userType: 'employer',
    employerType: 'company' | 'consultancy',
    ...
  }
}
```

---

## 🎯 Success Criteria

✅ Employer Options screen displays correctly
✅ Company registration form works end-to-end
✅ Consultancy registration form works end-to-end
✅ Form validation prevents invalid submissions
✅ API integration successful
✅ Navigation flows correctly
✅ Responsive design on all devices
✅ Pure React Native implementation
✅ Matches design specifications
✅ Error handling implemented

---

## 📝 Notes

1. **Design Consistency:** All screens follow the same design pattern as the login screen
2. **Code Reusability:** Similar structure between Company and Consultancy screens for easy maintenance
3. **Validation:** Client-side validation before API call reduces server load
4. **User Experience:** Clear error messages and loading states
5. **Accessibility:** Labels and helper text for all form fields

---

**Last Updated:** October 29, 2025
**Status:** ✅ Complete
**Files Created:** 3 new screens
**Files Modified:** 1 navigation file


