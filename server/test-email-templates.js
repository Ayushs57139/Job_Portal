const emailTemplateService = require('./services/emailTemplateService');
const EmailTemplate = require('./models/EmailTemplate');

// Test data
const testAdminId = '507f1f77bcf86cd799439011'; // Replace with actual admin ID

async function testEmailTemplateSystem() {
  console.log('🧪 Testing Email Template System...\n');

  try {
    // 1. Initialize default templates
    console.log('📧 Step 1: Initializing default templates...');
    await emailTemplateService.createDefaultTemplates(testAdminId);
    console.log('✅ Default templates initialized successfully\n');

    // 2. Test job apply invite email
    console.log('📧 Step 2: Testing job apply invite email...');
    const jobInviteResult = await emailTemplateService.sendJobApplyInvite(
      'test.candidate@example.com',
      {
        _id: '507f1f77bcf86cd799439012',
        title: 'Senior Software Engineer',
        location: 'Mumbai, India',
        salary: 800000,
        description: 'We are looking for a skilled software engineer with 3+ years of experience.',
        candidateName: 'John Doe'
      },
      {
        name: 'Tech Solutions Pvt Ltd',
        website: 'https://techsolutions.com',
        hrName: 'Jane Smith',
        hrEmail: 'hr@techsolutions.com',
        hrPhone: '+91-9876543210'
      }
    );
    console.log('Job Apply Invite Result:', jobInviteResult);
    console.log('✅ Job apply invite email test completed\n');

    // 3. Test employer confirmation email
    console.log('📧 Step 3: Testing employer confirmation email...');
    const employerConfirmationResult = await emailTemplateService.sendEmployerConfirmation(
      'test.employer@example.com',
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        profile: {
          company: {
            name: 'Recruitment Experts'
          }
        }
      },
      {
        version: '2.1',
        url: 'https://freejobwala.com/terms'
      }
    );
    console.log('Employer Confirmation Result:', employerConfirmationResult);
    console.log('✅ Employer confirmation email test completed\n');

    // 4. Test employer welcome email
    console.log('📧 Step 4: Testing employer welcome email...');
    const employerWelcomeResult = await emailTemplateService.sendEmployerWelcome(
      'test.employer@example.com',
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        userType: 'employer',
        employerType: 'company',
        profile: {
          company: {
            name: 'Recruitment Experts'
          }
        }
      }
    );
    console.log('Employer Welcome Result:', employerWelcomeResult);
    console.log('✅ Employer welcome email test completed\n');

    // 5. Test template management
    console.log('📧 Step 5: Testing template management...');
    
    // Get all templates
    const templates = await emailTemplateService.getTemplates(1, 10);
    console.log(`Found ${templates.templates.length} templates`);
    
    // Get template statistics
    const stats = await emailTemplateService.getTemplateStats();
    console.log('Template Statistics:', stats);
    
    console.log('✅ Template management test completed\n');

    // 6. Test custom template creation
    console.log('📧 Step 6: Testing custom template creation...');
    const customTemplate = await emailTemplateService.createTemplate({
      name: 'Custom Job Invite',
      type: 'job_apply_invite',
      subject: '🎯 Custom Job Invitation - {{companyName}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Custom Job Invitation</title>
        </head>
        <body>
          <h1>Hello {{candidateName}}!</h1>
          <p>{{companyName}} has a great opportunity for you!</p>
          <h2>{{jobTitle}}</h2>
          <p>Location: {{jobLocation}}</p>
          <p>Salary: {{jobSalary}}</p>
          <a href="{{applicationUrl}}">Apply Now</a>
        </body>
        </html>
      `,
      variables: [
        { name: 'candidateName', description: 'Name of the candidate', example: 'John Doe' },
        { name: 'companyName', description: 'Name of the company', example: 'Tech Solutions' },
        { name: 'jobTitle', description: 'Job title', example: 'Software Engineer' },
        { name: 'jobLocation', description: 'Job location', example: 'Mumbai' },
        { name: 'jobSalary', description: 'Salary range', example: '₹5,00,000' },
        { name: 'applicationUrl', description: 'Application URL', example: 'https://example.com/apply' }
      ],
      isActive: true,
      isDefault: false
    }, testAdminId);
    
    console.log('Custom template created:', customTemplate.name);
    console.log('✅ Custom template creation test completed\n');

    // 7. Test template rendering
    console.log('📧 Step 7: Testing template rendering...');
    const rendered = customTemplate.render({
      candidateName: 'John Doe',
      companyName: 'Tech Solutions',
      jobTitle: 'Senior Developer',
      jobLocation: 'Bangalore',
      jobSalary: '₹8,00,000',
      applicationUrl: 'https://techsolutions.com/apply'
    });
    
    console.log('Rendered Subject:', rendered.subject);
    console.log('Rendered HTML (first 200 chars):', rendered.htmlContent.substring(0, 200) + '...');
    console.log('✅ Template rendering test completed\n');

    // 8. Test email with custom template
    console.log('📧 Step 8: Testing email with custom template...');
    const customEmailResult = await emailTemplateService.sendEmailWithTemplate(
      'job_apply_invite',
      'test.custom@example.com',
      {
        candidateName: 'Jane Smith',
        companyName: 'Custom Tech Corp',
        jobTitle: 'Full Stack Developer',
        jobLocation: 'Delhi',
        jobSalary: '₹6,00,000 - ₹10,00,000',
        applicationUrl: 'https://customtech.com/apply'
      }
    );
    console.log('Custom Email Result:', customEmailResult);
    console.log('✅ Custom email test completed\n');

    console.log('🎉 All email template system tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('- Default templates: ✅ Initialized');
    console.log('- Job apply invite: ✅ Tested');
    console.log('- Employer confirmation: ✅ Tested');
    console.log('- Employer welcome: ✅ Tested');
    console.log('- Template management: ✅ Tested');
    console.log('- Custom template creation: ✅ Tested');
    console.log('- Template rendering: ✅ Tested');
    console.log('- Custom email sending: ✅ Tested');

  } catch (error) {
    console.error('❌ Error during email template testing:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testEmailTemplateSystem();
