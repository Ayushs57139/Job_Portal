# Database Seeding Guide

This guide explains how to seed the JobWala database with comprehensive experience-related data.

## Overview

The seeding system provides a complete set of data for the job portal including:
- **Experience Fields**: 20+ custom fields for work experience
- **Key Skills**: 1,035+ technical and soft skills
- **Job Titles**: 234+ common job titles and designations
- **Industries**: 307+ industry sectors and domains

## Available Scripts

### Seed All Data
```bash
npm run seed
```
Runs all seeding scripts in sequence.

### Individual Seeding Scripts

#### Experience Fields
```bash
npm run seed:experience
```
Seeds all experience-related custom fields including:
- Present Job Status
- Experience Level
- Total Experience (1 Month to 36 Years Plus)
- Company Type
- Employment Type
- Job Type & Mode
- Job Shift Type
- Notice Period
- And more...

#### Key Skills
```bash
npm run seed:skills
```
Seeds 1,035+ key skills including:
- Technical Skills (Programming, Software, Tools)
- Soft Skills (Communication, Leadership, Management)
- Industry-Specific Skills
- Professional Skills

#### Job Titles
```bash
npm run seed:titles
```
Seeds 234+ job titles including:
- Software Engineering roles
- Management positions
- Sales & Marketing roles
- Healthcare positions
- Finance & Banking roles
- And many more...

#### Industries
```bash
npm run seed:industries
```
Seeds 307+ industry sectors including:
- Information Technology
- Healthcare & Pharmaceuticals
- Banking & Financial Services
- Manufacturing
- Retail & E-commerce
- And many more...

## Data Structure

### Experience Fields
Each experience field is stored as a CustomField document with:
- `fieldId`: Unique identifier
- `name`: Field name
- `label`: Display label
- `fieldType`: Type (text, select, multiselect, textarea, date)
- `options`: Available options for select/multiselect fields
- `validation`: Validation rules (required, max length, etc.)
- `placement`: Where the field appears in the UI

### Key Skills
Skills are stored as options in the `keySkills` field:
- Each skill has a `value` and `label`
- Users can select up to 12 skills
- Skills are categorized and searchable
- Supports both selection and custom input

### Job Titles
Job titles are stored as options in the `jobTitle` field:
- Comprehensive list of common job titles
- Supports both selection and custom input
- Covers all major industries and levels

### Industries
Industries are stored as options in the `industrySectors` field:
- Users can select up to 5 industries
- Covers all major industry sectors
- Supports both selection and custom input

## Usage in React Native App

The seeded data is automatically available through the API:

```javascript
// Fetch experience fields
const response = await customFieldsAPI.getExperienceFields();
const fields = response.data.data.fields;

// Use in ExperienceForm component
<ExperienceForm onSave={handleSave} initialData={userData} />
```

## Customization

### Adding New Skills
1. Edit `server/seed-key-skills.js`
2. Add new skills to the `keySkills` array
3. Run `npm run seed:skills`

### Adding New Job Titles
1. Edit `server/seed-job-titles.js`
2. Add new titles to the `jobTitles` array
3. Run `npm run seed:titles`

### Adding New Industries
1. Edit `server/seed-industries.js`
2. Add new industries to the `industries` array
3. Run `npm run seed:industries`

### Modifying Experience Fields
1. Edit `server/seed-experience-data.js`
2. Modify the field definitions
3. Run `npm run seed:experience`

## Database Schema

All data is stored in the `customfields` collection with the following structure:

```javascript
{
  fieldId: String,           // Unique identifier
  name: String,              // Field name
  label: String,             // Display label
  fieldType: String,         // Field type
  options: [{                // Available options
    value: String,
    label: String,
    order: Number
  }],
  validation: {              // Validation rules
    required: Boolean,
    maxLength: Number,
    max: Number
  },
  placement: {               // UI placement
    section: String,
    order: Number,
    group: String
  },
  status: String,            // active/inactive/draft
  createdBy: ObjectId        // Admin user ID
}
```

## Troubleshooting

### Common Issues

1. **Duplicate Index Warning**
   - This is a Mongoose warning and doesn't affect functionality
   - Can be safely ignored

2. **Connection Issues**
   - Ensure MongoDB is running
   - Check connection string in environment variables

3. **Permission Issues**
   - Ensure the database user has write permissions
   - Check MongoDB user roles

### Reset Data

To reset all seeded data:
```bash
# Drop the customfields collection
mongo jobwala --eval "db.customfields.drop()"

# Re-seed all data
npm run seed
```

## API Endpoints

The seeded data is accessible through these API endpoints:

- `GET /api/custom-fields/experience` - Get all experience fields
- `GET /api/custom-fields` - Get all custom fields (admin only)
- `POST /api/custom-fields` - Create new custom field (admin only)
- `PUT /api/custom-fields/:id` - Update custom field (admin only)
- `DELETE /api/custom-fields/:id` - Delete custom field (admin only)

## Support

For issues or questions about the seeding system:
1. Check the console output for error messages
2. Verify MongoDB connection
3. Check database permissions
4. Review the field definitions in the seeding scripts
