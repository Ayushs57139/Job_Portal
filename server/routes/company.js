const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/company
// @desc    Get all companies and consultancies (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('🔍 GET /api/company - Companies page accessed');
    const { search, industry, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query for registered companies and consultancies
    // Handle both old format (userType: 'company'/'consultancy') and new format (userType: 'employer' with employerType)
    // Use $and to properly combine the conditions
    let query = {
      $and: [
        {
          $or: [
            // New format: userType: 'employer' with employerType
            {
              userType: 'employer',
              employerType: { $in: ['company', 'consultancy'] }
            },
            // Old format: userType: 'company' or 'consultancy'
            {
              userType: { $in: ['company', 'consultancy'] }
            }
          ]
        },
        {
          // Only exclude companies where isActive is explicitly set to false
          // Include all others (true, null, undefined, not set)
          $or: [
            { isActive: { $ne: false } },
            { isActive: { $exists: false } }
          ]
        }
      ]
    };

    // Build additional filters
    const additionalFilters = [];

    // Add search filter
    if (search) {
      additionalFilters.push({
        $or: [
          { 'profile.company.name': { $regex: search, $options: 'i' } },
          { 'profile.company.description': { $regex: search, $options: 'i' } },
          { 'company.name': { $regex: search, $options: 'i' } }, // Fallback for old data structure
          { firstName: { $regex: search, $options: 'i' } }, // Search by user name
          { lastName: { $regex: search, $options: 'i' } } // Search by user name
        ]
      });
    }

    // Add industry filter
    if (industry && industry !== 'all') {
      additionalFilters.push({
        $or: [
          { 'profile.company.industry': { $regex: industry, $options: 'i' } },
          { 'company.industry': { $regex: industry, $options: 'i' } } // Fallback
        ]
      });
    }

    // Combine all filters - merge with existing $and array, don't replace it
    if (additionalFilters.length > 0) {
      query.$and = [...query.$and, ...additionalFilters];
    }

    // Debug: Log the query to see what we're searching for
    console.log('📋 Companies query:', JSON.stringify(query, null, 2));

    // Get registered companies and consultancies
    const companies = await User.find(query)
      .select('profile.company company employerType userType firstName lastName companyName consultancyName isEmployerVerified verificationStatus createdAt isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Debug: Log how many companies were found
    console.log(`✅ Found ${companies.length} companies (showing page ${page}, limit ${limit})`);

    // Get total count
    const totalCompanies = await User.countDocuments(query);
    
    // Debug: Log total count
    console.log(`📊 Total companies in database matching query: ${totalCompanies}`);
    
    // Also log a sample of company IDs and names for debugging
    if (companies.length > 0) {
      console.log('📝 Sample companies found:', companies.slice(0, 3).map(c => ({
        id: c._id,
        name: c.profile?.company?.name || c.company?.name || `${c.firstName} ${c.lastName}`,
        userType: c.userType,
        employerType: c.employerType,
        isActive: c.isActive
      })));
    } else {
      console.log('⚠️  No companies found! Checking database...');
      // Quick check: count all employers
      const allEmployers = await User.countDocuments({ 
        $or: [
          { userType: 'employer', employerType: { $in: ['company', 'consultancy'] } },
          { userType: { $in: ['company', 'consultancy'] } }
        ]
      });
      console.log(`📊 Total employers in database (all): ${allEmployers}`);
    }

    // Format companies data
    const formattedCompanies = await Promise.all(companies.map(async (company) => {
      // Determine employer type - handle both old and new formats
      const employerType = company.employerType || 
                         (company.userType === 'company' ? 'company' : 
                          company.userType === 'consultancy' ? 'consultancy' : null);
      
      // Get company data from profile.company or fallback to company field
      const companyData = company.profile?.company || company.company || {};
      
      // Get job count for this company/consultancy
      const jobCount = await Job.countDocuments({ 
        postedBy: company._id,
        status: 'active'
      });

      // Format location
      let location = '';
      if (companyData.location) {
        if (typeof companyData.location === 'object') {
          location = [
            companyData.location.city,
            companyData.location.state,
            companyData.location.country
          ].filter(Boolean).join(', ') || companyData.location.locality || '';
        } else {
          location = companyData.location;
        }
      }

      // Get company name - try multiple sources
      const companyName = companyData.name || 
                         company.companyName || 
                         company.consultancyName ||
                         `${company.firstName} ${company.lastName}`;

      return {
        _id: company._id,
        name: companyName,
        industry: companyData.industry || 'Technology',
        website: companyData.website || '',
        size: companyData.size || 'Not specified',
        description: companyData.description || 'Leading company in the industry',
        location: location || 'Multiple locations',
        companyType: companyData.companyType || (employerType === 'consultancy' ? 'Consultancy' : 'Company'),
        employeeCount: companyData.company?.employeeCount || companyData.consultancy?.teamSize || companyData.size || 'Not specified',
        establishedYear: companyData.establishedYear || companyData.consultancy?.establishedYear || companyData.company?.foundedYear || '',
        logo: companyData.logo || '',
        socialMediaProfile: companyData.socialMediaProfile || '',
        socialMediaLink: companyData.socialMediaLink || '',
        openPositions: jobCount,
        isEmployerVerified: company.isEmployerVerified,
        verificationStatus: company.verificationStatus,
        employerType: employerType,
        profile: {
          company: companyData
        }
      };
    }));

    res.json({
      success: true,
      companies: formattedCompanies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCompanies / parseInt(limit)),
        total: totalCompanies
      }
    });
  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching companies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/company/dashboard
