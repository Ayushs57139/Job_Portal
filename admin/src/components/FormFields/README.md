# Form Field Components Documentation

This directory contains reusable form field components for building complex forms in React Native.

## Components

### 1. DropdownField

A single-selection dropdown with search functionality and optional "add new" feature.

**Props:**
- `label` (string): Field label
- `value` (object): Selected option `{ value, label }`
- `options` (array): Array of options `[{ value, label }]`
- `onSelect` (function): Selection handler
- `placeholder` (string): Placeholder text
- `error` (string): Error message
- `required` (boolean): Required field indicator
- `icon` (string): Ionicons icon name
- `allowAddNew` (boolean): Enable add new option feature
- `onAddNew` (function): Handler for adding new option
- `disabled` (boolean): Disable the field

**Example:**
```javascript
<DropdownField
  label="Company Type"
  value={selectedType}
  options={companyTypeOptions}
  onSelect={setSelectedType}
  placeholder="Select company type"
  icon="briefcase-outline"
  required
/>
```

### 2. MultiSelectField

A multi-selection dropdown with chips display and optional max selections limit.

**Props:**
- `label` (string): Field label
- `value` (array): Selected options `[{ value, label }]`
- `options` (array): Array of options
- `onSelect` (function): Selection handler
- `placeholder` (string): Placeholder text
- `error` (string): Error message
- `required` (boolean): Required field indicator
- `icon` (string): Ionicons icon name
- `maxSelections` (number): Maximum number of selections allowed
- `allowAddNew` (boolean): Enable add new option feature
- `onAddNew` (function): Handler for adding new option
- `disabled` (boolean): Disable the field

**Example:**
```javascript
<MultiSelectField
  label="Key Skills"
  value={selectedSkills}
  options={skillsOptions}
  onSelect={setSelectedSkills}
  maxSelections={10}
  icon="star-outline"
  required
/>
```

### 3. AutoCompleteField

A text input with autocomplete suggestions and optional "add new" feature.

**Props:**
- `label` (string): Field label
- `value` (string): Current text value
- `suggestions` (array): Suggestion options `[{ value, label }]`
- `onChangeText` (function): Text change handler
- `onSelect` (function): Suggestion selection handler
- `placeholder` (string): Placeholder text
- `error` (string): Error message
- `required` (boolean): Required field indicator
- `icon` (string): Ionicons icon name
- `allowAddNew` (boolean): Enable add new option feature
- `onAddNew` (function): Handler for adding new option
- `disabled` (boolean): Disable the field
- `multiline` (boolean): Enable multiline input
- `numberOfLines` (number): Number of lines for multiline

**Example:**
```javascript
<AutoCompleteField
  label="Company Name"
  value={companyName}
  suggestions={companySuggestions}
  onChangeText={setCompanyName}
  onSelect={(item) => setCompanyName(item.label)}
  placeholder="Type company name"
  icon="business-outline"
  allowAddNew
  required
/>
```

### 4. CheckboxField

A single checkbox with label and optional description.

**Props:**
- `label` (string): Checkbox label
- `value` (boolean): Checked state
- `onToggle` (function): Toggle handler
- `error` (string): Error message
- `disabled` (boolean): Disable the checkbox
- `description` (string): Additional description text

**Example:**
```javascript
<CheckboxField
  label="Hide Salary Details"
  value={hideSalary}
  onToggle={setHideSalary}
  description="Salary will not be shown to candidates"
/>
```

### 5. TimePickerField

A time picker with 24-hour format and 30-minute intervals.

**Props:**
- `label` (string): Field label
- `value` (object): Selected time `{ value, label }`
- `onSelect` (function): Selection handler
- `placeholder` (string): Placeholder text
- `error` (string): Error message
- `required` (boolean): Required field indicator
- `icon` (string): Ionicons icon name
- `disabled` (boolean): Disable the field

**Example:**
```javascript
<TimePickerField
  label="Contact Timing Start"
  value={startTime}
  onSelect={setStartTime}
  placeholder="Select start time"
  required
/>
```

### 6. WeekDaysField

A week days selector with multi-select or single-select mode.

**Props:**
- `label` (string): Field label
- `value` (array): Selected days `['monday', 'tuesday', ...]`
- `onSelect` (function): Selection handler
- `error` (string): Error message
- `required` (boolean): Required field indicator
- `disabled` (boolean): Disable the field
- `multiSelect` (boolean): Enable multiple day selection (default: true)

**Example:**
```javascript
<WeekDaysField
  label="Available Days"
  value={selectedDays}
  onSelect={setSelectedDays}
  required
/>
```

## Common Patterns

### Validation

All fields support error display:

```javascript
const [errors, setErrors] = useState({});

// Validate
if (!fieldValue) {
  setErrors({ fieldName: 'This field is required' });
}

// Use in field
<DropdownField
  error={errors.fieldName}
  // ... other props
/>
```

### Conditional Fields

Fields can be shown/hidden based on other field values:

```javascript
{showWalkInDetails && (
  <TimePickerField
    label="Walk-in Timing"
    value={timing}
    onSelect={setTiming}
  />
)}
```

### Adding New Options Dynamically

```javascript
<DropdownField
  allowAddNew
  onAddNew={(newValue) => {
    const newOption = { 
      value: newValue.toLowerCase().replace(/\s+/g, '_'), 
      label: newValue 
    };
    setOptions([...options, newOption]);
    setSelectedValue(newOption);
  }}
/>
```

## Styling

All components use the centralized theme from `src/styles/theme.js`. Key theme properties used:

- `colors`: Primary, text, background, error colors
- `spacing`: Consistent spacing values
- `borderRadius`: Border radius values
- `typography`: Text styles
- `shadows`: Shadow/elevation styles

## Accessibility

All components include:
- Proper labels
- Error message announcements
- Touch target sizes (44x44pt minimum)
- Clear focus states
- Screen reader support

## Performance Tips

1. **Memoization**: Use `React.memo` for large forms
2. **Lazy Loading**: Load options data only when needed
3. **Debouncing**: Debounce search in autocomplete fields
4. **Virtualization**: For very large option lists, consider virtualization

## Testing

When testing these components:

1. Test all interactions (tap, scroll, search)
2. Verify error states
3. Test with different screen sizes
4. Test accessibility features
5. Verify keyboard handling
6. Test with real data

## Future Enhancements

Potential improvements:
- Date range picker
- Color picker
- File upload field
- Rich text editor field
- Location picker with maps
- Signature field
- Rating/star field

