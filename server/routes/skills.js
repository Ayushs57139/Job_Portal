const express = require('express');
const Skill = require('../models/Skill');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/skills/search
// @desc    Search skills for autocomplete
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10, category } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ skills: [] });
    }
    
    let skills;
    if (category) {
      skills = await Skill.getSkillsByCategory(category, parseInt(limit));
      // Filter by query within the category
      skills = skills.filter(skill => 
        skill.name.toLowerCase().includes(q.toLowerCase())
      ).slice(0, parseInt(limit));
    } else {
      skills = await Skill.searchSkills(q.trim(), parseInt(limit));
    }
    
    res.json({
      success: true,
      skills: skills.map(skill => ({
        id: skill._id,
        name: skill.name,
        category: skill.category,
        skillType: skill.skillType,
        usageCount: skill.usageCount,
        description: skill.description,
        tags: skill.tags
      }))
    });
  } catch (error) {
    console.error('Error searching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching skills'
    });
  }
});

// @route   POST /api/skills
// @desc    Add new skill
// @access  Private (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { name, category = 'Other', skillType = 'Technical', description = '', tags = [] } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required and must be at least 2 characters'
      });
    }
    
    const skill = await Skill.addOrUpdateSkill(
      name.trim(),
      category,
      skillType,
      req.user.id,
      description.trim(),
      tags
    );
    
    res.status(201).json({
      success: true,
      skill: {
        id: skill._id,
        name: skill.name,
        category: skill.category,
        skillType: skill.skillType,
        usageCount: skill.usageCount,
        description: skill.description,
        tags: skill.tags
      }
    });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding skill'
    });
  }
});

// @route   GET /api/skills/popular
// @desc    Get popular skills
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20, category } = req.query;
    
    let skills;
    if (category) {
      skills = await Skill.getSkillsByCategory(category, parseInt(limit));
    } else {
      skills = await Skill.getPopularSkills(parseInt(limit));
    }
    
    res.json({
      success: true,
      skills: skills.map(skill => ({
        id: skill._id,
        name: skill.name,
        category: skill.category,
        skillType: skill.skillType,
        usageCount: skill.usageCount,
        description: skill.description,
        tags: skill.tags
      }))
    });
  } catch (error) {
    console.error('Error fetching popular skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular skills'
    });
  }
});

// @route   GET /api/skills/categories
// @desc    Get all skill categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Technology', 'Programming', 'Design', 'Marketing', 'Sales', 'Management',
      'Communication', 'Analytics', 'Engineering', 'Healthcare', 'Finance',
      'Operations', 'Customer Service', 'Human Resources', 'Legal', 'Education',
      'Creative', 'Language', 'Soft Skills', 'Hardware', 'Other'
    ];
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @route   GET /api/skills/types
// @desc    Get all skill types
// @access  Public
router.get('/types', async (req, res) => {
  try {
    const skillTypes = [
      'Technical', 'Soft', 'Language', 'Certification', 'Tool', 'Framework'
    ];
    
    res.json({
      success: true,
      skillTypes: skillTypes
    });
  } catch (error) {
    console.error('Error fetching skill types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skill types'
    });
  }
});

// @route   PUT /api/skills/:id/verify
// @desc    Verify a skill (admin only)
// @access  Private (admin)
router.put('/:id/verify', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }
    
    res.json({
      success: true,
      skill: {
        id: skill._id,
        name: skill.name,
        category: skill.category,
        skillType: skill.skillType,
        isVerified: skill.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying skill'
    });
  }
});

// @route   POST /api/skills/:id/usage
// @desc    Update skill usage count
// @access  Private
router.post('/:id/usage', auth, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { 
        $inc: { usageCount: 1 },
        lastUsed: new Date()
      },
      { new: true }
    );
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Usage count updated'
    });
  } catch (error) {
    console.error('Error updating skill usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating skill usage'
    });
  }
});

// @route   GET /api/skills/stats
// @desc    Get skills statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalSkills = await Skill.countDocuments({ isActive: true });
    const verifiedSkills = await Skill.countDocuments({ isActive: true, isVerified: true });
    const categoryStats = await Skill.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalSkills,
        verifiedSkills,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching skills stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skills statistics'
    });
  }
});

module.exports = router;
