# Job Roles System

This document describes the comprehensive job roles system implemented in the JobWala job portal.

## Overview

The system provides 409+ specific job roles across various industries and experience levels that users can select to define their professional experience and career interests.

## Job Role Categories

### 1. **Entry Level & Fresher Roles (50+ roles)**
- Fresher
- Intern
- Junior consultant
- Junior data analyst
- Junior designer
- Junior developer
- Junior marketer
- Apprentice carpenter
- Assembly line worker
- Lab Assistant
- Helper
- Peon
- Cleaner
- Sweeper
- Servant

### 2. **Sales & Marketing (80+ roles)**
- B2B Sales, B2C Sales, D2C Sales
- Field Sales, Channel Sales, Agency Channel
- Banking Sales, Insurance Sales, Loan Sales
- FMCG Sales, Retail Sales, Store Sales
- Brand Promoter, Sales Promoter
- Business Development, Business Development Executive
- Marketing, Market Research
- Digital Payment Engineer
- Content creator, Content Writer
- SEO Specialist

### 3. **Technology & IT (60+ roles)**
- Software Developer, Android Developer, iOS Developer
- Java Developer, Python Developer, Windows Developer
- WordPress Developer
- Data Scientist, Data Entry, Data entry operator
- Network Engineer, Cybersecurity Analyst
- Technical Support, Help desk technician
- IT Recruitment, Non IT Recruitment
- MIS Executive, SAP Executive
- GIS Engineer, GIS Executive

### 4. **Healthcare & Medical (40+ roles)**
- Doctor, Medical Officer, Medical Representative
- Nurse, Nursing Staff, Medical Assistant
- Medical Lab Technician, Lab Technician, Lab Chemist
- Medical Billing, Medical Coder, Medical coordinator
- Medical Transcriptionist
- Pharmacist
- Eye Optometrist, Eye Optometrist- Fresher
- Caregiver, Ward Boy

### 5. **Banking & Finance (35+ roles)**
- Banking, Banking Operations, Banking Sales
- Accountant, Accounting, Accounts / Finance
- Accounts clerk, Accounts Executive
- CA- Chartered Accountant
- Financial Analyst, Finance Officer, Finance Sales
- Credit Card Sales, Credit Operations
- CASA Sales, Current Account Sales
- Insurance Sales, Mutual Fund Sales
- Broking Services, Advisory Services

### 6. **Engineering & Technical (50+ roles)**
- Civil Engineer, Mechanical Engineer, Electrical Engineer
- Chemical Engineer, Chemical Engineering
- Structural Engineer, Hydrocarbon Engineering
- Site Engineer, Site Supervisor
- Field technician, Field Operations
- Technician, Electrician, Fitter
- Draughtsman, Machine Operator
- Maintenance, Plant Maintenance, Plant Management
- Quality Control, Quality Engineer, Quality inspector

### 7. **Operations & Logistics (40+ roles)**
- Operations, Operations Executive
- Logistics Operations, Supply Chain, Supply Chain Analyst
- Warehouse Operations, Warehouse Executive
- Warehouse Coordinator, Warehouse associate
- Distribution, Freight, Shipping
- Courier, Delivery, Delivery Boy
- Transportation, Truck Sales
- Import / Export, Import / Export Executive

### 8. **Administrative & Support (30+ roles)**
- Admin, Admin Executive
- Executive Assistant, Receptionist
- Front desk staff, Front Office
- Clerk, Stock clerk, Stock Maintaining
- Store keeper, Store Operations
- Support staff, Helper
- Peon, Cleaner, Sweeper

### 9. **Management & Leadership (25+ roles)**
- Director, Country Head, Zonal Head
- Business Head, Aea Head
- Branch Manager, Hotel Manager, Restaurant Manager
- Team Leader, Supervisor
- HR Manager, HR Head, HR Generalist
- Sales Manager, Operations Executive

### 10. **Specialized Services (50+ roles)**
- Security, Security Guard, Security Officer
- Fire / Safety Manager, Fire / Safety Officer
- Event planner, Wedding Planner
- Graphic Designer, Illustrator
- Teacher, Teaching assistant, Tutor
- Chef, Cook, Waiter
- Driver, Auto Driver, Bus Driver, Taxi Driver
- Carpenter, Plumber, Electrician

## Database Schema

### CustomField Document Structure

```javascript
{
  fieldId: "jobRoles",
  name: "jobRoles",
  label: "Job Roles",
  fieldType: "multiselect",
  options: [
    {
      value: "Fresher",
      label: "Fresher",
      order: 0
    },
    {
      value: "Software Developer",
      label: "Software Developer",
      order: 1
    }
    // ... 409+ more job roles
  ],
  validation: {
    required: false,
    max: 10
  },
  styling: {
    placeholder: "Job Roles (Show 10 to 12 Suggestion Also)"
  },
  placement: {
    section: "jobseeker_profile",
    order: 20,
    group: "experience"
  },
  status: "active",
  createdBy: ObjectId
}
```

