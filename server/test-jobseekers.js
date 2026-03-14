const mongoose = require('mongoose');
const User = require('./models/User');
const JobInvitation = require('./models/JobInvitation');
const Job = require('./models/Job');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/freejobwala';

async function testJobSeekers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    console.log('📍 Database:', mongoose.connection.name);

    // Count all users
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);

    // Count job seekers
    const jobSeekers = await User.countDocuments({ userType: 'jobseeker' });
    console.log(`👥 Job seekers: ${jobSeekers}`);

    // Count other user types
    const employers = await User.countDocuments({ userType: 'employer' });
    const admins = await User.countDocuments({ userType: 'admin' });
    const superadmins = await User.countDocuments({ userType: 'superadmin' });
    console.log(`🏢 Employers: ${employers}`);
    console.log(`👨‍💼 Admins: ${admins}`);
    console.log(`👑 Super Admins: ${superadmins}`);

    // Get sample job seekers
    if (jobSeekers > 0) {
      console.log('\n📋 Sample job seekers:');
      const sampleJobSeekers = await User.find({ userType: 'jobseeker' })
        .select('firstName lastName email phone isVerified')
        .limit(5)
        .lean();
      
      sampleJobSeekers.forEach((user, index) => {
        const verified = user.isVerified ? '✅' : '❌';
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email} ${verified}`);
      });
    } else {
      console.log('\n⚠️  NO JOB SEEKERS FOUND IN THE DATABASE!');
      console.log('\n💡 To fix this, run:');
      console.log('   node seed-jobseekers.js');
      console.log('\nThis will create 10 test job seekers with:');
      console.log('   • userType: "jobseeker"');
      console.log('   • isVerified: true');
      console.log('   • Password: password123');
    }

    // Check for users without userType
    const usersWithoutType = await User.countDocuments({ 
      $or: [
        { userType: { $exists: false } },
        { userType: null },
        { userType: '' }
      ]
    });
    
    if (usersWithoutType > 0) {
      console.log(`\n⚠️  Found ${usersWithoutType} users without userType field`);
      console.log('These users need to have their userType set to "jobseeker", "employer", or "admin"');
    }

    // Check jobs and invitations
    const totalJobs = await Job.countDocuments();
    const totalInvitations = await JobInvitation.countDocuments();
    
    console.log(`\n💼 Total jobs: ${totalJobs}`);
    console.log(`📧 Total invitations: ${totalInvitations}`);

    if (totalJobs > 0 && jobSeekers > 0) {
      // Get a sample job
      const sampleJob = await Job.findOne().select('title _id').lean();
      if (sampleJob) {
        const invitedToSampleJob = await JobInvitation.countDocuments({ job: sampleJob._id });
        const availableForSampleJob = jobSeekers - invitedToSampleJob;
        
        console.log(`\n📝 Sample Job: "${sampleJob.title}"`);
        console.log(`   • Already invited: ${invitedToSampleJob}`);
        console.log(`   • Available to invite: ${availableForSampleJob}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('SUMMARY');
    console.log('='.repeat(50));
    
    if (jobSeekers === 0) {
      console.log('❌ NO JOB SEEKERS - Run: node seed-jobseekers.js');
    } else if (jobSeekers < 10) {
      console.log(`⚠️  Only ${jobSeekers} job seekers - Consider running seed script for more`);
    } else {
      console.log(`✅ ${jobSeekers} job seekers available`);
    }
    
    if (totalJobs === 0) {
      console.log('⚠️  No jobs in database - Create jobs in admin panel');
    } else {
      console.log(`✅ ${totalJobs} jobs available`);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the test
testJobSeekers();
