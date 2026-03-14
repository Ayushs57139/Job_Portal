const mongoose = require('mongoose');

const jobInvitationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'viewed', 'applied', 'declined', 'expired'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500
  },
  viewedAt: {
    type: Date
  },
  respondedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
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

// Indexes for better performance
jobInvitationSchema.index({ job: 1, candidate: 1 }, { unique: true });
jobInvitationSchema.index({ candidate: 1, status: 1 });
jobInvitationSchema.index({ job: 1, status: 1 });
jobInvitationSchema.index({ createdAt: -1 });
jobInvitationSchema.index({ expiresAt: 1 });

// Instance methods
jobInvitationSchema.methods.markAsViewed = function() {
  if (this.status === 'pending') {
    this.status = 'viewed';
    this.viewedAt = new Date();
    return this.save();
  }
  return this;
};

jobInvitationSchema.methods.markAsApplied = function() {
  this.status = 'applied';
  this.respondedAt = new Date();
  return this.save();
};

jobInvitationSchema.methods.markAsDeclined = function() {
  this.status = 'declined';
  this.respondedAt = new Date();
  return this.save();
};

jobInvitationSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Static methods
jobInvitationSchema.statics.findPendingForCandidate = function(candidateId) {
  return this.find({
    candidate: candidateId,
    status: { $in: ['pending', 'viewed'] },
    expiresAt: { $gt: new Date() }
  }).populate('job', 'title company location salary type deadline');
};

jobInvitationSchema.statics.checkIfAlreadyInvited = async function(jobId, candidateId) {
  const invitation = await this.findOne({ job: jobId, candidate: candidateId });
  return !!invitation;
};

jobInvitationSchema.statics.getInvitationStats = async function(jobId) {
  const stats = await this.aggregate([
    { $match: { job: mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    pending: 0,
    viewed: 0,
    applied: 0,
    declined: 0,
    expired: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

module.exports = mongoose.model('JobInvitation', jobInvitationSchema);
