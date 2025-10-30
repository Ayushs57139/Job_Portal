const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { auth, employerAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('location').optional().isString().withMessage('Location must be a string'),
  query('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']).withMessage('Invalid job type'),
  query('workMode').optional().isIn(['office', 'remote', 'hybrid']).withMessage('Invalid work mode'),
  query('minSalary').optional().isInt({ min: 0 }).withMessage('Min salary must be a positive integer'),
  query('maxSalary').optional().isInt({ min: 0 }).withMessage('Max salary must be a positive integer'),
  query('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive integer'),
  query('skills').optional().isString().withMessage('Skills must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      search,
      location,
      jobType,
      workMode,
      minSalary,
      maxSalary,
      experience,
      skills
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Location filter
    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } }
      ];
    }

    // Job type filter
    if (jobType) {
      filter.jobType = jobType;
    }

    // Work mode filter
    if (workMode) {
      filter.workMode = workMode;
    }

    // Salary filter
    if (minSalary || maxSalary) {
      filter['salary.min'] = {};
      if (minSalary) filter['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) filter['salary.min'].$lte = parseInt(maxSalary);
    }

    // Experience filter
    if (experience) {
      filter['requirements.experience.min'] = { $lte: parseInt(experience) };
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filter['requirements.skills'] = { $in: skillsArray };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName company')
      .sort({ createdAt: -1, featured: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalJobs,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching job with ID:', req.params.id);
    
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid job ID format');
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName company profile')
      .lean();

    if (!job) {
      console.log('Job not found in database');
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('Job found:', job._id);

    // Increment view count
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error while fetching job', error: error.message });
  }
});

// @route   POST /api/jobs
// @desc    Create new job
// @access  Private (Employer)
router.post('/', [
  employerAuth,
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('company.name').notEmpty().withMessage('Company name is required'),
  body('company.type').notEmpty().withMessage('Company type is required'),
  body('company.totalEmployees').notEmpty().withMessage('Total employees count is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('salary.min').isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').isNumeric().withMessage('Maximum salary must be a number'),
  body('employmentType').notEmpty().withMessage('Employment type is required'),
  body('jobType').notEmpty().withMessage('Job type is required'),
  body('jobModeType').notEmpty().withMessage('Job mode type is required'),
  body('jobShiftType').notEmpty().withMessage('Job shift type is required'),
  body('experienceLevel').notEmpty().withMessage('Experience level is required'),
  body('totalExperience.min').notEmpty().withMessage('Minimum experience is required'),
  body('totalExperience.max').notEmpty().withMessage('Maximum experience is required'),
  body('numberOfVacancy').isNumeric().withMessage('Number of vacancy must be a number'),
  body('joiningPeriod').notEmpty().withMessage('Joining period is required'),
  body('hrContact.name').notEmpty().withMessage('HR contact name is required'),
  body('hrContact.number').notEmpty().withMessage('HR contact number is required'),
  body('hrContact.email').isEmail().withMessage('Valid HR contact email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if employer is verified (only for employers, not admins)
    const isAdmin = req.user.userType === 'admin' || req.user.userType === 'superadmin';
    
    if (!isAdmin && req.user.userType === 'employer' && !req.user.canPostJobs()) {
      return res.status(403).json({
        message: 'Your employer account is not verified yet. Please wait for admin verification before posting jobs.',
        verificationStatus: req.user.verificationStatus
      });
    }

    // Check for duplicate job posting within last 30 seconds (skip for admins)
    if (!isAdmin) {
      const recentJob = await Job.findOne({
        postedBy: req.user._id,
        title: req.body.title,
        'company.name': req.body.company?.name,
        createdAt: { $gte: new Date(Date.now() - 30000) } // 30 seconds ago
      });

      if (recentJob) {
        return res.status(400).json({ 
          message: 'Duplicate job posting detected. Please wait before posting the same job again.' 
        });
      }
    }

    const jobData = {
      ...req.body,
      postedBy: req.user._id,
      // Set job to active immediately if posted by admin
      status: isAdmin ? 'active' : (req.body.status || 'pending')
    };

    // Process skills array
    if (jobData.skills && typeof jobData.skills === 'string') {
      jobData.skills = jobData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    }

    // Process department data - combine category and subcategories
    if (jobData.departmentCategory || jobData.departmentSubcategory) {
      const departmentArray = [];
      
      // Add main department category if provided
      if (jobData.departmentCategory) {
        departmentArray.push(jobData.departmentCategory);
      }
      
      // Add subcategories if provided
      if (jobData.departmentSubcategory) {
        if (Array.isArray(jobData.departmentSubcategory)) {
          departmentArray.push(...jobData.departmentSubcategory);
        } else {
          departmentArray.push(jobData.departmentSubcategory);
        }
      }
      
      jobData.department = departmentArray;
      
      // Remove the separate fields
      delete jobData.departmentCategory;
      delete jobData.departmentSubcategory;
    }

    // Process arrays for checkboxes
    const arrayFields = ['keySkills', 'additionalBenefits', 'gender', 'maritalStatus', 'industry', 'department', 'jobRole', 'education', 'course', 'candidateIndustry', 'preferredLanguage', 'diversityHiring', 'disabilityStatus', 'disabilities', 'jobResponseMethods', 'communicationPreference', 'questionsForCandidates', 'collaborateWithOtherUsers', 'hrContact.days'];
    
    arrayFields.forEach(field => {
      if (jobData[field] && !Array.isArray(jobData[field])) {
        jobData[field] = [jobData[field]];
      }
    });

    // Process candidate questions
    if (jobData.candidateQuestions && Array.isArray(jobData.candidateQuestions)) {
      jobData.candidateQuestions = jobData.candidateQuestions.map((question, index) => ({
        ...question,
        questionId: question.questionId || `q_${Date.now()}_${index}`,
        order: question.order || index
      }));
    }

    const job = new Job(jobData);
    await job.save();

    // Handle Google Job Posting if enabled
    if (jobData.enableGoogleJobPost) {
      try {
        const googleJobPostingService = require('../services/googleJobPostingService');
        const googleResult = await googleJobPostingService.postJobToGoogle(job);
        
        if (googleResult.success) {
          job.googleJobPostStatus = 'posted';
          job.googleJobPostId = googleResult.googleJobId;
          job.googleJobPostUrl = googleResult.googleJobUrl;
          await job.save();
          console.log('Job successfully posted to Google for Jobs');
        } else {
          job.googleJobPostStatus = 'failed';
          await job.save();
          console.error('Failed to post job to Google for Jobs:', googleResult.error);
        }
      } catch (error) {
        console.error('Error in Google Job Posting:', error);
        job.googleJobPostStatus = 'failed';
        await job.save();
      }
    }

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'firstName lastName company');

    res.status(201).json({
      message: 'Job created successfully',
      job: populatedJob,
      googleJobPostStatus: job.googleJobPostStatus
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error while creating job' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (Employer)
router.put('/:id', employerAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // Process department data - combine category and subcategories
    const updateData = { ...req.body };
    if (updateData.departmentCategory || updateData.departmentSubcategory) {
      const departmentArray = [];
      
      // Add main department category if provided
      if (updateData.departmentCategory) {
        departmentArray.push(updateData.departmentCategory);
      }
      
      // Add subcategories if provided
      if (updateData.departmentSubcategory) {
        if (Array.isArray(updateData.departmentSubcategory)) {
          departmentArray.push(...updateData.departmentSubcategory);
        } else {
          departmentArray.push(updateData.departmentSubcategory);
        }
      }
      
      updateData.department = departmentArray;
      
      // Remove the separate fields
      delete updateData.departmentCategory;
      delete updateData.departmentSubcategory;
    }

    // Process candidate questions
    if (updateData.candidateQuestions && Array.isArray(updateData.candidateQuestions)) {
      updateData.candidateQuestions = updateData.candidateQuestions.map((question, index) => ({
        ...question,
        questionId: question.questionId || `q_${Date.now()}_${index}`,
        order: question.order || index
      }));
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName company');

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (Employer)
router.delete('/:id', employerAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
});

// @route   GET /api/jobs/employer/my-jobs
// @desc    Get employer's jobs
// @access  Private (Employer)
router.get('/employer/my-jobs', employerAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const filter = { postedBy: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(filter)
      .populate('applications', 'applicant status appliedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJobs / parseInt(limit)),
        totalJobs
      }
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
});

// @route   GET /api/jobs/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Job.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { 'company.name': { $regex: q, $options: 'i' } },
            { 'location.city': { $regex: q, $options: 'i' } },
            { 'requirements.skills': { $regex: q, $options: 'i' } }
          ],
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          titles: { $addToSet: '$title' },
          companies: { $addToSet: '$company.name' },
          cities: { $addToSet: '$location.city' },
          skills: { $addToSet: '$requirements.skills' }
        }
      }
    ]);

    const result = suggestions[0] || {};
    const allSuggestions = [
      ...(result.titles || []),
      ...(result.companies || []),
      ...(result.cities || []),
      ...(result.skills?.flat() || [])
    ].filter((item, index, self) => 
      item && self.indexOf(item) === index
    ).slice(0, 10);

    res.json({ suggestions: allSuggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error while fetching suggestions' });
  }
});

// @route   POST /api/jobs/post-without-registration
// @desc    Post a job without registration and create account automatically
// @access  Public
router.post('/post-without-registration', [
  body('userType').isIn(['company', 'consultancy']).withMessage('User type must be company or consultancy'),
  body('company.name').notEmpty().withMessage('Company name is required'),
  body('company.type').notEmpty().withMessage('Company type is required'),
  body('company.totalEmployees').notEmpty().withMessage('Company size is required'),
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('numberOfVacancy').isInt({ min: 1 }).withMessage('Number of vacancies must be at least 1'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('hrContact.name').notEmpty().withMessage('HR contact name is required'),
  body('hrContact.email').isEmail().withMessage('Please include a valid email'),
  body('hrContact.number').notEmpty().withMessage('HR contact phone is required'),
  body('agreeTerms').equals('true').withMessage('You must agree to terms and conditions')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

        const {
          userType,
          company,
          title,
          skills,
          employmentType,
          jobType,
          jobModeType,
          jobShiftType,
          numberOfVacancy,
          description,
          location,
          experienceLevel,
          totalExperience,
          salary,
          hrContact,
          additionalBenefits,
          gender,
          maritalStatus,
          candidateAge,
          preferredLanguage,
          joiningPeriod,
          diversityHiring,
          disabilityStatus,
          disabilities,
          jobResponseMethods,
          communicationPreference,
          includeWalkinDetails,
          walkinStartDate,
          walkinEndDate,
          walkinTiming,
          walkinVenueAddress,
          contactPersonName,
          contactPersonNumber,
          googleMapUrl,
          questionsForCandidates,
          collaborateWithOtherUsers,
          aboutYourClients,
          clientCompanyName,
          hideClientName,
          employerDetails
        } = req.body;

    // Check if user already exists with this email
    const User = require('../models/User');
    let user = await User.findOne({ email: hrContact.email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      // Create new user account automatically
      isNewUser = true;
      
      // Generate unique userId
      let userId;
      let isUnique = false;
      
      while (!isUnique) {
        const randomNum = Math.floor(10000000 + Math.random() * 90000000);
        userId = `JW${randomNum}`;
        
        const existingUserId = await User.findOne({ userId });
        if (!existingUserId) {
          isUnique = true;
        }
      }

      // Generate a temporary password (user can change it later)
      const tempPassword = Math.random().toString(36).slice(-8);
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);

      // Create user data
      const userData = {
        userId,
        firstName: hrContact.name.split(' ')[0] || hrContact.name,
        lastName: hrContact.name.split(' ').slice(1).join(' ') || '',
        email: hrContact.email.toLowerCase(),
        password: hashedPassword,
        phone: hrContact.number,
        userType: 'employer',
        employerType: userType,
        profile: {
          company: {
            name: company.name,
            website: company.website || '',
            industry: '',
            totalEmployees: company.totalEmployees || '0-10'
          }
        },
        verificationStatus: 'pending',
        isEmployerVerified: false,
        isActive: true,
        isEmailVerified: false,
        tempPassword: tempPassword // Store temp password for email notification
      };

      user = new User(userData);
      await user.save();
    }

    // Create job data using the same format as admin panel
    const jobData = {
      // Basic job info
      title: title,
      description: description,
      
      // Company info
      company: {
        name: company.name,
        totalEmployees: company.totalEmployees || '0-10',
        website: company.website || '',
        type: company.type || (userType === 'company' ? 'Corporate' : 'Consultancy'),
        industry: ''
      },
      
      // Job details
      jobPostType: 'Sales',
      employmentType: employmentType || 'Permanent',
      jobType: jobType || 'Full Time',
      jobModeType: jobModeType || 'Work From Office',
      jobShiftType: jobShiftType || 'Day Shift',
      skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
      
      // Location
      location: {
        state: location.state,
        city: location.city,
        locality: location.locality || '',
        distanceFromLocation: location.distanceFromLocation || '',
        includeWillingToRelocate: location.includeWillingToRelocate || false
      },
      
      // Experience
      experienceLevel: experienceLevel || 'Fresher',
      experienceType: experienceLevel || 'Fresher',
      totalExperience: {
        min: totalExperience.min || 'Fresher',
        max: totalExperience.max || 'Fresher'
      },
      
      // Salary
      salary: {
        min: salary.min || 10000,
        max: salary.max || 20000,
        currency: 'INR',
        hideFromCandidates: salary.hideFromCandidates || false
      },
      
      // Vacancy
      numberOfVacancy: numberOfVacancy,
      
      // HR Contact
      hrContact: {
        name: hrContact.name,
        number: hrContact.number,
        email: hrContact.email,
        whatsappNumber: hrContact.whatsappNumber || hrContact.number,
        timing: { 
          start: hrContact.timing.start || '09:00', 
          end: hrContact.timing.end || '18:00' 
        },
        days: hrContact.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      
      // Additional comprehensive fields
      additionalBenefits: additionalBenefits || [],
      gender: gender || '',
      maritalStatus: maritalStatus || '',
      candidateAge: candidateAge || {},
      preferredLanguage: preferredLanguage || [],
      joiningPeriod: joiningPeriod || '',
      diversityHiring: diversityHiring || '',
      disabilityStatus: disabilityStatus || '',
      disabilities: disabilities || '',
      jobResponseMethods: jobResponseMethods || '',
      communicationPreference: communicationPreference || '',
      includeWalkinDetails: includeWalkinDetails || false,
      walkinStartDate: walkinStartDate || '',
      walkinEndDate: walkinEndDate || '',
      walkinTiming: walkinTiming || '',
      walkinVenueAddress: walkinVenueAddress || '',
      contactPersonName: contactPersonName || '',
      contactPersonNumber: contactPersonNumber || '',
      googleMapUrl: googleMapUrl || '',
      questionsForCandidates: questionsForCandidates || '',
      collaborateWithOtherUsers: collaborateWithOtherUsers || '',
      aboutYourClients: aboutYourClients || '',
      clientCompanyName: clientCompanyName || '',
      hideClientName: hideClientName || false,
      employerDetails: employerDetails || '',
      
      // Additional fields
      status: 'active',
      postedBy: user._id
    };

    console.log('Creating job with data:', JSON.stringify(jobData, null, 2));

    const job = new Job(jobData);
    await job.save();

        // Send email notification with login credentials (if new user)
        if (isNewUser) {
          // Here you would typically send an email with login credentials
          // For now, we'll just log it
          console.log(`New user created: ${hrContact.email}, Temp password: ${user.tempPassword}`);
        }

    res.status(201).json({
      success: true,
      message: 'Job posted successfully and account created',
      job: job,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        employerType: user.employerType,
        isNewUser: isNewUser,
        tempPassword: isNewUser ? user.tempPassword : undefined
      }
    });

  } catch (error) {
    console.error('Error posting job without registration:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while posting job: ' + error.message
    });
  }
});

module.exports = router;
