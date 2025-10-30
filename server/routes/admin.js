const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Package = require('../models/Package');
const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');
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

// @route   GET /api/admin/users/count
// @desc    Get total user count
// @access  Private (Admin)
router.get('/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('User count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/recent
// @desc    Get recent users
// @access  Private (Admin)
router.get('/users/recent', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role isActive createdAt');
    res.json({ users });
  } catch (error) {
    console.error('Recent users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/users/:id/verify
// @desc    Verify user
// @access  Private (Admin)
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedAt: new Date() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, message: 'User verified successfully' });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/users/:id/unverify
// @desc    Unverify user
// @access  Private (Admin)
router.patch('/users/:id/unverify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: false, verifiedAt: null },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, message: 'User unverified successfully' });
  } catch (error) {
    console.error('Unverify user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users/create
// @desc    Create a new user manually
// @access  Private (Admin)
router.post('/users/create', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate role
    const validRoles = ['JOBSEEKER', 'EMPLOYER'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid role. Must be JOBSEEKER or EMPLOYER' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Map role to userType
    const userType = role.toUpperCase() === 'JOBSEEKER' ? 'jobseeker' : 'employer';

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      userType,
      role: role.toUpperCase(),
      isActive: true,
      isVerified: false
    });

    await newUser.save();

    res.status(201).json({ 
      user: newUser, 
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/users/bulk-import
// @desc    Bulk import users from CSV
// @access  Private (Admin)
router.post('/users/bulk-import', async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Invalid users data' });
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };

    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          results.failed++;
          results.errors.push(`User with email ${userData.email} already exists`);
          continue;
        }

        // Create new user
        const user = new User({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role || 'JOBSEEKER',
          isActive: true,
          isVerified: false
        });

        await user.save();
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to import ${userData.email}: ${error.message}`);
      }
    }

    res.json({
      message: `Successfully imported ${results.imported} users. Failed: ${results.failed}`,
      imported: results.imported,
      failed: results.failed,
      errors: results.errors
    });
  } catch (error) {
    console.error('Bulk import error:', error);
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

    console.log('GET /admin/users - Query params:', { page, limit, search, userType, isActive });

    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (userType) {
      // Support comma-separated userTypes
      const userTypes = userType.split(',').map(ut => ut.trim());
      console.log('Filtering by userTypes:', userTypes);
      if (userTypes.length > 1) {
        query.userType = { $in: userTypes };
      } else {
        query.userType = userTypes[0];
      }
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    console.log('MongoDB query:', JSON.stringify(query));

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

    console.log(`Found ${users.length} users (total: ${total})`);

    // Transform users to match frontend expectations
    const transformedUsers = users.map(user => {
      const userObj = user.toObject();
      return {
        ...userObj,
        name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || 'N/A',
        role: userObj.userType ? userObj.userType.toUpperCase() : 'N/A',
        lastActive: userObj.userProfile?.profileStatus?.lastActive || userObj.lastLogin,
        lastModified: userObj.userProfile?.profileStatus?.lastModified || userObj.updatedAt,
        teamLimit: userObj.teamMemberLimits?.maxTeamMembers || 0,
        currentTeamMembers: userObj.teamMemberLimits?.currentTeamMembers || 0,
        companyName: userObj.profile?.company?.name || userObj.companyName || null
      };
    });

    console.log('Returning transformed users:', transformedUsers.length);

    res.json({
      users: transformedUsers,
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

// @route   PATCH /api/admin/users/:id
// @desc    Update user (partial update)
// @access  Private (Admin)
router.patch('/users/:id', requirePermission('canManageUsers'), [
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

// @route   PATCH /api/admin/users/:id/team-limit
// @desc    Update team limit for employer/consultancy
// @access  Private (Admin)
router.patch('/users/:id/team-limit', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { teamLimit } = req.body;

    if (teamLimit === undefined || teamLimit === null || isNaN(teamLimit) || teamLimit < 0) {
      return res.status(400).json({ message: 'Team limit must be a non-negative number' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow team limit updates for company and consultancy users
    if (user.userType !== 'company' && user.userType !== 'consultancy') {
      return res.status(400).json({ message: 'Team limit can only be set for company and consultancy users' });
    }

    // Update team limit
    if (!user.teamMemberLimits) {
      user.teamMemberLimits = {};
    }
    user.teamMemberLimits.maxTeamMembers = parseInt(teamLimit);
    user.teamMemberLimits.limitSetBy = req.user._id;
    user.teamMemberLimits.limitSetAt = new Date();
    
    await user.save();

    res.json({
      message: 'Team limit updated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        teamLimit: user.teamMemberLimits.maxTeamMembers,
        currentTeamMembers: user.teamMemberLimits.currentTeamMembers || 0
      }
    });
  } catch (error) {
    console.error('Update team limit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

// @route   GET /api/admin/roles
// @desc    Get all roles with user counts
// @access  Private (Admin)
router.get('/roles', requirePermission('canManageUsers'), async (req, res) => {
  try {
    // Define role types and their permissions
    const roleDefinitions = {
      superadmin: {
        name: 'Super Admin',
        permissions: ['all'],
        description: 'Full access to all features and settings'
      },
      admin: {
        name: 'Admin',
        permissions: ['manage_users', 'manage_jobs', 'manage_applications', 'view_analytics', 'manage_content'],
        description: 'Can manage users, jobs, and applications'
      },
      moderator: {
        name: 'Moderator',
        permissions: ['view_users', 'manage_jobs', 'manage_content'],
        description: 'Can moderate content and manage jobs'
      },
      employer: {
        name: 'Employer',
        permissions: ['post_jobs', 'view_applications', 'manage_company'],
        description: 'Can post jobs and manage applications'
      },
      jobseeker: {
        name: 'Job Seeker',
        permissions: ['apply_jobs', 'view_jobs', 'manage_profile'],
        description: 'Can apply to jobs and manage profile'
      }
    };

    // Count users for each role
    const roles = await Promise.all(
      Object.entries(roleDefinitions).map(async ([key, roleInfo]) => {
        const userCount = await User.countDocuments({ userType: key });
        return {
          id: key,
          name: roleInfo.name,
          permissions: roleInfo.permissions,
          description: roleInfo.description,
          users: userCount,
          canDelete: key !== 'superadmin' && key !== 'admin'
        };
      })
    );

    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/roles/:roleId
// @desc    Update role permissions
// @access  Private (Admin)
router.put('/roles/:roleId', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;

    // Prevent updating superadmin role
    if (roleId === 'superadmin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin role' });
    }

    // In a real application, you would store role definitions in the database
    // For now, we'll just return success
    res.json({ 
      message: 'Role updated successfully',
      role: { id: roleId, permissions }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/roles/assign
// @desc    Assign role to user
// @access  Private (Admin)
router.post('/roles/assign', requirePermission('canManageUsers'), [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('userType').isIn(['jobseeker', 'employer', 'admin', 'moderator']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, userType, adminPermissions } = req.body;

    const updateData = { userType };
    
    // If assigning admin role, set permissions
    if (userType === 'admin' && adminPermissions) {
      updateData.adminPermissions = adminPermissions;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Role assigned successfully',
      user 
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/jobs/count
// @desc    Get job counts
// @access  Private (Admin)
router.get('/jobs/count', async (req, res) => {
  try {
    const total = await Job.countDocuments();
    const active = await Job.countDocuments({ status: 'ACTIVE' });
    res.json({ total, active });
  } catch (error) {
    console.error('Job count error:', error);
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

// @route   PATCH /api/admin/jobs/:id
// @desc    Partially update job (for status toggle, etc.)
// @access  Private (Admin)
router.patch('/jobs/:id', requirePermission('canManageJobs'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updates = req.body;

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
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

// @route   GET /api/admin/applications/count
// @desc    Get application count
// @access  Private (Admin)
router.get('/applications/count', async (req, res) => {
  try {
    const count = await Application.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Application count error:', error);
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
      .populate('user', 'firstName lastName email phone')
      .populate('job', 'title company location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform applications to include candidate and job info
    const transformedApplications = applications.map(app => ({
      ...app,
      candidateName: app.fullName || (app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() : 'N/A'),
      jobTitle: app.job?.title || 'N/A',
      candidate: app.user,
    }));

    const total = await Application.countDocuments(query);

    res.json({
      applications: transformedApplications,
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

// @route   GET /api/admin/applications/:id
// @desc    Get single application details
// @access  Private (Admin)
router.get('/applications/:id', requirePermission('canManageApplications'), async (req, res) => {
  try {
    console.log('Fetching application with ID:', req.params.id);
    
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid application ID format');
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const application = await Application.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('job', 'title company location salary');
    
    if (!application) {
      console.log('Application not found in database');
      return res.status(404).json({ message: 'Application not found' });
    }

    console.log('Application found:', application._id);
    res.json({ application });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/admin/applications/:id
// @desc    Update application (partial update)
// @access  Private (Admin)
router.patch('/applications/:id', requirePermission('canManageApplications'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updates = req.body;
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('user', 'firstName lastName email phone')
      .populate('job', 'title company location');

    res.json({
      message: 'Application updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/applications/:id
// @desc    Delete application
// @access  Private (Admin)
router.delete('/applications/:id', requirePermission('canManageApplications'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/applications/:id/status
// @desc    Update application status
// @access  Private (Admin)
router.put('/applications/:id/status', requirePermission('canManageApplications'), [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted', 'hired']).withMessage('Invalid status')
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

// ==================== EMAIL LOG MANAGEMENT ====================

// @route   GET /api/admin/email-logs
// @desc    Get all email logs with pagination and filtering
// @access  Private (Admin)
router.get('/email-logs', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.templateType) {
      filter.templateType = req.query.templateType;
    }
    
    if (req.query.to) {
      filter.to = { $regex: req.query.to, $options: 'i' };
    }
    
    if (req.query.search) {
      filter.$or = [
        { to: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const [logs, total] = await Promise.all([
      EmailLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('templateId', 'name type')
        .populate('sentBy', 'firstName lastName email')
        .populate('metadata.userId', 'firstName lastName email'),
      EmailLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/email-logs/stats
// @desc    Get email log statistics
// @access  Private (Admin)
router.get('/email-logs/stats', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await EmailLog.getEmailStats(startDate, endDate);

    // Get today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStats = await EmailLog.getEmailStats(todayStart, new Date());

    // Get this week's stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStats = await EmailLog.getEmailStats(weekStart, new Date());

    // Get this month's stats
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStats = await EmailLog.getEmailStats(monthStart, new Date());

    // Get recent failed emails
    const recentFailed = await EmailLog.find({ status: 'failed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('to subject error.message createdAt');

    res.json({
      success: true,
      data: {
        overall: stats,
        today: todayStats,
        week: weekStats,
        month: monthStats,
        recentFailed,
        deliveryRate: stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(2) : 0,
        openRate: stats.delivered > 0 ? ((stats.uniqueOpens / stats.delivered) * 100).toFixed(2) : 0,
        clickRate: stats.delivered > 0 ? ((stats.uniqueClicks / stats.delivered) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get email log stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/email-logs/:id
// @desc    Get email log by ID
// @access  Private (Admin)
router.get('/email-logs/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const log = await EmailLog.findById(req.params.id)
      .populate('templateId', 'name type subject')
      .populate('sentBy', 'firstName lastName email')
      .populate('metadata.userId', 'firstName lastName email userType');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Email log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get email log error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/email-logs/:id/retry
// @desc    Retry sending a failed email
// @access  Private (Admin)
router.post('/email-logs/:id/retry', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const log = await EmailLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Email log not found'
      });
    }

    if (log.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Only failed emails can be retried'
      });
    }

    // Create a new email log entry for the retry
    const newLog = new EmailLog({
      to: log.to,
      from: log.from,
      subject: log.subject,
      templateId: log.templateId,
      templateName: log.templateName,
      templateType: log.templateType,
      htmlContent: log.htmlContent,
      textContent: log.textContent,
      cc: log.cc,
      bcc: log.bcc,
      attachments: log.attachments,
      provider: log.provider,
      metadata: {
        ...log.metadata,
        source: 'manual'
      },
      sentBy: req.user.id
    });

    await newLog.save();

    // Here you would trigger the actual email sending
    // For now, we'll just mark it as pending
    
    res.json({
      success: true,
      message: 'Email retry initiated',
      data: newLog
    });
  } catch (error) {
    console.error('Retry email error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   DELETE /api/admin/email-logs
// @desc    Delete old email logs (bulk cleanup)
// @access  Private (Super Admin)
router.delete('/email-logs', superAdminAuth, async (req, res) => {
  try {
    const { olderThan } = req.query; // Number of days
    
    if (!olderThan) {
      return res.status(400).json({
        success: false,
        message: 'olderThan parameter is required (days)'
      });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan));

    const result = await EmailLog.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $in: ['sent', 'delivered'] }
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} email logs`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete email logs error:', error);
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
router.get('/master-data/industries', adminAuth, async (req, res) => {
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
router.get('/master-data/departments', adminAuth, async (req, res) => {
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
router.get('/master-data/job-roles', adminAuth, requirePermission('canManageSettings'), async (req, res) => {
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
router.get('/master-data/job-titles', adminAuth, requirePermission('canManageSettings'), async (req, res) => {
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
router.get('/master-data/key-skills', adminAuth, requirePermission('canManageSettings'), async (req, res) => {
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
router.get('/master-data/specializations', adminAuth, requirePermission('canManageSettings'), async (req, res) => {
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
router.get('/master-data/courses', adminAuth, requirePermission('canManageSettings'), async (req, res) => {
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
router.get('/master-data/locations', adminAuth, requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Location = require('../models/Location');
    const locations = await Location.find({ isActive: true }).sort({ name: 1, state: 1 });
    
    res.json({
      success: true,
      data: locations.map(location => ({
        id: location._id,
        name: location.name,
        city: location.name, // For compatibility
        state: location.state,
        country: location.country,
        pincode: location.pincode
      }))
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
  body('name').optional().isString(),
  body('city').optional().isString(),
  body('state').notEmpty().withMessage('State is required'),
  body('country').notEmpty().withMessage('Country is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Location = require('../models/Location');
    const { name, city, state, country, pincode } = req.body;
    
    // Use city as name if name is not provided
    const locationName = name || city;
    
    if (!locationName) {
      return res.status(400).json({ 
        success: false,
        message: 'Either name or city is required' 
      });
    }
    
    const location = new Location({
      name: locationName.trim(),
      state: state.trim(),
      country: country.trim(),
      pincode: pincode?.trim() || '',
      createdBy: req.user.id
    });
    
    await location.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: location._id,
        name: location.name,
        city: location.name, // For compatibility
        state: location.state,
        country: location.country,
        pincode: location.pincode
      },
      message: 'Location added successfully'
    });
  } catch (error) {
    console.error('Add location error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Location with this name, state, and country already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/locations/:id
// @desc    Delete location
// @access  Private (Admin)
router.delete('/master-data/locations/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Location = require('../models/Location');
    const location = await Location.findByIdAndDelete(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== MASTER DATA SEEDING ROUTE ====================

// @route   POST /api/admin/seed-master-data
// @desc    Seed all master data with initial values
// @access  Private (Admin)
router.post('/seed-master-data', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const JobTitle = require('../models/JobTitle');
    const KeySkill = require('../models/KeySkill');
    const Industry = require('../models/Industry');
    const Department = require('../models/Department');
    const Course = require('../models/Course');
    const Specialization = require('../models/Specialization');
    const Education = require('../models/Education');
    const Location = require('../models/Location');

    let seededData = {
      jobTitles: 0,
      keySkills: 0,
      industries: 0,
      departments: 0,
      courses: 0,
      specializations: 0,
      educationFields: 0,
      locations: 0
    };

    // 1. SEED JOB TITLES (FROM JOB POST FORM)
    const seedData = require('../seedData');
    const jobTitles = seedData.jobTitles;

    for (const title of jobTitles) {
      try {
        await JobTitle.addOrUpdateJobTitle(title, 'Other', req.user.id);
        seededData.jobTitles++;
      } catch (err) {
        console.log(`Skipping duplicate: ${title}`);
      }
    }

    // 2. SEED KEY SKILLS (FROM JOB POST FORM)
    const keySkills = seedData.keySkills;

    for (const skill of keySkills) {
      try {
        await KeySkill.addOrUpdateKeySkill(skill, 'Other', 'Technical', req.user.id, '', []);
        seededData.keySkills++;
      } catch (err) {
        console.log(`Skipping duplicate: ${skill}`);
      }
    }

    // 3. SEED INDUSTRIES (FROM JOB POST FORM)
    const industries = seedData.industries;

    for (const industryName of industries) {
      try {
        const existing = await Industry.findOne({ name: industryName });
        if (!existing) {
          const newIndustry = new Industry({ name: industryName, subcategories: [] });
          await newIndustry.save();
          seededData.industries++;
        }
      } catch (err) {
        console.log(`Skipping duplicate: ${industryName}`);
      }
    }

    // 4. SEED DEPARTMENTS (FROM JOB POST FORM)
    const departments = seedData.departments;

    for (const deptName of departments) {
      try {
        const existing = await Department.findOne({ name: deptName });
        if (!existing) {
          const newDept = new Department({ name: deptName, description: '', subcategories: [] });
          await newDept.save();
          seededData.departments++;
        }
      } catch (err) {
        console.log(`Skipping duplicate: ${deptName}`);
      }
    }

    // 5. SEED COURSES
    const courses = [
      { name: 'B.Tech (Bachelor of Technology)', level: 'Graduate', category: 'Engineering' },
      { name: 'M.Tech (Master of Technology)', level: 'Post Graduate', category: 'Engineering' },
      { name: 'BCA (Bachelor of Computer Applications)', level: 'Graduate', category: 'Technical' },
      { name: 'MCA (Master of Computer Applications)', level: 'Post Graduate', category: 'Technical' },
      { name: 'MBA (Master of Business Administration)', level: 'Post Graduate', category: 'Management' },
      { name: 'BBA (Bachelor of Business Administration)', level: 'Graduate', category: 'Management' },
      { name: 'B.Com (Bachelor of Commerce)', level: 'Graduate', category: 'Commerce' },
      { name: 'M.Com (Master of Commerce)', level: 'Post Graduate', category: 'Commerce' },
      { name: 'B.Sc (Bachelor of Science)', level: 'Graduate', category: 'Science' },
      { name: 'M.Sc (Master of Science)', level: 'Post Graduate', category: 'Science' }
    ];

    for (const course of courses) {
      try {
        const existing = await Course.findOne({ name: course.name });
        if (!existing) {
          const newCourse = new Course({ ...course, createdBy: req.user.id });
          await newCourse.save();
          seededData.courses++;
        }
      } catch (err) {
        console.log(`Skipping duplicate: ${course.name}`);
      }
    }

    // 6. SEED SPECIALIZATIONS
    const specializations = [
      { name: 'Computer Science', field: 'Engineering', level: 'Graduate' },
      { name: 'Information Technology', field: 'Engineering', level: 'Graduate' },
      { name: 'Mechanical Engineering', field: 'Engineering', level: 'Graduate' },
      { name: 'Civil Engineering', field: 'Engineering', level: 'Graduate' },
      { name: 'Finance', field: 'Business', level: 'Post Graduate' },
      { name: 'Marketing', field: 'Business', level: 'Post Graduate' },
      { name: 'Human Resources', field: 'Business', level: 'Post Graduate' },
      { name: 'Data Science', field: 'Technology', level: 'Post Graduate' }
    ];

    for (const spec of specializations) {
      try {
        const existing = await Specialization.findOne({ name: spec.name });
        if (!existing) {
          const newSpec = new Specialization({ ...spec, createdBy: req.user.id });
          await newSpec.save();
          seededData.specializations++;
        }
      } catch (err) {
        console.log(`Skipping duplicate: ${spec.name}`);
      }
    }

    // 7. SEED EDUCATION FIELDS
    const educationFields = [
      { name: 'No Formal Education', level: 'No Education' },
      { name: 'Below 10th Standard', level: 'Below 10th' },
      { name: '10th Pass', level: '10th Pass' },
      { name: '12th Pass', level: '12th Pass' },
      { name: 'ITI', level: 'ITI' },
      { name: 'Diploma', level: 'Diploma' },
      { name: 'Graduate', level: 'Graduate' },
      { name: 'Post Graduate', level: 'Post Graduate' },
      { name: 'Doctorate/PhD', level: 'Doctorate' }
    ];

    for (const edu of educationFields) {
      try {
        const existing = await Education.findOne({ name: edu.name });
        if (!existing) {
          const newEdu = new Education({ ...edu, createdBy: req.user.id });
          await newEdu.save();
          seededData.educationFields++;
        }
      } catch (err) {
        console.log(`Skipping duplicate: ${edu.name}`);
      }
    }

    // 8. SEED LOCATIONS
    const locations = [
      { name: 'Mumbai', state: 'Maharashtra', country: 'India' },
      { name: 'Delhi', state: 'Delhi', country: 'India' },
      { name: 'Bangalore', state: 'Karnataka', country: 'India' },
      { name: 'Hyderabad', state: 'Telangana', country: 'India' },
      { name: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      { name: 'Kolkata', state: 'West Bengal', country: 'India' },
      { name: 'Pune', state: 'Maharashtra', country: 'India' },
      { name: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      { name: 'Jaipur', state: 'Rajasthan', country: 'India' },
      { name: 'Surat', state: 'Gujarat', country: 'India' },
      { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Kanpur', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Nagpur', state: 'Maharashtra', country: 'India' },
      { name: 'Indore', state: 'Madhya Pradesh', country: 'India' },
      { name: 'Noida', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Gurugram', state: 'Haryana', country: 'India' },
      { name: 'Chandigarh', state: 'Chandigarh', country: 'India' },
      { name: 'Coimbatore', state: 'Tamil Nadu', country: 'India' },
      { name: 'Kochi', state: 'Kerala', country: 'India' },
      { name: 'Guwahati', state: 'Assam', country: 'India' }
    ];

    for (const loc of locations) {
      try {
        const existing = await Location.findOne({ name: loc.name, state: loc.state });
        if (!existing) {
          const newLoc = new Location({ ...loc, createdBy: req.user.id });
          await newLoc.save();
          seededData.locations++;
        }
      } catch (err) {
        console.log(`Skipping duplicate: ${loc.name}`);
      }
    }

    res.json({
      success: true,
      message: 'Master data seeded successfully!',
      data: seededData,
      total: Object.values(seededData).reduce((a, b) => a + b, 0)
    });

  } catch (error) {
    console.error('Seed master data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error seeding master data',
      error: error.message 
    });
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

// ==================== MASTER DATA MANAGEMENT ROUTES ====================

// Import master data models
const JobTitle = require('../models/JobTitle');
const KeySkill = require('../models/KeySkill');
const Industry = require('../models/Industry');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Specialization = require('../models/Specialization');
const Education = require('../models/Education');
const Location = require('../models/Location');

// Job Titles Routes
router.get('/job-titles', async (req, res) => {
  try {
    const jobTitles = await JobTitle.find().sort({ name: 1 });
    res.json({ jobTitles });
  } catch (error) {
    console.error('Get job titles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/job-titles', async (req, res) => {
  try {
    const jobTitle = new JobTitle(req.body);
    await jobTitle.save();
    res.status(201).json({ jobTitle });
  } catch (error) {
    console.error('Create job title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/job-titles/:id', async (req, res) => {
  try {
    const jobTitle = await JobTitle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ jobTitle });
  } catch (error) {
    console.error('Update job title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/job-titles/:id', async (req, res) => {
  try {
    await JobTitle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job title deleted' });
  } catch (error) {
    console.error('Delete job title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Key Skills Routes
router.get('/key-skills', async (req, res) => {
  try {
    const keySkills = await KeySkill.find().sort({ name: 1 });
    res.json({ keySkills });
  } catch (error) {
    console.error('Get key skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/key-skills', async (req, res) => {
  try {
    const keySkill = new KeySkill(req.body);
    await keySkill.save();
    res.status(201).json({ keySkill });
  } catch (error) {
    console.error('Create key skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/key-skills/:id', async (req, res) => {
  try {
    const keySkill = await KeySkill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ keySkill });
  } catch (error) {
    console.error('Update key skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/key-skills/:id', async (req, res) => {
  try {
    await KeySkill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Key skill deleted' });
  } catch (error) {
    console.error('Delete key skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Industries Routes
router.get('/industries', async (req, res) => {
  try {
    const industries = await Industry.find().sort({ name: 1 });
    res.json({ industries });
  } catch (error) {
    console.error('Get industries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/industries', async (req, res) => {
  try {
    const industry = new Industry(req.body);
    await industry.save();
    res.status(201).json({ industry });
  } catch (error) {
    console.error('Create industry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/industries/:id', async (req, res) => {
  try {
    const industry = await Industry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ industry });
  } catch (error) {
    console.error('Update industry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/industries/:id', async (req, res) => {
  try {
    await Industry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Industry deleted' });
  } catch (error) {
    console.error('Delete industry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Departments Routes
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/departments', async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json({ department });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ department });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/departments/:id', async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Courses Routes
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ name: 1 });
    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Specializations Routes
router.get('/specializations', async (req, res) => {
  try {
    const specializations = await Specialization.find().sort({ name: 1 });
    res.json({ specializations });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/specializations', async (req, res) => {
  try {
    const specialization = new Specialization(req.body);
    await specialization.save();
    res.status(201).json({ specialization });
  } catch (error) {
    console.error('Create specialization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/specializations/:id', async (req, res) => {
  try {
    const specialization = await Specialization.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ specialization });
  } catch (error) {
    console.error('Update specialization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/specializations/:id', async (req, res) => {
  try {
    await Specialization.findByIdAndDelete(req.params.id);
    res.json({ message: 'Specialization deleted' });
  } catch (error) {
    console.error('Delete specialization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Education Routes
router.get('/education', async (req, res) => {
  try {
    const education = await Education.find().sort({ name: 1 });
    res.json({ education });
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/education', async (req, res) => {
  try {
    const education = new Education(req.body);
    await education.save();
    res.status(201).json({ education });
  } catch (error) {
    console.error('Create education error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/education/:id', async (req, res) => {
  try {
    const education = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ education });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/education/:id', async (req, res) => {
  try {
    await Education.findByIdAndDelete(req.params.id);
    res.json({ message: 'Education deleted' });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Locations Routes
router.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/locations', async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    res.status(201).json({ location });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/locations/:id', async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ location });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/locations/:id', async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: 'Location deleted' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Team Limits Routes
router.get('/team-limits', async (req, res) => {
  try {
    const teamLimits = await User.find({ role: 'EMPLOYER' })
      .select('name email teamLimit currentMembers')
      .sort({ createdAt: -1 });
    res.json({ teamLimits });
  } catch (error) {
    console.error('Get team limits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verifications Routes
router.get('/verifications', async (req, res) => {
  try {
    const verifications = await User.find({ verificationStatus: { $exists: true } })
      .select('name email verificationStatus verificationType createdAt')
      .sort({ createdAt: -1 });
    res.json({ verifications });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/verifications/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'APPROVED', isVerified: true },
      { new: true }
    );
    res.json({ user });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/verifications/:id/reject', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'REJECTED', isVerified: false },
      { new: true }
    );
    res.json({ user });
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== Analytics Routes ====================

// @route   GET /api/admin/analytics
// @desc    Get comprehensive analytics data
// @access  Private (Admin)
router.get('/analytics', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const User = require('../models/User');
    const Job = require('../models/Job');
    const Application = require('../models/Application');

    // Date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const last3Months = new Date(today);
    last3Months.setMonth(last3Months.getMonth() - 3);

    // User Statistics
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const jobseekers = await User.countDocuments({ userType: 'jobseeker' });
    const companies = await User.countDocuments({ userType: 'company' });
    const consultancies = await User.countDocuments({ userType: 'consultancy' });
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: lastWeek } });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: lastMonth } });

    // Job Statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const inactiveJobs = await Job.countDocuments({ status: 'inactive' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });
    const newJobsToday = await Job.countDocuments({ createdAt: { $gte: today } });
    const newJobsThisWeek = await Job.countDocuments({ createdAt: { $gte: lastWeek } });
    const newJobsThisMonth = await Job.countDocuments({ createdAt: { $gte: lastMonth } });

    // Application Statistics
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
    const newApplicationsToday = await Application.countDocuments({ createdAt: { $gte: today } });
    const newApplicationsThisWeek = await Application.countDocuments({ createdAt: { $gte: lastWeek } });
    const newApplicationsThisMonth = await Application.countDocuments({ createdAt: { $gte: lastMonth } });

    // Average calculations
    const avgApplicationsPerJob = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(2) : 0;
    const avgJobsPerCompany = (companies + consultancies) > 0 ? (totalJobs / (companies + consultancies)).toFixed(2) : 0;

    // Growth rates (comparing current month to last month)
    const usersLastMonth = await User.countDocuments({ 
      createdAt: { $gte: lastMonth, $lt: today } 
    });
    const userGrowthRate = usersLastMonth > 0 ? 
      (((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100).toFixed(1) : 0;

    const jobsLastMonth = await Job.countDocuments({ 
      createdAt: { $gte: lastMonth, $lt: today } 
    });
    const jobGrowthRate = jobsLastMonth > 0 ? 
      (((newJobsThisMonth - jobsLastMonth) / jobsLastMonth) * 100).toFixed(1) : 0;

    // Top locations
    const topLocations = await Job.aggregate([
      { $match: { 'location.city': { $exists: true, $ne: null } } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Top industries
    const topIndustries = await Job.aggregate([
      { $match: { 'industry.name': { $exists: true, $ne: null } } },
      { $group: { _id: '$industry.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Recent activity (last 30 days by day)
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayUsers = await User.countDocuments({ 
        createdAt: { $gte: date, $lt: nextDate } 
      });
      const dayJobs = await Job.countDocuments({ 
        createdAt: { $gte: date, $lt: nextDate } 
      });
      const dayApplications = await Application.countDocuments({ 
        createdAt: { $gte: date, $lt: nextDate } 
      });

      last30Days.push({
        date: date.toISOString().split('T')[0],
        users: dayUsers,
        jobs: dayJobs,
        applications: dayApplications
      });
    }

    // Conversion rates
    const applicationConversionRate = totalApplications > 0 ? 
      ((acceptedApplications / totalApplications) * 100).toFixed(2) : 0;
    const jobFillRate = totalJobs > 0 ? 
      ((closedJobs / totalJobs) * 100).toFixed(2) : 0;

    res.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        jobseekers,
        companies,
        consultancies,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        growthRate: parseFloat(userGrowthRate)
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        inactive: inactiveJobs,
        closed: closedJobs,
        newToday: newJobsToday,
        newThisWeek: newJobsThisWeek,
        newThisMonth: newJobsThisMonth,
        growthRate: parseFloat(jobGrowthRate),
        avgPerCompany: parseFloat(avgJobsPerCompany)
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        shortlisted: shortlistedApplications,
        rejected: rejectedApplications,
        accepted: acceptedApplications,
        newToday: newApplicationsToday,
        newThisWeek: newApplicationsThisWeek,
        newThisMonth: newApplicationsThisMonth,
        avgPerJob: parseFloat(avgApplicationsPerJob),
        conversionRate: parseFloat(applicationConversionRate)
      },
      metrics: {
        jobFillRate: parseFloat(jobFillRate),
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0
      },
      topLocations,
      topIndustries,
      chartData: last30Days
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== Homepage Management Routes ====================

const HomepageConfig = require('../models/HomepageConfig');

// @route   GET /api/admin/homepage/config
// @desc    Get homepage configuration
// @access  Private (Admin)
router.get('/homepage/config', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const config = await HomepageConfig.getActiveConfig();
    res.json({ config });
  } catch (error) {
    console.error('Get homepage config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/homepage/config
// @desc    Update homepage configuration
// @access  Private (Admin)
router.put('/homepage/config', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { hero, banners, sections, stats } = req.body;

    let config = await HomepageConfig.getActiveConfig();

    if (hero) config.hero = { ...config.hero, ...hero };
    if (banners !== undefined) config.banners = banners;
    if (sections) config.sections = { ...config.sections, ...sections };
    if (stats) config.stats = { ...config.stats, ...stats };
    
    config.lastUpdatedBy = req.user._id;
    await config.save();

    res.json({ 
      config,
      message: 'Homepage configuration updated successfully'
    });
  } catch (error) {
    console.error('Update homepage config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/homepage/banners
// @desc    Add a new banner
// @access  Private (Admin)
router.post('/homepage/banners', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { title, description, imageUrl, buttonText, buttonLink, backgroundColor, textColor } = req.body;

    const config = await HomepageConfig.getActiveConfig();
    
    const newBanner = {
      title,
      description,
      imageUrl,
      buttonText,
      buttonLink,
      backgroundColor: backgroundColor || '#4A90E2',
      textColor: textColor || '#FFFFFF',
      order: config.banners.length,
      enabled: true
    };

    config.banners.push(newBanner);
    config.lastUpdatedBy = req.user._id;
    await config.save();

    res.json({ 
      config,
      message: 'Banner added successfully'
    });
  } catch (error) {
    console.error('Add banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/homepage/banners/:index
// @desc    Delete a banner
// @access  Private (Admin)
router.delete('/homepage/banners/:index', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    
    const config = await HomepageConfig.getActiveConfig();
    
    if (index < 0 || index >= config.banners.length) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    config.banners.splice(index, 1);
    // Reorder remaining banners
    config.banners.forEach((banner, idx) => {
      banner.order = idx;
    });
    
    config.lastUpdatedBy = req.user._id;
    await config.save();

    res.json({ 
      config,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/homepage/config
// @desc    Get homepage configuration (Public)
// @access  Public
router.get('/homepage/public', async (req, res) => {
  try {
    const config = await HomepageConfig.getActiveConfig();
    res.json({ config });
  } catch (error) {
    console.error('Get public homepage config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== Chatbot Management Routes ====================

const ChatbotConversation = require('../models/ChatbotConversation');

// @route   GET /api/admin/chatbot/conversations
// @desc    Get all chatbot conversations
// @access  Private (Admin)
router.get('/chatbot/conversations', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;

    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { guestName: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } },
        { guestPhone: { $regex: search, $options: 'i' } },
        { sessionId: { $regex: search, $options: 'i' } }
      ];
    }

    const conversations = await ChatbotConversation.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ChatbotConversation.countDocuments(query);

    // Add unread count to each conversation
    const conversationsWithUnread = conversations.map(conv => ({
      ...conv,
      unreadCount: conv.messages.filter(msg => msg.sender === 'user' && !msg.isRead).length
    }));

    res.json({
      conversations: conversationsWithUnread,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/chatbot/conversations/:id
// @desc    Get single conversation
// @access  Private (Admin)
router.get('/chatbot/conversations/:id', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const conversation = await ChatbotConversation.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark messages as read
    await conversation.markAsRead();

    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/chatbot/conversations/:id
// @desc    Update conversation (status, notes, assign)
// @access  Private (Admin)
router.patch('/chatbot/conversations/:id', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { status, adminNotes, assignedTo } = req.body;

    const updateData = {};
    
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const conversation = await ChatbotConversation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'firstName lastName email');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ 
      conversation,
      message: 'Conversation updated successfully'
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/chatbot/conversations/:id
// @desc    Delete conversation
// @access  Private (Admin)
router.delete('/chatbot/conversations/:id', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const conversation = await ChatbotConversation.findByIdAndDelete(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/chatbot/stats
// @desc    Get chatbot statistics
// @access  Private (Admin)
router.get('/chatbot/stats', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const totalConversations = await ChatbotConversation.countDocuments();
    const activeConversations = await ChatbotConversation.countDocuments({ status: 'active' });
    const closedConversations = await ChatbotConversation.countDocuments({ status: 'closed' });
    
    // Get total messages
    const result = await ChatbotConversation.aggregate([
      {
        $group: {
          _id: null,
          totalMessages: { $sum: '$messageCount' }
        }
      }
    ]);

    const totalMessages = result.length > 0 ? result[0].totalMessages : 0;

    res.json({
      stats: {
        total: totalConversations,
        active: activeConversations,
        closed: closedConversations,
        totalMessages
      }
    });
  } catch (error) {
    console.error('Get chatbot stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== KYC Management Routes ====================

const KYC = require('../models/KYC');

// @route   GET /api/admin/kyc
// @desc    Get all KYC submissions
// @access  Private (Admin)
router.get('/kyc', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const userType = req.query.userType;

    let query = {};
    
    if (status && status !== 'all') {
      query.submissionStatus = status;
    }
    
    if (userType && userType !== 'all') {
      query.userType = userType;
    }

    const kycs = await KYC.find(query)
      .populate('userId', 'firstName lastName email companyName phone userType')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform to include user info at root level
    const transformedKycs = kycs.map(kyc => ({
      ...kyc,
      user: kyc.userId
    }));

    const total = await KYC.countDocuments(query);

    res.json({
      kycs: transformedKycs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get KYC submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/kyc/:id
// @desc    Get single KYC submission
// @access  Private (Admin)
router.get('/kyc/:id', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const kyc = await KYC.findById(req.params.id)
      .populate('userId', 'firstName lastName email companyName phone userType')
      .populate('reviewedBy', 'firstName lastName');
    
    if (!kyc) {
      return res.status(404).json({ message: 'KYC submission not found' });
    }

    const transformedKyc = {
      ...kyc.toObject(),
      user: kyc.userId
    };

    res.json({ kyc: transformedKyc });
  } catch (error) {
    console.error('Get KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/kyc/:id/status
// @desc    Update KYC status (verify/reject)
// @access  Private (Admin)
router.patch('/kyc/:id/status', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { status, adminNotes, rejectionReason } = req.body;

    if (!['submitted', 'under_review', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = {
      submissionStatus: status,
      reviewedAt: new Date(),
      reviewedBy: req.user._id
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const kyc = await KYC.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'firstName lastName email');
    
    if (!kyc) {
      return res.status(404).json({ message: 'KYC submission not found' });
    }

    // Update user verification status based on KYC status
    if (status === 'verified') {
      await User.findByIdAndUpdate(kyc.userId._id, {
        isEmployerVerified: true,
        verificationStatus: 'verified',
        kycStatus: 'verified'
      });
    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(kyc.userId._id, {
        isEmployerVerified: false,
        verificationStatus: 'rejected',
        kycStatus: 'rejected'
      });
    }

    res.json({ 
      kyc,
      message: `KYC ${status} successfully`
    });
  } catch (error) {
    console.error('Update KYC status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/kyc/stats
// @desc    Get KYC statistics
// @access  Private (Admin)
router.get('/kyc/stats', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const stats = await KYC.getKYCStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get KYC stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/job-titles
// @desc    Add new job title
// @access  Private (Admin)
router.post('/master-data/job-titles', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Job title name is required'),
  body('category').optional().isString().withMessage('Category must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const JobTitle = require('../models/JobTitle');
    const { name, category = 'Other' } = req.body;
    
    const jobTitle = await JobTitle.addOrUpdateJobTitle(
      name.trim(),
      category,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      data: {
        id: jobTitle._id,
        name: jobTitle.name,
        category: jobTitle.category,
        usageCount: jobTitle.usageCount
      },
      message: 'Job title added successfully'
    });
  } catch (error) {
    console.error('Add job title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/master-data/job-titles/:id
// @desc    Update job title
// @access  Private (Admin)
router.put('/master-data/job-titles/:id', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Job title name is required'),
  body('category').optional().isString().withMessage('Category must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const JobTitle = require('../models/JobTitle');
    const { name, category, isActive } = req.body;
    
    const jobTitle = await JobTitle.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        lastUsed: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!jobTitle) {
      return res.status(404).json({ message: 'Job title not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: jobTitle._id,
        name: jobTitle.name,
        category: jobTitle.category,
        usageCount: jobTitle.usageCount,
        isActive: jobTitle.isActive
      },
      message: 'Job title updated successfully'
    });
  } catch (error) {
    console.error('Update job title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/job-titles/:id
// @desc    Delete job title
// @access  Private (Admin)
router.delete('/master-data/job-titles/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const JobTitle = require('../models/JobTitle');
    const jobTitle = await JobTitle.findByIdAndDelete(req.params.id);
    
    if (!jobTitle) {
      return res.status(404).json({ message: 'Job title not found' });
    }
    
    res.json({
      success: true,
      message: 'Job title deleted successfully'
    });
  } catch (error) {
    console.error('Delete job title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/master-data/key-skills/:id
// @desc    Update key skill
// @access  Private (Admin)
router.put('/master-data/key-skills/:id', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Skill name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const KeySkill = require('../models/KeySkill');
    const { name, category, skillType, description, tags, isActive } = req.body;
    
    const skill = await KeySkill.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(category && { category }),
        ...(skillType && { skillType }),
        ...(description !== undefined && { description: description.trim() }),
        ...(tags && { tags }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );
    
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: skill._id,
        name: skill.name,
        category: skill.category,
        skillType: skill.skillType,
        usageCount: skill.usageCount
      },
      message: 'Skill updated successfully'
    });
  } catch (error) {
    console.error('Update key skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/master-data/specializations/:id
// @desc    Update specialization
// @access  Private (Admin)
router.put('/master-data/specializations/:id', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Specialization name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Specialization = require('../models/Specialization');
    const { name, description, field, level, isActive } = req.body;
    
    const specialization = await Specialization.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(field && { field }),
        ...(level && { level }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );
    
    if (!specialization) {
      return res.status(404).json({ message: 'Specialization not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: specialization._id,
        name: specialization.name,
        description: specialization.description,
        field: specialization.field,
        level: specialization.level,
        isActive: specialization.isActive
      },
      message: 'Specialization updated successfully'
    });
  } catch (error) {
    console.error('Update specialization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/master-data/courses/:id
// @desc    Update course
// @access  Private (Admin)
router.put('/master-data/courses/:id', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Course name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Course = require('../models/Course');
    const { name, description, duration, level, category, isActive } = req.body;
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(duration !== undefined && { duration: duration.trim() }),
        ...(level && { level }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: course._id,
        name: course.name,
        description: course.description,
        duration: course.duration,
        level: course.level,
        category: course.category,
        isActive: course.isActive
      },
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/master-data/education-fields
// @desc    Get all education fields for admin management
// @access  Private (Admin)
router.get('/master-data/education-fields', adminAuth, requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Education = require('../models/Education');
    const educationFields = await Education.find({ isActive: true }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: educationFields.map(edu => ({
        id: edu._id,
        name: edu.name,
        description: edu.description,
        level: edu.level
      }))
    });
  } catch (error) {
    console.error('Get education fields error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/master-data/education-fields
// @desc    Add new education field
// @access  Private (Admin)
router.post('/master-data/education-fields', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Education field name is required'),
  body('level').notEmpty().withMessage('Education level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Education = require('../models/Education');
    const { name, description, level } = req.body;
    
    const educationField = new Education({
      name: name.trim(),
      description: description?.trim() || '',
      level: level,
      createdBy: req.user.id
    });
    
    await educationField.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: educationField._id,
        name: educationField.name,
        description: educationField.description,
        level: educationField.level
      },
      message: 'Education field added successfully'
    });
  } catch (error) {
    console.error('Add education field error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Education field with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/master-data/education-fields/:id
// @desc    Update education field
// @access  Private (Admin)
router.put('/master-data/education-fields/:id', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Education field name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Education = require('../models/Education');
    const { name, description, level, isActive } = req.body;
    
    const educationField = await Education.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(level && { level }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );
    
    if (!educationField) {
      return res.status(404).json({ message: 'Education field not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: educationField._id,
        name: educationField.name,
        description: educationField.description,
        level: educationField.level,
        isActive: educationField.isActive
      },
      message: 'Education field updated successfully'
    });
  } catch (error) {
    console.error('Update education field error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/master-data/education-fields/:id
// @desc    Delete education field
// @access  Private (Admin)
router.delete('/master-data/education-fields/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const Education = require('../models/Education');
    const educationField = await Education.findByIdAndDelete(req.params.id);
    
    if (!educationField) {
      return res.status(404).json({ message: 'Education field not found' });
    }
    
    res.json({
      success: true,
      message: 'Education field deleted successfully'
    });
  } catch (error) {
    console.error('Delete education field error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/master-data/locations/:id
// @desc    Update location
// @access  Private (Admin)
router.put('/master-data/locations/:id', requirePermission('canManageSettings'), [
  body('name').optional().isString(),
  body('city').optional().isString(),
  body('state').optional().isString(),
  body('country').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Location = require('../models/Location');
    const { name, city, state, country, pincode, isActive } = req.body;
    
    const updateData = {
      updatedBy: req.user.id
    };
    
    if (name) updateData.name = name.trim();
    if (city) updateData.name = city.trim(); // Use city as name if provided
    if (state) updateData.state = state.trim();
    if (country) updateData.country = country.trim();
    if (pincode !== undefined) updateData.pincode = pincode.trim();
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: location._id,
        name: location.name,
        city: location.name, // For compatibility
        state: location.state,
        country: location.country,
        pincode: location.pincode,
        isActive: location.isActive
      },
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
