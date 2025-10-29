# Multi-Step Job Post Form Documentation

A comprehensive, reusable multi-step job posting form built with React Native. This form provides a professional, user-friendly interface for creating detailed job postings with extensive customization options.

## 🎯 Features

- **12-Step Progressive Form**: Breaks down complex job posting into manageable steps
- **Smart Field Types**: Dropdown, Multi-select, Autocomplete, Checkboxes, Time Pickers, and more
- **Real-time Validation**: Field-level and step-level validation with clear error messages
- **Progress Tracking**: Visual progress indicator and step navigation dots
- **Conditional Fields**: Shows/hides fields based on other field values
- **Add New Options**: Admin and user permissions for adding new options dynamically
- **Mobile Optimized**: Fully responsive design optimized for mobile devices
- **Keyboard Handling**: Smart keyboard avoidance and input management
- **Accessibility**: Built with accessibility best practices

## 📁 File Structure

```
src/
├── components/
│   ├── FormFields/
│   │   ├── AutoCompleteField.js       # Autocomplete with suggestions
│   │   ├── CheckboxField.js           # Single checkbox field
│   │   ├── DropdownField.js           # Single selection dropdown
│   │   ├── MultiSelectField.js        # Multiple selection dropdown
│   │   ├── TimePickerField.js         # Time selection field
│   │   ├── WeekDaysField.js           # Week days selector
│   │   └── index.js                   # Barrel export
│   └── MultiStepJobPostForm.js        # Main form component
├── data/
│   └── jobPostFormConfig.js           # Form configuration and options
└── screens/
    └── Jobs/
        └── PostJobScreen.js           # Implementation example
```

## 🚀 Quick Start

### Basic Usage

```javascript
import MultiStepJobPostForm from './src/components/MultiStepJobPostForm';

function PostJobScreen() {
  const handleSubmit = async (formData) => {
    console.log('Form submitted:', formData);
    // Process and submit to your API
  };

  const handleCancel = () => {
    // Handle form cancellation
  };

  return (
    <MultiStepJobPostForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      initialData={{}} // Optional: Pre-fill form data
    />
  );
}
```

## 📋 Form Steps Overview

### Step 1: Company & Job Details
- Company Name / Consultancy Name
- Company Type
- Employee Count
- Job Title / Designation
- Key Skills (up to 12)

### Step 2: Employment & Job Type
- Employment Type (Permanent, Contract, Internship, etc.)
- Job Type (Full Time, Part Time)
- Job Mode (WFH, WFO, Hybrid, Remote)
- Job Shift (Day, Night, Rotational)

### Step 3: Job Location
- Job State
- Job City/Region (multiple)
- Job Locality (optional)
- Distance preference
- Include relocate candidates option

### Step 4: Experience & Salary
- Experience Level
- Minimum/Maximum Experience
- Salary Range
- Hide Salary option
- Additional Benefits (multiple)

### Step 5: Candidate Requirements
- Gender preference
- Marital Status
- Employer Industry/Sectors
- Department Category
- Job Roles (multiple)

### Step 6: Education & Demographics
- Education Level
- Courses (multiple)
- Candidate Industries (multiple)
- Age Range
- Preferred Languages (multiple)
- Joining Period

### Step 7: Diversity & Accessibility
- Diversity Hiring preferences
- Disability Status
- Disability Types (multiple)

### Step 8: Job Description
- Detailed Job Description (2000 character limit)
- Number of Vacancies

### Step 9: Walk-in Details (Optional)
- Walk-in Date Range
- Duration
- Timing
- Venue Address
- Google Maps URL

### Step 10: Contact Information
- Response Method
- Communication Preference
- HR Contact Details (Name, Number, Email, WhatsApp)
- Contact Timing
- Available Days

### Step 11: Additional Details
- Questions for Candidates
- Collaboration options
- Collaborator Emails

### Step 12: Client Details (For Consultancy)
- About Client
- Client Company Name
- Hide Client Name option
- Employer Details (if hidden)

## 🎨 Customization

### Modifying Form Steps

Edit `src/data/jobPostFormConfig.js` to add, remove, or modify steps:

