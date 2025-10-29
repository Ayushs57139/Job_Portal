const mongoose = require('mongoose');
const CustomField = require('./models/CustomField');

// Key Skills data
const keySkills = [
  '3D Modeling', '3D Printing', '5S', 'Access Control System', 'Accountability',
  'Accounting', 'Accounts', 'Achieving Sales Target', 'Active Learning', 'Active Listening',
  'Active Problem Resolution', 'Active Questioning', 'Adaptability', 'Adaptability to Change',
  'Admin', 'Administrative Support', 'Adobe Illustrator', 'Adobe Photoshop', 'Adobe XD',
  'Advance Excel', 'Affiliate Marketing', 'After Effects', 'After-Sales Support',
  'Agent Recruitment', 'Agile Methodologies', 'Agile Project Management', 'Agility',
  'Agri Products Sales', 'Agri Sales', 'Agriculture', 'Agriculture Loan Sales',
  'Agriculture Products', 'Analytical Reasoning', 'Analytical Thinking', 'Anatomy Knowledge',
  'Android Development', 'Angular', 'Animation', 'Ansible', 'ANSYS', 'App Development',
  'Artificial Intelligence', 'ASP.NET Core', 'Assembling', 'Attandance Management',
  'Attendance Management', 'Attention to Detail', 'Audit', 'Audit Management', 'Auditing',
  'AutoCAD', 'AutoCAD Software & SketchUp', 'Automation', 'Automotive Parts Sales', 'AWS',
  'B2B', 'B2B sales', 'B2C', 'Banca Channel', 'Banking Operations', 'Banking Products Sales',
  'Batteries Sales', 'BFSI', 'Bidding', 'Big Data', 'Bill Generation', 'Bill Payable/Receivable',
  'Billing', 'Billing/Invoicing', 'Biotechnology', 'BirdScare Spikes', 'Blender', 'Blockchain',
  'Blog Writing', 'Body Language Awareness', 'Bookkeeping', 'Bootstrap', 'Box Packaging',
  'Brainstorming', 'Brand Management', 'Broadband Sales', 'Budgeting', 'Building Materials',
  'Building Materials Sales', 'Building Products Division', 'Business Analysis',
  'Business Communication', 'Business Development', 'Business Forecasting',
  'Business Intelligence', 'Business Loan', 'Business Loan Sales', 'Business Strategy',
  'C', 'C Programming', 'C#', 'C++', 'CAD', 'CAD Technician', 'CakePHP', 'Call Center Management',
  'Call Handling', 'Calling', 'Campaign Management', 'Canva', 'CASA', 'CASA Sales',
  'Case Management', 'Cashier', 'Cassandra', 'CATIA', 'CatiaV5', 'CCTV Monitoring', 'Cement',
  'Cement Sales', 'Challans', 'Change Management', 'Channel partners', 'Channel Sales', 'Chef',
  'Chemical', 'Chemicals Spraying', 'Chief Architect 3D', 'CI/CD Pipelines', 'Cinema 4D',
  'Circuit Design', 'Civil', 'Civil Engineering', 'Client Relations', 'Client Relationship Management',
  'Clinical Research', 'Cloud Architecture', 'Cloud Automation', 'Cloud Computing', 'Cloud Security',
  'Coaching', 'CodeIgniter', 'Coding', 'Cold calling', 'Collaboration', 'Collaboration Across Teams',
  'Collaboration with Multicultural Teams', 'Collaboration with Remote Teams',
  'Collaborative Relation Skills', 'Collection', 'Commercial Sales', 'Commercial Vehicle Sales',
  'Communication', 'Communication skill', 'Community Engagement', 'Compassion',
  'Complaint and query', 'Compliance', 'Compliances', 'Computer', 'Computer Vision',
  'Computer work', 'Concrete Curing', 'Confidence', 'Confidentiality', 'Conflict Management',
  'Conflict Resolution', 'Consensus Building', 'Construction and Mining Machinery Sales',
  'Construction Sales', 'Construction Site Visit', 'Constructive Criticism', 'Constructive Feedback',
  'Consultative Selling', 'Consulting', 'Consumer Finance', 'Consumer Loan Sales', 'Content Creation',
  'Content Management', 'Content Marketing', 'Contract Management', 'convincing power',
  'Coordinating Events', 'Copywriting', 'CorelDRAW', 'Corporate Strategy', 'Cost Management',
  'Cost Reduction', 'CouchDB', 'counter sales', 'create Automated Reports', 'Creative Thinking',
  'Creative Writing', 'Creativity', 'Credit', 'Credit Card Sales', 'Credit Operations',
  'Crisis Management', 'Critical Observation', 'Critical Thinking', 'CRM Software', 'Crop Scouting',
  'Cross Selling', 'Cross-Cultural Communication', 'Cross-Functional Communication',
  'Cross-Functional Leadership', 'Cryptography', 'CSS', 'Cube Casting', 'Cube Testing',
  'Cultural Awareness', 'Curiosity', 'Current Account Opening', 'Current Account Sales',
  'Customer Acquisition', 'Customer Empathy', 'Customer Feedback', 'Customer Handling',
  'Customer Management', 'Customer Orientation', 'Customer Relationship Management',
  'Customer Retention', 'Customer Satisfaction', 'Customer Service', 'Customer Support',
  'Cybersecurity', 'Daily Line Up', 'Daily Sales Report', 'Data Analysis', 'Data Engineering',
  'Data Entry', 'Data Governance', 'Data Management', 'Data Mining', 'Data Science',
  'Data Visualization', 'Database Management', 'DCA', 'Dealer Management', 'Dealer Visit',
  'Debugging', 'Decision Making', 'Decision-Making Under Pressure', 'Deep Learning',
  'Delegation', 'Delivery Slot Handling', 'DEO', 'Dependability', 'Design Draughtsman',
  'Design Thinking', 'Desktop Support', 'DevOps', 'Diagnostic Testing', 'Digital Marketing',
  'Digital Strategy', 'DigitalOcean', 'Diplomacy', 'Disbursement', 'Dispatch',
  'Dispute Resolution', 'Distributor Management', 'Diversity and Inclusion', 'Django', 'Docker',
  'Documentation', 'Documents Verification', 'Drafting & Part Design',
  'Drafting techniques, and blueprint interpretation', 'Draftsman', 'Drone Flying', 'DSA',
  'DSA Channel', 'DT Metering', 'E KYC', 'E-commerce', 'Economics', 'Editing', 'EDPMS',
  'Education Loan', 'Electric Vehicle Sales', 'Electrical', 'Electrical Diagram',
  'Electrical Engineering', 'Electrical Installation', 'Electrical Parts', 'Electrical Technology',
  'Electrical Work', 'Electrical Works', 'Electrician', 'Electrician Work', 'Electricity',
  'Electronic', 'Electronics and Telecommunication', 'Elixir', 'Email Marketing', 'email process',
  'Embedded Systems', 'Emergency Response', 'EMI Collection', 'Emotional Intelligence',
  'Empathy', 'Employee Engagement', 'Employee Relations', 'Engine Oil', 'Engineering Design',
  'English', 'English speaking', 'Enterprise Architecture', 'Enthusiasm', 'Environmental Management',
  'Epidemiology', 'Equity Research', 'ERP Now', 'ERP Systems', 'Ethical Hacking', 'ETL Tools',
  'Event Management', 'Event Planning', 'Excel', 'Excel Advanced', 'Excellent analytical skills',
  'Excellent english comm', 'Executive Management', 'Exit Formalities', 'Expectation Management',
  'Export', 'Export Documentation Knowledge', 'Express.js', 'Eye Care Products', 'Eye Testing',
  'F Cut', 'Facebook Ads', 'Facilitation', 'Facility Management', 'Factory Management',
  'Farmers Visit', 'Fashion Design', 'Feedback Delivery', 'Feedback Giving', 'Feedback Receiving',
  'FEMA', 'Fertilisers Sales', 'Fertilizer', 'FICO', 'Field Sales', 'Field Survey', 'Figma',
  'File Login', 'File Processing', 'Filling of BRC', 'Finacle', 'Finance', 'Financial Analysis',
  'Financial Modeling', 'Financial Modelling', 'Financial Planning', 'Financial Risk Management',
  'Fire', 'Fire safety', 'Firebase', 'Firewall Management', 'Flask', 'Flexibility', 'Flutter',
  'FMCD', 'FMCG', 'Follow Up', 'Food', 'Footwear', 'Forecasting', 'Forensics', 'FoxPro',
  'Fresher', 'Freshers', 'Front-End Development', 'Full-Stack Development', 'Fundraising',
  'Fusion 360', 'Game Design', 'Game Development', 'Gardening', 'General Ledger',
  'Genetic Engineering', 'Geographic Information Systems', 'GitHub Actions', 'GitLab CI', 'Go',
  'Goal Setting', 'Gold Appraisal', 'Gold Finishing/Packaging', 'Gold Loan', 'Gold Loan Sales',
  'Gold Testing', 'Good Communication', 'Good Communication Skills', 'Good Learner',
  'Good management', 'Google Ads', 'Google Analytics', 'Google Cloud Platform',
  'Google Data Studio', 'Government Relations', 'Government Tendering', 'Grafana',
  'Graphic Design', 'GraphQL', 'Grass Cutting', 'Grease', 'GRN', 'Group Loan Sales',
  'Growth Mindset', 'GST', 'HANA', 'Handling Complaints', 'Hard Working', 'Hardware',
  'Hardware Troubleshooting', 'Haskell', 'Healthcare Administration', 'Healthcare Management',
  'Heat Treatment', 'Heavy Machinery Sales', 'Help Desk', 'Helper', 'Heroku', 'Hindi', 'HL',
  'Home Interior Solutions', 'Home Loan', 'Home Loan Sales', 'Honest', 'Hospital Administration',
  'Hospitality Management', 'Hotel Management', 'Housekeeping Management', 'HR', 'HR Admin',
  'HR Analytics', 'HR Management', 'HR Operations', 'HTML', 'Human Resources', 'Humor',
  'HVAC Systems', 'IBM Cloud', 'IDS/IPS', 'IFFCO Sagrika', 'Illustration', 'Immunology',
  'Import', 'Inbound Process', 'Incident Response', 'Industrial Engineering', 'Industrial Safety',
  'Influencer Marketing', 'Influencing Others', 'Influencing Skills', 'Information Management',
  'Information Security', 'Information Technology', 'Initiative', 'Innovation', 'Innovative',
  'Inside sales', 'Institutional Sales', 'Instructional Design', 'Insurance', 'Insurance Advisor',
  'Insurance Sales', 'Insurance Selling', 'Integrity', 'Interaction Design', 'Interior Design',
  'International Business', 'Internet Sales', 'Interpersonal Skills', 'Interview Coordination',
  'Interviewing', 'Inventory Management', 'Inverter Sales', 'Investment Analysis', 'InVision',
  'Inward', 'Inward/Outward', 'Ionic', 'iOS Development', 'iOS Programming', 'IOT Development',
  'IRDA Exam Preparation', 'IT Governance', 'IT Hardware', 'IT Infrastructure', 'IT Sales',
  'IT Software', 'IT Support', 'ITI', 'ITI Electrical', 'Iti electrician', 'ITR', 'Java',
  'JavaScript', 'Jenkins', 'Job Seeker', 'Joining Formalities', 'Journalism', 'jQuery',
  'Kaithal', 'Kaizen', 'Kanban', 'Keras', 'Key Account Management', 'Kindness',
  'Knowledge Management', 'Knowledge Sharing', 'Kotlin', 'Kotlin Multiplatform', 'Kubernetes',
  'KYC', 'KYC Documentation', 'L Cut', 'Lab Chemist', 'Lab Management', 'Labor Relations',
  'Labour Handling', 'Landline Phone Manufacturing', 'Language English and Hindi', 'LAP',
  'LAP- Loan Against Property', 'Laravel', 'Lead Generation', 'Leadership', 'Leadership skills',
  'Leadership Under Uncertainty', 'Lean Six Sigma', 'Learning Agility', 'leas', 'LED Light',
  'LED Lights', 'Legal Compliance', 'Legal Research', 'Less', 'Liaison Executive',
  'Life Insurance', 'Linguistics', 'Linux Administration', 'Loan', 'Loan Disbursement',
  'Loan Products', 'Loan Sales', 'Loans', 'Logic Controller', 'Logistics', 'Lubricants',
  'Machine Learning', 'mails/chats', 'Maintenance Management', 'Maintenance/Support',
  'Making Detailing of Parts', 'Malware Analysis', 'Management', 'Managing Security Devices',
  'Manpower Hiring', 'Manpower Planning', 'Manufacturing', 'MariaDB', 'Market Analysis',
  'Market Research', 'Marketing', 'Marketing Automation', 'Material Handling',
  'Material Management', 'MATLAB', 'Matplotlib', 'Maya', 'Mechanical', 'Mechanical Draftsperson',
  'Mechanical Draughtsman', 'Mechanical Engineering', 'Media Relations', 'Mediation',
  'Medical Coding', 'Mentoring', 'Mergers and Acquisitions', 'Meter Installation',
  'Micro Finance', 'Micro Loan', 'Micro Loan Sales', 'Microbiology', 'Microservices',
  'Microsoft Azure', 'Microsoft Office', 'MIS', 'MIS Excel', 'MIS Executive', 'MM', 'Mobile',
  'Mobile App Development', 'Mobile Development', 'Mobile Sales', 'Molecular Biology', 'MongoDB',
  'MonkeyScare Spikes', 'Mortgage', 'Motivating Others', 'Motivation', 'MS Dynamics',
  'MS Excel Advanced', 'MS Office', 'MSME Loan', 'Multitasking', 'MySQL', 'Nagios',
  'Nanotechnology', 'Natural Language Processing', 'Negotiation', 'Negotiation Skills',
  'Negotiation Tactics', 'Network Administration', 'Network Security', 'Network Solutions',
  'Network Support', 'Networking', 'News Paper Sales', 'Next.js', 'Node.js', 'Nonprofit Management',
  'Nonverbal Communication', 'Non-Verbal Communication', 'NoSQL', 'Not Destructive Testing',
  'NumPy', 'Nursing', 'Nuxt.js', 'Objective-C', 'Object-Oriented Programming',
  'Observation Skills', 'Offer Letter Generation', 'Office Administration', 'Office Administrator',
  'Office Management', 'Onboarding', 'Online Advertising', 'Open Market Sales', 'Open-Mindedness',
  'Operations', 'Operations Management', 'Operations Strategy', 'Oracle', 'Oracle DB',
  'Oracle ERP', 'Organization', 'Organizational Development', 'Organizational Skills',
  'OS Installation', 'Outbound Calling', 'Outbound Calls', 'outbound sales', 'outlook',
  'Outward', 'Packaging', 'Paint Order Generation', 'Paint Sales', 'Paints',
  'PAN/Adhaar Verification', 'Pandas', 'Patent Law', 'Pathology', 'Patience', 'Patient Care',
  'Payroll', 'Payroll Management', 'Payroll Processing', 'Penetration Testing', 'People Management',
  'Performance Analysis', 'Performance Management', 'Perl', 'Personal Loan', 'Personal Loan Sales',
  'Persuasion', 'Persuasive Writing', 'Pesticides Spraying', 'Pharma', 'Pharma Sales',
  'Pharmaceutical Sales', 'Pharmacy', 'Photography', 'Photography Editing', 'PHP', 'Physics',
  'Pipeline Management', 'PL/SQL', 'Plan Sales', 'Planning', 'Plant Trees Flowers',
  'PLC Programming', 'Plywood', 'PO', 'PO Creation', 'Podcasting', 'Policy Analysis',
  'Policy Development', 'Polymer Pipe Sales', 'Portal Sourcing', 'Portfolio Analysis',
  'Portfolio Management', 'Positive Attitude', 'PostgreSQL', 'Pouring', 'Power BI',
  'Power Distribution', 'Power Energy', 'Power Supply', 'Power Systems', 'Predictive Analytics',
  'Premiere Pro', 'Prepration Of Books', 'Presentable', 'Presentation Design',
  'Presentation Skills', 'Press Release Writing', 'Prioritization', 'Problem Solving',
  'Process Engineering', 'Process Improvement', 'Procurement', 'Product demo', 'Product Design',
  'Product Development', 'Product Management', 'Product Strategy', 'Product Survey',
  'Product Testing', 'Production', 'Production Line Control', 'Production Planning',
  'Professional Writing', 'Professionalism', 'Program Management', 'Programmer', 'Programming',
  'Project Coordination', 'Project Management', 'Project Planning', 'Project Salary',
  'Project Sales', 'Prometheus', 'Promoter', 'Proofreading', 'property sales', 'Proteus',
  'Prototyping', 'Psychology', 'Public Health', 'Public Relations', 'Public Speaking',
  'Punctuality', 'Puppet', 'Purchase', 'Purchasing', 'PVC Pipe Sales', 'Python', 'PyTorch',
  'QlikView', 'Quality Assurance', 'Quality Checking', 'Quality Control', 'Quality Improvement',
  'Quality Testing', 'Quantitative Analysis', 'QuickBooks', 'R', 'R Programming', 'Radiology',
  'Rapport Building', 'React Native', 'React.js', 'Ready For Interview', 'Reaf Raking',
  'Real Estate', 'Real Estate Management', 'Real estate sales', 'Recommendation Systems',
  'Reconciliation', 'Recruiting', 'Recruitment', 'Recruitment Strategy', 'Redis',
  'Regulatory Compliance', 'Reinforcement Learning', 'Relationship Building',
  'Relationship Management', 'Relationship Manager', 'Remote Collaboration',
  'Remote Team Management', 'Renewable Energy Systems', 'Repairing', 'Report Generation',
  'Report Writing', 'Reports', 'Research', 'Research Analysis', 'Research Skills',
  'Residential sales', 'Resilience', 'Resource Management', 'Respectfulness', 'Responsibility',
  'Retail', 'Retail Management', 'Retail Sales', 'Retail sales Promoter', 'Revenue Management',
  'Rider Handling', 'Risk Analysis', 'Risk Assessment', 'Risk Management', 'RMC',
  'Robotic Process Automation', 'Robotics', 'Ruby', 'Ruby on Rails', 'Rust', 'Safety',
  'Safety Officer Activities', 'Salary Process', 'Sales', 'Sales / Marketing',
  'Sales Coordinator', 'Sales Lead Generation', 'Sales Promoter', 'Sales to service',
  'Salesforce CRM', 'SAP', 'SAP FICO', 'Sass', 'Savings Account Opening', 'SCADA Systems',
  'Scala', 'Scheduling', 'Scientific Research', 'Scikit-learn', 'Scrum', 'Seaborn',
  'Search Engine Marketing', 'Search Engine Marketing (SEM)', 'Search Engine Optimization',
  'Search Engine Optimization (SEO)', 'Security', 'Security Auditing',
  'Security Services Packages Sales', 'Security System', 'Seeds', 'Self-Awareness',
  'Self-Confidence', 'Self-Discipline', 'Self-Motivation', 'Self-Regulation', 'SEM', 'SEO',
  'Server Management', 'Serverless Computing', 'Service Delivery', 'Service Mindset',
  'SharePoint', 'Shift Incharge', 'Shift Management', 'Shipping', 'Shop Visits', 'SIEM',
  'Sim Card Sales', 'Simulink', 'Single Line Diagram', 'Site Engineer', 'Site Supervisor',
  'Six Sigma', 'Sketch', 'Sludge / Salt Operations', 'Slump Monitoring',
  'Smart Electric Meter Installation', 'Smart Metering', 'SME Loan', 'Social Media Advertising',
  'Social Media Management', 'Social Skills', 'Software', 'Software Architecture',
  'Software Development', 'Software Engineering', 'Software Project Management',
  'Software Sales', 'Software Testing', 'Solar', 'Solar Panel', 'SolidWorks',
  'Source Home Loan Files through DSA', 'Spare Parts Sales', 'Speech Recognition', 'Spine',
  'Splunk', 'Spring Boot', 'SQL', 'SQLite', 'STAAD Pro', 'Stakeholder Management',
  'Statistical Analysis', 'Statistical Modelling', 'STEM Education', 'Stock Maintaining report',
  'Store Inventory', 'Store Promoter', 'Storytelling', 'Strategic Leadership',
  'Strategic Marketing', 'Strategic Planning', 'Strategic Thinking', 'Stress Management',
  'Structural Engineering', 'Sunglasses Sales', 'Supervisory Skills', 'Supply Chain',
  'Supply Chain Management', 'Supply Management', 'Surgical Assistance', 'Surveillance Drone',
  'Sustainability', 'Svelte', 'Swift', 'SwiftUI', 'System Administration', 'Systems Analysis',
  'Tableau', 'Tailwind CSS', 'Talent Acquisition', 'Talent Development', 'Tally', 'Tally ERP',
  'Tax Preparation', 'Taxation', 'TDS', 'Teaching', 'Team Building', 'Team Handling',
  'Team Lead', 'Team Leadership', 'Team Management', 'Team work', 'Teamwork',
  'Technical Documentation', 'Technical Sales', 'Technical Support', 'Technical Writing',
  'Technician', 'Tele Caller', 'Tele sales', 'Telecalling', 'Telecom', 'Telecom Sales',
  'Telecommunications', 'TeleSales', 'Tender Filling', 'Tender Management', 'TensorFlow',
  'Terraform', 'Test Automation', 'Testing', 'Therapeutic Skills', 'Time Management',
  'Tolerance', 'Tolerance for Ambiguity', 'Trainee', 'Training', 'Training Delivery',
  'Training development', 'Training Management', 'Training Program', 'Transcription',
  'Transformer Meter Installation', 'Transformers', 'Translation', 'Transportation Management',
  'Travel Management', 'Travis CI', 'Troubleshoot', 'Troubleshooting', 'Trust Building',
  'Trustworthiness', 'TypeScript', 'Tyre Sales', 'UI Design', 'UI/UX Design', 'Ultrasonic Test',
  'Unit GA BOM', 'Unity 3D', 'Unreal Engine', 'UPI', 'UX Design', 'VAC Products', 'Valuation',
  'Vendor Management', 'Verbal Communication', 'Video Editing', 'Video KYC Process',
  'Video Marketing', 'Video Production', 'Virtual Assistance', 'Virtual Reality',
  'Vision Setting', 'Visionary Thinking', 'Visual Design', 'Vlookup', 'Vue.js',
  'Vulnerability Assessment', 'Warehouse', 'Warehouse Activities', 'Warehouse Management',
  'Warehouse Operations', 'Web Analytics', 'Web Design', 'Web Development', 'Web Security',
  'Website', 'Weighment', 'WiFi', 'Wi-Fi Router', 'WiFi Sales', 'Windows Administration',
  'Wire', 'Wireframing', 'Wiring', 'WordPress', 'Work Ethic', 'Workforce Planning',
  'Workplace Safety', 'Writing', 'Writing Skills', 'Written Communication', 'Xamarin',
  'ZBrush', 'Zero Trust Architecture'
];

