// Comprehensive Job Post Form Configuration
// This file contains all field definitions, options, and validation rules

import { INDUSTRIES_DATA, getIndustries, getSubIndustries } from './industriesData';
import { DEPARTMENTS_DATA, getDepartments, getSubDepartments } from './departmentsData';
import { 
  EDUCATION_LEVEL_OPTIONS,
  BASIC_EDUCATION_LEVELS,
  ITI_COURSE_OPTIONS,
  ITI_SPECIALIZATION_OPTIONS,
  DIPLOMA_COURSE_OPTIONS,
  DIPLOMA_SPECIALIZATION_OPTIONS,
  GRADUATE_COURSE_OPTIONS,
  GRADUATE_SPECIALIZATION_OPTIONS,
  POST_GRADUATE_COURSE_OPTIONS,
  POST_GRADUATE_SPECIALIZATION_OPTIONS,
  DOCTORATE_COURSE_OPTIONS,
  DOCTORATE_SPECIALIZATION_OPTIONS,
} from './educationData';

export const companyTypeOptions = [
  { value: 'indian_mnc', label: 'Indian MNC' },
  { value: 'foreign_mnc', label: 'Foreign MNC' },
  { value: 'govt_psu', label: 'Govt / PSU' },
  { value: 'startup', label: 'Startup' },
  { value: 'unicorn', label: 'Unicorn' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'consultancy', label: 'Consultancy' },
];

export const employeeCountOptions = [
  { value: '0-10', label: '0-10' },
  { value: '11-25', label: '11-25' },
  { value: '26-50', label: '26-50' },
  { value: '51-100', label: '51-100' },
  { value: '101-200', label: '101-200' },
  { value: '201-500', label: '201-500' },
  { value: '500-1000', label: '500-1000' },
  { value: '1001-2000', label: '1001-2000' },
  { value: '2000-3000', label: '2000-3000' },
  { value: '3000+', label: '3000 Above' },
];

export const employmentTypeOptions = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'temporary', label: 'Temporary/Contract Job' },
  { value: 'internship', label: 'Internship' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'naps', label: 'NAPS' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'trainee', label: 'Trainee' },
  { value: 'fresher', label: 'Fresher' },
];

export const jobTypeOptions = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
];

export const jobModeOptions = [
  { value: 'work_from_home', label: 'Work From Home' },
  { value: 'work_from_office', label: 'Work From Office' },
  { value: 'work_from_field', label: 'Work From Field' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
];

export const jobShiftOptions = [
  { value: 'day_shift', label: 'Day Shift' },
  { value: 'night_shift', label: 'Night Shift' },
  { value: 'rotational_shift', label: 'Rotational Shift' },
  { value: 'split_shift', label: 'Split Shift' },
];

export const experienceLevelOptions = [
  { value: 'fresher', label: 'Fresher' },
  { value: 'experienced', label: 'Experienced' },
  { value: 'internship', label: 'Internship' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'any', label: 'Any' },
];

// Experience duration options
export const experienceYearsOptions = [
  { value: 'fresher', label: 'Fresher' },
  { value: '1m', label: '1 Month' },
  { value: '2m', label: '2 Months' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '9m', label: '9 Months' },
  { value: '1', label: '1 Year' },
  { value: '1.5', label: '1.5 Years' },
  { value: '2', label: '2 Years' },
  { value: '2.5', label: '2.5 Years' },
  { value: '3', label: '3 Years' },
  { value: '3.5', label: '3.5 Years' },
  { value: '4', label: '4 Years' },
  { value: '4.5', label: '4.5 Years' },
  { value: '5', label: '5 Years' },
  { value: '5.5', label: '5.5 Years' },
  { value: '6', label: '6 Years' },
  { value: '6.5', label: '6.5 Years' },
  { value: '7', label: '7 Years' },
  { value: '7.5', label: '7.5 Years' },
  { value: '8', label: '8 Years' },
  { value: '8.5', label: '8.5 Years' },
  { value: '9', label: '9 Years' },
  { value: '9.5', label: '9.5 Years' },
  { value: '10', label: '10 Years' },
  { value: '10.5', label: '10.5 Years' },
  { value: '11', label: '11 Years' },
  { value: '11.5', label: '11.5 Years' },
  { value: '12', label: '12 Years' },
  { value: '12.5', label: '12.5 Years' },
  { value: '13', label: '13 Years' },
  { value: '13.5', label: '13.5 Years' },
  { value: '14', label: '14 Years' },
  { value: '14.5', label: '14.5 Years' },
  { value: '15', label: '15 Years' },
  { value: '15.5', label: '15.5 Years' },
  { value: '16', label: '16 Years' },
  { value: '16.5', label: '16.5 Years' },
  { value: '17', label: '17 Years' },
  { value: '17.5', label: '17.5 Years' },
  { value: '18', label: '18 Years' },
  { value: '18.5', label: '18.5 Years' },
  { value: '19', label: '19 Years' },
  { value: '19.5', label: '19.5 Years' },
  { value: '20', label: '20 Years' },
  { value: '20.5', label: '20.5 Years' },
  { value: '21', label: '21 Years' },
  { value: '21.5', label: '21.5 Years' },
  { value: '22', label: '22 Years' },
  { value: '22.5', label: '22.5 Years' },
  { value: '23', label: '23 Years' },
  { value: '23.5', label: '23.5 Years' },
  { value: '24', label: '24 Years' },
  { value: '24.5', label: '24.5 Years' },
  { value: '25', label: '25 Years' },
  { value: '25.5', label: '25.5 Years' },
  { value: '26', label: '26 Years' },
  { value: '26.5', label: '26.5 Years' },
  { value: '27', label: '27 Years' },
  { value: '27.5', label: '27.5 Years' },
  { value: '28', label: '28 Years' },
  { value: '28.5', label: '28.5 Years' },
  { value: '29', label: '29 Years' },
  { value: '29.5', label: '29.5 Years' },
  { value: '30', label: '30 Years' },
  { value: '30.5', label: '30.5 Years' },
  { value: '31', label: '31 Years' },
  { value: '31.5', label: '31.5 Years' },
  { value: '32', label: '32 Years' },
  { value: '32.5', label: '32.5 Years' },
  { value: '33', label: '33 Years' },
  { value: '33.5', label: '33.5 Years' },
  { value: '34', label: '34 Years' },
  { value: '34.5', label: '34.5 Years' },
  { value: '35', label: '35 Years' },
  { value: '35.5', label: '35.5 Years' },
  { value: '36', label: '36 Years' },
  { value: '36+', label: '36 Years Plus' },
];

// Helper function to normalize strings for value conversion
const normalizeValue = (str) => {
  if (!str) return '';
  // Convert to lowercase, replace spaces and slashes with underscore, remove consecutive underscores
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')  // Replace spaces with underscore
    .replace(/\//g, '_')    // Replace slashes with underscore
    .replace(/_+/g, '_')    // Replace consecutive underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
};

// Industries options - convert to value/label format
export const industryOptions = getIndustries().map(industry => ({
  value: normalizeValue(industry),
  label: industry,
}));

// Departments options - convert to value/label format
export const departmentOptions = getDepartments().map(department => ({
  value: normalizeValue(department),
  label: department,
}));

export const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'any', label: 'Any' },
];

export const maritalStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'any', label: 'Any' },
];

export const additionalBenefitsOptions = [
  { value: 'office_cab', label: 'Office Cab/Shuttle' },
  { value: 'food_allowance', label: 'Food Allowance' },
  { value: 'food_canteen', label: 'Food Canteen' },
  { value: 'subsidy_meals', label: 'Subsidy Based Meals' },
  { value: 'health_insurance', label: 'Health Insurance' },
  { value: 'annual_bonus', label: 'Annual Bonus' },
  { value: 'pf', label: 'PF' },
  { value: 'esic', label: 'ESIC' },
  { value: 'petrol_allowance', label: 'Petrol Allowance' },
  { value: 'incentives', label: 'Incentives' },
  { value: 'travel_allowance', label: 'Travel Allowance (TA)' },
  { value: 'daily_allowance', label: 'Daily Allowance (DA)' },
  { value: 'transport_facility', label: 'Transport Facility' },
  { value: 'food_meals', label: 'Food/Meals' },
  { value: 'tea_coffee', label: 'Tea/Coffee Break' },
  { value: 'mobile_allowance', label: 'Mobile Allowance' },
  { value: 'internet_allowance', label: 'Internet Allowance' },
  { value: 'overtime_pay', label: 'Overtime Pay' },
  { value: 'joining_bonus', label: 'Joining Bonus' },
  { value: 'other_benefits', label: 'Other Benefits' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'mobile_phone', label: 'Mobile Phone' },
  { value: 'flexible_hours', label: 'Flexible Working Hours' },
  { value: 'weekly_payout', label: 'Weekly Payout' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: '5_working_days', label: '5 Working Days' },
  { value: 'one_way_cab', label: 'One-Way Cab' },
  { value: 'two_way_cab', label: 'Two-Way Cab' },
  { value: 'accidental_insurance', label: 'Accidental Insurance' },
  { value: 'gmc_insurance', label: 'GMC Insurance' },
  { value: 'gpa_insurance', label: 'GPA Insurance' },
];