```javascript
export const formSteps = [
  {
    id: 'step1',
    title: 'Your Step Title',
    fields: [
      {
        name: 'fieldName',
        label: 'Field Label',
        type: 'dropdown', // text, dropdown, multiselect, autocomplete, etc.
        placeholder: 'Placeholder text',
        icon: 'icon-name',
        required: true,
        options: [...], // For dropdown/multiselect
        allowAddNew: true, // Allow users to add new options
        maxSelections: 10, // For multiselect fields
        dependsOn: 'otherFieldName', // Conditional field
      },
    ],
  },
];
```

### Field Types

1. **text** - Simple text input
2. **textarea** - Multi-line text input
3. **number** - Numeric input
4. **email** - Email input with validation
5. **tel** - Phone number input
6. **dropdown** - Single selection dropdown
7. **multiselect** - Multiple selection dropdown
8. **autocomplete** - Text input with suggestions
9. **checkbox** - Single checkbox
10. **time** - Time picker
11. **weekdays** - Week days selector
12. **date** - Date input

### Adding New Options Data

Add new option sets in `jobPostFormConfig.js`:

```javascript
export const yourOptionsArray = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  // ...
];
```

### Styling

All styles use the centralized theme from `src/styles/theme.js`. Modify colors, spacing, typography, etc. in the theme file for consistent changes across all form components.

## 🔧 Component Props

### MultiStepJobPostForm

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSubmit` | function | Yes | Callback function called when form is submitted. Receives formData object. |
| `onCancel` | function | No | Callback function called when cancel button is pressed. |
| `initialData` | object | No | Object with pre-filled form data. Keys should match field names. |

### Form Field Components

Each field component has its own set of props. Common props include:

| Prop | Type | Description |
|------|------|-------------|
| `label` | string | Field label text |
| `value` | any | Current field value |
| `onChange/onSelect/onToggle` | function | Value change handler |
| `placeholder` | string | Placeholder text |
| `error` | string | Error message to display |
| `required` | boolean | Whether field is required |
| `icon` | string | Ionicons icon name |
| `disabled` | boolean | Whether field is disabled |

## 📱 Usage in Different Scenarios

### Pre-filling Form Data

```javascript
const initialData = {
  companyName: 'Tech Corp',
  jobTitle: 'Software Engineer',
  companyType: { value: 'startup', label: 'Startup' },
  // ...
};

<MultiStepJobPostForm
  initialData={initialData}
  onSubmit={handleSubmit}
/>
```

### Handling Form Submission

```javascript
const handleSubmit = async (formData) => {
  try {
    // Transform data if needed
    const jobData = {
      title: formData.jobTitle,
      company: formData.companyName,
      skills: formData.keySkills?.map(s => s.label) || [],
      // ... transform other fields
    };

    // Submit to your API
    await api.createJob(jobData);
    
    // Show success message
    Alert.alert('Success', 'Job posted successfully!');
  } catch (error) {
    // Error is automatically handled by the form
    throw new Error(error.message);
  }
};
```

### Saving Draft

```javascript
const [draftData, setDraftData] = useState({});

// Save draft on each step
const handleStepChange = (currentStepData) => {
  setDraftData(prev => ({ ...prev, ...currentStepData }));
  // Optionally save to AsyncStorage or backend
};
```

## ✨ Best Practices

1. **Validation**: Always implement proper backend validation in addition to frontend validation
2. **Error Handling**: Provide clear, actionable error messages
3. **Performance**: For large option lists, consider implementing virtualization
4. **Accessibility**: Test with screen readers and ensure proper labels
5. **Offline Support**: Consider implementing draft saving with AsyncStorage
6. **Progressive Enhancement**: Allow users to save and continue later

## 🔐 Permissions & Admin Controls

Fields support different permission levels:
- **Type or Select + Add New (Admin & User)**: `allowAddNew: true` in autocomplete/multiselect
- **Select + Add New (Admin Only)**: Controlled through backend validation
- **Managed By Admin Panel**: Fixed options array

## 🐛 Troubleshooting

### Common Issues

1. **Form not submitting**: Check that all required fields are filled
2. **Dropdown not opening**: Ensure options array is properly formatted with `value` and `label` keys
3. **Autocomplete suggestions not showing**: Verify suggestions array structure
4. **Styling issues**: Check that theme.js is properly imported

## 📄 License

This component is part of the JobWala application.

## 🤝 Contributing

When modifying the form:
1. Test all field types thoroughly
2. Ensure validation works correctly
3. Check mobile responsiveness
4. Update this documentation
5. Test with real data

## 📞 Support

For issues or questions, please contact the development team.

---

**Last Updated**: October 2025
**Version**: 1.0.0

