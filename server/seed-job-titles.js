const mongoose = require('mongoose');
const CustomField = require('./models/CustomField');

// Common Job Titles/Designations
const jobTitles = [
  'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer', 'Principal Software Engineer',
  'Software Developer', 'Senior Software Developer', 'Lead Developer', 'Full Stack Developer',
  'Frontend Developer', 'Backend Developer', 'Mobile App Developer', 'iOS Developer', 'Android Developer',
  'React Developer', 'Angular Developer', 'Vue.js Developer', 'Node.js Developer', 'Python Developer',
  'Java Developer', 'C# Developer', '.NET Developer', 'PHP Developer', 'Ruby Developer',
  'DevOps Engineer', 'Cloud Engineer', 'AWS Engineer', 'Azure Engineer', 'Google Cloud Engineer',
  'Data Scientist', 'Data Analyst', 'Data Engineer', 'Machine Learning Engineer', 'AI Engineer',
  'Business Analyst', 'Product Manager', 'Project Manager', 'Scrum Master', 'Technical Lead',
  'Engineering Manager', 'CTO', 'VP Engineering', 'Director of Engineering',
  'UI/UX Designer', 'Graphic Designer', 'Web Designer', 'Product Designer', 'UX Researcher',
  'Digital Marketing Manager', 'SEO Specialist', 'Content Writer', 'Technical Writer',
  'Sales Manager', 'Business Development Manager', 'Account Manager', 'Customer Success Manager',
  'HR Manager', 'Recruiter', 'Talent Acquisition Specialist', 'HR Business Partner',
  'Finance Manager', 'Financial Analyst', 'Accountant', 'Chartered Accountant', 'CFO',
  'Operations Manager', 'Supply Chain Manager', 'Quality Assurance Manager', 'Process Manager',
  'Marketing Manager', 'Brand Manager', 'Social Media Manager', 'Content Marketing Manager',
  'Sales Executive', 'Sales Representative', 'Inside Sales Representative', 'Field Sales Executive',
  'Customer Service Representative', 'Customer Support Executive', 'Technical Support Engineer',
  'System Administrator', 'Network Administrator', 'Database Administrator', 'IT Support Specialist',
  'Cybersecurity Analyst', 'Information Security Manager', 'Penetration Tester', 'Security Engineer',
  'Quality Assurance Engineer', 'Test Engineer', 'QA Analyst', 'Automation Test Engineer',
  'Business Intelligence Analyst', 'Data Warehouse Developer', 'ETL Developer', 'Report Developer',
  'Solution Architect', 'Technical Architect', 'Enterprise Architect', 'System Architect',
  'Consultant', 'Senior Consultant', 'Principal Consultant', 'Management Consultant',
  'Research Scientist', 'Research Analyst', 'Research Associate', 'Research Manager',
  'Professor', 'Assistant Professor', 'Associate Professor', 'Lecturer', 'Academic Coordinator',
  'Doctor', 'Nurse', 'Pharmacist', 'Medical Officer', 'Surgeon', 'Physician', 'Dentist',
  'Lawyer', 'Legal Counsel', 'Paralegal', 'Legal Assistant', 'Compliance Officer',
  'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Chemical Engineer',
  'Aerospace Engineer', 'Biomedical Engineer', 'Environmental Engineer', 'Industrial Engineer',
  'Architect', 'Interior Designer', 'Urban Planner', 'Construction Manager',
  'Chef', 'Restaurant Manager', 'Food Service Manager', 'Catering Manager',
  'Journalist', 'Editor', 'Content Creator', 'Social Media Specialist', 'Public Relations Manager',
  'Event Manager', 'Event Coordinator', 'Wedding Planner', 'Conference Manager',
  'Real Estate Agent', 'Property Manager', 'Real Estate Broker', 'Property Consultant',
  'Insurance Agent', 'Insurance Advisor', 'Insurance Sales Representative', 'Claims Adjuster',
  'Banking Officer', 'Loan Officer', 'Credit Analyst', 'Investment Advisor', 'Financial Advisor',
  'Teacher', 'Principal', 'Vice Principal', 'Academic Director', 'Curriculum Coordinator',
  'Trainer', 'Training Manager', 'Learning and Development Manager', 'Corporate Trainer',
  'Translator', 'Interpreter', 'Language Specialist', 'Localization Specialist',
  'Logistics Coordinator', 'Warehouse Manager', 'Supply Chain Analyst', 'Procurement Manager',
  'Retail Manager', 'Store Manager', 'Assistant Store Manager', 'Retail Sales Associate',
  'Fashion Designer', 'Textile Designer', 'Jewelry Designer', 'Product Designer',
  'Photographer', 'Videographer', 'Video Editor', 'Audio Engineer', 'Sound Engineer',
  'Fitness Trainer', 'Personal Trainer', 'Nutritionist', 'Dietitian', 'Yoga Instructor',
  'Travel Agent', 'Tour Guide', 'Travel Coordinator', 'Airline Customer Service Representative',
  'Security Guard', 'Security Supervisor', 'Facility Manager', 'Maintenance Manager',
  'Driver', 'Delivery Driver', 'Truck Driver', 'Bus Driver', 'Taxi Driver',
  'Receptionist', 'Administrative Assistant', 'Executive Assistant', 'Office Manager',
  'Data Entry Operator', 'Clerk', 'Cashier', 'Customer Service Representative',
  'Intern', 'Trainee', 'Fresher', 'Entry Level', 'Junior', 'Senior', 'Lead', 'Principal',
  'Manager', 'Senior Manager', 'Director', 'VP', 'C-Level Executive', 'CEO', 'COO', 'CFO'
];

// Function to create job titles field
async function createJobTitlesField() {
  try {
    console.log('Starting to seed job titles data...');

    // Create a dummy admin user ID for createdBy field
    const adminUserId = new mongoose.Types.ObjectId();

    // Convert job titles array to options format
    const jobTitleOptions = jobTitles.map((title, index) => ({
      value: title,
      label: title,
      order: index
    }));

    // Update or create the job titles field
    await CustomField.findOneAndUpdate(
      { fieldId: 'jobTitle' },
      {
        fieldId: 'jobTitle',
        name: 'jobTitle',
        label: 'Job Title / Designation',
        fieldType: 'text',
        styling: { 
          placeholder: 'Type or Select Existing Suggestion / Enable Add New Options By Admin & User' 
        },
        validation: { 
          required: true
        },
        options: jobTitleOptions,
        placement: { 
          section: 'jobseeker_profile', 
          order: 11, 
          group: 'experience' 
        },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    console.log('Job titles data seeded successfully!');
    console.log(`Total job titles added: ${jobTitles.length}`);
  } catch (error) {
    console.error('Error seeding job titles data:', error);
  }
}

// Run the seeding function
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala')
  .then(() => {
    console.log('Connected to MongoDB');
    return createJobTitlesField();
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

module.exports = { createJobTitlesField, jobTitles };
