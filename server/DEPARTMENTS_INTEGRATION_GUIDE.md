# Departments Integration Guide

This guide explains how to use the comprehensive departments system in your Job Portal application.

## Overview

The departments system provides a complete categorization of job departments with their subcategories. It includes 51 main departments with over 1,000 subcategories covering all major industries and job functions.

## Database Structure

### Department Model
```javascript
{
  name: String,           // Department name (e.g., "IT / Information Security")
  subcategories: [String], // Array of subcategories
  isActive: Boolean,      // Whether department is active
  createdBy: ObjectId,    // User who created the department
  updatedBy: ObjectId,    // User who last updated
  createdAt: Date,        // Creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

## API Endpoints

### 1. Get All Departments
```
GET /api/departments
```
Returns all departments with their subcategories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "IT / Information Security",
      "subcategories": [
        "IT Infrastructure Services",
        "IT Security",
        "Information Security (InfoSec)",
        // ... more subcategories
      ]
    }
    // ... more departments
  ],
  "message": "Departments retrieved successfully"
}
```

### 2. Get Department Categories Only
```
GET /api/departments/categories
```
Returns only the department names without subcategories.

**Response:**
```json
{
  "success": true,
  "data": [
    "Administration / Back Office",
    "Advertising / Digital Marketing",
    "Agriculture / Forestry / Fishing",
    // ... more categories
  ],
  "message": "Department categories retrieved successfully"
}
```

### 3. Get Subcategories for Specific Department
```
GET /api/departments/{departmentName}/subcategories
```
Returns subcategories for a specific department.

**Example:** `GET /api/departments/IT%20%2F%20Information%20Security/subcategories`

**Response:**
```json
{
  "success": true,
  "data": {
    "department": "IT / Information Security",
    "subcategories": [
      "IT Infrastructure Services",
      "IT Security",
      "Information Security (InfoSec)",
      // ... more subcategories
    ]
  },
  "message": "Subcategories retrieved successfully"
}
```

### 4. Get Specific Department Details
```
GET /api/departments/{departmentName}
```
Returns complete details for a specific department.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "IT / Information Security",
    "subcategories": [
      "IT Infrastructure Services",
      "IT Security",
      // ... more subcategories
    ]
  },
  "message": "Department retrieved successfully"
}
```

## Frontend Integration

### 1. Include Required Files

Add these files to your HTML pages:

```html
<!-- CSS for styling -->
<link rel="stylesheet" href="css/departments.css">

<!-- JavaScript helper -->
<script src="js/departments-helper.js"></script>
```

### 2. Basic Usage Examples

#### Simple Dropdown
```javascript
// Create a basic department dropdown
DepartmentsHelper.createDepartmentDropdown('department-select', {
    placeholder: 'Select Department',
    onSelect: function(value) {
        console.log('Selected department:', value);
        // Handle selection
    }
});
```

#### Dropdown with Subcategories
```javascript
// Create dropdown that includes subcategories
DepartmentsHelper.createDepartmentDropdown('department-select', {
    placeholder: 'Select Department/Subcategory',
    includeSubcategories: true,
    onSelect: function(value) {
        console.log('Selected:', value);
        // Handle selection
    }
});
```

#### Hierarchical Tree View
```javascript
// Create collapsible tree structure
DepartmentsHelper.createDepartmentTree('department-tree', {
    showSubcategories: true,
    collapsible: true,
    onSelect: function(department, subcategories) {
        console.log('Department:', department);
        console.log('Subcategories:', subcategories);
    }
});
```

#### Searchable Department List
```javascript
// Create searchable list
DepartmentsHelper.createSearchableDepartmentList('searchable-departments', {
    placeholder: 'Search departments...',
    includeSubcategories: true,
    onSelect: function(department, subcategories) {
        console.log('Selected:', department);
    }
});
```

### 3. Direct API Usage

```javascript
// Get all departments
DepartmentsHelper.getAllDepartments().then(departments => {
    console.log('All departments:', departments);
});

// Get only categories
DepartmentsHelper.getCategories().then(categories => {
    console.log('Categories:', categories);
});

