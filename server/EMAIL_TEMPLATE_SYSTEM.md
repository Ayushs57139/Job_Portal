# Email Template System - Freejobwala

## Overview
The Email Template System provides a comprehensive, dynamic email management solution for Freejobwala. It allows administrators to create, manage, and customize email templates for various user interactions including job invites, employer confirmations, and welcome emails.

## Features

### 🎯 Core Functionality
- **Dynamic Template Management**: Create, edit, and manage email templates through admin panel
- **Multiple Email Types**: Support for job apply invites, employer confirmations, employer welcome, and user welcome emails
- **Variable System**: Dynamic content replacement using `{{variableName}}` syntax
- **Template Versioning**: Track template changes and usage statistics
- **Default Templates**: Automatic fallback to default templates
- **SMTP Integration**: Full SMTP configuration with Gmail support

### 📧 Supported Email Types
1. **Job Apply Invite** (`job_apply_invite`)
   - Sent to candidates when invited to apply for a job
   - Variables: candidateName, jobTitle, companyName, jobLocation, jobSalary, etc.

2. **Employer Confirmation** (`employer_confirmation`)
   - Sent to employers for terms and conditions confirmation
   - Variables: employerName, companyName, termsVersion, termsUrl, etc.

3. **Employer Welcome** (`employer_welcome`)
   - Sent to new employers upon registration
   - Variables: employerName, companyName, employerType, dashboardUrl, etc.

4. **Job Seeker Welcome** (`jobseeker_welcome`)
   - Sent to new job seekers upon registration
   - Variables: firstName, lastName, userId, email

5. **Company Welcome** (`company_welcome`)
   - Sent to new companies upon registration
   - Variables: employerName, companyName, dashboardUrl, etc.

6. **Consultancy Welcome** (`consultancy_welcome`)
   - Sent to new consultancies upon registration
   - Variables: employerName, companyName, dashboardUrl, etc.

## System Architecture

### Database Models

#### EmailTemplate Model
```javascript
{
  name: String,           // Template name
  type: String,           // Template type (enum)
  subject: String,        // Email subject
  htmlContent: String,    // HTML email content
  textContent: String,    // Plain text content (optional)
  variables: Array,       // Available variables
  isActive: Boolean,      // Template status
  isDefault: Boolean,     // Default template flag
  createdBy: ObjectId,    // Creator reference
  lastModifiedBy: ObjectId, // Last modifier reference
  version: Number,        // Template version
  usageCount: Number,     // Usage statistics
  lastUsed: Date         // Last usage timestamp
}
```

### Services

#### EmailTemplateService
- **Template Management**: CRUD operations for templates
- **Email Sending**: Send emails using custom templates
- **Variable Rendering**: Replace variables with actual values
- **Default Template Creation**: Initialize system with default templates
- **Statistics**: Track template usage and performance

#### WelcomeEmailService (Enhanced)
- **Custom Template Integration**: Uses EmailTemplateService for dynamic templates
- **Fallback Support**: Falls back to hardcoded templates if custom templates fail
- **Multi-type Support**: Handles job seeker, company, and consultancy welcome emails

### API Endpoints

#### Template Management
- `GET /api/admin/email-templates` - List templates with pagination
- `GET /api/admin/email-templates/:id` - Get specific template
- `POST /api/admin/email-templates` - Create new template
- `PUT /api/admin/email-templates/:id` - Update template
- `DELETE /api/admin/email-templates/:id` - Delete template
- `POST /api/admin/email-templates/:id/set-default` - Set as default
- `GET /api/admin/email-templates/stats` - Get usage statistics

#### Email Sending
- `POST /api/admin/send-job-invite` - Send job apply invite
- `POST /api/admin/send-employer-confirmation` - Send employer confirmation
- `POST /api/admin/send-employer-welcome` - Send employer welcome
- `POST /api/admin/email-templates/test` - Test template with sample data

#### System Management
- `POST /api/admin/email-templates/initialize-defaults` - Initialize default templates

