const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/freejobwala';

const sampleJobSeekers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '9876543210',
    password: 'password123',
    userType: 'jobseeker',
    isVerified: true
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '9876543211',
    password: 'password123',
    userType: 'jobseeker',
    isVerified: true
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    phone: '9876543212',
    password: 'password123',
    userType: 'jobseeker',
    isVerified: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@example.com',
    phone: '9876543213',
    password: 'password123',
    userType: 'jobseeker',
    isVerified: true
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    phone: '9876543214',
    password: 'password123',
    userType: 'jobseeker',
    isVerified: true
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    phone: '9876543215',
    password: 'password123',
    userType: 'jobseeker',
    isVerified: true
  },
  {
    firstName: 'Robert',
    lastName: 'Miller',
    email: 'robert.miller@example.com',
    phone: '9876543216',
    password: 'password123',
    userType: 'jobseeker',
    isVerified: true
  },
  {
    firstName: 'Lisa',
    lastName: 'Wilson',
    email: 'lisa.wilson@example.com',
    phone: '9876543217',
    password: 'password123',
    userType: 'jobseeker',
    isVerified: true
  },
  {
    firstName: 'James',
    lastName: 'Moore',
    email: 'james.moore@example.com',
    phone: '9876543218',
    password: 'password123',
    userType: 'jobseeker',
    isVerified: true
  },
  {
    firstName: 'Maria',
    lastName: 'Taylor',
    email: 'maria.taylor@example.com',
    phone: '9876543219',
    password: 'password123',
    userType: 'jobseeker',
    isVerified: true
  }
];

async function seedJobSeekers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check existing job seekers
    const existingCount = await User.countDocuments({ userType: 'jobseeker' });
    console.log(`\n📊 Existing job seekers: ${existingCount}`);

    // Hash passwords and create users
    console.log('\n🌱 Seeding job seekers...');
    let created = 0;
    let skipped = 0;

    for (const jobSeeker of sampleJobSeekers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: jobSeeker.email });
      
      if (existingUser) {
        console.log(`⏭️  Skipped: ${jobSeeker.email} (already exists)`);
        skipped++;
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(jobSeeker.password, salt);

      // Create user
      const user = new User({
        ...jobSeeker,
        password: hashedPassword
      });

      await user.save();
      console.log(`✅ Created: ${jobSeeker.firstName} ${jobSeeker.lastName} (${jobSeeker.email})`);
      created++;
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📊 Total job seekers now: ${existingCount + created}`);

    console.log('\n💡 You can now use these credentials to test:');
    console.log('   Email: john.doe@example.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the seeder
seedJobSeekers();
