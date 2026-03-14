const mongoose = require('mongoose');

const jobEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  eventType: {
    type: String,
    enum: ['job_fair', 'recruitment_drive', 'career_workshop', 'networking_event', 'campus_placement', 'webinar', 'other'],
    default: 'job_fair'
  },
  
  // Date & Time
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  startTime: {
    type: String,
    default: '09:00'
  },
  endTime: {
    type: String,
    default: '17:00'
  },
  
  // Location
  venue: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  
  // Organizer
  organizerType: {
    type: String,
    enum: ['company', 'consultancy', 'admin'],
    required: [true, 'Organizer type is required']
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'organizerType'
  },
  organizerName: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true
  },
  
  // Contact
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // More lenient email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  contactPhone: {
    type: String,
    trim: true
  },
  
  // Registration
  registrationRequired: {
    type: Boolean,
    default: true
  },
  registrationDeadline: {
    type: Date
  },
  maxParticipants: {
    type: Number,
    default: 0, // 0 means unlimited
    min: [0, 'Max participants cannot be negative']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Virtual Event
  isVirtual: {
    type: Boolean,
    default: false
  },
  eventLink: {
    type: String,
    trim: true
  },
  
  // Media
  bannerImage: {
    type: String,
    trim: true
  },
  gallery: [{
    type: String,
    trim: true
  }],
  
  // Additional Info
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'closed', 'cancelled', 'completed'],
    default: 'active'
  },
  
  // Metadata
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  registrations: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
jobEventSchema.index({ startDate: 1, status: 1 });
jobEventSchema.index({ organizerType: 1, status: 1 });
jobEventSchema.index({ city: 1, status: 1 });
jobEventSchema.index({ tags: 1 });
jobEventSchema.index({ featured: 1, status: 1 });

// Virtual field for computed status based on dates
jobEventSchema.virtual('computedStatus').get(function() {
  const now = new Date();
  
  // If manually set to cancelled or closed, return that
  if (this.status === 'cancelled' || this.status === 'closed') {
    return this.status;
  }
  
  // Calculate based on dates
  if (now < this.startDate) {
    return 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    return 'ongoing';
  } else {
    return 'completed';
  }
});

// Virtual field to check if registration is open
jobEventSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.registrationRequired) return false;
  if (this.status !== 'active') return false;
  
  const now = new Date();
  if (this.registrationDeadline && now > this.registrationDeadline) return false;
  if (this.maxParticipants > 0 && this.currentParticipants >= this.maxParticipants) return false;
  if (now > this.startDate) return false;
  
  return true;
});

// Pre-save middleware to validate dates
jobEventSchema.pre('save', function(next) {
  if (this.registrationDeadline && this.registrationDeadline > this.startDate) {
    return next(new Error('Registration deadline must be before event start date'));
  }
  next();
});

// Method to increment views
jobEventSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save();
};

// Method to increment registrations
jobEventSchema.methods.incrementRegistrations = async function() {
  this.registrations += 1;
  this.currentParticipants += 1;
  return await this.save();
};

// Method to decrement registrations
jobEventSchema.methods.decrementRegistrations = async function() {
  if (this.registrations > 0) this.registrations -= 1;
  if (this.currentParticipants > 0) this.currentParticipants -= 1;
  return await this.save();
};

// Static method to get upcoming events
jobEventSchema.statics.getUpcoming = function(limit = 10) {
  const now = new Date();
  return this.find({
    startDate: { $gt: now },
    status: 'active'
  })
    .sort({ startDate: 1 })
    .limit(limit);
};

// Static method to get featured events
jobEventSchema.statics.getFeatured = function() {
  return this.find({
    featured: true,
    status: 'active'
  })
    .sort({ startDate: 1 })
    .limit(6);
};

const JobEvent = mongoose.model('JobEvent', jobEventSchema);

module.exports = JobEvent;
