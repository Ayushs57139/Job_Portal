const express = require('express');
const { body, validationResult, query } = require('express-validator');
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const { auth, employerAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/candidates/advanced-search
// @desc    Advanced candidate search with comprehensive filtering (Candex)
// @access  Private (Employer/Admin)
router.post('/advanced-search', employerAuth, async (req, res) => {
    try {
        const {
            filters = {},
            page = 1,
            limit = 20,
            sortBy = 'updatedAt',
            sortOrder = 'desc',
            searchMode = 'and' // 'and' or 'or' for multiple criteria
        } = req.body;

        // Build the search query with enhanced filtering
        const searchQuery = buildAdvancedSearchQuery(filters, searchMode);
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sortObject = {};
        sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute search with pagination and sorting
        const candidates = await UserProfile.find(searchQuery)
            .populate('userId', 'firstName lastName email phone userType isActive lastLogin')
            .sort(sortObject)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const totalCandidates = await UserProfile.countDocuments(searchQuery);

        // Get search statistics
        const searchStats = await getSearchStatistics(searchQuery);

        // Format the response with enhanced data
        const formattedCandidates = candidates.map(candidate => ({
            _id: candidate._id,
            userId: candidate.userId._id,
            name: `${candidate.userId.firstName} ${candidate.userId.lastName}`,
            email: candidate.userId.email,
            phone: candidate.userId.phone,
            userType: candidate.userId.userType,
            isActive: candidate.userId.isActive,
            lastLogin: candidate.userId.lastLogin,
            profileImage: candidate.personalInfo?.profilePicture || '/images/default-avatar.png',
            currentJobTitle: candidate.professional?.currentJobTitle,
            currentCompany: candidate.professional?.currentCompany,
            experience: candidate.professional?.experience,
            totalExperience: candidate.professional?.totalExperience,
            location: candidate.personalInfo?.currentCity,
            skills: candidate.professional?.skills || [],
            keySkills: candidate.professional?.keySkills || [],
            expectedSalary: candidate.preferences?.expectedSalary,
            availability: candidate.preferences?.noticePeriod,
            workMode: candidate.preferences?.workMode,
            status: candidate.profileStatus?.isActive ? 'active' : 'inactive',
            profileCompletion: candidate.profileStatus?.completionPercentage || 0,
            isComplete: candidate.profileStatus?.isComplete || false,
            lastActive: candidate.updatedAt,
            createdAt: candidate.createdAt,
            education: candidate.education,
            personalInfo: candidate.personalInfo,
            professional: candidate.professional,
            preferences: candidate.preferences,
            additionalInfo: candidate.additionalInfo,
            // Enhanced fields for better search results
            matchScore: calculateMatchScore(candidate, filters),
            isVerified: candidate.profileStatus?.isVerified || false,
            adminRating: candidate.adminRating,
            adminTags: candidate.adminTags || []
        }));

        // Sort by match score if no specific sort is provided
        if (sortBy === 'updatedAt' && filters.searchKeywords) {
            formattedCandidates.sort((a, b) => b.matchScore - a.matchScore);
        }

        res.json({
            success: true,
            candidates: formattedCandidates,
            total: totalCandidates,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCandidates / parseInt(limit)),
            searchStats,
            appliedFilters: Object.keys(filters).filter(key => filters[key] && filters[key] !== ''),
            searchMode,
            sortBy,
            sortOrder
        });

    } catch (error) {
        console.error('Advanced candidate search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during candidate search',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   GET /api/candidates/search
// @desc    Basic candidate search
// @access  Private (Employer/Admin)
router.get('/search', employerAuth, async (req, res) => {
    try {
        const {
            search,
            location,
            experience,
            skills,
            page = 1,
            limit = 20
        } = req.query;

        // Build basic search query
        const searchQuery = {};

        // Text search
        if (search) {
            searchQuery.$or = [
                { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
                { 'professional.currentJobTitle': { $regex: search, $options: 'i' } },
                { 'professional.currentCompany': { $regex: search, $options: 'i' } },
                { 'professional.keySkills': { $regex: search, $options: 'i' } }
            ];
        }

        // Location filter
        if (location) {
            searchQuery['personalInfo.currentCity'] = { $regex: location, $options: 'i' };
        }

        // Experience filter
        if (experience) {
            searchQuery['professional.totalExperience'] = { $gte: parseInt(experience) };
        }

        // Skills filter
        if (skills) {
            const skillsArray = skills.split(',').map(skill => skill.trim());
            searchQuery['professional.keySkills'] = { $in: skillsArray };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute search
        const candidates = await UserProfile.find(searchQuery)
            .populate('userId', 'firstName lastName email phone')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const totalCandidates = await UserProfile.countDocuments(searchQuery);

        res.json({
            success: true,
            candidates,
            total: totalCandidates,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Candidate search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during candidate search'
        });
    }
});

// @route   POST /api/candidates/save
// @desc    Save candidate to saved list
// @access  Private (Employer/Admin)
router.post('/save', employerAuth, async (req, res) => {
    try {
        const { candidateId } = req.body;
        const employerId = req.user.id;

        // Implementation for saving candidate
        // This would typically involve creating a SavedCandidate model
        // For now, we'll just return success

        res.json({
            success: true,
            message: 'Candidate saved successfully'
        });

    } catch (error) {
        console.error('Save candidate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while saving candidate'
        });
    }
});

// @route   GET /api/candidates/suggestions
// @desc    Get search suggestions for autocomplete
// @access  Private (Employer/Admin)
router.get('/suggestions', employerAuth, async (req, res) => {
    try {
        const { q, type } = req.query;

        if (!q || q.length < 2) {
            return res.json({ suggestions: [] });
        }

        let suggestions = [];

        switch (type) {
            case 'skills':
                suggestions = await getSkillsSuggestions(q);
                break;
            case 'locations':
                suggestions = await getLocationsSuggestions(q);
                break;
            case 'companies':
                suggestions = await getCompaniesSuggestions(q);
                break;
            case 'job-roles':
                suggestions = await getJobRolesSuggestions(q);
                break;
            case 'institutions':
                suggestions = await getInstitutionsSuggestions(q);
                break;
            case 'certifications':
                suggestions = await getCertificationsSuggestions(q);
                break;
            default:
                suggestions = await getAllSuggestions(q);
        }

        res.json({ suggestions });

    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching suggestions'
        });
    }
});

// Enhanced helper function to build advanced search query
function buildAdvancedSearchQuery(filters, searchMode = 'and') {
    const query = {};
    const conditions = [];

    // Basic Information Filters
    if (filters.currentCompanyName) {
        conditions.push({
            'professional.currentCompany': { $regex: filters.currentCompanyName, $options: 'i' }
        });
    }

    if (filters.searchKeywords) {
        const keywordConditions = [
            { 'personalInfo.fullName': { $regex: filters.searchKeywords, $options: 'i' } },
            { 'professional.currentJobTitle': { $regex: filters.searchKeywords, $options: 'i' } },
            { 'professional.currentCompany': { $regex: filters.searchKeywords, $options: 'i' } },
            { 'professional.skills': { $regex: filters.searchKeywords, $options: 'i' } },
            { 'professional.keySkills': { $regex: filters.searchKeywords, $options: 'i' } },
            { 'education.degree': { $regex: filters.searchKeywords, $options: 'i' } },
            { 'education.institution': { $regex: filters.searchKeywords, $options: 'i' } },
            { 'additionalInfo.bio': { $regex: filters.searchKeywords, $options: 'i' } }
        ];
        conditions.push({ $or: keywordConditions });
    }

    if (filters.keySkills && filters.keySkills.length > 0) {
        conditions.push({
            'professional.keySkills': { $in: filters.keySkills }
        });
    }

    if (filters.experienceLevel) {
        conditions.push({
            'professional.experienceLevel': filters.experienceLevel
        });
    }

    if (filters.minExperience || filters.maxExperience) {
        const experienceQuery = {};
        if (filters.minExperience) {
            experienceQuery.$gte = parseInt(filters.minExperience);
        }
        if (filters.maxExperience) {
            experienceQuery.$lte = parseInt(filters.maxExperience);
        }
        conditions.push({
            'professional.totalExperience': experienceQuery
        });
    }

    if (filters.currentCity && filters.currentCity.length > 0) {
        conditions.push({
            'personalInfo.currentCity': { $in: filters.currentCity }
        });
    }

    if (filters.jobLocalityPincode && filters.jobLocalityPincode.length > 0) {
        conditions.push({
            'personalInfo.pincode': { $in: filters.jobLocalityPincode }
        });
    }

    if (filters.includeWillingToRelocate) {
        conditions.push({
            'preferences.willingToRelocate': true
        });
    }

    if (filters.excludeAnywhereInIndia) {
        conditions.push({
            'personalInfo.currentCity': { $ne: 'Anywhere in India' }
        });
    }

    if (filters.minSalary || filters.maxSalary) {
        const salaryQuery = {};
        if (filters.minSalary) {
            salaryQuery.$gte = parseInt(filters.minSalary);
        }
        if (filters.maxSalary) {
            salaryQuery.$lte = parseInt(filters.maxSalary);
        }
        conditions.push({
            'preferences.expectedSalary': salaryQuery
        });
    }

    if (filters.currentJobTitle) {
        conditions.push({
            'professional.currentJobTitle': { $regex: filters.currentJobTitle, $options: 'i' }
        });
    }

    if (filters.excludeKeywords) {
        conditions.push({
            $and: [
                { 'professional.keySkills': { $not: { $regex: filters.excludeKeywords, $options: 'i' } } },
                { 'professional.currentJobTitle': { $not: { $regex: filters.excludeKeywords, $options: 'i' } } }
            ]
        });
    }

    // Professional Details Filters
    if (filters.industrySectors && filters.industrySectors.length > 0) {
        conditions.push({
            'professional.industry': { $in: filters.industrySectors }
        });
    }

    if (filters.departmentCategory && filters.departmentCategory.length > 0) {
        conditions.push({
            'professional.department': { $in: filters.departmentCategory }
        });
    }

    if (filters.jobRoles && filters.jobRoles.length > 0) {
        conditions.push({
            'professional.jobRole': { $in: filters.jobRoles }
        });
    }

    if (filters.currentCompanyType) {
        conditions.push({
            'professional.companyType': filters.currentCompanyType
        });
    }

    if (filters.noticePeriod) {
        conditions.push({
            'preferences.noticePeriod': filters.noticePeriod
        });
    }

    // Education Details Filters
    if (filters.educationLevel && filters.educationLevel.length > 0) {
        conditions.push({
            'education.educationLevel': { $in: filters.educationLevel }
        });
    }

    if (filters.degreeCourse && filters.degreeCourse.length > 0) {
        conditions.push({
            'education.degree': { $in: filters.degreeCourse }
        });
    }

    if (filters.specialisation && filters.specialisation.length > 0) {
        conditions.push({
            'education.specialization': { $in: filters.specialisation }
        });
    }

    if (filters.institutionNames && filters.institutionNames.length > 0) {
        conditions.push({
            'education.institution': { $in: filters.institutionNames }
        });
    }

    if (filters.educationStatus && filters.educationStatus.length > 0) {
        conditions.push({
            'education.educationStatus': { $in: filters.educationStatus }
        });
    }

    if (filters.educationType && filters.educationType.length > 0) {
        conditions.push({
            'education.educationType': { $in: filters.educationType }
        });
    }

    if (filters.educationMedium && filters.educationMedium.length > 0) {
        conditions.push({
            'education.educationMedium': { $in: filters.educationMedium }
        });
    }

    if (filters.marksType && filters.marksType.length > 0) {
        conditions.push({
            'education.marksType': { $in: filters.marksType }
        });
    }

    if (filters.marksPercentage) {
        conditions.push({
            'education.marksValue': { $gte: parseInt(filters.marksPercentage) }
        });
    }

    if (filters.certificationCourses && filters.certificationCourses.length > 0) {
        conditions.push({
            'professional.certifications.name': { $in: filters.certificationCourses }
        });
    }

    // Personal Details Filters
    if (filters.gender && filters.gender.length > 0) {
        conditions.push({
            'personalInfo.gender': { $in: filters.gender }
        });
    }

    if (filters.disabilityStatus && filters.disabilityStatus.length > 0) {
        conditions.push({
            'personalInfo.disabilityStatus': { $in: filters.disabilityStatus }
        });
    }

    if (filters.anyDisabilities && filters.anyDisabilities.length > 0) {
        conditions.push({
            'personalInfo.disabilities': { $in: filters.anyDisabilities }
        });
    }

    if (filters.diversityHiring && filters.diversityHiring.length > 0) {
        conditions.push({
            'personalInfo.diversityHiring': { $in: filters.diversityHiring }
        });
    }

    if (filters.category && filters.category.length > 0) {
        conditions.push({
            'personalInfo.category': { $in: filters.category }
        });
    }

    if (filters.minAge || filters.maxAge) {
        const currentDate = new Date();
        const ageQuery = {};
        if (filters.maxAge) {
            const minBirthDate = new Date(currentDate.getFullYear() - filters.maxAge - 1, currentDate.getMonth(), currentDate.getDate());
            ageQuery.$gte = minBirthDate;
        }
        if (filters.minAge) {
            const maxBirthDate = new Date(currentDate.getFullYear() - filters.minAge, currentDate.getMonth(), currentDate.getDate());
            ageQuery.$lte = maxBirthDate;
        }
        conditions.push({
            'personalInfo.dateOfBirth': ageQuery
        });
    }

    // Job Preferences Filters
    if (filters.employmentType && filters.employmentType.length > 0) {
        conditions.push({
            'preferences.jobTypePreference': { $in: filters.employmentType }
        });
    }

    if (filters.jobType && filters.jobType.length > 0) {
        conditions.push({
            'preferences.jobTypePreference': { $in: filters.jobType }
        });
    }

    if (filters.jobModeType && filters.jobModeType.length > 0) {
        conditions.push({
            'preferences.workMode': { $in: filters.jobModeType }
        });
    }

    if (filters.jobShiftType && filters.jobShiftType.length > 0) {
        conditions.push({
            'preferences.jobShiftType': { $in: filters.jobShiftType }
        });
    }

    if (filters.preferredLanguage && filters.preferredLanguage.length > 0) {
        conditions.push({
            'preferences.preferredLanguage': { $in: filters.preferredLanguage }
        });
    }

    if (filters.englishFluencyLevel && filters.englishFluencyLevel.length > 0) {
        conditions.push({
            'preferences.englishFluencyLevel': { $in: filters.englishFluencyLevel }
        });
    }

    if (filters.assetRequirements && filters.assetRequirements.length > 0) {
        conditions.push({
            'preferences.assetRequirements': { $in: filters.assetRequirements }
        });
    }

    // Candidate Status Filters
    if (filters.candidatesShowType && filters.candidatesShowType.length > 0) {
        conditions.push({
            'profileStatus.isActive': { $in: filters.candidatesShowType.map(type => type === 'active') }
        });
    }

    if (filters.showCandidatesWith && filters.showCandidatesWith.length > 0) {
        // Enhanced filtering for candidate status
        const statusConditions = [];
        filters.showCandidatesWith.forEach(status => {
            switch (status) {
                case 'resume':
                    statusConditions.push({ 'additionalInfo.resume': { $exists: true, $ne: null } });
                    break;
                case 'profile-picture':
                    statusConditions.push({ 'personalInfo.profilePicture': { $exists: true, $ne: null } });
                    break;
                case 'verified':
                    statusConditions.push({ 'profileStatus.isVerified': true });
                    break;
                case 'complete-profile':
                    statusConditions.push({ 'profileStatus.isComplete': true });
                    break;
            }
        });
        if (statusConditions.length > 0) {
            conditions.push({ $or: statusConditions });
        }
    }

    if (filters.lastActiveCandidates && filters.lastActiveCandidates.length > 0) {
        const days = parseInt(filters.lastActiveCandidates[0].split('-')[0]);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        conditions.push({
            updatedAt: { $gte: cutoffDate }
        });
    }

    // Profile completion filter
    if (filters.minProfileCompletion) {
        conditions.push({
            'profileStatus.completionPercentage': { $gte: parseInt(filters.minProfileCompletion) }
        });
    }

    // Admin specific filters
    if (filters.adminRating) {
        conditions.push({
            adminRating: { $gte: parseInt(filters.adminRating) }
        });
    }

    if (filters.adminTags && filters.adminTags.length > 0) {
        conditions.push({
            adminTags: { $in: filters.adminTags }
        });
    }

    // Combine conditions based on search mode
    if (conditions.length > 0) {
        if (searchMode === 'or') {
            query.$or = conditions;
        } else {
            query.$and = conditions;
        }
    }

    // Always filter for active profiles unless specifically requested
    if (!filters.includeInactive) {
        query['profileStatus.isActive'] = true;
    }

    return query;
}

// Legacy function for backward compatibility
function buildSearchQuery(filters) {
    const query = {};

    // Basic Information Filters
    if (filters.currentCompanyName) {
        query['professional.currentCompany'] = { $regex: filters.currentCompanyName, $options: 'i' };
    }

    if (filters.searchKeywords) {
        query.$or = [
            { 'personalInfo.fullName': { $regex: filters.searchKeywords, $options: 'i' } },
            { 'professional.currentJobTitle': { $regex: filters.searchKeywords, $options: 'i' } },
            { 'professional.currentCompany': { $regex: filters.searchKeywords, $options: 'i' } },
            { 'professional.keySkills': { $regex: filters.searchKeywords, $options: 'i' } }
        ];
    }

    if (filters.keySkills && filters.keySkills.length > 0) {
        query['professional.keySkills'] = { $in: filters.keySkills };
    }

    if (filters.experienceLevel) {
        query['professional.experienceLevel'] = filters.experienceLevel;
    }

    if (filters.minExperience || filters.maxExperience) {
        query['professional.totalExperience'] = {};
        if (filters.minExperience) {
            query['professional.totalExperience'].$gte = parseInt(filters.minExperience);
        }
        if (filters.maxExperience) {
            query['professional.totalExperience'].$lte = parseInt(filters.maxExperience);
        }
    }

    if (filters.currentCity && filters.currentCity.length > 0) {
        query['personalInfo.currentCity'] = { $in: filters.currentCity };
    }

    if (filters.jobLocalityPincode && filters.jobLocalityPincode.length > 0) {
        query['personalInfo.pincode'] = { $in: filters.jobLocalityPincode };
    }

    if (filters.includeWillingToRelocate) {
        query['preferences.willingToRelocate'] = true;
    }

    if (filters.excludeAnywhereInIndia) {
        query['personalInfo.currentCity'] = { $ne: 'Anywhere in India' };
    }

    if (filters.minSalary || filters.maxSalary) {
        query['preferences.expectedSalary'] = {};
        if (filters.minSalary) {
            query['preferences.expectedSalary'].$gte = parseInt(filters.minSalary);
        }
        if (filters.maxSalary) {
            query['preferences.expectedSalary'].$lte = parseInt(filters.maxSalary);
        }
    }

    if (filters.currentJobTitle) {
        query['professional.currentJobTitle'] = { $regex: filters.currentJobTitle, $options: 'i' };
    }

    if (filters.excludeKeywords) {
        query.$and = [
            { 'professional.keySkills': { $not: { $regex: filters.excludeKeywords, $options: 'i' } } },
            { 'professional.currentJobTitle': { $not: { $regex: filters.excludeKeywords, $options: 'i' } } }
        ];
    }

    // Professional Details Filters
    if (filters.industrySectors && filters.industrySectors.length > 0) {
        query['professional.industry'] = { $in: filters.industrySectors };
    }

    if (filters.departmentCategory && filters.departmentCategory.length > 0) {
        query['professional.department'] = { $in: filters.departmentCategory };
    }

    if (filters.jobRoles && filters.jobRoles.length > 0) {
        query['professional.jobRole'] = { $in: filters.jobRoles };
    }

    if (filters.currentCompanyType) {
        query['professional.companyType'] = filters.currentCompanyType;
    }

    if (filters.noticePeriod) {
        query['preferences.noticePeriod'] = filters.noticePeriod;
    }

    // Education Details Filters
    if (filters.educationLevel && filters.educationLevel.length > 0) {
        query['education.educationLevel'] = { $in: filters.educationLevel };
    }

    if (filters.degreeCourse && filters.degreeCourse.length > 0) {
        query['education.degree'] = { $in: filters.degreeCourse };
    }

    if (filters.specialisation && filters.specialisation.length > 0) {
        query['education.specialization'] = { $in: filters.specialisation };
    }

    if (filters.institutionNames && filters.institutionNames.length > 0) {
        query['education.institution'] = { $in: filters.institutionNames };
    }

    if (filters.educationStatus && filters.educationStatus.length > 0) {
        query['education.status'] = { $in: filters.educationStatus };
    }

    if (filters.educationType && filters.educationType.length > 0) {
        query['education.type'] = { $in: filters.educationType };
    }

    if (filters.educationMedium && filters.educationMedium.length > 0) {
        query['education.medium'] = { $in: filters.educationMedium };
    }

    if (filters.marksType && filters.marksType.length > 0) {
        query['education.marksType'] = { $in: filters.marksType };
    }

    if (filters.marksPercentage) {
        query['education.marksPercentage'] = { $gte: parseInt(filters.marksPercentage) };
    }

    if (filters.certificationCourses && filters.certificationCourses.length > 0) {
        query['education.certifications'] = { $in: filters.certificationCourses };
    }

    // Personal Details Filters
    if (filters.gender && filters.gender.length > 0) {
        query['personalInfo.gender'] = { $in: filters.gender };
    }

    if (filters.disabilityStatus && filters.disabilityStatus.length > 0) {
        query['personalInfo.disabilityStatus'] = { $in: filters.disabilityStatus };
    }

    if (filters.anyDisabilities && filters.anyDisabilities.length > 0) {
        query['personalInfo.disabilities'] = { $in: filters.anyDisabilities };
    }

    if (filters.diversityHiring && filters.diversityHiring.length > 0) {
        query['personalInfo.diversityHiring'] = { $in: filters.diversityHiring };
    }

    if (filters.category && filters.category.length > 0) {
        query['personalInfo.category'] = { $in: filters.category };
    }

    if (filters.minAge || filters.maxAge) {
        const currentDate = new Date();
        query['personalInfo.dateOfBirth'] = {};
        if (filters.maxAge) {
            const minBirthDate = new Date(currentDate.getFullYear() - filters.maxAge - 1, currentDate.getMonth(), currentDate.getDate());
            query['personalInfo.dateOfBirth'].$gte = minBirthDate;
        }
        if (filters.minAge) {
            const maxBirthDate = new Date(currentDate.getFullYear() - filters.minAge, currentDate.getMonth(), currentDate.getDate());
            query['personalInfo.dateOfBirth'].$lte = maxBirthDate;
        }
    }

    // Job Preferences Filters
    if (filters.employmentType && filters.employmentType.length > 0) {
        query['preferences.employmentType'] = { $in: filters.employmentType };
    }

    if (filters.jobType && filters.jobType.length > 0) {
        query['preferences.jobType'] = { $in: filters.jobType };
    }

    if (filters.jobModeType && filters.jobModeType.length > 0) {
        query['preferences.jobModeType'] = { $in: filters.jobModeType };
    }

    if (filters.jobShiftType && filters.jobShiftType.length > 0) {
        query['preferences.jobShiftType'] = { $in: filters.jobShiftType };
    }

    if (filters.preferredLanguage && filters.preferredLanguage.length > 0) {
        query['preferences.preferredLanguage'] = { $in: filters.preferredLanguage };
    }

    if (filters.englishFluencyLevel && filters.englishFluencyLevel.length > 0) {
        query['preferences.englishFluencyLevel'] = { $in: filters.englishFluencyLevel };
    }

    if (filters.assetRequirements && filters.assetRequirements.length > 0) {
        query['preferences.assetRequirements'] = { $in: filters.assetRequirements };
    }

    // Candidate Status Filters
    if (filters.candidatesShowType && filters.candidatesShowType.length > 0) {
        query['status'] = { $in: filters.candidatesShowType };
    }

    if (filters.showCandidatesWith && filters.showCandidatesWith.length > 0) {
        // This would require additional fields in the profile model
        // For now, we'll implement basic filtering
    }

    if (filters.lastActiveCandidates && filters.lastActiveCandidates.length > 0) {
        const days = parseInt(filters.lastActiveCandidates[0].split('-')[0]);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query.updatedAt = { $gte: cutoffDate };
    }

    return query;
}

// Helper functions for suggestions
async function getSkillsSuggestions(query) {
    const suggestions = await UserProfile.distinct('professional.keySkills', {
        'professional.keySkills': { $regex: query, $options: 'i' }
    });
    return suggestions.slice(0, 12);
}

async function getLocationsSuggestions(query) {
    const suggestions = await UserProfile.distinct('personalInfo.currentCity', {
        'personalInfo.currentCity': { $regex: query, $options: 'i' }
    });
    return suggestions.slice(0, 10);
}

async function getCompaniesSuggestions(query) {
    const suggestions = await UserProfile.distinct('professional.currentCompany', {
        'professional.currentCompany': { $regex: query, $options: 'i' }
    });
    return suggestions.slice(0, 10);
}

async function getJobRolesSuggestions(query) {
    const suggestions = await UserProfile.distinct('professional.currentJobTitle', {
        'professional.currentJobTitle': { $regex: query, $options: 'i' }
    });
    return suggestions.slice(0, 12);
}

async function getInstitutionsSuggestions(query) {
    const suggestions = await UserProfile.distinct('education.institution', {
        'education.institution': { $regex: query, $options: 'i' }
    });
    return suggestions.slice(0, 10);
}

async function getCertificationsSuggestions(query) {
    const suggestions = await UserProfile.distinct('education.certifications', {
        'education.certifications': { $regex: query, $options: 'i' }
    });
    return suggestions.slice(0, 10);
}

async function getAllSuggestions(query) {
    const [skills, locations, companies, jobRoles] = await Promise.all([
        getSkillsSuggestions(query),
        getLocationsSuggestions(query),
        getCompaniesSuggestions(query),
        getJobRolesSuggestions(query)
    ]);

    return [...skills, ...locations, ...companies, ...jobRoles].slice(0, 10);
}

// Enhanced helper functions for advanced search
async function getSearchStatistics(searchQuery) {
    try {
        const [
            totalCandidates,
            activeCandidates,
            verifiedCandidates,
            completeProfiles,
            recentCandidates
        ] = await Promise.all([
            UserProfile.countDocuments({}),
            UserProfile.countDocuments({ 'profileStatus.isActive': true }),
            UserProfile.countDocuments({ 'profileStatus.isVerified': true }),
            UserProfile.countDocuments({ 'profileStatus.isComplete': true }),
            UserProfile.countDocuments({
                updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            })
        ]);

        return {
            totalCandidates,
            activeCandidates,
            verifiedCandidates,
            completeProfiles,
            recentCandidates,
            searchTimestamp: new Date()
        };
    } catch (error) {
        console.error('Error getting search statistics:', error);
        return {};
    }
}

function calculateMatchScore(candidate, filters) {
    let score = 0;
    const maxScore = 100;

    // Keyword matching (40 points)
    if (filters.searchKeywords) {
        const keywords = filters.searchKeywords.toLowerCase();
        const searchableText = [
            candidate.personalInfo?.fullName,
            candidate.professional?.currentJobTitle,
            candidate.professional?.currentCompany,
            candidate.professional?.skills?.join(' '),
            candidate.professional?.keySkills?.join(' '),
            candidate.education?.degree,
            candidate.education?.institution
        ].filter(Boolean).join(' ').toLowerCase();

        if (searchableText.includes(keywords)) {
            score += 40;
        }
    }

    // Skills matching (25 points)
    if (filters.keySkills && filters.keySkills.length > 0) {
        const candidateSkills = candidate.professional?.keySkills || [];
        const matchingSkills = filters.keySkills.filter(skill => 
            candidateSkills.some(candidateSkill => 
                candidateSkill.toLowerCase().includes(skill.toLowerCase())
            )
        );
        score += (matchingSkills.length / filters.keySkills.length) * 25;
    }

    // Experience matching (15 points)
    if (filters.minExperience || filters.maxExperience) {
        const candidateExp = candidate.professional?.totalExperience || 0;
        const minExp = parseInt(filters.minExperience) || 0;
        const maxExp = parseInt(filters.maxExperience) || 100;
        
        if (candidateExp >= minExp && candidateExp <= maxExp) {
            score += 15;
        }
    }

    // Location matching (10 points)
    if (filters.currentCity && filters.currentCity.length > 0) {
        const candidateLocation = candidate.personalInfo?.currentCity;
        if (filters.currentCity.includes(candidateLocation)) {
            score += 10;
        }
    }

    // Profile completeness (10 points)
    const completionPercentage = candidate.profileStatus?.completionPercentage || 0;
    score += (completionPercentage / 100) * 10;

    return Math.min(Math.round(score), maxScore);
}

// @route   GET /api/candidates/export
// @desc    Export candidate search results
// @access  Private (Employer/Admin)
router.get('/export', employerAuth, async (req, res) => {
    try {
        const { filters = {}, format = 'csv' } = req.query;
        
        // Build search query
        const searchQuery = buildAdvancedSearchQuery(JSON.parse(filters));
        
        // Get all candidates (no pagination for export)
        const candidates = await UserProfile.find(searchQuery)
            .populate('userId', 'firstName lastName email phone')
            .sort({ updatedAt: -1 })
            .lean();

        if (format === 'csv') {
            // Generate CSV
            const csvData = candidates.map(candidate => ({
                'Name': `${candidate.userId.firstName} ${candidate.userId.lastName}`,
                'Email': candidate.userId.email,
                'Phone': candidate.userId.phone,
                'Current Job Title': candidate.professional?.currentJobTitle || '',
                'Current Company': candidate.professional?.currentCompany || '',
                'Experience': candidate.professional?.experience || '',
                'Location': candidate.personalInfo?.currentCity || '',
                'Skills': candidate.professional?.keySkills?.join(', ') || '',
                'Expected Salary': candidate.preferences?.expectedSalary || '',
                'Profile Completion': `${candidate.profileStatus?.completionPercentage || 0}%`,
                'Last Updated': candidate.updatedAt
            }));

            const csv = convertToCSV(csvData);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=candidates.csv');
            res.send(csv);
        } else {
            res.json({
                success: true,
                candidates: candidates.map(candidate => ({
                    _id: candidate._id,
                    name: `${candidate.userId.firstName} ${candidate.userId.lastName}`,
                    email: candidate.userId.email,
                    phone: candidate.userId.phone,
                    currentJobTitle: candidate.professional?.currentJobTitle,
                    currentCompany: candidate.professional?.currentCompany,
                    experience: candidate.professional?.experience,
                    location: candidate.personalInfo?.currentCity,
                    skills: candidate.professional?.keySkills || [],
                    expectedSalary: candidate.preferences?.expectedSalary,
                    profileCompletion: candidate.profileStatus?.completionPercentage || 0,
                    lastUpdated: candidate.updatedAt
                })),
                total: candidates.length
            });
        }

    } catch (error) {
        console.error('Export candidates error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during export'
        });
    }
});

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header] || '';
                // Escape commas and quotes in CSV
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');
    
    return csvContent;
}

