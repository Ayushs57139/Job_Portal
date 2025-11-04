const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { requirePermission } = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/admin/users/count
// @desc    Get total user count
// @access  Private (Admin)
router.get('/count', async (req, res) => {
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
router.get('/recent', async (req, res) => {
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
router.patch('/:id/verify', async (req, res) => {
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
router.patch('/:id/unverify', async (req, res) => {
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
router.post('/create', requirePermission('canManageUsers'), async (req, res) => {
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
router.post('/bulk-import', async (req, res) => {
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
router.get('/', requirePermission('canManageUsers'), async (req, res) => {
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
      const userTypes = userType.split(',').map(ut => ut.trim());
      if (userTypes.length > 1) {
        query.userType = { $in: userTypes };
      } else {
        query.userType = userTypes[0];
      }
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
router.get('/:id', requirePermission('canManageUsers'), async (req, res) => {
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
router.put('/:id', requirePermission('canManageUsers'), [
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
router.patch('/:id', requirePermission('canManageUsers'), [
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
router.patch('/:id/team-limit', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { teamLimit } = req.body;

    if (teamLimit === undefined || teamLimit === null || isNaN(teamLimit) || teamLimit < 0) {
      return res.status(400).json({ message: 'Team limit must be a non-negative number' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.userType !== 'company' && user.userType !== 'consultancy') {
      return res.status(400).json({ message: 'Team limit can only be set for company and consultancy users' });
    }

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
router.delete('/:id', requirePermission('canManageUsers'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

module.exports = router;

