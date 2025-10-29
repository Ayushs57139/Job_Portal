const nodemailer = require('nodemailer');
const axios = require('axios');

class NotificationService {
  constructor() {
    this.emailTransporter = this.setupEmailTransporter();
    this.whatsappConfig = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      apiUrl: 'https://graph.facebook.com/v18.0'
    };
    this.smsConfig = {
      apiKey: process.env.SMS_API_KEY,
      senderId: process.env.SMS_SENDER_ID,
      apiUrl: process.env.SMS_API_URL
    };
  }

  setupEmailTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send job update notification
  async sendJobUpdateNotification(user, job, message, channels = ['email', 'whatsapp']) {
    const results = {
      email: { sent: false, error: null },
      whatsapp: { sent: false, error: null },
      sms: { sent: false, error: null }
    };

    // Prepare message content
    const emailContent = this.prepareEmailContent(user, job, message);
    const whatsappContent = this.prepareWhatsAppContent(user, job, message);
    const smsContent = this.prepareSMSContent(user, job, message);

    // Send via email
    if (channels.includes('email') && user.chatPreferences.jobUpdates.channels.email) {
      try {
        await this.sendEmail(user.email, '🎯 New Job Alert - Freejobwala', emailContent);
        results.email.sent = true;
      } catch (error) {
        results.email.error = error.message;
        console.error('Email sending failed:', error);
      }
    }

    // Send via WhatsApp
    if (channels.includes('whatsapp') && user.chatPreferences.jobUpdates.channels.whatsapp) {
      try {
        await this.sendWhatsApp(user.whatsappNumber, whatsappContent);
        results.whatsapp.sent = true;
      } catch (error) {
        results.whatsapp.error = error.message;
        console.error('WhatsApp sending failed:', error);
      }
    }

    // Send via SMS
    if (channels.includes('sms') && user.chatPreferences.jobUpdates.channels.sms) {
      try {
        await this.sendSMS(user.mobile, smsContent);
        results.sms.sent = true;
      } catch (error) {
        results.sms.error = error.message;
        console.error('SMS sending failed:', error);
      }
    }

    return results;
  }

  // Send application update notification
  async sendApplicationUpdateNotification(user, application, message, channels = ['email', 'whatsapp']) {
    const results = {
      email: { sent: false, error: null },
      whatsapp: { sent: false, error: null },
      sms: { sent: false, error: null }
    };

    const emailContent = this.prepareApplicationEmailContent(user, application, message);
    const whatsappContent = this.prepareApplicationWhatsAppContent(user, application, message);
    const smsContent = this.prepareApplicationSMSContent(user, application, message);

    // Send via email
    if (channels.includes('email') && user.chatPreferences.notifications.applicationUpdates) {
      try {
        await this.sendEmail(user.email, '📋 Application Update - Freejobwala', emailContent);
        results.email.sent = true;
      } catch (error) {
        results.email.error = error.message;
        console.error('Email sending failed:', error);
      }
    }

    // Send via WhatsApp
    if (channels.includes('whatsapp') && user.chatPreferences.notifications.applicationUpdates) {
      try {
        await this.sendWhatsApp(user.whatsappNumber, whatsappContent);
        results.whatsapp.sent = true;
      } catch (error) {
        results.whatsapp.error = error.message;
        console.error('WhatsApp sending failed:', error);
      }
    }

    // Send via SMS
    if (channels.includes('sms') && user.chatPreferences.notifications.applicationUpdates) {
      try {
        await this.sendSMS(user.mobile, smsContent);
        results.sms.sent = true;
      } catch (error) {
        results.sms.error = error.message;
        console.error('SMS sending failed:', error);
      }
    }

    return results;
  }

  // Send interview reminder
  async sendInterviewReminder(user, interview, channels = ['email', 'whatsapp']) {
    const results = {
      email: { sent: false, error: null },
      whatsapp: { sent: false, error: null },
      sms: { sent: false, error: null }
    };

    const emailContent = this.prepareInterviewEmailContent(user, interview);
    const whatsappContent = this.prepareInterviewWhatsAppContent(user, interview);
    const smsContent = this.prepareInterviewSMSContent(user, interview);

    // Send via email
    if (channels.includes('email') && user.chatPreferences.notifications.interviewReminders) {
      try {
        await this.sendEmail(user.email, '📅 Interview Reminder - Freejobwala', emailContent);
        results.email.sent = true;
      } catch (error) {
        results.email.error = error.message;
        console.error('Email sending failed:', error);
      }
    }

    // Send via WhatsApp
    if (channels.includes('whatsapp') && user.chatPreferences.notifications.interviewReminders) {
      try {
        await this.sendWhatsApp(user.whatsappNumber, whatsappContent);
        results.whatsapp.sent = true;
      } catch (error) {
        results.whatsapp.error = error.message;
        console.error('WhatsApp sending failed:', error);
      }
    }

    // Send via SMS
    if (channels.includes('sms') && user.chatPreferences.notifications.interviewReminders) {
      try {
        await this.sendSMS(user.mobile, smsContent);
        results.sms.sent = true;
      } catch (error) {
        results.sms.error = error.message;
        console.error('SMS sending failed:', error);
      }
    }

    return results;
  }

  // Email sending method
  async sendEmail(to, subject, content) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: content
    };

    return await this.emailTransporter.sendMail(mailOptions);
  }

  // WhatsApp sending method
  async sendWhatsApp(to, message) {
    if (!this.whatsappConfig.accessToken || !this.whatsappConfig.phoneNumberId) {
      throw new Error('WhatsApp configuration not found');
    }

    const url = `${this.whatsappConfig.apiUrl}/${this.whatsappConfig.phoneNumberId}/messages`;
    
    const data = {
      messaging_product: 'whatsapp',
      to: `91${to}`,
      type: 'text',
      text: {
        body: message
      }
    };

    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${this.whatsappConfig.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  // SMS sending method
  async sendSMS(to, message) {
    if (!this.smsConfig.apiKey || !this.smsConfig.apiUrl) {
      throw new Error('SMS configuration not found');
    }

    const data = {
      api_key: this.smsConfig.apiKey,
      sender_id: this.smsConfig.senderId,
      to: `91${to}`,
      message: message
    };

    const response = await axios.post(this.smsConfig.apiUrl, data);
    return response.data;
  }

  // Content preparation methods
  prepareEmailContent(user, job, message) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Job Alert - Freejobwala</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E88E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .job-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .btn { display: inline-block; background: #1E88E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Job Alert</h1>
            <p>Freejobwala - Your Job Search Partner</p>
          </div>
          <div class="content">
            <p>Hello ${user.firstName},</p>
            <p>${message}</p>
            <div class="job-card">
              <h2>${job.title}</h2>
              <p><strong>Company:</strong> ${job.postedBy.firstName} ${job.postedBy.lastName}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <p><strong>Salary:</strong> ₹${job.salary.toLocaleString()}</p>
              <p><strong>Experience:</strong> ${job.experience}</p>
              <p><strong>Job Type:</strong> ${job.jobType}</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/jobs/${job._id}" class="btn">Apply Now</a>
            </div>
            <p>Good luck with your application!</p>
            <p>Best regards,<br>Freejobwala Team</p>
          </div>
          <div class="footer">
            <p>You received this email because you subscribed to job alerts. <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  prepareWhatsAppContent(user, job, message) {
    return `🎯 *New Job Alert - Freejobwala*

Hello ${user.firstName},

${message}

*Job Details:*
📋 *Title:* ${job.title}
🏢 *Company:* ${job.postedBy.firstName} ${job.postedBy.lastName}
📍 *Location:* ${job.location}
💰 *Salary:* ₹${job.salary.toLocaleString()}
💼 *Experience:* ${job.experience}
⏰ *Job Type:* ${job.jobType}

Apply now: ${process.env.CLIENT_URL || 'http://localhost:3000'}/jobs/${job._id}

Good luck with your application! 🍀

Best regards,
Freejobwala Team`;
  }

  prepareSMSContent(user, job, message) {
    return `New Job Alert: ${job.title} at ${job.postedBy.firstName} ${job.postedBy.lastName}. Location: ${job.location}. Salary: ₹${job.salary.toLocaleString()}. Apply: ${process.env.CLIENT_URL || 'http://localhost:3000'}/jobs/${job._id}`;
  }

  prepareApplicationEmailContent(user, application, message) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Application Update - Freejobwala</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .status-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Application Update</h1>
            <p>Freejobwala - Your Job Search Partner</p>
          </div>
          <div class="content">
            <p>Hello ${user.firstName},</p>
            <p>${message}</p>
            <div class="status-card">
              <h2>Application Status Update</h2>
              <p><strong>Job Title:</strong> ${application.job.title}</p>
              <p><strong>Company:</strong> ${application.job.postedBy.firstName} ${application.job.postedBy.lastName}</p>
              <p><strong>Status:</strong> ${application.status}</p>
              <p><strong>Applied On:</strong> ${new Date(application.appliedAt).toLocaleDateString()}</p>
            </div>
            <p>Keep checking your dashboard for more updates!</p>
            <p>Best regards,<br>Freejobwala Team</p>
          </div>
          <div class="footer">
            <p>You received this email because you subscribed to application updates. <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  prepareApplicationWhatsAppContent(user, application, message) {
    return `📋 *Application Update - Freejobwala*

Hello ${user.firstName},

${message}

*Application Details:*
📋 *Job Title:* ${application.job.title}
🏢 *Company:* ${application.job.postedBy.firstName} ${application.job.postedBy.lastName}
📊 *Status:* ${application.status}
📅 *Applied On:* ${new Date(application.appliedAt).toLocaleDateString()}

Keep checking your dashboard for more updates!

Best regards,
Freejobwala Team`;
  }

  prepareApplicationSMSContent(user, application, message) {
    return `Application Update: ${application.job.title} at ${application.job.postedBy.firstName} ${application.job.postedBy.lastName}. Status: ${application.status}. Check dashboard for details.`;
  }

  prepareInterviewEmailContent(user, interview) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Interview Reminder - Freejobwala</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .interview-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Interview Reminder</h1>
            <p>Freejobwala - Your Job Search Partner</p>
          </div>
          <div class="content">
            <p>Hello ${user.firstName},</p>
            <p>This is a friendly reminder about your upcoming interview.</p>
            <div class="interview-card">
              <h2>Interview Details</h2>
              <p><strong>Job Title:</strong> ${interview.job.title}</p>
              <p><strong>Company:</strong> ${interview.job.postedBy.firstName} ${interview.job.postedBy.lastName}</p>
              <p><strong>Date:</strong> ${new Date(interview.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(interview.date).toLocaleTimeString()}</p>
              <p><strong>Location:</strong> ${interview.location}</p>
              <p><strong>Type:</strong> ${interview.type}</p>
            </div>
            <p>Good luck with your interview! 🍀</p>
            <p>Best regards,<br>Freejobwala Team</p>
          </div>
          <div class="footer">
            <p>You received this email because you subscribed to interview reminders. <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  prepareInterviewWhatsAppContent(user, interview) {
    return `📅 *Interview Reminder - Freejobwala*

Hello ${user.firstName},

This is a friendly reminder about your upcoming interview.

*Interview Details:*
📋 *Job Title:* ${interview.job.title}
🏢 *Company:* ${interview.job.postedBy.firstName} ${interview.job.postedBy.lastName}
📅 *Date:* ${new Date(interview.date).toLocaleDateString()}
⏰ *Time:* ${new Date(interview.date).toLocaleTimeString()}
📍 *Location:* ${interview.location}
💼 *Type:* ${interview.type}

Good luck with your interview! 🍀

Best regards,
Freejobwala Team`;
  }

  prepareInterviewSMSContent(user, interview) {
    return `Interview Reminder: ${interview.job.title} at ${interview.job.postedBy.firstName} ${interview.job.postedBy.lastName}. Date: ${new Date(interview.date).toLocaleDateString()}, Time: ${new Date(interview.date).toLocaleTimeString()}. Location: ${interview.location}`;
  }
}

module.exports = new NotificationService();
