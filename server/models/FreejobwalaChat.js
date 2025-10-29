const mongoose = require('mongoose');

const freejobwalaChatSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Contact Information
  mobile: {
    type: String,
    required: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit WhatsApp number']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  // Chat Preferences
  chatPreferences: {
    jobUpdates: {
      enabled: { type: Boolean, default: true },
      frequency: { 
        type: String, 
        enum: ['instant', 'daily', 'weekly'], 
        default: 'daily' 
      },
      channels: {
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      }
    },
    notifications: {
      newJobs: { type: Boolean, default: true },
      applicationUpdates: { type: Boolean, default: true },
      interviewReminders: { type: Boolean, default: true },
      jobRecommendations: { type: Boolean, default: true }
    }
  },

  // Job Alert Integration
  jobAlerts: [{
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobAlert'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastNotified: {
      type: Date,
      default: null
    }
  }],

  // Chat History
  chatHistory: [{
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    messageType: {
      type: String,
      enum: ['job_update', 'notification', 'reminder', 'recommendation', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    sentVia: {
      type: String,
      enum: ['email', 'whatsapp', 'sms', 'in_app'],
      required: true
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    readAt: {
      type: Date,
      default: null
    }
  }],

  // WhatsApp Integration
  whatsappIntegration: {
    isConnected: {
      type: Boolean,
      default: false
    },
    phoneId: {
      type: String,
      default: null
    },
    accessToken: {
      type: String,
      default: null
    },
    lastSync: {
      type: Date,
      default: null
    }
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationExpires: {
    type: Date,
    default: null
  },

  // Statistics
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    jobUpdatesSent: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
freejobwalaChatSchema.index({ userId: 1 });
freejobwalaChatSchema.index({ mobile: 1 });
freejobwalaChatSchema.index({ whatsappNumber: 1 });
freejobwalaChatSchema.index({ email: 1 });
freejobwalaChatSchema.index({ isActive: 1 });
freejobwalaChatSchema.index({ 'chatHistory.sentAt': -1 });

// Virtual for formatted mobile number
freejobwalaChatSchema.virtual('formattedMobile').get(function() {
  if (this.mobile && this.mobile.length === 10) {
    return `+91 ${this.mobile.slice(0, 5)} ${this.mobile.slice(5)}`;
  }
  return this.mobile;
});

// Virtual for formatted WhatsApp number
freejobwalaChatSchema.virtual('formattedWhatsApp').get(function() {
  if (this.whatsappNumber && this.whatsappNumber.length === 10) {
    return `+91 ${this.whatsappNumber.slice(0, 5)} ${this.whatsappNumber.slice(5)}`;
  }
  return this.whatsappNumber;
});

// Method to add chat message
freejobwalaChatSchema.methods.addChatMessage = function(messageData) {
  this.chatHistory.push({
    ...messageData,
    sentAt: new Date()
  });
  
  this.stats.totalMessages += 1;
  this.stats.lastActivity = new Date();
  
  if (messageData.messageType === 'job_update') {
    this.stats.jobUpdatesSent += 1;
  }
  
  return this.save();
};

// Method to mark message as read
freejobwalaChatSchema.methods.markMessageAsRead = function(messageId) {
  const message = this.chatHistory.id(messageId);
  if (message) {
    message.status = 'read';
    message.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to update job alert
freejobwalaChatSchema.methods.updateJobAlert = function(alertId, isActive = true) {
  const existingAlert = this.jobAlerts.find(alert => alert.alertId.toString() === alertId.toString());
  
  if (existingAlert) {
    existingAlert.isActive = isActive;
    existingAlert.lastNotified = new Date();
  } else {
    this.jobAlerts.push({
      alertId: alertId,
      isActive: isActive,
      lastNotified: new Date()
    });
  }
  
  return this.save();
};

// Method to get unread messages count
freejobwalaChatSchema.methods.getUnreadCount = function() {
  return this.chatHistory.filter(msg => msg.status === 'sent' || msg.status === 'delivered').length;
};

// Method to get recent messages
freejobwalaChatSchema.methods.getRecentMessages = function(limit = 10) {
  return this.chatHistory
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    .slice(0, limit);
};

// Static method to find by user ID
freejobwalaChatSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId: userId, isActive: true });
};

// Static method to find by mobile number
freejobwalaChatSchema.statics.findByMobile = function(mobile) {
  return this.findOne({ mobile: mobile, isActive: true });
};

// Static method to find by WhatsApp number
freejobwalaChatSchema.statics.findByWhatsApp = function(whatsappNumber) {
  return this.findOne({ whatsappNumber: whatsappNumber, isActive: true });
};

// Static method to find active chat users
freejobwalaChatSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true, isVerified: true })
    .populate('userId', 'firstName lastName email userType')
    .sort({ 'stats.lastActivity': -1 });
};

// Static method to find users for job notifications
freejobwalaChatSchema.statics.findUsersForJobNotification = function(jobData) {
  return this.find({
    isActive: true,
    isVerified: true,
    'chatPreferences.jobUpdates.enabled': true,
    'chatPreferences.notifications.newJobs': true
  }).populate('userId', 'firstName lastName email userType');
};

// Pre-save middleware to update timestamps
freejobwalaChatSchema.pre('save', function(next) {
  if (this.isModified('chatHistory') || this.isModified('stats')) {
    this.stats.lastActivity = new Date();
  }
  next();
});

// Ensure virtual fields are serialized
freejobwalaChatSchema.set('toJSON', { virtuals: true });
freejobwalaChatSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FreejobwalaChat', freejobwalaChatSchema);
