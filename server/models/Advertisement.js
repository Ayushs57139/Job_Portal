const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Advertisement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Advertisement type is required'],
    enum: ['banner', 'sidebar', 'footer', 'popup', 'inline', 'adsense', 'admob'],
    default: 'banner'
  },
  position: {
    type: String,
    required: [true, 'Advertisement position is required'],
    enum: ['header', 'sidebar-left', 'sidebar-right', 'footer', 'content-top', 'content-bottom', 'content-middle', 'popup', 'mobile-banner', 'mobile-interstitial'],
    default: 'header'
  },
  content: {
    // For custom HTML ads
    html: {
      type: String,
      trim: true
    },
    // For image ads
    imageUrl: {
      type: String,
      trim: true
    },
    imageAlt: {
      type: String,
      trim: true
    },
    // For text ads
    text: {
      type: String,
      trim: true
    },
    // For link ads
    linkUrl: {
      type: String,
      trim: true
    },
    linkText: {
      type: String,
      trim: true
    }
  },
  // Google AdSense specific fields
  adsense: {
    adClient: {
      type: String,
      trim: true
    },
    adSlot: {
      type: String,
      trim: true
    },
    adFormat: {
      type: String,
      enum: ['auto', 'rectangle', 'vertical', 'horizontal'],
      default: 'auto'
    },
    adStyle: {
      type: String,
      trim: true
    }
  },
  // AdMob specific fields
  admob: {
    adUnitId: {
      type: String,
      trim: true
    },
    adSize: {
      type: String,
      enum: ['banner', 'large-banner', 'medium-rectangle', 'full-banner', 'leaderboard', 'smart-banner'],
      default: 'banner'
    }
  },
  // Display settings
  displaySettings: {
    width: {
      type: Number,
      min: 1,
      max: 2000
    },
    height: {
      type: Number,
      min: 1,
      max: 2000
    },
    backgroundColor: {
      type: String,
      trim: true,
      default: '#ffffff'
    },
    borderColor: {
      type: String,
      trim: true,
      default: '#cccccc'
    },
    borderRadius: {
      type: Number,
      min: 0,
      max: 50,
      default: 0
    },
    margin: {
      top: { type: Number, default: 0 },
      right: { type: Number, default: 0 },
      bottom: { type: Number, default: 0 },
      left: { type: Number, default: 0 }
    },
    padding: {
      top: { type: Number, default: 0 },
      right: { type: Number, default: 0 },
      bottom: { type: Number, default: 0 },
      left: { type: Number, default: 0 }
    }
  },
  // Targeting settings
  targeting: {
    pages: [{
      type: String,
      enum: ['home', 'jobs', 'companies', 'login', 'register', 'dashboard', 'profile', 'all']
    }],
    userTypes: [{
      type: String,
      enum: ['jobseeker', 'employer', 'consultancy', 'all']
    }],
    devices: [{
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'all']
    }],
    locations: [{
      type: String,
      trim: true
    }],
    industries: [{
      type: String,
      trim: true
    }]
  },
  // Scheduling
  schedule: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  // Performance tracking
  performance: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  // Status and settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'paused', 'draft'],
    default: 'draft'
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
advertisementSchema.index({ type: 1, position: 1 });
advertisementSchema.index({ status: 1, isActive: 1 });
advertisementSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
advertisementSchema.index({ 'targeting.pages': 1 });
advertisementSchema.index({ priority: -1 });

// Virtual for click-through rate
advertisementSchema.virtual('ctr').get(function() {
  if (this.performance.impressions === 0) return 0;
  return (this.performance.clicks / this.performance.impressions * 100).toFixed(2);
});

// Method to check if ad should be displayed
advertisementSchema.methods.shouldDisplay = function(userType, page, device) {
  // Check if ad is active and within schedule
  if (!this.isActive || this.status !== 'active') return false;
  
  const now = new Date();
  if (this.schedule.startDate && now < this.schedule.startDate) return false;
  if (this.schedule.endDate && now > this.schedule.endDate) return false;
  
  // Check targeting
  if (this.targeting.pages.length > 0 && !this.targeting.pages.includes('all') && !this.targeting.pages.includes(page)) {
    return false;
  }
  
  if (this.targeting.userTypes.length > 0 && !this.targeting.userTypes.includes('all') && !this.targeting.userTypes.includes(userType)) {
    return false;
  }
  
  if (this.targeting.devices.length > 0 && !this.targeting.devices.includes('all') && !this.targeting.devices.includes(device)) {
    return false;
  }
  
  return true;
};

// Method to record impression
advertisementSchema.methods.recordImpression = function() {
  this.performance.impressions += 1;
  return this.save();
};

// Method to record click
advertisementSchema.methods.recordClick = function() {
  this.performance.clicks += 1;
  return this.save();
};

// Pre-save middleware to update lastModifiedBy
advertisementSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // You might want to get this from context
  }
  next();
});

module.exports = mongoose.model('Advertisement', advertisementSchema);
