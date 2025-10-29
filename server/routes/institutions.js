const express = require('express');
const Institution = require('../models/Institution');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/institutions/search
// @desc    Search institutions for autocomplete
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ institutions: [] });
    }
    
    const institutions = await Institution.searchInstitutions(q.trim(), parseInt(limit));
    
    res.json({
      success: true,
      institutions: institutions.map(inst => ({
        id: inst._id,
        name: inst.name,
        type: inst.type,
        location: inst.location,
        usageCount: inst.usageCount
      }))
    });
  } catch (error) {
    console.error('Error searching institutions:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching institutions'
    });
  }
});

// @route   POST /api/institutions
// @desc    Add new institution
// @access  Private (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { name, type = 'University', location = {} } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Institution name is required and must be at least 2 characters'
      });
    }
    
    const institution = await Institution.addOrUpdateInstitution(
      name.trim(),
      type,
      location,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      institution: {
        id: institution._id,
        name: institution.name,
        type: institution.type,
        location: institution.location,
        usageCount: institution.usageCount
      }
    });
  } catch (error) {
    console.error('Error adding institution:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding institution'
    });
  }
});

// @route   GET /api/institutions/popular
// @desc    Get popular institutions
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const institutions = await Institution.find({ isVerified: true })
      .sort({ usageCount: -1, lastUsed: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      institutions: institutions.map(inst => ({
        id: inst._id,
        name: inst.name,
        type: inst.type,
        location: inst.location,
        usageCount: inst.usageCount
      }))
    });
  } catch (error) {
    console.error('Error fetching popular institutions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular institutions'
    });
  }
});

// @route   PUT /api/institutions/:id/verify
// @desc    Verify an institution (admin only)
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
    
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }
    
    res.json({
      success: true,
      institution: {
        id: institution._id,
        name: institution.name,
        type: institution.type,
        location: institution.location,
        isVerified: institution.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying institution:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying institution'
    });
  }
});

// @route   POST /api/institutions/:id/usage
// @desc    Update institution usage count
// @access  Private
router.post('/:id/usage', auth, async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { 
        $inc: { usageCount: 1 },
        lastUsed: new Date()
      },
      { new: true }
    );
    
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Usage count updated'
    });
  } catch (error) {
    console.error('Error updating institution usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating institution usage'
    });
  }
});

module.exports = router;
