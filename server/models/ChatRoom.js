const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  roomType: {
    type: String,
    enum: ['support', 'general', 'job_specific', 'company_wide', 'consultancy_wide'],
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowFileUploads: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB in bytes
    },
    allowedFileTypes: [{
      type: String
    }],
    messageRetentionDays: {
      type: Number,
      default: 30
    }
  },
  metadata: {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    consultancyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatRoomSchema.index({ 'participants.user': 1, isActive: 1 });
chatRoomSchema.index({ roomType: 1, isActive: 1 });
chatRoomSchema.index({ isPublic: 1, isActive: 1 });

// Virtual for participant count
chatRoomSchema.virtual('participantCount').get(function() {
  return this.participants.filter(p => p.isActive).length;
});

// Method to add participant
chatRoomSchema.methods.addParticipant = function(userId, role = 'member') {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  
  if (existingParticipant) {
    existingParticipant.isActive = true;
    existingParticipant.lastSeen = new Date();
  } else {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
      lastSeen: new Date(),
      isActive: true
    });
  }
  
  return this.save();
};

// Method to remove participant
chatRoomSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.isActive = false;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to update last seen
chatRoomSchema.methods.updateLastSeen = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastSeen = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to check if user is participant
chatRoomSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString() && p.isActive);
};

// Method to get user role in room
chatRoomSchema.methods.getUserRole = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString() && p.isActive);
  return participant ? participant.role : null;
};

// Static method to find rooms for user
chatRoomSchema.statics.findRoomsForUser = async function(userId, userType, employerType) {
  const query = {
    'participants.user': userId,
    'participants.isActive': true,
    isActive: true
  };

  // Add room type filters based on user type
  if (userType === 'jobseeker') {
    query.roomType = { $in: ['support', 'general'] };
  } else if (userType === 'employer') {
    if (employerType === 'company') {
      query.$or = [
        { roomType: 'support' },
        { roomType: 'company_wide' },
        { 'metadata.companyId': userId }
      ];
    } else if (employerType === 'consultancy') {
      query.$or = [
        { roomType: 'support' },
        { roomType: 'consultancy_wide' },
        { 'metadata.consultancyId': userId }
      ];
    }
  } else if (userType === 'admin' || userType === 'superadmin') {
    // Admins can access all rooms
  }

  return await this.find(query)
    .populate('participants.user', 'firstName lastName profile.avatar userType employerType')
    .populate('createdBy', 'firstName lastName profile.avatar')
    .sort({ updatedAt: -1 });
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
