const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  period: {
    type: String,
    required: true,
    enum: ['days', 'months', 'years']
  },
  periodValue: {
    type: Number,
    required: true,
    min: 1
  },
  packageType: {
    type: String,
    required: true,
    enum: ['employer', 'candidate']
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    included: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  gstApplicable: {
    type: Boolean,
    default: true
  },
  supportIncluded: {
    type: Boolean,
    default: false
  },
  supportDetails: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
packageSchema.index({ packageType: 1, isActive: 1, displayOrder: 1 });
packageSchema.index({ isFeatured: 1, isActive: 1 });

// Virtual for formatted price
packageSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toLocaleString('en-IN')}`;
});

// Virtual for period display
packageSchema.virtual('periodDisplay').get(function() {
  if (this.periodValue === 1) {
    return this.period.slice(0, -1); // Remove 's' from days/months/years
  }
  return `${this.periodValue} ${this.period}`;
});

// Method to toggle active status
packageSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Method to toggle featured status
packageSchema.methods.toggleFeatured = function() {
  this.isFeatured = !this.isFeatured;
  return this.save();
};

// Static method to get active packages by type
packageSchema.statics.getActivePackages = function(packageType) {
  return this.find({ 
    packageType: packageType, 
    isActive: true 
  }).sort({ displayOrder: 1, createdAt: 1 });
};

// Static method to get featured packages
packageSchema.statics.getFeaturedPackages = function(packageType) {
  return this.find({ 
    packageType: packageType, 
    isActive: true, 
    isFeatured: true 
  }).sort({ displayOrder: 1, createdAt: 1 });
};

module.exports = mongoose.model('Package', packageSchema);
