const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { requirePermission } = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/admin/jobs/count
// @desc    Get job counts
// @access  Private (Admin)
router.get('/count', async (req, res) => {
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
router.get('/', requirePermission('canManageJobs'), async (req, res) => {
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
router.put('/:id', requirePermission('canManageJobs'), async (req, res) => {
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
router.patch('/:id', requirePermission('canManageJobs'), async (req, res) => {
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
router.delete('/:id', requirePermission('canManageJobs'), async (req, res) => {
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

module.exports = router;

