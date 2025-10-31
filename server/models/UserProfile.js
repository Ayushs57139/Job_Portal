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
        maritalStatus: {
            type: String,
            enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Any']
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
        whatsappNumber: {
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
        guardian: {
            type: String,
            enum: ['Father', 'Mother', 'Brother', 'Sister', 'Husband', 'Wife', 'Guardian', 'Uncle', 'Aunt', 'Other']
        },
        guardianName: {
            type: String,
            trim: true
        },
        category: {
            type: String,
            enum: ['Scheduled Caste - SC', 'Scheduled Tribe - ST', 'OBC - Creamy', 'OBC – Non Creamy', 'General', 'EWS', 'Other', 'Any']
        },
        disabilityStatus: {
            type: String,
            enum: ['Have Disability', 'Don\'t Have Disability', 'Any']
        },
        disabilities: [{
            type: String,
            enum: ['Blindness', 'Low Vision', 'Physical Disability', 'Locomotor Disability', 'Hearing Impairment', 'Speech and Language Disability', 'Other', 'Any']
        }],
        militaryExperience: {
            type: String,
            enum: ['Currently Serving', 'Previously Served', 'Never Served', 'Any']
        },
        bikeScootyAvailable: [{
            type: String,
            enum: ['Yes', 'No', 'I Can Arrange', 'Learning Available', 'I Can Apply']
        }],
        drivingLicense: [{
            type: String,
            enum: ['LMV License', 'Heavy Driver License', 'Crane Operator License', 'Electrical License', 'Any']
        }],
        assetRequirements: [{
            type: String,
            enum: ['Laptop', 'Android Smart Phone', 'iOS Smart Phone', 'Camera', 'Two Wheeler', 'Bike', 'E-Bike', 'Auto', 'E-Rikshaw', 'Three Wheeler', 'Four Wheeler', 'Tempo', 'Traveller/Van', 'Truck', 'Crane', 'Bus', 'Tractor', 'Any']
        }],
        diversityHiring: {
            type: String,
            enum: ['Man', 'Man Returning to work', 'Woman', 'Woman Returning to work', 'Ex-Army Personal', 'Differently-abled', 'Any']
        },
        age: {
            type: Number
        }
    },
    
    // Location Information
    locationInfo: {
        currentState: {
            type: String,
            trim: true
        },
        currentCity: {
            type: String,
            trim: true
        },
        currentAddress: {
            type: String,
            trim: true
        },
        currentLocality: {
            type: String,
            trim: true
        },
        areaPincode: {
            type: String,
            trim: true
        },
        homeTownCity: {
            type: String,
            trim: true
        },
        homeTownState: {
            type: String,
            trim: true
        },
        homeTownLocality: {
            type: String,
            trim: true
        },
        homeTownPincode: {
            type: String,
            trim: true
        },
        preferredLanguage: [{
            type: String,
            enum: ['Hindi', 'English', 'Kannada', 'Telugu', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi', 'Tamil', 'Kashmiri', 'Maithili', 'Nepali', 'Bhojpuri', 'Assamese', 'Malayalam', 'Urdu', 'Sanskrit', 'Meitei (Manipuri)', 'Santali', 'Odia', 'Japanese', 'Russian', 'French', 'Chinese', 'German', 'Mexican', 'Vietnamese', 'Portuguese', 'Korean', 'Spanish', 'Turkish', 'Arabian', 'Filipino', 'Swedish', 'Greek', 'Latin', 'Polish', 'Thai', 'Serbian', 'Any']
        }],
        englishFluencyLevel: {
            type: String,
            enum: ['Fluent English', 'Good English', 'Basic English', 'No English', 'Any']
        },
        preferredJobLocations: [{
            city: String,
            state: String,
            locality: String
        }]
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
        specialization: {
            type: String,
            trim: true
        },
        institution: {
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
        isHighestEducation: {
            type: Boolean,
            default: false
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
        currentJobTitle: {
            type: String,
            trim: true
        },
        currentSalary: {
            type: Number
        },
        expectedSalary: {
            type: Number
        },
        expectedJobRoles: [{
            type: String,
            trim: true
        }],
        experience: {
            type: String,
            trim: true
        },
        experienceLevel: {
            type: String,
            enum: ['Fresher', 'Experienced', 'Internship', 'Apprenticeship', 'Any']
        },
        totalExperience: {
            type: String,
            enum: ['Fresher', '1 Month', '2 Months', '3 Months', '6 Months', '9 Months', '1 Year', '1.5 Years', '2 Years', '2.5 Years', '3 Years', '3.5 Years', '4 Years', '4.5 Years', '5 Years', '5.5 Years', '6 Years', '6.5 Years', '7 Years', '7.5 Years', '8 Years', '8.5 Years', '9 Years', '9.5 Years', '10 Years', '10.5 Years', '11 Years', '11.5 Years', '12 Years', '12.5 Years', '13 Years', '13.5 Years', '14 Years', '14.5 Years', '15 Years', '15.5 Years', '16 Years', '16.5 Years', '17 Years', '17.5 Years', '18 Years', '18.5 Years', '19 Years', '19.5 Years', '20 Years', '20.5 Years', '21 Years', '21.5 Years', '22 Years', '22.5 Years', '23 Years', '23.5 Years', '24 Years', '24.5 Years', '25 Years', '25.5 Years', '26 Years', '26.5 Years', '27 Years', '27.5 Years', '28 Years', '28.5 Years', '29 Years', '29.5 Years', '30 Years', '30.5 Years', '31 Years', '31.5 Years', '32 Years', '32.5 Years', '33 Years', '33.5 Years', '34 Years', '34.5 Years', '35 Years', '35.5 Years', '36 Years', '36 Years Plus']
        },
        jobStatus: {
            type: String,
            enum: ['Working', 'Not Working', 'Internship', 'Apprenticeship', 'Any']
        },
        jobTitle: {
            type: String,
            trim: true
        },
        keySkills: [{
            type: String,
            trim: true
        }],
        jobProfileDescription: {
            type: String,
            maxlength: 2000,
            trim: true
        },
        jobRoles: [{
            type: String,
            trim: true
        }],
        departmentCategory: [{
            type: String,
            trim: true
        }],
        currentCompany: {
            type: String,
            trim: true
        },
        industries: [{
            type: String,
            trim: true
        }],
        companyType: {
            type: String,
            enum: ['Indian MNC', 'Foreign MNC', 'Govt / PSU', 'Startup', 'Unicorn', 'Corporate', 'Consultancy', 'Any']
        },
        employmentType: {
            type: String,
            enum: ['Permanent', 'Temporary/Contract Job', 'Internship', 'Apprenticeship', 'NAPS', 'Freelance', 'Trainee', 'Fresher', 'Any']
        },
        jobType: {
            type: String,
            enum: ['Full Time', 'Part Time', 'Any']
        },
        jobModeType: [{
            type: String,
            enum: ['Work From Home', 'Work From Office', 'Work From Field', 'Hybrid', 'Remote', 'Any']
        }],
        jobShiftType: [{
            type: String,
            enum: ['Day Shift', 'Night Shift', 'Rotational Shift', 'Split Shift', 'Any']
        }],
        currentlyWorking: {
            type: Boolean,
            default: false
        },
        workStartDate: {
            type: String, // MM-YYYY format
            trim: true
        },
        workEndDate: {
            type: String, // MM-YYYY format
            trim: true
        },
        workLocation: {
            type: String,
            trim: true
        },
        noticePeriod: {
            type: String,
            enum: ['Immediate Joining', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', '90 Days Plus', 'Serving Notice Period', 'Any']
        },
        skills: [{
            type: String,
            trim: true
        }],
        softSkills: [{
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
            startDate: String, // MM-YYYY
            endDate: String, // MM-YYYY
            current: Boolean,
            description: String,
            location: String
        }],
        includeNoSalaryCandidates: {
            type: Boolean,
            default: false
        }
    },
    
    // Job Preferences
    preferences: {
        preferredLocations: [{
            city: String,
            state: String,
            locality: String,
            pincode: String
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
            enum: ['Permanent', 'Temporary/Contract Job', 'Internship', 'Apprenticeship', 'NAPS', 'Freelance', 'Trainee', 'Fresher', 'Any']
        },
        employmentType: {
            type: String,
            enum: ['Full Time', 'Part Time', 'Any']
        },
        workMode: {
            type: String,
            enum: ['Work From Home', 'Work From Office', 'Work From Field', 'Hybrid', 'Remote', 'Any'],
            default: 'Work From Office'
        },
        salaryCurrency: {
            type: String,
            default: 'INR'
        },
        availability: {
            type: String,
            default: 'Immediate Joining'
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
        onlineSocialProfiles: {
            facebook: {
                type: String,
                trim: true
            },
            instagram: {
                type: String,
                trim: true
            },
            linkedin: {
                type: String,
                trim: true
            },
            twitter: {
                type: String,
                trim: true
            },
            telegram: {
                type: String,
                trim: true
            },
            whatsapp: {
                type: String,
                trim: true
            },
            youtube: {
                type: String,
                trim: true
            },
            other: {
                type: String,
                trim: true
            }
        },
        portfolio: {
            name: {
                type: String,
                trim: true
            },
            link: {
                type: String,
                trim: true
            }
        },
        projectPortfolio: [{
            name: String,
            link: String,
            description: String
        }],
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
            maxlength: 2000
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