// Generate age options (18-60+)
export const generateAgeOptions = () => {
  const options = [];
  for (let age = 18; age <= 60; age++) {
    options.push({ value: age.toString(), label: `${age} Years` });
  }
  options.push({ value: '60+', label: '60+ Years' });
  return options;
};

export const languageOptions = [
  { value: 'hindi', label: 'Hindi' },
  { value: 'english', label: 'English' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'kashmiri', label: 'Kashmiri' },
  { value: 'maithili', label: 'Maithili' },
  { value: 'nepali', label: 'Nepali' },
  { value: 'bhojpuri', label: 'Bhojpuri' },
  { value: 'assamese', label: 'Assamese' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'russian', label: 'Russian' },
  { value: 'french', label: 'French' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'german', label: 'German' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'korean', label: 'Korean' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'arabian', label: 'Arabian' },
  { value: 'filipino', label: 'Filipino' },
  { value: 'swedish', label: 'Swedish' },
  { value: 'greek', label: 'Greek' },
  { value: 'latin', label: 'Latin' },
  { value: 'polish', label: 'Polish' },
  { value: 'thai', label: 'Thai' },
  { value: 'serbian', label: 'Serbian' },
  { value: 'sanskrit', label: 'Sanskrit' },
  { value: 'meitei', label: 'Meitei (Manipuri)' },
  { value: 'santali', label: 'Santali' },
  { value: 'odia', label: 'Odia' },
];

export const joiningPeriodOptions = [
  { value: 'immediate', label: 'Immediate Joining' },
  { value: '7_days', label: '7 Days' },
  { value: '15_days', label: '15 Days' },
  { value: '30_days', label: '30 Days' },
  { value: '45_days', label: '45 Days' },
  { value: '60_days', label: '60 Days' },
  { value: '90_days', label: '90 Days' },
  { value: 'any', label: 'Any' },
];

export const diversityHiringOptions = [
  { value: 'man', label: 'Man' },
  { value: 'man_returning', label: 'Man Returning to work' },
  { value: 'woman', label: 'Woman' },
  { value: 'woman_returning', label: 'Woman Returning to work' },
  { value: 'ex_army', label: 'Ex-Army Personal' },
  { value: 'differently_abled', label: 'Differently-abled' },
  { value: 'any', label: 'Any' },
];

export const disabilityStatusOptions = [
  { value: 'have_disability', label: 'Have Disability' },
  { value: 'no_disability', label: "Don't Have Disability" },
  { value: 'any', label: 'Any' },
];

export const disabilityTypeOptions = [
  { value: 'blindness', label: 'Blindness' },
  { value: 'low_vision', label: 'Low Vision' },
  { value: 'physical_disability', label: 'Physical Disability' },
  { value: 'locomotor_disability', label: 'Locomotor Disability' },
  { value: 'hearing_impairment', label: 'Hearing Impairment' },
  { value: 'speech_language_disability', label: 'Speech and Language Disability' },
  { value: 'any', label: 'Any' },
];

export const jobResponseMethodOptions = [
  { value: 'internal', label: 'Receive Applicants Responses Internally' },
  { value: 'email', label: 'Receive Applicants Responses On Email' },
  { value: 'whatsapp', label: 'Receive Applicants Responses On WhatsApp' },
  { value: 'external_url', label: 'Receive Applicants Responses External Website URL' },
];

export const communicationPreferenceOptions = [
  { value: 'myself', label: 'Yes To My Self' },
  { value: 'other_recruiter', label: 'Yes To Other Recruiter (Enter Name, Number, Email ID)' },
  { value: 'no_contact', label: 'No I will Contact Candidates First' },
];

export const distanceOptions = [
  { value: '5', label: '5 KM' },
  { value: '10', label: '10 KM' },
  { value: '15', label: '15 KM' },
  { value: '20', label: '20 KM' },
  { value: '25', label: '25 KM' },
  { value: '30', label: '30 KM' },
  { value: '50', label: '50 KM' },
  { value: '100', label: '100 KM' },
  { value: 'any', label: 'Any Distance' },
];

