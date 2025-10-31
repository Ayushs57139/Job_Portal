const express = require('express');
const { body, validationResult } = require('express-validator');
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/user-profiles
// @desc    Create or update user profile
// @access  Private
router.post('/', auth, [
    body('personalInfo.fullName').optional().notEmpty().withMessage('Full name is required'),
    body('personalInfo.dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
    body('personalInfo.email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const userId = req.user.id;
        const profileData = req.body;

        // Check if profile already exists
        let profile = await UserProfile.findOne({ userId });

        if (profile) {
            // Update existing profile - merge nested objects properly
            if (profileData.personalInfo) {
                Object.assign(profile.personalInfo, profileData.personalInfo);
            }
            if (profileData.locationInfo) {
                Object.assign(profile.locationInfo, profileData.locationInfo);
            }
            if (profileData.professional) {
                Object.assign(profile.professional, profileData.professional);
            }
            if (profileData.preferences) {
                Object.assign(profile.preferences, profileData.preferences);
            }
            if (profileData.additionalInfo) {
                Object.assign(profile.additionalInfo, profileData.additionalInfo);
            }
            if (profileData.education !== undefined) {
                profile.education = profileData.education;
            }
            await profile.save();
        } else {
            // Create new profile
            profile = new UserProfile({
                userId,
                ...profileData
            });
            await profile.save();
        }

        res.status(200).json({
            success: true,
            message: 'Profile saved successfully',
            profile: profile
        });
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ success: false, message: 'Error saving profile', error: error.message });
    }
});

// @route   GET /api/user-profiles/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await UserProfile.findOne({ userId }).populate('userId', 'phone userType');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Update last active timestamp
        await profile.updateLastActive();

        res.json({
            success: true,
            profile: profile
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

// @route   GET /api/user-profiles
// @desc    Get all profiles (admin only)
// @access  Private (admin)
router.get('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const {
            page = 1,
            limit = 10,
            search = '',
            city = '',
            experience = '',
            skills = '',
            isComplete = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        
        if (search) {
            query.$or = [
                { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
                { 'personalInfo.email': { $regex: search, $options: 'i' } },
                { 'professional.currentJobTitle': { $regex: search, $options: 'i' } },
                { 'professional.currentCompany': { $regex: search, $options: 'i' } }
            ];
        }
        
        if (city) {
            query['preferences.currentCity'] = { $regex: city, $options: 'i' };
        }
        
        if (experience) {
            query['professional.experience'] = { $regex: experience, $options: 'i' };
        }
        
        if (skills) {
            query['professional.skills'] = { $in: skills.split(',').map(s => s.trim()) };
        }
        
        if (isComplete !== '') {
            query['profileStatus.isComplete'] = isComplete === 'true';
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const profiles = await UserProfile.find(query)
            .populate('userId', 'phone userType createdAt')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await UserProfile.countDocuments(query);

        res.json({
            success: true,
            profiles,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ success: false, message: 'Error fetching profiles' });
    }
});

// @route   GET /api/user-profiles/:id
// @desc    Get profile by ID (admin only)
// @access  Private (admin)
router.get('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const profile = await UserProfile.findById(req.params.id)
            .populate('userId', 'phone userType createdAt')
            .populate('reviewedBy', 'fullName email');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

// @route   PUT /api/user-profiles/:id
// @desc    Update profile by ID (admin only)
// @access  Private (admin)
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const profile = await UserProfile.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('userId', 'phone userType');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: profile.getProfileSummary()
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});

// @route   DELETE /api/user-profiles/:id
// @desc    Delete profile by ID (admin only)
// @access  Private (admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const profile = await UserProfile.findByIdAndDelete(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ success: false, message: 'Error deleting profile' });
    }
});

// @route   POST /api/user-profiles/:id/verify
// @desc    Verify profile (admin only)
// @access  Private (admin)
router.post('/:id/verify', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const profile = await UserProfile.findByIdAndUpdate(
            req.params.id,
            {
                'profileStatus.isVerified': true,
                lastAdminReview: new Date(),
                reviewedBy: req.user.id
            },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile verified successfully',
            profile: profile.getProfileSummary()
        });
    } catch (error) {
        console.error('Error verifying profile:', error);
        res.status(500).json({ success: false, message: 'Error verifying profile' });
    }
});

// @route   GET /api/user-profiles/stats/overview
// @desc    Get profile statistics (admin only)
// @access  Private (admin)
router.get('/stats/overview', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const stats = await UserProfile.aggregate([
            {
                $group: {
                    _id: null,
                    totalProfiles: { $sum: 1 },
                    completedProfiles: {
                        $sum: { $cond: ['$profileStatus.isComplete', 1, 0] }
                    },
                    verifiedProfiles: {
                        $sum: { $cond: ['$profileStatus.isVerified', 1, 0] }
                    },
                    averageCompletion: { $avg: '$profileStatus.completionPercentage' }
                }
            }
        ]);

        const cityStats = await UserProfile.aggregate([
            {
                $group: {
                    _id: '$preferences.currentCity',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const skillStats = await UserProfile.aggregate([
            { $unwind: '$professional.skills' },
            {
                $group: {
                    _id: '$professional.skills',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        const experienceStats = await UserProfile.aggregate([
            {
                $group: {
                    _id: '$professional.experience',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            stats: {
                overview: stats[0] || {
                    totalProfiles: 0,
                    completedProfiles: 0,
                    verifiedProfiles: 0,
                    averageCompletion: 0
                },
                topCities: cityStats,
                topSkills: skillStats,
                experienceDistribution: experienceStats
            }
        });
    } catch (error) {
        console.error('Error fetching profile stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile stats' });
    }
});

module.exports = router;