## API Integration

### Get Experience Fields
```
GET /api/custom-fields/experience
```

**Response includes job roles field:**
```json
{
  "success": true,
  "data": {
    "fields": [
      {
        "id": "jobRoles",
        "name": "jobRoles",
        "label": "Job Roles",
        "type": "multiselect",
        "required": false,
        "placeholder": "Job Roles (Show 10 to 12 Suggestion Also)",
        "options": [...],
        "validation": {
          "required": false,
          "max": 10
        },
        "order": 20
      }
    ]
  }
}
```

## React Native Integration

### ExperienceForm Component

The job roles field is automatically included in the ExperienceForm component:

```javascript
// The field is rendered as a multiselect with:
// - Up to 10 selections allowed
// - Search and filter functionality
// - Visual selection indicators
// - Real-time validation
```

### Usage Example

```javascript
import { customFieldsAPI } from '../services/api';

// Load experience fields including job roles
const loadExperienceFields = async () => {
  try {
    const response = await customFieldsAPI.getExperienceFields();
    const fields = response.data.data.fields;
    
    // Find job roles field
    const jobRolesField = fields.find(field => field.id === 'jobRoles');
    
    if (jobRolesField) {
      // Render job roles multiselect
      renderJobRolesField(jobRolesField);
    }
  } catch (error) {
    console.error('Error loading experience fields:', error);
  }
};
```

## Features

### For Users
- **Comprehensive Selection**: 409+ specific job roles
- **Multi-Selection**: Up to 10 job roles can be selected
- **Search & Filter**: Easy to find specific roles
- **Category Organization**: Roles grouped by industry and function
- **Visual Feedback**: Clear selection indicators and counters
- **Validation**: Real-time validation with helpful error messages

### For Admins
- **Easy Management**: All job roles managed through database seeding
- **Flexible Updates**: Easy to add new roles or modify existing ones
- **Comprehensive Coverage**: Covers all major industries and functions
- **Scalable System**: Easy to expand with new role categories

## Seeding Scripts

### Individual Script
```bash
# Seed job roles only
npm run seed:roles
```

### Comprehensive Script
```bash
# Seed all data including job roles
npm run seed
```

### Data File
- `server/seed-job-roles.js` - Main job roles seeding script

## Customization

### Adding New Job Roles
1. Edit `server/seed-job-roles.js`
2. Add new roles to the `jobRoles` array
3. Run `npm run seed:roles`

### Example: Adding New Job Role
```javascript
const jobRoles = [
  // ... existing job roles
  'New Job Role',
  'Another Specific Role',
  'Specialized Position'
];
```

### Modifying Field Properties
1. Edit the field configuration in `createJobRolesField()`
2. Modify validation rules, styling, or placement
3. Run the seeding script to update the database

## Benefits

1. **Precise Matching**: Users can specify exact roles they've worked in
2. **Better Job Matching**: Employers can find candidates with specific role experience
3. **Career Progression**: Shows career growth and role transitions
4. **Industry Recognition**: Covers roles from all major industries
5. **Comprehensive Coverage**: Includes roles from entry-level to executive level
6. **User-Friendly**: Intuitive selection process with smart filtering

## Technical Implementation

- **Backend**: Node.js/Express with MongoDB
- **Frontend**: React Native with dynamic form rendering
- **API**: RESTful endpoints with proper error handling
- **Database**: MongoDB with optimized queries and indexing
- **Validation**: Client-side and server-side validation
- **Performance**: Efficient data loading and caching strategies

## Statistics

- **Total Job Roles**: 409+
- **Categories**: 10 major professional categories
- **Selection Limit**: Up to 10 roles per user
- **Coverage**: All major industries and experience levels
- **Update Frequency**: On-demand through seeding scripts

## Role Categories Breakdown

1. **Entry Level & Fresher**: 50+ roles
2. **Sales & Marketing**: 80+ roles
3. **Technology & IT**: 60+ roles
4. **Healthcare & Medical**: 40+ roles
5. **Banking & Finance**: 35+ roles
6. **Engineering & Technical**: 50+ roles
7. **Operations & Logistics**: 40+ roles
8. **Administrative & Support**: 30+ roles
9. **Management & Leadership**: 25+ roles
10. **Specialized Services**: 50+ roles

This comprehensive job roles system enhances the job portal's functionality by allowing users to specify their exact professional experience and enabling better job matching based on specific role requirements and experience.