// Job Titles from job application form
export const jobTitleOptions = [
  'Fresher', 'AC-Air Conditioner Sales', 'AC-Air Conditioner Technician', 'Accountant', 'Accounting', 'Accounts / Finance', 'Accounts clerk', 'Accounts Executive', 'Admin', 'Admin Executive', 'Advisory Services', 'Aea Head', 'Agency Channel', 'Agribusiness / Marketing', 'Agriculture Loan Sales', 'Analyst', 'Android Developer', 'Apprentice carpenter', 'Assembly line worker', 'ATM Engineer', 'ATM Staff', 'Auditing', 'Auto Driver', 'Auto Loan Sales', 'Automated Metering', 'Automobiles Sales', 'Automotive Parts Sales', 'B2B Sales', 'B2C Sales', 'Background Verification', 'Banca Channel', 'Banking', 'Banking Operations', 'Banking Sales', 'Beauty Parlour', 'Bidding Officer', 'Bike Insurance Sales', 'Bike Loan Sales', 'Bike Mechanic', 'Billing / Cashier', 'Branch Manager', 'Brand Promoter', 'Broadband Installation Engineer', 'Broking Services', 'Building Materials Sales', 'Bus Driver', 'Bus Mechanic', 'Bus Sales', 'Business Development', 'Business Development Executive', 'Business Head', 'Business Loan Sales', 'CA- Chartered Accountant', 'Call Center Agent', 'Calling', 'Camera assistant', 'Camera Sales', 'Camera Technician', 'Car Insurance Sales', 'Car Loan Sales', 'Car Mechanic', 'Caregiver', 'Cargo', 'Carpenter', 'CASA Sales', 'Cashier', 'Cement Sales', 'Channel Sales', 'Chef', 'Chemical Engineer', 'Chemical Engineering', 'Civil Engineer', 'Civil Sales', 'Cleaner', 'Clerk', 'Collection', 'Commissioning Support Services', 'Consulting', 'Content creator', 'Content moderator', 'Content Writer', 'Cook', 'Corporate Lawyer', 'Corporate Salary Account Sales', 'Country Head', 'Courier', 'Crane Driver', 'Credit Card Sales', 'Credit Operations', 'Current Account Sales', 'Current Affairs', 'Customer Service Executive', 'Customer service representative', 'Customer Support', 'Cybersecurity Analyst', 'D2C Sales', 'Dairy assistant', 'Data annotator', 'Data Entry', 'Data entry operator', 'Data Scientist', 'Delivery', 'Delivery Boy', 'Digital Payment Engineer', 'Director', 'Distribution', 'Dj', 'Doctor', 'Doctor Loan Sales', 'Doctors', 'Draughtsman', 'Drill operator', 'Driver', 'Drone Engineer', 'Drone Flying', 'Drone Operator', 'Drone Pilot', 'DT Metering', 'Education Loan Sales', 'Electric Four Wheeler Sales', 'Electric Three Wheeler Sales', 'Electric Two Wheeler Sales', 'Electric Vehicle Sales', 'Electrical Engineer', 'Electricals Product Sales', 'Electrician', 'Electronics Sales', 'Energy / Power', 'Engineering', 'Environmental Service', 'Event planner', 'Executive Assistant', 'Eye Optometrist', 'Eye Optometrist- Fresher', 'Facility Management', 'Farm worker', 'Farmer', 'Field agent', 'Field officer', 'Field Operations', 'Field researcher', 'Field Sales', 'Field technician', 'Finance Officer', 'Finance Sales', 'Financial Analyst', 'Fire / Safety Manager', 'Fire / Safety Officer', 'Fire / Safety Supervisor', 'Fish processor', 'Fitter', 'FMCG Sales', 'Food Delivery', 'Forestry technician', 'Freight', 'Fridge-Refrigerator Sales', 'Fridge-Refrigerator Technician', 'Front desk staff', 'Front Office', 'Gallery assistant', 'General Trading', 'Geographic Information System- GIS', 'GIS Engineer', 'GIS Executive', 'Gold Appraisal', 'Gold Loan Sales', 'Government Affairs', 'Government Tendering', 'Graphic Designer', 'Grid Operations', 'Grocery Delivery', 'Hair Dresser', 'Hatchery worker', 'Health Insurance Sales', 'Heavy Equipment Sales', 'Heavy Machinery Sales', 'Heavy Vehicle Sales', 'Help desk technician', 'Helper', 'Home Loan Sales', 'Hospitality Management', 'Hotel Management', 'Hotel Manager', 'Hotel Sales', 'Housekeeping', 'Housekeeping Supervisor', 'HR Admin', 'Hr Executive', 'HR Generalist', 'HR Head', 'HR Manager', 'HR Operations', 'Hr Recruiter', 'HR Recruitment', 'HRBP', 'Human Resource', 'Hydrocarbon Engineering', 'Ice Cream Parlour', 'Illustrator', 'Import / Export', 'Import / Export Executive', 'Inspection Engineer', 'Installation Engineer', 'Insurance Sales', 'Intern', 'iOS Developer', 'IT- Information Technology', 'IT Recruitment', 'ITI Electricals', 'ITI Fitter', 'ITI Wireman', 'Java Developer', 'JCB Driver', 'Jewellery Sales', 'Junior consultant', 'Junior data analyst', 'Junior designer', 'Junior developer', 'Junior marketer', 'Lab Assistant', 'Lab Chemist', 'Lab Technician', 'Labourer', 'Laptop Sales', 'Laptop-PC Technician', 'Large Appliances Sales', 'Law Enforcement', 'Law Firm', 'Leasing agent', 'LED Light Sales', 'LED TV Sales', 'LED TV Technician', 'Legal', 'Legal assistant', 'Liaison Executive', 'Life Insurance Sales', 'Lighting Technician', 'Loader', 'Logger', 'Logistics Operations', 'Machine Operator', 'Machinery Loan Sales', 'Maintenance', 'Management', 'Manpower Hiring', 'Manufacturing', 'Market Research', 'Marketing', 'Matrimonial Services', 'Mechanic', 'Mechanical', 'Mechanical Engineer', 'Medical Assistant', 'Medical Billing', 'Medical Coder', 'Medical coordinator', 'Medical Lab Technician', 'Medical Officer', 'Medical Representative', 'Medical Technician', 'Medical Transcriptionist', 'Metal Testing', 'Meter reader', 'Micro Finance Sales', 'Micro Loan Sales', 'Milk Delivery', 'Milk Supply', 'MIS Executive', 'MIS Executive- Advance Excel', 'MIS Executive- Basic Excel', 'Mobile Accessories Sales', 'Mobile Sales', 'Mobile Technician', 'Movers', 'Mutual Fund Sales', 'Network Engineer', 'NGO', 'Non IT Recruitment', 'Nurse', 'Nurses', 'Nursing', 'Nursing Staff', 'O&M Executive', 'Operations', 'Operations Executive', 'Operator Assembling Line', 'Outreach worker', 'Over Draft Sales', 'Packers', 'Paints Sales', 'Paralegal', 'Parking', 'Payroll / Compliances', 'Peon', 'Personal Loan Sales', 'Pharmacist', 'Plant Maintenance', 'Plant Management', 'Plumber', 'Procurement', 'Procurement Officer', 'Production', 'Property assistant', 'Property Manager', 'Property Sales', 'Public Relations (PR)', 'Purchase', 'Python Developer', 'QSR Sales', 'Quality Assurance Inspector', 'Quality Checker', 'Quality Control', 'Quality Engineer', 'Quality inspector', 'Real Estate', 'Receptionist', 'Recovery', 'Recruiter', 'Recruitment / RPO', 'Repairing', 'Research intern', 'Research Scientist', 'Restaurant Manager', 'Restaurant Sales', 'Retail', 'Retail Sales', 'Retail Store', 'Rig hand', 'RMC Plant', 'Safety Supervisor', 'Sales / Business Development', 'Sales associate', 'Sales Engineer', 'Sales Manager', 'Sales Promoter', 'Sales Promotion', 'Sales/Marketing', 'SAP Executive', 'Saving Account Sales', 'Security', 'Security Guard', 'Security Officer', 'Security Services', 'Security System', 'SEO Specialist', 'Servant', 'Services', 'Shipping', 'Shop keeper', 'Site Engineer', 'Site Supervisor', 'Smart Grids', 'Smart Metering', 'Social media assistant', 'Social Services', 'Software Developer', 'Software Sales', 'Solar technician', 'Sourcing', 'Staffing', 'Steward', 'Stock clerk', 'Stock Maintaining', 'Store keeper', 'Store Operations', 'Store Sales', 'Structural Engineer', 'Supervisor', 'Supply Chain', 'Supply Chain Analyst', 'Support staff', 'Sweeper', 'Switches/Wire Sales', 'Tally', 'Taxi Driver', 'Teacher', 'Teaching assistant', 'Team Leader', 'Technical Sales', 'Technical Support', 'Technician',
].map(title => ({ value: title.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_'), label: title }));

// Key Skills from job application form
export const keySkillsOptions = [
  '3D Modeling', '3D Printing', '5S', 'Access Control System', 'Accountability', 'Accounting', 'Accounts', 'Achieving Sales Target', 'Active Learning', 'Active Listening', 'Active Problem Resolution', 'Active Questioning', 'Adaptability', 'Adaptability to Change', 'Admin', 'Administrative Support', 'Adobe Illustrator', 'Adobe Photoshop', 'Adobe XD', 'Advance Excel', 'Affiliate Marketing', 'After Effects', 'After-Sales Support', 'Agent Recruitment', 'Agile Methodologies', 'Agile Project Management', 'Agility', 'Agri Products Sales', 'Agri Sales', 'Agriculture', 'Agriculture Loan Sales', 'Agriculture Products', 'Analytical Reasoning', 'Analytical Thinking', 'Anatomy Knowledge', 'Android Development', 'Angular', 'Animation', 'Ansible', 'ANSYS', 'App Development', 'Artificial Intelligence', 'ASP.NET Core', 'Assembling', 'Attandance Management', 'Attendance Management', 'Attention to Detail', 'Audit', 'Audit Management', 'Auditing', 'AutoCAD', 'AutoCAD Software & SketchUp', 'Automation', 'Automotive Parts Sales', 'AWS', 'B2B', 'B2B sales', 'B2C', 'Banca Channel', 'Banking Operations', 'Banking Products Sales', 'Batteries Sales', 'BFSI', 'Bidding', 'Big Data', 'Bill Generation', 'Bill Payable/Receivable', 'Billing', 'Billing/Invoicing', 'Biotechnology', 'BirdScare Spikes', 'Blender', 'Blockchain', 'Blog Writing', 'Body Language Awareness', 'Bookkeeping', 'Bootstrap', 'Box Packaging', 'Brainstorming', 'Brand Management', 'Broadband Sales', 'Budgeting', 'Building Materials', 'Building Materials Sales', 'Building Products Division', 'Business Analysis', 'Business Communication', 'Business Development', 'Business Forecasting', 'Business Intelligence', 'Business Loan', 'Business Loan Sales', 'Business Strategy', 'C', 'C Programming', 'C#', 'C++', 'CAD', 'CAD Technician', 'CakePHP', 'Call Center Management', 'Call Handling', 'Calling', 'Campaign Management', 'Canva', 'CASA', 'CASA Sales', 'Case Management', 'Cashier', 'Cassandra', 'CATIA', 'CatiaV5', 'CCTV Monitoring', 'Cement', 'Cement Sales', 'Challans', 'Change Management', 'Channel partners', 'Channel Sales', 'Chef', 'Chemical', 'Chemicals Spraying', 'Chief Architect 3D', 'CI/CD Pipelines', 'Cinema 4D', 'Circuit Design', 'Civil', 'Civil Engineering', 'Client Relations', 'Client Relationship Management', 'Clinical Research', 'Cloud Architecture', 'Cloud Automation', 'Cloud Computing', 'Cloud Security', 'Coaching', 'CodeIgniter', 'Coding', 'Cold calling', 'Collaboration', 'Collaboration Across Teams', 'Collaboration with Multicultural Teams', 'Collaboration with Remote Teams', 'Collaborative Relation Skills', 'Collection', 'Commercial Sales', 'Commercial Vehicle Sales', 'Communication', 'Communication skill', 'Community Engagement', 'Compassion', 'Complaint and query', 'Compliance', 'Compliances', 'Computer', 'Computer Vision', 'Computer work', 'Concrete Curing', 'Confidence', 'Confidentiality', 'Conflict Management', 'Conflict Resolution', 'Consensus Building', 'Construction and Mining Machinery Sales', 'Construction Sales', 'Construction Site Visit', 'Constructive Criticism', 'Constructive Feedback', 'Consultative Selling', 'Consulting', 'Consumer Finance', 'Consumer Loan Sales', 'Content Creation', 'Content Management', 'Content Marketing', 'Contract Management', 'convincing power', 'Coordinating Events', 'Copywriting', 'CorelDRAW', 'Corporate Strategy', 'Cost Management', 'Cost Reduction', 'CouchDB', 'counter sales', 'create Automated Reports', 'Creative Thinking', 'Creative Writing', 'Creativity', 'Credit', 'Credit Card Sales', 'Credit Operations', 'Crisis Management', 'Critical Observation', 'Critical Thinking', 'CRM Software', 'Crop Scouting', 'Cross Selling', 'Cross-Cultural Communication', 'Cross-Functional Communication', 'Cross-Functional Leadership', 'Cryptography', 'CSS', 'Cube Casting', 'Cube Testing', 'Cultural Awareness', 'Curiosity', 'Current Account Opening', 'Current Account Sales', 'Customer Acquisition', 'Customer Empathy', 'Customer Feedback', 'Customer Handling', 'Customer Management', 'Customer Orientation', 'Customer Relationship Management', 'Customer Retention', 'Customer Satisfaction', 'Customer Service', 'Customer Support', 'Cybersecurity', 'Daily Line Up', 'Daily Sales Report', 'Data Analysis', 'Data Engineering', 'Data Entry', 'Data Governance', 'Data Management', 'Data Mining', 'Data Science', 'Data Visualization', 'Database Management', 'DCA', 'Dealer Management', 'Dealer Visit', 'Debugging', 'Decision Making', 'Decision-Making Under Pressure', 'Deep Learning', 'Delegation', 'Delivery Slot Handling', 'DEO', 'Dependability', 'Design Draughtsman', 'Design Thinking', 'Desktop Support', 'DevOps', 'Diagnostic Testing', 'Digital Marketing', 'Digital Strategy', 'DigitalOcean', 'Diplomacy', 'Disbursement', 'Dispatch', 'Dispute Resolution', 'Distributor Management', 'Diversity and Inclusion', 'Django', 'Docker', 'Documentation', 'Documents Verification', 'Drafting & Part Design', 'Drafting techniques, and blueprint interpretation', 'Draftsman', 'Drone Flying', 'DSA', 'DSA Channel', 'DT Metering', 'E KYC', 'E-commerce', 'Economics', 'Editing', 'EDPMS', 'Education Loan', 'Electric Vehicle Sales', 'Electrical', 'Electrical Diagram', 'Electrical Engineering', 'Electrical Installation', 'Electrical Parts', 'Electrical Technology', 'Electrical Work', 'Electrical Works', 'Electrician', 'Electrician Work', 'Electricity', 'Electronic', 'Electronics and Telecommunication', 'Elixir', 'Email Marketing', 'email process', 'Embedded Systems', 'Emergency Response', 'EMI Collection', 'Emotional Intelligence', 'Empathy', 'Employee Engagement', 'Employee Relations', 'Engine Oil', 'Engineering Design', 'English', 'English speaking', 'Enterprise Architecture', 'Enthusiasm', 'Environmental Management', 'Epidemiology', 'Equity Research', 'ERP Now', 'ERP Systems', 'Ethical Hacking', 'ETL Tools', 'Event Management', 'Event Planning', 'Excel', 'Excel Advanced', 'Excellent analytical skills', 'Excellent english comm', 'Executive Management', 'Exit Formalities', 'Expectation Management', 'Export', 'Export Documentation Knowledge', 'Express.js', 'Eye Care Products', 'Eye Testing', 'F Cut', 'Facebook Ads', 'Facilitation', 'Facility Management', 'Factory Management', 'Farmers Visit', 'Fashion Design', 'Feedback Delivery', 'Feedback Giving', 'Feedback Receiving', 'FEMA', 'Fertilisers Sales', 'Fertilizer', 'FICO', 'Field Sales', 'Field Survey', 'Figma', 'File Login', 'File Processing', 'Filling of BRC', 'Finacle', 'Finance', 'Financial Analysis', 'Financial Modeling', 'Financial Modelling', 'Financial Planning', 'Financial Risk Management', 'Fire', 'Fire safety', 'Firebase', 'Firewall Management', 'Flask', 'Flexibility', 'Flutter', 'FMCD', 'FMCG', 'Follow Up', 'Food', 'Footwear', 'Forecasting', 'Forensics', 'FoxPro', 'Fresher', 'Freshers', 'Front-End Development', 'Full-Stack Development', 'Fundraising', 'Fusion 360', 'Game Design', 'Game Development', 'Gardening', 'General Ledger', 'Genetic Engineering', 'Geographic Information Systems', 'GitHub Actions', 'GitLab CI', 'Go', 'Goal Setting', 'Gold Appraisal', 'Gold Finishing/Packaging', 'Gold Loan', 'Gold Loan Sales', 'Gold Testing', 'Good Communication', 'Good Communication Skills', 'Good Learner', 'Good management', 'Google Ads', 'Google Analytics', 'Google Cloud Platform', 'Google Data Studio', 'Government Relations', 'Government Tendering', 'Grafana', 'Graphic Design', 'GraphQL', 'Grass Cutting', 'Grease', 'GRN', 'Group Loan Sales', 'Growth Mindset', 'GST', 'HANA', 'Handling Complaints', 'Hard Working', 'Hardware', 'Hardware Troubleshooting', 'Haskell', 'Healthcare Administration', 'Healthcare Management', 'Heat Treatment', 'Heavy Machinery Sales', 'Help Desk', 'Helper', 'Heroku', 'Hindi', 'HL', 'Home Interior Solutions', 'Home Loan', 'Home Loan Sales', 'Honest', 'Hospital Administration', 'Hospitality Management', 'Hotel Management', 'Housekeeping Management', 'HR', 'HR Admin', 'HR Analytics', 'HR Management', 'HR Operations', 'HTML', 'Human Resources', 'Humor', 'HVAC Systems', 'IBM Cloud', 'IDS/IPS', 'IFFCO Sagrika', 'Illustration', 'Immunology', 'Import', 'Inbound Process', 'Incident Response', 'Industrial Engineering', 'Industrial Safety', 'Influencer Marketing', 'Influencing Others', 'Influencing Skills', 'Information Management', 'Information Security', 'Information Technology', 'Initiative', 'Innovation', 'Innovative', 'Inside sales', 'Institutional Sales', 'Instructional Design', 'Insurance', 'Insurance Advisor', 'Insurance Sales', 'Insurance Selling', 'Integrity', 'Interaction Design', 'Interior Design', 'International Business', 'Internet Sales', 'Interpersonal Skills', 'Interview Coordination', 'Interviewing', 'Inventory Management', 'Inverter Sales', 'Investment Analysis', 'InVision', 'Inward', 'Inward/Outward', 'Ionic', 'iOS Development', 'iOS Programming', 'IOT Development', 'IRDA Exam Preparation', 'IT Governance', 'IT Hardware', 'IT Infrastructure', 'IT Sales', 'IT Software', 'IT Support', 'ITI', 'ITI Electrical', 'Iti electrician', 'ITR', 'Java', 'JavaScript', 'Jenkins', 'Job Seeker', 'Joining Formalities', 'Journalism', 'jQuery', 'Kaithal', 'Kaizen', 'Kanban', 'Keras', 'Key Account Management', 'Kindness', 'Knowledge Management', 'Knowledge Sharing', 'Kotlin', 'Kotlin Multiplatform', 'Kubernetes', 'KYC', 'KYC Documentation', 'L Cut', 'Lab Chemist', 'Lab Management', 'Labor Relations', 'Labour Handling', 'Landline Phone Manufacturing', 'Language English and Hindi', 'LAP', 'LAP- Loan Against Property', 'Laravel', 'Lead Generation', 'Leadership', 'Leadership skills', 'Leadership Under Uncertainty', 'Lean Six Sigma', 'Learning Agility', 'leas', 'LED Light', 'LED Lights', 'Legal Compliance', 'Legal Research', 'Less', 'Liaison Executive', 'Life Insurance', 'Linguistics', 'Linux Administration', 'Loan', 'Loan Disbursement', 'Loan Products', 'Loan Sales', 'Loans', 'Logic Controller', 'Logistics', 'Lubricants', 'Machine Learning', 'mails/chats', 'Maintenance Management', 'Maintenance/Support', 'Making Detailing of Parts', 'Malware Analysis', 'Management', 'Managing Security Devices', 'Manpower Hiring', 'Manpower Planning', 'Manufacturing', 'MariaDB', 'Market Analysis', 'Market Research', 'Marketing', 'Marketing Automation', 'Material Handling', 'Material Management', 'MATLAB', 'Matplotlib', 'Maya', 'Mechanical', 'Mechanical Draftsperson', 'Mechanical Draughtsman', 'Mechanical Engineering', 'Media Relations', 'Mediation', 'Medical Coding', 'Mentoring', 'Mergers and Acquisitions', 'Meter Installation', 'Micro Finance', 'Micro Loan', 'Micro Loan Sales', 'Microbiology', 'Microservices', 'Microsoft Azure', 'Microsoft Office', 'MIS', 'MIS Excel', 'MIS Executive', 'MM', 'Mobile', 'Mobile App Development', 'Mobile Development', 'Mobile Sales', 'Molecular Biology', 'MongoDB', 'MonkeyScare Spikes', 'Mortgage', 'Motivating Others', 'Motivation', 'MS Dynamics', 'MS Excel Advanced', 'MS Office', 'MSME Loan', 'Multitasking', 'MySQL', 'Nagios', 'Nanotechnology', 'Natural Language Processing', 'Negotiation', 'Negotiation Skills', 'Negotiation Tactics', 'Network Administration', 'Network Security', 'Network Solutions', 'Network Support', 'Networking', 'News Paper Sales', 'Next.js', 'Node.js', 'Nonprofit Management', 'Nonverbal Communication', 'Non-Verbal Communication', 'NoSQL', 'Not Destructive Testing', 'NumPy', 'Nursing', 'Nuxt.js', 'Objective-C', 'Object-Oriented Programming', 'Observation Skills', 'Offer Letter Generation', 'Office Administration', 'Office Administrator', 'Office Management', 'Onboarding', 'Online Advertising', 'Open Market Sales', 'Open-Mindedness', 'Operations', 'Operations Management', 'Operations Strategy', 'Oracle', 'Oracle DB', 'Oracle ERP', 'Organization', 'Organizational Development', 'Organizational Skills', 'OS Installation', 'Outbound Calling', 'Outbound Calls', 'outbound sales', 'outlook', 'Outward', 'Packaging', 'Paint Order Generation', 'Paint Sales', 'Paints', 'PAN/Adhaar Verification', 'Pandas', 'Patent Law', 'Pathology', 'Patience', 'Patient Care', 'Payroll', 'Payroll Management', 'Payroll Processing', 'Penetration Testing', 'People Management', 'Performance Analysis', 'Performance Management', 'Perl', 'Personal Loan', 'Personal Loan Sales', 'Persuasion', 'Persuasive Writing', 'Pesticides Spraying', 'Pharma', 'Pharma Sales', 'Pharmaceutical Sales', 'Pharmacy', 'Photography', 'Photography Editing', 'PHP', 'Physics', 'Pipeline Management', 'PL/SQL', 'Plan Sales', 'Planning', 'Plant Trees Flowers', 'PLC Programming', 'Plywood', 'PO', 'PO Creation', 'Podcasting', 'Policy Analysis', 'Policy Development', 'Polymer Pipe Sales', 'Portal Sourcing', 'Portfolio Analysis', 'Portfolio Management', 'Positive Attitude', 'PostgreSQL', 'Pouring', 'Power BI', 'Power Distribution', 'Power Energy', 'Power Supply', 'Power Systems', 'Predictive Analytics', 'Premiere Pro', 'Prepration Of Books', 'Presentable', 'Presentation Design', 'Presentation Skills', 'Press Release Writing', 'Prioritization', 'Problem Solving', 'Process Engineering', 'Process Improvement', 'Procurement', 'Product demo', 'Product Design', 'Product Development', 'Product Management', 'Product Strategy', 'Product Survey', 'Product Testing', 'Production', 'Production Line Control', 'Production Planning', 'Professional Writing', 'Professionalism', 'Program Management', 'Programmer', 'Programming', 'Project Coordination', 'Project Management', 'Project Planning', 'Project Salary', 'Project Sales', 'Prometheus', 'Promoter', 'Proofreading', 'property sales', 'Proteus', 'Prototyping', 'Psychology', 'Public Health', 'Public Relations', 'Public Speaking', 'Punctuality', 'Puppet', 'Purchase', 'Purchasing', 'PVC Pipe Sales', 'Python', 'PyTorch', 'QlikView', 'Quality Assurance', 'Quality Checking', 'Quality Control', 'Quality Improvement', 'Quality Testing', 'Quantitative Analysis', 'QuickBooks', 'R', 'R Programming', 'Radiology', 'Rapport Building', 'React Native', 'React.js', 'Ready For Interview', 'Reaf Raking', 'Real Estate', 'Real Estate Management', 'Real estate sales', 'Recommendation Systems', 'Reconciliation', 'Recruiting', 'Recruitment', 'Recruitment Strategy', 'Redis', 'Regulatory Compliance', 'Reinforcement Learning', 'Relationship Building', 'Relationship Management', 'Relationship Manager', 'Remote Collaboration', 'Remote Team Management', 'Renewable Energy Systems', 'Repairing', 'Report Generation', 'Report Writing', 'Reports', 'Research', 'Research Analysis', 'Research Skills', 'Residential sales', 'Resilience', 'Resource Management', 'Respectfulness', 'Responsibility', 'Retail', 'Retail Management', 'Retail Sales', 'Retail sales Promoter', 'Revenue Management', 'Rider Handling', 'Risk Analysis', 'Risk Assessment', 'Risk Management', 'RMC', 'Robotic Process Automation', 'Robotics', 'Ruby', 'Ruby on Rails', 'Rust', 'Safety', 'Safety Officer Activities', 'Salary Process', 'Sales', 'Sales / Marketing', 'Sales Coordinator', 'Sales Lead Generation', 'Sales Promoter', 'Sales to service', 'Salesforce CRM', 'SAP', 'SAP FICO', 'Sass', 'Savings Account Opening', 'SCADA Systems', 'Scala', 'Scheduling', 'Scientific Research', 'Scikit-learn', 'Scrum', 'Seaborn', 'Search Engine Marketing', 'Search Engine Marketing (SEM)', 'Search Engine Optimization', 'Search Engine Optimization (SEO)', 'Security', 'Security Auditing', 'Security Services Packages Sales', 'Security System', 'Seeds', 'Self-Awareness', 'Self-Confidence', 'Self-Discipline', 'Self-Motivation', 'Self-Regulation', 'SEM', 'SEO', 'Server Management', 'Serverless Computing', 'Service Delivery', 'Service Mindset', 'SharePoint', 'Shift Incharge', 'Shift Management', 'Shipping', 'Shop Visits', 'SIEM', 'Sim Card Sales', 'Simulink', 'Single Line Diagram', 'Site Engineer', 'Site Supervisor', 'Six Sigma', 'Sketch', 'Sludge / Salt Operations', 'Slump Monitoring', 'Smart Electric Meter Installation', 'Smart Metering', 'SME Loan', 'Social Media Advertising', 'Social Media Management', 'Social Skills', 'Software', 'Software Architecture', 'Software Development', 'Software Engineering', 'Software Project Management', 'Software Sales', 'Software Testing', 'Solar', 'Solar Panel', 'SolidWorks', 'Source Home Loan Files through DSA', 'Spare Parts Sales', 'Speech Recognition', 'Spine', 'Splunk', 'Spring Boot', 'SQL', 'SQLite', 'STAAD Pro', 'Stakeholder Management', 'Statistical Analysis', 'Statistical Modelling', 'STEM Education', 'Stock Maintaining report', 'Store Inventory', 'Store Promoter', 'Storytelling', 'Strategic Leadership', 'Strategic Marketing', 'Strategic Planning', 'Strategic Thinking', 'Stress Management', 'Structural Engineering', 'Sunglasses Sales', 'Supervisory Skills', 'Supply Chain', 'Supply Chain Management', 'Supply Management', 'Surgical Assistance', 'Surveillance Drone', 'Sustainability', 'Svelte', 'Swift', 'SwiftUI', 'System Administration', 'Systems Analysis', 'Tableau', 'Tailwind CSS', 'Talent Acquisition', 'Talent Development', 'Tally', 'Tally ERP', 'Tax Preparation', 'Taxation', 'TDS', 'Teaching', 'Team Building', 'Team Handling', 'Team Lead', 'Team Leadership', 'Team Management', 'Team work', 'Teamwork', 'Technical Documentation', 'Technical Sales', 'Technical Support', 'Technical Writing', 'Technician', 'Tele Caller', 'Tele sales', 'Telecalling', 'Telecom', 'Telecom Sales', 'Telecommunications', 'TeleSales', 'Tender Filling', 'Tender Management', 'TensorFlow', 'Terraform', 'Test Automation', 'Testing', 'Therapeutic Skills', 'Time Management', 'Tolerance', 'Tolerance for Ambiguity', 'Trainee', 'Training', 'Training Delivery', 'Training development', 'Training Management', 'Training Program', 'Transcription', 'Transformer Meter Installation', 'Transformers', 'Translation', 'Transportation Management', 'Travel Management', 'Travis CI', 'Troubleshoot', 'Troubleshooting', 'Trust Building', 'Trustworthiness', 'TypeScript', 'Tyre Sales', 'UI Design', 'UI/UX Design', 'Ultrasonic Test', 'Unit GA BOM', 'Unity 3D', 'Unreal Engine', 'UPI', 'UX Design', 'VAC Products', 'Valuation', 'Vendor Management', 'Verbal Communication', 'Video Editing', 'Video KYC Process', 'Video Marketing', 'Video Production', 'Virtual Assistance', 'Virtual Reality', 'Vision Setting', 'Visionary Thinking', 'Visual Design', 'Vlookup', 'Vue.js', 'Vulnerability Assessment', 'Warehouse', 'Warehouse Activities', 'Warehouse Management', 'Warehouse Operations', 'Web Analytics', 'Web Design', 'Web Development', 'Web Security', 'Website', 'Weighment', 'WiFi', 'Wi-Fi Router', 'WiFi Sales', 'Windows Administration', 'Wire', 'Wireframing', 'Wiring', 'WordPress', 'Work Ethic', 'Workforce Planning', 'Workplace Safety', 'Writing', 'Writing Skills', 'Written Communication', 'Xamarin', 'ZBrush', 'Zero Trust Architecture',
].map(skill => ({ value: skill.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_').replace(/\(/g, '').replace(/\)/g, ''), label: skill }));

// Job Roles options
export const jobRolesOptions = [
  'Fresher', 'AC-Air Conditioner Sales', 'AC-Air Conditioner Technician', 'Accountant', 'Accounting', 'Accounts / Finance', 'Accounts clerk', 'Accounts Executive', 'Admin', 'Admin Executive', 'Advisory Services', 'Aea Head', 'Agency Channel', 'Agribusiness / Marketing', 'Agriculture Loan Sales', 'Analyst', 'Android Developer', 'Apprentice carpenter', 'Assembly line worker', 'ATM Engineer', 'ATM Staff', 'Auditing', 'Auto Driver', 'Auto Loan Sales', 'Automated Metering', 'Automobiles Sales', 'Automotive Parts Sales', 'B2B Sales', 'B2C Sales', 'Background Verification', 'Banca Channel', 'Banking', 'Banking Operations', 'Banking Sales', 'Beauty Parlour', 'Bidding Officer', 'Bike Insurance Sales', 'Bike Loan Sales', 'Bike Mechanic', 'Billing / Cashier', 'Branch Manager', 'Brand Promoter', 'Broadband Installation Engineer', 'Broking Services', 'Building Materials Sales', 'Bus Driver', 'Bus Mechanic', 'Bus Sales', 'Business Development', 'Business Development Executive', 'Business Head', 'Business Loan Sales', 'CA- Chartered Accountant', 'Call Center Agent', 'Calling', 'Camera assistant', 'Camera Sales', 'Camera Technician', 'Car Insurance Sales', 'Car Loan Sales', 'Car Mechanic', 'Caregiver', 'Cargo', 'Carpenter', 'CASA Sales', 'Cashier', 'Cement Sales', 'Channel Sales', 'Chef', 'Chemical Engineer', 'Chemical Engineering', 'Civil Engineer', 'Civil Sales', 'Cleaner', 'Clerk', 'Collection', 'Commissioning Support Services', 'Consulting', 'Content creator', 'Content moderator', 'Content Writer', 'Cook', 'Corporate Lawyer', 'Corporate Salary Account Sales', 'Country Head', 'Courier', 'Crane Driver', 'Credit Card Sales', 'Credit Operations', 'Current Account Sales', 'Current Affairs', 'Customer Service Executive', 'Customer service representative', 'Customer Support', 'Cybersecurity Analyst', 'D2C Sales', 'Dairy assistant', 'Data annotator', 'Data Entry', 'Data entry operator', 'Data Scientist', 'Delivery', 'Delivery Boy', 'Digital Payment Engineer', 'Director', 'Distribution', 'Dj', 'Doctor', 'Doctor Loan Sales', 'Doctors', 'Draughtsman', 'Drill operator', 'Driver', 'Drone Engineer', 'Drone Flying', 'Drone Operator', 'Drone Pilot', 'DT Metering', 'Education Loan Sales', 'Electric Four Wheeler Sales', 'Electric Three Wheeler Sales', 'Electric Two Wheeler Sales', 'Electric Vehicle Sales', 'Electrical Engineer', 'Electricals Product Sales', 'Electrician', 'Electronics Sales', 'Energy / Power', 'Engineering', 'Environmental Service', 'Event planner', 'Executive Assistant', 'Eye Optometrist', 'Eye Optometrist- Fresher', 'Facility Management', 'Farm worker', 'Farmer', 'Field agent', 'Field officer', 'Field Operations', 'Field researcher', 'Field Sales', 'Field technician', 'Finance Officer', 'Finance Sales', 'Financial Analyst', 'Fire / Safety Manager', 'Fire / Safety Officer', 'Fire / Safety Supervisor', 'Fish processor', 'Fitter', 'FMCG Sales', 'Food Delivery', 'Forestry technician', 'Freight', 'Fridge-Refrigerator Sales', 'Fridge-Refrigerator Technician', 'Front desk staff', 'Front Office', 'Gallery assistant', 'General Trading', 'Geographic Information System- GIS', 'GIS Engineer', 'GIS Executive', 'Gold Appraisal', 'Gold Loan Sales', 'Government Affairs', 'Government Tendering', 'Graphic Designer', 'Grid Operations', 'Grocery Delivery', 'Hair Dresser', 'Hatchery worker', 'Health Insurance Sales', 'Heavy Equipment Sales', 'Heavy Machinery Sales', 'Heavy Vehicle Sales', 'Help desk technician', 'Helper', 'Home Loan Sales', 'Hospitality Management', 'Hotel Management', 'Hotel Manager', 'Hotel Sales', 'Housekeeping', 'Housekeeping Supervisor', 'HR Admin', 'Hr Executive', 'HR Generalist', 'HR Head', 'HR Manager', 'HR Operations', 'Hr Recruiter', 'HR Recruitment', 'HRBP', 'Human Resource', 'Hydrocarbon Engineering', 'Ice Cream Parlour', 'Illustrator', 'Import / Export', 'Import / Export Executive', 'Inspection Engineer', 'Installation Engineer', 'Insurance Sales', 'Intern', 'iOS Developer', 'IT- Information Technology', 'IT Recruitment', 'ITI Electricals', 'ITI Fitter', 'ITI Wireman', 'Java Developer', 'JCB Driver', 'Jewellery Sales', 'Junior consultant', 'Junior data analyst', 'Junior designer', 'Junior developer', 'Junior marketer', 'Lab Assistant', 'Lab Chemist', 'Lab Technician', 'Labourer', 'Laptop Sales', 'Laptop-PC Technician', 'Large Appliances Sales', 'Law Enforcement', 'Law Firm', 'Leasing agent', 'LED Light Sales', 'LED TV Sales', 'LED TV Technician', 'Legal', 'Legal assistant', 'Liaison Executive', 'Life Insurance Sales', 'Lighting Technician', 'Loader', 'Logger', 'Logistics Operations', 'Machine Operator', 'Machinery Loan Sales', 'Maintenance', 'Management', 'Manpower Hiring', 'Manufacturing', 'Market Research', 'Marketing', 'Matrimonial Services', 'Mechanic', 'Mechanical', 'Mechanical Engineer', 'Medical Assistant', 'Medical Billing', 'Medical Coder', 'Medical coordinator', 'Medical Lab Technician', 'Medical Officer', 'Medical Representative', 'Medical Technician', 'Medical Transcriptionist', 'Metal Testing', 'Meter reader', 'Micro Finance Sales', 'Micro Loan Sales', 'Milk Delivery', 'Milk Supply', 'MIS Executive', 'MIS Executive- Advance Excel', 'MIS Executive- Basic Excel', 'Mobile Accessories Sales', 'Mobile Sales', 'Mobile Technician', 'Movers', 'Mutual Fund Sales', 'Network Engineer', 'NGO', 'Non IT Recruitment', 'Nurse', 'Nurses', 'Nursing', 'Nursing Staff', 'O&M Executive', 'Operations', 'Operations Executive', 'Operator Assembling Line', 'Outreach worker', 'Over Draft Sales', 'Packers', 'Paints Sales', 'Paralegal', 'Parking', 'Payroll / Compliances', 'Peon', 'Personal Loan Sales', 'Pharmacist', 'Plant Maintenance', 'Plant Management', 'Plumber', 'Procurement', 'Procurement Officer', 'Production', 'Property assistant', 'Property Manager', 'Property Sales', 'Public Relations (PR)', 'Purchase', 'Python Developer', 'QSR Sales', 'Quality Assurance Inspector', 'Quality Checker', 'Quality Control', 'Quality Engineer', 'Quality inspector', 'Real Estate', 'Receptionist', 'Recovery', 'Recruiter', 'Recruitment / RPO', 'Repairing', 'Research intern', 'Research Scientist', 'Restaurant Manager', 'Restaurant Sales', 'Retail', 'Retail Sales', 'Retail Store', 'Rig hand', 'RMC Plant', 'Safety Supervisor', 'Sales / Business Development', 'Sales associate', 'Sales Engineer', 'Sales Manager', 'Sales Promoter', 'Sales Promotion', 'Sales/Marketing', 'SAP Executive', 'Saving Account Sales', 'Security', 'Security Guard', 'Security Officer', 'Security Services', 'Security System', 'SEO Specialist', 'Servant', 'Services', 'Shipping', 'Shop keeper', 'Site Engineer', 'Site Supervisor', 'Smart Grids', 'Smart Metering', 'Social media assistant', 'Social Services', 'Software Developer', 'Software Sales', 'Solar technician', 'Sourcing', 'Staffing', 'Steward', 'Stock clerk', 'Stock Maintaining', 'Store keeper', 'Store Operations', 'Store Sales', 'Structural Engineer', 'Supervisor', 'Supply Chain', 'Supply Chain Analyst', 'Support staff', 'Sweeper', 'Switches/Wire Sales', 'Tally', 'Taxi Driver', 'Teacher', 'Teaching assistant', 'Team Leader', 'Technical Sales', 'Technical Support', 'Technician', 'Tele Caller', 'Tele Sales', 'Telecaller', 'Telecalling / BPO', 'Tobacco Sales', 'Tractor Loan Sales', 'Transmission', 'Transportation', 'Truck Sales', 'Tutor', 'Utility Services', 'Verification', 'Volunteer coordinator', 'Waiter', 'Ward Boy', 'Warehouse associate', 'Warehouse Coordinator', 'Warehouse Executive', 'Warehouse Operations', 'Warranty Engineer', 'Watch Sales', 'Water-RO Sales', 'Water-RO Technician', 'Wind turbine assembler', 'Windows Developer', 'Wireman', 'WordPress Developer', 'Zonal Head',
].map(role => ({ value: role.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_').replace(/\(/g, '').replace(/\)/g, '').replace(/-/g, '_'), label: role }));

// Multi-step form configuration
export const formSteps = [
  {
    id: 'step1',
    title: 'Company & Job Details',
    fields: [
      {
        name: 'companyName',
        label: 'Company Name / Consultancy Name',
        type: 'autocomplete',
        placeholder: 'Enter Company Name',
        icon: 'business-outline',
        required: true,
        allowAddNew: true,
        suggestions: [],
      },
      {
        name: 'companyType',
        label: 'Current Company Type',
        type: 'dropdown',
        placeholder: 'Select company type',
        icon: 'briefcase-outline',
        required: true,
        options: companyTypeOptions,
      },
      {
        name: 'employeeCount',
        label: 'Total Employees Count In Your Company',
        type: 'dropdown',
        placeholder: 'Select employee count',
        icon: 'people-outline',
        required: true,
        options: employeeCountOptions,
      },
      {
        name: 'jobTitle',
        label: 'Job Title / Designation',
        type: 'dropdown',
        placeholder: 'Type or Select Existing Suggestion',
        icon: 'briefcase-outline',
        required: true,
        options: jobTitleOptions,
      },
      {
        name: 'keySkills',
        label: 'Key Skills Name (Show 10 to 12 Suggestion Also)',
        type: 'multiselect',
        placeholder: 'Select key skills',
        icon: 'star-outline',
        required: true,
        maxSelections: 12,
        options: keySkillsOptions,
      },
    ],
  },
  {
    id: 'step2',
    title: 'Employment & Job Type',
    fields: [
      {
        name: 'employmentType',
        label: 'Current/ Last Employment Type',
        type: 'dropdown',
        placeholder: 'Select employment type',
        icon: 'document-text-outline',
        required: true,
        options: employmentTypeOptions,
      },
      {
        name: 'jobType',
        label: 'Job Type',
        type: 'dropdown',
        placeholder: 'Select job type',
        icon: 'time-outline',
        required: true,
        options: jobTypeOptions,
      },
      {
        name: 'jobMode',
        label: 'Job Mode Type',
        type: 'dropdown',
        placeholder: 'Select job mode',
        icon: 'location-outline',
        required: true,
        options: jobModeOptions,
      },
      {
        name: 'jobShift',
        label: 'Job Shift Type',
        type: 'dropdown',
        placeholder: 'Select job shift',
        icon: 'moon-outline',
        required: true,
        options: jobShiftOptions,
      },
    ],
  },
  {
    id: 'step3',
    title: 'Job Location',
    fields: [
      {
        name: 'jobState',
        label: 'Job State',
        type: 'dropdown',
        placeholder: 'Select state',
        icon: 'map-outline',
        required: true,
        options: [],
      },
      {
        name: 'jobCity',
        label: 'Job City/Region',
        type: 'multiselect',
        placeholder: 'Select cities',
        icon: 'business-outline',
        required: true,
        allowAddNew: true,
        maxSelections: 10,
        options: [],
      },
      {
        name: 'jobLocality',
        label: 'Job Locality (Optional)',
        type: 'autocomplete',
        placeholder: 'Enter locality',
        icon: 'navigate-outline',
        required: false,
        allowAddNew: true,
        suggestions: [],
      },
      {
        name: 'distance',
        label: 'Distance From Job Location',
        type: 'dropdown',
        placeholder: 'Select Distance in KM',
        icon: 'navigate-circle-outline',
        required: false,
        options: distanceOptions,
      },
      {
        name: 'includeRelocate',
        label: 'Include Willing To Relocate Candidates',
        type: 'checkbox',
        required: false,
      },
    ],
  },
  {
    id: 'step4',
    title: 'Experience & Salary',
    fields: [
      {
        name: 'experienceLevel',
        label: 'Experience Level',
        type: 'dropdown',
        placeholder: 'Select experience level',
        icon: 'ribbon-outline',
        required: true,
        options: experienceLevelOptions,
      },
      {
        name: 'experienceMin',
        label: 'Total experience (Minimum)',
        type: 'dropdown',
        placeholder: 'Select minimum experience',
        icon: 'trending-up-outline',
        required: false,
        options: experienceYearsOptions,
      },
      {
        name: 'experienceMax',
        label: 'Total experience (Maximum)',
        type: 'dropdown',
        placeholder: 'Select maximum experience',
        icon: 'trending-up-outline',
        required: false,
        options: experienceYearsOptions,
      },
      {
        name: 'salaryMin',
        label: 'In Hand Salary per Annual (Minimum)',
        type: 'number',
        placeholder: 'Enter minimum salary',
        icon: 'cash-outline',
        required: false,
      },
      {
        name: 'salaryMax',
        label: 'In Hand Salary per Annual (Maximum)',
        type: 'number',
        placeholder: 'Enter maximum salary',
        icon: 'cash-outline',
        required: false,
      },
      {
        name: 'hideSalary',
        label: 'Hide Salary Details From Candidates',
        type: 'checkbox',
        required: false,
      },
      {
        name: 'additionalBenefits',
        label: 'Additional benefits',
        type: 'multiselect',
        placeholder: 'Select benefits',
        icon: 'gift-outline',
        required: false,
        maxSelections: 10,
        options: additionalBenefitsOptions,
      },
    ],
  },
  {
    id: 'step5',
    title: 'Candidate Requirements',
    fields: [
      {
        name: 'gender',
        label: 'Gender',
        type: 'dropdown',
        placeholder: 'Select gender',
        icon: 'person-outline',
        required: false,
        options: genderOptions,
      },
      {
        name: 'maritalStatus',
        label: 'Marital Status',
        type: 'dropdown',
        placeholder: 'Select marital status',
        icon: 'heart-outline',
        required: false,
        options: maritalStatusOptions,
      },
      {
        name: 'industries',
        label: 'Employer Job Industry / Sectors',
        type: 'multiselect',
        placeholder: 'Select industries',
        icon: 'business-outline',
        required: false,
        maxSelections: 8,
        options: industryOptions,
      },
      {
        name: 'subIndustries',
        label: 'Sub-Industries',
        type: 'multiselect',
        placeholder: 'Select sub-industries',
        icon: 'briefcase-outline',
        required: false,
        maxSelections: 8,
        options: [],
        dependsOn: 'industries',
      },
      {
        name: 'departments',
        label: 'Department Category',
        type: 'multiselect',
        placeholder: 'Select departments',
        icon: 'folder-outline',
        required: false,
        maxSelections: 8,
        options: departmentOptions,
      },
      {
        name: 'subDepartments',
        label: 'Sub-Departments',
        type: 'multiselect',
        placeholder: 'Select sub-departments',
        icon: 'folder-open-outline',
        required: false,
        maxSelections: 8,
        options: [],
        dependsOn: 'departments',
      },
      {
        name: 'jobRoles',
        label: 'Job Roles (Show 10 to 12 Suggestion Also)',
        type: 'multiselect',
        placeholder: 'Select job roles',
        icon: 'person-circle-outline',
        required: false,
        maxSelections: 10,
        allowAddNew: true,
        options: jobRolesOptions,
      },
    ],
  },
  {
    id: 'step6',
    title: 'Education & Demographics',
    fields: [
      {
        name: 'educationLevel',
        label: 'Level of Education',
        type: 'multiselect',
        placeholder: 'Select education level',
        icon: 'school-outline',
        required: false,
        maxSelections: 10,
        options: EDUCATION_LEVEL_OPTIONS.map(level => ({
          value: level.toLowerCase().replace(/\s+/g, '_'),
          label: level,
        })),
      },
      {
        name: 'course',
        label: 'Course',
        type: 'multiselect',
        placeholder: 'Select courses',
        icon: 'book-outline',
        required: false,
        maxSelections: 10,
        options: [],
        dependsOn: 'educationLevel',
      },
      {
        name: 'specialization',
        label: 'Specialization',
        type: 'multiselect',
        placeholder: 'Select specialization',
        icon: 'medal-outline',
        required: false,
        maxSelections: 10,
        options: [],
        dependsOn: 'course',
      },
      {
        name: 'ageMin',
        label: 'Candidate Age (Minimum)',
        type: 'dropdown',
        placeholder: 'Select minimum age',
        icon: 'person-outline',
        required: false,
        options: generateAgeOptions(),
      },
      {
        name: 'ageMax',
        label: 'Candidate Age (Maximum)',
        type: 'dropdown',
        placeholder: 'Select maximum age',
        icon: 'person-outline',
        required: false,
        options: generateAgeOptions(),
      },
      {
        name: 'preferredLanguage',
        label: 'Preferred Language',
        type: 'multiselect',
        placeholder: 'Select languages',
        icon: 'language-outline',
        required: false,
        maxSelections: 5,
        options: languageOptions,
      },
      {
        name: 'joiningPeriod',
        label: 'Joining Period',
        type: 'dropdown',
        placeholder: 'Select joining period',
        icon: 'calendar-outline',
        required: false,
        options: joiningPeriodOptions,
      },
    ],
  },
  {
    id: 'step7',
    title: 'Diversity & Accessibility',
    fields: [
      {
        name: 'diversityHiring',
        label: 'Diversity Hiring',
        type: 'dropdown',
        placeholder: 'Select diversity preference',
        icon: 'people-circle-outline',
        required: false,
        options: diversityHiringOptions,
      },
      {
        name: 'disabilityStatus',
        label: 'Disability Status',
        type: 'dropdown',
        placeholder: 'Select disability status',
        icon: 'accessibility-outline',
        required: false,
        options: disabilityStatusOptions,
      },
      {
        name: 'disabilityTypes',
        label: 'Any Disabilities/Differently-abled',
        type: 'multiselect',
        placeholder: 'Select disability types',
        icon: 'medical-outline',
        required: false,
        maxSelections: 5,
        options: disabilityTypeOptions,
        dependsOn: 'disabilityStatus',
        showWhen: 'have_disability',
      },
    ],
  },
  {
    id: 'step8',
    title: 'Job Description',
    fields: [
      {
        name: 'jobDescription',
        label: 'Job Description',
        type: 'textarea',
        placeholder: 'Enter detailed job description...',
        required: true,
        maxLength: 2000,
      },
      {
        name: 'numberOfVacancy',
        label: 'Number Of Vacancy',
        type: 'number',
        placeholder: 'Enter number of positions',
        icon: 'people-outline',
        required: true,
      },
    ],
  },
  {
    id: 'step9',
    title: 'Walk-in Details (Optional)',
    fields: [
      {
        name: 'includeWalkin',
        label: 'Include Walk-in Details',
        type: 'checkbox',
        required: false,
      },
      {
        name: 'walkinStartDate',
        label: 'Walk-in Start Date',
        type: 'date',
        placeholder: 'Select start date',
        icon: 'calendar-outline',
        required: false,
        dependsOn: 'includeWalkin',
      },
      {
        name: 'walkinEndDate',
        label: 'Walk-in End Date',
        type: 'date',
        placeholder: 'Select end date',
        icon: 'calendar-outline',
        required: false,
        dependsOn: 'includeWalkin',
      },
      {
        name: 'walkinDuration',
        label: 'Duration (Days)',
        type: 'number',
        placeholder: 'Enter duration in days',
        icon: 'time-outline',
        required: false,
        dependsOn: 'includeWalkin',
      },
      {
        name: 'walkinTiming',
        label: 'Walk-in Timing',
        type: 'text',
        placeholder: 'e.g., 10:00 AM - 5:00 PM',
        icon: 'time-outline',
        required: false,
        dependsOn: 'includeWalkin',
      },
      {
        name: 'walkinVenue',
        label: 'Walk-in Venue Address',
        type: 'textarea',
        placeholder: 'Enter complete venue address',
        required: false,
        dependsOn: 'includeWalkin',
      },
      {
        name: 'walkinGoogleMap',
        label: 'Google Map URL',
        type: 'text',
        placeholder: 'Enter Google Maps link',
        icon: 'map-outline',
        required: false,
        dependsOn: 'includeWalkin',
      },
    ],
  },
  {
    id: 'step10',
    title: 'Contact Information',
    fields: [
      {
        name: 'jobResponseMethod',
        label: 'Job Response Methods',
        type: 'dropdown',
        placeholder: 'Select response method',
        icon: 'mail-outline',
        required: true,
        options: jobResponseMethodOptions,
      },
      {
        name: 'communicationPreference',
        label: 'Communication Preference',
        type: 'dropdown',
        placeholder: 'Select preference',
        icon: 'chatbubbles-outline',
        required: true,
        options: communicationPreferenceOptions,
      },
      {
        name: 'contactPersonName',
        label: 'HR/Contact Person Name',
        type: 'text',
        placeholder: 'Enter contact person name',
        icon: 'person-outline',
        required: false,
      },
      {
        name: 'contactPersonNumber',
        label: 'HR/Contact Person Number',
        type: 'tel',
        placeholder: 'Enter contact number',
        icon: 'call-outline',
        required: false,
      },
      {
        name: 'contactPersonEmail',
        label: 'HR/Contact Person Email',
        type: 'email',
        placeholder: 'Enter email address',
        icon: 'mail-outline',
        required: false,
      },
      {
        name: 'contactPersonWhatsapp',
        label: 'HR/Contact Person WhatsApp Number',
        type: 'tel',
        placeholder: 'Enter WhatsApp number',
        icon: 'logo-whatsapp',
        required: false,
      },
      {
        name: 'contactTimingStart',
        label: 'HR/Contact Timing (Start)',
        type: 'time',
        placeholder: 'Select start time',
        required: false,
      },
      {
        name: 'contactTimingEnd',
        label: 'HR/Contact Timing (End)',
        type: 'time',
        placeholder: 'Select end time',
        required: false,
      },
      {
        name: 'contactDays',
        label: 'HR/Contact Days',
        type: 'weekdays',
        required: false,
      },
    ],
  },
  {
    id: 'step11',
    title: 'Additional Details',
    fields: [
      {
        name: 'questionsForCandidates',
        label: 'Questions For Candidates',
        type: 'questionbuilder',
        required: false,
      },
      {
        name: 'collaborateWithUsers',
        label: 'Collaborate With Other Users',
        type: 'checkbox',
        description: 'Other User Can View/Edit Job',
        required: false,
      },
      {
        name: 'collaboratorEmails',
        label: 'Enter Multiple Users Email ID to Receive Response',
        type: 'text',
        placeholder: 'Enter email IDs separated by commas',
        icon: 'mail-outline',
        required: false,
        dependsOn: 'collaborateWithUsers',
      },
    ],
  },
  {
    id: 'step12',
    title: 'Client Details (For Consultancy)',
    fields: [
      {
        name: 'aboutClient',
        label: 'About Your Clients (in Case Of Consultancy)',
        type: 'textarea',
        placeholder: 'Enter client details',
        required: false,
      },
      {
        name: 'clientCompanyName',
        label: 'Client/Company Name',
        type: 'text',
        placeholder: 'Enter client company name',
        icon: 'business-outline',
        required: false,
      },
      {
        name: 'hideClientName',
        label: 'Hide Client Name From Candidates',
        type: 'checkbox',
        required: false,
      },
      {
        name: 'hideEmployerDetails',
        label: 'If Hide Company Name, Type Short Details About Employer',
        type: 'textarea',
        placeholder: 'Enter short details about employer',
        required: false,
        dependsOn: 'hideClientName',
      },
    ],
  },
];

export default {
  formSteps,
  companyTypeOptions,
  employeeCountOptions,
  employmentTypeOptions,
  jobTypeOptions,
  jobModeOptions,
  jobShiftOptions,
  experienceLevelOptions,
  experienceYearsOptions,
  genderOptions,
  maritalStatusOptions,
  additionalBenefitsOptions,
  languageOptions,
  joiningPeriodOptions,
  diversityHiringOptions,
  disabilityStatusOptions,
  disabilityTypeOptions,
  jobResponseMethodOptions,
  communicationPreferenceOptions,
  distanceOptions,
  generateAgeOptions,
  jobRolesOptions,
};

