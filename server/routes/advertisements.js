const express = require('express');
const { body, validationResult } = require('express-validator');
const Advertisement = require('../models/Advertisement');
const { adminAuth, superAdminAuth } = require('../middleware/adminAuth');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateAdvertisement = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('type').isIn(['banner', 'sidebar', 'footer', 'popup', 'inline', 'adsense', 'admob']).withMessage('Invalid advertisement type'),
  body('position').isIn(['header', 'sidebar-left', 'sidebar-right', 'footer', 'content-top', 'content-bottom', 'content-middle', 'popup', 'mobile-banner', 'mobile-interstitial']).withMessage('Invalid position'),
  body('status').optional().isIn(['active', 'inactive', 'paused', 'draft']).withMessage('Invalid status'),
  body('priority').optional().isInt({ min: 1, max: 10 }).withMessage('Priority must be between 1 and 10')
];

// @route   GET /api/advertisements
// @desc    Get advertisements for display (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page, position, type, userType, device } = req.query;
    
    // Build query for active advertisements
    const query = {
      isActive: true,
      status: 'active',
      $or: [
        { 'schedule.startDate': { $lte: new Date() } },
        { 'schedule.startDate': { $exists: false } }
      ],
      $or: [
        { 'schedule.endDate': { $gte: new Date() } },
        { 'schedule.endDate': { $exists: false } }
      ]
    };

    // Add position filter if specified
    if (position) {
      query.position = position;
    }

    // Add type filter if specified
    if (type) {
      query.type = type;
    }

    // Get advertisements and filter by targeting
    let advertisements = await Advertisement.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .populate('createdBy', 'firstName lastName');

    // Filter by targeting rules
    advertisements = advertisements.filter(ad => {
      return ad.shouldDisplay(userType || 'all', page || 'all', device || 'all');
    });

    res.json({
      success: true,
      data: advertisements,
      count: advertisements.length
    });
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertisements',
      error: error.message
    });
  }
});

// @route   GET /api/advertisements/:id
// @desc    Get single advertisement
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName');

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    res.json({
      success: true,
      data: advertisement
    });
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertisement',
      error: error.message
    });
  }
});

// @route   POST /api/advertisements/:id/impression
// @desc    Record advertisement impression
// @access  Public
router.post('/:id/impression', async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    await advertisement.recordImpression();

    res.json({
      success: true,
      message: 'Impression recorded'
    });
  } catch (error) {
    console.error('Error recording impression:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording impression',
      error: error.message
    });
  }
});

// @route   POST /api/advertisements/:id/click
// @desc    Record advertisement click
// @access  Public
router.post('/:id/click', async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    await advertisement.recordClick();

    res.json({
      success: true,
      message: 'Click recorded'
    });
  } catch (error) {
    console.error('Error recording click:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording click',
      error: error.message
    });
  }
});

// Admin routes - require authentication
router.use(adminAuth);

// @route   GET /api/advertisements/admin/list
// @desc    Get all advertisements for admin
// @access  Private (Admin)
router.get('/admin/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, position, search } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (position) query.position = position;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const advertisements = await Advertisement.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Advertisement.countDocuments(query);

    res.json({
      success: true,
      data: advertisements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertisements',
      error: error.message
    });
  }
});

// @route   GET /api/advertisements/admin/stats
// @desc    Get advertisement statistics
// @access  Private (Admin)
router.get('/admin/stats', async (req, res) => {
  try {
    const totalAds = await Advertisement.countDocuments();
    const activeAds = await Advertisement.countDocuments({ status: 'active', isActive: true });
    const draftAds = await Advertisement.countDocuments({ status: 'draft' });
    const pausedAds = await Advertisement.countDocuments({ status: 'paused' });

    // Get performance stats
    const performanceStats = await Advertisement.aggregate([
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$performance.impressions' },
          totalClicks: { $sum: '$performance.clicks' },
          totalRevenue: { $sum: '$performance.revenue' },
          avgCTR: { $avg: '$performance.ctr' }
        }
      }
    ]);

    // Get ads by type
    const adsByType = await Advertisement.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get ads by position
    const adsByPosition = await Advertisement.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalAds,
          active: activeAds,
          draft: draftAds,
          paused: pausedAds
        },
        performance: performanceStats[0] || {
          totalImpressions: 0,
          totalClicks: 0,
          totalRevenue: 0,
          avgCTR: 0
        },
        byType: adsByType,
        byPosition: adsByPosition
      }
    });
  } catch (error) {
    console.error('Error fetching advertisement stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertisement statistics',
      error: error.message
    });
  }
});

// @route   POST /api/advertisements/admin/create
// @desc    Create new advertisement
// @access  Private (Admin)
router.post('/admin/create', validateAdvertisement, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const advertisementData = {
      ...req.body,
      createdBy: req.user.id
    };

    const advertisement = new Advertisement(advertisementData);
    await advertisement.save();

    await advertisement.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: advertisement
    });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating advertisement',
      error: error.message
    });
  }
});

// @route   PUT /api/advertisements/admin/:id
// @desc    Update advertisement
// @access  Private (Admin)
router.put('/admin/:id', validateAdvertisement, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id
    };

    const updatedAdvertisement = await Advertisement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: updatedAdvertisement
    });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating advertisement',
      error: error.message
    });
  }
});

// @route   DELETE /api/advertisements/admin/:id
// @desc    Delete advertisement
// @access  Private (Admin)
router.delete('/admin/:id', async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    await Advertisement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting advertisement',
      error: error.message
    });
  }
});

// @route   PUT /api/advertisements/admin/:id/status
// @desc    Update advertisement status
// @access  Private (Admin)
router.put('/admin/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'paused', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const advertisement = await Advertisement.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        lastModifiedBy: req.user.id
      },
      { new: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('lastModifiedBy', 'firstName lastName email');

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    res.json({
      success: true,
      message: 'Advertisement status updated successfully',
      data: advertisement
    });
  } catch (error) {
    console.error('Error updating advertisement status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating advertisement status',
      error: error.message
    });
  }
});

module.exports = router;
