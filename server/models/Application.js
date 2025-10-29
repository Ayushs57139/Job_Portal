const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  
  // Personal Information
  fullName: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    maxlength: 100
  },
  mobileNumber: {
    type: String,
    required: true,
    maxlength: 15
  },
  whatsappNumber: {
    type: String,
    maxlength: 15
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  maritalStatus: {
    type: String,
    required: true,
    enum: ['Single', 'Married', 'Divorced', 'Widowed']
  },
  currentLocation: {
    type: String,
    required: true,
    maxlength: 100
  },

  // Professional Information
  currentJobTitle: {
    type: String,
    maxlength: 100
  },
  currentSalary: {
    type: Number
  },
  experienceLevel: {
    type: String,
    required: true
  },
  jobStatus: {
    type: String,
    required: true,
    enum: ['Working', 'Not Working', 'Internship', 'Apprenticeship']
  },
  keySkills: [{
    type: String,
    maxlength: 50
  }],
  jobProfileDescription: {
    type: String,
    required: true,
    maxlength: 2000
  },

  // Education Information
  educationLevel: {
    type: String,
    required: true,
    enum: ['No Education', 'Below 10th', '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate', 'Other']
  },
  course: {
    type: String,
    required: true,
    maxlength: 100
  },
  institution: {
    type: String,
    maxlength: 100
  },
  passingYear: {
    type: Number
  },
  percentage: {
    type: String,
    maxlength: 20
  },

  // Work Experience
  currentCompany: {
    type: String,
    maxlength: 100
  },
  industry: [{
    type: String,
    maxlength: 100
  }],
  companyType: {
    type: String,
    enum: ['Indian MNC', 'Foreign MNC', 'Govt / PSU', 'Startup', 'Unicorn', 'Corporate', 'Consultancy']
  },
  employmentType: {
    type: String,
    enum: ['Permanent', 'Temporary/Contract Job', 'Internship', 'Apprenticeship', 'Freelance', 'Trainee', 'Fresher']
  },
  currentlyWorking: {
    type: String,
    enum: ['Yes', 'No']
  },
  workStartDate: {
    type: String
  },
  workEndDate: {
    type: String
  },
  workLocation: {
    type: String,
    maxlength: 100
  },
  noticePeriod: {
    type: String,
    enum: ['Immediate Joining', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', '90 Days Plus', 'Serving Notice Period']
  },

  // Additional Information
  disabilityStatus: {
    type: String,
    enum: ['Don\'t Have Disability', 'Have Disability']
  },
  disabilityType: {
    type: String,
    enum: ['Blindness', 'Low Vision', 'Physical Disability', 'Locomotor Disability', 'Hearing Impairment', 'Speech and Language Disability', 'Other']
  },
  militaryExperience: {
    type: String,
    enum: ['Currently Serving', 'Previously Served', 'Never Served']
  },
  bikeAvailable: {
    type: String,
    enum: ['Yes', 'No', 'I Can Arrange']
  },
  drivingLicense: {
    type: String,
    enum: ['No License', 'Learning License', 'LMV License', 'Heavy Driver License', 'Crane Operator License', 'Electrical License']
  },
  assetRequirements: [{
    type: String,
    maxlength: 50
  }],

  // Location & Preferences
  currentState: {
    type: String,
    maxlength: 50
  },
  currentCity: {
    type: String,
    maxlength: 50
  },
  currentAddress: {
    type: String,
    maxlength: 200
  },
  pincode: {
    type: String,
    maxlength: 10
  },
  homeTown: {
    type: String,
    maxlength: 100
  },
  homeTownPincode: {
    type: String,
    maxlength: 10
  },
  preferredLocations: [{
    type: String,
    maxlength: 50
  }],

  // Language & Communication
  preferredLanguage: {
    type: String,
    maxlength: 50
  },
  englishFluency: {
    type: String,
    enum: ['Fluent English', 'Good English', 'Basic English', 'No English']
  },

  // Source Information
  sourceOfVisit: {
    type: String,
    maxlength: 100
  },

  // Application Status
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Additional fields for tracking
  notes: {
    type: String,
    maxlength: 1000
  },
  // Interview scheduling
  interviewScheduled: {
    type: Boolean,
    default: false
  },
  interviewDate: {
    type: Date
  },
  interviewNotes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient queries
applicationSchema.index({ user: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ user: 1, status: 1 });

// Virtual for application age
applicationSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.appliedAt) / (1000 * 60 * 60 * 24));
});

// Method to check if application is recent
applicationSchema.methods.isRecent = function() {
  return this.ageInDays <= 7;
};

// Method to get status display text
applicationSchema.methods.getStatusText = function() {
  const statusMap = {
    'applied': 'Applied',
    'reviewed': 'Under Review',
    'shortlisted': 'Shortlisted',
    'rejected': 'Not Selected',
    'hired': 'Hired'
  };
  return statusMap[this.status] || this.status;
};

// Method to get availability display text
applicationSchema.methods.getAvailabilityText = function() {
  const availabilityMap = {
    'immediately': 'Immediately',
    '1-week': '1 week',
    '2-weeks': '2 weeks',
    '1-month': '1 month',
    '2-months': '2 months',
    'negotiable': 'Negotiable'
  };
  return availabilityMap[this.availability] || this.availability;
};

// Pre-save middleware to update updatedAt
applicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Application', applicationSchema);