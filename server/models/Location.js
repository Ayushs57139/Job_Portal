const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  district: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'India'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Full formatted location for easy searching
  fullLocation: {
    type: String,
    index: true
  },
  // Normalized versions for case-insensitive search
  districtLower: {
    type: String,
    index: true
  },
  cityLower: {
    type: String,
    index: true
  },
  stateLower: {
    type: String,
    index: true
  },
  countryLower: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for unique locations
LocationSchema.index({ districtLower: 1, cityLower: 1, stateLower: 1, countryLower: 1 }, { unique: true });

// Pre-save middleware to set normalized fields and full location
LocationSchema.pre('save', function(next) {
  this.districtLower = this.district.toLowerCase();
  this.cityLower = this.city.toLowerCase();
  this.stateLower = this.state.toLowerCase();
  this.countryLower = this.country.toLowerCase();
  this.fullLocation = `${this.district}, ${this.city}, ${this.state}, ${this.country}`;
  this.updatedAt = Date.now();
  next();
});

// Method to get formatted location
LocationSchema.methods.getFormattedLocation = function() {
  return `${this.district}, ${this.city}, ${this.state}, ${this.country}`;
};

module.exports = mongoose.model('Location', LocationSchema);
