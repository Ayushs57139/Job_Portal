const express = require('express');
const JobRole = require('../models/JobRole');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/job-roles/search
// @desc    Search job roles for autocomplete
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ jobRoles: [] });
    }
    
    const jobRoles = await JobRole.searchJobRoles(q.trim(), parseInt(limit));
    
    res.json({
      success: true,
      jobRoles: jobRoles.map(role => ({
        id: role._id,
        name: role.name,
        category: role.category,
        usageCount: role.usageCount
      }))
    });
  } catch (error) {
    console.error('Error searching job roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching job roles'
    });
  }
});

// @route   POST /api/job-roles
// @desc    Add new job role
// @access  Private (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { name, category = 'Other' } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Job role name is required and must be at least 2 characters'
      });
    }
    
    const jobRole = await JobRole.addOrUpdateJobRole(
      name.trim(),
      category,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      jobRole: {
        id: jobRole._id,
        name: jobRole.name,
        category: jobRole.category,
        usageCount: jobRole.usageCount
      }
    });
  } catch (error) {
    console.error('Error adding job role:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding job role'
    });
  }
});

// @route   GET /api/job-roles/popular
// @desc    Get popular job roles
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const jobRoles = await JobRole.getPopularJobRoles(parseInt(limit));
    
    res.json({
      success: true,
      jobRoles: jobRoles.map(role => ({
        id: role._id,
        name: role.name,
        category: role.category,
        usageCount: role.usageCount
      }))
    });
  } catch (error) {
    console.error('Error fetching popular job roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular job roles'
    });
  }
});

// @route   PUT /api/job-roles/:id/verify
// @desc    Verify a job role (admin only)
// @access  Private (admin)
router.put('/:id/verify', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const jobRole = await JobRole.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    
    if (!jobRole) {
      return res.status(404).json({
        success: false,
        message: 'Job role not found'
      });
    }
    
    res.json({
      success: true,
      jobRole: {
        id: jobRole._id,
        name: jobRole.name,
        category: jobRole.category,
        isVerified: jobRole.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying job role:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying job role'
    });
  }
});

// @route   POST /api/job-roles/:id/usage
// @desc    Update job role usage count
// @access  Private
router.post('/:id/usage', auth, async (req, res) => {
  try {
    const jobRole = await JobRole.findByIdAndUpdate(
      req.params.id,
      { 
        $inc: { usageCount: 1 },
        lastUsed: new Date()
      },
      { new: true }
    );
    
    if (!jobRole) {
      return res.status(404).json({
        success: false,
        message: 'Job role not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Usage count updated'
    });
  } catch (error) {
    console.error('Error updating job role usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job role usage'
    });
  }
});

// @route   GET /api/job-roles
// @desc    Get all job roles
// @access  Public
router.get('/', async (req, res) => {
  try {
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
    console.error('Error fetching job roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job roles'
    });
  }
});

// @route   GET /api/job-roles/categories
// @desc    Get all job role categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Sales', 'Engineering', 'Management', 'Administration', 'Finance', 
      'Healthcare', 'Education', 'Technology', 'Operations', 'Customer Service',
      'Marketing', 'Human Resources', 'Legal', 'Manufacturing', 'Transportation',
      'Hospitality', 'Security', 'Maintenance', 'Retail', 'Other'
    ];
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

module.exports = router;
