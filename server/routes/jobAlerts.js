const express = require('express');
const router = express.Router();
const JobAlert = require('../models/JobAlert');
const auth = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/job-alerts');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
        }
    }
});

// @route   POST /api/job-alerts
// @desc    Create a new job alert
// @access  Public (can be used by anonymous users)
router.post('/', upload.single('resumeFile'), async (req, res) => {
    try {
        const {
            jobTitle,
            expectedSalary,
            presentJobStatus,
            experienceLevel,
            totalExperience,
            workOfficeLocation,
            industry,
            subIndustry,
            department,
            jobRoles,
            keySkills,
            email,
            mobile,
            alertName
        } = req.body;

        // Validate required fields
        const requiredFields = {
            jobTitle,
            expectedSalary,
            presentJobStatus,
            experienceLevel,
            totalExperience,
            workOfficeLocation,
            industry,
            subIndustry,
            department,
            email,
            mobile,
            alertName
        };

        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value || (typeof value === 'string' && !value.trim())) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        // Parse arrays
        let parsedJobRoles = [];
        let parsedKeySkills = [];

        try {
            parsedJobRoles = typeof jobRoles === 'string' ? JSON.parse(jobRoles) : jobRoles;
            parsedKeySkills = typeof keySkills === 'string' ? JSON.parse(keySkills) : keySkills;
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job roles or key skills format'
            });
        }

        // Validate arrays
        if (!Array.isArray(parsedJobRoles) || parsedJobRoles.length === 0 || parsedJobRoles.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Job roles must be an array with 1-5 items'
            });
        }

        if (!Array.isArray(parsedKeySkills) || parsedKeySkills.length === 0 || parsedKeySkills.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Key skills must be an array with 1-10 items'
            });
        }

        // Get user ID if authenticated
        let userId = null;
        if (req.user) {
            userId = req.user.id;
        }

        // Create job alert
        const jobAlertData = {
            jobTitle: jobTitle.trim(),
            expectedSalary: parseInt(expectedSalary),
            presentJobStatus,
            experienceLevel,
            totalExperience,
            workOfficeLocation: workOfficeLocation.trim(),
            industry: industry.trim(),
            subIndustry: subIndustry.trim(),
            department: department.trim(),
            jobRoles: parsedJobRoles,
            keySkills: parsedKeySkills,
            email: email.toLowerCase().trim(),
            mobile: mobile.trim(),
            alertName: alertName.trim(),
            userId
        };

        // Add resume file path if uploaded
        if (req.file) {
            jobAlertData.resumeFile = req.file.path;
        }

        const jobAlert = new JobAlert(jobAlertData);
        await jobAlert.save();

        res.status(201).json({
            success: true,
            message: 'Job alert created successfully',
            data: {
                id: jobAlert._id,
                alertName: jobAlert.alertName,
                email: jobAlert.email
            }
        });

    } catch (error) {
        console.error('Error creating job alert:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating job alert'
        });
    }
});

// @route   GET /api/job-alerts/stats/summary
// @desc    Get job alerts statistics
// @access  Admin only
router.get('/stats/summary', adminAuth, async (req, res) => {
    try {
        const totalAlerts = await JobAlert.countDocuments();
        const activeAlerts = await JobAlert.countDocuments({ isActive: true });
        const inactiveAlerts = await JobAlert.countDocuments({ isActive: false });
        const alertsWithUsers = await JobAlert.countDocuments({ userId: { $ne: null } });
        const anonymousAlerts = await JobAlert.countDocuments({ userId: null });

        // Get top industries
        const topIndustries = await JobAlert.aggregate([
            { $group: { _id: '$industry', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Get top departments
        const topDepartments = await JobAlert.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Get alerts created in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentAlerts = await JobAlert.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            data: {
                total: totalAlerts,
                active: activeAlerts,
                inactive: inactiveAlerts,
                withUsers: alertsWithUsers,
                anonymous: anonymousAlerts,
                recent: recentAlerts,
                topIndustries,
                topDepartments
            }
        });

    } catch (error) {
        console.error('Error fetching job alerts statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics'
        });
    }
});

// @route   GET /api/job-alerts
// @desc    Get job alerts (with pagination and filters)
// @access  Admin only
router.get('/', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};
        
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }
        
        if (req.query.email) {
            filter.email = { $regex: req.query.email, $options: 'i' };
        }
        
        if (req.query.industry) {
            filter.industry = { $regex: req.query.industry, $options: 'i' };
        }
        
        if (req.query.department) {
            filter.department = { $regex: req.query.department, $options: 'i' };
        }

        // Build sort object
        const sort = {};
        if (req.query.sortBy) {
            const sortField = req.query.sortBy;
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
            sort[sortField] = sortOrder;
        } else {
            sort.createdAt = -1; // Default sort by creation date
        }

        const jobAlerts = await JobAlert.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email userType')
            .lean();

        const total = await JobAlert.countDocuments(filter);

        res.json({
            success: true,
            data: jobAlerts,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Error fetching job alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching job alerts'
        });
    }
});

