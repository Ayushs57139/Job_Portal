const mongoose = require('mongoose');
const JobTitle = require('./models/JobTitle');
const KeySkill = require('./models/KeySkill');
const Industry = require('./models/Industry');
const Department = require('./models/Department');
const Course = require('./models/Course');
const Specialization = require('./models/Specialization');
const Education = require('./models/Education');
const Location = require('./models/Location');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedMasterData = async () => {
  try {
    console.log('🌱 Starting master data seeding...\n');

    // Create a dummy user ID for createdBy field
    const dummyUserId = new mongoose.Types.ObjectId();

    // 1. SEED JOB TITLES
    console.log('📋 Seeding Job Titles...');
    const jobTitles = [
      { name: 'Software Engineer', category: 'Technical' },
      { name: 'Senior Software Engineer', category: 'Technical' },
      { name: 'Full Stack Developer', category: 'Technical' },
      { name: 'Frontend Developer', category: 'Technical' },
      { name: 'Backend Developer', category: 'Technical' },
      { name: 'DevOps Engineer', category: 'Technical' },
      { name: 'Data Scientist', category: 'Technical' },
      { name: 'Data Analyst', category: 'Technical' },
      { name: 'Business Analyst', category: 'Management' },
      { name: 'Product Manager', category: 'Management' },
      { name: 'Project Manager', category: 'Management' },
      { name: 'Sales Manager', category: 'Sales' },
      { name: 'Sales Executive', category: 'Sales' },
      { name: 'Marketing Manager', category: 'Marketing' },
      { name: 'Digital Marketing Executive', category: 'Marketing' },
      { name: 'HR Manager', category: 'HR' },
      { name: 'HR Executive', category: 'HR' },
      { name: 'Recruiter', category: 'HR' },
      { name: 'Accountant', category: 'Finance' },
      { name: 'Financial Analyst', category: 'Finance' },
      { name: 'Customer Support Executive', category: 'Support' },
      { name: 'Content Writer', category: 'Other' },
      { name: 'Graphic Designer', category: 'Other' },
      { name: 'UI/UX Designer', category: 'Technical' },
      { name: 'Quality Analyst', category: 'Technical' }
    ];

    for (const title of jobTitles) {
      await JobTitle.addOrUpdateJobTitle(title.name, title.category, dummyUserId);
    }
    console.log(`✅ Added ${jobTitles.length} job titles\n`);

    // 2. SEED KEY SKILLS
    console.log('🔧 Seeding Key Skills...');
    const keySkills = [
      // Technical Skills
      { name: 'JavaScript', category: 'Programming', skillType: 'Technical' },
      { name: 'Python', category: 'Programming', skillType: 'Technical' },
      { name: 'Java', category: 'Programming', skillType: 'Technical' },
      { name: 'C++', category: 'Programming', skillType: 'Technical' },
      { name: 'React.js', category: 'Technology', skillType: 'Framework' },
      { name: 'Angular', category: 'Technology', skillType: 'Framework' },
      { name: 'Vue.js', category: 'Technology', skillType: 'Framework' },
      { name: 'Node.js', category: 'Technology', skillType: 'Framework' },
      { name: 'Express.js', category: 'Technology', skillType: 'Framework' },
      { name: 'MongoDB', category: 'Technology', skillType: 'Tool' },
      { name: 'MySQL', category: 'Technology', skillType: 'Tool' },
      { name: 'PostgreSQL', category: 'Technology', skillType: 'Tool' },
      { name: 'AWS', category: 'Technology', skillType: 'Tool' },
      { name: 'Azure', category: 'Technology', skillType: 'Tool' },
      { name: 'Docker', category: 'Technology', skillType: 'Tool' },
      { name: 'Kubernetes', category: 'Technology', skillType: 'Tool' },
      { name: 'Git', category: 'Technology', skillType: 'Tool' },
      { name: 'HTML/CSS', category: 'Technology', skillType: 'Technical' },
      
      // Soft Skills
      { name: 'Communication', category: 'Soft Skills', skillType: 'Soft' },
      { name: 'Leadership', category: 'Soft Skills', skillType: 'Soft' },
      { name: 'Team Management', category: 'Soft Skills', skillType: 'Soft' },
      { name: 'Problem Solving', category: 'Soft Skills', skillType: 'Soft' },
      { name: 'Time Management', category: 'Soft Skills', skillType: 'Soft' },
      { name: 'Analytical Thinking', category: 'Soft Skills', skillType: 'Soft' },
      { name: 'Critical Thinking', category: 'Soft Skills', skillType: 'Soft' },
      { name: 'Teamwork', category: 'Soft Skills', skillType: 'Soft' },
      { name: 'Adaptability', category: 'Soft Skills', skillType: 'Soft' },
      
      // Business Skills
      { name: 'Sales', category: 'Sales', skillType: 'Technical' },
      { name: 'Marketing', category: 'Marketing', skillType: 'Technical' },
      { name: 'Digital Marketing', category: 'Marketing', skillType: 'Technical' },
      { name: 'SEO', category: 'Marketing', skillType: 'Technical' },
      { name: 'Social Media Marketing', category: 'Marketing', skillType: 'Technical' },
      { name: 'Content Writing', category: 'Creative', skillType: 'Technical' },
      { name: 'Copywriting', category: 'Creative', skillType: 'Technical' },
      
      // Languages
      { name: 'English', category: 'Language', skillType: 'Language' },
      { name: 'Hindi', category: 'Language', skillType: 'Language' },
      { name: 'Spanish', category: 'Language', skillType: 'Language' },
      { name: 'French', category: 'Language', skillType: 'Language' }
    ];

    for (const skill of keySkills) {
      await KeySkill.addOrUpdateKeySkill(
        skill.name,
        skill.category,
        skill.skillType,
        dummyUserId,
        '',
        []
      );
    }
    console.log(`✅ Added ${keySkills.length} key skills\n`);

    // 3. SEED INDUSTRIES
    console.log('🏭 Seeding Industries...');
    const industries = [
      {
        name: 'Information Technology',
        subcategories: ['Software Development', 'IT Services', 'Hardware', 'Consulting', 'Cybersecurity', 'Cloud Services']
      },
      {
        name: 'Banking / Financial Services',
        subcategories: ['Retail Banking', 'Investment Banking', 'Insurance', 'Asset Management', 'Fintech']
      },
      {
        name: 'Healthcare / Medical',
        subcategories: ['Hospitals', 'Pharmaceuticals', 'Medical Devices', 'Diagnostics', 'Telemedicine']
      },
      {
        name: 'Education / Training',
        subcategories: ['Schools', 'Colleges', 'EdTech', 'Professional Training', 'Online Learning']
      },
      {
        name: 'E-commerce / Retail',
        subcategories: ['Online Retail', 'Fashion', 'Electronics', 'Grocery', 'Marketplace']
      },
      {
        name: 'Manufacturing',
        subcategories: ['Automotive', 'Electronics', 'Textiles', 'FMCG', 'Industrial Equipment']
      },
      {
        name: 'Telecommunications',
        subcategories: ['Mobile Networks', 'Internet Services', 'Broadband', 'Enterprise Solutions']
      },
      {
        name: 'Real Estate / Construction',
        subcategories: ['Residential', 'Commercial', 'Infrastructure', 'Property Management']
      },
      {
        name: 'Media / Entertainment',
        subcategories: ['Television', 'Digital Media', 'Publishing', 'Gaming', 'OTT Platforms']
      },
      {
        name: 'Hospitality / Travel',
        subcategories: ['Hotels', 'Restaurants', 'Travel Agencies', 'Airlines', 'Tourism']
      },
      {
        name: 'Consulting / Professional Services',
        subcategories: ['Management Consulting', 'IT Consulting', 'Legal', 'Accounting', 'HR Consulting']
      },
      {
        name: 'Logistics / Transportation',
        subcategories: ['Freight', 'Warehousing', 'Last Mile Delivery', 'Fleet Management']
      },
      {
        name: 'BFSI',
        subcategories: ['Banking', 'Financial Services', 'Insurance', 'NBFC']
      },
      {
        name: 'Automotive',
        subcategories: ['Manufacturing', 'Auto Parts', 'EV', 'Service Centers']
      },
      {
        name: 'Agriculture',
        subcategories: ['Farming', 'Agritech', 'Food Processing', 'Organic Products']
      }
    ];

    for (const industry of industries) {
      const newIndustry = new Industry(industry);
      await newIndustry.save();
    }
    console.log(`✅ Added ${industries.length} industries\n`);

    // 4. SEED DEPARTMENTS
    console.log('🏢 Seeding Departments...');
    const departments = [
      {
        name: 'Engineering',
        description: 'Technical development and engineering',
        subcategories: ['Frontend', 'Backend', 'Full Stack', 'DevOps', 'QA', 'Mobile', 'Data Engineering']
      },
      {
        name: 'Sales & Marketing',
        description: 'Sales and marketing operations',
        subcategories: ['Inside Sales', 'Field Sales', 'Digital Marketing', 'Content Marketing', 'Brand Management']
      },
      {
        name: 'Human Resources',
        description: 'HR and people operations',
        subcategories: ['Recruitment', 'Talent Acquisition', 'HR Operations', 'Payroll', 'Learning & Development']
      },
      {
        name: 'Finance & Accounting',
        description: 'Financial operations',
        subcategories: ['Accounts', 'Financial Planning', 'Taxation', 'Audit', 'Treasury']
      },
      {
        name: 'Operations',
        description: 'Business operations',
        subcategories: ['Supply Chain', 'Logistics', 'Procurement', 'Warehouse', 'Quality Control']
      },
      {
        name: 'Customer Support',
        description: 'Customer service and support',
        subcategories: ['Technical Support', 'Customer Service', 'Help Desk', 'Call Center']
      },
      {
        name: 'Product Management',
        description: 'Product development and management',
        subcategories: ['Product Strategy', 'Product Design', 'Product Analytics', 'Product Marketing']
      },
      {
        name: 'Design',
        description: 'Creative and design',
        subcategories: ['UI/UX', 'Graphic Design', 'Brand Design', 'Motion Graphics']
      },
      {
        name: 'Legal & Compliance',
        description: 'Legal and compliance',
        subcategories: ['Corporate Law', 'Compliance', 'Contracts', 'Intellectual Property']
      },
      {
        name: 'Administration',
        description: 'General administration',
        subcategories: ['Office Management', 'Facilities', 'Security', 'Reception']
      }
    ];

    for (const dept of departments) {
      const newDept = new Department(dept);
      await newDept.save();
    }
    console.log(`✅ Added ${departments.length} departments\n`);

    // 5. SEED COURSES
    console.log('📚 Seeding Courses...');
    const courses = [
      { name: 'B.Tech (Bachelor of Technology)', level: 'Graduate', category: 'Engineering' },
      { name: 'M.Tech (Master of Technology)', level: 'Post Graduate', category: 'Engineering' },
      { name: 'BE (Bachelor of Engineering)', level: 'Graduate', category: 'Engineering' },
      { name: 'B.Sc (Bachelor of Science)', level: 'Graduate', category: 'Science' },
      { name: 'M.Sc (Master of Science)', level: 'Post Graduate', category: 'Science' },
      { name: 'BCA (Bachelor of Computer Applications)', level: 'Graduate', category: 'Technical' },
      { name: 'MCA (Master of Computer Applications)', level: 'Post Graduate', category: 'Technical' },
      { name: 'MBA (Master of Business Administration)', level: 'Post Graduate', category: 'Management' },
      { name: 'BBA (Bachelor of Business Administration)', level: 'Graduate', category: 'Management' },
      { name: 'B.Com (Bachelor of Commerce)', level: 'Graduate', category: 'Commerce' },
      { name: 'M.Com (Master of Commerce)', level: 'Post Graduate', category: 'Commerce' },
      { name: 'BA (Bachelor of Arts)', level: 'Graduate', category: 'Arts' },
      { name: 'MA (Master of Arts)', level: 'Post Graduate', category: 'Arts' },
      { name: 'MBBS (Bachelor of Medicine, Bachelor of Surgery)', level: 'Graduate', category: 'Medical' },
      { name: 'MD (Doctor of Medicine)', level: 'Post Graduate', category: 'Medical' },
      { name: 'BDS (Bachelor of Dental Surgery)', level: 'Graduate', category: 'Medical' },
      { name: 'B.Pharm (Bachelor of Pharmacy)', level: 'Graduate', category: 'Medical' },
      { name: 'LLB (Bachelor of Laws)', level: 'Graduate', category: 'Law' },
      { name: 'Diploma in Engineering', level: 'Diploma', category: 'Engineering' },
      { name: 'ITI (Industrial Training Institute)', level: 'Certificate', category: 'Technical' },
      { name: 'CA (Chartered Accountant)', level: 'Certificate', category: 'Commerce' },
      { name: 'CS (Company Secretary)', level: 'Certificate', category: 'Commerce' },
      { name: 'CFA (Chartered Financial Analyst)', level: 'Certificate', category: 'Commerce' }
    ];

    for (const course of courses) {
      const newCourse = new Course({
        ...course,
        createdBy: dummyUserId
      });
      await newCourse.save();
    }
    console.log(`✅ Added ${courses.length} courses\n`);

    // 6. SEED SPECIALIZATIONS
    console.log('🎓 Seeding Specializations...');
    const specializations = [
      { name: 'Computer Science', field: 'Engineering', level: 'Graduate' },
      { name: 'Information Technology', field: 'Engineering', level: 'Graduate' },
      { name: 'Electronics & Communication', field: 'Engineering', level: 'Graduate' },
      { name: 'Mechanical Engineering', field: 'Engineering', level: 'Graduate' },
      { name: 'Civil Engineering', field: 'Engineering', level: 'Graduate' },
      { name: 'Electrical Engineering', field: 'Engineering', level: 'Graduate' },
      { name: 'Finance', field: 'Business', level: 'Post Graduate' },
      { name: 'Marketing', field: 'Business', level: 'Post Graduate' },
      { name: 'Human Resources', field: 'Business', level: 'Post Graduate' },
      { name: 'Operations Management', field: 'Business', level: 'Post Graduate' },
      { name: 'Data Science', field: 'Technology', level: 'Post Graduate' },
      { name: 'Artificial Intelligence', field: 'Technology', level: 'Post Graduate' },
      { name: 'Cyber Security', field: 'Technology', level: 'Post Graduate' },
      { name: 'Biotechnology', field: 'Science', level: 'Graduate' },
      { name: 'Microbiology', field: 'Science', level: 'Graduate' },
      { name: 'Chemistry', field: 'Science', level: 'Graduate' },
      { name: 'Physics', field: 'Science', level: 'Graduate' },
      { name: 'Mathematics', field: 'Science', level: 'Graduate' }
    ];

    for (const spec of specializations) {
      const newSpec = new Specialization({
        ...spec,
        createdBy: dummyUserId
      });
      await newSpec.save();
    }
    console.log(`✅ Added ${specializations.length} specializations\n`);

    // 7. SEED EDUCATION FIELDS
    console.log('🎒 Seeding Education Fields...');
    const educationFields = [
      { name: 'No Formal Education', level: 'No Education' },
      { name: 'Below 10th Standard', level: 'Below 10th' },
      { name: '10th Pass', level: '10th Pass' },
      { name: '12th Pass', level: '12th Pass' },
      { name: 'ITI', level: 'ITI' },
      { name: 'Diploma', level: 'Diploma' },
      { name: 'Graduate', level: 'Graduate' },
      { name: 'Post Graduate', level: 'Post Graduate' },
      { name: 'Doctorate/PhD', level: 'Doctorate' }
    ];

    for (const edu of educationFields) {
      const newEdu = new Education({
        ...edu,
        createdBy: dummyUserId
      });
      await newEdu.save();
    }
    console.log(`✅ Added ${educationFields.length} education fields\n`);

    // 8. SEED LOCATIONS
    console.log('📍 Seeding Locations...');
    const locations = [
      // Metro Cities
      { name: 'Mumbai', state: 'Maharashtra', country: 'India' },
      { name: 'Delhi', state: 'Delhi', country: 'India' },
      { name: 'Bangalore', state: 'Karnataka', country: 'India' },
      { name: 'Hyderabad', state: 'Telangana', country: 'India' },
      { name: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      { name: 'Kolkata', state: 'West Bengal', country: 'India' },
      
      // Tier-1 Cities
      { name: 'Pune', state: 'Maharashtra', country: 'India' },
      { name: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      { name: 'Jaipur', state: 'Rajasthan', country: 'India' },
      { name: 'Surat', state: 'Gujarat', country: 'India' },
      { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Kanpur', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Nagpur', state: 'Maharashtra', country: 'India' },
      { name: 'Indore', state: 'Madhya Pradesh', country: 'India' },
      { name: 'Thane', state: 'Maharashtra', country: 'India' },
      { name: 'Bhopal', state: 'Madhya Pradesh', country: 'India' },
      { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India' },
      { name: 'Patna', state: 'Bihar', country: 'India' },
      { name: 'Vadodara', state: 'Gujarat', country: 'India' },
      { name: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Ludhiana', state: 'Punjab', country: 'India' },
      { name: 'Agra', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Nashik', state: 'Maharashtra', country: 'India' },
      { name: 'Faridabad', state: 'Haryana', country: 'India' },
      { name: 'Meerut', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Rajkot', state: 'Gujarat', country: 'India' },
      { name: 'Varanasi', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Srinagar', state: 'Jammu and Kashmir', country: 'India' },
      { name: 'Amritsar', state: 'Punjab', country: 'India' },
      { name: 'Chandigarh', state: 'Chandigarh', country: 'India' },
      { name: 'Coimbatore', state: 'Tamil Nadu', country: 'India' },
      { name: 'Kochi', state: 'Kerala', country: 'India' },
      { name: 'Guwahati', state: 'Assam', country: 'India' },
      { name: 'Bhubaneswar', state: 'Odisha', country: 'India' },
      { name: 'Dehradun', state: 'Uttarakhand', country: 'India' },
      { name: 'Noida', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Gurugram', state: 'Haryana', country: 'India' },
      { name: 'Mysore', state: 'Karnataka', country: 'India' },
      { name: 'Mangalore', state: 'Karnataka', country: 'India' },
      { name: 'Trivandrum', state: 'Kerala', country: 'India' }
    ];

    for (const loc of locations) {
      const newLoc = new Location({
        ...loc,
        createdBy: dummyUserId
      });
      await newLoc.save();
    }
    console.log(`✅ Added ${locations.length} locations\n`);

    console.log('✅ Master data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${jobTitles.length} Job Titles`);
    console.log(`   - ${keySkills.length} Key Skills`);
    console.log(`   - ${industries.length} Industries`);
    console.log(`   - ${departments.length} Departments`);
    console.log(`   - ${courses.length} Courses`);
    console.log(`   - ${specializations.length} Specializations`);
    console.log(`   - ${educationFields.length} Education Fields`);
    console.log(`   - ${locations.length} Locations`);
    console.log('\n🎉 All done! Your database is now populated with master data.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding master data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedMasterData();

