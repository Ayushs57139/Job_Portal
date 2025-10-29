# Department and Sub-Department Selection Implementation

## Overview
The job application form now includes a comprehensive department and sub-department selection system with cascading dropdowns. Users can select up to 6 departments and up to 6 corresponding sub-departments.

## Features

### 1. **Multi-Select Department Selection (Up to 6)**
- Searchable dropdown with all available departments
- Selected departments are displayed as removable chips
- Real-time search filtering
- Optional field (not required for form submission)

### 2. **Cascading Sub-Department Selection (Up to 6)**
- Only shows sub-departments related to the selected departments
- Automatically filters out sub-departments when parent department is removed
- Searchable dropdown for easy selection
- Optional field

### 3. **Data Management**
- Department data is stored in a centralized location: `src/data/departmentsData.js`
- Can be reused across other forms in the application
- Easy to update and maintain

## File Structure

```
src/
├── data/
│   ├── departmentsData.js         # Department and sub-department data
│   └── industriesData.js          # Industry data (already implemented)
└── screens/
    └── Jobs/
        └── JobApplicationScreen.js # Updated with department selection UI
```

## Data Format

### departmentsData.js Structure

```javascript
export const DEPARTMENTS_DATA = [
  {
    department: 'Department Name',
    subDepartments: [
      'Sub-Department 1',
      'Sub-Department 2',
      // ... more sub-departments
    ],
  },
  // ... more departments
];
```

### Total Departments: 50
Including:
- Administration / Back Office (12 sub-departments)
- Advertising / Digital Marketing (15 sub-departments)
- Agriculture / Forestry / Fishing (44 sub-departments)
- Aviation / Airlines / Aerospace (14 sub-departments)
- Banking / Financial Services / Insurance (98 sub-departments)
- Beauty / Personal Care / Fitness (28 sub-departments)
- Construction Engineering (22 sub-departments)
- Consulting / Professional Services (31 sub-departments)
- Customer Support / ITES / BPO (27 sub-departments)
- Data Science / Analytics (20 sub-departments)
- And 40 more departments...

## Helper Functions

### `getDepartments()`
Returns an array of all department names.

```javascript
const departments = getDepartments();
// Returns: ['Administration / Back Office', 'Advertising / Digital Marketing', ...]
```

### `getSubDepartments(selectedDepartments)`
Returns sub-departments for the selected departments, with duplicates removed.

```javascript
const subDepartments = getSubDepartments(['Banking / Financial Services / Insurance', 'Software Engineering']);
// Returns: ['Banking / Loan Sales', 'Banking Operations', 'DBA / Data warehousing', ...]
```

## Form Integration

### Form State
```javascript
formData: {
  departments: [],      // Array of selected departments (max 6)
  subDepartments: [],   // Array of selected sub-departments (max 6)
  // ... other fields
}
```

### Validation
- **Departments**: Optional (no minimum requirement)
- **Sub-Departments**: Optional

### Data Submission
Both `departments` and `subDepartments` arrays are sent to the backend when the form is submitted:

```javascript
{
  departments: ['Banking / Financial Services / Insurance', 'Software Engineering'],
  subDepartments: ['Banking Operations', 'DevOps', 'Software Development'],
  // ... other application data
}
```

## User Experience

### Department Selection Flow
1. User clicks on "Select departments" dropdown
2. Search bar appears for filtering
3. User can search and select departments (max 6)
4. Selected departments appear as chips above the dropdown
5. User can remove departments by clicking the ❌ icon

### Sub-Department Selection Flow
1. Once departments are selected, sub-department dropdown becomes available
2. Only sub-departments from selected departments are shown
3. Search and select sub-departments (max 6)
4. If a department is removed, its sub-departments are automatically filtered out

### Visual Indicators
- **Helper text**: Gray italic text showing limits
- **Selected items**: Blue background chips with remove button
- **Search**: Real-time filtering as user types
- **No results**: Message shown when search yields no results

## Implementation Location

**In Job Application Form**: Step 2 (Experience & Professional Details)
**Position**: After "Sub Industry / Sectors" section, before "Current Company Name"

## Reusing in Other Forms

To use this department selection in other forms:

```javascript
// 1. Import the data helpers
import { getDepartments, getSubDepartments } from '../../data/departmentsData';

// 2. Add state
const [departments, setDepartments] = useState([]);
const [subDepartments, setSubDepartments] = useState([]);
const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
const [departmentSearch, setDepartmentSearch] = useState('');

// 3. Use the helper functions
const allDepartments = getDepartments();
const availableSubDepartments = getSubDepartments(departments);

// 4. Implement the UI (copy from JobApplicationScreen.js lines 1577-1794)
```

## Backend Integration

### Expected Backend Schema
```javascript
// In your Job Application model/schema
{
  departments: [String],      // Array of department names
  subDepartments: [String],   // Array of sub-department names
  // ... other fields
}
```

### API Endpoint Update
Ensure your backend accepts these new fields:

```javascript
// server/routes/jobApplications.js or similar
router.post('/apply/:jobId', async (req, res) => {
  const {
    departments,        // Array of strings
    subDepartments,     // Array of strings
    // ... other fields
  } = req.body;
  
  // Save to database
});
```

