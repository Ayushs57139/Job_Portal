const mongoose = require('mongoose');
const CustomField = require('./models/CustomField');

// Certification courses data
const certifications = [
  'Advanced Excel Certification',
  'Tally ERP 9 / TallyPrime Certification',
  'GST Practitioner Certification',
  'Certified Financial Planner (CFP) - Introductory',
  'Digital Marketing Certification',
  'SEO Specialist Certification',
  'Social Media Marketing Certification',
  'Content Writing Certification',
  'Google Ads Certification',
  'HubSpot Inbound Marketing Certification',
  'Certificate in Public Relations',
  'Project Management Professional (PMP) Prep',
  'Prince2 Foundation/Practitioner',
  'Agile / Scrum Master Certification',
  'SAP FICO Certification (Introductory)',
  'SAP MM/SD Certification',
  'Cloud Fundamentals (AWS / Azure / GCP)',
  'AWS Certified Solutions Architect - Associate (Prep)',
  'Microsoft Azure Administrator (AZ-104) Prep',
  'Google Cloud Associate Engineer Prep',
  'Data Science & Machine Learning Certification',
  'Business Analytics Certification',
  'Python Programming Certification',
  'R Programming Certification',
  'Tableau Desktop Specialist',
  'Power BI Certification',
  'Big Data Hadoop Certification',
  'Artificial Intelligence Certification',
  'Deep Learning Specialization',
  'Cybersecurity Foundation Certification',
  'CEH - Certified Ethical Hacker Prep',
  'CompTIA Security+ Prep',
  'Network+ / CCNA Prep',
  'Blockchain Basics & Development',
  'Full Stack Web Development Certification',
  'Front-End Development (React / Angular)',
  'Back-End Development (Node.js / Django)',
  'Mobile App Development (React Native / Flutter)',
  'Android Development Certification',
  'iOS App Development (Swift) Certification',
  'UI/UX Design Certification',
  'Graphic Design Certification (Photoshop, Illustrator)',
  'Animation & VFX Certification',
  'Video Editing (Premiere / Final Cut) Certification',
  'Photography Certification',
  'Human Resource Management Certification',
  'Payroll Management Certification',
  'Labour Laws & Industrial Relations Certification',
  'Supply Chain & Logistics Certification',
  'Lean Six Sigma (Green Belt)',
  'Lean Six Sigma (Black Belt)',
  'Inventory Management Certification',
  'Export-Import (EXIM) Documentation Certification',
  'Foreign Trade Policy & Procedures',
  'Retail Management Certification',
  'E-commerce Management Certification',
  'Entrepreneurship & Startup Certification',
  'Business Communication & Soft Skills',
  'Personality Development Certification',
  'Resume Writing & Interview Skills',
  'Certificate in Teaching (CTET Preparation)',
  'TESOL / TEFL Certification',
  'Nursery Teacher Training (NTT)',
  'Special Education Certification',
  'Phlebotomy Technician Certificate',
  'Medical Lab Technician (MLT) Certificate',
  'Medical Coding & Billing Certification',
  'Basic Life Support (BLS) / CPR Certification',
  'Advanced Cardiac Life Support (ACLS)',
  'Dietician & Nutrition Certification',
  'Yoga Instructor Certification (IYC / RYT)',
  'Fitness Trainer Certification (ACE / Local)',
  'Food Safety & Hygiene (FSSAI) Certification',
  'HACCP Certification',
  'Catering & Hospitality Certification',
  'Hotel Management Short Certificate',
  'Airport Ground Staff & Cabin Crew Training',
  'Aviation Security Certification',
  'Fresher Course in Automobile Service',
  'AutoCAD & Drafting Certification',
  'Revit Architecture Certification',
  'GIS & Remote Sensing Certification',
  'Electrical Safety & High Tension (HT) Certification',
  'PLC & SCADA Certification',
  'Embedded Systems Certification',
  'Industrial Robotics Certification',
  'Instrumentation Technician Certificate',
  'Welding Technology Certification',
  'HVAC Technician Certification',
  'Beauty & Cosmetology Certification',
  'Makeup Artist Certification',
  'Sculpting & Pottery Certification',
  'Interior Design Certificate',
  'Certificate in Fashion Designing',
  'Jewellery Designing Certification',
  'Event Management Certification',
  'Wedding Planner Certification',
  'Retail Buying & Merchandising Certification',
  'Certificate in Risk Management',
  'Insurance Advisor Certification (IRDAI) Prep',
  'Mutual Fund Distributor Certification (AMFI)',
  'Credit Management Certification',
  'Banking & Finance Certification',
  'NISM Certifications (various)',
  'Certificate in Forensic Accounting',
  'Clinical Research Certification',
  'Pharmacovigilance Certification',
  'Good Clinical Practice (GCP) Certification',
  'Biostatistics Certification',
  'Patent Drafting & IP Rights Certification',
  'Paralegal Certification',
  'Corporate Law Certificate',
  'Laboratory Information Management Systems (LIMS) Certification',
  'Clinical Data Management Certification',
  'Sustainable Development & Renewable Energy Certification',
  'Solar Technician Certification',
  'Wind Turbine Technician Certification',
  'Environmental Impact Assessment Certification',
  'Occupational Health & Safety (OHS) / NEBOSH',
  'Fire Safety & Fire Fighting Certification',
  'Quality Management (ISO 9001) Internal Auditor',
  'ISO Lead Auditor Courses (various ISO)',
  'Certificate in Entrepreneurship Development (CED)',
  'Crowdfunding & Fundraising Certification',
  'Certificate in Corporate Governance',
  'Certificate in CSR and Sustainability',
  'Certificate in Gerontology & Elderly Care',
  'Certificate in Child Psychology & Counseling',
  'Certification in Life Coaching',
  'Nutraceuticals & Food Supplement Certification',
  'Supply Chain Finance Certification',
  'Certificate in Energy Auditing',
  'Solar PV Design & Installation',
  'Certificate in Agricultural Extension',
  'Organic Farming Certification',
  'Certificate in Horticulture',
  'Masonry & Construction Skill Certification',
  'Carpentry & Woodwork Certification',
  'Plumbing & Sanitation Certification',
  'Certificate in Plumbing & Pipe Fitting',
  'Certificate in Solar Home Lighting Systems',
  'Certificate in Digital Forensics',
  'Forensic Psychology Certification',
  'Certificate in Child Care & Early Childhood Development',
  'Certificate in Gerontological Social Work',
  'Certificate in Disaster Management',
  'Certificate in Urban Planning & Smart Cities',
  'Certificate in Media & Journalism',
  'Radio Jockey / Voice Modulation Course',
  'Certificate in Acting & Theatre',
  'Certificate in Translation & Interpretation',
  'Foreign Language Certification (French/Spanish/German/Chinese)',
  'Certificate in Corporate Training',
  'Coaching & Mentoring Certification',
  'Certificate in Negotiation & Sales',
  'Cold Calling & Telecalling Certification',
  'Certificate in Retail Analytics',
  'Certificate in Sports Management',
  'Certificate in Cricket Coaching',
  'Certificate in Music Production & Sound Engineering'
];

