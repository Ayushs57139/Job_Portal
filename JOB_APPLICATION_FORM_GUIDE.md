# Multi-Step Job Application Form Guide

## Overview

The Job Application Form has been completely redesigned as a comprehensive multi-step form that collects all necessary candidate information in an organized, user-friendly manner using React Native components.

## Features

### ✨ Multi-Step Flow
The application form is divided into 5 logical steps:
1. **Personal Information** - Basic candidate details
2. **Experience & Professional Details** - Work history and skills
3. **Education Details** - Academic background
4. **Additional Details** - Location, vehicle availability, references
5. **Resume & Submit** - Document upload and final submission

### 🎨 Beautiful UI/UX
- **Progress Indicator**: Visual step tracker showing current progress
- **Gradient Headers**: Eye-catching gradient backgrounds
- **Form Validation**: Real-time validation with error messages
- **Responsive Design**: Works seamlessly on mobile and web
- **Professional Styling**: Clean, modern design with shadows and rounded corners

### 📝 Comprehensive Fields

#### Step 1: Personal Information
- ✓ Full Name (required)
- ✓ Mobile Number (required) with 10-digit validation
- ✓ WhatsApp Availability checkbox
- ✓ Email ID (required) with email validation
- ✓ Date of Birth with native date picker
- ✓ Gender (required) - Radio buttons
- ✓ Marital Status (required) - Radio buttons
- ✓ English Fluency Level (required) - Radio buttons

#### Step 2: Experience & Professional Details
- ✓ Experience Level (required) - Radio buttons (Fresher/Entry/Mid/Senior/Expert)
- ✓ Years of Experience (required)
- ✓ Present Job Status
- ✓ Current Job Title/Designation
- ✓ Key Skills (required) - Comma-separated
- ✓ Current Company Name
- ✓ Current Salary (Annual)
- ✓ Current Job Industry (required)
- ✓ Current Job Department
- ✓ Current Job Roles
- ✓ Current/Preferred Job Locations (required) - Comma-separated
- ✓ Ready to Relocate - Radio buttons (Yes/No/Maybe)
- ✓ Notice Period

#### Step 3: Education Details
- ✓ Level of Education (required) - Radio buttons (10th/12th/Diploma/Graduate/Post Graduate/Doctorate)
- ✓ Degree/Course (required)
- ✓ Specialization

#### Step 4: Additional Details
- ✓ Current Residence Address/Location (required)
- ✓ Bike/Two Wheeler Availability (required) - Radio buttons
- ✓ Driving License Availability (required) - Radio buttons
- ✓ From Where You Heard About Us/Reference

#### Step 5: Resume & Submit
- ✓ Resume Upload - Supports PDF, DOC, DOCX files
- ✓ Application Summary - Review before submission
- ✓ Privacy Policy Agreement checkbox (required)

## Installation

### 1. Install Dependencies

```bash
npm install
```

or if using yarn:

```bash
yarn install
```

The following new packages have been added:
- `@react-native-community/datetimepicker` - For date of birth selection
- `expo-document-picker` - For resume file upload

### 2. Start the Application

```bash
npm start
# or
expo start
```

## Usage

### Navigating to the Application Form

The form can be accessed from:
1. **Job Card** - Click "Apply Now" button on any job card
2. **Job Details Screen** - Click "Apply for Job" button

The form receives the `jobId` as a route parameter.

### Form Navigation

- **Next Button**: Validates current step and moves to the next step
- **Previous Button**: Returns to the previous step (no validation)
- **Submit Button**: Appears on the final step, validates and submits the application

### Form Validation

Each step has its own validation rules:
- Required fields are marked with a red asterisk (*)
- Validation occurs when clicking "Next" or "Submit"
- Error messages appear below invalid fields
- Users cannot proceed to the next step until all required fields are filled correctly

### Data Submission

