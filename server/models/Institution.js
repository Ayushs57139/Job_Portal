const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['University', 'College', 'Institute', 'School', 'Academy', 'Other'],
    default: 'University'
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    }
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
institutionSchema.index({ name: 'text' });

// Static method to search institutions
institutionSchema.statics.searchInstitutions = function(query, limit = 10) {
  return this.find(
    { 
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'location.city': { $regex: query, $options: 'i' } },
        { 'location.state': { $regex: query, $options: 'i' } }
      ]
    }
  )
  .sort({ usageCount: -1, lastUsed: -1 })
  .limit(limit);
};

// Static method to add or update institution
institutionSchema.statics.addOrUpdateInstitution = function(name, type = 'University', location = {}, addedBy = null) {
  return this.findOneAndUpdate(
    { name: { $regex: new RegExp(`^${name}$`, 'i') } },
    {
      $set: {
        name: name,
        type: type,
        location: location,
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

module.exports = mongoose.model('Institution', institutionSchema);
