const EmailTemplate = require('../models/EmailTemplate');
const nodemailer = require('nodemailer');

class EmailTemplateService {
  constructor() {
    this.emailTransporter = this.setupEmailTransporter();
  }

  setupEmailTransporter() {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'Info@freejobwala.com',
        pass: 'Raju#Pooja@4321#'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Send email using custom template
  async sendEmailWithTemplate(templateType, recipientEmail, variables = {}) {
    try {
      const template = await EmailTemplate.getActiveTemplate(templateType);
      const rendered = template.render(variables);
      
      const mailOptions = {
        from: 'Info@freejobwala.com',
        to: recipientEmail,
        subject: rendered.subject,
        html: rendered.htmlContent,
        text: rendered.textContent
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      // Increment usage count
      await template.incrementUsage();
      
      console.log(`Email sent successfully using template ${templateType}:`, result.messageId);
      return { success: true, messageId: result.messageId, templateId: template._id };
    } catch (error) {
      console.error(`Error sending email with template ${templateType}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Send job apply invite email
  async sendJobApplyInvite(candidateEmail, jobData, companyData) {
    const variables = {
      candidateName: jobData.candidateName || 'Candidate',
      jobTitle: jobData.title,
      companyName: companyData.name || 'Company',
      jobLocation: jobData.location,
      jobSalary: jobData.salary ? `₹${jobData.salary.toLocaleString()}` : 'Not specified',
      jobDescription: jobData.description || '',
      applicationUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/jobs/${jobData._id}/apply`,
      companyWebsite: companyData.website || '',
      hrName: companyData.hrName || 'HR Team',
      hrEmail: companyData.hrEmail || 'hr@company.com',
      hrPhone: companyData.hrPhone || ''
    };

    return await this.sendEmailWithTemplate('job_apply_invite', candidateEmail, variables);
  }

  // Send employer confirmation email
  async sendEmployerConfirmation(employerEmail, employerData, termsData) {
    const variables = {
      employerName: employerData.firstName + ' ' + employerData.lastName,
      companyName: employerData.profile?.company?.name || 'Your Company',
      termsVersion: termsData.version || '1.0',
      termsUrl: termsData.url || `${process.env.CLIENT_URL || 'http://localhost:3000'}/terms`,
      confirmationUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/employer/confirm-terms`,
      supportEmail: 'Info@freejobwala.com',
      platformName: 'Freejobwala'
    };

    return await this.sendEmailWithTemplate('employer_confirmation', employerEmail, variables);
  }

  // Send employer welcome email
  async sendEmployerWelcome(employerEmail, employerData) {
    const variables = {
      employerName: employerData.firstName + ' ' + employerData.lastName,
      companyName: employerData.profile?.company?.name || 'Your Company',
      employerType: employerData.employerType || 'employer',
      dashboardUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/employer/dashboard`,
      postJobUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/employer/post-job`,
      profileUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/employer/profile`,
      supportEmail: 'Info@freejobwala.com',
      platformName: 'Freejobwala'
    };

    return await this.sendEmailWithTemplate('employer_welcome', employerEmail, variables);
  }

  // Create default templates
  async createDefaultTemplates(adminUserId) {
    const defaultTemplates = [
      {
        name: 'Job Apply Invite - Default',
        type: 'job_apply_invite',
        subject: '🎯 Job Invitation - {{companyName}} wants to connect with you!',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Job Invitation</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
              .content { padding: 30px 20px; }
              .job-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 10px 0; font-weight: 600; }
              .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎯 Job Invitation</h1>
                <p>{{companyName}} wants to connect with you!</p>
              </div>
              <div class="content">
                <p>Hello {{candidateName}},</p>
                <p>Great news! {{companyName}} has reviewed your profile and would like to invite you to apply for an exciting opportunity.</p>
                
                <div class="job-card">
                  <h2>{{jobTitle}}</h2>
                  <p><strong>Company:</strong> {{companyName}}</p>
                  <p><strong>Location:</strong> {{jobLocation}}</p>
                  <p><strong>Salary:</strong> {{jobSalary}}</p>
                  <p><strong>Description:</strong> {{jobDescription}}</p>
                </div>
                
                <p>This is a great opportunity to advance your career. Click the button below to apply now!</p>
                <a href="{{applicationUrl}}" class="btn">Apply Now</a>
                
                <p>If you have any questions, feel free to contact our HR team:</p>
                <p><strong>HR Contact:</strong> {{hrName}}<br>
                <strong>Email:</strong> {{hrEmail}}<br>
                <strong>Phone:</strong> {{hrPhone}}</p>
              </div>
              <div class="footer">
                <p><strong>Freejobwala Team</strong></p>
                <p>📧 Email: <a href="mailto:Info@freejobwala.com" style="color: #3498db;">Info@freejobwala.com</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
        variables: [
          { name: 'candidateName', description: 'Name of the candidate', example: 'John Doe' },
          { name: 'jobTitle', description: 'Title of the job position', example: 'Software Engineer' },
          { name: 'companyName', description: 'Name of the company', example: 'Tech Solutions Pvt Ltd' },
          { name: 'jobLocation', description: 'Job location', example: 'Mumbai, India' },
          { name: 'jobSalary', description: 'Salary range', example: '₹5,00,000 - ₹8,00,000' },
          { name: 'jobDescription', description: 'Job description', example: 'We are looking for a skilled software engineer...' },
          { name: 'applicationUrl', description: 'URL to apply for the job', example: 'https://freejobwala.com/jobs/123/apply' },
          { name: 'hrName', description: 'Name of HR contact', example: 'Jane Smith' },
          { name: 'hrEmail', description: 'HR email address', example: 'hr@company.com' },
          { name: 'hrPhone', description: 'HR phone number', example: '+91-9876543210' }
        ],
        isDefault: true,
        createdBy: adminUserId,
        lastModifiedBy: adminUserId
      },
      {
        name: 'Employer Confirmation - Default',
        type: 'employer_confirmation',
        subject: '📋 Terms & Conditions Confirmation Required - {{platformName}}',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Terms & Conditions Confirmation</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 30px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
              .content { padding: 30px 20px; }
              .confirmation-card { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
              .btn { display: inline-block; background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 10px 0; font-weight: 600; }
              .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Terms & Conditions</h1>
                <p>Confirmation Required</p>
              </div>
              <div class="content">
                <p>Hello {{employerName}},</p>
                <p>Welcome to {{platformName}}! Before you can start using our platform, we need you to confirm that you have read and agree to our Terms & Conditions.</p>
                
                <div class="confirmation-card">
                  <h3>📋 Terms & Conditions Confirmation</h3>
                  <p><strong>Company:</strong> {{companyName}}</p>
                  <p><strong>Terms Version:</strong> {{termsVersion}}</p>
                  <p>Please review our updated Terms & Conditions and confirm your acceptance to continue using our platform.</p>
                </div>
                
                <p>By clicking the confirmation button below, you acknowledge that you have read, understood, and agree to be bound by our Terms & Conditions.</p>
                <a href="{{confirmationUrl}}" class="btn">Confirm Terms & Conditions</a>
                
                <p>You can also review the full terms at: <a href="{{termsUrl}}">{{termsUrl}}</a></p>
                
                <p>If you have any questions about our terms, please contact our support team at {{supportEmail}}.</p>
              </div>
              <div class="footer">
                <p><strong>{{platformName}} Team</strong></p>
                <p>📧 Email: <a href="mailto:{{supportEmail}}" style="color: #3498db;">{{supportEmail}}</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
        variables: [
          { name: 'employerName', description: 'Name of the employer', example: 'John Doe' },
          { name: 'companyName', description: 'Name of the company', example: 'Tech Solutions Pvt Ltd' },
          { name: 'termsVersion', description: 'Version of terms and conditions', example: '2.1' },
          { name: 'termsUrl', description: 'URL to terms and conditions', example: 'https://freejobwala.com/terms' },
          { name: 'confirmationUrl', description: 'URL to confirm terms', example: 'https://freejobwala.com/employer/confirm-terms' },
          { name: 'supportEmail', description: 'Support email address', example: 'Info@freejobwala.com' },
          { name: 'platformName', description: 'Name of the platform', example: 'Freejobwala' }
        ],
        isDefault: true,
        createdBy: adminUserId,
        lastModifiedBy: adminUserId
      },
      {
        name: 'Employer Welcome - Default',
        type: 'employer_welcome',
        subject: '🎉 Welcome to {{platformName}} - Start Hiring Top Talent!',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Freejobwala</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 30px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
              .content { padding: 30px 20px; }
              .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
              .feature { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #3498db; }
              .feature-icon { font-size: 24px; margin-bottom: 10px; }
              .btn { display: inline-block; background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 10px 0; font-weight: 600; }
              .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to {{platformName}}!</h1>
                <p>Your Gateway to Top Talent</p>
              </div>
              <div class="content">
                <p>Hello {{employerName}},</p>
                <p>Welcome to {{platformName}} - India's premier platform for connecting {{employerType}}s with exceptional talent. We're excited to help {{companyName}} find the perfect candidates for your team!</p>
                
                <div class="features">
                  <div class="feature">
                    <div class="feature-icon">👥</div>
                    <h3>Access Top Talent</h3>
                    <p>Browse through thousands of qualified candidates with detailed profiles and skills</p>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">📊</div>
                    <h3>Advanced Filtering</h3>
                    <p>Find candidates by skills, experience, location, and other specific criteria</p>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">💼</div>
                    <h3>Easy Job Posting</h3>
                    <p>Post job openings quickly and reach thousands of potential candidates</p>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">📈</div>
                    <h3>Analytics Dashboard</h3>
                    <p>Track application metrics and hiring performance with detailed insights</p>
                  </div>
                </div>
                
                <p>Ready to start hiring? Complete your profile and start posting jobs to attract the best talent in the market!</p>
                <a href="{{dashboardUrl}}" class="btn">Go to Dashboard</a>
                <a href="{{postJobUrl}}" class="btn">Post Your First Job</a>
                <a href="{{profileUrl}}" class="btn">Complete Profile</a>
              </div>
              <div class="footer">
                <p><strong>{{platformName}} Team</strong></p>
                <p>📧 Email: <a href="mailto:{{supportEmail}}" style="color: #3498db;">{{supportEmail}}</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
        variables: [
          { name: 'employerName', description: 'Name of the employer', example: 'John Doe' },
          { name: 'companyName', description: 'Name of the company', example: 'Tech Solutions Pvt Ltd' },
          { name: 'employerType', description: 'Type of employer (company/consultancy)', example: 'company' },
          { name: 'dashboardUrl', description: 'URL to employer dashboard', example: 'https://freejobwala.com/employer/dashboard' },
          { name: 'postJobUrl', description: 'URL to post job page', example: 'https://freejobwala.com/employer/post-job' },
          { name: 'profileUrl', description: 'URL to employer profile', example: 'https://freejobwala.com/employer/profile' },
          { name: 'supportEmail', description: 'Support email address', example: 'Info@freejobwala.com' },
          { name: 'platformName', description: 'Name of the platform', example: 'Freejobwala' }
        ],
        isDefault: true,
        createdBy: adminUserId,
        lastModifiedBy: adminUserId
      }
    ];

    for (const templateData of defaultTemplates) {
      const existingTemplate = await EmailTemplate.findOne({ type: templateData.type, isDefault: true });
      if (!existingTemplate) {
        await EmailTemplate.create(templateData);
        console.log(`Created default template for ${templateData.type}`);
      }
    }
  }

  // Get all templates with pagination
  async getTemplates(page = 1, limit = 10, type = null) {
    const query = type ? { type } : {};
    const skip = (page - 1) * limit;
    
    const templates = await EmailTemplate.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await EmailTemplate.countDocuments(query);
    
    return {
      templates,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  // Get template by ID
  async getTemplateById(templateId) {
    return await EmailTemplate.findById(templateId)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
  }

  // Create new template
  async createTemplate(templateData, adminUserId) {
    try {
      // Clean up optional fields
      if (templateData.textContent === '') {
        templateData.textContent = undefined;
      }
      
      templateData.createdBy = adminUserId;
      templateData.lastModifiedBy = adminUserId;
      return await EmailTemplate.create(templateData);
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  // Update template
  async updateTemplate(templateId, updateData, adminUserId) {
    updateData.lastModifiedBy = adminUserId;
    updateData.version = { $inc: 1 };
    return await EmailTemplate.findByIdAndUpdate(
      templateId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  // Delete template
  async deleteTemplate(templateId) {
    const template = await EmailTemplate.findById(templateId);
    if (template && template.isDefault) {
      throw new Error('Cannot delete default template');
    }
    return await EmailTemplate.findByIdAndDelete(templateId);
  }

  // Set template as default
  async setDefaultTemplate(templateId) {
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Remove default flag from other templates of the same type
    await EmailTemplate.updateMany(
      { type: template.type, _id: { $ne: templateId } },
      { isDefault: false }
    );
    
    // Set this template as default
    template.isDefault = true;
    return await template.save();
  }

  // Get template statistics
  async getTemplateStats() {
    try {
      const total = await EmailTemplate.countDocuments();
      const active = await EmailTemplate.countDocuments({ isActive: true });
      const inactive = await EmailTemplate.countDocuments({ isActive: false });
      
      return {
        total: total || 0,
        active: active || 0,
        inactive: inactive || 0,
      };
    } catch (error) {
      console.error('Error getting template stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
      };
    }
  }
}

module.exports = new EmailTemplateService();
