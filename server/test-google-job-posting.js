// Test file for Google Job Posting Service
const googleJobPostingService = require('./services/googleJobPostingService');

// Mock job data for testing
const mockJobData = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Software Engineer',
  description: 'We are looking for a skilled software engineer to join our team...',
  company: {
    name: 'Tech Solutions Inc',
    type: 'Startup',
    totalEmployees: '11-25',
    website: 'https://techsolutions.com'
  },
  location: {
    state: 'Maharashtra',
    city: 'Mumbai',
    locality: 'Bandra West'
  },
  salary: {
    min: 500000,
    max: 800000,
    currency: 'INR'
  },
  employmentType: 'Permanent',
  experienceType: '1-3',
  hrContact: {
    name: 'John Doe',
    email: 'hr@techsolutions.com',
    number: '+91-9876543210'
  },
  additionalBenefits: ['Health Insurance', 'Flexible Hours', 'Work From Home']
};

async function testGoogleJobPosting() {
  console.log('Testing Google Job Posting Service...');
  console.log('Mock Job Data:', JSON.stringify(mockJobData, null, 2));
  
  try {
    // Test data transformation
    console.log('\n--- Testing Data Transformation ---');
    const transformedData = googleJobPostingService.transformJobDataToGoogleFormat(mockJobData);
    console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));
    
    // Test employment type mapping
    console.log('\n--- Testing Employment Type Mapping ---');
    const employmentTypes = ['Permanent', 'Temporary/Contract Job', 'Freelance', 'Internship'];
    employmentTypes.forEach(type => {
      const mapped = googleJobPostingService.mapEmploymentType(type);
      console.log(`${type} -> ${mapped}`);
    });
    
    // Test job level mapping
    console.log('\n--- Testing Job Level Mapping ---');
    const experienceTypes = ['Fresher', '0-1', '1-3', '3-5', '5-10', '10+'];
    experienceTypes.forEach(type => {
      const mapped = googleJobPostingService.mapJobLevel(type);
      console.log(`${type} -> ${mapped}`);
    });
    
    console.log('\n--- Test Completed Successfully ---');
    console.log('Note: Actual Google API calls require valid API credentials');
    console.log('Set GOOGLE_JOBS_API_KEY and GOOGLE_JOBS_PUBLISHER_ID environment variables to test API calls');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testGoogleJobPosting();
