const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const { requirePermission } = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/admin/applications/count
// @desc    Get application count
// @access  Private (Admin)
router.get('/count', async (req, res) => {
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
router.get('/', requirePermission('canManageApplications'), async (req, res) => {
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
router.get('/:id', requirePermission('canManageApplications'), async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }

    const application = await Application.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('job', 'title company location salary');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/admin/applications/:id
// @desc    Update application (partial update)
// @access  Private (Admin)
router.patch('/:id', requirePermission('canManageApplications'), async (req, res) => {
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
router.delete('/:id', requirePermission('canManageApplications'), async (req, res) => {
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
router.put('/:id/status', requirePermission('canManageApplications'), [
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

module.exports = router;

