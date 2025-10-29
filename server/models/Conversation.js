const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['jobseeker', 'employer', 'admin', 'superadmin'],
      required: true
    },
    employerType: {
      type: String,
      enum: ['company', 'consultancy'],
      required: function() {
        return this.userType === 'employer';
      }
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  conversationType: {
    type: String,
    enum: ['jobseeker_employer', 'jobseeker_support', 'employer_support', 'admin_support'],
    required: true
  },
  subject: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  metadata: {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    relatedTo: {
      type: String,
      enum: ['job_application', 'general_inquiry', 'support_request', 'business_inquiry']
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
conversationSchema.index({ 'participants.user': 1, status: 1 });
conversationSchema.index({ conversationType: 1, status: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });

// Virtual for getting conversation title
conversationSchema.virtual('title').get(function() {
  if (this.subject) return this.subject;
  
  const participantNames = this.participants.map(p => p.user?.firstName + ' ' + p.user?.lastName).filter(Boolean);
  return participantNames.join(', ') || 'Conversation';
});

// Method to get other participants (excluding current user)
conversationSchema.methods.getOtherParticipants = function(currentUserId) {
  return this.participants.filter(p => p.user.toString() !== currentUserId.toString());
};

// Method to mark messages as read for a user
conversationSchema.methods.markAsRead = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastSeen = new Date();
  }
  return this.save();
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnread = function(userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  return this.save();
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreateConversation = async function(participants, conversationType, options = {}) {
  // Sort participants by user ID for consistent lookup
  const sortedParticipants = participants.sort((a, b) => a.user.toString().localeCompare(b.user.toString()));
  
  // Try to find existing conversation
  let conversation = await this.findOne({
    'participants.user': { $all: participants.map(p => p.user) },
    'participants': { $size: participants.length },
    status: 'active'
  });

  if (!conversation) {
    // Create new conversation
    conversation = new this({
      participants: sortedParticipants,
      conversationType,
      subject: options.subject,
      metadata: options.metadata || {}
    });
    await conversation.save();
  }

  return conversation;
};

module.exports = mongoose.model('Conversation', conversationSchema);
