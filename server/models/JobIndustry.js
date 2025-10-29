const mongoose = require('mongoose');

const jobIndustrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Education', 'Retail', 'Other'],
    default: 'Other'
  },
  mainIndustry: {
    type: String,
    trim: true
  },
  subIndustries: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
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

// Index for better performance
jobIndustrySchema.index({ isActive: 1 });
jobIndustrySchema.index({ mainIndustry: 1 });
jobIndustrySchema.index({ subIndustries: 1 });

module.exports = mongoose.model('JobIndustry', jobIndustrySchema);