// @route   POST /api/candidates/bulk-actions
// @desc    Perform bulk actions on candidates
// @access  Private (Employer/Admin)
router.post('/bulk-actions', employerAuth, async (req, res) => {
    try {
        const { action, candidateIds, filters } = req.body;
        
        if (!action || !candidateIds || candidateIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Action and candidate IDs are required'
            });
        }

        let result;
        
        switch (action) {
            case 'save':
                // Save candidates to saved list
                result = await saveCandidatesToSavedList(req.user.id, candidateIds);
                break;
            case 'export':
                // Export selected candidates
                result = await exportSelectedCandidates(candidateIds);
                break;
            case 'contact':
                // Prepare contact information
                result = await getCandidatesContactInfo(candidateIds);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action'
                });
        }

        res.json({
            success: true,
            message: `Bulk action '${action}' completed successfully`,
            result
        });

    } catch (error) {
        console.error('Bulk actions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during bulk actions'
        });
    }
});

async function saveCandidatesToSavedList(employerId, candidateIds) {
    // Implementation for saving candidates
    // This would typically involve creating a SavedCandidate model
    return { savedCount: candidateIds.length };
}

async function exportSelectedCandidates(candidateIds) {
    const candidates = await UserProfile.find({ _id: { $in: candidateIds } })
        .populate('userId', 'firstName lastName email phone')
        .lean();
    
    return candidates.map(candidate => ({
        name: `${candidate.userId.firstName} ${candidate.userId.lastName}`,
        email: candidate.userId.email,
        phone: candidate.userId.phone,
        currentJobTitle: candidate.professional?.currentJobTitle,
        currentCompany: candidate.professional?.currentCompany
    }));
}

async function getCandidatesContactInfo(candidateIds) {
    const candidates = await UserProfile.find({ _id: { $in: candidateIds } })
        .populate('userId', 'firstName lastName email phone')
        .select('userId personalInfo.email personalInfo.phone')
        .lean();
    
    return candidates.map(candidate => ({
        id: candidate._id,
        name: `${candidate.userId.firstName} ${candidate.userId.lastName}`,
        email: candidate.userId.email,
        phone: candidate.userId.phone
    }));
}

module.exports = router;
