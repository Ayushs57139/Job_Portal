const mongoose = require('mongoose');

const websiteLogoSchema = new mongoose.Schema({
  // Logo Configuration
  logoType: {
    type: String,
    enum: ['text', 'image', 'combined'],
    default: 'text',
    required: true
  },
  
  // Text Logo Configuration
  textLogo: {
    primaryText: {
      type: String,
      default: 'Freejob',
      trim: true
    },
    secondaryText: {
      type: String,
      default: 'wala',
      trim: true
    },
    primaryColor: {
      type: String,
      default: '#1E88E5',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    secondaryColor: {
      type: String,
      default: '#ff6b35',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    tertiaryColor: {
      type: String,
      default: '#333'
    },
    fontSize: {
      type: Number,
      default: 24,
      min: 12,
      max: 48
    },
    fontWeight: {
      type: String,
      enum: ['normal', 'bold', 'bolder', 'lighter'],
      default: 'bold'
    },
    fontFamily: {
      type: String,
      default: 'inherit'
    },
    showSwoosh: {
      type: Boolean,
      default: true
    },
    swooshColor: {
      type: String,
      default: 'linear-gradient(90deg, #1E88E5, #ff6b35)'
    }
  },
  
  // Image Logo Configuration
  imageLogo: {
    url: {
      type: String,
      trim: true
    },
    altText: {
      type: String,
      default: 'Website Logo',
      trim: true
    },
    width: {
      type: Number,
      default: 40,
      min: 20,
      max: 200
    },
    height: {
      type: Number,
      default: 40,
      min: 20,
      max: 200
    },
    borderRadius: {
      type: Number,
      default: 8,
      min: 0,
      max: 50
    }
  },
  
  // Combined Logo Configuration (text + image)
  combinedLogo: {
    imageUrl: {
      type: String,
      trim: true
    },
    imagePosition: {
      type: String,
      enum: ['left', 'right', 'top', 'bottom'],
      default: 'left'
    },
    imageSize: {
      width: {
        type: Number,
        default: 30,
        min: 15,
        max: 100
      },
      height: {
        type: Number,
        default: 30,
        min: 15,
        max: 100
      }
    },
    textSpacing: {
      type: Number,
      default: 10,
      min: 0,
      max: 50
    }
  },
  
  // Logo Variants for different contexts
  variants: {
    header: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    footer: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    favicon: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    mobile: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    admin: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  
  // Status and Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Default Logo'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // File Information
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebsiteLogo'
  },
  
  // Usage Statistics
  usageStats: {
    totalViews: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes
websiteLogoSchema.index({ isActive: 1, isDefault: 1 });
websiteLogoSchema.index({ uploadedBy: 1 });
websiteLogoSchema.index({ createdAt: -1 });

// Static method to get active logo
websiteLogoSchema.statics.getActiveLogo = async function() {
  try {
    const logo = await this.findOne({ isActive: true, isDefault: true });
    return logo;
  } catch (error) {
    console.error('Error getting active logo:', error);
    return null;
  }
};

// Static method to get logo by variant
websiteLogoSchema.statics.getLogoByVariant = async function(variant = 'header') {
  try {
    const logo = await this.findOne({ isActive: true });
    if (!logo) return null;
    
    // If specific variant exists, use it, otherwise use default
    const variantConfig = logo.variants[variant] || logo;
    return {
      ...logo.toObject(),
      currentVariant: variantConfig
    };
  } catch (error) {
    console.error('Error getting logo by variant:', error);
    return null;
  }
};

// Instance method to update usage stats
websiteLogoSchema.methods.updateUsageStats = function() {
  this.usageStats.totalViews += 1;
  this.usageStats.lastUsed = new Date();
  return this.save();
};

// Instance method to create variant
websiteLogoSchema.methods.createVariant = function(variantName, config) {
  this.variants[variantName] = {
    ...config,
    createdAt: new Date(),
    createdBy: this.uploadedBy
  };
  return this.save();
};

// Pre-save middleware to handle version control
websiteLogoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

module.exports = mongoose.model('WebsiteLogo', websiteLogoSchema);
