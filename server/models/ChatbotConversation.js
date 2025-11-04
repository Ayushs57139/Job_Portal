const mongoose = require('mongoose');

const chatbotConversationSchema = new mongoose.Schema({
  // User Information (can be guest or registered user)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Guest Information
  guestName: {
    type: String,
    trim: true,
    default: 'Guest'
  },
  guestEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  guestPhone: {
    type: String,
    trim: true
  },
  
  // Session ID for tracking conversations
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Messages in the conversation
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Conversation Status
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  
  // User Agent and Platform
  userAgent: {
    type: String
  },
  platform: {
    type: String,
    default: 'web'
  },
  
  // IP Address
  ipAddress: {
    type: String
  },
  
  // Statistics
  messageCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
// Note: sessionId already has an index from unique: true
chatbotConversationSchema.index({ userId: 1 });
chatbotConversationSchema.index({ status: 1 });
chatbotConversationSchema.index({ lastActivity: -1 });
chatbotConversationSchema.index({ 'messages.timestamp': -1 });

// Method to add a message
chatbotConversationSchema.methods.addMessage = function(sender, message) {
  this.messages.push({
    sender,
    message,
    timestamp: new Date()
  });
  this.messageCount = this.messages.length;
  this.lastActivity = new Date();
  return this.save();
};

// Method to mark messages as read
chatbotConversationSchema.methods.markAsRead = function() {
  this.messages.forEach(msg => {
    if (msg.sender === 'user' && !msg.isRead) {
      msg.isRead = true;
    }
  });
  return this.save();
};

// Method to get unread message count
chatbotConversationSchema.methods.getUnreadCount = function() {
  return this.messages.filter(msg => msg.sender === 'user' && !msg.isRead).length;
};

// Static method to get recent conversations
chatbotConversationSchema.statics.getRecentConversations = function(limit = 50) {
  return this.find({ status: 'active' })
    .populate('userId', 'firstName lastName email')
    .sort({ lastActivity: -1 })
    .limit(limit);
};

// Static method to search conversations
chatbotConversationSchema.statics.searchConversations = function(query) {
  return this.find({
    $or: [
      { guestName: { $regex: query, $options: 'i' } },
      { guestEmail: { $regex: query, $options: 'i' } },
      { guestPhone: { $regex: query, $options: 'i' } },
      { 'messages.message': { $regex: query, $options: 'i' } }
    ]
  })
  .populate('userId', 'firstName lastName email')
  .sort({ lastActivity: -1 });
};

module.exports = mongoose.model('ChatbotConversation', chatbotConversationSchema);