When the form is submitted:
1. All form data is collected and formatted
2. Skills and locations are converted to arrays (from comma-separated strings)
3. Date of birth is converted to ISO format
4. Data is sent to the backend via the `api.applyForJob()` method
5. Success message is displayed
6. User is navigated back to the previous screen

## Component Structure

```
JobApplicationScreen
├── Progress Bar (Step Indicator)
├── Step Content (Dynamic based on current step)
│   ├── Step 1: Personal Information
│   ├── Step 2: Experience & Professional
│   ├── Step 3: Education
│   ├── Step 4: Additional Details
│   └── Step 5: Resume & Submit
└── Navigation Buttons (Previous/Next/Submit)
```

## Styling

The form uses the theme system from `src/styles/theme.js`:
- **Colors**: Primary, text, background, error colors
- **Spacing**: Consistent spacing throughout
- **Typography**: Defined text styles
- **Shadows**: Card shadows for depth
- **Border Radius**: Rounded corners

### Custom Components

1. **renderInput**: Reusable text input component with icon and error handling
2. **renderRadioGroup**: Radio button group for single selection
3. **renderCheckbox**: Checkbox component for boolean values
4. **renderProgressBar**: Visual step indicator at the top

## Backend Integration

The form integrates with the existing backend API:

### Expected API Endpoint
`POST /api/applications` or `/api/applications/apply` (depending on your backend setup)

### Request Payload
```javascript
{
  jobId: string,
  fullName: string,
  email: string,
  mobileNumber: string,
  whatsappNumber: string,
  dateOfBirth: string (ISO format),
  gender: string,
  maritalStatus: string,
  englishFluency: string,
  experienceLevel: string,
  yearsOfExperience: string,
  jobStatus: string,
  currentJobTitle: string,
  keySkills: array,
  currentCompany: string,
  currentSalary: string,
  industry: string,
  currentDepartment: string,
  currentJobRoles: string,
  preferredLocations: array,
  readyToRelocate: string,
  noticePeriod: string,
  educationLevel: string,
  course: string,
  specialization: string,
  currentAddress: string,
  bikeAvailable: string,
  drivingLicense: string,
  sourceOfVisit: string
}
```

## Future Enhancements

Potential improvements for the future:
1. **Auto-save**: Save form progress to local storage
2. **Resume Parsing**: Auto-fill fields from uploaded resume
3. **Multi-file Upload**: Support for cover letter and certificates
4. **Skill Autocomplete**: Suggest skills as user types
5. **Location Autocomplete**: Integrate with location API
6. **Photo Upload**: Add candidate photo option
7. **Form Analytics**: Track completion rates and drop-off points
8. **Prefill from Profile**: If user is logged in, prefill from profile data

## Troubleshooting

### Common Issues

1. **Date Picker not showing on Android**
   - Ensure `@react-native-community/datetimepicker` is properly installed
   - Rebuild the app: `expo start --clear`

2. **Document Picker not working**
   - Ensure `expo-document-picker` is installed
   - Check file type restrictions in the code

3. **Form not submitting**
   - Check console for error messages
   - Verify backend API endpoint is correct
   - Ensure all required fields have validation

4. **Styling issues on web**
   - Web platform may render some components differently
   - Test on actual device for best experience

## Testing

### Manual Testing Checklist

- [ ] All required fields show error when left empty
- [ ] Email validation works correctly
- [ ] Phone number accepts only 10 digits
- [ ] Date picker opens and sets date correctly
- [ ] Radio buttons work (only one selectable per group)
- [ ] Checkboxes toggle correctly
- [ ] Document picker opens and selects files
- [ ] Navigation buttons work (Previous/Next/Submit)
- [ ] Form submits successfully
- [ ] Success message appears
- [ ] User navigates back after submission

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure backend API is running and accessible
4. Review the backend route configuration in `server/routes/applications.js`

## Version History

- **v1.0** (Current) - Initial multi-step form implementation with all required fields

