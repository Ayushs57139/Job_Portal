const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ThemeSettings = require('../models/ThemeSettings');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.userType !== 'admin' && req.user.userType !== 'superadmin')) {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// @route   GET /api/theme/active
// @desc    Get active theme (Public)
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const theme = await ThemeSettings.getActiveTheme();
    res.json({
      success: true,
      theme
    });
  } catch (error) {
    console.error('Get active theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/theme
// @desc    Get all themes
// @access  Private (Admin)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const themes = await ThemeSettings.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      themes
    });
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/theme
// @desc    Create new theme
// @access  Private (Admin)
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const theme = new ThemeSettings({
      ...req.body,
      createdBy: req.user._id
    });
    
    await theme.save();
    
    res.status(201).json({
      success: true,
      message: 'Theme created successfully',
      theme
    });
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/theme/:id
// @desc    Update theme
// @access  Private (Admin)
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const theme = await ThemeSettings.findById(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }
    
    // Update theme fields
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'object' && req.body[key] !== null && !Array.isArray(req.body[key])) {
        theme[key] = { ...theme[key], ...req.body[key] };
      } else {
        theme[key] = req.body[key];
      }
    });
    
    theme.lastModifiedBy = req.user._id;
    theme.version += 1;
    
    await theme.save();
    
    res.json({
      success: true,
      message: 'Theme updated successfully',
      theme
    });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/theme/:id/activate
// @desc    Activate theme
// @access  Private (Admin)
router.put('/:id/activate', auth, requireAdmin, async (req, res) => {
  try {
    const theme = await ThemeSettings.findById(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }
    
    await theme.activate();
    
    res.json({
      success: true,
      message: 'Theme activated successfully',
      theme
    });
  } catch (error) {
    console.error('Activate theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/theme/:id
// @desc    Delete theme
// @access  Private (Admin)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const theme = await ThemeSettings.findById(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }
    
    if (theme.isActive) {
      return res.status(400).json({ success: false, message: 'Cannot delete active theme' });
    }
    
    await theme.deleteOne();
    
    res.json({
      success: true,
      message: 'Theme deleted successfully'
    });
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

