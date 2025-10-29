const express = require('express');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { limit = 100, category, level } = req.query;
    
    let query = { isActive: true };
    if (category) query.category = category;
    if (level) query.level = level;
    
    const courses = await Course.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: courses.map(course => ({
        id: course._id,
        name: course.name,
        description: course.description,
        duration: course.duration,
        level: course.level,
        category: course.category
      }))
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

// @route   GET /api/courses/search
// @desc    Search courses for autocomplete
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ courses: [] });
    }
    
    const courses = await Course.find({
      isActive: true,
      name: { $regex: q.trim(), $options: 'i' }
    })
    .sort({ name: 1 })
    .limit(parseInt(limit));
    
    res.json({
      success: true,
      courses: courses.map(course => ({
        id: course._id,
        name: course.name,
        duration: course.duration,
        level: course.level,
        category: course.category
      }))
    });
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching courses'
    });
  }
});

// @route   POST /api/courses
// @desc    Add new course
// @access  Private (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, duration, level, category } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Course name is required and must be at least 2 characters'
      });
    }
    
    // Check if course already exists
    const existingCourse = await Course.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course already exists'
      });
    }
    
    const course = new Course({
      name: name.trim(),
      description: description?.trim() || '',
      duration: duration?.trim() || '',
      level: level || 'Certificate',
      category: category || 'Technical',
      createdBy: req.user.id
    });
    
    await course.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: course._id,
        name: course.name,
        description: course.description,
        duration: course.duration,
        level: course.level,
        category: course.category
      },
      message: 'Course added successfully'
    });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding course'
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { name, description, duration, level, category, isActive } = req.body;
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(duration !== undefined && { duration: duration.trim() }),
        ...(level && { level }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: course._id,
        name: course.name,
        description: course.description,
        duration: course.duration,
        level: course.level,
        category: course.category,
        isActive: course.isActive
      },
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course'
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course'
    });
  }
});

// @route   GET /api/courses/categories
// @desc    Get all course categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Technical', 'Management', 'Arts', 'Science', 'Commerce', 
      'Engineering', 'Medical', 'Other'
    ];
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @route   GET /api/courses/levels
// @desc    Get all course levels
// @access  Public
router.get('/levels', async (req, res) => {
  try {
    const levels = [
      'Certificate', 'Diploma', 'Graduate', 'Post Graduate', 
      'Doctorate', 'Other'
    ];
    
    res.json({
      success: true,
      levels
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching levels'
    });
  }
});

module.exports = router;
