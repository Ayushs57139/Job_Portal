const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Blog = require('../models/Blog');
const UserProfile = require('../models/UserProfile');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to generate CSV content
const generateCSVContent = (data, headers) => {
  const csvContent = [];
  
  // Add headers
  csvContent.push(headers.map(h => h.id).join(','));
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      let value = item[header.id];
      
      // Handle nested objects
      if (header.id.includes('.')) {
        const keys = header.id.split('.');
        value = keys.reduce((obj, key) => obj && obj[key], item);
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        value = value.join('; ');
      }
      
      // Handle dates
      if (value instanceof Date) {
        value = value.toISOString().split('T')[0];
      }
      
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value || '';
    });
    csvContent.push(row.join(','));
  });
  
  return csvContent.join('\n');
};

// Helper function to parse CSV file
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Export Users to CSV
router.get('/export/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    const headers = [
      { id: 'firstName', title: 'First Name' },
      { id: 'lastName', title: 'Last Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'userType', title: 'User Type' },
      { id: 'employerType', title: 'Employer Type' },
      { id: 'profile.bio', title: 'Bio' },
      { id: 'profile.skills', title: 'Skills' },
      { id: 'profile.experience', title: 'Experience' },
      { id: 'profile.currentLocation', title: 'Current Location' },
      { id: 'profile.currentSalary', title: 'Current Salary' },
      { id: 'profile.expectedSalary', title: 'Expected Salary' },
      { id: 'isActive', title: 'Is Active' },
      { id: 'isEmailVerified', title: 'Email Verified' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'lastLogin', title: 'Last Login' }
    ];
    
    const csvContent = generateCSVContent(users, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ message: 'Failed to export users', error: error.message });
  }
});

// Export Jobs to CSV (All Fields)
router.get('/export/jobs', adminAuth, async (req, res) => {
  try {
    const jobs = await Job.find({}).populate('postedBy', 'firstName lastName email');
    
    const headers = [
      // Company Information
      { id: 'company.name', title: 'Company Name' },
      { id: 'company.type', title: 'Company Type' },
      { id: 'company.totalEmployees', title: 'Total Employees' },
      { id: 'company.website', title: 'Company Website' },
      { id: 'company.industry', title: 'Company Industry' },
      
      // Job Details
      { id: 'title', title: 'Job Title' },
      { id: 'description', title: 'Job Description' },
      { id: 'keySkills', title: 'Key Skills (semicolon separated)' },
      { id: 'jobPostType', title: 'Job Post Type' },
      { id: 'employmentType', title: 'Employment Type' },
      { id: 'jobType', title: 'Job Type' },
      { id: 'jobModeType', title: 'Job Mode Type' },
      { id: 'jobShiftType', title: 'Job Shift Type' },
      
      // Location
      { id: 'location.state', title: 'State' },
      { id: 'location.city', title: 'City' },
      { id: 'location.locality', title: 'Locality' },
      { id: 'location.distanceFromLocation', title: 'Distance From Location' },
      { id: 'location.includeWillingToRelocate', title: 'Include Willing To Relocate' },
      
      // Experience & Salary
      { id: 'experienceLevel', title: 'Experience Level' },
      { id: 'totalExperience.min', title: 'Min Experience' },
      { id: 'totalExperience.max', title: 'Max Experience' },
      { id: 'salary.min', title: 'Min Salary' },
      { id: 'salary.max', title: 'Max Salary' },
      { id: 'salary.currency', title: 'Currency' },
      { id: 'salary.hideFromCandidates', title: 'Hide Salary From Candidates' },
      { id: 'additionalBenefits', title: 'Additional Benefits (semicolon separated)' },
      
      // Candidate Requirements
      { id: 'gender', title: 'Gender (semicolon separated)' },
      { id: 'maritalStatus', title: 'Marital Status (semicolon separated)' },
      { id: 'minimumAge', title: 'Minimum Age' },
      { id: 'maximumAge', title: 'Maximum Age' },
      { id: 'educationLevel', title: 'Education Level (semicolon separated)' },
      { id: 'course', title: 'Course (semicolon separated)' },
      { id: 'specialization', title: 'Specialization (semicolon separated)' },
      { id: 'candidateIndustry', title: 'Candidate Industry (semicolon separated)' },
      { id: 'industry', title: 'Industry (semicolon separated)' },
      { id: 'department', title: 'Department (semicolon separated)' },
      { id: 'jobRole', title: 'Job Role (semicolon separated)' },
      
      // Language Requirements
      { id: 'preferredLanguage', title: 'Preferred Language (semicolon separated)' },
      { id: 'englishLevel', title: 'English Level' },
      
      // Assets & Documents
      { id: 'assetsRequired', title: 'Assets Required (semicolon separated)' },
      { id: 'documentsRequired', title: 'Documents Required (semicolon separated)' },
      
      // Diversity & Inclusion
      { id: 'diversityHiring', title: 'Diversity Hiring (semicolon separated)' },
      { id: 'disabilityStatus', title: 'Disability Status (semicolon separated)' },
      { id: 'disabilities', title: 'Disabilities (semicolon separated)' },
      
      // Job Settings
      { id: 'numberOfVacancy', title: 'Number of Vacancies' },
      { id: 'joiningPeriod', title: 'Joining Period' },
      { id: 'interviewDetails', title: 'Interview Details' },
      { id: 'interviewMode', title: 'Interview Mode' },
      { id: 'walkinInterviewDetails', title: 'Walk-in Interview Details' },
      
      // Communication
      { id: 'hrContact.name', title: 'HR Contact Name' },
      { id: 'hrContact.number', title: 'HR Contact Number' },
      { id: 'hrContact.email', title: 'HR Contact Email' },
      { id: 'hrContact.days', title: 'HR Available Days (semicolon separated)' },
      { id: 'hrContact.timeFrom', title: 'HR Available From Time' },
      { id: 'hrContact.timeTo', title: 'HR Available To Time' },
      { id: 'jobResponseMethods', title: 'Job Response Methods (semicolon separated)' },
      { id: 'communicationPreference', title: 'Communication Preference (semicolon separated)' },
      
      // Questions
      { id: 'questionsForCandidates', title: 'Questions For Candidates' },
      
      // Collaboration
      { id: 'collaborateWithOtherUsers', title: 'Collaborate With Other Users (semicolon separated)' },
      
      // Status
      { id: 'status', title: 'Status' },
      { id: 'featured', title: 'Featured' },
      { id: 'createdAt', title: 'Created At' }
    ];
    
    const csvContent = generateCSVContent(jobs, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export jobs error:', error);
    res.status(500).json({ message: 'Failed to export jobs', error: error.message });
  }
});

// Export Applications to CSV
router.get('/export/applications', adminAuth, async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('user', 'firstName lastName email')
      .populate('job', 'title company');
    
    const headers = [
      { id: 'fullName', title: 'Full Name' },
      { id: 'email', title: 'Email' },
      { id: 'mobileNumber', title: 'Mobile Number' },
      { id: 'whatsappNumber', title: 'WhatsApp Number' },
      { id: 'gender', title: 'Gender' },
      { id: 'maritalStatus', title: 'Marital Status' },
      { id: 'dateOfBirth', title: 'Date of Birth' },
      { id: 'currentJobTitle', title: 'Current Job Title' },
      { id: 'currentCompanyName', title: 'Current Company' },
      { id: 'currentSalary', title: 'Current Salary' },
      { id: 'expectedSalary', title: 'Expected Salary' },
      { id: 'jobType', title: 'Job Type' },
      { id: 'jobStatus', title: 'Job Status' },
      { id: 'totalExperience', title: 'Total Experience' },
      { id: 'noticePeriod', title: 'Notice Period' },
      { id: 'education', title: 'Education' },
      { id: 'course', title: 'Course' },
      { id: 'skills', title: 'Skills' },
      { id: 'currentState', title: 'Current State' },
      { id: 'currentCity', title: 'Current City' },
      { id: 'currentLocality', title: 'Current Locality' },
      { id: 'preferredLanguage', title: 'Preferred Language' },
      { id: 'englishFluency', title: 'English Fluency' },
      { id: 'companyType', title: 'Company Type' },
      { id: 'jobIndustry', title: 'Job Industry' },
      { id: 'department', title: 'Department' },
      { id: 'jobRole', title: 'Job Role' },
      { id: 'assetRequirements', title: 'Asset Requirements' },
      { id: 'resumeUrl', title: 'Resume URL' },
      { id: 'coverLetter', title: 'Cover Letter' },
      { id: 'status', title: 'Status' },
      { id: 'appliedAt', title: 'Applied At' }
    ];
    
    const csvContent = generateCSVContent(applications, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applications_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export applications error:', error);
    res.status(500).json({ message: 'Failed to export applications', error: error.message });
  }
});