## Sample Departments Included

### Major Departments (with sub-department counts):
1. **Administration / Back Office** (12)
2. **Advertising / Digital Marketing** (15)
3. **Agriculture / Forestry / Fishing** (44)
4. **Aviation / Airlines / Aerospace** (14)
5. **Banking / Financial Services / Insurance** (98)
6. **Beauty / Personal Care / Fitness** (28)
7. **Construction Engineering** (22)
8. **Consulting / Professional Services** (31)
9. **Customer Support / ITES / BPO** (27)
10. **Data Science / Analytics** (20)
11. **Defense / Security Services** (12)
12. **Designing / Architecture** (18)
13. **eCommerce / Sales / Operations** (19)
14. **Education / Teaching / Training** (20)
15. **Emerging Technology** (18)
16. **Energy / Power** (24)
17. **Environment Health & Safety (EHS)** (14)
18. **Fashion / Apparel / Home Furnishing** (16)
19. **Finance / Accounting / Taxation** (27)
20. **Government / Public Administration** (21)
21. **Hardware / Networks Engineering** (15)
22. **Healthcare / Doctor / Hospitals** (38)
23. **Heavy Machinery / Equipment** (11)
24. **Hospitality / Tourism / Restaurant** (34)
25. **Human Resources Management** (29)
26. **IT / Information Security** (26)
27. **Laboratory Testing Services** (22)
28. **Law / Legal / Regulatory** (25)
29. **Logistics / Delivery / Transportation** (32)
30. **Maintenance / Facility Services** (20)
31. **Media Production / Entertainment** (44)
32. **Manufacturing / Production** (32)
33. **Mining / Quarrying** (16)
34. **Oil / Gas Resources** (17)
35. **Operations Management** (15)
36. **Product Management** (19)
37. **Project / Program Management** (21)
38. **Purchase / Supply Chain** (16)
39. **Quality Assurance (QA)** (12)
40. **Retail / Sales / Operations** (20)
41. **Research & Development (R&D)** (14)
42. **Risk Management / Compliance** (16)
43. **Sales / Business Development** (22)
44. **Shipping / Maritime** (13)
45. **Software Engineering** (26)
46. **Social Services / NGOs** (18)
47. **Strategic / Top Management** (15)
48. **Telecom / ISP** (17)
49. **UAV / UAS Technology** (17)
50. **Utility Services** (20)
51. **Other Department** (1)

**Total**: 51 departments with 1,000+ sub-departments

## Benefits

1. **Comprehensive**: Covers all major industries and job functions
2. **User-Friendly**: Searchable dropdowns with visual feedback
3. **Smart Filtering**: Sub-departments update based on selected departments
4. **No Validation Pressure**: Optional fields don't block form submission
5. **Scalable**: Easy to add more departments/sub-departments
6. **Reusable**: Can be used in multiple forms (Resume Builder, Profile, etc.)

## Admin Panel Considerations

For admin-only adding of departments/sub-departments:

### Option 1: Backend Management
Create admin routes to manage departments:
- `POST /admin/departments` - Add new department
- `POST /admin/departments/:id/sub-departments` - Add sub-department
- `PUT /admin/departments/:id` - Update department
- `DELETE /admin/departments/:id` - Delete department

### Option 2: Database-Driven
Instead of using the static `departmentsData.js` file:
1. Create Department and SubDepartment models in the database
2. Fetch departments from API on form load
3. Admin can add/edit through admin panel

```javascript
// Example API integration
useEffect(() => {
  const fetchDepartments = async () => {
    const response = await api.get('/departments');
    setDepartmentsData(response.data);
  };
  fetchDepartments();
}, []);
```

## Comparison with Industry Selection

| Feature | Industries | Departments |
|---------|-----------|-------------|
| **Max Selections** | 5 each | 6 each |
| **Required** | Yes (Industries) | No |
| **Total Options** | 54 industries | 51 departments |
| **Sub-Options** | 700+ sub-industries | 1,000+ sub-departments |
| **Location** | Step 2 - After Key Skills | Step 2 - After Sub-Industries |
| **Icon** | layers-outline / options-outline | people-outline / git-branch-outline |

## Testing

### Test Scenarios
1. ✅ Select 1-6 departments
2. ✅ Try to select more than 6 departments (should be disabled)
3. ✅ Search for departments
4. ✅ Remove a department (verify sub-departments are filtered)
5. ✅ Select sub-departments
6. ✅ Remove all departments (verify sub-departments section disappears)
7. ✅ Submit form with departments selected
8. ✅ Submit form without departments (should work - optional field)

## Troubleshooting

### Issue: Departments not showing in dropdown
**Solution**: Verify `departmentsData.js` is properly imported and `getDepartments()` is called.

### Issue: Sub-departments not updating when department is removed
**Solution**: Check the `handleInputChange` logic for departments removal (lines 1589-1602).

### Issue: Search not working
**Solution**: Ensure `departmentSearch` and `subDepartmentSearch` states are properly connected to the TextInput components.

---

**Last Updated**: October 29, 2025
**Version**: 1.0.0
**Related Files**:
- `src/data/departmentsData.js`
- `src/data/industriesData.js`
- `src/screens/Jobs/JobApplicationScreen.js`

