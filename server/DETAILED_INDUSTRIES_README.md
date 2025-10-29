# Detailed Industries & Sub-Industries System

This document describes the comprehensive industry classification system implemented in the JobWala job portal.

## Overview

The system provides a two-level industry classification:
- **Main Industries**: 49 primary industry categories
- **Sub-Industries**: 669+ specific sub-categories under each main industry

## Industry Structure

### Main Industries (49 Categories)

1. **Accounting / Auditing / Taxation** (15 sub-industries)
2. **Agriculture / Farming / Fishing / Forestry** (21 sub-industries)
3. **Airlines / Aviation** (4 sub-industries)
4. **Automobiles / Auto-Components** (8 sub-industries)
5. **BFSI** (17 sub-industries)
6. **Beauty / Fitness / Wellness** (9 sub-industries)
7. **Building Materials** (7 sub-industries)
8. **Chemicals / Pesticides** (11 sub-industries)
9. **Design** (10 sub-industries)
10. **eCommerce / eStore** (36 sub-industries)
11. **Education / EdTech** (8 sub-industries)
12. **Eye Care / Eyewear** (6 sub-industries)
13. **Emerging Technology (ET)** (13 sub-industries)
14. **FMCG** (10 sub-industries)
15. **FMCD** (5 sub-industries)
16. **FMEG** (14 sub-industries)
17. **FinTech / ePayments** (6 sub-industries)
18. **Government / Public Administration** (19 sub-industries)
19. **Health Care / Hospitals / Lifescience** (18 sub-industries)
20. **Heavy Machinery / Equipment** (6 sub-industries)
21. **Hospitality / Travel / Tourism** (24 sub-industries)
22. **HR / Recruitment / Staffing** (19 sub-industries)
23. **ITES / BPO / BPM** (19 sub-industries)
24. **Information Technology (IT)** (21 sub-industries)
25. **Infrastructure / Construction** (13 sub-industries)
26. **Legal / Regulatory** (19 sub-industries)
27. **Laboratory Testing Services** (22 sub-industries)
28. **Logistics / Transportation** (26 sub-industries)
29. **Manufacturing / Production** (28 sub-industries)
30. **Media / Entertainment / Advertising** (32 sub-industries)
31. **Metals / Mining / Quarrying** (12 sub-industries)
32. **NGO / Social Services** (13 sub-industries)
33. **Oil / Gas** (6 sub-industries)
34. **Power / Energy** (10 sub-industries)
35. **Professional Services / Consulting** (24 sub-industries)
36. **Real Estate / Facility Management** (8 sub-industries)
37. **Research / Development (R&D)** (10 sub-industries)
38. **Retail / Wholesale / Consumer Goods** (27 sub-industries)
39. **Sales / Marketing** (11 sub-industries)
40. **Security / Defense** (5 sub-industries)
41. **Shipping / Ports** (8 sub-industries)
42. **Startups / Unicorn** (9 sub-industries)
43. **Telecom / ISP** (16 sub-industries)
44. **Textile / Handicraft / Fashion** (11 sub-industries)
45. **Tobacco Products** (6 sub-industries)
46. **UAV / UAS** (17 sub-industries)
47. **US IT** (3 sub-industries)
48. **Utility Services** (7 sub-industries)
49. **Other Industry** (0 sub-industries)

## API Endpoints

### Get Sub-Industries
```
GET /api/custom-fields/sub-industries/:industry
```

**Parameters:**
- `industry` (string): URL-encoded main industry name

**Response:**
```json
{
  "success": true,
  "data": {
    "subIndustries": [
      {
        "value": "Accounting / Auditing",
        "label": "Accounting / Auditing",
        "order": 0
      },
      {
        "value": "Cost Accounting",
        "label": "Cost Accounting",
        "order": 1
      }
    ]
  }
}
```

### Get Experience Fields
```
GET /api/custom-fields/experience
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fields": [
      {
        "id": "detailedIndustries",
        "name": "detailedIndustries",
        "label": "Industry / Sectors",
        "type": "multiselect",
        "required": false,
        "placeholder": "Select Existing Suggestion / Add New Options By Admin Only",
        "options": [...],
        "validation": {
          "required": false,
          "max": 5
        },
        "order": 17
      }
    ]
  }
}
```

