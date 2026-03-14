const mongoose = require('mongoose');

const commentSuggestionSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['jobseeker', 'employer', 'company', 'consultancy', 'admin', 'all'],
    required: true
  },
  postType: {
    type: String,
    enum: ['job_announcement', 'company_update', 'industry_news', 'career_tips', 'event_announcement', 'general', 'all'],
    default: 'all'
  },
  suggestion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['positive', 'question', 'appreciation', 'interest', 'professional', 'casual'],
    default: 'professional'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
commentSuggestionSchema.index({ userType: 1, postType: 1, isActive: 1 });
commentSuggestionSchema.index({ category: 1, isActive: 1 });
commentSuggestionSchema.index({ usageCount: -1 });

// Static method to get suggestions for user
commentSuggestionSchema.statics.getSuggestionsForUser = async function(userType, postType = 'all', limit = 10) {
  return await this.find({
    $or: [
      { userType: userType, postType: postType },
      { userType: userType, postType: 'all' },
      { userType: 'all', postType: postType },
      { userType: 'all', postType: 'all' }
    ],
    isActive: true
  })
  .sort({ usageCount: -1, createdAt: -1 })
  .limit(limit);
};

// Method to increment usage
commentSuggestionSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

module.exports = mongoose.model('CommentSuggestion', commentSuggestionSchema);