// Function to create certifications field
async function createCertificationsField() {
  try {
    console.log('Starting to seed certifications data...');

    // Create a dummy admin user ID for createdBy field
    const adminUserId = new mongoose.Types.ObjectId();

    // Convert certifications array to options format
    const certificationOptions = certifications.map((certification, index) => ({
      value: certification,
      label: certification,
      order: index
    }));

    // Update or create the certifications field
    await CustomField.findOneAndUpdate(
      { fieldId: 'extraCertifications' },
      {
        fieldId: 'extraCertifications',
        name: 'extraCertifications',
        label: 'Extra Certification Course Name',
        fieldType: 'multiselect',
        styling: { 
          placeholder: 'Extra Certification Course Name (Show 10 to 12 Suggestion Also)' 
        },
        validation: { 
          required: false, 
          max: 10 
        },
        options: certificationOptions,
        placement: { 
          section: 'jobseeker_profile', 
          order: 19, 
          group: 'experience' 
        },
        status: 'active',
        createdBy: adminUserId
      },
      { upsert: true, new: true }
    );

    console.log('Certifications data seeded successfully!');
    console.log(`Total certifications added: ${certifications.length}`);

  } catch (error) {
    console.error('Error seeding certifications data:', error);
  }
}

// Run the seeding function
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala')
  .then(() => {
    console.log('Connected to MongoDB');
    return createCertificationsField();
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

module.exports = { createCertificationsField, certifications };
