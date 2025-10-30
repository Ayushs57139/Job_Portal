const mongoose = require('mongoose');

const themeSettingsSchema = new mongoose.Schema({
  // Theme Identification
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Default Theme'
  },
  description: {
    type: String,
    trim: true
  },
  
  // Color Palette
  colors: {
    primary: {
      type: String,
      default: '#1E88E5',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    primaryLight: {
      type: String,
      default: '#E3F2FD',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    primaryDark: {
      type: String,
      default: '#1565C0',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    secondary: {
      type: String,
      default: '#FF6B35',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    secondaryLight: {
      type: String,
      default: '#FFE5DB',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    success: {
      type: String,
      default: '#4CAF50',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    successLight: {
      type: String,
      default: '#E8F5E9',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    error: {
      type: String,
      default: '#F44336',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    errorLight: {
      type: String,
      default: '#FFEBEE',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    warning: {
      type: String,
      default: '#FF9800',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    warningLight: {
      type: String,
      default: '#FFF3E0',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    info: {
      type: String,
      default: '#2196F3',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    infoLight: {
      type: String,
      default: '#E3F2FD',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    background: {
      type: String,
      default: '#F5F5F5',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    white: {
      type: String,
      default: '#FFFFFF',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    black: {
      type: String,
      default: '#000000',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    text: {
      type: String,
      default: '#333333',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    textSecondary: {
      type: String,
      default: '#666666',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    textLight: {
      type: String,
      default: '#999999',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    border: {
      type: String,
      default: '#E0E0E0',
      match: /^#[0-9A-Fa-f]{6}$/
    },
    divider: {
      type: String,
      default: '#EEEEEE',
      match: /^#[0-9A-Fa-f]{6}$/
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      type: String,
      default: 'System'
    },
    fontSize: {
      base: { type: Number, default: 14 },
      small: { type: Number, default: 12 },
      large: { type: Number, default: 16 },
      h1: { type: Number, default: 32 },
      h2: { type: Number, default: 28 },
      h3: { type: Number, default: 24 },
      h4: { type: Number, default: 20 },
      h5: { type: Number, default: 18 },
      h6: { type: Number, default: 16 }
    }
  },
  
  // Spacing
  spacing: {
    xs: { type: Number, default: 4 },
    sm: { type: Number, default: 8 },
    md: { type: Number, default: 16 },
    lg: { type: Number, default: 24 },
    xl: { type: Number, default: 32 },
    xxl: { type: Number, default: 48 }
  },
  
  // Border Radius
  borderRadius: {
    sm: { type: Number, default: 4 },
    md: { type: Number, default: 8 },
    lg: { type: Number, default: 12 },
    xl: { type: Number, default: 16 },
    full: { type: Number, default: 9999 }
  },
  
  // Shadows
  shadows: {
    sm: {
      type: String,
      default: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },
    md: {
      type: String,
      default: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    lg: {
      type: String,
      default: '0 10px 15px rgba(0, 0, 0, 0.1)'
    },
    xl: {
      type: String,
      default: '0 20px 25px rgba(0, 0, 0, 0.15)'
    }
  },
  
  // Branding Assets
  branding: {
    logo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebsiteLogo'
    },
    favicon: {
      type: String
    },
    appleTouchIcon: {
      type: String
    },
    ogImage: {
      type: String
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes
themeSettingsSchema.index({ isActive: 1, isDefault: 1 });
themeSettingsSchema.index({ createdBy: 1 });

// Static method to get active theme
themeSettingsSchema.statics.getActiveTheme = async function() {
  try {
    let theme = await this.findOne({ isActive: true });
    if (!theme) {
      // Create default theme if none exists
      theme = new this({
        name: 'Default Theme',
        isActive: true,
        isDefault: true,
        createdBy: null
      });
      await theme.save();
    }
    return theme;
  } catch (error) {
    console.error('Error getting active theme:', error);
    return null;
  }
};

// Instance method to activate theme
themeSettingsSchema.methods.activate = async function() {
  // Deactivate all other themes
  await this.constructor.updateMany({}, { isActive: false });
  // Activate this theme
  this.isActive = true;
  return this.save();
};

module.exports = mongoose.model('ThemeSettings', themeSettingsSchema);

