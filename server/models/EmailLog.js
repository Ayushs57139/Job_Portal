const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  // Email Details
  to: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  from: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  
  // Template Information
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate',
    default: null
  },
  templateName: {
    type: String,
    default: null
  },
  templateType: {
    type: String,
    enum: ['job_apply_invite', 'employer_confirmation', 'employer_welcome', 'jobseeker_welcome', 'company_welcome', 'consultancy_welcome', 'custom', 'system'],
    default: 'system'
  },

  // Content
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String,
    default: null
  },

  // Status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'bounced', 'pending'],
    default: 'pending',
    index: true
  },
  
  // Error Information
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed
  },

  // Delivery Information
  sentAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  openedAt: {
    type: Date,
    default: null
  },
  clickedAt: {
    type: Date,
    default: null
  },

  // Metadata
  metadata: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['manual', 'automated', 'triggered', 'scheduled'],
      default: 'automated'
    }
  },

  // Email Provider Details
  provider: {
    type: String,
    enum: ['smtp', 'sendgrid', 'mailgun', 'ses'],
    default: 'smtp'
  },
  messageId: {
    type: String,
    default: null
  },
  
  // Tracking
  trackingId: {
    type: String,
    unique: true,
    sparse: true
  },
  opens: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },

  // CC and BCC
  cc: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  bcc: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Attachments
  attachments: [{
    filename: String,
    path: String,
    size: Number
  }],

  // Retry Information
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  nextRetryAt: {
    type: Date,
    default: null
  },

  // Sent By
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
emailLogSchema.index({ to: 1, createdAt: -1 });
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ templateType: 1, createdAt: -1 });
emailLogSchema.index({ 'metadata.userId': 1, createdAt: -1 });
emailLogSchema.index({ createdAt: -1 });

// Method to mark email as sent
emailLogSchema.methods.markAsSent = function(messageId = null) {
  this.status = 'sent';
  this.sentAt = new Date();
  if (messageId) {
    this.messageId = messageId;
  }
  return this.save();
};

// Method to mark email as delivered
emailLogSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

// Method to mark email as failed
emailLogSchema.methods.markAsFailed = function(errorMessage, errorCode = null, errorDetails = null) {
  this.status = 'failed';
  this.error = {
    message: errorMessage,
    code: errorCode,
    details: errorDetails
  };
  
  // Schedule retry if not exceeded max retries
  if (this.retryCount < this.maxRetries) {
    this.retryCount += 1;
    // Exponential backoff: 5 minutes, 15 minutes, 45 minutes
    const delayMinutes = 5 * Math.pow(3, this.retryCount - 1);
    this.nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
  }
  
  return this.save();
};

// Method to track email open
emailLogSchema.methods.trackOpen = function() {
  if (!this.openedAt) {
    this.openedAt = new Date();
  }
  this.opens += 1;
  return this.save();
};

// Method to track email click
emailLogSchema.methods.trackClick = function() {
  if (!this.clickedAt) {
    this.clickedAt = new Date();
  }
  this.clicks += 1;
  return this.save();
};

// Static method to get email statistics
emailLogSchema.statics.getEmailStats = async function(startDate = null, endDate = null) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        sent: {
          $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
        },
        delivered: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        bounced: {
          $sum: { $cond: [{ $eq: ['$status', 'bounced'] }, 1, 0] }
        },
        totalOpens: { $sum: '$opens' },
        totalClicks: { $sum: '$clicks' },
        uniqueOpens: {
          $sum: { $cond: [{ $gt: ['$opens', 0] }, 1, 0] }
        },
        uniqueClicks: {
          $sum: { $cond: [{ $gt: ['$clicks', 0] }, 1, 0] }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    bounced: 0,
    totalOpens: 0,
    totalClicks: 0,
    uniqueOpens: 0,
    uniqueClicks: 0
  };
};

// Static method to get emails pending retry
emailLogSchema.statics.getPendingRetries = async function() {
  return await this.find({
    status: 'failed',
    retryCount: { $lt: '$maxRetries' },
    nextRetryAt: { $lte: new Date() }
  }).sort({ nextRetryAt: 1 });
};

module.exports = mongoose.model('EmailLog', emailLogSchema);