// @route   GET /api/job-alerts/:id
// @desc    Get a specific job alert
// @access  Admin only
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const jobAlert = await JobAlert.findById(req.params.id)
            .populate('userId', 'name email userType');

        if (!jobAlert) {
            return res.status(404).json({
                success: false,
                message: 'Job alert not found'
            });
        }

        res.json({
            success: true,
            data: jobAlert
        });

    } catch (error) {
        console.error('Error fetching job alert:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching job alert'
        });
    }
});

// @route   PUT /api/job-alerts/:id
// @desc    Update a job alert
// @access  Admin only
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const updates = req.body;
        
        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.createdAt;
        delete updates.updatedAt;

        const jobAlert = await JobAlert.findByIdAndUpdate(
            req.params.id,
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!jobAlert) {
            return res.status(404).json({
                success: false,
                message: 'Job alert not found'
            });
        }

        res.json({
            success: true,
            message: 'Job alert updated successfully',
            data: jobAlert
        });

    } catch (error) {
        console.error('Error updating job alert:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating job alert'
        });
    }
});

// @route   DELETE /api/job-alerts/:id
// @desc    Delete a job alert
// @access  Admin only
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const jobAlert = await JobAlert.findByIdAndDelete(req.params.id);

        if (!jobAlert) {
            return res.status(404).json({
                success: false,
                message: 'Job alert not found'
            });
        }

        // Delete associated resume file if exists
        if (jobAlert.resumeFile && fs.existsSync(jobAlert.resumeFile)) {
            fs.unlinkSync(jobAlert.resumeFile);
        }

        res.json({
            success: true,
            message: 'Job alert deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting job alert:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting job alert'
        });
    }
});

// @route   POST /api/job-alerts/bulk-import
// @desc    Import job alerts from CSV file
// @access  Admin only
router.post('/bulk-import', adminAuth, upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'CSV file is required'
            });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        const jobAlerts = [];

        // Parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                try {
                    // Parse job roles and key skills from CSV
                    const jobRoles = row.jobRoles ? row.jobRoles.split(',').map(role => role.trim()) : [];
                    const keySkills = row.keySkills ? row.keySkills.split(',').map(skill => skill.trim()) : [];

                    const jobAlertData = {
                        jobTitle: row.jobTitle,
                        expectedSalary: parseInt(row.expectedSalary) || 0,
                        presentJobStatus: row.presentJobStatus,
                        experienceLevel: row.experienceLevel,
                        totalExperience: row.totalExperience,
                        workOfficeLocation: row.workOfficeLocation,
                        industry: row.industry,
                        subIndustry: row.subIndustry,
                        department: row.department,
                        jobRoles,
                        keySkills,
                        email: row.email,
                        mobile: row.mobile,
                        alertName: row.alertName,
                        isActive: row.isActive !== 'false'
                    };

                    jobAlerts.push(jobAlertData);
                } catch (error) {
                    results.failed++;
                    results.errors.push(`Row ${results.success + results.failed}: ${error.message}`);
                }
            })
            .on('end', async () => {
                try {
                    // Insert job alerts in bulk
                    if (jobAlerts.length > 0) {
                        await JobAlert.insertMany(jobAlerts, { ordered: false });
                        results.success = jobAlerts.length;
                    }

                    // Delete uploaded CSV file
                    fs.unlinkSync(req.file.path);

                    res.json({
                        success: true,
                        message: 'Bulk import completed',
                        results
                    });

                } catch (error) {
                    console.error('Error during bulk insert:', error);
                    
                    if (error.name === 'BulkWriteError') {
                        results.success = error.result.insertedCount;
                        results.failed = error.result.writeErrors.length;
                        results.errors = error.result.writeErrors.map(err => err.errmsg);
                    }

                    res.json({
                        success: true,
                        message: 'Bulk import completed with some errors',
                        results
                    });
                }
            })
            .on('error', (error) => {
                console.error('Error parsing CSV:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error parsing CSV file'
                });
            });

    } catch (error) {
        console.error('Error in bulk import:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during bulk import'
        });
    }
});

