const express = require('express');
const Certification = require('../models/Certification');
const { adminAuth } = require('../middleware/adminAuth');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/certifications/search
// @desc    Search certifications for autocomplete
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({ certifications: [] });
    }

    const certifications = await Certification.searchCertifications(q.trim(), parseInt(limit));

    res.json({
      success: true,
      certifications: certifications.map(cert => ({
        _id: cert._id,
        name: cert.name,
        category: cert.category,
        provider: cert.provider
      }))
    });

  } catch (error) {
    console.error('Error searching certifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching certifications'
    });
  }
});

// @route   GET /api/certifications
// @desc    Get all certifications
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const certifications = await Certification.find(query)
      .sort({ usageCount: -1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Certification.countDocuments(query);

    res.json({
      success: true,
      certifications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certifications'
    });
  }
});

// @route   POST /api/certifications
// @desc    Create a new certification
// @access  Private (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, category, description, provider } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Certification name is required'
      });
    }

    // Check if certification already exists
    const existingCert = await Certification.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCert) {
      return res.status(400).json({
        success: false,
        message: 'Certification already exists'
      });
    }

    const certification = new Certification({
      name,
      category: category || 'Other',
      description,
      provider,
      addedBy: req.user.id,
      isVerified: true // Admin-added certifications are verified by default
    });

    await certification.save();

    res.status(201).json({
      success: true,
      message: 'Certification created successfully',
      certification
    });

  } catch (error) {
    console.error('Error creating certification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating certification'
    });
  }
});

// @route   PUT /api/certifications/:id
// @desc    Update a certification
// @access  Private (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, category, description, provider, isVerified } = req.body;

    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Update fields
    if (name) certification.name = name;
    if (category) certification.category = category;
    if (description !== undefined) certification.description = description;
    if (provider !== undefined) certification.provider = provider;
    if (isVerified !== undefined) certification.isVerified = isVerified;

    await certification.save();

    res.json({
      success: true,
      message: 'Certification updated successfully',
      certification
    });

  } catch (error) {
    console.error('Error updating certification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating certification'
    });
  }
});

// @route   DELETE /api/certifications/:id
// @desc    Delete a certification
// @access  Private (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    await certification.deleteOne();

    res.json({
      success: true,
      message: 'Certification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting certification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting certification'
    });
  }
});

module.exports = router;

