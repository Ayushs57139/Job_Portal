const nodemailer = require('nodemailer');
const emailTemplateService = require('./emailTemplateService');

class WelcomeEmailService {
  constructor() {
    this.emailTransporter = this.setupEmailTransporter();
  }

  setupEmailTransporter() {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'Info@freejobwala.com',
        pass: 'Raju#Pooja@4321#'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Send welcome email to job seeker
  async sendJobSeekerWelcomeEmail(user) {
    try {
      // Try to use custom template first
      const customResult = await emailTemplateService.sendEmailWithTemplate('jobseeker_welcome', user.email, {
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user.userId,
        email: user.email
      });
      
      if (customResult.success) {
        return customResult;
      }
      
      // Fallback to default template
      const mailOptions = {
        from: 'Info@freejobwala.com',
        to: user.email,
        subject: '🎉 Welcome to Freejobwala - Your Job Search Journey Begins!',
        html: this.prepareJobSeekerWelcomeEmailContent(user)
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Job seeker welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending job seeker welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email to company
  async sendCompanyWelcomeEmail(user) {
    try {
      // Try to use custom template first
      const customResult = await emailTemplateService.sendEmailWithTemplate('company_welcome', user.email, {
        employerName: user.firstName + ' ' + user.lastName,
        companyName: user.profile?.company?.name || 'Your Company',
        dashboardUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/company/dashboard`,
        postJobUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/company/post-job`,
        profileUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/company/profile`,
        supportEmail: 'Info@freejobwala.com',
        platformName: 'Freejobwala'
      });
      
      if (customResult.success) {
        return customResult;
      }
      
      // Fallback to default template
      const mailOptions = {
        from: 'Info@freejobwala.com',
        to: user.email,     
        subject: '🏢 Welcome to Freejobwala - Start Hiring Top Talent!',
        html: this.prepareCompanyWelcomeEmailContent(user)
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Company welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending company welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email to consultancy
  async sendConsultancyWelcomeEmail(user) {
    try {
      // Try to use custom template first
      const customResult = await emailTemplateService.sendEmailWithTemplate('consultancy_welcome', user.email, {
        employerName: user.firstName + ' ' + user.lastName,
        companyName: user.profile?.company?.name || 'Your Consultancy',
        dashboardUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/consultancy/dashboard`,
        postJobUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/consultancy/post-job`,
        profileUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/consultancy/profile`,
        supportEmail: 'Info@freejobwala.com',
        platformName: 'Freejobwala'
      });
      
      if (customResult.success) {
        return customResult;
      }
      
      // Fallback to default template
      const mailOptions = {
        from: 'Info@freejobwala.com',
        to: user.email,
        subject: '🤝 Welcome to Freejobwala - Connect with Top Companies!',
        html: this.prepareConsultancyWelcomeEmailContent(user)
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Consultancy welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending consultancy welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Prepare job seeker welcome email content
  prepareJobSeekerWelcomeEmailContent(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Freejobwala</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300;
          }
          .header p { 
            margin: 10px 0 0 0; 
            font-size: 16px; 
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px; 
          }
          .welcome-section {
            text-align: center;
            margin-bottom: 30px;
          }
          .welcome-section h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 24px;
          }
          .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
          }
          .feature {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
          }
          .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .feature h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
          }
          .feature p {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          .cta-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
          }
          .btn { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 25px; 
            margin: 10px 0; 
            font-weight: 600;
            transition: transform 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
          .footer { 
            background: #2c3e50; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px;
          }
          .footer a {
            color: #3498db;
            text-decoration: none;
          }
          .user-info {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
          }
          .user-info strong {
            color: #2c3e50;
          }
          @media (max-width: 600px) {
            .features {
              grid-template-columns: 1fr;
            }
            .container {
              margin: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Freejobwala!</h1>
            <p>Your Gateway to Dream Jobs</p>
          </div>
          <div class="content">
            <div class="welcome-section">
              <h2>Hello ${user.firstName}!</h2>
              <p>Welcome to Freejobwala - India's leading job portal where opportunities meet talent. We're thrilled to have you join our community of successful job seekers!</p>
            </div>

            <div class="user-info">
              <p><strong>Your Account Details:</strong></p>
              <p>👤 Name: ${user.firstName} ${user.lastName}</p>
              <p>📧 Email: ${user.email}</p>
              <p>🆔 User ID: ${user.userId || 'JW' + Math.random().toString().substr(2, 8)}</p>
            </div>

            <div class="features">
              <div class="feature">
                <div class="feature-icon">🔍</div>
                <h3>Smart Job Search</h3>
                <p>Find jobs that match your skills and preferences with our advanced search filters</p>
              </div>
              <div class="feature">
                <div class="feature-icon">📱</div>
                <h3>Mobile App</h3>
                <p>Access job opportunities on-the-go with our user-friendly mobile application</p>
              </div>
              <div class="feature">
                <div class="feature-icon">🎯</div>
                <h3>Job Alerts</h3>
                <p>Get instant notifications about new job postings that match your criteria</p>
              </div>
              <div class="feature">
                <div class="feature-icon">💼</div>
                <h3>Career Guidance</h3>
                <p>Access expert career advice and resume building tools to boost your profile</p>
              </div>
            </div>

            <div class="cta-section">
              <h3>Ready to Start Your Job Search?</h3>
              <p>Complete your profile to get personalized job recommendations and increase your chances of landing your dream job!</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/profile" class="btn">Complete Your Profile</a>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/jobs" class="btn">Browse Jobs</a>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
              <h4 style="margin-top: 0; color: #856404;">💡 Pro Tips for Success:</h4>
              <ul style="color: #856404; margin: 0;">
                <li>Keep your profile updated with latest skills and experience</li>
                <li>Upload a professional resume to increase visibility</li>
                <li>Set up job alerts for your preferred roles and locations</li>
                <li>Apply to jobs within 24 hours of posting for better chances</li>
              </ul>
            </div>

            <p style="margin-top: 30px; text-align: center; color: #666;">
              If you have any questions or need assistance, our support team is here to help you succeed!
            </p>
          </div>
          <div class="footer">
            <p><strong>Freejobwala Team</strong></p>
            <p>📧 Email: <a href="mailto:Info@freejobwala.com">Info@freejobwala.com</a></p>
            <p>🌐 Website: <a href="https://freejobwala.com">www.freejobwala.com</a></p>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
              You received this email because you registered on Freejobwala. 
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/unsubscribe" style="color: #3498db;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Prepare company welcome email content
  prepareCompanyWelcomeEmailContent(user) {
    const companyName = user.profile?.company?.name || 'Your Company';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Freejobwala - Company</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300;
          }
          .header p { 
            margin: 10px 0 0 0; 
            font-size: 16px; 
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px; 
          }
          .welcome-section {
            text-align: center;
            margin-bottom: 30px;
          }
          .welcome-section h2 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 24px;
          }
          .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
          }
          .feature {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #3498db;
          }
          .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .feature h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
          }
          .feature p {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          .cta-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
          }
          .btn { 
            display: inline-block; 
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 25px; 
            margin: 10px 0; 
            font-weight: 600;
            transition: transform 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
          .footer { 
            background: #2c3e50; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px;
          }
          .footer a {
            color: #3498db;
            text-decoration: none;
          }
          .company-info {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
          }
          .company-info strong {
            color: #2c3e50;
          }
          @media (max-width: 600px) {
            .features {
              grid-template-columns: 1fr;
            }
            .container {
              margin: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 Welcome to Freejobwala!</h1>
            <p>Your Gateway to Top Talent</p>
          </div>
          <div class="content">
            <div class="welcome-section">
              <h2>Hello ${user.firstName}!</h2>
              <p>Welcome to Freejobwala - India's premier platform for connecting companies with exceptional talent. We're excited to help ${companyName} find the perfect candidates for your team!</p>
            </div>

            <div class="company-info">
              <p><strong>Your Company Account:</strong></p>
              <p>👤 Contact: ${user.firstName} ${user.lastName}</p>
              <p>📧 Email: ${user.email}</p>
              <p>🏢 Company: ${companyName}</p>
              <p>📱 Phone: ${user.phone || 'Not provided'}</p>
            </div>

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

            <div class="cta-section">
              <h3>Ready to Start Hiring?</h3>
              <p>Complete your company profile and start posting jobs to attract the best talent in the market!</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/company/profile" class="btn">Complete Company Profile</a>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/company/post-job" class="btn">Post Your First Job</a>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #d4edda; border-radius: 8px; border-left: 4px solid #28a745;">
              <h4 style="margin-top: 0; color: #155724;">💡 Hiring Best Practices:</h4>
              <ul style="color: #155724; margin: 0;">
                <li>Write clear and detailed job descriptions to attract quality candidates</li>
                <li>Set competitive salary ranges to stand out in the market</li>
                <li>Respond to applications promptly to maintain candidate interest</li>
                <li>Use our screening tools to shortlist the most suitable candidates</li>
              </ul>
            </div>

            <p style="margin-top: 30px; text-align: center; color: #666;">
              Our dedicated support team is here to help you make the most of your hiring experience on Freejobwala!
            </p>
          </div>
          <div class="footer">
            <p><strong>Freejobwala Team</strong></p>
            <p>📧 Email: <a href="mailto:Info@freejobwala.com">Info@freejobwala.com</a></p>
            <p>🌐 Website: <a href="https://freejobwala.com">www.freejobwala.com</a></p>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
              You received this email because you registered on Freejobwala. 
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/unsubscribe" style="color: #3498db;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Prepare consultancy welcome email content
  prepareConsultancyWelcomeEmailContent(user) {
    const consultancyName = user.profile?.company?.name || 'Your Consultancy';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Freejobwala - Consultancy</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #8e44ad 0%, #3498db 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300;
          }
          .header p { 
            margin: 10px 0 0 0; 
            font-size: 16px; 
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px; 
          }
          .welcome-section {
            text-align: center;
            margin-bottom: 30px;
          }
          .welcome-section h2 {
            color: #8e44ad;
            margin-bottom: 15px;
            font-size: 24px;
          }
          .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
          }
          .feature {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #8e44ad;
          }
          .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .feature h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
          }
          .feature p {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          .cta-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
          }
          .btn { 
            display: inline-block; 
            background: linear-gradient(135deg, #8e44ad 0%, #3498db 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 25px; 
            margin: 10px 0; 
            font-weight: 600;
            transition: transform 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
          .footer { 
            background: #2c3e50; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px;
          }
          .footer a {
            color: #3498db;
            text-decoration: none;
          }
          .consultancy-info {
            background: #f3e5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #8e44ad;
          }
          .consultancy-info strong {
            color: #2c3e50;
          }
          @media (max-width: 600px) {
            .features {
              grid-template-columns: 1fr;
            }
            .container {
              margin: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤝 Welcome to Freejobwala!</h1>
            <p>Your Gateway to Premium Partnerships</p>
          </div>
          <div class="content">
            <div class="welcome-section">
              <h2>Hello ${user.firstName}!</h2>
              <p>Welcome to Freejobwala - India's trusted platform for recruitment consultancies. We're excited to partner with ${consultancyName} to help you connect with top companies and place exceptional candidates!</p>
            </div>

            <div class="consultancy-info">
              <p><strong>Your Consultancy Account:</strong></p>
              <p>👤 Contact: ${user.firstName} ${user.lastName}</p>
              <p>📧 Email: ${user.email}</p>
              <p>🏢 Consultancy: ${consultancyName}</p>
              <p>📱 Phone: ${user.phone || 'Not provided'}</p>
            </div>

            <div class="features">
              <div class="feature">
                <div class="feature-icon">🏢</div>
                <h3>Company Network</h3>
                <p>Access our extensive network of companies looking for recruitment partners</p>
              </div>
              <div class="feature">
                <div class="feature-icon">👥</div>
                <h3>Candidate Pool</h3>
                <p>Browse through thousands of qualified candidates across various industries</p>
              </div>
              <div class="feature">
                <div class="feature-icon">📊</div>
                <h3>Placement Tracking</h3>
                <p>Track your placements and manage client relationships effectively</p>
              </div>
              <div class="feature">
                <div class="feature-icon">💼</div>
                <h3>Premium Support</h3>
                <p>Get dedicated support for your consultancy's specific needs</p>
              </div>
            </div>

            <div class="cta-section">
              <h3>Ready to Start Placing Candidates?</h3>
              <p>Complete your consultancy profile and start connecting with companies to build successful partnerships!</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/consultancy/profile" class="btn">Complete Consultancy Profile</a>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/consultancy/companies" class="btn">Browse Companies</a>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
              <h4 style="margin-top: 0; color: #856404;">💡 Consultancy Success Tips:</h4>
              <ul style="color: #856404; margin: 0;">
                <li>Build strong relationships with both candidates and companies</li>
                <li>Maintain detailed records of all placements and interactions</li>
                <li>Stay updated with industry trends and salary benchmarks</li>
                <li>Provide excellent service to build long-term partnerships</li>
              </ul>
            </div>

            <p style="margin-top: 30px; text-align: center; color: #666;">
              Our team is committed to supporting your consultancy's growth and success on Freejobwala!
            </p>
          </div>
          <div class="footer">
            <p><strong>Freejobwala Team</strong></p>
            <p>📧 Email: <a href="mailto:Info@freejobwala.com">Info@freejobwala.com</a></p>
            <p>🌐 Website: <a href="https://freejobwala.com">www.freejobwala.com</a></p>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
              You received this email because you registered on Freejobwala. 
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/unsubscribe" style="color: #3498db;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new WelcomeEmailService();