// @desc    Get company dashboard data
// @access  Private (Company Employer)
router.get('/dashboard', auth, async (req, res) => {
  try {
    // STRICT VALIDATION: Explicitly reject admin, superadmin, jobseeker, and consultancy accounts
    if (req.user.userType === 'admin' || req.user.userType === 'superadmin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin accounts cannot access company dashboard. Please use admin login.' 
      });
    }

    if (req.user.userType === 'jobseeker') {
      return res.status(403).json({ 
        message: 'Access denied. Jobseeker accounts cannot access company dashboard.' 
      });
    }

    if (req.user.userType === 'employer' && req.user.employerType === 'consultancy') {
      return res.status(403).json({ 
        message: 'Access denied. Consultancy accounts cannot access company dashboard. Please use consultancy login.' 
      });
    }

    // Ensure user is a company employer
    if (req.user.userType !== 'employer' || req.user.employerType !== 'company') {
      return res.status(403).json({ 
        message: `Access denied. Company employers only. Your account type is: ${req.user.userType}${req.user.employerType ? ` (${req.user.employerType})` : ''}` 
      });
    }

    // Get company statistics
    const totalEmployees = await User.countDocuments({ 
      userType: 'employee', 
      'profile.company': req.user._id 
    });

    const activeJobs = await Job.countDocuments({ 
      postedBy: req.user._id, 
      status: 'active' 
    });

    const newApplications = await Application.countDocuments({ 
      employer: req.user._id, 
      status: 'applied',
      appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    const totalDepartments = req.user.profile?.company?.company?.departments?.length || 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalEmployees,
          activeJobs,
          newApplications,
          totalDepartments
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/company/employees
// @desc    Get company employees
// @access  Private (Company Employer)
router.get('/employees', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'employer' || req.user.employerType !== 'company') {
      return res.status(403).json({ message: 'Access denied. Company employers only.' });
    }

    const employees = await User.find({ 
      userType: 'employee', 
      'profile.company': req.user._id 
    }).select('-password');

    res.json({
      success: true,
      employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/company/employees
// @desc    Add new employee
// @access  Private (Company Employer)
router.post('/employees', [
  auth,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('position').notEmpty().withMessage('Position is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (req.user.userType !== 'employer' || req.user.employerType !== 'company') {
      return res.status(403).json({ message: 'Access denied. Company employers only.' });
    }

    const { firstName, lastName, email, phone, position, department, salary } = req.body;

    // Check if employee already exists
    const existingEmployee = await User.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    const employee = new User({
      firstName,
      lastName,
      email,
      phone,
      password: 'temp123', // Temporary password, should be changed on first login
      userType: 'employee',
      profile: {
        company: req.user._id,
        position,
        department,
        salary: salary ? parseInt(salary) : undefined,
        joinDate: new Date()
      }
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee added successfully',
      employee: employee.toObject({ getters: true })
    });
  } catch (error) {
    console.error('Add employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/company/employees/:id
// @desc    Get single employee
// @access  Private (Company Employer)
router.get('/employees/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'employer' || req.user.employerType !== 'company') {
      return res.status(403).json({ message: 'Access denied. Company employers only.' });
    }

    const employee = await User.findOne({ 
      _id: req.params.id, 
      userType: 'employee',
      'profile.company': req.user._id 
    }).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/company/employees/:id
// @desc    Delete employee
// @access  Private (Company Employer)
router.delete('/employees/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'employer' || req.user.employerType !== 'company') {
      return res.status(403).json({ message: 'Access denied. Company employers only.' });
    }

    const employee = await User.findOneAndDelete({ 
      _id: req.params.id, 
      userType: 'employee',
      'profile.company': req.user._id 
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/company/applications
// @desc    Get company applications
// @access  Private (Company Employer)
router.get('/applications', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'employer' || req.user.employerType !== 'company') {
      return res.status(403).json({ message: 'Access denied. Company employers only.' });
    }

    const applications = await Application.find({ employer: req.user._id })
      .populate('user', 'firstName lastName email phone userId')
      .populate('job', 'title company location salary type employmentType jobType createdAt')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications: applications.map(app => ({
        id: app._id,
        _id: app._id,
        user: app.user,
        job: app.job,
        status: app.status || 'pending',
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
        fullName: app.fullName,
        email: app.email,
        mobileNumber: app.mobileNumber,
        currentJobTitle: app.currentJobTitle,
        experienceLevel: app.experienceLevel,
        keySkills: app.keySkills,
        jobProfileDescription: app.jobProfileDescription,
        educationLevel: app.educationLevel,
        course: app.course,
        currentLocation: app.currentLocation,
        noticePeriod: app.noticePeriod,
        yearsOfExperience: app.yearsOfExperience,
        currentSalary: app.currentSalary
      }))
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/company/departments
// @desc    Get company departments
// @access  Private (Company Employer)
router.get('/departments', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'employer' || req.user.employerType !== 'company') {
      return res.status(403).json({ message: 'Access denied. Company employers only.' });
    }

    const departments = req.user.profile?.company?.company?.departments || [];
    
    // Convert departments array to objects with additional info
    const departmentObjects = departments.map((dept, index) => ({
      _id: `dept_${index}`,
      name: dept,
      description: '',
      head: '',
      employeeCount: 0
    }));

    res.json({
      success: true,
      departments: departmentObjects
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/company/departments
// @desc    Add new department
// @access  Private (Company Employer)
router.post('/departments', [
  auth,
  body('name').notEmpty().withMessage('Department name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (req.user.userType !== 'employer' || req.user.employerType !== 'company') {
      return res.status(403).json({ message: 'Access denied. Company employers only.' });
    }

    const { name, description, head } = req.body;

    // Add department to user's profile
    if (!req.user.profile) {
      req.user.profile = {};
    }
    if (!req.user.profile.company) {
      req.user.profile.company = {};
    }
    if (!req.user.profile.company.company) {
      req.user.profile.company.company = {};
    }
    if (!req.user.profile.company.company.departments) {
      req.user.profile.company.company.departments = [];
    }

    req.user.profile.company.company.departments.push(name);
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Department added successfully',
      department: {
        _id: `dept_${req.user.profile.company.company.departments.length - 1}`,
        name,
        description,
        head,
        employeeCount: 0
      }
    });
  } catch (error) {
    console.error('Add department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/company/departments/:id
// @desc    Delete department
// @access  Private (Company Employer)
router.delete('/departments/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'employer' || req.user.employerType !== 'company') {
      return res.status(403).json({ message: 'Access denied. Company employers only.' });
    }

    const departmentIndex = parseInt(req.params.id.replace('dept_', ''));
    
    if (!req.user.profile?.company?.company?.departments || 
        departmentIndex >= req.user.profile.company.company.departments.length) {
      return res.status(404).json({ message: 'Department not found' });
    }

    req.user.profile.company.company.departments.splice(departmentIndex, 1);
    await req.user.save();

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
