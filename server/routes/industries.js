const express = require('express');
const router = express.Router();
const Industry = require('../models/Industry');

// Get all industries with their subcategories
router.get('/', async (req, res) => {
  try {
    const industries = await Industry.getAllIndustries();
    res.json({
      success: true,
      data: industries
    });
  } catch (error) {
    console.error('Error fetching industries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching industries',
      error: error.message
    });
  }
});

// Get subcategories for a specific industry
router.get('/:industryName/subcategories', async (req, res) => {
  try {
    const { industryName } = req.params;
    const subcategories = await Industry.getSubcategories(industryName);
    
    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subcategories',
      error: error.message
    });
  }
});

// Add new industry
router.post('/', async (req, res) => {
  try {
    const { name, subcategories = [] } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Industry name is required and must be at least 2 characters'
      });
    }
    
    const industry = new Industry({
      name: name.trim(),
      subcategories: subcategories.map(sub => sub.trim()).filter(sub => sub)
    });
    
    await industry.save();
    
    res.status(201).json({
      success: true,
      data: industry,
      message: 'Industry added successfully'
    });
  } catch (error) {
    console.error('Error adding industry:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding industry',
      error: error.message
    });
  }
});

// Seed industries (admin only)
router.post('/seed', async (req, res) => {
  try {
    // Import the detailed industries seeding function
    const { createDetailedIndustriesField } = require('../seed-detailed-industries');
    
    // Run the detailed industries seeding
    await createDetailedIndustriesField();
    
    res.json({
      success: true,
      message: 'Detailed industries seeded successfully'
    });
  } catch (error) {
    console.error('Error seeding detailed industries:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding detailed industries',
      error: error.message
    });
  }
});

module.exports = router;
