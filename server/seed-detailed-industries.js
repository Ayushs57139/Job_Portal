const mongoose = require('mongoose');
const CustomField = require('./models/CustomField');

// Detailed Industry/Sectors data with sub-industries
const detailedIndustries = {
  'Accounting / Auditing / Taxation': [
    'Accounting / Auditing',
    'Cost Accounting',
    'Domestic / International Taxation',
    'Domestic Taxation',
    'International Taxation',
    'Management Accounting',
    'Taxation',
    'Accounting Services',
    'Bookkeeping Services',
    'Tax Advisory and Compliance',
    'Financial Statement Preparation',
    'Audit Support',
    'Financial Outsourcing (FAO)',
    'GST Advisory',
    'ITR Filling'
  ],
  'Agriculture / Farming / Fishing / Forestry': [
    'Agriculture',
    'Farming',
    'Food Solutions',
    'Nutrition',
    'Crop cultivation',
    'Horticulture',
    'Animal husbandry',
    'Dairy',
    'Dairy farming',
    'Dairy Products',
    'Milk Products',
    'Forestry & Logging',
    'Subsistence Agriculture',
    'Commercial Agriculture',
    'Sustainable Agriculture',
    'Meat / Poultry',
    'Dairy Processing',
    'Fishing',
    'Aquaculture',
    'Commercial Fishing',
    'Harvesting'
  ],
  'Airlines / Aviation': [
    'Aviation',
    'Airlines',
    'Airport',
    'Ancillaries'
  ],
  'Automobiles / Auto-Components': [
    'Automobiles',
    'Automotive',
    'Automotive Parts',
    'Auto Component',
    'Tyre',
    'OEM',
    'Electric Vehicle (EV)',
    'Automobile Dealership'
  ],
  'BFSI': [
    'Banking',
    'Financial Services',
    'Insurance',
    'NBFC',
    'Asset Management & Financial Services',
    'Investment Banking / Venture Capital / Private Equity',
    'Capital Markets',
    'Housing Finance',
    'Financial Broking',
    'Life Insurance',
    'Health Insurance',
    'General Insurance',
    'Motor Insurance',
    'Home Insurance',
    'Travel Insurance',
    'Property Insurance',
    'Liability Insurance'
  ],
  'Beauty / Fitness / Wellness': [
    'Wellness',
    'Beauty and Wellness',
    'Beauty Products',
    'Cosmetics',
    'Fitness',
    'Sports',
    'Yoga',
    'Fitness / Wellness',
    'Beauty / Wellness / Personal Care'
  ],
  'Building Materials': [
    'RMC',
    'Ready Mix Concrete',
    'Cement',
    'Ceramics',
    'Concrete',
    'Sanitary Fittings',
    'Sanitary Ware'
  ],
  'Chemicals / Pesticides': [
    'Chemicals',
    'Fertilizers',
    'Pesticides',
    'Agro Chemicals',
    'Paints',
    'Petrochemical',
    'Rubber',
    'Plastics',
    'Chemical Manufacturing',
    'Adhesive',
    'Sealants'
  ],
  'Design': [
    'Animation',
    'Graphic Design',
    'Printing',
    'Web Design',
    'UI/UX',
    'Industrial Design',
    'Interior Design',
    'Interior Solutions',
    'Home Interior',
    'Laminates'
  ],
  'eCommerce / eStore': [
    'eCommerce',
    'Online Store',
    'B2B eCommerce',
    'B2C eCommerce',
    'C2C eCommerce',
    'D2C eCommerce',
    'Grocery App',
    'Food Delivery App',
    'Shopping App',
    'Retail App',
    'Fashion / Apparel App',
    'UPI Payment App',
    'Loan App',
    'Logistics App',
    'Travel / Tourism App',
    'Media/Entertainment App',
    'News App',
    'Food / Beverage App',
    'Hospitality App',
    'Doctor App',
    'Pharma App',
    'Healthcare App',
    'Fitness / Wellness App',
    'Real Estate App',
    'Automotive App',
    'Bike / Car Rental App',
    'Consumer Services App',
    'IT Services App',
    'Education / EdTech App',
    'Job Portal / Job Search App',
    'Furniture App',
    'Architecture / Planning App',
    'Social Media App',
    'Dating App',
    'Matrimony App',
    'SAAS App'
  ],
  'Education / EdTech': [
    'E-Learning',
    'EdTech',
    'Teaching',
    'Schools',
    'University / College',
    'Training institutes',
    'Professional Training and Coaching',
    'Technical and Vocational Training',
    'Training'
  ],
  'Eye Care / Eyewear': [
    'Eye Care',
    'Eye Care Products',
    'Sunglasses',
    'Eyeglasses',
    'Contact Lenses',
    'Frames'
  ],
  'Emerging Technology (ET)': [
    'Biotechnology',
    'Electronic Components',
    'Semiconductors',
    'Robotics / Automation',
    'AI / ML',
    'Blockchain',
    'Cloud Technology',
    'loT',
    'Agri-tech',
    'Cybersecurity',
    'Drones / Robotics',
    'Nanotechnology',
    'AR / VR'
  ],
  'FMCG': [
    'Beverages',
    'Consumer Health Products',
    'Consumer Care Products',
    'Beverages / Brewery / Distillery',
    'Packaged Foods',
    'Personal Care Items',
    'Household Products',
    'Over-the-Counter Medicines',
    'Health / Wellness Products',
    'Tobacco - FMCG'
  ],
  'FMCD': [
    'Appliances',
    'Home Appliances',
    'Large Appliances',
    'Consumer Electronics / Appliances',
    'Home / Kitchen Appliances'
  ],
  'FMEG': [
    'Home Automation',
    'Geysers',
    'Fan',
    'Exhaust Fans',
    'Conduit Pipes',
    'Pumps',
    'Electric Motor',
    'Electrical Products',
    'Switches / Sockets',
    'LED Lights',
    'Halogen Lights',
    'Wire / Cable',
    'Electrical Parts',
    'Electrical Equipment / Parts'
  ],
  'FinTech / ePayments': [
    'ePayment Service',
    'Card Swipe Machine',
    'POS Machine',
    'UPI Payment Wallet',
    'Payment Gateway',
    'FASTag'
  ],
  'Government / Public Administration': [
    'Indian Railways',
    'Marine Services',
    'Metro Rail',
    'Government Tender',
    'Government Tendering',
    'Tender Bidding',
    'Bidding',
    'Tender Analysis',
    'Public Relations (PR)',
    'Government Projects',
    'Government Affairs',
    'Current Affairs',
    'Civil Services',
    'Public Administration',
    'Defense Services',
    'Public Health',
    'Urban Planning',
    'Space Program',
    'Municipal services'
  ],
  'Health Care / Hospitals / Lifescience': [
    'Healthcare',
    'Ayurveda',
    'Diagnostics',
    'Hospitals',
    'Life Sciences',
    'Medical Equipment',
    'Medical Transcription',
    'Pharmaceutical',
    'Mental health',
    'Telemedicine',
    'Biotech',
    'Medical Services / Hospital',
    'Clinical Research / Contract Research',
    'Pharmaceutical / Life Sciences',
    'Clinics, Chemist / Pharmacies',
    'Health Tech',
    'Mental Health Care',
    'Veterinary'
  ],
  'Heavy Machinery / Equipment': [
    'Heavy Equipment',
    'Heavy Machinery',
    'Heavy Vehicle',
    'Wheel Loaders',
    'Road Compactors',
    'Excavators'
  ],
  'Hospitality / Travel / Tourism': [
    'Hospitality',
    'QSR- Quick Service Restaurant',
    'HoReCa',
    'Food Services',
    'Hotel Kitchen',
    'Restaurant',
    'Tourism',
    'Travel',
    'Food / Beverage',
    'Travel agencies',
    'Hotels / Restaurants',
    'Travel / Tourism',
    'Events / Live Entertainment',
    'Cruise Lines and Passenger Transportation',
    'Travel Agencies / Tour Operators',
    'Bed-and-Breakfasts / Hostels / Homestays',
    'Catering',
    'Hotels',
    'Bars / Pubs / Nightclubs',
    'Fast-Food Joints (QSR)',
    'Restaurants',
    'Resorts',
    'Clubs',
    'Cloud Kitchen'
  ],
  'HR / Recruitment / Staffing': [
    'Human Resource',
    'HR Operations',
    'HR Recruitment',
    'Recruitment',
    'Manpower Hiring',
    'Non IT Recruitment',
    'IT Recruitment',
    'Payroll / Compliances',
    'Recruitment / RPO',
    'Sourcing',
    'Staffing',
    'Employee Relations',
    'Training / Development',
    'Temp Recruitment',
    'Perm Recruitment',
    'Payroll Processing',
    'Recruitment / Staffing',
    'HR Tech',
    'Manpower Consultants'
  ],
  'ITES / BPO / BPM': [
    'ITES',
    'Analytics',
    'BPO',
    'Business Process Outsourcing (BPO)',
    'Chat Process',
    'Customer Support',
    'Domestic BPO',
    'Game Process Outsourcing (GPO)',
    'In Bound',
    'International BPO',
    'Knowledge Process Outsourcing (KPO)',
    'KPO',
    'Legal Process Outsourcing (LPO)',
    'Out Bound',
    'Research',
    'Telesales',
    'Voice Process',
    'Call Centre',
    'Outsourcing'
  ],
  'Information Technology (IT)': [
    'Internet',
    'IT Support',
    'IT Hardware',
    'IT Networking',
    'IT Software',
    'Laptop / Computer',
    'Software Sales',
    'GIS (Geographic Information System)',
    'GPS Devices',
    'Data analytics',
    'Cloud services',
    'Software Development',
    'Android Development',
    'iOS Development',
    'Web Development',
    'Windows Development',
    'Apps Development',
    'Hardware / Networking',
    'IT Services / Consulting',
    'Software Product',
    'Computer / Network Security'
  ],
  'Infrastructure / Construction': [
    'Infrastructure',
    'Structural Engineering',
    'Architecture',
    'Construction',
    'Project Management',
    'Real Estate Development',
    'Architecture / Planning',
    'Property Management',
    'Property Sales',
    'Highway / Street / Construction',
    'Bridge / Tunnel / Construction',
    'Railway Station Construction',
    'Railway Line Construction'
  ],
  'Legal / Regulatory': [
    'Dispute Solutions',
    'Debt Resolution',
    'Arbitration Consultancy',
    'Property Disputes',
    'Mediation Services',
    'Loan Settlement Services',
    'Recovery Calling',
    'Loan Recovery',
    'Lawyers',
    'Legal Advisors',
    'Paralegals',
    'Compliance Officers',
    'Corporate Law',
    'Law firms',
    'Compliance',
    'Law Enforcement',
    'Law Firm',
    'Legal',
    'Regulatory Compliance'
  ],
  'Laboratory Testing Services': [
    'Non-Destructive Testing',
    'Industrial Radiography Test',
    'X-ray',
    'Gamma Ray',
    'Ultrasonic Test',
    'Magnetic Particle Test',
    'Dye Penetrant Test',
    'Heat Treatment',
    'Resistance heating',
    'Induction heating',
    'Training / Certification',
    'ISNT',
    'ASNT',
    'Advanced NDT Systems',
    'Acoustic emission testing',
    'Field measurement',
    'Low voltage inducting heating',
    'Flange face inspection',
    'Hydrogen induced crack detection',
    'Tube inspection',
    'Vacuum box testing'
  ],
  'Logistics / Transportation': [
    'Logistics',
    'Cargo',
    'Courier',
    'Food Delivery',
    'Freight',
    'General Trading',
    'Grocery / Hyperlocal Delivery',
    'Import / Export',
    'Milk Delivery',
    'Milk Supply',
    'Movers',
    'Packers',
    'Purchase',
    'Transportation',
    'Warehouse Operations',
    'Supply Chain',
    'Logistics Management',
    'Warehousing',
    'Fleet Management',
    'Car, Bike / Taxi Services',
    'Urban Transport',
    'Railways / Roadways',
    'Logistics Tech',
    'Courier / Logistics',
    '3rd Party Logistics',
    'Cold Storage'
  ],
  'Manufacturing / Production': [
    'Automotive',
    'Electronics',
    'Pharmaceuticals',
    'Textiles / Apparel',
    'Food & Beverage',
    'Chemicals',
    'Aerospace',
    'Industrial Products',
    'Building Material',
    'Packaging / Containers',
    '3D Printing',
    'Defence / Aerospace',
    'Electronic Manufacturing Services (EMS)',
    'Electronics Manufacturing',
    'Machine Tools',
    'Ceramic Manufacturing',
    'Construction Equipment',
    'Glass Manufacturing',
    'Industrial Automation',
    'Manufacturing',
    'Pulp / Paper',
    'Cement Manufacturing',
    'Electrical Equipment',
    'Electronic Components',
    'Semiconductors',
    'Industrial Equipment / Machinery',
    'Engineering Services',
    'Metal Fabrication'
  ],
  'Media / Entertainment / Advertising': [
    'Media / Entertainment',
    'Advertisement',
    'Advertising',
    'Entertainment',
    'Events',
    'Media',
    'News Channel',
    'News Paper',
    'Publishing',
    'Social Media',
    'Acting',
    'TV Shows',
    'Movies',
    'Journalism',
    'Film / Television',
    'Radio / Broadcasting',
    'TV / Radio',
    'Animation / Multimedia',
    'Film production',
    'OTT',
    'Advertising / Marketing',
    'Public Relations',
    'Digital Marketing',
    'Printing / Publishing',
    'Content Development / Language',
    'Animation / VFX',
    'Gaming',
    'Film / Music / Entertainment',
    'Sports / Leisure / Recreation',
    'Broadcast Media',
    'Sports Teams and Clubs',
    'Social media marketing',
    'Email marketing'
  ],
  'Metals / Mining / Quarrying': [
    'Coal',
    'Metals',
    'Minerals',
    'Fossil Fuels',
    'Industrial Minerals',
    'Construction Materials',
    'Metallic Ores',
    'Gemstones',
    'Copper',
    'Iron',
    'Steel',
    'Zinc'
  ],
  'NGO / Social Services': [
    'Non Profit Organizations (NGOs)',
    'Charitable foundations',
    'Charitable Trust',
    'International NGOs',
    'National NGOs',
    'Environmental NGOs',
    'Developmental NGOs',
    'Humanitarian NGOs',
    'Human Rights NGOs',
    'Education NGOs',
    'Charity',
    'Industry Associations',
    'Company Associations'
  ],
  'Oil / Gas': [
    'Oil',
    'Gas',
    'Petroleum',
    'Petrochemicals',
    'HVAC',
    'Heat Ventilation Air Conditioning (HVAC)'
  ],
  'Power / Energy': [
    'Nuclear power',
    'Hydrocarbon',
    'Renewable Energy',
    'Solar power',
    'Wind energy',
    'Hydro Power',
    'Geothermal',
    'Commercial Electricity / Power',
    'Residential Electricity / Power',
    'Power Supply'
  ],
  'Professional Services / Consulting': [
    'Consumer services',
    'Business services',
    'Public services',
    'Business Consulting',
    'Management Consulting',
    'IT Services',
    'Advisory Services',
    'Background Verification',
    'Broking Services',
    'Collection',
    'Consulting',
    'Data Entry',
    'Environmental Service',
    'Facility Management',
    'Matrimonial Services',
    'Procurement',
    'Recovery',
    'Social Services',
    'Stock Maintaining',
    'Verification',
    'Liaison',
    'MIS',
    'Law Enforcement / Security Services',
    'Architecture / Interior Design'
  ],
  'Real Estate / Facility Management': [
    'Facility Management Services',
    'Co Working / Asset Management',
    'Real Estate',
    'Residential Real Estate',
    'Commercial Real Estate',
    'Land Development',
    'Real Estate Investment Trusts (REITs)',
    'Real Estate Funds'
  ],
  'Research / Development (R&D)': [
    'Scientific research',
    'Technology innovation',
    'Engineering R&D',
    'Electronic R&D',
    'Materials Science R&D',
    'R&D Consulting',
    'Experimentation Research',
    'Pre-Experimental Research',
    'True Experimental Research',
    'Quasi-Experimental Research'
  ],
  'Retail / Wholesale / Consumer Goods': [
    'Products',
    'Food Processing',
    'Sugar - Food Processing',
    'Furniture & Furnishing',
    'Gold / Gems / Jewellery',
    'Food / Grocery Retail',
    'Footwear',
    'Toys and Games',
    'Books',
    'Alternative Medicine',
    'Laundry and Drycleaning Services',
    'Religious Institutions',
    'Business Supplies / Equipment',
    'Retail',
    'Retail Sales',
    'Retail Operations',
    'Store Operations',
    'Retail Management',
    'Merchandising',
    'Supply Chain Management',
    'Customer Service',
    'Wholesale Store',
    'Wholesale Sales',
    'Wholesale Service',
    'Wholesale Operations',
    'Wholesale Shop',
    'Wholesale Products'
  ],
  'Sales / Marketing': [
    'Sales',
    'Marketing',
    'Field Sales',
    'B2B',
    'B2C',
    'D2D',
    'D2C',
    'Network Marketing',
    'Direct Marketing',
    'Merchant Onboarding',
    'Market Research'
  ],
  'Security / Defense': [
    'Armed forces',
    'Private security',
    'Security Services',
    'Security System',
    'Home / Business Alarm Security'
  ],
  'Shipping / Ports': [
    'Shipping / Freight',
    'Shipbuilding',
    'Shipping',
    'Maritime Transport',
    'Global Trade',
    'Deep Water Ports',
    'Container Ports',
    'Bulk Cargo Ports'
  ],
  'Startups / Unicorn': [
    'Entrepreneurship',
    'Startup',
    'Unicorn',
    'Services Startup',
    'SAAS Startup',
    'eCommerce Startup',
    'Manufacturing Startup',
    'Pharma Startup',
    'Defence Startup'
  ],
  'Telecom / ISP': [
    'Telecom',
    'Broadband',
    'D2H',
    'Mobile / Headset',
    'Landline Phone',
    'Mobile Accessories',
    'Network Solutions',
    'Network Distribution',
    'WiFi',
    'Network Engineering',
    'Telecom Sales',
    'Field Operations',
    'Telecom Infrastructure',
    'Telecommunications',
    'Internet services',
    'Mobile networks'
  ],
  'Textile / Handicraft / Fashion': [
    'Textiles',
    'Fashion / Apparels',
    'Garments',
    'Fabrics',
    'Leather',
    'Textile / Apparel',
    'Yarn / Fabric',
    'Fashion',
    'Handicraft',
    'Home Textile',
    'Technical Textile'
  ],
  'Tobacco Products': [
    'Smokeless Tobacco',
    'Dissolvable Tobacco',
    'Pan Masala',
    'Tobacco',
    'Cigarettes',
    'Cigars'
  ],
  'UAV / UAS': [
    'UAV',
    'UAS',
    'Drone',
    'Drone Pilot',
    'Drone Operator',
    'Drone Flying',
    'Drone Engineering',
    'Drone Spraying',
    'Agriculture Drone',
    'Army Drone',
    'Defence Drone',
    'Fighter Drone',
    'Robotic Drone',
    'Surveillance Drone',
    'Videography Drone',
    'Camera Drone'
  ],
  'US IT': [
    'US IT Bench Sales',
    'US IT Recruiter',
    'US IT Sales'
  ],
  'Utility Services': [
    'Water Treatment',
    'Water supply',
    'Electricity distribution',
    'Waste management',
    'Fire',
    'Safety',
    'Fire / Safety'
  ],
  'Other Industry': []
};

