const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followType: {
    type: String,
    enum: ['company', 'consultancy', 'user'],
    required: true
  },
  notifications: {
    jobPosts: {
      type: Boolean,
      default: true
    },
    socialUpdates: {
      type: Boolean,
      default: true
    },
    companyNews: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ follower: 1, isActive: 1 });
followSchema.index({ following: 1, isActive: 1 });
followSchema.index({ followType: 1, createdAt: -1 });

// Static method to check if following
followSchema.statics.isFollowing = async function(followerId, followingId) {
  const follow = await this.findOne({
    follower: followerId,
    following: followingId,
    isActive: true
  });
  return !!follow;
};

// Static method to get follower count
followSchema.statics.getFollowerCount = async function(userId) {
  return await this.countDocuments({
    following: userId,
    isActive: true
  });
};

// Static method to get following count
followSchema.statics.getFollowingCount = async function(userId) {
  return await this.countDocuments({
    follower: userId,
    isActive: true
  });
};

module.exports = mongoose.model('Follow', followSchema);
