const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  // General Settings
  general: {
    siteName: {
      type: String,
      default: 'Free Job Wala',
      trim: true
    },
    siteDescription: {
      type: String,
      default: 'India\'s Leading Job Portal',
      trim: true
    },
    siteUrl: {
      type: String,
      default: 'https://freejobwala.com',
      trim: true
    },
    contactEmail: {
      type: String,
      default: 'support@freejobwala.com',
      trim: true,
      lowercase: true
    },
    contactPhone: {
      type: String,
      default: '+91 1234567890',
      trim: true
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    },
    dateFormat: {
      type: String,
      default: 'DD-MM-YYYY',
      enum: ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD']
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    maintenanceMessage: {
      type: String,
      default: 'Site is under maintenance. We will be back soon!'
    }
  },

  // Security Settings
  security: {
    enableTwoFactorAuth: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 30, // minutes
      min: 5,
      max: 1440
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 10
    },
    lockoutDuration: {
      type: Number,
      default: 15, // minutes
      min: 5,
      max: 60
    },
    passwordMinLength: {
      type: Number,
      default: 6,
      min: 4,
      max: 20
    },
    requireSpecialCharacters: {
      type: Boolean,
      default: false
    },
    requireNumbers: {
      type: Boolean,
      default: false
    },
    requireUppercase: {
      type: Boolean,
      default: false
    },
    passwordExpiryDays: {
      type: Number,
      default: 0, // 0 means never expire
      min: 0,
      max: 365
    },
    enableIPWhitelist: {
      type: Boolean,
      default: false
    },
    whitelistedIPs: [{
      type: String,
      trim: true
    }],
    enableCaptcha: {
      type: Boolean,
      default: false
    },
    captchaSiteKey: {
      type: String,
      default: '',
      trim: true
    },
    captchaSecretKey: {
      type: String,
      default: '',
      trim: true
    }
  },

  // Email Configuration
  email: {
    provider: {
      type: String,
      default: 'smtp',
      enum: ['smtp', 'sendgrid', 'mailgun', 'ses']
    },
    smtp: {
      host: {
        type: String,
        default: 'smtp.gmail.com',
        trim: true
      },
      port: {
        type: Number,
        default: 587
      },
      secure: {
        type: Boolean,
        default: false
      },
      username: {
        type: String,
        default: '',
        trim: true
      },
      password: {
        type: String,
        default: ''
      }
    },
    fromEmail: {
      type: String,
      default: 'noreply@freejobwala.com',
      trim: true,
      lowercase: true
    },
    fromName: {
      type: String,
      default: 'Free Job Wala',
      trim: true
    },
    replyToEmail: {
      type: String,
      default: 'support@freejobwala.com',
      trim: true,
      lowercase: true
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true
    },
    dailyEmailLimit: {
      type: Number,
      default: 1000,
      min: 0
    }
  },

  // Payment Settings
  payment: {
    enablePayments: {
      type: Boolean,
      default: true
    },
    defaultCurrency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    },
    gstEnabled: {
      type: Boolean,
      default: true
    },
    gstPercentage: {
      type: Number,
      default: 18,
      min: 0,
      max: 100
    },
    paymentGateways: {
      razorpay: {
        enabled: {
          type: Boolean,
          default: false
        },
        keyId: {
          type: String,
          default: '',
          trim: true
        },
        keySecret: {
          type: String,
          default: ''
        },
        webhookSecret: {
          type: String,
          default: ''
        }
      },
      stripe: {
        enabled: {
          type: Boolean,
          default: false
        },
        publishableKey: {
          type: String,
          default: '',
          trim: true
        },
        secretKey: {
          type: String,
          default: ''
        },
        webhookSecret: {
          type: String,
          default: ''
        }
      },
      paypal: {
        enabled: {
          type: Boolean,
          default: false
        },
        clientId: {
          type: String,
          default: '',
          trim: true
        },
        clientSecret: {
          type: String,
          default: ''
        },
        mode: {
          type: String,
          default: 'sandbox',
          enum: ['sandbox', 'live']
        }
      },
      paytm: {
        enabled: { type: Boolean, default: false },
        merchantId: { type: String, default: '', trim: true },
        merchantKey: { type: String, default: '' },
        website: { type: String, default: 'WEBSTAGING', trim: true },
        callbackUrl: { type: String, default: '', trim: true },
        testMode: { type: Boolean, default: true }
      },
      phonepe: {
        enabled: { type: Boolean, default: false },
        merchantId: { type: String, default: '', trim: true },
        saltKey: { type: String, default: '' },
        saltIndex: { type: String, default: '1', trim: true },
        callbackUrl: { type: String, default: '', trim: true },
        testMode: { type: Boolean, default: true }
      },
      upi: {
        enabled: { type: Boolean, default: false },
        vpa: { type: String, default: '', trim: true },
        merchantName: { type: String, default: '', trim: true },
        description: { type: String, default: '', trim: true }
      },
      creditCard: {
        enabled: { type: Boolean, default: false },
        provider: { type: String, default: 'razorpay', trim: true },
        note: { type: String, default: 'Credit card payments are processed via the selected gateway', trim: true }
      },
      debitCard: {
        enabled: { type: Boolean, default: false },
        provider: { type: String, default: 'razorpay', trim: true },
        note: { type: String, default: 'Debit card payments are processed via the selected gateway', trim: true }
      }
    },
    refundPolicy: {
      type: String,
      default: 'Refunds will be processed within 7-10 business days'
    },
    termsAndConditions: {
      type: String,
      default: ''
    }
  },

  // Notification Settings
  notifications: {
    enablePushNotifications: {
      type: Boolean,
      default: true
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true
    },
    enableSMSNotifications: {
      type: Boolean,
      default: false
    },
    sms: {
      provider: {
        type: String,
        default: 'twilio',
        enum: ['twilio', 'msg91', 'plivo']
      },
      accountSid: {
        type: String,
        default: '',
        trim: true
      },
      authToken: {
        type: String,
        default: ''
      },
      fromNumber: {
        type: String,
        default: '',
        trim: true
      }
    },
    notificationTypes: {
      jobAlerts: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
      applicationUpdates: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
      newJobPosted: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
      accountActivity: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
        sms: { type: Boolean, default: false }
      },
      marketing: {
        email: { type: Boolean, default: false },
        push: { type: Boolean, default: false },
        sms: { type: Boolean, default: false }
      }
    },
    adminNotifications: {
      newUserRegistration: { type: Boolean, default: true },
      newJobPosting: { type: Boolean, default: true },
      newApplication: { type: Boolean, default: false },
      systemErrors: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true }
    }
  },

  // API Keys Settings
  apiKeys: {
    // Google Maps
    googleMaps: {
      enabled: { type: Boolean, default: false },
      apiKey: { type: String, default: '', trim: true },
      note: { type: String, default: 'Used for location autocomplete and maps display' }
    },
    // OAuth - Google
    googleOAuth: {
      enabled: { type: Boolean, default: false },
      clientId: { type: String, default: '', trim: true },
      clientSecret: { type: String, default: '' },
      callbackUrl: { type: String, default: '', trim: true }
    },
    // OAuth - Facebook
    facebookOAuth: {
      enabled: { type: Boolean, default: false },
      appId: { type: String, default: '', trim: true },
      appSecret: { type: String, default: '' },
      callbackUrl: { type: String, default: '', trim: true }
    },
    // OAuth - LinkedIn
    linkedinOAuth: {
      enabled: { type: Boolean, default: false },
      clientId: { type: String, default: '', trim: true },
      clientSecret: { type: String, default: '' },
      callbackUrl: { type: String, default: '', trim: true }
    },
    // Email Login (JWT)
    emailLogin: {
      enabled: { type: Boolean, default: true },
      jwtSecret: { type: String, default: '', trim: true },
      jwtExpiresIn: { type: String, default: '7d', trim: true }
    },
    // Mobile OTP Login
    mobileOtp: {
      enabled: { type: Boolean, default: false },
      provider: { type: String, default: 'msg91', enum: ['msg91', 'twilio', 'fast2sms'] },
      apiKey: { type: String, default: '' },
      senderId: { type: String, default: '', trim: true },
      templateId: { type: String, default: '', trim: true },
      otpExpiry: { type: Number, default: 10 } // minutes
    },
    // WhatsApp API
    whatsapp: {
      enabled: { type: Boolean, default: false },
      provider: { type: String, default: 'wati', enum: ['wati', 'twilio', 'meta', 'interakt'] },
      apiKey: { type: String, default: '' },
      apiUrl: { type: String, default: '', trim: true },
      phoneNumberId: { type: String, default: '', trim: true },
      accessToken: { type: String, default: '' },
      webhookVerifyToken: { type: String, default: '', trim: true }
    },
    // Arattai API (Chat)
    arattai: {
      enabled: { type: Boolean, default: false },
      apiKey: { type: String, default: '' },
      apiUrl: { type: String, default: '', trim: true },
      appId: { type: String, default: '', trim: true },
      region: { type: String, default: 'in', trim: true }
    },
    // Firebase (Push Notifications)
    firebase: {
      enabled: { type: Boolean, default: false },
      projectId: { type: String, default: '', trim: true },
      serverKey: { type: String, default: '' },
      vapidKey: { type: String, default: '', trim: true }
    },
    // Cloudinary (Media Storage)
    cloudinary: {
      enabled: { type: Boolean, default: false },
      cloudName: { type: String, default: '', trim: true },
      apiKey: { type: String, default: '', trim: true },
      apiSecret: { type: String, default: '' }
    },
    // AWS S3
    awsS3: {
      enabled: { type: Boolean, default: false },
      accessKeyId: { type: String, default: '', trim: true },
      secretAccessKey: { type: String, default: '' },
      region: { type: String, default: 'ap-south-1', trim: true },
      bucketName: { type: String, default: '', trim: true }
    }
  },

  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Static method to get or create settings
platformSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ isActive: true });
  
  if (!settings) {
    settings = new this({});
    await settings.save();
  }
  
  return settings;
};

// Static method to update settings
platformSettingsSchema.statics.updateSettings = async function(updates, userId) {
  let settings = await this.getSettings();
  
  // Merge updates
  Object.keys(updates).forEach(key => {
    if (settings[key] && typeof settings[key] === 'object' && !Array.isArray(settings[key])) {
      settings[key] = { ...settings[key], ...updates[key] };
    } else {
      settings[key] = updates[key];
    }
  });
  
  settings.lastUpdatedBy = userId;
  settings.version += 1;
  
  await settings.save();
  return settings;
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);

