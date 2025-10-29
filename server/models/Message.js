const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    originalContent: String
  },
  deleted: {
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ status: 1 });

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

// Virtual for formatted date
messageSchema.virtual('formattedDate').get(function() {
  const today = new Date();
  const messageDate = new Date(this.createdAt);
  
  if (messageDate.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
});

// Method to mark message as read by a user
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.user.toString() === userId.toString());
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    this.status = 'read';
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to check if message is read by a user
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(r => r.user.toString() === userId.toString());
};

// Method to edit message
messageSchema.methods.editMessage = function(newContent, userId) {
  if (this.sender.toString() !== userId.toString()) {
    throw new Error('Only the sender can edit the message');
  }
  
  if (!this.edited.isEdited) {
    this.edited.originalContent = this.content;
  }
  
  this.content = newContent;
  this.edited.isEdited = true;
  this.edited.editedAt = new Date();
  
  return this.save();
};

// Method to delete message
messageSchema.methods.deleteMessage = function(userId) {
  this.deleted.isDeleted = true;
  this.deleted.deletedAt = new Date();
  this.deleted.deletedBy = userId;
  
  return this.save();
};

// Static method to get messages for a conversation with pagination
messageSchema.statics.getConversationMessages = async function(conversationId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return await this.find({
    conversation: conversationId,
    'deleted.isDeleted': false
  })
  .populate('sender', 'firstName lastName profile.avatar userType employerType')
  .populate('replyTo', 'content sender')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Pre-save middleware to update conversation's last message
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Conversation = mongoose.model('Conversation');
      await Conversation.findByIdAndUpdate(this.conversation, {
        lastMessage: {
          content: this.content,
          sender: this.sender,
          timestamp: this.createdAt
        }
      });
    } catch (error) {
      console.error('Error updating conversation last message:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);
