# Quick Install & Run - Job Application Form

## What's New? 🎉

A brand new **Multi-Step Job Application Form** with:
- ✅ 5 organized steps for easy data entry
- ✅ Beautiful UI with gradient headers and progress tracking
- ✅ All required fields from your specification
- ✅ Form validation with clear error messages
- ✅ Resume upload functionality
- ✅ Date picker for date of birth
- ✅ Radio buttons and checkboxes
- ✅ 100% React Native (no HTML)

## Installation Steps

### Step 1: Install New Dependencies

Run this command in your project root directory:

```bash
npm install
```

This will install the newly added packages:
- `@react-native-community/datetimepicker@^8.4.0` - For date selection
- `expo-document-picker@~12.0.2` - For resume file upload

### Step 2: Clear Cache (Recommended)

```bash
npx expo start --clear
```

### Step 3: Run the App

Choose your platform:

**For Web:**
```bash
npm run web
```

**For Android/iOS (Expo Go):**
```bash
npm start
```
Then scan the QR code with Expo Go app.

## How to Test the New Form

1. **Start the app** using one of the commands above
2. **Navigate to Jobs** page from the header
3. **Click on any job card** to view job details
4. **Click "Apply Now"** button
5. **Fill out the multi-step form**:
   - Step 1: Personal Information
   - Step 2: Experience & Professional Details
   - Step 3: Education Details
   - Step 4: Additional Details
   - Step 5: Resume Upload & Submit

## Form Fields Included

### ✅ All Required Fields from Your Specification

**Personal Info (Step 1):**
- Name, Number, Email, Date of Birth
- Gender, Marital Status
- English Fluency Level
- WhatsApp availability checkbox

**Experience (Step 2):**
- Experience Level, Years of Experience
- Present Job Status, Current Job Title
- Key Skills (comma-separated)
- Current Company, Salary, Industry
- Department, Job Roles
- Preferred Locations
- Ready to Relocate, Notice Period

**Education (Step 3):**
- Level of Education
- Degree/Course
- Specialization

**Additional (Step 4):**
- Current Residence Address
- Bike/Two Wheeler Availability
- DL (Driving License) Availability
- Reference Source (From Where You Heard About Us)

**Submit (Step 5):**
- Upload Resume (PDF, DOC, DOCX)
- Privacy Policy Agreement checkbox
- Application Summary Review

## Features

### 🎨 Beautiful Design
- Gradient headers with purple/blue theme
- Progress indicator showing current step
- Clean, modern card-based layout
- Proper spacing and shadows
- Responsive for both mobile and web

### ✅ Smart Validation
- Required fields marked with red asterisk (*)
- Real-time validation on Next/Submit
- Email format validation
- 10-digit phone number validation
- Cannot proceed without filling required fields

### 📱 User-Friendly
- Easy navigation with Previous/Next buttons
- Clear error messages
- Date picker for date of birth
- File picker for resume upload
- Radio buttons for single-choice options
- Checkboxes for agreements

### 💾 Data Handling
- All data submitted to backend API
- Comma-separated skills and locations converted to arrays
- Date formatted to ISO standard
- Success message on submission
- Auto-navigation back after success

## Troubleshooting

### Issue: "Module not found" error
**Solution:** Run `npm install` again and clear cache:
```bash
npm install
npx expo start --clear
```

### Issue: Date picker not showing
**Solution:** Make sure you installed dependencies and restarted the app

### Issue: File picker not working
**Solution:** 
- On web: Browser file picker should work automatically
- On mobile: Grant file access permissions when prompted

### Issue: Form not submitting
**Solution:** 
1. Check if backend server is running
2. Verify backend API endpoint in `src/config/api.js`
3. Check console for error messages

## Backend Requirements

The form sends data to your existing application API endpoint. Make sure your backend:

1. **Has the route** `/api/applications` or `/api/applications/apply`
2. **Accepts** all the fields listed above
3. **Is running** on the correct port
4. **Has CORS enabled** if testing from web

Check `server/routes/applications.js` for the backend implementation.

## Next Steps

After testing, you can customize:
1. **Colors**: Edit `src/styles/theme.js`
2. **Field Options**: Modify radio button options in the component
3. **Validation Rules**: Update validation in `validateStep()` function
4. **API Integration**: Modify `handleSubmit()` function

## Need Help?

1. Check the detailed guide: `JOB_APPLICATION_FORM_GUIDE.md`
2. Review backend integration: `server/routes/applications.js`
3. Check console logs for errors
4. Verify all dependencies are installed

## Files Modified/Created

- ✅ `src/screens/Jobs/JobApplicationScreen.js` - Complete rewrite
- ✅ `package.json` - Added new dependencies
- ✅ `JOB_APPLICATION_FORM_GUIDE.md` - Detailed documentation
- ✅ `QUICK_INSTALL_APPLICATION_FORM.md` - This file

---

**Enjoy your new multi-step application form! 🚀**