// Export Blogs to CSV
router.get('/export/blogs', adminAuth, async (req, res) => {
  try {
    const blogs = await Blog.find({});
    
    const headers = [
      { id: 'title', title: 'Title' },
      { id: 'excerpt', title: 'Excerpt' },
      { id: 'content', title: 'Content' },
      { id: 'category', title: 'Category' },
      { id: 'author', title: 'Author' },
      { id: 'image', title: 'Image' },
      { id: 'imageUrl', title: 'Image URL' },
      { id: 'readTime', title: 'Read Time' },
      { id: 'tags', title: 'Tags' },
      { id: 'featured', title: 'Featured' },
      { id: 'published', title: 'Published' },
      { id: 'publishedAt', title: 'Published At' },
      { id: 'views', title: 'Views' },
      { id: 'likes', title: 'Likes' },
      { id: 'seoTitle', title: 'SEO Title' },
      { id: 'seoDescription', title: 'SEO Description' },
      { id: 'slug', title: 'Slug' },
      { id: 'createdAt', title: 'Created At' }
    ];
    
    const csvContent = generateCSVContent(blogs, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=blogs_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export blogs error:', error);
    res.status(500).json({ message: 'Failed to export blogs', error: error.message });
  }
});

// Generate Sample CSV Files
router.get('/sample/users', adminAuth, async (req, res) => {
  try {
    const sampleData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+91-9876543210',
        userType: 'jobseeker',
        employerType: '',
        'profile.bio': 'Experienced software developer with 5 years of experience',
        'profile.skills': 'JavaScript; React; Node.js; MongoDB',
        'profile.experience': 5,
        'profile.currentLocation': 'Mumbai, Maharashtra',
        'profile.currentSalary': 800000,
        'profile.expectedSalary': 1200000,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+91-9876543211',
        userType: 'employer',
        employerType: 'company',
        'profile.bio': 'HR Manager at Tech Solutions Inc',
        'profile.skills': 'Recruitment; HR Management; Team Building',
        'profile.experience': 8,
        'profile.currentLocation': 'Bangalore, Karnataka',
        'profile.currentSalary': 1500000,
        'profile.expectedSalary': 1800000,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2024-01-10',
        lastLogin: '2024-01-21'
      }
    ];
    
    const headers = [
      { id: 'firstName', title: 'First Name' },
      { id: 'lastName', title: 'Last Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'userType', title: 'User Type' },
      { id: 'employerType', title: 'Employer Type' },
      { id: 'profile.bio', title: 'Bio' },
      { id: 'profile.skills', title: 'Skills' },
      { id: 'profile.experience', title: 'Experience' },
      { id: 'profile.currentLocation', title: 'Current Location' },
      { id: 'profile.currentSalary', title: 'Current Salary' },
      { id: 'profile.expectedSalary', title: 'Expected Salary' },
      { id: 'isActive', title: 'Is Active' },
      { id: 'isEmailVerified', title: 'Email Verified' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'lastLogin', title: 'Last Login' }
    ];
    
    const csvContent = generateCSVContent(sampleData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_users.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Generate sample users error:', error);
    res.status(500).json({ message: 'Failed to generate sample users CSV', error: error.message });
  }
});

router.get('/sample/jobs', adminAuth, async (req, res) => {
  try {
    const sampleData = [
      {
        title: 'Senior Software Developer',
        description: 'We are looking for an experienced software developer to join our team',
        'company.name': 'Tech Solutions Inc',
        'company.totalEmployees': '201-500',
        'company.website': 'https://techsolutions.com',
        jobPostType: 'Java',
        employmentType: 'Permanent',
        jobModeType: 'Work From Office',
        jobShiftType: 'Day Shift',
        skills: 'Java; Spring Boot; MySQL; REST APIs',
        'location.state': 'Karnataka',
        'location.city': 'Bangalore',
        'location.locality': 'Electronic City',
        experienceType: 'Experienced',
        'totalExperience.min': '3 Years',
        'totalExperience.max': '7 Years',
        'salary.min': 800000,
        'salary.max': 1500000,
        'salary.currency': 'INR',
        numberOfVacancy: 3,
        'hrContact.name': 'Sarah Johnson',
        'hrContact.number': '+91-9876543212',
        'hrContact.email': 'hr@techsolutions.com',
        status: 'active',
        featured: true,
        createdAt: '2024-01-15'
      }
    ];
    
    const headers = [
      { id: 'title', title: 'Job Title' },
      { id: 'description', title: 'Description' },
      { id: 'company.name', title: 'Company Name' },
      { id: 'company.totalEmployees', title: 'Company Size' },
      { id: 'company.website', title: 'Company Website' },
      { id: 'jobPostType', title: 'Job Post Type' },
      { id: 'employmentType', title: 'Employment Type' },
      { id: 'jobModeType', title: 'Job Mode' },
      { id: 'jobShiftType', title: 'Job Shift' },
      { id: 'skills', title: 'Skills' },
      { id: 'location.state', title: 'State' },
      { id: 'location.city', title: 'City' },
      { id: 'location.locality', title: 'Locality' },
      { id: 'experienceType', title: 'Experience Type' },
      { id: 'totalExperience.min', title: 'Min Experience' },
      { id: 'totalExperience.max', title: 'Max Experience' },
      { id: 'salary.min', title: 'Min Salary' },
      { id: 'salary.max', title: 'Max Salary' },
      { id: 'salary.currency', title: 'Currency' },
      { id: 'numberOfVacancy', title: 'Number of Vacancies' },
      { id: 'hrContact.name', title: 'HR Contact Name' },
      { id: 'hrContact.number', title: 'HR Contact Number' },
      { id: 'hrContact.email', title: 'HR Contact Email' },
      { id: 'status', title: 'Status' },
      { id: 'featured', title: 'Featured' },
      { id: 'createdAt', title: 'Created At' }
    ];
    
    const csvContent = generateCSVContent(sampleData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_jobs.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Generate sample jobs error:', error);
    res.status(500).json({ message: 'Failed to generate sample jobs CSV', error: error.message });
  }
});

router.get('/sample/applications', adminAuth, async (req, res) => {
  try {
    const sampleData = [
      {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        mobileNumber: '+91-9876543210',
        whatsappNumber: '+91-9876543210',
        gender: 'Male',
        maritalStatus: 'Single',
        dateOfBirth: '1990-05-15',
        currentJobTitle: 'Software Developer',
        currentCompanyName: 'ABC Tech',
        currentSalary: 600000,
        expectedSalary: 800000,
        jobType: 'Permanent',
        jobStatus: 'Working',
        totalExperience: '3 Years',
        noticePeriod: '30 Days',
        education: 'Graduate',
        course: 'Computer Science',
        skills: 'JavaScript; React; Node.js; MongoDB',
        currentState: 'Maharashtra',
        currentCity: 'Mumbai',
        currentLocality: 'Andheri',
        preferredLanguage: 'English',
        englishFluency: 'Fluent English',
        companyType: 'Startup',
        jobIndustry: 'Information Technology',
        department: 'Engineering',
        jobRole: 'Software Developer',
        assetRequirements: 'Laptop; Android Smart Phone',
        resumeUrl: 'https://example.com/resume.pdf',
        coverLetter: 'I am very interested in this position and would like to contribute to your team',
        status: 'applied',
        appliedAt: '2024-01-20'
      }
    ];
    
    const headers = [
      { id: 'fullName', title: 'Full Name' },
      { id: 'email', title: 'Email' },
      { id: 'mobileNumber', title: 'Mobile Number' },
      { id: 'whatsappNumber', title: 'WhatsApp Number' },
      { id: 'gender', title: 'Gender' },
      { id: 'maritalStatus', title: 'Marital Status' },
      { id: 'dateOfBirth', title: 'Date of Birth' },
      { id: 'currentJobTitle', title: 'Current Job Title' },
      { id: 'currentCompanyName', title: 'Current Company' },
      { id: 'currentSalary', title: 'Current Salary' },
      { id: 'expectedSalary', title: 'Expected Salary' },
      { id: 'jobType', title: 'Job Type' },
      { id: 'jobStatus', title: 'Job Status' },
      { id: 'totalExperience', title: 'Total Experience' },
      { id: 'noticePeriod', title: 'Notice Period' },
      { id: 'education', title: 'Education' },
      { id: 'course', title: 'Course' },
      { id: 'skills', title: 'Skills' },
      { id: 'currentState', title: 'Current State' },
      { id: 'currentCity', title: 'Current City' },
      { id: 'currentLocality', title: 'Current Locality' },
      { id: 'preferredLanguage', title: 'Preferred Language' },
      { id: 'englishFluency', title: 'English Fluency' },
      { id: 'companyType', title: 'Company Type' },
      { id: 'jobIndustry', title: 'Job Industry' },
      { id: 'department', title: 'Department' },
      { id: 'jobRole', title: 'Job Role' },
      { id: 'assetRequirements', title: 'Asset Requirements' },
      { id: 'resumeUrl', title: 'Resume URL' },
      { id: 'coverLetter', title: 'Cover Letter' },
      { id: 'status', title: 'Status' },
      { id: 'appliedAt', title: 'Applied At' }
    ];
    
    const csvContent = generateCSVContent(sampleData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_applications.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Generate sample applications error:', error);
    res.status(500).json({ message: 'Failed to generate sample applications CSV', error: error.message });
  }
});

router.get('/sample/blogs', adminAuth, async (req, res) => {
  try {
    const sampleData = [
      {
        title: '10 Tips for Successful Job Interviews',
        excerpt: 'Learn the essential tips to ace your next job interview and land your dream job',
        content: 'Job interviews can be nerve-wracking, but with the right preparation, you can increase your chances of success...',
        category: 'Interview Prep',
        author: 'Admin',
        image: '💼',
        imageUrl: 'https://example.com/interview-tips.jpg',
        readTime: '5 min read',
        tags: 'interview; tips; career; job search',
        featured: true,
        published: true,
        publishedAt: '2024-01-15',
        views: 150,
        likes: 25,
        seoTitle: '10 Essential Job Interview Tips for Success',
        seoDescription: 'Master your job interviews with these proven tips and techniques',
        slug: '10-tips-successful-job-interviews',
        createdAt: '2024-01-15'
      }
    ];
    
    const headers = [
      { id: 'title', title: 'Title' },
      { id: 'excerpt', title: 'Excerpt' },
      { id: 'content', title: 'Content' },
      { id: 'category', title: 'Category' },
      { id: 'author', title: 'Author' },
      { id: 'image', title: 'Image' },
      { id: 'imageUrl', title: 'Image URL' },
      { id: 'readTime', title: 'Read Time' },
      { id: 'tags', title: 'Tags' },
      { id: 'featured', title: 'Featured' },
      { id: 'published', title: 'Published' },
      { id: 'publishedAt', title: 'Published At' },
      { id: 'views', title: 'Views' },
      { id: 'likes', title: 'Likes' },
      { id: 'seoTitle', title: 'SEO Title' },
      { id: 'seoDescription', title: 'SEO Description' },
      { id: 'slug', title: 'Slug' },
      { id: 'createdAt', title: 'Created At' }
    ];
    
    const csvContent = generateCSVContent(sampleData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_blogs.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Generate sample blogs error:', error);
    res.status(500).json({ message: 'Failed to generate sample blogs CSV', error: error.message });
  }
});

// Bulk Import Users
router.post('/import/users', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvData = await parseCSVFile(req.file.path);
    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: row.email });
        if (existingUser) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: User with email ${row.email} already exists`);
          continue;
        }

        // Create new user
        const userData = {
          firstName: row.firstName || row['First Name'],
          lastName: row.lastName || row['Last Name'],
          email: row.email || row['Email'],
          phone: row.phone || row['Phone'],
          userType: row.userType || row['User Type'] || 'jobseeker',
          employerType: row.employerType || row['Employer Type'],
          password: 'defaultPassword123', // Default password, should be changed
          isActive: row.isActive !== undefined ? row.isActive === 'true' : true,
          isEmailVerified: row.isEmailVerified !== undefined ? row.isEmailVerified === 'true' : false
        };

        // Handle profile data
        if (row['profile.bio'] || row['Bio']) {
          userData.profile = {
            bio: row['profile.bio'] || row['Bio'],
            skills: (row['profile.skills'] || row['Skills'] || '').split(';').map(s => s.trim()).filter(s => s),
            experience: parseInt(row['profile.experience'] || row['Experience']) || 0,
            currentLocation: row['profile.currentLocation'] || row['Current Location'],
            currentSalary: parseInt(row['profile.currentSalary'] || row['Current Salary']) || 0,
            expectedSalary: parseInt(row['profile.expectedSalary'] || row['Expected Salary']) || 0
          };
        }

        const user = new User(userData);
        await user.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import users error:', error);
    res.status(500).json({ message: 'Failed to import users', error: error.message });
  }
});

// Bulk Import Jobs (All Fields)
router.post('/import/jobs', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvData = await parseCSVFile(req.file.path);
    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    // Get the admin user from the request
    const adminUserId = req.user._id;

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        // Helper function to parse array fields (semicolon separated)
        const parseArrayField = (value) => {
          if (!value) return [];
          return value.split(';').map(s => s.trim()).filter(s => s);
        };
        
        // Helper function to parse boolean fields
        const parseBoolean = (value) => {
          return value === 'true' || value === 'TRUE' || value === '1' || value === 'yes' || value === 'YES';
        };

        // Create comprehensive job data with all fields
        const jobData = {
          // Company Information
          company: {
            name: row['Company Name'] || '',
            type: row['Company Type'] || '',
            totalEmployees: row['Total Employees'] || '',
            website: row['Company Website'] || '',
            industry: row['Company Industry'] || ''
          },
          
          // Job Details
          title: row['Job Title'] || '',
          description: row['Job Description'] || '',
          keySkills: parseArrayField(row['Key Skills (semicolon separated)']),
          jobPostType: row['Job Post Type'] || '',
          employmentType: row['Employment Type'] || '',
          jobType: row['Job Type'] || '',
          jobModeType: row['Job Mode Type'] || '',
          jobShiftType: row['Job Shift Type'] || '',
          
          // Location
          location: {
            state: row['State'] || '',
            city: row['City'] || '',
            locality: row['Locality'] || '',
            distanceFromLocation: row['Distance From Location'] || '',
            includeWillingToRelocate: parseBoolean(row['Include Willing To Relocate'])
          },
          
          // Experience & Salary
          experienceLevel: row['Experience Level'] || '',
          totalExperience: {
            min: row['Min Experience'] || '',
            max: row['Max Experience'] || ''
          },
          salary: {
            min: parseInt(row['Min Salary']) || 0,
            max: parseInt(row['Max Salary']) || 0,
            currency: row['Currency'] || 'INR',
            hideFromCandidates: parseBoolean(row['Hide Salary From Candidates'])
          },
          additionalBenefits: parseArrayField(row['Additional Benefits (semicolon separated)']),
          
          // Candidate Requirements
          gender: parseArrayField(row['Gender (semicolon separated)']),
          maritalStatus: parseArrayField(row['Marital Status (semicolon separated)']),
          minimumAge: parseInt(row['Minimum Age']) || undefined,
          maximumAge: parseInt(row['Maximum Age']) || undefined,
          educationLevel: parseArrayField(row['Education Level (semicolon separated)']),
          course: parseArrayField(row['Course (semicolon separated)']),
          specialization: parseArrayField(row['Specialization (semicolon separated)']),
          candidateIndustry: parseArrayField(row['Candidate Industry (semicolon separated)']),
          industry: parseArrayField(row['Industry (semicolon separated)']),
          department: parseArrayField(row['Department (semicolon separated)']),
          jobRole: parseArrayField(row['Job Role (semicolon separated)']),
          
          // Language Requirements
          preferredLanguage: parseArrayField(row['Preferred Language (semicolon separated)']),
          englishLevel: row['English Level'] || '',
          
          // Assets & Documents
          assetsRequired: parseArrayField(row['Assets Required (semicolon separated)']),
          documentsRequired: parseArrayField(row['Documents Required (semicolon separated)']),
          
          // Diversity & Inclusion
          diversityHiring: parseArrayField(row['Diversity Hiring (semicolon separated)']),
          disabilityStatus: parseArrayField(row['Disability Status (semicolon separated)']),
          disabilities: parseArrayField(row['Disabilities (semicolon separated)']),
          
          // Job Settings
          numberOfVacancy: parseInt(row['Number of Vacancies']) || 1,
          joiningPeriod: row['Joining Period'] || '',
          interviewDetails: row['Interview Details'] || '',
          interviewMode: row['Interview Mode'] || '',
          walkinInterviewDetails: row['Walk-in Interview Details'] || '',
          
          // Communication
          hrContact: {
            name: row['HR Contact Name'] || '',
            number: row['HR Contact Number'] || '',
            email: row['HR Contact Email'] || '',
            days: parseArrayField(row['HR Available Days (semicolon separated)']),
            timeFrom: row['HR Available From Time'] || '',
            timeTo: row['HR Available To Time'] || ''
          },
          jobResponseMethods: parseArrayField(row['Job Response Methods (semicolon separated)']),
          communicationPreference: parseArrayField(row['Communication Preference (semicolon separated)']),
          
          // Questions
          questionsForCandidates: row['Questions For Candidates'] || '',
          
          // Collaboration
          collaborateWithOtherUsers: parseArrayField(row['Collaborate With Other Users (semicolon separated)']),
          
          // Status
          status: row['Status'] || 'active',
          featured: parseBoolean(row['Featured']),
          postedBy: adminUserId
        };

        const job = new Job(jobData);
        await job.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import jobs error:', error);
    res.status(500).json({ message: 'Failed to import jobs', error: error.message });
  }
});

// Download Sample Job CSV Template
router.get('/sample/jobs', adminAuth, async (req, res) => {
  try {
    // Create sample data with all fields
    const sampleData = [
      {
        'Company Name': 'Example Company Ltd',
        'Company Type': 'Indian MNC',
        'Total Employees': '101-200',
        'Company Website': 'https://example.com',
        'Company Industry': 'Information Technology',
        'Job Title': 'Senior Software Engineer',
        'Job Description': 'We are looking for an experienced software engineer to join our team...',
        'Key Skills (semicolon separated)': 'JavaScript; React; Node.js; MongoDB',
        'Job Post Type': 'Sales',
        'Employment Type': 'Permanent',
        'Job Type': 'Full Time',
        'Job Mode Type': 'Hybrid',
        'Job Shift Type': 'Day Shift',
        'State': 'Maharashtra',
        'City': 'Mumbai',
        'Locality': 'Andheri East',
        'Distance From Location': '10 km',
        'Include Willing To Relocate': 'true',
        'Experience Level': 'Experienced',
        'Min Experience': '3 Years',
        'Max Experience': '5 Years',
        'Min Salary': '600000',
        'Max Salary': '1200000',
        'Currency': 'INR',
        'Hide Salary From Candidates': 'false',
        'Additional Benefits (semicolon separated)': 'Health Insurance; PF; ESIC; Annual Bonus',
        'Gender (semicolon separated)': 'Male; Female',
        'Marital Status (semicolon separated)': 'Married; Unmarried',
        'Minimum Age': '22',
        'Maximum Age': '35',
        'Education Level (semicolon separated)': 'Graduate; Post Graduate',
        'Course (semicolon separated)': 'B.Tech/B.E.; MCA',
        'Specialization (semicolon separated)': 'Computer Science; Information Technology',
        'Candidate Industry (semicolon separated)': 'IT/Software',
        'Industry (semicolon separated)': 'IT/Software',
        'Department (semicolon separated)': 'Software Development',
        'Job Role (semicolon separated)': 'Software Engineer',
        'Preferred Language (semicolon separated)': 'English; Hindi',
        'English Level': 'Fluent',
        'Assets Required (semicolon separated)': 'Laptop; Mobile Phone',
        'Documents Required (semicolon separated)': 'Aadhar Card; PAN Card; Educational Certificates',
        'Diversity Hiring (semicolon separated)': 'Open to all',
        'Disability Status (semicolon separated)': 'Open to Persons with Disabilities',
        'Disabilities (semicolon separated)': 'Hearing Impairment; Visual Impairment',
        'Number of Vacancies': '5',
        'Joining Period': 'Immediate',
        'Interview Details': 'Online interview followed by technical round',
        'Interview Mode': 'Online',
        'Walk-in Interview Details': '',
        'HR Contact Name': 'John Doe',
        'HR Contact Number': '+91-9876543210',
        'HR Contact Email': 'hr@example.com',
        'HR Available Days (semicolon separated)': 'Monday; Tuesday; Wednesday; Thursday; Friday',
        'HR Available From Time': '10:00',
        'HR Available To Time': '18:00',
        'Job Response Methods (semicolon separated)': 'Email; Phone Call',
        'Communication Preference (semicolon separated)': 'Email; WhatsApp',
        'Questions For Candidates': 'What is your notice period? What are your salary expectations?',
        'Collaborate With Other Users (semicolon separated)': '',
        'Status': 'active',
        'Featured': 'false'
      }
    ];

    const headers = [
      'Company Name', 'Company Type', 'Total Employees', 'Company Website', 'Company Industry',
      'Job Title', 'Job Description', 'Key Skills (semicolon separated)', 'Job Post Type',
      'Employment Type', 'Job Type', 'Job Mode Type', 'Job Shift Type',
      'State', 'City', 'Locality', 'Distance From Location', 'Include Willing To Relocate',
      'Experience Level', 'Min Experience', 'Max Experience',
      'Min Salary', 'Max Salary', 'Currency', 'Hide Salary From Candidates',
      'Additional Benefits (semicolon separated)',
      'Gender (semicolon separated)', 'Marital Status (semicolon separated)',
      'Minimum Age', 'Maximum Age',
      'Education Level (semicolon separated)', 'Course (semicolon separated)',
      'Specialization (semicolon separated)', 'Candidate Industry (semicolon separated)',
      'Industry (semicolon separated)', 'Department (semicolon separated)',
      'Job Role (semicolon separated)',
      'Preferred Language (semicolon separated)', 'English Level',
      'Assets Required (semicolon separated)', 'Documents Required (semicolon separated)',
      'Diversity Hiring (semicolon separated)', 'Disability Status (semicolon separated)',
      'Disabilities (semicolon separated)',
      'Number of Vacancies', 'Joining Period', 'Interview Details', 'Interview Mode',
      'Walk-in Interview Details',
      'HR Contact Name', 'HR Contact Number', 'HR Contact Email',
      'HR Available Days (semicolon separated)', 'HR Available From Time', 'HR Available To Time',
      'Job Response Methods (semicolon separated)', 'Communication Preference (semicolon separated)',
      'Questions For Candidates', 'Collaborate With Other Users (semicolon separated)',
      'Status', 'Featured'
    ];

    // Generate CSV content
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    sampleData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_jobs_import.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Download sample CSV error:', error);
    res.status(500).json({ message: 'Failed to generate sample CSV', error: error.message });
  }
});

// Bulk Import Applications
router.post('/import/applications', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvData = await parseCSVFile(req.file.path);
    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        // Find user by email
        const user = await User.findOne({ email: row.email || row['Email'] });
        if (!user) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: User with email ${row.email || row['Email']} not found`);
          continue;
        }

        // Find job by title (you might want to make this more specific)
        const job = await Job.findOne({ title: row.jobTitle || row['Job Title'] });
        if (!job) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Job with title ${row.jobTitle || row['Job Title']} not found`);
          continue;
        }

        // Check if application already exists
        const existingApplication = await Application.findOne({ user: user._id, job: job._id });
        if (existingApplication) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Application already exists for this user and job`);
          continue;
        }

        // Create application data
        const applicationData = {
          user: user._id,
          job: job._id,
          fullName: row.fullName || row['Full Name'],
          email: row.email || row['Email'],
          mobileNumber: row.mobileNumber || row['Mobile Number'],
          whatsappNumber: row.whatsappNumber || row['WhatsApp Number'],
          gender: row.gender || row['Gender'],
          maritalStatus: row.maritalStatus || row['Marital Status'],
          dateOfBirth: new Date(row.dateOfBirth || row['Date of Birth']),
          currentJobTitle: row.currentJobTitle || row['Current Job Title'],
          currentCompanyName: row.currentCompanyName || row['Current Company'],
          currentSalary: parseInt(row.currentSalary || row['Current Salary']) || 0,
          expectedSalary: parseInt(row.expectedSalary || row['Expected Salary']),
          jobType: row.jobType || row['Job Type'],
          jobStatus: row.jobStatus || row['Job Status'],
          totalExperience: row.totalExperience || row['Total Experience'],
          noticePeriod: row.noticePeriod || row['Notice Period'],
          education: row.education || row['Education'],
          course: row.course || row['Course'],
          skills: row.skills || row['Skills'],
          currentState: row.currentState || row['Current State'],
          currentCity: row.currentCity || row['Current City'],
          currentLocality: row.currentLocality || row['Current Locality'],
          preferredLanguage: row.preferredLanguage || row['Preferred Language'],
          englishFluency: row.englishFluency || row['English Fluency'],
          companyType: row.companyType || row['Company Type'],
          jobIndustry: row.jobIndustry || row['Job Industry'],
          department: row.department || row['Department'],
          jobRole: row.jobRole || row['Job Role'],
          assetRequirements: (row.assetRequirements || row['Asset Requirements'] || '').split(';').map(s => s.trim()).filter(s => s),
          resumeUrl: row.resumeUrl || row['Resume URL'],
          coverLetter: row.coverLetter || row['Cover Letter'],
          status: row.status || row['Status'] || 'applied',
          appliedAt: new Date(row.appliedAt || row['Applied At'] || Date.now())
        };

        const application = new Application(applicationData);
        await application.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import applications error:', error);
    res.status(500).json({ message: 'Failed to import applications', error: error.message });
  }
});

