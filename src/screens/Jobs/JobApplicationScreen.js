import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';
import { getIndustries, getSubIndustries } from '../../data/industriesData';
import { getDepartments, getSubDepartments } from '../../data/departmentsData';

const JobApplicationScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [showJobStatusDropdown, setShowJobStatusDropdown] = useState(false);
  const [showJobTitleDropdown, setShowJobTitleDropdown] = useState(false);
  const [jobTitleSearch, setJobTitleSearch] = useState('');
  const [showKeySkillsDropdown, setShowKeySkillsDropdown] = useState(false);
  const [keySkillsSearch, setKeySkillsSearch] = useState('');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [industrySearch, setIndustrySearch] = useState('');
  const [showSubIndustryDropdown, setShowSubIndustryDropdown] = useState(false);
  const [subIndustrySearch, setSubIndustrySearch] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [showSubDepartmentDropdown, setShowSubDepartmentDropdown] = useState(false);
  const [subDepartmentSearch, setSubDepartmentSearch] = useState('');
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: '',
    mobileNumber: '',
    whatsappAvailable: false,
    email: '',
    dateOfBirth: new Date(),
    gender: '',
    maritalStatus: '',
    englishFluency: '',

    // Step 2: Experience & Professional Details
    experienceLevel: '',
    yearsOfExperience: '',
    jobStatus: '',
    currentJobTitle: [],
    keySkills: [], // Changed to array for multiple selections
    currentCompany: '',
    currentSalary: '',
    currentIndustry: '',
    industries: [], // New: Up to 5 industries
    subIndustries: [], // New: Up to 5 sub-industries
    currentDepartment: '',
    departments: [], // New: Up to 6 departments
    subDepartments: [], // New: Up to 6 sub-departments
    currentJobRoles: '',
    preferredLocations: '',
    readyToRelocate: '',
    noticePeriod: '',

    // Step 3: Education
    educationLevel: '',
    course: '',
    specialization: '',

    // Step 4: Additional Details
    currentAddress: '',
    bikeAvailable: '',
    drivingLicense: '',
    referralSource: '',

    // Step 5: Documents & Agreement
    resume: null,
    privacyPolicyAgreed: false,
  });

  const totalSteps = 5;

  const steps = [
    { number: 1, title: 'Personal Info', icon: 'person' },
    { number: 2, title: 'Experience', icon: 'briefcase' },
    { number: 3, title: 'Education', icon: 'school' },
    { number: 4, title: 'Additional', icon: 'information-circle' },
    { number: 5, title: 'Submit', icon: 'checkmark-circle' },
  ];

  const experienceOptions = [
    'Fresher',
    '1 Month',
    '2 Months',
    '3 Months',
    '6 Months',
    '9 Months',
    '1 Year',
    '1.5 Years',
    '2 Years',
    '2.5 Years',
    '3 Years',
    '3.5 Years',
    '4 Years',
    '4.5 Years',
    '5 Years',
    '5.5 Years',
    '6 Years',
    '6.5 Years',
    '7 Years',
    '7.5 Years',
    '8 Years',
    '8.5 Years',
    '9 Years',
    '9.5 Years',
    '10 Years',
    '10.5 Years',
    '11 Years',
    '11.5 Years',
    '12 Years',
    '12.5 Years',
    '13 Years',
    '13.5 Years',
    '14 Years',
    '14.5 Years',
    '15 Years',
    '15.5 Years',
    '16 Years',
    '16.5 Years',
    '17 Years',
    '17.5 Years',
    '18 Years',
    '18.5 Years',
    '19 Years',
    '19.5 Years',
    '20 Years',
    '20.5 Years',
    '21 Years',
    '21.5 Years',
    '22 Years',
    '22.5 Years',
    '23 Years',
    '23.5 Years',
    '24 Years',
    '24.5 Years',
    '25 Years',
    '25.5 Years',
    '26 Years',
    '26.5 Years',
    '27 Years',
    '27.5 Years',
    '28 Years',
    '28.5 Years',
    '29 Years',
    '29.5 Years',
    '30 Years',
    '30.5 Years',
    '31 Years',
    '31.5 Years',
    '32 Years',
    '32.5 Years',
    '33 Years',
    '33.5 Years',
    '34 Years',
    '34.5 Years',
    '35 Years',
    '35.5 Years',
    '36 Years',
    '36 Years Plus',
  ];

  const jobStatusOptions = [
    'Working',
    'Not Working',
  ];

  const keySkillsOptions = [
    '3D Modeling', '3D Printing', '5S', 'Access Control System', 'Accountability', 'Accounting', 'Accounts', 'Achieving Sales Target', 'Active Learning', 'Active Listening', 'Active Problem Resolution', 'Active Questioning', 'Adaptability', 'Adaptability to Change', 'Admin', 'Administrative Support', 'Adobe Illustrator', 'Adobe Photoshop', 'Adobe XD', 'Advance Excel', 'Affiliate Marketing', 'After Effects', 'After-Sales Support', 'Agent Recruitment', 'Agile Methodologies', 'Agile Project Management', 'Agility', 'Agri Products Sales', 'Agri Sales', 'Agriculture', 'Agriculture Loan Sales', 'Agriculture Products', 'Analytical Reasoning', 'Analytical Thinking', 'Anatomy Knowledge', 'Android Development', 'Angular', 'Animation', 'Ansible', 'ANSYS', 'App Development', 'Artificial Intelligence', 'ASP.NET Core', 'Assembling', 'Attandance Management', 'Attendance Management', 'Attention to Detail', 'Audit', 'Audit Management', 'Auditing', 'AutoCAD', 'AutoCAD Software & SketchUp', 'Automation', 'Automotive Parts Sales', 'AWS', 'B2B', 'B2B sales', 'B2C', 'Banca Channel', 'Banking Operations', 'Banking Products Sales', 'Batteries Sales', 'BFSI', 'Bidding', 'Big Data', 'Bill Generation', 'Bill Payable/Receivable', 'Billing', 'Billing/Invoicing', 'Biotechnology', 'BirdScare Spikes', 'Blender', 'Blockchain', 'Blog Writing', 'Body Language Awareness', 'Bookkeeping', 'Bootstrap', 'Box Packaging', 'Brainstorming', 'Brand Management', 'Broadband Sales', 'Budgeting', 'Building Materials', 'Building Materials Sales', 'Building Products Division', 'Business Analysis', 'Business Communication', 'Business Development', 'Business Forecasting', 'Business Intelligence', 'Business Loan', 'Business Loan Sales', 'Business Strategy', 'C', 'C Programming', 'C#', 'C++', 'CAD', 'CAD Technician', 'CakePHP', 'Call Center Management', 'Call Handling', 'Calling', 'Campaign Management', 'Canva', 'CASA', 'CASA Sales', 'Case Management', 'Cashier', 'Cassandra', 'CATIA', 'CatiaV5', 'CCTV Monitoring', 'Cement', 'Cement Sales', 'Challans', 'Change Management', 'Channel partners', 'Channel Sales', 'Chef', 'Chemical', 'Chemicals Spraying', 'Chief Architect 3D', 'CI/CD Pipelines', 'Cinema 4D', 'Circuit Design', 'Civil', 'Civil Engineering', 'Client Relations', 'Client Relationship Management', 'Clinical Research', 'Cloud Architecture', 'Cloud Automation', 'Cloud Computing', 'Cloud Security', 'Coaching', 'CodeIgniter', 'Coding', 'Cold calling', 'Collaboration', 'Collaboration Across Teams', 'Collaboration with Multicultural Teams', 'Collaboration with Remote Teams', 'Collaborative Relation Skills', 'Collection', 'Commercial Sales', 'Commercial Vehicle Sales', 'Communication', 'Communication skill', 'Community Engagement', 'Compassion', 'Complaint and query', 'Compliance', 'Compliances', 'Computer', 'Computer Vision', 'Computer work', 'Concrete Curing', 'Confidence', 'Confidentiality', 'Conflict Management', 'Conflict Resolution', 'Consensus Building', 'Construction and Mining Machinery Sales', 'Construction Sales', 'Construction Site Visit', 'Constructive Criticism', 'Constructive Feedback', 'Consultative Selling', 'Consulting', 'Consumer Finance', 'Consumer Loan Sales', 'Content Creation', 'Content Management', 'Content Marketing', 'Contract Management', 'convincing power', 'Coordinating Events', 'Copywriting', 'CorelDRAW', 'Corporate Strategy', 'Cost Management', 'Cost Reduction', 'CouchDB', 'counter sales', 'create Automated Reports', 'Creative Thinking', 'Creative Writing', 'Creativity', 'Credit', 'Credit Card Sales', 'Credit Operations', 'Crisis Management', 'Critical Observation', 'Critical Thinking', 'CRM Software', 'Crop Scouting', 'Cross Selling', 'Cross-Cultural Communication', 'Cross-Functional Communication', 'Cross-Functional Leadership', 'Cryptography', 'CSS', 'Cube Casting', 'Cube Testing', 'Cultural Awareness', 'Curiosity', 'Current Account Opening', 'Current Account Sales', 'Customer Acquisition', 'Customer Empathy', 'Customer Feedback', 'Customer Handling', 'Customer Management', 'Customer Orientation', 'Customer Relationship Management', 'Customer Retention', 'Customer Satisfaction', 'Customer Service', 'Customer Support', 'Cybersecurity', 'Daily Line Up', 'Daily Sales Report', 'Data Analysis', 'Data Engineering', 'Data Entry', 'Data Governance', 'Data Management', 'Data Mining', 'Data Science', 'Data Visualization', 'Database Management', 'DCA', 'Dealer Management', 'Dealer Visit', 'Debugging', 'Decision Making', 'Decision-Making Under Pressure', 'Deep Learning', 'Delegation', 'Delivery Slot Handling', 'DEO', 'Dependability', 'Design Draughtsman', 'Design Thinking', 'Desktop Support', 'DevOps', 'Diagnostic Testing', 'Digital Marketing', 'Digital Strategy', 'DigitalOcean', 'Diplomacy', 'Disbursement', 'Dispatch', 'Dispute Resolution', 'Distributor Management', 'Diversity and Inclusion', 'Django', 'Docker', 'Documentation', 'Documents Verification', 'Drafting & Part Design', 'Drafting techniques, and blueprint interpretation', 'Draftsman', 'Drone Flying', 'DSA', 'DSA Channel', 'DT Metering', 'E KYC', 'E-commerce', 'Economics', 'Editing', 'EDPMS', 'Education Loan', 'Electric Vehicle Sales', 'Electrical', 'Electrical Diagram', 'Electrical Engineering', 'Electrical Installation', 'Electrical Parts', 'Electrical Technology', 'Electrical Work', 'Electrical Works', 'Electrician', 'Electrician Work', 'Electricity', 'Electronic', 'Electronics and Telecommunication', 'Elixir', 'Email Marketing', 'email process', 'Embedded Systems', 'Emergency Response', 'EMI Collection', 'Emotional Intelligence', 'Empathy', 'Employee Engagement', 'Employee Relations', 'Engine Oil', 'Engineering Design', 'English', 'English speaking', 'Enterprise Architecture', 'Enthusiasm', 'Environmental Management', 'Epidemiology', 'Equity Research', 'ERP Now', 'ERP Systems', 'Ethical Hacking', 'ETL Tools', 'Event Management', 'Event Planning', 'Excel', 'Excel Advanced', 'Excellent analytical skills', 'Excellent english comm', 'Executive Management', 'Exit Formalities', 'Expectation Management', 'Export', 'Export Documentation Knowledge', 'Express.js', 'Eye Care Products', 'Eye Testing', 'F Cut', 'Facebook Ads', 'Facilitation', 'Facility Management', 'Factory Management', 'Farmers Visit', 'Fashion Design', 'Feedback Delivery', 'Feedback Giving', 'Feedback Receiving', 'FEMA', 'Fertilisers Sales', 'Fertilizer', 'FICO', 'Field Sales', 'Field Survey', 'Figma', 'File Login', 'File Processing', 'Filling of BRC', 'Finacle', 'Finance', 'Financial Analysis', 'Financial Modeling', 'Financial Modelling', 'Financial Planning', 'Financial Risk Management', 'Fire', 'Fire safety', 'Firebase', 'Firewall Management', 'Flask', 'Flexibility', 'Flutter', 'FMCD', 'FMCG', 'Follow Up', 'Food', 'Footwear', 'Forecasting', 'Forensics', 'FoxPro', 'Fresher', 'Freshers', 'Front-End Development', 'Full-Stack Development', 'Fundraising', 'Fusion 360', 'Game Design', 'Game Development', 'Gardening', 'General Ledger', 'Genetic Engineering', 'Geographic Information Systems', 'GitHub Actions', 'GitLab CI', 'Go', 'Goal Setting', 'Gold Appraisal', 'Gold Finishing/Packaging', 'Gold Loan', 'Gold Loan Sales', 'Gold Testing', 'Good Communication', 'Good Communication Skills', 'Good Learner', 'Good management', 'Google Ads', 'Google Analytics', 'Google Cloud Platform', 'Google Data Studio', 'Government Relations', 'Government Tendering', 'Grafana', 'Graphic Design', 'GraphQL', 'Grass Cutting', 'Grease', 'GRN', 'Group Loan Sales', 'Growth Mindset', 'GST', 'HANA', 'Handling Complaints', 'Hard Working', 'Hardware', 'Hardware Troubleshooting', 'Haskell', 'Healthcare Administration', 'Healthcare Management', 'Heat Treatment', 'Heavy Machinery Sales', 'Help Desk', 'Helper', 'Heroku', 'Hindi', 'HL', 'Home Interior Solutions', 'Home Loan', 'Home Loan Sales', 'Honest', 'Hospital Administration', 'Hospitality Management', 'Hotel Management', 'Housekeeping Management', 'HR', 'HR Admin', 'HR Analytics', 'HR Management', 'HR Operations', 'HTML', 'Human Resources', 'Humor', 'HVAC Systems', 'IBM Cloud', 'IDS/IPS', 'IFFCO Sagrika', 'Illustration', 'Immunology', 'Import', 'Inbound Process', 'Incident Response', 'Industrial Engineering', 'Industrial Safety', 'Influencer Marketing', 'Influencing Others', 'Influencing Skills', 'Information Management', 'Information Security', 'Information Technology', 'Initiative', 'Innovation', 'Innovative', 'Inside sales', 'Institutional Sales', 'Instructional Design', 'Insurance', 'Insurance Advisor', 'Insurance Sales', 'Insurance Selling', 'Integrity', 'Interaction Design', 'Interior Design', 'International Business', 'Internet Sales', 'Interpersonal Skills', 'Interview Coordination', 'Interviewing', 'Inventory Management', 'Inverter Sales', 'Investment Analysis', 'InVision', 'Inward', 'Inward/Outward', 'Ionic', 'iOS Development', 'iOS Programming', 'IOT Development', 'IRDA Exam Preparation', 'IT Governance', 'IT Hardware', 'IT Infrastructure', 'IT Sales', 'IT Software', 'IT Support', 'ITI', 'ITI Electrical', 'Iti electrician', 'ITR', 'Java', 'JavaScript', 'Jenkins', 'Job Seeker', 'Joining Formalities', 'Journalism', 'jQuery', 'Kaithal', 'Kaizen', 'Kanban', 'Keras', 'Key Account Management', 'Kindness', 'Knowledge Management', 'Knowledge Sharing', 'Kotlin', 'Kotlin Multiplatform', 'Kubernetes', 'KYC', 'KYC Documentation', 'L Cut', 'Lab Chemist', 'Lab Management', 'Labor Relations', 'Labour Handling', 'Landline Phone Manufacturing', 'Language English and Hindi', 'LAP', 'LAP- Loan Against Property', 'Laravel', 'Lead Generation', 'Leadership', 'Leadership skills', 'Leadership Under Uncertainty', 'Lean Six Sigma', 'Learning Agility', 'leas', 'LED Light', 'LED Lights', 'Legal Compliance', 'Legal Research', 'Less', 'Liaison Executive', 'Life Insurance', 'Linguistics', 'Linux Administration', 'Loan', 'Loan Disbursement', 'Loan Products', 'Loan Sales', 'Loans', 'Logic Controller', 'Logistics', 'Lubricants', 'Machine Learning', 'mails/chats', 'Maintenance Management', 'Maintenance/Support', 'Making Detailing of Parts', 'Malware Analysis', 'Management', 'Managing Security Devices', 'Manpower Hiring', 'Manpower Planning', 'Manufacturing', 'MariaDB', 'Market Analysis', 'Market Research', 'Marketing', 'Marketing Automation', 'Material Handling', 'Material Management', 'MATLAB', 'Matplotlib', 'Maya', 'Mechanical', 'Mechanical Draftsperson', 'Mechanical Draughtsman', 'Mechanical Engineering', 'Media Relations', 'Mediation', 'Medical Coding', 'Mentoring', 'Mergers and Acquisitions', 'Meter Installation', 'Micro Finance', 'Micro Loan', 'Micro Loan Sales', 'Microbiology', 'Microservices', 'Microsoft Azure', 'Microsoft Office', 'MIS', 'MIS Excel', 'MIS Executive', 'MM', 'Mobile', 'Mobile App Development', 'Mobile Development', 'Mobile Sales', 'Molecular Biology', 'MongoDB', 'MonkeyScare Spikes', 'Mortgage', 'Motivating Others', 'Motivation', 'MS Dynamics', 'MS Excel Advanced', 'MS Office', 'MSME Loan', 'Multitasking', 'MySQL', 'Nagios', 'Nanotechnology', 'Natural Language Processing', 'Negotiation', 'Negotiation Skills', 'Negotiation Tactics', 'Network Administration', 'Network Security', 'Network Solutions', 'Network Support', 'Networking', 'News Paper Sales', 'Next.js', 'Node.js', 'Nonprofit Management', 'Nonverbal Communication', 'Non-Verbal Communication', 'NoSQL', 'Not Destructive Testing', 'NumPy', 'Nursing', 'Nuxt.js', 'Objective-C', 'Object-Oriented Programming', 'Observation Skills', 'Offer Letter Generation', 'Office Administration', 'Office Administrator', 'Office Management', 'Onboarding', 'Online Advertising', 'Open Market Sales', 'Open-Mindedness', 'Operations', 'Operations Management', 'Operations Strategy', 'Oracle', 'Oracle DB', 'Oracle ERP', 'Organization', 'Organizational Development', 'Organizational Skills', 'OS Installation', 'Outbound Calling', 'Outbound Calls', 'outbound sales', 'outlook', 'Outward', 'Packaging', 'Paint Order Generation', 'Paint Sales', 'Paints', 'PAN/Adhaar Verification', 'Pandas', 'Patent Law', 'Pathology', 'Patience', 'Patient Care', 'Payroll', 'Payroll Management', 'Payroll Processing', 'Penetration Testing', 'People Management', 'Performance Analysis', 'Performance Management', 'Perl', 'Personal Loan', 'Personal Loan Sales', 'Persuasion', 'Persuasive Writing', 'Pesticides Spraying', 'Pharma', 'Pharma Sales', 'Pharmaceutical Sales', 'Pharmacy', 'Photography', 'Photography Editing', 'PHP', 'Physics', 'Pipeline Management', 'PL/SQL', 'Plan Sales', 'Planning', 'Plant Trees Flowers', 'PLC Programming', 'Plywood', 'PO', 'PO Creation', 'Podcasting', 'Policy Analysis', 'Policy Development', 'Polymer Pipe Sales', 'Portal Sourcing', 'Portfolio Analysis', 'Portfolio Management', 'Positive Attitude', 'PostgreSQL', 'Pouring', 'Power BI', 'Power Distribution', 'Power Energy', 'Power Supply', 'Power Systems', 'Predictive Analytics', 'Premiere Pro', 'Prepration Of Books', 'Presentable', 'Presentation Design', 'Presentation Skills', 'Press Release Writing', 'Prioritization', 'Problem Solving', 'Process Engineering', 'Process Improvement', 'Procurement', 'Product demo', 'Product Design', 'Product Development', 'Product Management', 'Product Strategy', 'Product Survey', 'Product Testing', 'Production', 'Production Line Control', 'Production Planning', 'Professional Writing', 'Professionalism', 'Program Management', 'Programmer', 'Programming', 'Project Coordination', 'Project Management', 'Project Planning', 'Project Salary', 'Project Sales', 'Prometheus', 'Promoter', 'Proofreading', 'property sales', 'Proteus', 'Prototyping', 'Psychology', 'Public Health', 'Public Relations', 'Public Speaking', 'Punctuality', 'Puppet', 'Purchase', 'Purchasing', 'PVC Pipe Sales', 'Python', 'PyTorch', 'QlikView', 'Quality Assurance', 'Quality Checking', 'Quality Control', 'Quality Improvement', 'Quality Testing', 'Quantitative Analysis', 'QuickBooks', 'R', 'R Programming', 'Radiology', 'Rapport Building', 'React Native', 'React.js', 'Ready For Interview', 'Reaf Raking', 'Real Estate', 'Real Estate Management', 'Real estate sales', 'Recommendation Systems', 'Reconciliation', 'Recruiting', 'Recruitment', 'Recruitment Strategy', 'Redis', 'Regulatory Compliance', 'Reinforcement Learning', 'Relationship Building', 'Relationship Management', 'Relationship Manager', 'Remote Collaboration', 'Remote Team Management', 'Renewable Energy Systems', 'Repairing', 'Report Generation', 'Report Writing', 'Reports', 'Research', 'Research Analysis', 'Research Skills', 'Residential sales', 'Resilience', 'Resource Management', 'Respectfulness', 'Responsibility', 'Retail', 'Retail Management', 'Retail Sales', 'Retail sales Promoter', 'Revenue Management', 'Rider Handling', 'Risk Analysis', 'Risk Assessment', 'Risk Management', 'RMC', 'Robotic Process Automation', 'Robotics', 'Ruby', 'Ruby on Rails', 'Rust', 'Safety', 'Safety Officer Activities', 'Salary Process', 'Sales', 'Sales / Marketing', 'Sales Coordinator', 'Sales Lead Generation', 'Sales Promoter', 'Sales to service', 'Salesforce CRM', 'SAP', 'SAP FICO', 'Sass', 'Savings Account Opening', 'SCADA Systems', 'Scala', 'Scheduling', 'Scientific Research', 'Scikit-learn', 'Scrum', 'Seaborn', 'Search Engine Marketing', 'Search Engine Marketing (SEM)', 'Search Engine Optimization', 'Search Engine Optimization (SEO)', 'Security', 'Security Auditing', 'Security Services Packages Sales', 'Security System', 'Seeds', 'Self-Awareness', 'Self-Confidence', 'Self-Discipline', 'Self-Motivation', 'Self-Regulation', 'SEM', 'SEO', 'Server Management', 'Serverless Computing', 'Service Delivery', 'Service Mindset', 'SharePoint', 'Shift Incharge', 'Shift Management', 'Shipping', 'Shop Visits', 'SIEM', 'Sim Card Sales', 'Simulink', 'Single Line Diagram', 'Site Engineer', 'Site Supervisor', 'Six Sigma', 'Sketch', 'Sludge / Salt Operations', 'Slump Monitoring', 'Smart Electric Meter Installation', 'Smart Metering', 'SME Loan', 'Social Media Advertising', 'Social Media Management', 'Social Skills', 'Software', 'Software Architecture', 'Software Development', 'Software Engineering', 'Software Project Management', 'Software Sales', 'Software Testing', 'Solar', 'Solar Panel', 'SolidWorks', 'Source Home Loan Files through DSA', 'Spare Parts Sales', 'Speech Recognition', 'Spine', 'Splunk', 'Spring Boot', 'SQL', 'SQLite', 'STAAD Pro', 'Stakeholder Management', 'Statistical Analysis', 'Statistical Modelling', 'STEM Education', 'Stock Maintaining report', 'Store Inventory', 'Store Promoter', 'Storytelling', 'Strategic Leadership', 'Strategic Marketing', 'Strategic Planning', 'Strategic Thinking', 'Stress Management', 'Structural Engineering', 'Sunglasses Sales', 'Supervisory Skills', 'Supply Chain', 'Supply Chain Management', 'Supply Management', 'Surgical Assistance', 'Surveillance Drone', 'Sustainability', 'Svelte', 'Swift', 'SwiftUI', 'System Administration', 'Systems Analysis', 'Tableau', 'Tailwind CSS', 'Talent Acquisition', 'Talent Development', 'Tally', 'Tally ERP', 'Tax Preparation', 'Taxation', 'TDS', 'Teaching', 'Team Building', 'Team Handling', 'Team Lead', 'Team Leadership', 'Team Management', 'Team work', 'Teamwork', 'Technical Documentation', 'Technical Sales', 'Technical Support', 'Technical Writing', 'Technician', 'Tele Caller', 'Tele sales', 'Telecalling', 'Telecom', 'Telecom Sales', 'Telecommunications', 'TeleSales', 'Tender Filling', 'Tender Management', 'TensorFlow', 'Terraform', 'Test Automation', 'Testing', 'Therapeutic Skills', 'Time Management', 'Tolerance', 'Tolerance for Ambiguity', 'Trainee', 'Training', 'Training Delivery', 'Training development', 'Training Management', 'Training Program', 'Transcription', 'Transformer Meter Installation', 'Transformers', 'Translation', 'Transportation Management', 'Travel Management', 'Travis CI', 'Troubleshoot', 'Troubleshooting', 'Trust Building', 'Trustworthiness', 'TypeScript', 'Tyre Sales', 'UI Design', 'UI/UX Design', 'Ultrasonic Test', 'Unit GA BOM', 'Unity 3D', 'Unreal Engine', 'UPI', 'UX Design', 'VAC Products', 'Valuation', 'Vendor Management', 'Verbal Communication', 'Video Editing', 'Video KYC Process', 'Video Marketing', 'Video Production', 'Virtual Assistance', 'Virtual Reality', 'Vision Setting', 'Visionary Thinking', 'Visual Design', 'Vlookup', 'Vue.js', 'Vulnerability Assessment', 'Warehouse', 'Warehouse Activities', 'Warehouse Management', 'Warehouse Operations', 'Web Analytics', 'Web Design', 'Web Development', 'Web Security', 'Website', 'Weighment', 'WiFi', 'Wi-Fi Router', 'WiFi Sales', 'Windows Administration', 'Wire', 'Wireframing', 'Wiring', 'WordPress', 'Work Ethic', 'Workforce Planning', 'Workplace Safety', 'Writing', 'Writing Skills', 'Written Communication', 'Xamarin', 'ZBrush', 'Zero Trust Architecture',
  ];

  const jobTitleOptions = [
    'Fresher',
    'AC-Air Conditioner Sales',
    'AC-Air Conditioner Technician',
    'Accountant',
    'Accounting',
    'Accounts / Finance',
    'Accounts clerk',
    'Accounts Executive',
    'Admin',
    'Admin Executive',
    'Advisory Services',
    'Aea Head',
    'Agency Channel',
    'Agribusiness / Marketing',
    'Agriculture Loan Sales',
    'Analyst',
    'Android Developer',
    'Apprentice carpenter',
    'Assembly line worker',
    'ATM Engineer',
    'ATM Staff',
    'Auditing',
    'Auto Driver',
    'Auto Loan Sales',
    'Automated Metering',
    'Automobiles Sales',
    'Automotive Parts Sales',
    'B2B Sales',
    'B2C Sales',
    'Background Verification',
    'Banca Channel',
    'Banking',
    'Banking Operations',
    'Banking Sales',
    'Beauty Parlour',
    'Bidding Officer',
    'Bike Insurance Sales',
    'Bike Loan Sales',
    'Bike Mechanic',
    'Billing / Cashier',
    'Branch Manager',
    'Brand Promoter',
    'Broadband Installation Engineer',
    'Broking Services',
    'Building Materials Sales',
    'Bus Driver',
    'Bus Mechanic',
    'Bus Sales',
    'Business Development',
    'Business Development Executive',
    'Business Head',
    'Business Loan Sales',
    'CA- Chartered Accountant',
    'Call Center Agent',
    'Calling',
    'Camera assistant',
    'Camera Sales',
    'Camera Technician',
    'Car Insurance Sales',
    'Car Loan Sales',
    'Car Mechanic',
    'Caregiver',
    'Cargo',
    'Carpenter',
    'CASA Sales',
    'Cashier',
    'Cement Sales',
    'Channel Sales',
    'Chef',
    'Chemical Engineer',
    'Chemical Engineering',
    'Civil Engineer',
    'Civil Sales',
    'Cleaner',
    'Clerk',
    'Collection',
    'Commissioning Support Services',
    'Consulting',
    'Content creator',
    'Content moderator',
    'Content Writer',
    'Cook',
    'Corporate Lawyer',
    'Corporate Salary Account Sales',
    'Country Head',
    'Courier',
    'Crane Driver',
    'Credit Card Sales',
    'Credit Operations',
    'Current Account Sales',
    'Current Affairs',
    'Customer Service Executive',
    'Customer service representative',
    'Customer Support',
    'Cybersecurity Analyst',
    'D2C Sales',
    'Dairy assistant',
    'Data annotator',
    'Data Entry',
    'Data entry operator',
    'Data Scientist',
    'Delivery',
    'Delivery Boy',
    'Digital Payment Engineer',
    'Director',
    'Distribution',
    'Dj',
    'Doctor',
    'Doctor Loan Sales',
    'Doctors',
    'Draughtsman',
    'Drill operator',
    'Driver',
    'Drone Engineer',
    'Drone Flying',
    'Drone Operator',
    'Drone Pilot',
    'DT Metering',
    'Education Loan Sales',
    'Electric Four Wheeler Sales',
    'Electric Three Wheeler Sales',
    'Electric Two Wheeler Sales',
    'Electric Vehicle Sales',
    'Electrical Engineer',
    'Electricals Product Sales',
    'Electrician',
    'Electronics Sales',
    'Energy / Power',
    'Engineering',
    'Environmental Service',
    'Event planner',
    'Executive Assistant',
    'Eye Optometrist',
    'Eye Optometrist- Fresher',
    'Facility Management',
    'Farm worker',
    'Farmer',
    'Field agent',
    'Field officer',
    'Field Operations',
    'Field researcher',
    'Field Sales',
    'Field technician',
    'Finance Officer',
    'Finance Sales',
    'Financial Analyst',
    'Fire / Safety Manager',
    'Fire / Safety Officer',
    'Fire / Safety Supervisor',
    'Fish processor',
    'Fitter',
    'FMCG Sales',
    'Food Delivery',
    'Forestry technician',
    'Freight',
    'Fridge-Refrigerator Sales',
    'Fridge-Refrigerator Technician',
    'Front desk staff',
    'Front Office',
    'Gallery assistant',
    'General Trading',
    'Geographic Information System- GIS',
    'GIS Engineer',
    'GIS Executive',
    'Gold Appraisal',
    'Gold Loan Sales',
    'Government Affairs',
    'Government Tendering',
    'Graphic Designer',
    'Grid Operations',
    'Grocery Delivery',
    'Hair Dresser',
    'Hatchery worker',
    'Health Insurance Sales',
    'Heavy Equipment Sales',
    'Heavy Machinery Sales',
    'Heavy Vehicle Sales',
    'Help desk technician',
    'Helper',
    'Home Loan Sales',
    'Hospitality Management',
    'Hotel Management',
    'Hotel Manager',
    'Hotel Sales',
    'Housekeeping',
    'Housekeeping Supervisor',
    'HR Admin',
    'Hr Executive',
    'HR Generalist',
    'HR Head',
    'HR Manager',
    'HR Operations',
    'Hr Recruiter',
    'HR Recruitment',
    'HRBP',
    'Human Resource',
    'Hydrocarbon Engineering',
    'Ice Cream Parlour',
    'Illustrator',
    'Import / Export',
    'Import / Export Executive',
    'Inspection Engineer',
    'Installation Engineer',
    'Insurance Sales',
    'Intern',
    'iOS Developer',
    'IT- Information Technology',
    'IT Recruitment',
    'ITI Electricals',
    'ITI Fitter',
    'ITI Wireman',
    'Java Developer',
    'JCB Driver',
    'Jewellery Sales',
    'Junior consultant',
    'Junior data analyst',
    'Junior designer',
    'Junior developer',
    'Junior marketer',
    'Lab Assistant',
    'Lab Chemist',
    'Lab Technician',
    'Labourer',
    'Laptop Sales',
    'Laptop-PC Technician',
    'Large Appliances Sales',
    'Law Enforcement',
    'Law Firm',
    'Leasing agent',
    'LED Light Sales',
    'LED TV Sales',
    'LED TV Technician',
    'Legal',
    'Legal assistant',
    'Liaison Executive',
    'Life Insurance Sales',
    'Lighting Technician',
    'Loader',
    'Logger',
    'Logistics Operations',
    'Machine Operator',
    'Machinery Loan Sales',
    'Maintenance',
    'Management',
    'Manpower Hiring',
    'Manufacturing',
    'Market Research',
    'Marketing',
    'Matrimonial Services',
    'Mechanic',
    'Mechanical',
    'Mechanical Engineer',
    'Medical Assistant',
    'Medical Billing',
    'Medical Coder',
    'Medical coordinator',
    'Medical Lab Technician',
    'Medical Officer',
    'Medical Representative',
    'Medical Technician',
    'Medical Transcriptionist',
    'Metal Testing',
    'Meter reader',
    'Micro Finance Sales',
    'Micro Loan Sales',
    'Milk Delivery',
    'Milk Supply',
    'MIS Executive',
    'MIS Executive- Advance Excel',
    'MIS Executive- Basic Excel',
    'Mobile Accessories Sales',
    'Mobile Sales',
    'Mobile Technician',
    'Movers',
    'Mutual Fund Sales',
    'Network Engineer',
    'NGO',
    'Non IT Recruitment',
    'Nurse',
    'Nurses',
    'Nursing',
    'Nursing Staff',
    'O&M Executive',
    'Operations',
    'Operations Executive',
    'Operator Assembling Line',
    'Outreach worker',
    'Over Draft Sales',
    'Packers',
    'Paints Sales',
    'Paralegal',
    'Parking',
    'Payroll / Compliances',
    'Peon',
    'Personal Loan Sales',
    'Pharmacist',
    'Plant Maintenance',
    'Plant Management',
    'Plumber',
    'Procurement',
    'Procurement Officer',
    'Production',
    'Property assistant',
    'Property Manager',
    'Property Sales',
    'Public Relations (PR)',
    'Purchase',
    'Python Developer',
    'QSR Sales',
    'Quality Assurance Inspector',
    'Quality Checker',
    'Quality Control',
    'Quality Engineer',
    'Quality inspector',
    'Real Estate',
    'Receptionist',
    'Recovery',
    'Recruiter',
    'Recruitment / RPO',
    'Repairing',
    'Research intern',
    'Research Scientist',
    'Restaurant Manager',
    'Restaurant Sales',
    'Retail',
    'Retail Sales',
    'Retail Store',
    'Rig hand',
    'RMC Plant',
    'Safety Supervisor',
    'Sales / Business Development',
    'Sales associate',
    'Sales Engineer',
    'Sales Manager',
    'Sales Promoter',
    'Sales Promotion',
    'Sales/Marketing',
    'SAP Executive',
    'Saving Account Sales',
    'Security',
    'Security Guard',
    'Security Officer',
    'Security Services',
    'Security System',
    'SEO Specialist',
    'Servant',
    'Services',
    'Shipping',
    'Shop keeper',
    'Site Engineer',
    'Site Supervisor',
    'Smart Grids',
    'Smart Metering',
    'Social media assistant',
    'Social Services',
    'Software Developer',
    'Software Sales',
    'Solar technician',
    'Sourcing',
    'Staffing',
    'Steward',
    'Stock clerk',
    'Stock Maintaining',
    'Store keeper',
    'Store Operations',
    'Store Sales',
    'Structural Engineer',
    'Supervisor',
    'Supply Chain',
    'Supply Chain Analyst',
    'Support staff',
    'Sweeper',
    'Switches/Wire Sales',
    'Tally',
    'Taxi Driver',
    'Teacher',
    'Teaching assistant',
    'Team Leader',
    'Technical Sales',
    'Technical Support',
    'Technician',
    'Tele Caller',
    'Tele Sales',
    'Telecaller',
    'Telecalling / BPO',
    'Tobacco Sales',
    'Tractor Loan Sales',
    'Transmission',
    'Transportation',
    'Truck Sales',
    'Tutor',
    'Utility Services',
    'Verification',
    'Volunteer coordinator',
    'Waiter',
    'Ward Boy',
    'Warehouse associate',
    'Warehouse Coordinator',
    'Warehouse Executive',
    'Warehouse Operations',
    'Warranty Engineer',
    'Watch Sales',
    'Water-RO Sales',
    'Water-RO Technician',
    'Wind turbine assembler',
    'Windows Developer',
    'Wireman',
    'WordPress Developer',
    'Zonal Head',
  ];

  // Load job details
  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      const response = await api.getJob(jobId);
      setJobDetails(response.job || response);
    } catch (error) {
      console.error('Error loading job details:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setJobLoading(false);
    }
  };

  // Format date as "10-Oct-2025"
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
        if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
        if (formData.mobileNumber.trim() && !/^\d{10}$/.test(formData.mobileNumber)) {
          newErrors.mobileNumber = 'Enter valid 10-digit number';
        }
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Enter valid email';
        }
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
        if (!formData.englishFluency) newErrors.englishFluency = 'English fluency is required';
        break;

      case 2:
        if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
        if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = 'Years of experience is required';
        if (!formData.keySkills || formData.keySkills.length === 0) newErrors.keySkills = 'At least one key skill is required';
        if (!formData.industries || formData.industries.length === 0) newErrors.industries = 'At least one industry is required';
        if (!formData.preferredLocations.trim()) newErrors.preferredLocations = 'Preferred locations are required';
        break;

      case 3:
        if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';
        if (!formData.course.trim()) newErrors.course = 'Degree/Course is required';
        break;

      case 4:
        if (!formData.currentAddress.trim()) newErrors.currentAddress = 'Current address is required';
        if (!formData.bikeAvailable) newErrors.bikeAvailable = 'Bike availability is required';
        if (!formData.drivingLicense) newErrors.drivingLicense = 'DL availability is required';
        break;

      case 5:
        if (!formData.privacyPolicyAgreed) {
          newErrors.privacyPolicyAgreed = 'You must agree to privacy policy';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (stepNumber) => {
    // Allow direct navigation to any step
    setCurrentStep(stepNumber);
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        handleInputChange('resume', result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    try {
      const applicationData = {
        jobId,
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        whatsappNumber: formData.whatsappAvailable ? formData.mobileNumber : '',
        dateOfBirth: formData.dateOfBirth.toISOString(),
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        englishFluency: formData.englishFluency,
        experienceLevel: formData.experienceLevel,
        yearsOfExperience: formData.yearsOfExperience,
        jobStatus: formData.jobStatus,
        currentJobTitle: formData.currentJobTitle,
        keySkills: formData.keySkills, // Already an array
        currentCompany: formData.currentCompany,
        currentSalary: formData.currentSalary,
        industry: formData.currentIndustry,
        industries: formData.industries,
        subIndustries: formData.subIndustries,
        currentDepartment: formData.currentDepartment,
        departments: formData.departments,
        subDepartments: formData.subDepartments,
        currentJobRoles: formData.currentJobRoles,
        preferredLocations: formData.preferredLocations.split(',').map(s => s.trim()),
        readyToRelocate: formData.readyToRelocate,
        noticePeriod: formData.noticePeriod,
        educationLevel: formData.educationLevel,
        course: formData.course,
        specialization: formData.specialization,
        currentAddress: formData.currentAddress,
        bikeAvailable: formData.bikeAvailable,
        drivingLicense: formData.drivingLicense,
        sourceOfVisit: formData.referralSource,
      };

      await api.applyForJob(jobId, applicationData);
      
      Alert.alert(
        'Success!',
        'Your application has been submitted successfully. We will contact you soon.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {steps.map((step, index) => (
        <View key={step.number} style={styles.progressStepWrapper}>
          <TouchableOpacity 
            style={styles.progressStep}
            onPress={() => handleStepClick(step.number)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.progressCircle,
                currentStep >= step.number && styles.progressCircleActive,
                currentStep > step.number && styles.progressCircleCompleted,
              ]}
            >
              {currentStep > step.number ? (
                <Ionicons name="checkmark" size={16} color={colors.textWhite} />
              ) : (
                <Text
                  style={[
                    styles.progressNumber,
                    currentStep >= step.number && styles.progressNumberActive,
                  ]}
                >
                  {step.number}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.progressLabel,
                currentStep >= step.number && styles.progressLabelActive,
              ]}
            >
              {step.title}
            </Text>
          </TouchableOpacity>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.progressLine,
                currentStep > step.number && styles.progressLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderCheckbox = (value, onPress, label) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Ionicons name="checkmark" size={16} color={colors.textWhite} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderRadioGroup = (options, selectedValue, onSelect, error) => (
    <View>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.radioOption}
          onPress={() => onSelect(option)}
        >
          <View style={styles.radioButton}>
            {selectedValue === option && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={styles.radioLabel}>{option}</Text>
        </TouchableOpacity>
      ))}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderInput = (label, value, onChangeText, options = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {options.required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.input, options.error && styles.inputError]}>
        {options.icon && (
          <Ionicons name={options.icon} size={20} color={colors.textSecondary} style={styles.inputIcon} />
        )}
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={options.placeholder || ''}
          placeholderTextColor={colors.textLight}
          keyboardType={options.keyboardType || 'default'}
          multiline={options.multiline || false}
          numberOfLines={options.numberOfLines || 1}
          autoCapitalize={options.autoCapitalize || 'sentences'}
        />
      </View>
      {options.error && <Text style={styles.errorText}>{options.error}</Text>}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepDescription}>Let's start with your basic details</Text>

      {renderInput('Full Name', formData.fullName, (text) => handleInputChange('fullName', text), {
        required: true,
        icon: 'person-outline',
        placeholder: 'Enter your full name',
        error: errors.fullName,
      })}

      {renderInput('Mobile Number', formData.mobileNumber, (text) => handleInputChange('mobileNumber', text), {
        required: true,
        icon: 'call-outline',
        placeholder: '10-digit mobile number',
        keyboardType: 'phone-pad',
        error: errors.mobileNumber,
      })}

      {renderCheckbox(
        formData.whatsappAvailable,
        () => handleInputChange('whatsappAvailable', !formData.whatsappAvailable),
        'Number is available on WhatsApp'
      )}

      {renderInput('Email ID', formData.email, (text) => handleInputChange('email', text), {
        required: true,
        icon: 'mail-outline',
        placeholder: 'your.email@example.com',
        keyboardType: 'email-address',
        autoCapitalize: 'none',
        error: errors.email,
      })}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Date of Birth <Text style={styles.required}>*</Text>
        </Text>
        {Platform.OS === 'web' ? (
          <View style={styles.webDatePickerContainer}>
            <View style={styles.input}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.inputIcon} />
              <Text style={styles.dateText}>
                {formatDate(formData.dateOfBirth)}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </View>
            <input
              type="date"
              value={formData.dateOfBirth.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value + 'T00:00:00');
                if (!isNaN(newDate.getTime())) {
                  handleInputChange('dateOfBirth', newDate);
                }
              }}
              max={new Date().toISOString().split('T')[0]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%',
              }}
            />
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.inputIcon} />
              <Text style={styles.dateText}>
                {formatDate(formData.dateOfBirth)}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.dateOfBirth}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  // On Android, always close after selection
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                  }
                  if (selectedDate) {
                    handleInputChange('dateOfBirth', selectedDate);
                    // On iOS, close after selection
                    if (Platform.OS === 'ios') {
                      setShowDatePicker(false);
                    }
                  } else if (Platform.OS === 'ios') {
                    // User cancelled on iOS
                    setShowDatePicker(false);
                  }
                }}
                maximumDate={new Date()}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Gender <Text style={styles.required}>*</Text>
        </Text>
        {renderRadioGroup(
          ['Male', 'Female', 'Other'],
          formData.gender,
          (value) => handleInputChange('gender', value),
          errors.gender
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Marital Status <Text style={styles.required}>*</Text>
        </Text>
        {renderRadioGroup(
          ['Single', 'Married', 'Divorced', 'Widowed'],
          formData.maritalStatus,
          (value) => handleInputChange('maritalStatus', value),
          errors.maritalStatus
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          English Fluency Level <Text style={styles.required}>*</Text>
        </Text>
        {renderRadioGroup(
          ['No English', 'Basic English', 'Good English', 'Fluent English'],
          formData.englishFluency,
          (value) => handleInputChange('englishFluency', value),
          errors.englishFluency
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Experience & Professional Details</Text>
      <Text style={styles.stepDescription}>Tell us about your work experience</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Experience Level <Text style={styles.required}>*</Text>
        </Text>
        {renderRadioGroup(
          ['Fresher','Experienced'],
          formData.experienceLevel,
          (value) => handleInputChange('experienceLevel', value),
          errors.experienceLevel
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Years of Experience <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.input, errors.yearsOfExperience && styles.inputError]}
          onPress={() => setShowExperienceDropdown(!showExperienceDropdown)}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <Text style={[styles.dropdownText, !formData.yearsOfExperience && styles.placeholderText]}>
            {formData.yearsOfExperience || 'Select years of experience'}
          </Text>
          <Ionicons name={showExperienceDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        {errors.yearsOfExperience && <Text style={styles.errorText}>{errors.yearsOfExperience}</Text>}
        
        {showExperienceDropdown && (
          <View style={styles.dropdown}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
              {experienceOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownOption,
                    formData.yearsOfExperience === option && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    handleInputChange('yearsOfExperience', option);
                    setShowExperienceDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      formData.yearsOfExperience === option && styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {formData.yearsOfExperience === option && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Present Job Status</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowJobStatusDropdown(!showJobStatusDropdown)}
          activeOpacity={0.7}
        >
          <Ionicons name="briefcase-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <Text style={[styles.dropdownText, !formData.jobStatus && styles.placeholderText]}>
            {formData.jobStatus || 'Select job status'}
          </Text>
          <Ionicons name={showJobStatusDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        {showJobStatusDropdown && (
          <View style={styles.dropdown}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
              {jobStatusOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownOption,
                    formData.jobStatus === option && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    handleInputChange('jobStatus', option);
                    setShowJobStatusDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      formData.jobStatus === option && styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {formData.jobStatus === option && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Current Job Title / Designation</Text>
        <Text style={styles.helperText}>Select up to 5 job titles</Text>
        
        {/* Selected Job Titles */}
        {formData.currentJobTitle.length > 0 && (
          <View style={styles.selectedItemsContainer}>
            {formData.currentJobTitle.map((title, index) => (
              <View key={index} style={styles.selectedItem}>
                <Text style={styles.selectedItemText}>{title}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const newTitles = formData.currentJobTitle.filter((_, i) => i !== index);
                    handleInputChange('currentJobTitle', newTitles);
                  }}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Dropdown Button */}
        {formData.currentJobTitle.length < 5 && (
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowJobTitleDropdown(!showJobTitleDropdown)}
            activeOpacity={0.7}
          >
            <Ionicons name="ribbon-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <Text style={[styles.dropdownText, styles.placeholderText]}>
              {formData.currentJobTitle.length === 0 
                ? 'Select job titles' 
                : `Add more (${5 - formData.currentJobTitle.length} remaining)`}
            </Text>
            <Ionicons name={showJobTitleDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {/* Searchable Dropdown */}
        {showJobTitleDropdown && (
          <View style={styles.searchableDropdown}>
            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search job titles..."
                value={jobTitleSearch}
                onChangeText={setJobTitleSearch}
                placeholderTextColor={colors.textLight}
                autoFocus
              />
              {jobTitleSearch.length > 0 && (
                <TouchableOpacity onPress={() => setJobTitleSearch('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Dropdown Options */}
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
              {jobTitleOptions
                .filter(option => 
                  option.toLowerCase().includes(jobTitleSearch.toLowerCase()) &&
                  !formData.currentJobTitle.includes(option)
                )
                .map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      if (formData.currentJobTitle.length < 5) {
                        const newTitles = [...formData.currentJobTitle, option];
                        handleInputChange('currentJobTitle', newTitles);
                        setJobTitleSearch('');
                        if (newTitles.length >= 5) {
                          setShowJobTitleDropdown(false);
                        }
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownOptionText}>{option}</Text>
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              {jobTitleOptions.filter(option => 
                option.toLowerCase().includes(jobTitleSearch.toLowerCase()) &&
                !formData.currentJobTitle.includes(option)
              ).length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No job titles found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Key Skills <Text style={styles.required}>*</Text>
        </Text>
        <Text style={styles.helperText}>Select up to 12 key skills</Text>
        
        {/* Selected Skills */}
        {formData.keySkills.length > 0 && (
          <View style={styles.selectedItemsContainer}>
            {formData.keySkills.map((skill, index) => (
              <View key={index} style={styles.selectedItem}>
                <Text style={styles.selectedItemText}>{skill}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const newSkills = formData.keySkills.filter((_, i) => i !== index);
                    handleInputChange('keySkills', newSkills);
                  }}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Dropdown Button */}
        {formData.keySkills.length < 12 && (
          <TouchableOpacity
            style={[styles.input, errors.keySkills && styles.inputError]}
            onPress={() => setShowKeySkillsDropdown(!showKeySkillsDropdown)}
            activeOpacity={0.7}
          >
            <Ionicons name="construct-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <Text style={[styles.dropdownText, styles.placeholderText]}>
              {formData.keySkills.length === 0 
                ? 'Select key skills' 
                : `Add more (${12 - formData.keySkills.length} remaining)`}
            </Text>
            <Ionicons name={showKeySkillsDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {errors.keySkills && <Text style={styles.errorText}>{errors.keySkills}</Text>}
        
        {/* Searchable Dropdown */}
        {showKeySkillsDropdown && (
          <View style={styles.searchableDropdown}>
            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search skills..."
                value={keySkillsSearch}
                onChangeText={setKeySkillsSearch}
                placeholderTextColor={colors.textLight}
                autoFocus
              />
              {keySkillsSearch.length > 0 && (
                <TouchableOpacity onPress={() => setKeySkillsSearch('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Dropdown Options */}
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
              {keySkillsOptions
                .filter(option => 
                  option.toLowerCase().includes(keySkillsSearch.toLowerCase()) &&
                  !formData.keySkills.includes(option)
                )
                .map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      if (formData.keySkills.length < 12) {
                        const newSkills = [...formData.keySkills, option];
                        handleInputChange('keySkills', newSkills);
                        setKeySkillsSearch('');
                        if (newSkills.length >= 12) {
                          setShowKeySkillsDropdown(false);
                        }
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownOptionText}>{option}</Text>
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              {keySkillsOptions.filter(option => 
                option.toLowerCase().includes(keySkillsSearch.toLowerCase()) &&
                !formData.keySkills.includes(option)
              ).length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No skills found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Industry Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Industry / Sectors <Text style={styles.required}>*</Text>
        </Text>
        <Text style={styles.helperText}>Select up to 5 industries</Text>
        
        {/* Selected Industries */}
        {formData.industries.length > 0 && (
          <View style={styles.selectedItemsContainer}>
            {formData.industries.map((industry, index) => (
              <View key={index} style={styles.selectedItem}>
                <Text style={styles.selectedItemText}>{industry}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const newIndustries = formData.industries.filter((_, i) => i !== index);
                    handleInputChange('industries', newIndustries);
                    // Clear sub-industries if no industries are selected
                    if (newIndustries.length === 0) {
                      handleInputChange('subIndustries', []);
                    } else {
                      // Remove sub-industries that belong to removed industry
                      const validSubIndustries = getSubIndustries(newIndustries);
                      const filteredSubIndustries = formData.subIndustries.filter(sub => 
                        validSubIndustries.includes(sub)
                      );
                      handleInputChange('subIndustries', filteredSubIndustries);
                    }
                  }}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Dropdown Button */}
        {formData.industries.length < 5 && (
          <TouchableOpacity
            style={[styles.input, errors.industries && styles.inputError]}
            onPress={() => setShowIndustryDropdown(!showIndustryDropdown)}
            activeOpacity={0.7}
          >
            <Ionicons name="layers-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <Text style={[styles.dropdownText, styles.placeholderText]}>
              {formData.industries.length === 0 
                ? 'Select industries' 
                : `Add more (${5 - formData.industries.length} remaining)`}
            </Text>
            <Ionicons name={showIndustryDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {errors.industries && <Text style={styles.errorText}>{errors.industries}</Text>}
        
        {/* Searchable Dropdown */}
        {showIndustryDropdown && (
          <View style={styles.searchableDropdown}>
            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search industries..."
                value={industrySearch}
                onChangeText={setIndustrySearch}
                placeholderTextColor={colors.textLight}
                autoFocus
              />
              {industrySearch.length > 0 && (
                <TouchableOpacity onPress={() => setIndustrySearch('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Dropdown Options */}
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
              {getIndustries()
                .filter(option => 
                  option.toLowerCase().includes(industrySearch.toLowerCase()) &&
                  !formData.industries.includes(option)
                )
                .map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      if (formData.industries.length < 5) {
                        const newIndustries = [...formData.industries, option];
                        handleInputChange('industries', newIndustries);
                        setIndustrySearch('');
                        if (newIndustries.length >= 5) {
                          setShowIndustryDropdown(false);
                        }
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownOptionText}>{option}</Text>
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              {getIndustries().filter(option => 
                option.toLowerCase().includes(industrySearch.toLowerCase()) &&
                !formData.industries.includes(option)
              ).length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No industries found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Sub-Industry Selection */}
      {formData.industries.length > 0 && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Sub Industry / Sectors</Text>
          <Text style={styles.helperText}>Select up to 5 sub-industries (based on selected industries)</Text>
          
          {/* Selected Sub-Industries */}
          {formData.subIndustries.length > 0 && (
            <View style={styles.selectedItemsContainer}>
              {formData.subIndustries.map((subIndustry, index) => (
                <View key={index} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>{subIndustry}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newSubIndustries = formData.subIndustries.filter((_, i) => i !== index);
                      handleInputChange('subIndustries', newSubIndustries);
                    }}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Dropdown Button */}
          {formData.subIndustries.length < 5 && (
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowSubIndustryDropdown(!showSubIndustryDropdown)}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <Text style={[styles.dropdownText, styles.placeholderText]}>
                {formData.subIndustries.length === 0 
                  ? 'Select sub-industries' 
                  : `Add more (${5 - formData.subIndustries.length} remaining)`}
              </Text>
              <Ionicons name={showSubIndustryDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          
          {/* Searchable Dropdown */}
          {showSubIndustryDropdown && (
            <View style={styles.searchableDropdown}>
              {/* Search Input */}
              <View style={styles.searchInputContainer}>
                <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="Search sub-industries..."
                  value={subIndustrySearch}
                  onChangeText={setSubIndustrySearch}
                  placeholderTextColor={colors.textLight}
                  autoFocus
                />
                {subIndustrySearch.length > 0 && (
                  <TouchableOpacity onPress={() => setSubIndustrySearch('')}>
                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Dropdown Options */}
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                {getSubIndustries(formData.industries)
                  .filter(option => 
                    option.toLowerCase().includes(subIndustrySearch.toLowerCase()) &&
                    !formData.subIndustries.includes(option)
                  )
                  .map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownOption}
                      onPress={() => {
                        if (formData.subIndustries.length < 5) {
                          const newSubIndustries = [...formData.subIndustries, option];
                          handleInputChange('subIndustries', newSubIndustries);
                          setSubIndustrySearch('');
                          if (newSubIndustries.length >= 5) {
                            setShowSubIndustryDropdown(false);
                          }
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownOptionText}>{option}</Text>
                      <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  ))}
                {getSubIndustries(formData.industries).filter(option => 
                  option.toLowerCase().includes(subIndustrySearch.toLowerCase()) &&
                  !formData.subIndustries.includes(option)
                ).length === 0 && (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No sub-industries found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* Department Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Department</Text>
        <Text style={styles.helperText}>Select up to 6 departments</Text>
        
        {/* Selected Departments */}
        {formData.departments.length > 0 && (
          <View style={styles.selectedItemsContainer}>
            {formData.departments.map((department, index) => (
              <View key={index} style={styles.selectedItem}>
                <Text style={styles.selectedItemText}>{department}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const newDepartments = formData.departments.filter((_, i) => i !== index);
                    handleInputChange('departments', newDepartments);
                    // Clear sub-departments if no departments are selected
                    if (newDepartments.length === 0) {
                      handleInputChange('subDepartments', []);
                    } else {
                      // Remove sub-departments that belong to removed department
                      const validSubDepartments = getSubDepartments(newDepartments);
                      const filteredSubDepartments = formData.subDepartments.filter(sub => 
                        validSubDepartments.includes(sub)
                      );
                      handleInputChange('subDepartments', filteredSubDepartments);
                    }
                  }}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Dropdown Button */}
        {formData.departments.length < 6 && (
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
            activeOpacity={0.7}
          >
            <Ionicons name="people-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <Text style={[styles.dropdownText, styles.placeholderText]}>
              {formData.departments.length === 0 
                ? 'Select departments' 
                : `Add more (${6 - formData.departments.length} remaining)`}
            </Text>
            <Ionicons name={showDepartmentDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {/* Searchable Dropdown */}
        {showDepartmentDropdown && (
          <View style={styles.searchableDropdown}>
            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search departments..."
                value={departmentSearch}
                onChangeText={setDepartmentSearch}
                placeholderTextColor={colors.textLight}
                autoFocus
              />
              {departmentSearch.length > 0 && (
                <TouchableOpacity onPress={() => setDepartmentSearch('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Dropdown Options */}
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
              {getDepartments()
                .filter(option => 
                  option.toLowerCase().includes(departmentSearch.toLowerCase()) &&
                  !formData.departments.includes(option)
                )
                .map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      if (formData.departments.length < 6) {
                        const newDepartments = [...formData.departments, option];
                        handleInputChange('departments', newDepartments);
                        setDepartmentSearch('');
                        if (newDepartments.length >= 6) {
                          setShowDepartmentDropdown(false);
                        }
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownOptionText}>{option}</Text>
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              {getDepartments().filter(option => 
                option.toLowerCase().includes(departmentSearch.toLowerCase()) &&
                !formData.departments.includes(option)
              ).length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No departments found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Sub-Department Selection */}
      {formData.departments.length > 0 && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Sub Department</Text>
          <Text style={styles.helperText}>Select up to 6 sub-departments (based on selected departments)</Text>
          
          {/* Selected Sub-Departments */}
          {formData.subDepartments.length > 0 && (
            <View style={styles.selectedItemsContainer}>
              {formData.subDepartments.map((subDepartment, index) => (
                <View key={index} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>{subDepartment}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newSubDepartments = formData.subDepartments.filter((_, i) => i !== index);
                      handleInputChange('subDepartments', newSubDepartments);
                    }}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Dropdown Button */}
          {formData.subDepartments.length < 6 && (
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowSubDepartmentDropdown(!showSubDepartmentDropdown)}
              activeOpacity={0.7}
            >
              <Ionicons name="git-branch-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <Text style={[styles.dropdownText, styles.placeholderText]}>
                {formData.subDepartments.length === 0 
                  ? 'Select sub-departments' 
                  : `Add more (${6 - formData.subDepartments.length} remaining)`}
              </Text>
              <Ionicons name={showSubDepartmentDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          
          {/* Searchable Dropdown */}
          {showSubDepartmentDropdown && (
            <View style={styles.searchableDropdown}>
              {/* Search Input */}
              <View style={styles.searchInputContainer}>
                <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="Search sub-departments..."
                  value={subDepartmentSearch}
                  onChangeText={setSubDepartmentSearch}
                  placeholderTextColor={colors.textLight}
                  autoFocus
                />
                {subDepartmentSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setSubDepartmentSearch('')}>
                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Dropdown Options */}
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                {getSubDepartments(formData.departments)
                  .filter(option => 
                    option.toLowerCase().includes(subDepartmentSearch.toLowerCase()) &&
                    !formData.subDepartments.includes(option)
                  )
                  .map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownOption}
                      onPress={() => {
                        if (formData.subDepartments.length < 6) {
                          const newSubDepartments = [...formData.subDepartments, option];
                          handleInputChange('subDepartments', newSubDepartments);
                          setSubDepartmentSearch('');
                          if (newSubDepartments.length >= 6) {
                            setShowSubDepartmentDropdown(false);
                          }
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownOptionText}>{option}</Text>
                      <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  ))}
                {getSubDepartments(formData.departments).filter(option => 
                  option.toLowerCase().includes(subDepartmentSearch.toLowerCase()) &&
                  !formData.subDepartments.includes(option)
                ).length === 0 && (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No sub-departments found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {renderInput('Current Company Name', formData.currentCompany, (text) => handleInputChange('currentCompany', text), {
        icon: 'business-outline',
        placeholder: 'Enter company name',
      })}

      {renderInput('Current Salary (Annual)', formData.currentSalary, (text) => handleInputChange('currentSalary', text), {
        icon: 'cash-outline',
        placeholder: 'E.g., 500000',
        keyboardType: 'numeric',
      })}

      {renderInput('Current Job Industry', formData.currentIndustry, (text) => handleInputChange('currentIndustry', text), {
        required: true,
        icon: 'layers-outline',
        placeholder: 'E.g., IT, Healthcare, Finance',
        error: errors.currentIndustry,
      })}

      {renderInput('Current Job Department', formData.currentDepartment, (text) => handleInputChange('currentDepartment', text), {
        icon: 'people-outline',
        placeholder: 'E.g., Engineering, Sales',
      })}

      {renderInput('Current Job Roles', formData.currentJobRoles, (text) => handleInputChange('currentJobRoles', text), {
        icon: 'clipboard-outline',
        placeholder: 'E.g., Development, Testing',
      })}

      {renderInput('Current / Preferred Job Locations', formData.preferredLocations, (text) => handleInputChange('preferredLocations', text), {
        required: true,
        icon: 'location-outline',
        placeholder: 'E.g., Mumbai, Pune, Delhi (comma separated)',
        multiline: true,
        numberOfLines: 2,
        error: errors.preferredLocations,
      })}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Ready To Relocate</Text>
        {renderRadioGroup(
          ['Yes', 'No', 'Maybe'],
          formData.readyToRelocate,
          (value) => handleInputChange('readyToRelocate', value)
        )}
      </View>

      {renderInput('Notice Period', formData.noticePeriod, (text) => handleInputChange('noticePeriod', text), {
        icon: 'hourglass-outline',
        placeholder: 'E.g., Immediate, 15 days, 1 month',
      })}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Education Details</Text>
      <Text style={styles.stepDescription}>Share your educational background</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Level of Education <Text style={styles.required}>*</Text>
        </Text>
        {renderRadioGroup(
          ['10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate'],
          formData.educationLevel,
          (value) => handleInputChange('educationLevel', value),
          errors.educationLevel
        )}
      </View>

      {renderInput('Degree/Course', formData.course, (text) => handleInputChange('course', text), {
        required: true,
        icon: 'school-outline',
        placeholder: 'E.g., B.Tech, MBA, BCA',
        error: errors.course,
      })}

      {renderInput('Specialization', formData.specialization, (text) => handleInputChange('specialization', text), {
        icon: 'book-outline',
        placeholder: 'E.g., Computer Science, Marketing',
      })}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Additional Details</Text>
      <Text style={styles.stepDescription}>Just a few more details</Text>

      {renderInput('Current Residence Address/Location', formData.currentAddress, (text) => handleInputChange('currentAddress', text), {
        required: true,
        icon: 'home-outline',
        placeholder: 'Enter your full address',
        multiline: true,
        numberOfLines: 3,
        error: errors.currentAddress,
      })}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Bike/Two Wheeler Availability <Text style={styles.required}>*</Text>
        </Text>
        {renderRadioGroup(
          ['Yes, I have', 'No, I don\'t have', 'Can arrange if required'],
          formData.bikeAvailable,
          (value) => handleInputChange('bikeAvailable', value),
          errors.bikeAvailable
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Driving License Availability <Text style={styles.required}>*</Text>
        </Text>
        {renderRadioGroup(
          ['Yes, I have valid DL', 'No, I don\'t have', 'In process'],
          formData.drivingLicense,
          (value) => handleInputChange('drivingLicense', value),
          errors.drivingLicense
        )}
      </View>

      {renderInput('From Where You Heard About Us/Reference', formData.referralSource, (text) => handleInputChange('referralSource', text), {
        icon: 'share-social-outline',
        placeholder: 'E.g., Friend, LinkedIn, Google Search',
      })}
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Resume & Submit</Text>
      <Text style={styles.stepDescription}>Upload your resume and submit your application</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Upload Resume</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
          <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
          <Text style={styles.uploadButtonText}>
            {formData.resume ? formData.resume.name : 'Choose File (PDF, DOC, DOCX)'}
          </Text>
        </TouchableOpacity>
        {formData.resume && (
          <View style={styles.fileInfo}>
            <Ionicons name="document-text" size={20} color={colors.success} />
            <Text style={styles.fileName}>{formData.resume.name}</Text>
            <TouchableOpacity onPress={() => handleInputChange('resume', null)}>
              <Ionicons name="close-circle" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Application Summary</Text>
        <View style={styles.summaryItem}>
          <Ionicons name="person" size={18} color={colors.primary} />
          <Text style={styles.summaryText}>{formData.fullName}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="mail" size={18} color={colors.primary} />
          <Text style={styles.summaryText}>{formData.email}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="call" size={18} color={colors.primary} />
          <Text style={styles.summaryText}>{formData.mobileNumber}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="briefcase" size={18} color={colors.primary} />
          <Text style={styles.summaryText}>
            {formData.experienceLevel} - {formData.yearsOfExperience} years
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="school" size={18} color={colors.primary} />
          <Text style={styles.summaryText}>
            {formData.educationLevel} - {formData.course}
          </Text>
        </View>
      </View>

      <View style={styles.agreementContainer}>
        {renderCheckbox(
          formData.privacyPolicyAgreed,
          () => handleInputChange('privacyPolicyAgreed', !formData.privacyPolicyAgreed),
          'I agree with the Privacy Policy and Terms of Service'
        )}
        {errors.privacyPolicyAgreed && (
          <Text style={styles.errorText}>{errors.privacyPolicyAgreed}</Text>
        )}
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  if (jobLoading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Job Application Form</Text>
          {jobDetails && (
            <View style={styles.jobInfoContainer}>
              <Ionicons name="briefcase" size={20} color={colors.textWhite} />
              <Text style={styles.jobTitle} numberOfLines={2}>
                {jobDetails.jobTitle}
              </Text>
            </View>
          )}
          {jobDetails?.companyName && (
            <Text style={styles.companyName}>
              {jobDetails.companyName}
            </Text>
          )}
          <Text style={styles.headerSubtitle}>
            Step {currentStep} of {totalSteps}
          </Text>
        </LinearGradient>

        {renderProgressBar()}

        <View style={styles.formContainer}>
          {renderStepContent()}

          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={handlePrevious}
              >
                <Ionicons name="chevron-back" size={20} color={colors.primary} />
                <Text style={styles.prevButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            {currentStep < totalSteps ? (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textWhite} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, styles.submitButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textWhite} />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Submit Application</Text>
                    <Ionicons name="checkmark-circle" size={20} color={colors.textWhite} />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  jobInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    maxWidth: '90%',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textWhite,
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    color: colors.textWhite,
    opacity: 0.85,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textWhite,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.cardBackground,
  },
  progressStepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressCircleActive: {
    backgroundColor: colors.primary,
  },
  progressCircleCompleted: {
    backgroundColor: colors.success,
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  progressNumberActive: {
    color: colors.textWhite,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  progressLine: {
    height: 2,
    backgroundColor: colors.borderLight,
    width: 20,
    marginTop: -24,
  },
  progressLineActive: {
    backgroundColor: colors.success,
  },
  formContainer: {
    backgroundColor: colors.cardBackground,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  stepContainer: {
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: spacing.sm,
    fontWeight: '500',
  },
  webDatePickerContainer: {
    position: 'relative',
    width: '100%',
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  placeholderText: {
    color: colors.textLight,
  },
  dropdown: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    ...shadows.md,
    maxHeight: 250,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownOptionSelected: {
    backgroundColor: colors.primaryLight || 'rgba(102, 126, 234, 0.1)',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  dropdownOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight || 'rgba(102, 126, 234, 0.1)',
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  selectedItemText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  removeButton: {
    padding: 2,
  },
  searchableDropdown: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    ...shadows.md,
    maxHeight: 300,
    overflow: 'hidden',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  noResultsContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.text,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  uploadButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight || '#e6f7ed',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  summaryContainer: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  agreementContainer: {
    marginTop: spacing.md,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    flex: 1,
  },
  prevButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textWhite,
  },
  submitButton: {
    backgroundColor: colors.success,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
  },
});

export default JobApplicationScreen;