// Function to create detailed industries field
async function createDetailedIndustriesField() {
  try {
    console.log('Starting to seed detailed industries data...');

    // Create a dummy admin user ID for createdBy field
    const adminUserId = new mongoose.Types.ObjectId();

    // Convert detailed industries to options format
    const industryOptions = Object.keys(detailedIndustries).map((industry, index) => ({
      value: industry,
      label: industry,
      order: index,
      subIndustries: detailedIndustries[industry]
    }));

    // Update or create the detailed industries field
    await CustomField.findOneAndUpdate(
      { fieldId: 'detailedIndustries' },
      {
        fieldId: 'detailedIndustries',
        name: 'detailedIndustries',
        label: 'Industry / Sectors',
        fieldType: 'multiselect',
        styling: { 
          placeholder: 'Select Existing Suggestion / Add New Options By Admin Only' 
        },
        validation: { 
          required: false, 
          max: 5 
        },
        options: industryOptions,
        placement: { 
          section: 'jobseeker_profile', 
          order: 17, 
          group: 'experience' 
        },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    // Create sub-industries field
    await CustomField.findOneAndUpdate(
      { fieldId: 'subIndustries' },
      {
        fieldId: 'subIndustries',
        name: 'subIndustries',
        label: 'Sub Industry / Sectors',
        fieldType: 'multiselect',
        styling: { 
          placeholder: 'Select Existing Suggestion / Add New Options By Admin Only' 
        },
        validation: { 
          required: false, 
          max: 5 
        },
        options: [], // Will be populated dynamically based on main industry selection
        placement: { 
          section: 'jobseeker_profile', 
          order: 18, 
          group: 'experience' 
        },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    console.log('Detailed industries data seeded successfully!');
    console.log(`Total main industries: ${Object.keys(detailedIndustries).length}`);
    
    // Count total sub-industries
    const totalSubIndustries = Object.values(detailedIndustries).reduce((total, subIndustries) => {
      return total + subIndustries.length;
    }, 0);
    console.log(`Total sub-industries: ${totalSubIndustries}`);

  } catch (error) {
    console.error('Error seeding detailed industries data:', error);
  }
}

// Run the seeding function
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala')
  .then(() => {
    console.log('Connected to MongoDB');
    return createDetailedIndustriesField();
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

module.exports = { createDetailedIndustriesField, detailedIndustries };
