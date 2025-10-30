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
        const newCompany = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            userType: 'employer',
            employerType: 'company',
            company: company,
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
                companyName: newCompany.company?.name || ''
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
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await company.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
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

// Get Companies List
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const companies = await User.find({ 
            userType: 'employer',
            employerType: 'company',
            isEmployerVerified: true
        })
        .select('firstName lastName email profile verificationStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

        const total = await User.countDocuments({ 
            userType: 'employer',
            employerType: 'company',
            isEmployerVerified: true
        });

        // Transform companies to include profile.company data at root for easy access
        const transformedCompanies = companies.map(company => {
            const profile = company.profile || {};
            const companyData = profile.company || {};
            return {
                _id: company._id,
                firstName: company.firstName,
                lastName: company.lastName,
                email: company.email,
                verificationStatus: company.verificationStatus,
                createdAt: company.createdAt,
                // Include company data both ways for compatibility
                name: companyData.name,
                website: companyData.website,
                industry: companyData.industry,
                size: companyData.size,
                description: companyData.description,
                location: companyData.location,
                // Also include full structure
                profile: profile
            };
        });

        res.json({
            companies: transformedCompanies,
            total,
            limit,
            skip
        });
    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Company Profile
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
