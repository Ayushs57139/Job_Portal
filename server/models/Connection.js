const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: 300
  },
  suggestedReply: {
    type: String,
    enum: ['accept', 'accept_with_message', 'decline_politely', 'not_interested', 'custom'],
    default: null
  },
  replyMessage: {
    type: String,
    trim: true,
    maxlength: 300
  },
  connectionType: {
    type: String,
    enum: ['professional', 'recruiter', 'colleague', 'other'],
    default: 'professional'
  },
  respondedAt: Date,
  blockedAt: Date,
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ status: 1, createdAt: -1 });

// Static method to check if connection exists
connectionSchema.statics.checkConnection = async function(userId1, userId2) {
  return await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 }
    ]
  });
};

// Static method to get mutual connections
connectionSchema.statics.getMutualConnections = async function(userId1, userId2) {
  const user1Connections = await this.find({
    $or: [
      { requester: userId1, status: 'accepted' },
      { recipient: userId1, status: 'accepted' }
    ]
  }).select('requester recipient');

  const user2Connections = await this.find({
    $or: [
      { requester: userId2, status: 'accepted' },
      { recipient: userId2, status: 'accepted' }
    ]
  }).select('requester recipient');

  const user1ConnIds = new Set();
  user1Connections.forEach(conn => {
    user1ConnIds.add(conn.requester.toString() === userId1.toString() ? conn.recipient.toString() : conn.requester.toString());
  });

  const mutualIds = [];
  user2Connections.forEach(conn => {
    const connId = conn.requester.toString() === userId2.toString() ? conn.recipient.toString() : conn.requester.toString();
    if (user1ConnIds.has(connId)) {
      mutualIds.push(connId);
    }
  });

  return mutualIds;
};

module.exports = mongoose.model('Connection', connectionSchema);
