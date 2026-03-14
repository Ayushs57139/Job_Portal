const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/profile-pictures');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user ? req.user._id : 'temp';
    cb(null, 'profile-' + userId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('profile.skills').optional().isArray().withMessage('Skills must be an array'),
  body('profile.experience').optional().isNumeric().withMessage('Experience must be a number'),
  body('profile.currentLocation').optional().isString().withMessage('Current location must be a string'),
  body('profile.preferredLocations').optional().isArray().withMessage('Preferred locations must be an array'),
  body('profile.currentSalary').optional().isNumeric().withMessage('Current salary must be a number'),
  body('profile.expectedSalary').optional().isNumeric().withMessage('Expected salary must be a number'),
  body('profile.education').optional().isArray().withMessage('Education must be an array'),
  body('profile.currentJobJourneyStatus').optional().isIn([
    'Actively Applying For Job',
    'Actively Searching for jobs',
    'Appearing for interviews',
    'Casually exploring jobs',
    'Joined New Organization',
    'Looking For Senior Position',
    'Not looking for jobs',
    'Preparing for Government Job',
    'Preparing for interviews',
    'Received a job offer',
    'Started New Career'
  ]).withMessage('Invalid job journey status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'profile'
    ];

    // Filter only allowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// Configure multer for resume uploads
const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user ? req.user._id : 'temp';
    cb(null, 'resume-' + userId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const resumeFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf' || 
                   file.mimetype === 'application/msword' || 
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
};

const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: resumeFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   POST /api/users/upload-resume
// @desc    Upload resume
// @access  Private
router.post('/upload-resume', auth, resumeUpload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file received in upload-resume request');
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    const filePath = `/uploads/resumes/${req.file.filename}`;
    console.log(`Uploading resume for user ${req.user._id}: ${filePath}`);
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'profile.resume': filePath } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Resume successfully saved for user ${req.user._id}: ${user.profile?.resume || 'Not found in user object'}`);

    res.json({
      message: 'Resume uploaded successfully',
      user: {
        ...user.toObject(),
        resume: user.profile?.resume || null
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Server error while uploading resume', error: error.message });
  }
});

// @route   POST /api/users/upload-profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Get the file path relative to the server root
    const filePath = `/uploads/profile-pictures/${req.file.filename}`;
    
    // Update user profile with the new picture path
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'profile.avatar': filePath } },
      { new: true }
    ).select('-password');

    // Also update UserProfile if it exists
    try {
      await UserProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: { 'personalInfo.profilePicture': filePath } },
        { upsert: true }
      );
    } catch (profileError) {
      console.log('UserProfile not found or error updating:', profileError.message);
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: filePath,
      user: user
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while uploading profile picture' 
    });
  }
});

// @route   GET /api/users/profile-picture/:filename
// @desc    Serve profile picture
// @access  Public
router.get('/profile-picture/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/profile-pictures', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving profile picture:', error);
    res.status(500).json({ message: 'Error serving profile picture' });
  }
});

// @route   POST /api/users/add-education
// @desc    Add education
// @access  Private
router.post('/add-education', [
  auth,
  body('degree').notEmpty().withMessage('Degree is required'),
  body('institution').notEmpty().withMessage('Institution is required'),
  body('year').isNumeric().withMessage('Year must be a number'),
  body('percentage').optional().isNumeric().withMessage('Percentage must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { degree, institution, year, percentage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { 'profile.education': { degree, institution, year, percentage } } },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Education added successfully',
      user
    });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({ message: 'Server error while adding education' });
  }
});

// @route   POST /api/users/add-work-experience
// @desc    Add work experience
// @access  Private
router.post('/add-work-experience', [
  auth,
  body('company').notEmpty().withMessage('Company is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('current').optional().isBoolean().withMessage('Current must be a boolean'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { company, position, startDate, endDate, current, description } = req.body;

    const workExp = {
      company,
      position,
      startDate: new Date(startDate),
      description
    };

    if (current) {
      workExp.current = true;
    } else if (endDate) {
      workExp.endDate = new Date(endDate);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { 'profile.workExperience': workExp } },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Work experience added successfully',
      user
    });
  } catch (error) {
    console.error('Add work experience error:', error);
    res.status(500).json({ message: 'Server error while adding work experience' });
  }
});

// @route   DELETE /api/users/education/:index
// @desc    Delete education entry
// @access  Private
router.delete('/education/:index', auth, async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    if (isNaN(index) || index < 0) {
      return res.status(400).json({ message: 'Invalid education index' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.profile.education || index >= user.profile.education.length) {
      return res.status(400).json({ message: 'Education entry not found' });
    }

    user.profile.education.splice(index, 1);
    await user.save();

    res.json({
      message: 'Education entry deleted successfully',
      user
    });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({ message: 'Server error while deleting education' });
  }
});

// @route   DELETE /api/users/work-experience/:index
// @desc    Delete work experience entry
// @access  Private
router.delete('/work-experience/:index', auth, async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    if (isNaN(index) || index < 0) {
      return res.status(400).json({ message: 'Invalid work experience index' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.profile.workExperience || index >= user.profile.workExperience.length) {
      return res.status(400).json({ message: 'Work experience entry not found' });
    }

    user.profile.workExperience.splice(index, 1);
    await user.save();

    res.json({
      message: 'Work experience entry deleted successfully',
      user
    });
  } catch (error) {
    console.error('Delete work experience error:', error);
    res.status(500).json({ message: 'Server error while deleting work experience' });
  }
});

// @route   GET /api/users/dashboard-stats
// @desc    Get user dashboard statistics
// @access  Private
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const Application = require('../models/Application');
    const Job = require('../models/Job');
    const SavedJob = require('../models/SavedJob');
    const JobInvitation = require('../models/JobInvitation');

    let stats = {};

    if (req.user.userType === 'jobseeker') {
      const applications = await Application.find({ user: req.user._id });
      const totalApplications = applications.length;
      const activeApplications = applications.filter(app => 
        ['pending', 'reviewed', 'shortlisted'].includes(app.status)
      ).length;
      
      // Get assigned jobs count
      const assignedApplications = applications.filter(app => 
        app.status === 'assigned' && app.assignedByAdmin === true
      );
      const assignedJobsCount = assignedApplications.length;
      
      const savedJobsCount = await SavedJob.getSavedJobsCount(req.user._id);
      
      // Get job invitations
      const jobInvitations = await JobInvitation.find({
        candidate: req.user._id,
        status: { $in: ['pending', 'viewed'] },
        expiresAt: { $gt: new Date() }
      })
        .populate('job', 'title company location salary type deadline')
        .populate('invitedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      
      // Simulate profile views (you can implement actual profile view tracking later)
      const profileViews = Math.floor(Math.random() * 200) + 50; // Random number between 50-250
      
      const recentApplications = await Application.find({ 
        user: req.user._id,
        status: { $ne: 'assigned' } // Exclude assigned jobs from recent applications
      })
        .populate('job', 'title company location salary type')
        .sort({ appliedAt: -1 })
        .limit(5)
        .lean();

      // Get assigned jobs separately
      const assignedJobs = await Application.find({ 
        user: req.user._id,
        status: 'assigned',
        assignedByAdmin: true
      })
        .populate('job', 'title company location salary type deadline')
        .sort({ assignedAt: -1 })
        .limit(10)
        .lean();

      stats = {
        totalApplications,
        activeApplications,
        savedJobs: savedJobsCount,
        profileViews,
        assignedJobs: assignedJobsCount,
        jobInvitations: jobInvitations.length,
        recentApplications: recentApplications.map(app => ({
          _id: app._id,
          job: app.job,
          status: app.status,
          appliedAt: app.appliedAt,
        })),
        assignedJobsList: assignedJobs.map(app => ({
          _id: app._id,
          job: app.job,
          status: app.status,
          assignedAt: app.assignedAt,
          appliedAt: app.appliedAt,
        })),
        jobInvitationsList: jobInvitations.map(inv => ({
          _id: inv._id,
          job: inv.job,
          invitedBy: inv.invitedBy,
          message: inv.message,
          status: inv.status,
          createdAt: inv.createdAt,
          expiresAt: inv.expiresAt
        })),
        statusCounts: {
          applied: applications.filter(app => app.status === 'applied').length,
          viewed: applications.filter(app => app.status === 'viewed').length,
          shortlisted: applications.filter(app => app.status === 'shortlisted').length,
          rejected: applications.filter(app => app.status === 'rejected').length,
          interviewed: applications.filter(app => app.status === 'interviewed').length,
          hired: applications.filter(app => app.status === 'hired').length,
          assigned: assignedJobsCount
        }
      };
    } else if (req.user.userType === 'employer') {
      const jobs = await Job.find({ postedBy: req.user._id });
      const applications = await Application.find({ job: { $in: jobs.map(job => job._id) } });
      
      stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'active').length,
        totalApplications: applications.length,
        recentApplications: applications
          .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
          .slice(0, 5)
      };
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
});

// @route   GET /api/users/preferences
// @desc    Get user notification preferences
// @access  Private
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({
      success: true,
      preferences: user.notifications || {
        email: {
          jobAlerts: true,
          applicationUpdates: true,
          marketing: false
        },
        push: {
          jobAlerts: true,
          applicationUpdates: true
        }
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching preferences' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user notification preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('emailNotifications').optional().isBoolean().withMessage('emailNotifications must be a boolean'),
  body('jobAlerts').optional().isBoolean().withMessage('jobAlerts must be a boolean'),
  body('applicationUpdates').optional().isBoolean().withMessage('applicationUpdates must be a boolean'),
  body('marketingEmails').optional().isBoolean().withMessage('marketingEmails must be a boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { emailNotifications, jobAlerts, applicationUpdates, marketingEmails } = req.body;
    const user = await User.findById(req.user._id);

    // Initialize notifications if not exists
    if (!user.notifications) {
      user.notifications = {
        email: {},
        push: {}
      };
    }
    if (!user.notifications.email) user.notifications.email = {};
    if (!user.notifications.push) user.notifications.push = {};

    // Map frontend field names to backend structure
    // emailNotifications controls both email.jobAlerts and email.applicationUpdates
    if (emailNotifications !== undefined) {
      user.notifications.email.jobAlerts = emailNotifications;
      user.notifications.email.applicationUpdates = emailNotifications;
    }

    // jobAlerts specifically controls job alert notifications
    if (jobAlerts !== undefined) {
      user.notifications.email.jobAlerts = jobAlerts;
      user.notifications.push.jobAlerts = jobAlerts;
    }

    // applicationUpdates specifically controls application update notifications
    if (applicationUpdates !== undefined) {
      user.notifications.email.applicationUpdates = applicationUpdates;
      user.notifications.push.applicationUpdates = applicationUpdates;
    }

    // marketingEmails controls marketing email notifications
    if (marketingEmails !== undefined) {
      user.notifications.email.marketing = marketingEmails;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.notifications
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating preferences' });
  }
});

// @route   GET /api/users/job-invitations
// @desc    Get job invitations for current user
// @access  Private
router.get('/job-invitations', auth, async (req, res) => {
  try {
    const JobInvitation = require('../models/JobInvitation');

    const invitations = await JobInvitation.find({
      candidate: req.user._id,
      status: { $in: ['pending', 'viewed'] },
      expiresAt: { $gt: new Date() }
    })
      .populate('job', 'title company location salary type deadline description')
      .populate('invitedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      invitations,
      count: invitations.length
    });
  } catch (error) {
    console.error('Get job invitations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/users/job-invitations/:invitationId/view
// @desc    Mark invitation as viewed
// @access  Private
router.patch('/job-invitations/:invitationId/view', auth, async (req, res) => {
  try {
    const JobInvitation = require('../models/JobInvitation');

    const invitation = await JobInvitation.findOne({
      _id: req.params.invitationId,
      candidate: req.user._id
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    await invitation.markAsViewed();

    res.json({
      message: 'Invitation marked as viewed',
      invitation
    });
  } catch (error) {
    console.error('Mark invitation viewed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/users/job-invitations/:invitationId/decline
// @desc    Decline job invitation
// @access  Private
router.patch('/job-invitations/:invitationId/decline', auth, async (req, res) => {
  try {
    const JobInvitation = require('../models/JobInvitation');

    const invitation = await JobInvitation.findOne({
      _id: req.params.invitationId,
      candidate: req.user._id
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    await invitation.markAsDeclined();

    res.json({
      message: 'Invitation declined',
      invitation
    });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
