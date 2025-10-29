const mongoose = require('mongoose');
const CustomField = require('./models/CustomField');

// Experience-related data seeding script
const experienceData = {
  // Present Job Status
  presentJobStatus: [
    { value: 'Working', label: 'Working' },
    { value: 'Not Working', label: 'Not Working' }
  ],

  // Experience Level
  experienceLevel: [
    { value: 'Fresher', label: 'Fresher' },
    { value: 'Experienced', label: 'Experienced' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Apprenticeship', label: 'Apprenticeship' }
  ],

  // Total Experience
  totalExperience: [
    { value: 'Fresher', label: 'Fresher' },
    { value: '1 Month', label: '1 Month' },
    { value: '2 Months', label: '2 Months' },
    { value: '3 Months', label: '3 Months' },
    { value: '6 Months', label: '6 Months' },
    { value: '9 Months', label: '9 Months' },
    { value: '1 Year', label: '1 Year' },
    { value: '1.5 Years', label: '1.5 Years' },
    { value: '2 Years', label: '2 Years' },
    { value: '2.5 Years', label: '2.5 Years' },
    { value: '3 Years', label: '3 Years' },
    { value: '3.5 Years', label: '3.5 Years' },
    { value: '4 Years', label: '4 Years' },
    { value: '4.5 Years', label: '4.5 Years' },
    { value: '5 Years', label: '5 Years' },
    { value: '5.5 Years', label: '5.5 Years' },
    { value: '6 Years', label: '6 Years' },
    { value: '6.5 Years', label: '6.5 Years' },
    { value: '7 Years', label: '7 Years' },
    { value: '7.5 Years', label: '7.5 Years' },
    { value: '8 Years', label: '8 Years' },
    { value: '8.5 Years', label: '8.5 Years' },
    { value: '9 Years', label: '9 Years' },
    { value: '9.5 Years', label: '9.5 Years' },
    { value: '10 Years', label: '10 Years' },
    { value: '10.5 Years', label: '10.5 Years' },
    { value: '11 Years', label: '11 Years' },
    { value: '11.5 Years', label: '11.5 Years' },
    { value: '12 Years', label: '12 Years' },
    { value: '12.5 Years', label: '12.5 Years' },
    { value: '13 Years', label: '13 Years' },
    { value: '13.5 Years', label: '13.5 Years' },
    { value: '14 Years', label: '14 Years' },
    { value: '14.5 Years', label: '14.5 Years' },
    { value: '15 Years', label: '15 Years' },
    { value: '15.5 Years', label: '15.5 Years' },
    { value: '16 Years', label: '16 Years' },
    { value: '16.5 Years', label: '16.5 Years' },
    { value: '17 Years', label: '17 Years' },
    { value: '17.5 Years', label: '17.5 Years' },
    { value: '18 Years', label: '18 Years' },
    { value: '18.5 Years', label: '18.5 Years' },
    { value: '19 Years', label: '19 Years' },
    { value: '19.5 Years', label: '19.5 Years' },
    { value: '20 Years', label: '20 Years' },
    { value: '20.5 Years', label: '20.5 Years' },
    { value: '21 Years', label: '21 Years' },
    { value: '21.5 Years', label: '21.5 Years' },
    { value: '22 Years', label: '22 Years' },
    { value: '22.5 Years', label: '22.5 Years' },
    { value: '23 Years', label: '23 Years' },
    { value: '23.5 Years', label: '23.5 Years' },
    { value: '24 Years', label: '24 Years' },
    { value: '24.5 Years', label: '24.5 Years' },
    { value: '25 Years', label: '25 Years' },
    { value: '25.5 Years', label: '25.5 Years' },
    { value: '26 Years', label: '26 Years' },
    { value: '26.5 Years', label: '26.5 Years' },
    { value: '27 Years', label: '27 Years' },
    { value: '27.5 Years', label: '27.5 Years' },
    { value: '28 Years', label: '28 Years' },
    { value: '28.5 Years', label: '28.5 Years' },
    { value: '29 Years', label: '29 Years' },
    { value: '29.5 Years', label: '29.5 Years' },
    { value: '30 Years', label: '30 Years' },
    { value: '30.5 Years', label: '30.5 Years' },
    { value: '31 Years', label: '31 Years' },
    { value: '31.5 Years', label: '31.5 Years' },
    { value: '32 Years', label: '32 Years' },
    { value: '32.5 Years', label: '32.5 Years' },
    { value: '33 Years', label: '33 Years' },
    { value: '33.5 Years', label: '33.5 Years' },
    { value: '34 Years', label: '34 Years' },
    { value: '34.5 Years', label: '34.5 Years' },
    { value: '35 Years', label: '35 Years' },
    { value: '35.5 Years', label: '35.5 Years' },
    { value: '36 Years', label: '36 Years' },
    { value: '36 Years Plus', label: '36 Years Plus' }
  ],

  // Company Type
  companyType: [
    { value: 'Indian MNC', label: 'Indian MNC' },
    { value: 'Foreign MNC', label: 'Foreign MNC' },
    { value: 'Govt / PSU', label: 'Govt / PSU' },
    { value: 'Startup', label: 'Startup' },
    { value: 'Unicorn', label: 'Unicorn' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Consultancy', label: 'Consultancy' }
  ],

  // Employment Type
  employmentType: [
    { value: 'Permanent', label: 'Permanent' },
    { value: 'Temporary/Contract Job', label: 'Temporary/Contract Job' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Apprenticeship', label: 'Apprenticeship' },
    { value: 'NAPS', label: 'NAPS' },
    { value: 'Freelance', label: 'Freelance' },
    { value: 'Trainee', label: 'Trainee' },
    { value: 'Fresher', label: 'Fresher' }
  ],

  // Job Type
  jobType: [
    { value: 'Full Time', label: 'Full Time' },
    { value: 'Part Time', label: 'Part Time' }
  ],

  // Job Mode Type
  jobModeType: [
    { value: 'Work From Home', label: 'Work From Home' },
    { value: 'Work From Office', label: 'Work From Office' },
    { value: 'Work From Field', label: 'Work From Field' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Remote', label: 'Remote' }
  ],

  // Job Shift Type
  jobShiftType: [
    { value: 'Day Shift', label: 'Day Shift' },
    { value: 'Night Shift', label: 'Night Shift' },
    { value: 'Rotational Shift', label: 'Rotational Shift' },
    { value: 'Split Shift', label: 'Split Shift' }
  ],

  // Currently Working
  currentlyWorking: [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ],

  // Notice Period
  noticePeriod: [
    { value: 'Immediate Joining', label: 'Immediate Joining' },
    { value: '7 Days', label: '7 Days' },
    { value: '15 Days', label: '15 Days' },
    { value: '30 Days', label: '30 Days' },
    { value: '45 Days', label: '45 Days' },
    { value: '60 Days', label: '60 Days' },
    { value: '90 Days', label: '90 Days' },
    { value: '90 Days Plus', label: '90 Days Plus' },
    { value: 'Serving Notice Period', label: 'Serving Notice Period' }
  ]
};

// Function to create custom fields
async function createCustomFields() {
  try {
    console.log('Starting to seed experience data...');

    // Create a dummy admin user ID for createdBy field
    const adminUserId = new mongoose.Types.ObjectId();

    // Present Job Status
    await CustomField.findOneAndUpdate(
      { fieldId: 'presentJobStatus' },
      {
        fieldId: 'presentJobStatus',
        name: 'presentJobStatus',
        label: 'Present Job Status',
        fieldType: 'select',
        options: experienceData.presentJobStatus,
        validation: { required: true },
        placement: { section: 'jobseeker_profile', order: 1, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Experience Level
    await CustomField.findOneAndUpdate(
      { fieldId: 'experienceLevel' },
      {
        fieldId: 'experienceLevel',
        name: 'experienceLevel',
        label: 'Experience Level',
        fieldType: 'select',
        options: experienceData.experienceLevel,
        validation: { required: true },
        placement: { section: 'jobseeker_profile', order: 2, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Total Experience
    await CustomField.findOneAndUpdate(
      { fieldId: 'totalExperience' },
      {
        fieldId: 'totalExperience',
        name: 'totalExperience',
        label: 'Total Experience',
        fieldType: 'select',
        options: experienceData.totalExperience,
        validation: { required: true },
        placement: { section: 'jobseeker_profile', order: 3, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Company Type
    await CustomField.findOneAndUpdate(
      { fieldId: 'companyType' },
      {
        fieldId: 'companyType',
        name: 'companyType',
        label: 'Company Type',
        fieldType: 'select',
        options: experienceData.companyType,
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 4, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Employment Type
    await CustomField.findOneAndUpdate(
      { fieldId: 'employmentType' },
      {
        fieldId: 'employmentType',
        name: 'employmentType',
        label: 'Employment Type',
        fieldType: 'select',
        options: experienceData.employmentType,
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 5, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Job Type
    await CustomField.findOneAndUpdate(
      { fieldId: 'jobType' },
      {
        fieldId: 'jobType',
        name: 'jobType',
        label: 'Job Type',
        fieldType: 'select',
        options: experienceData.jobType,
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 6, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Job Mode Type
    await CustomField.findOneAndUpdate(
      { fieldId: 'jobModeType' },
      {
        fieldId: 'jobModeType',
        name: 'jobModeType',
        label: 'Job Mode Type',
        fieldType: 'select',
        options: experienceData.jobModeType,
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 7, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Job Shift Type
    await CustomField.findOneAndUpdate(
      { fieldId: 'jobShiftType' },
      {
        fieldId: 'jobShiftType',
        name: 'jobShiftType',
        label: 'Job Shift Type',
        fieldType: 'select',
        options: experienceData.jobShiftType,
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 8, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Currently Working
    await CustomField.findOneAndUpdate(
      { fieldId: 'currentlyWorking' },
      {
        fieldId: 'currentlyWorking',
        name: 'currentlyWorking',
        label: 'Currently working in this company?',
        fieldType: 'select',
        options: experienceData.currentlyWorking,
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 9, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Notice Period
    await CustomField.findOneAndUpdate(
      { fieldId: 'noticePeriod' },
      {
        fieldId: 'noticePeriod',
        name: 'noticePeriod',
        label: 'Notice Period / Availability to Join',
        fieldType: 'select',
        options: experienceData.noticePeriod,
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 10, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Job Title/Designation (Text field with suggestions)
    await CustomField.findOneAndUpdate(
      { fieldId: 'jobTitle' },
      {
        fieldId: 'jobTitle',
        name: 'jobTitle',
        label: 'Job Title / Designation',
        fieldType: 'text',
        styling: { placeholder: 'Type or Select Existing Suggestion / Enable Add New Options By Admin & User' },
        validation: { required: true },
        placement: { section: 'jobseeker_profile', order: 11, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Key Skills (Multiple selection with suggestions)
    await CustomField.findOneAndUpdate(
      { fieldId: 'keySkills' },
      {
        fieldId: 'keySkills',
        name: 'keySkills',
        label: 'Key Skills Name',
        fieldType: 'multiselect',
        styling: { placeholder: 'Key Skills Name (Show 10 to 12 Suggestion Also)' },
        validation: { required: true, max: 12 },
        placement: { section: 'jobseeker_profile', order: 12, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Job Profile Description (Text area)
    await CustomField.findOneAndUpdate(
      { fieldId: 'jobDescription' },
      {
        fieldId: 'jobDescription',
        name: 'jobDescription',
        label: 'Job Profile Description',
        fieldType: 'textarea',
        styling: { placeholder: 'Text Area upto 2000 words' },
        validation: { required: false, maxLength: 2000 },
        placement: { section: 'jobseeker_profile', order: 13, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Job Roles (Multiple selection)
    await CustomField.findOneAndUpdate(
      { fieldId: 'jobRoles' },
      {
        fieldId: 'jobRoles',
        name: 'jobRoles',
        label: 'Job Roles',
        fieldType: 'multiselect',
        styling: { placeholder: 'Type or Select Existing Suggestion / Enable Add New Options By Admin & User' },
        validation: { required: false, max: 10 },
        placement: { section: 'jobseeker_profile', order: 14, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Department Category (Multiple selection)
    await CustomField.findOneAndUpdate(
      { fieldId: 'departmentCategory' },
      {
        fieldId: 'departmentCategory',
        name: 'departmentCategory',
        label: 'Department Category',
        fieldType: 'multiselect',
        styling: { placeholder: 'Type or Select Existing Suggestion / Enable Add New Options By Admin & User' },
        validation: { required: false, max: 5 },
        placement: { section: 'jobseeker_profile', order: 15, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Current/Last Company Name (Text field)
    await CustomField.findOneAndUpdate(
      { fieldId: 'companyName' },
      {
        fieldId: 'companyName',
        name: 'companyName',
        label: 'Current/Last Company Name',
        fieldType: 'text',
        styling: { placeholder: 'Enter Company Name' },
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 16, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Industry/Sectors (Multiple selection)
    await CustomField.findOneAndUpdate(
      { fieldId: 'industrySectors' },
      {
        fieldId: 'industrySectors',
        name: 'industrySectors',
        label: 'Industry / Sectors',
        fieldType: 'multiselect',
        styling: { placeholder: 'Type or Select Existing Suggestion / Enable Add New Options By Admin & User' },
        validation: { required: false, max: 5 },
        placement: { section: 'jobseeker_profile', order: 17, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Work Start Date (Date field)
    await CustomField.findOneAndUpdate(
      { fieldId: 'workStartDate' },
      {
        fieldId: 'workStartDate',
        name: 'workStartDate',
        label: 'Work Start Date',
        fieldType: 'date',
        styling: { placeholder: 'Select Month & Year' },
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 18, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Work End Date (Date field)
    await CustomField.findOneAndUpdate(
      { fieldId: 'workEndDate' },
      {
        fieldId: 'workEndDate',
        name: 'workEndDate',
        label: 'Work End Date',
        fieldType: 'date',
        styling: { placeholder: 'Select Month & Year' },
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 19, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Work Office/City Location (Text field with suggestions)
    await CustomField.findOneAndUpdate(
      { fieldId: 'workLocation' },
      {
        fieldId: 'workLocation',
        name: 'workLocation',
        label: 'Work Office / City Location',
        fieldType: 'text',
        styling: { placeholder: 'Select Location' },
        validation: { required: false },
        placement: { section: 'jobseeker_profile', order: 20, group: 'experience' },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    console.log('Experience data seeded successfully!');
  } catch (error) {
    console.error('Error seeding experience data:', error);
  }
}

// Run the seeding function
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala')
  .then(() => {
    console.log('Connected to MongoDB');
    return createCustomFields();
  })
  .then(() => {
    console.log('Database seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { createCustomFields, experienceData };