// @route   GET /api/job-alerts/export/csv
// @desc    Export job alerts to CSV
// @access  Admin only
router.get('/export/csv', adminAuth, async (req, res) => {
    try {
        const jobAlerts = await JobAlert.find({})
            .populate('userId', 'name email userType')
            .lean();

        if (jobAlerts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No job alerts found to export'
            });
        }

        // Prepare CSV data
        const csvData = jobAlerts.map(alert => ({
            'Job Title': alert.jobTitle,
            'Expected Salary': alert.expectedSalary,
            'Present Job Status': alert.presentJobStatus,
            'Experience Level': alert.experienceLevel,
            'Total Experience': alert.totalExperience,
            'Work Office Location': alert.workOfficeLocation,
            'Industry': alert.industry,
            'Sub Industry': alert.subIndustry,
            'Department': alert.department,
            'Job Roles': alert.jobRoles.join(', '),
            'Key Skills': alert.keySkills.join(', '),
            'Email': alert.email,
            'Mobile': alert.mobile,
            'Alert Name': alert.alertName,
            'User ID': alert.userId ? alert.userId._id : 'Anonymous',
            'User Name': alert.userId ? alert.userId.name : 'Anonymous',
            'User Type': alert.userId ? alert.userId.userType : 'Anonymous',
            'Is Active': alert.isActive,
            'Notification Count': alert.notificationCount,
            'Last Notified': alert.lastNotified || 'Never',
            'Created At': alert.createdAt,
            'Updated At': alert.updatedAt
        }));

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="job-alerts-${new Date().toISOString().split('T')[0]}.csv"`);

        // Create CSV writer
        const csvWriter = createCsvWriter({
            path: 'temp-export.csv',
            header: Object.keys(csvData[0]).map(key => ({ id: key, title: key }))
        });

        // Write CSV and stream to response
        await csvWriter.writeRecords(csvData);
        
        const csvContent = fs.readFileSync('temp-export.csv', 'utf8');
        res.send(csvContent);
        
        // Clean up temp file
        fs.unlinkSync('temp-export.csv');

    } catch (error) {
        console.error('Error exporting job alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while exporting job alerts'
        });
    }
});

// @route   POST /api/job-alerts/bulk-import-candidates
// @desc    Import job alerts from candidate data CSV (Bulk Candidates Addon)
// @access  Admin only
router.post('/bulk-import-candidates', adminAuth, upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'CSV file is required'
            });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [],
            skipped: 0
        };

        const jobAlerts = [];
        const User = require('../models/User');

        // Parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                try {
                    // Parse arrays from CSV
                    const jobRoles = row.jobRoles ? row.jobRoles.split(',').map(role => role.trim()).filter(r => r) : 
                                   (row.jobRole ? [row.jobRole.trim()] : []);
                    const keySkills = row.keySkills ? row.keySkills.split(',').map(skill => skill.trim()).filter(s => s) : 
                                     (row.skills ? row.skills.split(',').map(s => s.trim()).filter(s => s) : []);

                    // Validate required fields
                    if (!row.email || !row.mobile || !row.jobTitle) {
                        results.failed++;
                        results.errors.push(`Row ${results.success + results.failed + results.skipped + 1}: Missing required fields (email, mobile, or jobTitle)`);
                        return;
                    }

                    // Check for duplicate email + jobTitle combination
                    const duplicate = jobAlerts.find(alert => 
                        alert.email.toLowerCase() === row.email.toLowerCase() && 
                        alert.jobTitle === row.jobTitle
                    );
                    
                    if (duplicate) {
                        results.skipped++;
                        results.errors.push(`Row ${results.success + results.failed + results.skipped + 1}: Duplicate entry (email: ${row.email}, jobTitle: ${row.jobTitle})`);
                        return;
                    }

                    // userId will be set later in the end handler
                    // We'll do a batch lookup for all emails

                    const jobAlertData = {
                        jobTitle: row.jobTitle || row['Job Title'] || '',
                        expectedSalary: parseInt(row.expectedSalary || row['Expected Salary'] || row.salary || '0') || 0,
                        presentJobStatus: row.presentJobStatus || row['Present Job Status'] || row.jobStatus || 'not-working',
                        experienceLevel: row.experienceLevel || row['Experience Level'] || (row.totalExperience && row.totalExperience !== 'fresher' ? 'experienced' : 'fresher'),
                        totalExperience: row.totalExperience || row['Total Experience'] || 'fresher',
                        workOfficeLocation: row.workOfficeLocation || row['Work Office Location'] || row.location || row.city || '',
                        industry: row.industry || row['Industry'] || '',
                        subIndustry: row.subIndustry || row['Sub Industry'] || '',
                        department: row.department || row['Department'] || '',
                        jobRoles: jobRoles.length > 0 ? jobRoles : (row.jobRole ? [row.jobRole] : ['']),
                        keySkills: keySkills.length > 0 ? keySkills : (row.skills ? row.skills.split(',').map(s => s.trim()) : ['']),
                        email: (row.email || row['Email'] || '').toLowerCase().trim(),
                        mobile: (row.mobile || row['Mobile'] || row.phone || '').trim().replace(/[^0-9]/g, '').slice(-10),
                        alertName: row.alertName || row['Alert Name'] || `${row.jobTitle || 'Job Alert'} - ${row.email || 'Alert'}`,
                        alertFrequency: row.alertFrequency || row['Alert Frequency'] || 'daily',
                        isActive: row.isActive !== undefined ? row.isActive !== 'false' : true
                    };

                    // Validate mobile number
                    if (!jobAlertData.mobile || jobAlertData.mobile.length !== 10) {
                        results.failed++;
                        results.errors.push(`Row ${results.success + results.failed + results.skipped + 1}: Invalid mobile number`);
                        return;
                    }

                    jobAlerts.push(jobAlertData);
                } catch (error) {
                    results.failed++;
                    results.errors.push(`Row ${results.success + results.failed + results.skipped + 1}: ${error.message}`);
                }
            })
            .on('end', async () => {
                try {
                    // Get all unique emails and find users
                    const uniqueEmails = [...new Set(jobAlerts.map(alert => alert.email.toLowerCase()))];
                    const users = await User.find({ email: { $in: uniqueEmails } });
                    const emailToUserIdMap = new Map();
                    users.forEach(user => {
                        emailToUserIdMap.set(user.email.toLowerCase(), user._id);
                    });

                    // Assign userIds to job alerts
                    jobAlerts.forEach(alert => {
                        const userId = emailToUserIdMap.get(alert.email.toLowerCase());
                        if (userId) {
                            alert.userId = userId;
                        }
                    });

                    // Check for existing alerts in database
                    const existingAlerts = await JobAlert.find({
                        $or: jobAlerts.map(alert => ({
                            email: alert.email,
                            jobTitle: alert.jobTitle
                        }))
                    });

                    const existingMap = new Map();
                    existingAlerts.forEach(alert => {
                        const key = `${alert.email}_${alert.jobTitle}`;
                        existingMap.set(key, true);
                    });

                    // Filter out duplicates
                    const newAlerts = jobAlerts.filter(alert => {
                        const key = `${alert.email}_${alert.jobTitle}`;
                        if (existingMap.has(key)) {
                            results.skipped++;
                            results.errors.push(`Duplicate: ${alert.email} - ${alert.jobTitle} already exists`);
                            return false;
                        }
                        return true;
                    });

                    // Insert job alerts in bulk
                    if (newAlerts.length > 0) {
                        try {
                            const inserted = await JobAlert.insertMany(newAlerts, { ordered: false });
                            results.success = inserted.length;
                        } catch (error) {
                            if (error.name === 'BulkWriteError') {
                                results.success = error.result.insertedCount || 0;
                                results.failed += (newAlerts.length - (error.result.insertedCount || 0));
                                error.result.writeErrors.forEach(err => {
                                    results.errors.push(`Row error: ${err.errmsg}`);
                                });
                            } else {
                                throw error;
                            }
                        }
                    }

                    // Delete uploaded CSV file
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    res.json({
                        success: true,
                        message: 'Bulk candidate import completed',
                        results: {
                            ...results,
                            total: results.success + results.failed + results.skipped
                        }
                    });

                } catch (error) {
                    console.error('Error during bulk insert:', error);
                    
                    // Delete uploaded CSV file
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    res.status(500).json({
                        success: false,
                        message: 'Error during bulk import',
                        error: error.message,
                        results
                    });
                }
            })
            .on('error', (error) => {
                console.error('Error parsing CSV:', error);
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                res.status(500).json({
                    success: false,
                    message: 'Error parsing CSV file',
                    error: error.message
                });
            });

    } catch (error) {
        console.error('Error in bulk candidate import:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Server error during bulk candidate import',
            error: error.message
        });
    }
});

// @route   GET /api/job-alerts/sample-csv/candidates
// @desc    Download sample CSV template for bulk candidate import
// @access  Admin only
router.get('/sample-csv/candidates', adminAuth, async (req, res) => {
    try {
        const sampleData = [
            {
                'Email': 'candidate1@example.com',
                'Mobile': '9876543210',
                'Job Title': 'Software Developer',
                'Expected Salary': '800000',
                'Present Job Status': 'working',
                'Experience Level': 'experienced',
                'Total Experience': '3-years',
                'Work Office Location': 'Mumbai',
                'Industry': 'Information Technology',
                'Sub Industry': 'Software Development',
                'Department': 'Engineering',
                'Job Roles': 'Software Engineer, Full Stack Developer',
                'Key Skills': 'JavaScript, React, Node.js, MongoDB',
                'Alert Name': 'Software Developer Alert',
                'Alert Frequency': 'daily',
                'Is Active': 'true'
            },
            {
                'Email': 'candidate2@example.com',
                'Mobile': '9876543211',
                'Job Title': 'Data Analyst',
                'Expected Salary': '600000',
                'Present Job Status': 'not-working',
                'Experience Level': 'fresher',
                'Total Experience': 'fresher',
                'Work Office Location': 'Bangalore',
                'Industry': 'Information Technology',
                'Sub Industry': 'Data Analytics',
                'Department': 'Analytics',
                'Job Roles': 'Data Analyst, Business Analyst',
                'Key Skills': 'Python, SQL, Excel, Tableau',
                'Alert Name': 'Data Analyst Alert',
                'Alert Frequency': 'weekly',
                'Is Active': 'true'
            }
        ];

        const headers = [
            'Email', 'Mobile', 'Job Title', 'Expected Salary', 'Present Job Status',
            'Experience Level', 'Total Experience', 'Work Office Location',
            'Industry', 'Sub Industry', 'Department', 'Job Roles', 'Key Skills',
            'Alert Name', 'Alert Frequency', 'Is Active'
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
        res.setHeader('Content-Disposition', 'attachment; filename="job-alerts-candidates-sample.csv"');
        res.send(csvContent);

    } catch (error) {
        console.error('Error generating sample CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating sample CSV',
            error: error.message
        });
    }
});

// @route   POST /api/job-alerts/:id/toggle-status
// @desc    Toggle job alert active status
// @access  Admin only
router.post('/:id/toggle-status', adminAuth, async (req, res) => {
    try {
        const jobAlert = await JobAlert.findById(req.params.id);

        if (!jobAlert) {
            return res.status(404).json({
                success: false,
                message: 'Job alert not found'
            });
        }

        jobAlert.isActive = !jobAlert.isActive;
        await jobAlert.save();

        res.json({
            success: true,
            message: `Job alert ${jobAlert.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                id: jobAlert._id,
                isActive: jobAlert.isActive
            }
        });

    } catch (error) {
        console.error('Error toggling job alert status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while toggling job alert status'
        });
    }
});

module.exports = router;
