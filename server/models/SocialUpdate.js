const mongoose = require('mongoose');

const socialUpdateSchema = new mongoose.Schema({
  // Author information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorType: {
    type: String,
    enum: ['company', 'consultancy', 'admin', 'superadmin'],
    required: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  authorLogo: {
    type: String,
    default: ''
  },

  // Post content
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: 2000
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Post type and category
  postType: {
    type: String,
    enum: ['job_announcement', 'company_update', 'industry_news', 'career_tips', 'event_announcement', 'general'],
    default: 'general'
  },
  category: {
    type: String,
    trim: true,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],

  // Social media sharing
  socialSharing: {
    whatsapp: {
      enabled: {
        type: Boolean,
        default: false
      },
      groupLinks: [{
        name: String,
        link: String,
        description: String
      }],
      channelLinks: [{
        name: String,
        link: String,
        description: String
      }]
    },
    telegram: {
      enabled: {
        type: Boolean,
        default: false
      },
      groupLinks: [{
        name: String,
        link: String,
        description: String
      }],
      channelLinks: [{
        name: String,
        link: String,
        description: String
      }]
    },
    instagram: {
      enabled: {
        type: Boolean,
        default: false
      },
      accountHandle: String,
      postUrl: String
    }
  },

  // Engagement metrics
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    }
  },

  // User interactions
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sharedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    platform: {
      type: String,
      enum: ['whatsapp', 'telegram', 'instagram', 'linkedin', 'facebook', 'twitter', 'other']
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Comments
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    likes: {
      type: Number,
      default: 0
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      isEdited: {
        type: Boolean,
        default: false
      },
      editedAt: Date,
      likes: {
        type: Number,
        default: 0
      },
      likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }]
  }],

  // Post settings
  isPublished: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'followers_only', 'private'],
    default: 'public'
  },

  // Scheduling
  scheduledAt: Date,
  isScheduled: {
    type: Boolean,
    default: false
  },

  // Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNotes: String,

  // Analytics
  analytics: {
    reach: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    }
  },

  // Related content
  relatedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialUpdate'
  }],

  // SEO and metadata
  metaDescription: {
    type: String,
    maxlength: 160
  },
  metaKeywords: [{
    type: String,
    trim: true
  }],

  // Comment settings
  commentSettings: {
    candidateCommentsEnabled: {
      type: Boolean,
      default: true
    },
    employerCommentsEnabled: {
      type: Boolean,
      default: true
    }
  },

  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Indexes for better performance
socialUpdateSchema.index({ author: 1, createdAt: -1 });
socialUpdateSchema.index({ postType: 1, createdAt: -1 });
socialUpdateSchema.index({ category: 1, createdAt: -1 });
socialUpdateSchema.index({ tags: 1 });
socialUpdateSchema.index({ isPublished: 1, createdAt: -1 });
socialUpdateSchema.index({ isPinned: 1, createdAt: -1 });
socialUpdateSchema.index({ isFeatured: 1, createdAt: -1 });
socialUpdateSchema.index({ 'engagement.likes': -1 });
socialUpdateSchema.index({ 'engagement.views': -1 });
socialUpdateSchema.index({ status: 1, createdAt: -1 });

// Virtual for total engagement
socialUpdateSchema.virtual('totalEngagement').get(function() {
  return this.engagement.likes + this.engagement.shares + this.engagement.comments;
});

// Virtual for engagement rate
socialUpdateSchema.virtual('engagementRate').get(function() {
  if (this.engagement.views === 0) return 0;
  return ((this.engagement.likes + this.engagement.shares + this.engagement.comments) / this.engagement.views * 100).toFixed(2);
});

// Method to increment views
socialUpdateSchema.methods.incrementViews = function() {
  this.engagement.views += 1;
  return this.save();
};

// Method to like/unlike post
socialUpdateSchema.methods.toggleLike = async function(userId) {
  const userIndex = this.likedBy.indexOf(userId);
  
  if (userIndex > -1) {
    // Unlike
    this.likedBy.splice(userIndex, 1);
    this.engagement.likes = Math.max(0, this.engagement.likes - 1);
  } else {
    // Like
    this.likedBy.push(userId);
    this.engagement.likes += 1;
  }
  
  return this.save();
};

// Method to add comment
socialUpdateSchema.methods.addComment = async function(userId, content) {
  const comment = {
    user: userId,
    content: content.trim(),
    createdAt: new Date()
  };
  
  this.comments.push(comment);
  this.engagement.comments += 1;
  
  return this.save();
};

// Method to add reply to comment
socialUpdateSchema.methods.addReply = async function(commentId, userId, content) {
  const comment = this.comments.id(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  const reply = {
    user: userId,
    content: content.trim(),
    createdAt: new Date()
  };
  
  comment.replies.push(reply);
  return this.save();
};

// Method to share post
socialUpdateSchema.methods.addShare = async function(userId, platform) {
  const share = {
    user: userId,
    platform: platform,
    sharedAt: new Date()
  };
  
  this.sharedBy.push(share);
  this.engagement.shares += 1;
  
  return this.save();
};

// Static method to get trending posts
socialUpdateSchema.statics.getTrending = function(limit = 10, days = 7) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    isPublished: true,
    status: 'published',
    createdAt: { $gte: dateThreshold }
  })
  .sort({ 'engagement.likes': -1, 'engagement.shares': -1, 'engagement.comments': -1 })
  .limit(limit)
  .populate('author', 'firstName lastName profile.avatar userType employerType')
  .populate('comments.user', 'firstName lastName profile.avatar');
};

// Static method to get posts by category
socialUpdateSchema.statics.getByCategory = function(category, limit = 20, skip = 0) {
  return this.find({
    category: category,
    isPublished: true,
    status: 'published'
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('author', 'firstName lastName profile.avatar userType employerType')
  .populate('comments.user', 'firstName lastName profile.avatar');
};

// Static method to search posts
socialUpdateSchema.statics.searchPosts = function(query, limit = 20, skip = 0) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    $or: [
      { title: searchRegex },
      { content: searchRegex },
      { tags: { $in: [searchRegex] } },
      { category: searchRegex }
    ],
    isPublished: true,
    status: 'published'
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('author', 'firstName lastName profile.avatar userType employerType')
  .populate('comments.user', 'firstName lastName profile.avatar');
};

// Ensure virtual fields are serialized
socialUpdateSchema.set('toJSON', { virtuals: true });
socialUpdateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SocialUpdate', socialUpdateSchema);

