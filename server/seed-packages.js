const mongoose = require('mongoose');
const Package = require('./models/Package');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
.then(() => console.log('MongoDB Atlas connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

const seedPackages = async () => {
  try {
    // Clear existing packages
    await Package.deleteMany({});
    console.log('Cleared existing packages');

    // Create a dummy admin user ID for createdBy field
    const adminUserId = new mongoose.Types.ObjectId();

    const packages = [
      // Employer Packages
      {
        name: 'Free',
        description: 'Perfect for getting started with your hiring needs',
        price: 0,
        currency: 'INR',
        packageType: 'employer',
        period: 'days',
        periodValue: 15,
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
          { name: 'Package Validity', value: '15 Days', included: true }
        ],
        isActive: true,
        isFeatured: false,
        displayOrder: 1,
        gstApplicable: true,
        supportIncluded: false,
        supportDetails: '',
        createdBy: adminUserId
      },
      {
        name: 'Starter',
        description: 'Most popular choice for growing businesses',
        price: 999,
        currency: 'INR',
        packageType: 'employer',
        period: 'days',
        periodValue: 30,
        features: [
          { name: 'SuperUser', value: '1', included: true },
          { name: 'SubUser', value: '1', included: true },
          { name: 'Job Post', value: '4', included: true },
          { name: 'Featured Job', value: '2', included: true },
          { name: 'Job Applies Candidates', value: 'Upto 150', included: true },
          { name: 'Job Applies Expiry', value: '45 Days', included: true },
          { name: 'CV Access', value: '75', included: true },
          { name: 'Job (Invite) Invitee', value: '75', included: true },
          { name: 'Chat Support', value: 'Mon to Sat 10am - 7pm', included: true },
          { name: 'Package Validity', value: '30 Days', included: true }
        ],
        isActive: true,
        isFeatured: true,
        displayOrder: 2,
        gstApplicable: true,
        supportIncluded: true,
        supportDetails: 'Mon to Sat 10am - 7pm',
        createdBy: adminUserId
      },
      {
        name: 'Professional',
        description: 'For established companies with high hiring needs',
        price: 2499,
        currency: 'INR',
        packageType: 'employer',
        period: 'days',
        periodValue: 45,
        features: [
          { name: 'SuperUser', value: '1', included: true },
          { name: 'SubUser', value: '2', included: true },
          { name: 'Job Post', value: '10', included: true },
          { name: 'Featured Job', value: '6', included: true },
          { name: 'Job Applies Candidates', value: 'Upto 300', included: true },
          { name: 'Job Applies Expiry', value: '45 Days', included: true },
          { name: 'CV Access', value: '150', included: true },
          { name: 'Job (Invite) Invitee', value: '150', included: true },
          { name: 'Chat Support', value: 'Mon to Sat 10am - 7pm', included: true },
          { name: 'Package Validity', value: '45 Days', included: true }
        ],
        isActive: true,
        isFeatured: false,
        displayOrder: 3,
        gstApplicable: true,
        supportIncluded: true,
        supportDetails: 'Mon to Sat 10am - 7pm',
        createdBy: adminUserId
      },
      // Candidate Package
      {
        name: 'Profile Booster',
        description: 'Boost your profile visibility and get noticed by top recruiters',
        price: 499,
        currency: 'INR',
        packageType: 'candidate',
        period: 'days',
        periodValue: 30,
        features: [
          { name: 'Profile Priority', value: 'Tagged as Priority applicant', included: true },
          { name: 'Recruiter Attention', value: 'Get Upto 10X attention from recruiters', included: true },
          { name: 'Application Highlight', value: 'Highlight your application to recruiter', included: true },
          { name: 'Shortlisting', value: 'Increase your chance of shortlisting', included: true },
          { name: 'Chat Support', value: 'Mon to Sat 10am - 7pm', included: true },
          { name: 'Package Validity', value: '30 Days', included: true }
        ],
        isActive: true,
        isFeatured: true,
        displayOrder: 1,
        gstApplicable: true,
        supportIncluded: true,
        supportDetails: 'Mon to Sat 10am - 7pm',
        createdBy: adminUserId
      }
    ];

    // Insert packages
    const createdPackages = await Package.insertMany(packages);
    console.log(`Successfully created ${createdPackages.length} packages`);

    // Display created packages
    createdPackages.forEach(pkg => {
      console.log(`- ${pkg.name} (${pkg.packageType}): ₹${pkg.price} for ${pkg.periodValue} ${pkg.period}`);
    });

  } catch (error) {
    console.error('Error seeding packages:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedPackages();