// Function to create key skills field
async function createKeySkillsField() {
  try {
    console.log('Starting to seed key skills data...');

    // Create a dummy admin user ID for createdBy field
    const adminUserId = new mongoose.Types.ObjectId();

    // Convert skills array to options format
    const skillOptions = keySkills.map((skill, index) => ({
      value: skill,
      label: skill,
      order: index
    }));

    // Delete existing keySkills field first
    await CustomField.deleteMany({ fieldId: 'keySkills' });
    
    // Create the key skills field
    const keySkillsField = new CustomField({
      fieldId: 'keySkills',
      name: 'keySkills',
      label: 'Key Skills Name',
      fieldType: 'multiselect',
      styling: { 
        placeholder: 'Key Skills Name (Show 10 to 12 Suggestion Also)' 
      },
      validation: { 
        required: true, 
        max: 12 
      },
      options: skillOptions,
      placement: { 
        section: 'jobseeker_profile', 
        order: 12, 
        group: 'experience' 
      },
      status: 'active',
      createdBy: adminUserId
    });
    
    await keySkillsField.save();

    console.log('Key skills data seeded successfully!');
    console.log(`Total skills added: ${keySkills.length}`);
  } catch (error) {
    console.error('Error seeding key skills data:', error);
  }
}

// Run the seeding function
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala')
  .then(() => {
    console.log('Connected to MongoDB');
    return createKeySkillsField();
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

module.exports = { createKeySkillsField, keySkills };