// Bulk Import Blogs
router.post('/import/blogs', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvData = await parseCSVFile(req.file.path);
    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        // Check if blog with same title already exists
        const existingBlog = await Blog.findOne({ title: row.title || row['Title'] });
        if (existingBlog) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Blog with title "${row.title || row['Title']}" already exists`);
          continue;
        }

        // Create blog data
        const blogData = {
          title: row.title || row['Title'],
          excerpt: row.excerpt || row['Excerpt'],
          content: row.content || row['Content'],
          category: row.category || row['Category'],
          author: row.author || row['Author'] || 'Admin',
          image: row.image || row['Image'] || '📚',
          imageUrl: row.imageUrl || row['Image URL'],
          readTime: row.readTime || row['Read Time'] || '5 min read',
          tags: (row.tags || row['Tags'] || '').split(';').map(s => s.trim()).filter(s => s),
          featured: row.featured === 'true' || row['Featured'] === 'true',
          published: row.published !== undefined ? row.published === 'true' : true,
          publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(),
          views: parseInt(row.views || row['Views']) || 0,
          likes: parseInt(row.likes || row['Likes']) || 0,
          seoTitle: row.seoTitle || row['SEO Title'],
          seoDescription: row.seoDescription || row['SEO Description']
        };

        const blog = new Blog(blogData);
        await blog.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import blogs error:', error);
    res.status(500).json({ message: 'Failed to import blogs', error: error.message });
  }
});

// Resume Management Routes

// Get all resumes with pagination and filtering
router.get('/resumes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Search filter
    if (req.query.search) {
      filter.$or = [
        { 'personalInfo.fullName': { $regex: req.query.search, $options: 'i' } },
        { 'personalInfo.email': { $regex: req.query.search, $options: 'i' } },
        { 'professional.skills': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (req.query.status) {
      if (req.query.status === 'complete') {
        filter['profileStatus.isComplete'] = true;
      } else if (req.query.status === 'incomplete') {
        filter['profileStatus.isComplete'] = false;
      } else if (req.query.status === 'verified') {
        filter['profileStatus.isVerified'] = true;
      } else if (req.query.status === 'unverified') {
        filter['profileStatus.isVerified'] = false;
      }
    }
    
    // Experience filter
    if (req.query.experience) {
      const experience = req.query.experience;
      if (experience === 'fresher') {
        filter['professional.experience'] = { $regex: /fresher|0|no experience/i };
      } else if (experience === '0-2') {
        filter['professional.experience'] = { $regex: /0|1|2|fresher/i };
      } else if (experience === '2-5') {
        filter['professional.experience'] = { $regex: /2|3|4|5/i };
      } else if (experience === '5-10') {
        filter['professional.experience'] = { $regex: /5|6|7|8|9|10/i };
      } else if (experience === '10+') {
        filter['professional.experience'] = { $regex: /1[0-9]|[2-9][0-9]|\d{3,}/i };
      }
    }
    
    const profiles = await UserProfile.find(filter)
      .populate('userId', 'firstName lastName email userType')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await UserProfile.countDocuments(filter);
    
    // Get statistics
    const stats = await Promise.all([
      UserProfile.countDocuments(),
      UserProfile.countDocuments({ 'profileStatus.isComplete': true }),
      UserProfile.countDocuments({ 'profileStatus.isVerified': true }),
      UserProfile.countDocuments({ 
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      })
    ]);
    
    res.json({
      success: true,
      data: {
        profiles,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        },
        stats: {
          total: stats[0],
          complete: stats[1],
          verified: stats[2],
          recent: stats[3]
        }
      }
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch resumes', 
      error: error.message 
    });
  }
});

// Export all resumes to CSV
router.get('/export/resumes', async (req, res) => {
  try {
    const profiles = await UserProfile.find({})
      .populate('userId', 'firstName lastName email userType');
    
    const headers = [
      { id: 'personalInfo.fullName', title: 'Full Name' },
      { id: 'personalInfo.email', title: 'Email' },
      { id: 'personalInfo.phone', title: 'Phone' },
      { id: 'personalInfo.dateOfBirth', title: 'Date of Birth' },
      { id: 'personalInfo.gender', title: 'Gender' },
      { id: 'education.educationLevel', title: 'Education Level' },
      { id: 'education.degree', title: 'Degree' },
      { id: 'education.institution', title: 'Institution' },
      { id: 'education.specialization', title: 'Specialization' },
      { id: 'education.graduationYear', title: 'Graduation Year' },
      { id: 'education.cgpa', title: 'CGPA' },
      { id: 'professional.experience', title: 'Experience' },
      { id: 'professional.currentJobTitle', title: 'Current Job Title' },
      { id: 'professional.currentCompany', title: 'Current Company' },
      { id: 'professional.skills', title: 'Skills' },
      { id: 'professional.softSkills', title: 'Soft Skills' },
      { id: 'professional.languages', title: 'Languages' },
      { id: 'preferences.currentCity', title: 'Current City' },
      { id: 'preferences.preferredLocations', title: 'Preferred Locations' },
      { id: 'preferences.jobTypePreference', title: 'Job Type Preference' },
      { id: 'preferences.expectedSalary', title: 'Expected Salary' },
      { id: 'preferences.salaryCurrency', title: 'Salary Currency' },
      { id: 'preferences.workMode', title: 'Work Mode' },
      { id: 'preferences.noticePeriod', title: 'Notice Period' },
      { id: 'additionalInfo.resume', title: 'Resume URL' },
      { id: 'additionalInfo.linkedin', title: 'LinkedIn' },
      { id: 'additionalInfo.github', title: 'GitHub' },
      { id: 'additionalInfo.website', title: 'Website' },
      { id: 'additionalInfo.bio', title: 'Bio' },
      { id: 'profileStatus.isComplete', title: 'Profile Complete' },
      { id: 'profileStatus.completionPercentage', title: 'Completion Percentage' },
      { id: 'profileStatus.isVerified', title: 'Profile Verified' },
      { id: 'profileStatus.isActive', title: 'Profile Active' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'updatedAt', title: 'Last Updated' }
    ];
    
    const csvContent = generateCSVContent(profiles, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=resumes_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export resumes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export resumes', 
      error: error.message 
    });
  }
});

// Export selected resumes to CSV
router.post('/export/resumes/selected', async (req, res) => {
  try {
    const { profileIds } = req.body;
    
    if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No profile IDs provided' 
      });
    }
    
    const profiles = await UserProfile.find({ _id: { $in: profileIds } })
      .populate('userId', 'firstName lastName email userType');
    
    const headers = [
      { id: 'personalInfo.fullName', title: 'Full Name' },
      { id: 'personalInfo.email', title: 'Email' },
      { id: 'personalInfo.phone', title: 'Phone' },
      { id: 'personalInfo.dateOfBirth', title: 'Date of Birth' },
      { id: 'personalInfo.gender', title: 'Gender' },
      { id: 'education.educationLevel', title: 'Education Level' },
      { id: 'education.degree', title: 'Degree' },
      { id: 'education.institution', title: 'Institution' },
      { id: 'education.specialization', title: 'Specialization' },
      { id: 'education.graduationYear', title: 'Graduation Year' },
      { id: 'education.cgpa', title: 'CGPA' },
      { id: 'professional.experience', title: 'Experience' },
      { id: 'professional.currentJobTitle', title: 'Current Job Title' },
      { id: 'professional.currentCompany', title: 'Current Company' },
      { id: 'professional.skills', title: 'Skills' },
      { id: 'professional.softSkills', title: 'Soft Skills' },
      { id: 'professional.languages', title: 'Languages' },
      { id: 'preferences.currentCity', title: 'Current City' },
      { id: 'preferences.preferredLocations', title: 'Preferred Locations' },
      { id: 'preferences.jobTypePreference', title: 'Job Type Preference' },
      { id: 'preferences.expectedSalary', title: 'Expected Salary' },
      { id: 'preferences.salaryCurrency', title: 'Salary Currency' },
      { id: 'preferences.workMode', title: 'Work Mode' },
      { id: 'preferences.noticePeriod', title: 'Notice Period' },
      { id: 'additionalInfo.resume', title: 'Resume URL' },
      { id: 'additionalInfo.linkedin', title: 'LinkedIn' },
      { id: 'additionalInfo.github', title: 'GitHub' },
      { id: 'additionalInfo.website', title: 'Website' },
      { id: 'additionalInfo.bio', title: 'Bio' },
      { id: 'profileStatus.isComplete', title: 'Profile Complete' },
      { id: 'profileStatus.completionPercentage', title: 'Completion Percentage' },
      { id: 'profileStatus.isVerified', title: 'Profile Verified' },
      { id: 'profileStatus.isActive', title: 'Profile Active' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'updatedAt', title: 'Last Updated' }
    ];
    
    const csvContent = generateCSVContent(profiles, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=selected_resumes_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export selected resumes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export selected resumes', 
      error: error.message 
    });
  }
});

// Generate sample resume CSV
router.get('/sample/resumes', async (req, res) => {
  try {
    const sampleData = [
      {
        'personalInfo.fullName': 'John Doe',
        'personalInfo.email': 'john.doe@example.com',
        'personalInfo.phone': '+91-9876543210',
        'personalInfo.dateOfBirth': '1990-05-15',
        'personalInfo.gender': 'male',
        'education.educationLevel': 'bachelor',
        'education.degree': 'Bachelor of Technology',
        'education.institution': 'Indian Institute of Technology',
        'education.specialization': 'Computer Science',
        'education.graduationYear': 2012,
        'education.cgpa': 8.5,
        'professional.experience': '5 years',
        'professional.currentJobTitle': 'Senior Software Developer',
        'professional.currentCompany': 'Tech Solutions Inc',
        'professional.skills': 'JavaScript; React; Node.js; MongoDB; Python',
        'professional.softSkills': 'Leadership; Communication; Problem Solving',
        'professional.languages': 'English; Hindi',
        'preferences.currentCity': 'Mumbai',
        'preferences.preferredLocations': 'Mumbai; Bangalore; Pune',
        'preferences.jobTypePreference': 'fulltime',
        'preferences.expectedSalary': 1200000,
        'preferences.salaryCurrency': 'INR',
        'preferences.workMode': 'hybrid',
        'preferences.noticePeriod': '30 days',
        'additionalInfo.resume': 'https://example.com/resume.pdf',
        'additionalInfo.linkedin': 'https://linkedin.com/in/johndoe',
        'additionalInfo.github': 'https://github.com/johndoe',
        'additionalInfo.website': 'https://johndoe.dev',
        'additionalInfo.bio': 'Experienced software developer with 5 years of experience in web development',
        'profileStatus.isComplete': true,
        'profileStatus.completionPercentage': 95,
        'profileStatus.isVerified': true,
        'profileStatus.isActive': true,
        'createdAt': '2024-01-15',
        'updatedAt': '2024-01-20'
      }
    ];
    
    const headers = [
      { id: 'personalInfo.fullName', title: 'Full Name' },
      { id: 'personalInfo.email', title: 'Email' },
      { id: 'personalInfo.phone', title: 'Phone' },
      { id: 'personalInfo.dateOfBirth', title: 'Date of Birth' },
      { id: 'personalInfo.gender', title: 'Gender' },
      { id: 'education.educationLevel', title: 'Education Level' },
      { id: 'education.degree', title: 'Degree' },
      { id: 'education.institution', title: 'Institution' },
      { id: 'education.specialization', title: 'Specialization' },
      { id: 'education.graduationYear', title: 'Graduation Year' },
      { id: 'education.cgpa', title: 'CGPA' },
      { id: 'professional.experience', title: 'Experience' },
      { id: 'professional.currentJobTitle', title: 'Current Job Title' },
      { id: 'professional.currentCompany', title: 'Current Company' },
      { id: 'professional.skills', title: 'Skills' },
      { id: 'professional.softSkills', title: 'Soft Skills' },
      { id: 'professional.languages', title: 'Languages' },
      { id: 'preferences.currentCity', title: 'Current City' },
      { id: 'preferences.preferredLocations', title: 'Preferred Locations' },
      { id: 'preferences.jobTypePreference', title: 'Job Type Preference' },
      { id: 'preferences.expectedSalary', title: 'Expected Salary' },
      { id: 'preferences.salaryCurrency', title: 'Salary Currency' },
      { id: 'preferences.workMode', title: 'Work Mode' },
      { id: 'preferences.noticePeriod', title: 'Notice Period' },
      { id: 'additionalInfo.resume', title: 'Resume URL' },
      { id: 'additionalInfo.linkedin', title: 'LinkedIn' },
      { id: 'additionalInfo.github', title: 'GitHub' },
      { id: 'additionalInfo.website', title: 'Website' },
      { id: 'additionalInfo.bio', title: 'Bio' },
      { id: 'profileStatus.isComplete', title: 'Profile Complete' },
      { id: 'profileStatus.completionPercentage', title: 'Completion Percentage' },
      { id: 'profileStatus.isVerified', title: 'Profile Verified' },
      { id: 'profileStatus.isActive', title: 'Profile Active' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'updatedAt', title: 'Last Updated' }
    ];
    
    const csvContent = generateCSVContent(sampleData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_resumes.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Generate sample resumes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate sample resumes CSV', 
      error: error.message 
    });
  }
});

// Bulk import resumes from CSV
router.post('/import/resumes', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const csvData = await parseCSVFile(req.file.path);
    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        // Find user by email
        const user = await User.findOne({ 
          email: row['personalInfo.email'] || row['Email'] 
        });
        
        if (!user) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: User with email ${row['personalInfo.email'] || row['Email']} not found`);
          continue;
        }

        // Check if profile already exists
        const existingProfile = await UserProfile.findOne({ userId: user._id });
        if (existingProfile) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Profile already exists for user ${user.email}`);
          continue;
        }

        // Create profile data
        const profileData = {
          userId: user._id,
          personalInfo: {
            fullName: row['personalInfo.fullName'] || row['Full Name'],
            email: row['personalInfo.email'] || row['Email'],
            phone: row['personalInfo.phone'] || row['Phone'],
            dateOfBirth: row['personalInfo.dateOfBirth'] || row['Date of Birth'] ? 
              new Date(row['personalInfo.dateOfBirth'] || row['Date of Birth']) : undefined,
            gender: row['personalInfo.gender'] || row['Gender']
          },
          education: {
            educationLevel: row['education.educationLevel'] || row['Education Level'],
            degree: row['education.degree'] || row['Degree'],
            institution: row['education.institution'] || row['Institution'],
            specialization: row['education.specialization'] || row['Specialization'],
            graduationYear: parseInt(row['education.graduationYear'] || row['Graduation Year']),
            cgpa: parseFloat(row['education.cgpa'] || row['CGPA'])
          },
          professional: {
            experience: row['professional.experience'] || row['Experience'],
            currentJobTitle: row['professional.currentJobTitle'] || row['Current Job Title'],
            currentCompany: row['professional.currentCompany'] || row['Current Company'],
            skills: (row['professional.skills'] || row['Skills'] || '').split(';').map(s => s.trim()).filter(s => s),
            softSkills: (row['professional.softSkills'] || row['Soft Skills'] || '').split(';').map(s => s.trim()).filter(s => s),
            languages: (row['professional.languages'] || row['Languages'] || '').split(';').map(s => s.trim()).filter(s => s)
          },
          preferences: {
            currentCity: row['preferences.currentCity'] || row['Current City'],
            preferredLocations: (row['preferences.preferredLocations'] || row['Preferred Locations'] || '').split(';').map(s => s.trim()).filter(s => s),
            jobTypePreference: row['preferences.jobTypePreference'] || row['Job Type Preference'],
            expectedSalary: parseInt(row['preferences.expectedSalary'] || row['Expected Salary']),
            salaryCurrency: row['preferences.salaryCurrency'] || row['Salary Currency'] || 'INR',
            workMode: row['preferences.workMode'] || row['Work Mode'],
            noticePeriod: row['preferences.noticePeriod'] || row['Notice Period']
          },
          additionalInfo: {
            resume: row['additionalInfo.resume'] || row['Resume URL'],
            linkedin: row['additionalInfo.linkedin'] || row['LinkedIn'],
            github: row['additionalInfo.github'] || row['GitHub'],
            website: row['additionalInfo.website'] || row['Website'],
            bio: row['additionalInfo.bio'] || row['Bio']
          },
          profileStatus: {
            isComplete: row['profileStatus.isComplete'] === 'true' || row['Profile Complete'] === 'true',
            isVerified: row['profileStatus.isVerified'] === 'true' || row['Profile Verified'] === 'true',
            isActive: row['profileStatus.isActive'] !== undefined ? 
              row['profileStatus.isActive'] === 'true' : 
              (row['Profile Active'] !== undefined ? row['Profile Active'] === 'true' : true)
          }
        };

        const profile = new UserProfile(profileData);
        await profile.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import resumes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to import resumes', 
      error: error.message 
    });
  }
});

module.exports = router;
