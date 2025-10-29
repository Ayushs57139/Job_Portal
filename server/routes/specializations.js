const express = require('express');
const Specialization = require('../models/Specialization');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/specializations
// @desc    Get all specializations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { limit = 100, field, level } = req.query;
    
    let query = { isActive: true };
    if (field) query.field = field;
    if (level) query.level = level;
    
    const specializations = await Specialization.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit));
    
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
    console.error('Error fetching specializations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching specializations'
    });
  }
});

// @route   GET /api/specializations/search
// @desc    Search specializations for autocomplete
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ specializations: [] });
    }
    
    const specializations = await Specialization.find({
      isActive: true,
      name: { $regex: q.trim(), $options: 'i' }
    })
    .sort({ name: 1 })
    .limit(parseInt(limit));
    
    res.json({
      success: true,
      specializations: specializations.map(spec => ({
        id: spec._id,
        name: spec.name,
        field: spec.field,
        level: spec.level
      }))
    });
  } catch (error) {
    console.error('Error searching specializations:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching specializations'
    });
  }
});

// @route   POST /api/specializations
// @desc    Add new specialization
// @access  Private (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, field, level } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Specialization name is required and must be at least 2 characters'
      });
    }
    
    // Check if specialization already exists
    const existingSpec = await Specialization.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    
    if (existingSpec) {
      return res.status(400).json({
        success: false,
        message: 'Specialization already exists'
      });
    }
    
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
    console.error('Error adding specialization:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding specialization'
    });
  }
});

// @route   PUT /api/specializations/:id
// @desc    Update specialization
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
      return res.status(404).json({
        success: false,
        message: 'Specialization not found'
      });
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
    console.error('Error updating specialization:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating specialization'
    });
  }
});

// @route   DELETE /api/specializations/:id
// @desc    Delete specialization
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
    
    const specialization = await Specialization.findByIdAndDelete(req.params.id);
    
    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: 'Specialization not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Specialization deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting specialization:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting specialization'
    });
  }
});

// @route   GET /api/specializations/fields
// @desc    Get all specialization fields
// @access  Public
router.get('/fields', async (req, res) => {
  try {
    const fields = [
      'Engineering', 'Medicine', 'Business', 'Arts', 'Science', 
      'Technology', 'Education', 'Law', 'Other'
    ];
    
    res.json({
      success: true,
      fields
    });
  } catch (error) {
    console.error('Error fetching fields:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fields'
    });
  }
});

// @route   GET /api/specializations/levels
// @desc    Get all specialization levels
// @access  Public
router.get('/levels', async (req, res) => {
  try {
    const levels = [
      'Undergraduate', 'Graduate', 'Post Graduate', 'Doctorate', 
      'Certificate', 'Other'
    ];
    
    res.json({
      success: true,
      levels
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching levels'
    });
  }
});

module.exports = router;
