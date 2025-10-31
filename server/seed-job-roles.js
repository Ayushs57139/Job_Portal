const mongoose = require('mongoose');
const JobRole = require('./models/JobRole');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

const jobRoles = [
  { name: 'Software Developer / Engineer', category: 'Technology' },
  { name: 'Full Stack Developer', category: 'Technology' },
  { name: 'Data Scientist / Analyst', category: 'Technology' },
  { name: 'Machine Learning Engineer', category: 'Technology' },
  { name: 'Business Analyst', category: 'Management' },
  { name: 'Project Manager', category: 'Management' },
  { name: 'Product Manager', category: 'Management' },
  { name: 'Operations Manager', category: 'Operations' },
  { name: 'Business Development Executive / Manager', category: 'Sales' },
  { name: 'Financial Analyst', category: 'Finance' },
  { name: 'Investment Banker', category: 'Finance' },
  { name: 'Chartered Accountant (CA)', category: 'Finance' },
  { name: 'Auditor / Tax Consultant', category: 'Finance' },
  { name: 'Doctor / Surgeon', category: 'Healthcare' },
  { name: 'Pharmacist', category: 'Healthcare' },
  { name: 'Nurse / Medical Assistant', category: 'Healthcare' },
  { name: 'Medical Researcher', category: 'Healthcare' },
  { name: 'HR Manager', category: 'Human Resources' },
  { name: 'Marketing Manager', category: 'Marketing' },
  { name: 'Customer Support', category: 'Customer Service' },
  { name: 'Teacher', category: 'Education' },
  { name: 'Receptionist', category: 'Administration' },
  { name: 'Technician', category: 'Maintenance' },
  { name: 'Legal Advisor', category: 'Legal' },
  { name: 'Tailor', category: 'Retail' },
];

async function seedJobRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Seeding job roles...');
    
    for (const role of jobRoles) {
      await JobRole.addOrUpdateJobRole(role.name, role.category, null);
      // Also verify them so they show up in trending
      await JobRole.findOneAndUpdate(
        { name: role.name },
        { isVerified: true }
      );
    }

    console.log(`✅ Successfully seeded ${jobRoles.length} job roles`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding job roles:', error);
    process.exit(1);
  }
}

seedJobRoles();