// Get subcategories for specific department
DepartmentsHelper.getSubcategories('IT / Information Security').then(subcategories => {
    console.log('IT subcategories:', subcategories);
});
```

## Integration in Forms

### Job Posting Form
```html
<div class="form-group">
    <label for="job-department">Department:</label>
    <div id="job-department"></div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    DepartmentsHelper.createDepartmentDropdown('job-department', {
        placeholder: 'Select Department',
        includeSubcategories: true,
        onSelect: function(value) {
            document.getElementById('selected-department').value = value;
        }
    });
});
</script>
```

### User Profile Form
```html
<div class="form-group">
    <label for="user-department">Current Department:</label>
    <div id="user-department"></div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    DepartmentsHelper.createDepartmentDropdown('user-department', {
        placeholder: 'Select your department',
        onSelect: function(value) {
            // Update user profile
            updateUserProfile('department', value);
        }
    });
});
</script>
```

### Job Search Filters
```html
<div class="filter-section">
    <h4>Department Filter</h4>
    <div id="department-filter"></div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    DepartmentsHelper.createSearchableDepartmentList('department-filter', {
        placeholder: 'Search departments...',
        includeSubcategories: true,
        onSelect: function(department, subcategories) {
            // Apply filter
            applyDepartmentFilter(department);
        }
    });
});
</script>
```

## Available Departments

The system includes 51 comprehensive departments:

1. **Administration / Back Office** (12 subcategories)
2. **Advertising / Digital Marketing** (19 subcategories)
3. **Agriculture / Forestry / Fishing** (42 subcategories)
4. **Aviation / Airlines / Aerospace** (15 subcategories)
5. **Banking / Financial Services / Insurance** (88 subcategories)
6. **Beauty / Personal Care / Fitness** (29 subcategories)
7. **Construction Engineering** (23 subcategories)
8. **Consulting / Professional Services** (25 subcategories)
9. **Customer Support / ITES / BPO** (36 subcategories)
10. **Data Science / Analytics** (19 subcategories)
11. **Defense / Security Services** (14 subcategories)
12. **Designing / Architecture** (10 subcategories)
13. **eCommerce / Sales / Operations** (23 subcategories)
14. **Education / Teaching / Training** (18 subcategories)
15. **Emerging Technology** (19 subcategories)
16. **Energy / Power** (19 subcategories)
17. **Environment Health & Safety (EHS)** (15 subcategories)
18. **Fashion / Apparel / Home Furnishing** (17 subcategories)
19. **Finance / Accounting / Taxation** (11 subcategories)
20. **Government / Public Administration** (19 subcategories)
21. **Hardware / Networks Engineering** (16 subcategories)
22. **Healthcare / Doctor / Hospitals** (37 subcategories)
23. **Heavy Machinery / Equipment** (12 subcategories)
24. **Hospitality / Tourism / Restaurant** (38 subcategories)
25. **Human Resources Management** (45 subcategories)
26. **IT / Information Security** (26 subcategories)
27. **Laboratory Testing Services** (22 subcategories)
28. **Law / Legal / Regulatory** (23 subcategories)
29. **Logistics / Delivery / Transportation** (32 subcategories)
30. **Maintenance / Facility Services** (21 subcategories)
31. **Media Production / Entertainment** (49 subcategories)
32. **Manufacturing / Production** (33 subcategories)
33. **Mining / Quarrying** (33 subcategories)
34. **Oil / Gas Resourses** (14 subcategories)
35. **Operations Management** (8 subcategories)
36. **Product Management** (14 subcategories)
37. **Project / Program Management** (12 subcategories)
38. **Purchase / Supply Chain** (14 subcategories)
39. **Quality Assurance (QA)** (15 subcategories)
40. **Retail / Sales / Operations** (14 subcategories)
41. **Research & Development (R&D)** (13 subcategories)
42. **Risk Management / Compliance** (10 subcategories)
43. **Sales / Business Development** (21 subcategories)
44. **Shipping / Maritime** (11 subcategories)
45. **Software Engineering** (27 subcategories)
46. **Social Services / NGOs** (17 subcategories)
47. **Strategic / Top Management** (17 subcategories)
48. **Telecom / ISP** (17 subcategories)
49. **UAV / UAS Technology** (18 subcategories)
50. **Utility Services** (18 subcategories)
51. **Other Department** (1 subcategory)

## Caching

The DepartmentsHelper includes built-in caching to improve performance:
- Data is cached for 5 minutes by default
- Cache can be cleared using `DepartmentsHelper.clearCache()`
- Cache is automatically invalidated after the timeout period

## Error Handling

All API calls include proper error handling:
- Network errors are caught and logged
- Invalid responses are handled gracefully
- User-friendly error messages are displayed

## Demo

Visit `/departments-demo.html` to see all features in action with live examples.

## Support

For questions or issues with the departments system, refer to the demo page or check the browser console for detailed error messages.
