const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    
    // Personal Information
    personalInfo: {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', 'Any'],
            required: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true
        },
        whatsappUpdates: {
            type: Boolean,
            default: false
        },
        whatsappAvailable: {
            type: Boolean,
            default: false
        },
        profilePicture: {
            type: String,
            default: null
        },
        currentCity: {
            type: String,
            trim: true
        },
        pincode: {
            type: String,
            trim: true
        },
        disabilityStatus: {
            type: String,
            enum: ['Have Disability', 'Don\'t Have Disability', 'Any']
        },
        disabilities: [{
            type: String,
            enum: ['Blindness', 'Low Vision', 'Physical Disability', 'Locomotor Disability', 'Hearing Impairment', 'Speech and Language Disability', 'Any']
        }],
        diversityHiring: {
            type: String,
            enum: ['Man', 'Man Returning to work', 'Woman', 'Woman Returning to work', 'Ex-Army Personal', 'Differently-abled', 'Any']
        },
        category: {
            type: String,
            enum: ['Scheduled Caste - SC', 'Scheduled Tribe - ST', 'OBC - Creamy', 'OBC – Non Creamy', 'General', 'EWS', 'Other', 'Any']
        },
        age: {
            type: Number
        }
    },
    
    // Education Information (Array to support multiple education records)
    education: [{
        educationLevel: {
            type: String,
            enum: ['No Education', 'Below 10th', '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate', 'PPG', 'Doctorate', 'Other'],
            required: true
        },
        degree: {
            type: String,
            trim: true
        },
        institution: {
            type: String,
            trim: true
        },
        specialization: {
            type: String,
            trim: true
        },
        educationStatus: {
            type: String,
            enum: ['Pursuing / Running', 'Pass Out / Completed', 'No Education'],
            default: 'Pass Out / Completed'
        },
        startDate: {
            type: String, // MM-YYYY format
            trim: true
        },
        endDate: {
            type: String, // MM-YYYY format
            trim: true
        },
        educationType: {
            type: String,
            enum: ['Full Time', 'Part Time', 'Correspondence', 'Any']
        },
        educationMedium: {
            type: String,
            enum: ['Hindi', 'English', 'Kannada', 'Telugu', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi', 'Tamil', 'Kashmiri', 'Maithili', 'Nepali', 'Bhojpuri', 'Assamese', 'Malayalam', 'Urdu', 'Sanskrit', 'Meitei (Manipuri)', 'Santali', 'Odia', 'Any']
        },
        marksType: {
            type: String,
            enum: ['Grade', 'Percentage', 'Division', 'CGPA', 'Any']
        },
        marksValue: {
            type: String,
            trim: true
        },
        graduationYear: {
            type: Number
        },
        cgpa: {
            type: Number,
            min: 0,
            max: 10
        },
        percentage: {
            type: Number,
            min: 0,
            max: 100
        }
    }],
    
    // Professional Information
    professional: {
        experience: {
            type: String,
            required: true
        },
        experienceLevel: {
            type: String,
            enum: ['Fresher', 'Experienced', 'Internship', 'Apprenticeship', 'Any']
        },
        totalExperience: {
            type: Number, // in years
            default: 0
        },
        totalExperienceMonths: {
            type: Number, // in months
            default: 0
        },
        currentJobTitle: {
            type: String,
            trim: true
        },
        currentCompany: {
            type: String,
            trim: true
        },
        companyType: {
            type: String,
            enum: ['Indian MNC', 'Foreign MNC', 'Govt/PSU', 'Startup', 'Unicorn', 'Corporate', 'Consultancy', 'Any']
        },
        industry: {
            type: String,
            trim: true
        },
        department: {
            type: String,
            trim: true
        },
        jobRole: {
            type: String,
            trim: true
        },
        skills: [{
            type: String,
            trim: true
        }],
        keySkills: [{
            type: String,
            trim: true
        }],
        softSkills: [{
            type: String,
            trim: true
        }],
        languages: [{
            type: String,
            trim: true
        }],
        preferredLanguage: [{
            type: String,
            enum: ['Hindi', 'English', 'Kannada', 'Telugu', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi', 'Tamil', 'Kashmiri', 'Maithili', 'Nepali', 'Bhojpuri', 'Assamese', 'Malayalam', 'Urdu', 'Sanskrit', 'Meitei (Manipuri)', 'Santali', 'Odia', 'Japanese', 'Russian', 'French', 'Chinese', 'German', 'Mexican', 'Vietnamese', 'Portuguese', 'Korean', 'Spanish', 'Turkish', 'Arabian', 'Filipino', 'Swedish', 'Greek', 'Latin', 'Polish', 'Thai', 'Serbian']
        }],
        englishFluencyLevel: {
            type: String,
            enum: ['Fluent English', 'Good English', 'Basic English', 'No English', 'Any']
        },
        certifications: [{
            name: String,
            issuer: String,
            date: Date,
            expiry: Date
        }],
        workExperience: [{
            company: String,
            position: String,
            startDate: Date,
            endDate: Date,
            current: Boolean,
            description: String
        }],
        currentSalary: {
            type: Number
        },
        includeNoSalaryCandidates: {
            type: Boolean,
            default: false
        }
    },
    
    // Job Preferences
    preferences: {
        currentCity: {
            type: String,
            required: true,
            trim: true
        },
        preferredLocations: [{
            type: String,
            trim: true
        }],
        willingToRelocate: {
            type: Boolean,
            default: false
        },
        preferredPincodes: [{
            type: String,
            trim: true
        }],
        jobTypePreference: {
            type: String,
            enum: ['Permanent', 'Temporary/Contract Job', 'Internship', 'Apprenticeship', 'NAPS', 'Freelance', 'Trainee', 'Fresher', 'Any'],
            required: true
        },
        employmentType: {
            type: String,
            enum: ['Full Time', 'Part Time', 'Any']
        },
        jobModeType: {
            type: String,
            enum: ['Work From Home', 'Work From Office', 'Work From Field', 'Hybrid', 'Remote', 'Any']
        },
        jobShiftType: {
            type: String,
            enum: ['Day Shift', 'Night Shift', 'Rotational Shift', 'Split Shift', 'Any']
        },
        expectedSalary: {
            type: Number,
            min: 0
        },
        salaryCurrency: {
            type: String,
            default: 'INR'
        },
        workMode: {
            type: String,
            enum: ['Work From Home', 'Work From Office', 'Work From Field', 'Hybrid', 'Remote', 'Any'],
            default: 'Work From Office'
        },
        noticePeriod: {
            type: String,
            enum: ['Immediate Joining', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', '90 Days Plus', 'Serving Notice Period', 'Any'],
            default: 'Immediate Joining'
        },
        availability: {
            type: String,
            default: 'Immediate Joining'
        },
        assetRequirements: [{
            type: String,
            enum: ['LMV License', 'Heavy Driver License', 'Crane Operator License', 'Electrical License', 'Laptop', 'Android Smart Phone', 'iOS Smart Phone', 'Camera', 'Two Wheeler', 'Bike', 'E-Bike', 'Auto', 'E-Rikshaw', 'Three Wheeler', 'Four Wheeler', 'Tempo', 'Traveller/Van', 'Truck', 'Crane', 'Bus', 'Tractor']
        }]
    },
    
    // Profile Status and Metadata
    profileStatus: {
        isComplete: {
            type: Boolean,
            default: false
        },
        completionPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        completedAt: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        lastActive: {
            type: Date,
            default: Date.now
        },
        lastModified: {
            type: Date,
            default: Date.now
        },
        // Candidate tracking fields
        candidateShowType: {
            type: String,
            enum: ['New Registered', 'New Modified', 'Actively Applying', 'Trending Profile', 'Featured Candidate', 'Any']
        },
        hasResume: {
            type: Boolean,
            default: false
        },
        hasProfilePicture: {
            type: Boolean,
            default: false
        },
        mobileVerified: {
            type: Boolean,
            default: false
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        whatsappAvailable: {
            type: Boolean,
            default: false
        },
        resumeAttached: {
            type: Boolean,
            default: false
        }
    },
    
    // Additional Information
    additionalInfo: {
        resume: {
            type: String,
            default: null
        },
        portfolio: {
            type: String,
            default: null
        },
        linkedin: {
            type: String,
            default: null
        },
        github: {
            type: String,
            default: null
        },
        website: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: 500
        },
        achievements: [{
            title: String,
            description: String,
            date: Date
        }],
        projects: [{
            name: String,
            description: String,
            technologies: [String],
            startDate: Date,
            endDate: Date,
            url: String
        }]
    },
    
    // Admin Fields
    adminNotes: {
        type: String,
        default: ''
    },
    adminRating: {
        type: Number,
        min: 1,
        max: 5
    },
    adminTags: [{
        type: String,
        trim: true
    }],
    lastAdminReview: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
userProfileSchema.index({ 'personalInfo.email': 1 });
userProfileSchema.index({ 'personalInfo.fullName': 'text' });
userProfileSchema.index({ 'professional.skills': 1 });
userProfileSchema.index({ 'preferences.currentCity': 1 });
userProfileSchema.index({ 'preferences.preferredLocations': 1 });
userProfileSchema.index({ 'profileStatus.isComplete': 1 });
userProfileSchema.index({ 'profileStatus.completionPercentage': 1 });
userProfileSchema.index({ createdAt: -1 });
userProfileSchema.index({ updatedAt: -1 });

// Virtual for full name
userProfileSchema.virtual('fullName').get(function() {
    return this.personalInfo.fullName;
});

// Virtual for experience in years
userProfileSchema.virtual('experienceYears').get(function() {
    const exp = this.professional.experience;
    if (!exp) return 0;
    
    const match = exp.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
});

// Method to calculate completion percentage
userProfileSchema.methods.calculateCompletionPercentage = function() {
    const fields = [
        'personalInfo.fullName',
        'personalInfo.dateOfBirth',
        'personalInfo.gender',
        'personalInfo.email',
        'education.educationLevel',
        'education.degree',
        'education.institution',
        'professional.experience',
        'professional.skills',
        'preferences.currentCity',
        'preferences.jobTypePreference'
    ];
    
    let completedFields = 0;
    fields.forEach(field => {
        const value = this.get(field);
        if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== '')) {
            completedFields++;
        }
    });
    
    return Math.round((completedFields / fields.length) * 100);
};

// Method to get profile summary
userProfileSchema.methods.getProfileSummary = function() {
    return {
        id: this._id,
        userId: this.userId,
        fullName: this.personalInfo.fullName,
        email: this.personalInfo.email,
        currentJobTitle: this.professional.currentJobTitle,
        currentCompany: this.professional.currentCompany,
        experience: this.professional.experience,
        skills: this.professional.skills,
        currentCity: this.preferences.currentCity,
        jobTypePreference: this.preferences.jobTypePreference,
        expectedSalary: this.preferences.expectedSalary,
        completionPercentage: this.profileStatus.completionPercentage,
        isComplete: this.profileStatus.isComplete,
        lastUpdated: this.profileStatus.lastUpdated,
        lastActive: this.profileStatus.lastActive,
        lastModified: this.profileStatus.lastModified
    };
};

// Method to update last active timestamp
userProfileSchema.methods.updateLastActive = function() {
    this.profileStatus.lastActive = new Date();
    return this.save();
};

// Pre-save middleware to update completion percentage
userProfileSchema.pre('save', function(next) {
    this.profileStatus.completionPercentage = this.calculateCompletionPercentage();
    this.profileStatus.isComplete = this.profileStatus.completionPercentage >= 80;
    
    if (this.profileStatus.isComplete && !this.profileStatus.completedAt) {
        this.profileStatus.completedAt = new Date();
    }
    
    this.profileStatus.lastUpdated = new Date();
    this.profileStatus.lastModified = new Date();
    next();
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
