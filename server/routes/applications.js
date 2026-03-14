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

        // Validate job has postedBy (employer)
        if (!job.postedBy) {
            return res.status(400).json({ message: 'Job does not have a valid employer' });
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
            const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

            // Split full name into first and last name
            const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
            const firstName = nameParts[0] || fullName || 'User';
            // If no last name provided, use a default value (User model requires lastName)
            const lastName = nameParts.slice(1).join(' ') || 'User';

            // Create user data with simplified structure
            // Note: Pass plain text password - the User model's pre-save hook will hash it
            const userData = {
                firstName,
                lastName,
                email: email.toLowerCase(),
                password: tempPassword, // Plain text - will be hashed by pre-save hook
                phone: mobileNumber,
                userType: 'jobseeker',
                userId,
                tempPassword: tempPassword, // Store temporary password for display
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

        // Helper function to map bikeAvailable values to enum
        const mapBikeAvailable = (value) => {
            if (!value) return 'No';
            const lower = value.toLowerCase();
            if (lower.includes('yes') || lower.includes('have')) return 'Yes';
            if (lower.includes('no') || lower.includes("don't") || lower.includes("do not")) return 'No';
            if (lower.includes('arrange') || lower.includes('can')) return 'I Can Arrange';
            return 'No';
        };

        // Helper function to map drivingLicense values to enum
        const mapDrivingLicense = (value) => {
            if (!value) return 'No License';
            const lower = value.toLowerCase();
            if (lower.includes('no') || lower.includes("don't") || lower.includes("do not")) return 'No License';
            if (lower.includes('learning')) return 'Learning License';
            if (lower.includes('lmv') || lower.includes('light motor')) return 'LMV License';
            if (lower.includes('heavy') || lower.includes('hdt')) return 'Heavy Driver License';
            if (lower.includes('crane')) return 'Crane Operator License';
            if (lower.includes('electrical')) return 'Electrical License';
            // Default to LMV if they say they have a license
            if (lower.includes('yes') || lower.includes('have') || lower.includes('valid')) return 'LMV License';
            return 'No License';
        };

        // Helper function to map maritalStatus to enum
        const mapMaritalStatus = (value) => {
            if (!value) return 'Single';
            const lower = value.toLowerCase();
            if (lower.includes('single')) return 'Single';
            if (lower.includes('married')) return 'Married';
            if (lower.includes('divorced')) return 'Divorced';
            if (lower.includes('widow')) return 'Widowed';
            return 'Single';
        };

        // Helper function to map jobStatus to enum
        const mapJobStatus = (value) => {
            if (!value) return 'Not Working';
            const lower = value.toLowerCase();
            if (lower.includes('working') || lower.includes('employed')) return 'Working';
            if (lower.includes('not working') || lower.includes('unemployed') || lower.includes('not employed')) return 'Not Working';
            if (lower.includes('internship')) return 'Internship';
            if (lower.includes('apprenticeship')) return 'Apprenticeship';
            return 'Not Working';
        };

        // Helper function to map noticePeriod to enum
        const mapNoticePeriod = (value) => {
            if (!value) return 'Immediate Joining';
            const lower = value.toLowerCase();
            if (lower.includes('immediate') || lower.includes('now')) return 'Immediate Joining';
            if (lower.includes('7') || lower.includes('seven')) return '7 Days';
            if (lower.includes('15') || lower.includes('fifteen')) return '15 Days';
            if (lower.includes('30') || lower.includes('thirty') || lower.includes('1 month')) return '30 Days';
            if (lower.includes('45') || lower.includes('forty')) return '45 Days';
            if (lower.includes('60') || lower.includes('sixty') || lower.includes('2 month')) return '60 Days';
            if (lower.includes('90') || lower.includes('ninety') || lower.includes('3 month')) {
                if (lower.includes('plus') || lower.includes('more')) return '90 Days Plus';
                return '90 Days';
            }
            if (lower.includes('serving') || lower.includes('notice')) return 'Serving Notice Period';
            return 'Immediate Joining';
        };

        // Create application with default values for required fields
        const applicationData = {
            user: user._id,
            job: jobId,
            employer: job.postedBy, // Set employer from job's postedBy field
            // Personal Information (required fields with defaults)
            fullName,
            email,
            mobileNumber,
            whatsappNumber: whatsappNumber || mobileNumber,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1990-01-01'), // Default date
            gender: gender || 'Other',
            maritalStatus: mapMaritalStatus(maritalStatus),
            currentLocation: currentLocation || 'Not specified',
            // Professional Information
            currentJobTitle: currentJobTitle || 'Not specified',
            currentSalary: currentSalary ? parseInt(currentSalary) : undefined,
            experienceLevel: experienceLevel || 'Fresher',
            jobStatus: mapJobStatus(jobStatus),
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
            noticePeriod: mapNoticePeriod(noticePeriod),
            // Additional Information
            disabilityStatus: disabilityStatus || 'Don\'t Have Disability',
            disabilityType,
            militaryExperience: militaryExperience || 'Never Served',
            bikeAvailable: mapBikeAvailable(bikeAvailable),
            drivingLicense: mapDrivingLicense(drivingLicense),
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
            status: 'applied',
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

        // Prepare response data
        const responseData = {
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
        };

        // Include temporary password only for new users
        if (isNewUser && user.tempPassword) {
            responseData.tempPassword = user.tempPassword;
        }

        res.status(201).json(responseData);

    } catch (error) {
        console.error('Direct application submission error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code,
            keyPattern: error.keyPattern,
            keyValue: error.keyValue
        });
        res.status(500).json({ 
            message: 'Server error during application submission',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
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

        // Validate job has postedBy (employer)
        if (!job.postedBy) {
            console.error('Job missing postedBy field:', jobId);
            return res.status(400).json({ message: 'Job is missing employer information' });
        }

        // Check if user already applied for this job
        const existingApplication = await Application.findOne({
            user: req.user._id,
            job: jobId
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Validate required fields and set defaults
        if (!jobStatus || !['Working', 'Not Working', 'Internship', 'Apprenticeship'].includes(jobStatus)) {
            jobStatus = 'Not Working';
        }
        if (!course || (Array.isArray(course) && course.length === 0)) {
            course = 'Not specified';
        }
        if (!educationLevel || !['No Education', 'Below 10th', '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate', 'Other'].includes(educationLevel)) {
            educationLevel = educationLevel || 'No Education';
        }
        if (!currentLocation) {
            currentLocation = currentAddress || 'Not specified';
        }
        if (!jobProfileDescription) {
            jobProfileDescription = 'No description provided';
        }

        // Helper function to map bikeAvailable values
        const mapBikeAvailable = (value) => {
            if (!value || value.trim() === '') return null;
            const bikeMap = {
                'Yes, I have': 'Yes',
                'No, I don\'t have': 'No',
                'I Can Arrange': 'I Can Arrange',
                'Yes': 'Yes',
                'No': 'No'
            };
            return bikeMap[value] || (['Yes', 'No', 'I Can Arrange'].includes(value) ? value : null);
        };

        // Helper function to map drivingLicense values
        const mapDrivingLicense = (value) => {
            if (!value || value.trim() === '') return null;
            const licenseMap = {
                'Yes, I have valid DL': 'LMV License',
                'No, I don\'t have': 'No License',
                'No License': 'No License',
                'Learning License': 'Learning License',
                'LMV License': 'LMV License',
                'Heavy Driver License': 'Heavy Driver License',
                'Crane Operator License': 'Crane Operator License',
                'Electrical License': 'Electrical License'
            };
            return licenseMap[value] || (['No License', 'Learning License', 'LMV License', 'Heavy Driver License', 'Crane Operator License', 'Electrical License'].includes(value) ? value : null);
        };

        // Build application data object, only including valid enum values
        const applicationData = {
            user: req.user._id,
            job: jobId,
            employer: job.postedBy.toString(),
            // Personal Information
            fullName,
            email,
            mobileNumber,
            whatsappNumber: whatsappNumber || mobileNumber,
            dateOfBirth: dateOfBirth || new Date('1990-01-01'),
            gender: gender || 'Other',
            maritalStatus: maritalStatus || 'Single',
            currentLocation: currentLocation || currentAddress || 'Not specified',
            // Professional Information
            currentJobTitle: currentJobTitle || '',
            currentSalary: currentSalary ? parseInt(currentSalary) : undefined,
            experienceLevel: experienceLevel || 'Fresher',
            jobStatus,
            keySkills: Array.isArray(keySkills) ? keySkills : (keySkills ? [keySkills] : []),
            jobProfileDescription,
            // Education Information
            educationLevel,
            course: Array.isArray(course) ? (course.length > 0 ? course[0] : 'Not specified') : course,
            institution: institution || '',
            passingYear: passingYear ? parseInt(passingYear) : undefined,
            percentage: percentage || '',
            // Work Experience
            currentCompany: currentCompany || '',
            industry: Array.isArray(industry) ? industry : (industry ? [industry] : []),
            workStartDate: workStartDate || '',
            workEndDate: workEndDate || '',
            workLocation: workLocation || '',
            assetRequirements: assetRequirements || [],
            // Location Information
            currentState: currentState || '',
            currentCity: currentCity || '',
            currentAddress: currentAddress || '',
            pincode: pincode || '',
            homeTown: homeTown || '',
            homeTownPincode: homeTownPincode || '',
            preferredLocations: Array.isArray(preferredLocations) ? preferredLocations : [],
            // Language & Communication
            preferredLanguage: preferredLanguage || '',
            englishFluency: englishFluency || '',
            // Source Information
            sourceOfVisit: sourceOfVisit || '',
            // Application Status
            status: 'applied',
            appliedAt: new Date()
        };

        // Only add enum fields if they have valid values (completely omit if invalid/empty)
        const validCompanyTypes = ['Indian MNC', 'Foreign MNC', 'Govt / PSU', 'Startup', 'Unicorn', 'Corporate', 'Consultancy'];
        if (companyType && companyType.trim() !== '' && validCompanyTypes.includes(companyType)) {
            applicationData.companyType = companyType;
        }

        const validEmploymentTypes = ['Permanent', 'Temporary/Contract Job', 'Internship', 'Apprenticeship', 'Freelance', 'Trainee', 'Fresher'];
        if (employmentType && employmentType.trim() !== '' && validEmploymentTypes.includes(employmentType)) {
            applicationData.employmentType = employmentType;
        }

        if (currentlyWorking && currentlyWorking.trim() !== '' && ['Yes', 'No'].includes(currentlyWorking)) {
            applicationData.currentlyWorking = currentlyWorking;
        }

        const validNoticePeriods = ['Immediate Joining', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', '90 Days Plus', 'Serving Notice Period'];
        if (noticePeriod && noticePeriod.trim() !== '' && validNoticePeriods.includes(noticePeriod)) {
            applicationData.noticePeriod = noticePeriod;
        }

        if (disabilityStatus && disabilityStatus.trim() !== '' && ['Don\'t Have Disability', 'Have Disability'].includes(disabilityStatus)) {
            applicationData.disabilityStatus = disabilityStatus;
        }

        const validDisabilityTypes = ['Blindness', 'Low Vision', 'Physical Disability', 'Locomotor Disability', 'Hearing Impairment', 'Speech and Language Disability', 'Other'];
        if (disabilityType && disabilityType.trim() !== '' && validDisabilityTypes.includes(disabilityType)) {
            applicationData.disabilityType = disabilityType;
        }

        if (militaryExperience && militaryExperience.trim() !== '' && ['Currently Serving', 'Previously Served', 'Never Served'].includes(militaryExperience)) {
            applicationData.militaryExperience = militaryExperience;
        }

        const mappedBikeAvailable = mapBikeAvailable(bikeAvailable);
        if (mappedBikeAvailable) {
            applicationData.bikeAvailable = mappedBikeAvailable;
        }

        const mappedDrivingLicense = mapDrivingLicense(drivingLicense);
        if (mappedDrivingLicense) {
            applicationData.drivingLicense = mappedDrivingLicense;
        }

        // Log application data for debugging
        console.log('Creating application with data:', JSON.stringify({
            user: applicationData.user,
            job: applicationData.job,
            employer: applicationData.employer,
            fullName: applicationData.fullName,
            email: applicationData.email,
            jobStatus: applicationData.jobStatus,
            educationLevel: applicationData.educationLevel,
            course: applicationData.course,
            currentLocation: applicationData.currentLocation,
            jobProfileDescription: applicationData.jobProfileDescription ? applicationData.jobProfileDescription.substring(0, 50) + '...' : 'missing'
        }, null, 2));

        try {
            const application = new Application(applicationData);
            const validationError = application.validateSync();
            if (validationError) {
                console.error('Validation error before save:', validationError);
                return res.status(400).json({ 
                    message: 'Validation error',
                    errors: Object.keys(validationError.errors || {}).map(key => ({
                        field: key,
                        message: validationError.errors[key].message
                    }))
                });
            }
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
        } catch (saveError) {
            console.error('Error saving application:', saveError);
            console.error('Application data that failed:', JSON.stringify(applicationData, null, 2));
            if (saveError.name === 'ValidationError') {
                console.error('Validation errors:', saveError.errors);
                return res.status(400).json({ 
                    message: 'Validation error',
                    errors: Object.keys(saveError.errors).map(key => ({
                        field: key,
                        message: saveError.errors[key].message
                    }))
                });
            }
            throw saveError; // Re-throw to be caught by outer catch
        }

    } catch (error) {
        console.error('Application submission error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error',
                errors: Object.keys(error.errors || {}).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }
        res.status(500).json({ 
            message: 'Server error during application submission',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   GET /api/applications/my-applications
// @desc    Get user's applications
// @access  Private
router.get('/my-applications', auth, async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user._id })
            .populate('job', 'title company location salary type employmentType jobType createdAt')
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            applications: applications.map(app => ({
                id: app._id,
                _id: app._id,
                job: app.job ? {
                    _id: app.job._id,
                    id: app.job._id,
                    title: app.job.title,
                    company: app.job.company,
                    location: app.job.location,
                    salary: app.job.salary,
                    type: app.job.type,
                    employmentType: app.job.employmentType,
                    jobType: app.job.jobType,
                    createdAt: app.job.createdAt,
                } : null,
                status: app.status || 'applied',
                appliedAt: app.appliedAt,
                updatedAt: app.updatedAt,
                currentJobTitle: app.currentJobTitle,
                experienceLevel: app.experienceLevel,
                keySkills: app.keySkills,
                educationLevel: app.educationLevel,
                course: app.course,
            }))
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching applications' 
        });
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
                _id: app._id,
                user: app.user,
                status: app.status,
                appliedAt: app.appliedAt,
                updatedAt: app.updatedAt,
                // Personal Information
                fullName: app.fullName,
                email: app.email,
                mobileNumber: app.mobileNumber,
                whatsappNumber: app.whatsappNumber,
                dateOfBirth: app.dateOfBirth,
                gender: app.gender,
                maritalStatus: app.maritalStatus,
                currentLocation: app.currentLocation,
                // Professional Information
                currentJobTitle: app.currentJobTitle,
                currentSalary: app.currentSalary,
                experienceLevel: app.experienceLevel,
                jobStatus: app.jobStatus,
                keySkills: app.keySkills,
                jobProfileDescription: app.jobProfileDescription,
                yearsOfExperience: app.yearsOfExperience,
                // Education Information
                educationLevel: app.educationLevel,
                course: app.course,
                institution: app.institution,
                passingYear: app.passingYear,
                percentage: app.percentage,
                // Work Experience
                currentCompany: app.currentCompany,
                industry: app.industry,
                companyType: app.companyType,
                employmentType: app.employmentType,
                currentlyWorking: app.currentlyWorking,
                workStartDate: app.workStartDate,
                workEndDate: app.workEndDate,
                workLocation: app.workLocation,
                noticePeriod: app.noticePeriod,
                // Location Information
                currentState: app.currentState,
                currentCity: app.currentCity,
                currentAddress: app.currentAddress,
                pincode: app.pincode,
                homeTown: app.homeTown,
                homeTownPincode: app.homeTownPincode,
                preferredLocations: app.preferredLocations,
                // Additional Information
                disabilityStatus: app.disabilityStatus,
                militaryExperience: app.militaryExperience,
                bikeAvailable: app.bikeAvailable,
                drivingLicense: app.drivingLicense,
                englishFluency: app.englishFluency,
                sourceOfVisit: app.sourceOfVisit,
                // Interview Information
                interviewScheduled: app.interviewScheduled,
                interviewDate: app.interviewDate,
                interviewNotes: app.interviewNotes,
                notes: app.notes
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