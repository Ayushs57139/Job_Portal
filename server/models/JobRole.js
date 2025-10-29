const mongoose = require('mongoose');

const jobRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Job role name is required'],
    trim: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    enum: [
      'Sales', 'Engineering', 'Management', 'Administration', 'Finance', 
      'Healthcare', 'Education', 'Technology', 'Operations', 'Customer Service',
      'Marketing', 'Human Resources', 'Legal', 'Manufacturing', 'Transportation',
      'Hospitality', 'Security', 'Maintenance', 'Retail', 'Other'
    ],
    default: 'Other'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usageCount: {
    type: Number,
    default: 1
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for text search
jobRoleSchema.index({ name: 'text' });

// Static method to search job roles
jobRoleSchema.statics.searchJobRoles = function(query, limit = 10) {
  return this.find(
    { 
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }
  )
  .sort({ usageCount: -1, lastUsed: -1 })
  .limit(limit);
};

// Static method to add or update job role
jobRoleSchema.statics.addOrUpdateJobRole = function(name, category = 'Other', addedBy = null) {
  return this.findOneAndUpdate(
    { name: { $regex: new RegExp(`^${name}$`, 'i') } },
    {
      $set: {
        name: name,
        category: category,
        addedBy: addedBy,
        lastUsed: new Date()
      },
      $inc: { usageCount: 1 }
    },
    { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true
    }
  );
};

// Static method to get popular job roles
jobRoleSchema.statics.getPopularJobRoles = function(limit = 20) {
  return this.find({ isActive: true, isVerified: true })
    .sort({ usageCount: -1, lastUsed: -1 })
    .limit(limit);
};

module.exports = mongoose.model('JobRole', jobRoleSchema);
