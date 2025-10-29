const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-job combination
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

// Index for efficient queries
savedJobSchema.index({ user: 1, savedAt: -1 });

// Static method to save a job for a user
savedJobSchema.statics.saveJob = function(userId, jobId, notes = '', tags = []) {
  return this.findOneAndUpdate(
    { user: userId, job: jobId },
    {
      user: userId,
      job: jobId,
      notes: notes,
      tags: tags,
      savedAt: new Date(),
      isActive: true
    },
    { upsert: true, new: true }
  );
};

// Static method to unsave a job for a user
savedJobSchema.statics.unsaveJob = function(userId, jobId) {
  return this.findOneAndUpdate(
    { user: userId, job: jobId },
    { isActive: false },
    { new: true }
  );
};

// Static method to get saved jobs for a user
savedJobSchema.statics.getSavedJobs = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId, isActive: true })
    .populate({
      path: 'job',
      select: 'title company location salary employmentType jobType createdAt status',
      match: { status: 'active' }
    })
    .sort({ savedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to check if a job is saved by user
savedJobSchema.statics.isJobSaved = function(userId, jobId) {
  return this.findOne({ user: userId, job: jobId, isActive: true });
};

// Static method to get saved jobs count for a user
savedJobSchema.statics.getSavedJobsCount = function(userId) {
  return this.countDocuments({ user: userId, isActive: true });
};

module.exports = mongoose.model('SavedJob', savedJobSchema);
