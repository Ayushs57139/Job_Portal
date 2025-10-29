const mongoose = require('mongoose');

const jobTitleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Job title name is required'],
    trim: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Sales', 'Management', 'Operations', 'Support', 'Healthcare', 'Education', 'Finance', 'Marketing', 'HR', 'Other'],
    default: 'Other'
  },
  isActive: {
    type: Boolean,
    default: true
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
  }
}, {
  timestamps: true
});

// Index for text search
jobTitleSchema.index({ name: 'text' });

// Static method to search job titles
jobTitleSchema.statics.searchJobTitles = function(query, limit = 10) {
  return this.find(
    { 
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    }
  )
  .sort({ usageCount: -1, lastUsed: -1 })
  .limit(limit);
};

// Static method to add or update job title
jobTitleSchema.statics.addOrUpdateJobTitle = function(name, category = 'Other', addedBy = null) {
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

// Static method to get popular job titles
jobTitleSchema.statics.getPopularJobTitles = function(limit = 20) {
  return this.find({ isActive: true })
    .sort({ usageCount: -1, lastUsed: -1 })
    .limit(limit);
};

module.exports = mongoose.model('JobTitle', jobTitleSchema);

