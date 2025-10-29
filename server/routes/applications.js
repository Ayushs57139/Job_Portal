const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// @route   POST /api/applications/direct
// @desc    Submit job application directly without login (auto-register candidate)
// @access  Public
router.post('/direct', [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('mobileNumber').notEmpty().withMessage('Mobile number is required'),
    body('jobId').notEmpty().withMessage('Job ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            fullName,
            email,
            mobileNumber,
            whatsappNumber,
            dateOfBirth,
            gender,
            maritalStatus,
            currentLocation,
            currentJobTitle,
            currentSalary,
            experienceLevel,
            jobStatus,
            keySkills,
            jobProfileDescription,
            educationLevel,
            course,
            institution,
            passingYear,
            percentage,
            currentCompany,
            industry,
            companyType,
            employmentType,
            currentlyWorking,
            workStartDate,
            workEndDate,
            workLocation,
            noticePeriod,
            disabilityStatus,
            disabilityType,
            militaryExperience,
            bikeAvailable,
            drivingLicense,
            assetRequirements,
            currentState,
            currentCity,
            currentAddress,
            pincode,
            homeTown,
            homeTownPincode,
            preferredLocations,
            preferredLanguage,
            englishFluency,
            sourceOfVisit,
            jobId
        } = req.body;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user already exists with this email
        let user = await User.findOne({ email: email.toLowerCase() });
        let isNewUser = false;

        if (!user) {
            // Create new user account automatically
            isNewUser = true;
            
            // Generate unique userId
            let userId;
            let isUnique = false;
            
            while (!isUnique) {
                const randomNum = Math.floor(10000000 + Math.random() * 90000000);
                userId = `JW${randomNum}`;
                
                const existingUserId = await User.findOne({ userId });
                if (!existingUserId) {
                    isUnique = true;
                }
            }

            // Generate a temporary password (user can change it later)
            const tempPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tempPassword, salt);

            // Split full name into first and last name
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Create user data with simplified structure
            const userData = {
                firstName,
                lastName,
                email: email.toLowerCase(),
                password: hashedPassword,
                phone: mobileNumber,
                userType: 'jobseeker',
                userId,
                profile: {
                    bio: jobProfileDescription,
                    skills: Array.isArray(keySkills) ? keySkills : (keySkills ? keySkills.split(',').map(s => s.trim()) : []),
                    experience: 0, // Default experience
                    currentLocation: currentLocation,
                    preferredLocations: Array.isArray(preferredLocations) ? preferredLocations : (preferredLocations ? preferredLocations.split(',').map(l => l.trim()) : []),
                    currentSalary: currentSalary ? parseInt(currentSalary) : 0,
                    expectedSalary: 0,
                    education: [] // Start with empty education array
                },
                verificationStatus: 'pending',
                isEmailVerified: false
            };

            user = new User(userData);
            await user.save();
        }

        // Check if user already applied for this job
        const existingApplication = await Application.findOne({
            user: user._id,
            job: jobId
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Create application with default values for required fields
        const applicationData = {
            user: user._id,
            job: jobId,
            // Personal Information (required fields with defaults)
            fullName,
            email,
            mobileNumber,
            whatsappNumber: whatsappNumber || mobileNumber,
            dateOfBirth: dateOfBirth || new Date('1990-01-01'), // Default date
            gender: gender || 'Other',
            maritalStatus: maritalStatus || 'Single',
            currentLocation: currentLocation || 'Not specified',
            // Professional Information
            currentJobTitle: currentJobTitle || 'Not specified',
            currentSalary: currentSalary ? parseInt(currentSalary) : undefined,
            experienceLevel: experienceLevel || 'Fresher',
            jobStatus: jobStatus || 'Not Working',
            keySkills: Array.isArray(keySkills) ? keySkills : [],
            jobProfileDescription: jobProfileDescription || 'No description provided',
            // Education Information (required fields with defaults)
            educationLevel: educationLevel || 'Graduate',
            course: course || 'Not specified',
            institution: institution || 'Not specified',
            passingYear: passingYear ? parseInt(passingYear) : undefined,
            percentage: percentage || 'Not specified',
            // Work Experience
            currentCompany: currentCompany || 'Not specified',
            industry: Array.isArray(industry) ? industry : (industry ? [industry] : []),
            companyType: companyType || 'Corporate',
            employmentType: employmentType || 'Permanent',
            currentlyWorking: currentlyWorking || 'No',
            workStartDate,
            workEndDate,
            workLocation: workLocation || 'Not specified',
            noticePeriod: noticePeriod || 'Immediate Joining',
            // Additional Information
            disabilityStatus: disabilityStatus || 'Don\'t Have Disability',
            disabilityType,
            militaryExperience: militaryExperience || 'Never Served',
            bikeAvailable: bikeAvailable || 'No',
            drivingLicense: drivingLicense || 'No License',
            assetRequirements,
            // Location Information
            currentState: currentState || 'Not specified',
            currentCity: currentCity || 'Not specified',
            currentAddress: currentAddress || 'Not specified',
            pincode: pincode || '000000',
            homeTown: homeTown || 'Not specified',
            homeTownPincode: homeTownPincode || '000000',
            preferredLocations: Array.isArray(preferredLocations) ? preferredLocations : [],
            // Language & Communication
            preferredLanguage: preferredLanguage || 'English',
            englishFluency: englishFluency || 'Basic English',
            // Source Information
            sourceOfVisit: sourceOfVisit || 'Direct Application',
            // Application Status
            status: 'pending',
            appliedAt: new Date()
        };

        const application = new Application(applicationData);
        await application.save();

        // Update job application count
        await Job.findByIdAndUpdate(jobId, {
            $inc: { applicationCount: 1 }
        });

        // Generate token for the user (new or existing)
        const token = jwt.sign(
            { 
                id: user._id, 
                userType: 'jobseeker',
                email: user.email 
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: isNewUser ? 'Application submitted successfully and account created' : 'Application submitted successfully',
            application: {
                id: application._id,
                status: application.status,
                appliedAt: application.appliedAt
            },
            user: {
                id: user._id,
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userType: user.userType,
                phone: user.phone
            },
            token: token,
            isNewUser: isNewUser
        });

    } catch (error) {
        console.error('Direct application submission error:', error);
        res.status(500).json({ 
            message: 'Server error during application submission',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   POST /api/applications
// @desc    Submit job application
// @access  Private
router.post('/', [
    auth,
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('mobileNumber').notEmpty().withMessage('Mobile number is required'),
    body('jobId').notEmpty().withMessage('Job ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            fullName,
            email,
            mobileNumber,
            whatsappNumber,
            dateOfBirth,
            gender,
            maritalStatus,
            currentLocation,
            currentJobTitle,
            currentSalary,
            experienceLevel,
            jobStatus,
            keySkills,
            jobProfileDescription,
            educationLevel,
            course,
            institution,
            passingYear,
            percentage,
            currentCompany,
            industry,
            companyType,
            employmentType,
            currentlyWorking,
            workStartDate,
            workEndDate,
            workLocation,
            noticePeriod,
            disabilityStatus,
            disabilityType,
            militaryExperience,
            bikeAvailable,
            drivingLicense,
            assetRequirements,
            currentState,
            currentCity,
            currentAddress,
            pincode,
            homeTown,
            homeTownPincode,
            preferredLocations,
            preferredLanguage,
            englishFluency,
            sourceOfVisit,
            jobId
        } = req.body;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user already applied for this job
        const existingApplication = await Application.findOne({
            user: req.user._id,
            job: jobId
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Create application
        const applicationData = {
            user: req.user._id,
            job: jobId,
            // Personal Information
            fullName,
            email,
            mobileNumber,
            whatsappNumber,
            dateOfBirth,
            gender,
            maritalStatus,
            currentLocation,
            // Professional Information
            currentJobTitle,
            currentSalary: currentSalary ? parseInt(currentSalary) : undefined,
            experienceLevel,
            jobStatus,
            keySkills: Array.isArray(keySkills) ? keySkills : [],
            jobProfileDescription,
            // Education Information
            educationLevel,
            course,
            institution,
            passingYear: passingYear ? parseInt(passingYear) : undefined,
            percentage,
            // Work Experience
            currentCompany,
            industry: Array.isArray(industry) ? industry : (industry ? [industry] : []),
            companyType,
            employmentType,
            currentlyWorking,
            workStartDate,
            workEndDate,
            workLocation,
            noticePeriod,
            // Additional Information
            disabilityStatus,
            disabilityType,
            militaryExperience,
            bikeAvailable,
            drivingLicense,
            assetRequirements,
            // Location Information
            currentState,
            currentCity,
            currentAddress,
            pincode,
            homeTown,
            homeTownPincode,
            preferredLocations: Array.isArray(preferredLocations) ? preferredLocations : [],
            // Language & Communication
            preferredLanguage,
            englishFluency,
            // Source Information
            sourceOfVisit,
            // Application Status
            status: 'pending',
            appliedAt: new Date()
        };

        const application = new Application(applicationData);
        await application.save();

        // Update job application count
        await Job.findByIdAndUpdate(jobId, {
            $inc: { applicationCount: 1 }
        });

        res.status(201).json({
            message: 'Application submitted successfully',
            application: {
                id: application._id,
                status: application.status,
                appliedAt: application.appliedAt
            }
        });

    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({ message: 'Server error during application submission' });
    }
});

// @route   GET /api/applications/my-applications
// @desc    Get user's applications
// @access  Private
router.get('/my-applications', auth, async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user._id })
            .populate('job', 'title company location salary type')
            .sort({ appliedAt: -1 });

        res.json({
            applications: applications.map(app => ({
                id: app._id,
                job: app.job,
                status: app.status,
                appliedAt: app.appliedAt,
                currentJobTitle: app.currentJobTitle,
                experienceLevel: app.experienceLevel
            }))
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a specific job (for employers)
// @access  Private
router.get('/job/:jobId', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is the job owner or admin
        if (job.postedBy.toString() !== req.user._id.toString() && 
            !['admin', 'superadmin'].includes(req.user.userType)) {
            return res.status(403).json({ message: 'Not authorized to view applications for this job' });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate('user', 'firstName lastName email phone userId')
            .sort({ appliedAt: -1 });

        res.json({
            applications: applications.map(app => ({
                id: app._id,
                user: app.user,
                status: app.status,
                appliedAt: app.appliedAt,
                fullName: app.fullName,
                email: app.email,
                mobileNumber: app.mobileNumber,
                currentJobTitle: app.currentJobTitle,
                experienceLevel: app.experienceLevel,
                keySkills: app.keySkills,
                jobProfileDescription: app.jobProfileDescription,
                educationLevel: app.educationLevel,
                course: app.course,
                currentLocation: app.currentLocation,
                noticePeriod: app.noticePeriod
            }))
        });
    } catch (error) {
        console.error('Get job applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private
router.put('/:id/status', [
    auth,
    body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const application = await Application.findById(req.params.id)
            .populate('job', 'postedBy title');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if user is authorized to update status
        if (application.job.postedBy.toString() !== req.user._id.toString() && 
            !['admin', 'superadmin'].includes(req.user.userType)) {
            return res.status(403).json({ message: 'Not authorized to update this application' });
        }

        application.status = req.body.status;
        application.updatedAt = new Date();
        await application.save();

        res.json({
            message: 'Application status updated successfully',
            application: {
                id: application._id,
                status: application.status,
                updatedAt: application.updatedAt
            }
        });

    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/applications/:id
// @desc    Get specific application details
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('job', 'title company location salary type postedBy')
            .populate('user', 'firstName lastName email phone userId');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if user is authorized to view this application
        const isOwner = application.user._id.toString() === req.user._id.toString();
        const isJobOwner = application.job.postedBy.toString() === req.user._id.toString();
        const isAdmin = ['admin', 'superadmin'].includes(req.user.userType);

        if (!isOwner && !isJobOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this application' });
        }

        res.json({ application });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;