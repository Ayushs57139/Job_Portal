const mongoose = require('mongoose');
const Package = require('./models/Package');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

const packages = [
  // Employer Package - Free
  {
    name: 'Free',
    description: 'Perfect for getting started with basic recruitment features',
    price: 0,
    currency: 'INR',
    packageType: 'employer',
    period: 'days',
    periodValue: 15,
    isFeatured: false,
    displayOrder: 1,
    gstApplicable: false,
    supportIncluded: false,
    supportDetails: '',
    features: [
      { name: 'SuperUser', value: '1', included: true },
      { name: 'SubUser', value: '0', included: true },
      { name: 'Job Post', value: '2', included: true },
      { name: 'Featured Job', value: '0', included: true },
      { name: 'Job Applies Candidates', value: 'Upto 60', included: true },
      { name: 'Job Applies Expiry', value: '30 Days', included: true },
      { name: 'CV Access', value: '10', included: true },
      { name: 'Job (Invite) Invitee', value: '30', included: true },
      { name: 'Chat Support', value: 'No', included: false },
      { name: 'Package Validity', value: '15 Days', included: true },
    ]
  },
  // Employer Package - Starter (₹999)
  {
    name: 'Starter',
    description: 'Ideal for small businesses starting their hiring journey',
    price: 999,
    currency: 'INR',
    packageType: 'employer',
    period: 'days',
    periodValue: 30,
    isFeatured: true,
    displayOrder: 2,
    gstApplicable: true,
    supportIncluded: true,
    supportDetails: 'Mon to Sat 10am - 7pm Chat Support',
    features: [
      { name: 'SuperUser', value: '1', included: true },
      { name: 'SubUser', value: '1', included: true },
      { name: 'Job Post', value: '4', included: true },
      { name: 'Featured Job', value: '2', included: true },
      { name: 'Job Applies Candidates', value: 'Upto 150', included: true },
      { name: 'Job Applies Expiry', value: '45 Days', included: true },
      { name: 'CV Access', value: '75', included: true },
      { name: 'Job (Invite) Invitee', value: '75', included: true },
      { name: 'Chat Support', value: 'Yes', included: true },
      { name: 'Package Validity', value: '30 Days', included: true },
    ]
  },
  // Employer Package - Professional (₹2499)
  {
    name: 'Professional',
    description: 'Advanced features for growing businesses and consultancies',
    price: 2499,
    currency: 'INR',
    packageType: 'employer',
    period: 'days',
    periodValue: 45,
    isFeatured: true,
    displayOrder: 3,
    gstApplicable: true,
    supportIncluded: true,
    supportDetails: 'Mon to Sat 10am - 7pm Chat Support',
    features: [
      { name: 'SuperUser', value: '1', included: true },
      { name: 'SubUser', value: '2', included: true },
      { name: 'Job Post', value: '10', included: true },
      { name: 'Featured Job', value: '6', included: true },
      { name: 'Job Applies Candidates', value: 'Upto 300', included: true },
      { name: 'Job Applies Expiry', value: '45 Days', included: true },
      { name: 'CV Access', value: '150', included: true },
      { name: 'Job (Invite) Invitee', value: '150', included: true },
      { name: 'Chat Support', value: 'Yes', included: true },
      { name: 'Package Validity', value: '45 Days', included: true },
    ]
  },
  // Candidate Package - Profile Booster
  {
    name: 'Profile Booster',
    description: 'Boost your profile visibility and get noticed by top recruiters',
    price: 499,
    currency: 'INR',
    packageType: 'candidate',
    period: 'days',
    periodValue: 30,
    isFeatured: true,
    displayOrder: 1,
    gstApplicable: true,
    supportIncluded: true,
    supportDetails: 'Mon to Sat 10am - 7pm Chat Support',
    features: [
      { name: 'Profile is tagged as Priority applicant', value: 'Yes', included: true },
      { name: 'Get Upto 10X attention from recruiters', value: 'Yes', included: true },
      { name: 'Highlight your application to recruiter', value: 'Yes', included: true },
      { name: 'Increase your chance of shortlisting', value: 'Yes', included: true },
      { name: 'Chat Support', value: 'Yes', included: true },
      { name: 'Package Validity', value: '30 Days', included: true },
    ]
  },
];

async function seedPackages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin user to use as createdBy
    const adminUser = await User.findOne({ 
      userType: { $in: ['admin', 'superadmin'] } 
    });

    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('Seeding packages...');
    
    for (const pkg of packages) {
      // Check if package already exists
      const existing = await Package.findOne({ 
        name: pkg.name,
        packageType: pkg.packageType
      });
      
      if (!existing) {
        await Package.create({
          ...pkg,
          createdBy: adminUser._id
        });
        console.log(`✅ Created package: ${pkg.name} (${pkg.packageType})`);
      } else {
        console.log(`⏭️  Package "${pkg.name}" already exists, skipping...`);
      }
    }

    console.log('\n✅ Successfully seeded packages');
    
    // Print summary
    const totalPackages = await Package.countDocuments();
    const employerCount = await Package.countDocuments({ packageType: 'employer' });
    const candidateCount = await Package.countDocuments({ packageType: 'candidate' });
    
    console.log('\n📊 Package Summary:');
    console.log('==================');
    console.log(`Total Packages: ${totalPackages}`);
    console.log(`Employer Packages: ${employerCount}`);
    console.log(`Candidate Packages: ${candidateCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding packages:', error);
    process.exit(1);
  }
}

seedPackages();

