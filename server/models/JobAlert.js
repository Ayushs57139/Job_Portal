const mongoose = require('mongoose');

const jobAlertSchema = new mongoose.Schema({
    // Job Preferences
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    expectedSalary: {
        type: Number,
        required: true,
        min: 0
    },
    presentJobStatus: {
        type: String,
        required: true,
        enum: ['working', 'not-working', 'internship', 'apprenticeship']
    },
    experienceLevel: {
        type: String,
        required: true,
        enum: ['fresher', 'experienced']
    },
    totalExperience: {
        type: String,
        required: true,
        enum: [
            'fresher', '1-month', '2-months', '3-months', '6-months', '9-months',
            '1-year', '1.5-years', '2-years', '2.5-years', '3-years', '3.5-years',
            '4-years', '4.5-years', '5-years', '5.5-years', '6-years', '6.5-years',
            '7-years', '7.5-years', '8-years', '8.5-years', '9-years', '9.5-years',
            '10-years', '10.5-years', '11-years', '11.5-years', '12-years', '12.5-years',
            '13-years', '13.5-years', '14-years', '14.5-years', '15-years', '15.5-years',
            '16-years', '16.5-years', '17-years', '17.5-years', '18-years', '18.5-years',
            '19-years', '19.5-years', '20-years', '20.5-years', '21-years', '21.5-years',
            '22-years', '22.5-years', '23-years', '23.5-years', '24-years', '24.5-years',
            '25-years', '25.5-years', '26-years', '26.5-years', '27-years', '27.5-years',
            '28-years', '28.5-years', '29-years', '29.5-years', '30-years', '30.5-years',
            '31-years', '31.5-years', '32-years', '32.5-years', '33-years', '33.5-years',
            '34-years', '34.5-years', '35-years', '35.5-years', '36-years', '36-years-plus'
        ]
    },
    workOfficeLocation: {
        type: String,
        required: true,
        trim: true
    },

    // Industry & Department
    industry: {
        type: String,
        required: true,
        trim: true
    },
    subIndustry: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    jobRoles: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0 && v.length <= 5;
            },
            message: 'Job roles must be between 1 and 5 items'
        }
    },

    // Skills
    keySkills: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0 && v.length <= 10;
            },
            message: 'Key skills must be between 1 and 10 items'
        }
    },

    // Contact Information
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
    },
    resumeFile: {
        type: String, // File path or URL
        default: null
    },
    alertName: {
        type: String,
        required: true,
        trim: true
    },
    alertFrequency: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
    },

    // User Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Can be null for anonymous users
    },

    // Alert Status
    isActive: {
        type: Boolean,
        default: true
    },
    lastNotified: {
        type: Date,
        default: null
    },
    notificationCount: {
        type: Number,
        default: 0
    },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better performance
jobAlertSchema.index({ email: 1 });
jobAlertSchema.index({ userId: 1 });
jobAlertSchema.index({ isActive: 1 });
jobAlertSchema.index({ createdAt: -1 });
jobAlertSchema.index({ jobTitle: 'text', industry: 'text', department: 'text' });

// Pre-save middleware
jobAlertSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Instance methods
jobAlertSchema.methods.incrementNotificationCount = function() {
    this.notificationCount += 1;
    this.lastNotified = new Date();
    return this.save();
};

jobAlertSchema.methods.deactivate = function() {
    this.isActive = false;
    return this.save();
};

jobAlertSchema.methods.activate = function() {
    this.isActive = true;
    return this.save();
};

// Static methods
jobAlertSchema.statics.findActiveAlerts = function() {
    return this.find({ isActive: true });
};

jobAlertSchema.statics.findByEmail = function(email) {
    return this.find({ email: email.toLowerCase() });
};

jobAlertSchema.statics.findByUserId = function(userId) {
    return this.find({ userId: userId });
};

