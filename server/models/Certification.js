const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Certification name is required'],
    trim: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Professional', 'Language', 'Management', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true
  },
  provider: {
    type: String,
    trim: true
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
certificationSchema.index({ name: 'text', description: 'text' });

// Static method to search certifications
certificationSchema.statics.searchCertifications = function(query, limit = 10) {
  return this.find(
    { 
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { provider: { $regex: query, $options: 'i' } }
      ]
    }
  )
  .sort({ usageCount: -1, lastUsed: -1 })
  .limit(limit);
};

// Static method to add or update certification
certificationSchema.statics.addOrUpdateCertification = function(name, category = 'Other', provider = null, addedBy = null) {
  return this.findOneAndUpdate(
    { name: { $regex: new RegExp(`^${name}$`, 'i') } },
    {
      $set: {
        name: name,
        category: category,
        provider: provider,
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

module.exports = mongoose.model('Certification', certificationSchema);

