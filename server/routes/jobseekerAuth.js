const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const welcomeEmailService = require('../services/welcomeEmailService');
const router = express.Router();

// Register Job Seeker
router.post('/register', async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            phone,
            // Personal Information
            dateOfBirth,
            gender,
            maritalStatus,
            currentAddress,
            permanentAddress,
            // Professional Information
            jobTitle,
            experience,
            currentSalary,
            expectedSalary,
            noticePeriod,
            preferredJobType,
            // Education Information
            education,
            degree,
            institution,
            passingYear,
            percentage,
            // Skills and Preferences
            keySkills,
            preferredLocations,
            profileDescription,
            // Additional fields
            whatsappNumber,
            currentLocation
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Job seeker already exists with this email' });
        }

        // Generate unique userId
        let userId;
        let isUnique = false;
        
        while (!isUnique) {
            // Generate user ID with format: JW + 8 random digits
            const randomNum = Math.floor(10000000 + Math.random() * 90000000);
            userId = `JW${randomNum}`;
            
            // Check if this userId already exists
            const existingUserId = await User.findOne({ userId });
            if (!existingUserId) {
                isUnique = true;
            }
        }

        // Create new job seeker with all data
        const jobSeekerData = {
            firstName,
            lastName,
            email,
            password,
            phone,
            userType: 'jobseeker',
            userId,
            // Store additional data in profile
            profile: {
                // Personal Information
                dateOfBirth,
                gender,
                maritalStatus,
                currentAddress,
                permanentAddress,
                // Professional Information
                jobTitle,
                experience: experience ? parseInt(experience) : 0,
                currentSalary: currentSalary ? parseInt(currentSalary) : 0,
                expectedSalary: expectedSalary ? parseInt(expectedSalary) : 0,
                noticePeriod,
                preferredJobType,
                // Education Information
                education: education ? [{
                    levelOfEducation: education,
                    degree: degree,
                    institution: institution,
                    year: passingYear ? parseInt(passingYear) : undefined,
                    percentage: percentage,
                    isHighest: true
                }] : [],
                // Skills and Preferences
                skills: Array.isArray(keySkills) ? keySkills : (keySkills ? keySkills.split(',').map(s => s.trim()) : []),
                preferredLocations: Array.isArray(preferredLocations) ? preferredLocations : (preferredLocations ? preferredLocations.split(',').map(l => l.trim()) : []),
                bio: profileDescription,
                // Additional fields
                currentLocation: currentLocation || whatsappNumber
            }
        };

        const jobSeeker = new User(jobSeekerData);
        await jobSeeker.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: jobSeeker._id, 
                userType: 'jobseeker',
                email: jobSeeker.email 
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        // Send welcome email
        try {
            await welcomeEmailService.sendJobSeekerWelcomeEmail(jobSeeker);
        } catch (emailError) {
            console.error('Job seeker welcome email sending failed:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            message: 'Job seeker registered successfully',
            token,
            user: {
                id: jobSeeker._id,
                userId: jobSeeker.userId,
                firstName: jobSeeker.firstName,
                lastName: jobSeeker.lastName,
                email: jobSeeker.email,
                userType: 'jobseeker',
                phone: jobSeeker.phone,
                profile: jobSeeker.profile
            }
        });
    } catch (error) {
        console.error('Job seeker registration error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

// Login Job Seeker
router.post('/login', async (req, res) => {
    try {
        const { loginId, email, password } = req.body;
        
        // Use loginId if provided, otherwise use email
        const loginField = loginId || email;

        // Find job seeker by email or userId
        let jobSeeker = null;
        
        // Try to find by email first
        if (loginField.includes('@')) {
            jobSeeker = await User.findOne({ email: loginField.toLowerCase() });
        } else {
            // Try to find by userId
            jobSeeker = await User.findOne({ userId: loginField });
        }
        
        if (!jobSeeker) {
            const logger = require('../utils/logger');
            logger.warn('Jobseeker login failed: User not found', {
                loginField: loginField.substring(0, 10) + '***',
                ip: req.ip
            });
            return res.status(400).json({ message: 'No account found with this login ID. Please check your credentials or create a new account' });
        }

        // STRICT VALIDATION: ONLY jobseeker accounts can login here
        // Explicitly reject admin, superadmin, and employer account types
        if (jobSeeker.userType === 'admin' || jobSeeker.userType === 'superadmin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin accounts cannot login through jobseeker login. Please use the admin login page.' 
            });
        }
        
        if (jobSeeker.userType === 'employer') {
            return res.status(403).json({ 
                message: 'Access denied. This is an employer account. Please use the employer login page.' 
            });
        }
        
        // Check if account is active
        if (!jobSeeker.isActive) {
            const logger = require('../utils/logger');
            logger.warn('Jobseeker login failed: Account deactivated', {
                userId: jobSeeker._id,
                email: jobSeeker.email,
                ip: req.ip
            });
            return res.status(400).json({ message: 'Account is deactivated. Please contact support' });
        }
        
        // Strict validation: Check if user is a jobseeker (before password check)
        if (jobSeeker.userType !== 'jobseeker') {
            return res.status(400).json({ message: `This account is a ${jobSeeker.userType} account, not a jobseeker account. Please use the correct login page` });
        }

        // Check password (only after user type validation passes)
        const isMatch = await jobSeeker.comparePassword(password);
        if (!isMatch) {
            const logger = require('../utils/logger');
            logger.warn('Jobseeker login failed: Incorrect password', {
                userId: jobSeeker._id,
                email: jobSeeker.email,
                ip: req.ip
            });
            return res.status(400).json({ message: 'Incorrect password. Please try again' });
        }

        // Update last login
        jobSeeker.lastLogin = new Date();
        await jobSeeker.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: jobSeeker._id, 
                userType: 'jobseeker',
                email: jobSeeker.email 
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: jobSeeker._id,
                userId: jobSeeker.userId,
                firstName: jobSeeker.firstName,
                lastName: jobSeeker.lastName,
                email: jobSeeker.email,
                userType: 'jobseeker',
                phone: jobSeeker.phone,
                profile: jobSeeker.profile
            }
        });
    } catch (error) {
        console.error('Job seeker login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get Job Seeker Profile
router.get('/me', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const jobSeeker = await User.findById(decoded.id).select('-password');
        
        if (!jobSeeker) {
            return res.status(404).json({ message: 'Job seeker not found' });
        }

        res.json(jobSeeker);
    } catch (error) {
        console.error('Get job seeker profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
