const mongoose = require('mongoose');

const jobDesignationSchema = new mongoose.Schema({
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
    enum: [
      'Entry Level', 'Mid Level', 'Senior Level', 'Executive Level', 'C-Level',
      'Technical', 'Sales', 'Management', 'Operations', 'Support', 'Healthcare', 
      'Education', 'Finance', 'Marketing', 'HR', 'Administrative', 'Consulting',
      'Analytics', 'Business Development', 'Customer Service', 'Logistics', 'Services',
      'Hospitality', 'Legal', 'Media', 'Research', 'Safety', 'Design', 'Entertainment',
      'Quality', 'Security', 'Social Services', 'Other'
    ],
    default: 'Other'
  },
  minExperience: {
    type: Number,
    default: 0
  },
  maxExperience: {
    type: Number,
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
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better performance
jobDesignationSchema.index({ category: 1 });
jobDesignationSchema.index({ isActive: 1 });

module.exports = mongoose.model('JobDesignation', jobDesignationSchema);
