const express = require('express');
const router = express.Router();
const User = require('../models/User');
const InvitationSettings = require('../models/InvitationSettings');
const InvitationLog = require('../models/InvitationLog');
const { adminAuth } = require('../middleware/adminAuth');
const nodemailer = require('nodemailer');

// @route   GET /api/admin/invitation-settings
// @desc    Get invitation settings
// @access  Private (Admin)
router.get('/invitation-settings', adminAuth, async (req, res) => {
  try {
    let settings = await InvitationSettings.findOne();
    
    if (!settings) {
      settings = await InvitationSettings.create({
        whatsappEnabled: false,
        emailEnabled: true,
        apiProvider: 'twilio',
        maxMessagesPerMinute: 10,
        maxMessagesPerHour: 100,
        maxMessagesPerDay: 500
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching invitation settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/whatsapp-settings
// @desc    Get WhatsApp settings
// @access  Private (Admin)
router.get('/whatsapp-settings', adminAuth, async (req, res) => {
  try {
    let settings = await InvitationSettings.findOne();
    
    if (!settings) {
      settings = await InvitationSettings.create({
        whatsappEnabled: false,
        emailEnabled: true,
        apiProvider: 'twilio',
        maxMessagesPerMinute: 10,
        maxMessagesPerHour: 100,
        maxMessagesPerDay: 500
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching WhatsApp settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/whatsapp-settings
// @desc    Update WhatsApp settings
// @access  Private (Admin)
router.put('/whatsapp-settings', adminAuth, async (req, res) => {
  try {
    const settings = await InvitationSettings.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true }
    );

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating WhatsApp settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/test-whatsapp
// @desc    Test WhatsApp connection
// @access  Private (Admin)
router.post('/test-whatsapp', adminAuth, async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    const settings = await InvitationSettings.findOne();

    if (!settings || !settings.whatsappEnabled) {
      return res.status(400).json({ message: 'WhatsApp is not enabled' });
    }

    // Send test message based on provider
    let success = false;
    let error = null;

    if (settings.apiProvider === 'twilio') {
      success = await sendTwilioMessage(phoneNumber, message, settings);
    } else if (settings.apiProvider === 'whatsapp-business-api') {
      success = await sendWhatsAppBusinessMessage(phoneNumber, message, settings);
    } else if (settings.apiProvider === 'custom') {
      success = await sendCustomApiMessage(phoneNumber, message, settings);
    }

    if (success) {
      res.json({ success: true, message: 'Test message sent successfully' });
    } else {
      res.status(400).json({ message: 'Failed to send test message' });
    }
  } catch (error) {
    console.error('Error testing WhatsApp:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   POST /api/admin/send-bulk-invitations
// @desc    Send bulk invitations to users, companies, or consultancies
// @access  Private (Admin)
router.post('/send-bulk-invitations', adminAuth, async (req, res) => {
  try {
    const { recipientIds, recipientType, messageType, emailSubject, emailMessage, whatsappMessage } = req.body;

    if (!recipientIds || recipientIds.length === 0) {
      return res.status(400).json({ message: 'No recipients selected' });
    }

    if (recipientIds.length > 500) {
      return res.status(400).json({ message: 'Maximum 500 recipients allowed per batch' });
    }

    if (!recipientType || !['users', 'companies', 'consultancies'].includes(recipientType)) {
      return res.status(400).json({ message: 'Invalid recipient type' });
    }

    const settings = await InvitationSettings.findOne();
    
    // Fetch recipients based on type
    let recipients = [];
    if (recipientType === 'users') {
      recipients = await User.find({ 
        _id: { $in: recipientIds },
        userType: 'jobseeker'
      });
    } else if (recipientType === 'companies') {
      // Companies are in User model with userType='company'
      recipients = await User.find({ 
        _id: { $in: recipientIds },
        userType: 'company'
      });
    } else if (recipientType === 'consultancies') {
      // Consultancies are in User model with userType='consultancy'
      recipients = await User.find({ 
        _id: { $in: recipientIds },
        userType: 'consultancy'
      });
    }

    let emailSent = 0;
    let whatsappSent = 0;
    let failed = 0;

    const results = [];

    for (const recipient of recipients) {
      const result = {
        recipientId: recipient._id,
        name: recipientType === 'users' 
          ? (recipient.name || `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim())
          : (recipient.companyName || recipient.consultancyName || recipient.profile?.company?.name || `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim()),
        email: recipient.email,
        phone: recipient.phone || recipient.phoneNumber || recipient.profile?.phone,
        emailSuccess: false,
        whatsappSuccess: false,
        errors: []
      };

      // Send Email
      if ((messageType === 'email' || messageType === 'both') && settings?.emailEnabled) {
        try {
          const recipientName = result.name;
          const personalizedEmail = emailMessage
            .replace(/{name}/g, recipientName)
            .replace(/{companyName}/g, recipientName)
            .replace(/{email}/g, recipient.email)
            .replace(/{phone}/g, result.phone || 'N/A');

          await sendEmail(recipient.email, emailSubject, personalizedEmail);
          result.emailSuccess = true;
          emailSent++;
        } catch (error) {
          result.errors.push(`Email: ${error.message}`);
          failed++;
        }
      }

      // Send WhatsApp
      if ((messageType === 'whatsapp' || messageType === 'both') && settings?.whatsappEnabled && result.phone) {
        try {
          const recipientName = result.name;
          const personalizedWhatsApp = whatsappMessage
            .replace(/{name}/g, recipientName)
            .replace(/{companyName}/g, recipientName)
            .replace(/{email}/g, recipient.email)
            .replace(/{phone}/g, result.phone || 'N/A');

          let success = false;
          if (settings.apiProvider === 'twilio') {
            success = await sendTwilioMessage(result.phone, personalizedWhatsApp, settings);
          } else if (settings.apiProvider === 'whatsapp-business-api') {
            success = await sendWhatsAppBusinessMessage(result.phone, personalizedWhatsApp, settings);
          } else if (settings.apiProvider === 'custom') {
            success = await sendCustomApiMessage(result.phone, personalizedWhatsApp, settings);
          }

          if (success) {
            result.whatsappSuccess = true;
            whatsappSent++;
          } else {
            result.errors.push('WhatsApp: Failed to send');
            failed++;
          }
        } catch (error) {
          result.errors.push(`WhatsApp: ${error.message}`);
          failed++;
        }
      }

      results.push(result);

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Log the bulk invitation
    await InvitationLog.create({
      adminId: req.user._id,
      recipientIds,
      recipientType,
      messageType,
      emailSent,
      whatsappSent,
      failed,
      results
    });

    res.json({
      success: true,
      emailSent,
      whatsappSent,
      failed,
      results
    });
  } catch (error) {
    console.error('Error sending bulk invitations:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Helper function to send email
async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html
  });
}

// Helper function to send Twilio WhatsApp message
async function sendTwilioMessage(phoneNumber, message, settings) {
  try {
    const twilio = require('twilio');
    const client = twilio(settings.twilioAccountSid, settings.twilioAuthToken);

    await client.messages.create({
      body: message,
      from: `whatsapp:${settings.twilioPhoneNumber}`,
      to: `whatsapp:${phoneNumber}`
    });

    return true;
  } catch (error) {
    console.error('Twilio error:', error);
    throw error;
  }
}

// Helper function to send WhatsApp Business API message
async function sendWhatsAppBusinessMessage(phoneNumber, message, settings) {
  try {
    const axios = require('axios');
    
    const response = await axios.post(
      `${settings.whatsappBusinessApiUrl}/${settings.whatsappBusinessPhoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber.replace('+', ''),
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${settings.whatsappBusinessApiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error('WhatsApp Business API error:', error);
    throw error;
  }
}

// Helper function to send custom API message
async function sendCustomApiMessage(phoneNumber, message, settings) {
  try {
    const axios = require('axios');
    
    const config = {
      method: settings.customApiMethod.toLowerCase(),
      url: settings.customApiUrl,
      headers: {
        'Authorization': `Bearer ${settings.customApiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        phone: phoneNumber,
        message: message
      }
    };

    const response = await axios(config);
    return response.status === 200;
  } catch (error) {
    console.error('Custom API error:', error);
    throw error;
  }
}

module.exports = router;