jobAlertSchema.statics.findMatchingAlerts = function(jobData) {
    const query = {
        isActive: true,
        $or: [
            { jobTitle: { $regex: jobData.title, $options: 'i' } },
            { industry: { $regex: jobData.industry, $options: 'i' } },
            { department: { $regex: jobData.department, $options: 'i' } },
            { jobRoles: { $in: jobData.jobRoles || [] } },
            { keySkills: { $in: jobData.keySkills || [] } }
        ]
    };

    // Add location filter if specified
    if (jobData.location) {
        query.workOfficeLocation = { $regex: jobData.location, $options: 'i' };
    }

    // Add salary filter if specified
    if (jobData.salary) {
        query.expectedSalary = { $lte: jobData.salary };
    }

    return this.find(query);
};

// Virtual for formatted mobile number
jobAlertSchema.virtual('formattedMobile').get(function() {
    if (this.mobile && this.mobile.length === 10) {
        return `+91 ${this.mobile.slice(0, 5)} ${this.mobile.slice(5)}`;
    }
    return this.mobile;
});

// Virtual for formatted salary
jobAlertSchema.virtual('formattedSalary').get(function() {
    if (this.expectedSalary) {
        return `₹${this.expectedSalary.toLocaleString('en-IN')}`;
    }
    return 'Not specified';
});

// Virtual for experience in years
jobAlertSchema.virtual('experienceInYears').get(function() {
    const experienceMap = {
        'fresher': 0,
        '1-month': 0.08,
        '2-months': 0.17,
        '3-months': 0.25,
        '6-months': 0.5,
        '9-months': 0.75,
        '1-year': 1,
        '1.5-years': 1.5,
        '2-years': 2,
        '2.5-years': 2.5,
        '3-years': 3,
        '3.5-years': 3.5,
        '4-years': 4,
        '4.5-years': 4.5,
        '5-years': 5,
        '5.5-years': 5.5,
        '6-years': 6,
        '6.5-years': 6.5,
        '7-years': 7,
        '7.5-years': 7.5,
        '8-years': 8,
        '8.5-years': 8.5,
        '9-years': 9,
        '9.5-years': 9.5,
        '10-years': 10,
        '10.5-years': 10.5,
        '11-years': 11,
        '11.5-years': 11.5,
        '12-years': 12,
        '12.5-years': 12.5,
        '13-years': 13,
        '13.5-years': 13.5,
        '14-years': 14,
        '14.5-years': 14.5,
        '15-years': 15,
        '15.5-years': 15.5,
        '16-years': 16,
        '16.5-years': 16.5,
        '17-years': 17,
        '17.5-years': 17.5,
        '18-years': 18,
        '18.5-years': 18.5,
        '19-years': 19,
        '19.5-years': 19.5,
        '20-years': 20,
        '20.5-years': 20.5,
        '21-years': 21,
        '21.5-years': 21.5,
        '22-years': 22,
        '22.5-years': 22.5,
        '23-years': 23,
        '23.5-years': 23.5,
        '24-years': 24,
        '24.5-years': 24.5,
        '25-years': 25,
        '25.5-years': 25.5,
        '26-years': 26,
        '26.5-years': 26.5,
        '27-years': 27,
        '27.5-years': 27.5,
        '28-years': 28,
        '28.5-years': 28.5,
        '29-years': 29,
        '29.5-years': 29.5,
        '30-years': 30,
        '30.5-years': 30.5,
        '31-years': 31,
        '31.5-years': 31.5,
        '32-years': 32,
        '32.5-years': 32.5,
        '33-years': 33,
        '33.5-years': 33.5,
        '34-years': 34,
        '34.5-years': 34.5,
        '35-years': 35,
        '35.5-years': 35.5,
        '36-years': 36,
        '36-years-plus': 36
    };
    
    return experienceMap[this.totalExperience] || 0;
});

// Ensure virtual fields are serialized
jobAlertSchema.set('toJSON', { virtuals: true });
jobAlertSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('JobAlert', jobAlertSchema);
