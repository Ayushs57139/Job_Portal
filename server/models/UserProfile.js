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
            enum: ['male', 'female', 'other', 'prefer-not-to-say'],
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
        profilePicture: {
            type: String,
            default: null
        }
    },
    
    // Education Information
    education: {
        educationLevel: {
            type: String,
            enum: ['high-school', 'diploma', 'bachelor', 'master', 'phd', 'other'],
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
            enum: ['completed', 'pursuing', 'dropped'],
            default: 'completed'
        },
        graduationYear: {
            type: Number
        },
        cgpa: {
            type: Number,
            min: 0,
            max: 10
        }
    },
    
    // Professional Information
    professional: {
        experience: {
            type: String,
            required: true
        },
        currentJobTitle: {
            type: String,
            trim: true
        },
        currentCompany: {
            type: String,
            trim: true
        },
        skills: [{
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
        }]
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
        jobTypePreference: {
            type: String,
            enum: ['fulltime', 'parttime', 'contract', 'internship', 'freelance'],
            required: true
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
            enum: ['onsite', 'remote', 'hybrid'],
            default: 'onsite'
        },
        noticePeriod: {
            type: String,
            default: 'immediate'
        },
        availability: {
            type: String,
            default: 'immediate'
        }
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
