const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const JobIndustry = require('./models/JobIndustry');
const JobDesignation = require('./models/JobDesignation');
const JobDepartment = require('./models/JobDepartment');
const JobRole = require('./models/JobRole');
const JobKeySkill = require('./models/JobKeySkill');
const Education = require('./models/Education');
const Location = require('./models/Location');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal', {
});

const seedJobCategories = async () => {
  try {
    console.log('🌱 Starting Job Categories seeding...');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ userType: 'superadmin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Clear existing data
    await JobIndustry.deleteMany({});
    await JobDesignation.deleteMany({});
    await JobDepartment.deleteMany({});
    await JobRole.deleteMany({});
    await JobKeySkill.deleteMany({});
    await Education.deleteMany({});
    await Location.deleteMany({});

    console.log('🗑️ Cleared existing job categories data');

    // Seed Job Industries
    const industries = [
      { name: 'Information Technology', category: 'Technology', description: 'Software development, IT services, and technology solutions' },
      { name: 'Healthcare & Medical', category: 'Healthcare', description: 'Medical services, pharmaceuticals, and healthcare technology' },
      { name: 'Banking & Financial Services', category: 'Finance', description: 'Banking, insurance, investment, and financial advisory services' },
      { name: 'Manufacturing & Production', category: 'Manufacturing', description: 'Industrial production, manufacturing, and supply chain' },
      { name: 'Education & Training', category: 'Education', description: 'Educational institutions, training centers, and e-learning' },
      { name: 'Retail & E-commerce', category: 'Retail', description: 'Retail stores, e-commerce platforms, and consumer goods' },
      { name: 'Real Estate & Construction', category: 'Other', description: 'Real estate development, construction, and property management' },
      { name: 'Media & Entertainment', category: 'Other', description: 'Media production, entertainment, and digital content' },
      { name: 'Automotive', category: 'Manufacturing', description: 'Automobile manufacturing, sales, and services' },
      { name: 'Telecommunications', category: 'Technology', description: 'Telecom services, network infrastructure, and communication' }
    ];

    for (const industry of industries) {
      await JobIndustry.create({
        ...industry,
        createdBy: adminUser._id
      });
    }
    console.log(`✅ Seeded ${industries.length} job industries`);

    // Seed Job Designations
    const designations = [
      { name: 'Software Engineer', category: 'Entry Level', minExperience: 0, maxExperience: 2, description: 'Entry-level software development position' },
      { name: 'Senior Software Engineer', category: 'Mid Level', minExperience: 3, maxExperience: 6, description: 'Mid-level software development with team leadership' },
      { name: 'Lead Software Engineer', category: 'Senior Level', minExperience: 6, maxExperience: 10, description: 'Senior technical leadership role' },
      { name: 'Engineering Manager', category: 'Executive Level', minExperience: 8, maxExperience: 15, description: 'Technical team management and strategy' },
      { name: 'Product Manager', category: 'Mid Level', minExperience: 3, maxExperience: 8, description: 'Product strategy and roadmap management' },
      { name: 'Data Scientist', category: 'Mid Level', minExperience: 2, maxExperience: 6, description: 'Data analysis and machine learning' },
      { name: 'DevOps Engineer', category: 'Mid Level', minExperience: 2, maxExperience: 6, description: 'Infrastructure and deployment automation' },
      { name: 'UI/UX Designer', category: 'Entry Level', minExperience: 0, maxExperience: 4, description: 'User interface and experience design' },
      { name: 'Business Analyst', category: 'Entry Level', minExperience: 0, maxExperience: 3, description: 'Business requirements analysis and documentation' },
      { name: 'Sales Manager', category: 'Mid Level', minExperience: 3, maxExperience: 8, description: 'Sales team leadership and strategy' }
    ];

    for (const designation of designations) {
      await JobDesignation.create({
        ...designation,
        createdBy: adminUser._id
      });
    }
    console.log(`✅ Seeded ${designations.length} job designations`);

    // Seed Job Departments
    const departments = [
      { name: 'Engineering', description: 'Software development and technical teams' },
      { name: 'Product Management', description: 'Product strategy and roadmap planning' },
      { name: 'Sales & Marketing', description: 'Sales, marketing, and business development' },
      { name: 'Human Resources', description: 'HR operations, recruitment, and employee relations' },
      { name: 'Finance & Accounting', description: 'Financial management and accounting operations' },
      { name: 'Operations', description: 'Business operations and process management' },
      { name: 'Customer Support', description: 'Customer service and technical support' },
      { name: 'Quality Assurance', description: 'Testing, quality control, and compliance' },
      { name: 'Research & Development', description: 'Innovation, research, and product development' },
      { name: 'Legal & Compliance', description: 'Legal affairs and regulatory compliance' }
    ];

    for (const department of departments) {
      await JobDepartment.create({
        ...department,
        createdBy: adminUser._id
      });
    }
    console.log(`✅ Seeded ${departments.length} job departments`);

    // Seed Job Roles (using existing JobRole model)
    const roles = [
      { name: 'Frontend Developer', description: 'Client-side web and mobile application development' },
      { name: 'Backend Developer', description: 'Server-side application development and APIs' },
      { name: 'Full Stack Developer', description: 'End-to-end application development' },
      { name: 'Mobile App Developer', description: 'iOS and Android application development' },
      { name: 'Data Engineer', description: 'Data pipeline and infrastructure development' },
      { name: 'Cloud Engineer', description: 'Cloud infrastructure and deployment management' },
      { name: 'Security Engineer', description: 'Cybersecurity and application security' },
      { name: 'Technical Writer', description: 'Technical documentation and content creation' },
      { name: 'Scrum Master', description: 'Agile project management and team facilitation' },
      { name: 'Solution Architect', description: 'Technical architecture and system design' }
    ];

    for (const role of roles) {
      await JobRole.create({
        ...role,
        createdBy: adminUser._id
      });
    }
    console.log(`✅ Seeded ${roles.length} job roles`);

    // Seed Job Key Skills
    const skills = [
      { name: 'JavaScript', category: 'Technical', description: 'Programming language for web development' },
      { name: 'Python', category: 'Technical', description: 'Versatile programming language for various applications' },
      { name: 'Java', category: 'Technical', description: 'Object-oriented programming language' },
      { name: 'React', category: 'Technical', description: 'JavaScript library for building user interfaces' },
      { name: 'Node.js', category: 'Technical', description: 'JavaScript runtime for server-side development' },
      { name: 'Communication', category: 'Soft Skills', description: 'Effective verbal and written communication' },
      { name: 'Leadership', category: 'Soft Skills', description: 'Team leadership and management skills' },
      { name: 'Problem Solving', category: 'Soft Skills', description: 'Analytical thinking and problem resolution' },
      { name: 'English', category: 'Language', description: 'English language proficiency' },
      { name: 'AWS Certified', category: 'Certification', description: 'Amazon Web Services certification' }
    ];

    for (const skill of skills) {
      await JobKeySkill.create({
        ...skill,
        createdBy: adminUser._id
      });
    }
    console.log(`✅ Seeded ${skills.length} job key skills`);

    // Seed Education
    const education = [
      { name: 'ITI', level: 'ITI', description: 'Industrial Training Institute certificate' },
      { name: 'Diploma', level: 'Diploma', description: 'Diploma qualification' },
      { name: 'Graduate', level: 'Graduate', description: 'Graduate degree qualification' },
      { name: 'Post Graduate', level: 'Post Graduate', description: 'Post graduate degree qualification' },
      { name: 'Doctorate', level: 'Doctorate', description: 'Doctorate degree qualification' }
    ];

    for (const edu of education) {
      await Education.create({
        ...edu,
        createdBy: adminUser._id
      });
    }
    console.log(`✅ Seeded ${education.length} education qualifications`);

    // Seed Locations
    const locations = [
      { name: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001' },
      { name: 'Delhi', state: 'Delhi', country: 'India', pincode: '110001' },
      { name: 'Bangalore', state: 'Karnataka', country: 'India', pincode: '560001' },
      { name: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500001' },
      { name: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600001' },
      { name: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411001' },
      { name: 'Kolkata', state: 'West Bengal', country: 'India', pincode: '700001' },
      { name: 'Ahmedabad', state: 'Gujarat', country: 'India', pincode: '380001' },
      { name: 'Jaipur', state: 'Rajasthan', country: 'India', pincode: '302001' },
      { name: 'Gurgaon', state: 'Haryana', country: 'India', pincode: '122001' }
    ];

    for (const location of locations) {
      await Location.create({
        ...location,
        createdBy: adminUser._id
      });
    }
    console.log(`✅ Seeded ${locations.length} locations`);

    console.log('🎉 Job Categories seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Industries: ${industries.length}`);
    console.log(`- Designations: ${designations.length}`);
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Roles: ${roles.length}`);
    console.log(`- Skills: ${skills.length}`);
    console.log(`- Education: ${education.length}`);
    console.log(`- Locations: ${locations.length}`);

  } catch (error) {
    console.error('❌ Error seeding job categories:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding function
seedJobCategories();