## React Native Integration

### ExperienceForm Component

The `ExperienceForm` component automatically handles the industry selection flow:

1. **Main Industry Selection**: User selects from 49 main industries
2. **Sub-Industry Loading**: Automatically loads relevant sub-industries
3. **Sub-Industry Selection**: User can select up to 5 sub-industries
4. **Dynamic Updates**: Sub-industries update when main industry changes

### Usage Example

```javascript
import { customFieldsAPI } from '../services/api';

// Load sub-industries for a specific main industry
const loadSubIndustries = async (industry) => {
  try {
    const response = await customFieldsAPI.getSubIndustries(industry);
    const subIndustries = response.data.data.subIndustries;
    // Update UI with sub-industries
  } catch (error) {
    console.error('Error loading sub-industries:', error);
  }
};

// Load all experience fields
const loadExperienceFields = async () => {
  try {
    const response = await customFieldsAPI.getExperienceFields();
    const fields = response.data.data.fields;
    // Render form fields
  } catch (error) {
    console.error('Error loading experience fields:', error);
  }
};
```

## Database Schema

### CustomField Document Structure

```javascript
{
  fieldId: "detailedIndustries",
  name: "detailedIndustries",
  label: "Industry / Sectors",
  fieldType: "multiselect",
  options: [
    {
      value: "Accounting / Auditing / Taxation",
      label: "Accounting / Auditing / Taxation",
      order: 0,
      subIndustries: [
        "Accounting / Auditing",
        "Cost Accounting",
        "Domestic / International Taxation",
        // ... more sub-industries
      ]
    }
  ],
  validation: {
    required: false,
    max: 5
  },
  placement: {
    section: "jobseeker_profile",
    order: 17,
    group: "experience"
  },
  status: "active",
  createdBy: ObjectId
}
```

## Features

### For Users
- **Intuitive Selection**: Easy-to-use dropdown and multi-select interfaces
- **Smart Filtering**: Sub-industries automatically filter based on main industry
- **Selection Limits**: Maximum 5 sub-industries to prevent overwhelming choices
- **Real-time Updates**: Sub-industries update instantly when main industry changes
- **Search & Filter**: Easy to find specific industries and sub-industries

### For Admins
- **Comprehensive Coverage**: 49 main industries covering all major sectors
- **Detailed Classification**: 669+ sub-industries for precise categorization
- **Easy Management**: All data managed through database seeding scripts
- **Flexible Updates**: Easy to add new industries or modify existing ones

## Seeding Scripts

### Individual Scripts
```bash
# Seed detailed industries only
npm run seed:detailed-industries

# Seed all data including detailed industries
npm run seed
```

### Data Files
- `server/seed-detailed-industries.js` - Main seeding script
- `server/seed-all-data.js` - Comprehensive seeding script

## Customization

### Adding New Industries
1. Edit `server/seed-detailed-industries.js`
2. Add new industry to `detailedIndustries` object
3. Run `npm run seed:detailed-industries`

### Modifying Sub-Industries
1. Edit the `detailedIndustries` object in the seeding script
2. Add or remove sub-industries as needed
3. Run the seeding script to update the database

### Example: Adding New Industry
```javascript
const detailedIndustries = {
  // ... existing industries
  'New Industry': [
    'Sub-Industry 1',
    'Sub-Industry 2',
    'Sub-Industry 3'
  ]
};
```

## Benefits

1. **Comprehensive Coverage**: Covers all major industry sectors
2. **Precise Classification**: Detailed sub-industries for accurate job matching
3. **User-Friendly**: Intuitive selection process with smart filtering
4. **Admin-Friendly**: Easy to manage and update through seeding scripts
5. **Scalable**: Easy to add new industries and sub-industries
6. **API-Driven**: RESTful API for easy integration with any frontend

## Technical Implementation

- **Backend**: Node.js/Express with MongoDB
- **Frontend**: React Native with dynamic form rendering
- **API**: RESTful endpoints with proper error handling
- **Database**: MongoDB with optimized queries and indexing
- **Validation**: Client-side and server-side validation
- **Performance**: Efficient data loading and caching strategies

This system provides a robust foundation for industry classification in your job portal, ensuring accurate job matching and improved user experience.
