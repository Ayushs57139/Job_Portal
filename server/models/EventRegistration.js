const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobEvent',
    required: [true, 'Event ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Participant Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  // Additional Info
  company: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  resume: {
    type: String,
    trim: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'attended', 'cancelled'],
    default: 'registered'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  confirmationSent: {
    type: Boolean,
    default: false
  },
  attended: {
    type: Boolean,
    default: false
  },
  
  // Additional fields
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
eventRegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
eventRegistrationSchema.index({ eventId: 1, status: 1 });
eventRegistrationSchema.index({ userId: 1 });

// Pre-save middleware to check for duplicate registration
eventRegistrationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingRegistration = await this.constructor.findOne({
      eventId: this.eventId,
      email: this.email,
      status: { $ne: 'cancelled' }
    });
    
    if (existingRegistration) {
      return next(new Error('You have already registered for this event'));
    }
  }
  next();
});

// Method to mark as attended
eventRegistrationSchema.methods.markAttended = async function() {
  this.attended = true;
  this.status = 'attended';
  return await this.save();
};

// Method to cancel registration
eventRegistrationSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  return await this.save();
};

// Method to confirm registration
eventRegistrationSchema.methods.confirm = async function() {
  this.status = 'confirmed';
  this.confirmationSent = true;
  return await this.save();
};

const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);

module.exports = EventRegistration;
