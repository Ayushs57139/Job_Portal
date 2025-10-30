const mongoose = require('mongoose');

const homepageConfigSchema = new mongoose.Schema({
  // Hero Section
  hero: {
    title: {
      type: String,
      default: 'Find your dream job now'
    },
    subtitle: {
      type: String,
      default: '5 lakh+ jobs for you to explore'
    },
    showSearchBar: {
      type: Boolean,
      default: true
    },
    popularSearches: [{
      text: String,
      enabled: Boolean
    }]
  },

  // Banners/Slides
  banners: [{
    title: String,
    description: String,
    imageUrl: String,
    buttonText: String,
    buttonLink: String,
    backgroundColor: String,
    textColor: String,
    order: Number,
    enabled: Boolean
  }],

  // Sections Visibility
  sections: {
    latestJobs: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Latest Jobs to Apply' },
      subtitle: { type: String, default: 'Discover the newest opportunities from top companies' },
      limit: { type: Number, default: 6 }
    },
    topCompanies: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Top Companies Hiring Right Now' },
      subtitle: { type: String, default: 'Join thousands of professionals at leading companies' },
      limit: { type: Number, default: 6 }
    },
    careerBlogs: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Career Insights & Tips' },
      subtitle: { type: String, default: 'Stay updated with the latest career advice and industry trends' },
      limit: { type: Number, default: 6 }
    },
    resumeCTA: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Need help with your resume?' },
      subtitle: { type: String, default: 'Get professional assistance to create a standout resume' },
      buttonText: { type: String, default: 'Build Resume' }
    }
  },

  // Statistics
  stats: {
    totalJobs: {
      display: { type: String, default: '5 lakh+' },
      enabled: { type: Boolean, default: true }
    },
    totalCompanies: {
      display: { type: String, default: '10,000+' },
      enabled: { type: Boolean, default: true }
    },
    totalApplicants: {
      display: { type: String, default: '1 million+' },
      enabled: { type: Boolean, default: true }
    }
  },

  // Meta Information
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one active config exists
homepageConfigSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

// Static method to get active config
homepageConfigSchema.statics.getActiveConfig = async function() {
  let config = await this.findOne({ isActive: true });
  if (!config) {
    // Create default config if none exists
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('HomepageConfig', homepageConfigSchema);

