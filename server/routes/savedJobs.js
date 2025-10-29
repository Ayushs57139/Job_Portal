const express = require('express');
const { body, validationResult } = require('express-validator');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/saved-jobs/save
// @desc    Save a job for the authenticated user
// @access  Private
router.post('/save', auth, [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
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

    const { jobId, notes = '', tags = [] } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job is already saved
    const existingSavedJob = await SavedJob.isJobSaved(req.user._id, jobId);
    if (existingSavedJob) {
      return res.status(400).json({
        success: false,
        message: 'Job is already saved'
      });
    }

    // Save the job
    const savedJob = await SavedJob.saveJob(req.user._id, jobId, notes, tags);

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      savedJob: {
        id: savedJob._id,
        jobId: savedJob.job,
        savedAt: savedJob.savedAt,
        notes: savedJob.notes,
        tags: savedJob.tags
      }
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving job'
    });
  }
});

// @route   DELETE /api/saved-jobs/unsave/:jobId
// @desc    Unsave a job for the authenticated user
// @access  Private
router.delete('/unsave/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;

    const savedJob = await SavedJob.unsaveJob(req.user._id, jobId);
    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unsaving job'
    });
  }
});

// @route   GET /api/saved-jobs
// @desc    Get saved jobs for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const savedJobs = await SavedJob.getSavedJobs(req.user._id, page, limit);
    const totalCount = await SavedJob.getSavedJobsCount(req.user._id);

    // Filter out jobs that are no longer active
    const activeSavedJobs = savedJobs.filter(savedJob => savedJob.job !== null);

    res.json({
      success: true,
      savedJobs: activeSavedJobs.map(savedJob => ({
        id: savedJob._id,
        job: {
          id: savedJob.job._id,
          title: savedJob.job.title,
          company: savedJob.job.company,
          location: savedJob.job.location,
          salary: savedJob.job.salary,
          employmentType: savedJob.job.employmentType,
          jobType: savedJob.job.jobType,
          createdAt: savedJob.job.createdAt
        },
        savedAt: savedJob.savedAt,
        notes: savedJob.notes,
        tags: savedJob.tags
      })),
      pagination: {
        current: page,
        pages: Math.ceil(totalCount / limit),
        total: totalCount
      }
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saved jobs'
    });
  }
});

// @route   GET /api/saved-jobs/count
// @desc    Get count of saved jobs for the authenticated user
// @access  Private
router.get('/count', auth, async (req, res) => {
  try {
    const count = await SavedJob.getSavedJobsCount(req.user._id);

    res.json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Get saved jobs count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saved jobs count'
    });
  }
});

// @route   GET /api/saved-jobs/check/:jobId
// @desc    Check if a job is saved by the authenticated user
// @access  Private
router.get('/check/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;

    const savedJob = await SavedJob.isJobSaved(req.user._id, jobId);

    res.json({
      success: true,
      isSaved: !!savedJob,
      savedJob: savedJob ? {
        id: savedJob._id,
        savedAt: savedJob.savedAt,
        notes: savedJob.notes,
        tags: savedJob.tags
      } : null
    });
  } catch (error) {
    console.error('Check saved job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking saved job'
    });
  }
});

// @route   PUT /api/saved-jobs/:savedJobId
// @desc    Update notes and tags for a saved job
// @access  Private
router.put('/:savedJobId', auth, [
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
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

    const { savedJobId } = req.params;
    const { notes, tags } = req.body;

    const savedJob = await SavedJob.findOneAndUpdate(
      { _id: savedJobId, user: req.user._id, isActive: true },
      { notes, tags },
      { new: true }
    );

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }

    res.json({
      success: true,
      message: 'Saved job updated successfully',
      savedJob: {
        id: savedJob._id,
        jobId: savedJob.job,
        savedAt: savedJob.savedAt,
        notes: savedJob.notes,
        tags: savedJob.tags
      }
    });
  } catch (error) {
    console.error('Update saved job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating saved job'
    });
  }
});

module.exports = router;
