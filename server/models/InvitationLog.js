const mongoose = require('mongoose');

const InvitationLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientIds: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientType'
  }],
  recipientType: {
    type: String,
    enum: ['users', 'companies', 'consultancies'],
    required: true
  },
  messageType: {
    type: String,
    enum: ['email', 'whatsapp', 'both'],
    required: true
  },
  emailSent: {
    type: Number,
    default: 0
  },
  whatsappSent: {
    type: Number,
    default: 0
  },
  failed: {
    type: Number,
    default: 0
  },
  results: [{
    recipientId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    phone: String,
    emailSuccess: Boolean,
    whatsappSuccess: Boolean,
    errors: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InvitationLog', InvitationLogSchema);
