const mongoose = require('mongoose');

const chatbotTemplateSchema = new mongoose.Schema({
  // Trigger keywords (comma-separated or array)
  triggerKeywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // The response text
  responseText: {
    type: String,
    required: true,
    trim: true
  },

  // Category for grouping
  category: {
    type: String,
    enum: ['greeting', 'jobs', 'application', 'resume', 'company', 'packages', 'support', 'interview', 'general', 'custom'],
    default: 'general'
  },

  // Suggested quick-reply buttons to show after this response
  suggestedReplies: [{
    type: String,
    trim: true
  }],

  // Whether to attach dynamic data (jobs, candidates, packages)
  attachDynamicData: {
    type: String,
    enum: ['none', 'jobs', 'packages', 'candidates', 'companies'],
    default: 'none'
  },

  // Priority — higher priority templates match first
  priority: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

chatbotTemplateSchema.index({ triggerKeywords: 1 });
chatbotTemplateSchema.index({ category: 1 });
chatbotTemplateSchema.index({ priority: -1 });

module.exports = mongoose.model('ChatbotTemplate', chatbotTemplateSchema);
