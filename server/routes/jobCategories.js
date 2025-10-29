const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');

// Import all models
const JobIndustry = require('../models/JobIndustry');
const JobDesignation = require('../models/JobDesignation');
const JobDepartment = require('../models/JobDepartment');
const JobRole = require('../models/JobRole');
const JobKeySkill = require('../models/JobKeySkill');
const Education = require('../models/Education');
const Location = require('../models/Location');
const Course = require('../models/Course');
const Specialization = require('../models/Specialization');
const Sector = require('../models/Sector');

// Model mapping for dynamic operations
const models = {
  'industries': JobIndustry,
  'designations': JobDesignation,
  'departments': JobDepartment,
  'roles': JobRole,
  'skills': JobKeySkill,
  'education': Education,
  'locations': Location,
  'courses': Course,
  'specializations': Specialization,
  'sectors': Sector
};

// Generic CRUD operations for all categories
const createCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const Model = models[category];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const data = { ...req.body, createdBy: req.user.id };
    const item = new Model(data);
    await item.save();

    res.status(201).json({
      message: `${category.slice(0, -1)} created successfully`,
      data: item
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Item already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

const getAllCategories = async (req, res, category) => {
  try {
    const Model = models[category];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const items = await Model.find({ isActive: true })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      message: `${category} retrieved successfully`,
      success: true,
      data: items
    });
  } catch (error) {
    console.error(`Error getting ${category}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { category, id } = req.params;
    const Model = models[category];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const item = await Model.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      message: `${category.slice(0, -1)} retrieved successfully`,
      data: item
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { category, id } = req.params;
    const Model = models[category];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const data = { ...req.body, updatedBy: req.user.id };
    const item = await Model.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      message: `${category.slice(0, -1)} updated successfully`,
      data: item
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Item already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { category, id } = req.params;
    const Model = models[category];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Soft delete by setting isActive to false
    const item = await Model.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: req.user.id },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      message: `${category.slice(0, -1)} deleted successfully`,
      data: item
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bulk operations
const bulkCreateCategories = async (req, res) => {
  try {
    const { category } = req.params;
    const Model = models[category];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    const data = items.map(item => ({
      ...item,
      createdBy: req.user.id
    }));

    const createdItems = await Model.insertMany(data, { ordered: false });
    
    res.status(201).json({
      message: `${createdItems.length} ${category} created successfully`,
      data: createdItems
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Some items already exist' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// Routes for all categories
const categories = ['industries', 'designations', 'departments', 'roles', 'skills', 'education', 'locations', 'courses', 'specializations', 'sectors'];

categories.forEach(category => {
  // Create
  router.post(`/${category}`, adminAuth, createCategory);
  
  // Get all
  router.get(`/${category}`, adminAuth, (req, res) => getAllCategories(req, res, category));
  
  // Get by ID
  router.get(`/${category}/:id`, adminAuth, getCategoryById);
  
  // Update
  router.put(`/${category}/:id`, adminAuth, updateCategory);
  
  // Delete (soft delete)
  router.delete(`/${category}/:id`, adminAuth, deleteCategory);
  
  // Bulk create
  router.post(`/${category}/bulk`, adminAuth, bulkCreateCategories);
});

// Get all categories summary
router.get('/summary', adminAuth, async (req, res) => {
  try {
    const summary = {};
    
    for (const [key, Model] of Object.entries(models)) {
      const count = await Model.countDocuments({ isActive: true });
      summary[key] = count;
    }
    
    res.json({
      message: 'Categories summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test endpoint to check data without authentication (must be after dynamic routes)
router.get('/test-data', async (req, res) => {
  try {
    const summary = {};
    
    for (const [key, Model] of Object.entries(models)) {
      const count = await Model.countDocuments({ isActive: true });
      summary[key] = count;
    }
    
    res.json({
      message: 'Master data summary (test endpoint)',
      data: summary,
      note: 'This is a test endpoint. Use admin authentication for full access.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;