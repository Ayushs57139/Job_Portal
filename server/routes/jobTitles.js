const express = require('express');
const JobTitle = require('../models/JobTitle');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/job-titles/search
// @desc    Search job titles for autocomplete
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ jobTitles: [] });
    }
    
    const jobTitles = await JobTitle.searchJobTitles(q.trim(), parseInt(limit));
    
    res.json({
      success: true,
      jobTitles: jobTitles.map(jobTitle => ({
        id: jobTitle._id,
        name: jobTitle.name,
        category: jobTitle.category,
        usageCount: jobTitle.usageCount
      }))
    });
  } catch (error) {
    console.error('Error searching job titles:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching job titles'
    });
  }
});

// @route   POST /api/job-titles
// @desc    Add new job title
// @access  Private (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { name, category = 'Other' } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Job title name is required and must be at least 2 characters'
      });
    }
    
    const jobTitle = await JobTitle.addOrUpdateJobTitle(
      name.trim(),
      category,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      jobTitle: {
        id: jobTitle._id,
        name: jobTitle.name,
        category: jobTitle.category,
        usageCount: jobTitle.usageCount
      }
    });
  } catch (error) {
    console.error('Error adding job title:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding job title'
    });
  }
});

// @route   GET /api/job-titles/popular
// @desc    Get popular job titles
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const jobTitles = await JobTitle.getPopularJobTitles(parseInt(limit));
    
    res.json({
      success: true,
      jobTitles: jobTitles.map(jobTitle => ({
        id: jobTitle._id,
        name: jobTitle.name,
        category: jobTitle.category,
        usageCount: jobTitle.usageCount
      }))
    });
  } catch (error) {
    console.error('Error getting popular job titles:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting popular job titles'
    });
  }
});

// @route   GET /api/job-titles/categories
// @desc    Get job title categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Technical', 'Sales', 'Management', 'Operations', 'Support', 
      'Healthcare', 'Education', 'Finance', 'Marketing', 'HR', 'Other'
    ];
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error getting job title categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting job title categories'
    });
  }
});

module.exports = router;

