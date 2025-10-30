const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const welcomeEmailService = require('../services/welcomeEmailService');
const { employerAuth } = require('../middleware/auth');
const router = express.Router();

// Register Consultancy
router.post('/register', async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            phone,
            consultancy
        } = req.body;

        // Check if consultancy already exists
        const existingConsultancy = await User.findOne({ email });
        if (existingConsultancy) {
            return res.status(400).json({ message: 'Consultancy already exists with this email' });
        }

        // Create new consultancy
        const newConsultancy = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            userType: 'employer',
            employerType: 'consultancy',
            company: consultancy,
            verificationStatus: 'pending',
            isEmployerVerified: false
        });

        await newConsultancy.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newConsultancy._id, 
                userType: 'consultancy',
                email: newConsultancy.email 
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        // Send welcome email
        try {
            await welcomeEmailService.sendConsultancyWelcomeEmail(newConsultancy);
        } catch (emailError) {
            console.error('Consultancy welcome email sending failed:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            message: 'Consultancy registered successfully',
            token,
            user: {
                id: newConsultancy._id,
                firstName: newConsultancy.firstName,
                lastName: newConsultancy.lastName,
                email: newConsultancy.email,
                userType: 'consultancy',
                consultancyName: newConsultancy.company?.name || ''
            }
        });
    } catch (error) {
        console.error('Consultancy registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Consultancy
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find consultancy
        const consultancy = await User.findOne({ email });
        if (!consultancy) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await consultancy.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Update last login
        consultancy.lastLogin = new Date();
        await consultancy.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: consultancy._id, 
                userType: 'consultancy',
                email: consultancy.email 
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: consultancy._id,
                firstName: consultancy.firstName,
                lastName: consultancy.lastName,
                email: consultancy.email,
                userType: 'consultancy',
                consultancyName: consultancy.company?.name || ''
            }
        });
    } catch (error) {
        console.error('Consultancy login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get Consultancy Profile
router.get('/me', employerAuth, async (req, res) => {
    try {
        const consultancy = await User.findById(req.user._id).select('-password');
        
        if (!consultancy) {
            return res.status(404).json({ message: 'Consultancy not found' });
        }

        res.json(consultancy);
    } catch (error) {
        console.error('Get consultancy profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Consultancy Profile
router.put('/profile', employerAuth, async (req, res) => {
    try {
        const consultancy = await User.findById(req.user._id);
        
        if (!consultancy) {
            return res.status(404).json({ message: 'Consultancy not found' });
        }

        // Update consultancy profile fields
        const { profile, firstName, lastName, phone, whatsappNumber, hrName, hrDesignation, gender } = req.body;
        
        if (firstName) consultancy.firstName = firstName;
        if (lastName) consultancy.lastName = lastName;
        if (phone) consultancy.phone = phone;
        if (whatsappNumber !== undefined) consultancy.whatsappNumber = whatsappNumber;
        if (hrName !== undefined) consultancy.hrName = hrName;
        if (hrDesignation !== undefined) consultancy.hrDesignation = hrDesignation;
        if (gender !== undefined) consultancy.gender = gender;
        
        // Update profile.company with all fields
        if (profile && profile.company) {
            if (!consultancy.profile) consultancy.profile = {};
            if (!consultancy.profile.company) consultancy.profile.company = {};
            
            // Update consultancy details
            const companyData = profile.company;
            if (companyData.name) consultancy.profile.company.name = companyData.name;
            if (companyData.companyType !== undefined) consultancy.profile.company.companyType = companyData.companyType;
            if (companyData.website !== undefined) consultancy.profile.company.website = companyData.website;
            if (companyData.industry !== undefined) consultancy.profile.company.industry = companyData.industry;
            if (companyData.industryCategory !== undefined) consultancy.profile.company.industryCategory = companyData.industryCategory;
            if (companyData.industrySubcategories) consultancy.profile.company.industrySubcategories = companyData.industrySubcategories;
            if (companyData.departmentCategory !== undefined) consultancy.profile.company.departmentCategory = companyData.departmentCategory;
            if (companyData.departmentSubcategories) consultancy.profile.company.departmentSubcategories = companyData.departmentSubcategories;
            if (companyData.size !== undefined) consultancy.profile.company.size = companyData.size;
            if (companyData.description !== undefined) consultancy.profile.company.description = companyData.description;
            if (companyData.location) consultancy.profile.company.location = companyData.location;
            if (companyData.logo !== undefined) consultancy.profile.company.logo = companyData.logo;
            if (companyData.establishedYear !== undefined) consultancy.profile.company.establishedYear = companyData.establishedYear;
            if (companyData.socialMediaProfile !== undefined) consultancy.profile.company.socialMediaProfile = companyData.socialMediaProfile;
            if (companyData.socialMediaLink !== undefined) consultancy.profile.company.socialMediaLink = companyData.socialMediaLink;
            
            // Update consultancy-specific fields
            if (companyData.consultancy) {
                if (!consultancy.profile.company.consultancy) consultancy.profile.company.consultancy = {};
                if (companyData.consultancy.licenseNumber !== undefined) consultancy.profile.company.consultancy.licenseNumber = companyData.consultancy.licenseNumber;
                if (companyData.consultancy.registrationNumber !== undefined) consultancy.profile.company.consultancy.registrationNumber = companyData.consultancy.registrationNumber;
                if (companyData.consultancy.specializations) consultancy.profile.company.consultancy.specializations = companyData.consultancy.specializations;
                if (companyData.consultancy.clientTypes) consultancy.profile.company.consultancy.clientTypes = companyData.consultancy.clientTypes;
                if (companyData.consultancy.serviceAreas) consultancy.profile.company.consultancy.serviceAreas = companyData.consultancy.serviceAreas;
                if (companyData.consultancy.establishedYear !== undefined) consultancy.profile.company.consultancy.establishedYear = companyData.consultancy.establishedYear;
                if (companyData.consultancy.teamSize !== undefined) consultancy.profile.company.consultancy.teamSize = companyData.consultancy.teamSize;
                if (companyData.consultancy.clients) consultancy.profile.company.consultancy.clients = companyData.consultancy.clients;
            }
        }

        await consultancy.save();

        res.json({
            message: 'Consultancy profile updated successfully',
            consultancy
        });
    } catch (error) {
        console.error('Update consultancy profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