## Admin Panel Features

### 🎨 User Interface
- **Modern Design**: Bootstrap 5 with custom styling
- **Responsive Layout**: Works on desktop and mobile devices
- **Real-time Preview**: Live preview of email templates
- **Code Editor**: Syntax-highlighted HTML editor with CodeMirror
- **Variable Helper**: Shows available variables for each template type

### 📊 Dashboard Features
- **Statistics Cards**: Total templates, active templates, default templates, usage count
- **Filtering**: Filter by template type and status
- **Search**: Search templates by name or content
- **Pagination**: Efficient handling of large template collections

### ✏️ Template Editor
- **Rich Text Editor**: HTML editor with syntax highlighting
- **Variable Insertion**: Easy insertion of available variables
- **Preview Mode**: Real-time preview of rendered templates
- **Test Email**: Send test emails to verify templates
- **Version Control**: Track template changes and versions

## Variable System

### Variable Syntax
Variables use the `{{variableName}}` syntax for dynamic content replacement.

### Available Variables by Template Type

#### Job Apply Invite
```javascript
{
  candidateName: 'John Doe',
  jobTitle: 'Software Engineer',
  companyName: 'Tech Solutions Pvt Ltd',
  jobLocation: 'Mumbai, India',
  jobSalary: '₹5,00,000 - ₹8,00,000',
  jobDescription: 'We are looking for...',
  applicationUrl: 'https://freejobwala.com/jobs/123/apply',
  hrName: 'Jane Smith',
  hrEmail: 'hr@company.com',
  hrPhone: '+91-9876543210'
}
```

#### Employer Confirmation
```javascript
{
  employerName: 'John Doe',
  companyName: 'Tech Solutions Pvt Ltd',
  termsVersion: '2.1',
  termsUrl: 'https://freejobwala.com/terms',
  confirmationUrl: 'https://freejobwala.com/employer/confirm-terms',
  supportEmail: 'Info@freejobwala.com',
  platformName: 'Freejobwala'
}
```

#### Employer Welcome
```javascript
{
  employerName: 'John Doe',
  companyName: 'Tech Solutions Pvt Ltd',
  employerType: 'company',
  dashboardUrl: 'https://freejobwala.com/employer/dashboard',
  postJobUrl: 'https://freejobwala.com/employer/post-job',
  profileUrl: 'https://freejobwala.com/employer/profile',
  supportEmail: 'Info@freejobwala.com',
  platformName: 'Freejobwala'
}
```

## SMTP Configuration

### Current Setup
- **Email**: `Info@freejobwala.com`
- **Password**: `Raju#Pooja@4321#`
- **SMTP Server**: `smtp.gmail.com`
- **Port**: `587`
- **Security**: TLS

### Production Recommendations
1. **App Password**: Use Gmail App Password instead of regular password
2. **Environment Variables**: Move credentials to environment variables
3. **Email Service Provider**: Consider using dedicated email services (SendGrid, Mailgun, etc.)
4. **Monitoring**: Implement email delivery monitoring and bounce handling

## Usage Examples

### Creating a Custom Template
```javascript
const templateData = {
  name: 'Custom Job Invite',
  type: 'job_apply_invite',
  subject: '🎯 Exciting Opportunity at {{companyName}}!',
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <body>
      <h1>Hello {{candidateName}}!</h1>
      <p>{{companyName}} has an exciting opportunity for you!</p>
      <h2>{{jobTitle}}</h2>
      <p>Location: {{jobLocation}}</p>
      <p>Salary: {{jobSalary}}</p>
      <a href="{{applicationUrl}}">Apply Now</a>
    </body>
    </html>
  `,
  variables: [
    { name: 'candidateName', description: 'Name of the candidate' },
    { name: 'companyName', description: 'Name of the company' },
    { name: 'jobTitle', description: 'Job title' },
    { name: 'jobLocation', description: 'Job location' },
    { name: 'jobSalary', description: 'Salary range' },
    { name: 'applicationUrl', description: 'Application URL' }
  ],
  isActive: true,
  isDefault: false
};

