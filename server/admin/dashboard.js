const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { requirePermission } = require('../middleware/adminAuth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email userType createdAt');
    
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('postedBy', 'firstName lastName email')
      .select('title company.name location.city status createdAt');

    // Monthly statistics for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Job.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    res.json({
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        activeJobs,
        inactiveJobs: totalJobs - activeJobs
      },
      recentUsers,
      recentJobs,
      monthlyStats: {
        users: monthlyStats[0],
        jobs: monthlyStats[1],
        applications: monthlyStats[2]
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin)
router.get('/analytics', requirePermission('canViewAnalytics'), async (req, res) => {
  try {
    const period = req.query.period || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User analytics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    // Job analytics
    const jobStats = await Job.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Application analytics
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top companies by job count
    const topCompanies = await Job.aggregate([
      {
        $group: {
          _id: '$company.name',
          jobCount: { $sum: 1 },
          avgSalary: { $avg: { $add: ['$salary.min', '$salary.max'] } }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 }
    ]);

    // Top skills
    const topSkills = await Job.aggregate([
      { $unwind: '$requirements.skills' },
      {
        $group: {
          _id: '$requirements.skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      userStats,
      jobStats,
      applicationStats,
      topCompanies,
      topSkills,
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/create-admin
// @desc    Create new admin user
// @access  Private (Super Admin)
router.post('/create-admin', require('../middleware/adminAuth').superAdminAuth, [
  require('express-validator').body('firstName').notEmpty().withMessage('First name is required'),
  require('express-validator').body('lastName').notEmpty().withMessage('Last name is required'),
  require('express-validator').body('email').isEmail().withMessage('Please include a valid email'),
  require('express-validator').body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  require('express-validator').body('userType').isIn(['admin', 'superadmin']).withMessage('Invalid user type')
], async (req, res) => {
  try {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, userType, adminPermissions } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create admin user
    const adminUser = new User({
      firstName,
      lastName,
      email,
      password,
      userType,
      adminPermissions: adminPermissions || {
        canManageUsers: false,
        canManageJobs: false,
        canManageApplications: false,
        canViewAnalytics: false,
        canManageSettings: false,
        canManageContent: false
      }
    });

    await adminUser.save();

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        userType: adminUser.userType,
        adminPermissions: adminUser.adminPermissions
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error during admin creation' });
  }
});

module.exports = router;

