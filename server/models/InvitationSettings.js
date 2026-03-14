const mongoose = require('mongoose');

const InvitationSettingsSchema = new mongoose.Schema({
  // Enable/Disable
  whatsappEnabled: {
    type: Boolean,
    default: false
  },
  emailEnabled: {
    type: Boolean,
    default: true
  },

  // API Provider
  apiProvider: {
    type: String,
    enum: ['twilio', 'whatsapp-business-api', 'custom'],
    default: 'twilio'
  },

  // Twilio Settings
  twilioAccountSid: String,
  twilioAuthToken: String,
  twilioPhoneNumber: String,

  // WhatsApp Business API Settings
  whatsappBusinessApiUrl: String,
  whatsappBusinessApiToken: String,
  whatsappBusinessPhoneNumberId: String,

  // Custom API Settings
  customApiUrl: String,
  customApiKey: String,
  customApiMethod: {
    type: String,
    enum: ['POST', 'GET'],
    default: 'POST'
  },

  // Rate Limiting
  maxMessagesPerMinute: {
    type: Number,
    default: 10
  },
  maxMessagesPerHour: {
    type: Number,
    default: 100
  },
  maxMessagesPerDay: {
    type: Number,
    default: 500
  },

  // Test Settings
  testPhoneNumber: String,

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InvitationSettings', InvitationSettingsSchema);