const template = await emailTemplateService.createTemplate(templateData, adminUserId);
```

### Sending Email with Template
```javascript
const result = await emailTemplateService.sendJobApplyInvite(
  'candidate@example.com',
  {
    _id: 'job123',
    title: 'Senior Developer',
    location: 'Mumbai',
    salary: 800000,
    description: 'Great opportunity...',
    candidateName: 'John Doe'
  },
  {
    name: 'Tech Solutions',
    website: 'https://techsolutions.com',
    hrName: 'Jane Smith',
    hrEmail: 'hr@techsolutions.com',
    hrPhone: '+91-9876543210'
  }
);
```

## Testing

### Test Script
Run the comprehensive test script to verify all functionality:
```bash
cd server
node test-email-templates.js
```

### Manual Testing
1. **Admin Panel**: Access `/web/admin-email-templates.html`
2. **Create Template**: Use the admin panel to create custom templates
3. **Test Email**: Send test emails to verify templates
4. **Integration**: Test with actual user registration flows

## Security Considerations

### Access Control
- **Admin Only**: Template management restricted to admin users
- **Permission Checks**: Uses `canManageSettings` permission
- **Super Admin**: Default template initialization requires super admin access

### Data Validation
- **Input Validation**: All template data validated before saving
- **HTML Sanitization**: Consider implementing HTML sanitization for security
- **Variable Validation**: Validate variable names and content

### Email Security
- **SMTP Authentication**: Secure SMTP configuration
- **Rate Limiting**: Consider implementing rate limiting for email sending
- **Bounce Handling**: Implement bounce and complaint handling

## Performance Optimization

### Database Indexing
- **Type Index**: Efficient queries by template type
- **Active Index**: Fast filtering of active templates
- **Default Index**: Quick access to default templates

### Caching
- **Template Caching**: Cache frequently used templates
- **Variable Caching**: Cache variable definitions
- **Statistics Caching**: Cache usage statistics

### Email Delivery
- **Queue System**: Implement email queue for high volume
- **Batch Processing**: Send emails in batches
- **Retry Logic**: Implement retry logic for failed emails

## Troubleshooting

### Common Issues

1. **SMTP Authentication Failed**
   - Verify email credentials
   - Check if 2FA is enabled (use App Password)
   - Verify SMTP settings

2. **Template Not Found**
   - Ensure template is active
   - Check if default template exists
   - Verify template type

3. **Variable Not Replaced**
   - Check variable syntax (`{{variableName}}`)
   - Verify variable is defined in template
   - Ensure variable value is provided

4. **Email Not Delivered**
   - Check spam/junk folders
   - Verify recipient email address
   - Check SMTP server status

### Debug Mode
Enable debug logging in email service:
```javascript
const transporter = nodemailer.createTransporter({
  // ... other options
  debug: true,
  logger: true
});
```

## Future Enhancements

### Planned Features
1. **Template Categories**: Organize templates by categories
2. **A/B Testing**: Test different template versions
3. **Analytics**: Detailed email analytics and tracking
4. **Multi-language**: Support for multiple languages
5. **Template Library**: Pre-built template library
6. **Email Scheduling**: Schedule emails for later delivery
7. **Personalization**: Advanced personalization features
8. **Integration**: Integration with external email services

### Technical Improvements
1. **Microservices**: Split into separate microservice
2. **Event-driven**: Implement event-driven architecture
3. **Real-time Updates**: Real-time template updates
4. **API Versioning**: Version the API for backward compatibility
5. **Webhooks**: Webhook support for email events

## Support

For issues related to the email template system:
- Check server logs for error messages
- Verify SMTP configuration
- Test with the provided test script
- Contact system administrator for SMTP issues

---

**Last Updated**: December 2024
**Version**: 1.0
**Maintainer**: Freejobwala Development Team
