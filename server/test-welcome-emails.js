const welcomeEmailService = require('./services/welcomeEmailService');

// Test data for different user types
const testJobSeeker = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'test.jobseeker@example.com',
  userId: 'JW12345678',
  userType: 'jobseeker'
};

const testCompany = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'test.company@example.com',
  userType: 'employer',
  employerType: 'company',
  phone: '+91-9876543210',
  profile: {
    company: {
      name: 'Tech Solutions Pvt Ltd'
    }
  }
};

const testConsultancy = {
  firstName: 'Mike',
  lastName: 'Johnson',
  email: 'test.consultancy@example.com',
  userType: 'employer',
  employerType: 'consultancy',
  phone: '+91-9876543211',
  profile: {
    company: {
      name: 'Recruitment Experts'
    }
  }
};

async function testWelcomeEmails() {
  console.log('🧪 Testing Welcome Email Service...\n');

  try {
    // Test Job Seeker Welcome Email
    console.log('📧 Testing Job Seeker Welcome Email...');
    const jobSeekerResult = await welcomeEmailService.sendJobSeekerWelcomeEmail(testJobSeeker);
    console.log('Job Seeker Email Result:', jobSeekerResult);
    console.log('✅ Job Seeker welcome email test completed\n');

    // Test Company Welcome Email
    console.log('📧 Testing Company Welcome Email...');
    const companyResult = await welcomeEmailService.sendCompanyWelcomeEmail(testCompany);
    console.log('Company Email Result:', companyResult);
    console.log('✅ Company welcome email test completed\n');

    // Test Consultancy Welcome Email
    console.log('📧 Testing Consultancy Welcome Email...');
    const consultancyResult = await welcomeEmailService.sendConsultancyWelcomeEmail(testConsultancy);
    console.log('Consultancy Email Result:', consultancyResult);
    console.log('✅ Consultancy welcome email test completed\n');

    console.log('🎉 All welcome email tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Job Seeker Email:', jobSeekerResult.success ? '✅ Sent' : '❌ Failed');
    console.log('- Company Email:', companyResult.success ? '✅ Sent' : '❌ Failed');
    console.log('- Consultancy Email:', consultancyResult.success ? '✅ Sent' : '❌ Failed');

  } catch (error) {
    console.error('❌ Error during email testing:', error);
  }
}

// Run the test
testWelcomeEmails();
