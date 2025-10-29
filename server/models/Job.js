const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Company Information
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Indian MNC', 'Foreign MNC', 'Govt / PSU', 'Startup', 'Unicorn', 'Corporate', 'Consultancy'],
      required: [true, 'Company type is required']
    },
    totalEmployees: {
      type: String,
      enum: ['0-10', '11-25', '26-50', '51-100', '101-200', '201-500', '500-1000', '1001-2000', '2000-3000', '3000 Above'],
      required: [true, 'Total employees count is required']
    },
    website: {
      type: String,
      default: ''
    },
    logo: {
      type: String,
      default: ''
    },
    industry: {
      type: String,
      trim: true
    }
  },

  // Job Details
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: 2500
  },
  keySkills: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  jobPostType: {
    type: String,
    enum: ['Sales', 'MS Office', 'MS Word', 'Field Sales', 'Home Loan Sales', 'HL', 'LAP', 'Java', 'React', 'Angular'],
    required: [true, 'Job post type is required']
  },
  employmentType: {
    type: String,
    enum: ['Permanent', 'Temporary/Contract Job', 'Freelance', 'Apprenticeship', 'Internship', 'NAPS', 'Trainee', 'Fresher'],
    required: [true, 'Employment type is required']
  },
  jobType: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Any'],
    required: [true, 'Job type is required']
  },
  jobModeType: {
    type: String,
    enum: ['Work From Home', 'Work From Office', 'Work From Field', 'Hybrid', 'Remote'],
    required: [true, 'Job mode type is required']
  },
  jobShiftType: {
    type: String,
    enum: ['Day Shift', 'Night Shift', 'Rotational Shift', 'Split Shift'],
    required: [true, 'Job shift type is required']
  },

  // Location Details
  location: {
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    locality: {
      type: String,
      trim: true
    },
    distanceFromLocation: {
      type: String,
      trim: true
    },
    includeWillingToRelocate: {
      type: Boolean,
      default: false
    }
  },

  // Experience & Salary
  experienceLevel: {
    type: String,
    enum: ['Fresher', 'Experienced', 'Internship', 'Apprenticeship', 'Any'],
    required: [true, 'Experience level is required']
  },
  totalExperience: {
    min: {
      type: String,
      enum: ['Fresher', '1 Month', '2 Months', '3 Months', '6 Months', '9 Months', '1 Year', '1.5 Years', '2 Years', '2.5 Years', '3 Years', '3.5 Years', '4 Years', '4.5 Years', '5 Years', '5.5 Years', '6 Years', '6.5 Years', '7 Years', '7.5 Years', '8 Years', '8.5 Years', '9 Years', '9.5 Years', '10 Years', '10.5 Years', '11 Years', '11.5 Years', '12 Years', '12.5 Years', '13 Years', '13.5 Years', '14 Years', '14.5 Years', '15 Years', '15.5 Years', '16 Years', '16.5 Years', '17 Years', '17.5 Years', '18 Years', '18.5 Years', '19 Years', '19.5 Years', '20 Years', '20.5 Years', '21 Years', '21.5 Years', '22 Years', '22.5 Years', '23 Years', '23.5 Years', '24 Years', '24.5 Years', '25 Years', '25.5 Years', '26 Years', '26.5 Years', '27 Years', '27.5 Years', '28 Years', '28.5 Years', '29 Years', '29.5 Years', '30 Years', '30.5 Years', '31 Years', '31.5 Years', '32 Years', '32.5 Years', '33 Years', '33.5 Years', '34 Years', '34.5 Years', '35 Years', '35.5 Years', '36 Years', '36 Years Plus'],
      required: [true, 'Minimum experience is required']
    },
    max: {
      type: String,
      enum: ['Fresher', '1 Month', '2 Months', '3 Months', '6 Months', '9 Months', '1 Year', '1.5 Years', '2 Years', '2.5 Years', '3 Years', '3.5 Years', '4 Years', '4.5 Years', '5 Years', '5.5 Years', '6 Years', '6.5 Years', '7 Years', '7.5 Years', '8 Years', '8.5 Years', '9 Years', '9.5 Years', '10 Years', '10.5 Years', '11 Years', '11.5 Years', '12 Years', '12.5 Years', '13 Years', '13.5 Years', '14 Years', '14.5 Years', '15 Years', '15.5 Years', '16 Years', '16.5 Years', '17 Years', '17.5 Years', '18 Years', '18.5 Years', '19 Years', '19.5 Years', '20 Years', '20.5 Years', '21 Years', '21.5 Years', '22 Years', '22.5 Years', '23 Years', '23.5 Years', '24 Years', '24.5 Years', '25 Years', '25.5 Years', '26 Years', '26.5 Years', '27 Years', '27.5 Years', '28 Years', '28.5 Years', '29 Years', '29.5 Years', '30 Years', '30.5 Years', '31 Years', '31.5 Years', '32 Years', '32.5 Years', '33 Years', '33.5 Years', '34 Years', '34.5 Years', '35 Years', '35.5 Years', '36 Years', '36 Years Plus'],
      required: [true, 'Maximum experience is required']
    }
  },
  salary: {
    min: {
      type: Number,
      required: [true, 'Minimum salary is required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum salary is required']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    hideFromCandidates: {
      type: Boolean,
      default: false
    }
  },
  additionalBenefits: [{
    type: String,
    enum: ['Office Cab/Shuttle', 'Food Allowance', 'Food Canteen', 'Subsidy Based Meals', 'Health Insurance', 'Annual Bonus', 'PF', 'ESIC', 'Petrol Allowance', 'Incentives', 'Travel Allowance (TA)', 'Daily Allowance (DA)', 'Transport Facility', 'Food/Meals', 'Tea/Coffee Break', 'Mobile Allowance', 'Internet Allowance', 'Overtime Pay', 'Joining Bonus', 'Other Benefits', 'Laptop', 'Mobile Phone', 'Flexible Working Hours', 'Weekly Payout', 'Accommodation', '5 Working Days', 'One-Way Cab', 'Two-Way Cab', 'Accidental Insurance', 'GMC Insurance', 'GPA Insurance']
  }],

  // Candidate Requirements
  gender: [{
    type: String,
    enum: ['Male', 'Female', 'Other']
  }],
  maritalStatus: [{
    type: String,
    enum: ['Single', 'Married', 'Separated', 'Widowed', 'Divorced', 'All Types']
  }],
  industry: [{
    type: String,
    trim: true
  }],
  department: [{
    type: String,
    trim: true
  }],
  jobRole: [{
    type: String,
    trim: true
  }],
  education: [{
    type: String,
    enum: ['No Education', 'Below 10th', '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate', 'Other']
  }],
  course: [{
    type: String,
    enum: ['10th Pass', 'Electrican', 'Mechanical Engineering', 'BA', 'M.Tech', 'MBA', 'Other']
  }],
  candidateIndustry: [{
    type: String,
    trim: true
  }],
  candidateAge: {
    min: {
      type: String,
      enum: ['18 Years', '19 Years', '20 Years', '21 Years', '22 Years', '23 Years', '24 Years', '25 Years', '26 Years', '27 Years', '28 Years', '29 Years', '30 Years', '31 Years', '32 Years', '33 Years', '34 Years', '35 Years', '36 Years', '37 Years', '38 Years', '39 Years', '40 Years', '41 Years', '42 Years', '43 Years', '44 Years', '45 Years', '46 Years', '47 Years', '48 Years', '49 Years', '50 Years', '51 Years', '52 Years', '53 Years', '54 Years', '55 Years', '56 Years', '57 Years', '58 Years', '59 Years', '60 Years', '60+ Years']
    },
    max: {
      type: String,
      enum: ['18 Years', '19 Years', '20 Years', '21 Years', '22 Years', '23 Years', '24 Years', '25 Years', '26 Years', '27 Years', '28 Years', '29 Years', '30 Years', '31 Years', '32 Years', '33 Years', '34 Years', '35 Years', '36 Years', '37 Years', '38 Years', '39 Years', '40 Years', '41 Years', '42 Years', '43 Years', '44 Years', '45 Years', '46 Years', '47 Years', '48 Years', '49 Years', '50 Years', '51 Years', '52 Years', '53 Years', '54 Years', '55 Years', '56 Years', '57 Years', '58 Years', '59 Years', '60 Years', '60+ Years']
    }
  },
  preferredLanguage: [{
    type: String,
    enum: ['Hindi', 'English', 'Kannada', 'Telugu', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi', 'Tamil', 'Kashmiri', 'Maithili', 'Nepali', 'Bhojpuri', 'Assamese', 'Malayalam', 'Urdu', 'Japanese', 'Russian', 'French', 'Chinese', 'German', 'Mexican', 'Vietnamese', 'Portuguese', 'Korean', 'Spanish', 'Turkish', 'Arabian', 'Filipino', 'Swedish', 'Greek', 'Latin', 'Polish', 'Thai', 'Serbian', 'Sanskrit', 'Meitei (Manipuri)', 'Santali', 'Odia']
  }],
  joiningPeriod: {
    type: String,
    enum: ['Immediate Joining', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', 'Any']
  },
  diversityHiring: [{
    type: String,
    enum: ['Man', 'Man Returning to work', 'Woman', 'Woman Returning to work', 'Ex-Army Personal', 'Differently-abled', 'Any']
  }],
  disabilityStatus: [{
    type: String,
    enum: ['Have Disability', 'Don\'t Have Disability', 'Any']
  }],
  disabilities: [{
    type: String,
    enum: ['Blindness', 'Low Vision', 'Physical Disability', 'Locomotor Disability', 'Hearing Impairment', 'Speech and Language Disability', 'Any']
  }],

  // Job Description & Vacancy
  numberOfVacancy: {
    type: Number,
    required: [true, 'Number of vacancy is required']
  },
  includeWalkinDetails: {
    type: Boolean,
    default: false
  },
  hideClientName: {
    type: Boolean,
    default: false
  },
  employerShortDetails: {
    type: String,
    trim: true
  },

  // Walk-in Details
  walkinDetails: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    duration: {
      type: Number
    },
    timing: {
      type: String
    },
    contactPersonName: {
      type: String,
      trim: true
    },
    contactPersonNumber: {
      type: String,
      trim: true
    },
    venueAddress: {
      type: String,
      trim: true
    },
    googleMapUrl: {
      type: String,
      trim: true
    }
  },

  // Job Response Methods
  jobResponseMethods: [{
    type: String,
    enum: ['Receive Applicants Responses Internally', 'Receive Applicants Responses On Email', 'Receive Applicants Responses On WhatsApp', 'Receive Applicants Responses External Website URL']
  }],
  communicationPreference: [{
    type: String,
    enum: ['Yes To My Self', 'Yes To Other Recruiter (Enter Name, Number, Email ID)', 'No I will Contact Candidates First']
  }],

  // HR/Contact Information
  hrContact: {
    name: {
      type: String,
      required: [true, 'HR contact person name is required'],
      trim: true
    },
    number: {
      type: String,
      required: [true, 'HR contact person number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'HR contact person email is required'],
      trim: true
    },
    whatsappNumber: {
      type: String,
      trim: true
    },
    timing: {
      start: {
        type: String,
        trim: true
      },
      end: {
        type: String,
        trim: true
      }
    },
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }]
  },

  // Additional Settings
  questionsForCandidates: [{
    type: String,
    enum: ['Questions', 'Single Choice', 'Multiple Choice', 'Short Answer', 'Answer In Text Only', 'Answer In Numbers Only']
  }],
  
  // Detailed Questions for Candidates
  candidateQuestions: [{
    questionId: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'short_answer', 'text_only', 'numbers_only'],
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      optionId: String,
      optionText: String,
      isCorrect: {
        type: Boolean,
        default: false
      }
    }],
    correctAnswer: {
      type: String,
      trim: true
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  collaborateWithOtherUsers: [{
    type: String,
    enum: ['Other User Can View/Edit Job', 'Receive A Daily Responce Summary', 'Receive Every New Responce', 'Enter Multple Users Email ID to Receive Responce']
  }],
  aboutClients: {
    type: String,
    trim: true
  },
  clientCompanyName: {
    type: String,
    trim: true
  },
  hideClientNameFromCandidates: {
    type: Boolean,
    default: false
  },

  // System Fields
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  applicationDeadline: {
    type: Date
  },

  // Master Data Fields
  educationLevel: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  course: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  specialization: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  jobRoles: [{
    type: mongoose.Schema.Types.Mixed
  }],
  industries: [{
    type: mongoose.Schema.Types.Mixed
  }],
  subIndustries: [{
    type: mongoose.Schema.Types.Mixed
  }],
  departments: [{
    type: mongoose.Schema.Types.Mixed
  }],
  subDepartments: [{
    type: mongoose.Schema.Types.Mixed
  }],
  jobTitles: [{
    type: mongoose.Schema.Types.Mixed
  }],
  keySkills: [{
    type: mongoose.Schema.Types.Mixed
  }],

  // Google Job Post Integration
  enableGoogleJobPost: {
    type: Boolean,
    default: false
  },
  googleJobPostStatus: {
    type: String,
    enum: ['pending', 'posted', 'failed', 'not_enabled'],
    default: 'not_enabled'
  },
  googleJobPostId: {
    type: String,
    trim: true
  },
  googleJobPostUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({
  title: 'text',
  description: 'text',
  'company.name': 'text',
  'location.city': 'text',
  'location.state': 'text',
  skills: 'text'
});

// Virtual for formatted salary
jobSchema.virtual('formattedSalary').get(function() {
  const { min, max, currency } = this.salary;
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
});

// Virtual for location string
jobSchema.virtual('locationString').get(function() {
  const { city, state, country, isRemote } = this.location;
  if (isRemote) return 'Remote';
  return `${city}, ${state}, ${country}`;
});

module.exports = mongoose.model('Job', jobSchema);
