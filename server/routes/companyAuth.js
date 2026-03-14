const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const welcomeEmailService = require('../services/welcomeEmailService');
const { employerAuth } = require('../middleware/auth');
const router = express.Router();

// Register Company
router.post('/register', async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            phone,
            company
        } = req.body;

        // Check if company already exists
        const existingCompany = await User.findOne({ email });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company already exists with this email' });
        }

        // Create new company
        const companyData = {
            name: company.name || '',
            companyType: company.companyType || 'Corporate',
            website: company.website || '',
            industry: company.industry || '',
            description: company.description || '',
            location: company.location || {},
            logo: company.logo || '',
            establishedYear: company.establishedYear || '',
            socialMediaLink: company.socialMediaLink || ''
        };
        
        // Only set size if it's provided and valid
        if (company.size) {
            companyData.size = company.size;
        }
        
        // Only set socialMediaProfile if it's provided and valid
        if (company.socialMediaProfile) {
            companyData.socialMediaProfile = company.socialMediaProfile;
        }
        
        const newCompany = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            userType: 'employer',
            employerType: 'company',
            profile: {
                company: companyData
            },
            verificationStatus: 'pending',
            isEmployerVerified: false
        });

        await newCompany.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newCompany._id, 
                userType: 'company',
                email: newCompany.email 
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        // Send welcome email
        try {
            await welcomeEmailService.sendCompanyWelcomeEmail(newCompany);
        } catch (emailError) {
            console.error('Company welcome email sending failed:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            message: 'Company registered successfully',
            token,
            user: {
                id: newCompany._id,
                firstName: newCompany.firstName,
                lastName: newCompany.lastName,
                email: newCompany.email,
                userType: 'company',
                companyName: newCompany.profile?.company?.name || newCompany.company?.name || ''
            }
        });
    } catch (error) {
        console.error('Company registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Company
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find company
        const company = await User.findOne({ email });
        if (!company) {
            const logger = require('../utils/logger');
            logger.warn('Company login failed: User not found', {
                email: email.substring(0, 10) + '***',
                ip: req.ip
            });
            return res.status(400).json({ message: 'No account found with this email address' });
        }

        // STRICT VALIDATION: ONLY company accounts can login here
        // Explicitly reject admin, superadmin, jobseeker, and other account types
        if (company.userType === 'admin' || company.userType === 'superadmin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin accounts cannot login through company login. Please use the admin login page.' 
            });
        }
        
        if (company.userType === 'jobseeker') {
            return res.status(403).json({ 
                message: 'Access denied. This is a jobseeker account. Please use the jobseeker login page.' 
            });
        }
        
        // Check BOTH conditions must be true - reject if either fails
        const isCompanyAccount = company.userType === 'employer' && company.employerType === 'company';
        
        if (!isCompanyAccount) {
            // Determine account type for error message
            let accountType = company.userType;
            if (company.userType === 'employer' && company.employerType) {
                accountType = company.employerType;
            } else if (company.userType === 'employer') {
                accountType = 'unknown employer type';
            }
            
            return res.status(400).json({ 
                message: `This account is a ${accountType} account, not a company account. Please use the correct login page` 
            });
        }

        // Check if account is active
        if (!company.isActive) {
            const logger = require('../utils/logger');
            logger.warn('Company login failed: Account deactivated', {
                userId: company._id,
                email: company.email,
                ip: req.ip
            });
            return res.status(400).json({ message: 'Account is deactivated. Please contact support' });
        }

        // Check password (only after user type validation passes)
        const isMatch = await company.comparePassword(password);
        if (!isMatch) {
            const logger = require('../utils/logger');
            logger.warn('Company login failed: Incorrect password', {
                userId: company._id,
                email: company.email,
                ip: req.ip
            });
            return res.status(400).json({ message: 'Incorrect password. Please try again' });
        }

        // Final safeguard: Double-check account type before generating token
        if (company.userType !== 'employer' || company.employerType !== 'company') {
            return res.status(403).json({ 
                message: 'Access denied: This account is not authorized for company login' 
            });
        }

        // Update last login
        company.lastLogin = new Date();
        await company.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: company._id, 
                userType: 'company',
                email: company.email 
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: company._id,
                firstName: company.firstName,
                lastName: company.lastName,
                email: company.email,
                userType: 'company',
                companyName: company.company?.name || ''
            }
        });
    } catch (error) {
        console.error('Company login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get Company Profile (Authenticated) - Must be before /:id
router.get('/me', employerAuth, async (req, res) => {
    try {
        const company = await User.findById(req.user._id).select('-password');
        
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json(company);
    } catch (error) {
        console.error('Get company profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Companies List - Updated to show all companies and consultancies
router.get('/', async (req, res) => {
    try {
        console.log('🔍 GET /api/company - Companies page accessed');
        const { search, industry, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const Job = require('../models/Job');

        // Build query for registered companies and consultancies
        // Handle both old format (userType: 'company'/'consultancy') and new format (userType: 'employer' with employerType)
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

        console.log('📋 Companies query:', JSON.stringify(query, null, 2));

        const companies = await User.find(query)
            .select('profile.company company employerType userType firstName lastName companyName consultancyName isEmployerVerified verificationStatus createdAt isActive')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        console.log(`✅ Found ${companies.length} companies (showing page ${page}, limit ${limit})`);

        const total = await User.countDocuments(query);
        
        console.log(`📊 Total companies in database matching query: ${total}`);
        
        // Also log a sample of company IDs and names for debugging
        if (companies.length > 0) {
            console.log('📝 Sample companies found:', companies.slice(0, 3).map(c => ({
                id: c._id,
                name: c.profile?.company?.name || c.company?.name || `${c.firstName} ${c.lastName}`,
                userType: c.userType,
                employerType: c.employerType,
                isActive: c.isActive,
                isEmployerVerified: c.isEmployerVerified
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
                totalPages: Math.ceil(total / parseInt(limit)),
                total: total
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

// Get Company by ID (Public) - Must be last
router.get('/:id', async (req, res) => {
    try {
        console.log('🔍 GET /api/company/:id - Fetching company details for ID:', req.params.id);
        
        const company = await User.findById(req.params.id)
            .select('-password -verificationToken -verificationTokenExpires');
        
        if (!company) {
            console.log('❌ Company not found with ID:', req.params.id);
            return res.status(404).json({ message: 'Company not found' });
        }

        // Check if it's actually a company or consultancy
        const isCompanyOrConsultancy = 
            (company.userType === 'employer' && (company.employerType === 'company' || company.employerType === 'consultancy')) ||
            (company.userType === 'company' || company.userType === 'consultancy');

        if (!isCompanyOrConsultancy) {
            console.log('❌ User is not a company/consultancy. userType:', company.userType, 'employerType:', company.employerType);
            return res.status(404).json({ message: 'Company not found' });
        }

        // Determine employer type
        const employerType = company.employerType || 
                           (company.userType === 'company' ? 'company' : 
                            company.userType === 'consultancy' ? 'consultancy' : null);

        // Get company data from profile.company or fallback to company field
        const companyData = company.profile?.company || company.company || {};

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

        // Get company name
        const companyName = companyData.name || 
                           company.companyName || 
                           company.consultancyName ||
                           `${company.firstName} ${company.lastName}`;

        // Format response to match frontend expectations
        const formattedCompany = {
            _id: company._id,
            firstName: company.firstName,
            lastName: company.lastName,
            email: company.email,
            phone: company.phone,
            name: companyName,
            industry: companyData.industry || 'Technology',
            website: companyData.website || '',
            size: companyData.size || 'Not specified',
            description: companyData.description || 'Leading company in the industry',
            location: location || companyData.location || 'Multiple locations',
            companyType: companyData.companyType || (employerType === 'consultancy' ? 'Consultancy' : 'Company'),
            employeeCount: companyData.company?.employeeCount || companyData.consultancy?.teamSize || companyData.size || 'Not specified',
            establishedYear: companyData.establishedYear || companyData.consultancy?.establishedYear || companyData.company?.foundedYear || '',
            logo: companyData.logo || '',
            socialMediaProfile: companyData.socialMediaProfile || '',
            socialMediaLink: companyData.socialMediaLink || '',
            isEmployerVerified: company.isEmployerVerified,
            verificationStatus: company.verificationStatus,
            employerType: employerType,
            userType: company.userType,
            profile: {
                company: companyData
            },
            // Include nested company/consultancy data
            company: companyData.company || {},
            consultancy: companyData.consultancy || {}
        };

        console.log('✅ Company found:', {
            id: formattedCompany._id,
            name: formattedCompany.name,
            employerType: formattedCompany.employerType,
            isVerified: formattedCompany.isEmployerVerified
        });

        res.json(formattedCompany);
    } catch (error) {
        console.error('❌ Error fetching company by ID:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Server error while fetching company details',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update Company Profile
router.put('/profile', employerAuth, async (req, res) => {
    try {
        const company = await User.findById(req.user._id);
        
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Update company profile fields
        const { profile, firstName, lastName, phone, whatsappNumber, hrName, hrDesignation, gender } = req.body;
        
        if (firstName) company.firstName = firstName;
        if (lastName) company.lastName = lastName;
        if (phone) company.phone = phone;
        if (whatsappNumber !== undefined) company.whatsappNumber = whatsappNumber;
        if (hrName !== undefined) company.hrName = hrName;
        if (hrDesignation !== undefined) company.hrDesignation = hrDesignation;
        if (gender !== undefined) company.gender = gender;
        
        // Update profile.company with all fields
        if (profile && profile.company) {
            if (!company.profile) company.profile = {};
            if (!company.profile.company) company.profile.company = {};
            
            // Update company details
            const companyData = profile.company;
            if (companyData.name) company.profile.company.name = companyData.name;
            if (companyData.companyType !== undefined) company.profile.company.companyType = companyData.companyType;
            if (companyData.website !== undefined) company.profile.company.website = companyData.website;
            if (companyData.industry !== undefined) company.profile.company.industry = companyData.industry;
            if (companyData.industryCategory !== undefined) company.profile.company.industryCategory = companyData.industryCategory;
            if (companyData.industrySubcategories) company.profile.company.industrySubcategories = companyData.industrySubcategories;
            if (companyData.departmentCategory !== undefined) company.profile.company.departmentCategory = companyData.departmentCategory;
            if (companyData.departmentSubcategories) company.profile.company.departmentSubcategories = companyData.departmentSubcategories;
            if (companyData.size !== undefined) company.profile.company.size = companyData.size;
            if (companyData.description !== undefined) company.profile.company.description = companyData.description;
            if (companyData.location) company.profile.company.location = companyData.location;
            if (companyData.logo !== undefined) company.profile.company.logo = companyData.logo;
            if (companyData.establishedYear !== undefined) company.profile.company.establishedYear = companyData.establishedYear;
            if (companyData.socialMediaProfile !== undefined) company.profile.company.socialMediaProfile = companyData.socialMediaProfile;
            if (companyData.socialMediaLink !== undefined) company.profile.company.socialMediaLink = companyData.socialMediaLink;
            
            // Update company-specific fields
            if (companyData.company) {
                if (!company.profile.company.company) company.profile.company.company = {};
                if (companyData.company.foundedYear !== undefined) company.profile.company.company.foundedYear = companyData.company.foundedYear;
                if (companyData.company.revenue !== undefined) company.profile.company.company.revenue = companyData.company.revenue;
                if (companyData.company.employeeCount !== undefined) company.profile.company.company.employeeCount = companyData.company.employeeCount;
                if (companyData.company.departments) company.profile.company.company.departments = companyData.company.departments;
                if (companyData.company.benefits) company.profile.company.company.benefits = companyData.company.benefits;
                if (companyData.company.culture !== undefined) company.profile.company.company.culture = companyData.company.culture;
                if (companyData.company.workEnvironment !== undefined) company.profile.company.company.workEnvironment = companyData.company.workEnvironment;
                if (companyData.company.growthStage !== undefined) company.profile.company.company.growthStage = companyData.company.growthStage;
            }
        }

        await company.save();

        res.json({
            message: 'Company profile updated successfully',
            company
        });
    } catch (error) {
        console.error('Update company profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
