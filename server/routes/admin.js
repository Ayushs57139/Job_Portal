const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Package = require('../models/Package');
const EmailTemplate = require('../models/EmailTemplate');
const { adminAuth, superAdminAuth, requirePermission } = require('../middleware/adminAuth');
const emailTemplateService = require('../services/emailTemplateService');

const router = express.Router();

// Apply admin authentication to all routes except test routes and master data routes
router.use((req, res, next) => {
  // Skip auth for test routes and master data routes
  if (req.path.includes('/test/') || req.path.includes('/master-data/')) {
    return next();
  }
  return adminAuth(req, res, next);
});

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

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin)
router.get('/users', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const userType = req.query.userType || '';
    const isActive = req.query.isActive;

    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (userType) {
      query.userType = userType;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userProfile',
        select: 'profileStatus.lastActive profileStatus.lastModified profileStatus.lastUpdated personalInfo.fullName'
      });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user by ID
// @access  Private (Admin)
router.get('/users/:id', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin)
router.put('/users/:id', requirePermission('canManageUsers'), [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('userType').optional().isIn(['jobseeker', 'employer', 'admin', 'superadmin']).withMessage('Invalid user type'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent non-superadmin from promoting to superadmin
    if (req.body.userType === 'superadmin' && !req.user.isSuperAdmin()) {
      return res.status(403).json({ message: 'Only super admin can create super admin accounts' });
    }

    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'userType', 'isActive', 'isEmailVerified', 'adminPermissions'];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of super admin accounts
    if (user.isSuperAdmin()) {
      return res.status(403).json({ message: 'Cannot delete super admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/role-management/users
// @desc    Get users for role power management
// @access  Private (Admin)
router.get('/role-management/users', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const userType = req.query.userType || '';
    const status = req.query.status || '';

    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (userType) {
      query.userType = userType;
    }
    
    if (status) {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get role management users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/role-management/users/:id
// @desc    Update user role and permissions
// @access  Private (Admin)
router.put('/role-management/users/:id', requirePermission('canManageUsers'), [
  body('userType').optional().isIn(['jobseeker', 'employer', 'admin', 'superadmin']).withMessage('Invalid user type'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('adminPermissions').optional().isObject().withMessage('adminPermissions must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent non-superadmin from promoting to superadmin
    if (req.body.userType === 'superadmin' && !req.user.isSuperAdmin()) {
      return res.status(403).json({ message: 'Only super admin can create super admin accounts' });
    }

    // Prevent non-superadmin from modifying superadmin accounts
    if (user.isSuperAdmin() && !req.user.isSuperAdmin()) {
      return res.status(403).json({ message: 'Only super admin can modify super admin accounts' });
    }

    const updates = req.body;
    const allowedUpdates = ['userType', 'isActive', 'adminPermissions'];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/role-management/bulk-update
// @desc    Bulk update user roles and status
// @access  Private (Admin)
router.post('/role-management/bulk-update', requirePermission('canManageUsers'), [
  body('userIds').isArray().withMessage('userIds must be an array'),
  body('userType').optional().isIn(['jobseeker', 'employer', 'admin', 'superadmin']).withMessage('Invalid user type'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userIds, userType, isActive } = req.body;

    // Prevent non-superadmin from promoting to superadmin
    if (userType === 'superadmin' && !req.user.isSuperAdmin()) {
      return res.status(403).json({ message: 'Only super admin can create super admin accounts' });
    }

    const updateData = {};
    if (userType) updateData.userType = userType;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Check if any of the users are superadmin (prevent modification by non-superadmin)
    if (!req.user.isSuperAdmin()) {
      const superAdminUsers = await User.find({
        _id: { $in: userIds },
        userType: 'superadmin'
      });
      
      if (superAdminUsers.length > 0) {
        return res.status(403).json({ 
          message: 'Cannot modify super admin accounts. Only super admin can modify super admin accounts.' 
        });
      }
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update user roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/role-management/permissions
// @desc    Get available permissions for role management
// @access  Private (Admin)
router.get('/role-management/permissions', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const permissions = {
      adminPermissions: {
        canManageUsers: 'Manage Users',
        canManageJobs: 'Manage Jobs',
        canManageApplications: 'Manage Applications',
        canViewAnalytics: 'View Analytics',
        canManageSettings: 'Manage Settings',
        canManageContent: 'Manage Content'
      },
      userTypes: {
        jobseeker: 'Job Seeker',
        employer: 'Employer',
        admin: 'Admin',
        superadmin: 'Super Admin'
      }
    };

    res.json({
      success: true,
      permissions
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/jobs
// @desc    Get all jobs with admin filters
// @access  Private (Admin)
router.get('/jobs', requirePermission('canManageJobs'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const featured = req.query.featured;

    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/jobs/:id
// @desc    Update job
// @access  Private (Admin)
router.put('/jobs/:id', requirePermission('canManageJobs'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updates = req.body;
    const allowedUpdates = ['title', 'description', 'status', 'featured', 'urgent', 'tags', 'benefits', 'applicationDeadline'];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName email');

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/jobs/:id
// @desc    Delete job
// @access  Private (Admin)
router.delete('/jobs/:id', requirePermission('canManageJobs'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Also delete related applications
    await Application.deleteMany({ job: req.params.id });
    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/applications
// @desc    Get all applications with admin filters
// @access  Private (Admin)
router.get('/applications', requirePermission('canManageApplications'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';

    let query = {};
    
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('user', 'firstName lastName email')
      .populate('job', 'title company.name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/applications/:id/status
// @desc    Update application status
// @access  Private (Admin)
router.put('/applications/:id/status', requirePermission('canManageApplications'), [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = req.body.status;
    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/create-admin
// @desc    Create new admin user
// @access  Private (Super Admin)
router.post('/create-admin', superAdminAuth, [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['admin', 'superadmin']).withMessage('Invalid user type')
], async (req, res) => {
  try {
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

// @route   GET /api/admin/team-limits
// @desc    Get all companies/consultancies with their team member limits
// @access  Private (Admin)
router.get('/team-limits', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const employerType = req.query.employerType || '';

    let query = { userType: 'employer' };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.company.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (employerType) {
      query.employerType = employerType;
    }

    const employers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Update current team member counts
    for (let employer of employers) {
      await User.updateTeamMemberCount(employer._id);
      await employer.save();
    }

    const total = await User.countDocuments(query);

    res.json({
      employers: employers.map(emp => ({
        id: emp._id,
        userId: emp.userId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        employerType: emp.employerType,
        companyName: emp.profile?.company?.name || 'N/A',
        teamMemberLimits: emp.teamMemberLimits,
        isEmployerVerified: emp.isEmployerVerified,
        verificationStatus: emp.verificationStatus,
        createdAt: emp.createdAt
      })),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get team limits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/team-limits/:id
// @desc    Update team member limit for a company/consultancy
// @access  Private (Admin)
router.put('/team-limits/:id', requirePermission('canManageUsers'), [
  body('maxTeamMembers').isInt({ min: 0 }).withMessage('Max team members must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { maxTeamMembers } = req.body;
    const employerId = req.params.id;

    const employer = await User.findById(employerId);
    if (!employer || employer.userType !== 'employer') {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Update team member limit
    employer.teamMemberLimits.maxTeamMembers = maxTeamMembers;
    employer.teamMemberLimits.limitSetBy = req.user._id;
    employer.teamMemberLimits.limitSetAt = new Date();

    await employer.save();

    res.json({
      message: 'Team member limit updated successfully',
      employer: {
        id: employer._id,
        userId: employer.userId,
        firstName: employer.firstName,
        lastName: employer.lastName,
        email: employer.email,
        employerType: employer.employerType,
        companyName: employer.profile?.company?.name || 'N/A',
        teamMemberLimits: employer.teamMemberLimits
      }
    });
  } catch (error) {
    console.error('Update team limit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/team-limits/:id/subusers
// @desc    Get subusers for a specific company/consultancy
// @access  Private (Admin)
router.get('/team-limits/:id/subusers', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const employerId = req.params.id;

    const employer = await User.findById(employerId);
    if (!employer || employer.userType !== 'employer') {
      return res.status(404).json({ message: 'Employer not found' });
    }

    const subusers = await User.getSubusers(employerId);

    res.json({
      employer: {
        id: employer._id,
        userId: employer.userId,
        firstName: employer.firstName,
        lastName: employer.lastName,
        email: employer.email,
        employerType: employer.employerType,
        companyName: employer.profile?.company?.name || 'N/A',
        teamMemberLimits: employer.teamMemberLimits
      },
      subusers: subusers.map(subuser => ({
        id: subuser._id,
        userId: subuser.userId,
        firstName: subuser.firstName,
        lastName: subuser.lastName,
        email: subuser.email,
        role: subuser.subuserRole,
        permissions: subuser.subuserPermissions,
        invitedAt: subuser.invitedAt,
        invitationAccepted: subuser.invitationAccepted,
        invitationAcceptedAt: subuser.invitationAcceptedAt,
        lastLogin: subuser.lastLogin,
        isActive: subuser.isActive
      }))
    });
  } catch (error) {
    console.error('Get employer subusers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/jobs
// @desc    Create a new job (Admin)
// @access  Private (Admin)
router.post('/jobs', [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('company.name').notEmpty().withMessage('Company name is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('salary.min').isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').isNumeric().withMessage('Maximum salary must be a number'),
  body('numberOfVacancy').isInt({ min: 1 }).withMessage('Number of vacancy must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Set default values for required fields if not provided
    const jobData = {
      // Basic job info
      title: req.body.title,
      description: req.body.description,
      
      // Company info
      company: {
        name: req.body.company?.name || 'Unknown Company',
        totalEmployees: req.body.company?.totalEmployees || '0-10',
        website: req.body.company?.website || '',
        type: req.body.company?.type || 'Startup',
        industry: req.body.company?.industry || ''
      },
      
      // Job details
      jobPostType: req.body.jobPostType || 'Sales',
      employmentType: req.body.employmentType || 'Permanent',
      jobModeType: req.body.jobModeType || 'Full Time',
      jobShiftType: req.body.jobShiftType || 'Day Shift',
      skills: req.body.skills || [],
      
      // Location
      location: {
        state: req.body.location?.state || 'Maharashtra',
        city: req.body.location?.city || 'Mumbai',
        locality: req.body.location?.locality || '',
        distanceFromLocation: req.body.location?.distanceFromLocation || '',
        includeWillingToRelocate: req.body.location?.includeWillingToRelocate || false
      },
      
      // Experience
      experienceType: req.body.experienceType || 'Fresher',
      totalExperience: {
        min: req.body.totalExperience?.min || req.body.totalExperience || 'Fresher',
        max: req.body.totalExperience?.max || req.body.totalExperience || 'Fresher'
      },
      
      // Salary
      salary: {
        min: req.body.salary?.min || 10000,
        max: req.body.salary?.max || 20000,
        currency: req.body.salary?.currency || 'INR',
        hideFromCandidates: req.body.salary?.hideFromCandidates || false
      },
      
      // Vacancy
      numberOfVacancy: req.body.numberOfVacancy || 1,
      
      // HR Contact
      hrContact: {
        name: req.body.hrContact?.name || 'HR Contact',
        number: req.body.hrContact?.number || '0000000000',
        email: req.body.hrContact?.email || 'hr@company.com',
        whatsappNumber: req.body.hrContact?.whatsappNumber || '',
        timing: req.body.hrContact?.timing || { start: '', end: '' },
        days: req.body.hrContact?.days || []
      },
      
      // Additional fields
      includeWalkinDetails: req.body.includeWalkinDetails || false,
      status: 'active',
      postedBy: req.user.id,
      
      // Master data fields
      educationLevel: req.body.educationLevel ? JSON.parse(req.body.educationLevel) : null,
      course: req.body.course ? JSON.parse(req.body.course) : null,
      specialization: req.body.specialization ? JSON.parse(req.body.specialization) : null,
      jobRoles: req.body.jobRoles ? JSON.parse(req.body.jobRoles) : [],
      industries: req.body.industries ? JSON.parse(req.body.industries) : [],
      subIndustries: req.body.subIndustries ? JSON.parse(req.body.subIndustries) : [],
      departments: req.body.departments ? JSON.parse(req.body.departments) : [],
      subDepartments: req.body.subDepartments ? JSON.parse(req.body.subDepartments) : [],
      jobTitles: req.body.jobTitles ? JSON.parse(req.body.jobTitles) : [],
      keySkills: req.body.keySkills ? JSON.parse(req.body.keySkills) : []
    };

    console.log('Creating job with data:', JSON.stringify(jobData, null, 2));

    const job = new Job(jobData);
    await job.save();

    // Handle Google Job Posting if enabled
    if (jobData.enableGoogleJobPost) {
      try {
        const googleJobPostingService = require('../services/googleJobPostingService');
        const googleResult = await googleJobPostingService.postJobToGoogle(job);
        
        if (googleResult.success) {
          job.googleJobPostStatus = 'posted';
          job.googleJobPostId = googleResult.googleJobId;
          job.googleJobPostUrl = googleResult.googleJobUrl;
          await job.save();
          console.log('Job successfully posted to Google for Jobs');
        } else {
          job.googleJobPostStatus = 'failed';
          await job.save();
          console.error('Failed to post job to Google for Jobs:', googleResult.error);
        }
      } catch (error) {
        console.error('Error in Google Job Posting:', error);
        job.googleJobPostStatus = 'failed';
        await job.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: job,
      googleJobPostStatus: job.googleJobPostStatus
    });
  } catch (error) {
    console.error('Error creating job:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while creating job: ' + error.message
    });
  }
});

// ==================== PACKAGE MANAGEMENT ROUTES ====================

// @route   GET /api/admin/packages
// @desc    Get all packages with admin filters
// @access  Private (Admin)
router.get('/packages', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const packageType = req.query.packageType || '';
    const isActive = req.query.isActive;

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (packageType) {
      query.packageType = packageType;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const packages = await Package.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Package.countDocuments(query);

    res.json({
      success: true,
      packages,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/packages/:id
// @desc    Get single package by ID
// @access  Private (Admin)
router.get('/packages/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const package = await Package.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({ success: true, package });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/packages
// @desc    Create new package
// @access  Private (Admin)
router.post('/packages', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Package name is required'),
  body('description').notEmpty().withMessage('Package description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('packageType').isIn(['employer', 'candidate']).withMessage('Invalid package type'),
  body('period').isIn(['days', 'months', 'years']).withMessage('Invalid period'),
  body('periodValue').isInt({ min: 1 }).withMessage('Period value must be at least 1'),
  body('features').isArray().withMessage('Features must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const packageData = {
      ...req.body,
      createdBy: req.user._id
    };

    const newPackage = new Package(packageData);
    await newPackage.save();

    await newPackage.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      package: newPackage
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/packages/:id
// @desc    Update package
// @access  Private (Admin)
router.put('/packages/:id', requirePermission('canManageSettings'), [
  body('name').optional().notEmpty().withMessage('Package name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Package description cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('packageType').optional().isIn(['employer', 'candidate']).withMessage('Invalid package type'),
  body('period').optional().isIn(['days', 'months', 'years']).withMessage('Invalid period'),
  body('periodValue').optional().isInt({ min: 1 }).withMessage('Period value must be at least 1'),
  body('features').optional().isArray().withMessage('Features must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const updates = req.body;
    updates.updatedBy = req.user._id;
    
    const allowedUpdates = [
      'name', 'description', 'price', 'currency', 'packageType', 
      'period', 'periodValue', 'features', 'isActive', 'isFeatured', 
      'displayOrder', 'gstApplicable', 'supportIncluded', 'supportDetails'
    ];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('updatedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Package updated successfully',
      package: updatedPackage
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/packages/:id
// @desc    Delete package
// @access  Private (Admin)
router.delete('/packages/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    await Package.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/packages/:id/toggle-active
// @desc    Toggle package active status
// @access  Private (Admin)
router.put('/packages/:id/toggle-active', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    await package.toggleActive();

    res.json({
      success: true,
      message: `Package ${package.isActive ? 'activated' : 'deactivated'} successfully`,
      package
    });
  } catch (error) {
    console.error('Toggle package active status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/packages/:id/toggle-featured
// @desc    Toggle package featured status
// @access  Private (Admin)
router.put('/packages/:id/toggle-featured', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    await package.toggleFeatured();

    res.json({
      success: true,
      message: `Package ${package.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      package
    });
  } catch (error) {
    console.error('Toggle package featured status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/packages/stats
// @desc    Get package statistics
// @access  Private (Admin)
router.get('/packages/stats', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const totalPackages = await Package.countDocuments();
    const activePackages = await Package.countDocuments({ isActive: true });
    const featuredPackages = await Package.countDocuments({ isFeatured: true });
    const employerPackages = await Package.countDocuments({ packageType: 'employer' });
    const candidatePackages = await Package.countDocuments({ packageType: 'candidate' });

    res.json({
      success: true,
      totalPackages,
      activePackages,
      featuredPackages,
      employerPackages,
      candidatePackages,
      inactivePackages: totalPackages - activePackages
    });
  } catch (error) {
    console.error('Get package stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== COMMENT SETTINGS ROUTES ====================

// @route   GET /api/admin/comment-settings
// @desc    Get comment settings for social updates
// @access  Private (Admin)
router.get('/comment-settings', requirePermission('canManageSettings'), async (req, res) => {
  try {
    // For now, we'll return default settings
    // In a real implementation, you might want to store these in a separate settings collection
    const settings = {
      candidateCommentsEnabled: true,
      employerCommentsEnabled: true
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get comment settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/comment-settings
// @desc    Update comment settings for social updates
// @access  Private (Admin)
router.put('/comment-settings', [
  requirePermission('canManageSettings'),
  body('candidateCommentsEnabled').isBoolean().withMessage('Candidate comments enabled must be a boolean'),
  body('employerCommentsEnabled').isBoolean().withMessage('Employer comments enabled must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { candidateCommentsEnabled, employerCommentsEnabled } = req.body;

    // In a real implementation, you would save these settings to a database
    // For now, we'll just return success
    // You could create a Settings model to store these globally

    res.json({
      success: true,
      message: 'Comment settings updated successfully',
      settings: {
        candidateCommentsEnabled,
        employerCommentsEnabled
      }
    });
  } catch (error) {
    console.error('Update comment settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/social-updates/:id/comment-settings
// @desc    Update comment settings for a specific social update
// @access  Private (Admin)
router.put('/social-updates/:id/comment-settings', [
  requirePermission('canManageSettings'),
  body('candidateCommentsEnabled').isBoolean().withMessage('Candidate comments enabled must be a boolean'),
  body('employerCommentsEnabled').isBoolean().withMessage('Employer comments enabled must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const SocialUpdate = require('../models/SocialUpdate');
    const { candidateCommentsEnabled, employerCommentsEnabled } = req.body;

    const socialUpdate = await SocialUpdate.findById(req.params.id);
    if (!socialUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Social update not found'
      });
    }

    socialUpdate.commentSettings = {
      candidateCommentsEnabled,
      employerCommentsEnabled
    };

    await socialUpdate.save();

    res.json({
      success: true,
      message: 'Comment settings updated successfully',
      socialUpdate
    });
  } catch (error) {
    console.error('Update social update comment settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== EMAIL TEMPLATE TEST ROUTES (NO AUTH) ====================

// @route   GET /api/admin/test/email-templates
// @desc    Get all email templates with pagination (test route - no auth)
// @access  Public (for testing)
router.get('/test/email-templates', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || null;

    const result = await emailTemplateService.getTemplates(page, limit, type);
    
    res.json({
      success: true,
      data: result.templates,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email templates',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/test/email-templates/stats
// @desc    Get email template statistics (test route - no auth)
// @access  Public (for testing)
router.get('/test/email-templates/stats', async (req, res) => {
  try {
    const stats = await emailTemplateService.getTemplateStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching email template stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email template statistics',
      error: error.message 
    });
  }
});

// ==================== EMAIL TEMPLATE MANAGEMENT ====================

// @route   GET /api/admin/email-templates
// @desc    Get all email templates with pagination
// @access  Private (Admin)
router.get('/email-templates', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || null;

    const result = await emailTemplateService.getTemplates(page, limit, type);

    res.json({
      success: true,
      data: result.templates,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/email-templates/:id
// @desc    Get email template by ID
// @access  Private (Admin)
router.get('/email-templates/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const template = await emailTemplateService.getTemplateById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/email-templates
// @desc    Create new email template
// @access  Private (Admin)
router.post('/email-templates', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Template name is required'),
  body('type').isIn(['job_apply_invite', 'employer_confirmation', 'employer_welcome', 'jobseeker_welcome', 'company_welcome', 'consultancy_welcome']).withMessage('Invalid template type'),
  body('subject').notEmpty().withMessage('Email subject is required'),
  body('htmlContent').notEmpty().withMessage('HTML content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const template = await emailTemplateService.createTemplate(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Email template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Create email template error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   PUT /api/admin/email-templates/:id
// @desc    Update email template
// @access  Private (Admin)
router.put('/email-templates/:id', requirePermission('canManageSettings'), [
  body('name').optional().notEmpty().withMessage('Template name cannot be empty'),
  body('type').optional().isIn(['job_apply_invite', 'employer_confirmation', 'employer_welcome', 'jobseeker_welcome', 'company_welcome', 'consultancy_welcome']).withMessage('Invalid template type'),
  body('subject').optional().notEmpty().withMessage('Email subject cannot be empty'),
  body('htmlContent').optional().notEmpty().withMessage('HTML content cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const template = await emailTemplateService.updateTemplate(req.params.id, req.body, req.user.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    res.json({
      success: true,
      message: 'Email template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Update email template error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   DELETE /api/admin/email-templates/:id
// @desc    Delete email template
// @access  Private (Admin)
router.delete('/email-templates/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const template = await emailTemplateService.deleteTemplate(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    res.json({
      success: true,
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    console.error('Delete email template error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/email-templates/:id/set-default
// @desc    Set email template as default
// @access  Private (Admin)
router.post('/email-templates/:id/set-default', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const template = await emailTemplateService.setDefaultTemplate(req.params.id);

    res.json({
      success: true,
      message: 'Template set as default successfully',
      data: template
    });
  } catch (error) {
    console.error('Set default template error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/email-templates/initialize-defaults
// @desc    Initialize default email templates
// @access  Private (Super Admin)
router.post('/email-templates/initialize-defaults', superAdminAuth, async (req, res) => {
  try {
    await emailTemplateService.createDefaultTemplates(req.user.id);

    res.json({
      success: true,
      message: 'Default email templates initialized successfully'
    });
  } catch (error) {
    console.error('Initialize default templates error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/email-templates/stats
// @desc    Get email template statistics
// @access  Private (Admin)
router.get('/email-templates/stats', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const stats = await emailTemplateService.getTemplateStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get email template stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/email-templates/test
// @desc    Test email template by sending a test email
// @access  Private (Admin)
router.post('/email-templates/test', requirePermission('canManageSettings'), [
  body('templateId').notEmpty().withMessage('Template ID is required'),
  body('testEmail').isEmail().withMessage('Valid test email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { templateId, testEmail, variables = {} } = req.body;
    const template = await EmailTemplate.findById(templateId);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    const result = await emailTemplateService.sendEmailWithTemplate(template.type, testEmail, variables);

    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      data: result
    });
  } catch (error) {
    console.error('Test email template error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// ==================== MASTER DATA MANAGEMENT ROUTES ====================

// @route   GET /api/admin/master-data/industries
// @desc    Get all industries for admin management
// @access  Public (for testing)
router.get('/master-data/industries', async (req, res) => {
  try {
    const Industry = require('../models/Industry');
    const industries = await Industry.find({ isActive: true }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: industries.map(industry => ({
        id: industry._id,
        name: industry.name,
        subcategories: industry.subcategories || []
      }))
    });
  } catch (error) {
    console.error('Get industries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/industries
// @desc    Add new industry
// @access  Private (Admin)
router.post('/master-data/industries', adminAuth, requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Industry name is required'),
  body('subcategories').optional().isArray().withMessage('Subcategories must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Industry = require('../models/Industry');
    const { name, subcategories = [] } = req.body;
    
    const industry = new Industry({
      name: name.trim(),
      subcategories: subcategories.map(sub => sub.trim()).filter(sub => sub)
    });
    
    await industry.save();
    
    res.status(201).json({
      success: true,
      data: industry,
      message: 'Industry added successfully'
    });
  } catch (error) {
    console.error('Add industry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/master-data/industries/:id
// @desc    Update industry
// @access  Private (Admin)
router.put('/master-data/industries/:id', adminAuth, requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Industry name is required'),
  body('subcategories').optional().isArray().withMessage('Subcategories must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Industry = require('../models/Industry');
    const { name, subcategories = [] } = req.body;
    
    const industry = await Industry.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        subcategories: subcategories.map(sub => sub.trim()).filter(sub => sub),
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!industry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    
    res.json({
      success: true,
      data: industry,
      message: 'Industry updated successfully'
    });
  } catch (error) {
    console.error('Update industry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/industries/:id
// @desc    Delete industry
// @access  Private (Admin)
router.delete('/master-data/industries/:id', adminAuth, requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Industry = require('../models/Industry');
    const industry = await Industry.findByIdAndDelete(req.params.id);
    
    if (!industry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    
    res.json({
      success: true,
      message: 'Industry deleted successfully'
    });
  } catch (error) {
    console.error('Delete industry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/master-data/departments
// @desc    Get all departments for admin management
// @access  Public (for testing)
router.get('/master-data/departments', async (req, res) => {
  try {
    const Department = require('../models/Department');
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: departments.map(dept => ({
        id: dept._id,
        name: dept.name,
        description: dept.description || '',
        subcategories: dept.subcategories || [],
        isActive: dept.isActive
      }))
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/departments
// @desc    Add new department
// @access  Private (Admin)
router.post('/master-data/departments', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Department name is required'),
  body('description').optional().isString(),
  body('subcategories').optional().isArray().withMessage('Subcategories must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Department = require('../models/Department');
    const { name, description = '', subcategories = [] } = req.body;
    
    const department = new Department({
      name: name.trim(),
      description: description.trim(),
      subcategories: subcategories.map(sub => sub.trim()).filter(sub => sub),
      isActive: true
    });
    
    await department.save();
    
    res.status(201).json({
      success: true,
      data: department,
      message: 'Department added successfully'
    });
  } catch (error) {
    console.error('Add department error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Department with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/departments/:id
// @desc    Delete department
// @access  Private (Admin)
router.delete('/master-data/departments/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Department = require('../models/Department');
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Soft delete by setting isActive to false
    department.isActive = false;
    await department.save();
    
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/master-data/departments/:id
// @desc    Update department
// @access  Private (Admin)
router.put('/master-data/departments/:id', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Department name is required'),
  body('description').optional().isString(),
  body('subcategories').optional().isArray().withMessage('Subcategories must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Department = require('../models/Department');
    const { name, description, subcategories, isActive } = req.body;
    
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    department.name = name.trim();
    department.description = description ? description.trim() : department.description;
    department.subcategories = subcategories ? subcategories.map(sub => sub.trim()).filter(sub => sub) : department.subcategories;
    department.isActive = isActive !== undefined ? isActive : department.isActive;
    
    await department.save();
    
    res.json({
      success: true,
      data: department,
      message: 'Department updated successfully'
    });
  } catch (error) {
    console.error('Update department error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Department with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/departments/:id/subcategories
// @desc    Add subcategory to department
// @access  Private (Admin)
router.post('/master-data/departments/:id/subcategories', requirePermission('canManageSettings'), [
  body('subcategory').notEmpty().withMessage('Subcategory name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Department = require('../models/Department');
    const { subcategory } = req.body;
    
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    if (!department.subcategories.includes(subcategory.trim())) {
      department.subcategories.push(subcategory.trim());
      await department.save();
    }
    
    res.json({
      success: true,
      data: department,
      message: 'Subcategory added successfully'
    });
  } catch (error) {
    console.error('Add subcategory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/departments/:id/subcategories/:subcategory
// @desc    Remove subcategory from department
// @access  Private (Admin)
router.delete('/master-data/departments/:id/subcategories/:subcategory', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Department = require('../models/Department');
    const { subcategory } = req.params;
    
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    department.subcategories = department.subcategories.filter(sub => sub !== decodeURIComponent(subcategory));
    await department.save();
    
    res.json({
      success: true,
      data: department,
      message: 'Subcategory removed successfully'
    });
  } catch (error) {
    console.error('Remove subcategory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/master-data/job-roles
// @desc    Get all job roles for admin management
// @access  Private (Admin)
router.get('/master-data/job-roles', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const JobRole = require('../models/JobRole');
    const jobRoles = await JobRole.find({ isActive: true }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: jobRoles.map(role => ({
        id: role._id,
        name: role.name,
        category: role.category,
        usageCount: role.usageCount || 0
      }))
    });
  } catch (error) {
    console.error('Get job roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/job-roles
// @desc    Add new job role
// @access  Private (Admin)
router.post('/master-data/job-roles', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Job role name is required'),
  body('category').optional().isString().withMessage('Category must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const JobRole = require('../models/JobRole');
    const { name, category = 'Other' } = req.body;
    
    const jobRole = await JobRole.addOrUpdateJobRole(
      name.trim(),
      category,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      data: {
        id: jobRole._id,
        name: jobRole.name,
        category: jobRole.category,
        usageCount: jobRole.usageCount
      },
      message: 'Job role added successfully'
    });
  } catch (error) {
    console.error('Add job role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/job-roles/:id
// @desc    Delete job role
// @access  Private (Admin)
router.delete('/master-data/job-roles/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const JobRole = require('../models/JobRole');
    const jobRole = await JobRole.findByIdAndDelete(req.params.id);
    
    if (!jobRole) {
      return res.status(404).json({ message: 'Job role not found' });
    }
    
    res.json({
      success: true,
      message: 'Job role deleted successfully'
    });
  } catch (error) {
    console.error('Delete job role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/master-data/job-titles
// @desc    Get all job titles for admin management
// @access  Private (Admin)
router.get('/master-data/job-titles', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const JobTitle = require('../models/JobTitle');
    const jobTitles = await JobTitle.find({}).sort({ usageCount: -1, name: 1 });
    
    res.json({
      success: true,
      data: jobTitles.map(jobTitle => ({
        id: jobTitle._id,
        name: jobTitle.name,
        category: jobTitle.category,
        usageCount: jobTitle.usageCount || 0
      }))
    });
  } catch (error) {
    console.error('Get job titles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/master-data/skills
// @desc    Get Key Skills options from CustomFields (master data)
// @access  Public (for admin panel)
router.get('/master-data/skills', async (req, res) => {
  try {
    const CustomField = require('../models/CustomField');
    const field = await CustomField.findOne({ fieldId: 'keySkills' });
    const options = field?.options || [];

    res.json({
      success: true,
      data: options.map((opt, index) => ({
        id: index, // options don't have ids; expose index for UI
        name: opt.label || opt.value,
        category: opt.category || 'GENERAL'
      }))
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/skills
// @desc    Add a new Key Skill option into CustomFields
// @access  Private (Admin)
router.post('/master-data/skills', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Skill name is required'),
  body('category').optional().isString().withMessage('Category must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const CustomField = require('../models/CustomField');
    const { name, category = 'GENERAL' } = req.body;
    const field = await CustomField.findOne({ fieldId: 'keySkills' });
    const options = field?.options || [];

    if (options.find(o => (o.label || o.value).toLowerCase() === name.trim().toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Skill already exists' });
    }

    const newOption = { 
      value: name.trim(), 
      label: name.trim(), 
      category: category.trim(),
      order: options.length 
    };

    const updated = await CustomField.findOneAndUpdate(
      { fieldId: 'keySkills' },
      { $set: { fieldId: 'keySkills' }, $push: { options: newOption } },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, data: newOption, total: updated.options.length });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/skills/:name
// @desc    Delete a Key Skill option by name
// @access  Private (Admin)
router.delete('/master-data/skills/:name', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const CustomField = require('../models/CustomField');
    const name = decodeURIComponent(req.params.name);

    const field = await CustomField.findOne({ fieldId: 'keySkills' });
    if (!field) {
      return res.status(404).json({ message: 'Key skills field not found' });
    }

    const before = field.options.length;
    field.options = field.options.filter(o => (o.label || o.value).toLowerCase() !== name.toLowerCase());
    if (field.options.length === before) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    await field.save();

    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/skills/seed
// @desc    Seed default key skills into CustomFields
// @access  Public (for admin panel)
router.post('/master-data/skills/seed', async (req, res) => {
  try {
    const { createKeySkillsField, keySkills } = require('../seed-key-skills');
    await createKeySkillsField();
    res.json({ success: true, message: 'Key skills seeded successfully', total: keySkills.length });
  } catch (error) {
    console.error('Seed key skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/master-data/key-skills
// @desc    Get Key Skills from KeySkill model (master data)
// @access  Private (Admin)
router.get('/master-data/key-skills', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const KeySkill = require('../models/KeySkill');
    const query = req.query.search || '';
    const limit = parseInt(req.query.limit) || 50;
    
    let skills;
    if (query) {
      skills = await KeySkill.searchKeySkills(query, limit);
    } else {
      skills = await KeySkill.getSuggestions('', limit);
    }
    
    res.json({
      success: true,
      data: skills.map(skill => ({
        id: skill._id,
        name: skill.name,
        category: skill.category,
        skillType: skill.skillType,
        usageCount: skill.usageCount || 0
      }))
    });
  } catch (error) {
    console.error('Get key skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/key-skills
// @desc    Add a new Key Skill to KeySkill model
// @access  Private (Admin)
router.post('/master-data/key-skills', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Skill name is required'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('skillType').optional().isString().withMessage('Skill type must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const KeySkill = require('../models/KeySkill');
    const { name, category = 'Key Skills', skillType = 'Technical', description = '', tags = [] } = req.body;
    
    const skill = await KeySkill.addOrUpdateKeySkill(
      name.trim(), 
      category.trim(), 
      skillType.trim(), 
      req.user.id, 
      description.trim(), 
      tags
    );

    res.status(201).json({ 
      success: true, 
      data: {
        id: skill._id,
        name: skill.name,
        category: skill.category,
        skillType: skill.skillType,
        usageCount: skill.usageCount
      }
    });
  } catch (error) {
    console.error('Add key skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/master-data/specializations
// @desc    Get all specializations for admin management
// @access  Private (Admin)
router.get('/master-data/specializations', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Specialization = require('../models/Specialization');
    const specializations = await Specialization.find({ isActive: true }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: specializations.map(spec => ({
        id: spec._id,
        name: spec.name,
        description: spec.description,
        field: spec.field,
        level: spec.level
      }))
    });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/specializations
// @desc    Add new specialization
// @access  Private (Admin)
router.post('/master-data/specializations', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Specialization name is required'),
  body('field').optional().isString().withMessage('Field must be a string'),
  body('level').optional().isString().withMessage('Level must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Specialization = require('../models/Specialization');
    const { name, description, field, level } = req.body;
    
    const specialization = new Specialization({
      name: name.trim(),
      description: description?.trim() || '',
      field: field || 'Other',
      level: level || 'Graduate',
      createdBy: req.user.id
    });
    
    await specialization.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: specialization._id,
        name: specialization.name,
        description: specialization.description,
        field: specialization.field,
        level: specialization.level
      },
      message: 'Specialization added successfully'
    });
  } catch (error) {
    console.error('Add specialization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/specializations/:id
// @desc    Delete specialization
// @access  Private (Admin)
router.delete('/master-data/specializations/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Specialization = require('../models/Specialization');
    const specialization = await Specialization.findByIdAndDelete(req.params.id);
    
    if (!specialization) {
      return res.status(404).json({ message: 'Specialization not found' });
    }
    
    res.json({
      success: true,
      message: 'Specialization deleted successfully'
    });
  } catch (error) {
    console.error('Delete specialization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/master-data/courses
// @desc    Get all courses for admin management
// @access  Private (Admin)
router.get('/master-data/courses', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Course = require('../models/Course');
    const courses = await Course.find({ isActive: true }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: courses.map(course => ({
        id: course._id,
        name: course.name,
        description: course.description,
        duration: course.duration,
        level: course.level,
        category: course.category
      }))
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/courses
// @desc    Add new course
// @access  Private (Admin)
router.post('/master-data/courses', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Course name is required'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('level').optional().isString().withMessage('Level must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Course = require('../models/Course');
    const { name, description, duration, level, category } = req.body;
    
    const course = new Course({
      name: name.trim(),
      description: description?.trim() || '',
      duration: duration?.trim() || '',
      level: level || 'Certificate',
      category: category || 'Technical',
      createdBy: req.user.id
    });
    
    await course.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: course._id,
        name: course.name,
        description: course.description,
        duration: course.duration,
        level: course.level,
        category: course.category
      },
      message: 'Course added successfully'
    });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/courses/:id
// @desc    Delete course
// @access  Private (Admin)
router.delete('/master-data/courses/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Course = require('../models/Course');
    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/master-data/locations
// @desc    Get all locations for admin management
// @access  Private (Admin)
router.get('/master-data/locations', requirePermission('canManageSettings'), async (req, res) => {
  try {
    // For now, return mock data since locations route uses mock data
    const locations = [
      { id: 1, city: 'Mumbai', state: 'Maharashtra', country: 'India', type: 'Metro' },
      { id: 2, city: 'Delhi', state: 'Delhi', country: 'India', type: 'Metro' },
      { id: 3, city: 'Bangalore', state: 'Karnataka', country: 'India', type: 'Metro' },
      { id: 4, city: 'Chennai', state: 'Tamil Nadu', country: 'India', type: 'Metro' },
      { id: 5, city: 'Hyderabad', state: 'Telangana', country: 'India', type: 'Metro' },
      { id: 6, city: 'Pune', state: 'Maharashtra', country: 'India', type: 'Tier-1' },
      { id: 7, city: 'Kolkata', state: 'West Bengal', country: 'India', type: 'Metro' },
      { id: 8, city: 'Ahmedabad', state: 'Gujarat', country: 'India', type: 'Tier-1' },
      { id: 9, city: 'Jaipur', state: 'Rajasthan', country: 'India', type: 'Tier-1' },
      { id: 10, city: 'Surat', state: 'Gujarat', country: 'India', type: 'Tier-1' }
    ];
    
    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/locations
// @desc    Add new location
// @access  Private (Admin)
router.post('/master-data/locations', requirePermission('canManageSettings'), [
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('country').notEmpty().withMessage('Country is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { city, state, country, type } = req.body;
    
    // For now, just return success since locations use mock data
    // In a real implementation, you would save to database
    const newLocation = {
      id: Date.now(), // Simple ID generation
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      type: type || 'Other'
    };
    
    res.status(201).json({
      success: true,
      data: newLocation,
      message: 'Location added successfully'
    });
  } catch (error) {
    console.error('Add location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/locations/:id
// @desc    Delete location
// @access  Private (Admin)
router.delete('/master-data/locations/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    // For now, just return success since locations use mock data
    // In a real implementation, you would delete from database
    
    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== EMAIL SENDING ROUTES ====================

// @route   POST /api/admin/send-job-invite
// @desc    Send job apply invite email to candidate
// @access  Private (Admin)
router.post('/send-job-invite', requirePermission('canManageJobs'), [
  body('candidateEmail').isEmail().withMessage('Valid candidate email is required'),
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('candidateName').optional().isString().withMessage('Candidate name must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { candidateEmail, jobId, candidateName } = req.body;

    // Get job details
    const job = await Job.findById(jobId).populate('postedBy', 'firstName lastName email profile');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Prepare job and company data
    const jobData = {
      _id: job._id,
      title: job.title,
      location: job.location,
      salary: job.salary,
      description: job.description,
      candidateName: candidateName || 'Candidate'
    };

    const companyData = {
      name: job.postedBy.profile?.company?.name || `${job.postedBy.firstName} ${job.postedBy.lastName}`,
      website: job.postedBy.profile?.company?.website || '',
      hrName: job.postedBy.firstName + ' ' + job.postedBy.lastName,
      hrEmail: job.postedBy.email,
      hrPhone: job.postedBy.phone || ''
    };

    // Send job invite email
    const result = await emailTemplateService.sendJobApplyInvite(candidateEmail, jobData, companyData);

    res.json({
      success: result.success,
      message: result.success ? 'Job invite sent successfully' : 'Failed to send job invite',
      data: result
    });

  } catch (error) {
    console.error('Send job invite error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/send-employer-confirmation
// @desc    Send terms and conditions confirmation email to employer
// @access  Private (Admin)
router.post('/send-employer-confirmation', requirePermission('canManageUsers'), [
  body('employerId').notEmpty().withMessage('Employer ID is required'),
  body('termsVersion').optional().isString().withMessage('Terms version must be a string'),
  body('termsUrl').optional().isURL().withMessage('Terms URL must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { employerId, termsVersion, termsUrl } = req.body;

    // Get employer details
    const employer = await User.findById(employerId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    if (employer.userType !== 'employer') {
      return res.status(400).json({
        success: false,
        message: 'User is not an employer'
      });
    }

    // Prepare employer and terms data
    const employerData = {
      firstName: employer.firstName,
      lastName: employer.lastName,
      profile: employer.profile
    };

    const termsData = {
      version: termsVersion || '1.0',
      url: termsUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/terms`
    };

    // Send employer confirmation email
    const result = await emailTemplateService.sendEmployerConfirmation(employer.email, employerData, termsData);

    res.json({
      success: result.success,
      message: result.success ? 'Employer confirmation sent successfully' : 'Failed to send employer confirmation',
      data: result
    });

  } catch (error) {
    console.error('Send employer confirmation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/send-employer-welcome
// @desc    Send welcome email to employer
// @access  Private (Admin)
router.post('/send-employer-welcome', requirePermission('canManageUsers'), [
  body('employerId').notEmpty().withMessage('Employer ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { employerId } = req.body;

    // Get employer details
    const employer = await User.findById(employerId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    if (employer.userType !== 'employer') {
      return res.status(400).json({
        success: false,
        message: 'User is not an employer'
      });
    }

    // Send employer welcome email
    const result = await emailTemplateService.sendEmployerWelcome(employer.email, employer);

    res.json({
      success: result.success,
      message: result.success ? 'Employer welcome sent successfully' : 'Failed to send employer welcome',
      data: result
    });

  } catch (error) {
    console.error('Send employer welcome error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;
